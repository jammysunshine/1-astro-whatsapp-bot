const logger = require('../../../utils/logger');

/**
 * GlobalStabilityAnalyzer - Analyzes overall global political stability
 * Processes political results across multiple countries and identifies global trends
 */
class GlobalStabilityAnalyzer {
  constructor() {
    logger.info('Module: GlobalStabilityAnalyzer loaded for political stability analysis');
  }

  /**
   * Analyze global stability patterns across all countries
   * @param {Object} politicalResults - Political analysis results for all countries
   * @returns {Object} Global stability assessment
   */
  analyzeGlobalStabilityPatterns(politicalResults) {
    let stableCount = 0;
    let unstableCount = 0;

    Object.values(politicalResults).forEach(result => {
      if (result.politicalStability?.rating?.includes('Stable')) {
        stableCount++;
      } else if (result.politicalStability?.rating?.includes('Unstable')) {
        unstableCount++;
      }
    });

    return {
      overallStability: this.calculateOverallStability(stableCount, unstableCount),
      stableNations: stableCount,
      unstableNations: unstableCount,
      globalStabilityIndex: (stableCount / (stableCount + unstableCount)) * 100
    };
  }

  /**
   * Calculate overall global stability rating
   * @param {number} stable - Number of stable countries
   * @param {number} unstable - Number of unstable countries
   * @returns {string} Overall stability rating
   */
  calculateOverallStability(stable, unstable) {
    const total = stable + unstable;
    const stabilityPercentage = (stable / total) * 100;

    if (stabilityPercentage >= 70) { return 'High'; }
    if (stabilityPercentage >= 50) { return 'Moderate'; }
    if (stabilityPercentage >= 30) { return 'Low-Moderate'; }
    return 'Low';
  }

  /**
   * Identify global leadership transition patterns
   * @param {Object} politicalResults - Political results
   * @returns {Array} Leadership patterns
   */
  identifyGlobalLeadershipPatterns(politicalResults) {
    const patterns = [];

    Object.entries(politicalResults).forEach(([country, analysis]) => {
      if (analysis.leadershipAnalysis?.leadershipTransitions?.length > 0) {
        patterns.push({
          country,
          transitions: analysis.leadershipAnalysis.leadershipTransitions,
          timing: 'Medium-term (6-18 months)'
        });
      }
    });

    return patterns;
  }

  /**
   * Assess global political tensions
   * @param {Object} politicalResults - Political results
   * @returns {Array} Tension areas
   */
  assessGlobalPoliticalTensions(politicalResults) {
    const tensions = [];

    // Identify countries with Unstable or Very Unstable ratings
    Object.entries(politicalResults).forEach(([country, analysis]) => {
      const rating = analysis.politicalStability?.rating;
      if (rating && (rating.includes('Unstable') || rating.includes('Challenging'))) {
        tensions.push({
          country,
          rating,
          factors: analysis.politicalStability.factors || [],
          outlook: analysis.politicalStability.outlook
        });
      }
    });

    return tensions;
  }

  /**
   * Identify diplomatic opportunities
   * @param {Object} politicalResults - Political results
   * @returns {Array} Opportunities
   */
  identifyDiplomaticOpportunities(politicalResults) {
    const opportunities = [];

    // Look for stable countries with strong diplomatic potentials
    Object.entries(politicalResults).forEach(([country, analysis]) => {
      if (analysis.internationalInfluence?.relationshipStrength?.includes('Strong') ||
          analysis.politicalStability?.rating?.includes('Stable')) {
        opportunities.push(country);
      }
    });

    return opportunities;
  }
}

module.exports = { GlobalStabilityAnalyzer };
