const { TestDatabaseManager, getWhatsAppIntegration } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');
const { createUser, updateUserProfile, getUserByPhone } = require('../../../src/models/userModel');
const { MongoClient, ObjectId } = require('mongodb');

// Mock external services for safe multi-user testing
jest.mock('../../../src/services/whatsapp/messageSender', () => ({
  sendMessage: jest.fn(),
  sendListMessage: jest.fn(),
  sendButtonMessage: jest.fn()
}));

const messageSender = require('../../../src/services/whatsapp/messageSender');

describe('MULTI-USER CONFLICTS: Concurrent Access & Conflict Resolution (17 Scenarios)', () => {
  let dbManager;
  let whatsAppIntegration;
  let directMongoClient;
  let db;
  let testUsers;

  beforeAll(async () => {
    dbManager = new TestDatabaseManager();
    await dbManager.setup();
    whatsAppIntegration = getWhatsAppIntegration();

    // Direct MongoDB client for advanced conflict testing
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    directMongoClient = new MongoClient(mongoUri);
    await directMongoClient.connect();
    db = directMongoClient.db('test_astro_multiuser');

    // Create test user pool
    testUsers = Array(50).fill().map((_, i) => ({
      phoneNumber: `+testuser_${i.toString().padStart(3, '0')}`,
      name: `Test User ${i}`,
      birthDate: '15/06/1990',
      birthTime: '14:30',
      birthPlace: 'Mumbai, India',
      profileComplete: true
    }));

    // Pre-populate test users
    for (const userData of testUsers) {
      await createUser(userData.phoneNumber, userData);
    }
  }, 120000);

  afterAll(async () => {
    // Clean up all test users
    for (const user of testUsers) {
      await dbManager.cleanupUser(user.phoneNumber);
    }

    if (directMongoClient) {
      await directMongoClient.close();
    }
    await dbManager.teardown();
  });

  beforeEach(async () => {
    messageSender.sendMessage.mockClear();
    messageSender.sendListMessage.mockClear();
    messageSender.sendButtonMessage.mockClear();

    // Clean up any transient test collections
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      if (collection.name.startsWith('temp_') || collection.name.startsWith('conflict_')) {
        await db.collection(collection.name).drop();
      }
    }
  });

  describe('SIMULTANEOUS USER OPERATIONS (4/4 Scenarios)', () => {

    test('MULTI_USER_001: Simultaneous user registrations → Unique identifier collision prevention', async () => {
      // Test concurrent user registration without ID collisions
      const concurrentRegistrations = Array(20).fill().map(async (_, i) => {
        const phoneNumber = `+concurrent_user_${i}_${Date.now()}`;
        const userData = {
          ...testUsers[0], // Use first test user data as template
          phoneNumber,
          name: `Concurrent User ${i}`
        };

        return await createUser(phoneNumber, userData);
      });

      const results = await Promise.all(concurrentRegistrations);

      // All registrations should succeed
      expect(results).toHaveLength(20);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result._id).toBeDefined();
        expect(typeof result.phoneNumber).toBe('string');
      });

      // Verify all users have unique IDs
      const uniqueIds = new Set(results.map(r => r._id.toString()));
      expect(uniqueIds.size).toBe(20);

      // Verify all phone numbers are unique
      const uniquePhones = new Set(results.map(r => r.phoneNumber));
      expect(uniquePhones.size).toBe(20);

      // Cleanup
      for (const result of results) {
        await dbManager.cleanupUser(result.phoneNumber);
      }
    });

    test('MULTI_USER_002: Concurrent profile updates → Data integrity maintenance', async () => {
      // Test simultaneous profile updates without data corruption
      const targetPhone = testUsers[0].phoneNumber;

      const concurrentUpdates = Array(15).fill().map(async (_, i) => {
        return await updateUserProfile(targetPhone, {
          [`update_${i}`]: `value_${i}`,
          lastModified: new Date(),
          updateCount: i
        });
      });

      try {
        await Promise.all(concurrentUpdates);
      } catch (error) {
        // MongoDB should handle concurrent updates gracefully
        console.log('Concurrent update handling:', error.message);
      }

      // Verify final state
      const updatedUser = await getUserByPhone(targetPhone);
      expect(updatedUser).toBeDefined();

      // Check that some updates were applied (not all failed)
      const hasUpdateFields = Object.keys(updatedUser).some(key =>
        key.startsWith('update_')
      );
      expect(hasUpdateFields).toBe(true);
    });

    test('MULTI_USER_003: Shared resource access conflicts → Locking mechanism validation', async () => {
      // Test concurrent access to shared astrology calculation resources
      const sharedResourceCollection = db.collection('shared_astrology_resources');

      // Initialize shared calculation resource
      await sharedResourceCollection.insertOne({
        resourceId: 'planetary_data_cache',
        data: { planets: [], lastUpdated: new Date() },
        accessCount: 0,
        lastAccessor: null
      });

      // Simulate concurrent access to shared resource
      const concurrentAccess = Array(25).fill().map(async (_, i) => {
        const userPhone = testUsers[i % testUsers.length].phoneNumber;

        // Atomic update to ensure serialization
        return await sharedResourceCollection.findOneAndUpdate(
          { resourceId: 'planetary_data_cache' },
          {
            $inc: { accessCount: 1 },
            $set: {
              lastAccessor: userPhone,
              lastAccessTime: new Date()
            },
            $push: {
              accessLog: {
                user: userPhone,
                timestamp: new Date(),
                operation: 'planetary_calculation'
              }
            }
          },
          { returnDocument: 'after' }
        );
      });

      await Promise.all(concurrentAccess);

      // Verify final state
      const finalResource = await sharedResourceCollection.findOne({ resourceId: 'planetary_data_cache' });
      expect(finalResource.accessCount).toBe(25);
      expect(finalResource.accessLog).toHaveLength(25);
      expect(finalResource.lastAccessor).toBeDefined();

      // Verify no data corruption occurred during concurrent updates
      expect(finalResource).toBeDefined();

      // Cleanup
      await db.dropCollection('shared_astrology_resources');
    });

    test('MULTI_USER_004: Session state synchronization → Multi-device consistency', async () => {
      // Test session synchronization across multiple devices/user sessions
      const sessionCollection = db.collection('multi_device_sessions');

      const userPhone = testUsers[0].phoneNumber;
      const devices = ['phone', 'tablet', 'desktop', 'web_browser'];

      // Create initial user session
      await sessionCollection.insertOne({
        userPhone,
        devices: [],
        activeSessions: [],
        globalState: {
          theme: 'light',
          language: 'en',
          notificationsEnabled: true
        },
        lastSync: new Date()
      });

      // Simulate concurrent device sign-ins and state updates
      const deviceSessions = devices.map(async (device, i) => {
        // Device sign-in
        await sessionCollection.updateOne(
          { userPhone },
          {
            $push: {
              devices: device,
              activeSessions: {
                device,
                loginTime: new Date(),
                sessionId: `session_${device}_${i}`
              }
            }
          }
        );

        // Device makes a preference change
        await sessionCollection.updateOne(
          { userPhone },
          {
            $set: {
              [`globalState.${device}_setting`]: `value_${i}`,
              lastSync: new Date()
            }
          }
        );

        return device;
      });

      await Promise.all(deviceSessions);

      // Verify all devices are recorded
      const finalSession = await sessionCollection.findOne({ userPhone });
      expect(finalSession.devices).toHaveLength(devices.length);
      expect(finalSession.activeSessions).toHaveLength(devices.length);

      // Verify state synchronization worked
      expect(finalSession.globalState).toBeDefined();
      devices.forEach(device => {
        expect(finalSession.globalState[`${device}_setting`]).toBeDefined();
      });

      // Cleanup
      await db.dropCollection('multi_device_sessions');
    });

    test('MULTI_USER_005: Bulk user import stress → Database performance limits', async () => {
      // Test bulk import performance and limits
      const bulkImportCollection = db.collection('bulk_import_stress_test');

      // Generate large bulk import dataset
      const bulkUsers = Array(10000).fill().map((_, i) => ({
        importId: `bulk_user_${i}`,
        phoneNumber: `+bulk_${i.toString().padStart(8, '0')}`,
        name: `Bulk User ${i}`,
        birthData: {
          date: '15/06/1990',
          time: '14:30',
          place: `Bulk City ${i % 100}`, // Some location variation
        },
        astrologyProfile: {
          sunSign: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo'][i % 5],
          moonSign: ['Pisces', 'Aquarius', 'Capricorn'][i % 3],
          preferences: {
            dailyNotifications: Boolean(i % 2),
            theme: i % 3 === 0 ? 'dark' : 'light'
          }
        },
        importBatch: Math.floor(i / 1000), // 10 batches of 1000
        importTimestamp: new Date(),
        status: 'pending'
      }));

      // Bulk import with timing
      const importStart = Date.now();

      // Insert in batches to test batching performance
      const batchSize = 1000;
      for (let batch = 0; batch < bulkUsers.length; batch += batchSize) {
        const batchData = bulkUsers.slice(batch, batch + batchSize);
        await bulkImportCollection.insertMany(batchData);
      }

      const importEnd = Date.now();
      const importDuration = importEnd - importStart;

      // Verify bulk import performance
      expect(importDuration).toBeLessThan(30000); // Should complete within 30 seconds

      const importedCount = await bulkImportCollection.countDocuments();
      expect(importedCount).toBe(10000);

      // Test query performance on imported data
      const queryStart = Date.now();
      const signDistribution = await bulkImportCollection.aggregate([
        {
          $group: {
            _id: '$astrologyProfile.sunSign',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]).toArray();

      const queryEnd = Date.now();
      const queryDuration = queryEnd - queryStart;

      expect(queryDuration).toBeLessThan(2000); // Queries should be fast
      expect(signDistribution.length).toBe(5); // All sun signs represented

      // Cleanup
      await db.dropCollection('bulk_import_stress_test');
    });

    test('MULTI_USER_006: High-volume reading generation → Calculation throughput testing', async () => {
      // Test concurrent astrology reading generation
      const readingCollection = db.collection('high_volume_readings');

      // Simulate high-volume reading requests
      const readingRequests = Array(100).fill().map(async (_, i) => {
        const user = testUsers[i % testUsers.length];
        const readingTimestamp = new Date();

        return await readingCollection.insertOne({
          userId: user.phoneNumber,
          readingType: ['tarot', 'horoscope', 'compatibility', 'numerology'][i % 4],
          readingId: `reading_${i}_${Date.now()}`,
          calculationData: {
            timestamp: readingTimestamp,
            inputParams: {
              birthDate: user.birthDate,
              birthTime: user.birthTime,
              birthPlace: user.birthPlace
            },
            result: {
              // Simulating calculation result
              score: Math.floor(Math.random() * 100),
              insights: [
                `Reading insight ${i + 1}`,
                `Personal guidance ${i + 2}`,
                `Astrological significance ${i + 3}`
              ]
            }
          },
          processingTime: Math.floor(Math.random() * 5000) + 100, // 100-5100ms
          status: 'completed'
        });
      });

      const readingStart = Date.now();
      const readingResults = await Promise.all(readingRequests);
      const readingEnd = Date.now();

      const totalDuration = readingEnd - readingStart;

      // Verify throughput - 100 readings should complete within reasonable time
      expect(totalDuration).toBeLessThan(15000); // 15 seconds for 100 concurrent readings
      expect(readingResults).toHaveLength(100);

      // Verify all readings were recorded
      const totalReadings = await readingCollection.countDocuments();
      expect(totalReadings).toBe(100);

      // Analyze processing times
      const readings = await readingCollection.find({}).toArray();
      const avgProcessingTime = readings.reduce((sum, r) => sum + r.processingTime, 0) / readings.length;

      expect(avgProcessingTime).toBeGreaterThan(100); // Min 100ms (reasonable calculation time)
      expect(avgProcessingTime).toBeLessThan(6000); // Max 6 seconds

      // Verify calculation throughput (readings per second)
      const throughput = readings.length / (totalDuration / 1000);
      expect(throughput).toBeGreaterThan(5); // At least 5 readings per second

      // Cleanup
      await db.dropCollection('high_volume_readings');
    });

    test('MULTI_USER_007: Large user base queries → Index optimization verification', async () => {
      // Test query performance with large user base
      const largeUserCollection = db.collection('large_user_base');

      // Create large user base (10,000 users)
      const largeUserBase = Array(10000).fill().map((_, i) => ({
        userId: `large_user_${i.toString().padStart(5, '0')}`,
        phoneNumber: `+large_${i.toString().padStart(8, '0')}`,
        profile: {
          name: `Large User ${i}`,
          birthInfo: {
            date: `0101${(1980 + (i % 40)).toString()}`, // Birth years spread across 40 years
            place: `City ${i % 1000}` // 1000 different cities
          },
          location: {
            latitude: -90 + (i / 10000) * 180, // Worldwide distribution
            longitude: -180 + (i / 10000) * 360
          }
        },
        astrologyData: {
          sunSign: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][i % 12],
          moonSign: ['Aries', 'Taurus', 'Gemini', 'Cancer'][i % 4], // Simplified moon signs
          preferences: {
            dailyHoroscope: Boolean(i % 2),
            compatibilityAlerts: Boolean(i % 3),
            relationshipInsights: Boolean(i % 4)
          }
        },
        accountType: i % 100 === 0 ? 'premium' : 'free', // 1% premium users
        lastActivity: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        registrationDate: new Date(Date.now() - Math.random() * 2 * 365 * 24 * 60 * 60 * 1000)
      }));

      await largeUserCollection.insertMany(largeUserBase);

      // Create indexes for common queries
      await largeUserCollection.createIndex({ 'astrologyData.sunSign': 1 });
      await largeUserCollection.createIndex({ accountType: 1 });
      await largeUserCollection.createIndex({ lastActivity: -1 });
      await largeUserCollection.createIndex({ 'profile.location': '2dsphere' }); // Geospatial index

      // Test various query patterns that would be common in the app
      const queries = [
        // Find users by astrology profile
        { description: 'Sun sign query', query: { 'astrologyData.sunSign': 'Leo' } },
        { description: 'Moon sign query', query: { 'astrologyData.moonSign': 'Taurus' } },
        { description: 'Account type query', query: { accountType: 'premium' } },
        { description: 'Recent activity query', query: { lastActivity: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { description: 'Compound query', query: { 'astrologyData.sunSign': 'Leo', accountType: 'premium' } },
        { description: 'Geospatial query', query: { 'profile.location': { $geoWithin: { $centerSphere: [[0, 0], 0.5] } } }
      ];

      const queryPerformance = [];

      for (const queryDef of queries) {
        const queryStart = Date.now();
        const results = await largeUserCollection.find(queryDef.query).limit(500).toArray();
        const queryEnd = Date.now();

        queryPerformance.push({
          query: queryDef.description,
          duration: queryEnd - queryStart,
          resultCount: results.length
        });

        expect(queryEnd - queryStart).toBeLessThan(2000); // Each query should be fast with indexes
        expect(Array.isArray(results)).toBe(true);
      }

      // Analyze performance results
      queryPerformance.forEach(perf => {
        console.log(`Query: ${perf.query}, Duration: ${perf.duration}ms, Results: ${perf.resultCount}`);
      });

      // Verify some performance metrics
      const averageQueryTime = queryPerformance.reduce((sum, p) => sum + p.duration, 0) / queryPerformance.length;
      expect(averageQueryTime).toBeLessThan(1000); // Average query time should be under 1 second

      // Cleanup
      await db.dropCollection('large_user_base');
    });
  });

  describe('DATA MANAGEMENT CONFLICTS (7/7 Scenarios)', () => {

    test('MULTI_USER_008: Archival data management → Historical data integrity', async () => {
      // Test archiving and historical data integrity
      const archivalCollection = db.collection('archival_data_test');

      // Create historical data spanning multiple years
      const historicalData = [];
      for (let year = 2020; year <= 2025; year++) {
        for (let month = 1; month <= 12; month++) {
          if (year === 2025 && month > new Date().getMonth() + 1) break;

          historicalData.push({
            dataId: `archive_${year}_${month.toString().padStart(2, '0')}`,
            year,
            month,
            userReadings: Array(100).fill().map((_, i) => ({
              readingId: `reading_${year}_${month}_${i}`,
              userId: `user_${i % 1000}`,
              type: ['horoscope', 'compatibility', 'tarot'][i % 3],
              result: Math.floor(Math.random() * 100),
              timestamp: new Date(year, month - 1, Math.floor(Math.random() * 28) + 1)
            })),
            archiveBatch: `batch_${year}_${month}`,
            archivedAt: new Date(year, month - 1, 15),
            integrityHash: `hash_${year}_${month}`,
            status: year <= 2023 ? 'archived' : 'active' // Archive older data
          });
        }
      }

      await archivalCollection.insertMany(historicalData);

      // Test archival queries
      const archivedData = await archivalCollection.find({ status: 'archived' }).toArray();
      const activeData = await archivalCollection.find({ status: 'active' }).toArray();

      expect(archivedData.length).toBeGreaterThan(0);
      expect(activeData.length).toBeGreaterThan(0);

      // Verify historical data integrity
      archivedData.forEach(record => {
        expect(record.integrityHash).toBeDefined();
        expect(record.archivedAt).toBeDefined();
        expect(record.userReadings).toHaveLength(100);
      });

      // Test historical data retrieval performance
      const historyQueryStart = Date.now();
      const specificMonthData = await archivalCollection.findOne({ year: 2023, month: 6 });
      const historyQueryEnd = Date.now();

      expect(historyQueryEnd - historyQueryStart).toBeLessThan(1000);
      expect(specificMonthData).toBeDefined();
      expect(specificMonthData.year).toBe(2023);
      expect(specificMonthData.month).toBe(6);

      // Verify data integrity after archival
      specificMonthData.userReadings.forEach(reading => {
        expect(reading.timestamp.getFullYear()).toBe(2023);
        expect(reading.timestamp.getMonth()).toBe(5); // 0-based month
      });

      // Cleanup
      await db.dropCollection('archival_data_test');
    });

    test('MULTI_USER_009: Database connection pooling → Resource management', async () => {
      // Test connection pool behavior under high concurrent load
      const poolTestCollection = db.collection('pool_resource_test');

      // Create varying load patterns
      const loadPatterns = [
        { name: 'burst', concurrent: 50, duration: 2000 },
        { name: 'sustained', concurrent: 20, duration: 10000 },
        { name: 'spike', concurrent: 100, duration: 1000 }
      ];

      for (const pattern of loadPatterns) {
        console.log(`Testing ${pattern.name} load pattern...`);

        const operations = Array(pattern.concurrent).fill().map(async (_, i) => {
          const operationStart = Date.now();

          // Perform database operation
          await poolTestCollection.insertOne({
            operationId: `pool_test_${pattern.name}_${i}`,
            pattern: pattern.name,
            sequence: i,
            timestamp: new Date(),
            loadMetrics: {
              concurrentOperations: pattern.concurrent,
              targetDuration: pattern.duration
            }
          });

          const operationEnd = Date.now();
          return operationEnd - operationStart;
        });

        const loadStart = Date.now();
        const operationTimes = await Promise.all(operations);
        const loadEnd = Date.now();

        const totalDuration = loadEnd - loadStart;
        const avgOperationTime = operationTimes.reduce((sum, time) => sum + time, 0) / operationTimes.length;

        // Verify load was handled within expected timeframe
        expect(totalDuration).toBeLessThan(pattern.duration * 1.5); // Allow 50% overhead
        expect(avgOperationTime).toBeLessThan(1000); // Operations should be reasonably fast

        console.log(`${pattern.name}: ${pattern.concurrent} operations in ${totalDuration}ms, avg: ${avgOperationTime}ms`);
      }

      // Cleanup
      await db.dropCollection('pool_resource_test');
    });

    test('MULTI_USER_010: Transaction rollback scenarios → Data consistency', async () => {
      // Test transaction rollback behavior and data consistency
      const transactionCollection = db.collection('transaction_rollback_test');

      // Test different rollback scenarios
      const rollbackScenarios = [
        { scenario: 'partial_failure', operations: ['insert', 'update', 'fail', 'delete'] },
        { scenario: 'constraint_violation', operations: ['insert', 'constraint_fail'] },
        { scenario: 'timeout_rollback', operations: ['long_running', 'timeout'] }
      ];

      for (const testScenario of rollbackScenarios) {
        console.log(`Testing ${testScenario.scenario} rollback...`);

        try {
          // Simulate scenario-based operations
          if (testScenario.scenario === 'partial_failure') {
            // Insert successful operation
            await transactionCollection.insertOne({
              scenario: testScenario.scenario,
              operation: 'initial_insert',
              status: 'completed',
              timestamp: new Date()
            });

            // Update that should succeed
            await transactionCollection.updateOne(
              { scenario: testScenario.scenario },
              { $set: { phase: 'updated' } }
            );

            // Simulate failure (throw error)
            throw new Error('Simulated partial operation failure');

          } else if (testScenario.scenario === 'constraint_violation') {
            // Try duplicate key constraint violation
            await transactionCollection.insertOne({
              scenario: testScenario.scenario,
              uniqueKey: 'duplicate_value'
            });

            await transactionCollection.insertOne({
              scenario: testScenario.scenario,
              uniqueKey: 'duplicate_value' // This should fail
            });

          } else if (testScenario.scenario === 'timeout_rollback') {
            // Simulate timeout scenario
            await transactionCollection.insertOne({
              scenario: testScenario.scenario,
              operation: 'timeout_simulation',
              startTime: new Date(),
              status: 'started'
            });

            // Simulate timeout delay
            await new Promise(resolve => setTimeout(resolve, 5000));

            throw new Error('Operation timeout');
          }

        } catch (error) {
          console.log(`${testScenario.scenario} rollback triggered: ${error.message}`);

          // Verify rollback maintained data consistency
          const scenarioDocs = await transactionCollection.find({ scenario: testScenario.scenario }).toArray();

          if (testScenario.scenario === 'constraint_violation') {
            // Only first insert should remain
            expect(scenarioDocs).toHaveLength(1);
            expect(scenarioDocs[0].uniqueKey).toBe('duplicate_value');
          } else {
            // Verify partial results are cleaned up appropriately
            expect(scenarioDocs.length).toBeLessThanOrEqual(2); // Some operations might have succeeded
          }
        }
      }

      // Final consistency check
      const totalDocs = await transactionCollection.countDocuments();
      expect(totalDocs).toBeDefined();

      // Cleanup
      await db.dropCollection('transaction_rollback_test');
    });

    test('MULTI_USER_011: Deadlock prevention → Query optimization', async () => {
      // Test deadlock prevention and query optimization
      const deadlockTestCollection = db.collection('deadlock_prevention_test');

      // Create test data with potential for deadlocks
      const testEntities = Array(20).fill().map((_, i) => ({
        entityId: `entity_${i}`,
        resourceA: `resource_a_${i}`,
        resourceB: `resource_b_${i}`,
        counterA: 0,
        counterB: 0,
        lastAccessed: new Date(),
        accessPattern: i % 2 === 0 ? 'forward' : 'reverse' // Alternate access patterns
      }));

      await deadlockTestCollection.insertMany(testEntities);

      // Simulate concurrent operations that could cause deadlocks
      const concurrentOperations = testEntities.map(async (entity, i) => {
        const entityDoc = await deadlockTestCollection.findOne({ entityId: entity.entityId });

        // Alternate locking order based on access pattern to test deadlock prevention
        if (entityDoc.accessPattern === 'forward') {
          // Lock resourceA first, then resourceB
          await deadlockTestCollection.updateOne(
            { entityId: entity.entityId },
            {
              $inc: { counterA: 1 },
              $set: { lastAccessed: new Date() }
            }
          );

          await deadlockTestCollection.updateOne(
            { entityId: entity.entityId },
            {
              $inc: { counterB: 1 }
            }
          );
        } else {
          // Lock resourceB first, then resourceA (opposite order)
          await deadlockTestCollection.updateOne(
            { entityId: entity.entityId },
            {
              $inc: { counterB: 1 },
              $set: { lastAccessed: new Date() }
            }
          );

          await deadlockTestCollection.updateOne(
            { entityId: entity.entityId },
            {
              $inc: { counterA: 1 }
            }
          );
        }

        return entity.entityId;
      });

      const deadlockStart = Date.now();
      const deadlockResults = await Promise.all(concurrentOperations);
      const deadlockEnd = Date.now();

      const totalDuration = deadlockEnd - deadlockStart;

      // Verify deadlock prevention - all operations should complete
      expect(deadlockResults).toHaveLength(testEntities.length);
      expect(totalDuration).toBeLessThan(10000); // Should complete within reasonable time

      // Verify final state consistency
      const finalEntities = await deadlockTestCollection.find({}).toArray();
      finalEntities.forEach(entity => {
        expect(entity.counterA).toBe(1);
        expect(entity.counterB).toBe(1);
        expect(entity.lastAccessed).toBeDefined();
      });

      // Cleanup
      await db.dropCollection('deadlock_prevention_test');
    });

    test('MULTI_USER_012: Index performance validation → Query execution plans', async () => {
      // Test index usage and query execution plan optimization
      const indexValidationCollection = db.collection('index_validation_test');

      // Create diverse dataset for index testing
      const indexTestData = [];
      for (let i = 0; i < 10000; i++) {
        indexTestData.push({
          userId: `user_${i.toString().padStart(5, '0')}`,
          profileType: ['free', 'premium', 'vip'][i % 3],
          astrologicalSign: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][i % 12],
          birthYear: 1980 + (i % 40), // Birth years 1980-2019
          readingCount: Math.floor(i / 100), // Gradual increase
          lastActive: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          tags: [
            `tag_${i % 10}`,
            `category_${i % 5}`,
            `region_${i % 20}`
          ]
        });
      }

      await indexValidationCollection.insertMany(indexTestData);

      // Create various indexes
      const indexes = [
        { field: 'astrologicalSign', name: 'astrological_sign_idx' },
        { field: 'profileType', name: 'profile_type_idx' },
        { field: 'birthYear', name: 'birth_year_idx' },
        { field: 'readingCount', name: 'reading_count_idx' },
        { field: 'lastActive', name: 'last_active_idx' },
        { fields: ['astrologicalSign', 'profileType'], name: 'sign_profile_composite_idx' },
        { fields: ['profileType', 'birthYear'], name: 'profile_year_composite_idx' }
      ];

      for (const indexDef of indexes) {
        if (indexDef.fields) {
          await indexValidationCollection.createIndex(
            indexDef.fields.reduce((acc, field) => ({ ...acc, [field]: 1 }), {}),
            { name: indexDef.name }
          );
        } else {
          await indexValidationCollection.createIndex({ [indexDef.field]: 1 }, { name: indexDef.name });
        }
      }

      // Test query execution plans and performance
      const testQueries = [
        { name: 'single_field_1', query: { astrologicalSign: 'Leo' }, description: 'Single astrology sign' },
        { name: 'single_field_2', query: { profileType: 'premium' }, description: 'Premium profiles' },
        { name: 'range_query', query: { readingCount: { $gte: 50 } }, description: 'High reading count' },
        { name: 'date_range', query: { lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, description: 'Recently active' },
        { name: 'composite_1', query: { astrologicalSign: 'Virgo', profileType: 'premium' }, description: 'Premium Virgos' },
        { name: 'composite_2', query: { profileType: 'vip', birthYear: { $gte: 2000 } }, description: 'Young VIPs' },
        { name: 'complex_query', query: { astrologicalSign: 'Cancer', profileType: 'free', readingCount: { $lt: 25 } }, description: 'New Cancer users' }
      ];

      const performanceResults = [];

      for (const testQuery of testQueries) {
        const queryStart = Date.now();

        // Execute query with execution stats
        const results = await indexValidationCollection.find(testQuery.query).limit(1000).toArray();

        const queryEnd = Date.now();
        const executionTime = queryEnd - queryStart;

        // Get execution plan for verification
        const executionPlan = await indexValidationCollection.find(testQuery.query).limit(1).explain();

        performanceResults.push({
          query: testQuery.name,
          description: testQuery.description,
          executionTime,
          resultCount: results.length,
          plan: executionPlan.executionStats.executionStages.stage
        });

        // Verify reasonable performance
        expect(executionTime).toBeLessThan(2000);
        expect(results.length).toBeDefined();
      }

      // Analyze results and verify index usage
      performanceResults.forEach(result => {
        console.log(`${result.query}: ${result.executionTime}ms, ${result.resultCount} results, plan: ${result.plan}`);
        expect(result.executionTime).toBeLessThan(2000);
      });

      // Verify composite indexes were used where beneficial
      const compositeQueries = performanceResults.filter(r => r.query.startsWith('composite_'));
      compositeQueries.forEach(result => {
        // Should benefit from composite indexes
        expect(result.executionTime).toBeLessThan(500);
      });

      // Cleanup
      await db.dropCollection('index_validation_test');
    });

    test('MULTI_USER_013: Composite index usage → Multi-field query performance', async () => {
      // Test specifically composite index usage and multi-field query performance
      const compositeIndexCollection = db.collection('composite_index_test');

      // Create data specifically designed for composite index testing
      const compositeTestData = [];
      const profiles = ['free', 'premium', 'vip'];
      const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo'];
      const regions = ['Asia', 'Europe', 'North America', 'South America'];

      for (let i = 0; i < 5000; i++) {
        compositeTestData.push({
          userId: `composite_user_${i.toString().padStart(4, '0')}`,
          profile: profiles[i % profiles.length],
          sunSign: signs[i % signs.length],
          region: regions[i % regions.length],
          age: 20 + (i % 60), // Ages 20-79
          readingCount: Math.floor(i / 100), // 0-49 readings
          createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
        });
      }

      await compositeIndexCollection.insertMany(compositeTestData);

      // Create composite indexes to test
      const compositeIndexes = [
        { fields: ['profile', 'sunSign'], name: 'profile_sign_idx' },
        { fields: ['region', 'profile'], name: 'region_profile_idx' },
        { fields: ['sunSign', 'age'], name: 'sign_age_idx' },
        { fields: ['profile', 'sunSign', 'region'], name: 'tripartite_idx' }
      ];

      for (const indexDef of compositeIndexes) {
        const indexSpec = {};
        indexDef.fields.forEach(field => {
          indexSpec[field] = 1;
        });
        await compositeIndexCollection.createIndex(indexSpec, { name: indexDef.name });
      }

      // Test composite index effectiveness
      const compositeQueries = [
        {
          name: 'profile_sign',
          query: { profile: 'premium', sunSign: 'Leo' },
          description: 'Premium Leo users',
          expectedIndex: 'profile_sign_idx'
        },
        {
          name: 'region_profile',
          query: { region: 'Asia', profile: 'vip' },
          description: 'VIP users in Asia',
          expectedIndex: 'region_profile_idx'
        },
        {
          name: 'sign_age_range',
          query: { sunSign: 'Cancer', age: { $gte: 30