const logger = require('../../utils/logger');
const VedicCalculator = require('./vedic/VedicCalculator');

/**
 * AstrologyEngine - Core astrology calculation engine
 * Provides unified interface for all astrological calculations
 */
class AstrologyEngine {
  constructor() {
    this.vedicCalculator = new VedicCalculator();
    this.westernCalculator = null; // Can be added later
    logger.info('AstrologyEngine initialized');
  }

  /**
   * Initialize the engine
   */
  async initialize() {
    try {
      await this.vedicCalculator.initialize();
      logger.info('AstrologyEngine fully initialized');
    } catch (error) {
      logger.error('Error initializing AstrologyEngine:', error);
      throw error;
    }
  }

  /**
   * Calculate birth chart
   */
  async calculateBirthChart(birthData) {
    return await this.vedicCalculator.calculateBirthChart(birthData);
  }

  /**
   * Calculate current dasha
   */
  async calculateCurrentDasha(birthData) {
    return await this.vedicCalculator.calculateCurrentDasha(birthData);
  }

  /**
   * Calculate current transits
   */
  async calculateCurrentTransits(birthData) {
    return await this.vedicCalculator.calculateCurrentTransits(birthData);
  }

  /**
   * Calculate cosmic events
   */
  async calculateCosmicEvents(birthData, daysAhead = 30) {
    return await this.vedicCalculator.calculateCosmicEvents(birthData, daysAhead);
  }

  /**
   * Get health status
   */
  getHealthStatus() {
    return {
      status: 'healthy',
      calculators: {
        vedic: 'loaded',
        western: this.westernCalculator ? 'loaded' : 'not_loaded'
      },
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = AstrologyEngine;