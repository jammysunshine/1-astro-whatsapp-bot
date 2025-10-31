const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');
const { BirthData } = require('../../models');

// Import calculator from legacy structure (for now)

/**
 * WesternTransitsService - Service for Western transit calculations
 * Provides current and future planetary transit analysis using Western tropical zodiac
 */
class WesternTransitsService extends ServiceTemplate {
  constructor() {
    super('uwesternTransitsService'));
    this.serviceName = 'WesternTransitsService';
    logger.info('WesternTransitsService initialized');
  }

  /**
   * Validate input data for Western transit calculation
   * @param {Object} data - Input data containing birthData and optional targetDate
   */
  validate(data) {
    if (!data) {
      throw new Error('Input data is required for Western transit calculation');
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
   * Process Western transit calculation using the calculator
   * @param {Object} data - Input data with birthData and optional targetDate
   * @returns {Promise<Object>} Raw Western transit result
   */
  async processCalculation(data) {
    const { birthData, targetDate = null } = data;
    
    // Get Western transit data from calculator
    const transitData = await this.calculator.calculateWesternTransits(birthData, targetDate);
    
    // Add metadata
    transitData.type = 'western_transits';
    transitData.zodiacType = 'tropical';
    transitData.generatedAt = new Date().toISOString();
    transitData.service = this.serviceName;
    
    return transitData;
  }

  /**
   * Format the Western transit result for consistent output
   * @param {Object} result - Raw calculator result
   * @returns {Object} Formatted Western transit result
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        type: 'western_transits',
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
      name: 'WesternTransitsService',
      category: 'western',
      description: 'Service for Western tropical zodiac transit calculations',
      version: '1.0.0',
      zodiacType: 'tropical',
      status: 'active'
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

module.exports = WesternTransitsService;