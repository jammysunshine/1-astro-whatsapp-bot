const logger = require('../../../utils/logger');
const sweph = require('sweph');

/**
 * AntardashaCalculator - Specialized calculator for Vedic Antardasha analysis
 * Handles sub-period calculations within major Dasha cycles for detailed timing analysis
 */
class AntardashaCalculator {
  constructor() {
    logger.info(
      'Module: AntardashaCalculator loaded - Vedic sub-period timing analysis'
    );
  }

  setServices(calendricalService, geocodingService) {
    this.calendricalService = calendricalService;
    this.geocodingService = geocodingService;
  }

  /**
   * Calculate Antardasha analysis - sub-periods within major Dasha cycles
   */
  async getAntardashaAnalysis(birthData, options = {}) {
    try {
      const { birthDate, birthTime, currentDate = new Date() } = birthData;

      // Parse birth data
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Calculate current Vimshottari Dasha
      const currentDasha = await this._calculateCurrentVimshottariDasha(
        birthData,
        currentDate
      );

      // Calculate Antardashas for current major period
      const antardashas = this._calculateAntardashas(currentDasha);

      // Get current Antardasha
      const currentAntardasha = this._getCurrentAntardasha(
        antardashas,
        currentDate
      );

      // Analyze current period
      const analysis = this._analyzeCurrentAntardasha(currentAntardasha);

      return {
        currentDasha: currentDasha.name,
        currentDashaStart: currentDasha.startDate,
        currentDashaEnd: currentDasha.endDate,
        currentAntardasha: currentAntardasha.name,
        currentAntardashaStart: currentAntardasha.startDate,
        currentAntardashaEnd: currentAntardasha.endDate,
        antardashas,
        analysis,
        nextAntardasha: this._getNextAntardasha(antardashas, currentDate)
      };
    } catch (error) {
      logger.error('Antardasha calculation error:', error);
      throw new Error('Failed to calculate Antardasha analysis');
    }
  }

  /**
   * Calculate current Vimshottari Dasha
   * @private
   */
  async _calculateCurrentVimshottariDasha(birthData, currentDate) {
    // Simplified Vimshottari Dasha calculation
    // In a full implementation, this would use proper Vedic astrology calculations

    const { birthDate } = birthData;
    const [day, month, year] = birthDate.split('/').map(Number);
    const birthDateObj = new Date(year, month - 1, day);

    // Calculate days since birth
    const daysSinceBirth = Math.floor(
      (currentDate - birthDateObj) / (1000 * 60 * 60 * 24)
    );

    // Vimshottari cycle is 120 years, each Dasha has different durations
    const dashaCycle = [
      { name: 'Sun', years: 6 },
      { name: 'Moon', years: 10 },
      { name: 'Mars', years: 7 },
      { name: 'Rahu', years: 18 },
      { name: 'Jupiter', years: 16 },
      { name: 'Saturn', years: 19 },
      { name: 'Mercury', years: 17 },
      { name: 'Ketu', years: 7 },
      { name: 'Venus', years: 20 }
    ];

    let totalDays = 0;
    let currentDashaIndex = 0;
    let dashaStartDate = new Date(birthDateObj);

    for (let i = 0; i < dashaCycle.length; i++) {
      const dashaDays = dashaCycle[i].years * 365.25;
      if (totalDays + dashaDays > daysSinceBirth) {
        currentDashaIndex = i;
        break;
      }
      totalDays += dashaDays;
      dashaStartDate = new Date(birthDateObj.getTime() + totalDays * 24 * 60 * 60 * 1000);
    }

    const currentDasha = dashaCycle[currentDashaIndex];
    const dashaEndDate = new Date(dashaStartDate.getTime() + currentDasha.years * 365.25 * 24 * 60 * 60 * 1000);

    return {
      name: currentDasha.name,
      startDate: dashaStartDate.toISOString().split('T')[0],
      endDate: dashaEndDate.toISOString().split('T')[0],
      years: currentDasha.years
    };
  }

  /**
   * Calculate Antardashas for a major Dasha period
   * @private
   */
  _calculateAntardashas(majorDasha) {
    const antardashaOrder = [
      'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter',
      'Saturn', 'Mercury', 'Ketu', 'Venus'
    ];

    const antardashaPercentages = {
      Sun: [6, 10, 7, 18, 16, 19, 17, 7, 20],
      Moon: [10, 6, 7, 18, 16, 19, 17, 7, 20],
      Mars: [7, 6, 10, 18, 16, 19, 17, 7, 20],
      Rahu: [18, 6, 10, 7, 16, 19, 17, 7, 20],
      Jupiter: [16, 6, 10, 7, 18, 19, 17, 7, 20],
      Saturn: [19, 6, 10, 7, 18, 16, 17, 7, 20],
      Mercury: [17, 6, 10, 7, 18, 16, 19, 7, 20],
      Ketu: [7, 6, 10, 18, 16, 19, 17, 7, 20],
      Venus: [20, 6, 10, 7, 18, 16, 19, 17, 7]
    };

    const majorDashaName = majorDasha.name;
    const percentages = antardashaPercentages[majorDashaName];
    const totalYears = majorDasha.years;

    const antardashas = [];
    let startDate = new Date(majorDasha.startDate);

    for (let i = 0; i < antardashaOrder.length; i++) {
      const antardashaName = antardashaOrder[i];
      const percentage = percentages[i] / 100;
      const years = totalYears * percentage;

      const endDate = new Date(startDate.getTime() + years * 365.25 * 24 * 60 * 60 * 1000);

      antardashas.push({
        name: antardashaName,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        years: years
      });

      startDate = new Date(endDate);
    }

    return antardashas;
  }

  /**
   * Get current Antardasha based on date
   * @private
   */
  _getCurrentAntardasha(antardashas, currentDate) {
    const currentDateStr = currentDate.toISOString().split('T')[0];

    for (const antardasha of antardashas) {
      if (currentDateStr >= antardasha.startDate && currentDateStr <= antardasha.endDate) {
        return antardasha;
      }
    }

    // If no current found, return the last one (edge case)
    return antardashas[antardashas.length - 1];
  }

  /**
   * Analyze current Antardasha period
   * @private
   */
  _analyzeCurrentAntardasha(antardasha) {
    const planetCharacteristics = {
      Sun: {
        nature: 'Leadership, authority, government, father figures',
        positive: 'Success, recognition, vitality, confidence',
        challenges: 'Ego conflicts, health issues, authority struggles',
        advice: 'Focus on leadership roles and maintain health'
      },
      Moon: {
        nature: 'Emotions, mind, mother, home, intuition',
        positive: 'Emotional stability, intuition, family harmony',
        challenges: 'Mood swings, mental unrest, family issues',
        advice: 'Nurture emotional well-being and family relationships'
      },
      Mars: {
        nature: 'Energy, action, courage, siblings, conflicts',
        positive: 'Physical strength, courage, new beginnings',
        challenges: 'Aggression, accidents, conflicts, injuries',
        advice: 'Channel energy constructively and avoid risky situations'
      },
      Rahu: {
        nature: 'Ambition, foreign lands, unconventional paths, material desires',
        positive: 'Sudden gains, foreign connections, innovation',
        challenges: 'Instability, deception, unconventional behavior',
        advice: 'Pursue goals steadily and maintain ethical standards'
      },
      Jupiter: {
        nature: 'Wisdom, expansion, spirituality, teaching, wealth',
        positive: 'Growth, wisdom, prosperity, spiritual development',
        challenges: 'Over-confidence, excessive spending, dogmatic views',
        advice: 'Seek knowledge and maintain balance in expansion'
      },
      Saturn: {
        nature: 'Discipline, karma, responsibility, hard work, limitations',
        positive: 'Achievement through effort, wisdom, stability',
        challenges: 'Delays, restrictions, depression, health issues',
        advice: 'Practice patience and persistent effort'
      },
      Mercury: {
        nature: 'Communication, intellect, business, siblings, adaptability',
        positive: 'Mental clarity, communication skills, business success',
        challenges: 'Anxiety, scattered thinking, communication issues',
        advice: 'Focus on clear communication and mental discipline'
      },
      Ketu: {
        nature: 'Spirituality, detachment, past life karma, liberation',
        positive: 'Spiritual growth, detachment from material desires',
        challenges: 'Isolation, confusion, health issues, detachment',
        advice: 'Focus on spiritual practices and inner peace'
      },
      Venus: {
        nature: 'Love, beauty, harmony, luxury, relationships, arts',
        positive: 'Harmony, creativity, financial gains, relationships',
        challenges: 'Indulgence, relationship issues, financial losses',
        advice: 'Cultivate harmonious relationships and creative pursuits'
      }
    };

    const planet = antardasha.name;
    const characteristics = planetCharacteristics[planet];

    return {
      planet,
      nature: characteristics.nature,
      positiveInfluences: characteristics.positive,
      challenges: characteristics.challenges,
      advice: characteristics.advice,
      duration: `${antardasha.years.toFixed(1)} years`,
      remainingTime: this._calculateRemainingTime(antardasha.endDate)
    };
  }

  /**
   * Calculate remaining time in current Antardasha
   * @private
   */
  _calculateRemainingTime(endDate) {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return 'Period has ended';
    }

    const years = Math.floor(diffDays / 365.25);
    const months = Math.floor((diffDays % 365.25) / 30.44);
    const days = Math.floor((diffDays % 365.25) % 30.44);

    let remaining = '';
    if (years > 0) remaining += `${years} year${years > 1 ? 's' : ''} `;
    if (months > 0) remaining += `${months} month${months > 1 ? 's' : ''} `;
    if (days > 0) remaining += `${days} day${days > 1 ? 's' : ''}`;

    return remaining.trim();
  }

  /**
   * Get next Antardasha period
   * @private
   */
  _getNextAntardasha(antardashas, currentDate) {
    const currentDateStr = currentDate.toISOString().split('T')[0];

    for (let i = 0; i < antardashas.length; i++) {
      if (currentDateStr <= antardashas[i].endDate) {
        if (i + 1 < antardashas.length) {
          return antardashas[i + 1];
        }
        break;
      }
    }

    return null; // No next Antardasha in current major period
  }

  /**
   * Health check for AntardashaCalculator
   * @returns {Object} Health status
   */
  healthCheck() {
    return {
      healthy: true,
      version: '1.0.0',
      name: 'AntardashaCalculator',
      calculations: [
        'Vimshottari Dasha Analysis',
        'Antardasha Sub-periods',
        'Timing Analysis',
        'Period Interpretation'
      ],
      status: 'Operational'
    };
  }
}

module.exports = { AntardashaCalculator };