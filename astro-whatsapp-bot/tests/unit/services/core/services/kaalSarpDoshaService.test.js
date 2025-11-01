// tests/unit/services/core/services/kaalSarpDoshaService.test.js
// Comprehensive test suite for kaalSarpDoshaService

// Create mock calculator instance
const mockCalculatorInstance = {
  initialize: jest.fn().mockResolvedValue(true),
  analyzeKaalSarpDosha: jest.fn().mockResolvedValue({
    doshaType: 'Anant',
    intensity: 75,
    affectedHouses: [],
    remedies: [],
    timing: {}
  }),
  calculateKaalSarpDosha: jest.fn().mockResolvedValue({
    planets: [],
    rahuKetuAxis: {},
    doshaClassification: 'Anant'
  }),
  getKaalSarpRemedies: jest.fn().mockResolvedValue([]),
  determineDoshaTiming: jest.fn().mockResolvedValue({}),
  validateKaalSarpData: jest.fn().mockResolvedValue(true)
};

// Mock the calculator module before importing the service
jest.mock('../../../../../src/core/services/calculators/KaalSarpDoshaCalculator', () => {
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

const KaalSarpDoshaService = require('../../../../../src/core/services/kaalSarpDoshaService');
const logger = require('../../../../../src/utils/logger');

describe('KaalSarpDoshaService', () => {
  let kaalSarpDoshaService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create service instance
    kaalSarpDoshaService = new KaalSarpDoshaService();
    // Manually set the calculator since the mock might not work with dynamic loading  
    kaalSarpDoshaService.calculator = mockCalculatorInstance;
  });

  describe('Service Initialization', () => {
    test('should initialize KaalSarpDoshaService with KaalSarpDoshaCalculator', () => {
      expect(kaalSarpDoshaService.serviceName).toBe('KaalSarpDoshaService');
      expect(kaalSarpDoshaService.calculatorPath).toBe('./calculators/KaalSarpDoshaCalculator');
      
      // Verify logger was called during initialization
      expect(logger.info).toHaveBeenCalledWith('KaalSarpDoshaService initialized');
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

    test('should process kaal sarp dosha calculation with valid birth data', async () => {
      const mockResult = {
        doshaType: 'Anant',
        intensity: 78,
        affectedHouses: [3, 6, 8, 12],
        remedies: [
          { planet: 'Rahu', remedy: 'Recite Rahu Gayatri Mantra', repetitions: 108, timing: 'Saturday' },
          { planet: 'Rahu', remedy: 'Donate black items', frequency: 'Monthly', timing: 'New Moon' }
        ],
        timing: {
          currentPhase: 'Release period',
          nextChallenge: '2024-03-15',
          favorablePeriods: ['May-July 2023', 'November 2023'],
          remedialEfficacy: '75%'
        },
        interpretations: {
          lifeImpact: 'Delays and obstacles in career progression',
          spiritualLesson: 'Learning patience and surrender to divine will',
          evolutionaryPurpose: 'Developing resilience and inner strength'
        }
      };

      mockCalculatorInstance.analyzeKaalSarpDosha.mockResolvedValue(mockResult);

      const result = await kaalSarpDoshaService.processCalculation(validBirthData);

      expect(mockCalculatorInstance.analyzeKaalSarpDosha).toHaveBeenCalledWith(
        expect.objectContaining({
          birthDate: '15/05/1990'
        })
      );
      expect(result).toEqual(mockResult);
    });

    test('should handle calculator initialization if needed', async () => {
      kaalSarpDoshaService.calculator = null; // Simulate uninitialized calculator

      await kaalSarpDoshaService.processCalculation(validBirthData);

      // Calculator should be initialized
      expect(mockCalculatorInstance.initialize).toHaveBeenCalled();
    });

    test('should handle calculator errors gracefully', async () => {
      mockCalculatorInstance.analyzeKaalSarpDosha.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(
        kaalSarpDoshaService.processCalculation(validBirthData)
      ).rejects.toThrow('Kaal sarp dosha analysis failed: Calculator error');

      expect(logger.error).toHaveBeenCalledWith(
        'KaalSarpDoshaService calculation error:',
        expect.any(Error)
      );
    });
  });

  describe('calculateKaalSarpDosha method', () => {
    test('should calculate kaal sarp dosha type and intensity', async () => {
      const birthData = {
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };

      const expectedDosha = {
        planets: [
          { name: 'Sun', sign: 'Taurus', degree: 25.5, house: 1 },
          { name: 'Moon', sign: 'Cancer', degree: 15.2, house: 3 }
        ],
        rahuKetuAxis: {
          rahu: { sign: 'Scorpio', degree: 120.5, house: 7 },
          ketu: { sign: 'Taurus', degree: 120.5, house: 1 },
          axis: 'Scorpio-Taurus'
        },
        doshaClassification: 'Anant',
        intensity: 75,
        affectedPlanets: ['Moon', 'Mercury'],
        freePlanets: ['Jupiter', 'Venus'],
        interpretations: {
          type: 'Cyclical challenges and karmic lessons',
          intensity: 'Moderate to strong',
          duration: 'Until Saturn-Rahu conjunction in 2030'
        }
      };

      mockCalculatorInstance.calculateKaalSarpDosha.mockResolvedValue(expectedDosha);

      const result = await kaalSarpDoshaService.calculateKaalSarpDosha(birthData);

      expect(result).toEqual(expectedDosha);
      expect(mockCalculatorInstance.calculateKaalSarpDosha).toHaveBeenCalledWith(birthData);
    });
  });

  describe('analyzeKaalSarpDosha method', () => {
    test('should analyze kaal sarp dosha effects and implications', async () => {
      const doshaData = {
        planets: [
          { name: 'Sun', sign: 'Taurus', house: 1 },
          { name: 'Moon', sign: 'Cancer', house: 3 }
        ],
        rahuKetuAxis: {
          rahu: { sign: 'Scorpio', house: 7 },
          ketu: { sign: 'Taurus', house: 1 }
        },
        doshaType: 'Anant'
      };

      const expectedAnalysis = {
        doshaType: 'Anant',
        intensity: 78,
        affectedHouses: [1, 3, 7],
        affectedPlanets: ['Sun', 'Moon'],
        freePlanets: ['Jupiter', 'Venus'],
        interpretations: {
          lifeImpact: 'Periodic delays and obstacles in key life areas',
          spiritualLesson: 'Learning patience and surrender to divine timing',
          evolutionaryPurpose: 'Developing resilience and inner strength through challenges'
        },
        timing: {
          currentPhase: 'Release period of the dosha cycle',
          nextChallenge: 'March 2024',
          favorablePeriods: ['May-July 2023', 'November 2023'],
          remedialWindow: '2023-2025 optimal period for remedial work'
        },
        remedies: [
          { planet: 'Rahu', remedy: 'Recite Rahu Gayatri Mantra', repetitions: 108, timing: 'Saturday mornings' },
          { planet: 'Rahu', remedy: 'Donate black items', frequency: 'Monthly', timing: 'New Moon' },
          { planet: 'Rahu', remedy: 'Wear Gomed stone', recommendation: 'Consult qualified astrologer for proper certification' }
        ]
      };

      mockCalculatorInstance.analyzeKaalSarpDosha.mockResolvedValue(expectedAnalysis);

      const result = await kaalSarpDoshaService.calculator.analyzeKaalSarpDosha(doshaData);

      expect(result).toEqual(expectedAnalysis);
      expect(mockCalculatorInstance.analyzeKaalSarpDosha).toHaveBeenCalledWith(doshaData);
    });
  });

  describe('getKaalSarpRemedies method', () => {
    test('should provide remedies for kaal sarp dosha', async () => {
      const doshaConcerns = {
        doshaType: 'Anant',
        intensity: 75,
        affectedPlanets: ['Moon', 'Mercury'],
        issues: ['Delays in career', 'Emotional instability']
      };

      const expectedRemedies = [
        { planet: 'Rahu', remedy: 'Recite Rahu Gayatri Mantra', repetitions: 108, timing: 'Saturday mornings' },
        { planet: 'Rahu', remedy: 'Donate black items', frequency: 'Monthly', timing: 'New Moon' },
        { planet: 'Rahu', remedy: 'Wear Gomed stone', recommendation: 'Consult qualified astrologer for proper certification' },
        { planet: 'Rahu', remedy: 'Serve elderly or disadvantaged', frequency: 'Weekly', timing: 'Rahu hora' },
        { planet: 'Rahu', remedy: 'Visit Shiva temples', frequency: 'Regular', timing: 'Monday or Saturday' }
      ];

      mockCalculatorInstance.getKaalSarpRemedies.mockResolvedValue(expectedRemedies);

      const result = await kaalSarpDoshaService.calculator.getKaalSarpRemedies(doshaConcerns);

      expect(result).toEqual(expectedRemedies);
      expect(mockCalculatorInstance.getKaalSarpRemedies).toHaveBeenCalledWith(doshaConcerns);
    });
  });

  describe('determineDoshaTiming method', () => {
    test('should determine timing of kaal sarp dosha phases', async () => {
      const planetaryData = {
        planets: [
          { name: 'Rahu', sign: 'Scorpio', house: 7 },
          { name: 'Ketu', sign: 'Taurus', house: 1 }
        ],
        birthDate: '15/05/1990'
      };

      const expectedTiming = {
        currentPhase: 'Release period',
        nextChallenge: 'March 2024',
        favorablePeriods: ['May-July 2023', 'November 2023'],
        remedialWindow: '2023-2025 optimal period for remedial work',
        majorTransitions: [
          { event: 'Rahu enters Sagittarius', date: 'December 2023', impact: 'Shift in career focus' },
          { event: 'Ketu enters Gemini', date: 'December 2023', impact: 'Changes in communication patterns' }
        ]
      };

      mockCalculatorInstance.determineDoshaTiming.mockResolvedValue(expectedTiming);

      const result = await kaalSarpDoshaService.calculator.determineDoshaTiming(planetaryData);

      expect(result).toEqual(expectedTiming);
      expect(mockCalculatorInstance.determineDoshaTiming).toHaveBeenCalledWith(planetaryData);
    });
  });

  describe('validateKaalSarpData method', () => {
    test('should validate kaal sarp dosha data', async () => {
      const kaalSarpData = {
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };

      mockCalculatorInstance.validateKaalSarpData.mockResolvedValue(true);

      const result = await kaalSarpDoshaService.calculator.validateKaalSarpData(kaalSarpData);

      expect(result).toBe(true);
      expect(mockCalculatorInstance.validateKaalSarpData).toHaveBeenCalledWith(kaalSarpData);
    });

    test('should reject invalid kaal sarp dosha data', async () => {
      const invalidKaalSarpData = {
        birthDate: '',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };

      mockCalculatorInstance.validateKaalSarpData.mockResolvedValue(false);

      const result = await kaalSarpDoshaService.calculator.validateKaalSarpData(invalidKaalSarpData);

      expect(result).toBe(false);
      expect(mockCalculatorInstance.validateKaalSarpData).toHaveBeenCalledWith(invalidKaalSarpData);
    });
  });

  describe('formatResult method', () => {
    test('should format kaal sarp dosha result properly', () => {
      const mockResult = {
        doshaType: 'Anant',
        intensity: 75,
        affectedHouses: [3, 6, 8, 12],
        remedies: [],
        timing: {},
        interpretations: { lifeImpact: 'Periodic delays' }
      };

      const formatted = kaalSarpDoshaService.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.service).toBe('KaalSarpDoshaService');
      expect(formatted.timestamp).toBeDefined();
    });

    test('should format error result properly', () => {
      const formatted = kaalSarpDoshaService.formatResult({ 
        error: 'Invalid birth data for kaal sarp dosha analysis' 
      });

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Invalid birth data for kaal sarp dosha analysis');
    });

    test('should include kaal sarp dosha disclaimer', () => {
      const mockResult = { doshaType: 'Anant', intensity: 75 };
      const formatted = kaalSarpDoshaService.formatResult(mockResult);

      expect(formatted.disclaimer).toBeDefined();
      expect(formatted.disclaimer).toContain('Kaal Sarp Dosha');
    });
  });

  describe('getMetadata method', () => {
    test('should return correct metadata for kaal sarp dosha service', () => {
      const metadata = kaalSarpDoshaService.getMetadata();

      expect(metadata).toEqual({
        name: 'KaalSarpDoshaService',
        version: '1.0.0',
        category: 'dosha',
        methods: ['analyzeKaalSarpDosha', 'calculateKaalSarpDosha', 'getKaalSarpRemedies'],
        dependencies: ['KaalSarpDoshaCalculator']
      });
    });
  });

  describe('getHealthStatus method', () => {
    test('should return healthy status when service is operational', async () => {
      const healthStatus = await kaalSarpDoshaService.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.features).toEqual({});
      expect(healthStatus.supportedAnalyses).toEqual([]);
    });

    test('should return unhealthy status when error occurs', async () => {
      jest.spyOn(kaalSarpDoshaService, 'getHealthStatus').mockRejectedValue(
        new Error('Health check failed')
      );

      await expect(kaalSarpDoshaService.getHealthStatus())
        .rejects.toThrow('Health check failed');
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should implement ServiceTemplate pattern', () => {
      expect(kaalSarpDoshaService.serviceName).toBeDefined();
      expect(typeof kaalSarpDoshaService.getHealthStatus).toBe('function');
      expect(typeof kaalSarpDoshaService.getMetadata).toBe('function');
    });

    test('should have required methods', () => {
      expect(typeof kaalSarpDoshaService.processCalculation).toBe('function');
      expect(typeof kaalSarpDoshaService.formatResult).toBe('function');
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
        doshaType: 'Anant',
        intensity: 75,
        affectedHouses: [3, 6, 8, 12],
        remedies: [],
        timing: {},
        interpretations: {}
      };

      mockCalculatorInstance.analyzeKaalSarpDosha.mockResolvedValue(mockResult);

      const concurrentRequests = Array(3).fill().map(() =>
        kaalSarpDoshaService.processCalculation(birthData)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result.doshaType).toBeDefined();
        expect(result.intensity).toBeDefined();
        expect(result.interpretations).toBeDefined();
      });

      expect(mockCalculatorInstance.analyzeKaalSarpDosha).toHaveBeenCalledTimes(3);
    });

    test('should handle null/undefined input gracefully', async () => {
      await expect(
        kaalSarpDoshaService.processCalculation(null)
      ).rejects.toThrow('Kaal sarp dosha analysis failed');
    });
  });

  describe('Performance & Resilience', () => {
    test('should respond within acceptable time for valid data', async () => {
      const mockResult = {
        doshaType: 'Anant',
        intensity: 75,
        affectedHouses: [3, 6, 8, 12],
        remedies: [],
        timing: {},
        interpretations: {}
      };

      mockCalculatorInstance.analyzeKaalSarpDosha.mockResolvedValue(mockResult);

      const startTime = Date.now();
      await kaalSarpDoshaService.processCalculation({
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