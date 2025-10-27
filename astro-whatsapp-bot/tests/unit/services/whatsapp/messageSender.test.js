// tests/unit/services/whatsapp/messageSender.test.js
// Unit tests for WhatsApp message sender with 95%+ coverage

// Mock dependencies
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn()
}));

const axios = require('axios');
const {
  sendTextMessage,
  sendInteractiveButtons,
  sendListMessage,
  sendTemplateMessage,
  sendMediaMessage,
  markMessageAsRead
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
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: {
            preview_url: false,
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
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
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
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: {
            preview_url: false,
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
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
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
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
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
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
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
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        expect.objectContaining({
          interactive: expect.objectContaining({
            footer: { text: options.footer }
          })
        }),
        expect.any(Object)
      );
    });

    it('should handle list messages with invalid action keys in rows (would cause API error)', async() => {
      const body = 'Select an option:';
      const buttonText = 'Choose';
      const sections = [
        {
          title: 'Section 1',
          rows: [
            {
              id: 'row1',
              title: 'Row 1',
              description: 'Description 1',
              action: 'invalid_action' // This should not be present per WhatsApp API
            }
          ]
        }
      ];

      // Mock API rejection due to invalid payload
      const apiError = {
        response: {
          data: {
            error: {
              code: 100,
              message: 'Unexpected key "action" on param "interactive[\'action\'][\'sections\'][0][\'rows\'][0]"',
              type: 'OAuthException'
            }
          },
          status: 400
        },
        message: 'Request failed with status code 400'
      };

      axios.post.mockRejectedValueOnce(apiError);

      await expect(sendListMessage(phoneNumber, body, buttonText, sections))
        .rejects
        .toHaveProperty('message', 'Request failed with status code 400');

      // Verify the invalid payload structure was sent
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          interactive: expect.objectContaining({
            action: expect.objectContaining({
              sections: expect.arrayContaining([
                expect.objectContaining({
                  rows: expect.arrayContaining([
                    expect.objectContaining({
                      id: 'row1',
                      title: 'Row 1',
                      description: 'Description 1',
                      action: 'invalid_action' // This invalid key causes the API error
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
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
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
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
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
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
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
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
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
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
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
});
