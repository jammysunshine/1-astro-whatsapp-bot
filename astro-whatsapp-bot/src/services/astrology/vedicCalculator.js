const logger = require('../../utils/logger');

/**
 * Basic Vedic Astrology Calculator for MVP
 * Provides fundamental calculations for birth charts and basic predictions
 */

class VedicCalculator {
  constructor() {
    // Basic zodiac signs
    this.zodiacSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer',
      'Leo', 'Virgo', 'Libra', 'Scorpio',
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    // Basic planetary information
    this.planets = {
      sun: { name: 'Sun', symbol: '☉' },
      moon: { name: 'Moon', symbol: '☽' },
      mars: { name: 'Mars', symbol: '♂' },
      mercury: { name: 'Mercury', symbol: '☿' },
      jupiter: { name: 'Jupiter', symbol: '♃' },
      venus: { name: 'Venus', symbol: '♀' },
      saturn: { name: 'Saturn', symbol: '♄' }
    };
  }

  /**
   * Calculate sun sign from birth date
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @returns {string} Sun sign
   */
  calculateSunSign(birthDate) {
    try {
      const [day, month] = birthDate.split('/').map(Number);

      // Simplified sun sign calculation
      const signDates = [
        { sign: 'Capricorn', start: [22, 12], end: [19, 1] },
        { sign: 'Aquarius', start: [20, 1], end: [18, 2] },
        { sign: 'Pisces', start: [19, 2], end: [20, 3] },
        { sign: 'Aries', start: [21, 3], end: [19, 4] },
        { sign: 'Taurus', start: [20, 4], end: [20, 5] },
        { sign: 'Gemini', start: [21, 5], end: [20, 6] },
        { sign: 'Cancer', start: [21, 6], end: [22, 7] },
        { sign: 'Leo', start: [23, 7], end: [22, 8] },
        { sign: 'Virgo', start: [23, 8], end: [22, 9] },
        { sign: 'Libra', start: [23, 9], end: [22, 10] },
        { sign: 'Scorpio', start: [23, 10], end: [21, 11] },
        { sign: 'Sagittarius', start: [22, 11], end: [21, 12] }
      ];

      for (const signData of signDates) {
        const [startDay, startMonth] = signData.start;
        const [endDay, endMonth] = signData.end;

        if ((month === startMonth && day >= startDay) ||
            (month === endMonth && day <= endDay) ||
            (startMonth > endMonth && // Handle Capricorn (Dec-Jan)
             ((month === startMonth && day >= startDay) ||
              (month === endMonth && day <= endDay) ||
              month > startMonth || month < endMonth))) {
          return signData.sign;
        }
      }

      return 'Unknown';
    } catch (error) {
      logger.error('Error calculating sun sign:', error);
      return 'Unknown';
    }
  }

  /**
   * Calculate moon sign (simplified)
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time in HH:MM format
   * @returns {string} Moon sign
   */
  calculateMoonSign(birthDate, birthTime) {
    try {
      // Simplified moon sign calculation
      // In reality, this requires precise astronomical calculations
      const sunSign = this.calculateSunSign(birthDate);

      // Simple approximation: moon sign is usually 2-3 signs away from sun sign
      const signIndex = this.zodiacSigns.indexOf(sunSign);
      const moonSignIndex = (signIndex + 2) % 12; // Approximate

      return this.zodiacSigns[moonSignIndex];
    } catch (error) {
      logger.error('Error calculating moon sign:', error);
      return 'Unknown';
    }
  }

  /**
   * Generate basic birth chart summary
   * @param {Object} user - User object with birth details
   * @returns {Object} Basic birth chart data
   */
  generateBasicBirthChart(user) {
    try {
      const { birthDate, birthTime, birthPlace, name } = user;

      if (!birthDate) {
        throw new Error('Birth date is required');
      }

      const sunSign = this.calculateSunSign(birthDate);
      const moonSign = this.calculateMoonSign(birthDate, birthTime);

      return {
        name: name || 'Cosmic Explorer',
        sunSign,
        moonSign,
        birthDate,
        birthTime,
        birthPlace,
        summary: `${name || 'You'} were born under the Sun sign of ${sunSign} and Moon sign of ${moonSign}. This combination suggests ${this.getSignDescription(sunSign, moonSign)}.`
      };
    } catch (error) {
      logger.error('Error generating birth chart:', error);
      throw error;
    }
  }

  /**
   * Get basic sign description
   * @param {string} sunSign - Sun sign
   * @param {string} moonSign - Moon sign
   * @returns {string} Description
   */
  getSignDescription(sunSign, moonSign) {
    const descriptions = {
      'Aries-Leo': 'a dynamic and confident personality with strong leadership qualities',
      'Taurus-Virgo': 'a practical and reliable nature with attention to detail',
      'Gemini-Libra': 'a communicative and social personality with diplomatic skills',
      'Cancer-Scorpio': 'an intuitive and emotional nature with deep feelings',
      'Leo-Sagittarius': 'an enthusiastic and optimistic outlook with creative energy',
      'Virgo-Capricorn': 'a disciplined and responsible character with strong work ethic',
      'Libra-Aquarius': 'a harmonious and idealistic nature with social consciousness',
      'Scorpio-Pisces': 'an intense and compassionate personality with spiritual depth',
      'Sagittarius-Aries': 'an adventurous and independent spirit with pioneering energy',
      'Capricorn-Taurus': 'a determined and practical approach with material success focus',
      'Aquarius-Gemini': 'an innovative and intellectual mind with humanitarian ideals',
      'Pisces-Cancer': 'a sensitive and imaginative nature with artistic tendencies'
    };

    const key = `${sunSign}-${moonSign}`;
    return descriptions[key] || 'a unique combination of energies that make you special';
  }

  /**
   * Generate daily horoscope (simplified)
   * @param {string} sunSign - User's sun sign
   * @returns {string} Daily horoscope
   */
  generateDailyHoroscope(sunSign) {
    const horoscopes = {
      'Aries': 'Today brings new opportunities for leadership. Trust your instincts and take bold action.',
      'Taurus': 'Focus on stability and practical matters. Your patience will be rewarded today.',
      'Gemini': 'Communication is key today. Express your ideas and connect with others.',
      'Cancer': 'Pay attention to your emotions and home life. Nurture your relationships.',
      'Leo': 'Your creative energy is high today. Share your talents with the world.',
      'Virgo': 'Attention to detail will serve you well. Organize and plan for success.',
      'Libra': 'Seek balance and harmony in all your dealings. Diplomacy wins the day.',
      'Scorpio': 'Trust your intuition. Deep insights will guide you to important truths.',
      'Sagittarius': 'Adventure calls! Expand your horizons and explore new possibilities.',
      'Capricorn': 'Focus on long-term goals. Your ambition will lead to achievement.',
      'Aquarius': 'Innovation and originality will set you apart. Think outside the box.',
      'Pisces': 'Trust your imagination. Creative and spiritual pursuits bring fulfillment.'
    };

    return horoscopes[sunSign] || 'Today brings opportunities for growth and self-discovery. Trust your inner wisdom.';
  }

  /**
   * Check basic compatibility between two signs
   * @param {string} sign1 - First sign
   * @param {string} sign2 - Second sign
   * @returns {Object} Compatibility result
   */
  checkCompatibility(sign1, sign2) {
    // Simplified compatibility matrix
    const compatibility = {
      'Aries-Leo': 'Excellent',
      'Aries-Sagittarius': 'Excellent',
      'Aries-Gemini': 'Good',
      'Aries-Aquarius': 'Good',
      'Taurus-Virgo': 'Excellent',
      'Taurus-Capricorn': 'Excellent',
      'Taurus-Cancer': 'Good',
      'Taurus-Pisces': 'Good',
      'Gemini-Libra': 'Excellent',
      'Gemini-Aquarius': 'Excellent',
      'Gemini-Aries': 'Good',
      'Gemini-Leo': 'Good',
      'Cancer-Scorpio': 'Excellent',
      'Cancer-Pisces': 'Excellent',
      'Cancer-Taurus': 'Good',
      'Cancer-Virgo': 'Good',
      'Leo-Aries': 'Excellent',
      'Leo-Sagittarius': 'Excellent',
      'Leo-Gemini': 'Good',
      'Leo-Libra': 'Good',
      'Virgo-Taurus': 'Excellent',
      'Virgo-Capricorn': 'Excellent',
      'Virgo-Cancer': 'Good',
      'Virgo-Scorpio': 'Good',
      'Libra-Gemini': 'Excellent',
      'Libra-Aquarius': 'Excellent',
      'Libra-Leo': 'Good',
      'Libra-Sagittarius': 'Good',
      'Scorpio-Cancer': 'Excellent',
      'Scorpio-Pisces': 'Excellent',
      'Scorpio-Virgo': 'Good',
      'Scorpio-Capricorn': 'Good',
      'Sagittarius-Aries': 'Excellent',
      'Sagittarius-Leo': 'Excellent',
      'Sagittarius-Libra': 'Good',
      'Sagittarius-Aquarius': 'Good',
      'Capricorn-Taurus': 'Excellent',
      'Capricorn-Virgo': 'Excellent',
      'Capricorn-Scorpio': 'Good',
      'Capricorn-Pisces': 'Good',
      'Aquarius-Gemini': 'Excellent',
      'Aquarius-Libra': 'Excellent',
      'Aquarius-Sagittarius': 'Good',
      'Aquarius-Aries': 'Good',
      'Pisces-Cancer': 'Excellent',
      'Pisces-Scorpio': 'Excellent',
      'Pisces-Taurus': 'Good',
      'Pisces-Capricorn': 'Good'
    };

    const key = `${sign1}-${sign2}`;
    const reverseKey = `${sign2}-${sign1}`;

    const rating = compatibility[key] || compatibility[reverseKey] || 'Neutral';

    return {
      sign1,
      sign2,
      compatibility: rating,
      description: this.getCompatibilityDescription(sign1, sign2, rating)
    };
  }

  /**
   * Get compatibility description
   * @param {string} sign1 - First sign
   * @param {string} sign2 - Second sign
   * @param {string} rating - Compatibility rating
   * @returns {string} Description
   */
  getCompatibilityDescription(sign1, sign2, rating) {
    const descriptions = {
      'Excellent': `${sign1} and ${sign2} share great compatibility. You complement each other's strengths and understand each other's needs intuitively.`,
      'Good': `${sign1} and ${sign2} have good compatibility with some complementary energies. With understanding, this can be a harmonious relationship.`,
      'Neutral': `${sign1} and ${sign2} have neutral compatibility. While you may not be natural soulmates, mutual respect and communication can build a strong connection.`
    };

    return descriptions[rating] || 'This combination has unique dynamics that require understanding and patience to navigate successfully.';
  }
}

module.exports = new VedicCalculator();