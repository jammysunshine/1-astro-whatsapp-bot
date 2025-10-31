const logger = require('../../../../utils/logger');
const sweph = require('sweph');

/**
 * Jaimini Astrology Calculator
 * Implements the Karaka-based predictive system from Maharishi Jaimini's Upadesa Sutras
 * Alternative to Parasara system with different predictive techniques
 */
class JaiminiAstrologyCalculator {
  constructor(astrologer, geocodingService) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;

    // Jaimini karaka significations
    this.karakas = {
      atmaKaraka: 'Soul purpose and spiritual evolution',
      amatyakaraka: 'Mind, intellect, and career path',
      bhratruKaraka: 'Siblings and partnerships',
      matruKaraka: 'Mother, home, and emotional security',
      putraKaraka: 'Children, creativity, and legacy',
      gnatiKaraka: 'Extended family and social connections',
      daraKaraka: 'Spouse and one-on-one relationships'
    };

    // Chara karaka calculation order
    this.karakaOrder = ['atmaKaraka', 'amatyakaraka', 'bhratruKaraka', 'matruKaraka', 'putraKaraka', 'gnatiKaraka', 'daraKaraka'];
  }

  /**
   * Set services for the calculator
   */
  setServices(services) {
    this.services = services;
  }

  /**
   * Calculate Chara Karakas and their significations
   * @param {Object} birthData - Birth data object
   * @returns {Object} Jaimini analysis with karakas and predictions
   */
  async calculateJaiminiAstrology(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return { error: 'Complete birth details required for Jaimini astrology analysis' };
      }

      // Parse birth details
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Calculate natal chart
      const natalChart = await this._calculateNatalChart(year, month, day, hour, minute, latitude, longitude, timezone);

      // Calculate Atma Karaka (highest degree planet)
      const atmaKaraka = this._findAtmaKaraka(natalChart.planets);

      // Calculate other Chara Karakas
      const charaKarakas = this._calculateCharaKarakas(natalChart.planets, atmaKaraka);

      // Calculate Jaimini houses based on Atma Karaka
      const jaiminiHouses = this._calculateJaiminiHouses(atmaKaraka, natalChart);

      // Analyze Arudha Padas (different from Parasara)
      const arudhaPadas = this._calculateJaiminiArudhaPadas(charaKarakas, natalChart);

      // Sphuta calculations (special mathematical combinations)
      const sphuta = this._calculateSphuta(charaKarakas, natalChart);

      // Padanatha (lord of 12 houses from Atma Karaka)
      const padanatha = this._calculatePadanatha(atmaKaraka, natalChart);

      // Analyze karaka relationships and aspects
      const karakaRelationships = this._analyzeKarakaRelationships(charaKarakas, natalChart);

      // Generate predictions based on karakas
      const jaiminiPredictions = this._generateJaiminiPredictions(charaKarakas, jaiminiHouses, karakaRelationships);

      return {
        name,
        atmaKaraka,
        charaKarakas,
        jaiminiHouses,
        arudhaPadas,
        sphuta,
        padanatha,
        karakaRelationships,
        jaiminiPredictions,
        summary: this._generateJaiminiSummary(atmaKaraka, charaKarakas, jaiminiPredictions)
      };
    } catch (error) {
      logger.error('❌ Error in Jaimini astrology analysis:', error);
      throw new Error(`Jaimini astrology analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze soul's purpose through Atma Karaka
   */
  async analyzeSoulPurpose(birthData) {
    try {
      const fullAnalysis = await this.calculateJaiminiAstrology(birthData);

      if (!fullAnalysis || fullAnalysis.error) return fullAnalysis;

      const atmaKaraka = fullAnalysis.atmaKaraka;
      const soulPurpose = this._analyzeSoulPurpose(atmaKaraka);
      const fulfillmentMethods = this._getFulfillmentMethods(atmaKaraka);

      return {
        soulPurpose,
        fulfillmentMethods,
        atmaKaraka: atmaKaraka.significator,
        lifeMission: soulPurpose.primaryPurpose,
        challenges: soulPurpose.challenges,
        recommendedPath: fulfillmentMethods.path
      };
    } catch (error) {
      logger.error('Error analyzing soul purpose:', error.message);
      return { error: 'Unable to analyze soul purpose' };
    }
  }

  /**
   * Calculate natal chart for Jaimini analysis
   * @private
   */
  async _calculateNatalChart(year, month, day, hour, minute, latitude, longitude, timezone) {
    const natalPlanets = {};

    const jd = this._dateToJulianDay(year, month, day, hour + minute / 60 - timezone);

    const planets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
    const planetIds = {
      sun: sweph.SE_SUN, moon: sweph.SE_MOON, mars: sweph.SE_MARS,
      mercury: sweph.SE_MERCURY, jupiter: sweph.SE_JUPITER,
      venus: sweph.SE_VENUS, saturn: sweph.SE_SATURN
    };

    for (const planet of planets) {
      const position = sweph.calc(jd, planetIds[planet], sweph.SEFLG_SIDEREAL);
      if (position && Array.isArray(position.longitude)) {
        natalPlanets[planet] = {
          longitude: position.longitude[0],
          sign: Math.floor(position.longitude[0] / 30) + 1,
          degree: position.longitude[0] % 30,
          minutes: (position.longitude[0] % 1) * 60
        };
      }
    }

    // Calculate ascendant
    const houses = sweph.houses(jd, latitude, longitude, 'E');
    natalPlanets.ascendant = {
      longitude: houses.ascendant,
      sign: Math.floor(houses.ascendant / 30) + 1
    };

    return { planets: natalPlanets, jd };
  }

  /**
   * Find Atma Karaka (planet with highest degree of longitude)
   * @private
   */
  _findAtmaKaraka(planets) {
    let highestDegree = -1;
    let atmaKaraka = null;
    let totalDegrees = 0;

    Object.entries(planets).forEach(([planet, data]) => {
      if (planet !== 'ascendant') {
        // Convert sign and degrees to total degrees for comparison
        const totalDeg = (data.sign - 1) * 30 + data.degree;

        // Add minutes for precision
        const preciseDeg = totalDeg + (data.minutes || 0) / 60;

        if (preciseDeg > highestDegree) {
          highestDegree = preciseDeg;
          atmaKaraka = planet;
        }
      }
    });

    const significator = atmaKaraka;
    const sign = planets[atmaKaraka].sign;
    const position = planets[atmaKaraka];

    return {
      planet: atmaKaraka,
      significator,
      longitude: position.longitude,
      sign: this._getSignName(sign),
      degree: Math.floor(position.degree),
      minutes: Math.floor((position.degree % 1) * 60),
      meaning: this._getAtmaKarakaMeaning(atmaKaraka),
      lifePurpose: this._getAtmaKarakaPurpose(atmaKaraka),
      challenges: this._getAtmaKarakaChallenges(atmaKaraka)
    };
  }

  /**
   * Calculate Chara Karakas in order of decreasing longitude
   * @private
   */
  _calculateCharaKarakas(planets, atmaKaraka) {
    const karakas = {};

    // Create array of planets with their longitudes
    const planetDegrees = [];
    Object.entries(planets).forEach(([planet, data]) => {
      if (planet !== 'ascendant') {
        const totalDeg = (data.sign - 1) * 30 + data.degree + (data.minutes || 0) / 60;
        planetDegrees.push({ planet, degrees: totalDeg, data });
      }
    });

    // Sort by descending degrees
    planetDegrees.sort((a, b) => b.degrees - a.degrees);

    // Assign karakas (skip atma karaka as it's already assigned)
    let karakaIndex = 1; // Start from Amatyakaraka (index 1, since Atma is 0)

    for (const planetData of planetDegrees) {
      if (planetData.planet === atmaKaraka.planet) continue; // Skip atma karaka

      const karakaName = this.karakaOrder[karakaIndex];
      if (karakaName && karakaIndex < this.karakaOrder.length) {
        karakas[karakaName] = {
          planet: planetData.planet,
          significator: karakaName,
          longitude: planetData.data.longitude,
          sign: this._getSignName(planetData.data.sign),
          degree: Math.floor(planetData.data.degree),
          meaning: this.karakas[karakaName],
          indications: this._getKarakaIndications(karakaName, planetData.planet)
        };
        karakaIndex++;
      }
    }

    return karakas;
  }

  /**
   * Calculate Jaimini houses based on Atma Karaka
   * @private
   */
  _calculateJaiminiHouses(atmaKaraka, natalChart) {
    const jaiminiHouses = {};

    // In Jaimini, houses are counted from Atma Karaka instead of ascendant
    const baseLongitude = atmaKaraka.longitude;

    for (let houseNum = 1; houseNum <= 12; houseNum++) {
      // Each house = 30 degrees (equal house system from Atma Karaka)
      const houseStartLong = (baseLongitude + (houseNum - 1) * 30) % 360;
      const houseSign = Math.floor(houseStartLong / 30) + 1;

      // Find planets in this house
      const planetsInHouse = this._getPlanetsInJaiminiHouse(houseNum, baseLongitude, natalChart.planets);

      jaiminiHouses[houseNum] = {
        sign: this._getSignName(houseSign),
        lord: this._getSignLord(houseSign),
        planets: planetsInHouse,
        significations: this._getJaiminiHouseSignifications(houseNum),
        strength: this._assessJaiminiHouseStrength(houseNum, planetsInHouse, natalChart)
      };
    }

    return jaiminiHouses;
  }

  /**
   * Calculate Jaimini Arudha Padas (different from Parasara)
   * @private
   */
  _calculateJaiminiArudhaPadas(charaKarakas, natalChart) {
    const arudhas = {};

    // Jaimini Arudha calculation for key houses (1st, 7th, 10th mainly)
    const keyHouses = [1, 7, 10];

    keyHouses.forEach(houseNum => {
      // Find karaka for this house
      let karaka = null;
      if (houseNum === 1 && charaKarakas.atmaKaraka) {
        karaka = charaKarakas.atmaKaraka;
      } else if (houseNum === 7 && charaKarakas.daraKaraka) {
        karaka = charaKarakas.daraKaraka;
      } else if (houseNum === 10 && charaKarakas.amatyakaraka) {
        karaka = charaKarakas.amatyakaraka;
      }

      if (karaka) {
        arudhas[`arudha${houseNum}`] = this._calculateJaiminiArudhaForHouse(houseNum, karaka, natalChart);
      }
    });

    return arudhas;
  }

  /**
   * Calculate Sphuta (special mathematical combinations)
   * @private
   */
  _calculateSphuta(charaKarakas, natalChart) {
    const sphuta = {
      kendraSphuta: {},
      trikonaSphuta: {},
      specialCombinations: []
    };

    // Kendra Sphuta: Special relationship between karakas and kendra houses
    Object.entries(charaKarakas).forEach(([karakaName, karakaData]) => {
      const relations = this._calculateKarakaSphutaRelations(karakaName, karakaData, natalChart);
      sphuta.kendraSphuta[karakaName] = relations;
    });

    // Trikona Sphuta: Special relationship with trikode houses
    sphuta.trikonaSphuta = this._calculateTrikonaSphuta(charaKarakas, natalChart);

    // Special combinations from Jaimini sutras
    sphuta.specialCombinations = this._findJaiminiSpecialCombinations(charaKarakas, natalChart);

    return sphuta;
  }

  /**
   * Calculate Padanatha (lord of 12 houses from Atma Karaka)
   * @private
   */
  _calculatePadanatha(atmaKaraka, natalChart) {
    const padanatha = {};

    // 12 houses from Atma Karaka position
    const baseSign = atmaKaraka.sign;

    for (let i = 1; i <= 12; i++) {
      const houseSign = ((baseSign + i - 2) % 12) + 1; // Calculate sign positions
      const lord = this._getSignLord(houseSign);

      padanatha[i] = {
        house: i,
        sign: this._getSignName(houseSign),
        lord: lord,
        significations: this._getPadanathaSignifications(i),
        planetInSign: this._getPlanetInSign(houseSign, natalChart.planets)
      };
    }

    // Special attention to adverse Padanathas
    padanatha.issues = this._identifyPadanathaIssues(padanatha);

    return padanatha;
  }

  /**
   * Analyze relationships and aspects between karakas
   * @private
   */
  _analyzeKarakaRelationships(charaKarakas, natalChart) {
    const relationships = {
      aspects: {},
      conjunctions: {},
      oppositions: {},
      trines: {},
      harmonious: [],
      challenging: []
    };

    // Analyze aspects between karakas
    Object.entries(charaKarakas).forEach(([karaka1Key, karaka1]) => {
      Object.entries(charaKarakas).forEach(([karaka2Key, karaka2]) => {
        if (karaka1Key !== karaka2Key) {
          const aspect = this._calculateKarakaAspect(karaka1, karaka2, natalChart);

          if (aspect.exists) {
            relationships.aspects[`${karaka1Key}-${karaka2Key}`] = {
              aspect: aspect.type,
              significance: this._interpretKarakaAspect(karaka1Key, karaka2Key, aspect.type),
              strength: aspect.strength
            };
          }
        }
      });
    });

    // Identify harmonious vs challenging relationships
    this._categorizeKarakaRelationships(relationships, charaKarakas);

    return relationships;
  }

  /**
   * Generate predictions based on Jaimini principles
   * @private
   */
  _generateJaiminiPredictions(charaKarakas, jaiminiHouses, karakaRelationships) {
    const predictions = {
      lifePurpose: '',
      significantAreas: [],
      careerPath: '',
      relationships: '',
      challenges: [],
      opportunities: [],
      timing: {},
      spiritualPath: ''
    };

    // Determine life purpose from Atma Karaka combination
    predictions.lifePurpose = this._determineLifePurpose(charaKarakas);

    // Significant life areas based on karaka placements
    predictions.significantAreas = this._identifySignificantAreas(charaKarakas, jaiminiHouses);

    // Career based on Amatyakaraka
    predictions.careerPath = this._predictCareerFromAmatyakaraka(charaKarakas.amatyakaraka);

    // Relationships based on Dara Karaka
    predictions.relationships = this._predictRelationshipsFromDaraKaraka(charaKarakas.daraKaraka);

    // Challenges and opportunities from karaka relationships
    predictions.challenges = this._identifyKarakaChallenges(karakaRelationships);
    predictions.opportunities = this._identifyKarakaOpportunities(karakaRelationships);

    // Important timing in life
    predictions.timing = this._predictImportantTiming(charaKarakas, jaiminiHouses);

    // Spiritual path
    predictions.spiritualPath = this._determineSpiritualPath(charaKarakas);

    return predictions;
  }

  /**
   * Generate comprehensive Jaimini summary
   * @private
   */
  _generateJaiminiSummary(atmaKaraka, charaKarakas, predictions) {
    let summary = '🔬 *Jaimini Astrology Analysis*\n\n';

    summary += `*Atma Karaka:* ${atmaKaraka.significator.charAt(0).toUpperCase() + atmaKaraka.significator.slice(1)}\n`;
    summary += `*In:* ${atmaKaraka.sign}\n\n`;

    summary += `*Life Purpose:* ${predictions.lifePurpose.split('.')[0]}\n\n`;

    if (charaKarakas.amatyakaraka) {
      summary += `*Career Path:* ${predictions.careerPath.split('.')[0]}\n`;
    }

    if (charaKarakas.daraKaraka) {
      summary += `*Relationships:* ${predictions.relationships.split('.')[0]}\n`;
    }

    summary += '\n*Key Areas of Life:*\n';
    predictions.significantAreas.slice(0, 3).forEach(area => {
      summary += `• ${area}\n`;
    });

    if (predictions.challenges.length > 0) {
      summary += '\n*Growth Areas:*\n';
      predictions.challenges.slice(0, 2).forEach(challenge => {
        summary += `• ${challenge}\n`;
      });
    }

    summary += '\n*Jaimini astrology reveals the soul\'s native potentials and karmic evolution through planetary karakas.*';

    return summary;
  }

  // Helper methods
  _getSignName(signNumber) {
    const signs = ['', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs[signNumber] || 'Unknown';
  }

  _getSignLord(sign) {
    const lords = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
    return lords[sign - 1];
  }

  _getAtmaKarakaMeaning(planet) {
    const meanings = {
      sun: 'Leadership, authority, father, vitality, royal connections',
      moon: 'Emotions, mother, mental health, intuition, public image',
      mars: 'Energy, courage, siblings, property, technical skills',
      mercury: 'Intelligence, communication, business, education, youth',
      jupiter: 'Wisdom, spirituality, children, wealth, teaching',
      venus: 'Love, marriage, arts, luxury, pleasures, spouse',
      saturn: 'Discipline, karma, longevity, service, detachment'
    };
    return meanings[planet] || 'Spiritual growth and service';
  }

  _getAtmaKarakaPurpose(planet) {
    const purposes = {
      sun: 'Lead with authority and inspire others; serve society',
      moon: 'Nurture and care for others; develop emotional wisdom',
      mars: 'Fight for justice; develop physical and mental strength',
      mercury: 'Share knowledge and wisdom; serve through communication',
      jupiter: 'Teach and guide others; spread spiritual wisdom',
      venus: 'Create beauty and harmony; bring joy to others',
      saturn: 'Serve humanity through discipline and hard work'
    };
    return purposes[planet] || 'Spiritual growth and awakening';
  }

  _getAtmaKarakaChallenges(planet) {
    const challenges = {
      sun: 'Pride, authoritarianism, conflicts with authority figures',
      moon: 'Emotional instability, dependency, mental unrest',
      mars: 'Aggression, impatience, accidents, conflicts',
      mercury: 'Nervousness, deception, lack of focus, anxiety',
      jupiter: 'Overconfidence, dogmatism, excessive indulgence',
      venus: 'Attachment to pleasure, laziness, relationship issues',
      saturn: 'Fear, depression, isolation, excessive discipline'
    };
    return challenges[planet] || 'Spiritual detachment and materialism';
  }

  _getKarakaIndications(karakaName, planet) {
    // Combine karaka meaning with planetary nature
    const karakaBase = this.karakas[karakaName];
    const planetNature = this._getPlanetNature(planet);

    return `${karakaBase} (${planetNature})`;
  }

  _getPlanetNature(planet) {
    const natures = {
      sun: 'fiery, authoritative, creative',
      moon: 'watery, nurturing, changeable',
      mars: 'fiery, assertive, competitive',
      mercury: 'airy, intellectual, adaptable',
      jupiter: 'fiery, expansive, philosophical',
      venus: 'watery, artistic, harmonious',
      saturn: 'earthy, disciplined, karmic'
    };
    return natures[planet] || 'balanced, spiritual';
  }

  _calculateDateToJulianDay(year, month, day, hour) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    return jd + (hour - 12) / 24;
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

  // Placeholder methods for complex calculations
  _getPlanetsInJaiminiHouse(houseNum, baseLongitude, planets) {
    const houseStart = (baseLongitude + (houseNum - 1) * 30) % 360;
    const houseEnd = (houseStart + 30) % 360;

    const planetsIn = [];
    Object.entries(planets).forEach(([planet, data]) => {
      if (planet !== 'ascendant') {
        let inHouse = false;
        if (houseEnd > houseStart) {
          inHouse = data.longitude >= houseStart && data.longitude < houseEnd;
        } else {
          inHouse = data.longitude >= houseStart || data.longitude < houseEnd;
        }
        if (inHouse) planetsIn.push(planet);
      }
    });

    return planetsIn;
  }

  _getJaiminiHouseSignifications(houseNum) {
    // Jaimini house significations differ from Parasara
    const significations = {
      1: 'Self, personality, physical appearance, first impressions',
      2: 'Family, wealth, speech, food, material resources',
      3: 'Siblings, courage, skills, short journeys, communication',
      4: 'Home, mother, emotions, property, education foundation',
      5: 'Children, intelligence, creativity, spiritual practices',
      6: 'Enemies, sickness, obstacles, daily work, service',
      7: 'Marriage, partnerships, spouse, business relationships',
      8: 'Longevity, transformations, secrets, chronic diseases, occult',
      9: 'Fortune, father, higher learning, spirituality, pilgrimage',
      10: 'Career, reputation, authority, public life, achievements',
      11: 'Friends, gains, hopes, wishes, elder siblings, income',
      12: 'Spirituality, foreign lands, expenses, losses, liberation'
    };
    return significations[houseNum] || 'General life matters';
  }

  _assessJaiminiHouseStrength(houseNum, planetsInHouse, natalChart) {
    let strength = 0;

    // Benefic planets increase strength
    const benefics = planetsInHouse.filter(p => ['jupiter', 'venus', 'mercury', 'moon'].includes(p));
    strength += benefics.length * 20;

    // Malefic planets decrease strength but show activation
    const malefics = planetsInHouse.filter(p => ['saturn', 'mars', 'sun', 'rahu', 'ketu'].includes(p));
    if (malefics.length > 0) strength += 10; // Activated but challenging

    return Math.min(100, Math.max(0, strength));
  }

  _calculateJaiminiArudhaForHouse(houseNum, karaka, natalChart) {
    // Simplified arudha calculation for Jaimini system
    const karakaLong = karaka.longitude;
    const result = {
      longitude: karakaLong,
      sign: natalChart.planets[kapaka.planet]?.sign || karaka.sign,
      significations: this._getJaiminiArudhaSignifications(houseNum),
      rulingCharacteristics: this._getArudhaRulingCharacteristics(houseNum, karaka.planet)
    };

    return result;
  }

  _calculateKarakaSphutaRelations(karakaName, karakaData, natalChart) {
    // Placehloders for complex sphuta calculations
    return {
      kendraRelation: 'moderate',
      aspectStrength: 'normal',
      specialCombinations: []
    };
  }

  _calculateTrikonaSphuta(charaKarakas, natalChart) {
    return {
      dharmaSphuta: 'karma and righteousness',
      arthaSphuta: 'wealth and prosperity',
      kamaSphuta: 'desire and fulfillment',
      mokshaSphuta: 'liberation and enlightenment'
    };
  }

  _findJaiminiSpecialCombinations(charaKarakas, natalChart) {
    return [
      'Harmonious karaka alignments indicate positive life flow',
      'Challenging karaka aspects suggest areas of growth',
      'Balanced karaka relationships promote overall well-being'
    ];
  }

  _getPadanathaSignifications(houseNum) {
    const padanathaSignifications = {
      1: 'Self-image and personal evolution',
      2: 'Wealth accumulation and speech',
      3: 'Siblings and short-term ventures',
      4: 'Mother and emotional foundation',
      5: 'Children and creative pursuits',
      6: 'Obstacles and healing path',
      7: 'Spouse and partnerships',
      8: 'Transformations and longevity',
      9: 'Father and spiritual wisdom',
      10: 'Career and authority',
      11: 'Gains and friendships',
      12: 'Spirituality and liberation'
    };
    return padanathaSignifications[houseNum] || 'General life area';
  }

  _getPlanetInSign(sign, planets) {
    return Object.entries(planets).find(([planet, data]) =>
      planet !== 'ascendant' && data.sign === sign
    )?.[0] || null;
  }

  _identifyPadanathaIssues(padanatha) {
    const issues = [];

    // Check for malefic padanathas in adverse positions
    const adverseHouses = [6, 8, 12];
    adverseHouses.forEach(house => {
      if (padanatha[house] && ['saturn', 'mars', 'rahu', 'ketu'].includes(padanatha[house].lord)) {
        issues.push(`Malefic Padanatha in house ${house} - challenges in ${padanatha[house].significations}`);
      }
    });

    return issues;
  }

  _calculateKarakaAspect(karaka1, karaka2, natalChart) {
    // Simplified aspect calculation between two karakas
    const angle = Math.abs(karaka1.longitude - karaka2.longitude);
    const minAngle = Math.min(angle, 360 - angle);

    let hasAspect = false;
    let aspectType = 'none';

    if (minAngle <= 10) {
      hasAspect = true;
      aspectType = 'conjunction';
    } else if (Math.abs(minAngle - 60) <= 6) {
      hasAspect = true;
      aspectType = 'sextile';
    } else if (Math.abs(minAngle - 90) <= 8) {
      hasAspect = true;
      aspectType = 'square';
    } else if (Math.abs(minAngle - 120) <= 10) {
      hasAspect = true;
      aspectType = 'trine';
    } else if (Math.abs(minAngle - 180) <= 10) {
      hasAspect = true;
      aspectType = 'opposition';
    }

    return {
      exists: hasAspect,
      type: aspectType,
      strength: hasAspect ? Math.max(1, 11 - Math.abs(minAngle - [0, 60, 90, 120, 180][['conjunction', 'sextile', 'square', 'trine', 'opposition'].indexOf(aspectType)] || 0)) : 0
    };
  }

  _interpretKarakaAspect(karaka1, karaka2, aspect) {
    // Simplified interpretation
    if (aspect === 'conjunction') return 'Strong integration of both areas';
    if (aspect === 'opposition') return 'Balance needed between these areas';
    if (aspect === 'trine') return 'Harmonious flow between these areas';
    if (aspect === 'square') return 'Dynamic tension requiring resolution';
    return 'Subtle connection between these areas';
  }

  _categorizeKarakaRelationships(relationships, charaKarakas) {
    Object.values(relationships.aspects).forEach(aspect => {
      if (['trine', 'sextile', 'conjunction'].includes(aspect.aspect)) {
        relationships.harmonious.push(`${aspect.aspect} aspect supports life balance`);
      } else if (['square', 'opposition'].includes(aspect.aspect)) {
        relationships.challenging.push(`${aspect.aspect} aspect indicates growth areas`);
      }
    });
  }

  _getJaiminiArudhaSignifications(houseNum) {
    const significations = {
      1: 'External personality and self-image',
      7: 'Spouse\'s appearance and social status',
      10: 'Career reputation and public achievement'
    };
    return significations[houseNum] || 'Projected image and external perception';
  }

  _getArudhaRulingCharacteristics(houseNum, planet) {
    return `Affected by ${planet} nature - ${this._getAtmaKarakaMeaning(planet).split(',')[0]}`;
  }

  _analyzeSoulPurpose(atmaKaraka) {
    const soulPurpose = {
      primaryPurpose: atmaKaraka.lifePurpose,
      soulLesson: atmaKaraka.challenges,
      evolutionaryGoal: `Master the qualities of ${atmaKaraka.significator}`,
      lifetimeMission: 'Grow beyond ego limitations and serve divine will'
    };

    return soulPurpose;
  }

  _getFulfillmentMethods(atmaKaraka) {
    const methods = {
      sun: { path: 'Leadership and teaching', practices: ['Meditate on your higher self', 'Practice selfless service'] },
      moon: { path: 'Emotional healing and care', practices: ['Develop intuition', 'Care for others'] },
      mars: { path: 'Disciplined action and courage', practices: ['Physical exercise', 'Stand for justice'] },
      mercury: { path: 'Knowledge sharing', practices: ['Study and teaching', 'Help others learn'] },
      jupiter: { path: 'Spiritual guidance', practices: ['Philosophical study', 'Mentor others'] },
      venus: { path: 'Love and beauty', practices: ['Create harmony', 'Share your gifts'] },
      saturn: { path: 'Service and discipline', practices: ['Self-discipline', 'Help the needy'] }
    };

    return methods[atmaKaraka.planet] || {
      path: 'Spiritual growth',
      practices: ['Self-reflection', 'Service to others']
    };
  }

  _determineLifePurpose(charaKarakas) {
    if (charaKarakas.atmaKaraka) {
      return charaKarakas.atmaKaraka.lifePurpose;
    }
    return 'Spiritual growth through wisdom accumulation and service to others.';
  }

  _identifySignificantAreas(charaKarakas, jaiminiHouses) {
    const areas = [];

    if (charaKarakas.amatyakaraka) {
      areas.push(`Career in ${charaKarakas.amatyakaraka.sign}`);
    }

    if (charaKarakas.putraKaraka) {
      areas.push(`Creativity and ${charaKarakas.putraKaraka.sign} areas`);
    }

    if (jaiminiHouses[5] && jaiminiHouses[5].planets.length > 0) {
      areas.push('Children and creative expression');
    }

    return areas.length > 0 ? areas : ['Personal growth', 'Spiritual development', 'Service to others'];
  }

  _predictCareerFromAmatyakaraka(amatyakaraka) {
    if (!amatyakaraka) return 'Career path unfolds naturally through life experiences.';

    const planet = amatyakaraka.planet;
    const sign = amatyakaraka.sign;

    const careerPredictions = {
      sun: 'Leadership, government, teaching, medicine',
      moon: 'Healthcare, psychology, public service, education',
      mars: 'Engineering, military, surgery, law enforcement',
      mercury: 'Communication, writing, teaching, business, law',
      jupiter: 'Teaching, religion, law, counseling, publishing',
      venus: 'Arts, entertainment, beauty, hospitality, counseling',
      saturn: 'Agriculture, labor, construction, administration, social work'
    };

    return `Career direction through ${planet} influence: ${careerPredictions[planet] || 'intellectual pursuits.'} Develop skills associated with ${sign}.`;
  }

  _predictRelationshipsFromDaraKaraka(daraKaraka) {
    if (!daraKaraka) return 'Relationships develop through life experiences and personal growth.';

    const planet = daraKaraka.planet;
    const sign = daraKaraka.sign;

    const relationshipPredictions = {
      sun: 'Partner with leadership qualities, authoritative, creative person',
      moon: 'Nurturing, emotional partner, creative, sensitive connection',
      mars: 'Active partner, assertive, courageous, adventurous relationship',
      mercury: 'Intellectual partner, communicative, youthful, adaptable connection',
      jupiter: 'Wise partner, philosophical, expansive, spiritual bond',
      venus: 'Harmonious partner, artistic, loving, aesthetically pleasing connection',
      saturn: 'Serious partner, disciplined, committed, mature relationship'
    };

    return `Spouse characteristics: ${relationshipPredictions[planet] || 'balanced and understanding person.'} Marriage qualities influenced by ${sign}.`;
  }

  _identifyKarakaChallenges(relationships) {
    return relationships.challenging.slice(0, 3).map(challenge => challenge.replace(' aspect', ' areas'));
  }

  _identifyKarakaOpportunities(relationships) {
    return relationships.harmonious.slice(0, 3).map(harm => harm.replace(' aspect', ' areas'));
  }

  _predictImportantTiming(charaKarakas, jaiminiHouses) {
    return {
      earlyLife: 'Foundation building through learning experiences',
      middleAge: 'Career and relationship maturity',
      laterLife: 'Wisdom sharing and spiritual focus',
      keyPhases: ['Education completion', 'Career establishment', 'Family building', 'Spiritual awakening']
    };
  }

  _determineSpiritualPath(charaKarakas) {
    if (charaKarakas.atmaKaraka) {
      return `Spiritual path through ${charaKarakas.atmaKaraka.significator} qualities: ${charaKarakas.atmaKaraka.lifePurpose}`;
    }
    return 'Spiritual path through wisdom, service, and devotion to higher truth.';
  }

  _dateToJulianDay = this._calculateDateToJulianDay; // Alias for consistency
}

module.exports = JaiminiAstrologyCalculator;