const logger = require('../../../utils/logger');
const sweph = require('sweph');

/**
 * AyurvedicAstrologyCalculator - Specialized calculator linking Vedic astrology with Ayurvedic health principles
 * Handles dosha analysis, constitutional assessment, and Ayurvedic health guidance
 */
class AyurvedicAstrologyCalculator {
  constructor() {
    logger.info(
      'Module: AyurvedicAstrologyCalculator loaded - Ayurvedic astrology integration'
    );
  }

  setServices(calendricalService, geocodingService) {
    this.calendricalService = calendricalService;
    this.geocodingService = geocodingService;
  }

  /**
   * Calculate Ayurvedic constitution and health guidance
   */
  async calculateAyurvedicAstrologyAnalysis(birthData) {
    try {
      const planetaryPositions = await this._getPlanetaryPositions(birthData);

      // Determine dominant doshas based on planetary placements
      const doshaScores = this._calculateDoshaScores(planetaryPositions);

      // Determine primary and secondary constitutions
      const constitutions = this._determineConstitutions(doshaScores);

      // Get health recommendations
      const healthRecommendations = this._getHealthRecommendations(
        constitutions,
        planetaryPositions
      );

      const introduction =
        'Your birth chart reveals your unique Ayurvedic constitution (Prakriti), blending Vedic astrology with ancient wellness wisdom. This sacred science identifies your mind-body type and provides personalized health guidance.';

      return {
        introduction,
        constitutions,
        doshaScores,
        planetaryHealth: this._analyzePlanetaryHealth(planetaryPositions),
        healthRecommendations,
        dailyRoutine: this._getDailyRoutine(constitutions.primary),
        seasonalGuidance: this._getSeasonalGuidance(constitutions.primary),
        doshaBreakdown: this._generateDoshaBreakdown(doshaScores),
        summary: this._generateCompleteSummary(constitutions, healthRecommendations)
      };
    } catch (error) {
      logger.error('Ayurvedic Astrology calculation error:', error);
      throw new Error('Failed to calculate Ayurvedic astrology analysis');
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  determineConstitution(user) {
    try {
      const birthData = {
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi, India'
      };

      const analysis = this.calculateAyurvedicAstrologyAnalysis(birthData);
      return {
        description: analysis.summary,
        doshaBreakdown: analysis.doshaBreakdown
      };
    } catch (error) {
      return {
        description: '🌿 *Ayurvedic Constitution*\n\nUnable to determine constitution at this time.',
        doshaBreakdown: 'Please check your birth details.'
      };
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  generateRecommendations(user) {
    try {
      const birthData = {
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi, India'
      };

      const analysis = this.calculateAyurvedicAstrologyAnalysis(birthData);
      return {
        health: analysis.healthRecommendations.imbalances.join(', '),
        diet: analysis.healthRecommendations.diet,
        lifestyle: analysis.healthRecommendations.practices
      };
    } catch (error) {
      return {
        health: 'Consult healthcare professional',
        diet: 'Balanced nutrition',
        lifestyle: 'Regular exercise and rest'
      };
    }
  }

  /**
   * Get planetary positions for birth data
   * @private
   */
  async _getPlanetaryPositions(birthData) {
    const { birthDate, birthTime, timezone = 5.5 } = birthData;
    const [day, month, year] = birthDate.split('/').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);

    const utcTime = new Date(
      Date.UTC(year, month - 1, day, hour - timezone, minute)
    );
    const julianDay = utcTime.getTime() / 86400000 + 2440587.5;

    const planets = {};
    const planetEphemIds = [
      sweph.SE_SUN,
      sweph.SE_MOON,
      sweph.SE_MARS,
      sweph.SE_MERCURY,
      sweph.SE_JUPITER,
      sweph.SE_VENUS,
      sweph.SE_SATURN
    ];
    const planetNames = [
      'Sun',
      'Moon',
      'Mars',
      'Mercury',
      'Jupiter',
      'Venus',
      'Saturn'
    ];

    planetEphemIds.forEach((ephemId, index) => {
      const result = sweph.swe_calc_ut(julianDay, ephemId, sweph.SEFLG_SPEED);
      if (result.rc >= 0) {
        planets[planetNames[index]] = {
          longitude: result.longitude[0],
          latitude: result.latitude[0],
          speed: result.longitude[2]
        };
      }
    });

    // Add Rahu/Ketu positions (simplified)
    if (planets.Saturn && planets.Moon) {
      const rahuLongitude = (planets.Saturn.longitude + 180) % 360;
      const ketuLongitude = (planets.Saturn.longitude) % 360;

      planets.Rahu = { longitude: rahuLongitude, latitude: 0, speed: 0 };
      planets.Ketu = { longitude: ketuLongitude, latitude: 0, speed: 0 };
    }

    return planets;
  }

  // ================= DOSHA CALCULATION METHODS =================

  /**
   * Calculate dosha scores based on planetary positions
   * @private
   */
  _calculateDoshaScores(planets) {
    const scores = { vata: 0, pitta: 0, kapha: 0 };

    const planetaryHealth = this._getPlanetaryHealth();

    Object.entries(planets).forEach(([planet, data]) => {
      const healthInfo = planetaryHealth[planet.toLowerCase()];
      if (healthInfo) {
        const dosha = healthInfo.dosha;
        if (dosha.includes('/')) {
          // Planet rules multiple doshas
          const doshas = dosha.split('/');
          doshas.forEach(d => {
            scores[d] += (data.strength || 0.7) * 10;
          });
        } else {
          scores[dosha] += (data.strength || 0.7) * 10;
        }
      }

      // Add points based on sign rulership
      const sign = this._getSignFromLongitude(data.longitude);
      const doshaRulerships = this._getDoshaRulerships();

      Object.entries(doshaRulerships).forEach(([doshaName, rulership]) => {
        if (rulership.signs.includes(sign.toLowerCase())) {
          scores[doshaName] += 5;
        }
      });
    });

    return scores;
  }

  /**
   * Determine primary and secondary constitutions
   * @private
   */
  _determineConstitutions(doshaScores) {
    const sortedDoshas = Object.entries(doshaScores)
      .sort(([, a], [, b]) => b - a)
      .map(([dosha, score]) => ({ dosha, score }));

    return {
      primary: sortedDoshas[0].dosha,
      secondary: sortedDoshas[1].dosha,
      tertiary: sortedDoshas[2].dosha,
      balance: sortedDoshas
    };
  }

  /**
   * Generate dosha breakdown description
   * @private
   */
  _generateDoshaBreakdown(doshaScores) {
    const total = Object.values(doshaScores).reduce((sum, score) => sum + score, 0);
    const percentages = {};

    Object.entries(doshaScores).forEach(([dosha, score]) => {
      percentages[dosha] = Math.round((score / total) * 100);
    });

    let breakdown = '';
    const constitutions = this._getConstitutions();

    ['vata', 'pitta', 'kapha'].forEach(dosha => {
      const constitution = constitutions[dosha];
      breakdown += `${constitution.name} (${percentages[dosha]}%): ${constitution.traits}\n`;
    });

    return breakdown.trim();
  }

  /**
   * Analyze planetary health indicators
   * @private
   */
  _analyzePlanetaryHealth(planets) {
    const healthAnalysis = {};
    const planetaryHealth = this._getPlanetaryHealth();

    Object.entries(planets).forEach(([planet, data]) => {
      const healthInfo = planetaryHealth[planet.toLowerCase()];
      if (healthInfo) {
        healthAnalysis[planet] = {
          bodyParts: healthInfo.bodyParts,
          dosha: healthInfo.dosha,
          strength: data.strength || 0.7,
          concerns: this._getHealthConcerns(planet.toLowerCase(), data.strength || 0.7),
          gemstone: healthInfo.gemstone
        };
      }
    });

    return healthAnalysis;
  }

  /**
   * Get health recommendations based on constitution
   * @private
   */
  _getHealthRecommendations(constitutions, planets) {
    const { primary } = constitutions;
    const constitution = this._getConstitutions()[primary];

    return {
      diet: constitution.foods,
      herbs: constitution.herbs,
      practices: constitution.practices,
      imbalances: constitution.imbalances,
      lifestyle: this._getLifestyleRecommendations(primary),
      therapies: this._getAyurvedicTherapies(primary),
      planetary: this._getPlanetaryHealthRecommendations(planets)
    };
  }

  // ================= DATA PROVIDER METHODS =================

  _getDoshaRulerships() {
    return {
      vata: {
        planets: ['saturn', 'rahu', 'mercury'],
        signs: ['gemini', 'virgo', 'libra', 'aquarius'],
        elements: ['air', 'ether'],
        qualities: ['cold', 'dry', 'light', 'mobile', 'rough'],
        seasons: ['autumn', 'winter'],
        times: ['dawn', 'dusk']
      },
      pitta: {
        planets: ['sun', 'mars', 'jupiter'],
        signs: ['aries', 'leo', 'sagittarius', 'scorpio'],
        elements: ['fire', 'water'],
        qualities: ['hot', 'sharp', 'light', 'liquid', 'spreading'],
        seasons: ['summer', 'spring'],
        times: ['noon', 'midnight']
      },
      kapha: {
        planets: ['moon', 'venus', 'mercury'],
        signs: ['cancer', 'scorpio', 'pisces', 'taurus'],
        elements: ['water', 'earth'],
        qualities: ['cold', 'wet', 'heavy', 'dull', 'soft', 'static'],
        seasons: ['winter', 'spring'],
        times: ['dawn', 'dusk']
      }
    };
  }

  _getConstitutions() {
    return {
      vata: {
        name: 'Vata (Wind/Ether)',
        traits: 'Creative, quick-thinking, flexible, enthusiastic',
        physical: 'Slim build, dry skin, cold hands/feet, variable appetite',
        mental: 'Quick learner, imaginative, prone to anxiety and worry',
        imbalances: 'Insomnia, constipation, joint pain, anxiety, dry skin',
        foods:
          'Warm, moist, nourishing foods (soups, stews, cooked vegetables)',
        herbs: 'Ginger, cinnamon, ashwagandha, triphala',
        practices: 'Regular routine, warm oil massage, meditation, yoga'
      },
      pitta: {
        name: 'Pitta (Fire/Water)',
        traits: 'Intelligent, focused, ambitious, strong digestion',
        physical: 'Medium build, warm body, strong appetite, fair skin',
        mental: 'Sharp mind, good concentration, prone to anger and criticism',
        imbalances:
          'Acid reflux, ulcers, skin rashes, irritability, inflammation',
        foods: 'Cooling foods (salads, fruits, dairy, sweet grains)',
        herbs: 'Aloe vera, coriander, neem, amalaki',
        practices:
          'Cooling activities, swimming, moon gazing, forgiveness practices'
      },
      kapha: {
        name: 'Kapha (Water/Earth)',
        traits: 'Calm, loyal, patient, strong endurance',
        physical: 'Solid build, smooth skin, slow digestion, good immunity',
        mental: 'Stable mind, compassionate, prone to attachment and lethargy',
        imbalances: 'Weight gain, congestion, depression, sluggishness, edema',
        foods: 'Light, warm, spicy foods (vegetables, legumes, spices)',
        herbs: 'Turmeric, ginger, guggulu, trikatu',
        practices:
          'Regular exercise, dry brushing, fasting, stimulating activities'
      }
    };
  }

  _getPlanetaryHealth() {
    return {
      sun: {
        bodyParts: 'Heart, spine, eyes, general vitality',
        dosha: 'pitta',
        gemstone: 'Ruby'
      },
      moon: {
        bodyParts: 'Stomach, breasts, lymphatic system, emotions',
        dosha: 'kapha',
        gemstone: 'Pearl'
      },
      mars: {
        bodyParts: 'Muscles, blood, head, immune system',
        dosha: 'pitta',
        gemstone: 'Red Coral'
      },
      mercury: {
        bodyParts: 'Nervous system, skin, speech, intellect',
        dosha: 'vata/kapha',
        gemstone: 'Emerald'
      },
      jupiter: {
        bodyParts: 'Liver, thighs, wisdom, expansion',
        dosha: 'kapha',
        gemstone: 'Yellow Sapphire'
      },
      venus: {
        bodyParts: 'Kidneys, reproductive system, throat, beauty',
        dosha: 'kapha',
        gemstone: 'Diamond'
      },
      saturn: {
        bodyParts: 'Bones, teeth, joints, longevity',
        dosha: 'vata',
        gemstone: 'Blue Sapphire'
      },
      rahu: {
        bodyParts: 'Lungs, foreign elements, sudden illnesses',
        dosha: 'vata',
        gemstone: 'Hessonite'
      },
      ketu: {
        bodyParts: 'Mysterious ailments, spiritual health',
        dosha: 'vata',
        gemstone: 'Cat\'s Eye'
      }
    };
  }

  _getSignFromLongitude(longitude) {
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
    const signIndex = Math.floor(longitude / 30);
    return signs[signIndex] || 'Aries';
  }

  _getLifestyleRecommendations(dosha) {
    const recommendations = {
      vata: [
        'Maintain regular daily routine',
        'Stay warm and avoid cold/dry environments',
        'Practice grounding activities like walking in nature',
        'Get adequate rest and avoid overstimulation'
      ],
      pitta: [
        'Avoid excessive heat and sun exposure',
        'Practice cooling activities like swimming',
        'Maintain moderate exercise routine',
        'Cultivate patience and avoid competitive environments'
      ],
      kapha: [
        'Stay active and avoid sedentary lifestyle',
        'Seek stimulating environments and activities',
        'Maintain regular exercise routine',
        'Avoid overeating and heavy, oily foods'
      ]
    };

    return recommendations[dosha] || [];
  }

  _getAyurvedicTherapies(dosha) {
    const therapies = {
      vata: [
        'Abhyanga (warm oil massage)',
        'Nasya (nasal therapy)',
        'Basti (enema therapy)',
        'Warm compresses and steam therapy'
      ],
      pitta: [
        'Sheetali pranayama (cooling breath)',
        'Panchakarma detoxification',
        'Cooling herbal applications',
        'Meditation and moon bathing'
      ],
      kapha: [
        'Udvartana (herbal powder massage)',
        'Dry brushing (garshana)',
        'Steam therapy',
        'Stimulating pranayama practices'
      ]
    };

    return therapies[dosha] || [];
  }

  _getDailyRoutine(primaryDosha) {
    const routines = {
      vata: {
        wakeUp: '6:00 AM',
        breakfast: 'Warm oatmeal with ghee and fruits',
        exercise: 'Gentle yoga or walking',
        lunch: 'Warm, cooked vegetables with rice',
        evening: 'Warm oil massage before bed',
        sleep: '10:00 PM'
      },
      pitta: {
        wakeUp: '5:30 AM',
        breakfast: 'Fresh fruits and cool yogurt',
        exercise: 'Swimming or moderate exercise',
        lunch: 'Cool salads and light grains',
        evening: 'Meditation and cooling activities',
        sleep: '10:30 PM'
      },
      kapha: {
        wakeUp: '5:00 AM',
        breakfast: 'Light fruits and herbal tea',
        exercise: 'Vigorous exercise or running',
        lunch: 'Spicy vegetables and legumes',
        evening: 'Stimulating activities and light dinner',
        sleep: '10:00 PM'
      }
    };

    return routines[primaryDosha] || routines.vata;
  }

  _getSeasonalGuidance(primaryDosha) {
    const guidance = {
      vata: {
        autumn: 'Focus on warmth, moisture, and grounding practices',
        winter: 'Stay warm, use sesame oil massage, eat nourishing foods',
        spring: 'Detox gently, focus on light foods and spring cleaning',
        summer: 'Stay cool, avoid dehydration, eat cooling foods'
      },
      pitta: {
        autumn: 'Good season for balance, maintain cooling practices',
        winter: 'Stay warm but avoid heavy foods, practice moderation',
        spring: 'Natural detox season, focus on cleansing practices',
        summer: 'Be careful with heat, stay hydrated, avoid sun exposure'
      },
      kapha: {
        autumn: 'Good for activity, maintain stimulation',
        winter: 'Challenge season, stay active, avoid heaviness',
        spring: 'Natural detox time, focus on lightening practices',
        summer: 'Good season for balance, maintain activity level'
      }
    };

    return guidance[primaryDosha] || guidance.vata;
  }

  _getHealthConcerns(planet, strength) {
    const concerns = {
      sun:
        strength < 0.7 ? ['Low vitality', 'Heart issues', 'Eye problems'] : [],
      moon:
        strength < 0.7 ?
          ['Digestive issues', 'Emotional imbalance', 'Sleep problems'] :
          [],
      mars:
        strength < 0.7 ?
          ['Low immunity', 'Blood disorders', 'Inflammation'] :
          ['Excess heat', 'Aggression', 'Acid issues'],
      mercury:
        strength < 0.7 ?
          ['Nervous disorders', 'Skin issues', 'Communication problems'] :
          [],
      jupiter:
        strength < 0.7 ?
          ['Liver problems', 'Weight issues', 'Lack of wisdom'] :
          [],
      venus:
        strength < 0.7 ?
          ['Kidney issues', 'Reproductive problems', 'Throat issues'] :
          [],
      saturn:
        strength < 0.7 ?
          ['Joint pain', 'Depression', 'Chronic conditions'] :
          [],
      rahu:
        strength < 0.7 ?
          ['Respiratory issues', 'Foreign elements', 'Sudden illnesses'] :
          ['Anxiety', 'Confusion', 'Addictions'],
      ketu:
        strength < 0.7 ?
          ['Mysterious ailments', 'Spiritual disconnection'] :
          ['Detachment', 'Isolation']
    };

    return concerns[planet] || [];
  }

  _getPlanetaryHealthRecommendations(planets) {
    const recommendations = {};
    const planetaryHealth = this._analyzePlanetaryHealth(planets);

    Object.entries(planetaryHealth).forEach(([planet, data]) => {
      if (data.concerns && data.concerns.length > 0) {
        recommendations[planet] = {
          focus: data.concerns,
          gemstone: data.gemstone,
          suggestion: `Consider wearing ${data.gemstone} on appropriate finger for ${planet} balancing`
        };
      }
    });

    return recommendations;
  }

  _generateCompleteSummary(constitutions, healthRecommendations) {
    const { primary } = constitutions;
    const constitution = this._getConstitutions()[primary];

    let summary = '🕉️ *Ayurvedic Astrology Analysis*\n\n';
    summary += `*Your Primary Constitution:* ${constitution.name}\n\n`;
    summary += `*Physical Characteristics:* ${constitution.physical}\n\n`;
    summary += `*Mental Traits:* ${constitution.mental}\n\n`;
    summary += `*Potential Imbalances:* ${constitution.imbalances}\n\n`;
    summary += `*Recommended Diet:* ${healthRecommendations.diet}\n\n`;
    summary += `*Beneficial Herbs:* ${healthRecommendations.herbs}\n\n`;
    summary += `*Daily Practices:* ${healthRecommendations.practices}\n\n`;

    if (constitutions.secondary !== constitutions.primary) {
      const secondary = this._getConstitutions()[constitutions.secondary];
      summary += `*Secondary Influence:* ${secondary.name}\n\n`;
    }

    summary += '*Key Ayurvedic Principles:*\n';
    summary += '• Balance your dominant dosha through diet and lifestyle\n';
    summary += '• Follow seasonal routines for optimal health\n';
    summary += '• Practice daily oil massage (Abhyanga) for balance\n';
    summary += '• Eat according to your constitution, not cravings\n';
    summary += '• Maintain regular daily and seasonal routines\n\n';

    summary +=
      '*Remember:* Ayurveda teaches that health is a balance of body, mind, and spirit. Your astrological chart provides the blueprint for your unique Ayurvedic constitution! 🌿';

    return summary;
  }

  // ================= HANDLER METHODS =================

  /**
   * Check if message is an Ayurvedic astrology request
   * @private
   */
  _isAyurvedicAstrologyRequest(message) {
    if (!message || typeof message !== 'string') return false;

    const keywords = [
      'ayurvedic',
      'ayurveda',
      'constitution',
      'dosha',
      'prakriti',
      'vata',
      'pitta',
      'kapha'
    ];

    const lowerMessage = message.toLowerCase();
    return keywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Format birth data required message for Ayurvedic astrology
   * @private
   */
  _formatAyurvedicBirthDataRequiredMessage() {
    return '🌿 *Ayurvedic Astrology - Dosha Constitution*\n\n👤 I need your birth details for Ayurvedic constitution analysis.\n\nSend format: DDMMYY or DDMMYYYY\nExample: 150691 (June 15, 1991)\n\nAyurveda (Ayur = Life, Veda = Science) analyzes your mind-body constitution through astrological birth chart analysis.';
  }

  /**
   * Handle Ayurvedic Astrology request (migrated from handler)
   * @param {string} message - User message
   * @param {Object} user - User object
   * @returns {string|null} Response or null if not handled
   */
  async handleAyurvedicAstrologyRequest(message, user) {
    if (!this._isAyurvedicAstrologyRequest(message)) {
      return null;
    }

    if (!user.birthDate) {
      return this._formatAyurvedicBirthDataRequiredMessage();
    }

    try {
      const birthData = {
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi, India'
      };

      const analysis = await this.calculateAyurvedicAstrologyAnalysis(birthData);

      if (analysis.error) {
        logger.error('Ayurvedic astrology calculation failed:', analysis.error);
        return '❌ Error determining Ayurvedic constitution. Please try again.';
      }

      // Format response with Ayurvedic sections
      let ayurvedicResult = '🌿 *Ayurvedic Astrology - Your Constitution*\n\n';

      if (analysis.summary) {
        // If personalized analysis available, use it
        return analysis.summary;
      } else {
        // Fallback to basic response
        ayurvedicResult += `📋 ${analysis.introduction}\n\n`;

        if (analysis.doshaBreakdown) {
          ayurvedicResult += `*Your Dosha Balance:*\n${analysis.doshaBreakdown}\n\n`;
        }

        if (analysis.healthRecommendations) {
          if (analysis.healthRecommendations.imbalances) {
            ayurvedicResult += `*Potential Imbalances:* ${analysis.healthRecommendations.imbalances}\n\n`;
          }

          if (analysis.healthRecommendations.diet) {
            ayurvedicResult += `*Recommended Diet:* ${analysis.healthRecommendations.diet}\n\n`;
          }

          if (analysis.healthRecommendations.herbs) {
            ayurvedicResult += `*Beneficial Herbs:* ${analysis.healthRecommendations.herbs}\n\n`;
          }

          if (analysis.healthRecommendations.practices) {
            ayurvedicResult += `*Daily Practices:* ${analysis.healthRecommendations.practices}\n\n`;
          }
        }
      }

      ayurvedicResult += '🕉️ *Vedic wellness integrates planetary influences with natural healing for holistic health.*';

      return ayurvedicResult;

    } catch (error) {
      logger.error('Ayurvedic astrology error:', error);
      return '❌ Error determining Ayurvedic constitution. Please try again.';
    }
  }

  /**
   * Health check for AyurvedicAstrologyCalculator
   * @returns {Object} Health status
   */
  healthCheck() {
    return {
      healthy: true,
      version: '1.0.0',
      name: 'AyurvedicAstrologyCalculator',
      calculations: [
        'Dosha Constitution Analysis',
        'Planetary Health Indicators',
        'Ayurvedic Health Recommendations',
        'Diet & Lifestyle Guidance',
        'Handler Methods'
      ],
      status: 'Operational'
    };
  }
}

module.exports = { AyurvedicAstrologyCalculator };