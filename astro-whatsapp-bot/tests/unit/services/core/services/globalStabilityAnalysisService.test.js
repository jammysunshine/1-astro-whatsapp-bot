// tests/unit/services/core/services/globalStabilityAnalysisService.test.js
const GlobalStabilityAnalysisService = require('../../../../../src/core/services/globalStabilityAnalysisService');
const logger = require('../../../../../src/utils/logger');

// Mock logger to prevent console output during tests
jest.mock('../../../../../src/utils/logger');

describe('GlobalStabilityAnalysisService', () => {
  let serviceInstance;

  beforeEach(async () => {
    jest.clearAllMocks();
    serviceInstance = new GlobalStabilityAnalysisService();
    // If the service has an initialize method, call it here
    if (serviceInstance.initialize) {
      await serviceInstance.initialize();
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(serviceInstance).toBeInstanceOf(GlobalStabilityAnalysisService);
      expect(serviceInstance.serviceName).toBe('GlobalStabilityAnalysisService');
    });
  });

  describe('processCalculation', () => {
    it('should process calculation correctly with valid input', async () => {
      const politicalResults = {
        'United States': {
          politicalStability: {
            rating: 'Stable',
            factors: ['Strong institutions', 'Democratic process'],
            outlook: 'Positive'
          }
        },
        'Germany': {
          politicalStability: {
            rating: 'Stable',
            factors: ['Strong economy', 'EU membership'],
            outlook: 'Stable'
          }
        }
      };

      const result = await serviceInstance.processCalculation(politicalResults);
      
      expect(result).toBeDefined();
      // Add more specific assertions based on expected output
    });

    it('should handle invalid input gracefully', async () => {
      const politicalResults = null;
      
      await expect(serviceInstance.processCalculation(politicalResults))
        .rejects
        .toThrow('Political results are required for global stability analysis');
    });
  });

  describe('analyzeGlobalStability', () => {
    it('should analyze global stability patterns correctly', async () => {
      const params = {
        politicalResults: {
          'United States': {
            politicalStability: {
              rating: 'Stable',
              factors: ['Strong institutions'],
              outlook: 'Positive'
            }
          },
          'Germany': {
            politicalStability: {
              rating: 'Stable',
              factors: ['Strong economy'],
              outlook: 'Stable'
            }
          },
          'Syria': {
            politicalStability: {
              rating: 'Unstable',
              factors: ['Conflict', 'Instability'],
              outlook: 'Uncertain'
            }
          }
        }
      };

      const result = await serviceInstance.analyzeGlobalStability(params);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.stabilityPatterns).toBeDefined();
      expect(result.data.stableCount).toBeDefined();
      expect(result.data.unstableCount).toBeDefined();
      expect(result.data.globalTrend).toBeDefined();
      expect(result.metadata.calculationType).toBe('global_stability_patterns');
    });

    it('should handle missing political results', async () => {
      const params = {};

      const result = await serviceInstance.analyzeGlobalStability(params);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('identifyGlobalLeadershipPatterns', () => {
    it('should identify global leadership patterns', async () => {
      const params = {
        politicalResults: {
          'United States': {
            leadershipAnalysis: {
              leadershipTransitions: ['2024 Presidential Election'],
              leadershipQuality: 'Strong',
              powerShifts: ['Executive branch'],
              leadershipChallenges: ['Polarization']
            }
          },
          'Germany': {
            leadershipAnalysis: {
              leadershipTransitions: [],
              leadershipQuality: 'Stable',
              powerShifts: [],
              leadershipChallenges: ['Energy transition']
            }
          }
        }
      };

      const result = await serviceInstance.identifyGlobalLeadershipPatterns(params);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.leadershipTransitions).toBeDefined();
      expect(result.data.leadershipQuality).toBeDefined();
      expect(result.data.powerShifts).toBeDefined();
      expect(result.data.leadershipChallenges).toBeDefined();
      expect(result.metadata.calculationType).toBe('global_leadership_patterns');
    });

    it('should handle missing political results', async () => {
      const params = {};

      const result = await serviceInstance.identifyGlobalLeadershipPatterns(params);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('assessGlobalPoliticalTensions', () => {
    it('should assess global political tensions', async () => {
      const params = {
        politicalResults: {
          'United States': {
            politicalStability: {
              rating: 'Stable',
              factors: ['Strong institutions'],
              outlook: 'Positive'
            }
          },
          'Syria': {
            politicalStability: {
              rating: 'Unstable',
              factors: ['Conflict', 'Instability'],
              outlook: 'Uncertain'
            }
          }
        }
      };

      const result = await serviceInstance.assessGlobalPoliticalTensions(params);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.tensionLevels).toBeDefined();
      expect(result.data.conflictHotspots).toBeDefined();
      expect(result.data.diplomaticOpportunities).toBeDefined();
      expect(result.data.escalationRisks).toBeDefined();
      expect(result.metadata.calculationType).toBe('global_political_tensions');
    });
  });

  describe('identifyDiplomaticOpportunities', () => {
    it('should identify diplomatic opportunities', async () => {
      const params = {
        politicalResults: {
          'United States': {
            politicalStability: {
              rating: 'Stable'
            },
            internationalInfluence: {
              relationshipStrength: 'Strong'
            }
          },
          'Germany': {
            politicalStability: {
              rating: 'Stable'
            }
          }
        }
      };

      const result = await serviceInstance.identifyDiplomaticOpportunities(params);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.opportunities).toBeDefined();
      expect(result.data.timingWindows).toBeDefined();
      expect(result.data.favorableConditions).toBeDefined();
      expect(result.data.partnershipPotential).toBeDefined();
      expect(result.metadata.calculationType).toBe('diplomatic_opportunities');
    });
  });

  describe('generateGlobalStabilityReport', () => {
    it('should generate comprehensive global stability report', async () => {
      const params = {
        politicalResults: {
          'United States': {
            politicalStability: {
              rating: 'Stable',
              factors: ['Strong institutions'],
              outlook: 'Positive'
            },
            leadershipAnalysis: {
              leadershipTransitions: ['2024 Presidential Election'],
              leadershipQuality: 'Strong',
              powerShifts: ['Executive branch'],
              leadershipChallenges: ['Polarization']
            },
            internationalInfluence: {
              relationshipStrength: 'Strong'
            }
          },
          'Germany': {
            politicalStability: {
              rating: 'Stable',
              factors: ['Strong economy'],
              outlook: 'Stable'
            },
            leadershipAnalysis: {
              leadershipTransitions: [],
              leadershipQuality: 'Stable',
              powerShifts: [],
              leadershipChallenges: ['Energy transition']
            }
          },
          'Syria': {
            politicalStability: {
              rating: 'Unstable',
              factors: ['Conflict', 'Instability'],
              outlook: 'Uncertain'
            }
          }
        },
        focusArea: 'all'
      };

      const result = await serviceInstance.generateGlobalStabilityReport(params);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.stabilityAnalysis).toBeDefined();
      expect(result.data.leadershipPatterns).toBeDefined();
      expect(result.data.politicalTensions).toBeDefined();
      expect(result.data.diplomaticOpportunities).toBeDefined();
      expect(result.data.integratedAssessment).toBeDefined();
      expect(result.data.strategicRecommendations).toBeDefined();
      expect(result.metadata.calculationType).toBe('comprehensive_global_stability_report');
    });
  });

  describe('getHealthStatus', () => {
    it('should return a healthy status when operational', async () => {
      const status = await serviceInstance.getHealthStatus();
      expect(status.status).toBe('healthy');
      expect(status.features).toBeDefined();
      expect(status.features.analysisTypes).toContain('stability');
      expect(status.features.analysisTypes).toContain('leadership');
      expect(status.features.analysisTypes).toContain('tensions');
      expect(status.features.analysisTypes).toContain('diplomatic');
      expect(status.features.countryCoverage).toBe('Global');
    });
  });

  describe('getMetadata', () => {
    it('should return correct metadata', () => {
      const metadata = serviceInstance.getMetadata();
      expect(metadata.name).toBe('GlobalStabilityAnalysisService');
      expect(metadata.category).toBe('global_political');
      expect(metadata.methods).toContain('analyzeGlobalStability');
      expect(metadata.methods).toContain('identifyGlobalLeadershipPatterns');
      expect(metadata.methods).toContain('assessGlobalPoliticalTensions');
      expect(metadata.methods).toContain('identifyDiplomaticOpportunities');
      expect(metadata.methods).toContain('generateGlobalStabilityReport');
      expect(metadata.dependencies).toContain('GlobalStabilityAnalyzer');
    });
  });

  describe('validate', () => {
    it('should validate political results correctly', () => {
      const politicalResults = {
        'United States': {
          politicalStability: {
            rating: 'Stable'
          }
        }
      };
      
      expect(() => serviceInstance.validate(politicalResults)).not.toThrow();
    });

    it('should throw error for missing political results', () => {
      expect(() => serviceInstance.validate(null))
        .toThrow('Political results are required for global stability analysis');
    });

    it('should warn for political results in unexpected format', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const politicalResults = 'not-an-object'; // Invalid format
      
      expect(() => serviceInstance.validate(politicalResults)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});