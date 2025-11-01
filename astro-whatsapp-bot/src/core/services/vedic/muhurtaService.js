const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');

/**
 * MuhurtaService - Service for auspicious timing calculations (Electional Astrology)
 *
 * Provides auspicious timing calculations for important activities using Vedic electional astrology,
 * helping to select optimal moments for new ventures, ceremonies, and significant decisions.
 */
class MuhurtaService extends ServiceTemplate {
  constructor() {
    super('MuhurtaCalculator'); // Primary calculator for this service
    this.serviceName = 'MuhurtaService';
    this.calculatorPath = '../../../services/astrology/vedic/calculators/MuhurtaCalculator';
    logger.info('MuhurtaService initialized');
  }

  /**
   * Main calculation method for Muhurta analysis.
   * @param {Object} params - Calculation parameters.
   * @param {Object} params.muhurtaData - Data for Muhurta calculation.
   * @param {string} params.muhurtaData.activity - Type of activity.
   * @param {string} params.muhurtaData.preferredDate - Preferred date (DD/MM/YYYY).
   * @param {Object} params.muhurtaData.location - Location details.
   * @returns {Promise<Object>} Comprehensive Muhurta analysis.
   */
  async processCalculation(params) {
    try {
      // Ensure calculator is loaded
      if (!this.calculator) {
        await this.initialize();
      }

      const { muhurtaData } = params;

      this._validateInputs(muhurtaData);

      // Generate Muhurta using calculator
      const muhurtaResult = await this.calculator.generateMuhurta(muhurtaData);

      // Add service metadata
      muhurtaResult.serviceMetadata = {
        serviceName: this.serviceName,
        calculationType: 'Muhurta (Electional Astrology)',
        timestamp: new Date().toISOString(),
        method: 'Vedic auspicious timing calculation',
        activityType: muhurtaData.activity,
        calculationApproach: 'Traditional Muhurta principles'
      };

      // Add enhanced analysis
      muhurtaResult.enhancedAnalysis = this._performEnhancedMuhurtaAnalysis(muhurtaResult, muhurtaData);

      return muhurtaResult;
    } catch (error) {
      logger.error('MuhurtaService processCalculation error:', error);
      throw new Error(`Muhurta calculation failed: ${error.message}`);
    }
  }

  /**
   * Formats the Muhurta result for consistent output.
   * @param {Object} result - Raw calculator result.
   * @returns {Object} Formatted Muhurta analysis.
   */
  formatResult(result) {
    if (!result || !result.recommendations) {
      return {
        success: false,
        error: result.error || 'Unknown error',
        message: 'Muhurta analysis failed',
        service: this.serviceName
      };
    }

    let formatted = '⏰ *Muhurta (Auspicious Timing) Analysis*\n\n';

    formatted += `*Activity:* ${result.activity}\n`;
    formatted += `*Preferred Date:* ${result.preferredDate}\n`;
    formatted += `*Location:* ${result.location}\n\n`;

    if (result.dailyAnalysis) {
      formatted += '*📅 Daily Auspiciousness:*\n';
      formatted += `• **Overall Rating:** ${result.dailyAnalysis.overallRating}\n`;
      formatted += `• **Tithi:** ${result.dailyAnalysis.tithi || 'N/A'}\n`;
      formatted += `• **Nakshatra:** ${result.dailyAnalysis.nakshatra || 'N/A'}\n`;
      formatted += `• **Yoga:** ${result.dailyAnalysis.yoga || 'N/A'}\n`;
      formatted += `• **Karana:** ${result.dailyAnalysis.karana || 'N/A'}\n\n`;
    }

    if (result.recommendations) {
      formatted += '*🎯 Best Timing Recommendations:*\n';
      if (result.recommendations.overall) {
        formatted += `• **Overall:** ${result.recommendations.overall}\n`;
      }
      if (result.recommendations.bestTime) {
        formatted += `• **Best Time:** ${result.recommendations.bestTime}\n`;
      }
      if (result.recommendations.precautions) {
        formatted += `• **Precautions:** ${result.recommendations.precautions}\n`;
      }
      formatted += '\n';
    }

    if (result.timeSlotsAnalysis) {
      formatted += '*🕐 Auspicious Time Slots:*\n';
      const timeSlots = Object.entries(result.timeSlotsAnalysis)
        .filter(([time, data]) => data.suitability.rating !== 'Poor')
        .sort((a, b) => b[1].suitability.score - a[1].suitability.score)
        .slice(0, 5);

      if (timeSlots.length > 0) {
        timeSlots.forEach(([time, data]) => {
          formatted += `• **${time}:** ${data.suitability.rating} (${data.suitability.score}/100)\n`;
          if (data.suitability.reasons && data.suitability.reasons.length > 0) {
            formatted += `  ${data.suitability.reasons[0]}\n`;
          }
        });
      } else {
        formatted += '• No highly suitable time slots found\n';
      }
      formatted += '\n';
    }

    if (result.planetaryStrengths) {
      formatted += '*🌟 Planetary Support:*\n';
      if (result.planetaryStrengths.favorable && result.planetaryStrengths.favorable.length > 0) {
        formatted += `• **Favorable:** ${result.planetaryStrengths.favorable.join(', ')}\n`;
      }
      if (result.planetaryStrengths.neutral && result.planetaryStrengths.neutral.length > 0) {
        formatted += `• **Neutral:** ${result.planetaryStrengths.neutral.join(', ')}\n`;
      }
      if (result.planetaryStrengths.challenging && result.planetaryStrengths.challenging.length > 0) {
        formatted += `• **Challenging:** ${result.planetaryStrengths.challenging.join(', ')}\n`;
      }
      formatted += '\n';
    }

    if (result.enhancedAnalysis) {
      formatted += '*🎯 Enhanced Analysis:*\n';
      if (result.enhancedAnalysis.overallAssessment) {
        formatted += `• **Assessment:** ${result.enhancedAnalysis.overallAssessment}\n`;
      }
      if (result.enhancedAnalysis.timingQuality) {
        formatted += `• **Timing Quality:** ${result.enhancedAnalysis.timingQuality}\n`;
      }
      if (result.enhancedAnalysis.actionableAdvice) {
        formatted += `• **Actionable Advice:** ${result.enhancedAnalysis.actionableAdvice}\n`;
      }
      formatted += '\n';
    }

    if (result.alternatives && result.alternatives.length > 0) {
      formatted += '*📅 Alternative Dates:*\n';
      result.alternatives.slice(0, 3).forEach(alt => {
        formatted += `• **${alt.date}:** ${alt.rating} - ${alt.reason}\n`;
      });
      formatted += '\n';
    }

    if (result.summary) {
      formatted += `*📋 Summary:*\n${result.summary}\n\n`;
    }

    formatted += '---\n*Muhurta - Vedic Auspicious Timing for Important Activities*';

    return formatted;
  }

  /**
   * Validates input parameters for Muhurta calculation.
   * @param {Object} muhurtaData - Muhurta data object.
   * @private
   */
  _validateInputs(muhurtaData) {
    if (!muhurtaData) {
      throw new Error('Muhurta data is required for auspicious timing analysis');
    }

    if (!muhurtaData.activity || muhurtaData.activity.trim().length === 0) {
      throw new Error('Activity type is required for Muhurta calculation');
    }

    if (!muhurtaData.preferredDate) {
      throw new Error('Preferred date is required for Muhurta analysis');
    }

    if (!muhurtaData.location) {
      throw new Error('Location is required for accurate Muhurta calculation');
    }
  }

  /**
   * Performs enhanced analysis on Muhurta results.
   * @param {Object} result - Muhurta calculation result.
   * @param {Object} muhurtaData - Original request data.
   * @returns {Object} Enhanced analysis.
   * @private
   */
  _performEnhancedMuhurtaAnalysis(result, muhurtaData) {
    const analysis = {
      overallAssessment: '',
      timingQuality: '',
      actionableAdvice: '',
      alternativeSuggestion: '',
      confidenceLevel: '',
      riskFactors: []
    };

    if (result.dailyAnalysis?.overallRating) {
      const rating = result.dailyAnalysis.overallRating;
      if (rating === 'Excellent') {
        analysis.overallAssessment = 'Highly auspicious day with excellent planetary support';
        analysis.timingQuality = 'Premium timing - proceed with confidence';
        analysis.actionableAdvice = 'This is an ideal time for your activity - take full advantage';
      } else if (rating === 'Good') {
        analysis.overallAssessment = 'Favorable day with good planetary alignments';
        analysis.timingQuality = 'Good timing - favorable conditions present';
        analysis.actionableAdvice = 'Proceed with your activity during recommended time slots';
      } else if (rating === 'Fair') {
        analysis.overallAssessment = 'Moderate day with mixed planetary influences';
        analysis.timingQuality = 'Acceptable timing - some precautions needed';
        analysis.actionableAdvice = 'Proceed during best time slots with appropriate preparations';
      } else {
        analysis.overallAssessment = 'Challenging day with difficult planetary conditions';
        analysis.timingQuality = 'Difficult timing - consider alternatives';
        analysis.actionableAdvice = 'Postpone activity or choose alternative date if possible';
      }
    }

    if (result.dailyAnalysis?.overallRating && result.timeSlotsAnalysis) {
      const goodSlots = Object.values(result.timeSlotsAnalysis)
        .filter(slot => slot.suitability.rating === 'Excellent' || slot.suitability.rating === 'Good')
        .length;

      if (result.dailyAnalysis.overallRating === 'Excellent' && goodSlots >= 3) {
        analysis.confidenceLevel = 'High - Multiple excellent time slots available';
      } else if (result.dailyAnalysis.overallRating === 'Good' && goodSlots >= 2) {
        analysis.confidenceLevel = 'Moderate-High - Good options available';
      } else if (goodSlots >= 1) {
        analysis.confidenceLevel = 'Moderate - Limited but suitable options';
      } else {
        analysis.confidenceLevel = 'Low - Consider alternative dates';
      }
    }

    if (result.planetaryStrengths?.challenging && result.planetaryStrengths.challenging.length > 0) {
      analysis.riskFactors.push(`Challenging planetary influences: ${result.planetaryStrengths.challenging.join(', ')}`);
    }

    if (result.dailyAnalysis?.overallRating === 'Poor') {
      analysis.riskFactors.push('Overall day rated as poor for activities');
    }

    if (result.weekdaySuitability?.suitability === 'Poor') {
      analysis.riskFactors.push('Weekday not suitable for this activity');
    }

    if (result.alternatives && result.alternatives.length > 0) {
      const bestAlternative = result.alternatives[0];
      analysis.alternativeSuggestion = `Consider ${bestAlternative.date} (${bestAlternative.rating})`;
    }
    return analysis;
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
      description: 'Service for auspicious timing calculations (Electional Astrology).'
    };
  }

  /**
   * Returns help information for the service.
   * @returns {string} Help text.
   */
  getHelp() {
    return `
⏰ **Muhurta Service - Auspicious Timing for Important Activities**

**Purpose:** Calculates the most favorable timing (Muhurta) for important activities using Vedic electional astrology principles.

**Required Inputs:**
• Activity type (what you want to do)
• Preferred date (DD/MM/YYYY)
• Location (where the activity will take place)

**Analysis Includes:**
• **Daily Auspiciousness:** Overall rating of the day based on Panchanga elements (Tithi, Nakshatra, Yoga, Karana, Vaara).
• **Best Time Slots:** Identification of highly auspicious periods within the day.
• **Planetary Support:** Assessment of favorable and challenging planetary influences.
• **Enhanced Analysis:** Overall assessment of timing quality, actionable advice, and risk factors.
• **Alternative Dates:** Suggestions for more favorable dates if the preferred date is not optimal.

**Example Usage:**
"Find the best time for a marriage ceremony on 2025-12-25 in New Delhi."
"What is the most auspicious time to start a new business next week?"

**Output Format:**
Comprehensive report with daily auspiciousness, best time slots, planetary support, and recommendations.
    `.trim();
  }
}

module.exports = MuhurtaService;
