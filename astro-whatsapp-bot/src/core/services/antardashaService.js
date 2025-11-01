const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

/**
 * Antardasha Service
 * Provides analysis of Antardasha periods within major Dasha cycles
 * Extends ServiceTemplate for standardized service architecture
 */
class AntardashaService extends ServiceTemplate {
  constructor() {
    super('AntardashaCalculator');
    this.serviceName = 'AntardashaService';
    this.calculatorPath = '../services/astrology/vedic/calculators/AntardashaCalculator';
    logger.info('AntardashaService initialized');
  }

  async initialize() {
    try {
      await super.initialize();
      logger.info('✅ AntardashaService initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize AntardashaService:', error);
      throw error;
    }
  }

  /**
   * Process Antardasha calculation
   * @param {Object} params - Calculation parameters
   * @returns {Object} Antardasha analysis
   */
  async processCalculation(params) {
    try {
      this.validateParams(params, ['birthData']);

      const { birthData, options = {} } = params;

      // Get Antardasha analysis from calculator
      const antardashaData = await this.calculator.getAntardashaAnalysis(birthData, options);

      // Add metadata
      antardashaData.type = 'antardasha';
      antardashaData.generatedAt = new Date().toISOString();
      antardashaData.service = this.serviceName;

      return antardashaData;
    } catch (error) {
      logger.error('AntardashaService calculation error:', error);
      throw new Error(`Antardasha analysis failed: ${error.message}`);
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

    if (!input.birthData) {
      throw new Error('Birth data is required for Antardasha analysis');
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
      methods: ['getAntardashaAnalysis'],
      dependencies: ['AntardashaCalculator']
    };
  }

  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          antardashaAnalysis: true,
          dashaTiming: true,
          predictiveAstrology: true
        },
        supportedAnalyses: [
          'antardasha_analysis',
          'dasha_timing',
          'predictive_astrology'
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

module.exports = AntardashaService;