const { TestDatabaseManager, getWhatsAppIntegration, isRealAPIMode } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('ONBOARDING_010: International Date Format (D/M/Y)', () => {
  let dbManager;
  let whatsAppIntegration;

  beforeAll(async () => {
    dbManager = new TestDatabaseManager();
    await dbManager.setup();
    whatsAppIntegration = getWhatsAppIntegration();

    console.log(`🧪 ONBOARDING_010 running with ${isRealAPIMode() ? 'REAL WhatsApp APIs' : 'simulated WhatsApp APIs'}`);
  }, 30000);

  afterAll(async () => {
    await dbManager.teardown();
  }, 10000);

  beforeEach(async () => {
    whatsAppIntegration.clearMessages?.();
    await dbManager.cleanupUser('+test_onboarding_010');
  });

  test('should auto-correct international date format (15/06/90 → 15061990)', async () => {
    const phoneNumber = '+test_onboarding_010';

    // Send international date format (common in UK/Europe)
    const internationalDateMessage = {
      from: phoneNumber,
      type: 'text',
      text: { body: '15/06/90' }
    };

    await processIncomingMessage(internationalDateMessage, {});

    if (isRealAPIMode()) {
      // Verify real WhatsApp message was sent
      const sentMessages = whatsAppIntegration.getSentMessages(phoneNumber);
      expect(sentMessages.length).toBeGreaterThan(0);
      expect(sentMessages[sentMessages.length - 1].status).toBe('sent');
    } else {
      // Verify simulated WhatsApp message
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledTimes(1);
      const responseCall = whatsAppIntegration.mockSendMessage.mock.calls[0];
      expect(responseCall[0]).toBe(phoneNumber);
      expect(responseCall[1]).toContain('Excellent!'); // Should proceed to time input
    }

    // Verify date was auto-corrected and stored properly
    const user = await dbManager.db.collection('users').findOne({ phoneNumber });
    expect(user).toBeDefined();
    expect(user.birthDate).toBe('15061990'); // YYYYMMDD format
  }, 10000);
});