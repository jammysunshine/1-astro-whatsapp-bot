const logger = require('../../../utils/logger');

/**
 * VedicCalculator - Main Vedic Astrology Calculator
 * Aggregates functionality from various specialized calculators
 */
class VedicCalculator {
  constructor() {
    this.initialized = false;
    logger.info('VedicCalculator initialized');
  }

  /**
   * Initialize the calculator with required modules
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      // Import specialized calculators dynamically to avoid circular dependencies
      this.birthChart = require('../../../core/services/calculators/ChartGenerator');
      this.dasha = require('../../../core/services/calculators/DashaAnalysisCalculator');
      this.transits = require('../../../core/services/calculators/TransitCalculator');
      this.yogas = require('../../../core/services/calculators/VedicYogasCalculator');
      this.retrogrades = require('../../../core/services/calculators/RetrogradeCalculator') || {};
      this.cosmic = require('../../../core/services/calculators/CosmicEventsCalculator');

      this.initialized = true;
      logger.info('VedicCalculator modules loaded successfully');
    } catch (error) {
      logger.error('Error initializing VedicCalculator:', error);
      throw error;
    }
  }

  /**
   * Calculate birth chart with all components
   */
  async calculateBirthChart(birthData) {
    await this.initialize();
    return await this.birthChart.calculate(birthData);
  }

  /**
   * Calculate current dasha periods
   */
  async calculateCurrentDasha(birthData) {
    await this.initialize();
    return await this.dasha.calculateCurrentDasha(birthData);
  }

  /**
   * Calculate current transits
   */
  async calculateCurrentTransits(birthData) {
    await this.initialize();
    return await this.transits.calculate(birthData);
  }

  /**
   * Calculate Vedic yogas
   */
  async calculateVedicYogas(birthData) {
    await this.initialize();
    return await this.yogas.calculate(birthData);
  }

  /**
   * Calculate cosmic events
   */
  async calculateCosmicEvents(birthData, daysAhead = 30) {
    await this.initialize();
    return await this.cosmic.calculateCosmicEvents(birthData, daysAhead);
  }
}

module.exports = VedicCalculator;
