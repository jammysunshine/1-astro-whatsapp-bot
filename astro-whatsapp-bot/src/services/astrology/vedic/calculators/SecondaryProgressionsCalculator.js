const logger = require('../../../../utils/logger');
const sweph = require('sweph');

/**
 * Secondary Progressions Calculator
 * Calculates secondary progressed planetary positions for predictive astrology
 */
class SecondaryProgressionsCalculator {
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
   * Calculate enhanced secondary progressions
   * @param {Object} birthData - Birth data
   * @param {Date} targetDate - Date for progressions
   * @returns {Object} Secondary progressions
   */
  async calculateEnhancedSecondaryProgressions(birthData, targetDate = new Date()) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      // Parse birth data
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Calculate days lived
      const birthDateObj = new Date(year, month - 1, day, hour, minute);
      const daysLived = Math.floor((targetDate.getTime() - birthDateObj.getTime()) / (1000 * 60 * 60 * 24));

      // Get coordinates
      const [lat, lng] = await this._getCoordinates(birthPlace);
      const tz = await this._getTimezone(lat, lng, birthDateObj.getTime());

      // Calculate progressed date (day for a year principle)
      const progressedDay = day + daysLived;
      let progressedDate = new Date(year, month - 1, progressedDay);

      // Adjust for year progression
      const solarArc = daysLived / 365.25; // Degrees of progression

      // Calculate progressed planetary positions
      const progressions = await this._calculateProgressedPositions(birthDateObj, progressedDate, solarArc);

      // Calculate aspects in progressed chart
      const aspects = this._calculateProgressedAspects(progressions);

      // Interpret progressions
      const interpretation = this._interpretSecondaryProgressions(progressions, aspects, daysLived);

      return {
        birthData: { birthDate, birthTime, birthPlace },
        targetDate: targetDate.toISOString().split('T')[0],
        daysLived,
        solarArc,
        progressedDate: progressedDate.toISOString().split('T')[0],
        progressedPlanets: progressions,
        aspects,
        interpretation
      };

    } catch (error) {
      logger.error('❌ Error in enhanced secondary progressions:', error);
      throw new Error(`Enhanced secondary progressions calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate progressed planetary positions
   * @private
   */
  async _calculateProgressedPositions(birthDate, progressedDate, solarArc) {
    const progressions = {};
    const planetIds = {
      sun: sweph.SE_SUN,
      moon: sweph.SE_MOON,
      mercury: sweph.SE_MERCURY,
      venus: sweph.SE_VENUS,
      mars: sweph.SE_MARS,
      jupiter: sweph.SE_JUPITER,
      saturn: sweph.SE_SATURN
    };

    // Calculate UTC time for progressed date
    const progressedJD = this._dateToJD(
      progressedDate.getFullYear(),
      progressedDate.getMonth() + 1,
      progressedDate.getDate(),
      progressedDate.getHours() + progressedDate.getMinutes() / 60
    );

    for (const [planet, id] of Object.entries(planetIds)) {
      try {
        const position = sweph.calc(progressedJD, id);

        if (position.longitude !== undefined) {
          const signIndex = Math.floor(position.longitude / 30);
          const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

          // Calculate aspects to natal positions (would need natal chart)
          progressions[planet] = {
            longitude: position.longitude,
            latitude: position.latitude || 0,
            sign: signs[signIndex],
            degrees: Math.floor(position.longitude % 30),
            minutes: Math.floor((position.longitude % 1) * 60),
            seconds: Math.round(((position.longitude % 1) * 60 % 1) * 60),
            aspects: [], // Would be calculated
            significance: this._getProgressionSignificance(planet, position.longitude, solarArc)
          };
        }
      } catch (error) {
        logger.warn(`Error calculating progressed ${planet}:`, error.message);
      }
    }

    return progressions;
  }

  /**
   * Calculate aspects in progressed chart
   * @private
   */
  _calculateProgressedAspects(progressions) {
    const aspects = [];
    const planets = Object.keys(progressions);

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const p1 = progressions[planets[i]];
        const p2 = progressions[planets[j]];

        if (p1.longitude !== undefined && p2.longitude !== undefined) {
          const angle = Math.abs(this._normalizeAngle(p1.longitude - p2.longitude));

          // Check major aspects
          const aspectsToCheck = [
            { name: 'conjunction', angle: 0, orb: 6 },
            { name: 'opposition', angle: 180, orb: 6 },
            { name: 'trine', angle: 120, orb: 6 },
            { name: 'square', angle: 90, orb: 4 },
            { name: 'sextile', angle: 60, orb: 4 }
          ];

          for (const aspect of aspectsToCheck) {
            if (Math.abs(angle - aspect.angle) <= aspect.orb) {
              aspects.push({
                planets: [planets[i], planets[j]],
                aspect: aspect.name,
                angle: angle,
                orb: Math.abs(angle - aspect.angle),
                significance: this._getAspectSignificance(aspect.name, planets[i], planets[j])
              });
            }
          }
        }
      }
    }

    return aspects;
  }

  /**
   * Interpret secondary progressions
   * @private
   */
  _interpretSecondaryProgressions(progressions, aspects, daysLived) {
    const lifeStages = {
      early: daysLived < 365 * 10,
      middle: daysLived < 365 * 30,
      mature: daysLived < 365 * 50,
      later: daysLived >= 365 * 50
    };

    let stage = 'mature'; // Default
    if (lifeStages.early) stage = 'early';
    else if (lifeStages.middle) stage = 'middle';
    else if (lifeStages.later) stage = 'later';

    const interpretations = [];

    // Interpret key planetary progressions
    if (progressions.sun) {
      interpretations.push({
        planet: 'Sun',
        progressedPosition: progressions.sun,
        meaning: `Progressed Sun indicates your evolving sense of self and purpose at the ${stage} stage of life.`
      });
    }

    if (progressions.moon) {
      interpretations.push({
        planet: 'Moon',
        progressedPosition: progressions.moon,
        meaning: `Progressed Moon reflects emotional development and inner life changes during your ${stage} years.`
      });
    }

    return {
      lifeStage: stage,
      age: Math.floor(daysLived / 365.25),
      interpretations,
      aspectsInterpretations: aspects.map(a => ({
        description: `${a.planets[0]} progressed ${a.aspect} progressed ${a.planets[1]}: ${a.significance}`
      })),
      generalGuidance: this._getProgressionGuidance(stage)
    };
  }

  /**
   * Get progression significance
   * @private
   */
  _getProgressionSignificance(planet, longitude, solarArc) {
    const signIndex = Math.floor(longitude / 30);
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

    return `The ${planet}'s progression into ${signs[signIndex]} indicates a period of ${this._getSignThemes(signs[signIndex])}`;
  }

  /**
   * Get aspect significance
   * @private
   */
  _getAspectSignificance(aspect, p1, p2) {
    const significances = {
      conjunction: 'intensity and focus',
      opposition: 'polarity and integration',
      trine: 'harmony and ease',
      square: 'tension and growth',
      sextile: 'opportunity and support'
    };

    return `Brings a period of ${significances[aspect]} between ${p1} and ${p2} energies.`;
  }

  /**
   * Get sign themes
   * @private
   */
  _getSignThemes(sign) {
    const themes = {
      Aries: 'assertive action and new beginnings',
      Taurus: 'practical stability and sensual pleasures',
      Gemini: 'communication and adaptability',
      Cancer: 'emotional nurturing and protection',
      Leo: 'creative self-expression and leadership',
      Virgo: 'analytical service and perfectionism',
      Libra: 'diplomatic balance and partnership',
      Scorpio: 'deep transformation and intensity',
      Sagittarius: 'philosophical exploration and optimism',
      Capricorn: 'disciplined achievement and responsibility',
      Aquarius: 'innovative thinking and community focus',
      Pisces: 'compassionate creativity and spiritual connection'
    };

    return themes[sign] || 'personal growth and development';
  }

  /**
   * Get progression guidance
   * @private
   */
  _getProgressionGuidance(stage) {
    const guidances = {
      early: 'Focus on building foundations and discovering your unique gifts.',
      middle: 'Work on integrating life experiences and expanding your horizons.',
      mature: 'Reflect on life achievements and consider how to contribute to others.',
      later: 'Embrace wisdom and prepare for new phases of understanding.'
    };

    return guidances[stage];
  }

  _normalizeAngle(angle) {
    angle = angle % 360;
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

module.exports = SecondaryProgressionsCalculator;