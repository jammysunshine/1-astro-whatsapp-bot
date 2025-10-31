const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');
const { BirthData } = require('../../models');

// Import calculator from legacy structure (for now)
const { WesternChartGenerator } = require('../../../services/astrology/western/calculators/WesternChartGenerator');

/**
 * WesternBirthChartService - Service for Western birth chart calculations
 * Provides Western tropical zodiac birth chart analysis with houses, aspects, and planetary positions
 */
class WesternBirthChartService extends ServiceTemplate {
  constructor() {
    super(new WesternChartGenerator());
    this.serviceName = 'WesternBirthChartService';
    logger.info('WesternBirthChartService initialized');
  }

  /**
   * Validate input data for Western birth chart calculation
   * @param {Object} data - Input data containing birthData
   */
  validate(data) {
    if (!data) {
      throw new Error('Input data is required for Western birth chart calculation');
    }
    
    if (!data.birthData) {
      throw new Error('Birth data is required');
    }

    // Validate birth data with model
    const validatedData = new BirthData(data.birthData);
    validatedData.validate();
    
    return true;
  }

  /**
   * Process Western birth chart calculation using the calculator
   * @param {Object} data - Input data with birthData
   * @returns {Promise<Object>} Raw Western birth chart result
   */
  async processCalculation(data) {
    const { birthData } = data;
    
    // Get Western birth chart data from calculator
    const chartData = await this.calculator.generateWesternChart(birthData);
    
    // Add metadata
    chartData.type = 'western_birth_chart';
    chartData.zodiacType = 'tropical';
    chartData.generatedAt = new Date().toISOString();
    chartData.service = this.serviceName;
    
    return chartData;
  }

  /**
   * Format the Western birth chart result for consistent output
   * @param {Object} result - Raw calculator result
   * @returns {Object} Formatted Western birth chart result
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        type: 'western_birth_chart',
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

  /**
   * Get service metadata
   * @returns {Object} Service metadata
   */
  getMetadata() {
    return {
      ...super.getMetadata(),
      name: 'WesternBirthChartService',
      category: 'western',
      description: 'Service for Western tropical zodiac birth chart calculations',
      version: '1.0.0',
      zodiacType: 'tropical',
      status: 'active'
    };
  }
}

module.exports = WesternBirthChartService;