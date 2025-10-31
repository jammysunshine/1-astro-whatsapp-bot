const AstrologyAction = require('../base/AstrologyAction');
const vedicCalculator = require('../../../services/astrology/vedic/VedicCalculator');
const { AstrologyFormatterFactory } = require('../factories/AstrologyFormatterFactory');

/**
 * BirthChartAction - Generates and displays birth chart (kundli) for users.
 * Shows planetary positions, houses, and basic interpretations.
 */
class BirthChartAction extends AstrologyAction {
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
      this.logAstrologyExecution('start', 'Generating birth chart');

      // Unified validation using base class
      const validation = await this.validateProfileAndLimits('Birth Chart', 'birth_chart');
      if (!validation.success) {
        return validation;
      }

      // Generate birth chart data
      const chartData = await this.generateBirthChart();
      if (!chartData) {
        throw new Error('Failed to generate birth chart data');
      }

      // Format and send response using centralized methods
      const formattedContent = AstrologyFormatterFactory.formatBirthChart(chartData);
      await this.buildAstrologyResponse(formattedContent, this.getChartActionButtons());

      this.logAstrologyExecution('complete', 'Birth chart sent successfully');
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
   * Generate birth chart data - primary attempt with fallbacks
   * @returns {Promise<Object>} Birth chart data
   */
  async generateBirthChart() {
    try {
      // Try Vedic chart first (more detailed)
      const vedicChart = await this.generateVedicChart();
      if (vedicChart && !vedicChart.error) { return vedicChart; }

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
      // Validate that user has birth data
      if (!this.user) {
        throw new Error('User data not available for birth chart generation');
      }

      if (!this.user.birthDate || !this.user.birthTime || !this.user.birthPlace) {
        throw new Error('User must complete birth profile with date, time, and place for birth chart generation');
      }

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
      // Validate that user has birth data
      if (!this.user) {
        throw new Error('User data not available for western chart generation');
      }

      if (!this.user.birthDate || !this.user.birthTime || !this.user.birthPlace) {
        throw new Error('User must complete birth profile with date, time, and place for western chart generation');
      }

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
    return {
      type: 'fallback',
      name: this.user?.name || 'User',
      birthDate: this.user?.birthDate || 'Not provided',
      disclaimer: 'Chart calculation temporarily unavailable. Please try again later.',
      planets: {
        Sun: { sign: 'Unknown', longitude: 0 },
        Moon: { sign: 'Unknown', longitude: 0 }
      }
    };
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
