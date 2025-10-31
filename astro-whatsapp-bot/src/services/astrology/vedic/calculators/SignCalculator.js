const logger = require('../../../../utils/logger');

/**
 * Sign Calculator
 * Basic astrological sign calculations
 */
class SignCalculator {
  constructor() {
    // No special dependencies for basic calculations
  }

  /**
   * Set services for the calculator
   * @param {Object} services - Service object
   */
  setServices(services) {
    this.services = services;
  }

  /**
   * Calculate sun sign based on birth date
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @param {string} birthTime - Birth time in HH:MM format
   * @param {string} birthPlace - Birth place
   * @param {string} chartType - Chart type (sidereal/tropical)
   * @returns {Object} Sun sign details
   */
  async calculateSunSign(birthDate, birthTime = '12:00', birthPlace = 'Delhi, India', chartType = 'sidereal') {
    try {
      // Parse birth date
      const [day, month, year] = birthDate.split('/').map(Number);

      // Earth orbit periods in days
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

      // Adjust for leap year
      if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        daysInMonth[1] = 29;
      }

      // Calculate day of year
      let dayOfYear = day;
      for (let i = 0; i < month - 1; i++) {
        dayOfYear += daysInMonth[i];
      }

      // Tropical zodiac signs with date ranges
      const tropicalSigns = [
        { name: 'Capricorn', start: 1, end: 19 }, // Jan 1-19
        { name: 'Aquarius', start: 20, end: 48 }, // Jan 20-Feb 18
        { name: 'Pisces', start: 49, end: 79 }, // Feb 19-Mar 20
        { name: 'Aries', start: 80, end: 109 }, // Mar 21-Apr 19
        { name: 'Taurus', start: 110, end: 140 }, // Apr 20-May 20
        { name: 'Gemini', start: 141, end: 171 }, // May 21-Jun 20
        { name: 'Cancer', start: 172, end: 203 }, // Jun 21-Jul 22
        { name: 'Leo', start: 204, end: 234 }, // Jul 23-Aug 22
        { name: 'Virgo', start: 235, end: 265 }, // Aug 23-Sep 22
        { name: 'Libra', start: 266, end: 295 }, // Sep 23-Oct 22
        { name: 'Scorpio', start: 296, end: 325 }, // Oct 23-Nov 21
        { name: 'Sagittarius', start: 326, end: 355 } // Nov 22-Dec 21
      ];

      // Handle Capricorn (spans year end)
      if (month === 12 && day >= 22) {
        return {
          sign: 'Capricorn',
          element: 'Earth',
          quality: 'Cardinal',
          rulingPlanet: 'Saturn',
          symbol: '🐐',
          dates: 'December 22 - January 19',
          traits: ['Ambitious', 'Practical', 'Patient', 'Disciplined']
        };
      } else if (month === 1 && day <= 19) {
        return {
          sign: 'Capricorn',
          element: 'Earth',
          quality: 'Cardinal',
          rulingPlanet: 'Saturn',
          symbol: '🐐',
          dates: 'December 22 - January 19',
          traits: ['Ambitious', 'Practical', 'Patient', 'Disciplined']
        };
      }

      // Find sign for the day
      for (const sign of tropicalSigns) {
        if (dayOfYear >= sign.start && dayOfYear <= sign.end) {
          const signDetails = {
            Capricorn: { element: 'Earth', quality: 'Cardinal', planet: 'Saturn', symbol: '🐐' },
            Aquarius: { element: 'Air', quality: 'Fixed', planet: 'Uranus', symbol: '🏺' },
            Pisces: { element: 'Water', quality: 'Mutable', planet: 'Neptune', symbol: '🐟' },
            Aries: { element: 'Fire', quality: 'Cardinal', planet: 'Mars', symbol: '🐏' },
            Taurus: { element: 'Earth', quality: 'Fixed', planet: 'Venus', symbol: '🐂' },
            Gemini: { element: 'Air', quality: 'Mutable', planet: 'Mercury', symbol: '👯' },
            Cancer: { element: 'Water', quality: 'Cardinal', planet: 'Moon', symbol: '🦀' },
            Leo: { element: 'Fire', quality: 'Fixed', planet: 'Sun', symbol: '🦁' },
            Virgo: { element: 'Earth', quality: 'Mutable', planet: 'Mercury', symbol: '👩' },
            Libra: { element: 'Air', quality: 'Cardinal', planet: 'Venus', symbol: '⚖️' },
            Scorpio: { element: 'Water', quality: 'Fixed', planet: 'Pluto', symbol: '🦂' },
            Sagittarius: { element: 'Fire', quality: 'Mutable', planet: 'Jupiter', symbol: '🏹' }
          };

          const details = signDetails[sign.name];

          return {
            sign: sign.name,
            element: details.element,
            quality: details.quality,
            rulingPlanet: details.planet,
            symbol: details.symbol,
            dates: sign.dates,
            traits: this._getSignTraits(sign.name)
          };
        }
      }

      throw new Error('Unable to determine sun sign for given date');

    } catch (error) {
      logger.error('❌ Error in sun sign calculation:', error);
      throw new Error(`Sun sign calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate moon sign based on birth date and time
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @param {string} birthTime - Birth time in HH:MM format
   * @param {string} birthPlace - Birth place
   * @param {string} chartType - Chart type (sidereal/tropical)
   * @returns {Object} Moon sign details
   */
  async calculateMoonSign(birthDate, birthTime = '12:00', birthPlace = 'Delhi, India', chartType = 'sidereal') {
    try {
      // Parse birth date and time
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get moon phase and approximate position
      // Simplified calculation - in full implementation use Swiss Ephemeris
      const moonPosition = this._calculateMoonPosition(day, month, year, hour, minute);

      const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      const signIndex = Math.floor(moonPosition.longitude / 30) % 12;
      const sign = zodiacSigns[signIndex];

      const signDetails = {
        Aries: { element: 'Fire', quality: 'Cardinal', rulingPlanet: 'Mars', symbol: '🌙' },
        Taurus: { element: 'Earth', quality: 'Fixed', rulingPlanet: 'Venus', symbol: '🌙' },
        Gemini: { element: 'Air', quality: 'Mutable', rulingPlanet: 'Mercury', symbol: '🌙' },
        Cancer: { element: 'Water', quality: 'Cardinal', rulingPlanet: 'Moon', symbol: '🌙' },
        Leo: { element: 'Fire', quality: 'Fixed', rulingPlanet: 'Sun', symbol: '🌙' },
        Virgo: { element: 'Earth', quality: 'Mutable', rulingPlanet: 'Mercury', symbol: '🌙' },
        Libra: { element: 'Air', quality: 'Cardinal', rulingPlanet: 'Venus', symbol: '🌙' },
        Scorpio: { element: 'Water', quality: 'Fixed', rulingPlanet: 'Pluto', symbol: '🌙' },
        Sagittarius: { element: 'Fire', quality: 'Mutable', rulingPlanet: 'Jupiter', symbol: '🌙' },
        Capricorn: { element: 'Earth', quality: 'Cardinal', rulingPlanet: 'Saturn', symbol: '🌙' },
        Aquarius: { element: 'Air', quality: 'Fixed', rulingPlanet: 'Uranus', symbol: '🌙' },
        Pisces: { element: 'Water', quality: 'Mutable', rulingPlanet: 'Neptune', symbol: '🌙' }
      };

      const details = signDetails[sign];

      return {
        sign,
        element: details.element,
        quality: details.quality,
        rulingPlanet: details.rulingPlanet,
        symbol: details.symbol,
        detailedTraits: this._getMoonSignTraits(sign)
      };

    } catch (error) {
      logger.error('❌ Error in moon sign calculation:', error);
      throw new Error(`Moon sign calculation failed: ${error.message}`);
    }
  }

  /**
   * Simplified moon position calculation
   * @private
   * @param {number} day
   * @param {number} month
   * @param {number} year
   * @param {number} hour
   * @param {number} minute
   * @returns {Object} Moon position
   */
  _calculateMoonPosition(day, month, year, hour, minute) {
    // Simplified approximation - real calculation would use astronomical algorithms
    const daysSinceEpoch = Math.floor((new Date(year, month - 1, day).getTime() - new Date(2000, 0, 1).getTime()) / (1000 * 60 * 60 * 24));
    const longitude = (daysSinceEpoch * 0.54 + hour * 0.225 + minute * 0.00375) % 360;
    return { longitude };
  }

  /**
   * Get moon sign specific traits
   * @private
   * @param {string} sign - Moon's zodiac sign
   * @returns {Array} Array of emotional traits
   */
  _getMoonSignTraits(sign) {
    const moonTraits = {
      Aries: ['Impulsive', 'Passionate emotions', 'Quick to anger', 'Energetic feelings'],
      Taurus: ['Sturdy emotions', 'Loving', 'Patient', 'Comfort-seeking'],
      Gemini: ['Versatile feelings', 'Intellectual', 'Communicative', 'Restless'],
      Cancer: ['Deeply emotional', 'Nurturing', 'Intuitive', 'Protective'],
      Leo: ['Dramatic feelings', 'Warm-hearted', 'Proud', 'Creative'],
      Virgo: ['Analytical emotions', 'Practical', 'Critical', 'Helpful'],
      Libra: ['Harmonious', 'Diplomatic', 'Fair', 'Partnership-oriented'],
      Scorpio: ['Intense emotions', 'Deep', 'Possessive', 'Transformative'],
      Sagittarius: ['Optimistic feelings', 'Adventurous', 'Honest', 'Freedom-loving'],
      Capricorn: ['Reserved emotions', 'Responsible', 'Ambitious', 'Stable'],
      Aquarius: ['Independent feelings', 'Unconventional', 'Humanitarian', 'Detached'],
      Pisces: ['Sensitive', 'Compassionate', 'Imaginative', 'Spiritual']
    };

    return moonTraits[sign] || [];
  }

  /**
   * Get sign traits
   * @private
   * @param {string} sign - Zodiac sign name
   * @returns {Array} Array of traits
   */
  _getSignTraits(sign) {
    const traits = {
      Aries: ['Energetic', 'Courageous', 'Competitive', 'Optimistic'],
      Taurus: ['Reliable', 'Patient', 'Practical', 'Devoted'],
      Gemini: ['Adaptable', 'Communicative', 'Witty', 'Intelligent'],
      Cancer: ['Emotional', 'Intuitive', 'Protective', 'Sympathetic'],
      Leo: ['Creative', 'Passionate', 'Generous', 'Warm-hearted'],
      Virgo: ['Analytical', 'Practical', 'Hardworking', 'Kind'],
      Libra: ['Diplomatic', 'Fair-minded', 'Social', 'Idealistic'],
      Scorpio: ['Resourceful', 'Brave', 'Passionate', 'Stubborn'],
      Sagittarius: ['Generous', 'Idealistic', 'Sense of humor', 'Freedom-loving'],
      Capricorn: ['Responsible', 'Disciplined', 'Self-controlled', 'Ambitious'],
      Aquarius: ['Independent', 'Original', 'Humanitarian', 'Intellectual'],
      Pisces: ['Compassionate', 'Artistic', 'Intuitive', 'Gentle']
    };

    return traits[sign] || [];
  }
}

module.exports = SignCalculator;