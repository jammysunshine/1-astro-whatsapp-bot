// src/services/whatsapp/messageSender.js
// WhatsApp message sender service

const axios = require('axios');
const logger = require('../../utils/logger');

/**
 * Send text message to WhatsApp user
 * @param {string} phoneNumber - Recipient's phone number in WhatsApp format
 * @param {string} message - Message text to send
 * @param {Object} options - Additional options for message sending
 * @returns {Promise<Object>} WhatsApp API response
 */
const sendTextMessage = async (phoneNumber, message, options = {}) => {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!accessToken || !phoneNumberId) {
      throw new Error('WhatsApp API credentials not configured');
    }

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    // Prepare message payload
    const messagePayload = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: {
        preview_url: options.previewUrl || false,
        body: message
      }
    };

    // Add context if provided (for replying to specific messages)
    if (options.context) {
      messagePayload.context = options.context;
    }

    // Add recipient type if provided
    if (options.recipientType) {
      messagePayload.recipient_type = options.recipientType;
    }

    const response = await axios.post(url, messagePayload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    logger.info(`Message sent successfully to ${phoneNumber}: ${response.data.messages[0].id}`);
    return response.data;

  } catch (error) {
    logger.error(`Error sending message to ${phoneNumber}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Send interactive message with buttons to WhatsApp user
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} body - Main message body
 * @param {Array} buttons - Array of button objects [{type, reply: {id, title}}]
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} WhatsApp API response
 */
const sendInteractiveButtons = async (phoneNumber, body, buttons, options = {}) => {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!accessToken || !phoneNumberId) {
      throw new Error('WhatsApp API credentials not configured');
    }

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    // Prepare interactive message payload
    const messagePayload = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: body
        },
        action: {
          buttons: buttons.slice(0, 3) // WhatsApp allows max 3 buttons
        }
      }
    };

    // Add header if provided
    if (options.header) {
      messagePayload.interactive.header = options.header;
    }

    // Add footer if provided
    if (options.footer) {
      messagePayload.interactive.footer = {
        text: options.footer
      };
    }

    const response = await axios.post(url, messagePayload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    logger.info(`Interactive message sent successfully to ${phoneNumber}: ${response.data.messages[0].id}`);
    return response.data;

  } catch (error) {
    logger.error(`Error sending interactive message to ${phoneNumber}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Send list message to WhatsApp user
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} body - Main message body
 * @param {string} buttonText - Text for the list button
 * @param {Array} sections - List sections
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} WhatsApp API response
 */
const sendListMessage = async (phoneNumber, body, buttonText, sections, options = {}) => {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!accessToken || !phoneNumberId) {
      throw new Error('WhatsApp API credentials not configured');
    }

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    // Prepare list message payload
    const messagePayload = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: {
          type: 'text',
          text: options.headerText || 'Choose an option:'
        },
        body: {
          text: body
        },
        action: {
          button: buttonText,
          sections: sections.slice(0, 10) // WhatsApp allows max 10 sections
        }
      }
    };

    // Add footer if provided
    if (options.footer) {
      messagePayload.interactive.footer = {
        text: options.footer
      };
    }

    const response = await axios.post(url, messagePayload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    logger.info(`List message sent successfully to ${phoneNumber}: ${response.data.messages[0].id}`);
    return response.data;

  } catch (error) {
    logger.error(`Error sending list message to ${phoneNumber}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Send template message to WhatsApp user
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} templateName - Name of the template
 * @param {string} languageCode - Language code for the template
 * @param {Array} components - Template components
 * @returns {Promise<Object>} WhatsApp API response
 */
const sendTemplateMessage = async (phoneNumber, templateName, languageCode = 'en', components = []) => {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!accessToken || !phoneNumberId) {
      throw new Error('WhatsApp API credentials not configured');
    }

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    // Prepare template message payload
    const messagePayload = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode
        },
        components: components
      }
    };

    const response = await axios.post(url, messagePayload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    logger.info(`Template message sent successfully to ${phoneNumber}: ${response.data.messages[0].id}`);
    return response.data;

  } catch (error) {
    logger.error(`Error sending template message to ${phoneNumber}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Send media message to WhatsApp user
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} mediaType - Type of media (image, video, document, audio)
 * @param {string} mediaId - Media ID from previous upload or URL
 * @param {string} caption - Caption for the media
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} WhatsApp API response
 */
const sendMediaMessage = async (phoneNumber, mediaType, mediaId, caption = '', options = {}) => {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!accessToken || !phoneNumberId) {
      throw new Error('WhatsApp API credentials not configured');
    }

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    // Prepare media message payload
    const messagePayload = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: mediaType,
      [mediaType]: {
        id: mediaId,
        caption: caption
      }
    };

    // Add additional media properties if provided
    if (options.filename) {
      messagePayload[mediaType].filename = options.filename;
    }

    const response = await axios.post(url, messagePayload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    logger.info(`${mediaType} message sent successfully to ${phoneNumber}: ${response.data.messages[0].id}`);
    return response.data;

  } catch (error) {
    logger.error(`Error sending ${mediaType} message to ${phoneNumber}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Mark message as read
 * @param {string} messageId - WhatsApp message ID to mark as read
 * @returns {Promise<Object>} WhatsApp API response
 */
const markMessageAsRead = async (messageId) => {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!accessToken || !phoneNumberId) {
      throw new Error('WhatsApp API credentials not configured');
    }

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    const messagePayload = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId
    };

    const response = await axios.post(url, messagePayload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    logger.info(`Message marked as read: ${messageId}`);
    return response.data;

  } catch (error) {
    logger.error(`Error marking message as read ${messageId}:`, error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  sendTextMessage,
  sendInteractiveButtons,
  sendListMessage,
  sendTemplateMessage,
  sendMediaMessage,
  markMessageAsRead
};