const logger = require('../../../utils/logger');
const { NadiDataRepository } = require('./NadiDataRepository');

/**
 * NadiRemedies - Remedies and healing recommendations for Nadi astrology
 * Generates personalized remedies based on nakshatra, nadi system, and specific needs
 */
class NadiRemedies {
  constructor() {
    this.dataRepo = new NadiDataRepository();
    this.logger = logger;
  }

  /**
   * Generate complete remedies package for Nadi reading
   * @param {Object} birthNakshatra - Birth nakshatra
   * @param {Object} nadiSystem - Nadi system
   * @returns {Array} Comprehensive remedies list
   */
  generateCompleteRemedies(birthNakshatra, nadiSystem) {
    try {
      const remedies = [];

      // Nakshatra-based remedies
      const nakshatraRemedies = this.dataRepo.getNakshatraRemedies();
      const specificRemedies = nakshatraRemedies[birthNakshatra.name];
      if (specificRemedies) {
        remedies.push(...specificRemedies.map(remedy => ({
          type: 'nakshatra',
          category: 'spiritual',
          remedy,
          description: `Nakshatra-specific remedy for ${birthNakshatra.name}`
        })));
      }

      // Nadi-based remedies
      const nadiRemedies = this.dataRepo.getNadiRemedies(nadiSystem.name);
      remedies.push(...nadiRemedies.map(remedy => ({
        type: 'nadi',
        category: 'personal_development',
        remedy,
        description: `${nadiSystem.name} specific guidance`
      })));

      // Planetary remedies based on ruling planet
      const planetaryRemedies = this.getPlanetaryRemedies(birthNakshatra.rulingPlanet);
      remedies.push(...planetaryRemedies.map(remedy => ({
        type: 'planetary',
        category: 'mantra',
        remedy,
        description: `${birthNakshatra.rulingPlanet} planetary remedy`
      })));

      // General strengthening remedies
      remedies.push(...this.getGeneralStrengtheningRemedies(nadiSystem));

      return this.categorizeAndOptimizeRemedies(remedies);
    } catch (error) {
      this.logger.error('Remedies generation error:', error);
      return [
        {
          type: 'general',
          category: 'spiritual',
          remedy: 'Consult a qualified Nadi astrologer',
          description: 'Professional guidance recommended'
        }
      ];
    }
  }

  /**
   * Get remedies for specific planetary influence
   * @param {string} rulingPlanet - Ruling planet name
   * @returns {Array} Planetary remedies
   */
  getPlanetaryRemedies(rulingPlanet) {
    const planetaryMantras = {
      Sun: ['Suryanamaskara', 'Gayatri mantra chanting', 'Copper vessel usage'],
      Moon: ['Chandra mantra', 'White pearl wearing', 'Milk offerings'],
      Mars: ['Hanuman chalisa', 'Red coral gemstone', 'Martial arts practice'],
      Mercury: ['Budha mantra', 'Green emerald', 'Educational pursuits'],
      Jupiter: ['Guru mantra', 'Yellow sapphire', 'Temple visits'],
      Venus: ['Shukra mantra', 'Diamond jewelry', 'Artistic activities'],
      Saturn: ['Shani mantra', 'Blue sapphire', 'Charitable service'],
      Rahu: ['Rahu mantra', 'Hessonite garnet', 'Spiritual practices'],
      Ketu: ['Ketu mantra', 'Cat\'s eye gemstone', 'Meditation']
    };

    const mantras = planetaryMantras[rulingPlanet] || ['General spiritual practices'];
    return mantras.map(mantra => `${mantra}`);
  }

  /**
   * Get general strengthening remedies
   * @param {Object} nadiSystem - Nadi system
   * @returns {Array} General remedies
   */
  getGeneralStrengtheningRemedies(nadiSystem) {
    const generalRemedies = [
      {
        type: 'general',
        category: 'spiritual',
        remedy: 'Daily meditation and mindfulness',
        description: 'Foundation for spiritual growth'
      },
      {
        type: 'general',
        category: 'health',
        remedy: 'Balanced diet and regular exercise',
        description: 'Physical well-being foundation'
      },
      {
        type: 'general',
        category: 'lifestyle',
        remedy: 'Positive thoughts and affirmations',
        description: 'Mental strength building'
      }
    ];

    // Add nadi-specific general remedies
    switch (nadiSystem.name) {
    case 'Adi Nadi':
      generalRemedies.push({
        type: 'general',
        category: 'career',
        remedy: 'Leadership training programs',
        description: 'Enhance pioneering qualities'
      });
      break;
    case 'Madhya Nadi':
      generalRemedies.push({
        type: 'general',
        category: 'relationships',
        remedy: 'Interpersonal skills development',
        description: 'Strengthen diplomatic abilities'
      });
      break;
    case 'Antya Nadi':
      generalRemedies.push({
        type: 'general',
        category: 'service',
        remedy: 'Volunteer work and community service',
        description: 'Deepen compassionate nature'
      });
      break;
    }

    return generalRemedies;
  }

  /**
   * Generate remedies for specific life challenges
   * @param {string} challengeType - Type of challenge (health, career, relationships, etc.)
   * @param {Object} nakshatra - Birth nakshatra
   * @param {Object} nadiSystem - Nadi system
   * @returns {Array} Targeted remedies
   */
  generateTargetedRemedies(challengeType, nakshatra, nadiSystem) {
    const remedies = [];

    switch (challengeType) {
    case 'health':
      remedies.push(
        ...this.generateHealthRemedies(nakshatra),
        {
          type: 'health',
          category: 'preventive',
          remedy: 'Regular health checkups',
          description: 'Proactive health management'
        }
      );
      break;

    case 'career':
      remedies.push(
        ...this.generateCareerRemedies(nadiSystem),
        {
          type: 'career',
          category: 'skill',
          remedy: 'Continuous learning and skill development',
          description: 'Professional growth focus'
        }
      );
      break;

    case 'relationships':
      remedies.push(
        ...this.generateRelationshipRemedies(nakshatra, nadiSystem),
        {
          type: 'relationship',
          category: 'communication',
          remedy: 'Open and honest communication practices',
          description: 'Relationship foundation building'
        }
      );
      break;

    case 'finance':
      remedies.push({
        type: 'finance',
        category: 'stability',
        remedy: 'Financial planning and budget management',
        description: 'Economic stability focus'
      });
      break;

    case 'spiritual':
      remedies.push(
        ...this.generateSpiritualRemedies(nakshatra),
        {
          type: 'spiritual',
          category: 'practice',
          remedy: 'Daily spiritual practice and meditation',
          description: 'Soul growth acceleration'
        }
      );
      break;

    default:
      remedies.push({
        type: 'general',
        category: 'wellness',
        remedy: 'Holistic lifestyle balance',
        description: 'Overall harmony promotion'
      });
    }

    return remedies;
  }

  /**
   * Generate health-specific remedies
   * @param {Object} nakshatra - Birth nakshatra
   * @returns {Array} Health remedies
   */
  generateHealthRemedies(nakshatra) {
    const healthFocus = this.dataRepo.getNakshatraHealthFocus(nakshatra.name);

    return [
      {
        type: 'health',
        category: 'specific',
        remedy: `Support ${healthFocus} health through appropriate care`,
        description: `${nakshatra.name} health focus`
      },
      {
        type: 'health',
        category: 'general',
        remedy: 'Yoga and pranayama practices',
        description: 'Energy balancing through traditional methods'
      },
      {
        type: 'health',
        category: 'nutrition',
        remedy: 'Natural, balanced nutrition',
        description: 'Body nourishment through natural foods'
      }
    ];
  }

  /**
   * Generate career-specific remedies
   * @param {Object} nadiSystem - Nadi system
   * @returns {Array} Career remedies
   */
  generateCareerRemedies(nadiSystem) {
    const careerRemedies = {
      'Adi Nadi': [
        'Develop leadership qualities',
        'Take initiative in projects',
        'Build confidence through achievements'
      ],
      'Madhya Nadi': [
        'Seek collaborative work environments',
        'Develop mediation skills',
        'Balance work-life harmony'
      ],
      'Antya Nadi': [
        'Find meaning in service-oriented roles',
        'Help others achieve their goals',
        'Practice selfless service'
      ]
    };

    const remedies = careerRemedies[nadiSystem.name] || ['Seek career counseling'];
    return remedies.map(remedy => ({
      type: 'career',
      category: 'advancement',
      remedy,
      description: `${nadiSystem.name} career guidance`
    }));
  }

  /**
   * Generate relationship-specific remedies
   * @param {Object} nakshatra - Birth nakshatra
   * @param {Object} nadiSystem - Nadi system
   * @returns {Array} Relationship remedies
   */
  generateRelationshipRemedies(nakshatra, nadiSystem) {
    const relationshipRemedies = {
      'Adi Nadi': [
        'Learn to balance independence with partnership',
        'Communicate leadership needs clearly',
        'Appreciate different relationship dynamics'
      ],
      'Madhya Nadi': [
        'Practice active listening skills',
        'Find mutually beneficial compromises',
        'Create harmonious home environments'
      ],
      'Antya Nadi': [
        'Set healthy boundaries in relationships',
        'Give without expectation',
        'Practice unconditional compassion'
      ]
    };

    const remedies = relationshipRemedies[nadiSystem.name] || ['Seek relationship counseling'];
    return remedies.map(remedy => ({
      type: 'relationship',
      category: 'harmony',
      remedy,
      description: `${nadiSystem.name} relationship guidance`
    }));
  }

  /**
   * Generate spiritual practice remedies
   * @param {Object} nakshatra - Birth nakshatra
   * @returns {Array} Spiritual remedies
   */
  generateSpiritualRemedies(nakshatra) {
    const spiritualRemedies = [
      {
        type: 'spiritual',
        category: 'devotion',
        remedy: 'Regular deity worship and prayer',
        description: 'Divine connection strengthening'
      },
      {
        type: 'spiritual',
        category: 'practice',
        remedy: 'Mantra chanting and affirmation work',
        description: 'Mind and spirit alignment'
      },
      {
        type: 'spiritual',
        category: 'service',
        remedy: 'Seva (selfless service) activities',
        description: 'Karma yoga practice'
      }
    ];

    return spiritualRemedies;
  }

  /**
   * Generate remedies for specific planetary periods
   * @param {Object} dashaPeriod - Current dasha period
   * @returns {Array} Dasha-specific remedies
   */
  generateDashaRemedies(dashaPeriod) {
    const dashaRemedies = {
      Sun: [
        'Leadership development activities',
        'Father figure strengthening',
        'Government and authority focus activities'
      ],
      Moon: [
        'Mother relationship nurturing',
        'Emotional balance practices',
        'Home and family harmonization'
      ],
      Mars: [
        'Martial arts or physical activities',
        'Conflict resolution skills',
        'Energy management techniques'
      ],
      Mercury: [
        'Study and learning commitments',
        'Communication skill development',
        'Business and commerce activities'
      ],
      Jupiter: [
        'Spiritual teacher seeking',
        'Higher knowledge pursuits',
        'Abundance consciousness practices'
      ],
      Venus: [
        'Artistic expression activities',
        'Relationship harmony focus',
        'Beauty and luxury appreciation'
      ],
      Saturn: [
        'Discipline and structure building',
        'Patience practice exercises',
        'Long-term goal setting'
      ],
      Rahu: [
        'Unconventional path exploration',
        'Foreign culture understanding',
        'Innovation and change embracing'
      ],
      Ketu: [
        'Spiritual detachment practices',
        'Past life healing work',
        'Meditation and inner peace focus'
      ]
    };

    const remedies = dashaRemedies[dashaPeriod.planet] || ['General positive life choices'];
    return remedies.map(remedy => ({
      type: 'dasha',
      category: 'planetary',
      remedy,
      description: `${dashaPeriod.planet} dasha guidance`
    }));
  }

  /**
   * Categorize and optimize remedies list
   * @param {Array} remedies - Raw remedies list
   * @returns {Array} Optimized and categorized remedies
   */
  categorizeAndOptimizeRemedies(remedies) {
    // Group by category
    const categories = {};
    remedies.forEach(remedy => {
      if (!categories[remedy.category]) {
        categories[remedy.category] = [];
      }
      categories[remedy.category].push(remedy);
    });

    // Optimize within each category (limit to top recommendations)
    const optimized = [];
    Object.entries(categories).forEach(([category, categoryRemedies]) => {
      // Keep top 3-5 remedies per category
      const limit = category === 'spiritual' ? 5 : category === 'health' ? 4 : 3;
      optimized.push(...this.prioritizeRemedies(categoryRemedies).slice(0, limit));
    });

    // Sort by priority (spiritual > health > personal_development > others)
    const priorityOrder = ['spiritual', 'health', 'personal_development', 'mantra', 'planetary'];
    return optimized.sort((a, b) => {
      const aPriority = priorityOrder.indexOf(a.category);
      const bPriority = priorityOrder.indexOf(b.category);
      return aPriority - bPriority;
    });
  }

  /**
   * Prioritize remedies within a category (simple implementation)
   * @param {Array} remedies - Remedies in a category
   * @returns {Array} Prioritized remedies
   */
  prioritizeRemedies(remedies) {
    // Prioritize nakshatra remedies, then nadi, then general
    return remedies.sort((a, b) => {
      const typePriority = { nakshatra: 3, nadi: 2, planetary: 1, general: 0 };
      return (typePriority[b.type] || 0) - (typePriority[a.type] || 0);
    });
  }

  /**
   * Generate emergency/challenge-specific remedies
   * @param {string} emergencyType - Type of crisis/challenge
   * @returns {Array} Emergency remedies
   */
  generateEmergencyRemedies(emergencyType) {
    const emergencyRemedies = {
      health: [
        'Immediate medical consultation',
        'Prayer and positive visualization',
        'Support system activation',
        'Rest and recuperation focus'
      ],
      financial: [
        'Budget audit and planning',
        'Additional income source exploration',
        'Charitable giving (even small amounts)',
        'Patience and faith practice'
      ],
      relationship: [
        'Communication with understanding',
        'Professional counseling consideration',
        'Personal boundaries reassessment',
        'Compassionate self-reflection'
      ],
      career: [
        'Skill enhancement focus',
        'Network strengthening',
        'Resume and profile updating',
        'Positive mindset maintenance'
      ],
      spiritual: [
        'Intensive meditation practice',
        'Spiritual teacher consultation',
        'Sacred text study',
        'Community spiritual support seeking'
      ]
    };

    const remedies = emergencyRemedies[emergencyType] || ['Seek appropriate professional guidance'];
    return remedies.map(remedy => ({
      type: 'emergency',
      category: emergencyType,
      remedy,
      description: `${emergencyType} crisis management`,
      priority: 'high'
    }));
  }
}

module.exports = { NadiRemedies };