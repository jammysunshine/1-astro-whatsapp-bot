const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');
const { BirthData } = require('../../models/BirthData');

/**
 * BirthChartService - Service for generating Vedic astrology birth charts
 * Implements the standard ServiceTemplate pattern with proper dependency injection
 */
class BirthChartService extends ServiceTemplate {
  constructor(chartCalculator = require('../calculators/ChartGenerator')) {
    super('ChartGenerator');
    this.calculatorPath = '../calculators/ChartGenerator';
    this.calculator = new chartCalculator();
    logger.info('BirthChartService initialized');
  }

  async calculateBirthChart(birthData) {
    try {
      // Validate input with BirthData model (handles all validation)
      const validatedData = new BirthData(birthData);
      validatedData.validate();

      // Get chart data from calculator
      const chartData = await this.calculator.generateChart(birthData);

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