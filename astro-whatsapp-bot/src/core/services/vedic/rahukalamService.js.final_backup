const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure

/**
 * RahukalamService - Specialized service for calculating Rahukalam timing
 *
 * Provides analysis of Rahukalam, an inauspicious 90-minute period each day in Vedic astrology
 * during which malefic planetary influences are strongest. Understanding Rahukalam timing helps
 * avoid important activities and minimize negative outcomes.
 */
class RahukalamService extends ServiceTemplate {
  constructor(services) {
    super('urahukalamService'));
    
    // Initialize calculator with services if provided
    if (services) {
      this.calculator.setServices(services);
    }
    
    this.serviceName = 'RahukalamService';
    logger.info('RahukalamService initialized');
  }

  async processCalculation(birthData) {
    try {
      // Validate input
      this._validateInput(birthData);

      // Calculate Rahukalam timing
      const rahukalamTiming = await this._calculateRahukalam(birthData);

      // Add service metadata
      rahukalamTiming.serviceMetadata = {
        serviceName: this.serviceName,
        calculationType: 'Rahukalam Analysis',
        timestamp: new Date().toISOString(),
        timing: 'Approximately 90 minutes daily',
        significance: 'Inauspicious period ruled by Rahu'
      };

      return rahukalamTiming;
    } catch (error) {
      logger.error('RahukalamService calculation error:', error);
      throw new Error(`Rahukalam analysis failed: ${error.message}`);
    }
  }

  /**
   * Calculate Rahukalam timing for a specific date and location
   * @private
   * @param {Object} birthData - Birth data with date, time, and location
   * @returns {Object} Rahukalam timing analysis
   */
  async _calculateRahukalam(birthData) {
    try {
      const { birthDate, birthPlace } = birthData;
      
      // Parse date components
      const [day, month, year] = birthDate.split('/').map(Number);
      
      // Get location coordinates and timezone
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const timestamp = new Date(year, month - 1, day).getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);
      
      // Calculate Rahukalam timing based on weekday
      const rahukalamTiming = this._calculateRahukalamTiming(year, month, day, latitude, longitude, timezone);
      
      // Analyze Rahukalam significance for the date
      const significanceAnalysis = this._analyzeRahukalamSignificance(rahukalamTiming);
      
      // Generate timing recommendations
      const recommendations = this._generateRahukalamRecommendations(rahukalamTiming, significanceAnalysis);
      
      return {
        date: birthDate,
        place: birthPlace,
        rahukalamTiming,
        significanceAnalysis,
        recommendations,
        summary: this._generateRahukalamSummary(rahukalamTiming, significanceAnalysis, recommendations)
      };
    } catch (error) {
      logger.error('Error calculating Rahukalam:', error);
      throw new Error(`Failed to calculate Rahukalam timing: ${error.message}`);
    }
  }

  /**
   * Calculate Rahukalam timing based on weekday
   * @private
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} timezone - Timezone
   * @returns {Object} Rahukalam timing details
   */
  _calculateRahukalamTiming(year, month, day, latitude, longitude, timezone) {
    try {
      // Determine weekday
      const date = new Date(year, month - 1, day);
      const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Rahukalam schedule (based on traditional Vedic system)
      const rahukalamSchedule = {
        Sunday: { order: 1, lord: 'Sun' },
        Monday: { order: 2, lord: 'Moon' },
        Tuesday: { order: 3, lord: 'Mars' },
        Wednesday: { order: 4, lord: 'Mercury' },
        Thursday: { order: 5, lord: 'Jupiter' },
        Friday: { order: 6, lord: 'Venus' },
        Saturday: { order: 7, lord: 'Saturn' }
      };
      
      const dayInfo = rahukalamSchedule[weekday];
      
      // Calculate sunrise and sunset for the day
      const jd = this._dateToJulianDay(year, month, day, 12);
      const sunTimes = this._calculateSunTimes(jd, latitude, longitude);
      
      // Calculate daylight duration
      const daylightDuration = sunTimes.sunset - sunTimes.sunrise;
      
      // Each planetary period is 1/8th of daylight duration
      const planetaryPeriod = daylightDuration / 8;
      
      // Rahukalam starts at sunrise and comes in the order given above
      const rahukalamStartDecimal = sunTimes.sunrise + ((dayInfo.order - 1) * planetaryPeriod);
      const rahukalamEndDecimal = rahukalamStartDecimal + planetaryPeriod;
      
      return {
        weekday,
        date: `${day}/${month}/${year}`,
        startTime: this._decimalToTime(rahukalamStartDecimal),
        endTime: this._decimalToTime(rahukalamEndDecimal),
        durationMinutes: Math.round(planetaryPeriod * 60),
        planetaryLord: dayInfo.lord,
        planetaryOrder: dayInfo.order,
        sunTimes: {
          sunrise: this._decimalToTime(sunTimes.sunrise),
          sunset: this._decimalToTime(sunTimes.sunset)
        }
      };
    } catch (error) {
      logger.warn('Error calculating precise Rahukalam timing, using approximate:', error.message);
      
      // Fallback to approximate timing based on weekday
      const weekday = new Date(year, month - 1, day).toLocaleDateString('en-US', { weekday: 'long' });
      const approximateTimings = {
        Sunday: { startTime: '07:30', endTime: '09:00', duration: 90 },
        Monday: { startTime: '09:00', endTime: '10:30', duration: 90 },
        Tuesday: { startTime: '10:30', endTime: '12:00', duration: 90 },
        Wednesday: { startTime: '12:00', endTime: '13:30', duration: 90 },
        Thursday: { startTime: '13:30', endTime: '15:00', duration: 90 },
        Friday: { startTime: '15:00', endTime: '16:30', duration: 90 },
        Saturday: { startTime: '16:30', endTime: '18:00', duration: 90 }
      };
      
      const timing = approximateTimings[weekday] || { startTime: '12:00', endTime: '13:30', duration: 90 };
      
      return {
        weekday,
        date: `${day}/${month}/${year}`,
        startTime: timing.startTime,
        endTime: timing.endTime,
        durationMinutes: timing.duration,
        planetaryLord: this._getPlanetaryLord(weekday),
        planetaryOrder: this._getPlanetaryOrder(weekday),
        sunTimes: {
          sunrise: '06:00',
          sunset: '18:00'
        }
      };
    }
  }

  /**
   * Analyze the significance of Rahukalam
   * @private
   * @param {Object} rahukalamTiming - Rahukalam timing details
   * @returns {Object} Significance analysis
   */
  _analyzeRahukalamSignificance(rahukalamTiming) {
    return {
      name: 'Rahukalam',
      sanskrit: 'राहुकालम्',
      translation: 'Time of Rahu',
      mythology: 'Period ruled by Rahu, the shadow planet representing illusion, deception, and obstacles',
      duration: `${rahukalamTiming.durationMinutes} minutes`,
      planetaryInfluence: `Ruled by ${rahukalamTiming.planetaryLord}`,
      characteristics: [
        'Inauspicious period for important activities',
        'Heightened possibility of obstacles and delays',
        'Increased likelihood of misunderstandings',
        'Potential for unexpected challenges',
        'Time to exercise caution and patience'
      ],
      risks: [
        'Failed negotiations or agreements',
        'Technical problems or equipment failures',
        'Legal disputes or complications',
        'Health issues or accidents',
        'Financial setbacks or losses',
        'Miscommunication or conflicts',
        'Cancelled plans or delays'
      ],
      activitiesToAvoid: [
        'Signing contracts or agreements',
        'Starting new business ventures',
        'Making major financial decisions',
        'Traveling long distances',
        'Undergoing surgery or medical procedures',
        'Buying expensive items',
        'Getting married or performing wedding rituals',
        'Holding important meetings',
        'Taking exams or interviews',
        'Making investments'
      ],
      favorableActivities: [
        'Spiritual practices and meditation',
        'Chanting protective mantras',
        'Reciting religious texts',
        'Performing charitable acts',
        'Cleaning and organizing',
        'Maintenance work',
        'Planning rather than executing',
        'Studying and research'
      ],
      remedies: [
        'Chant Rahu Beej Mantra: "Om Raam Rahave Namaha"',
        'Wear silver or blue sapphire gemstone',
        'Offer milk to Peepal tree',
        'Donate wheat and jaggery to elderly people',
        'Light a ghee lamp facing south',
        'Avoid non-vegetarian food during this time',
        'Practice patience and mindfulness'
      ]
    };
  }

  /**
   * Generate recommendations for dealing with Rahukalam
   * @private
   * @param {Object} rahukalamTiming - Rahukalam timing details
   * @param {Object} significanceAnalysis - Significance analysis
   * @returns {Object} Recommendations
   */
  _generateRahukalamRecommendations(rahukalamTiming, significanceAnalysis) {
    return {
      avoidActivities: [
        'Schedule important meetings outside this time',
        'Postpone signing contracts or agreements',
        'Avoid making major financial decisions',
        'Do not start new ventures or projects',
        'Postpone travel plans if possible',
        'Avoid medical procedures or surgeries'
      ],
      protectiveMeasures: [
        'Wear a blue sapphire or hessonite garnet',
        'Chant protective mantras throughout the period',
        'Light a ghee lamp in the south direction',
        'Keep sacred ash or turmeric on your body',
        'Carry rudraksha beads for protection'
      ],
      spiritualPractices: [
        'Engage in meditation and prayer',
        'Chant Hanuman Chalisa or Rahu Gayatri Mantra',
        'Read spiritual texts or scriptures',
        'Perform charity or selfless service',
        'Practice pranayama or breathing exercises'
      ],
      mentalApproach: [
        'Maintain calm and composed demeanor',
        'Avoid arguments or confrontations',
        'Practice patience with delays and setbacks',
        'Use this time for introspection and self-reflection',
        'Focus on completing routine tasks rather than new initiatives'
      ],
      positiveActions: [
        'Organize and declutter your space',
        'Review and plan rather than execute',
        'Study and research for future projects',
        'Practice gratitude and positive affirmations',
        'Connect with spiritual or wise mentors'
      ],
      mantras: [
        'Om Raam Rahave Namaha (Rahu Beej Mantra)',
        'Om Namo Narayanaya',
        'Om Shri Hanumate Namaha',
        'Om Gam Ganapataye Namaha'
      ]
    };
  }

  /**
   * Generate comprehensive Rahukalam summary
   * @private
   * @param {Object} rahukalamTiming - Rahukalam timing details
   * @param {Object} significanceAnalysis - Significance analysis
   * @param {Object} recommendations - Recommendations
   * @returns {string} Summary text
   */
  _generateRahukalamSummary(rahukalamTiming, significanceAnalysis, recommendations) {
    let summary = `🌑 *Rahukalam Analysis*\n\n`;
    
    summary += `*Date:* ${rahukalamTiming.date}\n`;
    summary += `*Weekday:* ${rahukalamTiming.weekday}\n`;
    summary += `*Timing:* ${rahukalamTiming.startTime} - ${rahukalamTiming.endTime} (${rahukalamTiming.durationMinutes} minutes)\n`;
    summary += `*Planetary Lord:* ${rahukalamTiming.planetaryLord}\n\n`;
    
    summary += `*Significance:*\n`;
    summary += `Rahukalam is an inauspicious period ruled by Rahu, representing illusion and obstacles. `;
    summary += `It's advisable to avoid important activities during this time.\n\n`;
    
    summary += `*Activities to Avoid:*\n`;
    significanceAnalysis.activitiesToAvoid.slice(0, 4).forEach(activity => {
      summary += `• ${activity}\n`;
    });
    
    summary += `\n*Risks During This Period:*\n`;
    significanceAnalysis.risks.slice(0, 3).forEach(risk => {
      summary += `• ${risk}\n`;
    });
    
    summary += `\n*Protective Measures:*\n`;
    recommendations.protectiveMeasures.slice(0, 3).forEach(measure => {
      summary += `• ${measure}\n`;
    });
    
    return summary;
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
        message: 'Rahukalam analysis failed'
      };
    }

    return {
      success: true,
      data: result,
      summary: result.summary || 'Rahukalam analysis completed',
      metadata: {
        system: 'Rahukalam Analysis',
        calculationMethod: 'Vedic planetary period calculation with weekday-based timing',
        elements: ['Timing', 'Significance', 'Recommendations', 'Activities'],
        tradition: 'Vedic Hindu astrology with muhurta principles'
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
      throw new Error('Birth data is required for Rahukalam analysis');
    }

    if (!birthData.birthDate) {
      throw new Error('Birth date is required for Rahukalam analysis');
    }

    if (!birthData.birthPlace) {
      throw new Error('Birth place is required for Rahukalam analysis');
    }

    // Validate date format
    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!dateRegex.test(birthData.birthDate)) {
      throw new Error('Birth date must be in DD/MM/YYYY format');
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
      methods: ['execute', 'processCalculation', 'formatResult'],
      dependencies: ['MuhurtaCalculator']
    };
  }

  /**
   * Get service-specific help
   * @returns {string} Help information
   */
  getHelp() {
    return `
🌑 **Rahukalam Service**

**Purpose:** Provides analysis of Rahukalam, an inauspicious 90-minute period each day in Vedic astrology during which malefic planetary influences are strongest

**Required Inputs:**
• Birth date (DD/MM/YYYY)
• Birth place (city, state/country)

**Analysis Includes:**

**⏰ Timing Details:**
• Exact start and end times of Rahukalam
• Duration (typically 90 minutes)
• Planetary lord ruling the period
• Sunrise and sunset times for context

**🌑 Significance Analysis:**
• Mythological origins and meaning
• Planetary influences and characteristics
• Risks and potential challenges
• Activities to avoid during this time

**🎯 Recommendations:**
• Protective measures for minimizing negative effects
• Spiritual practices for spiritual protection
• Mental approaches for navigating this period
• Positive actions that can be performed
• Mantras and remedies for enhanced protection

**📋 Activity Guidance:**
• Activities to strictly avoid
• Activities that are neutral or acceptable
• Favorable activities during this period
• Remedies and protective measures
• Spiritual practices recommended

**Example Usage:**
"Rahukalam timing for 15/06/2025 in New Delhi"
"When is Rahukalam today in Mumbai?"
"Avoid activities during Rahukalam in Bangalore tomorrow"

**Output Format:**
Comprehensive Rahukalam report with timing details, significance analysis, recommendations, and activity guidance
    `.trim();
  }

  // Helper methods for calculations
  async _getCoordinatesForPlace(place) {
    try {
      // Use geocoding service to get coordinates
      // This is a simplified implementation - would connect to actual geocoding service
      const defaultCoords = {
        'New Delhi': [28.6139, 77.2090],
        'Mumbai': [19.0760, 72.8777],
        'Bangalore': [12.9716, 77.5946],
        'Chennai': [13.0827, 80.2707],
        'Kolkata': [22.5726, 88.3639]
      };
      
      const coords = defaultCoords[place] || [28.6139, 77.2090]; // Default to Delhi
      return coords;
    } catch (error) {
      logger.warn('Error getting coordinates, using default:', error.message);
      return [28.6139, 77.2090]; // Default to Delhi
    }
  }

  async _getTimezoneForPlace(latitude, longitude, timestamp) {
    try {
      // This is a simplified implementation - would connect to actual timezone service
      // India Standard Time (IST) is UTC+5:30
      return 5.5;
    } catch (error) {
      logger.warn('Error getting timezone, using default IST:', error.message);
      return 5.5; // IST (India Standard Time)
    }
  }

  _dateToJulianDay(year, month, day, hour) {
    // Convert Gregorian date to Julian Day
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    
    const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + 
               Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    
    // Add time fraction
    const timeFraction = (hour - 12) / 24;
    return jd + timeFraction;
  }

  _calculateSunTimes(jd, latitude, longitude) {
    try {
      // Simplified sunrise/sunset calculation
      // In reality, would use sweph.houses() or similar for accurate calculation
      const declination = 23.44 * Math.sin((jd - 2451545) * 0.017202); // Approximate
      const hourAngle = Math.acos(-Math.tan(latitude * Math.PI/180) * Math.tan(declination * Math.PI/180));
      
      const noon = 12 + (longitude / 15); // Local noon
      const sunrise = noon - (hourAngle * 12 / Math.PI);
      const sunset = noon + (hourAngle * 12 / Math.PI);
      
      return {
        sunrise: Math.max(6, Math.min(18, sunrise)), // Clamp between 6AM-6PM
        sunset: Math.max(18, Math.min(24, sunset))   // Clamp between 6PM-12AM
      };
    } catch (error) {
      logger.warn('Error calculating sun times, using defaults:', error.message);
      return {
        sunrise: 6.0,  // 6:00 AM
        sunset: 18.0   // 6:00 PM
      };
    }
  }

  _decimalToTime(decimalHours) {
    const hours = Math.floor(decimalHours);
    const minutes = Math.floor((decimalHours - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  _getPlanetaryLord(weekday) {
    const lords = {
      Sunday: 'Sun',
      Monday: 'Moon',
      Tuesday: 'Mars',
      Wednesday: 'Mercury',
      Thursday: 'Jupiter',
      Friday: 'Venus',
      Saturday: 'Saturn'
    };
    return lords[weekday] || 'Sun';
  }

  _getPlanetaryOrder(weekday) {
    const orders = {
      Sunday: 1,
      Monday: 2,
      Tuesday: 3,
      Wednesday: 4,
      Thursday: 5,
      Friday: 6,
      Saturday: 7
    };
    return orders[weekday] || 1;
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

module.exports = RahukalamService;