// tests/unit/services/astrology/horaryReader.test.js
// Unit tests for Horary Reader

const HoraryReadingService = require('src/core/services/horaryReadingService');

// Mock dependencies
const logger = require('src/utils/logger');

beforeEach(() => {
  jest.spyOn(logger, 'info').mockImplementation(() => {});
  jest.spyOn(logger, 'error').mockImplementation(() => {});
  jest.spyOn(logger, 'warn').mockImplementation(() => {});
  jest.spyOn(logger, 'debug').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('HoraryReadingService', () => {
  let service;

  beforeEach(() => {
    service = new HoraryReadingService();
  });

  describe('processCalculation', () => {
    it('should generate Horary reading for valid question', async () => {
      const questionData = {
        question: 'Will I get the job?',
        questionTime: '2025-11-01T14:30:00.000Z',
        location: { latitude: 34.0522, longitude: -118.2437 } // Los Angeles
      };

      const reading = await service.processCalculation(questionData);

      expect(reading).toBeDefined();
      expect(reading.question.text).toBe(questionData.question);
      expect(reading.chart).toBeDefined();
      expect(reading.answer).toBeDefined();
      expect(reading.timing).toBeDefined();
    });

    it('should handle invalid question data (missing question)', async () => {
      const questionData = {
        questionTime: '2025-11-01T14:30:00.000Z',
        location: { latitude: 34.0522, longitude: -118.2437 }
      };

      await expect(service.processCalculation(questionData)).rejects.toThrow('question is required for horary reading');
    });

    it('should handle invalid question data (missing questionTime)', async () => {
      const questionData = {
        question: 'Will I get the job?',
        location: { latitude: 34.0522, longitude: -118.2437 }
      };

      await expect(service.processCalculation(questionData)).rejects.toThrow('questionTime is required for horary reading');
    });

    it('should handle invalid questionTime format', async () => {
      const questionData = {
        question: 'Will I get the job?',
        questionTime: 'invalid time',
        location: { latitude: 34.0522, longitude: -118.2437 }
      };

      await expect(service.processCalculation(questionData)).rejects.toThrow('Question time must be in ISO 8601 format');
    });
  });

  describe('getMetadata', () => {
    it('should return service metadata', () => {
      const metadata = service.getMetadata();

      expect(metadata.name).toBe('HoraryReadingService');
      expect(metadata.category).toBe('vedic');
      expect(metadata.description).toContain('horary charts');
    });
  });

  describe('getHelp', () => {
    it('should return help information string', () => {
      const help = service.getHelp();
      expect(typeof help).toBe('string');
      expect(help).toContain('Horary Reading Service');
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status when service is working', async () => {
      const health = await service.getHealthStatus();

      expect(health.status).toBe('healthy');
      expect(health.timestamp).toBeDefined();
    });
  });
});