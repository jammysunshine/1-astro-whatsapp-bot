/**
const ServiceTemplate = require('./ServiceTemplate');
 * Remedies Dosha Service
 *
 * Provides comprehensive Vedic remedial measures for planetary afflictions,
 * dosha corrections, and spiritual healing practices including gemstones,
 * mantras, charities, pujas, and yantras based on birth chart analysis.
 */

const logger = require('../../../utils/logger');

class RemediesDoshaService extends ServiceTemplate {
  constructor() {
    super('vedicRemedies');
    this.serviceName = 'RemediesDoshaService';
    this.calculatorPath = '../calculators/vedicRemedies'; // Assuming this path for the main calculator
    logger.info('RemediesDoshaService initialized');
  }

  /**
   * Execute comprehensive remedies and dosha analysis
   * @param {Object} remediesData - Remedies request data
   * @returns {Promise<Object>} Complete remedies analysis
   */
  async processCalculation(remediesData) {
    try {
      // Input validation
      this._validateInput(remediesData);

      // Get comprehensive remedies analysis
      const result = await this.getRemediesDoshaAnalysis(remediesData);

      // Format and return result
      return this._formatResult(result);
    } catch (error) {
      logger.error('RemediesDoshaService error:', error);
      throw new Error(`Remedies and dosha analysis failed: ${error.message}`);
    }
  }

  /**
   * Get comprehensive remedies and dosha analysis
   * @param {Object} remediesData - Remedies data including birth chart and concerns
   * @returns {Promise<Object>} Remedies and dosha analysis
   */
  async getRemediesDoshaAnalysis(remediesData) {
    try {
      const { birthData, concerns, doshaType, remedyPreferences } =
        remediesData;

      // Analyze planetary afflictions
      const planetaryAfflictions =
        await this._analyzePlanetaryAfflictions(birthData);

      // Identify doshas and imbalances
      const doshaAnalysis = await this._analyzeDoshas(birthData, doshaType);

      // Generate personalized remedies
      const remedies = await this._generatePersonalizedRemedies(
        planetaryAfflictions,
        doshaAnalysis,
        concerns,
        remedyPreferences
      );

      // Calculate remedy effectiveness
      const effectiveness = this._calculateRemedyEffectiveness(
        remedies,
        birthData
      );

      // Generate implementation plan
      const implementationPlan = this._generateImplementationPlan(
        remedies,
        concerns
      );

      return {
        birthData: this._sanitizeBirthData(birthData),
        planetaryAfflictions,
        doshaAnalysis,
        remedies,
        effectiveness,
        implementationPlan,
        concerns,
        remedyPreferences,
        generalGuidance: this._generateGeneralGuidance(doshaAnalysis, remedies)
      };
    } catch (error) {
      logger.error('Error getting remedies dosha analysis:', error);
      throw error;
    }
  }

  /**
   * Analyze planetary afflictions in birth chart
   * @param {Object} birthData - Birth chart data
   * @returns {Promise<Object>} Planetary afflictions analysis
   * @private
   */
  async _analyzePlanetaryAfflictions(birthData) {
    try {
      const afflictions = {
        weakPlanets: [],
        afflictedPlanets: [],
        combustPlanets: [],
        retrogradePlanets: [],
        severity: 'Low'
      };

      // Analyze each planet
      const planets = [
        'sun',
        'moon',
        'mars',
        'mercury',
        'jupiter',
        'venus',
        'saturn',
        'rahu',
        'ketu'
      ];

      planets.forEach(planetKey => {
        const planet = birthData[planetKey];
        if (!planet) {
          return;
        }

        const planetName =
          planetKey.charAt(0).toUpperCase() + planetKey.slice(1);
        const analysis = this._analyzePlanetAffliction(
          planet,
          planetName,
          birthData
        );

        if (analysis.isWeak) {
          afflictions.weakPlanets.push(analysis);
        }

        if (analysis.isAfflicted) {
          afflictions.afflictedPlanets.push(analysis);
        }

        if (analysis.isCombust) {
          afflictions.combustPlanets.push(analysis);
        }

        if (analysis.isRetrograde) {
          afflictions.retrogradePlanets.push(analysis);
        }
      });

      // Calculate overall severity
      const totalAfflictions =
        afflictions.weakPlanets.length +
        afflictions.afflictedPlanets.length +
        afflictions.combustPlanets.length;
      afflictions.severity =
        totalAfflictions > 5 ? 'High' : totalAfflictions > 2 ? 'Medium' : 'Low';

      return afflictions;
    } catch (error) {
      logger.warn('Could not analyze planetary afflictions:', error.message);
      return {};
    }
  }

  /**
   * Analyze individual planet affliction
   * @param {Object} planet - Planet data
   * @param {string} planetName - Planet name
   * @param {Object} birthData - Full birth data
   * @returns {Object} Planet affliction analysis
   * @private
   */
  _analyzePlanetAffliction(planet, planetName, birthData) {
    const analysis = {
      planet: planetName,
      sign: planet.sign,
      house: planet.house,
      isWeak: false,
      isAfflicted: false,
      isCombust: false,
      isRetrograde: planet.isRetrograde || false,
      reasons: [],
      remedies: []
    };

    // Check if in debilitation
    if (this._isDebilitated(planetName, planet.sign)) {
      analysis.isWeak = true;
      analysis.reasons.push('Debilitated');
    }

    // Check if in enemy sign
    if (this._isInEnemySign(planetName, planet.sign)) {
      analysis.isWeak = true;
      analysis.reasons.push('In enemy sign');
    }

    // Check combustion (too close to Sun)
    if (this._isCombust(planet, birthData.sun)) {
      analysis.isCombust = true;
      analysis.reasons.push('Combust');
    }

    // Check aspect afflictions
    const aspects = this._checkAspects(planet, birthData);
    if (aspects.afflicted) {
      analysis.isAfflicted = true;
      analysis.reasons.push(...aspects.reasons);
    }

    // Generate basic remedies
    analysis.remedies = this._getBasicPlanetRemedies(
      planetName,
      analysis.reasons
    );

    return analysis;
  }

  /**
   * Analyze doshas in birth chart
   * @param {Object} birthData - Birth chart data
   * @param {string} specificDosha - Specific dosha to analyze
   * @returns {Promise<Object>} Dosha analysis
   * @private
   */
  async _analyzeDoshas(birthData, specificDosha) {
    try {
      const doshaAnalysis = {
        kaalSarpDosha: await this._analyzeKaalSarpDosha(birthData),
        pitraDosha: this._analyzePitraDosha(birthData),
        manglikDosha: this._analyzeManglikDosha(birthData),
        sadeSati: this._analyzeSadeSati(birthData),
        overallSeverity: 'Low'
      };

      // Focus on specific dosha if requested
      if (specificDosha && doshaAnalysis[specificDosha]) {
        doshaAnalysis.focusedDosha = {
          type: specificDosha,
          analysis: doshaAnalysis[specificDosha]
        };
      }

      // Calculate overall severity
      const activeDoshas = Object.values(doshaAnalysis).filter(
        dosha => dosha && typeof dosha === 'object' && dosha.isPresent
      );
      doshaAnalysis.overallSeverity =
        activeDoshas.length > 2 ?
          'High' :
          activeDoshas.length > 0 ?
            'Medium' :
            'Low';

      return doshaAnalysis;
    } catch (error) {
      logger.warn('Could not analyze doshas:', error.message);
      return {};
    }
  }

  /**
   * Analyze Kaal Sarp Dosha
   * @param {Object} birthData - Birth chart data
   * @returns {Promise<Object>} Kaal Sarp analysis
   * @private
   */
  async _analyzeKaalSarpDosha(birthData) {
    try {
      // Check if all planets are between Rahu and Ketu
      const planets = [
        'sun',
        'moon',
        'mars',
        'mercury',
        'jupiter',
        'venus',
        'saturn'
      ];
      const rahuLong = birthData.rahu?.longitude || 0;
      const ketuLong = birthData.ketu?.longitude || 0;

      let allBetween = true;
      planets.forEach(planet => {
        const planetLong = birthData[planet]?.longitude || 0;
        const isBetween = this._isBetweenRahuKetu(
          planetLong,
          rahuLong,
          ketuLong
        );
        if (!isBetween) {
          allBetween = false;
        }
      });

      return {
        isPresent: allBetween,
        type: allBetween ? this._getKaalSarpType(rahuLong, ketuLong) : null,
        severity: allBetween ? 'Medium' : 'None',
        remedies: allBetween ? this._getKaalSarpRemedies() : []
      };
    } catch (error) {
      logger.warn('Could not analyze Kaal Sarp Dosha:', error.message);
      return { isPresent: false, severity: 'None' };
    }
  }

  /**
   * Analyze Pitra Dosha
   * @param {Object} birthData - Birth chart data
   * @returns {Object} Pitra Dosha analysis
   * @private
   */
  _analyzePitraDosha(birthData) {
    // Simplified Pitra Dosha analysis
    const sunHouse = birthData.sun?.house || 0;
    const rahuHouse = birthData.rahu?.house || 0;

    const isPresent =
      (sunHouse === 9 || sunHouse === 12) &&
      (rahuHouse === 9 || rahuHouse === 12);

    return {
      isPresent,
      severity: isPresent ? 'Medium' : 'None',
      reasons: isPresent ? ['Sun and Rahu in 9th or 12th house'] : [],
      remedies: isPresent ? this._getPitraDoshaRemedies() : []
    };
  }

  /**
   * Analyze Manglik Dosha
   * @param {Object} birthData - Birth chart data
   * @returns {Object} Manglik Dosha analysis
   * @private
  _analyzeManglikDosha(birthData) {
    // Simplified Manglik analysis
    const marsHouse = birthData.mars?.house || 0;
    const marsSign = birthData.mars?.sign || '';

    const isPresent = marsHouse === 1 || marsHouse === 4 || marsHouse === 7 || marsHouse === 8 || marsHouse === 12 ||
                     ['Aries', 'Scorpio'].includes(marsSign);

    return {
      isPresent,
      severity: isPresent ? 'Medium' : 'None',
      reasons: isPresent ? ['Mars in certain houses or signs'] : [],
      remedies: isPresent ? this._getManglikRemedies() : []
    };
  }

  /**
   * Analyze Sade Sati
   * @param {Object} birthData - Birth chart data
   * @returns {Object} Sade Sati analysis
   * @private
   */
  _analyzeSadeSati(birthData) {
    // Simplified Sade Sati analysis
    const moonSign = birthData.moon?.sign || '';
    const saturnSign = birthData.saturn?.sign || '';

    const isPresent =
      Math.abs(
        this._getSignNumber(moonSign) - this._getSignNumber(saturnSign)
      ) <= 1;

    return {
      isPresent,
      severity: isPresent ? 'High' : 'None',
      reasons: isPresent ? ['Saturn near Moon sign'] : [],
      remedies: isPresent ? this._getSadeSatiRemedies() : []
    };
  }

  /**
   * Generate personalized remedies
   * @param {Object} afflictions - Planetary afflictions
   * @param {Object} doshas - Dosha analysis
   * @param {Array} concerns - User concerns
   * @param {Object} preferences - Remedy preferences
   * @returns {Promise<Object>} Personalized remedies
   * @private
   */
  async _generatePersonalizedRemedies(
    afflictions,
    doshas,
    concerns,
    preferences
  ) {
    try {
      const remedies = {
        gemstones: [],
        mantras: [],
        charities: [],
        pujas: [],
        yantras: [],
        lifestyle: [],
        immediate: [],
        longTerm: []
      };

      // Generate remedies for planetary afflictions
      afflictions.weakPlanets?.forEach(planet => {
        const planetRemedies = this._getComprehensivePlanetRemedies(
          planet.planet,
          planet.reasons
        );
        this._addRemediesToCategories(remedies, planetRemedies);
      });

      afflictions.afflictedPlanets?.forEach(planet => {
        const planetRemedies = this._getComprehensivePlanetRemedies(
          planet.planet,
          planet.reasons
        );
        this._addRemediesToCategories(remedies, planetRemedies);
      });

      // Generate remedies for doshas
      Object.values(doshas).forEach(dosha => {
        if (dosha && dosha.isPresent && dosha.remedies) {
          this._addRemediesToCategories(remedies, dosha.remedies);
        }
      });

      // Generate remedies for specific concerns
      if (concerns) {
        concerns.forEach(concern => {
          const concernRemedies = this._getConcernSpecificRemedies(concern);
          this._addRemediesToCategories(remedies, concernRemedies);
        });
      }

      // Filter based on preferences
      if (preferences) {
        remedies.filtered = this._filterRemediesByPreferences(
          remedies,
          preferences
        );
      }

      return remedies;
    } catch (error) {
      logger.warn('Could not generate personalized remedies:', error.message);
      return {};
    }
  }

  /**
   * Calculate remedy effectiveness
   * @param {Object} remedies - Generated remedies
   * @param {Object} birthData - Birth data
   * @returns {Object} Effectiveness analysis
   * @private
   */
  _calculateRemedyEffectiveness(remedies, birthData) {
    // Simplified effectiveness calculation
    const effectiveness = {
      overall: 0,
      breakdown: {},
      recommendations: []
    };

    // Count remedies by category
    const categoryCount = {};
    Object.keys(remedies).forEach(category => {
      if (Array.isArray(remedies[category])) {
        categoryCount[category] = remedies[category].length;
      }
    });

    // Calculate effectiveness score
    const totalRemedies = Object.values(categoryCount).reduce(
      (sum, count) => sum + count,
      0
    );
    effectiveness.overall = Math.min(100, totalRemedies * 10);

    // Category breakdown
    Object.entries(categoryCount).forEach(([category, count]) => {
      effectiveness.breakdown[category] = Math.min(100, count * 15);
    });

    // Generate recommendations
    if (effectiveness.overall < 50) {
      effectiveness.recommendations.push(
        'Consider consulting a qualified Vedic astrologer for more specific remedies'
      );
    }

    if (categoryCount.mantras > 0) {
      effectiveness.recommendations.push(
        'Regular mantra recitation can significantly improve planetary influences'
      );
    }

    if (categoryCount.gemstones > 0) {
      effectiveness.recommendations.push(
        'Gemstone remedies work best when worn after proper energization rituals'
      );
    }

    return effectiveness;
  }

  /**
   * Generate implementation plan
   * @param {Object} remedies - Remedies
   * @param {Array} concerns - User concerns
   * @returns {Object} Implementation plan
   * @private
   */
  _generateImplementationPlan(remedies, concerns) {
    const plan = {
      phases: [],
      timeline: {},
      priorities: []
    };

    // Phase 1: Immediate actions
    plan.phases.push({
      name: 'Immediate (First 7 days)',
      actions: remedies.immediate || [],
      focus: 'Start with simple, immediate remedies'
    });

    // Phase 2: Short-term remedies
    plan.phases.push({
      name: 'Short-term (1-3 months)',
      actions: remedies.mantras?.slice(0, 3) || [],
      focus: 'Establish regular spiritual practices'
    });

    // Phase 3: Long-term remedies
    plan.phases.push({
      name: 'Long-term (3-12 months)',
      actions: remedies.gemstones?.concat(remedies.pujas || []) || [],
      focus: 'Deepen spiritual connection and address root causes'
    });

    // Timeline recommendations
    plan.timeline = {
      daily: remedies.mantras?.filter(m => m.frequency === 'daily') || [],
      weekly: remedies.pujas?.filter(p => p.frequency === 'weekly') || [],
      monthly: remedies.charities?.filter(c => c.frequency === 'monthly') || []
    };

    // Priority concerns
    if (concerns) {
      plan.priorities = concerns.map(concern => ({
        concern,
        remedies: this._getPriorityRemediesForConcern(concern, remedies)
      }));
    }

    return plan;
  }

  /**
   * Generate general guidance
   * @param {Object} doshaAnalysis - Dosha analysis
   * @param {Object} remedies - Remedies
   * @returns {Object} General guidance
   * @private
   */
  _generateGeneralGuidance(doshaAnalysis, remedies) {
    const guidance = {
      overall: '',
      precautions: [],
      encouragement: '',
      timeline: ''
    };

    const severity = doshaAnalysis.overallSeverity || 'Low';

    if (severity === 'High') {
      guidance.overall =
        'Multiple significant afflictions require comprehensive remedial approach. Consistency is key.';
      guidance.precautions.push(
        'Consult qualified priests for pujas and mantras'
      );
      guidance.precautions.push(
        'Ensure gemstones are properly energized before wearing'
      );
      guidance.timeline = 'Results may take 6-12 months of consistent practice';
    } else if (severity === 'Medium') {
      guidance.overall =
        'Moderate afflictions can be addressed with regular remedial practices.';
      guidance.precautions.push(
        'Start with simpler remedies and gradually add more'
      );
      guidance.timeline = 'Noticeable improvements in 3-6 months';
    } else {
      guidance.overall =
        'Minor imbalances can be corrected with basic spiritual practices.';
      guidance.timeline = 'Positive changes within 1-3 months';
    }

    guidance.encouragement =
      'Remedial measures work best when combined with positive life changes and spiritual growth.';

    return guidance;
  }

  // Helper methods for affliction analysis

  _isDebilitated(planet, sign) {
    const debilitation = {
      Sun: 'Libra',
      Moon: 'Scorpio',
      Mars: 'Cancer',
      Mercury: 'Pisces',
      Jupiter: 'Capricorn',
      Venus: 'Virgo',
      Saturn: 'Aries'
    };
    return debilitation[planet] === sign;
  }

  _isInEnemySign(planet, sign) {
    // Simplified enemy sign check
    return false; // Would need full enemy sign logic
  }

  _isCombust(planet, sun) {
    if (!sun || !planet.longitude) {
      return false;
    }
    const distance = Math.abs(planet.longitude - sun.longitude);
    return distance <= 8.5; // Within 8.5 degrees of Sun
  }

  _checkAspects(planet, birthData) {
    // Simplified aspect checking
    return { afflicted: false, reasons: [] };
  }

  _getBasicPlanetRemedies(planet, reasons) {
    // Basic remedy mapping
    const remedies = {
      Sun: ['Wear ruby', 'Chant Aditya Hridayam'],
      Moon: ['Wear pearl', 'Chant Chandra mantra'],
      Mars: ['Wear coral', 'Chant Hanuman Chalisa'],
      Mercury: ['Wear emerald', 'Chant Vishnu Sahasranama'],
      Jupiter: ['Wear yellow sapphire', 'Chant Guru Beej mantra'],
      Venus: ['Wear diamond', 'Chant Lakshmi mantra'],
      Saturn: ['Wear blue sapphire', 'Chant Shani mantra']
    };
    return remedies[planet] || [];
  }

  // Helper methods for dosha analysis

  _isBetweenRahuKetu(planetLong, rahuLong, ketuLong) {
    // Check if planet is between Rahu and Ketu
    if (rahuLong < ketuLong) {
      return planetLong >= rahuLong && planetLong <= ketuLong;
    } else {
      return planetLong >= rahuLong || planetLong <= ketuLong;
    }
  }

  _getKaalSarpType(rahuLong, ketuLong) {
    // Determine Kaal Sarp type based on positions
    return 'Regular'; // Simplified
  }

  _getKaalSarpRemedies() {
    return [
      { type: 'mantra', item: 'Om Namah Shivaya', frequency: 'daily' },
      { type: 'puja', item: 'Nag Panchami Puja', frequency: 'annual' },
      { type: 'charity', item: 'Feed snakes (symbolic)', frequency: 'monthly' }
    ];
  }

  _getPitraDoshaRemedies() {
    return [
      { type: 'mantra', item: 'Pitra Gayatri Mantra', frequency: 'daily' },
      { type: 'puja', item: 'Pitra Paksha rituals', frequency: 'annual' },
      { type: 'charity', item: 'Feed Brahmins', frequency: 'monthly' }
    ];
  }

  _getManglikRemedies() {
    return [
      { type: 'mantra', item: 'Hanuman Chalisa', frequency: 'daily' },
      { type: 'puja', item: 'Manglik Dosha Nivaran Puja', frequency: 'once' },
      { type: 'gemstone', item: 'Coral', frequency: 'continuous' }
    ];
  }

  _getSadeSatiRemedies() {
    return [
      { type: 'mantra', item: 'Shani Chalisa', frequency: 'daily' },
      { type: 'puja', item: 'Shani Shingnapur visit', frequency: 'annual' },
      { type: 'charity', item: 'Feed crows', frequency: 'saturday' }
    ];
  }

  // Helper methods for remedy generation

  _getComprehensivePlanetRemedies(planet, reasons) {
    // Comprehensive remedy generation based on planet and affliction reasons
    const remedies = [];

    // Gemstone remedies
    const gemstones = this._getPlanetGemstones(planet);
    gemstones.forEach(gem => {
      remedies.push({
        type: 'gemstone',
        item: gem,
        planet,
        reason: reasons.join(', '),
        frequency: 'continuous',
        instructions: 'Wear after proper energization'
      });
    });

    // Mantra remedies
    const mantras = this._getPlanetMantras(planet);
    mantras.forEach(mantra => {
      remedies.push({
        type: 'mantra',
        item: mantra,
        planet,
        reason: reasons.join(', '),
        frequency: 'daily',
        instructions: 'Recite 108 times daily'
      });
    });

    // Charity remedies
    const charities = this._getPlanetCharities(planet);
    charities.forEach(charity => {
      remedies.push({
        type: 'charity',
        item: charity,
        planet,
        reason: reasons.join(', '),
        frequency: 'weekly',
        instructions: 'Perform on auspicious days'
      });
    });

    return remedies;
  }

  _getPlanetGemstones(planet) {
    const gemstones = {
      Sun: ['Ruby'],
      Moon: ['Pearl', 'Moonstone'],
      Mars: ['Coral'],
      Mercury: ['Emerald'],
      Jupiter: ['Yellow Sapphire'],
      Venus: ['Diamond'],
      Saturn: ['Blue Sapphire']
    };
    return gemstones[planet] || [];
  }

  _getPlanetMantras(planet) {
    const mantras = {
      Sun: ['Om Suryaya Namaha', 'Aditya Hridayam'],
      Moon: ['Om Chandraya Namaha', 'Chandra Beej Mantra'],
      Mars: ['Om Angarakaya Namaha', 'Hanuman Chalisa'],
      Mercury: ['Om Buddhaya Namaha', 'Vishnu Sahasranama'],
      Jupiter: ['Om Gurave Namaha', 'Guru Beej Mantra'],
      Venus: ['Om Shukraya Namaha', 'Lakshmi Mantra'],
      Saturn: ['Om Shanaischaraya Namaha', 'Shani Chalisa']
    };
    return mantras[planet] || [];
  }

  _getPlanetCharities(planet) {
    const charities = {
      Sun: ['Donate wheat', 'Feed Brahmins'],
      Moon: ['Donate milk', 'Help mothers'],
      Mars: ['Donate blood', 'Help warriors'],
      Mercury: ['Donate books', 'Help students'],
      Jupiter: ['Donate turmeric', 'Help teachers'],
      Venus: ['Donate clothes', 'Help artists'],
      Saturn: ['Donate iron', 'Help elderly']
    };
    return charities[planet] || [];
  }

  _addRemediesToCategories(remedies, newRemedies) {
    newRemedies.forEach(remedy => {
      const category = remedy.type;
      if (remedies[category]) {
        // Avoid duplicates
        const exists = remedies[category].some(r => r.item === remedy.item);
        if (!exists) {
          remedies[category].push(remedy);
        }
      }
    });
  }

  _getConcernSpecificRemedies(concern) {
    const concernRemedies = {
      health: [
        { type: 'mantra', item: 'Mahamrityunjaya Mantra', frequency: 'daily' },
        { type: 'puja', item: 'Ayurvedic treatments', frequency: 'ongoing' }
      ],
      wealth: [
        { type: 'mantra', item: 'Lakshmi Mantra', frequency: 'daily' },
        { type: 'puja', item: 'Lakshmi Puja', frequency: 'monthly' }
      ],
      relationships: [
        { type: 'mantra', item: 'Radha Krishna Mantra', frequency: 'daily' },
        { type: 'charity', item: 'Feed couples', frequency: 'weekly' }
      ],
      career: [
        { type: 'mantra', item: 'Ganesh Mantra', frequency: 'daily' },
        { type: 'puja', item: 'Saraswati Puja', frequency: 'weekly' }
      ]
    };
    return concernRemedies[concern.toLowerCase()] || [];
  }

  _filterRemediesByPreferences(remedies, preferences) {
    // Filter remedies based on user preferences (e.g., vegetarian, no animal products)
    const filtered = { ...remedies };

    if (preferences.vegetarianOnly) {
      // Remove non-vegetarian charities
      filtered.charities = filtered.charities?.filter(
        c => !['Feed fish', 'Feed meat'].includes(c.item)
      );
    }

    if (preferences.noGemstones) {
      filtered.gemstones = [];
    }

    return filtered;
  }

  _getPriorityRemediesForConcern(concern, remedies) {
    // Get top 3 remedies for specific concern
    const allRemedies = [];
    Object.values(remedies).forEach(category => {
      if (Array.isArray(category)) {
        allRemedies.push(...category);
      }
    });

    return allRemedies.slice(0, 3);
  }

  _getSignNumber(sign) {
    const signs = [
      'Aries',
      'Taurus',
      'Gemini',
      'Cancer',
      'Leo',
      'Virgo',
      'Libra',
      'Scorpio',
      'Sagittarius',
      'Capricorn',
      'Aquarius',
      'Pisces'
    ];
    return signs.indexOf(sign);
  }

  _sanitizeBirthData(birthData) {
    return {
      date: birthData.birthDate,
      time: birthData.birthTime,
      place: birthData.birthPlace
    };
  }

  /**
   * Validate input parameters
   * @param {Object} input - Input data to validate
   * @private
   */
  validate(input) {
    if (!input) {
      throw new Error('Input data is required');
    }

    if (!input.birthData) {
      throw new Error('Birth data is required for remedies analysis');
    }

    const { birthData } = input;

    if (!birthData.birthDate) {
      throw new Error('Birth date is required');
    }

    if (!birthData.birthTime) {
      throw new Error('Birth time is required');
    }

    if (!birthData.birthPlace) {
      throw new Error('Birth place is required');
    }

    // Validate date format
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(birthData.birthDate)) {
      throw new Error('Birth date must be in DD/MM/YYYY format');
    }

    // Validate time format
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(birthData.birthTime)) {
      throw new Error('Birth time must be in HH:MM format');
    }
  }

  /**
   * Format result for presentation
   * @param {Object} result - Raw remedies analysis result
   * @returns {Object} Formatted result
   * @private
   */
  formatResult(result) {
    if (!result) {
      return {
        success: false,
        error: 'Unable to generate remedies and dosha analysis',
        message: 'Remedies analysis failed'
      };
    }

    return {
      success: true,
      message: 'Remedies and dosha analysis completed successfully',
      data: {
        analysis: result,
        summary: this._createRemediesSummary(result),
        disclaimer:
          '⚠️ *Remedies Disclaimer:* These suggestions are based on Vedic astrological principles. Remedies should be performed under guidance of qualified practitioners. Results vary by individual circumstances and faith in the practice.'
      }
    };
  }

  /**
   * Create remedies summary for quick reference
   * @param {Object} result - Full remedies analysis
   * @returns {Object} Summary
   * @private
   */
  _createRemediesSummary(result) {
    return {
      doshaSeverity: result.doshaAnalysis?.overallSeverity || 'Low',
      afflictionCount:
        (result.planetaryAfflictions?.weakPlanets?.length || 0) +
        (result.planetaryAfflictions?.afflictedPlanets?.length || 0),
      remedyCategories: Object.keys(result.remedies || {}).filter(
        key =>
          Array.isArray(result.remedies[key]) && result.remedies[key].length > 0
      ),
      topRemedies: this._getTopRemedies(result.remedies),
      effectiveness: result.effectiveness?.overall || 0
    };
  }

  /**
   * Get top remedies for summary
   * @param {Object} remedies - All remedies
   * @returns {Array} Top remedies
   * @private
   */
  _getTopRemedies(remedies) {
    const topRemedies = [];

    // Get one remedy from each category
    ['mantras', 'gemstones', 'pujas'].forEach(category => {
      if (remedies[category] && remedies[category].length > 0) {
        topRemedies.push({
          category,
          remedy: remedies[category][0].item,
          frequency: remedies[category][0].frequency
        });
      }
    });

    return topRemedies;
  }

  /**
   * Get service metadata
   * @returns {Object} Service information
   */
  getMetadata() {
    return {
      name: 'RemediesDoshaService',
      description:
        'Comprehensive Vedic remedial measures for planetary afflictions and dosha corrections including gemstones, mantras, charities, pujas, and yantras based on birth chart analysis',
      version: '1.0.0',
      dependencies: ['vedicRemedies'],
      category: 'vedic'
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

module.exports = RemediesDoshaService;
