

class LeadershipAnalyzer {
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
    const { sun } = chart.planetaryPositions;
    const { moon } = chart.planetaryPositions;

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
    const { sun } = chart.planetaryPositions;
    if (!sun) { return 'Unknown'; }

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
    const { uranus } = chart.planetaryPositions;
    const { saturn } = chart.planetaryPositions;

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
    const { mars } = chart.planetaryPositions;
    if (mars && saturn) {
      const separation = Math.abs(mars.longitude - saturn.longitude);
      if (Math.abs(separation - 120) <= 8) {
        transitions.push('Mars-Saturn trine suggests successful but challenging leadership through conflict resolution');
      }
    }

    return transitions;
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
    const { sun } = chart.planetaryPositions;
    if (sun) {
      if (sun.sign === 'Leo') {
        qualities.push('Natural leadership aptitude and charismatic authority');
      }
      if (sun.house === 1) {
        qualities.push('Strong personal leadership presence and initiative');
      }
    }

    // Saturn qualities
    const { saturn } = chart.planetaryPositions;
    if (saturn) {
      if ([4, 7, 10].includes(saturn.house)) {
        qualities.push('Structured leadership with institutional knowledge');
      }
    }

    // Jupiter qualities
    const { jupiter } = chart.planetaryPositions;
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
    const { moon } = chart.planetaryPositions;
    if (moon && [6, 8, 12].includes(moon.house)) {
      challenges.push('Emotional leadership challenges and public unpopularity');
    }

    // Mercury challenges (communication issues)
    const { mercury } = chart.planetaryPositions;
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
    const { venus } = chart.planetaryPositions;
    if (venus && venus.house === 7) {
      analysis.potentialSuccessors.push('Diplomatic and balanced successor likely');
      analysis.opportunities.push('Smooth political transition possible');
    }

    // Mars opposition (confrontational successor)
    const { mars } = chart.planetaryPositions;
    if (mars && mars.house === 7) {
      analysis.potentialSuccessors.push('Assertive and competitive successor');
      analysis.challenges.push('Potential for contentious transition period');
    }

    // Uranus opposition (unexpected/developments successor)
    const { uranus } = chart.planetaryPositions;
    if (uranus && uranus.house === 7) {
      analysis.potentialSuccessors.push('Unexpected or unconventional successor');
      analysis.opportunities.push('Progressive leadership changes');
    }

    return analysis;
  }
}

module.exports = { LeadershipAnalyzer };