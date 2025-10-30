class CelticAnalyzer {
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
      'Birch-Raven':
        'Create a cleansing ritual with birch twigs and raven feathers',
      'Oak-Bear': 'Build strength through oak meditation and bear grounding',
      'Willow-Swan': 'Flow with willow wisdom and swan grace in water rituals',
      'Hawthorn-Eagle':
        'Seek vision at hawthorn trees and eagle flight meditation'
    };

    const key = `${treeSign.name}-${animalTotem.name}`;
    return (
      rituals[key] ||
      `Connect with ${treeSign.name} energy and ${animalTotem.name} spirit through nature meditation`
    );
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
    return (
      affirmations[key] ||
      `I embody ${treeSign.qualities[0].toLowerCase()} and ${animalTotem.qualities[0].toLowerCase()} wisdom`
    );
  }

  /**
   * Calculate life path based on Celtic energies
   * @param {Object} treeSign - Tree sign data
   * @param {Object} animalTotem - Animal totem data
   * @returns {string} Life path
   */
  calculateLifePath(treeSign, animalTotem) {
    const paths = {
      'Oak-Bear':
        'Path of the Ancient Guardian - Protect and guide with strength and wisdom',
      'Birch-Stag':
        'Path of the Pure Leader - Lead with innocence and majestic authority',
      'Willow-Swan':
        'Path of the Mystic Healer - Heal through intuition and graceful transformation',
      'Hawthorn-Raven':
        'Path of the Faerie Mage - Weave magic and transformation',
      'Ash-Salmon':
        'Path of the Wisdom Keeper - Bridge worlds with ancient knowledge',
      'Rowan-Eagle':
        'Path of the Visionary Protector - See clearly and defend sacred spaces'
    };

    const key = `${treeSign.name}-${animalTotem.name}`;
    return (
      paths[key] ||
      `Path of the ${treeSign.name} ${animalTotem.name} - Embody ${treeSign.qualities[0]} through ${animalTotem.qualities[0]}`
    );
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
    if (treeSign.name === 'Oak') {
      strengths.push('Enduring strength and leadership');
    }
    if (treeSign.name === 'Birch') {
      strengths.push('Pure intention and renewal');
    }
    if (treeSign.name === 'Willow') {
      strengths.push('Intuitive healing and flexibility');
    }

    // Animal-based strengths
    if (animalTotem.name === 'Bear') {
      strengths.push('Protective power and inner wisdom');
    }
    if (animalTotem.name === 'Raven') {
      strengths.push('Magical insight and transformation');
    }
    if (animalTotem.name === 'Eagle') {
      strengths.push('Spiritual vision and freedom');
    }

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
    if (treeSign.name === 'Elder') {
      challenges.push('Embracing necessary transformation');
    }
    if (treeSign.name === 'Holly') {
      challenges.push('Balancing defense with openness');
    }

    // Animal-based challenges
    if (animalTotem.name === 'Wolf') {
      challenges.push('Balancing independence with social bonds');
    }
    if (animalTotem.name === 'Dragon') {
      challenges.push('Managing powerful transformative energy');
    }

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
    let description = '🍃 *Celtic Wisdom Analysis*\n\n';

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

    description += '🔮 *Druidic Guidance:*\n';
    description += `• Life Path: ${this.calculateLifePath(treeSign, animalTotem)}\n`;
    description += `• Ritual: ${this.generateRitual(treeSign, animalTotem)}\n`;
    description += `• Affirmation: ${this.generateAffirmation(treeSign, animalTotem)}\n\n`;

    description += '💫 *Personality:*\n';
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
  generateCelticGuidance(treeSign, animalTotem) {
    return {
      treeGuidance: `Connect with ${treeSign.name} energy for ${treeSign.qualities[0].toLowerCase()}`,
      animalGuidance: `Call upon ${animalTotem.name} for ${animalTotem.qualities[0].toLowerCase()}`,
      dailyRitual: this.generateRitual(treeSign, animalTotem),
      seasonalWisdom: 'Harmonize with the natural cycles around you',
      affirmation: this.generateAffirmation(treeSign, animalTotem)
    };
  }
}

module.exports = { CelticAnalyzer };