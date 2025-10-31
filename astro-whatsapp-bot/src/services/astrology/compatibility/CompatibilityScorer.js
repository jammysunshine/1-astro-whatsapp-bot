const logger = require('../../../utils/logger');

/**
 * CompatibilityScorer - Handles compatibility scoring and analysis
 * Calculates overall scores, categorizes by aspects/overlays, and determines compatibility levels
 */
class CompatibilityScorer {
  constructor() {
    this.logger = logger;
  }

  /**
   * Calculate comprehensive compatibility scores
   * @param {Array} aspects - Interchart aspects
   * @param {Object} overlays - House overlays
   * @returns {Object} Compatibility scores and insights
   */
  calculateCompatibilityScores(aspects, overlays) {
    try {
      let totalScore = this.calculateBaseScore(aspects, overlays);
      totalScore = Math.max(0, Math.min(100, totalScore));

      const categories = {
        aspects: this.scoreAspectsSection(aspects),
        overlays: this.scoreOverlaysSection(overlays),
        composite: this.analyzeCompositeHarmony(overlays)
      };

      const level = this.determineCompatibilityLevel(totalScore);
      const insights = this.generateScoringInsights(totalScore, categories, level);

      return {
        overall: totalScore,
        categories,
        level,
        insights,
        breakdown: {
          aspectsScore: aspects.length > 0 ? this.scoreAspectsSection(aspects).score || 0 : 0,
          overlaysScore: this.scoreOverlaysSection(overlays).score || 0,
          compositeScore: this.analyzeCompositeHarmony(overlays).score || 0
        }
      };
    } catch (error) {
      this.logger.error('Compatibility scoring error:', error);
      return {
        overall: 50,
        categories: { aspects: {}, overlays: {}, composite: {} },
        level: 'moderate',
        error: 'Unable to calculate compatibility scores'
      };
    }
  }

  /**
   * Calculate base compatibility score from aspects and overlays
   * @param {Array} aspects - Interchart aspects
   * @param {Object} overlays - House overlays
   * @returns {number} Base score (0-100)
   */
  calculateBaseScore(aspects, overlays) {
    let totalScore = 50; // Base score

    // Score aspects (top 15 for comprehensive analysis)
    const topAspects = aspects.slice(0, 15);
    totalScore += this.calculateAspectScore(topAspects);

    // Score house overlays (relationship houses are more important)
    totalScore += this.calculateOverlayScore(overlays);

    return Math.round(totalScore);
  }

  /**
   * Calculate score contribution from aspects
   * @param {Array} aspects - Aspects to score
   * @returns {number} Score contribution
   */
  calculateAspectScore(aspects) {
    let score = 0;

    for (const aspect of aspects) {
      switch (aspect.aspect) {
      case 120: // Trine
        score += 5;
        break;
      case 60: // Sextile
        score += 3;
        break;
      case 0: // Conjunction
        score += this.scoreConjunction(aspect.planet1, aspect.planet2, aspect.orb);
        break;
      case 90: // Square
        score -= 3;
        break;
      case 180: // Opposition
        score -= 2;
        break;
      case 150: // Quincunx
        score -= 1;
        break;
      }
    }

    // Bonus for multiple harmonious aspects
    const harmoniousCount = aspects.filter(a => a.aspect <= 60).length;
    if (harmoniousCount >= 5) { score += 5; } else if (harmoniousCount >= 3) { score += 3; }

    return Math.round(score);
  }

  /**
   * Score conjunction based on planet types
   * @param {string} planet1 - First planet
   * @param {string} planet2 - Second planet
   * @param {number} orb - Aspect orb
   * @returns {number} Conjunction score
   */
  scoreConjunction(planet1, planet2, orb) {
    const beneficialPlanets = ['Venus', 'Jupiter'];
    const challengingPlanets = ['Saturn', 'Mars'];

    // Venus-Venus or Jupiter-Jupiter conjunctions are very beneficial
    if ((beneficialPlanets.includes(planet1) && planet1 === planet2)) {
      return Math.abs(orb) <= 2 ? 4 : 2; // Tighter orb = higher score
    }

    // Venus-Jupiter mutual reception is excellent
    if ((planet1 === 'Venus' && planet2 === 'Jupiter') ||
        (planet1 === 'Jupiter' && planet2 === 'Venus')) {
      return Math.abs(orb) <= 3 ? 3 : 1;
    }

    // Sun-Moon conjunction is very significant for relationships
    if ((planet1 === 'Sun' && planet2 === 'Moon') ||
        (planet1 === 'Moon' && planet2 === 'Sun')) {
      return Math.abs(orb) <= 4 ? 3 : 1;
    }

    // Saturn conjunctions can be challenging but committed
    if (challengingPlanets.includes(planet1) || challengingPlanets.includes(planet2)) {
      return 0; // Neutral - depends on context
    }

    // Default conjunction scoring
    return Math.abs(orb) <= 3 ? 2 : 1;
  }

  /**
   * Calculate score contribution from house overlays
   * @param {Object} overlays - House overlays
   * @returns {number} Score contribution
   */
  calculateOverlayScore(overlays) {
    let score = 0;
    const relationshipHouses = [1, 5, 7, 8]; // Houses important for relationships
    const beneficialPlanets = ['Venus', 'Jupiter', 'Moon'];

    // Score user's planets in partner's relationship houses
    for (const [planet, data] of Object.entries(overlays.userInPartnerHouses || {})) {
      if (relationshipHouses.includes(data.house)) {
        if (beneficialPlanets.includes(planet)) {
          score += 2;
        } else {
          score += 1;
        }
      }
    }

    // Score partner's planets in user's relationship houses
    for (const [planet, data] of Object.entries(overlays.partnerInUserHouses || {})) {
      if (relationshipHouses.includes(data.house)) {
        if (beneficialPlanets.includes(planet)) {
          score += 2;
        } else {
          score += 1;
        }
      }
    }

    return Math.round(score);
  }

  /**
   * Score aspects section with detailed breakdown
   * @param {Array} aspects - Interchart aspects
   * @returns {Object} Detailed aspect scoring
   */
  scoreAspectsSection(aspects) {
    const harmoniousAspects = aspects.filter(a => [0, 60, 120].includes(a.aspect));
    const challengingAspects = aspects.filter(a => [90, 180, 150].includes(a.aspect));
    const neutralAspects = aspects.filter(a => a.aspect === undefined || ![0, 60, 90, 120, 150, 180].includes(a.aspect));

    return {
      harmonious: harmoniousAspects.length,
      challenging: challengingAspects.length,
      neutral: neutralAspects.length,
      score: this.calculateAspectScore(aspects.slice(0, 10)), // Score top aspects
      dominantType: harmoniousAspects.length > challengingAspects.length ? 'harmonious' : 'challenging'
    };
  }

  /**
   * Score overlays section with detailed breakdown
   * @param {Object} overlays - House overlays
   * @returns {Object} Detailed overlay scoring
   */
  scoreOverlaysSection(overlays) {
    const relationshipHouses = [5, 7, 8];
    let relationshipPlanetCount = 0;

    // Count planets in relationship houses
    for (const house of relationshipHouses) {
      const userPlanets = Object.values(overlays.userInPartnerHouses || {})
        .filter(data => data.house === house).length;
      const partnerPlanets = Object.values(overlays.partnerInUserHouses || {})
        .filter(data => data.house === house).length;
      relationshipPlanetCount += userPlanets + partnerPlanets;
    }

    const score = Math.min(relationshipPlanetCount * 2, 10); // Cap at 10 points

    return {
      relationshipHouses: relationshipPlanetCount,
      score,
      strength: relationshipPlanetCount >= 3 ? 'strong' : relationshipPlanetCount >= 2 ? 'moderate' : 'weak'
    };
  }

  /**
   * Analyze composite harmony for scoring
   * @param {Object} overlays - House overlays
   * @returns {Object} Composite analysis
   */
  analyzeCompositeHarmony(overlays) {
    const relationshipPlanets = ['Venus', 'Mars', 'Moon', 'Sun'];
    let harmonyScore = 0;

    // Check for mutual planetary placements in relationship houses
    relationshipPlanets.forEach(planet => {
      const userInPartner = overlays.userInPartnerHouses?.[planet];
      const partnerInUser = overlays.partnerInUserHouses?.[planet];

      if (userInPartner?.house >= 7 && userInPartner?.house <= 8 &&
          partnerInUser?.house >= 7 && partnerInUser?.house <= 8) {
        harmonyScore += 2; // Mutual deep relationship placement
      } else if ((userInPartner?.house && userInPartner.house >= 5 && userInPartner.house <= 8) ||
                 (partnerInUser?.house && partnerInUser.house >= 5 && partnerInUser.house <= 8)) {
        harmonyScore += 1; // One-sided relationship placement
      }
    });

    return {
      score: Math.min(harmonyScore, 10),
      harmony: harmonyScore >= 4 ? 'very_high' : harmonyScore >= 2 ? 'moderate' : 'developing',
      description: harmonyScore >= 4 ? 'Deep mutual understanding' :
        harmonyScore >= 2 ? 'Balanced give-and-take' : 'Learning balance together'
    };
  }

  /**
   * Determine compatibility level from score
   * @param {number} score - Overall score
   * @returns {string} Compatibility level
   */
  determineCompatibilityLevel(score) {
    if (score >= 85) { return 'exceptional'; }
    if (score >= 80) { return 'excellent'; }
    if (score >= 70) { return 'very_good'; }
    if (score >= 60) { return 'good'; }
    if (score >= 50) { return 'fair'; }
    if (score >= 40) { return 'moderate'; }
    if (score >= 30) { return 'challenging'; }
    return 'difficult';
  }

  /**
   * Generate scoring insights based on results
   * @param {number} totalScore - Overall score
   * @param {Object} categories - Category scores
   * @param {string} level - Compatibility level
   * @returns {Object} Scoring insights
   */
  generateScoringInsights(totalScore, categories, level) {
    const insights = {
      overall: this.getOverallInsight(level, totalScore),
      strengths: this.identifyScoringStrengths(categories),
      concerns: this.identifyScoringConcerns(categories),
      potential: this.assessGrowthPotential(totalScore, categories)
    };

    return insights;
  }

  /**
   * Get overall compatibility insight
   * @param {string} level - Compatibility level
   * @param {number} score - Overall score
   * @returns {string} Overall insight
   */
  getOverallInsight(level, score) {
    const insights = {
      exceptional: 'Exceptional cosmic harmony - your charts resonate with rare perfection',
      excellent: 'Excellent astrological compatibility with strong harmonious foundations',
      very_good: 'Very good compatibility with smooth flowing energies',
      good: 'Good compatibility with complementary energies and manageable challenges',
      fair: 'Fair compatibility requiring conscious effort and understanding',
      moderate: 'Moderate compatibility with opportunities for learned harmony',
      challenging: 'Challenging compatibility offering powerful growth lessons',
      difficult: 'Difficult compatibility requiring professional astrological guidance'
    };

    return insights[level] || `Compatibility score: ${score}/100 - unique astrological dynamic`;
  }

  /**
   * Identify scoring strengths
   * @param {Object} categories - Category scores
   * @returns {Array} Strength descriptions
   */
  identifyScoringStrengths(categories) {
    const strengths = [];

    if (categories.aspects.harmonious > categories.aspects.challenging) {
      strengths.push('Strong harmonious aspect patterns provide natural ease');
    }

    if (categories.overlays.strength === 'strong') {
      strengths.push('Powerful house overlay connections deepen commitment');
    }

    if (categories.composite.harmony === 'very_high') {
      strengths.push('Exceptional composite chart harmony indicates shared purpose');
    }

    return strengths;
  }

  /**
   * Identify scoring concerns
   * @param {Object} categories - Category scores
   * @returns {Array} Concern descriptions
   */
  identifyScoringConcerns(categories) {
    const concerns = [];

    if (categories.aspects.challenging > categories.aspects.harmonious) {
      concerns.push('Several challenging aspects require patience and understanding');
    }

    if (categories.overlays.strength === 'weak') {
      concerns.push('Limited house overlays suggest areas needing attention');
    }

    return concerns;
  }

  /**
   * Assess growth potential
   * @param {number} score - Overall score
   * @param {Object} categories - Category scores
   * @returns {string} Growth potential assessment
   */
  assessGrowthPotential(score, categories) {
    if (score >= 60) {
      return categories.aspects.harmonious > 0 ?
        'Excellent growth potential through harmonious planetary connections' :
        'Strong foundation for lasting relationship development';
    }

    return categories.aspects.challenging > 0 ?
      'Significant growth potential through conscious challenge resolution' :
      'Growth opportunity through deepened understanding and acceptance';
  }
}

module.exports = { CompatibilityScorer };
