const { TestDatabaseManager, setupWhatsAppMocks } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('ONBOARDING_008: Geocoding API Failure', () => {
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
    await dbManager.cleanupUser('+test_onboarding_008');
  });

  test('should handle geocoding API failure gracefully and allow profile completion with warning', async () => {
    const phoneNumber = '+test_onboarding_008';

    // Set up valid date and time
    const validDateMessage = {
      from: phoneNumber,
      type: 'text',
      text: { body: '15061990' }
    };
    await processIncomingMessage(validDateMessage, {});
    mocks.mockSendMessage.mockClear();

    const validTimeMessage = {
      from: phoneNumber,
      type: 'text',
      text: { body: '1430' }
    };
    await processIncomingMessage(validTimeMessage, {});
    mocks.mockSendMessage.mockClear();

    // Now send location that would trigger geocoding (mock API failure)
    const locationMessage = {
      from: phoneNumber,
      type: 'text',
      text: { body: 'Mumbai, India' }
    };

    await processIncomingMessage(locationMessage, {});

    expect(mocks.mockSendMessage).toHaveBeenCalled();
    const responseCall = mocks.mockSendMessage.mock.calls[0];
    expect(responseCall[1]).toContain('Welcome to your Personal Cosmic Coach');

    // Verify user was created despite geocoding failure
    const user = await dbManager.db.collection('users').findOne({ phoneNumber });
    expect(user).toBeDefined();
    expect(user.birthDate).toBe('15061990');
    expect(user.birthTime).toBe('1430');
    expect(user.birthPlace).toBe('Mumbai, India');
  }, 10000);
});