const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure (for now)

/**
 * CurrentDashaService - Vedic current dasha analysis service
 *
 * Calculates the current major planetary period (Mahadasha) and sub-period (Antardasha) a person is experiencing,
 * including duration, remaining time, and planetary influences using authentic Vimshottari Dasha calculations.
 */
class CurrentDashaService extends ServiceTemplate {
  constructor() {
    super('ChartGenerator');
    this.calculatorPath = './calculators/ChartGenerator';
    this.serviceName = 'CurrentDashaService';
    logger.info('CurrentDashaService initialized');
  }

  async lcurrentDashaCalculation(birthData) {
    try {
      // Calculate current Dasha
      const result = await this.calculateCurrentDasha(birthData);
      return result;
    } catch (error) {
      logger.error('CurrentDashaService calculation error:', error);
      throw new Error(`Current Dasha calculation failed: ${error.message}`);
    }
  }

  formatResult(result) {
    return {
      success: true,
      service: 'Vedic Current Dasha Analysis',
      timestamp: new Date().toISOString(),
      data: result,
      disclaimer:
        'Current Dasha analysis shows your present planetary period influences. Dasha periods indicate when certain planetary energies are most active. Complete astrological analysis considers the entire birth chart for comprehensive understanding.'
    };
  }

  validate(birthData) {
    if (!birthData) {
      throw new Error('Birth data is required');
    }

    const { birthDate, birthTime, birthPlace } = birthData;

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

    return true;
  }

  /**
   * Calculate current Dasha period
   * @param {Object} birthData - Birth data
   * @returns {Object} Current Dasha analysis
   */
  async calculateCurrentDasha(birthData) {
    try {
      // Get Dasha analysis from calculator
      const dashaAnalysis =
        await this.calculator.calculateVimshottariDasha(birthData);

      // Extract current Dasha information
      const currentDasha = this._extractCurrentDasha(dashaAnalysis);

      // Generate additional analysis
      const dashaInfluence = this._analyzeDashaInfluence(currentDasha);
      const remainingTime = this._calculateRemainingTime(currentDasha);
      const lifeImpact = this._assessLifeImpact(currentDasha);
      const recommendations = this._generateRecommendations(currentDasha);

      return {
        currentDasha,
        dashaInfluence,
        remainingTime,
        lifeImpact,
        recommendations,
        interpretation: this._createCurrentDashaInterpretation(
          currentDasha,
          dashaInfluence
        )
      };
    } catch (error) {
      logger.error('Current Dasha calculation error:', error);
      throw error;
    }
  }

  /**
   * Extract current Dasha information
   * @param {Object} dashaAnalysis - Complete Dasha analysis
   * @returns {Object} Current Dasha details
   */
  _extractCurrentDasha(dashaAnalysis) {
    const current = dashaAnalysis.currentDasha || {};

    return {
      mahadasha: {
        lord: current.mahadashaLord || 'Unknown',
        startDate: current.mahadashaStart || 'Unknown',
        endDate: current.mahadashaEnd || 'Unknown',
        totalYears: current.mahadashaYears || 0,
        remainingYears: current.remainingYears || 0,
        elapsedYears:
          (current.mahadashaYears || 0) - (current.remainingYears || 0)
      },
      antardasha: {
        lord: current.antardashaLord || 'Unknown',
        startDate: current.antardashaStart || 'Unknown',
        endDate: current.antardashaEnd || 'Unknown',
        totalYears: current.antardashaYears || 0,
        remainingYears: current.antardashaRemaining || 0
      },
      pratyantardasha: {
        lord: current.pratyantardashaLord || 'Unknown',
        startDate: current.pratyantardashaStart || 'Unknown',
        endDate: current.pratyantardashaEnd || 'Unknown'
      },
      sukshmaDasha: {
        lord: current.sukshmaDashaLord || 'Unknown',
        startDate: current.sukshmaDashaStart || 'Unknown',
        endDate: current.sukshmaDashaEnd || 'Unknown'
      }
    };
  }

  /**
   * Analyze Dasha planetary influence
   * @param {Object} currentDasha - Current Dasha details
   * @returns {Object} Dasha influence analysis
   */
  _analyzeDashaInfluence(currentDasha) {
    const mahadashaLord = currentDasha.mahadasha.lord.toLowerCase();
    const antardashaLord = currentDasha.antardasha.lord.toLowerCase();

    return {
      primaryInfluence: this._getPlanetaryInfluence(mahadashaLord),
      secondaryInfluence: this._getPlanetaryInfluence(antardashaLord),
      combinedEffect: this._analyzeDashaCombination(
        mahadashaLord,
        antardashaLord
      ),
      dominantThemes: this._getDashaThemes(mahadashaLord),
      energyPattern: this._determineEnergyPattern(
        mahadashaLord,
        antardashaLord
      )
    };
  }

  /**
   * Calculate remaining time in current Dasha
   * @param {Object} currentDasha - Current Dasha details
   * @returns {Object} Remaining time analysis
   */
  _calculateRemainingTime(currentDasha) {
    const { mahadasha } = currentDasha;
    const { antardasha } = currentDasha;

    return {
      mahadashaRemaining: {
        years: mahadasha.remainingYears,
        months: Math.round((mahadasha.remainingYears % 1) * 12),
        percentage:
          mahadasha.totalYears > 0 ?
            Math.round((mahadasha.elapsedYears / mahadasha.totalYears) * 100) :
            0
      },
      antardashaRemaining: {
        years: antardasha.remainingYears,
        months: Math.round((antardasha.remainingYears % 1) * 12)
      },
      nextMajorTransition: {
        lord: this._getNextMahadashaLord(mahadasha.lord),
        estimatedDate: mahadasha.endDate
      }
    };
  }

  /**
   * Assess life impact of current Dasha
   * @param {Object} currentDasha - Current Dasha details
   * @returns {Object} Life impact assessment
   */
  _assessLifeImpact(currentDasha) {
    const mahadashaLord = currentDasha.mahadasha.lord.toLowerCase();

    return {
      career: this._getDashaCareerImpact(mahadashaLord),
      relationships: this._getDashaRelationshipImpact(mahadashaLord),
      health: this._getDashaHealthImpact(mahadashaLord),
      finance: this._getDashaFinanceImpact(mahadashaLord),
      spirituality: this._getDashaSpiritualityImpact(mahadashaLord),
      overall: this._getOverallLifeImpact(mahadashaLord)
    };
  }

  /**
   * Generate recommendations for current Dasha
   * @param {Object} currentDasha - Current Dasha details
   * @returns {Array} Recommendations
   */
  _generateRecommendations(currentDasha) {
    const mahadashaLord = currentDasha.mahadasha.lord.toLowerCase();
    const recommendations = [];

    // General recommendations based on planetary lord
    const generalRecs = {
      sun: [
        'Focus on leadership and self-expression',
        'Take initiative in career matters',
        'Work on building confidence and authority'
      ],
      moon: [
        'Nurture emotional well-being',
        'Strengthen family relationships',
        'Pay attention to home and family matters'
      ],
      mars: [
        'Channel energy into productive activities',
        'Be cautious with impulsive actions',
        'Focus on physical health and exercise'
      ],
      mercury: [
        'Enhance communication skills',
        'Pursue learning and intellectual growth',
        'Focus on business and communication activities'
      ],
      jupiter: [
        'Expand spiritually and intellectually',
        'Share wisdom with others',
        'Focus on teaching and mentoring'
      ],
      venus: [
        'Cultivate harmonious relationships',
        'Appreciate beauty and arts',
        'Focus on material comfort and luxury'
      ],
      saturn: [
        'Practice discipline and patience',
        'Focus on long-term goals',
        'Build strong foundations'
      ],
      rahu: [
        'Embrace innovation and change',
        'Explore spiritual dimensions',
        'Be mindful of material ambitions'
      ],
      ketu: [
        'Focus on spiritual liberation',
        'Practice detachment from material desires',
        'Embrace inner peace and contemplation'
      ]
    };

    const planetRecs = generalRecs[mahadashaLord] || [
      'Focus on personal growth and development',
      'Maintain balance in all life areas',
      'Practice mindfulness and self-awareness'
    ];

    recommendations.push(...planetRecs);

    // Time-based recommendations
    if (currentDasha.mahadasha.remainingYears < 2) {
      recommendations.push('Prepare for upcoming major life transition');
      recommendations.push('Complete important projects before Dasha ends');
    }

    return recommendations.slice(0, 6);
  }

  /**
   * Get planetary influence description
   * @param {string} planet - Planet name
   * @returns {string} Planetary influence
   */
  _getPlanetaryInfluence(planet) {
    const influences = {
      sun: 'leadership, authority, confidence, and self-expression',
      moon: 'emotions, intuition, home, and family matters',
      mars: 'energy, action, courage, and physical activities',
      mercury: 'communication, learning, business, and intellectual pursuits',
      jupiter: 'wisdom, expansion, spirituality, and good fortune',
      venus: 'love, beauty, harmony, and material comforts',
      saturn: 'discipline, responsibility, karma, and long-term achievements',
      rahu: 'ambition, innovation, foreign elements, and spiritual growth',
      ketu: 'spirituality, detachment, liberation, and past life karma'
    };

    return influences[planet] || 'general planetary influence';
  }

  /**
   * Analyze Dasha combination effects
   * @param {string} mahadasha - Mahadasha lord
   * @param {string} antardasha - Antardasha lord
   * @returns {string} Combination analysis
   */
  _analyzeDashaCombination(mahadasha, antardasha) {
    if (!mahadasha || !antardasha) {
      return 'balanced planetary combination';
    }

    const combinations = {
      'sun-moon': 'emotional self-expression and leadership',
      'moon-mars': 'emotional energy and protective action',
      'mars-mercury': 'dynamic communication and assertive thinking',
      'mercury-jupiter': 'intellectual expansion and wise communication',
      'jupiter-venus': 'spiritual love and abundant harmony',
      'venus-saturn': 'committed relationships and material stability',
      'saturn-rahu': 'ambitious discipline and spiritual growth',
      'rahu-ketu': 'spiritual transformation and liberation',
      'ketu-sun': 'spiritual leadership and self-realization'
    };

    const key = `${mahadasha}-${antardasha}`.toLowerCase();
    return combinations[key] || 'harmonious planetary combination';
  }

  /**
   * Get Dasha themes
   * @param {string} planet - Planet name
   * @returns {Array} Dasha themes
   */
  _getDashaThemes(planet) {
    const themes = {
      sun: ['Leadership', 'Authority', 'Self-expression', 'Confidence'],
      moon: ['Emotions', 'Family', 'Home', 'Public image'],
      mars: ['Action', 'Energy', 'Courage', 'Competition'],
      mercury: ['Communication', 'Learning', 'Business', 'Travel'],
      jupiter: ['Wisdom', 'Expansion', 'Spirituality', 'Teaching'],
      venus: ['Love', 'Beauty', 'Harmony', 'Material comfort'],
      saturn: ['Discipline', 'Responsibility', 'Karma', 'Achievement'],
      rahu: ['Ambition', 'Innovation', 'Foreign matters', 'Spirituality'],
      ketu: ['Liberation', 'Detachment', 'Spirituality', 'Inner peace']
    };

    return themes[planet] || ['Personal growth', 'Life experience'];
  }

  /**
   * Determine energy pattern
   * @param {string} mahadasha - Mahadasha lord
   * @param {string} antardasha - Antardasha lord
   * @returns {string} Energy pattern
   */
  _determineEnergyPattern(mahadasha, antardasha) {
    const mahaEnergy = this._getEnergyType(mahadasha);
    const antaraEnergy = this._getEnergyType(antardasha);

    if (mahaEnergy === antaraEnergy) {
      return `Strong ${mahaEnergy} energy focus`;
    } else {
      return `Balanced ${mahaEnergy} and ${antaraEnergy} energy combination`;
    }
  }

  /**
   * Get energy type for planet
   * @param {string} planet - Planet name
   * @returns {string} Energy type
   */
  _getEnergyType(planet) {
    const energyTypes = {
      sun: 'leadership',
      moon: 'emotional',
      mars: 'action',
      mercury: 'intellectual',
      jupiter: 'expansive',
      venus: 'harmonious',
      saturn: 'disciplined',
      rahu: 'transformative',
      ketu: 'spiritual'
    };

    return energyTypes[planet] || 'balanced';
  }

  /**
   * Get next Mahadasha lord
   * @param {string} currentLord - Current Mahadasha lord
   * @returns {string} Next Mahadasha lord
   */
  _getNextMahadashaLord(currentLord) {
    const sequence = [
      'Ketu',
      'Venus',
      'Sun',
      'Moon',
      'Mars',
      'Rahu',
      'Jupiter',
      'Saturn',
      'Mercury'
    ];
    const currentIndex = sequence.findIndex(
      lord => lord.toLowerCase() === currentLord.toLowerCase()
    );

    if (currentIndex === -1) {
      return 'Unknown';
    }

    const nextIndex = (currentIndex + 1) % sequence.length;
    return sequence[nextIndex];
  }

  /**
   * Get Dasha career impact
   * @param {string} planet - Planet name
   * @returns {string} Career impact
   */
  _getDashaCareerImpact(planet) {
    const impacts = {
      sun: 'Leadership positions and authoritative roles',
      moon: 'Public-facing careers and family business',
      mars: 'Competitive fields and physical work',
      mercury: 'Communication, business, and intellectual careers',
      jupiter: 'Teaching, counseling, and advisory positions',
      venus: 'Creative and artistic professions',
      saturn: 'Structured careers and long-term positions',
      rahu: 'Innovative and unconventional careers',
      ketu: 'Spiritual and service-oriented work'
    };

    return impacts[planet] || 'Career development and opportunities';
  }

  /**
   * Get Dasha relationship impact
   * @param {string} planet - Planet name
   * @returns {string} Relationship impact
   */
  _getDashaRelationshipImpact(planet) {
    const impacts = {
      sun: 'Leadership in relationships and romantic partnerships',
      moon: 'Emotional connections and family relationships',
      mars: 'Passionate and dynamic relationships',
      mercury: 'Communication-focused relationships',
      jupiter: 'Spiritual and committed partnerships',
      venus: 'Harmonious and loving relationships',
      saturn: 'Stable and long-term relationships',
      rahu: 'Unconventional and transformative relationships',
      ketu: 'Spiritual and karmic relationships'
    };

    return impacts[planet] || 'Relationship development and connections';
  }

  /**
   * Get Dasha health impact
   * @param {string} planet - Planet name
   * @returns {string} Health impact
   */
  _getDashaHealthImpact(planet) {
    const impacts = {
      sun: 'Vitality and heart-related health focus',
      moon: 'Emotional and digestive health',
      mars: 'Energy levels and physical health',
      mercury: 'Nervous system and mental health',
      jupiter: 'Immune system and liver health',
      venus: 'Hormonal balance and sensual health',
      saturn: 'Structural health and chronic conditions',
      rahu: 'Chronic or mysterious health issues',
      ketu: 'Spiritual health and healing practices'
    };

    return impacts[planet] || 'General health and well-being';
  }

  /**
   * Get Dasha finance impact
   * @param {string} planet - Planet name
   * @returns {string} Finance impact
   */
  _getDashaFinanceImpact(planet) {
    const impacts = {
      sun: 'Leadership income and authority-based earnings',
      moon: 'Family wealth and public recognition income',
      mars: 'Competitive earnings and physical work income',
      mercury: 'Business income and communication-based earnings',
      jupiter: 'Spiritual and teaching income',
      venus: 'Artistic and luxury income',
      saturn: 'Stable and long-term financial security',
      rahu: 'Innovative and foreign income sources',
      ketu: 'Spiritual and minimal material income'
    };

    return impacts[planet] || 'Financial stability and growth';
  }

  /**
   * Get Dasha spirituality impact
   * @param {string} planet - Planet name
   * @returns {string} Spirituality impact
   */
  _getDashaSpiritualityImpact(planet) {
    const impacts = {
      sun: 'Self-realization and divine connection',
      moon: 'Intuitive and devotional practices',
      mars: 'Dynamic spiritual practices',
      mercury: 'Intellectual spiritual exploration',
      jupiter: 'Wisdom and philosophical understanding',
      venus: 'Devotional and aesthetic spirituality',
      saturn: 'Disciplined spiritual practices',
      rahu: 'Transformative spiritual experiences',
      ketu: 'Liberation and enlightenment focus'
    };

    return impacts[planet] || 'Spiritual growth and development';
  }

  /**
   * Get overall life impact
   * @param {string} planet - Planet name
   * @returns {string} Overall impact
   */
  _getOverallLifeImpact(planet) {
    const impacts = {
      sun: 'Period of leadership, confidence, and self-expression',
      moon: 'Time of emotional growth and family focus',
      mars: 'Phase of action, energy, and new beginnings',
      mercury: 'Period of learning, communication, and business',
      jupiter: 'Time of expansion, wisdom, and good fortune',
      venus: 'Phase of love, harmony, and material comfort',
      saturn: 'Period of discipline, responsibility, and achievement',
      rahu: 'Time of ambition, innovation, and spiritual growth',
      ketu: 'Phase of liberation, detachment, and inner peace'
    };

    return impacts[planet] || 'Period of personal growth and life experience';
  }

  /**
   * Create comprehensive current Dasha interpretation
   * @param {Object} currentDasha - Current Dasha details
   * @param {Object} dashaInfluence - Dasha influence analysis
   * @returns {string} Complete interpretation
   */
  _createCurrentDashaInterpretation(currentDasha, dashaInfluence) {
    let interpretation = `You are currently in ${currentDasha.mahadasha.lord} Mahadasha with ${currentDasha.antardasha.lord} Antardasha. `;

    interpretation += `This ${currentDasha.mahadasha.totalYears}-year Mahadasha emphasizes ${dashaInfluence.primaryInfluence}. `;

    interpretation += `The ${currentDasha.antardasha.lord} Antardasha brings ${dashaInfluence.secondaryInfluence}, creating ${dashaInfluence.combinedEffect}. `;

    interpretation += `You have approximately ${currentDasha.mahadasha.remainingYears} years remaining in this major period.`;

    return interpretation;
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['execute', 'calculateCurrentDasha'],
      dependencies: ['DashaAnalysisCalculator']
    };
  }

  async processCalculation(data) {
    return await this.lcurrentDashaCalculation(data);
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

module.exports = CurrentDashaService;
