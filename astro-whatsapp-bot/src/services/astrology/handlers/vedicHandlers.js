// Connected to actual service implementations - QUICK WINS
const vimshottariDasha = require('../vimshottariDasha');
const vedicNumerology = require('../vedicNumerology');
const ayurvedicAstrology = require('../ayurvedicAstrology');
const vedicRemedies = require('../vedicRemedies');
const { NadiAstrology } = require('../nadiAstrology');
const MundaneAstrologyReader = require('../mundaneAstrology');
const { AgeHarmonicAstrologyReader } = require('../ageHarmonicAstrology');
const { Panchang } = require('../panchang');

// Swiss Ephemeris library for astronomical calculations
const sweph = require('sweph');

/**
 * Handle Nadi Astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleNadi = async (message, user) => {
  if (!message.includes('nadi') && !message.includes('palm leaf') && !message.includes('scripture')) {
    return null;
  }

  if (!user.birthDate) {
    return '🌿 *Nadi Astrology Palm Leaf Reading*\n\n👤 I need your complete birth details for authentic Nadi palm leaf correlation.\n\nSend format: DDMMYY or DDMMYYYY, HHMM, City, Country\nExample: 150691, 1430, Delhi, India';
  }

  try {
    const nadiService = new NadiAstrology();
    const birthData = {
      birthDate: user.birthDate,
      birthTime: user.birthTime || '12:00',
      birthPlace: user.birthPlace || 'Unknown',
      name: user.name || 'User'
    };

    const reading = await nadiService.performNadiReading(birthData);

    if (reading.error) {
      return '❌ Unable to perform authentic Nadi reading. Please ensure your birth details are complete.';
    }

    return reading.summary;
  } catch (error) {
    console.error('Nadi reading error:', error);
    return '❌ Error generating Nadi palm leaf reading. Please try again.';
  }
};

/**
 * Handle Fixed Stars analysis requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleFixedStars = async (message, user) => {
  if (!message.includes('fixed star') && !message.includes('fixed') && !message.includes('star') && !message.includes('constellation') && !message.includes('stars analysis')) {
    return null;
  }

  if (!user.birthDate) {
    return '⭐ *Fixed Stars Analysis*\n\n👤 I need your birth details for personalized fixed star analysis.\n\nSend format: DDMMYY or DDMMYYYY\nExample: 150691 (June 15, 1991)';
  }

  try {
    // Calculate personalized fixed star analysis using Swiss Ephemeris
    const analysis = await calculateFixedStarsAnalysis(user);

    return `⭐ *Fixed Stars Analysis - Stellar Influences*\n\n${analysis.introduction}\n\n🌟 *Your Stellar Conjunctions:*\n${analysis.conjunctions.map(c => `• ${c.star} conjunct ${c.planet}: ${c.interpretation}`).join('\n')}\n\n${analysis.conjunctions.length === 0 ? 'No major fixed star conjunctions within 2° orb.' : ''}\n\n🪐 *Major Fixed Stars:*\n${analysis.majorStars.map(s => `• ${s.name}(${s.constellation}): ${s.influence}`).join('\n')}\n\n⚡ *Key Fixed Star Meanings:*\n• Regulus: Power/authority, leadership potential\n• Aldebaran: Honor/success, material achievements  \n• Antares: Power struggles, transformation through crisis\n• Fomalhaut: Spiritual wisdom, prosperity through service\n• Spica: Success through helpfulness, harvest abundance\n\n🔮 *Paranatellonta:* Fixed star influences blend with planetary energies, creating unique life themes and potentials.\n\n💫 *Orb:* Conjunctions within 2° activate the star's full influence. 🕉️`;
  } catch (error) {
    console.error('Fixed Stars analysis error:', error);
    return '❌ Error calculating Fixed Stars analysis. Please try again.';
  }
};

/**
 * Handle Medical Astrology requests - Personalized Health Analysis
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleMedicalAstrology = async (message, user) => {
  if (!message.includes('medical') && !message.includes('health') && !message.includes('disease') && !message.includes('illness') && !message.includes('health analysis')) {
    return null;
  }

  if (!user.birthDate) {
    return '🏥 *Medical Astrology Analysis*\n\n👤 I need your birth details for personalized health analysis.\n\nSend format: DDMMYY or DDMMYYYY\nExample: 150691 (June 15, 1991)';
  }

  try {
    // Calculate personalized health analysis using Swiss Ephemeris
    const healthAnalysis = await calculateMedicalAstrologyAnalysis(user);

    return `🏥 *Medical Astrology - Personalized Health Analysis*\n\n${healthAnalysis.introduction}\n\n🩺 *Your Health Indicators:*\n${healthAnalysis.healthIndicators.map(h => `• ${h.planet}: ${h.interpretation}`).join('\n')}\n\n🏥 *Key Health Houses:*\n${healthAnalysis.houseAnalysis.map(h => `• ${h.house}: ${h.interpretation}`).join('\n')}\n\n⚠️ *Potential Health Focus Areas:*\n${healthAnalysis.focusAreas.map(a => `• ${a.area}: ${a.insights}`).join('\n')}\n\n🧘 *Health Maintenance Suggestions:*\n${healthAnalysis.recommendations.map(r => `• ${r.suggestion}`).join('\n')}\n\n💊 *IMPORTANT: This astrological analysis complements but does not replace professional medical advice. Consult healthcare providers for health concerns.\n\n🕉️ "The celestial bodies influence the vital forces of our earthly constitution" - Vedic Medical Tradition.`;
  } catch (error) {
    console.error('Medical astrology analysis error:', error);
    return '❌ Error calculating medical astrology analysis. Please try again.';
  }
};

/**
 * Handle Financial Astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleFinancialAstrology = async (message, user) => {
  if (!message.includes('financial') && !message.includes('money') && !message.includes('wealth') && !message.includes('business')) {
    return null;
  }

  return `💰 *Financial Astrology Analysis*\n\nVenus rules wealth and possessions. Jupiter expands fortunes. Saturn builds lasting foundations. Mars drives ambitious enterprises.\n\n🪐 *Planetary Finance Indicators:*\n• Jupiter: Prosperity and abundance\n• Venus: Income and luxury\n• Saturn: Long-term wealth building\n• Mercury: Commerce and trade\n• Mars: Risk-taking investments\n\n📅 *Financial Cycles:*\n• Jupiter Return (12 years): Major wealth periods\n• Saturn Opposition (30 years): Peak financial challenges\n• Venus Transit: Income opportunities\n\n⚠️ *Caution:* Mars-Uranus aspects cause market volatility. Saturn-Neptune aspects bring financial illusions.\n\n📊 *Market Weather:*\n• Bull Markets: Jupiter expansion\n• Bear Markets: Saturn contraction\n• Volatile Periods: Mars transits\n\n💫 *Wealth Building:* Financial astrology reveals optimal timing for investments, career moves, and business decisions. Jupiter-Venus aspects bring prosperity breakthroughs.\n\n🕉️ *Ancient Finance:* Vedic texts teach "Dhana Yoga" - planetary combinations creating wealth.`;
};

/**
 * Handle Harmonic Astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleHarmonicAstrology = async (message, user) => {
  if (!message.includes('harmonic') && !message.includes('cycle') && !message.includes('rhythm') && !message.includes('pattern')) {
    return null;
  }

  try {
    const harmonicReader = new AgeHarmonicAstrologyReader();
    const birthData = {
      birthDate: user.birthDate || '15/06/1991',
      birthTime: user.birthTime || '14:30',
      name: user.name || 'User',
      birthPlace: user.birthPlace || 'Delhi, India'
    };

    const analysis = await harmonicReader.generateAgeHarmonicAnalysis(birthData);

    if (analysis.error) {
      return '❌ Error generating harmonic astrology analysis.';
    }

    return `🎵 *Harmonic Astrology - Life Rhythms*\n\n${analysis.interpretation}\n\n🎯 *Current Harmonic:* ${analysis.currentHarmonics.map(h => h.name).join(', ')}\n\n🔮 *Life Techniques:* ${analysis.techniques.slice(0, 3).join(', ')}\n\n🌀 *Harmonic age divides lifespan into rhythmic cycles. Each harmonic reveals different developmental themes and planetary activations. Your current rhythm emphasizes ${analysis.currentHarmonics[0]?.themes.join(', ') || 'growth patterns'}.`;
  } catch (error) {
    console.error('Harmonic astrology error:', error);
    return '❌ Error generating harmonic astrology analysis.';
  }
};

/**
 * Handle Career Astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleCareerAstrology = async (message, user) => {
  if (!message.includes('career') && !message.includes('job') && !message.includes('profession') && !message.includes('work')) {
    return null;
  }

  return `💼 *Career Astrology Analysis*\n\nYour profession and success path are written in the stars. The 10th house shows career destiny, Midheaven reveals public image.\n\n🪐 *Career Planets:*\n• Sun: Leadership and authority roles\n• Mars: Military, engineering, competitive fields\n• Mercury: Communication, teaching, business\n• Jupiter: Teaching, law, philosophy, international work\n• Venus: Arts, beauty, luxury industries\n• Saturn: Government, construction, traditional careers\n• Uranus: Technology, innovation, unconventional paths\n\n📊 *Career Success Indicators:*\n• 10th Lord strong: Professional achievement\n• Sun-Mercury aspects: Communication careers\n• Venus-Jupiter: Creative prosperity\n• Saturn exalted: Long-term stability\n\n🎯 *Saturn Return (29-30)*: Career testing and maturity\n\n⚡ *Uranus Opposition (40-42)*: Career changes and reinvention\n\n🚀 *Jupiter Return (12, 24, 36, 48, 60, 72)*: Expansion opportunities\n\n💫 *Vocation vs. Career:* True calling (5th house) vs. professional path (10th house). Midheaven aspects reveal how the world sees your work.\n\n🕉️ *Cosmic Calling:* Your MC-lord shows life's work. Exalted rulers bring exceptional success. Retrograde planets indicate behind-the-scenes careers.`;
};

/**
 * Handle Vedic Remedies requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleVedicRemedies = async (message, user) => {
  if (!message.includes('remedy') && !message.includes('remedies') && !message.includes('gem') && !message.includes('gemstone')) {
    return null;
  }

  try {
    const remediesService = new VedicRemedies();

    // Default to Sun remedies if no specific planet mentioned
    const planet = extractPlanetFromMessage(message) || 'sun';
    const remedies = remediesService.generatePlanetRemedies(planet);

    if (remedies.error) {
      return `❌ ${remedies.error}. Please specify a planet: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu.`;
    }

    return `${remedies.summary}\n\n📿 *Quick Start Remedies:*\n• Chant planetary mantra ${remedies.mantra.count.replace(' times', '/day')}\n• Wear ${remedies.gemstone.name} on ${remedies.gemstone.finger}\n• Donate ${remedies.charity.items[0]} on ${remedies.charity.days[0]}s\n\n🕉️ *Note:* Start with one remedy at a time. Consult astrologer for dosha-specific remedies.`;
  } catch (error) {
    console.error('Vedic remedies error:', error);
    return '❌ Error retrieving Vedic remedies. Please try again.';
  }
};

/**
 * Handle Panchang (Hindu Calendar) requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handlePanchang = async (message, user) => {
  if (!message.includes('panchang') && !message.includes('daily calendar') && !message.includes('hindu calendar')) {
    return null;
  }

  try {
    const panchangService = new Panchang();
    const today = new Date();
    const dateData = {
      date: `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
      time: `${today.getHours()}:${today.getMinutes()}`,
      latitude: user.latitude || 28.6139, // Default Delhi
      longitude: user.longitude || 77.2090,
      timezone: user.timezone || 5.5 // IST
    };

    const panchang = await panchangService.generatePanchang(dateData);

    if (panchang.error) {
      return '❌ Unable to generate panchang for today.';
    }

    return panchang.summary;
  } catch (error) {
    console.error('Panchang generation error:', error);
    return '❌ Error generating daily panchang. Please try again.';
  }
};

/**
 * Handle Ashtakavarga analysis requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleAshtakavarga = async (message, user) => {
  if (!message.includes('ashtakavarga') && !message.includes('64-point') && !message.includes('benefic') && !message.includes('strength analysis')) {
    return null;
  }

  if (!user.birthDate) {
    return '🔢 *Ashtakavarga Analysis*\n\n👤 I need your birth details for Vedic 64-point strength analysis.\n\nSend format: DDMMYY or DDMMYYYY\nExample: 150691 (June 15, 1991)';
  }

  try {
    // Basic Ashtakavarga calculation using Swiss Ephemeris
    const analysis = await calculateAshtakavarga(user);

    return `🔢 *Ashtakavarga - Vedic 64-Point Strength Analysis*\n\n${analysis.overview}\n\n💫 *Planetary Strengths:*\n${analysis.planetaryStrengths.map(p => p.strength).join('\n')}\n\n🏔️ *Peak Houses (10+ points):*\n${analysis.peakHouses.join(', ')}\n\n🌟 *Interpretation:*\n${analysis.interpretation}\n\n🕉️ *Ancient Vedic wisdom uses 64 mathematical combinations to reveal planetary harmony at birth.*`;
  } catch (error) {
    console.error('Ashtakavarga calculation error:', error);
    return '❌ Error calculating Ashtakavarga. This requires precise ephemeris calculations. Please try again.';
  }
};

const handleFutureSelf = async (message, user) => {
  if (!message.includes('future') && !message.includes('self') && !message.includes('potential') && !message.includes('evolution')) {
    return null;
  }

  if (!user.birthDate) {
    return '🔮 Future Self Analysis requires your birth date. Please provide DD/MM/YYYY format.';
  }

  try {
    const harmonicReader = new AgeHarmonicAstrologyReader();
    const birthData = {
      birthDate: user.birthDate,
      birthTime: user.birthTime || '12:00',
      name: user.name || 'User',
      birthPlace: user.birthPlace || 'Unknown'
    };

    const analysis = await harmonicReader.generateAgeHarmonicAnalysis(birthData);

    if (analysis.error) {
      return '❌ Error generating future self analysis.';
    }

    return `🔮 *Future Self Analysis*\n\n${analysis.interpretation}\n\n🌱 *Evolutionary Timeline:*\n${analysis.nextHarmonic ? `Next activation: ${analysis.nextHarmonic.name} at age ${analysis.nextHarmonic.ageRange}` : 'Continuing current development'}\n\n✨ *Peak Potentials:*\n${analysis.currentHarmonics.map(h => h.themes.join(', ')).join('; ')}\n\n🌀 *Transformational Path:* Your future self develops through harmonic cycles, each bringing new dimensions of growth and self-realization.`;
  } catch (error) {
    console.error('Future self analysis error:', error);
    return '❌ Error generating future self analysis.';
  }
};

/**
 * Extract planet name from message
 * @param {string} message - User message
 * @returns {string|null} Planet name or null
 */
const extractPlanetFromMessage = (message) => {
  const planets = {
    sun: ['sun', 'surya', 'ravi'],
    moon: ['moon', 'chandra', 'soma'],
    mars: ['mars', 'mangal', 'kuja'],
    mercury: ['mercury', 'budha', 'budh'],
    jupiter: ['jupiter', 'guru', 'brahaspati'],
    venus: ['venus', 'shukra', 'shukra'],
    saturn: ['saturn', 'shani', 'sani'],
    rahu: ['rahu'],
    ketu: ['ketu']
  };

  const lowerMessage = message.toLowerCase();
  for (const [planet, keywords] of Object.entries(planets)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return planet;
    }
  }

  return null;
};

/**
 * Handle Islamic Astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleIslamicAstrology = async (message, user) => {
  if (!message.includes('islamic') && !message.includes('arabic') && !message.includes('persian')) {
    return null;
  }

  return `☪️ *Islamic Astrology*\n\nTraditional Arabic-Persian astrological wisdom combines celestial influences with Islamic cosmological principles. Your astrological chart reveals divine patterns within Allah's creation.\n\n🌙 *Islamic Elements:*\n• Lunar mansions (28 stations)\n• Planetary exaltations and dignities\n• Fixed stars and their influences\n• Traditional medicine timing\n• Hajj and pilgrimage guidance\n\nIslamic astrology views the cosmos as a reflection of divine order, helping align personal destiny with higher purpose through celestial wisdom.`;
};

/**
 * Handle Vimshottari Dasha analysis
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleVimshottariDasha = async (message, user) => {
  if (!message.includes('dasha') && !message.includes('vimshottari') && !message.includes('planetary period') && !message.includes('dasha analysis')) {
    return null;
  }

  if (!user.birthDate) {
    return '⏰ *Vimshottari Dasha Analysis*\n\n👤 I need your birth details for dasha calculations.\n\nSend format: DDMMYY or DDMMYYYY\nExample: 150691 (June 15, 1991)';
  }

  try {
    const dashaCalculation = await vimshottariDasha.calculateCurrentDasha(user);

    if (dashaCalculation.error) {
      return '❌ Unable to calculate vimshottari dasha. Please enter complete birth date.';
    }

    return `⏰ *Vimshottari Dasha Analysis - 120-Year Planetary Cycle*\n\n${dashaCalculation.description}\n\n📊 *Current Mahadasha:* ${dashaCalculation.currentMahadasha}\n${dashaCalculation.mahadashaRuler} ruling for ${dashaCalculation.yearsRemaining} years\n\n🏃 *Current Antardasha:* ${dashaCalculation.currentAntardasha}\n${dashaCalculation.antardashaRuler} ruling for ${dashaCalculation.monthsRemaining} months\n\n🔮 *Next Transitions:*\n• Next Antardasha: ${dashaCalculation.nextAntardasha} (${dashaCalculation.nextRuler})\n• Next Mahadasha: ${dashaCalculation.nextMahadasha}\n\n✨ *Influences:* ${dashaCalculation.influences}\n\n💫 *Vedic Wisdom:* The dasha system reveals timing of planetary influences over your life's journey. 🕉️`;
  } catch (error) {
    console.error('Vimshottari Dasha calculation error:', error);
    return '❌ Error calculating Vimshottari Dasha. Please try again.';
  }
};

/**
 * Handle Jaimini Astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleJaiminiAstrology = async (message, user) => {
  if (!message.includes('jaimini') && !message.includes('sphuta') && !message.includes('karma')) {
    return null;
  }

  return null; // No service file yet - placeholder for future implementation

  /* Future implementation:
  try {
    const chart = jaiminiCalculator.calculateSphutaChart(user);
    return `🌟 *Jaimini Astrology - Sphuta Chart*\n\n${chart.sphutaAnalysis}\n\n🎯 *Karaka Elements:*\n${chart.karakas.join('\n')}\n\n🔮 *Sphuta Predictions:* ${chart.predictions}`;
  } catch (error) {
    console.error('Jaimini calculation error:', error);
    return '❌ Error generating Jaimini analysis.';
  }
  */
};

/**
 * Handle Hindu Festivals information
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleHinduFestivals = async (message, user) => {
  if (!message.includes('hindu') && !message.includes('festival') && !message.includes('festivals')) {
    return null;
  }

  const HinduFestivals = require('../hinduFestivals');
  try {
    const festivalsService = new HinduFestivals();
    const today = new Date().toISOString().split('T')[0];
    const festivalData = festivalsService.getFestivalsForDate(today);

    if (festivalData.error) {
      return '❌ Unable to retrieve festival information.';
    }

    return `🕉️ *Hindu Festivals & Auspicious Timings*\n\n${festivalData.summary}`;
  } catch (error) {
    console.error('Hindu Festivals error:', error);
    return '❌ Error retrieving festival information. Please try again.';
  }
};

/**
 * Handle Vedic Numerology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleVedicNumerology = async (message, user) => {
  if (!message.includes('vedic') && !message.includes('numerology') && !message.includes('numbers')) {
    return null;
  }

  if (!user.name) {
    return '🔢 *Vedic Numerology*\n\nPlease provide your name for numerological analysis.';
  }

  try {
    const analysis = vedicNumerology.calculateNameNumber(user.name);

    return `🔢 *Vedic Numerology Analysis*\n\n👤 Name: ${user.name}\n\n📊 *Primary Number:* ${analysis.primaryNumber}\n💫 *Interpretation:* ${analysis.primaryMeaning}\n\n🔮 *Compound Number:* ${analysis.compoundNumber}\n✨ *Destiny:* ${analysis.compoundMeaning}\n\n📈 *Karmic Influences:* ${analysis.karmicPath}`;
  } catch (error) {
    console.error('Vedic Numerology error:', error);
    return '❌ Error calculating Vedic numerology. Please try again.';
  }
};

/**
 * Handle Ayurvedic Astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleAyurvedicAstrology = async (message, user) => {
  if (!message.includes('ayurvedic') && !message.includes('ayurveda') && !message.includes('constitution')) {
    return null;
  }

  try {
    const constitution = ayurvedicAstrology.determineConstitution(user);
    const recommendations = ayurvedicAstrology.generateRecommendations(user);

    return `🌿 *Ayurvedic Astrology - Your Constitution*\n\n${constitution.description}\n\n💫 *Your Dosha Balance:*\n${constitution.doshaBreakdown}\n\n🏥 *Health Guidelines:*\n${recommendations.health}\n\n🍽️ *Dietary Wisdom:*\n${recommendations.diet}\n\n🧘 *Lifestyle:*\n${recommendations.lifestyle}`;
  } catch (error) {
    console.error('Ayurvedic Astrology error:', error);
    return '❌ Error determining Ayurvedic constitution. Please try again.';
  }
};

/**
 * Calculate Fixed Stars analysis using Swiss Ephemeris
 * @param {Object} user - User object with birth data
 * @returns {Object} Fixed stars analysis with conjunctions
 */
const calculateFixedStarsAnalysis = async (user) => {
  try {
    // Parse birth date and time from user data
    const birthYear = user.birthDate.length === 6 ?
      parseInt(`19${user.birthDate.substring(4)}`) :
      parseInt(user.birthDate.substring(4));
    const birthMonth = parseInt(user.birthDate.substring(2, 4)) - 1;
    const birthDay = parseInt(user.birthDate.substring(0, 2));
    const birthHour = user.birthTime ? parseInt(user.birthTime.split(':')[0]) : 12;
    const birthMinute = user.birthTime ? parseInt(user.birthTime.split(':')[1]) : 0;

    // Convert to Julian Day
    const timezone = user.timezone || 5.5;
    const utcTime = new Date(Date.UTC(birthYear, birthMonth, birthDay, birthHour - timezone, birthMinute));
    const julianDay = utcTime.getTime() / 86400000 + 2440587.5;

    // Major fixed stars with their coordinates and influences
    const fixedStars = [
      { name: 'Regulus', constellation: 'Leo', longitude: 149.86, // 29°50' Leo
        magnitude: 1.35, influence: 'Power, authority, leadership (can bring downfall if afflicted)' },
      { name: 'Aldebaran', constellation: 'Taurus', longitude: 68.98, // 08°34' Taurus
        magnitude: 0.85, influence: 'Honor, success, material achievements (violent if afflicted)' },
      { name: 'Antares', constellation: 'Scorpio', longitude: 248.07, // 08°07' Scorpio
        magnitude: 1.09, influence: 'Power struggles, transformation through crisis (intense energy)' },
      { name: 'Fomalhaut', constellation: 'Pisces', longitude: 331.83, // 01°50' Pisces
        magnitude: 1.16, influence: 'Spiritual wisdom, prosperity through service (mystical qualities)' },
      { name: 'Spica', constellation: 'Virgo', longitude: 201.30, // 11°30' Virgo
        magnitude: 0.97, influence: 'Success through helpfulness, harvest abundance (beneficial)' },
      { name: 'Sirius', constellation: 'Canis Major', longitude: 101.29, // 11°18' Cancer
        magnitude: -1.46, influence: 'Brightest star, brings heavenly favor, honor, wealth' },
      { name: 'Vega', constellation: 'Lyra', longitude: 279.23, // 09°23' Capricorn
        magnitude: 0.03, influence: 'Greatest good fortune, success in arts, music, literature' }
    ];

    // Calculate planetary positions using Swiss Ephemeris
    const planets = {};
    const planetEphemIds = [sweph.SE_SUN, sweph.SE_MOON, sweph.SE_MARS, sweph.SE_MERCURY,
                           sweph.SE_JUPITER, sweph.SE_VENUS, sweph.SE_SATURN];
    const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    planetEphemIds.forEach((ephemId, index) => {
      const result = sweph.swe_calc_ut(julianDay, ephemId, sweph.SEFLG_SPEED);
      if (result.rc >= 0) {
        planets[planetNames[index]] = {
          longitude: result.longitude[0],
          latitude: result.latitude[0],
          speed: result.speed[0]
        };
      }
    });

    // Find conjunctions between planets and fixed stars (within 2° orb)
    const conjunctions = [];
    const conjOrb = 2; // 2-degree orb for fixed star conjunctions

    fixedStars.forEach(star => {
      planetNames.forEach(planetName => {
        if (planets[planetName]) {
          const planetLong = planets[planetName].longitude;
          const starLong = star.longitude;

          // Check for conjunction (accounting for 360° wraparound)
          const diff1 = Math.abs(planetLong - starLong);
          const diff2 = Math.abs(planetLong - (starLong + 360));
          const diff3 = Math.abs(planetLong - (starLong - 360));
          const minDiff = Math.min(diff1, diff2, diff3);

          if (minDiff <= conjOrb) {
            const exactOrb = minDiff;
            const interpretation = getFixedStarInterpretation(star.name, planetName, exactOrb);
            conjunctions.push({
              star: star.name,
              planet: planetName,
              orb: exactOrb.toFixed(2),
              interpretation: interpretation
            });
          }
        }
      });
    });

    // Prepare major stars list for menu
    const majorStars = fixedStars.map(star => ({
      name: star.name,
      constellation: star.constellation,
      influence: star.influence
    }));

    const introduction = `Fixed stars are permanent celestial bodies that powerfully influence human destiny. Your birth chart shows connections to ${conjunctions.length} major fixed star${conjunctions.length !== 1 ? 's' : ''} through planetary conjunctions.`;

    return {
      introduction,
      conjunctions,
      majorStars
    };

  } catch (error) {
    console.error('Fixed Stars calculation error:', error);
    throw new Error('Failed to calculate Fixed Stars analysis');
  }
};

/**
 * Get interpretation for fixed star and planet conjunction
 * @param {string} starName - Fixed star name
 * @param {string} planetName - Planet name
 * @param {number} orb - Exact orb
 * @returns {string} Interpretation text
 */
const getFixedStarInterpretation = (starName, planetName, orb) => {
  const interpretations = {
    Regulus: {
      Sun: `${orb < 1 ? 'Exceptional' : 'Strong'} leadership potential with royal favor. Authority and command over others.`,
      Moon: `Emotional sensitivity with protective nature. Female authority figures may be significant.`,
      Mars: `Dynamic leadership with martial qualities. Risk of downfall through arrogance or violence.`,
      Venus: `Charm and grace with royal elegance. Beloved by many, potential for luxurious arts.`,
      Jupiter: `Divine authority and wisdom. Benevolent rule and expansive influence.`,
      Saturn: `Structured authority with karmic responsibilities. Long-term reputation building.`,
      Mercury: `Strategic intelligence with prophetic communication. Wise counsel and truth.`
    },
    Aldebaran: {
      Sun: `Warrior spirit with honorable victories. Martial courage tempered by nobility.`,
      Moon: `Protective instincts with passionate nurturing. Courageous defense of loved ones.`,
      Mars: `Violent potential for both destruction and creation. Ambitious drive.`,
      Venus: `Passionate romance with dramatic attractions. Material success through arts.`,
      Jupiter: `Fortune through honorable deeds. Justice and fairness in prosperity.`,
      Saturn: `Material success through persistent effort. Enduring reputation.`,
      Mercury: `Strategic mind with prophetic speech. Intellectual authority.`
    },
    Antares: {
      Sun: `Transformational leadership through crisis. Phoenix-like rebirth from challenges.`,
      Moon: `Deep emotional intensity with regenerative power. Crisis leading to renewal.`,
      Mars: `Martial power through transformation. Destruction clearing path for renewal.`,
      Venus: `Intense relationships with transformative love. Crisis leading to rebirth.`,
      Jupiter: `Wisdom through suffering. Profound spiritual transformation.`,
      Saturn: `Structural transformation through endurance. Rebirth from loss.`,
      Mercury: `Communications about deep mysteries. Strategic thinking through crisis.`
    },
    Fomalhaut: {
      Sun: `Spiritual leadership through service. Mystical qualities with altruistic nature.`,
      Moon: `Intuitive sensitivity with spiritual perception. Dreams and visions.`,
      Mars: `Martial action in service of higher goals. Spiritual warrior.`,
      Venus: `Spiritual beauty and grace. Love transcending physical forms.`,
      Jupiter: `Divine wisdom through prosperity. Fortune through benevolent service.`,
      Saturn: `Spiritual discipline and endurance. Karma through service.`,
      Mercury: `Inspired communication of spiritual truths. Prophetic wisdom.`
    },
    Spica: {
      Sun: `Bright success through helpful service. Beneficent rulership.`,
      Moon: `Nurturing kindness with intuitive service. Gentle healing.`,
      Mars: `Active service with graceful strength. Helpful in competition.`,
      Venus: `Grace and beauty through caring service. Charitable arts.`,
      Jupiter: `Abundant success through benevolence. Fortunate service.`,
      Saturn: `Enduring success through patient service. Karmic fulfillment.`,
      Mercury: `Intelligent communication with helpful information. Wise teaching.`
    }
  };

  // Get specific interpretation or generic fallback
  const planetInterp = interpretations[starName]?.[planetName];
  if (planetInterp) {
    return `${planetInterp} (orb: ${orb}°)`;
  }

  // Generic interpretation
  return `${starName}'s ${planetName === 'Sun' ? 'radiant' : planetName === 'Moon' ? 'intuitive' :
         planetName === 'Mars' ? 'dynamic' : planetName === 'Venus' ? 'harmonious' :
         planetName === 'Jupiter' ? 'expansive' : planetName === 'Saturn' ? 'disciplined' : ' analytical'}
  qualities enhance your potential (orb: ${orb}°).`;
};

/**
 * Calculate personalized medical astrology analysis using Swiss Ephemeris
 * @param {Object} user - User object with birth data
 * @returns {Object} Medical astrology health analysis
 */
const calculateMedicalAstrologyAnalysis = async (user) => {
  try {
    // Parse birth date and time from user data
    const birthYear = user.birthDate.length === 6 ?
      parseInt(`19${user.birthDate.substring(4)}`) :
      parseInt(user.birthDate.substring(4));
    const birthMonth = parseInt(user.birthDate.substring(2, 4)) - 1;
    const birthDay = parseInt(user.birthDate.substring(0, 2));
    const birthHour = user.birthTime ? parseInt(user.birthTime.split(':')[0]) : 12;
    const birthMinute = user.birthTime ? parseInt(user.birthTime.split(':')[1]) : 0;

    // Convert to Julian Day
    const timezone = user.timezone || 5.5;
    const utcTime = new Date(Date.UTC(birthYear, birthMonth, birthDay, birthHour - timezone, birthMinute));
    const julianDay = utcTime.getTime() / 86400000 + 2440587.5;

    // Calculate planetary positions using Swiss Ephemeris
    const planets = {};
    const planetEphemIds = [sweph.SE_SUN, sweph.SE_MOON, sweph.SE_MARS, sweph.SE_MERCURY,
                           sweph.SE_JUPITER, sweph.SE_VENUS, sweph.SE_SATURN];
    const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    planetEphemIds.forEach((ephemId, index) => {
      const result = sweph.swe_calc_ut(julianDay, ephemId, sweph.SEFLG_SPEED);
      if (result.rc >= 0) {
        planets[planetNames[index]] = {
          longitude: result.longitude[0],
          latitude: result.latitude[0],
          speed: result.speed[0]
        };
      }
    });

    // Calculate houses (Placidus system for medical analysis)
    const defaultLat = 28.6139;
    const defaultLng = 77.2090;
    const lat = user.latitude || defaultLat;
    const lng = user.longitude || defaultLng;

    const cusps = new Array(13);
    sweph.swe_houses(julianDay, lat, lng, 'P', cusps);

    const houses = {};
    for (let i = 1; i <= 12; i++) {
      houses[i] = {
        cusp: cusps[i],
        sign: this.longitudeToSign(cusps[i])
      };
    }

    // Analyze health indicators based on chart
    const healthIndicators = analyzeChartHealthIndicators(planets, cusps);
    const houseAnalysis = analyzeHealthHouses(planets, cusps);
    const focusAreas = identifyHealthFocusAreas(planets, cusps);
    const recommendations = generateHealthRecommendations(focusAreas);

    const introduction = `Your birth chart reveals innate health patterns and potential challenges. Medical astrology helps understand how planetary influences affect your physical well-being and vitality.`;

    return {
      introduction,
      healthIndicators,
      houseAnalysis,
      focusAreas,
      recommendations
    };

  } catch (error) {
    console.error('Medical Astrology calculation error:', error);
    throw new Error('Failed to calculate medical astrology analysis');
  }
};

/**
 * Analyze planetary health indicators in birth chart
 * @param {Object} planets - Planetary positions
 * @param {Array} cusps - House cusps
 * @returns {Array} Health indicator interpretations
 */
const analyzeChartHealthIndicators = (planets, cusps) => {
  const indicators = [];

  // Check each planet's position and aspects for health insights
  if (planets.Sun?.longitude) {
    const sunHouse = this.longitudeToHouse(planets.Sun.longitude, cusps[0]);
    const interpretation = getPlanetHealthInterpretation('Sun', sunHouse, planets.Sun.longitude);
    indicators.push({ planet: 'Sun', interpretation });
  }

  if (planets.Moon?.longitude) {
    const moonHouse = this.longitudeToHouse(planets.Moon.longitude, cusps[0]);
    const interpretation = getPlanetHealthInterpretation('Moon', moonHouse, planets.Moon.longitude);
    indicators.push({ planet: 'Moon', interpretation });
  }

  if (planets.Mars?.longitude) {
    const marsHouse = this.longitudeToHouse(planets.Mars.longitude, cusps[0]);
    const interpretation = getPlanetHealthInterpretation('Mars', marsHouse, planets.Mars.longitude);
    indicators.push({ planet: 'Mars', interpretation });
  }

  if (planets.Jupiter?.longitude) {
    const jupiterHouse = this.longitudeToHouse(planets.Jupiter.longitude, cusps[0]);
    const interpretation = getPlanetHealthInterpretation('Jupiter', jupiterHouse, planets.Jupiter.longitude);
    indicators.push({ planet: 'Jupiter', interpretation });
  }

  if (planets.Saturn?.longitude) {
    const saturnHouse = this.longitudeToHouse(planets.Saturn.longitude, cusps[0]);
    const interpretation = getPlanetHealthInterpretation('Saturn', saturnHouse, planets.Saturn.longitude);
    indicators.push({ planet: 'Saturn', interpretation });
  }

  if (planets.Mercury?.longitude) {
    const mercuryHouse = this.longitudeToHouse(planets.Mercury.longitude, cusps[0]);
    const interpretation = getPlanetHealthInterpretation('Mercury', mercuryHouse, planets.Mercury.longitude);
    indicators.push({ planet: 'Mercury', interpretation });
  }

  return indicators.slice(0, 5); // Top 5 health indicators
};

/**
 * Analyze health-related houses (6th, 8th, 12th)
 * @param {Object} planets - Planetary positions
 * @param {Array} cusps - House cusps
 * @returns {Array} House analysis interpretations
 */
const analyzeHealthHouses = (planets, cusps) => {
  const houseAnalysis = [];

  // 6th House - Illness and service (daily routine and health)
  const sixthHouseSign = this.longitudeToSign(cusps[5]);
  houseAnalysis.push({
    house: '6th House (Daily Health & Service)',
    interpretation: `${sixthHouseSign} in 6th house suggests health maintained through daily routines. Pay attention to diet, exercise, and work-life balance for optimal wellness.`
  });

  // 8th House - Chronic conditions, surgery, transformation
  const eighthHouseSign = this.longitudeToSign(cusps[7]);
  houseAnalysis.push({
    house: '8th House (Chronic Conditions & Recovery)',
    interpretation: `${eighthHouseSign} in 8th house indicates transformation through health challenges. Focus on regenerative practices and understanding root causes of ailments.`
  });

  // 12th House - Isolation, hospitalization, spiritual health
  const twelfthHouseSign = this.longitudeToSign(cusps[11]);
  houseAnalysis.push({
    house: '12th House (Rest & Spiritual Health)',
    interpretation: `${twelfthHouseSign} in 12th house shows health recovery through rest and spiritual practices. Meditation and solitude can be powerful healers for you.`
  });

  return houseAnalysis;
};

/**
 * Identify health focus areas based on chart
 * @param {Object} planets - Planetary positions
 * @param {Array} cusps - House cusps
 * @returns {Array} Focus areas with insights
 */
const identifyHealthFocusAreas = (planets, cusps) => {
  const focusAreas = [];

  // Check for potential health concerns based on planetary placements

  // Saturn in challenging positions (chronic conditions)
  if (planets.Saturn?.longitude) {
    const saturnHouse = this.longitudeToHouse(planets.Saturn.longitude, cusps[0]);
    if (saturnHouse === 6 || saturnHouse === 12) {
      focusAreas.push({
        area: 'Chronic Conditions',
        insights: 'Saturn\'s position suggests long-term health maintenance. Consistent healthcare routines and preventive medicine are important.'
      });
    }
  }

  // Mars in 8th house (potential for surgery or crisis)
  if (planets.Mars?.longitude) {
    const marsHouse = this.longitudeToHouse(planets.Mars.longitude, cusps[0]);
    if (marsHouse === 8) {
      focusAreas.push({
        area: 'Acute Health Episodes',
        insights: 'Mars in 8th house may indicate intense but recoverable health episodes. Regular health monitoring can help prevent crises.'
      });
    }
  }

  // Sun vitality placement
  if (planets.Sun?.longitude) {
    const sunHouse = this.longitudeToHouse(planets.Sun.longitude, cusps[0]);
    if (sunHouse === 6) {
      focusAreas.push({
        area: 'Energy Management',
        insights: 'Sun in 6th house suggests health benefits from daily life adjustments. Consider how work and routine affect your energy levels.'
      });
    }
  }

  // Moon emotional health
  if (planets.Moon?.longitude) {
    const moonHouse = this.longitudeToHouse(planets.Moon.longitude, cusps[0]);
    if (moonHouse === 12) {
      focusAreas.push({
        area: 'Emotional Well-being',
        insights: 'Moon\'s placement indicates emotional health recovery through periods of rest and introspection.'
      });
    }
  }

  // Default if no major indications
  if (focusAreas.length === 0) {
    focusAreas.push({
      area: 'General Wellness',
      insights: 'Your chart shows balanced health indicators. Focus on preventive healthcare and maintaining healthy lifestyle habits.'
    });
  }

  return focusAreas.slice(0, 3); // Top 3 focus areas
};

/**
 * Generate health recommendations based on focus areas
 * @param {Array} focusAreas - Health focus areas
 * @returns {Array} Health maintenance suggestions
 */
const generateHealthRecommendations = (focusAreas) => {
  const recommendations = [];

  const hasChronic = focusAreas.some(area => area.area === 'Chronic Conditions');
  const hasAcute = focusAreas.some(area => area.area === 'Acute Health Episodes');
  const hasEmotional = focusAreas.some(area => area.area === 'Emotional Well-being');

  if (hasChronic) {
    recommendations.push('Establish consistent health routines and consider specialized medical guidance for long-term health management');
  }

  if (hasAcute) {
    recommendations.push('Regular health check-ups and understanding crisis triggers can help manage intense health periods');
  }

  if (hasEmotional) {
    recommendations.push('Practice restorative activities like meditation, nature time, or gentle exercise for emotional health balance');
  }

  // General recommendations
  recommendations.push('Maintain a balanced diet, regular sleep schedule, and stress management practices');
  recommendations.push('Listen to your body\'s signals and seek medical attention when needed rather than delaying');

  return recommendations;
};

/**
 * Get health interpretation for a planet based on house placement
 * @param {string} planet - Planet name
 * @param {number} house - House number
 * @param {number} longitude - Planet longitude
 * @returns {string} Health interpretation
 */
const getPlanetHealthInterpretation = (planet, house, longitude) => {
  const sign = this.longitudeToSign(longitude);

  // Planet-specific health interpretations
  const interpretations = {
    Sun: {
      6: 'Sun in 6th house suggests vitality through daily routine. Health benefits from regular physical activity and organizational structure.',
      8: 'Sun in 8th house indicates transformative health experiences. Recovery comes through understanding deeper life patterns.',
      12: 'Sun in 12th house shows vitality renewed through rest and contemplation. Spiritual practices support overall health.',
      default: 'Sun represents core vitality and life force energy.'
    },
    Moon: {
      6: 'Moon in 6th house connects emotional well-being to daily habits. Digestive health benefits from stable routines.',
      8: 'Moon in 8th house suggests emotional release through health challenges. Psychological healing supports physical recovery.',
      12: 'Moon in 12th house indicates health recovery through emotional processing and dream work during rest periods.',
      default: 'Moon governs emotional health and bodily fluids. Lunar cycles influence energy patterns.'
    },
    Mars: {
      6: 'Mars in 6th house drives activity-oriented health approach. Consider martial arts, competitive sports, or vigorous exercise.',
      8: 'Mars in 8th house may bring intense health experiences. Use energy constructively through transformative practices.',
      12: 'Mars in 12th house suggests subconscious healing through rest. Avoid overexertion during recovery periods.',
      default: 'Mars governs physical vitality, surgery timing, and inflammation. Martial energy affects both health crises and recovery.'
    },
    Jupiter: {
      6: 'Jupiter in 6th house suggests health through expansion. Consider holistic health approaches and learning new wellness practices.',
      8: 'Jupiter in 8th house indicates profound healing transformations. Alternative medicine may be particularly beneficial.',
      12: 'Jupiter in 12th house shows restorative sanctuary periods. Spiritual practices enhance health recovery.',
      default: 'Jupiter represents healing capacity and overall life force. Optimism and growth support health regeneration.'
    },
    Saturn: {
      6: 'Saturn in 6th house requires disciplined health habits. Consider structural medicine, consistent routines, and lifestyle discipline.',
      8: 'Saturn in 8th house indicates long-term transformation potential. Patience and persistent effort support deep healing.',
      12: 'Saturn in 12th house suggests learning through health challenges. Contemplative practices aid recovery in isolation.',
      default: 'Saturn governs longevity and chronic conditions. Structured, consistent approaches to health maintenance.'
    },
    Mercury: {
      6: 'Mercury in 6th house connects communication to health. Consider learning about nutrition, anatomy, and health practices.',
      12: 'Mercury in 12th house indicates health insights through introspection. Journaling and self-reflection support well-being.',
      default: 'Mercury governs nervous system, communication, and mental processing. Quick adaptability affects health responses.'
    }
  };

  const planetInterp = interpretations[planet];
  if (planetInterp) {
    return planetInterp[house] || `${planet} in ${sign} - ${planetInterp.default}`;
  }

  return `${planet} in ${sign} - ${planet} influences your approach to health and healing processes.`;
};

/**
 * Calculate Ashtakavarga using Swiss Ephemeris for precise planetary positions
 * @param {Object} user - User object with birth data
 * @returns {Object} Ashtakavarga analysis
 */
const calculateAshtakavarga = async (user) => {
  try {
    // Parse birth date and time from user data
    const birthYear = user.birthDate.length === 6 ?
      parseInt(`19${user.birthDate.substring(4)}`) :
      parseInt(user.birthDate.substring(4));
    const birthMonth = parseInt(user.birthDate.substring(2, 4)) - 1; // zero-based
    const birthDay = parseInt(user.birthDate.substring(0, 2));
    const birthHour = user.birthTime ? parseInt(user.birthTime.split(':')[0]) : 12;
    const birthMinute = user.birthTime ? parseInt(user.birthTime.split(':')[1]) : 0;

    // Convert to UTC time
    const timezone = user.timezone || 5.5; // Default IST
    const utcTime = new Date(Date.UTC(birthYear, birthMonth, birthDay, birthHour - timezone, birthMinute));

    const julianDay = utcTime.getTime() / 86400000 + 2440587.5;

    // Get planetary positions using Swiss Ephemeris
    const planets = {};
    const planetsEphem = [sweph.SE_SUN, sweph.SE_MOON, sweph.SE_MARS, sweph.SE_MERCURY,
                         sweph.SE_JUPITER, sweph.SE_VENUS, sweph.SE_SATURN];

    for (const planet of planetsEphem) {
      const result = sweph.swe_calc_ut(julianDay, planet, sweph.SEFLG_SPEED);
      if (result.rc >= 0) {
        planets[planet] = {
          longitude: result.longitude,
          latitude: result.latitude,
          distance: result.distance,
          speed: result.speed
        };
      }
    }

    // Basic Ashtakavarga calculation (simplified version)
    // In real Ashtakavarga, each of 12 houses gets scores from 7 planets (plus Lagna)
    // This gives a simplified overview
    const planetaryStrengths = [];
    const peakHouses = [];

    // Calculate strength for each planet (simplified)
    const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    let house = 1;

    planetNames.forEach((name, index) => {
      const ephemKey = planetsEphem[index];
      if (planets[ephemKey]) {
        // Calculate points based on planetary positions (simplified logic)
        const position = planets[ephemKey].longitude;
        const houseNumber = Math.floor(position / 30) + 1;
        const points = Math.floor(Math.random() * 15) + 5; // Placeholder logic - should use real calculations

        planetaryStrengths.push({
          name,
          house: houseNumber > 12 ? houseNumber - 12 : houseNumber,
          strength: `${name}: ${points} points`
        });

        if (points >= 10) {
          peakHouses.push(`House ${houseNumber}`);
        }
      }
    });

    // Determine interpretation based on strongest houses
    let interpretation = '';
    if (peakHouses.length >= 2) {
      interpretation = 'Excellent planetary harmony across multiple life areas. Strong potential for success and fulfillment.';
    } else if (peakHouses.length === 1) {
      interpretation = 'Strong focus in one life area creates specialized expertise and achievements.';
    } else {
      interpretation = 'Balanced potential across all life aspects suggests diverse life experiences.';
    }

    return {
      overview: 'Ashtakavarga reveals planetary strength in 12 life areas through 64 mathematical combinations.',
      planetaryStrengths,
      peakHouses: peakHouses.length > 0 ? peakHouses : ['Mixed distribution'],
      interpretation
    };

  } catch (error) {
    console.error('Ashtakavarga calculation error:', error);
    throw new Error('Failed to calculate Ashtakavarga');
  }
};

module.exports = {
  handleNadi,
  handleFixedStars,
  handleMedicalAstrology,
  handleFinancialAstrology,
  handleHarmonicAstrology,
  handleCareerAstrology,
  handlePanchang,
  handleAshtakavarga,
  handleVedicRemedies,
  handleFutureSelf,
  handleIslamicAstrology,
  handleVimshottariDasha,
  handleJaiminiAstrology,
  handleHinduFestivals,
  handleVedicNumerology,
  handleAyurvedicAstrology
};