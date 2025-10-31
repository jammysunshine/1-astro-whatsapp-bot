const logger = require('../../../utils/logger');

/**
 * SunSignService - Service for Sun sign calculation and interpretation
 * Calculates and interprets the Sun sign based on birth date, including Sun's position in nakshatra, planetary ruler, and basic characteristics
 */
class SunSignService {
  constructor() {
    this.calculator = new SignCalculator();
    logger.info('SunSignService initialized');
  }

  /**
   * Execute Sun sign calculation and analysis
   * @param {Object} birthData - Birth data for Sun sign calculation
   * @param {string} birthData.birthDate - Birth date (DD/MM/YYYY)
   * @param {string} birthData.birthTime - Birth time (HH:MM) (optional)
   * @param {string} birthData.birthPlace - Birth place (optional)
   * @param {string} options - Calculation options (sidereal/tropical)
   * @returns {Object} Sun sign analysis result
   */
  async execute(birthData, options = {}) {
    try {
      // Input validation
      this._validateInput(birthData);

      // Calculate Sun sign
      const result = await this.calculateSunSign(birthData, options);

      // Format and return result
      return this._formatResult(result);
    } catch (error) {
      logger.error('SunSignService error:', error);
      throw new Error(`Sun sign calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate comprehensive Sun sign analysis
   * @param {Object} birthData - Birth data
   * @param {Object} options - Calculation options
   * @returns {Object} Sun sign analysis
   */
  async calculateSunSign(birthData, options = {}) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;
      const chartType = options.chartType || 'sidereal';

      // Get Sun sign from calculator
      const sunSignData = await this.calculator.calculateSunSign(
        birthDate,
        birthTime || '12:00',
        birthPlace || 'Delhi, India',
        chartType
      );

      // Generate additional analysis
      const sunSignTraits = this._getSunSignTraits(sunSignData.sign);
      const nakshatraInfo = this._getNakshatraInfo(sunSignData.nakshatra);
      const planetaryRuler = this._getPlanetaryRuler(sunSignData.sign);
      const compatibility = this._getSunSignCompatibility(sunSignData.sign);
      const lifePurpose = this._getLifePurpose(sunSignData.sign);

      return {
        sunSignData,
        sunSignTraits,
        nakshatraInfo,
        planetaryRuler,
        compatibility,
        lifePurpose,
        chartType,
        interpretation: this._createSunSignInterpretation(sunSignData, sunSignTraits, nakshatraInfo)
      };
    } catch (error) {
      logger.error('Sun sign calculation error:', error);
      throw error;
    }
  }

  /**
   * Get Sun sign personality traits and characteristics
   * @param {string} sunSign - Sun sign name
   * @returns {Object} Sun sign traits
   */
  _getSunSignTraits(sunSign) {
    const traits = {
      Aries: {
        element: 'Fire',
        quality: 'Cardinal',
        polarity: 'Masculine',
        rulingPlanet: 'Mars',
        symbol: 'Ram',
        strengths: ['Courageous', 'Enthusiastic', 'Confident', 'Energetic'],
        weaknesses: ['Impatient', 'Self-centered', 'Quick-tempered', 'Competitive'],
        likes: ['Challenges', 'New experiences', 'Physical activities', 'Leadership roles'],
        dislikes: ['Waiting', 'Inactivity', 'Being told what to do', 'Small details']
      },
      Taurus: {
        element: 'Earth',
        quality: 'Fixed',
        polarity: 'Feminine',
        rulingPlanet: 'Venus',
        symbol: 'Bull',
        strengths: ['Reliable', 'Patient', 'Practical', 'Devoted'],
        weaknesses: ['Stubborn', 'Possessive', 'Uncompromising', 'Materialistic'],
        likes: ['Gardening', 'Cooking', 'Music', 'Romance'],
        dislikes: ['Sudden changes', 'Being rushed', 'Synthetic fabrics', 'Disorder']
      },
      Gemini: {
        element: 'Air',
        quality: 'Mutable',
        polarity: 'Masculine',
        rulingPlanet: 'Mercury',
        symbol: 'Twins',
        strengths: ['Gentle', 'Affectionate', 'Curious', 'Adaptable'],
        weaknesses: ['Nervous', 'Inconsistent', 'Indecisive', 'Superficial'],
        likes: ['Music', 'Books', 'Magazines', 'Chats with friends'],
        dislikes: ['Being alone', 'Routine work', 'Being confined', 'Repetition']
      },
      Cancer: {
        element: 'Water',
        quality: 'Cardinal',
        polarity: 'Feminine',
        rulingPlanet: 'Moon',
        symbol: 'Crab',
        strengths: ['Tenacious', 'Highly imaginative', 'Loyal', 'Emotional'],
        weaknesses: ['Moody', 'Clingy', 'Self-pitying', 'Oversensitive'],
        likes: ['Art', 'Home-based hobbies', 'Deep conversations', 'Being with family'],
        dislikes: ['Strangers', 'Any criticism of Mom', 'Revealing of personal life', 'Offensive odors']
      },
      Leo: {
        element: 'Fire',
        quality: 'Fixed',
        polarity: 'Masculine',
        rulingPlanet: 'Sun',
        symbol: 'Lion',
        strengths: ['Creative', 'Passionate', 'Generous', 'Warm-hearted'],
        weaknesses: ['Prideful', 'Lazy', 'Difficult to discipline', 'Inflexible'],
        likes: ['Theater', 'Taking holidays', 'Being admired', 'Expensive things'],
        dislikes: ['Being ignored', 'Being criticized', 'Small-minded people', 'Mean spirits']
      },
      Virgo: {
        element: 'Earth',
        quality: 'Mutable',
        polarity: 'Feminine',
        rulingPlanet: 'Mercury',
        symbol: 'Virgin',
        strengths: ['Loyal', 'Analytical', 'Kind', 'Hardworking'],
        weaknesses: ['Shyness', 'Worry', 'Overly critical of self and others', 'All work and no play'],
        likes: ['Animals', 'Healthy food', 'Books', 'Nature'],
        dislikes: ['Rudeness', 'Asking for help', 'Taking center stage', 'Unhealthy lifestyles']
      },
      Libra: {
        element: 'Air',
        quality: 'Cardinal',
        polarity: 'Masculine',
        rulingPlanet: 'Venus',
        symbol: 'Scales',
        strengths: ['Cooperative', 'Diplomatic', 'Gracious', 'Fair-minded'],
        weaknesses: ['Indecisive', 'Avoids confrontations', 'Carries a grudge', 'Self-pity'],
        likes: ['Harmony', 'Gentleness', 'Sharing with others', 'The outdoors'],
        dislikes: ['Violence', 'Injustice', 'Brutishness', 'Being a slave to fashion']
      },
      Scorpio: {
        element: 'Water',
        quality: 'Fixed',
        polarity: 'Feminine',
        rulingPlanet: 'Pluto',
        symbol: 'Scorpion',
        strengths: ['Resourceful', 'Brave', 'Passionate', 'Stubborn'],
        weaknesses: ['Distrustful', 'Jealous', 'Secretive', 'Violent'],
        likes: ['Truth', 'Facts', 'Being right', 'Teasing people they care about'],
        dislikes: ['Dishonesty', 'Revealing secrets', 'Passive people', 'Superficiality']
      },
      Sagittarius: {
        element: 'Fire',
        quality: 'Mutable',
        polarity: 'Masculine',
        rulingPlanet: 'Jupiter',
        symbol: 'Archer',
        strengths: ['Generous', 'Idealistic', 'Great sense of humor', 'Honest'],
        weaknesses: ['Promises more than can deliver', 'Very impatient', 'Will say anything no matter how undiplomatic', 'Tactless'],
        likes: ['Freedom', 'Travel', 'Philosophy', 'Being outdoors'],
        dislikes: ['Clingy people', 'Being constrained', 'Off-the-wall theories', 'Details']
      },
      Capricorn: {
        element: 'Earth',
        quality: 'Cardinal',
        polarity: 'Feminine',
        rulingPlanet: 'Saturn',
        symbol: 'Goat',
        strengths: ['Responsible', 'Disciplined', 'Self-controlled', 'Ambitious'],
        weaknesses: ['Know-it-all', 'Unforgiving', 'Condescending', 'Expecting the worst'],
        likes: ['Family', 'Tradition', 'Music', 'Quality craftsmanship'],
        dislikes: ['Almost everything at some point', 'Idleness', 'Time wasting', 'Disorder']
      },
      Aquarius: {
        element: 'Air',
        quality: 'Fixed',
        polarity: 'Masculine',
        rulingPlanet: 'Uranus',
        symbol: 'Water Bearer',
        strengths: ['Progressive', 'Original', 'Independent', 'Humanitarian'],
        weaknesses: ['Runs from emotional expression', 'Moodiness', 'Sometimes feels victimized', 'Very detached'],
        likes: ['Fun with friends', 'Helping others', 'Fighting for causes', 'Intellectual conversation'],
        dislikes: ['Limitations', 'Broken promises', 'Being lonely', 'Dull or boring situations']
      },
      Pisces: {
        element: 'Water',
        quality: 'Mutable',
        polarity: 'Feminine',
        rulingPlanet: 'Neptune',
        symbol: 'Fish',
        strengths: ['Compassionate', 'Artistic', 'Intuitive', 'Gentle'],
        weaknesses: ['Fearful', 'Overly trusting', 'Sadness', 'Desire to escape reality'],
        likes: ['Being alone', 'Sleep', 'Music', 'Romance'],
        dislikes: ['Know-it-alls', 'Cruelty', 'The past coming back to haunt', 'Criticism']
      }
    };

    return traits[sunSign] || {
      element: 'Unknown',
      quality: 'Unknown',
      polarity: 'Unknown',
      rulingPlanet: 'Unknown',
      symbol: 'Unknown',
      strengths: ['Unique qualities'],
      weaknesses: ['Individual challenges'],
      likes: ['Personal interests'],
      dislikes: ['Personal dislikes']
    };
  }

  /**
   * Get nakshatra information for Sun placement
   * @param {string} nakshatra - Nakshatra name
   * @returns {Object} Nakshatra information
   */
  _getNakshatraInfo(nakshatra) {
    const nakshatras = {
      Ashwini: {
        rulingPlanet: 'Ketu',
        deity: 'Ashwin Kumaras',
        symbol: 'Horse\'s head',
        nature: 'Light',
        meaning: 'Swift healing and new beginnings'
      },
      Bharani: {
        rulingPlanet: 'Venus',
        deity: 'Yama',
        symbol: 'Yoni',
        nature: 'Fierce',
        meaning: 'Transformation and rebirth'
      },
      Krittika: {
        rulingPlanet: 'Sun',
        deity: 'Agni',
        symbol: 'Knife',
        nature: 'Mixed',
        meaning: 'Purification and cutting away'
      },
      Rohini: {
        rulingPlanet: 'Moon',
        deity: 'Brahma',
        symbol: 'Cart',
        nature: 'Fixed',
        meaning: 'Growth and nourishment'
      },
      Mrigashira: {
        rulingPlanet: 'Mars',
        deity: 'Soma',
        symbol: 'Deer\'s head',
        nature: 'Soft',
        meaning: 'Search and discovery'
      },
      Ardra: {
        rulingPlanet: 'Rahu',
        deity: 'Rudra',
        symbol: 'Teardrop',
        nature: 'Fierce',
        meaning: 'Storm and cleansing'
      },
      Punarvasu: {
        rulingPlanet: 'Jupiter',
        deity: 'Aditi',
        symbol: 'Bow and quiver',
        nature: 'Moveable',
        meaning: 'Renewal and return'
      },
      Pushya: {
        rulingPlanet: 'Saturn',
        deity: 'Brihaspati',
        symbol: 'Flower',
        nature: 'Light',
        meaning: 'Nourishment and protection'
      },
      Ashlesha: {
        rulingPlanet: 'Mercury',
        deity: 'Nagas',
        symbol: 'Serpent',
        nature: 'Fierce',
        meaning: 'Wisdom and transformation'
      },
      Magha: {
        rulingPlanet: 'Ketu',
        deity: 'Pitris',
        symbol: 'Throne',
        nature: 'Fierce',
        meaning: 'Royal dignity and ancestry'
      },
      PurvaPhalguni: {
        rulingPlanet: 'Venus',
        deity: 'Bhaga',
        symbol: 'Hammock',
        nature: 'Fixed',
        meaning: 'Pleasure and relaxation'
      },
      UttaraPhalguni: {
        rulingPlanet: 'Sun',
        deity: 'Aryaman',
        symbol: 'Bed',
        nature: 'Fixed',
        meaning: 'Friendship and favor'
      },
      Hasta: {
        rulingPlanet: 'Moon',
        deity: 'Savitar',
        symbol: 'Hand',
        nature: 'Light',
        meaning: 'Skill and craftsmanship'
      },
      Chitra: {
        rulingPlanet: 'Mars',
        deity: 'Vishwakarma',
        symbol: 'Pearl',
        nature: 'Soft',
        meaning: 'Beauty and creativity'
      },
      Swati: {
        rulingPlanet: 'Rahu',
        deity: 'Vayu',
        symbol: 'Coral',
        nature: 'Fixed',
        meaning: 'Independence and balance'
      },
      Vishakha: {
        rulingPlanet: 'Jupiter',
        deity: 'Indra',
        symbol: 'Triumphal arch',
        nature: 'Mixed',
        meaning: 'Achievement and victory'
      },
      Anuradha: {
        rulingPlanet: 'Saturn',
        deity: 'Mitra',
        symbol: 'Lotus',
        nature: 'Soft',
        meaning: 'Devotion and friendship'
      },
      Jyeshtha: {
        rulingPlanet: 'Mercury',
        deity: 'Indra',
        symbol: 'Umbrella',
        nature: 'Fierce',
        meaning: 'Eldest and authority'
      },
      Mula: {
        rulingPlanet: 'Ketu',
        deity: 'Nirriti',
        symbol: 'Bunch of roots',
        nature: 'Fierce',
        meaning: 'Foundation and destruction'
      },
      PurvaAshadha: {
        rulingPlanet: 'Venus',
        deity: 'Apas',
        symbol: 'Elephant tusk',
        nature: 'Fixed',
        meaning: 'Invincibility and success'
      },
      UttaraAshadha: {
        rulingPlanet: 'Sun',
        deity: 'Vishvedevas',
        symbol: 'Elephant tusk',
        nature: 'Fixed',
        meaning: 'Universal welfare'
      },
      Shravana: {
        rulingPlanet: 'Moon',
        deity: 'Vishnu',
        symbol: 'Ear',
        nature: 'Moveable',
        meaning: 'Hearing and learning'
      },
      Dhanishta: {
        rulingPlanet: 'Mars',
        deity: 'Vasus',
        symbol: 'Drum',
        nature: 'Fixed',
        meaning: 'Wealth and prosperity'
      },
      Shatabhisha: {
        rulingPlanet: 'Rahu',
        deity: 'Varuna',
        symbol: 'Empty circle',
        nature: 'Fixed',
        meaning: 'Healing and protection'
      },
      PurvaBhadrapada: {
        rulingPlanet: 'Jupiter',
        deity: 'Aja Ekapada',
        symbol: 'Sword',
        nature: 'Fierce',
        meaning: 'Burning purification'
      },
      UttaraBhadrapada: {
        rulingPlanet: 'Saturn',
        deity: 'Ahir Budhnya',
        symbol: 'Twins',
        nature: 'Fixed',
        meaning: 'Foundation and support'
      },
      Revati: {
        rulingPlanet: 'Mercury',
        deity: 'Pushan',
        symbol: 'Fish',
        nature: 'Soft',
        meaning: 'Prosperity and guidance'
      }
    };

    return nakshatras[nakshatra] || {
      rulingPlanet: 'Unknown',
      deity: 'Unknown',
      symbol: 'Unknown',
      nature: 'Unknown',
      meaning: 'Unique cosmic influence'
    };
  }

  /**
   * Get planetary ruler information
   * @param {string} sunSign - Sun sign name
   * @returns {Object} Planetary ruler information
   */
  _getPlanetaryRuler(sunSign) {
    const traits = this._getSunSignTraits(sunSign);
    const { rulingPlanet } = traits;

    const planetInfo = {
      Mars: {
        energy: 'Dynamic and assertive',
        influence: 'Action, courage, and physical vitality',
        qualities: 'Leadership, determination, and competitive spirit'
      },
      Venus: {
        energy: 'Harmonious and sensual',
        influence: 'Love, beauty, and material comfort',
        qualities: 'Charm, diplomacy, and appreciation of aesthetics'
      },
      Mercury: {
        energy: 'Intellectual and communicative',
        influence: 'Logic, learning, and social interaction',
        qualities: 'Adaptability, wit, and analytical thinking'
      },
      Moon: {
        energy: 'Emotional and nurturing',
        influence: 'Feelings, intuition, and subconscious patterns',
        qualities: 'Sensitivity, empathy, and emotional intelligence'
      },
      Sun: {
        energy: 'Radiant and authoritative',
        influence: 'Identity, confidence, and creative self-expression',
        qualities: 'Charisma, generosity, and natural leadership'
      },
      Pluto: {
        energy: 'Transformative and intense',
        influence: 'Power, regeneration, and deep psychological insight',
        qualities: 'Resilience, depth, and transformative power'
      },
      Jupiter: {
        energy: 'Expansive and optimistic',
        influence: 'Growth, wisdom, and philosophical understanding',
        qualities: 'Generosity, faith, and broad-minded perspective'
      },
      Saturn: {
        energy: 'Disciplined and responsible',
        influence: 'Structure, karma, and long-term achievement',
        qualities: 'Patience, perseverance, and practical wisdom'
      },
      Uranus: {
        energy: 'Revolutionary and independent',
        influence: 'Innovation, freedom, and humanitarian ideals',
        qualities: 'Originality, progressiveness, and unconventional thinking'
      },
      Neptune: {
        energy: 'Dreamy and compassionate',
        influence: 'Spirituality, imagination, and universal love',
        qualities: 'Intuition, creativity, and mystical awareness'
      }
    };

    return planetInfo[rulingPlanet] || {
      energy: 'Unique cosmic influence',
      influence: 'Specialized planetary guidance',
      qualities: 'Individual planetary characteristics'
    };
  }

  /**
   * Get Sun sign compatibility information
   * @param {string} sunSign - Sun sign name
   * @returns {Object} Compatibility information
   */
  _getSunSignCompatibility(sunSign) {
    const compatibility = {
      Aries: {
        bestMatches: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
        challengingMatches: ['Cancer', 'Capricorn'],
        compatibleElements: 'Fire and Air signs harmonize well'
      },
      Taurus: {
        bestMatches: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
        challengingMatches: ['Leo', 'Aquarius'],
        compatibleElements: 'Earth and Water signs provide stability'
      },
      Gemini: {
        bestMatches: ['Libra', 'Aquarius', 'Aries', 'Leo'],
        challengingMatches: ['Virgo', 'Pisces'],
        compatibleElements: 'Air signs create intellectual synergy'
      },
      Cancer: {
        bestMatches: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
        challengingMatches: ['Aries', 'Libra'],
        compatibleElements: 'Water signs share emotional depth'
      },
      Leo: {
        bestMatches: ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
        challengingMatches: ['Taurus', 'Scorpio'],
        compatibleElements: 'Fire signs fuel creative passion'
      },
      Virgo: {
        bestMatches: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
        challengingMatches: ['Gemini', 'Sagittarius'],
        compatibleElements: 'Earth signs build practical foundations'
      },
      Libra: {
        bestMatches: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
        challengingMatches: ['Cancer', 'Capricorn'],
        compatibleElements: 'Air signs maintain harmonious balance'
      },
      Scorpio: {
        bestMatches: ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
        challengingMatches: ['Leo', 'Aquarius'],
        compatibleElements: 'Water signs dive into emotional intimacy'
      },
      Sagittarius: {
        bestMatches: ['Aries', 'Leo', 'Libra', 'Aquarius'],
        challengingMatches: ['Virgo', 'Pisces'],
        compatibleElements: 'Fire signs share adventurous spirit'
      },
      Capricorn: {
        bestMatches: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
        challengingMatches: ['Aries', 'Libra'],
        compatibleElements: 'Earth signs create lasting structures'
      },
      Aquarius: {
        bestMatches: ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
        challengingMatches: ['Taurus', 'Scorpio'],
        compatibleElements: 'Air signs foster intellectual freedom'
      },
      Pisces: {
        bestMatches: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'],
        challengingMatches: ['Gemini', 'Sagittarius'],
        compatibleElements: 'Water signs flow with emotional currents'
      }
    };

    return compatibility[sunSign] || {
      bestMatches: ['Various signs'],
      challengingMatches: ['Individual dynamics'],
      compatibleElements: 'Unique compatibility patterns'
    };
  }

  /**
   * Get life purpose based on Sun sign
   * @param {string} sunSign - Sun sign name
   * @returns {string} Life purpose description
   */
  _getLifePurpose(sunSign) {
    const purposes = {
      Aries: 'To courageously pioneer new paths and inspire others through bold action',
      Taurus: 'To build lasting value and create beauty through practical, reliable efforts',
      Gemini: 'To communicate knowledge and connect people through versatile expression',
      Cancer: 'To nurture and protect, creating safe emotional foundations for growth',
      Leo: 'To shine authentically and inspire others through creative self-expression',
      Virgo: 'To serve with precision and improve systems through practical analysis',
      Libra: 'To create harmony and balance, fostering cooperation and justice',
      Scorpio: 'To transform through deep insight and help others through profound change',
      Sagittarius: 'To explore truth and expand horizons through philosophical understanding',
      Capricorn: 'To build enduring structures and lead through disciplined achievement',
      Aquarius: 'To innovate for humanity and break limitations through progressive thinking',
      Pisces: 'To offer compassion and heal through creative, spiritual connection'
    };

    return purposes[sunSign] || 'To fulfill unique potential through authentic self-expression';
  }

  /**
   * Create comprehensive Sun sign interpretation
   * @param {Object} sunSignData - Sun sign data
   * @param {Object} traits - Sun sign traits
   * @param {Object} nakshatraInfo - Nakshatra information
   * @returns {string} Complete interpretation
   */
  _createSunSignInterpretation(sunSignData, traits, nakshatraInfo) {
    let interpretation = `Your Sun sign is ${sunSignData.sign}, a ${traits.element} sign with ${traits.quality} qualities. `;

    interpretation += `As a ${traits.polarity} sign ruled by ${traits.rulingPlanet}, you embody ${traits.strengths.slice(0, 2).join(' and ')} qualities. `;

    interpretation += `Your Sun's placement in the ${sunSignData.nakshatra} nakshatra, ruled by ${nakshatraInfo.rulingPlanet}, adds ${nakshatraInfo.meaning.toLowerCase()}. `;

    interpretation += `This combination suggests your life purpose is ${this._getLifePurpose(sunSignData.sign).toLowerCase()}.`;

    return interpretation;
  }

  /**
   * Validate input data
   * @param {Object} input - Input data to validate
   */
  _validateInput(input) {
    if (!input) {
      throw new Error('Birth data is required');
    }

    const { birthDate } = input;

    if (!birthDate || typeof birthDate !== 'string') {
      throw new Error('Valid birth date (DD/MM/YYYY format) is required');
    }

    // Validate date format
    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!dateRegex.test(birthDate)) {
      throw new Error('Birth date must be in DD/MM/YYYY format');
    }

    // Validate date values
    const [day, month, year] = birthDate.split('/').map(Number);
    if (month < 1 || month > 12) {
      throw new Error('Month must be between 1 and 12');
    }

    if (day < 1 || day > 31) {
      throw new Error('Day must be between 1 and 31');
    }

    if (year < 1900 || year > new Date().getFullYear() + 1) {
      throw new Error(`Year must be between 1900 and ${new Date().getFullYear() + 1}`);
    }
  }

  /**
   * Format result for presentation
   * @param {Object} result - Raw Sun sign result
   * @returns {Object} Formatted result
   */
  _formatResult(result) {
    return {
      service: 'Sun Sign Analysis',
      timestamp: new Date().toISOString(),
      sunSign: {
        basic: result.sunSignData,
        traits: result.sunSignTraits,
        nakshatra: result.nakshatraInfo,
        planetaryRuler: result.planetaryRuler,
        compatibility: result.compatibility,
        lifePurpose: result.lifePurpose,
        chartType: result.chartType
      },
      interpretation: result.interpretation,
      disclaimer: 'Sun sign analysis provides general personality insights based on birth date. Individual charts are unique and comprehensive astrological analysis considers all planetary positions. Astrology offers guidance for self-understanding.'
    };
  }
}

module.exports = SunSignService;
