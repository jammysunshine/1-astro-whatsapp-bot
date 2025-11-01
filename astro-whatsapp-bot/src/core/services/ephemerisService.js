const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');

/**
 * Ephemeris Service
 * Provides detailed planetary position tables and astronomical ephemeris data
 * Extends ServiceTemplate for standardized service architecture
 */
class EphemerisService extends ServiceTemplate {
  constructor() {
    super('SwissEphemerisCalculator');
    this.serviceName = 'EphemerisService';
    this.calculatorPath =
      './calculators/SwissEphemerisCalculator';
    logger.info('EphemerisService initialized');
  }

  async initialize() {
    try {
      await super.initialize();
      logger.info('✅ EphemerisService initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize EphemerisService:', error);
      throw error;
    }
  }

  /**
   * Process ephemeris calculation
   * @param {Object} params - Calculation parameters
   * @returns {Object} Ephemeris data
   */
  async processCalculation(params) {
    try {
      this.validateParams(params, ['startDate', 'endDate']);

      const { startDate, endDate, options = {} } = params;

      // Get ephemeris data from calculator
      const ephemerisData = await this.calculator.generateEphemeris(
        startDate,
        endDate,
        options
      );

      // Add metadata
      ephemerisData.type = 'ephemeris';
      ephemerisData.generatedAt = new Date().toISOString();
      ephemerisData.service = this.serviceName;

      return ephemerisData;
    } catch (error) {
      logger.error('EphemerisService calculation error:', error);
      throw new Error(`Ephemeris generation failed: ${error.message}`);
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

    if (!input.startDate) {
      throw new Error('Start date is required for ephemeris generation');
    }

    if (!input.endDate) {
      throw new Error('End date is required for ephemeris generation');
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
      methods: ['generateEphemeris'],
      dependencies: ['EphemerisCalculator']
    };
  }

  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          ephemerisGeneration: true,
          planetaryPositions: true,
          astronomicalData: true
        },
        supportedAnalyses: [
          'ephemeris_generation',
          'planetary_positions',
          'astronomical_data'
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

module.exports = EphemerisService;
