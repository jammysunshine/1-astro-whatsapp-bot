const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');
const VedicNumerology = require('./calculators/VedicNumerology');

/**
 * NumerologyService - Service for numerology calculations and analysis
 * Provides comprehensive numerology readings including life path numbers,
 * expression numbers, soul urge numbers, and destiny analysis using
 * Vedic numerology system with Swiss Ephemeris and astrologer libraries.
 */
class NumerologyService extends ServiceTemplate {
  constructor() {
    super('VedicNumerology');
    this.calculator = new VedicNumerology();
    this.serviceName = 'NumerologyService';
    logger.info('NumerologyService initialized with VedicNumerology');
  }

  /**
   * Validate input data for numerology calculation
   * @param {Object} data - Input data containing personal information
   */
  validate(data) {
    if (!data) {
      throw new Error('Input data is required for numerology calculation');
    }

    if (!data.name && !data.birthData) {
      throw new Error('Either name or birth data is required');
    }

    // Validate birth data if provided
    if (data.birthData && !data.birthData.birthDate) {
      throw new Error('Birth date is required in birthData');
    }

    // Validate name if provided
    if (data.name && typeof data.name !== 'string') {
      throw new Error('Name must be a string');
    }

    return true;
  }

  /**
   * Process numerology calculation using VedicNumerology calculator
   * @param {Object} data - Input data with name and/or birthData
   * @returns {Promise<Object>} Raw numerology result
   */
  async processCalculation(data) {
    const { name, birthData, calculationType = 'comprehensive' } = data;

    try {
      let analysis = {};

      if (name && birthData?.birthDate) {
        // Get comprehensive Vedic numerology analysis
        analysis = this.calculator.getVedicNumerologyAnalysis(
          birthData.birthDate,
          name
        );
        analysis.calculationType = 'comprehensive';
      } else if (birthData?.birthDate) {
        // Birth number only
        const birthNumber = this.calculator.calculateBirthNumber(birthData.birthDate);
        const interpretation = this.calculator.vedicInterpretations[birthNumber];
        analysis = {
          birthNumber,
          birthInterpretation: interpretation,
          calculationType: 'birth-number'
        };
      } else if (name) {
        // Name number only
        const nameNumber = this.calculator.calculateVedicNameNumber(name);
        const interpretation = this.calculator.vedicInterpretations[nameNumber];
        analysis = {
          nameNumber,
          nameInterpretation: interpretation,
          calculationType: 'name-number'
        };
      }

      // Add metadata
      analysis.type = 'vedic-numerology';
      analysis.generatedAt = new Date().toISOString();
      analysis.service = this.serviceName;
      analysis.name = name;
      analysis.birthDate = birthData?.birthDate;

      return analysis;
    } catch (error) {
      logger.error('NumerologyService calculation error:', error);
      return {
        error: error.message,
        calculationType,
        type: 'vedic-numerology',
        generatedAt: new Date().toISOString(),
        service: this.serviceName
      };
    }
  }

  /**
   * Format the numerology result for consistent output
   * @param {Object} result - Raw calculator result
   * @returns {Object} Formatted numerology result
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        type: 'numerology',
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
      name: 'NumerologyService',
      category: 'divination',
      description:
        'Service for comprehensive Vedic numerology analysis using Swiss Ephemeris and astrologer libraries',
      version: '1.0.0',
      status: 'active',
      calculationTypes: [
        'birth-number',
        'name-number',
        'destiny-number',
        'comprehensive'
      ]
    };
  }

  /**
   * Calculate life path number
   * @param {Object} birthData - Birth data
   * @returns {Promise<Object>} Life path analysis
   */
  async getLifePathNumber(birthData) {
    try {
      const result = await this.execute({
        birthData,
        calculationType: 'life-path'
      });
      return result.data;
    } catch (error) {
      logger.error('NumerologyService getLifePathNumber error:', error);
      return {
        error: true,
        message: 'Error calculating life path number'
      };
    }
  }

  /**
   * Calculate expression number (destiny number)
   * @param {string} name - Full name
   * @returns {Promise<Object>} Expression number analysis
   */
  async getExpressionNumber(name) {
    try {
      const result = await this.execute({
        name,
        calculationType: 'expression'
      });
      return result.data;
    } catch (error) {
      logger.error('NumerologyService getExpressionNumber error:', error);
      return {
        error: true,
        message: 'Error calculating expression number'
      };
    }
  }

  /**
   * Calculate soul urge number (heart's desire)
   * @param {string} name - Full name
   * @returns {Promise<Object>} Soul urge analysis
   */
  async getSoulUrgeNumber(name) {
    try {
      const result = await this.execute({
        name,
        calculationType: 'soul-urge'
      });
      return result.data;
    } catch (error) {
      logger.error('NumerologyService getSoulUrgeNumber error:', error);
      return {
        error: true,
        message: 'Error calculating soul urge number'
      };
    }
  }

  /**
   * Get comprehensive numerology reading
   * @param {Object} data - Data with name and/or birthData
   * @returns {Promise<Object>} Comprehensive numerology analysis
   */
  async getComprehensiveReading(data) {
    try {
      const result = await this.execute({
        ...data,
        calculationType: 'comprehensive'
      });
      return result.data;
    } catch (error) {
      logger.error('NumerologyService getComprehensiveReading error:', error);
      return {
        error: true,
        message: 'Error generating comprehensive numerology reading'
      };
    }
  }

  /**
   * Get personal year number
   * @param {Object} birthData - Birth data
   * @param {number} year - Target year (defaults to current year)
   * @returns {Promise<Object>} Personal year analysis
   */
  async getPersonalYearNumber(birthData, year = new Date().getFullYear()) {
    try {
      const result = await this.execute({
        birthData,
        calculationType: 'personal-year',
        year
      });
      return result.data;
    } catch (error) {
      logger.error('NumerologyService getPersonalYearNumber error:', error);
      return {
        error: true,
        message: 'Error calculating personal year number'
      };
    }
  }

  /**
   * Get name compatibility analysis
   * @param {string} name1 - First name
   * @param {string} name2 - Second name
   * @returns {Promise<Object>} Name compatibility analysis
   */
  async getNameCompatibility(name1, name2) {
    try {
      const result = await this.execute({
        name: `${name1} & ${name2}`,
        calculationType: 'name-compatibility',
        name1,
        name2
      });
      return result.data;
    } catch (error) {
      logger.error('NumerologyService getNameCompatibility error:', error);
      return {
        error: true,
        message: 'Error analyzing name compatibility'
      };
    }
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

module.exports = NumerologyService;
