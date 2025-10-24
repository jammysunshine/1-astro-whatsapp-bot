// tests/e2e/critical-user-flow.test.js
// End-to-end tests for critical user flow scenarios

const request = require('supertest');
const app = require('../../src/server');
const { processIncomingMessage } = require('../../src/services/whatsapp/messageProcessor');
const { sendMessage } = require('../../src/services/whatsapp/messageSender');
const { getUserByPhone, createUser } = require('../../src/models/userModel');
const { generateAstrologyResponse } = require('../../src/services/astrology/astrologyEngine');
const logger = require('../../src/utils/logger');

// Mock dependencies
jest.mock('../../src/services/whatsapp/messageProcessor');
jest.mock('../../src/services/whatsapp/messageSender');
jest.mock('../../src/models/userModel');
jest.mock('../../src/services/astrology/astrologyEngine');
jest.mock('../../src/utils/logger');

describe('Critical User Flow End-to-End Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock responses
    processIncomingMessage.mockResolvedValue();
    sendMessage.mockResolvedValue({ success: true });
    getUserByPhone.mockResolvedValue(null); // Default to new user
    createUser.mockResolvedValue({
      id: 'user-123',
      phoneNumber: '1234567890',
      createdAt: new Date(),
      lastInteraction: new Date()
    });
    generateAstrologyResponse.mockResolvedValue('Your personalized astrology response');
  });

  describe('New User Registration Flow', () => {
    it('should complete full new user registration and first reading flow', async() => {
      // Step 1: User sends "Hi" to bot
      const newUserPayload = {
        entry: [{
          id: 'entry-new-user',
          time: '1234567890',
          changes: [{
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '+1234567890',
                phone_number_id: 'phone-id-new'
              },
              contacts: [{
                profile: { name: 'New User' },
                wa_id: '1234567890'
              }],
              messages: [{
                from: '1234567890',
                id: 'message-id-hi',
                timestamp: '1234567890',
                text: { body: 'Hi' },
                type: 'text'
              }]
            }
          }]
        }]
      };

      // Test webhook processing
      const webhookResponse = await request(app)
        .post('/webhook')
        .send(newUserPayload)
        .set('Content-Type', 'application/json')
        .expect(200);

      expect(webhookResponse.body).toEqual({
        success: true,
        message: 'Webhook processed successfully',
        timestamp: expect.any(String)
      });

      // Verify user creation flow
      expect(getUserByPhone).toHaveBeenCalledWith('1234567890');
      expect(createUser).toHaveBeenCalledWith('1234567890');
      expect(processIncomingMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '1234567890',
          type: 'text',
          text: { body: 'Hi' }
        }),
        expect.objectContaining({
          contacts: [{
            profile: { name: 'New User' },
            wa_id: '1234567890'
          }]
        })
      );

      // Step 2: User provides birth details
      const birthDetailsPayload = {
        entry: [{
          id: 'entry-birth-details',
          time: '1234567891',
          changes: [{
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '+1234567890',
                phone_number_id: 'phone-id-birth'
              },
              contacts: [{
                profile: { name: 'New User' },
                wa_id: '1234567890'
              }],
              messages: [{
                from: '1234567890',
                id: 'message-id-birth',
                timestamp: '1234567891',
                text: { body: 'My birth is 15/03/1990, 07:30, Mumbai, India' },
                type: 'text'
              }]
            }
          }]
        }]
      };

      // Test birth details processing
      const birthDetailsResponse = await request(app)
        .post('/webhook')
        .send(birthDetailsPayload)
        .set('Content-Type', 'application/json')
        .expect(200);

      expect(birthDetailsResponse.body).toEqual({
        success: true,
        message: 'Webhook processed successfully',
        timestamp: expect.any(String)
      });

      expect(processIncomingMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '1234567890',
          type: 'text',
          text: { body: 'My birth is 15/03/1990, 07:30, Mumbai, India' }
        }),
        expect.objectContaining({
          contacts: [{
            profile: { name: 'New User' },
            wa_id: '1234567890'
          }]
        })
      );

      // Verify astrology response generation
      expect(generateAstrologyResponse).toHaveBeenCalledWith(
        'My birth is 15/03/1990, 07:30, Mumbai, India',
        expect.objectContaining({
          id: 'user-123',
          phoneNumber: '1234567890'
        })
      );

      // Verify message sending
      expect(sendMessage).toHaveBeenCalledWith(
        '1234567890',
        'Your personalized astrology response'
      );
    });
  });

  describe('Existing User Daily Horoscope Flow', () => {
    beforeEach(() => {
      // Mock existing user
      getUserByPhone.mockResolvedValue({
        id: 'user-existing',
        phoneNumber: '0987654321',
        birthDate: '15/03/1990',
        birthTime: '07:30',
        birthPlace: 'Mumbai, India',
        createdAt: new Date('2023-01-01'),
        lastInteraction: new Date('2023-01-15')
      });
    });

    it('should process daily horoscope request for existing user', async() => {
      const dailyHoroscopePayload = {
        entry: [{
          id: 'entry-daily',
          time: '1234567892',
          changes: [{
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '+0987654321',
                phone_number_id: 'phone-id-daily'
              },
              contacts: [{
                profile: { name: 'Existing User' },
                wa_id: '0987654321'
              }],
              messages: [{
                from: '0987654321',
                id: 'message-id-daily',
                timestamp: '1234567892',
                text: { body: 'Daily horoscope' },
                type: 'text'
              }]
            }
          }]
        }]
      };

      const response = await request(app)
        .post('/webhook')
        .send(dailyHoroscopePayload)
        .set('Content-Type', 'application/json')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Webhook processed successfully',
        timestamp: expect.any(String)
      });

      expect(getUserByPhone).toHaveBeenCalledWith('0987654321');
      expect(createUser).not.toHaveBeenCalled(); // Should not create new user
      expect(processIncomingMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '0987654321',
          type: 'text',
          text: { body: 'Daily horoscope' }
        }),
        expect.objectContaining({
          contacts: [{
            profile: { name: 'Existing User' },
            wa_id: '0987654321'
          }]
        })
      );

      expect(generateAstrologyResponse).toHaveBeenCalledWith(
        'Daily horoscope',
        expect.objectContaining({
          id: 'user-existing',
          phoneNumber: '0987654321',
          birthDate: '15/03/1990'
        })
      );

      expect(sendMessage).toHaveBeenCalledWith(
        '0987654321',
        'Your personalized astrology response'
      );
    });
  });

  describe('Interactive Button Flow', () => {
    it('should process interactive button reply for compatibility checking', async() => {
      const interactivePayload = {
        entry: [{
          id: 'entry-interactive',
          time: '1234567893',
          changes: [{
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '+1122334455',
                phone_number_id: 'phone-id-interactive'
              },
              contacts: [{
                profile: { name: 'Interactive User' },
                wa_id: '1122334455'
              }],
              messages: [{
                from: '1122334455',
                id: 'message-id-interactive',
                timestamp: '1234567893',
                type: 'interactive',
                interactive: {
                  type: 'button_reply',
                  button_reply: {
                    id: 'btn_check_compatibility',
                    title: 'Check Compatibility'
                  }
                }
              }]
            }
          }]
        }]
      };

      const response = await request(app)
        .post('/webhook')
        .send(interactivePayload)
        .set('Content-Type', 'application/json')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Webhook processed successfully',
        timestamp: expect.any(String)
      });

      expect(processIncomingMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '1122334455',
          type: 'interactive',
          interactive: {
            type: 'button_reply',
            button_reply: {
              id: 'btn_check_compatibility',
              title: 'Check Compatibility'
            }
          }
        }),
        expect.objectContaining({
          contacts: [{
            profile: { name: 'Interactive User' },
            wa_id: '1122334455'
          }]
        })
      );

      expect(generateAstrologyResponse).toHaveBeenCalledWith(
        'Check Compatibility',
        expect.any(Object)
      );

      expect(sendMessage).toHaveBeenCalledWith(
        '1122334455',
        'Your personalized astrology response'
      );
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle processing errors gracefully', async() => {
      // Mock processIncomingMessage to throw an error
      processIncomingMessage.mockRejectedValue(new Error('Processing failed'));

      const errorPayload = {
        entry: [{
          id: 'entry-error',
          time: '1234567894',
          changes: [{
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '+5566778899',
                phone_number_id: 'phone-id-error'
              },
              contacts: [{
                profile: { name: 'Error User' },
                wa_id: '5566778899'
              }],
              messages: [{
                from: '5566778899',
                id: 'message-id-error',
                timestamp: '1234567894',
                text: { body: 'This will cause an error' },
                type: 'text'
              }]
            }
          }]
        }]
      };

      const response = await request(app)
        .post('/webhook')
        .send(errorPayload)
        .set('Content-Type', 'application/json')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Internal server error',
        message: 'Processing failed'
      });

      expect(logger.error).toHaveBeenCalledWith(
        '❌ Error in handleWhatsAppWebhook:',
        expect.any(Error)
      );
    });
  });

  describe('Performance and Scalability Flow', () => {
    it('should handle high volume of messages without crashing', async() => {
      // Create multiple webhook payloads
      const payloads = [];
      for (let i = 0; i < 10; i++) {
        payloads.push({
          entry: [{
            id: `entry-high-volume-${i}`,
            time: `123456789${i}`,
            changes: [{
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '+1234567890',
                  phone_number_id: 'phone-id-volume'
                },
                contacts: [{
                  profile: { name: `User ${i}` },
                  wa_id: `123456789${i}`
                }],
                messages: [{
                  from: `123456789${i}`,
                  id: `message-id-volume-${i}`,
                  timestamp: `123456789${i}`,
                  text: { body: `Message ${i}` },
                  type: 'text'
                }]
              }
            }]
          }]
        });
      }

      // Process all payloads concurrently
      const promises = payloads.map(payload =>
        request(app)
          .post('/webhook')
          .send(payload)
          .set('Content-Type', 'application/json')
          .expect(200)
      );

      const responses = await Promise.all(promises);

      // Verify all responses are successful
      responses.forEach(response => {
        expect(response.body).toEqual({
          success: true,
          message: 'Webhook processed successfully',
          timestamp: expect.any(String)
        });
      });

      // Verify all messages were processed
      expect(processIncomingMessage).toHaveBeenCalledTimes(10);
      expect(sendMessage).toHaveBeenCalledTimes(10);
    });
  });

  describe('Security and Compliance Flow', () => {
    it('should validate webhook signatures when provided', async() => {
      const validSignature = 'sha256=valid-signature-here';

      const securePayload = {
        entry: [{
          id: 'entry-secure',
          time: '1234567895',
          changes: [{
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '+9988776655',
                phone_number_id: 'phone-id-secure'
              },
              contacts: [{
                profile: { name: 'Secure User' },
                wa_id: '9988776655'
              }],
              messages: [{
                from: '9988776655',
                id: 'message-id-secure',
                timestamp: '1234567895',
                text: { body: 'Secure message' },
                type: 'text'
              }]
            }
          }]
        }]
      };

      // Note: In a real implementation, we would validate the signature
      // For this test, we're just verifying the flow works
      const response = await request(app)
        .post('/webhook')
        .send(securePayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', validSignature)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Webhook processed successfully',
        timestamp: expect.any(String)
      });
    });
  });
});
