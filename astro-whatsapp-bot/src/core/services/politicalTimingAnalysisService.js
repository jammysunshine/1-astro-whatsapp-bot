const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure
const { PoliticalTimingAnalyzer } = require('./calculators/PoliticalTimingAnalyzer');

/**
 * PoliticalTimingAnalysisService - Specialized service for analyzing political timing 
 * and identifying favorable/challenging periods for political activities
 *
 * Provides comprehensive analysis of when political developments are likely to occur
 * based on planetary positions, transits, and mundane astrological principles.
 */
class PoliticalTimingAnalysisService extends ServiceTemplate {
  constructor() {
    super('PoliticalTimingAnalyzer');
    this.serviceName = 'PoliticalTimingAnalysisService';
    this.calculatorPath = './calculators/PoliticalTimingAnalyzer';
    logger.info('PoliticalTimingAnalysisService initialized');
  }

  async processCalculation(chartData) {
    try {
      // Validate input
      this.validate(chartData);

      // Create an instance of the analyzer
      const analyzer = new PoliticalTimingAnalyzer();
      
      // Generate political timing analysis
      const result = await analyzer.analyzePoliticalTiming(chartData);

      return result;
    } catch (error) {
      logger.error('PoliticalTimingAnalysisService calculation error:', error);
      throw new Error(`Political timing analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze political timing for specific country
   * @param {Object} params - Analysis parameters
   * @param {Object} params.chartData - Chart data for analysis
   * @param {Object} params.rulership - Country rulership data (optional)
   * @returns {Object} Political timing analysis
   */
  async analyzePoliticalTiming(params) {
    try {
      this.validateParams(params, ['chartData']);

      const { chartData, rulership } = params;

      // Create analyzer
      const analyzer = new PoliticalTimingAnalyzer();
      
      // Generate political timing analysis
      const results = await analyzer.analyzePoliticalTiming(chartData, rulership);

      return {
        success: true,
        data: {
          favorablePeriods: results.favorablePeriods,
          challengingPeriods: results.challengingPeriods,
          majorTransitionPeriods: results.majorTransitionPeriods,
          stabilityPeriods: results.stabilityPeriods,
          electionOpportunities: results.electionOpportunities,
          legislativeWindows: results.legislativeWindows,
          diplomaticOpportunities: results.diplomaticOpportunities,
          crisisPotential: results.crisisPotential,
          leadershipTransitionWindows: results.leadershipTransitionWindows
        },
        metadata: {
          calculationType: 'political_timing_analysis',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error in analyzePoliticalTiming:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'political_timing_analysis',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Identify favorable political periods
   * @param {Object} params - Analysis parameters
   * @param {Object} params.chartData - Chart data for analysis
   * @param {Object} params.rulership - Country rulership data (optional)
   * @returns {Object} Favorable periods analysis
   */
  async identifyFavorablePoliticalPeriods(params) {
    try {
      this.validateParams(params, ['chartData']);

      const { chartData, rulership } = params;

      // Create analyzer
      const analyzer = new PoliticalTimingAnalyzer();
      
      // Generate favorable periods analysis
      const periods = await analyzer.identifyFavorablePoliticalPeriods(chartData, rulership);

      return {
        success: true,
        data: {
          periods,
          totalFavorablePeriods: periods.length,
          recommendations: this.generateFavorableRecommendations(periods)
        },
        metadata: {
          calculationType: 'favorable_political_periods',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error in identifyFavorablePoliticalPeriods:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'favorable_political_periods',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Identify challenging political periods
   * @param {Object} params - Analysis parameters
   * @param {Object} params.chartData - Chart data for analysis
   * @param {Object} params.rulership - Country rulership data (optional)
   * @returns {Object} Challenging periods analysis
   */
  async identifyChallengingPoliticalPeriods(params) {
    try {
      this.validateParams(params, ['chartData']);

      const { chartData, rulership } = params;

      // Create analyzer
      const analyzer = new PoliticalTimingAnalyzer();
      
      // Generate challenging periods analysis
      const periods = await analyzer.identifyChallengingPoliticalPeriods(chartData, rulership);

      return {
        success: true,
        data: {
          periods,
          totalChallengingPeriods: periods.length,
          riskLevel: this.assessOverallRiskLevel(periods),
          mitigationStrategies: this.generateMitigationStrategies(periods)
        },
        metadata: {
          calculationType: 'challenging_political_periods',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error in identifyChallengingPoliticalPeriods:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'challenging_political_periods',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Analyze major political transition periods
   * @param {Object} params - Analysis parameters
   * @param {Object} params.chartData - Chart data for analysis
   * @param {Object} params.rulership - Country rulership data (optional)
   * @returns {Object} Major transition analysis
   */
  async analyzeMajorTransitions(params) {
    try {
      this.validateParams(params, ['chartData']);

      const { chartData, rulership } = params;

      // Create analyzer
      const analyzer = new PoliticalTimingAnalyzer();
      
      // Generate major transitions analysis
      const transitions = await analyzer.identifyMajorTransitions(chartData, rulership);

      return {
        success: true,
        data: {
          transitions,
          transitionTypes: this.getTransitionTypes(transitions),
          timingPatterns: this.identifyTimingPatterns(transitions)
        },
        metadata: {
          calculationType: 'major_political_transitions',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error in analyzeMajorTransitions:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'major_political_transitions',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Generate comprehensive political timing report
   * @param {Object} params - Analysis parameters
   * @param {Object} params.chartData - Chart data for analysis
   * @param {Object} params.rulership - Country rulership data (optional)
   * @param {string} params.scope - Scope of analysis ('short', 'medium', 'long')
   * @returns {Object} Comprehensive political timing report
   */
  async generatePoliticalTimingReport(params) {
    try {
      this.validateParams(params, ['chartData']);

      const { chartData, rulership, scope = 'medium' } = params;

      // Run all timing analyses
      const [
        timingAnalysis,
        favorablePeriods,
        challengingPeriods,
        majorTransitions
      ] = await Promise.all([
        this.analyzePoliticalTiming({ chartData, rulership }),
        this.identifyFavorablePoliticalPeriods({ chartData, rulership }),
        this.identifyChallengingPoliticalPeriods({ chartData, rulership }),
        this.analyzeMajorTransitions({ chartData, rulership })
      ]);

      return {
        success: true,
        data: {
          timingAnalysis: timingAnalysis.data,
          favorablePeriods: favorablePeriods.data,
          challengingPeriods: challengingPeriods.data,
          majorTransitions: majorTransitions.data,
          riskAssessment: this.generateRiskAssessment(
            favorablePeriods.data, 
            challengingPeriods.data
          ),
          opportunityAnalysis: this.generateOpportunityAnalysis(
            favorablePeriods.data,
            majorTransitions.data
          ),
          actionRecommendations: this.generateActionRecommendations(
            favorablePeriods.data,
            challengingPeriods.data,
            majorTransitions.data
          ),
          timelineOverview: this.generateTimelineOverview(
            timingAnalysis.data,
            scope
          )
        },
        metadata: {
          calculationType: 'comprehensive_political_timing_report',
          timestamp: new Date().toISOString(),
          scope: scope
        }
      };
    } catch (error) {
      logger.error('❌ Error in generatePoliticalTimingReport:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'comprehensive_political_timing_report',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Generate favorable recommendations
   * @param {Array} periods - Favorable periods
   * @returns {Array} Recommendations
   */
  generateFavorableRecommendations(periods) {
    const recommendations = [];

    // Look for specific opportunity types
    const hasDiplomaticWindow = periods.some(p => p.type === 'diplomacy');
    const hasLegislativeWindow = periods.some(p => p.type === 'policy');
    const hasExpansionWindow = periods.some(p => p.type === 'expansion');

    if (hasDiplomaticWindow) {
      recommendations.push('Optimize for diplomatic initiatives during favorable periods');
    }

    if (hasLegislativeWindow) {
      recommendations.push('Pursue policy development during legislative windows');
    }

    if (hasExpansionWindow) {
      recommendations.push('Focus on growth-oriented initiatives during expansion periods');
    }

    if (recommendations.length === 0) {
      recommendations.push('Monitor planetary positions for optimal timing opportunities');
    }

    return recommendations;
  }

  /**
   * Assess overall risk level
   * @param {Array} periods - Challenging periods
   * @returns {string} Risk level
   */
  assessOverallRiskLevel(periods) {
    if (periods.length === 0) return 'Low';
    if (periods.length <= 2) return 'Moderate';
    if (periods.length <= 4) return 'High';
    return 'Very High';
  }

  /**
   * Generate mitigation strategies
   * @param {Array} periods - Challenging periods
   * @returns {Array} Mitigation strategies
   */
  generateMitigationStrategies(periods) {
    const strategies = [
      'Maintain flexible decision-making frameworks',
      'Prepare contingency plans for challenging periods',
      'Focus on diplomatic and collaborative approaches'
    ];

    // Add specific strategies based on challenge types
    if (periods.some(p => p.type === 'conflict')) {
      strategies.push('Emphasize conflict resolution mechanisms');
    }

    if (periods.some(p => p.type === 'restriction')) {
      strategies.push('Build in extra time for bureaucratic processes');
    }

    if (periods.some(p => p.type === 'disruption')) {
      strategies.push('Implement robust backup systems and protocols');
    }

    return strategies;
  }

  /**
   * Get transition types
   * @param {Array} transitions - Major transitions
   * @returns {Array} Transition types
   */
  getTransitionTypes(transitions) {
    const types = [...new Set(transitions.map(t => t.type))];
    return types;
  }

  /**
   * Identify timing patterns
   * @param {Array} transitions - Major transitions
   * @returns {Object} Timing patterns
   */
  identifyTimingPatterns(transitions) {
    const patternCounts = {};
    transitions.forEach(t => {
      patternCounts[t.type] = (patternCounts[t.type] || 0) + 1;
    });

    return {
      distribution: patternCounts,
      dominantType: Object.keys(patternCounts).reduce((a, b) => 
        patternCounts[a] > patternCounts[b] ? a : b
      )
    };
  }

  /**
   * Generate risk assessment
   * @param {Object} favorableData - Favorable periods data
   * @param {Object} challengingData - Challenging periods data
   * @returns {Object} Risk assessment
   */
  generateRiskAssessment(favorableData, challengingData) {
    return {
      favorableRatio: favorableData.totalFavorablePeriods / 
        (favorableData.totalFavorablePeriods + challengingData.totalChallengingPeriods || 1),
      overallRisk: challengingData.riskLevel,
      opportunityLevel: favorableData.totalFavorablePeriods > challengingData.totalChallengingPeriods ? 'High' : 'Moderate',
      recommendation: challengingData.riskLevel === 'Low' ? 
        'Aggressive policy initiatives suitable' : 
        'Cautious approach recommended'
    };
  }

  /**
   * Generate opportunity analysis
   * @param {Object} favorableData - Favorable periods data
   * @param {Object} transitionData - Major transitions data
   * @returns {Object} Opportunity analysis
   */
  generateOpportunityAnalysis(favorableData, transitionData) {
    return {
      availableOpportunities: favorableData.totalFavorablePeriods,
      transitionOpportunities: transitionData.transitionTypes.length,
      strategicWindows: this.combineStrategicWindows(favorableData, transitionData)
    };
  }

  /**
   * Generate action recommendations
   * @param {Object} favorableData - Favorable periods data
   * @param {Object} challengingData - Challenging periods data
   * @param {Object} transitionData - Major transitions data
   * @returns {Array} Action recommendations
   */
  generateActionRecommendations(favorableData, challengingData, transitionData) {
    const recommendations = [];

    recommendations.push(
      `Leverage ${favorableData.totalFavorablePeriods} favorable periods for strategic initiatives`
    );

    recommendations.push(
      `Prepare for ${challengingData.totalChallengingPeriods} challenging periods with mitigation strategies`
    );

    recommendations.push(
      `Monitor ${transitionData.transitionTypes.length} major transition types for timing opportunities`
    );

    return recommendations;
  }

  /**
   * Generate timeline overview
   * @param {Object} timingData - Timing analysis data
   * @param {string} scope - Analysis scope
   * @returns {Object} Timeline overview
   */
  generateTimelineOverview(timingData, scope) {
    const overview = {
      scope,
      totalPeriods: timingData.favorablePeriods.length + timingData.challengingPeriods.length,
      favorableCount: timingData.favorablePeriods.length,
      challengingCount: timingData.challengingPeriods.length,
      trendDirection: timingData.favorablePeriods.length > timingData.challengingPeriods.length ? 
        'positive' : 'cautious'
    };

    return overview;
  }

  /**
   * Combine strategic windows
   * @param {Object} favorableData - Favorable periods data
   * @param {Object} transitionData - Major transitions data
   * @returns {Array} Strategic windows
   */
  combineStrategicWindows(favorableData, transitionData) {
    const windows = [];

    favorableData.periods.forEach(period => {
      windows.push({
        type: 'favorable',
        timing: period.timing || period.description,
        duration: period.duration,
        planetaryFactor: period.planetaryFactor
      });
    });

    transitionData.transitions.forEach(transition => {
      windows.push({
        type: 'transition',
        timing: transition.timing || transition.description,
        planetaryFactor: transition.planetaryFactor
      });
    });

    return windows;
  }

  formatResult(result) {
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      service: this.serviceName
    };
  }

  validate(chartData) {
    if (!chartData) {
      throw new Error('Chart data is required for political timing analysis');
    }

    // Chart data should have at least some planetary positions
    if (!chartData.planetaryPositions) {
      logger.warn('Chart data has limited planetary information');
    }

    return true;
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'political_timing',
      methods: [
        'analyzePoliticalTiming',
        'identifyFavorablePoliticalPeriods',
        'identifyChallengingPoliticalPeriods', 
        'analyzeMajorTransitions',
        'generatePoliticalTimingReport'
      ],
      dependencies: ['PoliticalTimingAnalyzer']
    };
  }

  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          analysisTypes: ['favorable', 'challenging', 'transitional'],
          timingScopes: ['short', 'medium', 'long']
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

module.exports = PoliticalTimingAnalysisService;