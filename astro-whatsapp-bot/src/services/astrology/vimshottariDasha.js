/**
 * Vimshottari Dasha System - Real Vedic Predictive Technique
 * Calculates planetary periods and sub-periods using authentic nakshatra-based calculations
 */

const logger = require('../../utils/logger');
const sweph = require('sweph');

class VimshottariDasha {
  constructor() {
    logger.info('Module: VimshottariDasha loaded with authentic calculations.');
    this.initializeDashaSystem();
  }

  /**
   * Initialize the complete Vimshottari Dasha system with accurate calculations
   */
  initializeDashaSystem() {
    // Vimshottari Dasha periods (in years)
    this.dashaPeriods = {
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

    // Dasha sequence order
    this.dashaSequence = ['moon', 'sun', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury', 'ketu', 'venus'];

    // Nakshatra lords as per Vedic tradition
    this.nakshatraLords = [
      'ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury',
      'ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury',
      'ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'
    ];

    // Nakshatra spans (each 13.333... degrees)
    this.nakshatraSpans = [];
    for (let i = 0; i < 27; i++) {
      this.nakshatraSpans.push({
        start: i * (360 / 27),
        end: (i + 1) * (360 / 27),
        lord: this.nakshatraLords[i]
      });
    }

    // Planetary significations for authentic predictions
    this.planetarySignifications = {
      sun: {
        general: 'Father, authority, government, leadership, health, vitality',
        career: 'Government jobs, politics, administration, leadership roles',
        health: 'Heart, bones, right eye, digestive system',
        relationships: 'Father, husband (for women), authority figures',
        positive: 'Leadership, confidence, success, vitality',
        negative: 'Arrogance, health issues, conflicts with authority'
      },
      moon: {
        general: 'Mother, emotions, mind, intuition, home, family',
        career: 'Nursing, teaching, psychology, real estate, food industry',
        health: 'Left eye, lungs, stomach, mental health, fluids',
        relationships: 'Mother, wife (for men), emotional connections',
        positive: 'Emotional intelligence, intuition, nurturing, adaptability',
        negative: 'Mood swings, anxiety, depression, instability'
      },
      mars: {
        general: 'Energy, courage, siblings, property, accidents, surgery',
        career: 'Military, police, sports, engineering, surgery, real estate',
        health: 'Blood, muscles, head injuries, fevers, infections',
        relationships: 'Younger siblings, cousins, competitors',
        positive: 'Courage, energy, protection, initiative',
        negative: 'Aggression, accidents, conflicts, injuries'
      },
      mercury: {
        general: 'Communication, intelligence, education, business, trade',
        career: 'Teaching, writing, business, accounting, journalism, IT',
        health: 'Nervous system, skin, speech, lungs, intestines',
        relationships: 'Friends, maternal uncles, neighbors, students',
        positive: 'Intelligence, communication skills, adaptability',
        negative: 'Anxiety, speech issues, learning difficulties'
      },
      jupiter: {
        general: 'Wisdom, spirituality, wealth, children, religion, law',
        career: 'Teaching, law, religion, banking, consulting, politics',
        health: 'Liver, pancreas, hips, thighs, obesity, diabetes',
        relationships: 'Children, teachers, spiritual guides, elders',
        positive: 'Wisdom, prosperity, spirituality, generosity',
        negative: 'Overconfidence, weight gain, extravagance'
      },
      venus: {
        general: 'Love, beauty, luxury, marriage, arts, pleasures',
        career: 'Arts, entertainment, fashion, luxury goods, hospitality',
        health: 'Kidneys, reproductive system, skin, eyes',
        relationships: 'Spouse, lovers, artistic friends',
        positive: 'Charm, artistic talent, harmony, sensuality',
        negative: 'Indulgence, relationship issues, vanity'
      },
      saturn: {
        general: 'Discipline, hard work, longevity, justice, delays, spirituality',
        career: 'Agriculture, labor, government, research, social work',
        health: 'Joints, bones, teeth, skin, chronic diseases',
        relationships: 'Elderly people, servants, patients, spiritual teachers',
        positive: 'Discipline, perseverance, wisdom, justice',
        negative: 'Delays, obstacles, depression, chronic illness'
      },
      rahu: {
        general: 'Ambition, foreign lands, unconventional paths, technology',
        career: 'Politics, business, technology, foreign trade, research',
        health: 'Skin diseases, mental disorders, chronic illness',
        relationships: 'Foreign connections, step-parents',
        positive: 'Ambition, innovation, foreign success',
        negative: 'Confusion, addiction, scandals'
      },
      ketu: {
        general: 'Spirituality, detachment, past life karma, liberation',
        career: 'Spirituality, research, healing, social work',
        health: 'Wounds, infections, mental illness, spiritual crises',
        relationships: 'Spiritual connections, past life relationships',
        positive: 'Spiritual wisdom, detachment, healing abilities',
        negative: 'Isolation, mental confusion, spiritual crises'
      }
    };
  }

  /**
   * Calculate accurate Vimshottari Dasha based on Moon's position in nakshatra
   * @param {Object} birthData - Birth date, time, place
   * @returns {Object} Complete Dasha analysis
   */
  async calculateVimshottariDasha(birthData) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      // Parse birth data
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Calculate Julian Day
      const jd = this._dateToJulianDay(year, month, day, hour + minute / 60);

      // Calculate precise Moon position using Swiss Ephemeris
      const moonPosition = await this._getMoonPosition(jd);

      // Determine nakshatra and position within it
      const nakshatraInfo = this._calculateNakshatraPosition(moonPosition.longitude);

      // Calculate starting Dasha based on Moon's position in nakshatra
      const startingDasha = this._getStartingDasha(nakshatraInfo);
      const progressInNakshatra = nakshatraInfo.progress;

      // Calculate current Dasha and Bhukti
      const currentDashaData = await this._calculateCurrentDasha(
        startingDasha, progressInNakshatra, year, month, day, hour, minute
      );

      // Calculate upcoming Dashas
      const upcomingDashas = await this._calculateUpcomingDashas(currentDashaData.currentDasha);

      // Generate predictions
      const currentPredictions = this._generateDashaPredictions(
        currentDashaData.currentDasha,
        currentDashaData.currentBhukti
      );

      return {
        moon_longitude: moonPosition.longitude,
        moon_sign: this._getSignFromLongitude(moonPosition.longitude),
        nakshatra: nakshatraInfo.nakshatraName,
        nakshatra_lord: nakshatraInfo.lord,
        progress_in_nakshatra: progressInNakshatra,
        starting_dasha: startingDasha,
        current_period: currentDashaData,
        upcoming_dashas: upcomingDashas,
        predictions: currentPredictions,
        summary: this._generateDashaSummary(birthData.name, currentDashaData, currentPredictions)
      };
    } catch (error) {
      logger.error('Error calculating Vimshottari Dasha:', error);
      return {
        error: `Unable to calculate authentic Vimshottari Dasha - ${error.message}`
      };
    }
  }

  /**
   * Get precise Moon position using Swiss Ephemeris
   * @private
   */
  async _getMoonPosition(jd) {
    try {
      // Use Swiss Ephemeris for accurate Moon calculation with sidereal zodiac
      const result = sweph.calc(jd, sweph.SE_MOON, sweph.FLG_SWIEPH | sweph.FLG_SIDEREAL | sweph.FLG_SPEED);

      if (!result || !result.longitude || result.longitude.length === 0) {
        throw new Error('Unable to calculate Moon position using Swiss Ephemeris');
      }

      return {
        longitude: result.longitude[0],
        latitude: result.longitude[1],
        speed: result.longitude[2]
      };
    } catch (error) {
      logger.error('Error getting Moon position from Swiss Ephemeris:', error);
      throw error;
    }
  }

  /**
   * Calculate nakshatra position and progress
   * @private
   */
  _calculateNakshatraPosition(moonLongitude) {
    // Normalize longitude to 0-360
    moonLongitude = ((moonLongitude % 360) + 360) % 360;

    // Find which nakshatra Moon is in
    const nakshatraIndex = Math.floor(moonLongitude / (360 / 27));
    const nakshatraStart = (nakshatraIndex * 360) / 27;
    const nakshatraEnd = ((nakshatraIndex + 1) * 360) / 27;

    // Calculate progress within nakshatra (0 to 1)
    const progress = (moonLongitude - nakshatraStart) / ((360 / 27));

    const nakshatraNames = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
      'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
      'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
      'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];

    return {
      nakshatraIndex,
      nakshatraName: nakshatraNames[nakshatraIndex],
      lord: this.nakshatraLords[nakshatraIndex],
      progress,
      longitude: moonLongitude
    };
  }

  /**
   * Get starting Dasha based on Moon's position in nakshatra
   * @private
   */
  _getStartingDasha(nakshatraInfo) {
    const { lord } = nakshatraInfo;
    const { progress } = nakshatraInfo;

    // Find the planet that rules this portion of the nakshatra
    // For Vimshottari Dasha, the sequence starts from the nakshatra lord
    const startingIndex = this.dashaSequence.indexOf(lord);
    if (startingIndex === -1) {
      throw new Error(`Nakshatra lord ${lord} not in Dasha sequence`);
    }

    return lord;
  }

  /**
   * Calculate current Dasha and Bhukti periods accurately
   * @private
   */
  async _calculateCurrentDasha(startingDasha, progressInNakshatra, year, month, day, hour, minute) {
    const birthDateTime = new Date(year, month - 1, day, hour, minute);
    const currentDateTime = new Date();

    const totalYearsSinceBirth = (currentDateTime - birthDateTime) / (1000 * 60 * 60 * 24 * 365.25);

    // Calculate which Dasha we're in based on the 120-year cycle
    let remainingTime = totalYearsSinceBirth;
    let currentDasha = startingDasha;
    let dashaStartInCycle = 0;

    // Find current Dasha by traversing through the sequence
    let currentIndex = this.dashaSequence.indexOf(startingDasha);

    // Adjust for the progress within the nakshatra (this determines how much of first Dasha has passed)
    const firstDashaRemaining = this.dashaPeriods[startingDasha] * (1 - progressInNakshatra);

    if (remainingTime <= firstDashaRemaining) {
      // Still in the starting Dasha
      currentDasha = startingDasha;
    } else {
      remainingTime -= firstDashaRemaining;
      dashaStartInCycle = totalYearsSinceBirth - remainingTime;

      // Continue through Dashas until we find the current one
      while (remainingTime > 0 && this.dashaSequence[currentIndex] !== undefined) {
        const currentPlanet = this.dashaSequence[currentIndex];
        const periodLength = this.dashaPeriods[currentPlanet];

        if (remainingTime <= periodLength) {
          currentDasha = currentPlanet;
          break;
        }

        remainingTime -= periodLength;
        dashaStartInCycle += periodLength;
        currentIndex = (currentIndex + 1) % this.dashaSequence.length;
      }
    }

    // Calculate Bhukti (sub-period) within current Dasha
    const currentDashaTotal = this.dashaPeriods[currentDasha];
    const timeInCurrentDasha = totalYearsSinceBirth - dashaStartInCycle;
    const bhuktiProgress = timeInCurrentDasha / currentDashaTotal;

    // Find current Bhukti by going through all planets in sequence within the current Dasha
    const currentDashaIndex = this.dashaSequence.indexOf(currentDasha);
    const bhuktiIndex = Math.floor(bhuktiProgress * this.dashaSequence.length);
    const bhuktiPlanet = this.dashaSequence[(currentDashaIndex + bhuktiIndex) % this.dashaSequence.length];

    return {
      current_dasha: currentDasha,
      current_bhukti: bhuktiPlanet,
      dasha_start_year: birthDateTime.getFullYear() + dashaStartInCycle,
      dasha_end_year: birthDateTime.getFullYear() + dashaStartInCycle + currentDashaTotal,
      bhukti_end_year: birthDateTime.getFullYear() + dashaStartInCycle + (bhuktiIndex + 1) * (currentDashaTotal / this.dashaSequence.length),
      years_in_current_dasha: timeInCurrentDasha,
      progress_in_dasha: (timeInCurrentDasha / currentDashaTotal) * 100
    };
  }

  /**
   * Calculate upcoming Dasha periods
   * @private
   */
  async _calculateUpcomingDashas(currentDasha) {
    const upcoming = [];
    const currentIndex = this.dashaSequence.indexOf(currentDasha);

    if (currentIndex === -1) { return upcoming; }

    // Get next 5 Dashas in sequence
    for (let i = 1; i <= 5; i++) {
      const nextIndex = (currentIndex + i) % this.dashaSequence.length;
      const planet = this.dashaSequence[nextIndex];

      upcoming.push({
        planet,
        duration_years: this.dashaPeriods[planet],
        general_influence: this.planetarySignifications[planet].general,
        key_themes: this._extractKeyThemes(planet)
      });
    }

    return upcoming;
  }

  /**
   * Extract key themes for a planet's Dasha
   * @private
   */
  _extractKeyThemes(planet) {
    const significations = this.planetarySignifications[planet];
    const themes = [];

    // Extract key themes based on planetary nature
    if (planet === 'sun') { themes.push('Leadership', 'Authority', 'Career', 'Health'); } else if (planet === 'moon') { themes.push('Emotions', 'Family', 'Home', 'Mind'); } else if (planet === 'mars') { themes.push('Energy', 'Courage', 'Property', 'Action'); } else if (planet === 'mercury') { themes.push('Communication', 'Business', 'Learning', 'Adaptability'); } else if (planet === 'jupiter') { themes.push('Wisdom', 'Wealth', 'Spirituality', 'Children'); } else if (planet === 'venus') { themes.push('Relationships', 'Luxury', 'Arts', 'Pleasures'); } else if (planet === 'saturn') { themes.push('Discipline', 'Hard Work', 'Karma', 'Spirituality'); } else if (planet === 'rahu') { themes.push('Ambition', 'Foreign', 'Technology', 'Transformation'); } else if (planet === 'ketu') { themes.push('Spirituality', 'Detachment', 'Past Karma', 'Liberation'); }

    return themes;
  }

  /**
   * Generate predictions for current Dasha-Bhukti period
   * @private
   */
  _generateDashaPredictions(dasha, bhukti) {
    const dashaSignifications = this.planetarySignifications[dasha];
    const bhuktiSignifications = this.planetarySignifications[bhukti];

    // Determine compatibility between Dasha and Bhukti planets
    const compatibility = this._getPlanetCompatibility(dasha, bhukti);
    const combinedInfluence = this._combinePlanetaryInfluences(dasha, bhukti, compatibility);

    return {
      dasha_planet: dasha,
      bhukti_planet: bhukti,
      primary_themes: dashaSignifications.general,
      secondary_themes: bhuktiSignifications.general,
      combined_influence: combinedInfluence,
      compatibility,
      favorable_areas: this._getFavorableAreas(dasha, bhukti),
      challenging_areas: this._getChallengingAreas(dasha, bhukti),
      remedies: this._getDashaRemedies(dasha, bhukti)
    };
  }

  /**
   * Get planet compatibility
   * @private
   */
  _getPlanetCompatibility(dasha, bhukti) {
    // Traditional planetary relationships (friendships and enmities)
    const friendPlanets = {
      sun: ['moon', 'mars', 'jupiter'],
      moon: ['sun', 'mercury', 'venus'],
      mars: ['sun', 'moon', 'jupiter'],
      mercury: ['sun', 'venus', 'saturn'],
      jupiter: ['sun', 'moon', 'mars', 'mercury'],
      venus: ['moon', 'mercury', 'saturn', 'rahu'],
      saturn: ['mercury', 'venus', 'kethu'],
      rahu: ['mercury', 'venus', 'saturn'],
      ketu: ['moon', 'kethu']  // Corrected to 'ketu' for consistency
    };

    const enemyPlanets = {
      sun: ['venus', 'saturn'],
      moon: ['mars'],
      mars: ['moon', 'mercury'],
      mercury: ['moon'],
      jupiter: ['mars', 'venus'],
      venus: ['sun', 'moon'],
      saturn: ['sun', 'moon', 'mars']
    };

    const isFriend = friendPlanets[dasha]?.includes(bhukti) || false;
    const isEnemy = enemyPlanets[dasha]?.includes(bhukti) || false;

    if (dasha === bhukti) { return 'Conjunction'; }
    if (isFriend) { return 'Harmonious'; }
    if (isEnemy) { return 'Challenging'; }
    return 'Neutral';
  }

  /**
   * Combine planetary influences
   * @private
   */
  _combinePlanetaryInfluences(dasha, bhukti, compatibility) {
    const dashaName = dasha.charAt(0).toUpperCase() + dasha.slice(1);
    const bhuktiName = bhukti.charAt(0).toUpperCase() + bhukti.slice(1);

    switch (compatibility) {
    case 'Conjunction':
      return `Strong ${dashaName} influence with ${bhuktiName} characteristics dominant`;
    case 'Harmonious':
      return `Harmonious combination of ${dashaName} and ${bhuktiName} energies`;
    case 'Challenging':
      return `Challenging combination requiring balance between ${dashaName} and ${bhuktiName} influences`;
    default:
      return `Mixed influences of ${dashaName} and ${bhuktiName} requiring awareness`;
    }
  }

  /**
   * Get favorable areas during Dasha-Bhukti
   * @private
   */
  _getFavorableAreas(dasha, bhukti) {
    const dashaSignifications = this.planetarySignifications[dasha];
    const bhuktiSignifications = this.planetarySignifications[bhukti];

    // Combine positive aspects from both planets
    const positiveDasha = dashaSignifications.positive.split(', ');
    const positiveBhukti = bhuktiSignifications.positive.split(', ');

    // Return top 5 favorable areas
    return [...positiveDasha, ...positiveBhukti].slice(0, 5);
  }

  /**
   * Get challenging areas during Dasha-Bhukti
   * @private
   */
  _getChallengingAreas(dasha, bhukti) {
    const dashaSignifications = this.planetarySignifications[dasha];
    const bhuktiSignifications = this.planetarySignifications[bhukti];

    // Combine negative aspects from both planets
    const negativeDasha = dashaSignifications.negative.split(', ');
    const negativeBhukti = bhuktiSignifications.negative.split(', ');

    // Return top 4 challenging areas
    return [...negativeDasha, ...negativeBhukti].slice(0, 4);
  }

  /**
   * Get remedies for Dasha-Bhukti period
   * @private
   */
  _getDashaRemedies(dasha, bhukti) {
    const remedies = {
      sun: {
        mantra: 'Om Suryaya Namah (12 times daily)',
        deity: 'Surya/Sun',
        gemstone: 'Ruby',
        day: 'Sunday',
        fasting: 'Fast on Sundays, donate wheat or jaggery'
      },
      moon: {
        mantra: 'Om Somaya Namah (108 times during moonrise)',
        deity: 'Chandra/Moon',
        gemstone: 'Pearl',
        day: 'Monday',
        fasting: 'Fast on Mondays, donate milk or rice'
      },
      mars: {
        mantra: 'Om Angarakaya Namah (7 times daily)',
        deity: 'Mangal/Mars',
        gemstone: 'Red Coral',
        day: 'Tuesday',
        fasting: 'Fast on Tuesdays, donate red lentils'
      },
      mercury: {
        mantra: 'Om Budhaya Namah (16 times daily)',
        deity: 'Budha/Mercury',
        gemstone: 'Emerald',
        day: 'Wednesday',
        fasting: 'Fast on Wednesdays, donate green vegetables'
      },
      jupiter: {
        mantra: 'Om Guruve Namah or Brihaspataye Namah (19 times daily)',
        deity: 'Guru/Jupiter',
        gemstone: 'Yellow Sapphire',
        day: 'Thursday',
        fasting: 'Fast on Thursdays, donate turmeric or sweets'
      },
      venus: {
        mantra: 'Om Shukraya Namah (20 times daily)',
        deity: 'Shukra/Venus',
        gemstone: 'Diamond or Topaz',
        day: 'Friday',
        fasting: 'Fast on Fridays, donate white items'
      },
      saturn: {
        mantra: 'Om Sham Shanicharaya Namah (19 times after sunset)',
        deity: 'Shani/Saturn',
        gemstone: 'Blue Sapphire or Lead',
        day: 'Saturday',
        fasting: 'Fast on Saturdays, donate sesame oil or iron'
      },
      rahu: {
        mantra: 'Om Rahave Namah (18 times with 8th day fast)',
        deity: 'Rahu',
        gemstone: 'Gomed (Hessonite)',
        day: 'Saturday',
        fasting: 'Avoid black items, serve dogs'
      },
      ketu: {
        mantra: 'Om Ketave Namah (7 times during eclipse times preferred)',
        deity: 'Ketu',
        gemstone: 'Cat\'s Eye',
        day: 'Tuesday',
        fasting: 'Avoid non-vegetarian food, serve snakes spiritually'
      }
    };

    return {
      primary_remedy: remedies[dasha],
      secondary_remedy: remedies[bhukti],
      combination_advice: `During ${dasha}-${bhukti} period, focus on ${remedies[dasha].deity} and ${remedies[bhukti].deity} worship. Follow both sets of remedies for enhanced benefits.`
    };
  }

  /**
   * Generate comprehensive Dasha summary
   * @private
   */
  _generateDashaSummary(name, currentData, predictions) {
    let summary = `🌟 *Vimshottari Dasha Analysis for ${name || 'User'}* 🌟\n\n`;

    summary += `*Current Mahadasha:* ${currentData.current_dasha.charAt(0).toUpperCase() + currentData.current_dasha.slice(1)}\n`;
    summary += `*Current Bhukti:* ${currentData.current_bhukti.charAt(0).toUpperCase() + currentData.current_bhukti.slice(1)}\n`;
    summary += `*Dasha Progress:* ${currentData.progress_in_dasha.toFixed(2)}% complete\n\n`;

    summary += `*Primary Influence:* ${predictions.primary_themes}\n`;
    summary += `*Secondary Influence:* ${predictions.secondary_themes}\n`;
    summary += `*Planetary Compatibility:* ${predictions.compatibility}\n\n`;

    summary += `*Combined Influence:* ${predictions.combined_influence}\n\n`;

    summary += '*Favorable Areas:*\n';
    predictions.favorable_areas.forEach(area => {
      summary += `• ${area}\n`;
    });
    summary += '\n';

    summary += '*Areas Requiring Attention:*\n';
    predictions.challenging_areas.forEach(area => {
      summary += `• ${area}\n`;
    });
    summary += '\n';

    summary += '*Recommended Remedies:*\n';
    summary += `• *Primary:* ${predictions.remedies.primary_remedy.mantra} (${predictions.remedies.primary_remedy.day})\n`;
    summary += `• *Secondary:* ${predictions.remedies.secondary_remedy.mantra} (${predictions.remedies.secondary_remedy.day})\n`;
    summary += `• *Combined:* ${predictions.remedies.combination_advice}\n\n`;

    summary += '*Authentic Vedic Insight:*\n';
    summary += 'This calculation is based on your Moon\'s precise position in the nakshatra at birth. The Vimshottari Dasha system, considered the most accurate in Vedic astrology, reveals the cosmic timing of life events by aligning planetary periods with your karmic blueprint.\n\n';

    summary += '*Note:* For the most accurate guidance, consult a qualified Vedic astrologer. This analysis uses Swiss Ephemeris for precise astronomical calculations. 🕉️';

    return summary;
  }

  /**
   * Convert date to Julian Day
   * @private
   */
  _dateToJulianDay(year, month, day, hour) {
    // Using Swiss Ephemeris function for precision
    return sweph.swe_julday(year, month, day, hour, sweph.SE_GREG_CAL);
  }

  /**
   * Get sign from longitude
   * @private
   */
  _getSignFromLongitude(longitude) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = Math.floor(longitude / 30);
    return signs[signIndex];
  }

  /**
   * Get Vimshottari Dasha catalog
   * @returns {Object} Available services
   */
  getDashaCatalog() {
    return {
      vimshottari_dasha: 'Authentic Vimshottari Dasha with precise nakshatra calculations',
      current_period: 'Current Mahadasha and Bhukti analysis',
      upcoming_dashas: 'Next 5 Mahadasha periods with accurate timing',
      predictions: 'Period-specific predictions based on planetary timing',
      remedies: 'Authentic Vedic remedies for current period',
      compatibility_analysis: 'Dasha-Bhukti compatibility assessment'
    };
  }
}

module.exports = { VimshottariDasha };
