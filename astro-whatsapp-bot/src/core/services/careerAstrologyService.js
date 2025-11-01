const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');

class CareerAstrologyService extends ServiceTemplate {
  constructor() {
    super('CareerAstrologyService');
    this.calculatorPath =
      '../../../services/astrology/calculators/CareerAstrologyCalculator';
  }

  async initialize() {
    try {
      await super.initialize();
      logger.info('✅ CareerAstrologyService initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize CareerAstrologyService:', error);
      throw error;
    }
  }

  async analyzeCareerAstrology(params) {
    try {
      this.validateParams(params, ['birthData']);

      const { birthData, options = {} } = params;

      // Perform career astrology analysis
      const careerAnalysis =
        await this.calculator.calculateCareerAstrologyAnalysis(birthData);

      // Generate detailed career insights
      const careerInsights = this.generateCareerInsights(careerAnalysis);

      // Identify suitable professions
      const suitableProfessions =
        this.identifySuitableProfessions(careerAnalysis);

      // Create career development plan
      const developmentPlan = this.createCareerDevelopmentPlan(careerAnalysis);

      return {
        success: true,
        data: {
          careerAnalysis,
          careerInsights,
          suitableProfessions,
          developmentPlan,
          summary: this.generateCareerSummary(careerAnalysis)
        },
        metadata: {
          calculationType: 'career_astrology',
          timestamp: new Date().toISOString(),
          analysisDepth: options.deepAnalysis ? 'comprehensive' : 'standard'
        }
      };
    } catch (error) {
      logger.error('❌ Error in analyzeCareerAstrology:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'career_astrology',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  async processCalculation(data) {
    return await this.mainMethod(data);
  }

  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          careerAnalysis: true,
          careerTiming: true,
          careerChangeAnalysis: true,
          professionMatching: true,
          developmentPlanning: true
        },
        supportedAnalyses: [
          'career_astrology_analysis',
          'career_timing',
          'career_change_analysis',
          'profession_matching',
          'development_planning'
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

  /**
   * Generate career insights
   * @param {Object} careerAnalysis - Career analysis data
   * @returns {Array} Career insights
   */
  generateCareerInsights(careerAnalysis) {
    const insights = [];

    // Midheaven insights
    if (careerAnalysis.midheavenAnalysis) {
      insights.push({
        type: 'midheaven',
        title: 'Career Direction',
        description: careerAnalysis.midheavenAnalysis,
        strength: 'high'
      });
    }

    // Tenth house insights
    if (
      careerAnalysis.tenthHousePlanets &&
      careerAnalysis.tenthHousePlanets.length > 0
    ) {
      careerAnalysis.tenthHousePlanets.forEach(planet => {
        insights.push({
          type: 'tenth_house',
          title: `${planet.planet} in 10th House`,
          description: planet.influence,
          strength: 'medium'
        });
      });
    }

    // Career planets insights
    if (
      careerAnalysis.careerPlanets &&
      careerAnalysis.careerPlanets.length > 0
    ) {
      careerAnalysis.careerPlanets.forEach(planet => {
        insights.push({
          type: 'career_planet',
          title: `${planet.planet} Career Impact`,
          description: planet.careerImpact,
          strength: 'medium'
        });
      });
    }

    // Success potential insights
    if (careerAnalysis.successPotential) {
      insights.push({
        type: 'success_potential',
        title: 'Success Potential',
        description: careerAnalysis.successPotential,
        strength: 'high'
      });
    }

    return insights;
  }

  /**
   * Identify suitable professions
   * @param {Object} careerAnalysis - Career analysis data
   * @returns {Array} Suitable professions
   */
  identifySuitableProfessions(careerAnalysis) {
    const professions = [];

    // Analyze Midheaven sign for career direction
    const mcSign = this.extractMCSign(careerAnalysis.midheavenAnalysis);
    const mcProfessions = this.getProfessionsForSign(mcSign);
    professions.push(...mcProfessions);

    // Analyze tenth house planets
    if (careerAnalysis.tenthHousePlanets) {
      careerAnalysis.tenthHousePlanets.forEach(planet => {
        const planetProfessions = this.getProfessionsForPlanet(planet.planet);
        professions.push(...planetProfessions);
      });
    }

    // Remove duplicates and prioritize
    const uniqueProfessions = [...new Set(professions)];
    return uniqueProfessions.slice(0, 10).map(profession => ({
      profession,
      matchScore: this.calculateProfessionMatch(profession, careerAnalysis),
      category: this.categorizeProfession(profession)
    }));
  }

  /**
   * Create career development plan
   * @param {Object} careerAnalysis - Career analysis data
   * @returns {Object} Development plan
   */
  createCareerDevelopmentPlan(careerAnalysis) {
    const plan = {
      shortTerm: [],
      mediumTerm: [],
      longTerm: [],
      skills: [],
      challenges: []
    };

    // Short-term goals (0-2 years)
    plan.shortTerm.push({
      goal: 'Establish professional foundation',
      actions: [
        'Build core skills',
        'Network in chosen field',
        'Gain practical experience'
      ],
      timeframe: '0-2 years'
    });

    // Medium-term goals (2-5 years)
    plan.mediumTerm.push({
      goal: 'Develop expertise and recognition',
      actions: [
        'Specialize in niche area',
        'Take leadership roles',
        'Build professional reputation'
      ],
      timeframe: '2-5 years'
    });

    // Long-term goals (5+ years)
    plan.longTerm.push({
      goal: 'Achieve career mastery and influence',
      actions: [
        'Mentor others',
        'Industry leadership',
        'Create lasting impact'
      ],
      timeframe: '5+ years'
    });

    // Skills development
    plan.skills = this.identifyKeySkills(careerAnalysis);

    // Potential challenges
    plan.challenges = this.identifyCareerChallenges(careerAnalysis);

    return plan;
  }

  /**
   * Generate career summary
   * @param {Object} careerAnalysis - Career analysis data
   * @returns {string} Career summary
   */
  generateCareerSummary(careerAnalysis) {
    let summary = `${careerAnalysis.introduction}\n\n`;

    if (careerAnalysis.careerDirection) {
      summary += `Career Direction: ${careerAnalysis.careerDirection}\n\n`;
    }

    if (careerAnalysis.careerTiming && careerAnalysis.careerTiming.length > 0) {
      summary += 'Current Career Phase:\n';
      careerAnalysis.careerTiming.slice(0, 2).forEach((timing, index) => {
        summary += `${index + 1}. ${timing.event}: ${timing.description}\n`;
      });
    }

    return summary;
  }

  /**
   * Analyze timing opportunities
   * @param {Array} careerTiming - Career timing data
   * @param {number} timeframe - Timeframe in months
   * @returns {Array} Timing opportunities
   */
  analyzeTimingOpportunities(careerTiming, timeframe) {
    const opportunities = [];

    if (careerTiming && careerTiming.length > 0) {
      careerTiming.forEach(timing => {
        opportunities.push({
          type: timing.event,
          description: timing.description,
          timeframe: this.calculateOpportunityTimeframe(timing, timeframe),
          priority: this.assessTimingPriority(timing.event)
        });
      });
    }

    return opportunities;
  }

  /**
   * Identify favorable periods
   * @param {Object} careerAnalysis - Career analysis
   * @param {number} timeframe - Timeframe
   * @returns {Array} Favorable periods
   */
  identifyFavorablePeriods(careerAnalysis, timeframe) {
    const periods = [];

    // Current period
    periods.push({
      period: 'Current',
      description: 'Present career development phase',
      favorability: this.assessCurrentFavorability(careerAnalysis),
      recommendations: [
        'Focus on skill building',
        'Establish professional connections'
      ]
    });

    // Next favorable period (simplified)
    periods.push({
      period: 'Next 6 months',
      description: 'Upcoming growth opportunities',
      favorability: 'favorable',
      recommendations: [
        'Prepare for new opportunities',
        'Update professional materials'
      ]
    });

    return periods;
  }

  /**
   * Generate timing recommendations
   * @param {Array} timingOpportunities - Timing opportunities
   * @param {Array} favorablePeriods - Favorable periods
   * @returns {Array} Recommendations
   */
  generateTimingRecommendations(timingOpportunities, favorablePeriods) {
    const recommendations = [];

    // High-priority opportunities
    const highPriorityOpportunities = timingOpportunities.filter(
      opp => opp.priority === 'high'
    );

    if (highPriorityOpportunities.length > 0) {
      recommendations.push({
        category: 'immediate_action',
        advice: 'Focus on high-priority career opportunities in the near term',
        priority: 'high'
      });
    }

    // Favorable period actions
    const favorablePeriod = favorablePeriods.find(
      p => p.favorability === 'favorable'
    );
    if (favorablePeriod) {
      recommendations.push({
        category: 'timing',
        advice: `Leverage the ${favorablePeriod.period} for career advancement`,
        priority: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Assess current career phase
   * @param {Object} careerAnalysis - Career analysis
   * @returns {Object} Current phase assessment
   */
  assessCurrentCareerPhase(careerAnalysis) {
    const currentAge = this.calculateCurrentAge(careerAnalysis);

    let phase = 'foundation';
    let description = 'Building career foundations';

    if (currentAge >= 28 && currentAge <= 30) {
      phase = 'saturn_return';
      description = 'Saturn return - career maturity and establishment';
    } else if (currentAge >= 35 && currentAge <= 40) {
      phase = 'mid_career';
      description = 'Mid-career evaluation and potential redirection';
    } else if (currentAge >= 50) {
      phase = 'mastery';
      description = 'Career mastery and mentorship phase';
    }

    return {
      phase,
      description,
      age: currentAge,
      focus: this.getPhaseFocus(phase)
    };
  }

  /**
   * Assess career alignment
   * @param {Object} careerAnalysis - Career analysis
   * @param {Object} currentCareer - Current career info
   * @returns {Object} Alignment assessment
   */
  assessCareerAlignment(careerAnalysis, currentCareer) {
    const alignment = {
      score: 0,
      strengths: [],
      challenges: [],
      recommendations: []
    };

    // Simplified alignment calculation
    const careerDirection = careerAnalysis.careerDirection || '';
    const currentField = currentCareer.field || '';

    // Check for alignment keywords
    const alignmentKeywords = this.getAlignmentKeywords(careerDirection);
    const currentKeywords = this.getAlignmentKeywords(currentField);

    const matchingKeywords = alignmentKeywords.filter(keyword =>
      currentKeywords.some(ck =>
        ck.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    alignment.score = Math.round(
      (matchingKeywords.length / Math.max(alignmentKeywords.length, 1)) * 100
    );

    if (alignment.score >= 70) {
      alignment.strengths.push(
        'Strong alignment between natural talents and current career'
      );
    } else if (alignment.score >= 40) {
      alignment.strengths.push('Moderate alignment with room for optimization');
    } else {
      alignment.challenges.push(
        'Limited alignment - consider career realignment'
      );
    }

    return alignment;
  }

  /**
   * Identify change opportunities
   * @param {Object} careerAnalysis - Career analysis
   * @param {Object} alignmentAssessment - Alignment assessment
   * @returns {Array} Change opportunities
   */
  identifyChangeOpportunities(careerAnalysis, alignmentAssessment) {
    const opportunities = [];

    if (alignmentAssessment.score < 50) {
      opportunities.push({
        type: 'realignment',
        description:
          'Consider career change to better align with natural talents',
        urgency: 'medium'
      });
    }

    // Based on career timing
    if (careerAnalysis.careerTiming) {
      const changeTiming = careerAnalysis.careerTiming.find(
        t =>
          t.event.toLowerCase().includes('change') ||
          t.event.toLowerCase().includes('transition')
      );

      if (changeTiming) {
        opportunities.push({
          type: 'timing',
          description: `Favorable timing for career change: ${changeTiming.description}`,
          urgency: 'low'
        });
      }
    }

    return opportunities;
  }

  /**
   * Generate transition plan
   * @param {Object} careerAnalysis - Career analysis
   * @param {Array} changeOpportunities - Change opportunities
   * @returns {Object} Transition plan
   */
  generateTransitionPlan(careerAnalysis, changeOpportunities) {
    const plan = {
      preparation: [],
      transition: [],
      establishment: []
    };

    // Preparation phase
    plan.preparation.push({
      action: 'Research new career directions',
      timeline: '1-3 months',
      resources: ['Career counseling', 'Industry research', 'Skill assessment']
    });

    plan.preparation.push({
      action: 'Develop necessary skills',
      timeline: '3-6 months',
      resources: ['Training programs', 'Certifications', 'Mentorship']
    });

    // Transition phase
    plan.transition.push({
      action: 'Make career transition',
      timeline: '6-12 months',
      resources: ['Financial planning', 'Network building', 'Job search']
    });

    // Establishment phase
    plan.establishment.push({
      action: 'Establish in new career',
      timeline: '12-24 months',
      resources: [
        'Professional development',
        'Performance excellence',
        'Career advancement'
      ]
    });

    return plan;
  }

  /**
   * Generate change recommendations
   * @param {Object} alignmentAssessment - Alignment assessment
   * @returns {Array} Recommendations
   */
  generateChangeRecommendations(alignmentAssessment) {
    const recommendations = [];

    if (alignmentAssessment.score < 40) {
      recommendations.push({
        category: 'immediate',
        advice:
          'Consider significant career realignment for better fulfillment',
        priority: 'high'
      });
    } else if (alignmentAssessment.score < 70) {
      recommendations.push({
        category: 'optimization',
        advice:
          'Optimize current career path to better utilize natural talents',
        priority: 'medium'
      });
    }

    recommendations.push({
      category: 'development',
      advice: 'Continuous skill development regardless of career path',
      priority: 'low'
    });

    return recommendations;
  }

  // Helper methods
  extractMCSign(midheavenAnalysis) {
    const signs = [
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

    for (const sign of signs) {
      if (midheavenAnalysis.includes(sign)) {
        return sign;
      }
    }
    return 'Unknown';
  }

  getProfessionsForSign(sign) {
    const professions = {
      Aries: [
        'Entrepreneur',
        'Military',
        'Sports',
        'Sales',
        'Leadership roles'
      ],
      Taurus: ['Banking', 'Real estate', 'Agriculture', 'Art', 'Music'],
      Gemini: ['Writing', 'Journalism', 'Teaching', 'Communications', 'IT'],
      Cancer: [
        'Healthcare',
        'Hospitality',
        'Social work',
        'Counseling',
        'Food industry'
      ],
      Leo: [
        'Management',
        'Entertainment',
        'Politics',
        'Creative fields',
        'Public relations'
      ],
      Virgo: [
        'Healthcare',
        'Accounting',
        'Research',
        'Editing',
        'Quality control'
      ],
      Libra: [
        'Law',
        'Diplomacy',
        'Design',
        'Human resources',
        'Customer service'
      ],
      Scorpio: [
        'Research',
        'Psychology',
        'Investigation',
        'Finance',
        'Medicine'
      ],
      Sagittarius: ['Teaching', 'Travel', 'Publishing', 'Philosophy', 'Sports'],
      Capricorn: [
        'Management',
        'Finance',
        'Engineering',
        'Politics',
        'Real estate'
      ],
      Aquarius: [
        'Technology',
        'Science',
        'Social work',
        'Innovation',
        'Humanitarian work'
      ],
      Pisces: ['Arts', 'Music', 'Spirituality', 'Healing', 'Creative writing']
    };

    return professions[sign] || ['General business', 'Service industry'];
  }

  getProfessionsForPlanet(planet) {
    const professions = {
      Sun: ['Leadership', 'Management', 'Politics', 'CEO', 'Director'],
      Moon: [
        'Healthcare',
        'Hospitality',
        'Counseling',
        'Social work',
        'Food service'
      ],
      Mars: [
        'Military',
        'Sports',
        'Engineering',
        'Construction',
        'Entrepreneurship'
      ],
      Mercury: ['Writing', 'Teaching', 'Communications', 'IT', 'Sales'],
      Jupiter: ['Teaching', 'Law', 'Publishing', 'Consulting', 'Finance'],
      Venus: ['Arts', 'Design', 'Fashion', 'Hospitality', 'Public relations'],
      Saturn: [
        'Management',
        'Finance',
        'Engineering',
        'Real estate',
        'Politics'
      ]
    };

    return professions[planet] || ['Business', 'Service industry'];
  }

  calculateProfessionMatch(profession, careerAnalysis) {
    // Simplified matching algorithm
    let score = 50; // Base score

    // Add points for alignment with career direction
    if (careerAnalysis.careerDirection) {
      score += 20;
    }

    // Add points for success potential
    if (
      careerAnalysis.successPotential &&
      careerAnalysis.successPotential.includes('High')
    ) {
      score += 15;
    }

    return Math.min(100, score);
  }

  categorizeProfession(profession) {
    const categories = {
      Leadership: ['CEO', 'Manager', 'Director', 'Leadership', 'Management'],
      Creative: ['Art', 'Design', 'Music', 'Writing', 'Fashion'],
      Service: ['Healthcare', 'Social work', 'Counseling', 'Hospitality'],
      Technical: ['Engineering', 'IT', 'Technology', 'Science'],
      Business: ['Finance', 'Sales', 'Banking', 'Real estate', 'Consulting']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (
        keywords.some(keyword =>
          profession.toLowerCase().includes(keyword.toLowerCase())
        )
      ) {
        return category;
      }
    }

    return 'General';
  }

  identifyKeySkills(careerAnalysis) {
    const skills = [];

    // Based on career planets
    if (careerAnalysis.careerPlanets) {
      careerAnalysis.careerPlanets.forEach(planet => {
        const planetSkills = this.getSkillsForPlanet(planet.planet);
        skills.push(...planetSkills);
      });
    }

    return [...new Set(skills)].slice(0, 8);
  }

  identifyCareerChallenges(careerAnalysis) {
    const challenges = [];

    // Based on success potential analysis
    if (careerAnalysis.successPotential) {
      if (careerAnalysis.successPotential.includes('challenges')) {
        challenges.push({
          challenge: 'Overcoming obstacles',
          strategy: 'Persistence and strategic planning'
        });
      }

      if (careerAnalysis.successPotential.includes('effort')) {
        challenges.push({
          challenge: 'Consistent effort required',
          strategy: 'Discipline and goal setting'
        });
      }
    }

    return challenges;
  }

  calculateOpportunityTimeframe(timing, timeframe) {
    // Simplified timeframe calculation
    return `Within ${timeframe} months`;
  }

  assessTimingPriority(event) {
    const highPriorityEvents = ['Saturn Return', 'Jupiter Transit'];
    return highPriorityEvents.includes(event) ? 'high' : 'medium';
  }

  assessCurrentFavorability(careerAnalysis) {
    // Simplified favorability assessment
    return careerAnalysis.successPotential &&
      careerAnalysis.successPotential.includes('High') ?
      'favorable' :
      'neutral';
  }

  calculateCurrentAge(careerAnalysis) {
    // This would normally be calculated from birth data
    return 30; // Placeholder
  }

  getPhaseFocus(phase) {
    const focus = {
      foundation: 'Skill building and experience gathering',
      saturn_return: 'Career establishment and responsibility',
      mid_career: 'Evaluation and potential redirection',
      mastery: 'Mentorship and legacy building'
    };

    return focus[phase] || 'Continuous development';
  }

  getAlignmentKeywords(text) {
    // Extract keywords from text
    const keywords = text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3);
    return [...new Set(keywords)];
  }

  getSkillsForPlanet(planet) {
    const skills = {
      Sun: ['Leadership', 'Public speaking', 'Strategic planning'],
      Moon: ['Emotional intelligence', 'Intuition', 'Nurturing'],
      Mars: ['Action orientation', 'Courage', 'Physical stamina'],
      Mercury: ['Communication', 'Analytical thinking', 'Writing'],
      Jupiter: ['Teaching', 'Mentoring', 'Strategic thinking'],
      Venus: ['Creativity', 'Diplomacy', 'Aesthetic sense'],
      Saturn: ['Discipline', 'Planning', 'Organization']
    };

    return skills[planet] || ['Professional skills'];
  }

  // Main service methods with consistent error handling
  async mainMethod(params) {
    try {
      this.validateParams(params, ['birthData']);
      const result =
        await this.calculator.calculateCareerAstrologyAnalysis(params);
      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'career_astrology',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error in mainMethod:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'career_astrology',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}

module.exports = CareerAstrologyService;
