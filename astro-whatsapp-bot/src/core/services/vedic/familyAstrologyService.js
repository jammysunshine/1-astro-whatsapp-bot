/**
 * Family Astrology Service
 *
 * Provides comprehensive family astrology analysis including compatibility between family members,
 * generational patterns, ancestral influences, and family relationship dynamics using
 * Vedic astrological principles and Swiss Ephemeris calculations.
 */

const GroupAstrologyCalculator = require('../../../services/astrology/vedic/calculators/GroupAstrologyCalculator');
const CompatibilityScorer = require('../../../services/astrology/compatibility/CompatibilityScorer');
const logger = require('../../../../utils/logger');

class FamilyAstrologyService {
  constructor() {
    this.groupCalculator = new GroupAstrologyCalculator();
    this.compatibilityScorer = new CompatibilityScorer();
    logger.info('FamilyAstrologyService initialized');
  }

  /**
   * Execute comprehensive family astrology analysis
   * @param {Object} familyData - Family analysis request data
   * @returns {Promise<Object>} Complete family analysis
   */
  async execute(familyData) {
    try {
      // Input validation
      this._validateInput(familyData);

      // Get comprehensive family analysis
      const result = await this.getFamilyAstrologyAnalysis(familyData);

      // Format and return result
      return this._formatResult(result);

    } catch (error) {
      logger.error('FamilyAstrologyService error:', error);
      throw new Error(`Family astrology analysis failed: ${error.message}`);
    }
  }

  /**
   * Get comprehensive family astrology analysis
   * @param {Object} familyData - Family data including multiple members
   * @returns {Promise<Object>} Family astrology analysis
   */
  async getFamilyAstrologyAnalysis(familyData) {
    try {
      const { familyMembers, analysisType, focusAreas } = familyData;

      // Analyze individual family member charts
      const memberAnalyses = await this._analyzeFamilyMembers(familyMembers);

      // Calculate compatibility between family members
      const compatibilityMatrix = await this._calculateFamilyCompatibility(familyMembers);

      // Identify generational patterns
      const generationalPatterns = this._identifyGenerationalPatterns(memberAnalyses);

      // Analyze ancestral influences
      const ancestralInfluences = this._analyzeAncestralInfluences(memberAnalyses);

      // Generate family relationship dynamics
      const relationshipDynamics = this._analyzeRelationshipDynamics(compatibilityMatrix, memberAnalyses);

      // Create family recommendations
      const recommendations = this._generateFamilyRecommendations(compatibilityMatrix, generationalPatterns, ancestralInfluences);

      return {
        familyMembers: familyMembers.map(m => ({ name: m.name, role: m.role })),
        analysisType,
        focusAreas,
        memberAnalyses,
        compatibilityMatrix,
        generationalPatterns,
        ancestralInfluences,
        relationshipDynamics,
        recommendations,
        familyStrength: this._calculateFamilyStrength(compatibilityMatrix, generationalPatterns)
      };
    } catch (error) {
      logger.error('Error getting family astrology analysis:', error);
      throw error;
    }
  }

  /**
   * Analyze individual family member charts
   * @param {Array} familyMembers - Array of family member data
   * @returns {Promise<Array>} Member analyses
   * @private
   */
  async _analyzeFamilyMembers(familyMembers) {
    try {
      const analyses = [];

      for (const member of familyMembers) {
        const analysis = {
          name: member.name,
          role: member.role,
          keyPlanets: this._extractKeyPlanets(member),
          dominantTraits: this._identifyDominantTraits(member),
          lifeThemes: this._identifyLifeThemes(member),
          generationalInfluence: this._assessGenerationalInfluence(member)
        };
        analyses.push(analysis);
      }

      return analyses;
    } catch (error) {
      logger.warn('Could not analyze family members:', error.message);
      return [];
    }
  }

  /**
   * Calculate compatibility between family members
   * @param {Array} familyMembers - Family member data
   * @returns {Promise<Object>} Compatibility matrix
   * @private
   */
  async _calculateFamilyCompatibility(familyMembers) {
    try {
      const matrix = {};

      // Calculate pairwise compatibility
      for (let i = 0; i < familyMembers.length; i++) {
        for (let j = i + 1; j < familyMembers.length; j++) {
          const member1 = familyMembers[i];
          const member2 = familyMembers[j];

          const compatibility = await this.compatibilityScorer.calculateCompatibilityScore(member1, member2);

          const key = `${member1.name}-${member2.name}`;
          matrix[key] = {
            members: [member1.name, member2.name],
            roles: [member1.role, member2.role],
            score: compatibility.overall || 0,
            harmony: compatibility.overall > 70 ? 'High' :
                    compatibility.overall > 50 ? 'Moderate' : 'Challenging',
            keyFactors: this._extractCompatibilityFactors(compatibility)
          };
        }
      }

      return matrix;
    } catch (error) {
      logger.warn('Could not calculate family compatibility:', error.message);
      return {};
    }
  }

  /**
   * Identify generational patterns in the family
   * @param {Array} memberAnalyses - Individual member analyses
   * @returns {Object} Generational patterns
   * @private
   */
  _identifyGenerationalPatterns(memberAnalyses) {
    try {
      const patterns = {
        dominantPlanets: {},
        recurringThemes: {},
        familyStrengths: [],
        familyChallenges: [],
        inheritancePatterns: {}
      };

      // Group by generations (simplified)
      const generations = this._groupByGeneration(memberAnalyses);

      // Analyze patterns within each generation
      Object.entries(generations).forEach(([gen, members]) => {
        const genPatterns = this._analyzeGenerationPatterns(members);
        patterns.dominantPlanets[gen] = genPatterns.dominantPlanets;
        patterns.recurringThemes[gen] = genPatterns.themes;
      });

      // Identify family-wide patterns
      patterns.familyStrengths = this._identifyFamilyStrengths(memberAnalyses);
      patterns.familyChallenges = this._identifyFamilyChallenges(memberAnalyses);
      patterns.inheritancePatterns = this._analyzeInheritancePatterns(memberAnalyses);

      return patterns;
    } catch (error) {
      logger.warn('Could not identify generational patterns:', error.message);
      return {};
    }
  }

  /**
   * Analyze ancestral influences
   * @param {Array} memberAnalyses - Member analyses
   * @returns {Object} Ancestral influences
   * @private
   */
  _analyzeAncestralInfluences(memberAnalyses) {
    try {
      const influences = {
        karmicPatterns: [],
        ancestralGifts: [],
        inheritedChallenges: [],
        spiritualLineage: '',
        recommendations: []
      };

      // Look for Saturn placements (karma, ancestry)
      const saturnInfluences = memberAnalyses.filter(m =>
        m.keyPlanets.some(p => p.planet === 'Saturn' && p.strength === 'Strong')
      );

      if (saturnInfluences.length > 0) {
        influences.karmicPatterns.push('Strong ancestral karma patterns present');
        influences.recommendations.push('Consider ancestral healing practices');
      }

      // Look for Jupiter placements (wisdom, spiritual lineage)
      const jupiterInfluences = memberAnalyses.filter(m =>
        m.keyPlanets.some(p => p.planet === 'Jupiter' && p.strength === 'Strong')
      );

      if (jupiterInfluences.length > 0) {
        influences.ancestralGifts.push('Spiritual wisdom and teaching abilities');
        influences.spiritualLineage = 'Strong spiritual lineage present';
      }

      // Look for Rahu/Ketu placements (past life karma)
      const nodalInfluences = memberAnalyses.filter(m =>
        m.keyPlanets.some(p => ['Rahu', 'Ketu'].includes(p.planet))
      );

      if (nodalInfluences.length > 0) {
        influences.karmicPatterns.push('Past life ancestral connections');
        influences.recommendations.push('Explore family history and ancestral practices');
      }

      return influences;
    } catch (error) {
      logger.warn('Could not analyze ancestral influences:', error.message);
      return {};
    }
  }

  /**
   * Analyze relationship dynamics within the family
   * @param {Object} compatibilityMatrix - Compatibility scores
   * @param {Array} memberAnalyses - Member analyses
   * @returns {Object} Relationship dynamics
   * @private
   */
  _analyzeRelationshipDynamics(compatibilityMatrix, memberAnalyses) {
    try {
      const dynamics = {
        harmoniousPairs: [],
        challengingPairs: [],
        familyRoles: {},
        communicationPatterns: '',
        supportSystems: []
      };

      // Identify harmonious and challenging relationships
      Object.values(compatibilityMatrix).forEach(pair => {
        if (pair.harmony === 'High') {
          dynamics.harmoniousPairs.push({
            members: pair.members,
            roles: pair.roles,
            strength: 'Natural harmony and understanding'
          });
        } else if (pair.harmony === 'Challenging') {
          dynamics.challengingPairs.push({
            members: pair.members,
            roles: pair.roles,
            growth: 'Opportunity for learning and personal development'
          });
        }
      });

      // Analyze family roles based on planetary influences
      memberAnalyses.forEach(member => {
        dynamics.familyRoles[member.name] = this._determineFamilyRole(member);
      });

      // Assess communication patterns
      dynamics.communicationPatterns = this._assessCommunicationPatterns(memberAnalyses);

      // Identify support systems
      dynamics.supportSystems = this._identifySupportSystems(compatibilityMatrix);

      return dynamics;
    } catch (error) {
      logger.warn('Could not analyze relationship dynamics:', error.message);
      return {};
    }
  }

  /**
   * Generate family recommendations
   * @param {Object} compatibilityMatrix - Compatibility data
   * @param {Object} generationalPatterns - Generational patterns
   * @param {Object} ancestralInfluences - Ancestral influences
   * @returns {Object} Family recommendations
   * @private
   */
  _generateFamilyRecommendations(compatibilityMatrix, generationalPatterns, ancestralInfluences) {
    const recommendations = {
      immediate: [],
      relationship: [],
      spiritual: [],
      practical: []
    };

    // Immediate recommendations based on challenging relationships
    const challengingPairs = Object.values(compatibilityMatrix).filter(p => p.harmony === 'Challenging');
    if (challengingPairs.length > 0) {
      recommendations.immediate.push('Focus on understanding and patience with challenging family relationships');
      recommendations.relationship.push('Practice active listening and empathy in family communications');
    }

    // Relationship recommendations
    if (Object.values(compatibilityMatrix).some(p => p.harmony === 'High')) {
      recommendations.relationship.push('Leverage harmonious relationships as foundation for family strength');
    }

    // Spiritual recommendations based on ancestral influences
    if (ancestralInfluences.karmicPatterns.length > 0) {
      recommendations.spiritual.push('Consider family puja or ancestral rituals for karmic healing');
    }

    if (ancestralInfluences.spiritualLineage) {
      recommendations.spiritual.push('Explore family spiritual traditions and practices');
    }

    // Practical recommendations
    recommendations.practical.push('Schedule regular family meetings to discuss important matters');
    recommendations.practical.push('Create family traditions that honor both individual and collective needs');

    return recommendations;
  }

  // Helper methods for member analysis

  _extractKeyPlanets(member) {
    // Extract key planetary influences
    const keyPlanets = [];
    ['sun', 'moon', 'venus', 'mars', 'jupiter', 'saturn'].forEach(planet => {
      if (member[planet]) {
        const strength = this._assessPlanetStrength(member[planet]);
        if (strength !== 'Weak') {
          keyPlanets.push({
            planet: planet.charAt(0).toUpperCase() + planet.slice(1),
            sign: member[planet].sign,
            strength
          });
        }
      }
    });
    return keyPlanets;
  }

  _identifyDominantTraits(member) {
    // Identify dominant personality traits based on key planets
    const traits = [];
    if (member.sun?.sign) traits.push(this._getSunSignTrait(member.sun.sign));
    if (member.moon?.sign) traits.push(this._getMoonSignTrait(member.moon.sign));
    if (member.mars?.sign) traits.push(this._getMarsSignTrait(member.mars.sign));
    return [...new Set(traits)]; // Remove duplicates
  }

  _identifyLifeThemes(member) {
    // Identify life themes based on planetary placements
    const themes = [];
    if (member.jupiter?.house === 9) themes.push('Spirituality and higher learning');
    if (member.saturn?.house === 10) themes.push('Career and responsibility');
    if (member.venus?.house === 7) themes.push('Relationships and harmony');
    return themes;
  }

  _assessGenerationalInfluence(member) {
    // Assess how this member fits into generational patterns
    // Simplified assessment
    return 'Balanced generational influence';
  }

  // Helper methods for compatibility

  _extractCompatibilityFactors(compatibility) {
    // Extract key compatibility factors
    const factors = [];
    if (compatibility.emotional > 70) factors.push('Strong emotional connection');
    if (compatibility.intellectual > 70) factors.push('Good intellectual synergy');
    if (compatibility.physical > 70) factors.push('Physical harmony');
    return factors;
  }

  // Helper methods for generational patterns

  _groupByGeneration(memberAnalyses) {
    // Simplified generation grouping (would need birth dates for proper grouping)
    return {
      'Older Generation': memberAnalyses.filter(m => ['Parent', 'Grandparent'].includes(m.role)),
      'Middle Generation': memberAnalyses.filter(m => ['Parent', 'Adult Child'].includes(m.role)),
      'Younger Generation': memberAnalyses.filter(m => ['Child', 'Teenager'].includes(m.role))
    };
  }

  _analyzeGenerationPatterns(members) {
    // Analyze patterns within a generation
    const patterns = {
      dominantPlanets: this._findCommonPlanets(members),
      themes: this._findCommonThemes(members)
    };
    return patterns;
  }

  _identifyFamilyStrengths(memberAnalyses) {
    const strengths = [];
    const strongJupiter = memberAnalyses.filter(m => m.keyPlanets.some(p => p.planet === 'Jupiter')).length;
    if (strongJupiter > memberAnalyses.length / 2) {
      strengths.push('Strong family wisdom and spiritual guidance');
    }
    return strengths;
  }

  _identifyFamilyChallenges(memberAnalyses) {
    const challenges = [];
    const weakSaturn = memberAnalyses.filter(m => !m.keyPlanets.some(p => p.planet === 'Saturn')).length;
    if (weakSaturn > memberAnalyses.length / 2) {
      challenges.push('May need to develop discipline and responsibility');
    }
    return challenges;
  }

  _analyzeInheritancePatterns(memberAnalyses) {
    // Analyze what traits are passed down
    return {
      dominantTraits: ['Resilience', 'Family loyalty'],
      spiritualInheritance: 'Strong family spiritual traditions'
    };
  }

  // Helper methods for relationship dynamics

  _determineFamilyRole(member) {
    // Determine family role based on planetary influences
    if (member.keyPlanets.some(p => p.planet === 'Sun')) {
      return 'Leader and authority figure';
    } else if (member.keyPlanets.some(p => p.planet === 'Moon')) {
      return 'Emotional anchor and nurturer';
    } else if (member.keyPlanets.some(p => p.planet === 'Mercury')) {
      return 'Communicator and mediator';
    } else {
      return 'Supportive family member';
    }
  }

  _assessCommunicationPatterns(memberAnalyses) {
    const mercuryStrong = memberAnalyses.filter(m =>
      m.keyPlanets.some(p => p.planet === 'Mercury')
    ).length;

    if (mercuryStrong > memberAnalyses.length / 2) {
      return 'Strong communication patterns with good family discussions';
    } else {
      return 'May need to work on clear family communication';
    }
  }

  _identifySupportSystems(compatibilityMatrix) {
    const systems = [];
    const harmoniousPairs = Object.values(compatibilityMatrix).filter(p => p.harmony === 'High');

    if (harmoniousPairs.length > 0) {
      systems.push('Strong support networks within family');
    }

    systems.push('Encourage individual personal growth alongside family responsibilities');
    return systems;
  }

  // Helper methods for planet assessment

  _assessPlanetStrength(planetData) {
    // Simplified strength assessment
    if (this._isOwnSign(planetData.planet, planetData.sign)) {
      return 'Strong';
    } else if (this._isExalted(planetData.planet, planetData.sign)) {
      return 'Very Strong';
    } else if (this._isDebilitated(planetData.planet, planetData.sign)) {
      return 'Weak';
    }
    return 'Neutral';
  }

  _isOwnSign(planet, sign) {
    const ownSigns = {
      'sun': ['Leo'],
      'moon': ['Cancer'],
      'mars': ['Aries', 'Scorpio'],
      'mercury': ['Gemini', 'Virgo'],
      'jupiter': ['Sagittarius', 'Pisces'],
      'venus': ['Taurus', 'Libra'],
      'saturn': ['Capricorn', 'Aquarius']
    };
    return ownSigns[planet]?.includes(sign) || false;
  }

  _isExalted(planet, sign) {
    const exaltation = {
      'sun': 'Aries',
      'moon': 'Taurus',
      'mars': 'Capricorn',
      'mercury': 'Virgo',
      'jupiter': 'Cancer',
      'venus': 'Pisces',
      'saturn': 'Libra'
    };
    return exaltation[planet] === sign;
  }

  _isDebilitated(planet, sign) {
    const debilitation = {
      'sun': 'Libra',
      'moon': 'Scorpio',
      'mars': 'Cancer',
      'mercury': 'Pisces',
      'jupiter': 'Capricorn',
      'venus': 'Virgo',
      'saturn': 'Aries'
    };
    return debilitation[planet] === sign;
  }

  _getSunSignTrait(sign) {
    const traits = {
      'Aries': 'Leadership',
      'Taurus': 'Stability',
      'Gemini': 'Communication',
      'Cancer': 'Nurturing',
      'Leo': 'Creativity',
      'Virgo': 'Service',
      'Libra': 'Harmony',
      'Scorpio': 'Intensity',
      'Sagittarius': 'Adventure',
      'Capricorn': 'Ambition',
      'Aquarius': 'Innovation',
      'Pisces': 'Compassion'
    };
    return traits[sign] || 'Balanced';
  }

  _getMoonSignTrait(sign) {
    const traits = {
      'Aries': 'Emotional courage',
      'Taurus': 'Emotional stability',
      'Gemini': 'Emotional adaptability',
      'Cancer': 'Deep emotional sensitivity',
      'Leo': 'Emotional warmth',
      'Virgo': 'Emotional care',
      'Libra': 'Emotional harmony',
      'Scorpio': 'Emotional depth',
      'Sagittarius': 'Emotional freedom',
      'Capricorn': 'Emotional responsibility',
      'Aquarius': 'Emotional detachment',
      'Pisces': 'Emotional compassion'
    };
    return traits[sign] || 'Emotional balance';
  }

  _getMarsSignTrait(sign) {
    const traits = {
      'Aries': 'Direct action',
      'Taurus': 'Persistent effort',
      'Gemini': 'Versatile energy',
      'Cancer': 'Protective drive',
      'Leo': 'Creative power',
      'Virgo': 'Detailed work',
      'Libra': 'Balanced action',
      'Scorpio': 'Intense focus',
      'Sagittarius': 'Adventurous spirit',
      'Capricorn': 'Ambitious drive',
      'Aquarius': 'Innovative action',
      'Pisces': 'Compassionate service'
    };
    return traits[sign] || 'Purposeful action';
  }

  _findCommonPlanets(members) {
    // Find planets that appear strong in multiple family members
    const planetCounts = {};
    members.forEach(member => {
      member.keyPlanets.forEach(planet => {
        if (planet.strength === 'Strong' || planet.strength === 'Very Strong') {
          planetCounts[planet.planet] = (planetCounts[planet.planet] || 0) + 1;
        }
      });
    });

    return Object.entries(planetCounts)
      .filter(([, count]) => count > 1)
      .map(([planet]) => planet);
  }

  _findCommonThemes(members) {
    // Find common life themes
    const themeCounts = {};
    members.forEach(member => {
      member.lifeThemes.forEach(theme => {
        themeCounts[theme] = (themeCounts[theme] || 0) + 1;
      });
    });

    return Object.entries(themeCounts)
      .filter(([, count]) => count > 1)
      .map(([theme]) => theme);
  }

  _calculateFamilyStrength(compatibilityMatrix, generationalPatterns) {
    // Calculate overall family astrological strength
    const compatibilityScores = Object.values(compatibilityMatrix).map(p => p.score);
    const avgCompatibility = compatibilityScores.reduce((sum, score) => sum + score, 0) / compatibilityScores.length;

    const generationalStrength = Object.keys(generationalPatterns.dominantPlanets || {}).length;

    const overallStrength = (avgCompatibility + (generationalStrength * 10)) / 2;

    return {
      score: Math.min(100, overallStrength),
      level: overallStrength > 75 ? 'Very Strong' :
             overallStrength > 60 ? 'Strong' :
             overallStrength > 45 ? 'Moderate' : 'Needs Attention',
      factors: {
        compatibility: avgCompatibility,
        generationalHarmony: generationalStrength
      }
    };
  }

  /**
   * Validate input parameters
   * @param {Object} input - Input data to validate
   * @private
   */
  _validateInput(input) {
    if (!input) {
      throw new Error('Input data is required');
    }

    if (!input.familyMembers || !Array.isArray(input.familyMembers)) {
      throw new Error('Family members array is required');
    }

    if (input.familyMembers.length < 2) {
      throw new Error('At least 2 family members are required for analysis');
    }

    if (input.familyMembers.length > 10) {
      throw new Error('Maximum 10 family members allowed for analysis');
    }

    // Validate each family member
    input.familyMembers.forEach((member, index) => {
      if (!member.name) {
        throw new Error(`Family member ${index + 1} name is required`);
      }

      if (!member.role) {
        throw new Error(`Family member ${index + 1} role is required`);
      }

      if (!member.birthDate) {
        throw new Error(`Family member ${index + 1} birth date is required`);
      }

      if (!member.birthTime) {
        throw new Error(`Family member ${index + 1} birth time is required`);
      }

      if (!member.birthPlace) {
        throw new Error(`Family member ${index + 1} birth place is required`);
      }

      // Validate date format
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateRegex.test(member.birthDate)) {
        throw new Error(`Family member ${index + 1} birth date must be in DD/MM/YYYY format`);
      }

      // Validate time format
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(member.birthTime)) {
        throw new Error(`Family member ${index + 1} birth time must be in HH:MM format`);
      }
    });
  }

  /**
   * Format result for presentation
   * @param {Object} result - Raw family analysis result
   * @returns {Object} Formatted result
   * @private
   */
  _formatResult(result) {
    if (!result) {
      return {
        success: false,
        error: 'Unable to generate family astrology analysis',
        message: 'Family analysis failed'
      };
    }

    return {
      success: true,
      message: 'Family astrology analysis completed successfully',
      data: {
        analysis: result,
        summary: this._createFamilySummary(result),
        disclaimer: '⚠️ *Family Astrology Disclaimer:* This analysis examines astrological influences on family dynamics. Real family relationships involve many factors beyond astrology. Professional counseling is recommended for serious family issues.'
      }
    };
  }

  /**
   * Create family analysis summary for quick reference
   * @param {Object} result - Full family analysis
   * @returns {Object} Summary
   * @private
   */
  _createFamilySummary(result) {
    return {
      familySize: result.familyMembers.length,
      overallStrength: result.familyStrength.level,
      strengthScore: result.familyStrength.score,
      keyInsights: {
        harmoniousRelationships: result.relationshipDynamics.harmoniousPairs.length,
        challengingRelationships: result.relationshipDynamics.challengingPairs.length,
        dominantPlanets: Object.values(result.generationalPatterns.dominantPlanets || {}).flat(),
        ancestralInfluences: result.ancestralInfluences.karmicPatterns.length > 0 ? 'Present' : 'Minimal'
      },
      topRecommendations: [
        ...(result.recommendations.immediate || []).slice(0, 1),
        ...(result.recommendations.relationship || []).slice(0, 1),
        ...(result.recommendations.spiritual || []).slice(0, 1)
      ]
    };
  }

  /**
   * Get service metadata
   * @returns {Object} Service information
   */
  getMetadata() {
    return {
      name: 'FamilyAstrologyService',
      description: 'Comprehensive family astrology analysis including member compatibility, generational patterns, ancestral influences, and family relationship dynamics',
      version: '1.0.0',
      dependencies: ['GroupAstrologyCalculator', 'CompatibilityScorer'],
      category: 'vedic'
    };
  }
}

module.exports = FamilyAstrologyService;