const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculators from legacy structure (for now)

/**
 * Business Partnership Service
 *
 * Provides comprehensive business partnership astrology analysis including compatibility
 * between business partners, partnership timing, financial synergy, and business
 * relationship dynamics using Vedic astrological principles and Swiss Ephemeris calculations.
 */
class BusinessPartnershipService extends ServiceTemplate {
  constructor() {
    super('CompatibilityCalculator');
    this.serviceName = 'BusinessPartnershipService';
    this.calculatorPath = '../calculators/CompatibilityCalculator';
    logger.info('BusinessPartnershipService initialized');
  }

  async lbusinessPartnershipCalculation(partnershipData) {
    try {
      // Get comprehensive partnership analysis using calculators
      const result = await this.getBusinessPartnershipAnalysis(partnershipData);
      return result;
    } catch (error) {
      logger.error('BusinessPartnershipService calculation error:', error);
      throw new Error(`Business partnership analysis failed: ${error.message}`);
    }
  }

  formatResult(result) {
    return {
      success: true,
      service: 'Business Partnership Analysis',
      timestamp: new Date().toISOString(),
      data: result,
      disclaimer:
        'Business partnership analysis provides astrological insights for business relationships. Consider legal, financial, and professional advice alongside astrological guidance for business decisions.'
    };
  }

  validate(partnershipData) {
    if (!partnershipData) {
      throw new Error('Partnership data is required');
    }

    const { partners } = partnershipData;

    if (!partners || !Array.isArray(partners) || partners.length < 2) {
      throw new Error('At least 2 business partners are required for analysis');
    }

    // Validate each partner has required birth data
    partners.forEach((partner, index) => {
      if (!partner.birthData) {
        throw new Error(`Partner ${index + 1} birth data is required`);
      }

      const { birthDate, birthTime, birthPlace } = partner.birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        throw new Error(
          `Partner ${index + 1} requires complete birth data (date, time, place)`
        );
      }

      // Validate date format
      const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
      if (!dateRegex.test(birthDate)) {
        throw new Error(
          `Partner ${index + 1} birth date must be in DD/MM/YYYY format`
        );
      }

      // Validate time format
      const timeRegex = /^\d{1,2}:\d{1,2}$/;
      if (!timeRegex.test(birthTime)) {
        throw new Error(
          `Partner ${index + 1} birth time must be in HH:MM format`
        );
      }
    });

    return true;
  }

  /**
   * Get comprehensive business partnership analysis
   * @param {Object} partnershipData - Partnership data including business partners
   * @returns {Promise<Object>} Business partnership analysis
   */
  async getBusinessPartnershipAnalysis(partnershipData) {
    try {
      const { partners, businessType, analysisFocus } = partnershipData;

      // Analyze individual partner charts for business suitability
      const partnerAnalyses = await this._analyzeBusinessPartners(partners);

      // Calculate partnership compatibility
      const partnershipCompatibility =
        await this._calculatePartnershipCompatibility(partners);

      // Analyze financial synergy
      const financialSynergy = await this._analyzeFinancialSynergy(partners);

      // Determine optimal partnership timing
      const timingAnalysis = await this._analyzePartnershipTiming(
        partners,
        businessType
      );

      // Assess business relationship dynamics
      const relationshipDynamics = this._assessBusinessDynamics(
        partnershipCompatibility,
        partnerAnalyses
      );

      // Generate business recommendations
      const recommendations = this._generateBusinessRecommendations(
        partnershipCompatibility,
        financialSynergy,
        timingAnalysis,
        businessType
      );

      return {
        partners: partners.map(p => ({ name: p.name, role: p.businessRole })),
        businessType,
        analysisFocus,
        partnerAnalyses,
        partnershipCompatibility,
        financialSynergy,
        timingAnalysis,
        relationshipDynamics,
        recommendations,
        partnershipStrength: this._calculatePartnershipStrength(
          partnershipCompatibility,
          financialSynergy
        )
      };
    } catch (error) {
      logger.error('Error getting business partnership analysis:', error);
      throw error;
    }
  }

  /**
   * Analyze individual business partners for business suitability
   * @param {Array} partners - Array of partner data
   * @returns {Promise<Array>} Partner business analyses
   * @private
   */
  async _analyzeBusinessPartners(partners) {
    try {
      const analyses = [];

      for (const partner of partners) {
        const analysis = {
          name: partner.name,
          businessRole: partner.businessRole,
          businessStrengths: this._assessBusinessStrengths(partner),
          leadershipStyle: this._determineLeadershipStyle(partner),
          riskTolerance: this._assessRiskTolerance(partner),
          decisionMaking: this._assessDecisionMaking(partner),
          workEthic: this._assessWorkEthic(partner),
          financialApproach: await this._analyzeFinancialApproach(partner)
        };
        analyses.push(analysis);
      }

      return analyses;
    } catch (error) {
      logger.warn('Could not analyze business partners:', error.message);
      return [];
    }
  }

  /**
   * Calculate partnership compatibility
   * @param {Array} partners - Partner data
   * @returns {Promise<Object>} Partnership compatibility analysis
   * @private
   */
  async _calculatePartnershipCompatibility(partners) {
    try {
      const compatibility = {
        overallScore: 0,
        breakdown: {},
        complementarySkills: [],
        potentialConflicts: [],
        synergyLevel: 'Low'
      };

      // Calculate pairwise compatibility
      const pairwiseCompat = [];
      for (let i = 0; i < partners.length; i++) {
        for (let j = i + 1; j < partners.length; j++) {
          const partner1 = partners[i];
          const partner2 = partners[j];

          const pairCompat =
            await this.compatibilityCalculator.checkCompatibility(
              partner1,
              partner2
            );
          pairwiseCompat.push({
            partners: [partner1.name, partner2.name],
            score: pairCompat.overall || 0,
            businessSynergy: this._assessBusinessSynergy(partner1, partner2)
          });
        }
      }

      // Calculate overall partnership compatibility
      const avgScore =
        pairwiseCompat.reduce((sum, pair) => sum + pair.score, 0) /
        pairwiseCompat.length;
      compatibility.overallScore = avgScore;

      // Assess synergy level
      compatibility.synergyLevel =
        avgScore > 75 ?
          'Excellent' :
          avgScore > 60 ?
            'Good' :
            avgScore > 45 ?
              'Moderate' :
              'Challenging';

      // Identify complementary skills and potential conflicts
      compatibility.complementarySkills =
        this._identifyComplementarySkills(partners);
      compatibility.potentialConflicts = this._identifyPotentialConflicts(
        partners,
        pairwiseCompat
      );

      // Breakdown by categories
      compatibility.breakdown = {
        communication: this._assessCommunicationCompatibility(partners),
        decisionMaking: this._assessDecisionMakingCompatibility(partners),
        riskManagement: this._assessRiskManagementCompatibility(partners),
        workStyle: this._assessWorkStyleCompatibility(partners)
      };

      return compatibility;
    } catch (error) {
      logger.warn(
        'Could not calculate partnership compatibility:',
        error.message
      );
      return { overallScore: 0, synergyLevel: 'Unknown' };
    }
  }

  /**
   * Analyze financial synergy between partners
   * @param {Array} partners - Partner data
   * @returns {Promise<Object>} Financial synergy analysis
   * @private
   */
  async _analyzeFinancialSynergy(partners) {
    try {
      const synergy = {
        overallSynergy: 0,
        wealthGeneration: '',
        financialDecisionMaking: '',
        riskApproach: '',
        investmentStyle: '',
        recommendations: []
      };

      // Analyze financial compatibility
      const financialCompat = [];
      for (const partner of partners) {
        const financialAnalysis =
          await this.financialCalculator.analyzeFinancialPotential(partner);
        financialCompat.push(financialAnalysis);
      }

      // Assess overall financial synergy
      const avgFinancialStrength =
        financialCompat.reduce(
          (sum, analysis) => sum + (analysis.potential || 0),
          0
        ) / financialCompat.length;

      synergy.overallSynergy = avgFinancialStrength;

      // Determine wealth generation potential
      synergy.wealthGeneration =
        avgFinancialStrength > 75 ?
          'Excellent wealth generation potential' :
          avgFinancialStrength > 60 ?
            'Good financial prospects' :
            avgFinancialStrength > 45 ?
              'Moderate financial potential' :
              'Financial challenges may need careful management';

      // Assess financial decision making approach
      synergy.financialDecisionMaking =
        this._assessFinancialDecisionMaking(partners);

      // Determine risk approach
      synergy.riskApproach = this._assessFinancialRiskApproach(partners);

      // Determine investment style
      synergy.investmentStyle = this._assessInvestmentStyle(partners);

      // Generate financial recommendations
      synergy.recommendations = this._generateFinancialRecommendations(
        synergy,
        partners.length
      );

      return synergy;
    } catch (error) {
      logger.warn('Could not analyze financial synergy:', error.message);
      return { overallSynergy: 0, wealthGeneration: 'Analysis unavailable' };
    }
  }

  /**
   * Analyze partnership timing
   * @param {Array} partners - Partner data
   * @param {string} businessType - Type of business
   * @returns {Promise<Object>} Timing analysis
   * @private
   */
  async _analyzePartnershipTiming(partners, businessType) {
    try {
      const timing = {
        optimalStartPeriod: '',
        challengingPeriods: [],
        longTermViability: '',
        timingRecommendations: [],
        dashaInfluences: []
      };

      // Analyze current dashas for timing
      for (const partner of partners) {
        const currentDasha = partner.currentDasha || 'Unknown';
        timing.dashaInfluences.push({
          partner: partner.name,
          currentDasha,
          businessSuitability: this._assessDashaForBusiness(currentDasha)
        });
      }

      // Determine optimal start period based on combined dashas
      timing.optimalStartPeriod = this._determineOptimalStartPeriod(
        timing.dashaInfluences,
        businessType
      );

      // Identify challenging periods
      timing.challengingPeriods = this._identifyChallengingPeriods(
        timing.dashaInfluences
      );

      // Assess long-term viability
      timing.longTermViability = this._assessLongTermViability(
        timing.dashaInfluences
      );

      // Generate timing recommendations
      timing.timingRecommendations =
        this._generateTimingRecommendations(timing);

      return timing;
    } catch (error) {
      logger.warn('Could not analyze partnership timing:', error.message);
      return { optimalStartPeriod: 'Analysis unavailable' };
    }
  }

  /**
   * Assess business relationship dynamics
   * @param {Object} compatibility - Partnership compatibility
   * @param {Array} partnerAnalyses - Individual partner analyses
   * @returns {Object} Business dynamics analysis
   * @private
   */
  _assessBusinessDynamics(compatibility, partnerAnalyses) {
    try {
      const dynamics = {
        leadershipStructure: '',
        decisionProcess: '',
        conflictResolution: '',
        growthPotential: '',
        sustainability: ''
      };

      // Assess leadership structure
      dynamics.leadershipStructure =
        this._determineLeadershipStructure(partnerAnalyses);

      // Assess decision process
      dynamics.decisionProcess = this._assessDecisionProcess(
        compatibility.breakdown.decisionMaking
      );

      // Assess conflict resolution
      dynamics.conflictResolution =
        this._assessConflictResolution(compatibility);

      // Assess growth potential
      dynamics.growthPotential =
        compatibility.overallScore > 70 ?
          'High growth potential with strong synergy' :
          compatibility.overallScore > 50 ?
            'Moderate growth potential with some challenges' :
            'Growth may be challenging, focus on stability first';

      // Assess sustainability
      dynamics.sustainability = this._assessPartnershipSustainability(
        compatibility,
        partnerAnalyses
      );

      return dynamics;
    } catch (error) {
      logger.warn('Could not assess business dynamics:', error.message);
      return {};
    }
  }

  /**
   * Generate business recommendations
   * @param {Object} compatibility - Partnership compatibility
   * @param {Object} financialSynergy - Financial synergy
   * @param {Object} timingAnalysis - Timing analysis
   * @param {string} businessType - Business type
   * @returns {Object} Business recommendations
   * @private
   */
  _generateBusinessRecommendations(
    compatibility,
    financialSynergy,
    timingAnalysis,
    businessType
  ) {
    const recommendations = {
      immediate: [],
      structural: [],
      operational: [],
      strategic: []
    };

    // Immediate recommendations
    if (compatibility.overallScore < 60) {
      recommendations.immediate.push(
        'Consider partnership counseling or mediation to address compatibility challenges'
      );
    }

    if (timingAnalysis.challengingPeriods.length > 0) {
      recommendations.immediate.push(
        'Be cautious during identified challenging periods'
      );
    }

    // Structural recommendations
    recommendations.structural.push(
      `Establish clear roles based on each partner's strengths: ${compatibility.complementarySkills.join(', ')}`
    );

    if (compatibility.breakdown.communication < 60) {
      recommendations.structural.push(
        'Implement regular communication protocols and meeting schedules'
      );
    }

    // Operational recommendations
    if (financialSynergy.overallSynergy < 60) {
      recommendations.operational.push(
        'Develop clear financial policies and regular financial reviews'
      );
    }

    recommendations.operational.push(
      'Create a partnership agreement that addresses decision-making processes'
    );

    // Strategic recommendations
    recommendations.strategic.push(
      `Focus on ${businessType} opportunities that leverage combined strengths`
    );
    recommendations.strategic.push(
      'Plan for long-term partnership development and periodic reassessment'
    );

    return recommendations;
  }

  // Helper methods for partner analysis

  _assessBusinessStrengths(partner) {
    const strengths = [];
    if (partner.mars?.house === 10) {
      strengths.push('Strong leadership and executive ability');
    }
    if (partner.jupiter?.house === 11) {
      strengths.push('Good networking and gain potential');
    }
    if (partner.mercury?.house === 3 || partner.mercury?.house === 11) {
      strengths.push('Strong communication and business skills');
    }
    if (partner.saturn?.house === 10) {
      strengths.push('Disciplined work ethic and long-term planning');
    }
    return strengths.length > 0 ? strengths : ['General business aptitude'];
  }

  _determineLeadershipStyle(partner) {
    if (partner.sun?.house === 10 || partner.sun?.sign === 'Leo') {
      return 'Authoritative and visionary';
    }
    if (partner.mars?.house === 1) {
      return 'Direct and action-oriented';
    }
    if (partner.jupiter?.house === 1) {
      return 'Mentoring and wisdom-based';
    }
    return 'Collaborative and team-focused';
  }

  _assessRiskTolerance(partner) {
    if (
      partner.mars?.sign === 'Aries' ||
      partner.mars?.sign === 'Sagittarius'
    ) {
      return 'High risk tolerance';
    }
    if (
      partner.saturn?.sign === 'Capricorn' ||
      partner.saturn?.sign === 'Virgo'
    ) {
      return 'Low risk tolerance';
    }
    return 'Moderate risk tolerance';
  }

  _assessDecisionMaking(partner) {
    if (
      partner.mercury?.sign === 'Virgo' ||
      partner.mercury?.sign === 'Capricorn'
    ) {
      return 'Analytical and detail-oriented';
    }
    if (partner.moon?.sign === 'Cancer') {
      return 'Intuitive and emotion-based';
    }
    return 'Balanced decision-making approach';
  }

  _assessWorkEthic(partner) {
    if (partner.saturn?.house === 10 || partner.saturn?.house === 6) {
      return 'Strong work ethic and discipline';
    }
    if (partner.venus?.house === 6) {
      return 'Harmonious and balanced approach to work';
    }
    return 'Dedicated work approach';
  }

  async _analyzeFinancialApproach(partner) {
    try {
      const financialAnalysis =
        await this.financialCalculator.analyzeFinancialPotential(partner);
      return {
        approach: financialAnalysis.approach || 'Balanced',
        strengths: financialAnalysis.strengths || [],
        challenges: financialAnalysis.challenges || []
      };
    } catch (error) {
      return { approach: 'Unknown', strengths: [], challenges: [] };
    }
  }

  // Helper methods for compatibility

  _assessBusinessSynergy(partner1, partner2) {
    const synergy = {
      skillComplementary: false,
      riskBalance: false,
      decisionSynergy: false
    };

    // Check if skills complement each other
    const skills1 = this._getBusinessSkills(partner1);
    const skills2 = this._getBusinessSkills(partner2);
    synergy.skillComplementary = skills1.some(
      skill => !skills2.includes(skill)
    );

    // Check risk balance
    const risk1 = this._assessRiskTolerance(partner1);
    const risk2 = this._assessRiskTolerance(partner2);
    synergy.riskBalance = risk1 !== risk2; // Different risk tolerances can balance

    // Check decision synergy
    const decision1 = this._assessDecisionMaking(partner1);
    const decision2 = this._assessDecisionMaking(partner2);
    synergy.decisionSynergy = decision1 !== decision2; // Different styles can complement

    return synergy;
  }

  _getBusinessSkills(partner) {
    const skills = [];
    if (partner.mercury?.house === 3 || partner.mercury?.house === 10) {
      skills.push('communication');
    }
    if (partner.mars?.house === 10) {
      skills.push('leadership');
    }
    if (partner.jupiter?.house === 9 || partner.jupiter?.house === 11) {
      skills.push('strategy');
    }
    if (partner.venus?.house === 11) {
      skills.push('networking');
    }
    return skills;
  }

  _identifyComplementarySkills(partners) {
    const allSkills = partners.flatMap(p => this._getBusinessSkills(p));
    const uniqueSkills = [...new Set(allSkills)];
    return uniqueSkills;
  }

  _identifyPotentialConflicts(partners, pairwiseCompat) {
    const conflicts = [];
    const lowCompatPairs = pairwiseCompat.filter(p => p.score < 50);

    if (lowCompatPairs.length > 0) {
      conflicts.push(
        'Some partners may have fundamental compatibility challenges'
      );
    }

    // Check for conflicting leadership styles
    const leadershipStyles = partners.map(p =>
      this._determineLeadershipStyle(p)
    );
    if (
      new Set(leadershipStyles).size === 1 &&
      leadershipStyles[0] === 'Authoritative'
    ) {
      conflicts.push(
        'Multiple authoritative leadership styles may cause power struggles'
      );
    }

    return conflicts;
  }

  _assessCommunicationCompatibility(partners) {
    const mercuryPlacements = partners
      .map(p => p.mercury?.house)
      .filter(Boolean);
    const goodCommunication = mercuryPlacements.some(h =>
      [3, 7, 11].includes(h)
    );
    return goodCommunication ? 75 : 50;
  }

  _assessDecisionMakingCompatibility(partners) {
    const decisionStyles = partners.map(p => this._assessDecisionMaking(p));
    const diverseStyles = new Set(decisionStyles).size > 1;
    return diverseStyles ? 70 : 60; // Diversity can be good for decision making
  }

  _assessRiskManagementCompatibility(partners) {
    const riskLevels = partners.map(p => this._assessRiskTolerance(p));
    const balanced =
      riskLevels.includes('High risk tolerance') &&
      riskLevels.includes('Low risk tolerance');
    return balanced ? 80 : 60;
  }

  _assessWorkStyleCompatibility(partners) {
    // Simplified assessment
    return 65; // Assume moderate compatibility unless specific conflicts identified
  }

  // Helper methods for financial analysis

  _assessFinancialDecisionMaking(partners) {
    const approaches = partners
      .map(p => p.financialApproach?.approach)
      .filter(Boolean);
    const conservative = approaches.filter(a => a === 'Conservative').length;
    const aggressive = approaches.filter(a => a === 'Aggressive').length;

    if (conservative > aggressive) {
      return 'Conservative financial approach';
    }
    if (aggressive > conservative) {
      return 'Progressive financial approach';
    }
    return 'Balanced financial decision making';
  }

  _assessFinancialRiskApproach(partners) {
    const riskLevels = partners.map(p => this._assessRiskTolerance(p));
    const highRisk = riskLevels.filter(r => r === 'High risk tolerance').length;
    const lowRisk = riskLevels.filter(r => r === 'Low risk tolerance').length;

    if (highRisk > lowRisk) {
      return 'Adventurous risk approach';
    }
    if (lowRisk > highRisk) {
      return 'Conservative risk approach';
    }
    return 'Balanced risk management';
  }

  _assessInvestmentStyle(partners) {
    // Simplified assessment based on Jupiter and Venus placements
    const speculative = partners.filter(
      p => p.jupiter?.house === 5 || p.venus?.house === 5
    ).length;
    const stable = partners.filter(
      p => p.saturn?.house === 2 || p.saturn?.house === 11
    ).length;

    if (speculative > stable) {
      return 'Speculative investment style';
    }
    if (stable > speculative) {
      return 'Stable investment style';
    }
    return 'Balanced investment approach';
  }

  _generateFinancialRecommendations(synergy, partnerCount) {
    const recommendations = [];

    if (synergy.overallSynergy < 60) {
      recommendations.push(
        'Establish clear financial roles and decision-making processes'
      );
    }

    if (partnerCount > 2) {
      recommendations.push(
        'Consider creating a financial committee for major decisions'
      );
    }

    recommendations.push('Regular financial reviews and transparent reporting');
    recommendations.push('Diversify financial responsibilities among partners');

    return recommendations;
  }

  // Helper methods for timing analysis

  _assessDashaForBusiness(dasha) {
    const favorable = ['Jupiter', 'Venus', 'Mercury'];
    const challenging = ['Saturn', 'Mars', 'Rahu', 'Ketu'];

    if (favorable.includes(dasha)) {
      return 'Favorable for business';
    }
    if (challenging.includes(dasha)) {
      return 'Challenging for business';
    }
    return 'Neutral for business';
  }

  _determineOptimalStartPeriod(dashaInfluences, businessType) {
    const favorableCount = dashaInfluences.filter(
      d => d.businessSuitability === 'Favorable for business'
    ).length;
    const challengingCount = dashaInfluences.filter(
      d => d.businessSuitability === 'Challenging for business'
    ).length;

    if (favorableCount > challengingCount) {
      return 'Current period appears favorable for business partnership';
    } else if (challengingCount > favorableCount) {
      return 'Consider waiting for more favorable astrological timing';
    } else {
      return 'Mixed influences - proceed with caution and planning';
    }
  }

  _identifyChallengingPeriods(dashaInfluences) {
    return dashaInfluences
      .filter(d => d.businessSuitability === 'Challenging for business')
      .map(d => `${d.partner}'s ${d.currentDasha} period`);
  }

  _assessLongTermViability(dashaInfluences) {
    const favorableLongTerm = dashaInfluences.filter(d =>
      ['Jupiter', 'Venus'].includes(d.currentDasha)
    ).length;

    if (favorableLongTerm > dashaInfluences.length / 2) {
      return 'Strong long-term viability indicated';
    } else {
      return 'Long-term success will require conscious effort and adaptation';
    }
  }

  _generateTimingRecommendations(timing) {
    const recommendations = [];

    if (timing.optimalStartPeriod.includes('favorable')) {
      recommendations.push(
        'Current timing appears supportive for business launch'
      );
    } else {
      recommendations.push(
        'Consider consulting for auspicious timing before major commitments'
      );
    }

    if (timing.challengingPeriods.length > 0) {
      recommendations.push('Plan major decisions around challenging periods');
    }

    recommendations.push(
      'Monitor dasha changes and adjust business strategy accordingly'
    );

    return recommendations;
  }

  // Helper methods for business dynamics

  _determineLeadershipStructure(partnerAnalyses) {
    const leaders = partnerAnalyses.filter(p =>
      p.leadershipStyle.includes('Authoritative')
    );
    const collaborators = partnerAnalyses.filter(p =>
      p.leadershipStyle.includes('Collaborative')
    );

    if (leaders.length === 1) {
      return 'Clear primary leader with supportive partners';
    }
    if (leaders.length > 1) {
      return 'Multiple leaders - establish clear decision hierarchy';
    }
    if (collaborators.length > 0) {
      return 'Collaborative leadership structure';
    }
    return 'Evolving leadership structure';
  }

  _assessDecisionProcess(compatibility) {
    if (compatibility > 70) {
      return 'Efficient decision-making process';
    }
    if (compatibility > 50) {
      return 'Structured decision-making with some discussion needed';
    }
    return 'Decision-making may require facilitation and clear processes';
  }

  _assessConflictResolution(compatibility) {
    if (compatibility.overallScore > 70) {
      return 'Natural conflict resolution through mutual understanding';
    }
    if (compatibility.overallScore > 50) {
      return 'Conflicts resolved through discussion and compromise';
    }
    return 'May need external mediation for conflict resolution';
  }

  _assessPartnershipSustainability(compatibility, partnerAnalyses) {
    const strongWorkEthic = partnerAnalyses.filter(p =>
      p.workEthic.includes('Strong')
    ).length;
    const goodCompatibility = compatibility.overallScore > 60;

    if (strongWorkEthic > partnerAnalyses.length / 2 && goodCompatibility) {
      return 'High sustainability with strong foundation';
    } else if (goodCompatibility) {
      return 'Moderate sustainability with consistent effort';
    } else {
      return 'Sustainability will require significant commitment and adaptation';
    }
  }

  _calculatePartnershipStrength(compatibility, financialSynergy) {
    const overallScore =
      (compatibility.overallScore + financialSynergy.overallSynergy) / 2;

    return {
      score: Math.min(100, overallScore),
      level:
        overallScore > 75 ?
          'Very Strong' :
          overallScore > 60 ?
            'Strong' :
            overallScore > 45 ?
              'Moderate' :
              'Needs Attention',
      factors: {
        compatibility: compatibility.overallScore,
        financialSynergy: financialSynergy.overallSynergy
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

    if (!input.partners || !Array.isArray(input.partners)) {
      throw new Error('Partners array is required');
    }

    if (input.partners.length < 2) {
      throw new Error(
        'At least 2 partners are required for partnership analysis'
      );
    }

    if (input.partners.length > 5) {
      throw new Error('Maximum 5 partners allowed for analysis');
    }

    // Validate each partner
    input.partners.forEach((partner, index) => {
      if (!partner.name) {
        throw new Error(`Partner ${index + 1} name is required`);
      }

      if (!partner.businessRole) {
        throw new Error(`Partner ${index + 1} business role is required`);
      }

      if (!partner.birthDate) {
        throw new Error(`Partner ${index + 1} birth date is required`);
      }

      if (!partner.birthTime) {
        throw new Error(`Partner ${index + 1} birth time is required`);
      }

      if (!partner.birthPlace) {
        throw new Error(`Partner ${index + 1} birth place is required`);
      }

      // Validate date format
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateRegex.test(partner.birthDate)) {
        throw new Error(
          `Partner ${index + 1} birth date must be in DD/MM/YYYY format`
        );
      }

      // Validate time format
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(partner.birthTime)) {
        throw new Error(
          `Partner ${index + 1} birth time must be in HH:MM format`
        );
      }
    });
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['execute', 'getBusinessPartnershipAnalysis'],
      dependencies: [
        'GroupAstrologyCalculator',
        'CompatibilityScorer',
        'FinancialAstrologyCalculator'
      ]
    };
  }
  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          // Add service-specific features here
        },
        supportedAnalyses: [
          // Add supported analyses here
        ]
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = BusinessPartnershipService;
