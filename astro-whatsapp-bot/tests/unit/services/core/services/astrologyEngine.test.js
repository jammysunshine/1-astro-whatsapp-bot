// tests/unit/services/core/services/astrologyEngine.test.js
// Unit tests for Astrology Engine

const AstrologyEngine = require('../../../../src/core/services/astrologyEngine');
const logger = require('../../../../src/utils/logger');

// Mock logger to prevent console output during tests
beforeEach(() => {
  jest.spyOn(logger, 'info').mockImplementation(() => {});
  jest.spyOn(logger, 'error').mockImplementation(() => {});
  jest.spyOn(logger, 'warn').mockImplementation(() => {});
  jest.spyOn(logger, 'debug').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks(); // Restore all mocks after each test
});

describe('AstrologyEngine', () => {
  let engine;

  beforeEach(async () => {
    engine = new AstrologyEngine();
    // If the service has an initialize method, call it here
    if (engine.initialize) {
      await engine.initialize();
    }
  });

  describe('generateAstrologyResponse', () => {
    it('should generate astrology response for valid user', async() => {
      const user = {
        sunSign: 'Pisces',
        moonSign: 'Pisces',
        risingSign: 'Aquarius',
        birthDate: '15/03/1990',
        birthTime: '14:30',
        birthPlace: 'Mumbai, India'
      };

      const response = await engine.generateAstrologyResponse(
        'hello',
        user
      );

      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
    });

    it('should handle different types of queries', async () => {
      const user = {
        sunSign: 'Leo',
        moonSign: 'Cancer',
        risingSign: 'Virgo',
        birthDate: '20/07/1985',
        birthTime: '10:15',
        birthPlace: 'Delhi, India'
      };

      const queries = ['daily horoscope', 'birth chart', 'compatibility', 'tarot'];

      for (const query of queries) {
        const response = await engine.generateAstrologyResponse(query, user);
        expect(response).toBeDefined();
        expect(typeof response).toBe('string');
        expect(response.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateBirthData', () => {
    it('should validate valid birth data', () => {
      const result = engine.validateBirthData(
        '15031990',
        '1430',
        'Mumbai, India'
      );

      expect(result.isValid).toBe(true);
    });

    it('should validate birth data without time', () => {
      const result = engine.validateBirthData(
        '15031990',
        null,
        'Mumbai, India'
      );

      expect(result.isValid).toBe(true);
    });

    it('should reject invalid birth data', () => {
      const result = engine.validateBirthData('invalid', '', '');

      expect(result.isValid).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should reject missing birth place', () => {
      const result = engine.validateBirthData('15031990', '1430', '');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('birth place');
    });
  });

  describe('getUserAstrologicalProfile', () => {
    it('should return astrological profile for user', () => {
      const user = {
        sunSign: 'Pisces',
        moonSign: 'Cancer',
        risingSign: 'Sagittarius',
        birthDate: '15/03/1990',
        birthTime: '14:30',
        birthPlace: 'Mumbai, India'
      };

      const profile = engine.getUserAstrologicalProfile(user);

      expect(profile).toBeDefined();
      expect(profile.sunSign).toBe('Pisces');
      expect(profile.moonSign).toBe('Cancer');
      expect(profile.risingSign).toBe('Sagittarius');
      expect(profile.elements).toBeDefined();
      expect(profile.modalities).toBeDefined();
    });

    it('should handle incomplete user data', () => {
      const user = {
        sunSign: 'Aries',
        birthDate: '21/03/1995'
      };

      const profile = engine.getUserAstrologicalProfile(user);

      expect(profile).toBeDefined();
      expect(profile.sunSign).toBe('Aries');
      expect(profile.moonSign).toBeUndefined();
      expect(profile.risingSign).toBeUndefined();
    });
  });

  describe('analyzeCompatibility', () => {
    it('should analyze compatibility between two users', () => {
      const user1 = {
        sunSign: 'Pisces',
        moonSign: 'Cancer',
        risingSign: 'Scorpio'
      };

      const user2 = {
        sunSign: 'Virgo',
        moonSign: 'Capricorn',
        risingSign: 'Taurus'
      };

      const compatibility = engine.analyzeCompatibility(user1, user2);

      expect(compatibility).toBeDefined();
      expect(compatibility.score).toBeDefined();
      expect(compatibility.score).toBeGreaterThanOrEqual(0);
      expect(compatibility.score).toBeLessThanOrEqual(100);
      expect(compatibility.aspects).toBeDefined();
      expect(compatibility.recommendation).toBeDefined();
    });

    it('should handle missing data gracefully', () => {
      const user1 = { sunSign: 'Aries' };
      const user2 = { sunSign: 'Libra' };

      const compatibility = engine.analyzeCompatibility(user1, user2);

      expect(compatibility).toBeDefined();
      expect(compatibility.score).toBeDefined();
      expect(compatibility.limitedData).toBe(true);
    });
  });

  describe('getTransitAnalysis', () => {
    it('should provide transit analysis for user', () => {
      const user = {
        sunSign: 'Pisces',
        moonSign: 'Cancer',
        risingSign: 'Sagittarius',
        birthDate: '15/03/1990'
      };

      const transits = engine.getTransitAnalysis(user);

      expect(transits).toBeDefined();
      expect(transits.current).toBeDefined();
      expect(transits.upcoming).toBeDefined();
      expect(transits.impacts).toBeDefined();
    });

    it('should handle different time periods', () => {
      const user = {
        sunSign: 'Leo',
        birthDate: '20/07/1985'
      };

      const transits = engine.getTransitAnalysis(user, 30); // 30 days

      expect(transits).toBeDefined();
      expect(transits.period).toBe(30);
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status', async () => {
      const health = await engine.getHealthStatus();

      expect(health).toBeDefined();
      expect(health.status).toBe('healthy');
      expect(health.timestamp).toBeDefined();
    });
  });
});