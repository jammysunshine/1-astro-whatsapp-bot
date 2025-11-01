// tests/unit/services/core/services/ashtakavargaService.test.js
const AshtakavargaService = require('../../../../../src/core/services/ashtakavargaService');
const logger = require('../../../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Mock the calculator
jest.mock('../../../../../src/core/services/calculators/index', () => ({
  AshtakavargaCalculator: jest.fn().mockImplementation(() => ({
    calculateAshtakavarga: jest.fn()
  }))
}));

let serviceInstance;

beforeEach(async () => {
  jest.clearAllMocks();

  serviceInstance = new AshtakavargaService();
  await serviceInstance.initialize();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('AshtakavargaService', () => {
  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(serviceInstance).toBeInstanceOf(AshtakavargaService);
      expect(serviceInstance.serviceName).toBe('AshtakavargaService');
      expect(serviceInstance.calculatorPath).toBe('./calculators/index');
      expect(serviceInstance.serviceConfig.supportedInputs).toContain('birthData');
      expect(serviceInstance.serviceConfig.strengthCategories.veryStrong).toBe(28);
    });
  });

  describe('processCalculation', () => {
    const validBirthData = {
      birthDate: '15/06/1990',
      birthTime: '14:30',
      birthPlace: 'New York, USA',
      name: 'John Doe'
    };

    it('should process Ashtakavarga calculation successfully', async () => {
      const mockResult = {
        overview: 'Ashtakavarga reveals planetary strength in 12 life areas through 64 mathematical combinations.',
        planetaryStrengths: [
          { name: 'Sun', house: 1, strength: 'Sun: 8 points' },
          { name: 'Moon', house: 2, strength: 'Moon: 7 points' },
          { name: 'Mars', house: 3, strength: 'Mars: 9 points' }
        ],
        peakHouses: ['House 1', 'House 3'],
        interpretation: 'Excellent planetary harmony across multiple life areas.'
      };

      serviceInstance.calculator.calculateAshtakavarga.mockResolvedValue(mockResult);

      const result = await serviceInstance.processCalculation({
        birthData: validBirthData,
        options: { detailed: true }
      });

      expect(result).toEqual({
        ...mockResult,
        serviceMetadata: {
          serviceName: 'AshtakavargaService',
          calculationType: 'Ashtakavarga',
          timestamp: expect.any(String),
          method: 'Vedic 64-point Beneficial Influence System',
          totalPoints: 64,
          planetsAnalyzed: 7
        },
        enhancedAnalysis: expect.any(Object)
      });
      expect(serviceInstance.calculator.calculateAshtakavarga).toHaveBeenCalledWith(validBirthData);
    });

    it('should handle missing birthData parameter', async () => {
      await expect(serviceInstance.processCalculation({})).rejects.toThrow(
        'Birth data is required for Ashtakavarga analysis'
      );
    });

    it('should handle missing birth date/time', async () => {
      await expect(serviceInstance.processCalculation({
        birthData: { birthPlace: 'New York' }
      })).rejects.toThrow('Birth date and time are required for Ashtakavarga analysis');
    });

    it('should handle calculator errors', async () => {
      serviceInstance.calculator.calculateAshtakavarga.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(serviceInstance.processCalculation({
        birthData: validBirthData
      })).rejects.toThrow('Ashtakavarga calculation failed: Calculator error');
    });
  });

  describe('formatResult', () => {
    it('should format successful Ashtakavarga result', () => {
      const result = {
        overview: 'Ashtakavarga reveals planetary strength in 12 life areas.',
        planetaryStrengths: [
          { name: 'Sun', house: 1, strength: 'Sun: 8 points' },
          { name: 'Moon', house: 2, strength: 'Moon: 7 points' }
        ],
        peakHouses: ['House 1', 'House 3'],
        interpretation: 'Excellent planetary harmony.',
        enhancedAnalysis: {
          overallStrength: 'Very Strong - Excellent planetary support',
          lifeAreaFocus: 'Strong focus in: Self and personality',
          recommendations: 'Favorable period for major life decisions',
          challenges: 'Areas needing attention: Health and service',
          houseAnalysis: {
            1: 'Strong (8 points) - Self and personality well-supported',
            2: 'Moderate (7 points) - Wealth and family balanced'
          }
        }
      };

      const formatted = serviceInstance.formatResult(result);

      expect(formatted).toContain('📊 *Ashtakavarga Analysis*');
      expect(formatted).toContain('Ashtakavarga reveals planetary strength in 12 life areas.');
      expect(formatted).toContain('🌟 Planetary Strengths (Bindus):');
      expect(formatted).toContain('• **Sun:** Sun: 8 points (House 1)');
      expect(formatted).toContain('🏆 Strongest Life Areas:');
      expect(formatted).toContain('• House 1');
      expect(formatted).toContain('💫 Interpretation:');
      expect(formatted).toContain('🎯 Enhanced Analysis:');
      expect(formatted).toContain('🏠 House-wise Strength:');
    });

    it('should handle error results', () => {
      const result = {};

      const formatted = serviceInstance.formatResult(result);

      expect(formatted).toContain('❌ *Ashtakavarga Analysis Error*');
      expect(formatted).toContain('Unable to generate Ashtakavarga analysis');
    });
  });

  describe('_validateInputs', () => {
    it('should validate correct birth data', () => {
      const validData = {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'New York'
      };

      expect(() => serviceInstance._validateInputs(validData)).not.toThrow();
    });

    it('should throw error for missing birth data', () => {
      expect(() => serviceInstance._validateInputs(null)).toThrow(
        'Birth data is required for Ashtakavarga analysis'
      );
    });

    it('should throw error for missing birth date/time', () => {
      expect(() => serviceInstance._validateInputs({ birthPlace: 'New York' })).toThrow(
        'Birth date and time are required for Ashtakavarga analysis'
      );
    });
  });

  describe('_performEnhancedAshtakavargaAnalysis', () => {
    it('should analyze very strong Ashtakavarga', () => {
      const result = {
        planetaryStrengths: [
          { name: 'Sun', house: 1, strength: 'Sun: 8 points' },
          { name: 'Moon', house: 2, strength: 'Moon: 7 points' },
          { name: 'Mars', house: 3, strength: 'Mars: 9 points' },
          { name: 'Mercury', house: 4, strength: 'Mercury: 8 points' },
          { name: 'Jupiter', house: 5, strength: 'Jupiter: 10 points' },
          { name: 'Venus', house: 6, strength: 'Venus: 9 points' },
          { name: 'Saturn', house: 7, strength: 'Saturn: 8 points' }
        ]
      };

      const analysis = serviceInstance._performEnhancedAshtakavargaAnalysis(result);

      expect(analysis.sarvashtakavarga).toBe(59); // 8+7+9+8+10+9+8
      expect(analysis.overallStrength).toContain('Very Strong');
      expect(analysis.recommendations).toContain('Favorable period');
      expect(analysis.houseAnalysis).toBeDefined();
    });

    it('should analyze weak Ashtakavarga', () => {
      const result = {
        planetaryStrengths: [
          { name: 'Sun', house: 1, strength: 'Sun: 3 points' },
          { name: 'Moon', house: 2, strength: 'Moon: 2 points' }
        ]
      };

      const analysis = serviceInstance._performEnhancedAshtakavargaAnalysis(result);

      expect(analysis.sarvashtakavarga).toBe(5);
      expect(analysis.overallStrength).toContain('Weak');
      expect(analysis.recommendations).toContain('Focus on planning');
    });

    it('should handle empty planetary strengths', () => {
      const result = { planetaryStrengths: [] };

      const analysis = serviceInstance._performEnhancedAshtakavargaAnalysis(result);

      expect(analysis.sarvashtakavarga).toBe(0);
      expect(analysis.overallStrength).toBe('');
    });
  });

  describe('_getHouseMeaning', () => {
    it('should return correct house meanings', () => {
      expect(serviceInstance._getHouseMeaning(1)).toBe('Self and personality');
      expect(serviceInstance._getHouseMeaning(2)).toBe('Wealth and family');
      expect(serviceInstance._getHouseMeaning(4)).toBe('Home and mother');
      expect(serviceInstance._getHouseMeaning(10)).toBe('Career and reputation');
      expect(serviceInstance._getHouseMeaning(13)).toBe('House 13');
    });
  });

  describe('calculateConfidence', () => {
    it('should calculate confidence with complete data', () => {
      const result = {
        planetaryStrengths: [
          { name: 'Sun', strength: 'Sun: 8 points' },
          { name: 'Moon', strength: 'Moon: 7 points' },
          { name: 'Mars', strength: 'Mars: 9 points' },
          { name: 'Mercury', strength: 'Mercury: 8 points' },
          { name: 'Jupiter', strength: 'Jupiter: 10 points' },
          { name: 'Venus', strength: 'Venus: 9 points' },
          { name: 'Saturn', strength: 'Saturn: 8 points' }
        ],
        peakHouses: ['House 1', 'House 5'],
        enhancedAnalysis: { sarvashtakavarga: 59 }
      };

      const confidence = serviceInstance.calculateConfidence(result);
      expect(confidence).toBe(100); // Base 80 + 10 + 5 + 5 = 100, capped at 100
    });

    it('should return base confidence for minimal data', () => {
      const result = {};

      const confidence = serviceInstance.calculateConfidence(result);
      expect(confidence).toBe(80);
    });
  });

  describe('validateResult', () => {
    it('should validate correct result', () => {
      const result = {
        planetaryStrengths: [
          { name: 'Sun', strength: 'Sun: 8 points' }
        ]
      };

      expect(serviceInstance.validateResult(result)).toBe(true);
    });

    it('should reject invalid results', () => {
      expect(serviceInstance.validateResult(null)).toBe(false);
      expect(serviceInstance.validateResult({})).toBe(false);
      expect(serviceInstance.validateResult({ planetaryStrengths: 'invalid' })).toBe(false);
    });
  });

  describe('getHelp', () => {
    it('should return help information', () => {
      const help = serviceInstance.getHelp();

      expect(help).toContain('📊 **Ashtakavarga Service**');
      expect(help).toContain('**Purpose:**');
      expect(help).toContain('**Required Inputs:**');
      expect(help).toContain('**Ashtakavarga System:**');
      expect(help).toContain('**Strength Categories:**');
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status', async () => {
      const status = await serviceInstance.getHealthStatus();

      expect(status.status).toBe('healthy');
      expect(status.serviceName).toBe('AshtakavargaService');
      expect(status.features).toBeDefined();
      expect(status.supportedAnalyses).toBeDefined();
    });
  });
});