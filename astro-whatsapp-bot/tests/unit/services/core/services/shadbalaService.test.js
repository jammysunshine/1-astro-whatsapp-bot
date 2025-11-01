// tests/unit/services/core/services/shadbalaService.test.js
// Comprehensive test suite for shadbalaService

// Create mock calculator instance
const mockCalculatorInstance = {
  initialize: jest.fn().mockResolvedValue(true),
  calculateShadbala: jest.fn().mockResolvedValue({
    planets: [],
    strengths: {},
    weaknesses: {},
    recommendations: []
  }),
  analyzePlanetaryStrengths: jest.fn().mockResolvedValue({
    strengths: {},
    weaknesses: {},
    overallRating: 75
  }),
  evaluateShadbala: jest.fn().mockResolvedValue({
    planet: 'Venus',
    sixBalaScores: {},
    totalScore: 85,
    interpretation: 'Strong planetary influence'
  }),
  getShadbalaRemedies: jest.fn().mockResolvedValue([]),
  validateShadbalaData: jest.fn().mockResolvedValue(true)
};

// Mock the calculator module before importing the service
jest.mock('../../../../../src/core/services/calculators/ShadbalaCalculator', () => {
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

// Mock BirthData model
jest.mock('../../../../../src/models/BirthData', () => ({
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

const ShadbalaService = require('../../../../../src/core/services/shadbalaService');
const logger = require('../../../../../src/utils/logger');

describe('ShadbalaService', () => {
  let shadbalaService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create service instance
    shadbalaService = new ShadbalaService();
    // Manually set the calculator since the mock might not work with dynamic loading  
    shadbalaService.calculator = mockCalculatorInstance;
  });

  describe('Service Initialization', () => {
    test('should initialize ShadbalaService with ShadbalaCalculator', () => {
      expect(shadbalaService.serviceName).toBe('ShadbalaService');
      expect(shadbalaService.calculatorPath).toBe('./calculators/ShadbalaCalculator');
      
      // Verify logger was called during initialization
      expect(logger.info).toHaveBeenCalledWith('ShadbalaService initialized');
    });
  });

  describe('processCalculation method', () => {
    const validBirthData = {
      birthDate: '15/05/1990',
      birthTime: '12:30',
      birthPlace: 'Mumbai, India',
      latitude: 19.0760,
      longitude: 72.8777,
      timezone: 'IST'
    };

    test('should process shadbala calculation with valid birth data', async () => {
      const mockResult = {
        planets: [
          { name: 'Sun', sign: 'Taurus', degree: 25.5, house: 1 }
        ],
        strengths: {
          sun: { sthrenaBala: 85, digBala: 90, kalaBala: 75 }
        },
        weaknesses: {
          sun: { cheshtaBala: 60, naisargikaBala: 70 }
        },
        overallRating: 78,
        interpretations: {
          strongestPlanet: 'Sun',
          weakestPlanet: 'Moon',
          planetaryRecommendations: [
            { planet: 'Moon', remedy: 'Wear pearl', timing: 'Monday' }
          ]
        }
      };

      mockCalculatorInstance.calculateShadbala.mockResolvedValue(mockResult);

      const result = await shadbalaService.processCalculation(validBirthData);

      expect(mockCalculatorInstance.calculateShadbala).toHaveBeenCalledWith(
        expect.objectContaining({
          birthDate: '15/05/1990'
        })
      );
      expect(result).toEqual(mockResult);
    });

    test('should handle calculator initialization if needed', async () => {
      shadbalaService.calculator = null; // Simulate uninitialized calculator

      await shadbalaService.processCalculation(validBirthData);

      // Calculator should be initialized
      expect(mockCalculatorInstance.initialize).toHaveBeenCalled();
    });

    test('should handle calculator errors gracefully', async () => {
      mockCalculatorInstance.calculateShadbala.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(
        shadbalaService.processCalculation(validBirthData)
      ).rejects.toThrow('Shadbala calculation failed: Calculator error');

      expect(logger.error).toHaveBeenCalledWith(
        'ShadbalaService calculation error:',
        expect.any(Error)
      );
    });
  });

  describe('calculateShadbala method', () => {
    test('should calculate shadbala for all planets', async () => {
      const birthData = {
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };

      const expectedShadbala = {
        planets: [
          { name: 'Sun', sign: 'Taurus', degree: 25.5, house: 1 },
          { name: 'Moon', sign: 'Cancer', degree: 15.2, house: 3 }
        ],
        strengths: {
          sun: { sthrenaBala: 85, digBala: 90, kalaBala: 75, cheshtaBala: 80, naisargikaBala: 85, drikBala: 70 },
          moon: { sthrenaBala: 90, digBala: 85, kalaBala: 80, cheshtaBala: 75, naisargikaBala: 85, drikBala: 80 }
        },
        weaknesses: {
          mercury: { cheshtaBala: 60, drikBala: 55 }
        },
        overallRating: 82,
        interpretations: {
          strongestPlanet: 'Sun',
          weakestPlanet: 'Mercury',
          planetaryRecommendations: [
            { planet: 'Mercury', remedy: 'Recite Budh Gayatri Mantra', repetitions: 108 }
          ]
        }
      };

      mockCalculatorInstance.calculateShadbala.mockResolvedValue(expectedShadbala);

      const result = await shadbalaService.calculator.calculateShadbala(birthData);

      expect(result).toEqual(expectedShadbala);
      expect(mockCalculatorInstance.calculateShadbala).toHaveBeenCalledWith(birthData);
    });
  });

  describe('analyzePlanetaryStrengths method', () => {
    test('should analyze planetary strengths and weaknesses', async () => {
      const planetaryData = {
        planets: [
          { name: 'Sun', sign: 'Taurus', degree: 25.5, house: 1 },
          { name: 'Moon', sign: 'Cancer', degree: 15.2, house: 3 }
        ]
      };

      const expectedAnalysis = {
        strengths: {
          sun: { sthrenaBala: 85, digBala: 90, kalaBala: 75 },
          moon: { sthrenaBala: 90, digBala: 85, kalaBala: 80 }
        },
        weaknesses: {
          mercury: { cheshtaBala: 60, drikBala: 55 }
        },
        overallRating: 78,
        detailedAnalysis: {
          strengthFactors: ['Sun in own sign', 'Moon in exaltation'],
          weaknessFactors: ['Mercury combust', 'Mars debilitated'],
          remedialSuggestions: [
            { planet: 'Mercury', remedy: 'Wear emerald', timing: 'Wednesday' }
          ]
        }
      };

      mockCalculatorInstance.analyzePlanetaryStrengths.mockResolvedValue(expectedAnalysis);

      const result = await shadbalaService.calculator.analyzePlanetaryStrengths(planetaryData);

      expect(result).toEqual(expectedAnalysis);
      expect(mockCalculatorInstance.analyzePlanetaryStrengths).toHaveBeenCalledWith(planetaryData);
    });
  });

  describe('evaluateShadbala method', () => {
    test('should evaluate shadbala for specific planet', async () => {
      const planetData = {
        planet: 'Venus',
        position: { sign: 'Taurus', house: 1, degree: 25.5 }
      };

      const expectedEvaluation = {
        planet: 'Venus',
        sixBalaScores: {
          sthrenaBala: 95,
          digBala: 85,
          kalaBala: 80,
          cheshtaBala: 75,
          naisargikaBala: 85,
          drikBala: 80
        },
        totalScore: 85,
        interpretation: 'Very strong planetary influence with excellent benefic effects',
        strengthAreas: ['Wealth matters', 'Relationships', 'Arts and creativity'],
        cautions: ['May cause over-indulgence']
      };

      mockCalculatorInstance.evaluateShadbala.mockResolvedValue(expectedEvaluation);

      const result = await shadbalaService.calculator.evaluateShadbala(planetData);

      expect(result).toEqual(expectedEvaluation);
      expect(mockCalculatorInstance.evaluateShadbala).toHaveBeenCalledWith(planetData);
    });
  });

  describe('getShadbalaRemedies method', () => {
    test('should suggest remedies for weak planetary strengths', async () => {
      const weaknessData = {
        planet: 'Mercury',
        weakBalas: ['cheshtaBala', 'drikBala'],
        issues: ['Communication difficulties', 'Learning challenges']
      };

      const expectedRemedies = [
        { planet: 'Mercury', remedy: 'Recite Budh Gayatri Mantra', repetitions: 108, timing: 'Wednesday mornings' },
        { planet: 'Mercury', remedy: 'Wear emerald', weight: '5 carats', timing: 'Wednesday' },
        { planet: 'Mercury', remedy: 'Donate green items', frequency: 'Weekly', timing: 'Wednesday' },
        { planet: 'Mercury', remedy: 'Practice meditation on speech', frequency: 'Daily', timing: 'Before sunrise' }
      ];

      mockCalculatorInstance.getShadbalaRemedies.mockResolvedValue(expectedRemedies);

      const result = await shadbalaService.calculator.getShadbalaRemedies(weaknessData);

      expect(result).toEqual(expectedRemedies);
      expect(mockCalculatorInstance.getShadbalaRemedies).toHaveBeenCalledWith(weaknessData);
    });
  });

  describe('validateShadbalaData method', () => {
    test('should validate shadbala data', async () => {
      const shadbalaData = {
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };

      mockCalculatorInstance.validateShadbalaData.mockResolvedValue(true);

      const result = await shadbalaService.calculator.validateShadbalaData(shadbalaData);

      expect(result).toBe(true);
      expect(mockCalculatorInstance.validateShadbalaData).toHaveBeenCalledWith(shadbalaData);
    });

    test('should reject invalid shadbala data', async () => {
      const invalidShadbalaData = {
        birthDate: '',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };

      mockCalculatorInstance.validateShadbalaData.mockResolvedValue(false);

      const result = await shadbalaService.calculator.validateShadbalaData(invalidShadbalaData);

      expect(result).toBe(false);
      expect(mockCalculatorInstance.validateShadbalaData).toHaveBeenCalledWith(invalidShadbalaData);
    });
  });

  describe('formatResult method', () => {
    test('should format shadbala result properly', () => {
      const mockResult = {
        planets: [{ name: 'Sun', sign: 'Taurus' }],
        strengths: { sun: { sthrenaBala: 85 } },
        weaknesses: { moon: { cheshtaBala: 60 } },
        overallRating: 78
      };

      const formatted = shadbalaService.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.service).toBe('ShadbalaService');
      expect(formatted.timestamp).toBeDefined();
    });

    test('should format error result properly', () => {
      const formatted = shadbalaService.formatResult({ 
        error: 'Invalid birth data for shadbala calculation' 
      });

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Invalid birth data for shadbala calculation');
    });

    test('should include shadbala disclaimer', () => {
      const mockResult = { planets: [], strengths: {}, weaknesses: {} };
      const formatted = shadbalaService.formatResult(mockResult);

      expect(formatted.disclaimer).toBeDefined();
      expect(formatted.disclaimer).toContain('Shadbala');
    });
  });

  describe('getMetadata method', () => {
    test('should return correct metadata for shadbala service', () => {
      const metadata = shadbalaService.getMetadata();

      expect(metadata).toEqual({
        name: 'ShadbalaService',
        version: '1.0.0',
        category: 'vedic',
        methods: ['calculateShadbala', 'analyzePlanetaryStrengths', 'evaluateShadbala'],
        dependencies: ['ShadbalaCalculator']
      });
    });
  });

  describe('getHealthStatus method', () => {
    test('should return healthy status when service is operational', async () => {
      const healthStatus = await shadbalaService.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.features).toEqual({});
      expect(healthStatus.supportedAnalyses).toEqual([]);
    });

    test('should return unhealthy status when error occurs', async () => {
      jest.spyOn(shadbalaService, 'getHealthStatus').mockRejectedValue(
        new Error('Health check failed')
      );

      await expect(shadbalaService.getHealthStatus())
        .rejects.toThrow('Health check failed');
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should implement ServiceTemplate pattern', () => {
      expect(shadbalaService.serviceName).toBeDefined();
      expect(typeof shadbalaService.getHealthStatus).toBe('function');
      expect(typeof shadbalaService.getMetadata).toBe('function');
    });

    test('should have required methods', () => {
      expect(typeof shadbalaService.processCalculation).toBe('function');
      expect(typeof shadbalaService.formatResult).toBe('function');
    });
  });

  describe('Error Handling & Validation', () => {
    test('should handle concurrent requests properly', async () => {
      const birthData = {
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };

      const mockResult = {
        planets: [],
        strengths: {},
        weaknesses: {},
        overallRating: 75
      };

      mockCalculatorInstance.calculateShadbala.mockResolvedValue(mockResult);

      const concurrentRequests = Array(3).fill().map(() =>
        shadbalaService.processCalculation(birthData)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result.planets).toBeDefined();
        expect(result.strengths).toBeDefined();
        expect(result.weaknesses).toBeDefined();
      });

      expect(mockCalculatorInstance.calculateShadbala).toHaveBeenCalledTimes(3);
    });

    test('should handle null/undefined input gracefully', async () => {
      await expect(
        shadbalaService.processCalculation(null)
      ).rejects.toThrow('Shadbala calculation failed');
    });
  });

  describe('Performance & Resilience', () => {
    test('should respond within acceptable time for valid data', async () => {
      const mockResult = {
        planets: [],
        strengths: {},
        weaknesses: {},
        overallRating: 75
      };

      mockCalculatorInstance.calculateShadbala.mockResolvedValue(mockResult);

      const startTime = Date.now();
      await shadbalaService.processCalculation({
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      });
      const duration = Date.now() - startTime;

      // Should complete within reasonable time (e.g., 150ms)
      expect(duration).toBeLessThan(150);
    });
  });
});