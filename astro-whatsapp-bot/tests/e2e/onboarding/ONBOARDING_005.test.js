const { TestDatabaseManager, setupWhatsAppMocks } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('ONBOARDING_005: Leading Zero Auto-format', () => {
  let dbManager;
  let mocks;

  beforeAll(async () => {
    dbManager = new TestDatabaseManager();
    await dbManager.setup();
    mocks = setupWhatsAppMocks();
  }, 30000);

  afterAll(async () => {
    mocks.restoreMocks();
    await dbManager.teardown();
  }, 10000);

  beforeEach(async () => {
    mocks.mockSendMessage.mockClear();
    await dbManager.cleanupUser('+test_onboarding_005');
  });

  test('should auto-format time input without leading zero', async () => {
    const phoneNumber = '+test_onboarding_005';

    // First set valid birth date
    const validDateMessage = {
      from: phoneNumber,
      type: 'text',
      text: { body: '15061990' }
    };

    await processIncomingMessage(validDateMessage, {});
    mocks.mockSendMessage.mockClear();

    // Then send time without leading zero
    const shortTimeMessage = {
      from: phoneNumber,
      type: 'text',
      text: { body: '930' }
    };

    await processIncomingMessage(shortTimeMessage, {});

    expect(mocks.mockSendMessage).toHaveBeenCalledTimes(1);
    const responseCall = mocks.mockSendMessage.mock.calls[0];
    expect(responseCall[0]).toBe(phoneNumber);
    expect(responseCall[1]).toContain('Great! 🌍 Birth place determines your *local planetary positions*');

    // Verify time was auto-formatted and stored
    const user = await dbManager.db.collection('users').findOne({ phoneNumber });
    expect(user).toBeDefined();
    expect(user.birthDate).toBe('15061990');
    expect(user.birthTime).toBe('0930'); // Auto-formatted with leading zero
  }, 10000);
});