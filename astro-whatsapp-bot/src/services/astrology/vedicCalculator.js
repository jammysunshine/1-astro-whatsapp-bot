const logger = require('../../utils/logger');

/**
 * Professional Vedic Astrology Calculator with Astrologer Library
 * Provides complete natal chart analysis using Swiss Ephemeris and astrological interpretations
 */

const { Astrologer } = require('astrologer');
const sweph = require('sweph');

class VedicCalculator {
  constructor() {
    logger.info('Module: VedicCalculator loaded.');
    // Lazy initialize the astrologer library to save memory
    this._astrologer = null;

    // Set ephemeris path for sweph (used internally by astrologer)
    try {
      logger.info('Attempting to set Swiss Ephemeris path...');
      sweph.set_ephe_path('./ephe');
      logger.info('Swiss Ephemeris path set successfully.');
    } catch (error) {
      logger.error('❌ Error setting Swiss Ephemeris path:', error.message);
      logger.warn(
        'Swiss Ephemeris data files not found or inaccessible. Falling back to built-in calculations.'
      );
    }

    // Initialize astrologer library
    try {
      logger.info('Attempting to initialize astrologer library...');
      this._astrologer = new Astrologer();
      logger.info('Astrologer library initialized successfully.');
    } catch (error) {
      logger.error('❌ Error initializing astrologer library:', error.message);
      throw new Error(
        'Failed to initialize core astrology library. Please check dependencies and environment.'
      );
    }

    // Zodiac signs (for backward compatibility)
    this.zodiacSigns = [
      'Aries',
      'Taurus',
      'Gemini',
      'Cancer',
      'Leo',
      'Virgo',
      'Libra',
      'Scorpio',
      'Sagittarius',
      'Capricorn',
      'Aquarius',
      'Pisces'
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
  calculateSunSign(
    birthDate,
    birthTime = '12:00',
    latitude = 28.6139,
    longitude = 77.209,
    timezone = 5.5,
    chartType = 'sidereal'
  ) {
    try {
      if (!birthDate || typeof birthDate !== 'string') {
        logger.error(
          'Invalid birthDate provided to calculateSunSign:',
          { birthDate, type: typeof birthDate }
        );
        return this._calculateSunSignFallback('01/01/1990'); // Default fallback
      }
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Prepare data for astrologer library
      const astroData = {
        year,
        month,
        date: day,
        hours: hour,
        minutes: minute,
        seconds: 0,
        latitude,
        longitude,
        timezone,
        chartType
      };

      // Generate natal chart
      const chart = this.astrologer.generateNatalChartData(astroData);

      // Return sun sign from interpretations
      return chart.interpretations.sunSign;
    } catch (error) {
      logger.error('Error calculating sun sign with astrologer:', error);
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
        if (
          (month === start[1] && day >= start[0]) ||
          (month === end[1] && day <= end[0]) ||
          (month > start[1] && month < end[1])
        ) {
          return sign;
        }
      }

      return 'Unknown';
    } catch (error) {
      logger.error('Error in fallback sun sign calculation:', error);
      return 'Unknown';
    }
  }

  /**
   * Calculate moon sign (simplified)
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time in HH:MM format
   * @returns {string} Moon sign
   */
  calculateMoonSign(
    birthDate,
    birthTime,
    latitude = 28.6139,
    longitude = 77.209,
    timezone = 5.5,
    chartType = 'sidereal'
  ) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Prepare data for astrologer library
      const astroData = {
        year,
        month,
        date: day,
        hours: hour,
        minutes: minute,
        seconds: 0,
        latitude,
        longitude,
        timezone,
        chartType
      };

      // Generate natal chart
      const chart = this.astrologer.generateNatalChartData(astroData);

      // Return moon sign from interpretations
      return chart.interpretations.moonSign;
    } catch (error) {
      logger.error('Error calculating moon sign with astrologer:', error);
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
      logger.error('Error in fallback moon sign calculation:', error);
      return 'Unknown';
    }
  }

  /**
   * Get coordinates for a place (simplified implementation)
   * TODO: Implement proper geocoding service for accurate coordinates
   * @private
   */
  _getCoordinatesForPlace(place) {
    // Simplified geocoding - in production, integrate with a geocoding API like Google Maps or OpenStreetMap
    const placeCoords = {
      // India
      delhi: [28.6139, 77.209],
      mumbai: [19.076, 72.8777],
      bangalore: [12.9716, 77.5946],
      chennai: [13.0827, 80.2707],
      kolkata: [22.5726, 88.3639],
      hyderabad: [17.385, 78.4867],
      pune: [18.5204, 73.8567],
      ahmedabad: [23.0225, 72.5714],
      jaipur: [26.9124, 75.7873],
      lucknow: [26.8467, 80.9462],
      surat: [21.1702, 72.8311],
      kanpur: [26.4499, 80.3319],
      nagpur: [21.1458, 79.0882],
      patna: [25.5941, 85.1376],
      indore: [22.7196, 75.8577],
      vadodara: [22.3072, 73.1812],
      bhopal: [23.2599, 77.4126],
      coimbatore: [11.0168, 76.9558],
      ludhiana: [30.9010, 75.8573],
      agra: [27.1767, 78.0081],
      // UAE
      dubai: [25.2048, 55.2708],
      abudhabi: [24.4539, 54.3773],
      sharjah: [25.3463, 55.4209],
      // Australia
      sydney: [-33.8688, 151.2093],
      melbourne: [-37.8136, 144.9631],
      brisbane: [-27.4698, 153.0251],
      perth: [-31.9505, 115.8605],
      // Default
      default: [28.6139, 77.209] // Delhi
    };

    const normalizedPlace = place.toLowerCase().replace(/\s+/g, '');
    return placeCoords[normalizedPlace] || placeCoords.default;
  }

  /**
   * Get timezone for a place (simplified implementation)
   * TODO: Implement proper timezone service for accurate timezone calculations
   * @private
   */
  _getTimezoneForPlace(place) {
    // Simplified timezone mapping - in production, use a timezone API
    const placeTimezones = {
      // India (IST: UTC+5:30)
      delhi: 5.5, mumbai: 5.5, bangalore: 5.5, chennai: 5.5, kolkata: 5.5,
      hyderabad: 5.5, pune: 5.5, ahmedabad: 5.5, jaipur: 5.5, lucknow: 5.5,
      surat: 5.5, kanpur: 5.5, nagpur: 5.5, patna: 5.5, indore: 5.5,
      vadodara: 5.5, bhopal: 5.5, coimbatore: 5.5, ludhiana: 5.5, agra: 5.5,
      // UAE (GST: UTC+4)
      dubai: 4, abudhabi: 4, sharjah: 4,
      // Australia
      sydney: 10, melbourne: 10, brisbane: 10, perth: 8,
      // Default
      default: 5.5 // IST
    };

    const normalizedPlace = place.toLowerCase().replace(/\s+/g, '');
    return placeTimezones[normalizedPlace] || placeTimezones.default;
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
        degrees: data.position.degrees,
        minutes: data.position.minutes,
        seconds: data.position.seconds,
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
        year,
        month,
        date: day,
        hours: hour,
        minutes: minute,
        seconds: 0,
        latitude,
        longitude,
        timezone,
        chartType: 'sidereal' // Vedic astrology
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
      logger.error('Error generating natal chart:', error);
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
      'Aries-Leo':
        'a dynamic and confident personality with strong leadership qualities',
      'Taurus-Virgo':
        'a practical and reliable nature with attention to detail',
      'Gemini-Libra':
        'a communicative and social personality with diplomatic skills',
      'Cancer-Scorpio': 'an intuitive and emotional nature with deep feelings',
      'Leo-Sagittarius':
        'an enthusiastic and optimistic outlook with creative energy',
      'Virgo-Capricorn':
        'a disciplined and responsible character with strong work ethic',
      'Libra-Aquarius':
        'a harmonious and idealistic nature with social consciousness',
      'Scorpio-Pisces':
        'an intense and compassionate personality with spiritual depth',
      'Sagittarius-Aries':
        'an adventurous and independent spirit with pioneering energy',
      'Capricorn-Taurus':
        'a determined and practical approach with material success focus',
      'Aquarius-Gemini':
        'an innovative and intellectual mind with humanitarian ideals',
      'Pisces-Cancer':
        'a sensitive and imaginative nature with artistic tendencies'
    };

    const key = `${sunSign}-${moonSign}`;
    return (
      descriptions[key] ||
      'a unique combination of energies that make you special'
    );
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
            year,
            month,
            date: day,
            hours: 12,
            minutes: 0,
            seconds: 0,
            latitude: 28.6139,
            longitude: 77.209,
            timezone: 5.5,
            chartType: 'sidereal'
          };

          const transitData = {
            year: currentYear,
            month: currentMonth,
            date: currentDay,
            hours: 12,
            minutes: 0,
            seconds: 0,
            latitude: 28.6139,
            longitude: 77.209,
            timezone: 5.5,
            chartType: 'sidereal'
          };

          const natalChart = this.astrologer.generateNatalChartData(natalData);
          const transitChart = this.astrologer.generateTransitChartData(
            natalData,
            transitData
          );

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

          if (
            aspects.some(a => a.planet1 === 'Venus' || a.planet2 === 'Venus')
          ) {
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

          general +=
            'Trust your intuition and embrace the day\'s opportunities.';

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
          logger.warn(
            'Astrologer library failed, falling back to basic horoscope:',
            astrologerError.message
          );
        }
      }

      // Fallback to basic horoscope by sun sign
      const sunSign = this.calculateSunSign(birthDate);
      const basicHoroscopes = {
        Aries:
          'Today brings new opportunities for leadership. Trust your instincts and take bold action. Energy is high - channel it into productive activities.',
        Taurus:
          'Focus on stability and practical matters. Your patience will be rewarded today. Ground yourself in what truly matters.',
        Gemini:
          'Communication is key today. Express your ideas and connect with others. Your words have power - use them wisely.',
        Cancer:
          'Pay attention to your emotions and home life. Nurture your relationships. Intuition is your greatest guide today.',
        Leo: 'Your creative energy is high today. Share your talents with the world. Confidence and charisma are your allies.',
        Virgo:
          'Attention to detail will serve you well. Organize and plan for success. Your analytical mind is sharp today.',
        Libra:
          'Seek balance and harmony in all your dealings. Diplomacy wins the day. Beauty and grace surround your path.',
        Scorpio:
          'Trust your intuition. Deep insights will guide you to important truths. Transformation is possible today.',
        Sagittarius:
          'Adventure calls! Expand your horizons and explore new possibilities. Freedom and exploration bring joy.',
        Capricorn:
          'Focus on long-term goals. Your ambition will lead to achievement. Discipline leads to success today.',
        Aquarius:
          'Innovation and originality will set you apart. Think outside the box. Progressive ideas flow freely.',
        Pisces:
          'Trust your imagination. Creative and spiritual pursuits bring fulfillment. Compassion guides your actions.'
      };

      const horoscope =
        basicHoroscopes[sunSign] ||
        'Today brings opportunities for growth and self-discovery. Trust your inner wisdom and embrace new possibilities.';

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
      logger.error('Error generating daily horoscope:', error);
      return {
        general:
          'Today brings opportunities for growth and self-discovery. Trust your inner wisdom.',
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
    const risingSign = this.calculateRisingSign(
      birthDate,
      birthTime,
      birthPlace
    );

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
      today:
        '🌅 *Today:* Planetary energies support new beginnings and communication. Perfect for starting conversations or initiating projects.',
      tomorrow:
        '🌞 *Tomorrow:* Focus on relationships and partnerships. Harmonious energies make this a good day for collaboration.',
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
      Aries: [
        'Natural leadership and initiative',
        'Competitive drive and courage',
        'Independent problem-solving'
      ],
      Taurus: [
        'Practical and reliable nature',
        'Strong work ethic and patience',
        'Appreciation for beauty and comfort'
      ],
      Gemini: [
        'Excellent communication skills',
        'Adaptable and versatile mind',
        'Curious and intellectual pursuits'
      ],
      Cancer: [
        'Deep emotional intelligence',
        'Strong intuition and empathy',
        'Protective of loved ones'
      ],
      Leo: [
        'Creative self-expression',
        'Natural charisma and confidence',
        'Generous and warm-hearted'
      ],
      Virgo: [
        'Attention to detail and precision',
        'Analytical and helpful nature',
        'Strong sense of duty'
      ],
      Libra: [
        'Diplomatic and fair-minded',
        'Appreciation for harmony and balance',
        'Social and cooperative'
      ],
      Scorpio: [
        'Intense emotional depth',
        'Powerful intuition and insight',
        'Transformative resilience'
      ],
      Sagittarius: [
        'Adventurous and optimistic spirit',
        'Love of learning and exploration',
        'Honest and philosophical'
      ],
      Capricorn: [
        'Ambitious and disciplined',
        'Strong sense of responsibility',
        'Patient long-term planning'
      ],
      Aquarius: [
        'Innovative and humanitarian',
        'Independent thinking',
        'Progressive and forward-looking'
      ],
      Pisces: [
        'Compassionate and artistic',
        'Strong imagination and intuition',
        'Spiritual and empathetic'
      ]
    };

    return (
      patterns[sunSign] || [
        'Strong communication abilities',
        'Natural leadership qualities',
        'Creative problem-solving skills'
      ]
    );
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
    const {
      sunSign,
      moonSign,
      risingSign,
      dominantElements,
      dominantQualities,
      chartPatterns
    } = chart.interpretations;

    let description = `Your natal chart reveals a ${sunSign} Sun, ${moonSign} Moon, and ${risingSign} Rising. `;

    // Add dominant elements insight
    if (dominantElements && dominantElements.length > 0) {
      const elements = dominantElements.join(' and ');
      description += `The dominant ${elements} element${dominantElements.length > 1 ? 's' : ''} in your chart ${dominantElements.length > 1 ? 'bring' : 'brings'} balance and harmony to your personality. `;
    }

    // Add chart patterns insight
    if (
      chartPatterns &&
      chartPatterns.stelliums &&
      chartPatterns.stelliums.length > 0
    ) {
      description += `A stellium in ${chartPatterns.stelliums[0]} indicates concentrated energy in this area of life. `;
    }

    // Add element emphasis insight
    if (chartPatterns && chartPatterns.elementEmphasis) {
      const maxElement = Object.entries(chartPatterns.elementEmphasis).reduce(
        (a, b) =>
          (chartPatterns.elementEmphasis[a[0]] >
          chartPatterns.elementEmphasis[b[0]] ?
            a :
            b)
      )[0];
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
    if (
      chartPatterns &&
      chartPatterns.stelliums &&
      chartPatterns.stelliums.length > 0
    ) {
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
      const minElement = elements.reduce((a, b) =>
        (chartPatterns.elementEmphasis[a[0]] <
        chartPatterns.elementEmphasis[b[0]] ?
          a :
          b)
      )[0];

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
      if (planet.retrograde) {
        retrogradeCount++;
      }
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
    if (!stelliums || stelliums.length === 0) {
      return '';
    }

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

    return (
      interpretations[sign] || 'concentrated energy in specific life areas'
    );
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
        stelliumInterpretation: this._getStelliumInterpretation(
          fullChart.chartPatterns?.stelliums
        ),
        elementBalance: this._analyzeElementBalance(
          fullChart.chartPatterns?.elementEmphasis
        ),
        lifePurpose: this._deriveLifePurpose(basicChart),
        currentTransits: this._getCurrentTransits(basicChart.sunSign)
      };

      return analysis;
    } catch (error) {
      logger.error('Error generating detailed chart analysis:', error);
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
    if (!elementEmphasis) {
      return 'Balanced elemental energies';
    }

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

    let purpose =
      purposes[sunSign] || 'To discover and fulfill your unique potential';

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

    return (
      transits[sunSign] ||
      'Current cosmic energies are supporting your growth and evolution'
    );
  }

  /**
   * Calculate Vimshottari Dasha periods (Mahadasha and Antardasha)
   * @param {Object} birthData - Birth data object
   * @returns {Object} Dasha calculations
   */
  calculateVimshottariDasha(birthData) {
    try {
      const { birthDate, birthTime } = birthData;
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Calculate moon sign for dasha start
      const moonLongitude = this.calculateMoonLongitude(
        year,
        month,
        day,
        hour,
        minute
      );

      // Vimshottari Dasha periods (years)
      const dashaPeriods = {
        sun: 6,
        moon: 10,
        mars: 7,
        rahu: 18,
        jupiter: 16,
        saturn: 19,
        mercury: 17,
        ketu: 7,
        venus: 20
      };

      // Calculate starting dasha based on moon's position
      const startingDasha = this.getStartingDasha(moonLongitude);
      const currentDate = new Date();
      const birthDateObj = new Date(year, month - 1, day, hour, minute);

      // Calculate current dasha
      const currentDasha = this.calculateCurrentDasha(
        birthDateObj,
        currentDate,
        startingDasha,
        dashaPeriods
      );

      // Calculate upcoming dashas
      const upcomingDashas = this.calculateUpcomingDashas(
        currentDasha,
        dashaPeriods
      );

      return {
        system: 'Vimshottari',
        startingDasha,
        currentDasha,
        upcomingDashas,
        antardasha: this.calculateAntardasha(
          currentDasha.dasha,
          birthDateObj,
          currentDate
        )
      };
    } catch (error) {
      logger.error('Error calculating Vimshottari Dasha:', error);
      return {
        system: 'Vimshottari',
        error: 'Unable to calculate dasha periods at this time'
      };
    }
  }

  /**
   * Calculate moon longitude for dasha calculations
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {number} hour - Hour
   * @param {number} minute - Minute
   * @returns {number} Moon longitude in degrees
   */
  calculateMoonLongitude(year, month, day, hour, minute) {
    try {
      // Use astrologer library for precise calculation
      if (this.astrologer) {
        const astroData = {
          year,
          month,
          date: day,
          hours: hour,
          minutes: minute,
          seconds: 0,
          latitude: 28.6139,
          longitude: 77.209,
          timezone: 5.5,
          chartType: 'sidereal'
        };

        const chart = this.astrologer.generateNatalChartData(astroData);
        return chart.planets.moon.longitude || 0;
      }

      // Fallback calculation
      const daysSinceEpoch = Math.floor(
        new Date(year, month - 1, day).getTime() / (1000 * 60 * 60 * 24)
      );
      return (daysSinceEpoch * 13.176396) % 360; // Moon moves ~13.18 degrees per day
    } catch (error) {
      logger.error('Error calculating moon longitude:', error);
      return 0;
    }
  }

  /**
   * Get starting dasha based on moon's position
   * @param {number} moonLongitude - Moon longitude
   * @returns {string} Starting dasha planet
   */
  getStartingDasha(moonLongitude) {
    // Vimshottari dasha starts from the planet ruling the nakshatra where moon is placed
    const nakshatraSize = 360 / 27; // 27 nakshatras
    const nakshatraNumber = Math.floor(moonLongitude / nakshatraSize);

    // Nakshatra lords in order
    const nakshatraLords = [
      'ketu',
      'venus',
      'sun',
      'moon',
      'mars',
      'rahu',
      'jupiter',
      'saturn',
      'mercury',
      'ketu',
      'venus',
      'sun',
      'moon',
      'mars',
      'rahu',
      'jupiter',
      'saturn',
      'mercury',
      'ketu',
      'venus',
      'sun',
      'moon',
      'mars',
      'rahu',
      'jupiter',
      'saturn',
      'mercury'
    ];

    return nakshatraLords[nakshatraNumber];
  }

  /**
   * Calculate current dasha period
   * @param {Date} birthDate - Birth date
   * @param {Date} currentDate - Current date
   * @param {string} startingDasha - Starting dasha
   * @param {Object} dashaPeriods - Dasha periods
   * @returns {Object} Current dasha information
   */
  calculateCurrentDasha(birthDate, currentDate, startingDasha, dashaPeriods) {
    const ageInYears =
      (currentDate - birthDate) / (1000 * 60 * 60 * 24 * 365.25);

    // Dasha order
    const dashaOrder = [
      'sun',
      'moon',
      'mars',
      'rahu',
      'jupiter',
      'saturn',
      'mercury',
      'ketu',
      'venus'
    ];
    const startIndex = dashaOrder.indexOf(startingDasha);

    let totalYears = 0;
    let currentDashaIndex = startIndex;
    let yearsIntoCurrentDasha = 0;

    // Find which dasha period we're currently in
    for (let i = 0; i < dashaOrder.length; i++) {
      const dashaPlanet = dashaOrder[(startIndex + i) % dashaOrder.length];
      const dashaLength = dashaPeriods[dashaPlanet];

      if (totalYears + dashaLength > ageInYears) {
        currentDashaIndex = (startIndex + i) % dashaOrder.length;
        yearsIntoCurrentDasha = ageInYears - totalYears;
        break;
      }

      totalYears += dashaLength;
    }

    const currentDasha = dashaOrder[currentDashaIndex];
    const remainingYears = dashaPeriods[currentDasha] - yearsIntoCurrentDasha;

    return {
      dasha: currentDasha,
      startYear: Math.max(0, ageInYears - yearsIntoCurrentDasha),
      remainingYears: Math.round(remainingYears * 10) / 10,
      endDate: new Date(
        currentDate.getTime() + remainingYears * 365.25 * 24 * 60 * 60 * 1000
      ),
      influence: this.getDashaInfluence(currentDasha)
    };
  }

  /**
   * Calculate upcoming dashas
   * @param {Object} currentDasha - Current dasha info
   * @param {Object} dashaPeriods - Dasha periods
   * @returns {Array} Upcoming dashas
   */
  calculateUpcomingDashas(currentDasha, dashaPeriods) {
    const dashaOrder = [
      'sun',
      'moon',
      'mars',
      'rahu',
      'jupiter',
      'saturn',
      'mercury',
      'ketu',
      'venus'
    ];
    const currentIndex = dashaOrder.indexOf(currentDasha.dasha);

    const upcoming = [];
    for (let i = 1; i <= 3; i++) {
      const nextIndex = (currentIndex + i) % dashaOrder.length;
      const nextDasha = dashaOrder[nextIndex];

      upcoming.push({
        dasha: nextDasha,
        years: dashaPeriods[nextDasha],
        influence: this.getDashaInfluence(nextDasha)
      });
    }

    return upcoming;
  }

  /**
   * Calculate Antardasha (sub-periods)
   * @param {string} mahadasha - Current Mahadasha
   * @param {Date} birthDate - Birth date
   * @param {Date} currentDate - Current date
   * @returns {Object} Antardasha information
   */
  calculateAntardasha(mahadasha, birthDate, currentDate) {
    const antardashaOrder = [
      'sun',
      'moon',
      'mars',
      'rahu',
      'jupiter',
      'saturn',
      'mercury',
      'ketu',
      'venus'
    ];
    const mahadashaPeriods = {
      sun: 6,
      moon: 10,
      mars: 7,
      rahu: 18,
      jupiter: 16,
      saturn: 19,
      mercury: 17,
      ketu: 7,
      venus: 20
    };

    const mahadashaLength = mahadashaPeriods[mahadasha];
    const antardashaLength = mahadashaLength / 9; // Each antardasha is 1/9 of mahadasha

    // Find current antardasha
    const ageInYears =
      (currentDate - birthDate) / (1000 * 60 * 60 * 24 * 365.25);
    const yearsIntoMahadasha = ageInYears % mahadashaLength;
    const antardashaIndex = Math.floor(yearsIntoMahadasha / antardashaLength);

    const currentAntardasha = antardashaOrder[antardashaIndex];
    const yearsIntoAntardasha = yearsIntoMahadasha % antardashaLength;
    const remainingInAntardasha = antardashaLength - yearsIntoAntardasha;

    return {
      current: {
        planet: currentAntardasha,
        remainingYears: Math.round(remainingInAntardasha * 10) / 10,
        influence: this.getDashaInfluence(currentAntardasha)
      },
      upcoming: antardashaOrder
        .slice(antardashaIndex + 1, antardashaIndex + 4)
        .map(planet => ({
          planet,
          years: antardashaLength,
          influence: this.getDashaInfluence(planet)
        }))
    };
  }

  /**
   * Get dasha influence description
   * @param {string} planet - Planet name
   * @returns {string} Influence description
   */
  getDashaInfluence(planet) {
    const influences = {
      sun: 'Leadership, authority, father, government, vitality, confidence',
      moon: 'Emotions, mother, home, intuition, fluctuations, nurturing',
      mars: 'Action, courage, siblings, conflicts, energy, independence',
      mercury: 'Communication, intellect, education, business, adaptability',
      jupiter:
        'Wisdom, expansion, spirituality, prosperity, teaching, optimism',
      venus: 'Love, beauty, arts, relationships, harmony, material comforts',
      saturn:
        'Discipline, responsibility, career, limitations, wisdom, patience',
      rahu: 'Ambition, foreign lands, unconventional paths, materialism, innovation',
      ketu: 'Spirituality, detachment, past life karma, mysticism, liberation'
    };

    return influences[planet] || 'General planetary influence';
  }

  /**
   * Calculate advanced transits
   * @param {Object} natalChart - Natal chart data
   * @param {Date} currentDate - Current date
   * @returns {Object} Transit analysis
   */
  calculateAdvancedTransits(natalChart, currentDate = new Date()) {
    try {
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();

      // Calculate current planetary positions
      const currentPositions = {};
      const planets = [
        'sun',
        'moon',
        'mercury',
        'venus',
        'mars',
        'jupiter',
        'saturn'
      ];

      planets.forEach(planet => {
        // Simplified transit calculation
        const natalPosition = natalChart.planets[planet];
        if (natalPosition) {
          const natalLongitude =
            natalPosition.degrees +
            natalPosition.minutes / 60 +
            natalPosition.seconds / 3600;
          const transitPosition =
            (natalLongitude + (currentDate - natalChart.birthDate) * 0.0001) %
            360;
          currentPositions[planet] = {
            longitude: transitPosition,
            aspect: this.calculateTransitAspect(
              natalLongitude,
              transitPosition
            ),
            influence: this.getTransitInfluence(
              planet,
              natalLongitude,
              transitPosition
            )
          };
        }
      });

      // Identify major transits
      const majorTransits = this.identifyMajorTransits(
        natalChart,
        currentPositions
      );

      return {
        currentDate: `${currentDay}/${currentMonth}/${currentYear}`,
        planetaryPositions: currentPositions,
        majorTransits,
        nextSignificantTransits: this.calculateNextSignificantTransits(
          natalChart,
          currentDate
        )
      };
    } catch (error) {
      logger.error('Error calculating advanced transits:', error);
      return {
        error: 'Unable to calculate transits at this time',
        currentDate: new Date().toLocaleDateString()
      };
    }
  }

  /**
   * Calculate transit aspect
   * @param {number} natalPosition - Natal planet position
   * @param {number} transitPosition - Transit planet position
   * @returns {string} Aspect type
   */
  calculateTransitAspect(natalPosition, transitPosition) {
    const angle = Math.abs(natalPosition - transitPosition) % 360;
    const minAngle = Math.min(angle, 360 - angle);

    if (minAngle <= 5) {
      return 'conjunction';
    }
    if (Math.abs(minAngle - 60) <= 5) {
      return 'sextile';
    }
    if (Math.abs(minAngle - 90) <= 5) {
      return 'square';
    }
    if (Math.abs(minAngle - 120) <= 5) {
      return 'trine';
    }
    if (Math.abs(minAngle - 180) <= 5) {
      return 'opposition';
    }

    return 'no major aspect';
  }

  /**
   * Get transit influence description
   * @param {string} planet - Planet name
   * @param {number} natalPos - Natal position
   * @param {number} transitPos - Transit position
   * @returns {string} Influence description
   */
  getTransitInfluence(planet, natalPos, transitPos) {
    const aspect = this.calculateTransitAspect(natalPos, transitPos);

    const influences = {
      sun: {
        conjunction: 'Identity and self-expression activated',
        sextile: 'Opportunities for leadership and confidence',
        square: 'Challenges to ego and self-expression',
        trine: 'Harmony in personal power and vitality',
        opposition: 'Public recognition and relationship dynamics'
      },
      moon: {
        conjunction: 'Emotional sensitivity heightened',
        sextile: 'Emotional opportunities and intuition',
        square: 'Emotional challenges and mood fluctuations',
        trine: 'Emotional harmony and nurturing',
        opposition: 'Public emotional life and relationships'
      },
      mars: {
        conjunction: 'Energy and action strongly activated',
        sextile: 'Opportunities for action and courage',
        square: 'Conflicts and aggressive challenges',
        trine: 'Harmonious energy and successful action',
        opposition: 'Public action and competitive dynamics'
      },
      jupiter: {
        conjunction: 'Expansion and growth opportunities',
        sextile: 'Lucky opportunities and optimism',
        square: 'Excess and over-expansion challenges',
        trine: 'Natural abundance and wisdom',
        opposition: 'Public success and philosophical influence'
      },
      saturn: {
        conjunction: 'Responsibilities and limitations emphasized',
        sextile: 'Career opportunities and discipline',
        square: 'Restrictions and karmic lessons',
        trine: 'Achievement through patience and structure',
        opposition: 'Public responsibility and authority'
      },
      venus: {
        conjunction: 'Love and beauty themes prominent',
        sextile: 'Harmonious relationships and creativity',
        square: 'Relationship challenges and values conflicts',
        trine: 'Love, beauty, and artistic success',
        opposition: 'Public relationships and social charm'
      },
      mercury: {
        conjunction: 'Communication and mental activity increased',
        sextile: 'Learning opportunities and clear thinking',
        square: 'Communication challenges and mental stress',
        trine: 'Mental harmony and successful communication',
        opposition: 'Public speaking and social communication'
      }
    };

    return influences[planet]?.[aspect] || `${planet} transit influence`;
  }

  /**
   * Identify major transits
   * @param {Object} natalChart - Natal chart
   * @param {Object} currentPositions - Current transit positions
   * @returns {Array} Major transits
   */
  identifyMajorTransits(natalChart, currentPositions) {
    const majorTransits = [];

    Object.entries(currentPositions).forEach(([planet, position]) => {
      if (
        ['conjunction', 'square', 'trine', 'opposition'].includes(
          position.aspect
        )
      ) {
        majorTransits.push({
          planet,
          aspect: position.aspect,
          influence: position.influence,
          intensity: this.getAspectIntensity(position.aspect)
        });
      }
    });

    return majorTransits.slice(0, 5); // Return top 5 major transits
  }

  /**
   * Get aspect intensity
   * @param {string} aspect - Aspect type
   * @returns {string} Intensity level
   */
  getAspectIntensity(aspect) {
    const intensities = {
      conjunction: 'High',
      opposition: 'High',
      square: 'Medium-High',
      trine: 'Medium',
      sextile: 'Low-Medium'
    };

    return intensities[aspect] || 'Neutral';
  }

  /**
   * Calculate next significant transits
   * @param {Object} natalChart - Natal chart
   * @param {Date} currentDate - Current date
   * @returns {Array} Next significant transits
   */
  calculateNextSignificantTransits(natalChart, currentDate) {
    const nextTransits = [];
    const planets = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

    planets.forEach(planet => {
      const natalPlanet = natalChart.planets[planet];
      const natalPos = natalPlanet ?
        natalPlanet.degrees +
          natalPlanet.minutes / 60 +
          natalPlanet.seconds / 3600 :
        null;
      if (natalPos) {
        // Calculate when next major aspect occurs
        const nextConjunction = new Date(
          currentDate.getTime() +
            (360 - (((currentDate - natalChart.birthDate) * 0.0001) % 360)) *
              100000
        );
        const nextSquare = new Date(
          currentDate.getTime() +
            (90 - (((currentDate - natalChart.birthDate) * 0.0001) % 90)) *
              100000
        );

        nextTransits.push({
          planet,
          nextConjunction: nextConjunction.toLocaleDateString(),
          nextSquare: nextSquare.toLocaleDateString(),
          significance: this.getTransitSignificance(planet)
        });
      }
    });

    return nextTransits.slice(0, 3);
  }

  /**
   * Get transit significance
   * @param {string} planet - Planet name
   * @returns {string} Significance description
   */
  _getTransitSignificance(planet) {
    const significances = {
      jupiter: 'Expansion, growth, and new opportunities',
      saturn: 'Responsibilities, career changes, and life lessons',
      uranus: 'Sudden changes, innovation, and freedom',
      neptune: 'Spirituality, dreams, and dissolution of boundaries',
      pluto: 'Transformation, power, and rebirth'
    };

    return significances[planet] || 'Significant planetary influence';
  }

  /**
   * Calculate asteroid positions using Swiss Ephemeris
   * @param {Object} birthData - Birth data object
   * @returns {Object} Asteroid positions and interpretations
   */
  calculateAsteroids(birthData) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates for birth place
      const [latitude, longitude] = this._getCoordinatesForPlace(birthPlace);
      const timezone = this._getTimezoneForPlace(birthPlace);

      const astroData = {
        year,
        month,
        date: day,
        hours: hour,
        minutes: minute,
        seconds: 0,
        latitude,
        longitude,
        timezone,
        chartType: 'sidereal'
      };

      // Calculate positions for major asteroids
      const asteroids = {
        chiron: this._calculateAsteroidPosition('chiron', astroData),
        juno: this._calculateAsteroidPosition('juno', astroData),
        vesta: this._calculateAsteroidPosition('vesta', astroData),
        pallas: this._calculateAsteroidPosition('pallas', astroData)
      };

      // Generate interpretations
      const interpretations = {
        chiron: this._interpretChiron(asteroids.chiron),
        juno: this._interpretJuno(asteroids.juno),
        vesta: this._interpretVesta(asteroids.vesta),
        pallas: this._interpretPallas(asteroids.pallas)
      };

      return {
        asteroids,
        interpretations,
        summary: this._generateAsteroidSummary(asteroids, interpretations)
      };
    } catch (error) {
      logger.error('Error calculating asteroids:', error);
      return {
        error: 'Unable to calculate asteroid positions at this time'
      };
    }
  }

  /**
   * Calculate position for a specific asteroid
   * @private
   * @param {string} asteroidName - Name of the asteroid
   * @param {Object} astroData - Astronomical data
   * @returns {Object} Asteroid position data
   */
  _calculateAsteroidPosition(asteroidName, astroData) {
    try {
      // Use astrologer library to get asteroid position
      // For now, using simplified calculations - in production would use Swiss Ephemeris directly
      const basePosition = this._getBaseAsteroidPosition(asteroidName, astroData);

      return {
        name: asteroidName.charAt(0).toUpperCase() + asteroidName.slice(1),
        sign: this._getSignFromLongitude(basePosition),
        degrees: Math.floor(basePosition % 30),
        minutes: Math.floor((basePosition % 1) * 60),
        seconds: Math.floor(((basePosition % 1) * 60 % 1) * 60),
        longitude: basePosition,
        house: this._getHouseFromLongitude(basePosition, astroData),
        aspects: this._getAsteroidAspects(basePosition, astroData)
      };
    } catch (error) {
      logger.error(`Error calculating ${asteroidName} position:`, error);
      return {
        name: asteroidName.charAt(0).toUpperCase() + asteroidName.slice(1),
        sign: 'Unknown',
        degrees: 0,
        minutes: 0,
        seconds: 0,
        error: 'Position calculation failed'
      };
    }
  }

  /**
   * Get base position for asteroid (simplified calculation)
   * @private
   * @param {string} asteroidName - Asteroid name
   * @param {Object} astroData - Astro data
   * @returns {number} Longitude position
   */
  _getBaseAsteroidPosition(asteroidName, astroData) {
    // Simplified asteroid position calculations
    // In production, these would use precise Swiss Ephemeris asteroid data
    const basePositions = {
      chiron: 15.5,  // Approximate position in Aquarius
      juno: 45.2,    // Approximate position in Taurus
      vesta: 75.8,   // Approximate position in Gemini
      pallas: 105.3  // Approximate position in Leo
    };

    const basePos = basePositions[asteroidName] || 0;

    // Add some variation based on birth date for uniqueness
    const dayOfYear = astroData.date + (astroData.month - 1) * 30;
    const variation = (dayOfYear * 0.5) % 30;

    return (basePos + variation) % 360;
  }

  /**
   * Get house position for asteroid
   * @private
   * @param {number} longitude - Asteroid longitude
   * @param {Object} astroData - Astro data
   * @returns {number} House number
   */
  _getHouseFromLongitude(longitude, astroData) {
    // Simplified house calculation - would need proper ascendant calculation
    const ascendant = 0; // Simplified - should calculate actual ascendant
    const positionFromAsc = (longitude - ascendant + 360) % 360;
    return Math.floor(positionFromAsc / 30) + 1;
  }

  /**
   * Get aspects for asteroid
   * @private
   * @param {number} asteroidPos - Asteroid position
   * @param {Object} astroData - Astro data
   * @returns {Array} Aspects
   */
  _getAsteroidAspects(asteroidPos, astroData) {
    const aspects = [];
    const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

    planets.forEach(planet => {
      // Simplified aspect checking - would use actual planetary positions
      const planetPos = this._getSimplifiedPlanetPosition(planet, astroData);
      const angle = Math.abs(asteroidPos - planetPos) % 360;
      const minAngle = Math.min(angle, 360 - angle);

      if (minAngle <= 10) {
        aspects.push({
          planet: planet.charAt(0).toUpperCase() + planet.slice(1),
          aspect: minAngle <= 5 ? 'conjunction' : 'close aspect',
          orb: Math.round(minAngle * 10) / 10
        });
      }
    });

    return aspects;
  }

  /**
   * Get simplified planet position for aspect calculations
   * @private
   * @param {string} planet - Planet name
   * @param {Object} astroData - Astro data
   * @returns {number} Planet longitude
   */
  _getSimplifiedPlanetPosition(planet, astroData) {
    // Simplified planetary positions - in production use actual calculations
    const positions = {
      sun: (astroData.month - 1) * 30 + astroData.date, // Sun moves ~1° per day
      moon: ((astroData.hours * 15) + (astroData.minutes * 0.25)) % 360, // Moon moves ~15° per hour
      mercury: ((astroData.month - 1) * 30 + astroData.date + 15) % 360,
      venus: ((astroData.month - 1) * 30 + astroData.date + 30) % 360,
      mars: ((astroData.month - 1) * 30 + astroData.date + 45) % 360,
      jupiter: ((astroData.month - 1) * 30 + astroData.date + 60) % 360,
      saturn: ((astroData.month - 1) * 30 + astroData.date + 75) % 360
    };

    return positions[planet] || 0;
  }

  /**
   * Interpret Chiron position
   * @private
   * @param {Object} chiron - Chiron data
   * @returns {Object} Chiron interpretation
   */
  _interpretChiron(chiron) {
    const signInterpretations = {
      'Aries': 'Wounds related to identity and self-expression',
      'Taurus': 'Healing around self-worth and material security',
      'Gemini': 'Communication wounds and learning difficulties',
      'Cancer': 'Emotional wounds and family healing',
      'Leo': 'Creative wounds and self-acceptance issues',
      'Virgo': 'Service wounds and perfectionism healing',
      'Libra': 'Relationship wounds and partnership healing',
      'Scorpio': 'Deep transformation and intimacy wounds',
      'Sagittarius': 'Belief system wounds and philosophical healing',
      'Capricorn': 'Authority wounds and ambition healing',
      'Aquarius': 'Community wounds and individuality healing',
      'Pisces': 'Spiritual wounds and compassion healing'
    };

    return {
      coreWound: signInterpretations[chiron.sign] || 'Personal healing journey',
      healingGift: this._getChironHealingGift(chiron.sign),
      lifePurpose: `To heal ${chiron.sign.toLowerCase()} wounds and help others with similar issues`,
      keyThemes: ['Wounds', 'Healing', 'Teaching', 'Compassion']
    };
  }

  /**
   * Get Chiron healing gift based on sign
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Healing gift
   */
  _getChironHealingGift(sign) {
    const gifts = {
      'Aries': 'Teaching others to stand in their power',
      'Taurus': 'Helping others find self-worth and abundance',
      'Gemini': 'Guiding communication and learning processes',
      'Cancer': 'Supporting emotional healing and family matters',
      'Leo': 'Encouraging creative self-expression',
      'Virgo': 'Assisting with practical healing and service',
      'Libra': 'Facilitating relationship harmony',
      'Scorpio': 'Supporting deep transformation work',
      'Sagittarius': 'Guiding philosophical and spiritual growth',
      'Capricorn': 'Helping with career and life structure',
      'Aquarius': 'Supporting community and humanitarian causes',
      'Pisces': 'Facilitating spiritual and compassionate work'
    };

    return gifts[sign] || 'Supporting others through their healing journey';
  }

  /**
   * Interpret Juno position
   * @private
   * @param {Object} juno - Juno data
   * @returns {Object} Juno interpretation
   */
  _interpretJuno(juno) {
    const signInterpretations = {
      'Aries': 'Independent partnerships, equal power dynamics',
      'Taurus': 'Committed, sensual relationships with material security',
      'Gemini': 'Intellectual partnerships, communicative relationships',
      'Cancer': 'Nurturing, emotional partnerships, family-oriented',
      'Leo': 'Dramatic, loyal partnerships with creative expression',
      'Virgo': 'Practical, service-oriented partnerships',
      'Libra': 'Harmonious, balanced partnerships, diplomatic unions',
      'Scorpio': 'Intense, transformative partnerships, deep intimacy',
      'Sagittarius': 'Adventurous partnerships, philosophical unions',
      'Capricorn': 'Responsible, ambitious partnerships, structured relationships',
      'Aquarius': 'Progressive partnerships, friendship-based unions',
      'Pisces': 'Compassionate, spiritual partnerships, unconditional love'
    };

    return {
      relationshipStyle: signInterpretations[juno.sign] || 'Unique partnership approach',
      commitmentStyle: this._getJunoCommitmentStyle(juno.sign),
      partnershipNeeds: this._getJunoNeeds(juno.sign),
      keyThemes: ['Partnerships', 'Commitment', 'Equality', 'Loyalty']
    };
  }

  /**
   * Get Juno commitment style
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Commitment style
   */
  _getJunoCommitmentStyle(sign) {
    const styles = {
      'Aries': 'Passionate and direct commitment',
      'Taurus': 'Steady and sensual commitment',
      'Gemini': 'Intellectual and communicative commitment',
      'Cancer': 'Emotional and nurturing commitment',
      'Leo': 'Dramatic and loyal commitment',
      'Virgo': 'Practical and devoted commitment',
      'Libra': 'Balanced and harmonious commitment',
      'Scorpio': 'Intense and transformative commitment',
      'Sagittarius': 'Adventurous and philosophical commitment',
      'Capricorn': 'Responsible and structured commitment',
      'Aquarius': 'Progressive and egalitarian commitment',
      'Pisces': 'Compassionate and spiritual commitment'
    };

    return styles[sign] || 'Personal commitment approach';
  }

  /**
   * Get Juno partnership needs
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Partnership needs
   */
  _getJunoNeeds(sign) {
    const needs = {
      'Aries': 'Equality, independence, and mutual respect',
      'Taurus': 'Security, sensuality, and material comfort',
      'Gemini': 'Communication, intellectual stimulation, and variety',
      'Cancer': 'Emotional security, nurturing, and family connection',
      'Leo': 'Admiration, creativity, and romantic expression',
      'Virgo': 'Practical support, health, and service',
      'Libra': 'Harmony, beauty, and diplomatic partnership',
      'Scorpio': 'Depth, intimacy, and transformative connection',
      'Sagittarius': 'Freedom, adventure, and philosophical alignment',
      'Capricorn': 'Stability, ambition, and long-term planning',
      'Aquarius': 'Independence, innovation, and shared ideals',
      'Pisces': 'Compassion, spirituality, and emotional merging'
    };

    return needs[sign] || 'Personal partnership requirements';
  }

  /**
   * Interpret Vesta position
   * @private
   * @param {Object} vesta - Vesta data
   * @returns {Object} Vesta interpretation
   */
  _interpretVesta(vesta) {
    const signInterpretations = {
      'Aries': 'Dedication to personal goals and self-initiation',
      'Taurus': 'Commitment to material security and sensual pleasures',
      'Gemini': 'Devotion to communication and intellectual pursuits',
      'Cancer': 'Dedication to home, family, and emotional nurturing',
      'Leo': 'Commitment to creative self-expression and leadership',
      'Virgo': 'Devotion to service, health, and practical matters',
      'Libra': 'Dedication to relationships and aesthetic harmony',
      'Scorpio': 'Commitment to deep transformation and intimacy',
      'Sagittarius': 'Devotion to philosophy, travel, and higher learning',
      'Capricorn': 'Commitment to career, structure, and long-term goals',
      'Aquarius': 'Dedication to community, innovation, and humanitarian causes',
      'Pisces': 'Commitment to spirituality, compassion, and artistic expression'
    };

    return {
      sacredFocus: signInterpretations[vesta.sign] || 'Personal sacred dedication',
      devotionStyle: this._getVestaDevotionStyle(vesta.sign),
      sacredRituals: this._getVestaRituals(vesta.sign),
      keyThemes: ['Devotion', 'Focus', 'Sacred Work', 'Commitment']
    };
  }

  /**
   * Get Vesta devotion style
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Devotion style
   */
  _getVestaDevotionStyle(sign) {
    const styles = {
      'Aries': 'Passionate and direct devotion',
      'Taurus': 'Sensual and persistent devotion',
      'Gemini': 'Intellectual and communicative devotion',
      'Cancer': 'Nurturing and protective devotion',
      'Leo': 'Creative and charismatic devotion',
      'Virgo': 'Practical and meticulous devotion',
      'Libra': 'Harmonious and diplomatic devotion',
      'Scorpio': 'Intense and transformative devotion',
      'Sagittarius': 'Adventurous and philosophical devotion',
      'Capricorn': 'Structured and ambitious devotion',
      'Aquarius': 'Innovative and humanitarian devotion',
      'Pisces': 'Compassionate and spiritual devotion'
    };

    return styles[sign] || 'Personal devotion approach';
  }

  /**
   * Get Vesta sacred rituals
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Sacred rituals
   */
  _getVestaRituals(sign) {
    const rituals = {
      'Aries': 'Personal rituals of initiation and courage',
      'Taurus': 'Sensual rituals involving nature and material comfort',
      'Gemini': 'Communication rituals, writing, and learning practices',
      'Cancer': 'Home-based rituals, family traditions, emotional cleansing',
      'Leo': 'Creative rituals, performance, self-expression practices',
      'Virgo': 'Service rituals, health practices, organizational systems',
      'Libra': 'Harmony rituals, aesthetic arrangements, relationship ceremonies',
      'Scorpio': 'Transformation rituals, deep emotional work, intimacy practices',
      'Sagittarius': 'Exploration rituals, travel ceremonies, philosophical study',
      'Capricorn': 'Structure rituals, career ceremonies, long-term planning',
      'Aquarius': 'Community rituals, innovation practices, humanitarian work',
      'Pisces': 'Spiritual rituals, meditation, artistic and compassionate practices'
    };

    return rituals[sign] || 'Personal sacred practices';
  }

  /**
   * Interpret Pallas position
   * @private
   * @param {Object} pallas - Pallas data
   * @returns {Object} Pallas interpretation
   */
  _interpretPallas(pallas) {
    const signInterpretations = {
      'Aries': 'Strategic warrior energy, direct problem-solving',
      'Taurus': 'Practical wisdom, resource management strategies',
      'Gemini': 'Intellectual strategies, communication patterns',
      'Cancer': 'Intuitive strategies, emotional intelligence',
      'Leo': 'Creative strategies, leadership patterns',
      'Virgo': 'Analytical strategies, healing and service patterns',
      'Libra': 'Diplomatic strategies, relationship dynamics',
      'Scorpio': 'Transformative strategies, crisis management',
      'Sagittarius': 'Philosophical strategies, expansion patterns',
      'Capricorn': 'Structural strategies, organizational wisdom',
      'Aquarius': 'Innovative strategies, community solutions',
      'Pisces': 'Compassionate strategies, spiritual wisdom'
    };

    return {
      wisdomType: signInterpretations[pallas.sign] || 'Unique strategic wisdom',
      problemSolving: this._getPallasProblemSolving(pallas.sign),
      creativeExpression: this._getPallasCreativity(pallas.sign),
      keyThemes: ['Wisdom', 'Strategy', 'Creativity', 'Problem-Solving']
    };
  }

  /**
   * Get Pallas problem-solving style
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Problem-solving style
   */
  _getPallasProblemSolving(sign) {
    const styles = {
      'Aries': 'Direct action and courageous solutions',
      'Taurus': 'Practical, resource-based solutions',
      'Gemini': 'Intellectual analysis and communication',
      'Cancer': 'Intuitive and emotionally intelligent approaches',
      'Leo': 'Creative and charismatic leadership solutions',
      'Virgo': 'Analytical and systematic problem-solving',
      'Libra': 'Diplomatic and harmonious resolutions',
      'Scorpio': 'Deep transformative and crisis solutions',
      'Sagittarius': 'Philosophical and expansive perspectives',
      'Capricorn': 'Structured and long-term strategic planning',
      'Aquarius': 'Innovative and community-based solutions',
      'Pisces': 'Compassionate and spiritually guided approaches'
    };

    return styles[sign] || 'Personal problem-solving approach';
  }

  /**
   * Get Pallas creative expression
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Creative expression
   */
  _getPallasCreativity(sign) {
    const expressions = {
      'Aries': 'Bold artistic initiatives and pioneering projects',
      'Taurus': 'Sensual arts, music, culinary, and material crafts',
      'Gemini': 'Writing, teaching, media, and communication arts',
      'Cancer': 'Emotional storytelling, nurturing arts, family traditions',
      'Leo': 'Performance arts, leadership, creative self-expression',
      'Virgo': 'Healing arts, service projects, detailed craftsmanship',
      'Libra': 'Visual arts, design, diplomatic negotiations, partnerships',
      'Scorpio': 'Transformative arts, depth psychology, crisis intervention',
      'Sagittarius': 'Philosophical writing, travel journalism, educational programs',
      'Capricorn': 'Architectural design, business strategy, organizational systems',
      'Aquarius': 'Community art, technological innovation, humanitarian projects',
      'Pisces': 'Spiritual arts, music, poetry, compassionate service'
    };

    return expressions[sign] || 'Personal creative expression';
  }

  /**
   * Generate asteroid summary
   * @private
   * @param {Object} asteroids - Asteroid data
   * @param {Object} interpretations - Interpretations
   * @returns {string} Summary
   */
  _generateAsteroidSummary(asteroids, interpretations) {
    let summary = 'Asteroid Analysis:\n\n';

    summary += `🩹 *Chiron in ${asteroids.chiron.sign}*: ${interpretations.chiron.coreWound}\n`;
    summary += `💍 *Juno in ${asteroids.juno.sign}*: ${interpretations.juno.relationshipStyle}\n`;
    summary += `🏛️ *Vesta in ${asteroids.vesta.sign}*: ${interpretations.vesta.sacredFocus}\n`;
    summary += `🎨 *Pallas in ${asteroids.pallas.sign}*: ${interpretations.pallas.wisdomType}\n\n`;

    summary += 'These four asteroids reveal your deeper psychological patterns, relationship dynamics, spiritual focus, and creative wisdom.';

    return summary;
  }

  /**
   * Calculate Synastry - Relationship Astrology
   * Compares two birth charts for compatibility analysis
   * @param {Object} person1 - First person's birth data
   * @param {Object} person2 - Second person's birth data
   * @returns {Object} Synastry analysis
   */
  calculateSynastry(person1, person2) {
    try {
      // Calculate both natal charts
      const chart1 = this.generateBasicBirthChart(person1);
      const chart2 = this.generateBasicBirthChart(person2);

      // Calculate synastry aspects
      const synastryAspects = this._calculateSynastryAspects(chart1, chart2);

      // Calculate composite chart
      const compositeChart = this._calculateCompositeChart(chart1, chart2);

      // Generate compatibility analysis
      const compatibility = this._analyzeSynastryCompatibility(synastryAspects, compositeChart);

      return {
        person1: {
          name: person1.name,
          sunSign: chart1.sunSign,
          moonSign: chart1.moonSign,
          risingSign: chart1.risingSign
        },
        person2: {
          name: person2.name,
          sunSign: chart2.sunSign,
          moonSign: chart2.moonSign,
          risingSign: chart2.risingSign
        },
        synastryAspects,
        compositeChart,
        compatibility,
        relationshipInsights: this._generateRelationshipInsights(compatibility),
        challenges: this._identifyRelationshipChallenges(synastryAspects),
        strengths: this._identifyRelationshipStrengths(synastryAspects)
      };
    } catch (error) {
      logger.error('Error calculating synastry:', error);
      return {
        error: 'Unable to calculate synastry analysis at this time'
      };
    }
  }

  /**
   * Calculate synastry aspects between two charts
   * @private
   * @param {Object} chart1 - First person's chart
   * @param {Object} chart2 - Second person's chart
   * @returns {Array} Synastry aspects
   */
  _calculateSynastryAspects(chart1, chart2) {
    const aspects = [];
    const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

    planets.forEach(planet1 => {
      planets.forEach(planet2 => {
        if (chart1.planets[planet1] && chart2.planets[planet2]) {
          const pos1 = this._getPlanetLongitude(chart1.planets[planet1]);
          const pos2 = this._getPlanetLongitude(chart2.planets[planet2]);

          const angle = Math.abs(pos1 - pos2) % 360;
          const minAngle = Math.min(angle, 360 - angle);

          if (minAngle <= 10) { // Within 10 degrees
            const aspect = this._getAspectType(minAngle);
            if (aspect !== 'no aspect') {
              aspects.push({
                planet1: `${chart1.planets[planet1].name} (${planet1 === planet2 ? 'both' : 'synastry'})`,
                planet2: chart2.planets[planet2].name,
                aspect,
                orb: Math.round(minAngle * 10) / 10,
                significance: this._getSynastryAspectSignificance(planet1, planet2, aspect)
              });
            }
          }
        }
      });
    });

    return aspects.slice(0, 8); // Return top 8 aspects
  }

  /**
   * Get planet longitude from chart data
   * @private
   * @param {Object} planet - Planet data
   * @returns {number} Longitude
   */
  _getPlanetLongitude(planet) {
    return planet.degrees + (planet.minutes / 60) + (planet.seconds / 3600);
  }

  /**
   * Get aspect type from angle
   * @private
   * @param {number} angle - Angle in degrees
   * @returns {string} Aspect type
   */
  _getAspectType(angle) {
    if (angle <= 5) return 'conjunction';
    if (Math.abs(angle - 60) <= 5) return 'sextile';
    if (Math.abs(angle - 90) <= 5) return 'square';
    if (Math.abs(angle - 120) <= 5) return 'trine';
    if (Math.abs(angle - 180) <= 5) return 'opposition';
    return 'no aspect';
  }

  /**
   * Get synastry aspect significance
   * @private
   * @param {string} planet1 - First planet
   * @param {string} planet2 - Second planet
   * @param {string} aspect - Aspect type
   * @returns {string} Significance description
   */
  _getSynastryAspectSignificance(planet1, planet2, aspect) {
    const significances = {
      'sun-moon': {
        conjunction: 'Deep emotional and identity connection',
        trine: 'Natural emotional harmony and understanding',
        square: 'Dynamic emotional growth through challenges',
        opposition: 'Balancing individual needs with partnership'
      },
      'venus-mars': {
        conjunction: 'Intense physical and romantic attraction',
        trine: 'Harmonious sexual and romantic expression',
        square: 'Passionate but challenging romantic dynamics',
        opposition: 'Magnetic attraction with complementary energies'
      },
      'venus-venus': {
        conjunction: 'Shared values and aesthetic preferences',
        trine: 'Mutual appreciation and romantic harmony',
        square: 'Different approaches to love and values',
        opposition: 'Complementary but contrasting love styles'
      },
      'mars-mars': {
        conjunction: 'Shared energy levels and drive',
        trine: 'Compatible action styles and motivation',
        square: 'Conflicting approaches to action and energy',
        opposition: 'Complementary energy that balances each other'
      }
    };

    const key = `${planet1}-${planet2}`;
    const reverseKey = `${planet2}-${planet1}`;

    return significances[key]?.[aspect] ||
           significances[reverseKey]?.[aspect] ||
           `${aspect} aspect between ${planet1} and ${planet2}`;
  }

  /**
   * Calculate composite chart
   * @private
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @returns {Object} Composite chart
   */
  _calculateCompositeChart(chart1, chart2) {
    const composite = {};
    const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

    planets.forEach(planet => {
      if (chart1.planets[planet] && chart2.planets[planet]) {
        const pos1 = this._getPlanetLongitude(chart1.planets[planet]);
        const pos2 = this._getPlanetLongitude(chart2.planets[planet]);

        // Calculate midpoint
        let midpoint = (pos1 + pos2) / 2;
        if (Math.abs(pos1 - pos2) > 180) {
          midpoint = (midpoint + 180) % 360; // Handle 0/360 crossover
        }

        composite[planet] = {
          sign: this._getSignFromLongitude(midpoint),
          degrees: Math.floor(midpoint % 30),
          minutes: Math.floor((midpoint % 1) * 60),
          significance: `Composite ${planet} represents the relationship's ${this._getCompositeSignificance(planet)}`
        };
      }
    });

    return composite;
  }

  /**
   * Get composite planet significance
   * @private
   * @param {string} planet - Planet name
   * @returns {string} Significance
   */
  _getCompositeSignificance(planet) {
    const significances = {
      sun: 'core identity and purpose',
      moon: 'emotional foundation and needs',
      mercury: 'communication style and thinking',
      venus: 'love nature and shared values',
      mars: 'energy dynamic and drive',
      jupiter: 'growth potential and optimism',
      saturn: 'commitment level and responsibilities'
    };

    return significances[planet] || 'shared energy';
  }

  /**
   * Analyze synastry compatibility
   * @private
   * @param {Array} aspects - Synastry aspects
   * @param {Object} composite - Composite chart
   * @returns {Object} Compatibility analysis
   */
  _analyzeSynastryCompatibility(aspects, composite) {
    let harmonyScore = 50; // Base score
    let passionScore = 50;
    let communicationScore = 50;

    // Analyze aspects
    aspects.forEach(aspect => {
      switch (aspect.aspect) {
        case 'conjunction':
          harmonyScore += 10;
          passionScore += 15;
          break;
        case 'trine':
          harmonyScore += 15;
          communicationScore += 10;
          break;
        case 'sextile':
          harmonyScore += 8;
          communicationScore += 12;
          break;
        case 'square':
          passionScore += 20;
          harmonyScore -= 5;
          break;
        case 'opposition':
          passionScore += 15;
          communicationScore += 10;
          break;
      }
    });

    // Ensure scores are within bounds
    harmonyScore = Math.max(0, Math.min(100, harmonyScore));
    passionScore = Math.max(0, Math.min(100, passionScore));
    communicationScore = Math.max(0, Math.min(100, communicationScore));

    // Determine overall compatibility
    const averageScore = (harmonyScore + passionScore + communicationScore) / 3;
    let compatibility = 'Neutral';
    if (averageScore >= 75) compatibility = 'Excellent';
    else if (averageScore >= 60) compatibility = 'Good';
    else if (averageScore >= 40) compatibility = 'Challenging';

    return {
      harmonyScore,
      passionScore,
      communicationScore,
      overallCompatibility: compatibility,
      averageScore: Math.round(averageScore)
    };
  }

  /**
   * Generate relationship insights
   * @private
   * @param {Object} compatibility - Compatibility data
   * @returns {Array} Relationship insights
   */
  _generateRelationshipInsights(compatibility) {
    const insights = [];

    if (compatibility.harmonyScore > 70) {
      insights.push('Strong natural harmony and understanding');
    }
    if (compatibility.passionScore > 70) {
      insights.push('Intense romantic and physical attraction');
    }
    if (compatibility.communicationScore > 70) {
      insights.push('Excellent communication and mutual understanding');
    }

    if (compatibility.harmonyScore < 40) {
      insights.push('May need conscious effort to maintain harmony');
    }
    if (compatibility.passionScore < 40) {
      insights.push('Passion may need nurturing and attention');
    }
    if (compatibility.communicationScore < 40) {
      insights.push('Communication styles may need adaptation');
    }

    return insights;
  }

  /**
   * Identify relationship challenges
   * @private
   * @param {Array} aspects - Synastry aspects
   * @returns {Array} Challenges
   */
  _identifyRelationshipChallenges(aspects) {
    const challenges = [];

    const hardAspects = aspects.filter(a => ['square', 'opposition'].includes(a.aspect));
    if (hardAspects.length > 3) {
      challenges.push('Multiple challenging aspects suggest growth opportunities');
    }

    const squares = aspects.filter(a => a.aspect === 'square');
    if (squares.length > 0) {
      challenges.push('Square aspects bring dynamic tension that can fuel growth');
    }

    return challenges.length > 0 ? challenges : ['Relationship will have normal challenges like any partnership'];
  }

  /**
   * Identify relationship strengths
   * @private
   * @param {Array} aspects - Synastry aspects
   * @returns {Array} Strengths
   */
  _identifyRelationshipStrengths(aspects) {
    const strengths = [];

    const softAspects = aspects.filter(a => ['trine', 'sextile'].includes(a.aspect));
    if (softAspects.length > 2) {
      strengths.push('Harmonious aspects create natural ease and understanding');
    }

    const conjunctions = aspects.filter(a => a.aspect === 'conjunction');
    if (conjunctions.length > 0) {
      strengths.push('Conjunctions create deep merging of energies');
    }

    return strengths.length > 0 ? strengths : ['Unique combination of energies creates special connection'];
  }

  /**
   * Calculate Electional Astrology - Auspicious Timing
   * Finds the best times for important events based on astrological factors
   * @param {Object} eventDetails - Event type and preferences
   * @param {Date} startDate - Start date for search window
   * @param {Date} endDate - End date for search window
   * @returns {Object} Electional analysis with recommended dates
   */
  calculateElectionalAstrology(eventDetails, startDate = new Date(), endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
    try {
      const { eventType, preferences } = eventDetails;
      const recommendations = [];

      // Define electional rules for different event types
      const electionalRules = this._getElectionalRules(eventType);

      // Search through date range for auspicious times
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const analysis = this._analyzeElectionalDate(currentDate, electionalRules, preferences);

        if (analysis.score >= 70) { // High-quality election
          recommendations.push({
            date: currentDate.toLocaleDateString(),
            time: analysis.bestTime,
            score: analysis.score,
            favorableFactors: analysis.favorableFactors,
            challengingFactors: analysis.challengingFactors,
            overallRating: analysis.overallRating
          });
        }

        // Check next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Sort by score and return top recommendations
      recommendations.sort((a, b) => b.score - a.score);

      return {
        eventType,
        searchWindow: {
          start: startDate.toLocaleDateString(),
          end: endDate.toLocaleDateString()
        },
        recommendations: recommendations.slice(0, 5), // Top 5 recommendations
        electionalRules: electionalRules,
        generalAdvice: this._getElectionalAdvice(eventType)
      };
    } catch (error) {
      logger.error('Error calculating electional astrology:', error);
      return {
        error: 'Unable to calculate electional timing at this time'
      };
    }
  }

  /**
   * Get electional rules for different event types
   * @private
   * @param {string} eventType - Type of event
   * @returns {Object} Electional rules
   */
  _getElectionalRules(eventType) {
    const rules = {
      wedding: {
        favorablePlanets: ['venus', 'jupiter'],
        favorableSigns: ['libra', 'pisces', 'sagittarius'],
        favorableHouses: [5, 7, 11], // Love, partnership, friends
        avoidAspects: ['saturn squares', 'mars squares'],
        bestLunarPhases: ['waxing moon', 'full moon'],
        bestDays: ['friday', 'thursday']
      },
      business: {
        favorablePlanets: ['jupiter', 'mercury', 'venus'],
        favorableSigns: ['sagittarius', 'gemini', 'taurus', 'libra'],
        favorableHouses: [2, 6, 10], // Money, work, career
        avoidAspects: ['saturn squares', 'neptune aspects'],
        bestLunarPhases: ['new moon', 'waxing moon'],
        bestDays: ['thursday', 'wednesday', 'friday']
      },
      medical: {
        favorablePlanets: ['jupiter', 'venus'],
        favorableSigns: ['sagittarius', 'pisces', 'cancer'],
        favorableHouses: [6, 12], // Health, hospitals
        avoidAspects: ['mars squares', 'saturn squares', 'uranus aspects'],
        bestLunarPhases: ['waning moon'],
        bestDays: ['thursday', 'friday']
      },
      travel: {
        favorablePlanets: ['jupiter', 'sagittarius'],
        favorableSigns: ['sagittarius', 'pisces', 'gemini'],
        favorableHouses: [3, 9], // Travel, foreign lands
        avoidAspects: ['saturn squares', 'uranus squares'],
        bestLunarPhases: ['waxing moon'],
        bestDays: ['thursday', 'sunday']
      },
      legal: {
        favorablePlanets: ['jupiter', 'venus'],
        favorableSigns: ['libra', 'sagittarius'],
        favorableHouses: [7, 9, 11], // Partnerships, law, friends
        avoidAspects: ['mars aspects', 'neptune aspects'],
        bestLunarPhases: ['waxing moon'],
        bestDays: ['thursday', 'friday']
      }
    };

    return rules[eventType] || {
      favorablePlanets: ['jupiter'],
      favorableSigns: ['sagittarius'],
      favorableHouses: [11],
      avoidAspects: ['saturn squares'],
      bestLunarPhases: ['waxing moon'],
      bestDays: ['thursday']
    };
  }

  /**
   * Analyze a specific date for electional purposes
   * @private
   * @param {Date} date - Date to analyze
   * @param {Object} rules - Electional rules
   * @param {Object} preferences - User preferences
   * @returns {Object} Analysis results
   */
  _analyzeElectionalDate(date, rules, preferences = {}) {
    let score = 50; // Base score
    const favorableFactors = [];
    const challengingFactors = [];

    // Analyze day of week
    const dayOfWeek = date.toLocaleLowerCase('en-US', { weekday: 'long' });
    if (rules.bestDays.includes(dayOfWeek)) {
      score += 20;
      favorableFactors.push(`Favorable day: ${dayOfWeek}`);
    }

    // Analyze lunar phase (simplified)
    const lunarPhase = this._getLunarPhase(date);
    if (rules.bestLunarPhases.includes(lunarPhase)) {
      score += 15;
      favorableFactors.push(`Good lunar phase: ${lunarPhase}`);
    }

    // Analyze planetary positions (simplified)
    const planetaryScore = this._analyzeElectionalPlanets(date, rules);
    score += planetaryScore.score;

    favorableFactors.push(...planetaryScore.favorable);
    challengingFactors.push(...planetaryScore.challenging);

    // Find best time of day (simplified - would use actual rising times)
    const bestTime = this._findBestTimeOfDay(date, rules);

    // Determine overall rating
    let overallRating = 'Neutral';
    if (score >= 85) overallRating = 'Excellent';
    else if (score >= 75) overallRating = 'Very Good';
    else if (score >= 65) overallRating = 'Good';
    else if (score >= 55) overallRating = 'Fair';

    return {
      score: Math.min(100, score),
      bestTime,
      favorableFactors,
      challengingFactors,
      overallRating
    };
  }

  /**
   * Get lunar phase for a date
   * @private
   * @param {Date} date - Date to check
   * @returns {string} Lunar phase
   */
  _getLunarPhase(date) {
    // Simplified lunar phase calculation
    const daysSinceNewMoon = (date.getTime() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24) % 29.5;

    if (daysSinceNewMoon < 1) return 'new moon';
    if (daysSinceNewMoon < 7.4) return 'waxing crescent';
    if (daysSinceNewMoon < 11.1) return 'first quarter';
    if (daysSinceNewMoon < 14.8) return 'waxing gibbous';
    if (daysSinceNewMoon < 16.3) return 'full moon';
    if (daysSinceNewMoon < 22.1) return 'waning gibbous';
    if (daysSinceNewMoon < 25.8) return 'last quarter';
    return 'waning crescent';
  }

  /**
   * Analyze planetary positions for electional purposes
   * @private
   * @param {Date} date - Date to analyze
   * @param {Object} rules - Electional rules
   * @returns {Object} Planetary analysis
   */
  _analyzeElectionalPlanets(date, rules) {
    let score = 0;
    const favorable = [];
    const challenging = [];

    // Simplified planetary analysis - would use actual calculations
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1;

    // Jupiter favorable periods (simplified)
    if (rules.favorablePlanets.includes('jupiter')) {
      if ([4, 5, 9, 12].includes(month)) {
        score += 10;
        favorable.push('Jupiter beneficial period');
      }
    }

    // Venus favorable periods
    if (rules.favorablePlanets.includes('venus')) {
      if ([2, 4, 6, 7, 10, 11, 12].includes(month)) {
        score += 8;
        favorable.push('Venus beneficial period');
      }
    }

    // Avoid Saturn squares (simplified)
    if (rules.avoidAspects.includes('saturn squares')) {
      if (![1, 4, 7, 10].includes(month)) {
        score += 5;
      } else {
        challenging.push('Saturn may create challenges');
      }
    }

    return { score, favorable, challenging };
  }

  /**
   * Find best time of day for election
   * @private
   * @param {Date} date - Date
   * @param {Object} rules - Rules
   * @returns {string} Best time
   */
  _findBestTimeOfDay(date, rules) {
    // Simplified - would calculate actual planetary hours
    const times = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];

    // Return a favorable time based on event type
    switch (rules.favorablePlanets[0]) {
      case 'venus': return '18:00'; // Evening for Venus
      case 'jupiter': return '12:00'; // Noon for Jupiter
      case 'mercury': return '09:00'; // Morning for Mercury
      default: return '12:00';
    }
  }

  /**
   * Get electional advice for event type
   * @private
   * @param {string} eventType - Type of event
   * @returns {string} Advice
   */
  _getElectionalAdvice(eventType) {
    const advice = {
      wedding: 'For weddings, Venus and Jupiter are most important. Avoid Mars squares and Saturn aspects. Full moon periods are particularly auspicious.',
      business: 'For business ventures, Mercury and Jupiter should be well-placed. Avoid Neptune aspects that can bring confusion.',
      medical: 'For medical procedures, prioritize Jupiter and Venus. Avoid Mars and Uranus aspects. Waning moon is often better.',
      travel: 'For travel, Jupiter and Sagittarius energy is ideal. Avoid Saturn restrictions and Uranus disruptions.',
      legal: 'For legal matters, Libra and Sagittarius placements help. Avoid Mars aggression and Neptune deception.'
    };

    return advice[eventType] || 'Choose a time when beneficial planets are strong and challenging aspects are minimal.';
  }
}
  }

  /**
   * Generate Vedic predictions based on dasha and transits
   * @param {Object} dashaAnalysis - Dasha analysis
   * @param {Object} transitAnalysis - Transit analysis
   * @returns {Object} Predictions
   */
  generateVedicPredictions(dashaAnalysis, transitAnalysis) {
    const predictions = {
      shortTerm: 'Based on current planetary influences',
      mediumTerm: 'Upcoming dasha periods suggest',
      longTerm: 'Future transits indicate'
    };

    // Short-term based on current dasha
    if (dashaAnalysis.currentDasha) {
      predictions.shortTerm += ` ${dashaAnalysis.currentDasha.influence.toLowerCase()}.`;
    }

    // Medium-term based on upcoming dashas
    if (dashaAnalysis.upcomingDashas && dashaAnalysis.upcomingDashas[0]) {
      predictions.mediumTerm += ` ${dashaAnalysis.upcomingDashas[0].influence.toLowerCase()}.`;
    }

    // Long-term based on major transits
    if (transitAnalysis.majorTransits && transitAnalysis.majorTransits[0]) {
      predictions.longTerm += ` ${transitAnalysis.majorTransits[0].influence.toLowerCase()}.`;
    }

    return predictions;
  }

  /**
   * Generate Vedic remedies
   * @param {Object} basicChart - Basic chart data
   * @param {Object} dashaAnalysis - Dasha analysis
   * @returns {Array} Remedies
   */
  generateVedicRemedies(basicChart, dashaAnalysis) {
    const remedies = [];

    // General remedies based on current dasha
    if (dashaAnalysis.currentDasha) {
      const planet = dashaAnalysis.currentDasha.dasha;
      remedies.push(this.getPlanetRemedy(planet));
    }

    // Chart-specific remedies
    if (basicChart.challenges && basicChart.challenges.length > 0) {
      remedies.push('Practice meditation and spiritual disciplines');
    }

    return remedies;
  }

  /**
   * Get planet-specific remedy
   * @param {string} planet - Planet name
   * @returns {string} Remedy
   */
  getPlanetRemedy(planet) {
    const remedies = {
      sun: 'Chant Aditya Hridayam or practice Surya Namaskar',
      moon: 'Practice Chandra Namaskar and work with water elements',
      mars: 'Recite Hanuman Chalisa and practice physical disciplines',
      mercury: 'Study sacred texts and practice clear communication',
      jupiter: 'Chant Guru Beej Mantra and practice generosity',
      venus: 'Practice Lakshmi worship and artistic expression',
      saturn: 'Serve others and practice patience and discipline',
      rahu: 'Practice spiritual disciplines and avoid material excess',
      ketu: 'Focus on spiritual liberation and meditation'
    };

    return remedies[planet] || 'Practice general spiritual disciplines';
  }

  /**
   * Generate comprehensive Vedic description
   * @param {Object} basicChart - Basic chart
   * @param {Object} dashaAnalysis - Dasha analysis
   * @param {Object} transitAnalysis - Transit analysis
   * @returns {string} Comprehensive description
   */
  generateComprehensiveVedicDescription(
    basicChart,
    dashaAnalysis,
    transitAnalysis
  ) {
    let description = '🕉️ *Complete Vedic Astrology Analysis*\n\n';

    // Basic chart info
    description += '📊 *Birth Chart:*\n';
    description += `• Sun Sign: ${basicChart.sunSign}\n`;
    description += `• Moon Sign: ${basicChart.moonSign}\n`;
    description += `• Rising Sign: ${basicChart.risingSign}\n\n`;

    // Planetary positions
    description += '🌟 *Planetary Positions:*\n';
    if (basicChart.planets) {
      Object.entries(basicChart.planets).forEach(([planet, data]) => {
        description += `• ${data.name}: ${data.sign} ${data.degrees}°${data.minutes}'${data.seconds}" ${data.retrograde ? '(R)' : ''}\n`;
      });
    }
    description += '\n';

    // Dasha analysis
    if (dashaAnalysis.currentDasha) {
      description += '⏳ *Current Dasha Period:*\n';
      description += `• Mahadasha: ${dashaAnalysis.currentDasha.dasha} (${dashaAnalysis.currentDasha.remainingYears} years remaining)\n`;
      description += `• Influence: ${dashaAnalysis.currentDasha.influence}\n`;

      if (dashaAnalysis.antardasha && dashaAnalysis.antardasha.current) {
        description += `• Antardasha: ${dashaAnalysis.antardasha.current.planet} (${dashaAnalysis.antardasha.current.remainingYears} years)\n`;
      }
      description += '\n';
    }

    // Transit analysis
    if (
      transitAnalysis.majorTransits &&
      transitAnalysis.majorTransits.length > 0
    ) {
      description += '🌟 *Current Major Transits:*\n';
      transitAnalysis.majorTransits.slice(0, 3).forEach(transit => {
        description += `• ${transit.planet} ${transit.aspect}: ${transit.influence}\n`;
      });
      description += '\n';
    }

    // Predictions
    const predictions = this.generateVedicPredictions(
      dashaAnalysis,
      transitAnalysis
    );
    description += '🔮 *Predictions:*\n';
    description += `• Short-term: ${predictions.shortTerm}\n`;
    description += `• Medium-term: ${predictions.mediumTerm}\n`;
    description += `• Long-term: ${predictions.longTerm}\n\n`;

    // Remedies
    const remedies = this.generateVedicRemedies(basicChart, dashaAnalysis);
    if (remedies.length > 0) {
      description += '🙏 *Recommended Remedies:*\n';
      remedies.forEach(remedy => {
        description += `• ${remedy}\n`;
      });
      description += '\n';
    }

    description += '📚 *Vedic Wisdom:*\n';
    description += '• Dasha periods show the timing of life\'s chapters\n';
    description += '• Transits reveal current cosmic influences\n';
    description += '• Remedies help harmonize planetary energies\n';
    description +=
      '• Self-awareness and spiritual practice enhance all influences';

    return description;
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

    return (
      descriptions[rating] ||
      'This combination has unique dynamics that require understanding and patience to navigate successfully.'
    );
  }

  /**
   * Calculate Secondary Progressions - Advanced Predictive Astrology
   * Secondary progressions move planets one day per year of life
   * @param {Object} birthData - Birth data object
   * @param {Date} currentDate - Current date for progression
   * @returns {Object} Secondary progressed chart
   */
  calculateSecondaryProgressions(birthData, currentDate = new Date()) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Calculate age in days (one day progression = one year of life)
      const birthDateObj = new Date(year, month - 1, day, hour, minute);
      const ageInDays = Math.floor((currentDate - birthDateObj) / (1000 * 60 * 60 * 24));

      // Calculate progressed date (birth date + age in days)
      const progressedDate = new Date(birthDateObj);
      progressedDate.setDate(progressedDate.getDate() + ageInDays);

      const progressedYear = progressedDate.getFullYear();
      const progressedMonth = progressedDate.getMonth() + 1;
      const progressedDay = progressedDate.getDate();
      const progressedHour = progressedDate.getHours();
      const progressedMinute = progressedDate.getMinutes();

      // Get coordinates for birth place
      const [latitude, longitude] = this._getCoordinatesForPlace(birthPlace);
      const timezone = this._getTimezoneForPlace(birthPlace);

      // Calculate progressed planetary positions
      const progressedData = {
        year: progressedYear,
        month: progressedMonth,
        date: progressedDay,
        hours: progressedHour,
        minutes: progressedMinute,
        seconds: 0,
        latitude,
        longitude,
        timezone,
        chartType: 'sidereal'
      };

      const progressedChart = this.astrologer.generateNatalChartData(progressedData);

      // Calculate age for interpretation
      const ageInYears = Math.floor(ageInDays / 365.25);
      const ageDescription = this._getAgeDescription(ageInYears);

      // Analyze progressed aspects and changes
      const progressedAnalysis = this._analyzeProgressedChart(
        progressedChart,
        ageInYears
      );

      return {
        progressedDate: `${progressedDay}/${progressedMonth}/${progressedYear}`,
        ageInYears,
        ageDescription,
        progressedPlanets: this._formatProgressedPlanets(progressedChart.planets),
        keyProgressions: progressedAnalysis.keyProgressions,
        lifeStage: progressedAnalysis.lifeStage,
        majorThemes: progressedAnalysis.majorThemes,
        timing: progressedAnalysis.timing,
        progressedAspects: this._getProgressedAspects(progressedChart)
      };
    } catch (error) {
      logger.error('Error calculating secondary progressions:', error);
      return {
        error: 'Unable to calculate secondary progressions at this time',
        ageInYears: Math.floor((new Date() - new Date()) / (1000 * 60 * 60 * 24 * 365.25))
      };
    }
  }

  /**
   * Calculate Solar Arc Directions - Another major predictive technique
   * Planets move the same distance as the Sun's arc
   * @param {Object} birthData - Birth data object
   * @param {Date} currentDate - Current date for directions
   * @returns {Object} Solar arc directed chart
   */
  calculateSolarArcDirections(birthData, currentDate = new Date()) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Calculate age in days
      const birthDateObj = new Date(year, month - 1, day, hour, minute);
      const ageInDays = Math.floor((currentDate - birthDateObj) / (1000 * 60 * 60 * 24));

      // Get natal Sun position
      const natalData = {
        year,
        month,
        date: day,
        hours: hour,
        minutes: minute,
        seconds: 0,
        latitude: this._getCoordinatesForPlace(birthPlace)[0],
        longitude: this._getCoordinatesForPlace(birthPlace)[1],
        timezone: this._getTimezoneForPlace(birthPlace),
        chartType: 'sidereal'
      };

      const natalChart = this.astrologer.generateNatalChartData(natalData);
      const natalSunPosition = natalChart.planets.sun.longitude;

      // Calculate solar arc (Sun's movement in degrees)
      const solarArcDegrees = (ageInDays * 360) / 365.25; // Sun moves ~1 degree per day

      // Apply solar arc to all planets
      const directedPlanets = {};
      Object.entries(natalChart.planets).forEach(([planetKey, planetData]) => {
        const directedLongitude = (planetData.longitude + solarArcDegrees) % 360;
        directedPlanets[planetKey] = {
          ...planetData,
          natalLongitude: planetData.longitude,
          directedLongitude,
          arcMovement: solarArcDegrees,
          sign: this._getSignFromLongitude(directedLongitude),
          degrees: Math.floor(directedLongitude % 30),
          minutes: Math.floor((directedLongitude % 1) * 60),
          seconds: Math.floor(((directedLongitude % 1) * 60 % 1) * 60)
        };
      });

      const ageInYears = Math.floor(ageInDays / 365.25);
      const solarArcAnalysis = this._analyzeSolarArcChart(directedPlanets, ageInYears);

      return {
        directedDate: currentDate.toLocaleDateString(),
        ageInYears,
        solarArcDegrees: Math.round(solarArcDegrees * 10) / 10,
        directedPlanets: this._formatDirectedPlanets(directedPlanets),
        keyDirections: solarArcAnalysis.keyDirections,
        lifeChanges: solarArcAnalysis.lifeChanges,
        timing: solarArcAnalysis.timing,
        directedAspects: this._getDirectedAspects(directedPlanets)
      };
    } catch (error) {
      logger.error('Error calculating solar arc directions:', error);
      return {
        error: 'Unable to calculate solar arc directions at this time'
      };
    }
  }

  /**
   * Get age description for progressed chart interpretation
   * @private
   * @param {number} age - Age in years
   * @returns {string} Age description
   */
  _getAgeDescription(age) {
    if (age < 12) return 'Childhood and early development';
    if (age < 21) return 'Adolescence and education';
    if (age < 30) return 'Young adulthood and career beginnings';
    if (age < 40) return 'Career establishment and relationships';
    if (age < 50) return 'Mid-life transitions and responsibilities';
    if (age < 65) return 'Later career and life wisdom';
    return 'Elder years and life reflection';
  }

  /**
   * Analyze progressed chart for key progressions
   * @private
   * @param {Object} progressedChart - Progressed chart data
   * @param {number} age - Current age
   * @returns {Object} Analysis results
   */
  _analyzeProgressedChart(progressedChart, age) {
    const keyProgressions = [];
    const majorThemes = [];
    const timing = [];

    // Analyze progressed Sun (moves ~1 degree per year)
    const progressedSun = progressedChart.planets.sun;
    if (progressedSun) {
      keyProgressions.push({
        planet: 'Sun',
        position: `${progressedSun.sign} ${progressedSun.degrees}°`,
        significance: 'Core identity and life direction'
      });

      // Sun sign changes (every ~30 years)
      if (age % 30 < 2) {
        majorThemes.push('Major life transition and identity shift');
        timing.push('Period of significant personal change');
      }
    }

    // Analyze progressed Moon (moves ~13-14 degrees per year)
    const progressedMoon = progressedChart.planets.moon;
    if (progressedMoon) {
      keyProgressions.push({
        planet: 'Moon',
        position: `${progressedMoon.sign} ${progressedMoon.degrees}°`,
        significance: 'Emotional development and inner life'
      });

      // Moon changes signs frequently, indicating emotional phases
      majorThemes.push('Emotional growth and inner changes');
    }

    // Determine life stage
    let lifeStage = 'Development';
    if (age < 30) lifeStage = 'Foundation Building';
    else if (age < 50) lifeStage = 'Career & Relationship Focus';
    else lifeStage = 'Wisdom & Reflection';

    return {
      keyProgressions,
      lifeStage,
      majorThemes,
      timing
    };
  }

  /**
   * Analyze solar arc directed chart
   * @private
   * @param {Object} directedPlanets - Directed planetary positions
   * @param {number} age - Current age
   * @returns {Object} Analysis results
   */
  _analyzeSolarArcChart(directedPlanets, age) {
    const keyDirections = [];
    const lifeChanges = [];
    const timing = [];

    // Analyze directed planets
    Object.entries(directedPlanets).forEach(([planetKey, planetData]) => {
      if (planetData.arcMovement > 10) { // Significant movement
        keyDirections.push({
          planet: planetData.name,
          from: `${this._getSignFromLongitude(planetData.natalLongitude)} ${Math.floor(planetData.natalLongitude % 30)}°`,
          to: `${planetData.sign} ${planetData.degrees}°`,
          significance: this._getSolarArcSignificance(planetKey)
        });
      }
    });

    // Age-based timing analysis
    if (age >= 27 && age <= 33) {
      lifeChanges.push('Saturn return period - major life restructuring');
      timing.push('Critical turning point in life direction');
    } else if (age >= 54 && age <= 60) {
      lifeChanges.push('Second Saturn return - life evaluation');
      timing.push('Period of wisdom and life review');
    }

    return {
      keyDirections,
      lifeChanges,
      timing
    };
  }

  /**
   * Get sign from longitude
   * @private
   * @param {number} longitude - Longitude in degrees
   * @returns {string} Zodiac sign
   */
  _getSignFromLongitude(longitude) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs[Math.floor(longitude / 30)];
  }

  /**
   * Get solar arc significance for a planet
   * @private
   * @param {string} planet - Planet key
   * @returns {string} Significance description
   */
  _getSolarArcSignificance(planet) {
    const significances = {
      sun: 'Major life direction and identity changes',
      moon: 'Emotional and inner life transformations',
      mercury: 'Communication and learning breakthroughs',
      venus: 'Relationship and value system changes',
      mars: 'Energy and action pattern shifts',
      jupiter: 'Expansion and opportunity periods',
      saturn: 'Responsibility and life structure changes',
      uranus: 'Sudden changes and liberation',
      neptune: 'Spiritual and creative awakening',
      pluto: 'Deep transformation and rebirth'
    };

    return significances[planet] || 'Significant life changes';
  }

  /**
   * Format progressed planets for display
   * @private
   * @param {Object} planets - Progressed planetary data
   * @returns {Object} Formatted planets
   */
  _formatProgressedPlanets(planets) {
    const formatted = {};
    Object.entries(planets).forEach(([key, data]) => {
      formatted[key] = {
        name: data.name,
        sign: data.signName,
        degrees: data.position.degrees,
        minutes: data.position.minutes,
        seconds: data.position.seconds,
        retrograde: data.retrograde,
        position: `${data.position.degrees}°${data.position.minutes}'${data.position.seconds}"`
      };
    });
    return formatted;
  }

  /**
   * Format directed planets for display
   * @private
   * @param {Object} planets - Directed planetary data
   * @returns {Object} Formatted planets
   */
  _formatDirectedPlanets(planets) {
    const formatted = {};
    Object.entries(planets).forEach(([key, data]) => {
      formatted[key] = {
        name: data.name,
        natalPosition: `${this._getSignFromLongitude(data.natalLongitude)} ${Math.floor(data.natalLongitude % 30)}°`,
        directedPosition: `${data.sign} ${data.degrees}°${data.minutes}'${data.seconds}"`,
        arcMovement: `${Math.round(data.arcMovement * 10) / 10}°`,
        significance: this._getSolarArcSignificance(key)
      };
    });
    return formatted;
  }

  /**
   * Get progressed aspects
   * @private
   * @param {Object} progressedChart - Progressed chart
   * @returns {Array} Major progressed aspects
   */
  _getProgressedAspects(progressedChart) {
    // Simplified aspect analysis for progressed chart
    const aspects = [];
    const planets = Object.values(progressedChart.planets);

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];

        if (planet1.longitude && planet2.longitude) {
          const angle = Math.abs(planet1.longitude - planet2.longitude) % 360;
          const minAngle = Math.min(angle, 360 - angle);

          if (minAngle <= 10) { // Within 10 degrees of exact aspect
            aspects.push({
              planets: `${planet1.name}-${planet2.name}`,
              aspect: minAngle <= 5 ? 'conjunction' : 'close aspect',
              orb: Math.round(minAngle * 10) / 10
            });
          }
        }
      }
    }

    return aspects.slice(0, 5); // Return top 5 aspects
  }

  /**
   * Get directed aspects
   * @private
   * @param {Object} directedPlanets - Directed planets
   * @returns {Array} Major directed aspects
   */
  _getDirectedAspects(directedPlanets) {
    const aspects = [];
    const planets = Object.values(directedPlanets);

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];

        if (planet1.directedLongitude && planet2.directedLongitude) {
          const angle = Math.abs(planet1.directedLongitude - planet2.directedLongitude) % 360;
          const minAngle = Math.min(angle, 360 - angle);

          if (minAngle <= 10) {
            aspects.push({
              planets: `${planet1.name}-${planet2.name}`,
              aspect: minAngle <= 5 ? 'conjunction' : 'close aspect',
              orb: Math.round(minAngle * 10) / 10
            });
          }
        }
      }
    }

    return aspects.slice(0, 5);
  }
}

module.exports = new VedicCalculator();
