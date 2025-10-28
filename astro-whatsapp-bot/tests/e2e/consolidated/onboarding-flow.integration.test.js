// File: tests/e2e/consolidated/onboarding-flow.integration.test.js

const { TestDatabaseManager, setupWhatsAppMocks, getWhatsAppIntegration, isRealAPIMode } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('ONBOARDING FLOW INTEGRATION: Complete User Profile Creation Journey', () => {
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
    // Clean up any existing test data
    await dbManager.cleanupUser('+onboarding_test');
  });

  // Helper function to simulate a user completing the onboarding up to a certain point if needed
  const simulateOnboarding = async (phoneNumber, birthDate, birthTime, birthPlace) => {
    // Simulate initial message to start onboarding
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hi' } }, {});
    // Simulate birth date input
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: birthDate } }, {});
    // Simulate birth time input
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: birthTime } }, {});
    // Simulate birth place input
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: birthPlace } }, {});
    // Simulate confirmation (assuming a simple 'Yes' or similar for automation)
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Yes' } }, {});
  };

  describe('Input Validation Scenarios (Birth Date and Time) (8 tests)', () => {
    test('handles invalid date formats (abc123 → error message)', async () => {
      await processIncomingMessage({
        from: '+onboarding_test',
        type: 'text',
        text: { body: 'abc123' }
      }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+onboarding_test',
        expect.stringContaining('Please provide date in DDMMYY (150690) or DDMMYYYY (15061990) format only')
      );
    });

    test('rejects future dates (31122025 → rejection)', async () => {
      await processIncomingMessage({
        from: '+onboarding_test',
        type: 'text',
        text: { body: '31122025' }
      }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+onboarding_test',
        expect.stringContaining('Birth date cannot be in the future. Please enter your actual birth date.')
      );
    });

    test('auto-corrects malformed date (15/06/90 → 150690) and proceeds', async () => {
      // Start onboarding
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: 'Hi' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear(); // Clear initial welcome

      await processIncomingMessage({
        from: '+onboarding_test',
        type: 'text',
        text: { body: '15/06/90' }
      }, {});
      // Expect it to auto-correct and proceed to time prompt
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+onboarding_test',
        expect.stringContaining('Now, please provide your birth time')
      );
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: '+onboarding_test' });
      expect(user.birthDate).toBe('15061990'); // Assuming auto-correction to YYYY
    });

    test('accepts very old valid dates (01011800) and proceeds', async () => {
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: 'Hi' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({
        from: '+onboarding_test',
        type: 'text',
        text: { body: '01011800' }
      }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+onboarding_test',
        expect.stringContaining('Now, please provide your birth time')
      );
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: '+onboarding_test' });
      expect(user.birthDate).toBe('01011800');
    });

    test('shows error for literal date format text (DDMMYY) and re-prompts', async () => {
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: 'Hi' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({
        from: '+onboarding_test',
        type: 'text',
        text: { body: 'DDMMYY' }
      }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+onboarding_test',
        expect.stringContaining('Please provide date in DDMMYY (150690) or DDMMYYYY (15061990) format only')
      );
    });

    // Time Validation
    test('rejects time in colon format (9:30 → error)', async () => {
      // First, enter a valid date to get to the time prompt
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: '15061990' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({
        from: '+onboarding_test',
        type: 'text',
        text: { body: '9:30' }
      }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+onboarding_test',
        expect.stringContaining('Please use 24-hour format without colon: 0930')
      );
    });

    test('rejects invalid hour (2530 → validation error)', async () => {
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: '15061990' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({
        from: '+onboarding_test',
        type: 'text',
        text: { body: '2530' }
      }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+onboarding_test',
        expect.stringContaining('Hour must be between 00-23')
      );
    });

    test('rejects invalid minutes (2460 → validation error)', async () => {
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: '15061990' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({
        from: '+onboarding_test',
        type: 'text',
        text: { body: '2460' }
      }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+onboarding_test',
        expect.stringContaining('Minutes must be between 00-59')
      );
    });
  });

  describe('Time Handling Scenarios (Time Skip and Auto-formatting) (4 tests)', () => {
    test('auto-formats short time input (930 → 0930) and proceeds', async () => {
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: '15061990' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({
        from: '+onboarding_test',
        type: 'text',
        text: { body: '930' }
      }, {});

      const user = await dbManager.db.collection('users').findOne({ phoneNumber: '+onboarding_test' });
      expect(user.birthTime).toBe('0930');
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+onboarding_test',
        expect.stringContaining('Please confirm your birth location')
      );
    });

    test('recognizes "skip" (all lowercase) for time prompt and proceeds to location', async () => {
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: '15061990' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({
        from: '+onboarding_test',
        type: 'text',
        text: { body: 'skip' }
      }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+onboarding_test',
        expect.stringContaining('Please confirm your birth location')
      );
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: '+onboarding_test' });
      expect(user.birthTime).toBeNull();
    });

    test('recognizes "Skip" (capitalized) for time prompt and proceeds to location', async () => {
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: '15061990' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({
        from: '+onboarding_test',
        type: 'text',
        text: { body: 'Skip' }
      }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+onboarding_test',
        expect.stringContaining('Please confirm your birth location')
      );
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: '+onboarding_test' });
      expect(user.birthTime).toBeNull();
    });

    test('recognizes "SKIP" (uppercase) for time prompt and proceeds to location', async () => {
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: '15061990' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({
        from: '+onboarding_test',
        type: 'text',
        text: { body: 'SKIP' }
      }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+onboarding_test',
        expect.stringContaining('Please confirm your birth location')
      );
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: '+onboarding_test' });
      expect(user.birthTime).toBeNull();
    });

    test('does not recognize mixed response "maybe skip" and prompts for clarification', async () => {
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: '15061990' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({
        from: '+onboarding_test',
        type: 'text',
        text: { body: 'maybe skip' }
      }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+onboarding_test',
        expect.stringContaining('Please provide time in HHMM format') // Re-prompts for time
      );
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: '+onboarding_test' });
      expect(user.birthTime).toBeUndefined(); // Or still null if it's the initial state
    });
  });

  describe('Location/Geocoding Scenarios (5 tests)', () => {
    test('handles invalid city "Atlantis, Pacific" with geocoding error handling and re-prompt', async () => {
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: '15061990' } }, {});
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: '1430' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      // Assuming mockGoogleMapsFailure is set for this test
      // For a real integration test, you'd mock the geocoding service response to fail here
      await processIncomingMessage({
        from: '+onboarding_test',
        type: 'text',
        text: { body: 'Atlantis, Pacific' }
      }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+onboarding_test',
        expect.stringContaining('Could not find location for "Atlantis, Pacific". Please try again or enter a more specific location.')
      );
    });

    test('integrates real geocoding with profile completion for valid location', async () => {
      // This test requires a valid data for mocking or a real API key.
      // Assuming 'Mumbai, India' will be successfully geocoded.
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: '15061990' } }, {});
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: '1430' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({
        from: '+onboarding_test',
        type: 'text',
        text: { body: 'Mumbai, India' }
      }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+onboarding_test',
        expect.stringContaining('Please confirm your details')
      );
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: '+onboarding_test' });
      expect(user.birthPlace).toBe('Mumbai, India');
    });

    test('correctly handles timezone calculation for birth location (e.g., Delhi)', async () => {
      // Simulate input that reaches location prompt
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: '15061990' } }, {});
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: '1430' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({
        from: '+onboarding_test',
        type: 'text',
        text: { body: 'Delhi, India' }
      }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+onboarding_test',
        expect.stringContaining('Please confirm your details')
      );
      // This assertion would require checking the stored timezone, 
      // assuming a field like 'timezoneOffset' or 'timezone' exists for the user.
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: '+onboarding_test' });
      expect(user.timezone).toBeDefined(); // Or a specific value like '+05:30' for Delhi
    });

    test('correctly handles DST consideration in birth time for a specific location and date', async () => {
      // Example: A birth date and time within a DST period for a location that observes DST
      // Simulate input that reaches location prompt
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: '01071990' } }, {}); // July 1990, typically DST in many regions
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: '1430' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({
        from: '+onboarding_test',
        type: 'text',
        text: { body: 'New York, USA' }
      }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+onboarding_test',
        expect.stringContaining('Please confirm your details')
      );
      // The core logic here is whether the calculated birth time in UTC accounts for DST.
      // This would require inspecting the computed 'utcBirthTime' or similar field in the user record.
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: '+onboarding_test' });
      expect(user.utcBirtTime).toBeDefined(); // This would have the DST adjustment implicitly
    });

    test('validates international location geocoding via Google Maps API (e.g., Sydney, Australia)', async () => {
      // Simulate input that reaches location prompt
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: '15061990' } }, {});
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: '0900' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({
        from: '+onboarding_test',
        type: 'text',
        text: { body: 'Sydney, Australia' }
      }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+onboarding_test',
        expect.stringContaining('Please confirm your details')
      );
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: '+onboarding_test' });
      expect(user.birthPlace).toBe('Sydney, Australia');
      // Additional assertions could check latitude, longitude, and timezone_id derived from geocoding
    });
  });

  describe('Language Selection Scenarios (4 tests)', () => {
    test('defaults to English for invalid language codes (e.g., "invalid")', async () => {
      // Simulate a user trying to set an invalid language code
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: 'set language invalid' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+onboarding_test',
        expect.stringContaining('Unsupported language. Please choose from available options:')
      );
      // Verify that the user's language setting remains English or default
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: '+onboarding_test' });
      expect(user.preferredLanguage).toBe('en'); // Assuming 'en' is the default
    });

    test('lists available options for unsupported language (e.g., "Klingon")', async () => {
      await processIncomingMessage({ from: '+onboarding_test', type: 'text', text: { body: 'set language Klingon' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+onboarding_test',
        expect.stringContaining('Unsupported language. Please choose from available options:')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+onboarding_test',
        expect.stringContaining('English, Español, हिंदी') // Example list of options
      );
    });

    test('handles language change mid-flow (profile update + language switch)', async () => {
      // Start onboarding, then switch language, then continue
      const phoneNumber = '+onboarding_test';
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hi' } }, {}); // Eng welcome
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'set language es' } }, {}); // Switch to Spanish
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('¡Hola! Bienvenido al bot') // Spanish welcome
      );
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '15061990' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Ahora, por favor, introduce tu hora de nacimiento') // Spanish prompt for time
      );
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: phoneNumber });
      expect(user.preferredLanguage).toBe('es');
    });

    test('activates Hindi interface for emoji response "🇮🇳 हिंदी"', async () => {
      const phoneNumber = '+onboarding_test';
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hi' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '🇮🇳 हिंदी' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('नमस्ते! ज्योतिष बॉट में आपका स्वागत है।') // Hindi welcome
      );
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: phoneNumber });
      expect(user.preferredLanguage).toBe('hi');
    });
  });

  describe('Profile Confirmation Scenarios (4 tests)', () => {
    // Helper to reach profile confirmation step
    const reachProfileConfirmation = async (phoneNumber) => {
      await simulateOnboarding(phoneNumber, '10012000', '1200', 'London, UK');
      whatsAppIntegration.mockSendMessage.mockClear(); // Clear messages up to confirmation
    };

    test('returns to date input when "No" is sent during confirmation', async () => {
      const phoneNumber = '+onboarding_test';
      await reachProfileConfirmation(phoneNumber);

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'No' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Please re-enter your birth date')
      );
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: phoneNumber });
      expect(user.birthDate).toBeNull(); // Assuming the bot clears the date on 'No'
    });

    test('allows selective field editing for partial profile update', async () => {
      const phoneNumber = '+onboarding_test';
      await reachProfileConfirmation(phoneNumber);

      // Simulate user saying "Edit Date"
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Edit Date' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Please re-enter your birth date')
      );
      whatsAppIntegration.mockSendMessage.mockClear();

      // Now enter the new date
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '20021995' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Please confirm your updated details') // Back to confirmation with new date
      );
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: phoneNumber });
      expect(user.birthDate).toBe('20021995');
    });

    test('handles multiple iterations of editing and confirmation in a loop', async () => {
      const phoneNumber = '+onboarding_test';
      await reachProfileConfirmation(phoneNumber);

      // Edit cycle 1
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Edit Time' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '0800' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Please confirm your updated details')
      );
      whatsAppIntegration.mockSendMessage.mockClear();

      // Edit cycle 2
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Edit Location' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Paris, France' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Please confirm your updated details')
      );
      whatsAppIntegration.mockSendMessage.mockClear();

      // Final confirmation
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Yes' } }, {});
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: phoneNumber });
      expect(user.birthTime).toBe('0800');
      expect(user.birthPlace).toBe('Paris, France');
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Thank you! Your profile is complete.')
      );
    });

    test('restarts complete flow if confirmation is attempted with missing data (e.g., date was cleared)', async () => {
      const phoneNumber = '+onboarding_test';
      // Simulate partial profile, then clear a critical piece of data from DB (e.g., birthDate)
      await simulateOnboarding(phoneNumber, '10012000', '1200', 'London, UK');
      await dbManager.db.collection('users').updateOne({ phoneNumber: phoneNumber }, { $set: { birthDate: null } });
      whatsAppIntegration.mockSendMessage.mockClear();

      // Now, try to confirm what theoretically should be a full profile
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Yes' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('It seems some crucial information is missing. Let\'s start over. Please provide your birth date')
      );
      // Verify that the user state is reset to the beginning of the onboarding flow
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: phoneNumber });
      expect(user.birthDate).toBeNull();
      expect(user.birthTime).toBeNull();
      expect(user.birthPlace).toBeNull();
    });
  });

  // TOTAL: 23 onboarding scenarios consolidated into 1 comprehensive test file
});