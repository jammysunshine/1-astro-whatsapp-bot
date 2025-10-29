const BaseAction = require('../BaseAction');
const { VargaCharts } = require('../../../astrology/vargaCharts');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');
const translationService = require('../../../../services/i18n/TranslationService');

/**
 * VargaChartsAction - Provides Vedic divisional chart analysis
 * Shows how Rashi (D-1) divides into specialized charts for different life areas
 */
class VargaChartsAction extends BaseAction {
  constructor(user, phoneNumber, data = {}) {
    super(user, phoneNumber, data);
    this.vargaService = new VargaCharts();
  }

  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'show_varga_charts';
  }

  /**
   * Execute the varga charts analysis action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Analyzing Varga Charts');

      // Validate user profile
      if (!(await this.validateUserProfile('Varga Charts'))) {
        this.sendIncompleteProfileNotification();
        return { success: false, reason: 'incomplete_profile' };
      }

      // Check subscription limits
      const limitsCheck = this.checkSubscriptionLimits('varga_charts');
      if (!limitsCheck.isAllowed) {
        await this.sendUpgradePrompt(limitsCheck);
        return { success: false, reason: 'subscription_limit' };
      }

      // Calculate varga charts
      const vargaData = await this.calculateVargaAnalysis();

      // Send formatted varga analysis
      await this.sendVargaChartsResponse(vargaData);

      this.logExecution('complete', 'Varga charts analysis sent successfully');
      return {
        success: true,
        type: 'varga_charts',
        analysisData: {
          vargasCalculated: Object.keys(vargaData.vargaCharts || {}).length,
          keyInsights: vargaData.analysis?.keyInsights?.length || 0
        }
      };

    } catch (error) {
      this.logger.error('Error in VargaChartsAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Calculate comprehensive varga analysis
   * @returns {Promise<Object>} Varga analysis data
   */
  async calculateVargaAnalysis() {
    try {
      // Use key vargas for analysis
      const keyVargas = ['RASHI', 'NAVAMSA', 'DASHAMSA', 'HORA', 'DREKKANA'];

      return await this.vargaService.calculateVargaCharts({
        birthDate: this.user.birthDate,
        birthTime: this.user.birthTime,
        birthPlace: this.user.birthPlace
      }, keyVargas);

    } catch (error) {
      this.logger.error('Varga calculation failed:', error);
      return {
        error: error.message,
        fallbackMessage: 'Varga analysis provides detailed insights into specific life areas through chart divisions'
      };
    }
  }

  /**
   * Format and send varga charts response
   * @param {Object} vargaData - Varga analysis data
   */
  async sendVargaChartsResponse(vargaData) {
    try {
      if (vargaData.error) {
        const errorMessage = `🌟 Vedic Varga Charts Analysis\n\n${vargaData.fallbackMessage}\n\nBasic charts show life areas through divisions:\n• Navamsa (D-9): Marriage & spirituality\n• Dashamsa (D-10): Career & profession\n• Hora (D-2): Wealth & material gains\n• Drekkana (D-3): Siblings & courage\n\nConsult a traditional Vedic astrologer for detailed analysis.`;
        await sendMessage(this.phoneNumber, errorMessage, 'text');
        return;
      }

      const formattedAnalysis = this.formatVargaAnalysis(vargaData);
      const userLanguage = this.getUserLanguage();

      // Build interactive message with analysis actions
      const message = ResponseBuilder.buildInteractiveButtonMessage(
        this.phoneNumber,
        formattedAnalysis,
        this.getVargaActionButtons(),
        userLanguage
      );

      await sendMessage(
        message.to,
        message.interactive,
        'interactive'
      );

    } catch (error) {
      this.logger.error('Error sending varga response:', error);
      // Fallback to simple text message
      const simpleAnalysis = this.formatSimpleVargaAnalysis(vargaData);
      await sendMessage(this.phoneNumber, simpleAnalysis, 'text');
    }
  }

  /**
   * Format detailed varga analysis with insights
   * @param {Object} vargaData - Varga data
   * @returns {string} Formatted analysis text
   */
  formatVargaAnalysis(vargaData) {
    const userLanguage = this.getUserLanguage();

    // Header
    let response = this.formatVargaHeader();

    // Key insights from analysis
    if (vargaData.analysis?.keyInsights?.length > 0) {
      response += '\n\n💫 *Key Life Area Insights:*\n';
      vargaData.analysis.keyInsights.slice(0, 4).forEach(insight => {
        response += `• ${insight}\n`;
      });
    }

    // Navamsa analysis (marriage/spirituality)
    if (vargaData.vargaCharts?.NAVAMSA) {
      response += this.formatNavamsaAnalysis(vargaData.vargaCharts.NAVAMSA, vargaData.recommendations?.lifeAreas?.marriage);
    }

    // Dashamsa analysis (career)
    if (vargaData.vargaCharts?.DASHAMSA) {
      response += this.formatDashamsaAnalysis(vargaData.vargaCharts.DASHAMSA, vargaData.recommendations?.lifeAreas?.career);
    }

    // Hora analysis (wealth)
    if (vargaData.vargaCharts?.HORA) {
      response += this.formatHoraAnalysis(vargaData.vargaCharts.HORA, vargaData.recommendations?.lifeAreas?.wealth);
    }

    // Planetary strength overview
    if (vargaData.analysis?.strengthAnalysis) {
      response += this.formatPlanetaryStrength(vargaData.analysis.strengthAnalysis);
    }

    // Recommendations
    response += this.formatVargaRecommendations(vargaData.recommendations);

    return response;
  }

  /**
   * Format varga analysis header
   * @returns {string} Header text
   */
  formatVargaHeader() {
    const name = this.sanitizeName(this.user.name || 'User');
    return `🕉️ *Vedic Varga Charts Analysis*\n👤 ${name}\n\n*Traditional Vedic Divisional Charts*\nDivisions of Rashi chart for specialized life areas`;
  }

  /**
   * Format Navamsa analysis
   * @param {Object} navamsa - Navamsa chart data
   * @param {string} marriageGuidance - Marriage guidance
   * @returns {string} Navamsa section
   */
  formatNavamsaAnalysis(navamsa, marriageGuidance) {
    let response = '\n\n💍 *Navamsa (D-9) - Marriage & Dharma:*';

    if (navamsa.ascendantSign) {
      response += `\n• Ascendant: ${navamsa.ascendantSign}`;
    }

    // Venus position (marriage significator)
    if (navamsa.planets?.Venus) {
      const venus = navamsa.planets.Venus;
      response += `\n• Venus in ${venus.sign} (House ${venus.house})`;
    }

    // Jupiter position (spiritual significator)
    if (navamsa.planets?.Jupiter) {
      const jupiter = navamsa.planets.Jupiter;
      response += `\n• Jupiter in ${jupiter.sign} (House ${jupiter.house})`;
    }

    if (marriageGuidance) {
      response += `\n• ${marriageGuidance}`;
    }

    return response;
  }

  /**
   * Format Dashamsa analysis
   * @param {Object} dashamsa - Dashamsa chart data
   * @param {string} careerGuidance - Career guidance
   * @returns {string} Dashamsa section
   */
  formatDashamsaAnalysis(dashamsa, careerGuidance) {
    let response = '\n\n🏢 *Dashamsa (D-10) - Career & Authority:*';

    if (dashamsa.ascendantSign) {
      response += `\n• Ascendant: ${dashamsa.ascendantSign}`;
    }

    // Sun position (career significator)
    if (dashamsa.planets?.Sun) {
      const sun = dashamsa.planets.Sun;
      response += `\n• Sun in ${sun.sign} (House ${sun.house})`;
    }

    // 10th house cusp
    if (dashamsa.houses?.[10]) {
      response += `\n• 10th House in ${dashamsa.houses[10].sign}`;
    }

    if (careerGuidance) {
      response += `\n• ${careerGuidance}`;
    }

    return response;
  }

  /**
   * Format Hora analysis
   * @param {Object} hora - Hora chart data
   * @param {string} wealthGuidance - Wealth guidance
   * @returns {string} Hora section
   */
  formatHoraAnalysis(hora, wealthGuidance) {
    let response = '\n\n💰 *Hora (D-2) - Wealth & Material:*';

    if (hora.ascendantSign) {
      response += `\n• Ascendant: ${hora.ascendantSign}`;
    }

    // Jupiter position (wealth significator)
    if (hora.planets?.Jupiter) {
      const jupiter = hora.planets.Jupiter;
      response += `\n• Jupiter in ${jupiter.sign} (House ${jupiter.house})`;
    }

    if (wealthGuidance) {
      response += `\n• ${wealthGuidance}`;
    }

    return response;
  }

  /**
   * Format planetary strength overview
   * @param {Object} strengthAnalysis - Strength analysis data
   * @returns {string} Strength section
   */
  formatPlanetaryStrength(strengthAnalysis) {
    let response = '\n\n⚡ *Planetary Strengths Across Vargas:*';

    // Show strongest planets
    const sortedPlanets = Object.entries(strengthAnalysis)
      .sort(([,a], [,b]) => b.score - a.score)
      .slice(0, 3);

    sortedPlanets.forEach(([planet, data]) => {
      const strength = data.score > 9 ? 'Very Strong' :
                      data.score > 6 ? 'Strong' :
                      data.score > 3 ? 'Moderate' : 'Needs Support';
      response += `\n• ${planet}: ${strength} (${data.favorableVargas.length} favorable vargas)`;
    });

    return response;
  }

  /**
   * Format varga recommendations
   * @param {Object} recommendations - Recommendation data
   * @returns {string} Recommendations section
   */
  formatVargaRecommendations(recommendations) {
    let response = '\n\n---\n';

    if (recommendations?.remedies?.length > 0) {
      response += '*Recommended Remedies:*\n';
      recommendations.remedies.slice(0, 2).forEach(remedy => {
        response += `• ${remedy}\n`;
      });
    }

    response += '\n*Varga Charts show specialized life areas where planetary influences are divided and analyzed separately from the birth chart.*';

    return response;
  }

  /**
   * Format simple varga analysis for fallback
   * @param {Object} vargaData - Varga data
   * @returns {string} Simple analysis text
   */
  formatSimpleVargaAnalysis(vargaData) {
    const name = this.sanitizeName(this.user.name || 'User');
    let response = `🕉️ Varga Charts for ${name}\n\n`;

    if (vargaData.vargaCharts) {
      response += 'Divisional Charts Analyzed:\n';

      Object.keys(vargaData.vargaCharts).forEach(varga => {
        const chart = vargaData.vargaCharts[varga];
        response += `• ${varga}: Ascendant in ${chart.ascendantSign}\n`;
      });
    }

    response += '\nVarga charts provide specialized insights into:\n';
    response += '• Marriage (Navamsa)\n• Career (Dashamsa)\n• Wealth (Hora)\n';
    response += '• Siblings (Drekkana)\n• And many more life areas\n\n';
    response += 'Detailed analysis available through menu options.';

    return response;
  }

  /**
   * Get action buttons for varga charts response
   * @returns {Array} Button configuration array
   */
  getVargaActionButtons() {
    return [
      {
        id: 'show_birth_chart',
        titleKey: 'buttons.birth_chart',
        title: '📊 Birth Chart'
      },
      {
        id: 'show_current_transits',
        titleKey: 'buttons.current_transits',
        title: '🌌 Transits'
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
    const profilePrompt = '🕉️ *Varga Charts Require Complete Profile*\n\nTo analyze divisional charts, please complete your profile with:\n• Birth date (DDMMYY format)\n• Birth time (HHMM format)\n• Birth place\n\nUse the Settings menu to update your information.\n\nVarga charts divide your birth chart into specialized areas like marriage, career, wealth, etc.';
    await sendMessage(this.phoneNumber, profilePrompt, 'text');
  }

  /**
   * Send subscription upgrade prompt
   * @param {Object} limitsCheck - Subscription limits check result
   */
  async sendUpgradePrompt(limitsCheck) {
    const upgradeMessage = `⭐ *Premium Varga Analysis Available*\n\nYou've reached the limit for detailed divisional chart analysis in the ${limitsCheck.plan} plan.\n\nUpgrade to Premium for:\n• Complete varga chart analysis\n• Specialized life area insights\n• Traditional Vedic calculations\n• Personalized recommendations\n\nVarga charts reveal hidden strengths in specific life areas!`;
    await sendMessage(this.phoneNumber, upgradeMessage, 'text');
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage = 'Sorry, I encountered an issue analyzing your varga charts. This detailed Vedic analysis requires careful calculations. Please try again, or contact support if the problem persists.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Analyze Vedic divisional charts for specialized life areas',
      keywords: ['varga', 'division', 'divisional charts', 'navamsa', 'dashamsa', 'hora'],
      category: 'astrology',
      subscriptionRequired: false,
      cooldown: 300000 // 5 minutes between requests
    };
  }
}

module.exports = VargaChartsAction;