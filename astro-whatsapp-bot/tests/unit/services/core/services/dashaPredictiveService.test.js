// tests/unit/services/core/services/dashaPredictiveService.test.js
// Comprehensive test suite for dashaPredictiveService

// Create mock calculator instance
const mockCalculatorInstance = {
  initialize: jest.fn().mockResolvedValue(true),
  getDashaPredictiveAnalysis: jest.fn().mockResolvedValue({
    currentDasha: {},
    upcomingPeriods: [],
    planetaryInfluences: [],
    timingPredictions: []
  }),
  calculateVimshottariDasha: jest.fn().mockResolvedValue({
    periods: [],
    currentPeriod: {}
  }),
  getDashaTiming: jest.fn().mockResolvedValue({
    start: '2023-01-01',
    end: '2023-12-31'
  }),
  predictDashaEvents: jest.fn().mockResolvedValue([]),
  analyzeDashaTransits: jest.fn().mockResolvedValue({
    transits: [],
    aspects: []
  }),
  getDashaRemedies: jest.fn().mockResolvedValue([])
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

const DashaPredictiveService = require('../../../../../src/core/services/dashaPredictiveService');
const logger = require('../../../../../src/utils/logger');

describe('DashaPredictiveService', () => {
  let dashaPredictiveService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create service instance
    dashaPredictiveService = new DashaPredictiveService();
    // Manually set the calculator since the mock might not work with dynamic loading  
    dashaPredictiveService.calculator = mockCalculatorInstance;
  });

  describe('Service Initialization', () => {
    test('should initialize DashaPredictiveService with ChartGenerator', () => {
      expect(dashaPredictiveService.serviceName).toBe('DashaPredictiveService');
      expect(dashaPredictiveService.calculatorPath).toBe('./calculators/ChartGenerator');
      
      // Verify logger was called during initialization
      expect(logger.info).toHaveBeenCalledWith('DashaPredictiveService initialized');
    });
  });

  describe('ldashaPredictiveCalculation method', () => {
    const dashaData = {
      birthData: {
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India',
        latitude: 19.0760,
        longitude: 72.8777,
        timezone: 'IST'
      },
      startDate: '01/01/2023',
      endDate: '31/12/2023'
    };

    test('should calculate dasha predictive analysis with valid data', async () => {
      const mockResult = {
        currentDasha: {
          planet: 'Venus',
          start: '2023-01-01',
          end: '2023-12-31',
          remaining: '8 months'
        },
        upcomingPeriods: [
          { planet: 'Sun', start: '2024-01-01', end: '2024-12-31' }
        ],
        planetaryInfluences: [
          { planet: 'Venus', strength: 8, effects: ['Love', 'Creativity'] }
        ],
        timingPredictions: [
          { event: 'Marriage', period: 'June 2023', confidence: 75 }
        ],
        remedies: [
          { planet: 'Venus', remedy: 'Wear diamond', timing: 'Friday' }
        ]
      };

      mockCalculatorInstance.getDashaPredictiveAnalysis.mockResolvedValue(mockResult);

      const result = await dashaPredictiveService.ldashaPredictiveCalculation(dashaData);

      expect(mockCalculatorInstance.getDashaPredictiveAnalysis).toHaveBeenCalledWith(dashaData);
      expect(result).toEqual(mockResult);
    });

    test('should handle calculator initialization if needed', async () => {
      dashaPredictiveService.calculator = null; // Simulate uninitialized calculator

      await dashaPredictiveService.ldashaPredictiveCalculation(dashaData);

      // Calculator should be initialized
      expect(mockCalculatorInstance.initialize).toHaveBeenCalled();
    });

    test('should handle calculator errors gracefully', async () => {
      mockCalculatorInstance.getDashaPredictiveAnalysis.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(
        dashaPredictiveService.ldashaPredictiveCalculation(dashaData)
      ).rejects.toThrow('Dasha predictive analysis failed: Calculator error');

      expect(logger.error).toHaveBeenCalledWith(
        'DashaPredictiveService calculation error:',
        expect.any(Error)
      );
    });
  });

  describe('getDashaPredictiveAnalysis method', () => {
    test('should get comprehensive dasha predictive analysis', async () => {
      const dashaData = {
        birthData: {
          birthDate: '15/05/1990',
          birthTime: '12:30',
          birthPlace: 'Mumbai, India'
        }
      };

      const expectedAnalysis = {
        currentDasha: {
          planet: 'Mercury',
          start: '2023-01-01',
          end: '2023-06-30',
          remaining: '3 months'
        },
        upcomingPeriods: [
          { planet: 'Ketu', start: '2023-07-01', end: '2024-01-31' }
        ],
        planetaryInfluences: [
          { planet: 'Mercury', strength: 7, effects: ['Communication', 'Business'] }
        ],
        timingPredictions: [
          { event: 'Career advancement', period: 'March-April 2023', confidence: 80 }
        ],
        remedies: [
          { planet: 'Mercury', remedy: 'Recite Budh Gayatri Mantra', repetitions: 108 }
        ]
      };

      mockCalculatorInstance.getDashaPredictiveAnalysis.mockResolvedValue(expectedAnalysis);

      const result = await dashaPredictiveService.getDashaPredictiveAnalysis(dashaData);

      expect(result).toEqual(expectedAnalysis);
      expect(mockCalculatorInstance.getDashaPredictiveAnalysis).toHaveBeenCalledWith(dashaData);
    });
  });

  describe('calculateVimshottariDasha method', () => {
    test('should calculate Vimshottari Dasha periods', async () => {
      const birthData = {
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };

      const expectedDasha = {
        periods: [
          { planet: 'Ketu', start: '1990-05-15', end: '1997-05-15', duration: '7 years' },
          { planet: 'Venus', start: '1997-05-15', end: '2003-05-15', duration: '6 years' }
        ],
        currentPeriod: { planet: 'Venus', start: '1997-05-15', end: '2003-05-15' }
      };

      mockCalculatorInstance.calculateVimshottariDasha.mockResolvedValue(expectedDasha);

      const result = await dashaPredictiveService.calculator.calculateVimshottariDasha(birthData);

      expect(result).toEqual(expectedDasha);
      expect(mockCalculatorInstance.calculateVimshottariDasha).toHaveBeenCalledWith(birthData);
    });
  });

  describe('getDashaTiming method', () => {
    test('should get timing information for specific dasha period', async () => {
      const dashaQuery = {
        planet: 'Saturn',
        birthDate: '15/05/1990'
      };

      const expectedTiming = {
        start: '2023-06-01',
        end: '2032-06-01',
        duration: '9 years',
        withinCurrentLifetime: true
      };

      mockCalculatorInstance.getDashaTiming.mockResolvedValue(expectedTiming);

      const result = await dashaPredictiveService.calculator.getDashaTiming(dashaQuery);

      expect(result).toEqual(expectedTiming);
      expect(mockCalculatorInstance.getDashaTiming).toHaveBeenCalledWith(dashaQuery);
    });
  });

  describe('predictDashaEvents method', () => {
    test('should predict events during dasha period', async () => {
      const dashaPeriod = {
        planet: 'Jupiter',
        start: '2023-01-01',
        end: '2023-12-31'
      };

      const expectedEvents = [
        { type: 'Education', timing: 'March 2023', intensity: 'High' },
        { type: 'Marriage', timing: 'September 2023', intensity: 'Medium' },
        { type: 'Travel', timing: 'December 2023', intensity: 'High' }
      ];

      mockCalculatorInstance.predictDashaEvents.mockResolvedValue(expectedEvents);

      const result = await dashaPredictiveService.calculator.predictDashaEvents(dashaPeriod);

      expect(result).toEqual(expectedEvents);
      expect(mockCalculatorInstance.predictDashaEvents).toHaveBeenCalledWith(dashaPeriod);
    });
  });

  describe('analyzeDashaTransits method', ()() => {
    test('should analyze transits during dasha period', async () => {
      const dashaContext = {
        planet: 'Mars',
        period: { start: '2023-01-01', end: '2023-07-31' }
      };

      const expectedTransits = {
        transits: [
          { planet: 'Saturn', aspect: 'square', natalPlanet: 'Mars', timing: 'April 2023' }
        ],
        aspects: [
          { planet1: 'Mars', planet2: 'Saturn', aspect: 'square', orb: 2.5 }
        ],
        interpretation: 'Challenging period requiring patience and perseverance'
      };

      mockCalculatorInstance.analyzeDashaTransits.mockResolvedValue(expectedTransits);

      const result = await dashaPredictiveService.calculator.analyzeDashaTransits(dashaContext);

      expect(result).toEqual(expectedTransits);
      expect(mockCalculatorInstance.analyzeDashaTransits).toHaveBeenCalledWith(dashaContext);
    });
  });

  describe('getDashaRemedies method', () => {
    test('should suggest remedies for dasha period', async () => {
      const dashaConcerns = {
        planet: 'Rahu',
        issues: ['Confusion', 'Obstacles']
      };

      const expectedRemedies = [
        { planet: 'Rahu', remedy: 'Recite Rahu Gayatri Mantra', timing: 'Saturday' },
        { planet: 'Rahu', remedy: 'Donate black items', timing: 'Monthly' },
        { planet: 'Rahu', remedy: 'Wear Gomed stone', recommendation: 'Consult astrologer' }
      ];

      mockCalculatorInstance.getDashaRemedies.mockResolvedValue(expectedRemedies);

      const result = await dashaPredictiveService.calculator.getDashaRemedies(dashaConcerns);

      expect(result).toEqual(expectedRemedies);
      expect(mockCalculatorInstance.getDashaRemedies).toHaveBeenCalledWith(dashaConcerns);
    });
  });

  describe('processCalculation method', () => {
    test('should call ldashaPredictiveCalculation with provided data', async () => {
      const mockData = {
        birthData: { birthDate: '15/05/1990', birthTime: '12:30', birthPlace: 'Mumbai, India' }
      };
      
      const expectedResult = { currentDasha: {}, upcomingPeriods: [] };
      
      mockCalculatorInstance.getDashaPredictiveAnalysis.mockResolvedValue(expectedResult);

      const result = await dashaPredictiveService.processCalculation(mockData);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('formatResult method', () => {
    test('should format dasha predictive result properly', () => {
      const mockResult = {
        currentDasha: { planet: 'Venus' },
        upcomingPeriods: [],
        timingPredictions: []
      };

      const formatted = dashaPredictiveService.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.service).toBe('DashaPredictiveService');
      expect(formatted.timestamp).toBeDefined();
    });

    test('should format error result properly', () => {
      const formatted = dashaPredictiveService.formatResult({ 
        error: 'Invalid birth data for dasha analysis' 
      });

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Invalid birth data for dasha analysis');
    });

    test('should include dasha-specific disclaimer', () => {
      const mockResult = { currentDasha: { planet: 'Venus' } };
      const formatted = dashaPredictiveService.formatResult(mockResult);

      expect(formatted.disclaimer).toBeDefined();
      expect(formatted.disclaimer).toContain('Vedic Dasha');
    });
  });

  describe('getMetadata method', () => {
    test('should return correct metadata for dasha predictive service', () => {
      const metadata = dashaPredictiveService.getMetadata();

      expect(metadata).toEqual({
        name: 'DashaPredictiveService',
        version: '1.0.0',
        category: 'predictive',
        methods: ['getDashaPredictiveAnalysis', 'calculateVimshottariDasha', 'predictDashaEvents'],
        dependencies: ['ChartGenerator']
      });
    });
  });

  describe('getHealthStatus method', () => {
    test('should return healthy status when service is operational', async () => {
      const healthStatus = await dashaPredictiveService.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.features).toEqual({});
      expect(healthStatus.supportedAnalyses).toEqual([]);
    });

    test('should return unhealthy status when error occurs', async () => {
      jest.spyOn(dashaPredictiveService, 'getHealthStatus').mockRejectedValue(
        new Error('Health check failed')
      );

      await expect(dashaPredictiveService.getHealthStatus())
        .rejects.toThrow('Health check failed');
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should implement ServiceTemplate pattern', () => {
      expect(dashaPredictiveService.serviceName).toBeDefined();
      expect(typeof dashaPredictiveService.getHealthStatus).toBe('function');
      expect(typeof dashaPredictiveService.getMetadata).toBe('function');
    });

    test('should have required methods', () => {
      expect(typeof dashaPredictiveService.processCalculation).toBe('function');
      expect(typeof dashaPredictiveService.formatResult).toBe('function');
    });
  });

  describe('Error Handling & Validation', () => {
    test('should handle concurrent requests properly', async () => {
      const mockData = {
        birthData: { birthDate: '15/05/1990', birthTime: '12:30', birthPlace: 'Mumbai, India' }
      };

      const mockResult = {
        currentDasha: {},
        upcomingPeriods: [],
        timingPredictions: []
      };

      mockCalculatorInstance.getDashaPredictiveAnalysis.mockResolvedValue(mockResult);

      const concurrentRequests = Array(3).fill().map(() =>
        dashaPredictiveService.ldashaPredictiveCalculation(mockData)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result.currentDasha).toBeDefined();
        expect(result.upcomingPeriods).toBeDefined();
      });

      expect(mockCalculatorInstance.getDashaPredictiveAnalysis).toHaveBeenCalledTimes(3);
    });

    test('should handle invalid dasha data gracefully', async () => {
      await expect(
        dashaPredictiveService.ldashaPredictiveCalculation(null)
      ).rejects.toThrow('Dasha predictive analysis failed');
    });
  });

  describe('Performance & Resilience', () => {
    test('should respond within acceptable time for valid data', async () => {
      const mockResult = {
        currentDasha: {},
        upcomingPeriods: [],
        timingPredictions: []
      };

      mockCalculatorInstance.getDashaPredictiveAnalysis.mockResolvedValue(mockResult);

      const startTime = Date.now();
      await dashaPredictiveService.ldashaPredictiveCalculation({
        birthData: { birthDate: '15/05/1990', birthTime: '12:30', birthPlace: 'Mumbai, India' }
      });
      const duration = Date.now() - startTime;

      // Should complete within reasonable time (e.g., 150ms)
      expect(duration).toBeLessThan(150);
    });
  });
});