const logger = require('../../../../utils/logger');
const sweph = require('sweph');

/**
 * Gochar (Planetary Transit) Calculator
 * Calculates Vedic planetary transits and their effects
 */
class GocharCalculator {
  constructor(astrologer, geocodingService) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;
  }

  /**
   * Set services
   * @param {Object} services
   */
  setServices(services) {
    this.services = services;
  }

  /**
   * Calculate Gochar (planetary transits)
   * @param {Object} birthData - Birth data
   * @param {Date} currentDate - Date for transit calculation
   * @returns {Object} Transplant analysis
   */
  async calculateGochar(birthData, currentDate = new Date()) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      // Parse birth data
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get birth coordinates
      const [birthLat, birthLng] = await this._getCoordinates(birthPlace);
      const birthJD = this._dateToJD(year, month, day, hour + minute / 60);

      // Calculate current transit positions
      const currentJD = this._dateToJD(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        currentDate.getDate(),
        currentDate.getHours() + currentDate.getMinutes() / 60
      );

      // Calculate transit aspects
      const transitAspects = await this._calculateTransitAspects(birthJD, currentJD);

      // Calculate transit periods
      const transitPeriods = this._calculateTransitPeriods(currentDate);

      // Analyze transit effects on natal planets
      const transitEffects = await this._analyzeTransitEffects(birthJD, currentJD, birthData);

      return {
        birthData: { birthDate, birthTime, birthPlace },
        currentDate: currentDate.toISOString().split('T')[0],
        transitAspects,
        transitPeriods,
        transitEffects,
        interpretation: this._interpretGochar(transitAspects, transitEffects)
      };
    } catch (error) {
      logger.error('❌ Error in Gochar calculation:', error);
      throw new Error(`Gochar calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate aspects between transiting planets and natal positions
   * @private
   */
  async _calculateTransitAspects(birthJD, currentJD) {
    const aspects = [];
    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

    for (const planet of planets) {
      try {
        const natalPos = sweph.calc(birthJD, this._getPlanetId(planet));
        const transitPos = sweph.calc(currentJD, this._getPlanetId(planet));

        if (natalPos.longitude && transitPos.longitude) {
          const angle = Math.abs(this._normalizeAngle(transitPos.longitude - natalPos.longitude));

          // Transiting planet aspecting natal planet
          const majorAspects = [
            { name: 'conjunction', angle: 0, orb: 2 },
            { name: 'sextile', angle: 60, orb: 3 },
            { name: 'square', angle: 90, orb: 3 },
            { name: 'trine', angle: 120, orb: 4 },
            { name: 'opposition', angle: 180, orb: 4 }
          ];

          for (const aspect of majorAspects) {
            if (Math.abs(angle - aspect.angle) <= aspect.orb) {
              aspects.push({
                transitingPlanet: planet,
                natalPlanet: planet, // Same planet - return to natal degree
                aspect: aspect.name,
                orb: Math.abs(angle - aspect.angle),
                strength: this._calculateAspectStrength(angle, aspect.orb),
                significance: this._getTransitSignificance(planet, aspect.name)
              });
            }
          }

          // Inter-planet aspects (transiting planet aspecting other natal planets)
          for (const natalPlanet of planets.filter(p => p !== planet)) {
            const natalPos2 = sweph.calc(birthJD, this._getPlanetId(natalPlanet));
            if (natalPos2.longitude) {
              const interAngle = Math.abs(this._normalizeAngle(transitPos.longitude - natalPos2.longitude));

              for (const aspect of majorAspects) {
                if (Math.abs(interAngle - aspect.angle) <= aspect.orb) {
                  aspects.push({
                    transitingPlanet: planet,
                    natalPlanet,
                    aspect: aspect.name,
                    orb: Math.abs(interAngle - aspect.angle),
                    strength: this._calculateAspectStrength(interAngle, aspect.orb),
                    significance: this._getInterAspectSignificance(planet, natalPlanet, aspect.name)
                  });
                }
              }
            }
          }
        }
      } catch (error) {
        logger.warn(`Error calculating transit for ${planet}:`, error.message);
      }
    }

    // Sort by strength
    return aspects.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Calculate current transit periods (like Saturn in signs)
   * @private
   */
  _calculateTransitPeriods(currentDate) {
    const periods = {};
    const planets = ['Saturn', 'Jupiter', 'Mars'];

    const currentJD = this._dateToJD(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      currentDate.getDate(),
      12
    );

    for (const planet of planets) {
      try {
        const position = sweph.calc(currentJD, this._getPlanetId(planet));
        if (position.longitude !== undefined) {
          const signIndex = Math.floor(position.longitude / 30);
          const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

          periods[planet.toLowerCase()] = {
            currentSign: signs[signIndex],
            longitude: position.longitude,
            house: this._getSignHouse(signs[signIndex]),
            periodRemaining: this._estimateTransitPeriod(planet, signIndex, position.longitude)
          };
        }
      } catch (error) {
        logger.warn(`Error calculating period for ${planet}:`, error.message);
      }
    }

    return periods;
  }

  /**
   * Analyze transit effects on natal chart
   * @private
   */
  async _analyzeTransitEffects(birthJD, currentJD, birthData) {
    const effects = {
      beneficial: [],
      challenging: [],
      neutral: []
    };

    // Get current moon sign
    const moonPos = sweph.calc(currentJD, sweph.SE_MOON);
    if (moonPos.longitude !== undefined) {
      const signIndex = Math.floor(moonPos.longitude / 30);
      const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

      effects.moonSign = signs[signIndex];
      effects.moonInauspicious = this._checkMoonInauspicious(signs[signIndex]);
    }

    // Check for major transit triggers
    const saturnPos = sweph.calc(currentJD, sweph.SE_SATURN);
    if (saturnPos.longitude !== undefined) {
      const saturnSign = Math.floor(saturnPos.longitude / 30);

      if (saturnSign === 6 || saturnSign === 7) { // Leo or Virgo
        effects.challenging.push('Saturn transit through challenging signs requiring discipline');
      }
    }

    return effects;
  }

  /**
   * Interpret overall Gochar effects
   * @private
   */
  _interpretGochar(transitAspects, transitEffects) {
    const strongAspects = transitAspects.filter(a => a.strength > 7);

    return {
      summary: `Current Gochar shows ${transitAspects.length} transit aspects, with ${strongAspects.length} particularly strong influences.`,
      dominantThemes: this._extractDominantThemes(transitAspects),
      moonConsiderations: transitEffects.moonInauspicious ?
        'Caution advised: Moon transiting challenging nakshatras' :
        'Favorable lunar transits for emotional stability',
      guidance: this._generateTransitGuidance(transitAspects, transitEffects)
    };
  }

  /**
   * Calculate aspect strength
   * @private
   */
  _calculateAspectStrength(angle, maxOrb) {
    const actualOrb = Math.abs(angle);
    return Math.max(0, (maxOrb - actualOrb) / maxOrb * 10);
  }

  /**
   * Get transit significance
   * @private
   */
  _getTransitSignificance(planet, aspect) {
    const significances = {
      Sun: {
        conjunction: 'Identity and vital force activation',
        sextile: 'Opportunities for self-expression',
        square: 'Challenges to ego and will',
        trine: 'Harmonious self-development',
        opposition: 'Balancing self-identity with others'
      },
      Moon: {
        conjunction: 'Emotional intensity and sensitivity',
        sextile: 'Positive emotional opportunities',
        square: 'Emotional challenges and mood swings',
        trine: 'Emotional harmony and intuition',
        opposition: 'Emotional balancing and relationships'
      },
      Mars: {
        conjunction: 'Energy and action initiation',
        sextile: 'Opportunities for assertive action',
        square: 'Conflicts and aggressive energies',
        trine: 'Smooth application of energy',
        opposition: 'Balancing self-assertion with others'
      }
    };

    return significances[planet]?.[aspect] || `${planet} transit bringing ${aspect} influences`;
  }

  /**
   * Get inter-planet aspect significance
   * @private
   */
  _getInterAspectSignificance(transiting, natal, aspect) {
    return `Transiting ${transiting} ${aspect} natal ${natal}: ${this._getPlanetaryInteraction(transiting, natal, aspect)}`;
  }

  /**
   * Get planetary interaction description
   * @private
   */
  _getPlanetaryInteraction(t, n, a) {
    const interactions = {
      'Sun-Moon': 'conscious self and emotional nature',
      'Mercury-Jupiter': 'thinking and philosophy',
      'Venus-Mars': 'love and action drive'
    };

    return interactions[`${t}-${n}`] || `${t} influencing ${n} energies through ${a}`;
  }

  /**
   * Get sign house (traditional house meanings)
   * @private
   */
  _getSignHouse(sign) {
    const houses = {
      Aries: 1, Taurus: 2, Gemini: 3, Cancer: 4, Leo: 5,
      Virgo: 6, Libra: 7, Scorpio: 8, Sagittarius: 9,
      Capricorn: 10, Aquarius: 11, Pisces: 12
    };
    return houses[sign] || 1;
  }

  /**
   * Estimate remaining time in sign
   * @private
   */
  _estimateTransitPeriod(planet, signIndex, longitude) {
    const degreesRemaining = 30 - (longitude % 30);
    const planetSpeeds = { // degrees per day approximation
      Saturn: 0.033,
      Jupiter: 0.083,
      Mars: 0.524
    };

    const speed = planetSpeeds[planet] || 0.1;
    const daysRemaining = Math.round(degreesRemaining / speed);

    return {
      degreesRemaining: Math.round(degreesRemaining * 100) / 100,
      daysRemaining,
      exitDate: new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  }

  /**
   * Check if moon is in inauspicious nakshatra
   * @private
   */
  _checkMoonInauspicious(sign) {
    const challengingSigns = ['Scorpio', 'Capricorn', 'Aquarius'];
    return challengingSigns.includes(sign);
  }

  /**
   * Extract dominant themes
   * @private
   */
  _extractDominantThemes(aspects) {
    const themes = [];

    const planetCount = aspects.reduce((acc, a) => {
      acc[a.transitingPlanet] = (acc[a.transitingPlanet] || 0) + 1;
      return acc;
    }, {});

    const mostActivePlanet = Object.keys(planetCount).reduce((a, b) => (planetCount[a] > planetCount[b] ? a : b), '');

    if (mostActivePlanet) {
      themes.push(`${mostActivePlanet} is most active in current transits`);
    }

    const challengingAspects = aspects.filter(a => ['square', 'opposition'].includes(a.aspect));
    if (challengingAspects.length > aspects.length / 3) {
      themes.push('Period of significant challenges and growth opportunities');
    }

    const harmoniousAspects = aspects.filter(a => ['trine', 'sextile'].includes(a.aspect));
    if (harmoniousAspects.length > aspects.length / 2) {
      themes.push('Generally favorable period for progress');
    }

    return themes;
  }

  /**
   * Generate transit guidance
   * @private
   */
  _generateTransitGuidance(aspects, effects) {
    let guidance = 'Pay attention to transiting planetary influences. ';

    if (effects.moonInauspicious) {
      guidance += 'Be mindful during lunar transits through challenging areas. ';
    }

    guidance += 'Focus on areas activated by current planetary positions for maximum growth.';

    return guidance;
  }

  _getPlanetId(planet) {
    const ids = {
      Sun: sweph.SE_SUN,
      Moon: sweph.SE_MOON,
      Mercury: sweph.SE_MERCURY,
      Venus: sweph.SE_VENUS,
      Mars: sweph.SE_MARS,
      Jupiter: sweph.SE_JUPITER,
      Saturn: sweph.SE_SATURN
    };
    return ids[planet] || sweph.SE_SUN;
  }

  _normalizeAngle(angle) {
    angle %= 360;
    return angle < 0 ? angle + 360 : angle;
  }

  _dateToJD(year, month, day, hour) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    return jd + hour / 24;
  }

  async _getCoordinates(place) {
    return [0, 0];
  }

  async _getTimezone(lat, lng, timestamp) {
    return 0;
  }
}

module.exports = GocharCalculator;
