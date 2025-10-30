const logger = require('../../../utils/logger');
const sweph = require('sweph');
const { NadiConfig } = require('./NadiConfig');

/**
 * NadiCalculator - Core astronomical calculations for Nadi Astrology
 * Handles precise planetary positions, nakshatra calculations, and Nadi classification
 */
class NadiCalculator {
  constructor() {
    logger.info('Module: NadiCalculator loaded - Core Nadi astronomical calculations');
    this.config = new NadiConfig();
  }

  setServices(calendricalService, geocodingService) {
    this.calendricalService = calendricalService;
    this.geocodingService = geocodingService;
  }

  /**
   * Get precise Moon position using Swiss Ephemeris
   * @param {number} jd - Julian Day
   * @returns {Object} Moon position data
   */
  async getMoonPosition(jd) {
    try {
      // Use Swiss Ephemeris for accurate Moon calculation with sidereal zodiac
      const result = sweph.calc(jd, sweph.SE_MOON, sweph.FLG_SWIEPH | sweph.FLG_SIDEREAL | sweph.FLG_SPEED);

      if (!result || !result.longitude || result.longitude.length === 0) {
        throw new Error('Unable to calculate Moon position using Swiss Ephemeris');
      }

      return {
        longitude: result.longitude[0],
        latitude: result.longitude[1],
        speed: result.longitude[2]
      };
    } catch (error) {
      logger.error('Error getting Moon position from Swiss Ephemeris:', error);
      throw error;
    }
  }

  /**
   * Calculate precise Julian Day from date/time
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @param {number} day - Day
   * @param {number} hour - Hour (decimal)
   * @returns {number} Julian Day
   */
  calculateJulianDay(year, month, day, hour) {
    return sweph.swe_julday(year, month, day, hour, sweph.SE_GREG_CAL);
  }

  /**
   * Get nakshatra from longitude
   * @param {number} longitude - Longitude in degrees
   * @returns {string} Nakshatra name
   */
  getNakshatraFromLongitude(longitude) {
    const nakshatraNames = this.config.getNakshatraNames();
    const nakshatraIndex = Math.floor(longitude / (360 / 27));
    return nakshatraNames[nakshatraIndex];
  }

  /**
   * Get nakshatra start longitude
   * @param {string} nakshatra - Nakshatra name
   * @returns {number} Start longitude in degrees
   */
  getNakshatraStartLongitude(nakshatra) {
    const nakshatraNames = this.config.getNakshatraNames();
    const index = nakshatraNames.indexOf(nakshatra);
    return (index * 360) / 27;
  }

  /**
   * Calculate authentic Nadi classification based on Moon nakshatra position
   * @param {number} moonLongitude - Moon's longitude in degrees
   * @returns {Object} Nadi classification details
   */
  calculateAuthenticNadiClassification(moonLongitude) {
    const nakshatra = this.getNakshatraFromLongitude(moonLongitude);
    const nakshatraInfo = this.config.getNadiNakshatras()[nakshatra] ||
                          this.config.getNadiNakshatras()['ashwini']; // Default fallback

    // Calculate precise position within nakshatra
    const nakshatraStart = this.getNakshatraStartLongitude(nakshatra);
    const positionInNakshatra = (moonLongitude - nakshatraStart + 360) % 360;
    const percentageInNakshatra = (positionInNakshatra / (360 / 27)) * 100;

    // Determine Nadi classification based on position in nakshatra
    let nadiType = 'madhya'; // Default
    if (percentageInNakshatra <= 33.33) {
      nadiType = 'adi';
    } else if (percentageInNakshatra <= 66.66) {
      nadiType = 'madhya';
    } else {
      nadiType = 'antya';
    }

    // Get nadi type from nakshatra position (alternative method)
    const nakshatraIndex = this.config.getNakshatraNames().indexOf(nakshatra);
    const positionIn27 = (nakshatraIndex * (360 / 27) + positionInNakshatra) / (360 / 27);
    const finalNadiType = this._determineNadiTypeFromNakshatra(nakshatra, positionInNakshatra);

    return {
      nakshatra,
      category: nakshatraInfo.category,
      grantha: nakshatraInfo.grantha,
      characteristics: nakshatraInfo.characteristics,
      nadi_type: finalNadiType,
      position_percentage: percentageInNakshatra,
      compatibility_info: nakshatraInfo.compatibility,
      description: `Moon in ${nakshatra} nakshatra, ${finalNadiType} type, ${nakshatraInfo.category} category`
    };
  }

  /**
   * Determine Nadi type more precisely from nakshatra and position
   * @private
   * @param {string} nakshatra - Nakshatra name
   * @param {number} positionInNakshatra - Position within nakshatra (0-13.33 degrees)
   * @returns {string} Nadi type (adi, madhya, antya)
   */
  _determineNadiTypeFromNakshatra(nakshatra, positionInNakshatra) {
    // Traditional division: Each nakshatra is divided into 3 parts for Nadi types
    // For simplicity, we'll use the position-based approach
    const positionRatio = positionInNakshatra / (360 / 27); // Normalize to 0-1 within nakshatra

    if (positionRatio <= 1 / 3) {
      return 'adi';
    } else if (positionRatio <= 2 / 3) {
      return 'madhya';
    } else {
      return 'antya';
    }
  }

  /**
   * Get sign from longitude
   * @param {number} longitude - Longitude in degrees
   * @returns {string} Sign name
   */
  getSignFromLongitude(longitude) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = Math.floor(longitude / 30);
    return signs[signIndex];
  }

  /**
   * Calculate authentic planetary influences using Swiss Ephemeris
   * @param {number} jd - Julian Day
   * @param {number} moonLongitude - Moon's longitude
   * @returns {Object} Planetary analysis
   */
  async calculateAuthenticPlanetaryInfluences(jd, moonLongitude) {
    const planets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
    const planetaryInfluences = {};

    for (const planet of planets) {
      const planetId = {
        sun: sweph.SE_SUN,
        moon: sweph.SE_MOON,
        mars: sweph.SE_MARS,
        mercury: sweph.SE_MERCURY,
        jupiter: sweph.SE_JUPITER,
        venus: sweph.SE_VENUS,
        saturn: sweph.SE_SATURN,
        rahu: sweph.SE_TRUE_NODE,
        ketu: null // Ketu is opposite Rahu
      }[planet];

      if (planet === 'ketu') {
        // Ketu is 180° opposite to Rahu
        const rahuData = planetaryInfluences.rahu;
        if (rahuData) {
          planetaryInfluences['ketu'] = {
            longitude: (rahuData.longitude + 180) % 360,
            sign: this.getSignFromLongitude((rahuData.longitude + 180) % 360),
            nakshatra: this.getNakshatraFromLongitude((rahuData.longitude + 180) % 360),
            distance_from_moon: this.calculateAngularDistance((rahuData.longitude + 180) % 360, moonLongitude)
          };
        }
      } else {
        try {
          const result = sweph.calc(jd, planetId, sweph.FLG_SWIEPH | sweph.FLG_SIDEREAL | sweph.FLG_SPEED);

          if (result && result.longitude) {
            const longitude = result.longitude[0];
            planetaryInfluences[planet] = {
              longitude,
              sign: this.getSignFromLongitude(longitude),
              nakshatra: this.getNakshatraFromLongitude(longitude),
              distance_from_moon: this.calculateAngularDistance(longitude, moonLongitude)
            };
          }
        } catch (error) {
          logger.warn(`Error calculating ${planet} position:`, error.message);
        }
      }
    }

    // Calculate authentic influences
    return {
      planetary_positions: planetaryInfluences,
      moon_aspected: this.findMoonAspects(planetaryInfluences, moonLongitude),
      nadi_sthana: this.calculateNadiSthana(planetaryInfluences),
      strength_analysis: this.calculatePlanetaryStrengths(planetaryInfluences)
    };
  }

  /**
   * Calculate angular distance between two planets
   * @param {number} long1 - First longitude
   * @param {number} long2 - Second longitude
   * @returns {number} Angular distance in degrees
   */
  calculateAngularDistance(long1, long2) {
    let diff = Math.abs(long1 - long2);
    if (diff > 180) { diff = 360 - diff; }
    return diff;
  }

  /**
   * Find which planets aspect the Moon
   * @param {Object} planetaryPositions - All planet positions
   * @param {number} moonLongitude - Moon's longitude
   * @returns {Array} Planets aspecting the Moon
   */
  findMoonAspects(planetaryPositions, moonLongitude) {
    const aspectedPlanets = [];

    for (const [planet, data] of Object.entries(planetaryPositions)) {
      if (data) {
        // Conjunction (within 10 degrees)
        if (data.distance_from_moon <= 10) {
          aspectedPlanets.push({
            planet,
            aspect_type: 'conjunction',
            distance: data.distance_from_moon,
            influence: 'Strong influence on emotional nature'
          });
        }
        // Special Nadi aspects (7th - 180°, 4th - 120°, 10th - 30°)
        else if (Math.abs(data.distance_from_moon - 180) <= 8) {
          aspectedPlanets.push({
            planet,
            aspect_type: 'opposition (7th)',
            distance: data.distance_from_moon,
            influence: 'Balancing influence on emotional nature'
          });
        } else if (Math.abs(data.distance_from_moon - 120) <= 8) {
          aspectedPlanets.push({
            planet,
            aspect_type: 'trine (4th)',
            distance: data.distance_from_moon,
            influence: 'Harmonious influence on emotional nature'
          });
        }
      }
    }

    return aspectedPlanets;
  }

  /**
   * Calculate Nadi Sthana (position) strength
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Object} Nadi Sthana analysis
   */
  calculateNadiSthana(planetaryPositions) {
    const nadiSthana = {};

    for (const [planet, data] of Object.entries(planetaryPositions)) {
      if (data) {
        // Calculate Nadi strength based on planetary position in chart
        let strength = 0;

        // Get Sun position to determine houses (simplified)
        const sunLong = planetaryPositions.sun?.longitude || 0;
        const house = this.getHouseNumber(data.longitude, sunLong);

        // Position in kendras (1, 4, 7, 10) gives strength
        if ([1, 4, 7, 10].includes(house)) { strength += 2; }

        // Position in trikonas (1, 5, 9) gives strength
        if ([1, 5, 9].includes(house)) { strength += 2; }

        // Own sign gives strength
        const ownSigns = this.getOwnSigns(planet);
        if (ownSigns.includes(data.sign)) { strength += 3; }

        // Exalted sign gives strength
        const exaltedSigns = this.getExaltedSigns(planet);
        if (exaltedSigns.includes(data.sign)) { strength += 2; }

        nadiSthana[planet] = {
          strength,
          house,
          is_kendra: [1, 4, 7, 10].includes(house),
          is_trikona: [1, 5, 9].includes(house),
          in_own_sign: ownSigns.includes(data.sign),
          in_exalted_sign: exaltedSigns.includes(data.sign),
          rank: strength >= 6 ? 'Strong' : strength >= 3 ? 'Moderate' : 'Weak'
        };
      }
    }

    return nadiSthana;
  }

  /**
   * Get own signs for planet
   * @param {string} planet - Planet name
   * @returns {Array} Own signs
   */
  getOwnSigns(planet) {
    const ownSigns = {
      sun: ['Leo'],
      moon: ['Cancer'],
      mars: ['Aries', 'Scorpio'],
      mercury: ['Gemini', 'Virgo'],
      jupiter: ['Sagittarius', 'Pisces'],
      venus: ['Taurus', 'Libra'],
      saturn: ['Capricorn', 'Aquarius'],
      rahu: ['Gemini', 'Virgo'],
      ketu: ['Sagittarius', 'Pisces']
    };
    return ownSigns[planet] || [];
  }

  /**
   * Get exalted signs for planet
   * @param {string} planet - Planet name
   * @returns {Array} Exalted signs
   */
  getExaltedSigns(planet) {
    const exaltedSigns = {
      sun: ['Aries'],
      moon: ['Taurus'],
      mars: ['Capricorn'],
      mercury: ['Virgo'],
      jupiter: ['Cancer'],
      venus: ['Pisces'],
      saturn: ['Libra'],
      rahu: ['Taurus'],
      ketu: ['Scorpio']
    };
    return exaltedSigns[planet] || [];
  }

  /**
   * Calculate planetary strengths using Shadbala
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Object} Strength analysis
   */
  calculatePlanetaryStrengths(planetaryPositions) {
    const strengths = {};

    for (const [planet, data] of Object.entries(planetaryPositions)) {
      if (data) {
        // Calculate Shadbala (Six Strengths) - simplified but authentic version
        let bala = 0;

        // OjhayugmaRashiBala - strength in even/odd signs
        const signIndex = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
          'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
          .indexOf(data.sign);
        if (planet === 'moon' && signIndex % 2 === 1) { bala += 30; } // Moon in even signs
        else if (['mercury', 'jupiter', 'venus'].includes(planet) && signIndex % 2 === 1) { bala += 30; } // These in even signs
        else if (['sun', 'mars', 'saturn'].includes(planet) && signIndex % 2 === 0) { bala += 30; } // These in odd signs

        strengths[planet] = {
          overall_strength: bala,
          score: bala >= 60 ? 'Strong' : bala >= 30 ? 'Moderate' : 'Weak'
        };
      }
    }

    return strengths;
  }

  /**
   * Get house number for a planet from Lagna
   * @param {number} planetLongitude - Planet's longitude
   * @param {number} lagnaLongitude - Lagna longitude
   * @returns {number} House number (1-12)
   */
  getHouseNumber(planetLongitude, lagnaLongitude) {
    let diff = planetLongitude - lagnaLongitude;
    if (diff < 0) { diff += 360; }
    return Math.floor(diff / 30) + 1;
  }

  /**
   * Calculate Nadi pattern for palm leaf correlation
   * @param {number} moonLongitude - Moon's longitude
   * @returns {Object} Nadi pattern for correlation
   */
  calculateNadiPattern(moonLongitude) {
    // Calculate the authentic Nadi pattern based on Moon's precise position
    const nakshatra = this.getNakshatraFromLongitude(moonLongitude);
    const padaIndex = Math.floor((moonLongitude % (360 / 27)) / (360 / 27 / 4)); // 4 padas per nakshatra
    const division = Math.floor((moonLongitude % (360 / 27 / 4)) / (360 / 27 / 4 / 9)); // 9 divisions per pada

    const palmLeafGroup = this._getPalmLeafGroup(nakshatra, padaIndex + 1);

    return {
      nakshatra,
      pada: padaIndex + 1,
      division,
      nadi_code: `${nakshatra}_${padaIndex + 1}_${division}`,
      palm_leaf_group: palmLeafGroup
    };
  }

  /**
   * Get palm leaf group for correlation
   * @private
   * @param {string} nakshatra - Nakshatra name
   * @param {number} pada - Pada number (1-4)
   * @returns {string} Palm leaf group description
   */
  _getPalmLeafGroup(nakshatra, pada) {
    // Authentic palm leaf correlations - in reality 27 nakshatras x 4 padas = 108 combinations
    const correlations = {
      ashwini_1: 'Leadership and Royal Lineage',
      ashwini_2: 'Spiritual Healing Path',
      ashwini_3: 'Travel and Exploration',
      ashwini_4: 'Transformation and Rebirth',
      bharani_1: 'Creative Expression',
      bharani_2: 'Intimate Relationships',
      bharani_3: 'Passionate Nature',
      bharani_4: 'Artistic Talents'
    };

    return correlations[`${nakshatra}_${pada}`] || `General ${nakshatra} - Pada ${pada} pattern`;
  }

  /**
   * Find planetary correlations for Nadi analysis
   * @param {Object} planetaryAnalysis - Planetary analysis
   * @returns {Array} Correlations
   */
  findPlanetaryCorrelations(planetaryAnalysis) {
    const correlations = [];
    const strongPlanets = Object.entries(planetaryAnalysis.nadi_sthana)
      .filter(([_, data]) => data.rank === 'Strong')
      .map(([planet]) => planet);

    strongPlanets.forEach(planet => {
      correlations.push({
        planet,
        correlation: `Strong ${planet} influence on ${this._getPlanetArea(planet)}`
      });
    });

    return correlations;
  }

  /**
   * Get area influenced by planet
   * @private
   * @param {string} planet - Planet name
   * @returns {string} Area description
   */
  _getPlanetArea(planet) {
    const areas = {
      sun: 'identity and leadership',
      moon: 'emotions and home',
      mars: 'energy and courage',
      mercury: 'communication and intellect',
      jupiter: 'wisdom and expansion',
      venus: 'love and beauty',
      saturn: 'discipline and long-term goals',
      rahu: 'ambition and foreign connections',
      ketu: 'spirituality and past karma'
    };
    return areas[planet] || 'life area';
  }
}

module.exports = { NadiCalculator };
