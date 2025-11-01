const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

/**
 * Planetary Events Service
 * Provides analysis of upcoming planetary events and their astrological significance
 * Extends ServiceTemplate for standardized service architecture
 */
class PlanetaryEventsService extends ServiceTemplate {
  constructor() {
    super('PlanetaryEventsCalculator');
    this.serviceName = 'PlanetaryEventsService';
    this.calculatorPath = '../services/astrology/vedic/calculators/PlanetaryEventsCalculator';
    logger.info('PlanetaryEventsService initialized');
  }

  async initialize() {
    try {
      await super.initialize();
      logger.info('✅ PlanetaryEventsService initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize PlanetaryEventsService:', error);
      throw error;
    }
  }

  /**
   * Process planetary events calculation
   * @param {Object} params - Calculation parameters
   * @returns {Object} Planetary events analysis
   */
  async processCalculation(params) {
    try {
      this.validateParams(params, ['dateRange']);

      const { dateRange, options = {} } = params;

      // Get planetary events analysis from calculator
      const planetaryEventsData = await this.calculator.getPlanetaryEventsAnalysis(dateRange, options);

      // Add metadata
      planetaryEventsData.type = 'planetary_events';
      planetaryEventsData.generatedAt = new Date().toISOString();
      planetaryEventsData.service = this.serviceName;

      return planetaryEventsData;
    } catch (error) {
      logger.error('PlanetaryEventsService calculation error:', error);
      throw new Error(`Planetary events analysis failed: ${error.message}`);
    }
  }

  /**
   * Format result for service consumption
   * @param {Object} result - Raw calculator result
   * @returns {Object} Formatted result
   */
  formatResult(result) {
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      service: this.serviceName
    };
  }

  /**
   * Validate input parameters
   * @param {Object} input - Input data to validate
   */
  validate(input) {
    if (!input) {
      throw new Error('Input data is required');
    }

    if (!input.dateRange) {
      throw new Error('Date range is required for planetary events analysis');
    }

    return true;
  }

  /**
   * Get service metadata
   * @returns {Object} Service information
   */
  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['getPlanetaryEventsAnalysis'],
      dependencies: ['PlanetaryEventsCalculator']
    };
  }

  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          planetaryEventsAnalysis: true,
          upcomingTransits: true,
          celestialEvents: true
        },
        supportedAnalyses: [
          'planetary_events_analysis',
          'upcoming_transits',
          'celestial_events'
        ]
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = PlanetaryEventsService;