// tests/unit/services/astrology/astrocartographyReader.test.js
// Unit tests for Astrocartography Reader

const AstrocartographyService = require('../../../../../src/core/services/astrocartographyService');
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

describe('AstrocartographyService', () => {
  let service;

  beforeEach(() => {
    service = new AstrocartographyService();
  });

  describe('processCalculation', () => {
    it('should generate Astrocartography reading for valid birth data', async () => {
      const birthData = {
        birthDate: '15/03/1990',
        birthTime: '14:30',
        birthPlace: 'Mumbai, India',
        name: 'Test User'
      };

      const result = await service.processCalculation(birthData);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.planetaryLines).toBeDefined();
      expect(result.data.description).toBeDefined();
    });

    it('should handle invalid birth data', async () => {
      const birthData = {
        birthDate: 'invalid',
        birthTime: 'invalid',
        birthPlace: 'invalid',
        name: 'Test User'
      };

      await expect(service.processCalculation(birthData)).rejects.toThrow('Birth date must be in DD/MM/YYYY format');
    });
  });

  describe('getMetadata', () => {
    it('should return service metadata', () => {
      const metadata = service.getMetadata();

      expect(metadata.name).toBe('AstrocartographyService');
      expect(metadata.category).toBe('vedic');
      expect(metadata.description).toContain('Geographic astrology');
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