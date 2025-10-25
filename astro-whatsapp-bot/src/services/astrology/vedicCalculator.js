const logger = require('../../utils/logger');

/**
 * Professional Vedic Astrology Calculator with Astrologer Library
 * Provides complete natal chart analysis using Swiss Ephemeris and astrological interpretations
 */

const { Astrologer } = require('astrologer');
const sweph = require('sweph');

class VedicCalculator {
  constructor() {
    // Lazy initialize the astrologer library to save memory
    this._astrologer = null;

    // Set ephemeris path for sweph (used internally by astrologer)
    try {
      sweph.set_ephe_path('./ephe');
      console.log('Swiss Ephemeris initialized for astrologer library');
    } catch (error) {
      console.warn('Swiss Ephemeris data files not found. Using built-in calculations:', error.message);
    }

    // Zodiac signs (for backward compatibility)
    this.zodiacSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer',
      'Leo', 'Virgo', 'Libra', 'Scorpio',
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    // Planetary information
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

  // Lazy getter for astrologer instance
  get astrologer() {
    if (!this._astrologer) {
      this._astrologer = new Astrologer();
    }
    return this._astrologer;
  }

  /**
    * Calculate sun sign from birth date using professional astrology library
    * @param {string} birthDate - Birth date in DD/MM/YYYY format
    * @param {string} birthTime - Birth time in HH:MM format (optional, defaults to noon)
    * @param {number} latitude - Birth latitude (optional, defaults to Delhi)
    * @param {number} longitude - Birth longitude (optional, defaults to Delhi)
    * @param {number} timezone - UTC offset in hours (optional, defaults to IST)
    * @param {string} chartType - 'tropical' or 'sidereal' (optional, defaults to 'sidereal' for Vedic)
    * @returns {string} Sun sign
    */
  calculateSunSign(birthDate, birthTime = '12:00', latitude = 28.6139, longitude = 77.2090, timezone = 5.5, chartType = 'sidereal') {
    try {
      if (!birthDate || typeof birthDate !== 'string') {
        console.error('Invalid birthDate provided to calculateSunSign:', birthDate, typeof birthDate);
        return this._calculateSunSignFallback('01/01/1990'); // Default fallback
      }
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Prepare data for astrologer library
      const astroData = {
        year, month, date: day, hours: hour, minutes: minute, seconds: 0,
        latitude, longitude, timezone, chartType
      };

      // Generate natal chart
      const chart = this.astrologer.generateNatalChartData(astroData);

      // Return sun sign from interpretations
      return chart.interpretations.sunSign;
    } catch (error) {
      console.error('Error calculating sun sign with astrologer:', error);
      // Fallback to simplified calculation
      return this._calculateSunSignFallback(birthDate);
    }
  }

  /**
   * Fallback sun sign calculation using simplified dates
   * @private
   */
  _calculateSunSignFallback(birthDate) {
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

      for (const { sign, start, end } of signDates) {
        if ((month === start[1] && day >= start[0]) ||
            (month === end[1] && day <= end[0]) ||
            (month > start[1] && month < end[1])) {
          return sign;
        }
      }

      return 'Unknown';
    } catch (error) {
      console.error('Error in fallback sun sign calculation:', error);
      return 'Unknown';
    }
  }

  /**
   * Calculate moon sign (simplified)
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time in HH:MM format
   * @returns {string} Moon sign
   */
  calculateMoonSign(birthDate, birthTime, latitude = 28.6139, longitude = 77.2090, timezone = 5.5, chartType = 'sidereal') {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Prepare data for astrologer library
      const astroData = {
        year, month, date: day, hours: hour, minutes: minute, seconds: 0,
        latitude, longitude, timezone, chartType
      };

      // Generate natal chart
      const chart = this.astrologer.generateNatalChartData(astroData);

      // Return moon sign from interpretations
      return chart.interpretations.moonSign;
    } catch (error) {
      console.error('Error calculating moon sign with astrologer:', error);
      // Fallback to simplified calculation
      return this._calculateMoonSignFallback(birthDate, birthTime);
    }
  }

  /**
   * Fallback moon sign calculation
   * @private
   */
  _calculateMoonSignFallback(birthDate, birthTime) {
    try {
      // Simplified moon sign calculation
      const sunSign = this.calculateSunSign(birthDate);

      // Simple approximation: moon sign is usually 2-3 signs away from sun sign
      const signIndex = this.zodiacSigns.indexOf(sunSign);
      const moonSignIndex = (signIndex + 2) % 12; // Approximate

      return this.zodiacSigns[moonSignIndex];
    } catch (error) {
      console.error('Error in fallback moon sign calculation:', error);
      return 'Unknown';
    }
  }

  /**
   * Get coordinates for a place (simplified implementation)
   * @private
   */
  _getCoordinatesForPlace(place) {
    // Simplified geocoding - in production, use a proper geocoding service
    const placeCoords = {
      delhi: [28.6139, 77.2090],
      mumbai: [19.0760, 72.8777],
      bangalore: [12.9716, 77.5946],
      chennai: [13.0827, 80.2707],
      kolkata: [22.5726, 88.3639],
      hyderabad: [17.3850, 78.4867],
      pune: [18.5204, 73.8567],
      ahmedabad: [23.0225, 72.5714],
      jaipur: [26.9124, 75.7873],
      lucknow: [26.8467, 80.9462]
    };

    const normalizedPlace = place.toLowerCase();
    return placeCoords[normalizedPlace] || [28.6139, 77.2090]; // Default to Delhi
  }

  /**
   * Get timezone for a place (simplified implementation)
   * @private
   */
  _getTimezoneForPlace(place) {
    // Most Indian cities are IST (UTC+5:30)
    return 5.5;
  }

  /**
   * Format planet data for API response
   * @private
   */
  _formatPlanets(planets) {
    const formatted = {};
    Object.entries(planets).forEach(([key, data]) => {
      formatted[key] = {
        name: data.name,
        sign: data.signName,
        retrograde: data.retrograde,
        position: `${data.position.degrees}°${data.position.minutes}'${data.position.seconds}"`
      };
    });
    return formatted;
  }

  /**
    * Generate comprehensive natal chart using professional astrology library
    * @param {Object} user - User object with birth details
    * @returns {Object} Complete natal chart data
    */
  generateBasicBirthChart(user) {
    try {
      const { birthDate, birthTime, birthPlace, name } = user;

      // Parse birth place for coordinates (simplified - in production you'd use geocoding)
      const [latitude, longitude] = this._getCoordinatesForPlace(birthPlace);
      const timezone = this._getTimezoneForPlace(birthPlace);

      // Generate full natal chart
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      const astroData = {
        year, month, date: day, hours: hour, minutes: minute, seconds: 0,
        latitude, longitude, timezone, chartType: 'sidereal' // Vedic astrology
      };

      const chart = this.astrologer.generateNatalChartData(astroData);

      // Extract key information for backward compatibility
      const { sunSign } = chart.interpretations;
      const { moonSign } = chart.interpretations;
      const { risingSign } = chart.interpretations;

      // Generate enhanced description based on chart data
      const enhancedDescription = this._generateEnhancedDescription(chart);

      return {
        name,
        birthDate,
        birthTime,
        birthPlace,
        sunSign,
        moonSign,
        risingSign,
        dominantElements: chart.interpretations.dominantElements,
        dominantQualities: chart.interpretations.dominantQualities,
        planets: this._formatPlanets(chart.planets),
        chartPatterns: chart.chartPatterns,
        description: enhancedDescription,
        personalityTraits: this._extractPersonalityTraits(chart),
        strengths: this._extractStrengths(chart),
        challenges: this._extractChallenges(chart),
        fullChart: chart // Include complete chart data for advanced features
      };
    } catch (error) {
      console.error('Error generating natal chart:', error);
      return {
        name: user.name,
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        birthPlace: user.birthPlace,
        sunSign: 'Unknown',
        moonSign: 'Unknown',
        risingSign: 'Unknown',
        description: 'Unable to generate birth chart at this time.'
      };
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
   * Generate a detailed daily horoscope using professional astrology
   * @param {string} birthDate - User's birth date in DD/MM/YYYY format
   * @returns {Object} Detailed horoscope data
   */
  generateDailyHoroscope(birthDate) {
    try {
      if (!birthDate || typeof birthDate !== 'string') {
        throw new Error('Invalid birth date provided');
      }

      // Parse birth date
      const [day, month, year] = birthDate.split('/').map(Number);

      // Get current date for transit calculations
      const now = new Date();
      const currentDay = now.getDate();
      const currentMonth = now.getMonth() + 1; // JS months are 0-based
      const currentYear = now.getFullYear();

      // Use astrologer library for detailed analysis
      if (this.astrologer) {
        try {
          const natalData = {
            year, month, date: day, hours: 12, minutes: 0, seconds: 0,
            latitude: 28.6139, longitude: 77.2090, timezone: 5.5, chartType: 'sidereal'
          };

          const transitData = {
            year: currentYear, month: currentMonth, date: currentDay, hours: 12, minutes: 0, seconds: 0,
            latitude: 28.6139, longitude: 77.2090, timezone: 5.5, chartType: 'sidereal'
          };

          const natalChart = this._astrologer.generateNatalChartData(natalData);
          const transitChart = this._astrologer.generateTransitChartData(natalData, transitData);

          // Extract detailed insights
          const { sunSign } = natalChart.interpretations;
          const { moonSign } = natalChart.interpretations;
          const { risingSign } = natalChart.interpretations;

          // Generate personalized horoscope based on transits
          const aspects = transitChart.aspects || [];
          const planets = transitChart.planets || [];

          let general = `🌟 *${sunSign} Daily Guidance*\n\n`;
          let luckyColor = 'Blue';
          const luckyNumber = Math.floor(Math.random() * 9) + 1;
          let love = 'Focus on open communication in relationships.';
          let career = 'Stay focused on your goals today.';
          let finance = 'Be cautious with spending.';
          let health = 'Maintain balance in your daily routine.';

          // Analyze major transits
          if (aspects.some(a => a.planet1 === 'Sun' || a.planet2 === 'Sun')) {
            general += 'The Sun\'s energy brings confidence and vitality. ';
            career = 'Great day for leadership and creative projects.';
            luckyColor = 'Gold';
          }

          if (aspects.some(a => a.planet1 === 'Moon' || a.planet2 === 'Moon')) {
            general += 'Emotional awareness is heightened. ';
            love = 'Deep connections and understanding flow naturally.';
            health = 'Pay attention to your emotional well-being.';
            luckyColor = 'Silver';
          }

          if (aspects.some(a => a.planet1 === 'Venus' || a.planet2 === 'Venus')) {
            general += 'Harmony and beauty surround you. ';
            love = 'Romantic opportunities abound today.';
            finance = 'Good day for financial planning.';
            luckyColor = 'Green';
          }

          if (aspects.some(a => a.planet1 === 'Mars' || a.planet2 === 'Mars')) {
            general += 'Energy and motivation are strong. ';
            career = 'Perfect time for action and new beginnings.';
            health = 'Physical activities will be beneficial.';
            luckyColor = 'Red';
          }

          general += 'Trust your intuition and embrace the day\'s opportunities.';

          return {
            general,
            luckyColor,
            luckyNumber,
            love,
            career,
            finance,
            health
          };
        } catch (astrologerError) {
          console.warn('Astrologer library failed, falling back to basic horoscope:', astrologerError.message);
        }
      }

      // Fallback to basic horoscope by sun sign
      const sunSign = this.calculateSunSign(birthDate);
      const basicHoroscopes = {
        Aries: 'Today brings new opportunities for leadership. Trust your instincts and take bold action. Energy is high - channel it into productive activities.',
        Taurus: 'Focus on stability and practical matters. Your patience will be rewarded today. Ground yourself in what truly matters.',
        Gemini: 'Communication is key today. Express your ideas and connect with others. Your words have power - use them wisely.',
        Cancer: 'Pay attention to your emotions and home life. Nurture your relationships. Intuition is your greatest guide today.',
        Leo: 'Your creative energy is high today. Share your talents with the world. Confidence and charisma are your allies.',
        Virgo: 'Attention to detail will serve you well. Organize and plan for success. Your analytical mind is sharp today.',
        Libra: 'Seek balance and harmony in all your dealings. Diplomacy wins the day. Beauty and grace surround your path.',
        Scorpio: 'Trust your intuition. Deep insights will guide you to important truths. Transformation is possible today.',
        Sagittarius: 'Adventure calls! Expand your horizons and explore new possibilities. Freedom and exploration bring joy.',
        Capricorn: 'Focus on long-term goals. Your ambition will lead to achievement. Discipline leads to success today.',
        Aquarius: 'Innovation and originality will set you apart. Think outside the box. Progressive ideas flow freely.',
        Pisces: 'Trust your imagination. Creative and spiritual pursuits bring fulfillment. Compassion guides your actions.'
      };

      const horoscope = basicHoroscopes[sunSign] || 'Today brings opportunities for growth and self-discovery. Trust your inner wisdom and embrace new possibilities.';

      return {
        general: horoscope,
        luckyColor: 'Blue',
        luckyNumber: Math.floor(Math.random() * 9) + 1,
        love: 'Open your heart to meaningful connections.',
        career: 'Focus on steady progress toward your goals.',
        finance: 'Be mindful of your resources.',
        health: 'Listen to your body\'s needs.'
      };
    } catch (error) {
      console.error('Error generating daily horoscope:', error);
      return {
        general: 'Today brings opportunities for growth and self-discovery. Trust your inner wisdom.',
        luckyColor: 'Blue',
        luckyNumber: 7,
        love: 'Focus on meaningful connections.',
        career: 'Stay focused on your goals.',
        finance: 'Be mindful with resources.',
        health: 'Take care of your well-being.'
      };
    }
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
   * Generate detailed birth chart analysis
   * @param {Object} birthData - Birth data object
   * @returns {Object} Detailed chart data
   */
  async generateDetailedChart(birthData) {
    const { birthDate, birthTime, birthPlace } = birthData;

    const sunSign = this.calculateSunSign(birthDate);
    const moonSign = this.calculateMoonSign(birthDate, birthTime);
    const risingSign = this.calculateRisingSign(birthDate, birthTime, birthPlace);

    // Generate life patterns based on sun sign
    const lifePatterns = this.generateLifePatterns(sunSign);

    return {
      sunSign,
      moonSign,
      risingSign,
      lifePatterns
    };
  }

  /**
   * Generate 3-day transit preview
   * @param {Object} birthData - Birth data
   * @param {number} days - Number of days
   * @returns {Object} Transit preview
   */
  async generateTransitPreview(birthData, days = 3) {
    // Simplified transit preview
    const transits = {
      today: '🌅 *Today:* Planetary energies support new beginnings and communication. Perfect for starting conversations or initiating projects.',
      tomorrow: '🌞 *Tomorrow:* Focus on relationships and partnerships. Harmonious energies make this a good day for collaboration.',
      day3: '🌙 *Day 3:* Creative inspiration flows strongly. Use this energy for artistic pursuits or innovative thinking.'
    };

    return transits;
  }

  /**
   * Calculate moon sign (simplified)
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time
   * @returns {string} Moon sign
   */


  /**
   * Calculate rising sign (simplified)
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time
   * @param {string} birthPlace - Birth place
   * @returns {string} Rising sign
   */
  calculateRisingSign(birthDate, birthTime, birthPlace) {
    // Simplified calculation - in reality this requires complex astronomical calculations
    const signs = this.zodiacSigns;
    const [day, month] = birthDate.split('/').map(Number);
    const dayOfYear = this.getDayOfYear(day, month);
    return signs[(dayOfYear + 8) % 12]; // Offset for rising
  }

  /**
   * Generate life patterns based on sun sign
   * @param {string} sunSign - Sun sign
   * @returns {Array} Life patterns
   */
  generateLifePatterns(sunSign) {
    const patterns = {
      Aries: ['Natural leadership and initiative', 'Competitive drive and courage', 'Independent problem-solving'],
      Taurus: ['Practical and reliable nature', 'Strong work ethic and patience', 'Appreciation for beauty and comfort'],
      Gemini: ['Excellent communication skills', 'Adaptable and versatile mind', 'Curious and intellectual pursuits'],
      Cancer: ['Deep emotional intelligence', 'Strong intuition and empathy', 'Protective of loved ones'],
      Leo: ['Creative self-expression', 'Natural charisma and confidence', 'Generous and warm-hearted'],
      Virgo: ['Attention to detail and precision', 'Analytical and helpful nature', 'Strong sense of duty'],
      Libra: ['Diplomatic and fair-minded', 'Appreciation for harmony and balance', 'Social and cooperative'],
      Scorpio: ['Intense emotional depth', 'Powerful intuition and insight', 'Transformative resilience'],
      Sagittarius: ['Adventurous and optimistic spirit', 'Love of learning and exploration', 'Honest and philosophical'],
      Capricorn: ['Ambitious and disciplined', 'Strong sense of responsibility', 'Patient long-term planning'],
      Aquarius: ['Innovative and humanitarian', 'Independent thinking', 'Progressive and forward-looking'],
      Pisces: ['Compassionate and artistic', 'Strong imagination and intuition', 'Spiritual and empathetic']
    };

    return patterns[sunSign] || ['Strong communication abilities', 'Natural leadership qualities', 'Creative problem-solving skills'];
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

  /**
   * Generate enhanced description based on complete chart data
   * @private
   * @param {Object} chart - Complete chart data from astrologer
   * @returns {string} Enhanced description
   */
  _generateEnhancedDescription(chart) {
    const { sunSign, moonSign, risingSign, dominantElements, dominantQualities, chartPatterns } = chart.interpretations;

    let description = `Your natal chart reveals a ${sunSign} Sun, ${moonSign} Moon, and ${risingSign} Rising. `;

    // Add dominant elements insight
    if (dominantElements && dominantElements.length > 0) {
      const elements = dominantElements.join(' and ');
      description += `The dominant ${elements} element${dominantElements.length > 1 ? 's' : ''} in your chart ${dominantElements.length > 1 ? 'bring' : 'brings'} balance and harmony to your personality. `;
    }

    // Add chart patterns insight
    if (chartPatterns && chartPatterns.stelliums && chartPatterns.stelliums.length > 0) {
      description += `A stellium in ${chartPatterns.stelliums[0]} indicates concentrated energy in this area of life. `;
    }

    // Add element emphasis insight
    if (chartPatterns && chartPatterns.elementEmphasis) {
      const maxElement = Object.entries(chartPatterns.elementEmphasis)
        .reduce((a, b) => (chartPatterns.elementEmphasis[a[0]] > chartPatterns.elementEmphasis[b[0]] ? a : b))[0];
      description += `Your chart shows strong ${maxElement} energy, suggesting ${this._getElementDescription(maxElement)}.`;
    }

    return description;
  }

  /**
   * Extract personality traits from chart
   * @private
   * @param {Object} chart - Chart data
   * @returns {Array} Personality traits
   */
  _extractPersonalityTraits(chart) {
    const traits = [];
    const { sunSign, moonSign, risingSign } = chart.interpretations;

    // Sun sign traits
    const sunTraits = {
      Aries: ['Bold', 'Energetic', 'Independent'],
      Taurus: ['Reliable', 'Patient', 'Practical'],
      Gemini: ['Adaptable', 'Communicative', 'Curious'],
      Cancer: ['Intuitive', 'Nurturing', 'Emotional'],
      Leo: ['Creative', 'Confident', 'Generous'],
      Virgo: ['Analytical', 'Helpful', 'Detail-oriented'],
      Libra: ['Diplomatic', 'Harmonious', 'Social'],
      Scorpio: ['Intense', 'Passionate', 'Resilient'],
      Sagittarius: ['Adventurous', 'Optimistic', 'Honest'],
      Capricorn: ['Ambitious', 'Disciplined', 'Responsible'],
      Aquarius: ['Innovative', 'Independent', 'Humanitarian'],
      Pisces: ['Compassionate', 'Imaginative', 'Spiritual']
    };

    // Moon sign traits (emotional nature)
    const moonTraits = {
      Aries: ['Spontaneous', 'Direct', 'Protective'],
      Taurus: ['Stable', 'Comfort-loving', 'Persistent'],
      Gemini: ['Versatile', 'Expressive', 'Restless'],
      Cancer: ['Sensitive', 'Caring', 'Instinctive'],
      Leo: ['Dramatic', 'Loyal', 'Proud'],
      Virgo: ['Practical', 'Critical', 'Service-oriented'],
      Libra: ['Balanced', 'Charming', 'Indecisive'],
      Scorpio: ['Intense', 'Secretive', 'Powerful'],
      Sagittarius: ['Freedom-loving', 'Philosophical', 'Restless'],
      Capricorn: ['Reserved', 'Ambitious', 'Structured'],
      Aquarius: ['Unconventional', 'Intellectual', 'Detached'],
      Pisces: ['Dreamy', 'Empathetic', 'Intuitive']
    };

    // Rising sign traits (outward personality)
    const risingTraits = {
      Aries: ['Confident', 'Assertive', 'Pioneering'],
      Taurus: ['Steady', 'Reliable', 'Sensual'],
      Gemini: ['Versatile', 'Curious', 'Communicative'],
      Cancer: ['Protective', 'Intuitive', 'Nurturing'],
      Leo: ['Dramatic', 'Charismatic', 'Creative'],
      Virgo: ['Precise', 'Analytical', 'Helpful'],
      Libra: ['Charming', 'Diplomatic', 'Fair-minded'],
      Scorpio: ['Intense', 'Mysterious', 'Powerful'],
      Sagittarius: ['Adventurous', 'Optimistic', 'Honest'],
      Capricorn: ['Ambitious', 'Responsible', 'Structured'],
      Aquarius: ['Innovative', 'Independent', 'Humanitarian'],
      Pisces: ['Dreamy', 'Compassionate', 'Artistic']
    };

    traits.push(...(sunTraits[sunSign] || []));
    traits.push(...(moonTraits[moonSign] || []));
    traits.push(...(risingTraits[risingSign] || []));

    // Remove duplicates and return unique traits
    return [...new Set(traits)].slice(0, 6); // Limit to 6 traits
  }

  /**
   * Extract strengths from chart
   * @private
   * @param {Object} chart - Chart data
   * @returns {Array} Strengths
   */
  _extractStrengths(chart) {
    const { dominantElements, chartPatterns } = chart.interpretations;
    const strengths = [];

    // Element-based strengths
    if (dominantElements && dominantElements.includes('fire')) {
      strengths.push('Leadership and initiative');
    }
    if (dominantElements && dominantElements.includes('earth')) {
      strengths.push('Practicality and reliability');
    }
    if (dominantElements && dominantElements.includes('air')) {
      strengths.push('Communication and intellect');
    }
    if (dominantElements && dominantElements.includes('water')) {
      strengths.push('Emotional intelligence and intuition');
    }

    // Chart pattern strengths
    if (chartPatterns && chartPatterns.stelliums && chartPatterns.stelliums.length > 0) {
      strengths.push('Concentrated expertise in specific areas');
    }

    // Planetary strengths
    const { planets } = chart;
    if (planets.jupiter && planets.jupiter.sign) {
      strengths.push('Optimism and growth orientation');
    }
    if (planets.mercury && planets.mercury.sign) {
      strengths.push('Strong communication skills');
    }

    return strengths.slice(0, 4); // Limit to 4 strengths
  }

  /**
   * Extract challenges from chart
   * @private
   * @param {Object} chart - Chart data
   * @returns {Array} Challenges
   */
  _extractChallenges(chart) {
    const { dominantQualities, chartPatterns } = chart.interpretations;
    const challenges = [];

    // Quality-based challenges
    if (dominantQualities && dominantQualities.includes('cardinal')) {
      challenges.push('Need to balance initiative with patience');
    }
    if (dominantQualities && dominantQualities.includes('fixed')) {
      challenges.push('Learning to adapt to change');
    }

    // Element imbalance challenges
    if (chartPatterns && chartPatterns.elementEmphasis) {
      const elements = Object.entries(chartPatterns.elementEmphasis);
      const minElement = elements.reduce((a, b) => (chartPatterns.elementEmphasis[a[0]] < chartPatterns.elementEmphasis[b[0]] ? a : b))[0];

      if (minElement === 'fire') {
        challenges.push('Developing motivation and drive');
      } else if (minElement === 'earth') {
        challenges.push('Building practical foundations');
      } else if (minElement === 'air') {
        challenges.push('Improving communication and social skills');
      } else if (minElement === 'water') {
        challenges.push('Developing emotional awareness');
      }
    }

    // Retrograde planets as challenges
    const { planets } = chart;
    let retrogradeCount = 0;
    Object.values(planets).forEach(planet => {
      if (planet.retrograde) { retrogradeCount++; }
    });

    if (retrogradeCount > 2) {
      challenges.push('Internal reflection and reassessment');
    }

    return challenges.slice(0, 3); // Limit to 3 challenges
  }

  /**
   * Get element description
   * @private
   * @param {string} element - Element name
   * @returns {string} Description
   */
  _getElementDescription(element) {
    const descriptions = {
      fire: 'passion, creativity, and leadership abilities',
      earth: 'practicality, stability, and material success',
      air: 'intellectual pursuits, communication, and social connections',
      water: 'emotional depth, intuition, and healing abilities'
    };
    return descriptions[element] || 'unique qualities and perspectives';
  }

  /**
   * Get major planetary aspects from chart
   * @private
   * @param {Object} chart - Chart data
   * @returns {Array} Major aspects
   */
  _getMajorAspects(chart) {
    const aspects = [];
    const { planets } = chart;

    // Define aspect angles (in degrees)
    const aspects_def = {
      conjunction: 0,
      sextile: 60,
      square: 90,
      trine: 120,
      opposition: 180
    };

    const planetKeys = Object.keys(planets);

    // Check for major aspects between planets
    for (let i = 0; i < planetKeys.length; i++) {
      for (let j = i + 1; j < planetKeys.length; j++) {
        const planet1 = planets[planetKeys[i]];
        const planet2 = planets[planetKeys[j]];

        if (planet1.longitude && planet2.longitude) {
          const angle = Math.abs(planet1.longitude - planet2.longitude) % 360;
          const minAngle = Math.min(angle, 360 - angle);

          // Check for major aspects (within 5 degrees orb)
          Object.entries(aspects_def).forEach(([aspectName, aspectAngle]) => {
            if (Math.abs(minAngle - aspectAngle) <= 5) {
              aspects.push({
                planets: `${planet1.name}-${planet2.name}`,
                aspect: aspectName,
                angle: Math.round(minAngle * 10) / 10
              });
            }
          });
        }
      }
    }

    return aspects.slice(0, 5); // Return top 5 aspects
  }

  /**
   * Get stellium interpretation
   * @private
   * @param {Array} stelliums - Stellium signs
   * @returns {string} Interpretation
   */
  _getStelliumInterpretation(stelliums) {
    if (!stelliums || stelliums.length === 0) { return ''; }

    const sign = stelliums[0];
    const interpretations = {
      Aries: 'intense focus on personal identity and self-expression',
      Taurus: 'strong emphasis on material security and sensory experiences',
      Gemini: 'heightened communication and intellectual pursuits',
      Cancer: 'deep emotional connections and family matters',
      Leo: 'creative self-expression and leadership qualities',
      Virgo: 'attention to detail and service to others',
      Libra: 'focus on relationships and harmony',
      Scorpio: 'intense transformation and deep psychological insights',
      Sagittarius: 'philosophical exploration and adventure',
      Capricorn: 'career ambitions and long-term planning',
      Aquarius: 'innovation and humanitarian concerns',
      Pisces: 'spiritual growth and artistic expression'
    };

    return interpretations[sign] || 'concentrated energy in specific life areas';
  }

  /**
   * Generate detailed chart analysis with aspects and patterns
   * @param {Object} user - User object with birth details
   * @returns {Object} Detailed chart analysis
   */
  generateDetailedChartAnalysis(user) {
    try {
      const basicChart = this.generateBasicBirthChart(user);
      const { fullChart } = basicChart;

      // Get major aspects
      const majorAspects = this._getMajorAspects(fullChart);

      // Enhanced analysis
      const analysis = {
        ...basicChart,
        majorAspects,
        stelliumInterpretation: this._getStelliumInterpretation(fullChart.chartPatterns?.stelliums),
        elementBalance: this._analyzeElementBalance(fullChart.chartPatterns?.elementEmphasis),
        lifePurpose: this._deriveLifePurpose(basicChart),
        currentTransits: this._getCurrentTransits(basicChart.sunSign)
      };

      return analysis;
    } catch (error) {
      console.error('Error generating detailed chart analysis:', error);
      return this.generateBasicBirthChart(user); // Fallback to basic chart
    }
  }

  /**
   * Analyze element balance
   * @private
   * @param {Object} elementEmphasis - Element emphasis data
   * @returns {string} Element balance analysis
   */
  _analyzeElementBalance(elementEmphasis) {
    if (!elementEmphasis) { return 'Balanced elemental energies'; }

    const elements = Object.entries(elementEmphasis);
    const sorted = elements.sort((a, b) => b[1] - a[1]);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];

    let analysis = `Strongest element: ${strongest[0]} (${strongest[1]} planets)`;
    if (weakest[1] === 0) {
      analysis += `. Consider developing ${weakest[0]} qualities for better balance.`;
    }

    return analysis;
  }

  /**
   * Derive life purpose from chart
   * @private
   * @param {Object} chart - Chart data
   * @returns {string} Life purpose insight
   */
  _deriveLifePurpose(chart) {
    const { sunSign, moonSign, risingSign, dominantElements } = chart;

    // Simple life purpose derivation based on sun sign and dominant elements
    const purposes = {
      Aries: 'To lead and initiate new beginnings',
      Taurus: 'To build stability and appreciate beauty',
      Gemini: 'To communicate and share knowledge',
      Cancer: 'To nurture and create emotional security',
      Leo: 'To create and inspire others',
      Virgo: 'To serve and improve systems',
      Libra: 'To harmonize and create balance',
      Scorpio: 'To transform and seek deeper truths',
      Sagittarius: 'To explore and expand horizons',
      Capricorn: 'To achieve and build lasting structures',
      Aquarius: 'To innovate and benefit humanity',
      Pisces: 'To heal and connect spiritually'
    };

    let purpose = purposes[sunSign] || 'To discover and fulfill your unique potential';

    if (dominantElements && dominantElements.includes('fire')) {
      purpose += ', channeling your creative fire into meaningful action';
    } else if (dominantElements && dominantElements.includes('earth')) {
      purpose += ', grounding your practical abilities in service to others';
    } else if (dominantElements && dominantElements.includes('air')) {
      purpose += ', using your intellect to bridge understanding';
    } else if (dominantElements && dominantElements.includes('water')) {
      purpose += ', flowing with emotional wisdom to heal and connect';
    }

    return purpose;
  }

  /**
   * Get current transits insight
   * @private
   * @param {string} sunSign - Sun sign
   * @returns {string} Current transits insight
   */
  _getCurrentTransits(sunSign) {
    // Simplified current transits based on sun sign
    const transits = {
      Aries: 'Mars energy is activating your drive and initiative',
      Taurus: 'Venus is enhancing your appreciation for beauty and stability',
      Gemini: 'Mercury is stimulating your communication and learning',
      Cancer: 'The Moon is heightening your emotional awareness',
      Leo: 'The Sun is boosting your confidence and creativity',
      Virgo: 'Mercury is focusing your attention on details and service',
      Libra: 'Venus is promoting harmony in your relationships',
      Scorpio: 'Pluto is encouraging deep transformation',
      Sagittarius: 'Jupiter is expanding your horizons',
      Capricorn: 'Saturn is teaching valuable life lessons',
      Aquarius: 'Uranus is inspiring innovation and change',
      Pisces: 'Neptune is enhancing your intuition and spirituality'
    };

    return transits[sunSign] || 'Current cosmic energies are supporting your growth and evolution';
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
      Excellent: `${sign1} and ${sign2} share great compatibility. You complement each other's strengths and understand each other's needs intuitively.`,
      Good: `${sign1} and ${sign2} have good compatibility with some complementary energies. With understanding, this can be a harmonious relationship.`,
      Neutral: `${sign1} and ${sign2} have neutral compatibility. While you may not be natural soulmates, mutual respect and communication can build a strong connection.`
    };

    return descriptions[rating] || 'This combination has unique dynamics that require understanding and patience to navigate successfully.';
  }
}

module.exports = new VedicCalculator();
