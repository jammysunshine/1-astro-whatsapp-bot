/**
 * Hellenistic Astrology Reader
 * Implements ancient Greek astrological techniques and Arabic parts (Lots)
 */

const logger = require('../../utils/logger');

class HellenisticAstrologyReader {
  constructor() {
    logger.info('Module: HellenisticAstrologyReader loaded.');

    // Hellenistic planetary rulerships and essential dignities
    this.essentialDignities = {
      sun: {
        domicile: ['Leo'],
        exaltation: 'Aries',
        detriment: 'Aquarius',
        fall: 'Libra'
      },
      moon: {
        domicile: ['Cancer'],
        exaltation: 'Taurus',
        detriment: 'Capricorn',
        fall: 'Scorpio'
      },
      mercury: {
        domicile: ['Gemini', 'Virgo'],
        exaltation: 'Virgo',
        detriment: ['Sagittarius', 'Pisces'],
        fall: 'Pisces'
      },
      venus: {
        domicile: ['Taurus', 'Libra'],
        exaltation: 'Pisces',
        detriment: ['Aries', 'Scorpio'],
        fall: 'Virgo'
      },
      mars: {
        domicile: ['Aries', 'Scorpio'],
        exaltation: 'Capricorn',
        detriment: ['Taurus', 'Libra'],
        fall: 'Cancer'
      },
      jupiter: {
        domicile: ['Sagittarius', 'Pisces'],
        exaltation: 'Cancer',
        detriment: ['Gemini', 'Virgo'],
        fall: 'Capricorn'
      },
      saturn: {
        domicile: ['Capricorn', 'Aquarius'],
        exaltation: 'Libra',
        detriment: ['Cancer', 'Leo'],
        fall: 'Aries'
      }
    };

    // Triplicities (elemental rulerships)
    this.triplicities = {
      fire: { day: 'Sun', night: 'Jupiter', participating: 'Saturn' },
      earth: { day: 'Venus', night: 'Moon', participating: 'Mars' },
      air: { day: 'Saturn', night: 'Mercury', participating: 'Jupiter' },
      water: { day: 'Venus', night: 'Mars', participating: 'Moon' }
    };

    // Arabic Parts (Lots) formulas
    this.arabicParts = {
      fortune: {
        name: 'Lot of Fortune',
        formula: 'Ascendant + Moon - Sun',
        meaning: 'General fortune, prosperity, life force'
      },
      spirit: {
        name: 'Lot of Spirit',
        formula: 'Ascendant + Sun - Moon',
        meaning: 'Higher mind, spiritual development, consciousness'
      },
      love: {
        name: 'Lot of Love',
        formula: 'Venus - Saturn + Ascendant',
        meaning: 'Romantic love, relationships, affection'
      },
      necessity: {
        name: 'Lot of Necessity',
        formula: 'Mercury - Saturn + Ascendant',
        meaning: 'Fate, karma, unavoidable circumstances'
      },
      courage: {
        name: 'Lot of Courage',
        formula: 'Mars - Saturn + Ascendant',
        meaning: 'Bravery, confidence, overcoming fear'
      },
      victory: {
        name: 'Lot of Victory',
        formula: 'Jupiter - Saturn + Ascendant',
        meaning: 'Success, achievement, triumph'
      },
      marriage: {
        name: 'Lot of Marriage',
        formula: 'Saturn - Venus + Descendant',
        meaning: 'Marriage, partnerships, committed relationships'
      },
      children: {
        name: 'Lot of Children',
        formula: 'Jupiter - Saturn + 5th House',
        meaning: 'Children, creativity, speculation'
      },
      parents: {
        name: 'Lot of Parents',
        formula: 'Saturn - Jupiter + 4th House',
        meaning: 'Parents, ancestry, home foundation'
      },
      illness: {
        name: 'Lot of Illness',
        formula: 'Mars - Saturn + Ascendant',
        meaning: 'Health challenges, disease, recovery'
      },
      profession: {
        name: 'Lot of Profession',
        formula: 'Midheaven - Saturn + Sun',
        meaning: 'Career, vocation, public reputation'
      }
    };

    // Hellenistic aspects (different from modern aspects)
    this.hellenisticAspects = {
      conjunction: { orb: 10, influence: 'Unity and combination' },
      sextile: { orb: 3, influence: 'Harmony and opportunity' },
      square: { orb: 8, influence: 'Challenge and tension' },
      trine: { orb: 6, influence: 'Flow and ease' },
      opposition: { orb: 8, influence: 'Balance and integration' }
    };

    // Bounds (Term rulerships) - simplified version
    this.bounds = {
      Aries: [
        { planet: 'Jupiter', degrees: '0-6' },
        { planet: 'Venus', degrees: '6-12' },
        { planet: 'Mercury', degrees: '12-20' },
        { planet: 'Mars', degrees: '20-25' },
        { planet: 'Saturn', degrees: '25-30' }
      ],
      Taurus: [
        { planet: 'Venus', degrees: '0-8' },
        { planet: 'Mercury', degrees: '8-15' },
        { planet: 'Jupiter', degrees: '15-22' },
        { planet: 'Saturn', degrees: '22-27' },
        { planet: 'Mars', degrees: '27-30' }
      ]
      // Add more signs as needed...
    };
  }

  /**
   * Generate comprehensive Hellenistic astrology analysis
   * @param {Object} birthData - Birth data object
   * @returns {Object} Hellenistic astrology analysis
   */
  async generateHellenisticAnalysis(birthData) {
    try {
      const { birthDate, birthTime, name, birthPlace } = birthData;

      // Calculate planetary positions using accurate astronomical data
      const planetaryPositions = await this.calculateHellenisticPositions(birthDate, birthTime, birthPlace);

      // Calculate Arabic Parts (Lots)
      const arabicParts = this.calculateArabicParts(planetaryPositions);

      // Analyze essential dignities
      const essentialDignities = this.analyzeEssentialDignities(planetaryPositions);

      // Analyze Hellenistic aspects
      const hellenisticAspects = this.analyzeHellenisticAspects(planetaryPositions);

      // Determine sect (day/night chart)
      const sect = this.determineSect(planetaryPositions);

      // Analyze triplicities
      const triplicityAnalysis = this.analyzeTriplicities(planetaryPositions, sect);

      // Generate overall interpretation
      const interpretation = this.generateHellenisticInterpretation(
        essentialDignities,
        arabicParts,
        hellenisticAspects,
        sect
      );

      return {
        name,
        sect,
        planetaryPositions,
        arabicParts,
        essentialDignities,
        hellenisticAspects,
        triplicityAnalysis,
        interpretation,
        techniques: this.getHellenisticTechniques(),
        disclaimer: '⚠️ *Hellenistic Astrology Disclaimer:* This analysis uses ancient Greek astrological techniques. Hellenistic astrology focuses on essential dignities, Arabic parts, and sect. Results are interpretive and should be considered alongside modern astrological analysis.'
      };
    } catch (error) {
      logger.error('Error generating Hellenistic analysis:', error);
      return {
        error: 'Unable to generate Hellenistic astrology analysis',
        fallback: 'Hellenistic astrology studies ancient Greek astrological wisdom'
      };
    }
  }

  /**
   * Calculate planetary positions using Hellenistic parameters
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time
   * @param {string} birthPlace - Birth place
   * @returns {Object} Planetary positions with Hellenistic considerations
   */
  async calculateHellenisticPositions(birthDate, birthTime, birthPlace) {
    try {
      // Use the vedic calculator's accurate positioning but adapt for Hellenistic
      const vedicCalc = require('./vedicCalculator');
      const positions = await vedicCalc.calculatePlanetaryPositions(birthDate, birthTime, birthPlace);

      // Enhance with Hellenistic-specific data
      const hellenisticPositions = {};

      Object.entries(positions).forEach(([planet, data]) => {
        hellenisticPositions[planet] = {
          ...data,
          essentialDignity: this.calculateEssentialDignity(planet, data.sign),
          boundRuler: this.getBoundRuler(data.sign, data.longitude % 30),
          triplicityRuler: this.getTriplicityRuler(data.sign, 'day'), // Default to day
          joy: this.getPlanetaryJoy(planet, data.house)
        };
      });

      return hellenisticPositions;
    } catch (error) {
      logger.error('Error calculating Hellenistic positions:', error);
      return {};
    }
  }

  /**
   * Calculate essential dignity score for a planet
   * @param {string} planet - Planet name
   * @param {string} sign - Zodiac sign
   * @returns {Object} Essential dignity analysis
   */
  calculateEssentialDignity(planet, sign) {
    const dignities = this.essentialDignities[planet];
    if (!dignities) { return { score: 0, status: 'Neutral' }; }

    let score = 0;
    let status = 'Neutral';

    if (dignities.domicle && dignities.domicle.includes(sign)) {
      score += 5;
      status = 'Domicle';
    } else if (dignities.detriment && dignities.detriment.includes(sign)) {
      score -= 5;
      status = 'Detriment';
    }

    if (dignities.exaltation === sign) {
      score += 4;
      status = 'Exalted';
    } else if (dignities.fall === sign) {
      score -= 4;
      status = 'Fallen';
    }

    return { score, status, sign };
  }

  /**
   * Get bound (term) ruler for a planet's position
   * @param {string} sign - Zodiac sign
   * @param {number} degrees - Degrees within sign
   * @returns {string} Bound ruler planet
   */
  getBoundRuler(sign, degrees) {
    const signBounds = this.bounds[sign];
    if (!signBounds) { return 'Unknown'; }

    for (const bound of signBounds) {
      const [start, end] = bound.degrees.split('-').map(Number);
      if (degrees >= start && degrees < end) {
        return bound.planet;
      }
    }

    return 'Unknown';
  }

  /**
   * Get triplicity ruler for a sign
   * @param {string} sign - Zodiac sign
   * @param {string} sect - Day or night sect
   * @returns {string} Triplicity ruler
   */
  getTriplicityRuler(sign, sect) {
    const elements = {
      Aries: 'fire', Taurus: 'earth', Gemini: 'air', Cancer: 'water',
      Leo: 'fire', Virgo: 'earth', Libra: 'air', Scorpio: 'water',
      Sagittarius: 'fire', Capricorn: 'earth', Aquarius: 'air', Pisces: 'water'
    };

    const element = elements[sign];
    if (!element) { return 'Unknown'; }

    const triplicity = this.triplicities[element];
    return sect === 'day' ? triplicity.day : triplicity.night;
  }

  /**
   * Get planetary joy (house rulership)
   * @param {string} planet - Planet name
   * @param {number} house - House number
   * @returns {string} Joy status
   */
  getPlanetaryJoy(planet, house) {
    const joys = {
      1: 'Sun',    // Sun joys in 1st (identity)
      3: 'Moon',   // Moon joys in 3rd (mind, communication)
      5: 'Venus',  // Venus joys in 5th (pleasure, creativity)
      6: 'Mercury', // Mercury joys in 6th (service, health)
      9: 'Sun',    // Sun also joys in 9th (philosophy, travel)
      11: 'Jupiter', // Jupiter joys in 11th (friends, hopes)
      12: 'Saturn'  // Saturn joys in 12th (spirituality, endings)
    };

    return joys[house] === planet ? 'In Joy' : 'Not in Joy';
  }

  /**
   * Calculate Arabic Parts (Lots)
   * @param {Object} positions - Planetary positions
   * @returns {Object} Calculated Arabic parts
   */
  calculateArabicParts(positions) {
    const parts = {};
    const ascendant = positions.ascendant?.longitude || 0;
    const sun = positions.sun?.longitude || 0;
    const moon = positions.moon?.longitude || 0;
    const venus = positions.venus?.longitude || 0;
    const mars = positions.mars?.longitude || 0;
    const jupiter = positions.jupiter?.longitude || 0;
    const saturn = positions.saturn?.longitude || 0;
    const mercury = positions.mercury?.longitude || 0;
    const midheaven = positions.midheaven?.longitude || 0;

    // Calculate each Arabic part
    Object.entries(this.arabicParts).forEach(([key, part]) => {
      let longitude = 0;

      try {
        switch (key) {
        case 'fortune':
          longitude = this.normalizeLongitude(ascendant + moon - sun);
          break;
        case 'spirit':
          longitude = this.normalizeLongitude(ascendant + sun - moon);
          break;
        case 'love':
          longitude = this.normalizeLongitude(venus - saturn + ascendant);
          break;
        case 'necessity':
          longitude = this.normalizeLongitude(mercury - saturn + ascendant);
          break;
        case 'courage':
          longitude = this.normalizeLongitude(mars - saturn + ascendant);
          break;
        case 'victory':
          longitude = this.normalizeLongitude(jupiter - saturn + ascendant);
          break;
        case 'marriage':
          longitude = this.normalizeLongitude(saturn - venus + (ascendant + 180)); // Descendant
          break;
        case 'children':
          longitude = this.normalizeLongitude(jupiter - saturn + this.getHousePosition(5, ascendant));
          break;
        case 'parents':
          longitude = this.normalizeLongitude(saturn - jupiter + this.getHousePosition(4, ascendant));
          break;
        case 'illness':
          longitude = this.normalizeLongitude(mars - saturn + ascendant);
          break;
        case 'profession':
          longitude = this.normalizeLongitude(midheaven - saturn + sun);
          break;
        }

        parts[key] = {
          name: part.name,
          longitude,
          sign: this.getZodiacSign(longitude),
          house: this.getHouseFromLongitude(longitude, ascendant),
          meaning: part.meaning
        };
      } catch (error) {
        logger.error(`Error calculating Arabic part ${key}:`, error);
        parts[key] = {
          name: part.name,
          longitude: 0,
          sign: 'Unknown',
          house: 'Unknown',
          meaning: part.meaning,
          error: 'Calculation failed'
        };
      }
    });

    return parts;
  }

  /**
   * Normalize longitude to 0-360 degrees
   * @param {number} longitude - Longitude value
   * @returns {number} Normalized longitude
   */
  normalizeLongitude(longitude) {
    while (longitude < 0) { longitude += 360; }
    while (longitude >= 360) { longitude -= 360; }
    return longitude;
  }

  /**
   * Get zodiac sign from longitude
   * @param {number} longitude - Longitude in degrees
   * @returns {string} Zodiac sign
   */
  getZodiacSign(longitude) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer',
      'Leo', 'Virgo', 'Libra', 'Scorpio',
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    const signIndex = Math.floor(longitude / 30) % 12;
    return signs[signIndex];
  }

  /**
   * Get house position from house number and ascendant
   * @param {number} houseNumber - House number (1-12)
   * @param {number} ascendant - Ascendant longitude
   * @returns {number} House cusp longitude
   */
  getHousePosition(houseNumber, ascendant) {
    // Simplified house calculation (equal houses)
    return this.normalizeLongitude(ascendant + (houseNumber - 1) * 30);
  }

  /**
   * Get house number from longitude and ascendant
   * @param {number} longitude - Point longitude
   * @param {number} ascendant - Ascendant longitude
   * @returns {number} House number
   */
  getHouseFromLongitude(longitude, ascendant) {
    let relativePosition = longitude - ascendant;
    if (relativePosition < 0) { relativePosition += 360; }
    return Math.floor(relativePosition / 30) + 1;
  }

  /**
   * Analyze essential dignities across the chart
   * @param {Object} positions - Planetary positions
   * @returns {Object} Essential dignities analysis
   */
  analyzeEssentialDignities(positions) {
    const analysis = {
      strongPlanets: [],
      weakPlanets: [],
      dignifiedPlanets: [],
      peregrinePlanets: []
    };

    Object.entries(positions).forEach(([planet, data]) => {
      if (data.essentialDignity) {
        const dignity = data.essentialDignity;

        if (dignity.score > 3) {
          analysis.strongPlanets.push({
            planet,
            dignity: dignity.status,
            score: dignity.score
          });
        } else if (dignity.score < -3) {
          analysis.weakPlanets.push({
            planet,
            dignity: dignity.status,
            score: dignity.score
          });
        }

        if (dignity.status !== 'Neutral') {
          analysis.dignifiedPlanets.push({
            planet,
            dignity: dignity.status,
            sign: dignity.sign
          });
        } else {
          analysis.peregrinePlanets.push(planet);
        }
      }
    });

    return analysis;
  }

  /**
   * Analyze Hellenistic aspects
   * @param {Object} positions - Planetary positions
   * @returns {Array} Hellenistic aspects
   */
  analyzeHellenisticAspects(positions) {
    const aspects = [];
    const planets = Object.keys(positions);

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];

        const pos1 = positions[planet1].longitude;
        const pos2 = positions[planet2].longitude;

        const aspect = this.findHellenisticAspect(pos1, pos2);
        if (aspect) {
          aspects.push({
            planets: [planet1, planet2],
            aspect: aspect.type,
            orb: aspect.orb,
            influence: this.hellenisticAspects[aspect.type].influence
          });
        }
      }
    }

    return aspects;
  }

  /**
   * Find Hellenistic aspect between two positions
   * @param {number} pos1 - First position
   * @param {number} pos2 - Second position
   * @returns {Object|null} Aspect information or null
   */
  findHellenisticAspect(pos1, pos2) {
    const diff = Math.abs(pos1 - pos2);
    const normalizedDiff = Math.min(diff, 360 - diff);

    for (const [aspectType, aspectData] of Object.entries(this.hellenisticAspects)) {
      if (Math.abs(normalizedDiff - this.getAspectAngle(aspectType)) <= aspectData.orb) {
        return {
          type: aspectType,
          orb: Math.abs(normalizedDiff - this.getAspectAngle(aspectType))
        };
      }
    }

    return null;
  }

  /**
   * Get aspect angle in degrees
   * @param {string} aspectType - Type of aspect
   * @returns {number} Angle in degrees
   */
  getAspectAngle(aspectType) {
    const angles = {
      conjunction: 0,
      sextile: 60,
      square: 90,
      trine: 120,
      opposition: 180
    };
    return angles[aspectType] || 0;
  }

  /**
   * Determine sect of the chart (day or night)
   * @param {Object} positions - Planetary positions
   * @returns {string} Sect (day or night)
   */
  determineSect(positions) {
    const { sun } = positions;
    const { moon } = positions;

    if (!sun || !moon) { return 'unknown'; }

    // If Sun is above horizon (in houses 7-12), it's day sect
    // If Sun is below horizon (in houses 1-6), it's night sect
    const sunHouse = sun.house;
    return (sunHouse >= 7 && sunHouse <= 12) ? 'day' : 'night';
  }

  /**
   * Analyze triplicities for the chart
   * @param {Object} positions - Planetary positions
   * @param {string} sect - Chart sect
   * @returns {Object} Triplicity analysis
   */
  analyzeTriplicities(positions, sect) {
    const triplicityStrength = {
      fire: 0,
      earth: 0,
      air: 0,
      water: 0
    };

    Object.entries(positions).forEach(([planet, data]) => {
      const element = this.getElementFromSign(data.sign);
      if (element) {
        const triplicityRuler = this.getTriplicityRuler(data.sign, sect);
        if (triplicityRuler === planet) {
          triplicityStrength[element] += 2; // Ruler gets double points
        } else {
          triplicityStrength[element] += 1;
        }
      }
    });

    // Find strongest element
    const strongestElement = Object.entries(triplicityStrength)
      .sort(([, a], [, b]) => b - a)[0][0];

    return {
      elementStrengths: triplicityStrength,
      strongestElement,
      sect
    };
  }

  /**
   * Get element from zodiac sign
   * @param {string} sign - Zodiac sign
   * @returns {string} Element
   */
  getElementFromSign(sign) {
    const elements = {
      Aries: 'fire', Taurus: 'earth', Gemini: 'air', Cancer: 'water',
      Leo: 'fire', Virgo: 'earth', Libra: 'air', Scorpio: 'water',
      Sagittarius: 'fire', Capricorn: 'earth', Aquarius: 'air', Pisces: 'water'
    };
    return elements[sign];
  }

  /**
   * Generate overall Hellenistic interpretation
   * @param {Object} essentialDignities - Essential dignities analysis
   * @param {Object} arabicParts - Arabic parts
   * @param {Array} aspects - Hellenistic aspects
   * @param {string} sect - Chart sect
   * @returns {string} Interpretation
   */
  generateHellenisticInterpretation(essentialDignities, arabicParts, aspects, sect) {
    let interpretation = '';

    // Analyze essential dignities
    if (essentialDignities.strongPlanets.length > 0) {
      interpretation += `Strong planetary influences: ${essentialDignities.strongPlanets.map(p => `${p.planet} (${p.dignity})`).join(', ')}. `;
    }

    // Analyze key Arabic parts
    const keyParts = ['fortune', 'spirit', 'love', 'profession'];
    keyParts.forEach(partKey => {
      if (arabicParts[partKey]) {
        const part = arabicParts[partKey];
        interpretation += `${part.name} in ${part.sign} suggests ${part.meaning.toLowerCase()}. `;
      }
    });

    // Add sect consideration
    interpretation += `This is a ${sect} chart, emphasizing ${sect === 'day' ? 'conscious action and external achievements' : 'inner development and emotional matters'}. `;

    return interpretation;
  }

  /**
   * Get available Hellenistic techniques
   * @returns {Array} List of techniques
   */
  getHellenisticTechniques() {
    return [
      'Essential Dignities - Planetary strength based on rulership',
      'Arabic Parts (Lots) - Calculated points showing life areas',
      'Sect (Day/Night) - Chart orientation and emphasis',
      'Triplicities - Elemental rulerships and strengths',
      'Bounds (Terms) - Degree-by-degree planetary rulership',
      'Joys - Planetary happiness in specific houses',
      'Hellenistic Aspects - Ancient aspect interpretations'
    ];
  }
}

module.exports = HellenisticAstrologyReader;
