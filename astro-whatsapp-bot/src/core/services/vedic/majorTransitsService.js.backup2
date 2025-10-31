const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');

// Import calculator from legacy structure
const { SignificantTransitsCalculator } = require('../../../services/astrology/vedic/calculators/SignificantTransitsCalculator');

class MajorTransitsService extends ServiceTemplate {
  constructor() {
    super('umajorTransitsService'));
    this.serviceName = 'MajorTransitsService';
    logger.info('MajorTransitsService initialized');
  }

  async processCalculation(birthData) {
    try {
      // Validate input
      this.validate(birthData);

      // Identify major transits for next year by default
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);

      const result = await this.calculator.identifyMajorTransits(birthData, startDate, endDate, {});

      return result;
    } catch (error) {
      logger.error('MajorTransitsService calculation error:', error);
      throw new Error(`Major transits calculation failed: ${error.message}`);
    }
  }

  /**
   * Get current major transits
   * @param {Object} params - Calculation parameters
   * @returns {Object} Current major transits
   */
  async getCurrentMajorTransits(params) {
    try {
      this.validateParams(params, ['birthData']);
      
      const { birthData, options = {} } = params;
      
      // Get current major transits
      const result = await this.calculator.getCurrentMajorTransits(birthData, options);
      
      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'current_major_transits',
          timestamp: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      logger.error('❌ Error getting current major transits:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'current_major_transits',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get upcoming major transits
   * @param {Object} params - Calculation parameters
   * @returns {Object} Upcoming major transits
   */
  async getUpcomingMajorTransits(params) {
    try {
      this.validateParams(params, ['birthData']);
      
      const { birthData, months = 12, options = {} } = params;
      
      // Get upcoming major transits
      const result = await this.calculator.getUpcomingMajorTransits(birthData, months, options);
      
      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'upcoming_major_transits',
          months,
          timestamp: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      logger.error('❌ Error getting upcoming major transits:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'upcoming_major_transits',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Analyze Saturn returns
   * @param {Object} params - Calculation parameters
   * @returns {Object} Saturn returns analysis
   */
  async analyzeSaturnReturns(params) {
    try {
      this.validateParams(params, ['birthData']);
      
      const { birthData, options = {} } = params;
      
      // Analyze Saturn returns
      const result = await this.calculator.analyzeSaturnReturns(birthData, options);
      
      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'saturn_returns',
          timestamp: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      logger.error('❌ Error analyzing Saturn returns:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'saturn_returns',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Analyze Jupiter returns
   * @param {Object} params - Calculation parameters
   * @returns {Object} Jupiter returns analysis
   */
  async analyzeJupiterReturns(params) {
    try {
      this.validateParams(params, ['birthData']);
      
      const { birthData, options = {} } = params;
      
      // Analyze Jupiter returns
      const result = await this.calculator.analyzeJupiterReturns(birthData, options);
      
      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'jupiter_returns',
          timestamp: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      logger.error('❌ Error analyzing Jupiter returns:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'jupiter_returns',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Analyze outer planet transits
   * @param {Object} params - Calculation parameters
   * @returns {Object} Outer planet transits analysis
   */
  async analyzeOuterPlanetTransits(params) {
    try {
      this.validateParams(params, ['birthData']);
      
      const { birthData, startDate, endDate, planets = ['Uranus', 'Neptune', 'Pluto'], options = {} } = params;
      
      // Analyze outer planet transits
      const result = await this.calculator.analyzeOuterPlanetTransits(birthData, startDate, endDate, planets, options);
      
      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'outer_planet_transits',
          period: { startDate, endDate },
          planets,
          timestamp: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      logger.error('❌ Error analyzing outer planet transits:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'outer_planet_transits',
          timestamp: new Date().toISOString()
        }
      };
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
        throw new Error(`${field} is required for major transits analysis`);
      }
    }

    return true;
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['identifyMajorTransits', 'getCurrentMajorTransits', 'getUpcomingMajorTransits'],
      dependencies: ['SignificantTransitsCalculator']
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

module.exports = MajorTransitsService;