const ServiceTemplate = require('../serviceTemplate');
const logger = require('../../../utils/logger');

/**
 * Muhurta Service (Electional Astrology)
 * Provides auspicious timing calculations for important activities using Vedic electional astrology
 * Extends ServiceTemplate for standardized service architecture
 */
class MuhurtaService extends ServiceTemplate {
  constructor(services) {
    super('MuhurtaService', services);
    
    // Initialize Muhurta Calculator with required dependencies
    this.calculator = new MuhurtaCalculator();
    
    // Set services in calculator
    this.calculator.setServices(services);
    
    // Service-specific configuration
    this.serviceConfig = {
      supportedInputs: ['muhurtaData', 'birthData'],
      requiredInputs: ['muhurtaData'],
      outputFormats: ['detailed', 'summary', 'best-muhurta'],
      activityCategories: {
        marriage: 'Wedding, engagement, marriage commitment',
        business: 'Business opening, contract signing, investment',
        spiritual: 'Yagya, puja, mantra initiation, temple visit',
        education: 'School admission, exam, course starting',
        health: 'Surgery, medical treatment, therapy',
        travel: 'Long journey, house shifting, migration',
        housewarming: 'Home entry, property purchase, construction'
      },
      ratingThresholds: {
        excellent: 85,
        good: 70,
        fair: 55,
        poor: 40
      }
    };
  }

  /**
   * Process Muhurta calculation using ServiceTemplate pattern
   * @param {Object} params - Calculation parameters
   * @returns {Promise<Object>} Formatted Muhurta analysis
   */
  async lmuhurtaCalculation(params) {
    const { muhurtaData, options = {} } = params;
    
    try {
      // Validate inputs
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
      logger.error(`❌ Error in ${this.serviceName} calculation:`, error);
      throw new Error(`Muhurta calculation failed: ${error.message}`);
    }
  }

  /**
   * Format Muhurta result for WhatsApp output
   * @param {Object} result - Calculation result
   * @returns {string} Formatted WhatsApp message
   */
  formatResult(result) {
    if (!result || !result.recommendations) {
      return '❌ *Muhurta Analysis Error*\n\nUnable to generate Muhurta analysis. Please check your activity details and try again.';
    }

    let formatted = `⏰ *Muhurta (Auspicious Timing) Analysis*\n\n`;
    
    // Add activity details
    formatted += `*Activity:* ${result.activity}\n`;
    formatted += `*Preferred Date:* ${result.preferredDate}\n`;
    formatted += `*Location:* ${result.location}\n\n`;
    
    // Add daily analysis
    if (result.dailyAnalysis) {
      formatted += '*📅 Daily Auspiciousness:*\n';
      formatted += `• **Overall Rating:** ${result.dailyAnalysis.overallRating}\n`;
      formatted += `• **Tithi:** ${result.dailyAnalysis.tithi || 'N/A'}\n`;
      formatted += `• **Nakshatra:** ${result.dailyAnalysis.nakshatra || 'N/A'}\n`;
      formatted += `• **Yoga:** ${result.dailyAnalysis.yoga || 'N/A'}\n`;
      formatted += `• **Karana:** ${result.dailyAnalysis.karana || 'N/A'}\n\n`;
    }
    
    // Add weekday suitability
    if (result.weekdaySuitability) {
      formatted += '*📆 Weekday Analysis:*\n';
      formatted += `• **Day:** ${result.weekdaySuitability.weekday}\n`;
      formatted += `• **Lord:** ${result.weekdaySuitability.lord}\n`;
      formatted += `• **Suitability:** ${result.weekdaySuitability.suitability}\n`;
      formatted += `• **Reason:** ${result.weekdaySuitability.reason}\n\n`;
    }
    
    // Add best time slots
    if (result.timeSlotsAnalysis) {
      formatted += '*🕐 Best Time Slots:*\n';
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
    
    // Add planetary strengths
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
    
    // Add main recommendations
    if (result.recommendations) {
      formatted += '*💡 Main Recommendations:*\n';
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
    
    // Add enhanced analysis if available
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
      
      if (result.enhancedAnalysis.alternativeSuggestion) {
        formatted += `• **Alternative:** ${result.enhancedAnalysis.alternativeSuggestion}\n`;
      }
      
      formatted += '\n';
    }
    
    // Add alternative dates if available
    if (result.alternatives && result.alternatives.length > 0) {
      formatted += '*📅 Alternative Dates:*\n';
      result.alternatives.slice(0, 3).forEach(alt => {
        formatted += `• **${alt.date}:** ${alt.rating} - ${alt.reason}\n`;
      });
      formatted += '\n';
    }
    
    // Add summary if available
    if (result.summary) {
      formatted += `*📋 Summary:*\n${result.summary}\n\n`;
    }
    
    // Add service footer
    formatted += '---\n*Muhurta - Vedic Auspicious Timing for Important Activities*';
    
    return formatted;
  }

  /**
   * Validate input parameters for Muhurta calculation
   * @param {Object} muhurtaData - Muhurta data object
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
   * Perform enhanced analysis on Muhurta results
   * @param {Object} result - Muhurta calculation result
   * @param {Object} muhurtaData - Original request data
   * @returns {Object} Enhanced analysis
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
    
    // Determine overall assessment
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
    
    // Assess confidence level
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
    
    // Identify risk factors
    if (result.planetaryStrengths?.challenging && result.planetaryStrengths.challenging.length > 0) {
      analysis.riskFactors.push(`Challenging planetary influences: ${result.planetaryStrengths.challenging.join(', ')}`);
    }
    
    if (result.dailyAnalysis?.overallRating === 'Poor') {
      analysis.riskFactors.push('Overall day rated as poor for activities');
    }
    
    if (result.weekdaySuitability?.suitability === 'Poor') {
      analysis.riskFactors.push('Weekday not suitable for this activity');
    }
    
    // Suggest alternatives if needed
    if (result.alternatives && result.alternatives.length > 0) {
      const bestAlternative = result.alternatives[0];
      analysis.alternativeSuggestion = `Consider ${bestAlternative.date} (${bestAlternative.rating})`;
    }
    
    return analysis;
  }

  /**
   * Calculate confidence score for Muhurta analysis
   * @param {Object} result - Calculation result
   * @returns {number} Confidence score (0-100)
   */
  calculateConfidence(result) {
    let confidence = 75; // Base confidence for Muhurta
    
    // Adjust based on daily analysis rating
    if (result.dailyAnalysis?.overallRating) {
      const rating = result.dailyAnalysis.overallRating;
      if (rating === 'Excellent') {
        confidence += 15;
      } else if (rating === 'Good') {
        confidence += 10;
      } else if (rating === 'Fair') {
        confidence += 5;
      } else {
        confidence -= 10;
      }
    }
    
    // Increase confidence for good time slots
    if (result.timeSlotsAnalysis) {
      const goodSlots = Object.values(result.timeSlotsAnalysis)
        .filter(slot => slot.suitability.rating === 'Excellent' || slot.suitability.rating === 'Good')
        .length;
      confidence += goodSlots * 3;
    }
    
    // Increase confidence for favorable weekday
    if (result.weekdaySuitability?.suitability === 'Excellent') {
      confidence += 10;
    } else if (result.weekdaySuitability?.suitability === 'Good') {
      confidence += 5;
    }
    
    // Increase confidence for complete analysis
    if (result.planetaryStrengths && result.recommendations && result.dailyAnalysis) {
      confidence += 5;
    }
    
    return Math.max(0, Math.min(100, Math.round(confidence)));
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
      result.recommendations &&
      result.activity &&
      result.dailyAnalysis
    );
  }

  /**
   * Get service-specific help
   * @returns {string} Help information
   */
  getHelp() {
    return `
 ⏰ **Muhurta Service - Auspicious Timing for Important Activities**

**Purpose:** Calculates the most favorable timing (Muhurta) for important activities using Vedic electional astrology

**Required Inputs:**
• Activity type (what you want to do)
• Preferred date (DD/MM/YYYY)
• Location (where the activity will take place)
• Optional: Time window (preferred hours)

**Supported Activity Categories:**

**💒 Marriage & Relationships:**
• Wedding ceremonies
• Engagement functions
• Marriage commitments
• Partnership agreements

**💼 Business & Career:**
• Business opening/launch
• Contract signing
• Investment decisions
• New job joining
• Important meetings

**🙏 Spiritual & Religious:**
• Yagya and homa ceremonies
• Puja and rituals
• Mantra initiation
• Temple visits
• Spiritual practices

**🎓 Education & Learning:**
• School/college admission
• Examinations
• Course enrollment
• Educational ceremonies

**🏥 Health & Medical:**
• Surgery and operations
• Medical treatments
• Therapy sessions
• Health procedures

**✈️ Travel & Relocation:**
• Long journeys
• House shifting
• Migration
• Important travel

**🏠 Home & Property:**
• Housewarming ceremonies
• Property purchase
• Construction start
• Home entry

**How Muhurta Calculation Works:**

**📅 Panchanga Factors:**
• **Tithi:** Lunar day influences
• **Nakshatra:** Stellar constellations
• **Yoga:** Planetary combinations
• **Karana:** Half-lunar periods
• **Vaara:** Weekday considerations

**🌟 Planetary Analysis:**
• Planetary positions and strengths
• Favorable and challenging influences
• Planetary hours and timing
• Aspect relationships

**🕐 Time Slot Analysis:**
• Hour-by-hour assessment
• Planetary hour calculations
• Auspicious time identification
• Avoidance of unfavorable periods

**Rating System:**
• **Excellent (85+):** Highly auspicious timing
• **Good (70-84):** Favorable conditions
• **Fair (55-69):** Acceptable with precautions
• **Poor (Below 55):** Avoid if possible

**Output Includes:**
• Daily auspiciousness rating
• Best time slots during the day
• Weekday suitability analysis
• Planetary support assessment
• Specific recommendations
• Alternative date suggestions
• Precautions and considerations

**Best Practices:**
• Plan important activities in advance
• Consider multiple date options
• Follow recommended time slots precisely
• Prepare adequately for the activity
• Consider personal birth chart compatibility

**Example Usage:**
"Muhurta for marriage on 15/06/2024 in Delhi"
"Best time for business opening next week"
"Auspicious timing for housewarming ceremony"
"Muhurta for surgery in Mumbai this month"

**Important Notes:**
• Muhurta provides optimal timing, not guarantees
• Personal effort and preparation remain crucial
• Consider local customs and traditions
• For critical activities, consult professional astrologers
• Weather and practical factors should also be considered

**Timing Precision:**
• Muhurta calculations are location-specific
• Time zones affect planetary positions
• Seasonal variations influence auspiciousness
• Planetary movements change daily patterns

**Alternative Options:**
• If preferred date is unfavorable, alternatives are suggested
• Multiple time slots may be available on good days
• Some activities have flexible timing requirements
• Consider personal schedule constraints
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

module.exports = MuhurtaService;