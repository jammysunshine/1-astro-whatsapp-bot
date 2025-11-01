// tests/unit/services/astrology/mayanReader.test.js
// Unit tests for Mayan Reader

const MayanAstrologyService = require('src/core/services/mayanAstrologyService');

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

describe('MayanAstrologyService', () => {
  let service;

  beforeEach(() => {
    service = new MayanAstrologyService();
  });

  describe('processCalculation', () => {
    it('should generate Mayan chart for valid birth data', async () => {
      const birthData = {
        birthDate: '1990-03-15T14:30:00.000Z',
        name: 'John Doe'
      };

      const chart = await service.processCalculation(birthData);

      expect(chart).toBeDefined();
      expect(chart.mayanAnalysis).toBeDefined();
      expect(chart.cosmicSignature).toBeDefined();
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

      expect(metadata.name).toBe('MayanAstrologyService');
      expect(metadata.category).toBe('mayan');
      expect(metadata.methods).toContain('processCalculation');
    });
  });
});