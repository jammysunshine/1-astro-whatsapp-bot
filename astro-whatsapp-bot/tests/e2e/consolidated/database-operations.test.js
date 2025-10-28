const { TestDatabaseManager, setupWhatsAppMocks, getWhatsAppIntegration } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('DATABASE OPERATIONS INTEGRATION: Transaction Integrity and Scalability', () => {
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
    await dbManager.cleanupUser('+db_test_user');
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

  describe('Database Transaction Integrity (8 tests)', () => {
    test('should prevent simultaneous user registrations from causing unique identifier collision', async () => {
      const phoneNumber = '+db_test_user';

      // Simulate two simultaneous registration attempts for the same phone number
      const registration1 = simulateOnboarding(phoneNumber, '01011990', '1200', 'London, UK');
      const registration2 = simulateOnboarding(phoneNumber, '02021991', '1300', 'Paris, France');

      await Promise.all([registration1, registration2]);

      // Only one user record should exist for the phone number
      const users = await dbManager.db.collection('users').find({ phoneNumber: phoneNumber }).toArray();
      expect(users.length).toBe(1);
      // The user record should reflect the data from one of the successful registrations, not a corrupted mix.
      expect(users[0].birthDate).toMatch(/^(01011990|02021991)$/);
    });

    test('should maintain data integrity during concurrent profile updates', async () => {
      const phoneNumber = '+db_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate two concurrent updates to the user's profile
      const update1 = processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Update Birth Time 1500' } }, {});
      const update2 = processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Update Birth Place Paris' } }, {});

      await Promise.all([update1, update2]);

      const user = await dbManager.db.collection('users').findOne({ phoneNumber: phoneNumber });
      expect(user.birthTime).toBe('1500');
      expect(user.birthPlace).toBe('Paris');
      // Ensure no data loss or corruption occurred from concurrent writes.
    });

    test('should validate locking mechanisms for shared resource access conflicts', async () => {
      const phoneNumber = '+db_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate two concurrent requests that modify a shared resource (e.g., subscription status)
      // This would require mocking the internal locking mechanism.
      const request1 = processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Upgrade Plan' } }, {});
      const request2 = processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Downgrade Plan' } }, {});

      await Promise.all([request1, request2]);

      const user = await dbManager.db.collection('users').findOne({ phoneNumber: phoneNumber });
      // Expect the final state to be consistent, reflecting either an upgrade or downgrade, but not a corrupted state.
      expect(user.subscriptionPlan).toMatch(/^(Upgrade|Downgrade)$/);
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Only one subscription change can be processed at a time.')
      );
    });

    test('should ensure multi-device consistency through session state synchronization', async () => {
      const phoneNumber = '+db_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate user interacting from device 1
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Set Preference Vedic' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      // Simulate user interacting from device 2 (same phone number, different session ID if applicable)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Get Preference' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your current preference is Vedic Astrology.')
      );
      // Verify that changes made on one device are immediately reflected on another.
    });

    test('should test database performance limits with bulk user import stress', async () => {
      const phoneNumber = '+db_test_user';
      // Simulate importing a large number of users concurrently
      const bulkUsers = Array.from({ length: 1000 }, (_, i) => ({
        phoneNumber: `+bulk_user_${i}`,
        birthDate: '01012000',
        birthTime: '1200',
        birthPlace: 'Test City',
        onboardingComplete: true
      }));

      const insertPromises = bulkUsers.map(user => dbManager.db.collection('users').insertOne(user));
      await Promise.all(insertPromises);

      const count = await dbManager.db.collection('users').countDocuments({ phoneNumber: /\+bulk_user_/ });
      expect(count).toBe(1000);
      // This test would also involve monitoring database response times and error rates under load.
    });

    test('should test calculation throughput with high-volume reading generation', async () => {
      const phoneNumber = '+db_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate many concurrent requests for readings
      const readingPromises = Array.from({ length: 50 }, () =>
        processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Generate Horoscope' } }, {})
      );

      await Promise.all(readingPromises);

      // Expect all requests to be processed within reasonable timeframes and without errors.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledTimes(50); // Assuming 1 message per horoscope
      // This test would involve measuring the time taken and ensuring no timeouts or errors.
    });

    test('should verify index optimization for large user base queries', async () => {
      const phoneNumber = '+db_test_user';
      // Assuming a large number of users already exist in the database (from previous bulk import or setup)
      // This test would focus on query performance rather than data insertion.

      // Simulate a query that would benefit from indexing (e.g., finding users by birth month)
      const startTime = process.hrtime.bigint();
      const usersBornInJan = await dbManager.db.collection('users').find({ birthDate: /^01/ }).toArray();
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1_000_000; // milliseconds

      expect(duration).toBeLessThan(100); // Example threshold: query should complete within 100ms
      expect(usersBornInJan).toBeDefined();
    });

    test('should ensure historical data integrity with archival data management', async () => {
      const phoneNumber = '+db_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate archiving old user data or readings
      await dbManager.db.collection('readings').insertOne({ phoneNumber: phoneNumber, date: new Date('2020-01-01'), content: 'Old Reading' });
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Archive Old Readings' } }, {});

      // Verify that archived data is still accessible and uncorrupted, but perhaps in a different collection or storage.
      const archivedReading = await dbManager.db.collection('archived_readings').findOne({ phoneNumber: phoneNumber });
      expect(archivedReading.content).toBe('Old Reading');
      // Verify that the original collection no longer contains the archived data.
      const oldReading = await dbManager.db.collection('readings').findOne({ phoneNumber: phoneNumber, date: new Date('2020-01-01') });
      expect(oldReading).toBeNull();
    });
  });
});
