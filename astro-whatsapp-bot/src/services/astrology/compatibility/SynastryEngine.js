const logger = require('../../../utils/logger');
const { SwissEphemerisCalculator } = require('./SwissEphemerisCalculator');

/**
 * SynastryEngine - Core engine for synastry (relationship astrology) analysis
 * Handles interchart aspects, house overlays, and composite chart calculations
 */
class SynastryEngine {
  constructor(calculator) {
    this.calculator = calculator || new SwissEphemerisCalculator();
    this.logger = logger;
  }

  /**
   * Perform complete synastry analysis between two charts
   * @param {Object} chart1 - First person's chart
   * @param {Object} chart2 - Second person's chart
   * @returns {Object} Complete synastry analysis
   */
  async performSynastryAnalysis(chart1, chart2) {
    try {
      return {
        userChart: chart1,
        partnerChart: chart2,
        interchartAspects: this.calculateInterchartAspects(chart1, chart2),
        houseOverlays: this.calculateHouseOverlays(chart1, chart2),
        compositeChart: this.calculateCompositeChart(chart1, chart2),
        relationshipDynamics: this.analyzeRelationshipDynamics(chart1, chart2),
        synastryHouses: this.getRelationshipHouses(chart1, chart2)
      };
    } catch (error) {
      this.logger.error('Synastry analysis error:', error);
      throw error;
    }
  }

  /**
   * Calculate aspects between two charts (synastry)
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @returns {Array} Array of interchart aspects
   */
  calculateInterchartAspects(chart1, chart2) {
    const aspects = [];
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    // Calculate aspects between each pair of planets
    for (const planet1 of planets) {
      for (const planet2 of planets) {
        if (!chart1.planets[planet1] || !chart2.planets[planet2]) { continue; }

        const pos1 = chart1.planets[planet1].longitude;
        const pos2 = chart2.planets[planet2].longitude;
        const aspectData = this.calculator.findAspect(pos1, pos2);

        if (aspectData) {
          aspects.push({
            planet1,
            planet2,
            aspect: aspectData.aspect,
            aspectName: aspectData.aspectName,
            orb: aspectData.orb,
            significance: this.analyzeAspectSignificance(planet1, planet2, aspectData.aspect),
            type: aspectData.aspect <= 60 ? 'harmonious' : aspectData.aspect >= 90 ? 'challenging' : 'neutral',
            exactness: aspectData.exactness
          });
        }
      }
    }

    return aspects.sort((a, b) => Math.abs(a.orb)); // Sort by tightest aspects
  }

  /**
   * Calculate house overlays (planets in partner's houses)
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @returns {Object} House overlay analysis
   */
  calculateHouseOverlays(chart1, chart2) {
    const overlays = {};

    // Check user's planets in partner's houses
    overlays.userInPartnerHouses = {};

    for (const [planet, data] of Object.entries(chart1.planets)) {
      const house = this.calculator.longitudeToHouse(data.longitude, chart2.ascendant);
      overlays.userInPartnerHouses[planet] = {
        house,
        significance: this.analyzeHouseOverlaySignificance(house, planet)
      };
    }

    // Check partner's planets in user's houses
    overlays.partnerInUserHouses = {};

    for (const [planet, data] of Object.entries(chart2.planets)) {
      const house = this.calculator.longitudeToHouse(data.longitude, chart1.ascendant);
      overlays.partnerInUserHouses[planet] = {
        house,
        significance: this.analyzeHouseOverlaySignificance(house, planet)
      };
    }

    return overlays;
  }

  /**
   * Calculate composite chart (relationship chart)
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @returns {Object} Composite chart
   */
  calculateCompositeChart(chart1, chart2) {
    const composite = {};

    // Calculate midpoint composite
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    composite.planets = {};
    for (const planet of planets) {
      if (chart1.planets[planet] && chart2.planets[planet]) {
        const pos1 = chart1.planets[planet].longitude;
        const pos2 = chart2.planets[planet].longitude;

        // Calculate midpoint
        let midpoint = (pos1 + pos2) / 2;

        // Handle 0-360 wraparound
        if (Math.abs(pos1 - pos2) > 180) {
          if (pos1 < pos2) {
            midpoint = ((pos1 + 360) + pos2) / 2;
          } else {
            midpoint = (pos1 + (pos2 + 360)) / 2;
          }
          if (midpoint >= 360) { midpoint -= 360; }
        }

        composite.planets[planet] = {
          longitude: midpoint,
          sign: this.calculator.longitudeToSign(midpoint),
          degree: midpoint % 30
        };
      }
    }

    // Composite houses (average ascendant positions)
    composite.ascendant = (chart1.ascendant + chart2.ascendant) / 2;
    composite.ascendantSign = this.calculator.longitudeToSign(composite.ascendant);

    return composite;
  }

  /**
   * Analyze relationship dynamics between charts
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @returns {Object} Relationship dynamics analysis
   */
  analyzeRelationshipDynamics(chart1, chart2) {
    const dynamics = {
      communication: 'Neutral',
      intimacy: 'Developing',
      stability: 'Grounding',
      growth: 'Continuous'
    };

    // Analyze based on key planetary aspects between charts
    const aspects = this.calculateInterchartAspects(chart1, chart2);

    const moonAspects = aspects.filter(a => a.planet1 === 'Moon' || a.planet2 === 'Moon').length;
    const venusAspects = aspects.filter(a => a.planet1 === 'Venus' || a.planet2 === 'Venus').length;
    const saturnAspects = aspects.filter(a => a.planet1 === 'Saturn' || a.planet2 === 'Saturn').length;

    if (venusAspects > moonAspects) {
      dynamics.intimacy = 'Romantic and affectionate';
    } else if (moonAspects >= 2) {
      dynamics.intimacy = 'Deep emotional bond';
    }

    if (saturnAspects > 0) {
      dynamics.stability = 'Structured and committed';
    }

    // Add communication analysis
    const mercuryAspects = aspects.filter(a => a.planet1 === 'Mercury' || a.planet2 === 'Mercury').length;
    if (mercuryAspects >= 2) {
      dynamics.communication = 'Strong mental connection';
    } else if (mercuryAspects === 1) {
      dynamics.communication = 'Good communicative flow';
    }

    return dynamics;
  }

  /**
   * Get relationship houses comparison
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @returns {Object} Relationship house data
   */
  getRelationshipHouses(chart1, chart2) {
    return {
      partnership: {
        user7th: chart1.houses[7],
        partner7th: chart2.houses[7],
        compatibility: this.compareHouses(chart1.houses[7], chart2.houses[7])
      },
      intimacy: {
        user8th: chart1.houses[8],
        partner8th: chart2.houses[8],
        compatibility: this.compareHouses(chart1.houses[8], chart2.houses[8])
      },
      family: {
        user4th: chart1.houses[4],
        partner4th: chart2.houses[4],
        compatibility: this.compareHouses(chart1.houses[4], chart2.houses[4])
      }
    };
  }

  /**
   * Compare two houses for compatibility
   * @param {Object} house1 - First house data
   * @param {Object} house2 - Second house data
   * @returns {string} Compatibility description
   */
  compareHouses(house1, house2) {
    return house1.sign === house2.sign ?
      'Harmonious resonance' :
      'Complementary energies';
  }

  /**
   * Analyze aspect significance for relationships
   * @param {string} planet1 - First planet
   * @param {string} planet2 - Second planet
   * @param {number} aspect - Aspect angle
   * @returns {string} Significance description
   */
  analyzeAspectSignificance(planet1, planet2, aspect) {
    const planetPairs = {
      "SunMoon": "Conscious and unconscious unity",
      "SunVenus": "Romantic and affectionate bond",
      "MoonVenus": "Emotional intimacy and nurturing love",
      "SunMars": "Passionate drive and vital energy exchange",
      "VenusMars": "Sexual chemistry and romantic harmony",
      "MoonMars": "Emotional responses to partner's actions",
      "SunMercury": "Clear communication and mental connection",
      "SunSaturn": "Commitment and long-term stability",
      "VenusSaturn": "Devoted love and lasting security"
    };

    const key = `${planet1}${planet2}`;
    const reverseKey = `${planet2}${planet1}`;
    const description = planetPairs[key] || planetPairs[reverseKey] || `${planet1}-${planet2} planetary connection`;

    switch (aspect) {
    case 120: return `Easy flowing harmony in ${description.toLowerCase()}`;
    case 60: return `Supportive energy fostering ${description.toLowerCase()}`;
    case 0: return `Deep integration of ${description.toLowerCase()}`;
    case 90: return `Transformational tension in ${description.toLowerCase()}`;
    case 180: return `Polarity balance in ${description.toLowerCase()}`;
    default: return `Unique dynamic in ${description.toLowerCase()}`;
    }
  }

  /**
   * Analyze house overlay significance
   * @param {number} house - House number
   * @param {string} planet - Planet name
   * @returns {string} Significance description
   */
  analyzeHouseOverlaySignificance(house, planet) {
    const significances = {
      1: `${planet} brings identity and attraction energy`,
      2: `${planet} influences shared values and security`,
      4: `${planet} affects home life and emotional foundation`,
      5: `${planet} brings romance and creative expression`,
      7: `${planet} shapes partnership dynamics`,
      8: `${planet} deepens intimacy and transformation`,
      9: `${planet} expands philosophical connection`,
      10: `${planet} influences reputation and career`,
      11: `${planet} brings friendship and shared goals`,
      12: `${planet} fosters spiritual and karmic bonds`
    };

    return significances[house] || `${planet} in partner's ${house}th house`;
  }
}

module.exports = { SynastryEngine };