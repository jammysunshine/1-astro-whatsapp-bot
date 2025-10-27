const logger = require('../../../utils/logger');
const sweph = require('sweph');

/**
 * Western Astrology Calculator
 * Handles Western astrology calculations including houses, aspects, and patterns
 */
class WesternCalculator {
  constructor(astrologer, geocodingService, vedicCore) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;
    this.vedicCore = vedicCore;
  }

  /**
   * Generate Western astrology natal chart
   * @param {Object} user - User object with birth details
   * @param {string} houseSystem - House system ('P'=Placidus, 'K'=Koch, 'E'=Equal, etc.)
   * @returns {Object} Western natal chart data
   */
  async generateWesternBirthChart(user, houseSystem = 'P') {
    try {
      const { birthDate, birthTime, birthPlace, name } = user;

      // Parse birth date and time
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const locationInfo = await this.geocodingService.getLocationInfo(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();

      // Calculate Julian Day
      const jd = this._dateToJulianDay(year, month, day, hour + minute / 60);

      // Calculate houses
      const houses = this._calculateHouses(jd, locationInfo.latitude, locationInfo.longitude, houseSystem);

      // Calculate planetary positions
      const planets = {};
      const planetIds = {
        sun: 0,
        moon: 1,
        mercury: 2,
        venus: 3,
        mars: 4,
        jupiter: 5,
        saturn: 6
      };

      for (const [planetName, planetId] of Object.entries(planetIds)) {
        try {
          const position = sweph.calc(jd, planetId, 2 | 256);
          if (position && position.longitude) {
            const longitude = position.longitude[0];
            const speed = position.longitude[1];
            const signIndex = Math.floor(longitude / 30);
            const signs = this.vedicCore.getZodiacSigns();

            // Calculate house position
            const house = this._getHouseFromLongitude(longitude, houses.houseCusps);

            // Calculate sign subdivisions
            const subdivisions = this._calculateSignSubdivisions(longitude);

            planets[planetName] = {
              name: planetName.charAt(0).toUpperCase() + planetName.slice(1),
              longitude,
              speed,
              retrograde: speed < 0,
              sign: signs[signIndex],
              signIndex,
              house,
              decanate: subdivisions.decanate,
              duad: subdivisions.duad,
              position: {
                degrees: Math.floor(longitude % 30),
                minutes: Math.floor((longitude % 1) * 60),
                seconds: Math.floor(((longitude % 1) * 60 % 1) * 60)
              }
            };
          }
        } catch (error) {
          logger.warn(`Error calculating ${planetName} position:`, error.message);
        }
      }

      // Calculate aspects with more detail
      const aspects = this._calculateDetailedAspects(planets);

      // Analyze aspect patterns
      const aspectPatterns = this._analyzeAspectPatterns(planets, aspects);

      // Calculate significant midpoints
      const midpoints = this._calculateMidpoints(planets);

      return {
        name,
        birthDate,
        birthTime,
        birthPlace,
        houseSystem: houses.system,
        ascendant: {
          sign: this._getSignFromLongitude(houses.ascendant),
          longitude: houses.ascendant
        },
        planets,
        houses: houses.houseCusps,
        aspects,
        aspectPatterns,
        midpoints,
        chartType: 'Western'
      };
    } catch (error) {
      logger.error('Error generating Western birth chart:', error);
      return {
        name: user.name,
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        birthPlace: user.birthPlace,
        error: 'Unable to generate Western birth chart'
      };
    }
  }

  /**
   * Calculate houses using Swiss Ephemeris
   * @private
   * @param {number} jd - Julian Day
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {string} houseSystem - House system
   * @returns {Object} House data
   */
  _calculateHouses(jd, latitude, longitude, houseSystem) {
    try {
      const houses = sweph.houses(jd, latitude, longitude, houseSystem);
      return {
        system: houseSystem,
        ascendant: houses.ascendant[0],
        houseCusps: houses.house[0] // Array of 12 house cusps
      };
    } catch (error) {
      logger.warn('Error calculating houses:', error.message);
      // Fallback to simple equal houses
      return {
        system: 'Equal',
        ascendant: 0,
        houseCusps: Array.from({ length: 12 }, (_, i) => i * 30)
      };
    }
  }

  /**
   * Get house from longitude using house cusps
   * @private
   * @param {number} longitude - Planet longitude
   * @param {Array} houseCusps - House cusp longitudes
   * @returns {number} House number (1-12)
   */
  _getHouseFromLongitude(longitude, houseCusps) {
    // Normalize longitude to 0-360
    longitude = ((longitude % 360) + 360) % 360;

    for (let house = 1; house <= 12; house++) {
      const cusp = houseCusps[house] || 0;
      const nextCusp = houseCusps[house === 12 ? 1 : house + 1] || 0;

      // Handle case where cusps cross 0/360 degrees
      if (cusp > nextCusp) {
        if (longitude >= cusp || longitude < nextCusp) {
          return house;
        }
      } else if (longitude >= cusp && longitude < nextCusp) {
        return house;
      }
    }

    return 1; // Default to 1st house
  }

  /**
   * Get sign from longitude
   * @private
   * @param {number} longitude - Longitude in degrees
   * @returns {string} Sign name
   */
  _getSignFromLongitude(longitude) {
    const signIndex = Math.floor(((longitude % 360) + 360) % 360 / 30);
    return this.vedicCore.getSignName(signIndex);
  }

  /**
   * Calculate sign subdivisions
   * @private
   * @param {number} longitude - Planet longitude
   * @returns {Object} Decanate and duad information
   */
  _calculateSignSubdivisions(longitude) {
    // Normalize longitude to 0-360
    longitude = ((longitude % 360) + 360) % 360;

    // Calculate sign (0-11)
    const signIndex = Math.floor(longitude / 30);
    const signLongitude = longitude % 30; // Position within sign (0-29.99)

    // Decanates: Each sign divided into 3 parts of 10 degrees
    const decanate = Math.floor(signLongitude / 10) + 1; // 1, 2, or 3

    // Duads: Each sign divided into 2 parts of 15 degrees (alternative to decanates)
    const duad = signLongitude < 15 ? 1 : 2;

    // Decanate rulers (traditional Western astrology)
    const decanateRulers = [
      // Aries decanates: Mars, Sun, Venus
      ['Mars', 'Sun', 'Venus'],
      // Taurus: Venus, Mercury, Saturn
      ['Venus', 'Mercury', 'Saturn'],
      // Gemini: Mercury, Venus, Uranus
      ['Mercury', 'Venus', 'Uranus'],
      // Cancer: Moon, Mars, Jupiter
      ['Moon', 'Mars', 'Jupiter'],
      // Leo: Sun, Jupiter, Mars
      ['Sun', 'Jupiter', 'Mars'],
      // Virgo: Mercury, Saturn, Venus
      ['Mercury', 'Saturn', 'Venus'],
      // Libra: Venus, Uranus, Mercury
      ['Venus', 'Uranus', 'Mercury'],
      // Scorpio: Mars, Jupiter, Moon
      ['Mars', 'Jupiter', 'Moon'],
      // Sagittarius: Jupiter, Mars, Sun
      ['Jupiter', 'Mars', 'Sun'],
      // Capricorn: Saturn, Venus, Mercury
      ['Saturn', 'Venus', 'Mercury'],
      // Aquarius: Uranus, Mercury, Venus
      ['Uranus', 'Mercury', 'Venus'],
      // Pisces: Jupiter, Moon, Mars
      ['Jupiter', 'Moon', 'Mars']
    ];

    const signNames = this.vedicCore.getZodiacSigns();
    const currentSign = signNames[signIndex];
    const decanateRuler = decanateRulers[signIndex][decanate - 1];

    return {
      sign: currentSign,
      decanate: {
        number: decanate,
        ruler: decanateRuler,
        interpretation: this._interpretDecanate(currentSign, decanate, decanateRuler)
      },
      duad: {
        number: duad,
        interpretation: this._interpretDuad(currentSign, duad)
      }
    };
  }

  /**
   * Interpret decanate
   * @private
   * @param {string} sign - Zodiac sign
   * @param {number} decanate - Decanate number (1-3)
   * @param {string} ruler - Ruling planet
   * @returns {string} Interpretation
   */
  _interpretDecanate(sign, decanate, ruler) {
    const decanateThemes = {
      1: 'initiating, pioneering, and foundational',
      2: 'balancing, harmonizing, and developmental',
      3: 'culminating, transformative, and integrative'
    };

    return `${decanateThemes[decanate]} expression of ${sign} energy, ruled by ${ruler}. ${this._getDecanateSignificance(sign, decanate, ruler)}`;
  }

  /**
   * Get specific decanate significance
   * @private
   * @param {string} sign - Zodiac sign
   * @param {number} decanate - Decanate number
   * @param {string} ruler - Ruling planet
   * @returns {string} Specific significance
   */
  _getDecanateSignificance(sign, decanate, ruler) {
    const significances = {
      'Aries-1-Mars': 'Bold action and self-assertion',
      'Aries-2-Sun': 'Creative leadership and confidence',
      'Aries-3-Venus': 'Charismatic charm and social grace',
      'Taurus-1-Venus': 'Sensual pleasure and material comfort',
      'Taurus-2-Mercury': 'Practical communication and resource management',
      'Taurus-3-Saturn': 'Patient endurance and long-term planning',
      'Gemini-1-Mercury': 'Curious intellect and verbal expression',
      'Gemini-2-Venus': 'Artistic communication and social charm',
      'Gemini-3-Uranus': 'Innovative thinking and progressive ideas',
      'Cancer-1-Moon': 'Nurturing instincts and emotional depth',
      'Cancer-2-Mars': 'Protective drive and assertive care',
      'Cancer-3-Jupiter': 'Expansive generosity and philosophical outlook',
      'Leo-1-Sun': 'Radiant self-expression and natural leadership',
      'Leo-2-Jupiter': 'Magnanimous generosity and optimistic vision',
      'Leo-3-Mars': 'Dynamic courage and passionate creativity',
      'Virgo-1-Mercury': 'Analytical precision and helpful service',
      'Virgo-2-Saturn': 'Methodical discipline and responsible work',
      'Virgo-3-Venus': 'Refined aesthetics and healing touch',
      'Libra-1-Venus': 'Harmonious relationships and diplomatic skill',
      'Libra-2-Uranus': 'Progressive partnerships and innovative balance',
      'Libra-3-Mercury': 'Intellectual fairness and communicative justice',
      'Scorpio-1-Mars': 'Intense transformation and passionate depth',
      'Scorpio-2-Jupiter': 'Expansive regeneration and philosophical insight',
      'Scorpio-3-Moon': 'Emotional intensity and intuitive power',
      'Sagittarius-1-Jupiter': 'Adventurous exploration and philosophical wisdom',
      'Sagittarius-2-Mars': 'Dynamic action and pioneering spirit',
      'Sagittarius-3-Sun': 'Radiant optimism and confident expansion',
      'Capricorn-1-Saturn': 'Ambitious structure and disciplined achievement',
      'Capricorn-2-Venus': 'Refined authority and material success',
      'Capricorn-3-Mercury': 'Strategic communication and practical wisdom',
      'Aquarius-1-Uranus': 'Revolutionary innovation and humanitarian vision',
      'Aquarius-2-Mercury': 'Intellectual freedom and progressive thinking',
      'Aquarius-3-Venus': 'Universal love and artistic innovation',
      'Pisces-1-Jupiter': 'Spiritual expansion and compassionate wisdom',
      'Pisces-2-Moon': 'Dreamy intuition and emotional sensitivity',
      'Pisces-3-Mars': 'Creative action and inspired transformation'
    };

    const key = `${sign}-${decanate}-${ruler}`;
    return significances[key] || 'Unique expression of this sign\'s energy';
  }

  /**
   * Interpret duad
   * @private
   * @param {string} sign - Zodiac sign
   * @param {number} duad - Duad number (1 or 2)
   * @returns {string} Interpretation
   */
  _interpretDuad(sign, duad) {
    const duadThemes = {
      1: 'personal, subjective, and initiating qualities',
      2: 'interpersonal, objective, and culminating qualities'
    };

    const signElements = {
      Aries: 'fire', Taurus: 'earth', Gemini: 'air', Cancer: 'water',
      Leo: 'fire', Virgo: 'earth', Libra: 'air', Scorpio: 'water',
      Sagittarius: 'fire', Capricorn: 'earth', Aquarius: 'air', Pisces: 'water'
    };

    const element = signElements[sign];
    return `Expresses the ${duadThemes[duad]} of ${element} energy in ${sign}.`;
  }

  /**
   * Calculate detailed aspects for Western astrology
   * @private
   * @param {Object} planets - Planet positions
   * @returns {Array} Detailed aspects
   */
  _calculateDetailedAspects(planets) {
    const aspects = [];
    const planetKeys = Object.keys(planets);

    // Define aspect types with orbs
    const aspectTypes = {
      conjunction: { angle: 0, orb: 8, name: 'Conjunction' },
      sextile: { angle: 60, orb: 6, name: 'Sextile' },
      square: { angle: 90, orb: 8, name: 'Square' },
      trine: { angle: 120, orb: 8, name: 'Trine' },
      opposition: { angle: 180, orb: 8, name: 'Opposition' },
      quincunx: { angle: 150, orb: 5, name: 'Quincunx' },
      semisextile: { angle: 30, orb: 4, name: 'Semisextile' },
      semisquare: { angle: 45, orb: 4, name: 'Semisquare' },
      sesquisquare: { angle: 135, orb: 4, name: 'Sesquisquare' },
      quintile: { angle: 72, orb: 2, name: 'Quintile' },
      biquintile: { angle: 144, orb: 2, name: 'Biquintile' }
    };

    // Check for aspects between planets
    for (let i = 0; i < planetKeys.length; i++) {
      for (let j = i + 1; j < planetKeys.length; j++) {
        const planet1 = planets[planetKeys[i]];
        const planet2 = planets[planetKeys[j]];

        if (planet1.longitude !== undefined && planet2.longitude !== undefined) {
          const angle = Math.abs(planet1.longitude - planet2.longitude) % 360;
          const minAngle = Math.min(angle, 360 - angle);

          // Check each aspect type
          Object.entries(aspectTypes).forEach(([aspectKey, aspectData]) => {
            if (Math.abs(minAngle - aspectData.angle) <= aspectData.orb) {
              const exactness = 1 - (Math.abs(minAngle - aspectData.angle) / aspectData.orb);
              aspects.push({
                planets: `${planet1.name}-${planet2.name}`,
                aspect: aspectData.name,
                angle: Math.round(minAngle * 10) / 10,
                orb: Math.round((minAngle - aspectData.angle) * 10) / 10,
                exactness: Math.round(exactness * 100),
                applying: planet1.speed > planet2.speed, // Which planet is moving faster
                interpretation: this._getAspectInterpretation(aspectKey, planet1.name, planet2.name)
              });
            }
          });
        }
      }
    }

    return aspects.slice(0, 15); // Return top 15 aspects
  }

  /**
   * Get aspect interpretation
   * @private
   * @param {string} aspect - Aspect type
   * @param {string} planet1 - First planet
   * @param {string} planet2 - Second planet
   * @returns {string} Interpretation
   */
  _getAspectInterpretation(aspect, planet1, planet2) {
    const interpretations = {
      conjunction: `${planet1} and ${planet2} energies blend and intensify`,
      sextile: `${planet1} and ${planet2} work harmoniously with opportunities`,
      square: `${planet1} and ${planet2} create tension and challenges`,
      trine: `${planet1} and ${planet2} flow easily with natural talents`,
      opposition: `${planet1} and ${planet2} represent polarities to balance`,
      quincunx: `${planet1} and ${planet2} require adjustment and adaptation`,
      semisextile: `${planet1} and ${planet2} show subtle connections`,
      semisquare: `${planet1} and ${planet2} indicate minor tensions`,
      sesquisquare: `${planet1} and ${planet2} suggest persistent challenges`,
      quintile: `${planet1} and ${planet2} show creative and unique expression`,
      biquintile: `${planet1} and ${planet2} indicate specialized talents`
    };
    return interpretations[aspect] || `${planet1} and ${planet2} form a ${aspect} aspect`;
  }

  /**
   * Analyze Western aspect patterns in the chart
   * @private
   * @param {Object} planets - Planet positions
   * @param {Array} aspects - Calculated aspects
   * @returns {Array} Aspect patterns found
   */
  _analyzeAspectPatterns(planets, aspects) {
    const patterns = [];

    // Convert planets to array for easier processing
    const planetList = Object.values(planets).filter(p => p.longitude !== undefined);

    // Find Grand Trines (3 planets in trine, forming a triangle)
    const grandTrines = this._findGrandTrines(planetList, aspects);
    patterns.push(...grandTrines);

    // Find T-Squares (2 planets in opposition, both square a third planet)
    const tSquares = this._findTSquares(planetList, aspects);
    patterns.push(...tSquares);

    // Find Grand Crosses (4 planets in square, forming a cross)
    const grandCrosses = this._findGrandCrosses(planetList, aspects);
    patterns.push(...grandCrosses);

    // Find Yods (2 planets in sextile, both quincunx a third planet)
    const yods = this._findYods(planetList, aspects);
    patterns.push(...yods);

    // Find Kites (Grand Trine with a planet opposite one point of the trine)
    const kites = this._findKites(planetList, aspects, grandTrines);
    patterns.push(...kites);

    return patterns;
  }

  /**
   * Find Grand Trine patterns
   * @private
   * @param {Array} planets - Planet list
   * @param {Array} aspects - Aspect list
   * @returns {Array} Grand Trine patterns
   */
  _findGrandTrines(planets, aspects) {
    const trines = aspects.filter(a => a.aspect === 'Trine');
    const grandTrines = [];

    // Group planets by element (Fire, Earth, Air, Water)
    const elements = { fire: [], earth: [], air: [], water: [] };

    planets.forEach(planet => {
      const element = this._getElementFromSign(planet.sign);
      if (element) { elements[element].push(planet); }
    });

    // Check each element for Grand Trines
    Object.entries(elements).forEach(([element, elementPlanets]) => {
      if (elementPlanets.length >= 3) {
        // Check if all planets in this element form a trine chain
        const connectedPlanets = [];
        const planetNames = elementPlanets.map(p => p.name);

        // Check connectivity through trine aspects
        for (let i = 0; i < elementPlanets.length; i++) {
          for (let j = i + 1; j < elementPlanets.length; j++) {
            const aspect = trines.find(t =>
              (t.planets.includes(elementPlanets[i].name) && t.planets.includes(elementPlanets[j].name))
            );
            if (aspect) {
              if (!connectedPlanets.includes(elementPlanets[i])) { connectedPlanets.push(elementPlanets[i]); }
              if (!connectedPlanets.includes(elementPlanets[j])) { connectedPlanets.push(elementPlanets[j]); }
            }
          }
        }

        if (connectedPlanets.length >= 3) {
          grandTrines.push({
            type: 'Grand Trine',
            element,
            planets: connectedPlanets.map(p => p.name),
            interpretation: this._interpretGrandTrine(element, connectedPlanets)
          });
        }
      }
    });

    return grandTrines;
  }

  /**
   * Find T-Square patterns
   * @private
   * @param {Array} planets - Planet list
   * @param {Array} aspects - Aspect list
   * @returns {Array} T-Square patterns
   */
  _findTSquares(planets, aspects) {
    const squares = aspects.filter(a => a.aspect === 'Square');
    const oppositions = aspects.filter(a => a.aspect === 'Opposition');
    const tSquares = [];

    // Check each opposition for a planet that squares both ends
    oppositions.forEach(opp => {
      const [planet1, planet2] = opp.planets.split('-');

      // Find planets that square both ends of the opposition
      squares.forEach(square => {
        const squarePlanets = square.planets.split('-');
        const apex = squarePlanets.find(p =>
          p !== planet1 && p !== planet2 &&
          squares.some(sq => sq.planets.includes(p) &&
            (sq.planets.includes(planet1) || sq.planets.includes(planet2)))
        );

        if (apex && !tSquares.some(ts => ts.apex === apex)) {
          tSquares.push({
            type: 'T-Square',
            planets: [planet1, planet2, apex],
            apex,
            opposition: [planet1, planet2],
            interpretation: this._interpretTSquare(apex, planet1, planet2)
          });
        }
      });
    });

    return tSquares;
  }

  /**
   * Find Grand Cross patterns
   * @private
   * @param {Array} planets - Planet list
   * @param {Array} aspects - Aspect list
   * @returns {Array} Grand Cross patterns
   */
  _findGrandCrosses(planets, aspects) {
    const squares = aspects.filter(a => a.aspect === 'Square');
    const oppositions = aspects.filter(a => a.aspect === 'Opposition');
    const grandCrosses = [];

    // Look for 4 planets where each is in square to the others
    const squareConnections = {};

    squares.forEach(square => {
      const [p1, p2] = square.planets.split('-');
      if (!squareConnections[p1]) { squareConnections[p1] = []; }
      if (!squareConnections[p2]) { squareConnections[p2] = []; }
      squareConnections[p1].push(p2);
      squareConnections[p2].push(p1);
    });

    // Find groups of 4 planets all connected by squares
    const checked = new Set();
    Object.keys(squareConnections).forEach(planet => {
      if (checked.has(planet)) { return; }

      const group = this._findConnectedGroup(planet, squareConnections, checked);
      if (group.length === 4) {
        grandCrosses.push({
          type: 'Grand Cross',
          planets: group,
          interpretation: this._interpretGrandCross(group)
        });
      }
    });

    return grandCrosses;
  }

  /**
   * Find Yod patterns (Finger of God)
   * @private
   * @param {Array} planets - Planet list
   * @param {Array} aspects - Aspect list
   * @returns {Array} Yod patterns
   */
  _findYods(planets, aspects) {
    const sextiles = aspects.filter(a => a.aspect === 'Sextile');
    const quincunxes = aspects.filter(a => a.aspect === 'Quincunx');
    const yods = [];

    // Find 2 planets in sextile, both quincunx to a third planet
    sextiles.forEach(sextile => {
      const [planet1, planet2] = sextile.planets.split('-');

      // Find planets that form quincunxes with both ends of the sextile
      quincunxes.forEach(q1 => {
        quincunxes.forEach(q2 => {
          if (q1 !== q2) {
            const q1Planets = q1.planets.split('-');
            const q2Planets = q2.planets.split('-');

            const apex1 = q1Planets.find(p => !q1Planets.includes(planet1) && !q1Planets.includes(planet2));
            const apex2 = q2Planets.find(p => !q2Planets.includes(planet1) && !q2Planets.includes(planet2));

            if (apex1 && apex2 && apex1 === apex2) {
              const apex = apex1;
              if (!yods.some(y => y.apex === apex)) {
                yods.push({
                  type: 'Yod',
                  planets: [planet1, planet2, apex],
                  apex,
                  base: [planet1, planet2],
                  interpretation: this._interpretYod(apex, planet1, planet2)
                });
              }
            }
          }
        });
      });
    });

    return yods;
  }

  /**
   * Find Kite patterns
   * @private
   * @param {Array} planets - Planet list
   * @param {Array} aspects - Aspect list
   * @param {Array} grandTrines - Existing Grand Trines
   * @returns {Array} Kite patterns
   */
  _findKites(planets, aspects, grandTrines) {
    const oppositions = aspects.filter(a => a.aspect === 'Opposition');
    const kites = [];

    grandTrines.forEach(trine => {
      // For each Grand Trine, check if any planet opposes one of the trine planets
      trine.planets.forEach(trinePlanet => {
        oppositions.forEach(opp => {
          const oppPlanets = opp.planets.split('-');
          if (oppPlanets.includes(trinePlanet)) {
            const opposingPlanet = oppPlanets.find(p => p !== trinePlanet);
            // Check if the opposing planet is sextile to the other two trine planets
            const sextiles = aspects.filter(a => a.aspect === 'Sextile');
            const connectedToBoth = trine.planets.filter(p => p !== trinePlanet).every(tp =>
              sextiles.some(s => s.planets.includes(tp) && s.planets.includes(opposingPlanet))
            );

            if (connectedToBoth) {
              kites.push({
                type: 'Kite',
                planets: [...trine.planets, opposingPlanet],
                grandTrine: trine.planets,
                tail: opposingPlanet,
                interpretation: this._interpretKite(trine.element, opposingPlanet)
              });
            }
          }
        });
      });
    });

    return kites;
  }

  /**
   * Find connected group of planets
   * @private
   * @param {string} startPlanet - Starting planet
   * @param {Object} connections - Connection map
   * @param {Set} checked - Already checked planets
   * @returns {Array} Connected group
   */
  _findConnectedGroup(startPlanet, connections, checked) {
    const group = [];
    const toCheck = [startPlanet];

    while (toCheck.length > 0) {
      const planet = toCheck.pop();
      if (checked.has(planet)) { continue; }

      checked.add(planet);
      group.push(planet);

      if (connections[planet]) {
        connections[planet].forEach(connected => {
          if (!checked.has(connected) && !toCheck.includes(connected)) {
            toCheck.push(connected);
          }
        });
      }
    }

    return group;
  }

  /**
   * Get element from sign
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Element
   */
  _getElementFromSign(sign) {
    const elements = {
      Aries: 'fire', Taurus: 'earth', Gemini: 'air', Cancer: 'water',
      Leo: 'fire', Virgo: 'earth', Libra: 'air', Scorpio: 'water',
      Sagittarius: 'fire', Capricorn: 'earth', Aquarius: 'air', Pisces: 'water'
    };
    return elements[sign];
  }

  /**
   * Interpret Grand Trine
   * @private
   * @param {string} element - Element of the trine
   * @param {Array} planets - Planets involved
   * @returns {string} Interpretation
   */
  _interpretGrandTrine(element, planets) {
    const elementThemes = {
      fire: 'creative energy, enthusiasm, and self-expression',
      earth: 'practicality, stability, and material manifestation',
      air: 'intellectual pursuits, communication, and social connections',
      water: 'emotional depth, intuition, and healing abilities'
    };

    const planetNames = planets.map(p => p.name).join(', ');
    return `Grand Trine in ${element}: Harmonious flow of ${elementThemes[element] || 'energy'} through ${planetNames}. Natural talents and ease in these areas, but potential for complacency.`;
  }

  /**
   * Interpret T-Square
   * @private
   * @param {string} apex - Apex planet
   * @param {string} planet1 - First opposition planet
   * @param {string} planet2 - Second opposition planet
   * @returns {string} Interpretation
   */
  _interpretTSquare(apex, planet1, planet2) {
    return `T-Square with ${apex} at apex: Tension and drive focused on ${this._getPlanetDomain(apex)}. Challenges between ${planet1} and ${planet2} energies create motivation for growth and action.`;
  }

  /**
   * Interpret Grand Cross
   * @private
   * @param {Array} planets - Planets involved
   * @returns {string} Interpretation
   */
  _interpretGrandCross(planets) {
    const planetNames = planets.join(', ');
    return `Grand Cross involving ${planetNames}: Dynamic tension creates motivation and drive. Multiple challenges requiring balance and integration of diverse energies. High potential for achievement through overcoming obstacles.`;
  }

  /**
   * Interpret Yod
   * @private
   * @param {string} apex - Apex planet
   * @param {string} planet1 - First base planet
   * @param {string} planet2 - Second base planet
   * @returns {string} Interpretation
   */
  _interpretYod(apex, planet1, planet2) {
    return `Yod (Finger of God) with ${apex} at apex: Special purpose and mission involving ${this._getPlanetDomain(apex)}. Tension between ${planet1} and ${planet2} energies points to a unique life path and spiritual calling.`;
  }

  /**
   * Interpret Kite
   * @private
   * @param {string} element - Element of the Grand Trine
   * @param {string} tail - Tail planet
   * @returns {string} Interpretation
   */
  _interpretKite(element, tail) {
    return `Kite with ${tail} as tail: Grand Trine in ${element} provides foundation, while ${tail} adds focus and direction. Creative potential with clear purpose and the ability to manifest ideas into reality.`;
  }

  /**
   * Calculate and interpret midpoints in Western astrology
   * @private
   * @param {Object} planets - Planet positions
   * @returns {Array} Significant midpoints
   */
  _calculateMidpoints(planets) {
    const midpoints = [];
    const planetList = Object.values(planets).filter(p => p.longitude !== undefined);

    // Calculate midpoints between all planet pairs
    for (let i = 0; i < planetList.length; i++) {
      for (let j = i + 1; j < planetList.length; j++) {
        const planet1 = planetList[i];
        const planet2 = planetList[j];

        // Calculate midpoint
        let midpointLong = (planet1.longitude + planet2.longitude) / 2;

        // Handle 0/360 degree crossover
        if (Math.abs(planet1.longitude - planet2.longitude) > 180) {
          midpointLong += 180;
          midpointLong %= 360;
        }

        // Check if any planet is conjunct the midpoint (within 2 degrees)
        const conjunctPlanets = planetList.filter(p => {
          let diff = Math.abs(p.longitude - midpointLong);
          diff = Math.min(diff, 360 - diff); // Handle 0/360 crossover
          return diff <= 2 && p !== planet1 && p !== planet2;
        });

        if (conjunctPlanets.length > 0) {
          conjunctPlanets.forEach(conjunct => {
            midpoints.push({
              planets: [planet1.name, planet2.name],
              midpoint: midpointLong,
              conjunctPlanet: conjunct.name,
              sign: this._getSignFromLongitude(midpointLong),
              interpretation: this._interpretMidpoint(planet1.name, planet2.name, conjunct.name)
            });
          });
        }
      }
    }

    return midpoints.slice(0, 10); // Return top 10 significant midpoints
  }

  /**
   * Interpret midpoint conjunction
   * @private
   * @param {string} planet1 - First planet
   * @param {string} planet2 - Second planet
   * @param {string} conjunct - Planet conjunct the midpoint
   * @returns {string} Interpretation
   */
  _interpretMidpoint(planet1, planet2, conjunct) {
    const midpointThemes = {
      'Sun-Moon': 'conscious and unconscious integration',
      'Sun-Mercury': 'clear communication and self-expression',
      'Sun-Venus': 'creative self-love and artistic expression',
      'Sun-Mars': 'dynamic self-assertion and leadership',
      'Sun-Jupiter': 'expansive self-confidence and wisdom',
      'Sun-Saturn': 'responsible self-discipline and achievement',
      'Moon-Mercury': 'intuitive communication and emotional intelligence',
      'Moon-Venus': 'nurturing relationships and emotional harmony',
      'Moon-Mars': 'protective instincts and emotional drive',
      'Moon-Jupiter': 'optimistic emotional outlook and growth',
      'Moon-Saturn': 'emotional maturity and responsibility'
    };

    const key = `${planet1}-${planet2}`;
    const reverseKey = `${planet2}-${planet1}`;
    const theme = midpointThemes[key] || midpointThemes[reverseKey] || `${planet1} and ${planet2} synthesis`;

    return `${conjunct} conjunct ${planet1}/${planet2} midpoint: ${theme} activated and expressed through ${this._getPlanetDomain(conjunct)}.`;
  }

  /**
   * Get planet domain description
   * @private
   * @param {string} planet - Planet name
   * @returns {string} Domain description
   */
  _getPlanetDomain(planet) {
    const domains = {
      Sun: 'identity and life purpose',
      Moon: 'emotions and inner life',
      Mercury: 'communication and intellect',
      Venus: 'relationships and values',
      Mars: 'action and energy',
      Jupiter: 'growth and expansion',
      Saturn: 'responsibility and structure',
      Uranus: 'innovation and freedom',
      Neptune: 'spirituality and dreams',
      Pluto: 'transformation and power'
    };
    return domains[planet] || planet.toLowerCase();
  }

  /**
   * Convert date to Julian Day
   * @private
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @param {number} day - Day
   * @param {number} hour - Hour (decimal)
   * @returns {number} Julian Day
   */
  _dateToJulianDay(year, month, day, hour) {
    // Simplified Julian Day calculation
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;

    const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    return jd + hour / 24;
  }
}

module.exports = WesternCalculator;