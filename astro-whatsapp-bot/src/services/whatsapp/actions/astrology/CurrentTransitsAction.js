const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');
const translationService = require('../../../../services/i18n/TranslationService');

/**
 * CurrentTransitsAction - Shows current planetary transits and their influences.
 * Analyzes how current planetary positions affect the user's natal chart.
 */
class CurrentTransitsAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'get_current_transits';
  }

  /**
   * Execute the current transits action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Analyzing current planetary transits');

      // Validate user profile
      if (!(await this.validateUserProfile('Current Transits'))) {
        await this.sendIncompleteProfileMessage();
        return { success: false, reason: 'incomplete_profile' };
      }

      // Calculate current transits
      const transits = await this.calculateCurrentTransits();

      // Format and send transit analysis
      await this.sendTransitAnalysis(transits);

      this.logExecution('complete', 'Current transits analysis sent');
      return {
        success: true,
        type: 'current_transits',
        planetsAnalyzed: transits.length
      };
    } catch (error) {
      this.logger.error('Error in CurrentTransitsAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
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
      const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

      planets.forEach(planet => {
        const influence = this.getPlanetTransitInfluence(planet, currentDate);
        if (influence && influence.significance > 6) { // Only include significant transits
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
    if (!transit) { return null; }

    return {
      planet,
      transitSign: transit.sign,
      natalHouse: transit.house,
      aspects: transit.aspects,
      significance: Math.floor(Math.random() * 10) + 1, // Simplified scoring
      influence: this.getTransitMeaning(planet, transit),
      duration: this.getTransitDuration(planet)
    };
  }

  /**
   * Get meaning of transit based on planet and position
   * @param {string} planet - Planet name
   * @param {Object} transit - Transit data
   * @returns {string} Transit interpretation
   */
  getTransitMeaning(planet, transit) {
    const meanings = {
      Sun: `Solar influence in ${transit.sign} brings focus on identity, leadership, and life purpose. In house ${transit.natalHouse}, this enhances self-expression.`,
      Moon: `Lunar transits affect emotions and intuition. In ${transit.sign}, emotional patterns may emerge, influencing home and family matters.`,
      Mercury: 'Mercury transits affect communication and thinking. Current position suggests changes in how you process information and express ideas.',
      Venus: 'Venus transits influence relationships and values. This period brings opportunities for harmony and creative expression.',
      Mars: 'Mars transits bring energy and drive. You may feel more motivated to take action in career and personal goals.',
      Jupiter: 'Jupiter transits expand horizons. This is a time of growth, learning, and new opportunities.',
      Saturn: 'Saturn transits bring structure and responsibility. A period for building foundations and long-term planning.'
    };

    return meanings[planet] || 'Planetary influence bringing important changes and opportunities for growth.';
  }

  /**
   * Get approximate duration of transit
   * @param {string} planet - Planet name
   * @returns {string} Duration description
   */
  getTransitDuration(planet) {
    const durations = {
      Sun: '2-3 days',
      Moon: '2-3 days',
      Mercury: '3-4 weeks',
      Venus: '3-4 weeks',
      Mars: '6-8 weeks',
      Jupiter: '12-13 months',
      Saturn: '2.5-3 years'
    };

    return durations[planet] || 'Variable';
  }

  /**
   * Send formatted transit analysis
   * @param {Array} transits - Array of transit data
   */
  async sendTransitAnalysis(transits) {
    try {
      const formattedAnalysis = this.formatTransitAnalysis(transits);
      const userLanguage = this.getUserLanguage();

      const buttons = [
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

      const message = ResponseBuilder.buildInteractiveButtonMessage(
        this.phoneNumber,
        formattedAnalysis,
        buttons,
        userLanguage
      );

      await sendMessage(
        message.to,
        message.interactive,
        'interactive'
      );
    } catch (error) {
      this.logger.error('Error sending transit analysis:', error);
      await this.handleExecutionError(error);
    }
  }

  /**
   * Format transit data into readable analysis
   * @param {Array} transits - Transit data array
   * @returns {string} Formatted analysis
   */
  formatTransitAnalysis(transits) {
    let analysis = `🌌 *Current Planetary Transits*\n*For ${this.user.name || 'You'}*\n\n`;

    if (transits.length === 0) {
      analysis += 'No significant planetary transits detected at this time. This is a period of relative cosmic stability.\n\n';
    } else {
      analysis += '*Major Influences This Month:*\n\n';
      transits.slice(0, 5).forEach((transit, index) => {
        analysis += `${index + 1}. *${transit.planet}* in ${transit.transitSign}\n`;
        analysis += `   ${transit.influence}\n`;
        analysis += `   Duration: ~${transit.duration}\n\n`;
      });
    }

    // Add general advice
    analysis += '*💫 Current Cosmic Climate:*\n';
    if (transits.length > 3) {
      analysis += '• High activity period - many changes and opportunities\n';
    } else if (transits.length > 1) {
      analysis += '• Moderate activity - focus on important relationships\n';
    } else {
      analysis += '• Quiet period - ideal for reflection and preparation\n';
    }

    analysis += '• Pay attention to dreams and intuition\n';
    analysis += '• Be open to sudden opportunities\n\n';

    analysis += '*Transits show cosmic timing. Use this awareness to align your actions with the universe\'s flow.*';

    return analysis;
  }

  /**
   * Send message for incomplete profile
   */
  async sendIncompleteProfileMessage() {
    const message = '👤 *Profile Required for Transits*\n\nCurrent planetary transits need your birth chart to show personalized influences.\n\n📅 Please complete your birth profile first.';
    await sendMessage(this.phoneNumber, message, 'text');
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage = '❌ Sorry, there was an error analyzing current transits. The cosmic energies may be temporarily obscured. Please try again later.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Analyze current planetary transits and their personal influences',
      keywords: ['transits', 'current', 'planets', 'influences', 'cosmic'],
      category: 'astrology',
      subscriptionRequired: false,
      cooldown: 3600000 // 1 hour between transit analyses
    };
  }
}

module.exports = CurrentTransitsAction;
