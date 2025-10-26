/**
 * Jaimini Astrology System - Alternative Vedic Astrology
 * Based on Maharishi Jaimini's teachings with Karakas and special aspects
 */

const logger = require('../utils/logger');

class JaiminiAstrology {
  constructor() {
    logger.info('Module: JaiminiAstrology loaded.');
    this.initializeJaiminiSystem();
  }

  /**
   * Initialize the complete Jaimini Astrology system
   */
  initializeJaiminiSystem() {
    // Jaimini Karakas (Significators) based on planetary strength
    this.karakas = {
      atma_karaka: 'Soul significator - represents the soul\'s purpose',
      amatyakaraka: 'Career significator - represents profession and status',
      bhratru_karaka: 'Sibling significator - represents brothers and sisters',
      matru_karaka: 'Mother significator - represents mother and nurturing',
      pitru_karaka: 'Father significator - represents father and authority',
      putra_karaka: 'Children significator - represents children and creativity',
      gnatikaraka: 'Spouse significator - represents marriage and partnerships',
      darakaraka: 'Disease significator - represents health and longevity'
    };

    // Jaimini Aspects (different from Parasara aspects)
    this.jaiminiAspects = {
      '3': 'Trine (120°) - harmony and support',
      '5': 'Quintile (72°) - creativity and children',
      '7': 'Sextile (60°) - partnership and marriage',
      '9': 'Square (90°) - challenges and action',
      '10': 'Decile (36°) - career and status',
      '12': 'Opposition (180°) - relationships and balance'
    };

    // Jaimini Houses (different house system)
    this.jaiminiHouses = {
      '1': 'Lagna (Ascendant) - self and personality',
      '2': 'Dhana (Wealth) - family and resources',
      '3': 'Sahaja (Siblings) - courage and communication',
      '4': 'Bandhava (Relatives) - home and mother',
      '5': 'Putra (Children) - intelligence and creativity',
      '6': 'Ari (Enemies) - service and obstacles',
      '7': 'Yuvati (Spouse) - marriage and partnerships',
      '8': 'Randhra (Death) - transformation and secrets',
      '9': 'Dharma (Religion) - father and spirituality',
      '10': 'Karma (Action) - career and reputation',
      '11': 'Labha (Gains) - friends and income',
      '12': 'Vyaya (Expenses) - foreign lands and spirituality'
    };

    // Jaimini Rashis (signs) with special significations
    this.jaiminiRashis = {
      aries: {
        name: 'Mesha',
        karaka: 'Mars',
        significance: 'Self, courage, leadership, new beginnings',
        jaimini_meaning: 'Dynamic action and pioneering spirit'
      },
      taurus: {
        name: 'Vrishabha',
        karaka: 'Venus',
        significance: 'Wealth, values, material possessions, stability',
        jaimini_meaning: 'Enduring values and sensual pleasures'
      },
      gemini: {
        name: 'Mithuna',
        karaka: 'Mercury',
        significance: 'Communication, learning, adaptability, siblings',
        jaimini_meaning: 'Mental agility and versatile communication'
      },
      cancer: {
        name: 'Karka',
        karaka: 'Moon',
        significance: 'Home, family, emotions, nurturing',
        jaimini_meaning: 'Emotional security and protective instincts'
      },
      leo: {
        name: 'Simha',
        karaka: 'Sun',
        significance: 'Leadership, creativity, self-expression, children',
        jaimini_meaning: 'Royal dignity and creative self-expression'
      },
      virgo: {
        name: 'Kanya',
        karaka: 'Mercury',
        significance: 'Service, health, analysis, perfectionism',
        jaimini_meaning: 'Discriminating service and practical wisdom'
      },
      libra: {
        name: 'Tula',
        karaka: 'Venus',
        significance: 'Relationships, balance, harmony, justice',
        jaimini_meaning: 'Harmonious partnerships and aesthetic balance'
      },
      scorpio: {
        name: 'Vrishchika',
        karaka: 'Mars',
        significance: 'Transformation, intensity, secrets, regeneration',
        jaimini_meaning: 'Deep transformation and psychic power'
      },
      sagittarius: {
        name: 'Dhanus',
        karaka: 'Jupiter',
        significance: 'Philosophy, travel, higher learning, optimism',
        jaimini_meaning: 'Philosophical wisdom and expansive vision'
      },
      capricorn: {
        name: 'Makara',
        karaka: 'Saturn',
        significance: 'Ambition, discipline, responsibility, achievement',
        jaimini_meaning: 'Structured achievement and worldly success'
      },
      aquarius: {
        name: 'Kumbha',
        karaka: 'Saturn',
        significance: 'Innovation, community, humanitarianism, detachment',
        jaimini_meaning: 'Revolutionary thinking and group consciousness'
      },
      pisces: {
        name: 'Meena',
        karaka: 'Jupiter',
        significance: 'Spirituality, compassion, imagination, dissolution',
        jaimini_meaning: 'Universal compassion and mystical insight'
      }
    };

    // Jaimini Chara Dasha periods (alternative to Vimshottari)
    this.charaDasha = {
      sun: 12, moon: 15, mars: 7, mercury: 20, jupiter: 18,
      venus: 16, saturn: 10, rahu: 12, ketu: 7
    };

    // Argalas (obstructions and supports)
    this.argalas = {
      '2': 'Dhana Argala - wealth and family support',
      '4': 'Sukha Argala - happiness and home support',
      '5': 'Putra Argala - children and creativity support',
      '9': 'Dharma Argala - spiritual and father support',
      '10': 'Karma Argala - career and action support',
      '11': 'Labha Argala - gains and friends support'
    };
  }

  /**
   * Calculate Jaimini Karakas for a birth chart
   * @param {Object} birthData - Birth date, time, place
   * @returns {Object} Jaimini analysis
   */
  calculateJaiminiKarakas(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      // Calculate planetary longitudes (simplified)
      const planetaryPositions = this.calculatePlanetaryPositions(birthDate, birthTime);

      // Determine Karakas based on planetary strength
      const karakas = this.determineKarakas(planetaryPositions);

      // Calculate Jaimini aspects
      const aspects = this.calculateJaiminiAspects(planetaryPositions);

      // Calculate Argalas
      const argalas = this.calculateArgalas(planetaryPositions);

      return {
        name,
        karakas,
        aspects,
        argalas,
        summary: this.generateJaiminiSummary(name, karakas, aspects, argalas)
      };
    } catch (error) {
      logger.error('Error calculating Jaimini Karakas:', error);
      return {
        error: 'Unable to calculate Jaimini analysis at this time'
      };
    }
  }

  /**
   * Calculate simplified planetary positions
   * @param {string} date - Birth date
   * @param {string} time - Birth time
   * @returns {Object} Planetary positions
   */
  calculatePlanetaryPositions(date, time) {
    // Simplified calculation - in production would use astronomical calculations
    const birthDate = new Date(date + ' ' + time);
    const dayOfYear = Math.floor((birthDate - new Date(birthDate.getFullYear(), 0, 0)) / 86400000);

    // Approximate planetary positions based on birth date
    const positions = {
      sun: (dayOfYear * 0.986) % 360, // ~1 degree per day
      moon: (dayOfYear * 13.18) % 360, // ~13.18 degrees per day
      mars: (dayOfYear * 0.524) % 360, // ~0.524 degrees per day
      mercury: (dayOfYear * 1.383) % 360, // ~1.383 degrees per day
      jupiter: (dayOfYear * 0.083) % 360, // ~0.083 degrees per day
      venus: (dayOfYear * 1.602) % 360, // ~1.602 degrees per day
      saturn: (dayOfYear * 0.034) % 360, // ~0.034 degrees per day
      rahu: (dayOfYear * -0.052) % 360, // Retrograde approximation
      ketu: ((dayOfYear * -0.052) + 180) % 360 // Opposite to Rahu
    };

    return positions;
  }

  /**
   * Determine Jaimini Karakas based on planetary positions
   * @param {Object} positions - Planetary positions
   * @returns {Object} Karakas assignment
   */
  determineKarakas(positions) {
    // Calculate planetary strength based on degree position
    const strengths = {};
    for (const [planet, longitude] of Object.entries(positions)) {
      // Higher degree = stronger (Jaimini method)
      strengths[planet] = longitude;
    }

    // Sort planets by strength (highest degree first)
    const sortedPlanets = Object.entries(strengths)
      .sort(([,a], [,b]) => b - a)
      .map(([planet]) => planet);

    // Assign Karakas
    const karakaPlanets = sortedPlanets.slice(0, 8);
    const karakas = {
      atma_karaka: karakaPlanets[0],
      amatyakaraka: karakaPlanets[1],
      bhratru_karaka: karakaPlanets[2],
      matru_karaka: karakaPlanets[3],
      pitru_karaka: karakaPlanets[4],
      putra_karaka: karakaPlanets[5],
      gnatikaraka: karakaPlanets[6],
      darakaraka: karakaPlanets[7]
    };

    // Add significations
    const karakaDetails = {};
    for (const [karaka, planet] of Object.entries(karakas)) {
      karakaDetails[karaka] = {
        planet: planet,
        significance: this.karakas[karaka],
        strength: strengths[planet].toFixed(1) + '°'
      };
    }

    return karakaDetails;
  }

  /**
   * Calculate Jaimini aspects between planets
   * @param {Object} positions - Planetary positions
   * @returns {Array} Aspect relationships
   */
  calculateJaiminiAspects(positions) {
    const aspects = [];
    const planets = Object.keys(positions);

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];
        const angle = Math.abs(positions[planet1] - positions[planet2]);

        // Normalize angle to 0-180 degrees
        const normalizedAngle = Math.min(angle, 360 - angle);

        // Check for Jaimini aspects
        const aspectType = this.getJaiminiAspectType(normalizedAngle);
        if (aspectType) {
          aspects.push({
            planets: `${planet1} - ${planet2}`,
            angle: normalizedAngle.toFixed(1) + '°',
            aspect: aspectType,
            significance: this.interpretJaiminiAspect(planet1, planet2, aspectType)
          });
        }
      }
    }

    return aspects.slice(0, 8); // Limit to most significant aspects
  }

  /**
   * Get Jaimini aspect type based on angle
   * @param {number} angle - Angle between planets
   * @returns {string|null} Aspect type
   */
  getJaiminiAspectType(angle) {
    const tolerance = 3; // degrees tolerance

    for (const [aspectAngle, description] of Object.entries(this.jaiminiAspects)) {
      if (Math.abs(angle - parseInt(aspectAngle)) <= tolerance) {
        return description;
      }
    }

    return null;
  }

  /**
   * Interpret Jaimini aspect significance
   * @param {string} planet1 - First planet
   * @param {string} planet2 - Second planet
   * @param {string} aspect - Aspect type
   * @returns {string} Interpretation
   */
  interpretJaiminiAspect(planet1, planet2, aspect) {
    const aspectType = aspect.split(' ')[0].toLowerCase();

    if (aspectType === 'trine') {
      return `${planet1} and ${planet2} work harmoniously together`;
    } else if (aspectType === 'quintile') {
      return `${planet1} and ${planet2} enhance creativity and children matters`;
    } else if (aspectType === 'sextile') {
      return `${planet1} and ${planet2} support partnerships and marriage`;
    } else if (aspectType === 'square') {
      return `${planet1} and ${planet2} create dynamic challenges and action`;
    } else if (aspectType === 'decile') {
      return `${planet1} and ${planet2} influence career and status`;
    } else if (aspectType === 'opposition') {
      return `${planet1} and ${planet2} balance relationships and life areas`;
    }

    return `${planet1} and ${planet2} have a special Jaimini relationship`;
  }

  /**
   * Calculate Argalas (obstructions/supports)
   * @param {Object} positions - Planetary positions
   * @returns {Object} Argala analysis
   */
  calculateArgalas(positions) {
    const argalas = {
      supporting: [],
      obstructing: []
    };

    // Simplified Argala calculation
    const houses = [2, 4, 5, 9, 10, 11]; // Argala house positions

    for (const house of houses) {
      const housePosition = (positions.sun + (house - 1) * 30) % 360; // Approximate

      // Check if planets are in Argala positions
      for (const [planet, longitude] of Object.entries(positions)) {
        const angle = Math.abs(longitude - housePosition);
        if (angle <= 15 || angle >= 345) { // Within 15 degrees
          const argalaType = this.argalas[house.toString()];
          if (argalaType) {
            argalas.supporting.push({
              house: house,
              planet: planet,
              type: argalaType,
              strength: 'Strong'
            });
          }
        }
      }
    }

    return argalas;
  }

  /**
   * Generate Jaimini Astrology summary
   * @param {string} name - Person's name
   * @param {Object} karakas - Karaka assignments
   * @param {Array} aspects - Jaimini aspects
   * @param {Object} argalas - Argala analysis
   * @returns {string} Summary text
   */
  generateJaiminiSummary(name, karakas, aspects, argalas) {
    let summary = `🕉️ *Jaimini Astrology Analysis for ${name}*\n\n`;
    summary += `*Jaimini Karakas (Significators):*\n\n`;

    for (const [karaka, details] of Object.entries(karakas)) {
      summary += `*${karaka.replace(/_/g, ' ').toUpperCase()}:* ${details.planet} (${details.strength})\n`;
      summary += `${details.significance}\n\n`;
    }

    summary += `*Key Jaimini Aspects:*\n`;
    aspects.slice(0, 5).forEach(aspect => {
      summary += `• ${aspect.planets}: ${aspect.aspect}\n`;
      summary += `  ${aspect.significance}\n`;
    });
    summary += '\n';

    if (argalas.supporting.length > 0) {
      summary += `*Supporting Argalas:*\n`;
      argalas.supporting.slice(0, 3).forEach(argala => {
        summary += `• House ${argala.house}: ${argala.type} (${argala.planet})\n`;
      });
      summary += '\n';
    }

    summary += `*Jaimini System Features:*\n`;
    summary += `• Alternative to Parasara system\n`;
    summary += `• Focus on Karakas (significators)\n`;
    summary += `• Special aspect system\n`;
    summary += `• Different predictive techniques\n\n`;

    summary += `*Note:* Jaimini Astrology provides alternative insights to traditional Vedic astrology. Consult a qualified Jaimini astrologer for detailed analysis. 🕉️`;

    return summary;
  }

  /**
   * Get Jaimini Astrology catalog
   * @returns {Object} Available services
   */
  getJaiminiCatalog() {
    return {
      karakas: 'Jaimini Karakas (significators) analysis',
      aspects: 'Jaimini aspects and relationships',
      argalas: 'Argalas (supports and obstructions)',
      chara_dasha: 'Chara Dasha system',
      predictions: 'Jaimini-based predictions'
    };
  }
}

module.exports = { JaiminiAstrology };