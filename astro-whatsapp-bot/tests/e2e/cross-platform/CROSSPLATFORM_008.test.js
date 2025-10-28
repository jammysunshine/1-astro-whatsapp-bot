const { TestDatabaseManager, setupWhatsAppMocks } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');
const axios = require('axios');

describe('CROSSPLATFORM_008: Intermittent Connectivity - Message Retry Mechanisms', () => {
  let dbManager;
  let mocks;
  let axiosGetSpy;

  beforeAll(async () => {
    dbManager = new TestDatabaseManager();
    await dbManager.setup();
    mocks = setupWhatsAppMocks();

    axiosGetSpy = jest.spyOn(axios, 'get');

  }, 30000);

  afterAll(async () => {
    mocks.restoreMocks();
    axiosGetSpy.mockRestore();
    await dbManager.teardown();
  }, 10000);

  beforeEach(async () => {
    if (axiosGetSpy) axiosGetSpy.mockReset();
    mocks.mockSendMessage.mockClear();
    await dbManager.cleanupUser('+test_intermittent_connectivity');
  });

  test('should successfully process request after intermittent Google Maps API failure', async () => {
    const phoneNumber = '+test_intermittent_connectivity';

    // GIVEN: User is in onboarding, expecting location input
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'hi' } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '15061990' } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '1430' } }, {});
    mocks.mockSendMessage.mockClear();

    // WHEN: Google Maps API call fails once due to network error, then succeeds on retry
    axiosGetSpy.mockImplementationOnce(() => {
      return Promise.reject(new axios.AxiosError('Network Error', 'ECONNRESET')); // Simulate transient failure
    }).mockImplementationOnce(() => {
      return Promise.resolve({
        data: {
          results: [{
            geometry: { location: { lat: 19.0760, lng: 72.8777 } },
            formatted_address: 'Mumbai, Maharashtra, India'
          }],
          status: 'OK'
        }
      });
    });

    const locationMessage = {
      from: phoneNumber,
      type: 'text',
      text: { body: 'Mumbai, India' }
    };

    await processIncomingMessage(locationMessage, {});

    // THEN: Bot should eventually succeed and proceed to the next step (e.g., profile confirmation)
    // We expect at least two calls to axios.get (initial failure + one retry)
    expect(axiosGetSpy).toHaveBeenCalledTimes(2);

    // And the bot should send a message indicating successful processing or moving to the next step
    expect(mocks.mockSendMessage).toHaveBeenCalled();
    const responseCall = mocks.mockSendMessage.mock.calls[0];
    expect(responseCall[0]).toBe(phoneNumber);
    expect(responseCall[1]).toContain('Is this correct?'); // Assuming this is the next step after successful location

  }, 15000); // Increased timeout for potential retries
});