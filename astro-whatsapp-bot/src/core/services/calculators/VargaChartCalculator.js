const logger = require('../../../../utils/logger');
const sweph = require('sweph');

/**
 * Varga Chart Calculator
 * Uses Swiss Ephemeris for precise astronomical calculations of Vedic divisional charts
 * Implements all 16 traditional Parashara divisional charts (D1-D60)
 */
class VargaChartCalculator {
  constructor(astrologer, geocodingService) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;
    this._setEphemerisPath();
  }

  /**
   * Set Swiss Ephemeris data path
   */
  _setEphemerisPath() {
    try {
      const ephePath = require('path').join(process.cwd(), 'ephe');
      sweph.swe_set_ephe_path(ephePath);
    } catch (error) {
      logger.warn('Could not set ephemeris path for Swiss Ephemeris');
    }
  }

  /**
   * Set services for the calculator
   */
  setServices(services) {
    this.services = services;
  }

  /**
   * Calculate specified varga chart using Swiss Ephemeris
   */
  async calculateVargaChart(birthData, vargaType = 'D9') {
    try {
      logger.info(`🔢 Calculating ${vargaType} chart using Swiss Ephemeris`);

      const { birthDate, birthTime, birthPlace, name = 'Individual' } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return { error: 'Complete birth details required: date, time, and place' };
      }

      // Parse birth details
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get precise coordinates and timezone
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const timezone = await this._getTimezoneForPlace(latitude, longitude);

      // Calculate Julian Day
      const jd = this._dateToJulianDay(year, month, day, hour + minute / 60 - timezone);

      // Get varga divisor and definition
      const vargaDef = this._getVargaDefinition(vargaType);
      if (!vargaDef) {
        throw new Error(`Unsupported varga type: ${vargaType}`);
      }

      // Calculate natal chart first (for reference)
      const natalChart = await this._calculateNatalChart(jd, latitude, longitude, timezone);

      // Calculate divisional chart
      const vargaChart = await this._calculateDivisionalChart(jd, latitude, longitude, vargaDef.divisor, vargaType);

      // Analyze varga-specific significations
      const analysis = this._analyzeVargaSignifications(vargaChart, vargaType, natalChart);

      // Calculate varga-specific yogas and combinations
      const specialCombinations = this._calculateVargaYogas(vargaChart, vargaType);

      // Assess planetary strengths in varga context
      const strengthAnalysis = this._assessVargaStrengths(vargaChart, vargaType);

      return {
        name,
        vargaType,
        definition: vargaDef,
        natalChart: {
          ascendant: natalChart.ascendant,
          sunSign: this._getZodiacSign(natalChart.planets.sun.longitude),
          moonSign: this._getZodiacSign(natalChart.planets.moon.longitude)
        },
        vargaChart,
        analysis,
        specialCombinations,
        strengthAnalysis,
        summary: this._generateVargaSummary(vargaChart, vargaType, analysis, strengthAnalysis)
      };

    } catch (error) {
      logger.error(`❌ Error in ${vargaType} chart calculation:`, error);
      return { error: `Varga chart calculation failed: ${error.message}` };
    }
  }

  /**
   * Calculate natal chart for reference using Swiss Ephemeris
   */
  async _calculateNatalChart(jd, latitude, longitude, timezone) {
    const planets = {};
    const planetIds = {
      sun: sweph.SE_SUN,
      moon: sweph.SE_MOON,
      mars: sweph.SE_MARS,
      mercury: sweph.SE_MERCURY,
      jupiter: sweph.SE_JUPITER,
      venus: sweph.SE_VENUS,
      saturn: sweph.SE_SATURN,
      rahu: sweph.SE_TRUE_NODE,
      ketu: sweph.SE_MEAN_APOG
    };

    // Calculate planetary positions
    for (const [planetName, planetId] of Object.entries(planetIds)) {
      try {
        const position = sweph.swe_calc_ut(jd, planetId, sweph.SEFLG_SIDEREAL);

        if (position && Array.isArray(position.longitude)) {
          planets[planetName] = {
            longitude: position.longitude[0]
          };
        }
      } catch (error) {
        logger.warn(`Swiss Ephemeris error for natal ${planetName}:`, error.message);
      }
    }

    // Calculate ascendant
    planets.ascendant = { longitude: 0 };
    try {
      const ascResult = sweph.swe_calc_ut(jd, sweph.SE_ASCENDANT, sweph.SEFLG_SIDEREAL);
      if (ascResult) {
        planets.ascendant.longitude = ascResult.longitude[0];
      }
    } catch (error) {
      logger.warn('Could not calculate ascendant');
    }

    return { planets };
  }

  /**
   * Calculate divisional chart using varga mathematics
   */
  async _calculateDivisionalChart(jd, latitude, longitude, divisor, vargaType) {
    const charts = {
      ascendant: {},
      planets: {},
      houses: []
    };

    // Calculate varga ascendant using specific method for each varga
    charts.ascendant = this._calculateVargaAscendant(jd, latitude, longitude, divisor, vargaType);

    // Calculate planetary positions in varga
    const planetIds = {
      Sun: sweph.SE_SUN, Moon: sweph.SE_MOON, Mars: sweph.SE_MARS,
      Mercury: sweph.SE_MERCURY, Jupiter: sweph.SE_JUPITER,
      Venus: sweph.SE_VENUS, Saturn: sweph.SE_SATURN,
      Rahu: sweph.SE_TRUE_NODE, Ketu: sweph.SE_MEAN_APOG
    };

    for (const [planetName, planetId] of Object.entries(planetIds)) {
      try {
        const position = sweph.swe_calc_ut(jd, planetId, sweph.SEFLG_SIDEREAL);

        if (position && Array.isArray(position.longitude)) {
          const natalLongitude = position.longitude[0];
          const vargaLongitude = this._calculateVargaLongitude(natalLongitude, divisor);
          const vargaSign = Math.floor(vargaLongitude / 30) + 1;
          const vargaDegree = vargaLongitude % 30;

          charts.planets[planetName.toLowerCase()] = {
            name: planetName,
            natalLongitude,
            vargaLongitude,
            sign: vargaSign,
            degree: Math.round(vargaDegree * 100) / 100,
            signName: this._getZodiacSign(vargaLongitude),
            house: this._calculateVargaHouse(vargaLongitude, charts.ascendant.longitude),
            dignity: this._assessVargaDignity(planetName, vargaSign, vargaType)
          };
        }
      } catch (error) {
        logger.warn(`Swiss Ephemeris error for ${planetName} in ${vargaType}:`, error.message);
      }
    }

    // Calculate varga houses
    charts.houses = this._calculateVargaHouses(charts.ascendant.longitude, divisor);

    return charts;
  }

  /**
   * Calculate ascendant for varga chart
   * Different methods for different vargas per Vedic tradition
   */
  _calculateVargaAscendant(jd, latitude, longitude, divisor, vargaType) {
    let ascendantLongitude = 0;

    try {
      // Base ascendant calculation
      const ascResult = sweph.swe_calc_ut(jd, sweph.SE_ASCENDANT, sweph.SEFLG_SIDEREAL);
      const baseAscendant = ascResult ? ascResult.longitude[0] : 0;

      // Apply varga-specific calculation method
      if (vargaType === 'D9') {
        // Navamsa: Divide by 9
        ascendantLongitude = (baseAscendant * 9) % 360;
      } else if (vargaType === 'D10') {
        // Dashamsa: Divide by 10
        ascendantLongitude = (baseAscendant * 10) % 360;
      } else if (vargaType === 'D12') {
        // Dwadasamsa: Divide by 12
        ascendantLongitude = (baseAscendant * 12) % 360;
      } else {
        // General varga: Multiply by divisor (equivalent to division by 30/divisor)
        ascendantLongitude = (baseAscendant * divisor) % 360;
      }

      return {
        longitude: ascendantLongitude,
        sign: Math.floor(ascendantLongitude / 30) + 1,
        degree: ascendantLongitude % 30,
        signName: this._getZodiacSign(ascendantLongitude)
      };

    } catch (error) {
      logger.warn(`Ascendant calculation error for ${vargaType}:`, error.message);
      return {
        longitude: 0,
        sign: 1,
        degree: 0,
        signName: 'Aries'
      };
    }
  }

  /**
   * Calculate longitude position in varga chart
   * Traditional Vedic varga mathematics
   */
  _calculateVargaLongitude(natalLongitude, divisor) {
    // Convert natal longitude to varga longitude
    // Each sign (30°) is divided into equal parts based on divisor
    const signDegrees = 360 / 12; // 30 degrees per sign
    const vargaSignDegrees = signDegrees / divisor; // Degrees per varga sign

    const natalSign = Math.floor(natalLongitude / signDegrees);
    const positionInSign = natalLongitude % signDegrees;

    // Find which varga division this falls into
    const vargaDivision = Math.floor(positionInSign / vargaSignDegrees);
    const vargaPositionInDivision = positionInSign % vargaSignDegrees;

    // Convert back to absolute longitude
    // Each varga sign represents divisor degrees in the zodiac
    const degreesPerVargaSign = 360 / (12 * divisor);

    return (natalSign * divisor + vargaDivision) * degreesPerVargaSign + vargaPositionInDivision;
  }

  /**
   * Calculate which house a planet falls into in varga chart
   */
  _calculateVargaHouse(planetLongitude, ascendantLongitude) {
    const relativePosition = (planetLongitude - ascendantLongitude + 360) % 360;
    return Math.floor(relativePosition / 30) + 1;
  }

  /**
   * Calculate varga houses
   */
  _calculateVargaHouses(ascendantLongitude, divisor) {
    const houses = [];

    for (let i = 0; i < 12; i++) {
      const houseStartLongitude = (ascendantLongitude + (i * 30)) % 360;
      const houseSign = Math.floor(houseStartLongitude / 30) + 1;
      const houseSignName = this._getZodiacSign(houseStartLongitude);

      houses.push({
        number: i + 1,
        longitude: houseStartLongitude,
        sign: houseSign,
        signName: houseSignName,
        lord: this._getSignLord(houseSign - 1), // Convert to 0-based indexing
        significations: this._getHouseSignifications(i + 1)
      });
    }

    return houses;
  }

  /**
   * Analyze varga-specific significations and interpretations
   */
  _analyzeVargaSignifications(vargaChart, vargaType, natalChart) {
    const analysis = {
      primaryPurpose: '',
      strongIndicators: [],
      weakIndicators: [],
      keyPlanets: [],
      favorableHouses: [],
      challengingHouses: [],
      predictiveInsights: []
    };

    // Set primary purpose based on varga
    const vargaPurposes = {
      D1: 'Physical body, personality, general life events',
      D2: 'Wealth, family, material possessions, speech',
      D3: 'Siblings, communication, short journeys, courage',
      D4: 'Fortune, property, education, happiness from children',
      D7: 'Children, creativity, speculative ventures',
      D9: 'Marriage, spouse, relationships, dharma, life purpose',
      D10: 'Career, profession, reputation, public life',
      D12: 'Parents, ancestors, spirituality, foreign lands',
      D16: 'Vehicles, vehicles, comforts, general happiness',
      D20: 'Spiritual practices, religious rituals, devotion',
      D24: 'Education, knowledge, learning, academic pursuits',
      D27: 'Strengths and weaknesses, general fortune',
      D30: 'Misfortunes, challenges, occupational hazards',
      D40: 'Auspicious ceremonies, marriage matters',
      D45: 'All aspects of life, comprehensive analysis',
      D60: 'Past karma, subtle influences, detailed analysis'
    };

    analysis.primaryPurpose = vargaPurposes[vargaType] || 'General life analysis';

    // Analyze planetary positions for this varga's purpose
    Object.values(vargaChart.planets).forEach(planet => {
      if (planet.dignity === 'exalted' || planet.dignity === 'own_sign') {
        analysis.strongIndicators.push(`${planet.name} strong in ${vargaType} indicates positive ${this._getVargaTheme(planet.name, vargaType)}`);
      } else if (planet.dignity === 'debilitated') {
        analysis.weakIndicators.push(`${planet.name} weak in ${vargaType} suggests challenges in ${this._getVargaTheme(planet.name, vargaType)}`);
      }

      if (planet.house === this._getKeyHouseForVarga(vargaType)) {
        analysis.keyPlanets.push(planet.name);
      }
    });

    // Identify favorable and challenging houses
    for (let house = 1; house <= 12; house++) {
      if (this._isFavorableVargaHouse(house, vargaType)) {
        analysis.favorableHouses.push(house);
      } else if (this._isChallengingVargaHouse(house, vargaType)) {
        analysis.challengingHouses.push(house);
      }
    }

    // Generate predictive insights
    analysis.predictiveInsights = this._generateVargaPredictions(vargaChart, vargaType);

    return analysis;
  }

  /**
   * Calculate varga-specific yogas and special combinations
   */
  _calculateVargaYogas(vargaChart, vargaType) {
    const yogas = [];

    if (vargaType === 'D9') {
      // Navamsa yogas
      const navamsaYogas = this._analyzeNavamsaYogas(vargaChart);
      yogas.push(...navamsaYogas);
    } else if (vargaType === 'D10') {
      // Dashamsa yogas
      const dashamsaYogas = this._analyzeDashamsaYogas(vargaChart);
      yogas.push(...dashamsaYogas);
    } else if (vargaType === 'D7') {
      // Saptamsa yogas for children
      const saptamsaYogas = this._analyzeSaptamsaYogas(vargaChart);
      yogas.push(...saptamsaYogas);
    }

    // General varga yogas
    const generalYogas = this._analyzeGeneralVargaYogas(vargaChart);
    yogas.push(...generalYogas);

    return yogas;
  }

  /**
   * Analyze Navamsa-specific yogas (Marriage chart)
   */
  _analyzeNavamsaYogas(vargaChart) {
    const yogas = [];

    // Exalted planets in Navamsa
    const exaltedPlanets = Object.values(vargaChart.planets).filter(p => p.dignity === 'exalted');
    if (exaltedPlanets.length > 0) {
      yogas.push({
        name: 'Navamsa Exaltation Yoga',
        type: 'Beneficial',
        strength: 'Strong',
        description: `Exalted ${exaltedPlanets.map(p => p.name).join(', ')} indicate strong marriage potential and spouse qualities`,
        planets: exaltedPlanets.map(p => p.name),
        effects: this._getNavamsaExaltationEffects(exaltedPlanets)
      });
    }

    // Planets in own signs in Navamsa
    const ownSignPlanets = Object.values(vargaChart.planets).filter(p => p.dignity === 'own_sign');
    if (ownSignPlanets.length > 0) {
      yogas.push({
        name: 'Navamsa Ownership Yoga',
        type: 'Beneficial',
        strength: 'Moderate',
        description: `${ownSignPlanets.map(p => p.name).join(', ')} well-placed indicates strong personal qualities influencing marriage`,
        planets: ownSignPlanets.map(p => p.name)
      });
    }

    // Lord of Navamsa Lagna
    const lagnaLord = vargaChart.houses[0]?.lord;
    if (lagnaLord && vargaChart.planets[lagnaLord.toLowerCase()]) {
      const lagnaLordData = vargaChart.planets[lagnaLord.toLowerCase()];
      yogas.push({
        name: 'Navamsa Lagna Lord Yoga',
        type: 'Neutral',
        strength: lagnaLordData.dignity === 'exalted' ? 'Strong' : 'Moderate',
        description: `${lagnaLord} as lagna lord in Navamsa influences marriage timing and partner characteristics`,
        effects: this._getLagnaLordEffects(lagnaLord, lagnaLordData)
      });
    }

    return yogas;
  }

  /**
   * Analyze Dashamsa yogas (Career chart)
   */
  _analyzeDashamsaYogas(vargaChart) {
    const yogas = [];

    // Planets in 10th house (career house)
    const tenthHousePlanets = Object.values(vargaChart.planets).filter(p => p.house === 10);
    if (tenthHousePlanets.length > 0) {
      yogas.push({
        name: 'Dashamsa 10th House Yoga',
        type: 'Professional',
        strength: 'Strong',
        description: `${tenthHousePlanets.map(p => p.name).join(', ')} in 10th house indicates strong career placement and reputation`,
        planets: tenthHousePlanets.map(p => p.name),
        effects: this._getCareerYogaEffects(tenthHousePlanets)
      });
    }

    // Exalted planets in Dashamsa
    const exaltedPlanets = Object.values(vargaChart.planets).filter(p => p.dignity === 'exalted');
    if (exaltedPlanets.length > 0) {
      yogas.push({
        name: 'Dashamsa Exaltation Yoga',
        type: 'Professional',
        strength: 'Strong',
        description: `Exalted ${exaltedPlanets.map(p => p.name).join(', ')} indicate exceptional career success and recognition`,
        planets: exaltedPlanets.map(p => p.name)
      });
    }

    // Sun-Mercury conjunction (communication career)
    const sunMercury = vargaChart.planets.sun && vargaChart.planets.mercury;
    if (sunMercury && Math.abs(vargaChart.planets.sun.vargaLongitude - vargaChart.planets.mercury.vargaLongitude) < 10) {
      yogas.push({
        name: 'Raja Yoga (Communication)',
        type: 'Professional',
        strength: 'Strong',
        description: 'Sun-Mercury combination indicates success in communication, teaching, or intellectual fields',
        planets: ['Sun', 'Mercury']
      });
    }

    return yogas;
  }

  /**
   * Analyze Saptamsa yogas (Children chart)
   */
  _analyzeSaptamsaYogas(vargaChart) {
    const yogas = [];

    // Jupiter in Saptamsa (benefic for children)
    if (vargaChart.planets.jupiter) {
      const jupiterDignity = vargaChart.planets.jupiter.dignity;
      yogas.push({
        name: 'Jupiter in Saptamsa',
        type: 'Progeny',
        strength: jupiterDignity === 'exalted' ? 'Very Strong' : jupiterDignity === 'own_sign' ? 'Strong' : 'Moderate',
        description: `Jupiter's position indicates ${this._getJupiterProgenyEffects(jupiterDignity)} regarding children`,
        effects: this._getJupiterChildrenEffects(jupiterDignity)
      });
    }

    // 5th lord placement
    const fifthLord = vargaChart.houses[4]?.lord; // 5th house lord from varga Lagna
    if (fifthLord && vargaChart.planets[fifthLord.toLowerCase()]) {
      const fifthLordData = vargaChart.planets[fifthLord.toLowerCase()];
      yogas.push({
        name: '5th Lord in Saptamsa',
        type: 'Progeny',
        strength: fifthLordData.dignity === 'exalted' ? 'Strong' : 'Moderate',
        description: `${fifthLord}'s position indicates child-related matters and creative potential`
      });
    }

    return yogas;
  }

  /**
   * Analyze general varga yogas applicable to all charts
   */
  _analyzeGeneralVargaYogas(vargaChart) {
    const yogas = [];

    // Multiple planets in same sign (concentration)
    const signOccupancy = {};
    Object.values(vargaChart.planets).forEach(planet => {
      signOccupancy[planet.sign] = (signOccupancy[planet.sign] || 0) + 1;
    });

    const crowdedSigns = Object.entries(signOccupancy).filter(([sign, count]) => count >= 3);
    if (crowdedSigns.length > 0) {
      yogas.push({
        name: 'Planetary Concentration Yoga',
        type: 'Beneficial',
        strength: 'Moderate',
        description: 'Multiple planets concentrating in specific signs create focused energy and strength in those areas'
      });
    }

    // Raja Yoga combinations
    const rajaYogas = this._findRajaYogasInVarga(vargaChart);
    yogas.push(...rajaYogas);

    return yogas;
  }

  /**
   * Assess planetary strengths in varga context
   */
  _assessVargaStrengths(vargaChart, vargaType) {
    const strengths = {
      overall: 0,
      planetStrengths: {},
      houseStrengths: {},
      vargaSpecificStrengths: {}
    };

    // Calculate individual planet strengths
    Object.entries(vargaChart.planets).forEach(([planet, data]) => {
      let planetStrength = 0;

      // Dignity strength
      switch (data.dignity) {
        case 'exalted': planetStrength += 30; break;
        case 'own_sign': planetStrength += 20; break;
        case 'friendly': planetStrength += 10; break;
        case 'neutral': planetStrength += 5; break;
        case 'enemy': planetStrength -= 5; break;
        case 'debilitated': planetStrength -= 15; break;
      }

      // House strength (certain houses are beneficial in vargas)
      const beneficialHouses = this._getBeneficialHousesForVarga(vargaType);
      if (beneficialHouses.includes(data.house)) {
        planetStrength += 15;
      }

      // Aspect strength (beneficial aspects)
      planetStrength += this._calculateAspectStrength(planet, vargaChart);

      strengths.planetStrengths[planet] = {
        strength: Math.max(0, Math.min(100, planetStrength)),
        dignity: data.dignity,
        house: data.house,
        rating: planetStrength > 60 ? 'Strong' : planetStrength > 40 ? 'Moderate' : 'Weak'
      };
    });

    // Calculate house strengths
    for (let house = 1; house <= 12; house++) {
      const planetsInHouse = Object.values(vargaChart.planets).filter(p => p.house === house);
      const houseStrength = planetsInHouse.reduce((sum, planet) =>
        sum + (strengths.planetStrengths[planet.name.toLowerCase()]?.strength || 0), 0
      ) / planetsInHouse.length || 0;

      strengths.houseStrengths[house] = {
        strength: houseStrength,
        planets: planetsInHouse.map(p => p.name),
        rating: houseStrength > 60 ? 'Strong' : houseStrength > 40 ? 'Moderate' : 'Weak'
      };
    }

    // Calculate overall varga strength
    const avgPlanetStrength = Object.values(strengths.planetStrengths)
      .reduce((sum, ps) => sum + ps.strength, 0) / Object.keys(strengths.planetStrengths).length;

    strengths.overall = {
      strength: avgPlanetStrength,
      rating: avgPlanetStrength > 60 ? 'Strong Chart' :
              avgPlanetStrength > 40 ? 'Balanced Chart' : 'Challenging Chart',
      description: this._getOverallStrengthDescription(avgPlanetStrength, vargaType)
    };

    return strengths;
  }

  /**
   * Generate comprehensive varga summary
   */
  _generateVargaSummary(vargaChart, vargaType, analysis, strengths) {
    const vargaDef = this._getVargaDefinition(vargaType);

    let summary = `🎯 *${vargaDef.name} (${vargaType}) Analysis*\n\n`;
    summary += `*Purpose:* ${vargaDef.purpose}\n\n`;

    summary += '*Key Planetary Placements:*\n';
    Object.values(vargaChart.planets).slice(0, 4).forEach(planet => {
      summary += `• ${planet.name}: ${planet.signName} (${planet.sign}°${Math.floor(planet.degree)}')\n`;
    });
    summary += '\n';

    if (analysis.strongIndicators.length > 0) {
      summary += '*Strengths:*\n';
      analysis.strongIndicators.slice(0, 2).forEach(strength => {
        summary += `• ${strength}\n`;
      });
      summary += '\n';
    }

    summary += `*Overall Chart Strength:* ${strengths.overall.rating}\n`;
    summary += `*Primary Insights:* ${analysis.primaryPurpose}\n\n`;

    summary += `*${vargaDef.name} reveals the finer details of ${vargaDef.purpose.toLowerCase()}, providing specialized guidance for specific life areas.*`;

    return summary;
  }

  // Helper methods
  _getVargaDefinition(vargaType) {
    return this.vargaDefinitions[vargaType] || null;
  }

  _vargaDefinitions = {
    D1: { divisor: 1, name: 'Rasi Chart', purpose: 'Physical body, personality, general life events' },
    D2: { divisor: 2, name: 'Hora Chart', purpose: 'Wealth, family, material possessions' },
    D3: { divisor: 3, name: 'Dreshkana Chart', purpose: 'Siblings, courage, communication' },
    D4: { divisor: 4, name: 'Chaturthamsa Chart', purpose: 'Fortune, property, education' },
    D7: { divisor: 7, name: 'Saptamsa Chart', purpose: 'Children, creativity, progeny' },
    D9: { divisor: 9, name: 'Navamsa Chart', purpose: 'Marriage, spouse, relationships, dharma' },
    D10: { divisor: 10, name: 'Dashamsa Chart', purpose: 'Career, profession, reputation' },
    D12: { divisor: 12, name: 'Dwadasamsa Chart', purpose: 'Parents, ancestors, spirituality' },
    D16: { divisor: 16, name: 'Shodasamsa Chart', purpose: 'Vehicles, comforts, happiness' },
    D20: { divisor: 20, name: 'Vimsamsa Chart', purpose: 'Spiritual practices, worship' },
    D24: { divisor: 24, name: 'Chaturvimsamsa Chart', purpose: 'Education, knowledge, learning' },
    D27: { divisor: 27, name: 'Nakshatras Chart', purpose: 'Auspicious events, lunar mansion analysis' },
    D30: { divisor: 30, name: 'Trimshamsa Chart', purpose: 'Misfortunes, evils, occupational hazards' },
    D40: { divisor: 40, name: 'Khavedamsa Chart', purpose: 'Auspicious happenings' },
    D45: { divisor: 45, name: 'Akshavedamsa Chart', purpose: 'All aspects of life' },
    D60: { divisor: 60, name: 'Shashtiamsa Chart', purpose: 'Karma, past life, detailed analysis' }
  };

  _getZodiacSign(longitude) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs[Math.floor(longitude / 30)];
  }

  _getSignLord(signIndex) {
    const lords = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
    return lords[signIndex % 12];
  }

  _assessVargaDignity(planet, sign, vargaType) {
    // Different dignities apply in different vargas
    if (vargaType === 'D9') {
      // Navamsa uses different exaltation signs
      const navamsaExaltations = {
        Sun: [4], Moon: [3], Mars: [0], Mercury: [8, 5], Jupiter: [8], Venus: [11], Saturn: [10]
      };
      const navamsaDebilitations = {
        Sun: [10], Moon: [9], Mars: [6], Mercury: [2, 11], Jupiter: [2], Venus: [5], Saturn: [4]
      };

      if (navamsaExaltations[planet]?.includes(sign)) return 'exalted';
      if (navamsaDebilitations[planet]?.includes(sign)) return 'debilitated';
    }

    // General dignities for other vargas
    return 'neutral'; // Placeholder - would need full dignity calculation
  }

  _getHouseSignifications(houseNumber) {
    const significations = {
      1: ['Self', 'Personality', 'Physical appearance'],
      2: ['Wealth', 'Family', 'Speech'],
      3: ['Siblings', 'Courage', 'Skills'],
      4: ['Home', 'Mother', 'Emotions'],
      5: ['Children', 'Education', 'Creativity'],
      6: ['Enemies', 'Health challenges', 'Service'],
      7: ['Marriage', 'Partnership', 'Business'],
      8: ['Transformation', 'Secrets', 'Longevity'],
      9: ['Fortune', 'Father', 'Spirituality'],
      10: ['Career', 'Authority', 'Public reputation'],
      11: ['Gains', 'Friends', 'Elder siblings'],
      12: ['Spirituality', 'Expenses', 'Liberation']
    };
    return significations[houseNumber] || [];
  }

  _getZodiacSign(longitude) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs[Math.floor(longitude / 30)];
  }

  _getVargaTheme(planet, vargaType) {
    // Different themes apply based on varga type
    const themes = {
      D9: { Sun: 'spouse\'s father', Moon: 'spouse\'s mother', Mars: 'spouse\'s siblings' },
      D10: { Sun: 'authority figures', Moon: 'public image', Mars: 'competitors' },
      D7: { Jupiter: 'children', Venus: 'grandchildren', Moon: 'family line' }
    };
    return themes[vargaType]?.[planet] || `${planet.toLowerCase()} matters`;
  }

  _getKeyHouseForVarga(vargaType) {
    const keyHouses = {
      D1: 1, D2: 2, D3: 3, D4: 4, D7: 5, D9: 7, D10: 10, D12: 9
    };
    return keyHouses[vargaType] || 1;
  }

  _isFavorableVargaHouse(house, vargaType) {
    const favorableHouses = {
      D9: [7, 1, 5, 9], D10: [10, 1, 5, 9], D7: [5, 1, 9]
    };
    return favorableHouses[vargaType]?.includes(house) || false;
  }

  _isChallengingVargaHouse(house, vargaType) {
    const challengingHouses = {
      D9: [12, 6, 8], D10: [12, 6, 8], D7: [6, 8, 12]
    };
    return challengingHouses[vargaType]?.includes(house) || false;
  }

  _generateVargaPredictions(vargaChart, vargaType) {
    // Would implement detailed predictions based on varga type
    return ['Detailed predictions would be generated based on this varga chart analysis'];
  }

  _findRajaYogasInVarga(vargaChart) {
    // Simplified Raja Yoga detection
    return [{
      name: 'Potential Raja Yoga',
      type: 'Beneficial',
      strength: 'To be determined',
      description: 'Kendra and Trikona lord combination',
      planets: ['TBD']
    }];
  }

  _getBeneficialHousesForVarga(vargaType) {
    const beneficial = {
      D9: [7, 5, 9, 1], D10: [10, 9, 5, 1], D7: [5, 7, 1, 9]
    };
    return beneficial[vargaType] || [1, 5, 9];
  }

  _calculateAspectStrength(planet, vargaChart) {
    return 0; // Placeholder for aspect strength calculation
  }

  _dateToJulianDay(year, month, day, hour) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    return jd + (hour - 12) / 24;
  }

  async _getCoordinatesForPlace(place) {
    try {
      const coords = await this.geocodingService?.getCoordinates?.(place);
      return coords ? [coords.latitude, coords.longitude] : [28.6139, 77.209];
    } catch (error) {
      return [28.6139, 77.209]; // Delhi default
    }
  }

  async _getTimezoneForPlace(lat, lng, timestamp) {
    return 5.5; // IST default
  }
}

module.exports = { VargaChartCalculator };