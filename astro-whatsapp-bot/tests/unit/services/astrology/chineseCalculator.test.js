// tests/unit/services/astrology/chineseCalculator.test.js
// Unit tests for Chinese Calculator

const chineseCalculator = require('../../../../src/services/astrology/chineseCalculator');

// Mock dependencies
const logger = require('../../../../src/utils/logger');

beforeEach(() => {
  jest.spyOn(logger, 'info').mockImplementation(() => {});
  jest.spyOn(logger, 'error').mockImplementation(() => {});
  jest.spyOn(logger, 'warn').mockImplementation(() => {});
  jest.spyOn(logger, 'debug').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ChineseCalculator', () => {
  describe('getChineseZodiac', () => {
    it('should calculate Chinese zodiac for valid birth date', () => {
      const birthDate = '15/03/1990'; // Year of the Horse

      const zodiac = chineseCalculator.getChineseZodiac(birthDate);

      expect(zodiac).toBeDefined();
      expect(zodiac.animal).toBe('Horse');
      expect(zodiac.element).toBeDefined();
      expect(zodiac.traits).toBeDefined();
      expect(zodiac.elementTraits).toBeDefined();
    });

    it('should handle invalid birth date for Chinese zodiac', () => {
      const birthDate = 'invalid';

      const zodiac = chineseCalculator.getChineseZodiac(birthDate);

      expect(zodiac).toBeDefined();
      expect(zodiac.error).toBeDefined();
    });
  });

  describe('calculateFourPillars', () => {
    it('should calculate Four Pillars for valid birth data', () => {
      const birthDate = '15/03/1990';
      const birthTime = '14:30';

      const pillars = chineseCalculator.calculateFourPillars(birthDate, birthTime);

      expect(pillars).toBeDefined();
      expect(pillars.pillars).toBeDefined();
      expect(pillars.dayMaster).toBeDefined();
      expect(pillars.elementAnalysis).toBeDefined();
      expect(pillars.chineseNotation).toBeDefined();
      expect(pillars.interpretation).toBeDefined();
    });

    it('should handle invalid birth data for Four Pillars', () => {
      const birthDate = 'invalid';
      const birthTime = 'invalid';

      const pillars = chineseCalculator.calculateFourPillars(birthDate, birthTime);

      expect(pillars).toBeDefined();
      expect(pillars.error).toBeDefined();
    });
  });
});
