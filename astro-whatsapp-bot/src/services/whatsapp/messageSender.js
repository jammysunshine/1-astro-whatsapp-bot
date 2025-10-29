const axios = require('axios');
const logger = require('../../utils/logger');
const translationService = require('../i18n/TranslationService');

// WhatsApp Business API configuration
const WHATSAPP_API_URL = 'https://graph.facebook.com/v24.0';

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
    // Handle specific error codes (enhanced for v24.0)
    if (error.response?.status === 400) {
      logger.error(`❌ Bad request for ${phoneNumber}: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Bad request: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 401) {
      logger.error(`🔐 Invalid access token for ${phoneNumber}`);
      throw new Error(`Invalid access token: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 403) {
      logger.error(`🚫 Access denied for ${phoneNumber}: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Access denied: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 429) {
      logger.warn(`⚠️ Rate limit exceeded for ${phoneNumber}: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Rate limit exceeded: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 404) {
      logger.error(`❌ Phone number not registered on WhatsApp: ${phoneNumber}`);
      throw new Error(`Phone number not registered on WhatsApp: ${phoneNumber}`);
    } else if (error.response?.status === 410) {
      logger.warn(`⛔ Message no longer available for ${phoneNumber}`);
      throw new Error(`Message expired: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 413) {
      logger.error(`📏 Media too large for ${phoneNumber}`);
      throw new Error(`Media file too large: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 415) {
      logger.error(`📄 Unsupported media type for ${phoneNumber}`);
      throw new Error(`Unsupported media type: ${error.response?.data?.error?.message || error.message}`);
    }
    
    const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    logger.error(`❌ Error sending message to ${phoneNumber}: ${errorMsg}`);
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
        body: {
          text: finalBodyTextForButton
        },
        action: {
          buttons: buttons.slice(0, 3) // WhatsApp allows max 3 buttons
        }
      }
    };

    // Add header if provided - support different header types
    if (options.header) {
      if (typeof options.header === 'string') {
        // If header is a string, treat as text header
        messagePayload.interactive.header = {
          type: 'text',
          text: options.header
        };
      } else if (typeof options.header === 'object') {
        // If header is an object, use as-is (should have proper structure)
        // Validate header structure
        if (options.header.type) {
          messagePayload.interactive.header = options.header;
        }
      }
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
    // Handle specific error codes (enhanced for v24.0)
    if (error.response?.status === 400) {
      logger.error(`❌ Bad request for ${phoneNumber}: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Bad request: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 401) {
      logger.error(`🔐 Invalid access token for ${phoneNumber}`);
      throw new Error(`Invalid access token: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 403) {
      logger.error(`🚫 Access denied for ${phoneNumber}: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Access denied: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 429) {
      logger.warn(`⚠️ Rate limit exceeded for ${phoneNumber}: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Rate limit exceeded: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 404) {
      logger.error(`❌ Phone number not registered on WhatsApp: ${phoneNumber}`);
      throw new Error(`Phone number not registered on WhatsApp: ${phoneNumber}`);
    } else if (error.response?.status === 410) {
      logger.warn(`⛔ Message no longer available for ${phoneNumber}`);
      throw new Error(`Message expired: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 413) {
      logger.error(`📏 Media too large for ${phoneNumber}`);
      throw new Error(`Media file too large: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 415) {
      logger.error(`📄 Unsupported media type for ${phoneNumber}`);
      throw new Error(`Unsupported media type: ${error.response?.data?.error?.message || error.message}`);
    }

    const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    logger.error(`❌ Error sending interactive message to ${phoneNumber}: ${errorMsg}`);
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
        body: {
          text: body
        },
        action: {
          button: buttonText,
          sections: sections.slice(0, 10) // WhatsApp allows max 10 sections
        }
      }
    };

    // Add header if provided - support different header types
    if (options.header) {
      if (typeof options.header === 'string') {
        // If header is a string, treat as text header
        messagePayload.interactive.header = {
          type: 'text',
          text: options.header
        };
      } else if (typeof options.header === 'object') {
        // If header is an object, use as-is (should have proper structure)
        // Validate header structure
        if (options.header.type) {
          messagePayload.interactive.header = options.header;
        }
      }
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
      `📋 List message sent successfully to ${phoneNumber}: ${response.data.messages[0].id}`
    );
    return response.data;
  } catch (error) {
    // Handle specific error codes (enhanced for v24.0)
    if (error.response?.status === 400) {
      logger.error(`❌ Bad request for ${phoneNumber}: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Bad request: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 401) {
      logger.error(`🔐 Invalid access token for ${phoneNumber}`);
      throw new Error(`Invalid access token: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 403) {
      logger.error(`🚫 Access denied for ${phoneNumber}: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Access denied: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 429) {
      logger.warn(`⚠️ Rate limit exceeded for ${phoneNumber}: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Rate limit exceeded: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 404) {
      logger.error(`❌ Phone number not registered on WhatsApp: ${phoneNumber}`);
      throw new Error(`Phone number not registered on WhatsApp: ${phoneNumber}`);
    } else if (error.response?.status === 410) {
      logger.warn(`⛔ Message no longer available for ${phoneNumber}`);
      throw new Error(`Message expired: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 413) {
      logger.error(`📏 Media too large for ${phoneNumber}`);
      throw new Error(`Media file too large: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 415) {
      logger.error(`📄 Unsupported media type for ${phoneNumber}`);
      throw new Error(`Unsupported media type: ${error.response?.data?.error?.message || error.message}`);
    }

    const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    logger.error(`❌ Error sending list message to ${phoneNumber}: ${errorMsg}`);
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
    // Handle specific error codes (enhanced for v24.0)
    if (error.response?.status === 400) {
      logger.error(`❌ Bad request for ${phoneNumber}: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Bad request: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 401) {
      logger.error(`🔐 Invalid access token for ${phoneNumber}`);
      throw new Error(`Invalid access token: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 403) {
      logger.error(`🚫 Access denied for ${phoneNumber}: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Access denied: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 429) {
      logger.warn(`⚠️ Rate limit exceeded for ${phoneNumber}: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Rate limit exceeded: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 404) {
      logger.error(`❌ Phone number not registered on WhatsApp: ${phoneNumber}`);
      throw new Error(`Phone number not registered on WhatsApp: ${phoneNumber}`);
    } else if (error.response?.status === 410) {
      logger.warn(`⛔ Message no longer available for ${phoneNumber}`);
      throw new Error(`Message expired: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 413) {
      logger.error(`📏 Media too large for ${phoneNumber}`);
      throw new Error(`Media file too large: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 415) {
      logger.error(`📄 Unsupported media type for ${phoneNumber}`);
      throw new Error(`Unsupported media type: ${error.response?.data?.error?.message || error.message}`);
    }

    const errorData = error.response?.data || error.message;
    const truncatedData = typeof errorData === 'string' ? errorData.substring(0, 100) : JSON.stringify(errorData).substring(0, 100);
    logger.error(
      `❌ Error sending template message to ${phoneNumber}:`,
      `${truncatedData}${truncatedData.length >= 100 ? '...' : ''}`
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
    // Handle specific error codes (enhanced for v24.0)
    if (error.response?.status === 400) {
      logger.error(`❌ Bad request for ${phoneNumber}: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Bad request: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 401) {
      logger.error(`🔐 Invalid access token for ${phoneNumber}`);
      throw new Error(`Invalid access token: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 403) {
      logger.error(`🚫 Access denied for ${phoneNumber}: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Access denied: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 429) {
      logger.warn(`⚠️ Rate limit exceeded for ${phoneNumber}: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Rate limit exceeded: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 404) {
      logger.error(`❌ Phone number not registered on WhatsApp: ${phoneNumber}`);
      throw new Error(`Phone number not registered on WhatsApp: ${phoneNumber}`);
    } else if (error.response?.status === 410) {
      logger.warn(`⛔ Message no longer available for ${phoneNumber}`);
      throw new Error(`Message expired: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 413) {
      logger.error(`📏 Media too large for ${phoneNumber}`);
      throw new Error(`Media file too large: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 415) {
      logger.error(`📄 Unsupported media type for ${phoneNumber}`);
      throw new Error(`Unsupported media type: ${error.response?.data?.error?.message || error.message}`);
    }

    const errorData = error.response?.data || error.message;
    const truncatedData = typeof errorData === 'string' ? errorData.substring(0, 100) : JSON.stringify(errorData).substring(0, 100);
    logger.error(
      `❌ Error sending ${mediaType} message to ${phoneNumber}:`,
      `${truncatedData}${truncatedData.length >= 100 ? '...' : ''}`
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
    // Handle specific error codes (enhanced for v24.0)
    if (error.response?.status === 400) {
      logger.error(`❌ Bad request for message ${messageId}: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Bad request: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 401) {
      logger.error(`🔐 Invalid access token for message ${messageId}`);
      throw new Error(`Invalid access token: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 403) {
      logger.error(`🚫 Access denied for message ${messageId}: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Access denied: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 429) {
      logger.warn(`⚠️ Rate limit exceeded for message ${messageId}: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Rate limit exceeded: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 404) {
      logger.error(`❌ Message not found: ${messageId}`);
      throw new Error(`Message not found: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 410) {
      logger.warn(`⛔ Message no longer available: ${messageId}`);
      throw new Error(`Message expired: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 413) {
      logger.error(`📏 Request too large for message ${messageId}`);
      throw new Error(`Request too large: ${error.response?.data?.error?.message || error.message}`);
    } else if (error.response?.status === 415) {
      logger.error(`📄 Unsupported media type for message ${messageId}`);
      throw new Error(`Unsupported media type: ${error.response?.data?.error?.message || error.message}`);
    }

    const errorData = error.response?.data || error.message;
    const truncatedData = typeof errorData === 'string' ? errorData.substring(0, 100) : JSON.stringify(errorData).substring(0, 100);
    logger.error(
      `❌ Error marking message as read ${messageId}:`,
      `${truncatedData}${truncatedData.length >= 100 ? '...' : ''}`
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
  options = {},
  language = 'en'
) => {
  try {
    let response;

    switch (messageType) {
    case 'text':
      // Handle undefined/null messages
      if (message == null) {
        logger.warn(`⚠️ Null/undefined message for ${phoneNumber}, using fallback`);
        message = 'messages.errors.generic_error';
      }

      // Translate message if it's a resource key (contains dots and no spaces)
      let translatedMessage = message;
      if (typeof message === 'string' && message.includes('.') && !message.includes(' ')) {
        translatedMessage = await translationService.translate(message, language, options.parameters || {});
      }
      // Ensure text message body is within WhatsApp API limits (4096 chars)
      let validatedMessage = translatedMessage;
      if (typeof validatedMessage === 'string' && validatedMessage.length > 4096) {
        logger.warn(`⚠️ Text message for ${phoneNumber} exceeds 4096 character limit, truncating`);
        validatedMessage = validatedMessage.substring(0, 4096);
      }
      response = await sendTextMessage(phoneNumber, validatedMessage, options);
      break;
    case 'interactive':
      if (message.type === 'button') {
        // Translate body if it's a resource key
        let translatedBodyText = message.body && message.body.text; // Get the text from message.body.text
        if (typeof translatedBodyText === 'string' && translatedBodyText.includes('.') && !translatedBodyText.includes(' ')) {
          translatedBodyText = await translationService.translate(translatedBodyText, language, options.parameters || {});
        }
        
        // Ensure body text is a string and meets WhatsApp API requirements
        if (typeof translatedBodyText !== 'string') {
          translatedBodyText = String(translatedBodyText || 'Please select an option');
        }
        // WhatsApp list message body has max 1024 characters
        if (translatedBodyText.length > 1024) {
          translatedBodyText = translatedBodyText.substring(0, 1024);
        }
        // Transform buttons to WhatsApp format
        const whatsappButtons = message.buttons.map(button => {
          // Check if button is already in WhatsApp format
          if (button.type === 'reply' && button.reply) {
            return button;
          }
          // Otherwise, transform from simple format
          return {
            type: 'reply',
            reply: { id: button.id, title: button.title }
          };
        });
        let finalBodyTextForButton = translatedBodyText;
        if (typeof translatedBodyText === 'object' && translatedBodyText.text) {
          finalBodyTextForButton = translatedBodyText.text;
        }
        response = await sendInteractiveButtons(
          phoneNumber,
          finalBodyTextForButton,
          whatsappButtons,
          options
        );
      } else if (message.type === 'list') {
        // Translate body if it's a resource key
        let translatedBody = message.body;
        if (typeof message.body === 'object' && message.body.text) {
          if (typeof message.body.text === 'string' && message.body.text.includes('.') && !message.body.text.includes(' ')) {
            translatedBody = { text: await translationService.translate(message.body.text, language, options.parameters || {}) };
          }
        } else if (typeof message.body === 'string' && message.body.text.includes('.') && !message.body.text.includes(' ')) {
          translatedBody = await translationService.translate(message.body, language, options.parameters || {});
        }
        // Ensure body text is a string and meets WhatsApp API requirements
        if (typeof translatedBody === 'object' && translatedBody.text) {
          translatedBody = translatedBody.text;
        }
        if (typeof translatedBody !== 'string') {
          translatedBody = String(translatedBody || 'Please select an option');
        }
        // WhatsApp list message body has max 1024 characters
        if (translatedBody.length > 1024) {
          translatedBody = translatedBody.substring(0, 1024);
        }
        // Ensure sections exist and have proper structure
        const sections = message.sections || [];
        // Use 'button' field from menu config (as seen in menuConfig.json) or fallback to 'buttonText' or default
        let buttonText = message.button || message.buttonText || 'Choose Option';
        // Ensure button text meets WhatsApp API requirements (1-20 characters)
        if (typeof buttonText !== 'string') {
          buttonText = String(buttonText);
        }
        if (buttonText.length < 1) {
          buttonText = 'Choose';
        } else if (buttonText.length > 20) {
          buttonText = buttonText.substring(0, 20);
        }
        
        // Validate sections structure - each section should have a title and rows
        const validatedSections = sections.map(section => {
          // Ensure section has a title (required by WhatsApp API)
          const sectionTitle = section.title && typeof section.title === 'string' && section.title.length <= 24 ? 
            section.title : 'Options';
          
          const validatedRows = (section.rows || []).slice(0, 10).map(row => {
            // Ensure row ID is a valid string with max 256 characters
            let rowId = row.id || `row_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
            if (typeof rowId !== 'string') {
              rowId = String(rowId);
            }
            if (rowId.length > 256) {
              rowId = rowId.substring(0, 256);
            }
            
            // Ensure row title is a valid string with max 24 characters
            let rowTitle = row.title || 'Option';
            if (typeof rowTitle !== 'string') {
              rowTitle = String(rowTitle);
            }
            if (rowTitle.length > 24) {
              rowTitle = rowTitle.substring(0, 24);
            }
            
            // Ensure row description is a valid string with max 72 characters
            let rowDescription = row.description || '';
            if (typeof rowDescription !== 'string') {
              rowDescription = String(rowDescription);
            }
            if (rowDescription.length > 72) {
              rowDescription = rowDescription.substring(0, 72);
            }
            
            return {
              id: rowId,
              title: rowTitle,
              description: rowDescription
            };
          });
          
          return {
            title: sectionTitle,
            rows: validatedRows
          };
        }).filter(section => section.rows.length > 0); // Filter out sections with no rows
        
        // Ensure at least one section with one row exists, otherwise send a simple text message
        if (validatedSections.length === 0) {
          logger.warn(`⚠️ No valid sections found for list message to ${phoneNumber}, sending fallback text`);
          const fallbackMessage = `Menu options:\n${message.sections?.slice(0, 5).map(s => s.rows?.slice(0, 3).map(r => `• ${r.title || r.id}`).join('\n')).filter(Boolean).join('\n') || 'No options available'}`;
          response = await sendTextMessage(phoneNumber, fallbackMessage, options);
          return response;
        }
        
        let finalBodyTextForList = translatedBodyText;
        if (typeof translatedBodyText === 'object' && translatedBodyText.text) {
          finalBodyTextForList = translatedBodyText.text;
        }
        response = await sendListMessage(
          phoneNumber,
          finalBodyTextForList,
          buttonText,
          validatedSections,
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
      // Translate message if it's a resource key (contains dots and no spaces)
      let defaultTranslatedMessage = message;
      if (typeof message === 'string' && message.includes('.') && !message.includes(' ')) {
        defaultTranslatedMessage = await translationService.translate(message, language, options.parameters || {});
      }
      // Ensure text message body is within WhatsApp API limits (4096 chars)
      let validatedDefaultMessage = defaultTranslatedMessage;
      if (typeof validatedDefaultMessage === 'string' && validatedDefaultMessage.length > 4096) {
        logger.warn(`⚠️ Default text message for ${phoneNumber} exceeds 4096 character limit, truncating`);
        validatedDefaultMessage = validatedDefaultMessage.substring(0, 4096);
      }
      response = await sendTextMessage(phoneNumber, validatedDefaultMessage, options);
    }

    // Add null check for response
    if (!response) {
      logger.warn(`⚠️ Null response from sendMessage to ${phoneNumber}`);
      return { success: true, message: 'Message sent successfully' };
    }

    return response;
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    logger.error(`❌ Error in sendMessage wrapper to ${phoneNumber}: ${errorMsg}`);
    
    // In test environment, re-throw the error so mocks can catch it
    if (process.env.NODE_ENV === 'test') {
      logger.warn(`🔧 Test environment: re-throwing error for sendMessage to ${phoneNumber}`);
      throw error;
    }
    
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