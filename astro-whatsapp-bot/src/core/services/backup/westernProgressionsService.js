const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');
const { BirthData } = require('../../models');

// Import calculator from legacy structure (for now)

/**
 * WesternProgressionsService - Service for Western progression calculations
 * Provides secondary progressions and solar arc directions using Western tropical zodiac
 */
class WesternProgressionsService extends ServiceTemplate {
  constructor() {
    super('WesternProgressionsCalculator');
    this.serviceName = 'WesternProgressionsService';
    this.calculatorPath = '../../../services/astrology/western/calculators/WesternProgressionsCalculator';
    logger.info('WesternProgressionsService initialized');
  }

  /**
   * Validate input data for Western progression calculation
   * @param {Object} data - Input data containing birthData and optional targetDate
   */
  validate(data) {
    if (!data) {
      throw new Error('Input data is required for Western progression calculation');
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
   * Process Western progression calculation using the calculator
   * @param {Object} data - Input data with birthData and optional targetDate
   * @returns {Promise<Object>} Raw Western progression result
   */
  async processCalculation(data) {
    const { birthData, targetDate = null, progressionType = 'secondary' } = data;

    // Get Western progression data from calculator
    const progressionData = await this.calculator.calculateWesternProgressions(birthData, targetDate, progressionType);

    // Add metadata
    progressionData.type = 'western_progressions';
    progressionData.progressionType = progressionType;
    progressionData.zodiacType = 'tropical';
    progressionData.generatedAt = new Date().toISOString();
    progressionData.service = this.serviceName;

    return progressionData;
  }

  /**
   * Format the Western progression result for consistent output
   * @param {Object} result - Raw calculator result
   * @returns {Object} Formatted Western progression result
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        type: 'western_progressions',
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
      name: 'WesternProgressionsService',
      category: 'western',
      description: 'Service for Western tropical zodiac progression calculations',
      version: '1.0.0',
      zodiacType: 'tropical',
      supportedProgressions: ['secondary', 'solar_arc'],
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

module.exports = WesternProgressionsService;
