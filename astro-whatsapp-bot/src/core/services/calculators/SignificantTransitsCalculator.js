const logger = require('../../../../utils/logger');
const sweph = require('sweph');

/**
 * Significant Transits Calculator
 * Identifies and analyzes upcoming major planetary transits using Vedic astrology principles
 */
class SignificantTransitsCalculator {
  constructor(astrologer, geocodingService) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;
  }

  /**
   * Set services for the calculator
   */
  setServices(services) {
    this.services = services;
  }

  /**
   * Calculate next significant transits for the coming period
   * @param {Object} birthData - Birth data object
   * @param {number} monthsAhead - Number of months to look ahead (default 12)
   * @returns {Object} Significant transits analysis
   */
  async calculateNextSignificantTransits(birthData, monthsAhead = 12) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return {
          error: 'Complete birth details required for transit analysis'
        };
      }

      // Parse birth details
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const [latitude, longitude] =
        await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(
        latitude,
        longitude,
        timestamp
      );

      // Calculate natal chart
      const natalChart = await this._calculateNatalChart(
        year,
        month,
        day,
        hour,
        minute,
        latitude,
        longitude,
        timezone
      );

      // Identify significant natal aspects/points
      const significantNatalPoints =
        this._identifySignificantNatalPoints(natalChart);

      // Calculate upcoming transits
      const transits = await this._calculateUpcomingTransits(
        significantNatalPoints,
        monthsAhead
      );

      // Classify transits by significance
      const classifiedTransits = this._classifyTransitsBySignificance(
        transits,
        natalChart
      );

      // Sort transits by importance and timing
      const sortedTransits = this._sortTransitsByImportance(classifiedTransits);

      // Generate timing recommendations
      const timingRecommendations = this._generateTimingRecommendations(
        sortedTransits.slice(0, 5)
      ); // Top 5

      // Calculate overall transit influence for the period
      const periodInfluence = this._calculatePeriodInfluence(
        sortedTransits,
        monthsAhead
      );

      return {
        name,
        analysisPeriod: `${monthsAhead} months ahead`,
        natalChart,
        significantPoints: significantNatalPoints,
        upcomingTransits: sortedTransits,
        classification: {
          major: classifiedTransits.major,
          significant: classifiedTransits.significant,
          minor: classifiedTransits.minor
        },
        timingRecommendations,
        periodInfluence,
        summary: this._generateTransitsSummary(
          sortedTransits,
          periodInfluence,
          monthsAhead
        )
      };
    } catch (error) {
      logger.error('❌ Error in significant transits calculation:', error);
      throw new Error(
        `Significant transits calculation failed: ${error.message}`
      );
    }
  }

  /**
   * Calculate natal chart for transit reference
   */
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
    const natalPlanets = {};

    const jd = this._dateToJulianDay(
      year,
      month,
      day,
      hour + minute / 60 - timezone
    );

    // Planet IDs for Swiss Ephemeris
    const planetIds = {
      sun: sweph.SE_SUN,
      moon: sweph.SE_MOON,
      mars: sweph.SE_MARS,
      mercury: sweph.SE_MERCURY,
      jupiter: sweph.SE_JUPITER,
      venus: sweph.SE_VENUS,
      saturn: sweph.SE_SATURN,
      uranus: sweph.SE_URANUS,
      neptune: sweph.SE_NEPTUNE,
      pluto: sweph.SE_PLUTO,
      rahu: sweph.SE_TRUE_NODE,
      ketu: sweph.SE_MEAN_APOG
    };

    for (const [planetName, planetId] of Object.entries(planetIds)) {
      try {
        let position;

        if (planetName === 'ketu') {
          const rahuPos = sweph.calc(jd, sweph.SE_TRUE_NODE);
          position = {
            longitude:
              (Array.isArray(rahuPos.longitude) ?
                rahuPos.longitude[0] :
                rahuPos.longitude) +
              (180 % 360),
            latitude: 0,
            speed: { longitude: 0 }
          };
        } else {
          position = sweph.calc(
            jd,
            planetId,
            sweph.SEFLG_SIDEREAL | sweph.SEFLG_SPEED
          );
        }

        if (position && position.longitude !== undefined) {
          const longitude = Array.isArray(position.longitude) ?
            position.longitude[0] :
            position.longitude;
          const latitude = Array.isArray(position.latitude) ?
            position.latitude[0] :
            position.latitude || 0;
          const speed = Array.isArray(position.longitude) ?
            position.longitude[3] || 0 :
            0;

          natalPlanets[planetName] = {
            name: planetName.charAt(0).toUpperCase() + planetName.slice(1),
            longitude,
            latitude,
            speed,
            sign: Math.floor(longitude / 30) + 1,
            degree: longitude % 30,
            retrograde: speed < 0
          };
        }
      } catch (error) {
        logger.warn(
          `Error calculating natal ${planetName} position:`,
          error.message
        );
      }
    }

    // Calculate ascendant and houses
    try {
      const houses = sweph.houses(jd, latitude, longitude, 'E');
      natalPlanets.ascendant = {
        longitude: houses.ascendant || 0,
        sign: Math.floor((houses.ascendant || 0) / 30) + 1,
        degree: (houses.ascendant || 0) % 30
      };
    } catch (error) {
      natalPlanets.ascendant = { longitude: 0, sign: 1, degree: 0 };
    }

    return { planets: natalPlanets };
  }

  /**
   * Identify significant natal points for transit analysis
   */
  _identifySignificantNatalPoints(natalChart) {
    const significantPoints = {
      planets: {},
      angles: {},
      importantPositions: []
    };

    // Add all planets as significant points
    Object.entries(natalChart.planets).forEach(([planet, data]) => {
      significantPoints.planets[planet] = {
        longitude: data.longitude,
        sign: data.sign,
        house: this._calculateHouseForLongitude(
          data.longitude,
          natalChart.planets.ascendant?.longitude || 0
        )
      };
    });

    // Add angles (Ascendant, Midheaven, Descendant, IC)
    const ascendant = natalChart.planets.ascendant?.longitude || 0;
    significantPoints.angles = {
      ascendant: { longitude: ascendant, name: 'Ascendant' },
      midheaven: { longitude: (ascendant + 90) % 360, name: 'Midheaven' },
      descendant: { longitude: (ascendant + 180) % 360, name: 'Descendant' },
      ic: { longitude: (ascendant + 270) % 360, name: 'IC' }
    };

    // Identify positions that are particularly sensitive
    significantPoints.importantPositions =
      this._identifySensitivePositions(natalChart);

    return significantPoints;
  }

  /**
   * Calculate upcoming transits to significant points
   */
  async _calculateUpcomingTransits(significantNatalPoints, monthsAhead) {
    const transits = [];
    const startDate = new Date();

    // Transiting planets to check
    const transitingPlanets = [
      'sun',
      'moon',
      'mercury',
      'venus',
      'mars',
      'jupiter',
      'saturn',
      'rahu'
    ];

    // Check each month
    for (let month = 0; month < monthsAhead; month++) {
      const currentMonthStart = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + month,
        1
      );
      const currentMonthEnd = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + month + 1,
        0
      );

      // Check each transiting planet
      for (const transitingPlanet of transitingPlanets) {
        let planetId;
        if (transitingPlanet === 'sun') {
          planetId = sweph.SE_SUN;
        } else if (transitingPlanet === 'moon') {
          planetId = sweph.SE_MOON;
        } else if (transitingPlanet === 'mercury') {
          planetId = sweph.SE_MERCURY;
        } else if (transitingPlanet === 'venus') {
          planetId = sweph.SE_VENUS;
        } else if (transitingPlanet === 'mars') {
          planetId = sweph.SE_MARS;
        } else if (transitingPlanet === 'jupiter') {
          planetId = sweph.SE_JUPITER;
        } else if (transitingPlanet === 'saturn') {
          planetId = sweph.SE_SATURN;
        } else if (transitingPlanet === 'rahu') {
          planetId = sweph.SE_TRUE_NODE;
        }

        // Check aspects to all significant natal points
        for (const [pointType, points] of Object.entries(
          significantNatalPoints
        )) {
          if (pointType === 'importantPositions') {
            continue;
          }

          for (const [pointName, pointData] of Object.entries(points)) {
            try {
              const natalLongitude = pointData.longitude;
              const transitDate = await this._findTransitDate(
                transitingPlanet,
                planetId,
                natalLongitude,
                currentMonthStart,
                currentMonthEnd
              );

              if (transitDate) {
                transits.push({
                  date: transitDate,
                  transitingPlanet,
                  natalPoint: {
                    name: pointName,
                    type: pointType,
                    longitude: natalLongitude
                  },
                  aspect: 'conjunction', // Exact conjunction for now
                  significance: this._calculateTransitSignificance(
                    transitingPlanet,
                    pointType,
                    pointName
                  ),
                  intensity: this._calculateTransitIntensity(
                    transitingPlanet,
                    pointType
                  )
                });
              }
            } catch (error) {
              // Skip transits that can't be calculated
              continue;
            }
          }
        }
      }
    }

    return transits;
  }

  /**
   * Find the date when a transiting planet aspects a natal point within a month
   */
  async _findTransitDate(
    transitingPlanet,
    planetId,
    natalLongitude,
    startDate,
    endDate
  ) {
    try {
      // Calculate positions at 5-day intervals
      const checkIntervals = 5;
      const totalDays = Math.floor(
        (endDate - startDate) / (24 * 60 * 60 * 1000)
      );
      const intervals = Math.max(1, Math.floor(totalDays / checkIntervals));

      for (let i = 0; i <= intervals; i++) {
        const checkDate = new Date(
          startDate.getTime() + i * checkIntervals * 24 * 60 * 60 * 1000
        );

        const jd = this._dateToJulianDay(
          checkDate.getFullYear(),
          checkDate.getMonth() + 1,
          checkDate.getDate(),
          12 // Check at noon for precision
        );

        const position = sweph.calc(jd, planetId, sweph.SEFLG_SIDEREAL);
        if (position && Array.isArray(position.longitude)) {
          const transitLongitude = position.longitude[0];

          // Check for conjunction (within 2 degrees)
          const angularDiff = Math.abs(transitLongitude - natalLongitude);
          const minDiff = Math.min(angularDiff, 360 - angularDiff);

          if (minDiff <= 2) {
            return checkDate;
          }
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Classify transits by significance level
   */
  _classifyTransitsBySignificance(transits, natalChart) {
    const classified = {
      major: [],
      significant: [],
      minor: []
    };

    transits.forEach(transit => {
      const significanceScore =
        transit.significance.score + transit.intensity.score;

      if (significanceScore >= 15) {
        classified.major.push(transit);
      } else if (significanceScore >= 8) {
        classified.significant.push(transit);
      } else {
        classified.minor.push(transit);
      }
    });

    return classified;
  }

  /**
   * Sort transits by importance and timing
   */
  _sortTransitsByImportance(classifiedTransits) {
    // Combine all transits
    const allTransits = [
      ...classifiedTransits.major.map(t => ({ ...t, priority: 3 })),
      ...classifiedTransits.significant.map(t => ({ ...t, priority: 2 })),
      ...classifiedTransits.minor.map(t => ({ ...t, priority: 1 }))
    ];

    // Sort by date, then by priority
    return allTransits.sort((a, b) => {
      const dateDiff = a.date.getTime() - b.date.getTime();
      if (dateDiff === 0) {
        return b.priority - a.priority; // Higher priority first if same date
      }
      return dateDiff;
    });
  }

  /**
   * Generate timing recommendations based on top transits
   */
  _generateTimingRecommendations(topTransits) {
    const recommendations = {
      favorablePeriods: [],
      challengingPeriods: [],
      actionTiming: [],
      generalAdvice: []
    };

    topTransits.forEach((transit, index) => {
      const date = transit.date.toLocaleDateString();
      const month = transit.date.toLocaleDateString('en-US', { month: 'long' });
      const planet = transit.transitingPlanet;

      if (this._isBeneficialTransit(planet, transit.natalPoint.type)) {
        recommendations.favorablePeriods.push({
          period: `${month} ${transit.date.getDate()}`,
          duration: '30-60 days',
          reason: `${planet} transit to natal ${transit.natalPoint.name}`,
          activities: this._getBeneficialActivities(transit.natalPoint.type)
        });
      } else if (this._isChallengingTransit(planet, transit.natalPoint.type)) {
        recommendations.challengingPeriods.push({
          period: `${month} ${transit.date.getDate()}`,
          duration: '15-30 days',
          reason: `${planet} transit to natal ${transit.natalPoint.name}`,
          activities: [
            'Caution',
            'Planning',
            'Preparation',
            'Remedial measures'
          ]
        });
      }
    });

    // General advice
    if (
      recommendations.favorablePeriods.length >
      recommendations.challengingPeriods.length
    ) {
      recommendations.generalAdvice.push(
        'Overall favorable period for major actions and decisions'
      );
    } else if (
      recommendations.challengingPeriods.length >
      recommendations.favorablePeriods.length
    ) {
      recommendations.generalAdvice.push(
        'Period requires careful planning and patience'
      );
    } else {
      recommendations.generalAdvice.push(
        'Mixed influences - balance careful planning with appropriate action'
      );
    }

    return recommendations;
  }

  /**
   * Calculate overall period influence
   */
  _calculatePeriodInfluence(sortedTransits, monthsAhead) {
    let beneficialScore = 0;
    let challengingScore = 0;

    sortedTransits.forEach(transit => {
      if (
        this._isBeneficialTransit(
          transit.transitingPlanet,
          transit.natalPoint.type
        )
      ) {
        beneficialScore += transit.significance.score * transit.intensity.score;
      } else if (
        this._isChallengingTransit(
          transit.transitingPlanet,
          transit.natalPoint.type
        )
      ) {
        challengingScore +=
          transit.significance.score * transit.intensity.score;
      }
    });

    const totalScore = beneficialScore + challengingScore;
    const netBalance = beneficialScore - challengingScore;

    let influence;
    let rating;

    if (netBalance > 50) {
      influence = 'Very favorable period for favorable planets';
      rating = 'Excellent';
    } else if (netBalance > 20) {
      influence = 'Mostly positive with some challenging aspects';
      rating = 'Good';
    } else if (netBalance > -20) {
      influence = 'Balanced period requiring careful navigation';
      rating = 'Neutral';
    } else if (netBalance > -50) {
      influence = 'Generally challenging with some opportunities';
      rating = 'Difficult';
    } else {
      influence = 'Very challenging period requiring protection and remedies';
      rating = 'Very Difficult';
    }

    return {
      overallInfluence: influence,
      rating,
      beneficialScore,
      challengingScore,
      netBalance,
      periodLength: `${monthsAhead} months`
    };
  }

  /**
   * Generate transits summary
   */
  _generateTransitsSummary(sortedTransits, periodInfluence, monthsAhead) {
    let summary = '🔭 *Significant Transits Analysis*\n\n';

    summary += `*Analysis Period:* Next ${monthsAhead} months\n`;
    summary += `*Overall Influence:* ${periodInfluence.rating} - ${periodInfluence.overallInfluence}\n\n`;

    summary += '*Top Upcoming Transits:*\n';
    const topTransits = sortedTransits.slice(0, 5);
    topTransits.forEach((transit, index) => {
      const dateStr = transit.date.toLocaleDateString();
      summary += `${index + 1}. ${transit.transitingPlanet} ${transit.aspect} natal ${transit.natalPoint.name} (${dateStr})\n`;
    });

    summary += '\n*Key Periods to Note:*\n';

    // Add favorable periods
    if (
      topTransits.some(t =>
        this._isBeneficialTransit(t.transitingPlanet, t.natalPoint.type)
      )
    ) {
      summary += '• Favorable opportunities available\n';
    }

    // Add challenging periods
    if (
      topTransits.some(t =>
        this._isChallengingTransit(t.transitingPlanet, t.natalPoint.type)
      )
    ) {
      summary += '• Challenging periods requiring caution and planning\n';
    }

    summary +=
      '\n*Recommendation:* Monitor these transits closely and avoid major decisions during challenging aspects.';

    return summary;
  }

  // Helper methods
  _calculateHouseForLongitude(longitude, ascendantLongitude) {
    const positionFromAsc = (longitude - ascendantLongitude + 360) % 360;
    return Math.floor(positionFromAsc / 30) + 1;
  }

  _identifySensitivePositions(natalChart) {
    const sensitive = [];

    // Check for planets in challenging positions
    Object.entries(natalChart.planets).forEach(([planet, data]) => {
      if (data.house === 1 || data.house === 8 || data.house === 12) {
        // Angles or challenging houses
        sensitive.push({
          type: 'sensitive_degree',
          longitude: data.longitude,
          planet,
          reason: `Planet in sensitive house ${data.house}`
        });
      }
    });

    return sensitive;
  }

  _calculateTransitSignificance(
    transitingPlanet,
    natalPointType,
    natalPointName
  ) {
    // Significance based on planet and point type
    let score = 5; // Base score

    // Planets that create important transits
    const majorPlanets = ['jupiter', 'saturn', 'rahu'];
    const minorPlanets = ['sun', 'mars'];

    if (majorPlanets.includes(transitingPlanet)) {
      score += 8;
    } else if (minorPlanets.includes(transitingPlanet)) {
      score += 4;
    } else {
      score += 2;
    }

    // Point type significance
    if (natalPointType === 'angles') {
      score += 6;
    } else if (natalPointName === 'sun') {
      score += 7; // Sun is always important
    } else if (natalPointName === 'moon') {
      score += 6;
    } else if (['mars', 'saturn', 'rahu'].includes(natalPointName)) {
      score += 5;
    } else {
      score += 3;
    }

    const significance =
      score >= 14 ? 'Major' : score >= 9 ? 'Significant' : 'Minor';

    return { score, level: significance };
  }

  _calculateTransitIntensity(transitingPlanet, natalPointType) {
    // Intensity based on planetary nature
    const intensities = {
      sun: 8,
      jupiter: 8,
      saturn: 9,
      rahu: 9,
      mars: 7,
      moon: 6,
      mercury: 5,
      venus: 5
    };

    const score = intensities[transitingPlanet] || 5;
    const level = score >= 8 ? 'High' : score >= 6 ? 'Medium' : 'Low';

    return { score, level };
  }

  _isBeneficialTransit(planet, pointType) {
    const beneficialPlanets = ['jupiter', 'venus', 'moon'];
    return (
      beneficialPlanets.includes(planet.toLowerCase()) &&
      pointType !== 'malefic_points'
    );
  }

  _isChallengingTransit(planet, pointType) {
    const challengingPlanets = ['saturn', 'mars', 'rahu'];
    return (
      challengingPlanets.includes(planet.toLowerCase()) ||
      pointType === 'malefic_points'
    );
  }

  _getBeneficialActivities(pointType) {
    if (pointType === 'angles') {
      return [
        'Major decisions',
        'New beginnings',
        'Important meetings',
        'Career changes'
      ];
    } else if (pointType === 'planets') {
      return [
        'Social activities',
        'Relationship matters',
        'Financial decisions',
        'Personal development'
      ];
    } else {
      return ['Regular activities', 'Planning', 'Important communications'];
    }
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
    return jd + (hour - 12) / 24;
  }

  async _getCoordinatesForPlace(place) {
    try {
      const coords = await this.geocodingService.getCoordinates(place);
      return [coords.latitude, coords.longitude];
    } catch (error) {
      logger.warn('Error getting coordinates, using default:', error.message);
      return [28.6139, 77.209]; // Delhi
    }
  }

  async _getTimezoneForPlace(latitude, longitude, timestamp) {
    return 5.5; // IST
  }
}

module.exports = { SignificantTransitsCalculator };
