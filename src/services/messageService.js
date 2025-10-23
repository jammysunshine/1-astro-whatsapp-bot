const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Send message to WhatsApp user
 * @param {string} phoneNumber - Recipient's phone number in WhatsApp format (e.g., 1234567890)
 * @param {string} message - Message text to send
 * @param {string} messageType - Type of message (text, image, etc.)
 * @returns {Promise<Object>} WhatsApp API response
 */
const sendWhatsAppMessage = async (phoneNumber, message, messageType = 'text') => {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!accessToken || !phoneNumberId) {
      throw new Error('WhatsApp API credentials not configured');
    }

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    let messagePayload;

    if (messageType === 'text') {
      messagePayload = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      };
    } else if (messageType === 'interactive') {
      messagePayload = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'interactive',
        interactive: message // For buttons, lists, etc.
      };
    } else {
      // Default to text if unknown type
      messagePayload = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      };
    }

    const response = await axios.post(url, messagePayload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    logger.info(`Message sent successfully to ${phoneNumber}: ${response.data.messages[0].id}`);
    return response.data;

  } catch (error) {
    logger.error(`Error sending message to ${phoneNumber}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Send interactive message with buttons
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} body - Main message body
 * @param {Array} buttons - Array of button objects [{id, title}]
 */
const sendInteractiveButtons = async (phoneNumber, body, buttons) => {
  const interactivePayload = {
    type: 'button',
    body: {
      text: body
    },
    action: {
      buttons: buttons.map((btn, index) => ({
        type: 'reply',
        reply: {
          id: btn.id || `btn_${index}`,
          title: btn.title
        }
      }))
    }
  };

  return await sendWhatsAppMessage(phoneNumber, interactivePayload, 'interactive');
};

/**
 * Send list message
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} body - Main message body
 * @param {string} buttonText - Text for the list button
 * @param {Array} sections - List sections
 */
const sendListMessage = async (phoneNumber, body, buttonText, sections) => {
  const interactivePayload = {
    type: 'list',
    header: {
      type: 'text',
      text: 'Choose an option:'
    },
    body: {
      text: body
    },
    action: {
      button: buttonText,
      sections: sections
    }
  };

  return await sendWhatsAppMessage(phoneNumber, interactivePayload, 'interactive');
};

module.exports = {
  sendWhatsAppMessage,
  sendInteractiveButtons,
  sendListMessage
};