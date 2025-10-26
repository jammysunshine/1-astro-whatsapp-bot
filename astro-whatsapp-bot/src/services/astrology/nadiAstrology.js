/**
 * Nadi Astrology - Ancient Tamil Leaf Astrology System
 * Based on ancient palm leaf manuscripts with detailed life predictions
 */

const logger = require('../utils/logger');

class NadiAstrology {
  constructor() {
    logger.info('Module: NadiAstrology loaded.');
    this.initializeNadiSystem();
  }

  /**
   * Initialize the complete Nadi Astrology system
   */
  initializeNadiSystem() {
    // Nadi Granthas (Ancient Texts)
    this.nadiGranthas = {
      bhrigu_nadi: {
        name: 'Bhrigu Nadi',
        focus: 'Past life karma and current life predictions',
        predictions: 'Detailed life events, career, marriage, children'
      },
      sukra_nadi: {
        name: 'Sukra Nadi',
        focus: 'Marriage, relationships, and family life',
        predictions: 'Spouse description, marriage timing, family harmony'
      },
      siva_nadi: {
        name: 'Siva Nadi',
        focus: 'Spiritual path and liberation',
        predictions: 'Spiritual growth, enlightenment, divine purpose'
      },
      chandra_nadi: {
        name: 'Chandra Nadi',
        focus: 'Emotional life and mental health',
        predictions: 'Emotional patterns, psychological insights, healing'
      },
      surya_nadi: {
        name: 'Surya Nadi',
        focus: 'Leadership and authority',
        predictions: 'Leadership qualities, authority, social status'
      },
      mangal_nadi: {
        name: 'Mangal Nadi',
        focus: 'Courage and physical health',
        predictions: 'Physical strength, courage, health challenges'
      },
      budha_nadi: {
        name: 'Budha Nadi',
        focus: 'Intelligence and communication',
        predictions: 'Mental abilities, learning, teaching, writing'
      },
      guru_nadi: {
        name: 'Guru Nadi',
        focus: 'Wisdom and prosperity',
        predictions: 'Knowledge, wealth, teaching, spiritual guidance'
      },
      sani_nadi: {
        name: 'Sani Nadi',
        focus: 'Karma and discipline',
        predictions: 'Life lessons, discipline, longevity, detachment'
      },
      rahu_nadi: {
        name: 'Rahu Nadi',
        focus: 'Ambition and unconventional path',
        predictions: 'Foreign connections, innovation, transformation'
      },
      ketu_nadi: {
        name: 'Ketu Nadi',
        focus: 'Spirituality and liberation',
        predictions: 'Spiritual awakening, detachment, mystical experiences'
      }
    };

    // Nadi Leaves (Palm leaf categories)
    this.nadiLeaves = {
      '1-10': {
        category: 'Royal and Leadership',
        characteristics: 'Born leaders, authoritative, successful in politics/business',
        predictions: 'High social status, leadership roles, material success'
      },
      '11-20': {
        category: 'Spiritual and Religious',
        characteristics: 'Spiritual inclination, religious activities, philosophical',
        predictions: 'Spiritual growth, religious pursuits, inner peace'
      },
      '21-30': {
        category: 'Intellectual and Academic',
        characteristics: 'High intelligence, academic excellence, research-oriented',
        predictions: 'Educational success, intellectual achievements, teaching'
      },
      '31-40': {
        category: 'Artistic and Creative',
        characteristics: 'Creative talents, artistic abilities, innovative thinking',
        predictions: 'Artistic success, creative expression, innovation'
      },
      '41-50': {
        category: 'Service and Humanitarian',
        characteristics: 'Service-oriented, helping others, compassionate',
        predictions: 'Social service, humanitarian work, community leadership'
      },
      '51-60': {
        category: 'Business and Commerce',
        characteristics: 'Business acumen, entrepreneurial skills, wealth creation',
        predictions: 'Financial success, business ventures, material prosperity'
      },
      '61-70': {
        category: 'Health and Healing',
        characteristics: 'Healing abilities, medical knowledge, therapeutic skills',
        predictions: 'Health-related career, healing professions, wellness'
      },
      '71-80': {
        category: 'Technical and Scientific',
        characteristics: 'Technical skills, scientific thinking, analytical mind',
        predictions: 'Technical professions, scientific research, innovation'
      },
      '81-90': {
        category: 'Agricultural and Natural',
        characteristics: 'Connection with nature, farming, environmental awareness',
        predictions: 'Agriculture, environmental work, natural living'
      },
      '91-100': {
        category: 'Mystical and Esoteric',
        characteristics: 'Mystical experiences, esoteric knowledge, intuitive abilities',
        predictions: 'Spiritual insights, mystical experiences, esoteric wisdom'
      }
    };

    // Nadi Matching System (for compatibility)
    this.nadiMatching = {
      adi: { compatible: ['adi', 'madhya'], description: 'Dynamic and energetic' },
      madhya: { compatible: ['adi', 'madhya', 'antya'], description: 'Balanced and harmonious' },
      antya: { compatible: ['madhya', 'antya'], description: 'Peaceful and spiritual' }
    };

    // Nadi Doshas and Remedies
    this.nadiDoshas = {
      nadi_dosha: {
        name: 'Nadi Dosha',
        causes: 'Same Nadi in both partners',
        effects: 'Health issues, financial problems, relationship conflicts',
        remedies: 'Marriage after age 28, special pujas, gemstone therapy'
      },
      bhakut_dosha: {
        name: 'Bhakut Dosha',
        causes: 'Planetary positions in 6th, 8th, 12th houses',
        effects: 'Financial difficulties, health issues, family problems',
        remedies: 'Kumbh Vivah ceremony, special mantras, charitable activities'
      },
      gana_dosha: {
        name: 'Gana Dosha',
        causes: 'Incompatible Gana (Deva, Manushya, Rakshasa)',
        effects: 'Personality conflicts, communication issues',
        remedies: 'Understanding and compromise, counseling, spiritual practices'
      }
    };

    // Nadi Predictions Categories
    this.predictionCategories = {
      past_life: 'Karma from previous incarnations',
      current_life: 'Events in present lifetime',
      future_events: 'Predictions for upcoming years',
      spiritual_growth: 'Spiritual development and enlightenment',
      material_success: 'Career, wealth, and social status',
      relationships: 'Marriage, family, and partnerships',
      health_wellness: 'Physical and mental health',
      challenges_obstacles: 'Difficulties and life lessons'
    };
  }

  /**
   * Perform Nadi Astrology reading
   * @param {Object} birthData - Birth date, time, place
   * @returns {Object} Nadi reading
   */
  performNadiReading(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      // Determine Nadi leaf based on birth details
      const nadiLeaf = this.determineNadiLeaf(birthDate, birthTime);

      // Calculate planetary influences
      const planetaryAnalysis = this.calculateNadiPlanetary(birthDate, birthTime);

      // Generate life predictions
      const predictions = this.generateNadiPredictions(nadiLeaf, planetaryAnalysis);

      // Calculate Nadi compatibility factors
      const compatibility = this.calculateNadiCompatibility(birthDate, birthTime);

      return {
        name,
        nadi_leaf: nadiLeaf,
        planetary_analysis: planetaryAnalysis,
        predictions,
        compatibility,
        summary: this.generateNadiSummary(name, nadiLeaf, predictions)
      };
    } catch (error) {
      logger.error('Error performing Nadi reading:', error);
      return {
        error: 'Unable to perform Nadi reading at this time'
      };
    }
  }

  /**
   * Determine Nadi leaf based on birth details
   * @param {string} date - Birth date
   * @param {string} time - Birth time
   * @returns {Object} Nadi leaf information
   */
  determineNadiLeaf(date, time) {
    const birthDate = new Date(date + ' ' + time);
    const day = birthDate.getDate();
    const month = birthDate.getMonth() + 1;
    const year = birthDate.getFullYear();
    const hour = birthDate.getHours();

    // Calculate Nadi number (simplified algorithm)
    const nadiNumber = ((day + month + year + hour) % 100) + 1;

    // Determine leaf category
    let leafCategory = '91-100'; // Default mystical
    for (const [range, data] of Object.entries(this.nadiLeaves)) {
      const [min, max] = range.split('-').map(Number);
      if (nadiNumber >= min && nadiNumber <= max) {
        leafCategory = range;
        break;
      }
    }

    const leafData = this.nadiLeaves[leafCategory];

    return {
      nadi_number: nadiNumber,
      leaf_category: leafCategory,
      characteristics: leafData.characteristics,
      predictions: leafData.predictions,
      grantha: this.determineNadiGrantha(nadiNumber)
    };
  }

  /**
   * Determine which Nadi Grantha applies
   * @param {number} nadiNumber - Nadi number
   * @returns {Object} Grantha information
   */
  determineNadiGrantha(nadiNumber) {
    const granthaKeys = Object.keys(this.nadiGranthas);
    const granthaIndex = (nadiNumber - 1) % granthaKeys.length;
    const granthaKey = granthaKeys[granthaIndex];

    return this.nadiGranthas[granthaKey];
  }

  /**
   * Calculate Nadi planetary analysis
   * @param {string} date - Birth date
   * @param {string} time - Birth time
   * @returns {Object} Planetary analysis
   */
  calculateNadiPlanetary(date, time) {
    // Simplified planetary analysis for Nadi system
    const birthDate = new Date(date + ' ' + time);
    const dayOfWeek = birthDate.getDay();

    // Day lord and planetary influences
    const dayLords = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
    const dayLord = dayLords[dayOfWeek];

    const planetaryStrengths = {
      sun: this.calculatePlanetaryStrength('sun', birthDate),
      moon: this.calculatePlanetaryStrength('moon', birthDate),
      mars: this.calculatePlanetaryStrength('mars', birthDate),
      mercury: this.calculatePlanetaryStrength('mercury', birthDate),
      jupiter: this.calculatePlanetaryStrength('jupiter', birthDate),
      venus: this.calculatePlanetaryStrength('venus', birthDate),
      saturn: this.calculatePlanetaryStrength('saturn', birthDate)
    };

    return {
      day_lord: dayLord,
      planetary_strengths: planetaryStrengths,
      dominant_planets: this.getDominantPlanets(planetaryStrengths),
      nadi_influences: this.calculateNadiInfluences(dayLord, planetaryStrengths)
    };
  }

  /**
   * Calculate planetary strength (simplified)
   * @param {string} planet - Planet name
   * @param {Date} birthDate - Birth date
   * @returns {string} Strength level
   */
  calculatePlanetaryStrength(planet, birthDate) {
    const dayOfMonth = birthDate.getDate();
    const month = birthDate.getMonth() + 1;

    // Simplified strength calculation
    const baseStrength = (dayOfMonth + month) % 10;

    if (baseStrength >= 7) return 'Strong';
    if (baseStrength >= 4) return 'Moderate';
    return 'Weak';
  }

  /**
   * Get dominant planets
   * @param {Object} strengths - Planetary strengths
   * @returns {Array} Dominant planets
   */
  getDominantPlanets(strengths) {
    return Object.entries(strengths)
      .filter(([, strength]) => strength === 'Strong')
      .map(([planet]) => planet);
  }

  /**
   * Calculate Nadi-specific influences
   * @param {string} dayLord - Day lord
   * @param {Object} strengths - Planetary strengths
   * @returns {Object} Nadi influences
   */
  calculateNadiInfluences(dayLord, strengths) {
    const influences = {
      personality: this.getPersonalityInfluence(dayLord),
      career: this.getCareerInfluence(strengths),
      relationships: this.getRelationshipInfluence(dayLord),
      spiritual: this.getSpiritualInfluence(strengths)
    };

    return influences;
  }

  /**
   * Get personality influence
   * @param {string} dayLord - Day lord
   * @returns {string} Personality traits
   */
  getPersonalityInfluence(dayLord) {
    const traits = {
      sun: 'Confident, authoritative, leadership qualities',
      moon: 'Emotional, intuitive, nurturing nature',
      mars: 'Energetic, courageous, competitive spirit',
      mercury: 'Intelligent, communicative, adaptable',
      jupiter: 'Wise, optimistic, philosophical outlook',
      venus: 'Charming, artistic, harmony-seeking',
      saturn: 'Disciplined, responsible, serious-minded'
    };

    return traits[dayLord] || 'Balanced personality with various traits';
  }

  /**
   * Get career influence
   * @param {Object} strengths - Planetary strengths
   * @returns {string} Career guidance
   */
  getCareerInfluence(strengths) {
    const strongPlanets = Object.entries(strengths)
      .filter(([, strength]) => strength === 'Strong')
      .map(([planet]) => planet);

    if (strongPlanets.includes('sun')) return 'Leadership, government, administration';
    if (strongPlanets.includes('moon')) return 'Psychology, counseling, creative arts';
    if (strongPlanets.includes('mars')) return 'Military, sports, engineering, surgery';
    if (strongPlanets.includes('mercury')) return 'Teaching, writing, business, technology';
    if (strongPlanets.includes('jupiter')) return 'Teaching, law, religion, consulting';
    if (strongPlanets.includes('venus')) return 'Arts, entertainment, luxury, hospitality';
    if (strongPlanets.includes('saturn')) return 'Agriculture, research, social work';

    return 'Versatile career opportunities in multiple fields';
  }

  /**
   * Get relationship influence
   * @param {string} dayLord - Day lord
   * @returns {string} Relationship guidance
   */
  getRelationshipInfluence(dayLord) {
    const influences = {
      sun: 'Authoritative partner, leadership in relationships',
      moon: 'Emotional, caring, family-oriented relationships',
      mars: 'Passionate, energetic, competitive partnerships',
      mercury: 'Communicative, intellectual, friendly relationships',
      jupiter: 'Wise, generous, spiritually inclined partnerships',
      venus: 'Romantic, artistic, harmonious relationships',
      saturn: 'Serious, committed, long-term relationships'
    };

    return influences[dayLord] || 'Balanced approach to relationships';
  }

  /**
   * Get spiritual influence
   * @param {Object} strengths - Planetary strengths
   * @returns {string} Spiritual guidance
   */
  getSpiritualInfluence(strengths) {
    const strongPlanets = Object.entries(strengths)
      .filter(([, strength]) => strength === 'Strong')
      .map(([planet]) => planet);

    if (strongPlanets.includes('jupiter') || strongPlanets.includes('saturn')) {
      return 'Strong spiritual inclination, potential for deep wisdom';
    }
    if (strongPlanets.includes('moon') || strongPlanets.includes('venus')) {
      return 'Emotional spirituality, devotion, and inner peace';
    }
    if (strongPlanets.includes('mars') || strongPlanets.includes('sun')) {
      return 'Dynamic spiritual path, leadership in spiritual matters';
    }

    return 'Gradual spiritual development through life experiences';
  }

  /**
   * Generate Nadi predictions
   * @param {Object} nadiLeaf - Nadi leaf data
   * @param {Object} planetaryAnalysis - Planetary analysis
   * @returns {Object} Predictions
   */
  generateNadiPredictions(nadiLeaf, planetaryAnalysis) {
    const predictions = {
      life_purpose: this.getLifePurpose(nadiLeaf, planetaryAnalysis),
      career_path: this.getCareerPath(nadiLeaf, planetaryAnalysis),
      relationships: this.getRelationshipPredictions(nadiLeaf, planetaryAnalysis),
      challenges: this.getLifeChallenges(nadiLeaf, planetaryAnalysis),
      spiritual_journey: this.getSpiritualJourney(nadiLeaf, planetaryAnalysis),
      remedies: this.getNadiRemedies(nadiLeaf, planetaryAnalysis)
    };

    return predictions;
  }

  /**
   * Get life purpose from Nadi
   * @param {Object} nadiLeaf - Nadi leaf
   * @param {Object} planetaryAnalysis - Planetary analysis
   * @returns {string} Life purpose
   */
  getLifePurpose(nadiLeaf, planetaryAnalysis) {
    const purposes = {
      '1-10': 'Leadership and social contribution',
      '11-20': 'Spiritual teaching and guidance',
      '21-30': 'Intellectual pursuit and knowledge sharing',
      '31-40': 'Creative expression and artistic contribution',
      '41-50': 'Service to humanity and social welfare',
      '51-60': 'Building wealth and economic contribution',
      '61-70': 'Healing and health service to others',
      '71-80': 'Scientific and technological advancement',
      '81-90': 'Environmental stewardship and natural harmony',
      '91-100': 'Mystical exploration and spiritual wisdom'
    };

    return purposes[nadiLeaf.leaf_category] || 'Personal growth and self-realization';
  }

  /**
   * Get career path predictions
   * @param {Object} nadiLeaf - Nadi leaf
   * @param {Object} planetaryAnalysis - Planetary analysis
   * @returns {string} Career guidance
   */
  getCareerPath(nadiLeaf, planetaryAnalysis) {
    return planetaryAnalysis.nadi_influences.career;
  }

  /**
   * Get relationship predictions
   * @param {Object} nadiLeaf - Nadi leaf
   * @param {Object} planetaryAnalysis - Planetary analysis
   * @returns {string} Relationship guidance
   */
  getRelationshipPredictions(nadiLeaf, planetaryAnalysis) {
    return planetaryAnalysis.nadi_influences.relationships;
  }

  /**
   * Get life challenges
   * @param {Object} nadiLeaf - Nadi leaf
   * @param {Object} planetaryAnalysis - Planetary analysis
   * @returns {string} Challenges
   */
  getLifeChallenges(nadiLeaf, planetaryAnalysis) {
    const challenges = [];

    if (planetaryAnalysis.dominant_planets.includes('saturn')) {
      challenges.push('Karmic lessons and discipline');
    }
    if (planetaryAnalysis.dominant_planets.includes('rahu')) {
      challenges.push('Unconventional path and transformation');
    }
    if (planetaryAnalysis.dominant_planets.includes('mars')) {
      challenges.push('Energy management and conflict resolution');
    }

    return challenges.length > 0 ? challenges.join(', ') : 'Personal growth through various life experiences';
  }

  /**
   * Get spiritual journey
   * @param {Object} nadiLeaf - Nadi leaf
   * @param {Object} planetaryAnalysis - Planetary analysis
   * @returns {string} Spiritual guidance
   */
  getSpiritualJourney(nadiLeaf, planetaryAnalysis) {
    return planetaryAnalysis.nadi_influences.spiritual;
  }

  /**
   * Get Nadi remedies
   * @param {Object} nadiLeaf - Nadi leaf
   * @param {Object} planetaryAnalysis - Planetary analysis
   * @returns {Object} Remedies
   */
  getNadiRemedies(nadiLeaf, planetaryAnalysis) {
    const remedies = {
      general: 'Regular prayer, charity, and spiritual practices',
      specific: []
    };

    if (planetaryAnalysis.dominant_planets.includes('saturn')) {
      remedies.specific.push('Saturday fasting and Saturn worship');
    }
    if (planetaryAnalysis.dominant_planets.includes('rahu')) {
      remedies.specific.push('Rahu mantra chanting and snake temple visits');
    }
    if (planetaryAnalysis.dominant_planets.includes('ketu')) {
      remedies.specific.push('Ketu remedies and spiritual practices');
    }

    return remedies;
  }

  /**
   * Calculate Nadi compatibility
   * @param {string} date - Birth date
   * @param {string} time - Birth time
   * @returns {Object} Compatibility factors
   */
  calculateNadiCompatibility(date, time) {
    const birthDate = new Date(date + ' ' + time);
    const day = birthDate.getDate();

    // Simplified Nadi calculation
    const nadi = day <= 10 ? 'adi' : day <= 20 ? 'madhya' : 'antya';

    return {
      nadi: nadi,
      description: this.nadiMatching[nadi].description,
      compatible_nadis: this.nadiMatching[nadi].compatible,
      marriage_compatibility: 'Good compatibility with ' + this.nadiMatching[nadi].compatible.join(' and ') + ' Nadi partners'
    };
  }

  /**
   * Generate Nadi Astrology summary
   * @param {string} name - Person's name
   * @param {Object} nadiLeaf - Nadi leaf data
   * @param {Object} predictions - Predictions
   * @returns {string} Summary text
   */
  generateNadiSummary(name, nadiLeaf, predictions) {
    let summary = `🕉️ *Nadi Astrology Reading for ${name}*\n\n`;
    summary += `*Nadi Number:* ${nadiLeaf.nadi_number}\n`;
    summary += `*Leaf Category:* ${nadiLeaf.leaf_category}\n`;
    summary += `*Grantha:* ${nadiLeaf.grantha.name}\n\n`;

    summary += `*Life Purpose:* ${predictions.life_purpose}\n\n`;
    summary += `*Career Path:* ${predictions.career_path}\n\n`;
    summary += `*Relationships:* ${predictions.relationships}\n\n`;
    summary += `*Spiritual Journey:* ${predictions.spiritual_journey}\n\n`;
    summary += `*Life Challenges:* ${predictions.challenges}\n\n`;

    summary += `*Key Remedies:*\n`;
    summary += `• ${predictions.remedies.general}\n`;
    predictions.remedies.specific.forEach(remedy => {
      summary += `• ${remedy}\n`;
    });
    summary += '\n';

    summary += `*Note:* Nadi Astrology provides detailed insights from ancient palm leaf manuscripts. This is a general reading - consult a qualified Nadi astrologer for complete analysis. 🕉️`;

    return summary;
  }

  /**
   * Get Nadi Astrology catalog
   * @returns {Object} Available services
   */
  getNadiCatalog() {
    return {
      nadi_reading: 'Complete Nadi leaf reading',
      grantha_analysis: 'Specific Nadi Grantha analysis',
      predictions: 'Detailed life predictions',
      compatibility: 'Nadi compatibility analysis',
      remedies: 'Nadi-specific remedies and guidance'
    };
  }
}

module.exports = { NadiAstrology };