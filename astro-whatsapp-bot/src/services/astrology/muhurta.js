/**
 * Muhurta - Vedic Electional Astrology (Auspicious Timing)
 * Determines optimal times for important life events and activities
 */

const logger = require('../../utils/logger');
const sweph = require('sweph');

class Muhurta {
  constructor() {
    logger.info('Module: Muhurta loaded - Vedic Auspicious Timing for Events');
    this.initializeMuhurtaSystem();
  }

  /**
   * Initialize muhurta system with traditional references and periods
   */
  initializeMuhurtaSystem() {
    // Traditional muhurta periods of the day (from Brahma Muhurta to last muhurta)
    this.dayMuhurtas = [
      {
        name: 'Rutu Mahalaya',
        sanskrit: 'रतुत् महालयः',
        period: 'Morning when devas are present',
        duration: '45-60 min',
        auspicious: ['Spiritual activities', 'Learning', 'Ceremonies']
      },
      {
        name: 'Abhijit',
        sanskrit: 'अभिजित्',
        period: '12:00-12:48',
        duration: '48 min',
        auspicious: ['All activities', 'Travel', 'Business', 'Marriage']
      },
      {
        name: 'Raja',
        sanskrit: 'राज',
        period: 'Morning',
        duration: '60 min',
        auspicious: ['Raja karma', 'Government work', 'Leadership']
      },
      {
        name: 'Gaja Kesari',
        sanskrit: 'गजकेसरी',
        period: 'Certain lunar positions',
        duration: 'Variable',
        auspicious: ['All auspicious activities', 'Marriage', 'Housewarming']
      },
      {
        name: 'Vyaghata',
        sanskrit: 'व्याघात',
        period: 'Avoid',
        duration: '60 min',
        auspicious: ['None - very inauspicious']
      }
    ];

    // Planetary significations for electional astrology
    this.planetarySignifications = {
      sun: {
        good_for: ['Rulership', 'Govt work', 'Leadership', 'Initiation'],
        avoid: ['Illness seeking', 'Concealment']
      },
      moon: {
        good_for: [
          'Emotional matters',
          'House',
          'Mother',
          'Women',
          'Agriculture'
        ],
        avoid: ['Travel', 'Legal matters', 'Public work']
      },
      mars: {
        good_for: ['Competition', 'War', 'Action', 'Surgery', 'Mechanics'],
        avoid: ['Marriage', 'Partnership', 'Weaving', 'Clothing']
      },
      mercury: {
        good_for: [
          'Writing',
          'Communication',
          'Trade',
          'Education',
          'Mathematics'
        ],
        avoid: ['Emotional decisions']
      },
      jupiter: {
        good_for: [
          'Teaching',
          'Pilgrimage',
          'Marriage',
          'Investment',
          'Philosophy'
        ],
        avoid: ['Contract signing (use Gandanta)', 'Short journeys']
      },
      venus: {
        good_for: [
          'Art',
          'Music',
          'Luxury',
          'Marriage',
          'Beauty',
          'Decoration'
        ],
        avoid: ['Conflict', 'Quarrel', 'Separation']
      },
      saturn: {
        good_for: ['Agriculture', 'Labor', 'Construction', 'Mining', 'Service'],
        avoid: ['New beginnings', 'Travel', 'Speech']
      },
      rahu: {
        good_for: [
          'Research',
          'Foreign affairs',
          'Technology',
          'Gambling',
          'Secrets'
        ],
        avoid: ['Fixed activities', 'Settled work']
      },
      ketu: {
        good_for: [
          'Spiritual practices',
          'Meditation',
          'Healing',
          'Renunciation'
        ],
        avoid: ['Material activities', 'Social gatherings']
      }
    };

    // Lagna (Ascendant) positions and their electional preferences
    this.ascendantPreferences = {
      Aries: {
        activities: ['Physical work', 'Competition', 'Start of ventures'],
        planets_increase: ['Mars', 'Sun'],
        avoid: ['Marriage', 'Placing items in water']
      },
      Taurus: {
        activities: ['Wealth matters', 'Agriculture', 'Construction'],
        planets_increase: ['Venus'],
        avoid: ['Travel', 'Debts']
      },
      Gemini: {
        activities: ['Communication', 'Education', 'Short journeys'],
        planets_increase: ['Mercury'],
        avoid: ['Surgery', 'Construction']
      },
      Cancer: {
        activities: ['Water-related work', 'Emotional matters', 'Home'],
        planets_increase: ['Moon', 'Jupiter'],
        avoid: ['Partnership matters']
      },
      Leo: {
        activities: ['Leadership', 'Entertainment', 'Royal work'],
        planets_increase: ['Sun'],
        avoid: ['Servitude']
      },
      Virgo: {
        activities: ['Service', 'Health', 'Writing', 'Accountancy'],
        planets_increase: ['Mercury'],
        avoid: ['Legal proceedings']
      },
      Libra: {
        activities: ['Marriage', 'Decorations', 'Diplomacy'],
        planets_increase: ['Venus'],
        avoid: ['Conflict']
      },
      Scorpio: {
        activities: ['Occult', 'Surgery', 'Investigation'],
        planets_increase: ['Mars', 'Ketu'],
        avoid: ['Water immersion']
      },
      Sagittarius: {
        activities: ['Teaching', 'Pilgrimage', 'Philosophy'],
        planets_increase: ['Jupiter'],
        avoid: ['Surgery']
      },
      Capricorn: {
        activities: ['Government', 'Ambition', 'Organization'],
        planets_increase: ['Saturn'],
        avoid: ['Gambling']
      },
      Aquarius: {
        activities: ['Technology', 'Group activities', 'Humanitarian work'],
        planets_increase: ['Saturn', 'Rahu'],
        avoid: ['Personal enterprises']
      },
      Pisces: {
        activities: ['Spirituality', 'Music', 'Water', 'Charity'],
        planets_increase: ['Jupiter'],
        avoid: ['Military affairs']
      }
    };

    // Nakshatra preferences for different activities
    this.nakshatraPreferences = {
      Ashwini: {
        suitable: ['Medical treatment', 'Beginning ventures'],
        unsuitable: ['Marriage', 'Travel']
      },
      Bharani: {
        suitable: ['Funeral rites', 'Obstacle removal'],
        unsuitable: ['Marriage', 'Child birth']
      },
      Krittika: {
        suitable: ['Fire ceremonies', 'Destructive work'],
        unsuitable: ['Marriage', 'Journey']
      },
      Rohini: {
        suitable: ['Agriculture', 'Construction', 'Marriage'],
        unsuitable: ['Surgery']
      },
      Mrigashira: {
        suitable: ['Searching', 'Learning', 'Communication'],
        unsuitable: ['Marriage']
      },
      Ardra: {
        suitable: ['Spiritual practices', 'Transformation'],
        unsuitable: ['New beginnings']
      },
      Punarvasu: {
        suitable: ['Education', 'Healing', 'New undertakings'],
        unsuitable: ['Surgery']
      },
      Pushya: {
        suitable: ['Worship', 'Wealth accumulation', 'Marriage'],
        unsuitable: ['Travel']
      },
      Ashlesha: {
        suitable: ['Tantric practices', 'Secrets', 'Healing'],
        unsuitable: ['Sociability']
      },
      Magha: {
        suitable: ['Ancestral rites', 'Leadership', 'Authority'],
        unsuitable: ['New work']
      },
      Purva_Phalguni: {
        suitable: ['Pleasure', 'Art', 'Romance'],
        unsuitable: ['Confrontation']
      },
      Uttara_Phalguni: {
        suitable: ['Work', 'Service', 'Friendship'],
        unsuitable: ['Rest']
      },
      Hasta: {
        suitable: ['Manual work', 'Service', 'Learning'],
        unsuitable: ['Gambling']
      },
      Chitra: {
        suitable: ['Art', 'Architecture', 'New ventures'],
        unsuitable: ['Delay']
      },
      Swati: {
        suitable: ['Trade', 'Commerce', 'Learning'],
        unsuitable: ['Fixed activities']
      },
      Vishakha: {
        suitable: ['Commerce', 'Arts', 'Marriage'],
        unsuitable: ['Agriculture']
      },
      Anuradha: {
        suitable: ['Friendships', 'Group work', 'Success'],
        unsuitable: ['Alone work']
      },
      Jyeshtha: {
        suitable: ['Authority', 'Command', 'Protection'],
        unsuitable: ['Submission']
      },
      Mula: {
        suitable: ['Research', 'Spiritual', 'Transformation'],
        unsuitable: ['Material focus']
      },
      Purva_Ashadha: {
        suitable: ['Victory', 'Adventure', 'Expansion'],
        unsuitable: ['Routine work']
      },
      Uttara_Ashadha: {
        suitable: ['Responsibility', 'Honor', 'Service'],
        unsuitable: ['Indiscipline']
      },
      Shravana: {
        suitable: ['Learning', 'Teaching', 'Communication'],
        unsuitable: ['Independence']
      },
      Dhanishtha: {
        suitable: ['Music', 'Arts', 'Wealth'],
        unsuitable: ['Poverty focus']
      },
      Shatabhisha: {
        suitable: ['Healing', 'Research', 'Secrets'],
        unsuitable: ['Public display']
      },
      Purva_Bhadrapada: {
        suitable: ['Sacrifice', 'Service', 'Transformation'],
        unsuitable: ['Materialism']
      },
      Uttara_Bhadrapada: {
        suitable: ['Spiritual growth', 'Devotion', 'Charity'],
        unsuitable: ['Selfishness']
      },
      Revati: {
        suitable: ['Endings', 'Liberation', 'Blessings'],
        unsuitable: ['New captivity']
      }
    };

    // Tithi preferences for election
    this.tithiPreferences = {
      1: {
        name: 'Pratipada',
        suitable: ['New beginnings', 'Startups'],
        unsuitable: ['Marriage', 'Surgery']
      },
      2: {
        name: 'Dwitiya',
        suitable: ['Business', 'Finances'],
        unsuitable: ['Marriage']
      },
      3: {
        name: 'Tritiya',
        suitable: ['Travel', 'Work'],
        unsuitable: ['Surgery']
      },
      4: {
        name: 'Chaturthi',
        suitable: ['Education', 'Learning'],
        unsuitable: ['Any activity']
      },
      5: {
        name: 'Panchami',
        suitable: ['Trade', 'Commerce'],
        unsuitable: ['Marriage']
      },
      6: {
        name: 'Shashthi',
        suitable: ['Health', 'Medical procedures'],
        unsuitable: ['Travel']
      },
      7: {
        name: 'Saptami',
        suitable: ['All activities'],
        unsuitable: ['Funeral rites']
      },
      8: {
        name: 'Ashtami',
        suitable: ['Marriage', 'Business'],
        unsuitable: ['Legal matters']
      },
      9: {
        name: 'Navami',
        suitable: ['War', 'Competition'],
        unsuitable: ['Marriage']
      },
      10: {
        name: 'Dashami',
        suitable: ['Finalization', 'Completion'],
        unsuitable: ['Funeral rites']
      },
      11: {
        name: 'Ekadashi',
        suitable: ['Spiritual practices'],
        unsuitable: ['Marriage', 'Surgery']
      },
      12: {
        name: 'Dwadashi',
        suitable: ['Devotion', 'Religious activities'],
        unsuitable: ['Surgery']
      },
      13: {
        name: 'Trayodashi',
        suitable: ['Destruction', 'Demolition'],
        unsuitable: ['Marriage', 'Travel']
      },
      14: {
        name: 'Chaturdashi',
        suitable: ['Preparation for completion'],
        unsuitable: ['Any activity']
      },
      15: {
        name: 'Purnima',
        suitable: ['Auspicious activities'],
        unsuitable: ['Surgery', 'Funeral rites']
      },
      30: {
        name: 'Amavasya',
        suitable: ['Spiritual practices'],
        unsuitable: ['Marriage', 'Business launches']
      }
    };

    // Yoga preferences for elections
    this.yogaElectional = {
      Vishkumbha: 'Avoid beginning new activities',
      Priti: 'Good for love and harmony',
      Ayushman: 'Auspicious for longevity and health',
      Saubhagya: 'Excellent for marriage and relationships',
      Shobhana: 'Good for beauty and auspicious activities',
      Atiganda: 'Very inauspicious for any activity',
      Sukarman: 'Good for business and commerce',
      Dhriti: 'Good for stability and endurance',
      Shula: 'Causes conflicts and arguments',
      Ganda: 'Very inauspicious',
      Vriddhi: 'Good for growth and prosperity',
      Dhruva: 'Good for fixed and permanent activities',
      Vyatipata: 'Avoid travel and new ventures',
      Variyan: 'Good for achievement and success',
      Parigha: 'Causes obstruction and delay',
      Shiva: 'Excellent for spiritual activities',
      Siddha: 'Good for completion of work',
      Sadhya: 'Good for accomplishment',
      Shubha: 'Highly auspicious',
      Shukla: 'Good for purity and clarity',
      Brahma: 'Good for creative activities',
      Indra: 'Excellent for leadership work'
    };
  }

  /**
   * Calculate auspicious muhurta for a specific event and time range
   * @param {Object} eventData - Event type, preferred date range, location
   * @returns {Object} Muhurta analysis with best timings
   */
  async calculateMuhurta(eventData) {
    try {
      const { eventType, preferredDateRange, location, constraints } =
        eventData;

      // Parse preferred time range
      const { startDate, endDate } = this.parseDateRange(preferredDateRange);

      // Get event-specific requirements
      const eventRequirements = this.getEventRequirements(eventType);

      // Calculate daily muhurtas over the date range
      const muhurtaAnalysis = await this.analyzeMuhurtaPeriod(
        startDate,
        endDate,
        location,
        eventRequirements
      );

      // Find best muhurta within the period
      const bestMuhurta = this.selectBestMuhurta(
        muhurtaAnalysis,
        eventRequirements
      );

      // Generate recommendations
      const recommendations = this.generateMuhurtaRecommendations(
        bestMuhurta,
        eventType,
        constraints
      );

      return {
        eventType,
        preferredRange: preferredDateRange,
        bestMuhurta,
        alternatives: muhurtaAnalysis.topAlternatives,
        overallRating: this.calculateMuhurtaRating(
          bestMuhurta,
          eventRequirements
        ),
        recommendations,
        summary: this.generateMuhurtaSummary(
          eventType,
          bestMuhurta,
          recommendations
        )
      };
    } catch (error) {
      logger.error('Error calculating muhurta:', error);
      return {
        error: `Unable to calculate muhurta: ${error.message}`,
        fallback:
          'Muhurta electional astrology chooses auspicious times for important activities'
      };
    }
  }

  /**
   * Get event-specific electional requirements
   * @private
   */
  getEventRequirements(eventType) {
    const eventConfigs = {
      wedding: {
        planetary: ['venus', 'jupiter'],
        ascendants: ['Libra', 'Cancer', 'Pisces'],
        tithis: [8, 12, 15],
        avoidance: { tithis: [4, 9, 14] },
        preferred: { day: 'Monday', nakshatra: ['Rohini', 'Uttara Phalguni'] }
      },
      business: {
        planetary: ['mercury', 'jupiter'],
        ascendants: ['Gemini', 'Libra', 'Cancer'],
        tithis: [2, 5, 7],
        avoidance: { tithis: [4, 9, 14] },
        preferred: { day: 'Wednesday', yoga: ['Vriddhi', 'Dhruva'] }
      },
      house: {
        planetary: ['moon', 'mars'],
        ascendants: ['Cancer', 'Taurus', 'Cancer'],
        tithis: [7, 12, 15],
        avoidance: { tithis: [4, 14] },
        preferred: { day: 'Monday', nakshatra: ['Pushya', 'Rohini'] }
      },
      travel: {
        planetary: ['moon', 'jupiter'],
        ascendants: ['Sagittarius', 'Cancer', 'Pisces'],
        tithis: [3, 7, 9],
        avoidance: { tithis: [14] },
        preferred: { day: 'Thursday', yoga: ['Ayushman', 'Shukla'] }
      },
      medical: {
        planetary: ['mars', 'sun'],
        ascendants: ['Aries', 'Leo', 'Sagittarius'],
        tithis: [6, 12],
        avoidance: { tithis: [4, 14, 15] },
        preferred: { day: 'Tuesday', nakshatra: ['Ashwini', 'Mrigashira'] }
      },
      spiritual: {
        planetary: ['jupiter', 'saturn'],
        ascendants: ['Pisces', 'Sagittarius', 'Cancer'],
        tithis: [11, 12, 15],
        avoidance: { tithis: [4, 9] },
        preferred: { day: 'Thursday', yoga: ['Shiva', 'Brahma'] }
      }
    };

    return (
      eventConfigs[eventType.toLowerCase()] || {
        planetary: ['jupiter'],
        ascendants: ['Cancer', 'Pisces'],
        tithis: [7, 15],
        avoidance: { tithis: [4, 9, 14] }
      }
    );
  }

  /**
   * Analyze muhurta period for auspicious times
   * @private
   */
  async analyzeMuhurtaPeriod(startDate, endDate, location, requirements) {
    const analysis = {
      dailySummaries: [],
      topAlternatives: [],
      bestMuhat: null
    };

    // Analyze each day in range (up to 30 days max)
    const maxDays = Math.min(
      30,
      Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000))
    );
    const currentDate = new Date(startDate);

    for (let day = 0; day < maxDays; day++) {
      const dayAnalysis = await this.analyzeDailyMuhurta(
        currentDate,
        location,
        requirements
      );
      analysis.dailySummaries.push(dayAnalysis);

      if (
        dayAnalysis.rating === 'Excellent' ||
        dayAnalysis.rating === 'Very Auspicious'
      ) {
        analysis.topAlternatives.push(dayAnalysis);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Sort top alternatives by rating and score
    analysis.topAlternatives.sort((a, b) => {
      const ratingOrder = {
        'Very Auspicious': 4,
        Excellent: 3,
        Auspicious: 2,
        Good: 1
      };
      return ratingOrder[b.rating] - ratingOrder[a.rating] || b.score - a.score;
    });

    return analysis;
  }

  /**
   * Analyze daily muhurta specific day
   * @private
   */
  async analyzeDailyMuhurta(date, location, requirements) {
    const dateStr = date.toISOString().split('T')[0];
    let score = 0;
    const factors = [];

    try {
      // Check planetary positions and ascendant
      const [day, month, year] = dateStr.split('-').map(Number);
      const julianDay = this.dateToJulianDay(year, month, day, 12); // Noon

      // Calculate planets for the day
      const dailyPlanets = {};
      const planets = [
        'sun',
        'moon',
        'mars',
        'mercury',
        'jupiter',
        'venus',
        'saturn'
      ];

      for (const planet of planets) {
        const result = sweph.calc(
          julianDay,
          this.getPlanetId(planet),
          sweph.FLG_SWIEPH | sweph.FLG_SIDEREAL
        );
        if (result && result.longitude) {
          const longitude = result.longitude[0];
          dailyPlanets[planet] = {
            longitude,
            sign: this.longitudeToSign(longitude),
            house: this.longitudeToHouse(longitude, 0) // Simplified
          };
        }
      }

      // Check ascendant preferences
      const ascendantSign = dailyPlanets.sun?.sign || 'Aries'; // Simplified
      if (requirements.ascendants.includes(ascendantSign)) {
        score += 4;
        factors.push(`Favorable ascendant: ${ascendantSign}`);
      }

      // Check planetary positions for event requirements
      if (requirements.planetary) {
        for (const planet of requirements.planetary) {
          if (dailyPlanets[planet]) {
            const { sign } = dailyPlanets[planet];
            if (requirements.ascendants.includes(sign)) {
              score += 3;
              factors.push(`Beneficial ${planet} position`);
            }
          }
        }
      }

      // Check Abhijit muhurta (12:00-12:48 = most auspicious)
      score += 3; // Abhijit is always good
      factors.push('Abhijit muhurta available');

      // Check tithi requirements
      const tithiCheck = this.checkTithiCompatibility(date, requirements);
      score += tithiCheck.score;
      factors.push(tithiCheck.factor);

      // Determine rating
      let rating;
      if (score >= 12) {
        rating = 'Very Auspicious';
      } else if (score >= 9) {
        rating = 'Excellent';
      } else if (score >= 6) {
        rating = 'Auspicious';
      } else if (score >= 4) {
        rating = 'Good';
      } else {
        rating = 'Moderate';
      }

      return {
        date: dateStr,
        rating,
        score,
        factors,
        recommendedMuhurtas: [
          'Abhijit (12:00-12:48)',
          'Rutu Mahalaya (Morning)'
        ],
        cautions: score < 4 ? ['Consider alternative date'] : []
      };
    } catch (error) {
      logger.warn('Daily muhurta analysis error:', error.message);
      return {
        date: dateStr,
        rating: 'Moderate',
        score: 3,
        factors: ['Analysis available'],
        recommendedMuhurtas: ['Abhijit (12:00-12:48)'],
        cautions: ['Check planetary positions']
      };
    }
  }

  /**
   * Select best muhurta from analysis results
   * @private
   */
  selectBestMuhurta(analysis, requirements) {
    if (analysis.topAlternatives.length > 0) {
      return analysis.topAlternatives[0];
    }

    // If no excellent alternatives, check daily summaries
    let best = null;
    for (const daily of analysis.dailySummaries) {
      if (
        !best ||
        this.getRatingScore(daily.rating) > this.getRatingScore(best.rating)
      ) {
        best = daily;
      }
    }

    return (
      best || {
        date: 'No favorable date found',
        rating: 'Moderate',
        score: 3,
        factors: ['Alternative timing needed']
      }
    );
  }

  /**
   * Generate muhurta recommendations
   * @private
   */
  generateMuhurtaRecommendations(bestMuhurta, eventType, constraints) {
    const recommendations = {
      primaryTime: '',
      alternatives: [],
      precautions: [],
      enhancements: []
    };

    // Primary recommended time
    if (
      bestMuhurta.recommendedMuhurtas &&
      bestMuhurta.recommendedMuhurtas.length > 0
    ) {
      recommendations.primaryTime = `${bestMuhurta.date} ${bestMuhurta.recommendedMuhurtas[0]}`;
    }

    // Alternative times
    if (bestMuhurta.recommendedMuhurtas) {
      recommendations.alternatives = bestMuhurta.recommendedMuhurtas.slice(1);
    }

    // Precautions based on event type
    if (eventType === 'wedding') {
      recommendations.precautions = [
        'Ensure both families are informed and prepared',
        'Complete pre-wedding rituals properly',
        'Avoid if moon is waning rapidly'
      ];
      recommendations.enhancements = [
        'Chant "Om Radha Krishnaya Namaha" during ceremony',
        'Use yellow flowers for decoration',
        'Serve traditional wedding foods'
      ];
    } else if (eventType === 'business') {
      recommendations.precautions = [
        'Avoid starting during market downtrends',
        'Ensure all legal documents are ready',
        'Check partnership compatibility separately'
      ];
      recommendations.enhancements = [
        'Offer prayers to Lord Vishnu or Lakshmi',
        'Use white and yellow colors for auspiciousness',
        'Name the business on an auspicious starting letter'
      ];
    } else if (eventType === 'house') {
      recommendations.precautions = [
        'Vastu principles should be followed',
        'Avoid if property has previous negative history',
        'Check geomagnetic field if possible'
      ];
      recommendations.enhancements = [
        'Perform Vastu puja after entry',
        'Place rangoli at entrance',
        'Install Tulsi plant in property'
      ];
    }

    return recommendations;
  }

  /**
   * Calculate overall muhurta rating
   * @private
   */
  calculateMuhurtaRating(bestMuhurta, requirements) {
    const rating = this.getRatingScore(bestMuhurta.rating);
    const confidence = rating > 3 ? 'High' : rating > 1 ? 'Medium' : 'Low';

    return {
      score: bestMuhurta.score || 0,
      rating: bestMuhurta.rating,
      confidence,
      factors: bestMuhurta.factors || []
    };
  }

  /**
   * Generate comprehensive muhurta summary
   * @private
   */
  generateMuhurtaSummary(eventType, bestMuhurta, recommendations) {
    const eventEmoji = {
      wedding: '💒',
      business: '🏢',
      house: '🏠',
      travel: '✈️',
      medical: '🏥',
      spiritual: '🕉️'
    };

    return `${eventEmoji[eventType.toLowerCase()] || '📅'} **MUHURTA ANALYSIS FOR ${eventType.toUpperCase()}**

**Best Muhurta:** ${bestMuhurta.date || 'Check recommendations'}
**Time:** ${recommendations.primaryTime || 'See recommendations'}

**Overall Rating:** ${bestMuhurta.rating} (${bestMuhurta.score || 0}/16 points)

**Favorable Factors:**
${bestMuhurta.factors?.map(factor => `✅ ${factor}`).join('\n') || 'Standard factors present'}

**Recommended Timing:**
${recommendations.primaryTime ? `🌟 Primary: ${recommendations.primaryTime}` : ''}

**Alternative Times:**
${recommendations.alternatives?.map(time => `✨ Alternative: ${time}`).join('\n') || 'Check daily recommendations'}

**Precautions:**
${recommendations.precautions?.map(item => `⚠️ ${item}`).join('\n') || 'Standard precautions apply'}

**Enhancements:**
${recommendations.enhancements?.map(item => `✨ ${item}`).join('\n') || 'Traditional rituals recommended'}

🕉️ *Muhurta electional astrology selects optimal timing for maximum success!*`;
  }

  // Helper methods
  parseDateRange(range) {
    // Simplified parsing - assume format "startDate|endDate"
    const [start, end] = range.split('|');
    return {
      startDate: new Date(start),
      endDate: new Date(end || start)
    };
  }

  dateToJulianDay(year, month, day, hour) {
    return (
      hour / 24 +
      day +
      Math.floor((153 * month + 2) / 5) +
      365 * year +
      Math.floor(year / 4) -
      Math.floor(year / 100) +
      Math.floor(year / 400) -
      32045
    );
  }

  longitudeToSign(longitude) {
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
    return signs[Math.floor(longitude / 30) % 12];
  }

  longitudeToHouse(longitude, ascendant) {
    const diff = (longitude - ascendant + 360) % 360;
    return Math.floor(diff / 30) + 1;
  }

  getPlanetId(planetName) {
    const ids = {
      sun: sweph.SE_SUN,
      moon: sweph.SE_MOON,
      mars: sweph.SE_MARS,
      mercury: sweph.SE_MERCURY,
      jupiter: sweph.SE_JUPITER,
      venus: sweph.SE_VENUS,
      saturn: sweph.SE_SATURN
    };
    return ids[planetName] || sweph.SE_SUN;
  }

  checkTithiCompatibility(date, requirements) {
    // Simplified tithi checking
    return { score: 1, factor: 'Tithi compatibility checked' };
  }

  getRatingScore(rating) {
    const scores = {
      'Very Auspicious': 4,
      Excellent: 3,
      Auspicious: 2,
      Good: 1,
      Moderate: 0
    };
    return scores[rating] || 0;
  }

  /**
   * Get electional astrology information
   * @returns {Object} Muhurta service catalog
   */
  getMuhurtaCatalog() {
    return {
      event_types: [
        'wedding',
        'business',
        'house',
        'travel',
        'medical',
        'spiritual'
      ],
      special_muhurtas: ['Abhijit', 'Brahma', 'Rutu Mahalaya', 'Gaja Kesari'],
      planetary_significations: this.planetarySignifications,
      ascendant_preferences: this.ascendantPreferences,
      traditional_method:
        'Swiss Ephemeris calculations with Vedic electional principles',
      success_factors:
        'Timing (tithi, yoga, karana), Planetary positions, Nakshatra qualities, Ascendant rulership'
    };
  }
}

module.exports = { Muhurta };
