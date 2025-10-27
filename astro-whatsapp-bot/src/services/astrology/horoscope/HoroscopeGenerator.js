const logger = require('../../../utils/logger');

/**
 * Daily Horoscope Generator
 * Generates personalized daily horoscopes based on birth data and transits
 */
class HoroscopeGenerator {
  constructor(astrologer, signCalculations, geocodingService) {
    this.astrologer = astrologer;
    this.signCalculations = signCalculations;
    this.geocodingService = geocodingService;
  }

  /**
   * Generate detailed daily horoscope using professional astrology
   * @param {Object} birthData - Birth data object
   * @returns {Object} Detailed horoscope data
   */
  async generateDailyHoroscope(birthData) {
    try {
      const { birthDate, birthTime = '12:00', birthPlace = 'Delhi, India' } = birthData;

      if (!birthDate || typeof birthDate !== 'string') {
        throw new Error('Invalid birth date provided');
      }

      // Parse birth date
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone for birth place
      const locationInfo = await this.geocodingService.getLocationInfo(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const birthTimestamp = birthDateTime.getTime();

      // Get current date for transit calculations
      const now = new Date();
      const currentDay = now.getDate();
      const currentMonth = now.getMonth() + 1; // JS months are 0-based
      const currentYear = now.getFullYear();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimestamp = now.getTime();

      // Get timezone for current location (assuming same as birth place for simplicity, or could use current user location)
      const currentLatitude = locationInfo.latitude;
      const currentLongitude = locationInfo.longitude;

      // Use astrologer library for detailed analysis
      if (this.astrologer) {
        try {
          const natalData = {
            year,
            month,
            date: day,
            hours: hour,
            minutes: minute,
            seconds: 0,
            latitude: locationInfo.latitude,
            longitude: locationInfo.longitude,
            timezone: locationInfo.timezone,
            chartType: 'sidereal'
          };

          const transitData = {
            year: currentYear,
            month: currentMonth,
            date: currentDay,
            hours: currentHour,
            minutes: currentMinute,
            seconds: 0,
            latitude: currentLatitude,
            longitude: currentLongitude,
            timezone: locationInfo.timezone,
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
      const sunSign = await this.signCalculations.calculateSunSign(birthDate, birthTime, birthPlace);
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
   * Generate 3-day transit preview with real astrological calculations
   * @param {Object} birthData - Birth data
   * @param {number} days - Number of days
   * @returns {Object} Transit preview
   */
  async generateTransitPreview(birthData, days = 3) {
    try {
      const { birthDate, birthTime = '12:00', birthPlace = 'Delhi, India' } = birthData;

      // Parse birth date and time
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get birth coordinates and timezone
      const locationInfo = await this.geocodingService.getLocationInfo(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const birthTimestamp = birthDateTime.getTime();

      // Prepare natal data
      const natalData = {
        year, month, date: day, hours: hour, minutes: minute, seconds: 0,
        latitude: locationInfo.latitude, longitude: locationInfo.longitude, timezone: locationInfo.timezone,
        chartType: 'sidereal'
      };

      const transits = {};

      // Generate transit preview for each day
      for (let i = 0; i < days; i++) {
        const transitDate = new Date();
        transitDate.setDate(transitDate.getDate() + i);

        const transitData = {
          year: transitDate.getFullYear(),
          month: transitDate.getMonth() + 1,
          date: transitDate.getDate(),
          hours: 12, minutes: 0, seconds: 0, // Noon for daily transits
          latitude: locationInfo.latitude, longitude: locationInfo.longitude, timezone: locationInfo.timezone,
          chartType: 'sidereal'
        };

        // Generate transit chart
        const transitChart = this.astrologer.generateTransitChartData(natalData, transitData);

        // Analyze major transits and aspects
        const dayName = i === 0 ? 'today' : i === 1 ? 'tomorrow' : `day${i + 1}`;
        transits[dayName] = this._interpretDailyTransits(transitChart, i);
      }

      return transits;
    } catch (error) {
      logger.error('Error generating transit preview:', error);
      // Fallback to basic preview
      return {
        today: '🌅 *Today:* Planetary energies support new beginnings and communication. Perfect for starting conversations or initiating projects.',
        tomorrow: '🌞 *Tomorrow:* Focus on relationships and partnerships. Harmonious energies make this a good day for collaboration.',
        day3: '🌙 *Day 3:* Creative inspiration flows strongly. Use this energy for artistic pursuits or innovative thinking.'
      };
    }
  }

  /**
   * Interpret daily transits for transit preview
   * @private
   * @param {Object} transitChart - Transit chart data
   * @param {number} dayOffset - Days from today (0 = today, 1 = tomorrow, etc.)
   * @returns {string} Daily transit interpretation
   */
  _interpretDailyTransits(transitChart, dayOffset) {
    const dayNames = ['Today', 'Tomorrow', 'Day 3'];
    const dayName = dayNames[dayOffset] || `Day ${dayOffset + 1}`;

    let interpretation = `🌟 *${dayName}:* `;

    const aspects = transitChart.aspects || [];
    const planets = transitChart.planets || [];

    // Analyze major planetary aspects
    const majorAspects = aspects.filter(aspect =>
      ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(aspect.planet1) ||
      ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(aspect.planet2)
    );

    // Check for significant transits
    const sunAspects = majorAspects.filter(a => a.planet1 === 'Sun' || a.planet2 === 'Sun');
    const moonAspects = majorAspects.filter(a => a.planet1 === 'Moon' || a.planet2 === 'Moon');
    const venusAspects = majorAspects.filter(a => a.planet1 === 'Venus' || a.planet2 === 'Venus');
    const marsAspects = majorAspects.filter(a => a.planet1 === 'Mars' || a.planet2 === 'Mars');

    const insights = [];

    // Sun transits (consciousness, vitality)
    if (sunAspects.length > 0) {
      const sunAspect = sunAspects[0];
      if (sunAspect.aspect === 'Trine' || sunAspect.aspect === 'Sextile') {
        insights.push('Solar energy brings confidence and vitality');
      } else if (sunAspect.aspect === 'Square' || sunAspect.aspect === 'Opposition') {
        insights.push('Solar challenges encourage self-awareness and growth');
      }
    }

    // Moon transits (emotions, intuition)
    if (moonAspects.length > 0) {
      const moonAspect = moonAspects[0];
      if (moonAspect.aspect === 'Trine' || moonAspect.aspect === 'Sextile') {
        insights.push('Emotional awareness and intuition are heightened');
      } else if (moonAspect.aspect === 'Square' || moonAspect.aspect === 'Opposition') {
        insights.push('Emotional challenges invite inner reflection');
      }
    }

    // Venus transits (relationships, harmony)
    if (venusAspects.length > 0) {
      insights.push('Harmonious energies favor relationships and creative pursuits');
    }

    // Mars transits (action, energy)
    if (marsAspects.length > 0) {
      insights.push('Dynamic energy supports action and new beginnings');
    }

    // Mercury transits (communication, thinking)
    const mercuryAspects = majorAspects.filter(a => a.planet1 === 'Mercury' || a.planet2 === 'Mercury');
    if (mercuryAspects.length > 0) {
      insights.push('Communication and mental clarity are emphasized');
    }

    // Jupiter transits (expansion, wisdom)
    const jupiterAspects = majorAspects.filter(a => a.planet1 === 'Jupiter' || a.planet2 === 'Jupiter');
    if (jupiterAspects.length > 0) {
      insights.push('Opportunities for growth and learning present themselves');
    }

    // Saturn transits (structure, responsibility)
    const saturnAspects = majorAspects.filter(a => a.planet1 === 'Saturn' || a.planet2 === 'Saturn');
    if (saturnAspects.length > 0) {
      insights.push('Focus on structure, discipline, and long-term goals');
    }

    if (insights.length === 0) {
      // Default interpretation based on day
      const defaults = [
        'Planetary energies support new beginnings and communication',
        'Focus on relationships and partnerships with harmonious energies',
        'Creative inspiration flows strongly for artistic pursuits'
      ];
      interpretation += defaults[dayOffset] || 'A balanced day for personal growth and reflection';
    } else {
      interpretation += `${insights.slice(0, 2).join('. ')}.`;
    }

    return interpretation;
  }
}

module.exports = HoroscopeGenerator;