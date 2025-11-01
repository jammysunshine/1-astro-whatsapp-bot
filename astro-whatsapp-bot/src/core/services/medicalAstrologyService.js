const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');
const { BirthData } = require('../../models');

/**
 * MedicalAstrologyService - Specialized service for health patterns and wellness astrology
 *
 * Provides analysis of health patterns, potential challenges, and wellness recommendations
 * based on planetary positions and house placements in Vedic astrology.
 */
class MedicalAstrologyService extends ServiceTemplate {
  constructor() {
    super('ChartGenerator'); // Primary calculator for this service
    this.calculatorPath = '../calculators/ChartGenerator';
    this.serviceName = 'MedicalAstrologyService';
    this.calculatorPath =
      '../../../services/astrology/vedic/calculators/MedicalAstrologyCalculator';
    logger.info('MedicalAstrologyService initialized');
  }

  /**
   * Main calculation method for Medical Astrology Analysis.
   * @param {Object} birthData - User's birth data.
   * @returns {Promise<Object>} Comprehensive medical astrology analysis.
   */
  async processCalculation(birthData) {
    try {
      // Ensure calculator is loaded
      if (!this.calculator) {
        await this.initialize();
      }

      this._validateInput(birthData);

      // Calculate medical astrology analysis
      const medicalAnalysis =
        await this.calculator.calculateMedicalAstrologyAnalysis(birthData);

      // Add service metadata
      medicalAnalysis.serviceMetadata = {
        serviceName: this.serviceName,
        calculationType: 'Medical Astrology Analysis',
        timestamp: new Date().toISOString(),
        tradition: 'Vedic Hindu Astrology',
        methodology:
          'Planetary positions and house analysis for health patterns'
      };

      return medicalAnalysis;
    } catch (error) {
      logger.error('MedicalAstrologyService processCalculation error:', error);
      throw new Error(`Medical astrology analysis failed: ${error.message}`);
    }
  }

  /**
   * Validates input data for medical astrology analysis.
   * @param {Object} birthData - Birth data to validate.
   * @private
   */
  _validateInput(birthData) {
    if (!birthData) {
      throw new Error('Birth data is required for medical astrology analysis');
    }
    const validatedData = new BirthData(birthData);
    validatedData.validate();
  }

  /**
   * Formats the medical astrology analysis result for consistent output.
   * @param {Object} result - Raw calculator result.
   * @returns {Object} Formatted result.
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        message: 'Medical astrology analysis failed',
        service: this.serviceName
      };
    }

    return {
      success: true,
      data: result,
      summary: result.introduction || 'Medical astrology analysis completed',
      metadata: {
        serviceName: this.serviceName,
        system: 'Medical Astrology Analysis',
        calculationMethod:
          'Vedic planetary positions and house analysis for health patterns',
        elements: [
          'Health Indicators',
          'House Analysis',
          'Focus Areas',
          'Recommendations'
        ],
        tradition: 'Vedic Hindu astrology with medical astrology principles',
        timestamp: new Date().toISOString()
      }
    };
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
      methods: ['processCalculation'],
      dependencies: [], // Managed by ServiceTemplate
      description:
        'Specialized service for health patterns and wellness astrology.'
    };
  }

  /**
   * Returns help information for the service.
   * @returns {string} Help text.
   */
  getHelp() {
    return `
⚕️ **Medical Astrology Service - Health Patterns & Wellness**

**Purpose:** Provides analysis of health patterns, potential challenges, and wellness recommendations based on planetary positions and house placements in Vedic astrology.

**Required Inputs:**
• Birth data (Object with birthDate, birthTime, birthPlace)

**Analysis Includes:**
• **Health Indicators:** Planetary influences on physical well-being, vitality, and immunity.
• **House Analysis:** Examination of 6th, 8th, and 12th houses for health insights.
• **Focus Areas:** Identification of primary health concentrations and potential chronic conditions.
• **Recommendations:** Guidance on diet, exercise, stress management, and remedial approaches.

**Example Usage:**
"Analyze my medical astrology for birth date 1990-06-15T06:45:00.000Z in New Delhi."
"What are my potential health challenges based on my birth chart?"

**Output Format:**
Comprehensive report with health indicators, house analysis, focus areas, and recommendations.
    `.trim();
  }
}

module.exports = MedicalAstrologyService;
