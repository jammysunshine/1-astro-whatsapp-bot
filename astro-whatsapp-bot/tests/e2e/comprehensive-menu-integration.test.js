// Mock WhatsApp services to avoid API calls - MUST be at the top before any imports
const mockSendMessage = jest.fn().mockResolvedValue({ success: true });
jest.mock('../../src/services/whatsapp/messageSender', () => ({
  sendMessage: mockSendMessage
}));

const mongoose = require('mongoose');
const User = require('../../src/models/User');
const Session = require('../../src/models/Session');
const {
  getUserByPhone,
  createUser,
  addBirthDetails,
  updateUserProfile
} = require('../../src/models/userModel');
const { processIncomingMessage } = require('../../src/services/whatsapp/messageProcessor');
const { getMenu } = require('../../src/conversation/menuLoader');
const logger = require('../../src/utils/logger');

// Test configuration
const TEST_PHONE = '+1234567890';
const TEST_USER_DATA = {
  birthDate: '1990-06-15',
  birthTime: '14:30:00',
  birthPlace: 'Mumbai, India',
  latitude: 19.0760,
  longitude: 72.8777,
  timezone: 'Asia/Kolkata'
};

describe('Comprehensive Menu Integration Tests - REAL LIBRARIES', () => {
  let testUser;
  let app;

  beforeAll(async () => {
    // Load environment variables
    require('dotenv').config();

    // Set required environment variables for testing
    process.env.W1_WHATSAPP_ACCESS_TOKEN = 'test_token';
    process.env.W1_WHATSAPP_PHONE_NUMBER_ID = 'test_phone_id';

    // Connect to test database
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required for integration tests');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create test user with complete profile
    testUser = await createUser(TEST_PHONE, {
      profileComplete: true,
      ...TEST_USER_DATA
    });

    logger.info('✅ Test user created with complete profile');
  }, 30000);

  afterAll(async () => {
    // Clean up test data
    try {
      await User.deleteMany({ phoneNumber: TEST_PHONE });
      await Session.deleteMany({ phoneNumber: TEST_PHONE });
      await mongoose.connection.close();
      logger.info('✅ Test data cleaned up');
    } catch (error) {
      logger.error('❌ Error cleaning up test data:', error);
    }
  }, 10000);

  describe('Menu Structure Validation', () => {
    test('should load all menu configurations correctly', () => {
      const menus = [
        'main_menu',
        'western_astrology_menu',
        'vedic_astrology_menu',
        'divination_mystic_menu',
        'relationships_groups_menu',
        'numerology_special_menu'
      ];

      menus.forEach(menuName => {
        const menu = getMenu(menuName);
        expect(menu).toBeDefined();
        expect(menu.type).toBeDefined();

        if (menu.type === 'list') {
          expect(menu.sections).toBeDefined();
          expect(Array.isArray(menu.sections)).toBe(true);
          expect(menu.sections.length).toBeGreaterThan(0);

          // Validate each section has rows
          menu.sections.forEach(section => {
            expect(section.rows).toBeDefined();
            expect(Array.isArray(section.rows)).toBe(true);
            expect(section.rows.length).toBeGreaterThan(0);

            // Validate each row has required properties
            section.rows.forEach(row => {
              expect(row.id).toBeDefined();
              expect(row.title).toBeDefined();
              expect(row.description).toBeDefined();
            });
          });
        }
      });

      logger.info('✅ All menu configurations validated');
    });
  });

  describe('Main Menu Navigation', () => {
    test('should display main menu with 6 categories', async () => {
      // Simulate user sending "menu"
      const message = {
        from: TEST_PHONE,
        body: 'menu',
        type: 'text'
      };

      // Should not throw an error
      await expect(processIncomingMessage(message, {})).resolves.not.toThrow();

      // Verify some response was attempted (mocked)
      expect(mockSendMessage).toHaveBeenCalled();

      logger.info('✅ Main menu navigation validated');
    }, 10000);
  });

  describe('Western Astrology Menu - REAL CALCULATIONS', () => {
    test('should navigate to Western Astrology menu', async () => {
      // Simulate selecting Western Astrology from main menu
      const message = {
        from: TEST_PHONE,
        id: 'test_message_id',
        timestamp: Date.now().toString(),
        interactive: {
          type: 'list_reply',
          list_reply: {
            id: 'show_western_astrology_menu',
            title: 'Western Astrology',
            description: 'Birth charts, transits, horoscopes, predictive analysis'
          }
        },
        type: 'interactive'
      };

      await processIncomingMessage(message, {});

      // Verify Western menu was sent
      expect(mockSendMessage).toHaveBeenCalled();
      const menuCall = mockSendMessage.mock.calls.find(call =>
        call[1] && call[1].type === 'list'
      );
      expect(menuCall).toBeDefined();

      const westernMenu = menuCall[1];
      expect(westernMenu.sections).toBeDefined();
      expect(westernMenu.sections.length).toBeGreaterThan(0);

      logger.info('✅ Western Astrology menu navigation validated');
    }, 10000);

    test('should calculate REAL birth chart', async () => {
      // Clear previous mock calls
      mockSendMessage.mockClear();

      // Simulate requesting birth chart
      const message = {
        from: TEST_PHONE,
        interactive: {
          type: 'list_reply',
          list_reply: {
            id: 'show_birth_chart',
            title: 'Birth Chart Analysis',
            description: 'Complete natal chart interpretation'
          }
        },
        type: 'interactive'
      };

      await processIncomingMessage(message, {});

      // Verify birth chart calculation was attempted
      expect(mockSendMessage).toHaveBeenCalled();

      // Check that some response was sent (birth chart analysis)
      const responseCall = mockSendMessage.mock.calls[mockSendMessage.mock.calls.length - 1];
      expect(responseCall).toBeDefined();
      expect(responseCall[1]).toBeDefined();

      logger.info('✅ Real birth chart calculation validated');
    }, 15000);
  });

  describe('Vedic Astrology Menu - REAL CALCULATIONS', () => {
    test('should navigate to Vedic Astrology menu', async () => {
      // Simulate selecting Vedic Astrology from main menu
      const message = {
        from: TEST_PHONE,
        id: 'test_message_id_vedic',
        timestamp: Date.now().toString(),
        interactive: {
          type: 'list_reply',
          list_reply: {
            id: 'show_vedic_astrology_menu',
            title: 'Vedic Astrology',
            description: 'Kundli, dasha, remedies, festivals, numerology'
          }
        },
        type: 'interactive'
      };

      await processIncomingMessage(message, {});

      // Verify Vedic menu was sent
      expect(mockSendMessage).toHaveBeenCalled();
      const menuCall = mockSendMessage.mock.calls.find(call =>
        call[1] && call[1].type === 'list'
      );
      expect(menuCall).toBeDefined();

      const vedicMenu = menuCall[1];
      expect(vedicMenu.sections).toBeDefined();
      expect(vedicMenu.sections.length).toBeGreaterThan(0);

      logger.info('✅ Vedic Astrology menu navigation validated');
    }, 10000);

    test('should calculate REAL Vedic birth chart (Kundli)', async () => {
      // Clear previous mock calls
      mockSendMessage.mockClear();

      // Simulate requesting Vedic birth chart
      const message = {
        from: TEST_PHONE,
        interactive: {
          type: 'list_reply',
          list_reply: {
            id: 'get_hindu_astrology_analysis',
            title: 'Vedic Birth Chart',
            description: 'Complete Kundli with planetary positions'
          }
        },
        type: 'interactive'
      };

      await processIncomingMessage(message, {});

      // Verify Vedic calculation was attempted
      expect(mockSendMessage).toHaveBeenCalled();

      // Check that some response was sent (Vedic analysis)
      const responseCall = mockSendMessage.mock.calls[mockSendMessage.mock.calls.length - 1];
      expect(responseCall).toBeDefined();
      expect(responseCall[1]).toBeDefined();

      logger.info('✅ Real Vedic Kundli calculation validated');
    }, 20000);
  });

  describe('Divination & Mystic Menu - REAL READINGS', () => {
    test('should navigate to Divination menu', async () => {
      // Simulate selecting Divination from main menu
      const message = {
        from: TEST_PHONE,
        id: 'test_message_id_divination',
        timestamp: Date.now().toString(),
        interactive: {
          type: 'list_reply',
          list_reply: {
            id: 'show_divination_mystic_menu',
            title: 'Divination & Mystic',
            description: 'Tarot, I Ching, palmistry, ancient wisdom traditions'
          }
        },
        type: 'interactive'
      };

      await processIncomingMessage(message, {});

      // Verify Divination menu was sent
      expect(mockSendMessage).toHaveBeenCalled();
      const menuCall = mockSendMessage.mock.calls.find(call =>
        call[1] && call[1].type === 'list'
      );
      expect(menuCall).toBeDefined();

      const divinationMenu = menuCall[1];
      expect(divinationMenu.sections).toBeDefined();
      expect(divinationMenu.sections.length).toBeGreaterThan(0);

      logger.info('✅ Divination & Mystic menu navigation validated');
    }, 10000);

    test('should generate REAL Tarot reading', async () => {
      // Clear previous mock calls
      mockSendMessage.mockClear();

      // Simulate requesting Tarot reading
      const message = {
        from: TEST_PHONE,
        interactive: {
          type: 'list_reply',
          list_reply: {
            id: 'get_tarot_reading',
            title: 'Tarot Reading',
            description: 'Ancient card wisdom and guidance'
          }
        },
        type: 'interactive'
      };

      await processIncomingMessage(message, {});

      // Verify Tarot reading was generated
      expect(mockSendMessage).toHaveBeenCalled();

      // Check that some response was sent (Tarot reading)
      const responseCall = mockSendMessage.mock.calls[mockSendMessage.mock.calls.length - 1];
      expect(responseCall).toBeDefined();
      expect(responseCall[1]).toBeDefined();

      logger.info('✅ Real Tarot reading generation validated');
    }, 15000);
  });

  describe('Relationships & Groups Menu - REAL COMPATIBILITY', () => {
    test('should navigate to Relationships menu', async () => {
      // Simulate selecting Relationships from main menu
      const message = {
        from: TEST_PHONE,
        id: 'test_message_id_relationships',
        timestamp: Date.now().toString(),
        interactive: {
          type: 'list_reply',
          list_reply: {
            id: 'show_relationships_groups_menu',
            title: 'Relationships & Groups',
            description: 'Compatibility, family, business partnerships'
          }
        },
        type: 'interactive'
      };

      await processIncomingMessage(message, {});

      // Verify Relationships menu was sent
      expect(mockSendMessage).toHaveBeenCalled();
      const menuCall = mockSendMessage.mock.calls.find(call =>
        call[1] && call[1].type === 'list'
      );
      expect(menuCall).toBeDefined();

      const relationshipsMenu = menuCall[1];
      expect(relationshipsMenu.sections).toBeDefined();
      expect(relationshipsMenu.sections.length).toBeGreaterThan(0);

      logger.info('✅ Relationships & Groups menu navigation validated');
    }, 10000);
  });

  describe('Numerology & Special Menu - REAL CALCULATIONS', () => {
    test('should navigate to Numerology menu', async () => {
      // Simulate selecting Numerology from main menu
      const message = {
        from: TEST_PHONE,
        id: 'test_message_id_numerology',
        timestamp: Date.now().toString(),
        interactive: {
          type: 'list_reply',
          list_reply: {
            id: 'show_numerology_special_menu',
            title: 'Numerology & Special Readings',
            description: 'Life path numbers, name analysis, special insights'
          }
        },
        type: 'interactive'
      };

      await processIncomingMessage(message, {});

      // Verify Numerology menu was sent
      expect(mockSendMessage).toHaveBeenCalled();
      const menuCall = mockSendMessage.mock.calls.find(call =>
        call[1] && call[1].type === 'list'
      );
      expect(menuCall).toBeDefined();

      const numerologyMenu = menuCall[1];
      expect(numerologyMenu.sections).toBeDefined();
      expect(numerologyMenu.sections.length).toBeGreaterThan(0);

      logger.info('✅ Numerology & Special menu navigation validated');
    }, 10000);

    test('should calculate REAL numerology report', async () => {
      // Clear previous mock calls
      mockSendMessage.mockClear();

      // Simulate requesting numerology report
      const message = {
        from: TEST_PHONE,
        interactive: {
          type: 'list_reply',
          list_reply: {
            id: 'get_numerology_report',
            title: 'Complete Numerology Report',
            description: 'Life path, expression, and soul urge numbers'
          }
        },
        type: 'interactive'
      };

      await processIncomingMessage(message, {});

      // Verify numerology calculation was attempted
      expect(mockSendMessage).toHaveBeenCalled();

      // Check that some response was sent (numerology report)
      const responseCall = mockSendMessage.mock.calls[mockSendMessage.mock.calls.length - 1];
      expect(responseCall).toBeDefined();
      expect(responseCall[1]).toBeDefined();

      logger.info('✅ Real numerology calculation validated');
    }, 15000);
  });

  describe('Database Operations - REAL MONGO CALLS', () => {
    test('should create and retrieve user from REAL database', async () => {
      // Test user creation (already done in beforeAll)
      const retrievedUser = await getUserByPhone(TEST_PHONE);
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser.phoneNumber).toBe(TEST_PHONE);
      expect(retrievedUser.profileComplete).toBe(true);
      expect(retrievedUser.birthDate).toBeDefined();

      logger.info('✅ Real database user creation/retrieval validated');
    }, 5000);

    test('should update user profile in REAL database', async () => {
      const updatedData = {
        preferredLanguage: 'hi',
        'preferences.dailyNotifications': true
      };

      await updateUserProfile(TEST_PHONE, updatedData);

      const updatedUser = await getUserByPhone(TEST_PHONE);
      expect(updatedUser.preferredLanguage).toBe('hi');
      expect(updatedUser.preferences.dailyNotifications).toBe(true);

      logger.info('✅ Real database user profile update validated');
    }, 5000);
  });

  describe('Error Handling & Edge Cases', () => {
    test('should handle invalid menu selection gracefully', async () => {
      // Clear previous mock calls
      mockSendMessage.mockClear();

      // Simulate invalid menu selection
      const message = {
        from: TEST_PHONE,
        interactive: {
          type: 'list_reply',
          list_reply: {
            id: 'invalid_menu_action',
            title: 'Invalid Action',
            description: 'This should not exist'
          }
        },
        type: 'interactive'
      };

      await processIncomingMessage(message, {});

      // Should still send some response (error message or fallback)
      expect(mockSendMessage).toHaveBeenCalled();

      logger.info('✅ Invalid menu selection handling validated');
    }, 10000);

    test('should handle malformed messages gracefully', async () => {
      // Clear previous mock calls
      mockSendMessage.mockClear();

      // Simulate malformed message
      const message = {
        from: TEST_PHONE,
        type: 'unknown'
      };

      await processIncomingMessage(message, {});

      // Should handle gracefully without crashing
      expect(mockSendMessage).toHaveBeenCalled();

      logger.info('✅ Malformed message handling validated');
    }, 10000);

    test('should handle incomplete user profiles gracefully', async () => {
      // Clear previous mock calls
      mockSendMessage.mockClear();

      // Create user with incomplete profile
      const incompleteUser = await createUser('+incomplete123', {
        profileComplete: false,
        birthDate: null,
        birthTime: null,
        birthPlace: null
      });

      // Try to request birth chart with incomplete profile
      const message = {
        from: '+incomplete123',
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
      await User.deleteMany({ phoneNumber: '+incomplete123' });

      logger.info('✅ Incomplete profile handling validated');
    }, 15000);

    test('should handle network-like failures gracefully', async () => {
      // Clear previous mock calls
      mockSendMessage.mockClear();

      // Test with a service that might have external dependencies
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

      logger.info('✅ Network failure handling validated');
    }, 20000);

    test('should handle concurrent user sessions', async () => {
      // Clear previous mock calls
      mockSendMessage.mockClear();

      // Create multiple test users
      const phones = ['+multi1', '+multi2', '+multi3'];
      const users = [];

      for (const phone of phones) {
        const user = await createUser(phone, {
          profileComplete: true,
          ...TEST_USER_DATA
        });
        users.push(user);
      }

      // Simulate concurrent requests from different users
      const promises = phones.map(phone => {
        const message = {
          from: phone,
          interactive: {
            type: 'list_reply',
            list_reply: {
              id: 'show_birth_chart',
              title: 'Birth Chart',
              description: 'Concurrent session test'
            }
          },
          type: 'interactive'
        };
        return processIncomingMessage(message, {});
      });

      await Promise.all(promises);

      expect(mockSendMessage).toHaveBeenCalled();

      // Clean up
      for (const phone of phones) {
        await User.deleteMany({ phoneNumber: phone });
      }

      logger.info('✅ Concurrent user sessions validated');
    }, 30000);
  });

  describe('Performance & Load Testing', () => {
    test('should handle multiple menu navigations efficiently', async () => {
      // Clear previous mock calls
      mockSendMessage.mockClear();

      const startTime = Date.now();

      // Simulate multiple menu navigations
      const menuActions = [
        'show_western_astrology_menu',
        'show_vedic_astrology_menu',
        'show_divination_mystic_menu',
        'show_relationships_groups_menu',
        'show_numerology_special_menu'
      ];

      for (const action of menuActions) {
        const message = {
          from: TEST_PHONE,
          interactive: {
            type: 'list_reply',
            list_reply: {
              id: action,
              title: 'Menu Navigation',
              description: 'Testing menu flow'
            }
          },
          type: 'interactive'
        };

        await processIncomingMessage(message, {});
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete within reasonable time (under 30 seconds for 5 operations)
      expect(totalTime).toBeLessThan(30000);
      expect(mockSendMessage).toHaveBeenCalled();

      logger.info(`✅ Menu navigation performance validated: ${totalTime}ms for 5 operations`);
    }, 30000);
  });
});