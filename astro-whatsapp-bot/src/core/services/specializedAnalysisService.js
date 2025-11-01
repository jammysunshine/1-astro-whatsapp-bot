const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');
const AshtakavargaCalculator = require('./calculators/AshtakavargaCalculator');
const VargaChartCalculator = require('./calculators/VargaChartCalculator');
const VedicYogasCalculator = require('./calculators/VedicYogasCalculator');
const ShadbalaCalculator = require('./calculators/ShadbalaCalculator');

class SpecializedAnalysisService extends ServiceTemplate {
  constructor() {
    super('AshtakavargaCalculator'); // Primary calculator for this service
    this.calculatorPath = './calculators/AshtakavargaCalculator';
    this.serviceName = 'SpecializedAnalysisService';
    logger.log('SpecializedAnalysisService initialized');
  }

  async lspecializedAnalysisCalculation(analysisData) {
    try {
      // Get comprehensive specialized analysis
      const result = await this.getSpecializedAnalysis(analysisData);
      return result;
    } catch (error) {
      logger.error('SpecializedAnalysisService calculation error:', error);
      throw new Error(`Specialized analysis failed: ${error.message}`);
    }
  }

  formatResult(result) {
    return {
      success: true,
      service: 'Specialized Vedic Analysis',
      timestamp: new Date().toISOString(),
      data: result,
      disclaimer:
        '⚠️ *Specialized Analysis Disclaimer:* This advanced Vedic analysis requires deep astrological knowledge to interpret correctly. Results should be discussed with qualified Vedic astrologers for proper understanding and application.'
    };
  }

  validate(analysisData) {
    if (!analysisData) {
      throw new Error('Analysis data is required');
    }

    if (!analysisData.birthData) {
      throw new Error('Birth data is required for specialized analysis');
    }

    const { birthData } = analysisData;

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
    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!dateRegex.test(birthData.birthDate)) {
      throw new Error('Birth date must be in DD/MM/YYYY format');
    }

    // Validate time format
    const timeRegex = /^\d{1,2}:\d{1,2}$/;
    if (!timeRegex.test(birthData.birthTime)) {
      throw new Error('Birth time must be in HH:MM format');
    }

    return true;
  }

  /**
   * Get comprehensive specialized analysis
   * @param {Object} analysisData - Analysis data including birth chart and analysis type
   * @returns {Promise<Object>} Specialized analysis
   */
  async getSpecializedAnalysis(analysisData) {
    try {
      const { birthData, analysisType, focusAreas } = analysisData;

      // Perform Ashtakavarga analysis (64-point beneficial influence system)
      const ashtakavargaAnalysis =
        await this._performAshtakavargaAnalysis(birthData);

      // Analyze Varga (divisional) charts
      const vargaAnalysis = await this._performVargaAnalysis(birthData);

      // Calculate Vedic Yogas
      const yogasAnalysis = await this._performYogasAnalysis(birthData);

      // Perform Shadbala (planetary strength) analysis
      const shadbalaAnalysis = await this._performShadbalaAnalysis(birthData);

      // Generate specialized insights
      const specializedInsights = this._generateSpecializedInsights(
        {
          ashtakavargaAnalysis,
          vargaAnalysis,
          yogasAnalysis,
          shadbalaAnalysis
        },
        focusAreas
      );

      // Create comprehensive interpretation
      const interpretation = this._createComprehensiveInterpretation({
        ashtakavargaAnalysis,
        vargaAnalysis,
        yogasAnalysis,
        shadbalaAnalysis,
        specializedInsights
      });

      return {
        birthData: this._sanitizeBirthData(birthData),
        analysisType,
        focusAreas,
        ashtakavargaAnalysis,
        vargaAnalysis,
        yogasAnalysis,
        shadbalaAnalysis,
        specializedInsights,
        interpretation,
        recommendations: this._generateSpecializedRecommendations({
          ashtakavargaAnalysis,
          vargaAnalysis,
          yogasAnalysis,
          shadbalaAnalysis
        })
      };
    } catch (error) {
      logger.error('Error getting specialized analysis:', error);
      throw error;
    }
  }

  /**
   * Perform Ashtakavarga analysis
   * @param {Object} birthData - Birth chart data
   * @returns {Promise<Object>} Ashtakavarga analysis
   * @private
   */
  async _performAshtakavargaAnalysis(birthData) {
    try {
      const ashtakavarga =
        await this.calculator.ashtakavargaCalc.calculateAshtakavarga(birthData);

      return {
        overallScore: ashtakavarga.totalPoints || 0,
        breakdown: ashtakavarga.breakdown || {},
        strongHouses: this._identifyStrongHouses(ashtakavarga),
        weakHouses: this._identifyWeakHouses(ashtakavarga),
        interpretation: this._interpretAshtakavarga(ashtakavarga),
        recommendations: this._getAshtakavargaRecommendations(ashtakavarga)
      };
    } catch (error) {
      logger.warn('Could not perform Ashtakavarga analysis:', error.message);
      return {
        overallScore: 0,
        breakdown: {},
        interpretation: 'Analysis unavailable'
      };
    }
  }

  /**
   * Perform Varga (divisional) chart analysis
   * @param {Object} birthData - Birth chart data
   * @returns {Promise<Object>} Varga analysis
   * @private
   */
  async _performVargaAnalysis(birthData) {
    try {
      const vargaCharts =
        await this.calculator.vargaCalc.calculateVargaCharts(birthData);

      const analysis = {
        availableCharts: Object.keys(vargaCharts),
        keyInsights: {},
        strengthAnalysis: {}
      };

      // Analyze key Varga charts
      const keyCharts = ['D-9', 'D-10', 'D-7', 'D-12']; // Navamsa, Dashamsa, Saptamsa, Dwadasamsa

      keyCharts.forEach(chart => {
        if (vargaCharts[chart]) {
          analysis.keyInsights[chart] = this._analyzeVargaChart(
            chart,
            vargaCharts[chart]
          );
        }
      });

      // Overall strength analysis
      analysis.strengthAnalysis = this._analyzeVargaStrength(vargaCharts);

      return analysis;
    } catch (error) {
      logger.warn('Could not perform Varga analysis:', error.message);
      return { availableCharts: [], keyInsights: {}, strengthAnalysis: {} };
    }
  }

  /**
   * Perform Vedic Yogas analysis
   * @param {Object} birthData - Birth chart data
   * @returns {Promise<Object>} Yogas analysis
   * @private
   */
  async _performYogasAnalysis(birthData) {
    try {
      const yogas = await this.calculator.yogasCalc.calculateYogas(birthData);

      return {
        totalYogas: yogas.length,
        rajayogas: yogas.filter(y => y.type === 'Raja Yoga'),
        dhanayogas: yogas.filter(y => y.type === 'Dhana Yoga'),
        powerfulYogas: yogas.filter(y => y.strength === 'High'),
        yogaBreakdown: this._categorizeYogas(yogas),
        interpretation: this._interpretYogas(yogas),
        recommendations: this._getYogaRecommendations(yogas)
      };
    } catch (error) {
      logger.warn('Could not perform Yogas analysis:', error.message);
      return {
        totalYogas: 0,
        rajayogas: [],
        dhanayogas: [],
        interpretation: 'Analysis unavailable'
      };
    }
  }

  /**
   * Perform Shadbala (six-fold strength) analysis
   * @param {Object} birthData - Birth chart data
   * @returns {Promise<Object>} Shadbala analysis
   * @private
   */
  async _performShadbalaAnalysis(birthData) {
    try {
      const shadbala =
        await this.calculator.shadbalaCalc.calculateShadbala(birthData);

      return {
        overallStrength: shadbala.totalStrength || 0,
        breakdown: {
          sthanaBala: shadbala.sthanaBala || 0,
          digBala: shadbala.digBala || 0,
          kalaBala: shadbala.kalaBala || 0,
          chestaBala: shadbala.chestaBala || 0,
          naisargikaBala: shadbala.naisargikaBala || 0,
          drigBala: shadbala.drigBala || 0
        },
        strongPlanets: this._identifyStrongPlanets(shadbala),
        weakPlanets: this._identifyWeakPlanets(shadbala),
        interpretation: this._interpretShadbala(shadbala),
        recommendations: this._getShadbalaRecommendations(shadbala)
      };
    } catch (error) {
      logger.warn('Could not perform Shadbala analysis:', error.message);
      return {
        overallStrength: 0,
        breakdown: {},
        interpretation: 'Analysis unavailable'
      };
    }
  }

  /**
   * Generate specialized insights from all analyses
   * @param {Object} analyses - All analysis results
   * @param {Array} focusAreas - Areas to focus on
   * @returns {Object} Specialized insights
   * @private
   */
  _generateSpecializedInsights(analyses, focusAreas) {
    const insights = {
      lifePurpose: '',
      careerPotential: '',
      spiritualPath: '',
      relationshipDynamics: '',
      healthIndicators: '',
      wealthPotential: '',
      overallDestiny: ''
    };

    // Generate insights based on focus areas
    if (!focusAreas || focusAreas.length === 0) {
      focusAreas = ['lifePurpose', 'careerPotential', 'spiritualPath'];
    }

    focusAreas.forEach(area => {
      insights[area] = this._generateInsightForArea(area, analyses);
    });

    return insights;
  }

  /**
   * Create comprehensive interpretation
   * @param {Object} analyses - All analysis results
   * @returns {string} Comprehensive interpretation
   * @private
   */
  _createComprehensiveInterpretation(analyses) {
    let interpretation = '';

    // Overall strength assessment
    const ashtakavargaScore = analyses.ashtakavargaAnalysis.overallScore || 0;
    const shadbalaStrength = analyses.shadbalaAnalysis.overallStrength || 0;
    const yogaCount = analyses.yogasAnalysis.totalYogas || 0;

    const overallStrength =
      ((ashtakavargaScore / 384) * 100 + shadbalaStrength + yogaCount * 5) / 3;

    if (overallStrength > 75) {
      interpretation +=
        'Exceptionally strong astrological foundation with multiple beneficial influences. ';
    } else if (overallStrength > 60) {
      interpretation +=
        'Strong astrological potential with good planetary support. ';
    } else if (overallStrength > 40) {
      interpretation +=
        'Moderate astrological influences requiring conscious effort. ';
    } else {
      interpretation +=
        'Challenging astrological configuration requiring remedial measures. ';
    }

    // Key findings
    if (analyses.yogasAnalysis.rajayogas.length > 0) {
      interpretation += `Presence of ${analyses.yogasAnalysis.rajayogas.length} Raja Yoga(s) indicates leadership potential and success. `;
    }

    if (analyses.ashtakavargaAnalysis.overallScore > 250) {
      interpretation +=
        'High Ashtakavarga score suggests excellent timing and opportunities. ';
    }

    if (analyses.shadbalaAnalysis.overallStrength > 70) {
      interpretation +=
        'Strong planetary strengths indicate good vitality and effectiveness. ';
    }

    return interpretation;
  }

  /**
   * Generate specialized recommendations
   * @param {Object} analyses - Analysis results
   * @returns {Object} Recommendations
   * @private
   */
  _generateSpecializedRecommendations(analyses) {
    const recommendations = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
      remedial: []
    };

    // Immediate recommendations based on weak areas
    const weakHouses = analyses.ashtakavargaAnalysis.weakHouses || [];
    if (weakHouses.length > 0) {
      recommendations.immediate.push(
        'Focus on strengthening areas shown in weak Ashtakavarga houses'
      );
    }

    const weakPlanets = analyses.shadbalaAnalysis.weakPlanets || [];
    if (weakPlanets.length > 0) {
      recommendations.immediate.push(
        'Strengthen weak planets through appropriate remedial measures'
      );
    }

    // Short-term recommendations
    if (analyses.yogasAnalysis.totalYogas > 0) {
      recommendations.shortTerm.push(
        'Activate beneficial yogas through conscious living and spiritual practices'
      );
    }

    // Long-term recommendations
    recommendations.longTerm.push(
      'Study and apply advanced Vedic techniques for maximum benefit'
    );
    recommendations.longTerm.push(
      'Regular consultation with experienced astrologers for guidance'
    );

    // Remedial recommendations
    if (analyses.ashtakavargaAnalysis.overallScore < 200) {
      recommendations.remedial.push(
        'Consider comprehensive remedial measures to improve Ashtakavarga'
      );
    }

    if (analyses.shadbalaAnalysis.overallStrength < 50) {
      recommendations.remedial.push(
        'Strengthen planetary powers through specific spiritual practices'
      );
    }

    return recommendations;
  }

  // Helper methods for Ashtakavarga analysis

  _identifyStrongHouses(ashtakavarga) {
    const houses = [];
    if (ashtakavarga.breakdown) {
      Object.entries(ashtakavarga.breakdown).forEach(([house, points]) => {
        if (points >= 28) {
          // Above average
          houses.push(parseInt(house));
        }
      });
    }
    return houses;
  }

  _identifyWeakHouses(ashtakavarga) {
    const houses = [];
    if (ashtakavarga.breakdown) {
      Object.entries(ashtakavarga.breakdown).forEach(([house, points]) => {
        if (points < 20) {
          // Below average
          houses.push(parseInt(house));
        }
      });
    }
    return houses;
  }

  _interpretAshtakavarga(ashtakavarga) {
    const score = ashtakavarga.totalPoints || 0;
    if (score > 300) {
      return 'Exceptionally favorable planetary influences';
    }
    if (score > 250) {
      return 'Very good planetary support';
    }
    if (score > 200) {
      return 'Good planetary harmony';
    }
    if (score > 150) {
      return 'Moderate planetary influences';
    }
    return 'Challenging planetary configuration requiring attention';
  }

  _getAshtakavargaRecommendations(ashtakavarga) {
    const recommendations = [];
    const strongHouses = this._identifyStrongHouses(ashtakavarga);
    const weakHouses = this._identifyWeakHouses(ashtakavarga);

    if (strongHouses.length > 0) {
      recommendations.push(
        `Leverage strength in houses: ${strongHouses.join(', ')}`
      );
    }

    if (weakHouses.length > 0) {
      recommendations.push(
        `Strengthen houses: ${weakHouses.join(', ')} through remedial measures`
      );
    }

    return recommendations;
  }

  // Helper methods for Varga analysis

  _analyzeVargaChart(chartName, chartData) {
    // Simplified Varga chart analysis
    const insights = {
      strength: 'Neutral',
      keyPlanets: [],
      interpretation: ''
    };

    switch (chartName) {
    case 'D-9':
      insights.interpretation =
          'Navamsa shows marriage, spirituality, and life partner';
      break;
    case 'D-10':
      insights.interpretation = 'Dashamsa reveals career and public life';
      break;
    case 'D-7':
      insights.interpretation = 'Saptamsa indicates children and creativity';
      break;
    case 'D-12':
      insights.interpretation = 'Dwadasamsa shows parents and ancestry';
      break;
    default:
      insights.interpretation = `${chartName} analysis available`;
    }

    return insights;
  }

  _analyzeVargaStrength(vargaCharts) {
    // Simplified strength analysis across Varga charts
    return {
      overallStrength: 'Good',
      strongestChart: 'D-9',
      focusArea: 'Spiritual and relationship matters show strength'
    };
  }

  // Helper methods for Yogas analysis

  _categorizeYogas(yogas) {
    const categories = {};
    yogas.forEach(yoga => {
      const type = yoga.type || 'General';
      if (!categories[type]) {
        categories[type] = [];
      }
      categories[type].push(yoga);
    });
    return categories;
  }

  _interpretYogas(yogas) {
    if (yogas.length === 0) {
      return 'No significant yogas identified';
    }

    const rajaYogas = yogas.filter(y => y.type === 'Raja Yoga').length;
    const dhanaYogas = yogas.filter(y => y.type === 'Dhana Yoga').length;

    let interpretation = `${yogas.length} planetary combination(s) identified. `;

    if (rajaYogas > 0) {
      interpretation += `${rajaYogas} Raja Yoga(s) indicate leadership and success potential. `;
    }

    if (dhanaYogas > 0) {
      interpretation += `${dhanaYogas} Dhana Yoga(s) suggest wealth and prosperity. `;
    }

    return interpretation;
  }

  _getYogaRecommendations(yogas) {
    const recommendations = [];

    if (yogas.some(y => y.type === 'Raja Yoga')) {
      recommendations.push('Leadership opportunities may present themselves');
    }

    if (yogas.some(y => y.type === 'Dhana Yoga')) {
      recommendations.push(
        'Financial prosperity indicated through multiple sources'
      );
    }

    if (yogas.length > 5) {
      recommendations.push(
        'Multiple yogas suggest diverse talents and opportunities'
      );
    }

    return recommendations;
  }

  // Helper methods for Shadbala analysis

  _identifyStrongPlanets(shadbala) {
    const strongPlanets = [];
    // Simplified strength identification
    if (shadbala.breakdown) {
      Object.entries(shadbala.breakdown).forEach(([planet, strength]) => {
        if (strength > 60) {
          strongPlanets.push(planet);
        }
      });
    }
    return strongPlanets;
  }

  _identifyWeakPlanets(shadbala) {
    const weakPlanets = [];
    // Simplified weakness identification
    if (shadbala.breakdown) {
      Object.entries(shadbala.breakdown).forEach(([planet, strength]) => {
        if (strength < 40) {
          weakPlanets.push(planet);
        }
      });
    }
    return weakPlanets;
  }

  _interpretShadbala(shadbala) {
    const strength = shadbala.totalStrength || 0;
    if (strength > 80) {
      return 'Exceptionally strong planetary powers';
    }
    if (strength > 70) {
      return 'Very strong planetary influences';
    }
    if (strength > 60) {
      return 'Good planetary strength';
    }
    if (strength > 50) {
      return 'Moderate planetary power';
    }
    return 'Planetary strength needs enhancement';
  }

  _getShadbalaRecommendations(shadbala) {
    const recommendations = [];
    const weakPlanets = this._identifyWeakPlanets(shadbala);

    if (weakPlanets.length > 0) {
      recommendations.push(`Strengthen planets: ${weakPlanets.join(', ')}`);
    }

    const strongPlanets = this._identifyStrongPlanets(shadbala);
    if (strongPlanets.length > 0) {
      recommendations.push(`Leverage strength of: ${strongPlanets.join(', ')}`);
    }

    return recommendations;
  }

  // Helper methods for insights generation

  _generateInsightForArea(area, analyses) {
    switch (area) {
    case 'lifePurpose':
      return this._generateLifePurposeInsight(analyses);
    case 'careerPotential':
      return this._generateCareerInsight(analyses);
    case 'spiritualPath':
      return this._generateSpiritualInsight(analyses);
    case 'relationshipDynamics':
      return this._generateRelationshipInsight(analyses);
    case 'healthIndicators':
      return this._generateHealthInsight(analyses);
    case 'wealthPotential':
      return this._generateWealthInsight(analyses);
    default:
      return 'Specialized analysis available for this life area';
    }
  }

  _generateLifePurposeInsight(analyses) {
    const yogas = analyses.yogasAnalysis.totalYogas || 0;
    const ashtakavarga = analyses.ashtakavargaAnalysis.overallScore || 0;

    if (yogas > 3 && ashtakavarga > 250) {
      return 'Strong indicators of leadership and significant life purpose';
    } else if (yogas > 1) {
      return 'Multiple talents suggest varied life path with opportunities for growth';
    } else {
      return 'Life purpose develops through experience and spiritual growth';
    }
  }

  _generateCareerInsight(analyses) {
    // Look at 10th house Varga and career-related yogas
    const dashamsaStrength =
      analyses.vargaAnalysis.keyInsights?.['D-10']?.strength || 'Neutral';
    const rajaYogas = analyses.yogasAnalysis.rajayogas?.length || 0;

    if (rajaYogas > 0) {
      return 'Strong leadership potential in career with opportunities for advancement';
    } else if (dashamsaStrength === 'Strong') {
      return 'Good career potential with steady progress and recognition';
    } else {
      return 'Career success comes through perseverance and skill development';
    }
  }

  _generateSpiritualInsight(analyses) {
    const navamsaStrength =
      analyses.vargaAnalysis.keyInsights?.['D-9']?.strength || 'Neutral';
    const spiritualYogas =
      analyses.yogasAnalysis.yogaBreakdown?.['Spiritual']?.length || 0;

    if (navamsaStrength === 'Strong' || spiritualYogas > 0) {
      return 'Strong spiritual inclinations with potential for deep wisdom and enlightenment';
    } else {
      return 'Spiritual growth develops gradually through life experiences and practices';
    }
  }

  _generateRelationshipInsight(analyses) {
    const navamsaStrength =
      analyses.vargaAnalysis.keyInsights?.['D-9']?.strength || 'Neutral';
    const venusStrength = analyses.shadbalaAnalysis.breakdown?.venus || 0;

    if (navamsaStrength === 'Strong' && venusStrength > 60) {
      return 'Harmonious relationship potential with strong partnership indicators';
    } else {
      return 'Relationships develop through understanding and mutual growth';
    }
  }

  _generateHealthInsight(analyses) {
    const shadbalaStrength = analyses.shadbalaAnalysis.overallStrength || 0;
    const weakPlanets = analyses.shadbalaAnalysis.weakPlanets?.length || 0;

    if (shadbalaStrength > 70 && weakPlanets === 0) {
      return 'Strong vitality and good health potential';
    } else if (weakPlanets > 0) {
      return 'Health requires attention to planetary weaknesses through lifestyle and remedies';
    } else {
      return 'Moderate health indicators suggesting need for balanced lifestyle';
    }
  }

  _generateWealthInsight(analyses) {
    const dhanaYogas = analyses.yogasAnalysis.dhanayogas?.length || 0;
    const wealthHouses =
      analyses.ashtakavargaAnalysis.strongHouses?.filter(h =>
        [2, 11].includes(h)
      ).length || 0;

    if (dhanaYogas > 0 && wealthHouses > 0) {
      return 'Strong wealth potential through multiple sources and opportunities';
    } else if (dhanaYogas > 0) {
      return 'Good financial potential with opportunities for prosperity';
    } else {
      return 'Wealth accumulation requires effort and wise financial management';
    }
  }

  _sanitizeBirthData(birthData) {
    return {
      date: birthData.birthDate,
      time: birthData.birthTime,
      place: birthData.birthPlace
    };
  }

  /**
   * Create specialized analysis summary for quick reference
   * @param {Object} result - Full specialized analysis
   * @returns {Object} Summary
   * @private
   */
  _createSpecializedSummary(result) {
    return {
      analysisType: result.analysisType,
      overallStrength: this._calculateOverallStrength(result),
      keyFindings: {
        ashtakavargaScore: result.ashtakavargaAnalysis.overallScore || 0,
        totalYogas: result.yogasAnalysis.totalYogas || 0,
        shadbalaStrength: result.shadbalaAnalysis.overallStrength || 0,
        vargaChartsAnalyzed: result.vargaAnalysis.availableCharts?.length || 0
      },
      dominantThemes: this._extractDominantThemes(result),
      recommendations: result.recommendations.immediate?.slice(0, 2) || []
    };
  }

  /**
   * Calculate overall strength from all analyses
   * @param {Object} result - Analysis result
   * @returns {string} Overall strength
   * @private
   */
  _calculateOverallStrength(result) {
    const ashtakavargaPercent =
      (result.ashtakavargaAnalysis.overallScore || 0) / 384;
    const shadbalaPercent =
      (result.shadbalaAnalysis.overallStrength || 0) / 100;
    const yogaBonus = Math.min(
      (result.yogasAnalysis.totalYogas || 0) * 0.05,
      0.3
    );

    const overallScore =
      (ashtakavargaPercent + shadbalaPercent + yogaBonus) / 3;

    if (overallScore > 0.8) {
      return 'Exceptional';
    }
    if (overallScore > 0.7) {
      return 'Very Strong';
    }
    if (overallScore > 0.6) {
      return 'Strong';
    }
    if (overallScore > 0.5) {
      return 'Moderate';
    }
    if (overallScore > 0.4) {
      return 'Fair';
    }
    return 'Needs Attention';
  }

  /**
   * Extract dominant themes from analysis
   * @param {Object} result - Analysis result
   * @returns {Array} Dominant themes
   * @private
   */
  _extractDominantThemes(result) {
    const themes = [];

    if (result.yogasAnalysis.rajayogas?.length > 0) {
      themes.push('Leadership & Authority');
    }

    if (result.yogasAnalysis.dhanayogas?.length > 0) {
      themes.push('Wealth & Prosperity');
    }

    if (result.ashtakavargaAnalysis.overallScore > 250) {
      themes.push('Favorable Timing');
    }

    if (result.shadbalaAnalysis.overallStrength > 70) {
      themes.push('Strong Vitality');
    }

    if (result.vargaAnalysis.keyInsights?.['D-9']) {
      themes.push('Spiritual Growth');
    }

    return themes.length > 0 ? themes : ['Balanced Development'];
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['execute', 'getSpecializedAnalysis'],
      dependencies: [
        'AshtakavargaCalculator',
        'VargaChartCalculator',
        'VedicYogasCalculator',
        'ShadbalaCalculator'
      ]
    };
  }

  async processCalculation(data) {
    return await this.lspecializedAnalysisCalculation(data);
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

module.exports = SpecializedAnalysisService;
