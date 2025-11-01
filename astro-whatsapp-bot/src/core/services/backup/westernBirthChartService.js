const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

class WesternBirthChartService extends ServiceTemplate {
  constructor() {
    super('WesternChartGenerator');
    this.calculatorPath = '../../../services/astrology/western/calculators/WesternChartGenerator';
  }

  async initialize() {
    try {
      await super.initialize(); // Call the ServiceTemplate's initialize method
      logger.info('✅ WesternBirthChartService initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize WesternBirthChartService:', error);
      throw error;
    }
  }

  validateParams(params, required) {
    if (!params) {
      throw new Error('Input data is required for Western birth chart calculation');
    }

    if (!params.birthData) {
      throw new Error('Birth data is required');
    }

    // Validate birth data with model
    const { BirthData } = require('../../models');
    const validatedData = new BirthData(params.birthData);
    validatedData.validate();

    return true;
  }

  async processCalculation(params) {
    try {
      this.validateParams(params, ['birthData']);

      const { birthData, options = {} } = params;

      // Get Western birth chart data from calculator
      const chartData = await this.calculator.generateWesternChart(birthData);

      // Add metadata
      chartData.type = 'western_birth_chart';
      chartData.zodiacType = 'tropical';
      chartData.generatedAt = new Date().toISOString();

      return {
        success: true,
        data: chartData,
        metadata: {
          calculationType: 'western_birth_chart',
          timestamp: new Date().toISOString(),
          zodiacType: 'tropical',
          analysisDepth: options.deepAnalysis ? 'comprehensive' : 'standard'
        }
      };
    } catch (error) {
      logger.error('❌ Error in generateWesternBirthChart:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'western_birth_chart',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          westernBirthChart: true,
          tropicalZodiac: true,
          westernHouses: true,
          westernAspects: true,
          planetaryPositions: true
        },
        supportedAnalyses: [
          'western_birth_chart',
          'tropical_zodiac',
          'western_houses',
          'western_aspects',
          'planetary_positions'
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

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'western',
      methods: ['generateWesternBirthChart'],
      dependencies: []
    };
  }
}

module.exports = WesternBirthChartService;
