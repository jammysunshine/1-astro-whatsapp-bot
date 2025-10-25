// tests/unit/services/astrology/astrologyEngine.test.js
// Unit tests for Astrology Engine

const astrologyEngine = require('../../../src/services/astrology/astrologyEngine');

// Mock all astrology readers
jest.mock('../../../src/services/astrology/vedicCalculator');
jest.mock('../../../src/services/astrology/chineseCalculator');
jest.mock('../../../src/services/astrology/tarotReader');
jest.mock('../../../src/services/astrology/palmistryReader');
jest.mock('../../../src/services/astrology/nadiReader');
jest.mock('../../../src/services/astrology/kabbalisticReader');
jest.mock('../../../src/services/astrology/mayanReader');
jest.mock('../../../src/services/astrology/celticReader');
jest.mock('../../../src/services/astrology/ichingReader');
jest.mock('../../../src/services/astrology/astrocartographyReader');
jest.mock('../../../src/services/astrology/horaryReader');
jest.mock('../../../src/services/astrology/numerologyService');

describe('AstrologyEngine', () => {
  describe('generateCompleteReading', () => {
    it('should generate complete reading for valid user', () => {
      const user = {
        sunSign: 'Pisces',
        moonSign: 'Pisces',
        risingSign: 'Aquarius',
        birthDate: '15/03/1990',
        birthTime: '14:30',
        birthPlace: 'Mumbai, India',
      };

      const reading = astrologyEngine.generateCompleteReading(user, 'vedic');

      expect(reading).toBeDefined();
      expect(reading.system).toBe('vedic');
      expect(reading.user).toEqual(user);
    });
  });

  describe('getAvailableSystems', () => {
    it('should return list of available astrology systems', () => {
      const systems = astrologyEngine.getAvailableSystems();

      expect(systems).toContain('vedic');
      expect(systems).toContain('western');
      expect(systems).toContain('chinese');
      expect(systems).toContain('tarot');
    });
  });

  describe('validateBirthData', () => {
    it('should validate valid birth data', () => {
      const birthData = {
        date: '15/03/1990',
        time: '14:30',
        place: 'Mumbai, India',
      };

      const isValid = astrologyEngine.validateBirthData(birthData);

      expect(isValid).toBe(true);
    });

    it('should reject invalid birth data', () => {
      const birthData = {
        date: 'invalid',
        time: 'invalid',
        place: '',
      };

      const isValid = astrologyEngine.validateBirthData(birthData);

      expect(isValid).toBe(false);
    });
  });
});