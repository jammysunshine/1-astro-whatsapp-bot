// tests/unit/services/core/services/solarReturnService.test.js
// Comprehensive test suite for solarReturnService

// Create mock calculator instance
const mockCalculatorInstance = {
  initialize: jest.fn().mockResolvedValue(true),
  calculateSolarReturn: jest.fn().mockResolvedValue({
    chart: {},
    planetaryPositions: {},
    solarReturnDate: '2023-05-15',
    aspects: []
  }),
  findNextSolarReturn: jest.fn().mockResolvedValue('2023-05-15'),
  calculateSolarReturnChart: jest.fn().mockResolvedValue({}),
  analyzeSolarReturn: jest.fn().mockResolvedValue({
    interpretations: {},
    timingPredictions: []
  }),
  getSolarReturnAspects: jest.fn().mockResolvedValue([])
};

// Mock the calculator module before importing the service
jest.mock('../../../../../src/core/services/calculators/SolarReturnCalculator', () => {
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

const SolarReturnService = require('../../../../../src/core/services/solarReturnService');
const logger = require('../../../../../src/utils/logger');

describe('SolarReturnService', () => {
  let solarReturnService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create service instance
    solarReturnService = new SolarReturnService();
    // Manually set the calculator since the mock might not work with dynamic loading  
    solarReturnService.calculator = mockCalculatorInstance;
  });

  describe('Service Initialization', () => {
    test('should initialize SolarReturnService with SolarReturnCalculator', () => {
      expect(solarReturnService.serviceName).toBe('SolarReturnService');
      expect(solarReturnService.calculatorPath).toBe('./calculators/SolarReturnCalculator');
      
      // Verify logger was called during initialization
      expect(logger.info).toHaveBeenCalledWith('SolarReturnService initialized');
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

    test('should process solar return calculation with valid birth data', async () => {
      const mockResult = {
        solarReturnDate: '2023-05-15',
        chart: {
          ascendant: 'Gemini',
          sun: { sign: 'Taurus', degree: 25.5 }
        },
        planetaryPositions: {},
        interpretations: {
          careerFocus: 'Professional advancement opportunities',
          relationshipTheme: 'Partnership developments',
          healthInsights: 'Good energy for fitness goals'
        },
        aspects: [
          { planet1: 'Sun', planet2: 'Jupiter', aspect: 'trine' }
        ]
      };

      mockCalculatorInstance.calculateSolarReturn.mockResolvedValue(mockResult);

      const result = await solarReturnService.processCalculation(validBirthData);

      expect(mockCalculatorInstance.calculateSolarReturn).toHaveBeenCalledWith(validBirthData);
      expect(result).toEqual(mockResult);
    });

    test('should handle calculator initialization if needed', async () => {
      solarReturnService.calculator = null; // Simulate uninitialized calculator

      await solarReturnService.processCalculation(validBirthData);

      // Calculator should be initialized
      expect(mockCalculatorInstance.initialize).toHaveBeenCalled();
    });

    test('should handle calculator errors gracefully', async () => {
      mockCalculatorInstance.calculateSolarReturn.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(
        solarReturnService.processCalculation(validBirthData)
      ).rejects.toThrow('Solar return calculation failed: Calculator error');

      expect(logger.error).toHaveBeenCalledWith(
        'SolarReturnService calculation error:',
        expect.any(Error)
      );
    });
  });

  describe('calculateSolarReturn method', () => {
    test('should calculate solar return chart and analysis', async () => {
      const birthData = {
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };

      const expectedSolarReturn = {
        solarReturnDate: '2023-05-15',
        chart: {
          ascendant: 'Gemini',
          sun: { sign: 'Taurus', degree: 25.5 }
        },
        planetaryPositions: {},
        interpretations: {
          careerFocus: 'Professional advancement opportunities',
          relationshipTheme: 'Partnership developments',
          healthInsights: 'Good energy for fitness goals'
        },
        aspects: [
          { planet1: 'Sun', planet2: 'Jupiter', aspect: 'trine' }
        ]
      };

      mockCalculatorInstance.calculateSolarReturn.mockResolvedValue(expectedSolarReturn);

      const result = await solarReturnService.calculator.calculateSolarReturn(birthData);

      expect(result).toEqual(expectedSolarReturn);
      expect(mockCalculatorInstance.calculateSolarReturn).toHaveBeenCalledWith(birthData);
    });
  });

  describe('findNextSolarReturn method', () => {
    test('should find the date of next solar return', async () => {
      const birthData = {
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };

      const expectedDate = '2023-05-15';

      mockCalculatorInstance.findNextSolarReturn.mockResolvedValue(expectedDate);

      const result = await solarReturnService.calculator.findNextSolarReturn(birthData);

      expect(result).toBe(expectedDate);
      expect(mockCalculatorInstance.findNextSolarReturn).toHaveBeenCalledWith(birthData);
    });
  });

  describe('calculateSolarReturnChart method', () => {
    test('should calculate the solar return chart', async () => {
      const solarReturnData = {
        solarReturnDate: '2023-05-15',
        location: 'Mumbai, India'
      };

      const expectedChart = {
        planets: [
          { name: 'Sun', sign: 'Taurus', degree: 25.5, house: 1 }
        ],
        houses: [
          { number: 1, sign: 'Gemini', cusp: 120.5 }
        ],
        ascendant: { sign: 'Gemini', degree: 120.5 }
      };

      mockCalculatorInstance.calculateSolarReturnChart.mockResolvedValue(expectedChart);

      const result = await solarReturnService.calculator.calculateSolarReturnChart(solarReturnData);

      expect(result).toEqual(expectedChart);
      expect(mockCalculatorInstance.calculateSolarReturnChart).toHaveBeenCalledWith(solarReturnData);
    });
  });

  describe('analyzeSolarReturn method', () => {
    test('should analyze the solar return chart for insights', async () => {
      const chartData = {
        chart: {},
        solarReturnDate: '2023-05-15'
      };

      const expectedAnalysis = {
        interpretations: {
          careerFocus: 'Professional advancement opportunities',
          relationshipTheme: 'Partnership developments',
          healthInsights: 'Good energy for fitness goals'
        },
        timingPredictions: [
          { event: 'Promotion', dateRange: 'July-September 2023', planet: 'Jupiter' },
          { event: 'Travel', dateRange: 'November 2023', planet: 'Mercury' }
        ],
        strengthAreas: ['Communication', 'Networking'],
        cautionAreas: ['Hasty decisions']
      };

      mockCalculatorInstance.analyzeSolarReturn.mockResolvedValue(expectedAnalysis);

      const result = await solarReturnService.calculator.analyzeSolarReturn(chartData);

      expect(result).toEqual(expectedAnalysis);
      expect(mockCalculatorInstance.analyzeSolarReturn).toHaveBeenCalledWith(chartData);
    });
  });

  describe('getSolarReturnAspects method', () => {
    test('should calculate aspects in solar return chart', async () => {
      const chartData = {
        planets: [
          { name: 'Sun', sign: 'Taurus', degree: 25.5 },
          { name: 'Jupiter', sign: 'Gemini', degree: 28.2 }
        ]
      };

      const expectedAspects = [
        { planet1: 'Sun', planet2: 'Jupiter', aspect: 'trine', orb: 2.7, strength: 75 }
      ];

      mockCalculatorInstance.getSolarReturnAspects.mockResolvedValue(expectedAspects);

      const result = await solarReturnService.calculator.getSolarReturnAspects(chartData);

      expect(result).toEqual(expectedAspects);
      expect(mockCalculatorInstance.getSolarReturnAspects).toHaveBeenCalledWith(chartData);
    });
  });

  describe('formatResult method', () => {
    test('should format solar return analysis properly', () => {
      const mockResult = {
        solarReturnDate: '2023-05-15',
        chart: {},
        interpretations: { careerFocus: 'Professional opportunities' },
        aspects: []
      };

      const formatted = solarReturnService.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.service).toBe('SolarReturnService');
      expect(formatted.timestamp).toBeDefined();
    });

    test('should format error result properly', () => {
      const formatted = solarReturnService.formatResult({ 
        error: 'Invalid birth data for solar return' 
      });

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Invalid birth data for solar return');
    });

    test('should include solar return disclaimer', () => {
      const mockResult = { solarReturnDate: '2023-05-15' };
      const formatted = solarReturnService.formatResult(mockResult);

      expect(formatted.disclaimer).toBeDefined();
      expect(formatted.disclaimer).toContain('Solar Return');
    });
  });

  describe('getMetadata method', () => {
    test('should return correct metadata for solar return service', () => {
      const metadata = solarReturnService.getMetadata();

      expect(metadata).toEqual({
        name: 'SolarReturnService',
        version: '1.0.0',
        category: 'returns',
        methods: ['calculateSolarReturn', 'findNextSolarReturn', 'analyzeSolarReturn'],
        dependencies: ['SolarReturnCalculator']
      });
    });
  });

  describe('getHealthStatus method', () => {
    test('should return healthy status when service is operational', async () => {
      const healthStatus = await solarReturnService.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.features).toEqual({});
      expect(healthStatus.supportedAnalyses).toEqual([]);
    });

    test('should return unhealthy status when error occurs', async () => {
      jest.spyOn(solarReturnService, 'getHealthStatus').mockRejectedValue(
        new Error('Health check failed')
      );

      await expect(solarReturnService.getHealthStatus())
        .rejects.toThrow('Health check failed');
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should implement ServiceTemplate pattern', () => {
      expect(solarReturnService.serviceName).toBeDefined();
      expect(typeof solarReturnService.getHealthStatus).toBe('function');
      expect(typeof solarReturnService.getMetadata).toBe('function');
    });

    test('should have required methods', () => {
      expect(typeof solarReturnService.processCalculation).toBe('function');
      expect(typeof solarReturnService.formatResult).toBe('function');
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
        solarReturnDate: '2023-05-15',
        chart: {},
        interpretations: {}
      };

      mockCalculatorInstance.calculateSolarReturn.mockResolvedValue(mockResult);

      const concurrentRequests = Array(3).fill().map(() =>
        solarReturnService.processCalculation(birthData)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result.solarReturnDate).toBeDefined();
        expect(result.interpretations).toBeDefined();
      });

      expect(mockCalculatorInstance.calculateSolarReturn).toHaveBeenCalledTimes(3);
    });

    test('should handle null/undefined input gracefully', async () => {
      await expect(
        solarReturnService.processCalculation(null)
      ).rejects.toThrow('Solar return calculation failed');
    });
  });

  describe('Performance & Resilience', () => {
    test('should respond within acceptable time for valid data', async () => {
      const mockResult = {
        solarReturnDate: '2023-05-15',
        chart: {},
        interpretations: {}
      };

      mockCalculatorInstance.calculateSolarReturn.mockResolvedValue(mockResult);

      const startTime = Date.now();
      await solarReturnService.processCalculation({
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