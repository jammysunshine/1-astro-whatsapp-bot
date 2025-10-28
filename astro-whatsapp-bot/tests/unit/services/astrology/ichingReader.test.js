// tests/unit/services/astrology/ichingReader.test.js
// Unit tests for I Ching Reader

const ichingReader = require('../../../src/services/astrology/ichingReader');

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

describe('IChingReader', () => {
  describe('generateIChingReading', () => {
    it('should generate I Ching reading for valid question', () => {
      const question = 'What is my path?';

      const reading = ichingReader.generateIChingReading(question);

      expect(reading).toBeDefined();
      expect(reading.question).toBe(question);
      expect(reading.primaryHexagram).toBeDefined();
      expect(reading.interpretation).toBeDefined();
      expect(reading.ichingDescription).toBeDefined();
    });

    it('should generate I Ching reading without a question', () => {
      const reading = ichingReader.generateIChingReading();

      expect(reading).toBeDefined();
      expect(reading.question).toBe('General guidance');
      expect(reading.primaryHexagram).toBeDefined();
      expect(reading.interpretation).toBeDefined();
      expect(reading.ichingDescription).toBeDefined();
    });

    it('should handle errors during reading generation', () => {
      // Mock a scenario that causes an error, e.g., by temporarily breaking a dependency
      jest.spyOn(ichingReader, 'generateHexagram').mockImplementation(() => {
        throw new Error('Test error');
      });

      const reading = ichingReader.generateIChingReading('Test question');

      expect(reading).toBeDefined();
      expect(reading.error).toBeDefined();
      expect(reading.fallback).toBeDefined();

      jest.restoreAllMocks(); // Restore the mock
    });
  });
});
