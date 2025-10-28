const { TestDatabaseManager, setupWhatsAppMocks } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('NAVIGATION_001: Invalid Action ID Recovery', () => {
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
    await dbManager.cleanupUser('+test_nav_001');
  });

  test('should recover gracefully from invalid menu action IDs', async () => {
    const phoneNumber = '+test_nav_001';
    const invalidActionMessage = {
      from: phoneNumber,
      interactive: {
        type: 'list_reply',
        list_reply: {
          id: 'invalid_action_123',
          title: 'Invalid Action',
          description: 'Testing error recovery'
        }
      },
      type: 'interactive'
    };

    await processIncomingMessage(invalidActionMessage, {});

    expect(mocks.mockSendMessage).toHaveBeenCalled();
    const responseCall = mocks.mockSendMessage.mock.calls[0];
    expect(responseCall[1]).toContain('Sorry, that option is not available');

    // Should re-display main menu
    expect(mocks.mockSendMessage.mock.calls.length).toBeGreaterThan(1);
  }, 10000);
});