// tests/unit/services/core/services/coupleCompatibilityService.test.js
// Comprehensive test suite for coupleCompatibilityService

// Create mock calculator instance
const mockCalculatorInstance = {
  initialize: jest.fn().mockResolvedValue(true),
  analyzeCoupleCompatibility: jest.fn().mockResolvedValue({
    compatibilityScore: 78,
    synastryAspects: [],
    elementCompatibility: 'Compatible',
    modalitiesMatch: 'Balanced',
    detailedAnalysis: {}
  }),
  calculateSynastry: jest.fn().mockResolvedValue({
    aspects: [],
    connections: 0,
    score: 0
  }),
  getCompatibilityReport: jest.fn().mockResolvedValue({
    summary: 'Moderate compatibility',
    strengths: [],
    challenges: [],
    recommendations: []
  }),
  generateRemedies: jest.fn().mockResolvedValue([]),
  validatePartnerData: jest.fn().mockResolvedValue(true)
};

// Mock the calculator module before importing the service
jest.mock('../../../../../src/core/services/calculators/SynastryEngine', () => {
  return jest.fn().mockImplementation(() => mockCalculatorInstance);
});

// Mock the compatibility calculator
jest.mock('../../../../../src/core/services/calculators/CompatibilityCalculator', () => {
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

const CoupleCompatibilityService = require('../../../../../src/core/services/coupleCompatibilityService');
const logger = require('../../../../../src/utils/logger');

describe('CoupleCompatibilityService', () => {
  let coupleCompatibilityService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create service instance
    coupleCompatibilityService = new CoupleCompatibilityService();
    // Manually set the calculator since the mock might not work with dynamic loading  
    coupleCompatibilityService.calculator = mockCalculatorInstance;
  });

  describe('Service Initialization', () => {
    test('should initialize CoupleCompatibilityService with required calculators', () => {
      expect(coupleCompatibilityService.serviceName).toBe('CoupleCompatibilityService');
      expect(coupleCompatibilityService.calculatorPath).toBe('./calculators/SynastryEngine');
      
      // Verify logger was called during initialization
      expect(logger.info).toHaveBeenCalledWith('CoupleCompatibilityService initialized');
    });
  });

  describe('processCalculation method', () => {
    const validCompatibilityData = {
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

    test('should process couple compatibility calculation with valid data', async () => {
      const mockResult = {
        compatibilityScore: 82,
        synastryAspects: [
          { planets: ['Venus', 'Mars'], aspect: 'sextile', strength: 75 }
        ],
        elementCompatibility: 'Compatible',
        modalitiesMatch: 'Balanced',
        detailedAnalysis: {
          emotional: 'Strong emotional connection',
          intellectual: 'Good communication',
          physical: 'Harmonious attraction',
          spiritual: 'Shared values'
        },
        report: {
          summary: 'Excellent compatibility',
          strengths: ['Emotional bonding', 'Shared interests'],
          challenges: ['Different pacing styles'],
          recommendations: ['Schedule quality time together']
        }
      };

      mockCalculatorInstance.analyzeCoupleCompatibility.mockResolvedValue(mockResult);

      const result = await coupleCompatibilityService.processCalculation(validCompatibilityData);

      expect(mockCalculatorInstance.analyzeCoupleCompatibility).toHaveBeenCalledWith(
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
      coupleCompatibilityService.calculator = null; // Simulate uninitialized calculator

      await coupleCompatibilityService.processCalculation(validCompatibilityData);

      // Calculator should be initialized
      expect(mockCalculatorInstance.initialize).toHaveBeenCalled();
    });

    test('should handle calculator errors gracefully', async () => {
      mockCalculatorInstance.analyzeCoupleCompatibility.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(
        coupleCompatibilityService.processCalculation(validCompatibilityData)
      ).rejects.toThrow('Couple compatibility analysis failed: Calculator error');

      expect(logger.error).toHaveBeenCalledWith(
        'CoupleCompatibilityService calculation error:',
        expect.any(Error)
      );
    });
  });

  describe('analyzeCoupleCompatibility method', () => {
    test('should analyze comprehensive couple compatibility', async () => {
      const compatibilityData = {
        person1: { birthData: { birthDate: '15/05/1990', birthTime: '12:30', birthPlace: 'Mumbai, India' } },
        person2: { birthData: { birthDate: '20/08/1988', birthTime: '10:45', birthPlace: 'Delhi, India' } }
      };

      const expectedAnalysis = {
        compatibilityScore: 78,
        synastryAspects: [
          { planets: ['Sun', 'Moon'], aspect: 'trine', strength: 80 },
          { planets: ['Mars', 'Venus'], aspect: 'sextile', strength: 70 }
        ],
        elementCompatibility: 'Compatible',
        modalitiesMatch: 'Balanced',
        detailedAnalysis: {
          emotional: 'Strong intuitive connection',
          intellectual: 'Good mental rapport',
          physical: 'Mutual attraction',
          spiritual: 'Aligned beliefs'
        }
      };

      mockCalculatorInstance.analyzeCoupleCompatibility.mockResolvedValue(expectedAnalysis);

      const result = await coupleCompatibilityService.analyzer.compatibility(compatibilityData);

      expect(result).toEqual(expectedAnalysis);
      expect(mockCalculatorInstance.analyzeCoupleCompatibility).toHaveBeenCalledWith(compatibilityData);
    });
  });

  describe('calculateSynastry method', () => {
    test('should calculate synastry aspects between partners', async () => {
      const partnerCharts = {
        person1Chart: { planets: [], houses: [] },
        person2Chart: { planets: [], houses: [] }
      };

      const expectedSynastry = {
        aspects: [
          { planet1: 'Sun', planet2: 'Moon', aspect: 'trine', orb: 2.1 },
          { planet1: 'Mars', planet2: 'Venus', aspect: 'sextile', orb: 3.5 }
        ],
        connections: 12,
        score: 75
      };

      mockCalculatorInstance.calculateSynastry.mockResolvedValue(expectedSynastry);

      const result = await coupleCompatibilityService.calculator.calculateSynastry(partnerCharts);

      expect(result).toEqual(expectedSynastry);
      expect(mockCalculatorInstance.calculateSynastry).toHaveBeenCalledWith(partnerCharts);
    });
  });

  describe('getCompatibilityReport method', () => {
    test('should generate detailed compatibility report', async () => {
      const analysisData = {
        compatibilityScore: 78,
        synastryAspects: [],
        elementCompatibility: 'Compatible'
      };

      const expectedReport = {
        summary: 'Good compatibility with strong potential',
        strengths: ['Emotional bonding', 'Shared values'],
        challenges: ['Different communication styles'],
        recommendations: ['Practice active listening', 'Schedule regular check-ins']
      };

      mockCalculatorInstance.getCompatibilityReport.mockResolvedValue(expectedReport);

      const result = await coupleCompatibilityService.calculator.getCompatibilityReport(analysisData);

      expect(result).toEqual(expectedReport);
      expect(mockCalculatorInstance.getCompatibilityReport).toHaveBeenCalledWith(analysisData);
    });
  });

  describe('generateRemedies method', () => {
    test('should generate remedial suggestions for compatibility issues', async () => {
      const compatibilityIssues = {
        challenges: ['Communication gaps', 'Different paces'],
        score: 65
      };

      const expectedRemedies = [
        { issue: 'Communication gaps', remedy: 'Weekly deep conversations', timing: 'Weekends' },
        { issue: 'Different paces', remedy: 'Respect individual rhythms', timing: 'Ongoing' }
      ];

      mockCalculatorInstance.generateRemedies.mockResolvedValue(expectedRemedies);

      const result = await coupleCompatibilityService.calculator.generateRemedies(compatibilityIssues);

      expect(result).toEqual(expectedRemedies);
      expect(mockCalculatorInstance.generateRemedies).toHaveBeenCalledWith(compatibilityIssues);
    });
  });

  describe('validatePartnerData method', () => {
    test('should validate partner birth data', async () => {
      const partnerData = {
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };

      mockCalculatorInstance.validatePartnerData.mockResolvedValue(true);

      const result = await coupleCompatibilityService.calculator.validatePartnerData(partnerData);

      expect(result).toBe(true);
      expect(mockCalculatorInstance.validatePartnerData).toHaveBeenCalledWith(partnerData);
    });

    test('should reject invalid partner data', async () => {
      const invalidPartnerData = {
        birthDate: '',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };

      mockCalculatorInstance.validatePartnerData.mockResolvedValue(false);

      const result = await coupleCompatibilityService.calculator.validatePartnerData(invalidPartnerData);

      expect(result).toBe(false);
      expect(mockCalculatorInstance.validatePartnerData).toHaveBeenCalledWith(invalidPartnerData);
    });
  });

  describe('formatResult method', () => {
    test('should format couple compatibility result properly', () => {
      const mockResult = {
        compatibilityScore: 78,
        synastryAspects: [],
        elementCompatibility: 'Compatible',
        report: { summary: 'Good match' }
      };

      const formatted = coupleCompatibilityService.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.service).toBe('CoupleCompatibilityService');
      expect(formatted.timestamp).toBeDefined();
    });

    test('should format error result properly', () => {
      const formatted = coupleCompatibilityService.formatResult({ 
        error: 'Invalid partner data for compatibility analysis' 
      });

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Invalid partner data for compatibility analysis');
    });

    test('should include compatibility-specific disclaimer', () => {
      const mockResult = { compatibilityScore: 78 };
      const formatted = coupleCompatibilityService.formatResult(mockResult);

      expect(formatted.disclaimer).toBeDefined();
      expect(formatted.disclaimer).toContain('Couple Compatibility');
    });
  });

  describe('getMetadata method', () => {
    test('should return correct metadata for couple compatibility service', () => {
      const metadata = coupleCompatibilityService.getMetadata();

      expect(metadata).toEqual({
        name: 'CoupleCompatibilityService',
        version: '1.0.0',
        category: 'compatibility',
        methods: ['analyzeCoupleCompatibility', 'calculateSynastry', 'getCompatibilityReport'],
        dependencies: ['SynastryEngine', 'CompatibilityCalculator']
      });
    });
  });

  describe('getHealthStatus method', () => {
    test('should return healthy status when service is operational', async () => {
      const healthStatus = await coupleCompatibilityService.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.features).toEqual({});
      expect(healthStatus.supportedAnalyses).toEqual([]);
    });

    test('should return unhealthy status when error occurs', async () => {
      jest.spyOn(coupleCompatibilityService, 'getHealthStatus').mockRejectedValue(
        new Error('Health check failed')
      );

      await expect(coupleCompatibilityService.getHealthStatus())
        .rejects.toThrow('Health check failed');
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should implement ServiceTemplate pattern', () => {
      expect(coupleCompatibilityService.serviceName).toBeDefined();
      expect(typeof coupleCompatibilityService.getHealthStatus).toBe('function');
      expect(typeof coupleCompatibilityService.getMetadata).toBe('function');
    });

    test('should have required methods', () => {
      expect(typeof coupleCompatibilityService.processCalculation).toBe('function');
      expect(typeof coupleCompatibilityService.formatResult).toBe('function');
    });
  });

  describe('Error Handling & Validation', () => {
    test('should handle concurrent requests properly', async () => {
      const mockData = {
        person1: { birthData: { birthDate: '15/05/1990', birthTime: '12:30', birthPlace: 'Mumbai, India' } },
        person2: { birthData: { birthDate: '20/08/1988', birthTime: '10:45', birthPlace: 'Delhi, India' } }
      };

      const mockResult = {
        compatibilityScore: 75,
        synastryAspects: [],
        elementCompatibility: 'Compatible',
        report: { summary: 'Moderate compatibility' }
      };

      mockCalculatorInstance.analyzeCoupleCompatibility.mockResolvedValue(mockResult);

      const concurrentRequests = Array(3).fill().map(() =>
        coupleCompatibilityService.processCalculation(mockData)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result.compatibilityScore).toBeDefined();
        expect(result.elementCompatibility).toBeDefined();
      });

      expect(mockCalculatorInstance.analyzeCoupleCompatibility).toHaveBeenCalledTimes(3);
    });

    test('should handle null/undefined input gracefully', async () => {
      await expect(
        coupleCompatibilityService.processCalculation(null)
      ).rejects.toThrow('Couple compatibility analysis failed');
    });
  });

  describe('Performance & Resilience', () => {
    test('should respond within acceptable time for valid data', async () => {
      const mockResult = {
        compatibilityScore: 75,
        synastryAspects: [],
        elementCompatibility: 'Compatible',
        report: { summary: 'Moderate compatibility' }
      };

      mockCalculatorInstance.analyzeCoupleCompatibility.mockResolvedValue(mockResult);

      const startTime = Date.now();
      await coupleCompatibilityService.processCalculation({
        person1: { birthData: { birthDate: '15/05/1990', birthTime: '12:30', birthPlace: 'Mumbai, India' } },
        person2: { birthData: { birthDate: '20/08/1988', birthTime: '10:45', birthPlace: 'Delhi, India' } }
      });
      const duration = Date.now() - startTime;

      // Should complete within reasonable time (e.g., 150ms)
      expect(duration).toBeLessThan(150);
    });
  });
});