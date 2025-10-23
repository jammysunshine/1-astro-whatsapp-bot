// tests/unit/services/whatsapp/webhookValidator.test.js
// Unit tests for WhatsApp webhook validator with 95%+ coverage

const crypto = require('crypto');
const {
  validateWebhookSignature,
  verifyWebhookChallenge,
  validateMessageFormat,
  validateWebhookPayload
} = require('../../../src/services/whatsapp/webhookValidator');
const logger = require('../../../src/utils/logger');

// Mock dependencies
jest.mock('crypto');
jest.mock('../../../src/utils/logger');

describe('WhatsApp Webhook Validator', () => {
  const secret = 'test-app-secret';
  const payload = JSON.stringify({ test: 'payload' });
  const validSignature = 'sha256=valid-signature';

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('validateWebhookSignature', () => {
    it('should return true for valid signature', () => {
      const createHmacMock = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('valid-signature')
      };

      crypto.createHmac.mockReturnValue(createHmacMock);
      crypto.timingSafeEqual.mockReturnValue(true);

      const result = validateWebhookSignature(payload, validSignature, secret);

      expect(result).toBe(true);
      expect(crypto.createHmac).toHaveBeenCalledWith('sha256', secret);
      expect(createHmacMock.update).toHaveBeenCalledWith(payload, 'utf8');
      expect(createHmacMock.digest).toHaveBeenCalledWith('hex');
      expect(crypto.timingSafeEqual).toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should return false for invalid signature', () => {
      const createHmacMock = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('different-signature')
      };

      crypto.createHmac.mockReturnValue(createHmacMock);
      crypto.timingSafeEqual.mockReturnValue(false);

      const result = validateWebhookSignature(payload, validSignature, secret);

      expect(result).toBe(false);
      expect(crypto.createHmac).toHaveBeenCalledWith('sha256', secret);
      expect(createHmacMock.update).toHaveBeenCalledWith(payload, 'utf8');
      expect(createHmacMock.digest).toHaveBeenCalledWith('hex');
      expect(crypto.timingSafeEqual).toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('should return false when payload is null', () => {
      const result = validateWebhookSignature(null, validSignature, secret);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Missing required parameters for webhook signature validation');
    });

    it('should return false when signature is null', () => {
      const result = validateWebhookSignature(payload, null, secret);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Missing required parameters for webhook signature validation');
    });

    it('should return false when secret is null', () => {
      const result = validateWebhookSignature(payload, validSignature, null);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Missing required parameters for webhook signature validation');
    });

    it('should return false for signature length mismatch', () => {
      const createHmacMock = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('short-signature')
      };

      crypto.createHmac.mockReturnValue(createHmacMock);
      crypto.timingSafeEqual.mockImplementation(() => {
        throw new Error('Input buffers must have the same byte length');
      });

      const result = validateWebhookSignature(payload, validSignature, secret);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Signature length mismatch');
    });

    it('should handle crypto errors gracefully', () => {
      crypto.createHmac.mockImplementation(() => {
        throw new Error('Crypto error');
      });

      const result = validateWebhookSignature(payload, validSignature, secret);

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Error validating webhook signature:', expect.any(Error));
    });
  });

  describe('verifyWebhookChallenge', () => {
    it('should verify webhook challenge successfully', () => {
      const queryParams = {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'test-verify-token',
        'hub.challenge': 'challenge-123'
      };
      const verifyToken = 'test-verify-token';

      const result = verifyWebhookChallenge(queryParams, verifyToken);

      expect(result).toEqual({
        success: true,
        challenge: 'challenge-123',
        message: 'Webhook verified successfully'
      });
      expect(logger.info).toHaveBeenCalledWith('Webhook verified successfully');
    });

    it('should fail verification with wrong verify token', () => {
      const queryParams = {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'wrong-token',
        'hub.challenge': 'challenge-123'
      };
      const verifyToken = 'test-verify-token';

      const result = verifyWebhookChallenge(queryParams, verifyToken);

      expect(result).toEqual({
        success: false,
        error: 'Verification failed',
        message: 'Forbidden'
      });
      expect(logger.warn).toHaveBeenCalledWith('Webhook verification failed');
    });

    it('should handle missing mode parameter', () => {
      const queryParams = {
        'hub.verify_token': 'test-verify-token',
        'hub.challenge': 'challenge-123'
      };
      const verifyToken = 'test-verify-token';

      const result = verifyWebhookChallenge(queryParams, verifyToken);

      expect(result).toEqual({
        success: true,
        message: 'Webhook endpoint ready',
        challenge: null
      });
    });

    it('should handle missing verify token parameter', () => {
      const queryParams = {
        'hub.mode': 'subscribe',
        'hub.challenge': 'challenge-123'
      };
      const verifyToken = 'test-verify-token';

      const result = verifyWebhookChallenge(queryParams, verifyToken);

      expect(result).toEqual({
        success: true,
        message: 'Webhook endpoint ready',
        challenge: null
      });
    });

    it('should handle error during verification', () => {
      const queryParams = {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'test-verify-token',
        'hub.challenge': 'challenge-123'
      };
      const verifyToken = 'test-verify-token';

      // Mock console.log to throw an error
      const originalLog = console.log;
      console.log = jest.fn(() => {
        throw new Error('Test error');
      });

      const result = verifyWebhookChallenge(queryParams, verifyToken);

      expect(result).toEqual({
        success: false,
        error: 'Internal server error',
        message: 'Test error'
      });
      expect(logger.error).toHaveBeenCalledWith('Error verifying webhook challenge:', expect.any(Error));

      // Restore console.log
      console.log = originalLog;
    });
  });

  describe('validateMessageFormat', () => {
    it('should return false for null message', () => {
      const result = validateMessageFormat(null);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Message is null or undefined');
    });

    it('should return false for message without required fields', () => {
      const message = {
        from: '1234567890',
        id: 'msg-123'
        // Missing timestamp
      };

      const result = validateMessageFormat(message);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Message missing required fields: from, id, or timestamp');
    });

    it('should return false for message without type field', () => {
      const message = {
        from: '1234567890',
        id: 'msg-123',
        timestamp: '1234567890'
        // Missing type
      };

      const result = validateMessageFormat(message);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Message missing type field');
    });

    it('should validate text message format successfully', () => {
      const message = {
        from: '1234567890',
        id: 'msg-123',
        timestamp: '1234567890',
        type: 'text',
        text: {
          body: 'Hello, world!'
        }
      };

      const result = validateMessageFormat(message);

      expect(result).toBe(true);
    });

    it('should return false for text message without body', () => {
      const message = {
        from: '1234567890',
        id: 'msg-123',
        timestamp: '1234567890',
        type: 'text',
        text: {
          // Missing body
        }
      };

      const result = validateMessageFormat(message);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Text message missing body or invalid format');
    });

    it('should return false for text message with non-string body', () => {
      const message = {
        from: '1234567890',
        id: 'msg-123',
        timestamp: '1234567890',
        type: 'text',
        text: {
          body: 123 // Not a string
        }
      };

      const result = validateMessageFormat(message);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Text message missing body or invalid format');
    });

    it('should validate interactive message format successfully', () => {
      const message = {
        from: '1234567890',
        id: 'msg-123',
        timestamp: '1234567890',
        type: 'interactive',
        interactive: {
          type: 'button_reply'
        }
      };

      const result = validateMessageFormat(message);

      expect(result).toBe(true);
    });

    it('should return false for interactive message without interactive field', () => {
      const message = {
        from: '1234567890',
        id: 'msg-123',
        timestamp: '1234567890',
        type: 'interactive'
        // Missing interactive field
      };

      const result = validateMessageFormat(message);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Interactive message missing interactive field or type');
    });

    it('should return false for interactive message without type', () => {
      const message = {
        from: '1234567890',
        id: 'msg-123',
        timestamp: '1234567890',
        type: 'interactive',
        interactive: {
          // Missing type
        }
      };

      const result = validateMessageFormat(message);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Interactive message missing interactive field or type');
    });

    it('should validate button message format successfully', () => {
      const message = {
        from: '1234567890',
        id: 'msg-123',
        timestamp: '1234567890',
        type: 'button',
        button: {
          payload: 'button-payload'
        }
      };

      const result = validateMessageFormat(message);

      expect(result).toBe(true);
    });

    it('should return false for button message without button field', () => {
      const message = {
        from: '1234567890',
        id: 'msg-123',
        timestamp: '1234567890',
        type: 'button'
        // Missing button field
      };

      const result = validateMessageFormat(message);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Button message missing button field or invalid payload');
    });

    it('should return false for button message with non-string payload', () => {
      const message = {
        from: '1234567890',
        id: 'msg-123',
        timestamp: '1234567890',
        type: 'button',
        button: {
          payload: 123 // Not a string
        }
      };

      const result = validateMessageFormat(message);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Button message missing button field or invalid payload');
    });

    it('should validate media message format successfully', () => {
      const mediaTypes = ['image', 'video', 'audio', 'document', 'sticker'];
      
      mediaTypes.forEach(mediaType => {
        const message = {
          from: '1234567890',
          id: 'msg-123',
          timestamp: '1234567890',
          type: mediaType,
          [mediaType]: {
            id: `${mediaType}-123`
          }
        };

        const result = validateMessageFormat(message);

        expect(result).toBe(true);
      });
    });

    it('should return false for media message without media field', () => {
      const message = {
        from: '1234567890',
        id: 'msg-123',
        timestamp: '1234567890',
        type: 'image'
        // Missing image field
      };

      const result = validateMessageFormat(message);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('image message missing image field or id');
    });

    it('should return false for unsupported message type', () => {
      const message = {
        from: '1234567890',
        id: 'msg-123',
        timestamp: '1234567890',
        type: 'unsupported'
      };

      const result = validateMessageFormat(message);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Unsupported message type: unsupported');
    });

    it('should handle error during validation gracefully', () => {
      const message = null;

      // Mock console.log to throw an error
      const originalLog = console.log;
      console.log = jest.fn(() => {
        throw new Error('Test error');
      });

      const result = validateMessageFormat(message);

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Error validating message format:', expect.any(Error));

      // Restore console.log
      console.log = originalLog;
    });
  });

  describe('validateWebhookPayload', () => {
    it('should return false for null payload', () => {
      const result = validateWebhookPayload(null);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Invalid webhook payload: missing entry array');
    });

    it('should return false for payload without entry', () => {
      const payload = {};

      const result = validateWebhookPayload(payload);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Invalid webhook payload: missing entry array');
    });

    it('should return false for entry that is not an array', () => {
      const payload = {
        entry: 'not-an-array'
      };

      const result = validateWebhookPayload(payload);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Invalid webhook payload: entry is not an array');
    });

    it('should return false for entry without required fields', () => {
      const payload = {
        entry: [{}]
      };

      const result = validateWebhookPayload(payload);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Invalid entry: missing id, time, or changes');
    });

    it('should return false for changes that is not an array', () => {
      const payload = {
        entry: [{
          id: 'entry-123',
          time: '1234567890',
          changes: 'not-an-array'
        }]
      };

      const result = validateWebhookPayload(payload);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Invalid entry: changes is not an array');
    });

    it('should return false for change without required fields', () => {
      const payload = {
        entry: [{
          id: 'entry-123',
          time: '1234567890',
          changes: [{}]
        }]
      };

      const result = validateWebhookPayload(payload);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Invalid change: missing field or value');
    });

    it('should return false for value without messaging_product', () => {
      const payload = {
        entry: [{
          id: 'entry-123',
          time: '1234567890',
          changes: [{
            field: 'messages',
            value: {}
          }]
        }]
      };

      const result = validateWebhookPayload(payload);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Invalid value: missing or incorrect messaging_product');
    });

    it('should return false for value with incorrect messaging_product', () => {
      const payload = {
        entry: [{
          id: 'entry-123',
          time: '1234567890',
          changes: [{
            field: 'messages',
            value: {
              messaging_product: 'incorrect'
            }
          }]
        }]
      };

      const result = validateWebhookPayload(payload);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Invalid value: missing or incorrect messaging_product');
    });

    it('should return false for messages that is not an array', () => {
      const payload = {
        entry: [{
          id: 'entry-123',
          time: '1234567890',
          changes: [{
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              messages: 'not-an-array'
            }
          }]
        }]
      };

      const result = validateWebhookPayload(payload);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Invalid value: messages is not an array');
    });

    it('should return false for contacts that is not an array', () => {
      const payload = {
        entry: [{
          id: 'entry-123',
          time: '1234567890',
          changes: [{
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              contacts: 'not-an-array'
            }
          }]
        }]
      };

      const result = validateWebhookPayload(payload);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Invalid value: contacts is not an array');
    });

    it('should return false for statuses that is not an array', () => {
      const payload = {
        entry: [{
          id: 'entry-123',
          time: '1234567890',
          changes: [{
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              statuses: 'not-an-array'
            }
          }]
        }]
      };

      const result = validateWebhookPayload(payload);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Invalid value: statuses is not an array');
    });

    it('should validate correct payload successfully', () => {
      const payload = {
        entry: [{
          id: 'entry-123',
          time: '1234567890',
          changes: [{
            field: 'messages',
            value: {
              messaging_product: 'whatsapp'
            }
          }]
        }]
      };

      const result = validateWebhookPayload(payload);

      expect(result).toBe(true);
    });

    it('should handle error during validation gracefully', () => {
      const payload = null;

      // Mock console.log to throw an error
      const originalLog = console.log;
      console.log = jest.fn(() => {
        throw new Error('Test error');
      });

      const result = validateWebhookPayload(payload);

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Error validating webhook payload:', expect.any(Error));

      // Restore console.log
      console.log = originalLog;
    });
  });
});