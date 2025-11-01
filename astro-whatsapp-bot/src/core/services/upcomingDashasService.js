const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');
const { BirthData } = require('../../models');

/**
 * UpcomingDashasService - Service for forecasting future planetary periods
 *
 * Forecasts future planetary periods, providing timing for upcoming life phases and opportunities
 * based on the Vimshottari Dasha sequence.
 */
class UpcomingDashasService extends ServiceTemplate {
  constructor() {
    super('ChartGenerator'); // Primary calculator for this service
    this.serviceName = 'UpcomingDashasService';
    this.calculatorPath =
      '../../../services/astrology/vedic/calculators/DashaAnalysisCalculator';
    logger.info('UpcomingDashasService initialized');
  }

  /**
   * Main calculation method for Upcoming Dashas.
   * @param {Object} birthData - Birth data for Dasha calculation.
   * @param {Object} [options] - Calculation options.
   * @returns {Promise<Object>} Upcoming Dashas analysis result.
   */
  async processCalculation(birthData, options = {}) {
    try {
      this._validateInput(birthData);

      const periodsToShow = options.periods || 5;

      // Get Dasha analysis from calculator
      const dashaAnalysis =
        await this.calculator.calculateVimshottariDasha(birthData);

      // Extract upcoming Dasha information
      const upcomingDashas = this._extractUpcomingDashas(
        dashaAnalysis,
        periodsToShow
      );

      // Generate additional analysis
      const dashaTimeline = this._createDashaTimeline(upcomingDashas);
      const lifePhases = this._identifyLifePhases(upcomingDashas);
      const preparationGuide = this._createPreparationGuide(upcomingDashas);
      const opportunityWindows =
        this._identifyOpportunityWindows(upcomingDashas);

      return {
        upcomingDashas,
        dashaTimeline,
        lifePhases,
        preparationGuide,
        opportunityWindows,
        interpretation: this._createUpcomingDashasInterpretation(
          upcomingDashas,
          lifePhases
        )
      };
    } catch (error) {
      logger.error('UpcomingDashasService processCalculation error:', error);
      throw new Error(`Upcoming Dashas calculation failed: ${error.message}`);
    }
  }

  /**
   * Validates input data for upcoming Dashas calculation.
   * @param {Object} input - Input data to validate.
   * @private
   */
  _validateInput(input) {
    if (!input) {
      throw new Error('Birth data is required for Upcoming Dashas analysis.');
    }
    const validatedData = new BirthData(input);
    validatedData.validate();
  }

  /**
   * Formats the upcoming Dashas result for consistent output.
   * @param {Object} result - Raw upcoming Dashas result.
   * @returns {Object} Formatted result.
   */
  formatResult(result) {
    return {
      success: true,
      data: result,
      summary: result.interpretation,
      metadata: {
        serviceName: this.serviceName,
        calculationType: 'Upcoming Dashas Analysis',
        timestamp: new Date().toISOString()
      },
      disclaimer:
        'Upcoming Dashas analysis forecasts future planetary period influences. Dasha periods indicate timing of life experiences and karmic influences. Actual experiences depend on individual karma, free will, and complete birth chart analysis.'
    };
  }

  /**
   * Extracts upcoming Dasha periods.
   * @param {Object} dashaAnalysis - Complete Dasha analysis.
   * @param {number} periodsToShow - Number of periods to show.
   * @returns {Array} Upcoming Dasha periods.
   * @private
   */
  _extractUpcomingDashas(dashaAnalysis, periodsToShow) {
    const upcoming = (dashaAnalysis.upcomingDashas || []).slice(
      0,
      periodsToShow
    );

    return upcoming.map(dasha => ({
      mahadasha: {
        lord: dasha.mahadashaLord || 'Unknown',
        startDate: dasha.startDate || 'Unknown',
        endDate: dasha.endDate || 'Unknown',
        duration: dasha.duration || 0,
        remainingYears: dasha.remainingYears || 0,
        elapsedYears: dasha.elapsedYears || 0,
        totalYears: dasha.totalYears || 0,
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
   * Creates Dasha timeline.
   * @param {Array} upcomingDashas - Upcoming Dasha periods.
   * @returns {Object} Dasha timeline.
   * @private
   */
  _createDashaTimeline(upcomingDashas) {
    const timeline = { phases: [], transitions: [], majorShifts: [] };

    upcomingDashas.forEach((dasha, index) => {
      timeline.phases.push({
        phase: `${dasha.mahadasha.lord} Mahadasha`,
        startDate: dasha.mahadasha.startDate,
        endDate: dasha.mahadasha.endDate,
        duration: dasha.mahadasha.duration,
        theme: dasha.keyThemes[0] || 'Personal development'
      });

      if (index < upcomingDashas.length - 1) {
        timeline.transitions.push({
          from: dasha.mahadasha.lord,
          to: upcomingDashas[index + 1].mahadasha.lord,
          date: upcomingDashas[index + 1].mahadasha.startDate,
          significance: this._assessTransitionSignificance(
            dasha.mahadasha.lord,
            upcomingDashas[index + 1].mahadasha.lord
          )
        });
      }

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
   * Identifies life phases from upcoming Dashas.
   * @param {Array} upcomingDashas - Upcoming Dasha periods.
   * @returns {Object} Life phases analysis.
   * @private
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
   * Creates preparation guide for upcoming Dashas.
   * @param {Array} upcomingDashas - Upcoming Dasha periods.
   * @returns {Object} Preparation guide.
   * @private
   */
  _createPreparationGuide(upcomingDashas) {
    const guide = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
      generalAdvice: []
    };

    if (upcomingDashas.length > 0) {
      const nextDasha = upcomingDashas[0];
      guide.immediate = this._getPreparationAdvice(nextDasha.mahadasha.lord);
    }

    const shortTermPeriods = upcomingDashas.slice(0, 3);
    guide.shortTerm = shortTermPeriods.flatMap(dasha =>
      this._getPreparationAdvice(dasha.mahadasha.lord).slice(0, 2)
    );

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
   * Identifies opportunity windows.
   * @param {Array} upcomingDashas - Upcoming Dasha periods.
   * @returns {Array} Opportunity windows.
   * @private
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
   * Gets planetary influence description.
   * @param {string} planet - Planet name.
   * @returns {string} Planetary influence.
   * @private
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
   * Gets Dasha key themes.
   * @param {string} planet - Planet name.
   * @returns {Array} Key themes.
   * @private
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
    return (
      themes[planet?.toLowerCase()] || ['Personal growth', 'Life experience']
    );
  }

  /**
   * Gets Dasha life areas.
   * @param {string} planet - Planet name.
   * @returns {Array} Life areas.
   * @private
   */
  _getDashaLifeAreas(planet) {
    const areas = {
      sun: ['Career', 'Leadership', 'Self-expression', 'Authority'],
      moon: ['Home', 'Family', 'Emotions', 'Mother', 'Public'],
      mars: ['Energy', 'Action', 'Brothers', 'Property', 'Surgery'],
      mercury: ['Communication', 'Education', 'Business', 'Siblings', 'Travel'],
      jupiter: ['Wisdom', 'Wealth', 'Children', 'Teaching', 'Abroad'],
      venus: ['Love', 'Marriage', 'Beauty', 'Luxury', 'Arts'],
      saturn: ['Career', 'Discipline', 'Elders', 'Real estate', 'Agriculture'],
      rahu: [
        'Ambition',
        'Foreign',
        'Innovation',
        'Technology',
        'Unconventional'
      ],
      ketu: [
        'Spirituality',
        'Detachment',
        'Liberation',
        'Past life',
        'Mysticism'
      ]
    };
    return areas[planet?.toLowerCase()] || ['General life areas'];
  }

  /**
   * Gets Dasha challenges.
   * @param {string} planet - Planet name.
   * @returns {Array} Challenges.
   * @private
   */
  _getDashaChallenges(planet) {
    const challenges = {
      sun: ['Ego conflicts', 'Authority issues', 'Health vitality'],
      moon: ['Emotional instability', 'Family conflicts', 'Public criticism'],
      mars: ['Aggression', 'Accidents', 'Conflicts', 'Impatience'],
      mercury: ['Communication problems', 'Anxiety', 'Learning difficulties'],
      jupiter: [
        'Over-optimism',
        'Excess',
        'Legal issues',
        'Spiritual bypassing'
      ],
      venus: ['Relationship conflicts', 'Indulgence', 'Financial excess'],
      saturn: ['Depression', 'Delays', 'Restrictions', 'Loneliness'],
      rahu: [
        'Confusion',
        'Addictions',
        'Foreign difficulties',
        'Spiritual crisis'
      ],
      ketu: [
        'Detachment issues',
        'Identity crisis',
        'Past life karma',
        'Isolation'
      ]
    };
    return challenges[planet?.toLowerCase()] || ['General life challenges'];
  }

  /**
   * Gets Dasha opportunities.
   * @param {string} planet - Planet name.
   * @returns {Array} Opportunities.
   * @private
   */
  _getDashaOpportunities(planet) {
    const opportunities = {
      sun: [
        'Leadership roles',
        'Career advancement',
        'Recognition',
        'Self-confidence'
      ],
      moon: [
        'Family harmony',
        'Emotional healing',
        'Public success',
        'Home stability'
      ],
      mars: [
        'New initiatives',
        'Physical strength',
        'Competitive success',
        'Courage'
      ],
      mercury: [
        'Learning opportunities',
        'Business success',
        'Communication skills',
        'Travel'
      ],
      jupiter: [
        'Spiritual growth',
        'Wisdom',
        'Teaching opportunities',
        'Good fortune'
      ],
      venus: [
        'Love relationships',
        'Material comfort',
        'Artistic success',
        'Harmony'
      ],
      saturn: [
        'Career stability',
        'Discipline development',
        'Long-term achievements',
        'Respect'
      ],
      rahu: [
        'Ambition fulfillment',
        'Innovation',
        'Foreign connections',
        'Spiritual awakening'
      ],
      ketu: [
        'Spiritual liberation',
        'Inner peace',
        'Detachment from material',
        'Enlightenment'
      ]
    };
    return (
      opportunities[planet?.toLowerCase()] || ['Personal growth opportunities']
    );
  }

  /**
   * Gets preparation advice for Dasha.
   * @param {string} planet - Planet name.
   * @returns {Array} Preparation advice.
   * @private
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
        'Channel energy into productive activities',
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
    return (
      advice[planet?.toLowerCase()] || [
        'Focus on personal growth',
        'Maintain balance in life',
        'Practice mindfulness'
      ]
    );
  }

  /**
   * Assesses transition significance.
   * @param {string} from - Current Dasha lord.
   * @param {string} to - Next Dasha lord.
   * @returns {string} Transition significance.
   * @private
   */
  _assessTransitionSignificance(from, to) {
    const fromLord = from?.toLowerCase();
    const toLord = to?.toLowerCase();

    if (
      (fromLord === 'saturn' && toLord === 'mercury') ||
      (fromLord === 'rahu' && ['jupiter', 'saturn'].includes(toLord))
    ) {
      return 'Major life transition requiring adaptation';
    }
    if (
      (fromLord === 'venus' && toLord === 'sun') ||
      (fromLord === 'mercury' && toLord === 'ketu')
    ) {
      return 'Transition to new growth phase';
    }
    return 'Natural progression in life phases';
  }

  /**
   * Gets major shift significance.
   * @param {string} planet - Planet name.
   * @returns {string} Shift significance.
   * @private
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
   * Creates comprehensive upcoming Dashas interpretation.
   * @param {Array} upcomingDashas - Upcoming Dasha periods.
   * @param {Object} lifePhases - Life phases analysis.
   * @returns {string} Complete interpretation.
   * @private
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
      interpretation +=
        'The coming years show more growth-oriented periods than challenges. ';
    } else if (challengePhases > growthPhases) {
      interpretation +=
        'The coming years include several challenging periods that offer valuable growth opportunities. ';
    } else {
      interpretation +=
        'The coming years balance growth periods with challenging phases for comprehensive development. ';
    }

    interpretation +=
      'Each Dasha period brings specific planetary energies that influence different life areas and opportunities.';
    return interpretation;
  }

  /**
   * Returns metadata for the service.
   * @returns {Object} Service metadata.
   */
  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: [
        'processCalculation',
        'getUpcomingDashas',
        'getDashaTimeline',
        'getLifePhases',
        'getPreparationGuide',
        'getOpportunityWindows'
      ],
      dependencies: [], // Managed by ServiceTemplate
      description:
        'Service for forecasting future planetary periods based on Vimshottari Dasha.'
    };
  }

  /**
   * Returns help information for the service.
   * @returns {string} Help text.
   */
  getHelp() {
    return `
⏳ **Upcoming Dashas Service - Future Planetary Periods Forecast**

**Purpose:** Forecasts future planetary periods (Dashas), providing timing for upcoming life phases and opportunities based on the Vimshottari Dasha sequence.

**Required Inputs:**
• Birth data (Object with birthDate, birthTime, birthPlace)

**Analysis Includes:**
• **Upcoming Mahadashas:** Details of future major planetary periods.
• **Dasha Timeline:** A chronological overview of your life's planetary influences.
• **Life Phases:** Identification of growth, challenge, stability, and transformation periods.
• **Preparation Guide:** Recommendations for navigating each Dasha period.
• **Opportunity Windows:** Highlighting favorable times for new initiatives.
• **Comprehensive Interpretation:** Insights into the themes and influences of each upcoming Dasha.

**Example Usage:**
"Show my upcoming Dasha periods for the next 10 years."
"What are the life phases indicated by my future Dashas?"

**Output Format:**
Detailed report with Dasha forecasts, timelines, life phase analysis, and preparation guidance.
    `.trim();
  }
}

module.exports = UpcomingDashasService;
