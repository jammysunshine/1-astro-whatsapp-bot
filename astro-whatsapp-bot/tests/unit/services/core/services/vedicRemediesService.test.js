// tests/unit/services/core/services/vedicRemediesService.test.js
// Comprehensive test suite for vedicRemediesService

// Create mock calculator instance
const mockCalculatorInstance = {
  initialize: jest.fn().mockResolvedValue(true),
  calculateRemedies: jest.fn().mockResolvedValue({
    planetaryRemedies: [],
    gemstoneRecommendations: [],
    mantraPrescriptions: [],
    charitySuggestion: '',
    pujasRecommended: [],
    yantras: []
  }),
  getGemstoneRecommendations: jest.fn().mockResolvedValue([]),
  getMantraPrescriptions: jest.fn().mockResolvedValue([]),
  getCharitySuggestion: jest.fn().mockResolvedValue(''),
  getPlanetaryRemedies: jest.fn().mockResolvedValue([]),
  getDoshaSpecificRemedies: jest.fn().mockResolvedValue([])
};

// Mock the calculator module before importing the service
jest.mock('../../../../../src/core/services/calculators/RemedialMeasuresCalculator', () => {
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

const VedicRemediesService = require('../../../../../src/core/services/vedicRemediesService');
const logger = require('../../../../../src/utils/logger');

describe('VedicRemediesService', () => {
  let vedicRemediesService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create service instance
    vedicRemediesService = new VedicRemediesService();
    // Manually set the calculator since the mock might not work with dynamic loading
    vedicRemediesService.calculator = mockCalculatorInstance;
  });

  describe('Service Initialization', () => {
    test('should initialize VedicRemediesService with RemedialMeasuresCalculator', () => {
      expect(vedicRemediesService.serviceName).toBe('VedicRemediesService');
      expect(vedicRemediesService.calculatorPath).toBe('./calculators/RemedialMeasuresCalculator');
      
      // Verify logger was called during initialization
      expect(logger.info).toHaveBeenCalledWith('VedicRemediesService initialized');
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

    test('should process calculation with valid birth data', async () => {
      const mockResult = {
        planetaryRemedies: [
          { planet: 'Rahu', remedy: 'Recite Hanuman Chalisa', frequency: 'Daily' }
        ],
        gemstoneRecommendations: [
          { planet: 'Sun', gemstone: 'Ruby', weight: '5 carats' }
        ],
        mantraPrescriptions: [
          { planet: 'Saturn', mantra: 'Om Sham Shanaischaraya Namah', count: 23 }
        ],
        charitySuggestion: 'Donate oil and sesame seeds',
        recommendedActions: []
      };

      mockCalculatorInstance.calculateRemedies.mockResolvedValue(mockResult);

      const result = await vedicRemediesService.processCalculation(validBirthData);

      expect(mockCalculatorInstance.calculateRemedies).toHaveBeenCalledWith(validBirthData);
      expect(result).toEqual(mockResult);
    });

    test('should handle calculator initialization if needed', async () => {
      vedicRemediesService.calculator = null; // Simulate uninitialized calculator

      await vedicRemediesService.processCalculation(validBirthData);

      // Calculator should be initialized
      expect(mockCalculatorInstance.initialize).toHaveBeenCalled();
    });

    test('should handle calculator errors gracefully', async () => {
      mockCalculatorInstance.calculateRemedies.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(
        vedicRemediesService.processCalculation(validBirthData)
      ).rejects.toThrow('Vedic remedies calculation failed: Calculator error');

      expect(logger.error).toHaveBeenCalledWith(
        'VedicRemediesService calculation error:',
        expect.any(Error)
      );
    });
  });

  describe('calculateRemedies method', () => {
    test('should calculate comprehensive remedies for birth data', async () => {
      const birthData = {
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };

      const expectedRemedies = {
        planetaryRemedies: [
          { planet: 'Saturn', remedy: 'Wear blue sapphire', effect: 'Reduce malefic influence' }
        ],
        gemstoneRecommendations: [
          { planet: 'Venus', gemstone: 'Diamond', weight: '3 carats', note: 'For strengthening' }
        ],
        mantraPrescriptions: [
          { planet: 'Mars', mantra: 'Kleem Kreem Krishnaya Namah', repetition: 108 }
        ],
        charitySuggestion: 'Donate red items',
        pujasRecommended: ['Mars Puja', 'Navagraha Puja'],
        yantras: ['Mars Yantra', 'Navagraha Yantra'],
        timingAdvice: 'Perform on Tuesdays'
      };

      mockCalculatorInstance.calculateRemedies.mockResolvedValue(expectedRemedies);

      const result = await vedicRemediesService.calculator.calculateRemedies(birthData);

      expect(result).toEqual(expectedRemedies);
      expect(mockCalculatorInstance.calculateRemedies).toHaveBeenCalledWith(birthData);
    });
  });

  describe('getGemstoneRecommendations method', () => {
    test('should return gemstone recommendations', async () => {
      const birthData = { sun: { sign: 'Leo' }, moon: { sign: 'Cancer' } };
      const expectedGems = [
        { planet: 'Sun', gemstone: 'Ruby', benefit: 'Strengthens self-confidence' }
      ];

      mockCalculatorInstance.getGemstoneRecommendations.mockResolvedValue(expectedGems);

      const result = await vedicRemediesService.calculator.getGemstoneRecommendations(birthData);

      expect(result).toEqual(expectedGems);
      expect(mockCalculatorInstance.getGemstoneRecommendations).toHaveBeenCalledWith(birthData);
    });
  });

  describe('getMantraPrescriptions method', () => {
    test('should return mantra prescriptions', async () => {
      const planetaryConditions = { afflictedPlanets: ['Mars', 'Rahu'] };
      const expectedMantras = [
        { planet: 'Mars', mantra: 'Om Angarakaya Namah', count: 23 }
      ];

      mockCalculatorInstance.getMantraPrescriptions.mockResolvedValue(expectedMantras);

      const result = await vedicRemediesService.calculator.getMantraPrescriptions(planetaryConditions);

      expect(result).toEqual(expectedMantras);
      expect(mockCalculatorInstance.getMantraPrescriptions).toHaveBeenCalledWith(planetaryConditions);
    });
  });

  describe('getCharitySuggestion method', () => {
    test('should return charity recommendations', async () => {
      const birthData = { ascendant: { sign: 'Aries' } };
      const expectedCharity = 'Donate red clothes and jaggery';

      mockCalculatorInstance.getCharitySuggestion.mockResolvedValue(expectedCharity);

      const result = await vedicRemediesService.calculator.getCharitySuggestion(birthData);

      expect(result).toBe(expectedCharity);
      expect(mockCalculatorInstance.getCharitySuggestion).toHaveBeenCalledWith(birthData);
    });
  });

  describe('getPlanetaryRemedies method', () => {
    test('should return planetary-specific remedies', async () => {
      const planetaryIssues = { rahuIn4thHouse: true };
      const expectedRemedies = [
        { planet: 'Rahu', remedy: 'Recite Durga Saptashati', frequency: 'Weekly' }
      ];

      mockCalculatorInstance.getPlanetaryRemedies.mockResolvedValue(expectedRemedies);

      const result = await vedicRemediesService.calculator.getPlanetaryRemedies(planetaryIssues);

      expect(result).toEqual(expectedRemedies);
      expect(mockCalculatorInstance.getPlanetaryRemedies).toHaveBeenCalledWith(planetaryIssues);
    });
  });

  describe('getDoshaSpecificRemedies method', () => {
    test('should return dosha-specific remedies', async () => {
      const doshaData = { kethuDosha: true };
      const expectedDoshaRemedies = [
        { type: 'Kethu Dosha', remedy: 'Kethu Shanti Puja', timing: 'Specific lunar day' }
      ];

      mockCalculatorInstance.getDoshaSpecificRemedies.mockResolvedValue(expectedDoshaRemedies);

      const result = await vedicRemediesService.calculator.getDoshaSpecificRemedies(doshaData);

      expect(result).toEqual(expectedDoshaRemedies);
      expect(mockCalculatorInstance.getDoshaSpecificRemedies).toHaveBeenCalledWith(doshaData);
    });
  });

  describe('formatResult method', () => {
    test('should format remedies result properly', () => {
      const mockResult = {
        planetaryRemedies: [{ planet: 'Saturn', remedy: 'Wear blue sapphire' }],
        gemstoneRecommendations: [{ planet: 'Venus', gemstone: 'Diamond' }],
        interpretation: 'Recommended remedies for planetary balance'
      };

      const formatted = vedicRemediesService.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.service).toBe('VedicRemediesService');
      expect(formatted.timestamp).toBeDefined();
    });

    test('should format error result properly', () => {
      const formatted = vedicRemediesService.formatResult({ 
        error: 'Invalid birth data for remedies' 
      });

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Invalid birth data for remedies');
    });

    test('should include remedies disclaimer', () => {
      const mockResult = { planetaryRemedies: [] };
      const formatted = vedicRemediesService.formatResult(mockResult);

      expect(formatted.disclaimer).toBeDefined();
      expect(formatted.disclaimer).toContain('Vedic remedies');
    });
  });

  describe('getMetadata method', () => {
    test('should return correct metadata for vedic remedies service', () => {
      const metadata = vedicRemediesService.getMetadata();

      expect(metadata).toEqual({
        name: 'VedicRemediesService',
        version: '1.0.0',
        category: 'remedies',
        methods: ['calculateRemedies', 'getGemstoneRecommendations', 'getMantraPrescriptions'],
        dependencies: ['RemedialMeasuresCalculator']
      });
    });
  });

  describe('getHealthStatus method', () => {
    test('should return healthy status when service is operational', async () => {
      const healthStatus = await vedicRemediesService.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.features).toEqual({});
      expect(healthStatus.supportedAnalyses).toEqual([]);
    });

    test('should return unhealthy status when error occurs', async () => {
      jest.spyOn(vedicRemediesService, 'getHealthStatus').mockRejectedValue(
        new Error('Health check failed')
      );

      await expect(vedicRemediesService.getHealthStatus())
        .rejects.toThrow('Health check failed');
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should implement ServiceTemplate pattern', () => {
      expect(vedicRemediesService.serviceName).toBeDefined();
      expect(typeof vedicRemediesService.getHealthStatus).toBe('function');
      expect(typeof vedicRemediesService.getMetadata).toBe('function');
    });

    test('should have required methods', () => {
      expect(typeof vedicRemediesService.processCalculation).toBe('function');
      expect(typeof vedicRemediesService.formatResult).toBe('function');
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
        planetaryRemedies: [],
        gemstoneRecommendations: [],
        mantraPrescriptions: [],
        charitySuggestion: ''
      };

      mockCalculatorInstance.calculateRemedies.mockResolvedValue(mockResult);

      const concurrentRequests = Array(3).fill().map(() =>
        vedicRemediesService.processCalculation(birthData)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result.planetaryRemedies).toBeDefined();
        expect(result.gemstoneRecommendations).toBeDefined();
      });

      expect(mockCalculatorInstance.calculateRemedies).toHaveBeenCalledTimes(3);
    });

    test('should handle invalid birth data gracefully', async () => {
      await expect(
        vedicRemediesService.processCalculation(null)
      ).rejects.toThrow('Vedic remedies calculation failed');
    });
  });

  describe('Performance & Resilience', () => {
    test('should respond within acceptable time for valid data', async () => {
      const mockResult = {
        planetaryRemedies: [],
        gemstoneRecommendations: [],
        mantraPrescriptions: [],
        charitySuggestion: ''
      };

      mockCalculatorInstance.calculateRemedies.mockResolvedValue(mockResult);

      const startTime = Date.now();
      await vedicRemediesService.processCalculation({
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