const logger = require('../../../../utils/logger');
const astrocartographyReader = require('../../../services/astrology/astrocartographyReader');

class AstrocartographyService {
  constructor() {
    this.reader = astrocartographyReader;
    logger.info('AstrocartographyService initialized');
  }

  /**
   * Main service execution method
   * @param {Object} birthData - User birth data and parameters
   * @returns {Promise<Object>} Service result
   */
  async execute(birthData) {
    try {
      // Input validation
      this._validateInput(birthData);

      // Get astrocartography data
      const result = await this.getAstrocartographyData(birthData);

      // Format and return result
      return this._formatResult(result);

    } catch (error) {
      logger.error('AstrocartographyService error:', error);
      throw new Error(`Astrocartography analysis failed: ${error.message}`);
    }
  }

  /**
   * Get astrocartography analysis data
   * @param {Object} birthData - Birth data
   * @returns {Promise<Object>} Astrocartography data
   */
  async getAstrocartographyData(birthData) {
    try {
      return this.reader.generateAstrocartography(birthData);
    } catch (error) {
      logger.error('Error getting astrocartography data:', error);
      throw error;
    }
  }

  /**
   * Validate input parameters
   * @param {Object} input - Input data to validate
   * @private
   */
  _validateInput(input) {
    if (!input) {
      throw new Error('Input data is required');
    }

    if (!input.birthDate) {
      throw new Error('Birth date is required for astrocartography analysis');
    }

    if (!input.birthTime) {
      throw new Error('Birth time is required for astrocartography analysis');
    }

    if (!input.birthPlace) {
      throw new Error('Birth place is required for astrocartography analysis');
    }

    // Validate birth date format (DD/MM/YYYY)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(input.birthDate)) {
      throw new Error('Birth date must be in DD/MM/YYYY format');
    }

    // Validate birth time format (HH:MM)
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(input.birthTime)) {
      throw new Error('Birth time must be in HH:MM format');
    }
  }

  /**
   * Format result for presentation
   * @param {Object} result - Raw astrocartography result
   * @returns {Object} Formatted result
   * @private
   */
  _formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        message: 'Unable to generate astrocartography analysis',
        data: result
      };
    }

    return {
      success: true,
      message: 'Astrocartography analysis completed successfully',
      data: {
        name: result.name,
        planetaryPositions: result.planetaryPositions,
        planetaryLines: result.planetaryLines,
        currentLocation: result.currentLocation,
        powerSpots: result.powerSpots,
        relocationGuidance: result.relocationGuidance,
        disclaimer: result.disclaimer,
        description: result.astrocartographyDescription
      }
    };
  }

  /**
   * Get service metadata
   * @returns {Object} Service information
   */
  getMetadata() {
    return {
      name: 'AstrocartographyService',
      description: 'Geographic astrology mapping planetary influences across locations for relocation and travel guidance',
      version: '1.0.0',
      dependencies: ['astrocartographyReader'],
      category: 'vedic'
    };
  }
}

module.exports = AstrocartographyService;