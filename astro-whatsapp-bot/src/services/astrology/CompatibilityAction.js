const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');
const translationService = require('../../../../services/i18n/TranslationService');
const { incrementCompatibilityChecks } = require('../../../../models/userModel');

// Swiss Ephemeris for precise synastry calculations
const sweph = require('sweph');

/**
 * CompatibilityAction - Professional Synastry Analysis
 * Analyzes relationship compatibility through interchart planetary aspects,
 * house overlays, and composite chart synthesis using Swiss Ephemeris precision.
 */
class CompatibilityAction extends BaseAction {
  constructor(user, phoneNumber, data = {}) {
    super(user, phoneNumber, data);
    this.partnerData = data.partnerData;
  }

  static get actionId() {
    return 'initiate_compatibility_flow';
  }

  /**
   * Execute the compatibility action - starts relationship analysis
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Initializing synastry compatibility analysis');

      // Validate user profile completeness
      if (!(await this.validateUserProfile('Compatibility Analysis'))) {
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
   * Start the interactive compatibility analysis workflow
   */
  async startCompatibilityWorkflow() {
    const userLanguage = this.getUserLanguage();

    // Check if partner data is already provided
    if (this.partnerData && this.validatePartnerData(this.partnerData)) {
      // Direct calculation if partner data provided
      await this.performCompatibilityAnalysis(this.partnerData);
    } else {
      // Interactive collection of partner data
      await this.sendCompatibilityPrompt();
    }
  }

  /**
   * Send interactive prompt for partner birth details
   */
  async sendCompatibilityPrompt() {
    const userLanguage = this.getUserLanguage();

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

✨ *Why we need this:* Accurate birth data enables precise astrological synastry calculations revealing the cosmic compatibility between souls.

💫 Send your partner's birth details to explore your relationship's astrological dimensions!`;

    await sendMessage(this.phoneNumber, promptMessage, 'text');
  }

  /**
   * Perform complete compatibility analysis with Swiss Ephemeris
   * @param {Object} partnerData - Partner's complete birth data
   */
  async performCompatibilityAnalysis(partnerData) {
    try {
      this.logger.info(`Starting synastry analysis for ${this.phoneNumber} and partner`);

      // Calculate comprehensive synastry using Swiss Ephemeris
      const synastryAnalysis = await this.calculateSwissEphemerisSynastry(partnerData);

      // Generate relationship insights
      const insights = await this.generateRelationshipInsights(synastryAnalysis, partnerData);

      // Send formatted results
      await this.sendSynastryResults(synastryAnalysis, insights, partnerData);

      // Update usage counters
      await incrementCompatibilityChecks(this.phoneNumber);

      this.logExecution('complete', 'Synastry analysis completed successfully');
    } catch (error) {
      this.logger.error('Error in synastry analysis:', error);
      await this.sendAnalysisError();
    }
  }

  /**
   * Calculate synastry using Swiss Ephemeris precision
   * @param {Object} partnerData - Partner's birth data
   * @returns {Object} Complete synastry analysis
   */
  async calculateSwissEphemerisSynastry(partnerData) {
    try {
      // Parse both charts using Swiss Ephemeris
      const userChart = await this.calculateChartPositions(this.user);
      const partnerChart = await this.calculateChartPositions(partnerData);

      // Calculate interchart aspects (planetary relationships)
      const interchartAspects = this.calculateInterchartAspects(userChart, partnerChart);

      // Calculate house overlays (personal planets in partner houses)
      const houseOverlays = this.calculateHouseOverlays(userChart, partnerChart);

      // Calculate composite chart (midpoint synthesis)
      const compositeChart = this.calculateCompositeChart(userChart, partnerChart);

      // Generate compatibility scores
      const compatibilityScores = this.calculateCompatibilityScores(interchartAspects, houseOverlays);

      // Calculate relationship dynamics
      const relationshipDynamics = this.analyzeRelationshipDynamics(interchartAspects, compositeChart);

      return {
        userChart,
        partnerChart,
        interchartAspects,
        houseOverlays,
        compositeChart,
        compatibilityScores,
        relationshipDynamics,
        // Synastry houses (7th, 8th, etc. - relationship focus)
        synastryHouses: this.getRelationshipHouses(userChart, partnerChart)
      };
    } catch (error) {
      this.logger.error('Swiss Ephemeris synastry calculation error:', error);
      throw error;
    }
  }

  /**
   * Calculate planetary positions for a chart
   * @param {Object} person - Person's birth data
   * @returns {Object} Calculated chart positions
   */
  async calculateChartPositions(person) {
    try {
      // Parse birth date and time
      const birthYear = person.birthDate.length === 6 ?
        parseInt(`19${person.birthDate.substring(4)}`) :
        parseInt(person.birthDate.substring(4));
      const birthMonth = parseInt(person.birthDate.substring(2, 4)) - 1;
      const birthDay = parseInt(person.birthDate.substring(0, 2));
      const birthHour = person.birthTime ? parseInt(person.birthTime.substring(0, 2)) : 12;
      const birthMinute = person.birthTime ? parseInt(person.birthTime.substring(2, 4)) : 0;

      // Convert to Julian Day
      const utcTime = new Date(Date.UTC(birthYear, birthMonth, birthDay, birthHour, birthMinute));
      const julianDay = utcTime.getTime() / 86400000 + 2440587.5;

      // Calculate planetary positions
      const planets = {};
      const planetIds = [
        { name: 'Sun', ephem: sweph.SE_SUN },
        { name: 'Moon', ephem: sweph.SE_MOON },
        { name: 'Mars', ephem: sweph.SE_MARS },
        { name: 'Mercury', ephem: sweph.SE_MERCURY },
        { name: 'Jupiter', ephem: sweph.SE_JUPITER },
        { name: 'Venus', ephem: sweph.SE_VENUS },
        { name: 'Saturn', ephem: sweph.SE_SATURN }
      ];

      for (const planet of planetIds) {
        const result = sweph.swe_calc_ut(julianDay, planet.ephem, sweph.SEFLG_SPEED | sweph.SEFLG_SWIEPH);
        if (result.rc >= 0) {
          planets[planet.name] = {
            longitude: result.longitude[0],
            latitude: result.latitude[0],
            distance: result.distance[0],
            speed: result.speed[0],
            sign: this.longitudeToSign(result.longitude[0]),
            degree: result.longitude[0] % 30
          };
        }
      }

      // Calculate houses (Placidus system)
      const defaultLat = 28.6139; // Default Delhi latitude
      const defaultLng = 77.2090; // Default Delhi longitude
      const lat = person.latitude || defaultLat;
      const lng = person.longitude || defaultLng;

      const cusps = new Array(13);
      sweph.swe_houses(julianDay, lat, lng, 'P', cusps);

      const houses = {};
      for (let i = 1; i <= 12; i++) {
        houses[i] = {
          cusp: cusps[i],
          sign: this.longitudeToSign(cusps[i])
        };
      }

      return {
        planets,
        houses,
        ascendant: cusps[0],
        ascendantSign: this.longitudeToSign(cusps[0]),
        julianDay,
        birthData: person
      };
    } catch (error) {
      this.logger.error('Chart position calculation error:', error);
      throw error;
    }
  }

  /**
   * Calculate aspects between two charts (synastry)
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @returns {Array} Array of interchart aspects
   */
  calculateInterchartAspects(chart1, chart2) {
    const aspects = [];
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    // Calculate aspects between each pair of planets
    for (const planet1 of planets) {
      for (const planet2 of planets) {
        if (!chart1.planets[planet1] || !chart2.planets[planet2]) { continue; }

        const pos1 = chart1.planets[planet1].longitude;
        const pos2 = chart2.planets[planet2].longitude;
        const aspectData = this.findAspect(pos1, pos2);

        if (aspectData) {
          aspects.push({
            planet1,
            planet2,
            aspect: aspectData.aspect,
            orb: aspectData.orb,
            significance: this.analyzeAspectSignificance(planet1, planet2, aspectData.aspect),
            type: aspectData.aspect <= 60 ? 'harmonious' : aspectData.aspect >= 90 ? 'challenging' : 'neutral'
          });
        }
      }
    }

    return aspects.sort((a, b) => Math.abs(a.orb)); // Sort by tightest aspects
  }

  /**
   * Find aspect between two positions
   * @param {number} pos1 - First position
   * @param {number} pos2 - Second position
   * @returns {Object|null} Aspect information or null
   */
  findAspect(pos1, pos2) {
    const diff = Math.min(
      Math.abs(pos1 - pos2),
      Math.abs(pos1 - pos2 + 360),
      Math.abs(pos1 - pos2 - 360)
    );

    const aspects = {
      0: 'conjunction',
      60: 'sextile',
      90: 'square',
      120: 'trine',
      150: 'quincunx',
      180: 'opposition'
    };

    const orb = 8; // 8-degree orb for synastry

    for (const [angle, name] of Object.entries(aspects)) {
      const angleNum = parseInt(angle);
      if (Math.abs(diff - angleNum) <= orb) {
        return {
          aspect: angleNum,
          aspectName: name,
          orb: diff - angleNum
        };
      }
    }

    return null;
  }

  /**
   * Calculate house overlays (planets in partner's houses)
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @returns {Object} House overlay analysis
   */
  calculateHouseOverlays(chart1, chart2) {
    const overlays = {};

    // Check user's planets in partner's houses
    overlays.userInPartnerHouses = {};

    for (const [planet, data] of Object.entries(chart1.planets)) {
      const house = this.longitudeToHouse(data.longitude, chart2.ascendant);
      overlays.userInPartnerHouses[planet] = {
        house,
        significance: this.analyzeHouseOverlaySignificance(house, planet)
      };
    }

    // Check partner's planets in user's houses
    overlays.partnerInUserHouses = {};

    for (const [planet, data] of Object.entries(chart2.planets)) {
      const house = this.longitudeToHouse(data.longitude, chart1.ascendant);
      overlays.partnerInUserHouses[planet] = {
        house,
        significance: this.analyzeHouseOverlaySignificance(house, planet)
      };
    }

    return overlays;
  }

  /**
   * Calculate composite chart (relationship chart)
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @returns {Object} Composite chart
   */
  calculateCompositeChart(chart1, chart2) {
    const composite = {};

    // Calculate midpoint composite
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    composite.planets = {};
    for (const planet of planets) {
      if (chart1.planets[planet] && chart2.planets[planet]) {
        const pos1 = chart1.planets[planet].longitude;
        const pos2 = chart2.planets[planet].longitude;

        // Calculate midpoint
        let midpoint = (pos1 + pos2) / 2;

        // Handle 0-360 wraparound
        if (Math.abs(pos1 - pos2) > 180) {
          if (pos1 < pos2) {
            midpoint = ((pos1 + 360) + pos2) / 2;
          } else {
            midpoint = (pos1 + (pos2 + 360)) / 2;
          }
          if (midpoint >= 360) { midpoint -= 360; }
        }

        composite.planets[planet] = {
          longitude: midpoint,
          sign: this.longitudeToSign(midpoint),
          degree: midpoint % 30
        };
      }
    }

    // Composite houses (average ascendant positions)
    composite.ascendant = (chart1.ascendant + chart2.ascendant) / 2;
    composite.ascendantSign = this.longitudeToSign(composite.ascendant);

    return composite;
  }

  /**
   * Calculate compatibility scores based on synastry
   * @param {Array} aspects - Interchart aspects
   * @param {Object} overlays - House overlays
   * @returns {Object} Compatibility scores and insights
   */
  calculateCompatibilityScores(aspects, overlays) {
    let totalScore = 50; // Base score

    // Scoring based on aspects
    for (const aspect of aspects.slice(0, 10)) { // Top 10 aspects
      switch (aspect.aspect) {
      case 120: // Trine
        totalScore += 5;
        break;
      case 60: // Sextile
        totalScore += 3;
        break;
      case 0: // Conjunction
        totalScore += 2; // Depends on planets
        break;
      case 90: // Square
        totalScore -= 3;
        break;
      case 180: // Opposition
        totalScore -= 2;
        break;
      case 150: // Quincunx
        totalScore -= 1;
        break;
      }
    }

    // Scoring based on house overlays
    const relationshipHouses = [1, 5, 7, 8];
    let overlayScore = 0;

    for (const planet in overlays.userInPartnerHouses) {
      const { house } = overlays.userInPartnerHouses[planet];
      if (relationshipHouses.includes(house)) {
        overlayScore += 2;
      }
    }

    totalScore += overlayScore;
    totalScore = Math.max(0, Math.min(100, totalScore));

    return {
      overall: totalScore,
      categories: {
        aspects: this.scoreAspectsSection(aspects),
        overlays: this.scoreOverlaysSection(overlays),
        composite: this.analyzeCompositeHarmony(overlays)
      },
      level: totalScore >= 80 ? 'excellent' : totalScore >= 70 ? 'very_good' :
        totalScore >= 60 ? 'good' : totalScore >= 45 ? 'moderate' : 'challenging'
    };
  }

  /**
   * Generate relationship insights based on synastry
   * @param {Object} analysis - Complete synastry analysis
   * @param {Object} partnerData - Partner information
   * @returns {Object} Relationship insights
   */
  async generateRelationshipInsights(analysis, partnerData) {
    const insights = {
      overview: '',
      strengths: [],
      challenges: [],
      advice: '',
      dynamics: {}
    };

    // Generate overview
    const scoreLevel = analysis.compatibilityScores.level;
    insights.overview = this.getCompatibilityOverview(scoreLevel, partnerData.name || 'partner');

    // Generate strengths based on aspects
    insights.strengths = this.extractRelationshipStrengths(analysis);

    // Generate challenges based on aspects
    insights.challenges = this.extractRelationshipChallenges(analysis);

    // Generate relationship dynamics
    insights.dynamics = this.analyzeRelationshipDynamics(analysis.interchartAspects, analysis.compositeChart);

    // Generate advice
    insights.advice = this.generateRelationshipAdvice(insights.strengths, insights.challenges);

    return insights;
  }

  /**
   * Convert longitude to zodiac sign
   * @param {number} longitude - Degrees longitude
   * @returns {string} Zodiac sign
   */
  longitudeToSign(longitude) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs[Math.floor(longitude / 30) % 12];
  }

  /**
   * Convert longitude to house
   * @param {number} longitude - Degrees longitude
   * @param {number} ascendant - Chart ascendant
   * @returns {number} House number (1-12)
   */
  longitudeToHouse(longitude, ascendant) {
    const normalized = ((longitude - ascendant + 360) % 360);
    return Math.floor(normalized / 30) + 1;
  }

  /**
   * Analyze aspect significance for relationships
   * @param {string} planet1 - First planet
   * @param {string} planet2 - Second planet
   * @param {number} aspect - Aspect angle
   * @returns {string} Significance description
   */
  analyzeAspectSignificance(planet1, planet2, aspect) {
    const planetPairs = {
      SunMoon: 'Soul connection and understanding',
      SunVenus: 'Romantic and affectionate',
      MoonVenus: 'Emotional intimacy and nurturing',
      SunMars: 'Passion and vitality exchange',
      VenusMars: 'Sexual and romantic harmony',
      MoonMars: 'Emotional responses to action',
      SunMercury: 'Communication and mental resonance',
      SunSaturn: 'Structure and commitment in relationship',
      VenusSaturn: 'Devotion and long-term stability'
    };

    const key = `${planet1}${planet2}`;
    const description = planetPairs[key] || `${planet1}-${planet2} planetary connection`;

    switch (aspect) {
    case 120: return `Harmonious ${description.toLowerCase()} - natural flowing connection`;
    case 60: return `Supportive ${description.toLowerCase()} - opportunity for growth`;
    case 0: return `Merged ${description.toLowerCase()} - deep integration`;
    case 90: return `Tension in ${description.toLowerCase()} - learning through challenge`;
    case 180: return `Polarity in ${description.toLowerCase()} - balance through difference`;
    default: return `${description.toLowerCase()} - unique planetary dialogue`;
    }
  }

  /**
   * Analyze house overlay significance
   * @param {number} house - House number
   * @param {string} planet - Planet name
   * @returns {string} Significance description
   */
  analyzeHouseOverlaySignificance(house, planet) {
    const significances = {
      1: `${planet} in partner's 1st house - immediate attraction`,
      2: `${planet} in partner's 2nd house - values and security`,
      4: `${planet} in partner's 4th house - family and home life`,
      5: `${planet} in partner's 5th house - romance and creativity`,
      7: `${planet} in partner's 7th house - partnership energy`,
      8: `${planet} in partner's 8th house - deep intimacy and transformation`,
      9: `${planet} in partner's 9th house - shared philosophies`,
      10: `${planet} in partner's 10th house - career and reputation`,
      11: `${planet} in partner's 11th house - friendship and groups`,
      12: `${planet} in partner's 12th house - spiritual connection`
    };

    return significances[house] || `${planet} in partner's ${house}th house`;
  }

  /**
   * Analyze relationship dynamics
   * @param {Array} aspects - Interchart aspects
   * @param {Object} composite - Composite chart
   * @returns {Object} Relationship dynamics analysis
   */
  analyzeRelationshipDynamics(aspects, composite) {
    const dynamics = {
      communication: 'Neutral',
      intimacy: 'Developing',
      stability: 'Grounding',
      growth: 'Continuous'
    };

    // Analyze based on key planetary aspects
    const moonAspects = aspects.filter(a => a.planet1 === 'Moon' || a.planet2 === 'Moon').length;
    const venusAspects = aspects.filter(a => a.planet1 === 'Venus' || a.planet2 === 'Venus').length;
    const saturnAspects = aspects.filter(a => a.planet1 === 'Saturn' || a.planet2 === 'Saturn').length;

    if (venusAspects > moonAspects) {
      dynamics.intimacy = 'Romantic and affectionate';
    }

    if (saturnAspects > 0) {
      dynamics.stability = 'Structured and committed';
    }

    return dynamics;
  }

  // Additional methods follow...

  /**
   * Get relationship houses from both charts
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @returns {Object} Relationship house data
   */
  getRelationshipHouses(chart1, chart2) {
    return {
      partnership: {
        user7th: chart1.houses[7],
        partner7th: chart2.houses[7],
        compatibility: this.compareHouses(chart1.houses[7], chart2.houses[7])
      },
      intimacy: {
        user8th: chart1.houses[8],
        partner8th: chart2.houses[8],
        compatibility: this.compareHouses(chart1.houses[8], chart2.houses[8])
      }
    };
  }

  /**
   * Send formatted synastry results
   * @param {Object} analysis - Complete synastry analysis
   * @param {Object} insights - Relationship insights
   * @param {Object} partnerInfo - Partner information
   */
  async sendSynastryResults(analysis, insights, partnerInfo) {
    try {
      const formattedResults = this.formatSynastryResults(analysis, insights, partnerInfo);
      await sendMessage(this.phoneNumber, formattedResults, 'text');

      // Send interactive options for more details
      await this.sendDetailOptions(analysis);
    } catch (error) {
      this.logger.error('Error sending synastry results:', error);
      await this.sendAnalysisError();
    }
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
   * Check subscription limits
   * @returns {Object} Limit check result
   */
  async checkSubscriptionLimits() {
    // Implement subscription limits check
    return { allowed: true, used: 0, limit: 10 };
  }

  /**
   * Get user language
   * @returns {string} Language code
   */
  getUserLanguage() {
    return this.user?.preferredLanguage || 'en';
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
   * House comparison helper
   * @param {Object} house1 - First house data
   * @param {Object} house2 - Second house data
   * @returns {string} Compatibility description
   */
  compareHouses(house1, house2) {
    return house1.sign === house2.sign ?
      'Same elemental sign - natural resonance' :
      'Complementary signs - learning through difference';
  }

  /**
   * Score aspects section
   * @param {Array} aspects - Interchart aspects
   * @returns {Object} Scoring data
   */
  scoreAspectsSection(aspects) {
    const harmoniousCount = aspects.filter(a => a.aspect <= 60).length;
    const challengingCount = aspects.filter(a => a.aspect >= 90).length;
    return { harmonious: harmoniousCount, challenging: challengingCount };
  }

  /**
   * Score overlays section
   * @param {Object} overlays - House overlays
   * @returns {number} Overlay score
   */
  scoreOverlaysSection(overlays) {
    const score = 0;
    const relationshipHouses = [5, 7, 8];
    // Count planets in relationship houses
    return score + 5; // Simplified scoring
  }

  /**
   * Get compatibility overview based on score level
   * @param {string} level - Compatibility level
   * @param {string} partnerName - Partner name
   * @returns {string} Overview description
   */
  getCompatibilityOverview(level, partnerName) {
    const overviews = {
      excellent: `🌟 Excellent cosmic harmony with ${partnerName}! Your charts resonate with natural affinity and understanding.`,
      very_good: `💫 Strong astrological compatibility with ${partnerName}. Your energies support and enhance each other beautifully.`,
      good: `✅ Positive potential with ${partnerName}. Your charts show complementary energies that can build lasting harmony.`,
      moderate: `⚖️ Moderate compatibility with ${partnerName}. Conscious effort will nurture this relationship's potential.`,
      challenging: `🔍 Challenging cosmic dynamic with ${partnerName}. This connection offers powerful lessons and growth.`
    };

    return overviews[level] || `Complex astrological pattern with ${partnerName}. Professional consultation recommended.`;
  }

  /**
   * Extract relationship strengths from analysis
   * @param {Object} analysis - Synastry analysis
   * @returns {Array} Array of strength descriptions
   */
  extractRelationshipStrengths(analysis) {
    const strengths = [];

    // Harmonious aspects
    const trines = analysis.interchartAspects.filter(a => a.aspect === 120);
    const sextiles = analysis.interchartAspects.filter(a => a.aspect === 60);

    if (trines.length > 0) {
      strengths.push(`Easy flowing connection through ${trines.length} harmonious trine aspects`);
    }

    if (sextiles.length > 0) {
      strengths.push(`Supportive sextile aspects (${sextiles.length} found) foster growth and understanding`);
    }

    // Check for Venus-Mars conjunction or trine
    const venusMarsAspects = analysis.interchartAspects.filter(a =>
      (a.planet1 === 'Venus' && a.planet2 === 'Mars') ||
      (a.planet1 === 'Mars' && a.planet2 === 'Venus')
    );

    if (venusMarsAspects.length > 0) {
      strengths.push('Strong romantic and passionate connection indicated by Venus-Mars aspects');
    }

    // Check for Moon emotional connections
    const moonAspects = analysis.interchartAspects.filter(a =>
      a.planet1 === 'Moon' || a.planet2 === 'Moon'
    );

    if (moonAspects.length >= 2) {
      strengths.push('Deep emotional bond and understanding through multiple Moon aspects');
    }

    return strengths.slice(0, 4); // Limit to top 4 strengths
  }

  /**
   * Extract relationship challenges from analysis
   * @param {Object} analysis - Synastry analysis
   * @returns {Array} Array of challenge descriptions
   */
  extractRelationshipChallenges(analysis) {
    const challenges = [];

    // Challenging aspects
    const squares = analysis.interchartAspects.filter(a => a.aspect === 90);
    const oppositions = analysis.interchartAspects.filter(a => a.aspect === 180);

    if (squares.length > 0) {
      challenges.push('Growth opportunities through square aspects require work and commitment');
    }

    if (oppositions.length > 0) {
      challenges.push('Polarizing opposition aspects teach balance and compromise');
    }

    // Check for challenging Saturn aspects
    const saturnAspects = analysis.interchartAspects.filter(a =>
      a.planet1 === 'Saturn' || a.planet2 === 'Saturn'
    );

    if (saturnAspects.some(a => a.aspect >= 90)) {
      challenges.push('Saturn aspects indicate areas needing patience and long-term commitment');
    }

    return challenges.slice(0, 3); // Limit to top 3 challenges
  }

  /**
   * Generate relationship advice based on strengths and challenges
   * @param {Array} strengths - Relationship strengths
   * @param {Array} challenges - Relationship challenges
   * @returns {string} Personalized advice
   */
  generateRelationshipAdvice(strengths, challenges) {
    let advice = '';

    if (strengths.length > challenges.length) {
      advice = 'Focus on nurturing your natural connection while gently addressing the areas that need attention. This relationship has strong foundations for lasting harmony.';
    } else if (challenges.length > 0) {
      advice = 'This connection offers powerful growth opportunities. Approach challenges with patience and commitment. Professional astrological guidance can help navigate complex patterns.';
    } else {
      advice = 'Your charts show complementary energies that create a balanced partnership. Continue building on your shared understanding and mutual support.';
    }

    return advice;
  }

  /**
   * Format synastry results for display
   * @param {Object} analysis - Complete synastry analysis
   * @param {Object} insights - Relationship insights
   * @param {Object} partnerInfo - Partner information
   * @returns {string} Formatted results
   */
  formatSynastryResults(analysis, insights, partnerInfo) {
    let result = '';

    // Header
    result += `💕 *Synastry Analysis: ${this.user.name || 'You'} & ${partnerInfo.name || 'Partner'}*\n\n`;

    // Overview and Score
    result += `${insights.overview}\n\n`;
    result += `🎯 *Compatibility Score:* ${analysis.compatibilityScores.overall}/100 (${analysis.compatibilityScores.level.replace('_', ' ')})\n\n`;

    // Key Aspects (top 3)
    if (analysis.interchartAspects.length > 0) {
      result += '*🔮 Key Planetary Aspects:*\n';
      analysis.interchartAspects.slice(0, 3).forEach((aspect, index) => {
        const emoji = aspect.type === 'harmonious' ? '💫' : aspect.type === 'challenging' ? '⚡' : '🔄';
        result += `${emoji} ${aspect.planet1}-${aspect.planet2}: ${aspect.aspectName}\n`;
      });
      result += '\n';
    }

    // Relationship Dynamics
    const { dynamics } = insights;
    if (Object.keys(dynamics).length > 0) {
      result += '*🎭 Relationship Dynamics:*\n';
      result += `💬 Communication: ${dynamics.communication}\n`;
      result += `💑 Intimacy: ${dynamics.intimacy}\n`;
      result += `🛡️ Stability: ${dynamics.stability}\n\n`;
    }

    // Strengths
    if (insights.strengths.length > 0) {
      result += '*💪 Relationship Strengths:*\n';
      insights.strengths.forEach(strength => {
        result += `• ${strength}\n`;
      });
      result += '\n';
    }

    // Challenges
    if (insights.challenges.length > 0) {
      result += '*⚠️ Growth Areas:*\n';
      insights.challenges.forEach(challenge => {
        result += `• ${challenge}\n`;
      });
      result += '\n';
    }

    // Advice
    if (insights.advice) {
      result += `*💫 Astrological Wisdom:*\n${insights.advice}\n\n`;
    }

    // Footer
    result += '*🕉️ Remember:* Synastry reveals cosmic potentials. All relationships provide opportunities for growth and learning. Professional consultation recommended for complex patterns.';

    return result;
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
   * Analyze composite harmony - helper method
   * @param {Object} overlays - House overlays
   * @returns {string} Harmony assessment
   */
  analyzeCompositeHarmony(overlays) {
    // Simplified composite harmony analysis
    const relationshipPlanets = ['Venus', 'Mars', 'Moon', 'Sun'];
    let harmonyScore = 0;

    relationshipPlanets.forEach(planet => {
      if (overlays.userInPartnerHouses[planet] &&
          overlays.partnerInUserHouses[planet]) {
        harmonyScore += 1;
      }
    });

    return harmonyScore >= 2 ? 'Strong mutual resonance' :
      harmonyScore >= 1 ? 'Balanced give-and-take' : 'Learning balance';
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
   * Send analysis error message
   */
  async sendAnalysisError() {
    const errorMessage = '❌ *Compatibility Analysis Error*\n\nUnable to complete the synastry calculation. This could be due to:\n• Incomplete birth data format\n• Invalid birth place coordinates\n• Ephemeris calculation issues\n\nPlease ensure all birth details are accurate and try again, or use Settings to verify your profile.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage = '❌ Sorry, there was an error processing your compatibility analysis. Please try again or contact support if the problem persists.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Analyze relationship compatibility through synastry charts',
      keywords: ['compatibility', 'synastry', 'relationship', 'match', 'partner'],
      category: 'astrology',
      subscriptionRequired: true,
      cooldown: 300000, // 5 minutes between compatibility analyses
      maxUsage: 10 // Per month for free users
    };
  }
}

module.exports = CompatibilityAction;
