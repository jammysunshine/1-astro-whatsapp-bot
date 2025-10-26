// tests/unit/services/astrology/numerologyService.test.js
// Unit tests for Numerology Service

const numerologyService = require('../../../src/services/astrology/numerologyService');

// Mock dependencies
jest.mock('../../../src/utils/logger');

describe('NumerologyService', () => {
  describe('calculateLifePath', () => {
    it('should calculate life path number for valid birth date', () => {
      const birthDate = '15/03/1990';

      const lifePath = numerologyService.calculateLifePath(birthDate);

      expect(lifePath).toBeGreaterThanOrEqual(1);
      expect(lifePath).toBeLessThanOrEqual(9);
    });

    it('should handle invalid birth date', () => {
      const birthDate = 'invalid';

      expect(() => numerologyService.calculateLifePath(birthDate)).toThrow();
    });
  });

  describe('calculateDestinyNumber', () => {
    it('should calculate destiny number for valid name', () => {
      const name = 'John Doe';

      const destiny = numerologyService.calculateDestinyNumber(name);

      expect(destiny).toBeGreaterThanOrEqual(1);
      expect(destiny).toBeLessThanOrEqual(9);
    });

    it('should handle empty name', () => {
      const name = '';

      expect(() => numerologyService.calculateDestinyNumber(name)).toThrow();
    });
  });

  describe('generateNumerologyReport', () => {
    it('should generate numerology report', () => {
      const birthDate = '15/03/1990';
      const name = 'John Doe';

      const report = numerologyService.generateNumerologyReport(birthDate, name);

      expect(report).toBeDefined();
      expect(report.lifePath).toBeDefined();
      expect(report.destiny).toBeDefined();
      expect(report.description).toBeDefined();
    });
  });
});
