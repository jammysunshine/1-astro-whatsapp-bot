const { TestDatabaseManager, setupWhatsAppMocks } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('ONBOARDING_003: Time Skip Functionality', () => {
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
    await dbManager.cleanupUser('+test_onboarding_003');
  });

  test('should allow skipping birth time and proceed to next step', async () => {
    const phoneNumber = '+test_onboarding_003';

    // First set a valid birth date
    const validDateMessage = {
      from: phoneNumber,
      type: 'text',
      text: { body: '15061990' }
    };

    await processIncomingMessage(validDateMessage, {});
    mocks.mockSendMessage.mockClear();

    // Then skip the time input
    const skipTimeMessage = {
      from: phoneNumber,
      type: 'text',
      text: { body: 'skip' }
    };

    await processIncomingMessage(skipTimeMessage, {});

    expect(mocks.mockSendMessage).toHaveBeenCalledTimes(1);
    const responseCall = mocks.mockSendMessage.mock.calls[0];
    expect(responseCall[0]).toBe(phoneNumber);
    expect(responseCall[1]).toContain('Great! 🌍 Birth place determines your *local planetary positions*');

    // Verify time is stored as null
    const user = await dbManager.db.collection('users').findOne({ phoneNumber });
    expect(user).toBeDefined();
    expect(user.birthTime).toBeNull();
    expect(user.birthDate).toBe('15061990');
  }, 10000);
});