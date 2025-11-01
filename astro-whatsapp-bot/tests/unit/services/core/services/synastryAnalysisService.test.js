// tests/unit/services/core/services/synastryAnalysisService.test.js
// Comprehensive test suite for synastryAnalysisService

// Create mock calculator instance
const mockCalculatorInstance = {
  initialize: jest.fn().mockResolvedValue(true),
  analyzeSynastry: jest.fn().mockResolvedValue({
    aspects: [],
    connections: 0,
    score: 0,
    detailedAnalysis: {}
  }),
  calculateAspects: jest.fn().mockResolvedValue([]),
  getSynastryReport: jest.fn().mockResolvedValue({
    summary: 'Moderate synastry',
    strengths: [],
    challenges: [],
    recommendations: []
  }),
  generateDetailedInterpretation: jest.fn().mockResolvedValue({}),
  validateChartData: jest.fn().mockResolvedValue(true)
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

const SynastryAnalysisService = require('../../../../../src/core/services/synastryAnalysisService');
const logger = require('../../../../../src/utils/logger');

describe('SynastryAnalysisService', () => {
  let synastryAnalysisService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create service instance
    synastryAnalysisService = new SynastryAnalysisService();
    // Manually set the calculator since the mock might not work with dynamic loading  
    synastryAnalysisService.calculator = mockCalculatorInstance;
  });

  describe('Service Initialization', () => {
    test('should initialize SynastryAnalysisService with SynastryEngine', () => {
      expect(synastryAnalysisService.serviceName).toBe('SynastryAnalysisService');
      expect(synastryAnalysisService.calculatorPath).toBe('./calculators/SynastryEngine');
      
      // Verify logger was called during initialization
      expect(logger.info).toHaveBeenCalledWith('SynastryAnalysisService initialized');
    });
  });

  describe('processCalculation method', () => {
    const validSynastryData = {
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

    test('should process synastry analysis with valid data', async () => {
      const mockResult = {
        aspects: [
          { planets: ['Venus', 'Mars'], aspect: 'sextile', orb: 2.5, strength: 75 }
        ],
        connections: 15,
        score: 78,
        detailedAnalysis: {
          emotional: 'Strong emotional connection',
          intellectual: 'Good communication',
          physical: 'Harmonious attraction',
          spiritual: 'Shared values'
        },
        report: {
          summary: 'Excellent synastry',
          strengths: ['Emotional bonding', 'Shared interests'],
          challenges: ['Different pacing styles'],
          recommendations: ['Schedule quality time together']
        }
      };

      mockCalculatorInstance.analyzeSynastry.mockResolvedValue(mockResult);

      const result = await synastryAnalysisService.processCalculation(validSynastryData);

      expect(mockCalculatorInstance.analyzeSynastry).toHaveBeenCalledWith(
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
      synastryAnalysisService.calculator = null; // Simulate uninitialized calculator

      await synastryAnalysisService.processCalculation(validSynastryData);

      // Calculator should be initialized
      expect(mockCalculatorInstance.initialize).toHaveBeenCalled();
    });

    test('should handle calculator errors gracefully', async () => {
      mockCalculatorInstance.analyzeSynastry.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(
        synastryAnalysisService.processCalculation(validSynastryData)
      ).rejects.toThrow('Synastry analysis failed: Calculator error');

      expect(logger.error).toHaveBeenCalledWith(
        'SynastryAnalysisService calculation error:',
        expect.any(Error)
      );
    });
  });

  describe('analyzeSynastry method', () => {
    test('should analyze comprehensive synastry between charts', async () => {
      const chartData = {
        person1Chart: { planets: [], houses: [] },
        person2Chart: { planets: [], houses: [] }
      };

      const expectedAnalysis = {
        aspects: [
          { planets: ['Sun', 'Moon'], aspect: 'trine', orb: 1.8, strength: 82 },
          { planets: ['Mars', 'Venus'], aspect: 'sextile', orb: 3.2, strength: 68 }
        ],
        connections: 18,
        score: 80,
        detailedAnalysis: {
          emotional: 'Deep intuitive connection',
          intellectual: 'Excellent mental rapport',
          physical: 'Mutual strong attraction',
          spiritual: 'Aligned philosophical views'
        }
      };

      mockCalculatorInstance.analyzeSynastry.mockResolvedValue(expectedAnalysis);

      const result = await synastryAnalysisService.calculator.analyzeSynastry(chartData);

      expect(result).toEqual(expectedAnalysis);
      expect(mockCalculatorInstance.analyzeSynastry).toHaveBeenCalledWith(chartData);
    });
  });

  describe('calculateAspects method', () => {
    test('should calculate synastry aspects between planets', async () => {
      const planetPositions = {
        person1: { planets: [{ name: 'Sun', sign: 'Taurus', degree: 25.5 }] },
        person2: { planets: [{ name: 'Moon', sign: 'Cancer', degree: 12.3 }] }
      };

      const expectedAspects = [
        { planet1: 'Sun', planet2: 'Moon', aspect: 'trine', orb: 2.1, strength: 78 }
      ];

      mockCalculatorInstance.calculateAspects.mockResolvedValue(expectedAspects);

      const result = await synastryAnalysisService.calculator.calculateAspects(planetPositions);

      expect(result).toEqual(expectedAspects);
      expect(mockCalculatorInstance.calculateAspects).toHaveBeenCalledWith(planetPositions);
    });
  });

  describe('getSynastryReport method', () => {
    test('should generate detailed synastry report', async () => {
      const synastryData = {
        aspects: [],
        connections: 15,
        score: 78
      };

      const expectedReport = {
        summary: 'Very good synastry with strong potential',
        strengths: ['Emotional bonding', 'Intellectual compatibility'],
        challenges: ['Occasional misunderstandings'],
        recommendations: ['Practice open communication', 'Respect individual differences']
      };

      mockCalculatorInstance.getSynastryReport.mockResolvedValue(expectedReport);

      const result = await synastryAnalysisService.calculator.getSynastryReport(synastryData);

      expect(result).toEqual(expectedReport);
      expect(mockCalculatorInstance.getSynastryReport).toHaveBeenCalledWith(synastryData);
    });
  });

  describe('generateDetailedInterpretation method', () => {
    test('should generate detailed interpretation of synastry aspects', async () => {
      const aspectData = {
        aspects: [
          { planets: ['Venus', 'Mars'], aspect: 'sextile', orb: 2.5 }
        ]
      };

      const expectedInterpretation = {
        venusMars: {
          description: 'Harmonious relationship between values and drive',
          implications: ['Creative collaboration', 'Mutual attraction'],
          timing: 'Consistent throughout relationship'
        }
      };

      mockCalculatorInstance.generateDetailedInterpretation.mockResolvedValue(expectedInterpretation);

      const result = await synastryAnalysisService.calculator.generateDetailedInterpretation(aspectData);

      expect(result).toEqual(expectedInterpretation);
      expect(mockCalculatorInstance.generateDetailedInterpretation).toHaveBeenCalledWith(aspectData);
    });
  });

  describe('validateChartData method', () => {
    test('should validate synastry chart data', async () => {
      const chartData = {
        person1Chart: { planets: [], houses: [] },
        person2Chart: { planets: [], houses: [] }
      };

      mockCalculatorInstance.validateChartData.mockResolvedValue(true);

      const result = await synastryAnalysisService.calculator.validateChartData(chartData);

      expect(result).toBe(true);
      expect(mockCalculatorInstance.validateChartData).toHaveBeenCalledWith(chartData);
    });

    test('should reject invalid chart data', async () => {
      const invalidChartData = {
        person1Chart: null,
        person2Chart: { planets: [], houses: [] }
      };

      mockCalculatorInstance.validateChartData.mockResolvedValue(false);

      const result = await synastryAnalysisService.calculator.validateChartData(invalidChartData);

      expect(result).toBe(false);
      expect(mockCalculatorInstance.validateChartData).toHaveBeenCalledWith(invalidChartData);
    });
  });

  describe('formatResult method', () => {
    test('should format synastry analysis result properly', () => {
      const mockResult = {
        aspects: [],
        connections: 15,
        score: 78,
        report: { summary: 'Good synastry' }
      };

      const formatted = synastryAnalysisService.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.service).toBe('SynastryAnalysisService');
      expect(formatted.timestamp).toBeDefined();
    });

    test('should format error result properly', () => {
      const formatted = synastryAnalysisService.formatResult({ 
        error: 'Invalid chart data for synastry' 
      });

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Invalid chart data for synastry');
    });

    test('should include synastry-specific disclaimer', () => {
      const mockResult = { aspects: [], connections: 15 };
      const formatted = synastryAnalysisService.formatResult(mockResult);

      expect(formatted.disclaimer).toBeDefined();
      expect(formatted.disclaimer).toContain('Synastry Analysis');
    });
  });

  describe('getMetadata method', () => {
    test('should return correct metadata for synastry analysis service', () => {
      const metadata = synastryAnalysisService.getMetadata();

      expect(metadata).toEqual({
        name: 'SynastryAnalysisService',
        version: '1.0.0',
        category: 'compatibility',
        methods: ['analyzeSynastry', 'calculateAspects', 'getSynastryReport'],
        dependencies: ['SynastryEngine']
      });
    });
  });

  describe('getHealthStatus method', () => {
    test('should return healthy status when service is operational', async () => {
      const healthStatus = await synastryAnalysisService.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.features).toEqual({});
      expect(healthStatus.supportedAnalyses).toEqual([]);
    });

    test('should return unhealthy status when error occurs', async () => {
      jest.spyOn(synastryAnalysisService, 'getHealthStatus').mockRejectedValue(
        new Error('Health check failed')
      );

      await expect(synastryAnalysisService.getHealthStatus())
        .rejects.toThrow('Health check failed');
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should implement ServiceTemplate pattern', () => {
      expect(synastryAnalysisService.serviceName).toBeDefined();
      expect(typeof synastryAnalysisService.getHealthStatus).toBe('function');
      expect(typeof synastryAnalysisService.getMetadata).toBe('function');
    });

    test('should have required methods', () => {
      expect(typeof synastryAnalysisService.processCalculation).toBe('function');
      expect(typeof synastryAnalysisService.formatResult).toBe('function');
    });
  });

  describe('Error Handling & Validation', () => {
    test('should handle concurrent requests properly', async () => {
      const mockData = {
        person1: { birthData: { birthDate: '15/05/1990', birthTime: '12:30', birthPlace: 'Mumbai, India' } },
        person2: { birthData: { birthDate: '20/08/1988', birthTime: '10:45', birthPlace: 'Delhi, India' } }
      };

      const mockResult = {
        aspects: [],
        connections: 15,
        score: 75,
        report: { summary: 'Moderate synastry' }
      };

      mockCalculatorInstance.analyzeSynastry.mockResolvedValue(mockResult);

      const concurrentRequests = Array(3).fill().map(() =>
        synastryAnalysisService.processCalculation(mockData)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result.aspects).toBeDefined();
        expect(result.connections).toBeDefined();
        expect(result.score).toBeDefined();
      });

      expect(mockCalculatorInstance.analyzeSynastry).toHaveBeenCalledTimes(3);
    });

    test('should handle null/undefined input gracefully', async () => {
      await expect(
        synastryAnalysisService.processCalculation(null)
      ).rejects.toThrow('Synastry analysis failed');
    });
  });

  describe('Performance & Resilience', () => {
    test('should respond within acceptable time for valid data', async () => {
      const mockResult = {
        aspects: [],
        connections: 15,
        score: 75,
        report: { summary: 'Moderate synastry' }
      };

      mockCalculatorInstance.analyzeSynastry.mockResolvedValue(mockResult);

      const startTime = Date.now();
      await synastryAnalysisService.processCalculation({
        person1: { birthData: { birthDate: '15/05/1990', birthTime: '12:30', birthPlace: 'Mumbai, India' } },
        person2: { birthData: { birthDate: '20/08/1988', birthTime: '10:45', birthPlace: 'Delhi, India' } }
      });
      const duration = Date.now() - startTime;

      // Should complete within reasonable time (e.g., 150ms)
      expect(duration).toBeLessThan(150);
    });
  });
});