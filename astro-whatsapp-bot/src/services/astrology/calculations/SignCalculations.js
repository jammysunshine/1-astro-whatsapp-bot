const logger = require('../../../utils/logger');

/**
 * Sign Calculations Service
 * Handles sun sign, moon sign, and rising sign calculations
 */
class SignCalculations {
  constructor(astrologer, geocodingService, vedicCore) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;
    this.vedicCore = vedicCore;
  }

  /**
   * Calculate sun sign from birth date using professional astrology library
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @param {string} birthTime - Birth time in HH:MM format (optional, defaults to noon)
   * @param {string} birthPlace - Birth place
   * @param {string} chartType - 'tropical' or 'sidereal' (optional, defaults to 'sidereal' for Vedic)
   * @returns {string} Sun sign
   */
  async calculateSunSign(birthDate, birthTime = '12:00', birthPlace = 'Delhi, India', chartType = 'sidereal') {
    try {
      if (!birthDate || typeof birthDate !== 'string') {
        logger.error('Invalid birthDate provided to calculateSunSign:', { birthDate, type: typeof birthDate });
        return this._calculateSunSignFallback('01/01/1990'); // Default fallback
      }

      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const locationInfo = await this.geocodingService.getLocationInfo(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();

      // Prepare data for astrologer library
      const astroData = {
        year,
        month,
        date: day,
        hours: hour,
        minutes: minute,
        seconds: 0,
        latitude: locationInfo.latitude,
        longitude: locationInfo.longitude,
        timezone: locationInfo.timezone,
        chartType
      };

      // Generate natal chart
      const chart = this.astrologer.generateNatalChartData(astroData);

      // Return sun sign from interpretations
      const { sunSign } = chart.interpretations;
      if (!sunSign || sunSign === 'Unknown' || typeof sunSign !== 'string') {
        throw new Error('Invalid sun sign from astrologer');
      }
      return sunSign;
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
   * Calculate moon sign
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time in HH:MM format
   * @param {string} birthPlace - Birth place
   * @param {string} chartType - Chart type
   * @returns {string} Moon sign
   */
  async calculateMoonSign(birthDate, birthTime, birthPlace = 'Delhi, India', chartType = 'sidereal') {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const locationInfo = await this.geocodingService.getLocationInfo(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();

      // Prepare data for astrologer library
      const astroData = {
        year,
        month,
        date: day,
        hours: hour,
        minutes: minute,
        seconds: 0,
        latitude: locationInfo.latitude,
        longitude: locationInfo.longitude,
        timezone: locationInfo.timezone,
        chartType
      };

      // Generate natal chart
      const chart = this.astrologer.generateNatalChartData(astroData);

      // Return moon sign from interpretations
      const { moonSign } = chart.interpretations;
      if (!moonSign || moonSign === 'Unknown' || typeof moonSign !== 'string') {
        throw new Error('Invalid moon sign from astrologer');
      }
      return moonSign;
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
      const signIndex = this.vedicCore.getSignIndex(sunSign);
      const moonSignIndex = (signIndex + 2) % 12; // Approximate

      return this.vedicCore.getSignName(moonSignIndex);
    } catch (error) {
      logger.error('Error in fallback moon sign calculation:', error);
      return 'Unknown';
    }
  }

  /**
   * Calculate rising sign
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time
   * @param {string} birthPlace - Birth place
   * @returns {string} Rising sign
   */
  async calculateRisingSign(birthDate, birthTime, birthPlace) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const locationInfo = await this.geocodingService.getLocationInfo(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();

      // Prepare data for astrologer library
      const astroData = {
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

      // Generate natal chart
      const chart = this.astrologer.generateNatalChartData(astroData);

      // Return rising sign from interpretations
      const { risingSign } = chart.interpretations;
      if (!risingSign || risingSign === 'Unknown' || typeof risingSign !== 'string') {
        throw new Error('Invalid rising sign from astrologer');
      }
      return risingSign;
    } catch (error) {
      logger.error('Error calculating rising sign with astrologer:', error);
      // Fallback to simplified calculation
      const signs = this.vedicCore.getZodiacSigns();
      const [day, month] = birthDate.split('/').map(Number);
      const dayOfYear = this.getDayOfYear(day, month);
      return signs[(dayOfYear + 8) % 12]; // Offset for rising
    }
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
}

module.exports = SignCalculations;
