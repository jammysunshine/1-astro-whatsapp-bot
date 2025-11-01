const crypto = require('crypto');
const logger = require('../../utils/logger');

/**
 * Validate WhatsApp webhook signature for security
 * @param {string} payload - Raw webhook payload
 * @param {string} signature - Signature from x-hub-signature-256 header
 * @param {string} secret - App secret token
 * @returns {boolean} True if signature is valid
 */
const validateWebhookSignature = (payload, signature, secret) => {
  try {
    if (!payload || !signature || !secret) {
      logger.warn(
        '⚠️ Missing required parameters for webhook signature validation'
      );
      return false;
    }

    // Create expected signature
    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex')}`;

    // Compare signatures using timingSafeEqual to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== signatureBuffer.length) {
      logger.warn('⚠️ Signature length mismatch');
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (error) {
    logger.error('❌ Error validating webhook signature:', error);
    return false;
  }
};

/**
 * Verify WhatsApp webhook challenge for initial setup
 * @param {Object} queryParams - Query parameters from webhook verification request
 * @param {string} verifyToken - Expected verification token
 * @returns {Object} Verification result with challenge or error
 */
const verifyWebhookChallenge = (queryParams, verifyToken) => {
  try {
    const {
      'hub.mode': mode,
      'hub.verify_token': token,
      'hub.challenge': challenge
    } = queryParams;

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        logger.info('✅ Webhook verified successfully');
        return {
          success: true,
          challenge,
          message: 'Webhook verified successfully'
        };
      } else {
        logger.warn('⚠️ Webhook verification failed');
        return {
          success: false,
          error: 'Verification failed',
          message: 'Forbidden'
        };
      }
    } else {
      return {
        success: true,
        message: 'Webhook endpoint ready',
        challenge: null
      };
    }
  } catch (error) {
    logger.error('❌ Error verifying webhook challenge:', error);
    return {
      success: false,
      error: 'Internal server error',
      message: error.message
    };
  }
};

/**
 * Validate WhatsApp message format
 * @param {Object} message - WhatsApp message object
 * @returns {boolean} True if message format is valid
 */
const validateMessageFormat = message => {
  try {
    if (!message) {
      logger.warn('⚠️ Message is null or undefined');
      return false;
    }

    // Check required fields
    if (!message.from || !message.id || !message.timestamp) {
      logger.warn('⚠️ Message missing required fields: from, id, or timestamp');
      return false;
    }

    // Check message type
    if (!message.type) {
      logger.warn('⚠️ Message missing type field');
      return false;
    }

    // Validate specific message types
    switch (message.type) {
    case 'text':
      if (!message.text || typeof message.text.body !== 'string') {
        logger.warn('⚠️ Text message missing body or invalid format');
        return false;
      }
      break;

    case 'interactive':
      if (!message.interactive || !message.interactive.type) {
        logger.warn(
          '⚠️ Interactive message missing interactive field or type'
        );
        return false;
      }
      break;

    case 'button':
      if (!message.button || typeof message.button.payload !== 'string') {
        logger.warn(
          '⚠️ Button message missing button field or invalid payload'
        );
        return false;
      }
      break;

    case 'image':
    case 'video':
    case 'audio':
    case 'document':
    case 'sticker':
      if (!message[message.type] || !message[message.type].id) {
        logger.warn(
          `⚠️ ${message.type} message missing ${message.type} field or id`
        );
        return false;
      }
      break;

    default:
      logger.warn(`⚠️ Unsupported message type: ${message.type}`);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('❌ Error validating message format:', error);
    return false;
  }
};

/**
 * Validate WhatsApp webhook payload structure
 * @param {Object} payload - Webhook payload
 * @returns {boolean} True if payload structure is valid
 */
const validateWebhookPayload = payload => {
  try {
    if (!payload || !payload.entry) {
      logger.warn('⚠️ Invalid webhook payload: missing entry array');
      return false;
    }

    if (!Array.isArray(payload.entry)) {
      logger.warn('⚠️ Invalid webhook payload: entry is not an array');
      return false;
    }

    // Validate each entry
    for (const entry of payload.entry) {
      if (!entry.id || !entry.time || !entry.changes) {
        logger.warn('⚠️ Invalid entry: missing id, time, or changes');
        return false;
      }

      if (!Array.isArray(entry.changes)) {
        logger.warn('⚠️ Invalid entry: changes is not an array');
        return false;
      }

      // Validate each change
      for (const change of entry.changes) {
        if (!change.field || !change.value) {
          logger.warn('⚠️ Invalid change: missing field or value');
          return false;
        }

        const { value } = change;

        // Validate value structure
        if (
          !value.messaging_product ||
          value.messaging_product !== 'whatsapp'
        ) {
          logger.warn(
            '⚠️ Invalid value: missing or incorrect messaging_product'
          );
          return false;
        }

        // Validate messages array if present
        if (value.messages && !Array.isArray(value.messages)) {
          logger.warn('⚠️ Invalid value: messages is not an array');
          return false;
        }
    
        // Validate contacts array if present
        if (value.contacts && !Array.isArray(value.contacts)) {
          logger.warn('⚠️ Invalid value: contacts is not an array');
          return false;
        }
    
        // Validate statuses array if present
        if (value.statuses && !Array.isArray(value.statuses)) {
          logger.warn('⚠️ Invalid value: statuses is not an array');
          return false;
        }
    
        // Validate metadata if present
        if (value.metadata && typeof value.metadata !== 'object') {
          logger.warn('⚠️ Invalid value: metadata is not an object');
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    logger.error('❌ Error validating webhook payload:', error);
    return false;
  }
};

module.exports = {
  validateWebhookSignature,
  verifyWebhookChallenge,
  validateMessageFormat,
  validateWebhookPayload
};
