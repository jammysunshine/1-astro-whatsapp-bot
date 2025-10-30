
class PoliticalStabilityAssessor {
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
          const { house } = chart.planetaryPositions[planet];
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
    if (!saturnPosition) { return { scoreAdjustment: 0 }; }

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
    if (!uranusPosition) { return { scoreAdjustment: 0 }; }

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
   * Identify key political influences
   * @param {Object} chart - Astrological chart
   * @param {Object} rulership - Country rulership
   * @returns {Array} Key influences
   */
  identifyKeyPoliticalInfluences(chart, rulership) {
    const influences = [];

    // Sun and Saturn positions are primary political tellers
    const { sun } = chart.planetaryPositions;
    const { saturn } = chart.planetaryPositions;
    const { mars } = chart.planetaryPositions;
    const { jupiter } = chart.planetaryPositions;

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
}

module.exports = { PoliticalStabilityAssessor };