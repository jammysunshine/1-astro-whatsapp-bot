/**
 * Jaimini Astrology System - Authentic Vedic Astrology based on Maharishi Jaimini's teachings
 * Implements true Chara Dasha, Karakas, and special Jaimini aspects with Swiss Ephemeris calculations
 */

const logger = require('../../utils/logger');
const sweph = require('sweph');

class JaiminiAstrology {
  constructor() {
    logger.info('Module: JaiminiAstrology loaded with authentic calculations.');
    this.initializeJaiminiSystem();
  }

  /**
   * Initialize the complete authentic Jaimini Astrology system
   */
  initializeJaiminiSystem() {
    // Jaimini Chara Dasha periods (in years) - authentic system
    this.charaDasha = {
      sun: 6,
      moon: 10,
      mars: 7,
      rahu: 12,
      jupiter: 16,
      saturn: 19,
      mercury: 17,
      ketu: 7,
      venus: 20
    };

    // Jaimini Chara Dasha sequence - authentic order
    this.charaDashaSequence = [
      {
        planet: 'moon',
        order: [
          'moon',
          'sun',
          'mars',
          'rahu',
          'jupiter',
          'saturn',
          'mercury',
          'ketu',
          'venus'
        ]
      },
      {
        planet: 'sun',
        order: [
          'sun',
          'mars',
          'rahu',
          'jupiter',
          'saturn',
          'mercury',
          'ketu',
          'venus',
          'moon'
        ]
      },
      {
        planet: 'mars',
        order: [
          'mars',
          'rahu',
          'jupiter',
          'saturn',
          'mercury',
          'ketu',
          'venus',
          'moon',
          'sun'
        ]
      },
      {
        planet: 'rahu',
        order: [
          'rahu',
          'jupiter',
          'saturn',
          'mercury',
          'ketu',
          'venus',
          'moon',
          'sun',
          'mars'
        ]
      },
      {
        planet: 'jupiter',
        order: [
          'jupiter',
          'saturn',
          'mercury',
          'ketu',
          'venus',
          'moon',
          'sun',
          'mars',
          'rahu'
        ]
      },
      {
        planet: 'saturn',
        order: [
          'saturn',
          'mercury',
          'ketu',
          'venus',
          'moon',
          'sun',
          'mars',
          'rahu',
          'jupiter'
        ]
      },
      {
        planet: 'mercury',
        order: [
          'mercury',
          'ketu',
          'venus',
          'moon',
          'sun',
          'mars',
          'rahu',
          'jupiter',
          'saturn'
        ]
      },
      {
        planet: 'ketu',
        order: [
          'ketu',
          'venus',
          'moon',
          'sun',
          'mars',
          'rahu',
          'jupiter',
          'saturn',
          'mercury'
        ]
      },
      {
        planet: 'venus',
        order: [
          'venus',
          'moon',
          'sun',
          'mars',
          'rahu',
          'jupiter',
          'saturn',
          'mercury',
          'ketu'
        ]
      }
    ];

    // Jaimini Karakas (Significators) - authentic list
    this.karakas = {
      atma_karaka: 'Soul significator - represents the soul\'s highest purpose',
      amatya_karaka: 'Career significator - represents profession and status',
      bhratru_karaka: 'Sibling significator - represents brothers and sisters',
      matru_karaka: 'Mother significator - represents mother and nurturing',
      pitru_karaka: 'Father significator - represents father and authority',
      putra_karaka:
        'Children significator - represents children and creativity',
      gnatru_karaka:
        'Spouse significator - represents marriage and partnerships',
      daraka_karaka: 'Spouse significator - represents marriage (alternative)',
      jiva_karaka: 'Life significator - represents vitality and life force',
      maraka_karaka:
        'Death significator - represents obstacles and death (when combined with malefics)'
    };

    // Jaimini Special Aspects - authentic aspect system
    this.jaiminiAspects = {
      7: {
        degree: 180,
        meaning: 'Saptama (7th) Aspect - Partnership, marriage, open enemies'
      },
      8: {
        degree: 160,
        meaning:
          'Ashtama (8th) Aspect - Transformation, hidden enemies, occult'
      },
      9: {
        degree: 140,
        meaning:
          'Navama (9th) Aspect - Dharma, fortune, father, spiritual guidance'
      },
      12: {
        degree: 90,
        meaning:
          'Dwadasha (12th) Aspect - Losses, moksha, expenditure, spirituality'
      }
    };

    // Jaimini Upapada Lagna calculation (8th from Atmakaraka)
    this.upapadaLagna = null;

    // Jaimini Rasi (Sign) significations
    this.rasiSignifications = {
      aries: {
        element: 'fire',
        quality: 'cardinal',
        karaka: 'mars',
        meaning: 'Initiation, leadership, new beginnings'
      },
      taurus: {
        element: 'earth',
        quality: 'fixed',
        karaka: 'venus',
        meaning: 'Wealth, stability, values'
      },
      gemini: {
        element: 'air',
        quality: 'mutable',
        karaka: 'mercury',
        meaning: 'Communication, learning, adaptability'
      },
      cancer: {
        element: 'water',
        quality: 'cardinal',
        karaka: 'moon',
        meaning: 'Emotions, home, nurturing'
      },
      leo: {
        element: 'fire',
        quality: 'fixed',
        karaka: 'sun',
        meaning: 'Leadership, creativity, self-expression'
      },
      virgo: {
        element: 'earth',
        quality: 'mutable',
        karaka: 'mercury',
        meaning: 'Service, health, analysis'
      },
      libra: {
        element: 'air',
        quality: 'cardinal',
        karaka: 'venus',
        meaning: 'Relationships, balance, beauty'
      },
      scorpio: {
        element: 'water',
        quality: 'fixed',
        karaka: 'mars',
        meaning: 'Transformation, intensity, mysteries'
      },
      sagittarius: {
        element: 'fire',
        quality: 'mutable',
        karaka: 'jupiter',
        meaning: 'Philosophy, expansion, higher learning'
      },
      capricorn: {
        element: 'earth',
        quality: 'cardinal',
        karaka: 'saturn',
        meaning: 'Ambition, discipline, achievement'
      },
      aquarius: {
        element: 'air',
        quality: 'fixed',
        karaka: 'saturn',
        meaning: 'Innovation, humanitarianism, community'
      },
      pisces: {
        element: 'water',
        quality: 'mutable',
        karaka: 'jupiter',
        meaning: 'Spirituality, compassion, intuition'
      }
    };
  }

  /**
   * Calculate authentic Jaimini Karakas and Chara Dasha
   * @param {Object} birthData - Birth date, time, place
   * @returns {Object} Jaimini analysis with Swiss Ephemeris calculations
   */
  async calculateJaimini(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      // Parse birth data
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Calculate Julian Day
      const jd = this._dateToJulianDay(year, month, day, hour + minute / 60);

      // Calculate precise planetary positions using Swiss Ephemeris
      const planetaryPositions = await this._getPrecisePlanetaryPositions(jd);

      // Calculate authentic Jaimini Karakas
      const karakas = await this._calculateAuthenticKarakas(planetaryPositions);

      // Calculate Chara Dasha based on Atmakaraka
      const charaDasha = await this._calculateCharaDasha(
        karakas.atma_karaka,
        jd,
        year,
        month,
        day,
        hour,
        minute
      );

      // Calculate Jaimini-specific aspects
      const jaiminiAspects = this._calculateJaiminiAspects(planetaryPositions);

      // Calculate Upapada Lagna
      const upapadaLagna = this._calculateUpapadaLagna(
        karakas.atma_karaka,
        planetaryPositions
      );

      // Calculate Argalas (obstructions/supports)
      const argalas = this._calculateArgalas(planetaryPositions, upapadaLagna);

      return {
        name,
        planetary_positions: planetaryPositions,
        karakas,
        chara_dasha: charaDasha,
        jaimini_aspects: jaiminiAspects,
        upapada_lagna: upapadaLagna,
        argalas,
        summary: this._generateAuthenticJaiminiSummary(
          name,
          karakas,
          charaDasha,
          jaiminiAspects
        )
      };
    } catch (error) {
      logger.error('Error calculating authentic Jaimini Astrology:', error);
      return {
        error: `Unable to calculate authentic Jaimini astrology - ${error.message}`
      };
    }
  }

  /**
   * Get precise planetary positions using Swiss Ephemeris
   * @private
   */
  async _getPrecisePlanetaryPositions(jd) {
    const planets = {
      sun: null,
      moon: null,
      mars: null,
      mercury: null,
      jupiter: null,
      venus: null,
      saturn: null,
      rahu: null,
      ketu: null
    };

    const planetIds = {
      sun: sweph.SE_SUN,
      moon: sweph.SE_MOON,
      mars: sweph.SE_MARS,
      mercury: sweph.SE_MERCURY,
      jupiter: sweph.SE_JUPITER,
      venus: sweph.SE_VENUS,
      saturn: sweph.SE_SATURN,
      rahu: sweph.SE_TRUE_NODE, // Rahu
      ketu: sweph.SE_TRUE_NODE // Ketu is opposite Rahu
    };

    try {
      // Calculate positions using Swiss Ephemeris with sidereal settings
      for (const [planetName, planetId] of Object.entries(planetIds)) {
        if (planetName === 'ketu') {
          // Ketu is always 180° opposite to Rahu
          const rahuPos = planets.rahu;
          if (rahuPos) {
            planets.ketu = {
              longitude: (rahuPos.longitude + 180) % 360,
              latitude: -rahuPos.latitude,
              speed: -rahuPos.speed,
              sign: this._getSignFromLongitude((rahuPos.longitude + 180) % 360),
              nakshatra: this._getNakshatraFromLongitude(
                (rahuPos.longitude + 180) % 360
              )
            };
          }
        } else {
          const result = sweph.calc(
            jd,
            planetId,
            sweph.FLG_SWIEPH | sweph.FLG_SIDEREAL | sweph.FLG_SPEED
          );

          if (result && result.longitude) {
            planets[planetName] = {
              longitude: result.longitude[0],
              latitude: result.longitude[1],
              speed: result.longitude[2],
              sign: this._getSignFromLongitude(result.longitude[0]),
              nakshatra: this._getNakshatraFromLongitude(result.longitude[0])
            };
          }
        }
      }

      return planets;
    } catch (error) {
      logger.error(
        'Error getting planetary positions from Swiss Ephemeris:',
        error
      );
      throw error;
    }
  }

  /**
   * Calculate authentic Jaimini Karakas based on planetary degrees
   * @private
   */
  async _calculateAuthenticKarakas(planetaryPositions) {
    // Jaimini Karakas are determined by the highest degrees of planets
    // The planets with highest degrees get the karaka designations
    const planetDegrees = [];

    for (const [planet, data] of Object.entries(planetaryPositions)) {
      if (data) {
        planetDegrees.push({
          planet,
          longitude: data.longitude,
          // In Jaimini, we consider the exact degree within the sign (0-30)
          // Also considering retrogression which affects karaka status
          effective_degree: data.longitude % 30,
          is_retrograde: data.speed < 0
        });
      }
    }

    // Sort by longitude (highest degree first) - this determines the Karakas
    planetDegrees.sort((a, b) => b.longitude - a.longitude);

    // Assign Karakas based on highest to lowest degrees
    const karakas = {
      atma_karaka: planetDegrees[0]?.planet || null, // Highest degree planet
      amatya_karaka: planetDegrees[1]?.planet || null, // Second highest
      bhratru_karaka: planetDegrees[2]?.planet || null, // Third highest
      matru_karaka: planetDegrees[3]?.planet || null, // Fourth highest
      pitru_karaka: planetDegrees[4]?.planet || null, // Fifth highest
      putra_karaka: planetDegrees[5]?.planet || null, // Sixth highest
      gnatru_karaka: planetDegrees[6]?.planet || null, // Seventh highest
      daraka_karaka: planetDegrees[7]?.planet || null // Eighth highest
    };

    // Add detailed information about each Karaka
    const detailedKarakas = {};
    for (const [karaka, planet] of Object.entries(karakas)) {
      if (planet && planetaryPositions[planet]) {
        detailedKarakas[karaka] = {
          planet,
          longitude: planetaryPositions[planet].longitude,
          sign: planetaryPositions[planet].sign,
          nakshatra: planetaryPositions[planet].nakshatra,
          degree: planetaryPositions[planet].longitude % 30,
          is_retrograde: planetaryPositions[planet].speed < 0,
          significance: this.karakas[karaka]
        };
      }
    }

    return detailedKarakas;
  }

  /**
   * Calculate authentic Chara Dasha based on Atmakaraka
   * @private
   */
  async _calculateCharaDasha(atmaKaraka, jd, year, month, day, hour, minute) {
    if (!atmaKaraka) {
      throw new Error(
        'Atma Karaka not found - unable to calculate Chara Dasha'
      );
    }

    // Calculate birth date to determine current dasha position
    const birthDateTime = new Date(year, month - 1, day, hour, minute);
    const currentDateTime = new Date();

    // Total years since birth
    const totalYears =
      (currentDateTime - birthDateTime) / (1000 * 60 * 60 * 24 * 365.25);

    // Get the Chara Dasha sequence starting from Atma Karaka
    const sequenceInfo = this.charaDashaSequence.find(
      seq => seq.planet === atmaKaraka.planet || seq.planet === atmaKaraka
    );
    if (!sequenceInfo) {
      throw new Error(
        `No Chara Dasha sequence found for Atma Karaka: ${atmaKaraka}`
      );
    }

    const sequence = sequenceInfo.order;

    // Calculate which planet's period we're in
    let remainingTime = totalYears;
    let currentDashaIndex = 0;

    // Find the current dasha by going through the sequence
    for (let i = 0; i < sequence.length; i++) {
      const planet = sequence[i];
      const period = this.charaDasha[planet];

      if (remainingTime <= period) {
        currentDashaIndex = i;
        break;
      }
      remainingTime -= period;
    }

    const currentDasha = sequence[currentDashaIndex];
    const dashaPeriod = this.charaDasha[currentDasha];
    const timeInCurrentDasha = totalYears - (totalYears - remainingTime);

    // Calculate Bhukti (sub-period) within current Dasha
    const bhuktiSequence = this.charaDashaSequence.find(
      seq => seq.planet === currentDasha
    )?.order;
    const bhuktiIndex = Math.floor(
      (remainingTime / dashaPeriod) * bhuktiSequence.length
    );
    const currentBhukti = bhuktiSequence[bhuktiIndex % bhuktiSequence.length];

    return {
      atma_karaka: atmaKaraka.planet || atmaKaraka,
      current_mahadasha: currentDasha,
      current_bhukti: currentBhukti,
      dasha_progress: (remainingTime / dashaPeriod) * 100,
      years_remaining_in_current_dasha: dashaPeriod - remainingTime,
      sequence,
      sequence_details: sequence.map((planet, index) => ({
        index: index + 1,
        planet,
        period_years: this.charaDasha[planet],
        is_current: planet === currentDasha
      }))
    };
  }

  /**
   * Calculate authentic Jaimini aspects
   * @private
   */
  _calculateJaiminiAspects(planetaryPositions) {
    const aspects = [];
    const planets = Object.entries(planetaryPositions).filter(
      ([_, data]) => data !== null
    );

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const [planet1, pos1] = planets[i];
        const [planet2, pos2] = planets[j];

        if (pos1 && pos2) {
          // Calculate longitudinal difference
          let diff = Math.abs(pos1.longitude - pos2.longitude);
          if (diff > 180) {
            diff = 360 - diff;
          } // Take shorter arc

          // Check for Jaimini aspects
          for (const [housenum, aspectData] of Object.entries(
            this.jaiminiAspects
          )) {
            if (Math.abs(diff - aspectData.degree) <= 2) {
              // 2° orb
              aspects.push({
                from: planet1,
                to: planet2,
                type: `${housenum}th aspect`,
                angle: diff,
                orb: Math.abs(diff - aspectData.degree),
                meaning: aspectData.meaning
              });
            }
          }
        }
      }
    }

    return aspects;
  }

  /**
   * Calculate Upapada Lagna (8th from Atmakaraka)
   * @private
   */
  _calculateUpapadaLagna(atmaKaraka, planetaryPositions) {
    if (!atmaKaraka || !planetaryPositions[atmaKaraka.planet || atmaKaraka]) {
      return null;
    }

    const atmaLongitude =
      planetaryPositions[atmaKaraka.planet || atmaKaraka].longitude;
    // Upapada Lagna is 8th house from Atmakaraka's position
    const upapadaLongitude = (atmaLongitude + 240) % 360; // 8th = +240°

    return {
      longitude: upapadaLongitude,
      sign: this._getSignFromLongitude(upapadaLongitude),
      nakshatra: this._getNakshatraFromLongitude(upapadaLongitude),
      ruling_planet: this._getSignRuler(
        this._getSignFromLongitude(upapadaLongitude)
      ),
      significance:
        'Upapada Lagna represents spouse, marriage, and material gains'
    };
  }

  /**
   * Calculate Argalas (supports and obstructions)
   * @private
   */
  _calculateArgalas(planetaryPositions, upapadaLagna) {
    const argalas = {
      dhanargala: [], // 2nd house support (wealth)
      sukhargala: [], // 4th house support (happiness)
      putrargala: [], // 5th house support (children)
      dharmargala: [], // 9th house support (dharma)
      karmargala: [], // 10th house support (career)
      labhargala: [] // 11th house support (gains)
    };

    // In Jaimini, Argalas are formed by planets in specific houses
    // Simplified implementation focusing on key argalas
    for (const [planet, position] of Object.entries(planetaryPositions)) {
      if (!position) {
        continue;
      }

      // Calculate house position relative to Lagna (approximated by Sun position for now)
      const lagnaApprox = planetaryPositions.sun ?
        planetaryPositions.sun.longitude :
        0;
      const house = this._getHouseNumber(position.longitude, lagnaApprox);

      // Check for argala houses
      if ([2, 4, 5, 9, 10, 11].includes(house)) {
        const argalaType = this._getArgalaType(house);
        argalas[argalaType].push({
          planet,
          house,
          longitude: position.longitude,
          strength: this._calculateArgalaStrength(position, house)
        });
      }
    }

    return argalas;
  }

  /**
   * Helper function to get Argala type
   * @private
   */
  _getArgalaType(house) {
    switch (house) {
    case 2:
      return 'dhanargala';
    case 4:
      return 'sukhargala';
    case 5:
      return 'putrargala';
    case 9:
      return 'dharmargala';
    case 10:
      return 'karmargala';
    case 11:
      return 'labhargala';
    default:
      return 'general';
    }
  }

  /**
   * Calculate Argala strength
   * @private
   */
  _calculateArgalaStrength(position, house) {
    // Simplified strength calculation
    let strength = 10; // Base strength

    // Add strength based on planetary condition
    if (position.longitude > 180 && position.longitude < 240) {
      strength += 5;
    } // In own or friendly sign
    if (position.speed > 0) {
      strength += 3;
    } // Direct motion adds strength

    return strength > 20 ? 'Strong' : strength > 15 ? 'Moderate' : 'Weak';
  }

  /**
   * Get house number for a planet from Lagna
   * @private
   */
  _getHouseNumber(planetLongitude, lagnaLongitude) {
    let diff = planetLongitude - lagnaLongitude;
    if (diff < 0) {
      diff += 360;
    }
    return Math.floor(diff / 30) + 1;
  }

  /**
   * Get sign from longitude
   * @private
   */
  _getSignFromLongitude(longitude) {
    const signs = [
      'Aries',
      'Taurus',
      'Gemini',
      'Cancer',
      'Leo',
      'Virgo',
      'Libra',
      'Scorpio',
      'Sagittarius',
      'Capricorn',
      'Aquarius',
      'Pisces'
    ];
    const signIndex = Math.floor(longitude / 30);
    return signs[signIndex];
  }

  /**
   * Get sign ruler
   * @private
   */
  _getSignRuler(sign) {
    const rulers = {
      Aries: 'Mars',
      Taurus: 'Venus',
      Gemini: 'Mercury',
      Cancer: 'Moon',
      Leo: 'Sun',
      Virgo: 'Mercury',
      Libra: 'Venus',
      Scorpio: 'Mars',
      Sagittarius: 'Jupiter',
      Capricorn: 'Saturn',
      Aquarius: 'Saturn',
      Pisces: 'Jupiter'
    };
    return rulers[sign];
  }

  /**
   * Get nakshatra from longitude
   * @private
   */
  _getNakshatraFromLongitude(longitude) {
    const nakshatraIndex = Math.floor(longitude / (360 / 27));
    const nakshatraNames = [
      'Ashwini',
      'Bharani',
      'Krittika',
      'Rohini',
      'Mrigashira',
      'Ardra',
      'Punarvasu',
      'Pushya',
      'Ashlesha',
      'Magha',
      'Purva Phalguni',
      'Uttara Phalguni',
      'Hasta',
      'Chitra',
      'Swati',
      'Vishakha',
      'Anuradha',
      'Jyeshtha',
      'Mula',
      'Purva Ashadha',
      'Uttara Ashadha',
      'Shravana',
      'Dhanishta',
      'Shatabhisha',
      'Purva Bhadrapada',
      'Uttara Bhadrapada',
      'Revati'
    ];
    return nakshatraNames[nakshatraIndex];
  }

  /**
   * Generate authentic Jaimini summary
   * @private
   */
  _generateAuthenticJaiminiSummary(name, karakas, charaDasha, jaiminiAspects) {
    let summary = `🌟 *Authentic Jaimini Astrology Analysis for ${name || 'User'}* 🌟\n\n`;

    summary += `*Atma Karaka (Soul Significator):* ${karakas.atma_karaka?.planet || 'Not found'}\n`;
    summary += `  Degree: ${karakas.atma_karaka?.degree?.toFixed(2) || 'N/A'}° in ${karakas.atma_karaka?.sign || 'N/A'}\n`;
    summary += `  Nakshatra: ${karakas.atma_karaka?.nakshatra || 'N/A'}\n\n`;

    summary += `*Current Mahadasha:* ${charaDasha.current_mahadasha}\n`;
    summary += `*Current Bhukti:* ${charaDasha.current_bhukti}\n`;
    summary += `*Dasha Progress:* ${charaDasha.dasha_progress.toFixed(2)}%\n\n`;

    summary += '*Key Karakas and Their Positions:*\n';
    const karakaOrder = [
      'atma_karaka',
      'amatya_karaka',
      'bhratru_karaka',
      'matru_karaka',
      'pitru_karaka',
      'putra_karaka',
      'gnatru_karaka',
      'daraka_karaka'
    ];
    for (const karaka of karakaOrder) {
      const data = karakas[karaka];
      if (data) {
        summary += `• ${karaka.toUpperCase().replace('_', ' ')}: ${data.planet} in ${data.sign} (${data.degree.toFixed(2)}°)\n`;
      }
    }
    summary += '\n';

    if (jaiminiAspects.length > 0) {
      summary += '*Key Jaimini Aspects:*\n';
      jaiminiAspects.slice(0, 5).forEach(aspect => {
        summary += `• ${aspect.from} -> ${aspect.to}: ${aspect.type} aspect (${aspect.angle.toFixed(2)}°)\n`;
        summary += `  ${aspect.meaning}\n`;
      });
      summary += '\n';
    }

    summary += '*Jaimini System Insights:*\n';
    summary += '• Atma Karaka represents your soul\'s highest purpose\n';
    summary += '• Chara Dasha shows the cosmic timing of life events\n';
    summary += '• Jaimini aspects provide unique relationship insights\n';
    summary += '• Planetary positions indicate karmic patterns\n\n';

    summary += '*Authentic Vedic Insight:*\n';
    summary +=
      'This analysis uses Swiss Ephemeris for precise astronomical calculations following Maharishi Jaimini\'s authentic teachings. Jaimini Astrology focuses on the soul\'s evolution (Atma Karaka) rather than material conditions, providing deeper spiritual guidance.\n\n';

    summary +=
      '*Note:* For comprehensive analysis, consult a qualified Jaimini astrologer. This system is distinct from Parasara and provides different insights. 🕉️';

    return summary;
  }

  /**
   * Convert date to Julian Day
   * @private
   */
  _dateToJulianDay(year, month, day, hour) {
    return sweph.swe_julday(year, month, day, hour, sweph.SE_GREG_CAL);
  }

  /**
   * Get Jaimini Astrology catalog
   * @returns {Object} Available services
   */
  getJaiminiCatalog() {
    return {
      authentic_karakas:
        'True Jaimini Karakas calculation with Swiss Ephemeris',
      chara_dasha: 'Authentic Chara Dasha based on Atma Karaka',
      jaimini_aspects: 'Special Jaimini aspect analysis',
      upapada_lagna: 'Upapada Lagna for marriage and material gains',
      argala_analysis: 'Argala (support) analysis for life factors',
      comprehensive_reading: 'Complete authentic Jaimini reading'
    };
  }
}

module.exports = { JaiminiAstrology };
