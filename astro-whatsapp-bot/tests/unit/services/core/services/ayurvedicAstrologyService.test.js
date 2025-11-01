// tests/unit/services/core/services/ayurvedicAstrologyService.test.js
const AyurvedicAstrologyService = require('../../../../../src/core/services/ayurvedicAstrologyService');
const logger = require('../../../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Mock the calculator
jest.mock('../../../../../src/core/services/calculators/ChartGenerator', () => ({
  analyzeAyurvedicConstitution: jest.fn(),
  constitutions: {
    vata: { name: 'Vata', traits: 'Creative and flexible' },
    pitta: { name: 'Pitta', traits: 'Intelligent and focused' },
    kapha: { name: 'Kapha', traits: 'Calm and patient' }
  },
  getHealthRecommendations: jest.fn()
}));

let serviceInstance;

beforeEach(async () => {
  jest.clearAllMocks();

  serviceInstance = new AyurvedicAstrologyService();
  await serviceInstance.initialize();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('AyurvedicAstrologyService', () => {
  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(serviceInstance).toBeInstanceOf(AyurvedicAstrologyService);
      expect(serviceInstance.serviceName).toBe('AyurvedicAstrologyService');
      expect(serviceInstance.calculatorPath).toBe('./calculators/ChartGenerator');
    });
  });

  describe('processCalculation', () => {
    const validBirthData = {
      birthDate: '15/06/1990',
      birthTime: '14:30',
      birthPlace: 'New York, USA',
      name: 'John Doe'
    };

    it('should process Ayurvedic constitution analysis successfully', async () => {
      const mockAnalysis = {
        constitutions: {
          primary: 'vata',
          secondary: 'pitta',
          vata: 40,
          pitta: 35,
          kapha: 25
        },
        planetaryHealth: {
          sun: { bodyParts: 'Heart, spine', dosha: 'pitta' },
          moon: { bodyParts: 'Stomach, emotions', dosha: 'kapha' }
        }
      };

      serviceInstance.calculator.analyzeAyurvedicConstitution.mockResolvedValue(mockAnalysis);

      const result = await serviceInstance.processCalculation(validBirthData);

      expect(result.success).toBe(true);
      expect(result.analysis).toEqual(mockAnalysis);
      expect(result.metadata.system).toBe('Ayurvedic Astrology');
      expect(result.metadata.focus).toBe('Holistic health through constitutional awareness');
      expect(serviceInstance.calculator.analyzeAyurvedicConstitution).toHaveBeenCalledWith(validBirthData);
    });

    it('should handle calculator errors', async () => {
      serviceInstance.calculator.analyzeAyurvedicConstitution.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(serviceInstance.processCalculation(validBirthData)).rejects.toThrow(
        'Ayurvedic constitution analysis failed: Calculator error'
      );
    });
  });

  describe('getConstitution', () => {
    const validBirthData = {
      birthDate: '15/06/1990',
      birthTime: '14:30',
      birthPlace: 'New York, USA'
    };

    it('should get constitution analysis successfully', async () => {
      const mockAnalysis = {
        constitutions: {
          primary: 'vata',
          vata: 45,
          pitta: 30,
          kapha: 25
        },
        planetaryHealth: {}
      };

      serviceInstance.calculator.analyzeAyurvedicConstitution.mockResolvedValue(mockAnalysis);

      const result = await serviceInstance.getConstitution(validBirthData);

      expect(result.error).toBe(false);
      expect(result.description).toContain('Your primary constitution is **Vata**');
      expect(result.description).toContain('Creative and flexible');
      expect(result.doshaBreakdown).toContain('Vata: 45%');
      expect(result.doshaBreakdown).toContain('Pitta: 30%');
      expect(result.doshaBreakdown).toContain('Kapha: 25%');
    });

    it('should handle missing birth data', async () => {
      await expect(serviceInstance.getConstitution(null)).rejects.toThrow(
        'Birth data is required'
      );
    });

    it('should handle calculator errors', async () => {
      serviceInstance.calculator.analyzeAyurvedicConstitution.mockRejectedValue(
        new Error('Analysis failed')
      );

      const result = await serviceInstance.getConstitution(validBirthData);

      expect(result.error).toBe(true);
      expect(result.message).toBe('Unable to determine Ayurvedic constitution');
    });
  });

  describe('getRecommendations', () => {
    const validBirthData = {
      birthDate: '15/06/1990',
      birthTime: '14:30',
      birthPlace: 'New York, USA'
    };

    it('should get health recommendations successfully', async () => {
      const mockAnalysis = {
        constitutions: { primary: 'vata' },
        planetaryHealth: {}
      };

      const mockRecommendations = {
        health: ['Stay warm', 'Maintain routine'],
        diet: ['Warm soups', 'Cooked vegetables'],
        lifestyle: ['Regular exercise', 'Adequate rest']
      };

      serviceInstance.calculator.analyzeAyurvedicConstitution.mockResolvedValue(mockAnalysis);
      serviceInstance.calculator.getHealthRecommendations.mockReturnValue(mockRecommendations);

      const result = await serviceInstance.getRecommendations(validBirthData);

      expect(result.error).toBe(false);
      expect(result.health).toContain('Stay warm');
      expect(result.diet).toContain('Warm soups');
      expect(result.lifestyle).toContain('Regular exercise');
    });

    it('should handle calculator errors', async () => {
      serviceInstance.calculator.analyzeAyurvedicConstitution.mockRejectedValue(
        new Error('Recommendations failed')
      );

      const result = await serviceInstance.getRecommendations(validBirthData);

      expect(result.error).toBe(true);
      expect(result.message).toBe('Unable to generate health recommendations');
    });
  });

  describe('validate', () => {
    it('should validate correct birth data', () => {
      const validData = {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'New York'
      };

      expect(serviceInstance.validate(validData)).toBe(true);
    });

    it('should throw error for missing birth data', () => {
      expect(() => serviceInstance.validate(null)).toThrow('Birth data is required');
    });

    it('should throw error for missing required fields', () => {
      expect(() => serviceInstance.validate({ birthDate: '15/06/1990' })).toThrow(
        'birthTime is required'
      );
      expect(() => serviceInstance.validate({
        birthDate: '15/06/1990',
        birthTime: '14:30'
      })).toThrow('birthPlace is required');
    });
  });

  describe('formatResult', () => {
    it('should format result with success structure', () => {
      const mockResult = {
        constitutions: { primary: 'vata' },
        healthRecommendations: { diet: 'Warm foods' }
      };

      const formatted = serviceInstance.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.analysis).toBe(mockResult);
      expect(formatted.metadata.system).toBe('Ayurvedic Astrology');
      expect(formatted.metadata.calculationMethod).toBe(
        'Vedic astrology integrated with Ayurvedic health principles'
      );
      expect(formatted.metadata.doshas).toEqual(['Vata', 'Pitta', 'Kapha']);
    });
  });

  describe('_formatDoshaBreakdown', () => {
    it('should format dosha breakdown correctly', () => {
      const constitutions = {
        vata: 40,
        pitta: 35,
        kapha: 25
      };

      const breakdown = serviceInstance._formatDoshaBreakdown(constitutions);

      expect(breakdown).toContain('Vata (40%): Creative and flexible');
      expect(breakdown).toContain('Pitta (35%): Intelligent and focused');
      expect(breakdown).toContain('Kapha (25%): Calm and patient');
    });

    it('should handle zero values', () => {
      const constitutions = {
        vata: 0,
        pitta: 0,
        kapha: 0
      };

      const breakdown = serviceInstance._formatDoshaBreakdown(constitutions);

      expect(breakdown).toContain('Vata (0%): Creative and flexible');
    });
  });

  describe('getMetadata', () => {
    it('should return correct metadata', () => {
      const metadata = serviceInstance.getMetadata();

      expect(metadata.name).toBe('AyurvedicAstrologyService');
      expect(metadata.description).toContain('Ayurvedic constitution analysis');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.dependencies).toContain('AyurvedicAstrology');
      expect(metadata.category).toBe('vedic');
      expect(metadata.methods).toContain('execute');
      expect(metadata.methods).toContain('getConstitution');
      expect(metadata.methods).toContain('getRecommendations');
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status', async () => {
      const status = await serviceInstance.getHealthStatus();

      expect(status.status).toBe('healthy');
      expect(status.serviceName).toBe('AyurvedicAstrologyService');
      expect(status.features).toBeDefined();
      expect(status.supportedAnalyses).toBeDefined();
    });
  });
});