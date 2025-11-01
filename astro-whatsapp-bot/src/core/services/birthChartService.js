const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');
const { BirthData } = require('../../models/BirthData');

/**
 * BirthChartService - Service for generating Vedic astrology birth charts
 * Implements the standard ServiceTemplate pattern with proper dependency injection
 * Updated to use new VedicCalculator for enhanced Vedic astrology calculations
 */
class BirthChartService extends ServiceTemplate {
  constructor(calculatorName = 'VedicCalculator') {
    super(calculatorName);
    this.calculatorPath = './calculators/VedicCalculator';
    logger.info(`BirthChartService initialized with ${calculatorName}`);
  }

  async calculateBirthChart(birthData) {
    try {
      // Validate input with BirthData model (handles all validation)
      const validatedData = new BirthData(birthData);
      validatedData.validate();

      // Initialize VedicCalculator if needed
      if (!this.calculator.initialized) {
        await this.calculator.initialize();
      }

      // Get chart data from VedicCalculator
      const chartData = await this.calculator.calculateBirthChart(validatedData);

      // Add metadata
      chartData.type = 'vedic';
      chartData.generatedAt = new Date().toISOString();
      chartData.service = this.serviceName;

      return chartData;
    } catch (error) {
      logger.error('BirthChartService calculation error:', error);
      throw new Error(`Birth chart generation failed: ${error.message}`);
    }
  }

  /**
   * Format the birth chart result for consistent output
   * @param {Object} result - Raw calculator result
   * @returns {Object} Formatted result
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        service: this.serviceName
      };
    }

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      service: this.serviceName
    };
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['generateVedicKundli'],
      dependencies: ['ChartGenerator']
    };
  }

  async processCalculation(data) {
    return await this.calculateBirthChart(data);
  }

  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          // Add service-specific features here
        },
        supportedAnalyses: [
          // Add supported analyses here
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

module.exports = BirthChartService;