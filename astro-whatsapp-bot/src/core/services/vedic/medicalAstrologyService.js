const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure

/**
 * MedicalAstrologyService - Specialized service for health patterns and wellness astrology
 *
 * Provides analysis of health patterns, potential challenges, and wellness recommendations
 * based on planetary positions and house placements in Vedic astrology. The service examines
 * the 6th house (daily health), 8th house (chronic conditions), and planetary influences
 * on physical well-being and vitality.
 */
class MedicalAstrologyService extends ServiceTemplate {
  constructor(services) {
    super('medicalAstrologyService');
    
    // Initialize calculator with services if provided
    if (services) {
      this.calculator.setServices(services.calendricalService, services.geocodingService);
    }
    
    this.serviceName = 'MedicalAstrologyService';
    logger.info('MedicalAstrologyService initialized');
  }

  async lmedicalAstrologyCalculation(birthData) {
    try {
      // Validate input
      this._validateInput(birthData);

      // Calculate medical astrology analysis
      const medicalAnalysis = await this.calculator.calculateMedicalAstrologyAnalysis(birthData);

      // Add service metadata
      medicalAnalysis.serviceMetadata = {
        serviceName: this.serviceName,
        calculationType: 'Medical Astrology Analysis',
        timestamp: new Date().toISOString(),
        tradition: 'Vedic Hindu Astrology',
        methodology: 'Planetary positions and house analysis for health patterns'
      };

      return medicalAnalysis;
    } catch (error) {
      logger.error('MedicalAstrologyService calculation error:', error);
      throw new Error(`Medical astrology analysis failed: ${error.message}`);
    }
  }

  /**
   * Format result for service consumption
   * @param {Object} result - Raw calculator result
   * @returns {Object} Formatted result
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        message: 'Medical astrology analysis failed'
      };
    }

    return {
      success: true,
      data: result,
      summary: result.introduction || 'Medical astrology analysis completed',
      metadata: {
        system: 'Medical Astrology Analysis',
        calculationMethod: 'Vedic planetary positions and house analysis for health patterns',
        elements: ['Health Indicators', 'House Analysis', 'Focus Areas', 'Recommendations'],
        tradition: 'Vedic Hindu astrology with medical astrology principles'
      }
    };
  }

  /**
   * Validate input parameters
   * @param {Object} input - Input data to validate
   * @private
   */
  _validateInput(birthData) {
    if (!birthData) {
      throw new Error('Birth data is required for medical astrology analysis');
    }

    if (!birthData.birthDate) {
      throw new Error('Birth date is required for medical astrology analysis');
    }

    if (!birthData.birthTime) {
      throw new Error('Birth time is required for medical astrology analysis');
    }

    if (!birthData.birthPlace) {
      throw new Error('Birth place is required for medical astrology analysis');
    }

    // Validate date format
    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!dateRegex.test(birthData.birthDate)) {
      throw new Error('Birth date must be in DD/MM/YYYY format');
    }

    // Validate time format
    const timeRegex = /^\d{1,2}:\d{1,2}$/;
    if (!timeRegex.test(birthData.birthTime)) {
      throw new Error('Birth time must be in HH:MM format');
    }
  }

  /**
   * Get service metadata
   * @returns {Object} Service information
   */
  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['execute', 'lmedicalAstrologyCalculation', 'formatResult'],
      dependencies: ['MedicalAstrologyCalculator']
    };
  }

  /**
   * Get service-specific help
   * @returns {string} Help information
   */
  getHelp() {
    return `
⚕️ **Medical Astrology Service**

**Purpose:** Provides analysis of health patterns, potential challenges, and wellness recommendations based on planetary positions and house placements in Vedic astrology

**Required Inputs:**
• Birth date (DD/MM/YYYY)
• Birth time (HH:MM)
• Birth place (city, state/country)

**Analysis Includes:**

**⚕️ Health Indicators:**
• Planetary influences on physical well-being
• Vitality and life force energy patterns
• Immunity and resistance factors
• Potential health vulnerabilities
• Strengths and resilience indicators

**🏛️ House Analysis:**
• 6th House - Daily health and service patterns
• 8th House - Chronic conditions and recovery
• 12th House - Hidden health factors and spiritual well-being
• Planetary placements in health-related houses
• House lord significations for health

**🎯 Focus Areas:**
• Primary health concentration areas
• Potential chronic condition indicators
• Preventive care recommendations
• Lifestyle pattern influences
• Seasonal health considerations

**🛡️ Recommendations:**
• Diet and nutrition guidance
• Exercise and physical activity suggestions
• Stress management techniques
• Preventive care measures
• Remedial approaches for health challenges
• Spiritual practices for holistic wellness

**Example Usage:**
"Medical astrology analysis for birth date 15/06/1990, time 06:45, place New Delhi"
"Health patterns and wellness recommendations with complete birth details"
"Analyze potential health challenges for 22/03/1985 at 14:30 in Mumbai"

**Output Format:**
Comprehensive medical astrology report with health indicators, house analysis, focus areas, and recommendations
    `.trim();
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

module.exports = MedicalAstrologyService;