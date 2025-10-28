const { TestDatabaseManager, setupWhatsAppMocks } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('ONBOARDING_007: Minutes Range Validation (99 instead of 60)', () => {
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
    await dbManager.cleanupUser('+test_onboarding_007');
  });

  test('should reject minute values greater than 59', async () => {
    const phoneNumber = '+test_onboarding_007';

    // First set valid birth date
    const validDateMessage = {
      from: phoneNumber,
      type: 'text',
      text: { body: '15061990' }
    };

    await processIncomingMessage(validDateMessage, {});
    mocks.mockSendMessage.mockClear();

    // Then send invalid minutes (12:60 is not valid)
    const invalidMinuteMessage = {
      from: phoneNumber,
      type: 'text',
      text: { body: '1260' }
    };

    await processIncomingMessage(invalidMinuteMessage, {});

    expect(mocks.mockSendMessage).toHaveBeenCalledTimes(1);
    const responseCall = mocks.mockSendMessage.mock.calls[0];
    expect(responseCall[0]).toBe(phoneNumber);
    expect(responseCall[1]).toContain('Minutes must be between 00-59');

    // Verify time not stored
    const user = await dbManager.db.collection('users').findOne({ phoneNumber });
    expect(user).toBeDefined();
    expect(user.birthTime).toBeUndefined();
  }, 10000);
});