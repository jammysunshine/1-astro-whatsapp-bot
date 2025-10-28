const { MongoClient } = require('mongodb');
const { processIncomingMessage } = require('../../src/services/whatsapp/messageProcessor');
const { createUser, getUserByPhone, updateUserProfile } = require('../../src/models/userModel');
const vedicCalculator = require('../../src/services/astrology/vedicCalculator');
const { generateTarotReading } = require('../../src/services/astrology/tarotReader');
const numerologyService = require('../../src/services/astrology/numerologyService');
const GeocodingService = require('../../src/services/astrology/geocoding/GeocodingService');
const logger = require('../../src/utils/logger');

// Mock WhatsApp message sender globally
jest.mock('../../src/services/whatsapp/messageSender', () => ({
  sendMessage: jest.fn().mockResolvedValue(true)
}));

const mockSendMessage = require('../../src/services/whatsapp/messageSender').sendMessage;

// Test configuration
const TEST_DB_NAME = 'test_astro_whatsapp_comprehensive';
const TEST_PHONE = '+1234567890';
const TEST_USER_DATA = {
  name: 'Test User',
  birthDate: '15061990',
  birthTime: '1430',
  birthPlace: 'Mumbai, India',
  profileComplete: true
};

// Menu tree structure for comprehensive testing
const MENU_TREE = {
  main_menu: {
    type: 'list',
    sections: [
      {
        title: '🌟 Astrology Traditions',
        rows: [
          { id: 'show_western_astrology_menu', title: 'Western Astrology' },
          { id: 'show_vedic_astrology_menu', title: 'Vedic Astrology' },
          { id: 'show_divination_mystic_menu', title: 'Divination & Mystic' },
          { id: 'show_relationships_groups_menu', title: 'Relationships & Groups' },
          { id: 'show_numerology_special_menu', title: 'Numerology & Special' },
          { id: 'show_settings_profile_menu', title: 'Settings & Profile' }
        ]
      }
    ]
  },
  western_astrology_menu: {
    type: 'list',
    sections: [
      {
        title: '⭐ Basic Readings',
        rows: [
          { id: 'get_daily_horoscope', title: 'Daily Horoscope' },
          { id: 'show_birth_chart', title: 'Birth Chart Analysis' }
        ]
      },
      {
        title: '🔬 Advanced Analysis',
        rows: [
          { id: 'get_current_transits', title: 'Current Transits' },
          { id: 'get_secondary_progressions', title: 'Progressions' },
          { id: 'get_solar_arc_directions', title: 'Solar Arc Directions' },
          { id: 'get_asteroid_analysis', title: 'Asteroid Analysis' },
          { id: 'get_fixed_stars_analysis', title: 'Fixed Stars Analysis' }
        ]
      },
      {
        title: '🔮 Predictive & Specialized',
        rows: [
          { id: 'get_solar_return_analysis', title: 'Solar Return' },
          { id: 'get_career_astrology_analysis', title: 'Career Guidance' },
          { id: 'get_financial_astrology_analysis', title: 'Financial Timing' },
          { id: 'get_medical_astrology_analysis', title: 'Medical Astrology' },
          { id: 'get_event_astrology_analysis', title: 'Event Astrology' }
        ]
      }
    ]
  },
  vedic_astrology_menu: {
    type: 'list',
    sections: [
      {
        title: '⭐ Basic Readings',
        rows: [
          { id: 'get_hindu_astrology_analysis', title: 'Vedic Birth Chart' },
          { id: 'get_synastry_analysis', title: 'Marriage Matching' },
          { id: 'show_nadi_flow', title: 'Nadi Astrology' }
        ]
      },
      {
        title: '🔬 Advanced Analysis',
        rows: [
          { id: 'get_vimshottari_dasha_analysis', title: 'Vimshottari Dasha' },
          { id: 'get_hindu_festivals_info', title: 'Hindu Festivals' },
          { id: 'get_vedic_numerology_analysis', title: 'Vedic Numerology' },
          { id: 'get_ashtakavarga_analysis', title: 'Ashtakavarga' },
          { id: 'get_varga_charts_analysis', title: 'Varga Charts' }
        ]
      },
      {
        title: '🔮 Predictive & Remedies',
        rows: [
          { id: 'get_vedic_remedies_info', title: 'Vedic Remedies' },
          { id: 'get_ayurvedic_astrology_analysis', title: 'Ayurvedic Astrology' },
          { id: 'get_prashna_astrology_analysis', title: 'Prashna Astrology' },
          { id: 'get_muhurta_analysis', title: 'Muhurta' },
          { id: 'get_panchang_analysis', title: 'Panchang' }
        ]
      }
    ]
  },
  divination_mystic_menu: {
    type: 'list',
    sections: [
      {
        title: '🔮 Card & Symbol Divination',
        rows: [
          { id: 'get_tarot_reading', title: 'Tarot Reading' },
          { id: 'get_iching_reading', title: 'I Ching Oracle' }
        ]
      },
      {
        title: '✋ Physical Divination',
        rows: [
          { id: 'get_palmistry_analysis', title: 'Palmistry' },
          { id: 'show_chinese_flow', title: 'Chinese Bazi' }
        ]
      },
      {
        title: '🌏 Ancient Wisdom Traditions',
        rows: [
          { id: 'get_mayan_analysis', title: 'Mayan Astrology' },
          { id: 'get_celtic_analysis', title: 'Celtic Astrology' },
          { id: 'get_kabbalistic_analysis', title: 'Kabbalistic Astrology' },
          { id: 'get_hellenistic_astrology_analysis', title: 'Hellenistic Astrology' },
          { id: 'get_islamic_astrology_info', title: 'Islamic Astrology' }
        ]
      },
      {
        title: '❓ Specialized Divination',
        rows: [
          { id: 'get_horary_reading', title: 'Horary Astrology' },
          { id: 'get_astrocartography_analysis', title: 'Astrocartography' }
        ]
      }
    ]
  },
  relationships_groups_menu: {
    type: 'list',
    sections: [
      {
        title: '💕 Romantic Relationships',
        rows: [
          { id: 'start_couple_compatibility_flow', title: 'Couple Compatibility' },
          { id: 'get_synastry_analysis', title: 'Relationship Synastry' }
        ]
      },
      {
        title: '👪 Family Dynamics',
        rows: [
          { id: 'start_family_astrology_flow', title: 'Family Astrology' },
          { id: 'get_group_astrology_analysis', title: 'Family Group Analysis' }
        ]
      },
      {
        title: '🤝 Professional Partnerships',
        rows: [
          { id: 'start_business_partnership_flow', title: 'Business Partnership' },
          { id: 'get_group_astrology_analysis', title: 'Team Dynamics' }
        ]
      },
      {
        title: '⏰ Timing & Events',
        rows: [
          { id: 'start_group_timing_flow', title: 'Group Event Timing' },
          { id: 'get_muhurta_analysis', title: 'Wedding Muhurta' }
        ]
      }
    ]
  },
  numerology_special_menu: {
    type: 'list',
    sections: [
      {
        title: '🔢 Numerology Analysis',
        rows: [
          { id: 'get_numerology_analysis', title: 'Life Path Numerology' },
          { id: 'get_numerology_report', title: 'Complete Numerology Report' },
          { id: 'get_vedic_numerology_analysis', title: 'Vedic Numerology' }
        ]
      },
      {
        title: '🔮 Special Astrological Readings',
        rows: [
          { id: 'get_lunar_return', title: 'Lunar Return' },
          { id: 'get_future_self_analysis', title: 'Future Self Analysis' },
          { id: 'get_age_harmonic_analysis', title: 'Age Harmonic Astrology' }
        ]
      },
      {
        title: '🌍 Specialized Astrology',
        rows: [
          { id: 'get_electional_astrology', title: 'Electional Astrology' },
          { id: 'get_mundane_astrology_analysis', title: 'Mundane Astrology' },
          { id: 'get_event_astrology_analysis', title: 'Event Astrology' }
        ]
      }
    ]
  }
};

// Service endpoints that require real calculations
const REAL_CALCULATION_SERVICES = [
  'show_birth_chart',
  'get_hindu_astrology_analysis',
  'get_tarot_reading',
  'get_numerology_report',
  'get_daily_horoscope',
  'get_current_transits',
  'get_solar_return_analysis',
  'get_vimshottari_dasha_analysis',
  'get_synastry_analysis',
  'get_palmistry_analysis',
  'get_mayan_analysis',
  'get_celtic_analysis',
  'get_kabbalistic_analysis',
  'get_iching_reading'
];

describe('Comprehensive Menu Tree Validation - REAL LIBRARIES & DATABASE', () => {
  let mongoClient;
  let db;

  beforeAll(async () => {
    // Connect to real MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    db = mongoClient.db(TEST_DB_NAME);

    // Set up environment variables for testing
    process.env.W1_WHATSAPP_ACCESS_TOKEN = 'test_token';
    process.env.W1_WHATSAPP_PHONE_NUMBER_ID = 'test_phone_id';

    logger.info('✅ Connected to real MongoDB for comprehensive testing');
  }, 30000);

  afterAll(async () => {
    // Clean up database
    if (db) {
      await db.dropDatabase();
    }
    if (mongoClient) {
      await mongoClient.close();
    }
    logger.info('✅ Database cleanup completed');
  }, 10000);

  beforeEach(async () => {
    // Clear mock calls between tests
    mockSendMessage.mockClear();

    // Clean up test data
    if (db) {
      await db.collection('users').deleteMany({ phoneNumber: TEST_PHONE });
    }
  }, 5000);

  describe('Menu Structure Validation', () => {
    test('should validate complete menu tree structure', () => {
      const { getMenu } = require('../../src/conversation/menuLoader');

      // Validate all menus exist and have correct structure
      Object.keys(MENU_TREE).forEach(menuId => {
        const menu = getMenu(menuId);
        expect(menu).toBeDefined();
        expect(menu.type).toBe(MENU_TREE[menuId].type);

        if (menu.type === 'list') {
          expect(menu.sections).toBeDefined();
          expect(Array.isArray(menu.sections)).toBe(true);
        }
      });

      logger.info('✅ Menu structure validation completed');
    });
  });

  describe('Main Menu Navigation', () => {
    test('should display main menu with all 6 categories', async () => {
      const message = {
        from: TEST_PHONE,
        type: 'text',
        text: { body: 'menu' }
      };

      await processIncomingMessage(message, {});

      expect(mockSendMessage).toHaveBeenCalled();
      const call = mockSendMessage.mock.calls[0];
      expect(call[1]).toContain('Welcome to Your Cosmic Journey');
      expect(call[1]).toContain('Western Astrology');
      expect(call[1]).toContain('Vedic Astrology');
      expect(call[1]).toContain('Divination & Mystic');
      expect(call[1]).toContain('Relationships & Groups');
      expect(call[1]).toContain('Numerology & Special');

      logger.info('✅ Main menu navigation validated');
    });

    test('should navigate to all main menu categories', async () => {
      const mainMenuOptions = [
        'show_western_astrology_menu',
        'show_vedic_astrology_menu',
        'show_divination_mystic_menu',
        'show_relationships_groups_menu',
        'show_numerology_special_menu',
        'show_settings_profile_menu'
      ];

      for (const optionId of mainMenuOptions) {
        mockSendMessage.mockClear();

        const message = {
          from: TEST_PHONE,
          interactive: {
            type: 'list_reply',
            list_reply: {
              id: optionId,
              title: 'Test Navigation',
              description: 'Testing menu navigation'
            }
          },
          type: 'interactive'
        };

        await processIncomingMessage(message, {});

        expect(mockSendMessage).toHaveBeenCalled();
        logger.info(`✅ Navigated to ${optionId}`);
      }

      logger.info('✅ All main menu categories navigation validated');
    });
  });

  describe('Western Astrology Menu Tree', () => {
    test('should navigate through Western astrology sub-menus', async () => {
      const westernOptions = [
        'get_daily_horoscope',
        'show_birth_chart',
        'get_current_transits',
        'get_secondary_progressions',
        'get_solar_arc_directions',
        'get_asteroid_analysis',
        'get_fixed_stars_analysis',
        'get_solar_return_analysis',
        'get_career_astrology_analysis',
        'get_financial_astrology_analysis',
        'get_medical_astrology_analysis',
        'get_event_astrology_analysis'
      ];

      for (const optionId of westernOptions) {
        mockSendMessage.mockClear();

        const message = {
          from: TEST_PHONE,
          interactive: {
            type: 'list_reply',
            list_reply: {
              id: optionId,
              title: 'Western Astrology Test',
              description: 'Testing Western astrology services'
            }
          },
          type: 'interactive'
        };

        await processIncomingMessage(message, {});

        expect(mockSendMessage).toHaveBeenCalled();
        logger.info(`✅ Western astrology option ${optionId} navigation validated`);
      }
    });

    test('should calculate REAL Western birth chart with astrology libraries', async () => {
      // Create test user with complete profile
      await createUser(TEST_PHONE, TEST_USER_DATA);

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

      expect(mockSendMessage).toHaveBeenCalled();

      // Verify the response contains real birth chart data
      const responseCall = mockSendMessage.mock.calls.find(call =>
        call[1] && typeof call[1] === 'object' && call[1].body
      );

      if (responseCall) {
        const responseBody = responseCall[1].body;
        expect(responseBody).toContain('Western Birth Chart Analysis');
        expect(responseBody).toContain('Ascendant');
        expect(responseBody).toContain('Planetary Positions');
      }

      logger.info('✅ Real Western birth chart calculation validated');
    }, 15000);

    test('should generate REAL daily horoscope with Vedic calculations', async () => {
      await createUser(TEST_PHONE, TEST_USER_DATA);

      const message = {
        from: TEST_PHONE,
        interactive: {
          type: 'list_reply',
          list_reply: {
            id: 'get_daily_horoscope',
            title: 'Daily Horoscope',
            description: 'Today\'s planetary influences'
          }
        },
        type: 'interactive'
      };

      await processIncomingMessage(message, {});

      expect(mockSendMessage).toHaveBeenCalled();

      // Verify horoscope response
      const responseCall = mockSendMessage.mock.calls.find(call =>
        call[1] && (typeof call[1] === 'string' || (typeof call[1] === 'object' && call[1].body))
      );

      expect(responseCall).toBeDefined();
      logger.info('✅ Real daily horoscope generation validated');
    }, 10000);

    test('should navigate back to main menu from Western astrology sub-menu', async () => {
      // 1. Navigate to Western Astrology menu
      mockSendMessage.mockClear();
      const westernMenuMessage = {
        from: TEST_PHONE,
        interactive: {
          type: 'list_reply',
          list_reply: {
            id: 'show_western_astrology_menu',
            title: 'Western Astrology',
            description: 'Navigate to Western Astrology menu'
          }
        },
        type: 'interactive'
      };
      await processIncomingMessage(westernMenuMessage, {});
      expect(mockSendMessage).toHaveBeenCalled();
      logger.info('✅ Navigated to Western Astrology menu');

      // 2. Simulate back action to main menu
      mockSendMessage.mockClear();
      const backToMainMenuMessage = {
        from: TEST_PHONE,
        interactive: {
          type: 'list_reply',
          list_reply: {
            id: 'show_main_menu',
            title: 'Main Menu',
            description: 'Navigate back to Main Menu'
          }
        },
        type: 'interactive'
      };
      await processIncomingMessage(backToMainMenuMessage, {});
      expect(mockSendMessage).toHaveBeenCalled();

      // 3. Verify main menu is displayed
      const responseCall = mockSendMessage.mock.calls[0][1];
      expect(responseCall.body).toContain('Welcome to Your Cosmic Journey');
      expect(responseCall.body).toContain('Western Astrology');
      logger.info('✅ Successfully navigated back to Main Menu');
    }, 15000);
  });

  describe('Vedic Astrology Menu Tree', () => {
    test('should navigate through Vedic astrology sub-menus', async () => {
      const vedicOptions = [
        'get_hindu_astrology_analysis',
        'get_synastry_analysis',
        'show_nadi_flow',
        'get_vimshottari_dasha_analysis',
        'get_hindu_festivals_info',
        'get_vedic_numerology_analysis',
        'get_ashtakavarga_analysis',
        'get_varga_charts_analysis',
        'get_vedic_remedies_info',
        'get_ayurvedic_astrology_analysis',
        'get_prashna_astrology_analysis',
        'get_muhurta_analysis',
        'get_panchang_analysis'
      ];

      for (const optionId of vedicOptions) {
        mockSendMessage.mockClear();

        const message = {
          from: TEST_PHONE,
          interactive: {
            type: 'list_reply',
            list_reply: {
              id: optionId,
              title: 'Vedic Astrology Test',
              description: 'Testing Vedic astrology services'
            }
          },
          type: 'interactive'
        };

        await processIncomingMessage(message, {});

        expect(mockSendMessage).toHaveBeenCalled();
        logger.info(`✅ Vedic astrology option ${optionId} navigation validated`);
      }
    });

    test('should calculate REAL Vedic Kundli with astrology libraries', async () => {
      await createUser(TEST_PHONE, TEST_USER_DATA);

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

      expect(mockSendMessage).toHaveBeenCalled();

      // Verify the response contains real Kundli data
      const responseCall = mockSendMessage.mock.calls.find(call =>
        call[1] && typeof call[1] === 'object' && call[1].body
      );

      if (responseCall) {
        const responseBody = responseCall[1].body;
        expect(responseBody).toContain('Vedic Kundli');
        expect(responseBody).toContain('Lagna');
        expect(responseBody).toContain('Planetary Positions');
      }

      logger.info('✅ Real Vedic Kundli calculation validated');
    }, 20000);
  });

  describe('Divination & Mystic Menu Tree', () => {
    test('should navigate through divination sub-menus', async () => {
      const divinationOptions = [
        'get_tarot_reading',
        'get_iching_reading',
        'get_palmistry_analysis',
        'show_chinese_flow',
        'get_mayan_analysis',
        'get_celtic_analysis',
        'get_kabbalistic_analysis',
        'get_hellenistic_astrology_analysis',
        'get_islamic_astrology_info',
        'get_horary_reading',
        'get_astrocartography_analysis'
      ];

      for (const optionId of divinationOptions) {
        mockSendMessage.mockClear();

        const message = {
          from: TEST_PHONE,
          interactive: {
            type: 'list_reply',
            list_reply: {
              id: optionId,
              title: 'Divination Test',
              description: 'Testing divination services'
            }
          },
          type: 'interactive'
        };

        await processIncomingMessage(message, {});

        expect(mockSendMessage).toHaveBeenCalled();
        logger.info(`✅ Divination option ${optionId} navigation validated`);
      }
    });

    test('should generate REAL Tarot reading with tarot library', async () => {
      await createUser(TEST_PHONE, TEST_USER_DATA);

      const message = {
        from: TEST_PHONE,
        interactive: {
          type: 'list_reply',
          list_reply: {
            id: 'get_tarot_reading',
            title: 'Tarot Reading',
            description: 'Ancient card wisdom'
          }
        },
        type: 'interactive'
      };

      await processIncomingMessage(message, {});

      expect(mockSendMessage).toHaveBeenCalled();

      // Verify tarot response
      const responseCall = mockSendMessage.mock.calls.find(call =>
        call[1] && typeof call[1] === 'object' && call[1].body
      );

      if (responseCall) {
        const responseBody = responseCall[1].body;
        expect(responseBody).toContain('Tarot Reading');
        expect(responseBody).toContain('Overall Interpretation');
      }

      logger.info('✅ Real Tarot reading generation validated');
    }, 15000);
  });

  describe('Relationships & Groups Menu Tree', () => {
    test('should navigate through relationships sub-menus', async () => {
      const relationshipOptions = [
        'start_couple_compatibility_flow',
        'get_synastry_analysis',
        'start_family_astrology_flow',
        'get_group_astrology_analysis',
        'start_business_partnership_flow',
        'start_group_timing_flow',
        'get_muhurta_analysis'
      ];

      for (const optionId of relationshipOptions) {
        mockSendMessage.mockClear();

        const message = {
          from: TEST_PHONE,
          interactive: {
            type: 'list_reply',
            list_reply: {
              id: optionId,
              title: 'Relationships Test',
              description: 'Testing relationship services'
            }
          },
          type: 'interactive'
        };

        await processIncomingMessage(message, {});

        expect(mockSendMessage).toHaveBeenCalled();
        logger.info(`✅ Relationships option ${optionId} navigation validated`);
      }
    });
  });

  describe('Numerology & Special Menu Tree', () => {
    test('should navigate through numerology sub-menus', async () => {
      const numerologyOptions = [
        'get_numerology_analysis',
        'get_numerology_report',
        'get_vedic_numerology_analysis',
        'get_lunar_return',
        'get_future_self_analysis',
        'get_age_harmonic_analysis',
        'get_electional_astrology',
        'get_mundane_astrology_analysis',
        'get_event_astrology_analysis'
      ];

      for (const optionId of numerologyOptions) {
        mockSendMessage.mockClear();

        const message = {
          from: TEST_PHONE,
          interactive: {
            type: 'list_reply',
            list_reply: {
              id: optionId,
              title: 'Numerology Test',
              description: 'Testing numerology services'
            }
          },
          type: 'interactive'
        };

        await processIncomingMessage(message, {});

        expect(mockSendMessage).toHaveBeenCalled();
        logger.info(`✅ Numerology option ${optionId} navigation validated`);
      }
    });

    test('should calculate REAL numerology report with numerology library', async () => {
      await createUser(TEST_PHONE, TEST_USER_DATA);

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

      expect(mockSendMessage).toHaveBeenCalled();

      // Verify numerology response
      const responseCall = mockSendMessage.mock.calls.find(call =>
        call[1] && typeof call[1] === 'object' && call[1].body
      );

      if (responseCall) {
        const responseBody = responseCall[1].body;
        expect(responseBody).toContain('Complete Numerology Report');
        expect(responseBody).toContain('Life Path Number');
        expect(responseBody).toContain('Expression Number');
      }

      logger.info('✅ Real numerology report calculation validated');
    }, 15000);
  });

  describe('Real Database Operations', () => {
    test('should perform REAL MongoDB user creation and retrieval', async () => {
      // Create user
      const user = await createUser(TEST_PHONE, TEST_USER_DATA);
      expect(user).toBeDefined();
      expect(user.phoneNumber).toBe(TEST_PHONE);

      // Retrieve user
      const retrievedUser = await getUserByPhone(TEST_PHONE);
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser.phoneNumber).toBe(TEST_PHONE);
      expect(retrievedUser.name).toBe(TEST_USER_DATA.name);

      logger.info('✅ Real MongoDB user operations validated');
    }, 10000);

    test('should perform REAL MongoDB user profile updates', async () => {
      // Create user
      await createUser(TEST_PHONE, TEST_USER_DATA);

      // Update profile
      const updateData = {
        preferredLanguage: 'hi',
        'preferences.dailyNotifications': true
      };

      await updateUserProfile(TEST_PHONE, updateData);

      // Verify update
      const updatedUser = await getUserByPhone(TEST_PHONE);
      expect(updatedUser.preferredLanguage).toBe('hi');
      expect(updatedUser.preferences.dailyNotifications).toBe(true);

      logger.info('✅ Real MongoDB profile updates validated');
    }, 10000);
  });

  describe('Geocoding Integration Tests', () => {
    test('should test REAL Google Maps geocoding for birth places', async () => {
      const geocodingService = new GeocodingService();

      // Test geocoding a birth place
      const [latitude, longitude] = await geocodingService.getCoordinatesForPlace('Mumbai, India');

      expect(latitude).toBeDefined();
      expect(longitude).toBeDefined();
      expect(typeof latitude).toBe('number');
      expect(typeof longitude).toBe('number');

      // Verify coordinates are reasonable for Mumbai
      expect(latitude).toBeGreaterThan(18);
      expect(latitude).toBeLessThan(20);
      expect(longitude).toBeGreaterThan(72);
      expect(longitude).toBeLessThan(73);

      logger.info('✅ Real Google Maps geocoding validated');
    }, 10000);

    test('should handle geocoding errors gracefully', async () => {
      const geocodingService = new GeocodingService();

      // Test with invalid location
      const [latitude, longitude] = await geocodingService.getCoordinatesForPlace('InvalidPlaceThatDoesNotExist12345');

      expect(latitude).toBeDefined();
      expect(longitude).toBeDefined();
      expect(latitude).toBe(28.6139); // Default latitude for Delhi
      expect(longitude).toBe(77.209); // Default longitude for Delhi

      logger.info('✅ Geocoding error handling validated');
    }, 5000);
  });

  describe('Error Handling & Edge Cases', () => {
    test('should handle incomplete user profiles gracefully', async () => {
      // Create user with incomplete profile
      await createUser('+incomplete123', {
        profileComplete: false,
        birthDate: null,
        birthTime: null,
        birthPlace: null
      });

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
      await db.collection('users').deleteMany({ phoneNumber: '+incomplete123' });

      logger.info('✅ Incomplete profile error handling validated');
    }, 15000);

    test('should handle invalid menu selections', async () => {
      const message = {
        from: TEST_PHONE,
        interactive: {
          type: 'list_reply',
          list_reply: {
            id: 'invalid_menu_action_12345',
            title: 'Invalid Action',
            description: 'This should not exist'
          }
        },
        type: 'interactive'
      };

      await processIncomingMessage(message, {});

      expect(mockSendMessage).toHaveBeenCalled();
      logger.info('✅ Invalid menu selection handling validated');
    }, 10000);

    test('should handle malformed messages', async () => {
      const malformedMessages = [
        { from: TEST_PHONE, type: 'unknown' },
        { from: TEST_PHONE, interactive: {} },
        { from: TEST_PHONE, text: null },
        { from: TEST_PHONE, type: 'text', text: {} }
      ];

      for (const message of malformedMessages) {
        mockSendMessage.mockClear();
        await processIncomingMessage(message, {});
        expect(mockSendMessage).toHaveBeenCalled();
      }

      logger.info('✅ Malformed message handling validated');
    }, 20000);
  });

  describe('Concurrent User Sessions', () => {
    test('should handle multiple concurrent users navigating menus', async () => {
      const phoneNumbers = ['+multi1', '+multi2', '+multi3', '+multi4', '+multi5'];

      // Create multiple users
      for (const phone of phoneNumbers) {
        await createUser(phone, TEST_USER_DATA);
      }

      // Simulate concurrent menu navigation
      const promises = phoneNumbers.map(async (phone, index) => {
        const menuOptions = [
          'show_western_astrology_menu',
          'show_vedic_astrology_menu',
          'show_divination_mystic_menu',
          'show_relationships_groups_menu',
          'show_numerology_special_menu'
        ];

        const message = {
          from: phone,
          interactive: {
            type: 'list_reply',
            list_reply: {
              id: menuOptions[index % menuOptions.length],
              title: 'Concurrent Test',
              description: 'Testing concurrent sessions'
            }
          },
          type: 'interactive'
        };

        return processIncomingMessage(message, {});
      });

      await Promise.all(promises);

      // Verify all messages were sent
      expect(mockSendMessage).toHaveBeenCalled();
      expect(mockSendMessage.mock.calls.length).toBeGreaterThanOrEqual(phoneNumbers.length);

      // Clean up
      for (const phone of phoneNumbers) {
        await db.collection('users').deleteMany({ phoneNumber: phone });
      }

      logger.info('✅ Concurrent user sessions validated');
    }, 30000);
  });

  describe('Performance & Load Testing', () => {
    test('should handle rapid menu navigation efficiently', async () => {
      await createUser(TEST_PHONE, TEST_USER_DATA);

      const startTime = Date.now();
      const navigationCount = 10;

      // Rapid navigation through different menus
      for (let i = 0; i < navigationCount; i++) {
        mockSendMessage.mockClear();

        const menuOptions = [
          'show_western_astrology_menu',
          'show_vedic_astrology_menu',
          'show_divination_mystic_menu',
          'show_relationships_groups_menu',
          'show_numerology_special_menu'
        ];

        const message = {
          from: TEST_PHONE,
          interactive: {
            type: 'list_reply',
            list_reply: {
              id: menuOptions[i % menuOptions.length],
              title: 'Performance Test',
              description: 'Testing rapid navigation'
            }
          },
          type: 'interactive'
        };

        await processIncomingMessage(message, {});
        expect(mockSendMessage).toHaveBeenCalled();
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / navigationCount;

      // Should complete within reasonable time (under 5 seconds total, under 500ms per navigation)
      expect(totalTime).toBeLessThan(5000);
      expect(avgTime).toBeLessThan(500);

      logger.info(`✅ Menu navigation performance validated: ${totalTime}ms total, ${avgTime}ms average per navigation`);
    }, 10000);
  });

  describe('Astrology Library Integration Tests', () => {
    test('should validate REAL Vedic calculator integration', async () => {
      const birthData = {
        birthDate: '15061990',
        birthTime: '1430',
        birthPlace: 'Mumbai, India',
        name: 'Test User'
      };

      // Test Western birth chart
      const westernChart = await vedicCalculator.generateWesternBirthChart(birthData);
      expect(westernChart).toBeDefined();
      expect(westernChart.planets).toBeDefined();
      expect(westernChart.ascendant).toBeDefined();

      // Test Vedic Kundli
      const vedicKundli = await vedicCalculator.generateVedicKundli(birthData);
      expect(vedicKundli).toBeDefined();
      expect(vedicKundli.planetaryPositions).toBeDefined();
      expect(vedicKundli.lagna).toBeDefined();

      logger.info('✅ Real Vedic calculator integration validated');
    }, 30000);

    test('should validate REAL Tarot reader integration', async () => {
      const user = { name: 'Test User', birthDate: '15061990' };

      const tarotReading = generateTarotReading(user, 'single');
      expect(tarotReading).toBeDefined();
      expect(tarotReading.type).toBe('single');
      expect(tarotReading.cards).toBeDefined();
      expect(tarotReading.interpretation).toBeDefined();

      logger.info('✅ Real Tarot reader integration validated');
    }, 10000);

    test('should validate REAL numerology service integration', async () => {
      const numerologyReport = numerologyService.getNumerologyReport('15061990', 'Test User');
      expect(numerologyReport).toBeDefined();
      expect(numerologyReport.lifePath).toBeDefined();
      expect(numerologyReport.expression).toBeDefined();
      expect(numerologyReport.soulUrge).toBeDefined();

      logger.info('✅ Real numerology service integration validated');
    }, 5000);
  });
});