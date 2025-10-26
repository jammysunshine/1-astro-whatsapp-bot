const logger = require('../../utils/logger');

logger.info('Module: ayurvedicAstrology loaded.');

/**
 * Ayurvedic Astrology - Links Vedic astrology with Ayurvedic health principles
 * Analyzes birth charts to determine dominant doshas (Vata/Pitta/Kapha) and provides health guidance
 */

class AyurvedicAstrology {
  constructor() {
    // Planetary rulerships for doshas
    this.doshaRulerships = {
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

    // Ayurvedic constitutions and their characteristics
    this.constitutions = {
      vata: {
        name: 'Vata (Wind/Ether)',
        traits: 'Creative, quick-thinking, flexible, enthusiastic',
        physical: 'Slim build, dry skin, cold hands/feet, variable appetite',
        mental: 'Quick learner, imaginative, prone to anxiety and worry',
        imbalances: 'Insomnia, constipation, joint pain, anxiety, dry skin',
        foods: 'Warm, moist, nourishing foods (soups, stews, cooked vegetables)',
        herbs: 'Ginger, cinnamon, ashwagandha, triphala',
        practices: 'Regular routine, warm oil massage, meditation, yoga'
      },
      pitta: {
        name: 'Pitta (Fire/Water)',
        traits: 'Intelligent, focused, ambitious, strong digestion',
        physical: 'Medium build, warm body, strong appetite, fair skin',
        mental: 'Sharp mind, good concentration, prone to anger and criticism',
        imbalances: 'Acid reflux, ulcers, skin rashes, irritability, inflammation',
        foods: 'Cooling foods (salads, fruits, dairy, sweet grains)',
        herbs: 'Aloe vera, coriander, neem, amalaki',
        practices: 'Cooling activities, swimming, moon gazing, forgiveness practices'
      },
      kapha: {
        name: 'Kapha (Water/Earth)',
        traits: 'Calm, loyal, patient, strong endurance',
        physical: 'Solid build, smooth skin, slow digestion, good immunity',
        mental: 'Stable mind, compassionate, prone to attachment and lethargy',
        imbalances: 'Weight gain, congestion, depression, sluggishness, edema',
        foods: 'Light, warm, spicy foods (vegetables, legumes, spices)',
        herbs: 'Turmeric, ginger, guggulu, trikatu',
        practices: 'Regular exercise, dry brushing, fasting, stimulating activities'
      }
    };

    // Planetary health indicators
    this.planetaryHealth = {
      sun: { bodyParts: 'Heart, spine, eyes, general vitality', dosha: 'pitta', gemstone: 'Ruby' },
      moon: { bodyParts: 'Stomach, breasts, lymphatic system, emotions', dosha: 'kapha', gemstone: 'Pearl' },
      mars: { bodyParts: 'Muscles, blood, head, immune system', dosha: 'pitta', gemstone: 'Red Coral' },
      mercury: { bodyParts: 'Nervous system, skin, speech, intellect', dosha: 'vata/kapha', gemstone: 'Emerald' },
      jupiter: { bodyParts: 'Liver, thighs, wisdom, expansion', dosha: 'kapha', gemstone: 'Yellow Sapphire' },
      venus: { bodyParts: 'Kidneys, reproductive system, throat, beauty', dosha: 'kapha', gemstone: 'Diamond' },
      saturn: { bodyParts: 'Bones, teeth, joints, longevity', dosha: 'vata', gemstone: 'Blue Sapphire' },
      rahu: { bodyParts: 'Lungs, foreign elements, sudden illnesses', dosha: 'vata', gemstone: 'Hessonite' },
      ketu: { bodyParts: 'Mysterious ailments, spiritual health', dosha: 'vata', gemstone: 'Cat\'s Eye' }
    };
  }

  /**
   * Analyze birth chart for Ayurvedic constitution
   */
  analyzeAyurvedicConstitution(birthData) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      // Calculate planetary positions (simplified - would use actual ephemeris)
      const planetaryPositions = this.getPlanetaryPositions(birthDate, birthTime, birthPlace);

      // Determine dominant doshas based on planetary placements
      const doshaScores = this.calculateDoshaScores(planetaryPositions);

      // Determine primary and secondary constitutions
      const constitutions = this.determineConstitutions(doshaScores);

      // Get health recommendations
      const healthRecommendations = this.getHealthRecommendations(constitutions, planetaryPositions);

      return {
        constitutions,
        doshaScores,
        planetaryHealth: this.analyzePlanetaryHealth(planetaryPositions),
        healthRecommendations,
        dailyRoutine: this.getDailyRoutine(constitutions.primary),
        seasonalGuidance: this.getSeasonalGuidance(constitutions.primary),
        summary: this.generateSummary(constitutions, healthRecommendations)
      };
    } catch (error) {
      logger.error('Error analyzing Ayurvedic constitution:', error);
      return {
        error: 'Unable to analyze Ayurvedic constitution. Please check birth details.'
      };
    }
  }

  /**
   * Get simplified planetary positions (in real implementation, use actual ephemeris)
   */
  getPlanetaryPositions(birthDate, birthTime, birthPlace) {
    // This is a simplified version. In production, use actual astronomical calculations
    const [day, month, year] = birthDate.split('/').map(Number);

    // Mock planetary positions based on birth date
    const mockPositions = {
      sun: { sign: this.getSunSign(birthDate), house: 1, strength: 0.8 },
      moon: { sign: this.getMoonSign(birthDate), house: 4, strength: 0.7 },
      mars: { sign: 'aries', house: 8, strength: 0.9 },
      mercury: { sign: 'gemini', house: 3, strength: 0.6 },
      jupiter: { sign: 'sagittarius', house: 9, strength: 0.8 },
      venus: { sign: 'libra', house: 7, strength: 0.7 },
      saturn: { sign: 'capricorn', house: 10, strength: 0.9 },
      rahu: { sign: 'aquarius', house: 11, strength: 0.5 },
      ketu: { sign: 'leo', house: 5, strength: 0.5 }
    };

    return mockPositions;
  }

  /**
   * Calculate dosha scores based on planetary positions
   */
  calculateDoshaScores(planetaryPositions) {
    const scores = { vata: 0, pitta: 0, kapha: 0 };

    Object.entries(planetaryPositions).forEach(([planet, data]) => {
      const dosha = this.planetaryHealth[planet]?.dosha;
      if (dosha) {
        if (dosha.includes('/')) {
          // Planet rules multiple doshas
          const doshas = dosha.split('/');
          doshas.forEach(d => {
            scores[d] += data.strength * 10;
          });
        } else {
          scores[dosha] += data.strength * 10;
        }
      }

      // Add points based on sign rulership
      Object.entries(this.doshaRulerships).forEach(([doshaName, rulership]) => {
        if (rulership.signs.includes(data.sign)) {
          scores[doshaName] += 5;
        }
      });
    });

    return scores;
  }

  /**
   * Determine primary and secondary constitutions
   */
  determineConstitutions(doshaScores) {
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
   * Analyze planetary health indicators
   */
  analyzePlanetaryHealth(planetaryPositions) {
    const healthAnalysis = {};

    Object.entries(planetaryPositions).forEach(([planet, data]) => {
      const healthInfo = this.planetaryHealth[planet];
      if (healthInfo) {
        healthAnalysis[planet] = {
          bodyParts: healthInfo.bodyParts,
          dosha: healthInfo.dosha,
          strength: data.strength,
          concerns: this.getHealthConcerns(planet, data.strength),
          gemstone: healthInfo.gemstone
        };
      }
    });

    return healthAnalysis;
  }

  /**
   * Get health concerns based on planetary strength
   */
  getHealthConcerns(planet, strength) {
    const concerns = {
      sun: strength < 0.7 ? ['Low vitality', 'Heart issues', 'Eye problems'] : [],
      moon: strength < 0.7 ? ['Digestive issues', 'Emotional imbalance', 'Sleep problems'] : [],
      mars: strength < 0.7 ? ['Low immunity', 'Blood disorders', 'Inflammation'] : ['Excess heat', 'Aggression', 'Acid issues'],
      mercury: strength < 0.7 ? ['Nervous disorders', 'Skin issues', 'Communication problems'] : [],
      jupiter: strength < 0.7 ? ['Liver problems', 'Weight issues', 'Lack of wisdom'] : [],
      venus: strength < 0.7 ? ['Kidney issues', 'Reproductive problems', 'Throat issues'] : [],
      saturn: strength < 0.7 ? ['Joint pain', 'Depression', 'Chronic conditions'] : [],
      rahu: strength < 0.7 ? ['Respiratory issues', 'Foreign elements', 'Sudden illnesses'] : ['Anxiety', 'Confusion', 'Addictions'],
      ketu: strength < 0.7 ? ['Mysterious ailments', 'Spiritual disconnection'] : ['Detachment', 'Isolation']
    };

    return concerns[planet] || [];
  }

  /**
   * Get health recommendations based on constitution
   */
  getHealthRecommendations(constitutions, planetaryPositions) {
    const { primary } = constitutions;
    const constitution = this.constitutions[primary];

    return {
      diet: constitution.foods,
      herbs: constitution.herbs,
      practices: constitution.practices,
      imbalances: constitution.imbalances,
      lifestyle: this.getLifestyleRecommendations(primary),
      therapies: this.getAyurvedicTherapies(primary)
    };
  }

  /**
   * Get lifestyle recommendations
   */
  getLifestyleRecommendations(dosha) {
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

  /**
   * Get Ayurvedic therapies
   */
  getAyurvedicTherapies(dosha) {
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

  /**
   * Get daily routine recommendations
   */
  getDailyRoutine(primaryDosha) {
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

  /**
   * Get seasonal guidance
   */
  getSeasonalGuidance(primaryDosha) {
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

  /**
   * Generate comprehensive summary
   */
  generateSummary(constitutions, healthRecommendations) {
    const { primary } = constitutions;
    const constitution = this.constitutions[primary];

    let summary = '🕉️ *Ayurvedic Astrology Analysis*\n\n';
    summary += `*Your Primary Constitution:* ${constitution.name}\n\n`;
    summary += `*Physical Characteristics:* ${constitution.physical}\n\n`;
    summary += `*Mental Traits:* ${constitution.mental}\n\n`;
    summary += `*Potential Imbalances:* ${constitution.imbalances}\n\n`;
    summary += `*Recommended Diet:* ${healthRecommendations.diet}\n\n`;
    summary += `*Beneficial Herbs:* ${healthRecommendations.herbs}\n\n`;
    summary += `*Daily Practices:* ${healthRecommendations.practices}\n\n`;

    if (constitutions.secondary !== primary) {
      const secondary = this.constitutions[constitutions.secondary];
      summary += `*Secondary Influence:* ${secondary.name}\n\n`;
    }

    summary += '*Key Ayurvedic Principles:*\n';
    summary += '• Balance your dominant dosha through diet and lifestyle\n';
    summary += '• Follow seasonal routines for optimal health\n';
    summary += '• Practice daily oil massage (Abhyanga) for balance\n';
    summary += '• Eat according to your constitution, not cravings\n';
    summary += '• Maintain regular daily and seasonal routines\n\n';

    summary += '*Remember:* Ayurveda teaches that health is a balance of body, mind, and spirit. Your astrological chart provides the blueprint for your unique Ayurvedic constitution! 🌿';

    return summary;
  }

  /**
   * Get sun sign (simplified)
   */
  getSunSign(birthDate) {
    const [day, month] = birthDate.split('/').map(Number);
    const signs = [
      'capricorn', 'aquarius', 'pisces', 'aries', 'taurus', 'gemini',
      'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius'
    ];
    const cutoffs = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22];
    return signs[month - 1] || 'aries';
  }

  /**
   * Get moon sign (simplified)
   */
  getMoonSign(birthDate) {
    const [day, month] = birthDate.split('/').map(Number);
    // Simplified moon sign calculation
    const moonSigns = [
      'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius',
      'capricorn', 'aquarius', 'pisces', 'aries', 'taurus', 'gemini'
    ];
    return moonSigns[(month + day) % 12] || 'cancer';
  }

  /**
   * Get Ayurvedic astrology catalog
   */
  getAyurvedicAstrologyCatalog() {
    return {
      description: '🕉️ Ayurvedic Astrology - Ancient wisdom linking Vedic astrology with Ayurvedic health principles',
      features: [
        'Constitutional analysis (Vata/Pitta/Kapha doshas)',
        'Planetary health indicators and body part rulerships',
        'Ayurvedic diet and lifestyle recommendations',
        'Seasonal health guidance and daily routines',
        'Herbal remedies and therapeutic practices',
        'Disease prevention through astrological awareness'
      ],
      benefits: [
        'Understand your unique mind-body constitution',
        'Prevent illness through constitutional awareness',
        'Optimize health through planetary influences',
        'Follow personalized Ayurvedic routines',
        'Balance doshas for holistic wellness',
        'Integrate astrology with traditional medicine'
      ]
    };
  }
}

module.exports = { AyurvedicAstrology };
