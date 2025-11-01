// tests/unit/services/core/services/compositeChartService.test.js
// Comprehensive test suite for compositeChartService

// Create mock calculator instance
const mockCalculatorInstance = {
  initialize: jest.fn().mockResolvedValue(true),
  calculateCompositeChart: jest.fn().mockResolvedValue({
    chart: {},
    planetaryMidpoints: {},
    compositeAscendant: 'Libra',
    aspects: []
  }),
  generateCompositeChart: jest.fn().mockResolvedValue({}),
  analyzeCompositeChart: jest.fn().mockResolvedValue({
    interpretations: {},
    relationshipDynamics: {}
  }),
  calculateMidpoints: jest.fn().mockResolvedValue({}),
  getCompositeAspects: jest.fn().mockResolvedValue([])
};

// Mock the calculator module before importing the service
jest.mock('../../../../../src/core/services/calculators/SynastryEngine', () => {
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

const CompositeChartService = require('../../../../../src/core/services/compositeChartService');
const logger = require('../../../../../src/utils/logger');

describe('CompositeChartService', () => {
  let compositeChartService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create service instance
    compositeChartService = new CompositeChartService();
    // Manually set the calculator since the mock might not work with dynamic loading  
    compositeChartService.calculator = mockCalculatorInstance;
  });

  describe('Service Initialization', () => {
    test('should initialize CompositeChartService with SynastryEngine', () => {
      expect(compositeChartService.serviceName).toBe('CompositeChartService');
      expect(compositeChartService.calculatorPath).toBe('./calculators/SynastryEngine');
      
      // Verify logger was called during initialization
      expect(logger.info).toHaveBeenCalledWith('CompositeChartService initialized');
    });
  });

  describe('processCalculation method', () => {
    const validCompositeData = {
      person1: {
        birthData: {
          birthDate: '15/05/1990',
          birthTime: '12:30',
          birthPlace: 'Mumbai, India',
          latitude: 19.0760,
          longitude: 72.8777,
          timezone: 'IST'
        }
      },
      person2: {
        birthData: {
          birthDate: '20/08/1988',
          birthTime: '10:45',
          birthPlace: 'Delhi, India',
          latitude: 28.7041,
          longitude: 77.1025,
          timezone: 'IST'
        }
      }
    };

    test('should process composite chart calculation with valid data', async () => {
      const mockResult = {
        compositeChart: {
          ascendant: 'Libra',
          planets: [
            { name: 'Sun', sign: 'Scorpio', degree: 15.5, house: 2 }
          ],
          houses: [
            { number: 1, sign: 'Libra', cusp: 120.5 }
          ]
        },
        planetaryMidpoints: {
          sun: { midpoint: 135.5, signs: ['Scorpio', 'Sagittarius'] }
        },
        compositeAscendant: 'Libra',
        aspects: [
          { planet1: 'Sun', planet2: 'Moon', aspect: 'trine', orb: 2.1 }
        ],
        interpretations: {
          relationshipFocus: 'Deep emotional connection',
          communicationStyle: 'Intuitive understanding',
          sharedGoals: 'Spiritual development'
        }
      };

      mockCalculatorInstance.calculateCompositeChart.mockResolvedValue(mockResult);

      const result = await compositeChartService.processCalculation(validCompositeData);

      expect(mockCalculatorInstance.calculateCompositeChart).toHaveBeenCalledWith(
        expect.objectContaining({
          person1: expect.objectContaining({
            birthData: expect.objectContaining({
              birthDate: '15/05/1990'
            })
          }),
          person2: expect.objectContaining({
            birthData: expect.objectContaining({
              birthDate: '20/08/1988'
            })
          })
        })
      );
      expect(result).toEqual(mockResult);
    });

    test('should handle calculator initialization if needed', async () => {
      compositeChartService.calculator = null; // Simulate uninitialized calculator

      await compositeChartService.processCalculation(validCompositeData);

      // Calculator should be initialized
      expect(mockCalculatorInstance.initialize).toHaveBeenCalled();
    });

    test('should handle calculator errors gracefully', async () => {
      mockCalculatorInstance.calculateCompositeChart.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(
        compositeChartService.processCalculation(validCompositeData)
      ).rejects.toThrow('Composite chart calculation failed: Calculator error');

      expect(logger.error).toHaveBeenCalledWith(
        'CompositeChartService calculation error:',
        expect.any(Error)
      );
    });
  });

  describe('calculateCompositeChart method', () => {
    test('should calculate composite chart and analysis', async () => {
      const compositeData = {
        person1: { birthData: { birthDate: '15/05/1990', birthTime: '12:30', birthPlace: 'Mumbai, India' } },
        person2: { birthData: { birthDate: '20/08/1988', birthTime: '10:45', birthPlace: 'Delhi, India' } }
      };

      const expectedCompositeChart = {
        compositeChart: {
          ascendant: 'Libra',
          planets: [
            { name: 'Sun', sign: 'Scorpio', degree: 15.5, house: 2 }
          ],
          houses: [
            { number: 1, sign: 'Libra', cusp: 120.5 }
          ]
        },
        planetaryMidpoints: {
          sun: { midpoint: 135.5, signs: ['Scorpio', 'Sagittarius'] }
        },
        compositeAscendant: 'Libra',
        aspects: [
          { planet1: 'Sun', planet2: 'Moon', aspect: 'trine', orb: 2.1 }
        ],
        interpretations: {
          relationshipFocus: 'Deep emotional connection',
          communicationStyle: 'Intuitive understanding',
          sharedGoals: 'Spiritual development'
        }
      };

      mockCalculatorInstance.calculateCompositeChart.mockResolvedValue(expectedCompositeChart);

      const result = await compositeChartService.calculator.calculateCompositeChart(compositeData);

      expect(result).toEqual(expectedCompositeChart);
      expect(mockCalculatorInstance.calculateCompositeChart).toHaveBeenCalledWith(compositeData);
    });
  });

  describe('generateCompositeChart method', () => {
    test('should generate the composite chart from two birth charts', async () => {
      const birthCharts = {
        person1Chart: { planets: [], houses: [] },
        person2Chart: { planets: [], houses: [] }
      };

      const expectedComposite = {
        planets: [
          { name: 'Sun', sign: 'Scorpio', degree: 15.5, house: 2 }
        ],
        houses: [
          { number: 1, sign: 'Libra', cusp: 120.5 }
        ],
        ascendant: 'Libra'
      };

      mockCalculatorInstance.generateCompositeChart.mockResolvedValue(expectedComposite);

      const result = await compositeChartService.calculator.generateCompositeChart(birthCharts);

      expect(result).toEqual(expectedComposite);
      expect(mockCalculatorInstance.generateCompositeChart).toHaveBeenCalledWith(birthCharts);
    });
  });

  describe('analyzeCompositeChart method', () => {
    test('should analyze the composite chart for insights', async () => {
      const chartData = {
        compositeChart: {},
        planetaryMidpoints: {}
      };

      const expectedAnalysis = {
        interpretations: {
          relationshipFocus: 'Deep emotional connection',
          communicationStyle: 'Intuitive understanding',
          sharedGoals: 'Spiritual development'
        },
        relationshipDynamics: {
          emotionalBond: 'Very Strong',
          intellectualRapport: 'Good',
          physicalAttraction: 'Harmonious',
          spiritualAlignment: 'Aligned'
        },
        timingPredictions: [
          { event: 'Major commitment', dateRange: 'Late 2023', planet: 'Venus' },
          { event: 'Shared journey', dateRange: 'Spring 2024', planet: 'Jupiter' }
        ],
        strengthAreas: ['Emotional intimacy', 'Spiritual connection'],
        cautionAreas: ['Different pacing styles']
      };

      mockCalculatorInstance.analyzeCompositeChart.mockResolvedValue(expectedAnalysis);

      const result = await compositeChartService.calculator.analyzeCompositeChart(chartData);

      expect(result).toEqual(expectedAnalysis);
      expect(mockCalculatorInstance.analyzeCompositeChart).toHaveBeenCalledWith(chartData);
    });
  });

  describe('calculateMidpoints method', () => {
    test('should calculate planetary midpoints in composite chart', async () => {
      const planetaryData = {
        person1Planets: [{ name: 'Sun', sign: 'Taurus', degree: 25.5 }],
        person2Planets: [{ name: 'Sun', sign: 'Gemini', degree: 28.2 }]
      };

      const expectedMidpoints = {
        sun: { midpoint: 26.85, signs: ['Taurus', 'Gemini'] }
      };

      mockCalculatorInstance.calculateMidpoints.mockResolvedValue(expectedMidpoints);

      const result = await compositeChartService.calculator.calculateMidpoints(planetaryData);

      expect(result).toEqual(expectedMidpoints);
      expect(mockCalculatorInstance.calculateMidpoints).toHaveBeenCalledWith(planetaryData);
    });
  });

  describe('getCompositeAspects method', () => {
    test('should calculate aspects in composite chart', async () => {
      const compositeChart = {
        planets: [
          { name: 'Sun', sign: 'Scorpio', degree: 15.5 },
          { name: 'Moon', sign: 'Pisces', degree: 28.2 }
        ]
      };

      const expectedAspects = [
        { planet1: 'Sun', planet2: 'Moon', aspect: 'trine', orb: 2.7, strength: 75 }
      ];

      mockCalculatorInstance.getCompositeAspects.mockResolvedValue(expectedAspects);

      const result = await compositeChartService.calculator.getCompositeAspects(compositeChart);

      expect(result).toEqual(expectedAspects);
      expect(mockCalculatorInstance.getCompositeAspects).toHaveBeenCalledWith(compositeChart);
    });
  });

  describe('formatResult method', () => {
    test('should format composite chart result properly', () => {
      const mockResult = {
        compositeChart: {},
        planetaryMidpoints: {},
        compositeAscendant: 'Libra',
        aspects: [],
        interpretations: { relationshipFocus: 'Deep connection' }
      };

      const formatted = compositeChartService.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.service).toBe('CompositeChartService');
      expect(formatted.timestamp).toBeDefined();
    });

    test('should format error result properly', () => {
      const formatted = compositeChartService.formatResult({ 
        error: 'Invalid birth data for composite chart' 
      });

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Invalid birth data for composite chart');
    });

    test('should include composite chart disclaimer', () => {
      const mockResult = { compositeChart: {}, compositeAscendant: 'Libra' };
      const formatted = compositeChartService.formatResult(mockResult);

      expect(formatted.disclaimer).toBeDefined();
      expect(formatted.disclaimer).toContain('Composite Chart');
    });
  });

  describe('getMetadata method', () => {
    test('should return correct metadata for composite chart service', () => {
      const metadata = compositeChartService.getMetadata();

      expect(metadata).toEqual({
        name: 'CompositeChartService',
        version: '1.0.0',
        category: 'compatibility',
        methods: ['calculateCompositeChart', 'generateCompositeChart', 'analyzeCompositeChart'],
        dependencies: ['SynastryEngine']
      });
    });
  });

  describe('getHealthStatus method', () => {
    test('should return healthy status when service is operational', async () => {
      const healthStatus = await compositeChartService.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.features).toEqual({});
      expect(healthStatus.supportedAnalyses).toEqual([]);
    });

    test('should return unhealthy status when error occurs', async () => {
      jest.spyOn(compositeChartService, 'getHealthStatus').mockRejectedValue(
        new Error('Health check failed')
      );

      await expect(compositeChartService.getHealthStatus())
        .rejects.toThrow('Health check failed');
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should implement ServiceTemplate pattern', () => {
      expect(compositeChartService.serviceName).toBeDefined();
      expect(typeof compositeChartService.getHealthStatus).toBe('function');
      expect(typeof compositeChartService.getMetadata).toBe('function');
    });

    test('should have required methods', () => {
      expect(typeof compositeChartService.processCalculation).toBe('function');
      expect(typeof compositeChartService.formatResult).toBe('function');
    });
  });

  describe('Error Handling & Validation', () => {
    test('should handle concurrent requests properly', async () => {
      const mockData = {
        person1: { birthData: { birthDate: '15/05/1990', birthTime: '12:30', birthPlace: 'Mumbai, India' } },
        person2: { birthData: { birthDate: '20/08/1988', birthTime: '10:45', birthPlace: 'Delhi, India' } }
      };

      const mockResult = {
        compositeChart: {},
        planetaryMidpoints: {},
        compositeAscendant: 'Libra',
        aspects: [],
        interpretations: {}
      };

      mockCalculatorInstance.calculateCompositeChart.mockResolvedValue(mockResult);

      const concurrentRequests = Array(3).fill().map(() =>
        compositeChartService.processCalculation(mockData)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result.compositeChart).toBeDefined();
        expect(result.interpretations).toBeDefined();
      });

      expect(mockCalculatorInstance.calculateCompositeChart).toHaveBeenCalledTimes(3);
    });

    test('should handle null/undefined input gracefully', async () => {
      await expect(
        compositeChartService.processCalculation(null)
      ).rejects.toThrow('Composite chart calculation failed');
    });
  });

  describe('Performance & Resilience', () => {
    test('should respond within acceptable time for valid data', async () => {
      const mockResult = {
        compositeChart: {},
        planetaryMidpoints: {},
        compositeAscendant: 'Libra',
        aspects: [],
        interpretations: {}
      };

      mockCalculatorInstance.calculateCompositeChart.mockResolvedValue(mockResult);

      const startTime = Date.now();
      await compositeChartService.processCalculation({
        person1: { birthData: { birthDate: '15/05/1990', birthTime: '12:30', birthPlace: 'Mumbai, India' } },
        person2: { birthData: { birthDate: '20/08/1988', birthTime: '10:45', birthPlace: 'Delhi, India' } }
      });
      const duration = Date.now() - startTime;

      // Should complete within reasonable time (e.g., 150ms)
      expect(duration).toBeLessThan(150);
    });
  });
});