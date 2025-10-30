const logger = require('../../utils/logger');

/**
 * Traditional Horary Astrology Service
 * Casts horary charts at the exact moment of a question for divine guidance
 */
class TraditionalHorary {
  constructor() {
    this.houses = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

    // Traditional house significations
    this.houseMeanings = {
      1: 'Questioner, their state of mind, physical appearance',
      2: 'Money, resources, possessions, what the querent has',
      3: 'Communication, siblings, short journeys, education',
      4: 'Home, parents, property, end of matters',
      5: 'Children, creative projects, pleasure, speculation',
      6: 'Health, service, employment, communication of servants',
      7: 'Marriage, partnerships, business partners, enemies',
      8: 'Death, occult, transformation, other people\'s money',
      9: 'Philosophy, religion, long journeys, higher learning',
      10: 'Career, reputation, public life, authority figures',
      11: 'Friends, hopes, wishes, gain through society',
      12: 'Spirituality, hospitals, confinement, hidden matters'
    };
  }

  /**
   * Cast a horary chart for a specific question
   * @param {Object} questionData - Question and timing data
   * @returns {Object} Horary analysis
   */
  async castHoraryChart(questionData) {
    try {
      const { question, questionTime, questionLocation, user } = questionData;

      // Use current time as the chart time (question asked moment)
      const chartTime = new Date(questionTime);

      // Create analysis using traditional horary principles
      const analysis = this.analyzeHoraryQuestion(question, chartTime, questionLocation);

      return {
        summary: analysis.summary,
        question,
        answer: analysis.answer,
        timing: analysis.timing,
        confidence: analysis.confidence
      };
    } catch (error) {
      logger.error('Error casting horary chart:', error);
      return {
        error: error.message,
        summary: 'Unable to cast horary chart at this time. Please try again.'
      };
    }
  }

  /**
   * Analyze a horary question using traditional principles
   * @param {string} question - User's question
   * @param {Date} chartTime - Moment chart was cast
   * @param {Object} location - Location data
   * @returns {Object} Analysis result
   */
  analyzeHoraryQuestion(question, chartTime, location) {
    // Extract subject from question
    const questionType = this.categorizeQuestion(question);

    // Create basic timing analysis
    const hour = chartTime.getHours();
    const day = chartTime.getDay();
    const moonPhase = this.getMoonPhase(chartTime);

    // Traditional horary wisdom based on question type
    const wisdom = this.getHoraryWisdom(questionType, hour, day, moonPhase);

    // Format the analysis
    const summary = this.formatHoraryAnalysis(question, questionType, wisdom);

    return {
      summary,
      answer: wisdom.answer,
      timing: wisdom.timing,
      confidence: wisdom.confidence,
      factors: wisdom.factors || []
    };
  }

  /**
   * Categorize the type of question asked
   * @param {string} question - User's question
   * @returns {string} Question category
   */
  categorizeQuestion(question) {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('job') || lowerQuestion.includes('career') || lowerQuestion.includes('work')) {
      return 'career';
    }
    if (lowerQuestion.includes('money') || lowerQuestion.includes('invest') || lowerQuestion.includes('business')) {
      return 'financial';
    }
    if (lowerQuestion.includes('relationship') || lowerQuestion.includes('marriage') || lowerQuestion.includes('love')) {
      return 'relationship';
    }
    if (lowerQuestion.includes('health') || lowerQuestion.includes('sick') || lowerQuestion.includes('doctor')) {
      return 'health';
    }
    if (lowerQuestion.includes('time') || lowerQuestion.includes('when')) {
      return 'timing';
    }

    return 'general';
  }

  /**
   * Get traditional horary wisdom based on question category and timing
   * @param {string} questionType - Category of question
   * @param {number} hour - Hour of day
   * @param {number} day - Day of week
   * @param {string} moonPhase - Current moon phase
   * @returns {Object} Horary wisdom analysis
   */
  getHoraryWisdom(questionType, hour, day, moonPhase) {
    // Traditional horary principles
    const isGoodHour = this.isGoodHour(hour);
    const isBeneficialDay = this.isBeneficialDay(day);
    const isFavorableMoon = moonPhase === 'waxing';

    const factors = [];
    if (isGoodHour) { factors.push('Good hour for consultation'); }
    if (isBeneficialDay) { factors.push('Beneficial planetary day'); }
    if (isFavorableMoon) { factors.push('Favorable moon phase'); }

    // Generate interpretation based on question type
    const wisdom = this.generateQuestionInterpretation(questionType, isGoodHour);

    return {
      ...wisdom,
      factors
    };
  }

  /**
   * Check if the hour is traditionally favorable for horary
   * @param {number} hour - Hour of day (24-hour format)
   * @returns {boolean} Is favorable
   */
  isGoodHour(hour) {
    // Traditional favorable hours (planetary hours)
    const favorableHours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 18, 19, 20];
    return favorableHours.includes(hour);
  }

  /**
   * Check if day is traditionally beneficial
   * @param {number} day - Day of week (0=Sunday)
   * @returns {boolean} Is beneficial
   */
  isBeneficialDay(day) {
    // Sunday (Sun), Monday (Moon), Wednesday (Mercury), Thursday (Jupiter), Friday (Venus)
    return [0, 1, 3, 4, 5].includes(day);
  }

  /**
   * Get approximate moon phase
   * @param {Date} date - Date to check
   * @returns {string} Moon phase
   */
  getMoonPhase(date) {
    // Simplified moon phase calculation
    const daysSinceNewMoon = (date.getTime() - new Date('2024-01-11').getTime()) / (1000 * 60 * 60 * 24);
    const phase = daysSinceNewMoon % 29.5;

    if (phase < 14.75) { return 'waxing'; }
    return 'waning';
  }

  /**
   * Generate interpretation based on question type
   * @param {string} questionType - Type of question
   * @param {boolean} isGoodHour - Whether hour is favorable
   * @returns {Object} Interpretation
   */
  generateQuestionInterpretation(questionType, isGoodHour) {
    const interpretations = {
      career: {
        answer: {
          determination: isGoodHour ? 'Favorable indications' : 'Mixed influences',
          confidence: isGoodHour ? 'Strong' : 'Moderate'
        },
        timing: 'Career matters will develop within 30-90 days if energies align'
      },
      financial: {
        answer: {
          determination: isGoodHour ? 'Positive potential' : 'Exercise caution',
          confidence: isGoodHour ? 'Strong' : 'Moderate'
        },
        timing: 'Financial developments within 21-45 days of consultation'
      },
      relationship: {
        answer: {
          determination: isGoodHour ? 'Harmony indicated' : 'Communication needed',
          confidence: isGoodHour ? 'Strong' : 'Moderate'
        },
        timing: 'Relationship matters unfold within 14-28 days'
      },
      health: {
        answer: {
          determination: 'Healing energies available',
          confidence: 'Strong'
        },
        timing: 'Health improvements within 7-21 days with proper care'
      },
      timing: {
        answer: {
          determination: 'Time factors indicate resolution',
          confidence: isGoodHour ? 'Strong' : 'Moderate'
        },
        timing: 'Matter resolves between now and 60 days'
      },
      general: {
        answer: {
          determination: 'Chart indicates meaningful guidance available',
          confidence: isGoodHour ? 'Strong' : 'Moderate'
        },
        timing: 'Timing suggests development within 30-45 days'
      }
    };

    return interpretations[questionType] || interpretations.general;
  }

  /**
   * Format the complete horary analysis
   * @param {string} question - Original question
   * @param {string} questionType - Question category
   * @param {Object} wisdom - Horary wisdom
   * @returns {string} Formatted analysis
   */
  formatHoraryAnalysis(question, questionType, wisdom) {
    let analysis = '⏰ *Traditional Horary Analysis*\n\n';
    analysis += `Question: "${question}"\n\n`;
    analysis += `📜 *Determination:* ${wisdom.answer.determination}\n`;
    analysis += `🎯 *Astrological Confidence:* ${wisdom.answer.confidence}\n\n`;

    if (wisdom.factors && wisdom.factors.length > 0) {
      analysis += '*Key Astrological Factors:*';
      wisdom.factors.forEach(factor => {
        analysis += `\n• ${factor}`;
      });
      analysis += '\n\n';
    }

    analysis += `*Timing:* ${wisdom.timing}\n\n`;

    // Add traditional horary wisdom
    analysis += '*🕉️ Traditional Horary Wisdom:*\n';
    analysis += 'Horary astrology casts the chart at the moment of your question to provide divine guidance. The celestial configuration reveals hidden influences and timing for affairs of life.\n\n';

    analysis += '*Planetary Language:* Each planet speaks about different life areas:\n';
    analysis += '• Sun: Self, life force, paternity\n• Moon: Emotions, home, changeability\n• Mars: Energy, courage, conflict\n• Mercury: Communication, learning\n• Jupiter: Fortune, growth, wisdom\n• Venus: Relationships, beauty, resources\n• Saturn: Discipline, karma, longevity\n\n';

    analysis += '*Remember:* This reading is cast at your question\'s exact moment. True horary requires purity of intention and genuine concern for the matter. 🕉️';

    return analysis;
  }
}

module.exports = { TraditionalHorary };
