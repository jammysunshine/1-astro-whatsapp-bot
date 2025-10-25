// tests/unit/server.test.js
// Unit tests for server setup and basic endpoints

const request = require('supertest');
const app = require('../../src/server');

// Mock webhook validator
jest.mock('../../src/services/whatsapp/webhookValidator', () => ({
  validateWebhookSignature: jest.fn(() => true),
  verifyWebhookChallenge: jest.fn(() => ({
    success: true,
    message: 'Webhook endpoint ready',
  })),
}));

describe('Server Setup', () => {
  describe('GET /health', () => {
    it('should return health status with correct structure', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty(
        'service',
        'Astrology WhatsApp Bot API'
      );
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('GET /', () => {
    it('should return welcome message with version', async () => {
      const response = await request(app).get('/').expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body.message).toContain(
        'Astrology WhatsApp Bot API is running'
      );
    });
  });

  describe('POST /webhook', () => {
    it('should return webhook ready message', async () => {
      const response = await request(app)
        .post('/webhook')
        .set('x-hub-signature-256', 'signature')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.message).toContain('Webhook endpoint ready');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body).toHaveProperty('message');
    });
  });
});
