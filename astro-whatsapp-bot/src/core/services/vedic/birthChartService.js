const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');
const { BirthData } = require('../../models');

// Import calculator from legacy structure (for now)

class BirthChartService extends ServiceTemplate {
  constructor() {
    super('ChartGenerator');
    this.serviceName = 'BirthChartService';
    this.calculatorPath = '../../services/astrology/vedic/calculators/ChartGenerator';
    logger.info('BirthChartService initialized');
  }

  async lbirthChartCalculation(birthData) {
    try {
      // Validate input with model
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

  formatResult(result) {
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      service: this.serviceName
    };
  }

  validate(birthData) {
    if (!birthData) {
      throw new Error('Birth data is required');
    }

    const required = ['birthDate', 'birthTime', 'birthPlace'];
    for (const field of required) {
      if (!birthData[field]) {
        throw new Error(`${field} is required for birth chart generation`);
      }
    }

    return true;
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