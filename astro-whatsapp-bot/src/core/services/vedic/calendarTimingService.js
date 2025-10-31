/**
 * Calendar Timing Service
 *
 * Provides comprehensive calendar timing analysis including Muhurta (auspicious timing),
 * Abhijit Muhurta, Rahukalam, Gulikakalam, and other Vedic timing calculations
 * for optimal activity scheduling.
 */

const MuhurtaCalculator = require('../../../services/astrology/vedic/calculators/MuhurtaCalculator');
const logger = require('../../../../utils/logger');

class CalendarTimingService {
  constructor() {
    this.muhurtaCalculator = new MuhurtaCalculator();
    logger.info('CalendarTimingService initialized');
  }

  /**
   * Execute comprehensive calendar timing analysis
   * @param {Object} timingData - Timing request data
   * @returns {Promise<Object>} Complete timing analysis
   */
  async execute(timingData) {
    try {
      // Input validation
      this._validateInput(timingData);

      // Get comprehensive timing analysis
      const result = await this.getCalendarTimingAnalysis(timingData);

      // Format and return result
      return this._formatResult(result);

    } catch (error) {
      logger.error('CalendarTimingService error:', error);
      throw new Error(`Calendar timing analysis failed: ${error.message}`);
    }
  }

  /**
   * Get comprehensive calendar timing analysis
   * @param {Object} timingData - Timing data including date, location, activity type
   * @returns {Promise<Object>} Calendar timing analysis
   */
  async getCalendarTimingAnalysis(timingData) {
    try {
      const { date, location, activityType, birthData } = timingData;

      // Calculate Muhurta (auspicious timing)
      const muhurtaAnalysis = await this.muhurtaCalculator.calculateMuhurta(date, location, activityType);

      // Calculate Abhijit Muhurta (most auspicious 48-minute period)
      const abhijitMuhurta = await this.muhurtaCalculator.calculateAbhijitMuhurta(date, location);

      // Calculate Rahukalam (inauspicious period)
      const rahukalam = await this.muhurtaCalculator.calculateRahukalam(date, location);

      // Calculate Gulikakalam (another inauspicious period)
      const gulikakalam = await this.muhurtaCalculator.calculateGulikakalam(date, location);

      // Get daily Panchang for additional timing context
      const panchangData = await this._getPanchangTiming(date, location);

      return {
        date,
        location,
        activityType,
        muhurtaAnalysis,
        abhijitMuhurta,
        rahukalam,
        gulikakalam,
        panchangTiming: panchangData,
        recommendations: this._generateTimingRecommendations({
          muhurtaAnalysis,
          abhijitMuhurta,
          rahukalam,
          gulikakalam,
          activityType
        })
      };
    } catch (error) {
      logger.error('Error getting calendar timing analysis:', error);
      throw error;
    }
  }

  /**
   * Get Panchang data for timing context
   * @param {string} date - Date for analysis
   * @param {Object} location - Location coordinates
   * @returns {Promise<Object>} Panchang timing data
   * @private
   */
  async _getPanchangTiming(date, location) {
    try {
      // Import PanchangCalculator for additional timing context
      const PanchangCalculator = require('../../../services/astrology/vedic/calculators/PanchangCalculator');
      const panchangCalc = new PanchangCalculator();

      const panchangData = await panchangCalc.calculatePanchang(date, location);

      return {
        tithi: panchangData.tithi,
        nakshatra: panchangData.nakshatra,
        yoga: panchangData.yoga,
        karana: panchangData.karana,
        sunrise: panchangData.sunrise,
        sunset: panchangData.sunset
      };
    } catch (error) {
      logger.warn('Could not get Panchang timing data:', error.message);
      return null;
    }
  }

  /**
   * Generate timing recommendations based on analysis
   * @param {Object} analysis - Timing analysis results
   * @returns {Object} Recommendations
   * @private
   */
  _generateTimingRecommendations(analysis) {
    const { muhurtaAnalysis, abhijitMuhurta, rahukalam, gulikakalam, activityType } = analysis;

    const recommendations = {
      optimalTimes: [],
      avoidTimes: [],
      generalAdvice: '',
      activitySpecific: {}
    };

    // Add Abhijit Muhurta as optimal time
    if (abhijitMuhurta && abhijitMuhurta.isAvailable) {
      recommendations.optimalTimes.push({
        type: 'Abhijit Muhurta',
        time: `${abhijitMuhurta.startTime} - ${abhijitMuhurta.endTime}`,
        reason: 'Most auspicious 48-minute period of the day'
      });
    }

    // Add Muhurta recommendations
    if (muhurtaAnalysis && muhurtaAnalysis.recommendedMuhurtas) {
      muhurtaAnalysis.recommendedMuhurtas.forEach(mu => {
        recommendations.optimalTimes.push({
          type: 'Muhurta',
          time: `${mu.startTime} - ${mu.endTime}`,
          reason: mu.reason
        });
      });
    }

    // Add times to avoid
    if (rahukalam) {
      recommendations.avoidTimes.push({
        type: 'Rahukalam',
        time: `${rahukalam.startTime} - ${rahukalam.endTime}`,
        reason: 'Inauspicious period for important activities'
      });
    }

    if (gulikakalam) {
      recommendations.avoidTimes.push({
        type: 'Gulikakalam',
        time: `${gulikakalam.startTime} - ${gulikakalam.endTime}`,
        reason: 'Inauspicious period for important activities'
      });
    }

    // Activity-specific advice
    recommendations.activitySpecific = this._getActivitySpecificAdvice(activityType);

    // General advice
    recommendations.generalAdvice = 'Consider planetary transits, personal birth chart, and current dasha periods when selecting final timing.';

    return recommendations;
  }

  /**
   * Get activity-specific timing advice
   * @param {string} activityType - Type of activity
   * @returns {Object} Activity-specific advice
   * @private
   */
  _getActivitySpecificAdvice(activityType) {
    const activityAdvice = {
      marriage: {
        priority: 'High',
        considerations: 'Check for auspicious tithi, nakshatra, and planetary alignments',
        bestMuhurta: 'Abhijit Muhurta or Brahma Muhurta'
      },
      business: {
        priority: 'Medium',
        considerations: 'Avoid Rahukalam and Gulikakalam',
        bestMuhurta: 'Abhijit Muhurta or favorable planetary hours'
      },
      travel: {
        priority: 'Medium',
        considerations: 'Check directional influences and planetary transits',
        bestMuhurta: 'Abhijit Muhurta or favorable nakshatra'
      },
      medical: {
        priority: 'High',
        considerations: 'Avoid inauspicious periods and check lunar phases',
        bestMuhurta: 'Abhijit Muhurta or Shukla Paksha'
      },
      education: {
        priority: 'Medium',
        considerations: 'Favorable for Mercury and Jupiter periods',
        bestMuhurta: 'Budha Hora or Guru Hora'
      },
      general: {
        priority: 'Low',
        considerations: 'General auspicious timing',
        bestMuhurta: 'Abhijit Muhurta or favorable planetary hours'
      }
    };

    return activityAdvice[activityType] || activityAdvice.general;
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

    if (!input.date) {
      throw new Error('Date is required for calendar timing analysis');
    }

    if (!input.location) {
      throw new Error('Location is required for calendar timing analysis');
    }

    // Validate date format (DD/MM/YYYY)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(input.date)) {
      throw new Error('Date must be in DD/MM/YYYY format');
    }

    // Validate location has coordinates
    if (!input.location.latitude || !input.location.longitude) {
      throw new Error('Location must include latitude and longitude coordinates');
    }
  }

  /**
   * Format result for presentation
   * @param {Object} result - Raw timing analysis result
   * @returns {Object} Formatted result
   * @private
   */
  _formatResult(result) {
    if (!result) {
      return {
        success: false,
        error: 'Unable to generate calendar timing analysis',
        message: 'Calendar timing analysis failed'
      };
    }

    return {
      success: true,
      message: 'Calendar timing analysis completed successfully',
      data: {
        analysis: result,
        summary: this._createTimingSummary(result),
        disclaimer: '⚠️ *Timing Disclaimer:* This analysis provides general auspicious timing guidance based on Vedic principles. Final decisions should consider personal birth chart, current planetary transits, and professional consultation.'
      }
    };
  }

  /**
   * Create timing summary for quick reference
   * @param {Object} result - Full timing analysis
   * @returns {Object} Summary
   * @private
   */
  _createTimingSummary(result) {
    return {
      date: result.date,
      location: result.location,
      activityType: result.activityType,
      optimalTiming: result.recommendations.optimalTimes.length > 0 ?
        result.recommendations.optimalTimes[0] : null,
      timesToAvoid: result.recommendations.avoidTimes,
      keyRecommendation: result.recommendations.activitySpecific
    };
  }

  /**
   * Get service metadata
   * @returns {Object} Service information
   */
  getMetadata() {
    return {
      name: 'CalendarTimingService',
      description: 'Comprehensive Vedic calendar timing analysis including Muhurta, Abhijit Muhurta, Rahukalam, and Gulikakalam calculations for optimal activity scheduling',
      version: '1.0.0',
      dependencies: ['MuhurtaCalculator', 'PanchangCalculator'],
      category: 'vedic'
    };
  }
}

module.exports = CalendarTimingService;