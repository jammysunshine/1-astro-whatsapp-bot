const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

/**
 * Seasonal Events Service
 * Provides analysis of seasonal astronomical events and their astrological significance
 * Extends ServiceTemplate for standardized service architecture
 */
class SeasonalEventsService extends ServiceTemplate {
  constructor() {
    super('SeasonalEventsCalculator');
    this.serviceName = 'SeasonalEventsService';
    this.calculatorPath = '../services/astrology/vedic/calculators/SeasonalEventsCalculator';
    logger.info('SeasonalEventsService initialized');
  }

  async initialize() {
    try {
      await super.initialize();
      logger.info('✅ SeasonalEventsService initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize SeasonalEventsService:', error);
      throw error;
    }
  }

  /**
   * Process seasonal events calculation
   * @param {Object} params - Calculation parameters
   * @returns {Object} Seasonal events analysis
   */
  async processCalculation(params) {
    try {
      this.validateParams(params, ['dateRange']);

      const { dateRange, options = {} } = params;

      // Get seasonal events analysis from calculator
      const seasonalEventsData = await this.calculator.getSeasonalEventsAnalysis(dateRange, options);

      // Add metadata
      seasonalEventsData.type = 'seasonal_events';
      seasonalEventsData.generatedAt = new Date().toISOString();
      seasonalEventsData.service = this.serviceName;

      return seasonalEventsData;
    } catch (error) {
      logger.error('SeasonalEventsService calculation error:', error);
      throw new Error(`Seasonal events analysis failed: ${error.message}`);
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
      throw new Error('Date range is required for seasonal events analysis');
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
      methods: ['getSeasonalEventsAnalysis'],
      dependencies: ['SeasonalEventsCalculator']
    };
  }

  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          seasonalEventsAnalysis: true,
          astronomicalEvents: true,
          seasonalTransitions: true
        },
        supportedAnalyses: [
          'seasonal_events_analysis',
          'astronomical_events',
          'seasonal_transitions'
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

module.exports = SeasonalEventsService;