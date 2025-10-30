const logger = require('../../../utils/logger');
const { MundaneConfig } = require('./MundaneConfig');

/**
 * PoliticalAstrology - World leadership and government analysis
 * Analyzes political events, leadership changes, and governmental transformations
 * using planetary rulerships and mundane astrological principles
 */
class PoliticalAstrology {
  /**
   * @param {MundaneConfig} config - Mundane configuration instance
   */
  constructor(config = new MundaneConfig()) {
    this.logger = logger;
    this.config = config;

    this.logger.info('Module: PoliticalAstrology loaded with world leadership analysis capabilities');
  }

  /**
   * Analyze political situation for a country or region
   * @param {string} country - Country name
   * @param {Object} chart - Astrological chart data
   * @returns {Object} Political analysis
   */
  analyzePoliticalClimate(country, chart) {
    try {
      const rulership = this.config.getCountryRulership(country);
      if (!rulership) {
        this.logger.warn(`No rulership data found for ${country} - using general analysis`);
      }

      const analysis = {
        country,
        rulingPlanets: rulership?.planets || [],
        politicalStability: this.assessPoliticalStability(chart, rulership, country),
        leadershipAnalysis: this.analyzeLeadershipEnergies(chart, rulership),
        governmentChanges: this.predictGovernmentChanges(chart, rulership),
        internationalInfluence: this.assessInternationalRelations(chart, rulership, country),
        politicalEvents: this.identifyPoliticalEvents(chart, rulership),
        timingAnalysis: this.analyzePoliticalTiming(chart, rulership),
        recommendations: this.generatePoliticalRecommendations(analysis)
      };

      return analysis;
    } catch (error) {
      this.logger.error(`Error analyzing political climate for ${country}:`, error);
      return {
        country,
        error: error.message,
        politicalStability: { rating: 'Unknown', factors: [] },
        recommendations: ['Consult professional political astrologer for accurate analysis']
      };
    }
  }

  /**
   * Assess political stability based on planetary factors
   * @param {Object} chart - Astrological chart
   * @param {Object} rulership - Country rulership
   * @param {string} country - Country name
   * @returns {Object} Stability assessment
   */
  assessPoliticalStability(chart, rulership, country) {
    const factors = [];
    let stabilityScore = 50; // Base score

    // Check ruling planet positions
    if (rulership && rulership.planets) {
      rulership.planets.forEach(planet => {
        if (chart.planetaryPositions[planet]) {
          const house = chart.planetaryPositions[planet].house;
          if ([1, 4, 7, 10].includes(house)) {
            // Angular houses - strong leadership position
            stabilityScore += 10;
            factors.push(`Ruling planet ${planet} in powerful angular house demonstrates strong governmental authority`);
          } else if ([6, 8, 12].includes(house)) {
            // Challenging houses - leadership difficulties
            stabilityScore -= 15;
            factors.push(`${planet} in challenging position suggests governmental instability or significant changes`);
          }
        }
      });
    }

    // Consider planetary clusters and aspects
    const saturnFactors = this.analyzeSaturnFactors(chart, factors);
    const uranusFactors = this.analyzeUranusFactors(chart, factors);

    stabilityScore += saturnFactors.scoreAdjustment;
    stabilityScore += uranusFactors.scoreAdjustment;

    // Clamp score between 0-100
    stabilityScore = Math.max(0, Math.min(100, stabilityScore));

    // Determine rating
    let rating;
    let outlook;
    if (stabilityScore >= 75) {
      rating = 'Very Stable';
      outlook = 'Strong governmental control and consistent policies expected';
    } else if (stabilityScore >= 60) {
      rating = 'Stable';
      outlook = 'Generally stable government with minor fluctuations possible';
    } else if (stabilityScore >= 45) {
      rating = 'Moderate';
      outlook = 'Mixed stability with potential for significant political developments';
    } else if (stabilityScore >= 30) {
      rating = 'Unstable';
      outlook = 'Significant political changes and governmental transitions likely';
    } else {
      rating = 'Very Unstable';
      outlook = 'Major political upheaval and governmental restructuring probable';
    }

    return {
      score: stabilityScore,
      rating,
      outlook,
      factors: factors.slice(0, 5), // Limit to most important factors
      keyInfluences: this.identifyKeyPoliticalInfluences(chart, rulership)
    };
  }

  /**
   * Analyze Saturn factors for political stability
   * @param {Object} chart - Astrological chart
   * @param {Array} factors - Existing factors array
   * @returns {Object} Saturn analysis
   */
  analyzeSaturnFactors(chart, factors) {
    const saturnPosition = chart.planetaryPositions.saturn;
    if (!saturnPosition) return { scoreAdjustment: 0 };

    let scoreAdjustment = 0;

    // Saturn represents government, authority, structure
    if (saturnPosition.house === 10) {
      scoreAdjustment += 15;
      factors.push('Saturn in Midheaven suggests strong governmental authority and responsibility');
    } else if (saturnPosition.house === 7 || saturnPosition.house === 11) {
      scoreAdjustment += 10;
      factors.push('Saturn in social houses indicates structured international relations');
    } else if ([6, 8, 12].includes(saturnPosition.house)) {
      scoreAdjustment -= 20;
      factors.push('Saturn in challenging houses may indicate governmental limitations or crises');
    }

    return { scoreAdjustment };
  }

  /**
   * Analyze Uranus factors for political unexpected developments
   * @param {Object} chart - Astrological chart
   * @param {Array} factors - Existing factors array
   * @returns {Object} Uranus analysis
   */
  analyzeUranusFactors(chart, factors) {
    const uranusPosition = chart.planetaryPositions.uranus;
    if (!uranusPosition) return { scoreAdjustment: 0 };

    let scoreAdjustment = 0;

    // Uranus represents revolutions, sudden changes, technology
    if ([1, 4, 7, 10].includes(uranusPosition.house)) {
      scoreAdjustment -= 10;
      factors.push('Uranus in angular position suggests potential for political upheaval or sudden leadership changes');
    } else if (uranusPosition.house === 11) {
      scoreAdjustment -= 15;
      factors.push('Uranus in 11th house indicates revolutionary social movements and reform');
    } else if ([5, 9].includes(uranusPosition.house)) {
      factors.push('Uranus supports progressive political ideologies and creative governance');
    }

    return { scoreAdjustment };
  }

  /**
   * Analyze leadership energies and potentials
   * @param {Object} chart - Astrological chart
   * @param {Object} rulership - Country rulership
   * @returns {Object} Leadership analysis
   */
  analyzeLeadershipEnergies(chart, rulership) {
    const analysis = {
      currentLeadership: this.assessCurrentLeadership(chart, rulership),
      leadershipTransitions: this.analyzeLeadershipTransitions(chart),
      leadershipQualities: this.identifyLeadershipQualities(chart, rulership),
      leadershipChallenges: this.identifyLeadershipChallenges(chart),
      successorPotentials: this.analyzeSuccessorPotentials(chart)
    };

    return analysis;
  }

  /**
   * Assess current leadership situation
   * @param {Object} chart - Astrological chart
   * @param {Object} rulership - Country rulership
   * @returns {Object} Current leadership assessment
   */
  assessCurrentLeadership(chart, rulership) {
    const sun = chart.planetaryPositions.sun;
    const moon = chart.planetaryPositions.moon;

    const assessment = {
      sunPosition: sun ? `Sun in ${sun.sign} (house ${sun.house})` : 'Sun position unknown',
      leaderStrength: this.calculateLeaderStrength(chart, rulership),
      authorityRating: 'Unknown',
      challenges: [],
      opportunities: []
    };

    // Authority rating based on sun/sun's house position
    if (sun && [1, 4, 7, 10].includes(sun.house)) {
      assessment.authorityRating = 'Strong - power consolidated';
      assessment.opportunities.push('Leadership has solid foundation and authority');
    } else if (sun && [6, 8, 12].includes(sun.house)) {
      assessment.authorityRating = 'Challenged - leadership tested';
      assessment.challenges.push('Leadership faces significant difficulties or health issues');
    }

    return assessment;
  }

  /**
   * Calculate leader strength rating
   * @param {Object} chart - Astrological chart
   * @param {Object} rulership - Country rulership
   * @returns {string} Strength rating
   */
  calculateLeaderStrength(chart, rulership) {
    const sun = chart.planetaryPositions.sun;
    if (!sun) return 'Unknown';

    const sunHouse = sun.house;
    const isExalted = this.isPlanetExalted('sun', sun.sign);

    if (sunHouse === 1) {
      return isExalted ? 'Maximum - fully empowered leader' : 'Strong - natural leadership position';
    } else if ([4, 7, 10].includes(sunHouse)) {
      return 'Powerful - secure in authority';
    } else if ([2, 5, 9].includes(sunHouse)) {
      return 'Moderate - competent leadership with some limitations';
    } else {
      return 'Challenged - leadership position difficult';
    }
  }

  /**
   * Check if planet is exalted in a sign
   * @param {string} planet - Planet name
   * @param {string} sign - Zodiac sign
   * @returns {boolean} True if exalted
   */
  isPlanetExalted(planet, sign) {
    const exaltations = {
      sun: 'Aries',
      moon: 'Taurus',
      mercury: 'Virgo',
      venus: 'Pisces',
      mars: 'Capricorn',
      jupiter: 'Cancer',
      saturn: 'Libra'
    };

    return exaltations[planet] === sign;
  }

  /**
   * Analyze potential leadership transitions
   * @param {Object} chart - Astrological chart
   * @returns {Array} Potential transitions
   */
  analyzeLeadershipTransitions(chart) {
    const transitions = [];

    // Check for Uranus/Saturn aspects indicating leadership changes
    const uranus = chart.planetaryPositions.uranus;
    const saturn = chart.planetaryPositions.saturn;

    if (uranus && saturn) {
      const separation = Math.abs(uranus.longitude - saturn.longitude);
      // Check for major aspects (0°, 60°, 90°, 120°, 180°)
      if (separation <= 8) {
        transitions.push('Saturn-Uranus conjunction suggests major governmental restructuring or leadership change');
      } else if (Math.abs(separation - 180) <= 8) {
        transitions.push('Saturn-Uranus opposition indicates tension between traditional and progressive leadership forces');
      }
    }

    // Check Mars/Saturn aspects indicating conflicts or challenges
    const mars = chart.planetaryPositions.mars;
    if (mars && saturn) {
      const separation = Math.abs(mars.longitude - saturn.longitude);
      if (Math.abs(separation - 120) <= 8) {
        transitions.push('Mars-Saturn trine suggests successful but challenging leadership through conflict resolution');
      }
    }

    return transitions;
  }

  /**
   * Identify key political influences
   * @param {Object} chart - Astrological chart
   * @param {Object} rulership - Country rulership
   * @returns {Array} Key influences
   */
  identifyKeyPoliticalInfluences(chart, rulership) {
    const influences = [];

    // Sun and Saturn positions are primary political tellers
    const sun = chart.planetaryPositions.sun;
    const saturn = chart.planetaryPositions.saturn;
    const mars = chart.planetaryPositions.mars;
    const jupiter = chart.planetaryPositions.jupiter;

    if (sun) {
      if (sun.house === 10) {
        influences.push('Solar authority concentrated in government leadership');
      } else if (sun.house === 7) {
        influences.push('Leadership focused on international relations and partnerships');
      }
    }

    if (saturn) {
      if (saturn.house === 10) {
        influences.push('Saturnian discipline and structure in governmental affairs');
      } else if (saturn.house === 4) {
        influences.push('Foundational governmental reforms and restructuring');
      }
    }

    if (mars) {
      if ([1, 4, 7, 10].includes(mars.house)) {
        influences.push('Martial energy in leadership suggests assertive or military-influenced government');
      }
    }

    if (jupiter) {
      if (jupiter.house === 9) {
        influences.push('Jovian expansion through philosophy, education, and international law');
      }
    }

    return influences.slice(0, 3); // Top 3 influences
  }

  /**
   * Predict potential government changes
   * @param {Object} chart - Astrological chart
   * @param {Object} rulership - Country rulership
   * @returns {Object} Government change predictions
   */
  predictGovernmentChanges(chart, rulership) {
    const predictions = {
      likelihoodOfChange: 'Low',
      timeframes: [],
      typesOfChange: [],
      catalysts: [],
      probability: 0
    };

    let changeProbability = 20; // Base probability

    // Uranus factors - sudden changes
    const uranusHouse = chart.planetaryPositions.uranus?.house;
    if (uranusHouse && [1, 4, 7, 10, 11].includes(uranusHouse)) {
      changeProbability += 25;
      predictions.catalysts.push('Revolutionary energies suggest political upheaval');
      predictions.typesOfChange.push('Sudden reforms or revolutionary changes');
      predictions.timeframes.push('0-6 months from chart date');
    }

    // Saturn factors - structured changes
    const saturnHouse = chart.planetaryPositions.saturn?.house;
    if (saturnHouse && [6, 8, 12].includes(saturnHouse)) {
      changeProbability += 15;
      predictions.catalysts.push('Saturn indicates structural governmental limitations');
      predictions.typesOfChange.push('Gradual institutional reforms needed');
      predictions.timeframes.push('6-18 months timeframe');
    }

    // Jupiter factors - expansion or benevolent changes
    const jupiterHouse = chart.planetaryPositions.jupiter?.house;
    if (jupiterHouse && [9, 11].includes(jupiterHouse)) {
      predictions.catalysts.push('Jovian influence suggests beneficial governmental expansion');
      predictions.typesOfChange.push('Positive governance improvements');
    }

    // Update final predictions
    if (changeProbability >= 70) {
      predictions.likelihoodOfChange = 'High';
    } else if (changeProbability >= 50) {
      predictions.likelihoodOfChange = 'Moderate';
    } else if (changeProbability >= 30) {
      predictions.likelihoodOfChange = 'Low-Moderate';
    }

    predictions.probability = Math.min(100, changeProbability);

    return predictions;
  }

  /**
   * Assess international relations potential
   * @param {Object} chart - Astrological chart
   * @param {Object} rulership - Country rulership
   * @param {string} country - Country name
   * @returns {Object} International relations assessment
   */
  assessInternationalRelations(chart, rulership, country) {
    const assessment = {
      relationshipStrength: 'Neutral',
      alliances: [],
      conflicts: [],
      diplomaticOpportunities: [],
      internationalRole: 'Moderate'
    };

    // Venus for diplomacy
    const venus = chart.planetaryPositions.venus;
    if (venus) {
      if (venus.house === 7) {
        assessment.relationshipStrength = 'Strong diplomatic capability';
        assessment.diplomaticOpportunities.push('Favorable international partnerships possible');
      } else if (venus.house === 6) {
        assessment.conflicts.push('Diplomatic tensions with foreign powers');
      }
    }

    // Mars for conflicts
    const mars = chart.planetaryPositions.mars;
    if (mars) {
      if (mars.house === 7) {
        assessment.conflicts.push('Potential conflicts with international partners');
        assessment.relationshipStrength = 'Challenging - assertive foreign policy';
      } else if ([8, 12].includes(mars.house)) {
        assessment.conflicts.push('Deep-seated international conflicts or secret enmities');
      }
    }

    // Jupiter for expansion/international role
    const jupiter = chart.planetaryPositions.jupiter;
    if (jupiter) {
      if (jupiter.house === 9) {
        assessment.internationalRole = 'Educational and philosophical leadership';
        assessment.alliances.push('Strong international cooperation on educational and justice matters');
      } else if (jupiter.house === 7) {
        assessment.alliances.push('Beneficial international trade and legal partnerships');
      }
    }

    return assessment;
  }

  /**
   * Identify significant political events
   * @param {Object} chart - Astrological chart
   * @param {Object} rulership - Country rulership
   * @returns {Array} Significant political events
   */
  identifyPoliticalEvents(chart, rulership) {
    const events = [];

    // Check for stelliums in government-related houses
    const stelliums = this.checkForStelliums(chart, [1, 4, 7, 10]);

    stelliums.forEach(stellium => {
      events.push({
        type: 'stellium',
        house: stellium.house,
        planets: stellium.planets,
        significance: `Multiple planetary energies concentrated in ${this.config.getHouseMeaning(stellium.house)}`,
        impact: 'High'
      });
    });

    // Check for eclipses or critical degrees
    const eclipseFactors = this.checkForEclipseInfluences(chart);
    if (eclipseFactors.length > 0) {
      eclipseFactors.forEach(factor => {
        events.push({
          type: 'eclipse_influence',
          house: factor.house,
          significance: factor.significance,
          impact: 'High',
          timeframe: factor.timeframe
        });
      });
    }

    // Check for Saturn returns or major transits
    const majorTransits = this.checkForMajorTransits(chart);
    if (majorTransits.length > 0) {
      majorTransits.forEach(transit => {
        events.push({
          type: 'major_transit',
          description: transit.description,
          impact: transit.impact,
          timeframe: transit.timeframe
        });
      });
    }

    return events.slice(0, 5); // Limit to most significant events
  }

  /**
   * Check for planetary stelliums in specific houses
   * @param {Object} chart - Astrological chart
   * @param {Array} targetHouses - Houses to check
   * @returns {Array} Stelliums found
   */
  checkForStelliums(chart, targetHouses) {
    const stelliums = [];
    const houseCounts = {};

    // Count planets per house
    Object.values(chart.planetaryPositions).forEach(planet => {
      houseCounts[planet.house] = (houseCounts[planet.house] || 0) + 1;
    });

    // Check for stelliums (3+ planets in same house)
    targetHouses.forEach(house => {
      const count = houseCounts[house] || 0;
      if (count >= 3) {
        const planetsInHouse = Object.entries(chart.planetaryPositions)
          .filter(([planet, data]) => data.house === house)
          .map(([planet, data]) => planet);

        stelliums.push({
          house,
          planetCount: count,
          planets: planetsInHouse
        });
      }
    });

    return stelliums;
  }

  /**
   * Check for eclipse-like influences
   * @param {Object} chart - Astrological chart
   * @returns {Array} Eclipse influences
   */
  checkForEclipseInfluences(chart) {
    const influences = [];

    // Planets at 0° or 29° (beginning or end of signs) have eclipse-like quality
    Object.entries(chart.planetaryPositions).forEach(([planet, data]) => {
      const degree = data.longitude % 30;
      if (degree <= 2 || degree >= 27) {
        influences.push({
          house: data.house,
          planet,
          degree: Math.round(degree),
          significance: `${planet} at critical degree suggests significant political developments`,
          timeframe: degree <= 2 ? 'Near future' : 'On-going or recent'
        });
      }
    });

    return influences;
  }

  /**
   * Check for major planetary transits
   * @param {Object} chart - Astrological chart
   * @returns {Array} Major transits
   */
  checkForMajorTransits(chart) {
    const transits = [];

    // Saturn square/opposition configurations
    const saturnAspects = this.checkSaturnAspects(chart);
    transits.push(...saturnAspects);

    // Uranus revolutionary configurations
    const uranusAspects = this.checkUranusAspects(chart);
    transits.push(...uranusAspects);

    return transits;
  }

  /**
   * Check Saturn aspects for Structural changes
   * @param {Object} chart - Astrological chart
   * @returns {Array} Saturn aspects
   */
  checkSaturnAspects(chart) {
    const aspects = [];
    const saturn = chart.planetaryPositions.saturn;

    if (!saturn) return aspects;

    // Saturn in challenging aspects to other planets
    Object.entries(chart.planetaryPositions).forEach(([planet, data]) => {
      if (planet !== 'saturn') {
        const separation = Math.abs(saturn.longitude - data.longitude);
        // Check for square (90°) or opposition (180°)
        if (Math.abs(separation - 90) <= 8 || Math.abs(separation - 180) <= 8) {
          aspects.push({
            description: `Saturn challenging ${planet} at ${Math.round(separation)}° separation`,
            impact: 'High',
            timeframe: '6-18 months',
            significance: 'Structural governmental changes and institutional reform'
          });
        }
      }
    });

    return aspects;
  }

  /**
   * Check Uranus aspects for Revolutionary developments
   * @param {Object} chart - Astrological chart
   * @returns {Array} Uranus aspects
   */
  checkUranusAspects(chart) {
    const aspects = [];
    const uranus = chart.planetaryPositions.uranus;

    if (!uranus) return aspects;

    // Uranus conjunct or opposing Mars/other disruptive planets
    Object.entries(chart.planetaryPositions).forEach(([planet, data]) => {
      if (planet === 'mars' || planet === 'uranus') return;

      const separation = Math.abs(uranus.longitude - data.longitude);
      if (separation <= 8) {
        aspects.push({
          description: `Uranus conjunct ${planet} suggests radical political changes`,
          impact: 'High',
          timeframe: '0-12 months',
          significance: 'Revolutionary developments and unexpected political shifts'
        });
      }
    });

    return aspects;
  }

  /**
   * Analyze political timing
   * @param {Object} chart - Astrological chart
   * @param {Object} rulership - Country rulership
   * @returns {Object} Timing analysis
   */
  analyzePoliticalTiming(chart, rulership) {
    // This would analyze when political developments are likely to occur
    // based on planetary speeds and house transits
    return {
      favorablePeriods: [],
      challengingPeriods: [],
      majorTransitionPeriods: [],
      stabilityPeriods: []
    };
  }

  /**
   * Identify leadership qualities and potentials
   * @param {Object} chart - Astrological chart
   * @param {Object} rulership - Country rulership
   * @returns {Array} Leadership qualities
   */
  identifyLeadershipQualities(chart, rulership) {
    const qualities = [];

    // Sun qualities
    const sun = chart.planetaryPositions.sun;
    if (sun) {
      if (sun.sign === 'Leo') {
        qualities.push('Natural leadership aptitude and charismatic authority');
      }
      if (sun.house === 1) {
        qualities.push('Strong personal leadership presence and initiative');
      }
    }

    // Saturn qualities
    const saturn = chart.planetaryPositions.saturn;
    if (saturn) {
      if ([4, 7, 10].includes(saturn.house)) {
        qualities.push('Structured leadership with institutional knowledge');
      }
    }

    // Jupiter qualities
    const jupiter = chart.planetaryPositions.jupiter;
    if (jupiter) {
      if ([9, 11].includes(jupiter.house)) {
        qualities.push('Expansive vision and benevolent leadership style');
      }
    }

    return qualities;
  }

  /**
   * Identify leadership challenges
   * @param {Object} chart - Astrological chart
   * @returns {Array} Leadership challenges
   */
  identifyLeadershipChallenges(chart) {
    const challenges = [];

    // Moon challenges (emotional stability)
    const moon = chart.planetaryPositions.moon;
    if (moon && [6, 8, 12].includes(moon.house)) {
      challenges.push('Emotional leadership challenges and public unpopularity');
    }

    // Mercury challenges (communication issues)
    const mercury = chart.planetaryPositions.mercury;
    if (mercury && mercury.house === 12) {
      challenges.push('Communication difficulties with hidden opposition');
    }

    // Neptune challenges (confusion or deception)
    // Note: This would depend on having outer planet data
    challenges.push('Potential for public confusion or unclear policies');

    return challenges.slice(0, 3);
  }

  /**
   * Analyze successor and opposition potentials
   * @param {Object} chart - Astrological chart
   * @returns {Object} Successor analysis
   */
  analyzeSuccessorPotentials(chart) {
    const analysis = {
      potentialSuccessors: [],
      oppositionStrength: 'Unknown',
      successionTimeline: 'Unknown',
      challenges: [],
      opportunities: []
    };

    // Analyze planetary positions for successor indicators

    // Venus opposition (balanced, diplomatic successor)
    const venus = chart.planetaryPositions.venus;
    if (venus && venus.house === 7) {
      analysis.potentialSuccessors.push('Diplomatic and balanced successor likely');
      analysis.opportunities.push('Smooth political transition possible');
    }

    // Mars opposition (confrontational successor)
    const mars = chart.planetaryPositions.mars;
    if (mars && mars.house === 7) {
      analysis.potentialSuccessors.push('Assertive and competitive successor');
      analysis.challenges.push('Potential for contentious transition period');
    }

    // Uranus opposition (unexpected/developments successor)
    const uranus = chart.planetaryPositions.uranus;
    if (uranus && uranus.house === 7) {
      analysis.potentialSuccessors.push('Unexpected or unconventional successor');
      analysis.opportunities.push('Progressive leadership changes');
    }

    return analysis;
  }

  /**
   * Generate political recommendations
   * @param {Object} analysis - Complete political analysis
   * @returns {Array} Recommendations
   */
  generatePoliticalRecommendations(analysis) {
    const recommendations = [];

    // Base recommendations on stability rating
    if (analysis.politicalStability.rating === 'Very Stable') {
      recommendations.push('Current leadership has strong planetary support - focus on continuing successful policies');
      recommendations.push('Build on existing governmental strengths and international alliances');
    } else if (analysis.politicalStability.rating === 'Unstable') {
      recommendations.push('Significant planetary changes indicate need for leadership adaptation and reform');
      recommendations.push('Consider diplomatic approaches to navigate challenging astrological periods');
    }

    // Leadership-specific recommendations
    if (analysis.leadershipAnalysis.leadershipQualities.length > 0) {
      recommendations.push('Emphasize leadership strengths: ' + analysis.leadershipAnalysis.leadershipQualities[0]);
    }

    // International relations guidance
    if (analysis.internationalInfluence.conflicts.length > 0) {
      recommendations.push('Address international conflicts diplomatically to manage astrological tensions');
    }

    return recommendations;
  }

  /**
   * Health check for PoliticalAstrology
   * @returns {Object} Health status
   */
  healthCheck() {
    try {
      const configHealth = this.config.healthCheck();

      // Test basic political analysis
      const testAnalysis = this.analyzePoliticalClimate('United States', {
        planetaryPositions: {
          sun: { house: 10, sign: 'Capricorn', longitude: 285 },
          saturn: { house: 7, sign: 'Aquarius', longitude: 312 },
          mars: { house: 1, sign: 'Aries', longitude: 15 }
        }
      });

      const validAnalysis = testAnalysis && testAnalysis.country && testAnalysis.politicalStability;

      return {
        healthy: configHealth.healthy && validAnalysis,
        configStatus: configHealth,
        politicalAnalysis: validAnalysis,
        version: '1.0.0',
        capabilities: [
          'Political Stability Assessment',
          'Leadership Energy Analysis',
          'Government Change Prediction',
          'International Relations Analysis',
          'Political Event Identification',
          'Successor Potential Analysis',
          'Political Recommendations'
        ],
        status: configHealth.healthy && validAnalysis ? 'Operational' : 'Issues Detected'
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = { PoliticalAstrology };