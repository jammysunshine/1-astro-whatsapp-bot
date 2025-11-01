const logger = require('../../../../utils/logger');
const sweph = require('sweph');

/**
 * Sade Sati Calculator
 * Analyzes Saturn's 7.5 year transit cycles and their effects on individuals
 * Tracks Saturn's movement through 12 houses from Moon for comprehensive impact analysis
 */
class SadeSatiCalculator {
  constructor(astrologer, geocodingService) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;

    // Define Sade Sati phases and their characteristics
    this.sadeSatiPhases = {
      rising: {
        name: 'Rising Sade Sati',
        position: 'before',
        effects:
          'Career struggles, material loss, health issues, family problems',
        duration: '2.5 years',
        remedies: [
          'Chant Om Shan Shanishcharaya Namaha',
          'Wear blue sapphire',
          'Donate sesame seeds'
        ]
      },
      peak: {
        name: 'Peak Sade Sati',
        position: 'conjunct',
        effects:
          'Maximum challenges, major life changes, enduring difficulties',
        duration: '2.5 years',
        remedies: [
          'Daily Saturn mantras',
          'Iron donations on Saturdays',
          'Meditate on Lord Hanuman'
        ]
      },
      descending: {
        name: 'Descending Sade Sati',
        position: 'after',
        effects: 'Recovery phase, lessons learned, gradual improvement',
        duration: '2.5 years',
        remedies: [
          'Chant Shani Gayatri',
          'Feed ants and crows',
          'Practice patience and persistence'
        ]
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
   * Generate comprehensive Sade Sati analysis
   * @param {Object} birthData - Birth data object
   * @param {number} analysisYears - Years to analyze ahead (default 30)
   * @returns {Object} Complete Sade Sati analysis
   */
  async generateSadeSatiAnalysis(birthData, analysisYears = 30) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        throw new Error(
          'Complete birth details required for Sade Sati analysis'
        );
      }

      // Parse birth details
      const parsedDate = this._parseBirthDate(birthDate);
      const parsedTime = this._parseBirthTime(birthTime);

      // Get coordinates and calculate natal chart
      const [latitude, longitude] =
        await this.geocodingService.getCoordinates(birthPlace);
      const timezone = 5.5; // Default IST (can be enhanced to get from coordinates)

      const natalChart = await this._calculateNatalChart(
        parsedDate.year,
        parsedDate.month,
        parsedDate.day,
        parsedTime.hour,
        parsedTime.minute,
        latitude,
        longitude,
        timezone
      );

      // Determine Sade Sati triggering points
      const sadeSatiTriggers = this._calculateSadeSatiTriggers(
        natalChart.planets.moon
      );

      // Calculate all Sade Sati periods in analysis timeframe
      const sadeSatiPeriods = this._calculateAllSadeSatiPeriods(
        natalChart.birthJD,
        sadeSatiTriggers,
        analysisYears
      );

      // Analyze current and upcoming periods
      const currentStatus = this._analyzeCurrentSadeSatiStatus(sadeSatiPeriods);
      const upcomingPeriods = this._getUpcomingSadeSatiPeriods(sadeSatiPeriods);
      const pastPeriods = this._analyzePastSadeSatiPeriods(sadeSatiPeriods);

      // Calculate periods without Sade Sati
      const reliefPeriods = this._calculateSadeSatiReliefPeriods(
        sadeSatiPeriods,
        natalChart.birthJD,
        analysisYears
      );

      // Generate personalized predictions based on lunar sign
      const lunarSignPredictions = this._generateLunarSignPredictions(
        natalChart.planets.moon.sign
      );

      // Provide remedial measures
      const remedies = this._generateSadeSatiRemedies(
        currentStatus,
        natalChart
      );

      return {
        name,
        birthDetails: { date: birthDate, time: birthTime, place: birthPlace },
        currentStatus,
        upcomingPeriods,
        pastPeriods,
        reliefPeriods,
        lunarSignPredictions,
        remedies,
        sadeSatiTriggers,
        summary: this._generateSadeSatiSummary(
          currentStatus,
          upcomingPeriods,
          lunarSignPredictions
        )
      };
    } catch (error) {
      logger.error('❌ Error in Sade Sati analysis:', error);
      throw new Error(`Sade Sati analysis failed: ${error.message}`);
    }
  }

  /**
   * Calculate Sade Sati triggering points based on Moon's position
   * @private
   * @param {Object} natalMoon - Moon's natal position
   * @returns {Object} Trigger points for Sade Sati
   */
  _calculateSadeSatiTriggers(natalMoon) {
    const moonSign = natalMoon.sign;
    const moonDegree = natalMoon.longitude % 30;

    // Sade Sati starts when Saturn enters the sign 12 positions before Moon's sign
    const saturnEnteringSign = this._adjustSignNumber(moonSign - 2); // 12th from Moon
    const saturnConjunctSign = moonSign;
    const saturnLeavingSign = this._adjustSignNumber(moonSign + 2); // 2nd from Moon

    return {
      risingPhase: {
        sign: saturnEnteringSign,
        startDegree: (saturnEnteringSign - 1) * 30,
        endDegree: saturnEnteringSign * 30,
        phase: 'rising'
      },
      peakPhase: {
        sign: saturnConjunctSign,
        startDegree: (saturnConjunctSign - 1) * 30,
        endDegree: saturnConjunctSign * 30,
        phase: 'peak'
      },
      descendingPhase: {
        sign: saturnLeavingSign,
        startDegree: (saturnLeavingSign - 1) * 30,
        endDegree: saturnLeavingSign * 30,
        phase: 'descending'
      }
    };
  }

  /**
   * Calculate all Sade Sati periods within analysis timeframe
   * @private
   * @param {number} birthJD - Birth Julian Day
   * @param {Object} triggers - Sade Sati trigger points
   * @param {number} analysisYears - Years to analyze
   * @returns {Array} All Sade Sati periods
   */
  _calculateAllSadeSatiPeriods(birthJD, triggers, analysisYears) {
    const periods = [];
    const endDate = birthJD + analysisYears * 365.25;

    // Saturn's average movement per year (~1/2.5 degrees per day = 365/2.5 ≈ 146 days per degree)
    const saturnSpeed = 30 / 365.25; // Degrees per day (approximate)

    // Calculate Saturn positions at regular intervals
    for (let jd = birthJD; jd <= endDate; jd += 30) {
      // Check every 30 days
      const saturnPosition = sweph.calc(
        jd,
        sweph.SE_SATURN,
        sweph.SEFLG_SIDEREAL
      );

      if (saturnPosition && Array.isArray(saturnPosition.longitude)) {
        const longitude = saturnPosition.longitude[0];
        const saturnSign = Math.floor(longitude / 30) + 1;

        // Check if Saturn is in any Sade Sati trigger sign
        Object.values(triggers).forEach(trigger => {
          if (saturnSign === trigger.sign) {
            const phaseType = trigger.phase;
            const existingPeriod = periods.find(
              p => p.phase === phaseType && Math.abs(p.endJD - jd) < 30 // Within 30 days of existing period
            );

            if (!existingPeriod) {
              periods.push({
                phase: phaseType,
                phaseName: this.sadeSatiPhases[phaseType].name,
                startJD: jd,
                endJD: jd,
                startDate: this._jdToDateString(jd),
                endDate: '',
                durationDays: 0,
                effects: this.sadeSatiPhases[phaseType].effects,
                intensity: this._calculatePhaseIntensity(
                  phaseType,
                  longitude,
                  trigger
                ),
                description: this._generatePhaseDescription(
                  phaseType,
                  saturnSign
                )
              });
            } else {
              existingPeriod.endJD = jd;
              existingPeriod.endDate = this._jdToDateString(jd);
              existingPeriod.durationDays = Math.round(
                existingPeriod.endJD - existingPeriod.startJD
              );

              // Extend duration for peak phase (it can last longer)
              if (phaseType === 'peak') {
                existingPeriod.endJD += 30; // Extend peak phase
                existingPeriod.endDate = this._jdToDateString(
                  existingPeriod.endJD
                );
                existingPeriod.durationDays = Math.round(
                  existingPeriod.endJD - existingPeriod.startJD
                );
              }
            }
          }
        });
      }
    }

    // Clean up and merge overlapping periods
    return this._cleanAndMergePeriods(periods);
  }

  /**
   * Analyze current Sade Sati status
   * @private
   * @param {Array} sadeSatiPeriods - All Sade Sati periods
   * @returns {Object} Current status analysis
   */
  _analyzeCurrentSadeSatiStatus(sadeSatiPeriods) {
    const todayJD = this._getCurrentJulianDate();
    const currentPeriod = sadeSatiPeriods.find(
      p => todayJD >= p.startJD && todayJD <= p.endJD
    );

    if (currentPeriod) {
      return {
        inSadeSati: true,
        currentPhase: currentPeriod.phase,
        phaseName: currentPeriod.phaseName,
        phaseEffects: currentPeriod.effects,
        phaseIntensity: currentPeriod.intensity,
        phaseDescription: currentPeriod.description,
        startDate: currentPeriod.startDate,
        endDate: currentPeriod.endDate,
        remainingDays: Math.round(currentPeriod.endJD - todayJD),
        progress: Math.round(
          ((todayJD - currentPeriod.startJD) /
            (currentPeriod.endJD - currentPeriod.startJD)) *
            100
        )
      };
    } else {
      // Find next upcoming period
      const nextPeriod = sadeSatiPeriods.find(p => p.startJD > todayJD);
      const daysUntilNext = nextPeriod ?
        Math.round(nextPeriod.startJD - todayJD) :
        null;

      return {
        inSadeSati: false,
        nextPhase: nextPeriod ? nextPeriod.phase : null,
        nextPhaseDate: nextPeriod ? nextPeriod.startDate : null,
        daysUntilNext,
        relief: {
          currentStatus: 'In relief period',
          durationRemaining: daysUntilNext,
          preparationAdvice: nextPeriod ?
            this._generatePreparationAdvice(nextPeriod.phase) :
            null
        }
      };
    }
  }

  /**
   * Get upcoming Sade Sati periods
   * @private
   * @param {Array} sadeSatiPeriods - All periods
   * @returns {Array} Upcoming periods (next 3-5)
   */
  _getUpcomingSadeSatiPeriods(sadeSatiPeriods) {
    const todayJD = this._getCurrentJulianDate();
    return sadeSatiPeriods
      .filter(p => p.startJD > todayJD)
      .slice(0, 5)
      .map(p => ({
        phase: p.phase,
        phaseName: p.phaseName,
        startDate: p.startDate,
        endDate: p.endDate,
        duration: `${Math.round(p.durationDays / 30)} months`,
        effects: p.effects,
        intensity: p.intensity,
        preparation: this._generatePreparationAdvice(p.phase)
      }));
  }

  /**
   * Analyze past Sade Sati periods and their effects
   * @private
   * @param {Array} sadeSatiPeriods - All periods
   * @returns {Object} Past periods analysis
   */
  _analyzePastSadeSatiPeriods(sadeSatiPeriods) {
    const todayJD = this._getCurrentJulianDate();
    const pastPeriods = sadeSatiPeriods.filter(p => p.endJD < todayJD);

    return {
      totalPastPeriods: pastPeriods.length,
      periods: pastPeriods.slice(-3).map(p => ({
        // Last 3 periods
        phase: p.phase,
        phaseName: p.phaseName,
        startDate: p.startDate,
        endDate: p.endDate,
        duration: `${Math.round(p.durationDays / 30)} months`,
        intensity: p.intensity,
        lessonsLearned: this._generatePastLessons(p.phase),
        lingeringEffects: this._calculateLingeringEffects(p)
      })),
      cumulativeImpact: this._assessCumulativeImpact(pastPeriods)
    };
  }

  /**
   * Calculate periods without Sade Sati influence
   * @private
   * @param {Array} sadeSatiPeriods - Sade Sati periods
   * @param {number} birthJD - Birth Julian Day
   * @param {number} analysisYears - Analysis years
   * @returns {Array} Relief periods
   */
  _calculateSadeSatiReliefPeriods(sadeSatiPeriods, birthJD, analysisYears) {
    const endJD = birthJD + analysisYears * 365.25;
    const reliefPeriods = [];

    let currentStart = birthJD;

    sadeSatiPeriods.forEach(period => {
      if (period.startJD > currentStart) {
        reliefPeriods.push({
          startDate: this._jdToDateString(currentStart),
          endDate: this._jdToDateString(period.startJD),
          duration: Math.round((period.startJD - currentStart) / 30), // months
          characteristics:
            'Relief period, stability, progress, reduced challenges'
        });
      }
      currentStart = Math.max(currentStart, period.endJD);
    });

    // Add final relief period
    if (currentStart < endJD) {
      reliefPeriods.push({
        startDate: this._jdToDateString(currentStart),
        endDate: this._jdToDateString(endJD),
        duration: Math.round((endJD - currentStart) / 30),
        characteristics: 'Extended relief period, life balance, achievement'
      });
    }

    return reliefPeriods;
  }

  /**
   * Generate lunar sign-specific predictions for Sade Sati
   * @private
   * @param {number} moonSign - Moon's sign (1-12)
   * @returns {Object} Lunar sign predictions
   */
  _generateLunarSignPredictions(moonSign) {
    const lunarSignEffects = {
      1: {
        // Aries Moon
        strongestChallenges: ['Health', 'Family conflicts', 'Career setbacks'],
        worstPhases: ['Peak period brings maximum family disputes'],
        remedies: [
          'Focus on patience, regular exercise, family harmony rituals'
        ]
      },
      4: {
        // Cancer Moon
        strongestChallenges: [
          'Emotional stability',
          'Home environment',
          'Financial security'
        ],
        worstPhases: ['Rising phase affects home and relationships most'],
        remedies: [
          'Emotional balance practices, meditation, nurturing routines'
        ]
      },
      7: {
        // Libra Moon
        strongestChallenges: [
          'Partnerships',
          'Legal matters',
          'Social standing'
        ],
        worstPhases: ['Peak period brings relationship tests'],
        remedies: [
          'Partnership counseling if needed, balance in relationships'
        ]
      },
      10: {
        // Capricorn Moon
        strongestChallenges: [
          'Career stability',
          'Authority figures',
          'Material security'
        ],
        worstPhases: ['Peak period affects career significantly'],
        remedies: [
          'Persistent effort, professional development, maintain structure'
        ]
      }
      // Add more specific lunar sign effects...
    };

    const lunarSignEffect =
      lunarSignEffects[moonSign] || this._generateGenericLunarEffect(moonSign);

    return {
      moonSign: this._getSignName(moonSign),
      strongestChallenges: lunarSignEffect.strongestChallenges,
      mostChallengingPhase: lunarSignEffect.worstPhases,
      recommendedRemedies: lunarSignEffect.remedies,
      overallImpact: this._calculateLunarSignImpact(moonSign)
    };
  }

  /**
   * Generate remedial measures for Sade Sati
   * @private
   * @param {Object} currentStatus - Current Sade Sati status
   * @param {Object} natalChart - Natal chart data
   * @returns {Object} Remedial measures
   */
  _generateSadeSatiRemedies(currentStatus, natalChart) {
    const remedies = {
      daily: [],
      weekly: [],
      monthly: [],
      general: [],
      emergency: [],
      specificToStatus: []
    };

    // Base remedies applicable to all
    remedies.daily = [
      'Chant "Om Shan Shanishcharaya Namaha" or "Om Praam Preem Proum Sah Shanaischaraya Namaha"',
      'Offer water to Peepal tree (if accessible)',
      'Practice patience and humility'
    ];

    remedies.weekly = [
      'Visit Shani temple or pray to Lord Hanuman',
      'Feed crows and ants (considered therapeutic)',
      'Light a sesame oil lamp on Saturdays'
    ];

    remedies.monthly = [
      'Donate sesame seeds, black urad, iron, or oil on Saturdays',
      'Perform Shani graha shanti puja when possible',
      'Wear blue sapphire (neelam) if recommended by astrologer'
    ];

    // Status-specific remedies
    if (currentStatus.inSadeSati) {
      remedies.specificToStatus = this._generateCurrentPhaseRemedies(
        currentStatus.currentPhase
      );
      remedies.emergency = [
        'During crisis periods, chant Hanuman Chalisa daily',
        'Silver ring on middle finger (if not wearing blue sapphire)',
        'Fast on Saturdays with minimal salt/sugar in diet'
      ];
    } else {
      remedies.specificToStatus = [
        'Maintain regular spiritual practices to build resilience',
        'Prepare for upcoming challenges through proper planning',
        'Strengthen financial and emotional foundations during relief periods'
      ];
    }

    // Moon sign specific remedies
    remedies.moonSignSpecific = this._generateMoonSignRemedies(
      natalChart.planets.moon.sign
    );

    return remedies;
  }

  /**
   * Generate Sade Sati summary
   * @private
   * @param {Object} currentStatus - Current status
   * @param {Array} upcomingPeriods - Upcoming periods
   * @param {Object} lunarSignPredictions - Lunar sign predictions
   * @returns {string} Formatted summary
   */
  _generateSadeSatiSummary(
    currentStatus,
    upcomingPeriods,
    lunarSignPredictions
  ) {
    let summary = '🪐 *Sade Sati Analysis*\n\n';

    if (currentStatus.inSadeSati) {
      summary += `*Currently in ${currentStatus.phaseName}*\n`;
      summary += `*Progress: ${currentStatus.progress}% completed*\n`;
      summary += `*Remaining: ${currentStatus.remainingDays} days*\n\n`;
      summary += `*Effects: ${currentStatus.phaseEffects}*\n\n`;
    } else {
      summary += 'Currently in *relief period*\n';
      if (currentStatus.daysUntilNext) {
        summary += `Next Sade Sati starts in ${currentStatus.daysUntilNext} days\n\n`;
      }
    }

    summary += '*Moon Sign Impact:*\n';
    summary += `• Strongest challenges: ${lunarSignPredictions.strongestChallenges.slice(0, 2).join(', ')}\n`;
    summary += `• Recommended: ${lunarSignPredictions.recommendedRemedies.slice(0, 1).join(', ')}\n\n`;

    summary += '*Upcoming Periods:*\n';
    upcomingPeriods.slice(0, 2).forEach(period => {
      summary += `• ${period.phaseName}: ${period.startDate}\n`;
    });

    summary += '\n*Remember: Sade Sati brings growth through challenges.*\n';
    summary += '*Remedial measures can significantly reduce difficulties.*';

    return summary;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  _adjustSignNumber(sign) {
    return ((sign - 1) % 12) + 1;
  }

  _getSignName(sign) {
    const signs = [
      '',
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
    return signs[sign] || 'Unknown';
  }

  _cleanAndMergePeriods(periods) {
    // Sort by start date
    periods.sort((a, b) => a.startJD - b.startJD);

    const merged = [];
    let current = null;

    for (const period of periods) {
      if (!current) {
        current = { ...period };
      } else if (
        current.phase === period.phase &&
        Math.abs(current.endJD - period.startJD) < 10
      ) {
        // Overlapping
        current.endJD = Math.max(current.endJD, period.endJD);
        current.endDate = this._jdToDateString(current.endJD);
        current.durationDays = Math.round(current.endJD - current.startJD);
      } else {
        merged.push(current);
        current = { ...period };
      }
    }

    if (current) {
      merged.push(current);
    }
    return merged;
  }

  // Additional helper methods...
  _parseBirthDate(birthDate) {
    const cleanDate = birthDate.toString().replace(/\D/g, '');
    let day;
    let month;
    let year;

    if (cleanDate.length === 6) {
      day = parseInt(cleanDate.substring(0, 2));
      month = parseInt(cleanDate.substring(2, 4));
      year = parseInt(cleanDate.substring(4));
      year = year <= 30 ? 2000 + year : 1900 + year;
    } else if (cleanDate.includes('/')) {
      [day, month, year] = birthDate.split('/').map(Number);
    }

    return { day, month, year };
  }

  _parseBirthTime(birthTime) {
    const cleanTime = birthTime.toString().replace(/\D/g, '').padStart(4, '0');
    const hour = parseInt(cleanTime.substring(0, 2));
    const minute = parseInt(cleanTime.substring(2, 4));

    return { hour, minute };
  }

  async _calculateNatalChart(
    year,
    month,
    day,
    hour,
    minute,
    latitude,
    longitude,
    timezone
  ) {
    const jd = this._dateToJulianDay(
      year,
      month,
      day,
      hour + minute / 60 - timezone || 5.5
    );

    // Calculate Moon position for Sade Sati reference
    const moonPosition = sweph.calc(jd, sweph.SE_MOON, sweph.SEFLG_SIDEREAL);
    const planets = {
      moon: {
        longitude: moonPosition.longitude[0],
        sign: Math.floor(moonPosition.longitude[0] / 30) + 1
      }
    };

    return { planets, birthJD: jd };
  }

  _dateToJulianDay(year, month, day, hour) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    const jd =
      day +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045;
    return jd + hour / 24;
  }

  _getCurrentJulianDate() {
    const now = new Date();
    return this._dateToJulianDay(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
      now.getHours() + now.getMinutes() / 60
    );
  }

  _jdToDateString(jd) {
    // Convert Julian Day back to date string - simplified implementation
    return new Date((jd - 2440587.5) * 86400000).toISOString().split('T')[0];
  }

  // Placeholder implementations (can be enhanced)
  _calculatePhaseIntensity(phaseType, saturnLongitude, trigger) {
    return phaseType === 'peak' ?
      'High' :
      phaseType === 'rising' ?
        'Medium' :
        'Low';
  }

  _generatePhaseDescription(phaseType, saturnSign) {
    return `${this.sadeSatiPhases[phaseType].name} - ${this.sadeSatiPhases[phaseType].effects}`;
  }

  _generatePreparationAdvice(phase) {
    return this.sadeSatiPhases[phase].remedies[0];
  }

  _generatePastLessons(phase) {
    return ['Developed resilience', 'Learned patience', 'Built character'];
  }

  _calculateLingeringEffects(period) {
    return period.phase === 'peak' ?
      'Some lingering challenges' :
      'Generally resolved';
  }

  _assessCumulativeImpact(periods) {
    return periods.length >= 2 ?
      'Significant life changes experienced' :
      'Moderate impact';
  }

  _generateGenericLunarEffect(moonSign) {
    return {
      strongestChallenges: ['General life challenges', 'Adaptation required'],
      worstPhases: ['Peak period may bring maximum challenges'],
      remedies: ['Regular spiritual practices', 'Stay grounded and patient']
    };
  }

  _calculateLunarSignImpact(moonSign) {
    return moonSign <= 6 ?
      'Significant challenges requiring strong remedies' :
      'Moderate challenges with proper precautions';
  }

  _generateCurrentPhaseRemedies(phase) {
    return this.sadeSatiPhases[phase].remedies || ['General Saturn remedies'];
  }

  _generateMoonSignRemedies(moonSign) {
    const remedies = {
      4: ['Moon-related remedies for Cancer Moon', 'Chant Chandra Gayatri'],
      7: ['Venus remedies for Libra Moon', 'Wear diamond if suitable'],
      10: ['Saturn strengthening for Capricorn Moon', 'Iron donations']
    };
    return remedies[moonSign] || ['General remedial practices'];
  }

  async _getCoordinatesForPlace(place) {
    try {
      return await this.geocodingService.getCoordinates(place);
    } catch (error) {
      logger.warn('Geocoding error:', error.message);
      return [28.6139, 77.209]; // Delhi fallback
    }
  }
}

module.exports = { SadeSatiCalculator };
