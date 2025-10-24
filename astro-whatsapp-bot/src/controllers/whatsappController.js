const logger = require('../utils/logger');
const { processIncomingMessage } = require('../services/whatsapp/messageProcessor');
const { validateWebhookSignature, verifyWebhookChallenge } = require('../services/whatsapp/webhookValidator');

/**
 * Handle incoming WhatsApp webhook events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleWhatsAppWebhook = async(req, res) => {
  try {
    const { body } = req;

    // Log incoming webhook for debugging
    logger.info('📥 Incoming WhatsApp webhook:', {
      timestamp: new Date().toISOString(),
      body: JSON.stringify(body)
    });

    // Validate webhook payload
    if (!body || !body.entry) {
      logger.warn('⚠️ Invalid webhook payload received');
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
          await processIncomingMessage(message, value);
        }
      }

      // Process contacts
      if (value.contacts) {
        for (const contact of value.contacts) {
          logger.info(`👤 Contact update: ${contact.profile.name} (${contact.wa_id})`);
        }
      }

      // Process statuses
      if (value.statuses) {
        for (const status of value.statuses) {
          logger.info(`📊 Message status: ${status.status} for message ${status.id}`);
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
    logger.error('❌ Error in handleWhatsAppWebhook:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Verify WhatsApp webhook challenge for initial setup
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyWhatsAppWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.W1_WHATSAPP_VERIFY_TOKEN;
  const result = verifyWebhookChallenge(req.query, VERIFY_TOKEN);

  if (result.success) {
    if (result.challenge) {
      return res.status(200).send(result.challenge);
    } else {
      return res.status(200).json({ success: true, message: result.message });
    }
  } else {
    return res.status(403).json({ success: false, error: result.error, message: result.message });
  }
};

module.exports = {
  handleWhatsAppWebhook,
  verifyWhatsAppWebhook
};
