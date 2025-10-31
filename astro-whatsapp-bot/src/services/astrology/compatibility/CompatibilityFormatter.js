const logger = require('../../../utils/logger');

/**
 * CompatibilityFormatter - Formats compatibility analysis results for display
 * Handles all output formatting and structured presentation
 */
class CompatibilityFormatter {
  constructor() {
    this.logger = logger;
  }

  /**
   * Format complete synastry results for user display
   * @param {Object} synastryResults - Complete synastry analysis
   * @param {Object} insights - Relationship insights
   * @param {Object} partnerInfo - Partner information
   * @returns {string} Formatted results string
   */
  formatSynastryResults(synastryResults, insights, partnerInfo) {
    try {
      let result = '';

      // Header
      result += '💕 *Synastry Analysis*\n';
      result += `🌟 ${insights.user?.name || 'You'} & ${partnerInfo?.name || 'Partner'}\n\n`;

      // Overall Score
      result += this.formatScoreSection(synastryResults.compatibilityScores);
      result += '\n';

      // Key Aspects Preview
      result += this.formatKeyAspects(synastryResults.interchartAspects);
      result += '\n';

      // Relationship Dynamics
      result += this.formatDynamics(insights.dynamics);
      result += '\n';

      // Strengths
      result += this.formatStrengths(insights.strengths);
      result += '\n';

      // Challenges
      result += this.formatChallenges(insights.challenges);
      result += '\n';

      // Wisdom
      result += `*💫 Astrological Wisdom:*\n${insights.advice || 'Consult professional guidance for deeper insights.'}`;
      result += '\n\n';

      // Footer
      result += '*🕉️ Remember:*\nAstrology reveals cosmic potentials. All relationships offer growth opportunities. Professional consultation recommended for complex patterns.';

      return result;
    } catch (error) {
      this.logger.error('Compatibility formatting error:', error);
      return '❌ Error formatting compatibility results. Please try again.';
    }
  }

  /**
   * Format compatibility score section
   * @param {Object} scores - Compatibility scores
   * @returns {string} Formatted score section
   */
  formatScoreSection(scores) {
    if (!scores) { return '🎯 *Compatibility Score:* Unable to calculate'; }
    const level = scores.level?.replace('_', ' ').toUpperCase() || 'UNKNOWN';
    return `🎯 *Compatibility Score:* ${scores.overall || 0}/100 (${level})`;
  }

  /**
   * Format key planetary aspects
   * @param {Array} aspects - Interchart aspects
   * @returns {string} Formatted aspects string
   */
  formatKeyAspects(aspects) {
    if (!aspects || aspects.length === 0) { return '*🔮 Planetary Aspects:* Analysis in progress'; }

    let result = '*🔮 Key Planetary Connections:*\n';
    const topAspects = aspects.slice(0, 3);

    topAspects.forEach((aspect, index) => {
      const emoji = aspect.type === 'harmonious' ? '💫' : aspect.type === 'challenging' ? '⚡' : '🔄';
      const aspectName = aspect.aspectName || this.getAspectName(aspect.aspect);
      result += `${emoji} ${aspect.planet1}-${aspect.planet2}: ${aspectName}\n`;
    });

    return result;
  }

  /**
   * Format relationship dynamics
   * @param {Object} dynamics - Relationship dynamics
   * @returns {string} Formatted dynamics string
   */
  formatDynamics(dynamics) {
    let result = '*🎭 Relationship Dynamics:*\n';

    const comm = dynamics.communication || 'Neutral';
    const intim = dynamics.intimacy || 'Developing';
    const stab = dynamics.stability || 'Grounding';

    result += `💬 Communication: ${comm}\n`;
    result += `💑 Intimacy: ${intim}\n`;
    result += `🛡️ Stability: ${stab}\n`;

    return result;
  }

  /**
   * Format relationship strengths
   * @param {Array} strengths - Relationship strengths
   * @returns {string} Formatted strengths string
   */
  formatStrengths(strengths) {
    if (!strengths || strengths.length === 0) { return '*💪 Strengths:* Analysis in progress'; }

    let result = '*💪 Relationship Strengths:*\n';
    strengths.forEach(strength => {
      result += `• ${strength}\n`;
    });

    return result.replace(/\n$/, ''); // Remove trailing newline
  }

  /**
   * Format relationship challenges
   * @param {Array} challenges - Relationship challenges
   * @returns {string} Formatted challenges string
   */
  formatChallenges(challenges) {
    if (!challenges || challenges.length === 0) { return '*⚠️ Growth Areas:* None identified'; }

    let result = '*⚠️ Growth Areas:*\n';
    challenges.forEach(challenge => {
      result += `• ${challenge}\n`;
    });

    return result.replace(/\n$/, ''); // Remove trailing newline
  }

  /**
   * Get aspect name from angle
   * @param {number} aspect - Aspect angle
   * @returns {string} Aspect name
   */
  getAspectName(aspect) {
    const aspectMap = {
      0: 'conjunction',
      60: 'sextile',
      90: 'square',
      120: 'trine',
      150: 'quincunx',
      180: 'opposition'
    };
    return aspectMap[aspect] || 'aspect';
  }

  /**
   * Format detailed aspects section
   * @param {Array} aspects - All interchart aspects
   * @returns {string} Detailed aspects format
   */
  formatDetailedAspects(aspects) {
    if (!aspects || aspects.length === 0) { return 'No aspect data available'; }

    let result = '*🔍 Detailed Planetary Aspects:*\n\n';
    aspects.slice(0, 10).forEach((aspect, index) => {
      const type = aspect.type === 'harmonious' ? '💫' : aspect.type === 'challenging' ? '⚡' : '🔄';
      const orbFormat = aspect.orb >= 0 ? `+${aspect.orb.toFixed(1)}°` : `${aspect.orb.toFixed(1)}°`;
      result += `${index + 1}. ${type} ${aspect.planet1}-${aspect.planet2} (${aspect.aspectName})\n`;
      result += `   Orb: ${orbFormat} | ${aspect.significance}\n\n`;
    });

    return result.trim();
  }

  /**
   * Format house overlays section
   * @param {Object} overlays - House overlays data
   * @returns {string} Formatted overlays string
   */
  formatHouseOverlays(overlays) {
    let result = '*🏠 Planetary House Overlays:*\n\n';

    // User planets in partner houses
    if (overlays.userInPartnerHouses) {
      result += '*Your planets in partner\'s chart:*\n';
      Object.entries(overlays.userInPartnerHouses).forEach(([planet, data]) => {
        result += `• ${planet} in partner's ${this.getOrdinal(data.house)} house: ${data.significance}\n`;
      });
    }

    result += '\n';

    // Partner planets in user houses
    if (overlays.partnerInUserHouses) {
      result += '*Partner\'s planets in your chart:*\n';
      Object.entries(overlays.partnerInUserHouses).forEach(([planet, data]) => {
        result += `• ${planet} in your ${this.getOrdinal(data.house)} house: ${data.significance}\n`;
      });
    }

    return result.trim();
  }

  /**
   * Get ordinal representation of house number
   * @param {number} house - House number
   * @returns {string} Ordinal string
   */
  getOrdinal(house) {
    const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
    return ordinals[house - 1] || `${house}th`;
  }

  /**
   * Generate summary for quick reference
   * @param {Object} scores - Compatibility scores
   * @param {string} partnerName - Partner name
   * @returns {string} Quick summary
   */
  generateQuickSummary(scores, partnerName) {
    const partner = partnerName || 'partner';
    const score = scores?.overall || 0;

    return `💕 *Quick Synastry Summary:*\n\nYou & ${partner}: ${score}/100 compatibility\n\n${
      score >= 80 ? '🌟 Excellent cosmic harmony!' :
        score >= 70 ? '💫 Strong supportive connection.' :
          score >= 60 ? '✅ Positive potential with effort.' :
            '🔄 Growth opportunity through challenges.'}`;
  }
}

module.exports = { CompatibilityFormatter };
