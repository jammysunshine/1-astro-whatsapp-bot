const BaseAction = require('../BaseAction');
const vedicCalculator = require('../../../../services/astrology/vedicCalculator');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');
const translationService = require('../../../../services/i18n/TranslationService');

/**
 * BirthChartAction - Generates and displays birth chart (kundli) for users.
 * Shows planetary positions, houses, and basic interpretations.
 */
class BirthChartAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'show_birth_chart';
  }

  /**
   * Execute the birth chart action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Generating birth chart');

      // Validate user profile
      if (!(await this.validateUserProfile('Birth Chart'))) {
        this.sendIncompleteProfileNotification();
        return { success: false, reason: 'incomplete_profile' };
      }

      // Check subscription limits
      const limitsCheck = this.checkSubscriptionLimits('birth_chart');
      if (!limitsCheck.isAllowed) {
        await this.sendUpgradePrompt(limitsCheck);
        return { success: false, reason: 'subscription_limit' };
      }

      // Generate birth chart data
      const chartData = await this.generateBirthChart();

      // Send formatted chart response
      await this.sendBirthChartResponse(chartData);

      this.logExecution('complete', 'Birth chart sent successfully');
      return {
        success: true,
        type: 'birth_chart',
        chartData: {
          planetsCount: Object.keys(chartData.planets || {}).length,
          hasHouses: !!chartData.houses
        }
      };
    } catch (error) {
      this.logger.error('Error in BirthChartAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Generate birth chart data using astrology calculator
   * @returns {Promise<Object>} Birth chart data
   */
  async generateBirthChart() {
    try {
      // Try Vedic chart first (more detailed)
      const vedicChart = await this.generateVedicChart();
      if (vedicChart && !vedicChart.error) {
        return vedicChart;
      }

      // Fallback to Western chart if Vedic fails
      this.logger.warn('Vedic chart generation failed, using Western fallback');
      return await this.generateWesternChart();
    } catch (error) {
      this.logger.error('Chart generation failed completely:', error);
      return this.generateFallbackChart();
    }
  }

  /**
   * Generate detailed Vedic birth chart
   * @returns {Promise<Object>} Vedic chart data
   */
  async generateVedicChart() {
    try {
      return await vedicCalculator.generateVedicKundli({
        birthDate: this.user.birthDate,
        birthTime: this.user.birthTime,
        birthPlace: this.user.birthPlace,
        name: this.user.name
      });
    } catch (error) {
      this.logger.error('Vedic chart generation error:', error);
      return { error: error.message };
    }
  }

  /**
   * Generate Western birth chart as fallback
   * @returns {Promise<Object>} Western chart data
   */
  async generateWesternChart() {
    try {
      return await vedicCalculator.generateWesternBirthChart({
        birthDate: this.user.birthDate,
        birthTime: this.user.birthTime,
        birthPlace: this.user.birthPlace,
        name: this.user.name
      });
    } catch (error) {
      this.logger.error('Western chart generation error:', error);
      return { error: error.message };
    }
  }

  /**
   * Generate basic fallback chart for emergencies
   * @returns {Object} Basic chart data
   */
  generateFallbackChart() {
    const userLanguage = this.getUserLanguage();
    return {
      type: 'fallback',
      name: this.user.name || 'User',
      birthDate: this.user.birthDate || 'Not provided',
      disclaimer: translationService.translate(
        'messages.chart.disclaimer',
        userLanguage
      ) || 'Chart calculation temporarily unavailable. Please try again later.',
      planets: {
        Sun: { sign: 'Unknown', longitude: 0 },
        Moon: { sign: 'Unknown', longitude: 0 }
      }
    };
  }

  /**
   * Format and send birth chart response
   * @param {Object} chartData - Chart data to format
   */
  async sendBirthChartResponse(chartData) {
    try {
      const formattedChart = this.formatChartResponse(chartData);
      const userLanguage = this.getUserLanguage();

      // Build interactive message with chart actions
      const message = ResponseBuilder.buildInteractiveButtonMessage(
        this.phoneNumber,
        formattedChart,
        this.getChartActionButtons(),
        userLanguage
      );

      await sendMessage(
        message.to,
        message.interactive,
        'interactive'
      );
    } catch (error) {
      this.logger.error('Error sending chart response:', error);
      // Fallback to simple text message
      const simpleChart = this.formatSimpleChart(chartData);
      await sendMessage(this.phoneNumber, simpleChart, 'text');
    }
  }

  /**
   * Format detailed chart response with planetary positions
   * @param {Object} chartData - Raw chart data
   * @returns {string} Formatted chart text
   */
  formatChartResponse(chartData) {
    const userLanguage = this.getUserLanguage();

    // Chart header
    let response = this.formatChartHeader(chartData);

    // Lagna/Ascendant
    if (chartData.lagna) {
      response += `\n🏠 *Ascendant:* ${chartData.lagna.sign || 'Unknown'}`;
      if (chartData.lagna.longitude) {
        response += ` (${chartData.lagna.longitude.toFixed(1)}°)`;
      }
    }

    // Planetary positions
    response += this.formatPlanetaryPositions(chartData);

    // Houses (if available)
    if (chartData.houses) {
      response += this.formatHousePositions(chartData);
    }

    // Key aspects or summary
    if (chartData.kundliSummary || chartData.aspects) {
      response += this.formatChartSummary(chartData);
    }

    // Add disclaimer
    response += this.formatChartDisclaimer(chartData);

    return response;
  }

  /**
   * Format chart header with basic info
   * @param {Object} chartData - Chart data
   * @returns {string} Header text
   */
  formatChartHeader(chartData) {
    const chartType = chartData.type === 'vedic' ? '🕉️ Vedic' : '🌟 Western';
    const name = this.sanitizeName(chartData.name);
    const birthInfo = this.formatBirthInfo(chartData);

    return `${chartType} *Birth Chart*\n👤 ${name}\n${birthInfo}\n`;
  }

  /**
   * Sanitize name for display
   * @param {string} name - Name to sanitize
   * @returns {string} Sanitized name
   */
  sanitizeName(name) {
    if (!name) { return 'Unknown'; }
    // Remove potentially harmful characters
    return name.replace(/[<>'"&]/g, '').substring(0, 50);
  }

  /**
   * Format birth information
   * @param {Object} chartData - Chart data
   * @returns {string} Birth info string
   */
  formatBirthInfo(chartData) {
    let info = '';

    if (chartData.birthDetails) {
      const { date, time, place } = chartData.birthDetails;
      info += `📅 ${date || 'Unknown'}`;
      if (time) { info += ` ${time}`; }
      if (place) { info += `\n📍 ${place}`; }
    } else if (this.user) {
      info += `📅 ${this.user.birthDate || 'Not set'}`;
      if (this.user.birthTime) { info += ` ${this.user.birthTime}`; }
      if (this.user.birthPlace) { info += `\n📍 ${this.user.birthPlace}`; }
    }

    return info;
  }

  /**
   * Format planetary positions section
   * @param {Object} chartData - Chart data
   * @returns {string} Planets section
   */
  formatPlanetaryPositions(chartData) {
    let response = '\n\n🪐 *Planetary Positions:*';

    const planets = chartData.planetaryPositions || chartData.planets || {};

    // Define planet order for consistent display
    const planetOrder = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', 'Uranus', 'Neptune', 'Pluto'];

    planetOrder.forEach(planet => {
      if (planets[planet]) {
        const data = planets[planet];
        if (data.sign) {
          response += `\n• ${planet}: ${data.sign}`;
          if (data.longitude !== undefined) {
            response += ` (${data.longitude.toFixed(1)}°)`;
          }
          if (data.house) {
            response += ` House ${data.house}`;
          }
        }
      }
    });

    return response;
  }

  /**
   * Format house positions (if available)
   * @param {Object} chartData - Chart data
   * @returns {string} Houses section
   */
  formatHousePositions(chartData) {
    if (!chartData.houses || typeof chartData.houses !== 'object') {
      return '';
    }

    let response = '\n\n🏠 *House Cusps:*';
    Object.entries(chartData.houses).slice(0, 12).forEach(([house, data]) => {
      if (data && data.sign) {
        response += `\n• House ${house}: ${data.sign}`;
      }
    });

    return response;
  }

  /**
   * Format chart summary or aspects
   * @param {Object} chartData - Chart data
   * @returns {string} Summary section
   */
  formatChartSummary(chartData) {
    let response = '\n\n💫 *Chart Insights:*';

    if (chartData.kundliSummary) {
      // Truncate summary if too long
      const summary = chartData.kundliSummary.length > 300 ?
        `${chartData.kundliSummary.substring(0, 300)}...` :
        chartData.kundliSummary;
      response += `\n${summary}`;
    }

    if (chartData.aspectPatterns && chartData.aspectPatterns.length > 0) {
      response += '\n\n*Key Aspects:*';
      chartData.aspectPatterns.slice(0, 3).forEach(pattern => {
        response += `\n• ${pattern.type}: ${pattern.description}`;
      });
    }

    return response;
  }

  /**
   * Format chart disclaimer
   * @param {Object} chartData - Chart data
   * @returns {string} Disclaimer text
   */
  formatChartDisclaimer(chartData) {
    let disclaimer = '\n\n---\n';

    if (chartData.type === 'fallback') {
      disclaimer += '⚠️ *Note:* Chart calculation temporarily unavailable.';
    } else {
      disclaimer += '📋 *This is your basic birth chart overview.*\n';
      disclaimer += '*For detailed analysis, consult with an astrologer.*';
    }

    return disclaimer;
  }

  /**
   * Format simple chart for fallback scenarios
   * @param {Object} chartData - Chart data
   * @returns {string} Simple chart text
   */
  formatSimpleChart(chartData) {
    const name = this.sanitizeName(chartData.name);
    let response = `🌟 Birth Chart for ${name}\n`;

    if (chartData.planets) {
      response += '\nPlanets:';
      Object.entries(chartData.planets).forEach(([planet, data]) => {
        if (data.sign) {
          response += `\n• ${planet}: ${data.sign}`;
        }
      });
    }

    response += '\n\nFor detailed analysis, use the main menu options.';
    return response;
  }

  /**
   * Get action buttons for birth chart response
   * @returns {Array} Button configuration array
   */
  getChartActionButtons() {
    return [
      {
        id: 'get_current_transits',
        titleKey: 'buttons.current_transits',
        title: '🌌 Transits'
      },
      {
        id: 'initiate_compatibility_flow',
        titleKey: 'buttons.compatibility',
        title: '💕 Compatibility'
      },
      {
        id: 'show_main_menu',
        titleKey: 'buttons.main_menu',
        title: '🏠 Main Menu'
      }
    ];
  }

  /**
   * Send notification for incomplete profile
   */
  async sendIncompleteProfileNotification() {
    const profilePrompt = '👤 *Birth Chart Requires Complete Profile*\n\nTo generate your birth chart, please complete your profile with:\n• Birth date (DDMMYY format)\n• Birth time (HHMM format)\n• Birth place\n\nUse the Settings menu to update your information.';
    await sendMessage(this.phoneNumber, profilePrompt, 'text');
  }

  /**
   * Send subscription upgrade prompt
   * @param {Object} limitsCheck - Subscription limits check result
   */
  async sendUpgradePrompt(limitsCheck) {
    const upgradeMessage = `⭐ *Premium Charts Available*\n\nYou've reached the limit for detailed birth charts in the ${limitsCheck.plan} plan.\n\nUpgrade to Premium for:\n• Unlimited detailed charts\n• Advanced planetary analysis\n• Pattern recognition\n• Personalized insights`;
    await sendMessage(this.phoneNumber, upgradeMessage, 'text');
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage = 'Sorry, I encountered an issue generating your birth chart. Please try again, or contact support if the problem persists.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Generate and display birth chart (kundli)',
      keywords: ['chart', 'kundli', 'birth chart', 'natal chart', 'map'],
      category: 'astrology',
      subscriptionRequired: false,
      cooldown: 600000 // 10 minutes between requests
    };
  }
}

module.exports = BirthChartAction;
