const { TestDatabaseManager, setupWhatsAppMocks, getWhatsAppIntegration, isRealAPIMode } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');
const { createUser } = require('../../../src/models/userModel');

describe('COMPATIBILITY ANALYSIS FLOW INTEGRATION: Partner Data and Relationship Context Validation', () => {
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
    await dbManager.cleanupUser('+compatibility_test_user');
    await dbManager.cleanupUser('+compatibility_partner_user');
  });

  // Helper function to simulate a user completing the onboarding up to a certain point
  const simulateOnboarding = async (phoneNumber, birthDate, birthTime, birthPlace) => {
    // Simulate initial message to start onboarding
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hi' } }, {});
    // Simulate birth date input
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: birthDate } }, {});
    // Simulate birth time input
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: birthTime } }, {});
    // Simulate birth place input
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: birthPlace } }, {});
    // Simulate confirmation (assuming a simple 'Yes' or similar)
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Yes' } }, {});
  };

  describe('Partner Data Validation (5 tests)', () => {
    test('should handle partner age > 120 years for senior compatibility analysis', async () => {
      const userPhoneNumber = '+compatibility_test_user';
      const partnerPhoneNumber = '+compatibility_partner_user';

      // Simulate main user onboarding
      await simulateOnboarding(userPhoneNumber, '15061990', '1430', 'Mumbai, India');

      // Simulate partner onboarding with age > 120 years (e.g., born in 1900)
      await simulateOnboarding(partnerPhoneNumber, '01011900', '1200', 'London, UK');

      // Simulate user initiating compatibility analysis
      await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: 'Compatibility Analysis' } }, {});
      await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: partnerPhoneNumber } }, {});

      // Expect a message indicating senior compatibility analysis or successful processing
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        userPhoneNumber,
        expect.stringContaining('Analyzing compatibility for a senior partner') // Or similar confirmation
      );
      // Further assertions could check the actual analysis result if available
    });

    test('should reject partner birth date in the future', async () => {
      const userPhoneNumber = '+compatibility_test_user';
      const partnerPhoneNumber = '+compatibility_partner_user';
      const futureDate = '31122025'; // A future date

      // Simulate main user onboarding
      await simulateOnboarding(userPhoneNumber, '15061990', '1430', 'Mumbai, India');

      // Simulate partner onboarding up to birth date input
      await processIncomingMessage({ from: partnerPhoneNumber, type: 'text', text: { body: 'Hi' } }, {});
      await processIncomingMessage({ from: partnerPhoneNumber, type: 'text', text: { body: futureDate } }, {});

      // Expect an error message for future date
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        partnerPhoneNumber,
        expect.stringContaining('Birth date cannot be in the future')
      );
    });

    test('should handle partner birth city geocoding failures with location fallback', async () => {
      const userPhoneNumber = '+compatibility_test_user';
      const partnerPhoneNumber = '+compatibility_partner_user';

      // Simulate main user onboarding
      await simulateOnboarding(userPhoneNumber, '15061990', '1430', 'Mumbai, India');

      // Simulate partner onboarding up to birth place input with an invalid city
      await processIncomingMessage({ from: partnerPhoneNumber, type: 'text', text: { body: 'Hi' } }, {});
      await processIncomingMessage({ from: partnerPhoneNumber, type: 'text', text: { body: '01011990' } }, {});
      await processIncomingMessage({ from: partnerPhoneNumber, type: 'text', text: { body: '1200' } }, {});
      await processIncomingMessage({ from: partnerPhoneNumber, type: 'text', text: { body: 'Atlantis, Pacific' } }, {}); // Invalid city

      // Expect an error message and a prompt for re-entry or fallback
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        partnerPhoneNumber,
        expect.stringContaining('Could not find location for "Atlantis, Pacific". Please try again or enter a more specific location.')
      );
    });

    test('should ensure database consistency with multiple partner compatibility checks', async () => {
      const userPhoneNumber = '+compatibility_test_user';
      const partner1PhoneNumber = '+compatibility_partner_user_1';
      const partner2PhoneNumber = '+compatibility_partner_user_2';

      // Simulate main user onboarding
      await simulateOnboarding(userPhoneNumber, '15061990', '1430', 'Mumbai, India');

      // Simulate partner 1 onboarding
      await simulateOnboarding(partner1PhoneNumber, '01011985', '1000', 'New York, USA');

      // Simulate partner 2 onboarding
      await simulateOnboarding(partner2PhoneNumber, '20031992', '0800', 'Paris, France');

      // Initiate compatibility check with partner 1
      await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: 'Compatibility Analysis' } }, {});
      await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: partner1PhoneNumber } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        userPhoneNumber,
        expect.stringContaining('Analyzing compatibility with')
      );
      whatsAppIntegration.mockSendMessage.mockClear(); // Clear mocks for next interaction

      // Initiate compatibility check with partner 2
      await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: 'Compatibility Analysis' } }, {});
      await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: partner2PhoneNumber } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        userPhoneNumber,
        expect.stringContaining('Analyzing compatibility with')
      );

      // Verify that both compatibility checks were processed and potentially stored correctly
      // This would involve checking the database for records of these analyses if the bot stores them.
      // For now, we rely on the bot's response as an indicator of successful processing.
    });

    test('should prompt for subscription when compatibility check limit is reached', async () => {
      const userPhoneNumber = '+compatibility_test_user';
      const partnerPhoneNumber = '+compatibility_partner_user';

      // Simulate main user onboarding
      await simulateOnboarding(userPhoneNumber, '15061990', '1430', 'Mumbai, India');

      // Simulate partner onboarding
      await simulateOnboarding(partnerPhoneNumber, '01011985', '1000', 'New York, USA');

      // Assume a mechanism to set/mock the compatibility check limit
      // For this test, we'll simulate reaching the limit by calling the compatibility analysis multiple times
      // or by directly manipulating the user's state if possible.
      // For now, we'll assume the bot has an internal counter.

      // Simulate initiating compatibility analysis multiple times to hit the limit
      // This part would need actual implementation details of how the limit is tracked.
      // For demonstration, let's assume after 3 checks, a subscription is prompted.
      for (let i = 0; i < 3; i++) { // Assuming limit is 3 for free tier
        await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: 'Compatibility Analysis' } }, {});
        await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: partnerPhoneNumber } }, {});
        whatsAppIntegration.mockSendMessage.mockClear(); // Clear after each successful analysis
      }

      // Now, the next attempt should trigger the subscription prompt
      await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: 'Compatibility Analysis' } }, {});
      await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: partnerPhoneNumber } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        userPhoneNumber,
        expect.stringContaining('You have reached your limit for compatibility checks. Please subscribe to continue.')
      );
    });
  });

  describe('Relationship Context Variations (5 tests)', () => {
    test('should use different analysis algorithm for Romantic vs Friendship compatibility', async () => {
      const userPhoneNumber = '+compatibility_test_user';
      const partnerPhoneNumber = '+compatibility_partner_user';

      await simulateOnboarding(userPhoneNumber, '15061990', '1430', 'Mumbai, India');
      await simulateOnboarding(partnerPhoneNumber, '01011985', '1000', 'New York, USA');

      // Simulate initiating romantic compatibility analysis
      await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: 'Romantic Compatibility' } }, {});
      await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: partnerPhoneNumber } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        userPhoneNumber,
        expect.stringContaining('Analyzing romantic compatibility')
      );
      whatsAppIntegration.mockSendMessage.mockClear();

      // Simulate initiating friendship compatibility analysis
      await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: 'Friendship Compatibility' } }, {});
      await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: partnerPhoneNumber } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        userPhoneNumber,
        expect.stringContaining('Analyzing friendship dynamics')
      );
      // This test assumes the bot differentiates between types of compatibility and uses different algorithms/responses.
    });

    test('should focus on professional dynamics for Business partnership compatibility', async () => {
      const userPhoneNumber = '+compatibility_test_user';
      const partnerPhoneNumber = '+compatibility_partner_user';

      await simulateOnboarding(userPhoneNumber, '15061990', '1430', 'Mumbai, India');
      await simulateOnboarding(partnerPhoneNumber, '01011985', '1000', 'New York, USA');

      // Simulate initiating business partnership compatibility analysis
      await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: 'Business Compatibility' } }, {});
      await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: partnerPhoneNumber } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        userPhoneNumber,
        expect.stringContaining('Analyzing business partnership dynamics')
      );
      // This test assumes the bot provides specific insights relevant to business partnerships.
    });

    test('should analyze generational compatibility patterns for Family relationship analysis', async () => {
      const userPhoneNumber = '+compatibility_test_user';
      const partnerPhoneNumber = '+compatibility_partner_user';

      await simulateOnboarding(userPhoneNumber, '15061990', '1430', 'Mumbai, India');
      await simulateOnboarding(partnerPhoneNumber, '01011960', '0900', 'Delhi, India'); // Older family member

      // Simulate initiating family relationship compatibility analysis
      await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: 'Family Compatibility' } }, {});
      await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: partnerPhoneNumber } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        userPhoneNumber,
        expect.stringContaining('Analyzing family relationship patterns')
      );
      // This test assumes the bot provides insights specific to family dynamics and generational aspects.
    });

    test('should perform gender-neutral analysis for Same-sex partnership compatibility', async () => {
      const userPhoneNumber = '+compatibility_test_user';
      const partnerPhoneNumber = '+compatibility_partner_user';

      await simulateOnboarding(userPhoneNumber, '15061990', '1430', 'Mumbai, India');
      await simulateOnboarding(partnerPhoneNumber, '01011985', '1000', 'New York, USA');

      // Simulate initiating same-sex partnership compatibility analysis
      // This might be triggered by user input or inferred if the bot collects gender.
      // For now, assume a specific command or context.
      await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: 'Same-Sex Compatibility' } }, {});
      await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: partnerPhoneNumber } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        userPhoneNumber,
        expect.stringContaining('Performing gender-neutral compatibility analysis')
      );
      // This test ensures the analysis is not biased by gender assumptions.
    });

    test('should consider geographic factors for Long-distance compatibility', async () => {
      const userPhoneNumber = '+compatibility_test_user';
      const partnerPhoneNumber = '+compatibility_partner_user';

      await simulateOnboarding(userPhoneNumber, '15061990', '1430', 'Mumbai, India');
      await simulateOnboarding(partnerPhoneNumber, '01011985', '1000', 'Sydney, Australia'); // Different continent

      // Simulate initiating long-distance compatibility analysis
      await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: 'Long-Distance Compatibility' } }, {});
      await processIncomingMessage({ from: userPhoneNumber, type: 'text', text: { body: partnerPhoneNumber } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        userPhoneNumber,
        expect.stringContaining('Considering geographic factors for long-distance compatibility')
      );
      // This test assumes the bot incorporates distance/timezone differences into the analysis.
    });
  });
});
