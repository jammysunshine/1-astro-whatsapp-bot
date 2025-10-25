const logger = require('../../utils/logger');

/**
 * Nadi Astrology Reader
 * Traditional South Indian palm leaf astrology system
 * Based on ancient Nadi manuscripts and birth star calculations
 */

class NadiReader {
  constructor() {
    logger.info('Module: NadiReader loaded.');
    // Nakshatras (27 lunar mansions)
    this.nakshatras = [
      { name: 'Ashwini', rulingPlanet: 'Ketu', deity: 'Ashwini Kumaras', nature: 'Light' },
      { name: 'Bharani', rulingPlanet: 'Venus', deity: 'Yama', nature: 'Fierce' },
      { name: 'Krittika', rulingPlanet: 'Sun', deity: 'Agni', nature: 'Mixed' },
      { name: 'Rohini', rulingPlanet: 'Moon', deity: 'Brahma', nature: 'Fixed' },
      { name: 'Mrigashira', rulingPlanet: 'Mars', deity: 'Soma', nature: 'Soft' },
      { name: 'Ardra', rulingPlanet: 'Rahu', deity: 'Rudra', nature: 'Fierce' },
      { name: 'Punarvasu', rulingPlanet: 'Jupiter', deity: 'Aditi', nature: 'Moveable' },
      { name: 'Pushya', rulingPlanet: 'Saturn', deity: 'Brihaspati', nature: 'Light' },
      { name: 'Ashlesha', rulingPlanet: 'Mercury', deity: 'Nagadevata', nature: 'Fierce' },
      { name: 'Magha', rulingPlanet: 'Ketu', deity: 'Pitris', nature: 'Fierce' },
      { name: 'Purva Phalguni', rulingPlanet: 'Venus', deity: 'Bhaga', nature: 'Moveable' },
      { name: 'Uttara Phalguni', rulingPlanet: 'Sun', deity: 'Aryaman', nature: 'Fixed' },
      { name: 'Hasta', rulingPlanet: 'Moon', deity: 'Savitar', nature: 'Light' },
      { name: 'Chitra', rulingPlanet: 'Mars', deity: 'Vishwakarma', nature: 'Soft' },
      { name: 'Swati', rulingPlanet: 'Rahu', deity: 'Vayu', nature: 'Moveable' },
      { name: 'Vishakha', rulingPlanet: 'Jupiter', deity: 'Indra', nature: 'Mixed' },
      { name: 'Anuradha', rulingPlanet: 'Saturn', deity: 'Mitra', nature: 'Fierce' },
      { name: 'Jyeshtha', rulingPlanet: 'Mercury', deity: 'Indra', nature: 'Fierce' },
      { name: 'Mula', rulingPlanet: 'Ketu', deity: 'Nirriti', nature: 'Fierce' },
      { name: 'Purva Ashadha', rulingPlanet: 'Venus', deity: 'Apas', nature: 'Moveable' },
      { name: 'Uttara Ashadha', rulingPlanet: 'Sun', deity: 'Vishwadevas', nature: 'Fixed' },
      { name: 'Shravana', rulingPlanet: 'Moon', deity: 'Vishwakarma', nature: 'Moveable' },
      { name: 'Dhanishta', rulingPlanet: 'Mars', deity: 'Vasus', nature: 'Light' },
      { name: 'Shatabhisha', rulingPlanet: 'Rahu', deity: 'Varuna', nature: 'Fixed' },
      { name: 'Purva Bhadrapada', rulingPlanet: 'Jupiter', deity: 'Aja Ekapada', nature: 'Fierce' },
      { name: 'Uttara Bhadrapada', rulingPlanet: 'Saturn', deity: 'Ahir Budhnya', nature: 'Moveable' },
      { name: 'Revati', rulingPlanet: 'Mercury', deity: 'Pushan', nature: 'Soft' }
    ];

    // Nadi systems (based on birth star and other factors)
    this.nadiSystems = {
      adi: {
        name: 'Adi Nadi',
        characteristics: 'Leadership, independence, pioneering spirit',
        strengths: ['Leadership', 'Innovation', 'Independence'],
        challenges: ['Impatience', 'Stubbornness'],
        lifePurpose: 'To lead and innovate in chosen field'
      },
      Madhya: {
        name: 'Madhya Nadi',
        characteristics: 'Balance, harmony, diplomatic nature',
        strengths: ['Diplomacy', 'Balance', 'Harmony'],
        challenges: ['Indecisiveness', 'Over-accommodation'],
        lifePurpose: 'To bring harmony and balance to situations'
      },
      Antya: {
        name: 'Antya Nadi',
        characteristics: 'Service, compassion, spiritual inclination',
        strengths: ['Compassion', 'Service', 'Spirituality'],
        challenges: ['Self-sacrifice', 'Boundary issues'],
        lifePurpose: 'To serve others and contribute to greater good'
      }
    };

    // Dasha periods (planetary periods)
    this.dashaPeriods = {
      sun: { duration: 6, characteristics: 'Leadership, authority, father figures, government' },
      moon: { duration: 10, characteristics: 'Emotions, mother, home, mental peace' },
      mars: { duration: 7, characteristics: 'Energy, courage, siblings, property' },
      mercury: { duration: 17, characteristics: 'Intelligence, communication, business, education' },
      jupiter: { duration: 16, characteristics: 'Wisdom, spirituality, children, prosperity' },
      venus: { duration: 20, characteristics: 'Love, marriage, luxury, arts, beauty' },
      saturn: { duration: 19, characteristics: 'Discipline, hard work, longevity, spirituality' },
      rahu: { duration: 18, characteristics: 'Ambition, foreign lands, unconventional path' },
      ketu: { duration: 7, characteristics: 'Spirituality, detachment, past life karma' }
    };
  }

  /**
   * Calculate Nadi astrology reading
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @param {string} birthTime - Birth time in HH:MM format
   * @param {string} birthPlace - Birth place
   * @returns {Object} Nadi astrology analysis
   */
  calculateNadiReading(birthDate, birthTime, birthPlace) {
    try {
      const birthNakshatra = this.calculateBirthNakshatra(birthDate, birthTime);
      const nadiSystem = this.determineNadiSystem(birthNakshatra, birthDate);
      const dashaPeriod = this.calculateCurrentDasha(birthDate);
      const predictions = this.generateNadiPredictions(birthNakshatra, nadiSystem, dashaPeriod);

      return {
        birthNakshatra,
        nadiSystem,
        currentDasha: dashaPeriod,
        predictions,
        remedies: this.generateNadiRemedies(birthNakshatra, nadiSystem),
        lifePurpose: nadiSystem.lifePurpose,
        compatibility: this.generateCompatibilityInsights(birthNakshatra)
      };
    } catch (error) {
      logger.error('Error calculating Nadi reading:', error);
      return { error: 'Unable to calculate Nadi reading at this time' };
    }
  }

  /**
   * Calculate birth nakshatra
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time
   * @returns {Object} Birth nakshatra information
   */
  calculateBirthNakshatra(birthDate, birthTime) {
    try {
      // Simplified nakshatra calculation
      // In reality, this requires precise astronomical calculations
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Calculate approximate nakshatra based on date and time
      const dayOfYear = this.getDayOfYear(day, month);
      const timeFactor = (hour * 60 + minute) / 1440; // Fraction of day

      const nakshatraIndex = Math.floor((dayOfYear + timeFactor * 27) % 27);
      const nakshatra = this.nakshatras[nakshatraIndex];

      return {
        name: nakshatra.name,
        rulingPlanet: nakshatra.rulingPlanet,
        deity: nakshatra.deity,
        nature: nakshatra.nature,
        pada: this.calculatePada(hour, minute),
        characteristics: this.getNakshatraCharacteristics(nakshatra.name),
        rulingDeity: nakshatra.deity
      };
    } catch (error) {
      logger.error('Error calculating birth nakshatra:', error);
      return { error: 'Unable to calculate birth nakshatra' };
    }
  }

  /**
   * Determine Nadi system
   * @param {Object} birthNakshatra - Birth nakshatra
   * @param {string} birthDate - Birth date
   * @returns {Object} Nadi system
   */
  determineNadiSystem(birthNakshatra, birthDate) {
    try {
      // Simplified Nadi determination based on nakshatra and birth date
      const [day, month, year] = birthDate.split('/').map(Number);
      const total = day + month + year;

      let nadiType;
      if (total % 3 === 0) {
        nadiType = 'adi';
      } else if (total % 3 === 1) {
        nadiType = 'Madhya';
      } else {
        nadiType = 'Antya';
      }

      return this.nadiSystems[nadiType];
    } catch (error) {
      logger.error('Error determining Nadi system:', error);
      return this.nadiSystems.adi; // Default
    }
  }

  /**
   * Calculate current dasha period
   * @param {string} birthDate - Birth date
   * @returns {Object} Current dasha information
   */
  calculateCurrentDasha(birthDate) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);
      const birthDateObj = new Date(year, month - 1, day);
      const now = new Date();

      const ageInYears = now.getFullYear() - birthDateObj.getFullYear();
      const ageInMonths = (now.getMonth() - birthDateObj.getMonth() + ageInYears * 12);

      // Simplified dasha calculation
      const totalDashaYears = Object.values(this.dashaPeriods).reduce((sum, period) => sum + period.duration, 0);
      const currentPosition = ageInYears % totalDashaYears;

      let accumulatedYears = 0;
      let currentDasha = null;

      for (const [planet, period] of Object.entries(this.dashaPeriods)) {
        accumulatedYears += period.duration;
        if (currentPosition < accumulatedYears) {
          currentDasha = {
            planet: planet.charAt(0).toUpperCase() + planet.slice(1),
            duration: period.duration,
            remaining: accumulatedYears - currentPosition,
            characteristics: period.characteristics,
            influence: this.getDashaInfluence(planet)
          };
          break;
        }
      }

      return currentDasha || {
        planet: 'Sun',
        duration: 6,
        remaining: 3,
        characteristics: 'Leadership and authority',
        influence: 'Period of leadership and self-expression'
      };
    } catch (error) {
      logger.error('Error calculating current dasha:', error);
      return { error: 'Unable to calculate current dasha' };
    }
  }

  /**
   * Generate Nadi predictions
   * @param {Object} birthNakshatra - Birth nakshatra
   * @param {Object} nadiSystem - Nadi system
   * @param {Object} dashaPeriod - Current dasha
   * @returns {Object} Predictions
   */
  generateNadiPredictions(birthNakshatra, nadiSystem, dashaPeriod) {
    try {
      return {
        personality: this.generatePersonalityPrediction(birthNakshatra, nadiSystem),
        career: this.generateCareerPrediction(birthNakshatra, nadiSystem, dashaPeriod),
        relationships: this.generateRelationshipPrediction(birthNakshatra, nadiSystem),
        health: this.generateHealthPrediction(birthNakshatra),
        finance: this.generateFinancePrediction(birthNakshatra, dashaPeriod),
        spiritual: this.generateSpiritualPrediction(birthNakshatra, nadiSystem)
      };
    } catch (error) {
      logger.error('Error generating Nadi predictions:', error);
      return { error: 'Unable to generate predictions' };
    }
  }

  /**
   * Generate Nadi remedies
   * @param {Object} birthNakshatra - Birth nakshatra
   * @param {Object} nadiSystem - Nadi system
   * @returns {Array} Remedies
   */
  generateNadiRemedies(birthNakshatra, nadiSystem) {
    const remedies = [];

    try {
      // Nakshatra-based remedies
      const nakshatraRemedies = {
        Ashwini: ['Horse donation', 'White color offerings', 'Morning prayers'],
        Bharani: ['Yam mantra chanting', 'Red color offerings', 'Courage-building activities'],
        Krittika: ['Fire rituals', 'Gold offerings', 'Leadership development'],
        Rohini: ['Brahma mantra', 'White flowers', 'Creative pursuits'],
        Mrigashira: ['Moon offerings', 'Green color', 'Emotional healing'],
        Ardra: ['Rudra prayers', 'Water offerings', 'Conflict resolution'],
        Punarvasu: ['Aditi worship', 'White clothes', 'Family harmony'],
        Pushya: ['Brihaspati prayers', 'Yellow offerings', 'Wisdom seeking'],
        Ashlesha: ['Snake offerings', 'Copper items', 'Communication improvement'],
        Magha: ['Ancestor worship', 'Black color', 'Legacy building'],
        'Purva Phalguni': ['Bhaga prayers', 'Red flowers', 'Relationship healing'],
        'Uttara Phalguni': ['Aryaman worship', 'White offerings', 'Justice pursuits'],
        Hasta: ['Savitar prayers', 'Green color', 'Skill development'],
        Chitra: ['Vishwakarma worship', 'Multi-color offerings', 'Creative expression'],
        Swati: ['Vayu prayers', 'Mixed colors', 'Balance seeking'],
        Vishakha: ['Indra worship', 'Purple offerings', 'Leadership roles'],
        Anuradha: ['Mitra prayers', 'Red color', 'Friendship building'],
        Jyeshtha: ['Indra worship', 'Blue color', 'Authority development'],
        Mula: ['Nirriti prayers', 'Black offerings', 'Transformation work'],
        'Purva Ashadha': ['Apas worship', 'Blue color', 'Emotional healing'],
        'Uttara Ashadha': ['Vishwadevas prayers', 'Mixed colors', 'Community service'],
        Shravana: ['Vishwakarma worship', 'White color', 'Learning pursuits'],
        Dhanishta: ['Vasus prayers', 'Gold color', 'Prosperity rituals'],
        Shatabhisha: ['Varuna worship', 'Blue color', 'Healing practices'],
        'Purva Bhadrapada': ['Aja Ekapada prayers', 'Purple color', 'Spiritual growth'],
        'Uttara Bhadrapada': ['Ahir Budhnya worship', 'Mixed colors', 'Wisdom seeking'],
        Revati: ['Pushan prayers', 'Yellow color', 'Nurturing activities']
      };

      const nakshatraRemedy = nakshatraRemedies[birthNakshatra.name];
      if (nakshatraRemedy) {
        remedies.push(...nakshatraRemedy);
      }

      // Nadi-based remedies
      if (nadiSystem.name === 'Adi Nadi') {
        remedies.push('Leadership development workshops', 'Independent decision making');
      } else if (nadiSystem.name === 'Madhya Nadi') {
        remedies.push('Meditation for balance', 'Harmony-seeking activities');
      } else if (nadiSystem.name === 'Antya Nadi') {
        remedies.push('Service-oriented activities', 'Compassion practices');
      }

      return remedies;
    } catch (error) {
      logger.error('Error generating Nadi remedies:', error);
      return ['Consult with a Nadi astrologer for personalized remedies'];
    }
  }

  /**
   * Generate compatibility insights
   * @param {Object} birthNakshatra - Birth nakshatra
   * @returns {Object} Compatibility information
   */
  generateCompatibilityInsights(birthNakshatra) {
    try {
      const compatibleNakshatras = this.getCompatibleNakshatras(birthNakshatra.name);
      const bestMatches = this.getBestMatches(birthNakshatra.name);

      return {
        compatibleSigns: compatibleNakshatras,
        bestMatches,
        relationshipAdvice: this.getRelationshipAdvice(birthNakshatra.name)
      };
    } catch (error) {
      logger.error('Error generating compatibility insights:', error);
      return { error: 'Unable to generate compatibility insights' };
    }
  }

  // Helper methods
  getDayOfYear(day, month) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let dayOfYear = day;
    for (let i = 0; i < month - 1; i++) {
      dayOfYear += daysInMonth[i];
    }
    return dayOfYear;
  }

  calculatePada(hour, minute) {
    const totalMinutes = hour * 60 + minute;
    const padaDuration = 1440 / 4; // 4 padas per nakshatra
    return Math.floor(totalMinutes / padaDuration) + 1;
  }

  getNakshatraCharacteristics(nakshatraName) {
    const characteristics = {
      Ashwini: 'Independent, energetic, healing abilities, pioneering spirit',
      Bharani: 'Ambitious, courageous, transformative, leadership qualities',
      Krittika: 'Sharp intellect, leadership, purification, warrior spirit',
      Rohini: 'Creative, nurturing, material success, artistic talents',
      Mrigashira: 'Research-oriented, restless, communicative, searching nature',
      Ardra: 'Dynamic, stormy, destructive-constructive, research abilities',
      Punarvasu: 'Spiritual, learned, wealthy, devoted to elders',
      Pushya: 'Nurturing, spiritual, prosperous, caring nature',
      Ashlesha: 'Psychic, intuitive, healing, mystical abilities',
      Magha: 'Royal, authoritative, spiritual, ancestral connection',
      'Purva Phalguni': 'Creative, romantic, pleasure-seeking, diplomatic',
      'Uttara Phalguni': 'Charitable, prosperous, spiritual, service-oriented',
      Hasta: 'Healing, skilled, artistic, communicative',
      Chitra: 'Creative, artistic, skillful, dynamic',
      Swati: 'Independent, harmonious, diplomatic, self-sufficient',
      Vishakha: 'Social, ambitious, goal-oriented, leadership',
      Anuradha: 'Devotional, successful, friendly, spiritual',
      Jyeshtha: 'Eldest, authoritative, knowledgeable, occult abilities',
      Mula: 'Research, spiritual, destructive-constructive, philosophical',
      'Purva Ashadha': 'Victorious, ambitious, spiritual, leadership',
      'Uttara Ashadha': 'Spiritual, victorious, ambitious, leadership',
      Shravana: 'Learning, fame, spiritual, devoted',
      Dhanishta: 'Musical, prosperous, spiritual, wealthy',
      Shatabhisha: 'Healing, mystical, research, independent',
      'Purva Bhadrapada': 'Spiritual, creative, mystical, transformative',
      'Uttara Bhadrapada': 'Spiritual, charitable, prosperous, wise',
      Revati: 'Prosperous, spiritual, guiding, compassionate'
    };
    return characteristics[nakshatraName] || 'Unique characteristics and abilities';
  }

  getDashaInfluence(planet) {
    const influences = {
      sun: 'Focus on leadership, authority, and self-expression',
      moon: 'Emphasis on emotions, home, and mental well-being',
      mars: 'Energy for action, courage, and new beginnings',
      mercury: 'Time for learning, communication, and intellectual pursuits',
      jupiter: 'Period of expansion, wisdom, and spiritual growth',
      venus: 'Focus on relationships, beauty, and material comforts',
      saturn: 'Time for discipline, hard work, and life lessons',
      rahu: 'Period of ambition, unconventional paths, and growth',
      ketu: 'Time for spirituality, detachment, and inner wisdom'
    };
    return influences[planet] || 'Period of personal growth and development';
  }

  generatePersonalityPrediction(birthNakshatra, nadiSystem) {
    return `Your ${birthNakshatra.name} nakshatra suggests ${birthNakshatra.characteristics}. As part of the ${nadiSystem.name}, you exhibit ${nadiSystem.characteristics}.`;
  }

  generateCareerPrediction(birthNakshatra, nadiSystem, dashaPeriod) {
    const careerInsights = {
      'Adi Nadi': 'Leadership and pioneering roles',
      'Madhya Nadi': 'Balanced and harmonious work environments',
      'Antya Nadi': 'Service and helping professions'
    };

    return `Your ${nadiSystem.name} suggests career success in ${careerInsights[nadiSystem.name]}. Current ${dashaPeriod.planet} dasha influences ${dashaPeriod.characteristics}.`;
  }

  generateRelationshipPrediction(birthNakshatra, nadiSystem) {
    return `Your ${birthNakshatra.name} nakshatra and ${nadiSystem.name} indicate strong potential for ${nadiSystem.characteristics.toLowerCase()} in relationships.`;
  }

  generateHealthPrediction(birthNakshatra) {
    return `Your ${birthNakshatra.name} nakshatra suggests attention to ${this.getNakshatraHealthFocus(birthNakshatra.name)}.`;
  }

  generateFinancePrediction(birthNakshatra, dashaPeriod) {
    return `Current ${dashaPeriod.planet} dasha may bring ${dashaPeriod.characteristics.toLowerCase()} in financial matters.`;
  }

  generateSpiritualPrediction(birthNakshatra, nadiSystem) {
    return `Your ${birthNakshatra.name} nakshatra and ${nadiSystem.name} guide you toward ${nadiSystem.lifePurpose.toLowerCase()}.`;
  }

  getNakshatraHealthFocus(nakshatraName) {
    const healthFocus = {
      Ashwini: 'head and nervous system',
      Bharani: 'reproductive system',
      Krittika: 'digestive system',
      Rohini: 'throat and neck',
      Mrigashira: 'respiratory system',
      Ardra: 'skin and nervous system',
      Punarvasu: 'lungs and digestive system',
      Pushya: 'stomach and digestive health',
      Ashlesha: 'digestive and nervous system',
      Magha: 'bones and skeletal system',
      'Purva Phalguni': 'reproductive and urinary system',
      'Uttara Phalguni': 'kidneys and urinary system',
      Hasta: 'hands and arms',
      Chitra: 'skin and blood circulation',
      Swati: 'veins and nervous system',
      Vishakha: 'intestines and excretory system',
      Anuradha: 'heart and circulatory system',
      Jyeshtha: 'ears and hearing',
      Mula: 'digestive and nervous system',
      'Purva Ashadha': 'joints and muscular system',
      'Uttara Ashadha': 'joints and muscular system',
      Shravana: 'ears and nervous system',
      Dhanishta: 'throat and speech',
      Shatabhisha: 'lower abdomen and excretory system',
      'Purva Bhadrapada': 'feet and lower limbs',
      'Uttara Bhadrapada': 'feet and lower limbs',
      Revati: 'feet and ankles'
    };
    return healthFocus[nakshatraName] || 'overall well-being and balance';
  }

  getCompatibleNakshatras(nakshatraName) {
    // Simplified compatibility - in reality this is complex
    const compatible = {
      Ashwini: ['Bharani', 'Pushya', 'Shravana'],
      Bharani: ['Ashwini', 'Rohini', 'Dhanishta'],
      Krittika: ['Uttara Phalguni', 'Uttara Ashadha'],
      Rohini: ['Bharani', 'Hasta', 'Shravana'],
      Mrigashira: ['Punarvasu', 'Anuradha', 'Revati'],
      Ardra: ['Swati', 'Shatabhisha'],
      Punarvasu: ['Mrigashira', 'Pushya', 'Uttara Bhadrapada'],
      Pushya: ['Ashwini', 'Punarvasu', 'Revati'],
      Ashlesha: ['Jyeshtha', 'Mula'],
      Magha: ['Purva Phalguni', 'Uttara Phalguni'],
      'Purva Phalguni': ['Magha', 'Uttara Phalguni', 'Dhanishta'],
      'Uttara Phalguni': ['Krittika', 'Purva Phalguni', 'Uttara Ashadha'],
      Hasta: ['Rohini', 'Chitra', 'Shravana'],
      Chitra: ['Hasta', 'Swati', 'Vishakha'],
      Swati: ['Ardra', 'Chitra', 'Anuradha'],
      Vishakha: ['Chitra', 'Jyeshtha', 'Purva Ashadha'],
      Anuradha: ['Mrigashira', 'Swati', 'Uttara Ashadha'],
      Jyeshtha: ['Ashlesha', 'Vishakha', 'Mula'],
      Mula: ['Ashlesha', 'Jyeshtha', 'Purva Ashadha'],
      'Purva Ashadha': ['Vishakha', 'Mula', 'Uttara Ashadha'],
      'Uttara Ashadha': ['Krittika', 'Anuradha', 'Purva Ashadha'],
      Shravana: ['Ashwini', 'Hasta', 'Dhanishta'],
      Dhanishta: ['Bharani', 'Purva Phalguni', 'Shravana'],
      Shatabhisha: ['Ardra', 'Purva Bhadrapada'],
      'Purva Bhadrapada': ['Shatabhisha', 'Uttara Bhadrapada', 'Revati'],
      'Uttara Bhadrapada': ['Punarvasu', 'Purva Bhadrapada'],
      Revati: ['Mrigashira', 'Pushya', 'Purva Bhadrapada']
    };
    return compatible[nakshatraName] || ['Various nakshatras based on individual charts'];
  }

  getBestMatches(nakshatraName) {
    const bestMatches = {
      Ashwini: ['Pushya', 'Shravana'],
      Bharani: ['Rohini', 'Dhanishta'],
      Krittika: ['Uttara Phalguni'],
      Rohini: ['Hasta', 'Shravana'],
      Mrigashira: ['Anuradha', 'Revati'],
      Ardra: ['Swati'],
      Punarvasu: ['Pushya', 'Uttara Bhadrapada'],
      Pushya: ['Ashwini', 'Revati'],
      Ashlesha: ['Jyeshtha'],
      Magha: ['Purva Phalguni'],
      'Purva Phalguni': ['Magha', 'Dhanishta'],
      'Uttara Phalguni': ['Krittika'],
      Hasta: ['Rohini', 'Chitra'],
      Chitra: ['Hasta', 'Vishakha'],
      Swati: ['Anuradha'],
      Vishakha: ['Chitra', 'Purva Ashadha'],
      Anuradha: ['Mrigashira', 'Uttara Ashadha'],
      Jyeshtha: ['Ashlesha', 'Mula'],
      Mula: ['Jyeshtha', 'Purva Ashadha'],
      'Purva Ashadha': ['Vishakha', 'Uttara Ashadha'],
      'Uttara Ashadha': ['Anuradha', 'Purva Ashadha'],
      Shravana: ['Ashwini', 'Hasta'],
      Dhanishta: ['Bharani', 'Purva Phalguni'],
      Shatabhisha: ['Purva Bhadrapada'],
      'Purva Bhadrapada': ['Uttara Bhadrapada'],
      'Uttara Bhadrapada': ['Punarvasu'],
      Revati: ['Mrigashira', 'Pushya']
    };
    return bestMatches[nakshatraName] || ['Compatible partners based on full chart analysis'];
  }

  getRelationshipAdvice(nakshatraName) {
    return `Your ${nakshatraName} nakshatra suggests seeking partners who complement your natural tendencies and support your life purpose.`;
  }

  /**
   * Format Nadi reading for WhatsApp display
   * @param {Object} reading - Nadi reading
   * @returns {string} Formatted reading text
   */
  formatReadingForWhatsApp(reading) {
    try {
      if (reading.error) {
        return `📜 *Nadi Astrology Error*\n\n${reading.error}`;
      }

      let message = '📜 *Nadi Astrology Reading*\n\n';

      // Birth Nakshatra
      if (reading.birthNakshatra && !reading.birthNakshatra.error) {
        message += `*Birth Nakshatra:* ${reading.birthNakshatra.name}\n`;
        message += `*Ruling Planet:* ${reading.birthNakshatra.rulingPlanet}\n`;
        message += `*Deity:* ${reading.birthNakshatra.rulingDeity}\n`;
        message += `*Pada:* ${reading.birthNakshatra.pada}\n`;
        message += `*Characteristics:* ${reading.birthNakshatra.characteristics}\n\n`;
      }

      // Nadi System
      if (reading.nadiSystem) {
        message += `*Nadi System:* ${reading.nadiSystem.name}\n`;
        message += `*Characteristics:* ${reading.nadiSystem.characteristics}\n`;
        message += `*Life Purpose:* ${reading.nadiSystem.lifePurpose}\n\n`;
      }

      // Current Dasha
      if (reading.currentDasha && !reading.currentDasha.error) {
        message += `*Current Dasha:* ${reading.currentDasha.planet} (${reading.currentDasha.remaining} years remaining)\n`;
        message += `*Influence:* ${reading.currentDasha.influence}\n\n`;
      }

      // Predictions
      if (reading.predictions && !reading.predictions.error) {
        message += '*Key Predictions:*\n';
        Object.entries(reading.predictions).forEach(([area, prediction]) => {
          message += `• *${area.charAt(0).toUpperCase() + area.slice(1)}:* ${prediction}\n`;
        });
        message += '\n';
      }

      // Remedies
      if (reading.remedies && reading.remedies.length > 0) {
        message += '*Recommended Remedies:*\n';
        reading.remedies.forEach(remedy => {
          message += `• ${remedy}\n`;
        });
        message += '\n';
      }

      message += '⭐ *Remember:* Nadi astrology provides ancient wisdom from palm leaf manuscripts. Consult a qualified Nadi astrologer for detailed analysis! ✨';

      return message;
    } catch (error) {
      logger.error('Error formatting Nadi reading for WhatsApp:', error);
      return '❌ Error formatting Nadi astrology reading.';
    }
  }
}

/**
 * Generate a Nadi astrology reading based on user data
 * @param {Object} user - User data with birth information
 * @returns {Object} Formatted Nadi reading
 */
function generateNadiReading(user) {
  try {
    if (!user || !user.birthDate) {
      return {
        error: 'Birth date is required for Nadi reading',
        nadiType: 'Unknown',
        dasaPeriods: [],
        remedies: [],
        predictions: {},
        interpretation: 'Please provide your birth date for accurate Nadi analysis'
      };
    }

    // Parse birth date and create sample time/place if not provided
    const { birthDate } = user;
    const birthTime = user.birthTime || '12:00';
    const birthPlace = user.birthPlace || 'Unknown';

    const reading = module.exports.calculateNadiReading(birthDate, birthTime, birthPlace);

    if (reading.error) {
      return {
        error: reading.error,
        nadiType: 'Unknown',
        dasaPeriods: [],
        remedies: [],
        predictions: {},
        interpretation: 'Unable to generate Nadi reading at this time'
      };
    }

    return {
      nadiType: reading.nadiSystem.name,
      dasaPeriods: [{
        planet: reading.currentDasha.planet,
        startDate: 'Current',
        endDate: `${reading.currentDasha.remaining} years`,
        effects: reading.currentDasha.influence
      }],
      remedies: reading.remedies,
      predictions: reading.predictions,
      interpretation: `Your ${reading.nadiSystem.name} indicates ${reading.nadiSystem.characteristics}. Current ${reading.currentDasha.planet} dasha brings ${reading.currentDasha.characteristics}.`
    };
  } catch (error) {
    logger.error('Error generating Nadi reading:', error);
    return {
      error: 'Unable to generate Nadi reading',
      nadiType: 'Unknown',
      dasaPeriods: [],
      remedies: ['Consult a qualified Nadi astrologer'],
      predictions: {},
      interpretation: 'Please try again later'
    };
  }
}

module.exports = new NadiReader();
module.exports.generateNadiReading = generateNadiReading;
