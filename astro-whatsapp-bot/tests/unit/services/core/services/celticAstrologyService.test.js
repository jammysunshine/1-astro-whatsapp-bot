// tests/unit/services/core/services/celticAstrologyService.test.js
const CelticAstrologyService = require('../../../../../src/core/services/celticAstrologyService');
const logger = require('../../../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Mock calculator
jest.mock('../../../../../src/core/services/calculators/celticReader', () => ({
  analyzeBirthData: jest.fn()
}));

let serviceInstance;

beforeEach(async () => {
  jest.clearAllMocks();

  serviceInstance = new CelticAstrologyService();
  await serviceInstance.initialize();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('CelticAstrologyService', () => {
  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(serviceInstance).toBeInstanceOf(CelticAstrologyService);
      expect(serviceInstance.serviceName).toBe('CelticAstrologyService');
      expect(serviceInstance.calculatorPath).toBe('./calculators/celticReader');
    });
  });

  describe('processCalculation', () => {
    const validBirthData = {
      birthDate: '15/06/1990',
      birthTime: '14:30',
      birthPlace: 'New York, USA'
    };

    const mockCelticAnalysis = {
      treeSign: 'Oak',
      animalTotem: 'Bear',
      birthData: validBirthData
    };

    beforeEach(() => {
      serviceInstance.calculator.analyzeBirthData.mockResolvedValue(mockCelticAnalysis);
    });

    it('should process Celtic astrology calculation successfully', async () => {
      const result = await serviceInstance.processCalculation(validBirthData);

      expect(result).toBeDefined();
      expect(result.celticAnalysis).toBe(mockCelticAnalysis);
      expect(result.treeSignTraits).toBeDefined();
      expect(result.animalTotemInsights).toBeDefined();
      expect(result.spiritualConnections).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it('should handle calculator errors', async () => {
      serviceInstance.calculator.analyzeBirthData.mockRejectedValue(
        new Error('Analysis failed')
      );

      await expect(serviceInstance.processCalculation(validBirthData)).rejects.toThrow(
        'Celtic Astrology analysis failed: Analysis failed'
      );
    });

    it('should validate input data', async () => {
      await expect(serviceInstance.processCalculation(null)).rejects.toThrow(
        'Birth data is required for Celtic Astrology analysis.'
      );
    });
  });

  describe('_validateInput', () => {
    it('should validate correct birth data', () => {
      const validData = {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'New York'
      };

      expect(() => serviceInstance._validateInput(validData)).not.toThrow();
    });

    it('should throw error for missing birth data', () => {
      expect(() => serviceInstance._validateInput(null)).toThrow(
        'Birth data is required for Celtic Astrology analysis.'
      );
    });
  });

  describe('_getTreeSignTraits', () => {
    it('should return traits for known tree signs', () => {
      expect(serviceInstance._getTreeSignTraits('Oak')).toBe(
        'Courage, strength, independence, and a protective nature.'
      );
      expect(serviceInstance._getTreeSignTraits('Birch')).toBe(
        'Inspiration, new beginnings, purity, and a love for nature.'
      );
      expect(serviceInstance._getTreeSignTraits('Willow')).toBe(
        'Melancholy, intuition, creativity, and a deep understanding of cycles.'
      );
    });

    it('should return default traits for unknown tree signs', () => {
      expect(serviceInstance._getTreeSignTraits('Unknown')).toBe('Unique personality traits');
    });
  });

  describe('_getAnimalTotemInsights', () => {
    it('should return insights for known animal totems', () => {
      expect(serviceInstance._getAnimalTotemInsights('Bear')).toBe(
        'Strength, introspection, healing, and a deep connection to the earth.'
      );
      expect(serviceInstance._getAnimalTotemInsights('Wolf')).toBe(
        'Loyalty, intuition, freedom, and a strong sense of family.'
      );
      expect(serviceInstance._getAnimalTotemInsights('Owl')).toBe(
        'Wisdom, intuition, mystery, and a deep understanding of the unseen.'
      );
    });

    it('should return default insights for unknown animal totems', () => {
      expect(serviceInstance._getAnimalTotemInsights('Unknown')).toBe('Unique animal totem insights');
    });
  });

  describe('_getSpiritualConnections', () => {
    it('should return spiritual connections for tree sign and animal totem', () => {
      const connections = serviceInstance._getSpiritualConnections('Oak', 'Bear');

      expect(connections).toBeDefined();
      expect(Array.isArray(connections)).toBe(true);
      expect(connections.length).toBeGreaterThan(0);
      expect(connections[0]).toContain('Oak');
      expect(connections[1]).toContain('Bear');
    });
  });

  describe('_createComprehensiveSummary', () => {
    it('should create comprehensive summary', () => {
      const celticAnalysis = {
        treeSign: 'Oak',
        animalTotem: 'Bear'
      };
      const treeSignTraits = 'Courage, strength, independence, and a protective nature.';

      const summary = serviceInstance._createComprehensiveSummary(celticAnalysis, treeSignTraits);

      expect(summary).toBeDefined();
      expect(typeof summary).toBe('string');
      expect(summary).toContain('Oak');
      expect(summary).toContain('Bear');
      expect(summary).toContain('courage, strength, independence');
      expect(summary).toContain('ancient Celtic wisdom');
    });
  });

  describe('formatResult', () => {
    it('should format successful result', () => {
      const mockResult = {
        celticAnalysis: { treeSign: 'Oak', animalTotem: 'Bear' },
        summary: 'Celtic analysis completed'
      };

      const formatted = serviceInstance.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.summary).toBe('Celtic analysis completed');
      expect(formatted.metadata).toBeDefined();
      expect(formatted.metadata.serviceName).toBe('CelticAstrologyService');
      expect(formatted.disclaimer).toContain('Celtic Astrology');
    });

    it('should format error result', () => {
      const errorResult = {
        error: 'Analysis failed'
      };

      const formatted = serviceInstance.formatResult(errorResult);

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Analysis failed');
      expect(formatted.message).toBe('Celtic Astrology analysis failed');
      expect(formatted.service).toBe('CelticAstrologyService');
    });
  });

  describe('getMetadata', () => {
    it('should return correct metadata', () => {
      const metadata = serviceInstance.getMetadata();

      expect(metadata.name).toBe('CelticAstrologyService');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.category).toBe('celtic');
      expect(metadata.methods).toEqual([
        'processCalculation',
        'getTreeSignAnalysis',
        'getAnimalTotemAnalysis',
        'getSpiritualConnections'
      ]);
      expect(metadata.dependencies).toEqual([]);
      expect(metadata.description).toContain('Celtic tree astrology');
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status', async () => {
      const status = await serviceInstance.getHealthStatus();

      expect(status.status).toBe('healthy');
      expect(status.serviceName).toBe('CelticAstrologyService');
      expect(status.features).toBeDefined();
      expect(status.supportedAnalyses).toBeDefined();
    });
  });
});