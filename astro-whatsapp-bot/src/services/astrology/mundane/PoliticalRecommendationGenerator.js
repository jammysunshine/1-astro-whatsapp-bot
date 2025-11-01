class PoliticalRecommendationGenerator {
  /**
   * Generate political recommendations
   * @param {Object} analysis - Complete political analysis
   * @returns {Array} Recommendations
   */
  generatePoliticalRecommendations(analysis) {
    const recommendations = [];

    // Base recommendations on stability rating
    if (analysis.politicalStability.rating === 'Very Stable') {
      recommendations.push(
        'Current leadership has strong planetary support - focus on continuing successful policies'
      );
      recommendations.push(
        'Build on existing governmental strengths and international alliances'
      );
    } else if (analysis.politicalStability.rating === 'Unstable') {
      recommendations.push(
        'Significant planetary changes indicate need for leadership adaptation and reform'
      );
      recommendations.push(
        'Consider diplomatic approaches to navigate challenging astrological periods'
      );
    }

    // Leadership-specific recommendations
    if (analysis.leadershipAnalysis.leadershipQualities.length > 0) {
      recommendations.push(
        `Emphasize leadership strengths: ${analysis.leadershipAnalysis.leadershipQualities[0]}`
      );
    }

    // International relations guidance
    if (analysis.internationalInfluence.conflicts.length > 0) {
      recommendations.push(
        'Address international conflicts diplomatically to manage astrological tensions'
      );
    }

    return recommendations;
  }
}

module.exports = { PoliticalRecommendationGenerator };
