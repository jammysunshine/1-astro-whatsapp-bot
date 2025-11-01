const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

/**
 * Palmistry Service
 * Provides palm reading analysis and interpretation of hand lines, mounts, and shapes
 * Extends ServiceTemplate for standardized service architecture
 */
class PalmistryService extends ServiceTemplate {
  constructor() {
    super('PalmistryReader');
    this.serviceName = 'PalmistryService';
    this.calculatorPath = '../services/astrology/palmistryReader';
    logger.info('PalmistryService initialized');
  }

  async initialize() {
    try {
      await super.initialize();
      logger.info('✅ PalmistryService initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize PalmistryService:', error);
      throw error;
    }
  }

  /**
   * Process palmistry reading
   * @param {Object} params - Reading parameters
   * @returns {Object} Palmistry analysis
   */
  async processCalculation(params) {
    try {
      this.validateParams(params, ['handData']);

      const { handData, options = {} } = params;

      // Get palmistry reading from calculator
      const palmistryData = await this.calculator.readPalm(handData, options);

      // Add metadata
      palmistryData.type = 'palmistry';
      palmistryData.generatedAt = new Date().toISOString();
      palmistryData.service = this.serviceName;

      return palmistryData;
    } catch (error) {
      logger.error('PalmistryService calculation error:', error);
      throw new Error(`Palmistry reading failed: ${error.message}`);
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
      throw new Error('Input data is required for palmistry reading');
    }

    if (!input.handData) {
      throw new Error('Hand data is required for palmistry analysis');
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
      category: 'divination',
      methods: ['readPalm', 'processCalculation', 'formatResult'],
      dependencies: ['PalmistryReader']
    };
  }

  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          palmReading: true,
          lineAnalysis: true,
          mountInterpretation: true,
          shapeAnalysis: true
        },
        supportedAnalyses: [
          'palm_reading',
          'line_analysis',
          'mount_interpretation',
          'shape_analysis'
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

module.exports = PalmistryService;
