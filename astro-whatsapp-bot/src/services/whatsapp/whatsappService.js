// src/services/whatsapp/whatsappService.js
// WhatsApp service for handling message processing and astrology responses

const logger = require('../../utils/logger');
const { processUserMessage } = require('./messageProcessor');
const { validateWebhookSignature } = require('./webhookValidator');
const { sendTextMessage, sendInteractiveMessage } = require('./messageSender');

/**
 * Handle incoming WhatsApp webhook events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleWhatsAppWebhook = async(req, res) => {
  try {
    const { body } = req;

    // Validate webhook payload
    if (!body || !body.entry) {
      logger.warn('Invalid webhook payload received');
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Process each entry in the webhook
    for (const entry of body.entry) {
      if (!entry.changes || !entry.changes[0]) {
        continue;
      }

      const change = entry.changes[0];
      const { value } = change;

      // Process messages
      if (value.messages) {
        for (const message of value.messages) {
          await processMessage(message, value);
        }
      }

      // Process contacts
      if (value.contacts) {
        for (const contact of value.contacts) {
          logger.info(`Contact update: ${contact.profile.name} (${contact.wa_id})`);
        }
      }

      // Process statuses
      if (value.statuses) {
        for (const status of value.statuses) {
          logger.info(`Message status: ${status.status} for message ${status.id}`);
        }
      }
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in handleWhatsAppWebhook:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Process individual message
 * @param {Object} message - WhatsApp message object
 * @param {Object} value - Webhook value containing context
 */
const processMessage = async(message, value) => {
  try {
    const { from, id, type, timestamp } = message;
    const phoneNumber = from; // WhatsApp ID is the phone number

    logger.info(`Processing message from ${phoneNumber}: ${JSON.stringify(message)}`);

    // Only process text messages for now
    if (type === 'text') {
      const { body: messageBody } = message.text;
      await processUserMessage(phoneNumber, messageBody, id, timestamp);
    }
    // Process interactive messages (quick replies, buttons, etc.)
    else if (type === 'interactive') {
      const { type: interactiveType } = message.interactive;

      if (interactiveType === 'button_reply') {
        const { id: buttonId, title } = message.interactive.button_reply;
        await processUserMessage(phoneNumber, title, id, timestamp);
      } else if (interactiveType === 'list_reply') {
        const { id: listId, title, description } = message.interactive.list_reply;
        await processUserMessage(phoneNumber, title, id, timestamp);
      }
    }
    // Process other message types as needed
    else if (type === 'button') {
      const { payload } = message.button;
      await processUserMessage(phoneNumber, payload, id, timestamp);
    }

    logger.info(`Message from ${phoneNumber} processed successfully`);
  } catch (error) {
    logger.error('Error processing message:', error);
  }
};

module.exports = {
  handleWhatsAppWebhook
};
