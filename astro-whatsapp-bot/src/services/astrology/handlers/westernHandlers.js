const logger = require('../../../utils/logger');

/**
 * Get sun sign from birth date
 * @param {string} birthDate - Birth date in DDMMYY or DDMMYYYY format
 * @returns {string} Sun sign name
 */
const getSunSign = birthDate => {
  if (!birthDate) {
    return 'Unknown';
  }

  // Extract day and month from birth date
  const birthDateStr = birthDate.toString();
  let day;
  let month;

  if (birthDateStr.length === 6) {
    // DDMMYY format
    day = parseInt(birthDateStr.substring(0, 2));
    month = parseInt(birthDateStr.substring(2, 4));
  } else if (birthDateStr.length === 8) {
    // DDMMYYYY format
    day = parseInt(birthDateStr.substring(0, 2));
    month = parseInt(birthDateStr.substring(2, 4));
  } else if (birthDateStr.includes('-')) {
    // DD-MM-YY or DD-MM-YYYY format
    const parts = birthDateStr.split('-');
    day = parseInt(parts[0]);
    month = parseInt(parts[1]);
  } else {
    return 'Unknown';
  }

  // Calculate zodiac sign based on month and day
  const signs = {
    Capricorn: [1, 1, 19],
    Aquarius: [1, 20, 31],
    Pisces: [2, 1, 18],
    Aries: [3, 1, 20],
    Taurus: [3, 21, 31],
    Gemini: [4, 1, 20],
    Cancer: [5, 1, 22],
    Leo: [5, 23, 31],
    Virgo: [6, 1, 22],
    Libra: [6, 23, 31],
    Scorpio: [7, 1, 22],
    Sagittarius: [7, 23, 31],
    Capricorn: [8, 1, 22],
    Aquarius: [8, 23, 31],
    Pisces: [9, 1, 22],
    Aries: [10, 1, 23],
    Taurus: [10, 24, 31],
    Gemini: [11, 1, 21],
    Cancer: [11, 22, 30],
    Leo: [12, 1, 21],
    Sagittarius: [12, 22, 31]
  };

  for (const [sign, [sigMonth, startDay, endDay]] of Object.entries(signs)) {
    if (month === sigMonth && day >= startDay && day <= endDay) {
      return sign;
    }
  }

  return 'Unknown';
};

/**
 * Handle daily horoscope requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleHoroscope = (message, user) => {
  if (!message.includes('horoscope') && !message.includes('zodiac')) {
    return null;
  }

  // Check if user has birth data
  if (!user.birthDate) {
    return '🌟 Daily Horoscope\n\n👤 I need your birth date to provide your daily horoscope.\n\nSend format: DDMMYY or DDMMYYYY\nExample: 150691 (June 15, 1991)';
  }

  const sunSign = getSunSign(user.birthDate);

  // Generate daily insights based on sun sign
  const dailyInsights = generateDailyInsights(sunSign);

  return `🌟 Daily Horoscope for ${sunSign}\n\n${dailyInsights.general}\n\n💼 Career: ${dailyInsights.career}\n❤️ Love: ${dailyInsights.love}\n💰 Finance: ${dailyInsights.finance}\n🏥 Health: ${dailyInsights.health}\n\nLucky numbers: ${dailyInsights.numbers}`;
};

/**
 * Generate daily horoscope insights for a sign
 * @param {string} sign - Zodiac sign
 * @returns {Object} Daily insights
 */
const generateDailyInsights = sign => {
  const insights = {
    Aries: {
      general: 'Today brings unexpected opportunities and new beginnings.',
      career: 'Be bold in communication',
      love: 'Rekindle old connections',
      finance: 'Opportunities from technology',
      health: 'Focus on fitness',
      numbers: '3, 8, 15'
    },
    Taurus: {
      general: 'Stability and persistence will serve you well today.',
      career: 'Focus on long-term goals',
      love: 'Quality time matters',
      finance: 'Conservative approach pays',
      health: 'Rest and recovery',
      numbers: '1, 4, 12'
    },
    Gemini: {
      general: 'Communication flows freely with important insights.',
      career: 'Networking brings success',
      love: 'Intellectual connection grows',
      finance: 'Flexible investments',
      health: 'Mental clarity improves',
      numbers: '5, 7, 22'
    },
    Cancer: {
      general: 'Emotions run deep - trust your intuition.',
      career: 'Home-based opportunities',
      love: 'Family comes first',
      finance: 'Security focused',
      health: 'Emotional balance',
      numbers: '2, 9, 11'
    },
    Leo: {
      general: 'Your charisma shines brightly today.',
      career: 'Leadership opportunities',
      love: 'Romantic gestures succeed',
      finance: 'Investment confidence grows',
      health: 'Creative energy boosts',
      numbers: '1, 6, 10'
    },
    Virgo: {
      general: 'Attention to detail brings excellent results.',
      career: 'Service-based projects excel',
      love: 'Thoughtful acts appreciated',
      finance: 'Analytical approach wins',
      health: 'Diet optimization',
      numbers: '3, 5, 14'
    },
    Libra: {
      general: 'Harmony and balance guide your decisions.',
      career: 'Partnership opportunities',
      love: 'Diplomatic approach works',
      finance: 'Balanced portfolio',
      health: 'Wellness through beauty',
      numbers: '2, 7, 16'
    },
    Scorpio: {
      general: 'Deep transformations and insights emerge.',
      career: 'Individual projects succeed',
      love: 'Intense connections grow',
      finance: 'Strategic investments',
      health: 'Energy regeneration',
      numbers: '8, 9, 18'
    },
    Sagittarius: {
      general: 'Adventure and learning expand your horizons.',
      career: 'Educational opportunities',
      love: 'Spontaneous romance',
      finance: 'Travel-related gains',
      health: 'Movement and exercise',
      numbers: '3, 6, 19'
    },
    Capricorn: {
      general: 'Ambitious plans receive serious consideration.',
      career: 'Administrative success',
      love: 'Committed relationships grow',
      finance: 'Long-term planning',
      health: 'Structural health foundation',
      numbers: '4, 8, 13'
    },
    Aquarius: {
      general: 'Innovative ideas and community connections flourish.',
      career: 'Team collaboration excels',
      love: 'Unique relationships thrive',
      finance: 'Tech investment potential',
      health: 'Progressive treatments',
      numbers: '4, 7, 17'
    },
    Pisces: {
      general: 'Intuition and creativity flow abundantly.',
      career: 'Creative fields glow',
      love: 'Dreamy connections deepen',
      finance: 'Supportive investments',
      health: 'Spiritual healing',
      numbers: '3, 9, 12'
    }
  };

  return (
    insights[sign] || {
      general: 'Today brings balanced energies and steady progress.',
      career: 'Focus on meaningful tasks',
      love: 'Stability strengthens bonds',
      finance: 'Conservative approach works',
      health: 'Wellness through routine',
      numbers: '1, 2, 3'
    }
  );
};

/**
 * Handle numerology analysis requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleNumerology = (message, user) => {
  if (!message.includes('numerology') && !message.includes('numbers')) {
    return null;
  }

  if (!user.birthDate && !user.name) {
    return '🔢 Numerology Analysis\n\n👤 I need your birth date to calculate numerology.\n\nSend format: DDMMYY or DDMMYYYY\nExample: 150691 (June 15, 1991)';
  }

  const lifePathNumber = calculateLifePathNumber(user.birthDate);
  const nameNumber = user.name ? calculateNameNumber(user.name) : null;
  const insights = getNumerologyInsights(lifePathNumber, nameNumber);

  return `🔢 Numerology Analysis\n\n📊 Life Path Number: ${lifePathNumber}\n${insights.lifePath}${nameNumber ? `\n👤 Name Number: ${nameNumber}\n${insights.name}\n` : ''}\n🎯 Personality: ${insights.personality}`;
};

/**
 * Calculate life path number from birth date
 * @param {string} birthDate - Birth date
 * @returns {number} Life path number (1-9)
 */
const calculateLifePathNumber = birthDate => {
  if (!birthDate) {
    return 1;
  }

  const digits = birthDate.toString().replace(/\D/g, '');
  let sum = digits.split('').reduce((acc, digit) => acc + parseInt(digit), 0);

  // Reduce to single digit (except master numbers 11, 22, 33)
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum
      .toString()
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit), 0);
  }

  return sum;
};

/**
 * Calculate name number from name
 * @param {string} name - Person's name
 * @returns {number} Name number (1-9)
 */
const calculateNameNumber = name => {
  if (!name) {
    return 1;
  }

  const letterValues = {
    a: 1,
    i: 9,
    j: 1,
    q: 8,
    r: 9,
    b: 2,
    c: 3,
    d: 4,
    e: 5,
    f: 6,
    g: 3,
    h: 8,
    k: 2,
    l: 3,
    s: 1,
    t: 4,
    u: 3,
    v: 6,
    w: 6,
    x: 5,
    y: 7,
    z: 8
  };
  const digits = name
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .split('')
    .map(letter => letterValues[letter] || 1);

  let sum = digits.reduce((acc, num) => acc + num, 0);
  while (sum > 9) {
    sum = sum
      .toString()
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  return sum;
};

/**
 * Get numerology insights
 * @param {number} lifePath - Life path number
 * @param {number} nameNum - Name number (optional)
 * @returns {Object} Insights
 */
const getNumerologyInsights = (lifePath, nameNum) => {
  const lifePathInsights = {
    1: 'Leadership, independence, and new beginnings.',
    2: 'Harmony, partnership, and diplomacy.',
    3: 'Creativity, communication, and social energy.',
    4: 'Stability, hard work, and practicality.',
    5: 'Freedom, adventure, and versatility.',
    6: 'Service, responsibility, and nurturing.',
    7: 'Analysis, spirituality, and introspection.',
    8: 'Success, ambition, and material achievement.',
    9: 'Humanitarianism, completion, and wisdom.',
    11: 'Master teacher and inspiration.',
    22: 'Master builder and realization.',
    33: 'Master healer and service.'
  };

  const nameInsights = nameNum ?
    {
      1: 'Independent and determined nature.',
      2: 'Cooperative and intuitive personality.',
      3: 'Creative and socially adept.',
      4: 'Practical and detail-oriented.',
      5: 'Adventurous and adaptable.',
      6: 'Loving and responsible.',
      7: 'Analytical and introspective.',
      8: 'Confident and ambitious.',
      9: 'Idealistic and compassionate.'
    } :
    {};

  return {
    lifePath: lifePathInsights[lifePath] || 'Balanced and positive energy.',
    name: nameInsights[nameNum] || 'Harmonious vibrations.',
    personality: `Your numbers indicate ${lifePathInsights[lifePath]?.toLowerCase() || 'balanced and positive energy.'}`
  };
};

/**
 * Handle solar return requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleSolarReturn = (message, user) => {
  if (
    !message.includes('solar') &&
    !message.includes('birthday') &&
    !message.includes('annual')
  ) {
    return null;
  }

  if (!user.birthDate) {
    return '☀️ Solar Return Analysis\n\n👤 I need your complete birth details for this analysis.\n\nSend format: DDMMYY or DDMMYYYY, HHMM, City, Country\nExample: 150691, 1430, Delhi, India';
  }

  const analysis = generateSolarReturnAnalysis(user);
  return `☀️ *Solar Return Analysis*\n\n${analysis.introduction}\n\n🎯 *Key Life Areas:*\n${analysis.lifeAreas}\n\n📊 *Chart Overview:*\n${analysis.chartOverview}\n\n🎉 *Timing Highlights:*\n${analysis.timingHighlights}\n\n🌟 *Opportunities:*\n${analysis.opportunities}`;
};

/**
 * Generate solar return analysis
 * @param {Object} user - User object
 * @returns {Object} Analysis components
 */
const generateSolarReturnAnalysis = user => {
  const sunSign = getSunSign(user.birthDate);
  const age =
    new Date().getFullYear() -
    new Date(`20${user.birthDate.substring(4)}`).getFullYear();

  const insights = {
    Aries: {
      intro: `${age}-year solar return emphasizes new beginnings and bold action.`,
      areas: '🎯 Career breakthroughs, new relationships, fresh starts',
      chart: 'Mars influences bring energy and determination',
      timing: 'Q1 shows strongest initiative, Q4 consolidates gains',
      opportunities:
        'Entrepreneurial ventures, bold decisions, leadership roles'
    },
    Taurus: {
      intro: `${age}-year solar return focuses on stability and material security.`,
      areas:
        '💰 Financial stability, home improvements, relationship commitment',
      chart: 'Venus position brings comfort and relationship growth',
      timing: 'Q2 and Q3 favor building foundations',
      opportunities:
        'Property investments, career stability, deepened relationships'
    },
    Gemini: {
      intro: `${age}-year solar return brings communication and learning opportunities.`,
      areas: '🧠 Education, travel, social connections, communication',
      chart: 'Mercury placement enhances learning and networking',
      timing: 'Gemini period (May-June) maximizes communication',
      opportunities:
        'Skills development, international opportunities, media work'
    },
    Cancer: {
      intro: `${age}-year solar return emphasizes emotional security and family.`,
      areas: '🏠 Family, home, emotional healing, nurturing relationships',
      chart: 'Moon position influences emotional and family matters',
      timing: 'Cancer season brings emotional insights',
      opportunities: 'Family bonding, home changes, career in care fields'
    },
    Leo: {
      intro: `${age}-year solar return highlights self-expression and leadership.`,
      areas: '🌟 Personal power, creativity, leadership, self-confidence',
      chart: 'Sun position amplifies your natural radiance',
      timing: 'Leo season showcases your strengths',
      opportunities: 'Creative projects, leadership roles, public attention'
    },
    Virgo: {
      intro: `${age}-year solar return focuses on service and practical improvements.`,
      areas: '🔧 Health routines, work efficiency, practical skills',
      chart: 'Mercury position favors detail-oriented activities',
      timing: 'Q3 provides focus for improvement projects',
      opportunities:
        'Career advancement, health improvements, organizational success'
    },
    Libra: {
      intro: `${age}-year solar return emphasizes harmony and relationships.`,
      areas: '❤️ Partnerships, beauty, justice, diplomatic endeavors',
      chart: 'Venus influence enhances relationship matters',
      timing: 'Libra season (Sept-Oct) optimizes partnerships',
      opportunities:
        'Marriage/commitment, business partnerships, artistic pursuits'
    },
    Scorpio: {
      intro: `${age}-year solar return brings transformation and deep insights.`,
      areas: '🔮 Personal transformation, intimate relationships, research',
      chart: 'Pluto/Mars influences deepen emotional connections',
      timing: 'Scorpio season reveals life-changing opportunities',
      opportunities: 'Therapy/healing work, research, intimate partnerships'
    },
    Sagittarius: {
      intro: `${age}-year solar return expands horizons and brings adventure.`,
      areas: '🌍 Travel, philosophy, teaching, expanded perspective',
      chart: 'Jupiter position encourages growth and exploration',
      timing: 'Sagittarius season offers adventurous possibilities',
      opportunities: 'Travel, education, teaching, international connections'
    },
    Capricorn: {
      intro: `${age}-year solar return focuses on achievement and legacy.`,
      areas: '🏔️ Career advancement, reputation, long-term goals',
      chart: 'Saturn position demands serious commitment',
      timing: 'Q1 sets foundation for year\'s achievements',
      opportunities: 'Career promotions, leadership positions, legacy building'
    },
    Aquarius: {
      intro: `${age}-year solar return brings innovation and community focus.`,
      areas: '🤝 Community involvement, innovation, humanitarian efforts',
      chart: 'Uranus/Saturn influences encourage progressive thinking',
      timing: 'Aquarius season maximizes innovation',
      opportunities: 'Technology/communication, group work, social causes'
    },
    Pisces: {
      intro: `${age}-year solar return emphasizes spiritual and creative growth.`,
      areas: '🎨 Creative expression, spiritual development, compassion',
      chart: 'Neptune/Pisces influences deepen spiritual awareness',
      timing: 'Pisces season enhances creative and intuitive abilities',
      opportunities:
        'Artistic pursuits, spiritual practices, healing professions'
    }
  };

  const signData = insights[sunSign] || insights['Aries']; // fallback

  return {
    introduction: signData.intro,
    lifeAreas: signData.areas,
    chartOverview: signData.chart,
    timingHighlights: signData.timing,
    opportunities: signData.opportunities
  };
};

/**
 * Handle asteroid analysis requests (stub for now)
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleAsteroids = (message, user) => {
  if (
    !message.includes('asteroid') &&
    !message.includes('chiron') &&
    !message.includes('ceres')
  ) {
    return null;
  }

  return '☄️ Asteroid Analysis\n\nPlanetary asteroids like Chiron, Ceres, Juno, and Pallas provide deep insights into healing, nurturing, relationships, and wisdom.\n\nThis specialized reading requires birth chart analysis.';
};

module.exports = {
  handleHoroscope,
  handleNumerology,
  handleSolarReturn,
  handleAsteroids,
  getSunSign,
  calculateLifePathNumber
};
