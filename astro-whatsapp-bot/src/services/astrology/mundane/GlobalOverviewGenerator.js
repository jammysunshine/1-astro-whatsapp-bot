const logger = require('../../../utils/logger');

/**
 * GlobalOverviewGenerator - Generates global mundane astrology overviews
 * Analyzes dominant themes, global mood, and key transactions for world events
 */
class GlobalOverviewGenerator {
  constructor() {
    logger.info(
      'Module: GlobalOverviewGenerator loaded for global consciousness analysis'
    );
  }

  /**
   * Generate global overview for mundane charts
   * @param {Object} chartData - Astrological chart data
   * @param {string} focusArea - Focus area
   * @returns {Object} Global overview
   */
  generateGlobalOverview(chartData, focusArea) {
    const overview = {
      dominantThemes: this.identifyDominantThemes(chartData),
      globalMood: this.assessGlobalMood(chartData),
      keyTransactions: this.identifyKeyTransactions(chartData),
      collectiveUnconsciousIndicators:
        this.analyzeCollectiveUnconscious(chartData),
      planetaryClimates: this.analyzePlanetaryClimates(chartData)
    };

    return overview;
  }

  /**
   * Identify dominant themes in world events
   * @param {Object} chartData - Chart data
   * @returns {Array} Dominant themes
   */
  identifyDominantThemes(chartData) {
    const themes = [];
    const { sun } = chartData.planetaryPositions;
    const { saturn } = chartData.planetaryPositions;
    const { uranus } = chartData.planetaryPositions;

    if (sun) {
      themes.push('Leadership and authority patterns');
    }

    if (saturn && uranus) {
      const separation = Math.abs(saturn.longitude - uranus.longitude);
      if (separation <= 30) {
        themes.push('Revolutionary restructuring and institutional change');
      }
    }

    if (chartData.planetaryPositions.jupiter) {
      themes.push('Expansion and growth potentials');
    }

    return themes.length > 0 ?
      themes :
      ['Unknown planetary energies - general observation required'];
  }

  /**
   * Assess global mood and collective consciousness
   * @param {Object} chartData - Chart data
   * @returns {string} Global mood assessment
   */
  assessGlobalMood(chartData) {
    const { moon } = chartData.planetaryPositions;

    if (!moon) {
      return 'Unknown collective mood';
    }

    // Moon in different houses affects global emotional state
    switch (moon.house) {
    case 1:
      return 'Bold and initiative-driven global mood';
    case 4:
      return 'Protective and homeland-focused consciousness';
    case 7:
      return 'Relationship and partnership-oriented awareness';
    case 10:
      return 'Authority and leadership-conscious collective energy';
    case 11:
      return 'Community and humanitarian focused global mood';
    case 12:
      return 'Spiritual and introspective international consciousness';
    default:
      return 'Mixed emotional currents in global consciousness';
    }
  }

  /**
   * Identify key transactions and major transits
   * @param {Object} chartData - Chart data
   * @returns {Array} Key transactions
   */
  identifyKeyTransactions(chartData) {
    const transactions = [];

    // Check for major planetary ingresses (movements)
    const outerPlanets = ['saturn', 'uranus', 'neptune', 'pluto'];

    transactions.push(
      'Monitor Saturn transits for structural international changes'
    );
    transactions.push(
      'Observe Uranus placements indicating innovation and revolution'
    );
    transactions.push(
      'Note Jupiter developments for expansion and philosophical shifts'
    );

    // Check for eclipses if critical degrees are prominent
    const eclipseFactors = this.checkEclipseDegrees(chartData);
    if (eclipseFactors.length > 0) {
      transactions.push(
        'Eclipse-like planetary placements suggest major global transitions'
      );
    }

    return transactions;
  }

  /**
   * Analyze collective unconscious indicators
   * @param {Object} chartData - Chart data
   * @returns {Object} Collective unconscious analysis
   */
  analyzeCollectiveUnconscious(chartData) {
    return {
      archetypalInfluences: this.identifyArchetypalInfluences(chartData),
      karmicPatterns: this.analyzeKarmicPatterns(chartData),
      psychologicalClimate: this.assessPsychologicalClimate(chartData),
      transformativePotential: this.identifyTransformativePotential(chartData)
    };
  }

  /**
   * Analyze planetary climates and weather astrology factors
   * @param {Object} chartData - Chart data
   * @returns {Array} Planetary climates
   */
  analyzePlanetaryClimates(chartData) {
    const climates = [];

    const marsSaturnAspects = this.checkMarsSaturnAspects(chartData);
    if (marsSaturnAspects > 0) {
      climates.push(
        'Mars-Saturn aspects indicate disciplined action and structured conflict'
      );
    }

    const venusJupiterTransits = this.checkVenusJupiterTransits(chartData);
    if (venusJupiterTransits > 0) {
      climates.push(
        'Venus-Jupiter influences suggest prosperous and harmonious developments'
      );
    }

    return climates.length > 0 ?
      climates :
      ['Neutral planetary climates influencing global weather'];
  }

  // Helper methods
  checkEclipseDegrees(chartData) {
    // Check planets in critical degrees (0° or 29°)
    const eclipseFactors = [];
    Object.entries(chartData.planetaryPositions).forEach(([planet, data]) => {
      const degree = data.longitude % 30;
      if (degree <= 1 || degree >= 29) {
        eclipseFactors.push(`${planet} at ${degree.toFixed(1)}° ${data.sign}`);
      }
    });
    return eclipseFactors;
  }

  checkMarsSaturnAspects(chartData) {
    const { mars } = chartData.planetaryPositions;
    const { saturn } = chartData.planetaryPositions;

    if (!mars || !saturn) {
      return 0;
    }

    const separation = Math.abs(mars.longitude - saturn.longitude);
    const aspects = [60, 90, 120, 150, 180]; // List of major aspects

    for (const aspect of aspects) {
      if (Math.abs(separation - aspect) <= 8) {
        return 1;
      }
    }

    return 0;
  }

  checkVenusJupiterTransits(chartData) {
    const { venus } = chartData.planetaryPositions;
    const { jupiter } = chartData.planetaryPositions;

    if (!venus || !jupiter) {
      return 0;
    }

    const separation = Math.abs(venus.longitude - jupiter.longitude);
    if (separation <= 15) {
      return 1;
    } // Conjunct or close aspects

    return 0;
  }

  identifyArchetypalInfluences(chartData) {
    return ['Sun = Hero\'s journey'];
  }
  analyzeKarmicPatterns(chartData) {
    return ['Saturn indicates karmic cycles'];
  }
  assessPsychologicalClimate(chartData) {
    return 'Mixed emotional currents';
  }
  identifyTransformativePotential(chartData) {
    return 'High awareness expansion';
  }
}

module.exports = { GlobalOverviewGenerator };
