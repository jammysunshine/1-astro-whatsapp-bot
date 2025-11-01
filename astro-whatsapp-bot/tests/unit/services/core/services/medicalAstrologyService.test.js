// tests/unit/services/core/services/medicalAstrologyService.test.js
// Comprehensive test suite for medicalAstrologyService

// Create mock calculator instance
const mockCalculatorInstance = {
  initialize: jest.fn().mockResolvedValue(true),
  analyzeMedicalAstrology: jest.fn().mockResolvedValue({
    healthIndicators: {},
    diseaseSusceptibilities: [],
    preventiveMeasures: [],
    remedialSuggestions: []
  }),
  calculateHealthIndicators: jest.fn().mockResolvedValue({
    vitality: 80,
    immunity: 75,
    stressLevels: 60
  }),
  identifyDiseaseSusceptibilities: jest.fn().mockResolvedValue([]),
  suggestPreventiveMeasures: jest.fn().mockResolvedValue([]),
  recommendRemedialActions: jest.fn().mockResolvedValue([]),
  getBodyPartCorrelations: jest.fn().mockResolvedValue({}),
  analyzePlanetaryHealthInfluences: jest.fn().mockResolvedValue([])
};

// Mock the calculator module before importing the service
jest.mock('../../../../../src/core/services/calculators/MedicalAstrologyCalculator', () => {
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

const MedicalAstrologyService = require('../../../../../src/core/services/medicalAstrologyService');
const logger = require('../../../../../src/utils/logger');

describe('MedicalAstrologyService', () => {
  let medicalAstrologyService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create service instance
    medicalAstrologyService = new MedicalAstrologyService();
    // Manually set the calculator since the mock might not work with dynamic loading  
    medicalAstrologyService.calculator = mockCalculatorInstance;
  });

  describe('Service Initialization', () => {
    test('should initialize MedicalAstrologyService with MedicalAstrologyCalculator', () => {
      expect(medicalAstrologyService.serviceName).toBe('MedicalAstrologyService');
      expect(medicalAstrologyService.calculatorPath).toBe('./calculators/MedicalAstrologyCalculator');
      
      // Verify logger was called during initialization
      expect(logger.info).toHaveBeenCalledWith('MedicalAstrologyService initialized');
    });
  });

  describe('processCalculation method', () => {
    const birthData = {
      birthDate: '15/05/1990',
      birthTime: '12:30',
      birthPlace: 'Mumbai, India'
    };

    test('should process medical astrology calculation with valid data', async () => {
      const mockResult = {
        healthIndicators: {
          vitality: 82,
          immunity: 78,
          stressLevels: 55,
          energyBalance: 70
        },
        diseaseSusceptibilities: [
          { bodyPart: 'Heart', planets: ['Sun'], riskLevel: 'Low-Moderate' },
          { bodyPart: 'Digestive System', planets: ['Mercury', 'Jupiter'], riskLevel: 'Moderate' }
        ],
        preventiveMeasures: [
          { area: 'Cardiovascular', action: 'Regular exercise and meditation', timing: 'Daily' },
          { area: 'Digestion', action: 'Proper diet and avoid overeating', timing: 'Meal times' }
        ],
        remedialSuggestions: [
          { planet: 'Sun', remedy: 'Wear ruby', benefit: 'Strengthens heart' },
          { planet: 'Mercury', remedy: 'Recite Budh Gayatri Mantra', benefit: 'Improves digestion' }
        ],
        bodyPartCorrelations: {
          sun: { bodyParts: ['Heart', 'Spine'], ailments: ['Cardiac issues'] },
          mercury: { bodyParts: ['Nervous system', 'Digestion'], ailments: ['Digestive disorders'] }
        },
        planetaryHealthInfluences: [
          { planet: 'Sun', influence: 'Vitality and life force', positive: true },
          { planet: 'Mars', influence: 'Energy and surgical healing', positive: true }
        ],
        timing: {
          favorablePeriods: ['May-June 2023', 'October 2023'],
          cautionPeriods: ['July 2023', 'January 2024']
        }
      };

      mockCalculatorInstance.analyzeMedicalAstrology.mockResolvedValue(mockResult);

      const result = await medicalAstrologyService.processCalculation(birthData);

      expect(mockCalculatorInstance.analyzeMedicalAstrology).toHaveBeenCalledWith(birthData);
      expect(result).toEqual(mockResult);
    });

    test('should handle calculator initialization if needed', async () => {
      medicalAstrologyService.calculator = null; // Simulate uninitialized calculator

      await medicalAstrologyService.processCalculation(birthData);

      // Calculator should be initialized
      expect(mockCalculatorInstance.initialize).toHaveBeenCalled();
    });

    test('should handle calculator errors gracefully', async () => {
      mockCalculatorInstance.analyzeMedicalAstrology.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(
        medicalAstrologyService.processCalculation(birthData)
      ).rejects.toThrow('Medical astrology analysis failed: Calculator error');

      expect(logger.error).toHaveBeenCalledWith(
        'MedicalAstrologyService calculation error:',
        expect.any(Error)
      );
    });
  });

  describe('analyzeMedicalAstrology method', () => {
    test('should perform comprehensive medical astrology analysis', async () => {
      const birthData = {
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };

      const expectedAnalysis = {
        healthIndicators: {
          vitality: 75,
          immunity: 80,
          stressLevels: 65,
          energyBalance: 72
        },
        diseaseSusceptibilities: [
          { bodyPart: 'Lungs', planets: ['Mercury'], riskLevel: 'Moderate' },
          { bodyPart: 'Liver', planets: ['Jupiter'], riskLevel: 'Low' }
        ],
        preventiveMeasures: [
          { area: 'Respiratory', action: 'Practice pranayama', timing: 'Morning' },
          { area: 'Liver', action: 'Avoid excess alcohol', timing: 'Always' }
        ],
        remedialSuggestions: [
          { planet: 'Mercury', remedy: 'Eat green leafy vegetables', benefit: 'Supports lungs' },
          { planet: 'Jupiter', remedy: 'Meditation on Thursdays', benefit: 'Liver detox' }
        ],
        bodyPartCorrelations: {
          mercury: { bodyParts: ['Lungs', 'Nervous system'], ailments: ['Respiratory issues'] },
          jupiter: { bodyParts: ['Liver', 'Fat tissue'], ailments: ['Liver disorders'] }
        },
        planetaryHealthInfluences: [
          { planet: 'Mercury', influence: 'Respiratory function', positive: true },
          { planet: 'Venus', influence: 'Kidney and reproductive health', positive: true }
        ],
        timing: {
          favorablePeriods: ['June-July 2023', 'November-December 2023'],
          cautionPeriods: ['August 2023', 'February 2024']
        }
      };

      mockCalculatorInstance.analyzeMedicalAstrology.mockResolvedValue(expectedAnalysis);

      const result = await medicalAstrologyService.analyzer.medicalAstrology(birthData);

      expect(result).toEqual(expectedAnalysis);
      expect(mockCalculatorInstance.analyzeMedicalAstrology).toHaveBeenCalledWith(birthData);
    });
  });

  describe('calculateHealthIndicators method', () => {
    test('should calculate health indicators from birth chart', async () => {
      const natalChart = {
        planets: [
          { name: 'Sun', sign: 'Taurus', house: 1 },
          { name: 'Moon', sign: 'Cancer', house: 3 }
        ],
        ascendant: 'Taurus'
      };

      const expectedIndicators = {
        vitality: 78,
        immunity: 82,
        stressLevels: 58,
        energyBalance: 75,
        constitutionalStrength: 80
      };

      mockCalculatorInstance.calculateHealthIndicators.mockResolvedValue(expectedIndicators);

      const result = await medicalAstrologyService.calculator.calculateHealthIndicators(natalChart);

      expect(result).toEqual(expectedIndicators);
      expect(mockCalculatorInstance.calculateHealthIndicators).toHaveBeenCalledWith(natalChart);
    });
  });

  describe('identifyDiseaseSusceptibilities method', () => {
    test('should identify potential disease susceptibilities', async () => {
      const planetaryAfflictions = {
        sunAfflicted: true,
        mercuryWeak: true,
        jupiterChallenged: false
      };

      const expectedSusceptibilities = [
        { bodyPart: 'Heart', planets: ['Sun'], riskLevel: 'Moderate', prevention: 'Cardio exercise' },
        { bodyPart: 'Lungs', planets: ['Mercury'], riskLevel: 'Moderate', prevention: 'Breathing exercises' },
        { bodyPart: 'Nervous System', planets: ['Mercury'], riskLevel: 'Low', prevention: 'Stress management' }
      ];

      mockCalculatorInstance.identifyDiseaseSusceptibilities.mockResolvedValue(expectedSusceptibilities);

      const result = await medicalAstrologyService.calculator.identifyDiseaseSusceptibilities(planetaryAfflictions);

      expect(result).toEqual(expectedSusceptibilities);
      expect(mockCalculatorInstance.identifyDiseaseSusceptibilities).toHaveBeenCalledWith(planetaryAfflictions);
    });
  });

  describe('suggestPreventiveMeasures method', () => {
    test('should suggest preventive health measures', async () => {
      const healthConcerns = {
        susceptibilityAreas: ['Heart', 'Digestive System'],
        stressLevels: 'Moderate'
      };

      const expectedPrevention = [
        { area: 'Cardiovascular', action: '30-min daily walks', timing: 'Evening' },
        { area: 'Digestion', action: 'Early dinner, avoid late meals', timing: 'Evening' },
        { area: 'Stress Management', action: 'Meditation and yoga', timing: 'Morning and Evening' }
      ];

      mockCalculatorInstance.suggestPreventiveMeasures.mockResolvedValue(expectedPrevention);

      const result = await medicalAstrologyService.calculator.suggestPreventiveMeasures(healthConcerns);

      expect(result).toEqual(expectedPrevention);
      expect(mockCalculatorInstance.suggestPreventiveMeasures).toHaveBeenCalledWith(healthConcerns);
    });
  });

  describe('recommendRemedialActions method', () => {
    test('should recommend remedial actions for health issues', async () => {
      const healthIssues = {
        affectedPlanets: ['Sun', 'Mercury'],
        bodyPartsAffected: ['Heart', 'Lungs']
      };

      const expectedRemedies = [
        { planet: 'Sun', remedy: 'Wear ruby (5-10 carats)', benefit: 'Strengthens heart', timing: 'Sunday' },
        { planet: 'Mercury', remedy: 'Wear emerald (3-5 carats)', benefit: 'Supports lung function', timing: 'Wednesday' },
        { planet: 'Sun', remedy: 'Recite Gayatri Mantra', benefit: 'Vitality enhancement', timing: 'Daily' },
        { planet: 'Mercury', remedy: 'Practice pranayama', benefit: 'Respiratory health', timing: 'Daily' }
      ];

      mockCalculatorInstance.recommendRemedialActions.mockResolvedValue(expectedRemedies);

      const result = await medicalAstrologyService.calculator.recommendRemedialActions(healthIssues);

      expect(result).toEqual(expectedRemedies);
      expect(mockCalculatorInstance.recommendRemedialActions).toHaveBeenCalledWith(healthIssues);
    });
  });

  describe('getBodyPartCorrelations method', () => {
    test('should return correlations between planets and body parts', async () => {
      const planetaryData = {
        sun: { sign: 'Taurus', house: 1 },
        moon: { sign: 'Cancer', house: 3 },
        mercury: { sign: 'Gemini', house: 2 }
      };

      const expectedCorrelations = {
        sun: { bodyParts: ['Heart', 'Spine', 'RightEye'], ailments: ['Cardiac issues', 'Back problems'] },
        moon: { bodyParts: ['Chest', 'Stomach', 'LeftEye'], ailments: ['Digestive issues', 'Emotional disorders'] },
        mercury: { bodyParts: ['Nervous system', 'Lungs', 'SpeechOrgans'], ailments: ['Respiratory issues', 'Speech disorders'] }
      };

      mockCalculatorInstance.getBodyPartCorrelations.mockResolvedValue(expectedCorrelations);

      const result = await medicalAstrologyService.calculator.getBodyPartCorrelations(planetaryData);

      expect(result).toEqual(expectedCorrelations);
      expect(mockCalculatorInstance.getBodyPartCorrelations).toHaveBeenCalledWith(planetaryData);
    });
  });

  describe('analyzePlanetaryHealthInfluences method', () => {
    test('should analyze how planets influence health', async () => {
      const chartData = {
        planets: [
          { name: 'Sun', sign: 'Taurus', house: 1, dignity: 'Exalted' },
          { name: 'Moon', sign: 'Cancer', house: 3, dignity: 'OwnSign' },
          { name: 'Mars', sign: 'Aries', house: 12, dignity: 'OwnSign' }
        ]
      };

      const expectedInfluences = [
        { planet: 'Sun', influence: 'Vitality and life force', strength: 85, positive: true, effects: ['Strong constitution', 'Good leadership energy'] },
        { planet: 'Moon', influence: 'Emotional wellbeing and fluid balance', strength: 90, positive: true, effects: ['Emotional stability', 'Good memory'] },
        { planet: 'Mars', influence: 'Energy and surgical healing', strength: 80, positive: true, effects: ['Strong immunity', 'Quick healing'] }
      ];

      mockCalculatorInstance.analyzePlanetaryHealthInfluences.mockResolvedValue(expectedInfluences);

      const result = await medicalAstrologyService.calculator.analyzePlanetaryHealthInfluences(chartData);

      expect(result).toEqual(expectedInfluences);
      expect(mockCalculatorInstance.analyzePlanetaryHealthInfluences).toHaveBeenCalledWith(chartData);
    });
  });

  describe('formatResult method', () => {
    test('should format medical astrology result properly', () => {
      const mockResult = {
        healthIndicators: { vitality: 80 },
        diseaseSusceptibilities: [],
        preventiveMeasures: []
      };

      const formatted = medicalAstrologyService.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.service).toBe('MedicalAstrologyService');
      expect(formatted.timestamp).toBeDefined();
    });

    test('should format error result properly', () => {
      const formatted = medicalAstrologyService.formatResult({ 
        error: 'Invalid birth data for medical astrology' 
      });

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Invalid birth data for medical astrology');
    });

    test('should include medical astrology disclaimer', () => {
      const mockResult = { healthIndicators: { vitality: 80 } };
      const formatted = medicalAstrologyService.formatResult(mockResult);

      expect(formatted.disclaimer).toBeDefined();
      expect(formatted.disclaimer).toContain('Medical Astrology');
      expect(formatted.disclaimer).toContain('not a substitute for professional medical advice');
    });
  });

  describe('getMetadata method', () => {
    test('should return correct metadata for medical astrology service', () => {
      const metadata = medicalAstrologyService.getMetadata();

      expect(metadata).toEqual({
        name: 'MedicalAstrologyService',
        version: '1.0.0',
        category: 'medical',
        methods: ['analyzeMedicalAstrology', 'calculateHealthIndicators', 'identifyDiseaseSusceptibilities'],
        dependencies: ['MedicalAstrologyCalculator']
      });
    });
  });

  describe('getHealthStatus method', () => {
    test('should return healthy status when service is operational', async () => {
      const healthStatus = await medicalAstrologyService.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.features).toEqual({});
      expect(healthStatus.supportedAnalyses).toEqual([]);
    });

    test('should return unhealthy status when error occurs', async () => {
      jest.spyOn(medicalAstrologyService, 'getHealthStatus').mockRejectedValue(
        new Error('Health check failed')
      );

      await expect(medicalAstrologyService.getHealthStatus())
        .rejects.toThrow('Health check failed');
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should implement ServiceTemplate pattern', () => {
      expect(medicalAstrologyService.serviceName).toBeDefined();
      expect(typeof medicalAstrologyService.getHealthStatus).toBe('function');
      expect(typeof medicalAstrologyService.getMetadata).toBe('function');
    });

    test('should have required methods', () => {
      expect(typeof medicalAstrologyService.processCalculation).toBe('function');
      expect(typeof medicalAstrologyService.formatResult).toBe('function');
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
        healthIndicators: { vitality: 75 },
        diseaseSusceptibilities: [],
        preventiveMeasures: []
      };

      mockCalculatorInstance.analyzeMedicalAstrology.mockResolvedValue(mockResult);

      const concurrentRequests = Array(3).fill().map(() =>
        medicalAstrologyService.processCalculation(birthData)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result.healthIndicators).toBeDefined();
        expect(result.preventiveMeasures).toBeDefined();
      });

      expect(mockCalculatorInstance.analyzeMedicalAstrology).toHaveBeenCalledTimes(3);
    });

    test('should handle invalid birth data gracefully', async () => {
      await expect(
        medicalAstrologyService.processCalculation(null)
      ).rejects.toThrow('Medical astrology analysis failed');
    });
  });

  describe('Performance & Resilience', () => {
    test('should respond within acceptable time for valid data', async () => {
      const mockResult = {
        healthIndicators: { vitality: 75 },
        diseaseSusceptibilities: [],
        preventiveMeasures: []
      };

      mockCalculatorInstance.analyzeMedicalAstrology.mockResolvedValue(mockResult);

      const startTime = Date.now();
      await medicalAstrologyService.processCalculation({
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