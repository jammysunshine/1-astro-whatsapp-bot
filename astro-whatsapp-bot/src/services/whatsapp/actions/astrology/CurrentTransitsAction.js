const AstrologyAction = require('../base/AstrologyAction');
const {
  AstrologyFormatterFactory
} = require('../factories/AstrologyFormatterFactory');

/**
 * CurrentTransitsAction - Shows current planetary transits and their influences.
 * Uses AstrologyAction base class for unified validation and response handling.
 * Direct infrastructure usage with no facade patterns.
 */
class CurrentTransitsAction extends AstrologyAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'get_current_transits';
  }

  /**
   * Execute the current transits action using base class unified methods
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logAstrologyExecution(
        'start',
        'Analyzing current planetary transits'
      );

      // Unified validation using base class
      const validation = await this.validateProfileAndLimits(
        'Current Transits',
        'transits_current'
      );
      if (!validation.success) {
        return validation;
      }

      // Calculate current transits
      const transitData = await this.calculateCurrentTransits();
      if (!transitData) {
        throw new Error('Failed to calculate transit data');
      }

      // Format and send using centralized factory and base class methods
      const formattedContent = AstrologyFormatterFactory.formatTransits({
        name: this.user?.name,
        currentDate: new Date().toISOString(),
        majorTransits: transitData,
        personalImpact: this.getPersonalImpact(transitData),
        generalInfluence: this.getGeneralInfluence(transitData)
      });
      await this.buildAstrologyResponse(
        formattedContent,
        this.getTransitButtons()
      );

      this.logAstrologyExecution(
        'complete',
        'Current transits analysis delivered successfully'
      );
      return {
        success: true,
        type: 'current_transits',
        planetsAnalyzed: transitData.length
      };
    } catch (error) {
      this.logger.error('Error in CurrentTransitsAction:', error);
      await this.handleExecutionError(error);
      return {
        success: false,
        reason: 'execution_error',
        error: error.message
      };
    }
  }

  /**
   * Calculate current planetary transits relative to user's natal chart
   * @returns {Promise<Array>} Array of transit influences
   */
  async calculateCurrentTransits() {
    try {
      const currentDate = new Date();
      const transits = [];

      // Major planets for transit analysis
      const planets = [
        'Sun',
        'Moon',
        'Mercury',
        'Venus',
        'Mars',
        'Jupiter',
        'Saturn'
      ];

      planets.forEach(planet => {
        const influence = this.getPlanetTransitInfluence(planet, currentDate);
        if (influence && influence.significance > 6) {
          // Only include significant transits
          transits.push(influence);
        }
      });

      // Sort by significance and date
      return transits.sort((a, b) => b.significance - a.significance);
    } catch (error) {
      this.logger.error('Error calculating transits:', error);
      return [];
    }
  }

  /**
   * Get transit influence for a specific planet
   * @param {string} planet - Planet name
   * @param {Date} currentDate - Current date
   * @returns {Object|null} Transit influence data
   */
  getPlanetTransitInfluence(planet, currentDate) {
    // This is a simplified implementation.
    // In a real system, this would use ephemeris calculations
    const transitPhases = {
      Sun: { sign: 'Libra', house: 7, aspects: ['trine Moon'] },
      Moon: { sign: 'Cancer', house: 4, aspects: ['conjunct Venus'] },
      Mercury: { sign: 'Virgo', house: 6, aspects: ['square Mars'] },
      Venus: { sign: 'Leo', house: 5, aspects: ['sextile Jupiter'] },
      Mars: { sign: 'Aries', house: 1, aspects: ['opposition Saturn'] },
      Jupiter: { sign: 'Pisces', house: 12, aspects: ['trine Neptune'] },
      Saturn: { sign: 'Aquarius', house: 11, aspects: ['conjunct Uranus'] }
    };

    const transit = transitPhases[planet];
    if (!transit) {
      return null;
    }

    const durations = {
      Sun: '2-3 days',
      Moon: '2-3 days',
      Mercury: '3-4 weeks',
      Venus: '3-4 weeks',
      Mars: '6-8 weeks',
      Jupiter: '12-13 months',
      Saturn: '2.5-3 years'
    };

    return {
      planet,
      transitSign: transit.sign,
      natalHouse: transit.house,
      aspects: transit.aspects,
      significance: Math.floor(Math.random() * 10) + 1, // Simplified scoring
      influence: this.getTransitMeaning(planet, transit),
      duration: durations[planet] || 'Variable'
    };
  }

  /**
   * Get transit meaning for a specific planet and transit position
   * @param {string} planet - Planet name
   * @param {Object} transit - Transit position data
   * @returns {string} Transit interpretation
   */
  getTransitMeaning(planet, transit) {
    const meanings = {
      Sun: `Solar influence in ${transit.sign} brings focus on identity, leadership, and life purpose. In house ${transit.house}, this enhances self-expression.`,
      Moon: `Lunar transits affect emotions and intuition. In ${transit.sign}, emotional patterns may emerge, influencing home and family matters.`,
      Mercury:
        'Mercury transits affect communication and thinking. Current position suggests changes in how you process information and express ideas.',
      Venus:
        'Venus transits influence relationships and values. This period brings opportunities for harmony and creative expression.',
      Mars: 'Mars transits bring energy and drive. You may feel more motivated to take action in career and personal goals.',
      Jupiter:
        'Jupiter transits expand horizons. This is a time of growth, learning, and new opportunities.',
      Saturn:
        'Saturn transits bring structure and responsibility. A period for building foundations and long-term planning.'
    };

    return (
      meanings[planet] ||
      'Planetary influence bringing important changes and opportunities for growth.'
    );
  }

  /**
   * Get personal impact interpretation based on transit data
   * @param {Array} transits - Transit data array
   * @returns {string} Personal impact description
   */
  getPersonalImpact(transits) {
    if (!transits || transits.length === 0) {
      return '♌ Quiet cosmic period - focus on inner peace and preparation for future changes.';
    }

    const majorTransits = transits.filter(t => t.significance > 7);
    if (majorTransits.length > 0) {
      return '♌ High cosmic activity - pay attention to intuition and be open to significant changes in your life.';
    }

    return '♌ Moderate cosmic activity - focus on relationships and important life decisions.';
  }

  /**
   * Get general influence interpretation based on transit data
   * @param {Array} transits - Transit data array
   * @returns {string} General influence description
   */
  getGeneralInfluence(transits) {
    if (!transits || transits.length === 0) {
      return '🌍 Period of cosmic stability and equilibrium. Use this time for reflection and planning.';
    }

    const climateDescription =
      transits.length > 3 ?
        'High activity' :
        transits.length > 1 ?
          'Moderate activity' :
          'Low activity';
    return `🌍 ${climateDescription} cosmic climate. The planets are aligning to bring important messages and opportunities for growth.`;
  }

  /**
   * Get action buttons for transit analysis response
   * @returns {Array} Button configuration array
   */
  getTransitButtons() {
    return [
      {
        id: 'get_transit_predictions',
        titleKey: 'buttons.predictions',
        title: '🔮 Predictions'
      },
      {
        id: 'get_birth_chart',
        titleKey: 'buttons.birth_chart',
        title: '📊 Chart'
      },
      {
        id: 'show_main_menu',
        titleKey: 'buttons.main_menu',
        title: '🏠 Main Menu'
      }
    ];
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description:
        'Analyze current planetary transits and their personal influences',
      keywords: ['transits', 'current', 'planets', 'influences', 'cosmic'],
      category: 'astrology',
      subscriptionRequired: false,
      cooldown: 3600000 // 1 hour between transit analyses
    };
  }
}

module.exports = CurrentTransitsAction;
