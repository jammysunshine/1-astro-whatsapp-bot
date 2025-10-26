const axios = require('axios');
const logger = require('../../utils/logger');

// WhatsApp Business API configuration
const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

/**
 * Get WhatsApp credentials from environment
 * @returns {Object} credentials
 */
const getWhatsAppCredentials = () => {
  // Reconstruct token from two parts to bypass Render's env var size limit
  const tokenPart1 = process.env.W1_WHATSAPP_ACCESS_TOKEN_PART1;
  const tokenPart2 = process.env.W1_WHATSAPP_ACCESS_TOKEN_PART2;
  const accessToken = tokenPart1 && tokenPart2 ? tokenPart1 + tokenPart2 : process.env.W1_WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.W1_WHATSAPP_PHONE_NUMBER_ID;
  logger.debug(`WhatsApp Access Token (masked): ${accessToken ? `${accessToken.substring(0, 5)}...${accessToken.substring(accessToken.length - 5)}` : 'Not Set'}`);
  logger.debug(`WhatsApp Token Length: ${accessToken ? accessToken.length : 0}`);
  logger.debug(`WhatsApp Phone Number ID: ${phoneNumberId || 'Not Set'}`);
  return { accessToken, phoneNumberId };
};

/**
 * Send text message to WhatsApp user
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} message - Message text to send
 * @param {Object} options - Additional options for message sending
 * @returns {Promise<Object>} WhatsApp API response
 */
const sendTextMessage = async(phoneNumber, message, options = {}) => {
  try {
    const {
      accessToken: WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: WHATSAPP_PHONE_NUMBER_ID
    } = getWhatsAppCredentials();
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error('WhatsApp API credentials not configured');
    }

    const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

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
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    logger.info(
      `📤 Message sent successfully to ${phoneNumber}: ${response.data.messages[0].id}`
    );
    return response.data;
  } catch (error) {
    logger.error(
      `❌ Error sending message to ${phoneNumber}:`,
      error.response?.data || error.message
    );
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
const sendInteractiveButtons = async(
  phoneNumber,
  body,
  buttons,
  options = {}
) => {
  try {
    const {
      accessToken: WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: WHATSAPP_PHONE_NUMBER_ID
    } = getWhatsAppCredentials();
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error('WhatsApp API credentials not configured');
    }

    const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

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
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    logger.info(
      `🖱️ Interactive message sent successfully to ${phoneNumber}: ${response.data.messages[0].id}`
    );
    return response.data;
  } catch (error) {
    logger.error(
      `❌ Error sending interactive message to ${phoneNumber}:`,
      error.response?.data || error.message
    );
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
const sendListMessage = async(
  phoneNumber,
  body,
  buttonText,
  sections,
  options = {}
) => {
  try {
    const {
      accessToken: WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: WHATSAPP_PHONE_NUMBER_ID
    } = getWhatsAppCredentials();
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error('WhatsApp API credentials not configured');
    }

    const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

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
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    logger.info(
      `📋 List message sent successfully to ${phoneNumber}: ${response.data.messages[0].id}`
    );
    return response.data;
  } catch (error) {
    logger.error(
      `❌ Error sending list message to ${phoneNumber}:`,
      error.response?.data || error.message
    );
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
const sendTemplateMessage = async(
  phoneNumber,
  templateName,
  languageCode = 'en',
  components = []
) => {
  try {
    const {
      accessToken: WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: WHATSAPP_PHONE_NUMBER_ID
    } = getWhatsAppCredentials();
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error('WhatsApp API credentials not configured');
    }

    const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

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
        components
      }
    };

    const response = await axios.post(url, messagePayload, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    logger.info(
      `📝 Template message sent successfully to ${phoneNumber}: ${response.data.messages[0].id}`
    );
    return response.data;
  } catch (error) {
    logger.error(
      `❌ Error sending template message to ${phoneNumber}:`,
      error.response?.data || error.message
    );
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
const sendMediaMessage = async(
  phoneNumber,
  mediaType,
  mediaId,
  caption = '',
  options = {}
) => {
  try {
    const {
      accessToken: WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: WHATSAPP_PHONE_NUMBER_ID
    } = getWhatsAppCredentials();
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error('WhatsApp API credentials not configured');
    }

    const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    // Prepare media message payload
    const messagePayload = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: mediaType,
      [mediaType]: {
        id: mediaId,
        caption
      }
    };

    // Add additional media properties if provided
    if (options.filename) {
      messagePayload[mediaType].filename = options.filename;
    }

    const response = await axios.post(url, messagePayload, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    logger.info(
      `📷 ${mediaType} message sent successfully to ${phoneNumber}: ${response.data.messages[0].id}`
    );
    return response.data;
  } catch (error) {
    logger.error(
      `❌ Error sending ${mediaType} message to ${phoneNumber}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Mark message as read
 * @param {string} messageId - WhatsApp message ID to mark as read
 * @returns {Promise<Object>} WhatsApp API response
 */
const markMessageAsRead = async messageId => {
  try {
    const {
      accessToken: WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: WHATSAPP_PHONE_NUMBER_ID
    } = getWhatsAppCredentials();
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error('WhatsApp API credentials not configured');
    }

    const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const messagePayload = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId
    };

    const response = await axios.post(url, messagePayload, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    logger.info(`👁️ Message marked as read: ${messageId}`);
    return response.data;
  } catch (error) {
    logger.error(
      `❌ Error marking message as read ${messageId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Send message wrapper that handles different message types
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string|Object} message - Message content (string for text, object for interactive/template)
 * @param {string} messageType - Type of message (text, interactive, template, media)
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} WhatsApp API response
 */
const sendMessage = async(
  phoneNumber,
  message,
  messageType = 'text',
  options = {}
) => {
  try {
    let response;

    switch (messageType) {
    case 'text':
      response = await sendTextMessage(phoneNumber, message, options);
      break;
    case 'interactive':
      if (message.type === 'button') {
        response = await sendInteractiveButtons(
          phoneNumber,
          message.body,
          message.buttons,
          options
        );
      } else if (message.type === 'list') {
        response = await sendListMessage(
          phoneNumber,
          message.body,
          message.buttonText,
          message.sections,
          options
        );
      }
      break;
    case 'template':
      response = await sendTemplateMessage(
        phoneNumber,
        message.templateName,
        message.languageCode,
        message.components
      );
      break;
    case 'media':
      response = await sendMediaMessage(
        phoneNumber,
        message.mediaType,
        message.mediaId,
        message.caption,
        options
      );
      break;
    default:
      response = await sendTextMessage(phoneNumber, message, options);
    }

    return response;
  } catch (error) {
    logger.error(
      `❌ Error in sendMessage wrapper to ${phoneNumber}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = {
  sendTextMessage,
  sendInteractiveButtons,
  sendListMessage,
  sendTemplateMessage,
  sendMediaMessage,
  markMessageAsRead,
  sendMessage
};
