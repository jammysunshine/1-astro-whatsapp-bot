const logger = require('../../../utils/logger');

/**
 * RelationshipInsightsGenerator - Generates psychological insights and advice
 * Creates personality-based insights, relationship strengths/challenges, and guidance
 */
class RelationshipInsightsGenerator {
  constructor() {
    this.logger = logger;
  }

  /**
   * Generate comprehensive relationship insights
   * @param {Object} synastryAnalysis - Complete synastry analysis
   * @param {Object} partnerData - Partner information
   * @returns {Object} Relationship insights
   */
  async generateRelationshipInsights(synastryAnalysis, partnerData) {
    try {
      const emotions = synastryAnalysis.interchartAspects || [];
      const overlays = synastryAnalysis.houseOverlays || {};
      const dynamics = synastryAnalysis.relationshipDynamics || {};

      return {
        overview: this.getCompatibilityOverview(
          synastryAnalysis.compatibilityScores?.level,
          partnerData?.name
        ),
        strengths: this.extractRelationshipStrengths(synastryAnalysis),
        challenges: this.extractRelationshipChallenges(synastryAnalysis),
        dynamics,
        advice: this.generateRelationshipAdvice(
          this.extractRelationshipStrengths(synastryAnalysis),
          this.extractRelationshipChallenges(synastryAnalysis)
        )
      };
    } catch (error) {
      this.logger.error('Relationship insights generation error:', error);
      return {
        overview: 'Error generating relationship insights',
        strengths: [],
        challenges: [],
        dynamics: {},
        advice:
          'Please consult a professional astrologer for detailed analysis'
      };
    }
  }

  /**
   * Get compatibility overview based on score level
   * @param {string} level - Compatibility level
   * @param {string} partnerName - Partner name
   * @returns {string} Overview description
   */
  getCompatibilityOverview(level, partnerName) {
    const partner = partnerName || 'partner';
    const overviews = {
      exceptional: `🌟 Exceptional cosmic harmony with ${partner}! Your charts resonate with rare perfection and deep soul recognition.`,
      excellent: `💫 Excellent astrological compatibility with ${partner}. Your energies support and enhance each other beautifully.`,
      very_good: `💞 Very good compatibility with ${partner}. Your planetary connections create smooth flowing harmony.`,
      good: `✅ Positive potential with ${partner}. Your charts show complementary energies that can build lasting harmony.`,
      fair: `⚖️ Balanced compatibility with ${partner}. Conscious effort will nurture your relationship's potential.`,
      moderate: `🔄 Moderate compatibility with ${partner}. Growth opportunities abound through mutual understanding.`,
      challenging: `⚡ Dynamic compatibility with ${partner}. This connection offers powerful lessons and transformation.`,
      difficult: `🔍 Complex compatibility with ${partner}. Professional astrological guidance recommended for navigation.`
    };
    return (
      overviews[level] ||
      `Unique astrological pattern with ${partner} - professional consultation advised.`
    );
  }

  /**
   * Extract relationship strengths from analysis
   * @param {Object} analysis - Synastry analysis
   * @returns {Array} Strength descriptions
   */
  extractRelationshipStrengths(analysis) {
    const strengths = [];
    const aspects = analysis.interchartAspects || [];

    // Harmonious aspects
    const trines = aspects.filter(a => a.aspect === 120);
    const sextiles = aspects.filter(a => a.aspect === 60);

    if (trines.length > 0) {
      strengths.push(
        `Natural flowing harmony through ${trines.length} trine aspects`
      );
    }

    if (sextiles.length > 0) {
      strengths.push(
        `Supportive energy fostering growth (${sextiles.length} sextile connections)`
      );
    }

    // Venus-Mars aspects (chemistry)
    const venusMars = aspects.filter(
      a =>
        (a.planet1 === 'Venus' && a.planet2 === 'Mars') ||
        (a.planet1 === 'Mars' && a.planet2 === 'Venus')
    );
    if (venusMars.length > 0) {
      strengths.push('Strong romantic and passionate chemistry indicated');
    }

    // Moon connections (emotional)
    const moonAspects = aspects.filter(
      a => a.planet1 === 'Moon' || a.planet2 === 'Moon'
    );
    if (moonAspects.length >= 2) {
      strengths.push('Deep emotional bond and intuitive understanding');
    }

    // Sun connections (identity)
    const sunAspects = aspects.filter(
      a => a.planet1 === 'Sun' || a.planet2 === 'Sun'
    );
    if (sunAspects.length > 0) {
      strengths.push(
        'Strong ego connection and mutual respect for individuality'
      );
    }

    // Mercury connections (communication)
    const mercuryAspects = aspects.filter(
      a => a.planet1 === 'Mercury' || a.planet2 === 'Mercury'
    );
    if (mercuryAspects.length >= 2) {
      strengths.push('Excellent mental rapport and communication flow');
    }

    return strengths.slice(0, 4);
  }

  /**
   * Extract relationship challenges from analysis
   * @param {Object} analysis - Synastry analysis
   * @returns {Array} Challenge descriptions
   */
  extractRelationshipChallenges(analysis) {
    const challenges = [];
    const aspects = analysis.interchartAspects || [];

    // Challenging aspects
    const squares = aspects.filter(a => a.aspect === 90);
    const oppositions = aspects.filter(a => a.aspect === 180);

    if (squares.length > 0) {
      challenges.push(
        `Growth challenges through ${squares.length} square aspect(s) - learning through tension`
      );
    }

    if (oppositions.length > 0) {
      challenges.push(
        `Polarity dynamics through ${oppositions.length} opposition(s) - learning balance`
      );
    }

    // Saturn aspects (commitment challenges)
    const saturnAspects = aspects.filter(
      a => a.planet1 === 'Saturn' || a.planet2 === 'Saturn'
    );
    if (saturnAspects.some(a => a.aspect >= 90)) {
      challenges.push(
        'Long-term commitment aspects may present patience-testing situations'
      );
    }

    // Mars aspects (conflict potential)
    const marsAspects = aspects.filter(
      a => a.planet1 === 'Mars' || a.planet2 === 'Mars'
    );
    if (marsAspects.some(a => a.aspect >= 90)) {
      challenges.push(
        'Potential for conflicts requiring conscious conflict resolution'
      );
    }

    // Quincunx aspects (adjustment needed)
    const quincunxes = aspects.filter(a => a.aspect === 150);
    if (quincunxes.length > 0) {
      challenges.push(
        'Adjustment aspects indicate areas needing continual adaptation'
      );
    }

    return challenges.slice(0, 3);
  }

  /**
   * Generate relationship advice based on strengths/challenges
   * @param {Array} strengths - Relationship strengths
   * @param {Array} challenges - Relationship challenges
   * @returns {string} Personalized advice
   */
  generateRelationshipAdvice(strengths, challenges) {
    const strengthCount = strengths.length;
    const challengeCount = challenges.length;

    if (strengthCount > challengeCount) {
      return strengths.some(
        s => s.includes('emotional') || s.includes('communication')
      ) ?
        'Your relationship has excellent foundations. Focus on nurturing your natural emotional and communicative connections while gently addressing areas needing attention.' :
        'Your relationship enjoys natural harmony. Continue building on your planetary supports while navigating challenges with patience.';
    } else if (challengeCount > 0) {
      return strengths.length > 0 ?
        'This relationship offers powerful growth opportunities. Approach challenges with commitment while nurturing your points of natural connection.' :
        'This connection provides significant learning opportunities. Professional astrological guidance can help navigate the transformative journey ahead.';
    } else {
      return 'Your planetary connections suggest complementary energies that create a balanced partnership. Continue building mutual understanding and support.';
    }
  }
}

module.exports = { RelationshipInsightsGenerator };
