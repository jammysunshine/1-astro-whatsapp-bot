const { TestDatabaseManager, setupWhatsAppMocks } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');
const axios = require('axios'); // Assuming axios is used for external API calls

describe('CROSSPLATFORM_009: High Latency Scenarios - Timeout Handling', () => {
  let dbManager;
  let mocks;
  let axiosGetSpy;
  let axiosPostSpy;

  beforeAll(async () => {
    dbManager = new TestDatabaseManager();
    await dbManager.setup();
    mocks = setupWhatsAppMocks();

    // Spy on axios.get (for Google Maps) and axios.post (for Mistral AI) to simulate timeouts
    axiosGetSpy = jest.spyOn(axios, 'get');
    axiosPostSpy = jest.spyOn(axios, 'post');

  }, 30000);

  afterAll(async () => {
    mocks.restoreMocks();
    axiosGetSpy.mockRestore();
    axiosPostSpy.mockRestore();
    await dbManager.teardown();
  }, 10000);

  beforeEach(async () => {
    if (axiosGetSpy) axiosGetSpy.mockReset();
    if (axiosPostSpy) axiosPostSpy.mockReset();
    mocks.mockSendMessage.mockClear();
    await dbManager.cleanupUser('+test_high_latency');
  });

  test('should handle Google Maps API timeout for location input', async () => {
    const phoneNumber = '+test_high_latency';

    // GIVEN: A user is in the onboarding flow, expecting location input
    // Simulate initial messages to reach the location input step
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'hi' } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '15061990' } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '1430' } }, {});
    mocks.mockSendMessage.mockClear(); // Clear messages sent during setup

    // WHEN: Google Maps API call times out during location input
    axiosGetSpy.mockImplementationOnce(() => {
      return new Promise((resolve, reject) => {
        setTimeout(() => reject(new axios.AxiosError('Network Error', 'ETIMEDOUT')), 5000); // Simulate timeout
      });
    });

    const locationMessage = {
      from: phoneNumber,
      type: 'text',
      text: { body: 'London, UK' }
    };

    await processIncomingMessage(locationMessage, {});

    // THEN: Bot should respond with a timeout/error message
    expect(mocks.mockSendMessage).toHaveBeenCalledTimes(1);
    const responseCall = mocks.mockSendMessage.mock.calls[0];
    expect(responseCall[0]).toBe(phoneNumber);
    expect(responseCall[1]).toContain('We are experiencing a temporary issue with our location services');
    expect(responseCall[1]).toContain('Please try again later or enter a valid city.');

  }, 15000); // Increase timeout for the test to allow for simulated API timeout

});