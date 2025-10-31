const logger = require('../../../../utils/logger');
const sweph = require('sweph');

/**
 * Prashna Calculator (Horary Astrology)
 * Analyzes questions asked at specific moments using horary astrology principles
 * Casts chart of the question time to answer questions through planetary positions
 */
class PrashnaCalculator {
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
   * Analyze a question using horary astrology principles
   * @param {Object} questionData - Question and timing information
   * @returns {Object} Horary analysis and answer
   */
  async analyzeHoraryQuestion(questionData) {
    try {
      const { question, questionTime, birthData, location } = questionData;

      if (!question || !questionTime || !location) {
        return { error: 'Question, question time, and location are required for horary analysis' };
      }

      // Parse question time
      const [day, month, year, hour, minute] = questionTime.split(/[-\/:]/).map(Number);

      // Get coordinates and timezone
      const [latitude, longitude] = await this._getCoordinatesForPlace(location);
      const questionDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = questionDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Cast horary chart at the moment of question
      const horaryChart = await this._castHoraryChart(year, month, day, hour, minute, latitude, longitude, timezone);

      // Identify question significators
      const significators = this._identifyQuestionSignificators(question, horaryChart);

      // Analyze question ruler's strength and placement
      const questionRulerAnalysis = this._analyzeQuestionRuler(significators.questionRuler, horaryChart);

      // Assess answer timing and probability
      const timingAnalysis = this._assessAnswerTiming(significators, horaryChart);

      // Generate specific question interpretation
      const interpretation = this._generateQuestionInterpretation(question, horaryChart, significators);

      // Calculate answer probability and clarity
      const probabilityAssessment = this._calculateAnswerProbability(horaryChart, significators, questionRulerAnalysis);

      // Provide additional guidance if answer is uncertain
      const additionalGuidance = this._provideAdditionalGuidance(probabilityAssessment, horaryChart);

      return {
        question,
        questionTime,
        location,
        horaryChart,
        significators,
        questionRulerAnalysis,
        timingAnalysis,
        interpretation,
        probabilityAssessment,
        additionalGuidance,
        summary: this._generateHorarySummary(interpretation, probabilityAssessment, timingAnalysis)
      };
    } catch (error) {
      logger.error('❌ Error in horary analysis:', error);
      throw new Error(`Horary question analysis failed: ${error.message}`);
    }
  }

  /**
   * Find auspicious timing for asking important questions
   */
  async findQuestionTiming(birthData, questionType, dateRange = 7) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;
      const [birthDay, birthMonth, birthYear] = birthDate.split('/').map(Number);
      const [birthHour, birthMin] = birthTime.split(':').map(Number);
      const birthDateTime = new Date(birthYear, birthMonth - 1, birthDay, birthHour, birthMin);

      const startDate = new Date();
      const recommendations = [];

      // Get location data
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const timezone = await this._getTimezoneForPlace(latitude, longitude, startDate.getTime());

      // Scan next 7 days for auspicious timings
      for (let day = 0; day < dateRange; day++) {
        const checkDateTime = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);

        // Check key times during the day (6 AM, 12 PM, 6 PM)
        const checkTimes = [[6, 0], [12, 0], [18, 0]];

        for (const [hour, minute] of checkTimes) {
          const fullCheckTime = new Date(checkDateTime);
          fullCheckTime.setHours(hour, minute, 0, 0);

          const timingSuitability = await this._assessQuestionTiming(
            fullCheckTime, questionType, latitude, longitude, timezone
          );

          if (timingSuitability.rating !== 'Poor') {
            recommendations.push({
              date: fullCheckTime.toLocaleDateString(),
              time: fullCheckTime.toLocaleTimeString(),
              suitability: timingSuitability.rating,
              score: timingSuitability.score,
              reasons: timingSuitability.reasons
            });
          }
        }
      }

      // Sort by suitability score
      recommendations.sort((a, b) => b.score - a.score);

      return {
        questionType,
        recommendations: recommendations.slice(0, 5), // Top 5
        generalGuidance: this._generateQuestionTimingGuidance(questionType)
      };
    } catch (error) {
      logger.error('Error finding question timing:', error.message);
      return { error: 'Unable to calculate auspicious question timing' };
    }
  }

  /**
   * Cast horary chart at the moment when question was asked
   * @private
   */
  async _castHoraryChart(year, month, day, hour, minute, latitude, longitude, timezone) {
    const horaryChart = {
      planets: {},
      houses: [],
      ascendant: {},
      risingSign: '',
      significators: []
    };

    // Calculate Julian Day for question time
    const jd = this._dateToJulianDay(year, month, day, hour + minute / 60 - timezone);

    // Calculate planetary positions at question time
    const planetIds = {
      sun: sweph.SE_SUN, moon: sweph.SE_MOON, mars: sweph.SE_MARS,
      mercury: sweph.SE_MERCURY, jupiter: sweph.SE_JUPITER,
      venus: sweph.SE_VENUS, saturn: sweph.SE_SATURN,
      uranus: sweph.SE_URANUS, neptune: sweph.SE_NEPTUNE, pluto: sweph.SE_PLUTO,
      rahu: sweph.SE_TRUE_NODE, ketu: sweph.SE_MEAN_APOG
    };

    for (const [planetName, planetId] of Object.entries(planetIds)) {
      const position = sweph.calc(jd, planetId, sweph.SEFLG_SIDEREAL);
      if (position && Array.isArray(position.longitude)) {
        horaryChart.planets[planetName] = {
          longitude: position.longitude[0],
          sign: Math.floor(position.longitude[0] / 30) + 1,
          house: 0, // Will be calculated after houses
          dignity: this._assessPlanetaryDignity(planetName, position.longitude[0])
        };
      }
    }

    // Calculate houses (Placidus system for horary)
    const houses = sweph.houses(jd, latitude, longitude, 'P'); // Placidus

    horaryChart.ascendant = {
      longitude: houses.ascendant,
      sign: Math.floor(houses.ascendant / 30) + 1,
      degree: houses.ascendant % 30
    };

    horaryChart.risingSign = this._getSignName(horaryChart.ascendant.sign);
    horaryChart.houses = houses.houseCusps.map((cuspid, index) => ({
      number: index + 1,
      longitude: cuspid,
      sign: Math.floor(cuspid / 30) + 1
    }));

    // Assign houses to planets
    Object.keys(horaryChart.planets).forEach(planet => {
      if (horaryChart.planets[planet] && horaryChart.planets[planet].longitude !== undefined) {
        horaryChart.planets[planet].house = this._getHouseForLongitude(
          horaryChart.planets[planet].longitude,
          houses.ascendant,
          houses.houseCusps
        );
      }
    });

    return horaryChart;
  }

  /**
   * Identify significators for the question
   * @private
   */
  _identifyQuestionSignificators(question, horaryChart) {
    const significators = {
      questionRuler: '',
      querent: '',        // Question asker (usually ascendant ruler)
      quesited: '',       // Answer/outcome (varies by question type)
      timingRuler: '',    // Timing (usually moon)
      significatorPlanets: []
    };

    // Determine question category and appropriate significators
    const questionCategory = this._categorizeQuestion(question);
    significators.questionCategory = questionCategory;

    // Ascendant lord is usually the querent (question asker)
    const ascendantSign = horaryChart.ascendant.sign;
    significators.querent = this._getSignLord(ascendantSign);

    // Question ruler based on category and house
    significators.questionRuler = this._getQuestionRuler(questionCategory, horaryChart);

    // Quesited (answer) based on question type
    significators.quesited = this._getQuesited(questionCategory, horaryChart);

    // Moon is timing significator
    significators.timingRuler = 'moon';

    // Collect all significator planets
    significators.significatorPlanets = [
      significators.questionRuler,
      significators.querent,
      significators.quesited,
      significators.timingRuler
    ].filter((planet, index, arr) => arr.indexOf(planet) === index); // Remove duplicates

    return significators;
  }

  /**
   * Analyze the question ruler's strength and placement
   * @private
   */
  _analyzeQuestionRuler(questionRuler, horaryChart) {
    if (!questionRuler || !horaryChart.planets[questionRuler]) {
      return { strength: 0, analysis: 'Unable to analyze question ruler' };
    }

    const rulerData = horaryChart.planets[questionRuler];
    let strength = 0;
    const analysis = {
      rulerPlacement: '',
      dignityStatus: '',
      houseStrength: '',
      positiveFactors: [],
      challengingFactors: []
    };

    // Analyze placement strength
    if (rulerData.house === 1 || rulerData.house === 10 || rulerData.house === 11) {
      strength += 25;
      analysis.houseStrength = 'Excellent - Ruler in kendra (angular) house';
      analysis.positiveFactors.push('Strong position in angular house');
    } else if (rulerData.house === 2 || rulerData.house === 5 || rulerData.house === 9) {
      strength += 20;
      analysis.houseStrength = 'Good - Ruler in trikona (trine) house';
      analysis.positiveFactors.push('Beneficial trine house placement');
    } else if (rulerData.house === 3 || rulerData.house === 6) {
      strength += 10;
      analysis.houseStrength = 'Neutral - Ruler in upachaya (growth) house';
    } else {
      strength -= 5;
      analysis.houseStrength = 'Challenging - Ruler in dussthana (difficult) house';
      analysis.challengingFactors.push('Questionable house position');
    }

    // Analyze dignity
    if (rulerData.dignity.ownSign) {
      strength += 20;
      analysis.dignityStatus = 'Strong - In own sign';
      analysis.positiveFactors.push('Planetary dignity supports positive outcome');
    } else if (rulerData.dignity.exalted) {
      strength += 15;
      analysis.dignityStatus = 'Excellent - Exalted';
      analysis.positiveFactors.push('Exalted position indicates strong possibility');
    } else if (rulerData.dignity.debilitated) {
      strength -= 10;
      analysis.dignityStatus = 'Weak - Debilitated';
      analysis.challengingFactors.push('Debilitated position suggests difficulties');
    }

    // Analyze aspects
    const aspectStrength = this._analyzeRulerAspects(rulerData, horaryChart, questionRuler);
    strength += aspectStrength.score;
    analysis.aspectStrength = aspectStrength.description;

    if (aspectStrength.supporting > aspectStrength.challenging) {
      analysis.positiveFactors.push('Beneficial planetary aspects');
    } else if (aspectStrength.challenging > aspectStrength.supporting) {
      analysis.challengingFactors.push('Challenging planetary aspects');
    }

    // Check retrograde status
    if (rulerData.longitude.speed < 0) {
      strength -= 8;
      analysis.challengingFactors.push('Retrograde motion suggests delays');
    }

    return {
      strength: Math.max(0, Math.min(100, strength)),
      rulerData,
      analysis
    };
  }

  /**
   * Assess timing indications for answer
   * @private
   */
  _assessAnswerTiming(significators, horaryChart) {
    const timing = {
      immediateIndication: '',
      timingIndicators: [],
      answerClarity: '',
      estimatedTimeline: ''
    };

    // Moon's position and aspects indicate timing
    const moonData = horaryChart.planets.moon;

    if (moonData.house === 1 || moonData.house === 4 || moonData.house === 7 || moonData.house === 10) {
      timing.immediateIndication = 'Quick resolution possible';
      timing.timingIndicators.push('Moon in angular house suggests relatively fast answer');
      timing.estimatedTimeline = 'Days to weeks';
    } else if (moonData.house === 2 || moonData.house === 5 || moonData.house === 8 || moonData.house === 11) {
      timing.immediateIndication = 'Moderate timing expected';
      timing.timingIndicators.push('Moon position indicates reasonable timeframe');
      timing.estimatedTimeline = 'Weeks to months';
    } else {
      timing.immediateIndication = 'Delayed response indicated';
      timing.timingIndicators.push('Moon in cadent house suggests longer timeframe');
      timing.estimatedTimeline = 'Months or longer';
    }

    // Question ruler speed affects timing
    if (horaryChart.planets[significators.questionRuler]) {
      const rulerSpeed = horaryChart.planets[significators.questionRuler].longitude.speed || 0;
      if (rulerSpeed > 0.8) {
        timing.timingIndicators.push('Fast-moving question ruler suggests quicker resolution');
      } else if (rulerSpeed < -0.5) {
        timing.timingIndicators.push('Retrograde motion may delay the answer');
      }
    }

    // Determine answer clarity
    if (timing.immediateIndication.includes('Quick') || timing.timingIndicators.some(t => t.includes('fast'))) {
      timing.answerClarity = 'Relatively clear timeframe indicated';
    } else {
      timing.answerClarity = 'Timing may be uncertain - watch for developments';
    }

    return timing;
  }

  /**
   * Generate detailed question interpretation
   * @private
   */
  _generateQuestionInterpretation(question, horaryChart, significators) {
    const interpretation = {
      overallIndication: '',
      detailedAnalysis: [],
      caveats: [],
      confidence: '',
      answerTrends: []
    };

    // Assess overall positive/negative indications
    const positiveScores = this._calculatePositiveIndicators(horaryChart, significators);
    const negativeScores = this._calculateNegativeIndicators(horaryChart, significators);

    if (positiveScores.total > negativeScores.total) {
      interpretation.overallIndication = `Generally positive indications for: ${question}`;

      if (positiveScores.questionRuler + positiveScores.querent > 2) {
        interpretation.detailedAnalysis.push('Question ruler and querent show favorable positions');
      }

      interpretation.answerTrends = [
        'Positive developments likely within indicated timeframe',
        'Supportive planetary configurations suggest favorable outcome',
        'Question has basis for positive resolution'
      ];

    } else if (negativeScores.total > positiveScores.total) {
      interpretation.overallIndication = `Challenging indications for: ${question}`;

      interpretation.detailedAnalysis.push('Several challenging factors present in the chart');
      interpretation.caveats.push('Consult additional timing and remedial measures');
      interpretation.answerTrends = [
        'Significant obstacles indicated - patience required',
        'Outcome may be delayed or modified',
        'Consider alternative approaches or timing'
      ];

    } else {
      interpretation.overallIndication = `Mixed/neutral indications for: ${question}`;

      interpretation.detailedAnalysis.push('Balanced chart suggests conditional outcome');
      interpretation.caveats.push('Outcome depends on external factors and timing');
      interpretation.answerTrends = [
        'Partial success possible with proper effort',
        'Waiting and reassessment may be beneficial',
        'Consider seeking additional guidance'
      ];
    }

    // Add general caveats for horary
    interpretation.caveats.push(
      'Horary charts are snapshots - actual outcomes may be influenced by free will',
      'Chart represents question state at moment asked - circumstances may change'
    );

    return interpretation;
  }

  /**
   * Calculate answer probability and confidence
   * @private
   */
  _calculateAnswerProbability(horaryChart, significators, questionRulerAnalysis) {
    const probability = {
      overall: 0,
      breakdown: {},
      confidence: '',
      reliability: '',
      influencingFactors: []
    };

    // Base probability on question ruler strength
    let baseProbability = questionRulerAnalysis.strength;

    // Adjust based on chart reliability
    const chartReliability = this._assessChartReliability(horaryChart);
    baseProbability *= chartReliability / 100;

    // Adjust based on question appropriateness
    const questionAppropriateness = this._assessQuestionAppropriateness(significators.questionCategory);
    baseProbability *= questionAppropriateness / 100;

    // Adjust based on significator harmony
    const significatorHarmony = this._calculateSignificatorHarmony(significators, horaryChart);
    baseProbability = Math.round((baseProbability + significatorHarmony.score) / 2);

    probability.overall = Math.max(0, Math.min(100, baseProbability));

    probability.breakdown = {
      questionRuler: questionRulerAnalysis.strength,
      chartReliability: chartReliability,
      questionAppropriateness: questionAppropriateness,
      significatorHarmony: significatorHarmony.score
    };

    // Determine confidence level
    if (probability.overall >= 75) {
      probability.confidence = 'High';
      probability.reliability = 'Strong indications with reliable chart';
    } else if (probability.overall >= 60) {
      probability.confidence = 'Moderate';
      probability.reliability = 'Reasonable assessment with some uncertainty';
    } else if (probability.overall >= 40) {
      probability.confidence = 'Low-Moderate';
      probability.reliability = 'Mixed signals - further assessment recommended';
    } else {
      probability.confidence = 'Low';
      probability.reliability = 'Uncertain indications - consider alternative methods';
    }

    return probability;
  }

  /**
   * Provide additional guidance if answer is uncertain
   * @private
   */
  _provideAdditionalGuidance(probabilityAssessment, horaryChart) {
    const guidance = {
      recommendedActions: [],
      additionalConsiderations: [],
      alternativeApproaches: []
    };

    if (probabilityAssessment.confidence === 'Low') {
      guidance.recommendedActions = [
        'Rephrase the question more specifically',
        'Wait 24-48 hours before asking again if appropriate',
        'Consider consulting additional astrological methods'
      ];

      guidance.additionalConsiderations = [
        'Chart may be too early in lunar cycle',
        'Question may be asked at an inappropriate time',
        'Additional planetary activity occurring'
      ];

      guidance.alternativeApproaches = [
        'Birth chart analysis for general tendencies',
        'Transit analysis for current planetary influences',
        'Consider professional astrological consultation'
      ];
    } else if (probabilityAssessment.confidence === 'Moderate') {
      guidance.recommendedActions = [
        'Monitor developments in coming weeks',
        'Take reasonable actions based on indications',
        'Recast question in 2-3 weeks if needed'
      ];

      guidance.additionalConsiderations = [
        'Answer may depend on external factors',
        'Timing influences the final outcome',
        'Personal effort plays significant role'
      ];
    } else {
      guidance.recommendedActions = [
        'Proceed with actions based on chart indications',
        'Take advantage of favorable timing',
        'Follow through with intended plans'
      ];
    }

    return guidance;
  }

  /**
   * Generate comprehensive horary summary
   * @private
   */
  _generateHorarySummary(interpretation, probabilityAssessment, timingAnalysis) {
    let summary = '❓ *Horary Question Analysis*\n\n';

    summary += `*Overall Indication:* ${interpretation.overallIndication}\n\n`;

    summary += '*Answer Probability:*\n';
    summary += `• Overall: ${probabilityAssessment.overall}%\n`;
    summary += `• Confidence: ${probabilityAssessment.confidence}\n`;
    summary += `• Reliability: ${probabilityAssessment.reliability}\n\n`;

    summary += '*Timing Analysis:*\n';
    summary += `• ${timingAnalysis.immediateIndication}\n`;
    summary += `• Estimated timeline: ${timingAnalysis.estimatedTimeline}\n\n`;

    summary += '*Key Answer Trends:*\n';
    interpretation.answerTrends.forEach(trend => {
      summary += `• ${trend}\n`;
    });

    if (interpretation.caveats.length > 0) {
      summary += '\n*Important Caveats:*\n';
      interpretation.caveats.forEach(caveat => {
        summary += `• ${caveat}\n`;
      });
    }

    summary += '\n*Horary astrology analyzes questions at the moment asked to provide guidance on outcomes and timing.*';

    return summary;
  }

  // Helper methods for complex calculations
  _categorizeQuestion(question) {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('marry') || lowerQuestion.includes('marriage') || lowerQuestion.includes('relationship')) {
      return 'relationship';
    } else if (lowerQuestion.includes('job') || lowerQuestion.includes('career') || lowerQuestion.includes('business')) {
      return 'career';
    } else if (lowerQuestion.includes('money') || lowerQuestion.includes('financial') || lowerQuestion.includes('investment')) {
      return 'financial';
    } else if (lowerQuestion.includes('health') || lowerQuestion.includes('medical') || lowerQuestion.includes('illness')) {
      return 'health';
    } else if (lowerQuestion.includes('legal') || lowerQuestion.includes('court') || lowerQuestion.includes('lawsuit')) {
      return 'legal';
    } else if (lowerQuestion.includes('lost') || lowerQuestion.includes('missing') || lowerQuestion.includes('find')) {
      return 'lost_items';
    } else {
      return 'general';
    }
  }

  _getQuestionRuler(category, horaryChart) {
    const categoryHouses = {
      relationship: [5, 7, 11],  // 5th (love), 7th (marriage), 11th (friends)
      career: [6, 10],           // 6th (service), 10th (career)
      financial: [2, 11],        // 2nd (wealth), 11th (gains)
      health: [1, 6, 8, 12],     // 1st (body), 6th/8th/12th (health)
      legal: [6, 9, 12],         // 6th (enemies), 9th (law), 12th (imprisonment)
      lost_items: [2, 12],       // 2nd (missing), 12th (loss/hidden)
      general: [1, 7, 9]         // 1st (general), 7th (others), 9th (guidance)
    };

    const houses = categoryHouses[category] || categoryHouses.general;

    // Look for planets in relevant houses
    for (const [planet, data] of Object.entries(horaryChart.planets)) {
      if (houses.includes(data.house)) {
        return planet;
      }
    }

    // Fallback to house lords
    return this._getSignLord(horaryChart.houses[houses[0] - 1]?.sign || 1);
  }

  _getQuesited(category, horaryChart) {
    const quesitedHouses = {
      relationship: [7],       // 7th house ruler for partner
      career: [10],            // 10th house ruler for career achievement
      financial: [11],         // 11th house ruler for gains
      health: [8],             // 8th house ruler for health issues
      legal: [6],              // 6th house ruler for opponents/enemies
      lost_items: [4],         // 4th house ruler for hidden matters
      general: [9]             // 9th house ruler for guidance
    };

    const house = quesitedHouses[category]?.[0] || 9;
    return this._getSignLord(horaryChart.houses[house - 1]?.sign || 1);
  }

  _analyzeRulerAspects(rulerData, horaryChart, questionRuler) {
    // Simplified aspect analysis for ruler
    let supportingAspects = 0;
    let challengingAspects = 0;

    // Check major aspects from other planets
    Object.entries(horaryChart.planets).forEach(([planet, data]) => {
      // Skip the ruler planet itself when analyzing aspects
      if (planet === questionRuler) return;
      if (planet === Object.keys(rulerData).find(key => rulerData[key] === rulerData)) continue;

      const angle = Math.abs(rulerData.longitude - data.longitude);
      const minAngle = Math.min(angle, 360 - angle);

      if (minAngle <= 10) { // Conjunction
        if (['jupiter', 'venus', 'mercury'].includes(planet)) {
          supportingAspects++;
        } else if (['saturn', 'mars', 'rahu'].includes(planet)) {
          challengingAspects++;
        }
      }
    });

    return {
      supporting: supportingAspects,
      challenging: challengingAspects,
      description: supportingAspects > challengingAspects ? 'Mostly supportive aspects' :
                   challengingAspects > supportingAspects ? 'Some challenging aspects' : 'Mixed aspects',
      score: (supportingAspects - challengingAspects) * 5
    };
  }

  async _assessQuestionTiming(questionDateTime, questionType, latitude, longitude, timezone) {
    const year = questionDateTime.getFullYear();
    const month = questionDateTime.getMonth() + 1;
    const day = questionDateTime.getDate();
    const hour = questionDateTime.getHours();
    const minute = questionDateTime.getMinutes();

    const chart = await this._castHoraryChart(year, month, day, hour, minute, latitude, longitude, timezone);
    const significators = {
      questionCategory: this._categorizeQuestion(questionType),
      querent: this._getSignLord(chart.ascendant.sign)
    };

    const rulerAnalysis = this._analyzeQuestionRuler(significators.querent, chart);

    let score = rulerAnalysis.strength;
    let reasons = [];

    if (chart.ascendant.sign !== this._getSignOfPlanet(chart.planets.moon.longitude)) {
      reasons.push('Moon not in ascendant - generally favorable');
    }

    if ([1, 4, 7, 10].includes(chart.planets.moon.house)) {
      score += 10;
      reasons.push('Moon in angular house');
    }

    if (chart.planets[significators.querent]?.house === 1) {
      score += 15;
      reasons.push('Question lord well placed');
    }

    const rating = score >= 70 ? 'Excellent' : score >= 55 ? 'Good' : score >= 35 ? 'Fair' : 'Poor';

    return { rating, score, reasons };
  }

  _generateQuestionTimingGuidance(questionType) {
    const guidance = {
      relationship: 'Best to ask during Venus or Moon periods. Avoid conflict times.',
      career: 'Mercury or Sun periods are most favorable for career questions.',
      financial: 'Jupiter periods work well for financial inquiries.',
      health: 'Moon or Sun periods are appropriate for health questions.',
      legal: 'Sun or Saturn periods are suitable for legal matters.',
      general: 'Clear mind and focused intention improve answer accuracy.'
    };

    return guidance[questionType] || guidance.general;
  }

  // Additional helper methods
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
    return 1; // Default to first house
  }

  _assessPlanetaryDignity(planet, longitude) {
    // Simplified dignity assessment
    return {
      ownSign: false,     // Would check if planet is in its own sign
      exalted: false,     // Would check exaltation degrees
      debilitated: false, // Would check debilitation degrees
      friendlySign: true  // Assume neutral for simplicity
    };
  }

  _getSignOfPlanet(longitude) {
    return Math.floor(longitude / 30) + 1;
  }

  _calculatePositiveIndicators(horaryChart, significators) {
    let total = 0;
    let questionRuler = 0;
    let querent = 0;

    // Check question ruler position
    if (horaryChart.planets[significators.questionRuler]) {
      const ruler = horaryChart.planets[significators.questionRuler];
      if ([1, 5, 9, 10].includes(ruler.house)) {
        questionRuler = 2;
      }
    }

    // Check querent position
    if (horaryChart.planets[significators.querent]) {
      const querentPlanet = horaryChart.planets[significators.querent];
      if ([1, 4, 5, 7, 9].includes(querentPlanet.house)) {
        querent = 2;
      }
    }

    total = questionRuler + querent;
    return { total, questionRuler, querent };
  }

  _calculateNegativeIndicators(horaryChart, significators) {
    let total = 0;
    let problematicPositions = 0;

    // Check for planets in bad houses
    Object.entries(horaryChart.planets).forEach(([planet, data]) => {
      if ([6, 8, 12].includes(data.house)) {
        problematicPositions++;
      }
    });

    total = Math.min(problematicPositions, 3);
    return { total, problematicPositions };
  }

  _assessChartReliability(horaryChart) {
    // Assess if horary chart is suitable for answer
    let reliability = 50;

    // Moon void of course check (simplified)
    const moonHouse = horaryChart.planets.moon.house;
    if ([4, 8, 12].includes(moonHouse)) { // Cadent houses sometimes suggest void periods
      reliability -= 20;
    }

    // Strong significators add reliability
    if (horaryChart.planets[horaryChart.ascendant.sign]) {
      reliability += 15;
    }

    return Math.max(0, Math.min(100, reliability));
  }

  _assessQuestionAppropriateness(questionCategory) {
    // Some questions are more suitable for horary than others
    const appropriatenessByCategory = {
      relationship: 85,  // Good for horary
      health: 80,        // Good for horary
      lost_items: 90,    // Excellent for horary
      career: 75,        // Reasonable for horary
      financial: 70,     // More conditional
      legal: 65,         // More conditional
      general: 60        // Less specific
    };

    return appropriatenessByCategory[questionCategory] || 60;
  }

  _calculateSignificatorHarmony(significators, horaryChart) {
    // Check if significators work together harmoniously
    const planets = significators.significatorPlanets;

    if (planets.length < 2) return { score: 50, description: 'Single significator' };

    let harmoniousAspects = 0;
    let conflictingAspects = 0;

    // Check aspects between significators
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = horaryChart.planets[planets[i]];
        const planet2 = horaryChart.planets[planets[j]];

        if (planet1 && planet2) {
          const angle = Math.abs(planet1.longitude - planet2.longitude);
          const minAngle = Math.min(angle, 360 - angle);

          if (minAngle <= 15) { // Close conjunction or aspect
            if (planets[i] === planets[j] || Math.abs(minAngle - 60) <= 10 || Math.abs(minAngle - 120) <= 10) {
              harmoniousAspects++;
            } else {
              conflictingAspects++;
            }
          }
        }
      }
    }

    const score = harmoniousAspects > conflictingAspects ? 70 : conflictingAspects > harmoniousAspects ? 30 : 50;
    return {
      score,
      description: harmoniousAspects > conflictingAspects ? 'Harmonious significators' :
                   conflictingAspects > harmoniousAspects ? 'Conflicting significators' : 'Mixed significator relationships'
    };
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

module.exports = PrashnaCalculator;