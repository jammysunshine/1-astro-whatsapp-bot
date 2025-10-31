const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');

// Import calculator from legacy structure
const { AsteroidCalculator } = require('../../../services/astrology/vedic/calculators/AsteroidCalculator');

class AsteroidsService extends ServiceTemplate {
  constructor() {
    super(new AsteroidCalculator());
    this.serviceName = 'AsteroidsService';
    logger.info('AsteroidsService initialized');
  }

  async processCalculation(birthData) {
    try {
      // Validate input
      this.validate(birthData);

      // Calculate asteroid positions for default asteroids
      const asteroids = ['Ceres', 'Pallas', 'Juno', 'Vesta'];
      const result = await this.calculator.calculateAsteroidPositions(birthData, asteroids, {});

      return result;
    } catch (error) {
      logger.error('AsteroidsService calculation error:', error);
      throw new Error(`Asteroid calculation failed: ${error.message}`);
    }
  }

  /**
   * Analyze asteroid aspects to natal planets
   * @param {Object} params - Calculation parameters
   * @returns {Object} Asteroid aspects analysis
   */
  async analyzeAsteroidAspects(params) {
    try {
      this.validateParams(params, ['birthData']);
      
      const { birthData, asteroids = ['Ceres', 'Pallas', 'Juno', 'Vesta'], options = {} } = params;
      
      // Analyze asteroid aspects
      const result = await this.calculator.analyzeAsteroidAspects(birthData, asteroids, options);
      
      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'asteroid_aspects',
          asteroids,
          timestamp: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      logger.error('❌ Error analyzing asteroid aspects:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'asteroid_aspects',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Calculate asteroid transits
   * @param {Object} params - Calculation parameters
   * @returns {Object} Asteroid transits analysis
   */
  async calculateAsteroidTransits(params) {
    try {
      this.validateParams(params, ['birthData']);
      
      const { birthData, startDate, endDate, asteroids = ['Ceres', 'Pallas', 'Juno', 'Vesta'], options = {} } = params;
      
      // Calculate asteroid transits
      const result = await this.calculator.calculateAsteroidTransits(birthData, startDate, endDate, asteroids, options);
      
      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'asteroid_transits',
          period: { startDate, endDate },
          asteroids,
          timestamp: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      logger.error('❌ Error calculating asteroid transits:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'asteroid_transits',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get Ceres analysis
   * @param {Object} params - Calculation parameters
   * @returns {Object} Ceres analysis
   */
  async getCeresAnalysis(params) {
    try {
      this.validateParams(params, ['birthData']);
      
      const { birthData, options = {} } = params;
      
      // Get Ceres analysis
      const result = await this.calculator.getCeresAnalysis(birthData, options);
      
      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'ceres_analysis',
          timestamp: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      logger.error('❌ Error getting Ceres analysis:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'ceres_analysis',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get Pallas analysis
   * @param {Object} params - Calculation parameters
   * @returns {Object} Pallas analysis
   */
  async getPallasAnalysis(params) {
    try {
      this.validateParams(params, ['birthData']);
      
      const { birthData, options = {} } = params;
      
      // Get Pallas analysis
      const result = await this.calculator.getPallasAnalysis(birthData, options);
      
      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'pallas_analysis',
          timestamp: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      logger.error('❌ Error getting Pallas analysis:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'pallas_analysis',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get Juno analysis
   * @param {Object} params - Calculation parameters
   * @returns {Object} Juno analysis
   */
  async getJunoAnalysis(params) {
    try {
      this.validateParams(params, ['birthData']);
      
      const { birthData, options = {} } = params;
      
      // Get Juno analysis
      const result = await this.calculator.getJunoAnalysis(birthData, options);
      
      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'juno_analysis',
          timestamp: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      logger.error('❌ Error getting Juno analysis:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'juno_analysis',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get Vesta analysis
   * @param {Object} params - Calculation parameters
   * @returns {Object} Vesta analysis
   */
  async getVestaAnalysis(params) {
    try {
      this.validateParams(params, ['birthData']);
      
      const { birthData, options = {} } = params;
      
      // Get Vesta analysis
      const result = await this.calculator.getVestaAnalysis(birthData, options);
      
      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'vesta_analysis',
          timestamp: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      logger.error('❌ Error getting Vesta analysis:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'vesta_analysis',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get Chiron analysis
   * @param {Object} params - Calculation parameters
   * @returns {Object} Chiron analysis
   */
  async getChironAnalysis(params) {
    try {
      this.validateParams(params, ['birthData']);
      
      const { birthData, options = {} } = params;
      
      // Get Chiron analysis
      const result = await this.calculator.getChironAnalysis(birthData, options);
      
      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'chiron_analysis',
          timestamp: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      logger.error('❌ Error getting Chiron analysis:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'chiron_analysis',
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
        throw new Error(`${field} is required for asteroid analysis`);
      }
    }

    return true;
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['calculateAsteroidPositions', 'analyzeAsteroidAspects', 'calculateAsteroidTransits'],
      dependencies: ['AsteroidCalculator']
    };
  }
}

module.exports = AsteroidsService;