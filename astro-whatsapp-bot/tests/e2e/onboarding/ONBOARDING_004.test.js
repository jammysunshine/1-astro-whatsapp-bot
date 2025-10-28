const { TestDatabaseManager, setupWhatsAppMocks } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('ONBOARDING_004: Colon Format Time Error', () => {
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
    await dbManager.cleanupUser('+test_onboarding_004');
  });

  test('should reject time format with colon instead of requiring 4 digits', async () => {
    const phoneNumber = '+test_onboarding_004';

    // First set valid birth date
    const validDateMessage = {
      from: phoneNumber,
      type: 'text',
      text: { body: '15061990' }
    };

    await processIncomingMessage(validDateMessage, {});
    mocks.mockSendMessage.mockClear();

    // Then send invalid time format with colon
    const colonTimeMessage = {
      from: phoneNumber,
      type: 'text',
      text: { body: '9:30' }
    };

    await processIncomingMessage(colonTimeMessage, {});

    expect(mocks.mockSendMessage).toHaveBeenCalledTimes(1);
    const responseCall = mocks.mockSendMessage.mock.calls[0];
    expect(responseCall[0]).toBe(phoneNumber);
    expect(responseCall[1]).toContain('Please use 24-hour format without colon');

    // Verify user remains in onboarding state
    const user = await dbManager.db.collection('users').findOne({ phoneNumber });
    expect(user).toBeDefined();
    expect(user.birthDate).toBe('15061990');
    expect(user.birthTime).toBeUndefined(); // Should not be set yet
  }, 10000);
});