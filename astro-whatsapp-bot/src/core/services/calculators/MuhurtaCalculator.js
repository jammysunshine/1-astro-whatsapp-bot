const logger = require('../../../utils/logger');
const sweph = require('sweph');

/**
 * Muhurta Calculator
 * Calculates auspicious timing (Muhurta) for important activities using Vedic astrology principles
 */
class MuhurtaCalculator {
  constructor(astrologer, geocodingService) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;

    // Auspicious and inauspicious activity categories
    this.activityCategories = {
      marriage: ['wedding', 'engagement', 'marriage commitment'],
      business: ['business opening', 'contract signing', 'investment'],
      spiritual: ['yagya', 'puja', 'mantra initiation', 'temple visit'],
      education: ['school admission', 'exam', 'course starting'],
      health: ['surgery', 'medical treatment', 'therapy'],
      travel: ['long journey', 'house shifting', 'migration'],
      housewarming: ['home entry', 'property purchase', 'construction']
    };

    // Weekday lords and their significances
    this.weekdayLords = {
      Sunday: 'Sun',
      Monday: 'Moon',
      Tuesday: 'Mars',
      Wednesday: 'Mercury',
      Thursday: 'Jupiter',
      Friday: 'Venus',
      Saturday: 'Saturn'
    };

    // Zodiac signs and their natures
    this.signQualities = {
      1: {
        name: 'Aries',
        quality: 'exalted',
        nature: 'fiery',
        element: 'fire'
      },
      2: {
        name: 'Taurus',
        quality: 'feminine',
        nature: 'earthy',
        element: 'earth'
      },
      3: { name: 'Gemini', quality: 'mutable', nature: 'airy', element: 'air' },
      4: {
        name: 'Cancer',
        quality: 'feminine',
        nature: 'watery',
        element: 'water'
      },
      5: {
        name: 'Leo',
        quality: 'masculine',
        nature: 'fiery',
        element: 'fire'
      },
      6: {
        name: 'Virgo',
        quality: 'feminine',
        nature: 'earthy',
        element: 'earth'
      },
      7: {
        name: 'Libra',
        quality: 'masculine',
        nature: 'airy',
        element: 'air'
      },
      8: {
        name: 'Scorpio',
        quality: 'feminine',
        nature: 'watery',
        element: 'water'
      },
      9: {
        name: 'Sagittarius',
        quality: 'mutable',
        nature: 'fiery',
        element: 'fire'
      },
      10: {
        name: 'Capricorn',
        quality: 'feminine',
        nature: 'earthy',
        element: 'earth'
      },
      11: {
        name: 'Aquarius',
        quality: 'masculine',
        nature: 'airy',
        element: 'air'
      },
      12: {
        name: 'Pisces',
        quality: 'mutable',
        nature: 'watery',
        element: 'water'
      }
    };
  }

  /**
   * Set services for the calculator
   */
  setServices(services) {
    this.services = services;
  }

  /**
   * Calculate auspicious time period (Muhurta) for a specific activity
   * @param {Object} requestData - Request data containing activity, date, location
   * @returns {Object} Muhurta analysis with recommendations
   */
  async generateMuhurta(requestData) {
    try {
      const { activity, preferredDate, birthData, location, timeWindow } =
        requestData;

      if (!activity || !preferredDate || !location) {
        return {
          error:
            'Activity, preferred date, and location are required for Muhurta calculation'
        };
      }

      // Parse preferred date and time window
      const [day, month, year] = preferredDate.split('/').map(Number);
      const startHour = timeWindow?.startHour || 6; // Default 6 AM
      const endHour = timeWindow?.endHour || 18; // Default 6 PM

      // Get location coordinates and timezone
      const [latitude, longitude] =
        await this._getCoordinatesForPlace(location);
      const timestamp = new Date(year, month - 1, day).getTime();
      const timezone = await this._getTimezoneForPlace(
        latitude,
        longitude,
        timestamp
      );

      // Calculate daily astronomical factors
      const dailyAnalysis = await this._calculateDailyAuspiciousness(
        year,
        month,
        day,
        latitude,
        longitude,
        timezone,
        activity
      );

      // Analyze optimal time slots within the day
      const timeSlotsAnalysis = this._analyzeTimeSlots(
        year,
        month,
        day,
        startHour,
        endHour,
        timezone,
        latitude,
        longitude,
        activity
      );

      // Check weekday suitability
      const weekdaySuitability = this._analyzeWeekdaySuitability(
        preferredDate,
        activity
      );

      // Calculate planetary strengths for the day
      const planetaryStrengths = this._calculatePlanetaryStrengthsForActivity(
        activity,
        dailyAnalysis
      );

      // Generate final recommendations
      const recommendations = this._generateMuhurtaRecommendations(
        activity,
        timeSlotsAnalysis,
        weekdaySuitability,
        dailyAnalysis,
        planetaryStrengths
      );

      // Find alternative dates if current date is unfavorable
      let alternatives = [];
      if (dailyAnalysis.overallRating === 'Poor') {
        alternatives = await this._suggestAlternativeDates(
          preferredDate,
          activity,
          location,
          7
        ); // Next 7 days
      }

      return {
        activity,
        preferredDate,
        location,
        dailyAnalysis,
        timeSlotsAnalysis,
        weekdaySuitability,
        planetaryStrengths,
        recommendations,
        alternatives,
        summary: this._generateMuhurtaSummary(recommendations, alternatives)
      };
    } catch (error) {
      logger.error('❌ Error in Muhurta calculation:', error);
      throw new Error(`Muhurta calculation failed: ${error.message}`);
    }
  }

  /**
   * Find and recommend the best muhurta within a specified time window
   */
  async recommendBestMuhurta(timeWindow, activity, location) {
    try {
      const { startDate, endDate, startHour, endHour } = timeWindow;
      const [startDay, startMonth, startYear] = startDate
        .split('/')
        .map(Number);
      const [endDay, endMonth, endYear] = endDate.split('/').map(Number);

      const startDateTime = new Date(startYear, startMonth - 1, startDay);
      const endDateTime = new Date(endYear, endMonth - 1, endDay);

      // Get location data
      const [latitude, longitude] =
        await this._getCoordinatesForPlace(location);
      const timestamp = startDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(
        latitude,
        longitude,
        timestamp
      );

      let bestMuhurta = null;
      let bestScore = -1;

      // Scan through each day
      const currentDate = new Date(startDateTime);
      while (currentDate <= endDateTime) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();

        // Calculate daily factors
        const dailyAnalysis = await this._calculateDailyAuspiciousness(
          year,
          month,
          day,
          latitude,
          longitude,
          timezone,
          activity
        );

        // Skip if day is generally poor
        if (dailyAnalysis.overallRating === 'Poor') {
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        // Analyze time slots in this day
        const timeSlots = this._analyzeTimeSlots(
          year,
          month,
          day,
          startHour,
          endHour,
          timezone,
          latitude,
          longitude,
          activity
        );

        // Find best time slot in this day
        Object.entries(timeSlots).forEach(([timeKey, timeData]) => {
          if (
            timeData.suitability.score > bestScore &&
            timeData.suitability.rating !== 'Poor'
          ) {
            bestMuhurta = {
              date: `${day}/${month}/${year}`,
              time: timeKey,
              timeData,
              dailyAnalysis,
              score: timeData.suitability.score
            };
            bestScore = timeData.suitability.score;
          }
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (!bestMuhurta) {
        return {
          error: 'No suitable Muhurta found in the specified time window',
          alternatives: await this._suggestAlternativeDates(
            startDate,
            activity,
            location,
            14
          ) // 2 weeks
        };
      }

      return {
        bestMuhurta,
        activity,
        timeWindow,
        location,
        confidence: this._calculateConfidence(bestScore),
        recommendations: this._generateBestMuhurtaRecommendations(bestMuhurta)
      };
    } catch (error) {
      logger.error('❌ Error in best Muhurta recommendation:', error);
      throw new Error(`Best Muhurta recommendation failed: ${error.message}`);
    }
  }

  /**
   * Calculate daily auspiciousness factors
   */
  async _calculateDailyAuspiciousness(
    year,
    month,
    day,
    latitude,
    longitude,
    timezone,
    activity
  ) {
    const analysis = {
      sunRise: '',
      sunSet: '',
      moonPhase: '',
      tithi: { number: 0, name: '', nature: '' },
      nakshatra: { number: 0, name: '', lord: '', nature: '' },
      yoga: { number: 0, name: '', nature: '' },
      weekday: '',
      planetaryPositions: {},
      auspiciousScore: 0,
      inauspiciousScore: 0,
      overallRating: ''
    };

    // Calculate Julian Day for the date
    const jd = this._dateToJulianDay(year, month, day, 12); // Noon

    try {
      // Calculate planetary positions at noon
      analysis.planetaryPositions = await this._calculatePlanetPositions(jd);

      // Calculate Tithi (lunar phase)
      analysis.tithi = this._calculateTithi(jd);

      // Calculate Nakshatra
      analysis.nakshatra = this._calculateNakshatra(jd);

      // Calculate Yoga
      analysis.yoga = this._calculateYoga(jd);

      // Determine weekday
      const date = new Date(year, month - 1, day);
      analysis.weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

      // Calculate sunrise/sunset (approximate)
      analysis.sunRise = this._calculateSunTimes(
        jd,
        latitude,
        longitude,
        'rise'
      );
      analysis.sunSet = this._calculateSunTimes(jd, latitude, longitude, 'set');

      // Determine moon phase
      analysis.moonPhase = this._determineMoonPhase(analysis.tithi.number);

      // Calculate auspicious/inauspicious scores
      const scores = this._calculateDailyScores(
        analysis,
        activity,
        year,
        month,
        day
      );

      analysis.auspiciousScore = scores.auspicious;
      analysis.inauspiciousScore = scores.inauspicious;

      // Determine overall rating
      analysis.overallRating = this._determineOverallRating(scores, activity);
    } catch (error) {
      logger.warn('Error calculating daily factors:', error.message);
    }

    return analysis;
  }

  /**
   * Analyze time slots within the day
   */
  _analyzeTimeSlots(
    year,
    month,
    day,
    startHour,
    endHour,
    timezone,
    latitude,
    longitude,
    activity
  ) {
    const timeSlots = {};
    const slotDuration = 2; // 2-hour slots

    for (let hour = startHour; hour < endHour; hour += slotDuration) {
      const startTime = hour;
      const endTime = Math.min(hour + slotDuration, endHour);
      const timeKey = `${startTime}:00-${endTime}:00`;

      // Calculate midpoint of the time slot
      const midHour = (startTime + endTime) / 2;

      // Calculate astrological factors at this time
      const jd = this._dateToJulianDay(year, month, day, midHour - timezone);

      timeSlots[timeKey] = this._analyzeTimeSlotSuitability(
        jd,
        latitude,
        longitude,
        activity,
        startTime,
        endTime
      );
    }

    return timeSlots;
  }

  /**
   * Analyze suitability of a specific time slot
   */
  _analyzeTimeSlotSuitability(
    jd,
    latitude,
    longitude,
    activity,
    startTime,
    endTime
  ) {
    const analysis = {
      planetaryPositions: {},
      rulingPlanet: '',
      ascendant: '',
      houses: [],
      suitability: { score: 0, rating: 'Neutral', reasons: [] }
    };

    try {
      // Calculate positions at this time
      analysis.planetaryPositions = this._calculateImportantPositions(jd);

      // Calculate ascendant
      const houses = sweph.houses(jd, latitude, longitude, 'E');
      analysis.ascendant = this._longitudeToSign(houses.ascendant);
      analysis.houses = houses.houseCusps;

      // Determine ruling planet (weekday lord)
      const currentDate = new Date(jd * 24 * 60 * 60 * 1000);
      analysis.rulingPlanet =
        this.weekdayLords[
          currentDate.toLocaleDateString('en-US', { weekday: 'long' })
        ];

      // Calculate suitability for activity
      analysis.suitability = this._calculateTimeSuitability(
        analysis,
        activity,
        startTime,
        endTime
      );
    } catch (error) {
      logger.warn('Error analyzing time slot:', error.message);
      analysis.suitability = {
        score: 0,
        rating: 'Unknown',
        reasons: ['Calculation error']
      };
    }

    return analysis;
  }

  /**
   * Calculate suitability of a time period for an activity
   */
  _calculateTimeSuitability(timeAnalysis, activity, startTime, endTime) {
    let score = 50; // Start with neutral score
    const reasons = [];

    // Activity-specific suitability
    const activityType = this._categorizeActivity(activity);
    const activityRules = this._getActivitySpecificRules(activityType);

    // Check planetary rulership
    const { rulingPlanet } = timeAnalysis;
    if (activityRules.favorablePlanets.includes(rulingPlanet)) {
      score += 20;
      reasons.push(
        `${rulingPlanet} rules this period - favorable for ${activity}`
      );
    } else if (activityRules.challengingPlanets.includes(rulingPlanet)) {
      score -= 15;
      reasons.push(`${rulingPlanet} rules this period - may be challenging`);
    }

    // Check ascendant sign
    const ascendantSign = timeAnalysis.ascendant;
    const signInfo = this.signQualities[ascendantSign];
    if (activityRules.favorableElements.includes(signInfo.element)) {
      score += 10;
      reasons.push(`${signInfo.element} ascendant supports ${activity}`);
    } else if (activityRules.challengingElements.includes(signInfo.element)) {
      score -= 10;
      reasons.push(`${signInfo.element} ascendant may hinder ${activity}`);
    }

    // Check day time vs night time preferences
    const isDayTime = startTime >= 6 && endTime <= 18;
    if (activityRules.prefersDayTime && isDayTime) {
      score += 10;
      reasons.push('Daylight hours preferred for this activity');
    } else if (activityRules.prefersNightTime && !isDayTime) {
      score += 10;
      reasons.push('Nighttime preferred for this activity');
    }

    // Planetary positions assessment
    const importantPositions = timeAnalysis.planetaryPositions;
    Object.entries(importantPositions).forEach(([planet, position]) => {
      const { sign } = position;
      if (this._isExalted(planet, sign)) {
        score += 8;
        reasons.push(`${planet} exalted - very auspicious`);
      } else if (this._isInOwnSign(planet, sign)) {
        score += 5;
        reasons.push(`${planet} in own sign - supportive`);
      }
    });

    const rating =
      score >= 70 ?
        'Excellent' :
        score >= 55 ?
          'Good' :
          score >= 35 ?
            'Fair' :
            'Poor';

    return { score, rating, reasons };
  }

  /**
   * Analyze weekday suitability for activity
   */
  _analyzeWeekdaySuitability(preferredDate, activity) {
    const [day, month, year] = preferredDate.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const rulingPlanet = this.weekdayLords[weekday];

    const suitability = {
      weekday,
      rulingPlanet,
      favorableActivities: [],
      challengingActivities: [],
      rating: 'Neutral'
    };

    // Define activity preferences by weekday
    const weekdayPreferences = {
      Sunday: {
        favorable: ['spiritual', 'creative', 'authority'],
        challenging: ['business', 'legal']
      },
      Monday: {
        favorable: ['education', 'healing', 'household'],
        challenging: ['conflict', 'banquets']
      },
      Tuesday: {
        favorable: ['war', 'courage', 'land', 'competition'],
        challenging: ['marriage', 'surgery']
      },
      Wednesday: {
        favorable: ['communication', 'business', 'magic'],
        challenging: ['travel', 'marriage']
      },
      Thursday: {
        favorable: ['marriage', 'travel', 'wealth', 'spiritual'],
        challenging: ['war', 'arguments']
      },
      Friday: {
        favorable: ['love', 'art', 'beauty', 'pleasure'],
        challenging: ['war', 'funerals']
      },
      Saturday: {
        favorable: ['service', 'construction', 'long-term'],
        challenging: ['marriage', 'travel']
      }
    };

    const preferences = weekdayPreferences[weekday];
    const activityType = this._categorizeActivity(activity);

    if (preferences.favorable.includes(activityType)) {
      suitability.rating = 'Favorable';
      suitability.favorableActivities = preferences.favorable;
    } else if (preferences.challenging.includes(activityType)) {
      suitability.rating = 'Challenging';
      suitability.challengingActivities = preferences.challenging;
    }

    return suitability;
  }

  /**
   * Calculate planetary strengths for the activity
   */
  _calculatePlanetaryStrengthsForActivity(activity, dailyAnalysis) {
    const activityType = this._categorizeActivity(activity);
    const strengths = {};

    // Define planetary significance for different activities
    const activityPlanets = {
      marriage: {
        jupiter: 'Blessings',
        venus: 'Love',
        moon: 'Emotional harmony',
        sun: 'Stability'
      },
      business: {
        mercury: 'Communication',
        sun: 'Authority',
        jupiter: 'Expansion',
        mars: 'Action'
      },
      spiritual: {
        jupiter: 'Wisdom',
        saturn: 'Discipline',
        moon: 'Devotion',
        sun: 'Divine connection'
      },
      education: {
        mercury: 'Knowledge',
        jupiter: 'Understanding',
        moon: 'Memory',
        sun: 'Focus'
      },
      health: {
        sun: 'Vitality',
        moon: 'Emotional health',
        mars: 'Action',
        jupiter: 'Recovery'
      },
      travel: {
        moon: 'Comfort',
        jupiter: 'Success',
        saturn: 'Patience',
        mars: 'Journey'
      }
    };

    const relevantPlanets = activityPlanets[activityType] || {};
    const { planetaryPositions } = dailyAnalysis;

    Object.entries(relevantPlanets).forEach(([planet, significance]) => {
      if (planetaryPositions[planet]) {
        const position = planetaryPositions[planet];
        strengths[planet] = {
          sign: position.sign,
          significance,
          strength: this._assessPlanetaryStrength(planet, position.sign),
          dignity: this._getPlanetaryDignity(planet, position.sign)
        };
      }
    });

    return strengths;
  }

  /**
   * Generate final muhurta recommendations
   */
  _generateMuhurtaRecommendations(
    activity,
    timeSlotsAnalysis,
    weekdaySuitability,
    dailyAnalysis,
    planetaryStrengths
  ) {
    const recommendations = {
      overallSuitability: '',
      recommendedTimeSlots: [],
      precautions: [],
      enhancements: [],
      alternatives: []
    };

    // Determine overall suitability
    const dailyRating = dailyAnalysis.overallRating;
    const weekdayRating = weekdaySuitability.rating;

    if (dailyRating === 'Excellent' && weekdayRating === 'Favorable') {
      recommendations.overallSuitability =
        'Excellent timing - proceed with confidence';
    } else if (dailyRating === 'Good' && weekdayRating !== 'Challenging') {
      recommendations.overallSuitability =
        'Good timing - suitable with some awareness';
    } else if (dailyRating === 'Fair' || weekdayRating === 'Neutral') {
      recommendations.overallSuitability =
        'Fair timing - acceptable but not ideal';
    } else {
      recommendations.overallSuitability =
        'Poor timing - better to choose alternative date/time';
    }

    // Find best time slots
    const sortedSlots = Object.entries(timeSlotsAnalysis)
      .sort(([, a], [, b]) => b.suitability.score - a.suitability.score)
      .slice(0, 3);

    recommendations.recommendedTimeSlots = sortedSlots.map(
      ([timeSlot, analysis]) => ({
        time: timeSlot,
        rating: analysis.suitability.rating,
        score: analysis.suitability.score,
        reasons: analysis.suitability.reasons
      })
    );

    // Generate precautions and enhancements
    this._generatePrecautionsAndEnhancements(
      recommendations,
      activity,
      dailyAnalysis
    );

    return recommendations;
  }

  /**
   * Generate muhurta summary
   */
  _generateMuhurtaSummary(recommendations, alternatives) {
    let summary = '⏰ *Muhurta Analysis*\n\n';

    summary += `*Overall Suitability:* ${recommendations.overallSuitability}\n\n`;

    if (recommendations.recommendedTimeSlots.length > 0) {
      summary += '*Recommended Time Slots:*\n';
      recommendations.recommendedTimeSlots.forEach((slot, index) => {
        summary += `${index + 1}. ${slot.time} - ${slot.rating}\n`;
      });
      summary += '\n';
    }

    if (recommendations.precautions.length > 0) {
      summary += '*Precautions:*\n';
      recommendations.precautions.slice(0, 3).forEach(precaution => {
        summary += `• ${precaution}\n`;
      });
      summary += '\n';
    }

    if (recommendations.enhancements.length > 0) {
      summary += '*Enhancements:*\n';
      recommendations.enhancements.slice(0, 2).forEach(enhancement => {
        summary += `• ${enhancement}\n`;
      });
      summary += '\n';
    }

    if (alternatives.length > 0) {
      summary +=
        '*Alternative dates available if current timing is unsuitable.*';
    } else {
      summary += '*Current date and time analysis completed.*';
    }

    return summary;
  }

  // Helper methods
  _categorizeActivity(activity) {
    const activityLower = activity.toLowerCase();

    if (this.activityCategories.marriage.some(a => activityLower.includes(a))) {
      return 'marriage';
    }
    if (this.activityCategories.business.some(a => activityLower.includes(a))) {
      return 'business';
    }
    if (
      this.activityCategories.spiritual.some(a => activityLower.includes(a))
    ) {
      return 'spiritual';
    }
    if (
      this.activityCategories.education.some(a => activityLower.includes(a))
    ) {
      return 'education';
    }
    if (this.activityCategories.health.some(a => activityLower.includes(a))) {
      return 'health';
    }
    if (this.activityCategories.travel.some(a => activityLower.includes(a))) {
      return 'travel';
    }
    if (
      this.activityCategories.housewarming.some(a => activityLower.includes(a))
    ) {
      return 'housewarming';
    }

    return 'general';
  }

  _getActivitySpecificRules(activityType) {
    const rules = {
      marriage: {
        favorablePlanets: ['venus', 'jupiter', 'moon'],
        challengingPlanets: ['saturn', 'mars', 'sun'],
        favorableElements: ['water', 'air'],
        challengingElements: [],
        prefersDayTime: true,
        prefersNightTime: false
      },
      business: {
        favorablePlanets: ['mercury', 'jupiter', 'sun'],
        challengingPlanets: ['saturn', 'rahu'],
        favorableElements: ['air', 'fire'],
        challengingElements: ['water'],
        prefersDayTime: true,
        prefersNightTime: false
      },
      spiritual: {
        favorablePlanets: ['jupiter', 'moon', 'saturn'],
        challengingPlanets: ['mars', 'rahu'],
        favorableElements: ['water', 'fire'],
        challengingElements: ['air'],
        prefersDayTime: false,
        prefersNightTime: true
      },
      travel: {
        favorablePlanets: ['moon', 'mercury', 'jupiter'],
        challengingPlanets: ['saturn', 'rahu'],
        favorableElements: ['air', 'water'],
        challengingElements: ['earth'],
        prefersDayTime: true,
        prefersNightTime: false
      },
      general: {
        favorablePlanets: ['jupiter', 'venus'],
        challengingPlanets: ['saturn', 'rahu'],
        favorableElements: ['fire', 'air'],
        challengingElements: [],
        prefersDayTime: true,
        prefersNightTime: false
      }
    };

    return rules[activityType] || rules.general;
  }

  async _calculatePlanetPositions(jd) {
    const positions = {};

    const planets = [
      'sun',
      'moon',
      'mars',
      'mercury',
      'jupiter',
      'venus',
      'saturn'
    ];
    const planetIds = {
      sun: sweph.SE_SUN,
      moon: sweph.SE_MOON,
      mars: sweph.SE_MARS,
      mercury: sweph.SE_MERCURY,
      jupiter: sweph.SE_JUPITER,
      venus: sweph.SE_VENUS,
      saturn: sweph.SE_SATURN
    };

    for (const planet of planets) {
      const position = sweph.calc(jd, planetIds[planet], sweph.SEFLG_SIDEREAL);
      if (position && Array.isArray(position.longitude)) {
        positions[planet] = {
          longitude: position.longitude[0],
          sign: Math.floor(position.longitude[0] / 30) + 1
        };
      }
    }

    return positions;
  }

  _calculateTithi(jd) {
    // Calculate tithi (difference between sun and moon longitude)
    const sunPos = sweph.calc(jd, sweph.SE_SUN, sweph.SEFLG_SIDEREAL);
    const moonPos = sweph.calc(jd, sweph.SE_MOON, sweph.SEFLG_SIDEREAL);

    const sunLong = Array.isArray(sunPos.longitude) ?
      sunPos.longitude[0] :
      sunPos.longitude;
    const moonLong = Array.isArray(moonPos.longitude) ?
      moonPos.longitude[0] :
      moonPos.longitude;

    const difference = moonLong - sunLong;
    const normalizedDifference = ((difference % 360) + 360) % 360;
    const tithiNumber = Math.floor(normalizedDifference / 12) + 1;

    return {
      number: tithiNumber,
      name: this._getTithiName(tithiNumber),
      nature: this._getTithiNature(tithiNumber)
    };
  }

  _calculateNakshatra(jd) {
    const moonPos = sweph.calc(jd, sweph.SE_MOON, sweph.SEFLG_SIDEREAL);
    const moonLong = Array.isArray(moonPos.longitude) ?
      moonPos.longitude[0] :
      moonPos.longitude;

    const nakshatraNumber = Math.floor(moonLong / (360 / 27)) + 1;
    return {
      number: nakshatraNumber,
      name: this._getNakshatraName(nakshatraNumber),
      lord: this._getNakshatraLord(nakshatraNumber),
      nature: this._getNakshatraNature(nakshatraNumber)
    };
  }

  _calculateYoga(jd) {
    const sunPos = sweph.calc(jd, sweph.SE_SUN, sweph.SEFLG_SIDEREAL);
    const moonPos = sweph.calc(jd, sweph.SE_MOON, sweph.SEFLG_SIDEREAL);

    if (sunPos.error || moonPos.error) {
      return { error: 'Failed to calculate planetary positions for Yoga' };
    }

    const sunLongitude = sunPos.longitude;
    const moonLongitude = moonPos.longitude;

    // Calculate Yoga (sum of Sun and Moon longitudes divided by 13°20')
    const totalDegrees = (sunLongitude + moonLongitude) % 360;
    const yogaNumber = Math.floor(totalDegrees / 13.333) + 1;
    const yogaName = this._getYogaName(yogaNumber);

    return {
      number: yogaNumber,
      name: yogaName,
      sunLongitude,
      moonLongitude,
      totalDegrees
    };
  }

  _getYogaName(yogaNumber) {
    const yogaNames = [
      'Vishkambha',
      'Priti',
      'Ayushman',
      'Saubhagya',
      'Shobhana',
      'Atiganda',
      'Sukarma',
      'Dhriti',
      'Shula',
      'Ganda',
      'Vriddhi',
      'Dhruva',
      'Vyaghata',
      'Harshana',
      'Vajra',
      'Siddhi',
      'Vyatipata',
      'Variyan',
      'Parigha',
      'Shiva',
      'Siddha',
      'Sadhya',
      'Shubha',
      'Shukla',
      'Brahma',
      'Indra',
      'Vaidhriti'
    ];

    return yogaNames[yogaNumber - 1] || 'Unknown';
  }
}

module.exports = { MuhurtaCalculator };
