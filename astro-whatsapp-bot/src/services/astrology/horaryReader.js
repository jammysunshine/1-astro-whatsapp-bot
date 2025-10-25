const logger = require('../../utils/logger');

/**
 * Horary Astrology Reader
 * Provides answers to specific questions by analyzing the astrological chart cast at the moment of inquiry
 */

class HoraryReader {
  constructor() {
    // Planetary rulers and their meanings in horary
    this.planetaryRulers = {
      sun: {
        name: 'Sun',
        symbol: '☉',
        dignity: 'Leadership, authority, father, husband, government',
        meaning: 'Success, honor, vitality, but also pride and arrogance',
        questions: 'Career, leadership, father, authority figures'
      },
      moon: {
        name: 'Moon',
        symbol: '☽',
        dignity: 'Mother, emotions, home, public, women',
        meaning: 'Change, fluctuation, intuition, but also moodiness',
        questions: 'Home, family, emotions, mother, public matters'
      },
      mercury: {
        name: 'Mercury',
        symbol: '☿',
        dignity: 'Communication, siblings, short journeys, intellect',
        meaning: 'Adaptability, communication, but also deceit and nervousness',
        questions: 'Communication, education, siblings, short trips, business'
      },
      venus: {
        name: 'Venus',
        symbol: '♀',
        dignity: 'Love, beauty, pleasure, harmony, women',
        meaning: 'Harmony, love, beauty, but also laziness and indulgence',
        questions: 'Love, marriage, beauty, arts, pleasure, female friends'
      },
      mars: {
        name: 'Mars',
        symbol: '♂',
        dignity: 'Action, conflict, courage, men, energy',
        meaning: 'Action, courage, passion, but also anger and violence',
        questions: 'Conflicts, action, courage, enemies, male friends, surgery'
      },
      jupiter: {
        name: 'Jupiter',
        symbol: '♃',
        dignity: 'Expansion, wisdom, religion, prosperity, teachers',
        meaning: 'Growth, optimism, wisdom, but also excess and exaggeration',
        questions: 'Wealth, religion, philosophy, long journeys, teachers, law'
      },
      saturn: {
        name: 'Saturn',
        symbol: '♄',
        dignity: 'Structure, discipline, elders, karma, limitations',
        meaning: 'Discipline, structure, wisdom, but also depression and restriction',
        questions: 'Career, elders, property, agriculture, chronic illness, karma'
      }
    };

    // House meanings in horary astrology
    this.houseMeanings = {
      1: 'Querent (questioner), appearance, first impressions, personality',
      2: 'Wealth, possessions, resources, self-worth, family inheritance',
      3: 'Siblings, communication, short journeys, education, neighbors',
      4: 'Home, family, parents, property, end of matters, hidden things',
      5: 'Children, creativity, romance, speculation, entertainment, pleasure',
      6: 'Health, service, employees, daily routine, small animals, enemies',
      7: 'Partnership, marriage, business partners, open enemies, spouse',
      8: 'Death, transformation, secrets, other people\'s money, occult',
      9: 'Long journeys, higher education, religion, philosophy, law, dreams',
      10: 'Career, reputation, authority, father, public image, ambition',
      11: 'Friends, hopes, wishes, groups, step-children, gains',
      12: 'Spirituality, hidden enemies, isolation, hospitals, foreign lands, sacrifice'
    };

    // Planetary hours (24 hours in a day, each ruled by a planet)
    this.planetaryHours = [
      'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', // Day hours
      'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', // Night hours
      'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter'  // Remaining hours
    ];

    // Question categories and their appropriate houses
    this.questionCategories = {
      love: { houses: [5, 7], rulers: ['venus', 'moon'] },
      career: { houses: [2, 6, 10], rulers: ['saturn', 'jupiter', 'sun'] },
      health: { houses: [6, 8, 12], rulers: ['mars', 'saturn'] },
      money: { houses: [2, 8, 11], rulers: ['venus', 'jupiter'] },
      travel: { houses: [3, 9], rulers: ['mercury', 'jupiter'] },
      family: { houses: [3, 4, 5], rulers: ['moon', 'venus'] },
      legal: { houses: [7, 9], rulers: ['jupiter', 'venus'] },
      spiritual: { houses: [9, 12], rulers: ['jupiter', 'neptune'] }
    };
  }

  /**
   * Generate horary reading for a specific question
   * @param {string} question - The question being asked
   * @param {string} questionTime - Time when question was asked (DD/MM/YYYY HH:MM format)
   * @param {Object} location - Location data for chart casting
   * @returns {Object} Horary reading
   */
  generateHoraryReading(question, questionTime, location = {}) {
    try {
      // Validate the question
      const validation = this.validateQuestion(question);
      if (!validation.isValid) {
        return {
          question,
          valid: false,
          reason: validation.reason,
          advice: 'Please ask a clear, specific question about a matter of genuine concern.'
        };
      }

      // Cast the horary chart
      const chart = this.castHoraryChart(questionTime, location);

      // Determine the judge (ruling planet)
      const judge = this.determineJudge(chart, question);

      // Analyze the question
      const questionAnalysis = this.analyzeQuestion(question, chart);

      // Generate the answer
      const answer = this.generateAnswer(chart, judge, questionAnalysis);

      return {
        question,
        valid: true,
        chart,
        judge,
        questionAnalysis,
        answer,
        timing: this.determineTiming(chart),
        horaryDescription: this.generateHoraryDescription(chart, judge, answer)
      };
    } catch (error) {
      logger.error('Error generating horary reading:', error);
      return {
        question,
        valid: false,
        error: 'Unable to generate horary reading at this time',
        fallback: 'Horary astrology reveals the answer hidden in the stars at the moment of your question'
      };
    }
  }

  /**
   * Validate if a question is appropriate for horary astrology
   * @param {string} question - The question
   * @returns {Object} Validation result
   */
  validateQuestion(question) {
    const lowerQuestion = question.toLowerCase();

    // Check for inappropriate questions
    const inappropriate = [
      'death', 'suicide', 'murder', 'crime', 'illegal',
      'gambling', 'lottery', 'speculation', 'betting'
    ];

    for (const word of inappropriate) {
      if (lowerQuestion.includes(word)) {
        return {
          isValid: false,
          reason: 'This type of question is not appropriate for horary astrology as it deals with harmful or speculative matters.'
        };
      }
    }

    // Check if it's a yes/no question or specific inquiry
    const isQuestion = lowerQuestion.includes('?') ||
                      lowerQuestion.startsWith('will') ||
                      lowerQuestion.startsWith('should') ||
                      lowerQuestion.startsWith('can') ||
                      lowerQuestion.startsWith('is') ||
                      lowerQuestion.startsWith('are') ||
                      lowerQuestion.startsWith('do') ||
                      lowerQuestion.startsWith('does');

    if (!isQuestion) {
      return {
        isValid: false,
        reason: 'Please ask a clear question. Horary astrology works best with specific inquiries.'
      };
    }

    // Check for clarity
    if (question.length < 10) {
      return {
        isValid: false,
        reason: 'Please provide more detail in your question for a meaningful horary reading.'
      };
    }

    return { isValid: true };
  }

  /**
   * Cast horary chart for the moment of the question
   * @param {string} questionTime - Time of question
   * @param {Object} location - Location data
   * @returns {Object} Horary chart data
   */
  castHoraryChart(questionTime, location = {}) {
    try {
      // Parse question time
      const [datePart, timePart] = questionTime.split(' ');
      const [day, month, year] = datePart.split('/').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);

      // Default location if not provided
      const latitude = location.latitude || 28.6139; // Delhi
      const longitude = location.longitude || 77.2090;
      const timezone = location.timezone || 5.5; // IST

      // Calculate planetary positions (simplified)
      const planetaryPositions = this.calculateHoraryPositions(year, month, day, hour, minute);

      // Determine ascendant and houses
      const ascendant = this.calculateAscendant(hour, minute, day, month, year, latitude, longitude);
      const houses = this.calculateHouses(ascendant);

      return {
        questionTime: { year, month, day, hour, minute },
        location: { latitude, longitude, timezone },
        ascendant,
        houses,
        planetaryPositions,
        planetaryHour: this.calculatePlanetaryHour(day, month, year, hour)
      };
    } catch (error) {
      logger.error('Error casting horary chart:', error);
      return {
        error: 'Chart calculation failed',
        ascendant: 'Unknown',
        houses: {},
        planetaryPositions: {}
      };
    }
  }

  /**
   * Calculate simplified planetary positions for horary
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {number} hour - Hour
   * @param {number} minute - Minute
   * @returns {Object} Planetary positions
   */
  calculateHoraryPositions(year, month, day, hour, minute) {
    // Simplified calculation - in practice would use astronomical calculations
    const seed = year * 10000 + month * 100 + day + hour * 100 + minute;

    const positions = {};
    const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

    planets.forEach((planet, index) => {
      const longitude = (seed * (index + 1) * 13) % 360;
      positions[planet] = {
        longitude: Math.round(longitude * 10) / 10,
        sign: this.getZodiacSign(longitude),
        house: this.getHouse(longitude, 0) // Simplified, ascendant at 0
      };
    });

    return positions;
  }

  /**
   * Calculate ascendant (rising sign) for horary chart
   * @param {number} hour - Hour
   * @param {number} minute - Minute
   * @param {number} day - Day
   * @param {number} month - Month
   * @param {number} year - Year
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Object} Ascendant data
   */
  calculateAscendant(hour, minute, day, month, year, latitude, longitude) {
    // Simplified ascendant calculation
    const totalMinutes = hour * 60 + minute;
    const dayOfYear = this.getDayOfYear(day, month);
    const seasonalOffset = Math.sin((dayOfYear / 365) * 2 * Math.PI) * 30;

    const ascendantDegree = (totalMinutes * 0.25 + seasonalOffset + latitude) % 360;

    return {
      degree: Math.round(ascendantDegree * 10) / 10,
      sign: this.getZodiacSign(ascendantDegree),
      symbol: this.getAscendantSymbol(ascendantDegree)
    };
  }

  /**
   * Calculate houses based on ascendant
   * @param {Object} ascendant - Ascendant data
   * @returns {Object} House cusps
   */
  calculateHouses(ascendant) {
    const houses = {};
    const ascendantDegree = ascendant.degree;

    // Simplified equal house system
    for (let i = 1; i <= 12; i++) {
      const houseDegree = (ascendantDegree + (i - 1) * 30) % 360;
      houses[i] = {
        degree: Math.round(houseDegree * 10) / 10,
        sign: this.getZodiacSign(houseDegree),
        meaning: this.houseMeanings[i]
      };
    }

    return houses;
  }

  /**
   * Calculate planetary hour
   * @param {number} day - Day
   * @param {number} month - Month
   * @param {number} year - Year
   * @param {number} hour - Hour
   * @returns {string} Planetary hour ruler
   */
  calculatePlanetaryHour(day, month, year, hour) {
    // Determine day of week (0 = Sunday, 6 = Saturday)
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();

    // Planetary day rulers
    const dayRulers = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

    // Get planetary hour for the given hour
    const hourIndex = Math.floor(hour / 1); // Each hour is ruled by a planet
    const planetaryHour = this.planetaryHours[hourIndex % 24];

    return planetaryHour;
  }

  /**
   * Determine the judge (ruling planet) of the horary chart
   * @param {Object} chart - Horary chart
   * @param {string} question - The question
   * @returns {Object} Judge information
   */
  determineJudge(chart, question) {
    // Primary judge is the ruler of the ascendant
    const ascendantRuler = this.getRulerOfSign(chart.ascendant.sign);

    // Secondary considerations based on question type
    const questionType = this.categorizeQuestion(question);
    const categoryRulers = this.questionCategories[questionType]?.rulers || [];

    // Check planetary hour
    const hourRuler = chart.planetaryHour.toLowerCase();

    // Determine strongest ruler
    let judge = ascendantRuler;

    // If hour ruler is prominent in the question category, use it
    if (categoryRulers.includes(hourRuler)) {
      judge = hourRuler;
    }

    return {
      planet: judge,
      reason: `Ruler of the ascendant (${chart.ascendant.sign})`,
      strength: this.assessJudgeStrength(chart, judge),
      ...this.planetaryRulers[judge]
    };
  }

  /**
   * Get ruler of a zodiac sign
   * @param {string} sign - Zodiac sign
   * @returns {string} Ruling planet
   */
  getRulerOfSign(sign) {
    const rulers = {
      'Aries': 'mars',
      'Taurus': 'venus',
      'Gemini': 'mercury',
      'Cancer': 'moon',
      'Leo': 'sun',
      'Virgo': 'mercury',
      'Libra': 'venus',
      'Scorpio': 'mars',
      'Sagittarius': 'jupiter',
      'Capricorn': 'saturn',
      'Aquarius': 'saturn',
      'Pisces': 'jupiter'
    };

    return rulers[sign] || 'sun';
  }

  /**
   * Assess the strength of the judge
   * @param {Object} chart - Horary chart
   * @param {string} judge - Judge planet
   * @returns {string} Strength assessment
   */
  assessJudgeStrength(chart, judge) {
    const judgePosition = chart.planetaryPositions[judge];

    if (!judgePosition) return 'Unknown';

    // Check if judge is in angular house (1, 4, 7, 10)
    const angularHouses = [1, 4, 7, 10];
    if (angularHouses.includes(judgePosition.house)) {
      return 'Very Strong (angular house)';
    }

    // Check if judge is in succedent house (2, 5, 8, 11)
    const succedentHouses = [2, 5, 8, 11];
    if (succedentHouses.includes(judgePosition.house)) {
      return 'Strong (succedent house)';
    }

    // Check if judge is in cadent house (3, 6, 9, 12)
    const cadentHouses = [3, 6, 9, 12];
    if (cadentHouses.includes(judgePosition.house)) {
      return 'Moderate (cadent house)';
    }

    return 'Neutral';
  }

  /**
   * Categorize the question
   * @param {string} question - The question
   * @returns {string} Question category
   */
  categorizeQuestion(question) {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('love') || lowerQuestion.includes('relationship') || lowerQuestion.includes('marriage')) {
      return 'love';
    }
    if (lowerQuestion.includes('career') || lowerQuestion.includes('job') || lowerQuestion.includes('work')) {
      return 'career';
    }
    if (lowerQuestion.includes('health') || lowerQuestion.includes('illness') || lowerQuestion.includes('doctor')) {
      return 'health';
    }
    if (lowerQuestion.includes('money') || lowerQuestion.includes('finance') || lowerQuestion.includes('wealth')) {
      return 'money';
    }
    if (lowerQuestion.includes('travel') || lowerQuestion.includes('journey') || lowerQuestion.includes('trip')) {
      return 'travel';
    }
    if (lowerQuestion.includes('family') || lowerQuestion.includes('parent') || lowerQuestion.includes('child')) {
      return 'family';
    }
    if (lowerQuestion.includes('legal') || lowerQuestion.includes('court') || lowerQuestion.includes('law')) {
      return 'legal';
    }
    if (lowerQuestion.includes('spiritual') || lowerQuestion.includes('soul') || lowerQuestion.includes('divine')) {
      return 'spiritual';
    }

    return 'general';
  }

  /**
   * Analyze the question in the context of the chart
   * @param {string} question - The question
   * @param {Object} chart - Horary chart
   * @returns {Object} Question analysis
   */
  analyzeQuestion(question, chart) {
    const category = this.categorizeQuestion(question);
    const relevantHouses = this.questionCategories[category]?.houses || [1, 7];

    const houseAnalysis = relevantHouses.map(house => ({
      house,
      meaning: this.houseMeanings[house],
      planets: this.getPlanetsInHouse(chart, house)
    }));

    return {
      category,
      relevantHouses: houseAnalysis,
      keyIndicators: this.identifyKeyIndicators(chart, category)
    };
  }

  /**
   * Get planets in a specific house
   * @param {Object} chart - Horary chart
   * @param {number} house - House number
   * @returns {Array} Planets in the house
   */
  getPlanetsInHouse(chart, house) {
    const planets = [];
    Object.entries(chart.planetaryPositions).forEach(([planet, position]) => {
      if (position.house === house) {
        planets.push(planet);
      }
    });
    return planets;
  }

  /**
   * Identify key indicators for the question
   * @param {Object} chart - Horary chart
   * @param {string} category - Question category
   * @returns {Array} Key indicators
   */
  identifyKeyIndicators(chart, category) {
    const indicators = [];

    // Check moon aspects (moon is co-significator)
    const moonPosition = chart.planetaryPositions.moon;
    if (moonPosition) {
      indicators.push(`Moon in ${moonPosition.sign} (house ${moonPosition.house})`);
    }

    // Check judge position
    const judge = this.determineJudge(chart, '');
    const judgePosition = chart.planetaryPositions[judge.planet];
    if (judgePosition) {
      indicators.push(`${judge.name} in ${judgePosition.sign} (house ${judgePosition.house})`);
    }

    return indicators;
  }

  /**
   * Generate answer based on chart analysis
   * @param {Object} chart - Horary chart
   * @param {Object} judge - Judge information
   * @param {Object} questionAnalysis - Question analysis
   * @returns {Object} Answer
   */
  generateAnswer(chart, judge, questionAnalysis) {
    // Simplified answer generation based on traditional horary rules
    const answer = {
      yesNo: this.determineYesNo(chart, judge),
      confidence: this.assessConfidence(chart, judge),
      timing: this.determineTiming(chart),
      advice: this.generateAdvice(chart, judge, questionAnalysis),
      warnings: this.identifyWarnings(chart)
    };

    return answer;
  }

  /**
   * Determine yes/no answer
   * @param {Object} chart - Horary chart
   * @param {Object} judge - Judge information
   * @returns {string} Yes/No answer
   */
  determineYesNo(chart, judge) {
    // Simplified yes/no determination
    const judgeHouse = chart.planetaryPositions[judge.planet]?.house || 1;

    // Angular houses generally indicate yes
    if ([1, 4, 7, 10].includes(judgeHouse)) {
      return 'Yes';
    }

    // Cadent houses may indicate no or delay
    if ([3, 6, 9, 12].includes(judgeHouse)) {
      return 'No';
    }

    // Succedent houses are neutral/maybe
    return 'Maybe/Neutral';
  }

  /**
   * Assess confidence in the answer
   * @param {Object} chart - Horary chart
   * @param {Object} judge - Judge information
   * @returns {string} Confidence level
   */
  assessConfidence(chart, judge) {
    const strength = judge.strength;

    if (strength.includes('Very Strong')) return 'High confidence';
    if (strength.includes('Strong')) return 'Moderate confidence';
    if (strength.includes('Moderate')) return 'Low confidence';
    return 'Uncertain - question may need clarification';
  }

  /**
   * Determine timing of the answer
   * @param {Object} chart - Horary chart
   * @returns {string} Timing information
   */
  determineTiming(chart) {
    // Simplified timing based on moon's position
    const moonHouse = chart.planetaryPositions.moon?.house || 1;

    if (moonHouse <= 3) return 'Soon (within days/weeks)';
    if (moonHouse <= 6) return 'Moderate time (weeks/months)';
    if (moonHouse <= 9) return 'Extended time (months/year)';
    return 'Long-term (year or more)';
  }

  /**
   * Generate advice based on the chart
   * @param {Object} chart - Horary chart
   * @param {Object} judge - Judge information
   * @param {Object} questionAnalysis - Question analysis
   * @returns {string} Advice
   */
  generateAdvice(chart, judge, questionAnalysis) {
    const advice = [];

    // Basic advice based on judge
    advice.push(`Trust in ${judge.name}'s guidance for this matter.`);

    // House-based advice
    const relevantHouse = questionAnalysis.relevantHouses[0];
    if (relevantHouse) {
      advice.push(`Focus on ${relevantHouse.meaning.toLowerCase()}.`);
    }

    // Planetary hour advice
    advice.push(`The planetary hour of ${chart.planetaryHour} suggests ${this.getHourAdvice(chart.planetaryHour)}.`);

    return advice.join(' ');
  }

  /**
   * Get advice based on planetary hour
   * @param {string} hour - Planetary hour
   * @returns {string} Hour-based advice
   */
  getHourAdvice(hour) {
    const advice = {
      'Sun': 'leadership and confidence',
      'Moon': 'intuition and emotional wisdom',
      'Mercury': 'communication and planning',
      'Venus': 'harmony and relationship building',
      'Mars': 'action and courage',
      'Jupiter': 'expansion and optimism',
      'Saturn': 'discipline and patience'
    };

    return advice[hour] || 'careful consideration';
  }

  /**
   * Identify warnings from the chart
   * @param {Object} chart - Horary chart
   * @returns {Array} Warnings
   */
  identifyWarnings(chart) {
    const warnings = [];

    // Check for challenging planetary positions
    Object.entries(chart.planetaryPositions).forEach(([planet, position]) => {
      if ([6, 8, 12].includes(position.house)) {
        warnings.push(`${planet} in house ${position.house} suggests challenges or delays.`);
      }
    });

    return warnings;
  }

  /**
   * Generate comprehensive horary description
   * @param {Object} chart - Horary chart
   * @param {Object} judge - Judge information
   * @param {Object} answer - Answer data
   * @returns {string} Horary description
   */
  generateHoraryDescription(chart, judge, answer) {
    let description = `🔮 *Horary Astrology Reading*\n\n`;

    description += `⏰ *Chart Cast:* ${chart.questionTime.day}/${chart.questionTime.month}/${chart.questionTime.year} ${chart.questionTime.hour}:${chart.questionTime.minute.toString().padStart(2, '0')}\n`;
    description += `🌍 *Location:* ${chart.location.latitude}°N, ${chart.location.longitude}°E\n\n`;

    description += `👑 *Judge (Ruling Planet):* ${judge.name} ${judge.symbol}\n`;
    description += `• Strength: ${judge.strength}\n`;
    description += `• Meaning: ${judge.meaning}\n`;
    description += `• Questions: ${judge.questions}\n\n`;

    description += `🏠 *Ascendant:* ${chart.ascendant.sign} (${chart.ascendant.degree}°)\n`;
    description += `🌙 *Planetary Hour:* ${chart.planetaryHour}\n\n`;

    description += `❓ *Answer:*\n`;
    description += `• Yes/No: ${answer.yesNo}\n`;
    description += `• Confidence: ${answer.confidence}\n`;
    description += `• Timing: ${answer.timing}\n\n`;

    description += `💡 *Advice:*\n${answer.advice}\n\n`;

    if (answer.warnings.length > 0) {
      description += `⚠️ *Warnings:*\n`;
      answer.warnings.forEach(warning => {
        description += `• ${warning}\n`;
      });
      description += '\n';
    }

    description += `🔍 *Key Indicators:*\n`;
    if (chart.planetaryPositions.sun) description += `• Sun in ${chart.planetaryPositions.sun.sign} (house ${chart.planetaryPositions.sun.house})\n`;
    if (chart.planetaryPositions.moon) description += `• Moon in ${chart.planetaryPositions.moon.sign} (house ${chart.planetaryPositions.moon.house})\n`;
    description += `• ${judge.name} in ${chart.planetaryPositions[judge.planet]?.sign || 'unknown'} (house ${chart.planetaryPositions[judge.planet]?.house || 'unknown'})\n\n`;

    description += `📚 *Traditional Horary Wisdom:*\n`;
    description += `• The ascendant represents you, the questioner\n`;
    description += `• The judge shows the outcome and timing\n`;
    description += `• Angular houses (1,4,7,10) indicate strength and success\n`;
    description += `• The moon reveals the emotional truth of the matter`;

    return description;
  }

  /**
   * Get zodiac sign from longitude
   * @param {number} longitude - Longitude in degrees
   * @returns {string} Zodiac sign
   */
  getZodiacSign(longitude) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = Math.floor(longitude / 30) % 12;
    return signs[signIndex];
  }

  /**
   * Get house number from longitude and ascendant
   * @param {number} longitude - Planet longitude
   * @param {number} ascendant - Ascendant degree
   * @returns {number} House number
   */
  getHouse(longitude, ascendant) {
    const position = (longitude - ascendant + 360) % 360;
    return Math.floor(position / 30) + 1;
  }

  /**
   * Get ascendant symbol
   * @param {number} degree - Ascendant degree
   * @returns {string} Symbol
   */
  getAscendantSymbol(degree) {
    const sign = this.getZodiacSign(degree);
    const symbols = {
      'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
      'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
      'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
    };
    return symbols[sign] || '♈';
  }

  /**
   * Get day of year
   * @param {number} day - Day
   * @param {number} month - Month
   * @returns {number} Day of year
   */
  getDayOfYear(day, month) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let dayOfYear = day;
    for (let i = 0; i < month - 1; i++) {
      dayOfYear += daysInMonth[i];
    }
    return dayOfYear;
  }
}

module.exports = new HoraryReader();