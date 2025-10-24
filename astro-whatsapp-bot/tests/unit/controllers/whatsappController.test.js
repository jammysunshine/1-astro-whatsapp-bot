// tests/unit/controllers/whatsappController.test.js
// Unit tests for WhatsApp webhook controller

const { handleWhatsAppWebhook } = require('../../../src/controllers/whatsappController');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');
const logger = require('../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../src/services/whatsapp/messageProcessor');
jest.mock('../../../src/utils/logger');

describe('WhatsApp Controller', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup request and response objects
    req = {
      body: {},
      headers: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });

  describe('handleWhatsAppWebhook', () => {
    it('should return 400 for invalid webhook payload', async () => {
      req.body = null;
      
      await handleWhatsAppWebhook(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid payload' });
    });

    it('should return 200 for valid webhook payload with no entries', async () => {
      req.body = { entry: [] };
      
      await handleWhatsAppWebhook(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ 
        success: true, 
        message: 'Webhook processed successfully',
        timestamp: expect.any(String)
      });
    });

    it('should process valid webhook with messages', async () => {
      req.body = {
        entry: [{
          changes: [{
            value: {
              messages: [{
                from: '1234567890',
                id: 'message-id-123',
                type: 'text',
                timestamp: '1234567890',
                text: {
                  body: 'Hello, astrologer!'
                }
              }],
              contacts: [{
                profile: { name: 'John Doe' },
                wa_id: '1234567890'
              }]
            }
          }]
        }]
      };
      
      processIncomingMessage.mockResolvedValue();
      
      await handleWhatsAppWebhook(req, res);
      
      expect(processIncomingMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '1234567890',
          id: 'message-id-123',
          type: 'text',
          timestamp: '1234567890',
          text: {
            body: 'Hello, astrologer!'
          }
        }),
        expect.objectContaining({
          contacts: [{
            profile: { name: 'John Doe' },
            wa_id: '1234567890'
          }]
        })
      );
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Webhook processed successfully',
        timestamp: expect.any(String)
      });
    });

    it('should handle errors gracefully', async () => {
      req.body = {
        entry: [{
          changes: [{
            value: {
              messages: [{}]
            }
          }]
        }]
      };
      
      // Mock processIncomingMessage to throw an error
      processIncomingMessage.mockRejectedValue(new Error('Processing error'));
      
      await handleWhatsAppWebhook(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Processing error'
      });
    });
  });
});