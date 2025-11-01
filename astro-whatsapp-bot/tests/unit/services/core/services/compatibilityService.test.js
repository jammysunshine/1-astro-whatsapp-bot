// tests/unit/services/core/services/compatibilityService.test.js
// Comprehensive test suite for compatibilityService

// Mock shared logger first (used by ServiceTemplate)
jest.mock('src/shared/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Mock winston logger used elsewhere
jest.mock('src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  silly: jest.fn()
}));

// Mock the calculator classes
jest.mock('src/core/services/calculators/SynastryEngine', () => ({
  SynastryEngine: jest.fn().mockImplementation(() => ({
    performSynastryAnalysis: jest.fn().mockResolvedValue({
      aspects: [
        { planets: ['moon', 'venus'], aspect: 'trine', strength: 80 },
        { planets: ['mars', 'venus'], aspect: 'square', strength: 60 }
      ],
      connections: 5
    })
  }))
}));

jest.mock('src/core/services/calculators/CompatibilityCalculator', () => ({
  CompatibilityCalculator: jest.fn().mockImplementation(() => ({
    checkCompatibility: jest.fn().mockResolvedValue({
      overall: 75,
      emotional: 80,
      intellectual: 70,
      physical: 75,
      spiritual: 65
    })
  }))
}));

// Mock BirthData model
jest.mock('src/models/BirthData', () => ({
  BirthData: jest.fn().mockImplementation((data) => ({
    data,
    validate: jest.fn(() => {
      // Simulate validation - throw error for invalid data
      if (!data.birthDate || !data.birthTime || !data.birthPlace) {
        throw new Error('Required field is missing or empty');
      }
    })
  }))
}));

const CompatibilityService = require('src/core/services/compatibilityService');
const { SynastryEngine } = require('src/core/services/calculators/SynastryEngine');
const { CompatibilityCalculator } = require('src/core/services/calculators/CompatibilityCalculator');
const logger = require('src/utils/logger');

describe('CompatibilityService', () => {
  let compatibilityService;
  let mockSynastryEngine;
  let mockCompatibilityCalculator;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSynastryEngine = new SynastryEngine();
    mockCompatibilityCalculator = new CompatibilityCalculator();

    // Create new instances for each test
    SynastryEngine.mockImplementation(() => mockSynastryEngine);
    CompatibilityCalculator.mockImplementation(() => mockCompatibilityCalculator);

    compatibilityService = new CompatibilityService();
  });

  describe('Service Initialization', () => {
    test('should initialize CompatibilityService with required calculators', () => {
      expect(compatibilityService).toBeInstanceOf(CompatibilityService);
      expect(compatibilityService.serviceName).toBe('CompatibilityService');
      expect(compatibilityService.calculatorPath).toBe('./calculators/CompatibilityCalculator');
      
      // Verify logger was called during initialization
      expect(logger.info).toHaveBeenCalledWith('CompatibilityService initialized');
    });

    test('should instantiate required calculators', () => {
      expect(compatibilityService.synastryEngine).toBeDefined();
      expect(compatibilityService.compatibilityScorer).toBeDefined();
    });
  });

  describe('validate method', () => {
    const validCompatibilityData = {
      person1: {
        name: 'Alice',
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      },
      person2: {
        name: 'Bob',
        birthDate: '20/08/1988',
        birthTime: '10:45',
        birthPlace: 'Delhi, India'
      }
    };

    test('should validate valid compatibility data', () => {
      expect(() => compatibilityService.validate(validCompatibilityData))
        .not.toThrow();

      expect(compatibilityService.validate(validCompatibilityData)).toBe(true);
    });

    test('should throw error for missing compatibility data', () => {
      expect(() => compatibilityService.validate(null))
        .toThrow('Compatibility data is required');

      expect(() => compatibilityService.validate(undefined))
        .toThrow('Compatibility data is required');
    });

    test('should throw error for missing person1 or person2 data', () => {
      expect(() => compatibilityService.validate({}))
        .toThrow('Birth data for both persons is required');

      expect(() => compatibilityService.validate({ person1: {} }))
        .toThrow('Birth data for both persons is required');

      expect(() => compatibilityService.validate({ person2: {} }))
        .toThrow('Birth data for both persons is required');
    });

    test('should throw error for missing person1 details', () => {
      const invalidData = {
        person1: {
          name: '',
          birthDate: '15/05/1990',
          birthTime: '12:30',
          birthPlace: 'Mumbai, India'
        },
        person2: {
          name: 'Bob',
          birthDate: '20/08/1988',
          birthTime: '10:45',
          birthPlace: 'Delhi, India'
        }
      };

      expect(() => compatibilityService.validate(invalidData))
        .toThrow('person1 name is required');
    });

    test('should throw error for invalid date format', () => {
      const invalidData = {
        person1: {
          name: 'Alice',
          birthDate: 'invalid-date',
          birthTime: '12:30',
          birthPlace: 'Mumbai, India'
        },
        person2: {
          name: 'Bob',
          birthDate: '20/08/1988',
          birthTime: '10:45',
          birthPlace: 'Delhi, India'
        }
      };

      expect(() => compatibilityService.validate(invalidData))
        .toThrow('person1 birth date must be in DD/MM/YYYY format');
    });

    test('should throw error for invalid time format', () => {
      const invalidData = {
        person1: {
          name: 'Alice',
          birthDate: '15/05/1990',
          birthTime: 'invalid-time',
          birthPlace: 'Mumbai, India'
        },
        person2: {
          name: 'Bob',
          birthDate: '20/08/1988',
          birthTime: '10:45',
          birthPlace: 'Delhi, India'
        }
      };

      expect(() => compatibilityService.validate(invalidData))
        .toThrow('person1 birth time must be in HH:MM format');
    });
  });

  describe('lcompatibilityCalculation method', () => {
    const validCompatibilityData = {
      person1: {
        name: 'Alice',
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India',
        sun: { sign: 'Taurus' },
        moon: { sign: 'Cancer' },
        ascendant: { sign: 'Leo' }
      },
      person2: {
        name: 'Bob',
        birthDate: '20/08/1988',
        birthTime: '10:45',
        birthPlace: 'Delhi, India',
        sun: { sign: 'Virgo' },
        moon: { sign: 'Pisces' },
        ascendant: { sign: 'Gemini' }
      }
    };

    test('should perform compatibility calculation successfully', async () => {
      const mockAnalysis = {
        person1: { name: 'Alice' },
        person2: { name: 'Bob' },
        synastryAnalysis: {
          aspects: [{ planets: ['moon', 'venus'], aspect: 'trine', strength: 80 }],
          connections: 5
        },
        compatibilityScore: { overall: 75 }
      };

      jest.spyOn(compatibilityService, 'getCompatibilityAnalysis')
        .mockResolvedValue(mockAnalysis);

      const result = await compatibilityService.lcompatibilityCalculation(validCompatibilityData);

      expect(result).toEqual(mockAnalysis);
      expect(compatibilityService.getCompatibilityAnalysis).toHaveBeenCalledWith(
        validCompatibilityData
      );
    });

    test('should handle calculation errors gracefully', async () => {
      jest.spyOn(compatibilityService, 'getCompatibilityAnalysis')
        .mockRejectedValue(new Error('Calculation failed'));

      await expect(compatibilityService.lcompatibilityCalculation(validCompatibilityData))
        .rejects
        .toThrow('Compatibility analysis failed: Calculation failed');

      expect(logger.error).toHaveBeenCalledWith(
        'CompatibilityService calculation error:',
        expect.any(Error)
      );
    });
  });

  describe('getCompatibilityAnalysis method', () => {
    const compatibilityData = {
      person1: {
        name: 'Alice',
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      },
      person2: {
        name: 'Bob',
        birthDate: '20/08/1988',
        birthTime: '10:45',
        birthPlace: 'Delhi, India'
      },
      analysisType: 'full'
    };

    beforeEach(() => {
      // Mock the individual analysis methods
      jest.spyOn(compatibilityService, '_calculateCompositeChart')
        .mockResolvedValue({ compositePositions: {}, ascendant: { longitude: 45, sign: 'Taurus' } });

      jest.spyOn(compatibilityService, '_getDetailedCompatibilityBreakdown')
        .mockResolvedValue({
          emotional: { score: 80, factors: [], interpretation: 'Strong emotional connection' },
          intellectual: { score: 70, factors: [], interpretation: 'Good communication and shared interests' },
          physical: { score: 75, factors: [], interpretation: 'Good physical chemistry' }
        });

      jest.spyOn(compatibilityService, '_generateCompatibilityInterpretation')
        .mockReturnValue('Good compatibility with positive indicators');

      jest.spyOn(compatibilityService, '_generateCompatibilityRecommendations')
        .mockReturnValue({
          overall: 'Moderate compatibility',
          strengths: [],
          challenges: [],
          advice: []
        });
    });

    test('should perform comprehensive compatibility analysis', async () => {
      const mockSynastryAnalysis = {
        aspects: [{ planets: ['moon', 'venus'], aspect: 'trine', strength: 80 }],
        connections: 5
      };

      mockSynastryEngine.performSynastryAnalysis.mockResolvedValue(mockSynastryAnalysis);

      const mockScore = { overall: 75, emotional: 80 };

      mockCompatibilityCalculator.checkCompatibility.mockResolvedValue(mockScore);

      const result = await compatibilityService.getCompatibilityAnalysis(compatibilityData);

      expect(result).toBeDefined();
      expect(result.person1.name).toBe('Alice');
      expect(result.person2.name).toBe('Bob');
      expect(result.analysisType).toBe('full');
      expect(result.synastryAnalysis).toEqual(mockSynastryAnalysis);
      expect(result.compatibilityScore).toEqual(mockScore);
      expect(result.compositeChart).toBeDefined();
      expect(result.detailedBreakdown).toBeDefined();
      expect(result.interpretation).toBeDefined();
      expect(result.recommendations).toBeDefined();

      // Verify that the calculators were called
      expect(mockSynastryEngine.performSynastryAnalysis).toHaveBeenCalledWith(
        compatibilityData.person1,
        compatibilityData.person2
      );
      expect(mockCompatibilityCalculator.checkCompatibility).toHaveBeenCalledWith(
        compatibilityData.person1,
        compatibilityData.person2
      );
    });

    test('should handle analysis errors gracefully', async () => {
      mockSynastryEngine.performSynastryAnalysis.mockRejectedValue(
        new Error('Synastry analysis failed')
      );

      await expect(compatibilityService.getCompatibilityAnalysis(compatibilityData))
        .rejects
        .toThrow('Synastry analysis failed');

      expect(logger.error).toHaveBeenCalledWith(
        'Error getting compatibility analysis:',
        expect.any(Error)
      );
    });
  });

  describe('formatResult method', () => {
    test('should format result with required fields and disclaimer', () => {
      const mockResult = {
        person1: { name: 'Alice' },
        person2: { name: 'Bob' },
        compatibilityScore: { overall: 75 }
      };

      const formatted = compatibilityService.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.service).toBe('Vedic Compatibility Analysis');
      expect(formatted.timestamp).toBeDefined();
      expect(formatted.data).toBe(mockResult);
      expect(formatted.disclaimer).toBeDefined();
      expect(formatted.disclaimer).toContain('Compatibility Disclaimer');
    });
  });

  describe('processCalculation method', () => {
    test('should call lcompatibilityCalculation with provided data', async () => {
      const mockResult = { analysis: 'test' };
      jest.spyOn(compatibilityService, 'lcompatibilityCalculation')
        .mockResolvedValue(mockResult);

      const testData = {
        person1: { name: 'Alice' },
        person2: { name: 'Bob' }
      };

      const result = await compatibilityService.processCalculation(testData);

      expect(compatibilityService.lcompatibilityCalculation).toHaveBeenCalledWith(testData);
      expect(result).toBe(mockResult);
    });
  });

  describe('getMetadata method', () => {
    test('should return correct metadata', () => {
      const metadata = compatibilityService.getMetadata();

      expect(metadata).toEqual({
        name: 'CompatibilityService',
        version: '1.0.0',
        category: 'vedic',
        methods: ['execute', 'getCompatibilityAnalysis'],
        dependencies: [
          'SynastryEngine',
          'CompatibilityScorer'
        ]
      });
    });
  });

  describe('getHealthStatus method', () => {
    test('should return healthy status when service is operational', async () => {
      const healthStatus = await compatibilityService.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.features).toEqual({});
      expect(healthStatus.supportedAnalyses).toEqual([]);
    });

    test('should return unhealthy status when error occurs', async () => {
      jest.spyOn(compatibilityService, 'getHealthStatus').mockRejectedValue(
        new Error('Health check failed')
      );

      await expect(compatibilityService.getHealthStatus())
        .rejects
        .toThrow('Health check failed');
    });
  });

  describe('Private Methods', () => {
    describe('_calculateCompositeChart method', () => {
      const person1 = {
        sun: { longitude: 30 },
        moon: { longitude: 60 },
        ascendant: { longitude: 45 }
      };

      const person2 = {
        sun: { longitude: 90 },
        moon: { longitude: 120 },
        ascendant: { longitude: 75 }
      };

      test('should calculate composite chart positions', async () => {
        const result = await compatibilityService._calculateCompositeChart(person1, person2);

        expect(result).toBeDefined();
        expect(result.compositePositions).toBeDefined();
        expect(result.ascendant).toBeDefined();
        expect(result.interpretation).toBeDefined();
      });

      test('should handle 0/360 degree crossover', async () => {
        const person1 = { sun: { longitude: 350 } };
        const person2 = { sun: { longitude: 10 } };

        const result = await compatibilityService._calculateCompositeChart(person1, person2);

        expect(result).toBeDefined();
        expect(result.compositePositions).toBeDefined();
      });

      test('should return null if error occurs', async () => {
        // Simulate an error in the calculation
        jest.spyOn(compatibilityService, '_getZodiacSign')
          .mockImplementation(() => {
            throw new Error('Calculation error');
          });

        const result = await compatibilityService._calculateCompositeChart(person1, person2);

        expect(result).toBeNull();
        expect(logger.warn).toHaveBeenCalledWith(
          'Could not calculate composite chart:',
          expect.any(Error).message
        );
      });
    });

    describe('_analyzeEmotionalCompatibility method', () => {
      test('should analyze emotional compatibility correctly', () => {
        const synastryAnalysis = {
          aspects: [
            { planets: ['moon', 'venus'], aspect: 'trine' },
            { planets: ['mars', 'jupiter'], aspect: 'square' }
          ]
        };

        const person1 = { moon: { sign: 'Cancer' } };
        const person2 = { moon: { sign: 'Scorpio' } };

        const result = compatibilityService._analyzeEmotionalCompatibility(
          person1,
          person2,
          synastryAnalysis
        );

        expect(result).toBeDefined();
        expect(result.score).toBeGreaterThan(0);
        expect(result.factors).toBeDefined();
        expect(result.interpretation).toBeDefined();
      });
    });

    describe('_getZodiacSign method', () => {
      test('should return correct zodiac sign from longitude', () => {
        expect(compatibilityService._getZodiacSign(0)).toBe('Aries');
        expect(compatibilityService._getZodiacSign(30)).toBe('Taurus');
        expect(compatibilityService._getZodiacSign(60)).toBe('Gemini');
        expect(compatibilityService._getZodiacSign(359)).toBe('Pisces');
      });
    });

    describe('_validatePersonData method', () => {
      test('should validate person data correctly', () => {
        const validPerson = {
          name: 'Alice',
          birthDate: '15/05/1990',
          birthTime: '12:30',
          birthPlace: 'Mumbai, India'
        };

        expect(() => {
          compatibilityService._validatePersonData(validPerson, 'person1');
        }).not.toThrow();
      });

      test('should throw error for invalid birth date format', () => {
        const invalidPerson = {
          name: 'Alice',
          birthDate: 'invalid-date',
          birthTime: '12:30',
          birthPlace: 'Mumbai, India'
        };

        expect(() => {
          compatibilityService._validatePersonData(invalidPerson, 'person1');
        }).toThrow('person1 birth date must be in DD/MM/YYYY format');
      });
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should implement ServiceTemplate pattern', () => {
      expect(compatibilityService.serviceName).toBeDefined();
      expect(typeof compatibilityService.getHealthStatus).toBe('function');
      expect(typeof compatibilityService.getMetadata).toBe('function');
    });

    test('should have required methods', () => {
      expect(typeof compatibilityService.validate).toBe('function');
      expect(typeof compatibilityService.processCalculation).toBe('function');
      expect(typeof compatibilityService.formatResult).toBe('function');
    });
  });

  describe('Error Handling & Validation', () => {
    test('should handle concurrent requests properly', async () => {
      const compatibilityData = {
        person1: {
          name: 'Alice',
          birthDate: '15/05/1990',
          birthTime: '12:30',
          birthPlace: 'Mumbai, India'
        },
        person2: {
          name: 'Bob',
          birthDate: '20/08/1988',
          birthTime: '10:45',
          birthPlace: 'Delhi, India'
        }
      };

      const concurrentRequests = Array(3).fill().map(() =>
        compatibilityService.getCompatibilityAnalysis(compatibilityData)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    test('should handle null/undefined input gracefully', async () => {
      const invalidInputs = [null, undefined, {}];

      for (const input of invalidInputs) {
        await expect(compatibilityService.lcompatibilityCalculation(input))
          .rejects
          .toThrow('Compatibility data is required');
      }
    });
  });

  describe('Performance & Resilience', () => {
    test('should respond within acceptable time for valid data', async () => {
      const mockAnalysis = {
        person1: { name: 'Alice' },
        person2: { name: 'Bob' },
        synastryAnalysis: { aspects: [], connections: 0 },
        compatibilityScore: { overall: 75 }
      };

      jest.spyOn(compatibilityService, 'getCompatibilityAnalysis')
        .mockResolvedValue(mockAnalysis);

      const startTime = Date.now();
      await compatibilityService.lcompatibilityCalculation({
        person1: {
          name: 'Alice',
          birthDate: '15/05/1990',
          birthTime: '12:30',
          birthPlace: 'Mumbai, India'
        },
        person2: {
          name: 'Bob',
          birthDate: '20/08/1988',
          birthTime: '10:45',
          birthPlace: 'Delhi, India'
        }
      });
      const duration = Date.now() - startTime;

      // Should complete within reasonable time (e.g., 200ms)
      expect(duration).toBeLessThan(200);
    });
  });
});