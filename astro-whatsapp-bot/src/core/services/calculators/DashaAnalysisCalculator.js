const logger = require('../../../utils/logger');
const sweph = require('sweph');

/**
 * Dasha Analysis Calculator
 * Implements comprehensive Vimshottari Dasha system with planetary period calculations
 */
class DashaAnalysisCalculator {
  constructor(astrologer, geocodingService) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;

    // Vimshottari Dasha periods and lords
    this.vinshottariPeriods = [
      { lord: 'ketu', years: 7 },
      { lord: 'venus', years: 20 },
      { lord: 'sun', years: 6 },
      { lord: 'moon', years: 10 },
      { lord: 'mars', years: 7 },
      { lord: 'rahu', years: 18 },
      { lord: 'jupiter', years: 16 },
      { lord: 'saturn', years: 19 },
      { lord: 'mercury', years: 17 }
    ];
  }

  /**
   * Set services for the calculator
   */
  setServices(services) {
    this.services = services;
  }

  /**
   * Calculate complete Vimshottari Dasha analysis
   * @param {Object} birthData - Birth data object
   * @returns {Object} Comprehensive Dasha analysis
   */
  async calculateVimshottariDasha(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return { error: 'Complete birth details required for Dasha analysis' };
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

      // Calculate natal dasha position
      const dashaPosition = this._calculateDashaPosition(birthDateTime);

      // Calculate current maha dasha (major period)
      const currentDasha = this._calculateCurrentMahaDasha(birthDateTime);

      // Calculate current antara dasha (sub-period)
      const currentAntara = this._calculateCurrentAntaraDasha(
        birthDateTime,
        currentDasha
      );

      // Calculate upcoming maha dashas
      const upcomingDashas = this._calculateUpcomingMahaDashas(
        birthDateTime,
        currentDasha
      );

      // Analyze dasha effects and significances
      const dashaEffects = this._analyzeDashaEffects(
        currentDasha,
        currentAntara
      );

      // Calculate dasha periods suitable for activities
      const activitySuigibilies = this._calculateActivitySuitabilities(
        currentDasha,
        currentAntara
      );

      // Generate remedial measures for challenging dashas
      const remedialMeasures = this._calculateRemedialMeasures(
        currentDasha,
        currentAntara
      );

      return {
        name,
        birthDetails: {
          date: birthDate,
          time: birthTime,
          place: birthPlace,
          coordinates: { latitude, longitude },
          timezone
        },
        dashaPosition,
        currentDasha,
        currentAntara,
        upcomingDashas,
        dashaEffects,
        activitySuitabilities,
        remedialMeasures,
        summary: this._generateDashaSummary(
          currentDasha,
          currentAntara,
          dashaEffects
        )
      };
    } catch (error) {
      logger.error('❌ Error in Dasha calculation:', error);
      throw new Error(`Dasha calculation failed: ${error.message}`);
    }
  }

  /**
   * Get detailed current dasha influences
   */
  async getCurrentDashaInfluences(birthData) {
    try {
      const { birthDate, birthTime } = birthData;
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);

      const currentDasha = this._calculateCurrentMahaDasha(birthDateTime);
      const currentAntara = this._calculateCurrentAntaraDasha(
        birthDateTime,
        currentDasha
      );

      return {
        mahaDasha: currentDasha.name,
        antaraDasha: currentAntara.name,
        combinedInfluence: this._analyzeCombinedInfluence(
          currentDasha,
          currentAntara
        ),
        dominantThemes: this._getDashaThemes(currentDasha, currentAntara),
        practicalityRating: this._calculatePracticalityRating(
          currentDasha,
          currentAntara
        )
      };
    } catch (error) {
      logger.error('Error getting current dasha influences:', error.message);
      return { error: 'Unable to calculate current dasha influences' };
    }
  }

  /**
   * Calculate when next favorable dasha begins
   */
  async calculateNextFavorableDasha(birthData, activity) {
    try {
      const { birthDate, birthTime } = birthData;
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);

      const currentDasha = this._calculateCurrentMahaDasha(birthDateTime);
      const nextFavorable = this._findNextFavorableDasha(
        birthDateTime,
        currentDasha,
        activity
      );

      return (
        nextFavorable || {
          message:
            'Favorable dashas are generally available throughout the cycle'
        }
      );
    } catch (error) {
      logger.error('Error calculating next favorable dasha:', error.message);
      return { error: 'Unable to calculate next favorable dasha' };
    }
  }

  /**
   * Calculate dasha position relative to birth date
   * @private
   */
  _calculateDashaPosition(birthDateTime) {
    // Calculate which dasha cycle position we're in based on birth date
    // This is a simplified calculation - in practice would involve lunar positions
    const dayOfWeek = birthDateTime.getDay();
    const dashaIndex = this._getDashaIndexFromWeekday(dayOfWeek);

    return {
      startingDasha: this.vinshottariPeriods[dashaIndex].lord,
      cyclePosition: this.vinshottariPeriods[dashaIndex],
      yearsIntoCycle: this._calculateYearsIntoCycle(birthDateTime, dashaIndex)
    };
  }

  /**
   * Calculate current Maha Dasha
   * @private
   */
  _calculateCurrentMahaDasha(birthDateTime) {
    const yearsSinceBirth = Math.floor(
      (Date.now() - birthDateTime.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    const dashaPosition = this._calculateDashaPosition(birthDateTime);

    // Find which dasha period we're currently in
    let cumulativeYears = dashaPosition.yearsIntoCycle;
    let dashaIndex = this._getDashaIndex(dashaPosition.startingDasha);

    while (cumulativeYears <= yearsSinceBirth) {
      const dashaYears = this.vinshottariPeriods[dashaIndex].years;
      if (cumulativeYears + dashaYears <= yearsSinceBirth) {
        cumulativeYears += dashaYears;
        dashaIndex = (dashaIndex + 1) % this.vinshottariPeriods.length;
      } else {
        break;
      }
    }

    const currentLord = this.vinshottariPeriods[dashaIndex].lord;
    const yearsIntoCurrent = yearsSinceBirth - cumulativeYears;
    const remainingYears =
      this.vinshottariPeriods[dashaIndex].years - yearsIntoCurrent;

    return {
      lord: currentLord,
      name: currentLord.charAt(0).toUpperCase() + currentLord.slice(1),
      totalYears: this.vinshottariPeriods[dashaIndex].years,
      yearsRemaining: remainingYears,
      yearsCompleted: yearsIntoCurrent,
      completionPercentage:
        (yearsIntoCurrent / this.vinshottariPeriods[dashaIndex].years) * 100,
      periodSignificance: this._getDashaSignificance(currentLord)
    };
  }

  /**
   * Calculate current Antara Dasha (sub-period)
   * @private
   */
  _calculateCurrentAntaraDasha(birthDateTime, currentMahaDasha) {
    // This is a complex calculation involving the Maha Dasha lord
    // Simplified implementation
    const yearsInDasha =
      currentMahaDasha.totalYears - currentMahaDasha.yearsRemaining;
    const proportionalPosition = yearsInDasha / currentMahaDasha.totalYears;

    // Each Maha Dasha has sub-periods based on the same system but proportional
    const subPeriodIndex = Math.floor(proportionalPosition * 9);

    const subPeriodLord = this.vinshottariPeriods[subPeriodIndex].lord;
    const subPeriodYears = this.vinshottariPeriods[subPeriodIndex].years;
    const scaledSubYears = subPeriodYears * (currentMahaDasha.totalYears / 120); // Scale to Maha Dasha duration

    return {
      lord: subPeriodLord,
      name: subPeriodLord.charAt(0).toUpperCase() + subPeriodLord.slice(1),
      totalYears: scaledSubYears,
      significance: this._getAntaraSignificance(
        subPeriodLord,
        currentMahaDasha.lord
      )
    };
  }

  /**
   * Calculate upcoming Maha Dashas
   * @private
   */
  _calculateUpcomingMahaDashas(birthDateTime, currentDasha) {
    const upcoming = [];
    const currentIndex = this._getDashaIndex(currentDasha.lord);

    // Get next 5 Maha Dashas
    for (let i = 1; i <= 5; i++) {
      const dashaIndex = (currentIndex + i) % this.vinshottariPeriods.length;
      const dasha = this.vinshottariPeriods[dashaIndex];

      const startYear = currentDasha.yearsRemaining;
      for (let j = 1; j < i; j++) {
        const prevIndex = (currentIndex + j) % this.vinshottariPeriods.length;
        startYear += this.vinshottariPeriods[prevIndex].years;
      }

      upcoming.push({
        lord: dasha.lord,
        name: dasha.lord.charAt(0).toUpperCase() + dasha.lord.slice(1),
        years: dasha.years,
        startYear: Math.round(startYear),
        significance: this._getDashaSignificance(dasha.lord),
        preparationTip: this._getPreparationTip(dasha.lord)
      });
    }

    return upcoming;
  }

  /**
   * Analyze effects of current Dashas
   * @private
   */
  _analyzeDashaEffects(mahaDasha, antaraDasha) {
    const effects = {
      overallInfluence: this._combineInfluences(mahaDasha, antaraDasha),
      dominantAreas: this._getDominantAreas(mahaDasha.lord),
      challenges: this._getDashaChallenges(mahaDasha.lord, antaraDasha.lord),
      opportunities: this._getDashaOpportunities(
        mahaDasha.lord,
        antaraDasha.lord
      ),
      healthFocus: this._getHealthFocus(mahaDasha.lord),
      careerPath: this._getCareerPath(mahaDasha.lord, antaraDasha.lord),
      relationshipTheme: this._getRelationshipTheme(mahaDasha.lord),
      spiritualJourney: this._getSpiritualJourney(mahaDasha.lord)
    };

    return effects;
  }

  /**
   * Calculate activity suitabilities for current Dashas
   * @private
   */
  _calculateActivitySuitabilities(mahaDasha, antaraDasha) {
    const suitabilities = {
      marriage: 'Neutral',
      business: 'Neutral',
      education: 'Neutral',
      travel: 'Neutral',
      health: 'Neutral',
      spiritual: 'Neutral',
      family: 'Neutral',
      investment: 'Neutral'
    };

    // Define favorable activities for each planet
    const activityPreferences = {
      sun: {
        marriage: 'Poor',
        business: 'Good',
        education: 'Fair',
        travel: 'Good',
        health: 'Fair',
        spiritual: 'Fair',
        family: 'Fair',
        investment: 'Good'
      },
      moon: {
        marriage: 'Excellent',
        business: 'Fair',
        education: 'Good',
        travel: 'Fair',
        health: 'Good',
        spiritual: 'Good',
        family: 'Excellent',
        investment: 'Fair'
      },
      mars: {
        marriage: 'Fair',
        business: 'Excellent',
        education: 'Fair',
        travel: 'Good',
        health: 'Fair',
        spiritual: 'Fair',
        family: 'Fair',
        investment: 'Good'
      },
      mercury: {
        marriage: 'Fair',
        business: 'Excellent',
        education: 'Excellent',
        travel: 'Fair',
        health: 'Good',
        spiritual: 'Fair',
        family: 'Fair',
        investment: 'Excellent'
      },
      jupiter: {
        marriage: 'Good',
        business: 'Good',
        education: 'Good',
        travel: 'Excellent',
        health: 'Excellent',
        spiritual: 'Excellent',
        family: 'Good',
        investment: 'Good'
      },
      venus: {
        marriage: 'Excellent',
        business: 'Good',
        education: 'Fair',
        travel: 'Fair',
        health: 'Good',
        spiritual: 'Fair',
        family: 'Good',
        investment: 'Fair'
      },
      saturn: {
        marriage: 'Poor',
        business: 'Good',
        education: 'Good',
        travel: 'Poor',
        health: 'Poor',
        spiritual: 'Excellent',
        family: 'Poor',
        investment: 'Excellent'
      },
      rahu: {
        marriage: 'Fair',
        business: 'Excellent',
        education: 'Fair',
        travel: 'Excellent',
        health: 'Poor',
        spiritual: 'Good',
        family: 'Fair',
        investment: 'Good'
      },
      ketu: {
        marriage: 'Poor',
        business: 'Fair',
        education: 'Fair',
        travel: 'Poor',
        health: 'Fair',
        spiritual: 'Excellent',
        family: 'Poor',
        investment: 'Fair'
      }
    };

    // Use Maha Dasha as primary influence, Antara as modifier
    const mahaPrefs = activityPreferences[mahaDasha.lord];
    const antaraPrefs = activityPreferences[antaraDasha.lord];

    Object.keys(suitabilities).forEach(activity => {
      const mahaRating = this._convertRatingToNumber(mahaPrefs[activity]);
      const antaraRating = this._convertRatingToNumber(antaraPrefs[activity]);
      const combinedRating = (mahaRating + antaraRating) / 2;

      suitabilities[activity] = this._convertNumberToRating(combinedRating);
    });

    return suitabilities;
  }

  /**
   * Calculate remedial measures for challenging Dashas
   * @private
   */
  _calculateRemedialMeasures(mahaDasha, antaraDasha) {
    const remedial = {
      general: [],
      specific: [],
      gemstones: [],
      mantras: [],
      charities: [],
      lifestyle: []
    };

    // General remedies based on planetary challenges
    if (this._isMaleficDasha(mahaDasha.lord)) {
      remedial.general.push('Regular spiritual practices and meditation');
      remedial.general.push('Charitable activities and selfless service');
    }

    // Planet-specific remedies
    const planetRemedies = {
      sun: {
        mantras: ['Om Suryaya Namaha', 'Gayatri Mantra'],
        gemstones: ['Ruby', 'Garnet'],
        charities: ['Gold donation', 'Food distribution'],
        lifestyle: ['Strong leadership', 'Vitamin D', 'Back exercises']
      },
      moon: {
        mantras: ['Om Chandraya Namaha', 'Om Shum Shukraya Namaha'],
        gemstones: ['Pearl', 'Moonstone'],
        charities: ['Milk distribution', 'White clothes donation'],
        lifestyle: ['Emotional balance', 'Hydration', 'Peaceful environment']
      },
      mars: {
        mantras: ['Om Mangalaya Namaha', 'Om Angarakaya Namaha'],
        gemstones: ['Red Coral', 'Bloodstone'],
        charities: ['Red items donation', 'Land donation'],
        lifestyle: [
          'Physical exercise',
          'Avoid anger',
          'Red foods in moderation'
        ]
      },
      mercury: {
        mantras: ['Om Buddhaya Namaha', 'Om Dhanvantre Namaha'],
        gemstones: ['Emerald', 'Peridot'],
        charities: ['Green items', 'Education support'],
        lifestyle: ['Communication skills', 'Green vegetables', 'Meditation']
      },
      jupiter: {
        mantras: ['Om Gurve Namaha', 'Om Brahmane Namaha'],
        gemstones: ['Yellow Sapphire', 'Citrine'],
        charities: ['Yellow items', 'Guru dakshina'],
        lifestyle: ['Teaching/learning', 'Saffron in diet', 'Temple visits']
      },
      venus: {
        mantras: ['Om Shukraya Namaha', 'Om Shum Shukraya Namaha'],
        gemstones: ['Diamond', 'Clear Quartz'],
        charities: ['White clothes', 'Milk products donation'],
        lifestyle: ['Artistic activities', 'White foods', 'Harmony focus']
      },
      saturn: {
        mantras: ['Om Shanaischaraya Namaha', 'Om Shanishvaraya Namaha'],
        gemstones: ['Blue Sapphire', 'Lapis Lazuli'],
        charities: ['Black items', 'Iron implements donation'],
        lifestyle: ['Discipline', 'Patience', 'Sesame seeds']
      },
      rahu: {
        mantras: ['Om Rahuve Namaha', 'Om Batuk Bhairavaya Namaha'],
        gemstones: ['Hessonite Garnet', 'Black Tourmaline'],
        charities: ['Lead items', 'Animal welfare'],
        lifestyle: ['Spiritual practices', 'Avoid intoxicants', 'Meditation']
      },
      ketu: {
        mantras: ['Om Ketave Namaha', 'Om Batuk Bhairavaya Namaha'],
        gemstones: ['Cat\'s Eye', 'Tiger\'s Eye'],
        charities: ['Dog feeding', 'Grey items donation'],
        lifestyle: ['Meditation', 'Renunciation', 'Spiritual service']
      }
    };

    // Add remedies for both Maha and Antara Lords
    [mahaDasha.lord, antaraDasha.lord].forEach(planet => {
      if (planetRemedies[planet]) {
        remedial.specific.push(
          `For ${planet.charAt(0).toUpperCase() + planet.slice(1)} Dasha:`
        );
        remedial.mantras.push(...planetRemedies[planet].mantras);
        remedial.gemstones.push(...planetRemedies[planet].gemstones);
        remedial.charities.push(...planetRemedies[planet].charities);
        remedial.lifestyle.push(...planetRemedies[planet].lifestyle);
      }
    });

    return remedial;
  }

  /**
   * Generate comprehensive Dasha summary
   * @private
   */
  _generateDashaSummary(currentDasha, currentAntara, dashaEffects) {
    let summary = '⏳ *Vimshottari Dasha Analysis*\n\n';

    summary += `*Current Maha Dasha: ${currentDasha.name}*\n`;
    summary += `• Remaining: ${currentDasha.yearsRemaining.toFixed(1)} years\n`;
    summary += `• Completed: ${currentDasha.completionPercentage.toFixed(1)}%\n\n`;

    summary += `*Current Antara Dasha: ${currentAntara.name}*\n`;
    summary += `• Period: ${currentAntara.totalYears.toFixed(1)} years\n\n`;

    summary += '*Dominant Influences:*\n';
    dashaEffects.dominantAreas.forEach(area => {
      summary += `• ${area}\n`;
    });

    summary += '\n*Key Opportunities:*\n';
    dashaEffects.opportunities.slice(0, 3).forEach(opp => {
      summary += `• ${opp}\n`;
    });

    if (dashaEffects.challenges.length > 0) {
      summary += '\n*Areas for Attention:*\n';
      dashaEffects.challenges.slice(0, 2).forEach(challenge => {
        summary += `• ${challenge}\n`;
      });
    }

    summary +=
      '\n*Vimshottari Dasha reveals the planetary periods influencing life experiences and timing.*';

    return summary;
  }

  // Helper methods
  _getDashaIndex(lord) {
    return this.vinshottariPeriods.findIndex(d => d.lord === lord);
  }

  _getDashaIndexFromWeekday(dayOfWeek) {
    const lordMapping = [
      'sun',
      'moon',
      'mars',
      'mercury',
      'jupiter',
      'venus',
      'saturn'
    ];
    return lordMapping[dayOfWeek] ?
      this._getDashaIndex(lordMapping[dayOfWeek]) :
      0;
  }

  _calculateYearsIntoCycle(birthDateTime, dashaIndex) {
    // Simplified calculation - would normally involve moon position
    const moonPhaseDays = 13.75; // Approximate days into lunar cycle
    const dashaPortion = moonPhaseDays / 27.3; // Convert to dasha cycle portion
    return dashaPortion * 120; // Total Vimshottari cycle is 120 years
  }

  _getDashaSignificance(lord) {
    const significances = {
      sun: 'Authority, leadership, father, vitality',
      moon: 'Emotions, mother, home, mental peace',
      mars: 'Energy, courage, siblings, land, accidents',
      mercury: 'Intelligence, business, communication, skills',
      jupiter: 'Wisdom, spirituality, wealth, children, education',
      venus: 'Love, marriage, beauty, luxuries, arts',
      saturn: 'Discipline, hard work, longevity, spirituality',
      rahu: 'Ambition, foreign lands, unconventional paths',
      ketu: 'Spirituality, detachment, past life karma'
    };
    return significances[lord] || 'General life experiences and learning';
  }

  /**
   * Health check for DashaAnalysisCalculator
   * @returns {Object} Health status
   */
  healthCheck() {
    return {
      healthy: true,
      version: '1.0.0',
      name: 'DashaAnalysisCalculator',
      calculations: [
        'Vimshottari Dasha',
        'Current Influences',
        'Favorable Periods'
      ],
      status: 'Operational'
    };
  }
}

module.exports = { DashaAnalysisCalculator };
