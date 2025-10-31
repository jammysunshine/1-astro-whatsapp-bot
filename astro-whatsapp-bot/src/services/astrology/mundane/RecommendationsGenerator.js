const logger = require('../../../utils/logger');

/**
 * RecommendationsGenerator - Generates mundane astrology recommendations
 * Provides diplomatic, strategic, and analytical guidance based on chart analysis
 */
class RecommendationsGenerator {
  constructor() {
    logger.info('Module: RecommendationsGenerator loaded for geopolitical guidance');
  }

  /**
   * Generate global recommendations based on complete analysis
   * @param {Object} analysis - Complete mundane analysis
   * @returns {Array} Recommendations
   */
  generateGlobalRecommendations(analysis) {
    const recommendations = [];

    // Political recommendations
    if (analysis.politicalAnalysis.globalTrends) {
      if (analysis.politicalAnalysis.globalTrends.stabilityPatterns.overallStability === 'High') {
        recommendations.push('Current planetary alignments support international cooperation and diplomatic initiatives');
        recommendations.push('Build on existing governmental strengths and international alliances');
      } else {
        recommendations.push('Monitor political developments closely during challenging planetary periods');
      }
    }

    // Economic recommendations
    if (analysis.economicAnalysis.marketCycles) {
      recommendations.push('Consider economic strategies aligned with current planetary market cycles');
      recommendations.push('Diversify investments to balance astrological market influences');
    }

    // Natural events awareness
    if (analysis.naturalEvents.catastrophicEvents) {
      recommendations.push('Stay informed about natural events and maintain emergency preparedness');
    }

    // Timing-based recommendations
    if (analysis.timingAnalysis.auspiciousPeriods) {
      recommendations.push('Plan important international initiatives during favorable astro periods');
    }

    // General global consciousness advice
    recommendations.push('Maintain awareness of global interconnections in an interdependent world');

    return recommendations.slice(0, 3); // Limit to top recommendations
  }
}

module.exports = { RecommendationsGenerator };
