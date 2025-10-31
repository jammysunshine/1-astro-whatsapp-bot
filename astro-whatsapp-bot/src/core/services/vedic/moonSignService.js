const logger = require('../../../utils/logger');

/**
 * MoonSignService - Service for Moon sign calculation and interpretation
 * Determines the Moon's sign at birth, including emotional nature, mind patterns, and psychological disposition based on lunar position and nakshatra
 */
class MoonSignService {
  constructor() {
    this.calculator = new SignCalculator();
    logger.info('MoonSignService initialized');
  }

  /**
   * Execute Moon sign calculation and analysis
   * @param {Object} birthData - Birth data for Moon sign calculation
   * @param {string} birthData.birthDate - Birth date (DD/MM/YYYY)
   * @param {string} birthData.birthTime - Birth time (HH:MM)
   * @param {string} birthData.birthPlace - Birth place
   * @param {string} options - Calculation options (sidereal/tropical)
   * @returns {Object} Moon sign analysis result
   */
  async execute(birthData, options = {}) {
    try {
      // Input validation
      this._validateInput(birthData);

      // Calculate Moon sign
      const result = await this.calculateMoonSign(birthData, options);

      // Format and return result
      return this._formatResult(result);
    } catch (error) {
      logger.error('MoonSignService error:', error);
      throw new Error(`Moon sign calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate comprehensive Moon sign analysis
   * @param {Object} birthData - Birth data
   * @param {Object} options - Calculation options
   * @returns {Object} Moon sign analysis
   */
  async calculateMoonSign(birthData, options = {}) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;
      const chartType = options.chartType || 'sidereal';

      // Get Moon sign from calculator (using calculateSunSign as base and modifying for Moon)
      const moonSignData = await this._calculateMoonSign(
        birthDate,
        birthTime,
        birthPlace,
        chartType
      );

      // Generate additional analysis
      const moonSignTraits = this._getMoonSignTraits(moonSignData.sign);
      const emotionalNature = this._analyzeEmotionalNature(moonSignData);
      const nakshatraInfluence = this._getNakshatraEmotionalInfluence(moonSignData.nakshatra);
      const psychologicalDisposition = this._assessPsychologicalDisposition(moonSignData, moonSignTraits);
      const lifeAreas = this._identifyLifeAreas(moonSignData.sign);

      return {
        moonSignData,
        moonSignTraits,
        emotionalNature,
        nakshatraInfluence,
        psychologicalDisposition,
        lifeAreas,
        chartType,
        interpretation: this._createMoonSignInterpretation(moonSignData, moonSignTraits, emotionalNature)
      };
    } catch (error) {
      logger.error('Moon sign calculation error:', error);
      throw error;
    }
  }

  /**
   * Calculate Moon sign (adapted from Sun sign calculator)
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time
   * @param {string} birthPlace - Birth place
   * @param {string} chartType - Chart type
   * @returns {Object} Moon sign data
   */
  async _calculateMoonSign(birthDate, birthTime, birthPlace, chartType) {
    // This would ideally use a proper Moon position calculator
    // For now, using a simplified calculation based on birth date
    try {
      const [day, month, year] = birthDate.split('/').map(Number);

      // Simplified Moon sign calculation (Moon moves about 12-13 degrees per day)
      // This is a basic approximation - real calculation needs precise astronomical data
      const dayOfYear = this._getDayOfYear(day, month, year);
      const moonPosition = (dayOfYear * 12.2) % 360; // Approximate Moon movement

      const moonSign = this._getSignFromLongitude(moonPosition);
      const moonNakshatra = this._getNakshatraFromLongitude(moonPosition);

      return {
        sign: moonSign,
        nakshatra: moonNakshatra,
        degree: moonPosition % 30,
        calculationMethod: 'Approximate based on birth date'
      };
    } catch (error) {
      logger.error('Moon sign calculation error:', error);
      return {
        sign: 'Unknown',
        nakshatra: 'Unknown',
        degree: 0,
        calculationMethod: 'Error in calculation'
      };
    }
  }

  /**
   * Get day of year
   * @param {number} day - Day
   * @param {number} month - Month
   * @param {number} year - Year
   * @returns {number} Day of year
   */
  _getDayOfYear(day, month, year) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Adjust for leap year
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
      daysInMonth[1] = 29;
    }

    let dayOfYear = day;
    for (let i = 0; i < month - 1; i++) {
      dayOfYear += daysInMonth[i];
    }

    return dayOfYear;
  }

  /**
   * Get zodiac sign from longitude
   * @param {number} longitude - Longitude in degrees
   * @returns {string} Zodiac sign
   */
  _getSignFromLongitude(longitude) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    const signIndex = Math.floor(longitude / 30) % 12;
    return signs[signIndex];
  }

  /**
   * Get nakshatra from longitude
   * @param {number} longitude - Longitude in degrees
   * @returns {string} Nakshatra name
   */
  _getNakshatraFromLongitude(longitude) {
    const nakshatras = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
      'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
      'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
      'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];

    const nakshatraIndex = Math.floor(longitude / (360 / 27)) % 27;
    return nakshatras[nakshatraIndex];
  }

  /**
   * Get Moon sign personality and emotional traits
   * @param {string} moonSign - Moon sign name
   * @returns {Object} Moon sign traits
   */
  _getMoonSignTraits(moonSign) {
    const traits = {
      Aries: {
        emotionalNature: 'Direct and impulsive',
        mindPattern: 'Quick-thinking and decisive',
        psychologicalDisposition: 'Independent and self-reliant',
        needs: 'Freedom and excitement',
        fears: 'Being controlled or restricted',
        respondsTo: 'Challenges and new experiences',
        copingMechanism: 'Physical activity and direct action'
      },
      Taurus: {
        emotionalNature: 'Stable and sensual',
        mindPattern: 'Practical and methodical',
        psychologicalDisposition: 'Patient and reliable',
        needs: 'Security and comfort',
        fears: 'Sudden change and instability',
        respondsTo: 'Beauty and sensory pleasures',
        copingMechanism: 'Creating stability and routine'
      },
      Gemini: {
        emotionalNature: 'Versatile and communicative',
        mindPattern: 'Curious and adaptable',
        psychologicalDisposition: 'Intellectual and social',
        needs: 'Mental stimulation and variety',
        fears: 'Boredom and routine',
        respondsTo: 'New ideas and social interaction',
        copingMechanism: 'Talking through feelings and seeking distraction'
      },
      Cancer: {
        emotionalNature: 'Deeply feeling and nurturing',
        mindPattern: 'Intuitive and protective',
        psychologicalDisposition: 'Sensitive and caring',
        needs: 'Emotional security and family',
        fears: 'Rejection and abandonment',
        respondsTo: 'Love and emotional support',
        copingMechanism: 'Retreating to safe emotional spaces'
      },
      Leo: {
        emotionalNature: 'Warm and generous',
        mindPattern: 'Creative and confident',
        psychologicalDisposition: 'Proud and expressive',
        needs: 'Recognition and appreciation',
        fears: 'Being ignored or unvalued',
        respondsTo: 'Praise and admiration',
        copingMechanism: 'Self-expression and creative outlets'
      },
      Virgo: {
        emotionalNature: 'Practical and analytical',
        mindPattern: 'Detail-oriented and helpful',
        psychologicalDisposition: 'Perfectionist and service-oriented',
        needs: 'Order and usefulness',
        fears: 'Criticism and imperfection',
        respondsTo: 'Being needed and appreciated',
        copingMechanism: 'Organization and problem-solving'
      },
      Libra: {
        emotionalNature: 'Harmonious and diplomatic',
        mindPattern: 'Balanced and fair-minded',
        psychologicalDisposition: 'Cooperative and relationship-focused',
        needs: 'Harmony and partnership',
        fears: 'Conflict and disharmony',
        respondsTo: 'Beauty and peaceful environments',
        copingMechanism: 'Seeking compromise and mediation'
      },
      Scorpio: {
        emotionalNature: 'Intense and passionate',
        mindPattern: 'Deep and investigative',
        psychologicalDisposition: 'Powerful and transformative',
        needs: 'Depth and intimacy',
        fears: 'Vulnerability and betrayal',
        respondsTo: 'Emotional intensity and truth',
        copingMechanism: 'Deep introspection and transformation'
      },
      Sagittarius: {
        emotionalNature: 'Optimistic and freedom-loving',
        mindPattern: 'Philosophical and adventurous',
        psychologicalDisposition: 'Expansive and truth-seeking',
        needs: 'Freedom and exploration',
        fears: 'Being trapped or limited',
        respondsTo: 'Adventure and new horizons',
        copingMechanism: 'Seeking broader perspectives and travel'
      },
      Capricorn: {
        emotionalNature: 'Reserved and disciplined',
        mindPattern: 'Practical and ambitious',
        psychologicalDisposition: 'Responsible and structured',
        needs: 'Achievement and security',
        fears: 'Failure and emotional exposure',
        respondsTo: 'Recognition and accomplishment',
        copingMechanism: 'Structure and long-term planning'
      },
      Aquarius: {
        emotionalNature: 'Detached and humanitarian',
        mindPattern: 'Innovative and independent',
        psychologicalDisposition: 'Progressive and unconventional',
        needs: 'Freedom and intellectual connection',
        fears: 'Emotional confinement and conformity',
        respondsTo: 'Ideas and social causes',
        copingMechanism: 'Intellectual analysis and detachment'
      },
      Pisces: {
        emotionalNature: 'Compassionate and dreamy',
        mindPattern: 'Intuitive and imaginative',
        psychologicalDisposition: 'Empathetic and spiritual',
        needs: 'Emotional connection and escape',
        fears: 'Harsh reality and rejection',
        respondsTo: 'Art, music, and spiritual experiences',
        copingMechanism: 'Imagination and creative expression'
      }
    };

    return traits[moonSign] || {
      emotionalNature: 'Unique emotional expression',
      mindPattern: 'Individual thought processes',
      psychologicalDisposition: 'Personal psychological makeup',
      needs: 'Individual emotional requirements',
      fears: 'Personal emotional challenges',
      respondsTo: 'Unique emotional triggers',
      copingMechanism: 'Personal coping strategies'
    };
  }

  /**
   * Analyze emotional nature based on Moon sign data
   * @param {Object} moonSignData - Moon sign data
   * @returns {Object} Emotional nature analysis
   */
  _analyzeEmotionalNature(moonSignData) {
    const { sign } = moonSignData;
    const traits = this._getMoonSignTraits(sign);

    return {
      primaryEmotion: traits.emotionalNature,
      emotionalSecurity: this._getEmotionalSecurity(sign),
      emotionalExpression: this._getEmotionalExpression(sign),
      vulnerabilityAreas: this._getVulnerabilityAreas(sign),
      strengthAreas: this._getEmotionalStrengths(sign)
    };
  }

  /**
   * Get emotional security description
   * @param {string} sign - Moon sign
   * @returns {string} Emotional security description
   */
  _getEmotionalSecurity(sign) {
    const securities = {
      Aries: 'Finds security in independence and self-reliance',
      Taurus: 'Finds security in stability and material comfort',
      Gemini: 'Finds security in mental stimulation and social connections',
      Cancer: 'Finds security in emotional bonds and family',
      Leo: 'Finds security in recognition and self-expression',
      Virgo: 'Finds security in order and being useful',
      Libra: 'Finds security in harmonious relationships',
      Scorpio: 'Finds security in deep emotional intimacy',
      Sagittarius: 'Finds security in freedom and philosophical understanding',
      Capricorn: 'Finds security in achievement and responsibility',
      Aquarius: 'Finds security in intellectual freedom and community',
      Pisces: 'Finds security in compassion and spiritual connection'
    };

    return securities[sign] || 'Finds security in personal emotional patterns';
  }

  /**
   * Get emotional expression style
   * @param {string} sign - Moon sign
   * @returns {string} Emotional expression description
   */
  _getEmotionalExpression(sign) {
    const expressions = {
      Aries: 'Direct and immediate emotional responses',
      Taurus: 'Slow to anger but deeply loyal emotionally',
      Gemini: 'Expressive through words and communication',
      Cancer: 'Deeply feeling with strong intuitive responses',
      Leo: 'Dramatic and generous emotional expression',
      Virgo: 'Practical and helpful emotional support',
      Libra: 'Diplomatic and harmony-seeking emotional style',
      Scorpio: 'Intense and transformative emotional depth',
      Sagittarius: 'Optimistic and freedom-loving emotional outlook',
      Capricorn: 'Reserved but deeply committed emotionally',
      Aquarius: 'Detached yet humanitarian emotional perspective',
      Pisces: 'Compassionate and spiritually connected emotions'
    };

    return expressions[sign] || 'Unique emotional expression style';
  }

  /**
   * Get vulnerability areas
   * @param {string} sign - Moon sign
   * @returns {Array} Vulnerability areas
   */
  _getVulnerabilityAreas(sign) {
    const vulnerabilities = {
      Aries: ['Impatience with emotional processes', 'Quick to anger when feeling vulnerable'],
      Taurus: ['Resistance to change', 'Difficulty expressing deep emotions'],
      Gemini: ['Emotional superficiality', 'Difficulty with deep emotional commitment'],
      Cancer: ['Mood swings', 'Over-sensitivity to rejection'],
      Leo: ['Need for constant validation', 'Difficulty accepting criticism'],
      Virgo: ['Over-worrying', 'Self-critical emotional patterns'],
      Libra: ['Indecision in emotional matters', 'Avoiding conflict at all costs'],
      Scorpio: ['Intensity overwhelming others', 'Trust issues from past hurts'],
      Sagittarius: ['Commitment phobia', 'Running from emotional depth'],
      Capricorn: ['Emotional repression', 'Difficulty showing vulnerability'],
      Aquarius: ['Emotional detachment', 'Intellectualizing feelings'],
      Pisces: ['Emotional boundary issues', 'Escaping into fantasy']
    };

    return vulnerabilities[sign] || ['Individual emotional challenges'];
  }

  /**
   * Get emotional strengths
   * @param {string} sign - Moon sign
   * @returns {Array} Emotional strengths
   */
  _getEmotionalStrengths(sign) {
    const strengths = {
      Aries: ['Honest emotional expression', 'Quick recovery from setbacks'],
      Taurus: ['Steady emotional support', 'Loyal and dependable'],
      Gemini: ['Emotional adaptability', 'Good communication of feelings'],
      Cancer: ['Deep empathy and care', 'Strong intuitive abilities'],
      Leo: ['Generous emotional nature', 'Creative emotional expression'],
      Virgo: ['Practical emotional support', 'Helpful and caring approach'],
      Libra: ['Harmonious emotional connections', 'Diplomatic conflict resolution'],
      Scorpio: ['Deep emotional commitment', 'Powerful transformative abilities'],
      Sagittarius: ['Optimistic emotional outlook', 'Philosophical perspective on emotions'],
      Capricorn: ['Emotional responsibility', 'Long-term commitment abilities'],
      Aquarius: ['Humanitarian emotional concerns', 'Intellectual emotional processing'],
      Pisces: ['Compassionate emotional nature', 'Spiritual emotional connection']
    };

    return strengths[sign] || ['Unique emotional strengths'];
  }

  /**
   * Get nakshatra emotional influence
   * @param {string} nakshatra - Nakshatra name
   * @returns {Object} Nakshatra emotional influence
   */
  _getNakshatraEmotionalInfluence(nakshatra) {
    const influences = {
      Rohini: { emotion: 'Nurturing and sensual', influence: 'Emotional nourishment and growth' },
      Pushya: { emotion: 'Protective and caring', influence: 'Emotional security and support' },
      Ashlesha: { emotion: 'Intense and transformative', influence: 'Deep emotional processing' },
      Magha: { emotion: 'Proud and ancestral', influence: 'Emotional connection to heritage' },
      Hasta: { emotion: 'Skillful and adaptable', influence: 'Emotional dexterity and healing' },
      Swati: { emotion: 'Balanced and independent', influence: 'Emotional equilibrium' },
      Anuradha: { emotion: 'Devotional and friendly', influence: 'Emotional commitment and loyalty' },
      Mula: { emotion: 'Intense and foundational', influence: 'Emotional transformation and rebirth' },
      Shravana: { emotion: 'Learning and receptive', influence: 'Emotional wisdom and understanding' },
      Dhanishta: { emotion: 'Prosperous and rhythmic', influence: 'Emotional abundance and celebration' },
      Revati: { emotion: 'Guiding and compassionate', influence: 'Emotional healing and guidance' }
    };

    return influences[nakshatra] || {
      emotion: 'Unique emotional quality',
      influence: 'Special emotional influence'
    };
  }

  /**
   * Assess psychological disposition
   * @param {Object} moonSignData - Moon sign data
   * @param {Object} traits - Moon sign traits
   * @returns {Object} Psychological assessment
   */
  _assessPsychologicalDisposition(moonSignData, traits) {
    return {
      coreDisposition: traits.psychologicalDisposition,
      mentalPatterns: this._getMentalPatterns(moonSignData.sign),
      copingStrategies: traits.copingMechanism,
      growthAreas: this._getPsychologicalGrowthAreas(moonSignData.sign),
      naturalTalents: this._getNaturalPsychologicalTalents(moonSignData.sign)
    };
  }

  /**
   * Get mental patterns
   * @param {string} sign - Moon sign
   * @returns {string} Mental pattern description
   */
  _getMentalPatterns(sign) {
    const patterns = {
      Aries: 'Quick decision-making with impulsive tendencies',
      Taurus: 'Practical thinking with preference for stability',
      Gemini: 'Versatile mental processing with need for variety',
      Cancer: 'Intuitive thinking with strong emotional intelligence',
      Leo: 'Creative thinking with need for self-expression',
      Virgo: 'Analytical thinking with attention to detail',
      Libra: 'Balanced thinking with focus on harmony',
      Scorpio: 'Deep thinking with investigative nature',
      Sagittarius: 'Expansive thinking with philosophical bent',
      Capricorn: 'Structured thinking with long-term planning',
      Aquarius: 'Innovative thinking with humanitarian focus',
      Pisces: 'Imaginative thinking with spiritual awareness'
    };

    return patterns[sign] || 'Individual mental processing patterns';
  }

  /**
   * Get psychological growth areas
   * @param {string} sign - Moon sign
   * @returns {Array} Growth areas
   */
  _getPsychologicalGrowthAreas(sign) {
    const growthAreas = {
      Aries: ['Patience with emotional processes', 'Developing emotional depth'],
      Taurus: ['Embracing change', 'Expressing deep emotions'],
      Gemini: ['Deepening emotional commitment', 'Focusing emotional energy'],
      Cancer: ['Managing emotional sensitivity', 'Setting emotional boundaries'],
      Leo: ['Accepting constructive criticism', 'Balancing self-expression with listening'],
      Virgo: ['Reducing self-criticism', 'Trusting emotional instincts'],
      Libra: ['Making independent decisions', 'Facing necessary conflicts'],
      Scorpio: ['Managing emotional intensity', 'Building trust gradually'],
      Sagittarius: ['Committing to emotional relationships', 'Developing emotional patience'],
      Capricorn: ['Expressing emotional vulnerability', 'Balancing work and emotional needs'],
      Aquarius: ['Connecting emotionally with others', 'Balancing intellect and emotion'],
      Pisces: ['Maintaining emotional boundaries', 'Grounding emotional sensitivity']
    };

    return growthAreas[sign] || ['Personal psychological development'];
  }

  /**
   * Get natural psychological talents
   * @param {string} sign - Moon sign
   * @returns {Array} Natural talents
   */
  _getNaturalPsychologicalTalents(sign) {
    const talents = {
      Aries: ['Direct emotional communication', 'Quick emotional recovery'],
      Taurus: ['Providing emotional stability', 'Sensual emotional connection'],
      Gemini: ['Emotional adaptability', 'Communicating complex feelings'],
      Cancer: ['Emotional intuition', 'Nurturing emotional support'],
      Leo: ['Emotional generosity', 'Creative emotional expression'],
      Virgo: ['Emotional analysis', 'Practical emotional help'],
      Libra: ['Emotional diplomacy', 'Creating emotional harmony'],
      Scorpio: ['Emotional depth', 'Transformative emotional insight'],
      Sagittarius: ['Emotional optimism', 'Philosophical emotional perspective'],
      Capricorn: ['Emotional responsibility', 'Long-term emotional commitment'],
      Aquarius: ['Emotional innovation', 'Humanitarian emotional concern'],
      Pisces: ['Emotional compassion', 'Spiritual emotional connection']
    };

    return talents[sign] || ['Unique psychological abilities'];
  }

  /**
   * Identify life areas influenced by Moon sign
   * @param {string} sign - Moon sign
   * @returns {Object} Life areas
   */
  _identifyLifeAreas(sign) {
    const lifeAreas = {
      Aries: {
        home: 'Needs independence and personal space',
        relationships: 'Direct and passionate emotional connections',
        career: 'Leadership and pioneering roles',
        health: 'Physical activity and stress management'
      },
      Taurus: {
        home: 'Creates stable and comfortable environments',
        relationships: 'Loyal and sensual partnerships',
        career: 'Practical and steady professional paths',
        health: 'Physical well-being and sensory balance'
      },
      Gemini: {
        home: 'Needs mental stimulation and variety',
        relationships: 'Communicative and intellectually engaging',
        career: 'Versatile and communicative professions',
        health: 'Nervous system and respiratory health'
      },
      Cancer: {
        home: 'Emotional sanctuary and family focus',
        relationships: 'Deeply nurturing and protective bonds',
        career: 'Caring and supportive professional roles',
        health: 'Digestive and emotional health connection'
      },
      Leo: {
        home: 'Creative and expressive living spaces',
        relationships: 'Generous and affectionate connections',
        career: 'Creative and leadership positions',
        health: 'Heart and circulatory system'
      },
      Virgo: {
        home: 'Orderly and functional living environment',
        relationships: 'Practical and helpful partnerships',
        career: 'Service and analytical professional roles',
        health: 'Digestive system and nervous health'
      },
      Libra: {
        home: 'Harmonious and aesthetically pleasing spaces',
        relationships: 'Balanced and diplomatic partnerships',
        career: 'Cooperative and relationship-focused roles',
        health: 'Kidney and hormonal balance'
      },
      Scorpio: {
        home: 'Private and transformative personal spaces',
        relationships: 'Intense and deeply committed bonds',
        career: 'Investigative and transformative professions',
        health: 'Reproductive and regenerative systems'
      },
      Sagittarius: {
        home: 'Spacious and exploratory living areas',
        relationships: 'Freedom-loving and philosophical connections',
        career: 'Adventurous and knowledge-based roles',
        health: 'Liver and mobility'
      },
      Capricorn: {
        home: 'Structured and achievement-oriented spaces',
        relationships: 'Responsible and long-term commitments',
        career: 'Leadership and structured professional paths',
        health: 'Skeletal and structural health'
      },
      Aquarius: {
        home: 'Innovative and community-oriented spaces',
        relationships: 'Independent and intellectually stimulating',
        career: 'Progressive and humanitarian professions',
        health: 'Circulatory and nervous systems'
      },
      Pisces: {
        home: 'Dreamy and spiritually connected environments',
        relationships: 'Compassionate and spiritually bonded',
        career: 'Creative and service-oriented roles',
        health: 'Immune and spiritual health connection'
      }
    };

    return lifeAreas[sign] || {
      home: 'Personal living preferences',
      relationships: 'Emotional connection patterns',
      career: 'Professional inclinations',
      health: 'Wellness focus areas'
    };
  }

  /**
   * Create comprehensive Moon sign interpretation
   * @param {Object} moonSignData - Moon sign data
   * @param {Object} traits - Moon sign traits
   * @param {Object} emotionalNature - Emotional nature analysis
   * @returns {string} Complete interpretation
   */
  _createMoonSignInterpretation(moonSignData, traits, emotionalNature) {
    let interpretation = `Your Moon sign is ${moonSignData.sign}, indicating ${traits.emotionalNature} emotional patterns. `;

    interpretation += `Your mind operates with ${traits.mindPattern} tendencies, and you have a ${traits.psychologicalDisposition} psychological disposition. `;

    interpretation += `Emotionally, you ${emotionalNature.emotionalSecurity.toLowerCase()}, responding best to ${traits.respondsTo.toLowerCase()}. `;

    interpretation += `Your Moon's placement in ${moonSignData.nakshatra} nakshatra adds ${this._getNakshatraEmotionalInfluence(moonSignData.nakshatra).emotion.toLowerCase()} qualities to your emotional nature.`;

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

    const { birthDate, birthTime, birthPlace } = input;

    if (!birthDate || typeof birthDate !== 'string') {
      throw new Error('Valid birth date (DD/MM/YYYY format) is required');
    }

    if (!birthTime || typeof birthTime !== 'string') {
      throw new Error('Valid birth time (HH:MM format) is required');
    }

    if (!birthPlace || typeof birthPlace !== 'string') {
      throw new Error('Valid birth place is required');
    }

    // Validate date format
    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!dateRegex.test(birthDate)) {
      throw new Error('Birth date must be in DD/MM/YYYY format');
    }

    // Validate time format
    const timeRegex = /^\d{1,2}:\d{1,2}$/;
    if (!timeRegex.test(birthTime)) {
      throw new Error('Birth time must be in HH:MM format');
    }
  }

  /**
   * Format result for presentation
   * @param {Object} result - Raw Moon sign result
   * @returns {Object} Formatted result
   */
  _formatResult(result) {
    return {
      service: 'Moon Sign Analysis',
      timestamp: new Date().toISOString(),
      moonSign: {
        basic: result.moonSignData,
        traits: result.moonSignTraits,
        emotionalNature: result.emotionalNature,
        nakshatraInfluence: result.nakshatraInfluence,
        psychologicalDisposition: result.psychologicalDisposition,
        lifeAreas: result.lifeAreas,
        chartType: result.chartType
      },
      interpretation: result.interpretation,
      disclaimer: 'Moon sign analysis reveals emotional patterns and psychological tendencies. Individual emotional experiences are influenced by the entire birth chart. Astrology provides insights for self-understanding and emotional growth.'
    };
  }
}

module.exports = MoonSignService;
