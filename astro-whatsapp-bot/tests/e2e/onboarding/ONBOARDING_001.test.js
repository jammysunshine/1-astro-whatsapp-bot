const { TestDatabaseManager, setupWhatsAppMocks } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('ONBOARDING_001: Invalid Date Format - Alpha Numeric', () => {
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
    await dbManager.cleanupUser('+test_onboarding_001');
  });

  test('should handle invalid date format with alphanumeric characters', async () => {
    const phoneNumber = '+test_onboarding_001';
    const invalidDateMessage = {
      from: phoneNumber,
      type: 'text',
      text: { body: 'abc123' }
    };

    await processIncomingMessage(invalidDateMessage, {});

    expect(mocks.mockSendMessage).toHaveBeenCalledTimes(1);
    const responseCall = mocks.mockSendMessage.mock.calls[0];
    expect(responseCall[0]).toBe(phoneNumber);
    expect(responseCall[1]).toContain('Please provide date in DDMMYY');
    expect(responseCall[1]).toContain('150690');
    expect(responseCall[1]).toContain('15061990');

    const userCreated = await dbManager.db.collection('users').findOne({ phoneNumber });
    expect(userCreated).toBeNull();
  }, 10000);
});