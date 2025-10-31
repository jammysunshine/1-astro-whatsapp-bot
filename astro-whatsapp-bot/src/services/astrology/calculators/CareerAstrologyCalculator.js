const logger = require('../../../utils/logger');
const sweph = require('sweph');

/**
 * CareerAstrologyCalculator - Specialized calculator for professional guidance and career timing
 * Handles career astrology calculations including midheaven analysis, career timing, and success potential
 */
class CareerAstrologyCalculator {
  constructor() {
    logger.info('Module: CareerAstrologyCalculator loaded - Professional and career astrology');
  }

  setServices(calendricalService, geocodingService) {
    this.calendricalService = calendricalService;
    this.geocodingService = geocodingService;
  }

  /**
   * Calculate career astrology analysis - professional guidance and timing
   */
  async calculateCareerAstrologyAnalysis(birthData) {
    try {
      const planetaryPositions = await this._getPlanetaryPositions(birthData);
      const houses = await this._calculateHouses(birthData);

      // Calculate current age for career timing
      const currentAge = this._calculateCurrentAge(birthData);

      // Analyze career indicators based on chart
      const midheavenAnalysis = this._analyzeMidheaven(houses[9], planetaryPositions);
      const tenthHousePlanets = this._analyzeTenthHousePlanets(planetaryPositions, houses);
      const careerPlanets = this._analyzeCareerPlanets(planetaryPositions, houses);
      const careerTiming = this._analyzeCareerTiming(currentAge, planetaryPositions, houses);
      const careerDirection = this._determineCareerDirection(midheavenAnalysis, tenthHousePlanets, careerPlanets);
      const successPotential = this._assessSuccessPotential(midheavenAnalysis, tenthHousePlanets, careerPlanets);

      const introduction = 'Your birth chart reveals your professional calling, career strengths, and optimal timing for success. The Midheaven (MC) represents your public face and career direction.';

      return {
        introduction,
        midheavenAnalysis,
        tenthHousePlanets,
        careerPlanets,
        careerTiming,
        careerDirection,
        successPotential
      };
    } catch (error) {
      logger.error('Career Astrology calculation error:', error);
      throw new Error('Failed to calculate career astrology analysis');
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

  /**
   * Calculate houses using Placidian system
   * @private
   */
  async _calculateHouses(birthData) {
    const { birthDate, birthTime, latitude = 28.6139, longitude = 77.2090, timezone = 5.5 } = birthData;
    const [day, month, year] = birthDate.split('/').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);

    const utcTime = new Date(Date.UTC(year, month - 1, day, hour - timezone, minute));
    const julianDay = utcTime.getTime() / 86400000 + 2440587.5;

    const cusps = new Array(13);
    const result = sweph.swe_houses(julianDay, latitude, longitude, 'P', cusps);
    return cusps;
  }

  /**
   * Calculate current age
   * @private
   */
  _calculateCurrentAge(birthData) {
    const { birthDate } = birthData;
    const [day, month, year] = birthDate.split('/').map(Number);

    const birthDateObj = new Date(year, month - 1, day);
    const currentDate = new Date();
    const currentAge = Math.floor((currentDate - birthDateObj) / (365.25 * 24 * 60 * 60 * 1000));
    return currentAge;
  }

  /**
   * Get zodiac sign from longitude
   * @private
   */
  _getSignFromLongitude(longitude) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = Math.floor(longitude / 30);
    return signs[signIndex];
  }

  /**
   * Get house number from longitude and ascendant
   * @private
   */
  _getHouseNumber(longitude, ascendant) {
    const angle = ((longitude - ascendant + 360) % 360);
    return Math.floor(angle / 30) + 1;
  }

  // ================= CAREER ASTROLOGY METHODS =================

  /**
   * Analyze Midheaven
   * @private
   */
  _analyzeMidheaven(midheavenLongitude, planets) {
    const mcSign = this._getSignFromLongitude(midheavenLongitude);
    return `Midheaven in ${mcSign}: Professional expression and public achievements. Your career calling is revealed through this celestial point.`;
  }

  /**
   * Analyze tenth house planets
   * @private
   */
  _analyzeTenthHousePlanets(planets, cusps) {
    const tenthHousePlanets = [];

    Object.keys(planets).forEach(planet => {
      if (planets[planet]?.longitude) {
        const house = this._getHouseNumber(planets[planet].longitude, cusps[0]);
        if (house === 10) {
          tenthHousePlanets.push({
            planet,
            influence: `${planet} in 10th house brings ${this._getCareerPlanetInfluence(planet)} to your professional life.`
          });
        }
      }
    });

    if (tenthHousePlanets.length === 0) {
      tenthHousePlanets.push({
        planet: 'Sun',
        influence: 'Sun\'s energy influences leadership and authority in career'
      });
    }

    return tenthHousePlanets.slice(0, 3);
  }

  /**
   * Analyze career planets
   * @private
   */
  _analyzeCareerPlanets(planets, cusps) {
    const careerPlanets = [];

    if (planets.Sun?.longitude) {
      const sunHouse = this._getHouseNumber(planets.Sun.longitude, cusps[0]);
      careerPlanets.push({
        planet: 'Sun',
        careerImpact: `Solar energy (${this._getSignFromLongitude(planets.Sun.longitude)}) drives identity and leadership in career`
      });
    }

    if (planets.Jupiter?.longitude) {
      careerPlanets.push({
        planet: 'Jupiter',
        careerImpact: 'Jupiter expansion favors wealth accumulation and professional opportunities'
      });
    }

    if (careerPlanets.length === 0) {
      careerPlanets.push({
        planet: 'Saturn',
        careerImpact: 'Saturn shapes career through discipline and professional responsibility'
      });
    }

    return careerPlanets.slice(0, 3);
  }

  /**
   * Analyze career timing
   * @private
   */
  _analyzeCareerTiming(currentAge, planets, cusps) {
    const timingEvents = [];

    // Saturn return between 28-30
    if (currentAge >= 28 && currentAge <= 30) {
      timingEvents.push({
        event: 'Saturn Return',
        description: 'Career maturity and established professional position'
      });
    }

    // Jupiter cycles (12, 24, 36, 48, 60)
    const jupiterCycles = [12, 24, 36, 48, 60];
    if (jupiterCycles.some(age => Math.abs(currentAge - age) <= 1)) {
      timingEvents.push({
        event: 'Jupiter Transit',
        description: 'Professional expansion and new career opportunities'
      });
    }

    if (timingEvents.length === 0) {
      timingEvents.push({
        event: 'Current Professional Phase',
        description: 'Building foundations and establishing work patterns'
      });
      timingEvents.push({
        event: 'Upcoming Development',
        description: 'Career evolution through experience and opportunities'
      });
    }

    return timingEvents.slice(0, 3);
  }

  /**
   * Determine career direction
   * @private
   */
  _determineCareerDirection(midheavenAnalysis, tenthHousePlanets, careerPlanets) {
    let direction = 'Your career path emphasizes ';

    // Analyze MC sign
    const mcSign = midheavenAnalysis.includes('Aries') ? 'leadership' :
      midheavenAnalysis.includes('Taurus') ? 'practical achievements' :
        midheavenAnalysis.includes('Gemini') ? 'communication' :
          midheavenAnalysis.includes('Cancer') ? 'service oriented roles' :
            midheavenAnalysis.includes('Leo') ? 'creative leadership' :
              midheavenAnalysis.includes('Virgo') ? 'technical expertise' :
                midheavenAnalysis.includes('Libra') ? 'relationship-focused careers' :
                  midheavenAnalysis.includes('Scorpio') ? 'transformative professions' :
                    midheavenAnalysis.includes('Sagittarius') ? 'teaching and exploration' :
                      midheavenAnalysis.includes('Capricorn') ? 'authoritative positions' :
                        midheavenAnalysis.includes('Aquarius') ? 'innovative fields' :
                          'humanitarian pursuits';

    direction += `${mcSign}`;

    // Add planetary influences
    if (tenthHousePlanets.length > 0) {
      const keyPlanet = tenthHousePlanets[0].planet;
      const planetInfluence = this._getCareerPlanetInfluence(keyPlanet).toLowerCase();
      direction += ` with ${planetInfluence} characteristics`;
    }

    direction += '. Focus on roles that utilize your natural abilities.';

    return direction;
  }

  /**
   * Assess success potential
   * @private
   */
  _assessSuccessPotential(midheavenAnalysis, tenthHousePlanets, careerPlanets) {
    let potential = 'High success potential indicated in your birth chart. ';

    // Evaluate planetary support
    const beneficialPlanets = ['Jupiter', 'Venus', 'Sun'];
    const challengingPlanets = ['Saturn', 'Mars'];

    const hasBeneficialInfluence = tenthHousePlanets.some(p => beneficialPlanets.includes(p.planet)) ||
      careerPlanets.some(p => beneficialPlanets.includes(p.planet));

    const hasChallenges = tenthHousePlanets.some(p => challengingPlanets.includes(p.planet)) ||
      careerPlanets.some(p => challengingPlanets.includes(p.planet));

    if (hasBeneficialInfluence && !hasChallenges) {
      potential += 'Beneficial planetary influences support professional success and recognition.';
    } else if (hasChallenges && hasBeneficialInfluence) {
      potential += 'Mixed influences suggest success through effort and persistence.';
    } else if (hasChallenges) {
      potential += 'Chart indicates professional growth through overcoming challenges.';
    } else {
      potential += 'Balanced chart supports steady career development and achievement.';
    }

    return potential;
  }

  /**
   * Get career planet influence
   * @private
   */
  _getCareerPlanetInfluence(planet) {
    const influences = {
      Sun: 'leadership and self-expression',
      Moon: 'emotional intelligence and nurturing',
      Mars: 'energy and action',
      Mercury: 'communication and analytical skills',
      Jupiter: 'expansion and teaching ability',
      Venus: 'harmonious cooperation and creativity',
      Saturn: 'discipline and structure'
    };

    return influences[planet] || 'professional development';
  }

  /**
   * Health check for CareerAstrologyCalculator
   * @returns {Object} Health status
   */
  healthCheck() {
    return {
      healthy: true,
      version: '1.0.0',
      name: 'CareerAstrologyCalculator',
      calculations: ['Midheaven Analysis', 'Tenth House Planets', 'Career Timing', 'Success Potential'],
      status: 'Operational'
    };
  }
}

module.exports = { CareerAstrologyCalculator };
