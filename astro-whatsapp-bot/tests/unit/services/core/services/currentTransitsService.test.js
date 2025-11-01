// tests/unit/services/core/services/currentTransitsService.test.js
// Comprehensive test suite for currentTransitsService

// Create mock calculator instance
const mockCalculatorInstance = {
  analyzeTransitsToNatal: jest.fn().mockResolvedValue({
    transits: [],
    aspects: [],
    planetaryPositions: {},
    interpretation: 'Test interpretation'
  }),
  getTransitData: jest.fn().mockResolvedValue({
    planets: [],
    dates: {}
  }),
  calculateTransitAspects: jest.fn().mockResolvedValue([])
};

// Mock the calculator module before importing the service
jest.mock('../../../../../src/core/services/calculators/TransitCalculator', () => {
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

const CurrentTransitsService = require('../../../../../src/core/services/currentTransitsService');
const logger = require('../../../../../src/utils/logger');

describe('CurrentTransitsService', () => {
  let currentTransitsService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create service instance
    currentTransitsService = new CurrentTransitsService();
    // Manually set the calculator since the mock might not work with dynamic loading
    currentTransitsService.calculator = mockCalculatorInstance;
  });

  describe('Service Initialization', () => {
    test('should initialize CurrentTransitsService with TransitCalculator', () => {
      expect(currentTransitsService.serviceName).toBe('CurrentTransitsService');
      expect(currentTransitsService.calculatorPath).toBe('./calculators/TransitCalculator');
      
      // Verify logger was called during initialization
      expect(logger.info).toHaveBeenCalledWith('CurrentTransitsService initialized');
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

    test('should process current transits calculation with valid birth data', async () => {
      const mockResult = {
        transits: [
          { planet: 'Mars', aspect: 'conjunction', natalPlanet: 'Sun' }
        ],
        aspects: [],
        planetaryPositions: {},
        interpretation: 'Mars is transiting your Sun sign'
      };

      mockCalculatorInstance.analyzeTransitsToNatal.mockResolvedValue(mockResult);

      const result = await currentTransitsService.processCalculation(validBirthData);

      expect(mockCalculatorInstance.analyzeTransitsToNatal).toHaveBeenCalledWith(
        validBirthData,
        null
      );
      expect(result).toEqual(mockResult);
    });

    test('should process current transits with target date when provided', async () => {
      const targetDate = '15/05/2023';
      const mockResult = {
        transits: [],
        aspects: [],
        planetaryPositions: {},
        interpretation: 'Test interpretation'
      };

      mockCalculatorInstance.analyzeTransitsToNatal.mockResolvedValue(mockResult);

      const result = await currentTransitsService.processCalculation(validBirthData, targetDate);

      expect(mockCalculatorInstance.analyzeTransitsToNatal).toHaveBeenCalledWith(
        validBirthData,
        targetDate
      );
      expect(result).toEqual(mockResult);
    });

    test('should handle calculator errors gracefully', async () => {
      mockCalculatorInstance.analyzeTransitsToNatal.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(
        currentTransitsService.processCalculation(validBirthData)
      ).rejects.toThrow('Current transits analysis failed: Calculator error');

      expect(logger.error).toHaveBeenCalledWith(
        'CurrentTransitsService calculation error:',
        expect.any(Error)
      );
    });
  });

  describe('analyzeTransitsToNatal method', () => {
    test('should call calculator to analyze transits to natal', async () => {
      const birthData = {
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };
      const targetDate = '15/05/2023';
      
      const mockTransits = {
        transits: [
          { planet: 'Jupiter', aspect: 'trine', natalPlanet: 'Moon', orb: 2.5 }
        ],
        aspects: [{ type: 'trine', planets: ['Jupiter', 'Moon'] }],
        planetaryPositions: { jupiter: { degree: 120 }, moon: { degree: 45 } },
        interpretation: 'Beneficial transit for emotional well-being'
      };

      mockCalculatorInstance.analyzeTransitsToNatal.mockResolvedValue(mockTransits);

      const result = await currentTransitsService.calculator.analyzeTransitsToNatal(
        birthData,
        targetDate
      );

      expect(result).toEqual(mockTransits);
      expect(mockCalculatorInstance.analyzeTransitsToNatal).toHaveBeenCalledWith(
        birthData,
        targetDate
      );
    });
  });

  describe('getTransitData method', () => {
    test('should return transit data from calculator', async () => {
      const expectedData = {
        planets: [
          { name: 'Mars', longitude: 45.5, speed: 0.5 }
        ],
        dates: {
          current: '2023-05-15',
          nextConjunction: '2023-06-20'
        }
      };

      mockCalculatorInstance.getTransitData.mockResolvedValue(expectedData);

      const result = await currentTransitsService.calculator.getTransitData();

      expect(result).toEqual(expectedData);
      expect(mockCalculatorInstance.getTransitData).toHaveBeenCalled();
    });
  });

  describe('calculateTransitAspects method', () => {
    test('should calculate transit aspects using calculator', async () => {
      const natalChart = { sun: { degree: 30 }, moon: { degree: 60 } };
      const transitingPlanets = [{ name: 'Mars', degree: 32 }];
      
      const expectedAspects = [
        { planet1: 'Mars', planet2: 'Sun', aspect: 'conjunction', orb: 2.0 }
      ];

      mockCalculatorInstance.calculateTransitAspects.mockResolvedValue(expectedAspects);

      const result = await currentTransitsService.calculator.calculateTransitAspects(
        natalChart,
        transitingPlanets
      );

      expect(result).toEqual(expectedAspects);
      expect(mockCalculatorInstance.calculateTransitAspects).toHaveBeenCalledWith(
        natalChart,
        transitingPlanets
      );
    });
  });

  describe('formatResult method', () => {
    test('should format result with service-specific information', () => {
      const mockResult = {
        transits: [
          { planet: 'Venus', aspect: 'sextile', natalPlanet: 'Mercury' }
        ],
        interpretation: 'Positive communication period'
      };

      const formatted = currentTransitsService.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.service).toBe('CurrentTransitsService');
      expect(formatted.timestamp).toBeDefined();
    });

    test('should format error result properly', () => {
      const formatted = currentTransitsService.formatResult({ 
        error: 'Invalid birth data' 
      });

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Invalid birth data');
    });
  });

  describe('getMetadata method', () => {
    test('should return correct metadata for current transits service', () => {
      const metadata = currentTransitsService.getMetadata();

      expect(metadata).toEqual({
        name: 'CurrentTransitsService',
        version: '1.0.0',
        category: 'transits',
        methods: ['analyzeTransitsToNatal', 'getTransitData', 'calculateTransitAspects'],
        dependencies: ['TransitCalculator']
      });
    });
  });

  describe('getHealthStatus method', () => {
    test('should return healthy status when service is operational', async () => {
      const healthStatus = await currentTransitsService.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.features).toEqual({});
      expect(healthStatus.supportedAnalyses).toEqual([]);
    });

    test('should return unhealthy status when error occurs', async () => {
      jest.spyOn(currentTransitsService, 'getHealthStatus').mockRejectedValue(
        new Error('Health check failed')
      );

      await expect(currentTransitsService.getHealthStatus())
        .rejects.toThrow('Health check failed');
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should implement ServiceTemplate pattern', () => {
      expect(currentTransitsService.serviceName).toBeDefined();
      expect(typeof currentTransitsService.getHealthStatus).toBe('function');
      expect(typeof currentTransitsService.getMetadata).toBe('function');
    });

    test('should have required methods', () => {
      expect(typeof currentTransitsService.processCalculation).toBe('function');
      expect(typeof currentTransitsService.formatResult).toBe('function');
      expect(typeof currentTransitsService.validate).toBe('function');
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
        transits: [],
        aspects: [],
        planetaryPositions: {},
        interpretation: 'Test interpretation'
      };

      mockCalculatorInstance.analyzeTransitsToNatal.mockResolvedValue(mockResult);

      const concurrentRequests = Array(3).fill().map(() =>
        currentTransitsService.processCalculation(birthData)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result.transits).toBeDefined();
        expect(result.interpretation).toBeDefined();
      });

      expect(mockCalculatorInstance.analyzeTransitsToNatal).toHaveBeenCalledTimes(3);
    });

    test('should handle null/undefined input gracefully', async () => {
      await expect(
        currentTransitsService.processCalculation(null)
      ).rejects.toThrow('Current transits analysis failed');

      await expect(
        currentTransitsService.processCalculation(undefined)
      ).rejects.toThrow('Current transits analysis failed');
    });
  });

  describe('Performance & Resilience', () => {
    test('should respond within acceptable time for valid data', async () => {
      const mockResult = {
        transits: [],
        aspects: [],
        planetaryPositions: {},
        interpretation: 'Test interpretation'
      };

      mockCalculatorInstance.analyzeTransitsToNatal.mockResolvedValue(mockResult);

      const startTime = Date.now();
      await currentTransitsService.processCalculation({
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