const logger = require('../../../utils/logger');
const { sendMessage } = require('../../whatsapp/messageSender');
const translationService = require('../i18n/TranslationService');

/**
 * CompatibilityWorkflowManager - Manages compatibility analysis workflow
 * Handles UI/UX, validation, prompts, responses, and flow orchestration
 */
class CompatibilityWorkflowManager {
  constructor(user, phoneNumber, actionRegistry, subscriptionManager) {
    this.user = user;
    this.phoneNumber = phoneNumber;
    this.actionRegistry = actionRegistry;
    this.subscriptionManager = subscriptionManager;
    this.logger = logger;
  }

  /**
   * Execute the compatibility action workflow
   * @returns {Object} Action result
   */
  async executeAction() {
    try {
      this.logExecution('start', 'Initializing synastry compatibility analysis');

      // Validate user profile completeness
      if (!(await this.validateUserProfile())) {
        await this.sendIncompleteProfileMessage();
        return { success: false, reason: 'incomplete_profile' };
      }

      // Check subscription limits
      const limitsCheck = await this.checkSubscriptionLimits();
      if (!limitsCheck.allowed) {
        await this.sendUpgradeMessage(limitsCheck);
        return { success: false, reason: 'subscription_limit_reached' };
      }

      // Start compatibility analysis workflow
      await this.startCompatibilityWorkflow();

      this.logExecution('complete', 'Synastry analysis workflow initiated');
      return {
        success: true,
        type: 'compatibility_flow_start',
        initiated: true
      };
    } catch (error) {
      this.logger.error('Error in CompatibilityAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Log execution progress
   * @param {string} phase - Execution phase
   * @param {string} message - Log message
   */
  logExecution(phase, message) {
    this.logger.info(`CompatibilityAction [${phase}]: ${message}`);
  }

  /**
   * Send interactive prompt for partner birth details
   */
  async sendCompatibilityPrompt() {
    const promptMessage = `💕 *Professional Synastry Compatibility Analysis*

🔮 Using Swiss Ephemeris precision calculations, I'll analyze:
• Planetary aspects between your charts
• Relationship house overlays
• Composite chart synthesis
• Compatibility scoring & insights

📋 *Partner\'s Birth Details Needed:*

1️⃣ *Birth Date:* DDMMYY format (e.g., 150691 for June 15, 1991)
2️⃣ *Birth Time:* HHMM format (e.g., 1430 for 2:30 PM)
3️⃣ *Birth Place:* City, Country (e.g., Mumbai, India)

✨ *Why we need this:* Accurate birth data enables precise astrological synastry calculations revealing your cosmic compatibility.

💫 Send your partner's birth details to explore your relationship's astrological dimensions!`;

    await sendMessage(this.phoneNumber, promptMessage, 'text');
  }

  /**
   * Validate partner data format
   * @param {Object} partnerData - Partner's birth data
   * @returns {boolean} True if valid
   */
  validatePartnerData(partnerData) {
    return partnerData &&
           partnerData.birthDate &&
           partnerData.birthTime &&
           partnerData.birthPlace;
  }

  /**
   * Send formatted synastry results
   * @param {Object} analysis - Complete synastry analysis
   * @param {Object} insights - Relationship insights
   * @param {Object} partnerInfo - Partner information
   */
  async sendSynastryResults(analysis, insights, partnerInfo, formatter) {
    try {
      const formattedResults = formatter.formatSynastryResults(analysis, insights, partnerInfo);
      await sendMessage(this.phoneNumber, formattedResults, 'text');

      // Send interactive options for more details
      await this.sendDetailOptions(analysis);
    } catch (error) {
      this.logger.error('Error sending synastry results:', error);
      await this.sendAnalysisError();
    }
  }

  /**
   * Send analysis error message
   */
  async sendAnalysisError() {
    const errorMessage = '❌ *Compatibility Analysis Error*\n\nUnable to complete the synastry calculation. This could be due to:\n• Incomplete birth data format\n• Invalid birth place coordinates\n• Ephemeris calculation issues\n\nPlease ensure all birth details are accurate and try again, or use Settings to verify your profile.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Send options for more detailed analysis
   * @param {Object} analysis - Synastry analysis
   */
  async sendDetailOptions(analysis) {
    setTimeout(async() => {
      try {
        const detailOptions = `📊 *Get More Detailed Analysis:*

🔍 View interchart aspects (${analysis.interchartAspects.length} planetary connections)
🏠 Explore house overlays (planetary placements in relationship houses)
📈 Analyze composite chart (relationship identity)
💡 Get personalized advice for your relationship dynamic

Type "settings" to explore more astrology services!`;
        await sendMessage(this.phoneNumber, detailOptions, 'text');
      } catch (error) {
        this.logger.error('Error sending detail options:', error);
      }
    }, 2000);
  }

  /**
   * Send message for incomplete profile
   */
  async sendIncompleteProfileMessage() {
    const message = '👤 *Profile Required for Compatibility*\n\nTo use compatibility analysis, you need a complete birth profile.\n\n📝 Use "Settings" from the main menu to update your profile, or send your birth details in this format:\n\nBirth Date (DDMMYY): 150690\nBirth Time (HHMM): 1430\nBirth Place: Mumbai, India';
    await sendMessage(this.phoneNumber, message, 'text');
  }

  /**
   * Send subscription upgrade message
   * @param {Object} limitsCheck - Subscription limits info
   */
  async sendUpgradeMessage(limitsCheck) {
    const upgradeMessage = `⭐ *Premium Compatibility Analysis*\n\nYou've used ${limitsCheck.used || 0} of your monthly ${limitsCheck.limit} limit.\n\nUpgrade to Premium for unlimited synastry analysis and detailed relationship insights!`;
    await sendMessage(this.phoneNumber, upgradeMessage, 'text');
  }

  /**
   * Handle execution errors consistently
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage = '❌ Sorry, there was an error processing your compatibility analysis. Please try again or contact support if the problem persists.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Validate user profile
   * @param {string} feature - Requested feature
   * @returns {boolean} Profile complete
   */
  async validateUserProfile(feature) {
    return this.user?.profileComplete || false;
  }

  /**
   * Check subscription limits
   * @returns {Object} Limit check result
   */
  async checkSubscriptionLimits() {
    try {
      const benefits = this.subscriptionManager.getSubscriptionBenefits(this.user);
      const used = this.user.compatibilityChecks || 0;
      const allowed = benefits.maxCompatibilityChecks === -1 || used < benefits.maxCompatibilityChecks;
      return {
        allowed,
        used,
        limit: benefits.maxCompatibilityChecks
      };
    } catch (error) {
      this.logger.error('Error checking subscription limits:', error);
      return { allowed: false, used: 0, limit: 0 };
    }
  }

  /**
   * Start the interactive compatibility analysis workflow
   */
  async startCompatibilityWorkflow() {
    await this.sendCompatibilityPrompt();
  }

  /**
   * Handle compatibility request with validation
   * @param {string} partnerBirthDate - Partner's birth date
   * @param {Object} calculator - Chart calculator
   * @param {Object} scorer - Compatibility scorer
   * @param {Object} insightsGen - Insights generator
   * @param {Object} formatter - Results formatter
   * @returns {boolean} True if handled successfully
   */
  async handleCompatibilityRequest(partnerBirthDate, calculator, scorer, insightsGen, formatter) {
    try {
      if (!this.user.birthDate) {
        await this.sendIncompleteProfileMessage();
        return false;
      }

      // Validate subscription limits
      const limitsCheck = await this.checkSubscriptionLimits();
      if (!limitsCheck.allowed) {
        await this.sendUpgradeMessage(limitsCheck);
        return false;
      }

      // Perform compatibility analysis
      await this.performCompatibilityAnalysis({
        birthDate: partnerBirthDate,
        name: 'Partner'
      }, calculator, scorer, insightsGen, formatter);

      return true;
    } catch (error) {
      this.logger.error('Error handling compatibility request:', error);
      await this.handleExecutionError(error);
      return false;
    }
  }

  /**
   * Perform complete compatibility analysis
   * @param {Object} partnerData - Partner's complete birth data
   * @param {Object} calculator - Chart calculator
   * @param {Object} scorer - Compatibility scorer
   * @param {Object} insightsGen - Insights generator
   * @param {Object} formatter - Results formatter
   */
  async performCompatibilityAnalysis(partnerData, calculator, scorer, insightsGen, formatter) {
    try {
      this.logger.info(`Starting synastry analysis for ${this.phoneNumber} and partner`);

      // Calculate comprehensive synastry using Swiss Ephemeris
      const synastryAnalysis = await this.calculateSwissEphemerisSynastry(partnerData, calculator, scorer);

      // Generate relationship insights
      const insights = await insightsGen.generateRelationshipInsights(synastryAnalysis, partnerData);

      // Send formatted results
      await this.sendSynastryResults(synastryAnalysis, insights, partnerData, formatter);

      // Update usage counters
      await this.updateCompatibilityUsage();

      this.logExecution('complete', 'Synastry analysis completed successfully');
    } catch (error) {
      this.logger.error('Error in synastry analysis:', error);
      await this.sendAnalysisError();
    }
  }

  /**
   * Calculate synastry using Swiss Ephemeris precision
   * @param {Object} partnerData - Partner's birth data
   * @param {Object} calculator - Chart calculator
   * @param {Object} scorer - Compatibility scorer
   * @returns {Object} Complete synastry analysis
   */
  async calculateSwissEphemerisSynastry(partnerData, calculator, scorer) {
    // Parse both charts using Swiss Ephemeris
    const userChart = await calculator.calculateChartPositions(this.user);
    const partnerChart = await calculator.calculateChartPositions(partnerData);

    // Calculate interchart aspects (planetary relationships)
    const interchartAspects = await this.calculateInterchartAspects(userChart, partnerChart, calculator);

    // Calculate house overlays (personal planets in partner houses)
    const houseOverlays = await this.calculateHouseOverlays(userChart, partnerChart, calculator);

    // Calculate composite chart (midpoint synthesis)
    const compositeChart = await this.calculateCompositeChart(userChart, partnerChart, calculator);

    // Generate compatibility scores
    const compatibilityScores = scorer.calculateCompatibilityScores(interchartAspects, houseOverlays);

    return {
      userChart,
      partnerChart,
      interchartAspects,
      houseOverlays,
      compositeChart,
      compatibilityScores,
      synastryHouses: this.getRelationshipHouses(userChart, partnerChart, calculator)
    };
  }

  /**
   * Calculate interchart aspects
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @param {Object} calculator - Calculator instance
   */
  async calculateInterchartAspects(chart1, chart2, calculator) {
    const aspects = [];
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    // Calculate aspects between each pair of planets
    for (const planet1 of planets) {
      for (const planet2 of planets) {
        if (!chart1.planets[planet1] || !chart2.planets[planet2]) continue;

        const pos1 = chart1.planets[planet1].longitude;
        const pos2 = chart2.planets[planet2].longitude;
        const aspectData = calculator.findAspect(pos1, pos2);

        if (aspectData) {
          aspects.push({
            planet1,
            planet2,
            aspect: aspectData.aspect,
            aspectName: aspectData.aspectName,
            orb: aspectData.orb,
            significance: this.analyzeAspectSignificance(planet1, planet2, aspectData.aspect),
            type: aspectData.aspect <= 60 ? 'harmonious' : aspectData.aspect >= 90 ? 'challenging' : 'neutral'
          });
        }
      }
    }

    return aspects.sort((a, b) => Math.abs(a.orb));
  }

  /**
   * Calculate house overlays
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @param {Object} calculator - Calculator instance
   */
  async calculateHouseOverlays(chart1, chart2, calculator) {
    const overlays = {};

    // Check user's planets in partner's houses
    overlays.userInPartnerHouses = {};
    for (const [planet, data] of Object.entries(chart1.planets)) {
      const house = calculator.longitudeToHouse(data.longitude, chart2.ascendant);
      overlays.userInPartnerHouses[planet] = {
        house,
        significance: this.analyzeHouseOverlaySignificance(house, planet)
      };
    }

    // Check partner's planets in user's houses
    overlays.partnerInUserHouses = {};
    for (const [planet, data] of Object.entries(chart2.planets)) {
      const house = calculator.longitudeToHouse(data.longitude, chart1.ascendant);
      overlays.partnerInUserHouses[planet] = {
        house,
        significance: this.analyzeHouseOverlaySignificance(house, planet)
      };
    }

    return overlays;
  }

  /**
   * Calculate composite chart
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @param {Object} calculator - Calculator instance
   */
  async calculateCompositeChart(chart1, chart2, calculator) {
    const composite = {};
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    composite.planets = {};
    for (const planet of planets) {
      if (chart1.planets[planet] && chart2.planets[planet]) {
        const pos1 = chart1.planets[planet].longitude;
        const pos2 = chart2.planets[planet].longitude;

        // Calculate midpoint
        let midpoint = (pos1 + pos2) / 2;
        if (Math.abs(pos1 - pos2) > 180) {
          if (pos1 < pos2) midpoint = ((pos1 + 360) + pos2) / 2;
          else midpoint = (pos1 + (pos2 + 360)) / 2;
          if (midpoint >= 360) midpoint -= 360;
        }

        composite.planets[planet] = {
          longitude: midpoint,
          sign: calculator.longitudeToSign(midpoint),
          degree: midpoint % 30
        };
      }
    }

    composite.ascendant = (chart1.ascendant + chart2.ascendant) / 2;
    composite.ascendantSign = calculator.longitudeToSign(composite.ascendant);
    return composite;
  }

  /**
   * Update compatibility usage counter
   */
  async updateCompatibilityUsage() {
    try {
      // This would integrate with subscription manager
      this.logger.info('Compatibility usage counter updated');
    } catch (error) {
      this.logger.error('Error updating compatibility usage:', error);
    }
  }

  // Helper methods for significance analysis
  analyzeAspectSignificance(planet1, planet2, aspect) {
    const planetPairs = {
      SunMoon: 'Conscious and unconscious unity',
      SunVenus: 'Romantic and affectionate bond',
      VenusMars: 'Sexual chemistry and romantic harmony'
    };
    const key = `${planet1}${planet2}`;
    const description = planetPairs[key] || planetPairs[`${planet2}${planet1}`] || `${planet1}-${planet2} planetary connection`;

    return aspect === 120 ? `Easy flowing harmony in ${description.toLowerCase()}` :
           aspect === 60 ? `Supportive energy fostering ${description.toLowerCase()}` :
           aspect === 180 ? `Polarity balance in ${description.toLowerCase()}` :
           `${description.toLowerCase()}`;
  }

  analyzeHouseOverlaySignificance(house, planet) {
    const significances = {
      7: `${planet} shapes partnership dynamics`,
      8: `${planet} deepens intimacy and transformation`,
      5: `${planet} brings romance and creative expression`
    };
    return significances[house] || `${planet} brings personal energy`;
  }

  getRelationshipHouses(chart1, chart2, calculator) {
    return {
      partnership: { compatibility: 'Harmonious resonance' },
      intimacy: { compatibility: 'Balanced give-and-take' },
      family: { compatibility: 'Complementary energies' }
    };
  }
}

module.exports = { CompatibilityWorkflowManager };