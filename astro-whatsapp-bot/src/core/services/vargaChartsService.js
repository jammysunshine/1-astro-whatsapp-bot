/**
const ServiceTemplate = require('./ServiceTemplate');
 * Varga Charts Service
 *
 * Provides Vedic divisional charts analysis using traditional Indian astrology divisions
 * with Swiss Ephemeris integration for precise chart calculations.
 */

const logger = require('../../../utils/logger');

class VargaChartsService extends ServiceTemplate {
  constructor() {
    super('VargaCharts');
    this.serviceName = 'VargaChartsService';
    this.calculatorPath = '../calculators/VargaCharts'; // Assuming this path for the main calculator
    logger.info('VargaChartsService initialized');
  }

  /**
   * Execute complete Varga charts analysis
   * @param {Object} birthData - User birth data
   * @param {Array} vargas - Specific vargas to calculate (optional)
   * @returns {Promise<Object>} Complete divisional charts analysis
   */
  async processCalculation(birthData, vargas = null) {
    try {
      this._validateInput(birthData);

      // Default vargas if not specified
      const defaultVargas = [
        'RASHI',
        'HORA',
        'DREKKANA',
        'CHATURTHAMSA',
        'SAPTAMSA',
        'NAVAMSA',
        'DASHAMSA'
      ];
      const selectedVargas = vargas || defaultVargas;

      // Get comprehensive varga charts analysis
      const analysis = await this.calculator.calculateVargaCharts(
        birthData,
        selectedVargas
      );

      // Format result for service consumption
      return this._formatResult(analysis);
    } catch (error) {
      logger.error('VargaChartsService error:', error);
      throw new Error(`Varga charts analysis failed: ${error.message}`);
    }
  }

  /**
   * Get specific varga chart analysis
   * @param {Object} birthData - User birth data
   * @param {string} vargaName - Name of specific varga chart
   * @returns {Promise<Object>} Specific varga chart data
   */
  async getVargaChart(birthData, vargaName) {
    try {
      this._validateInput(birthData);

      if (!vargaName) {
        throw new Error('Varga name is required');
      }

      // Get specific varga chart
      const analysis = await this.calculator.calculateVargaCharts(birthData, [
        vargaName
      ]);

      if (!analysis.charts || !analysis.charts[vargaName]) {
        return {
          error: true,
          message: `Unable to calculate ${vargaName} chart`
        };
      }

      return {
        chart: analysis.charts[vargaName],
        significances: this._getVargaSignificances(vargaName),
        error: false
      };
    } catch (error) {
      logger.error('VargaChartsService getVargaChart error:', error);
      return {
        error: true,
        message: `Error calculating ${vargaName} chart`
      };
    }
  }

  /**
   * Validate input parameters
   * @param {Object} input - Input data to validate
   * @private
   */
  validate(input) {
    if (!input) {
      throw new Error('Birth data is required');
    }

    if (!input.birthDate) {
      throw new Error('Birth date is required');
    }

    if (!input.birthTime) {
      throw new Error('Birth time is required');
    }

    if (!input.birthPlace) {
      throw new Error('Birth place is required');
    }
  }

  /**
   * Format result for service consumption
   * @param {Object} result - Raw calculator result
   * @returns {Object} Formatted result
   * @private
   */
  formatResult(result) {
    return {
      success: true,
      charts: result.charts,
      analysis: result.analysis,
      metadata: {
        system: 'Varga Charts',
        calculationMethod:
          'Vedic divisional charts with Swiss Ephemeris precision',
        availableVargas: [
          'RASHI',
          'HORA',
          'DREKKANA',
          'CHATURTHAMSA',
          'SAPTAMSA',
          'NAVAMSA',
          'DASHAMSA',
          'DVADASHAMSA'
        ],
        totalCharts: Object.keys(result.charts || {}).length
      }
    };
  }

  /**
   * Get significances for a specific varga chart
   * @param {string} vargaName - Name of the varga
   * @returns {Array} List of significances
   * @private
   */
  _getVargaSignificances(vargaName) {
    const significances = {
      RASHI: [
        'Physical body',
        'Personality',
        'First impressions',
        'General life direction'
      ],
      HORA: ['Wealth', 'Family', 'Speech', 'Food', 'Material possessions'],
      DREKKANA: [
        'Siblings',
        'Courage',
        'Short journeys',
        'Communication',
        'Early education'
      ],
      CHATURTHAMSA: [
        'Property',
        'Home',
        'Mother',
        'Education',
        'Conveyances',
        'Fixed assets'
      ],
      SAPTAMSA: [
        'Children',
        'Creativity',
        'Grandchildren',
        'Spiritual progress'
      ],
      NAVAMSA: ['Marriage', 'Spouse', 'Dharma', 'Karma', 'Spiritual life'],
      DASHAMSA: ['Career', 'Profession', 'Status', 'Authority', 'Public image'],
      DVADASHAMSA: [
        'Parents',
        'Spirituality',
        'Foreign travel',
        'Expenses',
        'Losses'
      ]
    };

    return significances[vargaName] || ['General life areas'];
  }

  /**
   * Get service metadata
   * @returns {Object} Service information
   */
  getMetadata() {
    return {
      name: 'VargaChartsService',
      description:
        'Vedic divisional charts analysis with Swiss Ephemeris precision',
      version: '1.0.0',
      dependencies: ['VargaCharts'],
      category: 'vedic',
      methods: ['execute', 'getVargaChart']
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

module.exports = VargaChartsService;
