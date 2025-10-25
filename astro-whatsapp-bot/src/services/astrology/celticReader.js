const logger = require('../../utils/logger');

/**
 * Celtic Astrology Reader
 * Provides interpretations based on Celtic tree signs, animal totems, and druidic wisdom
 */

class CelticReader {
  constructor() {
    // Celtic Tree Signs (13 trees based on lunar calendar)
    this.treeSigns = {
      'Birch': {
        dates: 'Dec 24 - Jan 20',
        meaning: 'New Beginnings, Renewal, Purification',
        element: 'Water',
        planet: 'Venus',
        qualities: ['Pioneer', 'Cleansing', 'Innocence', 'Protection'],
        symbol: '🌿',
        treeWisdom: 'The birch tree teaches us to release the old and embrace new beginnings with courage and purity.'
      },
      'Rowan': {
        dates: 'Jan 21 - Feb 17',
        meaning: 'Protection, Inspiration, Quickening',
        element: 'Fire',
        planet: 'Uranus',
        qualities: ['Protection', 'Inspiration', 'Vision', 'Defense'],
        symbol: '🌳',
        treeWisdom: 'The rowan guards against harm and inspires creative vision and spiritual protection.'
      },
      'Ash': {
        dates: 'Feb 18 - Mar 17',
        meaning: 'Strength, Flexibility, Connection',
        element: 'Air',
        planet: 'Neptune',
        qualities: ['Strength', 'Adaptability', 'Connection', 'Wisdom'],
        symbol: '🌳',
        treeWisdom: 'The ash tree bridges worlds, offering strength, flexibility, and connection to ancient wisdom.'
      },
      'Alder': {
        dates: 'Mar 18 - Apr 14',
        meaning: 'Bravery, Leadership, Oracle',
        element: 'Fire',
        planet: 'Mars',
        qualities: ['Bravery', 'Leadership', 'Oracle', 'Resilience'],
        symbol: '🌳',
        treeWisdom: 'The alder teaches courage in the face of adversity and the power of prophetic vision.'
      },
      'Willow': {
        dates: 'Apr 15 - May 12',
        meaning: 'Intuition, Dreams, Healing',
        element: 'Water',
        planet: 'Moon',
        qualities: ['Intuition', 'Dreams', 'Healing', 'Flexibility'],
        symbol: '🌿',
        treeWisdom: 'The willow flows with emotional wisdom, healing through intuition and dream work.'
      },
      'Hawthorn': {
        dates: 'May 13 - Jun 9',
        meaning: 'Love, Protection, Fae Magic',
        element: 'Air',
        planet: 'Venus',
        qualities: ['Love', 'Protection', 'Magic', 'Transformation'],
        symbol: '🌸',
        treeWisdom: 'The hawthorn guards the gateway between worlds, teaching love, protection, and fae magic.'
      },
      'Oak': {
        dates: 'Jun 10 - Jul 7',
        meaning: 'Strength, Endurance, Leadership',
        element: 'Fire',
        planet: 'Jupiter',
        qualities: ['Strength', 'Endurance', 'Leadership', 'Stability'],
        symbol: '🌳',
        treeWisdom: 'The mighty oak embodies enduring strength, leadership, and the power of steadfast wisdom.'
      },
      'Holly': {
        dates: 'Jul 8 - Aug 4',
        meaning: 'Defense, Healing, Balance',
        element: 'Earth',
        planet: 'Saturn',
        qualities: ['Defense', 'Healing', 'Balance', 'Determination'],
        symbol: '🌿',
        treeWisdom: 'The holly teaches defensive strength, healing balance, and determined protection.'
      },
      'Hazel': {
        dates: 'Aug 5 - Sep 1',
        meaning: 'Wisdom, Inspiration, Poetry',
        element: 'Air',
        planet: 'Mercury',
        qualities: ['Wisdom', 'Inspiration', 'Poetry', 'Divination'],
        symbol: '🌰',
        treeWisdom: 'The hazel tree of wisdom inspires poetry, divination, and profound intellectual insight.'
      },
      'Vine': {
        dates: 'Sep 2 - Sep 29',
        meaning: 'Joy, Prosperity, Celebration',
        element: 'Earth',
        planet: 'Venus',
        qualities: ['Joy', 'Prosperity', 'Celebration', 'Growth'],
        symbol: '🍇',
        treeWisdom: 'The vine teaches joyful abundance, prosperity through celebration, and bountiful growth.'
      },
      'Ivy': {
        dates: 'Sep 30 - Oct 27',
        meaning: 'Endurance, Fidelity, Determination',
        element: 'Water',
        planet: 'Saturn',
        qualities: ['Endurance', 'Fidelity', 'Determination', 'Resilience'],
        symbol: '🌿',
        treeWisdom: 'The ivy demonstrates enduring strength, faithful determination, and resilient growth.'
      },
      'Reed': {
        dates: 'Oct 28 - Nov 24',
        meaning: 'Family, Community, Harmony',
        element: 'Air',
        planet: 'Mercury',
        qualities: ['Family', 'Community', 'Harmony', 'Communication'],
        symbol: '🌾',
        treeWisdom: 'The reed teaches community harmony, family bonds, and the strength of collective wisdom.'
      },
      'Elder': {
        dates: 'Nov 25 - Dec 23',
        meaning: 'Transformation, Death, Rebirth',
        element: 'Water',
        planet: 'Pluto',
        qualities: ['Transformation', 'Rebirth', 'Wisdom', 'Regeneration'],
        symbol: '🌿',
        treeWisdom: 'The elder tree guides through transformation, teaching the wisdom of death and rebirth cycles.'
      }
    };

    // Celtic Animal Totems
    this.animalTotems = {
      'Stag': { qualities: ['Leadership', 'Majesty', 'Independence', 'Spiritual Authority'], element: 'Fire' },
      'Salmon': { qualities: ['Wisdom', 'Inspiration', 'Transformation', 'Ancient Knowledge'], element: 'Water' },
      'Bear': { qualities: ['Strength', 'Protection', 'Healing', 'Inner Wisdom'], element: 'Earth' },
      'Raven': { qualities: ['Magic', 'Transformation', 'Divination', 'Mystery'], element: 'Air' },
      'Wolf': { qualities: ['Loyalty', 'Family', 'Intuition', 'Social Bonds'], element: 'Earth' },
      'Eagle': { qualities: ['Vision', 'Freedom', 'Spirituality', 'Higher Perspective'], element: 'Air' },
      'Horse': { qualities: ['Freedom', 'Power', 'Journey', 'Wild Spirit'], element: 'Fire' },
      'Swan': { qualities: ['Grace', 'Beauty', 'Transformation', 'Inner Beauty'], element: 'Water' },
      'Owl': { qualities: ['Wisdom', 'Night Vision', 'Mystery', 'Ancient Knowledge'], element: 'Air' },
      'Dragon': { qualities: ['Power', 'Magic', 'Transformation', 'Ancient Wisdom'], element: 'Fire' }
    };

    // Celtic Wheel of the Year (8 festivals)
    this.celticWheel = {
      'Samhain': { date: 'Oct 31', meaning: 'End of Harvest, Ancestor Connection', season: 'Autumn' },
      'Yule': { date: 'Dec 21', meaning: 'Winter Solstice, Rebirth', season: 'Winter' },
      'Imbolc': { date: 'Feb 2', meaning: 'First Stirrings, Purification', season: 'Winter' },
      'Ostara': { date: 'Mar 21', meaning: 'Spring Equinox, New Life', season: 'Spring' },
      'Beltane': { date: 'May 1', meaning: 'Summer Begins, Fertility', season: 'Spring' },
      'Litha': { date: 'Jun 21', meaning: 'Summer Solstice, Power', season: 'Summer' },
      'Lammas': { date: 'Aug 1', meaning: 'First Harvest, Gratitude', season: 'Summer' },
      'Mabon': { date: 'Sep 21', meaning: 'Autumn Equinox, Balance', season: 'Autumn' }
    };
  }

  /**
   * Generate Celtic birth chart analysis
   * @param {Object} birthData - Birth data object
   * @returns {Object} Celtic analysis
   */
  generateCelticChart(birthData) {
    try {
      const { birthDate, birthTime, name } = birthData;

      // Calculate tree sign
      const treeSign = this.calculateTreeSign(birthDate);

      // Calculate animal totem
      const animalTotem = this.calculateAnimalTotem(birthDate);

      // Calculate seasonal influence
      const seasonalInfluence = this.calculateSeasonalInfluence(birthDate);

      // Generate druidic wisdom
      const druidicWisdom = this.generateDruidicWisdom(treeSign, animalTotem);

      // Calculate life path
      const lifePath = this.calculateLifePath(treeSign, animalTotem);

      // Generate personality traits
      const personalityTraits = this.generatePersonalityTraits(treeSign, animalTotem);

      return {
        name,
        treeSign,
        animalTotem,
        seasonalInfluence,
        druidicWisdom,
        lifePath,
        personalityTraits,
        celticDescription: this.generateCelticDescription(treeSign, animalTotem, seasonalInfluence)
      };
    } catch (error) {
      logger.error('Error generating Celtic chart:', error);
      return {
        error: 'Unable to generate Celtic analysis at this time',
        fallback: 'The Celtic wisdom of trees and animals guides your path'
      };
    }
  }

  /**
   * Calculate Celtic tree sign based on birth date
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @returns {Object} Tree sign information
   */
  calculateTreeSign(birthDate) {
    try {
      const [day, month] = birthDate.split('/').map(Number);

      // Celtic tree signs based on lunar calendar
      const treeDates = [
        { sign: 'Birch', start: [24, 12], end: [20, 1] },
        { sign: 'Rowan', start: [21, 1], end: [17, 2] },
        { sign: 'Ash', start: [18, 2], end: [17, 3] },
        { sign: 'Alder', start: [18, 3], end: [14, 4] },
        { sign: 'Willow', start: [15, 4], end: [12, 5] },
        { sign: 'Hawthorn', start: [13, 5], end: [9, 6] },
        { sign: 'Oak', start: [10, 6], end: [7, 7] },
        { sign: 'Holly', start: [8, 7], end: [4, 8] },
        { sign: 'Hazel', start: [5, 8], end: [1, 9] },
        { sign: 'Vine', start: [2, 9], end: [29, 9] },
        { sign: 'Ivy', start: [30, 9], end: [27, 10] },
        { sign: 'Reed', start: [28, 10], end: [24, 11] },
        { sign: 'Elder', start: [25, 11], end: [23, 12] }
      ];

      for (const { sign, start, end } of treeDates) {
        const [startDay, startMonth] = start;
        const [endDay, endMonth] = end;

        if ((month === startMonth && day >= startDay) ||
            (month === endMonth && day <= endDay) ||
            (month > startMonth && month < endMonth)) {
          return {
            name: sign,
            ...this.treeSigns[sign]
          };
        }
      }

      return {
        name: 'Birch',
        ...this.treeSigns['Birch']
      };
    } catch (error) {
      logger.error('Error calculating tree sign:', error);
      return {
        name: 'Oak',
        ...this.treeSigns['Oak']
      };
    }
  }

  /**
   * Calculate animal totem based on birth date
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @returns {Object} Animal totem information
   */
  calculateAnimalTotem(birthDate) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);

      // Simplified animal totem calculation based on day of year
      const birth = new Date(year, month - 1, day);
      const startOfYear = new Date(year, 0, 1);
      const dayOfYear = Math.floor((birth - startOfYear) / (1000 * 60 * 60 * 24));

      const animals = Object.keys(this.animalTotems);
      const animalIndex = dayOfYear % animals.length;
      const animalName = animals[animalIndex];

      return {
        name: animalName,
        ...this.animalTotems[animalName]
      };
    } catch (error) {
      logger.error('Error calculating animal totem:', error);
      return {
        name: 'Raven',
        ...this.animalTotems['Raven']
      };
    }
  }

  /**
   * Calculate seasonal influence based on birth date
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @returns {Object} Seasonal influence
   */
  calculateSeasonalInfluence(birthDate) {
    try {
      const [day, month] = birthDate.split('/').map(Number);

      // Celtic seasons
      const seasons = {
        'Winter': { months: [12, 1, 2], qualities: ['Introspection', 'Planning', 'Inner Growth'] },
        'Spring': { months: [3, 4, 5], qualities: ['Growth', 'Renewal', 'Creativity'] },
        'Summer': { months: [6, 7, 8], qualities: ['Abundance', 'Energy', 'Expression'] },
        'Autumn': { months: [9, 10, 11], qualities: ['Harvest', 'Reflection', 'Gratitude'] }
      };

      const season = Object.keys(seasons).find(season =>
        seasons[season].months.includes(month)
      ) || 'Spring';

      return {
        season,
        qualities: seasons[season].qualities,
        festivals: this.getSeasonalFestivals(season)
      };
    } catch (error) {
      logger.error('Error calculating seasonal influence:', error);
      return {
        season: 'Spring',
        qualities: ['Growth', 'Renewal'],
        festivals: ['Ostara', 'Beltane']
      };
    }
  }

  /**
   * Get seasonal festivals
   * @param {string} season - Season name
   * @returns {Array} Festival names
   */
  getSeasonalFestivals(season) {
    const festivalMap = {
      'Winter': ['Samhain', 'Yule', 'Imbolc'],
      'Spring': ['Imbolc', 'Ostara', 'Beltane'],
      'Summer': ['Beltane', 'Litha', 'Lammas'],
      'Autumn': ['Lammas', 'Mabon', 'Samhain']
    };

    return festivalMap[season] || [];
  }

  /**
   * Generate druidic wisdom based on tree and animal
   * @param {Object} treeSign - Tree sign data
   * @param {Object} animalTotem - Animal totem data
   * @returns {Object} Druidic wisdom
   */
  generateDruidicWisdom(treeSign, animalTotem) {
    const wisdom = {
      guidance: this.combineWisdom(treeSign.treeWisdom, animalTotem),
      meditation: `Meditate with ${treeSign.name} and call upon ${animalTotem.name} for guidance`,
      ritual: this.generateRitual(treeSign, animalTotem),
      affirmation: this.generateAffirmation(treeSign, animalTotem)
    };

    return wisdom;
  }

  /**
   * Combine tree and animal wisdom
   * @param {string} treeWisdom - Tree wisdom
   * @param {Object} animalTotem - Animal totem data
   * @returns {string} Combined wisdom
   */
  combineWisdom(treeWisdom, animalTotem) {
    const animalWisdom = `${animalTotem.name} brings ${animalTotem.qualities.slice(0, 2).join(' and ')} to your path.`;
    return `${treeWisdom} ${animalWisdom}`;
  }

  /**
   * Generate ritual based on tree and animal
   * @param {Object} treeSign - Tree sign data
   * @param {Object} animalTotem - Animal totem data
   * @returns {string} Ritual guidance
   */
  generateRitual(treeSign, animalTotem) {
    const rituals = {
      'Birch-Raven': 'Create a cleansing ritual with birch twigs and raven feathers',
      'Oak-Bear': 'Build strength through oak meditation and bear grounding',
      'Willow-Swan': 'Flow with willow wisdom and swan grace in water rituals',
      'Hawthorn-Eagle': 'Seek vision at hawthorn trees and eagle flight meditation'
    };

    const key = `${treeSign.name}-${animalTotem.name}`;
    return rituals[key] || `Connect with ${treeSign.name} energy and ${animalTotem.name} spirit through nature meditation`;
  }

  /**
   * Generate affirmation combining tree and animal
   * @param {Object} treeSign - Tree sign data
   * @param {Object} animalTotem - Animal totem data
   * @returns {string} Affirmation
   */
  generateAffirmation(treeSign, animalTotem) {
    const affirmations = {
      'Birch-Stag': 'I lead with pure intention and protective strength',
      'Oak-Bear': 'I stand strong with ancient wisdom and inner power',
      'Willow-Swan': 'I flow with grace and intuitive wisdom',
      'Hawthorn-Raven': 'I embrace magical transformation and prophetic vision'
    };

    const key = `${treeSign.name}-${animalTotem.name}`;
    return affirmations[key] || `I embody ${treeSign.qualities[0].toLowerCase()} and ${animalTotem.qualities[0].toLowerCase()} wisdom`;
  }

  /**
   * Calculate life path based on Celtic energies
   * @param {Object} treeSign - Tree sign data
   * @param {Object} animalTotem - Animal totem data
   * @returns {string} Life path
   */
  calculateLifePath(treeSign, animalTotem) {
    const paths = {
      'Oak-Bear': 'Path of the Ancient Guardian - Protect and guide with strength and wisdom',
      'Birch-Stag': 'Path of the Pure Leader - Lead with innocence and majestic authority',
      'Willow-Swan': 'Path of the Mystic Healer - Heal through intuition and graceful transformation',
      'Hawthorn-Raven': 'Path of the Faerie Mage - Weave magic and transformation',
      'Ash-Salmon': 'Path of the Wisdom Keeper - Bridge worlds with ancient knowledge',
      'Rowan-Eagle': 'Path of the Visionary Protector - See clearly and defend sacred spaces'
    };

    const key = `${treeSign.name}-${animalTotem.name}`;
    return paths[key] || `Path of the ${treeSign.name} ${animalTotem.name} - Embody ${treeSign.qualities[0]} through ${animalTotem.qualities[0]}`;
  }

  /**
   * Generate personality traits
   * @param {Object} treeSign - Tree sign data
   * @param {Object} animalTotem - Animal totem data
   * @returns {Object} Personality traits
   */
  generatePersonalityTraits(treeSign, animalTotem) {
    const traits = [...treeSign.qualities, ...animalTotem.qualities];
    const uniqueTraits = [...new Set(traits)];

    return {
      coreTraits: uniqueTraits.slice(0, 6),
      strengths: this.calculateStrengths(treeSign, animalTotem),
      challenges: this.calculateChallenges(treeSign, animalTotem),
      elementalBalance: `${treeSign.element} and ${animalTotem.element} energies`
    };
  }

  /**
   * Calculate strengths based on Celtic energies
   * @param {Object} treeSign - Tree sign data
   * @param {Object} animalTotem - Animal totem data
   * @returns {Array} Strengths
   */
  calculateStrengths(treeSign, animalTotem) {
    const strengths = [];

    // Tree-based strengths
    if (treeSign.name === 'Oak') strengths.push('Enduring strength and leadership');
    if (treeSign.name === 'Birch') strengths.push('Pure intention and renewal');
    if (treeSign.name === 'Willow') strengths.push('Intuitive healing and flexibility');

    // Animal-based strengths
    if (animalTotem.name === 'Bear') strengths.push('Protective power and inner wisdom');
    if (animalTotem.name === 'Raven') strengths.push('Magical insight and transformation');
    if (animalTotem.name === 'Eagle') strengths.push('Spiritual vision and freedom');

    return strengths.slice(0, 4);
  }

  /**
   * Calculate challenges based on Celtic energies
   * @param {Object} treeSign - Tree sign data
   * @param {Object} animalTotem - Animal totem data
   * @returns {Array} Challenges
   */
  calculateChallenges(treeSign, animalTotem) {
    const challenges = [];

    // Tree-based challenges
    if (treeSign.name === 'Elder') challenges.push('Embracing necessary transformation');
    if (treeSign.name === 'Holly') challenges.push('Balancing defense with openness');

    // Animal-based challenges
    if (animalTotem.name === 'Wolf') challenges.push('Balancing independence with social bonds');
    if (animalTotem.name === 'Dragon') challenges.push('Managing powerful transformative energy');

    return challenges.slice(0, 3);
  }

  /**
   * Generate comprehensive Celtic description
   * @param {Object} treeSign - Tree sign data
   * @param {Object} animalTotem - Animal totem data
   * @param {Object} seasonalInfluence - Seasonal influence data
   * @returns {string} Celtic description
   */
  generateCelticDescription(treeSign, animalTotem, seasonalInfluence) {
    let description = `🍃 *Celtic Wisdom Analysis*\n\n`;

    description += `🌳 *Tree Sign: ${treeSign.name}*\n`;
    description += `• Dates: ${treeSign.dates}\n`;
    description += `• Meaning: ${treeSign.meaning}\n`;
    description += `• Element: ${treeSign.element}\n`;
    description += `• Planet: ${treeSign.planet}\n`;
    description += `• Tree Wisdom: ${treeSign.treeWisdom}\n\n`;

    description += `🦅 *Animal Totem: ${animalTotem.name}*\n`;
    description += `• Qualities: ${animalTotem.qualities.join(', ')}\n`;
    description += `• Element: ${animalTotem.element}\n\n`;

    description += `🌸 *Seasonal Influence: ${seasonalInfluence.season}*\n`;
    description += `• Qualities: ${seasonalInfluence.qualities.join(', ')}\n`;
    description += `• Festivals: ${seasonalInfluence.festivals.join(', ')}\n\n`;

    description += `🔮 *Druidic Guidance:*\n`;
    description += `• Life Path: ${this.calculateLifePath(treeSign, animalTotem)}\n`;
    description += `• Ritual: ${this.generateRitual(treeSign, animalTotem)}\n`;
    description += `• Affirmation: ${this.generateAffirmation(treeSign, animalTotem)}\n\n`;

    description += `💫 *Personality:*\n`;
    const traits = this.generatePersonalityTraits(treeSign, animalTotem);
    description += `• Core Traits: ${traits.coreTraits.slice(0, 4).join(', ')}\n`;
    description += `• Strengths: ${traits.strengths.join(', ')}\n`;
    description += `• Elemental Balance: ${traits.elementalBalance}`;

    return description;
  }

  /**
   * Generate Celtic daily guidance
   * @param {string} birthDate - Birth date
   * @returns {Object} Daily guidance
   */
  generateCelticGuidance(birthDate) {
    try {
      const treeSign = this.calculateTreeSign(birthDate);
      const animalTotem = this.calculateAnimalTotem(birthDate);

      return {
        treeGuidance: `Connect with ${treeSign.name} energy for ${treeSign.qualities[0].toLowerCase()}`,
        animalGuidance: `Call upon ${animalTotem.name} for ${animalTotem.qualities[0].toLowerCase()}`,
        dailyRitual: this.generateRitual(treeSign, animalTotem),
        seasonalWisdom: `Embrace ${this.calculateSeasonalInfluence(birthDate).season.toLowerCase()} energy`,
        affirmation: this.generateAffirmation(treeSign, animalTotem)
      };
    } catch (error) {
      logger.error('Error generating Celtic guidance:', error);
      return {
        treeGuidance: 'Connect with ancient tree wisdom',
        animalGuidance: 'Seek guidance from animal spirits',
        dailyRitual: 'Meditate in nature',
        seasonalWisdom: 'Flow with the wheel of the year',
        affirmation: 'I am connected to Celtic wisdom and natural magic'
      };
    }
  }
}

module.exports = new CelticReader();