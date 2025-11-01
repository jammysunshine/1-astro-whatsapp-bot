// tests/unit/services/astrology/chineseCalculator.test.js
// Unit tests for Chinese Calculator

const ChineseAstrologyService = require('src/core/services/chineseAstrologyService');

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

describe('ChineseAstrologyService', () => {
  let service;

  beforeEach(() => {
    service = new ChineseAstrologyService();
  });

  describe('processCalculation', () => {
    it('should calculate Chinese astrology for valid birth data', async () => {
      const birthData = {
        birthDate: '1990-03-15T14:30:00.000Z',
        name: 'John Doe'
      };

      const result = await service.processCalculation(birthData);

      expect(result).toBeDefined();
      expect(result.chineseAnalysis).toBeDefined();
      expect(result.chineseAnalysis.zodiacAnimal).toBe('Horse');
      expect(result.zodiacTraits).toBeDefined();
      expect(result.elementInfluence).toBeDefined();
      expect(result.compatibility).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it('should handle invalid birth data gracefully', async () => {
      const birthData = {}; // Invalid input

      await expect(service.processCalculation(birthData)).rejects.toThrow('Birth data is required');
    });
  });

  describe('getMetadata', () => {
    it('should return service metadata', () => {
      const metadata = service.getMetadata();

      expect(metadata.name).toBe('ChineseAstrologyService');
      expect(metadata.category).toBe('chinese');
      expect(metadata.methods).toContain('processCalculation');
    });
  });
});