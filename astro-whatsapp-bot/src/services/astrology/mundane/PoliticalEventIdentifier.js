class PoliticalEventIdentifier {
  /**
   * Identify significant political events
   * @param {Object} chart - Astrological chart
   * @returns {Array} Significant political events
   */
  identifyPoliticalEvents(chart) {
    const events = [];

    // Check for stelliums in government-related houses
    const stelliums = this.checkForStelliums(chart, [1, 4, 7, 10]);

    stelliums.forEach(stellium => {
      events.push({
        type: 'stellium',
        house: stellium.house,
        planets: stellium.planets,
        significance: `Multiple planetary energies concentrated in ${stellium.house}`,
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
    const { saturn } = chart.planetaryPositions;

    if (!saturn) { return aspects; }

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
    const { uranus } = chart.planetaryPositions;

    if (!uranus) { return aspects; }

    // Uranus conjunct or opposing Mars/other disruptive planets
    Object.entries(chart.planetaryPositions).forEach(([planet, data]) => {
      if (planet === 'mars' || planet === 'uranus') { return; }

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
}

module.exports = { PoliticalEventIdentifier };