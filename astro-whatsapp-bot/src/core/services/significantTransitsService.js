const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');

/**
 * SignificantTransitsService - Service for analyzing significant planetary transits
 *
 * Provides analysis of major planetary transits that have significant impact on natal charts
 * using Swiss Ephemeris integration for precise astronomical calculations.
 */
class SignificantTransitsService extends ServiceTemplate {
  constructor() {
    super('SignificantTransitsCalculator');
    this.serviceName = 'SignificantTransitsService';
    this.calculatorPath = './calculators/SignificantTransitsCalculator';
    logger.info('SignificantTransitsService initialized');
  }

  async processCalculation(birthData, targetDate = null) {
    try {
      // Analyze significant transits to natal chart
      const result = await this.calculator.analyzeSignificantTransits(
        birthData,
        targetDate
      );
      return result;
    } catch (error) {
      logger.error('SignificantTransitsService calculation error:', error);
      throw new Error(`Significant transits analysis failed: ${error.message}`);
    }
  }

  formatResult(result) {
    return {
      success: true,
      service: 'Vedic Significant Transits Analysis',
      timestamp: new Date().toISOString(),
      data: result,
      disclaimer:
        'Significant transit analysis shows major planetary influences on your natal chart. These indicate important life transitions and major events. Complete astrological analysis considers the entire birth chart.'
    };
  }

  validate(birthData) {
    if (!birthData) {
      throw new Error('Birth data is required');
    }
    const { BirthData } = require('../../models/BirthData');
    const validatedData = new BirthData(birthData);
    validatedData.validate();
  }

  /**
   * Get currently significant transiting planets
   * @param {string} targetDate - Specific date (optional, defaults to today)
   * @returns {Promise<Object>} Currently significant transiting planets
   */
  async getCurrentSignificantTransits(targetDate = null) {
    try {
      const result = await this.calculator.calculateCurrentSignificantTransits(targetDate);

      return {
        transits: result,
        date: targetDate || new Date().toISOString().split('T')[0],
        error: false
      };
    } catch (error) {
      logger.error('SignificantTransitsService getCurrentSignificantTransits error:', error);
      return {
        error: true,
        message: 'Error calculating current significant planetary positions'
      };
    }
  }

  /**
   * Get major transit influences for specific life areas
   * @param {Object} birthData - Birth data
   * @param {string} targetDate - Target date for analysis
   * @returns {Promise<Object>} Transit influences by life area
   */
  async getMajorTransitInfluences(birthData, targetDate = null) {
    try {
      this._validateInput(birthData);

      const transitAnalysis = await this.calculator.analyzeSignificantTransits(
        birthData,
        targetDate
      );

      return {
        influences: {
          career: this._analyzeCareerTransits(transitAnalysis),
          relationships: this._analyzeRelationshipTransits(transitAnalysis),
          finance: this._analyzeFinancialTransits(transitAnalysis),
          health: this._analyzeHealthTransits(transitAnalysis),
          spiritual: this._analyzeSpiritualTransits(transitAnalysis)
        },
        overallIntensity: this._calculateOverallIntensity(transitAnalysis),
        date: targetDate || new Date().toISOString().split('T')[0],
        error: false
      };
    } catch (error) {
      logger.error('SignificantTransitsService getMajorTransitInfluences error:', error);
      return {
        error: true,
        message: 'Error analyzing major transit influences'
      };
    }
  }

  /**
   * Get upcoming significant transits
   * @param {Object} birthData - Birth data
   * @param {number} daysAhead - Number of days to look ahead (default 90)
   * @returns {Promise<Object>} Upcoming significant transits
   */
  async getUpcomingSignificantTransits(birthData, daysAhead = 90) {
    try {
      this._validateInput(birthData);

      const significantTransits = [];
      const today = new Date();

      // Check each day for significant transits
      for (let i = 0; i < daysAhead; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);

        const dateStr = `${checkDate.getDate()}/${checkDate.getMonth() + 1}/${checkDate.getFullYear()}`;
        const transitAnalysis = await this.calculator.analyzeSignificantTransits(
          birthData,
          dateStr
        );

        const significant = this._identifySignificantTransits(
          transitAnalysis,
          dateStr
        );
        if (significant.length > 0) {
          significantTransits.push({
            date: dateStr,
            transits: significant
          });
        }
      }

      return {
        significantTransits,
        period: `${daysAhead} days ahead`,
        error: false
      };
    } catch (error) {
      logger.error(
        'SignificantTransitsService getUpcomingSignificantTransits error:',
        error
      );
      return {
        error: true,
        message: 'Error finding upcoming significant transits'
      };
    }
  }

  /**
   * Analyze career-related major transits
   * @param {Object} transitAnalysis - Transit analysis result
   * @returns {Object} Career transit analysis
   * @private
   */
  _analyzeCareerTransits(transitAnalysis) {
    // Analyze transits to 10th house, MC, Saturn, Jupiter, Sun
    const careerPlanets = ['Saturn', 'Jupiter', 'Sun', 'Mars', 'Mercury'];
    const careerInfluences = [];

    if (transitAnalysis.aspects) {
      transitAnalysis.aspects.forEach(aspect => {
        if (
          careerPlanets.includes(aspect.transitingPlanet) ||
          careerPlanets.includes(aspect.natalPlanet)
        ) {
          careerInfluences.push({
            aspect: `${aspect.transitingPlanet} ${aspect.aspect} ${aspect.natalPlanet}`,
            influence: this._getCareerInfluence(aspect),
            intensity: aspect.orb < 2 ? 'strong' : 'moderate'
          });
        }
      });
    }

    return {
      influences: careerInfluences,
      summary:
        careerInfluences.length > 0 ?
          'Active career transits indicate changes and opportunities in professional life' :
          'Stable career period with gradual development'
    };
  }

  /**
   * Analyze relationship-related major transits
   * @param {Object} transitAnalysis - Transit analysis result
   * @returns {Object} Relationship transit analysis
   * @private
   */
  _analyzeRelationshipTransits(transitAnalysis) {
    // Analyze transits to 7th house, Venus, Moon, Jupiter
    const relationshipPlanets = ['Venus', 'Moon', 'Jupiter', 'Sun', 'Mars'];
    const relationshipInfluences = [];

    if (transitAnalysis.aspects) {
      transitAnalysis.aspects.forEach(aspect => {
        if (
          relationshipPlanets.includes(aspect.transitingPlanet) ||
          relationshipPlanets.includes(aspect.natalPlanet)
        ) {
          relationshipInfluences.push({
            aspect: `${aspect.transitingPlanet} ${aspect.aspect} ${aspect.natalPlanet}`,
            influence: this._getRelationshipInfluence(aspect),
            intensity: aspect.orb < 2 ? 'strong' : 'moderate'
          });
        }
      });
    }

    return {
      influences: relationshipInfluences,
      summary:
        relationshipInfluences.length > 0 ?
          'Active relationship transits suggest changes in partnerships and connections' :
          'Stable relationship period with harmonious developments'
    };
  }

  /**
   * Analyze financial major transits
   * @param {Object} transitAnalysis - Transit analysis result
   * @returns {Object} Financial transit analysis
   * @private
   */
  _analyzeFinancialTransits(transitAnalysis) {
    // Analyze transits to 2nd house, Jupiter, Venus
    const financePlanets = ['Jupiter', 'Venus', 'Saturn', 'Moon', 'Mercury'];
    const financeInfluences = [];

    if (transitAnalysis.aspects) {
      transitAnalysis.aspects.forEach(aspect => {
        if (
          financePlanets.includes(aspect.transitingPlanet) ||
          financePlanets.includes(aspect.natalPlanet)
        ) {
          financeInfluences.push({
            aspect: `${aspect.transitingPlanet} ${aspect.aspect} ${aspect.natalPlanet}`,
            influence: this._getFinanceInfluence(aspect),
            intensity: aspect.orb < 2 ? 'strong' : 'moderate'
          });
        }
      });
    }

    return {
      influences: financeInfluences,
      summary:
        financeInfluences.length > 0 ?
          'Active financial transits indicate changes in wealth and resources' :
          'Stable financial period with steady growth'
    };
  }

  /**
   * Analyze health-related major transits
   * @param {Object} transitAnalysis - Transit analysis result
   * @returns {Object} Health transit analysis
   * @private
   */
  _analyzeHealthTransits(transitAnalysis) {
    // Analyze transits to 6th house, Mars, Saturn, Sun
    const healthPlanets = ['Mars', 'Saturn', 'Sun', 'Moon', 'Mercury'];
    const healthInfluences = [];

    if (transitAnalysis.aspects) {
      transitAnalysis.aspects.forEach(aspect => {
        if (
          healthPlanets.includes(aspect.transitingPlanet) ||
          healthPlanets.includes(aspect.natalPlanet)
        ) {
          healthInfluences.push({
            aspect: `${aspect.transitingPlanet} ${aspect.aspect} ${aspect.natalPlanet}`,
            influence: this._getHealthInfluence(aspect),
            intensity: aspect.orb < 2 ? 'strong' : 'moderate'
          });
        }
      });
    }

    return {
      influences: healthInfluences,
      summary:
        healthInfluences.length > 0 ?
          'Active health transits suggest focus on well-being and vitality' :
          'Generally stable health period'
    };
  }

  /**
   * Analyze spiritual major transits
   * @param {Object} transitAnalysis - Transit analysis result
   * @returns {Object} Spiritual transit analysis
   * @private
   */
  _analyzeSpiritualTransits(transitAnalysis) {
    // Analyze transits to 9th house, Jupiter, Neptune, Pluto
    const spiritualPlanets = ['Jupiter', 'Saturn', 'Moon', 'Sun', 'Mercury'];
    const spiritualInfluences = [];

    if (transitAnalysis.aspects) {
      transitAnalysis.aspects.forEach(aspect => {
        if (
          spiritualPlanets.includes(aspect.transitingPlanet) ||
          spiritualPlanets.includes(aspect.natalPlanet)
        ) {
          spiritualInfluences.push({
            aspect: `${aspect.transitingPlanet} ${aspect.aspect} ${aspect.natalPlanet}`,
            influence: this._getSpiritualInfluence(aspect),
            intensity: aspect.orb < 2 ? 'strong' : 'moderate'
          });
        }
      });
    }

    return {
      influences: spiritualInfluences,
      summary:
        spiritualInfluences.length > 0 ?
          'Active spiritual transits indicate growth and inner development' :
          'Period of spiritual stability and integration'
    };
  }

  /**
   * Calculate overall transit intensity
   * @param {Object} transitAnalysis - Transit analysis result
   * @returns {string} Overall intensity level
   * @private
   */
  _calculateOverallIntensity(transitAnalysis) {
    const aspectCount = transitAnalysis.aspects?.length || 0;
    const strongAspects =
      transitAnalysis.aspects?.filter(a => a.orb < 2).length || 0;

    if (strongAspects > 3) {
      return 'high';
    }
    if (aspectCount > 5) {
      return 'moderate';
    }
    return 'low';
  }

  /**
   * Identify significant transits
   * @param {Object} transitAnalysis - Transit analysis result
   * @param {string} date - Date of analysis
   * @returns {Array} Significant transits
   * @private
   */
  _identifySignificantTransits(transitAnalysis, date) {
    const significant = [];

    if (transitAnalysis.aspects) {
      transitAnalysis.aspects.forEach(aspect => {
        if (aspect.orb < 1) {
          // Very tight aspects
          significant.push({
            aspect: `${aspect.transitingPlanet} ${aspect.aspect} ${aspect.natalPlanet}`,
            orb: aspect.orb,
            significance: this._getAspectSignificance(aspect)
          });
        }
      });
    }

    return significant;
  }

  // Helper methods for influence analysis
  _getCareerInfluence(aspect) {
    return 'Career development and professional changes';
  }
  _getRelationshipInfluence(aspect) {
    return 'Relationship dynamics and partnerships';
  }
  _getFinanceInfluence(aspect) {
    return 'Financial opportunities and wealth changes';
  }
  _getHealthInfluence(aspect) {
    return 'Health focus and vitality changes';
  }
  _getSpiritualInfluence(aspect) {
    return 'Spiritual growth and inner development';
  }
  _getAspectSignificance(aspect) {
    return 'Significant astrological influence';
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: [
        'execute',
        'getCurrentSignificantTransits',
        'getMajorTransitInfluences',
        'getUpcomingSignificantTransits'
      ],
      dependencies: ['SignificantTransitsCalculator']
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

module.exports = SignificantTransitsService;
