const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure (for now)
const { MuhurtaCalculator } = require('../../../services/astrology/vedic/calculators/MuhurtaCalculator');

/**
 * MuhurtaService - Service for auspicious timing calculations
 * Provides Vedic muhurta analysis for determining optimal times for important activities
 * using Swiss Ephemeris integration for precise astronomical calculations.
 */
class MuhurtaService extends ServiceTemplate {
  constructor() {
    super(new MuhurtaCalculator());
    this.serviceName = 'MuhurtaService';
    logger.info('MuhurtaService initialized');
  }

  async processCalculation(requestData) {
    try {
      // Generate muhurta analysis using calculator
      const result = await this.calculator.generateMuhurta(requestData);
      return result;
    } catch (error) {
      logger.error('MuhurtaService calculation error:', error);
      throw new Error(`Muhurta analysis failed: ${error.message}`);
    }
  }

  formatResult(result) {
    return {
      success: true,
      service: 'Muhurta Analysis',
      timestamp: new Date().toISOString(),
      data: result,
      disclaimer: 'Muhurta analysis provides guidance for auspicious timing based on Vedic principles. Consider practical circumstances and professional advice for final decisions.'
    };
  }

  validate(requestData) {
    if (!requestData) {
      throw new Error('Request data is required');
    }

    const { activity, date, location } = requestData;

    if (!activity || typeof activity !== 'string') {
      throw new Error('Valid activity type is required');
    }

    if (!date || typeof date !== 'string') {
      throw new Error('Valid date is required');
    }

    if (!location || typeof location !== 'string') {
      throw new Error('Valid location is required');
    }

    // Validate date format
    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!dateRegex.test(date)) {
      throw new Error('Date must be in DD/MM/YYYY format');
    }

    return true;
  }

  /**
   * Get recommended best muhurta for an activity
   * @param {Object} requestData - Request data
   * @param {string} requestData.activity - Activity type
   * @param {string} requestData.timeWindow - Time window (morning, afternoon, evening)
   * @param {string} requestData.location - Location
   * @returns {Promise<Object>} Best muhurta recommendation
   */
  async getRecommendedMuhurta(requestData) {
    try {
      this._validateInput(requestData);

      const { timeWindow, activity, location } = requestData;
      const result = await this.calculator.recommendBestMuhurta(timeWindow, activity, location);

      return {
        recommendation: result,
        activity,
        timeWindow,
        location,
        error: false
      };
    } catch (error) {
      logger.error('MuhurtaService getRecommendedMuhurta error:', error);
      return {
        error: true,
        message: 'Error finding recommended muhurta'
      };
    }
  }

  /**
   * Analyze muhurta for a specific date and activity
   * @param {string} date - Date in DD/MM/YYYY format
   * @param {string} activity - Activity type
   * @param {string} location - Location for calculation
   * @returns {Promise<Object>} Muhurta analysis for specific date
   */
  async analyzeMuhurtaForDate(date, activity, location) {
    try {
      if (!date || !activity || !location) {
        throw new Error('Date, activity, and location are required');
      }

      const requestData = {
        date,
        activity,
        location,
        timeWindow: 'full_day' // Analyze entire day
      };

      const result = await this.execute(requestData);

      return {
        date,
        activity,
        location,
        analysis: result.muhurta,
        error: false
      };
    } catch (error) {
      logger.error('MuhurtaService analyzeMuhurtaForDate error:', error);
      return {
        error: true,
        message: `Error analyzing muhurta for ${date}`
      };
    }
  }

  /**
   * Get auspicious periods for different activities
   * @param {string} date - Date to analyze
   * @param {string} location - Location
   * @returns {Promise<Object>} Auspicious periods for various activities
   */
  async getAuspiciousPeriods(date, location) {
    try {
      if (!date || !location) {
        throw new Error('Date and location are required');
      }

      const activities = [
        'marriage', 'business', 'spiritual', 'education',
        'health', 'travel', 'housewarming'
      ];

      const periods = {};

      for (const activity of activities) {
        const analysis = await this.analyzeMuhurtaForDate(date, activity, location);
        if (!analysis.error) {
          periods[activity] = {
            auspiciousPeriods: analysis.analysis?.auspiciousPeriods || [],
            bestMuhurta: analysis.analysis?.bestMuhurta,
            overallRating: analysis.analysis?.overallRating || 'Unknown'
          };
        }
      }

      return {
        date,
        location,
        auspiciousPeriods: periods,
        summary: this._generatePeriodsSummary(periods),
        error: false
      };
    } catch (error) {
      logger.error('MuhurtaService getAuspiciousPeriods error:', error);
      return {
        error: true,
        message: 'Error finding auspicious periods'
      };
    }
  }

  /**
   * Check if a specific time is auspicious for an activity
   * @param {string} dateTime - Date and time in DD/MM/YYYY HH:MM format
   * @param {string} activity - Activity type
   * @param {string} location - Location
   * @returns {Promise<Object>} Auspiciousness check result
   */
  async checkTimeAuspiciousness(dateTime, activity, location) {
    try {
      if (!dateTime || !activity || !location) {
        throw new Error('Date/time, activity, and location are required');
      }

      // Parse date and time
      const [datePart, timePart] = dateTime.split(' ');
      if (!datePart || !timePart) {
        throw new Error('Invalid date/time format. Use DD/MM/YYYY HH:MM');
      }

      const requestData = {
        date: datePart,
        time: timePart,
        activity,
        location
      };

      const analysis = await this.execute(requestData);

      return {
        dateTime,
        activity,
        location,
        isAuspicious: analysis.muhurta?.overallRating === 'excellent' ||
                     analysis.muhurta?.overallRating === 'good',
        rating: analysis.muhurta?.overallRating || 'Unknown',
        factors: analysis.muhurta?.auspiciousFactors || [],
        warnings: analysis.muhurta?.inauspiciousFactors || [],
        error: false
      };
    } catch (error) {
      logger.error('MuhurtaService checkTimeAuspiciousness error:', error);
      return {
        error: true,
        message: 'Error checking time auspiciousness'
      };
    }
  }

  /**
   * Get muhurta calendar for a month
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @param {string} location - Location
   * @returns {Promise<Object>} Monthly muhurta calendar
   */
  async getMonthlyMuhurtaCalendar(year, month, location) {
    try {
      if (!year || !month || !location || month < 1 || month > 12) {
        throw new Error('Valid year, month (1-12), and location are required');
      }

      const daysInMonth = new Date(year, month, 0).getDate();
      const calendar = {};

      // Analyze each day of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;

        try {
          const dayAnalysis = await this.getAuspiciousPeriods(dateStr, location);
          if (!dayAnalysis.error) {
            calendar[dateStr] = {
              overallRating: this._calculateDayOverallRating(dayAnalysis.auspiciousPeriods),
              bestActivities: this._findBestActivitiesForDay(dayAnalysis.auspiciousPeriods),
              summary: dayAnalysis.summary
            };
          }
        } catch (dayError) {
          logger.warn(`Error analyzing day ${dateStr}:`, dayError.message);
          calendar[dateStr] = { error: 'Analysis failed' };
        }
      }

      return {
        year,
        month,
        location,
        calendar,
        monthlySummary: this._generateMonthlySummary(calendar),
        error: false
      };
    } catch (error) {
      logger.error('MuhurtaService getMonthlyMuhurtaCalendar error:', error);
      return {
        error: true,
        message: 'Error generating monthly muhurta calendar'
      };
    }
  }

  /**
   * Validate input data
   * @param {Object} input - Input data to validate
   * @private
   */
  _validateInput(input) {
    if (!input) {
      throw new Error('Request data is required');
    }

    const { activity, date, location } = input;

    if (!activity || typeof activity !== 'string') {
      throw new Error('Valid activity type is required');
    }

    if (!location || typeof location !== 'string') {
      throw new Error('Valid location is required');
    }

    if (date && typeof date !== 'string') {
      throw new Error('Date must be a string in DD/MM/YYYY format');
    }

    // Validate activity type
    const validActivities = [
      'marriage', 'business', 'spiritual', 'education',
      'health', 'travel', 'housewarming', 'general'
    ];

    if (!validActivities.includes(activity.toLowerCase())) {
      throw new Error(`Invalid activity type. Valid types: ${validActivities.join(', ')}`);
    }
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['execute', 'getRecommendedMuhurta', 'analyzeMuhurtaCalendar', 'getMuhurtaCalendar'],
      dependencies: ['MuhurtaCalculator']
    };
  }

  /**
   * Generate summary of auspicious periods
   * @param {Object} periods - Auspicious periods data
   * @returns {string} Summary text
   * @private
   */
  _generatePeriodsSummary(periods) {
    const excellentActivities = Object.entries(periods)
      .filter(([_, data]) => data.overallRating === 'excellent')
      .map(([activity, _]) => activity);

    const goodActivities = Object.entries(periods)
      .filter(([_, data]) => data.overallRating === 'good')
      .map(([activity, _]) => activity);

    let summary = '';

    if (excellentActivities.length > 0) {
      summary += `Excellent timing for: ${excellentActivities.join(', ')}. `;
    }

    if (goodActivities.length > 0) {
      summary += `Good timing for: ${goodActivities.join(', ')}. `;
    }

    if (excellentActivities.length === 0 && goodActivities.length === 0) {
      summary += 'Generally neutral timing. Consider alternative dates for important activities.';
    }

    return summary;
  }

  /**
   * Calculate overall rating for a day
   * @param {Object} periods - Day's periods data
   * @returns {string} Overall rating
   * @private
   */
  _calculateDayOverallRating(periods) {
    const ratings = Object.values(periods).map(p => p.overallRating);

    if (ratings.includes('excellent')) return 'excellent';
    if (ratings.includes('good')) return 'good';
    if (ratings.includes('fair')) return 'fair';
    return 'neutral';
  }

  /**
   * Find best activities for a day
   * @param {Object} periods - Day's periods data
   * @returns {Array} Best activities
   * @private
   */
  _findBestActivitiesForDay(periods) {
    return Object.entries(periods)
      .filter(([_, data]) => data.overallRating === 'excellent' || data.overallRating === 'good')
      .map(([activity, _]) => activity);
  }

  /**
   * Generate monthly summary
   * @param {Object} calendar - Monthly calendar data
   * @returns {Object} Monthly summary
   * @private
   */
  _generateMonthlySummary(calendar) {
    const days = Object.values(calendar);
    const excellentDays = days.filter(d => d.overallRating === 'excellent').length;
    const goodDays = days.filter(d => d.overallRating === 'good').length;
    const totalDays = days.length;

    return {
      totalDays: totalDays,
      excellentDays: excellentDays,
      goodDays: goodDays,
      bestActivities: this._findMostFavorableActivities(calendar),
      overall: excellentDays > totalDays * 0.3 ? 'Highly auspicious month' :
               goodDays > totalDays * 0.5 ? 'Generally favorable month' :
               'Mixed timing month'
    };
  }

  /**
   * Find most favorable activities for the month
   * @param {Object} calendar - Monthly calendar
   * @returns {Array} Most favorable activities
   * @private
   */
  _findMostFavorableActivities(calendar) {
    const activityCount = {};

    Object.values(calendar).forEach(day => {
      if (day.bestActivities) {
        day.bestActivities.forEach(activity => {
          activityCount[activity] = (activityCount[activity] || 0) + 1;
        });
      }
    });

    return Object.entries(activityCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([activity, _]) => activity);
  }
}

module.exports = MuhurtaService;