const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');

/**
 * Cosmic Events Service
 * Provides analysis of significant astronomical events and planetary phenomena
 * Extends ServiceTemplate for standardized service architecture
 */
class CosmicEventsService extends ServiceTemplate {
  constructor() {
    super('CosmicEventsCalculator');
    this.serviceName = 'CosmicEventsService';
    this.calculatorPath =
      '../services/astrology/vedic/calculators/CosmicEventsCalculator';
    logger.info('CosmicEventsService initialized');
  }

  async initialize() {
    try {
      await super.initialize();
      logger.info('✅ CosmicEventsService initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize CosmicEventsService:', error);
      throw error;
    }
  }

  /**
   * Process cosmic events calculation
   * @param {Object} params - Calculation parameters
   * @returns {Object} Cosmic events analysis
   */
  async processCalculation(params) {
    try {
      this.validateParams(params, ['dateRange']);

      const { dateRange, options = {} } = params;

      // Get cosmic events analysis from calculator
      const cosmicEventsData = await this.calculator.getCosmicEventsAnalysis(
        dateRange,
        options
      );

      // Add metadata
      cosmicEventsData.type = 'cosmic_events';
      cosmicEventsData.generatedAt = new Date().toISOString();
      cosmicEventsData.service = this.serviceName;

      return cosmicEventsData;
    } catch (error) {
      logger.error('CosmicEventsService calculation error:', error);
      throw new Error(`Cosmic events analysis failed: ${error.message}`);
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
      throw new Error('Date range is required for cosmic events analysis');
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
      methods: ['getCosmicEventsAnalysis'],
      dependencies: ['CosmicEventsCalculator']
    };
  }

  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          cosmicEventsAnalysis: true,
          astronomicalPhenomena: true,
          planetaryInfluences: true
        },
        supportedAnalyses: [
          'cosmic_events_analysis',
          'astronomical_phenomena',
          'planetary_influences'
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

module.exports = CosmicEventsService;
