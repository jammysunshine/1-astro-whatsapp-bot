const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');
const { BirthData } = require('../../models');

// Import calculator from legacy structure (for now)

/**
 * WesternSolarReturnService - Service for Western solar return calculations
 * Provides solar return chart analysis for yearly predictions using Western tropical zodiac
 */
class WesternSolarReturnService extends ServiceTemplate {
  constructor() {
    super('WesternSolarReturnCalculator');
    this.serviceName = 'WesternSolarReturnService';
    this.calculatorPath = '../../../services/astrology/western/calculators/WesternSolarReturnCalculator';
    logger.info('WesternSolarReturnService initialized');
  }

  /**
   * Validate input data for Western solar return calculation
   * @param {Object} data - Input data containing birthData and optional targetDate
   */
  validate(data) {
    if (!data) {
      throw new Error('Input data is required for Western solar return calculation');
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
   * Process Western solar return calculation using the calculator
   * @param {Object} data - Input data with birthData and optional targetDate
   * @returns {Promise<Object>} Raw Western solar return result
   */
  async processCalculation(data) {
    const { birthData, targetDate = null } = data;
    
    // Get Western solar return data from calculator
    const solarReturnData = await this.calculator.calculateWesternSolarReturn(birthData, targetDate);
    
    // Add metadata
    solarReturnData.type = 'western_solar_return';
    solarReturnData.zodiacType = 'tropical';
    solarReturnData.generatedAt = new Date().toISOString();
    solarReturnData.service = this.serviceName;
    
    return solarReturnData;
  }

  /**
   * Format the Western solar return result for consistent output
   * @param {Object} result - Raw calculator result
   * @returns {Object} Formatted Western solar return result
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        type: 'western_solar_return',
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
      name: 'WesternSolarReturnService',
      category: 'western',
      description: 'Service for Western tropical zodiac solar return calculations',
      version: '1.0.0',
      zodiacType: 'tropical',
      status: 'active',
      dependencies: []
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

module.exports = WesternSolarReturnService;