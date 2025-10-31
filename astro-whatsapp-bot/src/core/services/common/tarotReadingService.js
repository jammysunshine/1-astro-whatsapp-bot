const ServiceTemplate = require('../ServiceTemplate');

/**
 * TarotReadingService - Core service for tarot card readings
 * Follows Handler → Core Service → Calculator architecture pattern
 */
class TarotReadingService extends ServiceTemplate {
  constructor() {
    super(tarotReader);
  }

  /**
   * Validate input data for tarot reading
   * @param {Object} data - Input data containing user and spread type
   */
  validate(data) {
    if (!data) {
      throw new Error('Input data is required for tarot reading');
    }
    
    // Spread type is optional, defaults to 'single'
    if (data.spreadType && typeof data.spreadType !== 'string') {
      throw new Error('Spread type must be a string');
    }
    
    return true;
  }

  /**
   * Process tarot reading calculation using the calculator
   * @param {Object} data - Input data with user and spread type
   * @returns {Promise<Object>} Raw tarot reading result
   */
  async processCalculation(data) {
    const { user, spreadType = 'single' } = data;
    
    // Use the tarotReader calculator to generate reading
    const result = await this.calculator.generateTarotReading(user, spreadType);
    
    return result;
  }

  /**
   * Format the tarot reading result for consistent output
   * @param {Object} result - Raw calculator result
   * @returns {Object} Formatted tarot reading result
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        type: result.type || 'unknown',
        cards: [],
        interpretation: '',
        advice: ''
      };
    }

    return {
      success: true,
      type: result.type,
      cards: result.cards || [],
      interpretation: result.interpretation || '',
      advice: result.advice || '',
      personalized: result.personalized || false,
      userSign: result.userSign || null,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get service metadata
   * @returns {Object} Service metadata
   */
  getMetadata() {
    return {
      ...super.getMetadata(),
      name: 'TarotReadingService',
      category: 'divination',
      description: 'Core service for tarot card readings with multiple spread types',
      version: '1.0.0',
      supportedSpreads: ['single', 'three', 'three-card'],
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

module.exports = TarotReadingService;