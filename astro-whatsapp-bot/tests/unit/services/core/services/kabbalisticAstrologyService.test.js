// tests/unit/services/astrology/kabbalisticReader.test.js
// Unit tests for Kabbalistic Reader

const KabbalisticAstrologyService = require('../../../../src/core/services/kabbalisticAstrologyService');

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

describe('KabbalisticAstrologyService', () => {
  let service;

  beforeEach(() => {
    service = new KabbalisticAstrologyService();
  });

  describe('processCalculation', () => {
    it('should generate Kabbalistic chart for valid birth data', async () => {
      const birthData = {
        birthDate: '1990-03-15T14:30:00.000Z',
        name: 'John Doe'
      };

      const chart = await service.processCalculation(birthData);

      expect(chart).toBeDefined();
      expect(chart.kabbalisticAnalysis).toBeDefined();
      expect(chart.soulCorrection).toBeDefined();
      expect(chart.lifePurpose).toBeDefined();
      expect(chart.spiritualPath).toBeDefined();
      expect(chart.challengesAndGifts).toBeDefined();
      expect(chart.summary).toBeDefined();
    });

    it('should handle invalid birth data gracefully', async () => {
      const birthData = {}; // Invalid input

      await expect(service.processCalculation(birthData)).rejects.toThrow('Birth data is required');
    });
  });

  describe('getMetadata', () => {
    it('should return service metadata', () => {
      const metadata = service.getMetadata();

      expect(metadata.name).toBe('KabbalisticAstrologyService');
      expect(metadata.category).toBe('kabbalistic');
      expect(metadata.methods).toContain('processCalculation');
    });
  });
});