const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure
const { GlobalStabilityAnalyzer } = require('./calculators/GlobalStabilityAnalyzer');

/**
 * GlobalStabilityAnalysisService - Specialized service for analyzing global political stability
 * and processing political results across multiple countries to identify global trends
 *
 * Provides comprehensive analysis of global stability patterns, leadership transitions,
 * international tensions, and diplomatic opportunities using mundane astrology techniques.
 */
class GlobalStabilityAnalysisService extends ServiceTemplate {
  constructor() {
    super('GlobalStabilityAnalyzer');
    this.serviceName = 'GlobalStabilityAnalysisService';
    this.calculatorPath = './calculators/GlobalStabilityAnalyzer';
    logger.info('GlobalStabilityAnalysisService initialized');
  }

  async processCalculation(politicalResults) {
    try {
      // Validate input
      this.validate(politicalResults);

      // Create an instance of the analyzer
      const analyzer = new GlobalStabilityAnalyzer();
      
      // Generate global stability analysis
      const result = await analyzer.analyzeGlobalStability(politicalResults);

      return result;
    } catch (error) {
      logger.error('GlobalStabilityAnalysisService calculation error:', error);
      throw new Error(`Global stability analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze global stability patterns
   * @param {Object} params - Analysis parameters
   * @param {Object} params.politicalResults - Political analysis results for all countries
   * @returns {Object} Global stability analysis
   */
  async analyzeGlobalStability(params) {
    try {
      this.validateParams(params, ['politicalResults']);

      const { politicalResults } = params;

      // Create analyzer
      const analyzer = new GlobalStabilityAnalyzer();
      
      // Generate global stability analysis
      const results = await analyzer.analyzeGlobalStabilityPatterns(politicalResults);

      return {
        success: true,
        data: {
          stabilityPatterns: results,
          stableCount: results.stableCount || 0,
          unstableCount: results.unstableCount || 0,
          globalTrend: results.globalTrend || 'Unknown',
          keyIndicators: this.extractKeyIndicators(politicalResults)
        },
        metadata: {
          calculationType: 'global_stability_patterns',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error in analyzeGlobalStability:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'global_stability_patterns',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Identify global leadership patterns
   * @param {Object} params - Analysis parameters
   * @param {Object} params.politicalResults - Political analysis results for all countries
   * @returns {Object} Global leadership analysis
   */
  async identifyGlobalLeadershipPatterns(params) {
    try {
      this.validateParams(params, ['politicalResults']);

      const { politicalResults } = params;

      // Create analyzer
      const analyzer = new GlobalStabilityAnalyzer();
      
      // Generate leadership pattern analysis
      const results = await analyzer.identifyGlobalLeadershipPatterns(politicalResults);

      return {
        success: true,
        data: {
          leadershipTransitions: results.transitions || [],
          leadershipQuality: results.quality || 'Mixed',
          powerShifts: results.powerShifts || [],
          leadershipChallenges: results.challenges || []
        },
        metadata: {
          calculationType: 'global_leadership_patterns',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error in identifyGlobalLeadershipPatterns:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'global_leadership_patterns',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Assess global political tensions
   * @param {Object} params - Analysis parameters
   * @param {Object} params.politicalResults - Political analysis results for all countries
   * @returns {Object} Global tensions assessment
   */
  async assessGlobalPoliticalTensions(params) {
    try {
      this.validateParams(params, ['politicalResults']);

      const { politicalResults } = params;

      // Create analyzer
      const analyzer = new GlobalStabilityAnalyzer();
      
      // Generate tensions assessment
      const results = await analyzer.assessGlobalPoliticalTensions(politicalResults);

      return {
        success: true,
        data: {
          tensionLevels: results.levels || [],
          conflictHotspots: results.hotspots || [],
          diplomaticOpportunities: results.opportunities || [],
          escalationRisks: results.risks || []
        },
        metadata: {
          calculationType: 'global_political_tensions',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error in assessGlobalPoliticalTensions:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'global_political_tensions',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Identify diplomatic opportunities
   * @param {Object} params - Analysis parameters
   * @param {Object} params.politicalResults - Political analysis results for all countries
   * @returns {Object} Diplomatic opportunities
   */
  async identifyDiplomaticOpportunities(params) {
    try {
      this.validateParams(params, ['politicalResults']);

      const { politicalResults } = params;

      // Create analyzer
      const analyzer = new GlobalStabilityAnalyzer();
      
      // Generate diplomatic opportunities analysis
      const results = await analyzer.identifyDiplomaticOpportunities(politicalResults);

      return {
        success: true,
        data: {
          opportunities: results.opportunities || [],
          timingWindows: results.timingWindows || [],
          favorableConditions: results.favorableConditions || [],
          partnershipPotential: results.potential || []
        },
        metadata: {
          calculationType: 'diplomatic_opportunities',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error in identifyDiplomaticOpportunities:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'diplomatic_opportunities',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Generate comprehensive global stability report
   * @param {Object} params - Analysis parameters
   * @param {Object} params.politicalResults - Political analysis results for all countries
   * @param {string} params.focusArea - Focus area ('stability', 'leadership', 'tensions', 'diplomatic', 'all')
   * @returns {Object} Comprehensive stability report
   */
  async generateGlobalStabilityReport(params) {
    try {
      this.validateParams(params, ['politicalResults']);

      const { politicalResults, focusArea = 'all' } = params;

      // Run all stability analyses
      const [
        stabilityAnalysis,
        leadershipPatterns,
        politicalTensions,
        diplomaticOpportunities
      ] = await Promise.all([
        this.analyzeGlobalStability({ politicalResults }),
        this.identifyGlobalLeadershipPatterns({ politicalResults }),
        this.assessGlobalPoliticalTensions({ politicalResults }),
        this.identifyDiplomaticOpportunities({ politicalResults })
      ]);

      return {
        success: true,
        data: {
          stabilityAnalysis: stabilityAnalysis.data,
          leadershipPatterns: leadershipPatterns.data,
          politicalTensions: politicalTensions.data,
          diplomaticOpportunities: diplomaticOpportunities.data,
          integratedAssessment: this.generateIntegratedAssessment(
            stabilityAnalysis.data,
            leadershipPatterns.data,
            politicalTensions.data,
            diplomaticOpportunities.data
          ),
          strategicRecommendations: this.generateStrategicRecommendations(
            stabilityAnalysis.data,
            politicalTensions.data,
            diplomaticOpportunities.data
          )
        },
        metadata: {
          calculationType: 'comprehensive_global_stability_report',
          timestamp: new Date().toISOString(),
          focusArea: focusArea
        }
      };
    } catch (error) {
      logger.error('❌ Error in generateGlobalStabilityReport:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'comprehensive_global_stability_report',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Extract key indicators from political results
   * @param {Object} politicalResults - Political results
   * @returns {Array} Key indicators
   */
  extractKeyIndicators(politicalResults) {
    const indicators = [];
    
    // Extract key stability indicators
    if (politicalResults && typeof politicalResults === 'object') {
      const stableCountries = Object.values(politicalResults).filter(
        result => result.stability && result.stability.rating === 'Stable'
      ).length;
      
      const unstableCountries = Object.values(politicalResults).filter(
        result => result.stability && result.stability.rating === 'Unstable'
      ).length;
      
      indicators.push(
        `Stable countries: ${stableCountries}`,
        `Unstable countries: ${unstableCountries}`
      );
    }
    
    return indicators;
  }

  /**
   * Generate integrated assessment
   * @param {Object} stabilityData - Stability analysis data
   * @param {Object} leadershipData - Leadership analysis data
   * @param {Object} tensionsData - Tensions analysis data
   * @param {Object} diplomaticData - Diplomatic analysis data
   * @returns {Object} Integrated assessment
   */
  generateIntegratedAssessment(stabilityData, leadershipData, tensionsData, diplomaticData) {
    return {
      overallStability: stabilityData.globalTrend,
      leadershipClimate: leadershipData.leadershipQuality,
      tensionClimate: tensionsData.tensionLevels.length > 0 ? 'Active tensions' : 'Generally stable',
      diplomaticClimate: diplomaticData.opportunities.length > 0 ? 'Diplomatic potential' : 'Limited opportunities',
      primaryConcerns: this.identifyPrimaryConcerns(tensionsData, leadershipData),
      primaryOpportunities: this.identifyPrimaryOpportunities(diplomaticData, stabilityData)
    };
  }

  /**
   * Identify primary concerns
   * @param {Object} tensionsData - Tensions analysis data
   * @param {Object} leadershipData - Leadership analysis data
   * @returns {Array} Primary concerns
   */
  identifyPrimaryConcerns(tensionsData, leadershipData) {
    const concerns = [];
    
    if (tensionsData.conflictHotspots.length > 0) {
      concerns.push('Regional conflict hotspots identified');
    }
    
    if (leadershipData.leadershipChallenges.length > 0) {
      concerns.push('Leadership transition challenges');
    }
    
    return concerns;
  }

  /**
   * Identify primary opportunities
   * @param {Object} diplomaticData - Diplomatic analysis data
   * @param {Object} stabilityData - Stability analysis data
   * @returns {Array} Primary opportunities
   */
  identifyPrimaryOpportunities(diplomaticData, stabilityData) {
    const opportunities = [];
    
    if (diplomaticData.opportunities.length > 0) {
      opportunities.push('Diplomatic engagement possibilities');
    }
    
    if (stabilityData.stableCount > stabilityData.unstableCount) {
      opportunities.push('Relative global stability for initiatives');
    }
    
    return opportunities;
  }

  /**
   * Generate strategic recommendations
   * @param {Object} stabilityData - Stability analysis data
   * @param {Object} tensionsData - Tensions analysis data
   * @param {Object} diplomaticData - Diplomatic analysis data
   * @returns {Array} Strategic recommendations
   */
  generateStrategicRecommendations(stabilityData, tensionsData, diplomaticData) {
    const recommendations = [];
    
    if (stabilityData.stableCount > stabilityData.unstableCount) {
      recommendations.push('Favorable conditions for multilateral initiatives');
    } else {
      recommendations.push('Focus on diplomatic solutions during unstable period');
    }
    
    if (tensionsData.conflictHotspots.length > 0) {
      recommendations.push('Monitor and prepare for potential escalation in hotspot areas');
    }
    
    if (diplomaticData.opportunities.length > 0) {
      recommendations.push('Pursue diplomatic opportunities during favorable planetary alignments');
    }
    
    return recommendations;
  }

  formatResult(result) {
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      service: this.serviceName
    };
  }

  validate(politicalResults) {
    if (!politicalResults) {
      throw new Error('Political results are required for global stability analysis');
    }

    if (typeof politicalResults !== 'object') {
      logger.warn('Political results may not be in the expected format');
    }

    return true;
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'global_political',
      methods: [
        'analyzeGlobalStability',
        'identifyGlobalLeadershipPatterns', 
        'assessGlobalPoliticalTensions',
        'identifyDiplomaticOpportunities',
        'generateGlobalStabilityReport'
      ],
      dependencies: ['GlobalStabilityAnalyzer']
    };
  }

  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          analysisTypes: ['stability', 'leadership', 'tensions', 'diplomatic'],
          countryCoverage: 'Global'
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = GlobalStabilityAnalysisService;