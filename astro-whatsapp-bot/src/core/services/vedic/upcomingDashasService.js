const { DashaAnalysisCalculator } = require('../../services/astrology/vedic/calculators/DashaAnalysisCalculator');
const logger = require('../../../utils/logger');

/**
 * UpcomingDashasService - Service for forecasting future planetary periods
 * Forecasts future planetary periods, providing timing for upcoming life phases and opportunities based on the Vimshottari Dasha sequence
 */
class UpcomingDashasService {
  constructor() {
    this.calculator = new DashaAnalysisCalculator();
    logger.info('UpcomingDashasService initialized');
  }

  /**
   * Execute upcoming Dashas calculation
   * @param {Object} birthData - Birth data for Dasha calculation
   * @param {string} birthData.birthDate - Birth date (DD/MM/YYYY)
   * @param {string} birthData.birthTime - Birth time (HH:MM)
   * @param {string} birthData.birthPlace - Birth place
   * @param {string} birthData.name - Person's name (optional)
   * @param {Object} options - Calculation options
   * @returns {Object} Upcoming Dashas analysis result
   */
  async execute(birthData, options = {}) {
    try {
      // Input validation
      this._validateInput(birthData);

      // Calculate upcoming Dashas
      const result = await this.calculateUpcomingDashas(birthData, options);

      // Format and return result
      return this._formatResult(result);
    } catch (error) {
      logger.error('UpcomingDashasService error:', error);
      throw new Error(`Upcoming Dashas calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate upcoming Dasha periods
   * @param {Object} birthData - Birth data
   * @param {Object} options - Calculation options
   * @returns {Object} Upcoming Dashas analysis
   */
  async calculateUpcomingDashas(birthData, options = {}) {
    try {
      const periodsToShow = options.periods || 5;

      // Get Dasha analysis from calculator
      const dashaAnalysis = await this.calculator.calculateVimshottariDasha(birthData);

      // Extract upcoming Dasha information
      const upcomingDashas = this._extractUpcomingDashas(dashaAnalysis, periodsToShow);

      // Generate additional analysis
      const dashaTimeline = this._createDashaTimeline(upcomingDashas);
      const lifePhases = this._identifyLifePhases(upcomingDashas);
      const preparationGuide = this._createPreparationGuide(upcomingDashas);
      const opportunityWindows = this._identifyOpportunityWindows(upcomingDashas);

      return {
        upcomingDashas,
        dashaTimeline,
        lifePhases,
        preparationGuide,
        opportunityWindows,
        interpretation: this._createUpcomingDashasInterpretation(upcomingDashas, lifePhases)
      };
    } catch (error) {
      logger.error('Upcoming Dashas calculation error:', error);
      throw error;
    }
  }

  /**
   * Extract upcoming Dasha periods
   * @param {Object} dashaAnalysis - Complete Dasha analysis
   * @param {number} periodsToShow - Number of periods to show
   * @returns {Array} Upcoming Dasha periods
   */
  _extractUpcomingDashas(dashaAnalysis, periodsToShow) {
    const upcoming = (dashaAnalysis.upcomingDashas || []).slice(0, periodsToShow);

    return upcoming.map(dasha => ({
      mahadasha: {
        lord: dasha.mahadashaLord || 'Unknown',
        startDate: dasha.startDate || 'Unknown',
        endDate: dasha.endDate || 'Unknown',
        duration: dasha.duration || 0,
        influence: this._getPlanetaryInfluence(dasha.mahadashaLord)
      },
      keyThemes: this._getDashaKeyThemes(dasha.mahadashaLord),
      lifeAreas: this._getDashaLifeAreas(dasha.mahadashaLord),
      challenges: this._getDashaChallenges(dasha.mahadashaLord),
      opportunities: this._getDashaOpportunities(dasha.mahadashaLord),
      preparation: this._getPreparationAdvice(dasha.mahadashaLord)
    }));
  }

  /**
   * Create Dasha timeline
   * @param {Array} upcomingDashas - Upcoming Dasha periods
   * @returns {Object} Dasha timeline
   */
  _createDashaTimeline(upcomingDashas) {
    const timeline = {
      phases: [],
      transitions: [],
      majorShifts: []
    };

    upcomingDashas.forEach((dasha, index) => {
      timeline.phases.push({
        phase: `${dasha.mahadasha.lord} Mahadasha`,
        startDate: dasha.mahadasha.startDate,
        endDate: dasha.mahadasha.endDate,
        duration: dasha.mahadasha.duration,
        theme: dasha.keyThemes[0] || 'Personal development'
      });

      // Identify transitions
      if (index < upcomingDashas.length - 1) {
        timeline.transitions.push({
          from: dasha.mahadasha.lord,
          to: upcomingDashas[index + 1].mahadasha.lord,
          date: upcomingDashas[index + 1].mahadasha.startDate,
          significance: this._assessTransitionSignificance(dasha.mahadasha.lord, upcomingDashas[index + 1].mahadasha.lord)
        });
      }

      // Identify major shifts (Saturn, Rahu, Ketu periods)
      const majorShifters = ['Saturn', 'Rahu', 'Ketu'];
      if (majorShifters.includes(dasha.mahadasha.lord)) {
        timeline.majorShifts.push({
          period: `${dasha.mahadasha.lord} Mahadasha`,
          startDate: dasha.mahadasha.startDate,
          significance: this._getMajorShiftSignificance(dasha.mahadasha.lord)
        });
      }
    });

    return timeline;
  }

  /**
   * Identify life phases from upcoming Dashas
   * @param {Array} upcomingDashas - Upcoming Dasha periods
   * @returns {Object} Life phases analysis
   */
  _identifyLifePhases(upcomingDashas) {
    const phases = {
      growth: [],
      challenge: [],
      stability: [],
      transformation: []
    };

    upcomingDashas.forEach(dasha => {
      const lord = dasha.mahadasha.lord.toLowerCase();
      const phaseInfo = {
        period: `${dasha.mahadasha.lord} Mahadasha`,
        startDate: dasha.mahadasha.startDate,
        duration: dasha.mahadasha.duration,
        focus: dasha.keyThemes[0] || 'Personal development'
      };

      // Categorize by planetary nature
      if (['jupiter', 'venus', 'mercury'].includes(lord)) {
        phases.growth.push(phaseInfo);
      } else if (['saturn', 'mars', 'rahu'].includes(lord)) {
        phases.challenge.push(phaseInfo);
      } else if (['moon', 'sun'].includes(lord)) {
        phases.stability.push(phaseInfo);
      } else if (['ketu'].includes(lord)) {
        phases.transformation.push(phaseInfo);
      }
    });

    return phases;
  }

  /**
   * Create preparation guide for upcoming Dashas
   * @param {Array} upcomingDashas - Upcoming Dasha periods
   * @returns {Object} Preparation guide
   */
  _createPreparationGuide(upcomingDashas) {
    const guide = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
      generalAdvice: []
    };

    // Immediate preparation (next 1-2 periods)
    if (upcomingDashas.length > 0) {
      const nextDasha = upcomingDashas[0];
      guide.immediate = this._getPreparationAdvice(nextDasha.mahadasha.lord);
    }

    // Short-term preparation (next 3-5 periods)
    const shortTermPeriods = upcomingDashas.slice(0, 3);
    guide.shortTerm = shortTermPeriods.flatMap(dasha =>
      this._getPreparationAdvice(dasha.mahadasha.lord).slice(0, 2)
    );

    // Long-term preparation (all periods)
    guide.longTerm = [
      'Develop spiritual practices for inner strength',
      'Build financial stability and emergency reserves',
      'Strengthen important relationships',
      'Focus on health and wellness routines',
      'Pursue knowledge and skill development'
    ];

    guide.generalAdvice = [
      'Maintain regular astrological consultations',
      'Practice mindfulness and self-awareness',
      'Keep a journal of life experiences and lessons',
      'Stay flexible and adaptable to change',
      'Focus on karma yoga (selfless service)'
    ];

    return guide;
  }

  /**
   * Identify opportunity windows
   * @param {Array} upcomingDashas - Upcoming Dasha periods
   * @returns {Array} Opportunity windows
   */
  _identifyOpportunityWindows(upcomingDashas) {
    const opportunities = [];

    upcomingDashas.forEach(dasha => {
      const lord = dasha.mahadasha.lord.toLowerCase();

      if (['jupiter', 'venus'].includes(lord)) {
        opportunities.push({
          period: `${dasha.mahadasha.lord} Mahadasha`,
          startDate: dasha.mahadasha.startDate,
          type: 'Expansion and growth',
          opportunities: dasha.opportunities,
          duration: dasha.mahadasha.duration
        });
      } else if (['mercury', 'sun'].includes(lord)) {
        opportunities.push({
          period: `${dasha.mahadasha.lord} Mahadasha`,
          startDate: dasha.mahadasha.startDate,
          type: 'Achievement and recognition',
          opportunities: dasha.opportunities,
          duration: dasha.mahadasha.duration
        });
      }
    });

    return opportunities.slice(0, 4);
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

    return influences[planet?.toLowerCase()] || 'general planetary influence';
  }

  /**
   * Get Dasha key themes
   * @param {string} planet - Planet name
   * @returns {Array} Key themes
   */
  _getDashaKeyThemes(planet) {
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

    return themes[planet?.toLowerCase()] || ['Personal growth', 'Life experience'];
  }

  /**
   * Get Dasha life areas
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
   * Get Dasha challenges
   * @param {string} planet - Planet name
   * @returns {Array} Challenges
   */
  _getDashaChallenges(planet) {
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
   * Get Dasha opportunities
   * @param {string} planet - Planet name
   * @returns {Array} Opportunities
   */
  _getDashaOpportunities(planet) {
    const opportunities = {
      sun: ['Leadership roles', 'Career advancement', 'Recognition', 'Self-confidence'],
      moon: ['Family harmony', 'Emotional healing', 'Public success', 'Home stability'],
      mars: ['New initiatives', 'Physical strength', 'Competitive success', 'Courage'],
      mercury: ['Learning opportunities', 'Business success', 'Communication skills', 'Travel'],
      jupiter: ['Spiritual growth', 'Wisdom', 'Teaching opportunities', 'Good fortune'],
      venus: ['Love relationships', 'Material comfort', 'Artistic success', 'Harmony'],
      saturn: ['Career stability', 'Discipline development', 'Long-term achievements', 'Respect'],
      rahu: ['Ambition fulfillment', 'Innovation', 'Foreign connections', 'Spiritual awakening'],
      ketu: ['Spiritual liberation', 'Inner peace', 'Detachment from material', 'Enlightenment']
    };

    return opportunities[planet?.toLowerCase()] || ['Personal growth opportunities'];
  }

  /**
   * Get preparation advice for Dasha
   * @param {string} planet - Planet name
   * @returns {Array} Preparation advice
   */
  _getPreparationAdvice(planet) {
    const advice = {
      sun: [
        'Build self-confidence and leadership skills',
        'Focus on physical health and vitality',
        'Prepare for increased responsibility'
      ],
      moon: [
        'Strengthen emotional resilience',
        'Nurture family relationships',
        'Develop public speaking skills'
      ],
      mars: [
        'Channel energy constructively',
        'Practice patience and anger management',
        'Focus on physical fitness'
      ],
      mercury: [
        'Enhance communication skills',
        'Pursue learning opportunities',
        'Develop business acumen'
      ],
      jupiter: [
        'Deepen spiritual practices',
        'Share wisdom with others',
        'Plan for expansion and growth'
      ],
      venus: [
        'Cultivate harmonious relationships',
        'Develop artistic talents',
        'Build material stability'
      ],
      saturn: [
        'Practice discipline and patience',
        'Build strong foundations',
        'Prepare for long-term commitments'
      ],
      rahu: [
        'Embrace change and innovation',
        'Develop spiritual awareness',
        'Be mindful of material ambitions'
      ],
      ketu: [
        'Focus on spiritual liberation',
        'Practice detachment',
        'Seek inner peace'
      ]
    };

    return advice[planet?.toLowerCase()] || [
      'Focus on personal growth',
      'Maintain balance in life',
      'Practice mindfulness'
    ];
  }

  /**
   * Assess transition significance
   * @param {string} from - Current Dasha lord
   * @param {string} to - Next Dasha lord
   * @returns {string} Transition significance
   */
  _assessTransitionSignificance(from, to) {
    const fromLord = from?.toLowerCase();
    const toLord = to?.toLowerCase();

    // Major transitions
    if ((fromLord === 'saturn' && toLord === 'mercury') ||
        (fromLord === 'rahu' && ['jupiter', 'saturn'].includes(toLord))) {
      return 'Major life transition requiring adaptation';
    }

    // Growth transitions
    if ((fromLord === 'venus' && toLord === 'sun') ||
        (fromLord === 'mercury' && toLord === 'ketu')) {
      return 'Transition to new growth phase';
    }

    return 'Natural progression in life phases';
  }

  /**
   * Get major shift significance
   * @param {string} planet - Planet name
   * @returns {string} Shift significance
   */
  _getMajorShiftSignificance(planet) {
    const significances = {
      saturn: 'Period of karma, discipline, and major life lessons',
      rahu: 'Time of transformation, ambition, and spiritual growth',
      ketu: 'Phase of liberation, detachment, and spiritual awakening'
    };

    return significances[planet] || 'Period of significant life change';
  }

  /**
   * Create comprehensive upcoming Dashas interpretation
   * @param {Array} upcomingDashas - Upcoming Dasha periods
   * @param {Object} lifePhases - Life phases analysis
   * @returns {string} Complete interpretation
   */
  _createUpcomingDashasInterpretation(upcomingDashas, lifePhases) {
    if (upcomingDashas.length === 0) {
      return 'No upcoming Dasha periods available for analysis.';
    }

    let interpretation = `Your upcoming Dasha periods show ${upcomingDashas.length} major planetary phases ahead. `;

    const nextDasha = upcomingDashas[0];
    interpretation += `The next major period is ${nextDasha.mahadasha.lord} Mahadasha starting ${nextDasha.mahadasha.startDate}, focusing on ${nextDasha.keyThemes[0] || 'personal development'}. `;

    const growthPhases = lifePhases.growth.length;
    const challengePhases = lifePhases.challenge.length;

    if (growthPhases > challengePhases) {
      interpretation += 'The coming years show more growth-oriented periods than challenges. ';
    } else if (challengePhases > growthPhases) {
      interpretation += 'The coming years include several challenging periods that offer valuable growth opportunities. ';
    } else {
      interpretation += 'The coming years balance growth periods with challenging phases for comprehensive development. ';
    }

    interpretation += 'Each Dasha period brings specific planetary energies that influence different life areas and opportunities.';

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
   * @param {Object} result - Raw upcoming Dashas result
   * @returns {Object} Formatted result
   */
  _formatResult(result) {
    return {
      service: 'Upcoming Dashas Analysis',
      timestamp: new Date().toISOString(),
      upcomingDashas: {
        dashas: result.upcomingDashas,
        timeline: result.dashaTimeline,
        lifePhases: result.lifePhases,
        preparationGuide: result.preparationGuide,
        opportunityWindows: result.opportunityWindows
      },
      interpretation: result.interpretation,
      disclaimer: 'Upcoming Dashas analysis forecasts future planetary period influences. Dasha periods indicate timing of life experiences and karmic influences. Actual experiences depend on individual karma, free will, and complete birth chart analysis.'
    };
  }
}

module.exports = UpcomingDashasService;
