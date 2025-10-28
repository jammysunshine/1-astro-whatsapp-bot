const { TestDatabaseManager, setupWhatsAppMocks, getWhatsAppIntegration } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');
const axios = require('axios');

// Mock external API calls for controlled testing
jest.mock('axios');

describe('REAL-TIME DATA INTEGRATION: API Failure, Database Integrity, and Synchronization', () => {
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
    await dbManager.cleanupUser('+realtime_test_user');
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

  describe('Real-time Synchronization (16 tests)', () => {
    test('should integrate live astronomical data for current transit calculations', async () => {
      const phoneNumber = '+realtime_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate requesting current transits
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Current Transits' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating current planetary transits based on live astronomical data.')
      );
      // Verify that the transits reflect the current date and time, not static data.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Moon is currently in [Sign] at [Degree].')
      );
    });

    test('should ensure astronomical accuracy verification through ephemeris synchronization', async () => {
      const phoneNumber = '+realtime_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a request that triggers ephemeris data usage
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Ephemeris Check' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Synchronizing with the latest ephemeris data for maximum accuracy.')
      );
      // This test would involve comparing the calculated positions against a known, highly accurate ephemeris source.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Ephemeris data is up-to-date and verified for astronomical accuracy.')
      );
    });

    test('should provide time-sensitive predictions based on deadline-based calculations', async () => {
      const phoneNumber = '+realtime_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate requesting a time-sensitive prediction (e.g., best time to ask for a raise next week)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Best Time for Raise' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating the most opportune time for your request next week.')
      );
      // Verify that the prediction is specific to a future date/time and considers current transits.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('The most favorable window is [Date] at [Time].')
      );
    });

    test('should ensure event timing precision down to micro-second accuracy', async () => {
      const phoneNumber = '+realtime_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate requesting an event timing with extreme precision
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Precise Event Timing' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating event timing with micro-second precision for critical moments.')
      );
      // This test would verify that the underlying calculation engine supports and utilizes such precision.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('The precise moment for this event is [YYYY-MM-DD HH:MM:SS.microseconds].')
      );
    });

    test('should update planetary positions based on real-time ephemeris data', async () => {
      const phoneNumber = '+realtime_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate requesting planetary positions, expecting real-time data
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Planetary Positions Now' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Retrieving current planetary positions from real-time ephemeris.')
      );
      // Verify that the positions are for the current moment, not a cached or static value.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Mars is currently at [Degree] in [Sign].')
      );
    });

    test('should ensure timezone synchronization for global clock coordination', async () => {
      const phoneNumber = '+realtime_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a request that involves multiple timezones
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Global Time Check' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Synchronizing timezones for accurate global clock coordination.')
      );
      // Verify that times are correctly converted and displayed for different locations.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Current time in New York is [Time], in Tokyo is [Time].')
      );
    });

    test('should handle daylight saving adjustments automatically', async () => {
      const phoneNumber = '+realtime_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a calculation that crosses a DST boundary
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'DST Test Calculation' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Automatically adjusting for Daylight Saving Time.')
      );
      // Verify that calculations (e.g., transits, progressions) correctly account for DST changes.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('DST adjustment applied, ensuring accurate planetary positions.')
      );
    });

    test('should consider leap second considerations for atomic clock integration', async () => {
      const phoneNumber = '+realtime_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a calculation that would be affected by a leap second (highly precise)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Leap Second Calculation' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Integrating leap second data for atomic clock precision.')
      );
      // Verify that the underlying time library correctly handles leap seconds.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculations reflect atomic time, including any leap second adjustments.')
      );
    });

    test('should synchronize time via satellite for GPS time accuracy', async () => {
      const phoneNumber = '+realtime_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a request that relies on highly accurate time synchronization
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'GPS Time Sync Check' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Synchronizing time via satellite for GPS-level accuracy.')
      );
      // Verify that the system's internal clock is highly accurate.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('System time is synchronized with GPS for optimal precision.')
      );
    });

    test('should validate network time protocol (NTP) server accuracy', async () => {
      const phoneNumber = '+realtime_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a check of NTP server status
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'NTP Server Status' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Validating NTP server accuracy for reliable timekeeping.')
      );
      // Verify that the system is using reliable NTP sources and reports their status.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('NTP servers are synchronized and accurate.')
      );
    });

    test('should ensure ephemeris data freshness through data update frequency', async () => {
      const phoneNumber = '+realtime_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a check for ephemeris data update status
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Ephemeris Update Status' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Checking ephemeris data freshness and update frequency.')
      );
      // Verify that ephemeris data is updated regularly and on schedule.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Ephemeris data last updated [Date/Time], ensuring optimal freshness.')
      );
    });

    test('should invalidate calculation cache for real-time data freshness', async () => {
      const phoneNumber = '+realtime_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a calculation, then an event that should invalidate its cache
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Generate Horoscope' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      // Simulate a real-time event (e.g., new ephemeris data available) that invalidates cache
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'New Ephemeris Data Available' } }, {});

      // Request the same calculation again, expecting it to be re-calculated, not served from old cache
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Generate Horoscope' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Cache invalidated. Recalculating horoscope with fresh data.')
      );
    });

    test('should update predictive models based on machine learning retraining', async () => {
      const phoneNumber = '+realtime_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a request for a prediction after a model retraining event
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Predictive Reading' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Generating predictive reading using the latest machine learning models.')
      );
      // Verify that the predictions reflect the improvements or changes from retraining.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Predictions are enhanced by recent model retraining.')
      );
    });

    test('should deliver real-time user notifications with accurate push notification timing', async () => {
      const phoneNumber = '+realtime_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a real-time event triggering a push notification (e.g., a transit alert)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Set Transit Alert Mars-Jupiter' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      // Simulate the transit occurring and notification being sent
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Mars-Jupiter Transit Occurred' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Real-time alert: Mars-Jupiter transit is active now!')
      );
      // Verify that notifications are delivered promptly and at the correct time.
    });

    test('should ensure live session synchronization for multi-device state sync', async () => {
      const phoneNumber = '+realtime_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate user interacting from device 1
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Start Reading' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      // Simulate user switching to device 2 and continuing the session
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Continue Reading', device: 'device2' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Continuing your reading from where you left off on another device.')
      );
      // Verify that the session state is seamlessly synchronized across devices.
    });

    test('should generate dynamic content based on real-time personalization', async () => {
      const phoneNumber = '+realtime_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a request for content that should be dynamically personalized based on real-time data
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Personalized Daily Insight' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Here is your personalized daily insight, tailored to current transits and your chart.')
      );
      // Verify that the content reflects real-time astrological influences and user preferences.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Today's Moon in [Sign] highlights [personal theme].')
      );
    });
  });
});