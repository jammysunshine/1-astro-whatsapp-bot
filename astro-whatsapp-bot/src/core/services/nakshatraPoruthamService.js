const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');
const { BirthData } = require('../../models');

/**
 * NakshatraPoruthamService - Service for Nakshatra compatibility analysis
 *
 * Provides detailed compatibility analysis between two individuals based on their birth Nakshatras
 * (lunar mansions) using traditional Vedic astrology principles.
 */
class NakshatraPoruthamService extends ServiceTemplate {
  constructor() {
    super('NadiCompatibility'); // Primary calculator for this service
    this.serviceName = 'NakshatraPoruthamService';
    this.calculatorPath = '../calculators/NadiCompatibility';
    logger.info('NakshatraPoruthamService initialized');
  }

  /**
   * Main calculation method for Nakshatra Porutham analysis.
   * @param {Object} person1BirthData - Birth data for the first person.
   * @param {Object} person2BirthData - Birth data for the second person.
   * @returns {Promise<Object>} Comprehensive Nakshatra Porutham analysis.
   */
  async processCalculation(person1BirthData, person2BirthData) {
    try {
      // Ensure calculator is loaded
      if (!this.calculator) {
        await this.initialize();
      }

      this._validateInput(person1BirthData, person2BirthData);

      // Perform Nakshatra Porutham calculation using the dynamically loaded calculator
      const poruthamResult = await this.calculator.calculatePorutham(
        person1BirthData,
        person2BirthData
      );

      // Generate additional insights
      const compatibilityScore =
        this._calculateOverallCompatibilityScore(poruthamResult);
      const strengths = this._identifyStrengths(poruthamResult);
      const challenges = this._identifyChallenges(poruthamResult);
      const recommendations = this._generateRecommendations(poruthamResult);

      return {
        poruthamResult,
        compatibilityScore,
        strengths,
        challenges,
        recommendations,
        summary: this._createComprehensiveSummary(
          poruthamResult,
          compatibilityScore
        )
      };
    } catch (error) {
      logger.error('NakshatraPoruthamService processCalculation error:', error);
      throw new Error(
        `Nakshatra Porutham calculation failed: ${error.message}`
      );
    }
  }

  /**
   * Validates input data for Nakshatra Porutham analysis.
   * @param {Object} person1BirthData - Birth data for the first person.
   * @param {Object} person2BirthData - Birth data for the second person.
   * @private
   */
  _validateInput(person1BirthData, person2BirthData) {
    if (!person1BirthData || !person2BirthData) {
      throw new Error(
        'Both person1BirthData and person2BirthData are required for Nakshatra Porutham analysis.'
      );
    }
    const validatedData1 = new BirthData(person1BirthData);
    validatedData1.validate();

    const validatedData2 = new BirthData(person2BirthData);
    validatedData2.validate();
  }

  /**
   * Formats the Nakshatra Porutham result for consistent output.
   * @param {Object} result - Raw porutham result.
   * @returns {Object} Formatted result.
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        message: 'Nakshatra Porutham analysis failed',
        service: this.serviceName
      };
    }

    return {
      success: true,
      data: result,
      summary: result.summary || 'Nakshatra Porutham analysis completed',
      metadata: {
        serviceName: this.serviceName,
        calculationType: 'Nakshatra Porutham Analysis',
        timestamp: new Date().toISOString()
      },
      disclaimer:
        'Nakshatra Porutham provides insights into marital compatibility based on Vedic astrology. It is one of many factors to consider in a relationship and should be used as a guide for understanding, not as a definitive predictor of success or failure.'
    };
  }

  /**
   * Calculates the overall compatibility score.
   * @param {Object} poruthamResult - Raw porutham result.
   * @returns {number} Overall compatibility score (out of 36).
   * @private
   */
  _calculateOverallCompatibilityScore(poruthamResult) {
    if (!poruthamResult || !poruthamResult.kutas) {
      return 0;
    }
    return poruthamResult.kutas.reduce(
      (sum, kuta) => sum + (kuta.score || 0),
      0
    );
  }

  /**
   * Identifies strengths in the compatibility.
   * @param {Object} poruthamResult - Raw porutham result.
   * @returns {Array} List of strengths.
   * @private
   */
  _identifyStrengths(poruthamResult) {
    const strengths = [];
    if (poruthamResult.kutas) {
      poruthamResult.kutas.forEach(kuta => {
        if (kuta.score > 2) {
          strengths.push(
            `${kuta.name} (Score: ${kuta.score}) - ${kuta.interpretation}`
          );
        }
      });
    }
    if (strengths.length === 0) {
      strengths.push('General harmony and understanding');
    }
    return strengths;
  }

  /**
   * Identifies challenges in the compatibility.
   * @param {Object} poruthamResult - Raw porutham result.
   * @returns {Array} List of challenges.
   * @private
   */
  _identifyChallenges(poruthamResult) {
    const challenges = [];
    if (poruthamResult.kutas) {
      poruthamResult.kutas.forEach(kuta => {
        if (kuta.score <= 1) {
          challenges.push(
            `${kuta.name} (Score: ${kuta.score}) - ${kuta.interpretation}`
          );
        }
      });
    }
    if (challenges.length === 0) {
      challenges.push('Minor adjustments may be needed');
    }
    return challenges;
  }

  /**
   * Generates recommendations for the couple.
   * @param {Object} poruthamResult - Raw porutham result.
   * @returns {Array} List of recommendations.
   * @private
   */
  _generateRecommendations(poruthamResult) {
    const recommendations = [
      'Focus on open communication and mutual respect.',
      'Engage in shared activities to strengthen your bond.',
      'Practice patience and understanding in challenging areas.'
    ];

    if (poruthamResult.kutas) {
      poruthamResult.kutas.forEach(kuta => {
        if (kuta.score <= 1 && kuta.remedy) {
          recommendations.push(`For ${kuta.name}: ${kuta.remedy}`);
        }
      });
    }
    return recommendations;
  }

  /**
   * Creates a comprehensive summary of the Nakshatra Porutham analysis.
   * @param {Object} poruthamResult - Raw porutham result.
   * @param {number} compatibilityScore - Overall compatibility score.
   * @returns {string} Comprehensive summary text.
   * @private
   */
  _createComprehensiveSummary(poruthamResult, compatibilityScore) {
    let summary =
      'This Nakshatra Porutham analysis provides insights into the compatibility between two individuals based on Vedic astrology. ';
    summary += `The overall compatibility score is ${compatibilityScore} out of 36. `;

    if (compatibilityScore >= 25) {
      summary +=
        'This indicates excellent compatibility, suggesting a harmonious and fulfilling relationship. ';
    } else if (compatibilityScore >= 18) {
      summary +=
        'This indicates good compatibility, with a strong foundation for a successful relationship. ';
    } else {
      summary +=
        'This indicates moderate compatibility, suggesting areas that may require more effort and understanding. ';
    }

    summary +=
      'The analysis of individual Kutas (compatibility factors) highlights specific strengths and potential challenges, offering guidance for a stronger bond.';
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
      methods: [
        'processCalculation',
        'calculatePorutham',
        'getCompatibilityScore',
        'getStrengthsAndChallenges'
      ],
      dependencies: [], // Managed by ServiceTemplate
      description: 'Service for Nakshatra compatibility analysis.'
    };
  }

  /**
   * Returns help information for the service.
   * @returns {string} Help text.
   */
  getHelp() {
    return `
💖 **Nakshatra Porutham Service - Vedic Compatibility Analysis**

**Purpose:** Provides detailed compatibility analysis between two individuals based on their birth Nakshatras (lunar mansions) using traditional Vedic astrology principles.

**Required Inputs:**
• Person 1: Birth data (Object with birthDate, birthTime, birthPlace)
• Person 2: Birth data (Object with birthDate, birthTime, birthPlace)

**Analysis Includes:**
• **Nakshatra Matching:** Comparison of birth Nakshatras for compatibility.
• **Kuta Analysis:** Evaluation of 10-12 traditional compatibility factors (Kutas).
• **Overall Compatibility Score:** A numerical score indicating the degree of compatibility (out of 36).
• **Strengths & Challenges:** Identification of harmonious areas and potential points of friction.
• **Recommendations:** Guidance and remedies to enhance relationship harmony.

**Example Usage:**
"Analyze Nakshatra Porutham for John (born 1990-06-15T06:45:00.000Z in New Delhi) and Jane (born 1992-03-22T10:30:00.000Z in Mumbai)."
"What is the Nakshatra compatibility score for us?"

**Output Format:**
Comprehensive report with Kuta scores, interpretations, overall compatibility, and recommendations.
    `.trim();
  }
}

module.exports = NakshatraPoruthamService;
