const { TestDatabaseManager, setupWhatsAppMocks } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('ONBOARDING_001: Invalid Date Format Handling', () => {
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
    // Clean up any existing test data
    await dbManager.cleanupUser('+test123');
  });

  test('should handle invalid date format gracefully', async () => {
    // GIVEN: New user without birth data
    const phoneNumber = '+test123';
    const invalidDateMessage = {
      from: phoneNumber,
      type: 'text',
      text: { body: 'abc123' }
    };

    // WHEN: User sends invalid date
    await processIncomingMessage(invalidDateMessage, {});

    // THEN: Bot responds with specific error message
    expect(mocks.mockSendMessage).toHaveBeenCalledTimes(1);
    const responseCall = mocks.mockSendMessage.mock.calls[0];
    expect(responseCall[0]).toBe(phoneNumber); // Correct phone number
    expect(responseCall[1]).toContain('Please provide date in DDMMYY'); // Error message
    expect(responseCall[1]).toContain('150690'); // Example format
    expect(responseCall[1]).toContain('15061990'); // Alternative format

    // AND: No database record created yet
    const userCreated = await dbManager.db.collection('users').findOne({ phoneNumber });
    expect(userCreated).toBeNull(); // User not created until valid data provided
  }, 10000);
});