const ServiceTemplate = require('../serviceTemplate');
const logger = require('../../../utils/logger');

/**
 * Electional Astrology Service
 * Provides comprehensive electional astrology calculations for finding auspicious timing
 * Extends ServiceTemplate for standardized service architecture
 */
class ElectionalAstrologyService extends ServiceTemplate {
  constructor(services) {
    super('ElectionalAstrologyService', services);
    
    // Initialize Muhurta Calculator for electional calculations
    this.calculator = new MuhurtaCalculator();
    
    // Set services in calculator
    this.calculator.setServices(services);
    
    // Service-specific configuration
    this.serviceConfig = {
      supportedInputs: ['electionalData', 'birthData'],
      requiredInputs: ['electionalData'],
      outputFormats: ['detailed', 'summary', 'best-timing'],
      electionalCategories: {
        marriage: 'Wedding ceremonies and marriage commitments',
        business: 'Business ventures and contracts',
        spiritual: 'Religious ceremonies and spiritual practices',
        education: 'Educational pursuits and examinations',
        health: 'Medical procedures and health treatments',
        travel: 'Journeys and relocations',
        property: 'Real estate and construction',
        legal: 'Legal proceedings and court appearances',
        financial: 'Investments and financial decisions'
      },
      timingFactors: {
        planetary: 'Planetary positions and aspects',
        lunar: 'Tithi and Nakshatra considerations',
        weekday: 'Planetary weekday rulers',
        hora: 'Planetary hours analysis',
        yoga: 'Auspicious and inauspicious yogas',
        karana: 'Half-lunar period influences'
      }
    };
  }

  /**
   * Process Electional Astrology calculation using ServiceTemplate pattern
   * @param {Object} params - Calculation parameters
   * @returns {Promise<Object>} Formatted Electional Astrology analysis
   */
  async processCalculation(params) {
    const { electionalData, options = {} } = params;
    
    try {
      // Validate inputs
      this._validateInputs(electionalData);
      
      // Generate electional analysis using calculator
      const electionalResult = await this.calculator.generateMuhurta(electionalData);
      
      // Add service metadata
      electionalResult.serviceMetadata = {
        serviceName: this.serviceName,
        calculationType: 'Electional Astrology',
        timestamp: new Date().toISOString(),
        method: 'Vedic electional astrology with comprehensive timing analysis',
        activityType: electionalData.activity,
        calculationApproach: 'Traditional Muhurta principles with modern enhancements'
      };
      
      // Add enhanced analysis
      electionalResult.enhancedAnalysis = this._performEnhancedElectionalAnalysis(electionalResult, electionalData);
      
      return electionalResult;
      
    } catch (error) {
      logger.error(`❌ Error in ${this.serviceName} calculation:`, error);
      throw new Error(`Electional Astrology calculation failed: ${error.message}`);
    }
  }

  /**
   * Format Electional Astrology result for WhatsApp output
   * @param {Object} result - Calculation result
   * @returns {string} Formatted WhatsApp message
   */
  formatResult(result) {
    if (!result || !result.recommendations) {
      return '❌ *Electional Astrology Analysis Error*\n\nUnable to generate electional astrology analysis. Please check your activity details and try again.';
    }

    let formatted = `⏰ *Electional Astrology Analysis*\n\n`;
    
    // Add activity details
    formatted += `*Activity:* ${result.activity}\n`;
    formatted += `*Preferred Date:* ${result.preferredDate}\n`;
    formatted += `*Location:* ${result.location}\n\n`;
    
    // Add daily auspiciousness
    if (result.dailyAnalysis) {
      formatted += '*📅 Daily Auspiciousness:*\n';
      formatted += `• **Overall Rating:** ${result.dailyAnalysis.overallRating}\n`;
      formatted += `• **Tithi:** ${result.dailyAnalysis.tithi || 'N/A'}\n`;
      formatted += `• **Nakshatra:** ${result.dailyAnalysis.nakshatra || 'N/A'}\n`;
      formatted += `• **Yoga:** ${result.dailyAnalysis.yoga || 'N/A'}\n`;
      formatted += `• **Weekday:** ${result.weekdaySuitability?.weekday || 'N/A'} (${result.weekdaySuitability?.lord || 'N/A'})\n\n`;
    }
    
    // Add best timing recommendations
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
    
    // Add time slots analysis
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
        formatted += '• No highly suitable time slots found on this date\n';
      }
      formatted += '\n';
    }
    
    // Add planetary support
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
    
    // Add enhanced analysis if available
    if (result.enhancedAnalysis) {
      formatted += '*🎭 Enhanced Electional Analysis:*\n';
      
      if (result.enhancedAnalysis.overallAssessment) {
        formatted += `• **Assessment:** ${result.enhancedAnalysis.overallAssessment}\n`;
      }
      
      if (result.enhancedAnalysis.timingQuality) {
        formatted += `• **Timing Quality:** ${result.enhancedAnalysis.timingQuality}\n`;
      }
      
      if (result.enhancedAnalysis.actionableAdvice) {
        formatted += `• **Actionable Advice:** ${result.enhancedAnalysis.actionableAdvice}\n`;
      }
      
      if (result.enhancedAnalysis.electionalStrength) {
        formatted += `• **Electional Strength:** ${result.enhancedAnalysis.electionalStrength}\n`;
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
    formatted += '---\n*Electional Astrology - Finding Auspicious Timing for Important Activities*';
    
    return formatted;
  }

  /**
   * Validate input parameters for Electional Astrology calculation
   * @param {Object} electionalData - Electional data object
   * @private
   */
  _validateInputs(electionalData) {
    if (!electionalData) {
      throw new Error('Electional data is required for auspicious timing analysis');
    }
    
    if (!electionalData.activity || electionalData.activity.trim().length === 0) {
      throw new Error('Activity type is required for electional astrology analysis');
    }
    
    if (!electionalData.preferredDate) {
      throw new Error('Preferred date is required for electional astrology analysis');
    }
    
    if (!electionalData.location) {
      throw new Error('Location is required for accurate electional astrology calculation');
    }
  }

  /**
   * Perform enhanced analysis on Electional Astrology results
   * @param {Object} result - Electional calculation result
   * @param {Object} electionalData - Original request data
   * @returns {Object} Enhanced analysis
   * @private
   */
  _performEnhancedElectionalAnalysis(result, electionalData) {
    const analysis = {
      overallAssessment: '',
      timingQuality: '',
      actionableAdvice: '',
      electionalStrength: '',
      riskFactors: [],
      confidenceLevel: ''
    };
    
    // Determine overall assessment
    if (result.dailyAnalysis?.overallRating) {
      const rating = result.dailyAnalysis.overallRating;
      if (rating === 'Excellent') {
        analysis.overallAssessment = 'Highly auspicious timing with excellent planetary support';
        analysis.timingQuality = 'Premium electional timing - proceed with confidence';
        analysis.actionableAdvice = 'This is an ideal time for your activity - take full advantage of auspicious conditions';
        analysis.electionalStrength = 'Very Strong - Multiple favorable factors aligned';
      } else if (rating === 'Good') {
        analysis.overallAssessment = 'Favorable timing with good planetary alignments';
        analysis.timingQuality = 'Good electional timing - favorable conditions present';
        analysis.actionableAdvice = 'Proceed with your activity during recommended time slots for best results';
        analysis.electionalStrength = 'Strong - Several favorable factors present';
      } else if (rating === 'Fair') {
        analysis.overallAssessment = 'Moderate timing with mixed planetary influences';
        analysis.timingQuality = 'Acceptable electional timing - some precautions needed';
        analysis.actionableAdvice = 'Proceed during best time slots with appropriate preparations and remedies';
        analysis.electionalStrength = 'Moderate - Balanced favorable and challenging factors';
      } else {
        analysis.overallAssessment = 'Challenging timing with difficult planetary conditions';
        analysis.timingQuality = 'Difficult electional timing - consider alternatives';
        analysis.actionableAdvice = 'Postpone activity or choose alternative date if possible';
        analysis.electionalStrength = 'Weak - Challenging factors predominant';
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
      analysis.riskFactors.push('Overall day rated as poor for electional activities');
    }
    
    if (result.weekdaySuitability?.suitability === 'Poor') {
      analysis.riskFactors.push('Weekday not suitable for this activity type');
    }
    
    // Add activity-specific considerations
    if (electionalData.activity) {
      const activity = electionalData.activity.toLowerCase();
      if (activity.includes('marriage') || activity.includes('wedding')) {
        analysis.actionableAdvice += '\n• Consider Venus and Jupiter periods for enhanced marital harmony';
      } else if (activity.includes('business') || activity.includes('contract')) {
        analysis.actionableAdvice += '\n• Mercury and Jupiter periods support business success';
      } else if (activity.includes('health') || activity.includes('medical')) {
        analysis.actionableAdvice += '\n• Avoid malefic planetary hours for health procedures';
      }
    }
    
    return analysis;
  }

  /**
   * Calculate confidence score for Electional Astrology analysis
   * @param {Object} result - Calculation result
   * @returns {number} Confidence score (0-100)
   */
  calculateConfidence(result) {
    let confidence = 75; // Base confidence for Electional Astrology
    
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
 ⏰ **Electional Astrology Service - Auspicious Timing for Important Activities**

**Purpose:** Calculates the most favorable timing (Muhurta) for important activities using Vedic electional astrology principles

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
• Important meetings
• Career changes

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

**⚖️ Legal & Financial:**
• Legal proceedings
• Court appearances
• Investment decisions
• Financial transactions

**How Electional Astrology Works:**

**📅 Panchanga Factors:**
• **Tithi:** Lunar day influences on activities
• **Nakshatra:** Stellar constellation energies
• **Yoga:** Planetary combinations (auspicious/inauspicious)
• **Karana:** Half-lunar period influences
• **Vaara:** Weekday planetary rulers

**🌟 Planetary Analysis:**
• Planetary positions and strengths
• Favorable and challenging influences
• Planetary hours and timing
• Aspect relationships
• Retrograde considerations

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
• Plan important activities well in advance
• Consider multiple date options
• Follow recommended time slots precisely
• Prepare adequately for the activity
• Consider personal chart compatibility
• Perform appropriate remedies if needed

**Example Usage:**
"Electional astrology for marriage on 15/06/2024 in Delhi"
"Best timing for business opening next week"
"Auspicious timing for housewarming ceremony"
"Electional analysis for surgery in Mumbai this month"

**Important Notes:**
• Electional astrology provides optimal timing, not guarantees
• Personal effort and preparation remain crucial
• Consider local customs and traditions
• For critical activities, consult professional astrologers
• Weather and practical factors should also be considered

**Timing Precision:**
• Electional calculations are location-specific
• Time zones affect planetary positions
• Seasonal variations influence auspiciousness
• Planetary movements change daily patterns

**Alternative Options:**
• If preferred date is unfavorable, alternatives are suggested
• Multiple time slots may be available on good days
• Some activities have flexible timing requirements
• Consider personal schedule constraints
• Electional strength varies by activity type

**Electional Strength Factors:**
• Planetary dignity and placement
• Lunar phase and tithi
• Nakshatra compatibility
• Weekday rulership
• Planetary hour considerations
• Yoga and karana combinations
• Personal chart alignment
    `.trim();
  }
}

module.exports = ElectionalAstrologyService;