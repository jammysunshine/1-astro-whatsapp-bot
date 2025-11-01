// tests/unit/services/core/services/chineseAstrologyService.test.js
const ChineseAstrologyService = require('../../../../../src/core/services/chineseAstrologyService');
const logger = require('../../../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Mock calculator
jest.mock('../../../../../src/core/services/calculators/ChineseCalculator', () => ({
  analyzeBirthData: jest.fn()
}));

let serviceInstance;

beforeEach(async () => {
  jest.clearAllMocks();

  serviceInstance = new ChineseAstrologyService();
  await serviceInstance.initialize();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ChineseAstrologyService', () => {
  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(serviceInstance).toBeInstanceOf(ChineseAstrologyService);
      expect(serviceInstance.serviceName).toBe('ChineseAstrologyService');
      expect(serviceInstance.calculatorPath).toBe('./calculators/ChineseCalculator');
    });
  });

  describe('processCalculation', () => {
    const validBirthData = {
      birthDate: '15/06/1990',
      birthTime: '14:30',
      birthPlace: 'New York, USA'
    };

    const mockChineseAnalysis = {
      zodiacAnimal: 'Horse',
      element: 'Metal',
      birthData: validBirthData
    };

    beforeEach(() => {
      serviceInstance.calculator.analyzeBirthData.mockResolvedValue(mockChineseAnalysis);
    });

    it('should process Chinese astrology calculation successfully', async () => {
      const result = await serviceInstance.processCalculation(validBirthData);

      expect(result).toBeDefined();
      expect(result.chineseAnalysis).toBe(mockChineseAnalysis);
      expect(result.zodiacTraits).toBeDefined();
      expect(result.elementInfluence).toBeDefined();
      expect(result.compatibility).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it('should handle calculator errors', async () => {
      serviceInstance.calculator.analyzeBirthData.mockRejectedValue(
        new Error('Analysis failed')
      );

      await expect(serviceInstance.processCalculation(validBirthData)).rejects.toThrow(
        'Chinese Astrology analysis failed: Analysis failed'
      );
    });

    it('should validate input data', async () => {
      await expect(serviceInstance.processCalculation(null)).rejects.toThrow(
        'Birth data is required for Chinese Astrology analysis.'
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
        'Birth data is required for Chinese Astrology analysis.'
      );
    });
  });

  describe('_getZodiacTraits', () => {
    it('should return traits for known zodiac animals', () => {
      expect(serviceInstance._getZodiacTraits('Dragon')).toBe(
        'Charismatic, intelligent, confident, and powerful.'
      );
      expect(serviceInstance._getZodiacTraits('Snake')).toBe(
        'Intelligent, wise, mysterious, and elegant.'
      );
      expect(serviceInstance._getZodiacTraits('Tiger')).toBe(
        'Brave, confident, competitive, and natural leaders.'
      );
    });

    it('should return default traits for unknown zodiac animals', () => {
      expect(serviceInstance._getZodiacTraits('Unknown')).toBe('Unique personality traits');
    });
  });

  describe('_getElementInfluence', () => {
    it('should return influence for known elements', () => {
      expect(serviceInstance._getElementInfluence('Wood')).toBe(
        'Creative, adaptable, persistent, and generous.'
      );
      expect(serviceInstance._getElementInfluence('Fire')).toBe(
        'Dynamic, passionate, innovative, and impulsive.'
      );
      expect(serviceInstance._getElementInfluence('Earth')).toBe(
        'Practical, stable, patient, and reliable.'
      );
      expect(serviceInstance._getElementInfluence('Metal')).toBe(
        'Strong, decisive, disciplined, and ambitious.'
      );
      expect(serviceInstance._getElementInfluence('Water')).toBe(
        'Sensitive, intuitive, compassionate, and adaptable.'
      );
    });

    it('should return default influence for unknown elements', () => {
      expect(serviceInstance._getElementInfluence('Unknown')).toBe('Unique elemental influence');
    });
  });

  describe('_getCompatibilityInsights', () => {
    it('should return compatibility insights for known zodiac animals', () => {
      const ratCompatibility = serviceInstance._getCompatibilityInsights('Rat');
      expect(ratCompatibility.bestMatch).toEqual(['Dragon', 'Monkey', 'Ox']);
      expect(ratCompatibility.worstMatch).toEqual(['Horse', 'Rabbit', 'Rooster']);

      const dragonCompatibility = serviceInstance._getCompatibilityInsights('Dragon');
      expect(dragonCompatibility.bestMatch).toEqual(['Rat', 'Monkey', 'Rooster']);
      expect(dragonCompatibility.worstMatch).toEqual(['Ox', 'Rabbit', 'Dog']);
    });

    it('should return empty compatibility for unknown zodiac animals', () => {
      const unknownCompatibility = serviceInstance._getCompatibilityInsights('Unknown');
      expect(unknownCompatibility.bestMatch).toEqual([]);
      expect(unknownCompatibility.worstMatch).toEqual([]);
    });
  });

  describe('_createComprehensiveSummary', () => {
    it('should create comprehensive summary', () => {
      const chineseAnalysis = {
        zodiacAnimal: 'Dragon',
        element: 'Fire'
      };
      const zodiacTraits = 'Charismatic, intelligent, confident, and powerful.';

      const summary = serviceInstance._createComprehensiveSummary(chineseAnalysis, zodiacTraits);

      expect(summary).toBeDefined();
      expect(typeof summary).toBe('string');
      expect(summary).toContain('Dragon');
      expect(summary).toContain('Fire');
      expect(summary).toContain('charismatic, intelligent, confident, and powerful');
      expect(summary).toContain('traditional Chinese wisdom');
    });
  });

  describe('formatResult', () => {
    it('should format successful result', () => {
      const mockResult = {
        chineseAnalysis: { zodiacAnimal: 'Dragon', element: 'Fire' },
        summary: 'Chinese analysis completed'
      };

      const formatted = serviceInstance.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.summary).toBe('Chinese analysis completed');
      expect(formatted.metadata).toBeDefined();
      expect(formatted.metadata.serviceName).toBe('ChineseAstrologyService');
      expect(formatted.disclaimer).toContain('Chinese Astrology');
    });

    it('should format error result', () => {
      const errorResult = {
        error: 'Analysis failed'
      };

      const formatted = serviceInstance.formatResult(errorResult);

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Analysis failed');
      expect(formatted.message).toBe('Chinese Astrology analysis failed');
      expect(formatted.service).toBe('ChineseAstrologyService');
    });
  });

  describe('getMetadata', () => {
    it('should return correct metadata', () => {
      const metadata = serviceInstance.getMetadata();

      expect(metadata.name).toBe('ChineseAstrologyService');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.category).toBe('chinese');
      expect(metadata.methods).toEqual([
        'processCalculation',
        'getZodiacAnimalAnalysis',
        'getElementInfluenceAnalysis',
        'getCompatibilityAnalysis'
      ]);
      expect(metadata.dependencies).toEqual([]);
      expect(metadata.description).toContain('Chinese astrology');
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status', async () => {
      const status = await serviceInstance.getHealthStatus();

      expect(status.status).toBe('healthy');
      expect(status.serviceName).toBe('ChineseAstrologyService');
      expect(status.features).toBeDefined();
      expect(status.supportedAnalyses).toBeDefined();
    });
  });
});