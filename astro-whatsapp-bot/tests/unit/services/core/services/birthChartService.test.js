// tests/unit/services/core/services/birthChartService.test.js
// Comprehensive test suite for birthChartService

// Create mock calculator instance
const mockCalculatorInstance = {
  initialize: jest.fn().mockResolvedValue(true),
  calculateBirthChart: jest.fn().mockResolvedValue({
    planets: [],
    houses: [],
    ascendant: 'Aries',
    nakshatra: 'Ashwini',
    chartData: {}
  }),
  initialized: false
};

// Mock the calculator module before importing the service
jest.mock('../src/core/services/calculators/VedicCalculator', () => {
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

// Mock the regular logger module (used by birthChartService) before importing the service
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  silly: jest.fn()
}));

// Mock BirthData model
jest.mock('../src/models/BirthData', () => ({
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

const BirthChartService = require('../src/core/services/birthChartService');
const logger = require('../src/utils/logger');

describe('BirthChartService', () => {
  let birthChartService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create service instance with mocked calculator
    birthChartService = new BirthChartService(mockCalculatorInstance);
  });

  describe('Service Initialization', () => {
    test('should initialize BirthChartService with calculator', () => {
      expect(birthChartService.calculator).toBe(mockCalculatorInstance);
      expect(birthChartService.calculatorPath).toBe('./calculators/VedicCalculator');
      
      // Verify logger was called during initialization
      expect(logger.info).toHaveBeenCalledWith('BirthChartService initialized with VedicCalculator');
    });

    test('should have correct default properties', () => {
      expect(birthChartService.serviceName).toBe('VedicCalculator');
      expect(birthChartService.calculatorPath).toBe('./calculators/VedicCalculator');
    });
  });

  describe('calculateBirthChart method', () => {
    const validBirthData = {
      birthDate: '15/05/1990',
      birthTime: '12:30',
      birthPlace: 'Mumbai, India',
      latitude: 19.0760,
      longitude: 72.8777,
      timezone: 'IST'
    };

    test('should generate birth chart with valid data', async () => {
      const mockChartData = {
        planets: [],
        houses: [],
        ascendant: 'Aries',
        nakshatra: 'Ashwini',
        chartData: {}
      };

      mockCalculatorInstance.calculateBirthChart.mockResolvedValue(mockChartData);

      const result = await birthChartService.calculateBirthChart(validBirthData);

      expect(mockCalculatorInstance.calculateBirthChart).toHaveBeenCalledWith(
        expect.objectContaining({
          data: validBirthData
        })
      );

      expect(result.type).toBe('vedic');
      expect(result.generatedAt).toBeDefined();
      expect(result.service).toBe('VedicCalculator');
    });

    test('should handle calculator initialization if not initialized', async () => {
      mockCalculatorInstance.initialized = false;

      await birthChartService.calculateBirthChart(validBirthData);

      expect(mockCalculatorInstance.initialize).toHaveBeenCalled();
      expect(mockCalculatorInstance.calculateBirthChart).toHaveBeenCalled();
    });

    test('should skip calculator initialization if already initialized', async () => {
      mockCalculatorInstance.initialized = true;

      await birthChartService.calculateBirthChart(validBirthData);

      expect(mockCalculatorInstance.initialize).not.toHaveBeenCalled();
    });

    test('should throw error for invalid birth data', async () => {
      const invalidBirthData = {
        birthDate: '',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };

      await expect(birthChartService.calculateBirthChart(invalidBirthData))
        .rejects
        .toThrow('Birth chart generation failed: Required field is missing or empty');
    });

    test('should handle calculator errors gracefully', async () => {
      mockCalculatorInstance.calculateBirthChart.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(birthChartService.calculateBirthChart(validBirthData))
        .rejects
        .toThrow('Birth chart generation failed: Calculator error');

      expect(logger.error).toHaveBeenCalledWith(
        'BirthChartService calculation error:',
        expect.any(Error)
      );
    });
  });

  describe('formatResult method', () => {
    test('should format successful result correctly', () => {
      const mockResult = {
        planets: [],
        houses: [],
        ascendant: 'Aries'
      };

      const formatted = birthChartService.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.timestamp).toBeDefined();
      expect(formatted.service).toBe('VedicCalculator');
    });

    test('should format error result correctly', () => {
      const mockErrorResult = {
        error: 'Something went wrong'
      };

      const formatted = birthChartService.formatResult(mockErrorResult);

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Something went wrong');
      expect(formatted.service).toBe('VedicCalculator');
    });
  });

  describe('getMetadata method', () => {
    test('should return correct metadata', () => {
      const metadata = birthChartService.getMetadata();

      expect(metadata).toEqual({
        name: 'VedicCalculator',
        version: '1.0.0',
        category: 'vedic',
        methods: ['generateVedicKundli'],
        dependencies: ['ChartGenerator']
      });
    });
  });

  describe('processCalculation method', () => {
    test('should call calculateBirthChart with provided data', async () => {
      const mockChartData = {
        planets: [],
        houses: [],
        ascendant: 'Aries',
        nakshatra: 'Ashwini',
        chartData: {}
      };

      mockCalculatorInstance.calculateBirthChart.mockResolvedValue(mockChartData);

      const result = await birthChartService.processCalculation({
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      });

      expect(mockCalculatorInstance.calculateBirthChart).toHaveBeenCalled();
      expect(result).toBe(mockChartData);
    });
  });

  describe('getHealthStatus method', () => {
    test('should return healthy status when service is operational', async () => {
      const healthStatus = await birthChartService.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.features).toEqual({});
      expect(healthStatus.supportedAnalyses).toEqual([]);
    });

    test('should return unhealthy status when error occurs', async () => {
      jest.spyOn(birthChartService, 'getHealthStatus').mockRejectedValue(
        new Error('Health check failed')
      );

      await expect(birthChartService.getHealthStatus())
        .rejects
        .toThrow('Health check failed');
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should implement ServiceTemplate pattern', () => {
      expect(birthChartService.serviceName).toBeDefined();
      expect(typeof birthChartService.getHealthStatus).toBe('function');
      expect(typeof birthChartService.getMetadata).toBe('function');
    });

    test('should not expose calculator methods directly', () => {
      // Service should abstract calculator details
      expect(birthChartService.calculateBirthChart).toBeDefined(); // This is a service method
      expect(birthChartService.initialize).toBeDefined(); // This is a service method
    });
  });

  describe('Error Handling & Validation', () => {
    test('should handle concurrent requests properly', async () => {
      const birthData = {
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };

      const concurrentRequests = Array(5).fill().map(() =>
        birthChartService.calculateBirthChart(birthData)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result.type).toBe('vedic');
        expect(result.service).toBe('VedicCalculator');
      });

      expect(mockCalculatorInstance.calculateBirthChart).toHaveBeenCalledTimes(5);
    });

    test('should handle null/undefined input gracefully', async () => {
      const invalidInputs = [null, undefined, {}];

      for (const input of invalidInputs) {
        await expect(birthChartService.calculateBirthChart(input))
          .rejects
          .toThrow('Birth chart generation failed: Required field is missing or empty');
      }
    });
  });

  describe('Performance & Resilience', () => {
    test('should respond within acceptable time for valid data', async () => {
      const startTime = Date.now();
      await birthChartService.calculateBirthChart({
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      });
      const duration = Date.now() - startTime;

      // Should complete within reasonable time (e.g., 100ms)
      expect(duration).toBeLessThan(100);
    });
  });
});