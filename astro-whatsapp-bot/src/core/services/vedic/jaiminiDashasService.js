const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');

/**
 * Jaimini Dashas Service
 * Implements Jaimini Dasha system calculations using Swiss Ephemeris
 */
class JaiminiDashasService extends ServiceTemplate {
  constructor() {
    super('JaiminiDashasService');
    this.calculatorPath = '../../../services/astrology/vedic/calculators/JaiminiCalculator';
  }

  /**
   * Initialize the Jaimini Dashas service
   */
  async initialize() {
    try {
      await super.initialize();
      logger.info('✅ JaiminiDashasService initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize JaiminiDashasService:', error);
      throw error;
    }
  }

  /**
   * Calculate Jaimini Dashas
   * @param {Object} params - Calculation parameters
   * @returns {Object} Jaimini Dasha analysis
   */
  async calculateJaiminiDashas(params) {
    try {
      this.validateParams(params, ['birthData']);
      
      const { birthData, options = {} } = params;
      
      // Use Jaimini calculator for dasha calculations
      const result = await this.calculator.calculateJaiminiDashas(birthData, options);
      
      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'jaimini_dashas',
          timestamp: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      logger.error('❌ Error calculating Jaimini Dashas:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'jaimini_dashas',
          timestamp: new Date().toISOString()
        }
      };
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

  /**
   * Get service health status
   * @returns {Object} Health status
   */
  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      
      return {
        ...baseHealth,
        features: {
          jaiminiDashas: true,
          charaDasha: true,
          sthiraDasha: true,
          currentDasha: true,
          upcomingDashas: true
        }
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