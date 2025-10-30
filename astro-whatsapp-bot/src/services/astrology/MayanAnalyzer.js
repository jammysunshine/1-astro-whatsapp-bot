class MayanAnalyzer {
  /**
   * Analyze personality based on Tzolk'in and Haab
   * @param {Object} tzolkin - Tzolk'in data
   * @param {Object} haab - Haab data
   * @returns {Object} Personality analysis
   */
  analyzePersonality(tzolkin, haab) {
    const traits = [...tzolkin.qualities, ...haab.qualities];
    const uniqueTraits = [...new Set(traits)];

    // Determine dominant element
    const elements = { Fire: 0, Water: 0, Air: 0, Earth: 0 };
    uniqueTraits.forEach(trait => {
      if (tzolkin.daySign.element) {
        elements[tzolkin.daySign.element]++;
      }
    });

    const dominantElement = Object.entries(elements).reduce((a, b) =>
      (elements[a[0]] > elements[b[0]] ? a : b)
    )[0];

    return {
      traits: uniqueTraits.slice(0, 6),
      dominantElement,
      strengths: this.calculateStrengths(tzolkin, haab),
      challenges: this.calculateChallenges(tzolkin, haab),
      lifePurpose: this.calculateLifePurpose(tzolkin, haab)
    };
  }

  /**
   * Calculate life path based on Tzolk'in
   * @param {Object} tzolkin - Tzolk'in data
   * @returns {string} Life path
   */
  calculateLifePath(tzolkin) {
    const paths = {
      1: 'Path of the Initiator - You are here to start new cycles and bring fresh energy',
      2: 'Path of the Stabilizer - You are here to create balance and harmony',
      3: 'Path of the Communicator - You are here to share wisdom and connect people',
      4: 'Path of the Builder - You are here to create structure and foundation',
      5: 'Path of the Catalyst - You are here to empower others and create change',
      6: 'Path of the Organizer - You are here to bring order and equality',
      7: 'Path of the Guide - You are here to inspire and channel divine energy',
      8: 'Path of the Harmonizer - You are here to model integrity and create unity',
      9: 'Path of the Realizer - You are here to manifest intentions and pulse with life',
      10: 'Path of the Producer - You are here to perfect and manifest abundance',
      11: 'Path of the Liberator - You are here to release old patterns and free others',
      12: 'Path of the Unifier - You are here to cooperate and universalize wisdom',
      13: 'Path of the Enlightener - You are here to transcend and bring presence'
    };

    return (
      paths[
        tzolkin.tone.name === 'Magnetic' ?
          1 :
          parseInt(
            Object.keys(this.tones).find(
              key => this.tones[key].name === tzolkin.tone.name
            )
          )
      ] ||
      'Path of the Seeker - You are here to discover and share ancient wisdom'
    );
  }

  /**
   * Generate daily guidance based on Tzolk'in
   * @param {Object} tzolkin - Tzolk'in data
   * @returns {Object} Daily guidance
   */
  generateDailyGuidance(tzolkin) {
    return {
      focus: `Today, embrace the energy of ${tzolkin.daySign.name} and the ${tzolkin.tone.name} tone`,
      activities: this.getDayActivities(tzolkin),
      meditation: `Meditate on ${tzolkin.daySign.meaning} and the qualities of ${tzolkin.tone.meaning}`,
      affirmation: this.generateAffirmation(tzolkin)
    };
  }

  /**
   * Get recommended activities for the day
   * @param {Object} tzolkin - Tzolk'in data
   * @returns {Array} Recommended activities
   */
  getDayActivities(tzolkin) {
    const activities = {
      Imix: ['Creative projects', 'Nurturing activities', 'Water-related work'],
      Ik: ['Communication', 'Writing', 'Wind or air activities'],
      Akbal: ['Dream work', 'Meditation', 'Night activities'],
      Kan: ['Financial planning', 'Healing work', 'Prosperity rituals'],
      Chicchan: [
        'Physical activities',
        'Sensual experiences',
        'Survival skills'
      ],
      Cimi: ['Release rituals', 'Transformation work', 'Closure activities'],
      Manik: ['Healing practices', 'Cooperative work', 'Skill development'],
      Lamat: ['Creative expression', 'Fertility rituals', 'Artistic pursuits'],
      Muluc: ['Emotional work', 'Purification rituals', 'Offerings'],
      Oc: ['Loyalty building', 'Guidance work', 'Protective activities'],
      Chuen: ['Playful activities', 'Creative projects', 'Magical work'],
      Eb: ['Service work', 'Community activities', 'Wisdom sharing'],
      Ben: ['Leadership activities', 'Growth work', 'Authority roles'],
      Ix: ['Shamanic work', 'Mystical practices', 'Inner strength building'],
      Men: ['Vision quests', 'Perspective work', 'Freedom activities'],
      Cib: ['Ancestral work', 'Wisdom seeking', 'Transition rituals'],
      Caban: ['Movement practices', 'Earth work', 'Synchronicity observation'],
      Eznab: ['Truth seeking', 'Justice work', 'Reflection practices'],
      Cauac: ['Cleansing rituals', 'Energy work', 'Renewal activities'],
      Ahau: ['Leadership', 'Enlightenment work', 'Solar practices']
    };

    return (
      activities[tzolkin.daySign.name] || [
        'Spiritual practices',
        'Self-reflection',
        'Community work'
      ]
    );
  }

  /**
   * Generate affirmation based on Tzolk'in
   * @param {Object} tzolkin - Tzolk'in data
   * @returns {string} Affirmation
   */
  generateAffirmation(tzolkin) {
    const affirmations = {
      Imix: 'I embrace my creative potential and nurture new beginnings',
      Ik: 'I communicate with clarity and adapt to change',
      Akbal: 'I trust my intuition and honor my dreams',
      Kan: 'I attract abundance and heal with divine energy',
      Chicchan: 'I honor my instincts and embrace life\'s vitality',
      Cimi: 'I embrace change and trust the cycle of transformation',
      Manik: 'I heal myself and others with skillful cooperation',
      Lamat: 'I create abundance and express my artistic soul',
      Muluc: 'I flow with emotional wisdom and make sacred offerings',
      Oc: 'I am loyal, guided, and protective of what matters',
      Chuen: 'I create magic through playfulness and ingenuity',
      Eb: 'I serve humanity with wisdom and walk my path',
      Ben: 'I lead with authority and grow toward divine connection',
      Ix: 'I embrace my inner magic and shamanic power',
      Men: 'I see with eagle vision and embrace spiritual freedom',
      Cib: 'I honor ancestral wisdom and guide transitions',
      Caban: 'I move with earth wisdom and observe synchronicity',
      Eznab: 'I reflect truth and wield justice with clarity',
      Cauac: 'I cleanse and renew with storm energy',
      Ahau: 'I shine with divine light and enlightened authority'
    };

    return (
      affirmations[tzolkin.daySign.name] ||
      'I walk the sacred path of the Mayan calendar'
    );
  }

  /**
   * Calculate strengths based on Mayan energies
   * @param {Object} tzolkin - Tzolk'in data
   * @param {Object} haab - Haab data
   * @returns {Array} Strengths
   */
  calculateStrengths(tzolkin, haab) {
    const strengths = [];

    // Tone-based strengths
    if (tzolkin.tone.name === 'Magnetic') {
      strengths.push('Natural leadership and attraction');
    }
    if (tzolkin.tone.name === 'Lunar') {
      strengths.push('Balance and cooperation');
    }
    if (tzolkin.tone.name === 'Electric') {
      strengths.push('Communication and service');
    }
    if (tzolkin.tone.name === 'Self-Existing') {
      strengths.push('Stability and definition');
    }

    // Day sign-based strengths
    if (tzolkin.daySign.name === 'Ahau') {
      strengths.push('Divine authority and enlightenment');
    }
    if (tzolkin.daySign.name === 'Imix') {
      strengths.push('Creative potential and nurturing');
    }
    if (tzolkin.daySign.name === 'Ix') {
      strengths.push('Inner magic and shamanic wisdom');
    }

    return strengths.slice(0, 4);
  }

  /**
   * Calculate challenges based on Mayan energies
   * @param {Object} tzolkin - Tzolk'in data
   * @param {Object} haab - Haab data
   * @returns {Array} Challenges
   */
  calculateChallenges(tzolkin, haab) {
    const challenges = [];

    // Tone-based challenges
    if (tzolkin.tone.name === 'Spectral') {
      challenges.push('Learning to release and let go');
    }
    if (tzolkin.tone.name === 'Crystal') {
      challenges.push('Balancing cooperation with personal needs');
    }

    // Day sign-based challenges
    if (tzolkin.daySign.name === 'Cimi') {
      challenges.push('Embracing necessary endings');
    }
    if (tzolkin.daySign.name === 'Cauac') {
      challenges.push('Managing intense transformative energy');
    }

    // Haab-based challenges
    if (haab.isWayeb) {
      challenges.push('Navigating the five unlucky days with wisdom');
    }

    return challenges.slice(0, 3);
  }

  /**
   * Calculate life purpose based on Mayan energies
   * @param {Object} tzolkin - Tzolk'in data
   * @param {Object} haab - Haab data
   * @returns {string} Life purpose
   */
  calculateLifePurpose(tzolkin, haab) {
    const purposes = {
      Ahau: 'To shine divine light and lead with enlightened authority',
      Imix: 'To nurture creation and bring forth new potential',
      Ix: 'To embrace inner magic and guide others shamanically',
      Men: 'To see with spiritual vision and embrace freedom',
      Cib: 'To honor ancestral wisdom and guide transitions',
      Ben: 'To grow in divine connection and lead with authority'
    };

    return (
      purposes[tzolkin.daySign.name] ||
      `To embody the wisdom of ${tzolkin.daySign.name} and contribute to cosmic harmony`
    );
  }

  /**
   * Generate comprehensive Mayan description
   * @param {Object} tzolkin - Tzolk'in data
   * @param {Object} haab - Haab data
   * @param {Object} yearBearer - Year bearer data
   * @returns {string} Mayan description
   */
  generateMayanDescription(tzolkin, haab, yearBearer) {
    let description = '🗓️ *Mayan Calendar Analysis*\n\n';

    description += '🔮 *Tzolk\'in (Sacred Calendar):*\n';
    description += `• Kin: ${tzolkin.kin} - ${tzolkin.fullName}\n`;
    description += `• Tone: ${tzolkin.tone.name} (${tzolkin.tone.meaning})\n`;
    description += `• Day Sign: ${tzolkin.daySign.name} (${tzolkin.daySign.meaning})\n`;
    description += `• Element: ${tzolkin.daySign.element}\n`;
    description += `• Direction: ${tzolkin.daySign.direction}\n\n`;

    description += '☀️ *Haab (Solar Calendar):*\n';
    description += `• Date: ${haab.fullName}\n`;
    description += `• Month: ${haab.monthName} (${haab.meaning})\n`;
    description += `• Qualities: ${haab.qualities.join(', ')}\n\n`;

    description += '🌟 *Year Bearer:*\n';
    description += `• Sign: ${yearBearer.sign}\n`;
    description += `• Meaning: ${yearBearer.meaning}\n`;
    description += `• Year: ${yearBearer.year}\n\n`;

    description += '💫 *Personality Insights:*\n';
    description += `• Key Traits: ${tzolkin.qualities.slice(0, 4).join(', ')}\n`;
    description += `• Life Path: ${this.calculateLifePath(tzolkin)}\n\n`;

    description += '📅 *Daily Guidance:*\n';
    description += `• Focus: ${tzolkin.daySign.qualities[0]}\n`;
    description += `• Activities: ${this.getDayActivities(tzolkin).slice(0, 2).join(', ')}\n`;
    description += `• Affirmation: ${this.generateAffirmation(tzolkin)}`;

    return description;
  }
}

module.exports = { MayanAnalyzer };