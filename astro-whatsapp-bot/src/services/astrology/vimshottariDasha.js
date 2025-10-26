/**
 * Vimshottari Dasha System - Primary Predictive Technique in Vedic Astrology
 * Calculates planetary periods and sub-periods for life predictions
 */

const logger = require('../../utils/logger');

class VimshottariDasha {
  constructor() {
    logger.info('Module: VimshottariDasha loaded.');
    this.initializeDashaSystem();
  }

  /**
   * Initialize the complete Vimshottari Dasha system
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
    this.dashaSequence = ['sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury', 'ketu', 'venus'];

    // Sub-period (Bhukti) calculations - each planet's period is divided among all planets
    this.bhuktiDivisions = {
      sun: { sun: 0.5, moon: 0.67, mars: 0.5, mercury: 0.75, jupiter: 1.0, venus: 0.75, saturn: 0.75, rahu: 1.0, ketu: 0.5 },
      moon: { sun: 1.0, moon: 1.33, mars: 1.0, mercury: 1.5, jupiter: 2.0, venus: 1.5, saturn: 1.5, rahu: 2.0, ketu: 1.0 },
      mars: { sun: 0.67, moon: 0.89, mars: 0.67, mercury: 1.0, jupiter: 1.33, venus: 1.0, saturn: 1.0, rahu: 1.33, ketu: 0.67 },
      rahu: { sun: 1.5, moon: 2.0, mars: 1.5, mercury: 2.25, jupiter: 3.0, venus: 2.25, saturn: 2.25, rahu: 3.0, ketu: 1.5 },
      jupiter: { sun: 1.33, moon: 1.78, mars: 1.33, mercury: 2.0, jupiter: 2.67, venus: 2.0, saturn: 2.0, rahu: 2.67, ketu: 1.33 },
      saturn: { sun: 1.58, moon: 2.11, mars: 1.58, mercury: 2.37, jupiter: 3.16, venus: 2.37, saturn: 2.37, rahu: 3.16, ketu: 1.58 },
      mercury: { sun: 1.41, moon: 1.88, mars: 1.41, mercury: 2.12, jupiter: 2.82, venus: 2.12, saturn: 2.12, rahu: 2.82, ketu: 1.41 },
      ketu: { sun: 0.67, moon: 0.89, mars: 0.67, mercury: 1.0, jupiter: 1.33, venus: 1.0, saturn: 1.0, rahu: 1.33, ketu: 0.67 },
      venus: { sun: 1.67, moon: 2.22, mars: 1.67, mercury: 2.5, jupiter: 3.33, venus: 2.5, saturn: 2.5, rahu: 3.33, ketu: 1.67 }
    };

    // Antardasha (sub-sub-periods) within each Bhukti
    // This follows the same pattern but with shorter durations

    // Dasha starting points based on Moon's position
    this.dashaStartingPoints = {
      aries: 'mars',
      taurus: 'venus',
      gemini: 'mercury',
      cancer: 'moon',
      leo: 'sun',
      virgo: 'mercury',
      libra: 'venus',
      scorpio: 'mars',
      sagittarius: 'jupiter',
      capricorn: 'saturn',
      aquarius: 'saturn',
      pisces: 'jupiter'
    };

    // Planetary significations for predictions
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
        positive: 'Courage, energy, leadership, protection',
        negative: 'Aggression, accidents, conflicts, injuries'
      },
      mercury: {
        general: 'Communication, intelligence, education, business, trade',
        career: 'Teaching, writing, business, accounting, journalism, IT',
        health: 'Nervous system, skin, speech, lungs, intestines',
        relationships: 'Friends, maternal uncles, neighbors, students',
        positive: 'Intelligence, communication skills, adaptability, wit',
        negative: 'Anxiety, speech issues, learning difficulties, deception'
      },
      jupiter: {
        general: 'Wisdom, spirituality, wealth, children, religion, law',
        career: 'Teaching, law, religion, banking, consulting, politics',
        health: 'Liver, pancreas, hips, thighs, obesity, diabetes',
        relationships: 'Children, teachers, spiritual guides, elders',
        positive: 'Wisdom, prosperity, spirituality, generosity, optimism',
        negative: 'Over-confidence, weight gain, extravagance, legal issues'
      },
      venus: {
        general: 'Love, beauty, luxury, marriage, arts, pleasures',
        career: 'Arts, entertainment, fashion, luxury goods, hospitality',
        health: 'Kidneys, reproductive system, skin, eyes, diabetes',
        relationships: 'Spouse, lovers, artistic friends, women',
        positive: 'Charm, artistic talent, harmony, luxury, sensuality',
        negative: 'Indulgence, relationship issues, vanity, health problems'
      },
      saturn: {
        general: 'Discipline, hard work, longevity, justice, delays, spirituality',
        career: 'Agriculture, labor, government, research, social work',
        health: 'Joints, bones, teeth, skin, chronic diseases, depression',
        relationships: 'Elderly people, servants, patients, spiritual teachers',
        positive: 'Discipline, perseverance, wisdom, justice, detachment',
        negative: 'Delays, obstacles, depression, isolation, chronic illness'
      },
      rahu: {
        general: 'Ambition, foreign lands, unconventional paths, technology, illusion',
        career: 'Politics, business, technology, foreign trade, research',
        health: 'Skin diseases, mental disorders, poison, chronic illness',
        relationships: 'Foreign connections, step-parents, unconventional relationships',
        positive: 'Ambition, innovation, foreign success, spiritual insight',
        negative: 'Confusion, addiction, scandals, health issues, instability'
      },
      ketu: {
        general: 'Spirituality, detachment, past life karma, liberation, intuition',
        career: 'Spirituality, research, healing, social work, isolation',
        health: 'Wounds, infections, mental illness, spiritual crises',
        relationships: 'Spiritual connections, past life relationships',
        positive: 'Spiritual wisdom, detachment, healing abilities, intuition',
        negative: 'Isolation, mental confusion, spiritual crises, accidents'
      }
    };

    // Transit influences during Dasha periods
    this.transitInfluences = {
      sun: 'Career advancement, health improvements, father-related matters',
      moon: 'Emotional changes, family matters, property dealings',
      mars: 'Energy boost, conflicts, property acquisition, surgery',
      mercury: 'Communication, learning, business activities, travel',
      jupiter: 'Wisdom, prosperity, spiritual growth, children matters',
      venus: 'Relationships, luxury, artistic pursuits, marriage',
      saturn: 'Discipline, hard work, delays, spiritual development',
      rahu: 'Ambition, foreign opportunities, unconventional success',
      ketu: 'Spiritual insights, detachment, completion of karmic cycles'
    };
  }

  /**
   * Calculate complete Vimshottari Dasha for a birth chart
   * @param {Object} birthData - Birth date, time, place
   * @returns {Object} Complete Dasha analysis
   */
  calculateVimshottariDasha(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      // Determine starting Dasha based on Moon's position
      const moonSign = this.calculateMoonSign(birthDate, birthTime);
      const startingDasha = this.dashaStartingPoints[moonSign.toLowerCase()];

      // Calculate current Dasha and Bhukti
      const currentDashaData = this.calculateCurrentDasha(birthDate, birthTime, startingDasha);

      // Calculate upcoming Dashas
      const upcomingDashas = this.calculateUpcomingDashas(startingDasha, currentDashaData.currentDasha);

      // Generate predictions for current period
      const currentPredictions = this.generateDashaPredictions(currentDashaData.currentDasha, currentDashaData.currentBhukti);

      return {
        name,
        moon_sign: moonSign,
        starting_dasha: startingDasha,
        current_period: currentDashaData,
        upcoming_dashas: upcomingDashas,
        predictions: currentPredictions,
        summary: this.generateDashaSummary(name, currentDashaData, currentPredictions)
      };
    } catch (error) {
      logger.error('Error calculating Vimshottari Dasha:', error);
      return {
        error: 'Unable to calculate Vimshottari Dasha at this time'
      };
    }
  }

  /**
   * Calculate Moon's sign at birth (simplified)
   * @param {string} date - Birth date
   * @param {string} time - Birth time
   * @returns {string} Moon sign
   */
  calculateMoonSign(date, time) {
    // Simplified calculation - in production would use astronomical calculations
    const birthDate = new Date(`${date} ${time}`);
    const dayOfYear = Math.floor((birthDate - new Date(birthDate.getFullYear(), 0, 0)) / 86400000);

    // Approximate Moon sign based on day of year (Moon moves ~12-13 degrees per day)
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = Math.floor((dayOfYear * 13) / 30) % 12; // Approximate calculation

    return signs[signIndex];
  }

  /**
   * Calculate current Dasha and Bhukti periods
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time
   * @param {string} startingDasha - Starting Dasha planet
   * @returns {Object} Current Dasha data
   */
  calculateCurrentDasha(birthDate, birthTime, startingDasha) {
    const birthDateTime = new Date(`${birthDate} ${birthTime}`);
    const currentDate = new Date();
    const daysSinceBirth = Math.floor((currentDate - birthDateTime) / (1000 * 60 * 60 * 24));

    // Convert days to years for Dasha calculation
    const yearsSinceBirth = daysSinceBirth / 365.25;

    // Calculate current position in the 120-year Vimshottari cycle
    let remainingYears = yearsSinceBirth;
    let currentDasha = startingDasha;
    let dashaStartYear = 0;

    // Find current Dasha
    for (const planet of this.dashaSequence) {
      if (remainingYears <= this.dashaPeriods[planet]) {
        currentDasha = planet;
        break;
      }
      remainingYears -= this.dashaPeriods[planet];
      dashaStartYear += this.dashaPeriods[planet];
    }

    // Calculate Bhukti within current Dasha
    const dashaDuration = this.dashaPeriods[currentDasha];
    const bhuktiProgress = remainingYears / dashaDuration;
    const bhuktiIndex = Math.floor(bhuktiProgress * 9);
    const bhuktiSequence = [...this.dashaSequence.slice(this.dashaSequence.indexOf(currentDasha)), ...this.dashaSequence.slice(0, this.dashaSequence.indexOf(currentDasha))];
    const currentBhukti = bhuktiSequence[bhuktiIndex];

    // Calculate remaining time
    const dashaEndYear = dashaStartYear + dashaDuration;
    const bhuktiEndProgress = (bhuktiIndex + 1) / 9;
    const bhuktiEndYear = dashaStartYear + (bhuktiEndProgress * dashaDuration);

    return {
      current_dasha: currentDasha,
      current_bhukti: currentBhukti,
      dasha_start_year: Math.max(0, yearsSinceBirth - remainingYears),
      dasha_end_year: dashaEndYear - yearsSinceBirth + yearsSinceBirth,
      bhukti_end_year: bhuktiEndYear - yearsSinceBirth + yearsSinceBirth,
      years_in_current_dasha: remainingYears,
      progress_in_dasha: (remainingYears / dashaDuration) * 100
    };
  }

  /**
   * Calculate upcoming Dasha periods
   * @param {string} startingDasha - Starting Dasha planet
   * @param {string} currentDasha - Current Dasha planet
   * @returns {Array} Upcoming Dasha periods
   */
  calculateUpcomingDashas(startingDasha, currentDasha) {
    const upcoming = [];
    const currentIndex = this.dashaSequence.indexOf(currentDasha);
    const startIndex = this.dashaSequence.indexOf(startingDasha);

    // Get next 5 Dashas
    for (let i = 1; i <= 5; i++) {
      const dashaIndex = (currentIndex + i) % 9;
      const planet = this.dashaSequence[dashaIndex];

      upcoming.push({
        planet,
        duration_years: this.dashaPeriods[planet],
        general_influence: this.planetarySignifications[planet].general,
        key_themes: this.extractKeyThemes(planet)
      });
    }

    return upcoming;
  }

  /**
   * Extract key themes for a planet's Dasha
   * @param {string} planet - Planet name
   * @returns {Array} Key themes
   */
  extractKeyThemes(planet) {
    const significations = this.planetarySignifications[planet];
    const themes = [];

    // Extract 3-4 key themes based on planetary nature
    if (planet === 'sun') { themes.push('Leadership', 'Health', 'Authority', 'Career'); } else if (planet === 'moon') { themes.push('Emotions', 'Family', 'Home', 'Intuition'); } else if (planet === 'mars') { themes.push('Energy', 'Conflicts', 'Property', 'Courage'); } else if (planet === 'mercury') { themes.push('Communication', 'Business', 'Learning', 'Travel'); } else if (planet === 'jupiter') { themes.push('Wisdom', 'Wealth', 'Spirituality', 'Children'); } else if (planet === 'venus') { themes.push('Relationships', 'Luxury', 'Arts', 'Marriage'); } else if (planet === 'saturn') { themes.push('Discipline', 'Hard Work', 'Delays', 'Spirituality'); } else if (planet === 'rahu') { themes.push('Ambition', 'Foreign', 'Innovation', 'Transformation'); } else if (planet === 'ketu') { themes.push('Spirituality', 'Detachment', 'Healing', 'Liberation'); }

    return themes;
  }

  /**
   * Generate predictions for current Dasha-Bhukti period
   * @param {string} dasha - Current Dasha planet
   * @param {string} bhukti - Current Bhukti planet
   * @returns {Object} Predictions
   */
  generateDashaPredictions(dasha, bhukti) {
    const dashaSignifications = this.planetarySignifications[dasha];
    const bhuktiSignifications = this.planetarySignifications[bhukti];

    // Combine Dasha and Bhukti influences
    const combinedInfluence = this.combinePlanetaryInfluences(dasha, bhukti);

    return {
      dasha_planet: dasha,
      bhukti_planet: bhukti,
      primary_themes: dashaSignifications.general,
      secondary_themes: bhuktiSignifications.general,
      combined_influence: combinedInfluence,
      favorable_areas: this.getFavorableAreas(dasha, bhukti),
      challenging_areas: this.getChallengingAreas(dasha, bhukti),
      remedies: this.getDashaRemedies(dasha, bhukti)
    };
  }

  /**
   * Combine influences of Dasha and Bhukti planets
   * @param {string} dasha - Dasha planet
   * @param {string} bhukti - Bhukti planet
   * @returns {string} Combined influence description
   */
  combinePlanetaryInfluences(dasha, bhukti) {
    // Define planetary relationships
    const friendlyPlanets = {
      sun: ['moon', 'mars', 'jupiter'],
      moon: ['sun', 'mercury', 'venus', 'saturn'],
      mars: ['sun', 'moon', 'jupiter'],
      mercury: ['sun', 'venus', 'rahu'],
      jupiter: ['sun', 'moon', 'mars', 'mercury', 'venus', 'saturn'],
      venus: ['mercury', 'saturn', 'rahu'],
      saturn: ['mercury', 'venus', 'rahu', 'ketu'],
      rahu: ['mercury', 'venus', 'saturn'],
      ketu: ['mars', 'saturn', 'rahu']
    };

    const isFriendly = friendlyPlanets[dasha].includes(bhukti);

    if (dasha === bhukti) {
      return `Strong ${dasha} influence - intensified planetary effects`;
    } else if (isFriendly) {
      return `Harmonious combination - ${dasha} and ${bhukti} work together positively`;
    } else {
      return `Mixed influences - ${dasha} and ${bhukti} may create some challenges`;
    }
  }

  /**
   * Get favorable areas during Dasha-Bhukti
   * @param {string} dasha - Dasha planet
   * @param {string} bhukti - Bhukti planet
   * @returns {Array} Favorable areas
   */
  getFavorableAreas(dasha, bhukti) {
    const favorable = [];

    // Dasha planet favorable areas
    const dashaFav = this.planetarySignifications[dasha];
    favorable.push(...dashaFav.positive.split(', '));

    // Bhukti planet favorable areas
    const bhuktiFav = this.planetarySignifications[bhukti];
    favorable.push(...bhuktiFav.positive.split(', '));

    // Remove duplicates and limit to 5
    return [...new Set(favorable)].slice(0, 5);
  }

  /**
   * Get challenging areas during Dasha-Bhukti
   * @param {string} dasha - Dasha planet
   * @param {string} bhukti - Bhukti planet
   * @returns {Array} Challenging areas
   */
  getChallengingAreas(dasha, bhukti) {
    const challenging = [];

    // Dasha planet challenges
    const dashaNeg = this.planetarySignifications[dasha];
    challenging.push(...dashaNeg.negative.split(', '));

    // Bhukti planet challenges
    const bhuktiNeg = this.planetarySignifications[bhukti];
    challenging.push(...bhuktiNeg.negative.split(', '));

    // Remove duplicates and limit to 4
    return [...new Set(challenging)].slice(0, 4);
  }

  /**
   * Get remedies for Dasha-Bhukti period
   * @param {string} dasha - Dasha planet
   * @param {string} bhukti - Bhukti planet
   * @returns {Object} Remedies
   */
  getDashaRemedies(dasha, bhukti) {
    // Basic remedies for each planet
    const remedies = {
      sun: {
        mantra: 'Om Suryaya Namaha',
        charity: 'Donate wheat or red flowers on Sundays',
        gemstone: 'Ruby (consult astrologer)',
        fasting: 'Fast on Sundays'
      },
      moon: {
        mantra: 'Om Chandraya Namaha',
        charity: 'Donate rice or white flowers on Mondays',
        gemstone: 'Pearl (consult astrologer)',
        fasting: 'Fast on Mondays'
      },
      mars: {
        mantra: 'Om Angarakaya Namaha',
        charity: 'Donate red lentils on Tuesdays',
        gemstone: 'Coral (consult astrologer)',
        fasting: 'Fast on Tuesdays'
      },
      mercury: {
        mantra: 'Om Budhaya Namaha',
        charity: 'Donate green vegetables on Wednesdays',
        gemstone: 'Emerald (consult astrologer)',
        fasting: 'Fast on Wednesdays'
      },
      jupiter: {
        mantra: 'Om Gurave Namaha',
        charity: 'Donate turmeric or books on Thursdays',
        gemstone: 'Yellow Sapphire (consult astrologer)',
        fasting: 'Fast on Thursdays'
      },
      venus: {
        mantra: 'Om Shukraya Namaha',
        charity: 'Donate white items on Fridays',
        gemstone: 'Diamond (consult astrologer)',
        fasting: 'Fast on Fridays'
      },
      saturn: {
        mantra: 'Om Shanaye Namaha',
        charity: 'Donate sesame seeds on Saturdays',
        gemstone: 'Blue Sapphire (consult astrologer)',
        fasting: 'Fast on Saturdays'
      },
      rahu: {
        mantra: 'Om Rahave Namaha',
        charity: 'Donate black items on Saturdays',
        gemstone: 'Hessonite (consult astrologer)',
        fasting: 'Fast on Saturdays'
      },
      ketu: {
        mantra: 'Om Ketave Namaha',
        charity: 'Donate brown items on Tuesdays',
        gemstone: 'Cat\'s Eye (consult astrologer)',
        fasting: 'Fast on Tuesdays'
      }
    };

    return {
      dasha_remedies: remedies[dasha],
      bhukti_remedies: remedies[bhukti],
      general_advice: 'Consult a qualified astrologer for personalized remedies. Regular prayer and charity bring positive results.'
    };
  }

  /**
   * Generate comprehensive Dasha summary
   * @param {string} name - Person's name
   * @param {Object} currentData - Current Dasha data
   * @param {Object} predictions - Predictions
   * @returns {string} Summary text
   */
  generateDashaSummary(name, currentData, predictions) {
    let summary = `🕉️ *Vimshottari Dasha Analysis for ${name}*\n\n`;

    summary += `*Current Dasha:* ${currentData.current_dasha.toUpperCase()}\n`;
    summary += `*Current Bhukti:* ${currentData.current_bhukti.toUpperCase()}\n`;
    summary += `*Dasha Progress:* ${currentData.progress_in_dasha.toFixed(1)}% complete\n`;
    summary += `*Years Remaining in Dasha:* ${(currentData.dasha_end_year - currentData.dasha_start_year - currentData.years_in_current_dasha).toFixed(1)} years\n\n`;

    summary += `*Primary Themes (${currentData.current_dasha}):*\n`;
    summary += `${this.planetarySignifications[currentData.current_dasha].general}\n\n`;

    summary += `*Secondary Themes (${currentData.current_bhukti}):*\n`;
    summary += `${this.planetarySignifications[currentData.current_bhukti].general}\n\n`;

    summary += '*Combined Influence:*\n';
    summary += `${predictions.combined_influence}\n\n`;

    summary += '*Favorable Areas:*\n';
    predictions.favorable_areas.forEach(area => {
      summary += `• ${area}\n`;
    });
    summary += '\n';

    summary += '*Areas Needing Attention:*\n';
    predictions.challenging_areas.forEach(area => {
      summary += `• ${area}\n`;
    });
    summary += '\n';

    summary += '*Recommended Remedies:*\n';
    summary += `• *Mantra:* ${predictions.remedies.dasha_remedies.mantra}\n`;
    summary += `• *Charity:* ${predictions.remedies.dasha_remedies.charity}\n`;
    summary += `• *Fasting:* ${predictions.remedies.dasha_remedies.fasting}\n\n`;

    summary += '*Note:* Vimshottari Dasha shows planetary periods that influence life events. This is a general analysis - consult a qualified Vedic astrologer for detailed predictions. 🕉️';

    return summary;
  }

  /**
   * Get Vimshottari Dasha catalog
   * @returns {Object} Available services
   */
  getDashaCatalog() {
    return {
      vimshottari_dasha: 'Complete Vimshottari Dasha analysis',
      current_period: 'Current Dasha and Bhukti analysis',
      upcoming_dashas: 'Next 5 Dasha periods preview',
      predictions: 'Period-specific predictions and guidance',
      remedies: 'Dasha-specific remedies and mantras'
    };
  }
}

module.exports = { VimshottariDasha };
