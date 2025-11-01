const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');
const PanchangCalculator = require('./calculators/PanchangCalculator');

/**
 * Enhanced Panchang Service
 * Provides detailed Vedic almanac calculations with comprehensive daily astrological data
 * Extends ServiceTemplate for standardized service architecture
 */
class EnhancedPanchangService extends ServiceTemplate {
  constructor(calculatorName = 'PanchangCalculator') {
    super(calculatorName);
    this.calculatorPath = './calculators/PanchangCalculator';

    // Service-specific configuration
    this.serviceConfig = {
      supportedInputs: ['date', 'time', 'place'],
      requiredInputs: ['date'],
      outputFormats: ['detailed', 'summary', 'daily'],
      defaultTime: '12:00',
      defaultPlace: 'Delhi, India',
      panchangElements: [
        'Tithi (Lunar Day)',
        'Nakshatra (Constellation)',
        'Yoga (Luni-Solar Day)',
        'Karana (Half Lunar Day)',
        'Vara (Weekday)',
        'Sunrise/Sunset',
        'Moon Sign',
        'Auspicious Periods'
      ]
    };
  }

  /**
   * Process Enhanced Panchang calculation using ServiceTemplate pattern
   * @param {Object} params - Calculation parameters
   * @returns {Promise<Object>} Formatted Panchang analysis
   */
  async processCalculation(params) {
    const { date, time, place, options = {} } = params;

    try {
      // Validate inputs
      this._validateInputs(date, time, place);

      // Prepare date data
      const dateData = {
        date,
        time: time || this.serviceConfig.defaultTime,
        place: place || this.serviceConfig.defaultPlace
      };

      // Calculate Panchang using calculator
      const panchangResult = await this.calculator.generatePanchang(dateData);

      // Add service metadata
      panchangResult.serviceMetadata = {
        serviceName: this.serviceName,
        calculationType: 'EnhancedPanchang',
        timestamp: new Date().toISOString(),
        method: 'Traditional Vedic Almanac Calculations',
        elementsCalculated: this.serviceConfig.panchangElements
      };

      // Add enhanced analysis
      panchangResult.enhancedAnalysis =
        this._performEnhancedPanchangAnalysis(panchangResult);

      return panchangResult;
    } catch (error) {
      logger.error(`❌ Error in ${this.serviceName} calculation:`, error);
      throw new Error(`Enhanced Panchang calculation failed: ${error.message}`);
    }
  }

  /**
   * Format Enhanced Panchang result for WhatsApp output
   * @param {Object} result - Calculation result
   * @returns {string} Formatted WhatsApp message
   */
  formatResult(result) {
    if (!result || !result.date) {
      return '❌ *Enhanced Panchang Analysis Error*\n\nUnable to generate Panchang. Please check the date and try again.';
    }

    let formatted = '📅 *Enhanced Panchang*\n\n';

    // Add date and location
    formatted += `*Date:* ${result.date}\n`;
    if (result.place) {
      formatted += `*Location:* ${result.place}\n`;
    }
    formatted += '\n';

    // Add core Panchang elements
    formatted += '*🌙 Panchang Elements:*\n';

    if (result.tithi) {
      formatted += `• **Tithi:** ${result.tithi.name} (${result.tithi.number})\n`;
      if (result.tithi.ends) {
        formatted += `  *Ends:* ${result.tithi.ends}\n`;
      }
    }

    if (result.nakshatra) {
      formatted += `• **Nakshatra:** ${result.nakshatra.name}\n`;
      if (result.nakshatra.lord) {
        formatted += `  *Lord:* ${result.nakshatra.lord}\n`;
      }
      if (result.nakshatra.pada) {
        formatted += `  *Pada:* ${result.nakshatra.pada}\n`;
      }
      if (result.nakshatra.translation) {
        formatted += `  *Meaning:* ${result.nakshatra.translation}\n`;
      }
    }

    if (result.yoga) {
      formatted += `• **Yoga:** ${result.yoga.name}\n`;
      if (result.yoga.lord) {
        formatted += `  *Lord:* ${result.yoga.lord}\n`;
      }
      if (result.yoga.significance) {
        formatted += `  *Significance:* ${result.yoga.significance}\n`;
      }
    }

    if (result.karana) {
      formatted += `• **Karana:** ${result.karana.name} (${result.karana.type})\n`;
      if (result.karana.significance) {
        formatted += `  *Good for:* ${result.karana.significance}\n`;
      }
    }

    // Add planetary positions
    formatted += '\n*🌞 Planetary Positions:*\n';

    if (result.sunSign) {
      formatted += `• **Sun Sign:** ${result.sunSign}\n`;
    }

    if (result.moonSign) {
      formatted += `• **Moon Sign:** ${result.moonSign}\n`;
    }

    // Add sunrise/sunset
    if (result.sunrise && result.sunset) {
      formatted += '\n*🌅 Sunrise & Sunset:*\n';
      formatted += `• **Sunrise:** ${result.sunrise}\n`;
      formatted += `• **Sunset:** ${result.sunset}\n`;
    }

    // Add auspicious periods
    if (result.auspiciousPeriod) {
      formatted += '\n*⏰ Auspicious Periods:*\n';

      if (result.auspiciousPeriod.abhijitMuhurta) {
        formatted += `• **Abhijit Muhurta:** ${result.auspiciousPeriod.abhijitMuhurta}\n`;
      }

      if (result.auspiciousPeriod.auspiciousHours) {
        formatted += `• **Auspicious Hours:** ${result.auspiciousPeriod.auspiciousHours}\n`;
      }
    }

    // Add festivals if any
    if (result.festivals && result.festivals.length > 0) {
      formatted += '\n*🎉 Festivals & Events:*\n';
      result.festivals.forEach(festival => {
        formatted += `• ${festival}\n`;
      });
    }

    // Add enhanced analysis if available
    if (result.enhancedAnalysis) {
      formatted += '\n*💫 Daily Insights:*\n';
      if (result.enhancedAnalysis.overallQuality) {
        formatted += `• **Day Quality:** ${result.enhancedAnalysis.overallQuality}\n`;
      }
      if (result.enhancedAnalysis.recommendedActivities) {
        formatted += `• **Recommended:** ${result.enhancedAnalysis.recommendedActivities}\n`;
      }
      if (result.enhancedAnalysis.avoidActivities) {
        formatted += `• **Avoid:** ${result.enhancedAnalysis.avoidActivities}\n`;
      }
    }

    // Add service footer
    formatted += '\n\n---\n*Enhanced Panchang - Traditional Vedic Almanac*';

    return formatted;
  }

  /**
   * Validate input parameters for Enhanced Panchang calculation
   * @param {string} date - Date string
   * @param {string} time - Time string
   * @param {string} place - Place string
   * @private
   */
  _validateInputs(date, time, place) {
    if (!date) {
      throw new Error('Date is required for Panchang calculation');
    }

    // Validate date format (DD/MM/YYYY)
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!datePattern.test(date)) {
      throw new Error('Date must be in DD/MM/YYYY format');
    }

    // Validate time format if provided (HH:MM)
    if (time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      throw new Error('Time must be in HH:MM format');
    }
  }

  /**
   * Perform enhanced analysis on Panchang results
   * @param {Object} result - Panchang calculation result
   * @returns {Object} Enhanced analysis
   * @private
   */
  _performEnhancedPanchangAnalysis(result) {
    const analysis = {
      overallQuality: '',
      recommendedActivities: '',
      avoidActivities: '',
      spiritualSignificance: '',
      businessFavorability: ''
    };

    // Determine overall day quality based on Tithi and Yoga
    if (result.tithi && result.yoga) {
      const auspiciousTithis = [1, 5, 10, 11, 15]; // Panchami, Ekadashi, Purnima
      const favorableYogas = ['Siddhi', 'Shubha', 'Saumya', 'Amrita'];

      const isAuspiciousTithi = auspiciousTithis.includes(result.tithi.number);
      const isFavorableYoga = favorableYogas.includes(result.yoga.name);

      if (isAuspiciousTithi && isFavorableYoga) {
        analysis.overallQuality = 'Highly auspicious day for all activities';
        analysis.recommendedActivities =
          'Spiritual practices, new ventures, important decisions';
      } else if (isAuspiciousTithi || isFavorableYoga) {
        analysis.overallQuality = 'Generally favorable day';
        analysis.recommendedActivities =
          'Most activities, especially spiritual and charitable';
      } else {
        analysis.overallQuality = 'Ordinary day - proceed with caution';
        analysis.recommendedActivities =
          'Routine activities, planning, preparation';
        analysis.avoidActivities = 'Major decisions, new ventures, investments';
      }
    }

    // Analyze Nakshatra significance
    if (result.nakshatra) {
      const spiritualNakshatras = ['Pushya', 'Ashwini', 'Revati', 'Anuradha'];
      const businessNakshatras = [
        'Rohini',
        'Uttara Phalguni',
        'Uttara Ashadha',
        'Uttara Bhadrapada'
      ];

      if (spiritualNakshatras.includes(result.nakshatra.name)) {
        analysis.spiritualSignificance =
          'Excellent for spiritual practices and meditation';
      }

      if (businessNakshatras.includes(result.nakshatra.name)) {
        analysis.businessFavorability =
          'Favorable for business and financial activities';
      }
    }

    // Add recommendations based on day of week
    const dayOfWeek = new Date(
      result.date.split('/').reverse().join('-')
    ).getDay();
    const dayRecommendations = {
      0: {
        // Sunday
        recommended: 'Spiritual activities, leadership tasks, government work',
        avoid: 'Arguments, conflicts, aggressive activities'
      },
      1: {
        // Monday
        recommended:
          'Agriculture, gardening, emotional work, family activities',
        avoid: 'Business deals, travel, new ventures'
      },
      2: {
        // Tuesday
        recommended: 'Competitive activities, sports, property matters',
        avoid: 'Marriage negotiations, peaceful activities'
      },
      3: {
        // Wednesday
        recommended: 'Communication, education, business, short travel',
        avoid: 'Long journeys, major investments'
      },
      4: {
        // Thursday
        recommended:
          'Spiritual learning, teaching, charity, financial activities',
        avoid: 'Arguments with elders, unethical activities'
      },
      5: {
        // Friday
        recommended: 'Arts, relationships, luxury purchases, social events',
        avoid: 'Fast, arguments, harsh activities'
      },
      6: {
        // Saturday
        recommended: 'Hard work, discipline, service, oil-related activities',
        avoid: 'New ventures, celebrations, luxury items'
      }
    };

    const dayRec = dayRecommendations[dayOfWeek];
    if (dayRec) {
      if (!analysis.recommendedActivities) {
        analysis.recommendedActivities = dayRec.recommended;
      }
      if (!analysis.avoidActivities) {
        analysis.avoidActivities = dayRec.avoid;
      }
    }

    return analysis;
  }

  /**
   * Calculate confidence score for Enhanced Panchang analysis
   * @param {Object} result - Calculation result
   * @returns {number} Confidence score (0-100)
   */
  calculateConfidence(result) {
    let confidence = 85; // Base confidence for Panchang

    // Increase confidence based on data completeness
    if (result.tithi && result.nakshatra && result.yoga && result.karana) {
      confidence += 10;
    }

    if (result.sunrise && result.sunset) {
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
      result.date &&
      (result.tithi || result.nakshatra)
    );
  }

  /**
   * Get service-specific help
   * @returns {string} Help information
   */
  getHelp() {
    return `
📅 **Enhanced Panchang Service - Traditional Vedic Almanac**

**Purpose:** Provides comprehensive daily astrological almanac with all traditional Panchang elements

**Required Inputs:**
• Date (DD/MM/YYYY) - Required
• Time (HH:MM) - Optional (defaults to 12:00)
• Place (City, Country) - Optional (defaults to Delhi, India)

**Panchang Elements Calculated:**

**🌙 Core Elements:**
• **Tithi** - Lunar day (1-15, Krishna/Shukla paksha)
• **Nakshatra** - Lunar constellation (27 total)
• **Yoga** - Luni-solar combination (27 total)
• **Karana** - Half lunar day (11 total)
• **Vara** - Weekday ruler

**🌞 Planetary Data:**
• Sun sign position
• Moon sign position
• Sunrise and sunset times
• Moon phase information

**⏰ Timing Information:**
• Abhijit Muhurta (most auspicious time)
• Auspicious hours for activities
• Inauspicious periods to avoid

**🎉 Additional Features:**
• Festival and event information
• Daily quality assessment
• Recommended activities
• Activities to avoid
• Spiritual significance
• Business favorability

**Analysis Includes:**
• Overall day quality rating
• Activity recommendations
• Spiritual insights
• Business and financial guidance
• Personalized timing advice

**Example Usage:**
"Panchang for today"
"Panchang for 25/12/2024"
"Daily almanac for 15/06/2024 at Mumbai"
"Panchang analysis for tomorrow at 09:30"

**Output Format:**
Comprehensive daily almanac with all traditional elements and practical guidance
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

module.exports = EnhancedPanchangService;