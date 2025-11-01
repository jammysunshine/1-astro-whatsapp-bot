const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');
const { BirthData } = require('../../models');

/**
 * DavisonChartService - Service for Davison chart calculations
 *
 * Calculates Davison charts (a form of composite chart using mid-time and mid-place)
 * for relationship analysis, providing insights into the partnership as a separate entity.
 */
class DavisonChartService extends ServiceTemplate {
  constructor() {
    super('ChartGenerator'); // Primary calculator for this service
    this.serviceName = 'DavisonChartService';
    this.calculatorPath = '../calculators/ChartGenerator';
    logger.info('DavisonChartService initialized');
  }

  /**
   * Validates input data for Davison chart calculation.
   * @param {Object} data - Input data containing person1 and person2 birth data.
   */
  validate(data) {
    if (!data) {
      throw new Error('Input data is required for Davison chart calculation');
    }

    if (!data.person1 || !data.person2) {
      throw new Error('Both person1 and person2 birth data are required');
    }

    // Validate birth data with model
    const validatedData1 = new BirthData(data.person1);
    validatedData1.validate();

    const validatedData2 = new BirthData(data.person2);
    validatedData2.validate();

    return true;
  }

  /**
   * Main calculation method for Davison Chart.
   * @param {Object} data - Input data with person1 and person2 birth data.
   * @returns {Promise<Object>} Raw Davison chart result.
   */
  async processCalculation(data) {
    try {
      // Ensure calculator is loaded
      if (!this.calculator) {
        await this.initialize();
      }

      this.validate(data);

      const { person1, person2 } = data;

      // Calculate Davison chart using the dynamically loaded calculator
      const davisonChart = await this.calculator.calculateDavisonChart(person1, person2);

      // Generate additional analysis and interpretations
      const davisonAnalysis = this._analyzeDavisonChart(davisonChart);
      const relationshipInsights = this._generateRelationshipInsights(davisonChart);
      const lifePurpose = this._identifyLifePurpose(davisonChart);

      const result = {
        davisonChart,
        davisonAnalysis,
        relationshipInsights,
        lifePurpose,
        interpretation: this._interpretDavisonChart(davisonChart, davisonAnalysis),
        type: 'davison_chart',
        generatedAt: new Date().toISOString(),
        service: this.serviceName
      };

      return result;
    } catch (error) {
      logger.error('DavisonChartService processCalculation error:', error);
      throw new Error(`Davison chart calculation failed: ${error.message}`);
    }
  }

  /**
   * Formats the Davison chart result for consistent output.
   * @param {Object} result - Raw calculator result.
   * @returns {Object} Formatted Davison chart result.
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        message: 'Davison chart analysis failed',
        service: this.serviceName
      };
    }

    return {
      success: true,
      data: result,
      summary: result.interpretation,
      metadata: {
        serviceName: this.serviceName,
        calculationType: 'Davison Chart',
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Analyzes the Davison chart structure.
   * @param {Object} davisonChart - Davison chart data.
   * @returns {Object} Chart analysis.
   * @private
   */
  _analyzeDavisonChart(davisonChart) {
    const analysis = {
      planetaryPlacements: this._analyzePlanetaryPlacements(davisonChart),
      aspectPatterns: this._analyzeAspectPatterns(davisonChart),
      houseEmphasis: this._analyzeHouseEmphasis(davisonChart),
      dominantThemes: this._identifyDominantThemes(davisonChart)
    };
    return analysis;
  }

  /**
   * Analyzes planetary placements in Davison chart.
   * @param {Object} davisonChart - Davison chart.
   * @returns {Object} Planetary analysis.
   * @private
   */
  _analyzePlanetaryPlacements(davisonChart) {
    const placements = {};
    const keyPlanets = ['Sun', 'Moon', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

    for (const planet of keyPlanets) {
      if (davisonChart[planet]) {
        const data = davisonChart[planet];
        placements[planet] = {
          sign: data.sign,
          house: data.house,
          significance: this._interpretPlanetaryPlacement(planet, data.sign, data.house)
        };
      }
    }
    return placements;
  }

  /**
   * Analyzes aspect patterns in Davison chart.
   * @param {Object} davisonChart - Davison chart.
   * @returns {Object} Aspect pattern analysis.
   * @private
   */
  _analyzeAspectPatterns(davisonChart) {
    // This would require aspect calculation logic
    return {
      majorAspects: davisonChart.majorAspects || [],
      configuration: davisonChart.aspectConfiguration || 'Aspect analysis requires additional calculation',
      harmony: this._assessChartHarmony(davisonChart)
    };
  }

  /**
   * Analyzes house emphasis in Davison chart.
   * @param {Object} davisonChart - Davison chart.
   * @returns {Object} House emphasis analysis.
   * @private
   */
  _analyzeHouseEmphasis(davisonChart) {
    const houseCounts = {};
    for (const [planet, data] of Object.entries(davisonChart)) {
      if (data && typeof data === 'object' && data.house) {
        houseCounts[data.house] = (houseCounts[data.house] || 0) + 1;
      }
    }
    const emphasizedHouses = Object.keys(houseCounts)
      .filter(house => houseCounts[house] >= 2)
      .sort((a, b) => houseCounts[b] - houseCounts[a]);

    return {
      distribution: houseCounts,
      emphasizedHouses,
      lifeAreas: emphasizedHouses.map(house => this._interpretHouseEmphasis(house))
    };
  }

  /**
   * Identifies dominant themes in Davison chart.
   * @param {Object} davisonChart - Davison chart.
   * @returns {Array} Dominant themes.
   * @private
   */
  _identifyDominantThemes(davisonChart) {
    const themes = [];
    if (davisonChart.Sun?.sign) {
      themes.push(this._getSunSignTheme(davisonChart.Sun.sign));
    }
    if (davisonChart.Moon?.sign) {
      themes.push(this._getMoonSignTheme(davisonChart.Moon.sign));
    }
    if (davisonChart.Venus?.house) {
      themes.push(this._getVenusTheme(davisonChart.Venus.house));
    }
    if (themes.length === 0) {
      themes.push('Harmonious partnership with balanced growth opportunities');
    }
    return themes.slice(0, 3);
  }

  /**
   * Generates relationship insights from Davison chart.
   * @param {Object} davisonChart - Davison chart.
   * @returns {Object} Relationship insights.
   * @private
   */
  _generateRelationshipInsights(davisonChart) {
    const insights = { strengths: [], challenges: [], growth: [], timing: [] };
    if (davisonChart.Sun?.house) {
      insights.strengths.push(this._getSunHouseInsight(davisonChart.Sun.house));
    }
    if (davisonChart.Moon?.house) {
      insights.strengths.push(this._getMoonHouseInsight(davisonChart.Moon.house));
    }
    if (davisonChart.Saturn?.house) {
      insights.challenges.push(this._getSaturnHouseInsight(davisonChart.Saturn.house));
    }
    if (davisonChart.Jupiter?.house) {
      insights.growth.push(this._getJupiterHouseInsight(davisonChart.Jupiter.house));
    }
    insights.timing.push('Davison chart represents the relationship\'s developmental timeline');
    insights.timing.push('Planetary periods indicate relationship growth phases');
    return insights;
  }

  /**
   * Identifies life purpose from Davison chart.
   * @param {Object} davisonChart - Davison chart.
   * @returns {Array} Life purpose insights.
   * @private
   */
  _identifyLifePurpose(davisonChart) {
    const purposes = [];
    if (davisonChart.Sun?.house) {
      purposes.push(this._getSunPurpose(davisonChart.Sun.house));
    }
    if (davisonChart.NorthNode?.house) {
      purposes.push(this._getNodePurpose(davisonChart.NorthNode.house));
    }
    if (davisonChart.MC?.sign) {
      purposes.push(this._getMcPurpose(davisonChart.MC.sign));
    }
    if (purposes.length === 0) {
      purposes.push('Joint spiritual growth and mutual life learning');
    }
    return purposes.slice(0, 3);
  }

  /**
   * Interprets planetary placement.
   * @param {string} planet - Planet name.
   * @param {string} sign - Sign.
   * @param {number} house - House.
   * @returns {string} Interpretation.
   * @private
   */
  _interpretPlanetaryPlacement(planet, sign, house) {
    const interpretations = {
      Sun: `Identity and purpose in ${this._getHouseArea(house)}`,
      Moon: `Emotional foundation in ${this._getHouseArea(house)}`,
      Venus: `Love and values expressed through ${this._getHouseArea(house)}`,
      Mars: `Energy and action in ${this._getHouseArea(house)}`,
      Jupiter: `Growth and expansion in ${this._getHouseArea(house)}`,
      Saturn: `Structure and responsibility in ${this._getHouseArea(house)}`
    };
    return interpretations[planet] || `${planet} in ${sign}, ${house}th house`;
  }

  /**
   * Assesses chart harmony.
   * @param {Object} davisonChart - Davison chart.
   * @returns {string} Harmony assessment.
   * @private
   */
  _assessChartHarmony(davisonChart) {
    if (davisonChart.harmony) {
      return davisonChart.harmony;
    }
    return 'Balanced chart with opportunities for harmonious development';
  }

  /**
   * Interprets house emphasis.
   * @param {number} house - House number.
   * @returns {string} House area description.
   * @private
   */
  _interpretHouseEmphasis(house) {
    const houseAreas = {
      1: 'personal identity and self-expression', 2: 'values, resources, and self-worth', 3: 'communication and learning',
      4: 'home, family, and emotional foundation', 5: 'creativity, children, and self-expression', 6: 'service, health, and daily routines',
      7: 'partnerships and relationships', 8: 'transformation, intimacy, and shared resources', 9: 'philosophy, travel, and higher learning',
      10: 'career, reputation, and public life', 11: 'friendships, groups, and aspirations', 12: 'spirituality, endings, and inner life'
    };
    return houseAreas[house] || `house ${house} themes`;
  }

  /**
   * Gets house area description.
   * @param {number} house - House number.
   * @returns {string} Area description.
   * @private
   */
  _getHouseArea(house) {
    const areas = {
      1: 'personal identity', 2: 'values and resources', 3: 'communication',
      4: 'home and family', 5: 'creativity and children', 6: 'service and health',
      7: 'partnerships', 8: 'transformation', 9: 'philosophy and travel',
      10: 'career and reputation', 11: 'friendships and groups', 12: 'spirituality'
    };
    return areas[house] || `house ${house}`;
  }

  /**
   * Gets Sun sign theme.
   * @param {string} sign - Sun sign.
   * @returns {string} Theme description.
   * @private
   */
  _getSunSignTheme(sign) {
    const themes = {
      Aries: 'Dynamic and pioneering partnership', Taurus: 'Stable and sensual relationship', Gemini: 'Communicative and intellectual connection',
      Cancer: 'Nurturing and emotionally bonded union', Leo: 'Creative and expressive partnership', Virgo: 'Service-oriented and detail-focused relationship',
      Libra: 'Harmonious and balanced partnership', Scorpio: 'Intense and transformative connection', Sagittarius: 'Adventurous and philosophical union',
      Capricorn: 'Ambitious and structured relationship', Aquarius: 'Progressive and unconventional partnership', Pisces: 'Compassionate and spiritual connection'
    };
    return themes[sign] || 'Balanced and harmonious relationship';
  }

  /**
   * Gets Moon sign theme.
   * @param {string} sign - Moon sign.
   * @returns {string} Theme description.
   * @private
   */
  _getMoonSignTheme(sign) {
    const themes = {
      Aries: 'Emotionally direct and spontaneous', Taurus: 'Emotionally stable and sensual', Gemini: 'Emotionally communicative and adaptable',
      Cancer: 'Deeply nurturing and protective', Leo: 'Emotionally expressive and generous', Virgo: 'Emotionally practical and caring',
      Libra: 'Emotionally balanced and harmonious', Scorpio: 'Emotionally intense and passionate', Sagittarius: 'Emotionally adventurous and optimistic',
      Capricorn: 'Emotionally responsible and structured', Aquarius: 'Emotionally independent and humanitarian', Pisces: 'Emotionally compassionate and intuitive'
    };
    return themes[sign] || 'Emotionally balanced connection';
  }

  /**
   * Gets Venus theme based on house.
   * @param {number} house - Venus house.
   * @returns {string} Theme description.
   * @private
   */
  _getVenusTheme(house) {
    const themes = {
      1: 'Love focused on personal identity and attraction', 2: 'Love expressed through values and shared resources', 3: 'Love through communication and intellectual connection',
      4: 'Love centered on home and family', 5: 'Love through creativity and romance', 6: 'Love expressed through service and care',
      7: 'Love focused on partnership and marriage', 8: 'Love through deep intimacy and transformation', 9: 'Love through philosophy and shared beliefs',
      10: 'Love connected to career and public life', 11: 'Love through friendships and group activities', 12: 'Love through spirituality and compassion'
    };
    return themes[house] || 'Love expressed uniquely in this relationship';
  }

  /**
   * Gets Sun house insight.
   * @param {number} house - Sun house.
   * @returns {string} Insight.
   * @private
   */
  _getSunHouseInsight(house) {
    const insights = {
      1: 'Strong shared identity and purpose', 2: 'Shared values and financial goals', 3: 'Communication and learning together',
      4: 'Building a home and family together', 5: 'Creative expression and joy in the relationship', 6: 'Service and care for each other',
      7: 'Equal partnership and mutual respect', 8: 'Deep transformation and intimacy', 9: 'Shared philosophy and life exploration',
      10: 'Public recognition and shared achievements', 11: 'Group activities and shared aspirations', 12: 'Spiritual growth and inner connection'
    };
    return insights[house] || 'Shared purpose and direction';
  }

  /**
   * Gets Moon house insight.
   * @param {number} house - Moon house.
   * @returns {string} Insight.
   * @private
   */
  _getMoonHouseInsight(house) {
    const insights = {
      1: 'Emotional security in self-expression', 2: 'Emotional security through shared resources', 3: 'Emotional security through communication',
      4: 'Emotional security in home and family', 5: 'Emotional security through creativity and fun', 6: 'Emotional security through care and service',
      7: 'Emotional security in partnership', 8: 'Emotional security through intimacy', 9: 'Emotional security through shared beliefs',
      10: 'Emotional security through achievements', 11: 'Emotional security through friendships', 12: 'Emotional security through spirituality'
    };
    return insights[house] || 'Emotional security and comfort';
  }

  /**
   * Gets Saturn house insight.
   * @param {number} house - Saturn house.
   * @returns {string} Insight.
   * @private
   */
  _getSaturnHouseInsight(house) {
    const insights = {
      1: 'Learning about personal boundaries and responsibility', 2: 'Building financial stability and self-worth', 3: 'Developing clear communication and discipline',
      4: 'Establishing strong family foundations', 5: 'Learning through creative challenges', 6: 'Developing healthy routines and service',
      7: 'Building committed partnership structures', 8: 'Working through transformation and trust', 9: 'Developing philosophical maturity',
      10: 'Building career stability and reputation', 11: 'Learning through group responsibilities', 12: 'Spiritual discipline and inner work'
    };
    return insights[house] || 'Areas requiring patience and commitment';
  }

  /**
   * Gets Jupiter house insight.
   * @param {number} house - Jupiter house.
   * @returns {string} Insight.
   * @private
   */
  _getJupiterHouseInsight(house) {
    const insights = {
      1: 'Growth through self-discovery and confidence', 2: 'Abundance in resources and self-value', 3: 'Expansion through learning and communication',
      4: 'Growth in family and home life', 5: 'Joy and expansion through creativity', 6: 'Growth through service and health',
      7: 'Expansion in relationships and partnerships', 8: 'Growth through intimacy and transformation', 9: 'Philosophical and travel expansion',
      10: 'Career growth and public recognition', 11: 'Growth through groups and aspirations', 12: 'Spiritual expansion and inner wisdom'
    };
    return insights[house] || 'Areas of natural growth and expansion';
  }

  /**
   * Gets Sun purpose based on house.
   * @param {number} house - Sun house.
   * @returns {string} Purpose description.
   * @private
   */
  _getSunPurpose(house) {
    const purposes = {
      1: 'To develop a strong shared identity and purpose', 2: 'To build security and shared values together', 3: 'To communicate and learn as a team',
      4: 'To create a loving home and family foundation', 5: 'To express creativity and joy together', 6: 'To serve and care for each other',
      7: 'To form an equal and balanced partnership', 8: 'To transform and deepen intimacy', 9: 'To explore philosophy and expand horizons',
      10: 'To achieve public recognition together', 11: 'To work toward shared aspirations', 12: 'To develop spiritual connection and compassion'
    };
    return purposes[house] || 'To fulfill shared life purpose and destiny';
  }

  /**
   * Gets North Node purpose based on house.
   * @param {number} house - Node house.
   * @returns {string} Purpose description.
   * @private
   */
  _getNodePurpose(house) {
    const purposes = {
      1: 'Learning about authentic self-expression', 2: 'Developing self-worth and resource management', 3: 'Mastering communication and learning',
      4: 'Building emotional security and family', 5: 'Expressing creativity and joy', 6: 'Learning service and healthy routines',
      7: 'Developing partnership skills', 8: 'Mastering transformation and intimacy', 9: 'Expanding philosophical understanding',
      10: 'Building career and public life', 11: 'Developing group consciousness', 12: 'Deepening spiritual awareness'
    };
    return purposes[house] || 'Spiritual growth and life learning';
  }

  /**
   * Gets MC purpose based on sign.
   * @param {string} sign - MC sign.
   * @returns {string} Purpose description.
   * @private
   */
  _getMcPurpose(sign) {
    const purposes = {
      Aries: 'To be pioneering leaders in their field', Taurus: 'To build lasting value and security', Gemini: 'To communicate and share knowledge',
      Cancer: 'To nurture and care for others', Leo: 'To create and inspire through self-expression', Virgo: 'To serve with precision and care',
      Libra: 'To create harmony and balance', Scorpio: 'To transform and heal deeply', Sagittarius: 'To explore and expand understanding',
      Capricorn: 'To build structures and achieve goals', Aquarius: 'To innovate and serve humanity', Pisces: 'To offer compassion and spiritual guidance'
    };
    return purposes[sign] || 'To contribute meaningfully to the world';
  }

  /**
   * Interprets the Davison chart overall.
   * @param {Object} davisonChart - Davison chart.
   * @param {Object} analysis - Chart analysis.
   * @returns {string} Overall interpretation.
   * @private
   */
  _interpretDavisonChart(davisonChart, analysis) {
    let interpretation = 'The Davison chart represents the relationship as a separate entity with its own birth chart, calculated from the midpoint of both partners\' birth data. ';
    if (davisonChart.relationshipPurpose) {
      interpretation += `${davisonChart.relationshipPurpose} `;
    }
    interpretation += 'This chart reveals the soul purpose and developmental path of the partnership, showing how the relationship evolves and grows over time. ';
    if (analysis.dominantThemes && analysis.dominantThemes.length > 0) {
      interpretation += `Key themes include: ${analysis.dominantThemes.join(', ')}. `;
    }
    interpretation += 'The Davison chart provides insights into the relationship\'s timing, challenges, and ultimate potential for fulfillment.';
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
      methods: ['processCalculation', 'calculateDavisonChart'],
      dependencies: [], // Managed by ServiceTemplate
      description: 'Service for Davison chart calculations and relationship analysis.'
    };
  }

  /**
   * Returns help information for the service.
   * @returns {string} Help text.
   */
  getHelp() {
    return `
💞 **Davison Chart Service - Relationship's Own Birth Chart**

**Purpose:** Calculates Davison charts (a form of composite chart using mid-time and mid-place) for relationship analysis, providing insights into the partnership as a separate entity.

**Required Inputs:**
• Person 1: Birth data (Object with birthDate, birthTime, birthPlace)
• Person 2: Birth data (Object with birthDate, birthTime, birthPlace)

**Analysis Includes:**
• **Davison Chart:** The unique birth chart of the relationship itself.
• **Planetary Placements:** How planets are positioned in the relationship's chart.
• **Aspect Patterns:** Key planetary relationships within the composite chart.
• **House Emphasis:** Life areas that are most prominent for the couple.
• **Dominant Themes:** Overarching themes and purpose of the relationship.
• **Relationship Insights:** Strengths, challenges, and growth areas for the partnership.
• **Life Purpose:** The collective purpose and destiny of the relationship.

**Example Usage:**    `;
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

module.exports = DavisonChartService;