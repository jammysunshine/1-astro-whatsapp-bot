/**
 * Group Timing Service
 *
 * Provides comprehensive group timing analysis for events involving multiple people,
 * including family gatherings, business meetings, weddings, and other collective activities.
 * Combines individual birth charts with auspicious timing calculations using Vedic principles.
 */

const logger = require('../../../utils/logger');

class GroupTimingService {
  constructor() {
    this.groupCalculator = new GroupAstrologyCalculator();
    this.muhurtaCalculator = new MuhurtaCalculator();
    this.compatibilityScorer = new CompatibilityCalculator();
    logger.info('GroupTimingService initialized');
  }

  /**
   * Execute comprehensive group timing analysis
   * @param {Object} groupData - Group timing request data
   * @returns {Promise<Object>} Complete group timing analysis
   */
  async execute(groupData) {
    try {
      // Input validation
      this._validateInput(groupData);

      // Get comprehensive group timing analysis
      const result = await this.getGroupTimingAnalysis(groupData);

      // Format and return result
      return this._formatResult(result);
    } catch (error) {
      logger.error('GroupTimingService error:', error);
      throw new Error(`Group timing analysis failed: ${error.message}`);
    }
  }

  /**
   * Get comprehensive group timing analysis
   * @param {Object} groupData - Group data including members and event details
   * @returns {Promise<Object>} Group timing analysis
   */
  async getGroupTimingAnalysis(groupData) {
    try {
      const { groupMembers, eventType, eventDate, eventLocation, analysisType } = groupData;

      // Analyze individual group member charts
      const memberAnalyses = await this._analyzeGroupMembers(groupMembers);

      // Calculate group compatibility and harmony
      const groupCompatibility = await this._calculateGroupCompatibility(groupMembers);

      // Find optimal timing for the group event
      const optimalTiming = await this._findOptimalGroupTiming(eventDate, eventLocation, eventType, groupCompatibility);

      // Analyze event-specific timing considerations
      const eventTiming = await this._analyzeEventSpecificTiming(eventType, groupMembers, optimalTiming);

      // Generate timing recommendations
      const recommendations = this._generateGroupTimingRecommendations(
        optimalTiming,
        groupCompatibility,
        eventType,
        groupMembers.length
      );

      // Assess overall group timing success potential
      const successPotential = this._assessTimingSuccessPotential(optimalTiming, groupCompatibility, eventTiming);

      return {
        groupMembers: groupMembers.map(m => ({ name: m.name, role: m.role || 'Member' })),
        eventType,
        eventDate,
        eventLocation,
        analysisType,
        memberAnalyses,
        groupCompatibility,
        optimalTiming,
        eventTiming,
        recommendations,
        successPotential
      };
    } catch (error) {
      logger.error('Error getting group timing analysis:', error);
      throw error;
    }
  }

  /**
   * Analyze individual group members for timing considerations
   * @param {Array} groupMembers - Array of group member data
   * @returns {Promise<Array>} Member timing analyses
   * @private
   */
  async _analyzeGroupMembers(groupMembers) {
    try {
      const analyses = [];

      for (const member of groupMembers) {
        const analysis = {
          name: member.name,
          role: member.role || 'Member',
          currentDasha: member.currentDasha || 'Unknown',
          favorableTiming: this._assessPersonalTiming(member),
          energyLevel: this._assessPersonalEnergy(member),
          participationSuitability: this._assessParticipationSuitability(member, member.role)
        };
        analyses.push(analysis);
      }

      return analyses;
    } catch (error) {
      logger.warn('Could not analyze group members:', error.message);
      return [];
    }
  }

  /**
   * Calculate group compatibility and harmony
   * @param {Array} groupMembers - Group member data
   * @returns {Promise<Object>} Group compatibility analysis
   * @private
   */
  async _calculateGroupCompatibility(groupMembers) {
    try {
      const compatibility = {
        overallHarmony: 0,
        interpersonalDynamics: [],
        groupEnergy: '',
        potentialChallenges: [],
        harmonyFactors: {}
      };

      // Calculate pairwise compatibility scores
      const pairwiseScores = [];
      for (let i = 0; i < groupMembers.length; i++) {
        for (let j = i + 1; j < groupMembers.length; j++) {
          const member1 = groupMembers[i];
          const member2 = groupMembers[j];

          const pairCompat = await this.compatibilityCalculator.checkCompatibility(member1, member2);
          pairwiseScores.push({
            pair: [member1.name, member2.name],
            score: pairCompat.overall || 0,
            roles: [member1.role, member2.role]
          });
        }
      }

      // Calculate overall group harmony
      const avgScore = pairwiseScores.reduce((sum, score) => sum + score.score, 0) / pairwiseScores.length;
      compatibility.overallHarmony = avgScore;

      // Assess interpersonal dynamics
      compatibility.interpersonalDynamics = pairwiseScores.map(pair => ({
        members: pair.pair,
        compatibility: pair.score > 70 ? 'Harmonious' :
          pair.score > 50 ? 'Compatible' : 'Challenging',
        dynamic: this._assessPairDynamic(pair.roles, pair.score)
      }));

      // Determine group energy
      compatibility.groupEnergy = avgScore > 75 ? 'Highly cohesive and energetic' :
        avgScore > 60 ? 'Generally harmonious with good energy' :
          avgScore > 45 ? 'Mixed energies requiring attention' :
            'Challenging group dynamics';

      // Identify potential challenges
      compatibility.potentialChallenges = pairwiseScores
        .filter(pair => pair.score < 50)
        .map(pair => `${pair.pair.join(' and ')} may experience compatibility challenges`);

      // Assess harmony factors
      compatibility.harmonyFactors = {
        size: groupMembers.length,
        diversity: this._assessGroupDiversity(groupMembers),
        roleBalance: this._assessRoleBalance(groupMembers),
        energyDistribution: this._assessEnergyDistribution(groupMembers)
      };

      return compatibility;
    } catch (error) {
      logger.warn('Could not calculate group compatibility:', error.message);
      return { overallHarmony: 0, groupEnergy: 'Analysis unavailable' };
    }
  }

  /**
   * Find optimal timing for group event
   * @param {string} eventDate - Proposed event date
   * @param {Object} eventLocation - Event location
   * @param {string} eventType - Type of event
   * @param {Object} groupCompatibility - Group compatibility data
   * @returns {Promise<Object>} Optimal timing analysis
   * @private
   */
  async _findOptimalGroupTiming(eventDate, eventLocation, eventType, groupCompatibility) {
    try {
      const timing = {
        proposedDate: eventDate,
        optimalDate: '',
        alternativeDates: [],
        muhurtaAnalysis: {},
        groupDashaAlignment: '',
        timingStrength: 0,
        recommendations: []
      };

      // Analyze muhurta for the proposed date
      timing.muhurtaAnalysis = await this.muhurtaCalculator.calculateMuhurta(eventDate, eventLocation, eventType);

      // Assess group dasha alignment (simplified)
      timing.groupDashaAlignment = this._assessGroupDashaAlignment(eventDate);

      // Calculate overall timing strength
      const muhurtaStrength = timing.muhurtaAnalysis.isFavorable ? 80 : 40;
      const compatibilityBonus = groupCompatibility.overallHarmony > 60 ? 20 : 0;
      timing.timingStrength = Math.min(100, muhurtaStrength + compatibilityBonus);

      // Determine if proposed date is optimal
      if (timing.timingStrength > 70) {
        timing.optimalDate = eventDate;
        timing.recommendations.push('Proposed date appears favorable for the group event');
      } else {
        timing.optimalDate = 'Alternative date recommended';
        timing.alternativeDates = await this._findAlternativeDates(eventDate, eventLocation, eventType);
        timing.recommendations.push('Consider alternative dates for better group timing');
      }

      // Add event-specific timing considerations
      timing.eventSpecific = this._getEventSpecificTiming(eventType, timing.muhurtaAnalysis);

      return timing;
    } catch (error) {
      logger.warn('Could not find optimal group timing:', error.message);
      return { proposedDate: eventDate, optimalDate: 'Analysis unavailable' };
    }
  }

  /**
   * Analyze event-specific timing considerations
   * @param {string} eventType - Type of event
   * @param {Array} groupMembers - Group members
   * @param {Object} optimalTiming - Optimal timing data
   * @returns {Promise<Object>} Event-specific timing analysis
   * @private
   */
  async _analyzeEventSpecificTiming(eventType, groupMembers, optimalTiming) {
    try {
      const eventTiming = {
        eventType,
        specificConsiderations: [],
        planetaryInfluences: [],
        groupSizeConsiderations: '',
        durationRecommendations: '',
        preparationNeeds: []
      };

      // Event-specific considerations
      switch (eventType.toLowerCase()) {
      case 'wedding':
        eventTiming.specificConsiderations = [
          'Check for auspicious tithi and nakshatra',
          'Consider moon sign compatibility',
          'Avoid eclipse periods'
        ];
        eventTiming.planetaryInfluences = ['Venus', 'Jupiter', 'Moon'];
        eventTiming.durationRecommendations = 'Full day ceremony preferred';
        break;

      case 'business meeting':
        eventTiming.specificConsiderations = [
          'Mercury and Jupiter favorable periods',
          'Avoid Mars periods for negotiations',
          'Consider weekday timing'
        ];
        eventTiming.planetaryInfluences = ['Mercury', 'Jupiter', 'Sun'];
        eventTiming.durationRecommendations = '2-4 hours optimal';
        break;

      case 'family gathering':
        eventTiming.specificConsiderations = [
          'Moon favorable periods',
          'Family tradition considerations',
          'Weather and seasonal factors'
        ];
        eventTiming.planetaryInfluences = ['Moon', 'Venus', 'Jupiter'];
        eventTiming.durationRecommendations = 'Half day to full day';
        break;

      case 'spiritual ceremony':
        eventTiming.specificConsiderations = [
          'Jupiter and spiritual planet periods',
          'Sacred timing (brahma muhurta)',
          'Lunar phase considerations'
        ];
        eventTiming.planetaryInfluences = ['Jupiter', 'Saturn', 'Ketu'];
        eventTiming.durationRecommendations = '2-6 hours depending on ceremony';
        break;

      default:
        eventTiming.specificConsiderations = [
          'General auspicious timing',
          'Group harmony considerations',
          'Practical scheduling factors'
        ];
        eventTiming.planetaryInfluences = ['Jupiter', 'Venus'];
        eventTiming.durationRecommendations = 'Flexible based on event needs';
      }

      // Group size considerations
      const groupSize = groupMembers.length;
      if (groupSize <= 5) {
        eventTiming.groupSizeConsiderations = 'Small intimate group - flexible timing';
      } else if (groupSize <= 20) {
        eventTiming.groupSizeConsiderations = 'Medium group - consider coordination logistics';
      } else {
        eventTiming.groupSizeConsiderations = 'Large group - prioritize major auspicious periods';
      }

      // Preparation needs based on timing strength
      if (optimalTiming.timingStrength < 60) {
        eventTiming.preparationNeeds = [
          'Additional prayers and mantras',
          'Energized gemstones for participants',
          'Special pujas or homas'
        ];
      } else {
        eventTiming.preparationNeeds = [
          'Basic prayers and positive intentions',
          'Clean and consecrated space'
        ];
      }

      return eventTiming;
    } catch (error) {
      logger.warn('Could not analyze event-specific timing:', error.message);
      return { eventType, specificConsiderations: [] };
    }
  }

  /**
   * Generate group timing recommendations
   * @param {Object} optimalTiming - Optimal timing data
   * @param {Object} groupCompatibility - Group compatibility
   * @param {string} eventType - Event type
   * @param {number} groupSize - Group size
   * @returns {Object} Timing recommendations
   * @private
   */
  _generateGroupTimingRecommendations(optimalTiming, groupCompatibility, eventType, groupSize) {
    const recommendations = {
      timing: [],
      preparation: [],
      execution: [],
      contingency: []
    };

    // Timing recommendations
    if (optimalTiming.timingStrength > 70) {
      recommendations.timing.push('Proceed with confidence - timing appears favorable');
    } else {
      recommendations.timing.push('Consider adjusting date for better astrological alignment');
      if (optimalTiming.alternativeDates.length > 0) {
        recommendations.timing.push(`Alternative dates: ${optimalTiming.alternativeDates.slice(0, 3).join(', ')}`);
      }
    }

    // Preparation recommendations
    if (groupCompatibility.overallHarmony < 60) {
      recommendations.preparation.push('Include group harmony prayers or mantras before event');
    }

    recommendations.preparation.push('Create positive group intention and shared purpose');
    recommendations.preparation.push('Ensure all participants are physically and mentally prepared');

    // Execution recommendations
    recommendations.execution.push(`Plan for ${this._getEventDuration(eventType)} duration`);
    recommendations.execution.push('Include auspicious beginning rituals');

    if (groupSize > 10) {
      recommendations.execution.push('Have clear coordination and communication plan');
    }

    // Contingency recommendations
    recommendations.contingency.push('Have backup plans for unexpected changes');
    recommendations.contingency.push('Monitor group energy and adjust as needed');

    return recommendations;
  }

  /**
   * Assess timing success potential
   * @param {Object} optimalTiming - Timing data
   * @param {Object} groupCompatibility - Compatibility data
   * @param {Object} eventTiming - Event timing data
   * @returns {Object} Success potential assessment
   * @private
   */
  _assessTimingSuccessPotential(optimalTiming, groupCompatibility, eventTiming) {
    const potential = {
      overallRating: 0,
      successFactors: [],
      riskFactors: [],
      confidence: '',
      suggestions: []
    };

    // Calculate overall rating (0-100)
    const timingScore = optimalTiming.timingStrength;
    const compatibilityScore = groupCompatibility.overallHarmony;
    const eventScore = eventTiming.specificConsiderations.length * 10; // Basic scoring

    potential.overallRating = Math.min(100, (timingScore + compatibilityScore + eventScore) / 3);

    // Identify success factors
    if (timingScore > 70) { potential.successFactors.push('Favorable astrological timing'); }
    if (compatibilityScore > 70) { potential.successFactors.push('High group harmony'); }
    if (eventTiming.specificConsiderations.length > 2) { potential.successFactors.push('Well-considered event timing'); }

    // Identify risk factors
    if (timingScore < 50) { potential.riskFactors.push('Suboptimal astrological timing'); }
    if (compatibilityScore < 50) { potential.riskFactors.push('Group compatibility challenges'); }
    if (groupCompatibility.potentialChallenges.length > 0) {
      potential.riskFactors.push('Interpersonal dynamics to monitor');
    }

    // Determine confidence level
    if (potential.overallRating > 75) {
      potential.confidence = 'High confidence in positive outcome';
    } else if (potential.overallRating > 60) {
      potential.confidence = 'Moderate confidence with proper preparation';
    } else if (potential.overallRating > 45) {
      potential.confidence = 'Fair confidence requiring attention to details';
    } else {
      potential.confidence = 'Low confidence - significant preparation needed';
    }

    // Generate suggestions
    if (potential.overallRating < 70) {
      potential.suggestions.push('Consider additional remedial measures');
      potential.suggestions.push('Focus on creating positive group energy');
    }

    potential.suggestions.push('Monitor and adjust based on actual group dynamics');

    return potential;
  }

  // Helper methods for member analysis

  _assessPersonalTiming(member) {
    // Simplified personal timing assessment
    const dasha = member.currentDasha;
    if (['Jupiter', 'Venus', 'Mercury'].includes(dasha)) { return 'Favorable'; }
    if (['Saturn', 'Mars', 'Rahu'].includes(dasha)) { return 'Challenging'; }
    return 'Neutral';
  }

  _assessPersonalEnergy(member) {
    // Simplified energy assessment
    const moonSign = member.moon?.sign;
    if (['Cancer', 'Taurus', 'Pisces'].includes(moonSign)) { return 'High'; }
    if (['Capricorn', 'Aquarius', 'Virgo'].includes(moonSign)) { return 'Moderate'; }
    return 'Balanced';
  }

  _assessParticipationSuitability(member, role) {
    // Assess how suitable the timing is for this person's role
    if (role === 'Leader' || role === 'Host') {
      return this._assessPersonalTiming(member) === 'Favorable' ? 'Highly suitable' : 'Manageable';
    }
    return 'Generally suitable';
  }

  // Helper methods for compatibility

  _assessPairDynamic(roles, score) {
    if (score > 70) { return 'Strong supportive dynamic'; }
    if (score > 50) { return 'Cooperative working relationship'; }
    return 'May require extra effort to harmonize';
  }

  _assessGroupDiversity(groupMembers) {
    const roles = groupMembers.map(m => m.role).filter(Boolean);
    const uniqueRoles = new Set(roles);
    return uniqueRoles.size > 1 ? 'Diverse roles and perspectives' : 'Similar roles and perspectives';
  }

  _assessRoleBalance(groupMembers) {
    const roles = groupMembers.map(m => m.role).filter(Boolean);
    const leaders = roles.filter(r => r.includes('Leader') || r.includes('Host')).length;
    const participants = roles.length - leaders;

    if (leaders === 1 && participants > 0) { return 'Good balance with clear leadership'; }
    if (leaders === 0) { return 'Peer group dynamic'; }
    if (leaders > 1) { return 'Multiple leaders - coordination needed'; }
    return 'Unbalanced role distribution';
  }

  _assessEnergyDistribution(groupMembers) {
    const energies = groupMembers.map(m => this._assessPersonalEnergy(m));
    const highEnergy = energies.filter(e => e === 'High').length;
    const balanced = energies.filter(e => e === 'Balanced').length;

    if (highEnergy > balanced) { return 'High energy group'; }
    if (balanced > highEnergy) { return 'Balanced energy group'; }
    return 'Mixed energy levels';
  }

  // Helper methods for timing

  _assessGroupDashaAlignment(eventDate) {
    // Simplified group dasha assessment
    return 'Mixed dasha influences across group members';
  }

  async _findAlternativeDates(eventDate, eventLocation, eventType) {
    // Find alternative favorable dates within 30 days
    const alternatives = [];
    const baseDate = new Date(eventDate);

    for (let i = 1; i <= 30; i++) {
      const testDate = new Date(baseDate);
      testDate.setDate(baseDate.getDate() + i);

      const dateStr = testDate.toISOString().split('T')[0].split('-').reverse().join('/');
      try {
        const muhurta = await this.muhurtaCalculator.calculateMuhurta(dateStr, eventLocation, eventType);
        if (muhurta.isFavorable) {
          alternatives.push(dateStr);
          if (alternatives.length >= 3) { break; }
        }
      } catch (error) {
        // Skip invalid dates
      }
    }

    return alternatives;
  }

  _getEventSpecificTiming(eventType, muhurtaAnalysis) {
    // Additional event-specific timing considerations
    const considerations = {
      wedding: 'Check for Shubh Muhurta and family traditions',
      business: 'Consider market timing and economic cycles',
      spiritual: 'Align with lunar phases and sacred timings',
      family: 'Consider generational preferences and family cycles'
    };

    return considerations[eventType.toLowerCase()] || 'General auspicious timing preferred';
  }

  _getEventDuration(eventType) {
    const durations = {
      wedding: 'full day',
      business: '2-4 hours',
      spiritual: '2-6 hours',
      family: 'half day',
      meeting: '1-2 hours'
    };

    return durations[eventType.toLowerCase()] || 'flexible';
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

    if (!input.groupMembers || !Array.isArray(input.groupMembers)) {
      throw new Error('Group members array is required');
    }

    if (input.groupMembers.length < 2) {
      throw new Error('At least 2 group members are required for timing analysis');
    }

    if (input.groupMembers.length > 20) {
      throw new Error('Maximum 20 group members allowed for analysis');
    }

    if (!input.eventType) {
      throw new Error('Event type is required');
    }

    if (!input.eventDate) {
      throw new Error('Event date is required');
    }

    if (!input.eventLocation) {
      throw new Error('Event location is required');
    }

    // Validate event date format
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(input.eventDate)) {
      throw new Error('Event date must be in DD/MM/YYYY format');
    }

    // Validate each group member
    input.groupMembers.forEach((member, index) => {
      if (!member.name) {
        throw new Error(`Group member ${index + 1} name is required`);
      }

      if (!member.birthDate) {
        throw new Error(`Group member ${index + 1} birth date is required`);
      }

      if (!member.birthTime) {
        throw new Error(`Group member ${index + 1} birth time is required`);
      }

      if (!member.birthPlace) {
        throw new Error(`Group member ${index + 1} birth place is required`);
      }

      // Validate date format
      if (!dateRegex.test(member.birthDate)) {
        throw new Error(`Group member ${index + 1} birth date must be in DD/MM/YYYY format`);
      }

      // Validate time format
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(member.birthTime)) {
        throw new Error(`Group member ${index + 1} birth time must be in HH:MM format`);
      }
    });
  }

  /**
   * Format result for presentation
   * @param {Object} result - Raw group timing analysis result
   * @returns {Object} Formatted result
   * @private
   */
  _formatResult(result) {
    if (!result) {
      return {
        success: false,
        error: 'Unable to generate group timing analysis',
        message: 'Group timing analysis failed'
      };
    }

    return {
      success: true,
      message: 'Group timing analysis completed successfully',
      data: {
        analysis: result,
        summary: this._createGroupTimingSummary(result),
        disclaimer: '⚠️ *Group Timing Disclaimer:* This analysis examines astrological timing for group events. Success depends on many factors including preparation, group dynamics, and practical considerations. Professional event planning is recommended.'
      }
    };
  }

  /**
   * Create group timing analysis summary for quick reference
   * @param {Object} result - Full group timing analysis
   * @returns {Object} Summary
   * @private
   */
  _createGroupTimingSummary(result) {
    return {
      eventType: result.eventType,
      groupSize: result.groupMembers.length,
      proposedDate: result.eventDate,
      timingStrength: result.optimalTiming.timingStrength,
      groupHarmony: result.groupCompatibility.overallHarmony,
      successPotential: result.successPotential.overallRating,
      keyInsights: {
        optimalTiming: result.optimalTiming.optimalDate === result.eventDate ? 'Yes' : 'Alternative recommended',
        groupEnergy: result.groupCompatibility.groupEnergy,
        eventSpecific: result.eventTiming.specificConsiderations.length > 0 ? 'Considered' : 'General',
        preparation: result.successPotential.overallRating < 70 ? 'Extra preparation needed' : 'Standard preparation'
      },
      topRecommendations: [
        ...(result.recommendations.timing || []).slice(0, 1),
        ...(result.recommendations.preparation || []).slice(0, 1),
        ...(result.recommendations.execution || []).slice(0, 1)
      ]
    };
  }

  /**
   * Get service metadata
   * @returns {Object} Service information
   */
  getMetadata() {
    return {
      name: 'GroupTimingService',
      description: 'Comprehensive group timing analysis for events involving multiple people, combining individual birth charts with auspicious timing calculations for optimal collective activities',
      version: '1.0.0',
      dependencies: ['GroupAstrologyCalculator', 'MuhurtaCalculator', 'CompatibilityScorer'],
      category: 'vedic'
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

module.exports = GroupTimingService;
