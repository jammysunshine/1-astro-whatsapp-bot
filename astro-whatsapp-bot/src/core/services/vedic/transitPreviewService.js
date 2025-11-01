const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');
const { BirthData } = require('../../models');

/**
 * TransitPreviewService - Service for generating transit previews
 *
 * Provides quick previews of upcoming transits for the next few days, focusing on the most
 * immediate planetary influences and their potential effects on an individual's natal chart.
 */
class TransitPreviewService extends ServiceTemplate {
  constructor() {
    super('TransitCalculator'); // Primary calculator for this service
    this.serviceName = 'TransitPreviewService';
    this.calculatorPath = '../../../services/astrology/vedic/calculators/TransitCalculator';
    logger.info('TransitPreviewService initialized');
  }

  /**
   * Main calculation method for Transit Preview.
   * @param {Object} birthData - User's birth data.
   * @returns {Promise<Object>} Comprehensive transit preview analysis.
   */
  async processCalculation(birthData) {
    try {
      // Ensure calculator is loaded
      if (!this.calculator) {
        await this.initialize();
      }

      this._validateInput(birthData);

      // Generate transit preview for next 30 days by default
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const result = await this.calculator.generateTransitPreview(birthData, startDate, endDate, {});

      return result;
    } catch (error) {
      logger.error('TransitPreviewService processCalculation error:', error);
      throw new Error(`Transit preview calculation failed: ${error.message}`);
    }
  }

  /**
   * Validates input data for transit preview.
   * @param {Object} birthData - Birth data to validate.
   * @private
   */
  _validateInput(birthData) {
    if (!birthData) {
      throw new Error('Birth data is required for transit preview calculation');
    }
    const validatedData = new BirthData(birthData);
    validatedData.validate();
  }

  /**
   * Formats the transit preview result for consistent output.
   * @param {Object} result - Raw calculator result.
   * @returns {Object} Formatted transit preview result.
   */
  formatResult(result) {
    return {
      success: true,
      data: result,
      summary: result.summary || 'Transit preview completed',
      metadata: {
        serviceName: this.serviceName,
        calculationType: 'Transit Preview',
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Gets monthly transit forecast.
   * @param {Object} params - Calculation parameters.
   * @returns {Promise<Object>} Monthly transit forecast.
   */
  async getMonthlyTransitForecast(params) {
    try {
      // Ensure calculator is loaded
      if (!this.calculator) {
        await this.initialize();
      }

      this._validateInput(params.birthData);

      const { birthData, year, month, options = {} } = params;

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
      logger.error('❌ Error in getMonthlyTransitForecast:', error);
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
   * Gets yearly transit forecast.
   * @param {Object} params - Calculation parameters.
   * @returns {Promise<Object>} Yearly transit forecast.
   */
  async getYearlyTransitForecast(params) {
    try {
      // Ensure calculator is loaded
      if (!this.calculator) {
        await this.initialize();
      }

      this._validateInput(params.birthData);

      const { birthData, year, options = {} } = params;

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
      logger.error('❌ Error in getYearlyTransitForecast:', error);
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
   * Gets weekly transit preview.
   * @param {Object} params - Calculation parameters.
   * @returns {Promise<Object>} Weekly transit preview.
   */
  async getWeeklyTransitPreview(params) {
    try {
      // Ensure calculator is loaded
      if (!this.calculator) {
        await this.initialize();
      }

      this._validateInput(params.birthData);

      const { birthData, startDate, options = {} } = params;

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
      logger.error('❌ Error in getWeeklyTransitPreview:', error);
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
   * Gets daily transit highlights.
   * @param {Object} params - Calculation parameters.
   * @returns {Promise<Object>} Daily transit highlights.
   */
  async getDailyTransitHighlights(params) {
    try {
      // Ensure calculator is loaded
      if (!this.calculator) {
        await this.initialize();
      }

      this._validateInput(params.birthData);

      const { birthData, date, options = {} } = params;

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
      logger.error('❌ Error in getDailyTransitHighlights:', error);
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
   * Gets critical transit dates.
   * @param {Object} params - Calculation parameters.
   * @returns {Promise<Object>} Critical transit dates.
   */
  async getCriticalTransitDates(params) {
    try {
      // Ensure calculator is loaded
      if (!this.calculator) {
        await this.initialize();
      }

      this._validateInput(params.birthData);

      const { birthData, startDate, endDate, options = {} } = params;

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
      logger.error('❌ Error in getCriticalTransitDates:', error);
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
   * Returns metadata for the service.
   * @returns {Object} Service metadata.
   */
  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['processCalculation', 'getMonthlyTransitForecast', 'getYearlyTransitForecast', 'getWeeklyTransitPreview', 'getDailyTransitHighlights', 'getCriticalTransitDates'],
      dependencies: [], // Managed by ServiceTemplate
      description: 'Service for generating transit previews and forecasts.'
    };
  }

  /**
   * Returns help information for the service.
   * @returns {string} Help text.
   */
  getHelp() {
    return `
🔭 **Transit Preview Service - Upcoming Planetary Influences**

**Purpose:** Provides quick previews and forecasts of upcoming planetary transits, focusing on their immediate and potential effects on your natal chart.

**Required Inputs:**
• Birth data (Object with birthDate, birthTime, birthPlace)

**Analysis Includes:**
• **Monthly Transit Forecast:** Overview of planetary movements and their themes for the month.
• **Yearly Transit Forecast:** Long-term outlook on major planetary influences for the year.
• **Weekly Transit Preview:** Short-term insights into the week's energetic shifts.
• **Daily Transit Highlights:** Key planetary events and their daily impact.
• **Critical Transit Dates:** Identification of significant dates for major planetary aspects.

**Example Usage:**
"Get my monthly transit forecast for November."
"What are the daily transit highlights for tomorrow based on my birth data?"
"Provide a yearly transit forecast for 2026."

**Output Format:**
Reports with detailed transit information, forecasts, and highlights for various timeframes.
    `.trim();
  }
}

module.exports = TransitPreviewService;
