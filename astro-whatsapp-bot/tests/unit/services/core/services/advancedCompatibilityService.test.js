// tests/unit/services/core/services/advancedCompatibilityService.test.js
const AdvancedCompatibilityService = require('../src/core/services/advancedCompatibilityService');
const logger = require('../src/utils/logger');

// Mock dependencies
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Mock the calculator
jest.mock('../src/core/services/calculators/index', () => ({
  CompatibilityCalculator: jest.fn().mockImplementation(() => ({
    checkCompatibility: jest.fn()
  }))
}));

let serviceInstance;

beforeEach(async () => {
  jest.clearAllMocks();

  serviceInstance = new AdvancedCompatibilityService();
  await serviceInstance.initialize();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('AdvancedCompatibilityService', () => {
  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(serviceInstance).toBeInstanceOf(AdvancedCompatibilityService);
      expect(serviceInstance.serviceName).toBe('AdvancedCompatibilityService');
      expect(serviceInstance.calculatorPath).toBe('./calculators/index');
    });
  });

  describe('processCalculation', () => {
    const validPerson1 = {
      name: 'John Doe',
      birthDate: '15/06/1990',
      birthTime: '14:30',
      birthPlace: 'New York, USA'
    };

    const validPerson2 = {
      name: 'Jane Smith',
      birthDate: '22/12/1992',
      birthTime: '09:15',
      birthPlace: 'London, UK'
    };

    it('should process compatibility calculation successfully with valid inputs', async () => {
      const mockResult = {
        type: 'ved_compat',
        overall_score: 8,
        overall_rating: 'Excellent',
        compatibility_percentage: 85,
        person1_name: 'John Doe',
        person2_name: 'Jane Smith',
        sun_compatibility: 'Excellent core personality harmony',
        moon_compatibility: 'Harmonious emotional connection',
        venus_compatibility: 'Romantically aligned with shared values',
        mars_compatibility: 'Energetically aligned',
        lagna_compatibility: 'Personally harmonious',
        detailed_scores: {
          sun: 8,
          moon: 9,
          venus: 8,
          mars: 7,
          lagna: 9
        },
        vedic_factors: {
          nadi_compatibility: { compatible: true, score: 8 },
          gana_compatibility: { compatible: true, score: 8 },
          yoni_compatibility: { compatible: true, score: 8 },
          graha_maitri: { score: 7 },
          varna_compatibility: { compatible: true, score: 8 },
          tara_compatibility: { score: 8 }
        }
      };

      serviceInstance.calculator.checkCompatibility.mockResolvedValue(mockResult);

      const result = await serviceInstance.processCalculation({
        person1: validPerson1,
        person2: validPerson2
      });

      expect(result).toBeDefined();
      expect(result.overall_score).toBe(8);
      expect(result.overall_rating).toBe('Excellent');
      expect(result.compatibility_percentage).toBe(85);
      expect(result.serviceMetadata.serviceName).toBe('AdvancedCompatibilityService');
      expect(result.enhancedAnalysis).toBeDefined();
      expect(serviceInstance.calculator.checkCompatibility).toHaveBeenCalledWith(
        validPerson1,
        validPerson2
      );
    });

    it('should handle invalid inputs gracefully', async () => {
      await expect(serviceInstance.processCalculation({
        person1: null,
        person2: validPerson2
      })).rejects.toThrow('Both persons\' birth data are required');

      await expect(serviceInstance.processCalculation({
        person1: validPerson1,
        person2: null
      })).rejects.toThrow('Both persons\' birth data are required');
    });

    it('should handle calculator errors', async () => {
      serviceInstance.calculator.checkCompatibility.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(serviceInstance.processCalculation({
        person1: validPerson1,
        person2: validPerson2
      })).rejects.toThrow('Advanced Compatibility calculation failed: Calculator error');
    });
  });

  describe('formatResult', () => {
    it('should format successful compatibility result', () => {
      const result = {
        overall_score: 8,
        overall_rating: 'Excellent',
        compatibility_percentage: 85,
        person1_name: 'John',
        person2_name: 'Jane',
        sun_compatibility: 'Excellent harmony',
        moon_compatibility: 'Good connection',
        venus_compatibility: 'Romantic alignment',
        mars_compatibility: 'Energy match',
        lagna_compatibility: 'Personal harmony',
        detailed_scores: {
          sun: 8,
          moon: 7,
          venus: 8,
          mars: 7,
          lagna: 9
        },
        vedic_factors: {
          nadi_compatibility: { description: 'Good nadi match' },
          gana_compatibility: { description: 'Compatible gana' },
          yoni_compatibility: { description: 'Yoni harmony' }
        },
        recommendations: ['Great match', 'Focus on communication'],
        enhancedAnalysis: {
          strengths: 'Strong compatibility',
          challenges: 'Minor differences',
          longTermPotential: 'Excellent'
        }
      };

      const formatted = serviceInstance.formatResult(result);

      expect(formatted).toContain('💕 *Advanced Compatibility Analysis*');
      expect(formatted).toContain('*John & Jane*');
      expect(formatted).toContain('*Overall Compatibility:* 8/10');
      expect(formatted).toContain('*Rating:* Excellent');
      expect(formatted).toContain('*Percentage:* 85%');
      expect(formatted).toContain('🌟 Key Compatibility Factors:');
      expect(formatted).toContain('• **Core Personality:** Excellent harmony');
      expect(formatted).toContain('🔮 Vedic Compatibility Factors:');
      expect(formatted).toContain('📊 Detailed Scores:');
      expect(formatted).toContain('💡 Recommendations:');
      expect(formatted).toContain('🎯 Enhanced Insights:');
    });

    it('should handle error results', () => {
      const result = { overall_score: undefined };

      const formatted = serviceInstance.formatResult(result);

      expect(formatted).toContain('❌ *Advanced Compatibility Analysis Error*');
      expect(formatted).toContain('Unable to generate compatibility analysis');
    });
  });

  describe('_validateInputs', () => {
    it('should validate correct birth data', () => {
      const person1 = {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'New York'
      };
      const person2 = {
        birthDate: '22/12/1992',
        birthTime: '09:15',
        birthPlace: 'London'
      };

      expect(() => serviceInstance._validateInputs(person1, person2)).not.toThrow();
    });

    it('should throw error for missing persons', () => {
      expect(() => serviceInstance._validateInputs(null, {})).toThrow(
        'Both persons\' birth data are required'
      );
      expect(() => serviceInstance._validateInputs({}, null)).toThrow(
        'Both persons\' birth data are required'
      );
    });
  });

  describe('_performEnhancedAnalysis', () => {
    it('should analyze excellent compatibility', () => {
      const result = {
        overall_score: 9,
        detailed_scores: { sun: 9, moon: 9, venus: 8, mars: 8, lagna: 9 }
      };

      const analysis = serviceInstance._performEnhancedAnalysis(result);

      expect(analysis.strengths).toContain('Excellent overall compatibility');
      expect(analysis.longTermPotential).toContain('Very high potential');
      expect(analysis.relationshipType).toBeDefined();
    });

    it('should analyze moderate compatibility', () => {
      const result = {
        overall_score: 5,
        detailed_scores: { sun: 5, moon: 4, venus: 6, mars: 5, lagna: 5 }
      };

      const analysis = serviceInstance._performEnhancedAnalysis(result);

      expect(analysis.strengths).toContain('Moderate compatibility');
      expect(analysis.longTermPotential).toContain('Potential for growth');
      expect(analysis.growthAreas).toContain('moon');
    });

    it('should analyze challenging compatibility', () => {
      const result = {
        overall_score: 3,
        detailed_scores: { sun: 3, moon: 2, venus: 4, mars: 3, lagna: 3 }
      };

      const analysis = serviceInstance._performEnhancedAnalysis(result);

      expect(analysis.strengths).toContain('Challenging compatibility');
      expect(analysis.longTermPotential).toContain('Relationship success depends');
    });
  });

  describe('calculateConfidence', () => {
    it('should calculate confidence with detailed scores', () => {
      const result = {
        detailed_scores: { sun: 8, moon: 7, venus: 8, mars: 7, lagna: 9 },
        vedic_factors: { nadi: {}, gana: {}, yoni: {} }
      };

      const confidence = serviceInstance.calculateConfidence(result);
      expect(confidence).toBeGreaterThan(80);
      expect(confidence).toBeLessThanOrEqual(100);
    });

    it('should return base confidence for minimal data', () => {
      const result = { overall_score: 7 };

      const confidence = serviceInstance.calculateConfidence(result);
      expect(confidence).toBe(80);
    });
  });

  describe('validateResult', () => {
    it('should validate correct result', () => {
      const result = {
        overall_score: 8,
        person1_name: 'John',
        person2_name: 'Jane'
      };

      expect(serviceInstance.validateResult(result)).toBe(true);
    });

    it('should reject invalid results', () => {
      expect(serviceInstance.validateResult(null)).toBe(false);
      expect(serviceInstance.validateResult({})).toBe(false);
      expect(serviceInstance.validateResult({ overall_score: 8 })).toBe(false);
      expect(serviceInstance.validateResult({ person1_name: 'John', person2_name: 'Jane' })).toBe(false);
    });
  });

  describe('getHelp', () => {
    it('should return help information', () => {
      const help = serviceInstance.getHelp();

      expect(help).toContain('💕 **Advanced Compatibility Service - Comprehensive Vedic Analysis**');
      expect(help).toContain('**Purpose:**');
      expect(help).toContain('**Required Inputs:**');
      expect(help).toContain('**Compatibility Factors Analyzed:**');
      expect(help).toContain('**Score Interpretation:**');
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status', async () => {
      const status = await serviceInstance.getHealthStatus();

      expect(status.status).toBe('healthy');
      expect(status.serviceName).toBe('AdvancedCompatibilityService');
      expect(status.features).toBeDefined();
      expect(status.supportedAnalyses).toBeDefined();
    });
  });
});