const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');

/**
 * Ashtakavarga Service
 * Provides comprehensive Ashtakavarga analysis using Vedic 64-point beneficial influence system
 * Extends ServiceTemplate for standardized service architecture
 */
class AshtakavargaService extends ServiceTemplate {
  constructor() {
    super('AshtakavargaCalculator');
    this.serviceName = 'AshtakavargaService';
    this.calculatorPath = './calculators/AshtakavargaCalculator';
    logger.info('AshtakavargaService initialized');

    // Service-specific configuration
    this.serviceConfig = {
      supportedInputs: ['birthData'],
      requiredInputs: ['birthData'],
      outputFormats: ['detailed', 'summary', 'strength-analysis'],
      strengthCategories: {
        veryStrong: 28, // 4+ points average per house
        strong: 24, // 3.5+ points average
        average: 20, // 3 points average
        weak: 16, // 2.5+ points average
        veryWeak: 12 // Below 2.5 points average
      }
    };
  }

  /**
   * Process Ashtakavarga calculation using ServiceTemplate pattern
   * @param {Object} params - Calculation parameters
   * @returns {Promise<Object>} Formatted Ashtakavarga analysis
   */
  async processCalculation(params) {
    const { birthData, options = {} } = params;

    try {
      // Validate inputs
      this._validateInputs(birthData);

      // Calculate Ashtakavarga using calculator
      const ashtakavargaResult =
        await this.calculator.calculateAshtakavarga(birthData);

      // Add service metadata
      ashtakavargaResult.serviceMetadata = {
        serviceName: this.serviceName,
        calculationType: 'Ashtakavarga',
        timestamp: new Date().toISOString(),
        method: 'Vedic 64-point Beneficial Influence System',
        totalPoints: 64,
        planetsAnalyzed: 7
      };

      // Add enhanced analysis
      ashtakavargaResult.enhancedAnalysis =
        this._performEnhancedAshtakavargaAnalysis(ashtakavargaResult);

      return ashtakavargaResult;
    } catch (error) {
      logger.error(`❌ Error in ${this.serviceName} calculation:`, error);
      throw new Error(`Ashtakavarga calculation failed: ${error.message}`);
    }
  }

  /**
   * Format Ashtakavarga result for WhatsApp output
   * @param {Object} result - Calculation result
   * @returns {string} Formatted WhatsApp message
   */
  formatResult(result) {
    if (!result || !result.planetaryStrengths) {
      return '❌ *Ashtakavarga Analysis Error*\n\nUnable to generate Ashtakavarga analysis. Please check your birth details and try again.';
    }

    let formatted = '📊 *Ashtakavarga Analysis*\n\n';

    // Add overview
    if (result.overview) {
      formatted += `${result.overview}\n\n`;
    }

    // Add planetary strengths
    if (result.planetaryStrengths && result.planetaryStrengths.length > 0) {
      formatted += '*🌟 Planetary Strengths (Bindus):*\n';
      result.planetaryStrengths.forEach(planet => {
        formatted += `• **${planet.name}:** ${planet.strength} (House ${planet.house})\n`;
      });
      formatted += '\n';
    }

    // Add peak houses
    if (result.peakHouses && result.peakHouses.length > 0) {
      formatted += '*🏆 Strongest Life Areas:*\n';
      result.peakHouses.forEach(house => {
        formatted += `• ${house}\n`;
      });
      formatted += '\n';
    }

    // Add interpretation
    if (result.interpretation) {
      formatted += '*💫 Interpretation:*\n';
      formatted += `${result.interpretation}\n\n`;
    }

    // Add enhanced analysis if available
    if (result.enhancedAnalysis) {
      formatted += '*🎯 Enhanced Analysis:*\n';

      if (result.enhancedAnalysis.overallStrength) {
        formatted += `• **Overall Strength:** ${result.enhancedAnalysis.overallStrength}\n`;
      }

      if (result.enhancedAnalysis.lifeAreaFocus) {
        formatted += `• **Life Focus:** ${result.enhancedAnalysis.lifeAreaFocus}\n`;
      }

      if (result.enhancedAnalysis.recommendations) {
        formatted += `• **Recommendations:** ${result.enhancedAnalysis.recommendations}\n`;
      }

      if (result.enhancedAnalysis.challenges) {
        formatted += `• **Growth Areas:** ${result.enhancedAnalysis.challenges}\n`;
      }

      formatted += '\n';
    }

    // Add house-wise analysis if available
    if (result.enhancedAnalysis?.houseAnalysis) {
      formatted += '*🏠 House-wise Strength:*\n';
      Object.entries(result.enhancedAnalysis.houseAnalysis)
        .slice(0, 6)
        .forEach(([house, analysis]) => {
          formatted += `• **House ${house}:** ${analysis}\n`;
        });
      formatted += '\n';
    }

    // Add service footer
    formatted +=
      '---\n*Ashtakavarga - Vedic 64-point Beneficial Influence System*';

    return formatted;
  }

  /**
   * Validate input parameters for Ashtakavarga calculation
   * @param {Object} birthData - Birth data object
   * @private
   */
  _validateInputs(birthData) {
    if (!birthData) {
      throw new Error('Birth data is required for Ashtakavarga analysis');
    }

    if (!birthData.birthDate || !birthData.birthTime) {
      throw new Error(
        'Birth date and time are required for Ashtakavarga analysis'
      );
    }
  }

  /**
   * Perform enhanced analysis on Ashtakavarga results
   * @param {Object} result - Ashtakavarga calculation result
   * @returns {Object} Enhanced analysis
   * @private
   */
  _performEnhancedAshtakavargaAnalysis(result) {
    const analysis = {
      overallStrength: '',
      lifeAreaFocus: '',
      recommendations: '',
      challenges: '',
      houseAnalysis: {},
      sarvashtakavarga: 0
    };

    // Calculate total points (Sarvashtakavarga)
    if (result.planetaryStrengths) {
      let totalPoints = 0;
      const housePoints = {};

      result.planetaryStrengths.forEach(planet => {
        // Extract points from strength string (e.g., "Sun: 8 points")
        const pointsMatch = planet.strength.match(/(\d+)\s*points?/);
        if (pointsMatch) {
          const points = parseInt(pointsMatch[1]);
          totalPoints += points;

          // Track points by house
          if (!housePoints[planet.house]) {
            housePoints[planet.house] = 0;
          }
          housePoints[planet.house] += points;
        }
      });

      analysis.sarvashtakavarga = totalPoints;

      // Determine overall strength
      if (totalPoints >= 45) {
        analysis.overallStrength = 'Very Strong - Excellent planetary support';
        analysis.recommendations =
          'Favorable period for major life decisions and new ventures';
      } else if (totalPoints >= 35) {
        analysis.overallStrength = 'Strong - Good planetary support';
        analysis.recommendations =
          'Good time for important activities with reasonable success';
      } else if (totalPoints >= 25) {
        analysis.overallStrength = 'Average - Moderate planetary support';
        analysis.recommendations =
          'Proceed with normal activities, avoid major risks';
      } else {
        analysis.overallStrength = 'Weak - Limited planetary support';
        analysis.recommendations =
          'Focus on planning and preparation, avoid major commitments';
      }

      // Analyze house strengths
      const strongHouses = [];
      const weakHouses = [];

      Object.entries(housePoints).forEach(([house, points]) => {
        const houseMeaning = this._getHouseMeaning(parseInt(house));

        if (points >= 8) {
          strongHouses.push(houseMeaning);
          analysis.houseAnalysis[house] =
            `Strong (${points} points) - ${houseMeaning} well-supported`;
        } else if (points <= 4) {
          weakHouses.push(houseMeaning);
          analysis.houseAnalysis[house] =
            `Weak (${points} points) - ${houseMeaning} needs attention`;
        } else {
          analysis.houseAnalysis[house] =
            `Moderate (${points} points) - ${houseMeaning} balanced`;
        }
      });

      // Determine life area focus
      if (strongHouses.length > 0) {
        analysis.lifeAreaFocus = `Strong focus in: ${strongHouses.join(', ')}`;
      }

      if (weakHouses.length > 0) {
        analysis.challenges = `Areas needing attention: ${weakHouses.join(', ')}`;
      }
    }

    return analysis;
  }

  /**
   * Get house meaning
   * @param {number} house - House number
   * @returns {string} House meaning
   * @private
   */
  _getHouseMeaning(house) {
    const houseMeanings = {
      1: 'Self and personality',
      2: 'Wealth and family',
      3: 'Communication and siblings',
      4: 'Home and mother',
      5: 'Children and creativity',
      6: 'Health and service',
      7: 'Partnerships and marriage',
      8: 'Transformation and inheritance',
      9: 'Fortune and higher learning',
      10: 'Career and reputation',
      11: 'Gains and social network',
      12: 'Losses and spirituality'
    };

    return houseMeanings[house] || `House ${house}`;
  }

  /**
   * Calculate confidence score for Ashtakavarga analysis
   * @param {Object} result - Calculation result
   * @returns {number} Confidence score (0-100)
   */
  calculateConfidence(result) {
    let confidence = 80; // Base confidence for Ashtakavarga

    // Increase confidence based on data completeness
    if (result.planetaryStrengths && result.planetaryStrengths.length >= 7) {
      confidence += 10;
    }

    if (result.peakHouses && result.peakHouses.length > 0) {
      confidence += 5;
    }

    if (
      result.enhancedAnalysis &&
      result.enhancedAnalysis.sarvashtakavarga > 0
    ) {
      confidence += 5;
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
      result.planetaryStrengths &&
      Array.isArray(result.planetaryStrengths)
    );
  }

  /**
   * Get service-specific help
   * @returns {string} Help information
   */
  getHelp() {
    return `
📊 **Ashtakavarga Service - Vedic 64-point Beneficial Influence System**

**Purpose:** Provides comprehensive analysis of planetary strengths across 12 life areas using the traditional Ashtakavarga system

**Required Inputs:**
• Birth date (DD/MM/YYYY)
• Birth time (HH:MM)
• Birth place (optional, defaults to calculation location)

**Ashtakavarga System:**
• **64 Total Points** - 8 planets × 8 positions each
• **7 Planets Analyzed** - Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn
• **12 Life Areas** - Each house receives 0-8 beneficial points
• **Bindus** - Points indicating planetary beneficial influence

**Analysis Includes:**

**🌟 Planetary Strengths:**
• Individual planet bindu counts
• House placement analysis
• Strength categorization (Very Strong to Very Weak)

**🏆 Life Area Analysis:**
• Strongest houses (most beneficial points)
• Weakest houses (least beneficial points)
• House-wise interpretations
• Life focus identification

**📊 Overall Assessment:**
• Sarvashtakavarga (total points)
• Overall strength rating
• Life area focus
• Growth opportunities
• Timing recommendations

**Strength Categories:**
• **Very Strong:** 45+ points (Excellent support)
• **Strong:** 35-44 points (Good support)
• **Average:** 25-34 points (Moderate support)
• **Weak:** Below 25 points (Limited support)

**Practical Applications:**
• Identify strongest life areas for success
• Recognize areas needing extra effort
• Determine favorable timing for activities
• Understand personal strengths and challenges
• Plan career and life decisions

**Example Usage:**
"Calculate my Ashtakavarga"
"Analyze my planetary strengths"
"Ashtakavarga analysis for birth date 15/06/1990"
"64-point beneficial influence analysis"

**Output Format:**
Comprehensive Ashtakavarga report with planetary strengths, house analysis, and life guidance
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

module.exports = AshtakavargaService;
