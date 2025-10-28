const { TestDatabaseManager, setupWhatsAppMocks } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('CALCULATION_001: Solstice Birth Energy', () => {
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
    await dbManager.cleanupUser('+test_calc_001');
  });

  test('should accurately calculate winter solstice birth energy', async () => {
    const phoneNumber = '+test_calc_001';

    // Create user with winter solstice birth date (Dec 21-22)
    const testUser = await dbManager.createTestUser(phoneNumber, {
      birthDate: '21121990', // December 21, 1990 (winter solstice)
      birthTime: '1200',
      birthPlace: 'Mumbai, India',
      profileComplete: true
    });

    const birthChartRequest = {
      from: phoneNumber,
      interactive: {
        type: 'list_reply',
        list_reply: {
          id: 'show_birth_chart',
          title: 'Birth Chart',
          description: 'Testing solstice energy calculation'
        }
      },
      type: 'interactive'
    };

    await processIncomingMessage(birthChartRequest, {});

    expect(mocks.mockSendMessage).toHaveBeenCalled();
    const responseCall = mocks.mockSendMessage.mock.calls[0];

    // Verify solstice energy is reflected in chart interpretation
    expect(responseCall[1]).toContain('Capricorn'); // Sun sign for solstice period
    expect(responseCall[1]).toContain('Sagittarius'); // Cusp energy consideration
  }, 10000);
});