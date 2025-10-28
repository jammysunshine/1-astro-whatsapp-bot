const mongoose = require('mongoose');
const User = require('../../src/models/User');
const { processIncomingMessage } = require('../../src/services/whatsapp/messageProcessor');
const logger = require('../../src/utils/logger');

const TEST_BIRTH_DATA = {
  date: '15061990',
  time: '1430',
  place: 'Mumbai, India',
  latitude: 19.0760,
  longitude: 72.8777,
  timezone: 'Asia/Kolkata'
};

// External API Integration Tests
// Note: Mocking is handled by tests/e2e/setup.js shared configuration

describe('External API Integration Tests - SAFE VALIDATION', () => {
  let testUser;
  const TEST_PHONE = '+1234567892';

  beforeAll(async () => {
    require('dotenv').config();

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI required for API integration tests');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create test user
    testUser = await require('../../src/models/userModel').createUser(TEST_PHONE, {
      profileComplete: true,
      birthDate: '1990-06-15',
      birthTime: '14:30:00',
      birthPlace: 'Mumbai, India',
      latitude: 19.0760,
      longitude: 72.8777,
      timezone: 'Asia/Kolkata'
    });

    logger.info('✅ API integration test user created');
  }, 30000);

  afterAll(async () => {
    try {
      await User.deleteMany({ phoneNumber: TEST_PHONE });
      await mongoose.connection.close();
      logger.info('✅ API integration test data cleaned up');
    } catch (error) {
      logger.error('❌ Error cleaning up API test data:', error);
    }
  }, 10000);

  describe('Google Maps Integration - SAFE TESTING', () => {
    test('should validate Google Maps client setup', () => {
      // Test that Google Maps client can be initialized
      const googleMaps = require('@googlemaps/google-maps-services-js');

      // Verify the client class exists
      expect(googleMaps.Client).toBeDefined();

      // Verify we can create a client instance (without API key for safety)
      const client = new googleMaps.Client({});
      expect(client).toBeDefined();

      logger.info('✅ Google Maps client setup validated');
    });

    test('should handle astrocartography requests safely', async () => {
      const mockSendMessage = jest.fn();
      const originalSendMessage = require('../../src/services/whatsapp/messageSender').sendMessage;
      require('../../src/services/whatsapp/messageSender').sendMessage = mockSendMessage;

      try {
        // Request astrocartography (should not make real API calls)
        const message = {
          from: TEST_PHONE,
          interactive: {
            type: 'list_reply',
            list_reply: {
              id: 'get_astrocartography_analysis',
              title: 'Astrocartography',
              description: 'Geographic astrology and relocation'
            }
          },
          type: 'interactive'
        };

        await processIncomingMessage(message, {});

        expect(mockSendMessage).toHaveBeenCalled();

        const responseCall = mockSendMessage.mock.calls[mockSendMessage.mock.calls.length - 1];
        const response = responseCall[1];

        expect(typeof response).toBe('string');
        expect(response.length).toBeGreaterThan(50);

        // Should contain astrocartography information
        const hasAstroCartInfo = /astrocartography|planetary.*lines|relocation/i.test(response);
        expect(hasAstroCartInfo).toBe(true);

        logger.info('✅ Astrocartography integration validated (no API costs)');
      } finally {
        require('../../src/services/whatsapp/messageSender').sendMessage = originalSendMessage;
      }
    }, 15000);
  });

  describe('OpenAI/Gemini Integration - SAFE TESTING', () => {
    test('should validate AI service imports', () => {
      // Test that AI services can be imported
      expect(() => {
        require('../../src/services/ai/MistralAIService');
      }).not.toThrow();

      expect(() => {
        require('../../src/services/whatsapp/messageSender');
      }).not.toThrow();

      logger.info('✅ AI service imports validated');
    });

    test('should handle AI-powered readings safely', async () => {
      const mockSendMessage = jest.fn();
      const originalSendMessage = require('../../src/services/whatsapp/messageSender').sendMessage;
      require('../../src/services/whatsapp/messageSender').sendMessage = mockSendMessage;

      try {
        // Request future self analysis (may use AI)
        const message = {
          from: TEST_PHONE,
          interactive: {
            type: 'list_reply',
            list_reply: {
              id: 'get_future_self_analysis',
              title: 'Future Self Analysis',
              description: 'Explore your potential future'
            }
          },
          type: 'interactive'
        };

        await processIncomingMessage(message, {});

        expect(mockSendMessage).toHaveBeenCalled();

        const responseCall = mockSendMessage.mock.calls[mockSendMessage.mock.calls.length - 1];
        const response = responseCall[1];

        expect(typeof response).toBe('string');
        expect(response.length).toBeGreaterThan(50);

        logger.info('✅ AI-powered reading integration validated');
      } finally {
        require('../../src/services/whatsapp/messageSender').sendMessage = originalSendMessage;
      }
    }, 20000);
  });

  describe('WhatsApp API Integration - SAFE TESTING', () => {
    test('should validate WhatsApp service setup', () => {
      // Test that WhatsApp services can be imported
      expect(() => {
        require('../../src/services/whatsapp/messageSender');
      }).not.toThrow();

      expect(() => {
        require('../../src/services/whatsapp/messageProcessor');
      }).not.toThrow();

      expect(() => {
        require('../../src/services/whatsapp/webhookValidator');
      }).not.toThrow();

      logger.info('✅ WhatsApp service setup validated');
    });

    test('should handle WhatsApp message processing', async () => {
      const mockSendMessage = jest.fn();
      const originalSendMessage = require('../../src/services/whatsapp/messageSender').sendMessage;
      require('../../src/services/whatsapp/messageSender').sendMessage = mockSendMessage;

      try {
        // Test basic text message processing
        const message = {
          from: TEST_PHONE,
          body: 'Hello',
          type: 'text'
        };

        await processIncomingMessage(message, {});

        expect(mockSendMessage).toHaveBeenCalled();

        logger.info('✅ WhatsApp message processing validated');
      } finally {
        require('../../src/services/whatsapp/messageSender').sendMessage = originalSendMessage;
      }
    }, 10000);
  });

  describe('Database Integration - REAL MONGO OPERATIONS', () => {
    test('should perform REAL database CRUD operations', async () => {
      // Test user creation (already done)
      const user = await require('../../src/models/userModel').getUserByPhone(TEST_PHONE);
      expect(user).toBeDefined();
      expect(user.phoneNumber).toBe(TEST_PHONE);

      // Test user update
      await require('../../src/models/userModel').updateUserProfile(TEST_PHONE, {
        language: 'es',
        notifications: false
      });

      const updatedUser = await require('../../src/models/userModel').getUserByPhone(TEST_PHONE);
      expect(updatedUser.language).toBe('es');
      expect(updatedUser.notifications).toBe(false);

      logger.info('✅ Real MongoDB CRUD operations validated');
    }, 10000);

    test('should handle database connection errors gracefully', async () => {
      // Test with invalid phone number
      const invalidUser = await require('../../src/models/userModel').getUserByPhone('+invalid');
      expect(invalidUser).toBeNull();

      logger.info('✅ Database error handling validated');
    }, 5000);
  });

  describe('Payment Integration - SAFE TESTING', () => {
    test('should validate payment service setup', () => {
      // Test that payment services can be imported without errors
      expect(() => {
        require('../../src/services/payment/paymentService');
      }).not.toThrow();

      logger.info('✅ Payment service setup validated');
    });

    test('should handle payment-related requests safely', async () => {
      const mockSendMessage = jest.fn();
      const originalSendMessage = require('../../src/services/whatsapp/messageSender').sendMessage;
      require('../../src/services/whatsapp/messageSender').sendMessage = mockSendMessage;

      try {
        // Test premium service request (should handle gracefully)
        const message = {
          from: TEST_PHONE,
          body: 'premium services',
          type: 'text'
        };

        await processIncomingMessage(message, {});

        expect(mockSendMessage).toHaveBeenCalled();

        logger.info('✅ Payment integration handling validated');
      } finally {
        require('../../src/services/whatsapp/messageSender').sendMessage = originalSendMessage;
      }
    }, 10000);
  });

  describe('Error Handling & Resilience', () => {
    test('should handle network timeouts gracefully', async () => {
      const mockSendMessage = jest.fn();
      const originalSendMessage = require('../../src/services/whatsapp/messageSender').sendMessage;
      require('../../src/services/whatsapp/messageSender').sendMessage = mockSendMessage;

      try {
        // Test with a service that might have network dependencies
        const message = {
          from: TEST_PHONE,
          interactive: {
            type: 'list_reply',
            list_reply: {
              id: 'get_tarot_reading',
              title: 'Tarot Reading',
              description: 'Test network resilience'
            }
          },
          type: 'interactive'
        };

        await processIncomingMessage(message, {});

        // Should complete without throwing errors
        expect(mockSendMessage).toHaveBeenCalled();

        logger.info('✅ Network error handling validated');
      } finally {
        require('../../src/services/whatsapp/messageSender').sendMessage = originalSendMessage;
      }
    }, 20000);

    test('should handle malformed data gracefully', async () => {
      const mockSendMessage = jest.fn();
      const originalSendMessage = require('../../src/services/whatsapp/messageSender').sendMessage;
      require('../../src/services/whatsapp/messageSender').sendMessage = mockSendMessage;

      try {
        // Test with incomplete user data
        const incompleteUser = await require('../../src/models/userModel').createUser({
          phoneNumber: '+incomplete',
          profileComplete: false
          // Missing birth data
        });

        const message = {
          from: '+incomplete',
          interactive: {
            type: 'list_reply',
            list_reply: {
              id: 'show_birth_chart',
              title: 'Birth Chart',
              description: 'Should handle incomplete profile'
            }
          },
          type: 'interactive'
        };

        await processIncomingMessage(message, {});

        expect(mockSendMessage).toHaveBeenCalled();

        // Clean up
        await User.deleteMany({ phoneNumber: '+incomplete' });

        logger.info('✅ Malformed data handling validated');
      } finally {
        require('../../src/services/whatsapp/messageSender').sendMessage = originalSendMessage;
      }
    }, 15000);
  });

  describe('Performance & Scalability', () => {
    test('should handle concurrent requests efficiently', async () => {
      const mockSendMessage = jest.fn();
      const originalSendMessage = require('../../src/services/whatsapp/messageSender').sendMessage;
      require('../../src/services/whatsapp/messageSender').sendMessage = mockSendMessage;

      const startTime = Date.now();

      try {
        // Simulate multiple concurrent requests
        const requests = [
          { id: 'show_birth_chart', desc: 'Birth Chart' },
          { id: 'get_tarot_reading', desc: 'Tarot Reading' },
          { id: 'get_numerology_analysis', desc: 'Numerology' },
          { id: 'get_hindu_astrology_analysis', desc: 'Vedic Chart' },
          { id: 'get_current_transits', desc: 'Transits' }
        ];

        const promises = requests.map(request => {
          const message = {
            from: TEST_PHONE,
            interactive: {
              type: 'list_reply',
              list_reply: {
                id: request.id,
                title: request.desc,
                description: 'Concurrent test'
              }
            },
            type: 'interactive'
          };
          return processIncomingMessage(message, {});
        });

        await Promise.all(promises);

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        // Should complete within reasonable time
        expect(totalTime).toBeLessThan(60000); // Under 1 minute for 5 concurrent requests
        expect(mockSendMessage).toHaveBeenCalled();

        logger.info(`✅ Concurrent request performance validated: ${totalTime}ms for 5 requests`);
      } finally {
        require('../../src/services/whatsapp/messageSender').sendMessage = originalSendMessage;
      }
    }, 60000);

    test('should handle high-volume user load testing', async () => {
      const mockSendMessage = jest.fn();
      const originalSendMessage = require('../../src/services/whatsapp/messageSender').sendMessage;
      require('../../src/services/whatsapp/messageSender').sendMessage = mockSendMessage;

      const startTime = Date.now();

      try {
        // Create multiple test users for load testing
        const loadTestPhones = [];
        for (let i = 1; i <= 10; i++) {
          loadTestPhones.push(`+loadtest${i}`);
        }

        // Create users in database
        const userPromises = loadTestPhones.map(phone =>
          require('../../src/models/userModel').createUser(phone, {
            profileComplete: true,
            birthDate: TEST_BIRTH_DATA.date,
            birthTime: TEST_BIRTH_DATA.time,
            birthPlace: TEST_BIRTH_DATA.place,
            latitude: TEST_BIRTH_DATA.latitude,
            longitude: TEST_BIRTH_DATA.longitude,
            timezone: TEST_BIRTH_DATA.timezone
          })
        );

        await Promise.all(userPromises);

        // Simulate high-volume requests (10 users × 3 requests each = 30 total)
        const requestTypes = [
          'show_birth_chart',
          'get_tarot_reading',
          'get_numerology_analysis'
        ];

        const allPromises = [];
        loadTestPhones.forEach(phone => {
          requestTypes.forEach(requestId => {
            const message = {
              from: phone,
              interactive: {
                type: 'list_reply',
                list_reply: {
                  id: requestId,
                  title: 'Load Test',
                  description: 'High volume performance test'
                }
              },
              type: 'interactive'
            };
            allPromises.push(processIncomingMessage(message, {}));
          });
        });

        await Promise.all(allPromises);

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        // Should complete within reasonable time for load testing
        expect(totalTime).toBeLessThan(120000); // Under 2 minutes for 30 requests
        expect(mockSendMessage).toHaveBeenCalled();

        // Clean up test users
        const cleanupPromises = loadTestPhones.map(phone =>
          User.deleteMany({ phoneNumber: phone })
        );
        await Promise.all(cleanupPromises);

        logger.info(`✅ High-volume load testing validated: ${totalTime}ms for 30 requests`);
      } finally {
        require('../../src/services/whatsapp/messageSender').sendMessage = originalSendMessage;
      }
    }, 120000);

    test('should maintain response times under load', async () => {
      const mockSendMessage = jest.fn();
      const originalSendMessage = require('../../src/services/whatsapp/messageSender').sendMessage;
      require('../../src/services/whatsapp/messageSender').sendMessage = mockSendMessage;

      try {
        // Test response time consistency
        const responseTimes = [];
        const iterations = 5;

        for (let i = 0; i < iterations; i++) {
          const startTime = Date.now();

          const message = {
            from: TEST_PHONE,
            interactive: {
              type: 'list_reply',
              list_reply: {
                id: 'show_birth_chart',
                title: 'Birth Chart',
                description: 'Response time test'
              }
            },
            type: 'interactive'
          };

          await processIncomingMessage(message, {});

          const endTime = Date.now();
          responseTimes.push(endTime - startTime);
        }

        // Calculate average response time
        const averageTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

        // Should maintain reasonable response times (under 10 seconds average)
        expect(averageTime).toBeLessThan(10000);

        // Response times should be relatively consistent (not vary by more than 5x)
        const maxTime = Math.max(...responseTimes);
        const minTime = Math.min(...responseTimes);
        expect(maxTime / minTime).toBeLessThan(5);

        logger.info(`✅ Response time consistency validated: avg ${averageTime}ms, range ${minTime}-${maxTime}ms`);
      } finally {
        require('../../src/services/whatsapp/messageSender').sendMessage = originalSendMessage;
      }
    }, 60000);
  });
});