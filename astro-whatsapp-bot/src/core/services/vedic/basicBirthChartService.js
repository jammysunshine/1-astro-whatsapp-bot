const { ChartGenerator } = require('../../../services/astrology/vedic/calculators/ChartGenerator');
const logger = require('../../../utils/logger');

/**
 * BasicBirthChartService - Service for simplified birth chart generation
 * Generates simplified birth charts with essential planetary positions, signs, houses, and basic interpretations for quick reference
 */
class BasicBirthChartService {
  constructor() {
    this.calculator = new ChartGenerator();
    logger.info('BasicBirthChartService initialized');
  }

  /**
   * Execute basic birth chart generation
   * @param {Object} birthData - Birth data for chart generation
   * @param {string} birthData.birthDate - Birth date (DD/MM/YYYY)
   * @param {string} birthData.birthTime - Birth time (HH:MM)
   * @param {string} birthData.birthPlace - Birth place
   * @param {string} birthData.name - Person's name (optional)
   * @param {string} options - Chart type options (vedic/western)
   * @returns {Object} Basic birth chart result
   */
  async execute(birthData, options = {}) {
    try {
      // Input validation
      this._validateInput(birthData);

      // Generate basic birth chart
      const result = await this.generateBasicBirthChart(birthData, options);

      // Format and return result
      return this._formatResult(result);
    } catch (error) {
      logger.error('BasicBirthChartService error:', error);
      throw new Error(`Basic birth chart generation failed: ${error.message}`);
    }
  }

  /**
   * Generate simplified birth chart with essential information
   * @param {Object} birthData - Birth data
   * @param {Object} options - Generation options
   * @returns {Object} Basic chart analysis
   */
  async generateBasicBirthChart(birthData, options = {}) {
    try {
      const chartType = options.type || 'vedic';

      let basicChart;

      if (chartType === 'vedic') {
        // Generate basic Vedic chart
        basicChart = await this._generateBasicVedicChart(birthData);
      } else {
        // Generate basic Western chart
        basicChart = await this.calculator.generateWesternBirthChart(birthData);
      }

      // Generate basic interpretations
      const basicInterpretation = this._generateBasicInterpretation(basicChart, chartType);
      const keyIndicators = this._identifyKeyIndicators(basicChart, chartType);
      const personalityProfile = this._createPersonalityProfile(basicChart, chartType);

      return {
        chart: basicChart,
        interpretation: basicInterpretation,
        keyIndicators,
        personalityProfile,
        chartType,
        summary: this._createBasicSummary(basicChart, chartType)
      };
    } catch (error) {
      logger.error('Basic birth chart generation error:', error);
      throw error;
    }
  }

  /**
   * Generate basic Vedic chart with essential elements
   * @param {Object} birthData - Birth data
   * @returns {Object} Basic Vedic chart
   */
  async _generateBasicVedicChart(birthData) {
    try {
      // Use the Vedic kundli generator but extract only basic elements
      const fullKundli = await this.calculator.generateVedicKundli(birthData);

      // Extract basic chart elements
      const basicChart = {
        birthDetails: fullKundli.birthDetails,
        ascendant: {
          sign: fullKundli.ascendant.sign,
          degree: fullKundli.ascendant.degree
        },
        planets: this._extractBasicPlanets(fullKundli.planetaryPositions),
        houses: this._extractBasicHouses(fullKundli.houses),
        rasiChart: fullKundli.rasiChart
      };

      return basicChart;
    } catch (error) {
      logger.error('Basic Vedic chart generation error:', error);
      throw error;
    }
  }

  /**
   * Extract basic planetary information
   * @param {Object} planetaryPositions - Full planetary positions
   * @returns {Object} Basic planet data
   */
  _extractBasicPlanets(planetaryPositions) {
    const basicPlanets = {};
    const keyPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    for (const planet of keyPlanets) {
      if (planetaryPositions[planet]) {
        const data = planetaryPositions[planet];
        basicPlanets[planet] = {
          sign: data.sign,
          house: data.house,
          degree: data.longitude % 30, // Degree within sign
          retrograde: data.retrograde || false
        };
      }
    }

    return basicPlanets;
  }

  /**
   * Extract basic house information
   * @param {Object} houses - Full house data
   * @returns {Object} Basic house data
   */
  _extractBasicHouses(houses) {
    const basicHouses = {};

    // Extract key house information
    for (let i = 1; i <= 12; i++) {
      if (houses[i]) {
        basicHouses[i] = {
          sign: houses[i].sign,
          planets: houses[i].planets || []
        };
      }
    }

    return basicHouses;
  }

  /**
   * Generate basic interpretation of the chart
   * @param {Object} chart - Basic chart data
   * @param {string} chartType - Chart type (vedic/western)
   * @returns {Object} Basic interpretation
   */
  _generateBasicInterpretation(chart, chartType) {
    const interpretation = {
      ascendant: this._interpretAscendant(chart.ascendant, chartType),
      sunSign: this._interpretSunSign(chart.planets.Sun, chartType),
      moonSign: this._interpretMoonSign(chart.planets.Moon, chartType),
      dominantPlanets: this._identifyDominantPlanets(chart.planets),
      chartBalance: this._assessChartBalance(chart)
    };

    return interpretation;
  }

  /**
   * Identify key indicators in the chart
   * @param {Object} chart - Basic chart data
   * @param {string} chartType - Chart type
   * @returns {Object} Key indicators
   */
  _identifyKeyIndicators(chart, chartType) {
    const indicators = {
      strengths: [],
      challenges: [],
      opportunities: [],
      lifeFocus: []
    };

    // Analyze based on planetary placements
    if (chart.planets.Sun?.house) {
      indicators.lifeFocus.push(this._getHouseFocus(chart.planets.Sun.house));
    }

    if (chart.planets.Moon?.house) {
      indicators.strengths.push(this._getMoonHouseStrength(chart.planets.Moon.house));
    }

    if (chart.planets.Jupiter?.house) {
      indicators.opportunities.push(this._getJupiterHouseOpportunity(chart.planets.Jupiter.house));
    }

    if (chart.planets.Saturn?.house) {
      indicators.challenges.push(this._getSaturnHouseChallenge(chart.planets.Saturn.house));
    }

    return indicators;
  }

  /**
   * Create basic personality profile
   * @param {Object} chart - Basic chart data
   * @param {string} chartType - Chart type
   * @returns {Object} Personality profile
   */
  _createPersonalityProfile(chart, chartType) {
    const profile = {
      coreTraits: [],
      communication: '',
      approach: '',
      motivation: ''
    };

    // Basic personality traits based on key placements
    if (chart.ascendant?.sign) {
      profile.coreTraits.push(this._getAscendantTrait(chart.ascendant.sign));
    }

    if (chart.planets.Sun?.sign) {
      profile.coreTraits.push(this._getSunSignTrait(chart.planets.Sun.sign));
    }

    if (chart.planets.Moon?.sign) {
      profile.coreTraits.push(this._getMoonSignTrait(chart.planets.Moon.sign));
    }

    profile.communication = this._getCommunicationStyle(chart.planets.Mercury);
    profile.approach = this._getLifeApproach(chart.planets.Mars);
    profile.motivation = this._getMotivation(chart.planets.Venus);

    return profile;
  }

  /**
   * Interpret ascendant
   * @param {Object} ascendant - Ascendant data
   * @param {string} chartType - Chart type
   * @returns {string} Ascendant interpretation
   */
  _interpretAscendant(ascendant, chartType) {
    const { sign } = ascendant;
    const interpretations = {
      Aries: 'Bold and pioneering approach to life',
      Taurus: 'Practical and reliable life foundation',
      Gemini: 'Versatile and communicative personality',
      Cancer: 'Nurturing and emotionally intuitive nature',
      Leo: 'Creative and charismatic presence',
      Virgo: 'Detail-oriented and service-focused approach',
      Libra: 'Harmonious and relationship-oriented focus',
      Scorpio: 'Intense and transformative energy',
      Sagittarius: 'Adventurous and philosophical outlook',
      Capricorn: 'Ambitious and disciplined character',
      Aquarius: 'Innovative and humanitarian perspective',
      Pisces: 'Compassionate and spiritually inclined nature'
    };

    return interpretations[sign] || `Rising ${sign} indicates a ${sign.toLowerCase()} approach to life`;
  }

  /**
   * Interpret Sun sign
   * @param {Object} sun - Sun data
   * @param {string} chartType - Chart type
   * @returns {string} Sun sign interpretation
   */
  _interpretSunSign(sun, chartType) {
    if (!sun) { return 'Sun placement analysis unavailable'; }

    const { sign } = sun;
    const { house } = sun;

    return `Sun in ${sign} in the ${house}th house represents core identity and life purpose`;
  }

  /**
   * Interpret Moon sign
   * @param {Object} moon - Moon data
   * @param {string} chartType - Chart type
   * @returns {string} Moon sign interpretation
   */
  _interpretMoonSign(moon, chartType) {
    if (!moon) { return 'Moon placement analysis unavailable'; }

    const { sign } = moon;
    const { house } = moon;

    return `Moon in ${sign} in the ${house}th house indicates emotional nature and inner security needs`;
  }

  /**
   * Identify dominant planets
   * @param {Object} planets - Planet data
   * @returns {Array} Dominant planets
   */
  _identifyDominantPlanets(planets) {
    const dominant = [];

    // Simple dominance based on angular houses (1, 4, 7, 10)
    const angularHouses = [1, 4, 7, 10];

    for (const [planet, data] of Object.entries(planets)) {
      if (angularHouses.includes(data.house)) {
        dominant.push(`${planet} (angular)`);
      }
    }

    if (dominant.length === 0) {
      dominant.push('Balanced planetary distribution');
    }

    return dominant.slice(0, 3);
  }

  /**
   * Assess chart balance
   * @param {Object} chart - Chart data
   * @returns {string} Balance assessment
   */
  _assessChartBalance(chart) {
    // Basic balance assessment
    const planetCount = Object.keys(chart.planets).length;
    const houseCount = Object.keys(chart.houses).length;

    if (planetCount >= 7 && houseCount >= 12) {
      return 'Well-balanced chart with comprehensive planetary coverage';
    } else {
      return 'Chart shows focused planetary emphasis in key areas';
    }
  }

  /**
   * Get house focus based on Sun placement
   * @param {number} house - House number
   * @returns {string} House focus
   */
  _getHouseFocus(house) {
    const focuses = {
      1: 'Personal identity and self-expression',
      2: 'Values, resources, and self-worth',
      3: 'Communication and learning',
      4: 'Home, family, and emotional foundation',
      5: 'Creativity, children, and joy',
      6: 'Service, health, and daily routines',
      7: 'Partnerships and relationships',
      8: 'Transformation and shared resources',
      9: 'Philosophy, travel, and higher learning',
      10: 'Career, reputation, and public life',
      11: 'Friendships, groups, and aspirations',
      12: 'Spirituality and inner life'
    };

    return focuses[house] || `Life focus on house ${house} themes`;
  }

  /**
   * Get Moon house strength
   * @param {number} house - House number
   * @returns {string} Moon house strength
   */
  _getMoonHouseStrength(house) {
    const strengths = {
      1: 'Emotional self-awareness',
      2: 'Emotional security through resources',
      3: 'Emotional expression through communication',
      4: 'Strong emotional foundation',
      5: 'Emotional fulfillment through creativity',
      6: 'Emotional healing through service',
      7: 'Emotional connection in relationships',
      8: 'Deep emotional transformation',
      9: 'Emotional growth through learning',
      10: 'Emotional satisfaction through achievement',
      11: 'Emotional support through friendships',
      12: 'Emotional depth through spirituality'
    };

    return strengths[house] || 'Emotional strength in personal life';
  }

  /**
   * Get Jupiter house opportunity
   * @param {number} house - House number
   * @returns {string} Jupiter house opportunity
   */
  _getJupiterHouseOpportunity(house) {
    const opportunities = {
      1: 'Personal growth and self-confidence',
      2: 'Financial expansion and abundance',
      3: 'Learning and communication opportunities',
      4: 'Family harmony and home expansion',
      5: 'Creative success and joyful experiences',
      6: 'Health improvement and service success',
      7: 'Relationship growth and partnership success',
      8: 'Transformation and shared resource growth',
      9: 'Educational and travel opportunities',
      10: 'Career advancement and recognition',
      11: 'Group success and aspiration fulfillment',
      12: 'Spiritual growth and inner wisdom'
    };

    return opportunities[house] || 'Growth opportunity in life area';
  }

  /**
   * Get Saturn house challenge
   * @param {number} house - House number
   * @returns {string} Saturn house challenge
   */
  _getSaturnHouseChallenge(house) {
    const challenges = {
      1: 'Self-doubt and identity challenges',
      2: 'Financial responsibility and limitation',
      3: 'Communication barriers and learning delays',
      4: 'Family responsibilities and emotional restraint',
      5: 'Creative blocks and delayed joy',
      6: 'Health concerns and work burdens',
      7: 'Relationship commitment challenges',
      8: 'Transformation fears and intimacy issues',
      9: 'Educational obstacles and belief limitations',
      10: 'Career delays and authority challenges',
      11: 'Group responsibility and friendship tests',
      12: 'Spiritual doubts and isolation periods'
    };

    return challenges[house] || 'Life lesson requiring patience and perseverance';
  }

  /**
   * Get ascendant trait
   * @param {string} sign - Ascendant sign
   * @returns {string} Personality trait
   */
  _getAscendantTrait(sign) {
    const traits = {
      Aries: 'Bold and direct',
      Taurus: 'Steady and reliable',
      Gemini: 'Versatile and communicative',
      Cancer: 'Caring and intuitive',
      Leo: 'Confident and creative',
      Virgo: 'Practical and helpful',
      Libra: 'Diplomatic and fair',
      Scorpio: 'Intense and perceptive',
      Sagittarius: 'Optimistic and adventurous',
      Capricorn: 'Ambitious and disciplined',
      Aquarius: 'Independent and innovative',
      Pisces: 'Compassionate and imaginative'
    };

    return traits[sign] || 'Balanced personality';
  }

  /**
   * Get Sun sign trait
   * @param {string} sign - Sun sign
   * @returns {string} Personality trait
   */
  _getSunSignTrait(sign) {
    const traits = {
      Aries: 'Natural leader',
      Taurus: 'Patient and determined',
      Gemini: 'Curious and adaptable',
      Cancer: 'Protective and nurturing',
      Leo: 'Generous and charismatic',
      Virgo: 'Analytical and helpful',
      Libra: 'Harmonious and fair-minded',
      Scorpio: 'Powerful and transformative',
      Sagittarius: 'Philosophical and free-spirited',
      Capricorn: 'Responsible and ambitious',
      Aquarius: 'Humanitarian and original',
      Pisces: 'Empathetic and artistic'
    };

    return traits[sign] || 'Purposeful individual';
  }

  /**
   * Get Moon sign trait
   * @param {string} sign - Moon sign
   * @returns {string} Emotional trait
   */
  _getMoonSignTrait(sign) {
    const traits = {
      Aries: 'Emotionally direct',
      Taurus: 'Emotionally stable',
      Gemini: 'Emotionally expressive',
      Cancer: 'Deeply feeling',
      Leo: 'Emotionally generous',
      Virgo: 'Emotionally practical',
      Libra: 'Emotionally balanced',
      Scorpio: 'Emotionally intense',
      Sagittarius: 'Emotionally optimistic',
      Capricorn: 'Emotionally controlled',
      Aquarius: 'Emotionally detached',
      Pisces: 'Emotionally sensitive'
    };

    return traits[sign] || 'Emotionally aware';
  }

  /**
   * Get communication style
   * @param {Object} mercury - Mercury data
   * @returns {string} Communication style
   */
  _getCommunicationStyle(mercury) {
    if (!mercury) { return 'Clear and effective communication'; }

    const { sign } = mercury;
    const styles = {
      Gemini: 'Versatile and quick-thinking communication',
      Virgo: 'Precise and analytical expression',
      Libra: 'Diplomatic and harmonious speech',
      Sagittarius: 'Direct and philosophical communication',
      Pisces: 'Intuitive and empathetic expression'
    };

    return styles[sign] || 'Clear and thoughtful communication';
  }

  /**
   * Get life approach
   * @param {Object} mars - Mars data
   * @returns {string} Life approach
   */
  _getLifeApproach(mars) {
    if (!mars) { return 'Balanced and determined life approach'; }

    const { sign } = mars;
    const approaches = {
      Aries: 'Direct and pioneering approach',
      Taurus: 'Steady and persistent effort',
      Gemini: 'Versatile and adaptable methods',
      Cancer: 'Protective and nurturing strategy',
      Leo: 'Creative and confident action',
      Virgo: 'Practical and detail-oriented approach',
      Libra: 'Balanced and cooperative methods',
      Scorpio: 'Intense and transformative action',
      Sagittarius: 'Adventurous and philosophical outlook',
      Capricorn: 'Disciplined and goal-oriented approach',
      Aquarius: 'Innovative and independent methods',
      Pisces: 'Intuitive and compassionate strategy'
    };

    return approaches[sign] || 'Purposeful and determined approach';
  }

  /**
   * Get motivation
   * @param {Object} venus - Venus data
   * @returns {string} Motivation description
   */
  _getMotivation(venus) {
    if (!venus) { return 'Harmonious and loving motivation'; }

    const { sign } = venus;
    const motivations = {
      Taurus: 'Security and sensual pleasure',
      Cancer: 'Emotional connection and nurturing',
      Leo: 'Creative expression and appreciation',
      Virgo: 'Service and practical harmony',
      Libra: 'Relationship balance and beauty',
      Scorpio: 'Deep intimacy and transformation',
      Sagittarius: 'Philosophical love and adventure',
      Capricorn: 'Committed relationships and achievement',
      Aquarius: 'Intellectual connection and freedom',
      Pisces: 'Spiritual love and compassion'
    };

    return motivations[sign] || 'Love, beauty, and harmonious relationships';
  }

  /**
   * Create basic chart summary
   * @param {Object} chart - Chart data
   * @param {string} chartType - Chart type
   * @returns {string} Basic summary
   */
  _createBasicSummary(chart, chartType) {
    const chartName = chartType === 'vedic' ? 'Vedic' : 'Western';
    let summary = `This basic ${chartName} birth chart provides essential planetary positions and house placements for quick reference. `;

    if (chart.ascendant?.sign) {
      summary += `The ${chart.ascendant.sign} ascendant suggests a ${this._getAscendantTrait(chart.ascendant.sign).toLowerCase()} approach to life. `;
    }

    summary += 'Use this chart as a foundation for understanding your astrological blueprint and life patterns.';

    return summary;
  }

  /**
   * Validate input data
   * @param {Object} input - Input data to validate
   */
  _validateInput(input) {
    if (!input) {
      throw new Error('Birth data is required');
    }

    const { birthDate, birthTime, birthPlace } = input;

    if (!birthDate || typeof birthDate !== 'string') {
      throw new Error('Valid birth date (DD/MM/YYYY format) is required');
    }

    if (!birthTime || typeof birthTime !== 'string') {
      throw new Error('Valid birth time (HH:MM format) is required');
    }

    if (!birthPlace || typeof birthPlace !== 'string') {
      throw new Error('Valid birth place is required');
    }

    // Validate date format
    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!dateRegex.test(birthDate)) {
      throw new Error('Birth date must be in DD/MM/YYYY format');
    }

    // Validate time format
    const timeRegex = /^\d{1,2}:\d{1,2}$/;
    if (!timeRegex.test(birthTime)) {
      throw new Error('Birth time must be in HH:MM format');
    }
  }

  /**
   * Format result for presentation
   * @param {Object} result - Raw basic chart result
   * @returns {Object} Formatted result
   */
  _formatResult(result) {
    return {
      service: 'Basic Birth Chart',
      timestamp: new Date().toISOString(),
      chart: {
        basic: result.chart,
        interpretation: result.interpretation,
        keyIndicators: result.keyIndicators,
        personalityProfile: result.personalityProfile,
        chartType: result.chartType
      },
      summary: result.summary,
      disclaimer: 'This basic birth chart provides essential astrological information for general understanding. For comprehensive analysis, consult a qualified astrologer. Astrology is a tool for self-awareness and should not replace professional advice.'
    };
  }
}

module.exports = BasicBirthChartService;
