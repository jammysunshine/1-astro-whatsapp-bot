const logger = require('../../utils/logger');

/**
 * Mayan Astrology Reader
 * Provides interpretations based on the Mayan calendar systems: Tzolk'in (260-day) and Haab (365-day)
 */

class MayanReader {
  constructor() {
    logger.info('Module: MayanReader loaded.');
    // Tzolk'in day signs (20 signs)
    this.daySigns = {
      1: { name: 'Imix', meaning: 'Crocodile/Primal Waters', element: 'Water', direction: 'East', qualities: ['Creation', 'Instinct', 'Potential', 'Nurturing'] },
      2: { name: 'Ik', meaning: 'Wind', element: 'Air', direction: 'North', qualities: ['Communication', 'Spirit', 'Breath', 'Change'] },
      3: { name: 'Akbal', meaning: 'Night/House', element: 'Earth', direction: 'West', qualities: ['Dreams', 'Mystery', 'Intuition', 'Protection'] },
      4: { name: 'Kan', meaning: 'Lizard/Serpent', element: 'Fire', direction: 'South', qualities: ['Prosperity', 'Abundance', 'Transformation', 'Healing'] },
      5: { name: 'Chicchan', meaning: 'Serpent', element: 'Fire', direction: 'East', qualities: ['Instinct', 'Survival', 'Life Force', 'Sensuality'] },
      6: { name: 'Cimi', meaning: 'Death/Transformation', element: 'Water', direction: 'North', qualities: ['Change', 'Release', 'Rebirth', 'Closure'] },
      7: { name: 'Manik', meaning: 'Deer/Hand', element: 'Earth', direction: 'West', qualities: ['Healing', 'Cooperation', 'Skill', 'Craftsmanship'] },
      8: { name: 'Lamat', meaning: 'Rabbit/Star', element: 'Air', direction: 'South', qualities: ['Abundance', 'Fertility', 'Art', 'Multiplication'] },
      9: { name: 'Muluc', meaning: 'Water/Offerings', element: 'Water', direction: 'East', qualities: ['Purification', 'Flow', 'Emotions', 'Sacrifice'] },
      10: { name: 'Oc', meaning: 'Dog/Loyalty', element: 'Earth', direction: 'North', qualities: ['Loyalty', 'Guidance', 'Friendship', 'Protection'] },
      11: { name: 'Chuen', meaning: 'Monkey/Artist', element: 'Air', direction: 'West', qualities: ['Creativity', 'Playfulness', 'Ingenuity', 'Magic'] },
      12: { name: 'Eb', meaning: 'Road/Human', element: 'Fire', direction: 'South', qualities: ['Service', 'Humanity', 'Wisdom', 'Path'] },
      13: { name: 'Ben', meaning: 'Reed/Sky', element: 'Air', direction: 'East', qualities: ['Authority', 'Leadership', 'Divine Connection', 'Growth'] },
      14: { name: 'Ix', meaning: 'Jaguar/Magic', element: 'Earth', direction: 'North', qualities: ['Magic', 'Mystery', 'Shamanism', 'Inner Strength'] },
      15: { name: 'Men', meaning: 'Eagle/Vision', element: 'Fire', direction: 'West', qualities: ['Vision', 'Perspective', 'Freedom', 'Spirit'] },
      16: { name: 'Cib', meaning: 'Vulture/Owl', element: 'Air', direction: 'South', qualities: ['Wisdom', 'Death', 'Transition', 'Ancestors'] },
      17: { name: 'Caban', meaning: 'Earthquake/Earth', element: 'Earth', direction: 'East', qualities: ['Movement', 'Synchronicity', 'Change', 'Foundation'] },
      18: { name: 'Eznab', meaning: 'Knife/Mirror', element: 'Water', direction: 'North', qualities: ['Truth', 'Reflection', 'Justice', 'Clarity'] },
      19: { name: 'Cauac', meaning: 'Storm/Rain', element: 'Fire', direction: 'West', qualities: ['Cleansing', 'Renewal', 'Energy', 'Catalysis'] },
      20: { name: 'Ahau', meaning: 'Sun/Light', element: 'Air', direction: 'South', qualities: ['Enlightenment', 'Kingship', 'Divine Authority', 'Illumination'] }
    };

    // Tones (numbers 1-13) and their meanings
    this.tones = {
      1: { name: 'Magnetic', meaning: 'Unify, attract, purpose', qualities: ['Leadership', 'New beginnings', 'Magnetic attraction'] },
      2: { name: 'Lunar', meaning: 'Polarize, stabilize, challenge', qualities: ['Cooperation', 'Balance', 'Sensitivity'] },
      3: { name: 'Electric', meaning: 'Activate, bond, service', qualities: ['Creativity', 'Communication', 'Service'] },
      4: { name: 'Self-Existing', meaning: 'Define, measure, form', qualities: ['Stability', 'Definition', 'Form'] },
      5: { name: 'Overtone', meaning: 'Empower, command, radiance', qualities: ['Empowerment', 'Command', 'Radiance'] },
      6: { name: 'Rhythmic', meaning: 'Organize, balance, equality', qualities: ['Organization', 'Balance', 'Equality'] },
      7: { name: 'Resonant', meaning: 'Inspire, attune, channel', qualities: ['Inspiration', 'Attunement', 'Guidance'] },
      8: { name: 'Galactic', meaning: 'Harmonize, model, integrity', qualities: ['Integrity', 'Modeling', 'Harmony'] },
      9: { name: 'Solar', meaning: 'Pulse, realize, intention', qualities: ['Intention', 'Realization', 'Pulse'] },
      10: { name: 'Planetary', meaning: 'Perfect, manifest, production', qualities: ['Manifestation', 'Production', 'Perfection'] },
      11: { name: 'Spectral', meaning: 'Dissolve, release, liberation', qualities: ['Liberation', 'Release', 'Dissolution'] },
      12: { name: 'Crystal', meaning: 'Dedicate, universalize, cooperation', qualities: ['Cooperation', 'Universalization', 'Dedication'] },
      13: { name: 'Cosmic', meaning: 'Transcend, enlighten, presence', qualities: ['Enlightenment', 'Transcendence', 'Presence'] }
    };

    // Haab months (18 months + 5 unlucky days)
    this.haabMonths = {
      1: { name: 'Pop', meaning: 'Mat', qualities: ['New beginnings', 'Planting', 'Initiation'] },
      2: { name: 'Wo', meaning: 'Black Storm', qualities: ['Transformation', 'Cleansing', 'Change'] },
      3: { name: 'Sip', meaning: 'Red Storm', qualities: ['Purification', 'Renewal', 'Energy'] },
      4: { name: 'Sotz\'', meaning: 'Bat', qualities: ['Sovereignty', 'Leadership', 'Authority'] },
      5: { name: 'Sek', meaning: 'Death', qualities: ['Transformation', 'Release', 'Rebirth'] },
      6: { name: 'Xul', meaning: 'Dog', qualities: ['Loyalty', 'Guidance', 'Protection'] },
      7: { name: 'Yaxkin', meaning: 'New Sun', qualities: ['Enlightenment', 'New beginnings', 'Solar energy'] },
      8: { name: 'Mol', meaning: 'Water', qualities: ['Flow', 'Emotions', 'Adaptation'] },
      9: { name: 'Chen', meaning: 'Black Storm', qualities: ['Transformation', 'Cleansing', 'Change'] },
      10: { name: 'Yax', meaning: 'Green Storm', qualities: ['Growth', 'Abundance', 'Nature'] },
      11: { name: 'Sak', meaning: 'White Storm', qualities: ['Purification', 'Clarity', 'Truth'] },
      12: { name: 'Keh', meaning: 'Red Storm', qualities: ['Energy', 'Action', 'Catalysis'] },
      13: { name: 'Mak', meaning: 'Enclosed', qualities: ['Containment', 'Protection', 'Boundaries'] },
      14: { name: 'Kankin', meaning: 'Yellow Sun', qualities: ['Ripening', 'Maturity', 'Harvest'] },
      15: { name: 'Muan', meaning: 'Owl', qualities: ['Wisdom', 'Night', 'Mystery'] },
      16: { name: 'Pax', meaning: 'Planting Time', qualities: ['Sowing seeds', 'Planning', 'Preparation'] },
      17: { name: 'Kayab', meaning: 'Turtle', qualities: ['Stability', 'Patience', 'Endurance'] },
      18: { name: 'Kumku', meaning: 'Granary', qualities: ['Storage', 'Abundance', 'Preservation'] },
      19: { name: 'Wayeb', meaning: 'Five Unlucky Days', qualities: ['Caution', 'Reflection', 'Preparation'] }
    };

    // Year bearers and their significance
    this.yearBearers = {
      Ik: { meaning: 'Wind Year', qualities: ['Change', 'Communication', 'Adaptability'] },
      Manik: { meaning: 'Deer Year', qualities: ['Healing', 'Cooperation', 'Skill'] },
      Eb: { meaning: 'Human Year', qualities: ['Service', 'Wisdom', 'Community'] },
      Caban: { meaning: 'Earth Year', qualities: ['Stability', 'Foundation', 'Movement'] }
    };
  }

  /**
   * Generate Mayan birth chart analysis
   * @param {Object} birthData - Birth data object
   * @returns {Object} Mayan analysis
   */
  generateMayanChart(birthData) {
    try {
      const { birthDate, birthTime, name } = birthData;

      // Calculate Tzolk'in date
      const tzolkin = this.calculateTzolkIn(birthDate);

      // Calculate Haab date
      const haab = this.calculateHaab(birthDate);

      // Calculate year bearer
      const yearBearer = this.calculateYearBearer(birthDate);

      // Generate personality analysis
      const personality = this.analyzePersonality(tzolkin, haab);

      // Calculate life path
      const lifePath = this.calculateLifePath(tzolkin);

      // Generate daily guidance
      const dailyGuidance = this.generateDailyGuidance(tzolkin);

      return {
        name,
        tzolkin,
        haab,
        yearBearer,
        personality,
        lifePath,
        dailyGuidance,
        mayanDescription: this.generateMayanDescription(tzolkin, haab, yearBearer)
      };
    } catch (error) {
      logger.error('Error generating Mayan chart:', error);
      return {
        error: 'Unable to generate Mayan analysis at this time',
        fallback: 'The Mayan calendar holds ancient wisdom for your journey'
      };
    }
  }

  /**
   * Calculate Tzolk'in date (260-day sacred calendar)
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @returns {Object} Tzolk'in date information
   */
  calculateTzolkIn(birthDate) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);

      // Create date object
      const birth = new Date(year, month - 1, day);

      // Mayan calendar correlation (using Goodman-Martinez-Thompson correlation)
      // Base date: July 26, 2023 = 4 Ahau (Mayan date)
      const baseDate = new Date(2023, 6, 26); // July 26, 2023
      const baseKin = 4; // 4 Ahau
      const baseDaySign = 20; // Ahau

      // Calculate days since base date
      const daysDiff = Math.floor((birth - baseDate) / (1000 * 60 * 60 * 24));

      // Calculate current kin
      const currentKin = (baseKin + daysDiff) % 260;
      const kin = currentKin === 0 ? 260 : currentKin;

      // Calculate tone (1-13)
      const tone = ((kin - 1) % 13) + 1;

      // Calculate day sign (1-20)
      const daySign = ((kin - 1) % 20) + 1;

      return {
        kin,
        tone: this.tones[tone],
        daySign: this.daySigns[daySign],
        fullName: `${tone} ${this.daySigns[daySign].name}`,
        meaning: `${this.tones[tone].name} ${this.daySigns[daySign].name}`,
        qualities: [...this.tones[tone].qualities, ...this.daySigns[daySign].qualities]
      };
    } catch (error) {
      logger.error('Error calculating Tzolk\'in:', error);
      return {
        kin: 1,
        tone: this.tones[1],
        daySign: this.daySigns[1],
        fullName: '1 Imix',
        meaning: 'Magnetic Imix',
        qualities: ['Creation', 'New beginnings']
      };
    }
  }

  /**
   * Calculate Haab date (365-day solar calendar)
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @returns {Object} Haab date information
   */
  calculateHaab(birthDate) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);

      // Create date object
      const birth = new Date(year, month - 1, day);

      // Calculate day of year (1-365)
      const startOfYear = new Date(year, 0, 1);
      const dayOfYear = Math.floor((birth - startOfYear) / (1000 * 60 * 60 * 24)) + 1;

      // Haab month (1-19, where 19 is Wayeb)
      const haabMonth = Math.floor((dayOfYear - 1) / 20) + 1;
      const dayInMonth = ((dayOfYear - 1) % 20) + 1;

      const monthData = this.haabMonths[haabMonth];

      return {
        month: haabMonth,
        day: dayInMonth,
        monthName: monthData.name,
        meaning: monthData.meaning,
        qualities: monthData.qualities,
        fullName: `${dayInMonth} ${monthData.name}`,
        isWayeb: haabMonth === 19
      };
    } catch (error) {
      logger.error('Error calculating Haab:', error);
      return {
        month: 1,
        day: 1,
        monthName: 'Pop',
        meaning: 'Mat',
        qualities: ['New beginnings'],
        fullName: '1 Pop',
        isWayeb: false
      };
    }
  }

  /**
   * Calculate year bearer
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @returns {Object} Year bearer information
   */
  calculateYearBearer(birthDate) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);

      // Year bearer is determined by the Tzolk'in day sign of the first day of the year
      // Simplified calculation
      const yearStart = new Date(year, 0, 1);
      const tzolkin = this.calculateTzolkIn(`${yearStart.getDate().toString().padStart(2, '0')}/${(yearStart.getMonth() + 1).toString().padStart(2, '0')}/${year}`);

      // Map to year bearer signs
      const yearBearerSigns = ['Ik', 'Manik', 'Eb', 'Caban'];
      const yearBearerIndex = (year - 2000) % 4; // Simplified cycle
      const yearBearerName = yearBearerSigns[yearBearerIndex];

      return {
        sign: yearBearerName,
        meaning: this.yearBearers[yearBearerName].meaning,
        qualities: this.yearBearers[yearBearerName].qualities,
        year
      };
    } catch (error) {
      logger.error('Error calculating year bearer:', error);
      return {
        sign: 'Ik',
        meaning: 'Wind Year',
        qualities: ['Change', 'Communication'],
        year: new Date().getFullYear()
      };
    }
  }

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
      if (tzolkin.daySign.element) { elements[tzolkin.daySign.element]++; }
    });

    const dominantElement = Object.entries(elements).reduce((a, b) => (elements[a[0]] > elements[b[0]] ? a : b))[0];

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

    return paths[tzolkin.tone.name === 'Magnetic' ? 1 : parseInt(Object.keys(this.tones).find(key => this.tones[key].name === tzolkin.tone.name))] || 'Path of the Seeker - You are here to discover and share ancient wisdom';
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
      Chicchan: ['Physical activities', 'Sensual experiences', 'Survival skills'],
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

    return activities[tzolkin.daySign.name] || ['Spiritual practices', 'Self-reflection', 'Community work'];
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

    return affirmations[tzolkin.daySign.name] || 'I walk the sacred path of the Mayan calendar';
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
    if (tzolkin.tone.name === 'Magnetic') { strengths.push('Natural leadership and attraction'); }
    if (tzolkin.tone.name === 'Lunar') { strengths.push('Balance and cooperation'); }
    if (tzolkin.tone.name === 'Electric') { strengths.push('Communication and service'); }
    if (tzolkin.tone.name === 'Self-Existing') { strengths.push('Stability and definition'); }

    // Day sign-based strengths
    if (tzolkin.daySign.name === 'Ahau') { strengths.push('Divine authority and enlightenment'); }
    if (tzolkin.daySign.name === 'Imix') { strengths.push('Creative potential and nurturing'); }
    if (tzolkin.daySign.name === 'Ix') { strengths.push('Inner magic and shamanic wisdom'); }

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
    if (tzolkin.tone.name === 'Spectral') { challenges.push('Learning to release and let go'); }
    if (tzolkin.tone.name === 'Crystal') { challenges.push('Balancing cooperation with personal needs'); }

    // Day sign-based challenges
    if (tzolkin.daySign.name === 'Cimi') { challenges.push('Embracing necessary endings'); }
    if (tzolkin.daySign.name === 'Cauac') { challenges.push('Managing intense transformative energy'); }

    // Haab-based challenges
    if (haab.isWayeb) { challenges.push('Navigating the five unlucky days with wisdom'); }

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

    return purposes[tzolkin.daySign.name] || `To embody the wisdom of ${tzolkin.daySign.name} and contribute to cosmic harmony`;
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

module.exports = new MayanReader();
