const logger = require('../../../utils/logger');
const { NadiDataRepository } = require('./NadiDataRepository');

/**
 * NadiCompatibility - Compatibility analysis for Nadi astrology
 * Determines relationship potential, challenges, and harmony based on nakshatra matching
 */
class NadiCompatibility {
  constructor() {
    this.dataRepo = new NadiDataRepository();
    this.logger = logger;
  }

  /**
   * Generate comprehensive compatibility insights
   * @param {Object} birthNakshatra - Birth nakshatra
   * @returns {Object} Compatibility information
   */
  generateCompatibilityInsights(birthNakshatra) {
    try {
      return {
        compatibleSigns: this.dataRepo.getCompatibleNakshatras(birthNakshatra.name),
        bestMatches: this.dataRepo.getBestMatches(birthNakshatra.name),
        relationshipAdvice: this.dataRepo.getRelationshipAdvice(birthNakshatra.name),
        compatibilityStrengths: this.analyzeCompatibilityStrengths(birthNakshatra),
        compatibilityChallenges: this.analyzeCompatibilityChallenges(birthNakshatra)
      };
    } catch (error) {
      this.logger.error('Compatibility insights error:', error);
      return {
        error: 'Unable to generate compatibility insights',
        compatibleSigns: [],
        bestMatches: [],
        relationshipAdvice: 'Seek professional compatibility analysis'
      };
    }
  }

  /**
   * Analyze compatibility strengths of a nakshatra
   * @param {Object} nakshatra - Birth nakshatra
   * @returns {Array} Compatibility strengths
   */
  analyzeCompatibilityStrengths(nakshatra) {
    const strengths = [];

    // Base strength on nakshatra nature and ruling planet
    const nature = nakshatra.nature;
    const planet = nakshatra.rulingPlanet;

    if (nature === 'Light') {
      strengths.push('Brings clarity and understanding in relationships');
    } else if (nature === 'Soft') {
      strengths.push('Offers emotional depth and nurturing qualities');
    } else if (nature === 'Fixed') {
      strengths.push('Provides stability and commitment in partnerships');
    }

    // Planet-based strengths
    const planetStrengths = {
      Venus: 'Romantic and harmonious connection focus',
      Moon: 'Emotional intimacy and intuitive understanding',
      Sun: 'Ego strength and mutual respect foundation',
      Jupiter: 'Spiritual growth and philosophical sharing',
      Mercury: 'Mental rapport and clear communication'
    };

    if (planetStrengths[planet]) {
      strengths.push(planetStrengths[planet]);
    }

    // Nakshatra-specific strengths
    const specificStrengths = {
      Rohini: 'Creative partnership and family-oriented focus',
      Pushya: 'Nurturing and caregiver role in relationships',
      Swati: 'Independent yet harmonious partnership energy',
      Anuradha: 'Devotional love and friendship foundation',
      Revati: 'Spiritual companionship and guiding qualities'
    };

    if (specificStrengths[nakshatra.name]) {
      strengths.push(specificStrengths[nakshatra.name]);
    }

    return strengths.slice(0, 3); // Limit to top 3 strengths
  }

  /**
   * Analyze compatibility challenges of a nakshatra
   * @param {Object} nakshatra - Birth nakshatra
   * @returns {Array} Compatibility challenges
   */
  analyzeCompatibilityChallenges(nakshatra) {
    const challenges = [];

    // Nature-based challenges
    if (nakshatra.nature === 'Fierce') {
      challenges.push('May need to temper intensity for relationship harmony');
    } else if (nakshatra.nature === 'Moveable') {
      challenges.push('Stability and commitment focus may be needed');
    }

    // Planet-based challenges
    const planetChallenges = {
      Mars: 'Assertiveness may sometimes manifest as conflict',
      Saturn: 'Emotional expression may be reserved or cautious',
      Rahu: 'Unconventional approaches may challenge partner stability',
      Ketu: 'Detachment may affect emotional availability'
    };

    if (planetChallenges[nakshatra.rulingPlanet]) {
      challenges.push(planetChallenges[nakshatra.rulingPlanet]);
    }

    // Nakshatra-specific challenges
    const specificChallenges = {
      Ardra: 'Emotional storms may challenge relationship stability',
      Mula: 'Philosophical detachment may affect intimacy level',
      Jyeshtha: 'Eldest child energy may create independence focus'
    };

    if (specificChallenges[nakshatra.name]) {
      challenges.push(specificChallenges[nakshatra.name]);
    }

    return challenges.slice(0, 2); // Limit to top 2 challenges
  }

  /**
   * Analyze compatibility between two nakshatras
   * @param {string} nakshatra1 - First nakshatra name
   * @param {string} nakshatra2 - Second nakshatra name
   * @returns {Object} Compatibility analysis
   */
  analyzeNakshatraCompatibility(nakshatra1, nakshatra2) {
    try {
      const nakshatras = this.dataRepo.getNakshatras();
      const n1 = nakshatras.find(n => n.name === nakshatra1);
      const n2 = nakshatras.find(n => n.name === nakshatra2);

      if (!n1 || !n2) {
        return { compatibility: 'neutral', message: 'Nakshatra data unavailable' };
      }

      // Check if they are compatible
      const compatibleSigns = this.dataRepo.getCompatibleNakshatras(nakshatra1);
      const bestMatches = this.dataRepo.getBestMatches(nakshatra1);

      let compatibility = 'neutral';
      let message = 'Compatible partners with complementary energies';

      if (bestMatches.includes(nakshatra2)) {
        compatibility = 'excellent';
        message = 'Exceptional match with high harmony potential';
      } else if (compatibleSigns.includes(nakshatra2)) {
        compatibility = 'good';
        message = 'Compatible with strong foundation potential';
      } else {
        // Check for challenging combinations
        const challengingCombos = [
          ['Ardra', 'Jyeshtha'], ['Mula', 'Purva Ashadha'], ['Ashlesha', 'Mula']
        ];
        const isChallengingCombo = challengingCombos.some(
          ([a, b]) => (nakshatra1 === a && nakshatra2 === b) ||
                     (nakshatra1 === b && nakshatra2 === a)
        );

        if (isChallengingCombo) {
          compatibility = 'challenging';
          message = 'Compatible through conscious effort and understanding';
        }
      }

      return {
        compatibility,
        message,
        strengths: this.getCompatibilityFactors(nakshatra1, nakshatra2, 'strengths'),
        challenges: this.getCompatibilityFactors(nakshatra1, nakshatra2, 'challenges')
      };
    } catch (error) {
      this.logger.error('Nakshatra compatibility analysis error:', error);
      return {
        compatibility: 'neutral',
        message: 'Compatibility analysis requires professional consultation'
      };
    }
  }

  /**
   * Get compatibility factors between two nakshatras
   * @param {string} n1 - First nakshatra
   * @param {string} n2 - Second nakshatra
   * @param {string} type - 'strengths' or 'challenges'
   * @returns {Array} Compatibility factors
   */
  getCompatibilityFactors(n1, n2, type) {
    const factors = {
      strengths: {
        RohiniHasta: ['Creative harmony', 'Family-oriented connection'],
        PushyaRevati: ['Nurturing bond', 'Spiritual companionship'],
        SwatiAnuradha: ['Balanced partnership', 'Mutual understanding']
      },
      challenges: {
        ArdraJyeshtha: ['Intensity management needed', 'Communication focus required'],
        MulaPurvaAshadha: ['Emotional understanding work', 'Patience development']
      }
    };

    const key = `${n1}${n2}`.replace(/\s+/g, '');
    const reverseKey = `${n2}${n1}`.replace(/\s+/g, '');

    if (type === 'strengths') {
      return factors.strengths[key] || factors.strengths[reverseKey] || ['Complementary energies'];
    } else {
      return factors.challenges[key] || factors.challenges[reverseKey] || ['Learn through experience'];
    }
  }

  /**
   * Generate relationship dynamics based on nakshatra combination
   * @param {string} nakshatra1 - First nakshatra
   * @param {string} nakshatra2 - Second nakshatra
   * @returns {Object} Relationship dynamics
   */
  generateRelationshipDynamics(nakshatra1, nakshatra2) {
    const nakshatras = this.dataRepo.getNakshatras();
    const n1 = nakshatras.find(n => n.name === nakshatra1);
    const n2 = nakshatras.find(n => n.name === nakshatra2);

    const dynamics = {
      communication: 'Balanced interaction',
      intimacy: 'Developing emotional depth',
      stability: 'Growing security',
      growth: 'Mutual learning and evolution'
    };

    // Analyze based on planetary combinations
    if (n1?.rulingPlanet === 'Venus' || n2?.rulingPlanet === 'Venus') {
      dynamics.intimacy = 'Romantic and affectionate connection';
    }

    if (n1?.rulingPlanet === 'Moon' || n2?.rulingPlanet === 'Moon') {
      dynamics.intimacy = 'Deep emotional understanding';
    }

    if (n1?.rulingPlanet === 'Saturn' || n2?.rulingPlanet === 'Saturn') {
      dynamics.stability = 'Structured and committed partnership';
    }

    // Nakshatra nature combinations
    if ((n1?.nature === 'Light' && n2?.nature === 'Fixed') ||
        (n1?.nature === 'Fixed' && n2?.nature === 'Light')) {
      dynamics.communication = 'Clear and balanced interaction';
    }

    if ((n1?.nature === 'Fierce' && n2?.nature === 'Soft') ||
        (n1?.nature === 'Soft' && n2?.nature === 'Fierce')) {
      dynamics.growth = 'Intense learning through differences';
    }

    return dynamics;
  }

  /**
   * Generate love compatibility score
   * @param {string} nakshatra1 - First nakshatra
   * @param {string} nakshatra2 - Second nakshatra
   * @returns {Object} Compatibility score and rating
   */
  generateCompatibilityScore(nakshatra1, nakshatra2) {
    try {
      const analysis = this.analyzeNakshatraCompatibility(nakshatra1, nakshatra2);

      const scores = {
        excellent: { min: 85, max: 100, description: 'Exceptional cosmic harmony' },
        good: { min: 70, max: 84, description: 'Strong supportive connection' },
        neutral: { min: 50, max: 69, description: 'Balanced complementary energies' },
        challenging: { min: 30, max: 49, description: 'Growth through understanding' },
        difficult: { min: 0, max: 29, description: 'Significant adjustment needed' }
      };

      let score = 50; // Base neutral score
      const compatibility = scores[analysis.compatibility] || scores.neutral;

      // Adjust score based on analysis
      switch (analysis.compatibility) {
      case 'excellent':
        score = Math.floor(Math.random() * (compatibility.max - compatibility.min + 1)) + compatibility.min;
        break;
      case 'good':
        score = Math.floor(Math.random() * (compatibility.max - compatibility.min + 1)) + compatibility.min;
        break;
      case 'challenging':
        score = Math.floor(Math.random() * (compatibility.max - compatibility.min + 1)) + compatibility.min;
        break;
      default:
        score = Math.floor(Math.random() * 20) + 50; // 50-70 range
      }

      return {
        score,
        level: analysis.compatibility,
        description: compatibility.description,
        message: analysis.message
      };
    } catch (error) {
      this.logger.error('Compatibility score generation error:', error);
      return {
        score: 50,
        level: 'neutral',
        description: 'Balanced potential',
        message: 'Seek professional compatibility analysis'
      };
    }
  }

  /**
   * Get matching suggestions for optimal relationships
   * @param {string} birthNakshatra - Birth nakshatra name
   * @returns {Object} Relationship suggestions
   */
  getMatchingSuggestions(birthNakshatra) {
    try {
      const compatibleSigns = this.dataRepo.getCompatibleNakshatras(birthNakshatra);
      const bestMatches = this.dataRepo.getBestMatches(birthNakshatra);

      return {
        primaryMatches: bestMatches.slice(0, 3),
        compatibleMatches: compatibleSigns.slice(0, 5),
        relationshipGuidance: `Your ${birthNakshatra} nature seeks partners who complement your ${this.getNakshatraRelationshipStyle(birthNakshatra)} style.`,
        successFactors: this.getSuccessFactors(birthNakshatra)
      };
    } catch (error) {
      this.logger.error('Matching suggestions error:', error);
      return {
        primaryMatches: [],
        compatibleMatches: [],
        relationshipGuidance: 'Seek personalized relationship guidance',
        successFactors: ['Open communication', 'Mutual respect', 'Shared values']
      };
    }
  }

  /**
   * Get relationship style of nakshatra
   * @param {string} nakshatraName - Nakshatra name
   * @returns {string} Relationship style description
   */
  getNakshatraRelationshipStyle(nakshatraName) {
    const styles = {
      Rohini: 'nurturing and family-focused',
      Pushya: 'caring and supportive',
      Swati: 'independent yet harmonious',
      Anuradha: 'devotional and friendship-based',
      Revati: 'spiritual and guiding',
      Arjuna: 'dynamic and action-oriented',
      Punarvasu: 'spiritual and expansive'
    };
    return styles[nakshatraName] || 'balanced and complementary';
  }

  /**
   * Get success factors for relationships
   * @param {string} nakshatra - Birth nakshatra
   * @returns {Array} Success factors
   */
  getSuccessFactors(nakshatra) {
    const factors = [
      'Open and honest communication',
      'Mutual respect for individual needs',
      'Shared values and life goals',
      'Emotional support and understanding',
      'Patience during challenging periods'
    ];

    // Attach nakshatra-specific factors
    const specificFactors = {
      Rohini: 'Creative expression in the relationship',
      Pushya: 'Nurturing each other\'s growth',
      Swati: 'Respecting individual independence'
    };

    if (specificFactors[nakshatra]) {
      factors.push(specificFactors[nakshatra]);
    }

    return factors.slice(0, 6);
  }
}

module.exports = { NadiCompatibility };