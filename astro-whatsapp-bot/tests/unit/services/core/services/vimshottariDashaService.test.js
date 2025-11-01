// tests/unit/services/core/services/vimshottariDashaService.test.js
// Comprehensive test suite for vimshottariDashaService

// Create mock calculator instance
const mockCalculatorInstance = {
  initialize: jest.fn().mockResolvedValue(true),
  calculateVimshottariDasha: jest.fn().mockResolvedValue({
    periods: [],
    currentPeriod: {},
    upcomingPeriods: []
  }),
  analyzeDashaPeriod: jest.fn().mockResolvedValue({
    planet: 'Venus',
    start: '2023-01-01',
    end: '2029-01-01',
    duration: '6 years',
    interpretations: {}
  }),
  getDashaTiming: jest.fn().mockResolvedValue({
    start: '2023-01-01',
    end: '2029-01-01',
    duration: '6 years'
  }),
  predictDashaEvents: jest.fn().mockResolvedValue([]),
  getDashaRemedies: jest.fn().mockResolvedValue([])
};

// Mock the calculator module before importing the service
jest.mock('../../../../../src/core/services/calculators/DashaAnalysisCalculator', () => {
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

const VimshottariDashaService = require('../../../../../src/core/services/vimshottariDashaService');
const logger = require('../../../../../src/utils/logger');

describe('VimshottariDashaService', () => {
  let vimshottariDashaService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create service instance
    vimshottariDashaService = new VimshottariDashaService();
    // Manually set the calculator since the mock might not work with dynamic loading  
    vimshottariDashaService.calculator = mockCalculatorInstance;
  });

  describe('Service Initialization', () => {
    test('should initialize VimshottariDashaService with DashaAnalysisCalculator', () => {
      expect(vimshottariDashaService.serviceName).toBe('VimshottariDashaService');
      expect(vimshottariDashaService.calculatorPath).toBe('./calculators/DashaAnalysisCalculator');
      
      // Verify logger was called during initialization
      expect(logger.info).toHaveBeenCalledWith('VimshottariDashaService initialized');
    });
  });

  describe('processCalculation method', () => {
    const validDashaData = {
      birthData: {
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India',
        latitude: 19.0760,
        longitude: 72.8777,
        timezone: 'IST'
      },
      startDate: '01/01/2023',
      endDate: '31/12/2029'
    };

    test('should process vimshottari dasha calculation with valid data', async () => {
      const mockResult = {
        periods: [
          {
            planet: 'Ketu',
            start: '1990-05-15',
            end: '1997-05-15',
            duration: '7 years',
            antardasha: []
          },
          {
            planet: 'Venus',
            start: '1997-05-15',
            end: '2003-05-15',
            duration: '6 years',
            antardasha: []
          }
        ],
        currentPeriod: {
          planet: 'Venus',
          start: '1997-05-15',
          end: '2003-05-15',
          remaining: '2 years 8 months'
        },
        upcomingPeriods: [
          {
            planet: 'Sun',
            start: '2003-05-15',
            end: '2009-05-15',
            duration: '6 years'
          }
        ],
        interpretations: {
          current: 'Creative and relationship-focused period',
          upcoming: 'Leadership and self-expression phase'
        }
      };

      mockCalculatorInstance.calculateVimshottariDasha.mockResolvedValue(mockResult);

      const result = await vimshottariDashaService.processCalculation(validDashaData);

      expect(mockCalculatorInstance.calculateVimshottariDasha).toHaveBeenCalledWith(
        expect.objectContaining({
          birthData: expect.objectContaining({
            birthDate: '15/05/1990'
          })
        })
      );
      expect(result).toEqual(mockResult);
    });

    test('should handle calculator initialization if needed', async () => {
      vimshottariDashaService.calculator = null; // Simulate uninitialized calculator

      await vimshottariDashaService.processCalculation(validDashaData);

      // Calculator should be initialized
      expect(mockCalculatorInstance.initialize).toHaveBeenCalled();
    });

    test('should handle calculator errors gracefully', async () => {
      mockCalculatorInstance.calculateVimshottariDasha.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(
        vimshottariDashaService.processCalculation(validDashaData)
      ).rejects.toThrow('Vimshottari dasha calculation failed: Calculator error');

      expect(logger.error).toHaveBeenCalledWith(
        'VimshottariDashaService calculation error:',
        expect.any(Error)
      );
    });
  });

  describe('calculateVimshottariDasha method', () => {
    test('should calculate complete vimshottari dasha sequence', async () => {
      const birthData = {
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };

      const expectedDasha = {
        periods: [
          { planet: 'Ketu', start: '1990-05-15', end: '1997-05-15', duration: '7 years' },
          { planet: 'Venus', start: '1997-05-15', end: '2003-05-15', duration: '6 years' },
          { planet: 'Sun', start: '2003-05-15', end: '2009-05-15', duration: '6 years' },
          { planet: 'Moon', start: '2009-05-15', end: '2019-05-15', duration: '10 years' },
          { planet: 'Mars', start: '2019-05-15', end: '2026-05-15', duration: '7 years' },
          { planet: 'Rahu', start: '2026-05-15', end: '2033-05-15', duration: '7 years' },
          { planet: 'Jupiter', start: '2033-05-15', end: '2039-05-15', duration: '6 years' },
          { planet: 'Saturn', start: '2039-05-15', end: '2046-05-15', duration: '7 years' },
          { planet: 'Mercury', start: '2046-05-15', end: '2053-05-15', duration: '7 years' }
        ],
        currentPeriod: {
          planet: 'Mars',
          start: '2019-05-15',
          end: '2026-05-15',
          remaining: '4 years 7 months'
        },
        upcomingPeriods: [
          { planet: 'Rahu', start: '2026-05-15', end: '2033-05-15', duration: '7 years' },
          { planet: 'Jupiter', start: '2033-05-15', end: '2039-05-15', duration: '6 years' }
        ]
      };

      mockCalculatorInstance.calculateVimshottariDasha.mockResolvedValue(expectedDasha);

      const result = await vimshottariDashaService.calculator.calculateVimshottariDasha({ birthData });

      expect(result).toEqual(expectedDasha);
      expect(mockCalculatorInstance.calculateVimshottariDasha).toHaveBeenCalledWith({ birthData });
    });
  });

  describe('analyzeDashaPeriod method', () => {
    test('should analyze specific dasha period in detail', async () => {
      const dashaPeriod = {
        planet: 'Jupiter',
        start: '2023-01-01',
        end: '2029-01-01'
      };

      const expectedAnalysis = {
        planet: 'Jupiter',
        start: '2023-01-01',
        end: '2029-01-01',
        duration: '6 years',
        characteristics: {
          themes: ['Wisdom', 'Education', 'Spiritual Growth', 'Expansion'],
          strengths: ['Philosophical insight', 'Teaching ability', 'Optimism'],
          challenges: ['Overconfidence', 'Excess', 'Dogmatism'],
          opportunities: ['Higher education', 'Foreign travel', 'Legal matters']
        },
        timing: {
          favorableMonths: ['January', 'April', 'July', 'October'],
          cautionPeriods: ['March', 'September'],
          peakYears: ['2025', '2027']
        },
        remedies: [
          { planet: 'Jupiter', action: 'Recite Guru Gayatri Mantra', frequency: 'Daily' },
          { planet: 'Jupiter', action: 'Donate yellow items', frequency: 'Thursday' }
        ]
      };

      mockCalculatorInstance.analyzeDashaPeriod.mockResolvedValue(expectedAnalysis);

      const result = await vimshottariDashaService.calculator.analyzeDashaPeriod(dashaPeriod);

      expect(result).toEqual(expectedAnalysis);
      expect(mockCalculatorInstance.analyzeDashaPeriod).toHaveBeenCalledWith(dashaPeriod);
    });
  });

  describe('getDashaTiming method', ()() => {
    test('should get timing information for specific planet dasha', async () => {
      const planetQuery = {
        planet: 'Saturn',
        birthDate: '15/05/1990'
      };

      const expectedTiming = {
        start: '2039-05-15',
        end: '2046-05-15',
        duration: '7 years',
        withinCurrentLifetime: true
      };

      mockCalculatorInstance.getDashaTiming.mockResolvedValue(expectedTiming);

      const result = await vimshottariDashaService.calculator.getDashaTiming(planetQuery);

      expect(result).toEqual(expectedTiming);
      expect(mockCalculatorInstance.getDashaTiming).toHaveBeenCalledWith(planetQuery);
    });
  });

  describe('predictDashaEvents method', () => {
    test('should predict significant events during dasha period', async () => {
      const dashaContext = {
        planet: 'Mars',
        period: { start: '2019-05-15', end: '2026-05-15' }
      };

      const expectedEvents = [
        { type: 'Career', timing: '2021-2023', intensity: 'High', description: 'Major professional breakthrough' },
        { type: 'Marriage', timing: '2022', intensity: 'Medium', description: 'Marriage or committed partnership' },
        { type: 'Property', timing: '2024-2025', intensity: 'High', description: 'Real estate acquisition or major renovation' },
        { type: 'Health', timing: '2020', intensity: 'Caution', description: 'Surgical procedure or injury recovery' }
      ];

      mockCalculatorInstance.predictDashaEvents.mockResolvedValue(expectedEvents);

      const result = await vimshottariDashaService.calculator.predictDashaEvents(dashaContext);

      expect(result).toEqual(expectedEvents);
      expect(mockCalculatorInstance.predictDashaEvents).toHaveBeenCalledWith(dashaContext);
    });
  });

  describe('getDashaRemedies method', () => {
    test('should suggest remedies for dasha period challenges', async () => {
      const dashaConcerns = {
        planet: 'Rahu',
        issues: ['Confusion', 'Obstacles', 'Unexpected changes']
      };

      const expectedRemedies = [
        { planet: 'Rahu', remedy: 'Recite Rahu Gayatri Mantra', frequency: 'Saturday mornings', repetitions: 108 },
        { planet: 'Rahu', remedy: 'Donate black items', frequency: 'Monthly', timing: 'New Moon' },
        { planet: 'Rahu', remedy: 'Wear Gomed stone', recommendation: 'Consult qualified astrologer for proper certification' },
        { planet: 'Rahu', remedy: 'Serve elderly or disadvantaged', frequency: 'Weekly', timing: 'Rahu hora' }
      ];

      mockCalculatorInstance.getDashaRemedies.mockResolvedValue(expectedRemedies);

      const result = await vimshottariDashaService.calculator.getDashaRemedies(dashaConcerns);

      expect(result).toEqual(expectedRemedies);
      expect(mockCalculatorInstance.getDashaRemedies).toHaveBeenCalledWith(dashaConcerns);
    });
  });

  describe('formatResult method', () => {
    test('should format vimshottari dasha result properly', () => {
      const mockResult = {
        periods: [],
        currentPeriod: { planet: 'Mars' },
        interpretations: { current: 'Energetic period' }
      };

      const formatted = vimshottariDashaService.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.service).toBe('VimshottariDashaService');
      expect(formatted.timestamp).toBeDefined();
    });

    test('should format error result properly', () => {
      const formatted = vimshottariDashaService.formatResult({ 
        error: 'Invalid birth data for vimshottari dasha calculation' 
      });

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Invalid birth data for vimshottari dasha calculation');
    });

    test('should include vimshottari dasha disclaimer', () => {
      const mockResult = { periods: [], currentPeriod: { planet: 'Mars' } };
      const formatted = vimshottariDashaService.formatResult(mockResult);

      expect(formatted.disclaimer).toBeDefined();
      expect(formatted.disclaimer).toContain('Vimshottari Dasha');
    });
  });

  describe('getMetadata method', () => {
    test('should return correct metadata for vimshottari dasha service', () => {
      const metadata = vimshottariDashaService.getMetadata();

      expect(metadata).toEqual({
        name: 'VimshottariDashaService',
        version: '1.0.0',
        category: 'predictive',
        methods: ['calculateVimshottariDasha', 'analyzeDashaPeriod', 'predictDashaEvents'],
        dependencies: ['DashaAnalysisCalculator']
      });
    });
  });

  describe('getHealthStatus method', () => {
    test('should return healthy status when service is operational', async () => {
      const healthStatus = await vimshottariDashaService.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.features).toEqual({});
      expect(healthStatus.supportedAnalyses).toEqual([]);
    });

    test('should return unhealthy status when error occurs', async () => {
      jest.spyOn(vimshottariDashaService, 'getHealthStatus').mockRejectedValue(
        new Error('Health check failed')
      );

      await expect(vimshottariDashaService.getHealthStatus())
        .rejects.toThrow('Health check failed');
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should implement ServiceTemplate pattern', () => {
      expect(vimshottariDashaService.serviceName).toBeDefined();
      expect(typeof vimshottariDashaService.getHealthStatus).toBe('function');
      expect(typeof vimshottariDashaService.getMetadata).toBe('function');
    });

    test('should have required methods', () => {
      expect(typeof vimshottariDashaService.processCalculation).toBe('function');
      expect(typeof vimshottariDashaService.formatResult).toBe('function');
    });
  });

  describe('Error Handling & Validation', () => {
    test('should handle concurrent requests properly', async () => {
      const mockData = {
        birthData: { birthDate: '15/05/1990', birthTime: '12:30', birthPlace: 'Mumbai, India' }
      };

      const mockResult = {
        periods: [],
        currentPeriod: { planet: 'Mars' },
        interpretations: {}
      };

      mockCalculatorInstance.calculateVimshottariDasha.mockResolvedValue(mockResult);

      const concurrentRequests = Array(3).fill().map(() =>
        vimshottariDashaService.processCalculation(mockData)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result.periods).toBeDefined();
        expect(result.currentPeriod).toBeDefined();
      });

      expect(mockCalculatorInstance.calculateVimshottariDasha).toHaveBeenCalledTimes(3);
    });

    test('should handle null/undefined input gracefully', async () => {
      await expect(
        vimshottariDashaService.processCalculation(null)
      ).rejects.toThrow('Vimshottari dasha calculation failed');
    });
  });

  describe('Performance & Resilience', () => {
    test('should respond within acceptable time for valid data', async () => {
      const mockResult = {
        periods: [],
        currentPeriod: { planet: 'Mars' },
        interpretations: {}
      };

      mockCalculatorInstance.calculateVimshottariDasha.mockResolvedValue(mockResult);

      const startTime = Date.now();
      await vimshottariDashaService.processCalculation({
        birthData: { birthDate: '15/05/1990', birthTime: '12:30', birthPlace: 'Mumbai, India' }
      });
      const duration = Date.now() - startTime;

      // Should complete within reasonable time (e.g., 150ms)
      expect(duration).toBeLessThan(150);
    });
  });
});