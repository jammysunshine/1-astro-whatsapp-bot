const logger = require('../../../../utils/logger');
const sweph = require('sweph');

/**
 * Vedic Yogas Calculator
 * Calculates traditional Vedic planetary combinations (Yogas) for special effects
 */
class VedicYogasCalculator {
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
   * Calculate Vedic Yogas in birth chart
   * @param {Object} birthData - Birth data
   * @returns {Object} Yoga analysis
   */
  async calculateVedicYogas(birthData) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      // Parse birth data
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates
      const [lat, lng] = await this._getCoordinates(birthPlace);
      const jd = this._dateToJD(year, month, day, hour + minute / 60);

      // Calculate planetary positions
      const planets = await this._calculatePlanetaryPositions(jd);

      // Analyze yogas
      const nbhayaYoga = this._analyzeNbhayaYoga(planets);
      const panchMahapurushaYogas = this._analyzePanchMahapurushaYogas(planets);
      const rajYoga = this._analyzeRajYoga(planets);
      const dhanYoga = this._analyzeDhanYoga(planets);
      const gajaKeshariYoga = this._analyzeGajaKeshariYoga(planets);
      const kemaDrumaYoga = this._analyzeKemadrumaYoga(planets);

      const yogas = {
        nbhayaYoga,
        panchMahapurushaYogas,
        rajYoga,
        dhanYoga,
        gajaKeshariYoga,
        kemadrumaYoga: kemaDrumaYoga
      };

      return {
        birthData: { birthDate, birthTime, birthPlace },
        planetaryPositions: planets,
        yogas,
        overallInfluence: this._calculateOverallYogaInfluence(yogas),
        interpretation: this._interpretYogas(yogas)
      };
    } catch (error) {
      logger.error('❌ Error in Vedic Yogas calculation:', error);
      throw new Error(`Vedic Yogas calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate planetary positions
   * @private
   */
  async _calculatePlanetaryPositions(jd) {
    const positions = {};
    const planets = [
      'Sun',
      'Moon',
      'Mars',
      'Mercury',
      'Jupiter',
      'Venus',
      'Saturn'
    ];

    for (const planet of planets) {
      try {
        const pos = sweph.calc(jd, this._getPlanetId(planet));
        if (pos.longitude !== undefined) {
          const signIndex = Math.floor(pos.longitude / 30);
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

          positions[planet.toLowerCase()] = {
            name: planet,
            longitude: pos.longitude,
            sign: signs[signIndex],
            signIndex,
            degrees: Math.floor(pos.longitude % 30),
            retrograde: pos.speedLongitude < 0
          };
        }
      } catch (error) {
        logger.warn(`Error calculating ${planet} position:`, error.message);
      }
    }

    return positions;
  }

  /**
   * Analyze Nbhaya Yoga (position of Sun and Moon)
   * @private
   */
  _analyzeNbhayaYoga(planets) {
    const { sun } = planets;
    const { moon } = planets;

    if (!sun || !moon) {
      return { present: false };
    }

    const sunMoonAngle = Math.abs(
      this._normalizeAngle(moon.longitude - sun.longitude)
    );

    // Check if Moon is ahead of Sun (within certain degrees)
    const isNbhaya = sunMoonAngle < 180;

    return {
      present: isNbhaya,
      strength: isNbhaya ? Math.max(1, 10 - sunMoonAngle / 18) : 0,
      description: 'Sun and Moon in favorable relative position',
      significance: isNbhaya ?
        'Brings courage and fearlessness' :
        'Standard positioning'
    };
  }

  /**
   * Analyze Pancha Mahapurusha Yogas (5 great person yogas)
   * @private
   */
  _analyzePanchMahapurushaYogas(planets) {
    const yogas = {};

    // Ruchaka Yoga: Mars in own sign, exalted, or friend's sign and in Kendra
    const { mars } = planets;
    if (mars) {
      const marsSign = mars.sign;
      const exaltedSigns = ['Capricorn'];
      const ownSigns = ['Aries', 'Scorpio'];
      const friendlySigns = ['Leo', 'Sagittarius', 'Pisces', 'Taurus'];

      const favorablePosition =
        exaltedSigns.includes(marsSign) ||
        ownSigns.includes(marsSign) ||
        friendlySigns.includes(marsSign);

      // Check if in Kendra (1,4,7,10)
      const kendraSigns = ['Aries', 'Cancer', 'Libra', 'Capricorn'];

      yogas.ruchakaYoga = {
        present: favorablePosition && kendraSigns.includes(marsSign),
        planet: 'Mars',
        description: 'Warrior-like attributes, leadership',
        strength: favorablePosition && kendraSigns.includes(marsSign) ? 8 : 0
      };
    }

    // Similar logic for other planets...
    // Bhadra Yoga (Mercury), Hansa Yoga (Jupiter), Malavya Yoga (Venus), Shasha Yoga (Saturn)

    return yogas;
  }

  /**
   * Analyze Raj Yoga (combination for royalty/kingship)
   * @private
   */
  _analyzeRajYoga(planets) {
    // Raj Yoga occurs when rulers of Kendra and Trikona houses are well-placed
    // Simplified analysis

    const kendraLords = ['Mars', 'Sun', 'Mercury', 'Venus']; // Approximation
    const trikonaLords = ['Sun', 'Moon', 'Mars', 'Jupiter'];

    const strongRajYoga =
      kendraLords.some(lord => {
        const planet = planets[lord.toLowerCase()];
        return planet && this._isPlanetStrong(planet);
      }) &&
      trikonaLords.some(lord => {
        const planet = planets[lord.toLowerCase()];
        return planet && this._isPlanetStrong(planet);
      });

    return {
      present: strongRajYoga,
      description: 'Combination leading to power, authority, and success',
      strength: strongRajYoga ? 9 : 0,
      factors: [
        'Kendra lord strength',
        'Trikona lord strength',
        'Planetary dignity'
      ]
    };
  }

  /**
   * Analyze Dhan Yoga (wealth combinations)
   * @private
   */
  _analyzeDhanYoga(planets) {
    const { venus } = planets;
    const { jupiter } = planets;
    const { moon } = planets;

    // Dhan Yoga when Venus, Jupiter, Moon are well-placed
    const present =
      (venus && this._isPlanetStrong(venus)) ||
      (jupiter && this._isPlanetStrong(jupiter)) ||
      (moon && this._isPlanetStrong(moon));

    return {
      present,
      description: 'Combinations indicating wealth and prosperity',
      strength: present ? 7 : 0,
      primaryFactors: ['Venus strength', 'Jupiter strength', 'Moon strength']
    };
  }

  /**
   * Analyze Gaja Kesari Yoga
   * @private
   */
  _analyzeGajaKeshariYoga(planets) {
    const { moon } = planets;
    const { jupiter } = planets;

    if (!moon || !jupiter) {
      return { present: false };
    }

    const angle = Math.abs(
      this._normalizeAngle(jupiter.longitude - moon.longitude)
    );

    // Gaja Kesari Yoga occurs when Jupiter is in Kendra from Moon
    const kendraPositions = [0, 90, 180, 270]; // 0° (conjunction), 90°, 180°, 270°
    const isKendra = kendraPositions.some(pos => Math.abs(angle - pos) <= 8);

    return {
      present: isKendra,
      description:
        'Moon-Jupiter combination bringing wisdom, wealth, and protection',
      strength: isKendra ? 8 : 0,
      positions: `Jupiter ${this._angleToAspect(angle)} from Moon`
    };
  }

  /**
   * Analyze Kemadruma Yoga (inauspicious)
   * @private
   */
  _analyzeKemadrumaYoga(planets) {
    const { moon } = planets;

    if (!moon) {
      return { present: false };
    }

    // Kemadruma Yoga occurs when Moon has no planets in 2nd and 12th houses from it
    // This is a complex analysis requiring full chart interpretation
    // Simplified as not having Jupiter/Mercury in adjacent signs

    const moonSignIndex = moon.signIndex;
    const { jupiter } = planets;
    const { mercury } = planets;

    const hasBeneficsNearby =
      (jupiter && Math.abs(jupiter.signIndex - moonSignIndex) <= 1) ||
      (mercury && Math.abs(mercury.signIndex - moonSignIndex) <= 1);

    return {
      present: !hasBeneficsNearby,
      description:
        'Moon without beneficial planets nearby (considerations apply)',
      strength: hasBeneficsNearby ? 0 : 4,
      remediation: 'Strengthen Moon through gemstones or mantras'
    };
  }

  /**
   * Check if planet is strong
   * @private
   */
  _isPlanetStrong(planet) {
    // Simplified strength check - in full implementation, check exaltation, own sign, etc.
    const exaltedSigns = {
      Sun: ['Aries'],
      Moon: ['Taurus'],
      Mars: ['Capricorn'],
      Mercury: ['Virgo'],
      Jupiter: ['Cancer'],
      Venus: ['Pisces'],
      Saturn: ['Libra']
    };

    const ownSigns = {
      Sun: ['Leo'],
      Moon: ['Cancer'],
      Mars: ['Aries', 'Scorpio'],
      Mercury: ['Gemini', 'Virgo'],
      Jupiter: ['Sagittarius', 'Pisces'],
      Venus: ['Taurus', 'Libra'],
      Saturn: ['Capricorn', 'Aquarius']
    };

    const exalted =
      planet.sign && exaltedSigns[planet.name]?.includes(planet.sign);
    const own = planet.sign && ownSigns[planet.name]?.includes(planet.sign);

    return exalted || own;
  }

  /**
   * Convert angle to aspect name
   * @private
   */
  _angleToAspect(angle) {
    const aspects = [
      { name: 'conjunct', max: 8 },
      { name: 'sextile', min: 52, max: 68 },
      { name: 'square', min: 82, max: 98 },
      { name: 'trine', min: 112, max: 128 },
      { name: 'opposition', min: 172, max: 188 },
      { name: 'in', min: 0, max: 360 } // fallback
    ];

    for (const aspect of aspects) {
      if (angle >= (aspect.min || 0) && angle <= aspect.max) {
        return aspect.name;
      }
    }

    return 'aspect to';
  }

  /**
   * Calculate overall yoga influence
   * @private
   */
  _calculateOverallYogaInfluence(yogas) {
    let totalStrength = 0;
    let yogaCount = 0;

    Object.values(yogas).forEach(yogaType => {
      if (yogaType.present) {
        totalStrength += yogaType.strength || 0;
        yogaCount++;
      }
    });

    const averageStrength = yogaCount > 0 ? totalStrength / yogaCount : 0;

    return {
      totalStrength,
      averageStrength,
      yogaCount,
      overallRating:
        averageStrength > 7 ?
          'Very Auspicious' :
          averageStrength > 5 ?
            'Favorable' :
            averageStrength > 3 ?
              'Mixed' :
              'Challenging'
    };
  }

  /**
   * Interpret yogas
   * @private
   */
  _interpretYogas(yogas) {
    const presentYogas = Object.entries(yogas).filter(
      ([_, yoga]) => yoga.present
    );
    const absentInauspicious = Object.entries(yogas).filter(
      ([_, yoga]) => !yoga.present && yoga.description?.includes('inauspicious')
    );

    return {
      presentYogas: presentYogas.map(([name, yoga]) => ({
        name,
        description: yoga.description,
        significance: yoga.significance || 'Positive influence present'
      })),
      notableAbsences: absentInauspicious.map(([name, _]) => name),
      guidance:
        'Focus on strengthening beneficial yogas and remediating challenging ones.',
      recommendations: [
        'Consider gemstone recommendations for yoga enhancement',
        'Practice specific mantras for yoga activation',
        'Time important life events according to favorable yogas'
      ]
    };
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
    const jd =
      day +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045;
    return jd + hour / 24;
  }

  async _getCoordinates(place) {
    return [0, 0];
  }

  async _getTimezone(lat, lng, timestamp) {
    return 0;
  }
}

module.exports = { VedicYogasCalculator };
