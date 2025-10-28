// tests/unit/services/astrology/celticReader.test.js
// Unit tests for Celtic Reader

const celticReader = require('../../../src/services/astrology/celticReader');

// Mock dependencies
const logger = require('../../../src/utils/logger');

beforeEach(() => {
  jest.spyOn(logger, 'info').mockImplementation(() => {});
  jest.spyOn(logger, 'error').mockImplementation(() => {});
  jest.spyOn(logger, 'warn').mockImplementation(() => {});
  jest.spyOn(logger, 'debug').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('CelticReader', () => {
  describe('generateCelticReading', () => {
    it('should generate Celtic reading for valid sign', () => {
      const sign = 'Dragon';

      const reading = celticReader.generateCelticReading(sign);

      expect(reading).toBeDefined();
      expect(reading.sign).toBe(sign);
      expect(reading.description).toBeDefined();
    });

    it('should handle invalid sign', () => {
      const sign = 'invalid';

      expect(() => celticReader.generateCelticReading(sign)).toThrow();
    });
  });

  describe('getCelticElement', () => {
    it('should get Celtic element for sign', () => {
      const sign = 'Dragon';

      const element = celticReader.getCelticElement(sign);

      expect(element).toBeDefined();
      expect(element).toMatch(/^(Earth|Air|Fire|Water)$/);
    });
  });

  describe('generateCelticHoroscope', () => {
    it('should generate Celtic horoscope', () => {
      const birthDate = '15/03/1990';

      const horoscope = celticReader.generateCelticHoroscope(birthDate);

      expect(horoscope).toBeDefined();
      expect(horoscope.sign).toBeDefined();
      expect(horoscope.daily).toBeDefined();
    });
  });
});
