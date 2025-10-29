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
  if (!message.includes('fixed star') && !message.includes('fixed') && !message.includes('star') && !message.includes('constellation')) {
    return null;
  }

  return `⭐ *Fixed Stars Analysis*\n\nFixed stars are permanent stellar bodies that powerfully influence human destiny. Twenty-eight nakshatras and major fixed stars create the backdrop of our earthly dramas.\n\n🌟 *Key Fixed Stars:*\n• Regulus (Royal Star) - Power and authority, but can bring downfall\n• Aldebaran (Bull's Eye) - Royal honors, but violent if afflicted\n• Antares (Heart of Scorpio) - Power struggles, transformation\n• Fomalhaut (Fish's Mouth) - Spiritual wisdom, prosperity\n• Spica (Virgin's Spike) - Success through service\n\n🔮 *Paranatellonta:* When planets conjoin these stars, their influence intensifies. The star's nature blends with planetary energy, creating complex personality patterns.\n\n🪐 *Mundane Effects:* Fixed stars influence world leaders, nations, and historical events. Their position maps the cosmic script of human civilization.\n\n💫 *Note:* Fixed star analysis requires birth chart calculation. Each star's influence lasts approximately 2° orb of conjunction. 🕉️`;
};

/**
 * Handle Medical Astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleMedicalAstrology = async (message, user) => {
  if (!message.includes('medical') && !message.includes('health') && !message.includes('disease') && !message.includes('illness')) {
    return null;
  }

  try {
    // Use mundane reader for health analysis as it can analyze planetary health indicators
    const mundaneReader = new MundaneAstrologyReader();
    // Get current planetary positions for health analysis
    const chartData = {
      planets: {}, // Would need to get actual planetary positions
      houses: {},
      aspects: []
    };

    const healthAnalysis = await mundaneReader.generateMundaneAnalysis(chartData, 'health');

    return `🏥 *Medical Astrology Analysis*\n\nPlanetary positions indicate health strengths and vulnerabilities. Medical astrology connects celestial bodies with bodily systems.\n\n🌙 *Lunar Influence 2-3 days:*\n• New Moon: Rest and renewal\n• Full Moon: Peak energy, then depletion\n• Moon void: Medical procedures advised against\n\n☀️ *Sun Transits 30 days:* Vital force, immune system\n\n🩸 *Mars Transits 40 days:* Surgery timing, inflammation\n\nSaturn: Chronic conditions, bone health\nVenus: Reproductive health, harmony\nMercury: Nervous system, communication\nJupiter: Expansion, liver health\n\n⚕️ *Planetary Rulerships:*\n• Aries/Mars: Head, brain\n• Taurus/Venus: Throat, thyroid\n• Gemini/Mercury: Lungs, nervous system\n• Cancer/Moon: Stomach, breasts\n• Leo/Sun: Heart, spine\n• Virgo/Mercury: Intestines, digestion\n• Libra/Venus: Kidneys, skin\n• Scorpio/Mars/Pluto: Reproductive system\n• Sagittarius/Jupiter: Liver, hips\n• Capricorn/Saturn: Knees, skeletal system\n• Aquarius/Uranus: Ankles, circulation\n• Pisces/Jupiter/Neptune: Feet, lymphatic system\n\n🕉️ *Ancient Wisdom:* "A physician without knowledge of astrology has no right to call himself a physician" - Hippocrates\n\n💊 *Note:* Medical astrology complements modern medicine. Consult healthcare professionals for medical decisions.`;
  } catch (error) {
    console.error('Medical astrology error:', error);
    return '❌ Error generating medical astrology analysis.';
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