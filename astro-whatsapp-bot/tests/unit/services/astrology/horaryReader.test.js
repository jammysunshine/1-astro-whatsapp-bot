// tests/unit/services/astrology/horaryReader.test.js
// Unit tests for Horary Reader

const horaryReader = require('../../../../src/services/astrology/horary/index.js');

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

describe('HoraryReader', () => {
  describe('generateHoraryReading', () => {
    it('should generate Horary reading for valid question', () => {
      const question = 'Will I get the job?';
      const questionTime = '15/03/2024 14:30';
      const location = { latitude: 34.0522, longitude: -118.2437 }; // Los Angeles

      const reading = horaryReader.generateHoraryReading(
        question,
        questionTime,
        location
      );

      expect(reading).toBeDefined();
      expect(reading.question).toBe(question);
      expect(reading.valid).toBe(true);
      expect(reading.chart).toBeDefined();
      expect(reading.judge).toBeDefined();
      expect(reading.questionAnalysis).toBeDefined();
      expect(reading.answer).toBeDefined();
      expect(reading.timing).toBeDefined();
      expect(reading.disclaimer).toBeDefined();
      expect(reading.horaryDescription).toBeDefined();
    });

    it('should handle invalid question gracefully', () => {
      const question = 'abc'; // Too short
      const questionTime = '15/03/2024 14:30';
      const location = { latitude: 34.0522, longitude: -118.2437 };

      const reading = horaryReader.generateHoraryReading(
        question,
        questionTime,
        location
      );

      expect(reading).toBeDefined();
      expect(reading.valid).toBe(false);
      expect(reading.reason).toBeDefined();
      expect(reading.advice).toBeDefined();
    });

    it('should handle inappropriate questions', () => {
      const question = 'Will I win the lottery?';
      const questionTime = '15/03/2024 14:30';
      const location = { latitude: 34.0522, longitude: -118.2437 };

      const reading = horaryReader.generateHoraryReading(
        question,
        questionTime,
        location
      );

      expect(reading).toBeDefined();
      expect(reading.valid).toBe(false);
      expect(reading.reason).toBeDefined();
      expect(reading.advice).toBeDefined();
    });

    it('should handle errors during chart generation', () => {
      const question = 'Will I get the job?';
      const questionTime = 'invalid time'; // This will cause an error
      const location = { latitude: 34.0522, longitude: -118.2437 };

      const reading = horaryReader.generateHoraryReading(
        question,
        questionTime,
        location
      );

      expect(reading).toBeDefined();
      expect(reading.valid).toBe(false);
      expect(reading.error).toBeDefined();
      expect(reading.fallback).toBeDefined();
    });
  });
});
