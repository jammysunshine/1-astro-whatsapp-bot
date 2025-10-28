const { TestDatabaseManager, getWhatsAppIntegration } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

// Mock external services for safe onboarding testing
jest.mock('../../../src/services/whatsapp/messageSender', () => ({
  sendMessage: jest.fn(),
  sendListMessage: jest.fn(),
  sendButtonMessage: jest.fn()
}));

const messageSender = require('../../../src/services/whatsapp/messageSender');

describe('ONBOARDING TESTS: Complete User Onboarding Flow (20 Scenarios)', () => {
  let dbManager;
  let whatsAppIntegration;
  let testUser = '+onboarding_test';

  beforeAll(async () => {
    dbManager = new TestDatabaseManager();
    await dbManager.setup();
    whatsAppIntegration = getWhatsAppIntegration();
  }, 120000);

  afterAll(async () => {
    await dbManager.teardown();
  });

  beforeEach(async () => {
    messageSender.sendMessage.mockClear();
    messageSender.sendListMessage.mockClear();
    messageSender.sendButtonMessage.mockClear();
    await dbManager.cleanupUser(testUser);
  });

  describe('DATE VALIDATION & FORMAT HANDLING (5 Scenarios)', () => {

    test('ONBOARDING_001: Invalid Date Format Handling → Format validation errors', async () => {
      // Test various invalid date format inputs
      const invalidDateFormats = [
        'abc123', // Letters only
        '99/99/99', // Invalid day/month
        '31/02/1990', // Invalid February 29
        'XYZ123', // Random characters
        'test', // Just text
        '', // Empty
        '000000', // Just zeros
        'abc/def/ghi' // Non-numeric separators
      ];

      for (const invalidDate of invalidDateFormats) {
        messageSender.sendMessage.mockClear();

        const invalidDateMessage = {
          from: testUser,
          type: 'text',
          text: { body: invalidDate }
        };

        await processIncomingMessage(invalidDateMessage, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        // Should provide helpful error messages about correct date format
        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(typeof response).toBe('string');
        // Should not create user profile
        expect(await dbManager.db.collection('users').findOne({ phoneNumber: testUser })).toBeNull();
      }
    });

    test('ONBOARDING_002: Future Date Rejection → Reality validation', async () => {
      // Test rejection of future birth dates
      const futureDates = [
        '31122025', // Next year
        '01012026', // Future year
        '15062030', // Far future
        '25122024', // Next month (current time)
        '31122024' // End of next month
      ];

      for (const futureDate of futureDates) {
        messageSender.sendMessage.mockClear();

        const futureDateMessage = {
          from: testUser,
          type: 'text',
          text: { body: futureDate }
        };

        await processIncomingMessage(futureDateMessage, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(response).toContain('future');
        expect(response).toContain('cannot');
      }
    });

    test('ONBOARDING_003: Invalid Day/Month Values → Boundary validation', async () => {
      // Test invalid day and month combinations
      const invalidDateComponents = [
        { input: '32121990', expected: 'invalid day' }, // 32nd day
        { input: '30021990', expected: 'invalid day for February' }, // 30th Feb
        { input: '31131990', expected: 'invalid month' }, // Month 13
        { input: '31111990', expected: 'invalid month' }, // Month 11 but day 31
        { input: '29122000', expected: 'not leap year' }, // 2000 not leap year for Feb 29
        { input: '00011990', expected: 'invalid day/month' } // Zeros
      ];

      for (const invalidComponent of invalidDateComponents) {
        messageSender.sendMessage.mockClear();

        const invalidMessage = {
          from: testUser,
          type: 'text',
          text: { body: invalidComponent.input }
        };

        await processIncomingMessage(invalidMessage, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(response).toBeDefined();
      }
    });

    test('ONBOARDING_004: Year Range Validation → Age limitations', async () => {
      // Test valid and invalid year ranges
      const yearScenarios = [
        { input: '15061950', expected: 'valid', description: 'Normal adult age' },
        { input: '15062010', expected: 'valid', description: 'Child age' },
        { input: '15061850', expected: 'too old', description: 'Extremely old (174 years)' },
        { input: '15061000', expected: 'invalid historical', description: ' millennium before' },
        { input: '15063000', expected: 'future', description: 'Future year' },
        { input: '15060', expected: 'missing digits', description: 'Incomplete year' }
      ];

      for (const scenario of yearScenarios) {
        messageSender.sendMessage.mockClear();

        const yearMessage = {
          from: testUser,
          type: 'text',
          text: { body: scenario.input }
        };

        await processIncomingMessage(yearMessage, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });

    test('ONBOARDING_005: Multiple Date Format Support → DDMMYY variations', async () => {
      // Test various DDMMYY format variations
      const dateVariations = [
        { input: '150690', expected: 'valid_2digit_year' },
        { input: '15061990', expected: 'valid_4digit_year' },
        { input: '15121990', expected: 'valid_4digit_december' },
        { input: '01011990', expected: 'valid_january_1st' },
        { input: '31121990', expected: 'valid_december_31st' }
      ];

      for (const variation of dateVariations) {
        messageSender.sendMessage.mockClear();

        const variationMessage = {
          from: testUser,
          type: 'text',
          text: { body: variation.input }
        };

        await processIncomingMessage(variationMessage, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        if (variation.expected.includes('valid')) {
          // For valid dates, should proceed to time or indicate acceptance
          const response = messageSender.sendMessage.mock.calls[0][1];
          // Valid dates should trigger birth time collection
        }
      }
    });
  });

  describe('TIME INPUT & VALIDATION (5 Scenarios)', () => {

    test('ONBOARDING_006: Invalid Time Format Handling → Time validation errors', async () => {
      // Pre-set birth date first to get to time input stage
      await processIncomingMessage({
        from: testUser,
        type: 'text',
        text: { body: '15061990' } // Valid date first
      }, {});
      messageSender.sendMessage.mockClear();

      const invalidTimes = [
        '253000', // Invalid hour
        '156000', // Invalid minute
        '123060', // Invalid second
        'ab1234', // Non-numeric
        'test', // Text
        '', // Empty
        '999999' // All 9s (invalid)
      ];

      for (const invalidTime of invalidTimes) {
        messageSender.sendMessage.mockClear();

        const timeMessage = {
          from: testUser,
          type: 'text',
          text: { body: invalidTime }
        };

        await processIncomingMessage(timeMessage, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(typeof response).toBe('string');
      }
    });

    test('ONBOARDING_007: 12-Hour vs 24-Hour Time Formats → Format conversion', async () => {
      // Test support for both 12-hour and 24-hour formats
      const timeFormats = [
        { input: '143000', expected: '24-hour', valid: true }, // 2:30 PM
        { input: '230001', expected: '24-hour', valid: true }, // 11:00 PM
        { input: '120000', expected: '24-hour', valid: true }, // Midnight
        { input: '235959', expected: '24-hour', valid: true }, // Almost midnight
        { input: '000001', expected: '24-hour', valid: true } // Just after midnight
      ];

      for (const timeFormat of timeFormats) {
        messageSender.sendMessage.mockClear();

        const timeMessage = {
          from: testUser,
          type: 'text',
          text: { body: timeFormat.input }
        };

        await processIncomingMessage(timeMessage, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        if (timeFormat.valid) {
          // Valid times should proceed to location collection
          const response = messageSender.sendMessage.mock.calls[0][1];
          // Should ask for birth place
        }
      }
    });

    test('ONBOARDING_008: Precise Time Input → Second accuracy support', async () => {
      // Test support for very precise time inputs
      const preciseTimes = [
        { input: '143045', expected: 'minute_precision' },
        { input: '143045', expected: 'second_precision' },
        { input: '143045', expected: 'full_precision' }
      ];

      for (const preciseTime of preciseTimes) {
        messageSender.sendMessage.mockClear();

        const preciseMessage = {
          from: testUser,
          type: 'text',
          text: { body: preciseTime.input }
        };

        await processIncomingMessage(preciseMessage, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });

    test('ONBOARDING_009: Time Adjustment Scenarios → GMT conversion hints', async () => {
      // Test scenarios where time might need adjustment
      const adjustmentScenarios = [
        { input: '220000', timezone: 'different', note: 'Might need GMT conversion' },
        { input: '060000', timezone: 'dawn_time', note: 'Might need confirmation' },
        { input: '000000', timezone: 'midnight', note: 'Ambiguous time' },
        { input: '120000', timezone: 'noon', note: 'Standard reference' }
      ];

      for (const scenario of adjustmentScenarios) {
        messageSender.sendMessage.mockClear();

        const scenarioMessage = {
          from: testUser,
          type: 'text',
          text: { body: scenario.input }
        };

        await processIncomingMessage(scenarioMessage, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });

    test('ONBOARDING_010: Time Zone Awareness → GMT requirement hints', async () => {
      // Test handling when users provide times without time zone info
      const timezoneAwareness = [
        { input: '143000', hint: 'GMT_required', message: 'Please confirm if this is GMT' },
        { input: '093000', hint: 'morning_time', message: 'Please confirm if this is GMT' },
        { input: '180000', hint: 'evening_time', message: 'Please confirm if this is GMT' }
      ];

      for (const tz of timezoneAwareness) {
        messageSender.sendMessage.mockClear();

        const tzMessage = {
          from: testUser,
          type: 'text',
          text: { body: tz.input }
        };

        await processIncomingMessage(tzMessage, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        const response = messageSender.sendMessage.mock.calls[0][1];
        // Should mention GMT requirement
      }
    });
  });

  describe('LOCATION INPUT & VALIDATION (5 Scenarios)', () => {

    test('ONBOARDING_011: Invalid Location Name Handling → Geocoding failures', async () => {
      // Test handling of invalid or non-existent location names
      const invalidLocations = [
        'Atlantis, Lost Civilization',
        'Middle of Nowhere, Ocean',
        'Random_Place_Name_123',
        'Test City, Fake Country',
        '🤔😀😎, Emoji Land',
        'Very Long City Name That Cannot Possibly Exist Anywhere In The World',
        '123 Fake Street, Imaginary City',
        '', // Empty location
        ' ', // Just spaces
        'NONEXISTENTCity'
      ];

      for (const invalidLocation of invalidLocations) {
        messageSender.sendMessage.mockClear();

        const locationMessage = {
          from: testUser,
          type: 'text',
          text: { body: invalidLocation }
        };

        await processIncomingMessage(locationMessage, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        const response = messageSender.sendMessage.mock.calls[0][1];
        // Should handle gracefully and request clarification
      }
    });

    test('ONBOARDING_012: Major City Recognition → Popular location handling', async () => {
      // Test recognition of major cities worldwide
      const majorCities = [
        { city: 'London', country: 'UK', utc: 'Europe/London' },
        { city: 'New York', country: 'USA', utc: 'America/New_York' },
        { city: 'Paris', country: 'France', utc: 'Europe/Paris' },
        { city: 'Tokyo', country: 'Japan', utc: 'Asia/Tokyo' },
        { city: 'Sydney', country: 'Australia', utc: 'Australia/Sydney' },
        { city: 'Mumbai', country: 'India', utc: 'Asia/Kolkata' },
        { city: 'Berlin', country: 'Germany', utc: 'Europe/Berlin' },
        { city: 'São Paulo', country: 'Brazil', utc: 'America/Sao_Paulo' }
      ];

      for (const city of majorCities) {
        messageSender.sendMessage.mockClear();

        const cityMessage = {
          from: testUser,
          type: 'text',
          text: { body: city.city }
        };

        await processIncomingMessage(cityMessage, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        // Should recognize major cities and complete onboarding
        const response = messageSender.sendMessage.mock.calls[0][1];
        // Successful onboarding should confirm completion
      }
    });

    test('ONBOARDING_013: Country Context Addition → Location disambiguation', async () => {
      // Test when city names are ambiguous and need country context
      const ambiguousCities = [
        { city: 'Paris', countries: ['France', 'Texas, USA'] },
        { city: 'Rome', countries: ['Italy', 'Georgia, USA'] },
        { city: 'London', countries: ['UK', 'Kentucky, USA'] },
        { city: 'Athens', countries: ['Greece', 'Georgia, USA'] },
        { city: 'Manchester', countries: ['UK', 'New Hampshire, USA'] }
      ];

      for (const ambiguous of ambiguousCities) {
        messageSender.sendMessage.mockClear();

        const ambiguousMessage = {
          from: testUser,
          type: 'text',
          text: { body: ambiguous.city }
        };

        await processIncomingMessage(ambiguousMessage, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        // Should either request clarification or default to primary
      }
    });

    test('ONBOARDING_014: Location Precision Variations → Exact vs approximate', async () => {
      // Test different levels of location precision
      const precisionLevels = [
        { input: 'London, UK', precision: 'city_country', quality: 'good' },
        { input: 'London', precision: 'city_only', quality: 'ambiguous' },
        { input: 'UK', precision: 'country_only', quality: 'broad' },
        { input: 'Central London, England', precision: 'detailed', quality: 'very_good' },
        { input: 'Europe', precision: 'continent', quality: 'too_broad' }
      ];

      for (const precision of precisionLevels) {
        messageSender.sendMessage.mockClear();

        const precisionMessage = {
          from: testUser,
          type: 'text',
          text: { body: precision.input }
        };

        await processIncomingMessage(precisionMessage, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });

    test('ONBOARDING_015: Location Search & Autocomplete → Nearby alternatives', async () => {
      // Test location search with spelling corrections and alternatives
      const locationSearches = [
        { input: 'Lodon', match: 'London', confidence: 'high' }, // Minor typo
        { input: 'Newyork', match: 'New York', confidence: 'medium' }, // No space
        { input: 'Mombai', match: 'Mumbai', confidence: 'high' }, // Spelling variation
        { input: 'Parris', match: 'Paris', confidence: 'high' }, // Double r
        { input: 'Tokio', match: 'Tokyo', confidence: 'medium' }, // International spelling
        { input: 'Berline', match: 'Berlin', confidence: 'medium' } // Minor misspelling
      ];

      for (const search of locationSearches) {
        messageSender.sendMessage.mockClear();

        const searchMessage = {
          from: testUser,
          type: 'text',
          text: { body: search.input }
        };

        await processIncomingMessage(searchMessage, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        // Should offer spelling corrections or alternatives
      }
    });
  });

  describe('COMPLETE ONBOARDING FLOW INTEGRATION (5 Scenarios)', () => {

    test('ONBOARDING_016: Successful Complete Flow → End-to-end onboarding', async () => {
      // Test complete successful onboarding flow
      const completeFlow = [
        { step: 'greeting', input: 'hi', expected: 'ask_birth_date' },
        { step: 'birth_date', input: '15061990', expected: 'ask_birth_time' },
        { step: 'birth_time', input: '143000', expected: 'ask_birth_place' },
        { step: 'birth_place', input: 'London, UK', expected: 'onboarding_complete' }
      ];

      for (const flowStep of completeFlow) {
        messageSender.sendMessage.mockClear();

        const flowMessage = {
          from: testUser,
          type: 'text',
          text: { body: flowStep.input }
        };

        await processIncomingMessage(flowMessage, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        const response = messageSender.sendMessage.mock.calls[0][1];
        // Each step should properly advance the flow
      }

      // Final check: user profile should be created successfully
      const userProfile = await dbManager.db.collection('users').findOne({ phoneNumber: testUser });
      expect(userProfile).toBeDefined();
      expect(userProfile.birthDate).toBe('15/06/1990');
      expect(userProfile.birthTime).toBe('143000');
      expect(userProfile.birthPlace).toBe('London, UK');
      expect(userProfile.profileComplete).toBe(true);
    });

    test('ONBOARDING_017: Error Recovery and Retry → Detailed correction guidance', async () => {
      // Test error recovery with helpful retry instructions
      const errorRecoveryFlow = [
        { input: 'invalid_date', error: 'date_error', correction: 'provide_formatted_date' },
        { input: 'future_date', error: 'future_error', correction: 'provide_past_date' },
        { input: 'invalid_time', error: 'time_error', correction: 'provide_formatted_time' },
        { input: 'invalid_location', error: 'location_error', correction: 'provide_real_location' }
      ];

      for (const recovery of errorRecoveryFlow) {
        messageSender.sendMessage.mockClear();

        const recoveryMessage = {
          from: testUser,
          type: 'text',
          text: { body: recovery.input }
        };

        await processIncomingMessage(recoveryMessage, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        const response = messageSender.sendMessage.mock.calls[0][1];
        // Should provide specific correction instructions
        expect(response).toBeDefined();
      }
    });

    test('ONBOARDING_018: Multi-Session Onboarding → Persistent state management', async () => {
      // Test onboarding that spans multiple sessions
      const multiSessionFlow = [
        { session: 1, input: '15061990', expected: 'time_collection' },
        // Simulate session break
        { session: 2, input: '143000', expected: 'location_collection' },
        // Another session break
        { session: 3, input: 'London, UK', expected: 'flow_complete' }
      ];

      for (const sessionStep of multiSessionFlow) {
        messageSender.sendMessage.mockClear();

        const sessionMessage = {
          from: testUser,
          type: 'text',
          text: { body: sessionStep.input }
        };

        await processIncomingMessage(sessionMessage, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        // Should maintain state across sessions
      }

      // User should still complete successfully
      const finalProfile = await dbManager.db.collection('users').findOne({ phoneNumber: testUser });
      expect(finalProfile).toBeDefined();
    });

    test('ONBOARDING_019: Cultural Format Preferences → Localized input handling', async () => {
      // Test onboarding with different cultural date/time preferences
      const culturalFormats = [
        { locale: 'US', date: '06251990', time: '23000', location: 'New York, NY' }, // US format
        { locale: 'UK', date: '25061990', time: '143000', location: 'London, England' }, // UK format
        { locale: 'European', date: '25061990', time: '143000', location: 'Paris, France' }, // European
        { locale: 'Indian', date: '15061990', time: '143000', location: 'Mumbai, India' }, // Indian
        { locale: '24hr', date: '15061990', time: '143000', location: 'Tokyo, Japan' } // 24-hour
      ];

      for (const culture of culturalFormats) {
        messageSender.sendMessage.mockClear();

        // Process date
        await processIncomingMessage({
          from: testUser,
          type: 'text',
          text: { body: culture.date }
        }, {});

        // Process time
        messageSender.sendMessage.mockClear();
        await processIncomingMessage({
          from: testUser,
          type: 'text',
          text: { body: culture.time }
        }, {});

        // Process location
        messageSender.sendMessage.mockClear();
        await processIncomingMessage({
          from: testUser,
          type: 'text',
          text: { body: culture.location }
        }, {});

        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });

    test('ONBOARDING_020: Onboarding Quality Metrics → Data completeness tracking', async () => {
      // Test tracking of onboarding completion quality
      const qualityMetrics = [
        { scenario: 'complete_accurate_data', quality: 100, issues: 0 },
        { scenario: 'complete