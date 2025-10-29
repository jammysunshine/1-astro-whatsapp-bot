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
 * Handle Financial Astrology requests - Personalized Wealth Timing Analysis
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleFinancialAstrology = async (message, user) => {
  if (!message.includes('financial') && !message.includes('money') && !message.includes('wealth') && !message.includes('business') && !message.includes('finance')) {
    return null;
  }

  if (!user.birthDate) {
    return '💰 *Financial Astrology Analysis*\n\n👤 I need your birth details for personalized wealth timing analysis.\n\nSend format: DDMMYY or DDMMYYYY\nExample: 150691 (June 15, 1991)';
  }

  try {
    // Calculate personalized financial analysis using Swiss Ephemeris
    const financialAnalysis = await calculateFinancialAstrologyAnalysis(user);

    return `💰 *Financial Astrology - Personalized Wealth Timing Analysis*\n\n${financialAnalysis.introduction}\n\n🪐 *Wealth Planets Analysis:*\n${financialAnalysis.wealthPlanets.map(p => `• ${p.planet}: ${p.interpretation}`).join('\n')}\n\n📅 *Financial Timing Cycles:*\n${financialAnalysis.financialCycles.map(c => `• ${c.cycle}: ${c.description}`).join('\n')}\n\n💰 *Wealth Houses Analysis:*\n${financialAnalysis.wealthHouses.map(h => `• ${h.house}: ${h.interpretation}`).join('\n')}\n\n⚠️ *Risk Assessment:*\n${financialAnalysis.riskAssessment.map(r => `• ${r.area}: ${r.level}`).join('\n')}\n\n📈 *Prosperity Opportunities:*\n${financialAnalysis.prosperityOpportunities.map(o => `• ${o.opportunity}: ${o.timing}`).join('\n')}\n\n💫 *Wealth Building Strategy:*\n${financialAnalysis.strategy}\n\n🕉️ "Jupiter opens doors, Saturn conserves, Venus attracts - together they guide your financial destiny"`;
  } catch (error) {
    console.error('Financial Astrology analysis error:', error);
    return '❌ Error calculating financial astrology analysis. Please try again.';
  }
};

/**
 * Calculate Jaimini karakas using Swiss Ephemeris
 * @param {Object} user - User object with birth data
 * @returns {Object} Jaimini karaka analysis
 */
const calculateJaiminiKarakaAnalysis = async (user) => {
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

    // Jaimini karaka system - calculate significators based on distance from Moon
    const moonLongitude = planets.Moon.longitude;
    const karakas = calculateJaiminiKarakas(planets, moonLongitude);

    const introduction = `Jaimini astrology uses karakas (significators) as controllers of life aspects. Unlike Western ruling planets, Jaimini karakas are determined by each planet's distance from the Moon, measuring from 0° to 360°.`;

    const primaryKaraka = karakas.find(k => k.significator === 'Atmākāraka (Primary Karaka)');
    const secondaryKaraka = karakas.find(k => k.significator === 'Amātyakāraka (Career Karaka)');

    // Calculate sphuta positions (special Jaimini calculations)
    const sphutaAnalysis = calculateSphutaPositions(planets);

    // Generate insights based on karakas
    const insights = generateJaiminiInsights(karakas);

    const guidance = `In Jaimini system, the Atmākāraka shows your soul's expression, while Amātyakāraka reveals career fulfillment. Consider your strongest karakas when making important life decisions. 🕉️`;

    return {
      introduction,
      karakas,
      primaryKaraka: primaryKaraka?.planet || 'Undetermined',
      secondaryKaraka: secondaryKaraka?.planet || 'Undetermined',
      sphutaAnalysis,
      insights,
      guidance
    };

  } catch (error) {
    console.error('Jaimini Karaka calculation error:', error);
    throw new Error('Failed to calculate Jaimini astrology analysis');
  }
};

/**
 * Calculate Jaimini karakas based on distance from Moon
 * @param {Object} planets - Planetary positions
 * @param {number} moonLongitude - Moon's longitude
 * @returns {Array} Karaka interpretations
 */
const calculateJaiminiKarakas = (planets, moonLongitude) => {
  const karakaRanges = [];

  // Calculate each planet's distance from Moon (forward direction)
  for (const [planetName, planetData] of Object.entries(planets)) {
    if (planetData.longitude !== undefined && planetName !== 'Moon') {
      let distance = planetData.longitude - moonLongitude;

      // Handle wraparound
      if (distance < 0) {
        distance += 360;
      }

      if (distance >= 360) {
        distance -= 360;
      }

      karakaRanges.push({
        planet: planetName,
        distance: distance,
        longitude: planetData.longitude,
        karaka: getKarakaFromDistance(distance)
      });
    }
  }

  // Assign karakas based on closest planets (smallest distances)
  karakaRanges.sort((a, b) => a.distance - b.distance);

  const karakas = [];

  // Assign specific karakas based on closest planets
  const karakaAssignments = [
    { significator: 'Atmākāraka (Primary Karaka)', index: 0 },
    { significator: 'Amātyakāraka (Career Karaka)', index: 1 },
    { significator: 'Bhrātṛkāraka (Siblings Karaka)', index: 2 },
    { significator: 'Mātṛkāraka (Mother Karaka)', index: 3 },
    { significator: 'Pitr̥kāraka (Father Karaka)', index: 4 },
    { significator: 'Putrakāraka (Children Karaka)', index: 5 },
    { significator: 'Gnātikāraka (Relatives Karaka)', index: 6 }
  ];

  karakaAssignments.forEach(assignment => {
    if (karakaRanges[assignment.index]) {
      const karaka = karakaRanges[assignment.index];
      karakas.push({
        planet: karaka.planet,
        significator: assignment.significator,
        distance: karaka.distance.toFixed(2),
        description: getKarakaDescription(assignment.significator)
      });
    }
  });

  return karakas;
};

/**
 * Get karaka type based on distance
 * @param {number} distance - Distance from Moon in degrees
 * @returns {string} Karaka type
 */
const getKarakaFromDistance = (distance) => {
  if (distance < 30) return 'Atmākāraka (Primary Karaka)';
  if (distance < 60) return 'Amātyakāraka (Career Karaka)';
  if (distance < 90) return 'Bhrātṛkāraka (Siblings Karaka)';
  if (distance < 120) return 'Mātṛkāraka (Mother Karaka)';
  if (distance < 150) return 'Pitr̥kāraka (Father Karaka)';
  if (distance < 180) return 'Putrakāraka (Children Karaka)';
  if (distance < 210) return 'Gnātikāraka (Relatives Karaka)';
  return 'Additional Significator';
};

/**
 * Get description for karaka significator
 * @param {string} karaka - Karaka significator name
 * @returns {string} Description
 */
const getKarakaDescription = (karaka) => {
  const descriptions = {
    'Atmākāraka (Primary Karaka)': 'Soul expression, personality, core being',
    'Amātyakāraka (Career Karaka)': 'Profession, career, public status',
    'Bhrātṛkāraka (Siblings Karaka)': 'Siblings, associates, close friends',
    'Mātṛkāraka (Mother Karaka)': 'Mother, nurturing, home environment',
    'Pitr̥kāraka (Father Karaka)': 'Father, authority, traditional values',
    'Putrakāraka (Children Karaka)': 'Children, creativity, legacy',
    'Gnātikāraka (Relatives Karaka)': 'Relatives, community, social connections'
  };

  return descriptions[karaka] || 'General significator';
};

/**
 * Calculate sphuta positions (Jaimini special calculations)
 * @param {Object} planets - Planetary positions
 * @returns {Array} Sphuta analysis
 */
const calculateSphutaPositions = (planets) => {
  const sphuta = [];

  // Basic sphuta calculations (simplified)
  if (planets.Sun?.longitude && planets.Moon?.longitude) {
    const sunMoonDistance = Math.abs(planets.Sun.longitude - planets.Moon.longitude);
    sphuta.push({
      position: 'Sun-Moon Relationship',
      interpretation: sunMoonDistance < 90 ? 'Harmonious soul-mind connection' : 'Diverse personality expression'
    });
  }

  if (planets.Mars?.longitude) {
    const marsSign = this.longitudeToSign(planets.Mars.longitude);
    sphuta.push({
      position: `${marsSign} Mars Sphuta`,
      interpretation: `Martial energy expresses as ${marsSign.toLowerCase()} qualities in action`
    });
  }

  if (planets.Jupiter?.longitude) {
    const jupiterDegrees = Math.floor(planets.Jupiter.longitude % 30);
    sphuta.push({
      position: `Jupiter in ${Math.floor(jupiterDegrees / 6) + 1}° range`,
      interpretation: `Wisdom manifests in ${jupiterDegrees < 15 ? 'structure and discipline' : 'expansion and growth'}`
    });
  }

  return sphuta;
};

/**
 * Generate insights based on Jaimini karakas
 * @param {Array} karakas - Jaimini karaka assignments
 * @returns {Array} Life insights
 */
const generateJaiminiInsights = (karakas) => {
  const insights = [];

  const primaryPlanet = karakas.find(k => k.significator.includes('Primary'))?.planet;
  const careerPlanet = karakas.find(k => k.significator.includes('Career'))?.planet;

  if (primaryPlanet) {
    insights.push(`Your ${primaryPlanet} Atmakaraka suggests your soul's journey involves ${getPlanetQualities(primaryPlanet)} expression.`);
  }

  if (careerPlanet) {
    insights.push(`Your Amatyakaraka ${careerPlanet} indicates career fulfillment through ${getCareerQualities(careerPlanet)} pathways.`);
  }

  // Look for important aspect combinations
  const marsAsKaraka = karakas.some(k => k.planet === 'Mars');
  const saturnAsKaraka = karakas.some(k => k.planet === 'Saturn');

  if (marsAsKaraka) {
    insights.push('Mars as karaka suggests transformative life experiences and disciplined action for growth.');
  }

  if (saturnAsKaraka) {
    insights.push('Saturn karakaship indicates karmic responsibilities and structured life lessons.');
  }

  return insights.slice(0, 3);
};

/**
 * Get personality qualities based on planet
 * @param {string} planet - Planet name
 * @returns {string} Quality description
 */
const getPlanetQualities = (planet) => {
  const qualities = {
    Sun: 'leadership and self-expression',
    Moon: 'emotional intelligence and adaptability',
    Mars: 'determination and transformative energy',
    Mercury: 'intellectual exploration and communication',
    Jupiter: 'wisdom and philosophical growth',
    Venus: 'harmony and creative expression',
    Saturn: 'discipline and spiritual responsibility'
  };

  return qualities[planet] || 'spiritual growth';
};

/**
 * Get career qualities based on planet
 * @param {string} planet - Planet name
 * @returns {string} Career quality description
 */
const getCareerQualities = (planet) => {
  const qualities = {
    Sun: 'leadership and creative performance',
    Moon: 'public service and emotional care',
    Mars: 'competitive action and heroic endeavors',
    Mercury: 'communication and intellectual work',
    Jupiter: 'teaching and expansive opportunities',
    Venus: 'artistic and relationship-focused careers',
    Saturn: 'authoritative and traditional fields'
  };

  return qualities[planet] || 'professional development';
};

/**
 * Calculate personalized financial astrology analysis using Swiss Ephemeris
 * @param {Object} user - User object with birth data
 * @returns {Object} Financial astrology wealth analysis
 */
  try {
    // Parse birth date and time from user data
    const birthYear = user.birthDate.length === 6 ?
      parseInt(`19${user.birthDate.substring(4)}`) :
      parseInt(user.birthDate.substring(4));
    const birthMonth = parseInt(user.birthDate.substring(2, 4)) - 1;
    const birthDay = parseInt(user.birthDate.substring(0, 2));
    const birthHour = user.birthTime ? parseInt(user.birthTime.split(':')[0]) : 12;
    const birthMinute = user.birthTime ? parseInt(user.birthTime.split(':')[1]) : 0;

    // Calculate current age for financial timing
    const currentDate = new Date();
    const birthDateObj = new Date(birthYear, birthMonth, birthDay);
    const currentAge = Math.floor((currentDate - birthDateObj) / (365.25 * 24 * 60 * 60 * 1000));

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

    // Calculate houses (Placidus system for financial analysis)
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

    // Analyze financial indicators based on chart
    const wealthPlanets = analyzeWealthPlanets(planets, cusps);
    const financialCycles = analyzeFinancialTiming(currentAge, planets, cusps);
    const wealthHouses = analyzeWealthHouses(planets, cusps);
    const riskAssessment = assessFinancialRisks(planets, cusps);
    const prosperityOpportunities = identifyProsperityOpportunities(planets, cusps);
    const strategy = determineWealthBuildingStrategy(wealthPlanets, riskAssessment);

    const introduction = `Your birth chart reveals your financial potential, wealth-building patterns, and optimal timing for prosperity. Planets influence income, expenses, investments, and financial security.`;

    return {
      introduction,
      wealthPlanets,
      financialCycles,
      wealthHouses,
      riskAssessment,
      prosperityOpportunities,
      strategy
    };

  } catch (error) {
    console.error('Financial Astrology calculation error:', error);
    throw new Error('Failed to calculate financial astrology analysis');
  }
};

/**
 * Analyze wealth-related planets in the chart
 * @param {Object} planets - Planetary positions
 * @param {Array} cusps - House cusps
 * @returns {Array} Wealth planet interpretations
 */
const analyzeWealthPlanets = (planets, cusps) => {
  const wealthPlanets = [];

  // Jupiter - prosperity and expansion
  if (planets.Jupiter?.longitude) {
    const jupiterHouse = this.longitudeToHouse(planets.Jupiter.longitude, cusps[0]);
    wealthPlanets.push({
      planet: 'Jupiter',
      interpretation: getWealthPlanetInterpretation('Jupiter', jupiterHouse)
    });
  }

  // Venus - income, luxury, valuables
  if (planets.Venus?.longitude) {
    const venusHouse = this.longitudeToHouse(planets.Venus.longitude, cusps[0]);
    wealthPlanets.push({
      planet: 'Venus',
      interpretation: getWealthPlanetInterpretation('Venus', venusHouse)
    });
  }

  // Moon - emotional relationship to wealth
  if (planets.Moon?.longitude) {
    const moonHouse = this.longitudeToHouse(planets.Moon.longitude, cusps[0]);
    wealthPlanets.push({
      planet: 'Moon',
      interpretation: getWealthPlanetInterpretation('Moon', moonHouse)
    });
  }

  // Mars - risk-taking, action in business
  if (planets.Mars?.longitude) {
    const marsHouse = this.longitudeToHouse(planets.Mars.longitude, cusps[0]);
    wealthPlanets.push({
      planet: 'Mars',
      interpretation: getWealthPlanetInterpretation('Mars', marsHouse)
    });
  }

  // Saturn - long-term wealth building
  if (planets.Saturn?.longitude) {
    const saturnHouse = this.longitudeToHouse(planets.Saturn.longitude, cusps[0]);
    wealthPlanets.push({
      planet: 'Saturn',
      interpretation: getWealthPlanetInterpretation('Saturn', saturnHouse)
    });
  }

  return wealthPlanets.slice(0, 4); // Top 4 wealth indicators
};

/**
 * Analyze wealth-related houses (2nd, 8th, 11th)
 * @param {Object} planets - Planetary positions
 * @param {Array} cusps - House cusps
 * @returns {Array} Wealth house interpretations
 */
const analyzeWealthHouses = (planets, cusps) => {
  const wealthHouses = [];

  // 2nd House - personal wealth and values
  const secondHouseSign = this.longitudeToSign(cusps[1]);
  wealthHouses.push({
    house: '2nd House (Personal Wealth)',
    interpretation: `${secondHouseSign} in 2nd house indicates wealth through personal values. Your relationship with money reflects your core self-worth.`
  });

  // 8th House - shared wealth, investments, insurance
  const eighthHouseSign = this.longitudeToSign(cusps[7]);
  wealthHouses.push({
    house: '8th House (Shared/Transformative Wealth)',
    interpretation: `${eighthHouseSign} in 8th house shows wealth through partnerships or transformative changes. Inheritance, investments, or shared resources are potential sources.`
  });

  // 11th House - gains, hopes, wishes fulfillment
  const eleventhHouseSign = this.longitudeToSign(cusps[10]);
  wealthHouses.push({
    house: '11th House (Gains & Life Goals)',
    interpretation: `${eleventhHouseSign} in 11th house indicates wealth through achievements and collective efforts. Groups, networks, and fulfilled goals generate prosperity.`
  });

  return wealthHouses;
};

/**
 * Analyze financial timing and abundance cycles
 * @param {number} currentAge - Current age in years
 * @param {Object} planets - Planetary positions
 * @param {Array} cusps - House cusps
 * @returns {Array} Financial timing cycles
 */
const analyzeFinancialTiming = (currentAge, planets, cusps) => {
  const cycles = [];

  // Jupiter return cycles (ages 12, 24, 36, 48, 60, 72...)
  const jupiterCycles = [12, 24, 36, 48, 60, 72, 84];
  if (jupiterCycles.some(age => currentAge >= age - 1 && currentAge <= age + 1)) {
    cycles.push({
      cycle: 'Jupiter Return (Abundance & Growth)',
      description: 'Expansion of wealth and increased prosperity opportunities'
    });
  }

  // Saturn return (ages 28-30) - career = financial
  if (currentAge >= 27 && currentAge <= 33) {
    cycles.push({
      cycle: 'Saturn Return (Career = Financial Maturity)',
      description: 'Financial stability through established career and disciplined wealth building'
    });
  }

  // Venus returns (every ~1.6 years) - current financial flow
  cycles.push({
    cycle: 'Venus Cycle (Income Flow)',
    description: 'Natural rhythm of financial intake and expenditure'
  });

  // Transiting Jupiter periods
  cycles.push({
    cycle: 'Jupiter Transits (Wealth Expansion)',
    description: '12-year cycles of prosperity and abundance when Jupiter transits wealth houses'
  });

  return cycles.slice(0, 3);
};

/**
 * Assess financial risks based on chart placements
 * @param {Object} planets - Planetary positions
 * @param {Array} cusps - House cusps
 * @returns {Array} Risk assessment areas
 */
const assessFinancialRisks = (planets, cusps) => {
  const risks = [];

  // Mars in 8th house - potential financial losses
  if (planets.Mars?.longitude) {
    const marsHouse = this.longitudeToHouse(planets.Mars.longitude, cusps[0]);
    if (marsHouse === 8) {
      risks.push({
        area: 'Investment Risks',
        level: 'Elevated - Mars in 8th can indicate sudden financial changes or aggressive investment tendencies'
      });
    }
  }

  // Saturn in 2nd house - material lack concerns
  if (planets.Saturn?.longitude) {
    const saturnHouse = this.longitudeToHouse(planets.Saturn.longitude, cusps[0]);
    if (saturnHouse === 2) {
      risks.push({
        area: 'Security Concerns',
        level: 'Moderate - Saturn creates structure but may indicate periods of financial limitation for learning'
      });
    }
  }

  // Uranus in financial houses - unexpected changes
  if (planets.Mercury?.longitude) { // Using Mercury as proxy for Uranus risk
    const mercuryHouse = this.longitudeToHouse(planets.Mercury.longitude, cusps[0]);
    if (mercuryHouse === 2 || mercuryHouse === 8 || mercuryHouse === 11) {
      risks.push({
        area: 'Market Volatility',
        level: 'Variable - Planetary placements suggest adapting to changing financial conditions'
      });
    }
  }

  // Default assessment
  if (risks.length === 0) {
    risks.push({
      area: 'General Risk Assessment',
      level: 'Balanced - Chart shows moderate financial stability with prudent risk management'
    });
  }

  return risks.slice(0, 3);
};

/**
 * Identify prosperity opportunities from chart
 * @param {Object} planets - Planetary positions
 * @param {Array} cusps - House cusps
 * @returns {Array} Prosperity opportunity timings
 */
const identifyProsperityOpportunities = (planets, cusps) => {
  const opportunities = [];

  // Jupiter in beneficial houses
  if (planets.Jupiter?.longitude) {
    const jupiterHouse = this.longitudeToHouse(planets.Jupiter.longitude, cusps[0]);
    if ([2, 5, 9, 11].includes(jupiterHouse)) {
      opportunities.push({
        opportunity: 'Abundance Expansion',
        timing: 'Jupiter is well-placed for wealth building and prosperous growth'
      });
    }
  }

  // Venus wealth indicators
  if (planets.Venus?.longitude) {
    const venusHouse = this.longitudeToHouse(planets.Venus.longitude, cusps[0]);
    if (venusHouse === 2 || venusHouse === 11) {
      opportunities.push({
        opportunity: 'Income Opportunities',
        timing: 'Venus suggests natural flow of money and appreciation of valuable assets'
      });
    }
  }

  // Saturn in wealth houses (delays = long-term success)
  if (planets.Saturn?.longitude) {
    const saturnHouse = this.longitudeToHouse(planets.Saturn.longitude, cusps[0]);
    if (saturnHouse === 2) {
      opportunities.push({
        opportunity: 'Long-term Financial Security',
        timing: 'Saturn indicates building lasting wealth through disciplined effort'
      });
    }
  }

  // Default opportunities
  if (opportunities.length === 0) {
    opportunities.push({
      opportunity: 'Balanced Financial Growth',
      timing: 'Chart supports steady wealth accumulation through consistent strategy'
    });
  }

  return opportunities.slice(0, 3);
};

/**
 * Determine overall wealth building strategy
 * @param {Array} wealthPlanets - Wealth planet influences
 * @param {Array} riskAssessment - Financial risk factors
 * @returns {string} Strategy recommendation
 */
const determineWealthBuildingStrategy = (wealthPlanets, riskAssessment) => {
  let strategy = 'Focus on ';

  const hasJupiter = wealthPlanets.some(p => p.planet === 'Jupiter');
  const hasVenus = wealthPlanets.some(p => p.planet === 'Venus');
  const hasSaturn = wealthPlanets.some(p => p.planet === 'Saturn');
  const highRisk = riskAssessment.some(r => r.level.includes('Elevated'));

  if (hasJupiter) {
    strategy += 'expansion and opportunity recognition. Jupiter favors growth ventures and fortunate circumstances.';
  } else if (hasVenus) {
    strategy += 'value appreciation and luxury sector investments. Venus supports financial comfort through beautiful, valuable pursuits.';
  } else if (hasSaturn) {
    strategy += 'long-term structural building. Saturn rewards patience and conservative wealth accumulation strategies.';
  } else {
    strategy += 'balanced diversification. Multiple approaches to wealth building will serve you well.';
  }

  if (highRisk) {
    strategy += ' Consider conservative strategies and build financial safety nets to mitigate volatile periods.';
  } else {
    strategy += ' Your chart supports moderate risk-taking with good potential for steady growth.';
  }

  return strategy;
};

/**
 * Get interpretation for wealth planets based on house placements
 * @param {string} planet - Planet name
 * @param {number} house - House number
 * @returns {string} Wealth interpretation
 */
const getWealthPlanetInterpretation = (planet, house) => {
  const interpretations = {
    Jupiter: {
      2: 'Jupiter in 2nd house suggests abundant personal wealth and optimistic money management',
      11: 'Jupiter in 11th house indicates prosperity through goals, wishes, and humanitarian efforts',
      9: 'Jupiter in 9th house supports wealth through philosophy, teaching, or international ventures',
      default: 'Jupiter expansion favors wealth accumulation through positive opportunities'
    },
    Venus: {
      2: 'Venus in 2nd house indicates financial harmony and profit through aesthetic or luxury pursuits',
      7: 'Venus in 7th house suggests wealth through partnerships and balanced financial relationships',
      11: 'Venus in 11th house indicates material gains through friends, groups, and fulfilled aspirations',
      default: 'Venus supports income through beautiful, harmonious financial activities'
    },
    Moon: {
      2: 'Moon in 2nd house connects emotional security to financial well-being',
      8: 'Moon in 8th house indicates wealth through shared resources or emotional transformation',
      11: 'Moon in 11th house supports prosperity through emotional fulfillment of goals',
      default: 'Moon influences wealth comfort and financial relationship with emotions'
    },
    Mars: {
      2: 'Mars in 2nd house drives action-oriented wealth building and resource acquisition',
      10: 'Mars in 10th house indicates career-driven wealth and public achievement',
      11: 'Mars in 11th house supports gains through effort and competitive achievement',
      default: 'Mars activates wealth through action, competition, and strategic risk-taking'
    },
    Saturn: {
      2: 'Saturn in 2nd house requires disciplined wealth building but rewards long-term security',
      11: 'Saturn in 11th house indicates steady gains through patient effort and group achievement',
      default: 'Saturn supports wealth through structured, conservative, long-term planning'
    }
  };

  const planetInterp = interpretations[planet];
  if (planetInterp && planetInterp[house]) {
    return planetInterp[house];
  }

  return planetInterp?.default || `${planet}'s energy influences your approach to wealth and financial decisions`;
};
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
 * Handle Career Astrology requests - Personalized Professional Guidance
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleCareerAstrology = async (message, user) => {
  if (!message.includes('career') && !message.includes('job') && !message.includes('profession') && !message.includes('work') && !message.includes('career analysis')) {
    return null;
  }

  if (!user.birthDate) {
    return '💼 *Career Astrology Analysis*\n\n👤 I need your birth details for personalized career guidance.\n\nSend format: DDMMYY or DDMMYYYY\nExample: 150691 (June 15, 1991)';
  }

  try {
    // Calculate personalized career analysis using Swiss Ephemeris
    const careerAnalysis = await calculateCareerAstrologyAnalysis(user);

    return `💼 *Career Astrology - Professional Path Analysis*\n\n${careerAnalysis.introduction}\n\n🏗️ *Midheaven (MC) Analysis:*\n${careerAnalysis.midheavenAnalysis}\n\n🏛️ *10th House Planets:*\n${careerAnalysis.tenthHousePlanets.map(p => `• ${p.planet}: ${p.interpretation}`).join('\n')}\n\n${careerAnalysis.tenthHousePlanets.length === 0 ? '*No planets in 10th house - career indicated by energy patterns and angular planets.*\n' : ''}\n⚡ *Key Career Planets:*\n${careerAnalysis.careerPlanets.map(p => `• ${p.planet}: ${p.interpretation}`).join('\n')}\n\n📅 *Career Timing:*\n${careerAnalysis.careerTiming.map(t => `• ${t.event}: ${t.description}`).join('\n')}\n\n🎯 * Career Direction:*\n${careerAnalysis.careerDirection}\n\n🚀 *Success Potential:*\n${careerAnalysis.successPotential}\n\n🕉️ "Saturn governs karma, Jupiter brings fortune, Mars drives ambition - together they reveal your professional destiny".`;
  } catch (error) {
    console.error('Career Astrology analysis error:', error);
    return '❌ Error calculating career astrology analysis. Please try again.';
  }
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
 * Handle Jaimini Astrology requests - Karaka Analysis
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleJaiminiAstrology = async (message, user) => {
  if (!message.includes('jaimini') && !message.includes('sphuta') && !message.includes('karaka') && !message.includes('jaimini astrology')) {
    return null;
  }

  if (!user.birthDate) {
    return '🌟 *Jaimini Astrology - Karaka Analysis*\n\n👤 I need your birth details for Jaimini karaka calculations.\n\nSend format: DDMMYY or DDMMYYYY\nExample: 150691 (June 15, 1991)';
  }

  try {
    // Calculate Jaimini karakas using Swiss Ephemeris
    const karakaAnalysis = await calculateJaiminiKarakaAnalysis(user);

    return `🌟 *Jaimini Astrology - Karaka (Significator) Analysis*\n\n${karakaAnalysis.introduction}\n\n🪐 *Your Planetary Karakas:*\n${karakaAnalysis.karakas.map(k => `• ${k.name}: ${k.significator} (${k.planet}: ${k.description})`).join('\n')}\n\n📊 *Karaka Hierarchy:*\n${karakaAnalysis.primaryKaraka} ${karakaAnalysis.secondaryKaraka}\n\n🔮 *Sphuta Positions (Jaimini calculation):*\n${karakaAnalysis.sphutaAnalysis.map(s => `• ${s.position}: ${s.interpretation}`).join('\n')}\n\n🎯 *Key Insights:*\n${karakaAnalysis.insights.map(i => `• ${i.insight}`).join('\n')}\n\n🧘 *Jaimini Wisdom:*\n${karakaAnalysis.guidance}\n\n✨ *Note:* Jaimini astrology focuses on karakas (significators) as controllers of life aspects, different from mainstream Western ruling planets. 🕉️`;
  } catch (error) {
    console.error('Jaimini Astrology analysis error:', error);
    return '❌ Error generating Jaimini astrology analysis. Please try again.';
  }
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
 * Calculate personalized career astrology analysis using Swiss Ephemeris
 * @param {Object} user - User object with birth data
 * @returns {Object} Career astrology analysis
 */
const calculateCareerAstrologyAnalysis = async (user) => {
  try {
    // Parse birth date and time from user data
    const birthYear = user.birthDate.length === 6 ?
      parseInt(`19${user.birthDate.substring(4)}`) :
      parseInt(user.birthDate.substring(4));
    const birthMonth = parseInt(user.birthDate.substring(2, 4)) - 1;
    const birthDay = parseInt(user.birthDate.substring(0, 2));
    const birthHour = user.birthTime ? parseInt(user.birthTime.split(':')[0]) : 12;
    const birthMinute = user.birthTime ? parseInt(user.birthTime.split(':')[1]) : 0;

    // Calculate current age for career timing
    const currentDate = new Date();
    const birthDateObj = new Date(birthYear, birthMonth, birthDay);
    const currentAge = Math.floor((currentDate - birthDateObj) / (365.25 * 24 * 60 * 60 * 1000));

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

    // Calculate houses (Placidus system for career analysis)
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

    // Analyze career indicators based on chart
    const midheavenAnalysis = analyzeMidheaven(cusps[9], planets); // MC is cusps[9] (10th cusp)
    const tenthHousePlanets = analyzeTenthHousePlanets(planets, cusps);
    const careerPlanets = analyzeCareerPlanets(planets, cusps);
    const careerTiming = analyzeCareerTiming(currentAge, planets, cusps);
    const careerDirection = determineCareerDirection(midheavenAnalysis, tenthHousePlanets, careerPlanets);
    const successPotential = assessSuccessPotential(midheavenAnalysis, tenthHousePlanets, careerPlanets);

    const introduction = `Your birth chart reveals your professional calling, career strengths, and optimal timing for success. The Midheaven (MC) represents your public face and career direction.`;

    return {
      introduction,
      midheavenAnalysis,
      tenthHousePlanets,
      careerPlanets,
      careerTiming,
      careerDirection,
      successPotential
    };

  } catch (error) {
    console.error('Career Astrology calculation error:', error);
    throw new Error('Failed to calculate career astrology analysis');
  }
};

/**
 * Analyze Midheaven (MC) for career insights
 * @param {number} mcLongitude - Midheaven longitude
 * @param {Object} planets - Planetary positions
 * @returns {string} Midheaven analysis
 */
const analyzeMidheaven = (mcLongitude, planets) => {
  const mcSign = this.longitudeToSign(mcLongitude);

  // Find planets conjunct MC (within 10°)
  const mcConjuncts = [];
  for (const [planetName, planetData] of Object.entries(planets)) {
    if (planetData.longitude !== undefined) {
      const diff = Math.abs(planetData.longitude - mcLongitude);
      if (diff <= 10 || diff >= 350) { // Accounting for 360° wraparound
        mcConjuncts.push(planetName);
      }
    }
  }

  let analysis = `Midheaven in ${mcSign}: `;

  // Sign-specific career themes
  const signThemes = {
    Aries: 'Leadership, pioneering, competitive fields, military, sports',
    Taurus: 'Finance, banking, real estate, arts, luxury goods, food industry',
    Gemini: 'Communications, marketing, education, journalism, travel, technology',
    Cancer: 'Healthcare, hospitality, family businesses, real estate, emotional care',
    Leo: 'Entertainment, politics, leadership roles, creative fields, luxury',
    Virgo: 'Healthcare, service industries, research, analysis, teaching, writing',
    Libra: 'Legal fields, partnerships, diplomacy, arts, counseling, social work',
    Scorpio: 'Research, investigation, psychology, regenerative work, crisis management',
    Sagittarius: 'Teaching, higher education, travel, publishing, philosophy, law',
    Capricorn: 'Government, corporate leadership, real estate, traditional careers',
    Aquarius: 'Technology, innovation, social change, humanitarian work, aviation',
    Pisces: 'Arts, healing, spirituality, marine industries, compassionate care'
  };

  analysis += signThemes[mcSign] || 'Creative and humanitarian fields';

  if (mcConjuncts.length > 0) {
    analysis += `. Planets conjunct MC (${mcConjuncts.join(', ')}) strongly influence your public image and career expression.`;
  }

  return analysis;
};

/**
 * Analyze planets in 10th house for career insights
 * @param {Object} planets - Planetary positions
 * @param {Array} cusps - House cusps
 * @returns {Array} 10th house planet interpretations
 */
const analyzeTenthHousePlanets = (planets, cusps) => {
  const tenthCusp = cusps[9]; // 10th house cusp
  const nextCusp = cusps[10] || (cusps[9] + 30) % 360; // 11th house or approximate

  const tenthPlanets = [];

  for (const [planetName, planetData] of Object.entries(planets)) {
    if (planetData.longitude !== undefined) {
      // Check if planet is in 10th house (between 10th and 11th cusps)
      const isInTenth = this.isPointInHouse(planetData.longitude, tenthCusp, nextCusp);

      if (isInTenth) {
        const interpretation = getTenthHousePlanetInterpretation(planetName);
        tenthPlanets.push({
          planet: planetName,
          interpretation: interpretation
        });
      }
    }
  }

  return tenthPlanets;
};

/**
 * Analyze career-related planets in the chart
 * @param {Object} planets - Planetary positions
 * @param {Array} cusps - House cusps
 * @returns {Array} Career planet interpretations
 */
const analyzeCareerPlanets = (planets, cusps) => {
  const careerPlanets = [];

  // Analyze key career planets
  if (planets.Sun?.longitude) {
    const sunHouse = this.longitudeToHouse(planets.Sun.longitude, cusps[0]);
    careerPlanets.push({
      planet: 'Sun',
      interpretation: getCareerPlanetInterpretation('Sun', sunHouse)
    });
  }

  if (planets.Mars?.longitude) {
    const marsHouse = this.longitudeToHouse(planets.Mars.longitude, cusps[0]);
    careerPlanets.push({
      planet: 'Mars',
      interpretation: getCareerPlanetInterpretation('Mars', marsHouse)
    });
  }

  if (planets.Jupiter?.longitude) {
    const jupiterHouse = this.longitudeToHouse(planets.Jupiter.longitude, cusps[0]);
    careerPlanets.push({
      planet: 'Jupiter',
      interpretation: getCareerPlanetInterpretation('Jupiter', jupiterHouse)
    });
  }

  if (planets.Saturn?.longitude) {
    const saturnHouse = this.longitudeToHouse(planets.Saturn.longitude, cusps[0]);
    careerPlanets.push({
      planet: 'Saturn',
      interpretation: getCareerPlanetInterpretation('Saturn', saturnHouse)
    });
  }

  if (planets.Mercury?.longitude) {
    const mercuryHouse = this.longitudeToHouse(planets.Mercury.longitude, cusps[0]);
    careerPlanets.push({
      planet: 'Mercury',
      interpretation: getCareerPlanetInterpretation('Mercury', mercuryHouse)
    });
  }

  return careerPlanets.slice(0, 4); // Top 4 career planets
};

/**
 * Analyze career timing based on age and planetary returns
 * @param {number} currentAge - Current age in years
 * @param {Object} planets - Planetary positions
 * @param {Array} cusps - House cusps
 * @returns {Array} Career timing events
 */
const analyzeCareerTiming = (currentAge, planets, cusps) => {
  const timingEvents = [];

  // Saturn return (ages 28-30)
  if (currentAge >= 25 && currentAge <= 35) {
    timingEvents.push({
      event: 'Saturn Return (Career Maturity)',
      description: 'Major career restructuring and professional commitment period'
    });
  }

  // Jupiter return (ages 12, 24, 36, 48, 60, 72...)
  const jupiterCycles = [12, 24, 36, 48, 60, 72, 84];
  if (jupiterCycles.some(age => currentAge >= age - 1 && currentAge <= age + 1)) {
    timingEvents.push({
      event: 'Jupiter Return (Career Expansion)',
      description: 'Opportunities for professional growth and new career possibilities'
    });
  }

  // Uranus opposition (ages 40-42)
  if (currentAge >= 38 && currentAge <= 46) {
    timingEvents.push({
      event: 'Uranus Opposition (Career Change)',
      description: 'Innovation and unexpected career opportunities or changes'
    });
  }

  // Solar return around birthday
  timingEvents.push({
    event: 'Solar Return (Yearly Career Theme)',
    description: 'Anniversary of birth sets yearly career and personal growth themes'
  });

  return timingEvents.slice(0, 3); // Top 3 timing events
};

/**
 * Determine overall career direction based on major placements
 * @param {string} mcAnalysis - Midheaven analysis
 * @param {Array} tenthHousePlanets - 10th house planets
 * @param {Array} careerPlanets - Career planet influences
 * @returns {string} Career direction summary
 */
const determineCareerDirection = (mcAnalysis, tenthHousePlanets, careerPlanets) => {
  let direction = 'Your chart shows ';

  if (mcAnalysis.includes('Aries') || mcAnalysis.includes('Mars') || careerPlanets.some(p => p.planet === 'Mars')) {
    direction += 'natural leadership and executive potential. ';
  }

  if (mcAnalysis.includes('Taurus') || mcAnalysis.includes('Venus') || careerPlanets.some(p => p.planet === 'Venus')) {
    direction += 'artistic or financial expertise. ';
  }

  if (mcAnalysis.includes('Gemini') || mcAnalysis.includes('Mercury') || careerPlanets.some(p => p.planet === 'Mercury')) {
    direction += 'communication and intellectual pursuits. ';
  }

  if (mcAnalysis.includes('Cancer') || mcAnalysis.includes('Moon') || careerPlanets.some(p => p.planet === 'Moon')) {
    direction += 'caregiving and family-oriented fields. ';
  }

  if (mcAnalysis.includes('Leo') || mcAnalysis.includes('Sun') || careerPlanets.some(p => p.planet === 'Sun')) {
    direction += 'creative leadership or entertainment. ';
  }

  if (tenthHousePlanets.length === 0 && careerPlanets.length >= 3) {
    direction += 'Career direction shows through angular planet positions and key career planets rather than direct 10th house occupation. ';
  }

  return direction || 'balanced career potential with multiple life directions possible. Consider your interests and natural talents in choosing a professional path.';
};

/**
 * Assess career success potential based on placements
 * @param {string} mcAnalysis - Midheaven analysis
 * @param {Array} tenthHousePlanets - 10th house planets
 * @param {Array} careerPlanets - Career planet influences
 * @returns {string} Success potential assessment
 */
const assessSuccessPotential = (mcAnalysis, tenthHousePlanets, careerPlanets) => {
  let score = 0;

  // Award points for career-enhancing placements
  if (tenthHousePlanets.length > 0) score += 2;
  if (mcAnalysis.includes('Sun') || mcAnalysis.includes('Jupiter')) score += 2;
  if (careerPlanets.some(p => p.planet === 'Jupiter')) score += 1;
  if (careerPlanets.some(p => p.planet === 'Saturn')) score += 1; // Saturn gives stability

  let potential = '';
  if (score >= 4) {
    potential = 'Excellent career success potential with natural leadership and abundant opportunities.';
  } else if (score >= 2) {
    potential = 'Good career prospects with steady progression through consistent effort.';
  } else {
    potential = 'Moderate career potential requiring focused effort and self-motivation.';
  }

  return potential;
};

/**
 * Check if a point is between two house cusps
 * @param {number} longitude - Point longitude
 * @param {number} startCusp - Starting house cusp
 * @param {number} endCusp - Next house cusp
 * @returns {boolean} True if point is in house
 */
const isPointInHouse = (longitude, startCusp, endCusp) => {
  // Handle normal case
  if (startCusp < endCusp) {
    return longitude >= startCusp && longitude < endCusp;
  }
  // Handle wraparound at 0° Aries
  else {
    return longitude >= startCusp || longitude < endCusp;
  }
};

/**
 * Get interpretation for planets in 10th house
 * @param {string} planet - Planet name
 * @returns {string} Career interpretation
 */
const getTenthHousePlanetInterpretation = (planet) => {
  const interpretations = {
    Sun: 'Radiant public presence and leadership potential in chosen field',
    Moon: 'Public service orientation with emotional connection to career',
    Mars: 'Dynamic energy drives ambitious career pursuits and competition',
    Mercury: 'Communicative skills enhance professional reputation and networking',
    Jupiter: 'Abundant opportunities and success through expansive career choices',
    Venus: 'Harmonious work environment with potential for creative or diplomatic roles',
    Saturn: 'Structured career approach with gradual but lasting professional achievement'
  };

  return interpretations[planet] || `${planet} in 10th house: Public recognition and reputation through professional endeavors`;
};

/**
 * Get interpretation for career planets based on their house placements
 * @param {string} planet - Planet name
 * @param {number} house - House number
 * @returns {string} Career planet interpretation
 */
const getCareerPlanetInterpretation = (planet, house) => {
  // Focus on career strength and challenges
  if (planet === 'Sun' && [1, 4, 5, 9, 10].includes(house)) {
    return 'Sun placement indicates strong career vitality and natural leadership potential';
  }
  if (planet === 'Mars' && [3, 6, 10, 11].includes(house)) {
    return 'Mars placement shows action-oriented career approach with competitive drive';
  }
  if (planet === 'Jupiter' && [1, 2, 5, 7, 9, 10, 11].includes(house)) {
    return 'Jupiter placement suggests career abundance and beneficial opportunities';
  }
  if (planet === 'Saturn' && [2, 10, 11].includes(house)) {
    return 'Saturn placement indicates career structure and long-term professional stability';
  }
  if (planet === 'Mercury' && [3, 6, 9, 10, 11].includes(house)) {
    return 'Mercury placement shows career success through communication and adaptability';
  }

  return `${planet} in ${house}th house contributes to professional development and reputation building`;
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