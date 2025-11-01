const logger = require('../../../utils/logger');
const sweph = require('sweph');

/**
 * JaiminiKarakaCalculator - Specialized calculator for Jaimini karaka analysis
 * Handles Vedic karaka (significators) system calculations and interpretations
 */
class JaiminiKarakaCalculator {
  constructor() {
    logger.info('Module: JaiminiKarakaCalculator loaded - Jaimini astrology karaka analysis');
  }

  setServices(calendricalService, geocodingService) {
    this.calendricalService = calendricalService;
    this.geocodingService = geocodingService;
  }

  /**
   * Calculate Jaimini Karaka analysis - Vedic karaka (significators) system
   */
  async calculateJaiminiKarakaAnalysis(birthData) {
    try {
      const planetaryPositions = await this._getPlanetaryPositions(birthData);
      const moonLongitude = planetaryPositions.Moon.longitude;

      // Jaimini karaka system - calculate significators based on distance from Moon
      const karakas = this._calculateJaiminiKarakas(planetaryPositions, moonLongitude);

      const introduction = 'Jaimini astrology uses karakas (significators) as controllers of life aspects. Unlike Western ruling planets, Jaimini karakas are determined by each planet\'s distance from the Moon, measuring from 0° to 360°.';

      const primaryKaraka = karakas.find(k => k.significator === 'Atmākāraka (Primary Karaka)');
      const secondaryKaraka = karakas.find(k => k.significator === 'Amātyakāraka (Career Karaka)');

      // Generate insights based on karakas
      const insights = this._generateJaiminiInsights(karakas);

      const guidance = 'In Jaimini system, the Atmākāraka shows your soul\'s expression, while Amātyakāraka reveals career fulfillment. Consider your strongest karakas when making important life decisions. 🕉️';

      return {
        introduction,
        karakas,
        primaryKaraka: primaryKaraka?.planet || 'Undetermined',
        secondaryKaraka: secondaryKaraka?.planet || 'Undetermined',
        insights,
        guidance
      };
    } catch (error) {
      logger.error('Jaimini Karaka calculation error:', error);
      throw new Error('Failed to calculate Jaimini astrology analysis');
    }
  }

  /**
   * Get planetary positions for birth data
   * @private
   */
  async _getPlanetaryPositions(birthData) {
    const { birthDate, birthTime, timezone = 5.5 } = birthData;
    const [day, month, year] = birthDate.split('/').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);

    const utcTime = new Date(Date.UTC(year, month - 1, day, hour - timezone, minute));
    const julianDay = utcTime.getTime() / 86400000 + 2440587.5;

    const planets = {};
    const planetEphemIds = [sweph.SE_SUN, sweph.SE_MOON, sweph.SE_MARS, sweph.SE_MERCURY,
      sweph.SE_JUPITER, sweph.SE_VENUS, sweph.SE_SATURN];
    const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    planetEphemIds.forEach((ephemId, index) => {
      const result = sweph.swe_calc_ut(julianDay, ephemId, sweph.SEFLG_SPEED);
      if (result.rc >= 0) {
        planets[planetNames[index]] = {
          longitude: result.longitude[0],
          latitude: result.latitude[0],
          speed: result.longitude[2]
        };
      }
    });

    return planets;
  }

  // ================= JAIMINI KARAKA METHODS =================

  /**
   * Calculate Jaimini karakas based on distance from Moon
   * @private
   */
  _calculateJaiminiKarakas(planets, moonLongitude) {
    const karakaRanges = [];

    for (const [planetName, planetData] of Object.entries(planets)) {
      if (planetData.longitude !== undefined && planetName !== 'Moon') {
        let distance = planetData.longitude - moonLongitude;
        if (distance < 0) { distance += 360; }
        if (distance >= 360) { distance -= 360; }

        karakaRanges.push({
          planet: planetName,
          distance,
          longitude: planetData.longitude,
          karaka: this._getKarakaFromDistance(distance)
        });
      }
    }

    karakaRanges.sort((a, b) => a.distance - b.distance);

    const karakas = [];
    const karakaAssignments = [
      { significator: 'Atmākāraka (Primary Karaka)', index: 0 },
      { significator: 'Amātyakāraka (Career Karaka)', index: 1 },
      { significator: 'Bhrātṛkāraka (Siblings Karaka)', index: 2 },
      { significator: 'Mātṛkāraka (Mother Karaka)', index: 3 },
      { significator: 'Pitr̥kāraka (Father Karaka)', index: 4 },
      { significator: 'Putrakāraka (Children Karaka)', index: 5 },
      { significator: 'Gnātikāraka (Relatives Karaka)', index: 6 }
    ];

    karakaAssignments.forEach(assignment => {
      if (karakaRanges[assignment.index]) {
        const karaka = karakaRanges[assignment.index];
        karakas.push({
          planet: karaka.planet,
          significator: assignment.significator,
          distance: karaka.distance.toFixed(2),
          description: this._getKarakaDescription(assignment.significator)
        });
      }
    });

    return karakas;
  }

  /**
   * Get karaka type from distance
   * @private
   */
  _getKarakaFromDistance(distance) {
    if (distance < 30) { return 'Atmākāraka (Primary Karaka)'; }
    if (distance < 60) { return 'Amātyakāraka (Career Karaka)'; }
    if (distance < 90) { return 'Bhrātṛkāraka (Siblings Karaka)'; }
    if (distance < 120) { return 'Mātṛkāraka (Mother Karaka)'; }
    if (distance < 150) { return 'Pitr̥kāraka (Father Karaka)'; }
    if (distance < 180) { return 'Putrakāraka (Children Karaka)'; }
    if (distance < 210) { return 'Gnātikāraka (Relatives Karaka)'; }
    return 'Additional Significator';
  }

  /**
   * Get karaka description
   * @private
   */
  _getKarakaDescription(karaka) {
    const descriptions = {
      'Atmākāraka (Primary Karaka)': 'Soul expression, personality, core being',
      'Amātyakāraka (Career Karaka)': 'Profession, career, public status',
      'Bhrātṛkāraka (Siblings Karaka)': 'Siblings, associates, close friends',
      'Mātṛkāraka (Mother Karaka)': 'Mother, nurturing, home environment',
      'Pitr̥kāraka (Father Karaka)': 'Father, authority, traditional values',
      'Putrakāraka (Children Karaka)': 'Children, creativity, legacy',
      'Gnātikāraka (Relatives Karaka)': 'Relatives, community, social connections'
    };
    return descriptions[karaka] || 'General significator';
  }

  /**
   * Generate Jaimini insights
   * @private
   */
  _generateJaiminiInsights(karakas) {
    const insights = [];

    const primaryPlanet = karakas.find(k => k.significator.includes('Primary'))?.planet;
    const careerPlanet = karakas.find(k => k.significator.includes('Career'))?.planet;

    if (primaryPlanet) {
      insights.push(`Your ${primaryPlanet} Atmakaraka suggests your soul's journey involves ${this._getPlanetQualities(primaryPlanet)} expression.`);
    }

    if (careerPlanet) {
      insights.push(`Your Amatyakaraka ${careerPlanet} indicates career fulfillment through ${this._getCareerQualities(careerPlanet)} pathways.`);
    }

    const marsAsKaraka = karakas.some(k => k.planet === 'Mars');
    const saturnAsKaraka = karakas.some(k => k.planet === 'Saturn');

    if (marsAsKaraka) {
      insights.push('Mars as karaka suggests transformative life experiences and disciplined action for growth.');
    }

    if (saturnAsKaraka) {
      insights.push('Saturn karakaship indicates karmic responsibilities and structured life lessons.');
    }

    return insights.slice(0, 3);
  }

  /**
   * Get planet qualities for Jaimini analysis
   * @private
   */
  _getPlanetQualities(planet) {
    const qualities = {
      Sun: 'leadership and self-expression',
      Moon: 'emotional intelligence and adaptability',
      Mars: 'determination and transformative energy',
      Mercury: 'intellectual exploration and communication',
      Jupiter: 'wisdom and philosophical growth',
      Venus: 'harmony and creative expression',
      Saturn: 'discipline and spiritual responsibility'
    };
    return qualities[planet] || 'spiritual growth';
  }

  /**
   * Get career qualities for planet
   * @private
   */
  _getCareerQualities(planet) {
    const qualities = {
      Sun: 'leadership and creative performance',
      Moon: 'public service and emotional care',
      Mars: 'competitive action and heroic endeavors',
      Mercury: 'communication and intellectual work',
      Jupiter: 'teaching and expansive opportunities',
      Venus: 'artistic and relationship-focused careers',
      Saturn: 'authoritative and traditional fields'
    };
    return qualities[planet] || 'professional development';
  }

  /**
   * Health check for JaiminiKarakaCalculator
   * @returns {Object} Health status
   */
  healthCheck() {
    return {
      healthy: true,
      version: '1.0.0',
      name: 'JaiminiKarakaCalculator',
      calculations: ['Jaimini Karakas', 'Significator Analysis', 'Life Insights'],
      status: 'Operational'
    };
  }
}

module.exports = { JaiminiKarakaCalculator };
