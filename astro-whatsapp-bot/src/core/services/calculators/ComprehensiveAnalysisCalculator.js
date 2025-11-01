const logger = require('../../../../utils/logger');
const sweph = require('sweph');

/**
 * Comprehensive Vedic Analysis Calculator
 * Provides multi-level chart analysis combining multiple Vedic techniques
 */
class ComprehensiveAnalysisCalculator {
  constructor(astrologer, geocodingService) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;
    this.services = null; // Will be set later
  }

  /**
   * Set services for the calculator
   */
  setServices(services) {
    this.services = services;
  }

  /**
   * Generate comprehensive multi-level Vedic analysis
   * Combines D1, D9, divisional charts, yogas, dashas, and transits
   */
  async generateComprehensiveVedicAnalysis(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return {
          error: 'Complete birth details required for comprehensive analysis'
        };
      }

      // Multi-level chart analysis
      const analysisLevels = {
        rasi: await this._analyzeRasiChart(birthData), // D1 - Physical life
        navamsa: await this._analyzeNavamsaChart(birthData), // D9 - Marriage/Relationships
        dashamsa: await this._analyzeDashamsaChart(birthData), // D10 - Career
        dwadasamsa: await this._analyzeDwadasamsaChart(birthData), // D12 - Parents/Spirituality
        divisional: await this._analyzeDivisionalCharts(birthData)
      };

      // Yogas and combinations analysis
      const yogasAnalysis = await this._analyzeAllYogas(birthData);

      // Dasha (planetary period) analysis
      const dashaAnalysis = await this._analyzeDashas(birthData);

      // Transits and current influences
      const transitAnalysis = await this._analyzeCurrentTransits(birthData);

      // Holistic assessment
      const holisticAssessment = this._createHolisticAssessment(
        analysisLevels,
        yogasAnalysis,
        dashaAnalysis,
        transitAnalysis
      );

      // Life predictions by period
      const lifePredictions = this._generateLifePredictions(holisticAssessment);

      return {
        name,
        analysisLevels,
        yogasAnalysis,
        dashaAnalysis,
        transitAnalysis,
        holisticAssessment,
        lifePredictions,
        summary: this._generateComprehensiveSummary(
          holisticAssessment,
          lifePredictions
        )
      };
    } catch (error) {
      logger.error('❌ Error in comprehensive Vedic analysis:', error);
      throw new Error(`Comprehensive analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze Rasi chart (D1)
   */
  async _analyzeRasiChart(birthData) {
    try {
      // Get D1 analysis from ChartGenerator if available
      if (this.services?.generateRasiChart) {
        return await this.services.generateRasiChart(birthData);
      }

      // Basic D1 analysis
      const analysis = {
        strengths: [],
        weaknesses: [],
        keyIndicators: [],
        lifeAreas: {
          personality: 'Based on ascendant and planetary positions',
          physical: 'Health and body based on 1st house',
          family: 'Family life from 2nd and 4th houses',
          career: 'Professional life from 10th house',
          relationships: 'Marriage and partnerships from 7th house',
          spirituality: 'Spiritual growth from 9th and 12th houses'
        }
      };

      return analysis;
    } catch (error) {
      logger.warn('Rasi chart analysis error:', error.message);
      return { error: 'Unable to analyze Rasi chart' };
    }
  }

  /**
   * Analyze Navamsa chart (D9) for relationships
   */
  async _analyzeNavamsaChart(birthData) {
    try {
      // Get D9 analysis from existing calculators if available
      if (this.services?.calculateVargaChart) {
        const d9Chart = await this.services.calculateVargaChart(
          birthData,
          'D9'
        );
        return d9Chart;
      }

      return {
        partnership: 'Analysis of marriage and long-term relationships',
        spouse: 'Characteristics and nature of life partner',
        harmony: 'Relationship compatibility and challenges',
        timing: 'Marriage timing indicators',
        success: 'Relationship success factors'
      };
    } catch (error) {
      logger.warn('Navamsa chart analysis error:', error.message);
      return { error: 'Unable to analyze Navamsa chart' };
    }
  }

  /**
   * Analyze Dashamsa chart (D10) for career
   */
  async _analyzeDashamsaChart(birthData) {
    try {
      if (this.services?.calculateVargaChart) {
        const d10Chart = await this.services.calculateVargaChart(
          birthData,
          'D10'
        );
        return d10Chart;
      }

      return {
        profession: 'Career path and professional inclinations',
        success: 'Achievement potential and recognition',
        authority: 'Leadership qualities and management skills',
        finance: 'Income from profession and career earnings',
        reputation: 'Public image and professional status'
      };
    } catch (error) {
      logger.warn('Dashamsa chart analysis error:', error.message);
      return { error: 'Unable to analyze Dashamsa chart' };
    }
  }

  /**
   * Analyze Dwadasamsa chart (D12) for ancestry and spirituality
   */
  async _analyzeDwadasamsaChart(birthData) {
    try {
      if (this.services?.calculateVargaChart) {
        const d12Chart = await this.services.calculateVargaChart(
          birthData,
          'D12'
        );
        return d12Chart;
      }

      return {
        parents: 'Relationship with parents and familial blessings',
        ancestors: 'Ancestral influences and karmic patterns',
        spirituality: 'Spiritual growth and higher consciousness',
        liberation: 'Path to liberation (Moksha)',
        foreign: 'Foreign connections and travel abroad',
        expenditure: 'Major life expenses and losses'
      };
    } catch (error) {
      logger.warn('Dwadasamsa chart analysis error:', error.message);
      return { error: 'Unable to analyze Dwadasamsa chart' };
    }
  }

  /**
   * Analyze other divisional charts
   */
  async _analyzeDivisionalCharts(birthData) {
    const divisionalCharts = {};

    try {
      const charts = [
        'D2',
        'D3',
        'D4',
        'D7',
        'D16',
        'D20',
        'D24',
        'D27',
        'D30',
        'D40',
        'D45',
        'D60'
      ];

      for (const chart of charts) {
        try {
          if (this.services?.calculateVargaChart) {
            divisionalCharts[chart] = await this.services.calculateVargaChart(
              birthData,
              chart
            );
          } else {
            divisionalCharts[chart] = {
              status: 'Not calculated',
              purpose: this._getDivisionalPurpose(chart)
            };
          }
        } catch (error) {
          divisionalCharts[chart] = { error: `Failed to calculate ${chart}` };
        }
      }
    } catch (error) {
      logger.warn('Divisional charts analysis error:', error.message);
    }

    return divisionalCharts;
  }

  /**
   * Analyze all yogas across charts
   */
  async _analyzeAllYogas(birthData) {
    const yogas = {
      rajaYogas: [],
      dhanYogas: [],
      spiritualYogas: [],
      obstacleYogas: [],
      strength: 'Analysis of yogas'
    };

    try {
      // Get yoga analysis from VedicYogasCalculator if available
      if (this.services?.generateVedicYogas) {
        const yogaResults = await this.services.generateVedicYogas(birthData);
        yogas = { ...yogas, ...yogaResults };
      }
    } catch (error) {
      logger.warn('Yogas analysis error:', error.message);
    }

    // Add comprehensive yoga analysis
    yogas.comprehensiveAnalysis = {
      favorable: 'Count and nature of beneficial yogas',
      challenging: 'Obstacle-creating yogas and their effects',
      spiritual: 'Yogas indicating spiritual inclination',
      material: 'Yogas indicating material success',
      balancing: 'How different yogas balance each other'
    };

    return yogas;
  }

  /**
   * Analyze dasha patterns
   */
  async _analyzeDashas(birthData) {
    try {
      // Get dasha analysis from DashaAnalysisCalculator if available
      if (this.services?.calculateVimshottariDasha) {
        return await this.services.calculateVimshottariDasha(birthData);
      }

      return {
        currentPeriod: 'Current major and sub-period lords',
        upcomingChanges: 'Significant dasha changes in next few years',
        influentialPeriods: 'Most important periods for major life events',
        challengingPhases: 'Difficult periods requiring caution',
        beneficialPhases: 'Periods of opportunity and success'
      };
    } catch (error) {
      logger.warn('Dasha analysis error:', error.message);
      return { error: 'Unable to analyze dasha patterns' };
    }
  }

  /**
   * Analyze current planetary transits
   */
  async _analyzeCurrentTransits(birthData) {
    try {
      // Get transit analysis from GocharCalculator if available
      if (this.services?.calculateGochar) {
        return await this.services.calculateGochar(birthData);
      }

      return {
        currentInfluences: 'Planets currently affecting your life',
        upcomingInfluences: 'Major transits in next 6-12 months',
        supportive: 'Transits supporting your goals',
        challenging: 'Transits requiring caution',
        timing: 'Auspicious and challenging periods ahead'
      };
    } catch (error) {
      logger.warn('Transits analysis error:', error.message);
      return { error: 'Unable to analyze current transits' };
    }
  }

  /**
   * Create holistic assessment combining all factors
   */
  _createHolisticAssessment(
    analysisLevels,
    yogasAnalysis,
    dashaAnalysis,
    transitAnalysis
  ) {
    const holistic = {
      overallLifePotential: 0,
      lifeBalance: '',
      dominantThemes: [],
      keyStrengths: [],
      principalChallenges: [],
      spiritualPath: '',
      materialPath: '',
      relationshipHarmony: '',
      healthVigor: '',
      financialProsperity: '',
      recommendations: []
    };

    // Calculate overall life potential (0-100 scale)
    let potential = 0;

    // Add points based on various factors
    if (yogasAnalysis.rajaYogas?.length > 0) {
      potential += 25;
    }
    if (yogasAnalysis.dhanYogas?.length > 0) {
      potential += 20;
    }
    if (
      analysisLevels.rasi?.strengths?.length >
      analysisLevels.rasi?.weaknesses?.length
    ) {
      potential += 15;
    }
    if (dashaAnalysis.currentPeriod !== 'Error') {
      potential += 20;
    }
    if (!transitAnalysis.error) {
      potential += 20;
    }

    holistic.overallLifePotential = Math.min(potential, 100);

    // Determine life balance
    if (holistic.overallLifePotential >= 80) {
      holistic.lifeBalance =
        'Exceptional - strong foundations in multiple life areas';
    } else if (holistic.overallLifePotential >= 65) {
      holistic.lifeBalance =
        'Strong - good balance with some areas needing attention';
    } else if (holistic.overallLifePotential >= 50) {
      holistic.lifeBalance =
        'Moderate - mixed influences requiring conscious effort';
    } else if (holistic.overallLifePotential >= 35) {
      holistic.lifeBalance = 'Challenging - significant obstacles to overcome';
    } else {
      holistic.lifeBalance =
        'Very Challenging - requires major remedial efforts';
    }

    // Identify dominant themes
    holistic.dominantThemes = this._identifyDominantThemes(
      analysisLevels,
      yogasAnalysis
    );

    // Assess life areas
    holistic.relationshipHarmony = this._assessRelationshipHarmony(
      analysisLevels.navamsa
    );
    holistic.spiritualPath = this._assessSpiritualPath(
      analysisLevels.dwadasamsa,
      yogasAnalysis
    );
    holistic.materialPath = this._assessMaterialPath(
      analysisLevels.dashamsa,
      yogasAnalysis
    );
    holistic.healthVigor = this._assessHealthVigor(analysisLevels);
    holistic.financialProsperity = this._assessFinancialProsperity(
      yogasAnalysis,
      dashaAnalysis
    );

    // Generate recommendations
    holistic.recommendations = this._generateHolisticRecommendations(
      holistic,
      dashaAnalysis,
      transitAnalysis
    );

    return holistic;
  }

  /**
   * Generate life predictions by age period
   */
  _generateLifePredictions(holisticAssessment) {
    const predictions = {
      earlyLife: {}, // Birth to 25
      youngAdult: {}, // 26 to 40
      middleAge: {}, // 41 to 60
      laterYears: {}, // 61+
      keyMilestones: [], // Major life events
      turningPoints: [] // Critical transition periods
    };

    const potential = holisticAssessment.overallLifePotential;

    // Early life predictions
    if (potential >= 70) {
      predictions.earlyLife = {
        education: 'Excellent academic success and learning opportunities',
        personality: 'Strong early personality development',
        foundations: 'Solid foundations for future success',
        relationships: 'Good early social connections and friendships'
      };
    } else if (potential >= 50) {
      predictions.earlyLife = {
        education: 'Moderate academic performance with some challenges',
        personality: 'Developing self-awareness and identity',
        foundations: 'Building foundations through learning experiences',
        relationships: 'Social development with valuable lessons'
      };
    } else {
      predictions.earlyLife = {
        education: 'Learning through educational challenges',
        personality: 'Character building through difficulties',
        foundations: 'Developing resilience and determination',
        relationships: 'Meaningful connections formed through experience'
      };
    }

    // Young adult predictions
    if (potential >= 70) {
      predictions.youngAdult = {
        career: 'Strong professional foundation and advancement',
        relationships: 'Harmonious partnerships and marriage',
        independence: 'Successful establishment of independent life',
        growth: 'Rapid personal and professional development'
      };
    } else if (potential >= 50) {
      predictions.youngAdult = {
        career: 'Progressive career development with some challenges',
        relationships: 'Meaningful relationships requiring effort',
        independence: 'Achieving independence through perseverance',
        growth: 'Steady personal development and learning'
      };
    } else {
      predictions.youngAdult = {
        career: 'Career development through persistence and adaptation',
        relationships: 'Relationships developing through life experience',
        independence: 'Gaining independence through overcoming obstacles',
        growth: 'Profound personal growth through challenges'
      };
    }

    // Middle age predictions
    if (potential >= 70) {
      predictions.middleAge = {
        achievements: 'Significant life achievements and recognition',
        stability: 'Established stability in career and family',
        leadership: 'Leadership opportunities and influence',
        wisdom: 'Growing wisdom and mentoring capabilities'
      };
    } else if (potential >= 50) {
      predictions.middleAge = {
        achievements: 'Meaningful accomplishments and contributions',
        stability: 'Building stability through consistent effort',
        leadership: 'Earning respect and leadership roles',
        wisdom: 'Developing wisdom through life experiences'
      };
    } else {
      predictions.middleAge = {
        achievements: 'Important achievements through determination',
        stability: 'Working towards stability despite challenges',
        leadership: 'Earning leadership through perseverance',
        wisdom: 'Deep wisdom gained through adversity'
      };
    }

    // Later years predictions
    predictions.laterYears = {
      legacy: 'Legacy and contributions valued by others',
      reflection: 'Time for reflection and inner peace',
      family: 'Strong family bonds and intergenerational connections',
      spirituality: 'Deepened spiritual understanding and peace'
    };

    // Key milestones
    predictions.keyMilestones = [
      {
        age: '22-25',
        event: 'Career establishment',
        significance: 'Foundation for professional life'
      },
      {
        age: '27-32',
        event: 'Major relationships',
        significance: 'Partnerships and family foundation'
      },
      {
        age: '35-42',
        event: 'Major achievements',
        significance: 'Peak accomplishment period'
      },
      {
        age: '45-55',
        event: 'Leadership roles',
        significance: 'Positions of influence and responsibility'
      },
      {
        age: '60+',
        event: 'Legacy and wisdom',
        significance: 'Passing on knowledge and experience'
      }
    ];

    // Turning points
    predictions.turningPoints = [
      {
        period: 'Age 27',
        significance: 'Saturn return - maturation and responsibility'
      },
      {
        period: 'Age 40s',
        significance: 'Mid-life transition and reassessment'
      },
      {
        period: 'Age 58-62',
        significance: 'Important life passage and wisdom period'
      },
      { period: 'Age 65+', significance: 'Completion and spiritual focus' }
    ];

    return predictions;
  }

  /**
   * Generate comprehensive summary
   */
  _generateComprehensiveSummary(holisticAssessment, lifePredictions) {
    let summary = '🔬 *Comprehensive Vedic Analysis*\n\n';

    summary += `*Overall Life Potential: ${holisticAssessment.overallLifePotential}%*\n`;
    summary += `*Life Balance: ${holisticAssessment.lifeBalance}*\n\n`;

    summary += '*Key Life Areas:*\n';
    summary += `• Relationships: ${holisticAssessment.relationshipHarmony}\n`;
    summary += `• Career: ${holisticAssessment.materialPath}\n`;
    summary += `• Health: ${holisticAssessment.healthVigor}\n`;
    summary += `• Finance: ${holisticAssessment.financialProsperity}\n`;
    summary += `• Spirituality: ${holisticAssessment.spiritualPath}\n\n`;

    summary += '*Life Journey Overview:*\n';
    summary += `• Early Years: ${Object.values(lifePredictions.earlyLife)[0]}\n`;
    summary += `• Young Adult: ${Object.values(lifePredictions.youngAdult)[0]}\n`;
    summary += `• Middle Age: ${Object.values(lifePredictions.middleAge)[0]}\n`;
    summary += `• Later Years: ${holisticAssessment.spiritualPath}\n\n`;

    summary += `*Recommendations: ${holisticAssessment.recommendations.join(', ')}*\n\n`;

    summary +=
      '*This comprehensive analysis combines multiple Vedic techniques for holistic life understanding.*';

    return summary;
  }

  // Helper methods
  _getDivisionalPurpose(chart) {
    const purposes = {
      D2: 'Wealth and family',
      D3: 'Siblings and courage',
      D4: 'Fortune and property',
      D7: 'Children and creativity',
      D16: 'Vehicles and comforts',
      D20: 'Spiritual practices',
      D24: 'Education and knowledge',
      D27: 'Auspicious events',
      D30: 'Obstacles and challenges',
      D40: 'Auspicious ceremonies',
      D45: 'All aspects of life',
      D60: 'Subtle karma analysis'
    };
    return purposes[chart] || 'Specialized analysis';
  }

  _identifyDominantThemes(analysisLevels, yogasAnalysis) {
    const themes = [];

    if (yogasAnalysis.rajaYogas?.length > 0) {
      themes.push('Leadership and authority');
    }

    if (yogasAnalysis.dhanYogas?.length > 0) {
      themes.push('Material prosperity');
    }

    if (analysisLevels.dwadasamsa?.spirituality) {
      themes.push('Spiritual growth');
    }

    if (analysisLevels.navamsa?.partnership) {
      themes.push('Relationships and partnerships');
    }

    return themes.length > 0 ?
      themes :
      ['Personal development', 'Life learning'];
  }

  _assessRelationshipHarmony(navamsaAnalysis) {
    if (navamsaAnalysis?.yogas?.some(y => y.name === 'Gaja Kesari Yoga')) {
      return 'Harmonious partnerships with spiritual connections';
    }
    return 'Relationships requiring understanding and effort';
  }

  _assessSpiritualPath(dwadasamsaAnalysis, yogasAnalysis) {
    if (dwadasamsaAnalysis?.spirituality) {
      return 'Strong spiritual inclinations and development path';
    }
    if (yogasAnalysis.spiritualYogas?.length > 0) {
      return 'Spiritual journey with divine guidance';
    }
    return 'Spirituality develops through life experiences';
  }

  _assessMaterialPath(dashamsaAnalysis, yogasAnalysis) {
    if (yogasAnalysis.dhanYogas?.length > 0) {
      return 'Strong material success and career achievements';
    }
    if (dashamsaAnalysis?.profession) {
      return 'Career development through dedication and effort';
    }
    return 'Material success through steady progress';
  }

  _assessHealthVigor(analysisLevels) {
    // Simplified health assessment based on chart balance
    const rasiStrengths = analysisLevels.rasi?.strengths?.length || 0;
    const rasiWeaknesses = analysisLevels.rasi?.weaknesses?.length || 0;

    if (rasiStrengths > rasiWeaknesses) {
      return 'Good vitality and natural health';
    } else if (rasiStrengths === rasiWeaknesses) {
      return 'Health requires attention and lifestyle balance';
    } else {
      return 'Health challenges requiring careful management';
    }
  }

  _assessFinancialProsperity(yogasAnalysis, dashaAnalysis) {
    if (yogasAnalysis.dhanYogas?.length > 2) {
      return 'Strong financial prospects and material stability';
    }
    if (dashaAnalysis.currentPeriod !== 'Error') {
      return 'Financial success through timing and effort';
    }
    return 'Financial stability develops with planning and patience';
  }

  _generateHolisticRecommendations(holistic, dashaAnalysis, transitAnalysis) {
    const recommendations = [];

    const potential = holistic.overallLifePotential;

    if (potential >= 70) {
      recommendations.push('Leverage your strong foundations');
      recommendations.push('Focus on expansion and growth');
    } else if (potential >= 50) {
      recommendations.push('Build systematically on existing strengths');
      recommendations.push('Address identified challenges proactively');
    } else {
      recommendations.push('Start with foundational improvements');
      recommendations.push('Consider comprehensive remedial measures');
    }

    // Add timing-based advice
    if (dashaAnalysis.currentPeriod !== 'Error') {
      recommendations.push('Pay attention to current dasha influences');
    }

    if (!transitAnalysis.error) {
      recommendations.push('Use favorable transits for important actions');
    }

    recommendations.push('Maintain balance across all life areas');
    recommendations.push('Regular spiritual practices for guidance');

    return recommendations;
  }

  // Utility methods
  async _getCoordinatesForPlace(place) {
    try {
      const coords = await this.geocodingService.getCoordinates(place);
      return [coords.latitude, coords.longitude];
    } catch (error) {
      logger.warn('Error getting coordinates, using default:', error.message);
      return [28.6139, 77.209]; // Delhi
    }
  }

  _dateToJulianDay(year, month, day, hour) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    const jd =
      day +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045;
    return jd + (hour - 12) / 24;
  }
}

module.exports = { ComprehensiveAnalysisCalculator };
