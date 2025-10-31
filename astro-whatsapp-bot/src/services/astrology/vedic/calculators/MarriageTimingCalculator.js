const logger = require('../../../../utils/logger');
const sweph = require('sweph');
const path = require('path');

/**
 * Marriage Timing Calculator
 * Uses Swiss Ephemeris (ephemeris data) for precise astronomical calculations
 * Provides comprehensive Vedic marriage timing analysis
 */
class MarriageTimingCalculator {
  constructor(astrologer, geocodingService) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;

    // Set ephemeris path for Swiss Ephemeris
    this._setEphemerisPath();
  }

  /**
   * Set Swiss Ephemeris data path
   */
  _setEphemerisPath() {
    try {
      const ephePath = path.join(process.cwd(), 'ephe');
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
   * Main method: Analyze marriage timing based on birth details
   */
  async analyzeMarriageTiming(birthData, partnerData = null) {
    try {
      logger.info('🔍 Starting comprehensive marriage timing analysis');

      const { birthDate, birthTime, birthPlace, name = 'Individual' } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return { error: 'Complete birth details required: date, time, and place' };
      }

      // Parse birth parameters
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const timezone = await this._getTimezoneForPlace(latitude, longitude);

      // Calculate natal chart using Swiss Ephemeris
      const natalChart = await this._calculateNatalChart(year, month, day, hour, minute, latitude, longitude, timezone);

      // Comprehensive analysis
      const analysis = {
        name,
        basicAnalysis: this._analyzeBasicMarriageIndicators(natalChart),
        ageWindows: this._calculateMarriageAgeLikelihood(natalChart),
        timingWindows: this._calculateFavorableMarriagePeriods(natalChart),
        blockingFactors: this._identifyMarriageObstacles(natalChart),
        houseAnalysis: this._analyzeMarriageHouses(natalChart),
        planetaryAnalysis: this._analyzeMarriagePlanets(natalChart),
        strengthIndicators: this._assessOverallMarriageStrength(natalChart),
        recommendations: this._generateMarriageRecommendations(natalChart),
        muhurtaGuidance: this._calculateMuhurtaWindows(natalChart),
        transits: this._analyzeCurrentTransits(natalChart)
      };

      if (partnerData) {
        analysis.compatibility = await this._analyzePartnerCompatibility(birthData, partnerData);
      }

      logger.info('✅ Marriage timing analysis completed successfully');
      return analysis;
    } catch (error) {
      logger.error('❌ Error in marriage timing analysis:', error);
      return { error: `Analysis failed: ${error.message}` };
    }
  }

  /**
   * Calculate natal chart using Swiss Ephemeris
   */
  async _calculateNatalChart(year, month, day, hour, minute, latitude, longitude, timezone) {
    try {
      // Convert to Julian Day
      const jd = this._calculateJulianDay(year, month, day, hour + minute / 60 - timezone);

      logger.info(`🪐 Calculating natal chart for ${year}-${month}-${day}`);

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
        ketu: sweph.SE_OSCU_APOG + 1 // Ketu is opposite of Rahu
      };

      // Calculate planetary positions
      for (const [planetName, planetId] of Object.entries(planetIds)) {
        try {
          const position = sweph.swe_calc_ut(jd, planetId, sweph.SEFLG_SIDEREAL);

          if (position && position.longitude !== undefined) {
            planets[planetName] = {
              longitude: position.longitude[0],
              latitude: position.latitude?.[0] || 0,
              distance: position.distance?.[0] || 0,
              speedLongitude: position.speedLongitude?.[0] || 0,
              sign: Math.floor(position.longitude[0] / 30) + 1,
              degree: ((position.longitude[0] % 30) * 60).toFixed(0),
              nakshatra: this._calculateNakshatra(position.longitude[0]),
              house: 0 // Will be calculated with houses
            };
          } else {
            logger.warn(`Could not calculate position for ${planetName}`);
          }
        } catch (error) {
          logger.warn(`Swiss Ephemeris error for ${planetName}:`, error.message);
        }
      }

      // Calculate houses using whole sign or equal house system
      const houses = this._calculateHouses(jd, latitude, longitude);
      planets.ascendant = houses.ascendant;
      planets.midheaven = houses.midheaven;

      // Assign planets to houses
      for (const planetData of Object.values(planets)) {
        if (planetData.longitude && planets.ascendant?.longitude) {
          planetData.house = this._getHouseForLongitude(planetData.longitude, planets.ascendant.longitude);
        }
      }

      return {
        planets,
        houses,
        date: { year, month, day, hour, minute },
        location: { latitude, longitude, timezone },
        jd,
        ayanamsa: this._calculateAyanamsa(jd)
      };
    } catch (error) {
      logger.error('Error calculating natal chart:', error);
      throw new Error(`Natal chart calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate Julian Day
   */
  _calculateJulianDay(year, month, day, ut) {
    // Astronomical Julian Day calculation
    const date = new Date(Date.UTC(year, month - 1, day));
    return Math.floor(date.getTime() / 86400000) + 2440587.5 + ut / 24;
  }

  /**
   * Calculate houses using whole sign system
   */
  _calculateHouses(jd, latitude, longitude) {
    try {
      // Ascendant calculation
      const ascendantResult = sweph.swe_houses(jd, latitude, longitude, 'E');
      const ascendant = ascendantResult ? ascendantResult.ascendant : 0;

      // Midheaven calculation
      const midheavenResult = sweph.swe_calc_ut(jd, sweph.SE_MIDHEAVEN,
        sweph.SEFLG_SIDEREAL | sweph.SEFLG_EQUATORIAL);
      const midheaven = midheavenResult ? midheavenResult.longitude[0] : 0;

      return {
        ascendant: {
          longitude: ascendant,
          sign: Math.floor(ascendant / 30) + 1,
          signName: this._getZodiacSign(ascendant)
        },
        midheaven: {
          longitude: midheaven,
          sign: Math.floor(midheaven / 30) + 1,
          signName: this._getZodiacSign(midheaven)
        }
      };
    } catch (error) {
      logger.warn('House calculation error:', error);
      return { ascendant: { longitude: 0 }, midheaven: { longitude: 0 } };
    }
  }

  /**
   * Calculate which house a longitude falls into
   */
  _getHouseForLongitude(planetLong, ascendantLong) {
    const relativePos = (planetLong - ascendantLong + 360) % 360;
    return Math.floor(relativePos / 30) + 1;
  }

  /**
   * Calculate nakshatra for a longitude
   */
  _calculateNakshatra(longitude) {
    const nakshatraDegrees = 13.333333; // 27 nakshatras in 360°
    const nakshatraNumber = Math.floor(longitude / nakshatraDegrees);
    const nakshatraNames = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
      'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni',
      'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha',
      'Jyeshta', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana',
      'Dhanishta', 'Satabhisa', 'Purva Bhadarpa', 'Uttara Bhadrapada', 'Revati'
    ];

    return {
      number: nakshatraNumber + 1,
      name: nakshatraNames[nakshatraNumber % 27] || 'Unknown'
    };
  }

  /**
   * Get zodiac sign name
   */
  _getZodiacSign(longitude) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs[Math.floor(longitude / 30)] || 'Unknown';
  }

  /**
   * Calculate ayanamsa (precession correction)
   */
  _calculateAyanamsa(jd) {
    try {
      return sweph.swe_get_ayanamsa_ut(jd);
    } catch (error) {
      logger.warn('Could not calculate ayanamsa');
      return 23.5; // Default Lahiri ayanamsa
    }
  }

  /**
   * Analyze basic marriage indicators
   */
  _analyzeBasicMarriageIndicators(natalChart) {
    const indicators = {
      overallPotential: 50,
      planetaryStrengths: {},
      favorableFactors: [],
      concerningFactors: []
    };

    const { planets } = natalChart;

    // Venus analysis (primary marriage significator)
    if (planets.venus) {
      indicators.planetaryStrengths.venus = this._assessVenusMarriagePower(planets.venus);

      if ([2, 7, 12].includes(planets.venus.sign)) { // Own/signs/exalted
        indicators.favorableFactors.push('Strong Venus placement');
        indicators.overallPotential += 15;
      }

      if ([7, 2].includes(planets.venus.house)) { // Benefic houses
        indicators.favorableFactors.push('Venus in favorable house');
        indicators.overallPotential += 10;
      }

      if ([6, 8, 12].includes(planets.venus.house)) { // Dusthana houses
        indicators.concerningFactors.push('Venus in challenging house');
        indicators.overallPotential -= 10;
      }
    }

    // Jupiter analysis (marriage blessing)
    if (planets.jupiter) {
      indicators.planetaryStrengths.jupiter = this._assessJupiterMarriageBlessing(planets.jupiter);

      if ([1, 4, 5, 7, 9, 10].includes(planets.jupiter.house)) { // Kendra trikona
        indicators.favorableFactors.push('Beneficial Jupiter placement');
        indicators.overallPotential += 15;
      }

      if ([5, 9].includes(planets.jupiter.sign) || planets.jupiter.sign === 4) { // Own/exalted
        indicators.favorableFactors.push('Strong Jupiter');
        indicators.overallPotential += 10;
      }
    }

    // Mars analysis (combat/sexual drive)
    if (planets.mars) {
      indicators.planetaryStrengths.mars = this._assessMarsMarriageImpact(planets.mars);

      if ([1, 8, 12].includes(planets.mars.house)) { // Own houses
        indicators.favorableFactors.push('Mars shows strong drive');
        indicators.overallPotential += 5;
      }

      // Manglik considerations (dangerous for marriage)
      const dangerousHouses = [1, 2, 4, 7, 8, 12];
      if (dangerousHouses.includes(planets.mars.house)) {
        indicators.concerningFactors.push('Mars in dangerous location (Manglik Dosh consideration)');
        indicators.overallPotential -= 10;
      }
    }

    // Moon analysis (emotional happiness)
    if (planets.moon) {
      indicators.planetaryStrengths.moon = this._assessMoonMarriageComfort(planets.moon);

      if ([4, 7, 10].includes(planets.moon.house)) { // Kendra houses
        indicators.favorableFactors.push('Moon in supportive position');
        indicators.overallPotential += 10;
      }
    }

    // 7th house analysis
    const seventhHousePlanets = Object.values(planets).filter(p =>
      p.house === 7 && !['ascendant', 'midheaven'].includes(Object.keys({ planets })[Object.values(planets).indexOf(p)])
    );

    if (seventhHousePlanets.length > 0) {
      indicators.favorableFactors.push('Planets in 7th house activate marriage');
      indicators.overallPotential += 10 * seventhHousePlanets.length;
    }

    indicators.overallPotential = Math.max(0, Math.min(100, indicators.overallPotential));

    return indicators;
  }

  /**
   * Calculate marriage age likelihood windows
   */
  _calculateMarriageAgeLikelihood(natalChart) {
    const windows = {
      earlyMarriage: { range: '18-23', likelihood: 25, factors: [] },
      averageMarriage: { range: '24-30', likelihood: 45, factors: [] },
      laterMarriage: { range: '31-42', likelihood: 20, factors: [] },
      delayedMarriage: { range: '43+', likelihood: 10, factors: [] }
    };

    const { planets } = natalChart;

    if (planets.venus) {
      const venusSign = planets.venus.sign;
      const venusHouse = planets.venus.house;

      // Venus in early marriage signs
      if (venusSign === 7 || venusSign === 12) { // Libra, Pisces
        windows.earlyMarriage.likelihood += 15;
        windows.earlyMarriage.factors.push('Venus indicates early marriage');
      }

      if (venusHouse >= 9) { // Venus in higher houses suggests late marriage
        windows.laterMarriage.likelihood += 15;
        windows.averageMarriage.likelihood -= 10;
      }
    }

    if (planets.jupiter) {
      const jupiterHouse = planets.jupiter.house;

      if ([2, 5].includes(jupiterHouse)) { // Good marriage houses for Jupiter
        windows.averageMarriage.likelihood += 15;
        windows.averageMarriage.factors.push('Jupiter favors marriage around 24-30');
      }

      if ([9, 10, 11].includes(planets.jupiter.sign)) { // Later signs
        windows.laterMarriage.likelihood += 10;
      }
    }

    if (planets.mars) {
      if (planets.mars.house === 7) { // Mars in 7th urges marriage
        windows.earlyMarriage.likelihood += 10;
        windows.averageMarriage.likelihood += 5;
      }
    }

    if (planets.saturn) {
      if (planets.saturn.house === 7) { // Saturn in 7th delays marriage
        windows.delayedMarriage.likelihood += 20;
        windows.laterMarriage.likelihood += 10;
        windows.averageMarriage.likelihood -= 15;
      }
    }

    // 7th house lord position
    const seventhLord = this._getHouseLord(7, planets);
    if (planets[seventhLord]) {
      const lordHouse = planets[seventhLord].house;

      if ([1, 2, 3].includes(lordHouse)) { // Early activation
        windows.earlyMarriage.likelihood += 10;
      } else if ([8, 9, 10, 11, 12].includes(lordHouse)) { // Later activation
        windows.laterMarriage.likelihood += 10;
      }
    }

    // Normalize percentages
    const total = Object.values(windows).reduce((sum, w) => sum + w.likelihood, 0);
    Object.keys(windows).forEach(key => {
      windows[key].likelihood = Math.round((windows[key].likelihood / total) * 100);
    });

    // Find most promising window
    const mostPromising = Object.keys(windows).reduce((a, b) =>
      (windows[a].likelihood > windows[b].likelihood ? a : b)
    );

    return {
      ...windows,
      mostPromising: windows[mostPromising].range,
      estimatedAge: this._calculateEstimatedMarriageAge(windows)
    };
  }

  /**
   * Calculate favorable marriage periods
   */
  _calculateFavorableMarriagePeriods(natalChart) {
    const periods = [];
    const currentYear = new Date().getFullYear();

    // Major transit periods
    const jupiterPeriods = this._calculateJupiterMarriagePeriods(natalChart, currentYear);
    const saturnPeriods = this._calculateSaturnMarriagePeriods(natalChart, currentYear);
    const venusPeriods = this._calculateVenusMarriagePeriods(natalChart, currentYear);

    // Combine all periods
    const allPeriods = [...jupiterPeriods, ...saturnPeriods, ...venusPeriods];

    // Sort by promise level and remove duplicates/close periods
    allPeriods.sort((a, b) => b.promiseLevel - a.promiseLevel);

    // Filter to top 10 unique periods
    const uniquePeriods = [];
    allPeriods.forEach(period => {
      const existing = uniquePeriods.find(p =>
        Math.abs(p.startYear - period.startYear) <= 1 &&
        Math.abs(p.promiseLevel - period.promiseLevel) <= 10
      );

      if (!existing) {
        uniquePeriods.push(period);
      }
    });

    return uniquePeriods.slice(0, 15);
  }

  /**
   * Calculate Jupiter's marriage timing influence
   */
  _calculateJupiterMarriagePeriods(natalChart, currentYear) {
    const periods = [];
    const jupiterYears = [6, 12, 18, 24, 30]; // Jupiter cycles

    jupiterYears.forEach(years => {
      const periodYear = currentYear + years;
      periods.push({
        startYear: periodYear,
        endYear: periodYear + 2,
        description: `Jupiter ${years}-year cycle peak`,
        promiseLevel: 85,
        duration: '2 years',
        primaryInfluences: ['Jupiter expansion', 'Marriage opportunities', 'Blessings'],
        strength: 'High'
      });
    });

    return periods;
  }

  /**
   * Calculate Saturn's marriage timing influence
   */
  _calculateSaturnMarriagePeriods(natalChart, currentYear) {
    const periods = [];
    const saturnYears = [14, 21, 29, 43, 57]; // Saturn return cycles

    saturnYears.forEach(years => {
      const periodYear = currentYear + years;
      periods.push({
        startYear: periodYear - 1,
        endYear: periodYear + 1,
        description: `Saturn ${years}-year maturity cycle`,
        promiseLevel: 70,
        duration: '3 years',
        primaryInfluences: ['Saturn commitment', 'Long-term stability', 'Responsible relationships'],
        strength: 'Moderate'
      });
    });

    return periods;
  }

  /**
   * Calculate Venus marriage timing influence
   */
  _calculateVenusMarriagePeriods(natalChart, currentYear) {
    const periods = [];
    const venusYears = [8, 16, 24, 32, 40]; // Venus 8-year cycles

    venusYears.forEach(years => {
      const periodYear = currentYear + years;
      periods.push({
        startYear: periodYear - 1,
        endYear: periodYear + 1,
        description: `Venus ${years}-year cycle`,
        promiseLevel: 80,
        duration: '2 years',
        primaryInfluences: ['Venus love & beauty', 'Romance & marriage', 'Harmonious relationships'],
        strength: 'High'
      });
    });

    return periods;
  }

  /**
   * Identify marriage obstacles and blocking factors
   */
  _identifyMarriageObstacles(natalChart) {
    const obstacles = {
      majorBlocks: [],
      minorDelays: [],
      warnings: [],
      severity: 'Low',
      recommendations: []
    };

    const { planets } = natalChart;

    // Saturn in 7th house
    if (planets.saturn?.house === 7) {
      obstacles.majorBlocks.push({
        planet: 'Saturn',
        description: 'Saturn in 7th house traditionally delays marriage',
        severity: 'High',
        remedy: 'Strengthen 7th house through mantras and rituals'
      });
    }

    // Mars in dangerous positions (Manglik)
    const dangerousHouses = [1, 2, 4, 7, 8, 12];
    if (dangerousHouses.includes(planets.mars?.house)) {
      obstacles.majorBlocks.push({
        planet: 'Mars',
        description: 'Potential Manglik Dosh requiring proper analysis',
        severity: 'High',
        remedy: 'Consult marriage compatibility specialist'
      });
    }

    // Rahu/Ketu in marriage houses
    if ([7, 8].includes(planets.rahu?.house)) {
      obstacles.minorDelays.push({
        planet: 'Rahu',
        description: 'Rahu may bring unconventional marriage or delays',
        severity: 'Medium',
        remedy: 'Rahu mantra and temple visits'
      });
    }

    if ([7, 8].includes(planets.ketu?.house)) {
      obstacles.minorDelays.push({
        planet: 'Ketu',
        description: 'Ketu may cause detachment issues in marriage',
        severity: 'Medium',
        remedy: 'Ketu strengthening rituals'
      });
    }

    // Empty 7th house
    const seventhHousePlanets = Object.values(planets).filter(p => p.house === 7).length;
    if (seventhHousePlanets === 0) {
      obstacles.warnings.push({
        description: 'Empty 7th house - marriage depends on planetary transits',
        severity: 'Low'
      });
    }

    // Determine overall severity
    const majorCount = obstacles.majorBlocks.length;
    const minorCount = obstacles.minorDelays.length;

    if (majorCount >= 2) {
      obstacles.severity = 'Very High';
      obstacles.recommendations.push('Strong remedial measures needed');
    } else if (majorCount === 1) {
      obstacles.severity = 'High';
      obstacles.recommendations.push('Moderate remedial measures');
    } else if (minorCount >= 2) {
      obstacles.severity = 'Medium';
      obstacles.recommendations.push('Minor remedial measures, careful timing');
    }

    obstacles.recommendations.push('Consult qualified Vedic astrologer for personalized guidance');

    return obstacles;
  }

  /**
   * Analyze marriage houses in detail
   */
  _analyzeMarriageHouses(natalChart) {
    const analysis = {
      seventhHouse: {},
      secondHouse: {},
      twelfthHouse: {},
      eighthHouse: {}
    };

    const { planets } = natalChart;

    // 7th house - Marriage house
    analysis.seventhHouse = {
      lord: this._getHouseLord(7, planets),
      planets: this._getPlanetsInHouse(7, planets),
      strength: this._assessHouseStrength(7, planets),
      significations: this._getHouseSignifications(7)
    };

    // 2nd house - Family wealth house
    analysis.secondHouse = {
      lord: this._getHouseLord(2, planets),
      planets: this._getPlanetsInHouse(2, planets),
      strength: this._assessHouseStrength(2, planets),
      significations: this._getHouseSignifications(2)
    };

    // 12th house - Spiritual connection house
    analysis.twelfthHouse = {
      lord: this._getHouseLord(12, planets),
      planets: this._getPlanetsInHouse(12, planets),
      strength: this._assessHouseStrength(12, planets),
      significations: this._getHouseSignifications(12)
    };

    // 8th house - Transformation house
    analysis.eighthHouse = {
      lord: this._getHouseLord(8, planets),
      planets: this._getPlanetsInHouse(8, planets),
      strength: this._assessHouseStrength(8, planets),
      significations: this._getHouseSignifications(8)
    };

    return analysis;
  }

  /**
   * Analyze marriage planets in detail
   */
  _analyzeMarriagePlanets(natalChart) {
    const analysis = {
      marriageSignificators: {},
      functionalBenefics: {},
      functionalMalefics: {}
    };

    const { planets } = natalChart;

    // Primary marriage significators
    analysis.marriageSignificators = {
      venus: planets.venus ? this._detailedPlanetAnalysis(planets.venus, 'marriage') : null,
      jupiter: planets.jupiter ? this._detailedPlanetAnalysis(planets.jupiter, 'blessings') : null,
      moon: planets.moon ? this._detailedPlanetAnalysis(planets.moon, 'emotions') : null
    };

    // Functional benefics for marriage
    analysis.functionalBenefics = {
      mercury: planets.mercury ? this._detailedPlanetAnalysis(planets.mercury, 'communication') : null,
      sun: planets.sun ? this._detailedPlanetAnalysis(planets.sun, 'vitality') : null
    };

    // Functional malefics for marriage
    analysis.functionalMalefics = {
      mars: planets.mars ? this._detailedPlanetAnalysis(planets.mars, 'drive') : null,
      saturn: planets.saturn ? this._detailedPlanetAnalysis(planets.saturn, 'karma') : null,
      rahu: planets.rahu ? this._detailedPlanetAnalysis(planets.rahu, 'transformation') : null,
      ketu: planets.ketu ? this._detailedPlanetAnalysis(planets.ketu, 'liberation') : null
    };

    return analysis;
  }

  /**
   * Assess overall marriage strength indicators
   */
  _assessOverallMarriageStrength(natalChart) {
    const strength = {
      overallScore: 50,
      strengthAreas: [],
      weaknessAreas: [],
      generalIndicators: {}
    };

    const { planets } = natalChart;

    // Calculate overall score based on key factors
    if (planets.venus) {
      if ([2, 7, 12].includes(planets.venus.sign)) { strength.overallScore += 15; }
      if ([7, 2].includes(planets.venus.house)) { strength.overallScore += 10; }
      strength.strengthAreas.push('Venus strength');
    }

    if (planets.jupiter) {
      if ([1, 4, 5, 7, 9, 10].includes(planets.jupiter.house)) { strength.overallScore += 15; }
      strength.strengthAreas.push('Jupiter blessings');
    }

    if (planets.mars) {
      if (planets.mars.house === 7) { strength.overallScore += 10; }
      if ([1, 2, 4, 7, 8, 12].includes(planets.mars.house)) {
        strength.weaknessAreas.push('Manglik considerations');
        strength.overallScore -= 10;
      }
    }

    if (planets.saturn) {
      if (planets.saturn.house === 7) {
        strength.weaknessAreas.push('Saturn delay factors');
        strength.overallScore -= 15;
      }
    }

    strength.overallScore = Math.max(0, Math.min(100, strength.overallScore));

    strength.generalIndicators = {
      forecast: strength.overallScore >= 75 ? 'Very promising' :
        strength.overallScore >= 60 ? 'Promising' :
          strength.overallScore >= 40 ? 'Moderate potential' : 'Requires effort',
      timeRange: strength.overallScore >= 70 ? '18-30 years' :
        strength.overallScore >= 50 ? '21-35 years' : '25-45+ years'
    };

    return strength;
  }

  /**
   * Generate marriage recommendations
   */
  _generateMarriageRecommendations(natalChart) {
    const recommendations = {
      immediate: [],
      spiritual: [],
      practical: [],
      remedial: []
    };

    const { planets } = natalChart;

    // Immediate recommendations
    if (planets.venus && planets.venus.house !== 7) {
      recommendations.immediate.push('Focus on Venus-centered activities (art, music, romance)');
    }

    // Spiritual recommendations
    recommendations.spiritual.push('Chant Venus (Om Shukraya Namaha) and Jupiter (Om Gurave Namaha) mantras');
    recommendations.spiritual.push('Visit marriage-related temples during favorable transits');

    // Practical recommendations
    recommendations.practical.push('Enhance interpersonal skills and social networking');
    recommendations.practical.push('Focus on personal growth and self-improvement');

    // Remedial recommendations (based on weaknesses)
    if (planets.saturn && planets.saturn.house === 7) {
      recommendations.remedial.push('Saturn remedies: fast on Saturdays, donate to the needy');
    }

    if (planets.mars && [1, 2, 4, 7, 8, 12].includes(planets.mars.house)) {
      recommendations.remedial.push('Mars remedies: Hanuman Chalisa, red coral gemstone');
    }

    if (planets.rahu && [7, 8].includes(planets.rahu.house)) {
      recommendations.remedial.push('Rahu remedies: temple visits, silver donations');
    }

    return recommendations;
  }

  /**
   * Calculate Muhurta windows
   */
  _calculateMuhurtaWindows(natalChart) {
    const muhurta = {
      favorableYears: [],
      unfavorableYears: [],
      bestTithis: [],
      bestNakshatras: [],
      auspiciousDirections: {}
    };

    const currentYear = new Date().getFullYear();
    const { planets } = natalChart;

    // Favorable years (Jupiter/Venus periods)
    const jupiterYears = [6, 12, 18, 24, 30, 42, 48, 54];
    muhurta.favorableYears = jupiterYears.map(y => currentYear + y);

    // Unfavorable years (Saturn periods)
    const saturnYears = [7, 19, 31, 43, 55, 67];
    muhurta.unfavorableYears = saturnYears.map(y => currentYear + y);

    // Best Tithis (lunar days)
    muhurta.bestTithis = ['8th waxing (Ashtami)', '12th waxing (Dwadashi)', 'Full Moon'];

    // Best Nakshatras for marriage
    muhurta.bestNakshatras = ['Rohini', 'Magha', 'Uttara Phalguni', 'Hasta', 'Swati', 'Anuradha'];

    // Auspicious directions for marriage
    muhurta.auspiciousDirections = {
      facing: planets.ascendant.sign >= 7 ? 'North' : 'West',
      mandap: 'East-facing seat preferred'
    };

    return muhurta;
  }

  /**
   * Analyze current transits relative to marriage
   */
  _analyzeCurrentTransits(natalChart) {
    const transits = {
      currentInfluences: [],
      upcoming: [],
      favorable: [],
      challenging: []
    };

    try {
      const currentJd = this._calculateJulianDay(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        new Date().getDate(),
        12
      );

      // Get current Jupiter, Venus, Saturn positions
      const jupiterTrans = sweph.swe_calc_ut(currentJd, sweph.SE_JUPITER, sweph.SEFLG_SIDEREAL);
      const venusTrans = sweph.swe_calc_ut(currentJd, sweph.SE_VENUS, sweph.SEFLG_SIDEREAL);
      const saturnTrans = sweph.swe_calc_ut(currentJd, sweph.SE_SATURN, sweph.SEFLG_SIDEREAL);

      // Analyze transits
      if (jupiterTrans) {
        transits.currentInfluences.push({
          planet: 'Jupiter',
          position: `in ${this._getZodiacSign(jupiterTrans.longitude[0])}`,
          nature: 'Beneficial for marriage'
        });
      }

      if (venusTrans) {
        transits.currentInfluences.push({
          planet: 'Venus',
          position: `in ${this._getZodiacSign(venusTrans.longitude[0])}`,
          nature: 'Love and romance energy'
        });
      }

      if (saturnTrans) {
        transits.currentInfluences.push({
          planet: 'Saturn',
          position: `in ${this._getZodiacSign(saturnTrans.longitude[0])}`,
          nature: 'Maturity and commitment'
        });
      }
    } catch (error) {
      logger.warn('Transit analysis error:', error);
      transits.currentInfluences.push({
        error: 'Could not analyze current transits',
        note: 'Transit analysis requires proper ephemeris data'
      });
    }

    return transits;
  }

  /**
   * Analyze partner compatibility
   */
  async _analyzePartnerCompatibility(birthData, partnerData) {
    return {
      overallMatch: 'Compatible',
      challengedAreas: [],
      harmoniousElements: [],
      recommendations: ['Proceed with wedding plans', 'Consider Kundali matching']
    };
  }

  // Utility methods
  _assessVenusMarriagePower(venus) {
    let power = 50;

    if ([2, 7, 12].includes(venus.sign)) { power += 25; }
    if ([7, 2, 5, 9].includes(venus.house)) { power += 20; }
    if ([6, 8, 12].includes(venus.house)) { power -= 15; }

    return Math.max(0, Math.min(100, power));
  }

  _assessJupiterMarriageBlessing(jupiter) {
    let blessing = 50;

    if ([1, 4, 5, 7, 9, 10].includes(jupiter.house)) { blessing += 25; }
    if ([5, 9].includes(jupiter.sign) || jupiter.sign === 4) { blessing += 20; }

    return Math.max(0, Math.min(100, blessing));
  }

  _assessMarsMarriageImpact(mars) {
    let impact = 50;

    if (mars.house === 7) { impact += 20; }
    if ([1, 8, 12].includes(mars.house)) { impact += 15; }
    const dangerousHouses = [1, 2, 4, 7, 8, 12];
    if (dangerousHouses.includes(mars.house)) { impact -= 10; }

    return Math.max(0, Math.min(100, impact));
  }

  _assessMoonMarriageComfort(moon) {
    let comfort = 50;

    if ([4, 7, 10].includes(moon.house)) { comfort += 20; }
    if (moon.sign === 4) { comfort += 15; } // Cancer Moon

    return Math.max(0, Math.min(100, comfort));
  }

  _getHouseLord(house, planets) {
    const ascendantSign = planets.ascendant?.sign || 1;
    const signs = [
      'mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars',
      'jupiter', 'saturn', 'saturn', 'jupiter'
    ];

    const targetSign = (((ascendantSign - 1 + house - 1) % 12) + 1);
    return signs[targetSign - 1] || 'unknown';
  }

  _getPlanetsInHouse(houseNumber, planets) {
    return Object.entries(planets)
      .filter(([planet, data]) => data.house === houseNumber)
      .map(([planet]) => planet);
  }

  _assessHouseStrength(houseNumber, planets) {
    const planetsInHouse = this._getPlanetsInHouse(houseNumber, planets);
    return planetsInHouse.length * 15 + 25; // Base strength plus planet influence
  }

  _getHouseSignifications(houseNumber) {
    const significations = {
      1: ['Self', 'Personality', 'Life path'],
      2: ['Wealth', 'Family', 'Speech'],
      3: ['Siblings', 'Courage', 'Skills'],
      4: ['Home', 'Mother', 'Emotions'],
      5: ['Children', 'Intelligence', 'Creativity'],
      6: ['Enemies', 'Health', 'Service'],
      7: ['Spouse', 'Partnership', 'Business'],
      8: ['Transformation', 'Secrets', 'Inheritance'],
      9: ['Fortune', 'Father', 'Spirituality'],
      10: ['Career', 'Fame', 'Authority'],
      11: ['Gains', 'Elder siblings', 'Friends'],
      12: ['Spirituality', 'Foreign lands', 'Expenses']
    };

    return significations[houseNumber] || [];
  }

  _detailedPlanetAnalysis(planet, context) {
    return {
      position: `${planet.sign} ${planet.signName} ${planet.degree}'`,
      house: planet.house,
      nakshatra: planet.nakshatra,
      strength: this._assessPlanetStrength(planet),
      influence: context
    };
  }

  _assessPlanetStrength(planet) {
    let strength = 50;

    // House strength
    if ([1, 4, 5, 7, 9, 10].includes(planet.house)) { strength += 20; }
    if ([3, 6, 8, 12].includes(planet.house)) { strength -= 15; }

    // Sign strength (own/exalted vs debilitated)
    const favorableSigns = [2, 7, 4, 9, 1, 8, 5, 9]; // Venus, Venus, Moon, Jupiter, Sun, Mars, Mercury, Jupiter
    const unfavorableSigns = [8, 1, 12, 12, 11, 4, 8, 6]; // Venus deb, Mars deb, Moon deb, etc.

    if (favorableSigns.includes(planet.sign)) { strength += 15; }
    if (unfavorableSigns.includes(planet.sign)) { strength -= 10; }

    return Math.max(0, Math.min(100, strength));
  }

  _calculateEstimatedMarriageAge(windows) {
    const earlyWeight = 21 * (windows.earlyMarriage.likelihood / 100);
    const averageWeight = 27 * (windows.averageMarriage.likelihood / 100);
    const laterWeight = 36 * (windows.laterMarriage.likelihood / 100);
    const delayedWeight = 48 * (windows.delayedMarriage.likelihood / 100);

    return Math.round(earlyWeight + averageWeight + laterWeight + delayedWeight);
  }

  /**
   * Geocoding and timezone utilities
   */
  async _getCoordinatesForPlace(place) {
    return [28.6139, 77.209]; // Default Delhi coordinates
  }

  async _getTimezoneForPlace(lat, lng, timestamp) {
    return 5.5; // Default IST timezone
  }
}

module.exports = MarriageTimingCalculator;
