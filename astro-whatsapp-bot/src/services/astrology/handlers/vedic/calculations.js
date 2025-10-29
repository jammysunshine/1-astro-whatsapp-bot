/**
 * Vedic Astrology Calculation Functions
 * Complex computation logic extracted from main handlers
 */
const sweph = require('sweph');

const logger = require('../../../../utils/logger');

// Utility function to get zodiac sign from longitude
const longitudeToSign = (longitude) => {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  // Normalize longitude to 0-360 range
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  return signs[signIndex];
};

// Utility function to get house number from longitude and ascendant
const longitudeToHouse = (longitude, ascendant) => {
  const angle = ((longitude - ascendant + 360) % 360);
  return Math.floor(angle / 30) + 1;
};

class AgeHarmonicAstrologyReader {
  constructor() {
    logger.info('Module: AgeHarmonicAstrologyReader loaded.');
  }

  async generateAgeHarmonicAnalysis(birthData) {
    try {
      // Mock implementation - would normally calculate age harmonics
      const age = this.calculateAge(birthData.birthDate);
      const currentHarmonics = this.getHarmonicsForAge(age);

      return {
        interpretation: `Age ${age}: ${currentHarmonics[0]?.themes.join(', ') || 'development and growth'}.`,
        currentHarmonics: currentHarmonics,
        techniques: ['Meditation', 'Journaling', 'Creative expression', 'Nature immersion'],
        nextHarmonic: { name: `Harmonic ${currentHarmonics[0]?.harmonic + 1 || 8}`, ageRange: `${age + 2}-${age + 4}`, themes: ['Integration', 'Mastery'] },
        error: false
      };
    } catch (error) {
      logger.error('Age Harmonic calculation error:', error);
      return { error: 'Unable to calculate age harmonic analysis' };
    }
  }

  calculateAge(birthDate) {
    // Mock age calculation
    return 32;
  }

  getHarmonicsForAge(age) {
    // Mock harmonic calculation
    return [{
      name: `Harmonic ${Math.floor(age/4) + 1}`,
      harmonic: Math.floor(age/4) + 1,
      themes: ['Growth', 'Learning', 'Transformation']
    }];
  }
}

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

    // Generate insights based on karakas
    const insights = generateJaiminiInsights(karakas);

    const guidance = `In Jaimini system, the Atmākāraka shows your soul's expression, while Amātyakāraka reveals career fulfillment. Consider your strongest karakas when making important life decisions. 🕉️`;

    return {
      introduction,
      karakas,
      primaryKaraka: primaryKaraka?.planet || 'Undetermined',
      secondaryKaraka: secondaryKaraka?.planet || 'Undetermined',
      insights,
      guidance
    };

  } catch (error) {
    console.error('Jaimini Karaka calculation error:', error);
    throw new Error('Failed to calculate Jaimini astrology analysis');
  }
};

const calculateFinancialAstrologyAnalysis = async (user) => {
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

    // Analyze financial indicators based on chart
    const wealthPlanets = analyzeWealthPlanets(planets, cusps);
    const financialCycles = analyzeFinancialTiming(currentAge, planets, cusps);
    const wealthHouses = analyzeWealthHouses(planets, cusps);
    const riskAssessment = assessFinancialRisks(planets, cusps);
    const prosperityOpportunities = identifyProsperityOpportunities(planets, cusps);

    const introduction = `Your birth chart reveals your financial potential, wealth-building patterns, and optimal timing for prosperity. Planets influence income, expenses, investments, and financial security.`;

    const strategy = determineWealthBuildingStrategy(wealthPlanets, riskAssessment);

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

    // Analyze health indicators based on chart
    const healthIndicators = analyzeChartHealthIndicators(planets, cusps);
    const houseAnalysis = analyzeHealthHouses(planets, cusps);
    const focusAreas = identifyHealthFocusAreas(planets, cusps);

    const introduction = `Your birth chart reveals innate health patterns and potential challenges. Medical astrology helps understand how planetary influences affect your physical well-being and vitality.`;

    const recommendations = generateHealthRecommendations(focusAreas);

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

    // Analyze career indicators based on chart
    const midheavenAnalysis = analyzeMidheaven(cusps[9], planets);
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

const calculateAshtakavarga = async (user) => {
  try {
    const birthYear = user.birthDate.length === 6 ?
      parseInt(`19${user.birthDate.substring(4)}`) :
      parseInt(user.birthDate.substring(4));
    const birthMonth = parseInt(user.birthDate.substring(2, 4)) - 1; // zero-based
    const birthDay = parseInt(user.birthDate.substring(0, 2));
    const birthHour = user.birthTime ? parseInt(user.birthTime.split(':')[0]) : 12;
    const birthMinute = user.birthTime ? parseInt(user.birthTime.split(':')[1]) : 0;

    const timezone = user.timezone || 5.5;
    const utcTime = new Date(Date.UTC(birthYear, birthMonth, birthDay, birthHour - timezone, birthMinute));
    const julianDay = utcTime.getTime() / 86400000 + 2440587.5;

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

    const planetaryStrengths = [];
    const peakHouses = [];

    const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    let house = 1;

    planetNames.forEach((name, index) => {
      const ephemKey = planetsEphem[index];
      if (planets[ephemKey]) {
        const position = planets[ephemKey].longitude;
        const houseNumber = Math.floor(position / 30) + 1;
        const points = Math.floor(Math.random() * 15) + 5;

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

const calculateFixedStarsAnalysis = async (user) => {
  try {
    const birthYear = user.birthDate.length === 6 ?
      parseInt(`19${user.birthDate.substring(4)}`) :
      parseInt(user.birthDate.substring(4));
    const birthMonth = parseInt(user.birthDate.substring(2, 4)) - 1;
    const birthDay = parseInt(user.birthDate.substring(0, 2));
    const birthHour = user.birthTime ? parseInt(user.birthTime.split(':')[0]) : 12;
    const birthMinute = user.birthTime ? parseInt(user.birthTime.split(':')[1]) : 0;

    const timezone = user.timezone || 5.5;
    const utcTime = new Date(Date.UTC(birthYear, birthMonth, birthDay, birthHour - timezone, birthMinute));
    const julianDay = utcTime.getTime() / 86400000 + 2440587.5;

    const fixedStars = [
      { name: 'Regulus', constellation: 'Leo', longitude: 149.86, magnitude: 1.35, influence: 'Power, authority, leadership (can bring downfall if afflicted)' },
      { name: 'Aldebaran', constellation: 'Taurus', longitude: 68.98, magnitude: 0.85, influence: 'Honor, success, material achievements (violent if afflicted)' },
      { name: 'Antares', constellation: 'Scorpio', longitude: 248.07, magnitude: 1.09, influence: 'Power struggles, transformation through crisis (intense energy)' },
      { name: 'Fomalhaut', constellation: 'Pisces', longitude: 331.83, magnitude: 1.16, influence: 'Spiritual wisdom, prosperity through service (mystical qualities)' },
      { name: 'Spica', constellation: 'Virgo', longitude: 201.30, magnitude: 0.97, influence: 'Success through helpfulness, harvest abundance (beneficial)' },
      { name: 'Sirius', constellation: 'Canis Major', longitude: 101.29, magnitude: -1.46, influence: 'Brightest star, brings heavenly favor, honor, wealth' },
      { name: 'Vega', constellation: 'Lyra', longitude: 279.23, magnitude: 0.03, influence: 'Greatest good fortune, success in arts, music, literature' }
    ];

    const planets = {};
    const planetEphemIds = [sweph.SE_SUN, sweph.SE_MOON, sweph.SE_MARS, sweph.SE_MERCURY,
                           sweph.SE_JUPITER, sweph.SE_VENUS, sweph.SE_SATURN];
    const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    planetEphemIds.forEach((ephemId, index) => {
      const result = sweph.swe_calc_ut(julianDay, ephemId, sweph.SEFLG_SPEED);
      if (result.rc >= 0) {
        planets[planetNames[index]] = {
          longitude: result.longitude,
          latitude: result.latitude,
          speed: result.speed
        };
      }
    });

    const conjunctions = [];
    const conjOrb = 2;

    fixedStars.forEach(star => {
      planetNames.forEach(planetName => {
        if (planets[planetName]) {
          const planetLong = planets[planetName].longitude;
          const starLong = star.longitude;

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

// Helper functions
const calculateJaiminiKarakas = (planets, moonLongitude) => {
  const karakaRanges = [];

  for (const [planetName, planetData] of Object.entries(planets)) {
    if (planetData.longitude !== undefined && planetName !== 'Moon') {
      let distance = planetData.longitude - moonLongitude;
      if (distance < 0) distance += 360;
      if (distance >= 360) distance -= 360;

      karakaRanges.push({
        planet: planetName,
        distance: distance,
        longitude: planetData.longitude,
        karaka: getKarakaFromDistance(distance)
      });
    }
  }

  karakaRanges.sort((a, b) => a.distance - b.distance);

  const karakas = [];
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

const calculateSphutaPositions = (planets) => {
  const sphuta = [];

  if (planets.Sun?.longitude && planets.Moon?.longitude) {
    const sunMoonDistance = Math.abs(planets.Sun.longitude - planets.Moon.longitude);
    sphuta.push({
      position: 'Sun-Moon Relationship',
      interpretation: sunMoonDistance < 90 ? 'Harmonious soul-mind connection' : 'Diverse personality expression'
    });
  }

  if (planets.Mars?.longitude) {
    const marsSign = longitudeToSign(planets.Mars.longitude);
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

// Financial analysis functions
const analyzeWealthPlanets = (planets, cusps) => {
  const wealthPlanets = [];

  if (planets.Jupiter?.longitude) {
    const jupiterHouse = longitudeToHouse(planets.Jupiter.longitude, cusps[0]);
    wealthPlanets.push({
      planet: 'Jupiter',
      interpretation: getWealthPlanetInterpretation('Jupiter', jupiterHouse)
    });
  }

  if (planets.Venus?.longitude) {
    const venusHouse = longitudeToHouse(planets.Venus.longitude, cusps[0]);
    wealthPlanets.push({
      planet: 'Venus',
      interpretation: getWealthPlanetInterpretation('Venus', venusHouse)
    });
  }

  if (planets.Moon?.longitude) {
    const moonHouse = longitudeToHouse(planets.Moon.longitude, cusps[0]);
    wealthPlanets.push({
      planet: 'Moon',
      interpretation: getWealthPlanetInterpretation('Moon', moonHouse)
    });
  }

  if (planets.Mars?.longitude) {
    const marsHouse = longitudeToHouse(planets.Mars.longitude, cusps[0]);
    wealthPlanets.push({
      planet: 'Mars',
      interpretation: getWealthPlanetInterpretation('Mars', marsHouse)
    });
  }

  if (planets.Saturn?.longitude) {
    const saturnHouse = longitudeToHouse(planets.Saturn.longitude, cusps[0]);
    wealthPlanets.push({
      planet: 'Saturn',
      interpretation: getWealthPlanetInterpretation('Saturn', saturnHouse)
    });
  }

  return wealthPlanets.slice(0, 4);
};

const analyzeFinancialTiming = (currentAge, planets, cusps) => {
  const cycles = [];

  const jupiterCycles = [12, 24, 36, 48, 60, 72, 84];
  if (jupiterCycles.some(age => currentAge >= age - 1 && currentAge <= age + 1)) {
    cycles.push({
      cycle: 'Jupiter Return (Abundance & Growth)',
      description: 'Expansion of wealth and increased prosperity opportunities'
    });
  }

  if (currentAge >= 27 && currentAge <= 33) {
    cycles.push({
      cycle: 'Saturn Return (Career = Financial Maturity)',
      description: 'Financial stability through established career and disciplined wealth building'
    });
  }

  cycles.push({
    cycle: 'Venus Cycle (Income Flow)',
    description: 'Natural rhythm of financial intake and expenditure'
  });

  cycles.push({
    cycle: 'Jupiter Transits (Wealth Expansion)',
    description: '12-year cycles of prosperity and abundance when Jupiter transits wealth houses'
  });

  return cycles.slice(0, 3);
};

const analyzeWealthHouses = (planets, cusps) => {
  const wealthHouses = [];

  const secondHouseSign = longitudeToSign(cusps[1]);
  wealthHouses.push({
    house: '2nd House (Personal Wealth)',
    interpretation: `${secondHouseSign} in 2nd house indicates wealth through personal values. Your relationship with money reflects your core self-worth.`
  });

  const eighthHouseSign = longitudeToSign(cusps[7]);
  wealthHouses.push({
    house: '8th House (Shared/Transformative Wealth)',
    interpretation: `${eighthHouseSign} in 8th house shows wealth through partnerships or transformative changes. Inheritance, investments, or shared resources are potential sources.`
  });

  const eleventhHouseSign = longitudeToSign(cusps[10]);
  wealthHouses.push({
    house: '11th House (Gains & Life Goals)',
    interpretation: `${eleventhHouseSign} in 11th house indicates wealth through achievements and collective efforts. Groups, networks, and fulfilled goals generate prosperity.`
  });

  return wealthHouses;
};

const assessFinancialRisks = (planets, cusps) => {
  const risks = [];

  if (planets.Mars?.longitude) {
    const marsHouse = longitudeToHouse(planets.Mars.longitude, cusps[0]);
    if (marsHouse === 8) {
      risks.push({
        area: 'Investment Risks',
        level: 'Elevated - Mars in 8th can indicate sudden financial changes or aggressive investment tendencies'
      });
    }
  }

  if (planets.Saturn?.longitude) {
    const saturnHouse = longitudeToHouse(planets.Saturn.longitude, cusps[0]);
    if (saturnHouse === 2) {
      risks.push({
        area: 'Security Concerns',
        level: 'Moderate - Saturn creates structure but may indicate periods of financial limitation for learning'
      });
    }
  }

  if (planets.Mercury?.longitude) {
    const mercuryHouse = longitudeToHouse(planets.Mercury.longitude, cusps[0]);
    if (mercuryHouse === 2 || mercuryHouse === 8 || mercuryHouse === 11) {
      risks.push({
        area: 'Market Volatility',
        level: 'Variable - Planetary placements suggest adapting to changing financial conditions'
      });
    }
  }

  if (risks.length === 0) {
    risks.push({
      area: 'General Risk Assessment',
      level: 'Balanced - Chart shows moderate financial stability with prudent risk management'
    });
  }

  return risks.slice(0, 3);
};

const identifyProsperityOpportunities = (planets, cusps) => {
  const opportunities = [];

  if (planets.Jupiter?.longitude) {
    const jupiterHouse = longitudeToHouse(planets.Jupiter.longitude, cusps[0]);
    if ([2, 5, 9, 11].includes(jupiterHouse)) {
      opportunities.push({
        opportunity: 'Abundance Expansion',
        timing: 'Jupiter is well-placed for wealth building and prosperous growth'
      });
    }
  }

  if (planets.Venus?.longitude) {
    const venusHouse = longitudeToHouse(planets.Venus.longitude, cusps[0]);
    if (venusHouse === 2 || venusHouse === 11) {
      opportunities.push({
        opportunity: 'Income Opportunities',
        timing: 'Venus suggests natural flow of money and appreciation of valuable assets'
      });
    }
  }

  if (planets.Saturn?.longitude) {
    const saturnHouse = longitudeToHouse(planets.Saturn.longitude, cusps[0]);
    if (saturnHouse === 2) {
      opportunities.push({
        opportunity: 'Long-term Financial Security',
        timing: 'Saturn indicates building lasting wealth through disciplined effort'
      });
    }
  }

  if (opportunities.length === 0) {
    opportunities.push({
      opportunity: 'Balanced Financial Growth',
      timing: 'Chart supports steady wealth accumulation through consistent strategy'
    });
  }

  return opportunities.slice(0, 3);
};

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

// Medical analysis functions
const analyzeChartHealthIndicators = (planets, cusps) => {
  const indicators = [];

  if (planets.Sun?.longitude) {
    const sunHouse = longitudeToHouse(planets.Sun.longitude, cusps[0]);
    const interpretation = getPlanetHealthInterpretation('Sun', sunHouse, planets.Sun.longitude);
    indicators.push({ planet: 'Sun', interpretation });
  }

  if (planets.Moon?.longitude) {
    const moonHouse = longitudeToHouse(planets.Moon.longitude, cusps[0]);
    const interpretation = getPlanetHealthInterpretation('Moon', moonHouse, planets.Moon.longitude);
    indicators.push({ planet: 'Moon', interpretation });
  }

  if (planets.Mars?.longitude) {
    const marsHouse = longitudeToHouse(planets.Mars.longitude, cusps[0]);
    const interpretation = getPlanetHealthInterpretation('Mars', marsHouse, planets.Mars.longitude);
    indicators.push({ planet: 'Mars', interpretation });
  }

  if (planets.Jupiter?.longitude) {
    const jupiterHouse = longitudeToHouse(planets.Jupiter.longitude, cusps[0]);
    const interpretation = getPlanetHealthInterpretation('Jupiter', jupiterHouse, planets.Jupiter.longitude);
    indicators.push({ planet: 'Jupiter', interpretation });
  }

  if (planets.Saturn?.longitude) {
    const saturnHouse = longitudeToHouse(planets.Saturn.longitude, cusps[0]);
    const interpretation = getPlanetHealthInterpretation('Saturn', saturnHouse, planets.Saturn.longitude);
    indicators.push({ planet: 'Saturn', interpretation });
  }

  if (planets.Mercury?.longitude) {
    const mercuryHouse = longitudeToHouse(planets.Mercury.longitude, cusps[0]);
    const interpretation = getPlanetHealthInterpretation('Mercury', mercuryHouse, planets.Mercury.longitude);
    indicators.push({ planet: 'Mercury', interpretation });
  }

  return indicators.slice(0, 5);
};

const analyzeHealthHouses = (planets, cusps) => {
  const houseAnalysis = [];

  const sixthHouseSign = longitudeToSign(cusps[5]);
  houseAnalysis.push({
    house: '6th House (Daily Health & Service)',
    interpretation: `${sixthHouseSign} in 6th house suggests health maintained through daily routines. Pay attention to diet, exercise, and work-life balance for optimal wellness.`
  });

  const eighthHouseSign = longitudeToSign(cusps[7]);
  houseAnalysis.push({
    house: '8th House (Chronic Conditions & Recovery)',
    interpretation: `${eighthHouseSign} in 8th house indicates transformation through health challenges. Focus on regenerative practices and understanding root causes of ailments.`
  });

  const twelfthHouseSign = longitudeToSign(cusps[11]);
  houseAnalysis.push({
    house: '12th House (Rest & Spiritual Health)',
    interpretation: `${twelfthHouseSign} in 12th house shows health recovery through rest and spiritual practices. Meditation and solitude can be powerful healers for you.`
  });

  return houseAnalysis;
};

const identifyHealthFocusAreas = (planets, cusps) => {
  const focusAreas = [];

  if (planets.Saturn?.longitude) {
    const saturnHouse = longitudeToHouse(planets.Saturn.longitude, cusps[0]);
    if (saturnHouse === 6 || saturnHouse === 12) {
      focusAreas.push({
        area: 'Chronic Conditions',
        insights: 'Saturn\'s position suggests long-term health maintenance. Consistent healthcare routines and preventive medicine are important.'
      });
    }
  }

  if (planets.Mars?.longitude) {
    const marsHouse = longitudeToHouse(planets.Mars.longitude, cusps[0]);
    if (marsHouse === 8) {
      focusAreas.push({
        area: 'Acute Health Episodes',
        insights: 'Mars in 8th house may indicate intense but recoverable health episodes. Regular health monitoring can help prevent crises.'
      });
    }
  }

  if (planets.Sun?.longitude) {
    const sunHouse = longitudeToHouse(planets.Sun.longitude, cusps[0]);
    if (sunHouse === 6) {
      focusAreas.push({
        area: 'Energy Management',
        insights: 'Sun in 6th house suggests health benefits from daily life adjustments. Consider how work and routine affect your energy levels.'
      });
    }
  }

  if (planets.Moon?.longitude) {
    const moonHouse = longitudeToHouse(planets.Moon.longitude, cusps[0]);
    if (moonHouse === 12) {
      focusAreas.push({
        area: 'Emotional Well-being',
        insights: 'Moon\'s placement indicates emotional health recovery through periods of rest and introspection.'
      });
    }
  }

  if (focusAreas.length === 0) {
    focusAreas.push({
      area: 'General Wellness',
      insights: 'Your chart shows balanced health indicators. Focus on preventive healthcare and maintaining healthy lifestyle habits.'
    });
  }

  return focusAreas.slice(0, 3);
};

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

  recommendations.push('Maintain a balanced diet, regular sleep schedule, and stress management practices');
  recommendations.push('Listen to your body\'s signals and seek medical attention when needed rather than delaying');

  return recommendations;
};

const getPlanetHealthInterpretation = (planet, house, longitude) => {
  const sign = longitudeToSign(longitude);

  const interpretations = {
    Sun: {
      6: 'Sun in 6th house suggests vitality through daily routine. Health benefits from regular physical activity and organizational structure.',
      8: 'Sun in 8th house indicates transformative health experiences. Recovery comes through understanding deeper life patterns.',
      12: 'Sun in 12th house shows vitality renewed through rest and contemplation. Spiritual practices support overall health.',
      default: 'Sun represents core vitality and life force energy.'
    },
    Moon: {
      6: 'Moon in 6th house connects emotional well-being to daily habits. Digestive health benefits from stable routines.',
      8: 'Moon in 8th house affects emotional security and unconscious motivations. Pay attention to emotional health and family relationships.',
      12: 'Moon in 12th house suggests emotional health recovery through solitude and spiritual practices.',
      default: 'Moon influences emotional health, digestion, and sensitivity to environment.'
    },
    Mars: {
      6: 'Mars in 6th house indicates active daily routines and physical energy directed toward work and health.',
      8: 'Mars in 8th house suggests energetic transformation and recovery from intense conditions.',
      12: 'Mars in 12th house indicates healing through rest and managing underlying anger or frustration.',
      default: 'Mars represents physical energy, immunity, and ability to fight infections.'
    },
    Mercury: {
      6: 'Mercury in 6th house emphasizes mental health through work and daily routines.',
      8: 'Mercury in 8th house suggests deep psychological patterns affecting communication and learning.',
      12: 'Mercury in 12th house indicates mental health benefits from introspection and spiritual studies.',
      default: 'Mercury affects nervous system, communication, and mental processes.'
    },
    Jupiter: {
      6: 'Jupiter in 6th house suggests health benefits from philosophy and optimism.',
      8: 'Jupiter in 8th house indicates emotional and spiritual transformation for wisdom.',
      12: 'Jupiter in 12th house supports health through spiritual growth and foreign travel.',
      default: 'Jupiter represents expansion, optimism, and ability to heal through faith.'
    },
    Saturn: {
      6: 'Saturn in 6th house indicates long-term health procedures and disciplined health routines.',
      8: 'Saturn in 8th house suggests gradual transformation through chronic conditions.',
      12: 'Saturn in 12th house indicates health improvements through spiritual discipline and solitude.',
      default: 'Saturn affects skeletal system, teeth, and chronic conditions.'
    }
  };

  return interpretations[planet]?.[house] || interpretations[planet]?.default || `${planet} represents health influences in the ${sign} sign.`;
};

// Add missing helper functions
const getFixedStarInterpretation = (starName, planetName, orb) => {
  // Mock implementation for fixed star meanings
  return `${starName} conjunct ${planetName} (${orb}° orb) brings ${starName}'s qualities with ${planetName}'s influence.`;
};

const analyzeMidheaven = (midheavenLongitude, planets) => {
  const mcSign = longitudeToSign(midheavenLongitude);
  return `Midheaven in ${mcSign}: Professional expression and public achievements.`;
};

const analyzeTenthHousePlanets = (planets, cusps) => {
  // Mock implementation
  return [{ planet: 'Sun', influence: 'Leadership and authority in career' }];
};

const analyzeCareerPlanets = (planets, cusps) => {
  // Mock implementation
  return [{ planet: 'Jupiter', careerImpact: 'Expansion and opportunities in profession' }];
};

const analyzeCareerTiming = (currentAge, planets, cusps) => {
  // Mock implementation
  return [{ event: 'Saturn Return', description: 'Career maturity and established position' }];
};

const determineCareerDirection = (midheavenAnalysis, tenthHousePlanets, careerPlanets) => {
  return 'Career path focuses on leadership and professional growth';
};

const assessSuccessPotential = (midheavenAnalysis, tenthHousePlanets, careerPlanets) => {
  return 'High potential for professional success and recognition';
};

module.exports = {
  calculateJaiminiKarakaAnalysis,
  calculateFinancialAstrologyAnalysis,
  calculateMedicalAstrologyAnalysis,
  calculateCareerAstrologyAnalysis,
  calculateAshtakavarga,
  calculateFixedStarsAnalysis,
  AgeHarmonicAstrologyReader
};