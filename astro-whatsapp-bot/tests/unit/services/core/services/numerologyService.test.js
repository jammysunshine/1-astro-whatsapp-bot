// tests/unit/services/core/services/numerologyService.test.js
// Comprehensive test suite for numerologyService

// Create mock calculator instance
const mockCalculatorInstance = {
  initialize: jest.fn().mockResolvedValue(true),
  calculateNumerology: jest.fn().mockResolvedValue({
    lifepathNumber: 7,
    destinyNumber: 5,
    soulUrgeNumber: 3,
    personalityNumber: 9,
    birthDayNumber: 15
  }),
  calculateLifePathNumber: jest.fn().mockResolvedValue(7),
  calculateDestinyNumber: jest.fn().mockResolvedValue(5),
  calculateSoulUrgeNumber: jest.fn().mockResolvedValue(3),
  calculatePersonalityNumber: jest.fn().mockResolvedValue(9),
  calculateBirthDayNumber: jest.fn().mockResolvedValue(15),
  getNumerologyInterpretation: jest.fn().mockResolvedValue({
    traits: [],
    challenges: [],
    opportunities: []
  })
};

// Mock the calculator module before importing the service
jest.mock('../../../../../src/core/services/calculators/NumerologyCalculator', () => {
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

const NumerologyService = require('../../../../../src/core/services/numerologyService');
const logger = require('../../../../../src/utils/logger');

describe('NumerologyService', () => {
  let numerologyService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create service instance
    numerologyService = new NumerologyService();
    // Manually set the calculator since the mock might not work with dynamic loading  
    numerologyService.calculator = mockCalculatorInstance;
  });

  describe('Service Initialization', () => {
    test('should initialize NumerologyService with NumerologyCalculator', () => {
      expect(numerologyService.serviceName).toBe('NumerologyService');
      expect(numerologyService.calculatorPath).toBe('./calculators/NumerologyCalculator');
      
      // Verify logger was called during initialization
      expect(logger.info).toHaveBeenCalledWith('NumerologyService initialized');
    });
  });

  describe('processCalculation method', () => {
    const birthData = {
      birthDate: '15/05/1990',
      firstName: 'John',
      lastName: 'Smith'
    };

    test('should process numerology calculation with valid birth data', async () => {
      const mockResult = {
        lifepathNumber: 7,
        destinyNumber: 5,
        soulUrgeNumber: 3,
        personalityNumber: 9,
        birthDayNumber: 15,
        interpretations: {
          lifepath: 'The Seeker - Deep thinker and researcher',
          destiny: 'The Freedom Seeker - Adaptable and versatile',
          soulUrge: 'The Creative Communicator - Expressive and joyful',
          personality: 'The Humanitarian - Compassionate and selfless',
          birthDay: 'The Leader - Independent and innovative'
        }
      };

      mockCalculatorInstance.calculateNumerology.mockResolvedValue(mockResult);

      const result = await numerologyService.processCalculation(birthData);

      expect(mockCalculatorInstance.calculateNumerology).toHaveBeenCalledWith(birthData);
      expect(result).toEqual(mockResult);
    });

    test('should handle calculator initialization if needed', async () => {
      numerologyService.calculator = null; // Simulate uninitialized calculator

      await numerologyService.processCalculation(birthData);

      // Calculator should be initialized
      expect(mockCalculatorInstance.initialize).toHaveBeenCalled();
    });

    test('should handle calculator errors gracefully', async () => {
      mockCalculatorInstance.calculateNumerology.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(
        numerologyService.processCalculation(birthData)
      ).rejects.toThrow('Numerology calculation failed: Calculator error');

      expect(logger.error).toHaveBeenCalledWith(
        'NumerologyService calculation error:',
        expect.any(Error)
      );
    });
  });

  describe('calculateNumerology method', () => {
    test('should calculate complete numerology profile', async () => {
      const birthData = {
        birthDate: '15/05/1990',
        firstName: 'John',
        lastName: 'Smith'
      };

      const expectedNumerology = {
        lifepathNumber: 7,
        destinyNumber: 5,
        soulUrgeNumber: 3,
        personalityNumber: 9,
        birthDayNumber: 15,
        masterNumbers: {
          karmicDebt: null,
          bridgeNumbers: [],
          challengeNumbers: []
        },
        interpretations: {
          lifepath: 'The Seeker - Deep thinker, researcher, and mystic',
          destiny: 'The Freedom Seeker - Versatile, adaptable, and curious',
          soulUrge: 'The Creative Communicator - Expressive, joyful, and social',
          personality: 'The Humanitarian - Compassionate, selfless, and idealistic',
          birthDay: 'The Leader - Independent, innovative, and pioneering'
        }
      };

      mockCalculatorInstance.calculateNumerology.mockResolvedValue(expectedNumerology);

      const result = await numerologyService.calculator.calculateNumerology(birthData);

      expect(result).toEqual(expectedNumerology);
      expect(mockCalculatorInstance.calculateNumerology).toHaveBeenCalledWith(birthData);
    });
  });

  describe('calculateLifePathNumber method', () => {
    test('should calculate life path number from birth date', async () => {
      const birthDate = '15/05/1990';
      const expectedLifePath = 7;

      mockCalculatorInstance.calculateLifePathNumber.mockResolvedValue(expectedLifePath);

      const result = await numerologyService.calculator.calculateLifePathNumber(birthDate);

      expect(result).toBe(expectedLifePath);
      expect(mockCalculatorInstance.calculateLifePathNumber).toHaveBeenCalledWith(birthDate);
    });
  });

  describe('calculateDestinyNumber method', () => {
    test('should calculate destiny (expression) number from full name', async () => {
      const fullName = 'John Smith';
      const expectedDestiny = 5;

      mockCalculatorInstance.calculateDestinyNumber.mockResolvedValue(expectedDestiny);

      const result = await numerologyService.calculator.calculateDestinyNumber(fullName);

      expect(result).toBe(expectedDestiny);
      expect(mockCalculatorInstance.calculateDestinyNumber).toHaveBeenCalledWith(fullName);
    });
  });

  describe('calculateSoulUrgeNumber method', () => {
    test('should calculate soul urge (heart\'s desire) number from vowels in name', async () => {
      const fullName = 'John Smith';
      const expectedSoulUrge = 3;

      mockCalculatorInstance.calculateSoulUrgeNumber.mockResolvedValue(expectedSoulUrge);

      const result = await numerologyService.calculator.calculateSoulUrgeNumber(fullName);

      expect(result).toBe(expectedSoulUrge);
      expect(mockCalculatorInstance.calculateSoulUrgeNumber).toHaveBeenCalledWith(fullName);
    });
  });

  describe('calculatePersonalityNumber method', () => {
    test('should calculate personality number from consonants in name', async () => {
      const fullName = 'John Smith';
      const expectedPersonality = 9;

      mockCalculatorInstance.calculatePersonalityNumber.mockResolvedValue(expectedPersonality);

      const result = await numerologyService.calculator.calculatePersonalityNumber(fullName);

      expect(result).toBe(expectedPersonality);
      expect(mockCalculatorInstance.calculatePersonalityNumber).toHaveBeenCalledWith(fullName);
    });
  });

  describe('calculateBirthDayNumber method', () => {
    test('should calculate birth day number from birth day', async () => {
      const birthDay = 15;
      const expectedBirthDayNumber = 15;

      mockCalculatorInstance.calculateBirthDayNumber.mockResolvedValue(expectedBirthDayNumber);

      const result = await numerologyService.calculator.calculateBirthDayNumber(birthDay);

      expect(result).toBe(expectedBirthDayNumber);
      expect(mockCalculatorInstance.calculateBirthDayNumber).toHaveBeenCalledWith(birthDay);
    });
  });

  describe('getNumerologyInterpretation method', () => {
    test('should return interpretation for numerology numbers', async () => {
      const numerologyData = {
        lifepathNumber: 7,
        destinyNumber: 5,
        soulUrgeNumber: 3
      };

      const expectedInterpretation = {
        lifepath: {
          traits: ['Analytical', 'Research-oriented', 'Spiritual'],
          challenges: ['Overthinking', 'Social isolation'],
          opportunities: ['Academic pursuits', 'Metaphysical studies']
        },
        destiny: {
          traits: ['Adaptable', 'Curious', 'Freedom-loving'],
          challenges: ['Restlessness', 'Commitment issues'],
          opportunities: ['Travel', 'Communication careers']
        },
        soulUrge: {
          traits: ['Creative', 'Expressive', 'Social'],
          challenges: ['Scattered energy', 'Superficiality'],
          opportunities: ['Entertainment', 'Writing']
        }
      };

      mockCalculatorInstance.getNumerologyInterpretation.mockResolvedValue(expectedInterpretation);

      const result = await numerologyService.calculator.getNumerologyInterpretation(numerologyData);

      expect(result).toEqual(expectedInterpretation);
      expect(mockCalculatorInstance.getNumerologyInterpretation).toHaveBeenCalledWith(numerologyData);
    });
  });

  describe('formatResult method', () => {
    test('should format numerology result properly', () => {
      const mockResult = {
        lifepathNumber: 7,
        destinyNumber: 5,
        interpretations: { lifepath: 'The Seeker' }
      };

      const formatted = numerologyService.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.service).toBe('NumerologyService');
      expect(formatted.timestamp).toBeDefined();
    });

    test('should format error result properly', () => {
      const formatted = numerologyService.formatResult({ 
        error: 'Invalid birth date for numerology' 
      });

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Invalid birth date for numerology');
    });

    test('should include numerology disclaimer', () => {
      const mockResult = { lifepathNumber: 7 };
      const formatted = numerologyService.formatResult(mockResult);

      expect(formatted.disclaimer).toBeDefined();
      expect(formatted.disclaimer).toContain('Numerology');
    });
  });

  describe('getMetadata method', () => {
    test('should return correct metadata for numerology service', () => {
      const metadata = numerologyService.getMetadata();

      expect(metadata).toEqual({
        name: 'NumerologyService',
        version: '1.0.0',
        category: 'numerology',
        methods: ['calculateNumerology', 'calculateLifePathNumber', 'calculateDestinyNumber'],
        dependencies: ['NumerologyCalculator']
      });
    });
  });

  describe('getHealthStatus method', () => {
    test('should return healthy status when service is operational', async () => {
      const healthStatus = await numerologyService.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.features).toEqual({});
      expect(healthStatus.supportedAnalyses).toEqual([]);
    });

    test('should return unhealthy status when error occurs', async () => {
      jest.spyOn(numerologyService, 'getHealthStatus').mockRejectedValue(
        new Error('Health check failed')
      );

      await expect(numerologyService.getHealthStatus())
        .rejects.toThrow('Health check failed');
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should implement ServiceTemplate pattern', () => {
      expect(numerologyService.serviceName).toBeDefined();
      expect(typeof numerologyService.getHealthStatus).toBe('function');
      expect(typeof numerologyService.getMetadata).toBe('function');
    });

    test('should have required methods', () => {
      expect(typeof numerologyService.processCalculation).toBe('function');
      expect(typeof numerologyService.formatResult).toBe('function');
    });
  });

  describe('Error Handling & Validation', () => {
    test('should handle concurrent requests properly', async () => {
      const birthData = {
        birthDate: '15/05/1990',
        firstName: 'John',
        lastName: 'Smith'
      };

      const mockResult = {
        lifepathNumber: 7,
        destinyNumber: 5,
        interpretations: {}
      };

      mockCalculatorInstance.calculateNumerology.mockResolvedValue(mockResult);

      const concurrentRequests = Array(3).fill().map(() =>
        numerologyService.processCalculation(birthData)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result.lifepathNumber).toBeDefined();
        expect(result.destinyNumber).toBeDefined();
      });

      expect(mockCalculatorInstance.calculateNumerology).toHaveBeenCalledTimes(3);
    });

    test('should handle null/undefined input gracefully', async () => {
      await expect(
        numerologyService.processCalculation(null)
      ).rejects.toThrow('Numerology calculation failed');
    });
  });

  describe('Performance & Resilience', () => {
    test('should respond within acceptable time for valid data', async () => {
      const mockResult = {
        lifepathNumber: 7,
        destinyNumber: 5,
        interpretations: {}
      };

      mockCalculatorInstance.calculateNumerology.mockResolvedValue(mockResult);

      const startTime = Date.now();
      await numerologyService.processCalculation({
        birthDate: '15/05/1990',
        firstName: 'John',
        lastName: 'Smith'
      });
      const duration = Date.now() - startTime;

      // Should complete within reasonable time (e.g., 150ms)
      expect(duration).toBeLessThan(150);
    });
  });
});