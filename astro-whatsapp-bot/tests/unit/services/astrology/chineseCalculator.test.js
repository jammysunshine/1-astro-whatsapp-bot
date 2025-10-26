// tests/unit/services/astrology/chineseCalculator.test.js
// Unit tests for Chinese Calculator

const chineseCalculator = require('../../../src/services/astrology/chineseCalculator');

// Mock dependencies
jest.mock('../../../src/utils/logger');

describe('ChineseCalculator', () => {
  describe('calculateChineseSign', () => {
    it('should calculate Chinese sign for valid birth year', () => {
      const birthYear = 1990;

      const sign = chineseCalculator.calculateChineseSign(birthYear);

      expect(sign).toBeDefined();
      expect(sign).toMatch(/^(Rat|Ox|Tiger|Rabbit|Dragon|Snake|Horse|Goat|Monkey|Rooster|Dog|Pig)$/);
    });

    it('should handle invalid birth year', () => {
      const birthYear = 'invalid';

      expect(() => chineseCalculator.calculateChineseSign(birthYear)).toThrow();
    });
  });

  describe('generateChineseReading', () => {
    it('should generate Chinese reading for valid sign', () => {
      const sign = 'Dragon';

      const reading = chineseCalculator.generateChineseReading(sign);

      expect(reading).toBeDefined();
      expect(reading.sign).toBe(sign);
      expect(reading.description).toBeDefined();
    });
  });

  describe('getElement', () => {
    it('should get element for sign', () => {
      const sign = 'Dragon';

      const element = chineseCalculator.getElement(sign);

      expect(element).toBeDefined();
      expect(element).toMatch(/^(Wood|Fire|Earth|Metal|Water)$/);
    });
  });
});
