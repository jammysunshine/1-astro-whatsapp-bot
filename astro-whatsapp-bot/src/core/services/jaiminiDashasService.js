const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');

// Import calculator from legacy structure

class JaiminiDashasService extends ServiceTemplate {
  constructor() {
    super('JaiminiCalculator');
    this.serviceName = 'JaiminiDashasService';
    logger.info('JaiminiDashasService initialized');
  }

  async ljaiminiDashasCalculation(birthData) {
    try {
      // Validate input
      this.validate(birthData);

      // Use Jaimini calculator for dasha calculations
      const result = await this.calculator.calculateJaiminiDashas(birthData, {});

      return result;
    } catch (error) {
      logger.error('JaiminiDashasService calculation error:', error);
      throw new Error(`Jaimini Dashas calculation failed: ${error.message}`);
    }
  }

  /**
   * Get current Jaimini Dasha period
   * @param {Object} params - Calculation parameters
   * @returns {Object} Current Dasha period
   */
  async getCurrentJaiminiDasha(params) {
    try {
      this.validateParams(params, ['birthData']);

      const { birthData } = params;

      // Calculate current dasha period
      const result = await this.calculator.getCurrentJaiminiDasha(birthData);

      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'current_jaimini_dasha',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error getting current Jaimini Dasha:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'current_jaimini_dasha',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get upcoming Jaimini Dasha periods
   * @param {Object} params - Calculation parameters
   * @returns {Object} Upcoming Dasha periods
   */
  async getUpcomingJaiminiDashas(params) {
    try {
      this.validateParams(params, ['birthData']);

      const { birthData, count = 5 } = params;

      // Calculate upcoming dasha periods
      const result = await this.calculator.getUpcomingJaiminiDashas(birthData, count);

      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'upcoming_jaimini_dashas',
          count,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error getting upcoming Jaimini Dashas:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'upcoming_jaimini_dashas',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Calculate Jaimini Chara Dasha
   * @param {Object} params - Calculation parameters
   * @returns {Object} Chara Dasha analysis
   */
  async calculateCharaDasha(params) {
    try {
      this.validateParams(params, ['birthData']);

      const { birthData, options = {} } = params;

      // Calculate Chara Dasha
      const result = await this.calculator.calculateCharaDasha(birthData, options);

      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'chara_dasha',
          timestamp: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      logger.error('❌ Error calculating Chara Dasha:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'chara_dasha',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Calculate Jaimini Sthira Dasha
   * @param {Object} params - Calculation parameters
   * @returns {Object} Sthira Dasha analysis
   */
  async calculateSthiraDasha(params) {
    try {
      this.validateParams(params, ['birthData']);

      const { birthData, options = {} } = params;

      // Calculate Sthira Dasha
      const result = await this.calculator.calculateSthiraDasha(birthData, options);

      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'sthira_dasha',
          timestamp: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      logger.error('❌ Error calculating Sthira Dasha:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'sthira_dasha',
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
        throw new Error(`${field} is required for Jaimini Dashas calculation`);
      }
    }

    return true;
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['calculateJaiminiDashas', 'getCurrentJaiminiDasha', 'getUpcomingJaiminiDashas'],
      dependencies: ['JaiminiCalculator']
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

module.exports = JaiminiDashasService;
