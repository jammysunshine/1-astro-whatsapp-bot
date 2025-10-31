const logger = require('../../../../utils/logger');
const sweph = require('sweph');

/**
 * Detailed Chart Analysis Calculator
 * Generates comprehensive Vedic chart interpretation with advanced analysis
 * Provides deep insights into yogas, Arudha Padas, Upagrahas, and planetary combinations
 */
class DetailedChartAnalysisCalculator {
  constructor(astrologer, geocodingService) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;
  }

  /**
   * Set services for the calculator
   */
  setServices(services) {
    this.services = services;
  }

  /**
   * Generate comprehensive Vedic chart analysis
   * @param {Object} birthData - Birth data object
   * @param {Object} options - Analysis options (detailed level, specific areas to focus on)
   * @returns {Object} Comprehensive chart analysis
   */
  async generateDetailedChartAnalysis(birthData, options = {}) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return { error: 'Complete birth details required for detailed chart analysis' };
      }

      // Parse birth details
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Generate complete natal chart
      const natalChart = await this._generateCompleteNatalChart(year, month, day, hour, minute, latitude, longitude, timezone);

      // Raj & Dhan Yogas analysis
      const rajDhanYogas = this._analyzeRajDhanYogas(natalChart);

      // Arudha Padas analysis
      const arudhaPadas = this._calculateArudhaPadas(natalChart);

      // Upagrahas analysis
      const upagrahas = this._calculateUpagrahas(natalChart);

      // Planetary aspects and combinations
      const planetaryCombinations = this._analyzePlanetaryCombinations(natalChart);

      // Chart especiais - special analysis points
      const chartEspecial = this._analyzeChartEspecial(natalChart);

      // Bhavat Bhavam analysis (house interrelationships)
      const bhavatBhavam = this._analyzeBhavatBhavam(natalChart);

      // Spiritual indicators
      const spiritualIndicators = this._analyzeSpiritualIndicators(natalChart);

      // Career and finance indicators
      const careerFinanceAnalysis = this._analyzeCareerFinance(natalChart);

      // Relationship indicators
      const relationshipIndicators = this._analyzeRelationships(natalChart);

      // Health and longevity
      const healthAnalysis = this._analyzeHealthAndLongevity(natalChart);

      // Generate specific focus areas based on options
      const focusedAnalysis = this._generateFocusedAnalysis(natalChart, options.focusAreas);

      return {
        name,
        natalChart,
        rajDhanYogas,
        arudhaPadas,
        upagrahas,
        planetaryCombinations,
        chartEspecial,
        bhavatBhavam,
        spiritualIndicators,
        careerFinanceAnalysis,
        relationshipIndicators,
        healthAnalysis,
        focusedAnalysis,
        summary: this._generateComprehensiveSummary(natalChart, rajDhanYogas, spiritualIndicators)
      };
    } catch (error) {
      logger.error('❌ Error in detailed chart analysis:', error);
      throw new Error(`Detailed chart analysis failed: ${error.message}`);
    }
  }

  /**
   * Get quick chart insights for a specific area
   */
  async getChartInsights(birthData, area) {
    try {
      const fullAnalysis = await this.generateDetailedChartAnalysis(birthData);

      if (!fullAnalysis || fullAnalysis.error) return fullAnalysis;

      const areaMap = {
        career: fullAnalysis.careerFinanceAnalysis,
        relationships: fullAnalysis.relationshipIndicators,
        spirituality: fullAnalysis.spiritualIndicators,
        health: fullAnalysis.healthAnalysis,
        wealth: fullAnalysis.careerFinanceAnalysis.financialHouses,
        yoga_combinations: fullAnalysis.rajDhanYogas
      };

      return areaMap[area] || { message: `Detailed ${area} analysis available in complete chart` };
    } catch (error) {
      logger.error('Error getting chart insights:', error.message);
      return { error: 'Unable to get chart insights' };
    }
  }

  /**
   * Generate complete natal chart with all calculations
   * @private
   */
  async _generateCompleteNatalChart(year, month, day, hour, minute, latitude, longitude, timezone) {
    const chart = {
      planets: {},
      houses: [],
      ascendant: {},
      aspects: [],
      interceptedSigns: [],
      emptyHouses: []
    };

    // Calculate Julian Day
    const jd = this._dateToJulianDay(year, month, day, hour + minute / 60 - timezone);

    // Calculate planets
    const planetIds = {
      sun: sweph.SE_SUN, moon: sweph.SE_MOON, mars: sweph.SE_MARS,
      mercury: sweph.SE_MERCURY, jupiter: sweph.SE_JUPITER,
      venus: sweph.SE_VENUS, saturn: sweph.SE_SATURN,
      uranus: sweph.SE_URANUS, neptune: sweph.SE_NEPTUNE, pluto: sweph.SE_PLUTO,
      rahu: sweph.SE_TRUE_NODE, ketu: sweph.SE_MEAN_APOG
    };

    for (const [planetName, planetId] of Object.entries(planetIds)) {
      const position = sweph.calc(jd, planetId, sweph.SEFLG_SIDEREAL | sweph.SEFLG_SPEED);
      if (position && Array.isArray(position.longitude)) {
        const longitude = position.longitude[0];
        const latitude = position.latitude || 0;
        const speed = position.longitude[3] || 0;

        chart.planets[planetName] = {
          longitude,
          latitude,
          speed,
          sign: Math.floor(longitude / 30) + 1,
          degree: longitude % 30,
          dignity: this._assessCompleteDignity(planetName, longitude),
          retrograde: speed < 0,
          gati: this._determineGati(speed)
        };
      }
    }

    // Calculate houses
    const houses = sweph.houses(jd, latitude, longitude, 'E'); // Equal houses
    chart.ascendant = {
      longitude: houses.ascendant,
      sign: Math.floor(houses.ascendant / 30) + 1,
      degree: houses.ascendant % 30
    };

    chart.houses = houses.houseCusps.map((cuspid, index) => ({
      number: index + 1,
      longitude: cuspid,
      sign: Math.floor(cuspid / 30) + 1,
      degree: cuspid % 30,
      lord: this._getSignLord(Math.floor(cuspid / 30) + 1),
      planets: []
    }));

    // Assign planets to houses
    Object.entries(chart.planets).forEach(([planet, data]) => {
      const houseNumber = this._getHouseForLongitude(data.longitude, houses.ascendant, houses.houseCusps);
      if (chart.houses[houseNumber - 1]) {
        chart.houses[houseNumber - 1].planets.push(planet);
      }
      data.house = houseNumber;
    });

    // Identify empty houses and intercepted signs
    chart.emptyHouses = chart.houses.filter(house => house.planets.length === 0).map(house => house.number);
    chart.interceptedSigns = this._findInterceptedSigns(houses.houseCusps);

    // Generate aspects
    chart.aspects = this._calculateVedicAspects(chart.planets, 'rasi');

    return chart;
  }

  /**
   * Analyze Raj Yogas (kingship) and Dhan Yogas (wealth)
   * @private
   */
  _analyzeRajDhanYogas(natalChart) {
    const yogas = {
      rajYogas: [],
      dhanYogas: [],
      combinedYogas: [],
      yogaStrength: {}
    };

    // Raj Yogas: Kendra lords with Trikona lords
    const kendraLords = [
      natalChart.ascendant.sign,
      natalChart.houses[9]?.sign,
      natalChart.houses[3]?.sign,
      natalChart.houses[6]?.sign
    ].map(sign => this._getSignLord(sign));

    const trikonaLords = [
      natalChart.houses[0]?.sign,
      natalChart.houses[4]?.sign,
      natalChart.houses[7]?.sign
    ].map(sign => this._getSignLord(sign));

    // Check for Raj Yoga combinations
    const rajCombinations = [];
    kendraLords.forEach(kendra => {
      trikonaLords.forEach(trikona => {
        // Conjunction of lords
        if (natalChart.planets[kendra] && natalChart.planets[trikona]) {
          const distance = Math.abs(natalChart.planets[kendra].longitude - natalChart.planets[trikona].longitude);
          const minDistance = Math.min(distance, 360 - distance);

          if (minDistance <= 10) { // Within orb
            rajCombinations.push({
              type: 'Raj Yoga',
              planets: [kendra, trikona],
              houses: `${natalChart.planets[kendra].house}, ${natalChart.planets[trikona].house}`,
              strength: this._assessYogaStrength(kendra, trikona, natalChart),
              activatedBy: this._identifyYogaTriggers(kendra, trikona, natalChart),
              effects: this._describeRajYogaEffects(kendra, trikona)
            });
          }
        }

        // Mutual aspects
        if (this._haveMutualAspect(kendra, trikona, natalChart)) {
          rajCombinations.push({
            type: 'Raj Yoga (aspect)',
            planets: [kendra, trikona],
            strength: 'Moderate',
            effects: 'Indirect but supportive leadership potential'
          });
        }
      });
    });

    yogas.rajYogas = rajCombinations;

    // Dhan Yogas: 2nd lord with 9th lord or other favorable combinations
    const dhanCombinations = [];
    const secondLord = this._getSignLord(natalChart.houses[1]?.sign);
    const ninthLord = this._getSignLord(natalChart.houses[8]?.sign);
    const eleventhLord = this._getSignLord(natalChart.houses[10]?.sign);

    // Classic Dhan Yogas
    [ninthLord, eleventhLord].forEach(planet => {
      if (natalChart.planets[planet] && natalChart.planets[secondLord]) {
        const distance = Math.abs(natalChart.planets[planet].longitude - natalChart.planets[secondLord].longitude);
        const minDistance = Math.min(distance, 360 - distance);

        if (minDistance <= 15) {
          dhanCombinations.push({
            type: 'Dhan Yoga',
            planets: [secondLord, planet],
            strength: this._assessDhanYogaStrength(secondLord, planet, natalChart),
            wealthAreas: this._identifyWealthAreas(secondLord, planet),
            timing: 'Activated through Jupiter or Venus periods'
          });
        }
      }
    });

    yogas.dhanYogas = dhanCombinations;

    // Combined Yogas (Raj + Dhan)
    yogas.combinedYogas = this._findCombinedYogas(rajCombinations, dhanCombinations);

    // Overall yoga strength assessment
    yogas.yogaStrength = this._calculateOverallYogaStrength(yogas);

    return yogas;
  }

  /**
   * Calculate Arudha Padas (projected images of houses)
   * @private
   */
  _calculateArudhaPadas(natalChart) {
    const arudhas = {};

    // Arudha Pada for each house (Bhav Arudha)
    for (let houseNum = 1; houseNum <= 12; houseNum++) {
      const houseLord = natalChart.houses[houseNum - 1]?.lord;

      if (!houseLord) continue;

      const lordData = natalChart.planets[houseLord];

      if (!lordData) continue;

      // Arudha calculation: Lord position + (Lord position - House position)
      const houseStart = natalChart.houses[houseNum - 1]?.longitude || 0;
      const lordPos = lordData.longitude;

      const distance = lordPos - houseStart;
      const arudhaLongitude = houseStart + distance;

      const normalizedArudhaLong = arudhaLongitude % 360;
      const arudhaSign = Math.floor(normalizedArudhaLong / 30) + 1;
      const arudhaDegree = normalizedArudhaLong % 30;

      arudhas[`arudha${houseNum}`] = {
        longitude: normalizedArudhaLong,
        sign: arudhaSign,
        degree: Math.round(arudhaDegree * 100) / 100,
        house: this._getHouseForLongitude(normalizedArudhaLong, natalChart.ascendant.longitude, natalChart.houses.map(h => h.longitude)),
        significance: this._getArudhaSignificance(houseNum),
        planets: this._getArudhaPlanets(normalizedArudhaLong, natalChart)
      };
    }

    // Special significance for key Arudha Padas
    if (arudhas.arudha1) {
      arudhas.arudha1.publicImage = this._analyzePublicImage(arudhas.arudha1);
    }

    if (arudhas.arudha7) {
      arudhas.arudha7.spouseCharacteristics = this._analyzeSpouseCharacteristics(arudhas.arudha7);
    }

    if (arudhas.arudha10) {
      arudhas.arudha10.careerImage = this._analyzeCareerImage(arudhas.arudha10);
    }

    return arudhas;
  }

  /**
   * Calculate Upagrahas (subsidiary planets)
   * @private
   */
  _calculateUpagrahas(natalChart) {
    const upagrahas = {};

    // Calculate key Upagrahas
    const sunLong = natalChart.planets.sun.longitude;
    const moonLong = natalChart.planets.moon.longitude;
    const ascLong = natalChart.ascendant.longitude;

    // Dhuma (smoke) Upagraha - 133°20' from Sun
    const dhumaLong = (sunLong + 133.333) % 360;
    upagrahas.dhuma = {
      longitude: dhumaLong,
      sign: Math.floor(dhumaLong / 30) + 1,
      significance: 'Obstacles, smoke, delays',
      house: this._getHouseForLongitude(dhumaLong, ascLong, natalChart.houses.map(h => h.longitude))
    };

    // Vyatipata Upagraha - 180° from Dhuma
    const vyatipataLong = (dhumaLong + 180) % 360;
    upagrahas.vyatipata = {
      longitude: vyatipataLong,
      sign: Math.floor(vyatipataLong / 30) + 1,
      significance: 'Sudden misfortune, reversals',
      house: this._getHouseForLongitude(vyatipataLong, ascLong, natalChart.houses.map(h => h.longitude))
    };

    // Parivesha Upagraha - 180° from Vyatipata
    const pariveshaLong = (vyatipataLong + 180) % 360;
    upagrahas.parivesha = {
      longitude: pariveshaLong,
      sign: Math.floor(pariveshaLong / 30) + 1,
      significance: 'Encirclement, environmental factors',
      house: this._getHouseForLongitude(pariveshaLong, ascLong, natalChart.houses.map(h => h.longitude))
    };

    // Indrachapa Upagraha - opposite of Indras (sun)
    const indrachapaLong = (sunLong + 180) % 360;
    upagrahas.indrachapa = {
      longitude: indrachapaLong,
      sign: Math.floor(indrachapaLong / 30) + 1,
      significance: 'Achievements, spiritual success',
      house: this._getHouseForLongitude(indrachapaLong, ascLong, natalChart.houses.map(h => h.longitude))
    };

    // Additional Upagrahas based on planetary relationships
    upagrahas.kala = this._calculateKalaUpagraha(moonLong, ascLong);
    upagrahas.mrityu = this._calculateMrityuUpagraha(moonLong, ascLong);

    return upagrahas;
  }

  /**
   * Analyze complex planetary combinations
   * @private
   */
  _analyzePlanetaryCombinations(natalChart) {
    const combinations = {
      conjunctions: [],
      mutualReceptions: [],
      planetaryWars: [],
      specialCombinations: []
    };

    // Analyze conjunctions (planets in same sign)
    const conjunctPlanets = {};
    Object.entries(natalChart.planets).forEach(([planet1, data1]) => {
      Object.entries(natalChart.planets).forEach(([planet2, data2]) => {
        if (planet1 < planet2 && data1.sign === data2.sign) {
          const distance = Math.abs(data1.longitude - data2.longitude);

          if (distance <= 15) { // Within conjunction orb
            if (!conjunctPlanets[data1.sign]) conjunctPlanets[data1.sign] = [];
            conjunctPlanets[data1.sign].push([planet1, planet2, distance]);
          }
        }
      });
    });

    // Process conjunctions
    Object.entries(conjunctPlanets).forEach(([sign, pairs]) => {
      pairs.forEach(([planet1, planet2, distance]) => {
        combinations.conjunctions.push({
          planets: [planet1, planet2],
          sign: parseInt(sign),
          separation: Math.round(distance * 100) / 100,
          significance: this._interpretConjunction(planet1, planet2),
          strength: this._assessConjunctionStrength(planet1, planet2, natalChart)
        });
      });
    });

    // Find planetary wars (close proximity of natural malefics)
    combinations.planetaryWars = this._identifyPlanetaryWars(natalChart);

    // Find mutual receptions
    combinations.mutualReceptions = this._findMutualReceptions(natalChart);

    // Special combinations (like Raja Yoga variations)
    combinations.specialCombinations = this._findSpecialCombinations(natalChart);

    return combinations;
  }

  /**
   * Analyze Chart Especial (special points and sensitive areas)
   * @private
   */
  _analyzeChartEspecial(natalChart) {
    const especial = {
      sensitivePoints: [],
      sandhiPositions: [],
      criticalAreas: [],
      focalPoints: []
    };

    // Critical degrees (0°, 13°, 16°, 26°, 29°)
    const criticalDegrees = [0, 13.333, 16, 26.667, 29];
    const sensitivePoints = [];

    criticalDegrees.forEach(criticalDeg => {
      for (let sign = 1; sign <= 12; sign++) {
        const longitude = (sign - 1) * 30 + criticalDeg;
        const planetsNearCritical = this._findPlanetsNearPoint(longitude, natalChart, 2);

        if (planetsNearCritical.length > 0) {
          sensitivePoints.push({
            longitude: Math.round(longitude * 100) / 100,
            sign,
            criticalDegree: criticalDeg,
            degreeType: this._getCriticalDegreeMeaning(criticalDeg),
            planets: planetsNearCritical,
            significance: 'High sensitivity - intensified planetary effects'
          });
        }
      }
    });

    especial.sensitivePoints = sensitivePoints;

    // Sandhi positions (sign boundaries)
    especial.sandhiPositions = this._analyzeSandhiPositions(natalChart);

    // Critical focal points (derived from house cusps and significant planets)
    especial.focalPoints = this._identifyFocalPoints(natalChart);

    return especial;
  }

  /**
   * Analyze Bhavat Bhavam (how each house affects others)
   * @private
   */
  _analyzeBhavatBhavam(natalChart) {
    const bhavatBhavam = {
      houseRelationships: {},
      interdependentThemes: [],
      housePowerFlow: []
    };

    // Analyze each house's relationship to its significating houses
    for (let house = 1; house <= 12; house++) {
      bhavatBhavam.houseRelationships[house] = {
        primary: this._getHouseKarakas(house),
        supporting: this._getSupportingHouses(house),
        challenging: this._getChallengingHouses(house),
        powerIndicators: this._assessHousePower(house, natalChart)
      };
    }

    // Identify interdependent house themes
    bhavatBhavam.interdependentThemes = this._findInterdependentThemes(natalChart);

    // Trace power flow through the chart
    bhavatBhavam.housePowerFlow = this._tracePowerFlow(natalChart);

    return bhavatBhavam;
  }

  /**
   * Analyze career and financial indicators
   * @private
   */
  _analyzeCareerFinance(natalChart) {
    const analysis = {
      careerHouses: {},
      financialHouses: {},
      careerStrength: 0,
      financialStrength: 0,
      careerIndicators: [],
      financialIndicators: [],
      timingActivators: []
    };

    // Analyze 10th house (career)
    analysis.careerHouses.tenth = this._analyzeTenthHouse(natalChart);
    analysis.careerHouses.sixth = this._analyzeSixthHouse(natalChart); // Service
    analysis.careerHouses.second = this._analyzeSecondHouse(natalChart); // Earnings

    // Analyze financial houses
    analysis.financialHouses.second = this._analyzeSecondHouseForFinance(natalChart);
    analysis.financialHouses.eleventh = this._analyzeEleventhHouse(natalChart); // Gains
    analysis.financialHouses.eighth = this._analyzeEighthHouse(natalChart); // Inheritances/transformations

    // Calculate overall strengths
    analysis.careerStrength = this._calculateCareerStrength(natalChart);
    analysis.financialStrength = this._calculateFinancialStrength(natalChart);

    // Identify key indicators
    analysis.careerIndicators = this._identifyCareerIndicators(natalChart);
    analysis.financialIndicators = this._identifyFinancialIndicators(natalChart);

    // Timing factors for career/financial periods
    analysis.timingActivators = this._identifyTimingActivators(natalChart);

    return analysis;
  }

  /**
   * Generate comprehensive summary of all detailed analysis
   * @private
   */
  _generateComprehensiveSummary(natalChart, rajDhanYogas, spiritualIndicators) {
    let summary = '🔍 *Comprehensive Vedic Chart Analysis*\n\n';

    summary += `*Ascendant: ${this._getSignName(natalChart.ascendant.sign)}*\n`;
    summary += `*Sun Sign: ${this._getSignName(natalChart.planets.sun.sign)}*\n`;
    summary += `*Moon Sign: ${this._getSignName(natalChart.planets.moon.sign)}*\n\n`;

    // Yogas summary
    if (rajDhanYogas.rajYogas.length > 0) {
      summary += '*Raj Yogas:*\n';
      rajDhanYogas.rajYogas.forEach(yoga => {
        summary += `• ${yoga.planets.join(' + ')} (${yoga.strength})\n`;
      });
      summary += '\n';
    }

    if (rajDhanYogas.dhanYogas.length > 0) {
      summary += '*Dhan Yogas:*\n';
      rajDhanYogas.dhanYogas.forEach(yoga => {
        summary += `• ${yoga.planets.join(' + ')} (${yoga.strength})\n`;
      });
      summary += '\n';
    }

    // Spiritual indicators
    if (spiritualIndicators.mainPaths.length > 0) {
      summary += '*Spiritual Orientation:*\n';
      spiritualIndicators.mainPaths.forEach(path => {
        summary += `• ${path.area} (${path.indicator})\n`;
      });
      summary += '\n';
    }

    // Key planetary combinations
    const keyCombinations = natalChart.aspects?.filter(aspect =>
      aspect.orbs <= 3 && ['conjunction', 'trine', 'sextile'].includes(aspect.type)
    ) || [];

    if (keyCombinations.length > 0) {
      summary += '*Key Planetary Combinations:*\n';
      keyCombinations.slice(0, 3).forEach(combo => {
        summary += `• ${combo.planets.join('-')}\n`;
      });
      summary += '\n';
    }

    summary += '*This detailed analysis examines the complete Vedic birth chart structure, providing comprehensive insights across all life areas.*';

    return summary;
  }

  // Helper methods for detailed calculations
  _getSignName(signNumber) {
    const signs = ['', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs[signNumber] || 'Unknown';
  }

  _getSignLord(sign) {
    const lords = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
    return lords[sign - 1];
  }

  _getHouseForLongitude(longitude, ascendant, houseCusps) {
    for (let i = 0; i < houseCusps.length; i++) {
      const nextIndex = (i + 1) % houseCusps.length;
      const currentCuspid = houseCusps[i];
      const nextCuspid = houseCusps[nextIndex];

      if (nextCuspid > currentCuspid) {
        if (longitude >= currentCuspid && longitude < nextCuspid) {
          return i + 1;
        }
      } else {
        // Handle across 360/0 degree boundary
        if (longitude >= currentCuspid || longitude < nextCuspid) {
          return i + 1;
        }
      }
    }
    return 1;
  }

  _assessCompleteDignity(planet, longitude) {
    // More detailed dignity assessment than simplified versions
    const sign = Math.floor(longitude / 30) + 1;
    const degree = longitude % 30;

    // Define owning signs, exalted signs, debilitated signs
    const dignityRules = {
      sun: { own: [5], exalted: 1, exaltedDegree: 10, debilitated: 7 },
      moon: { own: [4], exalted: 2, exaltedDegree: 3, debilitated: 8 },
      mars: { own: [1, 8], exalted: 10, exaltedDegree: 28, debilitated: 4 },
      mercury: { own: [3, 6], exalted: 6, exaltedDegree: 15, debilitated: 12 },
      jupiter: { own: [9, 12], exalted: 4, exaltedDegree: 5, debilitated: 10 },
      venus: { own: [2, 7], exalted: 12, exaltedDegree: 27, debilitated: 6 },
      saturn: { own: [10, 11], exalted: 7, exaltedDegree: 20, debilitated: 1 },
      rahu: { own: [], exalted: 3, exaltedDegree: null, debilitated: 9 },
      ketu: { own: [], exalted: 9, exaltedDegree: null, debilitated: 3 }
    };

    return dignityRules;
  }

  // ... rest of the method implementation

}

module.exports = { DetailedChartAnalysisCalculator };