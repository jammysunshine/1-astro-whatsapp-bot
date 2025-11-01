const logger = require('../../../../utils/logger');

/**
 * Vedic Compatibility Calculator
 * Handles detailed Vedic compatibility analysis between two birth charts
 * Includes Sun, Moon, Venus, Mars, Lagna compatibility with Vedic methods
 */
class CompatibilityCalculator {
  constructor(astrologer, geocodingService) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;
  }

  /**
   * Set services for the calculator
   * @param {Object} services - Service object
   */
  setServices(services) {
    this.services = services;
  }

  /**
   * Check compatibility between two people using Vedic astrology
   * @param {Object} person1 - First person's birth data
   * @param {Object} person2 - Second person's birth data
   * @returns {Object} Comprehensive compatibility analysis
   */
  async checkCompatibility(person1, person2) {
    try {
      this._validateCompatibilityData(person1, person2);

      // Generate birth charts for both people using chart generator service
      const chartService =
        this.services?.vedicCalculator?.chartGenerator ||
        this.services?.chartGenerator;

      if (!chartService) {
        throw new Error(
          'Chart generator service not available for compatibility analysis'
        );
      }

      const chart1 = await chartService.generateVedicKundli(person1);
      const chart2 = await chartService.generateVedicKundli(person2);

      // Calculate comprehensive compatibility score
      const compatibilityAnalysis = this._calculateComprehensiveCompatibility(
        chart1,
        chart2,
        person1,
        person2
      );

      return compatibilityAnalysis;
    } catch (error) {
      logger.error('❌ Error in Vedic compatibility analysis:', error);
      throw new Error(`Compatibility analysis failed: ${error.message}`);
    }
  }

  /**
   * Calculate comprehensive Vedic compatibility
   * @private
   * @param {Object} chart1 - First person's chart
   * @param {Object} chart2 - Second person's chart
   * @param {Object} person1 - First person's data
   * @param {Object} person2 - Second person's data
   * @returns {Object} Compatibility analysis
   */
  _calculateComprehensiveCompatibility(chart1, chart2, person1, person2) {
    // Calculate individual compatibility factors
    const factors = {
      sun: this._calculateSunCompatibility(chart1, chart2),
      moon: this._calculateMoonCompatibility(chart1, chart2),
      venus: this._calculateVenusCompatibility(chart1, chart2),
      mars: this._calculateMarsCompatibility(chart1, chart2),
      lagna: this._calculateLagnaCompatibility(chart1, chart2)
    };

    // Calculate overall score based on Vedic weights
    const overallScore = this._calculateOverallCompatibilityScore(factors);

    // Generate analysis and recommendations
    const analysis = this._generateCompatibilityAnalysis(factors, overallScore);
    const recommendations = this._generateCompatibilityRecommendations(
      factors,
      overallScore
    );

    return {
      type: 'ved_compat',
      overall_score: Math.round(overallScore),
      overall_rating: this._getCompatibilityRating(overallScore),
      compatibility_percentage: Math.min(
        100,
        Math.max(0, Math.round(overallScore))
      ),
      person1_name: person1.name || 'Person 1',
      person2_name: person2.name || 'Person 2',

      // Individual factor compatibilities
      sun_compatibility: factors.sun.description,
      moon_compatibility: factors.moon.description,
      venus_compatibility: factors.venus.description,
      mars_compatibility: factors.mars.description,
      lagna_compatibility: factors.lagna.description,

      // Detailed scores
      detailed_scores: {
        sun: factors.sun.score,
        moon: factors.moon.score,
        venus: factors.venus.score,
        mars: factors.mars.score,
        lagna: factors.lagna.score
      },

      // Analysis and recommendations
      analysis,
      recommendations,

      // Vedic compatibility factors
      vedic_factors: {
        nadi_compatibility: this._calculateNadiCompatibility(chart1, chart2),
        gana_compatibility: this._calculateGanaCompatibility(chart1, chart2),
        yoni_compatibility: this._calculateYoniCompatibility(chart1, chart2),
        graha_maitri: this._calculateGrahaMaitri(chart1, chart2),
        varna_compatibility: this._calculateVarnaCompatibility(chart1, chart2),
        tara_compatibility: this._calculateTaraCompatibility(chart1, chart2)
      }
    };
  }

  /**
   * Calculate Sun sign compatibility (core personality)
   * @private
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @returns {Object} Sun compatibility result
   */
  _calculateSunCompatibility(chart1, chart2) {
    const sun1 = chart1.planetaryPositions?.sun?.sign;
    const sun2 = chart2.planetaryPositions?.sun?.sign;

    if (!sun1 || !sun2) {
      return {
        score: 50,
        description: 'Unable to analyze sun sign compatibility'
      };
    }

    const score = this._getSignCompatibilityScore(sun1, sun2);

    return {
      score,
      description:
        score >= 8 ?
          'Excellent core personality harmony' :
          score >= 6 ?
            'Good personality compatibility' :
            score >= 4 ?
              'Neutral personality connection' :
              'Challenging personality dynamics'
    };
  }

  /**
   * Calculate Moon sign compatibility (emotional nature)
   * @private
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @returns {Object} Moon compatibility result
   */
  _calculateMoonCompatibility(chart1, chart2) {
    const moon1 = chart1.planetaryPositions?.moon?.sign;
    const moon2 = chart2.planetaryPositions?.moon?.sign;

    if (!moon1 || !moon2) {
      return {
        score: 50,
        description: 'Unable to analyze moon sign compatibility'
      };
    }

    const score = this._getSignCompatibilityScore(moon1, moon2);

    return {
      score,
      description:
        score >= 8 ?
          'Harmonious emotional connection' :
          score >= 6 ?
            'Compatible emotional styles' :
            score >= 4 ?
              'Balanced emotional understanding' :
              'Different emotional approaches'
    };
  }

  /**
   * Calculate Venus compatibility (love, values, finances)
   * @private
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @returns {Object} Venus compatibility result
   */
  _calculateVenusCompatibility(chart1, chart2) {
    const venus1 = chart1.planetaryPositions?.venus;
    const venus2 = chart2.planetaryPositions?.venus;

    if (!venus1 || !venus2) {
      return {
        score: 50,
        description: 'Unable to analyze Venus compatibility'
      };
    }

    let score = this._getSignCompatibilityScore(venus1.sign, venus2.sign);

    // Bonus for same element
    const element1 = this._getSignElement(venus1.sign);
    const element2 = this._getSignElement(venus2.sign);
    if (element1 === element2) {
      score = Math.min(10, score + 1);
    }

    return {
      score,
      description:
        score >= 8 ?
          'Romantically aligned with shared values' :
          score >= 6 ?
            'Romantically compatible' :
            score >= 4 ?
              'Romantically balanced' :
              'Romantically challenging'
    };
  }

  /**
   * Calculate Mars compatibility (energy, passion, conflict)
   * @private
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @returns {Object} Mars compatibility result
   */
  _calculateMarsCompatibility(chart1, chart2) {
    const mars1 = chart1.planetaryPositions?.mars?.sign;
    const mars2 = chart2.planetaryPositions?.mars?.sign;

    if (!mars1 || !mars2) {
      return { score: 50, description: 'Unable to analyze Mars compatibility' };
    }

    const score = this._getSignCompatibilityScore(mars1, mars2);

    return {
      score,
      description:
        score >= 8 ?
          'Energetically aligned' :
          score >= 6 ?
            'Energetically compatible' :
            score >= 4 ?
              'Energetically balanced' :
              'Energetically challenging'
    };
  }

  /**
   * Calculate Lagna compatibility (ascendant, physical attraction)
   * @private
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @returns {Object} Lagna compatibility result
   */
  _calculateLagnaCompatibility(chart1, chart2) {
    const lagna1 = chart1.lagna || chart1.ascendant;
    const lagna2 = chart2.lagna || chart2.ascendant;

    if (!lagna1 || !lagna2) {
      return {
        score: 50,
        description: 'Unable to analyze lagna compatibility'
      };
    }

    const score = this._getSignCompatibilityScore(lagna1, lagna2);

    return {
      score,
      description:
        score >= 8 ?
          'Personally harmonious' :
          score >= 6 ?
            'Personally compatible' :
            score >= 4 ?
              'Personally balanced' :
              'Personally challenging'
    };
  }

  /**
   * Get sign compatibility score (1-10 scale)
   * @private
   * @param {string} sign1 - First sign
   * @param {string} sign2 - Second sign
   * @returns {number} Compatibility score
   */
  _getSignCompatibilityScore(sign1, sign2) {
    if (!sign1 || !sign2) {
      return 5;
    }

    const signOrder = [
      'Aries',
      'Taurus',
      'Gemini',
      'Cancer',
      'Leo',
      'Virgo',
      'Libra',
      'Scorpio',
      'Sagittarius',
      'Capricorn',
      'Aquarius',
      'Pisces'
    ];
    const sign1Index = signOrder.indexOf(sign1);
    const sign2Index = signOrder.indexOf(sign2);

    if (sign1Index === -1 || sign2Index === -1) {
      return 5;
    }

    // Calculate angular distance (0-6)
    const angularDistance = Math.min(
      Math.abs(sign1Index - sign2Index),
      12 - Math.abs(sign1Index - sign2Index)
    );

    // Compatibility pattern: 5,6,7,8,7,6,5 (maximum harmony at 3 signs apart)
    const compatibilityScores = [5, 6, 7, 8, 7, 6, 5];
    return compatibilityScores[angularDistance] || 5;
  }

  /**
   * Get sign element
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Element
   */
  _getSignElement(sign) {
    const elements = {
      Aries: 'fire',
      Taurus: 'earth',
      Gemini: 'air',
      Cancer: 'water',
      Leo: 'fire',
      Virgo: 'earth',
      Libra: 'air',
      Scorpio: 'water',
      Sagittarius: 'fire',
      Capricorn: 'earth',
      Aquarius: 'air',
      Pisces: 'water'
    };
    return elements[sign] || '';
  }

  /**
   * Calculate overall compatibility score with Vedic weights
   * @private
   * @param {Object} factors - Individual compatibility factors
   * @returns {number} Overall score (0-100)
   */
  _calculateOverallCompatibilityScore(factors) {
    // Vedic compatibility weights (traditional system)
    const weights = {
      sun: 0.15, // Core identity (15%)
      moon: 0.25, // Emotional nature (25%)
      venus: 0.2, // Love and values (20%)
      mars: 0.15, // Energy and passion (15%)
      lagna: 0.25 // Physical attraction (25%)
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(factors).forEach(([factor, data]) => {
      if (data.score !== undefined && weights[factor]) {
        // Convert individual scores (1-10) to weighted percentage
        const weightedScore = (data.score / 10) * weights[factor] * 100;
        totalScore += weightedScore;
        totalWeight += weights[factor];
      }
    });

    return totalWeight > 0 ? (totalScore / totalWeight) * totalWeight : 50;
  }

  /**
   * Generate compatibility analysis
   * @private
   * @param {Object} factors - Compatibility factors
   * @param {number} overallScore - Overall score
   * @returns {string} Analysis text
   */
  _generateCompatibilityAnalysis(factors, overallScore) {
    if (overallScore >= 80) {
      return 'This is an excellent match showing strong compatibility across all major astrological factors. The relationship has excellent potential for harmony, mutual understanding, and long-term success.';
    } else if (overallScore >= 65) {
      return 'This is a very good match with strong compatibility in most areas. Some areas may need conscious effort, but overall positive potential exists for a successful relationship.';
    } else if (overallScore >= 50) {
      return 'This is a moderate match with balanced compatibility. While there are some challenging areas, conscious effort and understanding can lead to a workable relationship.';
    } else if (overallScore >= 35) {
      return 'This match has some challenges that will require significant effort and understanding from both partners. Professional astrological guidance recommended.';
    } else {
      return 'This compatibility has major challenges across multiple astrological factors. Consider whether this relationship aligns with your long-term goals and values.';
    }
  }

  /**
   * Generate compatibility recommendations
   * @private
   * @param {Object} factors - Compatibility factors
   * @param {number} overallScore - Overall score
   * @returns {Array} Recommendations
   */
  _generateCompatibilityRecommendations(factors, overallScore) {
    const recommendations = [];

    if (overallScore >= 70) {
      recommendations.push(
        '🌟 This strong compatibility provides an excellent foundation for a harmonious relationship'
      );
      recommendations.push(
        '💕 Focus on nurturing the natural harmony between you through mutual respect and understanding'
      );
      recommendations.push(
        '🙏 Consider traditional Vedic ceremonies to strengthen the relationship bond'
      );
    } else if (overallScore >= 50) {
      recommendations.push(
        '🤝 This moderate compatibility requires conscious effort and communication'
      );
      recommendations.push(
        '💬 Focus on understanding and compromising on areas of difference'
      );
      recommendations.push(
        '📚 Consider astrological counseling to navigate challenges effectively'
      );
    } else {
      recommendations.push(
        '⚠️ This relationship may require significant effort and understanding'
      );
      recommendations.push(
        '🏥 Consider professional counseling along with astrological guidance'
      );
      recommendations.push(
        '🔮 Evaluate whether this relationship aligns with your long-term life goals'
      );
    }

    // Specific recommendations based on weak areas
    if (factors.moon.score < 6) {
      recommendations.push(
        '😊 Work on emotional communication and understanding each other\'s feelings'
      );
    }

    if (factors.venus.score < 6) {
      recommendations.push('💝 Focus on shared values and relationship goals');
    }

    if (factors.mars.score < 6) {
      recommendations.push(
        '⚡ Find ways to align your energy levels and approaches to conflict'
      );
    }

    recommendations.push(
      '🌿 Remember that astrology provides guidance - relationships require mutual effort and respect'
    );

    return recommendations;
  }

  /**
   * Get compatibility rating text
   * @private
   * @param {number} score - Overall score
   * @returns {string} Rating text
   */
  _getCompatibilityRating(score) {
    if (score >= 80) {
      return 'Excellent';
    }
    if (score >= 65) {
      return 'Very Good';
    }
    if (score >= 50) {
      return 'Good';
    }
    if (score >= 35) {
      return 'Fair';
    }
    return 'Challenging';
  }

  // ============================================================================
  // VEDIC COMPATIBILITY METHODS (Ashta Kuta System)
  // ============================================================================

  /**
   * Calculate Nadi compatibility (prana, life force)
   * @private
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @returns {Object} Nadi compatibility
   */
  _calculateNadiCompatibility(chart1, chart2) {
    // Simplified Nadi calculation based on Moon's nakshatra
    // Full calculation would require detailed nadi analysis
    const nadi1 = this._getNadiFromMoon(chart1.planetaryPositions?.moon);
    const nadi2 = this._getNadiFromMoon(chart2.planetaryPositions?.moon);

    if (nadi1 === nadi2) {
      return {
        compatible: false,
        score: 0,
        reason: 'Same Nadi - traditionally not recommended'
      };
    }

    return {
      compatible: true,
      score: 8,
      reason: 'Different Nadi - good for progeny health'
    };
  }

  /**
   * Calculate Gana compatibility (temperament)
   * @private
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @returns {Object} Gana compatibility
   */
  _calculateGanaCompatibility(chart1, chart2) {
    // Simplified Gana calculation
    const gana1 = this._getGanaFromMoon(chart1.planetaryPositions?.moon);
    const gana2 = this._getGanaFromMoon(chart2.planetaryPositions?.moon);

    const compatible =
      (gana1 === 'dev' && gana2 !== 'rakshasa') ||
      gana1 === 'manushya' ||
      (gana1 === 'rakshasa' && gana2 === 'dev');

    return {
      compatible,
      gana1,
      gana2,
      score: compatible ? 8 : 4
    };
  }

  /**
   * Calculate Yoni compatibility (sexual/compatibility)
   * @private
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @returns {Object} Yoni compatibility
   */
  _calculateYoniCompatibility(chart1, chart2) {
    // Simplified Yoni calculation based on Moon nakshatra
    const yoni1 = this._getYoniFromMoon(chart1.planetaryPositions?.moon);
    const yoni2 = this._getYoniFromMoon(chart2.planetaryPositions?.moon);

    const compatible = yoni1 === yoni2; // Same Yoni is actually good for Yoni Kuta

    return {
      compatible,
      yoni1,
      yoni2,
      score: compatible ? 8 : 5
    };
  }

  /**
   * Calculate Graha Maitri (planetary friendship)
   * @private
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @returns {Object} Graha Maitri compatibility
   */
  _calculateGrahaMaitri(chart1, chart2) {
    // Simplified planetary friendship calculation
    const friendshipScore = this._calculateLordFriendship(
      chart1.planetaryPositions?.moon?.sign,
      chart2.planetaryPositions?.moon?.sign
    );

    return {
      score: friendshipScore,
      compatible: friendshipScore >= 6
    };
  }

  /**
   * Calculate Varna compatibility (caste/social order)
   * @private
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @returns {Object} Varna compatibility
   */
  _calculateVarnaCompatibility(chart1, chart2) {
    // Simplified Varna calculation from Moon nakshatra
    const varna1 = this._getVarnaFromMoon(chart1.planetaryPositions?.moon);
    const varna2 = this._getVarnaFromMoon(chart2.planetaryPositions?.moon);

    const compatible = this._isVarnaCompatible(varna1, varna2);

    return {
      compatible,
      varna1,
      varna2,
      score: compatible ? 8 : 5
    };
  }

  /**
   * Calculate Tara compatibility (star matching)
   * @private
   * @param {Object} chart1 - First chart
   * @param {Object} chart2 - Second chart
   * @returns {Object} Tara compatibility
   */
  _calculateTaraCompatibility(chart1, chart2) {
    // Simplified Tara calculation based on Moon positions
    const moon1Long = chart1.planetaryPositions?.moon?.longitude || 0;
    const moon2Long = chart2.planetaryPositions?.moon?.longitude || 0;

    const taraScore = this._calculateTaraScore(moon1Long, moon2Long);

    return {
      score: taraScore,
      compatible: taraScore >= 6
    };
  }

  // Helper methods for Vedic compatibility calculations
  _getNadiFromMoon(moon) {
    if (!moon) {
      return null;
    }
    const nakshatra = Math.floor(moon.longitude / 13.333); // 27 nakshatras * 13.333 degrees
    // Simplified: 1-9: Adya, 10-18: Madhya, 19-27: Antya
    return nakshatra <= 8 ? 'adya' : nakshatra <= 17 ? 'madhya' : 'antya';
  }

  _getGanaFromMoon(moon) {
    if (!moon) {
      return null;
    }
    const nakshatra = Math.floor(moon.longitude / 13.333);
    const ganas = ['dev', 'manushya', 'rakshasa'];
    return ganas[nakshatra % 3];
  }

  _getYoniFromMoon(moon) {
    if (!moon) {
      return null;
    }
    const nakshatra = Math.floor(moon.longitude / 13.333);
    const yonis = [
      'horse',
      'elephant',
      'sheep',
      'serpent',
      'dog',
      'cat',
      'rat',
      'cow',
      'buffalo',
      'tiger',
      'hare',
      'monkey',
      'lion',
      'mongoose'
    ];
    return yonis[nakshatra % yonis.length];
  }

  _calculateLordFriendship(sign1, sign2) {
    // Simplified planetary relationship scoring
    return 7; // Neutral-good friendship
  }

  _getVarnaFromMoon(moon) {
    if (!moon) {
      return null;
    }
    const nakshatra = Math.floor(moon.longitude / 13.333);
    const varnas = ['brahmin', 'kshatriya', 'vaishya', 'shudra'];
    return varnas[nakshatra % varnas.length];
  }

  _isVarnaCompatible(varna1, varna2) {
    // Traditional Varna compatibility (simplified)
    const compatible =
      varna1 === varna2 ||
      (varna1 === 'brahmin' && varna2 === 'kshatriya') ||
      (varna1 === 'kshatriya' && varna2 === 'vaishya');
    return compatible;
  }

  _calculateTaraScore(long1, long2) {
    const diff = Math.abs(long1 - long2);
    const taraUnit = 12.5; // 27 nakshatras in 360°, divided by 3 (past, present, future)
    const tara = Math.floor(diff / taraUnit) % 3;

    // Tara scoring: 1 (Jaya) good, 2 (Vijaya) medium, 3 (Riches) challenging
    return tara === 0 ? 8 : tara === 1 ? 6 : 4;
  }

  /**
   * Validate compatibility input data
   * @private
   * @param {Object} person1 - First person data
   * @param {Object} person2 - Second person data
   */
  _validateCompatibilityData(person1, person2) {
    if (!person1 || !person2) {
      throw new Error('Both persons\' data required for compatibility analysis');
    }

    const requiredFields = ['birthDate', 'birthTime', 'birthPlace'];
    for (const field of requiredFields) {
      if (!person1[field] || !person2[field]) {
        throw new Error(
          `Missing required field: ${field} for ${!person1[field] ? 'Person 1' : 'Person 2'}`
        );
      }
    }
  }
}

module.exports = { CompatibilityCalculator };
