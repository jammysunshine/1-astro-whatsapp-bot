const logger = require('../../../../utils/logger');
const sweph = require('sweph');

/**
 * Detailed Chart Calculator
 * Provides comprehensive Vedic chart analysis including aspects, yogas, arudhas, and interpretations
 */
class DetailedChartCalculator {
  constructor(astrologer, geocodingService) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;
  }

  /**
   * Set services for the calculator
   * @param {Object} services - Service object containing other calculators
   */
  setServices(services) {
    this.services = services;
  }

  /**
   * Generate comprehensive detailed Vedic chart analysis
   * @param {Object} birthData - Birth data object
   * @returns {Object} Detailed chart analysis
   */
  async generateDetailedChart(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return { error: 'Complete birth details required for detailed chart analysis' };
      }

      // Parse birth date and time
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Calculate core natal chart
      const natalChart = await this._calculateExtendedNatalChart(year, month, day, hour, minute, latitude, longitude, timezone);

      // Calculate comprehensive aspects
      const aspects = this._calculateComprehensiveAspects(natalChart.planets);

      // Identify planetary yogas and combinations
      const yogas = this._analyzeMajorYogas(natalChart.planets, natalChart.houses);

      // Calculate Arudha Padas (reflections/significations)
      const arudhas = this._calculateArudhaPadas(natalChart.planets, natalChart.houses);

      // Analyze planetary friendships and enmities
      const relationships = this._analyzePlanetaryRelationships(natalChart.planets);

      // Calculate upagrahas (subsidiary planets)
      const upagrahas = this._calculateUpagrahas(natalChart);

      // Analyze house significations and planetary influences
      const houseAnalysis = this._analyzeHouseStrengths(natalChart);

      // Calculate timing analysis (dashas, periods)
      const timingAnalysis = await this._calculateTimingAnalysis(natalChart, birthDateTime);

      // Generate detailed interpretations
      const interpretations = this._generateDetailedInterpretations(yogas, aspects, houseAnalysis, timingAnalysis);

      return {
        name,
        birthDetails: {
          date: birthDate,
          time: birthTime,
          place: birthPlace,
          coordinates: { latitude, longitude },
          timezone
        },
        chart: {
          planets: natalChart.planets,
          houses: natalChart.houses,
          ascendant: natalChart.ascendant,
          aspects,
          yogas,
          arudhas,
          upagrahas
        },
        analysis: {
          planetaryRelationships: relationships,
          houseAnalysis,
          timingAnalysis,
          strengths: this._calculateChartStrengths(natalChart),
          weaknesses: this._identifyChartWeaknesses(natalChart)
        },
        interpretations,
        predictions: this._generateLifelongPredictions(interpretations),
        summary: this._generateChartSummary(interpretations)
      };
    } catch (error) {
      logger.error('❌ Error in detailed chart analysis:', error);
      throw new Error(`Detailed chart analysis failed: ${error.message}`);
    }
  }

  /**
   * Calculate extended natal chart with additional points
   * @private
   */
  async _calculateExtendedNatalChart(year, month, day, hour, minute, latitude, longitude, timezone) {
    const natalPlanets = {};

    // Calculate Julian Day
    const jd = this._dateToJulianDay(year, month, day, hour + minute / 60 - timezone);

    // Planet IDs for Swiss Ephemeris
    const planetIds = {
      sun: sweph.SE_SUN,
      moon: sweph.SE_MOON,
      mars: sweph.SE_MARS,
      mercury: sweph.SE_MERCURY,
      jupiter: sweph.SE_JUPITER,
      venus: sweph.SE_VENUS,
      saturn: sweph.SE_SATURN,
      uranus: sweph.SE_URANUS,
      neptune: sweph.SE_NEPTUNE,
      pluto: sweph.SE_PLUTO,
      rahu: sweph.SE_TRUE_NODE,
      ketu: sweph.SE_MEAN_APOG // Use mean apogee for Ketu
    };

    for (const [planetName, planetId] of Object.entries(planetIds)) {
      try {
        let position;

        if (planetName === 'ketu') {
          // Calculate Ketu as opposite of Rahu
          const rahuPos = sweph.calc(jd, sweph.SE_TRUE_NODE);
          position = {
            longitude: (Array.isArray(rahuPos.longitude) ? rahuPos.longitude[0] : rahuPos.longitude) + 180 % 360,
            latitude: 0,
            speed: { longitude: 0 }
          };
        } else {
          position = sweph.calc(jd, planetId, sweph.SEFLG_SIDEREAL | sweph.SEFLG_SPEED);
        }

        if (position && position.longitude !== undefined) {
          const longitude = Array.isArray(position.longitude) ? position.longitude[0] : position.longitude;
          const latitude = Array.isArray(position.latitude) ? position.latitude[0] : position.latitude;
          const speed = Array.isArray(position.longitude) ? position.longitude[3] || 0 : 0;

          // Calculate Vedic house position
          const [houses, ascendant] = this._calculateHousesPrecise(jd, latitude, longitude);

          natalPlanets[planetName] = {
            name: planetName.charAt(0).toUpperCase() + planetName.slice(1),
            longitude,
            latitude,
            speed,
            sign: Math.floor(longitude / 30) + 1,
            degree: longitude % 30,
            house: this._getVedicHouseFromCusps(longitude, houses),
            retrograde: speed < 0,
            dignity: this._assessDignity(planetName, longitude, speed),
            dispositor: this._getDispositor(planetName, longitude)
          };
        }
      } catch (error) {
        logger.warn(`Error calculating ${planetName} position:`, error.message);
      }
    }

    // Calculate houses with all details
    const [houses, ascendant] = this._calculateHousesPrecise(jd, latitude, longitude);

    return {
      planets: natalPlanets,
      houses,
      ascendant
    };
  }

  /**
   * Calculate comprehensive aspects including Vedic special aspects
   * @private
   */
  _calculateComprehensiveAspects(planets) {
    const aspects = {
      conjunctions: [],
      oppositions: [],
      trines: [],
      squares: [],
      sextiles: [],
      vedicAspects: [], // Special Vedic aspects (7th, 9th, 4th, 10th, 5th, 11th)
      mutualAspects: []
    };

    const planetList = Object.keys(planets).filter(p => p !== 'ascendant');

    // Calculate Western aspects
    for (let i = 0; i < planetList.length; i++) {
      for (let j = i + 1; j < planetList.length; j++) {
        const planet1 = planetList[i];
        const planet2 = planetList[j];

        const long1 = planets[planet1].longitude;
        const long2 = planets[planet2].longitude;

        const angularDiff = Math.abs(long1 - long2);
        const minDiff = Math.min(angularDiff, 360 - angularDiff);

        // Western aspects with 8° orb
        if (minDiff <= 8) {
          if (minDiff <= 8) { aspects.conjunctions.push({ planet1, planet2, separation: minDiff }); }

          if (Math.abs(minDiff - 60) <= 6) { aspects.sextiles.push({ planet1, planet2, separation: minDiff }); }
          if (Math.abs(minDiff - 90) <= 6) { aspects.squares.push({ planet1, planet2, separation: minDiff }); }
          if (Math.abs(minDiff - 120) <= 6) { aspects.trines.push({ planet1, planet2, separation: minDiff }); }
          if (Math.abs(minDiff - 180) <= 8) { aspects.oppositions.push({ planet1, planet2, separation: minDiff }); }
        }
      }
    }

    // Calculate Vedic aspects (Rashis Drishti)
    planetList.forEach(planet => {
      const { sign } = planets[planet];
      const vedicAspectsFrom = this._getVedicAspectsForPlanet(planet);

      vedicAspectsFrom.forEach(aspectSign => {
        const aspectedSign = ((sign - 1 + aspectSign) % 12) + 1;
        const planetsInSign = Object.entries(planets)
          .filter(([name, data]) => name !== 'ascendant' && data.sign === aspectedSign)
          .map(([name]) => name);

        planetsInSign.forEach(aspectedPlanet => {
          if (aspectedPlanet !== planet) {
            aspects.vedicAspects.push({
              planet,
              aspectedPlanet,
              rashis: aspectSign,
              aspectStrength: this._getVedicAspectStrength(planet, aspectedPlanet, aspectSign)
            });
          }
        });
      });
    });

    return aspects;
  }

  /**
   * Analyze major planetary yogas and combinations
   * @private
   */
  _analyzeMajorYogas(planets, houses) {
    const yogas = {
      rajayoga: [],
      dhanyoga: [],
      panchamahapurusha: [],
      kendradhipati: [],
      specialCombinations: []
    };

    // Raja Yoga: Lords of Kendra and Trikona houses combine
    const kendraLords = this._identifyKendraLords(planets, houses);
    const trikonaLords = this._identifyTrikonaLords(planets, houses);

    kendraLords.forEach(kendra => {
      trikonaLords.forEach(trikona => {
        if (planets[kendra] && planets[trikona]) {
          const kendraHouse = planets[kendra].house;
          const trikonaHouse = planets[trikona].house;

          if ([1, 4, 7, 10].includes(kendraHouse) && [5, 9].includes(trikonaHouse)) {
            yogas.rajayoga.push({
              type: 'Kendra-Trikona Raja Yoga',
              planets: [kendra, trikona],
              houses: [kendraHouse, trikonaHouse],
              strength: 'Powerful',
              effects: 'Success, authority, and recognition'
            });
          }
        }
      });
    });

    // Dhan Yoga: 2nd and 11th house lord combinations
    const dhanLord2nd = this._getHouseLord(2, planets);
    const dhanLords = ['venus', 'jupiter']; // Traditional wealth planets

    dhanLords.forEach(planet => {
      if (planets[planet] && (planets[planet].house === 2 || planets[planet].house === 11)) {
        yogas.dhanyoga.push({
          type: 'Dhan Yoga',
          planet,
          house: planets[planet].house,
          effects: 'Financial success and wealth'
        });
      }
    });

    // Pancha Mahapurusha Yoga: Planets in their own sign in Kendra
    const panchaPlanets = ['mars', 'mercury', 'jupiter', 'venus', 'saturn'];

    panchaPlanets.forEach(planet => {
      if (planets[planet]) {
        const isInOwnSign = this._isInOwnSign(planet, planets[planet].sign);
        const isInKendra = [1, 4, 7, 10].includes(planets[planet].house);

        if (isInOwnSign && isInKendra) {
          yogas.panchamahapurusha.push({
            name: `${planet.charAt(0).toUpperCase() + planet.slice(1)} Mahapurusha Yoga`,
            planet,
            sign: planets[planet].sign,
            house: planets[planet].house,
            qualities: this._getMahapurushaQualities(planet)
          });
        }
      }
    });

    // Gaja Kesari Yoga: Jupiter and Moon combine beneficially
    if (planets.moon && planets.jupiter) {
      const moonHouse = planets.moon.house;
      const jupiterHouse = planets.jupiter.house;

      const moonJupiterSeparation = Math.abs(planets.moon.longitude - planets.jupiter.longitude);
      const isBenefit = moonJupiterSeparation <= 120 || (360 - moonJupiterSeparation) <= 120;

      if (isBenefit) {
        yogas.specialCombinations.push({
          name: 'Gaja Kesari Yoga',
          planets: ['moon', 'jupiter'],
          houses: [moonHouse, jupiterHouse],
          effects: 'Wisdom, prosperity, and elephant-like strength'
        });
      }
    }

    return yogas;
  }

  /**
   * Calculate Arudha Padas (significations/external projections)
   * @private
   */
  _calculateArudhaPadas(planets, houses) {
    const arudhas = {};

    // Calculate Arudha Pada for each house
    for (let house = 1; house <= 12; house++) {
      const houseLord = this._getHouseLord(house, planets);

      if (planets[houseLord]) {
        let arudhaSign;

        // Arudha Pada calculation: Count from house lord to its occupied sign, then count same amount from that house
        const lordSign = planets[houseLord].sign;
        const occupiedSign = (house - 1) * 30; // Rough approximation for demonstration

        // From the sign occupied by lord, count the same number of signs from the house we're finding arudha for
        const signsFromLordToHouse = Math.abs(lordSign - house);
        const shorterPath = signsFromLordToHouse <= 6 ? signsFromLordToHouse : 12 - signsFromLordToHouse;

        arudhaSign = (house - 1 + shorterPath) % 12 + 1;

        arudhas[house] = {
          pada: `Arudha Pada of ${house}th house`,
          sign: arudhaSign,
          significator: this._getArudhaSignificator(house),
          planetsInArudha: this._planetsInSign(arudhaSign, planets)
        };
      }
    }

    return arudhas;
  }

  /**
   * Analyze planetary relationships (friends, enemies, neutrals)
   * @private
   */
  _analyzePlanetaryRelationships(planets) {
    const relationships = {};

    const planetList = Object.keys(planets).filter(p => p !== 'ascendant');

    planetList.forEach(planet1 => {
      relationships[planet1] = {};

      planetList.forEach(planet2 => {
        if (planet1 !== planet2) {
          relationships[planet1][planet2] = this._getRelationship(planet1, planet2);
        }
      });
    });

    return relationships;
  }

  /**
   * Calculate Upagrahas (subsidiary planets)
   * @private
   */
  _calculateUpagrahas(natalChart) {
    const upagrahas = {};

    // Calculate common upagrahas based on planetary positions
    upagrahas.dhuma = this._calculateDhuma(natalChart);
    upagrahas.vyatipata = this._calculateVyatipata(natalChart);
    upagrahas.parivesha = this._calculateParivesha(natalChart);
    upagrahas.indrachapa = this._calculateIndrachapa(natalChart);
    upagrahas.upaketu = this._calculateUpaketu(natalChart);

    return upagrahas;
  }

  /**
   * Analyze house strengths and planetary influences
   * @private
   */
  _analyzeHouseStrengths(natalChart) {
    const houseStrengths = {};

    for (let house = 1; house <= 12; house++) {
      const planetsInHouse = Object.entries(natalChart.planets)
        .filter(([_, data]) => data.house === house)
        .map(([name]) => name);

      const houseLord = this._getHouseLord(house, natalChart.planets);

      houseStrengths[house] = {
        number: house,
        lord: houseLord,
        planets: planetsInHouse,
        strength: this._calculateHouseStrength(planetsInHouse, houseLord, natalChart),
        significations: this._getHouseSignifications(house),
        vacant: planetsInHouse.length === 0
      };
    }

    return houseStrengths;
  }

  /**
   * Calculate timing analysis
   * @private
   */
  async _calculateTimingAnalysis(natalChart, birthDateTime) {
    const timing = {
      currentPeriod: {},
      majorPeriods: [],
      significantTransits: []
    };

    // Calculate rough current maha dasha based on birth date
    const yearsSinceBirth = Math.floor((Date.now() - birthDateTime.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    // Simplified dasha calculation
    timing.currentPeriod = {
      dasha: 'Approximate major period',
      lord: this._guessCurrentDashaLord(yearsSinceBirth),
      remaining: 'Variable'
    };

    // Identify upcoming significant periods
    timing.majorPeriods = [
      { period: 'Youth phase', age: '17-24', focus: 'Education and self-discovery' },
      { period: 'Establishment', age: '24-35', focus: 'Career and relationships' },
      { period: 'Maturity', age: '35-50', focus: 'Achievements and family' },
      { period: 'Contemplation', age: '50+', focus: 'Wisdom and legacy' }
    ];

    return timing;
  }

  /**
   * Generate detailed interpretations
   * @private
   */
  _generateDetailedInterpretations(yogas, aspects, houseAnalysis, timingAnalysis) {
    const interpretations = {
      personality: [],
      career: [],
      relationships: [],
      financial: [],
      spiritual: [],
      advice: []
    };

    // Personality based on ascendant and moon sign
    if (houseAnalysis['1']) {
      interpretations.personality.push(`${houseAnalysis['1'].lord} influence shapes your self-expression`);

      if (yogas.panchamahapurusha.length > 0) {
        yogas.panchamahapurusha.forEach(yoga => {
          interpretations.personality.push(`Mahapurusha influence: ${yoga.qualities.join(', ')}`);
        });
      }
    }

    // Career interpretations
    if (yogas.rajayoga.length > 0) {
      interpretations.career.push(`${yogas.rajayoga.length} Raja Yogas indicate leadership and success`);
    }

    // Relationship interpretations
    if (yogas.dhanyoga.length > 0) {
      interpretations.financial.push(`${yogas.dhanyoga.length} Dhan Yogas suggest financial prosperity`);
    }

    if (yogas.specialCombinations.some(y => y.name === 'Gaja Kesari Yoga')) {
      interpretations.spiritual.push('Gaja Kesari Yoga indicates wisdom and spiritual protection');
    }

    // Generate advice based on aspects
    if (aspects.squares.length > 0) {
      interpretations.advice.push(`Work with ${aspects.squares.length} square aspects for growth and transformation`);
    }

    return interpretations;
  }

  /**
   * Generate lifelong predictions
   * @private
   */
  _generateLifelongPredictions(interpretations) {
    const predictions = {
      earlyLife: [],
      middleLife: [],
      laterLife: [],
      general: []
    };

    // Early life (birth-30)
    predictions.earlyLife = [
      'Foundation-building period',
      'Learning through challenges and opportunities',
      'Building essential skills and relationships'
    ];

    // Middle life (30-60)
    predictions.middleLife = [
      'Peak productive period',
      'Career achievements and family responsibilities',
      'Wisdom accumulation and leadership roles'
    ];

    // Later life (60+)
    predictions.laterLife = [
      'Legacy and wisdom-sharing period',
      'Spiritual development and contemplation',
      'Guidance to younger family members'
    ];

    return predictions;
  }

  /**
   * Generate chart summary
   * @private
   */
  _generateChartSummary(interpretations) {
    let summary = '📊 *Detailed Vedic Chart Analysis*\n\n';

    summary += '*Key Themes:*\n';
    if (interpretations.personality.length > 0) {
      summary += `• Personality: ${interpretations.personality[0]}\n`;
    }

    if (interpretations.career.length > 0) {
      summary += `• Career: ${interpretations.career[0]}\n`;
    }

    if (interpretations.financial.length > 0) {
      summary += `• Finance: ${interpretations.financial[0]}\n`;
    }

    summary += '\n*Chart represents a comprehensive analysis including planetary positions, aspects, yogas, and timing factors that influence all life areas.*';

    return summary;
  }

  // Helper methods
  _dateToJulianDay(year, month, day, hour) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    return jd + (hour - 12) / 24;
  }

  _calculateHousesPrecise(jd, latitude, longitude) {
    try {
      const houses = sweph.houses(jd, latitude, longitude, 'E');
      return [houses.houseCusps, houses.ascendant];
    } catch (error) {
      // Return default house cusps
      const defaultCusps = Array.from({ length: 13 }, (_, i) => (i * 30) % 360);
      return [defaultCusps, 0];
    }
  }

  _getVedicHouseFromCusps(longitude, cusps) {
    for (let i = 1; i <= 12; i++) {
      const start = cusps[i - 1];
      const end = cusps[i % 12];

      if (start <= end) {
        if (longitude >= start && longitude < end) {
          return i;
        }
      } else {
        // Crosses 0°
        if (longitude >= start || longitude < end) {
          return i;
        }
      }
    }

    return 1; // Default
  }

  _getVedicAspectsForPlanet(planet) {
    // Standard Vedic aspects (Rashis Drishti) - simplified
    return [7, 9, 4, 10, 5, 11]; // Major aspects
  }

  _getVedicAspectStrength(aspecting, aspected, rashis) {
    // Aspect strength based on planet relationships
    const strongAspects = {
      sun_jupiter: true,
      moon_sun: true,
      mars_mercury: true
    };

    if (strongAspects[`${aspecting}_${aspected}`]) {
      return 'Strong';
    }

    return 'Moderate';
  }

  _identifyKendraLords(planets, houses) {
    return ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']; // Simplified
  }

  _identifyTrikonaLords(planets, houses) {
    return ['sun', 'jupiter', 'mars']; // Simplified
  }

  _getHouseLord(house, planets) {
    // Convert house number to corresponding planet/sign lord
    const houseToSign = (house - 1) % 12 + 1;
    return this._getSignLord(houseToSign);
  }

  _getSignLord(sign) {
    const lords = [
      'mars', 'venus', 'mercury', 'moon', 'sun', 'mercury',
      'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'
    ];
    return lords[sign - 1];
  }

  _isInOwnSign(planet, sign) {
    // Simplified own sign check
    return false; // Would need full dignity calculation
  }

  _getMahapurushaQualities(planet) {
    const qualities = {
      mars: ['Warrior spirit', 'Physical courage', 'Leadership'],
      mercury: ['Intellect', 'Communication skills', 'Wisdom'],
      jupiter: ['Teaching', 'Spirituality', 'Authority'],
      venus: ['Artistic talent', 'Beauty', 'Harmony'],
      saturn: ['Discipline', 'Hard work', 'Responsibility']
    };
    return qualities[planet.toLowerCase()] || ['Special qualities'];
  }

  _getArudhaSignificator(house) {
    const significators = {
      1: 'Self and personality',
      2: 'Family and wealth',
      3: 'Siblings and communication',
      4: 'Home and mother',
      5: 'Children and creativity',
      6: 'Enemies and service',
      7: 'Spouse and partnerships',
      8: 'Transformation and longevity',
      9: 'Fortune and father',
      10: 'Career and reputation',
      11: 'Friends and gains',
      12: 'Spirituality and expenses'
    };
    return significators[house] || 'General';
  }

  _planetsInSign(sign, planets) {
    return Object.entries(planets)
      .filter(([_, data]) => data.sign === sign)
      .map(([name]) => name);
  }

  _getRelationship(planet1, planet2) {
    const friendships = {
      sun: { friends: ['moon', 'mars', 'jupiter'], enemies: ['venus', 'saturn'] },
      moon: { friends: ['sun', 'mercury'], enemies: ['saturn'] },
      mars: { friends: ['sun', 'moon', 'jupiter'], enemies: ['mercury'] }
    };

    // Simplified - in practice would have complete tables
    if (friendships[planet1]?.friends.includes(planet2)) { return 'friend'; }
    if (friendships[planet1]?.enemies.includes(planet2)) { return 'enemy'; }
    return 'neutral';
  }

  _calculateDhuma(natalChart) {
    // Dhuma calculation: Ascendant + 133°20'
    const { ascendant } = natalChart;
    const dhumaLong = (ascendant + 133.333) % 360;
    return { longitude: dhumaLong, sign: Math.floor(dhumaLong / 30) + 1 };
  }

  _calculateVyatipata(natalChart) {
    // Vyatipata calculation: Ascendant - 133°20'
    const { ascendant } = natalChart;
    const vyatipataLong = (ascendant - 133.333 + 360) % 360;
    return { longitude: vyatipataLong, sign: Math.floor(vyatipataLong / 30) + 1 };
  }

  _calculateParivesha(natalChart) {
    // Parivesha calculation: 180° from Dhuma
    const dhuma = this._calculateDhuma(natalChart);
    const pariveshaLong = (dhuma.longitude + 180) % 360;
    return { longitude: pariveshaLong, sign: Math.floor(pariveshaLong / 30) + 1 };
  }

  _calculateIndrachapa(natalChart) {
    // Indrachapa calculation: 180° from Vyatipata
    const vyatipata = this._calculateVyatipata(natalChart);
    const indrachapaLong = (vyatipata.longitude + 180) % 360;
    return { longitude: indrachapaLong, sign: Math.floor(indrachapaLong / 30) + 1 };
  }

  _calculateUpaketu(natalChart) {
    // Upaketu calculation: 144°45' from Ascendant
    const { ascendant } = natalChart;
    const upaketuLong = (ascendant + 144.75) % 360;
    return { longitude: upaketuLong, sign: Math.floor(upaketuLong / 30) + 1 };
  }

  _calculateHouseStrength(planetsInHouse, lord, natalChart) {
    let strength = 0;

    if (planetsInHouse.includes(lord)) { strength += 50; } // Lord present
    strength += planetsInHouse.length * 15; // Planets present

    return Math.min(strength, 100);
  }

  _getHouseSignifications(house) {
    const significations = {
      1: ['Self', 'Body', 'Personality', 'First impressions'],
      2: ['Wealth', 'Family', 'Speech', 'Food'],
      3: ['Siblings', 'Courage', 'Communication', 'Short journeys'],
      4: ['Home', 'Mother', 'Emotions', 'Property'],
      5: ['Children', 'Education', 'Creativity', 'Intelligence'],
      6: ['Enemies', 'Health', 'Service', 'Daily routine'],
      7: ['Marriage', 'Partnership', 'Business', 'Spouse'],
      8: ['Transformation', 'Secrets', 'Longevity', 'Legacy'],
      9: ['Father', 'Fortune', 'Religion', 'Higher learning'],
      10: ['Career', 'Reputation', 'Authority', 'Public life'],
      11: ['Friends', 'Gains', 'Hopes', 'Elder siblings'],
      12: ['Spirituality', 'Losses', 'Foreign lands', 'Liberation']
    };
    return significations[house] || [];
  }

  _guessCurrentDashaLord(yearsSinceBirth) {
    // Simplified dasha calculation
    const vimshottariSequence = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'];
    const periods = [7, 20, 6, 10, 7, 18, 16, 19, 17];

    let remainingYears = yearsSinceBirth;
    for (let i = 0; i < periods.length; i++) {
      remainingYears -= periods[i];
      if (remainingYears <= 0) {
        return vimshottariSequence[i];
      }
    }

    return 'saturn'; // Default
  }

  _calculateChartStrengths(natalChart) {
    // Calculate overall chart strengths
    const strengths = {
      planetary: 0,
      house: 0,
      yogas: 0
    };

    // Planetary strength based on dignity
    Object.values(natalChart.planets).forEach(planet => {
      if (planet.dignity === 'exalted') { strengths.planetary += 15; } else if (planet.dignity === 'own_sign') { strengths.planetary += 10; } else if (planet.dignity === 'friendly') { strengths.planetary += 5; }
    });

    return strengths;
  }

  _identifyChartWeaknesses(natalChart) {
    const weaknesses = [];

    Object.entries(natalChart.planets).forEach(([name, planet]) => {
      if (planet.dignity === 'debilitated') {
        weaknesses.push(`${name} debilitated in ${planet.sign}`);
      }
    });

    return weaknesses;
  }

  _assessDignity(planetName, longitude, speed) {
    // Simplified dignity assessment - would need full vedic dignity calculation
    return 'neutral';
  }

  _getDispositor(planetName, longitude) {
    // Get dispositor (lord of sign where planet is placed)
    const sign = Math.floor(longitude / 30) + 1;
    return this._getSignLord(sign);
  }

  async _getCoordinatesForPlace(place) {
    try {
      const coords = await this.geocodingService.getCoordinates(place);
      return [coords.latitude, coords.longitude];
    } catch (error) {
      logger.warn('Error getting coordinates, using default:', error.message);
      return [28.6139, 77.2090]; // Delhi
    }
  }

  async _getTimezoneForPlace(latitude, longitude, timestamp) {
    return 5.5; // IST
  }
}

module.exports = DetailedChartCalculator;
