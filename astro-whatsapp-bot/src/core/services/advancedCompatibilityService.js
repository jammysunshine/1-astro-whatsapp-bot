const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');

/**
 * Advanced Compatibility Service
 * Provides comprehensive Vedic compatibility analysis between two birth charts
 * Extends ServiceTemplate for standardized service architecture
 */
class AdvancedCompatibilityService extends ServiceTemplate {
  constructor(services) {
    super('AdvancedCompatibilityService', services);

    // Initialize Compatibility Calculator with required dependencies
    this.calculator = new CompatibilityCalculator(
      services.astrologer,
      services.geocodingService
    );

    // Set services in calculator
    this.calculator.setServices(services);

    // Service-specific configuration
    this.serviceConfig = {
      supportedInputs: ['person1', 'person2'],
      requiredInputs: ['person1', 'person2'],
      outputFormats: ['detailed', 'summary', 'scores'],
      compatibilityFactors: [
        'Sun Compatibility',
        'Moon Compatibility',
        'Venus Compatibility',
        'Mars Compatibility',
        'Lagna Compatibility',
        'Nadi Compatibility',
        'Gana Compatibility',
        'Yoni Compatibility',
        'Graha Maitri',
        'Varna Compatibility',
        'Tara Compatibility'
      ]
    };
  }

  /**
   * Process Advanced Compatibility calculation using ServiceTemplate pattern
   * @param {Object} params - Calculation parameters
   * @returns {Promise<Object>} Formatted compatibility analysis
   */
  async ladvancedCompatibilityCalculation(params) {
    const { person1, person2, options = {} } = params;

    try {
      // Validate inputs
      this._validateInputs(person1, person2);

      // Calculate compatibility using calculator
      const compatibilityResult = await this.calculator.checkCompatibility(person1, person2);

      // Add service metadata
      compatibilityResult.serviceMetadata = {
        serviceName: this.serviceName,
        calculationType: 'AdvancedCompatibility',
        timestamp: new Date().toISOString(),
        method: 'Comprehensive Vedic Compatibility Analysis',
        factorsAnalyzed: this.serviceConfig.compatibilityFactors
      };

      // Add enhanced analysis
      compatibilityResult.enhancedAnalysis = this._performEnhancedAnalysis(compatibilityResult);

      return compatibilityResult;
    } catch (error) {
      logger.error(`❌ Error in ${this.serviceName} calculation:`, error);
      throw new Error(`Advanced Compatibility calculation failed: ${error.message}`);
    }
  }

  /**
   * Format Advanced Compatibility result for WhatsApp output
   * @param {Object} result - Calculation result
   * @returns {string} Formatted WhatsApp message
   */
  formatResult(result) {
    if (!result || result.overall_score === undefined) {
      return '❌ *Advanced Compatibility Analysis Error*\n\nUnable to generate compatibility analysis. Please check birth details and try again.';
    }

    let formatted = '💕 *Advanced Compatibility Analysis*\n\n';

    // Add names and overall score
    formatted += `*${result.person1_name} & ${result.person2_name}*\n\n`;

    formatted += `*Overall Compatibility:* ${result.overall_score}/10\n`;
    formatted += `*Rating:* ${result.overall_rating || 'Unknown'}\n`;
    formatted += `*Percentage:* ${result.compatibility_percentage || 0}%\n\n`;

    // Add key compatibility factors
    formatted += '*🌟 Key Compatibility Factors:*\n';

    if (result.sun_compatibility) {
      formatted += `• **Core Personality:** ${result.sun_compatibility}\n`;
    }

    if (result.moon_compatibility) {
      formatted += `• **Emotional Connection:** ${result.moon_compatibility}\n`;
    }

    if (result.venus_compatibility) {
      formatted += `• **Romantic Harmony:** ${result.venus_compatibility}\n`;
    }

    if (result.mars_compatibility) {
      formatted += `• **Physical Chemistry:** ${result.mars_compatibility}\n`;
    }

    if (result.lagna_compatibility) {
      formatted += `• **Life Direction:** ${result.lagna_compatibility}\n`;
    }

    // Add Vedic factors if available
    if (result.vedic_factors) {
      formatted += '\n*🔮 Vedic Compatibility Factors:*\n';

      const vedic = result.vedic_factors;
      if (vedic.nadi_compatibility) {
        formatted += `• **Nadi:** ${vedic.nadi_compatibility.description || 'Assessed'}\n`;
      }
      if (vedic.gana_compatibility) {
        formatted += `• **Gana:** ${vedic.gana_compatibility.description || 'Assessed'}\n`;
      }
      if (vedic.yoni_compatibility) {
        formatted += `• **Yoni:** ${vedic.yoni_compatibility.description || 'Assessed'}\n`;
      }
    }

    // Add detailed scores if available
    if (result.detailed_scores) {
      formatted += '\n*📊 Detailed Scores:*\n';
      Object.entries(result.detailed_scores).slice(0, 5).forEach(([factor, score]) => {
        const factorName = factor.charAt(0).toUpperCase() + factor.slice(1);
        formatted += `• ${factorName}: ${score}/10\n`;
      });
    }

    // Add recommendations if available
    if (result.recommendations && result.recommendations.length > 0) {
      formatted += '\n*💡 Recommendations:*\n';
      result.recommendations.slice(0, 3).forEach(rec => {
        formatted += `• ${rec}\n`;
      });
    }

    // Add enhanced analysis if available
    if (result.enhancedAnalysis) {
      formatted += '\n*🎯 Enhanced Insights:*\n';
      if (result.enhancedAnalysis.strengths) {
        formatted += `• **Strengths:** ${result.enhancedAnalysis.strengths}\n`;
      }
      if (result.enhancedAnalysis.challenges) {
        formatted += `• **Areas for Growth:** ${result.enhancedAnalysis.challenges}\n`;
      }
      if (result.enhancedAnalysis.longTermPotential) {
        formatted += `• **Long-term Potential:** ${result.enhancedAnalysis.longTermPotential}\n`;
      }
    }

    // Add service footer
    formatted += '\n\n---\n*Advanced Compatibility - Comprehensive Vedic Analysis*';

    return formatted;
  }

  /**
   * Validate input parameters for Advanced Compatibility calculation
   * @param {Object} person1 - First person's birth data
   * @param {Object} person2 - Second person's birth data
   * @private
   */
  _validateInputs(person1, person2) {
    if (!person1 || !person2) {
      throw new Error('Both persons\' birth data are required for compatibility analysis');
    }

    // Validate person1
    if (!person1.birthDate || !person1.birthTime || !person1.birthPlace) {
      throw new Error('Complete birth details (date, time, place) are required for person 1');
    }

    // Validate person2
    if (!person2.birthDate || !person2.birthTime || !person2.birthPlace) {
      throw new Error('Complete birth details (date, time, place) are required for person 2');
    }
  }

  /**
   * Perform enhanced analysis on compatibility results
   * @param {Object} result - Compatibility calculation result
   * @returns {Object} Enhanced analysis
   * @private
   */
  _performEnhancedAnalysis(result) {
    const analysis = {
      strengths: '',
      challenges: '',
      longTermPotential: '',
      relationshipType: '',
      growthAreas: []
    };

    const score = result.overall_score || 0;

    // Determine relationship strengths
    if (score >= 8) {
      analysis.strengths = 'Excellent overall compatibility with strong harmony across multiple life areas';
      analysis.longTermPotential = 'Very high potential for lasting, fulfilling partnership';
    } else if (score >= 6) {
      analysis.strengths = 'Good compatibility with solid foundation for relationship growth';
      analysis.longTermPotential = 'Good potential for successful partnership with mutual understanding';
    } else if (score >= 4) {
      analysis.strengths = 'Moderate compatibility requiring conscious effort and understanding';
      analysis.longTermPotential = 'Potential for growth through communication and compromise';
    } else {
      analysis.strengths = 'Challenging compatibility requiring significant effort and awareness';
      analysis.longTermPotential = 'Relationship success depends on commitment to personal growth';
    }

    // Identify challenges based on low-scoring factors
    if (result.detailed_scores) {
      const lowScoringFactors = Object.entries(result.detailed_scores)
        .filter(([factor, score]) => score < 5)
        .map(([factor]) => factor);

      if (lowScoringFactors.length > 0) {
        analysis.challenges = `Areas needing attention: ${lowScoringFactors.join(', ')}`;
        analysis.growthAreas = lowScoringFactors;
      }
    }

    // Determine relationship type
    if (result.sun_compatibility && result.moon_compatibility) {
      if (result.sun_compatibility.includes('Excellent') && result.moon_compatibility.includes('Harmonious')) {
        analysis.relationshipType = 'Soulmate connection with deep understanding';
      } else if (result.sun_compatibility.includes('Good') && result.moon_compatibility.includes('Compatible')) {
        analysis.relationshipType = 'Compatible partnership with mutual respect';
      } else {
        analysis.relationshipType = 'Learning relationship with growth opportunities';
      }
    }

    return analysis;
  }

  /**
   * Calculate confidence score for Advanced Compatibility analysis
   * @param {Object} result - Calculation result
   * @returns {number} Confidence score (0-100)
   */
  calculateConfidence(result) {
    let confidence = 80; // Base confidence for compatibility analysis

    // Increase confidence based on data completeness
    if (result.detailed_scores && Object.keys(result.detailed_scores).length >= 5) {
      confidence += 10;
    }

    if (result.vedic_factors && Object.keys(result.vedic_factors).length >= 3) {
      confidence += 10;
    }

    return Math.min(confidence, 100);
  }

  /**
   * Validate calculation result
   * @param {Object} result - Calculation result
   * @returns {boolean} True if valid
   */
  validateResult(result) {
    return (
      result &&
      typeof result === 'object' &&
      typeof result.overall_score === 'number' &&
      result.person1_name &&
      result.person2_name
    );
  }

  /**
   * Get service-specific help
   * @returns {string} Help information
   */
  getHelp() {
    return `
💕 **Advanced Compatibility Service - Comprehensive Vedic Analysis**

**Purpose:** Provides detailed compatibility analysis between two people using Vedic astrology principles

**Required Inputs:**
• Person 1: Birth date (DD/MM/YYYY), time (HH:MM), place (city, country)
• Person 2: Birth date (DD/MM/YYYY), time (HH:MM), place (city, country)

**Compatibility Factors Analyzed:**

**🌟 Core Planetary Compatibility:**
• **Sun Compatibility** - Core personality harmony and life direction
• **Moon Compatibility** - Emotional connection and inner nature
• **Venus Compatibility** - Romantic harmony, values, and social expression
• **Mars Compatibility** - Physical chemistry, drive, and passion
• **Lagna Compatibility** - Life path and ascendant matching

**🔮 Traditional Vedic Factors:**
• **Nadi Compatibility** - Health and progeny compatibility
• **Gana Compatibility** - Temperament and nature matching
• **Yoni Compatibility** - Physical and emotional attraction
• **Graha Maitri** - Planetary friendship and mental compatibility
• **Varna Compatibility** - Social and spiritual compatibility
• **Tara Compatibility** - Birth star compatibility and fortune

**Analysis Includes:**
• Overall compatibility score (0-10)
• Percentage compatibility rating
• Individual factor analysis
• Strengths and growth areas
• Relationship type assessment
• Long-term potential evaluation
• Actionable recommendations

**Score Interpretation:**
• 8-10: Excellent compatibility
• 6-7: Good compatibility
• 4-5: Moderate compatibility
• 0-3: Challenging compatibility

**Example Usage:**
"Check compatibility between John and Mary"
"Analyze compatibility for birth dates 15/06/1990 and 22/12/1992"
"Compatibility analysis for two people"

**Output Format:**
Comprehensive compatibility report with scores, analysis, and recommendations
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

module.exports = AdvancedCompatibilityService;
