const logger = require('../../../utils/logger');

/**
 * CompositeChartService - Service for composite chart calculations
 * Computes composite charts (midpoint charts) between two people, representing the relationship as a third entity
 */
class CompositeChartService extends ServiceTemplate {
  constructor() {
    super('ChartGenerator');
    this.calculatorPath = '../calculators/ChartGenerator';    this.serviceName = 'CompositeChartService';
    this.calculatorPath = '../calculators/SynastryEngine'; // Assuming this path for the main calculator
    logger.info('CompositeChartService initialized');
  }

  /**
   * Execute composite chart calculation
   * @param {Object} chartData - Chart data for both partners
   * @param {Object} chartData.chart1 - First person's birth chart
   * @param {Object} chartData.chart2 - Second person's birth chart
   * @returns {Object} Composite chart result
   */
  async processCalculation(chartData) {
    try {
      // Input validation
      this._validateInput(chartData);

      // Calculate composite chart
      const result = await this.calculateCompositeChart(chartData);

      // Format and return result
      return this._formatResult(result);
    } catch (error) {
      logger.error('CompositeChartService error:', error);
      throw new Error(`Composite chart calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate composite chart between two birth charts
   * @param {Object} chartData - Chart data for both partners
   * @returns {Object} Composite chart analysis
   */
  async calculateCompositeChart(chartData) {
    try {
      const { chart1, chart2 } = chartData;

      // Get composite chart from calculator
      const compositeChart = this.calculator.calculateCompositeChart(chart1, chart2);

      // Generate additional analysis and interpretations
      const compositeAnalysis = this._analyzeCompositeChart(compositeChart);
      const relationshipPurpose = this._identifyRelationshipPurpose(compositeChart);
      const compositeAspects = this._analyzeCompositeAspects(compositeChart);

      return {
        compositeChart,
        compositeAnalysis,
        relationshipPurpose,
        compositeAspects,
        interpretation: this._interpretCompositeChart(compositeChart, compositeAnalysis)
      };
    } catch (error) {
      logger.error('Composite chart calculation error:', error);
      throw error;
    }
  }

  /**
   * Analyze the composite chart structure
   * @param {Object} compositeChart - Composite chart data
   * @returns {Object} Chart analysis
   */
  _analyzeCompositeChart(compositeChart) {
    const analysis = {
      dominantElements: this._analyzeDominantElements(compositeChart),
      dominantQualities: this._analyzeDominantQualities(compositeChart),
      hemisphereEmphasis: this._analyzeHemisphereEmphasis(compositeChart),
      angularPlanets: this._identifyAngularPlanets(compositeChart),
      stellium: this._detectStellium(compositeChart)
    };

    return analysis;
  }

  /**
   * Analyze dominant elements in composite chart
   * @param {Object} compositeChart - Composite chart
   * @returns {Object} Element analysis
   */
  _analyzeDominantElements(compositeChart) {
    const elements = { fire: 0, earth: 0, air: 0, water: 0 };
    const elementMap = {
      Aries: 'fire', Taurus: 'earth', Gemini: 'air', Cancer: 'water',
      Leo: 'fire', Virgo: 'earth', Libra: 'air', Scorpio: 'water',
      Sagittarius: 'fire', Capricorn: 'earth', Aquarius: 'air', Pisces: 'water'
    };

    // Count planets by element
    for (const [planet, data] of Object.entries(compositeChart.planets || {})) {
      if (data.sign && elementMap[data.sign]) {
        elements[elementMap[data.sign]]++;
      }
    }

    const dominantElement = Object.keys(elements).reduce((a, b) =>
      (elements[a] > elements[b] ? a : b)
    );

    return {
      distribution: elements,
      dominant: dominantElement,
      balance: this._assessElementBalance(elements)
    };
  }

  /**
   * Analyze dominant qualities (cardinal/fixed/mutable)
   * @param {Object} compositeChart - Composite chart
   * @returns {Object} Quality analysis
   */
  _analyzeDominantQualities(compositeChart) {
    const qualities = { cardinal: 0, fixed: 0, mutable: 0 };
    const qualityMap = {
      Aries: 'cardinal', Taurus: 'fixed', Gemini: 'mutable', Cancer: 'cardinal',
      Leo: 'fixed', Virgo: 'mutable', Libra: 'cardinal', Scorpio: 'fixed',
      Sagittarius: 'mutable', Capricorn: 'cardinal', Aquarius: 'fixed', Pisces: 'mutable'
    };

    // Count planets by quality
    for (const [planet, data] of Object.entries(compositeChart.planets || {})) {
      if (data.sign && qualityMap[data.sign]) {
        qualities[qualityMap[data.sign]]++;
      }
    }

    const dominantQuality = Object.keys(qualities).reduce((a, b) =>
      (qualities[a] > qualities[b] ? a : b)
    );

    return {
      distribution: qualities,
      dominant: dominantQuality,
      description: this._describeQuality(dominantQuality)
    };
  }

  /**
   * Analyze hemisphere emphasis
   * @param {Object} compositeChart - Composite chart
   * @returns {Object} Hemisphere analysis
   */
  _analyzeHemisphereEmphasis(compositeChart) {
    const hemispheres = {
      eastern: 0, western: 0, northern: 0, southern: 0
    };

    // Count planets by hemisphere
    for (const [planet, data] of Object.entries(compositeChart.planets || {})) {
      const longitude = data.longitude || 0;

      // Eastern vs Western (based on AC-DC axis)
      if (longitude >= 90 && longitude <= 270) {
        hemispheres.eastern++;
      } else {
        hemispheres.western++;
      }

      // Northern vs Southern (based on MC-IC axis)
      if ((longitude >= 0 && longitude <= 90) || (longitude >= 270 && longitude <= 360)) {
        hemispheres.northern++;
      } else {
        hemispheres.southern++;
      }
    }

    return {
      distribution: hemispheres,
      emphasis: this._determineHemisphereEmphasis(hemispheres)
    };
  }

  /**
   * Identify angular planets
   * @param {Object} compositeChart - Composite chart
   * @returns {Array} Angular planets
   */
  _identifyAngularPlanets(compositeChart) {
    const angularPlanets = [];
    const angles = [compositeChart.ascendant || 0, compositeChart.midheaven || 90];

    for (const [planet, data] of Object.entries(compositeChart.planets || {})) {
      const distanceToAsc = Math.min(
        Math.abs(data.longitude - angles[0]),
        360 - Math.abs(data.longitude - angles[0])
      );
      const distanceToMc = Math.min(
        Math.abs(data.longitude - angles[1]),
        360 - Math.abs(data.longitude - angles[1])
      );

      if (distanceToAsc <= 10 || distanceToMc <= 10) {
        angularPlanets.push({
          planet,
          angle: distanceToAsc <= 10 ? 'ascendant' : 'midheaven',
          distance: Math.min(distanceToAsc, distanceToMc)
        });
      }
    }

    return angularPlanets;
  }

  /**
   * Detect stellium in composite chart
   * @param {Object} compositeChart - Composite chart
   * @returns {Object} Stellium analysis
   */
  _detectStellium(compositeChart) {
    const signCounts = {};

    // Count planets by sign
    for (const [planet, data] of Object.entries(compositeChart.planets || {})) {
      if (data.sign) {
        signCounts[data.sign] = (signCounts[data.sign] || 0) + 1;
      }
    }

    const stelliumSign = Object.keys(signCounts).find(sign => signCounts[sign] >= 3);

    return {
      hasStellium: !!stelliumSign,
      sign: stelliumSign || null,
      planetCount: stelliumSign ? signCounts[stelliumSign] : 0,
      description: stelliumSign ? `Strong emphasis on ${stelliumSign} themes in the relationship` : 'No significant stellium detected'
    };
  }

  /**
   * Assess element balance
   * @param {Object} elements - Element distribution
   * @returns {string} Balance assessment
   */
  _assessElementBalance(elements) {
    const values = Object.values(elements);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;

    if (range <= 1) { return 'Well balanced across all elements'; }
    if (range <= 2) { return 'Moderately balanced with some emphasis'; }
    return 'Strong emphasis on certain elements';
  }

  /**
   * Describe quality characteristics
   * @param {string} quality - Dominant quality
   * @returns {string} Quality description
   */
  _describeQuality(quality) {
    const descriptions = {
      cardinal: 'Initiating and action-oriented relationship',
      fixed: 'Stable and committed partnership',
      mutable: 'Adaptable and flexible connection'
    };
    return descriptions[quality] || 'Balanced approach to relationship dynamics';
  }

  /**
   * Determine hemisphere emphasis
   * @param {Object} hemispheres - Hemisphere distribution
   * @returns {string} Emphasis description
   */
  _determineHemisphereEmphasis(hemispheres) {
    const { eastern, western, northern, southern } = hemispheres;

    if (eastern > western) { return 'Focus on personal identity and self-expression'; }
    if (western > eastern) { return 'Emphasis on relationships and partnerships'; }
    if (northern > southern) { return 'Career and public life orientation'; }
    if (southern > northern) { return 'Home and family focus'; }
    return 'Balanced distribution across life areas';
  }

  /**
   * Identify the relationship's purpose from composite chart
   * @param {Object} compositeChart - Composite chart
   * @returns {Array} Relationship purposes
   */
  _identifyRelationshipPurpose(compositeChart) {
    const purposes = [];
    const analysis = this._analyzeCompositeChart(compositeChart);

    // Based on dominant element
    const elementPurposes = {
      fire: 'Inspiration, creativity, and shared adventures',
      earth: 'Stability, security, and building together',
      air: 'Communication, learning, and intellectual connection',
      water: 'Emotional depth, healing, and spiritual growth'
    };

    if (elementPurposes[analysis.dominantElements.dominant]) {
      purposes.push(elementPurposes[analysis.dominantElements.dominant]);
    }

    // Based on dominant quality
    const qualityPurposes = {
      cardinal: 'Creating new beginnings and initiating change',
      fixed: 'Building lasting foundations and deep commitment',
      mutable: 'Learning, adapting, and growing together'
    };

    if (qualityPurposes[analysis.dominantQualities.dominant]) {
      purposes.push(qualityPurposes[analysis.dominantQualities.dominant]);
    }

    // Based on stellium
    if (analysis.stellium.hasStellium) {
      purposes.push(`Intensive focus on ${analysis.stellium.sign} life themes and lessons`);
    }

    if (purposes.length === 0) {
      purposes.push('Harmonious partnership with balanced growth opportunities');
    }

    return purposes.slice(0, 3);
  }

  /**
   * Analyze aspects within the composite chart
   * @param {Object} compositeChart - Composite chart
   * @returns {Object} Aspect analysis
   */
  _analyzeCompositeAspects(compositeChart) {
    // This would require aspect calculation logic
    // For now, return basic structure
    return {
      majorAspects: [],
      configuration: 'Aspect analysis requires additional calculation logic',
      tensionRelease: 'Composite chart aspects show internal relationship dynamics'
    };
  }

  /**
   * Interpret the composite chart overall
   * @param {Object} compositeChart - Composite chart
   * @param {Object} analysis - Chart analysis
   * @returns {string} Overall interpretation
   */
  _interpretCompositeChart(compositeChart, analysis) {
    let interpretation = 'This composite chart represents the relationship as its own entity with unique characteristics. ';

    interpretation += `The chart shows ${analysis.dominantElements.dominant} energy as the dominant element, suggesting ${this._getElementPurpose(analysis.dominantElements.dominant)}. `;

    interpretation += `With ${analysis.dominantQualities.dominant} qualities prominent, this relationship tends toward ${analysis.dominantQualities.description.toLowerCase()}. `;

    if (analysis.stellium.hasStellium) {
      interpretation += `A stellium in ${analysis.stellium.sign} indicates concentrated focus on specific life themes. `;
    }

    interpretation += `${analysis.hemisphereEmphasis.emphasis}. `;

    return interpretation;
  }

  /**
   * Get element purpose description
   * @param {string} element - Dominant element
   * @returns {string} Purpose description
   */
  _getElementPurpose(element) {
    const purposes = {
      fire: 'passionate and dynamic experiences',
      earth: 'practical and stable achievements',
      air: 'intellectual and communicative connections',
      water: 'emotional and intuitive bonding'
    };
    return purposes[element] || 'balanced and harmonious interactions';
  }

  /**
   * Validate input data
   * @param {Object} input - Input data to validate
   */
  validate(input) {
    if (!input) {
      throw new Error('Chart data is required');
    }

    const { chart1, chart2 } = input;

    if (!chart1 || typeof chart1 !== 'object') {
      throw new Error('Valid chart1 object is required');
    }

    if (!chart2 || typeof chart2 !== 'object') {
      throw new Error('Valid chart2 object is required');
    }

    // Validate chart structure
    if (!chart1.planets || typeof chart1.planets !== 'object') {
      throw new Error('chart1 must contain planets data');
    }

    if (!chart2.planets || typeof chart2.planets !== 'object') {
      throw new Error('chart2 must contain planets data');
    }

    if (typeof chart1.ascendant !== 'number' || typeof chart2.ascendant !== 'number') {
      throw new Error('Both charts must have valid ascendant values');
    }
  }

  /**
   * Format result for presentation
   * @param {Object} result - Raw composite chart result
   * @returns {Object} Formatted result
   */
  formatResult(result) {
    return {
      service: 'Composite Chart Analysis',
      timestamp: new Date().toISOString(),
      composite: {
        chart: result.compositeChart,
        analysis: result.compositeAnalysis,
        relationshipPurpose: result.relationshipPurpose,
        compositeAspects: result.compositeAspects
      },
      interpretation: result.interpretation,
      disclaimer: 'Composite charts represent the relationship as a separate entity. This analysis provides insights into the partnership\'s potential and purpose. Professional counseling is recommended for relationship guidance.'
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

module.exports = CompositeChartService;
