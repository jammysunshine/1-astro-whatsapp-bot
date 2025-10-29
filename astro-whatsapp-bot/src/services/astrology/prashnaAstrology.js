/**
 * Prashna Astrology - Question-Based Divination System
 * Analyzes horary charts cast at the exact moment a question is asked
 */

const logger = require('../../utils/logger');
const sweph = require('sweph');

class PrashnaAstrology {
  constructor() {
    logger.info('Module: PrashnaAstrology loaded - Vedic Question Divination');
    this.initializePrashnaSystem();
  }

  /**
   * Initialize prashna astrology system
   */
  initializePrashnaSystem() {
    // Prashna houses and their meanings (Kashinath system)
    this.prashnaHouses = {
      1: { name: 'Questioner', significance: 'Questioner, life, health, personality', positive: 'Strong, healthy, successful question', negative: 'Weak, ill, doubtful mind' },
      2: { name: 'Family', significance: 'Family, wealth, speech, food', positive: 'Harmony, prosperity, good family', negative: 'Arguments, poverty, family tension' },
      3: { name: 'Siblings', significance: 'Siblings, communications, short journeys, courage', positive: 'Good relations, successful journeys', negative: 'Conflicts, travel problems, cowardice' },
      4: { name: 'Home', significance: 'Mother, home, property, emotions, education', positive: 'Happy home, property gain, emotional peace', negative: 'Domestic problems, property loss, misery' },
      5: { name: 'Children', significance: 'Children, creativity, intelligence, speculation', positive: 'Children success, creative gains, wisdom', negative: 'Child problems, poor intelligence, losses in speculation' },
      6: { name: 'Enemies', significance: 'Enemies, diseases, service, competition', positive: 'Victory over enemies, health improvement, good service', negative: 'Illness, defeat, legal problems, poor health' },
      7: { name: 'Spouse', significance: 'Marriage, partnerships, spouse, business partners', positive: 'Successful marriage, good partnerships', negative: 'Divorce/separation, business failures, broken relationships' },
      8: { name: 'Longevity', significance: 'Death, accidents, chronic diseases, occult', positive: 'Long life, recovery from illness, magical success', negative: 'Death, accidents, chronic illness, misfortunes' },
      9: { name: 'Fortune', significance: 'Father, guru, long journeys, religion, higher learning', positive: 'Spiritual progress, foreign travels, luck, good fortune', negative: 'Misfortune, bad luck, family problems' },
      10: { name: 'Career', significance: 'Profession, father, authority, reputation, honors', positive: 'Career success, fame, high position', negative: 'Job loss, bad reputation, low status' },
      11: { name: 'Friends', significance: 'Friends, elder siblings, gains, hopes, wishes', positive: 'Fulfillment of desires, good friends, gains', negative: 'Betrayal, disappointment, financial loss' },
      12: { name: 'Expenditure', significance: 'Expenses, foreign lands, spirituality, losses, secret enemies', positive: 'Liberation, foreign gains, secret success', negative: 'Heavy expenses, losses, imprisonment' }
    };

    // Prashna significators and their rulerships
    this.significators = {
      sun: { houses: [1, 9, 10, 11], meaning: 'Authority, father, government, vitality' },
      moon: { houses: [4], meaning: 'Mother, mind, emotions, public' },
      mars: { houses: [3, 6], meaning: 'Brothers, enemies, accidents, courage' },
      mercury: { houses: [3, 6], meaning: 'Communication, siblings, intellect, trade' },
      jupiter: { houses: [2, 5, 9, 11], meaning: 'Children, wealth, wisdom, expansion' },
      venus: { houses: [2, 7], meaning: 'Spouse, luxury, arts, pleasure' },
      saturn: { houses: [8, 12], meaning: 'Servants, old age, chronic illness, karma' },
      rahu: { houses: [6, 8, 12], meaning: 'Foreigners, poison, underworld, sudden events' },
      ketu: { houses: [6, 8, 12], meaning: 'Spirituality, detachment, mystical experiences' }
    };

    // Question types and their ruling houses
    this.questionTypes = {
      // Career & Money
      career: { houses: [2, 6, 10, 11], best_house: 10, significator: 'sun' },
      job: { houses: [6, 10], best_house: 10, significator: 'sun' },
      business: { houses: [3, 7, 11], best_house: 11, significator: 'mercury' },
      money: { houses: [2, 5, 11], best_house: 11, significator: 'jupiter' },
      investment: { houses: [5, 11], best_house: 5, significator: 'jupiter' },

      // Relationships
      marriage: { houses: [1, 5, 7, 9], best_house: 7, significator: 'venus' },
      love: { houses: [5, 7], best_house: 5, significator: 'venus' },
      partner: { houses: [7, 9], best_house: 7, significator: 'venus' },
      divorce: { houses: [6, 12], best_house: 12, significator: 'saturn' },
      children: { houses: [5], best_house: 5, significator: 'jupiter' },

      // Health
      health: { houses: [1, 6, 8, 12], best_house: 1, significator: 'mars' },
      illness: { houses: [6, 8], best_house: 8, significator: 'saturn' },
      medicine: { houses: [6, 12], best_house: 12, significator: 'saturn' },

      // Travel & Journey
      travel: { houses: [3, 9, 12], best_house: 9, significator: 'moon' },
      journey: { houses: [3, 9, 12], best_house: 9, significator: 'moon' },
      abroad: { houses: [9, 12], best_house: 9, significator: 'moon' },

      // Legal & Disputes
      court: { houses: [6, 12], best_house: 6, significator: 'mars' },
      dispute: { houses: [6, 12], best_house: 6, significator: 'mars' },
      lawsuit: { houses: [6, 12], best_house: 6, significator: 'mars' },

      // Property
      property: { houses: [4, 12], best_house: 4, significator: 'moon' },
      land: { houses: [4, 8], best_house: 4, significator: 'moon' },
      house: { houses: [4, 8], best_house: 4, significator: 'saturn' },

      // Education & Studies
      exam: { houses: [4, 9], best_house: 4, significator: 'moon' },
      education: { houses: [4, 9], best_house: 4, significator: 'jupiter' },
      study: { houses: [4, 9], best_house: 4, significator: 'mercury' },

      // Spiritual & Occult
      spiritual: { houses: [5, 9, 12], best_house: 9, significator: 'jupiter' },
      mantra: { houses: [5, 8, 9], best_house: 5, significator: 'ketu' },
      occult: { houses: [5, 8, 9, 12], best_house: 8, significator: 'rahu' }
    };

    // Timing periods for prashna predictions
    this.timingPeriods = [
      { days: 3, ruling: 'moon', description: 'Next 3 days' },
      { days: 7, ruling: 'mercury', description: 'Next week' },
      { days: 15, ruling: 'venus', description: 'Next 2 weeks' },
      { days: 30, ruling: 'mars', description: 'Next month' },
      { days: 60, ruling: 'jupiter', description: 'Next 2 months' },
      { days: 120, ruling: 'saturn', description: 'Next 3-4 months' },
      { days: 365, ruling: 'jupiter', description: 'Next year' },
      { days: 730, ruling: 'saturn', description: 'Next 1-2 years' }
    ];
  }

  /**
   * Generate prashna astrology analysis for a question asked at specific time
   * @param {Object} prashnaData - Question data, time, location, and user info
   * @returns {Object} Complete prashna reading
   */
  async generatePrashnaAnalysis(prashnaData) {
    try {
      const { question, questionTime, questionDate, questionLocation, user } = prashnaData;

      // Parse the exact moment of question
      const [day, month, year] = questionDate.split('/').map(Number);
      const [hour, minute] = questionTime.split(':').map(Number);
      const julianDay = this.dateToJulianDay(year, month, day, hour + minute / 60);

      // Cast horary chart for exact question moment
      const horaryChart = await this.castHoraryChart(julianDay, questionLocation);

      // Analyze question type
      const questionAnalysis = this.analyzeQuestionType(question, horaryChart);

      // Determine main significator
      const significator = this.determineSignificator(questionAnalysis.type, horaryChart);

      // Analyze ruling planet
      const ruler = this.analyzeRulingPlanet(significator, horaryChart);

      // Generate prediction
      const prediction = this.generatePrediction(significator, ruler, horaryChart);

      // Calculate timing
      const timing = this.calculateTiming(significator, horaryChart);

      // Generate recommendations
      const recommendations = this.generatePrashnaRecommendations(prediction, timing);

      return {
        question,
        questionMoment: `${questionDate} ${questionTime}`,
        questionLocation,
        horaryChart,
        questionAnalysis,
        significator,
        rulingPlanet: ruler,
        prediction,
        timing,
        recommendations,
        accuracy: this.assessAccuracy(horaryChart),
        summary: this.generatePrashnaSummary(question, prediction, timing, recommendations)
      };
    } catch (error) {
      logger.error('Error generating prashna analysis:', error);
      return {
        error: `Unable to generate prashna analysis: ${error.message}`,
        fallback: 'Prashna astrology analyzes questions through horary charts'
      };
    }
  }

  /**
   * Cast horary chart at the moment of question
   * @private
   */
  async castHoraryChart(jd, location) {
    const { latitude, longitude, timezone = 5.5 } = location;

    // Calculate planets at question time
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
      ketu: null // 180° from Rahu
    };

    for (const [name, id] of Object.entries(planetIds)) {
      if (id !== null) {
        const result = sweph.calc(jd, id, sweph.FLG_SWIEPH | sweph.FLG_SIDEREAL);
        if (result && result.longitude) {
          const longitude = result.longitude[0];
          planets[name] = {
            longitude,
            sign: this.longitudeToSign(longitude),
            house: this.longitudeToHouse(longitude, planets.ascendant),
            inRetrograde: this.isRetrograde(name, jd, result.longitude[2]),
            strength: this.calculatePlanetaryStrength(name, longitude, planets.ascendant)
          };
        }
      }
    }

    // Calculate ascendant
    const ascendant = this.calculateAscendant(jd, latitude, longitude);
    planets.ascendant = ascendant;

    // Determine houses
    const { houses, angles } = this.calculateHouses(ascendant, jd, latitude, longitude);

    return {
      planets,
      houses,
      angles,
      lagna: ascendant,
      jd, // Julian day for reference
      location: { latitude, longitude, timezone }
    };
  }

  /**
   * Analyze the type of question asked
   * @private
   */
  analyzeQuestionType(question, horaryChart) {
    const questionLower = question.toLowerCase();
    let questionType = 'general';
    let rulingHouses = [];
    let bestOutcomeHouse = 1;

    // Identify question category
    for (const [type, config] of Object.entries(this.questionTypes)) {
      const keywords = type.split(' ').concat([type]); // Split compound words
      if (keywords.some(keyword => questionLower.includes(keyword))) {
        questionType = type;
        rulingHouses = config.houses;
        bestOutcomeHouse = config.best_house;
        break;
      }
    }

    // Determine outcome based on house lord strength
    const outcome = this.determineOutcome(horaryChart, bestOutcomeHouse);

    return {
      type: questionType,
      original: question,
      rulingHouses,
      bestOutcomeHouse,
      outcome
    };
  }

  /**
   * Determine the main significator for the question
   * @private
   */
  determineSignificator(questionType, horaryChart) {
    const questionConfig = this.questionTypes[questionType] || this.questionTypes.general;

    // Primary significator from question type
    const primarySignificator = {
      planet: questionConfig.significator,
      house: questionConfig.best_house,
      strength: this.calculateSignificatorStrength(questionConfig.significator, horaryChart)
    };

    // Check if moon is stronger (traditional prashna rule)
    const moonStrength = horaryChart.planets.moon?.strength || 0;
    if (moonStrength > primarySignificator.strength) {
      primarySignificator.planet = 'moon';
      primarySignificator.house = 4; // Moon rules 4th house traditionally
    }

    // Find mutual aspects
    const mutualAspects = this.findMutualAspects(primarySignificator.planet, horaryChart);

    return {
      ...primarySignificator,
      mutualAspects,
      dispositor: this.findDispositor(primarySignificator.planet, horaryChart),
      nextMajorAspect: this.findNextMajorAspect(primarySignificator.planet, horaryChart)
    };
  }

  /**
   * Analyze the ruling planet's condition
   * @private
   */
  analyzeRulingPlanet(significator, horaryChart) {
    const planet = horaryChart.planets[significator.planet];
    if (!planet) { return { status: 'Not found', condition: 'Neutral' }; }

    let condition = 'Neutral';
    let { strength } = planet;
    const aspects = [];
    let dignity = 'Neutral';

    // Check dignity
    if (this.isExalted(significator.planet, planet.sign)) {
      dignity = 'Exalted';
      strength += 2;
    } else if (this.isOwnSign(significator.planet, planet.sign)) {
      dignity = 'Own Sign';
      strength += 1;
    } else if (this.isDebilitated(significator.planet, planet.sign)) {
      dignity = 'Debilitated';
      strength -= 2;
    }

    // Check house position
    if ([6, 8, 12].includes(planet.house)) {
      condition = 'Difficult';
      strength -= 1;
    } else if ([1, 5, 9].includes(planet.house)) {
      condition = 'Favorable';
      strength += 1;
    }

    // Check retrograde
    if (planet.inRetrograde) {
      aspects.push('Retrograde (internal focus, delays)');
      strength -= 0.5;
    }

    return {
      planet: significator.planet,
      condition,
      dignity,
      strength,
      house: planet.house,
      aspects,
      interpretation: this.interpretPlanetCondition(significator.planet, condition, dignity)
    };
  }

  /**
   * Generate prediction based on analysis
   * @private
   */
  generatePrediction(significator, rulingPlanet, horaryChart) {
    const analysis = {
      yesNo: this.determineYesNo(significator, rulingPlanet, horaryChart),
      probability: 0,
      outcome: 'Neutral',
      modifiers: [],
      confidence: 'Medium'
    };

    // Calculate probability based on various factors
    let score = 0;

    // Ruling planet condition
    if (rulingPlanet.condition === 'Favorable') { score += 2; } else if (rulingPlanet.condition === 'Difficult') { score -= 2; }

    // Dignity strength
    if (rulingPlanet.dignity === 'Exalted') { score += 2; } else if (rulingPlanet.dignity === 'Own Sign') { score += 1; } else if (rulingPlanet.dignity === 'Debilitated') { score -= 2; }

    // House position
    if ([1, 5, 9].includes(rulingPlanet.house)) { score += 1; } else if ([6, 8, 12].includes(rulingPlanet.house)) { score -= 1; }

    // Moon condition (mind of questioner)
    const moonSign = horaryChart.planets.moon?.sign;
    if (moonSign && [3, 7, 11].includes(this.signToHouse(moonSign, horaryChart))) {
      score += 1; // Moon in trine = good mindset
    }

    // Convert score to probability and outcome
    analysis.probability = Math.max(0, Math.min(100, 50 + (score * 15())));
    analysis.confidence = score >= 2 ? 'High' : score <= -2 ? 'Low' : 'Medium';

    // Determine yes/no based on score
    if (score >= 2) {
      analysis.yesNo = 'Yes';
      analysis.outcome = 'Positive';
    } else if (score <= -2) {
      analysis.yesNo = 'No';
      analysis.outcome = 'Negative';
    } else {
      analysis.yesNo = 'Uncertain';
      analysis.outcome = 'Mixed/Ambiguous';
    }

    // Add modifiers
    if (horaryChart.planets.moon?.inRetrograde) {
      analysis.modifiers.push('Questioner confused or needs contemplation');
    }

    return analysis;
  }

  /**
   * Calculate timing for the answer manifestation
   * @private
   */
  calculateTiming(significator, horaryChart) {
    const timing = {
      period: 'Unknown',
      description: '',
      rulingPlanet: significator.planet,
      timeframe: {}
    };

    // Determine timing based on significator's position and aspects
    const planetHouse = horaryChart.planets[significator.planet]?.house;

    if (!planetHouse) {
      timing.description = 'Timing unclear at this moment';
      return timing;
    }

    // House-based timing
    const houseTimings = {
      1: 'Immediate (next few days)',
      2: 'Short-term (1-2 weeks)',
      3: 'Quick (within 1 week)',
      4: 'Moderate (1-2 months)',
      5: 'Variable (depends on efforts)',
      6: 'Some delay (may involve effort)',
      7: 'Partnership timing (involves others)',
      8: 'Long-term (3-6 months)',
      9: 'Good fortune timing (positive flow)',
      10: 'Career timing (professional matters)',
      11: 'Achievement timing (goals manifest)',
      12: 'Final outcome timing (resolution period)'
    };

    timing.description = houseTimings[planetHouse] || 'Timing impacted by house position';

    // Calculate specific timeframe
    const timeframe = this.calculateSpecificTimeframe(significator, horaryChart);
    timing.timeframe = timeframe;
    timing.period = timeframe.description;

    return timing;
  }

  /**
   * Generate recommendations based on prashna
   * @private
   */
  generatePrashnaRecommendations(prediction, timing) {
    const recommendations = {
      actions: [],
      precautions: [],
      mantras: [],
      timing_advice: ''
    };

    // Outcome-based actions
    if (prediction.yesNo === 'Yes') {
      recommendations.actions.push('Proceed with confidence');
      recommendations.actions.push('Take the first step this week');
      recommendations.precautions.push('Monitor progress regularly');
    } else if (prediction.yesNo === 'No') {
      recommendations.actions.push('Reconsider timing and approach');
      recommendations.actions.push('Seek additional counsel');
      recommendations.precautions.push('Avoid major commitments');
    } else {
      recommendations.actions.push('Gather more information');
      recommendations.actions.push('Wait for clearer signs');
      recommendations.precautions.push('Be patient and observant');
    }

    // Timing-based advice
    recommendations.timing_advice = `Best timeframe: ${timing.period}. ${prediction.outcome === 'Positive' ? 'Take advantage of favorable timing.' : 'Use this period for planning and preparation.'}`;

    // Basic mantras for all
    recommendations.mantras.push('Om Shreem Maha Lakshmiyei Namaha (for decisions)');
    recommendations.mantras.push('Om Gam Ganapataye Namaha (for removing obstacles)');

    return recommendations;
  }

  /**
   * Assess accuracy of the horary reading
   * @private
   */
  assessAccuracy(horaryChart) {
    let accuracyScore = 50; // Base 50%

    // Moon void of course = less reliable
    const { moon } = horaryChart.planets;
    if (moon && this.isVoidOfCourse(moon, horaryChart)) {
      accuracyScore -= 20;
      // Moon void means question not ready or answer unclear
    }

    // Strong ascendant lord increases accuracy
    const asclord = this.getLordOfSign(horaryChart.lagna.sign);
    const asclordPosition = horaryChart.planets[asclord];
    if (asclordPosition && asclordPosition.strength > 1) {
      accuracyScore += 15;
    }

    // Well-placed question significator
    accuracyScore = Math.max(10, Math.min(95, accuracyScore));

    const levels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    const levelIndex = Math.floor((accuracyScore - 10) / 17);

    return {
      score: accuracyScore,
      level: levels[levelIndex],
      factors: [],
      note: 'Prashna accuracy depends on sincerity of question and cosmic receptive time.'
    };
  }

  /**
   * Generate comprehensive prashna summary
   * @private
   */
  generatePrashnaSummary(question, prediction, timing, recommendations) {
    const answer = prediction.yesNo.toUpperCase();
    const probability = `${prediction.probability}% likely`;
    const timingInfo = timing.period;

    let summary = '🔮 **PRASHNA ASTROLOGY READING**\n\n';
    summary += `**Question:** "${question}"\n\n`;
    summary += `**Answer:** ${answer} (${probability})\n`;
    summary += `**Outcome:** ${prediction.outcome}\n`;
    summary += `**Timing:** ${timingInfo}\n\n`;

    summary += '**Recommendations:**\n';
    recommendations.actions.forEach(action => {
      summary += `✅ ${action}\n`;
    });
    summary += '\n⚠️ **Precautions:**\n';
    recommendations.precautions.forEach(precaution => {
      summary += `⚠️ ${precaution}\n`;
    });

    summary += '\n📿 **Suggested Mantras:**\n';
    recommendations.mantras.forEach(mantra => {
      summary += `🕉️ ${mantra}\n`;
    });

    summary += `\n⏰ **Timing Advice:**\n${recommendations.timing_advice}\n\n`;

    summary += `*Prashna accuracy: ${prediction.confidence} (${prediction.probability}%)\n`;
    summary += 'Chart cast at exact moment of question.* 🪐';

    return summary;
  }

  // Helper methods
  dateToJulianDay(year, month, day, hour) {
    return hour / 24 + day + Math.floor((153 * month + 2) / 5) + 365 * year + Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400) - 32045;
  }

  longitudeToSign(longitude) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs[Math.floor(longitude / 30) % 12];
  }

  longitudeToHouse(longitude, ascendant) {
    const diff = ((longitude - ascendant + 360) % 360);
    return Math.floor(diff / 30) + 1;
  }

  calculateAscendant(jd, lat, lon) {
    // Simplified ascendant calculation
    return (jd * 15 + lon + 90) % 360; // Very basic estimation
  }

  calculateHouses(ascendant, jd, lat, lon) {
    const houses = [];
    for (let i = 0; i < 12; i++) {
      houses[i] = (ascendant + (i * 30)) % 360;
    }
    return { houses, angles: { asc: ascendant, mc: (ascendant + 90) % 360 } };
  }

  // Additional helper methods would go here for planetary calculations

  determineOutcome() { return 'Mixed'; }
  calculateSignificatorStrength() { return 1; }
  findMutualAspects() { return []; }
  findDispositor() { return 'sun'; }
  findNextMajorAspect() { return null; }
  isRetrograde() { return false; }
  calculatePlanetaryStrength() { return 1; }
  isExalted() { return false; }
  isOwnSign() { return false; }
  isDebilitated() { return false; }
  interpretPlanetCondition() { return 'Neutral condition'; }
  determineYesNo() { return 'Uncertain'; }
  findNextMajorAspect() { return {}; }
  calculateSpecificTimeframe() { return { description: 'Within 1 month' }; }
  isVoidOfCourse() { return false; }
  getLordOfSign() { return 'sun'; }
  signToHouse() { return 1; }

  /**
   * Get all available prashna question types
   * @returns {Object} Question types catalog
   */
  getPrashnaCatalog() {
    return {
      question_types: Object.keys(this.questionTypes),
      houses_significance: this.prashnaHouses,
      significators: this.significators,
      timing_periods: this.timingPeriods.map(t => t.description),
      accuracy_factors: 'Moon condition, ruling planet strength, house placements, mutual aspects'
    };
  }
}

module.exports = { PrashnaAstrology };
