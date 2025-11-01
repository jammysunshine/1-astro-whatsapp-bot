// tests/unit/services/astrology/palmistryReader.test.js
// Unit tests for Palmistry reading service

const PalmistryService = require('src/core/services/palmistryService');

// Mock dependencies
const logger = require('src/utils/logger');

// Mock the PalmistryReader calculator
jest.mock('src/core/services/calculators/palmistryReader', () => {
  return jest.fn().mockImplementation(() => ({
    readPalm: jest.fn(async (handData, options) => {
      if (!handData || Object.keys(handData).length === 0) {
        throw new Error('Hand data is required for palm reading');
      }
      return {
        lines: ['Life Line', 'Heart Line'],
        mounts: ['Mount of Venus'],
        shapes: ['Square Hand'],
        interpretation: 'A sample palmistry interpretation.',
        handData: handData,
        options: options
      };
    }),
  }));
});

describe('PalmistryService', () => {
  let service;
  let mockPalmistryReader;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PalmistryService();
    mockPalmistryReader = service.calculator; // Access the mocked calculator
  });

  describe('processCalculation', () => {
    it('should generate a palmistry reading for valid hand data', async () => {
      const handData = { handType: 'earth', fingerShape: 'square' };
      const params = { handData: handData };

      const result = await service.processCalculation(params);

      expect(result).toBeDefined();
      expect(result.type).toBe('palmistry');
      expect(result.lines).toEqual(['Life Line', 'Heart Line']);
      expect(result.interpretation).toBeDefined();
      expect(mockPalmistryReader.readPalm).toHaveBeenCalledWith(handData, {});
    });

    it('should handle missing hand data', async () => {
      const params = {};

      await expect(service.processCalculation(params)).rejects.toThrow('handData is required');
    });

    it('should handle errors from the palmistry reader', async () => {
      mockPalmistryReader.readPalm.mockRejectedValue(new Error('Calculator error'));
      const params = { handData: { handType: 'earth' } };

      await expect(service.processCalculation(params)).rejects.toThrow('Palmistry reading failed: Calculator error');
    });
  });

  describe('getMetadata', () => {
    it('should return service metadata', () => {
      const metadata = service.getMetadata();

      expect(metadata.name).toBe('PalmistryService');
      expect(metadata.category).toBe('divination');
      expect(metadata.methods).toContain('processCalculation');
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