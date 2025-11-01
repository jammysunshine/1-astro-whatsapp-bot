const logger = require('../../../utils/logger');
const sweph = require('sweph');

/**
 * Nadi Compatibility Calculator - Enhanced
 * Migrated from NadiCalculator.js: complete calculation logic, birth nakshatra, nadi system, dasha calculations
 * Handles traditional Indian marriage compatibility and full Nadi astrology analysis
 */

class NadiCompatibility {
  constructor() {
    this.compatibilityMatrix = this._initializeCompatibilityMatrix();
    this.logger = logger;
  }

  // ================= MIGRATED FROM NadiCalculator.js =================

  /**
   * Calculate complete Nadi reading for a person
   * Moved from NadiCalculator.js - complete calculation logic
   * @param {Object} person - Person's birth data
   * @returns {Object} Complete Nadi calculation results
   */
  calculateCompleteNadiReading(person) {
    try {
      const birthNakshatra = this.calculateBirthNakshatra(
        person.birthDate,
        person.birthTime
      );
      const nadiSystem = this.determineNadiSystem(
        birthNakshatra,
        person.birthDate
      );
      const dashaPeriod = this.calculateCurrentDasha(person.birthDate);
      const predictions = this._generatePredictions(
        birthNakshatra,
        nadiSystem,
        dashaPeriod
      );

      return {
        birthNakshatra,
        nadiSystem,
        currentDasha: dashaPeriod,
        predictions,
        compatibility: this.generateCompatibility(birthNakshatra)
      };
    } catch (error) {
      this.logger.error('Nadi calculation error:', error);
      throw error;
    }
  }

  /**
   * Calculate birth nakshatra from birth data
   * Moved from NadiCalculator.js - birth nakshatra calculation
   * @param {string} birthDate - Birth date (DD/MM/YYYY)
   * @param {string} birthTime - Birth time (HH:MM)
   * @returns {Object} Birth nakshatra information
   */
  calculateBirthNakshatra(birthDate, birthTime) {
    try {
      // Parse birth date and time
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime ?
        birthTime.split(':').map(Number) :
        [12, 0];

      // Calculate nakshatra based on date and time
      const dayOfYear = this._getDayOfYear(day, month);
      const timeFactor = (hour * 60 + minute) / 1440; // Fraction of day

      // 27 nakshatras per year (roughly)
      const nakshatraIndex = Math.floor((dayOfYear + timeFactor * 27) % 27);
      const nakshatras = this._getNakshatras();
      const nakshatra = nakshatras[nakshatraIndex];

      return {
        name: nakshatra.name,
        rulingPlanet: nakshatra.rulingPlanet,
        deity: nakshatra.deity || 'Associated Deity',
        nature: nakshatra.nature,
        pada: this._calculatePada(hour, minute),
        characteristics: this._getNakshatraCharacteristics(nakshatra.name)
      };
    } catch (error) {
      this.logger.error('Birth nakshatra calculation error:', error);
      return {
        error: 'Unable to calculate birth nakshatra',
        name: 'Unknown'
      };
    }
  }

  /**
   * Determine Nadi system from birth nakshatra and date
   * Moved from NadiCalculator.js - nadi system determination
   * @param {Object} birthNakshatra - Birth nakshatra data
   * @param {string} birthDate - Birth date
   * @returns {Object} Nadi system information
   */
  determineNadiSystem(birthNakshatra, birthDate) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);
      const total = day + month + year;
      const nadiSystems = this._getNadiSystems();

      let nadiType;
      if (total % 3 === 0) {
        nadiType = 'Aadya';
      } else if (total % 3 === 1) {
        nadiType = 'Madhya';
      } else {
        nadiType = 'Antya';
      }

      return nadiSystems[nadiType];
    } catch (error) {
      this.logger.error('Nadi system determination error:', error);
      const nadiSystems = this._getNadiSystems();
      return nadiSystems.Aadya; // Default fallback
    }
  }

  /**
   * Calculate current dasha period
   * Moved from NadiCalculator.js - dasha calculation
   * @param {string} birthDate - Birth date
   * @returns {Object} Current dasha information
   */
  calculateCurrentDasha(birthDate) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);
      const birthDateObj = new Date(year, month - 1, day);
      const now = new Date();

      // Calculate age in years
      const ageInYears = now.getFullYear() - birthDateObj.getFullYear();
      const ageInMonths =
        now.getMonth() - birthDateObj.getMonth() + ageInYears * 12;

      // Total dasha cycle duration (sum of all planet periods)
      const dashaPeriods = this._getDashaPeriods();
      const totalDashaYears = Object.values(dashaPeriods).reduce(
        (sum, period) => sum + period.duration,
        0
      );

      // Find current dasha planet
      const currentPosition = ageInYears % totalDashaYears;
      let accumulatedYears = 0;

      for (const [planet, period] of Object.entries(dashaPeriods)) {
        accumulatedYears += period.duration;
        if (currentPosition < accumulatedYears) {
          const remaining = accumulatedYears - currentPosition;
          return {
            planet: planet.charAt(0).toUpperCase() + planet.slice(1),
            duration: period.duration,
            remaining: Math.max(1, Math.floor(remaining)), // At least 1 year remaining
            characteristics: period.characteristics,
            influence: this._getDashaInfluence(planet)
          };
        }
      }

      // Fallback
      return {
        planet: 'Sun',
        duration: 6,
        remaining: 3,
        characteristics: 'Leadership and authority',
        influence: 'Period of leadership and self-expression'
      };
    } catch (error) {
      this.logger.error('Dasha calculation error:', error);
      return {
        error: 'Unable to calculate current dasha',
        planet: 'Unknown'
      };
    }
  }

  /**
   * Initialize compatibility matrix for Nadi matching
   * @returns {Object} Compatibility scoring matrix
   */
  _initializeCompatibilityMatrix() {
    return {
      Aadya: { Aadya: 0, Madhya: 8, Antya: 8 },
      Madhya: { Aadya: 8, Madhya: 0, Antya: 8 },
      Antya: { Aadya: 8, Madhya: 8, Antya: 0 }
    };
  }

  /**
   * Analyze nakshatra compatibility between two people
   * @param {string} partner1Nakshatra - First partner's nakshatra
   * @param {string} partner2Nakshatra - Second partner's nakshatra
   * @returns {Object} Compatibility analysis
   */
  analyzeNakshatraCompatibility(partner1Nakshatra, partner2Nakshatra) {
    try {
      const nadi1 = this._getNadiFromNakshatra(partner1Nakshatra);
      const nadi2 = this._getNadiFromNakshatra(partner2Nakshatra);

      const compatibility = this._assessNadiCompatibility(nadi1, nadi2);

      return {
        compatible: compatibility.score > 6,
        compatibility: this._getCompatibilityLevel(compatibility.score),
        message: compatibility.message,
        strengths: compatibility.strengths,
        challenges: compatibility.challenges
      };
    } catch (error) {
      return {
        compatible: false,
        compatibility: 'Unknown',
        message: 'Error analyzing nakshatra compatibility',
        strengths: [],
        challenges: ['Unable to determine compatibility']
      };
    }
  }

  /**
   * Generate compatibility score
   * @param {string} partner1Nakshatra - First partner's nakshatra
   * @param {string} partner2Nakshatra - Second partner's nakshatra
   * @returns {Object} Compatibility score
   */
  generateCompatibilityScore(partner1Nakshatra, partner2Nakshatra) {
    const nadi1 = this._getNadiFromNakshatra(partner1Nakshatra);
    const nadi2 = this._getNadiFromNakshatra(partner2Nakshatra);

    const score = this.compatibilityMatrix[nadi1][nadi2] || 0;

    return {
      score,
      level: this._getCompatibilityLevel(score),
      nadi1,
      nadi2
    };
  }

  /**
   * Generate relationship dynamics advice
   * @param {string} partner1Nakshatra - First partner's nakshatra
   * @param {string} partner2Nakshatra - Second partner's nakshatra
   * @returns {Object} Relationship dynamics analysis
   */
  generateRelationshipDynamics(partner1Nakshatra, partner2Nakshatra) {
    const nadi1 = this._getNadiFromNakshatra(partner1Nakshatra);
    const nadi2 = this._getNadiFromNakshatra(partner2Nakshatra);

    const dynamics = this._getRelationshipDynamics(nadi1, nadi2);

    return {
      nadi1,
      nadi2,
      dynamics,
      communication: dynamics.communication,
      emotional: dynamics.emotional,
      practical: dynamics.practical,
      spiritual: dynamics.spiritual
    };
  }

  /**
   * Get matching suggestions for a nakshatra
   * @param {string} nakshatra - Nakshatra name
   * @returns {Object} Matching suggestions
   */
  getMatchingSuggestions(nakshatra) {
    const nadi = this._getNadiFromNakshatra(nakshatra);

    const compatibleNadis = Object.keys(this.compatibilityMatrix[nadi]).filter(
      otherNadi => this.compatibilityMatrix[nadi][otherNadi] > 6
    );

    return {
      compatibleNadis,
      suggestedTraits: this._getSuggestedTraits(nadi),
      marriageGuidance: this._getMarriageGuidance(nadi)
    };
  }

  /**
   * Get Nadi from nakshatra name
   * @param {string} nakshatra - Nakshatra name
   * @returns {string} Nadi type (Aadya, Madhya, Antya)
   */
  _getNadiFromNakshatra(nakshatra) {
    const nadiMapping = {
      // Aadya Nadi (9 nakshatras: 1st, 4th, 7th...etc.)
      Ashwini: 'Aadya',
      Rohini: 'Aadya',
      Hasta: 'Aadya',
      Chitra: 'Aadya',
      Vishakha: 'Aadya',
      Anuradha: 'Aadya',
      Jyeshta: 'Aadya',
      'Purva Bhadrapada': 'Aadya',
      Revati: 'Aadya',

      // Madhya Nadi (9 nakshatras)
      Bharani: 'Madhya',
      Mrigashira: 'Madhya',
      Ardra: 'Madhya',
      Punarvasu: 'Madhya',
      Swati: 'Madhya',
      Shravana: 'Madhya',
      Shatabhisha: 'Madhya',
      Dhanishta: 'Madhya',

      // Antya Nadi (9 nakshatras)
      Krittika: 'Antya',
      Pushya: 'Antya',
      Ashlesha: 'Antya',
      'Purva Phalguni': 'Antya',
      'Uttara Phalguni': 'Antya',
      Magha: 'Antya',
      'Uttara Ashadha': 'Antya',
      Mula: 'Antya',
      'Purva Ashadha': 'Antya'
    };

    return nadiMapping[nakshatra] || 'Unknown';
  }

  /**
   * Assess Nadi compatibility
   * @param {string} nadi1 - First nadi
   * @param {string} nadi2 - Second nadi
   * @returns {Object} Compatibility assessment
   */
  _assessNadiCompatibility(nadi1, nadi2) {
    const score = this.compatibilityMatrix[nadi1]?.[nadi2] || 0;

    let level;
    let message;
    let strengths;
    let challenges;

    if (sheet === 0) {
      level = 'incompatible';
      message =
        'Same Nadi indicates challenges for progeny health and compatibility';
      strengths = ['Shared understanding'];
      challenges = [
        'Potential health issues for children',
        'Need for remedial measures'
      ];
    } else {
      level = score > 6 ? 'compatible' : 'moderately_compatible';
      message = 'Compatible Nadi energies promote harmony and successful union';
      strengths = [
        'Good energy harmony',
        'Supportive relationship foundation',
        'Positive family environment'
      ];
      challenges = ['May need conscious effort to maintain balance'];
    }

    return { score, level, message, strengths, challenges };
  }

  /**
   * Get compatibility level from score
   * @param {number} score - Compatibility score
   * @returns {string} Compatibility level
   */
  _getCompatibilityLevel(score) {
    if (score === 0) {
      return 'chalenging';
    }
    if (score >= 8) {
      return 'excellent';
    }
    if (score >= 6) {
      return 'good';
    }
    return 'moderate';
  }

  /**
   * Get relationship dynamics based on nadi combination
   * @param {string} nadi1 - First nadi
   * @param {string} nadi2 - Second nadi
   * @returns {Object} Relationship dynamics
   */
  _getRelationshipDynamics(nadi1, nadi2) {
    const combinations = {
      'Aadya-Aadya': {
        communication: 'Direct and initiating communication style',
        emotional: 'Emotional expressions through leadership and action',
        practical: 'Organized approach to daily life and responsibilities',
        spiritual: 'Spiritual guidance through foundational principles'
      },
      'Aadya-Madhya': {
        communication:
          'Balanced communication between initiative and adaptability',
        emotional: 'Emotional harmony through complementary approaches',
        practical: 'Good balance of structure and flexibility',
        spiritual: 'Spiritual growth through mutual wisdom sharing'
      },
      'Aadya-Antya': {
        communication: 'Communication through action and contemplation',
        emotional: 'Emotional balance through initiative and depth',
        practical: 'Practical setup requiring patience and understanding',
        spiritual: 'Spiritual connection through determination and insight'
      },
      'Madhya-Madhya': {
        communication: 'Flexible and adaptive communication patterns',
        emotional: 'Emotional comfort through shared adaptability',
        practical: 'Flexible approach to practical matters',
        spiritual: 'Spiritual understanding through shared insights'
      },
      'Madhya-Antya': {
        communication: 'Communication balancing adaptability and depth',
        emotional: 'Emotional connection through flexibility and contemplation',
        practical: 'Balance between change and stability',
        spiritual: 'Spiritual wisdom through varied perspectives'
      },
      'Antya-Antya': {
        communication: 'Deep and contemplative communication style',
        emotional: 'Emotional depth and intense intimacy',
        practical: 'Thoughtful approach to life responsibilities',
        spiritual: 'Deep spiritual understanding and growth'
      }
    };

    const key = `${nadi1}-${nadi2}`;
    const reverseKey = `${nadi2}-${nadi1}`;

    return (
      combinations[key] ||
      combinations[reverseKey] || {
        communication: 'Harmonious communication patterns',
        emotional: 'Balanced emotional connection',
        practical: 'Practical collaboration in daily life',
        spiritual: 'Spiritual connection and mutual growth'
      }
    );
  }

  /**
   * Get suggested traits for compatibility
   * @param {string} nadi - Nadi type
   * @returns {Array} Suggested personality traits
   */
  _getSuggestedTraits(nadi) {
    const traits = {
      Aadya: [
        'Leadership',
        'Decisiveness',
        'Independence',
        'Courage',
        'Initiative'
      ],
      Madhya: [
        'Adaptability',
        'Flexibility',
        'Harmonious',
        'Patient',
        'Understanding'
      ],
      Antya: [
        'Wisdom',
        'Depth',
        'Introspection',
        'Stability',
        'Long-lasting commitment'
      ]
    };

    return traits[nadi] || ['Balanced', 'Harmonious', 'Compassionate'];
  }

  /**
   * Get marriage guidance based on nadi
   * @param {string} nadi - Nadi type
   * @returns {Object} Marriage guidance
   */
  _getMarriageGuidance(nadi) {
    const guidance = {
      Aadya: {
        idealPartner: 'Partner who appreciates leadership and initiative',
        keyStrengths: 'Ability to provide direction and security',
        focusAreas: 'Balance leadership with tenderness in relationships',
        recommendedRemedies: 'Regular spiritual practices for grounding energy'
      },
      Madhya: {
        idealPartner: 'Partner who values harmony and understanding',
        keyStrengths: 'Excellent at creating harmonious relationships',
        focusAreas: 'Practice patience and acceptance of differences',
        recommendedRemedies: 'Mantras for emotional balance and peace'
      },
      Antya: {
        idealPartner: 'Partner who values deep emotional connection',
        keyStrengths: 'Deep wisdom and lasting commitment to relationships',
        focusAreas: 'Learn to express emotions clearly and openly',
        recommendedRemedies:
          'Spiritual practices for emotional healing and depth'
      }
    };

    return (
      guidance[nadi] || {
        idealPartner: 'Partner with complementary energies',
        keyStrengths: 'Harmonious and balanced approach to relationships',
        focusAreas: 'Focus on open communication and mutual understanding',
        recommendedRemedies:
          'Beneficial spiritual practices for relationship harmony'
      }
    );
  }

  // ================= HELPER METHODS FOR CALCULATIONS =================

  /**
   * Calculate pada (quarter) of the nakshatra
   * @param {number} hour - Birth hour
   * @param {number} minute - Birth minute
   * @returns {number} Pada number (1-4)
   */
  _calculatePada(hour, minute) {
    const totalMinutes = hour * 60 + minute;
    const padaDuration = 1440 / 4; // 4 padas per nakshatra (6 hours each)
    return Math.floor(totalMinutes / padaDuration) + 1;
  }

  /**
   * Get day of year from date
   * @param {number} day - Day of month
   * @param {number} month - Month (1-12)
   * @returns {number} Day of year (1-365)
   */
  _getDayOfYear(day, month) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let dayOfYear = day;

    for (let i = 0; i < month - 1; i++) {
      dayOfYear += daysInMonth[i];
    }

    return dayOfYear;
  }

  /**
   * Generate predictions based on nakshatra, nadi, and dasha
   * @param {Object} nakshatra - Birth nakshatra
   * @param {Object} nadiSystem - Nadi system
   * @param {Object} dasha - Current dasha
   * @returns {Object} Predictions object
   */
  _generatePredictions(nakshatra, nadiSystem, dasha) {
    return {
      personality: this._generatePersonalityPrediction(nakshatra, nadiSystem),
      career: this._generateCareerPrediction(nakshatra, nadiSystem, dasha),
      relationships: this._generateRelationshipPrediction(nakshatra, nadiSystem),
      health: this._generateHealthPrediction(nakshatra),
      finance: this._generateFinancePrediction(nakshatra, dasha),
      spiritual: this._generateSpiritualPrediction(nakshatra, nadiSystem)
    };
  }

  /**
   * Generate personality prediction
   * @param {Object} nakshatra - Birth nakshatra
   * @param {Object} nadiSystem - Nadi system
   * @returns {string} Personality description
   */
  _generatePersonalityPrediction(nakshatra, nadiSystem) {
    return `Your ${nakshatra.name} nakshatra suggests ${nakshatra.characteristics.toLowerCase()}. As part of the ${nadiSystem.name}, you exhibit ${nadiSystem.characteristics.toLowerCase()}.`;
  }

  /**
   * Generate career prediction
   * @param {Object} nakshatra - Birth nakshatra
   * @param {Object} nadiSystem - Nadi system
   * @param {Object} dasha - Current dasha
   * @returns {string} Career guidance
   */
  _generateCareerPrediction(nakshatra, nadiSystem, dasha) {
    const careerFocus = {
      'Aadya': 'leadership and pioneering roles',
      'Madhya': 'balanced and harmonious work environments',
      'Antya': 'service and helping professions'
    };

    const focus = careerFocus[nadiSystem.name] || 'versatile career paths';
    return `Your ${nadiSystem.name} suggests career success in ${focus}. Current ${dasha.planet} dasha (${dasha.remaining} years) influences ${dasha.characteristics.toLowerCase()}.`;
  }

  /**
   * Generate relationship prediction
   * @param {Object} nakshatra - Birth nakshatra
   * @param {Object} nadiSystem - Nadi system
   * @returns {string} Relationship insights
   */
  _generateRelationshipPrediction(nakshatra, nadiSystem) {
    return `Your ${nakshatra.name} nakshatra and ${nadiSystem.name} indicate strong potential for ${nadiSystem.characteristics.toLowerCase()} in relationships.`;
  }

  /**
   * Generate health prediction
   * @param {Object} nakshatra - Birth nakshatra
   * @returns {string} Health focus areas
   */
  _generateHealthPrediction(nakshatra) {
    const healthFocus = this._getNakshatraHealthFocus(nakshatra.name);
    return `Focus on maintaining balance in your ${healthFocus} for optimal well-being.`;
  }

  /**
   * Generate finance prediction
   * @param {Object} nakshatra - Birth nakshatra
   * @param {Object} dasha - Current dasha
   * @returns {string} Financial guidance
   */
  _generateFinancePrediction(nakshatra, dasha) {
    return `Current ${dasha.planet} dasha (${dasha.remaining} years) may bring opportunities in ${dasha.characteristics.toLowerCase()}. Focus on stable financial planning.`;
  }

  /**
   * Generate spiritual prediction
   * @param {Object} nakshatra - Birth nakshatra
   * @param {Object} nadiSystem - Nadi system
   * @returns {string} Spiritual guidance
   */
  _generateSpiritualPrediction(nakshatra, nadiSystem) {
    return `Your ${nakshatra.name} nakshatra and ${nadiSystem.name} guide you toward ${nadiSystem.lifePurpose.toLowerCase()}. Embrace spiritual practices that resonate with your nature.`;
  }

  /**
   * Generate compatibility information
   * @param {Object} nakshatra - Birth nakshatra
   * @returns {Object} Compatibility data
   */
  generateCompatibility(nakshatra) {
    return {
      compatibleSigns: this._getCompatibleNakshatras(nakshatra.name),
      bestMatches: this._getBestMatches(nakshatra.name),
      relationshipAdvice: this._getRelationshipAdvice(nakshatra.name)
    };
  }

  // ================= DATA PROVIDER METHODS =================

  _getNakshatras() {
    return [
      { name: 'Ashwini', rulingPlanet: 'Ketu', deity: 'Ashwini Kumaras', nature: 'Swift' },
      { name: 'Bharani', rulingPlanet: 'Venus', deity: 'Yama', nature: ' Fierce' },
      { name: 'Krittika', rulingPlanet: 'Sun', deity: 'Agni', nature: 'Fierce' },
      { name: 'Rohini', rulingPlanet: 'Moon', deity: 'Brahma', nature: 'Fixed' },
      { name: 'Mrigashira', rulingPlanet: 'Mars', deity: 'Soma', nature: 'Gentle' },
      { name: 'Ardra', rulingPlanet: 'Rahu', deity: 'Rudra', nature: 'Fierce' },
      { name: 'Punarvasu', rulingPlanet: 'Jupiter', deity: 'Aditi', nature: 'Gentle' },
      { name: 'Pushya', rulingPlanet: 'Saturn', deity: 'Brihaspati', nature: 'Gentle' },
      { name: 'Ashlesha', rulingPlanet: 'Mercury', deity: 'Nagas', nature: 'Fierce' },
      { name: 'Magha', rulingPlanet: 'Ketu', deity: 'Pitaras', nature: 'Fierce' },
      { name: 'Purva Phalguni', rulingPlanet: 'Venus', deity: 'Bhaga', nature: 'Fixed' },
      { name: 'Uttara Phalguni', rulingPlanet: 'Sun', deity: 'Aryaman', nature: 'Fixed' },
      { name: 'Hasta', rulingPlanet: 'Moon', deity: 'Savitar', nature: 'Gentle' },
      { name: 'Chitra', rulingPlanet: 'Mars', deity: 'Vishwakarma', nature: 'Gentle' },
      { name: 'Swati', rulingPlanet: 'Rahu', deity: 'Vayu', nature: 'Fixed' },
      { name: 'Vishakha', rulingPlanet: 'Jupiter', deity: 'Indra', nature: 'Fixed' },
      { name: 'Anuradha', rulingPlanet: 'Saturn', deity: 'Mitravaruna', nature: 'Fixed' },
      { name: 'Jyeshta', rulingPlanet: 'Mercury', deity: 'Indra', nature: 'Fierce' },
      { name: 'Mula', rulingPlanet: 'Ketu', deity: 'Nirrti', nature: 'Fierce' },
      { name: 'Purva Ashadha', rulingPlanet: 'Venus', deity: 'Apas', nature: 'Gentle' },
      { name: 'Uttara Ashadha', rulingPlanet: 'Sun', deity: 'Vishwadevas', nature: 'Fixed' },
      { name: 'Shravana', rulingPlanet: 'Moon', deity: 'Vishnu', nature: 'Fixed' },
      { name: 'Dhanishta', rulingPlanet: 'Mars', deity: 'Vasus', nature: 'Gentle' },
      { name: 'Shatabhisha', rulingPlanet: 'Rahu', deity: 'Varuna', nature: 'Fixed' },
      { name: 'Purva Bhadrapada', rulingPlanet: 'Jupiter', deity: 'Aja Ekapada', nature: 'Gentle' },
      { name: 'Uttara Bhadrapada', rulingPlanet: 'Saturn', deity: 'Ahir Budhnya', nature: 'Fixed' },
      { name: 'Revati', rulingPlanet: 'Mercury', deity: 'Pushan', nature: 'Gentle' }
    ];
  }

  _getNakshatraCharacteristics(name) {
    const characteristics = {
      'Ashwini': 'energetic and adventurous',
      'Bharani': 'determined and courageous',
      'Mrigashira': 'curious and communicative',
      'Rohini': 'nurturing and beautiful',
      'Punarvasu': 'wise and optimistic',
    };
    return characteristics[name] || 'harmonious and balanced';
  }

  _getNakshatraHealthFocus(name) {
    const focus = {
      'Ashwini': 'head and neurological system',
      'Bharani': 'reproductive and physical energy',
      'Rohini': 'vision and creative expression',
    };
    return focus[name] || 'overall physical balance';
  }

  _getNadiSystems() {
    return {
      Aadya: {
        name: 'Aadya',
        characteristics: 'leadership and initiative',
        lifePurpose: 'pioneering and establishing new paradigms',
        traits: ['Leadership', 'Courage', 'Initiative']
      },
      Madhya: {
        name: 'Madhya',
        characteristics: 'harmony and adaptability',
        lifePurpose: 'balancing and mediating',
        traits: ['Harmony', 'Adaptability', 'Understanding']
      },
      Antya: {
        name: 'Antya',
        characteristics: 'wisdom and depth',
        lifePurpose: 'deep spiritual understanding and transformation',
        traits: ['Wisdom', 'Depth', 'Introspection']
      }
    };
  }

  _getDashaPeriods() {
    return {
      Ketu: { duration: 7, characteristics: 'spiritual insight and detachment' },
      Venus: { duration: 20, characteristics: 'harmony and relationships' },
      Sun: { duration: 6, characteristics: 'leadership and authority' },
      Moon: { duration: 10, characteristics: 'emotions and nurturing' },
      Mars: { duration: 7, characteristics: 'energy and courage' },
      Rahu: { duration: 18, characteristics: 'ambition and transformation' },
      Jupiter: { duration: 16, characteristics: 'wisdom and expansion' },
      Saturn: { duration: 19, characteristics: 'discipline and structure' },
      Mercury: { duration: 17, characteristics: 'communication and intellect' }
    };
  }

  _getDashaInfluence(planet) {
    const influences = {
      'Ketu': 'Spiritual liberation and unconventional paths',
      'Venus': 'Love, beauty, and material comforts',
      'Sun': 'Leadership, vitality, and self-expression',
      'Moon': 'Emotions, intuition, and maternal instincts',
      'Mars': 'Action, courage, and physical energy',
      'Rahu': 'Ambition, innovation, and worldly desires',
      'Jupiter': 'Wisdom, prosperity, and spiritual growth',
      'Saturn': 'Discipline, responsibility, and life lessons',
      'Mercury': 'Communication, learning, and adaptability'
    };
    return influences[planet] || 'Balanced development and growth';
  }

  _getCompatibleNakshatras(name) {
    return ['Rohini', 'Hasta', 'Chitra', 'Vishakha', 'Anuradha']; // Simplified
  }

  _getBestMatches(name) {
    return ['Compatible with complementary energies']; // Simplified
  }

  _getRelationshipAdvice(name) {
    return 'Focus on open communication and mutual understanding'; // Simplified
  }

  /**
   * Health check for NadiCompatibility
   * @returns {Object} Health status
   */
  healthCheck() {
    return {
      healthy: true,
      version: '2.0.0',
      name: 'NadiCompatibility',
      calculations: [
        'Complete Nadi Reading',
        'Birth Nakshatra Calculation',
        'Nadi System Determination',
        'Current Dasha Calculation',
        'Compatibility Analysis',
        'Relationship Dynamics',
        'Matching Suggestions'
      ],
      status: 'Operational - Enhanced'
    };
  }
}

module.exports = { NadiCompatibility };