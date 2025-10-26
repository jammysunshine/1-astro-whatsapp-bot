// tests/integration/whatsapp/webhookIntegration.test.js
// Integration tests for WhatsApp webhook functionality

const request = require('supertest');
const app = require('../../../src/server');
const {
  processIncomingMessage
} = require('../../../src/services/whatsapp/messageProcessor');
const {
  validateWebhookSignature
} = require('../../../src/services/whatsapp/webhookValidator');
const logger = require('../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../src/services/whatsapp/messageProcessor');
jest.mock('../../../src/services/whatsapp/webhookValidator');
jest.mock('../../../src/utils/logger');

// Get mocked functions
const {
  verifyWebhookChallenge
} = require('../../../src/services/whatsapp/webhookValidator');

describe('WhatsApp Webhook Integration', () => {
  describe('GET /webhook - Verification', () => {
    it('should verify webhook with correct token', async() => {
      verifyWebhookChallenge.mockReturnValue({
        success: true,
        challenge: 'challenge-123'
      });

      const response = await request(app)
        .get('/webhook')
        .query({
          'hub.mode': 'subscribe',
          'hub.verify_token': process.env.W1_WHATSAPP_VERIFY_TOKEN,
          'hub.challenge': 'challenge-123'
        })
        .expect(200);

      expect(response.text).toBe('challenge-123');
    });

    it('should reject webhook verification with wrong token', async() => {
      verifyWebhookChallenge.mockReturnValue({
        success: false,
        message: 'Forbidden'
      });

      const response = await request(app)
        .get('/webhook')
        .query({
          'hub.mode': 'subscribe',
          'hub.verify_token': 'wrong-token',
          'hub.challenge': 'challenge-123'
        })
        .expect(403);

      expect(response.text).toBe('Forbidden');
    });

    it('should return ready status for verification request without parameters', async() => {
      verifyWebhookChallenge.mockReturnValue({
        success: true,
        message: 'Webhook endpoint ready',
        challenge: null
      });

      const response = await request(app).get('/webhook').expect(200);

      expect(response.text).toBe('Webhook endpoint ready');
    });
  });

  describe('POST /webhook - Message Processing', () => {
    beforeEach(() => {
      // Reset mocks
      jest.clearAllMocks();
      processIncomingMessage.mockResolvedValue();
      validateWebhookSignature.mockReturnValue(true);
    });

    it('should process valid webhook with text message', async() => {
      const webhookPayload = {
        entry: [
          {
            id: 'entry-123',
            time: '1234567890',
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '+1234567890',
                    phone_number_id: 'phone-id-123'
                  },
                  contacts: [
                    {
                      profile: { name: 'John Doe' },
                      wa_id: '1234567890'
                    }
                  ],
                  messages: [
                    {
                      from: '1234567890',
                      id: 'message-id-123',
                      timestamp: '1234567890',
                      text: { body: 'Hello, astrologer!' },
                      type: 'text'
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(webhookPayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=test-signature')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Webhook processed successfully',
        timestamp: expect.any(String)
      });

      expect(processIncomingMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '1234567890',
          id: 'message-id-123',
          type: 'text',
          timestamp: '1234567890',
          text: { body: 'Hello, astrologer!' }
        }),
        expect.objectContaining({
          contacts: [
            {
              profile: { name: 'John Doe' },
              wa_id: '1234567890'
            }
          ]
        })
      );
    });

    it('should process valid webhook with interactive message', async() => {
      const webhookPayload = {
        entry: [
          {
            id: 'entry-456',
            time: '1234567891',
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '+1234567890',
                    phone_number_id: 'phone-id-456'
                  },
                  contacts: [
                    {
                      profile: { name: 'Jane Smith' },
                      wa_id: '0987654321'
                    }
                  ],
                  messages: [
                    {
                      from: '0987654321',
                      id: 'message-id-456',
                      timestamp: '1234567891',
                      type: 'interactive',
                      interactive: {
                        type: 'button_reply',
                        button_reply: {
                          id: 'btn_daily_horoscope',
                          title: 'Daily Horoscope'
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(webhookPayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=test-signature')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Webhook processed successfully',
        timestamp: expect.any(String)
      });

      expect(processIncomingMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '0987654321',
          id: 'message-id-456',
          type: 'interactive',
          timestamp: '1234567891',
          interactive: {
            type: 'button_reply',
            button_reply: {
              id: 'btn_daily_horoscope',
              title: 'Daily Horoscope'
            }
          }
        }),
        expect.objectContaining({
          contacts: [
            {
              profile: { name: 'Jane Smith' },
              wa_id: '0987654321'
            }
          ]
        })
      );
    });

    it('should process valid webhook with button message', async() => {
      const webhookPayload = {
        entry: [
          {
            id: 'entry-789',
            time: '1234567892',
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '+1234567890',
                    phone_number_id: 'phone-id-789'
                  },
                  contacts: [
                    {
                      profile: { name: 'Bob Johnson' },
                      wa_id: '1122334455'
                    }
                  ],
                  messages: [
                    {
                      from: '1122334455',
                      id: 'message-id-789',
                      timestamp: '1234567892',
                      type: 'button',
                      button: {
                        payload: 'compatibility_check_payload',
                        text: 'Check Compatibility'
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(webhookPayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=test-signature')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Webhook processed successfully',
        timestamp: expect.any(String)
      });

      expect(processIncomingMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '1122334455',
          id: 'message-id-789',
          type: 'button',
          timestamp: '1234567892',
          button: {
            payload: 'compatibility_check_payload',
            text: 'Check Compatibility'
          }
        }),
        expect.objectContaining({
          contacts: [
            {
              profile: { name: 'Bob Johnson' },
              wa_id: '1122334455'
            }
          ]
        })
      );
    });

    it('should process valid webhook with media message', async() => {
      const webhookPayload = {
        entry: [
          {
            id: 'entry-101',
            time: '1234567893',
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '+1234567890',
                    phone_number_id: 'phone-id-101'
                  },
                  contacts: [
                    {
                      profile: { name: 'Alice Brown' },
                      wa_id: '5566778899'
                    }
                  ],
                  messages: [
                    {
                      from: '5566778899',
                      id: 'message-id-101',
                      timestamp: '1234567893',
                      type: 'image',
                      image: {
                        id: 'image-id-101',
                        caption: 'My birth chart'
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(webhookPayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=test-signature')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Webhook processed successfully',
        timestamp: expect.any(String)
      });

      expect(processIncomingMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '5566778899',
          id: 'message-id-101',
          type: 'image',
          timestamp: '1234567893',
          image: {
            id: 'image-id-101',
            caption: 'My birth chart'
          }
        }),
        expect.objectContaining({
          contacts: [
            {
              profile: { name: 'Alice Brown' },
              wa_id: '5566778899'
            }
          ]
        })
      );
    });

    it('should handle invalid webhook payload gracefully', async() => {
      const response = await request(app)
        .post('/webhook')
        .send({ invalid: 'payload' })
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=test-signature')
        .expect(400);

      expect(response.body).toEqual({
        error: 'Invalid payload'
      });
    });

    it('should handle webhook processing errors gracefully', async() => {
      // Mock processIncomingMessage to throw an error
      processIncomingMessage.mockRejectedValue(new Error('Processing failed'));

      const webhookPayload = {
        entry: [
          {
            id: 'entry-102',
            time: '1234567894',
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '+1234567890',
                    phone_number_id: 'phone-id-102'
                  },
                  contacts: [
                    {
                      profile: { name: 'Charlie Wilson' },
                      wa_id: '9988776655'
                    }
                  ],
                  messages: [
                    {
                      from: '9988776655',
                      id: 'message-id-102',
                      timestamp: '1234567894',
                      text: { body: 'Hello, astrologer!' },
                      type: 'text'
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(webhookPayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=test-signature')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Internal server error',
        message: 'Processing failed'
      });
    });

    it('should validate webhook signature when provided', async() => {
      validateWebhookSignature.mockReturnValue(false);

      const webhookPayload = {
        entry: [
          {
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  messages: [
                    {
                      from: '1234567890',
                      type: 'text',
                      text: { body: 'Hello' }
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(webhookPayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=invalid-signature')
        .expect(401);

      expect(response.body).toEqual({
        error: 'Unauthorized'
      });

      expect(validateWebhookSignature).toHaveBeenCalledWith(
        expect.any(String),
        'sha256=invalid-signature',
        process.env.W1_WHATSAPP_APP_SECRET
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle missing environment variables gracefully', async() => {
      // Temporarily unset environment variables
      const originalAccessToken = process.env.W1_WHATSAPP_ACCESS_TOKEN;
      const originalPhoneNumberId = process.env.W1_WHATSAPP_PHONE_NUMBER_ID;

      delete process.env.W1_WHATSAPP_ACCESS_TOKEN;
      delete process.env.W1_WHATSAPP_PHONE_NUMBER_ID;

      const webhookPayload = {
        entry: [
          {
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  messages: [
                    {
                      from: '1234567890',
                      type: 'text',
                      text: { body: 'Hello' }
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(webhookPayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=test-signature')
        .expect(500);

      // Restore environment variables
      process.env.W1_WHATSAPP_ACCESS_TOKEN = originalAccessToken;
      process.env.W1_WHATSAPP_PHONE_NUMBER_ID = originalPhoneNumberId;

      expect(response.body).toEqual({
        error: 'Internal server error',
        message: expect.any(String)
      });
    });
  });
});
