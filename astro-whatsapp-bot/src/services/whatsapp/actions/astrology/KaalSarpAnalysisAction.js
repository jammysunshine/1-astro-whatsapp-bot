const BaseAction = require('../BaseAction');
const { AstrologyFormatterFactory } = require('../factories/AstrologyFormatterFactory');
const vedicCalculator = require('../../../services/astrology/vedic/VedicCalculator');

/**
 * KaalSarpAnalysisAction - Provides Kaal Sarp Dosh analysis in Vedic astrology.
 * Analyzes planetary positions between Rahu and Ketu for potential dosha effects.
 */
class KaalSarpAnalysisAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'get_kaal_sarp_analysis';
  }

  /**
   * Execute the kaal sarp dosh analysis action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Generating kaal sarp dosh analysis');

      // Unified validation using base class
      const validation = await this.validateProfileAndLimits('Kaal Sarp Analysis', 'kaal_sarp_analysis');
      if (!validation.success) {
        return validation;
      }

      // Generate kaal sarp analysis data
      const analysisData = await this.generateKaalSarpAnalysis();
      if (!analysisData) {
        throw new Error('Failed to generate kaal sarp analysis data');
      }

      // Format and send response using centralized methods
      const formattedContent = AstrologyFormatterFactory.formatKaalSarpAnalysis(analysisData);
      await this.buildAstrologyResponse(formattedContent, this.getKaalSarpActionButtons());

      this.logExecution('complete', 'Kaal sarp analysis sent successfully');
      return {
        success: true,
        type: 'kaal_sarp_analysis',
        analysis: {
          hasDosha: analysisData.hasDosha,
          severity: analysisData.severity,
          planetsInvolved: analysisData.planetsInvolved.length
        }
      };
    } catch (error) {
      this.logger.error('Error in KaalSarpAnalysisAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Generate kaal sarp dosh analysis data
   * @returns {Promise<Object>} Kaal sarp analysis data
   */
  async generateKaalSarpAnalysis() {
    try {
      // Validate that user has birth data
      if (!this.user) {
        throw new Error('User data not available for kaal sarp analysis');
      }
      
      if (!this.user.birthDate || !this.user.birthTime || !this.user.birthPlace) {
        throw new Error('User must complete birth profile with date, time, and place for kaal sarp analysis');
      }

      // Calculate kaal sarp dosha using Vedic calculator
      const kaalSarpResult = await vedicCalculator.analyzeKaalSarpDosha(
        this.user.birthDate,
        this.user.birthTime,
        this.user.birthPlace
      );

      return kaalSarpResult;
    } catch (error) {
      this.logger.error('Kaal sarp analysis calculation error:', error);
      // Return basic fallback analysis
      return this.generateFallbackKaalSarpAnalysis();
    }
  }

  /**
   * Generate basic fallback kaal sarp analysis
   * @returns {Object} Basic kaal sarp analysis data
   */
  generateFallbackKaalSarpAnalysis() {
    return {
      hasDosha: false,
      severity: 'unknown',
      planetsInvolved: [],
      description: 'Unable to determine Kaal Sarp Dosha status at this time.',
      recommendations: ['Complete your birth profile for accurate analysis'],
      isFallback: true
    };
  }

  /**
   * Get action buttons for kaal sarp analysis response
   * @returns {Array} Button configuration array
   */
  getKaalSarpActionButtons() {
    return [
      {
        id: 'get_vedic_remedies',
        titleKey: 'buttons.vedic_remedies',
        title: '🕉️ Vedic Remedies'
      },
      {
        id: 'show_vedic_astrology_menu',
        titleKey: 'buttons.vedic_menu',
        title: '📚 Vedic Astrology'
      },
      {
        id: 'show_main_menu',
        titleKey: 'buttons.main_menu',
        title: '🏠 Main Menu'
      }
    ];
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const message = 'I encountered an error generating your Kaal Sarp Dosh analysis. Please try again.';
    await this.sendMessage(message, 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Analyze Kaal Sarp Dosh in Vedic astrology charts',
      keywords: ['kaal sarp', 'kaal sarp dosh', 'kaal sarpa', 'sarp dosha'],
      category: 'astrology',
      subscriptionRequired: true,
      cooldown: 3600000 // 1 hour cooldown
    };
  }
}

module.exports = KaalSarpAnalysisAction;
