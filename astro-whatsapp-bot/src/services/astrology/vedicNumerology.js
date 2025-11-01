const logger = require('../../utils/logger');

logger.info('Module: vedicNumerology loaded.');

/**
 * Vedic Numerology (Chani System) - Traditional Indian numerology
 * Based on Sanskrit alphabet and Vedic principles
 */

class VedicNumerology {
  constructor() {
    // Sanskrit letter to number mapping (traditional Vedic system)
    this.sanskritMap = {
      // Vowels (स्वर)
      अ: 1,
      आ: 1,
      इ: 1,
      ई: 1,
      उ: 1,
      ऊ: 1,
      ऋ: 1,
      ॠ: 1,
      ऌ: 1,
      ॡ: 1,
      ए: 1,
      ऐ: 1,
      ओ: 1,
      औ: 1,
      अं: 1,
      अः: 1,

      // Consonants (व्यंजन)
      क: 2,
      ख: 2,
      ग: 2,
      घ: 2,
      ङ: 2,
      च: 3,
      छ: 3,
      ज: 3,
      झ: 3,
      ञ: 3,
      ट: 4,
      ठ: 4,
      ड: 4,
      ढ: 4,
      ण: 4,
      त: 5,
      थ: 5,
      द: 5,
      ध: 5,
      न: 5,
      प: 6,
      फ: 6,
      ब: 6,
      भ: 6,
      म: 6,
      य: 7,
      र: 7,
      ल: 7,
      व: 7,
      श: 8,
      ष: 8,
      स: 8,
      ह: 8,
      क्ष: 9,
      ज्ञ: 9,
      त्र: 9,
      श्र: 9
    };

    // English letter approximation for names in English
    this.englishMap = {
      A: 1,
      I: 1,
      J: 1,
      Q: 1,
      Y: 1,
      B: 2,
      K: 2,
      R: 2,
      C: 3,
      G: 3,
      L: 3,
      S: 3,
      D: 4,
      M: 4,
      T: 4,
      E: 5,
      H: 5,
      N: 5,
      X: 5,
      U: 6,
      V: 6,
      W: 6,
      O: 7,
      Z: 7,
      F: 8,
      P: 8
    };

    // Vedic number interpretations
    this.vedicInterpretations = {
      1: {
        name: 'Sun (Surya)',
        qualities: 'Leadership, independence, creativity, self-reliance',
        strengths: 'Pioneering spirit, courage, originality',
        challenges: 'Ego, impatience, dominance',
        career: 'Entrepreneur, leader, artist, innovator',
        health: 'Heart, spine, eyes, digestive system',
        gemstone: 'Ruby',
        mantra: 'Om Suryaya Namaha'
      },
      2: {
        name: 'Moon (Chandra)',
        qualities: 'Sensitivity, intuition, cooperation, adaptability',
        strengths: 'Emotional intelligence, diplomacy, nurturing',
        challenges: 'Mood swings, dependency, indecisiveness',
        career: 'Counselor, teacher, healer, mediator',
        health: 'Stomach, breasts, lymphatic system',
        gemstone: 'Pearl',
        mantra: 'Om Chandraya Namaha'
      },
      3: {
        name: 'Jupiter (Guru)',
        qualities: 'Wisdom, optimism, communication, expansion',
        strengths: 'Teaching, philosophy, generosity, faith',
        challenges: 'Over-confidence, extravagance, restlessness',
        career: 'Teacher, writer, philosopher, advisor',
        health: 'Liver, thighs, nervous system',
        gemstone: 'Yellow Sapphire',
        mantra: 'Om Gurave Namaha'
      },
      4: {
        name: 'Rahu (North Node)',
        qualities: 'Innovation, unconventional, material success',
        strengths: 'Technical skills, foreign connections, research',
        challenges: 'Instability, deception, obsession',
        career: 'Scientist, engineer, inventor, businessman',
        health: 'Skin, lungs, mysterious illnesses',
        gemstone: 'Hessonite',
        mantra: 'Om Rahave Namaha'
      },
      5: {
        name: 'Mercury (Budha)',
        qualities: 'Intelligence, communication, adaptability, business',
        strengths: 'Learning, analysis, commerce, versatility',
        challenges: 'Nervousness, criticism, inconsistency',
        career: 'Writer, trader, analyst, communicator',
        health: 'Nervous system, skin, respiratory system',
        gemstone: 'Emerald',
        mantra: 'Om Budhaya Namaha'
      },
      6: {
        name: 'Venus (Shukra)',
        qualities: 'Harmony, beauty, relationships, luxury',
        strengths: 'Artistic, diplomatic, sensual, prosperous',
        challenges: 'Indulgence, vanity, possessiveness',
        career: 'Artist, designer, diplomat, luxury business',
        health: 'Kidneys, reproductive system, throat',
        gemstone: 'Diamond',
        mantra: 'Om Shukraya Namaha'
      },
      7: {
        name: 'Ketu (South Node)',
        qualities: 'Spirituality, detachment, mysticism, liberation',
        strengths: 'Intuition, meditation, healing, wisdom',
        challenges: 'Isolation, confusion, detachment from worldly matters',
        career: 'Spiritual teacher, healer, researcher, monk',
        health: 'Mysterious ailments, spiritual health',
        gemstone: 'Cat\'s Eye',
        mantra: 'Om Ketave Namaha'
      },
      8: {
        name: 'Saturn (Shani)',
        qualities: 'Discipline, responsibility, karma, longevity',
        strengths: 'Patience, organization, justice, perseverance',
        challenges: 'Depression, delays, rigidity, pessimism',
        career: 'Administrator, judge, scientist, labor work',
        health: 'Bones, teeth, joints, chronic conditions',
        gemstone: 'Blue Sapphire',
        mantra: 'Om Shanaye Namaha'
      },
      9: {
        name: 'Mars (Mangal)',
        qualities: 'Energy, courage, leadership, transformation',
        strengths: 'Courage, initiative, protection, surgery',
        challenges: 'Aggression, impatience, accidents, conflicts',
        career: 'Soldier, surgeon, athlete, engineer',
        health: 'Blood, muscles, head, fever',
        gemstone: 'Red Coral',
        mantra: 'Om Mangalaya Namaha'
      }
    };

    // Compound number interpretations
    this.compoundNumbers = {
      10: 'Spiritual leadership and divine guidance',
      11: 'Master intuition and spiritual illumination',
      12: 'Divine wisdom and cosmic consciousness',
      13: 'Transformation and rebirth',
      14: 'Material and spiritual balance',
      15: 'Spiritual discipline and devotion',
      16: 'Harmony and divine love',
      17: 'Spiritual liberation and enlightenment',
      18: 'Material abundance and spiritual wisdom',
      19: 'Humanitarian service and compassion',
      20: 'Universal love and service',
      21: 'Cosmic consciousness and mastery',
      22: 'Master builder and manifestation',
      23: 'Divine communication and inspiration',
      24: 'Cosmic order and divine law',
      25: 'Universal knowledge and wisdom',
      26: 'Divine protection and guidance',
      27: 'Complete spiritual realization'
    };
  }

  /**
   * Calculate Vedic name number
   */
  calculateVedicNameNumber(name) {
    try {
      const cleanedName = name.toUpperCase().replace(/[^A-Z\s]/g, '');
      let total = 0;

      for (const char of cleanedName) {
        if (char !== ' ') {
          total += this.englishMap[char] || 0;
        }
      }

      // Reduce to single digit or master number
      return this.reduceToVedicNumber(total);
    } catch (error) {
      logger.error(`Error calculating Vedic name number for ${name}:`, error);
      return null;
    }
  }

  /**
   * Calculate birth number from date
   */
  calculateBirthNumber(birthDate) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);
      const daySum = this.reduceToVedicNumber(day);
      const monthSum = this.reduceToVedicNumber(month);
      const yearSum = this.reduceToVedicNumber(year);

      return this.reduceToVedicNumber(daySum + monthSum + yearSum);
    } catch (error) {
      logger.error(`Error calculating birth number for ${birthDate}:`, error);
      return null;
    }
  }

  /**
   * Reduce number to Vedic single digit (1-9)
   */
  reduceToVedicNumber(num) {
    let sum = num;
    while (sum > 9) {
      sum = String(sum)
        .split('')
        .reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    return sum;
  }

  /**
   * Get compound number interpretation
   */
  getCompoundInterpretation(number) {
    return (
      this.compoundNumbers[number] ||
      `Compound number ${number} indicates complex karmic influences`
    );
  }

  /**
   * Calculate destiny number (name + birth)
   */
  calculateDestinyNumber(birthDate, name) {
    const birthNumber = this.calculateBirthNumber(birthDate);
    const nameNumber = this.calculateVedicNameNumber(name);

    if (!birthNumber || !nameNumber) {
      return null;
    }

    return this.reduceToVedicNumber(birthNumber + nameNumber);
  }

  /**
   * Get complete Vedic numerology analysis
   */
  getVedicNumerologyAnalysis(birthDate, name) {
    try {
      const birthNumber = this.calculateBirthNumber(birthDate);
      const nameNumber = this.calculateVedicNameNumber(name);
      const destinyNumber = this.calculateDestinyNumber(birthDate, name);

      if (!birthNumber || !nameNumber) {
        return {
          error:
            'Unable to calculate numerology numbers. Please check birth date and name format.'
        };
      }

      const birthInterpretation = this.vedicInterpretations[birthNumber];
      const nameInterpretation = this.vedicInterpretations[nameNumber];
      const destinyInterpretation = this.vedicInterpretations[destinyNumber];

      // Check for compound numbers
      const isBirthCompound = birthNumber > 9;
      const isNameCompound = nameNumber > 9;
      const isDestinyCompound = destinyNumber > 9;

      let summary = `🕉️ *Vedic Numerology Analysis for ${name}*\n\n`;
      summary += `*Birth Date:* ${birthDate}\n\n`;

      summary += `*🔢 Birth Number (Janma Sankhya):* ${birthNumber}\n`;
      summary += `*Ruling Planet:* ${birthInterpretation.name}\n`;
      summary += `*Qualities:* ${birthInterpretation.qualities}\n`;
      summary += `*Strengths:* ${birthInterpretation.strengths}\n`;
      summary += `*Challenges:* ${birthInterpretation.challenges}\n\n`;

      summary += `*🔢 Name Number (Naam Sankhya):* ${nameNumber}\n`;
      summary += `*Ruling Planet:* ${nameInterpretation.name}\n`;
      summary += `*Expression:* ${nameInterpretation.qualities}\n\n`;

      summary += `*🔢 Destiny Number (Karma Sankhya):* ${destinyNumber}\n`;
      summary += `*Life Purpose:* ${destinyInterpretation.qualities}\n\n`;

      // Add compound number interpretations if applicable
      if (isBirthCompound) {
        summary += `*🌟 Birth Compound:* ${this.getCompoundInterpretation(birthNumber)}\n\n`;
      }
      if (isNameCompound) {
        summary += `*🌟 Name Compound:* ${this.getCompoundInterpretation(nameNumber)}\n\n`;
      }
      if (isDestinyCompound) {
        summary += `*🌟 Destiny Compound:* ${this.getCompoundInterpretation(destinyNumber)}\n\n`;
      }

      summary += `*💼 Career Path:* ${birthInterpretation.career}\n\n`;
      summary += `*🏥 Health Focus:* ${birthInterpretation.health}\n`;
      summary += `*💎 Recommended Gemstone:* ${birthInterpretation.gemstone}\n`;
      summary += `*🕉️ Mantra:* ${birthInterpretation.mantra}\n\n`;

      summary += '*📊 Vedic Number Compatibility:*\n';
      const compatibleNumbers = this.getCompatibleNumbers(birthNumber);
      summary += `• Compatible with: ${compatibleNumbers.join(', ')}\n`;
      const challengingNumbers = this.getChallengingNumbers(birthNumber);
      summary += `• Challenging with: ${challengingNumbers.join(', ')}\n\n`;

      summary += '*🔮 Vedic Numerology Summary:*\n';
      summary += `Your Vedic numbers reveal a unique cosmic blueprint. The birth number (${birthNumber}) shows your inherent nature, `;
      summary += `the name number (${nameNumber}) indicates how you express yourself, and the destiny number (${destinyNumber}) `;
      summary +=
        'reveals your life\'s purpose. These numbers work together to guide your spiritual journey and material success.\n\n';
      summary +=
        'Remember: Vedic numerology is a tool for self-understanding. Your free will and karma ultimately shape your destiny! 🕉️';

      return {
        birthNumber,
        nameNumber,
        destinyNumber,
        birthInterpretation,
        nameInterpretation,
        destinyInterpretation,
        summary
      };
    } catch (error) {
      logger.error('Error generating Vedic numerology analysis:', error);
      return {
        error:
          'Unable to generate Vedic numerology analysis. Please try again later.'
      };
    }
  }

  /**
   * Get compatible numbers
   */
  getCompatibleNumbers(number) {
    const compatibilityMap = {
      1: [3, 5, 6, 9],
      2: [3, 6, 7, 9],
      3: [1, 2, 5, 6, 9],
      4: [2, 5, 7, 8],
      5: [1, 3, 4, 6, 8],
      6: [1, 2, 3, 5, 9],
      7: [2, 4, 8, 9],
      8: [4, 5, 7, 9],
      9: [1, 2, 3, 6, 7, 8]
    };

    return compatibilityMap[number] || [number];
  }

  /**
   * Get challenging numbers
   */
  getChallengingNumbers(number) {
    const challengeMap = {
      1: [2, 4, 7, 8],
      2: [1, 4, 5, 8],
      3: [4, 7, 8],
      4: [1, 3, 6, 9],
      5: [2, 7, 9],
      6: [4, 7, 8],
      7: [1, 3, 5, 6],
      8: [2, 3, 6],
      9: [4, 5, 7]
    };

    return challengeMap[number] || [];
  }

  /**
   * Get Vedic numerology catalog for menu
   */
  getVedicNumerologyCatalog() {
    return {
      description:
        '🕉️ Vedic Numerology (Chani System) - Traditional Indian numerology based on Sanskrit alphabet and Vedic principles',
      features: [
        'Birth Number (Janma Sankhya) - Your inherent nature',
        'Name Number (Naam Sankhya) - Your expression',
        'Destiny Number (Karma Sankhya) - Your life purpose',
        'Compound Numbers - Complex karmic influences',
        'Planetary rulerships and gemstone recommendations',
        'Vedic mantras and spiritual guidance'
      ],
      benefits: [
        'Understand your cosmic blueprint',
        'Discover life purpose and destiny',
        'Find compatible relationships',
        'Choose auspicious names and dates',
        'Get spiritual guidance and mantras'
      ]
    };
  }
}

module.exports = { VedicNumerology };
