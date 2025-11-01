const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');
const { BirthData } = require('../../models');

/**
 * VedicRemediesService - Service for comprehensive Vedic remedial measures
 *
 * Provides comprehensive Vedic remedial measures for planetary afflictions,
 * dosha corrections, and spiritual healing practices including gemstones,
 * mantras, charities, pujas, and yantras based on birth chart analysis.
 */
class VedicRemediesService extends ServiceTemplate {
  constructor() {
    super('VedicRemedies'); // Primary calculator for this service
    this.serviceName = 'VedicRemediesService';
    this.calculatorPath = '../../../services/astrology/vedicRemedies';
    logger.info('VedicRemediesService initialized');
  }

  /**
   * Main calculation method for Vedic Remedies analysis.
   * @param {Object} data - Birth data and specific remedy request.
   * @returns {Promise<Object>} Complete remedies analysis.
   */
  async processCalculation(data) {
    try {
      // Ensure calculator is loaded
      if (!this.calculator) {
        await this.initialize();
      }

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
      logger.error('VedicRemediesService processCalculation error:', error);
      throw new Error(`Vedic remedies analysis failed: ${error.message}`);
    }
  }

  /**
   * Validates input data for remedies analysis.
   * @param {Object} input - Input data to validate.
   * @private
   */
  _validateInput(input) {
    if (!input) {
      throw new Error('Input data is required for Vedic Remedies analysis.');
    }

    // At least planet or dosha should be specified
    if (!input.planet && !input.dosha) {
      throw new Error('Either planet or dosha type is required for Vedic Remedies analysis.');
    }
  }

  /**
   * Formats the remedies analysis result for consistent output.
   * @param {Object} remedies - Raw remedies data.
   * @param {string} planet - Planet name.
   * @param {string} dosha - Dosha type.
   * @returns {Object} Formatted result.
   */
  formatResult(remedies, planet, dosha) {
    if (remedies.error) {
      return {
        success: false,
        error: remedies.error,
        message: 'Remedies generation failed',
        service: this.serviceName
      };
    }

    return {
      success: true,
      data: remedies,
      summary: remedies.summary || 'Remedies analysis completed',
      metadata: {
        serviceName: this.serviceName,
        system: 'Vedic Remedies',
        calculationMethod: 'Traditional Vedic remedial measures for planetary appeasement',
        categories: ['Gemstones', 'Mantras', 'Charities', 'Pujas', 'Yantras'],
        tradition: 'Ancient Indian astrological remedial practices',
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Extracts planet from input data.
   * @param {Object} data - Input data.
   * @returns {string} Planet name.
   * @private
   */
  _extractPlanetFromData(data) {
    return data.planet || 'sun'; // Default to sun if no planet specified
  }

  /**
   * Generates dosha remedies summary.
   * @param {Object} remedies - Remedies data.
   * @param {string} doshaType - Dosha type.
   * @returns {string} Formatted summary.
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
   * Returns metadata for the service.
   * @returns {Object} Service metadata.
   */
  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['processCalculation', 'getPlanetRemedies', 'getDoshaRemedies'],
      dependencies: [], // Managed by ServiceTemplate
      description: 'Comprehensive Vedic remedial measures for planetary afflictions and dosha corrections.'
    };
  }

  /**
   * Returns help information for the service.
   * @returns {string} Help text.
   */
  getHelp() {
    return `
🕉️ **Vedic Remedies Service - Astrological Corrections & Healing**

**Purpose:** Provides comprehensive Vedic remedial measures for planetary afflictions, dosha corrections, and spiritual healing practices including gemstones, mantras, charities, pujas, and yantras based on birth chart analysis.

**Required Inputs:**
• Either 'planet' (string, e.g., 'Mars') or 'dosha' (string, e.g., 'kaal_sarp')

**Analysis Includes:**
• **Gemstone Recommendations:** Specific gemstones to strengthen beneficial planetary influences.
• **Mantra Recitations:** Powerful Vedic mantras for planetary appeasement and spiritual upliftment.
• **Charitable Acts:** Prescribed donations and acts of service to mitigate negative karmic effects.
• **Pujas & Rituals:** Recommendations for specific ceremonies and rituals for planetary harmony.
• **Yantras:** Sacred geometric diagrams for meditation and protection.
• **Dosha-Specific Remedies:** Targeted remedies for astrological afflictions like Kaal Sarp Dosha, Manglik Dosha, Pitra Dosha, and Sade Sati.

**Example Usage:**
"What are the remedies for Mars?"
"Provide remedies for Kaal Sarp Dosha."
"Suggest remedies for Saturn's influence."

**Output Format:**
Detailed report with recommended remedies categorized by type, along with their purpose and instructions.
    `.trim();
  }
}

module.exports = VedicRemediesService;
