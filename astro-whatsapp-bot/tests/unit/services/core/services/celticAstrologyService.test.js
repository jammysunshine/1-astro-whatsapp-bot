// tests/unit/services/astrology/celticReader.test.js
// Unit tests for Celtic Reader

const CelticAstrologyService = require('../../../../../src/core/services/celticAstrologyService');

// Mock dependencies
const logger = require('../../../../../src/utils/logger');

beforeEach(() => {
  jest.spyOn(logger, 'info').mockImplementation(() => {});
  jest.spyOn(logger, 'error').mockImplementation(() => {});
  jest.spyOn(logger, 'warn').mockImplementation(() => {});
  jest.spyOn(logger, 'debug').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('CelticAstrologyService', () => {
  let service;

  beforeEach(() => {
    service = new CelticAstrologyService();
  });

  describe('processCalculation', () => {
    it('should generate Celtic chart for valid birth data', async () => {
      const birthData = {
        birthDate: '1990-03-15T14:30:00.000Z',
        name: 'John Doe'
      };

      const chart = await service.processCalculation(birthData);

      expect(chart).toBeDefined();
      expect(chart.celticAnalysis).toBeDefined();
      expect(chart.celticAnalysis.treeSign).toBeDefined();
      expect(chart.celticAnalysis.animalTotem).toBeDefined();
      expect(chart.treeSignTraits).toBeDefined();
      expect(chart.animalTotemInsights).toBeDefined();
      expect(chart.spiritualConnections).toBeDefined();
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

      expect(metadata.name).toBe('CelticAstrologyService');
      expect(metadata.category).toBe('celtic');
      expect(metadata.methods).toContain('processCalculation');
    });
  });
});