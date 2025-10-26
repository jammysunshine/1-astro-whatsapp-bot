// tests/unit/services/astrology/ichingReader.test.js
// Unit tests for I Ching Reader

const ichingReader = require('../../../src/services/astrology/ichingReader');

// Mock dependencies
jest.mock('../../../src/utils/logger');

describe('IChingReader', () => {
  describe('generateIChingReading', () => {
    it('should generate I Ching reading for valid question', () => {
      const question = 'What is my path?';

      const reading = ichingReader.generateIChingReading(question);

      expect(reading).toBeDefined();
      expect(reading.question).toBe(question);
      expect(reading.hexagram).toBeDefined();
      expect(reading.interpretation).toBeDefined();
    });

    it('should handle empty question', () => {
      const question = '';

      expect(() => ichingReader.generateIChingReading(question)).toThrow();
    });
  });

  describe('castHexagram', () => {
    it('should cast hexagram for question', () => {
      const question = 'What is my path?';

      const hexagram = ichingReader.castHexagram(question);

      expect(hexagram).toBeDefined();
      expect(hexagram.lines).toHaveLength(6);
      expect(hexagram.lines.every(line => line === 0 || line === 1)).toBe(true);
    });
  });

  describe('interpretHexagram', () => {
    it('should interpret hexagram', () => {
      const hexagram = {
        lines: [1, 0, 1, 0, 1, 0]
      };

      const interpretation = ichingReader.interpretHexagram(hexagram);

      expect(interpretation).toBeDefined();
      expect(interpretation.name).toBeDefined();
      expect(interpretation.description).toBeDefined();
    });
  });
});
