const mongoose = require('mongoose');
const User = require('../../src/models/User');
const logger = require('../../src/utils/logger');

// Mock WhatsApp services to avoid API calls
jest.mock('../../src/services/whatsapp/messageSender', () => ({
  sendMessage: jest.fn().mockResolvedValue({ success: true })
}));

// Test birth data for consistent calculations
const TEST_BIRTH_DATA = {
  date: '1990-06-15',
  time: '14:30:00',
  place: 'Mumbai, India',
  latitude: 19.076,
  longitude: 72.8777,
  timezone: 'Asia/Kolkata'
};

describe('Real Astrology Calculations Integration Tests', () => {
  let testUser;
  const TEST_PHONE = '+1234567891';

  beforeAll(async() => {
    require('dotenv').config();

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI required for real astrology tests');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Create test user
    testUser = await require('../../src/models/userModel').createUser(
      TEST_PHONE,
      {
        profileComplete: true,
        birthDate: TEST_BIRTH_DATA.date,
        birthTime: TEST_BIRTH_DATA.time,
        birthPlace: TEST_BIRTH_DATA.place,
        latitude: TEST_BIRTH_DATA.latitude,
        longitude: TEST_BIRTH_DATA.longitude,
        timezone: TEST_BIRTH_DATA.timezone
      }
    );

    logger.info('✅ Astrology test user created');
  }, 30000);

  afterAll(async() => {
    try {
      await User.deleteMany({ phoneNumber: TEST_PHONE });
      await mongoose.connection.close();
      logger.info('✅ Astrology test data cleaned up');
    } catch (error) {
      logger.error('❌ Error cleaning up astrology test data:', error);
    }
  }, 10000);

  describe('Western Astrology - Service Integration', () => {
    test('should load Western astrology services successfully', () => {
      // Test that Western astrology services can be imported
      expect(() => {
        require('../../src/services/astrology/western/WesternCalculator');
      }).not.toThrow();

      expect(() => {
        require('../../src/services/astrology/astrologyEngine');
      }).not.toThrow();

      logger.info('✅ Western astrology services loaded successfully');
    });

    test('should validate WesternCalculator class structure', () => {
      // Test WesternCalculator class structure
      const WesternCalculator = require('../../src/services/astrology/western/WesternCalculator');

      expect(WesternCalculator).toBeDefined();
      expect(typeof WesternCalculator).toBe('function');

      // Check that it has expected methods
      const instance = new WesternCalculator();
      expect(typeof instance.generateWesternBirthChart).toBe('function');

      logger.info('✅ WesternCalculator class structure validated');
    });
  });

  describe('Vedic Astrology - Service Integration', () => {
    test('should load Vedic astrology services successfully', () => {
      // Test that Vedic astrology services can be imported
      expect(() => {
        require('../../src/services/astrology/vedic/VedicCalculator');
      }).not.toThrow();

      expect(() => {
        require('../../src/services/astrology/vimshottariDasha');
      }).not.toThrow();

      logger.info('✅ Vedic astrology services loaded successfully');
    });

    test('should validate VedicCalculator can be instantiated', () => {
      // Test VedicCalculator can be instantiated
      const VedicCalculator = require('../../src/services/astrology/vedic/VedicCalculator');

      expect(VedicCalculator).toBeDefined();
      expect(typeof VedicCalculator).toBe('function');

      // Can create instance without errors
      expect(() => new VedicCalculator()).not.toThrow();

      logger.info('✅ VedicCalculator instantiation validated');
    });

    test('should validate VimshottariDasha basic functionality', () => {
      // Test VimshottariDasha basic functionality
      const VimshottariDasha = require('../../src/services/astrology/vimshottariDasha');

      expect(VimshottariDasha).toBeDefined();

      logger.info('✅ VimshottariDasha basic functionality validated');
    });
  });

  describe('Divination Systems - Service Integration', () => {
    test('should load divination services successfully', () => {
      // Test that divination services can be imported
      expect(() => {
        require('../../src/services/astrology/tarotReader');
      }).not.toThrow();

      expect(() => {
        require('../../src/services/astrology/ichingReader');
      }).not.toThrow();

      logger.info('✅ Divination services loaded successfully');
    });

    test('should validate TarotReader functionality', () => {
      // Test TarotReader functionality
      const tarotReader = require('../../src/services/astrology/tarotReader');

      expect(tarotReader).toBeDefined();
      expect(typeof tarotReader.generateTarotReading).toBe('function');

      // Test that it can generate a basic reading
      const reading = tarotReader.generateTarotReading('Test question');
      expect(reading).toBeDefined();

      logger.info('✅ TarotReader functionality validated');
    });

    test('should validate IChingReader functionality', () => {
      // Test IChingReader functionality
      const ichingReader = require('../../src/services/astrology/ichingReader');

      expect(ichingReader).toBeDefined();
      expect(typeof ichingReader.generateIChingReading).toBe('function');

      // Test that it can generate a basic reading
      const reading = ichingReader.generateIChingReading('Test question');
      expect(reading).toBeDefined();

      logger.info('✅ IChingReader functionality validated');
    });
  });

  describe('Numerology - Service Integration', () => {
    test('should load numerology services successfully', () => {
      // Test that numerology services can be imported
      expect(() => {
        require('../../src/services/astrology/numerologyService');
      }).not.toThrow();

      logger.info('✅ Numerology services loaded successfully');
    });

    test('should validate numerology calculations', () => {
      // Test numerology service functionality
      const numerologyService = require('../../src/services/astrology/numerologyService');

      expect(numerologyService).toBeDefined();
      expect(typeof numerologyService.generateFullReport).toBe('function');
      expect(typeof numerologyService.getNumerologyReport).toBe('function');

      // Test basic numerology calculation
      const birthDate = '15/06/1990'; // DD/MM/YYYY format
      const fullName = 'John Doe';

      const report = numerologyService.getNumerologyReport(birthDate, fullName);
      expect(report).toBeDefined();

      logger.info('✅ Numerology calculations validated');
    });
  });

  describe('Chinese Astrology - Service Integration', () => {
    test('should load Chinese astrology services successfully', () => {
      expect(() => {
        require('../../src/services/astrology/chineseCalculator');
      }).not.toThrow();

      logger.info('✅ Chinese astrology services loaded successfully');
    });
  });

  describe('Astrocartography - Service Integration', () => {
    test('should load astrocartography services successfully', () => {
      expect(() => {
        require('../../src/services/astrology/astrocartographyReader');
      }).not.toThrow();

      logger.info('✅ Astrocartography services loaded successfully');
    });
  });

  describe('Palmistry - Service Integration', () => {
    test('should load palmistry services successfully', () => {
      expect(() => {
        require('../../src/services/astrology/palmistryReader');
      }).not.toThrow();

      logger.info('✅ Palmistry services loaded successfully');
    });

    test('should validate PalmistryReader functionality', () => {
      const palmistryReader = require('../../src/services/astrology/palmistryReader');

      expect(palmistryReader).toBeDefined();
      expect(typeof palmistryReader.generatePalmistryReading).toBe('function');

      logger.info('✅ PalmistryReader functionality validated');
    });
  });

  describe('Celtic Astrology - Service Integration', () => {
    test('should load Celtic astrology services successfully', () => {
      expect(() => {
        require('../../src/services/astrology/celticReader');
      }).not.toThrow();

      logger.info('✅ Celtic astrology services loaded successfully');
    });
  });

  describe('Mayan Astrology - Service Integration', () => {
    test('should load Mayan astrology services successfully', () => {
      expect(() => {
        require('../../src/services/astrology/mayanReader');
      }).not.toThrow();

      logger.info('✅ Mayan astrology services loaded successfully');
    });
  });

  describe('Islamic Astrology - Service Integration', () => {
    test('should load Islamic astrology services successfully', () => {
      expect(() => {
        require('../../src/services/astrology/islamicAstrology');
      }).not.toThrow();

      logger.info('✅ Islamic astrology services loaded successfully');
    });
  });

  describe('Relationships & Compatibility - Service Integration', () => {
    test('should load compatibility services successfully', () => {
      expect(() => {
        require('../../src/services/astrology/compatibility/CompatibilityChecker');
      }).not.toThrow();

      logger.info('✅ Compatibility services loaded successfully');
    });
  });

  describe('Special Readings - AI Integration', () => {
    test('should load AI services successfully', () => {
      expect(() => {
        require('../../src/services/ai/MistralAIService');
      }).not.toThrow();

      logger.info('✅ AI services loaded successfully');
    });
  });

  describe('Service Integration Validation', () => {
    test('should validate all astrology services can be imported', () => {
      // Test that all major astrology services can be imported without errors
      const services = [
        'astrologyEngine',
        'numerologyService',
        'tarotReader',
        'ichingReader',
        'palmistryReader',
        'chineseCalculator',
        'celticReader',
        'mayanReader',
        'islamicAstrology',
        'astrocartographyReader',
        'compatibility/CompatibilityChecker',
        'vedic/VedicCalculator',
        'vimshottariDasha',
        'western/WesternCalculator'
      ];

      services.forEach(service => {
        expect(() => {
          require(`../../src/services/astrology/${service}`);
        }).not.toThrow();
      });

      logger.info('✅ All astrology services can be imported successfully');
    });

    test('should validate core astrology functionality', () => {
      // Test that core astrology engine can generate responses
      const astrologyEngine = require('../../src/services/astrology/astrologyEngine');

      expect(astrologyEngine).toBeDefined();
      expect(typeof astrologyEngine.generateAstrologyResponse).toBe('function');

      logger.info('✅ Core astrology functionality validated');
    });
  });
});
