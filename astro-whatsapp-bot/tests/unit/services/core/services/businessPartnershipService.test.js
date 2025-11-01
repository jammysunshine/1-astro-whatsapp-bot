// tests/unit/services/core/services/businessPartnershipService.test.js
const BusinessPartnershipService = require('../../../../../src/core/services/businessPartnershipService');
const logger = require('../../../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Mock calculators
jest.mock('../../../../../src/core/services/calculators/CompatibilityCalculator', () => ({
  checkCompatibility: jest.fn()
}));

jest.mock('../../../../../src/core/services/calculators/FinancialAstrologyCalculator', () => ({
  analyzeFinancialPotential: jest.fn()
}));

let serviceInstance;

beforeEach(async () => {
  jest.clearAllMocks();

  serviceInstance = new BusinessPartnershipService();
  await serviceInstance.initialize();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('BusinessPartnershipService', () => {
  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(serviceInstance).toBeInstanceOf(BusinessPartnershipService);
      expect(serviceInstance.serviceName).toBe('BusinessPartnershipService');
      expect(serviceInstance.calculatorPath).toBe('./calculators/CompatibilityCalculator');
    });
  });

  describe('processCalculation', () => {
    const validPartnershipData = {
      partners: [
        {
          name: 'John Doe',
          businessRole: 'CEO',
          birthData: {
            birthDate: '15/06/1990',
            birthTime: '14:30',
            birthPlace: 'New York, USA'
          },
          sun: { house: 10, sign: 'Leo' },
          mars: { house: 1, sign: 'Aries' },
          mercury: { house: 3, sign: 'Gemini' }
        },
        {
          name: 'Jane Smith',
          businessRole: 'CFO',
          birthData: {
            birthDate: '22/03/1985',
            birthTime: '09:15',
            birthPlace: 'London, UK'
          },
          sun: { house: 2, sign: 'Taurus' },
          mars: { house: 8, sign: 'Scorpio' },
          mercury: { house: 2, sign: 'Taurus' }
        }
      ],
      businessType: 'Technology',
      analysisFocus: 'Financial Synergy'
    };

    it('should process business partnership calculation successfully', async () => {
      const result = await serviceInstance.processCalculation(validPartnershipData);

      expect(result).toBeDefined();
      expect(result.partners).toBeDefined();
      expect(result.partnershipCompatibility).toBeDefined();
      expect(result.financialSynergy).toBeDefined();
      expect(result.timingAnalysis).toBeDefined();
      expect(result.relationshipDynamics).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.partnershipStrength).toBeDefined();
    });

    it('should handle calculator errors', async () => {
      jest.spyOn(serviceInstance, 'getBusinessPartnershipAnalysis').mockRejectedValue(
        new Error('Analysis failed')
      );

      await expect(serviceInstance.processCalculation(validPartnershipData)).rejects.toThrow(
        'Business partnership analysis failed: Analysis failed'
      );
    });
  });

  describe('getBusinessPartnershipAnalysis', () => {
    const partnershipData = {
      partners: [
        {
          name: 'John Doe',
          businessRole: 'CEO',
          birthData: {
            birthDate: '15/06/1990',
            birthTime: '14:30',
            birthPlace: 'New York, USA'
          }
        },
        {
          name: 'Jane Smith',
          businessRole: 'CFO',
          birthData: {
            birthDate: '22/03/1985',
            birthTime: '09:15',
            birthPlace: 'London, UK'
          }
        }
      ],
      businessType: 'Technology'
    };

    it('should return comprehensive partnership analysis', async () => {
      const result = await serviceInstance.getBusinessPartnershipAnalysis(partnershipData);

      expect(result).toBeDefined();
      expect(result.partners).toEqual([
        { name: 'John Doe', role: 'CEO' },
        { name: 'Jane Smith', role: 'CFO' }
      ]);
      expect(result.businessType).toBe('Technology');
      expect(result.partnerAnalyses).toBeDefined();
      expect(result.partnershipCompatibility).toBeDefined();
      expect(result.financialSynergy).toBeDefined();
      expect(result.timingAnalysis).toBeDefined();
      expect(result.relationshipDynamics).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.partnershipStrength).toBeDefined();
    });
  });

  describe('_analyzeBusinessPartners', () => {
    it('should analyze individual business partners', async () => {
      const partners = [
        {
          name: 'John Doe',
          businessRole: 'CEO',
          mars: { house: 10 },
          jupiter: { house: 11 },
          mercury: { house: 3 },
          saturn: { house: 10 }
        }
      ];

      const result = await serviceInstance._analyzeBusinessPartners(partners);

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('John Doe');
      expect(result[0].businessRole).toBe('CEO');
      expect(result[0].businessStrengths).toBeDefined();
      expect(result[0].leadershipStyle).toBeDefined();
      expect(result[0].riskTolerance).toBeDefined();
      expect(result[0].decisionMaking).toBeDefined();
      expect(result[0].workEthic).toBeDefined();
      expect(result[0].financialApproach).toBeDefined();
    });
  });

  describe('_calculatePartnershipCompatibility', () => {
    it('should calculate partnership compatibility', async () => {
      const partners = [
        { name: 'John', mercury: { house: 3 } },
        { name: 'Jane', mercury: { house: 7 } }
      ];

      // Mock compatibility calculator
      serviceInstance.compatibilityCalculator.checkCompatibility.mockResolvedValue({
        overall: 75,
        businessSynergy: { skillComplementary: true, riskBalance: true, decisionSynergy: true }
      });

      const result = await serviceInstance._calculatePartnershipCompatibility(partners);

      expect(result).toBeDefined();
      expect(result.overallScore).toBeDefined();
      expect(result.synergyLevel).toBeDefined();
      expect(result.breakdown).toBeDefined();
      expect(result.complementarySkills).toBeDefined();
      expect(result.potentialConflicts).toBeDefined();
    });

    it('should handle calculator errors gracefully', async () => {
      const partners = [{ name: 'John' }, { name: 'Jane' }];

      serviceInstance.compatibilityCalculator.checkCompatibility.mockRejectedValue(
        new Error('Compatibility check failed')
      );

      const result = await serviceInstance._calculatePartnershipCompatibility(partners);

      expect(result).toBeDefined();
      expect(result.overallScore).toBe(0);
      expect(result.synergyLevel).toBe('Unknown');
    });
  });

  describe('_analyzeFinancialSynergy', () => {
    it('should analyze financial synergy', async () => {
      const partners = [
        { name: 'John', financialApproach: { approach: 'Conservative' } },
        { name: 'Jane', financialApproach: { approach: 'Aggressive' } }
      ];

      // Mock financial calculator
      serviceInstance.financialCalculator.analyzeFinancialPotential.mockResolvedValue({
        potential: 70,
        approach: 'Balanced'
      });

      const result = await serviceInstance._analyzeFinancialSynergy(partners);

      expect(result).toBeDefined();
      expect(result.overallSynergy).toBeDefined();
      expect(result.wealthGeneration).toBeDefined();
      expect(result.financialDecisionMaking).toBeDefined();
      expect(result.riskApproach).toBeDefined();
      expect(result.investmentStyle).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('should handle calculator errors gracefully', async () => {
      const partners = [{ name: 'John' }];

      serviceInstance.financialCalculator.analyzeFinancialPotential.mockRejectedValue(
        new Error('Financial analysis failed')
      );

      const result = await serviceInstance._analyzeFinancialSynergy(partners);

      expect(result).toBeDefined();
      expect(result.overallSynergy).toBe(0);
      expect(result.wealthGeneration).toBe('Analysis unavailable');
    });
  });

  describe('_analyzePartnershipTiming', () => {
    it('should analyze partnership timing', async () => {
      const partners = [
        { name: 'John', currentDasha: 'Jupiter' },
        { name: 'Jane', currentDasha: 'Venus' }
      ];
      const businessType = 'Technology';

      const result = await serviceInstance._analyzePartnershipTiming(partners, businessType);

      expect(result).toBeDefined();
      expect(result.optimalStartPeriod).toBeDefined();
      expect(result.challengingPeriods).toBeDefined();
      expect(result.longTermViability).toBeDefined();
      expect(result.timingRecommendations).toBeDefined();
      expect(result.dashaInfluences).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      const partners = [{ name: 'John' }];
      const businessType = 'Technology';

      const result = await serviceInstance._analyzePartnershipTiming(partners, businessType);

      expect(result).toBeDefined();
      expect(result.optimalStartPeriod).toBe('Analysis unavailable');
    });
  });

  describe('_assessBusinessDynamics', () => {
    it('should assess business relationship dynamics', () => {
      const compatibility = {
        overallScore: 75,
        breakdown: { decisionMaking: 70 }
      };
      const partnerAnalyses = [
        { leadershipStyle: 'Authoritative', workEthic: 'Strong work ethic' },
        { leadershipStyle: 'Collaborative', workEthic: 'Dedicated work approach' }
      ];

      const result = serviceInstance._assessBusinessDynamics(compatibility, partnerAnalyses);

      expect(result).toBeDefined();
      expect(result.leadershipStructure).toBeDefined();
      expect(result.decisionProcess).toBeDefined();
      expect(result.conflictResolution).toBeDefined();
      expect(result.growthPotential).toBeDefined();
      expect(result.sustainability).toBeDefined();
    });

    it('should handle errors gracefully', () => {
      const compatibility = {};
      const partnerAnalyses = [];

      const result = serviceInstance._assessBusinessDynamics(compatibility, partnerAnalyses);

      expect(result).toBeDefined();
      expect(result).toEqual({});
    });
  });

  describe('_generateBusinessRecommendations', () => {
    it('should generate business recommendations', () => {
      const compatibility = {
        overallScore: 65,
        complementarySkills: ['leadership', 'communication'],
        breakdown: { communication: 55 }
      };
      const financialSynergy = { overallSynergy: 70 };
      const timingAnalysis = { challengingPeriods: ['Saturn period'] };
      const businessType = 'Technology';

      const result = serviceInstance._generateBusinessRecommendations(
        compatibility,
        financialSynergy,
        timingAnalysis,
        businessType
      );

      expect(result).toBeDefined();
      expect(result.immediate).toBeDefined();
      expect(result.structural).toBeDefined();
      expect(result.operational).toBeDefined();
      expect(result.strategic).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should validate correct partnership data', () => {
      const validData = {
        partners: [
          {
            name: 'John Doe',
            businessRole: 'CEO',
            birthData: {
              birthDate: '15/06/1990',
              birthTime: '14:30',
              birthPlace: 'New York'
            }
          },
          {
            name: 'Jane Smith',
            businessRole: 'CFO',
            birthData: {
              birthDate: '22/03/1985',
              birthTime: '09:15',
              birthPlace: 'London'
            }
          }
        ]
      };

      expect(() => serviceInstance.validate(validData)).not.toThrow();
    });

    it('should throw error for missing partnership data', () => {
      expect(() => serviceInstance.validate(null)).toThrow('Partnership data is required');
    });

    it('should throw error for insufficient partners', () => {
      const invalidData = {
        partners: [
          {
            name: 'John Doe',
            businessRole: 'CEO',
            birthData: {
              birthDate: '15/06/1990',
              birthTime: '14:30',
              birthPlace: 'New York'
            }
          }
        ]
      };

      expect(() => serviceInstance.validate(invalidData)).toThrow(
        'At least 2 business partners are required for analysis'
      );
    });

    it('should throw error for missing partner data', () => {
      const invalidData = {
        partners: [
          {
            name: 'John Doe',
            businessRole: 'CEO'
            // Missing birthData
          },
          {
            name: 'Jane Smith',
            businessRole: 'CFO',
            birthData: {
              birthDate: '22/03/1985',
              birthTime: '09:15',
              birthPlace: 'London'
            }
          }
        ]
      };

      expect(() => serviceInstance.validate(invalidData)).toThrow(
        'Partner 1 birth data is required'
      );
    });

    it('should throw error for invalid date format', () => {
      const invalidData = {
        partners: [
          {
            name: 'John Doe',
            businessRole: 'CEO',
            birthData: {
              birthDate: '15-06-1990', // Invalid format
              birthTime: '14:30',
              birthPlace: 'New York'
            }
          },
          {
            name: 'Jane Smith',
            businessRole: 'CFO',
            birthData: {
              birthDate: '22/03/1985',
              birthTime: '09:15',
              birthPlace: 'London'
            }
          }
        ]
      };

      expect(() => serviceInstance.validate(invalidData)).toThrow(
        'Partner 1 birth date must be in DD/MM/YYYY format'
      );
    });

    it('should throw error for invalid time format', () => {
      const invalidData = {
        partners: [
          {
            name: 'John Doe',
            businessRole: 'CEO',
            birthData: {
              birthDate: '15/06/1990',
              birthTime: '14-30', // Invalid format
              birthPlace: 'New York'
            }
          },
          {
            name: 'Jane Smith',
            businessRole: 'CFO',
            birthData: {
              birthDate: '22/03/1985',
              birthTime: '09:15',
              birthPlace: 'London'
            }
          }
        ]
      };

      expect(() => serviceInstance.validate(invalidData)).toThrow(
        'Partner 1 birth time must be in HH:MM format'
      );
    });
  });

  describe('formatResult', () => {
    it('should format result with service information', () => {
      const mockResult = {
        partnershipCompatibility: { overallScore: 75 },
        financialSynergy: { overallSynergy: 70 }
      };

      const formatted = serviceInstance.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.service).toBe('Business Partnership Analysis');
      expect(formatted.timestamp).toBeDefined();
      expect(formatted.data).toBe(mockResult);
      expect(formatted.disclaimer).toContain('business relationships');
    });
  });

  describe('getMetadata', () => {
    it('should return correct metadata', () => {
      const metadata = serviceInstance.getMetadata();

      expect(metadata.name).toBe('BusinessPartnershipService');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.category).toBe('vedic');
      expect(metadata.methods).toEqual(['execute', 'getBusinessPartnershipAnalysis']);
      expect(metadata.dependencies).toEqual([
        'GroupAstrologyCalculator',
        'CompatibilityScorer',
        'FinancialAstrologyCalculator'
      ]);
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status', async () => {
      const status = await serviceInstance.getHealthStatus();

      expect(status.status).toBe('healthy');
      expect(status.serviceName).toBe('BusinessPartnershipService');
      expect(status.features).toBeDefined();
      expect(status.supportedAnalyses).toBeDefined();
    });
  });

  describe('_calculatePartnershipStrength', () => {
    it('should calculate partnership strength', () => {
      const compatibility = { overallScore: 75 };
      const financialSynergy = { overallSynergy: 70 };

      const result = serviceInstance._calculatePartnershipStrength(compatibility, financialSynergy);

      expect(result).toBeDefined();
      expect(result.score).toBe(72.5);
      expect(result.level).toBe('Strong');
      expect(result.factors).toEqual({
        compatibility: 75,
        financialSynergy: 70
      });
    });

    it('should handle very strong partnerships', () => {
      const compatibility = { overallScore: 85 };
      const financialSynergy = { overallSynergy: 80 };

      const result = serviceInstance._calculatePartnershipStrength(compatibility, financialSynergy);

      expect(result.level).toBe('Very Strong');
    });

    it('should handle weak partnerships', () => {
      const compatibility = { overallScore: 40 };
      const financialSynergy = { overallSynergy: 35 };

      const result = serviceInstance._calculatePartnershipStrength(compatibility, financialSynergy);

      expect(result.level).toBe('Needs Attention');
    });
  });
});