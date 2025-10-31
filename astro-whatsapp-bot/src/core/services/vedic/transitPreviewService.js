const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');

/**
 * Transit Preview Service
 * Implements transit preview and forecasting using Swiss Ephemeris
 */
class TransitPreviewService extends ServiceTemplate {
  constructor() {
    super('TransitPreviewService');
    this.calculatorPath = '../../../services/astrology/vedic/calculators/TransitCalculator';
  }

  /**
   * Initialize the Transit Preview service
   */
  async initialize() {
    try {
      await super.initialize();
      logger.info('✅ TransitPreviewService initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize TransitPreviewService:', error);
      throw error;
    }
  }

  /**
   * Generate transit preview
   * @param {Object} params - Calculation parameters
   * @returns {Object} Transit preview
   */
  async generateTransitPreview(params) {
    try {
      this.validateParams(params, ['birthData']);
      
      const { birthData, startDate, endDate, options = {} } = params;
      
      // Generate transit preview
      const result = await this.calculator.generateTransitPreview(birthData, startDate, endDate, options);
      
      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'transit_preview',
          period: { startDate, endDate },
          timestamp: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      logger.error('❌ Error generating transit preview:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'transit_preview',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get monthly transit forecast
   * @param {Object} params - Calculation parameters
   * @returns {Object} Monthly transit forecast
   */
  async getMonthlyTransitForecast(params) {
    try {
      this.validateParams(params, ['birthData']);
      
      const { birthData, year, month, options = {} } = params;
      
      // Get monthly transit forecast
      const result = await this.calculator.getMonthlyTransitForecast(birthData, year, month, options);
      
      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'monthly_transit_forecast',
          year,
          month,
          timestamp: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      logger.error('❌ Error getting monthly transit forecast:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'monthly_transit_forecast',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get yearly transit forecast
   * @param {Object} params - Calculation parameters
   * @returns {Object} Yearly transit forecast
   */
  async getYearlyTransitForecast(params) {
    try {
      this.validateParams(params, ['birthData']);
      
      const { birthData, year, options = {} } = params;
      
      // Get yearly transit forecast
      const result = await this.calculator.getYearlyTransitForecast(birthData, year, options);
      
      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'yearly_transit_forecast',
          year,
          timestamp: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      logger.error('❌ Error getting yearly transit forecast:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'yearly_transit_forecast',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get weekly transit preview
   * @param {Object} params - Calculation parameters
   * @returns {Object} Weekly transit preview
   */
  async getWeeklyTransitPreview(params) {
    try {
      this.validateParams(params, ['birthData']);
      
      const { birthData, startDate, options = {} } = params;
      
      // Get weekly transit preview
      const result = await this.calculator.getWeeklyTransitPreview(birthData, startDate, options);
      
      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'weekly_transit_preview',
          startDate,
          timestamp: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      logger.error('❌ Error getting weekly transit preview:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'weekly_transit_preview',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get daily transit highlights
   * @param {Object} params - Calculation parameters
   * @returns {Object} Daily transit highlights
   */
  async getDailyTransitHighlights(params) {
    try {
      this.validateParams(params, ['birthData']);
      
      const { birthData, date, options = {} } = params;
      
      // Get daily transit highlights
      const result = await this.calculator.getDailyTransitHighlights(birthData, date, options);
      
      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'daily_transit_highlights',
          date,
          timestamp: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      logger.error('❌ Error getting daily transit highlights:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'daily_transit_highlights',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get critical transit dates
   * @param {Object} params - Calculation parameters
   * @returns {Object} Critical transit dates
   */
  async getCriticalTransitDates(params) {
    try {
      this.validateParams(params, ['birthData']);
      
      const { birthData, startDate, endDate, options = {} } = params;
      
      // Get critical transit dates
      const result = await this.calculator.getCriticalTransitDates(birthData, startDate, endDate, options);
      
      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'critical_transit_dates',
          period: { startDate, endDate },
          timestamp: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      logger.error('❌ Error getting critical transit dates:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'critical_transit_dates',
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
          transitPreview: true,
          monthlyForecast: true,
          yearlyForecast: true,
          weeklyPreview: true,
          dailyHighlights: true,
          criticalDates: true
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

module.exports = TransitPreviewService;