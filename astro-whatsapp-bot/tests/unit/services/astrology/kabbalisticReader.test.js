// tests/unit/services/astrology/kabbalisticReader.test.js
// Unit tests for Kabbalistic Reader

const kabbalisticReader = require('../../../src/services/astrology/kabbalisticReader');

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

describe('KabbalisticReader', () => {
  describe('generateKabbalisticReading', () => {
    it('should generate Kabbalistic reading for valid birth date', () => {
      const birthDate = '15/03/1990';

      const reading = kabbalisticReader.generateKabbalisticReading(birthDate);

      expect(reading).toBeDefined();
      expect(reading.birthDate).toBe(birthDate);
      expect(reading.sephirot).toBeDefined();
      expect(reading.interpretation).toBeDefined();
    });

    it('should handle invalid birth date', () => {
      const birthDate = 'invalid';

      expect(() => kabbalisticReader.generateKabbalisticReading(birthDate)).toThrow();
    });
  });

  describe('calculateSephirot', () => {
    it('should calculate Sephirot for birth date', () => {
      const birthDate = '15/03/1990';

      const sephirot = kabbalisticReader.calculateSephirot(birthDate);

      expect(sephirot).toBeDefined();
      expect(sephirot).toHaveLength(10);
      expect(sephirot.every(s => s.name && s.description)).toBe(true);
    });
  });

  describe('getKabbalisticPath', () => {
    it('should get Kabbalistic path', () => {
      const birthDate = '15/03/1990';

      const path = kabbalisticReader.getKabbalisticPath(birthDate);

      expect(path).toBeDefined();
      expect(path).toMatch(/^(Crown|Wisdom|Understanding|Mercy|Severity|Beauty|Victory|Glory|Foundation|Kingdom)$/);
    });
  });
});
