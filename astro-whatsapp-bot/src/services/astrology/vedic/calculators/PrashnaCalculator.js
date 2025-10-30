const logger = require('../../../../utils/logger');
const sweph = require('sweph');

/**
 * Prashna Calculator
 * Calculates horary astrology (Prashna) - answering questions through astrology
 */
class PrashnaCalculator {
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
   * Calculate Prashna (horary astrology)
   * @param {Object} questionData - Question details including query type, questioner birth data, question time
   * @returns {Object} Prashna analysis and answer
   */
  async calculatePrashna(questionData) {
    try {
      const { question, questionTime, questionDate, questionPlace, querentBirthData } = questionData;

      // Validate question data
      if (!questionTime || !questionDate || !questionPlace) {
        throw new Error('Question time, date, and place are essential for accurate Prashna');
      }

      // Parse question time
      const [hour, minute] = questionTime.split(':').map(Number);
      const [day, month, year] = questionDate.split('/').map(Number);

      // Get question chart location
      const [lat, lng] = await this._getCoordinates(questionPlace);
      const timezone = await this._getTimezone(lat, lng, new Date(year, month - 1, day).getTime());

      // Calculate JD for question moment
      const jd = this._dateToJD(year, month, day, hour + minute / 60);

      // Calculate question chart (rasi chart at time of question)
      const questionChart = await this._castQuestionChart(jd, lat, lng, timezone);

      // Analyze question using various prashna techniques
      const significators = this._identifySignificators(questionChart);
      const houseAnalysis = this._analyzeQuestionHouses(questionChart);
      const planetaryStrength = this._evaluatePlanetaryStrength(questionChart);
      const aspectAnalysis = this._analyzeQuestionAspects(questionChart);

      // Determine likelihood of positive outcome
      const outcomeProbability = this._calculateOutcomeProbability(questionChart, significators, houseAnalysis);

      return {
        question,
        questionTime: `${questionDate} ${questionTime}`,
        questionPlace,
        coordinates: [lat, lng],
        questionChart,
        significators,
        houseAnalysis,
        planetaryStrength,
        aspectAnalysis,
        interpretation: this._interpretPrashna(questionChart, significators, houseAnalysis),
        outcomeProbability,
        advice: this._generatePrashnaAdvice(questionChart, outcomeProbability),
        recommendedTiming: this._suggestFavorableTiming(questionChart)
      };

    } catch (error) {
      logger.error('❌ Error in Prashna calculation:', error);
      throw new Error(`Prashna calculation failed: ${error.message}`);
    }
  }

  /**
   * Cast the question chart (rasi chart at time of question)
   * @private
   */
  async _castQuestionChart(jd, latitude, longitude, timezone) {
    // Calculate ascendant and houses
    const ascendant = this._calculateAscendant(jd, latitude, longitude);
    const houses = this._calculateHouses(ascendant);

    // Calculate planetary positions in houses
    const planets = {};
    const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    for (const planet of planetNames) {
      const position = sweph.calc(jd, this._getPlanetId(planet));
      if (position.longitude !== undefined) {
        const house = this._getHouseFromLongitude(position.longitude, houses);
        const signIndex = Math.floor(position.longitude / 30);

        planets[planet.toLowerCase()] = {
          name: planet,
          longitude: position.longitude,
          house,
          sign: this._getSignName(signIndex),
          signIndex,
          retrograde: position.speedLongitude < 0
        };
      }
    }

    return {
      ascendant,
      houses,
      planets,
      jd,
      lagnaSign: this._getSignName(Math.floor(ascendant / 30)),
      lordOfAscendant: this._getLordOfSign(Math.floor(ascendant / 30))
    };
  }

  /**
   * Identify significators for the question
   * @private
   */
  _identifySignificators(questionChart) {
    const significators = {
      querySignificator: null,
      houseSignificator: null,
      planetarySignificator: null
    };

    // In Prashna, Moon is always a significator
    significators.moonSignificator = questionChart.planets.moon;

    // Lord of the ascendant is always important
    significators.ascendantLord = this._findAscendantLord(questionChart);

    // For general questions, planets in kendra houses are significant
    significators.kendraPlanets = this._findPlanetsInKendras(questionChart);

    return significators;
  }

  /**
   * Analyze question houses
   * @private
   */
  _analyzeQuestionHouses(questionChart) {
    const analysis = {};

    // Analyze key houses for questions
    const keyHouses = {
      1: 'Self and questioner state',
      2: 'Questioner\'s resources and family',
      3: 'Short journeys, siblings, courage',
      4: 'Home, mother, comfort',
      5: 'Children, education, speculative matters',
      6: 'Health, service, obstacles',
      7: 'Spouse, business partnerships',
      8: 'Transformation, secrets, occult',
      9: 'Fortune, father, long journeys',
      10: 'Career, reputation, authority',
      11: 'Gains, elder siblings, hopes',
      12: 'Spirituality, expenses, overseas'
    };

    // Find planets in each house
    for (const [houseNum, significance] of Object.entries(keyHouses)) {
      const planetsInHouse = this._findPlanetsInHouse(questionChart, parseInt(houseNum));
      const lordOfHouse = this._getLordOfHouse(questionChart, parseInt(houseNum));

      analysis[houseNum] = {
        significance,
        planets: planetsInHouse,
        lord: lordOfHouse,
        strength: this._evaluateHouseStrength(planetsInHouse, lordOfHouse, questionChart.ascendant),
        indication: this._interpretHouseForQuestion(planetsInHouse, lordOfHouse)
      };
    }

    return analysis;
  }

  /**
   * Evaluate planetary strength in question chart
   * @private
   */
  _evaluatePlanetaryStrength(questionChart) {
    const strengths = {};

    Object.values(questionChart.planets).forEach(planet => {
      const strength = {
        dignity: this._assessPlanetaryDignity(planet),
        housePlacement: this._assessHousePlacement(planet.house),
        aspectStrength: this._assessAspects(planet, questionChart.planets),
        overall: 'neutral' // Will be calculated
      };

      strength.overall = this._calculateOverallPlanetaryStrength(strength);
      strengths[planet.name.toLowerCase()] = strength;
    });

    return strengths;
  }

  /**
   * Analyze question aspects
   * @private
   */
  _analyzeQuestionAspects(questionChart) {
    const aspects = [];

    // Analyze aspects between significator planets
    const significators = ['ascendantLord', 'moon'];
    const positions = Object.values(questionChart.planets);

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const aspect = this._checkAspect(positions[i], positions[j]);
        if (aspect) {
          aspects.push({
            planets: [positions[i].name, positions[j].name],
            aspect: aspect.type,
            orb: aspect.orb,
            significance: this._interpretAspectForQuestion(aspect.type, positions[i], positions[j])
          });
        }
      }
    }

    return aspects;
  }

  /**
   * Calculate outcome probability
   * @private
   */
  _calculateOutcomeProbability(questionChart, significators, houseAnalysis) {
    let favorablePoints = 0;
    let totalPoints = 0;

    // Check Moon condition (should not be weak)
    const moonStrength = significators.moonSignificator ? this._assessPlanetaryDignity(significators.moonSignificator) : 'neutral';
    if (moonStrength === 'strong' || moonStrength === 'very_strong') favorablePoints += 15;
    totalPoints += 15;

    // Check ascendant lord strength
    if (significators.ascendantLord) {
      const ascLordStrength = this._assessPlanetaryDignity(significators.ascendantLord);
      if (ascLordStrength === 'strong' || ascLordStrength === 'very_strong') favorablePoints += 20;
      totalPoints += 20;
    }

    // Check 2nd house (questioner's resources)
    if (houseAnalysis['2'] && houseAnalysis['2'].strength > 6) favorablePoints += 10;
    totalPoints += 10;

    // Check 11th house (gains and hopes)
    if (houseAnalysis['11'] && houseAnalysis['11'].strength > 6) favorablePoints += 15;
    totalPoints += 15;

    // Check malefics in kendras (not good for questions)
    const kendras = ['1', '4', '7', '10'];
    let maleficInKendra = false;
    kendras.forEach(house => {
      if (houseAnalysis[house] && houseAnalysis[house].planets.some(p => this._isMalefic(p))) {
        maleficInKendra = true;
      }
    });

    if (!maleficInKendra) favorablePoints += 10;
    totalPoints += 10;

    const probability = Math.round((favorablePoints / totalPoints) * 100);

    return {
      probability,
      interpretation: this._interpretProbability(probability),
      favorableFactors: `Moon: ${moonStrength}, Ascendant lord: strong, Resources: ${houseAnalysis['2']?.strength}, No malefics in kendras: ${!maleficInKendra}`,
      rating: probability > 75 ? 'Very favorable' : probability > 60 ? 'Favorable' : probability > 40 ? 'Neutral' : 'Challenging'
    };
  }

  /**
   * Interpret Prashna results
   * @private
   */
  _interpretPrashna(questionChart, significators, houseAnalysis) {
    const interpretation = {
      overallTendency: 'neutral',
      keyIndicators: [],
      timing: 'within 3 months',
      advice: []
    };

    // Check Moon's position for overall tendency
    const moonSign = questionChart.planets.moon?.sign || questionChart.lagnaSign;
    interpretation.keyIndicators.push(`Question asked with Moon in ${moonSign} - ${this._interpretMoonPosition(moonSign)}`);

    // Check ascendant lord position
    const ascLord = significators.ascendantLord;
    if (ascLord) {
      interpretation.keyIndicators.push(`Ascendant lord in ${ascLord.sign} (house ${ascLord.house}) - ${this._interpretAscendantLord(ascLord)}`);
    }

    // Check 2nd house (questioner's capability)
    if (houseAnalysis['2']) {
      interpretation.keyIndicators.push(`2nd house: ${houseAnalysis['2'].indication}`);
    }

    interpretation.overallTendency = questionChart.planets.moon?.retrograde ? 'has complications' : 'straightforward';

    return interpretation;
  }

  /**
   * Generate Prashna advice
   * @private
   */
  _generatePrashnaAdvice(questionChart, outcomeProbability) {
    const advice = ['Prashna indicates the astrological timing of your question.'];

    if (outcomeProbability.probability > 70) {
      advice.push('The stars are favorably aligned for your query.');
      advice.push('Proceed with confidence, but maintain patience.');
    } else if (outcomeProbability.probability > 40) {
      advice.push('The situation has mixed indications.');
      advice.push('Take care in your approach and consider alternatives.');
    } else {
      advice.push('The timing is not currently favorable.');
      advice.push('Consider delaying this matter or seeking different approaches.');
    }

    if (questionChart.planets.moon?.retrograde) {
      advice.push('Exercise caution as the Moon is retrograde - complications may arise.');
    }

    advice.push('Always remember that free will and effort are important alongside astrological guidance.');

    return advice;
  }

  /**
   * Suggest favorable timing
   * @private
   */
  _suggestFavorableTiming(questionChart) {
    // Suggest timing based on Moon's position
    const moonSign = questionChart.planets.moon?.signIndex || 0;
    const favorablePhase = (moonSign + 2) % 12; // Two signs ahead

    return {
      immediate: moonSign >= favorablePhase ? 'favorable' : 'wait',
      moonCycle: this._getMoonCycleAdvice(moonSign),
      tithi: 'favorable within next fortnight',
      day: this._suggestFavorableDay(questionChart)
    };
  }

  // Helper methods
  _calculateAscendant(jd, lat, lng) {
    // Simplified ascendant calculation
    // In practice, this requires complex house calculations
    return (30 * 1); // Example Aries ascendant
  }

  _calculateHouses(ascendant) {
    // Simplified house calculation
    const houses = [];
    for (let i = 0; i < 12; i++) {
      houses.push(ascendant + (i * 30));
    }
    return houses;
  }

  _getHouseFromLongitude(longitude, houses) {
    // Simplified house determination
    for (let i = 0; i < houses.length; i++) {
      if (longitude >= houses[i] && longitude < houses[(i + 1) % 12]) {
        return i + 1;
      }
    }
    return 1;
  }

  _getSignName(signIndex) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs[signIndex];
  }

  _getLordOfSign(signIndex) {
    const lords = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
    return lords[signIndex];
  }

  _findAscendantLord(questionChart) {
    const ascSignIndex = Math.floor(questionChart.ascendant / 30);
    const ascLordName = this._getLordOfSign(ascSignIndex);
    return questionChart.planets[ascLordName.toLowerCase()];
  }

  _findPlanetsInKendras(questionChart) {
    const kendraHouses = [1, 4, 7, 10];
    return Object.values(questionChart.planets).filter(planet =>
      kendraHouses.includes(planet.house)
    );
  }

  _findPlanetsInHouse(questionChart, houseNum) {
    return Object.values(questionChart.planets).filter(planet =>
      planet.house === houseNum
    );
  }

  _getLordOfHouse(questionChart, houseNum) {
    const houseSignIndex = (Math.floor(questionChart.ascendant / 30) + houseNum - 1) % 12;
    const lordName = this._getLordOfSign(houseSignIndex);
    return questionChart.planets[lordName.toLowerCase()];
  }

  _evaluateHouseStrength(planets, lord, ascendant) {
    let strength = 0;

    // Benefics in house increase strength
    const benefics = planets.filter(p => this._isBenefic(p));
    strength += benefics.length * 2;

    // Lord placement affects strength
    if (lord) {
      const lordSignIndex = Math.floor(lord.longitude / 30);
      if (this._isOwnSign(lord.name, lordSignIndex)) strength += 3;
      if (this._isExaltedSign(lord.name, lordSignIndex)) strength += 4;
    }

    return Math.min(10, strength);
  }

  _interpretHouseForQuestion(planets, lord) {
    if (planets.length === 0 && lord) return 'Empty, look to lord for answers';
    if (planets.some(p => this._isBenefic(p))) return 'Favorable indications';
    if (planets.some(p => this._isMalefic(p))) return 'Challenging factors present';
    return 'Mixed indications, timing is key';
  }

  _assessPlanetaryDignity(planet) {
    const signIndex = planet.signIndex;
    const planetName = planet.name;

    if (this._isExaltedSign(planetName, signIndex)) return 'very_strong';
    if (this._isOwnSign(planetName, signIndex)) return 'strong';
    if (this._isDebilitatedSign(planetName, signIndex)) return 'weak';
    return 'neutral';
  }

  _assessHousePlacement(house) {
    const kendraHouses = [1, 4, 7, 10];
    const trikonaHouses = [1, 5, 9];
    const dusthanaHouses = [6, 8, 12];

    if (kendraHouses.includes(house) || trikonaHouses.includes(house)) return 'beneficial';
    if (dusthanaHouses.includes(house)) return 'challenging';
    return 'neutral';
  }

  _assessAspects(planet, allPlanets) {
    let aspectStrength = 0;

    Object.values(allPlanets).forEach(otherPlanet => {
      if (otherPlanet.name !== planet.name) {
        const angle = Math.abs(planet.longitude - otherPlanet.longitude);
        if (angle < 10 || angle > 350) aspectStrength += 2; // Conjuction
        if (Math.abs(angle - 60) < 6) aspectStrength += 1; // Sextile
        if (Math.abs(angle - 90) < 6) aspectStrength -= 1; // Square
        if (Math.abs(angle - 120) < 6) aspectStrength += 2; // Trine
        if (Math.abs(angle - 180) < 6) aspectStrength += 1; // Opposition
      }
    });

    return aspectStrength;
  }

  _calculateOverallPlanetaryStrength(strengths) {
    const dignityWeight = { very_strong: 4, strong: 3, neutral: 2, weak: 1 };
    const houseWeight = { beneficial: 3, neutral: 2, challenging: 1 };
    const dignityScore = dignityWeight[strengths.dignity] || 2;
    const houseScore = houseWeight[strengths.housePlacement] || 2;
    const aspectScore = Math.max(1, Math.min(3, 2 + strengths.aspectStrength / 2));
    const total = (dignityScore + houseScore + aspectScore) / 3;

    return total > 3.5 ? 'strong' : total > 2.5 ? 'moderate' : 'weak';
  }

  _checkAspect(p1, p2) {
    const angle = Math.abs(p1.longitude - p2.longitude);
    const angles = [
      { angle: 0, orb: 8, name: 'conjunction' },
      { angle: 180, orb: 8, name: 'opposition' },
      { angle: 120, orb: 7, name: 'trine' },
      { angle: 90, orb: 6, name: 'square' },
      { angle: 60, orb: 6, name: 'sextile' }
    ];

    for (const aspect of angles) {
      if (Math.abs(angle - aspect.angle) <= aspect.orb) {
        return { type: aspect.name, orb: Math.abs(angle - aspect.angle) };
      }
    }

    return null;
  }

  _interpretAspectForQuestion(aspect, p1, p2) {
    const interpretations = {
      conjunction: `${p1.name} and ${p2.name} cooperate closely in this question`,
      opposition: `${p1.name} and ${p2.name} show tension and polarity`,
      trine: `${p1.name} and ${p2.name} harmonize beautifully`,
      square: `${p1.name} and ${p2.name} create dynamic challenges`,
      sextile: `${p1.name} and ${p2.name} support practical opportunities`
    };

    return interpretations[aspect] || `${aspect} aspect between ${p1.name} and ${p2.name}`;
  }

  _interpretProbability(probability) {
    if (probability > 80) return 'Very likely positive outcome';
    if (probability > 65) return 'Likely favorable with effort';
    if (probability > 45) return 'Mixed, depends on many factors';
    if (probability > 30) return 'Challenging but possible';
    return 'Unfavorable at this time';
  }

  _interpretMoonPosition(sign) {
    const interpretations = {
      Aries: 'Impulsive question, quick action needed',
      Taurus: 'Practical concern, financial aspects important',
      Gemini: 'Communication or learning matter',
      Cancer: 'Emotional issue, home or family related',
      Leo: 'Creative matter, leadership or children',
      Virgo: 'Health or service-related question',
      Libra: 'Relationship or partnership concern',
      Scorpio: 'Deep transformation or hidden matters',
      Sagittarius: 'Travel, education, or philosophical question',
      Capricorn: 'Career or authority matter',
      Aquarius: 'Community or unconventional concern',
      Pisces: 'Spiritual or artistic matter'
    };

    return interpretations[sign] || 'General inquiry';
  }

  _interpretAscendantLord(ascLord) {
    if (ascLord.house <= 6) return 'Active matter for the questioner';
    if (ascLord.house <= 10) return 'Growing situation, patient approach needed';
    return 'Spiritual or karmic matter being questioned';
  }

  _isBenefic(planet) {
    return ['Jupiter', 'Venus', 'Moon', 'Mercury'].includes(planet.name);
  }

  _isMalefic(planet) {
    return ['Saturn', 'Mars', 'Sun'].includes(planet.name);
  }

  _isOwnSign(planet, signIndex) {
    const ownSigns = {
      Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5],
      Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10]
    };

    return ownSigns[planet]?.includes(signIndex) || false;
  }

  _isExaltedSign(planet, signIndex) {
    const exaltedSigns = {
      Sun: [0], Moon: [1], Mars: [9], Mercury: [5],
      Jupiter: [3], Venus: [11], Saturn: [6]
    };

    return exaltedSigns[planet]?.includes(signIndex) || false;
  }

  _isDebilitatedSign(planet, signIndex) {
    const debilitatedSigns = {
      Sun: [6], Moon: [7], Mars: [3], Mercury: [11],
      Jupiter: [9], Venus: [5], Saturn: [0]
    };

    return debilitatedSigns[planet]?.includes(signIndex) || false;
  }

  _getMoonCycleAdvice(moonSign) {
    if (moonSign <= 3) return 'Waxing Moon - initiate new matters';
    if (moonSign <= 9) return 'Full Moon period - culmination approaching';
    return 'Waning Moon - complete or release matters';
  }

  _suggestFavorableDay(questionChart) {
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const moonSign = questionChart.planets.moon?.signIndex || 0;

    // Simple day suggestion based on Moon's position
    const dayIndex = moonSign % 7;
    return `${weekDays[dayIndex]} would be most favorable`;
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

module.exports = PrashnaCalculator;