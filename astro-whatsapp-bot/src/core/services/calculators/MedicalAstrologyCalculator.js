const logger = require('../../../utils/logger');
const sweph = require('sweph');

/**
 * MedicalAstrologyCalculator - Specialized calculator for health patterns and wellness astrology
 * Handles medical astrology calculations including health indicators, house analysis, and recommendations
 */
class MedicalAstrologyCalculator {
  constructor() {
    logger.info(
      'Module: MedicalAstrologyCalculator loaded - Health and wellness astrology'
    );
  }

  setServices(calendricalService, geocodingService) {
    this.calendricalService = calendricalService;
    this.geocodingService = geocodingService;
  }

  /**
   * Calculate medical astrology analysis - health patterns and wellness
   */
  async calculateMedicalAstrologyAnalysis(birthData) {
    try {
      const planetaryPositions = await this._getPlanetaryPositions(birthData);
      const houses = await this._calculateHouses(birthData);

      // Analyze health indicators based on chart
      const healthIndicators = this._analyzeChartHealthIndicators(
        planetaryPositions,
        houses
      );
      const houseAnalysis = this._analyzeHealthHouses(
        planetaryPositions,
        houses
      );
      const focusAreas = this._identifyHealthFocusAreas(
        planetaryPositions,
        houses
      );
      const recommendations = this._generateHealthRecommendations(focusAreas);

      const introduction =
        'Your birth chart reveals innate health patterns and potential challenges. Medical astrology helps understand how planetary influences affect your physical well-being and vitality.';

      return {
        introduction,
        healthIndicators,
        houseAnalysis,
        focusAreas,
        recommendations
      };
    } catch (error) {
      logger.error('Medical Astrology calculation error:', error);
      throw new Error('Failed to calculate medical astrology analysis');
    }
  }

  /**
   * Get planetary positions for birth data
   * @private
   */
  async _getPlanetaryPositions(birthData) {
    const { birthDate, birthTime, timezone = 5.5 } = birthData;
    const [day, month, year] = birthDate.split('/').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);

    const utcTime = new Date(
      Date.UTC(year, month - 1, day, hour - timezone, minute)
    );
    const julianDay = utcTime.getTime() / 86400000 + 2440587.5;

    const planets = {};
    const planetEphemIds = [
      sweph.SE_SUN,
      sweph.SE_MOON,
      sweph.SE_MARS,
      sweph.SE_MERCURY,
      sweph.SE_JUPITER,
      sweph.SE_VENUS,
      sweph.SE_SATURN
    ];
    const planetNames = [
      'Sun',
      'Moon',
      'Mars',
      'Mercury',
      'Jupiter',
      'Venus',
      'Saturn'
    ];

    planetEphemIds.forEach((ephemId, index) => {
      const result = sweph.swe_calc_ut(julianDay, ephemId, sweph.SEFLG_SPEED);
      if (result.rc >= 0) {
        planets[planetNames[index]] = {
          longitude: result.longitude[0],
          latitude: result.latitude[0],
          speed: result.longitude[2]
        };
      }
    });

    return planets;
  }

  /**
   * Calculate houses using Placidian system
   * @private
   */
  async _calculateHouses(birthData) {
    const {
      birthDate,
      birthTime,
      latitude = 28.6139,
      longitude = 77.209,
      timezone = 5.5
    } = birthData;
    const [day, month, year] = birthDate.split('/').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);

    const utcTime = new Date(
      Date.UTC(year, month - 1, day, hour - timezone, minute)
    );
    const julianDay = utcTime.getTime() / 86400000 + 2440587.5;

    const cusps = new Array(13);
    const result = sweph.swe_houses(julianDay, latitude, longitude, 'P', cusps);
    return cusps;
  }

  /**
   * Get zodiac sign from longitude
   * @private
   */
  _getSignFromLongitude(longitude) {
    const signs = [
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
    const signIndex = Math.floor(longitude / 30);
    return signs[signIndex];
  }

  /**
   * Get house number from longitude and ascendant
   * @private
   */
  _getHouseNumber(longitude, ascendant) {
    const angle = (longitude - ascendant + 360) % 360;
    return Math.floor(angle / 30) + 1;
  }

  // ================= MEDICAL ASTROLOGY METHODS =================

  /**
   * Analyze chart health indicators
   * @private
   */
  _analyzeChartHealthIndicators(planets, cusps) {
    const indicators = [];

    Object.keys(planets).forEach(planet => {
      if (planets[planet]?.longitude) {
        const house = this._getHouseNumber(planets[planet].longitude, cusps[0]);
        const sign = this._getSignFromLongitude(planets[planet].longitude);
        const interpretation = this._getPlanetHealthInterpretation(
          planet,
          house,
          planets[planet].longitude
        );

        indicators.push({
          planet,
          sign,
          house,
          interpretation
        });
      }
    });

    return indicators.slice(0, 5);
  }

  /**
   * Analyze health houses
   * @private
   */
  _analyzeHealthHouses(planets, cusps) {
    const houseAnalysis = [];

    const sixthHouseSign = this._getSignFromLongitude(cusps[5]);
    houseAnalysis.push({
      house: '6th House (Daily Health & Service)',
      interpretation: `${sixthHouseSign} in 6th house suggests health maintained through daily routines.`
    });

    const eighthHouseSign = this._getSignFromLongitude(cusps[7]);
    houseAnalysis.push({
      house: '8th House (Chronic Conditions & Recovery)',
      interpretation: `${eighthHouseSign} in 8th house indicates transformation through health challenges.`
    });

    return houseAnalysis;
  }

  /**
   * Identify health focus areas
   * @private
   */
  _identifyHealthFocusAreas(planets, cusps) {
    const focusAreas = [];

    if (planets.Saturn?.longitude) {
      const saturnHouse = this._getHouseNumber(
        planets.Saturn.longitude,
        cusps[0]
      );
      if (saturnHouse === 6 || saturnHouse === 12) {
        focusAreas.push({
          area: 'Chronic Conditions',
          insights: 'Saturn\'s position suggests long-term health maintenance.'
        });
      }
    }

    if (focusAreas.length === 0) {
      focusAreas.push({
        area: 'General Wellness',
        insights: 'Your chart shows balanced health indicators.'
      });
    }

    return focusAreas.slice(0, 3);
  }

  /**
   * Generate health recommendations
   * @private
   */
  _generateHealthRecommendations(focusAreas) {
    const recommendations = [];

    if (focusAreas[0].area === 'Chronic Conditions') {
      recommendations.push(
        'Establish consistent health routines and consider specialized medical guidance'
      );
    } else {
      recommendations.push(
        'Maintain a balanced diet, regular sleep schedule, and stress management'
      );
    }

    return recommendations;
  }

  /**
   * Get planet health interpretation
   * @private
   */
  _getPlanetHealthInterpretation(planet, house, longitude) {
    const sign = this._getSignFromLongitude(longitude);

    const interpretations = {
      Sun: {
        6: 'Sun in 6th house suggests vitality through daily routine',
        default: 'Sun represents core vitality and life force energy'
      },
      Moon: {
        6: 'Moon in 6th house connects emotional well-being to daily habits',
        default: 'Moon influences emotional health and sensitivity'
      },
      Mars: {
        8: 'Mars in 8th house suggests energetic transformation',
        default: 'Mars represents physical energy and immunity'
      }
    };

    return (
      interpretations[planet]?.[house] ||
      interpretations[planet]?.default ||
      `${planet} represents health influences in ${sign}`
    );
  }

  /**
   * Check if message is a medical astrology request
   * @private
   */
  _isMedicalAstrologyRequest(message) {
    if (!message || typeof message !== 'string') return false;

    const keywords = [
      'medical',
      'health',
      'disease',
      'illness',
      'health analysis',
      'medical astrology',
      'wellness',
      'health patterns'
    ];

    const lowerMessage = message.toLowerCase();
    return keywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Format birth data required message for medical astrology
   * @private
   */
  _formatMedicalBirthDataRequiredMessage() {
    return '🏥 *Medical Astrology Analysis*\n\n👤 I need your birth details for personalized health analysis.\n\nSend format: DDMMYY or DDMMYYYY\nExample: 150691 (June 15, 1991)';
  }

  /**
   * Handle Medical Astrology request (migrated from handler)
   * @param {string} message - User message
   * @param {Object} user - User object
   * @returns {string|null} Response or null if not handled
   */
  async handleMedicalAstrologyRequest(message, user) {
    if (!this._isMedicalAstrologyRequest(message)) {
      return null;
    }

    if (!user.birthDate) {
      return this._formatMedicalBirthDataRequiredMessage();
    }

    try {
      const birthData = {
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi, India',
        latitude: user.latitude || 28.6139,
        longitude: user.longitude || 77.209,
        timezone: user.timezone || 5.5
      };

      const analysis = await this.calculateMedicalAstrologyAnalysis(birthData);

      if (analysis.error) {
        return '❌ Unable to generate medical astrology analysis.';
      }

      // Format response with medical sections
      let healthResult = '🏥 *Medical Astrology Analysis*\n\n';
      healthResult += `📋 ${analysis.introduction}\n\n`;

      if (analysis.healthIndicators && analysis.healthIndicators.length > 0) {
        healthResult += `🩺 *Health Indicators:*\n`;
        analysis.healthIndicators.slice(0, 3).forEach(indicator => {
          healthResult += `• ${indicator.planet} in ${indicator.sign} (${indicator.house}): ${indicator.interpretation}\n`;
        });
        healthResult += '\n';
      }

      if (analysis.focusAreas && analysis.focusAreas.length > 0) {
        healthResult += `🎯 *Focus Areas:*\n`;
        analysis.focusAreas.forEach(area => {
          healthResult += `• ${area.area}: ${area.insights}\n`;
        });
        healthResult += '\n';
      }

      if (analysis.recommendations && analysis.recommendations.length > 0) {
        healthResult += `💊 *Recommendations:*\n`;
        analysis.recommendations.forEach(rec => {
          healthResult += `• ${rec}\n`;
        });
        healthResult += '\n';
      }

      healthResult += `⚠️ *Disclaimer:* Medical astrology complements, but does not replace, professional medical advice. Consult healthcare providers for medical concerns.\n\n`;

      healthResult += '🕉️ *Vedic wellness integrates planetary influences with natural healing for holistic health.';

      return healthResult;

    } catch (error) {
      logger.error('Medical astrology error:', error);
      return '❌ Error generating medical astrology analysis.';
    }
  }

  /**
   * Health check for MedicalAstrologyCalculator
   * @returns {Object} Health status
   */
  healthCheck() {
    return {
      healthy: true,
      version: '1.0.0',
      name: 'MedicalAstrologyCalculator',
      calculations: [
        'Health Indicators',
        'House Analysis',
        'Focus Areas',
        'Recommendations',
        'Handler Methods'
      ],
      status: 'Operational'
    };
  }
}

module.exports = { MedicalAstrologyCalculator };