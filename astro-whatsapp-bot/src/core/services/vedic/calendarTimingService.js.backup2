const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure (for now)
const { MuhurtaCalculator } = require('../../../services/astrology/vedic/calculators/MuhurtaCalculator');

/**
 * CalendarTimingService - Vedic calendar timing and auspicious period analysis service
 *
 * Provides comprehensive calendar timing analysis including Muhurta (auspicious timing),
 * Abhijit Muhurta, Rahukalam, Gulikakalam, and other Vedic timing calculations
 * for optimal activity scheduling.
 */
class CalendarTimingService extends ServiceTemplate {
  constructor() {
    super('ucalendarTimingService'));
    this.serviceName = 'CalendarTimingService';
    logger.info('CalendarTimingService initialized');
  }

  async processCalculation(timingData) {
    try {
      // Get comprehensive timing analysis
      const result = await this.getCalendarTimingAnalysis(timingData);
      return result;
    } catch (error) {
      logger.error('CalendarTimingService calculation error:', error);
      throw new Error(`Calendar timing analysis failed: ${error.message}`);
    }
  }

  formatResult(result) {
    return {
      success: true,
      service: 'Vedic Calendar Timing Analysis',
      timestamp: new Date().toISOString(),
      data: result,
      disclaimer: '⚠️ *Timing Disclaimer:* This analysis provides general auspicious timing guidance based on Vedic principles. Final decisions should consider personal birth chart, current planetary transits, and professional consultation.'
    };
  }

  validate(timingData) {
    if (!timingData) {
      throw new Error('Timing data is required');
    }

    if (!timingData.date) {
      throw new Error('Date is required for calendar timing analysis');
    }

    if (!timingData.location) {
      throw new Error('Location is required for calendar timing analysis');
    }

    // Validate date format (DD/MM/YYYY)
    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!dateRegex.test(timingData.date)) {
      throw new Error('Date must be in DD/MM/YYYY format');
    }

    // Validate location has coordinates
    if (!timingData.location.latitude || !timingData.location.longitude) {
      throw new Error('Location must include latitude and longitude coordinates');
    }

    return true;
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
      const muhurtaAnalysis = await this.calculator.calculateMuhurta(date, location, activityType);

      // Calculate Abhijit Muhurta (most auspicious 48-minute period)
      const abhijitMuhurta = await this.calculator.calculateAbhijitMuhurta(date, location);

      // Calculate Rahukalam (inauspicious period)
      const rahukalam = await this.calculator.calculateRahukalam(date, location);

      // Calculate Gulikakalam (another inauspicious period)
      const gulikakalam = await this.calculator.calculateGulikakalam(date, location);

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
      const { PanchangCalculator } = require('../../../services/astrology/vedic/calculators/PanchangCalculator');
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

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['execute', 'getCalendarTimingAnalysis'],
      dependencies: ['MuhurtaCalculator', 'PanchangCalculator']
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

module.exports = CalendarTimingService;
