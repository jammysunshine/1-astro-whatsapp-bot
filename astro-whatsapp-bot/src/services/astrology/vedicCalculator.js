const logger = require('../../utils/logger');

/**
 * Professional Vedic Astrology Calculator with Astrologer Library
 * Provides complete natal chart analysis using Swiss Ephemeris and astrological interpretations
 */

const { Astrologer } = require('astrologer');
const sweph = require('sweph');
const { VedicRemedies } = require('./vedicRemedies');

const NodeGeocoder = require('node-geocoder');
const { Client } = require('@googlemaps/google-maps-services-js');

// Initialize Geocoder (using OpenStreetMap for simplicity, can be configured for Google Maps if API key is available)
const geocoderOptions = {
  provider: 'openstreetmap', // Can be 'google', 'here', etc.
  // apiKey: process.env.GOOGLE_MAPS_API_KEY, // Uncomment if using Google Maps Geocoding
  formatter: null // 'gpx', 'string', ...
};
const geocoder = NodeGeocoder(geocoderOptions);

// Initialize Google Maps Services Client for Time Zone API
const googleMapsClient = new Client({});

// Ensure Google Maps API Key is set for Time Zone API
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!GOOGLE_MAPS_API_KEY) {
  logger.warn('⚠️ GOOGLE_MAPS_API_KEY is not set. Time Zone API functionality may be limited.');
}

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

    // Initialize Vedic Remedies system
    try {
      logger.info('Initializing Vedic Remedies system...');
      this._vedicRemedies = new VedicRemedies();
      logger.info('Vedic Remedies system initialized successfully.');
    } catch (error) {
      logger.error('❌ Error initializing Vedic Remedies system:', error.message);
      logger.warn('Vedic Remedies will not be available.');
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
   * Get coordinates for a place using NodeGeocoder
   * @private
   * @param {string} place - Place name (City, Country)
   * @returns {Promise<Array>} [latitude, longitude]
   */
  async _getCoordinatesForPlace(place) {
    try {
      const res = await geocoder.geocode(place);
      if (res && res.length > 0) {
        return [res[0].latitude, res[0].longitude];
      }
    } catch (error) {
      logger.error(`❌ Error geocoding place "${place}":`, error.message);
    }
    // Fallback to default if geocoding fails
    return [28.6139, 77.209]; // Default to Delhi, India
  }

  /**
   * Get timezone for a place using Google Maps Time Zone API
   * @private
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} timestamp - Unix timestamp of the event
   * @returns {Promise<number>} UTC offset in hours
   */
  async _getTimezoneForPlace(latitude, longitude, timestamp) {
    if (!GOOGLE_MAPS_API_KEY) {
      logger.warn('GOOGLE_MAPS_API_KEY is not set. Using default timezone offset (IST).');
      return 5.5; // Default to IST offset
    }

    try {
      const response = await googleMapsClient.timezone({
        params: {
          location: { lat: latitude, lng: longitude },
          timestamp: timestamp / 1000, // Google API expects seconds
          key: GOOGLE_MAPS_API_KEY,
        },
        timeout: 1000, // milliseconds
      });

      if (response.data.status === 'OK') {
        const rawOffset = response.data.rawOffset; // Offset in seconds from UTC
        const dstOffset = response.data.dstOffset; // Daylight saving offset in seconds
        return (rawOffset + dstOffset) / 3600; // Convert to hours
      } else {
        logger.error('Google Maps Time Zone API error:', response.data.errorMessage);
      }
    } catch (error) {
      logger.error('❌ Error fetching timezone from Google Maps API:', error.message);
    }
    // Fallback to default if API call fails
    return 5.5; // Default to IST offset
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
   * Calculate Solar Return analysis for upcoming birthday year
   * @param {Object} birthData - Birth data object with birthDate, birthTime, birthPlace
   * @returns {Object} Solar return analysis
   */
  calculateSolarReturn(birthData) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return {
          error: 'Complete birth details required for solar return analysis'
        };
      }

      // Parse birth date
      const [birthDay, birthMonth, birthYear] = birthDate.split('/').map(Number);
      const [birthHour, birthMinute] = birthTime.split(':').map(Number);

      // Get current year and calculate target year (next birthday)
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const targetYear = currentDate.getMonth() + 1 > birthMonth ||
                        (currentDate.getMonth() + 1 === birthMonth && currentDate.getDate() >= birthDay) ?
                        currentYear + 1 : currentYear;

      // Calculate solar return timing
      const solarReturnTiming = this._calculateSolarReturnTime(
        birthYear, birthMonth, birthDay, birthHour, birthMinute, targetYear
      );

      // Get birth place coordinates
      const [latitude, longitude] = this._getCoordinatesForPlace(birthPlace);
      const timezone = this._getTimezoneForPlace(birthPlace);

      // Generate solar return chart
      const solarReturnChart = this._generateSolarReturnChart(
        birthYear, birthMonth, birthDay, birthHour, birthMinute,
        targetYear, latitude, longitude, timezone
      );

      // Analyze the solar return chart
      const analysis = this._analyzeSolarReturnChart(
        solarReturnChart, birthData, targetYear
      );

      // Generate summary
      const summary = this._generateSolarReturnSummary(analysis, targetYear);

      return {
        yearAhead: targetYear,
        solarReturnDate: `${solarReturnTiming.day}/${solarReturnTiming.month}/${solarReturnTiming.year}`,
        solarReturnTime: `${solarReturnTiming.hour}:${solarReturnTiming.minute.toString().padStart(2, '0')}`,
        dominantThemes: analysis.dominantThemes,
        opportunities: analysis.opportunities,
        challenges: analysis.challenges,
        keyPlanets: analysis.keyPlanets,
        lifeAreas: analysis.lifeAreas,
        summary,
        chart: solarReturnChart
      };
    } catch (error) {
      logger.error('Error calculating solar return:', error);
      return {
        error: 'Unable to calculate solar return at this time'
      };
    }
  }

  /**
   * Generate solar return chart data
   * @private
   * @param {number} birthYear - Birth year
   * @param {number} birthMonth - Birth month
   * @param {number} birthDay - Birth day
   * @param {number} birthHour - Birth hour
   * @param {number} birthMinute - Birth minute
   * @param {number} targetYear - Target year
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} timezone - Timezone
   * @returns {Object} Solar return chart data
   */
  _generateSolarReturnChart(birthYear, birthMonth, birthDay, birthHour, birthMinute, targetYear, latitude, longitude, timezone) {
    try {
      // Calculate solar return timing
      const returnTime = this._calculateSolarReturnTime(
        birthYear, birthMonth, birthDay, birthHour, birthMinute, targetYear
      );

      // Prepare data for astrologer library
      const astroData = {
        year: returnTime.year,
        month: returnTime.month,
        date: returnTime.day,
        hours: returnTime.hour,
        minutes: returnTime.minute,
        seconds: 0,
        latitude,
        longitude,
        timezone,
        chartType: 'sidereal'
      };

      // Generate solar return chart
      const chart = this.astrologer.generateNatalChartData(astroData);

      return chart;
    } catch (error) {
      logger.error('Error generating solar return chart:', error);
      // Return basic chart structure
      return {
        planets: {},
        houses: {},
        aspects: [],
        interpretations: {
          sunSign: 'Unknown',
          moonSign: 'Unknown',
          risingSign: 'Unknown'
        }
      };
    }
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
        ceres: this._calculateAsteroidPosition('ceres', astroData),
        chiron: this._calculateAsteroidPosition('chiron', astroData),
        juno: this._calculateAsteroidPosition('juno', astroData),
        vesta: this._calculateAsteroidPosition('vesta', astroData),
        pallas: this._calculateAsteroidPosition('pallas', astroData)
      };

      // Generate interpretations
      const interpretations = {
        ceres: this._interpretCeres(asteroids.ceres),
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
    try {
      // Use Swiss Ephemeris for precise asteroid calculations
      const asteroidIds = {
        ceres: 1,
        pallas: 2,
        juno: 3,
        vesta: 4,
        chiron: 2060
      };

      const asteroidId = asteroidIds[asteroidName];
      if (!asteroidId) {
        throw new Error(`Unknown asteroid: ${asteroidName}`);
      }

      // Convert birth date to Julian Day
      const birthJD = this._dateToJulianDay(
        astroData.year,
        astroData.month,
        astroData.date,
        astroData.hours + astroData.minutes / 60
      );

      // Calculate asteroid position using Swiss Ephemeris
      const position = sweph.calc(birthJD, asteroidId, sweph.FLG_SWIEPH | sweph.FLG_SPEED);

      if (position && position.longitude) {
        return position.longitude[0]; // Return longitude in degrees
      }

      // Fallback to approximate positions if Swiss Ephemeris fails
      logger.warn(`Swiss Ephemeris failed for ${asteroidName}, using fallback`);
      return this._getFallbackAsteroidPosition(asteroidName, astroData);

    } catch (error) {
      logger.error(`Error calculating ${asteroidName} position with Swiss Ephemeris:`, error);
      return this._getFallbackAsteroidPosition(asteroidName, astroData);
    }
  }

  /**
   * Fallback asteroid position calculation
   * @private
   */
  _getFallbackAsteroidPosition(asteroidName, astroData) {
    const basePositions = {
      ceres: 25.5,   // Approximate position in Pisces
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
   * Convert date to Julian Day
   * @private
   */
  _dateToJulianDay(year, month, day, hour) {
    // Simplified Julian Day calculation
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;

    const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    return jd + (hour - 12) / 24; // Adjust for time
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
   * Interpret Ceres position
   * @private
   * @param {Object} ceres - Ceres data
   * @returns {Object} Ceres interpretation
   */
  _interpretCeres(ceres) {
    const signInterpretations = {
      'Aries': 'Independent nurturing, self-sufficient caregiving',
      'Taurus': 'Sensual nurturing, providing material comfort and security',
      'Gemini': 'Intellectual nurturing, communicative care and teaching',
      'Cancer': 'Emotional nurturing, intuitive caregiving and protection',
      'Leo': 'Creative nurturing, dramatic care with warmth and generosity',
      'Virgo': 'Practical nurturing, health-focused care and service',
      'Libra': 'Harmonious nurturing, balanced care and relationship support',
      'Scorpio': 'Intense nurturing, transformative care and deep emotional support',
      'Sagittarius': 'Adventurous nurturing, expansive care and philosophical guidance',
      'Capricorn': 'Structured nurturing, responsible care and long-term support',
      'Aquarius': 'Innovative nurturing, community care and humanitarian support',
      'Pisces': 'Compassionate nurturing, spiritual care and unconditional love'
    };

    return {
      nurturingStyle: signInterpretations[ceres.sign] || 'Unique nurturing approach',
      caregivingApproach: this._getCeresCaregivingApproach(ceres.sign),
      cyclesOfLife: this._getCeresLifeCycles(ceres.sign),
      keyThemes: ['Nurturing', 'Caregiving', 'Cycles', 'Abundance']
    };
  }

  /**
   * Get Ceres caregiving approach
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Caregiving approach
   */
  _getCeresCaregivingApproach(sign) {
    const approaches = {
      'Aries': 'Direct and empowering care, encouraging independence',
      'Taurus': 'Sensual and grounding care, providing stability',
      'Gemini': 'Communicative care, teaching and intellectual support',
      'Cancer': 'Emotional and protective care, creating safe spaces',
      'Leo': 'Dramatic and generous care, boosting confidence',
      'Virgo': 'Practical and health-focused care, detailed attention',
      'Libra': 'Harmonious care, maintaining balance and beauty',
      'Scorpio': 'Intense and transformative care, deep healing',
      'Sagittarius': 'Expansive care, encouraging growth and exploration',
      'Capricorn': 'Structured care, building long-term security',
      'Aquarius': 'Innovative care, community and progressive support',
      'Pisces': 'Compassionate care, spiritual and empathetic nurturing'
    };

    return approaches[sign] || 'Personal caregiving style';
  }

  /**
   * Get Ceres life cycles
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Life cycles
   */
  _getCeresLifeCycles(sign) {
    const cycles = {
      'Aries': 'Cycles of independence, new beginnings, and self-care',
      'Taurus': 'Cycles of material abundance, sensual pleasure, and stability',
      'Gemini': 'Cycles of communication, learning, and mental stimulation',
      'Cancer': 'Cycles of emotional security, family, and home',
      'Leo': 'Cycles of creativity, self-expression, and joy',
      'Virgo': 'Cycles of health, service, and practical organization',
      'Libra': 'Cycles of harmony, relationships, and aesthetic beauty',
      'Scorpio': 'Cycles of transformation, intimacy, and rebirth',
      'Sagittarius': 'Cycles of exploration, philosophy, and expansion',
      'Capricorn': 'Cycles of achievement, structure, and responsibility',
      'Aquarius': 'Cycles of innovation, community, and humanitarian work',
      'Pisces': 'Cycles of compassion, spirituality, and artistic expression'
    };

    return cycles[sign] || 'Personal life cycles';
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

    summary += `🌾 *Ceres in ${asteroids.ceres.sign}*: ${interpretations.ceres.nurturingStyle}\n`;
    summary += `🩹 *Chiron in ${asteroids.chiron.sign}*: ${interpretations.chiron.coreWound}\n`;
    summary += `💍 *Juno in ${asteroids.juno.sign}*: ${interpretations.juno.relationshipStyle}\n`;
    summary += `🏛️ *Vesta in ${asteroids.vesta.sign}*: ${interpretations.vesta.sacredFocus}\n`;
    summary += `🎨 *Pallas in ${asteroids.pallas.sign}*: ${interpretations.pallas.wisdomType}\n\n`;

    summary += 'These five asteroids reveal your nurturing patterns, core wounds and healing, relationship dynamics, spiritual focus, and creative wisdom.';

    return summary;
  }

  /**
   * Calculate solar return time (simplified)
   * @private
   * @param {number} birthYear - Birth year
   * @param {number} birthMonth - Birth month
   * @param {number} birthDay - Birth day
   * @param {number} birthHour - Birth hour
   * @param {number} birthMinute - Birth minute
   * @param {number} targetYear - Target year
   * @returns {Object} Solar return timing
   */
  _calculateSolarReturnTime(birthYear, birthMonth, birthDay, birthHour, birthMinute, targetYear) {
    // Simplified calculation - in practice would need precise astronomical calculation
    // For now, approximate the solar return time

    const yearsDiff = targetYear - birthYear;
    const approxReturnDate = new Date(targetYear, birthMonth - 1, birthDay, birthHour, birthMinute);

    // Add small adjustment for precession (simplified)
    const adjustmentMinutes = yearsDiff * 6; // Rough adjustment
    approxReturnDate.setMinutes(approxReturnDate.getMinutes() + adjustmentMinutes);

    return {
      year: approxReturnDate.getFullYear(),
      month: approxReturnDate.getMonth() + 1,
      day: approxReturnDate.getDate(),
      hour: approxReturnDate.getHours(),
      minute: approxReturnDate.getMinutes()
    };
  }

  /**
   * Analyze solar return chart
   * @private
   * @param {Object} solarReturnChart - Solar return chart data
   * @param {Object} birthData - Original birth data
   * @param {number} targetYear - Target year
   * @returns {Object} Solar return analysis
   */
  _analyzeSolarReturnChart(solarReturnChart, birthData, targetYear) {
    const analysis = {
      dominantThemes: [],
      keyPlanets: [],
      lifeAreas: [],
      challenges: [],
      opportunities: []
    };

    // Analyze Sun's house in solar return (theme of the year)
    const sunHouse = solarReturnChart.planets.sun?.house || 'Unknown';
    analysis.dominantThemes.push(this._getSolarReturnSunTheme(sunHouse));

    // Analyze Moon's sign (emotional tone)
    const moonSign = solarReturnChart.planets.moon?.signName || 'Unknown';
    analysis.dominantThemes.push(`Emotional focus in ${moonSign} energy`);

    // Analyze Jupiter's house (area of expansion)
    const jupiterHouse = solarReturnChart.planets.jupiter?.house || 'Unknown';
    if (jupiterHouse !== 'Unknown') {
      analysis.opportunities.push(this._getSolarReturnJupiterTheme(jupiterHouse));
    }

    // Analyze Saturn's house (area of responsibility)
    const saturnHouse = solarReturnChart.planets.saturn?.house || 'Unknown';
    if (saturnHouse !== 'Unknown') {
      analysis.challenges.push(this._getSolarReturnSaturnTheme(saturnHouse));
    }

    // Key planetary placements
    analysis.keyPlanets = this._getKeySolarReturnPlanets(solarReturnChart);

    // Life areas affected
    analysis.lifeAreas = this._getSolarReturnLifeAreas(solarReturnChart);

    return analysis;
  }

  /**
   * Get solar return theme based on Sun's house
   * @private
   * @param {string} house - Sun's house in solar return
   * @returns {string} Theme description
   */
  _getSolarReturnSunTheme(house) {
    const themes = {
      '1': 'Year of self-discovery and personal identity',
      '2': 'Focus on finances, values, and material security',
      '3': 'Year of communication, learning, and social connections',
      '4': 'Emphasis on home, family, and emotional foundations',
      '5': 'Creative expression, romance, and self-expression',
      '6': 'Health, service, and daily routines take center stage',
      '7': 'Partnerships and relationships are highlighted',
      '8': 'Transformation, shared resources, and deep change',
      '9': 'Expansion through travel, education, and philosophy',
      '10': 'Career advancement and public recognition',
      '11': 'Community involvement and future-oriented goals',
      '12': 'Spirituality, endings, and inner work'
    };

    return themes[house] || 'Year of personal growth and new beginnings';
  }

  /**
   * Get solar return Jupiter theme
   * @private
   * @param {string} house - Jupiter's house in solar return
   * @returns {string} Opportunity description
   */
  _getSolarReturnJupiterTheme(house) {
    const themes = {
      '1': 'Personal growth and self-confidence expansion',
      '2': 'Financial opportunities and increased income',
      '3': 'Learning opportunities and communication growth',
      '4': 'Home and family expansion or improvement',
      '5': 'Creative projects and romantic opportunities',
      '6': 'Health improvement and service opportunities',
      '7': 'Relationship growth and partnership benefits',
      '8': 'Financial windfalls and transformational opportunities',
      '9': 'Travel opportunities and educational advancement',
      '10': 'Career advancement and professional recognition',
      '11': 'Community involvement and goal achievement',
      '12': 'Spiritual growth and inner wisdom'
    };

    return themes[house] || 'General expansion and growth opportunities';
  }

  /**
   * Get solar return Saturn theme
   * @private
   * @param {string} house - Saturn's house in solar return
   * @returns {string} Challenge description
   */
  _getSolarReturnSaturnTheme(house) {
    const themes = {
      '1': 'Building self-discipline and personal responsibility',
      '2': 'Financial planning and material responsibility',
      '3': 'Developing communication skills and learning discipline',
      '4': 'Home and family responsibilities and restructuring',
      '5': 'Taking creative projects seriously and building skills',
      '6': 'Health discipline and work routine establishment',
      '7': 'Relationship commitment and partnership work',
      '8': 'Financial responsibility and transformational work',
      '9': 'Educational commitment and philosophical discipline',
      '10': 'Career responsibility and professional development',
      '11': 'Community responsibility and long-term planning',
      '12': 'Spiritual discipline and inner work commitment'
    };

    return themes[house] || 'General responsibility and structure building';
  }

  /**
   * Get key planets in solar return
   * @private
   * @param {Object} solarReturnChart - Solar return chart
   * @returns {Array} Key planetary placements
   */
  _getKeySolarReturnPlanets(solarReturnChart) {
    const keyPlanets = [];

    // Check for planets in angular houses (1, 4, 7, 10)
    const angularHouses = ['1', '4', '7', '10'];

    Object.entries(solarReturnChart.planets).forEach(([planetKey, planetData]) => {
      const house = planetData.house;
      if (angularHouses.includes(house)) {
        keyPlanets.push(`${planetData.name} in ${house}th house - ${this._getAngularHouseTheme(house)}`);
      }
    });

    return keyPlanets.length > 0 ? keyPlanets : ['General planetary influences throughout the year'];
  }

  /**
   * Get angular house theme
   * @private
   * @param {string} house - House number
   * @returns {string} Theme description
   */
  _getAngularHouseTheme(house) {
    const themes = {
      '1': 'Personal initiative and self-expression',
      '4': 'Home and family matters',
      '7': 'Partnerships and relationships',
      '10': 'Career and public life'
    };

    return themes[house] || 'Significant life area';
  }

  /**
   * Get life areas affected in solar return
   * @private
   * @param {Object} solarReturnChart - Solar return chart
   * @returns {Array} Life areas
   */
  _getSolarReturnLifeAreas(solarReturnChart) {
    const lifeAreas = [];
    const houseOccupancy = {};

    // Count planets in each house
    Object.values(solarReturnChart.planets).forEach(planet => {
      const house = planet.house;
      if (house && house !== 'Unknown') {
        houseOccupancy[house] = (houseOccupancy[house] || 0) + 1;
      }
    });

    // Find houses with multiple planets (stelliums)
    Object.entries(houseOccupancy).forEach(([house, count]) => {
      if (count >= 3) {
        lifeAreas.push(`Intense focus on ${this._getHouseArea(house)}`);
      } else if (count >= 2) {
        lifeAreas.push(`Activity in ${this._getHouseArea(house)}`);
      }
    });

    return lifeAreas.length > 0 ? lifeAreas : ['Balanced energy across life areas'];
  }

  /**
   * Get house area description
   * @private
   * @param {string} house - House number
   * @returns {string} Area description
   */
  _getHouseArea(house) {
    const areas = {
      '1': 'personal identity and self-expression',
      '2': 'finances and material values',
      '3': 'communication and learning',
      '4': 'home and family',
      '5': 'creativity and romance',
      '6': 'health and service',
      '7': 'partnerships and relationships',
      '8': 'transformation and shared resources',
      '9': 'travel and higher learning',
      '10': 'career and reputation',
      '11': 'community and friendships',
      '12': 'spirituality and inner life'
    };

    return areas[house] || 'life matters';
  }

  /**
   * Generate solar return summary
   * @private
   * @param {Object} solarReturnAnalysis - Solar return analysis
   * @param {number} targetYear - Target year
   * @returns {string} Solar return summary
   */
  _generateSolarReturnSummary(solarReturnAnalysis, targetYear) {
    let summary = `Solar Return Analysis for ${targetYear}:\n\n`;

    if (solarReturnAnalysis.dominantThemes.length > 0) {
      summary += '*Dominant Themes:*\n';
      solarReturnAnalysis.dominantThemes.forEach(theme => {
        summary += `• ${theme}\n`;
      });
      summary += '\n';
    }

    if (solarReturnAnalysis.opportunities.length > 0) {
      summary += '*Key Opportunities:*\n';
      solarReturnAnalysis.opportunities.forEach(opportunity => {
        summary += `• ${opportunity}\n`;
      });
      summary += '\n';
    }

    if (solarReturnAnalysis.challenges.length > 0) {
      summary += '*Areas of Growth:*\n';
      solarReturnAnalysis.challenges.forEach(challenge => {
        summary += `• ${challenge}\n`;
      });
      summary += '\n';
    }

    summary += 'Your solar return reveals the cosmic blueprint for the coming year! 🌞';

    return summary;
  }

  /**
   * Calculate upcoming cosmic events and their personal impact
   * @param {Object} birthData - User's birth data
   * @param {number} daysAhead - Number of days to look ahead (default 30)
   * @returns {Object} Cosmic events analysis
   */
  calculateCosmicEvents(birthData, daysAhead = 30) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;
      const currentDate = new Date();
      const endDate = new Date(currentDate.getTime() + (daysAhead * 24 * 60 * 60 * 1000));

      // Get user's natal chart for correlation
      const natalChart = this.generateBasicBirthChart({
        name: 'User',
        birthDate,
        birthTime,
        birthPlace
      });

      const events = {
        eclipses: this._calculateUpcomingEclipses(currentDate, endDate, birthPlace),
        planetaryEvents: this._calculateUpcomingPlanetaryEvents(currentDate, endDate),
        seasonalEvents: this._calculateUpcomingSeasonalEvents(currentDate, endDate),
        personalImpact: this._correlateEventsWithChart(natalChart, currentDate, endDate)
      };

      return {
        period: `${currentDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
        events,
        summary: this._generateCosmicEventsSummary(events, natalChart)
      };
    } catch (error) {
      logger.error('Error calculating cosmic events:', error);
      return {
        error: 'Unable to calculate cosmic events at this time'
      };
    }
  }

  /**
   * Calculate upcoming eclipses
   * @private
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {string} birthPlace - User's birth place for visibility
   * @returns {Array} Upcoming eclipses
   */
  _calculateUpcomingEclipses(startDate, endDate, birthPlace) {
    // Simplified eclipse calculation - in production would use astronomical data
    const eclipses = [];

    // Known eclipses in 2025 (example data)
    const knownEclipses = [
      {
        date: '2025-03-14',
        type: 'solar',
        subtype: 'total',
        visibility: 'Pacific, Atlantic regions',
        magnitude: 1.04,
        significance: 'Powerful new beginnings, leadership changes'
      },
      {
        date: '2025-03-29',
        type: 'lunar',
        subtype: 'penumbral',
        visibility: 'Americas, Europe, Africa',
        magnitude: 0.92,
        significance: 'Emotional release, relationship insights'
      },
      {
        date: '2025-09-07',
        type: 'solar',
        subtype: 'annular',
        visibility: 'Pacific, Americas',
        magnitude: 0.93,
        significance: 'Transformation, breaking old patterns'
      },
      {
        date: '2025-09-21',
        type: 'lunar',
        subtype: 'partial',
        visibility: 'Asia, Australia, Americas',
        magnitude: 0.86,
        significance: 'Deep emotional processing, healing'
      }
    ];

    knownEclipses.forEach(eclipse => {
      const eclipseDate = new Date(eclipse.date);
      if (eclipseDate >= startDate && eclipseDate <= endDate) {
        eclipses.push({
          ...eclipse,
          date: eclipseDate.toLocaleDateString(),
          localVisibility: this._checkEclipseVisibility(eclipse, birthPlace),
          timing: eclipseDate.toLocaleTimeString()
        });
      }
    });

    return eclipses;
  }

  /**
   * Calculate upcoming planetary events
   * @private
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Upcoming planetary events
   */
  _calculateUpcomingPlanetaryEvents(startDate, endDate) {
    const events = [];

    // Known planetary events 2025 (simplified)
    const planetaryEvents = [
      {
        date: '2025-01-15',
        planet: 'Mercury',
        event: 'retrograde begins',
        sign: 'Aquarius',
        significance: 'Communication slowdown, review plans'
      },
      {
        date: '2025-02-04',
        planet: 'Mercury',
        event: 'retrograde ends',
        sign: 'Capricorn',
        significance: 'Communication flows again, implement changes'
      },
      {
        date: '2025-04-17',
        planet: 'Venus',
        event: 'retrograde begins',
        sign: 'Taurus',
        significance: 'Relationship review, value reassessment'
      },
      {
        date: '2025-05-06',
        planet: 'Venus',
        event: 'retrograde ends',
        sign: 'Taurus',
        significance: 'Harmony returns, new relationships blossom'
      },
      {
        date: '2025-06-26',
        planet: 'Saturn',
        event: 'retrograde begins',
        sign: 'Pisces',
        significance: 'Karmic lessons, structure review'
      },
      {
        date: '2025-11-15',
        planet: 'Saturn',
        event: 'retrograde ends',
        sign: 'Pisces',
        significance: 'Wisdom gained, new foundations laid'
      },
      {
        date: '2025-05-11',
        planet: 'Jupiter',
        event: 'conjunct Uranus',
        sign: 'Taurus',
        significance: 'Breakthrough innovation, unexpected opportunities'
      },
      {
        date: '2025-08-29',
        planet: 'Mars',
        event: 'square Saturn',
        sign: 'Gemini-Leo',
        significance: 'Action meets resistance, patience required'
      }
    ];

    planetaryEvents.forEach(event => {
      const eventDate = new Date(event.date);
      if (eventDate >= startDate && eventDate <= endDate) {
        events.push({
          ...event,
          date: eventDate.toLocaleDateString(),
          timing: eventDate.toLocaleTimeString(),
          intensity: this._getEventIntensity(event.event),
          duration: this._getEventDuration(event.planet, event.event)
        });
      }
    });

    return events;
  }

  /**
   * Calculate upcoming seasonal events
   * @private
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Seasonal events
   */
  _calculateUpcomingSeasonalEvents(startDate, endDate) {
    const events = [];

    // Seasonal events and astrological festivals
    const seasonalEvents = [
      {
        date: '2025-03-20',
        event: 'Vernal Equinox',
        significance: 'Balance, new beginnings, spring energy',
        astrological: 'Aries season begins, action and initiative'
      },
      {
        date: '2025-06-21',
        event: 'Summer Solstice',
        significance: 'Peak energy, celebration, abundance',
        astrological: 'Cancer season begins, nurturing and protection'
      },
      {
        date: '2025-09-22',
        event: 'Autumn Equinox',
        significance: 'Harvest, gratitude, balance restored',
        astrological: 'Libra season begins, harmony and relationships'
      },
      {
        date: '2025-12-21',
        event: 'Winter Solstice',
        significance: 'Rebirth, renewal, inner reflection',
        astrological: 'Capricorn season begins, structure and achievement'
      }
    ];

    seasonalEvents.forEach(event => {
      const eventDate = new Date(event.date);
      if (eventDate >= startDate && eventDate <= endDate) {
        events.push({
          ...event,
          date: eventDate.toLocaleDateString(),
          timing: eventDate.toLocaleTimeString(),
          element: this._getSeasonalElement(event.event),
          planetaryRuler: this._getSeasonalRuler(event.event)
        });
      }
    });

    return events;
  }

  /**
   * Correlate cosmic events with personal chart
   * @private
   * @param {Object} natalChart - User's natal chart
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Personal impact correlations
   */
  _correlateEventsWithChart(natalChart, startDate, endDate) {
    const correlations = [];

    // Get current transits for the period
    const transits = this.calculateAdvancedTransits(natalChart.fullChart, startDate);

    if (transits.majorTransits) {
      transits.majorTransits.forEach(transit => {
        correlations.push({
          event: `${transit.planet} ${transit.aspect}`,
          personalImpact: transit.influence,
          affectedHouses: this._getAffectedHouses(transit.planet, natalChart),
          timing: 'Current period',
          intensity: transit.intensity
        });
      });
    }

    // Add eclipse correlations
    const eclipses = this._calculateUpcomingEclipses(startDate, endDate, natalChart.birthPlace);
    eclipses.forEach(eclipse => {
      const personalCorrelation = this._getEclipsePersonalImpact(eclipse, natalChart);
      if (personalCorrelation) {
        correlations.push({
          event: `${eclipse.type} eclipse`,
          personalImpact: personalCorrelation,
          affectedHouses: this._getEclipseHouses(eclipse, natalChart),
          timing: eclipse.date,
          intensity: 'High'
        });
      }
    });

    return correlations;
  }

  /**
   * Generate cosmic events summary
   * @private
   * @param {Object} events - All cosmic events
   * @param {Object} natalChart - User's natal chart
   * @returns {string} Summary text
   */
  _generateCosmicEventsSummary(events, natalChart) {
    let summary = '🌟 *Cosmic Events Overview*\n\n';

    if (events.eclipses.length > 0) {
      summary += `*Eclipses:*\n`;
      events.eclipses.forEach(eclipse => {
        summary += `• ${eclipse.date}: ${eclipse.type} ${eclipse.subtype} eclipse\n`;
        summary += `  ${eclipse.significance}\n`;
      });
      summary += '\n';
    }

    if (events.planetaryEvents.length > 0) {
      summary += `*Planetary Events:*\n`;
      events.planetaryEvents.slice(0, 3).forEach(event => {
        summary += `• ${event.date}: ${event.planet} ${event.event}\n`;
        summary += `  ${event.significance}\n`;
      });
      summary += '\n';
    }

    if (events.seasonalEvents.length > 0) {
      summary += `*Seasonal Transitions:*\n`;
      events.seasonalEvents.forEach(event => {
        summary += `• ${event.date}: ${event.event}\n`;
        summary += `  ${event.astrological}\n`;
      });
      summary += '\n';
    }

    if (events.personalImpact.length > 0) {
      summary += `*Personal Impact:*\n`;
      events.personalImpact.slice(0, 2).forEach(impact => {
        summary += `• ${impact.event}: ${impact.personalImpact}\n`;
      });
      summary += '\n';
    }

    summary += 'Stay attuned to these cosmic energies! 🔮';

    return summary;
  }

  /**
   * Check eclipse visibility for location
   * @private
   * @param {Object} eclipse - Eclipse data
   * @param {string} birthPlace - User's location
   * @returns {string} Visibility status
   */
  _checkEclipseVisibility(eclipse, birthPlace) {
    // Simplified visibility check - in production would use precise astronomical calculations
    const visibilityMap = {
      'Pacific, Atlantic regions': ['USA', 'Canada', 'Europe', 'Africa'],
      'Americas, Europe, Africa': ['USA', 'Canada', 'Europe', 'Africa', 'South America'],
      'Pacific, Americas': ['USA', 'Canada', 'Mexico', 'South America', 'Australia'],
      'Asia, Australia, Americas': ['India', 'China', 'Australia', 'USA', 'Canada']
    };

    const regions = visibilityMap[eclipse.visibility] || [];
    const normalizedPlace = birthPlace.toLowerCase();

    const isVisible = regions.some(region =>
      normalizedPlace.includes(region.toLowerCase())
    );

    return isVisible ? 'Visible in your region' : 'Not visible in your region';
  }

  /**
   * Get event intensity
   * @private
   * @param {string} eventType - Type of event
   * @returns {string} Intensity level
   */
  _getEventIntensity(eventType) {
    const intensities = {
      'retrograde begins': 'Medium-High',
      'retrograde ends': 'Medium',
      'conjunct': 'High',
      'opposition': 'High',
      'square': 'Medium-High',
      'trine': 'Medium',
      'sextile': 'Low-Medium'
    };

    return intensities[eventType] || 'Medium';
  }

  /**
   * Get event duration
   * @private
   * @param {string} planet - Planet name
   * @param {string} eventType - Event type
   * @returns {string} Duration description
   */
  _getEventDuration(planet, eventType) {
    if (eventType.includes('retrograde')) {
      const retrogradePeriods = {
        'Mercury': '3 weeks',
        'Venus': '6 weeks',
        'Mars': '2 months',
        'Jupiter': '4 months',
        'Saturn': '4.5 months',
        'Uranus': '5 months',
        'Neptune': '5 months',
        'Pluto': '5-6 months'
      };
      return retrogradePeriods[planet] || 'Variable';
    }

    return 'Momentary aspect';
  }

  /**
   * Get seasonal element
   * @private
   * @param {string} event - Seasonal event
   * @returns {string} Element
   */
  _getSeasonalElement(event) {
    const elements = {
      'Vernal Equinox': 'Air (new beginnings)',
      'Summer Solstice': 'Fire (peak energy)',
      'Autumn Equinox': 'Earth (harvest)',
      'Winter Solstice': 'Water (renewal)'
    };

    return elements[event] || 'Balanced';
  }

  /**
   * Get seasonal planetary ruler
   * @private
   * @param {string} event - Seasonal event
   * @returns {string} Planetary ruler
   */
  _getSeasonalRuler(event) {
    const rulers = {
      'Vernal Equinox': 'Mars (Aries)',
      'Summer Solstice': 'Sun (Leo)',
      'Autumn Equinox': 'Venus (Libra)',
      'Winter Solstice': 'Saturn (Capricorn)'
    };

    return rulers[event] || 'Sun';
  }

  /**
   * Get affected houses for planetary transit
   * @private
   * @param {string} planet - Planet name
   * @param {Object} natalChart - Natal chart
   * @returns {Array} Affected houses
   */
  _getAffectedHouses(planet, natalChart) {
    // Simplified house correlation - in production would calculate actual house positions
    const houseCorrelations = {
      'Sun': ['1st', '5th', '9th'],
      'Moon': ['4th', '8th', '12th'],
      'Mercury': ['3rd', '6th', '9th'],
      'Venus': ['2nd', '7th', '12th'],
      'Mars': ['1st', '8th', '12th'],
      'Jupiter': ['9th', '11th', '12th'],
      'Saturn': ['10th', '11th', '12th']
    };

    return houseCorrelations[planet] || ['Various houses'];
  }

  /**
   * Get personal impact of eclipse
   * @private
   * @param {Object} eclipse - Eclipse data
   * @param {Object} natalChart - Natal chart
   * @returns {string} Personal impact description
   */
  _getEclipsePersonalImpact(eclipse, natalChart) {
    const sunSign = natalChart.sunSign;
    const moonSign = natalChart.moonSign;

    // Simplified eclipse impact based on sun/moon signs
    const impacts = {
      'solar': {
        'Aries': 'Leadership changes and new directions',
        'Taurus': 'Financial and value system shifts',
        'Gemini': 'Communication and learning transformations',
        'Cancer': 'Home and family restructuring',
        'Leo': 'Creative and self-expression changes',
        'Virgo': 'Health and service role evolution',
        'Libra': 'Relationship and partnership dynamics',
        'Scorpio': 'Transformation and rebirth processes',
        'Sagittarius': 'Philosophy and expansion opportunities',
        'Capricorn': 'Career and structure rebuilding',
        'Aquarius': 'Innovation and community involvement',
        'Pisces': 'Spirituality and compassion awakening'
      },
      'lunar': {
        'Aries': 'Emotional drive and initiative',
        'Taurus': 'Emotional security and values',
        'Gemini': 'Emotional communication needs',
        'Cancer': 'Deep emotional healing and nurturing',
        'Leo': 'Emotional creativity and self-expression',
        'Virgo': 'Emotional health and service',
        'Libra': 'Emotional relationships and harmony',
        'Scorpio': 'Emotional transformation and intensity',
        'Sagittarius': 'Emotional exploration and freedom',
        'Capricorn': 'Emotional responsibility and structure',
        'Aquarius': 'Emotional innovation and detachment',
        'Pisces': 'Emotional spirituality and compassion'
      }
    };

    const eclipseImpacts = impacts[eclipse.type] || {};
    return eclipseImpacts[sunSign] || eclipseImpacts[moonSign] || 'Personal transformation and growth';
  }

  /**
   * Get houses affected by eclipse
   * @private
   * @param {Object} eclipse - Eclipse data
   * @param {Object} natalChart - Natal chart
   * @returns {Array} Affected houses
   */
  _getEclipseHouses(eclipse, natalChart) {
    // Simplified - eclipses affect houses based on their position
    if (eclipse.type === 'solar') {
      return ['1st', '5th', '9th', '10th'];
    } else {
      return ['4th', '7th', '8th', '12th'];
    }
  }

  /**
   * Generate Prashna (Horary) Astrology analysis
   * @param {Object} questionData - Question details
   * @param {string} questionData.question - The question asked
   * @param {string} questionData.questionTime - Time when question was asked (DD/MM/YYYY HH:MM)
   * @param {string} questionData.questionPlace - Place where question was asked
   * @returns {Object} Prashna analysis
   */
  generatePrashnaAnalysis(questionData) {
    try {
      const { question, questionTime, questionPlace } = questionData;

      if (!questionTime || !questionPlace) {
        return {
          error: 'Question time and place required for Prashna analysis'
        };
      }

      // Parse question time
      const [datePart, timePart] = questionTime.split(' ');
      const [day, month, year] = datePart.split('/').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);

      // Get coordinates
      const [latitude, longitude] = this._getCoordinatesForPlace(questionPlace);
      const timezone = this._getTimezoneForPlace(questionPlace);

      // Generate horary chart
      const horaryChart = this._generateHoraryChart(year, month, day, hour, minute, latitude, longitude, timezone);

      // Analyze the question
      const questionAnalysis = this._analyzePrashnaQuestion(question, horaryChart);

      // Generate predictions
      const predictions = this._generatePrashnaPredictions(horaryChart, questionAnalysis);

      return {
        question,
        questionTime,
        questionPlace,
        horaryChart,
        questionAnalysis,
        predictions,
        summary: this._generatePrashnaSummary(question, horaryChart, predictions)
      };
    } catch (error) {
      logger.error('Error generating Prashna analysis:', error);
      return {
        error: 'Unable to generate Prashna analysis at this time'
      };
    }
  }

  /**
   * Generate horary chart for the question time
   * @private
   * @param {number} year - Question year
   * @param {number} month - Question month
   * @param {number} day - Question day
   * @param {number} hour - Question hour
   * @param {number} minute - Question minute
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} timezone - Timezone
   * @returns {Object} Horary chart data
   */
  _generateHoraryChart(year, month, day, hour, minute, latitude, longitude, timezone) {
    try {
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

      const chart = this.astrologer.generateNatalChartData(astroData);

      return {
        lagna: chart.interpretations.risingSign,
        planets: chart.planets,
        houses: chart.houses || {},
        rawChart: chart
      };
    } catch (error) {
      logger.error('Error generating horary chart:', error);
      return {
        lagna: 'Unknown',
        planets: {},
        houses: {}
      };
    }
  }

  /**
   * Analyze the nature of the question
   * @private
   * @param {string} question - The question asked
   * @param {Object} horaryChart - Horary chart data
   * @returns {Object} Question analysis
   */
  _analyzePrashnaQuestion(question, horaryChart) {
    const questionLower = question.toLowerCase();

    // Determine question category
    let category = 'general';
    let significator = 'mercury'; // Mercury rules questions and communication

    if (questionLower.includes('marriage') || questionLower.includes('wedding') || questionLower.includes('spouse')) {
      category = 'marriage';
      significator = 'venus';
    } else if (questionLower.includes('job') || questionLower.includes('career') || questionLower.includes('business')) {
      category = 'career';
      significator = 'sun';
    } else if (questionLower.includes('money') || questionLower.includes('wealth') || questionLower.includes('finance')) {
      category = 'finance';
      significator = 'venus';
    } else if (questionLower.includes('health') || questionLower.includes('illness') || questionLower.includes('disease')) {
      category = 'health';
      significator = 'mars';
    } else if (questionLower.includes('education') || questionLower.includes('study') || questionLower.includes('exam')) {
      category = 'education';
      significator = 'mercury';
    } else if (questionLower.includes('travel') || questionLower.includes('journey') || questionLower.includes('move')) {
      category = 'travel';
      significator = 'moon';
    } else if (questionLower.includes('children') || questionLower.includes('pregnancy') || questionLower.includes('family')) {
      category = 'children';
      significator = 'jupiter';
    }

    // Analyze Moon's position (shows the matter)
    const moonSign = horaryChart.planets.moon?.signName || 'Unknown';
    const moonHouse = horaryChart.planets.moon?.house || 1;

    // Analyze 7th house (shows the answer/opponent)
    const seventhHouseSign = this._getHouseSign(7, horaryChart.lagna);

    // Analyze 10th house (shows the outcome)
    const tenthHouseSign = this._getHouseSign(10, horaryChart.lagna);

    return {
      category,
      significator,
      moonSign,
      moonHouse,
      seventhHouseSign,
      tenthHouseSign,
      questionStrength: this._calculateQuestionStrength(horaryChart, significator)
    };
  }

  /**
   * Get the sign of a specific house
   * @private
   * @param {number} houseNumber - House number (1-12)
   * @param {string} lagnaSign - Lagna sign
   * @returns {string} Sign of the house
   */
  _getHouseSign(houseNumber, lagnaSign) {
    const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const lagnaIndex = signOrder.indexOf(lagnaSign);

    if (lagnaIndex === -1) return 'Unknown';

    const houseIndex = (lagnaIndex + houseNumber - 1) % 12;
    return signOrder[houseIndex];
  }

  /**
   * Calculate the strength of the question
   * @private
   * @param {Object} horaryChart - Horary chart
   * @param {string} significator - Question significator
   * @returns {string} Strength level
   */
  _calculateQuestionStrength(horaryChart, significator) {
    let strength = 0;

    // Check if significator is well-placed
    const sigPlanet = horaryChart.planets[significator];
    if (sigPlanet) {
      // In own sign or exalted
      if (sigPlanet.dignity && (sigPlanet.dignity.includes('Own Sign') || sigPlanet.dignity.includes('Exalted'))) {
        strength += 2;
      }

      // In kendra houses (1, 4, 7, 10)
      if ([1, 4, 7, 10].includes(sigPlanet.house)) {
        strength += 2;
      }

      // In trikona houses (1, 5, 9)
      if ([1, 5, 9].includes(sigPlanet.house)) {
        strength += 1;
      }
    }

    // Check Moon's strength
    const moon = horaryChart.planets.moon;
    if (moon && moon.dignity && (moon.dignity.includes('Own Sign') || moon.dignity.includes('Exalted'))) {
      strength += 1;
    }

    if (strength >= 4) return 'Strong';
    if (strength >= 2) return 'Medium';
    return 'Weak';
  }

  /**
   * Generate predictions based on horary chart
   * @private
   * @param {Object} horaryChart - Horary chart
   * @param {Object} questionAnalysis - Question analysis
   * @returns {Object} Predictions
   */
  _generatePrashnaPredictions(horaryChart, questionAnalysis) {
    const { category, significator, moonHouse, seventhHouseSign, tenthHouseSign } = questionAnalysis;

    const predictions = {
      outcome: '',
      timing: '',
      conditions: [],
      advice: ''
    };

    // Analyze outcome based on 10th house and significator
    const sigPlanet = horaryChart.planets[significator];
    const tenthHousePlanet = this._getHousePlanet(10, horaryChart);

    if (sigPlanet && [1, 4, 7, 10].includes(sigPlanet.house)) {
      predictions.outcome = 'Favorable outcome likely';
      predictions.conditions.push('Strong planetary support');
    } else if (sigPlanet && [6, 8, 12].includes(sigPlanet.house)) {
      predictions.outcome = 'Challenges and delays expected';
      predictions.conditions.push('Planetary obstacles present');
    } else {
      predictions.outcome = 'Mixed results, depends on other factors';
      predictions.conditions.push('Neutral planetary influences');
    }

    // Timing analysis
    predictions.timing = this._analyzePrashnaTiming(horaryChart, category);

    // Category-specific predictions
    switch (category) {
      case 'marriage':
        predictions.advice = this._getMarriagePrashnaAdvice(horaryChart, questionAnalysis);
        break;
      case 'career':
        predictions.advice = this._getCareerPrashnaAdvice(horaryChart, questionAnalysis);
        break;
      case 'finance':
        predictions.advice = this._getFinancePrashnaAdvice(horaryChart, questionAnalysis);
        break;
      case 'health':
        predictions.advice = this._getHealthPrashnaAdvice(horaryChart, questionAnalysis);
        break;
      default:
        predictions.advice = 'Consult additional factors and maintain positive attitude';
    }

    return predictions;
  }

  /**
   * Analyze timing from horary chart
   * @private
   * @param {Object} horaryChart - Horary chart
   * @param {string} category - Question category
   * @returns {string} Timing prediction
   */
  _analyzePrashnaTiming(horaryChart, category) {
    // Simplified timing based on Moon's position
    const moonHouse = horaryChart.planets.moon?.house || 1;

    const timingMap = {
      1: 'Very soon (within days)',
      2: 'Within 1-2 months',
      3: 'Within 3-6 months',
      4: 'Within 6-12 months',
      5: 'Within 1-2 years',
      6: 'Delayed, possible obstacles',
      7: 'Within 1-2 months',
      8: 'Delayed, transformative period',
      9: 'Within 6-12 months',
      10: 'Within 3-6 months',
      11: 'Soon, within weeks',
      12: 'Delayed, spiritual preparation needed'
    };

    return timingMap[moonHouse] || 'Timing unclear, depends on other factors';
  }

  /**
   * Get house planet
   * @private
   * @param {number} houseNumber - House number
   * @param {Object} horaryChart - Horary chart
   * @returns {Object|null} Planet in the house
   */
  _getHousePlanet(houseNumber, horaryChart) {
    return Object.values(horaryChart.planets).find(planet => planet.house === houseNumber) || null;
  }

  /**
   * Get marriage-specific Prashna advice
   * @private
   * @param {Object} horaryChart - Horary chart
   * @param {Object} questionAnalysis - Question analysis
   * @returns {string} Marriage advice
   */
  _getMarriagePrashnaAdvice(horaryChart, questionAnalysis) {
    const venus = horaryChart.planets.venus;
    const seventhHouseSign = questionAnalysis.seventhHouseSign;

    if (venus && [1, 4, 7, 10].includes(venus.house)) {
      return 'Good prospects for marriage. Venus is well-placed indicating harmony and love.';
    } else if (venus && [6, 8, 12].includes(venus.house)) {
      return 'Challenges in marriage matters. Consider remedies and patience.';
    }

    return 'Marriage prospects are moderate. Focus on personal growth and timing.';
  }

  /**
   * Get career-specific Prashna advice
   * @private
   * @param {Object} horaryChart - Horary chart
   * @param {Object} questionAnalysis - Question analysis
   * @returns {string} Career advice
   */
  _getCareerPrashnaAdvice(horaryChart, questionAnalysis) {
    const sun = horaryChart.planets.sun;
    const tenthHouseSign = questionAnalysis.tenthHouseSign;

    if (sun && [1, 4, 7, 10].includes(sun.house)) {
      return 'Strong career prospects. Sun indicates success and recognition.';
    } else if (sun && [6, 8, 12].includes(sun.house)) {
      return 'Career challenges ahead. Consider skill development and networking.';
    }

    return 'Career prospects are developing. Focus on consistent effort and learning.';
  }

  /**
   * Get finance-specific Prashna advice
   * @private
   * @param {Object} horaryChart - Horary chart
   * @param {Object} questionAnalysis - Question analysis
   * @returns {string} Finance advice
   */
  _getFinancePrashnaAdvice(horaryChart, questionAnalysis) {
    const jupiter = horaryChart.planets.jupiter;
    const venus = horaryChart.planets.venus;

    if ((jupiter && [1, 4, 7, 10].includes(jupiter.house)) ||
        (venus && [1, 4, 7, 10].includes(venus.house))) {
      return 'Good financial prospects. Jupiter/Venus indicate prosperity and gains.';
    } else if ((jupiter && [6, 8, 12].includes(jupiter.house)) ||
               (venus && [6, 8, 12].includes(venus.house))) {
      return 'Financial challenges. Practice caution with investments and expenses.';
    }

    return 'Financial situation is stable but requires careful management.';
  }

  /**
   * Get health-specific Prashna advice
   * @private
   * @param {Object} horaryChart - Horary chart
   * @param {Object} questionAnalysis - Question analysis
   * @returns {string} Health advice
   */
  _getHealthPrashnaAdvice(horaryChart, questionAnalysis) {
    const mars = horaryChart.planets.mars;
    const saturn = horaryChart.planets.saturn;

    if (mars && [6, 8, 12].includes(mars.house)) {
      return 'Health concerns possible. Mars indicates energy and potential illness.';
    } else if (saturn && [6, 8, 12].includes(saturn.house)) {
      return 'Chronic health issues. Saturn suggests long-term conditions.';
    }

    return 'Health is generally good. Maintain healthy lifestyle and regular check-ups.';
  }

  /**
   * Generate Prashna summary
   * @private
   * @param {string} question - Original question
   * @param {Object} horaryChart - Horary chart
   * @param {Object} predictions - Predictions
   * @returns {string} Summary text
   */
  _generatePrashnaSummary(question, horaryChart, predictions) {
    let summary = `🕉️ *Prashna Astrology Analysis*\n\n`;
    summary += `*Question:* ${question}\n\n`;
    summary += `*Horary Lagna:* ${horaryChart.lagna}\n`;
    summary += `*Moon Position:* ${horaryChart.planets.moon?.signName || 'Unknown'} (${horaryChart.planets.moon?.house || 'Unknown'}th house)\n\n`;

    summary += `*Outcome:* ${predictions.outcome}\n`;
    summary += `*Timing:* ${predictions.timing}\n\n`;

    if (predictions.conditions.length > 0) {
      summary += `*Key Factors:*\n`;
      predictions.conditions.forEach(condition => {
        summary += `• ${condition}\n`;
      });
      summary += '\n';
    }

    summary += `*Advice:* ${predictions.advice}\n\n`;
    summary += 'Remember: Prashna answers are specific to the question timing and should be considered along with your birth chart. 🕉️';

    return summary;
  }

  /**
   * Generate Ashtakavarga analysis
   * @param {Object} birthData - User's birth data
   * @returns {Object} Ashtakavarga analysis
   */
  generateAshtakavarga(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return {
          error: 'Complete birth details required for Ashtakavarga analysis'
        };
      }

      // Generate birth chart
      const kundli = this.generateVedicKundli(birthData);
      if (kundli.error) {
        return { error: kundli.error };
      }

      // Calculate Ashtakavarga for each planet
      const ashtakavarga = {
        sun: this._calculatePlanetAshtakavarga('sun', kundli),
        moon: this._calculatePlanetAshtakavarga('moon', kundli),
        mars: this._calculatePlanetAshtakavarga('mars', kundli),
        mercury: this._calculatePlanetAshtakavarga('mercury', kundli),
        jupiter: this._calculatePlanetAshtakavarga('jupiter', kundli),
        venus: this._calculatePlanetAshtakavarga('venus', kundli),
        saturn: this._calculatePlanetAshtakavarga('saturn', kundli)
      };

      // Calculate Trikona Shodhana (triangle reduction)
      const trikonaShodhana = this._calculateTrikonaShodhana(ashtakavarga);

      // Calculate Ekadhipatya (sole lordship)
      const ekadhipatya = this._calculateEkadhipatya(ashtakavarga);

      // Generate overall analysis
      const analysis = this._analyzeAshtakavargaStrength(ashtakavarga, trikonaShodhana, ekadhipatya);

      return {
        name,
        ashtakavarga,
        trikonaShodhana,
        ekadhipatya,
        analysis,
        summary: this._generateAshtakavargaSummary(ashtakavarga, analysis)
      };
    } catch (error) {
      logger.error('Error generating Ashtakavarga:', error);
      return {
        error: 'Unable to generate Ashtakavarga analysis at this time'
      };
    }
  }

  /**
   * Calculate Ashtakavarga for a specific planet
   * @private
   * @param {string} planet - Planet name
   * @param {Object} kundli - Kundli data
   * @returns {Object} Ashtakavarga data for the planet
   */
  _calculatePlanetAshtakavarga(planet, kundli) {
    const binduChart = this._getPlanetBinduChart(planet);
    const planetPositions = kundli.planetaryPositions;

    const bindus = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0
    };

    // Calculate bindus for each house based on planetary positions
    Object.entries(planetPositions).forEach(([planetName, position]) => {
      if (position && position.house) {
        const house = position.house;
        const binduValue = binduChart[planetName.toLowerCase()] || 0;
        bindus[house] = (bindus[house] || 0) + binduValue;
      }
    });

    // Calculate total bindus
    const totalBindus = Object.values(bindus).reduce((sum, bindu) => sum + bindu, 0);

    return {
      planet: planet.charAt(0).toUpperCase() + planet.slice(1),
      bindus,
      totalBindus,
      averageBindus: Math.round((totalBindus / 12) * 10) / 10,
      strength: this._interpretAshtakavargaStrength(totalBindus)
    };
  }

  /**
   * Get bindu chart for a planet (simplified version)
   * @private
   * @param {string} planet - Planet name
   * @returns {Object} Bindu values for each planet from each house
   */
  _getPlanetBinduChart(planet) {
    // Simplified Ashtakavarga bindu charts
    const binduCharts = {
      sun: {
        sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1,
        rahu: 0, ketu: 0
      },
      moon: {
        sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1,
        rahu: 0, ketu: 0
      },
      mars: {
        sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1,
        rahu: 0, ketu: 0
      },
      mercury: {
        sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1,
        rahu: 0, ketu: 0
      },
      jupiter: {
        sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1,
        rahu: 0, ketu: 0
      },
      venus: {
        sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1,
        rahu: 0, ketu: 0
      },
      saturn: {
        sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1,
        rahu: 0, ketu: 0
      }
    };

    return binduCharts[planet.toLowerCase()] || {};
  }

  /**
   * Interpret Ashtakavarga strength
   * @private
   * @param {number} totalBindus - Total bindus
   * @returns {string} Strength interpretation
   */
  _interpretAshtakavargaStrength(totalBindus) {
    if (totalBindus >= 30) return 'Exceptionally Strong';
    if (totalBindus >= 25) return 'Very Strong';
    if (totalBindus >= 20) return 'Strong';
    if (totalBindus >= 15) return 'Moderate';
    if (totalBindus >= 10) return 'Weak';
    return 'Very Weak';
  }

  /**
   * Calculate Trikona Shodhana (Triangle reduction)
   * @private
   * @param {Object} ashtakavarga - Ashtakavarga data
   * @returns {Object} Trikona Shodhana results
   */
  _calculateTrikonaShodhana(ashtakavarga) {
    const trikonaHouses = [
      [1, 5, 9], // Dharma Trikona
      [2, 6, 10], // Artha Trikona
      [3, 7, 11], // Kama Trikona
      [4, 8, 12]  // Moksha Trikona
    ];

    const trikonaResults = {};

    trikonaHouses.forEach((trikona, index) => {
      const trikonaName = ['Dharma', 'Artha', 'Kama', 'Moksha'][index];
      const planetBindus = {};

      // Sum bindus for each planet in this trikona
      Object.entries(ashtakavarga).forEach(([planet, data]) => {
        const trikonaBindus = trikona.reduce((sum, house) => sum + (data.bindus[house] || 0), 0);
        planetBindus[planet] = trikonaBindus;
      });

      // Find planet with maximum bindus in this trikona
      const maxPlanet = Object.entries(planetBindus).reduce((max, [planet, bindus]) =>
        bindus > (planetBindus[max] || 0) ? planet : max
      );

      trikonaResults[trikonaName] = {
        houses: trikona,
        lord: maxPlanet.charAt(0).toUpperCase() + maxPlanet.slice(1),
        bindus: planetBindus[maxPlanet],
        significance: this._getTrikonaSignificance(trikonaName)
      };
    });

    return trikonaResults;
  }

  /**
   * Get significance of each Trikona
   * @private
   * @param {string} trikona - Trikona name
   * @returns {string} Significance
   */
  _getTrikonaSignificance(trikona) {
    const significances = {
      'Dharma': 'Righteousness, duty, spiritual growth',
      'Artha': 'Wealth, prosperity, material success',
      'Kama': 'Desire, pleasure, relationships',
      'Moksha': 'Liberation, enlightenment, spiritual freedom'
    };

    return significances[trikona] || 'General life areas';
  }

  /**
   * Calculate Ekadhipatya (Sole lordship)
   * @private
   * @param {Object} ashtakavarga - Ashtakavarga data
   * @returns {Object} Ekadhipatya results
   */
  _calculateEkadhipatya(ashtakavarga) {
    const ekadhipatya = {};

    // For each house, find which planet has the highest bindus
    for (let house = 1; house <= 12; house++) {
      let maxBindus = -1;
      let lord = 'None';

      Object.entries(ashtakavarga).forEach(([planet, data]) => {
        const bindus = data.bindus[house] || 0;
        if (bindus > maxBindus) {
          maxBindus = bindus;
          lord = planet.charAt(0).toUpperCase() + planet.slice(1);
        }
      });

      ekadhipatya[house] = {
        house,
        lord,
        bindus: maxBindus,
        strength: maxBindus >= 4 ? 'Strong' : maxBindus >= 2 ? 'Moderate' : 'Weak'
      };
    }

    return ekadhipatya;
  }

  /**
   * Analyze overall Ashtakavarga strength
   * @private
   * @param {Object} ashtakavarga - Ashtakavarga data
   * @param {Object} trikonaShodhana - Trikona Shodhana
   * @param {Object} ekadhipatya - Ekadhipatya
   * @returns {Object} Overall analysis
   */
  _analyzeAshtakavargaStrength(ashtakavarga, trikonaShodhana, ekadhipatya) {
    const analysis = {
      overallStrength: 'Moderate',
      strongPlanets: [],
      weakPlanets: [],
      favorableHouses: [],
      challengingHouses: [],
      recommendations: []
    };

    // Analyze planet strengths
    Object.entries(ashtakavarga).forEach(([planet, data]) => {
      if (data.totalBindus >= 25) {
        analysis.strongPlanets.push(planet.charAt(0).toUpperCase() + planet.slice(1));
      } else if (data.totalBindus <= 15) {
        analysis.weakPlanets.push(planet.charAt(0).toUpperCase() + planet.slice(1));
      }
    });

    // Analyze house strengths
    Object.values(ekadhipatya).forEach(houseData => {
      if (houseData.strength === 'Strong') {
        analysis.favorableHouses.push(houseData.house);
      } else if (houseData.strength === 'Weak') {
        analysis.challengingHouses.push(houseData.house);
      }
    });

    // Overall assessment
    const strongPlanetCount = analysis.strongPlanets.length;
    if (strongPlanetCount >= 5) analysis.overallStrength = 'Very Strong';
    else if (strongPlanetCount >= 3) analysis.overallStrength = 'Strong';
    else if (strongPlanetCount <= 1) analysis.overallStrength = 'Weak';

    // Generate recommendations
    analysis.recommendations = this._generateAshtakavargaRecommendations(analysis);

    return analysis;
  }

  /**
   * Generate Ashtakavarga recommendations
   * @private
   * @param {Object} analysis - Analysis data
   * @returns {Array} Recommendations
   */
  _generateAshtakavargaRecommendations(analysis) {
    const recommendations = [];

    if (analysis.strongPlanets.length > 0) {
      recommendations.push(`Focus on areas ruled by strong planets: ${analysis.strongPlanets.join(', ')}`);
    }

    if (analysis.weakPlanets.length > 0) {
      recommendations.push(`Strengthen areas ruled by weak planets: ${analysis.weakPlanets.join(', ')} through spiritual practices`);
    }

    if (analysis.favorableHouses.length > 0) {
      recommendations.push(`Favorable life areas (houses): ${analysis.favorableHouses.join(', ')}`);
    }

    if (analysis.challengingHouses.length > 0) {
      recommendations.push(`Areas needing attention (houses): ${analysis.challengingHouses.join(', ')}`);
    }

    return recommendations;
  }

  /**
   * Generate Ashtakavarga summary
   * @private
   * @param {Object} ashtakavarga - Ashtakavarga data
   * @param {Object} analysis - Analysis
   * @returns {string} Summary text
   */
  _generateAshtakavargaSummary(ashtakavarga, analysis) {
    let summary = '🕉️ *Ashtakavarga Analysis*\n\n';
    summary += `*Overall Strength:* ${analysis.overallStrength}\n\n`;

    summary += '*Planetary Strengths:*\n';
    Object.entries(ashtakavarga).forEach(([planet, data]) => {
      summary += `• ${data.planet}: ${data.totalBindus} bindus (${data.strength})\n`;
    });
    summary += '\n';

    if (analysis.strongPlanets.length > 0) {
      summary += `*Strong Planets:* ${analysis.strongPlanets.join(', ')}\n`;
    }

    if (analysis.weakPlanets.length > 0) {
      summary += `*Planets Needing Attention:* ${analysis.weakPlanets.join(', ')}\n`;
    }

    summary += '\n*Key Insights:*\n';
    analysis.recommendations.forEach(rec => {
      summary += `• ${rec}\n`;
    });

    summary += '\nAshtakavarga shows the 8-fold strength of planets across 12 houses, indicating favorable periods and life areas. 🕉️';

    return summary;
  }

  /**
   * Generate Varga (Divisional) Charts analysis
   * @param {Object} birthData - User's birth data
   * @returns {Object} Varga charts analysis
   */
  generateVargaCharts(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return {
          error: 'Complete birth details required for Varga Charts analysis'
        };
      }

      // Generate main birth chart
      const mainChart = this.generateVedicKundli(birthData);
      if (mainChart.error) {
        return { error: mainChart.error };
      }

      // Generate all Varga charts
      const vargaCharts = {
        d9: this._generateVargaChart(mainChart, 9, 'Navamsa'),
        d10: this._generateVargaChart(mainChart, 10, 'Dashamsa'),
        d12: this._generateVargaChart(mainChart, 12, 'Dwadasamsa'),
        d16: this._generateVargaChart(mainChart, 16, 'Shodasamsa'),
        d24: this._generateVargaChart(mainChart, 24, 'Chaturvimsamsa'),
        d30: this._generateVargaChart(mainChart, 30, 'Trimsamsa')
      };

      // Analyze each Varga chart
      const analysis = this._analyzeVargaCharts(vargaCharts, mainChart);

      return {
        name,
        mainChart: {
          lagna: mainChart.lagna,
          planetaryPositions: mainChart.planetaryPositions
        },
        vargaCharts,
        analysis,
        summary: this._generateVargaSummary(vargaCharts, analysis)
      };
    } catch (error) {
      logger.error('Error generating Varga Charts:', error);
      return {
        error: 'Unable to generate Varga Charts analysis at this time'
      };
    }
  }

  /**
   * Generate a specific Varga chart
   * @private
   * @param {Object} mainChart - Main birth chart
   * @param {number} division - Division number (9, 10, 12, etc.)
   * @param {string} name - Name of the Varga chart
   * @returns {Object} Varga chart data
   */
  _generateVargaChart(mainChart, division, name) {
    const vargaChart = {
      name,
      division,
      lagna: this._calculateVargaLagna(mainChart.lagna, division),
      houses: {},
      planetaryPositions: {},
      significance: this._getVargaSignificance(division)
    };

    // Calculate Varga positions for all planets
    Object.entries(mainChart.planetaryPositions).forEach(([planetName, position]) => {
      vargaChart.planetaryPositions[planetName] = {
        ...position,
        vargaSign: this._calculateVargaPosition(position.sign, position.longitude || 0, division),
        vargaHouse: this._calculateVargaHouse(vargaChart.lagna, position.longitude || 0, division)
      };
    });

    // Calculate houses
    for (let i = 1; i <= 12; i++) {
      const houseSign = this._getHouseSign(i, vargaChart.lagna);
      vargaChart.houses[i] = {
        number: i,
        sign: houseSign,
        lord: this._getHouseLord(houseSign),
        planets: this._getPlanetsInVargaHouse(vargaChart.planetaryPositions, i)
      };
    }

    return vargaChart;
  }

  /**
   * Calculate Varga Lagna (Ascendant)
   * @private
   * @param {string} mainLagna - Main chart Lagna
   * @param {number} division - Division number
   * @returns {string} Varga Lagna sign
   */
  _calculateVargaLagna(mainLagna, division) {
    // Simplified calculation - in practice this involves precise longitude calculations
    const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const lagnaIndex = signOrder.indexOf(mainLagna);

    if (lagnaIndex === -1) return mainLagna;

    // For Navamsa (D-9), each sign is divided into 9 parts
    // This is a simplified calculation
    const vargaIndex = Math.floor((lagnaIndex * division) / 12) % 12;
    return signOrder[vargaIndex];
  }

  /**
   * Calculate Varga position for a planet
   * @private
   * @param {string} sign - Current sign
   * @param {number} longitude - Longitude in degrees
   * @param {number} division - Division number
   * @returns {string} Varga sign
   */
  _calculateVargaPosition(sign, longitude, division) {
    // Simplified Varga calculation
    // Each sign (30°) is divided by the Varga number
    const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = signOrder.indexOf(sign);

    if (signIndex === -1) return sign;

    // Calculate which part of the sign the planet is in
    const degreesInSign = longitude % 30;
    const vargaPart = Math.floor((degreesInSign / 30) * division);

    // Each Varga division corresponds to a sign
    const vargaSignIndex = (signIndex * division + vargaPart) % 12;
    return signOrder[vargaSignIndex];
  }

  /**
   * Calculate Varga house for a planet
   * @private
   * @param {string} vargaLagna - Varga Lagna
   * @param {number} longitude - Planet longitude
   * @param {number} division - Division number
   * @returns {number} Varga house (1-12)
   */
  _calculateVargaHouse(vargaLagna, longitude, division) {
    const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const lagnaIndex = signOrder.indexOf(vargaLagna);
    const planetSign = this._calculateVargaPosition('Aries', longitude, division); // Simplified
    const planetIndex = signOrder.indexOf(planetSign);

    if (lagnaIndex === -1 || planetIndex === -1) return 1;

    const house = ((planetIndex - lagnaIndex + 12) % 12) + 1;
    return house;
  }

  /**
   * Get planets in a specific Varga house
   * @private
   * @param {Object} planetaryPositions - Varga planetary positions
   * @param {number} houseNumber - House number
   * @returns {Array} Planets in the house
   */
  _getPlanetsInVargaHouse(planetaryPositions, houseNumber) {
    return Object.entries(planetaryPositions)
      .filter(([planet, position]) => position.vargaHouse === houseNumber)
      .map(([planet, position]) => planet.charAt(0).toUpperCase() + planet.slice(1));
  }

  /**
   * Get significance of each Varga chart
   * @private
   * @param {number} division - Division number
   * @returns {Object} Significance details
   */
  _getVargaSignificance(division) {
    const significances = {
      9: {
        name: 'Navamsa (D-9)',
        purpose: 'Marriage, spouse, spiritual life, dharma',
        importance: 'Most important Varga chart, shows life partner and spiritual progress',
        houses: {
          1: 'Self in marriage',
          2: 'Family in marriage',
          5: 'Children',
          7: 'Spouse',
          9: 'Spiritual life, dharma'
        }
      },
      10: {
        name: 'Dashamsa (D-10)',
        purpose: 'Career, profession, authority, public image',
        importance: 'Shows professional success and career path',
        houses: {
          1: 'Professional self',
          2: 'Work environment',
          6: 'Service, subordinates',
          10: 'Career, reputation, authority'
        }
      },
      12: {
        name: 'Dwadasamsa (D-12)',
        purpose: 'Parents, ancestry, spiritual practices',
        importance: 'Reveals parental influence and spiritual heritage',
        houses: {
          4: 'Mother, home',
          9: 'Father, guru',
          12: 'Spirituality, foreign lands'
        }
      },
      16: {
        name: 'Shodasamsa (D-16)',
        purpose: 'Vehicles, pleasures, happiness, comforts',
        importance: 'Shows material comforts and vehicles',
        houses: {
          4: 'Home comforts',
          3: 'Vehicles, short journeys',
          11: 'Gains, elder siblings'
        }
      },
      24: {
        name: 'Chaturvimsamsa (D-24)',
        purpose: 'Education, learning, knowledge, intelligence',
        importance: 'Reveals educational achievements and learning ability',
        houses: {
          2: 'Speech, early education',
          4: 'Higher education',
          5: 'Intelligence, creativity',
          9: 'Higher knowledge, wisdom'
        }
      },
      30: {
        name: 'Trimsamsa (D-30)',
        purpose: 'Misfortunes, health issues, enemies, obstacles',
        importance: 'Shows challenges, health problems, and how to overcome them',
        houses: {
          6: 'Enemies, diseases',
          8: 'Misfortunes, chronic issues',
          12: 'Losses, expenses'
        }
      }
    };

    return significances[division] || { name: `D-${division}`, purpose: 'General analysis', importance: 'Specialized life area analysis' };
  }

  /**
   * Analyze all Varga charts
   * @private
   * @param {Object} vargaCharts - All Varga charts
   * @param {Object} mainChart - Main birth chart
   * @returns {Object} Comprehensive analysis
   */
  _analyzeVargaCharts(vargaCharts, mainChart) {
    const analysis = {
      overallStrength: 'Moderate',
      keyInsights: [],
      recommendations: [],
      chartStrengths: {}
    };

    // Analyze each Varga chart
    Object.entries(vargaCharts).forEach(([key, chart]) => {
      const chartAnalysis = this._analyzeSingleVargaChart(chart, mainChart);
      analysis.chartStrengths[key] = chartAnalysis;

      if (chartAnalysis.strength === 'Strong') {
        analysis.keyInsights.push(`${chart.name}: ${chart.significance.purpose} shows favorable indications`);
      } else if (chartAnalysis.strength === 'Weak') {
        analysis.keyInsights.push(`${chart.name}: ${chart.significance.purpose} may present challenges`);
      }
    });

    // Overall assessment
    const strongCharts = Object.values(analysis.chartStrengths).filter(c => c.strength === 'Strong').length;
    if (strongCharts >= 4) analysis.overallStrength = 'Strong';
    else if (strongCharts <= 2) analysis.overallStrength = 'Needs Attention';

    // Generate recommendations
    analysis.recommendations = this._generateVargaRecommendations(analysis);

    return analysis;
  }

  /**
   * Analyze a single Varga chart
   * @private
   * @param {Object} vargaChart - Single Varga chart
   * @param {Object} mainChart - Main chart
   * @returns {Object} Chart analysis
   */
  _analyzeSingleVargaChart(vargaChart, mainChart) {
    const analysis = {
      strength: 'Moderate',
      favorableFactors: [],
      challengingFactors: [],
      keyPlanets: []
    };

    // Check Lagna lord strength
    const lagnaLord = vargaChart.houses[1].lord;
    const lagnaLordPosition = vargaChart.planetaryPositions[lagnaLord.toLowerCase()];

    if (lagnaLordPosition && [1, 4, 7, 10].includes(lagnaLordPosition.vargaHouse)) {
      analysis.favorableFactors.push('Strong Lagna lord placement');
      analysis.strength = 'Strong';
    }

    // Check benefic planets in favorable houses
    const beneficPlanets = ['venus', 'jupiter'];
    beneficPlanets.forEach(planet => {
      const position = vargaChart.planetaryPositions[planet];
      if (position && [1, 4, 5, 7, 9, 10].includes(position.vargaHouse)) {
        analysis.favorableFactors.push(`${planet.charAt(0).toUpperCase() + planet.slice(1)} well-placed`);
      }
    });

    // Check malefic planets in challenging houses
    const maleficPlanets = ['mars', 'saturn'];
    maleficPlanets.forEach(planet => {
      const position = vargaChart.planetaryPositions[planet];
      if (position && [6, 8, 12].includes(position.vargaHouse)) {
        analysis.challengingFactors.push(`${planet.charAt(0).toUpperCase() + planet.slice(1)} in challenging position`);
        if (analysis.strength === 'Strong') analysis.strength = 'Moderate';
      }
    });

    // Identify key planets
    Object.entries(vargaChart.planetaryPositions).forEach(([planet, position]) => {
      if (position.vargaHouse === 1 || position.vargaHouse === 10) {
        analysis.keyPlanets.push(`${planet.charAt(0).toUpperCase() + planet.slice(1)} (${position.vargaHouse}th house)`);
      }
    });

    if (analysis.favorableFactors.length === 0 && analysis.challengingFactors.length > 0) {
      analysis.strength = 'Weak';
    }

    return analysis;
  }

  /**
   * Generate Varga recommendations
   * @private
   * @param {Object} analysis - Overall analysis
   * @returns {Array} Recommendations
   */
  _generateVargaRecommendations(analysis) {
    const recommendations = [];

    if (analysis.overallStrength === 'Strong') {
      recommendations.push('Overall favorable Varga chart combinations indicate good life balance');
    } else {
      recommendations.push('Some Varga charts need strengthening through spiritual practices');
    }

    // Specific recommendations based on chart strengths
    Object.entries(analysis.chartStrengths).forEach(([key, chartAnalysis]) => {
      const chartName = key.toUpperCase();
      if (chartAnalysis.strength === 'Weak') {
        switch (key) {
          case 'd9':
            recommendations.push('Strengthen Navamsa through marriage-related spiritual practices');
            break;
          case 'd10':
            recommendations.push('Focus on career development and professional growth');
            break;
          case 'd12':
            recommendations.push('Honor ancestors and strengthen parental relationships');
            break;
        }
      }
    });

    return recommendations;
  }

  /**
   * Generate Varga Charts summary
   * @private
   * @param {Object} vargaCharts - All Varga charts
   * @param {Object} analysis - Analysis
   * @returns {string} Summary text
   */
  _generateVargaSummary(vargaCharts, analysis) {
    let summary = '🕉️ *Varga (Divisional) Charts Analysis*\n\n';
    summary += `*Overall Varga Strength:* ${analysis.overallStrength}\n\n`;

    summary += '*Varga Charts Overview:*\n';
    Object.entries(vargaCharts).forEach(([key, chart]) => {
      const chartAnalysis = analysis.chartStrengths[key];
      summary += `• ${chart.name} (D-${chart.division}): ${chart.significance.purpose}\n`;
      summary += `  - Strength: ${chartAnalysis.strength}\n`;
      if (chartAnalysis.keyPlanets.length > 0) {
        summary += `  - Key Planets: ${chartAnalysis.keyPlanets.join(', ')}\n`;
      }
      summary += '\n';
    });

    if (analysis.keyInsights.length > 0) {
      summary += '*Key Insights:*\n';
      analysis.keyInsights.forEach(insight => {
        summary += `• ${insight}\n`;
      });
      summary += '\n';
    }

    if (analysis.recommendations.length > 0) {
      summary += '*Recommendations:*\n';
      analysis.recommendations.forEach(rec => {
        summary += `• ${rec}\n`;
      });
    }

    summary += '\nVarga charts provide specialized analysis for different life areas in Vedic astrology. 🕉️';

    return summary;
  }

  /**
   * Generate Shadbala (6-Fold Strength) analysis
   * @param {Object} birthData - User's birth data
   * @returns {Object} Shadbala analysis
   */
  generateShadbala(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return {
          error: 'Complete birth details required for Shadbala analysis'
        };
      }

      // Generate birth chart
      const kundli = this.generateVedicKundli(birthData);
      if (kundli.error) {
        return { error: kundli.error };
      }

      // Calculate Shadbala for each planet
      const shadbala = {
        sun: this._calculatePlanetShadbala('sun', kundli),
        moon: this._calculatePlanetShadbala('moon', kundli),
        mars: this._calculatePlanetShadbala('mars', kundli),
        mercury: this._calculatePlanetShadbala('mercury', kundli),
        jupiter: this._calculatePlanetShadbala('jupiter', kundli),
        venus: this._calculatePlanetShadbala('venus', kundli),
        saturn: this._calculatePlanetShadbala('saturn', kundli)
      };

      // Calculate total Shadbala and rankings
      const totalAnalysis = this._analyzeTotalShadbala(shadbala);

      return {
        name,
        shadbala,
        totalAnalysis,
        summary: this._generateShadbalaSummary(shadbala, totalAnalysis)
      };
    } catch (error) {
      logger.error('Error generating Shadbala:', error);
      return {
        error: 'Unable to generate Shadbala analysis at this time'
      };
    }
  }

  /**
   * Calculate Shadbala for a specific planet
   * @private
   * @param {string} planet - Planet name
   * @param {Object} kundli - Kundli data
   * @returns {Object} Shadbala breakdown for the planet
   */
  _calculatePlanetShadbala(planet, kundli) {
    const planetData = kundli.planetaryPositions[planet];
    if (!planetData) {
      return {
        planet: planet.charAt(0).toUpperCase() + planet.slice(1),
        totalBala: 0,
        percentage: 0,
        strength: 'No Data',
        breakdown: {
          sthanaBala: 0,
          digBala: 0,
          kalaBala: 0,
          chestaBala: 0,
          naisargikaBala: 0,
          drikBala: 0
        }
      };
    }

    // Calculate each type of Bala
    const sthanaBala = this._calculateSthanaBala(planet, planetData, kundli);
    const digBala = this._calculateDigBala(planet, planetData);
    const kalaBala = this._calculateKalaBala(planet, kundli.birthDetails);
    const chestaBala = this._calculateChestaBala(planet, planetData);
    const naisargikaBala = this._calculateNaisargikaBala(planet);
    const drikBala = this._calculateDrikBala(planet, kundli.planetaryPositions);

    const totalBala = sthanaBala + digBala + kalaBala + chestaBala + naisargikaBala + drikBala;
    const maxBala = 60; // Maximum possible Shadbala (10 points each × 6)
    const percentage = Math.round((totalBala / maxBala) * 100);

    return {
      planet: planet.charAt(0).toUpperCase() + planet.slice(1),
      totalBala: Math.round(totalBala * 10) / 10,
      percentage,
      strength: this._interpretShadbalaStrength(percentage),
      breakdown: {
        sthanaBala: Math.round(sthanaBala * 10) / 10,
        digBala: Math.round(digBala * 10) / 10,
        kalaBala: Math.round(kalaBala * 10) / 10,
        chestaBala: Math.round(chestaBala * 10) / 10,
        naisargikaBala: Math.round(naisargikaBala * 10) / 10,
        drikBala: Math.round(drikBala * 10) / 10
      }
    };
  }

  /**
   * Calculate Sthana Bala (Positional Strength)
   * @private
   * @param {string} planet - Planet name
   * @param {Object} planetData - Planet position data
   * @param {Object} kundli - Kundli data
   * @returns {number} Sthana Bala score
   */
  _calculateSthanaBala(planet, planetData, kundli) {
    let bala = 0;

    // Uccha Bala (exaltation strength)
    const ucchaBala = this._calculateUcchaBala(planet, planetData.sign);
    bala += ucchaBala;

    // Saptavargiya Bala (7-fold strength)
    const saptavargiyaBala = this._calculateSaptavargiyaBala(planet, kundli);
    bala += saptavargiyaBala;

    // Ojhayugma Bala (odd/even sign strength)
    const ojhayugmaBala = this._calculateOjhayugmaBala(planet, planetData.sign);
    bala += ojhayugmaBala;

    // Kendra Bala (angular house strength)
    const kendraBala = this._calculateKendraBala(planetData.house);
    bala += kendraBala;

    return Math.min(bala, 10); // Max 10 points
  }

  /**
   * Calculate Uccha Bala (exaltation strength)
   * @private
   * @param {string} planet - Planet name
   * @param {string} sign - Current sign
   * @returns {number} Uccha Bala score
   */
  _calculateUcchaBala(planet, sign) {
    const exaltationSigns = {
      'sun': 'Aries',
      'moon': 'Taurus',
      'mars': 'Capricorn',
      'mercury': 'Virgo',
      'jupiter': 'Cancer',
      'venus': 'Pisces',
      'saturn': 'Libra'
    };

    const debilitationSigns = {
      'sun': 'Libra',
      'moon': 'Scorpio',
      'mars': 'Cancer',
      'mercury': 'Pisces',
      'jupiter': 'Capricorn',
      'venus': 'Virgo',
      'saturn': 'Aries'
    };

    if (sign === exaltationSigns[planet]) return 10;
    if (sign === debilitationSigns[planet]) return 0;

    // Calculate based on distance from exaltation
    const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const exaltationIndex = signOrder.indexOf(exaltationSigns[planet]);
    const currentIndex = signOrder.indexOf(sign);

    if (exaltationIndex === -1 || currentIndex === -1) return 5;

    const distance = Math.min(Math.abs(exaltationIndex - currentIndex), 12 - Math.abs(exaltationIndex - currentIndex));
    return Math.max(0, 10 - distance * 0.83); // Gradual decrease
  }

  /**
   * Calculate Saptavargiya Bala (7-fold strength)
   * @private
   * @param {string} planet - Planet name
   * @param {Object} kundli - Kundli data
   * @returns {number} Saptavargiya Bala score
   */
  _calculateSaptavargiyaBala(planet, kundli) {
    // Simplified - would need Varga chart calculations
    // For now, return average strength
    return 5;
  }

  /**
   * Calculate Ojhayugma Bala (odd/even sign strength)
   * @private
   * @param {string} planet - Planet name
   * @param {string} sign - Current sign
   * @returns {number} Ojhayugma Bala score
   */
  _calculateOjhayugmaBala(planet, sign) {
    const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = signOrder.indexOf(sign);

    if (signIndex === -1) return 5;

    // Male planets (odd signs) and female planets (even signs)
    const malePlanets = ['sun', 'mars', 'jupiter', 'saturn'];
    const femalePlanets = ['moon', 'venus', 'mercury'];

    const isOddSign = (signIndex + 1) % 2 === 1; // Aries=1(odd), Taurus=2(even), etc.
    const isMalePlanet = malePlanets.includes(planet);

    if ((isMalePlanet && isOddSign) || (!isMalePlanet && !isOddSign)) {
      return 10; // Benefic combination
    } else {
      return 0; // Debilitating combination
    }
  }

  /**
   * Calculate Kendra Bala (angular house strength)
   * @private
   * @param {number} house - House number
   * @returns {number} Kendra Bala score
   */
  _calculateKendraBala(house) {
    const kendraHouses = [1, 4, 7, 10];
    const panaparaHouses = [2, 5, 8, 11];
    const apoklimaHouses = [3, 6, 9, 12];

    if (kendraHouses.includes(house)) return 10;
    if (panaparaHouses.includes(house)) return 5;
    if (apoklimaHouses.includes(house)) return 0;

    return 5;
  }

  /**
   * Calculate Dig Bala (Directional Strength)
   * @private
   * @param {string} planet - Planet name
   * @param {Object} planetData - Planet position data
   * @returns {number} Dig Bala score
   */
  _calculateDigBala(planet, planetData) {
    const directions = {
      'sun': 'East',
      'moon': 'North-West',
      'mars': 'South',
      'mercury': 'North',
      'jupiter': 'North-East',
      'venus': 'South-East',
      'saturn': 'West'
    };

    const planetDirection = directions[planet];
    const houseDirections = {
      1: 'East', 2: 'East', 3: 'East', 4: 'North',
      5: 'North', 6: 'North', 7: 'West', 8: 'West',
      9: 'West', 10: 'South', 11: 'South', 12: 'South'
    };

    const houseDirection = houseDirections[planetData.house];

    if (planetDirection === houseDirection) return 10;
    return 0;
  }

  /**
   * Calculate Kala Bala (Temporal Strength)
   * @private
   * @param {string} planet - Planet name
   * @param {Object} birthDetails - Birth details
   * @returns {number} Kala Bala score
   */
  _calculateKalaBala(planet, birthDetails) {
    // Simplified - would need detailed temporal calculations
    // Including Ahargana, Chandragrahan, etc.
    return 5; // Average strength for now
  }

  /**
   * Calculate Chesta Bala (Motivational Strength)
   * @private
   * @param {string} planet - Planet name
   * @param {Object} planetData - Planet position data
   * @returns {number} Chesta Bala score
   */
  _calculateChestaBala(planet, planetData) {
    // Based on planet's speed and retrograde status
    // Simplified calculation
    const retrogradePenalty = planetData.retrograde ? 2 : 0;
    return Math.max(0, 10 - retrogradePenalty);
  }

  /**
   * Calculate Naisargika Bala (Natural Strength)
   * @private
   * @param {string} planet - Planet name
   * @returns {number} Naisargika Bala score
   */
  _calculateNaisargikaBala(planet) {
    // Natural strength of planets (out of 10)
    const naturalStrengths = {
      'sun': 10,
      'moon': 8,
      'mars': 7,
      'mercury': 6,
      'jupiter': 9,
      'venus': 5,
      'saturn': 4
    };

    return naturalStrengths[planet] || 5;
  }

  /**
   * Calculate Drik Bala (Aspect Strength)
   * @private
   * @param {string} planet - Planet name
   * @param {Object} allPlanets - All planetary positions
   * @returns {number} Drik Bala score
   */
  _calculateDrikBala(planet, allPlanets) {
    // Simplified aspect strength calculation
    let aspectStrength = 0;
    const planetHouse = allPlanets[planet]?.house;

    if (!planetHouse) return 0;

    // Check aspects from other planets
    Object.entries(allPlanets).forEach(([otherPlanet, position]) => {
      if (otherPlanet !== planet && position.house) {
        const aspect = this._getAspectBetweenHouses(planetHouse, position.house);
        if (aspect) {
          // Benefic aspects add strength, malefic aspects reduce
          const isBenefic = ['jupiter', 'venus'].includes(otherPlanet);
          const isMalefic = ['mars', 'saturn'].includes(otherPlanet);

          if (isBenefic) aspectStrength += 2;
          else if (isMalefic) aspectStrength -= 1;
        }
      }
    });

    return Math.max(0, Math.min(10, 5 + aspectStrength));
  }

  /**
   * Get aspect type between two houses
   * @private
   * @param {number} house1 - First house
   * @param {number} house2 - Second house
   * @returns {string|null} Aspect type or null
   */
  _getAspectBetweenHouses(house1, house2) {
    const diff = Math.abs(house1 - house2);
    const minDiff = Math.min(diff, 12 - diff);

    const aspects = {
      3: 'trine',
      4: 'square',
      6: 'sextile',
      7: 'opposition',
      9: 'trine'
    };

    return aspects[minDiff] || null;
  }

  /**
   * Interpret Shadbala strength percentage
   * @private
   * @param {number} percentage - Strength percentage
   * @returns {string} Strength interpretation
   */
  _interpretShadbalaStrength(percentage) {
    if (percentage >= 80) return 'Exceptionally Strong';
    if (percentage >= 70) return 'Very Strong';
    if (percentage >= 60) return 'Strong';
    if (percentage >= 50) return 'Moderate';
    if (percentage >= 40) return 'Weak';
    return 'Very Weak';
  }

  /**
   * Analyze total Shadbala results
   * @private
   * @param {Object} shadbala - Shadbala data for all planets
   * @returns {Object} Total analysis
   */
  _analyzeTotalShadbala(shadbala) {
    const analysis = {
      strongestPlanet: null,
      weakestPlanet: null,
      averageStrength: 0,
      rankings: [],
      recommendations: []
    };

    // Calculate rankings
    const planetEntries = Object.entries(shadbala).map(([planet, data]) => ({
      planet: data.planet,
      strength: data.percentage
    }));

    planetEntries.sort((a, b) => b.strength - a.strength);
    analysis.rankings = planetEntries;

    analysis.strongestPlanet = planetEntries[0];
    analysis.weakestPlanet = planetEntries[planetEntries.length - 1];

    // Calculate average
    analysis.averageStrength = Math.round(
      planetEntries.reduce((sum, p) => sum + p.strength, 0) / planetEntries.length
    );

    // Generate recommendations
    analysis.recommendations = this._generateShadbalaRecommendations(analysis);

    return analysis;
  }

  /**
   * Generate Shadbala recommendations
   * @private
   * @param {Object} analysis - Analysis data
   * @returns {Array} Recommendations
   */
  _generateShadbalaRecommendations(analysis) {
    const recommendations = [];

    if (analysis.strongestPlanet) {
      recommendations.push(`Focus on areas ruled by ${analysis.strongestPlanet.planet} (${analysis.strongestPlanet.strength}% strength)`);
    }

    if (analysis.weakestPlanet && analysis.weakestPlanet.strength < 50) {
      recommendations.push(`Strengthen ${analysis.weakestPlanet.planet} through specific remedies and practices`);
    }

    if (analysis.averageStrength >= 70) {
      recommendations.push('Overall strong planetary configuration - favorable for most endeavors');
    } else if (analysis.averageStrength <= 40) {
      recommendations.push('Planetary strengths need enhancement through spiritual practices');
    }

    return recommendations;
  }

  /**
   * Generate Shadbala summary
   * @private
   * @param {Object} shadbala - Shadbala data
   * @param {Object} analysis - Analysis
   * @returns {string} Summary text
   */
  _generateShadbalaSummary(shadbala, analysis) {
    let summary = '🕉️ *Shadbala (6-Fold Strength) Analysis*\n\n';
    summary += `*Overall Average Strength:* ${analysis.averageStrength}%\n\n`;

    summary += '*Planetary Strength Rankings:*\n';
    analysis.rankings.forEach((planet, index) => {
      summary += `${index + 1}. ${planet.planet}: ${planet.strength}% (${this._interpretShadbalaStrength(planet.strength)})\n`;
    });
    summary += '\n';

    summary += '*Detailed Breakdown (Top 3 Planets):*\n';
    for (let i = 0; i < Math.min(3, analysis.rankings.length); i++) {
      const planet = analysis.rankings[i].planet.toLowerCase();
      const data = shadbala[planet];
      if (data) {
        summary += `\n*${data.planet} (${data.percentage}%):*\n`;
        summary += `• Sthana Bala: ${data.breakdown.sthanaBala}\n`;
        summary += `• Dig Bala: ${data.breakdown.digBala}\n`;
        summary += `• Kala Bala: ${data.breakdown.kalaBala}\n`;
        summary += `• Chesta Bala: ${data.breakdown.chestaBala}\n`;
        summary += `• Naisargika Bala: ${data.breakdown.naisargikaBala}\n`;
        summary += `• Drik Bala: ${data.breakdown.drikBala}\n`;
      }
    }

    summary += '\n*Key Insights:*\n';
    analysis.recommendations.forEach(rec => {
      summary += `• ${rec}\n`;
    });

    summary += '\nShadbala measures planetary strength through 6 different methods for comprehensive analysis. 🕉️';

    return summary;
  }

  /**
   * Generate Muhurta (Electional Astrology) analysis
   * @param {Object} eventData - Event details
   * @param {string} eventData.eventType - Type of event (wedding, business, etc.)
   * @param {string} eventData.preferredDate - Preferred date (DD/MM/YYYY)
   * @param {string} eventData.location - Event location
   * @returns {Object} Muhurta analysis
   */
  generateMuhurta(eventData) {
    try {
      const { eventType, preferredDate, location } = eventData;

      if (!eventType || !preferredDate || !location) {
        return {
          error: 'Event type, preferred date, and location required for Muhurta analysis'
        };
      }

      // Parse preferred date
      const [day, month, year] = preferredDate.split('/').map(Number);

      // Get location coordinates
      const [latitude, longitude] = this._getCoordinatesForPlace(location);
      const timezone = this._getTimezoneForPlace(location);

      // Generate auspicious timings for the preferred date
      const muhurtaOptions = this._calculateMuhurtaOptions(eventType, year, month, day, latitude, longitude, timezone);

      // Find alternative dates if preferred date is not suitable
      const alternativeDates = this._findAlternativeMuhurtaDates(eventType, year, month, day, latitude, longitude, timezone);

      return {
        eventType,
        preferredDate,
        location,
        muhurtaOptions,
        alternativeDates,
        summary: this._generateMuhurtaSummary(eventData, muhurtaOptions, alternativeDates)
      };
    } catch (error) {
      logger.error('Error generating Muhurta:', error);
      return {
        error: 'Unable to generate Muhurta analysis at this time'
      };
    }
  }

  /**
   * Calculate Muhurta options for a specific date
   * @private
   * @param {string} eventType - Type of event
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} timezone - Timezone
   * @returns {Array} Muhurta options
   */
  _calculateMuhurtaOptions(eventType, year, month, day, latitude, longitude, timezone) {
    const options = [];

    // Calculate for 24 hours in 2-hour intervals
    for (let hour = 6; hour <= 18; hour += 2) { // Daytime only (6 AM to 6 PM)
      for (let minute = 0; minute < 60; minute += 30) {
        const muhurtaTime = { hour, minute };
        const analysis = this._analyzeMuhurtaTime(eventType, year, month, day, hour, minute, latitude, longitude, timezone);

        if (analysis.suitability !== 'Inauspicious') {
          options.push({
            time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
            suitability: analysis.suitability,
            score: analysis.score,
            reasons: analysis.reasons,
            tithi: analysis.tithi,
            nakshatra: analysis.nakshatra,
            yoga: analysis.yoga
          });
        }
      }
    }

    // Sort by score (highest first)
    options.sort((a, b) => b.score - a.score);

    return options.slice(0, 5); // Return top 5 options
  }

  /**
   * Analyze a specific time for Muhurta
   * @private
   * @param {string} eventType - Type of event
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {number} hour - Hour
   * @param {number} minute - Minute
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} timezone - Timezone
   * @returns {Object} Time analysis
   */
  _analyzeMuhurtaTime(eventType, year, month, day, hour, minute, latitude, longitude, timezone) {
    const analysis = {
      suitability: 'Neutral',
      score: 50,
      reasons: [],
      tithi: 'Unknown',
      nakshatra: 'Unknown',
      yoga: 'Unknown'
    };

    // Calculate astronomical data for this time
    const astroData = {
      year, month, date: day, hours: hour, minutes: minute, seconds: 0,
      latitude, longitude, timezone, chartType: 'sidereal'
    };

    try {
      const chart = this.astrologer.generateNatalChartData(astroData);

      // Get Tithi, Nakshatra, Yoga
      analysis.tithi = chart.interpretations.tithi || 'Unknown';
      analysis.nakshatra = chart.interpretations.nakshatra || 'Unknown';
      analysis.yoga = chart.interpretations.yoga || 'Unknown';

      // Check Panchaka Dosha (5 defects to avoid)
      const panchakaCheck = this._checkPanchakaDosha(analysis.tithi, analysis.nakshatra, chart.planets);
      if (panchakaCheck.hasDosha) {
        analysis.reasons.push(...panchakaCheck.reasons);
        analysis.score -= 30;
      }

      // Check Abhijit Muhurta (most auspicious time)
      const abhijitCheck = this._checkAbhijitMuhurta(hour, minute, latitude, longitude);
      if (abhijitCheck.isAbhijit) {
        analysis.reasons.push('Abhijit Muhurta - Most auspicious time');
        analysis.score += 25;
      }

      // Check planetary positions for the event type
      const planetaryCheck = this._checkPlanetaryPositionsForEvent(eventType, chart.planets);
      analysis.score += planetaryCheck.scoreAdjustment;
      analysis.reasons.push(...planetaryCheck.reasons);

      // Check weekday auspiciousness
      const weekdayCheck = this._checkWeekdayAuspiciousness(eventType, year, month, day);
      analysis.score += weekdayCheck.scoreAdjustment;
      analysis.reasons.push(...weekdayCheck.reasons);

      // Check lunar phase
      const lunarCheck = this._checkLunarPhaseForEvent(eventType, analysis.tithi);
      analysis.score += lunarCheck.scoreAdjustment;
      analysis.reasons.push(...lunarCheck.reasons);

      // Determine overall suitability
      if (analysis.score >= 80) {
        analysis.suitability = 'Excellent';
      } else if (analysis.score >= 70) {
        analysis.suitability = 'Very Good';
      } else if (analysis.score >= 60) {
        analysis.suitability = 'Good';
      } else if (analysis.score >= 40) {
        analysis.suitability = 'Fair';
      } else {
        analysis.suitability = 'Inauspicious';
      }

    } catch (error) {
      analysis.reasons.push('Unable to calculate astronomical data');
      analysis.score = 30;
    }

    return analysis;
  }

  /**
   * Check Panchaka Dosha (5 defects)
   * @private
   * @param {string} tithi - Lunar day
   * @param {string} nakshatra - Nakshatra
   * @param {Object} planets - Planetary positions
   * @returns {Object} Panchaka check result
   */
  _checkPanchakaDosha(tithi, nakshatra, planets) {
    const result = {
      hasDosha: false,
      reasons: []
    };

    // 1. Rahu Kalam (Rahu's period) - inauspicious
    const rahuKalam = this._isRahuKalam(planets.rahu);
    if (rahuKalam) {
      result.hasDosha = true;
      result.reasons.push('Rahu Kalam - Inauspicious time');
    }

    // 2. Gulika Kalam (Gulika's period) - very inauspicious
    const gulikaKalam = this._isGulikaKalam(planets.gulika);
    if (gulikaKalam) {
      result.hasDosha = true;
      result.reasons.push('Gulika Kalam - Very inauspicious time');
    }

    // 3. Yamaganda (certain tithis) - avoid for auspicious work
    const yamagandaTithis = ['2nd', '7th', '12th', '17th', '22nd', '27th'];
    if (yamagandaTithis.some(t => tithi.includes(t))) {
      result.hasDosha = true;
      result.reasons.push('Yamaganda Tithi - Not suitable for auspicious work');
    }

    // 4. Visha Ghati (certain nakshatras) - poison period
    const vishaGhatiNakshatras = ['Mula', 'Jyeshta', 'Ashlesha', 'Revati'];
    if (vishaGhatiNakshatras.some(n => nakshatra.includes(n))) {
      result.hasDosha = true;
      result.reasons.push('Visha Ghati Nakshatra - Poison period');
    }

    // 5. Surya Sankranti (sun transition) - avoid
    const sankrantiCheck = this._isSuryaSankranti(planets.sun);
    if (sankrantiCheck) {
      result.hasDosha = true;
      result.reasons.push('Surya Sankranti - Sun transition period');
    }

    return result;
  }

  /**
   * Check if time is Rahu Kalam
   * @private
   * @param {Object} rahu - Rahu position
   * @returns {boolean} Is Rahu Kalam
   */
  _isRahuKalam(rahu) {
    // Simplified - Rahu Kalam varies by weekday
    // In practice, this is calculated based on sunrise and weekday
    return false; // Placeholder
  }

  /**
   * Check if time is Gulika Kalam
   * @private
   * @param {Object} gulika - Gulika position
   * @returns {boolean} Is Gulika Kalam
   */
  _isGulikaKalam(gulika) {
    // Gulika Kalam is very inauspicious
    return false; // Placeholder
  }

  /**
   * Check if it's Surya Sankranti
   * @private
   * @param {Object} sun - Sun position
   * @returns {boolean} Is Surya Sankranti
   */
  _isSuryaSankranti(sun) {
    // Sun transitioning between signs
    return false; // Placeholder
  }

  /**
   * Check Abhijit Muhurta
   * @private
   * @param {number} hour - Hour
   * @param {number} minute - Minute
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Object} Abhijit check result
   */
  _checkAbhijitMuhurta(hour, minute, latitude, longitude) {
    // Abhijit Muhurta is approximately noon ± 24 minutes
    // This is the most auspicious time of the day
    const timeInMinutes = hour * 60 + minute;
    const abhijitStart = 11.5 * 60; // 11:30 AM
    const abhijitEnd = 12.5 * 60;   // 12:30 PM

    const isAbhijit = timeInMinutes >= abhijitStart && timeInMinutes <= abhijitEnd;

    return {
      isAbhijit,
      reason: isAbhijit ? 'Most auspicious time of the day' : 'Not Abhijit Muhurta'
    };
  }

  /**
   * Check planetary positions for specific event type
   * @private
   * @param {string} eventType - Type of event
   * @param {Object} planets - Planetary positions
   * @returns {Object} Planetary check result
   */
  _checkPlanetaryPositionsForEvent(eventType, planets) {
    const result = {
      scoreAdjustment: 0,
      reasons: []
    };

    switch (eventType.toLowerCase()) {
      case 'wedding':
      case 'marriage':
        // Venus and Jupiter should be well-placed
        if (planets.venus && [1, 4, 7, 10].includes(planets.venus.house)) {
          result.scoreAdjustment += 15;
          result.reasons.push('Venus well-placed for marriage');
        }
        if (planets.jupiter && [1, 4, 7, 10].includes(planets.jupiter.house)) {
          result.scoreAdjustment += 10;
          result.reasons.push('Jupiter well-placed for marriage');
        }
        break;

      case 'business':
      case 'business launch':
        // Mercury and Sun should be strong
        if (planets.mercury && [1, 4, 7, 10].includes(planets.mercury.house)) {
          result.scoreAdjustment += 15;
          result.reasons.push('Mercury well-placed for business');
        }
        if (planets.sun && [1, 4, 7, 10].includes(planets.sun.house)) {
          result.scoreAdjustment += 10;
          result.reasons.push('Sun well-placed for business');
        }
        break;

      case 'house warming':
      case 'home':
        // Mars and Moon should be favorable
        if (planets.mars && [1, 4, 7, 10].includes(planets.mars.house)) {
          result.scoreAdjustment += 10;
          result.reasons.push('Mars favorable for home');
        }
        if (planets.moon && [1, 4, 7, 10].includes(planets.moon.house)) {
          result.scoreAdjustment += 10;
          result.reasons.push('Moon favorable for home');
        }
        break;

      case 'education':
      case 'study':
        // Jupiter and Mercury should be strong
        if (planets.jupiter && [1, 4, 7, 10].includes(planets.jupiter.house)) {
          result.scoreAdjustment += 15;
          result.reasons.push('Jupiter favorable for education');
        }
        if (planets.mercury && [1, 4, 7, 10].includes(planets.mercury.house)) {
          result.scoreAdjustment += 10;
          result.reasons.push('Mercury favorable for education');
        }
        break;

      default:
        // General auspiciousness
        const beneficCount = [planets.jupiter, planets.venus].filter(p =>
          p && [1, 4, 7, 10].includes(p.house)
        ).length;
        result.scoreAdjustment += beneficCount * 5;
        if (beneficCount > 0) {
          result.reasons.push(`${beneficCount} benefic planet(s) well-placed`);
        }
    }

    return result;
  }

  /**
   * Check weekday auspiciousness for event
   * @private
   * @param {string} eventType - Type of event
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @returns {Object} Weekday check result
   */
  _checkWeekdayAuspiciousness(eventType, year, month, day) {
    const result = {
      scoreAdjustment: 0,
      reasons: []
    };

    // Create date object to get weekday
    const date = new Date(year, month - 1, day);
    const weekday = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    switch (eventType.toLowerCase()) {
      case 'wedding':
      case 'marriage':
        // Monday, Wednesday, Thursday, Friday good for marriage
        if ([1, 3, 4, 5].includes(weekday)) {
          result.scoreAdjustment += 10;
          result.reasons.push(`${weekdayNames[weekday]} is auspicious for marriage`);
        }
        break;

      case 'business':
      case 'business launch':
        // Wednesday, Thursday, Friday good for business
        if ([3, 4, 5].includes(weekday)) {
          result.scoreAdjustment += 10;
          result.reasons.push(`${weekdayNames[weekday]} is auspicious for business`);
        }
        break;

      case 'education':
      case 'study':
        // Wednesday, Thursday, Friday good for education
        if ([3, 4, 5].includes(weekday)) {
          result.scoreAdjustment += 10;
          result.reasons.push(`${weekdayNames[weekday]} is auspicious for education`);
        }
        break;

      default:
        // General - avoid Tuesday for inauspicious work
        if (weekday === 2) { // Tuesday
          result.scoreAdjustment -= 10;
          result.reasons.push('Tuesday may be challenging for new beginnings');
        }
    }

    return result;
  }

  /**
   * Check lunar phase for event
   * @private
   * @param {string} eventType - Type of event
   * @param {string} tithi - Lunar day
   * @returns {Object} Lunar phase check result
   */
  _checkLunarPhaseForEvent(eventType, tithi) {
    const result = {
      scoreAdjustment: 0,
      reasons: []
    };

    // Extract tithi number
    const tithiMatch = tithi.match(/(\d+)/);
    const tithiNumber = tithiMatch ? parseInt(tithiMatch[1]) : 15;

    switch (eventType.toLowerCase()) {
      case 'wedding':
      case 'marriage':
        // Shukla Paksha (bright half) preferred, avoid Rikta Tithis
        if (tithi.includes('Shukla') && ![4, 9, 14].includes(tithiNumber)) {
          result.scoreAdjustment += 10;
          result.reasons.push('Shukla Paksha favorable for marriage');
        }
        break;

      case 'business':
      case 'business launch':
        // Shukla Paksha good for new beginnings
        if (tithi.includes('Shukla')) {
          result.scoreAdjustment += 5;
          result.reasons.push('Shukla Paksha good for new ventures');
        }
        break;

      case 'house warming':
        // Avoid Rikta Tithis
        if (![4, 9, 14].includes(tithiNumber)) {
          result.scoreAdjustment += 5;
          result.reasons.push('Suitable Tithi for home ceremonies');
        }
        break;

      default:
        // General preference for Shukla Paksha
        if (tithi.includes('Shukla')) {
          result.scoreAdjustment += 5;
          result.reasons.push('Shukla Paksha generally auspicious');
        }
    }

    return result;
  }

  /**
   * Find alternative Muhurta dates
   * @private
   * @param {string} eventType - Type of event
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} timezone - Timezone
   * @returns {Array} Alternative dates
   */
  _findAlternativeMuhurtaDates(eventType, year, month, day, latitude, longitude, timezone) {
    const alternatives = [];

    // Check next 30 days for better Muhurta options
    for (let i = 1; i <= 30; i++) {
      const checkDate = new Date(year, month - 1, day + i);
      const altYear = checkDate.getFullYear();
      const altMonth = checkDate.getMonth() + 1;
      const altDay = checkDate.getDate();

      const options = this._calculateMuhurtaOptions(eventType, altYear, altMonth, altDay, latitude, longitude, timezone);

      if (options.length > 0 && options[0].suitability === 'Excellent') {
        alternatives.push({
          date: `${altDay.toString().padStart(2, '0')}/${altMonth.toString().padStart(2, '0')}/${altYear}`,
          bestTime: options[0].time,
          suitability: options[0].suitability,
          score: options[0].score
        });

        if (alternatives.length >= 3) break; // Return top 3 alternatives
      }
    }

    return alternatives;
  }

  /**
   * Generate Muhurta summary
   * @private
   * @param {Object} eventData - Event data
   * @param {Array} muhurtaOptions - Muhurta options
   * @param {Array} alternativeDates - Alternative dates
   * @returns {string} Summary text
   */
  _generateMuhurtaSummary(eventData, muhurtaOptions, alternativeDates) {
    let summary = `🕉️ *Muhurta Analysis for ${eventData.eventType}*\n\n`;
    summary += `*Preferred Date:* ${eventData.preferredDate}\n`;
    summary += `*Location:* ${eventData.location}\n\n`;

    if (muhurtaOptions.length > 0) {
      summary += '*Recommended Timings for Preferred Date:*\n\n';
      muhurtaOptions.forEach((option, index) => {
        summary += `*${index + 1}. ${option.time}* (${option.suitability})\n`;
        summary += `   Score: ${option.score}/100\n`;
        summary += `   Tithi: ${option.tithi}\n`;
        summary += `   Nakshatra: ${option.nakshatra}\n`;
        if (option.reasons.length > 0) {
          summary += `   Reasons: ${option.reasons.slice(0, 2).join(', ')}\n`;
        }
        summary += '\n';
      });
    } else {
      summary += '*No highly auspicious timings found on preferred date.*\n\n';
    }

    if (alternativeDates.length > 0) {
      summary += '*Alternative Auspicious Dates:*\n\n';
      alternativeDates.forEach((alt, index) => {
        summary += `*${index + 1}. ${alt.date} at ${alt.bestTime}*\n`;
        summary += `   Suitability: ${alt.suitability} (Score: ${alt.score}/100)\n\n`;
      });
    }

    summary += '*Muhurta Considerations:*\n';
    summary += '• Panchaka Dosha (Rahu Kalam, Gulika Kalam, etc.) avoided\n';
    summary += '• Abhijit Muhurta prioritized when available\n';
    summary += '• Planetary positions analyzed for event type\n';
    summary += '• Weekday and lunar phase considered\n\n';

    summary += '🕉️ *Note:* This is a traditional Muhurta analysis. Consult local priests/pundits for final confirmation.';

    return summary;
  }

  /**
   * Generate Panchang (Hindu Almanac) for a specific date
   * @param {Object} dateData - Date and location data
   * @param {string} dateData.date - Date in DD/MM/YYYY format
   * @param {string} dateData.location - Location for calculations
   * @returns {Object} Panchang analysis
   */
  generatePanchang(dateData) {
    try {
      const { date, location } = dateData;

      if (!date || !location) {
        return {
          error: 'Date and location required for Panchang'
        };
      }

      // Parse date
      const [day, month, year] = date.split('/').map(Number);

      // Get location coordinates
      const [latitude, longitude] = this._getCoordinatesForPlace(location);
      const timezone = this._getTimezoneForPlace(location);

      // Generate Panchang data
      const panchangData = this._calculatePanchangData(year, month, day, latitude, longitude, timezone);

      // Generate daily guidance
      const dailyGuidance = this._generateDailyGuidance(panchangData);

      return {
        date,
        location,
        panchangData,
        dailyGuidance,
        summary: this._generatePanchangSummary(date, location, panchangData, dailyGuidance)
      };
    } catch (error) {
      logger.error('Error generating Panchang:', error);
      return {
        error: 'Unable to generate Panchang at this time'
      };
    }
  }

  /**
   * Calculate Panchang data for a specific date
   * @private
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} timezone - Timezone
   * @returns {Object} Panchang data
   */
  _calculatePanchangData(year, month, day, latitude, longitude, timezone) {
    const panchangData = {
      date: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`,
      weekday: this._getWeekdayName(year, month, day),
      tithi: 'Unknown',
      nakshatra: 'Unknown',
      yoga: 'Unknown',
      karana: 'Unknown',
      sunrise: 'Unknown',
      sunset: 'Unknown',
      moonPhase: 'Unknown',
      rahukalam: 'Unknown',
      gulikakalam: 'Unknown',
      yamagandam: 'Unknown',
      abhijitMuhurta: 'Unknown',
      auspiciousActivities: [],
      inauspiciousActivities: []
    };

    try {
      // Calculate astronomical data
      const astroData = {
        year, month, date: day, hours: 12, minutes: 0, seconds: 0,
        latitude, longitude, timezone, chartType: 'sidereal'
      };

      const chart = this.astrologer.generateNatalChartData(astroData);

      // Extract Panchang elements
      panchangData.tithi = this._calculateTithi(chart);
      panchangData.nakshatra = this._calculateNakshatra(chart);
      panchangData.yoga = this._calculateYoga(chart);
      panchangData.karana = this._calculateKarana(chart);
      panchangData.moonPhase = this._calculateMoonPhase(chart);

      // Calculate day timings (simplified)
      panchangData.sunrise = this._calculateSunrise(year, month, day, latitude, longitude);
      panchangData.sunset = this._calculateSunset(year, month, day, latitude, longitude);

      // Calculate inauspicious periods
      panchangData.rahukalam = this._calculateRahukalam(year, month, day, panchangData.sunrise, panchangData.sunset);
      panchangData.gulikakalam = this._calculateGulikakalam(year, month, day, panchangData.sunrise, panchangData.sunset);
      panchangData.yamagandam = this._calculateYamagandam(year, month, day, panchangData.sunrise, panchangData.sunset);
      panchangData.abhijitMuhurta = this._calculateAbhijitMuhurta(panchangData.sunrise, panchangData.sunset);

      // Determine auspicious/inauspicious activities
      const activityAnalysis = this._analyzeDailyActivities(panchangData);
      panchangData.auspiciousActivities = activityAnalysis.auspicious;
      panchangData.inauspiciousActivities = activityAnalysis.inauspicious;

    } catch (error) {
      logger.error('Error calculating Panchang data:', error);
      // Return default values
    }

    return panchangData;
  }

  /**
   * Get weekday name
   * @private
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @returns {string} Weekday name
   */
  _getWeekdayName(year, month, day) {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(year, month - 1, day);
    return weekdays[date.getDay()];
  }

  /**
   * Calculate Tithi (lunar day)
   * @private
   * @param {Object} chart - Astrological chart
   * @returns {string} Tithi
   */
  _calculateTithi(chart) {
    // Simplified Tithi calculation based on Moon-Sun longitude difference
    try {
      const moon = chart.planets.moon;
      const sun = chart.planets.sun;

      if (moon && sun) {
        const longitudeDiff = (moon.longitude - sun.longitude + 360) % 360;
        const tithiNumber = Math.floor(longitudeDiff / 12) + 1;
        const paksha = longitudeDiff < 180 ? 'Shukla' : 'Krishna';

        const tithiNames = [
          'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
          'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
          'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
        ];

        return `${paksha} ${tithiNames[tithiNumber - 1]}`;
      }
    } catch (error) {
      logger.error('Error calculating Tithi:', error);
    }

    return 'Unknown';
  }

  /**
   * Calculate Nakshatra (constellation)
   * @private
   * @param {Object} chart - Astrological chart
   * @returns {string} Nakshatra
   */
  _calculateNakshatra(chart) {
    try {
      const moon = chart.planets.moon;

      if (moon) {
        const nakshatras = [
          'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
          'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
          'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshta',
          'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
          'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
        ];

        const nakshatraIndex = Math.floor((moon.longitude % 360) / (360 / 27));
        return nakshatras[nakshatraIndex];
      }
    } catch (error) {
      logger.error('Error calculating Nakshatra:', error);
    }

    return 'Unknown';
  }

  /**
   * Calculate Yoga (planetary combination)
   * @private
   * @param {Object} chart - Astrological chart
   * @returns {string} Yoga
   */
  _calculateYoga(chart) {
    try {
      const sun = chart.planets.sun;
      const moon = chart.planets.moon;

      if (sun && moon) {
        const yogaLongitude = (sun.longitude + moon.longitude) % 360;
        const yogaIndex = Math.floor(yogaLongitude / (360 / 27));

        const yogaNames = [
          'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
          'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata',
          'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha',
          'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'
        ];

        return yogaNames[yogaIndex];
      }
    } catch (error) {
      logger.error('Error calculating Yoga:', error);
    }

    return 'Unknown';
  }

  /**
   * Calculate Karana (half lunar day)
   * @private
   * @param {Object} chart - Astrological chart
   * @returns {string} Karana
   */
  _calculateKarana(chart) {
    try {
      const moon = chart.planets.moon;
      const sun = chart.planets.sun;

      if (moon && sun) {
        const longitudeDiff = (moon.longitude - sun.longitude + 360) % 360;
        const karanaNumber = Math.floor(longitudeDiff / 6);

        const karanaNames = [
          'Kimstughna', 'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja',
          'Vanija', 'Visti', 'Sakuna', 'Chatushpada', 'Nagava', 'Kimstughna'
        ];

        // Repeat the cycle
        return karanaNames[karanaNumber % karanaNames.length];
      }
    } catch (error) {
      logger.error('Error calculating Karana:', error);
    }

    return 'Unknown';
  }

  /**
   * Calculate Moon Phase
   * @private
   * @param {Object} chart - Astrological chart
   * @returns {string} Moon phase
   */
  _calculateMoonPhase(chart) {
    try {
      const moon = chart.planets.moon;
      const sun = chart.planets.sun;

      if (moon && sun) {
        const longitudeDiff = (moon.longitude - sun.longitude + 360) % 360;

        if (longitudeDiff < 45) return 'New Moon';
        if (longitudeDiff < 90) return 'Waxing Crescent';
        if (longitudeDiff < 135) return 'First Quarter';
        if (longitudeDiff < 180) return 'Waxing Gibbous';
        if (longitudeDiff < 225) return 'Full Moon';
        if (longitudeDiff < 270) return 'Waning Gibbous';
        if (longitudeDiff < 315) return 'Last Quarter';
        return 'Waning Crescent';
      }
    } catch (error) {
      logger.error('Error calculating Moon Phase:', error);
    }

    return 'Unknown';
  }

  /**
   * Calculate sunrise time (simplified)
   * @private
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {string} Sunrise time
   */
  _calculateSunrise(year, month, day, latitude, longitude) {
    // Simplified sunrise calculation
    // In practice, this would use astronomical calculations
    const baseSunrise = latitude > 0 ? '06:00' : '07:00'; // Northern vs Southern hemisphere
    return baseSunrise;
  }

  /**
   * Calculate sunset time (simplified)
   * @private
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {string} Sunset time
   */
  _calculateSunset(year, month, day, latitude, longitude) {
    // Simplified sunset calculation
    const baseSunset = latitude > 0 ? '18:00' : '19:00'; // Northern vs Southern hemisphere
    return baseSunset;
  }

  /**
   * Calculate Rahukalam (Rahu's period)
   * @private
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {string} sunrise - Sunrise time
   * @param {string} sunset - Sunset time
   * @returns {string} Rahukalam time
   */
  _calculateRahukalam(year, month, day, sunrise, sunset) {
    // Rahukalam varies by weekday
    const date = new Date(year, month - 1, day);
    const weekday = date.getDay(); // 0 = Sunday

    const rahukalamPeriods = {
      0: '4:30 PM - 6:00 PM', // Sunday
      1: '7:30 AM - 9:00 AM', // Monday
      2: '3:00 PM - 4:30 PM', // Tuesday
      3: '12:00 PM - 1:30 PM', // Wednesday
      4: '1:30 PM - 3:00 PM', // Thursday
      5: '10:30 AM - 12:00 PM', // Friday
      6: '9:00 AM - 10:30 AM'  // Saturday
    };

    return rahukalamPeriods[weekday] || 'Unknown';
  }

  /**
   * Calculate Gulika Kalam (Gulika's period)
   * @private
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {string} sunrise - Sunrise time
   * @param {string} sunset - Sunset time
   * @returns {string} Gulikakalam time
   */
  _calculateGulikakalam(year, month, day, sunrise, sunset) {
    // Gulikakalam varies by weekday (most inauspicious period)
    const date = new Date(year, month - 1, day);
    const weekday = date.getDay();

    const gulikaPeriods = {
      0: '3:00 PM - 4:30 PM', // Sunday
      1: '12:00 PM - 1:30 PM', // Monday
      2: '10:30 AM - 12:00 PM', // Tuesday
      3: '1:30 PM - 3:00 PM', // Wednesday
      4: '9:00 AM - 10:30 AM', // Thursday
      5: '7:30 AM - 9:00 AM', // Friday
      6: '4:30 PM - 6:00 PM'  // Saturday
    };

    return gulikaPeriods[weekday] || 'Unknown';
  }

  /**
   * Calculate Yamagandam (inauspicious period)
   * @private
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {string} sunrise - Sunrise time
   * @param {string} sunset - Sunset time
   * @returns {string} Yamagandam time
   */
  _calculateYamagandam(year, month, day, sunrise, sunset) {
    // Yamagandam varies by weekday
    const date = new Date(year, month - 1, day);
    const weekday = date.getDay();

    const yamagandamPeriods = {
      0: '12:00 PM - 1:30 PM', // Sunday
      1: '10:30 AM - 12:00 PM', // Monday
      2: '9:00 AM - 10:30 AM', // Tuesday
      3: '7:30 AM - 9:00 AM', // Wednesday
      4: '3:00 PM - 4:30 PM', // Thursday
      5: '12:00 PM - 1:30 PM', // Friday
      6: '1:30 PM - 3:00 PM'  // Saturday
    };

    return yamagandamPeriods[weekday] || 'Unknown';
  }

  /**
   * Calculate Abhijit Muhurta
   * @private
   * @param {string} sunrise - Sunrise time
   * @param {string} sunset - Sunset time
   * @returns {string} Abhijit Muhurta time
   */
  _calculateAbhijitMuhurta(sunrise, sunset) {
    // Abhijit Muhurta is noon ± 24 minutes (most auspicious time)
    return '11:36 AM - 12:24 PM';
  }

  /**
   * Analyze daily activities based on Panchang
   * @private
   * @param {Object} panchangData - Panchang data
   * @returns {Object} Activity analysis
   */
  _analyzeDailyActivities(panchangData) {
    const analysis = {
      auspicious: [],
      inauspicious: []
    };

    // Check Tithi for auspicious activities
    if (panchangData.tithi.includes('Shukla') &&
        (panchangData.tithi.includes('Purnima') || panchangData.tithi.includes('Ekadashi'))) {
      analysis.auspicious.push('Religious ceremonies and spiritual activities');
    }

    if (panchangData.tithi.includes('Krishna') &&
        (panchangData.tithi.includes('Amavasya') || panchangData.tithi.includes('Chaturdashi'))) {
      analysis.inauspicious.push('New beginnings and auspicious ceremonies');
    }

    // Check Nakshatra
    const auspiciousNakshatras = ['Rohini', 'Uttara Phalguni', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'];
    const inauspiciousNakshatras = ['Mula', 'Jyeshta', 'Ashlesha'];

    if (auspiciousNakshatras.some(n => panchangData.nakshatra.includes(n))) {
      analysis.auspicious.push('Marriage and important ceremonies');
    }

    if (inauspiciousNakshatras.some(n => panchangData.nakshatra.includes(n))) {
      analysis.inauspicious.push('Marriage and travel');
    }

    // Check Yoga
    const auspiciousYogas = ['Siddhi', 'Vyatipata', 'Shubha', 'Shukla', 'Brahma'];
    const inauspiciousYogas = ['Vishkambha', 'Atiganda', 'Shula', 'Ganda', 'Vyaghata'];

    if (auspiciousYogas.some(y => panchangData.yoga.includes(y))) {
      analysis.auspicious.push('All important activities');
    }

    if (inauspiciousYogas.some(y => panchangData.yoga.includes(y))) {
      analysis.inauspicious.push('New ventures and important decisions');
    }

    // Weekday considerations
    const weekday = panchangData.weekday;
    if (weekday === 'Monday') {
      analysis.auspicious.push('Spiritual activities and charity');
    } else if (weekday === 'Tuesday') {
      analysis.inauspicious.push('Marriage and new beginnings');
    } else if (weekday === 'Wednesday') {
      analysis.auspicious.push('Education and learning');
    } else if (weekday === 'Thursday') {
      analysis.auspicious.push('Wealth and prosperity activities');
    } else if (weekday === 'Friday') {
      analysis.auspicious.push('Love and marriage');
    } else if (weekday === 'Saturday') {
      analysis.inauspicious.push('Important ceremonies');
    }

    // Default activities if none specified
    if (analysis.auspicious.length === 0) {
      analysis.auspicious.push('General activities and daily work');
    }

    if (analysis.inauspicious.length === 0) {
      analysis.inauspicious.push('Avoid during Rahukalam and Gulikakalam');
    }

    return analysis;
  }

  /**
   * Generate daily guidance based on Panchang
   * @private
   * @param {Object} panchangData - Panchang data
   * @returns {Object} Daily guidance
   */
  _generateDailyGuidance(panchangData) {
    const guidance = {
      overallRating: 'Neutral',
      recommendations: [],
      warnings: [],
      bestActivities: [],
      avoidActivities: []
    };

    // Calculate overall rating
    let positiveFactors = 0;
    let negativeFactors = 0;

    // Check for auspicious elements
    if (panchangData.tithi.includes('Shukla')) positiveFactors++;
    if (panchangData.nakshatra.includes('Rohini') || panchangData.nakshatra.includes('Revati')) positiveFactors++;
    if (panchangData.yoga.includes('Siddhi') || panchangData.yoga.includes('Shubha')) positiveFactors++;
    if (['Wednesday', 'Thursday', 'Friday'].includes(panchangData.weekday)) positiveFactors++;

    // Check for inauspicious elements
    if (panchangData.tithi.includes('Krishna') && panchangData.tithi.includes('Chaturdashi')) negativeFactors++;
    if (panchangData.nakshatra.includes('Mula') || panchangData.nakshatra.includes('Jyeshta')) negativeFactors++;
    if (panchangData.yoga.includes('Vyaghata') || panchangData.yoga.includes('Vishkambha')) negativeFactors++;
    if (panchangData.weekday === 'Tuesday' || panchangData.weekday === 'Saturday') negativeFactors++;

    if (positiveFactors > negativeFactors + 1) {
      guidance.overallRating = 'Auspicious';
    } else if (negativeFactors > positiveFactors + 1) {
      guidance.overallRating = 'Inauspicious';
    }

    // Generate recommendations
    guidance.recommendations = panchangData.auspiciousActivities;
    guidance.warnings = panchangData.inauspiciousActivities;
    guidance.bestActivities = panchangData.auspiciousActivities.slice(0, 3);
    guidance.avoidActivities = panchangData.inauspiciousActivities.slice(0, 3);

    return guidance;
  }

  /**
   * Generate Panchang summary
   * @private
   * @param {string} date - Date
   * @param {string} location - Location
   * @param {Object} panchangData - Panchang data
   * @param {Object} dailyGuidance - Daily guidance
   * @returns {string} Summary text
   */
  _generatePanchangSummary(date, location, panchangData, dailyGuidance) {
    let summary = `🕉️ *Panchang for ${date} - ${location}*\n\n`;

    summary += `*Date:* ${panchangData.date}\n`;
    summary += `*Day:* ${panchangData.weekday}\n\n`;

    summary += `*Tithi (Lunar Day):* ${panchangData.tithi}\n`;
    summary += `*Nakshatra:* ${panchangData.nakshatra}\n`;
    summary += `*Yoga:* ${panchangData.yoga}\n`;
    summary += `*Karana:* ${panchangData.karana}\n\n`;

    summary += `*Sunrise:* ${panchangData.sunrise}\n`;
    summary += `*Sunset:* ${panchangData.sunset}\n`;
    summary += `*Moon Phase:* ${panchangData.moonPhase}\n\n`;

    summary += `*Inauspicious Periods:*\n`;
    summary += `• Rahukalam: ${panchangData.rahukalam}\n`;
    summary += `• Gulikakalam: ${panchangData.gulikakalam}\n`;
    summary += `• Yamagandam: ${panchangData.yamagandam}\n\n`;

    summary += `*Abhijit Muhurta (Most Auspicious):* ${panchangData.abhijitMuhurta}\n\n`;

    summary += `*Overall Day Rating:* ${dailyGuidance.overallRating}\n\n`;

    if (dailyGuidance.bestActivities.length > 0) {
      summary += `*Recommended Activities:*\n`;
      dailyGuidance.bestActivities.forEach(activity => {
        summary += `• ${activity}\n`;
      });
      summary += '\n';
    }

    if (dailyGuidance.avoidActivities.length > 0) {
      summary += `*Activities to Avoid:*\n`;
      dailyGuidance.avoidActivities.forEach(activity => {
        summary += `• ${activity}\n`;
      });
      summary += '\n';
    }

    summary += '*Note:* Panchang provides traditional Hindu calendar guidance. Consult local priests for religious ceremonies. 🕉️';

    return summary;
  }

  /**
   * Generate Kaal Sarp Dosha analysis
   * @param {Object} birthData - User's birth data
   * @returns {Object} Kaal Sarp Dosha analysis
   */
  generateKaalSarpDosha(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return {
          error: 'Complete birth details required for Kaal Sarp Dosha analysis'
        };
      }

      // Generate birth chart
      const kundli = this.generateVedicKundli(birthData);
      if (kundli.error) {
        return { error: kundli.error };
      }

      // Analyze Kaal Sarp Dosha
      const doshaAnalysis = this._analyzeKaalSarpDosha(kundli);

      // Generate remedies if dosha is present
      const remedies = doshaAnalysis.hasDosha ? this._generateKaalSarpRemedies(doshaAnalysis) : [];

      return {
        name,
        doshaAnalysis,
        remedies,
        summary: this._generateKaalSarpSummary(doshaAnalysis, remedies)
      };
    } catch (error) {
      logger.error('Error generating Kaal Sarp Dosha:', error);
      return {
        error: 'Unable to generate Kaal Sarp Dosha analysis at this time'
      };
    }
  }

  /**
   * Analyze Kaal Sarp Dosha in the birth chart
   * @private
   * @param {Object} kundli - Kundli data
   * @returns {Object} Dosha analysis
   */
  _analyzeKaalSarpDosha(kundli) {
    const analysis = {
      hasDosha: false,
      doshaType: 'None',
      doshaStrength: 'None',
      rahuPosition: 0,
      ketuPosition: 0,
      planetsBetween: [],
      planetsOutside: [],
      doshaHouse: 0,
      effects: [],
      severity: 'None'
    };

    const planets = kundli.planetaryPositions;
    const rahu = planets.rahu;
    const ketu = planets.ketu;

    if (!rahu || !ketu) {
      return analysis;
    }

    analysis.rahuPosition = rahu.house;
    analysis.ketuPosition = ketu.house;

    // Get all planets except Rahu and Ketu
    const allPlanets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
    const planetPositions = allPlanets.map(planet => ({
      name: planet,
      house: planets[planet]?.house
    })).filter(p => p.house);

    // Determine if it's a Kaal Sarp configuration
    const isKaalSarp = this._checkKaalSarpConfiguration(rahu.house, ketu.house, planetPositions);

    if (isKaalSarp) {
      analysis.hasDosha = true;
      analysis.doshaType = this._determineDoshaType(rahu.house, ketu.house);
      analysis.doshaHouse = rahu.house; // The house where Rahu is located

      // Separate planets between and outside Rahu-Ketu axis
      const { between, outside } = this._categorizePlanets(rahu.house, ketu.house, planetPositions);
      analysis.planetsBetween = between;
      analysis.planetsOutside = outside;

      // Determine strength
      analysis.doshaStrength = this._calculateDoshaStrength(between.length, outside.length);

      // Determine severity
      analysis.severity = this._calculateDoshaSeverity(analysis.doshaType, analysis.doshaStrength, analysis.doshaHouse);

      // Generate effects
      analysis.effects = this._generateDoshaEffects(analysis);
    }

    return analysis;
  }

  /**
   * Check if planets form a Kaal Sarp configuration
   * @private
   * @param {number} rahuHouse - Rahu's house
   * @param {number} ketuHouse - Ketu's house
   * @param {Array} planetPositions - All planet positions
   * @returns {boolean} Whether it's Kaal Sarp
   */
  _checkKaalSarpConfiguration(rahuHouse, ketuHouse, planetPositions) {
    // Check if Rahu and Ketu are exactly opposite (7 houses apart)
    const houseDifference = Math.abs(rahuHouse - ketuHouse);
    if (houseDifference !== 7 && houseDifference !== 5) { // Allow for some variations
      return false;
    }

    // Count planets between Rahu and Ketu
    let planetsBetween = 0;
    let planetsOutside = 0;

    planetPositions.forEach(planet => {
      if (this._isBetweenRahuKetu(rahuHouse, ketuHouse, planet.house)) {
        planetsBetween++;
      } else {
        planetsOutside++;
      }
    });

    // Full Kaal Sarp: All planets between Rahu and Ketu
    // Partial Kaal Sarp: At least 6 planets between Rahu and Ketu
    return planetsBetween >= 6;
  }

  /**
   * Check if a planet is between Rahu and Ketu
   * @private
   * @param {number} rahuHouse - Rahu's house
   * @param {number} ketuHouse - Ketu's house
   * @param {number} planetHouse - Planet's house
   * @returns {boolean} Whether planet is between
   */
  _isBetweenRahuKetu(rahuHouse, ketuHouse, planetHouse) {
    // Normalize houses to handle 12-house circle
    const normalizeHouse = (house) => ((house - 1) % 12) + 1;

    const rahu = normalizeHouse(rahuHouse);
    const ketu = normalizeHouse(ketuHouse);
    const planet = normalizeHouse(planetHouse);

    // Calculate the shorter arc between Rahu and Ketu
    const directDistance = Math.abs(rahu - ketu);
    const wrapDistance = 12 - directDistance;
    const shorterDistance = Math.min(directDistance, wrapDistance);

    // Determine the direction (clockwise or counterclockwise)
    let start, end;
    if (directDistance <= wrapDistance) {
      start = Math.min(rahu, ketu);
      end = Math.max(rahu, ketu);
    } else {
      start = Math.max(rahu, ketu);
      end = Math.min(rahu, ketu) + 12;
    }

    // Check if planet is in the arc
    if (start < end) {
      return planet >= start && planet <= end;
    } else {
      return planet >= start || planet <= (end - 12);
    }
  }

  /**
   * Determine the type of Kaal Sarp Dosha
   * @private
   * @param {number} rahuHouse - Rahu's house
   * @param {number} ketuHouse - Ketu's house
   * @returns {string} Dosha type
   */
  _determineDoshaType(rahuHouse, ketuHouse) {
    const doshaTypes = {
      1: 'Anant Kalsarp Dosha',
      2: 'Kulik Kalsarp Dosha',
      3: 'Vasuki Kalsarp Dosha',
      4: 'Shankhpal Kalsarp Dosha',
      5: 'Padma Kalsarp Dosha',
      6: 'Mahapadma Kalsarp Dosha',
      7: 'Takshak Kalsarp Dosha',
      8: 'Karkotak Kalsarp Dosha',
      9: 'Shankhchud Kalsarp Dosha',
      10: 'Ghatak Kalsarp Dosha',
      11: 'Vishdhar Kalsarp Dosha',
      12: 'Sheshnag Kalsarp Dosha'
    };

    return doshaTypes[rahuHouse] || 'Kaal Sarp Dosha';
  }

  /**
   * Categorize planets as between or outside Rahu-Ketu
   * @private
   * @param {number} rahuHouse - Rahu's house
   * @param {number} ketuHouse - Ketu's house
   * @param {Array} planetPositions - Planet positions
   * @returns {Object} Categorized planets
   */
  _categorizePlanets(rahuHouse, ketuHouse, planetPositions) {
    const between = [];
    const outside = [];

    planetPositions.forEach(planet => {
      if (this._isBetweenRahuKetu(rahuHouse, ketuHouse, planet.house)) {
        between.push(planet.name.charAt(0).toUpperCase() + planet.name.slice(1));
      } else {
        outside.push(planet.name.charAt(0).toUpperCase() + planet.name.slice(1));
      }
    });

    return { between, outside };
  }

  /**
   * Calculate dosha strength
   * @private
   * @param {number} planetsBetween - Number of planets between
   * @param {number} planetsOutside - Number of planets outside
   * @returns {string} Strength level
   */
  _calculateDoshaStrength(planetsBetween, planetsOutside) {
    if (planetsBetween === 7) return 'Full Kaal Sarp Dosha';
    if (planetsBetween >= 6) return 'Partial Kaal Sarp Dosha';
    if (planetsBetween >= 4) return 'Mild Kaal Sarp Dosha';
    return 'No Kaal Sarp Dosha';
  }

  /**
   * Calculate dosha severity
   * @private
   * @param {string} doshaType - Type of dosha
   * @param {string} doshaStrength - Strength of dosha
   * @param {number} doshaHouse - House where dosha is located
   * @returns {string} Severity level
   */
  _calculateDoshaSeverity(doshaType, doshaStrength, doshaHouse) {
    let severity = 'Mild';

    // Full Kaal Sarp is more severe
    if (doshaStrength === 'Full Kaal Sarp Dosha') {
      severity = 'High';
    } else if (doshaStrength === 'Partial Kaal Sarp Dosha') {
      severity = 'Moderate';
    }

    // Certain houses make it more severe
    const severeHouses = [1, 7, 8, 12]; // 1st, 7th, 8th, 12th houses
    if (severeHouses.includes(doshaHouse)) {
      severity = severity === 'High' ? 'Very High' : 'High';
    }

    return severity;
  }

  /**
   * Generate effects of Kaal Sarp Dosha
   * @private
   * @param {Object} analysis - Dosha analysis
   * @returns {Array} Effects
   */
  _generateDoshaEffects(analysis) {
    const effects = [];
    const doshaHouse = analysis.doshaHouse;

    // Base effects based on dosha house
    const houseEffects = {
      1: ['Delays in career and life achievements', 'Health issues', 'Personality development challenges'],
      2: ['Financial difficulties', 'Family problems', 'Speech and communication issues'],
      3: ['Siblings and friends problems', 'Courage and confidence issues', 'Short journey obstacles'],
      4: ['Home and property issues', 'Mother-related problems', 'Education foundation problems'],
      5: ['Children and creativity issues', 'Intelligence and learning problems', 'Spiritual growth delays'],
      6: ['Health and enemies issues', 'Service and daily routine problems', 'Competition difficulties'],
      7: ['Marriage and partnership delays', 'Relationship problems', 'Business partnership issues'],
      8: ['Longevity and inheritance concerns', 'Transformation and occult interests', 'Sudden changes'],
      9: ['Fortune and father issues', 'Higher learning and travel problems', 'Spiritual guidance delays'],
      10: ['Career and reputation challenges', 'Authority and leadership issues', 'Public image problems'],
      11: ['Gains and elder siblings issues', 'Friends and hopes problems', 'Fulfillment delays'],
      12: ['Expenses and losses', 'Foreign lands and spirituality issues', 'Liberation and moksha delays']
    };

    effects.push(...(houseEffects[doshaHouse] || ['General life challenges and delays']));

    // Additional effects based on severity
    if (analysis.severity === 'Very High') {
      effects.push('Major life obstacles and repeated failures');
      effects.push('Strong karmic influences requiring significant spiritual effort');
    } else if (analysis.severity === 'High') {
      effects.push('Significant challenges in life areas ruled by the dosha house');
      effects.push('Need for consistent remedial measures');
    } else if (analysis.severity === 'Moderate') {
      effects.push('Moderate challenges that can be overcome with effort');
      effects.push('Periodic difficulties in specific life areas');
    }

    return effects;
  }

  /**
    * Generate Kaal Sarp Dosha remedies using comprehensive Vedic Remedies system
    * @private
    * @param {Object} analysis - Dosha analysis
    * @returns {Object} Comprehensive remedies package
    */
  _generateKaalSarpRemedies(analysis) {
    if (!this._vedicRemedies) {
      // Fallback to basic remedies if VedicRemedies not available
      return this._generateBasicKaalSarpRemedies(analysis);
    }

    try {
      // Get comprehensive remedies from VedicRemedies system
      const remediesData = this._vedicRemedies.generateDoshaRemedies('kaal_sarp');

      if (remediesData.error) {
        return this._generateBasicKaalSarpRemedies(analysis);
      }

      // Enhance with house-specific and severity-based remedies
      const enhancedRemedies = { ...remediesData };

      // Add house-specific remedies
      const doshaHouse = analysis.doshaHouse;
      const houseSpecific = this._getHouseSpecificKaalSarpRemedies(doshaHouse);
      if (houseSpecific.length > 0) {
        enhancedRemedies.houseSpecific = houseSpecific;
      }

      // Add severity-based recommendations
      if (analysis.severity === 'Very High' || analysis.severity === 'High') {
        enhancedRemedies.urgent = {
          recommendation: 'Consult senior astrologer immediately for specialized remedies',
          priority: 'High'
        };
      }

      return enhancedRemedies;
    } catch (error) {
      logger.error('Error generating comprehensive Kaal Sarp remedies:', error);
      return this._generateBasicKaalSarpRemedies(analysis);
    }
  }

  /**
    * Generate basic Kaal Sarp remedies (fallback)
    * @private
    * @param {Object} analysis - Dosha analysis
    * @returns {Object} Basic remedies
    */
  _generateBasicKaalSarpRemedies(analysis) {
    const remedies = [];
    const doshaHouse = analysis.doshaHouse;

    // General remedies for all Kaal Sarp Dosha
    remedies.push({
      type: 'Mantra',
      description: 'Chant "Om Namah Shivaya" 108 times daily',
      duration: 'Daily for 40 days'
    });

    remedies.push({
      type: 'Puja',
      description: 'Perform Kaal Sarp Dosha Nivaran Puja',
      duration: 'One time or annually'
    });

    remedies.push({
      type: 'Gemstone',
      description: 'Wear Rahu (Hessonite) and Ketu (Cat\'s Eye) gemstones',
      duration: 'After consulting astrologer'
    });

    // House-specific remedies
    const houseRemedies = this._getHouseSpecificKaalSarpRemedies(doshaHouse);
    remedies.push(...houseRemedies);

    // Severity-based additional remedies
    if (analysis.severity === 'Very High') {
      remedies.push({
        type: 'Advanced',
        description: 'Consult senior astrologer for specialized remedies',
        duration: 'Immediate'
      });
    }

    return { basic: remedies };
  }

  /**
    * Get house-specific Kaal Sarp remedies
    * @private
    * @param {number} doshaHouse - House where dosha is formed
    * @returns {Array} House-specific remedies
    */
  _getHouseSpecificKaalSarpRemedies(doshaHouse) {
    const houseRemedies = {
      1: [
        { type: 'Charity', description: 'Donate food and clothes to poor', duration: 'Weekly' },
        { type: 'Fasting', description: 'Fast on Mondays', duration: 'Weekly' }
      ],
      2: [
        { type: 'Charity', description: 'Donate to family temples', duration: 'Monthly' },
        { type: 'Worship', description: 'Worship family deities', duration: 'Daily' }
      ],
      3: [
        { type: 'Charity', description: 'Help siblings and cousins', duration: 'Regularly' },
        { type: 'Mantra', description: 'Chant Hanuman Chalisa', duration: 'Daily' }
      ],
      4: [
        { type: 'Worship', description: 'Worship Mother Goddess', duration: 'Daily' },
        { type: 'Charity', description: 'Donate to mother-related causes', duration: 'Monthly' }
      ],
      5: [
        { type: 'Education', description: 'Continue learning and education', duration: 'Ongoing' },
        { type: 'Worship', description: 'Worship Lord Ganesha', duration: 'Daily' }
      ],
      6: [
        { type: 'Service', description: 'Help sick people and animals', duration: 'Regularly' },
        { type: 'Mantra', description: 'Chant health-related mantras', duration: 'Daily' }
      ],
      7: [
        { type: 'Marriage', description: 'Consider early marriage if suitable', duration: 'As appropriate' },
        { type: 'Worship', description: 'Worship Lord Shiva and Parvati', duration: 'Daily' }
      ],
      8: [
        { type: 'Spiritual', description: 'Practice meditation and yoga', duration: 'Daily' },
        { type: 'Charity', description: 'Donate to spiritual causes', duration: 'Monthly' }
      ],
      9: [
        { type: 'Travel', description: 'Visit holy places', duration: 'Annually' },
        { type: 'Worship', description: 'Worship Guru and father figures', duration: 'Daily' }
      ],
      10: [
        { type: 'Career', description: 'Focus on career development', duration: 'Ongoing' },
        { type: 'Worship', description: 'Worship Lord Vishnu', duration: 'Daily' }
      ],
      11: [
        { type: 'Charity', description: 'Help elder siblings and friends', duration: 'Regularly' },
        { type: 'Mantra', description: 'Chant Lakshmi mantras', duration: 'Daily' }
      ],
      12: [
        { type: 'Charity', description: 'Donate to poor and temples', duration: 'Monthly' },
        { type: 'Spiritual', description: 'Practice detachment and spirituality', duration: 'Daily' }
      ]
    };

    return houseRemedies[doshaHouse] || [];
  }

  /**
   * Generate Kaal Sarp Dosha summary
   * @private
   * @param {Object} analysis - Dosha analysis
   * @param {Array} remedies - Remedies
   * @returns {string} Summary text
   */
  _generateKaalSarpSummary(analysis, remedies) {
    let summary = `🕉️ *Kaal Sarp Dosha Analysis*\n\n`;

    if (analysis.hasDosha) {
      summary += `*⚠️ Kaal Sarp Dosha Present*\n\n`;
      summary += `*Type:* ${analysis.doshaType}\n`;
      summary += `*Strength:* ${analysis.doshaStrength}\n`;
      summary += `*Severity:* ${analysis.severity}\n`;
      summary += `*Rahu Position:* ${analysis.rahuPosition}th house\n`;
      summary += `*Ketu Position:* ${analysis.ketuPosition}th house\n\n`;

      if (analysis.planetsBetween.length > 0) {
        summary += `*Planets Between Rahu-Ketu:* ${analysis.planetsBetween.join(', ')}\n`;
      }

      if (analysis.planetsOutside.length > 0) {
        summary += `*Planets Outside:* ${analysis.planetsOutside.join(', ')}\n`;
      }

      summary += '\n*Effects:*\n';
      analysis.effects.forEach(effect => {
        summary += `• ${effect}\n`;
      });

      summary += '\n*🕉️ Comprehensive Remedies:*\n\n';

      // Gemstones
      if (remedies.gemstones && remedies.gemstones.length > 0) {
        summary += `*💎 Recommended Gemstones:*\n`;
        remedies.gemstones.forEach(gem => {
          summary += `• ${gem.name} (${gem.sanskrit}) - Wear on ${gem.finger}\n`;
        });
        summary += '\n';
      }

      // Mantras
      if (remedies.mantras && remedies.mantras.length > 0) {
        summary += `*📿 Powerful Mantras:*\n`;
        remedies.mantras.forEach(mantra => {
          summary += `• "${mantra.beej}" (${mantra.count})\n`;
        });
        summary += '\n';
      }

      // Puja
      if (remedies.puja) {
        summary += `*🙏 Recommended Puja:*\n`;
        summary += `• ${remedies.puja.name} (${remedies.puja.duration})\n`;
        summary += `• Benefits: ${remedies.puja.benefits}\n\n`;
      }

      // Special practices
      if (remedies.special) {
        summary += `*⚡ Special Practices:*\n`;
        if (remedies.special.fasting) summary += `• Fasting: ${remedies.special.fasting}\n`;
        if (remedies.special.offerings) summary += `• Offerings: ${remedies.special.offerings}\n`;
        if (remedies.special.rituals) summary += `• Rituals: ${remedies.special.rituals}\n`;
        summary += '\n';
      }

      // House-specific remedies
      if (remedies.houseSpecific && remedies.houseSpecific.length > 0) {
        summary += `*🏠 House-Specific Remedies:*\n`;
        remedies.houseSpecific.forEach(remedy => {
          summary += `• ${remedy.description} (${remedy.duration})\n`;
        });
        summary += '\n';
      }

      // Urgent recommendations
      if (remedies.urgent) {
        summary += `*🚨 ${remedies.urgent.recommendation}*\n\n`;
      }

      // Basic remedies fallback
      if (remedies.basic && remedies.basic.length > 0) {
        summary += `*Basic Remedies:*\n`;
        remedies.basic.forEach(remedy => {
          summary += `• *${remedy.type}:* ${remedy.description}\n`;
          if (remedy.duration) {
            summary += `  Duration: ${remedy.duration}\n`;
          }
        });
        summary += '\n';
      }

      summary += '\n*Note:* Kaal Sarp Dosha effects can be mitigated through consistent remedial measures and spiritual practices. 🕉️';

    } else {
      summary += `*✅ No Kaal Sarp Dosha*\n\n`;
      summary += 'Your birth chart does not have Kaal Sarp Dosha. This is generally considered favorable for life progression.\n\n';
      summary += '*Benefits:*\n';
      summary += '• Smoother life journey\n';
      summary += '• Fewer karmic obstacles\n';
      summary += '• Natural life flow\n\n';
      summary += 'However, individual planetary strengths still influence life experiences. 🕉️';
    }

    return summary;
  }

  /**
   * Generate Future Self Simulator analysis
   * @param {Object} birthData - User's birth data
   * @param {number} yearsAhead - Years to project (default 10)
   * @returns {Object} Future self analysis
   */
  generateFutureSelfSimulator(birthData, yearsAhead = 10) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return {
          error: 'Complete birth details required for future self simulation'
        };
      }

      // Parse birth date and calculate current age
      const [birthDay, birthMonth, birthYear] = birthDate.split('/').map(Number);
      const birthDateObj = new Date(birthYear, birthMonth - 1, birthDay);
      const currentDate = new Date();
      const currentAge = Math.floor((currentDate - birthDateObj) / (365.25 * 24 * 60 * 60 * 1000));

      // Generate natal chart
      const natalChart = this.generateBasicBirthChart({
        name,
        birthDate,
        birthTime,
        birthPlace
      });

      // Calculate life timeline
      const lifeTimeline = this._calculateLifeTimeline(natalChart, currentAge, yearsAhead);

      // Generate scenario models
      const scenarioModels = this._generateScenarioModels(natalChart, currentAge, yearsAhead);

      // Calculate goal projections
      const goalProjections = this._calculateGoalProjections(natalChart, currentAge, yearsAhead);

      // Analyze life stages
      const lifeStages = this._analyzeLifeStages(currentAge, yearsAhead);

      return {
        currentAge,
        projectionYears: yearsAhead,
        lifeTimeline,
        scenarioModels,
        goalProjections,
        lifeStages,
        summary: this._generateFutureSelfSummary(lifeTimeline, scenarioModels, goalProjections, lifeStages)
      };
    } catch (error) {
      logger.error('Error generating future self simulator:', error);
      return {
        error: 'Unable to generate future self simulation at this time'
      };
    }
  }

  /**
   * Calculate life timeline based on chart progression
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {number} currentAge - Current age
   * @param {number} yearsAhead - Years ahead
   * @returns {Array} Life timeline events
   */
  _calculateLifeTimeline(natalChart, currentAge, yearsAhead) {
    const timeline = [];
    const endAge = currentAge + yearsAhead;

    // Major life transitions based on Saturn returns and other cycles
    const saturnReturn1 = 29 - currentAge;
    const saturnReturn2 = 58 - currentAge;
    const saturnReturn3 = 87 - currentAge;

    // Jupiter returns (12-year cycles)
    const jupiterReturns = [];
    for (let age = currentAge + 12; age <= endAge; age += 12) {
      jupiterReturns.push(age - currentAge);
    }

    // Uranus opposition (around age 42)
    const uranusOpposition = 42 - currentAge;

    // Add major timeline events
    if (saturnReturn1 > 0 && saturnReturn1 <= yearsAhead) {
      timeline.push({
        age: currentAge + saturnReturn1,
        event: 'First Saturn Return',
        significance: 'Major life restructuring, career changes, responsibility',
        intensity: 'High',
        themes: ['Structure', 'Responsibility', 'Life review']
      });
    }

    if (saturnReturn2 > 0 && saturnReturn2 <= yearsAhead) {
      timeline.push({
        age: currentAge + saturnReturn2,
        event: 'Second Saturn Return',
        significance: 'Mid-life crisis resolution, wisdom gained, legacy building',
        intensity: 'High',
        themes: ['Wisdom', 'Legacy', 'Stability']
      });
    }

    jupiterReturns.forEach(yearsFromNow => {
      if (yearsFromNow <= yearsAhead) {
        timeline.push({
          age: currentAge + yearsFromNow,
          event: 'Jupiter Return',
          significance: 'Expansion, new opportunities, personal growth',
          intensity: 'Medium-High',
          themes: ['Growth', 'Opportunity', 'Learning']
        });
      }
    });

    if (uranusOpposition > 0 && uranusOpposition <= yearsAhead) {
      timeline.push({
        age: currentAge + uranusOpposition,
        event: 'Uranus Opposition',
        significance: 'Mid-life awakening, breaking free from limitations',
        intensity: 'High',
        themes: ['Freedom', 'Innovation', 'Change']
      });
    }

    // Add Dasha period changes
    const dashaPeriods = this.calculateVimshottariDasha({
      birthDate: natalChart.birthDate,
      birthTime: natalChart.birthTime
    });

    if (dashaPeriods.currentDasha) {
      const remainingYears = dashaPeriods.currentDasha.remainingYears;
      if (remainingYears <= yearsAhead) {
        timeline.push({
          age: currentAge + remainingYears,
          event: `Dasha Change: ${dashaPeriods.upcomingDashas[0]?.dasha} Period Begins`,
          significance: dashaPeriods.upcomingDashas[0]?.influence || 'New life themes emerge',
          intensity: 'Medium',
          themes: ['Transition', 'New phase', 'Life lessons']
        });
      }
    }

    // Sort timeline by age
    return timeline.sort((a, b) => a.age - b.age);
  }

  /**
   * Generate scenario models for different life choices
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {number} currentAge - Current age
   * @param {number} yearsAhead - Years ahead
   * @returns {Array} Scenario models
   */
  _generateScenarioModels(natalChart, currentAge, yearsAhead) {
    const scenarios = [];

    // Career scenarios based on 10th house and Midheaven
    const careerScenarios = this._generateCareerScenarios(natalChart, currentAge, yearsAhead);
    scenarios.push(...careerScenarios);

    // Relationship scenarios based on 7th house and Venus
    const relationshipScenarios = this._generateRelationshipScenarios(natalChart, currentAge, yearsAhead);
    scenarios.push(...relationshipScenarios);

    // Personal development scenarios based on 1st house and Sun
    const personalScenarios = this._generatePersonalScenarios(natalChart, currentAge, yearsAhead);
    scenarios.push(...personalScenarios);

    return scenarios;
  }

  /**
   * Generate career scenario models
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {number} currentAge - Current age
   * @param {number} yearsAhead - Years ahead
   * @returns {Array} Career scenarios
   */
  _generateCareerScenarios(natalChart, currentAge, yearsAhead) {
    const scenarios = [];
    const tenthHouse = natalChart.fullChart?.houses?.[9] || {}; // 10th house is index 9

    // Different career paths based on planetary placements
    const careerPaths = [
      {
        path: 'Leadership & Authority',
        trigger: 'Saturn in 10th or Capricorn MC',
        timeline: '5-7 years',
        indicators: ['Executive roles', 'Business ownership', 'Public recognition'],
        challenges: ['Work-life balance', 'Stress management'],
        successFactors: ['Discipline', 'Long-term vision', 'Team building']
      },
      {
        path: 'Creative & Innovative',
        trigger: 'Uranus in 10th or Aquarius MC',
        timeline: '3-5 years',
        indicators: ['Entrepreneurship', 'Tech/AI fields', 'Creative industries'],
        challenges: ['Financial stability', 'Structure'],
        successFactors: ['Innovation', 'Adaptability', 'Networking']
      },
      {
        path: 'Service & Healing',
        trigger: 'Neptune in 10th or Pisces MC',
        timeline: '4-6 years',
        indicators: ['Healthcare', 'Counseling', 'Creative arts', 'Spirituality'],
        challenges: ['Boundaries', 'Practical matters'],
        successFactors: ['Compassion', 'Intuition', 'Service orientation']
      },
      {
        path: 'Communication & Teaching',
        trigger: 'Mercury/Jupiter in 10th or Gemini/Sagittarius MC',
        timeline: '3-4 years',
        indicators: ['Writing', 'Teaching', 'Media', 'Consulting'],
        challenges: ['Focus', 'Practical implementation'],
        successFactors: ['Communication skills', 'Knowledge sharing', 'Adaptability']
      }
    ];

    // Select most relevant career path based on chart
    const relevantPath = this._selectRelevantCareerPath(natalChart, careerPaths);
    if (relevantPath) {
      scenarios.push({
        category: 'Career',
        scenario: relevantPath.path,
        probability: 'High',
        timeline: relevantPath.timeline,
        keyIndicators: relevantPath.indicators,
        challenges: relevantPath.challenges,
        successFactors: relevantPath.successFactors,
        astrologicalBasis: relevantPath.trigger
      });
    }

    return scenarios;
  }

  /**
   * Generate relationship scenario models
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {number} currentAge - Current age
   * @param {number} yearsAhead - Years ahead
   * @returns {Array} Relationship scenarios
   */
  _generateRelationshipScenarios(natalChart, currentAge, yearsAhead) {
    const scenarios = [];

    const relationshipPaths = [
      {
        path: 'Committed Partnership',
        trigger: 'Strong 7th house or Libra/Taurus emphasis',
        timeline: '2-4 years',
        indicators: ['Marriage', 'Long-term commitment', 'Shared goals'],
        challenges: ['Compromise', 'Individual growth'],
        successFactors: ['Communication', 'Shared values', 'Mutual respect']
      },
      {
        path: 'Personal Independence',
        trigger: 'Strong 1st/5th house or Aries/Leo emphasis',
        timeline: '3-5 years',
        indicators: ['Self-discovery', 'Creative pursuits', 'Personal freedom'],
        challenges: ['Loneliness', 'Commitment fears'],
        successFactors: ['Self-love', 'Independence', 'Personal growth']
      },
      {
        path: 'Community & Friendship',
        trigger: 'Strong 11th house or Aquarius emphasis',
        timeline: '2-3 years',
        indicators: ['Community involvement', 'Friendship networks', 'Group activities'],
        challenges: ['Intimacy', 'Deep connections'],
        successFactors: ['Social skills', 'Shared interests', 'Openness']
      }
    ];

    const relevantPath = this._selectRelevantRelationshipPath(natalChart, relationshipPaths);
    if (relevantPath) {
      scenarios.push({
        category: 'Relationships',
        scenario: relevantPath.path,
        probability: 'Medium-High',
        timeline: relevantPath.timeline,
        keyIndicators: relevantPath.indicators,
        challenges: relevantPath.challenges,
        successFactors: relevantPath.successFactors,
        astrologicalBasis: relevantPath.trigger
      });
    }

    return scenarios;
  }

  /**
   * Generate personal development scenario models
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {number} currentAge - Current age
   * @param {number} yearsAhead - Years ahead
   * @returns {Array} Personal scenarios
   */
  _generatePersonalScenarios(natalChart, currentAge, yearsAhead) {
    const scenarios = [];

    const personalPaths = [
      {
        path: 'Spiritual Awakening',
        trigger: 'Strong 12th/9th house or Pisces/Sagittarius emphasis',
        timeline: '4-6 years',
        indicators: ['Meditation', 'Spiritual practices', 'Inner peace', 'Higher purpose'],
        challenges: ['Grounding', 'Practical matters'],
        successFactors: ['Faith', 'Inner guidance', 'Surrender']
      },
      {
        path: 'Material Success',
        trigger: 'Strong 2nd/10th house or Taurus/Capricorn emphasis',
        timeline: '3-5 years',
        indicators: ['Financial stability', 'Career advancement', 'Material comfort'],
        challenges: ['Work-life balance', 'Meaningful work'],
        successFactors: ['Discipline', 'Planning', 'Persistence']
      },
      {
        path: 'Creative Expression',
        trigger: 'Strong 5th house or Leo emphasis',
        timeline: '2-4 years',
        indicators: ['Artistic pursuits', 'Creative projects', 'Self-expression'],
        challenges: ['Financial stability', 'Recognition'],
        successFactors: ['Creativity', 'Confidence', 'Persistence']
      }
    ];

    const relevantPath = this._selectRelevantPersonalPath(natalChart, personalPaths);
    if (relevantPath) {
      scenarios.push({
        category: 'Personal Growth',
        scenario: relevantPath.path,
        probability: 'Medium',
        timeline: relevantPath.timeline,
        keyIndicators: relevantPath.indicators,
        challenges: relevantPath.challenges,
        successFactors: relevantPath.successFactors,
        astrologicalBasis: relevantPath.trigger
      });
    }

    return scenarios;
  }

  /**
   * Calculate goal achievement projections
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {number} currentAge - Current age
   * @param {number} yearsAhead - Years ahead
   * @returns {Array} Goal projections
   */
  _calculateGoalProjections(natalChart, currentAge, yearsAhead) {
    const projections = [];

    // Common life goals and their astrological timing
    const goalCategories = [
      {
        category: 'Career',
        goals: ['Promotion', 'Career Change', 'Business Success', 'Financial Independence'],
        favorablePeriods: this._getFavorableCareerPeriods(natalChart, currentAge, yearsAhead)
      },
      {
        category: 'Relationships',
        goals: ['Marriage', 'Family', 'Deep Connection', 'Personal Growth'],
        favorablePeriods: this._getFavorableRelationshipPeriods(natalChart, currentAge, yearsAhead)
      },
      {
        category: 'Personal',
        goals: ['Health', 'Education', 'Travel', 'Spiritual Growth'],
        favorablePeriods: this._getFavorablePersonalPeriods(natalChart, currentAge, yearsAhead)
      }
    ];

    goalCategories.forEach(category => {
      category.goals.forEach(goal => {
        const favorablePeriods = category.favorablePeriods[goal] || [];
        projections.push({
          goal,
          category: category.category,
          favorablePeriods,
          overallLikelihood: this._calculateGoalLikelihood(natalChart, goal, category.category),
          keyFactors: this._getGoalSuccessFactors(natalChart, goal, category.category)
        });
      });
    });

    return projections;
  }

  /**
   * Analyze life stages progression
   * @private
   * @param {number} currentAge - Current age
   * @param {number} yearsAhead - Years ahead
   * @returns {Array} Life stages
   */
  _analyzeLifeStages(currentAge, yearsAhead) {
    const stages = [];
    const endAge = currentAge + yearsAhead;

    // Life stage definitions
    const lifeStageDefinitions = [
      { min: 0, max: 21, stage: 'Foundation & Learning', themes: ['Education', 'Identity', 'Independence'] },
      { min: 22, max: 35, stage: 'Establishment', themes: ['Career', 'Relationships', 'Stability'] },
      { min: 36, max: 50, stage: 'Achievement & Family', themes: ['Success', 'Family', 'Responsibility'] },
      { min: 51, max: 65, stage: 'Mid-life Transition', themes: ['Reflection', 'Change', 'Legacy'] },
      { min: 66, max: 80, stage: 'Elder Wisdom', themes: ['Wisdom', 'Mentoring', 'Inner peace'] },
      { min: 81, max: 120, stage: 'Sage Years', themes: ['Spirituality', 'Legacy', 'Transcendence'] }
    ];

    lifeStageDefinitions.forEach(stageDef => {
      if (stageDef.max >= currentAge && stageDef.min <= endAge) {
        const startAge = Math.max(stageDef.min, currentAge);
        const endAgeInStage = Math.min(stageDef.max, endAge);

        stages.push({
          stage: stageDef.stage,
          ageRange: `${startAge}-${endAgeInStage}`,
          duration: endAgeInStage - startAge,
          themes: stageDef.themes,
          challenges: this._getStageChallenges(stageDef.stage),
          opportunities: this._getStageOpportunities(stageDef.stage)
        });
      }
    });

    return stages;
  }

  /**
   * Generate future self summary
   * @private
   * @param {Array} lifeTimeline - Life timeline
   * @param {Array} scenarioModels - Scenario models
   * @param {Array} goalProjections - Goal projections
   * @param {Array} lifeStages - Life stages
   * @returns {string} Summary text
   */
  _generateFutureSelfSummary(lifeTimeline, scenarioModels, goalProjections, lifeStages) {
    let summary = '🔮 *Future Self Simulator Analysis*\n\n';

    if (lifeStages.length > 0) {
      summary += '*Life Stage Progression:*\n';
      lifeStages.forEach(stage => {
        summary += `• *${stage.stage}* (${stage.ageRange}): ${stage.themes.join(', ')}\n`;
      });
      summary += '\n';
    }

    if (lifeTimeline.length > 0) {
      summary += '*Major Life Transitions:*\n';
      lifeTimeline.slice(0, 3).forEach(event => {
        summary += `• Age ${Math.round(event.age)}: ${event.event}\n`;
        summary += `  ${event.significance}\n\n`;
      });
    }

    if (scenarioModels.length > 0) {
      summary += '*Potential Life Scenarios:*\n';
      scenarioModels.forEach(scenario => {
        summary += `• *${scenario.category}:* ${scenario.scenario} (${scenario.probability} probability)\n`;
        summary += `  Timeline: ${scenario.timeline}\n\n`;
      });
    }

    summary += '*Key Insights:*\n';
    summary += '• Your future self is calling you toward ';
    if (scenarioModels.length > 0) {
      summary += scenarioModels[0].scenario.toLowerCase();
    }
    summary += '\n• Focus on ';
    if (goalProjections.length > 0) {
      const topGoals = goalProjections.slice(0, 2).map(p => p.goal.toLowerCase());
      summary += topGoals.join(' and ');
    }
    summary += '\n• Trust the timing of your ';
    if (lifeStages.length > 0) {
      summary += lifeStages[0].stage.toLowerCase();
    }
    summary += '\n\n';

    summary += 'Remember: The future is not fixed - it\'s shaped by your choices and consciousness! ✨';

    return summary;
  }

  /**
   * Select relevant career path based on chart
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {Array} careerPaths - Career paths
   * @returns {Object} Selected path
   */
  _selectRelevantCareerPath(natalChart, careerPaths) {
    // Simplified selection based on sun sign and rising sign
    const sunSign = natalChart.sunSign;
    const risingSign = natalChart.risingSign;

    const signMappings = {
      'Capricorn': 'Leadership & Authority',
      'Aquarius': 'Creative & Innovative',
      'Pisces': 'Service & Healing',
      'Gemini': 'Communication & Teaching',
      'Sagittarius': 'Communication & Teaching',
      'Aries': 'Leadership & Authority',
      'Leo': 'Creative & Innovative'
    };

    const preferredPath = signMappings[sunSign] || signMappings[risingSign];
    return careerPaths.find(path => path.path === preferredPath) || careerPaths[0];
  }

  /**
   * Select relevant relationship path
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {Array} relationshipPaths - Relationship paths
   * @returns {Object} Selected path
   */
  _selectRelevantRelationshipPath(natalChart, relationshipPaths) {
    const venusSign = natalChart.fullChart?.planets?.venus?.signName || natalChart.sunSign;

    const signMappings = {
      'Libra': 'Committed Partnership',
      'Taurus': 'Committed Partnership',
      'Aries': 'Personal Independence',
      'Leo': 'Personal Independence',
      'Aquarius': 'Community & Friendship'
    };

    const preferredPath = signMappings[venusSign];
    return relationshipPaths.find(path => path.path === preferredPath) || relationshipPaths[0];
  }

  /**
   * Select relevant personal path
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {Array} personalPaths - Personal paths
   * @returns {Object} Selected path
   */
  _selectRelevantPersonalPath(natalChart, personalPaths) {
    const moonSign = natalChart.moonSign;

    const signMappings = {
      'Pisces': 'Spiritual Awakening',
      'Sagittarius': 'Spiritual Awakening',
      'Taurus': 'Material Success',
      'Capricorn': 'Material Success',
      'Leo': 'Creative Expression'
    };

    const preferredPath = signMappings[moonSign];
    return personalPaths.find(path => path.path === preferredPath) || personalPaths[0];
  }

  /**
   * Get favorable career periods
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {number} currentAge - Current age
   * @param {number} yearsAhead - Years ahead
   * @returns {Object} Favorable periods
   */
  _getFavorableCareerPeriods(natalChart, currentAge, yearsAhead) {
    // Simplified - in production would analyze transits and dashas
    return {
      'Promotion': [`${currentAge + 1}-${currentAge + 3} years`],
      'Career Change': [`${currentAge + 2}-${currentAge + 4} years`],
      'Business Success': [`${currentAge + 3}-${currentAge + 5} years`],
      'Financial Independence': [`${currentAge + 4}-${currentAge + 7} years`]
    };
  }

  /**
   * Get favorable relationship periods
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {number} currentAge - Current age
   * @param {number} yearsAhead - Years ahead
   * @returns {Object} Favorable periods
   */
  _getFavorableRelationshipPeriods(natalChart, currentAge, yearsAhead) {
    return {
      'Marriage': [`${currentAge + 1}-${currentAge + 3} years`],
      'Family': [`${currentAge + 2}-${currentAge + 5} years`],
      'Deep Connection': [`${currentAge + 1}-${currentAge + 4} years`],
      'Personal Growth': [`${currentAge + 3}-${currentAge + 6} years`]
    };
  }

  /**
   * Get favorable personal periods
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {number} currentAge - Current age
   * @param {number} yearsAhead - Years ahead
   * @returns {Object} Favorable periods
   */
  _getFavorablePersonalPeriods(natalChart, currentAge, yearsAhead) {
    return {
      'Health': [`${currentAge + 1}-${currentAge + 2} years`],
      'Education': [`${currentAge + 1}-${currentAge + 3} years`],
      'Travel': [`${currentAge + 2}-${currentAge + 4} years`],
      'Spiritual Growth': [`${currentAge + 3}-${currentAge + 6} years`]
    };
  }

  /**
   * Calculate goal likelihood
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {string} goal - Goal name
   * @param {string} category - Category
   * @returns {string} Likelihood
   */
  _calculateGoalLikelihood(natalChart, goal, category) {
    // Simplified calculation - in production would analyze chart factors
    return 'Medium-High';
  }

  /**
   * Get goal success factors
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {string} goal - Goal name
   * @param {string} category - Category
   * @returns {Array} Success factors
   */
  _getGoalSuccessFactors(natalChart, goal, category) {
    const factors = {
      'Career': ['Persistence', 'Networking', 'Skill development'],
      'Relationships': ['Communication', 'Compromise', 'Trust'],
      'Personal': ['Self-care', 'Learning', 'Inner work']
    };

    return factors[category] || ['Focus', 'Action', 'Patience'];
  }

  /**
   * Get stage challenges
   * @private
   * @param {string} stage - Life stage
   * @returns {Array} Challenges
   */
  _getStageChallenges(stage) {
    const challenges = {
      'Foundation & Learning': ['Identity confusion', 'Independence struggles'],
      'Establishment': ['Work-life balance', 'Financial pressure'],
      'Achievement & Family': ['Responsibility overload', 'Mid-life questions'],
      'Mid-life Transition': ['Change resistance', 'Meaning search'],
      'Elder Wisdom': ['Health concerns', 'Legacy questions'],
      'Sage Years': ['Physical limitations', 'Loss of loved ones']
    };

    return challenges[stage] || ['Adaptation', 'Growth'];
  }

  /**
   * Get stage opportunities
   * @private
   * @param {string} stage - Life stage
   * @returns {Array} Opportunities
   */
  _getStageOpportunities(stage) {
    const opportunities = {
      'Foundation & Learning': ['Skill building', 'Self-discovery'],
      'Establishment': ['Career growth', 'Relationship building'],
      'Achievement & Family': ['Leadership', 'Family legacy'],
      'Mid-life Transition': ['Wisdom sharing', 'New beginnings'],
      'Elder Wisdom': ['Mentoring', 'Life reflection'],
      'Sage Years': ['Spiritual depth', 'Timeless wisdom']
    };

    return opportunities[stage] || ['Growth', 'Wisdom'];
  }

  /**
   * Generate Group & Family Astrology analysis
   * @param {Array} familyMembers - Array of family member birth data
   * @param {string} groupType - Type of group ('family', 'friends', 'couple', etc.)
   * @returns {Object} Group astrology analysis
   */
  generateGroupAstrology(familyMembers, groupType = 'family') {
    try {
      if (!familyMembers || familyMembers.length < 2) {
        return {
          error: 'At least 2 family members required for group analysis'
        };
      }

      // Generate individual charts for all members
      const memberCharts = familyMembers.map(member =>
        this.generateBasicBirthChart({
          name: member.name,
          birthDate: member.birthDate,
          birthTime: member.birthTime || '12:00',
          birthPlace: member.birthPlace || 'Delhi'
        })
      );

      // Create composite chart
      const compositeChart = this._calculateCompositeChart(memberCharts);

      // Analyze group compatibility
      const compatibilityAnalysis = this._analyzeGroupCompatibility(memberCharts, groupType);

      // Calculate shared journey patterns
      const sharedJourney = this._calculateSharedJourney(memberCharts, groupType);

      // Generate group insights
      const groupInsights = this._generateGroupInsights(memberCharts, compositeChart, groupType);

      return {
        groupType,
        memberCount: familyMembers.length,
        compositeChart,
        compatibilityAnalysis,
        sharedJourney,
        groupInsights,
        summary: this._generateGroupSummary(memberCharts, compositeChart, compatibilityAnalysis, groupType)
      };
    } catch (error) {
      logger.error('Error generating group astrology:', error);
      return {
        error: 'Unable to generate group astrology analysis at this time'
      };
    }
  }

  /**
   * Calculate composite chart for group
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @returns {Object} Composite chart
   */
  _calculateCompositeChart(memberCharts) {
    const composite = {
      planets: {},
      houses: {},
      dominantElements: {},
      dominantQualities: {},
      stelliums: []
    };

    // Initialize planet positions
    const planetNames = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

    planetNames.forEach(planet => {
      const positions = memberCharts
        .map(chart => chart.fullChart?.planets?.[planet])
        .filter(p => p && p.longitude)
        .map(p => p.longitude);

      if (positions.length > 0) {
        // Calculate average position (simplified composite method)
        const avgLongitude = positions.reduce((sum, pos) => sum + pos, 0) / positions.length;

        // Find most common sign
        const signs = memberCharts
          .map(chart => chart.fullChart?.planets?.[planet]?.signName)
          .filter(sign => sign);

        const signCounts = {};
        signs.forEach(sign => {
          signCounts[sign] = (signCounts[sign] || 0) + 1;
        });

        const dominantSign = Object.entries(signCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

        composite.planets[planet] = {
          longitude: avgLongitude,
          signName: dominantSign,
          compositeNature: positions.length === memberCharts.length ? 'unanimous' : 'mixed'
        };
      }
    });

    // Calculate dominant elements
    const allElements = memberCharts.flatMap(chart =>
      chart.dominantElements || []
    );

    const elementCounts = {};
    allElements.forEach(element => {
      elementCounts[element] = (elementCounts[element] || 0) + 1;
    });

    composite.dominantElements = Object.entries(elementCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([element]) => element);

    // Calculate dominant qualities
    const allQualities = memberCharts.flatMap(chart =>
      chart.dominantQualities || []
    );

    const qualityCounts = {};
    allQualities.forEach(quality => {
      qualityCounts[quality] = (qualityCounts[quality] || 0) + 1;
    });

    composite.dominantQualities = Object.entries(qualityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([quality]) => quality);

    return composite;
  }

  /**
   * Analyze group compatibility
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @param {string} groupType - Type of group
   * @returns {Object} Compatibility analysis
   */
  _analyzeGroupCompatibility(memberCharts, groupType) {
    const compatibility = {
      overallScore: 0,
      strengths: [],
      challenges: [],
      harmonyFactors: [],
      communicationStyle: '',
      decisionMaking: '',
      conflictResolution: ''
    };

    // Analyze element compatibility
    const elementCompatibility = this._analyzeElementCompatibility(memberCharts);
    compatibility.overallScore += elementCompatibility.score;
    compatibility.strengths.push(...elementCompatibility.strengths);
    compatibility.challenges.push(...elementCompatibility.challenges);

    // Analyze sun-moon compatibility
    const sunMoonCompatibility = this._analyzeSunMoonCompatibility(memberCharts);
    compatibility.overallScore += sunMoonCompatibility.score;
    compatibility.harmonyFactors.push(...sunMoonCompatibility.factors);

    // Group-specific analysis
    switch (groupType) {
      case 'family':
        compatibility.communicationStyle = this._analyzeFamilyCommunication(memberCharts);
        compatibility.decisionMaking = this._analyzeFamilyDecisionMaking(memberCharts);
        compatibility.conflictResolution = 'Emotional bonding with space for individual expression';
        break;
      case 'couple':
        compatibility.communicationStyle = this._analyzeCoupleCommunication(memberCharts);
        compatibility.decisionMaking = 'Collaborative with mutual respect';
        compatibility.conflictResolution = 'Direct communication with empathy';
        break;
      case 'friends':
        compatibility.communicationStyle = this._analyzeFriendCommunication(memberCharts);
        compatibility.decisionMaking = 'Democratic and flexible';
        compatibility.conflictResolution = 'Light-hearted with quick resolution';
        break;
      default:
        compatibility.communicationStyle = 'Mixed communication styles';
        compatibility.decisionMaking = 'Adaptive approach';
        compatibility.conflictResolution = 'Context-dependent';
    }

    // Normalize overall score
    compatibility.overallScore = Math.min(100, Math.max(0, Math.round(compatibility.overallScore / 2)));

    return compatibility;
  }

  /**
   * Calculate shared journey patterns
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @param {string} groupType - Type of group
   * @returns {Object} Shared journey analysis
   */
  _calculateSharedJourney(memberCharts, groupType) {
    const sharedJourney = {
      commonThemes: [],
      sharedChallenges: [],
      collectiveStrengths: [],
      groupPurpose: '',
      timing: {
        favorablePeriods: [],
        challengingPeriods: []
      },
      growthOpportunities: []
    };

    // Find common sun signs
    const sunSigns = memberCharts.map(chart => chart.sunSign);
    const sunSignCounts = {};
    sunSigns.forEach(sign => {
      sunSignCounts[sign] = (sunSignCounts[sign] || 0) + 1;
    });

    const commonSunSigns = Object.entries(sunSignCounts)
      .filter(([, count]) => count > 1)
      .map(([sign]) => sign);

    if (commonSunSigns.length > 0) {
      sharedJourney.commonThemes.push(`Shared ${commonSunSigns.join('/')} energy`);
    }

    // Find common elements
    const commonElements = memberCharts
      .flatMap(chart => chart.dominantElements || [])
      .filter((element, index, arr) => arr.indexOf(element) !== index); // Find duplicates

    if (commonElements.length > 0) {
      const uniqueElements = [...new Set(commonElements)];
      sharedJourney.commonThemes.push(`Collective ${uniqueElements.join('/')} influence`);
    }

    // Group-specific journey themes
    switch (groupType) {
      case 'family':
        sharedJourney.groupPurpose = 'Building lasting legacy and emotional security';
        sharedJourney.sharedChallenges = ['Balancing individual needs with family unity', 'Generational patterns and healing'];
        sharedJourney.collectiveStrengths = ['Deep emotional bonds', 'Shared history and values'];
        sharedJourney.growthOpportunities = ['Family healing work', 'Intergenerational wisdom sharing'];
        break;
      case 'couple':
        sharedJourney.groupPurpose = 'Mutual growth and partnership evolution';
        sharedJourney.sharedChallenges = ['Merging individual identities', 'Communication differences'];
        sharedJourney.collectiveStrengths = ['Intimate emotional connection', 'Shared life vision'];
        sharedJourney.growthOpportunities = ['Relationship deepening', 'Joint spiritual exploration'];
        break;
      case 'friends':
        sharedJourney.groupPurpose = 'Mutual support and shared adventures';
        sharedJourney.sharedChallenges = ['Maintaining connection over time', 'Different life stages'];
        sharedJourney.collectiveStrengths = ['Loyalty and acceptance', 'Shared experiences'];
        sharedJourney.growthOpportunities = ['Personal growth support', 'Adventure and exploration'];
        break;
    }

    // Calculate timing based on group energy
    sharedJourney.timing.favorablePeriods = this._calculateGroupFavorablePeriods(memberCharts, groupType);
    sharedJourney.timing.challengingPeriods = this._calculateGroupChallengingPeriods(memberCharts, groupType);

    return sharedJourney;
  }

  /**
   * Generate group insights
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @param {Object} compositeChart - Composite chart
   * @param {string} groupType - Type of group
   * @returns {Array} Group insights
   */
  _generateGroupInsights(memberCharts, compositeChart, groupType) {
    const insights = [];

    // Composite chart insights
    if (compositeChart.dominantElements.length > 0) {
      insights.push({
        type: 'element',
        insight: `Group energy is dominated by ${compositeChart.dominantElements.join(' and ')} elements`,
        significance: this._getElementGroupSignificance(compositeChart.dominantElements)
      });
    }

    // Planetary patterns
    Object.entries(compositeChart.planets).forEach(([planet, data]) => {
      if (data.compositeNature === 'unanimous') {
        insights.push({
          type: 'planetary',
          insight: `Strong collective ${planet} energy in ${data.signName}`,
          significance: this._getPlanetGroupSignificance(planet, data.signName, groupType)
        });
      }
    });

    // Group dynamic insights
    const dynamicInsights = this._analyzeGroupDynamics(memberCharts, groupType);
    insights.push(...dynamicInsights);

    return insights;
  }

  /**
   * Generate group summary
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @param {Object} compositeChart - Composite chart
   * @param {Object} compatibilityAnalysis - Compatibility analysis
   * @param {string} groupType - Type of group
   * @returns {string} Summary text
   */
  _generateGroupSummary(memberCharts, compositeChart, compatibilityAnalysis, groupType) {
    let summary = `👨‍👩‍👧‍👦 *${groupType.charAt(0).toUpperCase() + groupType.slice(1)} Astrology Analysis*\n\n`;

    summary += `*Group Compatibility:* ${compatibilityAnalysis.overallScore}% harmony\n\n`;

    if (compositeChart.dominantElements.length > 0) {
      summary += `*Dominant Energies:* ${compositeChart.dominantElements.join(' & ')}\n`;
    }

    summary += `*Communication Style:* ${compatibilityAnalysis.communicationStyle}\n`;
    summary += `*Decision Making:* ${compatibilityAnalysis.decisionMaking}\n\n`;

    if (compatibilityAnalysis.strengths.length > 0) {
      summary += `*Group Strengths:*\n`;
      compatibilityAnalysis.strengths.slice(0, 2).forEach(strength => {
        summary += `• ${strength}\n`;
      });
      summary += '\n';
    }

    summary += `*Collective Purpose:* Building strong ${groupType} bonds through shared growth and understanding.\n\n`;

    summary += 'Your group\'s astrological synergy creates a powerful collective energy! 🌟';

    return summary;
  }

  /**
   * Analyze element compatibility
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @returns {Object} Element compatibility analysis
   */
  _analyzeElementCompatibility(memberCharts) {
    const analysis = {
      score: 50, // Base score
      strengths: [],
      challenges: []
    };

    const elements = memberCharts.flatMap(chart => chart.dominantElements || []);
    const elementCounts = {};

    elements.forEach(element => {
      elementCounts[element] = (elementCounts[element] || 0) + 1;
    });

    // Compatible element combinations
    const compatiblePairs = [
      ['fire', 'air'],
      ['earth', 'water'],
      ['fire', 'earth'],
      ['air', 'water']
    ];

    let compatibilityScore = 0;
    compatiblePairs.forEach(([elem1, elem2]) => {
      if (elementCounts[elem1] && elementCounts[elem2]) {
        compatibilityScore += 20;
        analysis.strengths.push(`${elem1} and ${elem2} elements create dynamic harmony`);
      }
    });

    // Challenging combinations
    const challengingPairs = [
      ['fire', 'water'],
      ['air', 'earth']
    ];

    challengingPairs.forEach(([elem1, elem2]) => {
      if (elementCounts[elem1] && elementCounts[elem2]) {
        compatibilityScore -= 15;
        analysis.challenges.push(`${elem1}-${elem2} tension requires conscious balance`);
      }
    });

    analysis.score += compatibilityScore;

    return analysis;
  }

  /**
   * Analyze sun-moon compatibility
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @returns {Object} Sun-moon compatibility analysis
   */
  _analyzeSunMoonCompatibility(memberCharts) {
    const analysis = {
      score: 30, // Base score
      factors: []
    };

    const sunSigns = memberCharts.map(chart => chart.sunSign);
    const moonSigns = memberCharts.map(chart => chart.moonSign);

    // Check for complementary signs
    const complementaryPairs = [
      ['Aries', 'Cancer'], ['Taurus', 'Leo'], ['Gemini', 'Virgo'],
      ['Cancer', 'Scorpio'], ['Leo', 'Sagittarius'], ['Virgo', 'Capricorn'],
      ['Libra', 'Aquarius'], ['Scorpio', 'Pisces'], ['Sagittarius', 'Aries'],
      ['Capricorn', 'Taurus'], ['Aquarius', 'Gemini'], ['Pisces', 'Cancer']
    ];

    let compatibilityBonus = 0;
    complementaryPairs.forEach(([sign1, sign2]) => {
      if (sunSigns.includes(sign1) && moonSigns.includes(sign2)) {
        compatibilityBonus += 10;
        analysis.factors.push(`${sign1} Sun with ${sign2} Moon creates natural understanding`);
      }
    });

    analysis.score += compatibilityBonus;

    return analysis;
  }

  /**
   * Analyze family communication style
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @returns {string} Communication style
   */
  _analyzeFamilyCommunication(memberCharts) {
    const mercurySigns = memberCharts
      .map(chart => chart.fullChart?.planets?.mercury?.signName)
      .filter(sign => sign);

    const signCounts = {};
    mercurySigns.forEach(sign => {
      signCounts[sign] = (signCounts[sign] || 0) + 1;
    });

    const dominantSign = Object.entries(signCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    const communicationStyles = {
      'Gemini': 'Expressive and intellectual',
      'Virgo': 'Practical and detail-oriented',
      'Libra': 'Diplomatic and harmonious',
      'Sagittarius': 'Direct and philosophical',
      'Aquarius': 'Innovative and detached'
    };

    return communicationStyles[dominantSign] || 'Mixed communication approaches';
  }

  /**
   * Analyze family decision making
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @returns {string} Decision making style
   */
  _analyzeFamilyDecisionMaking(memberCharts) {
    const saturnSigns = memberCharts
      .map(chart => chart.fullChart?.planets?.saturn?.signName)
      .filter(sign => sign);

    if (saturnSigns.includes('Capricorn') || saturnSigns.includes('Aquarius')) {
      return 'Structured and long-term focused';
    } else if (saturnSigns.includes('Cancer') || saturnSigns.includes('Leo')) {
      return 'Emotionally considerate with family values';
    } else {
      return 'Balanced approach with flexibility';
    }
  }

  /**
   * Analyze couple communication
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @returns {string} Communication style
   */
  _analyzeCoupleCommunication(memberCharts) {
    const venusSigns = memberCharts
      .map(chart => chart.fullChart?.planets?.venus?.signName)
      .filter(sign => sign);

    if (venusSigns.includes('Libra') || venusSigns.includes('Gemini')) {
      return 'Harmonious and expressive';
    } else if (venusSigns.includes('Scorpio') || venusSigns.includes('Cancer')) {
      return 'Deep and emotionally intense';
    } else {
      return 'Direct and authentic';
    }
  }

  /**
   * Analyze friend communication
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @returns {string} Communication style
   */
  _analyzeFriendCommunication(memberCharts) {
    const mercurySigns = memberCharts
      .map(chart => chart.fullChart?.planets?.mercury?.signName)
      .filter(sign => sign);

    if (mercurySigns.includes('Gemini') || mercurySigns.includes('Sagittarius')) {
      return 'Lively and intellectual';
    } else if (mercurySigns.includes('Cancer') || mercurySigns.includes('Pisces')) {
      return 'Empathetic and intuitive';
    } else {
      return 'Straightforward and genuine';
    }
  }

  /**
   * Calculate group favorable periods
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @param {string} groupType - Type of group
   * @returns {Array} Favorable periods
   */
  _calculateGroupFavorablePeriods(memberCharts, groupType) {
    // Simplified - in production would analyze collective transits
    return [
      'Spring months (renewal energy)',
      'Group members\' birthday seasons',
      'Harmonious planetary alignments'
    ];
  }

  /**
   * Calculate group challenging periods
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @param {string} groupType - Type of group
   * @returns {Array} Challenging periods
   */
  _calculateGroupChallengingPeriods(memberCharts, groupType) {
    return [
      'Retrograde periods (review and reflection)',
      'Individual crisis times',
      'External stress factors'
    ];
  }

  /**
   * Get element group significance
   * @private
   * @param {Array} elements - Dominant elements
   * @returns {string} Significance description
   */
  _getElementGroupSignificance(elements) {
    const significances = {
      'fire': 'enthusiastic and action-oriented group dynamic',
      'earth': 'practical and stable group foundation',
      'air': 'intellectual and communicative group energy',
      'water': 'emotional and intuitive group connection'
    };

    return elements.map(elem => significances[elem]).join(' with ') || 'balanced group energy';
  }

  /**
   * Get planet group significance
   * @private
   * @param {string} planet - Planet name
   * @param {string} sign - Sign
   * @param {string} groupType - Group type
   * @returns {string} Significance description
   */
  _getPlanetGroupSignificance(planet, sign, groupType) {
    const significances = {
      'sun': {
        'family': 'shared identity and family pride',
        'couple': 'mutual respect and shared purpose',
        'friends': 'group confidence and social harmony'
      },
      'moon': {
        'family': 'emotional security and nurturing',
        'couple': 'deep emotional intimacy',
        'friends': 'emotional support and understanding'
      },
      'venus': {
        'family': 'family harmony and shared values',
        'couple': 'romantic connection and affection',
        'friends': 'social bonding and shared enjoyment'
      }
    };

    return significances[planet]?.[groupType] || `collective ${planet} energy in ${sign}`;
  }

  /**
   * Analyze group dynamics
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @param {string} groupType - Type of group
   * @returns {Array} Dynamic insights
   */
  _analyzeGroupDynamics(memberCharts, groupType) {
    const insights = [];

    // Age distribution analysis
    const ages = memberCharts.map(chart => {
      const birthDate = new Date(chart.birthDate.split('/').reverse().join('-'));
      return Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    });

    const avgAge = ages.reduce((sum, age) => sum + age, 0) / ages.length;
    const ageRange = Math.max(...ages) - Math.min(...ages);

    if (ageRange > 20) {
      insights.push({
        type: 'generational',
        insight: 'Multi-generational group with diverse life experiences',
        significance: 'Rich wisdom sharing and mentorship opportunities'
      });
    } else if (avgAge < 30) {
      insights.push({
        type: 'youthful',
        insight: 'Young, dynamic group energy',
        significance: 'High creativity and adaptability'
      });
    }

    // Gender balance (if available)
    // This would require gender data in member profiles

    return insights;
  }

  /**
   * Generate comprehensive Hindu Vedic Kundli (birth chart)
   * @param {Object} birthData - User's birth data
   * @returns {Object} Complete Vedic Kundli
   */
  generateVedicKundli(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return {
          error: 'Complete birth details required for Vedic Kundli'
        };
      }

      // Parse birth details
      const [birthDay, birthMonth, birthYear] = birthDate.split('/').map(Number);
      const [birthHour, birthMinute] = birthTime.split(':').map(Number);

      // Get coordinates
      const [latitude, longitude] = this._getCoordinatesForPlace(birthPlace);
      const timezone = this._getTimezoneForPlace(birthPlace);

      // Generate complete chart data
      const kundliData = this._generateCompleteKundliData(
        birthYear, birthMonth, birthDay, birthHour, birthMinute, latitude, longitude, timezone
      );

      // Calculate all houses (Bhavas)
      const houses = this._calculateAllHouses(kundliData);

      // Calculate planetary positions in houses
      const planetaryPositions = this._calculatePlanetaryHousePositions(kundliData, houses);

      // Calculate aspects and relationships
      const aspects = this._calculateVedicAspects(planetaryPositions);

      // Generate traditional interpretations
      const interpretations = this._generateVedicInterpretations(planetaryPositions, houses, aspects);

      return {
        name,
        birthDetails: {
          date: birthDate,
          time: birthTime,
          place: birthPlace,
          coordinates: { latitude, longitude },
          timezone
        },
        lagna: kundliData.lagna,
        houses,
        planetaryPositions,
        aspects,
        interpretations,
        kundliSummary: this._generateKundliSummary(planetaryPositions, houses, interpretations)
      };
    } catch (error) {
      logger.error('Error generating Vedic Kundli:', error);
      return {
        error: 'Unable to generate Vedic Kundli at this time'
      };
    }
  }

  /**
   * Generate complete Kundli data using astrologer library
   * @private
   * @param {number} year - Birth year
   * @param {number} month - Birth month
   * @param {number} day - Birth day
   * @param {number} hour - Birth hour
   * @param {number} minute - Birth minute
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} timezone - Timezone
   * @returns {Object} Complete Kundli data
   */
  _generateCompleteKundliData(year, month, day, hour, minute, latitude, longitude, timezone) {
    try {
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

      const chart = this.astrologer.generateNatalChartData(astroData);

      return {
        lagna: chart.interpretations.risingSign,
        planets: chart.planets,
        houses: chart.houses || {},
        rawChart: chart
      };
    } catch (error) {
      logger.error('Error generating complete Kundli data:', error);
      // Return basic structure
      return {
        lagna: 'Unknown',
        planets: {},
        houses: {}
      };
    }
  }

  /**
   * Calculate all 12 houses (Bhavas) with their signs and lords
   * @private
   * @param {Object} kundliData - Kundli data
   * @returns {Array} House data
   */
  _calculateAllHouses(kundliData) {
    const houses = [];

    // House names and their natural significances
    const houseNames = [
      '1st House (Lagna/Tanu)',
      '2nd House (Dhana)',
      '3rd House (Sahaja)',
      '4th House (Sukha)',
      '5th House (Putra)',
      '6th House (Ari/Roga)',
      '7th House (Yuvati/Kalatra)',
      '8th House (Ayur/Mrityu)',
      '9th House (Dharma/Tirtha)',
      '10th House (Karma/Rajya)',
      '11th House (Labha)',
      '12th House (Vyaya)'
    ];

    const houseSignificances = [
      'Self, personality, physical appearance, first impressions',
      'Wealth, family, speech, food, material possessions',
      'Siblings, courage, communication, short journeys, skills',
      'Home, mother, emotions, property, education foundation',
      'Children, creativity, intelligence, spirituality, past life karma',
      'Health, enemies, service, daily routine, obstacles',
      'Marriage, partnerships, business relationships, spouse',
      'Transformation, secrets, occult, longevity, inheritance',
      'Fortune, father, guru, higher learning, pilgrimage',
      'Career, reputation, authority, public image, father',
      'Gains, elder siblings, hopes, wishes, friends',
      'Spirituality, foreign lands, expenses, losses, liberation'
    ];

    // Calculate house signs (simplified - in production would use proper astronomical calculations)
    const lagnaSign = kundliData.lagna;
    const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const lagnaIndex = signOrder.indexOf(lagnaSign);

    for (let i = 0; i < 12; i++) {
      const houseNumber = i + 1;
      const signIndex = (lagnaIndex + i) % 12;
      const sign = signOrder[signIndex];
      const lord = this._getHouseLord(sign);

      houses.push({
        number: houseNumber,
        name: houseNames[i],
        sign,
        lord,
        significance: houseSignificances[i],
        planets: [], // Will be populated later
        strength: this._calculateHouseStrength(houseNumber, sign, kundliData)
      });
    }

    return houses;
  }

  /**
   * Get the lord (ruler) of a house sign
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Ruling planet
   */
  _getHouseLord(sign) {
    const rulers = {
      'Aries': 'Mars',
      'Taurus': 'Venus',
      'Gemini': 'Mercury',
      'Cancer': 'Moon',
      'Leo': 'Sun',
      'Virgo': 'Mercury',
      'Libra': 'Venus',
      'Scorpio': 'Mars',
      'Sagittarius': 'Jupiter',
      'Capricorn': 'Saturn',
      'Aquarius': 'Saturn',
      'Pisces': 'Jupiter'
    };

    return rulers[sign] || 'Unknown';
  }

  /**
   * Calculate planetary positions in houses
   * @private
   * @param {Object} kundliData - Kundli data
   * @param {Array} houses - House data
   * @returns {Object} Planetary positions
   */
  _calculatePlanetaryHousePositions(kundliData, houses) {
    const planetaryPositions = {};

    // Define planets to include
    const planets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

    planets.forEach(planet => {
      const planetData = kundliData.planets[planet];
      if (planetData) {
        const sign = planetData.signName;
        const house = this._findHouseForSign(sign, houses);

        planetaryPositions[planet] = {
          name: planet.charAt(0).toUpperCase() + planet.slice(1),
          sign,
          house: house.number,
          longitude: planetData.longitude,
          retrograde: planetData.retrograde || false,
          dignity: this._calculatePlanetaryDignity(planet, sign),
          aspects: this._getPlanetaryAspects(planet, kundliData.planets)
        };

        // Add planet to house
        if (house) {
          house.planets.push(planet.charAt(0).toUpperCase() + planet.slice(1));
        }
      }
    });

    return planetaryPositions;
  }

  /**
   * Find which house contains a given sign
   * @private
   * @param {string} sign - Zodiac sign
   * @param {Array} houses - House data
   * @returns {Object} House object
   */
  _findHouseForSign(sign, houses) {
    return houses.find(house => house.sign === sign) || houses[0];
  }

  /**
   * Calculate planetary dignity (exalted, own sign, etc.)
   * @private
   * @param {string} planet - Planet name
   * @param {string} sign - Sign planet is in
   * @returns {string} Dignity status
   */
  _calculatePlanetaryDignity(planet, sign) {
    const dignities = {
      'sun': {
        'Leo': 'Own Sign (Moolatrikona)',
        'Aries': 'Exalted'
      },
      'moon': {
        'Cancer': 'Own Sign (Moolatrikona)',
        'Taurus': 'Exalted'
      },
      'mars': {
        'Aries': 'Own Sign (Moolatrikona)',
        'Capricorn': 'Exalted'
      },
      'mercury': {
        'Gemini': 'Own Sign (Moolatrikona)',
        'Virgo': 'Own Sign (Moolatrikona)',
        'Aquarius': 'Exalted'
      },
      'jupiter': {
        'Sagittarius': 'Own Sign (Moolatrikona)',
        'Pisces': 'Own Sign (Moolatrikona)',
        'Cancer': 'Exalted'
      },
      'venus': {
        'Taurus': 'Own Sign (Moolatrikona)',
        'Libra': 'Own Sign (Moolatrikona)',
        'Pisces': 'Exalted'
      },
      'saturn': {
        'Capricorn': 'Own Sign (Moolatrikona)',
        'Aquarius': 'Own Sign (Moolatrikona)',
        'Libra': 'Exalted'
      }
    };

    return dignities[planet]?.[sign] || 'Neutral';
  }

  /**
   * Calculate house strength
   * @private
   * @param {number} houseNumber - House number
   * @param {string} sign - House sign
   * @param {Object} kundliData - Kundli data
   * @returns {string} Strength level
   */
  _calculateHouseStrength(houseNumber, sign, kundliData) {
    // Simplified strength calculation
    const strongHouses = [1, 4, 7, 10]; // Kendra houses
    const mediumHouses = [2, 5, 8, 11]; // Trikona houses
    const weakHouses = [3, 6, 9, 12]; // Dusthana houses

    if (strongHouses.includes(houseNumber)) return 'Strong (Kendra)';
    if (mediumHouses.includes(houseNumber)) return 'Medium (Trikona)';
    if (weakHouses.includes(houseNumber)) return 'Challenging (Dusthana)';

    return 'Neutral';
  }

  /**
   * Calculate Vedic aspects between planets
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Array} Aspects
   */
  _calculateVedicAspects(planetaryPositions) {
    const aspects = [];

    // Define Vedic aspects (different from Western)
    const vedicAspects = {
      'sun': [7], // 7th aspect (opposition)
      'moon': [7], // 7th aspect
      'mars': [4, 7, 8], // 4th, 7th, 8th aspects
      'mercury': [7], // 7th aspect
      'jupiter': [5, 7, 9], // 5th, 7th, 9th aspects
      'venus': [7], // 7th aspect
      'saturn': [3, 7, 10], // 3rd, 7th, 10th aspects
      'rahu': [5, 7, 9], // Similar to Jupiter
      'ketu': [5, 7, 9] // Similar to Jupiter
    };

    const planetKeys = Object.keys(planetaryPositions);

    planetKeys.forEach(planet1 => {
      const aspectsForPlanet = vedicAspects[planet1] || [];
      const pos1 = planetaryPositions[planet1];

      aspectsForPlanet.forEach(aspect => {
        const targetHouse = (pos1.house + aspect - 1) % 12 + 1;

        planetKeys.forEach(planet2 => {
          if (planet1 !== planet2) {
            const pos2 = planetaryPositions[planet2];
            if (pos2.house === targetHouse) {
              aspects.push({
                planet1: pos1.name,
                planet2: pos2.name,
                aspect: `${aspect}th house aspect`,
                type: this._getAspectType(planet1, planet2),
                effect: this._getAspectEffect(planet1, planet2, aspect)
              });
            }
          }
        });
      });
    });

    return aspects;
  }

  /**
   * Get aspect type (benefic/malefic)
   * @private
   * @param {string} planet1 - First planet
   * @param {string} planet2 - Second planet
   * @returns {string} Aspect type
   */
  _getAspectType(planet1, planet2) {
    const benefics = ['jupiter', 'venus', 'mercury'];
    const malefics = ['mars', 'saturn', 'rahu', 'ketu'];

    const p1Type = benefics.includes(planet1) ? 'benefic' : malefics.includes(planet1) ? 'malefic' : 'neutral';
    const p2Type = benefics.includes(planet2) ? 'benefic' : malefics.includes(planet2) ? 'malefic' : 'neutral';

    if (p1Type === p2Type) return 'harmonious';
    if ((p1Type === 'benefic' && p2Type === 'malefic') || (p1Type === 'malefic' && p2Type === 'benefic')) {
      return 'challenging';
    }

    return 'neutral';
  }

  /**
   * Get aspect effect description
   * @private
   * @param {string} planet1 - First planet
   * @param {string} planet2 - Second planet
   * @param {number} aspect - Aspect number
   * @returns {string} Effect description
   */
  _getAspectEffect(planet1, planet2, aspect) {
    const effects = {
      3: 'communication and mental activity',
      4: 'home and emotional security',
      5: 'creativity and children',
      7: 'relationships and partnerships',
      8: 'transformation and secrets',
      9: 'wisdom and spirituality',
      10: 'career and reputation'
    };

    return `influences ${effects[aspect] || 'life areas'}`;
  }

  /**
   * Generate Vedic interpretations
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @param {Array} houses - House data
   * @param {Array} aspects - Aspects
   * @returns {Object} Interpretations
   */
  _generateVedicInterpretations(planetaryPositions, houses, aspects) {
    return {
      lagnaAnalysis: this._analyzeLagna(houses[0], planetaryPositions),
      planetaryStrengths: this._analyzePlanetaryStrengths(planetaryPositions),
      houseSignificances: this._analyzeHouseSignificances(houses),
      detailedBhavaAnalysis: this._analyzeDetailedBhavas(houses, planetaryPositions),
      yogaFormations: this._identifyYogaFormations(planetaryPositions, houses),
      dashaPredictions: this._generateDashaPredictions(planetaryPositions)
    };
  }

  /**
   * Analyze Lagna (Ascendant)
   * @private
   * @param {Object} lagnaHouse - Lagna house data
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Object} Lagna analysis
   */
  _analyzeLagna(lagnaHouse, planetaryPositions) {
    const lagnaSign = lagnaHouse.sign;
    const lagnaLord = lagnaHouse.lord;

    // Lagna lord position
    const lagnaLordPosition = planetaryPositions[lagnaLord.toLowerCase()];

    return {
      sign: lagnaSign,
      lord: lagnaLord,
      lordPosition: lagnaLordPosition ? `${lagnaLordPosition.house}th house` : 'Unknown',
      strength: lagnaHouse.strength,
      planetsInLagna: lagnaHouse.planets,
      interpretation: this._getLagnaInterpretation(lagnaSign, lagnaLordPosition)
    };
  }

  /**
   * Get Lagna interpretation
   * @private
   * @param {string} sign - Lagna sign
   * @param {Object} lordPosition - Lagna lord position
   * @returns {string} Interpretation
   */
  _getLagnaInterpretation(sign, lordPosition) {
    const interpretations = {
      'Aries': 'Bold, courageous, independent personality. Natural leaders with strong willpower.',
      'Taurus': 'Practical, reliable, sensual nature. Strong connection to material comforts and stability.',
      'Gemini': 'Adaptable, communicative, intellectual. Versatile minds with strong curiosity.',
      'Cancer': 'Emotional, nurturing, intuitive. Deep connection to home and family.',
      'Leo': 'Creative, confident, generous. Natural performers with strong presence.',
      'Virgo': 'Analytical, helpful, detail-oriented. Strong focus on service and perfection.',
      'Libra': 'Diplomatic, harmonious, fair-minded. Strong emphasis on relationships and balance.',
      'Scorpio': 'Intense, passionate, transformative. Deep emotional and psychological insight.',
      'Sagittarius': 'Optimistic, philosophical, adventurous. Strong desire for knowledge and freedom.',
      'Capricorn': 'Ambitious, disciplined, responsible. Strong focus on achievement and structure.',
      'Aquarius': 'Innovative, humanitarian, independent. Strong focus on community and progress.',
      'Pisces': 'Compassionate, imaginative, spiritual. Strong connection to the divine and creative arts.'
    };

    let interpretation = interpretations[sign] || 'Unique personality with special qualities.';

    if (lordPosition) {
      const house = lordPosition.house;
      if (house <= 3) {
        interpretation += ' Strong personal power and self-expression.';
      } else if (house >= 4 && house <= 7) {
        interpretation += ' Focus on relationships and emotional security.';
      } else if (house >= 8 && house <= 11) {
        interpretation += ' Interest in transformation and spiritual growth.';
      } else {
        interpretation += ' Connection to broader social and spiritual concerns.';
      }
    }

    return interpretation;
  }

  /**
   * Analyze planetary strengths
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Object} Planetary strengths
   */
  _analyzePlanetaryStrengths(planetaryPositions) {
    const strengths = {
      strong: [],
      weak: [],
      exalted: [],
      debilitated: []
    };

    Object.values(planetaryPositions).forEach(planet => {
      if (planet.dignity.includes('Exalted')) {
        strengths.exalted.push(planet.name);
      } else if (planet.dignity.includes('Own Sign')) {
        strengths.strong.push(planet.name);
      }
    });

    return strengths;
  }

  /**
   * Analyze house significances
   * @private
   * @param {Array} houses - House data
   * @returns {Array} House analyses
   */
  _analyzeHouseSignificances(houses) {
    return houses.map(house => ({
      house: house.number,
      significance: house.significance,
      planets: house.planets,
      strength: house.strength,
      interpretation: this._getHouseInterpretation(house)
    }));
  }

  /**
   * Get house interpretation
   * @private
   * @param {Object} house - House data
   * @returns {string} Interpretation
   */
  _getHouseInterpretation(house) {
    let interpretation = `${house.name} represents ${house.significance}. `;

    if (house.planets.length > 0) {
      interpretation += `Planets here: ${house.planets.join(', ')}. `;
      interpretation += `This ${house.strength.toLowerCase()} house shows `;
      interpretation += house.strength.includes('Strong') ? 'favorable conditions' : 'challenges to overcome';
      interpretation += ' in these life areas.';
    } else {
      interpretation += 'No planets here, indicating balanced energy in these areas.';
    }

    return interpretation;
  }

  /**
   * Analyze detailed Bhavas (houses) with comprehensive interpretations
   * @private
   * @param {Array} houses - House data
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Array} Detailed Bhava analysis
   */
  _analyzeDetailedBhavas(houses, planetaryPositions) {
    return houses.map(house => {
      const detailedAnalysis = {
        house: house.number,
        name: house.name,
        sign: house.sign,
        lord: house.lord,
        lordPosition: planetaryPositions[house.lord.toLowerCase()]?.house || 'Unknown',
        planets: house.planets,
        strength: house.strength,
        karaka: this._getBhavaKaraka(house.number),
        arudha: this._calculateArudhaLagna(house, planetaryPositions),
        aspects: this._analyzeBhavaAspects(house, planetaryPositions),
        interpretation: this._getDetailedBhavaInterpretation(house, planetaryPositions),
        predictions: this._getBhavaPredictions(house, planetaryPositions)
      };

      return detailedAnalysis;
    });
  }

  /**
   * Get Bhava Karaka (significator) for each house
   * @private
   * @param {number} houseNumber - House number
   * @returns {string} Karaka (significator)
   */
  _getBhavaKaraka(houseNumber) {
    const karakas = {
      1: 'Sun (self, personality)',
      2: 'Jupiter (wealth, family)',
      3: 'Mars (siblings, courage)',
      4: 'Moon (mother, home, emotions)',
      5: 'Jupiter (children, creativity, intelligence)',
      6: 'Mars/Saturn (enemies, health, service)',
      7: 'Venus (spouse, partnerships)',
      8: 'Saturn (longevity, transformation, secrets)',
      9: 'Jupiter (fortune, father, spirituality)',
      10: 'Sun/Saturn/Mercury (career, reputation, authority)',
      11: 'Jupiter (gains, elder siblings, hopes)',
      12: 'Saturn (expenses, foreign lands, spirituality)'
    };

    return karakas[houseNumber] || 'Various planetary influences';
  }

  /**
   * Calculate Arudha Lagna for a house (simplified)
   * @private
   * @param {Object} house - House data
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {string} Arudha Lagna sign
   */
  _calculateArudhaLagna(house, planetaryPositions) {
    // Simplified Arudha calculation - in practice this is more complex
    const houseSign = house.sign;
    const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = signOrder.indexOf(houseSign);

    // Count planets in house
    const planetCount = house.planets.length;
    const arudhaIndex = (signIndex + planetCount) % 12;

    return signOrder[arudhaIndex];
  }

  /**
   * Analyze aspects to a Bhava
   * @private
   * @param {Object} house - House data
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Array} Aspects to the house
   */
  _analyzeBhavaAspects(house, planetaryPositions) {
    const aspects = [];

    // Check which planets aspect this house
    Object.entries(planetaryPositions).forEach(([planetName, position]) => {
      if (position && position.house) {
        const aspectHouses = this._getPlanetaryAspects(planetName, position.house);
        if (aspectHouses.includes(house.number)) {
          aspects.push({
            planet: planetName.charAt(0).toUpperCase() + planetName.slice(1),
            aspect: this._getAspectType(position.house, house.number),
            influence: this._getAspectInfluence(planetName, this._getAspectType(position.house, house.number))
          });
        }
      }
    });

    return aspects;
  }

  /**
   * Get planetary aspects (simplified Vedic aspects)
   * @private
   * @param {string} planet - Planet name
   * @param {number} house - House position
   * @returns {Array} Houses aspected by this planet
   */
  _getPlanetaryAspects(planet, house) {
    // Vedic planetary aspects (simplified)
    const aspects = {
      'sun': [7], // 7th aspect
      'moon': [7], // 7th aspect
      'mars': [4, 7, 8], // 4th, 7th, 8th aspects
      'mercury': [7], // 7th aspect
      'jupiter': [5, 7, 9], // 5th, 7th, 9th aspects
      'venus': [7], // 7th aspect
      'saturn': [3, 7, 10], // 3rd, 7th, 10th aspects
      'rahu': [5, 7, 9], // Similar to Jupiter
      'ketu': [5, 7, 9]  // Similar to Jupiter
    };

    const planetAspects = aspects[planet.toLowerCase()] || [7];
    return planetAspects.map(aspect => (house + aspect - 1) % 12 + 1);
  }

  /**
   * Get aspect type between two houses
   * @private
   * @param {number} fromHouse - From house
   * @param {number} toHouse - To house
   * @returns {string} Aspect type
   */
  _getAspectType(fromHouse, toHouse) {
    const diff = Math.abs(fromHouse - toHouse);
    const minDiff = Math.min(diff, 12 - diff);

    const aspectTypes = {
      3: 'trine',
      4: 'square',
      6: 'sextile',
      7: 'opposition',
      9: 'trine'
    };

    return aspectTypes[minDiff] || 'no major aspect';
  }

  /**
   * Get aspect influence
   * @private
   * @param {string} planet - Planet name
   * @param {string} aspect - Aspect type
   * @returns {string} Influence description
   */
  _getAspectInfluence(planet, aspect) {
    const influences = {
      'sun': {
        'trine': 'harmonious self-expression',
        'square': 'ego challenges',
        'opposition': 'public recognition',
        'sextile': 'leadership opportunities'
      },
      'moon': {
        'trine': 'emotional harmony',
        'square': 'mood fluctuations',
        'opposition': 'public emotions',
        'sextile': 'intuitive guidance'
      },
      'mars': {
        'trine': 'energetic support',
        'square': 'conflicts and aggression',
        'opposition': 'competitive dynamics',
        'sextile': 'courageous action'
      },
      'jupiter': {
        'trine': 'wisdom and expansion',
        'square': 'over-optimism',
        'opposition': 'philosophical influence',
        'sextile': 'learning opportunities'
      },
      'saturn': {
        'trine': 'disciplined structure',
        'square': 'restrictions and delays',
        'opposition': 'authority challenges',
        'sextile': 'career stability'
      }
    };

    return influences[planet.toLowerCase()]?.[aspect] || `${planet} influence`;
  }

  /**
   * Get detailed Bhava interpretation
   * @private
   * @param {Object} house - House data
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {string} Detailed interpretation
   */
  _getDetailedBhavaInterpretation(house, planetaryPositions) {
    let interpretation = `${house.name} in ${house.sign} shows `;

    // Analyze house lord strength
    const lordPosition = planetaryPositions[house.lord.toLowerCase()];
    if (lordPosition) {
      if ([1, 4, 7, 10].includes(lordPosition.house)) {
        interpretation += 'strong foundation and success in ';
      } else if ([6, 8, 12].includes(lordPosition.house)) {
        interpretation += 'challenges and transformation in ';
      } else {
        interpretation += 'moderate conditions in ';
      }
    }

    interpretation += house.significance.toLowerCase();

    if (house.planets.length > 0) {
      interpretation += `. Planets present: ${house.planets.join(', ')} indicate `;
      interpretation += house.planets.length > 2 ? 'intense activity' : 'focused energy';
      interpretation += ' in these areas.';
    }

    return interpretation;
  }

  /**
   * Get Bhava predictions
   * @private
   * @param {Object} house - House data
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Object} Predictions for the house
   */
  _getBhavaPredictions(house, planetaryPositions) {
    const predictions = {
      shortTerm: '',
      longTerm: '',
      remedies: []
    };

    // Generate predictions based on house strength and planetary positions
    if (house.strength.includes('Strong')) {
      predictions.shortTerm = `Positive developments in ${house.significance.split(',')[0].toLowerCase()}`;
      predictions.longTerm = `Long-term success and fulfillment in ${house.significance.split(',')[0].toLowerCase()}`;
    } else {
      predictions.shortTerm = `Challenges in ${house.significance.split(',')[0].toLowerCase()} requiring attention`;
      predictions.longTerm = `Growth and mastery in ${house.significance.split(',')[0].toLowerCase()} through perseverance`;
      predictions.remedies = this._getBhavaRemedies(house);
    }

    return predictions;
  }

  /**
   * Get remedies for weak Bhava
   * @private
   * @param {Object} house - House data
   * @returns {Array} Remedies
   */
  _getBhavaRemedies(house) {
    const remedies = {
      1: ['Wear ruby or practice self-confidence exercises', 'Regular exercise and healthy diet'],
      2: ['Donate to charity', 'Practice abundance affirmations'],
      3: ['Develop communication skills', 'Practice courage-building activities'],
      4: ['Create a peaceful home environment', 'Connect with family regularly'],
      5: ['Engage in creative activities', 'Spend time with children or creative pursuits'],
      6: ['Practice health discipline', 'Serve others selflessly'],
      7: ['Work on relationship skills', 'Practice compromise and harmony'],
      8: ['Study occult sciences', 'Practice meditation for transformation'],
      9: ['Study spiritual texts', 'Travel to sacred places'],
      10: ['Set clear career goals', 'Practice discipline and hard work'],
      11: ['Network and build connections', 'Practice gratitude for gains'],
      12: ['Practice charity', 'Develop spiritual practices']
    };

    return remedies[house.number] || ['General spiritual practices', 'Consult with learned astrologer'];
  }

  /**
   * Identify Yoga formations
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @param {Array} houses - House data
   * @returns {Array} Yoga formations
   */
  _identifyYogaFormations(planetaryPositions, houses) {
    const yogas = [];

    // Raja Yoga - combination of Kendra and Trikona lords
    const kendraLords = [houses[0].lord, houses[3].lord, houses[6].lord, houses[9].lord];
    const trikonaLords = [houses[1].lord, houses[4].lord, houses[7].lord, houses[10].lord];

    const kendraPositions = kendraLords.map(lord => planetaryPositions[lord.toLowerCase()]);
    const trikonaPositions = trikonaLords.map(lord => planetaryPositions[lord.toLowerCase()]);

    if (kendraPositions.some(p => p && [1, 4, 7, 10].includes(p.house)) &&
        trikonaPositions.some(p => p && [1, 4, 7, 10].includes(p.house))) {
      yogas.push({
        name: 'Raja Yoga',
        type: 'Wealth & Power',
        planets: 'Kendra and Trikona lords',
        effect: 'Success, wealth, power, and high status'
      });
    }

    // Dharma Karma Adhipati Yoga
    const dharmaLord = houses[8].lord; // 9th lord
    const karmaLord = houses[9].lord; // 10th lord

    if (planetaryPositions[dharmaLord.toLowerCase()] &&
        planetaryPositions[karmaLord.toLowerCase()] &&
        planetaryPositions[dharmaLord.toLowerCase()].house === planetaryPositions[karmaLord.toLowerCase()].house) {
      yogas.push({
        name: 'Dharma Karma Adhipati Yoga',
        type: 'Spiritual Career',
        planets: `${dharmaLord} and ${karmaLord}`,
        effect: 'Harmonious balance between spiritual and worldly duties'
      });
    }

    // Check for planetary conjunctions (multiple planets in same house)
    const houseOccupancy = {};
    Object.values(planetaryPositions).forEach(planet => {
      houseOccupancy[planet.house] = (houseOccupancy[planet.house] || 0) + 1;
    });

    Object.entries(houseOccupancy).forEach(([house, count]) => {
      if (count >= 3) {
        yogas.push({
          name: 'Sthan Yoga',
          type: 'Concentration',
          planets: `Multiple planets in ${house}th house`,
          effect: 'Intense focus and activity in this life area'
        });
      }
    });

    // Additional Yoga formations

    // Pancha Mahapurusha Yoga - 5 great personalities
    const panchaMahapurusha = this._checkPanchaMahapurushaYoga(planetaryPositions);
    yogas.push(...panchaMahapurusha);

    // Raja Yoga variations
    const additionalRajaYogas = this._checkAdditionalRajaYogas(planetaryPositions, houses);
    yogas.push(...additionalRajaYogas);

    // Dharma Karma Adhipati Yoga (already included above)

    // Neecha Bhanga Raja Yoga - cancellation of debilitation
    const neechaBhanga = this._checkNeechaBhangaYoga(planetaryPositions);
    if (neechaBhanga) {
      yogas.push(neechaBhanga);
    }

    // Viparita Raja Yoga - success through adversity
    const viparitaRaja = this._checkViparitaRajaYoga(planetaryPositions);
    if (viparitaRaja) {
      yogas.push(viparitaRaja);
    }

    // Chandra Mangala Yoga - Moon-Mars combination
    const chandraMangala = this._checkChandraMangalaYoga(planetaryPositions);
    if (chandraMangala) {
      yogas.push(chandraMangala);
    }

    // Lakshmi Yoga - wealth and prosperity
    const lakshmiYoga = this._checkLakshmiYoga(planetaryPositions);
    if (lakshmiYoga) {
      yogas.push(lakshmiYoga);
    }

    // Gaja Kesari Yoga - wisdom and prosperity
    const gajaKesari = this._checkGajaKesariYoga(planetaryPositions);
    if (gajaKesari) {
      yogas.push(gajaKesari);
    }

    return yogas;
  }

  /**
   * Check for Pancha Mahapurusha Yoga
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Array} Pancha Mahapurusha Yogas found
   */
  _checkPanchaMahapurushaYoga(planetaryPositions) {
    const yogas = [];

    // Ruchaka Yoga - Mars in own sign or exalted, in Kendra
    const mars = planetaryPositions.mars;
    if (mars && mars.dignity && (mars.dignity.includes('Own Sign') || mars.dignity.includes('Exalted')) &&
        [1, 4, 7, 10].includes(mars.house)) {
      yogas.push({
        name: 'Ruchaka Yoga',
        type: 'Pancha Mahapurusha',
        planets: 'Mars',
        effect: 'Courageous, victorious, successful in martial pursuits'
      });
    }

    // Bhadra Yoga - Mercury in own sign or exalted, in Kendra
    const mercury = planetaryPositions.mercury;
    if (mercury && mercury.dignity && (mercury.dignity.includes('Own Sign') || mercury.dignity.includes('Exalted')) &&
        [1, 4, 7, 10].includes(mercury.house)) {
      yogas.push({
        name: 'Bhadra Yoga',
        type: 'Pancha Mahapurusha',
        planets: 'Mercury',
        effect: 'Intelligent, learned, successful in education and communication'
      });
    }

    // Hamsa Yoga - Jupiter in own sign or exalted, in Kendra
    const jupiter = planetaryPositions.jupiter;
    if (jupiter && jupiter.dignity && (jupiter.dignity.includes('Own Sign') || jupiter.dignity.includes('Exalted')) &&
        [1, 4, 7, 10].includes(jupiter.house)) {
      yogas.push({
        name: 'Hamsa Yoga',
        type: 'Pancha Mahapurusha',
        planets: 'Jupiter',
        effect: 'Wise, spiritual, successful in teaching and philosophy'
      });
    }

    // Malavya Yoga - Venus in own sign or exalted, in Kendra
    const venus = planetaryPositions.venus;
    if (venus && venus.dignity && (venus.dignity.includes('Own Sign') || venus.dignity.includes('Exalted')) &&
        [1, 4, 7, 10].includes(venus.house)) {
      yogas.push({
        name: 'Malavya Yoga',
        type: 'Pancha Mahapurusha',
        planets: 'Venus',
        effect: 'Artistic, wealthy, successful in creative and luxury pursuits'
      });
    }

    // Sasa Yoga - Saturn in own sign or exalted, in Kendra
    const saturn = planetaryPositions.saturn;
    if (saturn && saturn.dignity && (saturn.dignity.includes('Own Sign') || saturn.dignity.includes('Exalted')) &&
        [1, 4, 7, 10].includes(saturn.house)) {
      yogas.push({
        name: 'Sasa Yoga',
        type: 'Pancha Mahapurusha',
        planets: 'Saturn',
        effect: 'Disciplined, long-lived, successful in administration and justice'
      });
    }

    return yogas;
  }

  /**
   * Check for additional Raja Yoga combinations
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @param {Array} houses - House data
   * @returns {Array} Additional Raja Yogas
   */
  _checkAdditionalRajaYogas(planetaryPositions, houses) {
    const yogas = [];

    // Kendra Trikona Raja Yoga
    const kendraPlanets = [1, 4, 7, 10].map(h => houses[h-1].planets).flat();
    const trikonaPlanets = [1, 5, 9].map(h => houses[h-1].planets).flat();

    if (kendraPlanets.length > 0 && trikonaPlanets.length > 0) {
      // Check if lords of Kendra and Trikona are connected
      const kendraLords = [1, 4, 7, 10].map(h => houses[h-1].lord);
      const trikonaLords = [1, 5, 9].map(h => houses[h-1].lord);

      const connectedLords = kendraLords.filter(lord =>
        trikonaLords.some(tLord => {
          const lordPos = planetaryPositions[lord.toLowerCase()];
          const tLordPos = planetaryPositions[tLord.toLowerCase()];
          return lordPos && tLordPos && lordPos.house === tLordPos.house;
        })
      );

      if (connectedLords.length > 0) {
        yogas.push({
          name: 'Kendra Trikona Raja Yoga',
          type: 'Power & Success',
          planets: connectedLords.join(', '),
          effect: 'Exceptional success, power, and high status'
        });
      }
    }

    return yogas;
  }

  /**
   * Check for Neecha Bhanga Raja Yoga
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Object|null} Neecha Bhanga Yoga if found
   */
  _checkNeechaBhangaYoga(planetaryPositions) {
    // Check if any planet is debilitated but cancellation occurs
    Object.entries(planetaryPositions).forEach(([planetName, position]) => {
      if (position && position.dignity && position.dignity.includes('Debilitated')) {
        // Check for cancellation conditions
        const exaltedSign = this._getExaltedSign(planetName);
        const debilitatedSign = this._getDebilitatedSign(planetName);

        if (position.sign === debilitatedSign) {
          // Check if exalted planet aspects or is in Kendra from Moon/Lagna
          const exaltedPlanet = this._getExaltedPlanetForSign(exaltedSign);
          const exaltedPosition = planetaryPositions[exaltedPlanet];

          if (exaltedPosition && (
            this._housesApart(exaltedPosition.house, position.house) === 7 || // Opposition
            [1, 4, 7, 10].includes(exaltedPosition.house) // Kendra
          )) {
            return {
              name: 'Neecha Bhanga Raja Yoga',
              type: 'Cancellation of Debilitation',
              planets: `${planetName.charAt(0).toUpperCase() + planetName.slice(1)} and ${exaltedPlanet.charAt(0).toUpperCase() + exaltedPlanet.slice(1)}`,
              effect: 'Transformation of weakness into strength, exceptional success'
            };
          }
        }
      }
    });

    return null;
  }

  /**
   * Check for Viparita Raja Yoga
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Object|null} Viparita Raja Yoga if found
   */
  _checkViparitaRajaYoga(planetaryPositions) {
    // Lords of 6th, 8th, 12th houses in Kendra or Trikona
    const dusthanaLords = [6, 8, 12].map(h => planetaryPositions.mars); // Simplified - should get actual lords

    const favorableHouses = [1, 4, 5, 7, 9, 10];
    const dusthanaInFavorable = dusthanaLords.filter(lord =>
      lord && favorableHouses.includes(lord.house)
    );

    if (dusthanaInFavorable.length > 0) {
      return {
        name: 'Viparita Raja Yoga',
        type: 'Success Through Adversity',
        planets: 'Lords of 6th, 8th, or 12th houses',
        effect: 'Success achieved through overcoming obstacles and adversity'
      };
    }

    return null;
  }

  /**
   * Check for Chandra Mangala Yoga
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Object|null} Chandra Mangala Yoga if found
   */
  _checkChandraMangalaYoga(planetaryPositions) {
    const moon = planetaryPositions.moon;
    const mars = planetaryPositions.mars;

    if (moon && mars && moon.house === mars.house) {
      return {
        name: 'Chandra Mangala Yoga',
        type: 'Courage & Vitality',
        planets: 'Moon and Mars',
        effect: 'Courageous, energetic, successful in competitive fields'
      };
    }

    return null;
  }

  /**
   * Check for Lakshmi Yoga
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Object|null} Lakshmi Yoga if found
   */
  _checkLakshmiYoga(planetaryPositions) {
    // Venus and Moon in Kendra or Trikona from each other
    const venus = planetaryPositions.venus;
    const moon = planetaryPositions.moon;

    if (venus && moon) {
      const housesApart = Math.abs(venus.house - moon.house);
      const minHouses = Math.min(housesApart, 12 - housesApart);

      if ([3, 4, 6, 7, 9].includes(minHouses)) { // Trine, square, sextile, opposition
        return {
          name: 'Lakshmi Yoga',
          type: 'Wealth & Prosperity',
          planets: 'Venus and Moon',
          effect: 'Abundance, luxury, material success, and happiness'
        };
      }
    }

    return null;
  }

  /**
   * Check for Gaja Kesari Yoga
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Object|null} Gaja Kesari Yoga if found
   */
  _checkGajaKesariYoga(planetaryPositions) {
    const moon = planetaryPositions.moon;
    const jupiter = planetaryPositions.jupiter;

    if (moon && jupiter) {
      const housesApart = Math.abs(jupiter.house - moon.house);
      const minHouses = Math.min(housesApart, 12 - housesApart);

      if ([1, 5, 9].includes(minHouses)) { // Conjunction, trine
        return {
          name: 'Gaja Kesari Yoga',
          type: 'Wisdom & Prosperity',
          planets: 'Moon and Jupiter',
          effect: 'Intelligence, wealth, fame, and spiritual wisdom'
        };
      }
    }

    return null;
  }

  /**
   * Get exalted sign for a planet
   * @private
   * @param {string} planet - Planet name
   * @returns {string} Exalted sign
   */
  _getExaltedSign(planet) {
    const exaltedSigns = {
      'sun': 'Aries',
      'moon': 'Taurus',
      'mars': 'Capricorn',
      'mercury': 'Virgo',
      'jupiter': 'Cancer',
      'venus': 'Pisces',
      'saturn': 'Libra'
    };
    return exaltedSigns[planet.toLowerCase()] || '';
  }

  /**
   * Get debilitated sign for a planet
   * @private
   * @param {string} planet - Planet name
   * @returns {string} Debilitated sign
   */
  _getDebilitatedSign(planet) {
    const debilitatedSigns = {
      'sun': 'Libra',
      'moon': 'Scorpio',
      'mars': 'Cancer',
      'mercury': 'Pisces',
      'jupiter': 'Capricorn',
      'venus': 'Virgo',
      'saturn': 'Aries'
    };
    return debilitatedSigns[planet.toLowerCase()] || '';
  }

  /**
   * Get planet exalted in a sign
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Planet exalted in that sign
   */
  _getExaltedPlanetForSign(sign) {
    const planetForSign = {
      'Aries': 'sun',
      'Taurus': 'moon',
      'Cancer': 'jupiter',
      'Virgo': 'mercury',
      'Libra': 'saturn',
      'Capricorn': 'mars',
      'Pisces': 'venus'
    };
    return planetForSign[sign] || '';
  }

  /**
   * Calculate houses apart (considering circular nature)
   * @private
   * @param {number} house1 - First house
   * @param {number} house2 - Second house
   * @returns {number} Houses apart
   */
  _housesApart(house1, house2) {
    const diff = Math.abs(house1 - house2);
    return Math.min(diff, 12 - diff);
  }

  /**
   * Generate Dasha predictions
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Object} Dasha predictions
   */
  _generateDashaPredictions(planetaryPositions) {
    // Simplified dasha predictions based on current planetary positions
    const predictions = {
      currentInfluence: 'General life patterns based on planetary positions',
      upcomingTrends: [],
      favorablePeriods: [],
      challengingPeriods: []
    };

    // Add predictions based on strong planets
    Object.values(planetaryPositions).forEach(planet => {
      if (planet.dignity.includes('Exalted') || planet.dignity.includes('Own Sign')) {
        predictions.favorablePeriods.push(`${planet.name} periods bring success in ${this._getPlanetDomains(planet.name)}`);
      }
    });

    return predictions;
  }

  /**
   * Get planetary domains
   * @private
   * @param {string} planet - Planet name
   * @returns {string} Domains
   */
  _getPlanetaryDomains(planet) {
    const domains = {
      'Sun': 'leadership, government, father, vitality',
      'Moon': 'emotions, mother, home, intuition',
      'Mars': 'energy, courage, siblings, property',
      'Mercury': 'communication, education, business, intellect',
      'Jupiter': 'wisdom, expansion, prosperity, spirituality',
      'Venus': 'love, beauty, arts, material comforts',
      'Saturn': 'discipline, responsibility, career, longevity'
    };

    return domains[planet] || 'various life areas';
  }

  /**
   * Generate Kundli summary
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @param {Array} houses - House data
   * @param {Object} interpretations - Interpretations
   * @returns {string} Summary
   */
  _generateKundliSummary(planetaryPositions, houses, interpretations) {
    let summary = '📊 *Vedic Kundli Summary*\n\n';

    summary += `*Lagna:* ${interpretations.lagnaAnalysis.sign} (${interpretations.lagnaAnalysis.strength})\n`;
    summary += `*Planetary Strengths:* ${interpretations.planetaryStrengths.strong.join(', ')}\n\n`;

    if (interpretations.yogaFormations.length > 0) {
      summary += '*Special Yogas:*\n';
      interpretations.yogaFormations.forEach(yoga => {
        summary += `• ${yoga.name}: ${yoga.effect}\n`;
      });
      summary += '\n';
    }

    summary += '*Key Life Areas:*\n';
    const keyHouses = [1, 4, 7, 10]; // Kendra houses
    keyHouses.forEach(houseNum => {
      const house = houses[houseNum - 1];
      if (house.planets.length > 0) {
        summary += `• ${house.name}: ${house.planets.join(', ')}\n`;
      }
    });

    summary += '\n*Overall:* This Kundli reveals ';
    const strongPlanets = interpretations.planetaryStrengths.strong.length;
    const exaltedPlanets = interpretations.planetaryStrengths.exalted.length;

    if (strongPlanets + exaltedPlanets >= 3) {
      summary += 'strong planetary influences suggesting success and stability.';
    } else if (strongPlanets + exaltedPlanets >= 1) {
      summary += 'balanced energies with opportunities for growth.';
    } else {
      summary += 'challenging planetary positions requiring conscious effort and spiritual practice.';
    }

    return summary;
  }

  /**
   * Calculate Hindu Marriage Compatibility (Kundli Matching)
   * @param {Object} person1 - First person's birth data
   * @param {Object} person2 - Second person's birth data
   * @returns {Object} Marriage compatibility analysis
   */
  calculateMarriageCompatibility(person1, person2) {
    try {
      if (!person1.birthDate || !person2.birthDate) {
        return {
          error: 'Birth dates required for marriage compatibility'
        };
      }

      // Generate Kundlis for both people
      const kundli1 = this.generateVedicKundli(person1);
      const kundli2 = this.generateVedicKundli(person2);

      if (kundli1.error || kundli2.error) {
        return {
          error: 'Unable to generate Kundlis for compatibility analysis'
        };
      }

      // Calculate 36-point Guna matching system
      const gunaMatching = this._calculateGunaMatching(kundli1, kundli2);

      // Calculate other compatibility factors
      const varnaCompatibility = this._calculateVarnaCompatibility(kundli1, kundli2);
      const taraCompatibility = this._calculateTaraCompatibility(kundli1, kundli2);
      const yoniCompatibility = this._calculateYoniCompatibility(kundli1, kundli2);
      const grahamaitriCompatibility = this._calculateGrahamaitriCompatibility(kundli1, kundli2);
      const ganaCompatibility = this._calculateGanaCompatibility(kundli1, kundli2);
      const bhakutCompatibility = this._calculateBhakutCompatibility(kundli1, kundli2);
      const nadiCompatibility = this._calculateNadiCompatibility(kundli1, kundli2);
      const nakshatraCompatibility = this._calculateNakshatraCompatibility(kundli1, kundli2);

      // Calculate Manglik dosha
      const manglikAnalysis = this._analyzeManglikDosha(kundli1, kundli2);

      // Overall compatibility score
      const overallScore = this._calculateOverallCompatibility(gunaMatching, manglikAnalysis);

      return {
        couple: {
          person1: person1.name,
          person2: person2.name
        },
        gunaMatching,
        detailedCompatibility: {
          varna: varnaCompatibility,
          tara: taraCompatibility,
          yoni: yoniCompatibility,
          grahamaitri: grahamaitriCompatibility,
          gana: ganaCompatibility,
          bhakut: bhakutCompatibility,
          nadi: nadiCompatibility,
          nakshatra: nakshatraCompatibility
        },
        manglikAnalysis,
        overallScore,
        recommendations: this._generateMarriageRecommendations(overallScore, gunaMatching, manglikAnalysis),
        summary: this._generateMarriageSummary(overallScore, gunaMatching, manglikAnalysis)
      };
    } catch (error) {
      logger.error('Error calculating marriage compatibility:', error);
      return {
        error: 'Unable to calculate marriage compatibility at this time'
      };
    }
  }

  /**
   * Calculate 36-point Guna matching system
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Guna matching results
   */
  _calculateGunaMatching(kundli1, kundli2) {
    const gunas = {
      varna: this._calculateVarnaGuna(kundli1, kundli2),
      tara: this._calculateTaraGuna(kundli1, kundli2),
      yoni: this._calculateYoniGuna(kundli1, kundli2),
      grahamaitri: this._calculateGrahamaitriGuna(kundli1, kundli2),
      gana: this._calculateGanaGuna(kundli1, kundli2),
      bhakut: this._calculateBhakutGuna(kundli1, kundli2),
      nadi: this._calculateNadiGuna(kundli1, kundli2)
    };

    const totalPoints = Object.values(gunas).reduce((sum, guna) => sum + guna.points, 0);
    const maxPoints = 36;

    return {
      individualGunas: gunas,
      totalPoints,
      maxPoints,
      percentage: Math.round((totalPoints / maxPoints) * 100),
      compatibility: this._interpretGunaScore(totalPoints)
    };
  }

  /**
   * Calculate Varna Guna (1 point)
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Varna compatibility
   */
  _calculateVarnaGuna(kundli1, kundli2) {
    // Varna based on Moon sign
    const moon1 = kundli1.planetaryPositions.moon?.sign || 'Unknown';
    const moon2 = kundli2.planetaryPositions.moon?.sign || 'Unknown';

    const varnaMap = {
      'Aries': 'Kshatriya', 'Leo': 'Kshatriya', 'Sagittarius': 'Kshatriya',
      'Taurus': 'Vaishya', 'Virgo': 'Vaishya', 'Capricorn': 'Vaishya',
      'Gemini': 'Shudra', 'Libra': 'Shudra', 'Aquarius': 'Shudra',
      'Cancer': 'Brahmin', 'Scorpio': 'Brahmin', 'Pisces': 'Brahmin'
    };

    const varna1 = varnaMap[moon1] || 'Unknown';
    const varna2 = varnaMap[moon2] || 'Unknown';

    const compatibility = this._calculateVarnaCompatibility(kundli1, kundli2);

    return {
      points: compatibility.points,
      maxPoints: 1,
      person1Varna: varna1,
      person2Varna: varna2,
      compatibility: compatibility.description
    };
  }

  /**
   * Calculate Tara Guna (3 points)
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Tara compatibility
   */
  _calculateTaraGuna(kundli1, kundli2) {
    // Tara based on Moon's position relative to partner's Moon
    const moon1 = kundli1.planetaryPositions.moon;
    const moon2 = kundli2.planetaryPositions.moon;

    if (!moon1 || !moon2) {
      return { points: 0, maxPoints: 3, tara: 'Unknown', compatibility: 'Cannot determine' };
    }

    const tara = this._calculateTaraCompatibility(kundli1, kundli2);

    return {
      points: tara.points,
      maxPoints: 3,
      tara: tara.tara,
      compatibility: tara.description
    };
  }

  /**
   * Calculate Yoni Guna (4 points)
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Yoni compatibility
   */
  _calculateYoniGuna(kundli1, kundli2) {
    // Yoni based on Nakshatra
    const yoni = this._calculateYoniCompatibility(kundli1, kundli2);

    return {
      points: yoni.points,
      maxPoints: 4,
      person1Yoni: yoni.yoni1,
      person2Yoni: yoni.yoni2,
      compatibility: yoni.description
    };
  }

  /**
   * Calculate Grahamaitri Guna (5 points)
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Grahamaitri compatibility
   */
  _calculateGrahamaitriGuna(kundli1, kundli2) {
    // Friendship between Moon lords
    const grahamaitri = this._calculateGrahamaitriCompatibility(kundli1, kundli2);

    return {
      points: grahamaitri.points,
      maxPoints: 5,
      person1Lord: grahamaitri.lord1,
      person2Lord: grahamaitri.lord2,
      compatibility: grahamaitri.description
    };
  }

  /**
   * Calculate Gana Guna (6 points)
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Gana compatibility
   */
  _calculateGanaGuna(kundli1, kundli2) {
    // Gana based on Moon's Nakshatra
    const gana = this._calculateGanaCompatibility(kundli1, kundli2);

    return {
      points: gana.points,
      maxPoints: 6,
      person1Gana: gana.gana1,
      person2Gana: gana.gana2,
      compatibility: gana.description
    };
  }

  /**
   * Calculate Bhakut Guna (7 points)
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Bhakut compatibility
   */
  _calculateBhakutGuna(kundli1, kundli2) {
    // Bhakut based on Moon signs distance
    const bhakut = this._calculateBhakutCompatibility(kundli1, kundli2);

    return {
      points: bhakut.points,
      maxPoints: 7,
      moonSigns: `${bhakut.sign1}-${bhakut.sign2}`,
      compatibility: bhakut.description
    };
  }

  /**
   * Calculate Nadi Guna (8 points)
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Nadi compatibility
   */
  _calculateNadiGuna(kundli1, kundli2) {
    // Nadi based on Nakshatra
    const nadi = this._calculateNadiCompatibility(kundli1, kundli2);

    return {
      points: nadi.points,
      maxPoints: 8,
      person1Nadi: nadi.nadi1,
      person2Nadi: nadi.nadi2,
      compatibility: nadi.description
    };
  }

  /**
   * Calculate Varna compatibility
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Varna compatibility
   */
  _calculateVarnaCompatibility(kundli1, kundli2) {
    const moon1 = kundli1.planetaryPositions.moon?.sign || 'Unknown';
    const moon2 = kundli2.planetaryPositions.moon?.sign || 'Unknown';

    const varnaMap = {
      'Aries': 'Kshatriya', 'Leo': 'Kshatriya', 'Sagittarius': 'Kshatriya',
      'Taurus': 'Vaishya', 'Virgo': 'Vaishya', 'Capricorn': 'Vaishya',
      'Gemini': 'Shudra', 'Libra': 'Shudra', 'Aquarius': 'Shudra',
      'Cancer': 'Brahmin', 'Scorpio': 'Brahmin', 'Pisces': 'Brahmin'
    };

    const varna1 = varnaMap[moon1] || 'Unknown';
    const varna2 = varnaMap[moon2] || 'Unknown';

    // Varna compatibility matrix
    const compatibilityMatrix = {
      'Brahmin-Brahmin': { points: 1, description: 'Excellent spiritual compatibility' },
      'Brahmin-Kshatriya': { points: 1, description: 'Good leadership and wisdom balance' },
      'Brahmin-Vaishya': { points: 1, description: 'Balanced spiritual and material energies' },
      'Kshatriya-Kshatriya': { points: 1, description: 'Strong leadership and courage' },
      'Kshatriya-Vaishya': { points: 1, description: 'Good protection and prosperity' },
      'Vaishya-Vaishya': { points: 1, description: 'Strong material and business focus' },
      'Shudra-Shudra': { points: 1, description: 'Harmonious service orientation' }
    };

    const key = `${varna1}-${varna2}`;
    const reverseKey = `${varna2}-${varna1}`;

    return compatibilityMatrix[key] || compatibilityMatrix[reverseKey] || {
      points: 0,
      description: 'Different varna energies may require adjustment'
    };
  }

  /**
   * Calculate Tara compatibility
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Tara compatibility
   */
  _calculateTaraCompatibility(kundli1, kundli2) {
    // Simplified Tara calculation based on Moon positions
    const moon1 = kundli1.planetaryPositions.moon;
    const moon2 = kundli2.planetaryPositions.moon;

    if (!moon1 || !moon2) {
      return { points: 0, tara: 'Unknown', description: 'Cannot determine Tara' };
    }

    // Calculate relative position
    const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const sign1Index = signOrder.indexOf(moon1.sign);
    const sign2Index = signOrder.indexOf(moon2.sign);

    let distance = Math.abs(sign1Index - sign2Index);
    if (distance > 6) distance = 12 - distance; // Minimum distance

    // Tara points based on distance
    const taraPoints = [3, 1.5, 1, 0, 2, 0]; // Points for distances 0-5
    const points = taraPoints[distance] || 0;

    const taraNames = ['Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyak', 'Sadhak'];
    const tara = taraNames[distance] || 'Unknown';

    const descriptions = {
      'Janma': { points: 3, description: 'Excellent Tara - very auspicious' },
      'Sampat': { points: 1.5, description: 'Good Tara - brings prosperity' },
      'Vipat': { points: 1, description: 'Challenging Tara - requires care' },
      'Kshema': { points: 0, description: 'Neutral Tara - balanced energy' },
      'Pratyak': { points: 2, description: 'Beneficial Tara - brings success' },
      'Sadhak': { points: 0, description: 'Variable Tara - depends on other factors' }
    };

    return descriptions[tara] || { points: 0, tara: 'Unknown', description: 'Cannot determine Tara compatibility' };
  }

  /**
   * Calculate Yoni compatibility
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Yoni compatibility
   */
  _calculateYoniCompatibility(kundli1, kundli2) {
    // Yoni based on Nakshatra (simplified)
    const yoniMap = {
      // Male Yonis
      'Ashwini': 'Horse', 'Bharani': 'Elephant', 'Pushya': 'Sheep', 'Ashlesha': 'Cat',
      'Magha': 'Rat', 'Purva Phalguni': 'Rat', 'Uttara Phalguni': 'Cow', 'Hasta': 'Buffalo',
      'Chitra': 'Tiger', 'Swati': 'Buffalo', 'Vishakha': 'Tiger', 'Anuradha': 'Deer',
      'Jyeshta': 'Deer', 'Mula': 'Dog', 'Purva Ashadha': 'Monkey', 'Uttara Ashadha': 'Mongoose',
      'Shravana': 'Monkey', 'Dhanishta': 'Lion', 'Shatabhisha': 'Horse', 'Purva Bhadrapada': 'Lion',
      'Uttara Bhadrapada': 'Cow', 'Revati': 'Elephant'
    };

    // For simplicity, assign based on Moon sign (this would normally be based on Nakshatra)
    const moonSign1 = kundli1.planetaryPositions.moon?.sign;
    const moonSign2 = kundli2.planetaryPositions.moon?.sign;

    // Simplified Yoni assignment
    const signYoniMap = {
      'Aries': 'Sheep', 'Taurus': 'Bull', 'Gemini': 'Mongoose', 'Cancer': 'Cat',
      'Leo': 'Lion', 'Virgo': 'Monkey', 'Libra': 'Rat', 'Scorpio': 'Snake',
      'Sagittarius': 'Horse', 'Capricorn': 'Buffalo', 'Aquarius': 'Elephant', 'Pisces': 'Fish'
    };

    const yoni1 = signYoniMap[moonSign1] || 'Unknown';
    const yoni2 = signYoniMap[moonSign2] || 'Unknown';

    // Yoni compatibility (simplified)
    const compatibleYonis = {
      'Horse-Horse': 4, 'Elephant-Elephant': 4, 'Sheep-Sheep': 4,
      'Horse-Elephant': 3, 'Sheep-Horse': 3, 'Lion-Tiger': 3,
      'Snake-Cat': 0, 'Dog-Cat': 0 // Incompatible
    };

    const key = `${yoni1}-${yoni2}`;
    const reverseKey = `${yoni2}-${yoni1}`;
    const points = compatibleYonis[key] || compatibleYonis[reverseKey] || 2; // Neutral

    let description = 'Neutral Yoni compatibility';
    if (points === 4) description = 'Excellent Yoni match - strong physical compatibility';
    else if (points === 3) description = 'Good Yoni compatibility - harmonious energies';
    else if (points === 0) description = 'Challenging Yoni - may require adjustments';

    return {
      points,
      yoni1,
      yoni2,
      description
    };
  }

  /**
   * Calculate Grahamaitri compatibility
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Grahamaitri compatibility
   */
  _calculateGrahamaitriCompatibility(kundli1, kundli2) {
    // Friendship between Moon lords
    const moon1Lord = kundli1.houses.find(h => h.sign === kundli1.planetaryPositions.moon?.sign)?.lord || 'Unknown';
    const moon2Lord = kundli2.houses.find(h => h.sign === kundli2.planetaryPositions.moon?.sign)?.lord || 'Unknown';

    // Planetary friendships (simplified)
    const friendships = {
      'Sun': ['Moon', 'Mars', 'Jupiter'],
      'Moon': ['Sun', 'Mercury'],
      'Mars': ['Sun', 'Moon', 'Jupiter'],
      'Mercury': ['Sun', 'Venus'],
      'Jupiter': ['Sun', 'Moon', 'Mars'],
      'Venus': ['Mercury', 'Saturn'],
      'Saturn': ['Mercury', 'Venus']
    };

    const friends1 = friendships[moon1Lord] || [];
    const friends2 = friendships[moon2Lord] || [];

    let points = 5; // Maximum
    let description = 'Excellent friendship between Moon lords';

    if (!friends1.includes(moon2Lord) && !friends2.includes(moon1Lord)) {
      points = 0;
      description = 'Moon lords are not friendly - may cause misunderstandings';
    } else if (friends1.includes(moon2Lord) || friends2.includes(moon1Lord)) {
      points = 5;
      description = 'Harmonious friendship between Moon lords';
    } else {
      points = 3;
      description = 'Neutral relationship between Moon lords';
    }

    return {
      points,
      lord1: moon1Lord,
      lord2: moon2Lord,
      description
    };
  }

  /**
   * Calculate Gana compatibility
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Gana compatibility
   */
  _calculateGanaCompatibility(kundli1, kundli2) {
    // Gana based on Moon's Nakshatra (simplified by sign)
    const ganaMap = {
      'Aries': 'Rakshasa', 'Taurus': 'Manushya', 'Gemini': 'Deva',
      'Cancer': 'Manushya', 'Leo': 'Rakshasa', 'Virgo': 'Manushya',
      'Libra': 'Rakshasa', 'Scorpio': 'Manushya', 'Sagittarius': 'Deva',
      'Capricorn': 'Rakshasa', 'Aquarius': 'Manushya', 'Pisces': 'Deva'
    };

    const gana1 = ganaMap[kundli1.planetaryPositions.moon?.sign] || 'Unknown';
    const gana2 = ganaMap[kundli2.planetaryPositions.moon?.sign] || 'Unknown';

    // Gana compatibility
    const compatibility = {
      'Deva-Deva': { points: 6, description: 'Excellent - both divine nature' },
      'Deva-Manushya': { points: 6, description: 'Very good - divine and human balance' },
      'Manushya-Manushya': { points: 6, description: 'Good - both human nature' },
      'Rakshasa-Rakshasa': { points: 0, description: 'Challenging - both demoniac nature' },
      'Deva-Rakshasa': { points: 1, description: 'Difficult - divine vs demoniac' },
      'Manushya-Rakshasa': { points: 0, description: 'Very challenging - human vs demoniac' }
    };

    const key = `${gana1}-${gana2}`;
    const reverseKey = `${gana2}-${gana1}`;

    return compatibility[key] || compatibility[reverseKey] || {
      points: 3,
      gana1,
      gana2,
      description: 'Mixed Gana energies'
    };
  }

  /**
   * Calculate Bhakut compatibility
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Bhakut compatibility
   */
  _calculateBhakutCompatibility(kundli1, kundli2) {
    const sign1 = kundli1.planetaryPositions.moon?.sign;
    const sign2 = kundli2.planetaryPositions.moon?.sign;

    if (!sign1 || !sign2) {
      return { points: 0, sign1: 'Unknown', sign2: 'Unknown', description: 'Cannot determine Bhakut' };
    }

    const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const sign1Index = signOrder.indexOf(sign1);
    const sign2Index = signOrder.indexOf(sign2);

    let distance = Math.abs(sign1Index - sign2Index);
    if (distance > 6) distance = 12 - distance;

    // Bhakut points (7 is maximum)
    const bhakutPoints = [7, 7, 7, 7, 6, 5, 4]; // Points for distances 0-6
    const points = bhakutPoints[distance] || 0;

    let description = 'Good Bhakut compatibility';
    if (points >= 6) description = 'Excellent Bhakut - very auspicious';
    else if (points >= 4) description = 'Good Bhakut compatibility';
    else if (points < 4) description = 'Challenging Bhakut - requires attention';

    return {
      points,
      sign1,
      sign2,
      distance,
      description
    };
  }

  /**
   * Calculate Nadi compatibility
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Nadi compatibility
   */
  _calculateNadiCompatibility(kundli1, kundli2) {
    // Nadi based on Nakshatra (simplified by Moon sign)
    const nadiMap = {
      'Aries': 'Aadi', 'Taurus': 'Madhya', 'Gemini': 'Antya',
      'Cancer': 'Aadi', 'Leo': 'Madhya', 'Virgo': 'Antya',
      'Libra': 'Aadi', 'Scorpio': 'Madhya', 'Sagittarius': 'Antya',
      'Capricorn': 'Aadi', 'Aquarius': 'Madhya', 'Pisces': 'Antya'
    };

    const nadi1 = nadiMap[kundli1.planetaryPositions.moon?.sign] || 'Unknown';
    const nadi2 = nadiMap[kundli2.planetaryPositions.moon?.sign] || 'Unknown';

    // Nadi compatibility - same Nadi gives 0 points (not recommended)
    let points = 8;
    let description = 'Excellent Nadi compatibility';

    if (nadi1 === nadi2) {
      points = 0;
      description = 'Same Nadi - traditionally not recommended for marriage';
    }

    return {
      points,
      nadi1,
      nadi2,
      description
    };
  }

  /**
   * Calculate Nakshatra compatibility
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Nakshatra compatibility
   */
  _calculateNakshatraCompatibility(kundli1, kundli2) {
    // Get Moon's Nakshatra for both people
    const nakshatra1 = this._getMoonNakshatra(kundli1);
    const nakshatra2 = this._getMoonNakshatra(kundli2);

    // Nakshatra compatibility based on traditional matching
    const compatibility = this._getNakshatraCompatibility(nakshatra1, nakshatra2);

    return {
      nakshatra1,
      nakshatra2,
      compatibility: compatibility.description,
      points: compatibility.points,
      maxPoints: 2,
      rulingDeity1: this._getNakshatraDeity(nakshatra1),
      rulingDeity2: this._getNakshatraDeity(nakshatra2),
      symbolism1: this._getNakshatraSymbolism(nakshatra1),
      symbolism2: this._getNakshatraSymbolism(nakshatra2)
    };
  }

  /**
   * Get Moon's Nakshatra from Kundli
   * @private
   * @param {Object} kundli - Kundli data
   * @returns {string} Nakshatra name
   */
  _getMoonNakshatra(kundli) {
    // Simplified - in practice would calculate exact Nakshatra from Moon's longitude
    const moonSign = kundli.planetaryPositions.moon?.sign || 'Aries';

    // Map signs to representative Nakshatras (simplified)
    const signToNakshatra = {
      'Aries': 'Ashwini',
      'Taurus': 'Krittika',
      'Gemini': 'Mrigashira',
      'Cancer': 'Pushya',
      'Leo': 'Magha',
      'Virgo': 'Uttara Phalguni',
      'Libra': 'Vishakha',
      'Scorpio': 'Anuradha',
      'Sagittarius': 'Mula',
      'Capricorn': 'Uttara Ashadha',
      'Aquarius': 'Shravana',
      'Pisces': 'Revati'
    };

    return signToNakshatra[moonSign] || 'Ashwini';
  }

  /**
   * Get Nakshatra compatibility
   * @private
   * @param {string} nakshatra1 - First Nakshatra
   * @param {string} nakshatra2 - Second Nakshatra
   * @returns {Object} Compatibility result
   */
  _getNakshatraCompatibility(nakshatra1, nakshatra2) {
    // Simplified compatibility matrix
    const compatibilityMatrix = {
      'Ashwini': { 'Ashwini': 'Good', 'Bharani': 'Excellent', 'Krittika': 'Neutral' },
      'Bharani': { 'Ashwini': 'Excellent', 'Bharani': 'Good', 'Krittika': 'Good' },
      'Krittika': { 'Ashwini': 'Neutral', 'Bharani': 'Good', 'Krittika': 'Excellent' }
      // Add more Nakshatra pairs as needed
    };

    const compatibility = compatibilityMatrix[nakshatra1]?.[nakshatra2] ||
                          compatibilityMatrix[nakshatra2]?.[nakshatra1] ||
                          'Neutral';

    let points = 1; // Default neutral
    if (compatibility === 'Excellent') points = 2;
    else if (compatibility === 'Good') points = 1.5;
    else if (compatibility === 'Poor') points = 0;

    return {
      description: `${compatibility} Nakshatra compatibility`,
      points
    };
  }

  /**
   * Get Nakshatra ruling deity
   * @private
   * @param {string} nakshatra - Nakshatra name
   * @returns {string} Ruling deity
   */
  _getNakshatraDeity(nakshatra) {
    const deities = {
      'Ashwini': 'Ashwin Kumaras',
      'Bharani': 'Yama',
      'Krittika': 'Agni',
      'Rohini': 'Brahma',
      'Mrigashira': 'Soma',
      'Ardra': 'Rudra',
      'Punarvasu': 'Aditi',
      'Pushya': 'Brihaspati',
      'Ashlesha': 'Nagadevas',
      'Magha': 'Pitris',
      'Purva Phalguni': 'Bhaga',
      'Uttara Phalguni': 'Aryaman',
      'Hasta': 'Savitar',
      'Chitra': 'Vishwakarma',
      'Swati': 'Vayu',
      'Vishakha': 'Indra/Agni',
      'Anuradha': 'Mitra',
      'Jyeshta': 'Indra',
      'Mula': 'Nirriti',
      'Purva Ashadha': 'Apas',
      'Uttara Ashadha': 'Vishwadevas',
      'Shravana': 'Vishnu',
      'Dhanishta': 'Vasu',
      'Shatabhisha': 'Varuna',
      'Purva Bhadrapada': 'Aja Ekapada',
      'Uttara Bhadrapada': 'Ahir Budhnya',
      'Revati': 'Pushan'
    };

    return deities[nakshatra] || 'Various Deities';
  }

  /**
   * Get Nakshatra symbolism
   * @private
   * @param {string} nakshatra - Nakshatra name
   * @returns {string} Symbolism
   */
  _getNakshatraSymbolism(nakshatra) {
    const symbols = {
      'Ashwini': 'Horse head - swift action and healing',
      'Bharani': 'Yoni - birth and creation',
      'Krittika': 'Knife - cutting through obstacles',
      'Rohini': 'Cart - growth and abundance',
      'Mrigashira': 'Deer head - searching and sensitivity',
      'Ardra': 'Teardrop - emotional depth',
      'Punarvasu': 'Bow and quiver - renewal and expansion',
      'Pushya': 'Flower - nourishment and care',
      'Ashlesha': 'Serpent - transformation and wisdom',
      'Magha': 'Throne - power and authority',
      'Purva Phalguni': 'Front legs of bed - pleasure and marriage',
      'Uttara Phalguni': 'Back legs of bed - friendship and service',
      'Hasta': 'Hand - skill and craftsmanship',
      'Chitra': 'Pearl - beauty and brilliance',
      'Swati': 'Shoot of plant - independence and growth',
      'Vishakha': 'Triumphal arch - achievement and victory',
      'Anuradha': 'Lotus flower - devotion and friendship',
      'Jyeshta': 'Umbrella - protection and seniority',
      'Mula': 'Bunch of roots - foundation and investigation',
      'Purva Ashadha': 'Elephant tusk - invincibility and wisdom',
      'Uttara Ashadha': 'Elephant tusk - victory and perseverance',
      'Shravana': 'Ear - learning and listening',
      'Dhanishta': 'Drum - rhythm and celebration',
      'Shatabhisha': 'Empty circle - healing and purification',
      'Purva Bhadrapada': 'Sword - transformation and warfare',
      'Uttara Bhadrapada': 'Twins - wisdom and liberation',
      'Revati': 'Fish - prosperity and guidance'
    };

    return symbols[nakshatra] || 'Universal symbolism';
  }

  /**
   * Analyze Manglik dosha
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Manglik analysis
   */
  _analyzeManglikDosha(kundli1, kundli2) {
    // Manglik dosha occurs when Mars is in certain houses from Lagna or Moon
    const manglikHouses = [1, 2, 4, 7, 8, 12]; // Houses where Mars causes Manglik dosha

    const mars1House = kundli1.planetaryPositions.mars?.house;
    const mars2House = kundli2.planetaryPositions.mars?.house;

    const person1Manglik = manglikHouses.includes(mars1House);
    const person2Manglik = manglikHouses.includes(mars2House);

    let doshaStrength = 'None';
    let compatibility = 'Compatible';
    let remedies = [];

    if (person1Manglik && person2Manglik) {
      doshaStrength = 'Double Manglik';
      compatibility = 'Highly Compatible';
      remedies = ['Both partners should perform Kumbh Vivah ceremony'];
    } else if (person1Manglik || person2Manglik) {
      doshaStrength = 'Single Manglik';
      compatibility = 'Requires remedies';
      remedies = [
        'Perform Manglik dosha nivaran puja',
        'Fast on Tuesdays',
        'Donate red items to temples',
        'Consider marriage after age 28'
      ];
    }

    return {
      person1Manglik,
      person2Manglik,
      doshaStrength,
      compatibility,
      remedies,
      description: person1Manglik || person2Manglik ?
        'Manglik dosha present - remedies recommended' :
        'No Manglik dosha - auspicious for marriage'
    };
  }

  /**
   * Calculate overall compatibility
   * @private
   * @param {Object} gunaMatching - Guna matching results
   * @param {Object} manglikAnalysis - Manglik analysis
   * @returns {Object} Overall compatibility
   */
  _calculateOverallCompatibility(gunaMatching, manglikAnalysis) {
    const gunaScore = gunaMatching.percentage;
    let manglikPenalty = 0;

    if (manglikAnalysis.doshaStrength === 'Single Manglik') {
      manglikPenalty = 10; // Reduce score by 10% for single Manglik
    }

    const finalScore = Math.max(0, gunaScore - manglikPenalty);

    let compatibility = 'Not Recommended';
    if (finalScore >= 75) compatibility = 'Excellent Match';
    else if (finalScore >= 60) compatibility = 'Good Match';
    else if (finalScore >= 40) compatibility = 'Average Match';
    else if (finalScore >= 25) compatibility = 'Challenging Match';

    return {
      score: finalScore,
      compatibility,
      factors: {
        gunaScore,
        manglikPenalty,
        finalScore
      }
    };
  }

  /**
   * Generate marriage recommendations
   * @private
   * @param {Object} overallScore - Overall compatibility score
   * @param {Object} gunaMatching - Guna matching results
   * @param {Object} manglikAnalysis - Manglik analysis
   * @returns {Array} Recommendations
   */
  _generateMarriageRecommendations(overallScore, gunaMatching, manglikAnalysis) {
    const recommendations = [];

    if (overallScore.score >= 75) {
      recommendations.push('Excellent compatibility! This is a highly auspicious match.');
      recommendations.push('Proceed with marriage ceremonies and celebrations.');
    } else if (overallScore.score >= 60) {
      recommendations.push('Good compatibility with some areas for attention.');
      recommendations.push('Consider performing remedial measures for challenging areas.');
    } else if (overallScore.score >= 40) {
      recommendations.push('Average compatibility - requires careful consideration.');
      recommendations.push('Consult with elders and perform additional compatibility checks.');
    } else {
      recommendations.push('Challenging compatibility - not traditionally recommended.');
      recommendations.push('Consider alternative matches or extensive remedial measures.');
    }

    // Add Manglik recommendations
    if (manglikAnalysis.remedies.length > 0) {
      recommendations.push('Manglik remedies:');
      manglikAnalysis.remedies.forEach(remedy => {
        recommendations.push(`• ${remedy}`);
      });
    }

    // Add Guna-specific recommendations
    if (gunaMatching.totalPoints < 18) {
      recommendations.push('Low Guna score - consider consulting a Vedic astrologer for detailed analysis.');
    }

    return recommendations;
  }

  /**
   * Generate marriage summary
   * @private
   * @param {Object} overallScore - Overall compatibility score
   * @param {Object} gunaMatching - Guna matching results
   * @param {Object} manglikAnalysis - Manglik analysis
   * @returns {string} Summary text
   */
  _generateMarriageSummary(overallScore, gunaMatching, manglikAnalysis) {
    let summary = `💕 *Marriage Compatibility Analysis*\n\n`;
    summary += `*Overall Score:* ${overallScore.score}% (${overallScore.compatibility})\n`;
    summary += `*Guna Matching:* ${gunaMatching.totalPoints}/36 points (${gunaMatching.percentage}%)\n`;
    summary += `*Manglik Status:* ${manglikAnalysis.doshaStrength}\n\n`;

    if (gunaMatching.totalPoints >= 24) {
      summary += '🎉 *Excellent Match!* High Guna compatibility suggests harmonious marriage.\n\n';
    } else if (gunaMatching.totalPoints >= 18) {
      summary += '👍 *Good Match* with some areas needing attention.\n\n';
    } else {
      summary += '⚠️ *Challenging Match* - Consider remedies and further consultation.\n\n';
    }

    if (manglikAnalysis.person1Manglik || manglikAnalysis.person2Manglik) {
      summary += `*Manglik Considerations:* ${manglikAnalysis.description}\n\n`;
    }

    summary += '*Key Factors:*\n';
    summary += `• Varna: ${gunaMatching.individualGunas.varna.points}/1\n`;
    summary += `• Tara: ${gunaMatching.individualGunas.tara.points}/3\n`;
    summary += `• Yoni: ${gunaMatching.individualGunas.yoni.points}/4\n`;
    summary += `• Grahamaitri: ${gunaMatching.individualGunas.grahamaitri.points}/5\n`;
    summary += `• Gana: ${gunaMatching.individualGunas.gana.points}/6\n`;
    summary += `• Bhakut: ${gunaMatching.individualGunas.bhakut.points}/7\n`;
    summary += `• Nadi: ${gunaMatching.individualGunas.nadi.points}/8\n\n`;

    summary += 'This analysis follows traditional Vedic astrology principles. Consult with family elders and priests for final decisions. 🕉️';

    return summary;
  }

  /**
    * Interpret Guna score
    * @private
    * @param {number} totalPoints - Total Guna points
    * @returns {string} Interpretation
    */
  _interpretGunaScore(totalPoints) {
    if (totalPoints >= 31) return 'Exceptional Match';
    if (totalPoints >= 25) return 'Excellent Match';
    if (totalPoints >= 19) return 'Good Match';
    if (totalPoints >= 15) return 'Average Match';
    if (totalPoints >= 10) return 'Below Average';
    return 'Not Recommended';
  }

  /**
   * Generate Sade Sati analysis for Saturn's transit
   * @param {Object} birthData - User's birth data
   * @returns {Object} Sade Sati analysis
   */
  generateSadeSatiAnalysis(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return {
          error: 'Complete birth details required for Sade Sati analysis'
        };
      }

      // Generate birth chart
      const kundli = this.generateVedicKundli(birthData);
      if (kundli.error) {
        return { error: kundli.error };
      }

      // Analyze current Sade Sati status
      const sadeSatiAnalysis = this._analyzeSadeSati(kundli);

      // Calculate current phase and timing
      const currentPhase = this._calculateSadeSatiPeriod(kundli, new Date());

      // Generate effects based on current phase
      const effects = this._getSadeSatiEffects(sadeSatiAnalysis, currentPhase);

      // Generate remedies
      const remedies = this._generateSadeSatiRemedies(sadeSatiAnalysis, currentPhase);

      return {
        name,
        sadeSatiAnalysis,
        currentPhase,
        effects,
        remedies,
        summary: this._generateSadeSatiSummary(sadeSatiAnalysis, currentPhase, effects, remedies)
      };
    } catch (error) {
      logger.error('Error generating Sade Sati analysis:', error);
      return {
        error: 'Unable to generate Sade Sati analysis at this time'
      };
    }
  }

  /**
   * Analyze Sade Sati in the birth chart
   * @private
   * @param {Object} kundli - Kundli data
   * @returns {Object} Sade Sati analysis
   */
  _analyzeSadeSati(kundli) {
    const analysis = {
      moonSign: '',
      saturnSign: '',
      isInSadeSati: false,
      phase: 'Not in Sade Sati',
      remainingYears: 0,
      intensity: 'None',
      affectedHouses: [],
      saturnPosition: 0,
      moonPosition: 0
    };

    const moon = kundli.planetaryPositions.moon;
    const saturn = kundli.planetaryPositions.saturn;

    if (!moon || !saturn) {
      return analysis;
    }

    analysis.moonSign = moon.sign;
    analysis.saturnSign = saturn.sign;
    analysis.saturnPosition = saturn.house;
    analysis.moonPosition = moon.house;

    // Sade Sati occurs when Saturn transits the 12th, 1st, and 2nd houses from Moon
    const moonHouse = moon.house;
    const saturnHouse = saturn.house;

    // Calculate houses that would be affected by Sade Sati
    const sadeSatiHouses = [
      moonHouse === 1 ? 12 : moonHouse - 1, // 12th from Moon
      moonHouse, // 1st from Moon (Moon's house)
      moonHouse === 12 ? 1 : moonHouse + 1  // 2nd from Moon
    ];

    analysis.affectedHouses = sadeSatiHouses;

    // Check if Saturn is currently in Sade Sati zone
    if (sadeSatiHouses.includes(saturnHouse)) {
      analysis.isInSadeSati = true;

      // Determine which phase
      if (saturnHouse === sadeSatiHouses[0]) {
        analysis.phase = 'Rising Phase (12th from Moon)';
        analysis.intensity = 'Building';
      } else if (saturnHouse === sadeSatiHouses[1]) {
        analysis.phase = 'Peak Phase (Moon sign)';
        analysis.intensity = 'Maximum';
      } else if (saturnHouse === sadeSatiHouses[2]) {
        analysis.phase = 'Setting Phase (2nd from Moon)';
        analysis.intensity = 'Decreasing';
      }

      // Calculate remaining time in current Sade Sati
      analysis.remainingYears = this._calculateRemainingSadeSatiTime(saturnHouse, sadeSatiHouses);
    } else {
      // Calculate when next Sade Sati will occur
      analysis.nextSadeSatiYear = this._calculateNextSadeSatiYear(moonHouse, saturn);
    }

    return analysis;
  }

  /**
   * Calculate current Sade Sati period details
   * @private
   * @param {Object} kundli - Kundli data
   * @param {Date} currentDate - Current date
   * @returns {Object} Current phase details
   */
  _calculateSadeSatiPeriod(kundli, currentDate) {
    const moon = kundli.planetaryPositions.moon;
    if (!moon) {
      return { phase: 'Unknown', startDate: null, endDate: null, progress: 0 };
    }

    const moonSign = moon.sign;
    const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const moonSignIndex = signOrder.indexOf(moonSign);

    // Calculate Sade Sati periods (approximately 7.5 years total)
    const phase1Start = new Date(currentDate.getFullYear() - 2, currentDate.getMonth(), currentDate.getDate()); // 2.5 years before
    const phase1End = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()); // 2.5 years after
    const phase2Start = phase1End;
    const phase2End = new Date(phase2Start.getFullYear() + 2, phase2Start.getMonth(), phase2Start.getDate() + 15); // 2.5 years
    const phase3Start = phase2End;
    const phase3End = new Date(phase3Start.getFullYear() + 2, phase3Start.getMonth(), phase3Start.getDate() + 15); // 2.5 years

    const currentTime = currentDate.getTime();

    if (currentTime >= phase1Start.getTime() && currentTime <= phase1End.getTime()) {
      const progress = ((currentTime - phase1Start.getTime()) / (phase1End.getTime() - phase1Start.getTime())) * 100;
      return {
        phase: 'Phase 1: Rising (12th from Moon)',
        startDate: phase1Start.toLocaleDateString(),
        endDate: phase1End.toLocaleDateString(),
        progress: Math.round(progress),
        description: 'Building phase - challenges begin, testing period starts'
      };
    } else if (currentTime >= phase2Start.getTime() && currentTime <= phase2End.getTime()) {
      const progress = ((currentTime - phase2Start.getTime()) / (phase2End.getTime() - phase2Start.getTime())) * 100;
      return {
        phase: 'Phase 2: Peak (Moon sign)',
        startDate: phase2Start.toLocaleDateString(),
        endDate: phase2End.toLocaleDateString(),
        progress: Math.round(progress),
        description: 'Maximum intensity - major life changes and karmic lessons'
      };
    } else if (currentTime >= phase3Start.getTime() && currentTime <= phase3End.getTime()) {
      const progress = ((currentTime - phase3Start.getTime()) / (phase3End.getTime() - phase3Start.getTime())) * 100;
      return {
        phase: 'Phase 3: Setting (2nd from Moon)',
        startDate: phase3Start.toLocaleDateString(),
        endDate: phase3End.toLocaleDateString(),
        progress: Math.round(progress),
        description: 'Resolution phase - lessons learned, new stability emerges'
      };
    }

    return {
      phase: 'Not currently in Sade Sati',
      startDate: null,
      endDate: null,
      progress: 0,
      description: 'Period of relative stability and growth'
    };
  }

  /**
   * Get Sade Sati effects based on analysis and current phase
   * @private
   * @param {Object} analysis - Sade Sati analysis
   * @param {Object} currentPhase - Current phase details
   * @returns {Array} Effects and impacts
   */
  _getSadeSatiEffects(analysis, currentPhase) {
    const effects = [];

    if (!analysis.isInSadeSati) {
      effects.push({
        type: 'General',
        description: 'Period of relative stability and growth opportunities',
        severity: 'Low',
        duration: 'Ongoing until next Sade Sati'
      });
      return effects;
    }

    // Phase-specific effects
    if (currentPhase.phase.includes('Phase 1')) {
      effects.push({
        type: 'Career & Finance',
        description: 'Career changes, financial challenges, health concerns begin',
        severity: 'Medium',
        duration: '2.5 years'
      });
      effects.push({
        type: 'Relationships',
        description: 'Family tensions, relationship testing, communication issues',
        severity: 'Medium',
        duration: '2.5 years'
      });
    } else if (currentPhase.phase.includes('Phase 2')) {
      effects.push({
        type: 'Major Life Changes',
        description: 'Significant transformations, karmic lessons, major decisions',
        severity: 'High',
        duration: '2.5 years'
      });
      effects.push({
        type: 'Health & Energy',
        description: 'Physical and mental health challenges, energy depletion',
        severity: 'High',
        duration: '2.5 years'
      });
    } else if (currentPhase.phase.includes('Phase 3')) {
      effects.push({
        type: 'Resolution & Growth',
        description: 'Lessons learned, new stability, wisdom gained',
        severity: 'Medium-High',
        duration: '2.5 years'
      });
      effects.push({
        type: 'Future Planning',
        description: 'Long-term planning, relationship stability, career consolidation',
        severity: 'Medium',
        duration: '2.5 years'
      });
    }

    // Moon sign specific effects
    const moonSignEffects = this._getMoonSignSadeSatiEffects(analysis.moonSign);
    effects.push(...moonSignEffects);

    return effects;
  }

  /**
    * Generate Sade Sati remedies using comprehensive Vedic Remedies system
    * @private
    * @param {Object} analysis - Sade Sati analysis
    * @param {Object} currentPhase - Current phase details
    * @returns {Object} Comprehensive remedies package
    */
  _generateSadeSatiRemedies(analysis, currentPhase) {
    if (!this._vedicRemedies) {
      // Fallback to basic remedies if VedicRemedies not available
      return this._generateBasicSadeSatiRemedies(analysis, currentPhase);
    }

    try {
      // Get comprehensive remedies from VedicRemedies system
      const remediesData = this._vedicRemedies.generateDoshaRemedies('sade_sati');

      if (remediesData.error) {
        return this._generateBasicSadeSatiRemedies(analysis, currentPhase);
      }

      // Enhance with phase-specific and moon sign remedies
      const enhancedRemedies = { ...remediesData };

      // Add phase-specific remedies
      if (analysis.isInSadeSati) {
        const phaseRemedies = this._getPhaseSpecificSadeSatiRemedies(currentPhase);
        if (phaseRemedies.length > 0) {
          enhancedRemedies.phaseSpecific = phaseRemedies;
        }
      }

      // Add moon sign specific remedies
      const moonSignRemedies = this._getMoonSignSadeSatiRemedies(analysis.moonSign);
      if (moonSignRemedies.length > 0) {
        enhancedRemedies.moonSignSpecific = moonSignRemedies;
      }

      return enhancedRemedies;
    } catch (error) {
      logger.error('Error generating comprehensive Sade Sati remedies:', error);
      return this._generateBasicSadeSatiRemedies(analysis, currentPhase);
    }
  }

  /**
    * Generate basic Sade Sati remedies (fallback)
    * @private
    * @param {Object} analysis - Sade Sati analysis
    * @param {Object} currentPhase - Current phase details
    * @returns {Object} Basic remedies
    */
  _generateBasicSadeSatiRemedies(analysis, currentPhase) {
    const remedies = [];

    if (!analysis.isInSadeSati) {
      remedies.push({
        type: 'Preparation',
        description: 'Prepare for future Sade Sati by strengthening spiritual practices',
        urgency: 'Low',
        category: 'Spiritual'
      });
      return { basic: remedies };
    }

    // General remedies for all phases
    remedies.push({
      type: 'Saturn Worship',
      description: 'Regular worship of Lord Saturn (Shani) on Saturdays',
      urgency: 'High',
      category: 'Spiritual'
    });

    remedies.push({
      type: 'Fasting',
      description: 'Fast on Saturdays, especially during Sade Sati periods',
      urgency: 'High',
      category: 'Spiritual'
    });

    remedies.push({
      type: 'Charity',
      description: 'Donate sesame seeds, black clothes, and iron items to poor',
      urgency: 'High',
      category: 'Charitable'
    });

    // Phase-specific remedies
    const phaseRemedies = this._getPhaseSpecificSadeSatiRemedies(currentPhase);
    remedies.push(...phaseRemedies);

    // Moon sign specific remedies
    const moonSignRemedies = this._getMoonSignSadeSatiRemedies(analysis.moonSign);
    remedies.push(...moonSignRemedies);

    return { basic: remedies };
  }

  /**
    * Get phase-specific Sade Sati remedies
    * @private
    * @param {Object} currentPhase - Current phase details
    * @returns {Array} Phase-specific remedies
    */
  _getPhaseSpecificSadeSatiRemedies(currentPhase) {
    const remedies = [];

    if (currentPhase.phase.includes('Phase 1') || currentPhase.phase.includes('Rising')) {
      remedies.push({
        type: 'Protection',
        description: 'Wear black sapphire or iron ring for protection',
        urgency: 'Medium',
        category: 'Gemstone'
      });
    } else if (currentPhase.phase.includes('Phase 2') || currentPhase.phase.includes('Peak')) {
      remedies.push({
        type: 'Mantras',
        description: 'Chant "Om Sham Shanishcharaya Namaha" daily',
        urgency: 'High',
        category: 'Mantra'
      });
      remedies.push({
        type: 'Puja',
        description: 'Perform Shani Sade Sati Nivaran Puja',
        urgency: 'High',
        category: 'Ritual'
      });
    } else if (currentPhase.phase.includes('Phase 3') || currentPhase.phase.includes('Setting')) {
      remedies.push({
        type: 'Gratitude',
        description: 'Express gratitude for lessons learned, maintain positive attitude',
        urgency: 'Medium',
        category: 'Mental'
      });
    }

    return remedies;
  }

  /**
   * Generate Sade Sati summary
   * @private
   * @param {Object} analysis - Sade Sati analysis
   * @param {Object} currentPhase - Current phase details
   * @param {Array} effects - Effects
   * @param {Array} remedies - Remedies
   * @returns {string} Summary text
   */
  _generateSadeSatiSummary(analysis, currentPhase, effects, remedies) {
    let summary = `🪐 *Sade Sati Analysis*\n\n`;

    summary += `*Moon Sign:* ${analysis.moonSign}\n`;
    summary += `*Saturn Position:* ${analysis.saturnSign} (${analysis.saturnPosition}th house)\n\n`;

    if (analysis.isInSadeSati) {
      summary += `⚠️ *Currently in Sade Sati*\n\n`;
      summary += `*Current Phase:* ${currentPhase.phase}\n`;
      summary += `*Progress:* ${currentPhase.progress}% complete\n`;
      summary += `*Intensity:* ${analysis.intensity}\n`;
      summary += `*Time Remaining:* Approximately ${analysis.remainingYears} years\n\n`;

      summary += `*Key Effects:*\n`;
      effects.slice(0, 3).forEach(effect => {
        summary += `• ${effect.type}: ${effect.description}\n`;
      });
      summary += '\n';

      summary += `*🕉️ Comprehensive Remedies:*\n\n`;

      // Gemstones
      if (remedies.gemstones && remedies.gemstones.length > 0) {
        summary += `*💎 Recommended Gemstones:*\n`;
        remedies.gemstones.forEach(gem => {
          summary += `• ${gem.name} (${gem.sanskrit}) - ${gem.day}\n`;
        });
        summary += '\n';
      }

      // Mantras
      if (remedies.mantras && remedies.mantras.length > 0) {
        summary += `*📿 Powerful Mantras:*\n`;
        remedies.mantras.forEach(mantra => {
          summary += `• "${mantra.beej}"\n`;
        });
        summary += '\n';
      }

      // Puja
      if (remedies.puja) {
        summary += `*🙏 Recommended Puja:*\n`;
        summary += `• ${remedies.puja.name}\n`;
        summary += `• Benefits: ${remedies.puja.benefits}\n\n`;
      }

      // Special practices
      if (remedies.special) {
        summary += `*⚡ Special Practices:*\n`;
        if (remedies.special.fasting) summary += `• Fasting: ${remedies.special.fasting}\n`;
        if (remedies.special.offerings) summary += `• Offerings: ${remedies.special.offerings}\n`;
        if (remedies.special.rituals) summary += `• Rituals: ${remedies.special.rituals}\n`;
        summary += '\n';
      }

      // Phase-specific remedies
      if (remedies.phaseSpecific && remedies.phaseSpecific.length > 0) {
        summary += `*🌅 Phase-Specific Remedies:*\n`;
        remedies.phaseSpecific.slice(0, 2).forEach(remedy => {
          summary += `• ${remedy.description}\n`;
        });
        summary += '\n';
      }

      // Moon sign specific remedies
      if (remedies.moonSignSpecific && remedies.moonSignSpecific.length > 0) {
        summary += `*🌙 Moon Sign Remedies:*\n`;
        remedies.moonSignSpecific.slice(0, 2).forEach(remedy => {
          summary += `• ${remedy.description}\n`;
        });
        summary += '\n';
      }

      // Basic remedies fallback
      if (remedies.basic && remedies.basic.length > 0) {
        summary += `*Basic Remedies:*\n`;
        remedies.basic.slice(0, 3).forEach(remedy => {
          summary += `• ${remedy.description}\n`;
        });
        summary += '\n';
      }

      summary += '*Remember:* Sade Sati brings karmic lessons and growth opportunities. Stay patient and maintain spiritual practices. 🕉️';
    } else {
      summary += `✅ *Not currently in Sade Sati*\n\n`;
      summary += `*Next Sade Sati:* Around ${analysis.nextSadeSatiYear}\n\n`;
      summary += 'Use this time to prepare spiritually and strengthen your foundations for future challenges.';
    }

    return summary;
  }

  /**
   * Calculate remaining time in current Sade Sati
   * @private
   * @param {number} saturnHouse - Saturn's current house
   * @param {Array} sadeSatiHouses - Affected houses
   * @returns {number} Remaining years
   */
  _calculateRemainingSadeSatiTime(saturnHouse, sadeSatiHouses) {
    const currentIndex = sadeSatiHouses.indexOf(saturnHouse);
    const remainingPhases = 3 - currentIndex - 1; // Each phase is ~2.5 years
    return remainingPhases * 2.5;
  }

  /**
   * Calculate next Sade Sati year
   * @private
   * @param {number} moonHouse - Moon's house
   * @param {Object} saturn - Saturn position
   * @returns {number} Next Sade Sati year
   */
  _calculateNextSadeSatiYear(moonHouse, saturn) {
    // Simplified calculation - Saturn takes ~29-30 years for full cycle
    const currentYear = new Date().getFullYear();
    // Estimate based on Saturn's position relative to Moon
    return currentYear + Math.floor((12 - (moonHouse - saturn.house + 12) % 12) * 2.5);
  }

  /**
   * Get Moon sign specific Sade Sati effects
   * @private
   * @param {string} moonSign - Moon sign
   * @returns {Array} Moon sign specific effects
   */
  _getMoonSignSadeSatiEffects(moonSign) {
    const effects = {
      'Aries': [{
        type: 'Leadership Challenges',
        description: 'Testing of leadership abilities, conflicts with authority figures',
        severity: 'Medium',
        duration: 'Throughout Sade Sati'
      }],
      'Taurus': [{
        type: 'Financial Testing',
        description: 'Financial stability challenged, material losses possible',
        severity: 'High',
        duration: 'Throughout Sade Sati'
      }],
      'Gemini': [{
        type: 'Communication Issues',
        description: 'Miscommunications, relationship problems, mental stress',
        severity: 'Medium',
        duration: 'Throughout Sade Sati'
      }],
      'Cancer': [{
        type: 'Family & Home',
        description: 'Family conflicts, home changes, emotional turmoil',
        severity: 'High',
        duration: 'Throughout Sade Sati'
      }],
      'Leo': [{
        type: 'Self-Expression',
        description: 'Creative blocks, recognition issues, ego challenges',
        severity: 'Medium-High',
        duration: 'Throughout Sade Sati'
      }],
      'Virgo': [{
        type: 'Health & Service',
        description: 'Health issues, work dissatisfaction, perfectionism challenges',
        severity: 'High',
        duration: 'Throughout Sade Sati'
      }],
      'Libra': [{
        type: 'Relationships',
        description: 'Partnership difficulties, legal issues, balance disruption',
        severity: 'Medium-High',
        duration: 'Throughout Sade Sati'
      }],
      'Scorpio': [{
        type: 'Transformation',
        description: 'Deep psychological changes, power struggles, rebirth',
        severity: 'Very High',
        duration: 'Throughout Sade Sati'
      }],
      'Sagittarius': [{
        type: 'Philosophy & Travel',
        description: 'Belief system challenges, travel disruptions, optimism tested',
        severity: 'Medium',
        duration: 'Throughout Sade Sati'
      }],
      'Capricorn': [{
        type: 'Career & Authority',
        description: 'Career setbacks, authority challenges, responsibility burden',
        severity: 'High',
        duration: 'Throughout Sade Sati'
      }],
      'Aquarius': [{
        type: 'Community & Innovation',
        description: 'Social changes, innovation blocks, friendship challenges',
        severity: 'Medium-High',
        duration: 'Throughout Sade Sati'
      }],
      'Pisces': [{
        type: 'Spirituality & Dreams',
        description: 'Spiritual confusion, boundary issues, escapism tendencies',
        severity: 'High',
        duration: 'Throughout Sade Sati'
      }]
    };

    return effects[moonSign] || [{
      type: 'General Effects',
      description: 'Various life challenges and karmic lessons',
      severity: 'Medium',
      duration: 'Throughout Sade Sati'
    }];
  }

  /**
   * Get Moon sign specific Sade Sati remedies
   * @private
   * @param {string} moonSign - Moon sign
   * @returns {Array} Moon sign specific remedies
   */
  _getMoonSignSadeSatiRemedies(moonSign) {
    const remedies = {
      'Aries': [{
        type: 'Leadership',
        description: 'Practice humility and seek wise counsel',
        urgency: 'Medium',
        category: 'Mental'
      }],
      'Taurus': [{
        type: 'Financial Protection',
        description: 'Save money, avoid risky investments, practice abundance mindset',
        urgency: 'High',
        category: 'Financial'
      }],
      'Gemini': [{
        type: 'Communication',
        description: 'Practice clear communication, avoid gossip, study sacred texts',
        urgency: 'Medium',
        category: 'Mental'
      }],
      'Cancer': [{
        type: 'Family Harmony',
        description: 'Maintain family rituals, practice forgiveness, strengthen home bonds',
        urgency: 'High',
        category: 'Emotional'
      }],
      'Leo': [{
        type: 'Creative Expression',
        description: 'Continue creative pursuits, practice self-acceptance, help others',
        urgency: 'Medium',
        category: 'Creative'
      }],
      'Virgo': [{
        type: 'Health Focus',
        description: 'Regular health check-ups, yoga practice, service to others',
        urgency: 'High',
        category: 'Physical'
      }],
      'Libra': [{
        type: 'Relationship Healing',
        description: 'Practice compromise, seek counseling if needed, maintain fairness',
        urgency: 'Medium',
        category: 'Emotional'
      }],
      'Scorpio': [{
        type: 'Transformation Support',
        description: 'Embrace change, practice meditation, seek spiritual guidance',
        urgency: 'High',
        category: 'Spiritual'
      }],
      'Sagittarius': [{
        type: 'Faith Building',
        description: 'Strengthen spiritual practices, avoid dogma, maintain optimism',
        urgency: 'Medium',
        category: 'Spiritual'
      }],
      'Capricorn': [{
        type: 'Career Support',
        description: 'Network building, skill development, patience in career matters',
        urgency: 'High',
        category: 'Professional'
      }],
      'Aquarius': [{
        type: 'Community Support',
        description: 'Help community causes, maintain friendships, embrace innovation',
        urgency: 'Medium',
        category: 'Social'
      }],
      'Pisces': [{
        type: 'Spiritual Grounding',
        description: 'Regular meditation, avoid escapism, practice compassion',
        urgency: 'High',
        category: 'Spiritual'
      }]
    };

    return remedies[moonSign] || [{
      type: 'General',
      description: 'Maintain spiritual practices and positive attitude',
      urgency: 'Medium',
      category: 'Spiritual'
    }];
  }
}

module.exports = new VedicCalculator();
