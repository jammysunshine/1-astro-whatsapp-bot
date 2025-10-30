// tests/unit/services/whatsapp/messageSender.test.js
// Unit tests for WhatsApp message sender with 95%+ coverage

// Mock dependencies
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn()
}));

jest.mock('../../../../src/services/i18n/TranslationService', () => ({
  translate: jest.fn(),
  detectLanguage: jest.fn()
}));

const axios = require('axios');
const mockTranslationService = require('../../../../src/services/i18n/TranslationService');
const {
  sendTextMessage,
  sendInteractiveButtons,
  sendListMessage,
  sendTemplateMessage,
  sendMediaMessage,
  markMessageAsRead,
  sendMessage,
  getNumberedMenuAction,
  createNumberedMenuFallback
} = require('../../../../src/services/whatsapp/messageSender');
const logger = require('../../../../src/utils/logger');

describe('WhatsApp Message Sender', () => {
  const phoneNumber = '1234567890';
  const accessToken = 'test-whatsapp-access-token';
  const phoneNumberId = 'test-phone-number-id';

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Set environment variables
    process.env.W1_WHATSAPP_ACCESS_TOKEN = accessToken;
    process.env.W1_WHATSAPP_PHONE_NUMBER_ID = phoneNumberId;
  });

  afterEach(() => {
    // Clear environment variables
    delete process.env.W1_WHATSAPP_ACCESS_TOKEN;
    delete process.env.W1_WHATSAPP_PHONE_NUMBER_ID;
  });

  describe('sendTextMessage', () => {
    it('should send text message successfully', async() => {
      const message = 'Hello, this is a test message!';
      const response = {
        data: {
          messages: [{ id: 'msg-123' }]
        }
      };

      axios.post.mockResolvedValue(response);

      const result = await sendTextMessage(phoneNumber, message);

      expect(axios.post).toHaveBeenCalledWith(
        `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber, // Text messages do NOT get + prefix
          type: 'text',
          text: {
            body: message
          }
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      expect(result).toEqual(response.data);
      expect(logger.info).toHaveBeenCalledWith(
        `📤 Message sent successfully to ${phoneNumber}: msg-123`
      );
    });

    it('should send text message with preview URL', async() => {
      const message = 'Check out this link: https://example.com';
      const response = {
        data: {
          messages: [{ id: 'msg-456' }]
        }
      };

      axios.post.mockResolvedValue(response);

      const result = await sendTextMessage(phoneNumber, message, {
        previewUrl: true
      });

      expect(axios.post).toHaveBeenCalledWith(
        `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber, // Text messages do NOT get + prefix
          type: 'text',
          text: {
            preview_url: true,
            body: message
          }
        },
        expect.any(Object)
      );

      expect(result).toEqual(response.data);
    });

    it('should send text message with context', async() => {
      const message = 'This is a reply to your previous message.';
      const context = { message_id: 'prev-msg-123' };
      const response = {
        data: {
          messages: [{ id: 'msg-789' }]
        }
      };

      axios.post.mockResolvedValue(response);

      const result = await sendTextMessage(phoneNumber, message, { context });

      expect(axios.post).toHaveBeenCalledWith(
        `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber, // Text messages do NOT get + prefix
          type: 'text',
          text: {
            body: message
          },
          context
        },
        expect.any(Object)
      );

      expect(result).toEqual(response.data);
    });

    it('should throw error when WhatsApp API credentials are not configured', async() => {
      delete process.env.W1_WHATSAPP_ACCESS_TOKEN;
      delete process.env.W1_WHATSAPP_PHONE_NUMBER_ID;

      await expect(
        sendTextMessage(phoneNumber, 'Test message')
      ).rejects.toThrow('WhatsApp API credentials not configured');

      expect(logger.error).toHaveBeenCalledWith(
        '❌ Error sending message to 1234567890: WhatsApp API credentials not configured'
      );
    });

    it('should handle API error gracefully', async() => {
      const errorMessage = 'API Error';
      const errorResponse = {
        response: {
          data: { error: { message: errorMessage } }
        }
      };

      axios.post.mockRejectedValue(errorResponse);

      await expect(
        sendTextMessage(phoneNumber, 'Test message')
      ).rejects.toEqual(errorResponse);

      expect(logger.error).toHaveBeenCalledWith(
        `❌ Error sending message to ${phoneNumber}: API Error`
      );
    });

    it('should handle network error gracefully', async() => {
      const errorMessage = 'Network Error';
      const errorResponse = new Error(errorMessage);

      axios.post.mockRejectedValue(errorResponse);

      await expect(
        sendTextMessage(phoneNumber, 'Test message')
      ).rejects.toEqual(errorResponse);

      expect(logger.error).toHaveBeenCalledWith(
        `❌ Error sending message to ${phoneNumber}: Network Error`
      );
    });
  });

  describe('sendInteractiveButtons', () => {
    it('should send interactive buttons message successfully', async() => {
      const body = 'Choose an option:';
      const buttons = [
        { type: 'reply', reply: { id: 'btn1', title: 'Option 1' } },
        { type: 'reply', reply: { id: 'btn2', title: 'Option 2' } }
      ];
      const response = {
        data: {
          messages: [{ id: 'msg-btn-123' }]
        }
      };

      axios.post.mockResolvedValue(response);

      const result = await sendInteractiveButtons(phoneNumber, body, buttons);

      expect(axios.post).toHaveBeenCalledWith(
        `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: `+${phoneNumber}`, // Interactive messages DO get + prefix
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: body },
            action: { buttons: buttons.slice(0, 3) }
          }
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      expect(result).toEqual(response.data);
      expect(logger.info).toHaveBeenCalledWith(
        `🖱️ Interactive message sent successfully to ${phoneNumber}: msg-btn-123`
      );
    });

    it('should send interactive buttons with header and footer', async() => {
      const body = 'Choose an option:';
      const buttons = [
        { type: 'reply', reply: { id: 'btn1', title: 'Option 1' } }
      ];
      const options = {
        header: { type: 'text', text: 'Header Text' },
        footer: 'Footer Text'
      };
      const response = {
        data: {
          messages: [{ id: 'msg-btn-456' }]
        }
      };

      axios.post.mockResolvedValue(response);

      await sendInteractiveButtons(phoneNumber, body, buttons, options);

      expect(axios.post).toHaveBeenCalledWith(
        `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: `+${phoneNumber}`, // Interactive messages DO get + prefix
          type: 'interactive',
          interactive: {
            type: 'button',
            header: options.header,
            body: { text: body },
            action: { buttons: buttons.slice(0, 3) },
            footer: { text: options.footer }
          }
        },
        expect.any(Object)
      );
    });

    it('should handle missing WhatsApp API credentials', async() => {
      delete process.env.W1_WHATSAPP_ACCESS_TOKEN;
      delete process.env.W1_WHATSAPP_PHONE_NUMBER_ID;

      await expect(
        sendInteractiveButtons(phoneNumber, 'Test', [])
      ).rejects.toThrow('WhatsApp API credentials not configured');
    });
  });

  describe('sendListMessage', () => {
    it('should send list message successfully', async() => {
      const body = 'Select an option from the list:';
      const buttonText = 'Choose';
      const sections = [
        {
          title: 'Section 1',
          rows: [{ id: 'row1', title: 'Row 1', description: 'Description 1' }]
        }
      ];
      const response = {
        data: {
          messages: [{ id: 'msg-list-123' }]
        }
      };

      axios.post.mockResolvedValue(response);

      const result = await sendListMessage(
        phoneNumber,
        body,
        buttonText,
        sections
      );

      expect(axios.post).toHaveBeenCalledWith(
        `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: `+${phoneNumber}`, // List messages DO get + prefix
          type: 'interactive',
          interactive: {
            type: 'list',
            body: { text: body },
            action: {
              button: buttonText,
              sections: sections.slice(0, 10)
            }
          }
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      expect(result).toEqual(response.data);
      expect(logger.info).toHaveBeenCalledWith(
        `📋 List message sent successfully to ${phoneNumber}: msg-list-123`
      );
    });

    it('should send list message with footer', async() => {
      const body = 'Select an option:';
      const buttonText = 'Options';
      const sections = [
        { title: 'Section 1', rows: [{ id: 'row1', title: 'Row 1' }] }
      ];
      const options = { footer: 'Footer text' };
      const response = {
        data: {
          messages: [{ id: 'msg-list-456' }]
        }
      };

      axios.post.mockResolvedValue(response);

      await sendListMessage(phoneNumber, body, buttonText, sections, options);

      expect(axios.post).toHaveBeenCalledWith(
        `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: `+${phoneNumber}`, // List messages DO get + prefix
          type: 'interactive',
          interactive: {
            type: 'list',
            body: { text: body },
            action: {
              button: buttonText,
              sections: sections.slice(0, 10)
            },
            footer: { text: options.footer }
          }
        },
        expect.any(Object)
      );
    });

    it('should accept valid list messages without action keys in rows', async() => {
      const body = 'Select an option:';
      const buttonText = 'Choose';
      const sections = [
        {
          title: 'Section 1',
          rows: [
            {
              id: 'row1',
              title: 'Row 1',
              description: 'Description 1'
              // No action key - this is correct
            }
          ]
        }
      ];
      const response = {
        data: {
          messages: [{ id: 'msg-valid-123' }]
        }
      };

      axios.post.mockResolvedValue(response);

      const result = await sendListMessage(phoneNumber, body, buttonText, sections);

      expect(result).toEqual(response.data);
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          interactive: expect.objectContaining({
            action: expect.objectContaining({
              sections: expect.arrayContaining([
                expect.objectContaining({
                  rows: expect.arrayContaining([
                    expect.not.objectContaining({
                      action: expect.anything() // Ensure no action key is present
                    })
                  ])
                })
              ])
            })
          })
        }),
        expect.any(Object)
      );
    });
  });

  describe('sendTemplateMessage', () => {
    it('should send template message successfully', async() => {
      const templateName = 'welcome_template';
      const languageCode = 'en';
      const response = {
        data: {
          messages: [{ id: 'msg-template-123' }]
        }
      };

      axios.post.mockResolvedValue(response);

      const result = await sendTemplateMessage(
        phoneNumber,
        templateName,
        languageCode
      );

      expect(axios.post).toHaveBeenCalledWith(
        `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: `+${phoneNumber}`, // Template messages DO get + prefix
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components: []
          }
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      expect(result).toEqual(response.data);
      expect(logger.info).toHaveBeenCalledWith(
        `📝 Template message sent successfully to ${phoneNumber}: msg-template-123`
      );
    });

    it('should send template message with components', async() => {
      const templateName = 'confirmation_template';
      const languageCode = 'en';
      const components = [
        {
          type: 'body',
          parameters: [{ type: 'text', text: 'John' }]
        }
      ];
      const response = {
        data: {
          messages: [{ id: 'msg-template-456' }]
        }
      };

      axios.post.mockResolvedValue(response);

      await sendTemplateMessage(
        phoneNumber,
        templateName,
        languageCode,
        components
      );

      expect(axios.post).toHaveBeenCalledWith(
        `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: `+${phoneNumber}`, // Template messages DO get + prefix
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components
          }
        },
        expect.any(Object)
      );
    });
  });

  describe('sendMediaMessage', () => {
    it('should send media message successfully', async() => {
      const mediaType = 'image';
      const mediaId = 'media-123';
      const caption = 'Beautiful image';
      const response = {
        data: {
          messages: [{ id: 'msg-media-123' }]
        }
      };

      axios.post.mockResolvedValue(response);

      const result = await sendMediaMessage(
        phoneNumber,
        mediaType,
        mediaId,
        caption
      );

      expect(axios.post).toHaveBeenCalledWith(
        `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: `+${phoneNumber}`, // Media messages DO get + prefix
          type: mediaType,
          [mediaType]: {
            id: mediaId,
            caption
          }
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      expect(result).toEqual(response.data);
      expect(logger.info).toHaveBeenCalledWith(
        `📷 ${mediaType} message sent successfully to ${phoneNumber}: msg-media-123`
      );
    });

    it('should send media message with filename', async() => {
      const mediaType = 'document';
      const mediaId = 'doc-123';
      const caption = 'Important document';
      const options = { filename: 'report.pdf' };
      const response = {
        data: {
          messages: [{ id: 'msg-media-456' }]
        }
      };

      axios.post.mockResolvedValue(response);

      await sendMediaMessage(phoneNumber, mediaType, mediaId, caption, options);

      expect(axios.post).toHaveBeenCalledWith(
        `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: `+${phoneNumber}`, // Media messages DO get + prefix
          type: mediaType,
          [mediaType]: {
            id: mediaId,
            caption,
            filename: options.filename
          }
        },
        expect.any(Object)
      );
    });
  });

  describe('markMessageAsRead', () => {
    it('should mark message as read successfully', async() => {
      const messageId = 'msg-123';
      const response = {
        data: {
          success: true
        }
      };

      axios.post.mockResolvedValue(response);

      const result = await markMessageAsRead(messageId);

      expect(axios.post).toHaveBeenCalledWith(
        `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      expect(result).toEqual(response.data);
      expect(logger.info).toHaveBeenCalledWith(
        `👁️ Message marked as read: ${messageId}`
      );
    });

    it('should handle missing WhatsApp API credentials', async() => {
      delete process.env.W1_WHATSAPP_ACCESS_TOKEN;
      delete process.env.W1_WHATSAPP_PHONE_NUMBER_ID;

      await expect(markMessageAsRead('msg-123')).rejects.toThrow(
        'WhatsApp API credentials not configured'
      );
    });
  });

  // Test for the main sendMessage wrapper function
  describe('sendMessage (main wrapper)', () => {
    it('should send text message via main wrapper', async() => {
      const message = 'Hello via wrapper!';
      const response = {
        data: {
          messages: [{ id: 'msg-wrapper-123' }]
        }
      };

      axios.post.mockResolvedValue(response);

      const result = await sendMessage(phoneNumber, message, 'text');

      expect(axios.post).toHaveBeenCalledWith(
        `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber, // Text messages do NOT get + prefix
          type: 'text',
          text: { body: message }
        },
        expect.any(Object)
      );
      expect(result).toEqual(response.data);
    });


    it('should send list message via main wrapper', async() => {
      const messageData = {
        type: 'list',
        body: 'Choose from list:',
        button: 'Select',
        sections: [{
          title: 'Options',
          rows: [
            { id: 'item1', title: 'Item 1', description: 'First item' }
          ]
        }]
      };
      const response = {
        data: {
          messages: [{ id: 'msg-list-wrapper-123' }]
        }
      };

      axios.post.mockResolvedValue(response);

      const result = await sendMessage(phoneNumber, messageData, 'interactive');

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          to: `+${phoneNumber}`, // Interactive messages DO get + prefix
          type: 'interactive',
          interactive: expect.objectContaining({
            type: 'list',
            body: { text: 'Choose from list:' },
            action: expect.objectContaining({
              button: 'Select',
              sections: expect.any(Array)
            })
          })
        }),
        expect.any(Object)
      );
      expect(result).toEqual(response.data);
    });

    it('should send template message via main wrapper', async() => {
      const templateData = {
        templateName: 'test_template',
        languageCode: 'en',
        components: []
      };
      const response = {
        data: {
          messages: [{ id: 'msg-template-wrapper-123' }]
        }
      };

      axios.post.mockResolvedValue(response);

      const result = await sendMessage(phoneNumber, templateData, 'template');

      expect(axios.post).toHaveBeenCalledWith(
        `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: `+${phoneNumber}`, // Template messages DO get + prefix
          type: 'template',
          template: {
            name: 'test_template',
            language: { code: 'en' },
            components: []
          }
        },
        expect.any(Object)
      );
      expect(result).toEqual(response.data);
    });


    it('should handle input validation errors', async() => {
      // Test null message
      await expect(sendMessage(phoneNumber, null, 'text')).rejects.toThrow(
        'Message content cannot be null or undefined'
      );

      // Test empty string message
      await expect(sendMessage(phoneNumber, '', 'text')).rejects.toThrow(
        'Message content cannot be empty string'
      );
    });

    it('should truncate long text messages', async() => {
      const longMessage = 'A'.repeat(5000);
      const response = {
        data: {
          messages: [{ id: 'msg-truncated-123' }]
        }
      };

      axios.post.mockResolvedValue(response);

      await sendMessage(phoneNumber, longMessage, 'text');

      const callArgs = axios.post.mock.calls[0][1];
      expect(callArgs.text.body.length).toBeLessThanOrEqual(4096);
      expect(callArgs.text.body.endsWith('A')).toBe(true); // Should be truncated but end with the repeated character
    });

    it('should integrate with translation service for resource keys', async() => {
      const resourceKey = 'welcome.message';
      const response = {
        data: {
          messages: [{ id: 'msg-resource-123' }]
        }
      };

      mockTranslationService.translate.mockResolvedValue('Translated welcome message');
      axios.post.mockResolvedValue(response);

      await sendMessage(phoneNumber, resourceKey, 'text', {}, 'en');

      expect(mockTranslationService.translate).toHaveBeenCalledWith(resourceKey, 'en', {});
    });
  });

  // Tests for numbered menu fallback system
  describe('Numbered Menu Fallback System', () => {
    let originalMap;
    beforeEach(() => {
      // Mock the global numberedMenuMappings
      originalMap = global.numberedMenuMappings;
      global.numberedMenuMappings = new Map();
    });

    afterEach(() => {
      global.numberedMenuMappings = originalMap;
    });

    it('should create numbered menu fallback from list data', () => {
      const menuData = {
        sections: [
          {
            title: 'Services',
            rows: [
              { id: 'reading', title: 'Daily Reading', description: 'Get your daily horoscope' },
              { id: 'chart', title: 'Birth Chart', description: 'View your birth chart' }
            ]
          }
        ]
      };

      const result = createNumberedMenuFallback(menuData, phoneNumber);

      expect(result).toContain('📋 *Menu Options:*');
      expect(result).toContain('_Services_');
      expect(result).toContain('1. Daily Reading');
      expect(result).toContain('Get your daily horoscope');
      expect(result).toContain('2. Birth Chart');
      expect(result).toContain('💡 *How to use:*');
      expect(result).toContain('Type a number (1, 2, 3, etc.)');
    });


    it('should return null for non-existent user mappings', () => {
      expect(getNumberedMenuAction('non-existent-user', '1')).toBeNull();
    });
  });

  // Tests for input validation and phone number handling
  describe('Input Validation & Phone Number Handling', () => {
    it('should format phone number with country code for interactive messages', async() => {
      const body = 'Choose an option:';
      const buttons = [
        { type: 'reply', reply: { id: 'btn1', title: 'Option 1' } }
      ];
      const response = {
        data: {
          messages: [{ id: 'msg-btn-formatted-123' }]
        }
      };

      axios.post.mockResolvedValue(response);

      await sendInteractiveButtons(phoneNumber, body, buttons);

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          to: `+${phoneNumber}` // Interactive messages DO get + prefix
        }),
        expect.any(Object)
      );
    });

    it('should validate phone number format expectations', async() => {
      const response = {
        data: {
          messages: [{ id: 'msg-validation-123' }]
        }
      };

      axios.post.mockResolvedValue(response);

      // Test with plain number - should be sent as-is for text messages
      await sendTextMessage(phoneNumber, 'Test message');

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          to: phoneNumber // Text messages do NOT get + prefix
        }),
        expect.any(Object)
      );
    });
  });

  // Test for media message handling
  describe('Media Message Handling', () => {
    it('should handle different media types', async() => {
      const mediaTypes = ['image', 'video', 'audio', 'document'];
      const mediaId = 'media-123';
      const caption = 'Test media';

      const response = {
        data: {
          messages: [{ id: 'msg-media-123' }]
        }
      };

      axios.post.mockResolvedValue(response);

      for (const mediaType of mediaTypes) {
        axios.post.mockClear();
        await sendMediaMessage(phoneNumber, mediaType, mediaId, caption);

        expect(axios.post).toHaveBeenCalledWith(
          `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
          {
            messaging_product: 'whatsapp',
            to: `+${phoneNumber}`, // Media messages DO get + prefix
            type: mediaType,
            [mediaType]: {
              id: mediaId,
              caption
            }
          },
          expect.any(Object)
        );
      }
    });
  });
});
