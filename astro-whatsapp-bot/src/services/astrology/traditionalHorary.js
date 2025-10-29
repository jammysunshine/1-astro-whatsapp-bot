/**
 * Traditional Horary Astrology - Divine Question Answering
 * Classic Hellenistic and Indian horary methods for precise question resolution
 */

const logger = require('../../utils/logger');
const sweph = require('sweph');

class TraditionalHorary {
  constructor() {
    logger.info('Module: TraditionalHorary loaded - Classic Hellenistic & Indian Horary Methods');
    this.initializeHorarySystem();
  }

  /**
   * Initialize horary systems with classical rules and methodologies
   */
  initializeHorarySystem() {
    // House rulerships by traditional astrology
    this.houseRulerships = {
      1: { name: 'Ascendant', matters: ['self', 'appearance', 'personality', 'first impressions'] },
      2: { name: '2nd House', matters: ['money', 'possessions', 'family', 'speech', 'food'] },
      3: { name: '3rd House', matters: ['siblings', 'communication', 'neighbors', 'short journeys', 'courage'] },
      4: { name: '4th House', matters: ['home', 'mother', 'property', 'endings', 'emotional foundation'] },
      5: { name: '5th House', matters: ['children', 'creativity', 'speculation', 'entertainment', 'intelligence'] },
      6: { name: '6th House', matters: ['health', 'service', 'enemies', 'debts', 'daily work'] },
      7: { name: '7th House', matters: ['partners', 'marriage', 'legal matters', 'open enemies'] },
      8: { name: '8th House', matters: ['death', 'transformations', 'other people\'s money', 'secret matters'] },
      9: { name: '9th House', matters: ['long journeys', 'higher learning', 'philosophy', 'religion', 'luck'] },
      10: { name: '10th House', matters: ['career', 'reputation', 'authority', 'government', 'honor'] },
      11: { name: '11th House', matters: ['friends', 'hopes', 'wishes', 'gains', 'elder siblings'] },
      12: { name: '12th House', matters: ['expenses', 'foreign lands', 'losses', 'imprisonment', 'hidden enemies'] }
    };

    // Matter-to-house mapping for common questions
    this.matterHouses = {
      // Career questions
      'job': 10, 'career': 10, 'profession': 10, 'promotion': 10, 'business': 10, 'work': 6,
      // Money questions
      'money': 2, 'wealth': 2, 'salary': 2, 'payment': 2, 'debt': 6, 'loan': 2,
      // Relationship questions
      'marriage': 7, 'relationship': 7, 'partner': 7, 'divorce': 7, 'dating': 7,
      // Health questions
      'health': 6, 'sickness': 6, 'disease': 6, 'surgery': 6, 'medical': 6,
      // Travel questions
      'travel': 3, 'journey': 3, 'move': 3, 'vacation': 9,
      // Property questions
      'house': 4, 'property': 4, 'land': 4, 'home': 4,
      // Education questions
      'education': 9, 'study': 3, 'exams': 3, 'learning': 9,
      // Legal questions
      'court': 7, 'legal': 7, 'lawsuit': 7, 'court case': 7,
      // Children questions
      'children': 5, 'pregnancy': 5, 'childbirth': 5,
      // Other common questions
      'lost item': 2, 'theft': 2, 'missing': 2, 'secret': 8, 'occult': 8
    };

    // Planetary significators and types
    this.planetaryTypes = {
      sun: { nature: 'benefic', rulership: 'soul', periods: ['day'], strength: 'medial' },
      moon: { nature: 'benefic', rulership: 'mind', periods: ['night'], strength: 'fast' },
      mars: { nature: 'malefic', rulership: 'action', periods: ['day'], strength: 'medium' },
      mercury: { nature: 'neutral', rulership: 'communication', periods: ['day', 'night'], strength: 'medium' },
      jupiter: { nature: 'benefic', rulership: 'wisdom', periods: ['day'], strength: 'slow' },
      venus: { nature: 'benefic', rulership: 'luxury', periods: ['night'], strength: 'slow' },
      saturn: { nature: 'malefic', rulership: 'karma', periods: ['day'], strength: 'slow' },
      rahu: { nature: 'neutral', rulership: 'karma', periods: ['day'], strength: 'karmic' },
      ketu: { nature: 'neutral', rulership: 'liberation', periods: ['night'], strength: 'karmic' }
    };

    // Dignity states of planets
    this.dignities = {
      domicile_ruler: { description: 'Strong benefic', score: 5, nature: 'benefic' },
      exaltation: { description: 'Maximum strength', score: 4, nature: 'benefic' },
      triplicity: { description: 'Good strength', score: 3, nature: 'neutral' },
      term: { description: 'Moderate strength', score: 2, nature: 'neutral' },
      face: { description: 'Weak strength', score: 1, nature: 'neutral' },
      detriment: { description: 'Hindered', score: -1, nature: 'malefic' },
      fall: { description: 'Weakened', score: -2, nature: 'malefic' },
      peregrine: { description: 'Neutral', score: 0, nature: 'neutral' }
    };

    // Chart perfection rules
    this.perfectionRules = {
      lord_of_house_1: { weight: 3, description: 'Questioner well-disposed' },
      reception: { weight: 2, description: 'Mutual rulership indicates cooperation' },
      swift_planets: { weight: 1, description: 'Fast movement indicates quick resolution' },
      angular_houses: { weight: 2, description: 'Strong house position' },
      oriental_planets: { weight: 1, description: 'East of Sun indicates self-elevation' },
      hayz: { weight: -3, description: 'Benefic and malefic together indicate invalidity' }
    };
  }

  /**
   * Cast horary chart for a question at specific moment
   * @param {Object} questionData - Question, timing, location
   * @returns {Object} Horary analysis results
   */
  async castHoraryChart(questionData) {
    try {
      const { question, questionTime, questionLocation, user } = questionData;

      // Parse question timing
      const questionMoment = this.parseQuestionTime(questionTime);
      const julianDay = this.dateToJulianDay(questionMoment);

      // Calculate chart
      const chart = await this.calculateHoraryChart(julianDay, questionLocation);

      // Analyze the question
      const questionAnalysis = this.analyzeQuestion(question, chart);

      // Generate answer based on rules
      const answer = this.generateHoraryAnswer(chart, questionAnalysis);

      return {
        question: question,
        chart: chart,
        analysis: questionAnalysis,
        answer: answer,
        timing: this.estimateTiming(chart),
        cautions: this.getCautions(chart, questionAnalysis),
        summary: this.generateHorarySummary(question, answer, chart)
      };
    } catch (error) {
      logger.error('Error casting horary chart:', error);
      return {
        error: `Horary chart casting failed: ${error.message}`,
        recommendations: ['Traditional horary requires precise timing and proper question formulation']
      };
    }
  }

  /**
   * Calculate horary chart at specific JD
   * @private
   */
  async calculateHoraryChart(julianDay, location = { lat: 28.6139, lng: 77.2090 }) {
    const planets = {};
    const houses = {};

    // Calculate planetary positions
    const planetList = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
    for (const planet of planetList) {
      const result = sweph.calc(julianDay, this.getPlanetId(planet), sweph.FLG_SWIEPH | sweph.FLG_SIDEREAL);
      if (result.longitude) {
        const longitude = result.longitude[0];
        planets[planet.charAt(0).toUpperCase() + planet.slice(1)] = {
          longitude,
          sign: this.longitudeToSign(longitude),
          house: await this.longitudeToHoraryHouse(longitude, julianDay, location),
          speed: result.speed ? result.speed[0] : 0,
          dignity: this.assessDignity(planet.toLowerCase(), longitude),
          oriental: this.isOriental(planet.toLowerCase(), longitude, julianDay)
        };
      }
    }

    // Lunar nodes (special for horary)
    planets.Rahu = { special: 'north_node', significance: 'worldly_karma' };
    planets.Ketu = { special: 'south_node', significance: 'spiritual_karma' };

    // Calculate houses using Equal House System (traditional for horary)
    const cusps = new Array(13);
    sweph.houses(julianDay, location.lat, location.lng, 'E', cusps);
    const ascendant = cusps[0];

    for (let i = 1; i <= 12; i++) {
      houses[i] = {
        cusp: cusps[i - 1],
        sign: this.longitudeToSign(cusps[i - 1]),
        ruler: this.getRulerOfSign(this.longitudeToSign(cusps[i - 1]))
      };
    }

    return {
      planets,
      houses,
      ascendant: {
        longitude: ascendant,
        sign: this.longitudeToSign(ascendant),
        degree: this.longitudeToDegree(ascendant)
      },
      chartType: 'horary',
      calculatedAt: new Date().toISOString()
    };
  }

  /**
   * Analyze the question and determine rulerships
   * @private
   */
  analyzeQuestion(question, chart) {
    const questionLower = question.toLowerCase();

    // Determine primary house of the question
    const primaryHouse = this.determineQuestionHouse(questionLower);

    // Find rulers of the question
    const querentRuler = chart.houses[1].ruler; // 1st house ruler = querent
    const quesiredRuler = chart.houses[primaryHouse].ruler; // House ruler = what is asked about

    // Assess dignities
    const querentDignity = chart.planets[querentRuler]?.dignity || 'peregrine';
    const quesiredDignity = chart.planets[quesiredRuler]?.dignity || 'peregrine';

    // Check mutual reception
    const receptionCheck = this.checkMutualReception(querentRuler, quesiredRuler, chart);

    // Moon's condition (crucial in horary)
    const moonCondition = this.assessMoonCondition(chart);

    return {
      primaryHouse,
      querentRuler,
      quesiredRuler,
      querentDignity,
      quesiredDignity,
      mutualReception: receptionCheck,
      moonCondition,
      questionCategory: this.categorizeQuestion(questionLower),
      isProperQuestion: this.validateQuestion(questionLower)
    };
  }

  /**
   * Generate horary answer based on classical rules
   * @private
   */
  generateHoraryAnswer(chart, analysis) {
    let yesScore = 0;
    let noScore = 0;
    let factors = [];

    const { querentRuler, quesiredRuler, moonCondition } = analysis;

    // 1. Moon applying to querent ruler - very positive
    if (moonCondition.applyingTo === querentRuler) {
      yesScore += 4;
      factors.push('Moon applying to querent ruler - strong positive indication');
    }

    // 2. Querent ruler in good house relative to quesited
    if (analysis.primaryHouse) {
      const querentInQuestionHouse = chart.planets[querentRuler]?.house === analysis.primaryHouse;
      if (querentInQuestionHouse) {
        yesScore += 3;
        factors.push('Querent ruler occupying question house - direct connection');
      }
    }

    // 3. Mutual reception between rulers
    if (analysis.mutualReception.exists) {
      yesScore += 3;
      factors.push('Mutual reception between querent and quesited rulers - cooperation');
    }

    // 4. Dignity assessments
    if (this.dignities[analysis.querentDignity].score > 0) {
      yesScore += 2;
      factors.push(`Querent ruler in ${analysis.querentDignity} - favorable strength`);
    }

    if (this.dignities[analysis.quesiredDignity].score > 0) {
      yesScore += 2;
      factors.push(`Quesited ruler in ${analysis.quesiredDignity} - subject well-disposed`);
    }

    // 5. Moon's aspects
    if (moonCondition.aspectingBenefic) {
      yesScore += 2;
      factors.push('Moon aspecting or conjunct benefic - favorable mood');
    }

    if (moonCondition.aspectingMalefic) {
      noScore += 2;
      factors.push('Moon aspecting malefic - hindering influence');
    }

    // 6. House positions - angular better than succedent than cadent
    const querentHouseStrength = this.getHouseStrength(chart.planets[querentRuler]?.house);
    const quesitedHouseStrength = this.getHouseStrength(chart.planets[quesiredRuler]?.house);

    yesScore += querentHouseStrength;
    yesScore += quesitedHouseStrength / 2; // Quesited strength counts less

    // Determine answer
    let determination, confidence;

    if (yesScore >= 8) {
      determination = 'YES';
      confidence = 'High';
    } else if (yesScore >= 5) {
      determination = 'YES';
      confidence = 'Moderate';
    } else if (noScore >= 5) {
      determination = 'NO';
      confidence = 'Moderate';
    } else {
      determination = 'UNCERTAIN';
      confidence = 'Low';
    }

    return {
      determination,
      confidence,
      yesScore,
      noScore,
      totalScore: yesScore - noScore,
      factors,
      methodology: 'Classical horary astrology using Bonatti, Lilly, and Indian traditions'
    };
  }

  /**
   * Estimate timing of outcome based on planetary speeds
   * @private
   */
  estimateTiming(chart) {
    const moon = chart.planets.Moon;
    if (!moon) return { estimate: 'uncertain', reasoning: 'Moon position unclear' };

    let timingDays = 0;
    const moonSpeed = Math.abs(moon.speed) * 24 * 60 * 60; // Convert degrees/day to degrees/second

    // Moon's next major aspect determines timing
    if (moon.house <= 3) {
      timingDays = Math.floor(28 / moonSpeed); // New moon cycle
    } else if (moon.house >= 7 && moon.house <= 9) {
      timingDays = Math.floor(21 / moonSpeed); // Waning phase
    } else {
      timingDays = Math.floor(14 / moonSpeed); // General transit
    }

    // Swift planets indicate faster results
    const swiftPlanetsStrong = Object.values(chart.planets).some(p =>
      p.speed > 1 && this.getHouseStrength(p.house) >= 2
    );

    if (swiftPlanetsStrong) timingDays = Math.floor(timingDays * 0.7);

    return {
      estimate: `${timingDays} days`,
      range: `Approximately ${Math.max(1, timingDays - 7)} to ${timingDays + 7} days`,
      factors: swiftPlanetsStrong ? ['Swift planets indicate faster resolution'] : ['Normal timing']
    };
  }

  /**
   * Get cautions and warnings for the horary
   * @private
   */
  getCautions(chart, analysis) {
    const cautions = [];

    // Check for hayz (benefic and malefic conjunct or opposing)
    const hayzCheck = this.checkForHayz(chart);
    if (hayzCheck.present) {
      cautions.push('Hayz configuration present - question may be invalid or stalled');
    }

    // Check querent vs quesited dignity difference
    const dignityDiff = this.dignities[analysis.querentDignity]?.score -
                       this.dignities[analysis.quesiredDignity]?.score;

    if (Math.abs(dignityDiff) > 2) {
      cautions.push('Large dignity difference - parties not equally committed');
    }

    // Check for combustion or cazimi
    Object.entries(chart.planets).forEach(([planet, data]) => {
      if (data.longitude && Math.abs(data.longitude - chart.planets.Sun.longitude) < 1) {
        if (Math.abs(data.longitude - chart.planets.Sun.longitude) < 0.1) {
          cautions.push(`${planet} in cazimi with Sun - special cancellation of misfortunes`);
        } else {
          cautions.push(`${planet} combust by Sun - weakened condition`);
        }
      }
    });

    if (!analysis.isProperQuestion) {
      cautions.push('Question does not meet classical horary requirements');
    }

    return cautions.length > 0 ? cautions : ['Horary chart appears valid'];
  }

  /**
   * Generate comprehensive horary summary
   * @private
   */
  generateHorarySummary(question, answer, chart) {
    const moon = chart.planets.Moon;
    const moonSign = moon ? moon.sign : 'unknown';

    return `🔮 *HORARY ANALYSIS FOR: "${question}"*

📊 *Chart Details:*
• Ascendant: ${chart.ascendant.sign} ${chart.ascendant.degree}°
• Moon: ${moonSign} (ruling question outcomes)
• Chart cast: Horary tradition

🎯 *Answer: ${answer.determination}* (${answer.confidence} confidence)
• Score: ${answer.yesScore} yes / ${answer.noScore} no = ${answer.totalScore}

💫 *Key Factors:*
${answer.factors.map(factor => `• ${factor}`).join('\n')}

⏰ *Timing Estimate:* ${answer.timing ? answer.timing.estimate : 'Uncertain'}

⚡ *Traditional Rules Applied:*
• Lilly - Christian Astrology
• Bonatti - Book of Astronomy
• Indian Classical Methods
• Hellenistic Roots

🧿 *Horary Wisdom:*
Perfect questions receive perfect answers at their appointed time. The universe knows your timing. ✨`;
  }

  // Helper methods
  parseQuestionTime(questionTime) {
    // If it's a specific time, use it; otherwise use current time
    if (questionTime) {
      return new Date(questionTime);
    }
    return new Date();
  }

  determineQuestionHouse(question) {
    // Map question keywords to houses
    const words = question.toLowerCase().split(/\s+/);

    for (const word of words) {
      if (this.matterHouses[word]) {
        return this.matterHouses[word];
      }
    }

    // Default fallback based on question type patterns
    if (question.includes('will') || question.includes('should')) {
      return 7; // Relationships/future matters
    } else if (question.includes('when')) {
      return 9; // Future/Wide questions
    } else if (question.includes('money') || question.includes('job')) {
      return 10; // Career/financial
    }

    return 1; // Self matters (fallback)
  }

  categorizeQuestion(question) {
    const q = question.toLowerCase();
    if (q.includes('will') || q.includes('should') || q.includes('can')) {
      return 'Yes/No';
    } else if (q.includes('when') || q.includes('how long')) {
      return 'Timing';
    } else if (q.includes('where') || q.includes('which')) {
      return 'Location/Choice';
    }
    return 'Complex';
  }

  validateQuestion(question) {
    // Basic validation per traditional rules
    const q = question.toLowerCase();

    // Check for disqualifying conditions
    const disqualifiers = [
      'what if', 'why must', 'force', 'inevitable', // Hypothetical
      'never', 'ever', 'always', // Absolute terms
      'death of', 'murder', 'suicide' // Forbidden topics
    ];

    if (disqualifiers.some(d => q.includes(d))) {
      return false;
    }

    // Must be a genuine question you care about
    const questionWords = ['?', 'will', 'should', 'can', 'does', 'is', 'are', 'when', 'where', 'who', 'what', 'how'];
    const hasQuestionMarker = questionWords.some(word => q.includes(word));

    return hasQuestionMarker && question.length > 10;
  }

  dateToJulianDay(date) {
    return Math.floor((date.getTime() / 86400000) + 2440587.5);
  }

  longitudeToSign(longitude) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs[Math.floor(longitude / 30) % 12];
  }

  longitudeToDegree(longitude) {
    return Math.floor(longitude % 30);
  }

  async longitudeToHoraryHouse(longitude, julianDay, location) {
    const cusps = new Array(13);
    sweph.houses(julianDay, location.lat, location.lng, 'E', cusps);
    const ascendant = cusps[0];

    const relativeLongitude = ((longitude - ascendant + 360) % 360);
    return Math.floor(relativeLongitude / 30) + 1;
  }

  getPlanetId(planetName) {
    const ids = {
      sun: sweph.SE_SUN,
      moon: sweph.SE_MOON,
      mars: sweph.SE_MARS,
      mercury: sweph.SE_MERCURY,
      jupiter: sweph.SE_JUPITER,
      venus: sweph.SE_VENUS,
      saturn: sweph.SE_SATURN
    };
    return ids[planetName] || sweph.SE_SUN;
  }

  getRulerOfSign(signName) {
    const rulership = {
      'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury',
      'Cancer': 'Moon', 'Leo': 'Sun', 'Virgo': 'Mercury',
      'Libra': 'Venus', 'Scorpio': 'Mars', 'Sagittarius': 'Jupiter',
      'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
    };
    return rulership[signName] || 'Saturn';
  }

  assessDignity(planet, longitude) {
    // Simplified dignity assessment
    // In full implementation, this would check domicile rulership, exaltation, etc.
    const sign = this.longitudeToSign(longitude);
    const ruler = this.getRulerOfSign(sign);

    if (ruler === planet) {
      return 'domicile_ruler';
    } else if (planet === 'sun' && sign === 'Leo') {
      return 'exaltation';
    } else if (planet === 'moon' && sign === 'Taurus') {
      return 'exaltation';
    }

    return 'peregrine'; // Neutral state
  }

  isOriental(planet, longitude, julianDay) {
    const sunResult = sweph.calc(julianDay, sweph.SE_SUN, sweph.FLG_SWIEPH);
    if (sunResult.longitude) {
      const sunLong = sunResult.longitude[0];
      const diff = ((longitude - sunLong + 360) % 360);
      return diff <= 180; // Within 180 degrees of Sun is oriental
    }
    return false;
  }

  checkMutualReception(ruler1, ruler2, chart) {
    const planet1Pos = chart.planets[ruler1];
    const planet2Pos = chart.planets[ruler2];

    if (!planet1Pos || !planet2Pos) return { exists: false };

    const sign1 = planet1Pos.sign;
    const sign2 = planet2Pos.sign;

    // Check if each rules the other's sign
    const rulerOf1In2 = this.getRulerOfSign(sign1) === ruler2;
    const rulerOf2In1 = this.getRulerOfSign(sign2) === ruler1;

    return {
      exists: rulerOf1In2 && rulerOf2In1,
      description: rulerOf1In2 && rulerOf2In1 ? 'Mutual reception shows cooperation' : 'No mutual reception'
    };
  }

  assessMoonCondition(chart) {
    const moon = chart.planets.Moon;
    if (!moon) return { condition: 'unknown', applyingTo: null };

    // Check moon's next major aspect (simplified)
    // In full implementation, this would calculate applying aspects
    const moonLon = moon.longitude;

    // Simplified: Moon's house position indicates current state
    const condition = moon.house >= 7 ? 'waning' : 'waxing';
    const applyingTo = 'various_planets'; // Would be calculated in full version

    return {
      condition,
      house: moon.house,
      applyingTo,
      aspectingBenefic: moon.house === 9 || moon.house === 5, // Jupiter/Venus areas
      aspectingMalefic: moon.house === 6 || moon.house === 8 // Mars/Saturn areas
    };
  }

  getHouseStrength(houseNum) {
    if (!houseNum) return 0;

    // Angular houses (1,4,7,10) strongest, then succedent (2,5,8,11), then cadent (3,6,9,12)
    const angular = [1, 4, 7, 10];
    const succedent = [2, 5, 8, 11];
    const cadent = [3, 6, 9, 12];

    if (angular.includes(houseNum)) return 2;
    if (succedent.includes(houseNum)) return 1;
    if (cadent.includes(houseNum)) return 0;

    return 0;
  }

  checkForHayz(chart) {
    // Hayz occurs when a benefic and malefic are conjunct or in opposition
    let benefics = [];
    let malefics = [];

    Object.entries(chart.planets).forEach(([planet, data]) => {
      if (data.longitude) {
        const type = this.planetaryTypes[planet.toLowerCase()]?.nature;
        if (type === 'benefic') benefics.push(data.longitude);
        else if (type === 'malefic') malefics.push(data.longitude);
      }
    });

    // Check for conjunctions or oppositions
    let hayzPresent = false;
    for (const ben of benefics) {
      for (const mal of malefics) {
        const diff = Math.abs(ben - mal) % 360;
        if (diff <= 10 || Math.abs(diff - 180) <= 10) { // 10° orb
          hayzPresent = true;
          break;
        }
      }
      if (hayzPresent) break;
    }

    return {
      present: hayzPresent,
      description: hayzPresent ? 'Benefic-malefic conjunction indicates conflicting forces' : 'No hayz configuration'
    };
  }

  /**
   * Get complete horary astrology catalog
   * @returns {Object} Horary service information
   */
  getHoraryCatalog() {
    return {
      methodologies: ['Hellenistic', 'Persian', 'Indian Classical', 'Renaissance European'],
      keyAuthours: ['Bonatti', 'Lilly', 'Masha\'allah', 'Indian Classical Texts'],
      houseSystem: 'Equal House (traditional for horary)',
      timingMethods: ['Moon phase', 'Planetary speeds', 'Aspect perfection'],
      prohibitionRules: 'Certain questions forbidden by tradition',
      validationMethods: 'Hayz check, reception analysis, dignity assessment',
      answerTypes: ['Yes/No', 'Timing', 'Location', 'Choice', 'Complex multiple answers']
    };
  }
}

module.exports = { TraditionalHorary };