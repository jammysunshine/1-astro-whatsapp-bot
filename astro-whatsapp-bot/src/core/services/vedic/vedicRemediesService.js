/**
 * Vedic Remedies Service
 *
 * Provides comprehensive Vedic remedies including gemstones, mantras, charities, pujas, and yantras
 * for planetary appeasement and astrological corrections.
 */

const logger = require('../../../utils/logger');

class VedicRemediesService {
  constructor() {
    this.calculator = new VedicRemedies();
    logger.info('VedicRemediesService initialized');
  }

  /**
   * Execute complete Vedic remedies analysis
   * @param {Object} data - Birth data and specific remedy request
   * @returns {Promise<Object>} Complete remedies analysis
   */
  async execute(data) {
    try {
      this._validateInput(data);

      // Determine planet or dosha from request
      const planet = data.planet || this._extractPlanetFromData(data);
      const { dosha } = data;

      let remedies;
      if (dosha) {
        remedies = this.calculator.generateDoshaRemedies(dosha);
      } else {
        remedies = this.calculator.generatePlanetRemedies(planet);
      }

      // Format result for service consumption
      return this._formatResult(remedies, planet, dosha);
    } catch (error) {
      logger.error('VedicRemediesService error:', error);
      throw new Error(`Vedic remedies analysis failed: ${error.message}`);
    }
  }

  /**
   * Get planetary remedies (for handler compatibility)
   * @param {string} planet - Planet name
   * @returns {Promise<Object>} Planetary remedies
   */
  async getPlanetRemedies(planet) {
    try {
      if (!planet) {
        throw new Error('Planet is required');
      }

      const remedies = this.calculator.generatePlanetRemedies(planet);

      if (remedies.error) {
        return {
          error: true,
          message: remedies.error
        };
      }

      return {
        summary: remedies.summary,
        mantra: remedies.mantra,
        gemstone: remedies.gemstone,
        charity: remedies.charity,
        puja: remedies.puja,
        yantra: remedies.yantra,
        error: false
      };
    } catch (error) {
      logger.error('VedicRemediesService getPlanetRemedies error:', error);
      return {
        error: true,
        message: 'Unable to generate planetary remedies'
      };
    }
  }

  /**
   * Get dosha remedies
   * @param {string} doshaType - Type of dosha (kaal_sarp, manglik, etc.)
   * @returns {Promise<Object>} Dosha remedies
   */
  async getDoshaRemedies(doshaType) {
    try {
      if (!doshaType) {
        throw new Error('Dosha type is required');
      }

      const remedies = this.calculator.generateDoshaRemedies(doshaType);

      return {
        remedies,
        summary: this._generateDoshaSummary(remedies, doshaType),
        error: false
      };
    } catch (error) {
      logger.error('VedicRemediesService getDoshaRemedies error:', error);
      return {
        error: true,
        message: 'Unable to generate dosha remedies'
      };
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

    // At least planet or dosha should be specified
    if (!input.planet && !input.dosha) {
      throw new Error('Either planet or dosha type is required');
    }
  }

  /**
   * Format result for service consumption
   * @param {Object} remedies - Raw remedies data
   * @param {string} planet - Planet name
   * @param {string} dosha - Dosha type
   * @returns {Object} Formatted result
   * @private
   */
  _formatResult(remedies, planet, dosha) {
    if (remedies.error) {
      return {
        success: false,
        error: remedies.error,
        message: 'Remedies generation failed'
      };
    }

    return {
      success: true,
      remedies,
      target: planet || dosha,
      type: planet ? 'planetary' : 'dosha',
      metadata: {
        system: 'Vedic Remedies',
        calculationMethod: 'Traditional Vedic remedial measures for planetary appeasement',
        categories: ['Gemstones', 'Mantras', 'Charities', 'Pujas', 'Yantras'],
        tradition: 'Ancient Indian astrological remedial practices'
      }
    };
  }

  /**
   * Extract planet from input data
   * @param {Object} data - Input data
   * @returns {string} Planet name
   * @private
   */
  _extractPlanetFromData(data) {
    // Default to sun if no planet specified
    return data.planet || 'sun';
  }

  /**
   * Generate dosha remedies summary
   * @param {Object} remedies - Remedies data
   * @param {string} doshaType - Dosha type
   * @returns {string} Formatted summary
   * @private
   */
  _generateDoshaSummary(remedies, doshaType) {
    const doshaNames = {
      kaal_sarp: 'Kaal Sarp Dosha',
      manglik: 'Manglik Dosha',
      pitru: 'Pitru Dosha',
      sade_sati: 'Sade Sati'
    };

    const name = doshaNames[doshaType] || doshaType;
    let summary = `🕉️ *${name} Remedies*\n\n`;

    if (remedies.gemstones && remedies.gemstones.length > 0) {
      summary += `*Gemstones:* ${remedies.gemstones.join(', ')}\n`;
    }

    if (remedies.mantras && remedies.mantras.length > 0) {
      summary += `*Mantras:* ${remedies.mantras.join(', ')}\n`;
    }

    if (remedies.pujas && remedies.pujas.length > 0) {
      summary += `*Pujas:* ${remedies.pujas.join(', ')}\n`;
    }

    summary += '\n*Note:* Consult a qualified priest or astrologer before performing pujas.';

    return summary;
  }

  /**
   * Get service metadata
   * @returns {Object} Service information
   */
  getMetadata() {
    return {
      name: 'VedicRemediesService',
      description: 'Comprehensive Vedic remedies including gemstones, mantras, charities, pujas, and yantras',
      version: '1.0.0',
      dependencies: ['VedicRemedies'],
      category: 'vedic',
      methods: ['execute', 'getPlanetRemedies', 'getDoshaRemedies']
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

module.exports = VedicRemediesService;
