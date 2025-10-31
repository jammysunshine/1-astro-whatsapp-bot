const { SignCalculator } = require('../../services/astrology/vedic/calculators/SignCalculator');
const logger = require('../../../utils/logger');

/**
 * CalculateNakshatraService - Service for nakshatra calculation and interpretation
 * Identifies the lunar mansion (nakshatra) based on Moon's precise position, including nakshatra lord, pada (quarter), and traditional interpretations
 */
class CalculateNakshatraService {
  constructor() {
    this.calculator = new SignCalculator();
    logger.info('CalculateNakshatraService initialized');
  }

  /**
   * Execute nakshatra calculation and analysis
   * @param {Object} birthData - Birth data for nakshatra calculation
   * @param {string} birthData.birthDate - Birth date (DD/MM/YYYY)
   * @param {string} birthData.birthTime - Birth time (HH:MM)
   * @param {string} birthData.birthPlace - Birth place
   * @param {string} options - Calculation options
   * @returns {Object} Nakshatra analysis result
   */
  async execute(birthData, options = {}) {
    try {
      // Input validation
      this._validateInput(birthData);

      // Calculate nakshatra
      const result = await this.calculateNakshatra(birthData, options);

      // Format and return result
      return this._formatResult(result);
    } catch (error) {
      logger.error('CalculateNakshatraService error:', error);
      throw new Error(`Nakshatra calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate comprehensive nakshatra analysis
   * @param {Object} birthData - Birth data
   * @param {Object} options - Calculation options
   * @returns {Object} Nakshatra analysis
   */
  async calculateNakshatra(birthData, options = {}) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;
      const chartType = options.chartType || 'sidereal';

      // Calculate nakshatra (simplified calculation)
      const nakshatraData = await this._calculateNakshatra(
        birthDate,
        birthTime,
        birthPlace,
        chartType
      );

      // Generate additional analysis
      const nakshatraTraits = this._getNakshatraTraits(nakshatraData.nakshatra);
      const rulingPlanet = this._getNakshatraRulingPlanet(nakshatraData.nakshatra);
      const padaAnalysis = this._analyzePada(nakshatraData.pada);
      const symbolism = this._getNakshatraSymbolism(nakshatraData.nakshatra);
      const lifePurpose = this._identifyLifePurpose(nakshatraData.nakshatra);

      return {
        nakshatraData,
        nakshatraTraits,
        rulingPlanet,
        padaAnalysis,
        symbolism,
        lifePurpose,
        chartType,
        interpretation: this._createNakshatraInterpretation(nakshatraData, nakshatraTraits, rulingPlanet)
      };
    } catch (error) {
      logger.error('Nakshatra calculation error:', error);
      throw error;
    }
  }

  /**
   * Calculate nakshatra based on birth data
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time
   * @param {string} birthPlace - Birth place
   * @param {string} chartType - Chart type
   * @returns {Object} Nakshatra data
   */
  async _calculateNakshatra(birthDate, birthTime, birthPlace, chartType) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Simplified nakshatra calculation
      // Each nakshatra spans 13°20' (800' or about 13.333 degrees)
      // There are 27 nakshatras covering 360 degrees

      // Calculate approximate Moon position (simplified)
      const dayOfYear = this._getDayOfYear(day, month, year);
      const timeInHours = hour + (minute / 60);
      const moonPosition = (dayOfYear * 12.2 + timeInHours * 0.5) % 360;

      const nakshatraIndex = Math.floor(moonPosition / (360 / 27));
      const nakshatraPosition = moonPosition % (360 / 27);
      const pada = Math.floor((nakshatraPosition / (360 / 27)) * 4) + 1;

      const nakshatras = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
        'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
        'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
        'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
        'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
      ];

      const nakshatra = nakshatras[nakshatraIndex];

      return {
        nakshatra,
        pada,
        degree: Math.round((nakshatraPosition / (360 / 27) * 13.333) * 100) / 100,
        calculationMethod: 'Approximate based on birth date and time',
        notes: 'Nakshatra calculation requires precise astronomical Moon positioning'
      };
    } catch (error) {
      logger.error('Nakshatra calculation error:', error);
      return {
        nakshatra: 'Unknown',
        pada: 1,
        degree: 0,
        calculationMethod: 'Error in calculation',
        notes: 'Unable to calculate nakshatra'
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
   * Get nakshatra personality traits and characteristics
   * @param {string} nakshatra - Nakshatra name
   * @returns {Object} Nakshatra traits
   */
  _getNakshatraTraits(nakshatra) {
    const traits = {
      Ashwini: {
        nature: 'Light',
        gender: 'Female',
        caste: 'Warrior',
        direction: 'South',
        qualities: ['Swift', 'Healing', 'Independent', 'Medical inclination'],
        challenges: ['Impatience', 'Restlessness', 'Quick temper'],
        strengths: ['Speed', 'Initiative', 'Healing abilities', 'Leadership']
      },
      Bharani: {
        nature: 'Fierce',
        gender: 'Female',
        caste: 'Warrior',
        direction: 'South',
        qualities: ['Creative', 'Transformative', 'Responsible', 'Nurturing'],
        challenges: ['Intensity', 'Possessiveness', 'Emotional depth'],
        strengths: ['Creativity', 'Transformation', 'Commitment', 'Protection']
      },
      Krittika: {
        nature: 'Mixed',
        gender: 'Female',
        caste: 'Warrior',
        direction: 'East',
        qualities: ['Sharp', 'Purifying', 'Determined', 'Critical'],
        challenges: ['Harshness', 'Impatience', 'Critical nature'],
        strengths: ['Clarity', 'Purification', 'Achievement', 'Analysis']
      },
      Rohini: {
        nature: 'Fixed',
        gender: 'Female',
        caste: 'Trader',
        direction: 'East',
        qualities: ['Beautiful', 'Nurturing', 'Prosperous', 'Stable'],
        challenges: ['Material attachment', 'Pride', 'Stubbornness'],
        strengths: ['Beauty', 'Growth', 'Prosperity', 'Stability']
      },
      Mrigashira: {
        nature: 'Soft',
        gender: 'Neutral',
        caste: 'Servant',
        direction: 'South',
        qualities: ['Searching', 'Gentle', 'Adaptable', 'Curious'],
        challenges: ['Indecision', 'Restlessness', 'Superficiality'],
        strengths: ['Search', 'Gentleness', 'Adaptability', 'Learning']
      },
      Ardra: {
        nature: 'Fierce',
        gender: 'Female',
        caste: 'Servant',
        direction: 'North',
        qualities: ['Stormy', 'Destructive', 'Creative', 'Intense'],
        challenges: ['Destruction', 'Emotional turmoil', 'Instability'],
        strengths: ['Transformation', 'Creativity', 'Depth', 'Cleansing']
      },
      Punarvasu: {
        nature: 'Moveable',
        gender: 'Male',
        caste: 'Trader',
        direction: 'North',
        qualities: ['Returning', 'Expansive', 'Wise', 'Nurturing'],
        challenges: ['Indecision', 'Changeability', 'Over-optimism'],
        strengths: ['Renewal', 'Wisdom', 'Expansion', 'Care']
      },
      Pushya: {
        nature: 'Light',
        gender: 'Male',
        caste: 'Servant',
        direction: 'North',
        qualities: ['Nourishing', 'Protective', 'Spiritual', 'Prosperous'],
        challenges: ['Over-protection', 'Material focus', 'Rigidity'],
        strengths: ['Nourishment', 'Protection', 'Spirituality', 'Prosperity']
      },
      Ashlesha: {
        nature: 'Fierce',
        gender: 'Female',
        caste: 'Servant',
        direction: 'South',
        qualities: ['Mysterious', 'Wise', 'Healing', 'Transformative'],
        challenges: ['Manipulation', 'Secretiveness', 'Intensity'],
        strengths: ['Wisdom', 'Healing', 'Transformation', 'Intuition']
      },
      Magha: {
        nature: 'Fierce',
        gender: 'Male',
        caste: 'Warrior',
        direction: 'South',
        qualities: ['Royal', 'Ancestral', 'Proud', 'Authoritative'],
        challenges: ['Pride', 'Authority issues', 'Material ambition'],
        strengths: ['Royalty', 'Ancestral wisdom', 'Leadership', 'Dignity']
      },
      'Purva Phalguni': {
        nature: 'Fixed',
        gender: 'Female',
        caste: 'Trader',
        direction: 'East',
        qualities: ['Pleasurable', 'Creative', 'Romantic', 'Sociable'],
        challenges: ['Over-indulgence', 'Laziness', 'Superficiality'],
        strengths: ['Pleasure', 'Creativity', 'Romance', 'Social grace']
      },
      'Uttara Phalguni': {
        nature: 'Fixed',
        gender: 'Male',
        caste: 'Trader',
        direction: 'East',
        qualities: ['Beneficial', 'Friendly', 'Prosperous', 'Service-oriented'],
        challenges: ['People-pleasing', 'Dependency', 'Indecision'],
        strengths: ['Benefits', 'Friendship', 'Prosperity', 'Service']
      },
      Hasta: {
        nature: 'Light',
        gender: 'Female',
        caste: 'Servant',
        direction: 'North',
        qualities: ['Skilled', 'Crafty', 'Healing', 'Precise'],
        challenges: ['Nervousness', 'Over-thinking', 'Perfectionism'],
        strengths: ['Skill', 'Craftsmanship', 'Healing', 'Precision']
      },
      Chitra: {
        nature: 'Soft',
        gender: 'Female',
        caste: 'Warrior',
        direction: 'North',
        qualities: ['Beautiful', 'Creative', 'Dynamic', 'Skillful'],
        challenges: ['Impatience', 'Competitiveness', 'Restlessness'],
        strengths: ['Beauty', 'Creativity', 'Skill', 'Achievement']
      },
      Swati: {
        nature: 'Fixed',
        gender: 'Female',
        caste: 'Servant',
        direction: 'West',
        qualities: ['Independent', 'Balanced', 'Peaceful', 'Self-reliant'],
        challenges: ['Indecision', 'Detachment', 'Over-independence'],
        strengths: ['Independence', 'Balance', 'Peace', 'Self-reliance']
      },
      Vishakha: {
        nature: 'Mixed',
        gender: 'Male',
        caste: 'Servant',
        direction: 'West',
        qualities: ['Goal-oriented', 'Focused', 'Determined', 'Social'],
        challenges: ['Manipulation', 'Control issues', 'Competitiveness'],
        strengths: ['Achievement', 'Focus', 'Determination', 'Social skills']
      },
      Anuradha: {
        nature: 'Soft',
        gender: 'Male',
        caste: 'Servant',
        direction: 'West',
        qualities: ['Devotional', 'Friendly', 'Successful', 'Harmonious'],
        challenges: ['Over-friendliness', 'Dependency', 'Conformity'],
        strengths: ['Devotion', 'Friendship', 'Success', 'Harmony']
      },
      Jyeshtha: {
        nature: 'Fierce',
        gender: 'Male',
        caste: 'Warrior',
        direction: 'North',
        qualities: ['Eldest', 'Authoritative', 'Wise', 'Protective'],
        challenges: ['Authority conflicts', 'Jealousy', 'Control issues'],
        strengths: ['Authority', 'Wisdom', 'Protection', 'Leadership']
      },
      Mula: {
        nature: 'Fierce',
        gender: 'Neutral',
        caste: 'Servant',
        direction: 'North',
        qualities: ['Foundational', 'Destructive', 'Transformative', 'Wise'],
        challenges: ['Destruction', 'Isolation', 'Intensity'],
        strengths: ['Foundation', 'Transformation', 'Wisdom', 'Research']
      },
      'Purva Ashadha': {
        nature: 'Fixed',
        gender: 'Male',
        caste: 'Warrior',
        direction: 'South',
        qualities: ['Invincible', 'Victorious', 'Spiritual', 'Dynamic'],
        challenges: ['Over-confidence', 'Impatience', 'Competitiveness'],
        strengths: ['Invincibility', 'Victory', 'Spirituality', 'Energy']
      },
      'Uttara Ashadha': {
        nature: 'Fixed',
        gender: 'Male',
        caste: 'Warrior',
        direction: 'South',
        qualities: ['Universal', 'Beneficial', 'Leadership', 'Ethical'],
        challenges: ['Perfectionism', 'High expectations', 'Rigidity'],
        strengths: ['Universality', 'Benefits', 'Leadership', 'Ethics']
      },
      Shravana: {
        nature: 'Moveable',
        gender: 'Male',
        caste: 'Servant',
        direction: 'West',
        qualities: ['Hearing', 'Learning', 'Devotional', 'Fame'],
        challenges: ['Over-sensitivity', 'Perfectionism', 'Isolation'],
        strengths: ['Learning', 'Devotion', 'Fame', 'Wisdom']
      },
      Dhanishta: {
        nature: 'Fixed',
        gender: 'Female',
        caste: 'Servant',
        direction: 'West',
        qualities: ['Wealthy', 'Rhythmic', 'Musical', 'Prosperous'],
        challenges: ['Material focus', 'Restlessness', 'Superficiality'],
        strengths: ['Wealth', 'Rhythm', 'Music', 'Prosperity']
      },
      Shatabhisha: {
        nature: 'Fixed',
        gender: 'Neutral',
        caste: 'Servant',
        direction: 'South',
        qualities: ['Healing', 'Protective', 'Independent', 'Mysterious'],
        challenges: ['Detachment', 'Secretiveness', 'Rebellion'],
        strengths: ['Healing', 'Protection', 'Independence', 'Mystery']
      },
      'Purva Bhadrapada': {
        nature: 'Fierce',
        gender: 'Male',
        caste: 'Warrior',
        direction: 'East',
        qualities: ['Burning', 'Transformative', 'Spiritual', 'Intense'],
        challenges: ['Intensity', 'Destruction', 'Emotional turmoil'],
        strengths: ['Purification', 'Transformation', 'Spirituality', 'Power']
      },
      'Uttara Bhadrapada': {
        nature: 'Fixed',
        gender: 'Male',
        caste: 'Servant',
        direction: 'East',
        qualities: ['Foundation', 'Support', 'Spiritual', 'Liberation'],
        challenges: ['Rigidity', 'Detachment', 'Perfectionism'],
        strengths: ['Foundation', 'Support', 'Spirituality', 'Liberation']
      },
      Revati: {
        nature: 'Soft',
        gender: 'Female',
        caste: 'Servant',
        direction: 'West',
        qualities: ['Prosperous', 'Guiding', 'Compassionate', 'Wealthy'],
        challenges: ['Over-giving', 'Boundary issues', 'Material attachment'],
        strengths: ['Prosperity', 'Guidance', 'Compassion', 'Wealth']
      }
    };

    return traits[nakshatra] || {
      nature: 'Unknown',
      gender: 'Unknown',
      caste: 'Unknown',
      direction: 'Unknown',
      qualities: ['Unique qualities'],
      challenges: ['Individual challenges'],
      strengths: ['Personal strengths']
    };
  }

  /**
   * Get nakshatra ruling planet
   * @param {string} nakshatra - Nakshatra name
   * @returns {Object} Ruling planet information
   */
  _getNakshatraRulingPlanet(nakshatra) {
    const rulingPlanets = {
      Ashwini: 'Ketu',
      Bharani: 'Venus',
      Krittika: 'Sun',
      Rohini: 'Moon',
      Mrigashira: 'Mars',
      Ardra: 'Rahu',
      Punarvasu: 'Jupiter',
      Pushya: 'Saturn',
      Ashlesha: 'Mercury',
      Magha: 'Ketu',
      'Purva Phalguni': 'Venus',
      'Uttara Phalguni': 'Sun',
      Hasta: 'Moon',
      Chitra: 'Mars',
      Swati: 'Rahu',
      Vishakha: 'Jupiter',
      Anuradha: 'Saturn',
      Jyeshtha: 'Mercury',
      Mula: 'Ketu',
      'Purva Ashadha': 'Venus',
      'Uttara Ashadha': 'Sun',
      Shravana: 'Moon',
      Dhanishta: 'Mars',
      Shatabhisha: 'Rahu',
      'Purva Bhadrapada': 'Jupiter',
      'Uttara Bhadrapada': 'Saturn',
      Revati: 'Mercury'
    };

    const planet = rulingPlanets[nakshatra] || 'Unknown';

    const planetInfo = {
      Ketu: {
        energy: 'Spiritual and dissolving',
        influence: 'Liberation, detachment, and spiritual insight',
        qualities: 'Wisdom, detachment, and spiritual growth'
      },
      Venus: {
        energy: 'Harmonious and sensual',
        influence: 'Love, beauty, and material comfort',
        qualities: 'Charm, diplomacy, and aesthetic appreciation'
      },
      Sun: {
        energy: 'Radiant and authoritative',
        influence: 'Identity, confidence, and creative self-expression',
        qualities: 'Charisma, generosity, and natural leadership'
      },
      Moon: {
        energy: 'Emotional and nurturing',
        influence: 'Feelings, intuition, and subconscious patterns',
        qualities: 'Sensitivity, empathy, and emotional intelligence'
      },
      Mars: {
        energy: 'Dynamic and assertive',
        influence: 'Action, courage, and physical vitality',
        qualities: 'Leadership, determination, and competitive spirit'
      },
      Rahu: {
        energy: 'Ambitious and unconventional',
        influence: 'Innovation, foreign elements, and material ambition',
        qualities: 'Originality, progressiveness, and worldly success'
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
      Mercury: {
        energy: 'Intellectual and communicative',
        influence: 'Logic, learning, and social interaction',
        qualities: 'Adaptability, wit, and analytical thinking'
      }
    };

    return planetInfo[planet] || {
      energy: 'Unique cosmic influence',
      influence: 'Special planetary guidance',
      qualities: 'Individual planetary characteristics'
    };
  }

  /**
   * Analyze pada (quarter) of nakshatra
   * @param {number} pada - Pada number (1-4)
   * @returns {Object} Pada analysis
   */
  _analyzePada(pada) {
    const padaInfo = {
      1: {
        focus: 'Foundation and initiation',
        qualities: ['Beginning', 'Leadership', 'Independence', 'Action-oriented'],
        challenges: ['Impatience', 'Over-initiation', 'Restlessness'],
        strengths: ['Initiative', 'Courage', 'Leadership potential']
      },
      2: {
        focus: 'Development and growth',
        qualities: ['Stability', 'Nurturing', 'Emotional depth', 'Patience'],
        challenges: ['Emotional attachment', 'Resistance to change', 'Inertia'],
        strengths: ['Stability', 'Emotional intelligence', 'Endurance']
      },
      3: {
        focus: 'Expression and creativity',
        qualities: ['Communication', 'Creativity', 'Social skills', 'Adaptability'],
        challenges: ['Scattering energy', 'Superficiality', 'Indecision'],
        strengths: ['Communication', 'Creativity', 'Social grace']
      },
      4: {
        focus: 'Completion and wisdom',
        qualities: ['Wisdom', 'Spirituality', 'Service', 'Completion'],
        challenges: ['Perfectionism', 'Detachment', 'Over-giving'],
        strengths: ['Wisdom', 'Spirituality', 'Service orientation']
      }
    };

    return padaInfo[pada] || {
      focus: 'Unique pada focus',
      qualities: ['Individual qualities'],
      challenges: ['Personal challenges'],
      strengths: ['Personal strengths']
    };
  }

  /**
   * Get nakshatra symbolism and mythology
   * @param {string} nakshatra - Nakshatra name
   * @returns {Object} Symbolism and mythology
   */
  _getNakshatraSymbolism(nakshatra) {
    const symbolism = {
      Ashwini: {
        symbol: 'Horse\'s head',
        deity: 'Ashwin Kumaras (divine physicians)',
        mythology: 'Twin gods of healing and medicine, representing swift recovery and divine intervention',
        meaning: 'Swift healing, new beginnings, and divine assistance'
      },
      Bharani: {
        symbol: 'Yoni (female reproductive organ)',
        deity: 'Yama (god of death)',
        mythology: 'Represents the womb of creation and the transformative power of death and rebirth',
        meaning: 'Creative transformation and the cycle of life and death'
      },
      Krittika: {
        symbol: 'Knife or razor',
        deity: 'Agni (god of fire)',
        mythology: 'Six sisters who raised the war god Kartikeya, representing purification and cutting away',
        meaning: 'Purification, sharpness, and the power to cut through illusions'
      },
      Rohini: {
        symbol: 'Cart or chariot',
        deity: 'Brahma (creator god)',
        mythology: 'Favorite wife of the Moon god, representing beauty, fertility, and creative abundance',
        meaning: 'Beauty, growth, nourishment, and material prosperity'
      },
      Mrigashira: {
        symbol: 'Deer\'s head',
        deity: 'Soma (moon god)',
        mythology: 'Represents the search for enlightenment and the gentle, elusive nature of spiritual seeking',
        meaning: 'Search, discovery, and the gentle pursuit of knowledge'
      },
      Ardra: {
        symbol: 'Teardrop',
        deity: 'Rudra (storm god)',
        mythology: 'Represents the destructive and creative power of storms, associated with Shiva\'s fierce form',
        meaning: 'Storm, destruction, and creative transformation'
      },
      Punarvasu: {
        symbol: 'Bow and quiver',
        deity: 'Aditi (mother of gods)',
        mythology: 'Represents renewal and return, the infinite nature of the divine mother',
        meaning: 'Renewal, expansion, and infinite divine potential'
      },
      Pushya: {
        symbol: 'Flower or udder',
        deity: 'Brihaspati (guru of gods)',
        mythology: 'Sacred flower, representing nourishment, protection, and spiritual wisdom',
        meaning: 'Nourishment, protection, and spiritual prosperity'
      },
      Ashlesha: {
        symbol: 'Serpent',
        deity: 'Nagas (serpent deities)',
        mythology: 'Represents the kundalini energy and the wisdom of the serpent, both healing and dangerous',
        meaning: 'Wisdom, healing, transformation, and mystical knowledge'
      },
      Magha: {
        symbol: 'Royal throne',
        deity: 'Pitris (ancestors)',
        mythology: 'Royal throne representing ancestral wisdom, dignity, and the power of heritage',
        meaning: 'Royal dignity, ancestral wisdom, and noble bearing'
      },
      'Purva Phalguni': {
        symbol: 'Hammock or bed',
        deity: 'Bhaga (god of prosperity)',
        mythology: 'Represents pleasure, relaxation, and the enjoyment of life\'s blessings',
        meaning: 'Pleasure, romance, creativity, and sensual enjoyment'
      },
      'Uttara Phalguni': {
        symbol: 'Bed or marriage bed',
        deity: 'Aryaman (god of honor)',
        mythology: 'Represents friendship, favor, and the blessings of honorable relationships',
        meaning: 'Friendship, favor, marriage, and beneficial alliances'
      },
      Hasta: {
        symbol: 'Hand',
        deity: 'Savitar (creative solar deity)',
        mythology: 'The hand of creation, representing skill, craftsmanship, and healing touch',
        meaning: 'Skill, craftsmanship, healing, and manual dexterity'
      },
      Chitra: {
        symbol: 'Pearl or bright jewel',
        deity: 'Vishwakarma (divine architect)',
        mythology: 'Beautiful pearl representing artistic creation and the architect of the universe',
        meaning: 'Beauty, creativity, artistic skill, and architectural ability'
      },
      Swati: {
        symbol: 'Coral or independent sword',
        deity: 'Vayu (wind god)',
        mythology: 'Represents independence, balance, and the self-reliant nature of the wind',
        meaning: 'Independence, balance, self-reliance, and gentle movement'
      },
      Vishakha: {
        symbol: 'Triumphal arch or potter\'s wheel',
        deity: 'Indra (king of gods) and Agni (fire god)',
        mythology: 'Arch of victory representing achievement, focused effort, and triumphant success',
        meaning: 'Achievement, focused effort, victory, and purposeful action'
      },
      Anuradha: {
        symbol: 'Lotus flower',
        deity: 'Mitra (god of friendship)',
        mythology: 'Sacred lotus representing devotion, friendship, and spiritual blossoming',
        meaning: 'Devotion, friendship, success, and spiritual friendship'
      },
      Jyeshtha: {
        symbol: 'Umbrella or earring',
        deity: 'Indra (king of gods)',
        mythology: 'Royal umbrella representing authority, protection, and eldest sibling energy',
        meaning: 'Authority, protection, wisdom, and elder status'
      },
      Mula: {
        symbol: 'Bunch of roots',
        deity: 'Nirriti (goddess of destruction)',
        mythology: 'Roots representing foundation, destruction of old patterns, and deep spiritual insight',
        meaning: 'Foundation, destruction, research, and spiritual depth'
      },
      'Purva Ashadha': {
        symbol: 'Elephant tusk or fan',
        deity: 'Apas (water goddess)',
        mythology: 'Invincible elephant tusk representing unconquerable strength and spiritual victory',
        meaning: 'Invincibility, spiritual victory, and unstoppable progress'
      },
      'Uttara Ashadha': {
        symbol: 'Elephant tusk or small bed',
        deity: 'Vishvedevas (universal gods)',
        mythology: 'Universal elephant tusk representing universal welfare and ethical leadership',
        meaning: 'Universal welfare, ethical leadership, and universal benefit'
      },
      Shravana: {
        symbol: 'Ear or arrow',
        deity: 'Vishnu (preserver god)',
        mythology: 'Represents hearing divine wisdom and the arrow of focused intention',
        meaning: 'Hearing, learning, fame, and divine connection'
      },
      Dhanishta: {
        symbol: 'Drum or flute',
        deity: 'Vasus (earth deities)',
        mythology: 'Sacred drum representing rhythm, wealth, music, and material prosperity',
        meaning: 'Wealth, rhythm, music, and material abundance'
      },
      Shatabhisha: {
        symbol: 'Empty circle or hundred healers',
        deity: 'Varuna (god of cosmic order)',
        mythology: 'Empty circle representing healing, protection, and the void of pure potential',
        meaning: 'Healing, protection, independence, and mystical insight'
      },
      'Purva Bhadrapada': {
        symbol: 'Sword or two front legs of funeral cot',
        deity: 'Aja Ekapada (one-footed goat)',
        mythology: 'Funeral cot representing transformation through death and spiritual purification',
        meaning: 'Purification, transformation, spiritual fire, and burning away impurities'
      },
      'Uttara Bhadrapada': {
        symbol: 'Twins or back legs of funeral cot',
        deity: 'Ahir Budhnya (serpent of the deep)',
        mythology: 'Funeral cot representing liberation, spiritual support, and foundation in enlightenment',
        meaning: 'Foundation, support, liberation, and spiritual stability'
      },
      Revati: {
        symbol: 'Fish or pair of fish',
        deity: 'Pushan (nourisher and guide)',
        mythology: 'Fish representing prosperity, guidance, and safe passage through life\'s waters',
        meaning: 'Prosperity, guidance, compassion, and safe journey'
      }
    };

    return symbolism[nakshatra] || {
      symbol: 'Unique symbol',
      deity: 'Special deity',
      mythology: 'Individual mythological significance',
      meaning: 'Personal symbolic meaning'
    };
  }

  /**
   * Identify life purpose based on nakshatra
   * @param {string} nakshatra - Nakshatra name
   * @returns {string} Life purpose description
   */
  _identifyLifePurpose(nakshatra) {
    const purposes = {
      Ashwini: 'To bring healing and swift positive change to others through medical or innovative pursuits',
      Bharani: 'To transform and nurture creative projects, bringing beauty and responsibility to endeavors',
      Krittika: 'To purify and refine, cutting away what is unnecessary to reveal essential truth',
      Rohini: 'To nurture growth and beauty, creating stable foundations for prosperity and abundance',
      Mrigashira: 'To seek and discover knowledge, guiding others through gentle exploration and learning',
      Ardra: 'To cleanse and transform through intense experiences, bringing creative renewal',
      Punarvasu: 'To renew and expand consciousness, offering wisdom and care to those in need',
      Pushya: 'To nourish and protect, fostering spiritual and material prosperity in communities',
      Ashlesha: 'To heal through wisdom and transformation, guiding others through mystical insights',
      Magha: 'To honor ancestral wisdom and lead with royal dignity and authoritative presence',
      'Purva Phalguni': 'To create pleasure and beauty, bringing romance and creative joy to life',
      'Uttara Phalguni': 'To foster beneficial friendships and alliances, creating harmonious connections',
      Hasta: 'To heal and craft with skill, offering precise service and therapeutic assistance',
      Chitra: 'To create beauty and artistic works, bringing creative vision and craftsmanship to the world',
      Swati: 'To maintain balance and independence, offering peaceful solutions and self-reliant guidance',
      Vishakha: 'To achieve goals through focused effort, leading others to victory and accomplishment',
      Anuradha: 'To cultivate devotion and friendship, creating successful and harmonious relationships',
      Jyeshtha: 'To protect and guide as the elder, offering wisdom and authoritative leadership',
      Mula: 'To establish foundations and destroy illusions, researching and revealing ultimate truths',
      'Purva Ashadha': 'To achieve invincible success through spiritual strength and determined progress',
      'Uttara Ashadha': 'To promote universal welfare through ethical leadership and beneficial actions',
      Shravana: 'To hear and learn divine wisdom, sharing knowledge and achieving fame through learning',
      Dhanishta: 'To create wealth and rhythm, bringing prosperity and musical harmony to life',
      Shatabhisha: 'To heal and protect through independence, offering mystical insight and sanctuary',
      'Purva Bhadrapada': 'To purify through spiritual fire, transforming suffering into enlightenment',
      'Uttara Bhadrapada': 'To provide spiritual foundation and support, guiding others to liberation',
      Revati: 'To guide with compassion and prosperity, offering safe passage and abundant care'
    };

    return purposes[nakshatra] || 'To fulfill unique soul purpose through authentic self-expression and service';
  }

  /**
   * Create comprehensive nakshatra interpretation
   * @param {Object} nakshatraData - Nakshatra data
   * @param {Object} traits - Nakshatra traits
   * @param {Object} rulingPlanet - Ruling planet information
   * @returns {string} Complete interpretation
   */
  _createNakshatraInterpretation(nakshatraData, traits, rulingPlanet) {
    let interpretation = `Your Moon is in ${nakshatraData.nakshatra} nakshatra, a ${traits.nature} nakshatra ruled by ${traits.caste} energy. `;

    interpretation += `This lunar mansion embodies ${traits.qualities.slice(0, 2).join(' and ')} qualities, with ${rulingPlanet.energy} planetary rulership. `;

    interpretation += `Your ${nakshatraData.pada}st pada suggests focus on ${this._analyzePada(nakshatraData.pada).focus.toLowerCase()}. `;

    interpretation += `Your life purpose involves ${this._identifyLifePurpose(nakshatraData.nakshatra).toLowerCase()}.`;

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
   * @param {Object} result - Raw nakshatra result
   * @returns {Object} Formatted result
   */
  _formatResult(result) {
    return {
      service: 'Nakshatra Calculation Analysis',
      timestamp: new Date().toISOString(),
      nakshatra: {
        basic: result.nakshatraData,
        traits: result.nakshatraTraits,
        rulingPlanet: result.rulingPlanet,
        padaAnalysis: result.padaAnalysis,
        symbolism: result.symbolism,
        lifePurpose: result.lifePurpose,
        chartType: result.chartType
      },
      interpretation: result.interpretation,
      disclaimer: 'Nakshatra analysis reveals lunar mansion influences on personality and life path. Nakshatras are lunar constellations that shape emotional nature and soul purpose. Complete astrological analysis considers the entire birth chart for comprehensive understanding.'
    };
  }
}

module.exports = CalculateNakshatraService;
