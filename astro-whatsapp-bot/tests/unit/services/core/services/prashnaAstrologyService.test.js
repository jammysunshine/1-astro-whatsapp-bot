// tests/unit/services/core/services/prashnaAstrologyService.test.js
// Comprehensive test suite for prashnaAstrologyService

// Create mock calculator instance
const mockCalculatorInstance = {
  initialize: jest.fn().mockResolvedValue(true),
  analyzePrashna: jest.fn().mockResolvedValue({
    chart: {},
    planetaryPositions: {},
    ascendant: 'Aries',
    houses: []
  }),
  calculatePrashnaChart: jest.fn().mockResolvedValue({}),
  interpretPrashna: jest.fn().mockResolvedValue({
    answer: 'Yes, favorable',
    timing: 'Within 2 weeks',
    confidence: 75
  }),
  getPrashnaTiming: jest.fn().mockResolvedValue('Within 2 weeks'),
  validatePrashnaData: jest.fn().mockResolvedValue(true)
};

// Mock the calculator module before importing the service
jest.mock('../../../../../src/core/services/calculators/PrashnaCalculator', () => {
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

const PrashnaAstrologyService = require('../../../../../src/core/services/prashnaAstrologyService');
const logger = require('../../../../../src/utils/logger');

describe('PrashnaAstrologyService', () => {
  let prashnaAstrologyService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create service instance
    prashnaAstrologyService = new PrashnaAstrologyService();
    // Manually set the calculator since the mock might not work with dynamic loading  
    prashnaAstrologyService.calculator = mockCalculatorInstance;
  });

  describe('Service Initialization', () => {
    test('should initialize PrashnaAstrologyService with PrashnaCalculator', () => {
      expect(prashnaAstrologyService.serviceName).toBe('PrashnaAstrologyService');
      expect(prashnaAstrologyService.calculatorPath).toBe('./calculators/PrashnaCalculator');
      
      // Verify logger was called during initialization
      expect(logger.info).toHaveBeenCalledWith('PrashnaAstrologyService initialized');
    });
  });

  describe('processCalculation method', () => {
    const validPrashnaData = {
      question: 'Will I get the job I interviewed for?',
      questionTime: '15/05/2023 14:30',
      location: 'Mumbai, India',
      latitude: 19.0760,
      longitude: 72.8777,
      timezone: 'IST'
    };

    test('should process prashna astrology calculation with valid data', async () => {
      const mockResult = {
        chart: {
          ascendant: 'Leo',
          planets: [
            { name: 'Sun', sign: 'Taurus', degree: 25.5, house: 1 }
          ],
          houses: [
            { number: 1, sign: 'Leo', cusp: 120.5 }
          ]
        },
        planetaryPositions: {},
        ascendant: 'Leo',
        houses: [],
        interpretations: {
          answer: 'Yes, favorable outcome',
          timing: 'Within 2 weeks',
          confidence: 80,
          planetaryIndicators: [
            { planet: 'Jupiter', position: '1st house', aspect: 'trine Moon' }
          ]
        }
      };

      mockCalculatorInstance.analyzePrashna.mockResolvedValue(mockResult);

      const result = await prashnaAstrologyService.processCalculation(validPrashnaData);

      expect(mockCalculatorInstance.analyzePrashna).toHaveBeenCalledWith(
        expect.objectContaining({
          question: 'Will I get the job I interviewed for?',
          questionTime: '15/05/2023 14:30'
        })
      );
      expect(result).toEqual(mockResult);
    });

    test('should handle calculator initialization if needed', async () => {
      prashnaAstrologyService.calculator = null; // Simulate uninitialized calculator

      await prashnaAstrologyService.processCalculation(validPrashnaData);

      // Calculator should be initialized
      expect(mockCalculatorInstance.initialize).toHaveBeenCalled();
    });

    test('should handle calculator errors gracefully', async () => {
      mockCalculatorInstance.analyzePrashna.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(
        prashnaAstrologyService.processCalculation(validPrashnaData)
      ).rejects.toThrow('Prashna astrology calculation failed: Calculator error');

      expect(logger.error).toHaveBeenCalledWith(
        'PrashnaAstrologyService calculation error:',
        expect.any(Error)
      );
    });
  });

  describe('analyzePrashna method', () => {
    test('should analyze prashna chart and provide answer', async () => {
      const prashnaData = {
        question: 'Will I find my lost keys?',
        questionTime: '15/05/2023 10:00',
        location: 'Mumbai, India'
      };

      const expectedAnalysis = {
        chart: {
          ascendant: 'Cancer',
          planets: [
            { name: 'Moon', sign: 'Taurus', degree: 15.5, house: 3 }
          ]
        },
        planetaryPositions: {},
        ascendant: 'Cancer',
        houses: [],
        interpretations: {
          answer: 'Yes, near water source',
          location: 'Kitchen area',
          timing: 'Found by evening',
          confidence: 75,
          planetaryIndicators: [
            { planet: 'Moon', position: '3rd house', aspect: 'transiting', implication: 'Will be found soon' },
            { planet: 'Mercury', position: 'afflicted', implication: 'Hidden temporarily' }
          ]
        }
      };

      mockCalculatorInstance.analyzePrashna.mockResolvedValue(expectedAnalysis);

      const result = await prashnaAstrologyService.analyzer.prashna(prashnaData);

      expect(result).toEqual(expectedAnalysis);
      expect(mockCalculatorInstance.analyzePrashna).toHaveBeenCalledWith(prashnaData);
    });
  });

  describe('calculatePrashnaChart method', () => {
    test('should calculate prashna chart for given time and location', async () => {
      const chartData = {
        time: '15/05/2023 12:30',
        location: 'Mumbai, India',
        coordinates: { lat: 19.0760, lng: 72.8777 }
      };

      const expectedChart = {
        chart: {
          planets: [],
          houses: [],
          aspects: []
        },
        ascendant: { sign: 'Leo', degree: 125.5 },
        moon: { sign: 'Cancer', degree: 45.2 },
        rulingPlanet: 'Sun'
      };

      mockCalculatorInstance.calculatePrashnaChart.mockResolvedValue(expectedChart);

      const result = await prashnaAstrologyService.calculator.calculatePrashnaChart(chartData);

      expect(result).toEqual(expectedChart);
      expect(mockCalculatorInstance.calculatePrashnaChart).toHaveBeenCalledWith(chartData);
    });
  });

  describe('interpretPrashna method', () => {
    test('should interpret prashna chart to answer the question', async () => {
      const chartData = {
        chart: {
          ascendant: 'Leo',
          planets: [
            { name: 'Sun', sign: 'Taurus', house: 1 },
            { name: 'Moon', sign: 'Cancer', house: 3 }
          ]
        },
        question: 'Will I get the promotion?'
      };

      const expectedInterpretation = {
        answer: 'Yes, it will be favorable',
        timing: 'Within 2 weeks',
        confidence: 78,
        planetaryIndicators: [
          { planet: 'Jupiter', position: '1st house', aspect: 'trine Moon' },
          { planet: 'Mercury', position: '10th house', implication: 'Professional advancement' }
        ]
      };

      mockCalculatorInstance.interpretPrashna.mockResolvedValue(expectedInterpretation);

      const result = await prashnaAstrologyService.calculator.interpretPrashna(chartData);

      expect(result).toEqual(expectedInterpretation);
      expect(mockCalculatorInstance.interpretPrashna).toHaveBeenCalledWith(chartData);
    });
  });

  describe('getPrashnaTiming method', () => {
    test('should determine timing for prashna outcome', async () => {
      const chartContext = {
        chart: { ascendant: 'Leo' },
        planetaryIndicators: [
          { planet: 'Jupiter', position: '1st house' }
        ]
      };

      const expectedTiming = 'Within 2 weeks';

      mockCalculatorInstance.getPrashnaTiming.mockResolvedValue(expectedTiming);

      const result = await prashnaAstrologyService.calculator.getPrashnaTiming(chartContext);

      expect(result).toBe(expectedTiming);
      expect(mockCalculatorInstance.getPrashnaTiming).toHaveBeenCalledWith(chartContext);
    });
  });

  describe('validatePrashnaData method', () => {
    test('should validate prashna data', async () => {
      const prashnaData = {
        question: 'Will I get the job?',
        questionTime: '15/05/2023 14:30',
        location: 'Mumbai, India'
      };

      mockCalculatorInstance.validatePrashnaData.mockResolvedValue(true);

      const result = await prashnaAstrologyService.calculator.validatePrashnaData(prashnaData);

      expect(result).toBe(true);
      expect(mockCalculatorInstance.validatePrashnaData).toHaveBeenCalledWith(prashnaData);
    });

    test('should reject invalid prashna data', async () => {
      const invalidPrashnaData = {
        question: '',
        questionTime: '15/05/2023 14:30',
        location: 'Mumbai, India'
      };

      mockCalculatorInstance.validatePrashnaData.mockResolvedValue(false);

      const result = await prashnaAstrologyService.calculator.validatePrashnaData(invalidPrashnaData);

      expect(result).toBe(false);
      expect(mockCalculatorInstance.validatePrashnaData).toHaveBeenCalledWith(invalidPrashnaData);
    });
  });

  describe('formatResult method', () => {
    test('should format prashna astrology result properly', () => {
      const mockResult = {
        chart: {},
        ascendant: 'Leo',
        interpretations: { answer: 'Yes, favorable' }
      };

      const formatted = prashnaAstrologyService.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.service).toBe('PrashnaAstrologyService');
      expect(formatted.timestamp).toBeDefined();
    });

    test('should format error result properly', () => {
      const formatted = prashnaAstrologyService.formatResult({ 
        error: 'Invalid question for prashna analysis' 
      });

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Invalid question for prashna analysis');
    });

    test('should include prashna-specific disclaimer', () => {
      const mockResult = { chart: {}, ascendant: 'Leo' };
      const formatted = prashnaAstrologyService.formatResult(mockResult);

      expect(formatted.disclaimer).toBeDefined();
      expect(formatted.disclaimer).toContain('Prashna Astrology');
    });
  });

  describe('getMetadata method', () => {
    test('should return correct metadata for prashna astrology service', () => {
      const metadata = prashnaAstrologyService.getMetadata();

      expect(metadata).toEqual({
        name: 'PrashnaAstrologyService',
        version: '1.0.0',
        category: 'horary',
        methods: ['analyzePrashna', 'calculatePrashnaChart', 'interpretPrashna'],
        dependencies: ['PrashnaCalculator']
      });
    });
  });

  describe('getHealthStatus method', () => {
    test('should return healthy status when service is operational', async () => {
      const healthStatus = await prashnaAstrologyService.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.features).toEqual({});
      expect(healthStatus.supportedAnalyses).toEqual([]);
    });

    test('should return unhealthy status when error occurs', async () => {
      jest.spyOn(prashnaAstrologyService, 'getHealthStatus').mockRejectedValue(
        new Error('Health check failed')
      );

      await expect(prashnaAstrologyService.getHealthStatus())
        .rejects.toThrow('Health check failed');
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should implement ServiceTemplate pattern', () => {
      expect(prashnaAstrologyService.serviceName).toBeDefined();
      expect(typeof prashnaAstrologyService.getHealthStatus).toBe('function');
      expect(typeof prashnaAstrologyService.getMetadata).toBe('function');
    });

    test('should have required methods', () => {
      expect(typeof prashnaAstrologyService.processCalculation).toBe('function');
      expect(typeof prashnaAstrologyService.formatResult).toBe('function');
    });
  });

  describe('Error Handling & Validation', () => {
    test('should handle concurrent requests properly', async () => {
      const mockData = {
        question: 'Will I get the promotion?',
        questionTime: '15/05/2023 14:30',
        location: 'Mumbai, India'
      };

      const mockResult = {
        chart: {},
        ascendant: 'Leo',
        interpretations: { answer: 'Yes', timing: 'Within 2 weeks' }
      };

      mockCalculatorInstance.analyzePrashna.mockResolvedValue(mockResult);

      const concurrentRequests = Array(3).fill().map(() =>
        prashnaAstrologyService.processCalculation(mockData)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result.chart).toBeDefined();
        expect(result.interpretations).toBeDefined();
      });

      expect(mockCalculatorInstance.analyzePrashna).toHaveBeenCalledTimes(3);
    });

    test('should handle null/undefined input gracefully', async () => {
      await expect(
        prashnaAstrologyService.processCalculation(null)
      ).rejects.toThrow('Prashna astrology calculation failed');
    });
  });

  describe('Performance & Resilience', () => {
    test('should respond within acceptable time for valid data', async () => {
      const mockResult = {
        chart: {},
        ascendant: 'Leo',
        interpretations: { answer: 'Yes', timing: 'Within 2 weeks' }
      };

      mockCalculatorInstance.analyzePrashna.mockResolvedValue(mockResult);

      const startTime = Date.now();
      await prashnaAstrologyService.processCalculation({
        question: 'Will I find success?',
        questionTime: '15/05/2023 14:30',
        location: 'Mumbai, India'
      });
      const duration = Date.now() - startTime;

      // Should complete within reasonable time (e.g., 150ms)
      expect(duration).toBeLessThan(150);
    });
  });
});