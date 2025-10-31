const { DashaAnalysisCalculator } = require('../../../services/astrology/vedic/calculators/DashaAnalysisCalculator');
const logger = require('../../../utils/logger');

/**
 * VimshottariDashaService - Service for Vimshottari Dasha system analysis
 * Implements the Vimshottari Dasha system to calculate planetary periods, current mahadasha, antardasha, and interpret timing of life events based on Moon's position at birth
 */
class VimshottariDashaService {
  constructor() {
    this.calculator = new DashaAnalysisCalculator();
    logger.info('VimshottariDashaService initialized');
  }

  /**
   * Execute Vimshottari Dasha analysis
   * @param {Object} birthData - Birth data for Dasha calculation
   * @param {string} birthData.birthDate - Birth date (DD/MM/YYYY)
   * @param {string} birthData.birthTime - Birth time (HH:MM)
   * @param {string} birthData.birthPlace - Birth place
   * @param {string} birthData.name - Person's name (optional)
   * @returns {Object} Vimshottari Dasha analysis result
   */
  async execute(birthData) {
    try {
      // Input validation
      this._validateInput(birthData);

      // Get Vimshottari Dasha analysis
      const result = await this.getVimshottariDashaAnalysis(birthData);

      // Format and return result
      return this._formatResult(result);
    } catch (error) {
      logger.error('VimshottariDashaService error:', error);
      throw new Error(`Vimshottari Dasha analysis failed: ${error.message}`);
    }
  }

  /**
   * Get comprehensive Vimshottari Dasha analysis
   * @param {Object} birthData - Birth data
   * @returns {Object} Detailed Dasha analysis
   */
  async getVimshottariDashaAnalysis(birthData) {
    try {
      // Get Dasha analysis from calculator
      const dashaAnalysis = await this.calculator.calculateVimshottariDasha(birthData);

      // Generate additional insights and interpretations
      const currentDasha = this._analyzeCurrentDasha(dashaAnalysis);
      const upcomingDashas = this._analyzeUpcomingDashas(dashaAnalysis);
      const dashaPredictions = this._generateDashaPredictions(dashaAnalysis);
      const lifeCycles = this._identifyLifeCycles(dashaAnalysis);

      return {
        dashaAnalysis,
        currentDasha,
        upcomingDashas,
        dashaPredictions,
        lifeCycles,
        interpretation: this._createDashaInterpretation(dashaAnalysis, currentDasha)
      };
    } catch (error) {
      logger.error('Vimshottari Dasha analysis error:', error);
      throw error;
    }
  }

  /**
   * Analyze current Dasha period
   * @param {Object} dashaAnalysis - Dasha analysis result
   * @returns {Object} Current Dasha analysis
   */
  _analyzeCurrentDasha(dashaAnalysis) {
    const current = dashaAnalysis.currentDasha || {};

    return {
      mahadasha: {
        lord: current.mahadashaLord || 'Unknown',
        startDate: current.mahadashaStart || 'Unknown',
        endDate: current.mahadashaEnd || 'Unknown',
        remaining: current.remainingYears || 0,
        influence: this._getPlanetaryInfluence(current.mahadashaLord)
      },
      antardasha: {
        lord: current.antardashaLord || 'Unknown',
        startDate: current.antardashaStart || 'Unknown',
        endDate: current.antardashaEnd || 'Unknown',
        influence: this._getPlanetaryInfluence(current.antardashaLord),
        combination: this._analyzeDashaCombination(current.mahadashaLord, current.antardashaLord)
      },
      pratyantardasha: {
        lord: current.pratyantardashaLord || 'Unknown',
        influence: this._getPlanetaryInfluence(current.pratyantardashaLord)
      }
    };
  }

  /**
   * Analyze upcoming Dasha periods
   * @param {Object} dashaAnalysis - Dasha analysis result
   * @returns {Array} Upcoming Dasha periods
   */
  _analyzeUpcomingDashas(dashaAnalysis) {
    const upcoming = dashaAnalysis.upcomingDashas || [];

    return upcoming.map(dasha => ({
      mahadasha: dasha.mahadashaLord || 'Unknown',
      startDate: dasha.startDate || 'Unknown',
      endDate: dasha.endDate || 'Unknown',
      duration: dasha.duration || 0,
      influence: this._getPlanetaryInfluence(dasha.mahadashaLord),
      lifeAreas: this._getDashaLifeAreas(dasha.mahadashaLord),
      predictions: this._getDashaPredictions(dasha.mahadashaLord)
    }));
  }

  /**
   * Generate Dasha-based predictions
   * @param {Object} dashaAnalysis - Dasha analysis result
   * @returns {Object} Dasha predictions
   */
  _generateDashaPredictions(dashaAnalysis) {
    const current = dashaAnalysis.currentDasha || {};

    return {
      currentPeriod: {
        general: this._getDashaGeneralPrediction(current.mahadashaLord, current.antardashaLord),
        career: this._getDashaCareerPrediction(current.mahadashaLord),
        relationships: this._getDashaRelationshipPrediction(current.mahadashaLord),
        health: this._getDashaHealthPrediction(current.mahadashaLord),
        finance: this._getDashaFinancePrediction(current.mahadashaLord)
      },
      nextMajor: {
        period: dashaAnalysis.upcomingDashas?.[0]?.mahadashaLord || 'Unknown',
        predictions: this._getDashaPredictions(dashaAnalysis.upcomingDashas?.[0]?.mahadashaLord)
      },
      favorableActivities: this._getFavorableActivities(current.mahadashaLord),
      challengingAreas: this._getChallengingAreas(current.mahadashaLord)
    };
  }

  /**
   * Identify life cycles based on Dasha periods
   * @param {Object} dashaAnalysis - Dasha analysis result
   * @returns {Object} Life cycles analysis
   */
  _identifyLifeCycles(dashaAnalysis) {
    const cycles = {
      currentPhase: this._determineLifePhase(dashaAnalysis.currentDasha?.mahadashaLord),
      upcomingPhases: (dashaAnalysis.upcomingDashas || []).slice(0, 3).map(dasha =>
        this._determineLifePhase(dasha.mahadashaLord)
      ),
      majorTransitions: this._identifyMajorTransitions(dashaAnalysis),
      growthPeriods: this._identifyGrowthPeriods(dashaAnalysis),
      challengePeriods: this._identifyChallengePeriods(dashaAnalysis)
    };

    return cycles;
  }

  /**
   * Get planetary influence description
   * @param {string} planet - Planet name
   * @returns {string} Planetary influence
   */
  _getPlanetaryInfluence(planet) {
    const influences = {
      sun: 'Leadership, authority, confidence, and self-expression',
      moon: 'Emotions, intuition, home, and family matters',
      mars: 'Energy, action, courage, and physical activities',
      mercury: 'Communication, learning, business, and intellectual pursuits',
      jupiter: 'Wisdom, expansion, spirituality, and good fortune',
      venus: 'Love, beauty, harmony, and material comforts',
      saturn: 'Discipline, responsibility, karma, and long-term achievements',
      rahu: 'Ambition, innovation, foreign elements, and spiritual growth',
      ketu: 'Spirituality, detachment, liberation, and past life karma'
    };

    return influences[planet?.toLowerCase()] || 'General planetary influence';
  }

  /**
   * Analyze Dasha combination effects
   * @param {string} mahadasha - Mahadasha lord
   * @param {string} antardasha - Antardasha lord
   * @returns {string} Combination analysis
   */
  _analyzeDashaCombination(mahadasha, antardasha) {
    if (!mahadasha || !antardasha) { return 'General planetary combination'; }

    const combinations = {
      'sun-moon': 'Emotional self-expression and leadership',
      'moon-mars': 'Emotional energy and protective action',
      'mars-mercury': 'Dynamic communication and assertive thinking',
      'mercury-jupiter': 'Intellectual expansion and wise communication',
      'jupiter-venus': 'Spiritual love and abundant harmony',
      'venus-saturn': 'Committed relationships and material stability',
      'saturn-rahu': 'Ambitious discipline and spiritual growth',
      'rahu-ketu': 'Spiritual transformation and liberation',
      'ketu-sun': 'Spiritual leadership and self-realization'
    };

    const key = `${mahadasha}-${antardasha}`.toLowerCase();
    return combinations[key] || 'Harmonious planetary combination';
  }

  /**
   * Get life areas influenced by Dasha
   * @param {string} planet - Planet name
   * @returns {Array} Life areas
   */
  _getDashaLifeAreas(planet) {
    const areas = {
      sun: ['Career', 'Leadership', 'Self-expression', 'Authority'],
      moon: ['Home', 'Family', 'Emotions', 'Mother', 'Public'],
      mars: ['Energy', 'Action', 'Brothers', 'Property', 'Surgery'],
      mercury: ['Communication', 'Business', 'Education', 'Siblings', 'Travel'],
      jupiter: ['Wisdom', 'Spirituality', 'Children', 'Teaching', 'Abroad'],
      venus: ['Love', 'Marriage', 'Beauty', 'Luxury', 'Arts'],
      saturn: ['Career', 'Discipline', 'Elders', 'Real estate', 'Agriculture'],
      rahu: ['Ambition', 'Foreign', 'Innovation', 'Spirituality', 'Technology'],
      ketu: ['Spirituality', 'Detachment', 'Liberation', 'Past life', 'Mysticism']
    };

    return areas[planet?.toLowerCase()] || ['General life areas'];
  }

  /**
   * Get Dasha predictions
   * @param {string} planet - Planet name
   * @returns {Array} Predictions
   */
  _getDashaPredictions(planet) {
    const predictions = {
      sun: ['Leadership opportunities', 'Increased confidence', 'Career advancement', 'Recognition'],
      moon: ['Emotional growth', 'Family matters', 'Public recognition', 'Property acquisition'],
      mars: ['Increased energy', 'New initiatives', 'Competitive activities', 'Physical strength'],
      mercury: ['Learning opportunities', 'Communication skills', 'Business success', 'Travel'],
      jupiter: ['Spiritual growth', 'Wisdom increase', 'Good fortune', 'Teaching opportunities'],
      venus: ['Love and relationships', 'Material comforts', 'Artistic pursuits', 'Marriage'],
      saturn: ['Career stability', 'Discipline development', 'Long-term achievements', 'Responsibility'],
      rahu: ['Ambition fulfillment', 'Foreign connections', 'Innovation', 'Spiritual awakening'],
      ketu: ['Spiritual liberation', 'Detachment from material', 'Past life resolution', 'Inner peace']
    };

    return predictions[planet?.toLowerCase()] || ['General positive developments'];
  }

  /**
   * Get general Dasha prediction
   * @param {string} mahadasha - Mahadasha lord
   * @param {string} antardasha - Antardasha lord
   * @returns {string} General prediction
   */
  _getDashaGeneralPrediction(mahadasha, antardasha) {
    const mahaInfluence = this._getPlanetaryInfluence(mahadasha);
    const antaraInfluence = this._getPlanetaryInfluence(antardasha);

    return `Current period combines ${mahaInfluence.toLowerCase()} with ${antaraInfluence.toLowerCase()}, creating a unique blend of energies for personal growth and life experiences.`;
  }

  /**
   * Get Dasha career prediction
   * @param {string} planet - Planet name
   * @returns {string} Career prediction
   */
  _getDashaCareerPrediction(planet) {
    const predictions = {
      sun: 'Leadership roles and authoritative positions',
      moon: 'Public-facing roles and family business',
      mars: 'Competitive fields and physical work',
      mercury: 'Communication, writing, and business',
      jupiter: 'Teaching, counseling, and advisory roles',
      venus: 'Creative and artistic professions',
      saturn: 'Structured careers and long-term positions',
      rahu: 'Innovative and unconventional careers',
      ketu: 'Spiritual and service-oriented work'
    };

    return predictions[planet?.toLowerCase()] || 'Career development and opportunities';
  }

  /**
   * Get Dasha relationship prediction
   * @param {string} planet - Planet name
   * @returns {string} Relationship prediction
   */
  _getDashaRelationshipPrediction(planet) {
    const predictions = {
      sun: 'Leadership in relationships and romantic partnerships',
      moon: 'Emotional connections and family relationships',
      mars: 'Passionate relationships and physical attraction',
      mercury: 'Communication and intellectual connections',
      jupiter: 'Spiritual partnerships and marriage',
      venus: 'Love, romance, and harmonious relationships',
      saturn: 'Committed relationships and long-term partnerships',
      rahu: 'Unconventional relationships and foreign connections',
      ketu: 'Spiritual relationships and karmic connections'
    };

    return predictions[planet?.toLowerCase()] || 'Relationship development and connections';
  }

  /**
   * Get Dasha health prediction
   * @param {string} planet - Planet name
   * @returns {string} Health prediction
   */
  _getDashaHealthPrediction(planet) {
    const predictions = {
      sun: 'Vitality and heart health focus',
      moon: 'Emotional and digestive health',
      mars: 'Energy levels and physical strength',
      mercury: 'Nervous system and respiratory health',
      jupiter: 'Liver and immune system support',
      venus: 'Hormonal balance and sensual health',
      saturn: 'Structural health and endurance',
      rahu: 'Chronic conditions and innovative treatments',
      ketu: 'Spiritual health and healing practices'
    };

    return predictions[planet?.toLowerCase()] || 'General health and well-being';
  }

  /**
   * Get Dasha finance prediction
   * @param {string} planet - Planet name
   * @returns {string} Finance prediction
   */
  _getDashaFinancePrediction(planet) {
    const predictions = {
      sun: 'Leadership income and authority-based earnings',
      moon: 'Family wealth and public recognition income',
      mars: 'Competitive earnings and physical work income',
      mercury: 'Business income and communication-based earnings',
      jupiter: 'Spiritual and teaching income, fortunate gains',
      venus: 'Artistic income and material comforts',
      saturn: 'Stable income and long-term financial security',
      rahu: 'Innovative income and foreign earnings',
      ketu: 'Spiritual income and detachment from material wealth'
    };

    return predictions[planet?.toLowerCase()] || 'Financial stability and growth';
  }

  /**
   * Get favorable activities for Dasha
   * @param {string} planet - Planet name
   * @returns {Array} Favorable activities
   */
  _getFavorableActivities(planet) {
    const activities = {
      sun: ['Leadership activities', 'Self-expression', 'Creative projects', 'Physical exercise'],
      moon: ['Family activities', 'Emotional healing', 'Home improvement', 'Public speaking'],
      mars: ['Physical activities', 'Competitive sports', 'New initiatives', 'Courageous actions'],
      mercury: ['Learning', 'Communication', 'Business activities', 'Travel', 'Writing'],
      jupiter: ['Spiritual practices', 'Teaching', 'Travel', 'Philanthropy', 'Higher learning'],
      venus: ['Artistic pursuits', 'Romance', 'Luxury activities', 'Social gatherings'],
      saturn: ['Disciplined work', 'Long-term planning', 'Agricultural activities', 'Elder care'],
      rahu: ['Innovation', 'Foreign travel', 'Spiritual exploration', 'Technology work'],
      ketu: ['Meditation', 'Spiritual practices', 'Charitable work', 'Inner contemplation']
    };

    return activities[planet?.toLowerCase()] || ['General positive activities'];
  }

  /**
   * Get challenging areas for Dasha
   * @param {string} planet - Planet name
   * @returns {Array} Challenging areas
   */
  _getChallengingAreas(planet) {
    const challenges = {
      sun: ['Ego conflicts', 'Authority issues', 'Health vitality'],
      moon: ['Emotional instability', 'Family conflicts', 'Public criticism'],
      mars: ['Aggression', 'Accidents', 'Conflicts', 'Impatience'],
      mercury: ['Communication problems', 'Anxiety', 'Learning difficulties'],
      jupiter: ['Over-optimism', 'Excess', 'Legal issues', 'Spiritual bypassing'],
      venus: ['Relationship conflicts', 'Indulgence', 'Financial excess'],
      saturn: ['Depression', 'Delays', 'Restrictions', 'Loneliness'],
      rahu: ['Confusion', 'Addictions', 'Foreign difficulties', 'Spiritual crisis'],
      ketu: ['Detachment issues', 'Identity crisis', 'Past life karma', 'Isolation']
    };

    return challenges[planet?.toLowerCase()] || ['General life challenges'];
  }

  /**
   * Determine life phase based on Dasha
   * @param {string} planet - Planet name
   * @returns {string} Life phase
   */
  _determineLifePhase(planet) {
    const phases = {
      sun: 'Leadership and self-expression phase',
      moon: 'Emotional and family development phase',
      mars: 'Action and energy building phase',
      mercury: 'Learning and communication phase',
      jupiter: 'Expansion and wisdom phase',
      venus: 'Harmony and relationship phase',
      saturn: 'Maturity and responsibility phase',
      rahu: 'Transformation and ambition phase',
      ketu: 'Liberation and spiritual phase'
    };

    return phases[planet?.toLowerCase()] || 'General life development phase';
  }

  /**
   * Identify major transitions
   * @param {Object} dashaAnalysis - Dasha analysis
   * @returns {Array} Major transitions
   */
  _identifyMajorTransitions(dashaAnalysis) {
    const transitions = [];

    if (dashaAnalysis.upcomingDashas) {
      dashaAnalysis.upcomingDashas.slice(0, 2).forEach((dasha, index) => {
        transitions.push({
          transition: `Transition to ${dasha.mahadashaLord} Mahadasha`,
          date: dasha.startDate,
          significance: `Major life shift toward ${this._getPlanetaryInfluence(dasha.mahadashaLord).split(',')[0]} themes`
        });
      });
    }

    return transitions;
  }

  /**
   * Identify growth periods
   * @param {Object} dashaAnalysis - Dasha analysis
   * @returns {Array} Growth periods
   */
  _identifyGrowthPeriods(dashaAnalysis) {
    const growth = [];

    // Jupiter, Venus, and Mercury dashas are generally growth-oriented
    const growthPlanets = ['jupiter', 'venus', 'mercury'];

    if (dashaAnalysis.currentDasha) {
      const currentLord = dashaAnalysis.currentDasha.mahadashaLord?.toLowerCase();
      if (growthPlanets.includes(currentLord)) {
        growth.push({
          period: 'Current Mahadasha',
          type: 'Spiritual and material growth',
          focus: this._getPlanetaryInfluence(currentLord)
        });
      }
    }

    if (dashaAnalysis.upcomingDashas) {
      dashaAnalysis.upcomingDashas.forEach(dasha => {
        const lord = dasha.mahadashaLord?.toLowerCase();
        if (growthPlanets.includes(lord)) {
          growth.push({
            period: `${dasha.mahadashaLord} Mahadasha`,
            startDate: dasha.startDate,
            type: 'Expansion and development',
            focus: this._getPlanetaryInfluence(lord)
          });
        }
      });
    }

    return growth.slice(0, 3);
  }

  /**
   * Identify challenge periods
   * @param {Object} dashaAnalysis - Dasha analysis
   * @returns {Array} Challenge periods
   */
  _identifyChallengePeriods(dashaAnalysis) {
    const challenges = [];

    // Saturn, Mars, and Rahu dashas can be challenging
    const challengePlanets = ['saturn', 'mars', 'rahu'];

    if (dashaAnalysis.currentDasha) {
      const currentLord = dashaAnalysis.currentDasha.mahadashaLord?.toLowerCase();
      if (challengePlanets.includes(currentLord)) {
        challenges.push({
          period: 'Current Mahadasha',
          type: 'Growth through challenges',
          focus: `Developing ${this._getPlanetaryInfluence(currentLord).split(',')[0].toLowerCase()} qualities`
        });
      }
    }

    if (dashaAnalysis.upcomingDashas) {
      dashaAnalysis.upcomingDashas.forEach(dasha => {
        const lord = dasha.mahadashaLord?.toLowerCase();
        if (challengePlanets.includes(lord)) {
          challenges.push({
            period: `${dasha.mahadashaLord} Mahadasha`,
            startDate: dasha.startDate,
            type: 'Transformation through difficulty',
            focus: `Building ${this._getPlanetaryInfluence(lord).split(',')[0].toLowerCase()} strength`
          });
        }
      });
    }

    return challenges.slice(0, 3);
  }

  /**
   * Create comprehensive Dasha interpretation
   * @param {Object} dashaAnalysis - Dasha analysis
   * @param {Object} currentDasha - Current Dasha analysis
   * @returns {string} Complete interpretation
   */
  _createDashaInterpretation(dashaAnalysis, currentDasha) {
    let interpretation = `Your current Vimshottari Dasha period is ${currentDasha.mahadasha.lord} Mahadasha with ${currentDasha.antardasha.lord} Antardasha. `;

    interpretation += `This ${currentDasha.mahadasha.remaining}-year Mahadasha focuses on ${currentDasha.mahadasha.influence.toLowerCase()}. `;

    interpretation += `The ${currentDasha.antardasha.lord} Antardasha brings ${currentDasha.antardasha.influence.toLowerCase()}, creating ${currentDasha.antardasha.combination.toLowerCase()}. `;

    interpretation += 'The Vimshottari Dasha system reveals the timing of life experiences and karmic influences.';

    return interpretation;
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
   * @param {Object} result - Raw Dasha result
   * @returns {Object} Formatted result
   */
  _formatResult(result) {
    return {
      service: 'Vimshottari Dasha Analysis',
      timestamp: new Date().toISOString(),
      dasha: {
        analysis: result.dashaAnalysis,
        currentDasha: result.currentDasha,
        upcomingDashas: result.upcomingDashas,
        dashaPredictions: result.dashaPredictions,
        lifeCycles: result.lifeCycles
      },
      interpretation: result.interpretation,
      disclaimer: 'Vimshottari Dasha analysis reveals planetary period influences on life timing and experiences. Dasha periods indicate when certain planetary energies are activated. Complete astrological analysis considers the entire birth chart for comprehensive understanding.'
    };
  }
}

module.exports = VimshottariDashaService;
