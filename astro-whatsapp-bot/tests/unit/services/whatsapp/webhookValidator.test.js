// tests/unit/services/whatsapp/webhookValidator.test.js
// Unit tests for Webhook Validator

const webhookValidator = require('../../../src/services/whatsapp/webhookValidator');

describe('WebhookValidator', () => {
  describe('validateWebhookSignature', () => {
    it('should validate correct signature', () => {
      const payload = 'test payload';
      const signature = 'sha256=valid-signature';
      const secret = 'test-secret';

      const result = webhookValidator.validateWebhookSignature(payload, signature, secret);

      expect(result).toBe(true);
    });

    it('should reject invalid signature', () => {
      const payload = 'test payload';
      const signature = 'sha256=invalid-signature';
      const secret = 'test-secret';

      const result = webhookValidator.validateWebhookSignature(payload, signature, secret);

      expect(result).toBe(false);
    });
  });

  describe('validateWebhookPayload', () => {
    it('should validate valid payload', () => {
      const payload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: '123',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '1234567890',
                    phone_number_id: '1234567890'
                  },
                  contacts: [
                    {
                      profile: {
                        name: 'Test User'
                      },
                      wa_id: '1234567890'
                    }
                  ],
                  messages: [
                    {
                      from: '1234567890',
                      id: 'message-id',
                      timestamp: '1234567890',
                      text: {
                        body: 'Hello'
                      },
                      type: 'text'
                    }
                  ]
                },
                field: 'messages'
              }
            ]
          }
        ]
      };

      const result = webhookValidator.validateWebhookPayload(payload);

      expect(result).toBe(true);
    });

    it('should reject invalid payload', () => {
      const payload = {
        object: 'invalid'
      };

      const result = webhookValidator.validateWebhookPayload(payload);

      expect(result).toBe(false);
    });
  });
});
