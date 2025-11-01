/**
 * Nadi Compatibility Calculator
 * Handles traditional Indian marriage compatibility through Nadi Kuta system
 */

class NadiCompatibility {
  constructor() {
    this.compatibilityMatrix = this._initializeCompatibilityMatrix();
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
}

module.exports = { NadiCompatibility };
