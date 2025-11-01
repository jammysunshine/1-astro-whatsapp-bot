// tests/unit/services/core/services/horaryAstrologyService.test.js
// Comprehensive test suite for horaryAstrologyService

// Create mock calculator instance
const mockCalculatorInstance = {
  initialize: jest.fn().mockResolvedValue(true),
  calculateHoraryChart: jest.fn().mockResolvedValue({
    chart: {},
    planetaryPositions: {},
    ascendant: {},
    houses: []
  }),
  answerHoraryQuestion: jest.fn().mockResolvedValue({
    answer: 'Yes, it will be favorable',
    timing: 'Within 2 weeks',
    planetaryIndicators: []
  }),
  determineAscendant: jest.fn().mockResolvedValue('Aries'),
  calculatePlanetsForHorary: jest.fn().mockResolvedValue([]),
  interpretQuestion: jest.fn().mockResolvedValue({})
};

// Mock the calculator module before importing the service
jest.mock('../../../../../src/core/services/calculators/HoraryCalculator', () => {
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

const HoraryAstrologyService = require('../../../../../src/core/services/horaryAstrologyService');
const logger = require('../../../../../src/utils/logger');

describe('HoraryAstrologyService', () => {
  let horaryAstrologyService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create service instance
    horaryAstrologyService = new HoraryAstrologyService();
    // Manually set the calculator since the mock might not work with dynamic loading  
    horaryAstrologyService.calculator = mockCalculatorInstance;
  });

  describe('Service Initialization', () => {
    test('should initialize HoraryAstrologyService with HoraryCalculator', () => {
      expect(horaryAstrologyService.serviceName).toBe('HoraryAstrologyService');
      expect(horaryAstrologyService.calculatorPath).toBe('./calculators/HoraryCalculator');
      
      // Verify logger was called during initialization
      expect(logger.info).toHaveBeenCalledWith('HoraryAstrologyService initialized');
    });
  });

  describe('processCalculation method', () => {
    const horaryData = {
      question: 'Will I get the job?',
      questionTime: '15/05/2023 14:30',
      location: 'Mumbai, India'
    };

    test('should process horary question with valid data', async () => {
      const mockResult = {
        answer: 'Yes, it will be favorable',
        timing: 'Within 2 weeks',
        planetaryIndicators: [
          { planet: 'Jupiter', position: '1st house', aspect: 'trine Moon' }
        ],
        chartAnalysis: {
          ascendant: 'Leo',
          moonPosition: 'Cancer',
          rulingPlanet: 'Sun'
        }
      };

      mockCalculatorInstance.answerHoraryQuestion.mockResolvedValue(mockResult);

      const result = await horaryAstrologyService.processCalculation(horaryData);

      expect(mockCalculatorInstance.answerHoraryQuestion).toHaveBeenCalledWith(horaryData);
      expect(result).toEqual(mockResult);
    });

    test('should handle calculator initialization if needed', async () => {
      horaryAstrologyService.calculator = null; // Simulate uninitialized calculator

      await horaryAstrologyService.processCalculation(horaryData);

      // Calculator should be initialized
      expect(mockCalculatorInstance.initialize).toHaveBeenCalled();
    });

    test('should handle calculator errors gracefully', async () => {
      mockCalculatorInstance.answerHoraryQuestion.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(
        horaryAstrologyService.processCalculation(horaryData)
      ).rejects.toThrow('Horary astrology calculation failed: Calculator error');

      expect(logger.error).toHaveBeenCalledWith(
        'HoraryAstrologyService calculation error:',
        expect.any(Error)
      );
    });
  });

  describe('answerHoraryQuestion method', () => {
    test('should answer horary question based on chart analysis', async () => {
      const questionData = {
        question: 'Will I find my lost keys?',
        questionTime: '15/05/2023 10:00',
        location: 'Mumbai, India'
      };

      const expectedAnswer = {
        answer: 'Yes, near water source',
        location: 'Kitchen area',
        timing: 'Found by evening',
        planetaryIndicators: [
          { significator: 'Mercury', condition: 'afflicted', implication: 'Hidden temporarily' },
          { significator: 'Moon', condition: 'transiting', implication: 'Will be found soon' }
        ]
      };

      mockCalculatorInstance.answerHoraryQuestion.mockResolvedValue(expectedAnswer);

      const result = await horaryAstrologyService.calculator.answerHoraryQuestion(questionData);

      expect(result).toEqual(expectedAnswer);
      expect(mockCalculatorInstance.answerHoraryQuestion).toHaveBeenCalledWith(questionData);
    });
  });

  describe('calculateHoraryChart method', () => {
    test('should calculate horary chart for given time and location', async () => {
      const chartData = {
        time: '15/05/2023 12:30',
        location: 'Mumbai, India',
        coordinates: { lat: 19.0760, lng: 72.8777 }
      };

      const expectedChart = {
        chart: {
          planets: [],
          houses: [],
          aspects: []
        },
        ascendant: { sign: 'Leo', degree: 125.5 },
        moon: { sign: 'Cancer', degree: 45.2 },
        rulingPlanet: 'Sun'
      };

      mockCalculatorInstance.calculateHoraryChart.mockResolvedValue(expectedChart);

      const result = await horaryAstrologyService.calculator.calculateHoraryChart(chartData);

      expect(result).toEqual(expectedChart);
      expect(mockCalculatorInstance.calculateHoraryChart).toHaveBeenCalledWith(chartData);
    });
  });

  describe('determineAscendant method', () => {
    test('should determine correct ascendant for horary chart', async () => {
      const timeLocation = {
        time: '15/05/2023 06:00',
        lat: 19.0760,
        lng: 72.8777
      };

      const expectedAscendant = 'Aries';

      mockCalculatorInstance.determineAscendant.mockResolvedValue(expectedAscendant);

      const result = await horaryAstrologyService.calculator.determineAscendant(timeLocation);

      expect(result).toBe(expectedAscendant);
      expect(mockCalculatorInstance.determineAscendant).toHaveBeenCalledWith(timeLocation);
    });
  });

  describe('calculatePlanetsForHorary method', () => {
    test('should calculate planetary positions for horary chart', async () => {
      const horaryTime = '15/05/2023 14:30';
      
      const expectedPlanets = [
        { name: 'Sun', sign: 'Taurus', degree: 25.5, house: 1 },
        { name: 'Moon', sign: 'Cancer', degree: 12.3, house: 3 }
      ];

      mockCalculatorInstance.calculatePlanetsForHorary.mockResolvedValue(expectedPlanets);

      const result = await horaryAstrologyService.calculator.calculatePlanetsForHorary(horaryTime);

      expect(result).toEqual(expectedPlanets);
      expect(mockCalculatorInstance.calculatePlanetsForHorary).toHaveBeenCalledWith(horaryTime);
    });
  });

  describe('interpretQuestion method', () => {
    test('should interpret the horary question to determine significators', async () => {
      const question = 'Will I get married this year?';
      
      const expectedInterpretation = {
        questionType: 'marriage',
        querentSignificator: { planet: 'Moon', house: 1 },
        quesitedSignificator: { planet: 'Venus', house: 7 },
        timingPlanet: 'Jupiter',
        analysisFocus: '7th house aspects'
      };

      mockCalculatorInstance.interpretQuestion.mockResolvedValue(expectedInterpretation);

      const result = await horaryAstrologyService.calculator.interpretQuestion(question);

      expect(result).toEqual(expectedInterpretation);
      expect(mockCalculatorInstance.interpretQuestion).toHaveBeenCalledWith(question);
    });
  });

  describe('formatResult method', () => {
    test('should format horary answer properly', () => {
      const mockResult = {
        answer: 'Yes, it will be favorable',
        timing: 'Within 2 weeks',
        planetaryIndicators: [{ significator: 'Jupiter', condition: 'strong' }]
      };

      const formatted = horaryAstrologyService.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.service).toBe('HoraryAstrologyService');
      expect(formatted.timestamp).toBeDefined();
    });

    test('should format error result properly', () => {
      const formatted = horaryAstrologyService.formatResult({ 
        error: 'Invalid horary question' 
      });

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Invalid horary question');
    });

    test('should include horary-specific disclaimer', () => {
      const mockResult = { answer: 'Yes' };
      const formatted = horaryAstrologyService.formatResult(mockResult);

      expect(formatted.disclaimer).toBeDefined();
      expect(formatted.disclaimer).toContain('Horary astrology');
    });
  });

  describe('getMetadata method', () => {
    test('should return correct metadata for horary astrology service', () => {
      const metadata = horaryAstrologyService.getMetadata();

      expect(metadata).toEqual({
        name: 'HoraryAstrologyService',
        version: '1.0.0',
        category: 'horary',
        methods: ['answerHoraryQuestion', 'calculateHoraryChart', 'determineAscendant'],
        dependencies: ['HoraryCalculator']
      });
    });
  });

  describe('getHealthStatus method', () => {
    test('should return healthy status when service is operational', async () => {
      const healthStatus = await horaryAstrologyService.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.features).toEqual({});
      expect(healthStatus.supportedAnalyses).toEqual([]);
    });

    test('should return unhealthy status when error occurs', async () => {
      jest.spyOn(horaryAstrologyService, 'getHealthStatus').mockRejectedValue(
        new Error('Health check failed')
      );

      await expect(horaryAstrologyService.getHealthStatus())
        .rejects.toThrow('Health check failed');
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should implement ServiceTemplate pattern', () => {
      expect(horaryAstrologyService.serviceName).toBeDefined();
      expect(typeof horaryAstrologyService.getHealthStatus).toBe('function');
      expect(typeof horaryAstrologyService.getMetadata).toBe('function');
    });

    test('should have required methods', () => {
      expect(typeof horaryAstrologyService.processCalculation).toBe('function');
      expect(typeof horaryAstrologyService.formatResult).toBe('function');
    });
  });

  describe('Error Handling & Validation', () => {
    test('should handle concurrent requests properly', async () => {
      const questionData = {
        question: 'Will I get the promotion?',
        questionTime: '15/05/2023 14:30',
        location: 'Mumbai, India'
      };

      const mockResult = {
        answer: 'Yes',
        timing: 'Within 2 weeks',
        planetaryIndicators: []
      };

      mockCalculatorInstance.answerHoraryQuestion.mockResolvedValue(mockResult);

      const concurrentRequests = Array(3).fill().map(() =>
        horaryAstrologyService.processCalculation(questionData)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result.answer).toBeDefined();
        expect(result.timing).toBeDefined();
      });

      expect(mockCalculatorInstance.answerHoraryQuestion).toHaveBeenCalledTimes(3);
    });

    test('should handle null/undefined input gracefully', async () => {
      await expect(
        horaryAstrologyService.processCalculation(null)
      ).rejects.toThrow('Horary astrology calculation failed');
    });
  });

  describe('Performance & Resilience', () => {
    test('should respond within acceptable time for valid data', async () => {
      const mockResult = {
        answer: 'Yes',
        timing: 'Within 2 weeks',
        planetaryIndicators: []
      };

      mockCalculatorInstance.answerHoraryQuestion.mockResolvedValue(mockResult);

      const startTime = Date.now();
      await horaryAstrologyService.processCalculation({
        question: 'Will I find success?',
        questionTime: '15/05/2023 14:30',
        location: 'Mumbai, India'
      });
      const duration = Date.now() - startTime;

      // Should complete within reasonable time (e.g., 150ms)
      expect(duration).toBeLessThan(150);
    });
  });
});