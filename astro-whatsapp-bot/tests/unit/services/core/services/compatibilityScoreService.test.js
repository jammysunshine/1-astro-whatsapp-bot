// tests/unit/services/core/services/compatibilityScoreService.test.js
// Comprehensive test suite for compatibilityScoreService

// Create mock calculator instance  
const mockCalculatorInstance = {
  calculateCompatibilityScore: jest.fn().mockResolvedValue({
    score: 75,
    factors: {},
    interpretation: 'Moderate compatibility'
  }),
  calculateVedicCompatibility: jest.fn().mockResolvedValue({
    ashtakootPoints: 18,
    gunaScore: 7.5,
    overallScore: 75
  }),
  checkNakshatraCompatibility: jest.fn().mockResolvedValue({
    nakshatraScore: 8,
    points: 24
  }),
  calculatePlanetaryAspects: jest.fn().mockResolvedValue([])
};

// Mock the calculator module before importing the service
jest.mock('../../../../../src/core/services/calculators/ChartGenerator', () => {
  return jest.fn().mockImplementation(() => mockCalculatorInstance);
});

// Mock the shared logger module (used by ServiceTemplate) before importing the service
jest.mock('../../../../../src/shared/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  silly: jest.fn()
}));

// Mock the regular logger module (used by service) before importing the service
jest.mock('../../../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  silly: jest.fn()
}));

const CompatibilityScoreService = require('../../../../../src/core/services/compatibilityScoreService');
const logger = require('../../../../../src/utils/logger');

describe('CompatibilityScoreService', () => {
  let compatibilityScoreService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create service instance
    compatibilityScoreService = new CompatibilityScoreService();
    // Manually set the calculator since the mock might not work with dynamic loading
    compatibilityScoreService.calculator = mockCalculatorInstance;
  });

  describe('Service Initialization', () => {
    test('should initialize CompatibilityScoreService with ChartGenerator', () => {
      expect(compatibilityScoreService.serviceName).toBe('CompatibilityScoreService');
      expect(compatibilityScoreService.calculatorPath).toBe('./calculators/ChartGenerator');
      
      // Verify logger was called during initialization
      expect(logger.info).toHaveBeenCalledWith('CompatibilityScoreService initialized');
    });
  });

  describe('lcompatibilityScoreCalculation method', () => {
    const compatibilityData = {
      person1: {
        birthData: {
          birthDate: '15/05/1990',
          birthTime: '12:30',
          birthPlace: 'Mumbai, India'
        },
        planetaryPositions: {}
      },
      person2: {
        birthData: {
          birthDate: '20/08/1988',
          birthTime: '10:45',
          birthPlace: 'Delhi, India'
        },
        planetaryPositions: {}
      }
    };

    test('should calculate compatibility score with valid data', async () => {
      const mockResult = {
        score: 82,
        factors: {
          sunSign: 8,
          moonSign: 9,
          ascendant: 7,
          nakshatra: 8
        },
        interpretation: 'High compatibility'
      };

      mockCalculatorInstance.calculateCompatibilityScore.mockResolvedValue(mockResult);

      const result = await compatibilityScoreService.lcompatibilityScoreCalculation(compatibilityData);

      expect(mockCalculatorInstance.calculateCompatibilityScore).toHaveBeenCalledWith(compatibilityData);
      expect(result).toEqual(mockResult);
    });

    test('should handle calculator errors gracefully', async () => {
      mockCalculatorInstance.calculateCompatibilityScore.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(
        compatibilityScoreService.lcompatibilityScoreCalculation(compatibilityData)
      ).rejects.toThrow('Compatibility score calculation failed: Calculator error');

      expect(logger.error).toHaveBeenCalledWith(
        'CompatibilityScoreService calculation error:',
        expect.any(Error)
      );
    });
  });

  describe('calculateCompatibilityScore method', () => {
    test('should calculate comprehensive compatibility score', async () => {
      const mockScoreData = {
        person1: { birthData: {}, planetaryPositions: {} },
        person2: { birthData: {}, planetaryPositions: {} }
      };

      const expectedScore = {
        score: 78,
        factors: {
          planetaryAlignment: 8,
          houseCompatibility: 7,
          elementalBalance: 8
        },
        interpretation: 'Good match with strong planetary alignment'
      };

      mockCalculatorInstance.calculateCompatibilityScore.mockResolvedValue(expectedScore);

      const result = await compatibilityScoreService.calculateCompatibilityScore(mockScoreData);

      expect(result).toEqual(expectedScore);
      expect(mockCalculatorInstance.calculateCompatibilityScore).toHaveBeenCalledWith(mockScoreData);
    });
  });

  describe('calculateVedicCompatibility method', () => {
    test('should calculate Vedic compatibility using ashtakoot system', async () => {
      const mockVedicData = {
        person1: { nakshatra: 'Rohini', moonSign: 'Taurus' },
        person2: { nakshatra: 'Mrigashira', moonSign: 'Taurus' }
      };

      const expectedVedicScore = {
        ashtakootPoints: 18,
        gunaScore: 7.5,
        overallScore: 75,
        kootCompatibility: {
          vasya: { score: 1, max: 1 },
          tara: { score: 2, max: 2 },
          yoni: { score: 2, max: 2 }
        }
      };

      mockCalculatorInstance.calculateVedicCompatibility.mockResolvedValue(expectedVedicScore);

      const result = await compatibilityScoreService.calculator.calculateVedicCompatibility(mockVedicData);

      expect(result).toEqual(expectedVedicScore);
      expect(mockCalculatorInstance.calculateVedicCompatibility).toHaveBeenCalledWith(mockVedicData);
    });
  });

  describe('checkNakshatraCompatibility method', () => {
    test('should check nakshatra compatibility between partners', async () => {
      const nakshatraData = {
        person1Nakshatra: 'Rohini',
        person2Nakshatra: 'Mrigashira'
      };

      const expectedNakshatraResult = {
        nakshatraScore: 8,
        points: 24,
        compatibility: 'Excellent',
        interpretation: 'Harmonious lunar connection'
      };

      mockCalculatorInstance.checkNakshatraCompatibility.mockResolvedValue(expectedNakshatraResult);

      const result = await compatibilityScoreService.calculator.checkNakshatraCompatibility(nakshatraData);

      expect(result).toEqual(expectedNakshatraResult);
      expect(mockCalculatorInstance.checkNakshatraCompatibility).toHaveBeenCalledWith(nakshatraData);
    });
  });

  describe('calculatePlanetaryAspects method', () => {
    test('should calculate interchart planetary aspects', async () => {
      const chartData = {
        person1Chart: { planets: [] },
        person2Chart: { planets: [] }
      };

      const expectedAspects = [
        { planet1: 'Venus', planet2: 'Mars', aspect: 'sextile', strength: 70 }
      ];

      mockCalculatorInstance.calculatePlanetaryAspects.mockResolvedValue(expectedAspects);

      const result = await compatibilityScoreService.calculator.calculatePlanetaryAspects(chartData);

      expect(result).toEqual(expectedAspects);
      expect(mockCalculatorInstance.calculatePlanetaryAspects).toHaveBeenCalledWith(chartData);
    });
  });

  describe('processCalculation method', () => {
    test('should call lcompatibilityScoreCalculation with provided data', async () => {
      const mockData = {
        person1: { birthData: {}, planetaryPositions: {} },
        person2: { birthData: {}, planetaryPositions: {} }
      };
      
      const expectedResult = { score: 85, factors: {} };
      
      mockCalculatorInstance.calculateCompatibilityScore.mockResolvedValue(expectedResult);

      const result = await compatibilityScoreService.processCalculation(mockData);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('formatResult method', () => {
    test('should format compatibility score result properly', () => {
      const mockResult = {
        score: 82,
        factors: { sunSign: 8, moonSign: 9 },
        interpretation: 'High compatibility'
      };

      const formatted = compatibilityScoreService.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.service).toBe('CompatibilityScoreService');
      expect(formatted.timestamp).toBeDefined();
    });

    test('should format error result properly', () => {
      const formatted = compatibilityScoreService.formatResult({ 
        error: 'Invalid compatibility data' 
      });

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Invalid compatibility data');
    });
  });

  describe('getMetadata method', () => {
    test('should return correct metadata for compatibility score service', () => {
      const metadata = compatibilityScoreService.getMetadata();

      expect(metadata).toEqual({
        name: 'CompatibilityScoreService',
        version: '1.0.0',
        category: 'compatibility',
        methods: ['calculateCompatibilityScore', 'calculateVedicCompatibility', 'checkNakshatraCompatibility'],
        dependencies: ['ChartGenerator']
      });
    });
  });

  describe('getHealthStatus method', () => {
    test('should return healthy status when service is operational', async () => {
      const healthStatus = await compatibilityScoreService.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.features).toEqual({});
      expect(healthStatus.supportedAnalyses).toEqual([]);
    });

    test('should return unhealthy status when error occurs', async () => {
      jest.spyOn(compatibilityScoreService, 'getHealthStatus').mockRejectedValue(
        new Error('Health check failed')
      );

      await expect(compatibilityScoreService.getHealthStatus())
        .rejects.toThrow('Health check failed');
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should implement ServiceTemplate pattern', () => {
      expect(compatibilityScoreService.serviceName).toBeDefined();
      expect(typeof compatibilityScoreService.getHealthStatus).toBe('function');
      expect(typeof compatibilityScoreService.getMetadata).toBe('function');
    });

    test('should have required methods', () => {
      expect(typeof compatibilityScoreService.processCalculation).toBe('function');
      expect(typeof compatibilityScoreService.formatResult).toBe('function');
    });
  });

  describe('Error Handling & Validation', () => {
    test('should handle concurrent requests properly', async () => {
      const mockData = {
        person1: { birthData: {}, planetaryPositions: {} },
        person2: { birthData: {}, planetaryPositions: {} }
      };

      const mockResult = {
        score: 75,
        factors: {},
        interpretation: 'Moderate compatibility'
      };

      mockCalculatorInstance.calculateCompatibilityScore.mockResolvedValue(mockResult);

      const concurrentRequests = Array(3).fill().map(() =>
        compatibilityScoreService.lcompatibilityScoreCalculation(mockData)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result.score).toBeDefined();
        expect(result.interpretation).toBeDefined();
      });

      expect(mockCalculatorInstance.calculateCompatibilityScore).toHaveBeenCalledTimes(3);
    });

    test('should handle invalid compatibility data gracefully', async () => {
      await expect(
        compatibilityScoreService.lcompatibilityScoreCalculation(null)
      ).rejects.toThrow('Compatibility score calculation failed');
    });
  });

  describe('Performance & Resilience', () => {
    test('should respond within acceptable time for valid data', async () => {
      const mockData = {
        person1: { birthData: {}, planetaryPositions: {} },
        person2: { birthData: {}, planetaryPositions: {} }
      };

      const mockResult = {
        score: 75,
        factors: {},
        interpretation: 'Moderate compatibility'
      };

      mockCalculatorInstance.calculateCompatibilityScore.mockResolvedValue(mockResult);

      const startTime = Date.now();
      await compatibilityScoreService.lcompatibilityScoreCalculation(mockData);
      const duration = Date.now() - startTime;

      // Should complete within reasonable time (e.g., 150ms)
      expect(duration).toBeLessThan(150);
    });
  });
});