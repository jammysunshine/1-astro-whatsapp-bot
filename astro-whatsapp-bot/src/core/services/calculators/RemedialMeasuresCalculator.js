const logger = require('../../../utils/logger');
const sweph = require('sweph');

/**
 * Remedial Measures Calculator
 * Provides comprehensive astrological remedies including gemstones, mantras,
 * charities, yantras, and spiritual practices to mitigate planetary afflictions
 */
class RemedialMeasuresCalculator {
  constructor(astrologer, geocodingService) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;

    // Comprehensive remedy database
    this.remedies = {
      gemstones: {
        sun: ['Ruby', 'Garnet', 'Red Coral'],
        moon: ['Pearl', 'Moonstone', 'Citrine'],
        mars: ['Red Coral', 'Bloodstone', 'Carnelian'],
        mercury: ['Emerald', 'Green Jade', 'Peridot'],
        jupiter: ['Yellow Sapphire', 'Citrine', 'Topaz'],
        venus: ['Diamond', 'White Sapphire', 'Clear Quartz'],
        saturn: ['Blue Sapphire', 'Amethyst', 'Lapis Lazuli'],
        rahu: ['Hessonite Garnet', 'Black Agate', 'Tiger\'s Eye'],
        ketu: ['Cat\'s Eye Chrysoberyl', 'Turquoise', 'Black Onyx']
      },
      mantras: {
        sun: ['Om Suryaya Namaha', 'Om Adityaya Namaha', 'Gayatri Mantra'],
        moon: [
          'Om Chandraya Namaha',
          'Om Somaya Namaha',
          'Shum Shukraya Namaha'
        ],
        mars: [
          'Om Mangalaya Namaha',
          'Om Angarakaya Namaha',
          'Om Bhaumaya Namaha'
        ],
        mercury: [
          'Om Buddhaya Namaha',
          'Om Dhanvantre Namaha',
          'Om Vignaya Namaha'
        ],
        jupiter: [
          'Om Gurve Namaha',
          'Om Brahmane Namaha',
          'Om Vachaspataye Namaha'
        ],
        venus: [
          'Om Shukraya Namaha',
          'Om Lakshmyai Namaha',
          'Om Kamadevaya Namaha'
        ],
        saturn: [
          'Om Shanaischaraya Namaha',
          'Om Sanaiscaraya Namaha',
          'Om Nilambaraya Namaha'
        ],
        rahu: [
          'Om Rahuve Namaha',
          'Om Sarpaya Namaha',
          'Om Chhayamartandaya Namaha'
        ],
        ketu: ['Om Ketave Namaha', 'Om Dhwajaya Namaha', 'Om Lingaya Namaha']
      },
      charities: {
        sun: ['Gold donation', 'Wheat donation', 'Food distribution to poor'],
        moon: ['Milk donation', 'White items donation', 'Rice distribution'],
        mars: ['Red items donation', 'Land donation', 'Blood donation'],
        mercury: [
          'Green items donation',
          'Books/education support',
          'Pen/paper donation'
        ],
        jupiter: [
          'Yellow items donation',
          'Teacher/guru dakshina',
          'Temple donations'
        ],
        venus: [
          'White items donation',
          'Clothing donation',
          'Milk products distribution'
        ],
        saturn: [
          'Black items donation',
          'Iron implements donation',
          'Oil distribution'
        ],
        rahu: [
          'Lead items donation',
          'Root vegetables donation',
          'Animal shelter support'
        ],
        ketu: [
          'Dog food/shelter support',
          'Grey items donation',
          'Meditation cushions'
        ]
      },
      yantras: {
        sun: ['Surya Yantra', 'Navagraha Yantra', 'Power Yantra'],
        moon: ['Chandra Yantra', 'Laxmi Yantra', 'Peace Yantra'],
        mars: ['Hanuman Yantra', 'Mangal Yantra', 'Courage Yantra'],
        mercury: ['Budh Yantra', 'Vidya Yantra', 'Wisdom Yantra'],
        jupiter: ['Guru Yantra', 'Education Yantra', 'Success Yantra'],
        venus: ['Shukra Yantra', 'Love Yantra', 'Beauty Yantra'],
        saturn: ['Shani Yantra', 'Discipline Yantra', 'Justice Yantra'],
        rahu: ['Rahu Yantra', 'Transformation Yantra', 'Mystery Yantra'],
        ketu: ['Ketu Yantra', 'Liberation Yantra', 'Spiritual Yantra']
      }
    };
  }

  /**
   * Set services for the calculator
   */
  setServices(services) {
    this.services = services;
  }

  /**
   * Generate comprehensive remedial measures for planetary afflictions
   * @param {Object} birthData - Birth data object
   * @param {Object} analysis - Existing chart analysis with identified problems
   * @returns {Object} Comprehensive remedial recommendations
   */
  async generateRemedialMeasures(birthData, analysis = null) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return {
          error: 'Complete birth details required for remedial measures'
        };
      }

      // If no analysis provided, perform basic chart analysis to identify issues
      const chartAnalysis =
        analysis || (await this._analyzeChartForRemedies(birthData));

      // Identify planetary afflictions requiring remedies
      const afflictions = this._identifyAfflictions(chartAnalysis);

      // Calculate remedial urgency and intensity
      const remedialPriority = this._calculateRemedialPriority(afflictions);

      // Generate specific remedies for each affliction
      const specificRemedies = this._generateSpecificRemedies(
        afflictions,
        chartAnalysis
      );

      // Generate general preventive remedies
      const preventiveRemedies =
        this._generatePreventiveRemedies(chartAnalysis);

      // Generate timing recommendations for remedies
      const timingGuidelines = this._generateRemedyTiming(
        chartAnalysis,
        afflictions
      );

      // Generate spiritual practices to complement remedies
      const spiritualPractices = this._generateSpiritualPractices(afflictions);

      return {
        name,
        chartAnalysis,
        afflictions,
        remedialPriority,
        specificRemedies,
        preventiveRemedies,
        timingGuidelines,
        spiritualPractices,
        summary: this._generateRemedialSummary(
          remedialPriority,
          specificRemedies,
          preventiveRemedies
        )
      };
    } catch (error) {
      logger.error('❌ Error in remedial measures generation:', error);
      throw new Error(`Remedial measures generation failed: ${error.message}`);
    }
  }

  /**
   * Get personalized remedy recommendations for specific planetary issues
   */
  async getPersonalizedRemedies(birthData, planetaryIssues) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      const [latitude, longitude] =
        await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(
        latitude,
        longitude,
        timestamp
      );

      // Create simplified chart analysis
      const natalChart = await this._calculateBasicNatalChart(
        year,
        month,
        day,
        hour,
        minute,
        latitude,
        longitude,
        timezone
      );

      // Generate remedies based on reported planetary issues
      const remedies = {};

      planetaryIssues.forEach(issue => {
        const { planet } = issue;
        const type = issue.type || 'general';

        remedies[planet] = {
          issue: issue.description,
          gemstones: this.remedies.gemstones[planet] || [],
          mantras: this.remedies.mantras[planet] || [],
          charities: this.remedies.charities[planet] || [],
          yantras: this.remedies.yantras[planet] || [],
          practices: this._generatePlanetaryPractices(planet, type)
        };
      });

      return {
        name: birthData.name,
        planetaryIssues: remedies,
        generalPractice: this._getGeneralPractices(natalChart),
        timing: this._getGeneralRemedyTiming(natalChart)
      };
    } catch (error) {
      logger.error('Error getting personalized remedies:', error.message);
      return { error: 'Unable to generate personalized remedies' };
    }
  }

  /**
   * Analyze current chart to identify areas needing remedial attention
   * @private
   */
  async _analyzeChartForRemedies(birthData) {
    const { birthDate, birthTime, birthPlace } = birthData;

    const [day, month, year] = birthDate.split('/').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);

    const [latitude, longitude] =
      await this._getCoordinatesForPlace(birthPlace);
    const birthDateTime = new Date(year, month - 1, day, hour, minute);
    const timestamp = birthDateTime.getTime();
    const timezone = await this._getTimezoneForPlace(
      latitude,
      longitude,
      timestamp
    );

    const natalChart = await this._calculateBasicNatalChart(
      year,
      month,
      day,
      hour,
      minute,
      latitude,
      longitude,
      timezone
    );

    return {
      planets: natalChart.planets,
      houses: natalChart.houses,
      problems: this._identifyChartProblems(natalChart),
      strengths: this._identifyChartStrengths(natalChart)
    };
  }

  /**
   * Identify planetary afflictions and problem areas
   * @private
   */
  _identifyAfflictions(analysis) {
    const afflictions = {
      planetary: {},
      house: {},
      overall: 'moderate'
    };

    // Check planetary afflictions
    Object.entries(analysis.problems?.planetary || {}).forEach(
      ([planet, issues]) => {
        afflictions.planetary[planet] = {
          severity: this._assessAfflictionSeverity(issues),
          primaryIssues: issues,
          remedies: this._selectPrimarilyRemedies(planet, issues)
        };
      }
    );

    // Check house-based afflictions
    afflictions.house = this._identifyHouseAfflictions(
      analysis.problems?.houses || []
    );

    // Determine overall remedial intensity
    const totalSeverity = Object.values(afflictions.planetary).reduce(
      (sum, p) => sum + p.severity,
      0
    );
    if (totalSeverity >= 25) {
      afflictions.overall = 'high';
    } else if (totalSeverity >= 15) {
      afflictions.overall = 'moderate';
    } else if (totalSeverity >= 5) {
      afflictions.overall = 'low';
    } else {
      afflictions.overall = 'minimal';
    }

    return afflictions;
  }

  /**
   * Calculate remedial priority based on affliction severity
   * @private
   */
  _calculateRemedialPriority(afflictions) {
    const priority = {
      urgency: 'low',
      focus: [],
      timeline: '',
      intensity: '',
      recommendations: []
    };

    // Calculate priority
    const planetaryCount = Object.keys(afflictions.planetary).length;
    const houseCount = Object.keys(afflictions.house).length;
    const overallSeverity =
      { minimal: 1, low: 2, moderate: 3, high: 4 }[afflictions.overall] || 1;

    const totalPriority = planetaryCount + houseCount + overallSeverity;

    if (totalPriority >= 8) {
      priority.urgency = 'high';
      priority.timeline = 'Immediate attention required';
      priority.intensity = 'Comprehensive remedial program';
    } else if (totalPriority >= 6) {
      priority.urgency = 'moderate';
      priority.timeline = 'Address within 1-2 months';
      priority.intensity = 'Focused remedial efforts';
    } else if (totalPriority >= 3) {
      priority.urgency = 'low';
      priority.timeline = 'Ongoing maintenance program';
      priority.intensity = 'General remedial support';
    } else {
      priority.urgency = 'minimal';
      priority.timeline = 'Optional supportive practices';
      priority.intensity = 'General well-being practices';
    }

    // Focus areas
    priority.focus = this._identifyRemedialFocus(afflictions);

    // Recommendations
    priority.recommendations = this._generatePriorityRecommendations(priority);

    return priority;
  }

  /**
   * Generate specific remedies for identified afflictions
   * @private
   */
  _generateSpecificRemedies(afflictions, chartAnalysis) {
    const remedies = {
      gemstones: [],
      mantras: [],
      charities: [],
      yantras: [],
      pujas: [],
      dailyPractices: []
    };

    // Generate remedies for each planetary affliction
    Object.entries(afflictions.planetary).forEach(([planet, affliction]) => {
      if (affliction.severity >= 3) {
        // High priority afflictions
        remedies.gemstones.push({
          planet,
          stones: this.remedies.gemstones[planet] || [],
          suitability: this._assessGemstoneSuitability(planet, chartAnalysis)
        });

        remedies.mantras.push({
          planet,
          mantras: this.remedies.mantras[planet] || [],
          recitation: this._getRecitationGuidelines(
            planet,
            affliction.severity
          )
        });

        remedies.charities.push({
          planet,
          activities: this.remedies.charities[planet] || [],
          frequency: this._getCharityFrequency(affliction.severity)
        });
      }
    });

    // Add yantra remedies for major afflictions
    if (afflictions.overall === 'high') {
      Object.keys(afflictions.planetary).forEach(planet => {
        remedies.yantras.push({
          planet,
          yantras: this.remedies.yantras[planet] || [],
          installation: this._getYantraGuidelines(planet)
        });
      });
    }

    return remedies;
  }

  /**
   * Generate preventive remedial measures
   * @private
   */
  _generatePreventiveRemedies(chartAnalysis) {
    const preventives = {
      spiritual: [],
      lifestyle: [],
      dietary: [],
      environmental: []
    };

    // Spiritual preventives
    preventives.spiritual = [
      'Regular meditation (15-30 minutes daily)',
      'Weekly temple visits or spiritual gatherings',
      'Maintaining prayer routines',
      'Practicing gratitude and positive affirmations',
      'Reading spiritual literature'
    ];

    // Lifestyle preventives
    preventives.lifestyle = [
      'Maintaining physical health and exercise',
      'Developing stress management techniques',
      'Building supportive relationships',
      'Practicing patience and acceptance',
      'Developing healthy daily routines'
    ];

    // Dietary preventives based on dominant elements
    const dominantElement = this._assessDominantElement(chartAnalysis);
    preventives.dietary = this._generateElementalDiet(dominantElement);

    // Environmental preventives
    preventives.environmental = [
      'Creating peaceful home environment',
      'Using positive colors and symbols',
      'Maintaining clean and harmonious surroundings',
      'Working with positive people and influences',
      'Avoiding negative environments and situations'
    ];

    return preventives;
  }

  /**
   * Generate timing guidelines for remedial practices
   * @private
   */
  _generateRemedyTiming(chartAnalysis, afflictions) {
    const timing = {
      optimalDays: {},
      optimalTimes: {},
      auspiciousPeriods: [],
      avoidancePeriods: [],
      specialDates: []
    };

    // Optimal days based on afflicted planets
    Object.keys(afflictions.planetary).forEach(planet => {
      timing.optimalDays[planet] = this._getPlanetaryDays(planet);
    });

    // Optimal times (nakshtras, tithis)
    timing.optimalTimes = this._getOptimalRemedyTimes(chartAnalysis);

    // Auspicious periods
    timing.auspiciousPeriods = this._identifyAuspiciousPeriods(chartAnalysis);

    // Periods to avoid
    timing.avoidancePeriods = this._identifyAvoidancePeriods(
      chartAnalysis,
      afflictions
    );

    // Special dates and festivals
    timing.specialDates = this._getRemedialFestivals(chartAnalysis);

    return timing;
  }

  /**
   * Generate spiritual practices to complement remedies
   * @private
   */
  _generateSpiritualPractices(afflictions) {
    const practices = {
      meditation: [],
      yoga: [],
      breathing: [],
      affirmations: [],
      visualization: []
    };

    // Meditation practices
    practices.meditation = [
      'Focused concentration on peaceful thoughts',
      'Meditation on divine light and protection',
      'Chakra balancing meditations',
      'Heart-centered loving-kindness meditation'
    ];

    // Yoga practices
    practices.yoga = [
      'Gentle asanas for physical and mental balance',
      'Pranayama for energy balancing',
      'Sun Salutations for vitality',
      'Restorative yoga for stress relief'
    ];

    // Breathing practices
    practices.breathing = [
      'Alternate nostril breathing (Nadi Shodhana)',
      '4-7-8 breathing for relaxation',
      'Ocean breath (Ujjayi) for grounding',
      'Square breathing for mental clarity'
    ];

    // Affirmations based on most afflicted planets
    const primaryAffliction = Object.keys(afflictions.planetary)[0];
    practices.affirmations = this._generateAffirmations(primaryAffliction);

    // Visualization practices
    practices.visualization = [
      'Visualizing protective divine light',
      'Healing energy flowing through the body',
      'Connecting with spiritual guides',
      'Manifesting positive outcomes'
    ];

    return practices;
  }

  /**
   * Generate comprehensive remedial summary
   * @private
   */
  _generateRemedialSummary(priority, specificRemedies, preventiveRemedies) {
    let summary = '🛡️ *Astrological Remedial Measures*\n\n';

    summary += `*Remedial Priority: ${priority.urgency.charAt(0).toUpperCase() + priority.urgency.slice(1)}*\n`;
    summary += `*Timeline: ${priority.timeline}*\n\n`;

    summary += '*Key Remedial Focus:*\n';
    priority.focus.forEach(focus => {
      summary += `• ${focus}\n`;
    });

    summary += '\n*Immediate Actions:*\n';
    specificRemedies.gemstones?.slice(0, 2).forEach(stone => {
      summary += `• Gemstone: ${stone.stones?.[0] || 'Recommended stone'} for ${stone.planet}\n`;
    });
    specificRemedies.mantras?.slice(0, 2).forEach(mantra => {
      summary += `• Mantra: ${mantra.mantras?.[0] || 'Recommended mantra'} for ${mantra.planet}\n`;
    });

    summary += '\n*Daily Practices:*\n';
    preventiveRemedies.lifestyle?.slice(0, 2).forEach(practice => {
      summary += `• ${practice}\n`;
    });

    summary += '\n*Spiritual Support:*\n';
    preventiveRemedies.spiritual?.slice(0, 2).forEach(practice => {
      summary += `• ${practice}\n`;
    });

    summary +=
      '\n*Note: Remedies work best when approached with faith and consistency.*';

    return summary;
  }

  // Helper methods for detailed calculations
  async _calculateBasicNatalChart(
    year,
    month,
    day,
    hour,
    minute,
    latitude,
    longitude,
    timezone
  ) {
    const natalPlanets = {};

    const jd = this._dateToJulianDay(
      year,
      month,
      day,
      hour + minute / 60 - timezone
    );

    const planets = [
      'sun',
      'moon',
      'mars',
      'mercury',
      'jupiter',
      'venus',
      'saturn'
    ];
    const planetIds = {
      sun: sweph.SE_SUN,
      moon: sweph.SE_MOON,
      mars: sweph.SE_MARS,
      mercury: sweph.SE_MERCURY,
      jupiter: sweph.SE_JUPITER,
      venus: sweph.SE_VENUS,
      saturn: sweph.SE_SATURN
    };

    for (const planet of planets) {
      const position = sweph.calc(jd, planetIds[planet], sweph.SEFLG_SIDEREAL);
      if (position && Array.isArray(position.longitude)) {
        natalPlanets[planet] = {
          longitude: position.longitude[0],
          sign: Math.floor(position.longitude[0] / 30) + 1
        };
      }
    }

    // Calculate houses
    const houses = sweph.houses(jd, latitude, longitude, 'E');
    natalPlanets.ascendant = {
      longitude: houses.ascendant,
      sign: Math.floor(houses.ascendant / 30) + 1
    };

    return { planets: natalPlanets, houses: houses.houseCusps };
  }

  _identifyChartProblems(natalChart) {
    return {
      planetary: this._assessPlanetaryProblems(natalChart),
      houses: this._assessHouseProblems(natalChart)
    };
  }

  _identifyChartStrengths(natalChart) {
    return {
      planetary: this._assessPlanetaryStrengths(natalChart),
      houses: this._assessHouseStrengths(natalChart)
    };
  }

  _assessAfflictionSeverity(issues) {
    if (
      issues.includes('severe_combustion') ||
      issues.includes('exact_square')
    ) {
      return 5;
    }
    if (
      issues.includes('combustion') ||
      issues.includes('square') ||
      issues.includes('debilitated')
    ) {
      return 4;
    }
    if (issues.includes('opposition') || issues.includes('enemy_sign')) {
      return 3;
    }
    if (issues.includes('minor_aspect') || issues.includes('neutral_sign')) {
      return 2;
    }
    return 1;
  }

  _selectPrimarilyRemedies(planet, issues) {
    const remedies = [];

    if (issues.includes('combustion') || issues.includes('debilitated')) {
      remedies.push('strengthening_mantras', 'gemstones', 'specific_pujas');
    }

    if (issues.includes('afflicting_other_planets')) {
      remedies.push('charitable_acts', 'devotional_practices', 'fasting');
    }

    if (issues.includes('retrograde')) {
      remedies.push(
        'special_mantras',
        'yantra_installation',
        'spiritual_practices'
      );
    }

    return remedies;
  }

  _identifyHouseAfflictions(houseProblems) {
    const houseAfflictions = {};

    houseProblems.forEach(problem => {
      const { house } = problem;
      houseAfflictions[house] = {
        type: problem.type,
        severity: problem.severity,
        remedies: this._getHouseRemedies(house, problem.type)
      };
    });

    return houseAfflictions;
  }

  _identifyRemedialFocus(afflictions) {
    const focus = [];

    // Focus on most afflicted planets
    const severePlanets = Object.entries(afflictions.planetary)
      .filter(([planet, data]) => data.severity >= 4)
      .map(([planet]) => planet);

    if (severePlanets.length > 0) {
      focus.push(`Address severe afflictions for ${severePlanets.join(', ')}`);
    }

    // Focus on problematic houses
    const problematicHouses = Object.keys(afflictions.house);
    if (problematicHouses.length > 0) {
      focus.push(`Strengthen house ${problematicHouses[0]} significations`);
    }

    // General focus
    focus.push('Build spiritual routine and positive practices');

    return focus;
  }

  _generatePriorityRecommendations(priority) {
    const recommendations = [];

    if (priority.urgency === 'high') {
      recommendations.push(
        'Immediate consultation with spiritual guide recommended'
      );
      recommendations.push(
        'Start basic mantras and charitable activities right away'
      );
      recommendations.push(
        'Consider professional astrological guidance for proper implementation'
      );
    } else if (priority.urgency === 'moderate') {
      recommendations.push('Begin with one or two key remedial practices');
      recommendations.push('Track progress and adjust approach as needed');
      recommendations.push(
        'Consult experienced practitioner for personalized guidance'
      );
    } else {
      recommendations.push('Maintain general positive spiritual practices');
      recommendations.push('Continue with established routines');
      recommendations.push('Focus on personal growth and development');
    }

    return recommendations;
  }

  _assessGemstoneSuitability(planet, chartAnalysis) {
    // Assess if person can wear the recommended gemstone based on chart
    // Simplified assessment
    return 'Generally suitable - consult professional for exact assessment';
  }

  _getRecitationGuidelines(planet, severity) {
    if (severity >= 4) {
      return '108 times daily for minimum 3 months';
    }
    if (severity >= 3) {
      return '21 times daily for 42 days';
    }
    if (severity >= 2) {
      return '11 times daily ongoing';
    }
    return 'Daily morning recitation';
  }

  _getCharityFrequency(severity) {
    if (severity >= 4) {
      return 'Weekly or more frequent';
    }
    if (severity >= 3) {
      return 'Weekly';
    }
    if (severity >= 2) {
      return 'Monthly';
    }
    return 'During auspicious periods';
  }

  _getYantraGuidelines(planet) {
    return 'Install facing east or north, perform evening worship daily';
  }

  _generatePlanetaryPractices(planet, type) {
    const practices = {
      general: [
        'Daily spiritual practice',
        'Positive thinking',
        'Service activities'
      ],
      malefic: ['Fasting rituals', 'Charitable works', 'Devotional hymns'],
      benefic_but_afflicted: [
        'Strengthening prayers',
        'Good deeds',
        'Spiritual study'
      ]
    };

    return practices[type] || practices.general;
  }

  _getGeneralPractices(natalChart) {
    return [
      'Regular prayer and meditation',
      'Positive thinking and affirmations',
      'Healthy lifestyle and balanced diet',
      'Service to others and selfless acts'
    ];
  }

  _getGeneralRemedyTiming(natalChart) {
    return {
      bestDays: ['Wednesdays for general remedies', 'Full Moon days'],
      bestTimes: ['Early morning (Brahma muhurta)', 'Sunrise to 9 AM'],
      avoidDays: ['Solar eclipses', 'Lunar eclipses']
    };
  }

  _assessPlanetaryProblems(natalChart) {
    const problems = {};

    Object.entries(natalChart.planets).forEach(([planet, data]) => {
      if (planet !== 'ascendant') {
        const issues = [];

        // Check debilitation
        if (this._isDebilitated(planet, data.sign)) {
          issues.push('debilitated');
        }

        // Check combustion (close to sun)
        if (
          planet !== 'sun' &&
          Math.abs(data.longitude - natalChart.planets.sun.longitude) < 8
        ) {
          issues.push('combustion');
        }

        // Check enemy sign
        if (this._isInEnemySign(planet, data.sign)) {
          issues.push('enemy_sign');
        }

        if (issues.length > 0) {
          problems[planet] = issues;
        }
      }
    });

    return problems;
  }

  _assessHouseProblems(natalChart) {
    const problems = [];
    const houses = natalChart.houses || [];

    // Check empty 7th house
    const seventhPlanets = Object.values(natalChart.planets).filter(
      p => p.house === 7
    );
    if (seventhPlanets.length === 0) {
      problems.push({ house: 7, type: 'empty', severity: 'moderate' });
    }

    return problems;
  }

  _assessPlanetaryStrengths(natalChart) {
    const strengths = {};

    Object.entries(natalChart.planets).forEach(([planet, data]) => {
      if (planet !== 'ascendant') {
        const strongPoints = [];

        // Check exaltation
        if (this._isExalted(planet, data.sign)) {
          strongPoints.push('exalted');
        }

        // Check own sign
        if (this._isInOwnSign(planet, data.sign)) {
          strongPoints.push('own sign');
        }

        // Check friendly sign
        if (this._isInFriendlySign(planet, data.sign)) {
          strongPoints.push('friendly sign');
        }

        strengths[planet] = strongPoints;
      }
    });

    return strengths;
  }

  /**
   * Health check for RemedialMeasuresCalculator
   * @returns {Object} Health status
   */
  healthCheck() {
    return {
      healthy: true,
      version: '1.0.0',
      name: 'RemedialMeasuresCalculator',
      calculations: [
        'Remedial Measures',
        'Problem Assessment',
        'Strength Analysis'
      ],
      status: 'Operational'
    };
  }
}

module.exports = { RemedialMeasuresCalculator };
