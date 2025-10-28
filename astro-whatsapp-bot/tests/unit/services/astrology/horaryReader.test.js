// tests/unit/services/astrology/horaryReader.test.js
// Unit tests for Horary Reader

const horaryReader = require('../../../src/services/astrology/horaryReader');

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

describe('HoraryReader', () => {
  describe('generateHoraryReading', () => {
    it('should generate Horary reading for valid question', () => {
      const question = 'Will I get the job?';

      const reading = horaryReader.generateHoraryReading(question);

      expect(reading).toBeDefined();
      expect(reading.question).toBe(question);
      expect(reading.answer).toBeDefined();
    });

    it('should handle empty question', () => {
      const question = '';

      expect(() => horaryReader.generateHoraryReading(question)).toThrow();
    });
  });

  describe('calculateHoraryChart', () => {
    it('should calculate Horary chart', () => {
      const question = 'Will I get the job?';
      const birthDate = '15/03/1990';

      const chart = horaryReader.calculateHoraryChart(question, birthDate);

      expect(chart).toBeDefined();
      expect(chart.sign).toBeDefined();
      expect(chart.house).toBeDefined();
    });
  });

  describe('interpretHoraryAnswer', () => {
    it('should interpret Horary answer', () => {
      const chart = {
        sign: 'Pisces',
        house: 10
      };

      const answer = horaryReader.interpretHoraryAnswer(chart);

      expect(answer).toBeDefined();
      expect(answer).toMatch(/^(Yes|No|Maybe)$/);
    });
  });
});
