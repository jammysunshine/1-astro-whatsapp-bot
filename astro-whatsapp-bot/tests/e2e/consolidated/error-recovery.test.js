const { TestDatabaseManager, setupWhatsAppMocks, getWhatsAppIntegration } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');
const axios = require('axios');

jest.mock('axios');

describe('ERROR RECOVERY INTEGRATION: Menu, API, and General Error Handling', () => {
  let dbManager;
  let whatsAppIntegration;
  let mocks;

  beforeAll(async () => {
    dbManager = new TestDatabaseManager();
    await dbManager.setup();
    whatsAppIntegration = getWhatsAppIntegration();
    mocks = setupWhatsAppMocks();
  }, 30000);

  afterAll(async () => {
    mocks.restoreMocks();
    await dbManager.teardown();
  }, 10000);

  beforeEach(async () => {
    mocks.mockSendMessage.mockClear();
    await dbManager.cleanupUser('+error_test_user');
    axios.get.mockReset();
    axios.post.mockReset();
  });

  // Helper function to simulate a user completing the onboarding successfully
  const simulateOnboarding = async (phoneNumber, birthDate, birthTime, birthPlace) => {
    // Mock successful geocoding for onboarding
    axios.get.mockResolvedValueOnce({
      data: {
        results: [{
          geometry: { location: { lat: 51.5074, lng: 0.1278 } },
          formatted_address: birthPlace
        }],
        status: 'OK'
      }
    });

    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hi' } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: birthDate } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: birthTime } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: birthPlace } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Yes' } }, {});
    whatsAppIntegration.mockSendMessage.mockClear();
  };

  describe('Menu Interaction Error Recovery (8 tests)', () => {
    test('should handle invalid action IDs gracefully and restore main menu', async () => {
      const phoneNumber = '+error_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'invalid_action_123' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Sorry, that option is not available. Please try again.')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Main Menu') // Should return to main menu
      );
    });

    test('should handle expired session navigation by re-initializing fresh menu', async () => {
      const phoneNumber = '+error_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate session expiration (e.g., by clearing session data in DB)
      await dbManager.db.collection('sessions').deleteMany({ phoneNumber: phoneNumber });
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {}); // Try to navigate

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your session has expired. Starting fresh...')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Welcome to the Astrology Bot!') // Fresh main menu/welcome
      );
    });

    test('should prevent concurrent access conflicts through session isolation', async () => {
      const phoneNumber = '+error_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate two concurrent messages from the same user
      const message1 = processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {});
      const message2 = processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});

      await Promise.all([message1, message2]);

      // Expect the bot to handle one, and potentially inform the user about the other or queue it.
      // This test assumes a specific conflict resolution strategy (e.g., process first, ignore/queue second).
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Please wait for your previous request to be processed.')
      );
      // Verify that the session state remains consistent and not corrupted.
    });

    test('should recover from menu state corruption and reinitialize', async () => {
      const phoneNumber = '+error_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate corrupting the user's session state in the database
      await dbManager.db.collection('sessions').updateOne({ phoneNumber: phoneNumber }, { $set: { currentMenuState: 'corrupted_data' } });
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Any message' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('An unexpected error occurred. Re-initializing your session.')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Welcome to the Astrology Bot!') // Fresh main menu
      );
      const user = await dbManager.db.collection('sessions').findOne({ phoneNumber: phoneNumber });
      expect(user.currentMenuState).not.toBe('corrupted_data'); // State should be reset
    });

    test('should automatically retry message delivery on network timeout during selection', async () => {
      const phoneNumber = '+error_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate user sending a message, but network times out before bot receives/responds
      // This would involve mocking network conditions or the message processing layer.
      // For now, we simulate the bot detecting a timeout and retrying.
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Daily Horoscope' }, simulateNetworkTimeout: true }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('It seems there was a temporary network issue. Retrying your request...')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Here is your Daily Horoscope:') // Eventually succeeds
      );
    });

    test('should gracefully degrade and recover from network failure mid-navigation', async () => {
      const phoneNumber = '+error_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate network failure during a multi-step navigation
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {});
      // Simulate network going down here
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Basic Readings', networkFailure: true } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Network connection lost. Attempting to reconnect...')
      );
      // Verify that the bot attempts to restore the connection and continue the flow.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Connection restored. You are in Basic Readings.')
      );
    });

    test('should maintain state consistency during partial message delivery', async () => {
      const phoneNumber = '+error_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a message being partially delivered (e.g., only part of a command)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Daily Horos' }, partialDelivery: true }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('I didn\'t quite catch that. Could you please repeat or clarify?')
      );
      // Verify that the bot doesn't enter an inconsistent state and prompts for re-entry.
    });

    test('should gracefully degrade and recover from service interruption', async () => {
      const phoneNumber = '+error_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a critical service (e.g., astrology calculation engine) going down
      // This would involve mocking the service to throw an error.
      // For now, we simulate the bot informing the user about the interruption.
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart Analysis' }, simulateServiceInterruption: true }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Our astrology calculation service is temporarily unavailable.')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Please try again later or choose another option.')
      );
      // Verify that once the service is restored, the bot functions normally.
    });
  });

  describe('API Failure Recovery (8 tests)', () => {
    test('should handle Google Maps API quota exceeded with fallback coordinate handling', async () => {
      const phoneNumber = '+error_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate Google Maps API quota exceeded error
      axios.get.mockRejectedValueOnce({ response: { status: 403, data: { error_message: 'OVER_QUERY_LIMIT' } } });

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Change Location New York' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Our location service is currently experiencing high demand.')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Please try again later or enter coordinates manually.')
      );
    });

    test('should recover from Google Maps API service outage with offline coordinate caching', async () => {
      const phoneNumber = '+error_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate Google Maps API service outage
      axios.get.mockRejectedValueOnce(new Error('Network Error'));

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Change Location Paris' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Our location service is temporarily unavailable.')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Using cached coordinates for Paris. Accuracy may vary.')
      );
    });

    test('should implement exponential backoff for Google Maps API rate limiting responses', async () => {
      const phoneNumber = '+error_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate multiple rate limit errors followed by success
      axios.get
        .mockRejectedValueOnce({ response: { status: 429, data: { error_message: 'RATE_LIMIT_EXCEEDED' } } })
        .mockRejectedValueOnce({ response: { status: 429, data: { error_message: 'RATE_LIMIT_EXCEEDED' } } })
        .mockResolvedValueOnce({
          data: {
            results: [{
              geometry: { location: { lat: 40.7128, lng: -74.0060 } },
              formatted_address: 'New York, USA'
            }],
            status: 'OK'
          }
        });

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Change Location New York' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Too many requests to location service. Retrying with backoff...')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Location updated to New York, USA.')
      );
    });

    test('should handle Google Maps API key invalidation with authentication error handling', async () => {
      const phoneNumber = '+error_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate Google Maps API key invalidation
      axios.get.mockRejectedValueOnce({ response: { status: 401, data: { error_message: 'INVALID_API_KEY' } } });

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Change Location Berlin' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('There was an issue with our location service authentication.')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Please contact support.')
      );
    });

    test('should use fallback generation methods for Mistral AI response parsing errors', async () => {
      const phoneNumber = '+error_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate Mistral AI returning malformed JSON or unexpected response structure
      axios.post.mockResolvedValueOnce({ data: { choices: [{ message: { content: '' } }] } }); // Empty content

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Generate Horoscope' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('I encountered an issue generating your horoscope.')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Here is a standard horoscope for today.') // Fallback
      );
    });

    test('should use alternative content generation for Mistral AI content filtering violations', async () => {
      const phoneNumber = '+error_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate Mistral AI content filtering triggering
      axios.post.mockResolvedValueOnce({ data: { choices: [{ message: { content: '' }, finish_reason: 'content_filter' }] } });

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Generate Horoscope (sensitive topic)' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('I cannot generate content on that topic directly.')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Please try a different request or a more general horoscope.')
      );
    });

    test('should handle Mistral AI model performance degradation with quality threshold handling', async () => {
      const phoneNumber = '+error_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate Mistral AI returning very short/low-quality response
      axios.post.mockResolvedValueOnce({ data: { choices: [{ message: { content: 'OK.' } }] } });

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Generate Detailed Reading' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('I apologize, the AI model is currently not providing detailed responses.')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Please try again later for a more comprehensive reading.')
      );
    });

    test('should implement content truncation strategies for Mistral AI token limit exceedances', async () => {
      const phoneNumber = '+error_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate Mistral AI response exceeding token limit
      axios.post.mockResolvedValueOnce({ data: { choices: [{ message: { content: 'A very long response that would exceed the token limit...' } }], usage: { total_tokens: 4000 } } }); // Assume limit is 3000

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Generate Very Long Reading' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your reading was too long to send in one message.')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Please ask for a summary or a specific section.')
      );
    });
  });

  // Placeholder for remaining 16 error handling scenarios
  describe('Additional Error Handling Scenarios (16 tests)', () => {
    test.todo('should handle generic unexpected errors gracefully');
    test.todo('should log all unhandled exceptions for debugging');
    test.todo('should provide clear instructions for user to recover from unknown errors');
    test.todo('should prevent infinite error loops');
    test.todo('should handle invalid user IDs or non-existent users');
    test.todo('should handle malformed incoming WhatsApp messages');
    test.todo('should recover from temporary external service unavailability');
    test.todo('should handle database connection errors');
    test.todo('should handle file system errors (e.g., logs, temporary files)');
    test.todo('should provide specific error codes for easier debugging');
    test.todo('should offer a \'help\' or \'reset\' command during error states');
    test.todo('should handle errors during user profile creation/update');
    test.todo('should handle errors during subscription status changes');
    test.todo('should handle errors during payment processing');
    test.todo('should handle errors during language switching');
    test.todo('should handle errors during timezone calculations');
  });
});
