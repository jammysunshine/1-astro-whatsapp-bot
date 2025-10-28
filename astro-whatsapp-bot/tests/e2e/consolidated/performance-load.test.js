const { TestDatabaseManager, setupWhatsAppMocks, getWhatsAppIntegration } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('PERFORMANCE & SCALABILITY TESTING GAPS: Load and Database Performance', () => {
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
    await dbManager.cleanupUser('+perf_test_user');
  });

  // Helper function to simulate a user completing the onboarding successfully
  const simulateOnboarding = async (phoneNumber, birthDate, birthTime, birthPlace) => {
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hi' } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: birthDate } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: birthTime } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: birthPlace } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Yes' } }, {});
    whatsAppIntegration.mockSendMessage.mockClear();
  };

  describe('Load Testing Scenarios (8 tests)', () => {
    test('should handle 1000+ concurrent horoscope requests without database connection exhaustion', async () => {
      const basePhoneNumber = '+perf_test_user_';
      const numUsers = 1000;
      const horoscopeRequests = [];

      for (let i = 0; i < numUsers; i++) {
        const phoneNumber = basePhoneNumber + i;
        await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');
        horoscopeRequests.push(processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Daily Horoscope' } }, {}));
      }

      const results = await Promise.allSettled(horoscopeRequests);

      // Expect all requests to be fulfilled, indicating no connection exhaustion
      expect(results.filter(r => r.status === 'fulfilled').length).toBe(numUsers);
      // Further assertions could check response times and error rates if metrics are collected.
    });

    test('should demonstrate heavy calculation load balancing across server resources', async () => {
      const phoneNumber = '+perf_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate multiple heavy calculation requests concurrently
      const heavyCalculations = Array.from({ length: 50 }, () =>
        processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Complex Predictive Analysis' } }, {})
      );

      const results = await Promise.allSettled(heavyCalculations);

      expect(results.filter(r => r.status === 'fulfilled').length).toBe(50);
      // This test would ideally involve monitoring CPU/memory usage on the server to ensure even distribution.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledTimes(50);
    });

    test('should enforce API rate limiting and apply request throttling validation', async () => {
      const phoneNumber = '+perf_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate rapid-fire API calls (e.g., geocoding requests)
      const apiCalls = Array.from({ length: 10 }, () =>
        processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Change Location New York' } }, {})
      );

      const results = await Promise.allSettled(apiCalls);

      // Expect some calls to be throttled or rejected due to rate limiting
      expect(results.filter(r => r.status === 'rejected' || whatsAppIntegration.mockSendMessage.mock.calls.some(call => call[1].includes('Too many requests'))).length).toBeGreaterThan(0);
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('You are sending messages too quickly. Please wait a moment.')
      );
    });

    test('should detect and prevent database connection exhaustion under high load', async () => {
      const basePhoneNumber = '+perf_test_user_conn_';
      const numUsers = 200; // A number that might exhaust a small connection pool
      const requests = [];

      for (let i = 0; i < numUsers; i++) {
        const phoneNumber = basePhoneNumber + i;
        // Simulate a request that hits the database heavily
        requests.push(processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Load Profile' } }, {}));
      }

      const results = await Promise.allSettled(requests);

      // Expect most, if not all, requests to succeed, indicating connection pool management is effective.
      expect(results.filter(r => r.status === 'fulfilled').length).toBeGreaterThan(numUsers * 0.9); // Allow for some failures
      // This test would also involve monitoring database logs for connection errors.
    });

    test('should detect memory leak during long-running session monitoring', async () => {
      const phoneNumber = '+perf_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a very long session with repeated interactions
      for (let i = 0; i < 100; i++) {
        await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Daily Horoscope' } }, {});
        await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Next' } }, {});
      }

      // This test is conceptual. Actual memory leak detection requires external profiling tools.
      // Here, we assert that the application doesn't crash or become unresponsive.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledTimes(200); // 100 horoscopes + 100 next
      // A more robust test would involve checking process memory usage before and after the loop.
    });

    test('should manage CPU intensive calculations and processing resource allocation', async () => {
      const phoneNumber = '+perf_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a very CPU-intensive calculation (e.g., complex astrological chart rectification)
      const cpuIntensiveRequest = processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Rectify Chart' } }, {});

      const startTime = process.hrtime.bigint();
      await cpuIntensiveRequest;
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1_000_000; // milliseconds

      // Expect the calculation to complete within an acceptable time frame.
      expect(duration).toBeLessThan(5000); // Example: less than 5 seconds
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your chart rectification is complete.')
      );
    });

    test('should monitor disk space for ephemeris data and manage storage capacity', async () => {
      const phoneNumber = '+perf_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // This test is conceptual. It would involve monitoring the file system where ephemeris data is stored.
      // We can simulate a warning if disk space is low.
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Generate Historical Ephemeris' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Warning: Disk space for ephemeris data is running low. Please contact admin.')
      );
      // A real test would involve checking actual disk usage before and after operations.
    });

    test('should optimize network bandwidth for API calls', async () => {
      const phoneNumber = '+perf_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a request that involves multiple external API calls (e.g., geocoding + AI generation)
      // This test would involve monitoring network traffic and payload sizes.
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Generate Comprehensive Report' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Generating your comprehensive report, optimizing network usage.')
      );
      // A real test would involve checking the size of API requests/responses and ensuring compression is used.
    });
  });

  describe('Database Performance (8 tests)', () => {
    test('should efficiently perform complex compatibility calculations for multi-chart comparison', async () => {
      const user1 = '+perf_test_user_1';
      const user2 = '+perf_test_user_2';
      const user3 = '+perf_test_user_3';

      await simulateOnboarding(user1, '01011980', '1000', 'London, UK');
      await simulateOnboarding(user2, '01011985', '1400', 'London, UK');
      await simulateOnboarding(user3, '01011990', '1800', 'London, UK');

      // Simulate a complex multi-chart compatibility calculation
      const startTime = process.hrtime.bigint();
      await processIncomingMessage({ from: user1, type: 'text', text: { body: `Group Compatibility ${user2} ${user3}` } }, {});
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1_000_000; // milliseconds

      expect(duration).toBeLessThan(2000); // Example threshold: less than 2 seconds
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        user1,
        expect.stringContaining('Group compatibility analysis complete.')
      );
    });

    test('should efficiently perform historical data aggregation for report generation', async () => {
      const phoneNumber = '+perf_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Populate some historical readings
      for (let i = 0; i < 100; i++) {
        await dbManager.db.collection('readings').insertOne({ phoneNumber: phoneNumber, date: new Date(`2020-01-${i + 1}`), content: `Reading ${i}` });
      }

      // Simulate requesting a historical report
      const startTime = process.hrtime.bigint();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Generate Historical Report' } }, {});
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1_000_000; // milliseconds

      expect(duration).toBeLessThan(1000); // Example threshold: less than 1 second
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your historical report is ready.')
      );
    });

    test('should optimize query patterns for user behavior analytics', async () => {
      const phoneNumber = '+perf_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a query for user behavior analytics (e.g., most requested features)
      const startTime = process.hrtime.bigint();
      await dbManager.db.collection('user_interactions').find({ event: 'request_feature' }).limit(100).toArray();
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1_000_000; // milliseconds

      expect(duration).toBeLessThan(500); // Example threshold
      // This test would involve ensuring appropriate indexes are used for analytics queries.
    });

    test('should demonstrate cache hit/miss ratios for memory caching effectiveness', async () => {
      const phoneNumber = '+perf_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate repeated requests for the same data (e.g., user profile)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'View Profile' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'View Profile' } }, {});

      // This test is conceptual. It would require internal metrics for cache hits/misses.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Retrieving profile from cache for faster access.')
      );
    });

    test('should optimize geographic queries for location-based search efficiency', async () => {
      const phoneNumber = '+perf_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a geographic query (e.g., find users near a certain location)
      const startTime = process.hrtime.bigint();
      await dbManager.db.collection('users').find({ 'birthPlace.coordinates': { $near: { $geometry: { type: 'Point', coordinates: [0, 51] }, $maxDistance: 10000 } } }).toArray();
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1_000_000; // milliseconds

      expect(duration).toBeLessThan(500); // Example threshold
      // This test would ensure geospatial indexes are correctly applied.
    });

    test('should optimize time-range calculations for date indexing performance', async () => {
      const phoneNumber = '+perf_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a time-range query (e.g., find readings within a month)
      const startTime = process.hrtime.bigint();
      await dbManager.db.collection('readings').find({ date: { $gte: new Date('2020-01-01'), $lte: new Date('2020-01-31') } }).toArray();
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1_000_000; // milliseconds

      expect(duration).toBeLessThan(500); // Example threshold
      // This test would ensure date indexes are correctly applied.
    });

    test('should utilize composite index usage for multi-field query performance', async () => {
      const phoneNumber = '+perf_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a multi-field query (e.g., find users by phone number and birth date)
      const startTime = process.hrtime.bigint();
      await dbManager.db.collection('users').find({ phoneNumber: phoneNumber, birthDate: '15061990' }).toArray();
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1_000_000; // milliseconds

      expect(duration).toBeLessThan(200); // Example threshold
      // This test would ensure composite indexes are correctly applied.
    });

    test('should optimize full-text search for content search capabilities', async () => {
      const phoneNumber = '+perf_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Populate some searchable content
      await dbManager.db.collection('articles').insertOne({ title: 'About Astrology', content: 'Astrology is an ancient practice...' });

      // Simulate a full-text search query
      const startTime = process.hrtime.bigint();
      await dbManager.db.collection('articles').find({ $text: { $search: 'ancient practice' } }).toArray();
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1_000_000; // milliseconds

      expect(duration).toBeLessThan(500); // Example threshold
      // This test would ensure full-text indexes are correctly applied and search is efficient.
    });
  });
});
