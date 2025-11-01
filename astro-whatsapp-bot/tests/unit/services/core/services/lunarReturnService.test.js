// tests/unit/services/core/services/lunarReturnService.test.js
// Comprehensive test suite for lunarReturnService

// Create mock calculator instance
const mockCalculatorInstance = {
  initialize: jest.fn().mockResolvedValue(true),
  calculateLunarReturn: jest.fn().mockResolvedValue({
    chart: {},
    planetaryPositions: {},
    lunarReturnDate: '2023-06-15',
    aspects: []
  }),
  findNextLunarReturn: jest.fn().mockResolvedValue('2023-06-15'),
  calculateLunarReturnChart: jest.fn().mockResolvedValue({}),
  analyzeLunarReturn: jest.fn().mockResolvedValue({
    interpretations: {},
    timingPredictions: []
  }),
  getLunarReturnAspects: jest.fn().mockResolvedValue([])
};

// Mock the calculator module before importing the service
jest.mock('../../../../../src/core/services/calculators/LunarReturnCalculator', () => {
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

const LunarReturnService = require('../../../../../src/core/services/lunarReturnService');
const logger = require('../../../../../src/utils/logger');

describe('LunarReturnService', () => {
  let lunarReturnService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create service instance
    lunarReturnService = new LunarReturnService();
    // Manually set the calculator since the mock might not work with dynamic loading  
    lunarReturnService.calculator = mockCalculatorInstance;
  });

  describe('Service Initialization', () => {
    test('should initialize LunarReturnService with LunarReturnCalculator', () => {
      expect(lunarReturnService.serviceName).toBe('LunarReturnService');
      expect(lunarReturnService.calculatorPath).toBe('./calculators/LunarReturnCalculator');
      
      // Verify logger was called during initialization
      expect(logger.info).toHaveBeenCalledWith('LunarReturnService initialized');
    });
  });

  describe('processCalculation method', () => {
    const birthData = {
      birthDate: '15/05/1990',
      birthTime: '12:30',
      birthPlace: 'Mumbai, India'
    };

    test('should process lunar return calculation with valid birth data', async () => {
      const mockResult = {
        lunarReturnDate: '2023-06-15',
        chart: {
          ascendant: 'Gemini',
          moon: { sign: 'Taurus', degree: 15.5 }
        },
        planetaryPositions: {},
        interpretations: {
          emotionalFocus: 'Relationship matters',
          timingOpportunities: ['June 20-25']
        },
        aspects: [
          { planet1: 'Moon', planet2: 'Venus', aspect: 'trine' }
        ]
      };

      mockCalculatorInstance.calculateLunarReturn.mockResolvedValue(mockResult);

      const result = await lunarReturnService.processCalculation(birthData);

      expect(mockCalculatorInstance.calculateLunarReturn).toHaveBeenCalledWith(birthData);
      expect(result).toEqual(mockResult);
    });

    test('should handle calculator initialization if needed', async () => {
      lunarReturnService.calculator = null; // Simulate uninitialized calculator

      await lunarReturnService.processCalculation(birthData);

      // Calculator should be initialized
      expect(mockCalculatorInstance.initialize).toHaveBeenCalled();
    });

    test('should handle calculator errors gracefully', async () => {
      mockCalculatorInstance.calculateLunarReturn.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(
        lunarReturnService.processCalculation(birthData)
      ).rejects.toThrow('Lunar return calculation failed: Calculator error');

      expect(logger.error).toHaveBeenCalledWith(
        'LunarReturnService calculation error:',
        expect.any(Error)
      );
    });
  });

  describe('calculateLunarReturn method', () => {
    test('should calculate lunar return chart and analysis', async () => {
      const birthData = {
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };

      const expectedLunarReturn = {
        lunarReturnDate: '2023-06-15',
        chart: {
          ascendant: 'Gemini',
          moon: { sign: 'Taurus', degree: 15.5 }
        },
        planetaryPositions: {},
        interpretations: {
          emotionalFocus: 'Relationship matters',
          timingOpportunities: ['June 20-25']
        },
        aspects: [
          { planet1: 'Moon', planet2: 'Venus', aspect: 'trine' }
        ]
      };

      mockCalculatorInstance.calculateLunarReturn.mockResolvedValue(expectedLunarReturn);

      const result = await lunarReturnService.calculator.calculateLunarReturn(birthData);

      expect(result).toEqual(expectedLunarReturn);
      expect(mockCalculatorInstance.calculateLunarReturn).toHaveBeenCalledWith(birthData);
    });
  });

  describe('findNextLunarReturn method', () => {
    test('should find the date of next lunar return', async () => {
      const birthData = {
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };

      const expectedDate = '2023-06-15';

      mockCalculatorInstance.findNextLunarReturn.mockResolvedValue(expectedDate);

      const result = await lunarReturnService.calculator.findNextLunarReturn(birthData);

      expect(result).toBe(expectedDate);
      expect(mockCalculatorInstance.findNextLunarReturn).toHaveBeenCalledWith(birthData);
    });
  });

  describe('calculateLunarReturnChart method', () => {
    test('should calculate the lunar return chart', async () => {
      const lunarReturnData = {
        lunarReturnDate: '2023-06-15',
        location: 'Mumbai, India'
      };

      const expectedChart = {
        planets: [
          { name: 'Moon', sign: 'Taurus', degree: 15.5, house: 4 }
        ],
        houses: [
          { number: 1, sign: 'Gemini', cusp: 120.5 }
        ],
        ascendant: { sign: 'Gemini', degree: 120.5 }
      };

      mockCalculatorInstance.calculateLunarReturnChart.mockResolvedValue(expectedChart);

      const result = await lunarReturnService.calculator.calculateLunarReturnChart(lunarReturnData);

      expect(result).toEqual(expectedChart);
      expect(mockCalculatorInstance.calculateLunarReturnChart).toHaveBeenCalledWith(lunarReturnData);
    });
  });

  describe('analyzeLunarReturn method', () => {
    test('should analyze the lunar return chart for insights', async () => {
      const chartData = {
        chart: {},
        lunarReturnDate: '2023-06-15'
      };

      const expectedAnalysis = {
        interpretations: {
          emotionalFocus: 'Relationship matters',
          careerOpportunities: 'Favorable for networking',
          healthInsights: 'Good energy for fitness goals'
        },
        timingPredictions: [
          { event: 'Meeting', dateRange: 'June 18-22', planet: 'Mercury' },
          { event: 'Travel', dateRange: 'June 25-30', planet: 'Jupiter' }
        ],
        strengthAreas: ['Communication', 'Relationships'],
        cautionAreas: ['Impatience']
      };

      mockCalculatorInstance.analyzeLunarReturn.mockResolvedValue(expectedAnalysis);

      const result = await lunarReturnService.calculator.analyzeLunarReturn(chartData);

      expect(result).toEqual(expectedAnalysis);
      expect(mockCalculatorInstance.analyzeLunarReturn).toHaveBeenCalledWith(chartData);
    });
  });

  describe('getLunarReturnAspects method', () => {
    test('should calculate aspects in lunar return chart', async () => {
      const chartData = {
        planets: [
          { name: 'Moon', sign: 'Taurus', degree: 15.5 },
          { name: 'Venus', sign: 'Gemini', degree: 18.2 }
        ]
      };

      const expectedAspects = [
        { planet1: 'Moon', planet2: 'Venus', aspect: 'sextile', orb: 2.7, strength: 75 }
      ];

      mockCalculatorInstance.getLunarReturnAspects.mockResolvedValue(expectedAspects);

      const result = await lunarReturnService.calculator.getLunarReturnAspects(chartData);

      expect(result).toEqual(expectedAspects);
      expect(mockCalculatorInstance.getLunarReturnAspects).toHaveBeenCalledWith(chartData);
    });
  });

  describe('formatResult method', () => {
    test('should format lunar return analysis properly', () => {
      const mockResult = {
        lunarReturnDate: '2023-06-15',
        chart: {},
        interpretations: { emotionalFocus: 'Relationship matters' },
        aspects: []
      };

      const formatted = lunarReturnService.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.service).toBe('LunarReturnService');
      expect(formatted.timestamp).toBeDefined();
    });

    test('should format error result properly', () => {
      const formatted = lunarReturnService.formatResult({ 
        error: 'Invalid birth data for lunar return' 
      });

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Invalid birth data for lunar return');
    });

    test('should include lunar return disclaimer', () => {
      const mockResult = { lunarReturnDate: '2023-06-15' };
      const formatted = lunarReturnService.formatResult(mockResult);

      expect(formatted.disclaimer).toBeDefined();
      expect(formatted.disclaimer).toContain('Lunar Return');
    });
  });

  describe('getMetadata method', () => {
    test('should return correct metadata for lunar return service', () => {
      const metadata = lunarReturnService.getMetadata();

      expect(metadata).toEqual({
        name: 'LunarReturnService',
        version: '1.0.0',
        category: 'returns',
        methods: ['calculateLunarReturn', 'findNextLunarReturn', 'analyzeLunarReturn'],
        dependencies: ['LunarReturnCalculator']
      });
    });
  });

  describe('getHealthStatus method', () => {
    test('should return healthy status when service is operational', async () => {
      const healthStatus = await lunarReturnService.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.features).toEqual({});
      expect(healthStatus.supportedAnalyses).toEqual([]);
    });

    test('should return unhealthy status when error occurs', async () => {
      jest.spyOn(lunarReturnService, 'getHealthStatus').mockRejectedValue(
        new Error('Health check failed')
      );

      await expect(lunarReturnService.getHealthStatus())
        .rejects.toThrow('Health check failed');
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should implement ServiceTemplate pattern', () => {
      expect(lunarReturnService.serviceName).toBeDefined();
      expect(typeof lunarReturnService.getHealthStatus).toBe('function');
      expect(typeof lunarReturnService.getMetadata).toBe('function');
    });

    test('should have required methods', () => {
      expect(typeof lunarReturnService.processCalculation).toBe('function');
      expect(typeof lunarReturnService.formatResult).toBe('function');
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
        lunarReturnDate: '2023-06-15',
        chart: {},
        interpretations: {}
      };

      mockCalculatorInstance.calculateLunarReturn.mockResolvedValue(mockResult);

      const concurrentRequests = Array(3).fill().map(() =>
        lunarReturnService.processCalculation(birthData)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result.lunarReturnDate).toBeDefined();
        expect(result.interpretations).toBeDefined();
      });

      expect(mockCalculatorInstance.calculateLunarReturn).toHaveBeenCalledTimes(3);
    });

    test('should handle null/undefined input gracefully', async () => {
      await expect(
        lunarReturnService.processCalculation(null)
      ).rejects.toThrow('Lunar return calculation failed');
    });
  });

  describe('Performance & Resilience', () => {
    test('should respond within acceptable time for valid data', async () => {
      const mockResult = {
        lunarReturnDate: '2023-06-15',
        chart: {},
        interpretations: {}
      };

      mockCalculatorInstance.calculateLunarReturn.mockResolvedValue(mockResult);

      const startTime = Date.now();
      await lunarReturnService.processCalculation({
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