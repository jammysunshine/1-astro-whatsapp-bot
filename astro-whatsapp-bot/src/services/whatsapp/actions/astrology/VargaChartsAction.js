const AstrologyAction = require('../base/AstrologyAction');
const { VargaCharts } = require('../../../astrology/vargaCharts');
const { AstrologyFormatterFactory } = require('../factories/AstrologyFormatterFactory');

/**
 * VargaChartsAction - Provides Vedic divisional chart analysis
 * Shows how Rashi (D-1) divides into specialized charts for different life areas
 */
class VargaChartsAction extends AstrologyAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'get_varga_charts_analysis';
  }

  /**
   * Execute the varga charts analysis using clean infrastructure
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logAstrologyExecution('start', 'Analyzing Varga Charts');

      // Unified profile and limits validation from base class
      const validation = await this.validateProfileAndLimits('Varga Charts', 'varga_charts');
      if (!validation.success) {
        return validation;
      }

      // Calculate varga charts
      const vargaData = await this.calculateVargaAnalysis();
      if (!vargaData) {
        throw new Error('Failed to calculate varga analysis');
      }

      // Format varga-specific analysis (complex business logic kept here)
      const formattedContent = this.formatVargaAnalysis(vargaData);

      // Build astrology response using base class methods
      await this.buildAstrologyResponse(formattedContent, this.getVargaActionButtons());

      this.logAstrologyExecution('complete', 'Varga charts analysis delivered successfully');
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
      // Validate that user has birth data
      if (!this.user) {
        throw new Error('User data not available for varga analysis');
      }
      
      if (!this.user.birthDate || !this.user.birthTime || !this.user.birthPlace) {
        throw new Error('User must complete birth profile with date, time, and place for varga analysis');
      }

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
      .sort(([, a], [, b]) => b.score - a.score)
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
