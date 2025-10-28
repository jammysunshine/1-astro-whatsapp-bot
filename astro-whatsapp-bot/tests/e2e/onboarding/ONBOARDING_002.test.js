const { TestDatabaseManager, setupWhatsAppMocks } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('ONBOARDING_002: Future Date Rejection', () => {
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
    await dbManager.cleanupUser('+test123');
  });

  test('should reject future birth dates', async () => {
    const phoneNumber = '+test123';
    const futureDateMessage = {
      from: phoneNumber,
      type: 'text',
      text: { body: '31122025' } // Future date
    };

    // Simulate initial message to trigger onboarding
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'hi' } }, {});
    mocks.mockSendMessage.mockClear(); // Clear initial 'hi' response

    await processIncomingMessage(futureDateMessage, {});

    expect(mocks.mockSendMessage).toHaveBeenCalledTimes(1);
    const responseCall = mocks.mockSendMessage.mock.calls[0];
    expect(responseCall[0]).toBe(phoneNumber);
    expect(responseCall[1]).toContain('Birth date cannot be in the future. Please enter your actual birth date.');

    const userCreated = await dbManager.db.collection('users').findOne({ phoneNumber });
    expect(userCreated).toBeNull();
  }, 10000);
});