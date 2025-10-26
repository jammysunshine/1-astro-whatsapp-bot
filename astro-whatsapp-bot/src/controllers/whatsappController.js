const logger = require('../utils/logger');
const {
  processIncomingMessage,
} = require('../services/whatsapp/messageProcessor');
const {
  validateWebhookSignature,
  verifyWebhookChallenge,
} = require('../services/whatsapp/webhookValidator');

/**
 * Process a message with retry logic
 * @param {Object} message - WhatsApp message object
 * @param {Object} value - WhatsApp webhook value object
 * @param {number} maxRetries - Maximum number of retries
 */
const processMessageWithRetry = async (message, value, maxRetries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await processIncomingMessage(message, value);
      return; // Success, exit retry loop
    } catch (error) {
      lastError = error;
      logger.warn(
        `⚠️ Message processing failed (attempt ${attempt}/${maxRetries}):`,
        error.message
      );

      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  logger.error('❌ Message processing failed after all retries:', lastError);
  // Could send error notification to admin here
  throw lastError; // Re-throw the error to be handled by the controller
};

/**
 * Handle incoming WhatsApp webhook events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleWhatsAppWebhook = async (req, res) => {
  try {
    // Handle request aborted errors gracefully
    req.on('aborted', () => {
      logger.warn('⚠️ Request aborted by client');
      if (!res.headersSent) {
        res.status(200).json({ status: 'ok', message: 'Request aborted' });
      }
    });

    // Check if request was already aborted
    if (req.aborted) {
      logger.warn('⚠️ Request was already aborted');
      return res.status(200).json({ status: 'ok', message: 'Request aborted' });
    }

    const { body, headers, rawBody } = req;

    // Check required environment variables
    if (
      !process.env.W1_WHATSAPP_ACCESS_TOKEN ||
      !process.env.W1_WHATSAPP_PHONE_NUMBER_ID
    ) {
      logger.error('❌ Missing required WhatsApp environment variables');
      return res.status(500).json({
        error: 'Internal server error',
        message: 'WhatsApp configuration missing',
      });
    }

    // Validate webhook signature (required for security in production)
    const signature = headers['x-hub-signature-256'];
    const secret = process.env.W1_WHATSAPP_APP_SECRET;

    // Skip signature validation in development if explicitly disabled
    const skipSignatureValidation =
      process.env.W1_SKIP_WEBHOOK_SIGNATURE === 'true' ||
      process.env.NODE_ENV === 'development';

    if (!skipSignatureValidation) {
      if (!signature) {
        logger.warn('⚠️ Missing webhook signature');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const isValid = validateWebhookSignature(
        rawBody || JSON.stringify(body),
        signature,
        secret
      );
      if (!isValid) {
        logger.warn('⚠️ Invalid webhook signature');
        return res.status(401).json({ error: 'Unauthorized' });
      }
    } else {
      logger.info('🔓 Webhook signature validation skipped (development mode)');
    }

    // Log incoming webhook for debugging
    logger.info('📥 Incoming WhatsApp webhook:', {
      timestamp: new Date().toISOString(),
      body: JSON.stringify(body),
    });

    // Validate webhook payload
    if (!body) {
      logger.warn('⚠️ Invalid webhook payload received');
      return res.status(400).json({ error: 'Invalid payload' });
    }

    if (Object.keys(body).length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'Webhook endpoint ready',
      });
    }

    if (!body.entry) {
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

      // Process messages with retry logic
      if (value.messages) {
        for (const message of value.messages) {
          await processMessageWithRetry(message, value);
        }
      }

      // Process contacts
      if (value.contacts) {
        for (const contact of value.contacts) {
          logger.info(
            `👤 Contact update: ${contact.profile.name} (${contact.wa_id})`
          );
        }
      }

      // Process statuses
      if (value.statuses) {
        for (const status of value.statuses) {
          logger.info(
            `📊 Message status: ${status.status} for message ${status.id}`
          );
        }
      }
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ Error in handleWhatsAppWebhook:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Verify WhatsApp webhook challenge for initial setup
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyWhatsAppWebhook = (req, res) => {
  try {
    const VERIFY_TOKEN = process.env.W1_WHATSAPP_VERIFY_TOKEN;
    const result = verifyWebhookChallenge(req.query, VERIFY_TOKEN);

    if (result.success) {
      if (result.challenge) {
        return res.status(200).send(result.challenge);
      } else {
        return res.status(200).send(result.message);
      }
    } else {
      return res.status(403).send(result.message);
    }
  } catch (error) {
    logger.error('❌ Error in verifyWhatsAppWebhook:', error);
    res.status(500).send('Internal server error');
  }
};

module.exports = {
  handleWhatsAppWebhook,
  verifyWhatsAppWebhook,
};
