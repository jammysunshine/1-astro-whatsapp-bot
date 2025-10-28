const { TestDatabaseManager, setupWhatsAppMocks } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('ONBOARDING_009: DST Birth Time Handling', () => {
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
    await dbManager.cleanupUser('+test_onboarding_009');
  });

  test('should correctly handle DST transition time zone calculations', async () => {
    const phoneNumber = '+test_onboarding_009';

    // Set up birth data
    const validDateMessage = {
      from: phoneNumber,
      type: 'text',
      text: { body: '15061990' }
    };
    await processIncomingMessage(validDateMessage, {});
    mocks.mockSendMessage.mockClear();

    // Set time in DST window
    const dstTimeMessage = {
      from: phoneNumber,
      type: 'text',
      text: { body: '0200' } // 2:00 AM during DST transition
    };
    await processIncomingMessage(dstTimeMessage, {});
    mocks.mockSendMessage.mockClear();

    // Set location in DST timezone
    const dstLocationMessage = {
      from: phoneNumber,
      type: 'text',
      text: { body: 'New York, USA' } // Eastern Time Zone
    };
    await processIncomingMessage(dstLocationMessage, {});

    expect(mocks.mockSendMessage).toHaveBeenCalled();
    const user = await dbManager.db.collection('users').findOne({ phoneNumber });
    expect(user).toBeDefined();
    expect(user.birthDate).toBe('15061990');
    expect(user.birthTime).toBe('0200');
    expect(user.birthPlace).toBe('New York, USA');
  }, 10000);
});