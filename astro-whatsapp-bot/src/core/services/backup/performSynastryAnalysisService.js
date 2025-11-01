const logger = require('../../../utils/logger');

/**
 * PerformSynastryAnalysisService - Service for detailed interchart analysis
 * Examines how one person's planets aspect the other's houses and planets
 */
class PerformSynastryAnalysisService {
  constructor() {
    this.calculator = new SynastryEngine();
    logger.info('PerformSynastryAnalysisService initialized');
  }

  /**
   * Execute synastry analysis between two birth charts
   * @param {Object} synastryData - Synastry analysis data
   * @param {Object} synastryData.chart1 - First person's birth chart
   * @param {Object} synastryData.chart2 - Second person's birth chart
   * @returns {Object} Synastry analysis result
   */
  async execute(synastryData) {
    try {
      // Input validation
      this._validateInput(synastryData);

      // Perform synastry analysis
      const result = await this.performSynastryAnalysis(synastryData);

      // Format and return result
      return this._formatResult(result);
    } catch (error) {
      logger.error('PerformSynastryAnalysisService error:', error);
      throw new Error(`Synastry analysis failed: ${error.message}`);
    }
  }

  /**
   * Perform comprehensive synastry analysis
   * @param {Object} synastryData - Chart data for both partners
   * @returns {Object} Detailed synastry analysis
   */
  async performSynastryAnalysis(synastryData) {
    try {
      const { chart1, chart2 } = synastryData;

      // Get complete synastry analysis from calculator
      const synastryResult = await this.calculator.performSynastryAnalysis(chart1, chart2);

      // Generate additional insights and interpretations
      const keyAspects = this._analyzeKeyAspects(synastryResult.interchartAspects);
      const relationshipThemes = this._identifyRelationshipThemes(synastryResult);
      const compatibilityInsights = this._generateCompatibilityInsights(synastryResult);

      return {
        ...synastryResult,
        keyAspects,
        relationshipThemes,
        compatibilityInsights,
        summary: this._createSynastrySummary(synastryResult)
      };
    } catch (error) {
      logger.error('Synastry analysis error:', error);
      throw error;
    }
  }

  /**
   * Analyze key aspects in the synastry
   * @param {Array} aspects - Interchart aspects
   * @returns {Object} Key aspects analysis
   */
  _analyzeKeyAspects(aspects) {
    const keyAspects = {
      harmonious: aspects.filter(a => a.type === 'harmonious').slice(0, 5),
      challenging: aspects.filter(a => a.type === 'challenging').slice(0, 3),
      significant: aspects.filter(a => Math.abs(a.orb) <= 2).slice(0, 3)
    };

    // Add interpretation for each category
    keyAspects.harmoniousInterpretation = this._interpretHarmoniousAspects(keyAspects.harmonious);
    keyAspects.challengingInterpretation = this._interpretChallengingAspects(keyAspects.challenging);
    keyAspects.significantInterpretation = this._interpretSignificantAspects(keyAspects.significant);

    return keyAspects;
  }

  /**
   * Interpret harmonious aspects
   * @param {Array} aspects - Harmonious aspects
   * @returns {string} Interpretation
   */
  _interpretHarmoniousAspects(aspects) {
    if (aspects.length === 0) { return 'Limited harmonious connections suggest areas requiring conscious effort'; }

    const aspectCount = aspects.length;
    const planets = [...new Set(aspects.flatMap(a => [a.planet1, a.planet2]))];

    if (aspectCount >= 4) {
      return `Strong harmonious foundation with ${aspectCount} supportive connections, particularly involving ${planets.slice(0, 3).join(', ')}`;
    } else if (aspectCount >= 2) {
      return `Moderate harmonious support through ${aspectCount} key connections between ${planets.join(' and ')}`;
    } else {
      return `Some harmonious connection through ${planets.join('-')} aspect providing natural ease`;
    }
  }

  /**
   * Interpret challenging aspects
   * @param {Array} aspects - Challenging aspects
   * @returns {string} Interpretation
   */
  _interpretChallengingAspects(aspects) {
    if (aspects.length === 0) { return 'No significant challenging aspects indicate smooth relational dynamics'; }

    const aspectCount = aspects.length;
    const planets = [...new Set(aspects.flatMap(a => [a.planet1, a.planet2]))];

    if (aspectCount >= 3) {
      return `${aspectCount} challenging connections suggest opportunities for growth through understanding ${planets.slice(0, 2).join(' and ')} dynamics`;
    } else {
      return `Some challenging ${planets.join('-')} connections offer valuable learning opportunities`;
    }
  }

  /**
   * Interpret significant aspects (tight orbs)
   * @param {Array} aspects - Significant aspects
   * @returns {string} Interpretation
   */
  _interpretSignificantAspects(aspects) {
    if (aspects.length === 0) { return 'No extremely tight aspects suggest balanced, less intense dynamics'; }

    const planets = [...new Set(aspects.flatMap(a => [a.planet1, a.planet2]))];
    return `Very tight connections between ${planets.join(' and ')} indicate powerful, transformative energies`;
  }

  /**
   * Identify relationship themes from synastry
   * @param {Object} synastryResult - Complete synastry analysis
   * @returns {Array} Relationship themes
   */
  _identifyRelationshipThemes(synastryResult) {
    const themes = [];
    const { houseOverlays, interchartAspects } = synastryResult;

    // Analyze house overlays for relationship themes
    const relationshipHouses = [5, 7, 8];
    const overlayCount = Object.values(houseOverlays.userInPartnerHouses || {})
      .filter(data => relationshipHouses.includes(data.house)).length +
      Object.values(houseOverlays.partnerInUserHouses || {})
        .filter(data => relationshipHouses.includes(data.house)).length;

    if (overlayCount >= 3) {
      themes.push('Deep emotional and relational commitment');
    } else if (overlayCount >= 2) {
      themes.push('Balanced partnership with shared emotional experiences');
    }

    // Analyze aspects for themes
    const venusAspects = interchartAspects.filter(a =>
      a.planet1 === 'Venus' || a.planet2 === 'Venus'
    );

    if (venusAspects.some(a => a.type === 'harmonious')) {
      themes.push('Romantic harmony and affectionate connection');
    }

    const marsAspects = interchartAspects.filter(a =>
      a.planet1 === 'Mars' || a.planet2 === 'Mars'
    );

    if (marsAspects.some(a => a.type === 'harmonious')) {
      themes.push('Passionate and dynamic physical connection');
    }

    const moonAspects = interchartAspects.filter(a =>
      a.planet1 === 'Moon' || a.planet2 === 'Moon'
    );

    if (moonAspects.some(a => a.type === 'harmonious')) {
      themes.push('Emotional security and nurturing bond');
    }

    if (themes.length === 0) {
      themes.push('Unique partnership with individual learning opportunities');
    }

    return themes.slice(0, 4);
  }

  /**
   * Generate compatibility insights
   * @param {Object} synastryResult - Synastry analysis result
   * @returns {Object} Compatibility insights
   */
  _generateCompatibilityInsights(synastryResult) {
    const insights = {
      strengths: [],
      challenges: [],
      growth: [],
      overall: ''
    };

    const { interchartAspects, houseOverlays } = synastryResult;

    // Analyze strengths
    const harmoniousCount = interchartAspects.filter(a => a.type === 'harmonious').length;
    if (harmoniousCount >= 5) {
      insights.strengths.push('Exceptional natural harmony and understanding');
    } else if (harmoniousCount >= 3) {
      insights.strengths.push('Good foundation of supportive planetary connections');
    }

    // Analyze challenges
    const challengingCount = interchartAspects.filter(a => a.type === 'challenging').length;
    if (challengingCount >= 4) {
      insights.challenges.push('Several challenging aspects require patience and communication');
    } else if (challengingCount >= 2) {
      insights.challenges.push('Some challenging connections offer growth opportunities');
    }

    // Analyze growth potential
    if (challengingCount > 0 && harmoniousCount > 0) {
      insights.growth.push('Balanced mix of harmony and challenge supports mutual growth');
    }

    // Overall assessment
    const totalAspects = interchartAspects.length;
    const harmonyRatio = totalAspects > 0 ? harmoniousCount / totalAspects : 0;

    if (harmonyRatio >= 0.6) {
      insights.overall = 'Strong harmonious foundation with excellent compatibility potential';
    } else if (harmonyRatio >= 0.4) {
      insights.overall = 'Balanced compatibility with opportunities for conscious relationship development';
    } else {
      insights.overall = 'Complex dynamics offering significant opportunities for personal and relational growth';
    }

    return insights;
  }

  /**
   * Create synastry summary
   * @param {Object} synastryResult - Synastry analysis result
   * @returns {string} Summary description
   */
  _createSynastrySummary(synastryResult) {
    const { interchartAspects, houseOverlays } = synastryResult;

    const harmoniousCount = interchartAspects.filter(a => a.type === 'harmonious').length;
    const challengingCount = interchartAspects.filter(a => a.type === 'challenging').length;

    let summary = '';

    if (harmoniousCount > challengingCount) {
      summary = `This synastry shows ${harmoniousCount} harmonious connections that create natural ease and understanding between partners. `;
    } else if (challengingCount > harmoniousCount) {
      summary = `This synastry presents ${challengingCount} challenging aspects that offer valuable opportunities for growth and deeper understanding. `;
    } else {
      summary = `This synastry demonstrates a balanced mix of ${harmoniousCount} harmonious and ${challengingCount} challenging connections. `;
    }

    // Add house overlay insights
    const relationshipOverlays = Object.values(houseOverlays.userInPartnerHouses || {})
      .filter(data => [5, 7, 8].includes(data.house)).length;

    if (relationshipOverlays >= 2) {
      summary += 'Strong house overlays in relationship sectors indicate deep emotional commitment and shared experiences.';
    } else {
      summary += 'House placements suggest opportunities for developing deeper relational understanding.';
    }

    return summary;
  }

  /**
   * Validate input data
   * @param {Object} input - Input data to validate
   */
  _validateInput(input) {
    if (!input) {
      throw new Error('Synastry data is required');
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

    // Check for required planets
    const requiredPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    for (const planet of requiredPlanets) {
      if (!chart1.planets[planet] || typeof chart1.planets[planet].longitude !== 'number') {
        throw new Error(`chart1 missing valid longitude for ${planet}`);
      }
      if (!chart2.planets[planet] || typeof chart2.planets[planet].longitude !== 'number') {
        throw new Error(`chart2 missing valid longitude for ${planet}`);
      }
    }
  }

  /**
   * Format result for presentation
   * @param {Object} result - Raw synastry result
   * @returns {Object} Formatted result
   */
  _formatResult(result) {
    return {
      service: 'Synastry Analysis',
      timestamp: new Date().toISOString(),
      synastry: {
        interchartAspects: result.interchartAspects,
        houseOverlays: result.houseOverlays,
        compositeChart: result.compositeChart,
        relationshipDynamics: result.relationshipDynamics,
        synastryHouses: result.synastryHouses
      },
      analysis: {
        keyAspects: result.keyAspects,
        relationshipThemes: result.relationshipThemes,
        compatibilityInsights: result.compatibilityInsights,
        summary: result.summary
      },
      disclaimer: 'Synastry analysis examines astrological compatibility between two individuals. Real relationships involve many factors beyond planetary positions. Professional counseling is recommended for important relationship decisions.'
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

module.exports = PerformSynastryAnalysisService;
