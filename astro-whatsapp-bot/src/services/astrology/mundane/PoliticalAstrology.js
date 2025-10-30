const { MundaneConfig } = require('./MundaneConfig');
const { PoliticalStabilityAssessor } = require('./PoliticalStabilityAssessor');
const { LeadershipAnalyzer } = require('./LeadershipAnalyzer');
const { GovernmentChangePredictor } = require('./GovernmentChangePredictor');
const { InternationalRelationsAnalyzer } = require('./InternationalRelationsAnalyzer');
const { PoliticalEventIdentifier } = require('./PoliticalEventIdentifier');
const { PoliticalTimingAnalyzer } = require('./PoliticalTimingAnalyzer');
const { PoliticalRecommendationGenerator } = require('./PoliticalRecommendationGenerator');

/**
 * PoliticalAstrology - World leadership and government analysis
 * Analyzes political events, leadership changes, and governmental transformations
 * using planetary rulerships and mundane astrological principles
 */
class PoliticalAstrology {
  /**
   * @param {MundaneConfig} config - Mundane configuration instance
   */
  constructor(config = new MundaneConfig()) {
    this.config = config;
    this.stabilityAssessor = new PoliticalStabilityAssessor();
    this.leadershipAnalyzer = new LeadershipAnalyzer();
    this.governmentChangePredictor = new GovernmentChangePredictor();
    this.internationalRelationsAnalyzer = new InternationalRelationsAnalyzer();
    this.politicalEventIdentifier = new PoliticalEventIdentifier();
    this.timingAnalyzer = new PoliticalTimingAnalyzer();
    this.recommendationGenerator = new PoliticalRecommendationGenerator();
  }

  /**
   * Analyze political situation for a country or region
   * @param {string} country - Country name
   * @param {Object} chart - Astrological chart data
   * @returns {Object} Political analysis
   */
  analyzePoliticalClimate(country, chart) {
    try {
      const rulership = this.config.getCountryRulership(country);

      const analysis = {
        country,
        rulingPlanets: rulership?.planets || [],
        politicalStability: this.stabilityAssessor.assessPoliticalStability(chart, rulership, country),
        leadershipAnalysis: this.leadershipAnalyzer.analyzeLeadershipEnergies(chart, rulership),
        governmentChanges: this.governmentChangePredictor.predictGovernmentChanges(chart, rulership),
        internationalInfluence: this.internationalRelationsAnalyzer.assessInternationalRelations(chart, rulership, country),
        politicalEvents: this.politicalEventIdentifier.identifyPoliticalEvents(chart),
        timingAnalysis: this.timingAnalyzer.analyzePoliticalTiming(chart, rulership),
        recommendations: this.recommendationGenerator.generatePoliticalRecommendations(analysis)
      };

      return analysis;
    } catch (error) {
      console.error(`Error analyzing political climate for ${country}:`, error);
      return {
        country,
        error: error.message,
        politicalStability: { rating: 'Unknown', factors: [] },
        recommendations: ['Consult professional political astrologer for accurate analysis']
      };
    }
  }

  /**
   * Health check for PoliticalAstrology
   * @returns {Object} Health status
   */
  healthCheck() {
    try {
      const configHealth = this.config.healthCheck();

      // Test basic political analysis
      const testAnalysis = this.analyzePoliticalClimate('United States', {
        planetaryPositions: {
          sun: { house: 10, sign: 'Capricorn', longitude: 285 },
          saturn: { house: 7, sign: 'Aquarius', longitude: 312 },
          mars: { house: 1, sign: 'Aries', longitude: 15 }
        }
      });

      const validAnalysis = testAnalysis && testAnalysis.country && testAnalysis.politicalStability;

      return {
        healthy: configHealth.healthy && validAnalysis,
        configStatus: configHealth,
        politicalAnalysis: validAnalysis,
        version: '1.0.0',
        capabilities: [
          'Political Stability Assessment',
          'Leadership Energy Analysis',
          'Government Change Prediction',
          'International Relations Analysis',
          'Political Event Identification',
          'Successor Potential Analysis',
          'Political Recommendations'
        ],
        status: configHealth.healthy && validAnalysis ? 'Operational' : 'Issues Detected'
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = { PoliticalAstrology };