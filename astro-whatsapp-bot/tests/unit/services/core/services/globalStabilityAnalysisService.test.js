const GlobalStabilityAnalysisService = require('src/core/services/globalStabilityAnalysisService');
const logger = require('src/utils/logger');

// Mock the GlobalStabilityAnalyzer dependency
const mockGlobalStabilityAnalyzer = {
  analyzeGlobalStabilityPatterns: jest.fn(),
  identifyGlobalLeadershipPatterns: jest.fn(),
  assessGlobalPoliticalTensions: jest.fn(),
  identifyDiplomaticOpportunities: jest.fn(),
  analyzeGlobalStability: jest.fn(), // Added for processCalculation
};

jest.mock('src/core/services/calculators/GlobalStabilityAnalyzer', () => ({
  GlobalStabilityAnalyzer: jest.fn().mockImplementation(() => mockGlobalStabilityAnalyzer)
}));

// Mock logger to prevent console output during tests
jest.mock('src/utils/logger');

describe('GlobalStabilityAnalysisService', () => {
  let serviceInstance;

  beforeEach(async () => {
    jest.clearAllMocks();
    serviceInstance = new GlobalStabilityAnalysisService();
    // If the service has an initialize method, call it here
    if (serviceInstance.initialize) {
      await serviceInstance.initialize();
    }

    // Reset mocks for the analyzer before each test
    mockGlobalStabilityAnalyzer.analyzeGlobalStabilityPatterns.mockClear();
    mockGlobalStabilityAnalyzer.identifyGlobalLeadershipPatterns.mockClear();
    mockGlobalStabilityAnalyzer.assessGlobalPoliticalTensions.mockClear();
    mockGlobalStabilityAnalyzer.identifyDiplomaticOpportunities.mockClear();
    mockGlobalStabilityAnalyzer.analyzeGlobalStability.mockClear();

    // Default mock implementations for analyzer methods
    mockGlobalStabilityAnalyzer.analyzeGlobalStabilityPatterns.mockResolvedValue({
      overallStability: 'Moderate',
      stableNations: 2,
      unstableNations: 1,
      globalStabilityIndex: 66.67,
      globalTrend: 'Mixed'
    });
    mockGlobalStabilityAnalyzer.identifyGlobalLeadershipPatterns.mockResolvedValue({
      transitions: ['Leadership change in X'],
      quality: 'Mixed',
      powerShifts: [],
      challenges: []
    });
    mockGlobalStabilityAnalyzer.assessGlobalPoliticalTensions.mockResolvedValue({
      levels: ['High'],
      hotspots: ['Region Y'],
      diplomaticOpportunities: [],
      escalationRisks: []
    });
    mockGlobalStabilityAnalyzer.identifyDiplomaticOpportunities.mockResolvedValue({
      opportunities: ['Diplomatic talks with Z'],
      timingWindows: [],
      favorableConditions: [],
      partnershipPotential: []
    });
    mockGlobalStabilityAnalyzer.analyzeGlobalStability.mockResolvedValue({
      overallStability: 'Moderate',
      stableNations: 2,
      unstableNations: 1,
      globalStabilityIndex: 66.67,
      globalTrend: 'Mixed'
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(serviceInstance).toBeInstanceOf(GlobalStabilityAnalysisService);
      expect(serviceInstance.serviceName).toBe('GlobalStabilityAnalysisService');
      expect(serviceInstance.calculator).toBe(mockGlobalStabilityAnalyzer);
    });
  });

  describe('processCalculation', () => {
    const politicalResults = {
      'United States': {
        politicalStability: {
          rating: 'Stable',
          factors: ['Strong institutions', 'Democratic process'],
          outlook: 'Positive'
        }
      }
    };

    it('should process calculation correctly with valid input', async () => {
      await serviceInstance.processCalculation(politicalResults);
      expect(mockGlobalStabilityAnalyzer.analyzeGlobalStability).toHaveBeenCalledWith(politicalResults);
    });

    it('should handle invalid input gracefully', async () => {
      const invalidPoliticalResults = null;
      await expect(serviceInstance.processCalculation(invalidPoliticalResults))
        .rejects
        .toThrow('Political results are required for global stability analysis');
    });
  });

  describe('analyzeGlobalStability', () => {
    const politicalResults = {
      'United States': {
        politicalStability: { rating: 'Stable' }
      }
    };
    const params = { politicalResults };

    it('should call analyzer.analyzeGlobalStabilityPatterns and return formatted result', async () => {
      const result = await serviceInstance.analyzeGlobalStability(params);

      expect(mockGlobalStabilityAnalyzer.analyzeGlobalStabilityPatterns).toHaveBeenCalledWith(politicalResults);
      expect(result.success).toBe(true);
      expect(result.data.stabilityPatterns).toBeDefined();
      expect(result.metadata.calculationType).toBe('global_stability_patterns');
    });

    it('should handle errors from analyzer.analyzeGlobalStabilityPatterns', async () => {
      mockGlobalStabilityAnalyzer.analyzeGlobalStabilityPatterns.mockRejectedValue(new Error('Analyzer error'));
      const result = await serviceInstance.analyzeGlobalStability(params);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Analyzer error');
    });
  });

  describe('identifyGlobalLeadershipPatterns', () => {
    const politicalResults = {
      'United States': {
        leadershipAnalysis: { leadershipTransitions: ['Election'] }
      }
    };
    const params = { politicalResults };

    it('should call analyzer.identifyGlobalLeadershipPatterns and return formatted result', async () => {
      const result = await serviceInstance.identifyGlobalLeadershipPatterns(params);

      expect(mockGlobalStabilityAnalyzer.identifyGlobalLeadershipPatterns).toHaveBeenCalledWith(politicalResults);
      expect(result.success).toBe(true);
      expect(result.data.leadershipTransitions).toBeDefined();
      expect(result.metadata.calculationType).toBe('global_leadership_patterns');
    });
  });

  describe('assessGlobalPoliticalTensions', () => {
    const politicalResults = {
      'Syria': {
        politicalStability: { rating: 'Unstable' }
      }
    };
    const params = { politicalResults };

    it('should call analyzer.assessGlobalPoliticalTensions and return formatted result', async () => {
      const result = await serviceInstance.assessGlobalPoliticalTensions(params);

      expect(mockGlobalStabilityAnalyzer.assessGlobalPoliticalTensions).toHaveBeenCalledWith(politicalResults);
      expect(result.success).toBe(true);
      expect(result.data.tensionLevels).toBeDefined();
      expect(result.metadata.calculationType).toBe('global_political_tensions');
    });
  });

  describe('identifyDiplomaticOpportunities', () => {
    const politicalResults = {
      'Germany': {
        internationalInfluence: { relationshipStrength: 'Strong' }
      }
    };
    const params = { politicalResults };

    it('should call analyzer.identifyDiplomaticOpportunities and return formatted result', async () => {
      const result = await serviceInstance.identifyDiplomaticOpportunities(params);

      expect(mockGlobalStabilityAnalyzer.identifyDiplomaticOpportunities).toHaveBeenCalledWith(politicalResults);
      expect(result.success).toBe(true);
      expect(result.data.opportunities).toBeDefined();
      expect(result.metadata.calculationType).toBe('diplomatic_opportunities');
    });
  });

  describe('generateGlobalStabilityReport', () => {
    const politicalResults = {
      'United States': {
        politicalStability: { rating: 'Stable' },
        leadershipAnalysis: { leadershipTransitions: ['Election'] },
        internationalInfluence: { relationshipStrength: 'Strong' }
      }
    };
    const params = { politicalResults, focusArea: 'all' };

    it('should call all analysis methods and return a comprehensive report', async () => {
      const result = await serviceInstance.generateGlobalStabilityReport(params);

      expect(mockGlobalStabilityAnalyzer.analyzeGlobalStabilityPatterns).toHaveBeenCalled();
      expect(mockGlobalStabilityAnalyzer.identifyGlobalLeadershipPatterns).toHaveBeenCalled();
      expect(mockGlobalStabilityAnalyzer.assessGlobalPoliticalTensions).toHaveBeenCalled();
      expect(mockGlobalStabilityAnalyzer.identifyDiplomaticOpportunities).toHaveBeenCalled();

      expect(result.success).toBe(true);
      expect(result.data.stabilityAnalysis).toBeDefined();
      expect(result.data.leadershipPatterns).toBeDefined();
      expect(result.data.politicalTensions).toBeDefined();
      expect(result.data.diplomaticOpportunities).toBeDefined();
      expect(result.data.integratedAssessment).toBeDefined();
      expect(result.data.strategicRecommendations).toBeDefined();
      expect(result.metadata.calculationType).toBe('comprehensive_global_stability_report');
    });

    it('should handle errors during report generation', async () => {
      mockGlobalStabilityAnalyzer.analyzeGlobalStabilityPatterns.mockRejectedValue(new Error('Report error'));
      const result = await serviceInstance.generateGlobalStabilityReport(params);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Report error');
    });
  });

  describe('getHealthStatus', () => {
    it('should return a healthy status when operational', async () => {
      const status = await serviceInstance.getHealthStatus();
      expect(status.status).toBe('healthy');
      expect(status.features).toBeDefined();
      expect(status.features.analysisTypes).toContain('stability');
      expect(status.features.countryCoverage).toBe('Global');
    });
  });

  describe('getMetadata', () => {
    it('should return correct metadata', () => {
      const metadata = serviceInstance.getMetadata();
      expect(metadata.name).toBe('GlobalStabilityAnalysisService');
      expect(metadata.category).toBe('global_political');
      expect(metadata.methods).toContain('analyzeGlobalStability');
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
      const consoleWarnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
      const politicalResults = 'not-an-object'; // Invalid format
      
      expect(() => serviceInstance.validate(politicalResults)).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Political results may not be in the expected format');
      consoleWarnSpy.mockRestore();
    });
  });
});