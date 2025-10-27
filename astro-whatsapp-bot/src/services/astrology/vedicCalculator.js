const logger = require('../../utils/logger');

/**
 * Professional Vedic Astrology Calculator
 * Main orchestrator class that composes smaller, focused modules
 * Provides complete natal chart analysis using Swiss Ephemeris and astrological interpretations
 */

const { Astrologer } = require('astrologer');
const sweph = require('sweph');

// Import refactored modules
const VedicCore = require('./core/VedicCore');
const GeocodingService = require('./geocoding/GeocodingService');
const SignCalculations = require('./calculations/SignCalculations');
const WesternCalculator = require('./western/WesternCalculator');
const HoroscopeGenerator = require('./horoscope/HoroscopeGenerator');
const VedicCalculatorModule = require('./vedic/VedicCalculator');
const CompatibilityChecker = require('./compatibility/CompatibilityChecker');
const ChartGenerator = require('./charts/ChartGenerator');

class VedicCalculator {
  constructor() {
    logger.info('Module: VedicCalculator loaded.');

    // Initialize core dependencies
    this.vedicCore = new VedicCore();
    this.geocodingService = new GeocodingService();
    this.signCalculations = new SignCalculations(this.geocodingService, this.vedicCore);

    // Initialize astrologer library
    try {
      logger.info('Attempting to initialize astrologer library...');
      this._astrologer = new Astrologer();
      logger.info('Astrologer library initialized successfully.');
    } catch (error) {
      logger.error('❌ Error initializing astrologer library:', error.message);
      throw new Error(
        'Failed to initialize core astrology library. Please check dependencies and environment.'
      );
    }

    // Initialize specialized modules
    this.westernCalculator = new WesternCalculator(this._astrologer, this.geocodingService, this.vedicCore);
    this.horoscopeGenerator = new HoroscopeGenerator(this._astrologer, this.geocodingService);
    this.vedicCalculator = new VedicCalculatorModule(this._astrologer, this.geocodingService, this.vedicCore);
    this.compatibilityChecker = new CompatibilityChecker(this._astrologer, this.geocodingService, this.vedicCore);
    this.chartGenerator = new ChartGenerator(this._astrologer, this.geocodingService, this.vedicCore, this.signCalculations);

    // Initialize Swiss Ephemeris
    this.vedicCore.initializeSwissEphemeris();
  }

  /**
   * Enhanced Swiss Ephemeris initialization with comprehensive error handling
   * @private
   */
  _getCachedResult(cacheKey) {
    const cached = this._calculationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this._cacheExpirationMs) {
      return cached.data;
    }
    if (cached) {
      this._calculationCache.delete(cacheKey); // Remove expired entry
    }
    return null;
  }

  /**
   * Performance optimization: Cache calculation result
   * @private
   * @param {string} cacheKey - Unique cache key
   * @param {Object} data - Data to cache
   */
  _setCachedResult(cacheKey, data) {
    if (this._calculationCache.size >= this._cacheMaxSize) {
      // Remove oldest entry (simple FIFO)
      const firstKey = this._calculationCache.keys().next().value;
      this._calculationCache.delete(firstKey);
    }
    this._calculationCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Performance optimization: Clean expired cache entries
   * @private
   */
  _cleanExpiredCache() {
    const now = Date.now();
    for (const [key, cached] of this._calculationCache.entries()) {
      if (now - cached.timestamp > this._cacheExpirationMs) {
        this._calculationCache.delete(key);
      }
    }
  }

  /**
   * Enhanced Swiss Ephemeris initialization with comprehensive error handling
   * @private
   */
  async _initializeSwissEphemeris() {
    try {
      logger.info('Initializing Enhanced Swiss Ephemeris system...');

      // Set ephemeris path with multiple fallback options
      const ephemerisPaths = ['./ephe', '/usr/share/sweph/ephe', '/usr/local/share/sweph/ephe'];

      let ephemerisSet = false;
      for (const path of ephemerisPaths) {
        try {
          sweph.set_ephe_path(path);
          logger.info(`Swiss Ephemeris path set successfully: ${path}`);
          ephemerisSet = true;
          break;
        } catch (pathError) {
          logger.warn(`Failed to set ephemeris path ${path}:`, pathError.message);
        }
      }

      if (!ephemerisSet) {
        logger.warn('⚠️ No valid ephemeris path found. Using built-in calculations where possible.');
      }

      // Set default ayanamsa for Vedic calculations (Lahiri)
      try {
        sweph.set_sid_mode(1, 0, 0);
        logger.info('Default ayanamsa set to Lahiri for Vedic calculations.');
      } catch (ayanamsaError) {
        logger.warn('Could not set default ayanamsa:', ayanamsaError.message);
      }

      // Test basic functionality (optional - don't fail if ephemeris files are incomplete)
      try {
        const testJD = sweph.julday(2024, 1, 1, 12, 1);
        const testPos = sweph.calc(testJD, 0, 2);
        if (testPos && testPos.longitude) {
          logger.info('✅ Swiss Ephemeris basic functionality test passed.');
        } else {
          logger.warn('⚠️ Swiss Ephemeris basic functionality test returned no data - calculations may be limited.');
        }
      } catch (testError) {
        logger.warn('⚠️ Swiss Ephemeris basic functionality test failed - calculations may be limited:', testError.message);
        // Don't throw error - allow the system to continue with limited functionality
      }

      logger.info('Enhanced Swiss Ephemeris system initialized successfully.');
    } catch (error) {
      logger.error('❌ Critical error initializing Swiss Ephemeris:', error.message);
      throw new Error('Failed to initialize core astronomical calculation system');
    }
  }

  // Lazy getter for astrologer instance
  get astrologer() {
    if (!this._astrologer) {
      this._astrologer = new Astrologer();
    }
    return this._astrologer;
  }

  /**
   * Calculate sun sign from birth date using professional astrology library
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @param {string} birthTime - Birth time in HH:MM format (optional, defaults to noon)
   * @param {string} birthPlace - Birth place (optional, defaults to Delhi)
   * @param {string} chartType - 'tropical' or 'sidereal' (optional, defaults to 'sidereal' for Vedic)
   * @returns {string} Sun sign
   */
  async calculateSunSign(birthDate, birthTime = '12:00', birthPlace = 'Delhi, India', chartType = 'sidereal') {
    return this.signCalculations.calculateSunSign(birthDate, birthTime, birthPlace, chartType);
  }

  /**
   * Fallback sun sign calculation using simplified dates
   * @private
   */
  _calculateSunSignFallback(birthDate) {
    try {
      const [day, month] = birthDate.split('/').map(Number);

      // Simplified sun sign calculation
      const signDates = [
        { sign: 'Capricorn', start: [22, 12], end: [19, 1] },
        { sign: 'Aquarius', start: [20, 1], end: [18, 2] },
        { sign: 'Pisces', start: [19, 2], end: [20, 3] },
        { sign: 'Aries', start: [21, 3], end: [19, 4] },
        { sign: 'Taurus', start: [20, 4], end: [20, 5] },
        { sign: 'Gemini', start: [21, 5], end: [20, 6] },
        { sign: 'Cancer', start: [21, 6], end: [22, 7] },
        { sign: 'Leo', start: [23, 7], end: [22, 8] },
        { sign: 'Virgo', start: [23, 8], end: [22, 9] },
        { sign: 'Libra', start: [23, 9], end: [22, 10] },
        { sign: 'Scorpio', start: [23, 10], end: [21, 11] },
        { sign: 'Sagittarius', start: [22, 11], end: [21, 12] }
      ];

      for (const { sign, start, end } of signDates) {
        if (
          (month === start[1] && day >= start[0]) ||
          (month === end[1] && day <= end[0]) ||
          (month > start[1] && month < end[1])
        ) {
          return sign;
        }
      }

      return 'Unknown';
    } catch (error) {
      logger.error('Error in fallback sun sign calculation:', error);
      return 'Unknown';
    }
  }

  /**
   * Calculate Hora position for a given longitude
   * @param {number} longitude - Planet longitude in degrees
   * @returns {number} Hora position in degrees
   */
  calculateHoraPosition(longitude) {
    return (longitude * 2) % 360;
  }

  /**
   * Get Hora sign for a given longitude
   * @param {number} longitude - Planet longitude in degrees
   * @returns {string} Hora sign
   */
  getHoraSign(longitude) {
    const horaPos = this.calculateHoraPosition(longitude);
    const signIndex = Math.floor(horaPos / 30);
    return this.zodiacSigns[signIndex];
  }

  /**
   * Calculate moon sign
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time in HH:MM format
   * @param {string} birthPlace - Birth place
   * @param {string} chartType - Chart type
   * @returns {string} Moon sign
   */
  async calculateMoonSign(birthDate, birthTime, birthPlace = 'Delhi, India', chartType = 'sidereal') {
    return this.signCalculations.calculateMoonSign(birthDate, birthTime, birthPlace, chartType);
  }

  /**
   * Fallback moon sign calculation
   * @private
   */
  _calculateMoonSignFallback(birthDate, birthTime) {
    try {
      // Simplified moon sign calculation
      const sunSign = this.calculateSunSign(birthDate);

      // Simple approximation: moon sign is usually 2-3 signs away from sun sign
      const signIndex = this.zodiacSigns.indexOf(sunSign);
      const moonSignIndex = (signIndex + 2) % 12; // Approximate

      return this.zodiacSigns[moonSignIndex];
    } catch (error) {
      logger.error('Error in fallback moon sign calculation:', error);
      return 'Unknown';
    }
  }

  /**
   * Get coordinates for a place using NodeGeocoder
   * @private
   * @param {string} place - Place name (City, Country)
   * @returns {Promise<Array>} [latitude, longitude]
   */
  async _getCoordinatesForPlace(place) {
    try {
      const res = await geocoder.geocode(place);
      if (res && res.length > 0) {
        return [res[0].latitude, res[0].longitude];
      }
    } catch (error) {
      logger.error(`❌ Error geocoding place "${place}":`, error.message);
    }
    // Fallback to default if geocoding fails
    return [28.6139, 77.209]; // Default to Delhi, India
  }

  /**
   * Get timezone for a place using Google Maps Time Zone API
   * @private
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} timestamp - Unix timestamp of the event
   * @returns {Promise<number>} UTC offset in hours
   */
  async _getTimezoneForPlace(latitude, longitude, timestamp) {
    if (!GOOGLE_MAPS_API_KEY) {
      logger.warn('GOOGLE_MAPS_API_KEY is not set. Using default timezone offset (IST).');
      return 5.5; // Default to IST offset
    }

    try {
      const response = await googleMapsClient.timezone({
        params: {
          location: { lat: latitude, lng: longitude },
          timestamp: timestamp / 1000, // Google API expects seconds
          key: GOOGLE_MAPS_API_KEY
        },
        timeout: 1000 // milliseconds
      });

      if (response.data.status === 'OK') {
        const { rawOffset } = response.data; // Offset in seconds from UTC
        const { dstOffset } = response.data; // Daylight saving offset in seconds
        return (rawOffset + dstOffset) / 3600; // Convert to hours
      } else {
        logger.error('Google Maps Time Zone API error:', response.data.errorMessage);
      }
    } catch (error) {
      logger.error('❌ Error fetching timezone from Google Maps API:', error.message);
    }
    // Fallback to default if API call fails
    return 5.5; // Default to IST offset
  }

  /**
   * Format planet data for API response
   * @private
   */
  _formatPlanets(planets) {
    const formatted = {};
    Object.entries(planets).forEach(([key, data]) => {
      formatted[key] = {
        name: data.name,
        sign: data.signName,
        retrograde: data.retrograde,
        degrees: data.position.degrees,
        minutes: data.position.minutes,
        seconds: data.position.seconds,
        position: `${data.position.degrees}°${data.position.minutes}'${data.position.seconds}"`
      };
    });
    return formatted;
  }

  /**
   * Generate Western astrology natal chart with different house systems
   * @param {Object} user - User object with birth details
   * @param {string} houseSystem - House system ('P'=Placidus, 'K'=Koch, 'E'=Equal, etc.)
   * @returns {Object} Western natal chart data
   */
  async generateWesternBirthChart(user, houseSystem = 'P') {
    return this.westernCalculator.generateWesternBirthChart(user, houseSystem);
  }
    try {
      const { birthDate, birthTime, birthPlace, name } = user;

      // Parse birth date and time
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Calculate Julian Day
      const jd = this._dateToJulianDay(year, month, day, hour + minute / 60);

      // Calculate houses
      const houses = this._calculateHouses(jd, latitude, longitude, houseSystem);

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
            const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

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
   * Calculate decanate and duad for a planet
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

    const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
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
   * Get house from longitude using house cusps
   * @private
   * @param {number} longitude - Planet longitude
   * @param {Object} houseCusps - House cusp longitudes
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
   * Generate comprehensive natal chart using professional astrology library
   * @param {Object} user - User object with birth details
   * @returns {Object} Complete natal chart data
   */
  async generateBasicBirthChart(user) {
    return this.chartGenerator.generateBasicBirthChart(user);
  }

  /**
   * Get basic sign description
   * @param {string} sunSign - Sun sign
   * @param {string} moonSign - Moon sign
   * @returns {string} Description
   */
  getSignDescription(sunSign, moonSign) {
    const descriptions = {
      'Aries-Leo':
        'a dynamic and confident personality with strong leadership qualities',
      'Taurus-Virgo':
        'a practical and reliable nature with attention to detail',
      'Gemini-Libra':
        'a communicative and social personality with diplomatic skills',
      'Cancer-Scorpio': 'an intuitive and emotional nature with deep feelings',
      'Leo-Sagittarius':
        'an enthusiastic and optimistic outlook with creative energy',
      'Virgo-Capricorn':
        'a disciplined and responsible character with strong work ethic',
      'Libra-Aquarius':
        'a harmonious and idealistic nature with social consciousness',
      'Scorpio-Pisces':
        'an intense and compassionate personality with spiritual depth',
      'Sagittarius-Aries':
        'an adventurous and independent spirit with pioneering energy',
      'Capricorn-Taurus':
        'a determined and practical approach with material success focus',
      'Aquarius-Gemini':
        'an innovative and intellectual mind with humanitarian ideals',
      'Pisces-Cancer':
        'a sensitive and imaginative nature with artistic tendencies'
    };

    const key = `${sunSign}-${moonSign}`;
    return (
      descriptions[key] ||
      'a unique combination of energies that make you special'
    );
  }

  /**
   * Generate a detailed daily horoscope using professional astrology
   * @param {Object} birthData - User's birth data
   * @returns {Object} Detailed horoscope data
   */
  async generateDailyHoroscope(birthData) {
    return this.horoscopeGenerator.generateDailyHoroscope(birthData);
  }
    try {
      const { birthDate, birthTime = '12:00', birthPlace = 'Delhi, India' } = birthData;

      if (!birthDate || typeof birthDate !== 'string') {
        throw new Error('Invalid birth date provided');
      }

      // Parse birth date
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone for birth place
      const [birthLatitude, birthLongitude] = await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const birthTimestamp = birthDateTime.getTime();
      const birthTimezone = await this._getTimezoneForPlace(birthLatitude, birthLongitude, birthTimestamp);

      // Get current date for transit calculations
      const now = new Date();
      const currentDay = now.getDate();
      const currentMonth = now.getMonth() + 1; // JS months are 0-based
      const currentYear = now.getFullYear();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimestamp = now.getTime();

      // Get timezone for current location (assuming same as birth place for simplicity, or could use current user location)
      const currentLatitude = birthLatitude;
      const currentLongitude = birthLongitude;
      const currentTimezone = await this._getTimezoneForPlace(currentLatitude, currentLongitude, currentTimestamp);

      // Use astrologer library for detailed analysis
      if (this.astrologer) {
        try {
          const natalData = {
            year,
            month,
            date: day,
            hours: hour,
            minutes: minute,
            seconds: 0,
            latitude: birthLatitude,
            longitude: birthLongitude,
            timezone: birthTimezone,
            chartType: 'sidereal'
          };

          const transitData = {
            year: currentYear,
            month: currentMonth,
            date: currentDay,
            hours: currentHour,
            minutes: currentMinute,
            seconds: 0,
            latitude: currentLatitude,
            longitude: currentLongitude,
            timezone: currentTimezone,
            chartType: 'sidereal'
          };

          const natalChart = this.astrologer.generateNatalChartData(natalData);
          const transitChart = this.astrologer.generateTransitChartData(
            natalData,
            transitData
          );

          // Extract detailed insights
          const { sunSign } = natalChart.interpretations;
          const { moonSign } = natalChart.interpretations;
          const { risingSign } = natalChart.interpretations;

          // Generate personalized horoscope based on transits
          const aspects = transitChart.aspects || [];
          const planets = transitChart.planets || [];

          let general = `🌟 *${sunSign} Daily Guidance*\n\n`;
          let luckyColor = 'Blue';
          const luckyNumber = Math.floor(Math.random() * 9) + 1;
          let love = 'Focus on open communication in relationships.';
          let career = 'Stay focused on your goals today.';
          let finance = 'Be cautious with spending.';
          let health = 'Maintain balance in your daily routine.';

          // Analyze major transits
          if (aspects.some(a => a.planet1 === 'Sun' || a.planet2 === 'Sun')) {
            general += 'The Sun\'s energy brings confidence and vitality. ';
            career = 'Great day for leadership and creative projects.';
            luckyColor = 'Gold';
          }

          if (aspects.some(a => a.planet1 === 'Moon' || a.planet2 === 'Moon')) {
            general += 'Emotional awareness is heightened. ';
            love = 'Deep connections and understanding flow naturally.';
            health = 'Pay attention to your emotional well-being.';
            luckyColor = 'Silver';
          }

          if (
            aspects.some(a => a.planet1 === 'Venus' || a.planet2 === 'Venus')
          ) {
            general += 'Harmony and beauty surround you. ';
            love = 'Romantic opportunities abound today.';
            finance = 'Good day for financial planning.';
            luckyColor = 'Green';
          }

          if (aspects.some(a => a.planet1 === 'Mars' || a.planet2 === 'Mars')) {
            general += 'Energy and motivation are strong. ';
            career = 'Perfect time for action and new beginnings.';
            health = 'Physical activities will be beneficial.';
            luckyColor = 'Red';
          }

          general +=
            'Trust your intuition and embrace the day\'s opportunities.';

          return {
            general,
            luckyColor,
            luckyNumber,
            love,
            career,
            finance,
            health
          };
        } catch (astrologerError) {
          logger.warn(
            'Astrologer library failed, falling back to basic horoscope:',
            astrologerError.message
          );
        }
      }

      // Fallback to basic horoscope by sun sign
      const sunSign = await this.calculateSunSign(birthDate, birthTime, birthPlace);
      const basicHoroscopes = {
        Aries:
          'Today brings new opportunities for leadership. Trust your instincts and take bold action. Energy is high - channel it into productive activities.',
        Taurus:
          'Focus on stability and practical matters. Your patience will be rewarded today. Ground yourself in what truly matters.',
        Gemini:
          'Communication is key today. Express your ideas and connect with others. Your words have power - use them wisely.',
        Cancer:
          'Pay attention to your emotions and home life. Nurture your relationships. Intuition is your greatest guide today.',
        Leo: 'Your creative energy is high today. Share your talents with the world. Confidence and charisma are your allies.',
        Virgo:
          'Attention to detail will serve you well. Organize and plan for success. Your analytical mind is sharp today.',
        Libra:
          'Seek balance and harmony in all your dealings. Diplomacy wins the day. Beauty and grace surround your path.',
        Scorpio:
          'Trust your intuition. Deep insights will guide you to important truths. Transformation is possible today.',
        Sagittarius:
          'Adventure calls! Expand your horizons and explore new possibilities. Freedom and exploration bring joy.',
        Capricorn:
          'Focus on long-term goals. Your ambition will lead to achievement. Discipline leads to success today.',
        Aquarius:
          'Innovation and originality will set you apart. Think outside the box. Progressive ideas flow freely.',
        Pisces:
          'Trust your imagination. Creative and spiritual pursuits bring fulfillment. Compassion guides your actions.'
      };

      const horoscope =
        basicHoroscopes[sunSign] ||
        'Today brings opportunities for growth and self-discovery. Trust your inner wisdom and embrace new possibilities.';

      return {
        general: horoscope,
        luckyColor: 'Blue',
        luckyNumber: Math.floor(Math.random() * 9) + 1,
        love: 'Open your heart to meaningful connections.',
        career: 'Focus on steady progress toward your goals.',
        finance: 'Be mindful of your resources.',
        health: 'Listen to your body\'s needs.'
      };
    } catch (error) {
      logger.error('Error generating daily horoscope:', error);
      return {
        general:
          'Today brings opportunities for growth and self-discovery. Trust your inner wisdom.',
        luckyColor: 'Blue',
        luckyNumber: 7,
        love: 'Focus on meaningful connections.',
        career: 'Stay focused on your goals.',
        finance: 'Be mindful with resources.',
        health: 'Take care of your well-being.'
      };
    }
  }

  /**
   * Check compatibility between two people using synastry calculations
   * @param {Object} person1 - First person's birth data
   * @param {Object} person2 - Second person's birth data
   * @returns {Object} Compatibility result
   */
  async checkCompatibility(person1, person2) {
    return this.compatibilityChecker.checkCompatibility(person1, person2);
  }
    try {
      // If only signs are provided, fall back to basic compatibility
      if (typeof person1 === 'string' && typeof person2 === 'string') {
        return this._checkBasicCompatibility(person1, person2);
      }

      // Full synastry calculation
      const { birthDate: date1, birthTime: time1 = '12:00', birthPlace: place1 = 'Delhi, India' } = person1;
      const { birthDate: date2, birthTime: time2 = '12:00', birthPlace: place2 = 'Delhi, India' } = person2;

      // Parse birth data
      const [day1, month1, year1] = date1.split('/').map(Number);
      const [hour1, minute1] = time1.split(':').map(Number);
      const [day2, month2, year2] = date2.split('/').map(Number);
      const [hour2, minute2] = time2.split(':').map(Number);

      // Get coordinates and timezones
      const [lat1, lng1] = await this._getCoordinatesForPlace(place1);
      const [lat2, lng2] = await this._getCoordinatesForPlace(place2);

      const birthDateTime1 = new Date(year1, month1 - 1, day1, hour1, minute1);
      const birthDateTime2 = new Date(year2, month2 - 1, day2, hour2, minute2);

      const tz1 = await this._getTimezoneForPlace(lat1, lng1, birthDateTime1.getTime());
      const tz2 = await this._getTimezoneForPlace(lat2, lng2, birthDateTime2.getTime());

      // Prepare chart data
      const chart1Data = {
        year: year1, month: month1, date: day1, hours: hour1, minutes: minute1, seconds: 0,
        latitude: lat1, longitude: lng1, timezone: tz1, chartType: 'sidereal'
      };

      const chart2Data = {
        year: year2, month: month2, date: day2, hours: hour2, minutes: minute2, seconds: 0,
        latitude: lat2, longitude: lng2, timezone: tz2, chartType: 'sidereal'
      };

      // Generate natal charts
      const chart1 = this.astrologer.generateNatalChartData(chart1Data);
      const chart2 = this.astrologer.generateNatalChartData(chart2Data);

      // Generate synastry chart (composite aspects between charts)
      const synastryChart = this.astrologer.generateSynastryChartData(chart1Data, chart2Data);

      // Analyze compatibility
      const compatibility = this._analyzeSynastryCompatibility(synastryChart, chart1, chart2);

      return {
        person1: {
          sunSign: chart1.interpretations.sunSign,
          moonSign: chart1.interpretations.moonSign,
          risingSign: chart1.interpretations.risingSign
        },
        person2: {
          sunSign: chart2.interpretations.sunSign,
          moonSign: chart2.interpretations.moonSign,
          risingSign: chart2.interpretations.risingSign
        },
        compatibility: compatibility.rating,
        score: compatibility.score,
        description: compatibility.description,
        keyAspects: compatibility.keyAspects,
        strengths: compatibility.strengths,
        challenges: compatibility.challenges
      };
    } catch (error) {
      logger.error('Error in synastry compatibility calculation:', error);
      // Fallback to basic compatibility
      return this._checkBasicCompatibility(
        person1.birthDate ? await this.calculateSunSign(person1.birthDate, person1.birthTime, person1.birthPlace) : person1,
        person2.birthDate ? await this.calculateSunSign(person2.birthDate, person2.birthTime, person2.birthPlace) : person2
      );
    }
  }

  /**
   * Check basic compatibility between two signs (fallback)
   * @private
   * @param {string} sign1 - First sign
   * @param {string} sign2 - Second sign
   * @returns {Object} Compatibility result
   */
  _checkBasicCompatibility(sign1, sign2) {
    // Enhanced compatibility matrix based on traditional astrology
    const compatibility = {
      'Aries-Leo': 'Excellent',
      'Aries-Sagittarius': 'Excellent',
      'Aries-Gemini': 'Good',
      'Aries-Aquarius': 'Good',
      'Taurus-Virgo': 'Excellent',
      'Taurus-Capricorn': 'Excellent',
      'Taurus-Cancer': 'Good',
      'Taurus-Pisces': 'Good',
      'Gemini-Libra': 'Excellent',
      'Gemini-Aquarius': 'Excellent',
      'Gemini-Aries': 'Good',
      'Gemini-Leo': 'Good',
      'Cancer-Scorpio': 'Excellent',
      'Cancer-Pisces': 'Excellent',
      'Cancer-Taurus': 'Good',
      'Cancer-Virgo': 'Good',
      'Leo-Aries': 'Excellent',
      'Leo-Sagittarius': 'Excellent',
      'Leo-Gemini': 'Good',
      'Leo-Libra': 'Good',
      'Virgo-Taurus': 'Excellent',
      'Virgo-Capricorn': 'Excellent',
      'Virgo-Cancer': 'Good',
      'Virgo-Scorpio': 'Good',
      'Libra-Gemini': 'Excellent',
      'Libra-Aquarius': 'Excellent',
      'Libra-Leo': 'Good',
      'Libra-Sagittarius': 'Good',
      'Scorpio-Cancer': 'Excellent',
      'Scorpio-Pisces': 'Excellent',
      'Scorpio-Virgo': 'Good',
      'Scorpio-Capricorn': 'Good',
      'Sagittarius-Aries': 'Excellent',
      'Sagittarius-Leo': 'Excellent',
      'Sagittarius-Libra': 'Good',
      'Sagittarius-Aquarius': 'Good',
      'Capricorn-Taurus': 'Excellent',
      'Capricorn-Virgo': 'Excellent',
      'Capricorn-Scorpio': 'Good',
      'Capricorn-Pisces': 'Good',
      'Aquarius-Gemini': 'Excellent',
      'Aquarius-Libra': 'Excellent',
      'Aquarius-Sagittarius': 'Good',
      'Aquarius-Aries': 'Good',
      'Pisces-Cancer': 'Excellent',
      'Pisces-Scorpio': 'Excellent',
      'Pisces-Taurus': 'Good',
      'Pisces-Capricorn': 'Good'
    };

    const key = `${sign1}-${sign2}`;
    const reverseKey = `${sign2}-${sign1}`;

    const rating = compatibility[key] || compatibility[reverseKey] || 'Neutral';

    return {
      sign1,
      sign2,
      compatibility: rating,
      description: this.getCompatibilityDescription(sign1, sign2, rating)
    };
  }

  /**
   * Get compatibility description
   * @param {string} sign1 - First sign
   * @param {string} sign2 - Second sign
   * @param {string} rating - Compatibility rating
   * @returns {string} Description
   */
  getCompatibilityDescription(sign1, sign2, rating) {
    const descriptions = {
      Excellent: `The combination of ${sign1} and ${sign2} is highly compatible. You share similar values and communication styles, making your relationship harmonious and fulfilling.`,
      Good: `${sign1} and ${sign2} have good compatibility. With some effort, you can build a strong and balanced relationship.`,
      Neutral: `${sign1} and ${sign2} compatibility is neutral. It requires understanding and compromise to make the relationship work.`
    };
    return descriptions[rating] || 'Compatibility analysis not available.';
  }

  /**
   * Analyze synastry compatibility from charts
   * @private
   * @param {Object} synastryChart - Synastry chart data
   * @param {Object} chart1 - First person's chart
   * @param {Object} chart2 - Second person's chart
   * @returns {Object} Compatibility analysis
   */
  _analyzeSynastryCompatibility(synastryChart, chart1, chart2) {
    const aspects = synastryChart.aspects || [];
    let score = 50; // Base score
    const keyAspects = [];
    const strengths = [];
    const challenges = [];

    // Analyze major aspects between personal planets
    const personalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
    const majorAspects = aspects.filter(aspect =>
      personalPlanets.includes(aspect.planet1) && personalPlanets.includes(aspect.planet2)
    );

    // Score based on aspect types
    majorAspects.forEach(aspect => {
      switch (aspect.aspect) {
      case 'Conjunction':
        score += 15;
        keyAspects.push(`${aspect.planet1} conjunct ${aspect.planet2}`);
        strengths.push(`Strong ${this._getPlanetDomain(aspect.planet1)} connection`);
        break;
      case 'Trine':
        score += 12;
        keyAspects.push(`${aspect.planet1} trine ${aspect.planet2}`);
        strengths.push(`Harmonious ${this._getPlanetDomain(aspect.planet1)} flow`);
        break;
      case 'Sextile':
        score += 8;
        keyAspects.push(`${aspect.planet1} sextile ${aspect.planet2}`);
        strengths.push(`Supportive ${this._getPlanetDomain(aspect.planet1)} energy`);
        break;
      case 'Square':
        score -= 10;
        keyAspects.push(`${aspect.planet1} square ${aspect.planet2}`);
        challenges.push(`${this._getPlanetDomain(aspect.planet1)} tension to resolve`);
        break;
      case 'Opposition':
        score -= 8;
        keyAspects.push(`${aspect.planet1} opposition ${aspect.planet2}`);
        challenges.push(`${this._getPlanetDomain(aspect.planet1)} polarity to balance`);
        break;
      }
    });

    // Analyze sun-moon aspects (very important for relationships)
    const sunMoonAspects = aspects.filter(aspect =>
      (aspect.planet1 === 'Sun' && aspect.planet2 === 'Moon') ||
      (aspect.planet1 === 'Moon' && aspect.planet2 === 'Sun')
    );

    if (sunMoonAspects.length > 0) {
      const aspect = sunMoonAspects[0];
      if (aspect.aspect === 'Conjunction' || aspect.aspect === 'Trine') {
        score += 20;
        strengths.push('Strong emotional and identity harmony');
      } else if (aspect.aspect === 'Square' || aspect.aspect === 'Opposition') {
        score -= 15;
        challenges.push('Emotional and identity differences to navigate');
      }
    }

    // Analyze venus-mars aspects (relationship dynamics)
    const venusMarsAspects = aspects.filter(aspect =>
      ((aspect.planet1 === 'Venus' && aspect.planet2 === 'Mars') ||
       (aspect.planet1 === 'Mars' && aspect.planet2 === 'Venus'))
    );

    if (venusMarsAspects.length > 0) {
      const aspect = venusMarsAspects[0];
      if (aspect.aspect === 'Conjunction' || aspect.aspect === 'Trine' || aspect.aspect === 'Sextile') {
        score += 18;
        strengths.push('Natural chemistry and attraction');
      } else if (aspect.aspect === 'Square' || aspect.aspect === 'Opposition') {
        score += 5; // Can create passion but also conflict
        challenges.push('Intense chemistry requiring balance');
      }
    }

    // Determine rating based on score
    let rating;
    if (score >= 80) { rating = 'Excellent'; } else if (score >= 65) { rating = 'Very Good'; } else if (score >= 50) { rating = 'Good'; } else if (score >= 35) { rating = 'Fair'; } else { rating = 'Challenging'; }

    // Generate description
    const description = this._generateCompatibilityDescription(rating, strengths, challenges, chart1, chart2);

    return {
      rating,
      score: Math.max(0, Math.min(100, score)),
      description,
      keyAspects: keyAspects.slice(0, 5), // Top 5 aspects
      strengths: strengths.slice(0, 3), // Top 3 strengths
      challenges: challenges.slice(0, 3) // Top 3 challenges
    };
  }

  /**
   * Get planet domain description
   * @private
   * @param {string} planet - Planet name
   * @returns {string} Domain description
   */
  _getPlanetDomain(planet) {
    const domains = {
      Sun: 'identity and purpose',
      Moon: 'emotional and nurturing',
      Mercury: 'communication and thinking',
      Venus: 'love and values',
      Mars: 'action and desire',
      Jupiter: 'growth and wisdom',
      Saturn: 'structure and responsibility',
      Uranus: 'innovation and freedom',
      Neptune: 'spirituality and dreams',
      Pluto: 'transformation and power'
    };
    return domains[planet] || planet.toLowerCase();
  }

  /**
   * Generate compatibility description
   * @private
   * @param {string} rating - Compatibility rating
   * @param {Array} strengths - Relationship strengths
   * @param {Array} challenges - Relationship challenges
   * @param {Object} chart1 - First person's chart
   * @param {Object} chart2 - Second person's chart
   * @returns {string} Description
   */
  _generateCompatibilityDescription(rating, strengths, challenges, chart1, chart2) {
    const sign1 = chart1.interpretations.sunSign;
    const sign2 = chart2.interpretations.sunSign;

    let description = `Based on the synastry between ${sign1} and ${sign2} charts, this relationship shows ${rating.toLowerCase()} compatibility. `;

    if (strengths.length > 0) {
      description += `Strengths include: ${strengths.join(', ')}. `;
    }

    if (challenges.length > 0) {
      description += `Areas for growth: ${challenges.join(', ')}. `;
    }

    description += 'Remember, astrology offers insights but relationships require mutual understanding and effort.';

    return description;
  }

  /**
   * Generate detailed birth chart analysis
   * @param {Object} birthData - Birth data object
   * @returns {Object} Detailed chart data
   */
  async generateDetailedChart(birthData) {
    const { birthDate, birthTime, birthPlace } = birthData;

    const sunSign = await this.calculateSunSign(birthDate, birthTime, birthPlace);
    const moonSign = await this.calculateMoonSign(birthDate, birthTime, birthPlace);
    const risingSign = await this.calculateRisingSign(
      birthDate,
      birthTime,
      birthPlace
    );

    // Generate life patterns based on sun sign
    const lifePatterns = this.generateLifePatterns(sunSign);

    return {
      sunSign,
      moonSign,
      risingSign,
      lifePatterns
    };
  }

  /**
   * Generate 3-day transit preview with real astrological calculations
   * @param {Object} birthData - Birth data
   * @param {number} days - Number of days
   * @returns {Object} Transit preview
   */
  async generateTransitPreview(birthData, days = 3) {
    return this.vedicCalculator.generateTransitPreview(birthData, days);
  }
    try {
      const { birthDate, birthTime = '12:00', birthPlace = 'Delhi, India' } = birthData;

      // Parse birth date
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get birth coordinates and timezone
      const [birthLatitude, birthLongitude] = await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const birthTimestamp = birthDateTime.getTime();
      const birthTimezone = await this._getTimezoneForPlace(birthLatitude, birthLongitude, birthTimestamp);

      // Prepare natal data
      const natalData = {
        year, month, date: day, hours: hour, minutes: minute, seconds: 0,
        latitude: birthLatitude, longitude: birthLongitude, timezone: birthTimezone,
        chartType: 'sidereal'
      };

      const transits = {};

      // Generate transit preview for each day
      for (let i = 0; i < days; i++) {
        const transitDate = new Date();
        transitDate.setDate(transitDate.getDate() + i);

        const transitData = {
          year: transitDate.getFullYear(),
          month: transitDate.getMonth() + 1,
          date: transitDate.getDate(),
          hours: 12, minutes: 0, seconds: 0, // Noon for daily transits
          latitude: birthLatitude, longitude: birthLongitude, timezone: birthTimezone,
          chartType: 'sidereal'
        };

        // Generate transit chart
        const transitChart = this.astrologer.generateTransitChartData(natalData, transitData);

        // Analyze major transits and aspects
        const dayName = i === 0 ? 'today' : i === 1 ? 'tomorrow' : `day${i + 1}`;
        transits[dayName] = this._interpretDailyTransits(transitChart, i);
      }

      return transits;
    } catch (error) {
      logger.error('Error generating transit preview:', error);
      // Fallback to basic preview
      return {
        today: '🌅 *Today:* Planetary energies support new beginnings and communication. Perfect for starting conversations or initiating projects.',
        tomorrow: '🌞 *Tomorrow:* Focus on relationships and partnerships. Harmonious energies make this a good day for collaboration.',
        day3: '🌙 *Day 3:* Creative inspiration flows strongly. Use this energy for artistic pursuits or innovative thinking.'
      };
    }
  }

  /**
   * Interpret daily transits for transit preview
   * @private
   * @param {Object} transitChart - Transit chart data
   * @param {number} dayOffset - Days from today (0 = today, 1 = tomorrow, etc.)
   * @returns {string} Daily transit interpretation
   */
  _interpretDailyTransits(transitChart, dayOffset) {
    const dayNames = ['Today', 'Tomorrow', 'Day 3'];
    const dayName = dayNames[dayOffset] || `Day ${dayOffset + 1}`;

    let interpretation = `🌟 *${dayName}:* `;

    const aspects = transitChart.aspects || [];
    const planets = transitChart.planets || [];

    // Analyze major planetary aspects
    const majorAspects = aspects.filter(aspect =>
      ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(aspect.planet1) ||
      ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(aspect.planet2)
    );

    // Check for significant transits
    const sunAspects = majorAspects.filter(a => a.planet1 === 'Sun' || a.planet2 === 'Sun');
    const moonAspects = majorAspects.filter(a => a.planet1 === 'Moon' || a.planet2 === 'Moon');
    const venusAspects = majorAspects.filter(a => a.planet1 === 'Venus' || a.planet2 === 'Venus');
    const marsAspects = majorAspects.filter(a => a.planet1 === 'Mars' || a.planet2 === 'Mars');

    const insights = [];

    // Sun transits (consciousness, vitality)
    if (sunAspects.length > 0) {
      const sunAspect = sunAspects[0];
      if (sunAspect.aspect === 'Trine' || sunAspect.aspect === 'Sextile') {
        insights.push('Solar energy brings confidence and vitality');
      } else if (sunAspect.aspect === 'Square' || sunAspect.aspect === 'Opposition') {
        insights.push('Solar challenges encourage self-awareness and growth');
      }
    }

    // Moon transits (emotions, intuition)
    if (moonAspects.length > 0) {
      const moonAspect = moonAspects[0];
      if (moonAspect.aspect === 'Trine' || moonAspect.aspect === 'Sextile') {
        insights.push('Emotional awareness and intuition are heightened');
      } else if (moonAspect.aspect === 'Square' || moonAspect.aspect === 'Opposition') {
        insights.push('Emotional challenges invite inner reflection');
      }
    }

    // Venus transits (relationships, harmony)
    if (venusAspects.length > 0) {
      insights.push('Harmonious energies favor relationships and creative pursuits');
    }

    // Mars transits (action, energy)
    if (marsAspects.length > 0) {
      insights.push('Dynamic energy supports action and new beginnings');
    }

    // Mercury transits (communication, thinking)
    const mercuryAspects = majorAspects.filter(a => a.planet1 === 'Mercury' || a.planet2 === 'Mercury');
    if (mercuryAspects.length > 0) {
      insights.push('Communication and mental clarity are emphasized');
    }

    // Jupiter transits (expansion, wisdom)
    const jupiterAspects = majorAspects.filter(a => a.planet1 === 'Jupiter' || a.planet2 === 'Jupiter');
    if (jupiterAspects.length > 0) {
      insights.push('Opportunities for growth and learning present themselves');
    }

    // Saturn transits (structure, responsibility)
    const saturnAspects = majorAspects.filter(a => a.planet1 === 'Saturn' || a.planet2 === 'Saturn');
    if (saturnAspects.length > 0) {
      insights.push('Focus on structure, discipline, and long-term goals');
    }

    if (insights.length === 0) {
      // Default interpretation based on day
      const defaults = [
        'Planetary energies support new beginnings and communication',
        'Focus on relationships and partnerships with harmonious energies',
        'Creative inspiration flows strongly for artistic pursuits'
      ];
      interpretation += defaults[dayOffset] || 'A balanced day for personal growth and reflection';
    } else {
      interpretation += `${insights.slice(0, 2).join('. ')}.`;
    }

    return interpretation;
  }

  /**
   * Calculate moon sign (simplified)
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time
   * @returns {string} Moon sign
   */

  /**
   * Calculate rising sign (simplified)
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time
   * @param {string} birthPlace - Birth place
   * @returns {string} Rising sign
   */
  async calculateRisingSign(birthDate, birthTime, birthPlace) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Prepare data for astrologer library
      const astroData = {
        year,
        month,
        date: day,
        hours: hour,
        minutes: minute,
        seconds: 0,
        latitude,
        longitude,
        timezone,
        chartType: 'sidereal'
      };

      // Generate natal chart
      const chart = this.astrologer.generateNatalChartData(astroData);

      // Return rising sign from interpretations
      const { risingSign } = chart.interpretations;
      if (!risingSign || risingSign === 'Unknown' || typeof risingSign !== 'string') {
        throw new Error('Invalid rising sign from astrologer');
      }
      return risingSign;
    } catch (error) {
      logger.error('Error calculating rising sign with astrologer:', error);
      // Fallback to simplified calculation
      const signs = this.zodiacSigns;
      const [day, month] = birthDate.split('/').map(Number);
      const dayOfYear = this.getDayOfYear(day, month);
      return signs[(dayOfYear + 8) % 12]; // Offset for rising
    }
  }

  /**
   * Generate life patterns based on sun sign
   * @param {string} sunSign - Sun sign
   * @returns {Array} Life patterns
   */
  generateLifePatterns(sunSign) {
    const patterns = {
      Aries: [
        'Natural leadership and initiative',
        'Competitive drive and courage',
        'Independent problem-solving'
      ],
      Taurus: [
        'Practical and reliable nature',
        'Strong work ethic and patience',
        'Appreciation for beauty and comfort'
      ],
      Gemini: [
        'Excellent communication skills',
        'Adaptable and versatile mind',
        'Curious and intellectual pursuits'
      ],
      Cancer: [
        'Deep emotional intelligence',
        'Strong intuition and empathy',
        'Protective of loved ones'
      ],
      Leo: [
        'Creative self-expression',
        'Natural charisma and confidence',
        'Generous and warm-hearted'
      ],
      Virgo: [
        'Attention to detail and precision',
        'Analytical and helpful nature',
        'Strong sense of duty'
      ],
      Libra: [
        'Diplomatic and fair-minded',
        'Appreciation for harmony and balance',
        'Social and cooperative'
      ],
      Scorpio: [
        'Intense emotional depth',
        'Powerful intuition and insight',
        'Transformative resilience'
      ],
      Sagittarius: [
        'Adventurous and optimistic spirit',
        'Love of learning and exploration',
        'Honest and philosophical'
      ],
      Capricorn: [
        'Ambitious and disciplined',
        'Strong sense of responsibility',
        'Patient long-term planning'
      ],
      Aquarius: [
        'Innovative and humanitarian',
        'Independent thinking',
        'Progressive and forward-looking'
      ],
      Pisces: [
        'Compassionate and artistic',
        'Strong imagination and intuition',
        'Spiritual and empathetic'
      ]
    };

    return (
      patterns[sunSign] || [
        'Strong communication abilities',
        'Natural leadership qualities',
        'Creative problem-solving skills'
      ]
    );
  }

  /**
   * Get day of year
   * @param {number} day - Day
   * @param {number} month - Month
   * @returns {number} Day of year
   */
  getDayOfYear(day, month) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let dayOfYear = day;
    for (let i = 0; i < month - 1; i++) {
      dayOfYear += daysInMonth[i];
    }
    return dayOfYear;
  }

  /**
   * Generate enhanced description based on complete chart data
   * @private
   * @param {Object} chart - Complete chart data from astrologer
   * @returns {string} Enhanced description
   */
  _generateEnhancedDescription(chart) {
    const {
      sunSign,
      moonSign,
      risingSign,
      dominantElements,
      dominantQualities,
      chartPatterns
    } = chart.interpretations;

    let description = `Your natal chart reveals a ${sunSign} Sun, ${moonSign} Moon, and ${risingSign} Rising. `;

    // Add dominant elements insight
    if (dominantElements && dominantElements.length > 0) {
      const elements = dominantElements.join(' and ');
      description += `The dominant ${elements} element${dominantElements.length > 1 ? 's' : ''} in your chart ${dominantElements.length > 1 ? 'bring' : 'brings'} balance and harmony to your personality. `;
    }

    // Add chart patterns insight
    if (
      chartPatterns &&
      chartPatterns.stelliums &&
      chartPatterns.stelliums.length > 0
    ) {
      description += `A stellium in ${chartPatterns.stelliums[0]} indicates concentrated energy in this area of life. `;
    }

    // Add element emphasis insight
    if (chartPatterns && chartPatterns.elementEmphasis) {
      const maxElement = Object.entries(chartPatterns.elementEmphasis).reduce(
        (a, b) =>
          (chartPatterns.elementEmphasis[a[0]] >
          chartPatterns.elementEmphasis[b[0]] ?
            a :
            b)
      )[0];
      description += `Your chart shows strong ${maxElement} energy, suggesting ${this._getElementDescription(maxElement)}.`;
    }

    return description;
  }

  /**
   * Extract personality traits from chart
   * @private
   * @param {Object} chart - Chart data
   * @returns {Array} Personality traits
   */
  _extractPersonalityTraits(chart) {
    const traits = [];
    const { sunSign, moonSign, risingSign } = chart.interpretations;

    // Sun sign traits
    const sunTraits = {
      Aries: ['Bold', 'Energetic', 'Independent'],
      Taurus: ['Reliable', 'Patient', 'Practical'],
      Gemini: ['Adaptable', 'Communicative', 'Curious'],
      Cancer: ['Intuitive', 'Nurturing', 'Emotional'],
      Leo: ['Creative', 'Confident', 'Generous'],
      Virgo: ['Analytical', 'Helpful', 'Detail-oriented'],
      Libra: ['Diplomatic', 'Harmonious', 'Social'],
      Scorpio: ['Intense', 'Passionate', 'Resilient'],
      Sagittarius: ['Adventurous', 'Optimistic', 'Honest'],
      Capricorn: ['Ambitious', 'Disciplined', 'Responsible'],
      Aquarius: ['Innovative', 'Independent', 'Humanitarian'],
      Pisces: ['Compassionate', 'Imaginative', 'Spiritual']
    };

    // Moon sign traits (emotional nature)
    const moonTraits = {
      Aries: ['Spontaneous', 'Direct', 'Protective'],
      Taurus: ['Stable', 'Comfort-loving', 'Persistent'],
      Gemini: ['Versatile', 'Expressive', 'Restless'],
      Cancer: ['Sensitive', 'Caring', 'Instinctive'],
      Leo: ['Dramatic', 'Loyal', 'Proud'],
      Virgo: ['Practical', 'Critical', 'Service-oriented'],
      Libra: ['Balanced', 'Charming', 'Indecisive'],
      Scorpio: ['Intense', 'Secretive', 'Powerful'],
      Sagittarius: ['Freedom-loving', 'Philosophical', 'Restless'],
      Capricorn: ['Reserved', 'Ambitious', 'Structured'],
      Aquarius: ['Unconventional', 'Intellectual', 'Detached'],
      Pisces: ['Dreamy', 'Empathetic', 'Intuitive']
    };

    // Rising sign traits (outward personality)
    const risingTraits = {
      Aries: ['Confident', 'Assertive', 'Pioneering'],
      Taurus: ['Steady', 'Reliable', 'Sensual'],
      Gemini: ['Versatile', 'Curious', 'Communicative'],
      Cancer: ['Protective', 'Intuitive', 'Nurturing'],
      Leo: ['Dramatic', 'Charismatic', 'Creative'],
      Virgo: ['Precise', 'Analytical', 'Helpful'],
      Libra: ['Charming', 'Diplomatic', 'Fair-minded'],
      Scorpio: ['Intense', 'Mysterious', 'Powerful'],
      Sagittarius: ['Adventurous', 'Optimistic', 'Honest'],
      Capricorn: ['Ambitious', 'Responsible', 'Structured'],
      Aquarius: ['Innovative', 'Independent', 'Humanitarian'],
      Pisces: ['Dreamy', 'Compassionate', 'Artistic']
    };

    traits.push(...(sunTraits[sunSign] || []));
    traits.push(...(moonTraits[moonSign] || []));
    traits.push(...(risingTraits[risingSign] || []));

    // Remove duplicates and return unique traits
    return [...new Set(traits)].slice(0, 6); // Limit to 6 traits
  }

  /**
   * Extract strengths from chart
   * @private
   * @param {Object} chart - Chart data
   * @returns {Array} Strengths
   */
  _extractStrengths(chart) {
    const { dominantElements, chartPatterns } = chart.interpretations;
    const strengths = [];

    // Element-based strengths
    if (dominantElements && dominantElements.includes('fire')) {
      strengths.push('Leadership and initiative');
    }
    if (dominantElements && dominantElements.includes('earth')) {
      strengths.push('Practicality and reliability');
    }
    if (dominantElements && dominantElements.includes('air')) {
      strengths.push('Communication and intellect');
    }
    if (dominantElements && dominantElements.includes('water')) {
      strengths.push('Emotional intelligence and intuition');
    }

    // Chart pattern strengths
    if (
      chartPatterns &&
      chartPatterns.stelliums &&
      chartPatterns.stelliums.length > 0
    ) {
      strengths.push('Concentrated expertise in specific areas');
    }

    // Planetary strengths
    const { planets } = chart;
    if (planets.jupiter && planets.jupiter.sign) {
      strengths.push('Optimism and growth orientation');
    }
    if (planets.mercury && planets.mercury.sign) {
      strengths.push('Strong communication skills');
    }

    return strengths.slice(0, 4); // Limit to 4 strengths
  }

  /**
   * Analyze planetary speeds and retrograde motion
   * @private
   * @param {Object} planets - Planet data with speed information
   * @returns {Object} Speed and retrograde analysis
   */
  _analyzePlanetarySpeeds(planets) {
    const analysis = {
      retrogradePlanets: [],
      stationaryPlanets: [],
      fastMovingPlanets: [],
      slowMovingPlanets: [],
      interpretations: []
    };

    const speedThresholds = {
      mercury: { slow: 1.0, fast: 2.0 },
      venus: { slow: 1.0, fast: 1.5 },
      mars: { slow: 0.5, fast: 0.8 },
      jupiter: { slow: 0.05, fast: 0.15 },
      saturn: { slow: 0.02, fast: 0.05 },
      sun: { slow: 0.95, fast: 1.05 }, // Sun is always ~1 degree/day
      moon: { slow: 12, fast: 15 } // Moon varies significantly
    };

    Object.entries(planets).forEach(([planetName, data]) => {
      if (data.speed !== undefined) {
        const speed = Math.abs(data.speed);
        const thresholds = speedThresholds[planetName] || { slow: 0.1, fast: 1.0 };

        // Check retrograde
        if (data.retrograde) {
          analysis.retrogradePlanets.push(planetName);
          analysis.interpretations.push(`${planetName} retrograde: Internal reflection and reassessment of ${this._getPlanetDomain(planetName)}`);
        }

        // Check stationary (very slow speed)
        if (speed < thresholds.slow * 0.1) {
          analysis.stationaryPlanets.push(planetName);
          analysis.interpretations.push(`${planetName} stationary: Critical turning point in ${this._getPlanetDomain(planetName)}`);
        }

        // Check fast/slow movement
        if (speed > thresholds.fast) {
          analysis.fastMovingPlanets.push(planetName);
          analysis.interpretations.push(`Fast-moving ${planetName}: Rapid developments in ${this._getPlanetDomain(planetName)}`);
        } else if (speed < thresholds.slow) {
          analysis.slowMovingPlanets.push(planetName);
          analysis.interpretations.push(`Slow-moving ${planetName}: Prolonged focus on ${this._getPlanetDomain(planetName)}`);
        }
      }
    });

    return analysis;
  }

  /**
   * Get planet's domain/area of influence
   * @private
   * @param {string} planet - Planet name
   * @returns {string} Domain description
   */
  _getPlanetDomain(planet) {
    const domains = {
      sun: 'identity and life purpose',
      moon: 'emotions and inner life',
      mercury: 'communication and intellect',
      venus: 'relationships and values',
      mars: 'action and energy',
      jupiter: 'growth and expansion',
      saturn: 'responsibility and structure'
    };
    return domains[planet] || 'life matters';
  }

  /**
   * Extract challenges from chart
   * @private
   * @param {Object} chart - Chart data
   * @returns {Array} Challenges
   */
  _extractChallenges(chart) {
    const { dominantQualities, chartPatterns } = chart.interpretations;
    const challenges = [];

    // Quality-based challenges
    if (dominantQualities && dominantQualities.includes('cardinal')) {
      challenges.push('Need to balance initiative with patience');
    }
    if (dominantQualities && dominantQualities.includes('fixed')) {
      challenges.push('Learning to adapt to change');
    }

    // Element imbalance challenges
    if (chartPatterns && chartPatterns.elementEmphasis) {
      const elements = Object.entries(chartPatterns.elementEmphasis);
      const minElement = elements.reduce((a, b) =>
        (chartPatterns.elementEmphasis[a[0]] <
        chartPatterns.elementEmphasis[b[0]] ?
          a :
          b)
      )[0];

      if (minElement === 'fire') {
        challenges.push('Developing motivation and drive');
      } else if (minElement === 'earth') {
        challenges.push('Building practical foundations');
      } else if (minElement === 'air') {
        challenges.push('Improving communication and social skills');
      } else if (minElement === 'water') {
        challenges.push('Developing emotional awareness');
      }
    }

    // Retrograde planets as challenges
    const { planets } = chart;
    let retrogradeCount = 0;
    Object.values(planets).forEach(planet => {
      if (planet.retrograde) {
        retrogradeCount++;
      }
    });

    if (retrogradeCount > 2) {
      challenges.push('Internal reflection and reassessment');
    }

    return challenges.slice(0, 3); // Limit to 3 challenges
  }

  /**
   * Get element description
   * @private
   * @param {string} element - Element name
   * @returns {string} Description
   */
  _getElementDescription(element) {
    const descriptions = {
      fire: 'passion, creativity, and leadership abilities',
      earth: 'practicality, stability, and material success',
      air: 'intellectual pursuits, communication, and social connections',
      water: 'emotional depth, intuition, and healing abilities'
    };
    return descriptions[element] || 'unique qualities and perspectives';
  }

  /**
   * Get major planetary aspects from chart
   * @private
   * @param {Object} chart - Chart data
   * @returns {Array} Major aspects
   */
  _getMajorAspects(chart) {
    const aspects = [];
    const { planets } = chart;

    // Define aspect angles (in degrees)
    const aspects_def = {
      conjunction: 0,
      sextile: 60,
      square: 90,
      trine: 120,
      opposition: 180
    };

    const planetKeys = Object.keys(planets);

    // Check for major aspects between planets
    for (let i = 0; i < planetKeys.length; i++) {
      for (let j = i + 1; j < planetKeys.length; j++) {
        const planet1 = planets[planetKeys[i]];
        const planet2 = planets[planetKeys[j]];

        if (planet1.longitude && planet2.longitude) {
          const angle = Math.abs(planet1.longitude - planet2.longitude) % 360;
          const minAngle = Math.min(angle, 360 - angle);

          // Check for major aspects (within 5 degrees orb)
          Object.entries(aspects_def).forEach(([aspectName, aspectAngle]) => {
            if (Math.abs(minAngle - aspectAngle) <= 5) {
              aspects.push({
                planets: `${planet1.name}-${planet2.name}`,
                aspect: aspectName,
                angle: Math.round(minAngle * 10) / 10
              });
            }
          });
        }
      }
    }

    return aspects.slice(0, 5); // Return top 5 aspects
  }

  /**
   * Get stellium interpretation
   * @private
   * @param {Array} stelliums - Stellium signs
   * @returns {string} Interpretation
   */
  _getStelliumInterpretation(stelliums) {
    if (!stelliums || stelliums.length === 0) {
      return '';
    }

    const sign = stelliums[0];
    const interpretations = {
      Aries: 'intense focus on personal identity and self-expression',
      Taurus: 'strong emphasis on material security and sensory experiences',
      Gemini: 'heightened communication and intellectual pursuits',
      Cancer: 'deep emotional connections and family matters',
      Leo: 'creative self-expression and leadership qualities',
      Virgo: 'attention to detail and service to others',
      Libra: 'focus on relationships and harmony',
      Scorpio: 'intense transformation and deep psychological insights',
      Sagittarius: 'philosophical exploration and adventure',
      Capricorn: 'career ambitions and long-term planning',
      Aquarius: 'innovation and humanitarian concerns',
      Pisces: 'spiritual growth and artistic expression'
    };

    return (
      interpretations[sign] || 'concentrated energy in specific life areas'
    );
  }

  /**
   * Generate detailed chart analysis with aspects and patterns
   * @param {Object} user - User object with birth details
   * @returns {Object} Detailed chart analysis
   */
  async generateDetailedChartAnalysis(user) {
    try {
      const basicChart = this.generateBasicBirthChart(user);
      const { fullChart } = basicChart;

      // Get major aspects
      const majorAspects = this._getMajorAspects(fullChart);

      // Enhanced analysis
      const speedAnalysis = this._analyzePlanetarySpeeds(fullChart.planets || {});
      const jd = this._dateToJulianDay(year, month, day, 12, 0); // Midday for distance calculation
      const heliocentricDistances = await this._calculateHeliocentricDistances(jd);

      const analysis = {
        ...basicChart,
        majorAspects,
        stelliumInterpretation: this._getStelliumInterpretation(
          fullChart.chartPatterns?.stelliums
        ),
        elementBalance: this._analyzeElementBalance(
          fullChart.chartPatterns?.elementEmphasis
        ),
        lifePurpose: this._deriveLifePurpose(basicChart),
        currentTransits: this._getCurrentTransits(basicChart.sunSign),
        planetarySpeeds: speedAnalysis,
        heliocentricDistances
      };

      return analysis;
    } catch (error) {
      logger.error('Error generating detailed chart analysis:', error);
      return this.generateBasicBirthChart(user); // Fallback to basic chart
    }
  }

  /**
   * Analyze element balance
   * @private
   * @param {Object} elementEmphasis - Element emphasis data
   * @returns {string} Element balance analysis
   */
  _analyzeElementBalance(elementEmphasis) {
    if (!elementEmphasis) {
      return 'Balanced elemental energies';
    }

    const elements = Object.entries(elementEmphasis);
    const sorted = elements.sort((a, b) => b[1] - a[1]);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];

    let analysis = `Strongest element: ${strongest[0]} (${strongest[1]} planets)`;
    if (weakest[1] === 0) {
      analysis += `. Consider developing ${weakest[0]} qualities for better balance.`;
    }

    return analysis;
  }

  /**
   * Derive life purpose from chart
   * @private
   * @param {Object} chart - Chart data
   * @returns {string} Life purpose insight
   */
  _deriveLifePurpose(chart) {
    const { sunSign, moonSign, risingSign, dominantElements } = chart;

    // Simple life purpose derivation based on sun sign and dominant elements
    const purposes = {
      Aries: 'To lead and initiate new beginnings',
      Taurus: 'To build stability and appreciate beauty',
      Gemini: 'To communicate and share knowledge',
      Cancer: 'To nurture and create emotional security',
      Leo: 'To create and inspire others',
      Virgo: 'To serve and improve systems',
      Libra: 'To harmonize and create balance',
      Scorpio: 'To transform and seek deeper truths',
      Sagittarius: 'To explore and expand horizons',
      Capricorn: 'To achieve and build lasting structures',
      Aquarius: 'To innovate and benefit humanity',
      Pisces: 'To heal and connect spiritually'
    };

    let purpose =
      purposes[sunSign] || 'To discover and fulfill your unique potential';

    if (dominantElements && dominantElements.includes('fire')) {
      purpose += ', channeling your creative fire into meaningful action';
    } else if (dominantElements && dominantElements.includes('earth')) {
      purpose += ', grounding your practical abilities in service to others';
    } else if (dominantElements && dominantElements.includes('air')) {
      purpose += ', using your intellect to bridge understanding';
    } else if (dominantElements && dominantElements.includes('water')) {
      purpose += ', flowing with emotional wisdom to heal and connect';
    }

    return purpose;
  }

  /**
   * Get current transits insight
   * @private
   * @param {string} sunSign - Sun sign
   * @returns {string} Current transits insight
   */
  _getCurrentTransits(sunSign) {
    // Simplified current transits based on sun sign
    const transits = {
      Aries: 'Mars energy is activating your drive and initiative',
      Taurus: 'Venus is enhancing your appreciation for beauty and stability',
      Gemini: 'Mercury is stimulating your communication and learning',
      Cancer: 'The Moon is heightening your emotional awareness',
      Leo: 'The Sun is boosting your confidence and creativity',
      Virgo: 'Mercury is focusing your attention on details and service',
      Libra: 'Venus is promoting harmony in your relationships',
      Scorpio: 'Pluto is encouraging deep transformation',
      Sagittarius: 'Jupiter is expanding your horizons',
      Capricorn: 'Saturn is teaching valuable life lessons',
      Aquarius: 'Uranus is inspiring innovation and change',
      Pisces: 'Neptune is enhancing your intuition and spirituality'
    };

    return (
      transits[sunSign] ||
      'Current cosmic energies are supporting your growth and evolution'
    );
  }

  /**
   * Calculate Lunar Return analysis for monthly themes
   * @param {Object} birthData - Birth data object with birthDate, birthTime, birthPlace
   * @param {Date} targetDate - Date for lunar return (defaults to next lunar return)
   * @returns {Object} Lunar return analysis
   */
  async calculateLunarReturn(birthData, targetDate = null) {
    return this.vedicCalculator.calculateLunarReturn(birthData, targetDate);
  }
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return { error: 'Complete birth details required for lunar return analysis' };
      }

      // Parse birth date and time
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get birth location coordinates
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const birthTimestamp = birthDateTime.getTime();
      const birthTimezone = await this._getTimezoneForPlace(latitude, longitude, birthTimestamp);

      // Calculate birth moon position
      const birthJD = this._dateToJulianDay(year, month, day, hour + minute / 60);
      const birthMoonPos = sweph.calc(birthJD, 1, 2);
      const birthMoonLongitude = birthMoonPos.longitude ? birthMoonPos.longitude[0] : 0;

      // Determine target date (next lunar return if not specified)
      const now = targetDate || new Date();
      const targetJD = this._dateToJulianDay(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
        now.getHours() + now.getMinutes() / 60
      );

      // Find the lunar return time (when Moon returns to birth position)
      let lunarReturnJD = targetJD;
      let iterations = 0;
      const maxIterations = 30; // Max 30 days search

      while (iterations < maxIterations) {
        const moonPos = sweph.calc(lunarReturnJD, 1, 2);
        const currentMoonLong = moonPos.longitude ? moonPos.longitude[0] : 0;

        const diff = this._normalizeAngle(currentMoonLong - birthMoonLongitude);
        if (Math.abs(diff) < 1) { // Within 1 degree
          break;
        }

        // Move forward by approximately 1 day (Moon moves ~12-15 degrees per day)
        lunarReturnJD += 1;
        iterations++;
      }

      if (iterations >= maxIterations) {
        return { error: 'Unable to calculate lunar return timing' };
      }

      // Convert JD back to date
      const lunarReturnDate = this._jdToDate(lunarReturnJD);

      // Generate lunar return chart
      const lunarReturnChart = await this._generateLunarReturnChart(
        birthData,
        lunarReturnDate,
        birthMoonLongitude
      );

      // Analyze the lunar return chart
      const analysis = this._analyzeLunarReturnChart(lunarReturnChart, birthData);

      return {
        lunarReturnDate: lunarReturnDate.toLocaleDateString(),
        lunarReturnTime: lunarReturnDate.toLocaleTimeString(),
        monthAhead: new Date(lunarReturnDate.getFullYear(), lunarReturnDate.getMonth() + 1, 0).toLocaleDateString(),
        lunarReturnChart,
        analysis,
        themes: analysis.themes,
        opportunities: analysis.opportunities,
        challenges: analysis.challenges,
        summary: this._generateLunarReturnSummary(analysis)
      };
    } catch (error) {
      logger.error('Error calculating lunar return:', error);
      return { error: 'Unable to calculate lunar return at this time' };
    }
  }

  /**
   * Generate lunar return chart
   * @private
   * @param {Object} birthData - Birth data
   * @param {Date} lunarReturnDate - Lunar return date
   * @param {number} birthMoonLongitude - Birth Moon longitude
   * @returns {Object} Lunar return chart
   */
  async _generateLunarReturnChart(birthData, lunarReturnDate, birthMoonLongitude) {
    try {
      const { birthPlace } = birthData;

      // Get coordinates
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const timestamp = lunarReturnDate.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Generate chart for lunar return moment
      const astroData = {
        year: lunarReturnDate.getFullYear(),
        month: lunarReturnDate.getMonth() + 1,
        date: lunarReturnDate.getDate(),
        hours: lunarReturnDate.getHours(),
        minutes: lunarReturnDate.getMinutes(),
        seconds: 0,
        latitude,
        longitude,
        timezone,
        chartType: 'sidereal'
      };

      const chart = this.astrologer.generateNatalChartData(astroData);

      // Ensure Moon is at birth position
      if (chart.planets.moon) {
        chart.planets.moon.longitude = birthMoonLongitude;
        chart.planets.moon.signName = this._getSignFromLongitude(birthMoonLongitude);
      }

      return chart;
    } catch (error) {
      logger.error('Error generating lunar return chart:', error);
      return {
        planets: {},
        houses: {},
        aspects: [],
        interpretations: {
          sunSign: 'Unknown',
          moonSign: 'Unknown',
          risingSign: 'Unknown'
        }
      };
    }
  }

  /**
   * Analyze lunar return chart
   * @private
   * @param {Object} lunarReturnChart - Lunar return chart
   * @param {Object} birthData - Birth data
   * @returns {Object} Analysis of lunar return
   */
  _analyzeLunarReturnChart(lunarReturnChart, birthData) {
    const analysis = {
      themes: [],
      opportunities: [],
      challenges: [],
      lunarReturnMoonSign: lunarReturnChart.interpretations?.moonSign || 'Unknown',
      lunarReturnSunSign: lunarReturnChart.interpretations?.sunSign || 'Unknown',
      lunarReturnRisingSign: lunarReturnChart.interpretations?.risingSign || 'Unknown'
    };

    // Analyze Moon's house in lunar return (emotional focus for the month)
    const moonHouse = lunarReturnChart.planets.moon?.house || 'Unknown';
    if (moonHouse !== 'Unknown') {
      analysis.themes.push(`Emotional focus in ${this._getHouseArea(moonHouse)}`);
    }

    // Analyze Sun's house in lunar return (conscious focus for the month)
    const sunHouse = lunarReturnChart.planets.sun?.house || 'Unknown';
    if (sunHouse !== 'Unknown') {
      analysis.themes.push(`Conscious attention to ${this._getHouseArea(sunHouse)}`);
    }

    // Analyze angular planets (powerful influences for the month)
    const angularHouses = [1, 4, 7, 10];
    Object.entries(lunarReturnChart.planets).forEach(([planet, data]) => {
      if (angularHouses.includes(data.house)) {
        analysis.themes.push(`${planet} strongly activated in ${this._getHouseArea(data.house)}`);
      }
    });

    // Generate opportunities and challenges based on aspects
    if (lunarReturnChart.aspects) {
      lunarReturnChart.aspects.forEach(aspect => {
        if (aspect.aspect === 'Trine' || aspect.aspect === 'Sextile') {
          analysis.opportunities.push(`${aspect.planets} harmony supports ${this._getAspectOpportunity(aspect)}`);
        } else if (aspect.aspect === 'Square' || aspect.aspect === 'Opposition') {
          analysis.challenges.push(`${aspect.planets} tension requires ${this._getAspectChallenge(aspect)}`);
        }
      });
    }

    return analysis;
  }

  /**
   * Get aspect opportunity
   * @private
   * @param {Object} aspect - Aspect data
   * @returns {string} Opportunity description
   */
  _getAspectOpportunity(aspect) {
    const opportunities = {
      'Sun-Moon': 'emotional balance and self-expression',
      'Sun-Mercury': 'clear communication and learning',
      'Sun-Venus': 'creative expression and relationships',
      'Moon-Venus': 'emotional harmony and nurturing',
      'Mercury-Venus': 'artistic communication and social ease'
    };

    const key = aspect.planets;
    return opportunities[key] || 'smooth progress and natural flow';
  }

  /**
   * Get aspect challenge
   * @private
   * @param {Object} aspect - Aspect data
   * @returns {string} Challenge description
   */
  _getAspectChallenge(aspect) {
    const challenges = {
      'Sun-Moon': 'balancing inner and outer needs',
      'Sun-Mercury': 'clear thinking amidst emotional complexity',
      'Sun-Venus': 'balancing self-expression with relationship needs',
      'Moon-Venus': 'navigating emotional attachments',
      'Mercury-Venus': 'communicating feelings effectively'
    };

    const key = aspect.planets;
    return challenges[key] || 'growth through tension and adaptation';
  }

  /**
   * Generate lunar return summary
   * @private
   * @param {Object} analysis - Lunar return analysis
   * @returns {string} Summary text
   */
  _generateLunarReturnSummary(analysis) {
    let summary = '🌙 *Lunar Return Analysis*\n\n';

    summary += '*Monthly Themes:*\n';
    analysis.themes.forEach(theme => {
      summary += `• ${theme}\n`;
    });

    if (analysis.opportunities.length > 0) {
      summary += '\n*Opportunities:*\n';
      analysis.opportunities.slice(0, 3).forEach(opp => {
        summary += `• ${opp}\n`;
      });
    }

    if (analysis.challenges.length > 0) {
      summary += '\n*Challenges & Growth:*\n';
      analysis.challenges.slice(0, 3).forEach(challenge => {
        summary += `• ${challenge}\n`;
      });
    }

    summary += `\n*Moon in ${analysis.lunarReturnMoonSign}* - Emotional atmosphere and inner life focus`;
    summary += `\n*Sun in ${analysis.lunarReturnSunSign}* - Conscious direction and outer activities`;

    return summary;
  }

  /**
   * Normalize angle to -180 to 180 range
   * @private
   * @param {number} angle - Angle in degrees
   * @returns {number} Normalized angle
   */
  _normalizeAngle(angle) {
    angle %= 360;
    if (angle > 180) { angle -= 360; }
    if (angle <= -180) { angle += 360; }
    return angle;
  }

  /**
   * Calculate Ashtakavarga - Vedic predictive system using bindus (points)
   * @param {Object} birthData - Birth data object
   * @returns {Object} Complete Ashtakavarga analysis
   */
  async calculateAshtakavarga(birthData) {
    return this.vedicCalculator.calculateAshtakavarga(birthData);
  }
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return { error: 'Complete birth details required for Ashtakavarga analysis' };
      }

      // Parse birth date and time
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Calculate Julian Day
      const jd = this._dateToJulianDay(year, month, day, hour + minute / 60);

      // Get planetary positions
      const planets = await this._getVedicPlanetaryPositions(jd, latitude, longitude, timezone);

      // Calculate Ashtakavarga for each planet
      const ashtakavarga = {};
      const planetNames = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

      planetNames.forEach(planet => {
        ashtakavarga[planet] = this._calculatePlanetAshtakavarga(planet, planets);
      });

      // Calculate Sarva Ashtakavarga (combined)
      const sarvaAshtakavarga = this._calculateSarvaAshtakavarga(ashtakavarga);

      // Analyze results
      const analysis = this._analyzeAshtakavarga(ashtakavarga, sarvaAshtakavarga);

      return {
        individualAshtakavarga: ashtakavarga,
        sarvaAshtakavarga,
        analysis,
        summary: this._generateAshtakavargaSummary(analysis),
        predictions: this._generateAshtakavargaPredictions(sarvaAshtakavarga)
      };
    } catch (error) {
      logger.error('Error calculating Ashtakavarga:', error);
      return { error: 'Unable to calculate Ashtakavarga at this time' };
    }
  }

  /**
   * Get Vedic planetary positions for Ashtakavarga
   * @private
   * @param {number} jd - Julian Day
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} timezone - Timezone
   * @returns {Object} Planetary positions
   */
  async _getVedicPlanetaryPositions(jd, latitude, longitude, timezone) {
    const planets = {};

    const planetIds = {
      sun: 0,
      moon: 1,
      mars: 4,
      mercury: 2,
      jupiter: 5,
      venus: 3,
      saturn: 6
    };

    for (const [planetName, planetId] of Object.entries(planetIds)) {
      try {
        const position = sweph.calc(jd, planetId, 2 | 65536);
        if (position && position.longitude) {
          const longitude = position.longitude[0];
          const house = this._getVedicHouse(longitude, jd, latitude, longitude, timezone);
          planets[planetName] = {
            longitude,
            house,
            sign: Math.floor(longitude / 30) + 1 // 1-12 Vedic signs
          };
        }
      } catch (error) {
        logger.warn(`Error calculating ${planetName} position:`, error.message);
      }
    }

    return planets;
  }

  /**
   * Get Vedic house position (1-12)
   * @private
   * @param {number} longitude - Planet longitude
   * @param {number} jd - Julian Day
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} timezone - Timezone
   * @returns {number} House number (1-12)
   */
  _getVedicHouse(planetLongitude, jd, latitude, longitude, timezone) {
    try {
      // Calculate ascendant
      const houses = sweph.houses(jd, latitude, longitude, 'E'); // Equal houses for Vedic
      const ascendant = houses.ascendant[0];

      // Calculate house position
      let relativePosition = planetLongitude - ascendant;
      if (relativePosition < 0) { relativePosition += 360; }

      return Math.floor(relativePosition / 30) + 1;
    } catch (error) {
      // Fallback: simple house calculation
      return Math.floor(planetLongitude / 30) + 1;
    }
  }

  /**
   * Calculate Ashtakavarga for a specific planet
   * @private
   * @param {string} planet - Planet name
   * @param {Object} allPlanets - All planetary positions
   * @returns {Array} Bindus for each house (1-12)
   */
  _calculatePlanetAshtakavarga(planet, allPlanets) {
    const bindus = new Array(12).fill(0); // Houses 1-12

    if (!allPlanets[planet]) { return bindus; }

    const planetHouse = allPlanets[planet].house;
    const planetSign = allPlanets[planet].sign;

    // Ashtakavarga rules for each planet
    const rules = this._getAshtakavargaRules(planet);

    // Check each house for bindus
    for (let house = 1; house <= 12; house++) {
      let points = 0;

      // 1. Own house
      if (house === planetHouse) { points += rules.ownHouse; }

      // 2. Own sign
      if (house === ((planetSign - 1) % 12) + 1) { points += rules.ownSign; }

      // 3. Exaltation sign
      const exaltationSigns = {
        sun: 1, moon: 2, mars: 10, mercury: 6, jupiter: 4, venus: 12, saturn: 7
      };
      if (house === exaltationSigns[planet]) { points += rules.exaltation; }

      // 4. Moolatrikona sign
      const moolatrikonaSigns = {
        sun: 1, moon: 2, mars: 1, mercury: 6, jupiter: 5, venus: 2, saturn: 10
      };
      if (house === moolatrikonaSigns[planet]) { points += rules.moolatrikona; }

      // 5. Own nakshatra
      const ownNakshatras = this._getOwnNakshatras(planet);
      if (ownNakshatras.includes(house)) { points += rules.ownNakshatra; }

      // 6. Friendly planets' positions
      const friendlyPlanets = this._getFriendlyPlanets(planet);
      Object.entries(allPlanets).forEach(([otherPlanet, data]) => {
        if (friendlyPlanets.includes(otherPlanet) && data.house === house) {
          points += rules.friendlyPlanet;
        }
      });

      // 7. Enemy planets' positions (negative)
      const enemyPlanets = this._getEnemyPlanets(planet);
      Object.entries(allPlanets).forEach(([otherPlanet, data]) => {
        if (enemyPlanets.includes(otherPlanet) && data.house === house) {
          points += rules.enemyPlanet;
        }
      });

      // 8. Aspect relationships
      points += this._calculateAshtakavargaAspects(planet, house, allPlanets, rules);

      // Ensure points don't exceed maximum
      bindus[house - 1] = Math.min(points, 8);
    }

    return bindus;
  }

  /**
   * Get Ashtakavarga rules for a planet
   * @private
   * @param {string} planet - Planet name
   * @returns {Object} Rules for bindu calculation
   */
  _getAshtakavargaRules(planet) {
    // Standard Ashtakavarga rules
    const baseRules = {
      ownHouse: 1,
      ownSign: 1,
      exaltation: 1,
      moolatrikona: 1,
      ownNakshatra: 1,
      friendlyPlanet: 1,
      enemyPlanet: -1,
      aspect7th: 1,
      aspect9th: 1,
      aspect4th: 1,
      aspect10th: 1,
      aspect5th: 1,
      aspect11th: 1,
      aspect3rd: 1,
      aspect12th: 1
    };

    // Planet-specific modifications
    const modifications = {
      sun: { aspect7th: 0, aspect9th: 0, aspect4th: 0 },
      moon: { aspect9th: 0, aspect4th: 0 },
      mars: { aspect7th: 0, aspect9th: 0 },
      mercury: { aspect4th: 0 },
      jupiter: {},
      venus: { aspect7th: 0 },
      saturn: { aspect7th: 0, aspect9th: 0, aspect4th: 0 }
    };

    return { ...baseRules, ...(modifications[planet] || {}) };
  }

  /**
   * Get own nakshatras for a planet
   * @private
   * @param {string} planet - Planet name
   * @returns {Array} House numbers of own nakshatras
   */
  _getOwnNakshatras(planet) {
    const nakshatraMap = {
      sun: [5, 6, 7],      // Leo
      moon: [4],           // Cancer
      mars: [1, 8],        // Aries, Scorpio
      mercury: [3, 6],     // Gemini, Virgo
      jupiter: [5, 9],     // Leo, Sagittarius
      venus: [2, 7],       // Taurus, Libra
      saturn: [10, 11]     // Capricorn, Aquarius
    };
    return nakshatraMap[planet] || [];
  }

  /**
   * Get friendly planets for a planet
   * @private
   * @param {string} planet - Planet name
   * @returns {Array} Friendly planet names
   */
  _getFriendlyPlanets(planet) {
    const friendships = {
      sun: ['moon', 'mars', 'jupiter'],
      moon: ['sun', 'mercury', 'venus', 'saturn'],
      mars: ['sun', 'moon', 'jupiter'],
      mercury: ['sun', 'venus'],
      jupiter: ['sun', 'moon', 'mars'],
      venus: ['mercury', 'saturn'],
      saturn: ['mercury', 'venus']
    };
    return friendships[planet] || [];
  }

  /**
   * Get enemy planets for a planet
   * @private
   * @param {string} planet - Planet name
   * @returns {Array} Enemy planet names
   */
  _getEnemyPlanets(planet) {
    const enemies = {
      sun: ['venus', 'saturn'],
      moon: ['mars'],
      mars: ['mercury'],
      mercury: ['moon'],
      jupiter: ['mercury', 'venus'],
      venus: ['sun', 'moon'],
      saturn: ['sun', 'moon', 'mars']
    };
    return enemies[planet] || [];
  }

  /**
   * Calculate aspect bindus for Ashtakavarga
   * @private
   * @param {string} planet - Planet name
   * @param {number} house - House number (1-12)
   * @param {Object} allPlanets - All planetary positions
   * @param {Object} rules - Ashtakavarga rules
   * @returns {number} Aspect bindus
   */
  _calculateAshtakavargaAspects(planet, house, allPlanets, rules) {
    let aspectPoints = 0;

    // Vedic aspects: 7th, 9th, 4th, 10th, 5th, 11th, 3rd, 12th
    const aspects = [7, 9, 4, 10, 5, 11, 3, 12];
    const aspectNames = ['aspect7th', 'aspect9th', 'aspect4th', 'aspect10th', 'aspect5th', 'aspect11th', 'aspect3rd', 'aspect12th'];

    aspects.forEach((aspect, index) => {
      const aspectHouse = ((house - 1 + aspect - 1) % 12) + 1;
      const aspectName = aspectNames[index];

      // Check if any planet is in the aspected house
      Object.entries(allPlanets).forEach(([otherPlanet, data]) => {
        if (data.house === aspectHouse) {
          aspectPoints += rules[aspectName] || 0;
        }
      });
    });

    return aspectPoints;
  }

  /**
   * Calculate Sarva Ashtakavarga (combined bindus)
   * @private
   * @param {Object} individualAshtakavargas - Individual planet Ashtakavargas
   * @returns {Array} Combined bindus for each house
   */
  _calculateSarvaAshtakavarga(individualAshtakavargas) {
    const sarvaBindus = new Array(12).fill(0);

    // Sum bindus from all planets for each house
    Object.values(individualAshtakavargas).forEach(planetBindus => {
      planetBindus.forEach((bindu, houseIndex) => {
        sarvaBindus[houseIndex] += bindu;
      });
    });

    return sarvaBindus;
  }

  /**
   * Analyze Ashtakavarga results
   * @private
   * @param {Object} individualAshtakavargas - Individual Ashtakavargas
   * @param {Array} sarvaAshtakavarga - Sarva Ashtakavarga bindus
   * @returns {Object} Analysis results
   */
  _analyzeAshtakavarga(individualAshtakavargas, sarvaAshtakavarga) {
    const analysis = {
      strongHouses: [],
      weakHouses: [],
      planetaryStrength: {},
      auspiciousHouses: [],
      inauspiciousHouses: []
    };

    // Analyze Sarva Ashtakavarga
    sarvaAshtakavarga.forEach((bindus, houseIndex) => {
      const house = houseIndex + 1;

      if (bindus >= 25) {
        analysis.strongHouses.push(house);
        analysis.auspiciousHouses.push(house);
      } else if (bindus <= 15) {
        analysis.weakHouses.push(house);
        analysis.inauspiciousHouses.push(house);
      }
    });

    // Analyze individual planetary strength
    Object.entries(individualAshtakavargas).forEach(([planet, bindus]) => {
      const totalBindus = bindus.reduce((sum, b) => sum + b, 0);
      analysis.planetaryStrength[planet] = {
        totalBindus,
        strength: totalBindus >= 30 ? 'Very Strong' : totalBindus >= 25 ? 'Strong' : totalBindus >= 20 ? 'Moderate' : 'Weak'
      };
    });

    return analysis;
  }

  /**
   * Generate Ashtakavarga summary
   * @private
   * @param {Object} analysis - Ashtakavarga analysis
   * @returns {string} Summary text
   */
  _generateAshtakavargaSummary(analysis) {
    let summary = '🔢 *Ashtakavarga Analysis*\n\n';

    summary += '*Planetary Strength:*\n';
    Object.entries(analysis.planetaryStrength).forEach(([planet, data]) => {
      summary += `• ${planet.charAt(0).toUpperCase() + planet.slice(1)}: ${data.totalBindus} bindus (${data.strength})\n`;
    });

    summary += '\n*Strong Houses (Auspicious):*\n';
    if (analysis.strongHouses.length > 0) {
      summary += `Houses ${analysis.strongHouses.join(', ')} - Areas of success and positive outcomes\n`;
    } else {
      summary += 'No exceptionally strong houses found\n';
    }

    summary += '\n*Weak Houses (Challenging):*\n';
    if (analysis.weakHouses.length > 0) {
      summary += `Houses ${analysis.weakHouses.join(', ')} - Areas requiring attention and effort\n`;
    } else {
      summary += 'No exceptionally weak houses found\n';
    }

    return summary;
  }

  /**
   * Generate Ashtakavarga predictions
   * @private
   * @param {Array} sarvaAshtakavarga - Sarva Ashtakavarga bindus
   * @returns {Object} Predictions for different life areas
   */
  _generateAshtakavargaPredictions(sarvaAshtakavarga) {
    const predictions = {
      overall: '',
      career: '',
      wealth: '',
      health: '',
      relationships: '',
      spirituality: ''
    };

    // Overall assessment based on total bindus
    const totalBindus = sarvaAshtakavarga.reduce((sum, b) => sum + b, 0);
    if (totalBindus >= 220) {
      predictions.overall = 'Exceptionally favorable planetary influences. Success in most endeavors.';
    } else if (totalBindus >= 180) {
      predictions.overall = 'Generally favorable conditions with some challenges to overcome.';
    } else if (totalBindus >= 140) {
      predictions.overall = 'Mixed influences requiring conscious effort and positive actions.';
    } else {
      predictions.overall = 'Challenging planetary conditions. Focus on spiritual growth and perseverance.';
    }

    // House-specific predictions
    const houseAreas = {
      1: 'self, personality, physical appearance',
      2: 'wealth, family, speech',
      3: 'siblings, communication, short journeys',
      4: 'home, mother, emotions, property',
      5: 'children, education, creativity, intelligence',
      6: 'health, service, enemies, obstacles',
      7: 'marriage, partnerships, business',
      8: 'longevity, secrets, occult, transformation',
      9: 'fortune, father, spirituality, higher learning',
      10: 'career, reputation, authority, public image',
      11: 'gains, friends, hopes, wishes',
      12: 'expenses, foreign lands, spirituality, losses'
    };

    // Career (10th house)
    const careerBindus = sarvaAshtakavarga[9]; // 0-indexed
    if (careerBindus >= 25) {
      predictions.career = 'Excellent career prospects with success and recognition.';
    } else if (careerBindus >= 20) {
      predictions.career = 'Good career potential with steady progress.';
    } else {
      predictions.career = 'Career may require extra effort and perseverance.';
    }

    // Wealth (2nd house)
    const wealthBindus = sarvaAshtakavarga[1];
    if (wealthBindus >= 25) {
      predictions.wealth = 'Strong financial prospects and material success.';
    } else if (wealthBindus >= 20) {
      predictions.wealth = 'Moderate financial stability with growth potential.';
    } else {
      predictions.wealth = 'Financial challenges may require careful planning.';
    }

    // Health (6th house - ironically, strong 6th house shows good health)
    const healthBindus = sarvaAshtakavarga[5];
    if (healthBindus >= 25) {
      predictions.health = 'Generally good health with strong vitality.';
    } else if (healthBindus >= 20) {
      predictions.health = 'Reasonable health with occasional challenges.';
    } else {
      predictions.health = 'Health may require attention and lifestyle adjustments.';
    }

    // Relationships (7th house)
    const relationshipBindus = sarvaAshtakavarga[6];
    if (relationshipBindus >= 25) {
      predictions.relationships = 'Harmonious relationships and successful partnerships.';
    } else if (relationshipBindus >= 20) {
      predictions.relationships = 'Stable relationships with room for growth.';
    } else {
      predictions.relationships = 'Relationship challenges may require patience and understanding.';
    }

    // Spirituality (9th and 12th houses)
    const spiritualBindus = (sarvaAshtakavarga[8] + sarvaAshtakavarga[11]) / 2;
    if (spiritualBindus >= 25) {
      predictions.spirituality = 'Strong spiritual inclinations and wisdom.';
    } else if (spiritualBindus >= 20) {
      predictions.spirituality = 'Growing spiritual awareness and understanding.';
    } else {
      predictions.spirituality = 'Spiritual growth may come through life\'s challenges.';
    }

    return predictions;
  }

  /**
   * Calculate Varga (Divisional) Charts - Vedic system of harmonic charts
   * @param {Object} birthData - Birth data object
   * @param {string} varga - Varga type (D1, D2, D3, D4, D7, D9, D10, D12, etc.)
   * @returns {Object} Varga chart analysis
   */
  async calculateVargaChart(birthData, varga = 'D9') {
    return this.vedicCalculator.calculateVargaChart(birthData, varga);
  }
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return { error: 'Complete birth details required for Varga chart analysis' };
      }

      // Parse birth date and time
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Calculate Julian Day
      const jd = this._dateToJulianDay(year, month, day, hour + minute / 60);

      // Get D1 (Rashi) chart first
      const d1Chart = await this.generateBasicBirthChart(birthData);

      // Calculate Varga chart
      const vargaChart = await this._calculateVargaPositions(d1Chart.planets, varga);

      // Analyze the Varga chart
      const analysis = this._analyzeVargaChart(vargaChart, varga);

      return {
        varga,
        chart: vargaChart,
        analysis,
        significance: this._getVargaSignificance(varga),
        summary: this._generateVargaSummary(vargaChart, varga, analysis)
      };
    } catch (error) {
      logger.error('Error calculating Varga chart:', error);
      return { error: 'Unable to calculate Varga chart at this time' };
    }
  }

  /**
   * Calculate planetary positions in Varga chart
   * @private
   * @param {Object} d1Planets - D1 chart planets
   * @param {string} varga - Varga type
   * @returns {Object} Varga chart planets
   */
  async _calculateVargaPositions(d1Planets, varga) {
    const vargaChart = {};
    const divisor = this._getVargaDivisor(varga);

    Object.entries(d1Planets).forEach(([planetName, d1Data]) => {
      if (d1Data && d1Data.longitude !== undefined) {
        // Calculate Varga position using Vedic division method
        const vargaLongitude = this._calculateVargaLongitude(d1Data.longitude, divisor, varga);

        // Calculate sign and house in Varga chart
        const vargaSign = Math.floor(vargaLongitude / 30) + 1;
        const vargaHouse = vargaSign; // In Varga charts, signs and houses are the same

        vargaChart[planetName] = {
          name: d1Data.name,
          longitude: vargaLongitude,
          sign: vargaSign,
          house: vargaHouse,
          signName: this._getVedicSignName(vargaSign),
          aspects: this._calculateVargaAspects(vargaLongitude, vargaChart, varga)
        };
      }
    });

    return vargaChart;
  }

  /**
   * Get Varga divisor
   * @private
   * @param {string} varga - Varga type
   * @returns {number} Divisor for the Varga
   */
  _getVargaDivisor(varga) {
    const divisors = {
      D1: 1,   // Rashi
      D2: 2,   // Hora
      D3: 3,   // Dreshkana
      D4: 4,   // Chaturthamsa
      D7: 7,   // Saptamsa
      D9: 9,   // Navamsa
      D10: 10, // Dashamsa
      D12: 12, // Dwadashamsa
      D16: 16, // Shodashamsa
      D20: 20, // Vimshamsha
      D24: 24, // Chaturvimshamsha
      D27: 27, // Saptavimshamsha (Nakshatras)
      D30: 30, // Trimshamsha
      D40: 40, // Khavedamsha
      D45: 45, // Akshavedamsha
      D60: 60  // Shashtiamsha
    };
    return divisors[varga] || 9; // Default to Navamsa
  }

  /**
   * Calculate longitude in Varga chart
   * @private
   * @param {number} d1Longitude - D1 longitude
   * @param {number} divisor - Varga divisor
   * @param {string} varga - Varga type
   * @returns {number} Varga longitude
   */
  _calculateVargaLongitude(d1Longitude, divisor, varga) {
    // Vedic Varga calculation method
    const signLongitude = d1Longitude % 30; // Position within sign (0-29.99)
    const vargaPortion = signLongitude * divisor / 30; // Divide sign into portions
    const vargaSignIndex = Math.floor(vargaPortion); // Which portion (0 to divisor-1)
    const vargaPositionInPortion = (vargaPortion - vargaSignIndex) * 30; // Position within portion

    // Convert back to full zodiac longitude
    return vargaSignIndex * 30 + vargaPositionInPortion;
  }

  /**
   * Get Vedic sign name
   * @private
   * @param {number} signNumber - Sign number (1-12)
   * @returns {string} Sign name
   */
  _getVedicSignName(signNumber) {
    const signNames = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signNames[signNumber - 1] || 'Unknown';
  }

  /**
   * Calculate aspects in Varga chart
   * @private
   * @param {number} planetLongitude - Planet's longitude in Varga
   * @param {Object} vargaChart - Current Varga chart
   * @param {string} varga - Varga type
   * @returns {Array} Aspects
   */
  _calculateVargaAspects(planetLongitude, vargaChart, varga) {
    const aspects = [];

    // In Varga charts, aspects are similar to D1 but may have different rules
    Object.entries(vargaChart).forEach(([otherPlanet, data]) => {
      if (data.longitude !== undefined && data.longitude !== planetLongitude) {
        const angle = Math.abs(data.longitude - planetLongitude);
        const minAngle = Math.min(angle, 360 - angle);

        // Check for major aspects
        if (minAngle <= 10) { // Conjunction
          aspects.push({ planet: otherPlanet, aspect: 'Conjunction', orb: minAngle });
        } else if (Math.abs(minAngle - 90) <= 8) { // Square
          aspects.push({ planet: otherPlanet, aspect: 'Square', orb: Math.abs(minAngle - 90) });
        } else if (Math.abs(minAngle - 120) <= 8) { // Trine
          aspects.push({ planet: otherPlanet, aspect: 'Trine', orb: Math.abs(minAngle - 120) });
        } else if (Math.abs(minAngle - 180) <= 8) { // Opposition
          aspects.push({ planet: otherPlanet, aspect: 'Opposition', orb: Math.abs(minAngle - 180) });
        }
      }
    });

    return aspects;
  }

  /**
   * Analyze Varga chart
   * @private
   * @param {Object} vargaChart - Varga chart data
   * @param {string} varga - Varga type
   * @returns {Object} Analysis results
   */
  _analyzeVargaChart(vargaChart, varga) {
    const analysis = {
      strongPlanets: [],
      weakPlanets: [],
      yogas: [],
      beneficialPositions: [],
      challengingPositions: []
    };

    // Analyze planetary positions in Varga chart
    Object.entries(vargaChart).forEach(([planetName, data]) => {
      const { sign } = data;
      const strength = this._evaluateVargaPosition(planetName, sign, varga);

      if (strength > 7) {
        analysis.strongPlanets.push(planetName);
        analysis.beneficialPositions.push(`${planetName} in ${data.signName}`);
      } else if (strength < 4) {
        analysis.weakPlanets.push(planetName);
        analysis.challengingPositions.push(`${planetName} in ${data.signName}`);
      }

      // Check for Varga-specific yogas
      const yogas = this._checkVargaYogas(vargaChart, varga);
      analysis.yogas.push(...yogas);
    });

    // Remove duplicate yogas
    analysis.yogas = [...new Set(analysis.yogas)];

    return analysis;
  }

  /**
   * Evaluate planetary strength in Varga position
   * @private
   * @param {string} planet - Planet name
   * @param {number} sign - Sign number (1-12)
   * @param {string} varga - Varga type
   * @returns {number} Strength score (0-10)
   */
  _evaluateVargaPosition(planet, sign, varga) {
    let strength = 5; // Base strength

    // Varga-specific exaltation and debilitation
    const exaltationSigns = {
      D9: { sun: 1, moon: 2, mars: 10, mercury: 6, jupiter: 4, venus: 12, saturn: 7 }, // Navamsa
      D10: { sun: 1, moon: 4, mars: 10, mercury: 1, jupiter: 7, venus: 4, saturn: 7 }, // Dashamsa
      D7: { sun: 1, moon: 1, mars: 1, mercury: 4, jupiter: 7, venus: 12, saturn: 7 }   // Saptamsa
    };

    const debilitationSigns = {
      D9: { sun: 7, moon: 8, mars: 4, mercury: 12, jupiter: 10, venus: 6, saturn: 1 },
      D10: { sun: 7, moon: 10, mars: 4, mercury: 7, jupiter: 1, venus: 10, saturn: 1 },
      D7: { sun: 7, moon: 7, mars: 7, mercury: 10, jupiter: 1, venus: 6, saturn: 1 }
    };

    if (exaltationSigns[varga] && exaltationSigns[varga][planet] === sign) {
      strength += 3;
    } else if (debilitationSigns[varga] && debilitationSigns[varga][planet] === sign) {
      strength -= 3;
    }

    // Own sign strength
    const ownSigns = {
      sun: [5], moon: [4], mars: [1, 8], mercury: [3, 6], jupiter: [5, 9], venus: [2, 7], saturn: [10, 11]
    };

    if (ownSigns[planet] && ownSigns[planet].includes(sign)) {
      strength += 2;
    }

    // Friendly sign strength
    const friendlySigns = {
      sun: [1, 5, 9], moon: [2, 7, 11], mars: [1, 4, 7, 8, 11], mercury: [3, 6, 9, 12], jupiter: [1, 4, 5, 7, 9, 10], venus: [2, 3, 4, 5, 7, 9, 11, 12], saturn: [3, 6, 7, 10, 11]
    };

    if (friendlySigns[planet] && friendlySigns[planet].includes(sign)) {
      strength += 1;
    }

    return Math.max(0, Math.min(10, strength));
  }

  /**
   * Check for Varga-specific yogas
   * @private
   * @param {Object} vargaChart - Varga chart
   * @param {string} varga - Varga type
   * @returns {Array} Yogas found
   */
  _checkVargaYogas(vargaChart, varga) {
    const yogas = [];

    if (varga === 'D9') { // Navamsa yogas
      // Check for beneficial planetary combinations in Navamsa
      const planets = Object.keys(vargaChart);

      // Raja Yoga in Navamsa
      if (this._hasBeneficYoga(vargaChart, ['jupiter', 'venus']) ||
          this._hasBeneficYoga(vargaChart, ['jupiter', 'mercury'])) {
        yogas.push('Raja Yoga in Navamsa');
      }

      // Check for exalted planets
      Object.entries(vargaChart).forEach(([planet, data]) => {
        if (this._isExaltedInVarga(planet, data.sign, varga)) {
          yogas.push(`${planet} exalted in Navamsa`);
        }
      });
    }

    if (varga === 'D10') { // Dashamsa yogas
      // Career-related yogas
      if (vargaChart.sun && vargaChart.moon && vargaChart.sun.sign === vargaChart.moon.sign) {
        yogas.push('Sun-Moon conjunction in Dashamsa (leadership)');
      }

      if (vargaChart.jupiter && vargaChart.saturn &&
          Math.abs(vargaChart.jupiter.sign - vargaChart.saturn.sign) <= 1) {
        yogas.push('Jupiter-Saturn combination in Dashamsa (career stability)');
      }
    }

    return yogas;
  }

  /**
   * Check if planets form a beneficial yoga
   * @private
   * @param {Object} chart - Chart data
   * @param {Array} planets - Planet names to check
   * @returns {boolean} Whether yoga is formed
   */
  _hasBeneficYoga(chart, planets) {
    return planets.every(planet =>
      chart[planet] && chart[planet].sign &&
      this._isBeneficSign(chart[planet].sign)
    );
  }

  /**
   * Check if sign is benefic
   * @private
   * @param {number} sign - Sign number
   * @returns {boolean} Whether sign is benefic
   */
  _isBeneficSign(sign) {
    // Signs 1, 3, 5, 6, 7, 9, 10, 11 are generally benefic
    return [1, 3, 5, 6, 7, 9, 10, 11].includes(sign);
  }

  /**
   * Check if planet is exalted in Varga
   * @private
   * @param {string} planet - Planet name
   * @param {number} sign - Sign number
   * @param {string} varga - Varga type
   * @returns {boolean} Whether planet is exalted
   */
  _isExaltedInVarga(planet, sign, varga) {
    const exaltationSigns = {
      D9: { sun: 1, moon: 2, mars: 10, mercury: 6, jupiter: 4, venus: 12, saturn: 7 },
      D10: { sun: 1, moon: 4, mars: 10, mercury: 1, jupiter: 7, venus: 4, saturn: 7 }
    };

    return exaltationSigns[varga] && exaltationSigns[varga][planet] === sign;
  }

  /**
   * Get Varga significance
   * @private
   * @param {string} varga - Varga type
   * @returns {string} Significance description
   */
  _getVargaSignificance(varga) {
    const significances = {
      D1: 'Physical body, personality, and general life events',
      D2: 'Wealth, family, speech, and material possessions',
      D3: 'Siblings, communication, short journeys, and courage',
      D4: 'Property, home, mother, emotions, and happiness',
      D7: 'Children, creativity, intelligence, and education',
      D9: 'Marriage, partnerships, spouse, and life purpose',
      D10: 'Career, reputation, authority, and public image',
      D12: 'Spirituality, foreign lands, expenses, and losses',
      D16: 'Vehicles, happiness, and material comforts',
      D20: 'Spiritual practices and worship',
      D24: 'Education, knowledge, and learning',
      D27: 'Strengths, weaknesses, and overall fortune',
      D30: 'Misfortunes, enemies, and obstacles',
      D40: 'Auspicious and inauspicious events',
      D45: 'All areas of life (comprehensive)',
      D60: 'Karma and past life influences'
    };

    return significances[varga] || 'Specific life areas and influences';
  }

  /**
   * Generate Varga chart summary
   * @private
   * @param {Object} vargaChart - Varga chart
   * @param {string} varga - Varga type
   * @param {Object} analysis - Analysis results
   * @returns {string} Summary text
   */
  _generateVargaSummary(vargaChart, varga, analysis) {
    let summary = `🔢 *${varga} Chart Analysis*\n\n`;
    summary += `*Significance:* ${this._getVargaSignificance(varga)}\n\n`;

    summary += '*Planetary Positions:*\n';
    Object.entries(vargaChart).forEach(([planet, data]) => {
      summary += `• ${data.name}: ${data.signName}\n`;
    });

    if (analysis.strongPlanets.length > 0) {
      summary += '\n*Strong Planets:*\n';
      analysis.strongPlanets.forEach(planet => {
        summary += `• ${planet}\n`;
      });
    }

    if (analysis.yogas.length > 0) {
      summary += '\n*Yogas Formed:*\n';
      analysis.yogas.forEach(yoga => {
        summary += `• ${yoga}\n`;
      });
    }

    if (analysis.beneficialPositions.length > 0) {
      summary += '\n*Beneficial Positions:*\n';
      analysis.beneficialPositions.slice(0, 3).forEach(pos => {
        summary += `• ${pos}\n`;
      });
    }

    return summary;
  }

  /**
   * Calculate Vedic Yogas - Special planetary combinations
   * @param {Object} birthData - Birth data object
   * @returns {Object} Yoga analysis
   */
  async calculateVedicYogas(birthData) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return { error: 'Complete birth details required for Yoga analysis' };
      }

      // Get birth chart
      const birthChart = await this.generateBasicBirthChart(birthData);

      // Analyze different types of yogas
      const rajaYogas = this._analyzeRajaYogas(birthChart);
      const dhanaYogas = this._analyzeDhanaYogas(birthChart);
      const otherYogas = this._analyzeOtherYogas(birthChart);

      // Combine all yogas
      const allYogas = [...rajaYogas, ...dhanaYogas, ...otherYogas];

      // Generate overall assessment
      const assessment = this._assessYogaStrength(allYogas);

      return {
        rajaYogas,
        dhanaYogas,
        otherYogas,
        allYogas,
        assessment,
        summary: this._generateYogaSummary(allYogas, assessment)
      };
    } catch (error) {
      logger.error('Error calculating Vedic Yogas:', error);
      return { error: 'Unable to calculate Vedic Yogas at this time' };
    }
  }

  /**
   * Analyze Raja Yogas (Royal Combinations)
   * @private
   * @param {Object} chart - Birth chart
   * @returns {Array} Raja Yogas found
   */
  _analyzeRajaYogas(chart) {
    const yogas = [];
    const { planets } = chart;

    // Raja Yoga 1: Lords of Kendra and Trikona exchange signs
    const kendraLords = this._getHouseLords([1, 4, 7, 10], planets);
    const trikonaLords = this._getHouseLords([1, 5, 9], planets);

    kendraLords.forEach(kendraLord => {
      trikonaLords.forEach(trikonaLord => {
        if (this._planetsExchangeSigns(planets, kendraLord, trikonaLord)) {
          yogas.push({
            name: 'Raja Yoga',
            type: 'Exchange between Kendra and Trikona lords',
            planets: [kendraLord, trikonaLord],
            strength: 'Very Strong',
            effects: 'Power, authority, success, and leadership'
          });
        }
      });
    });

    // Raja Yoga 2: Benefic planets in Kendra from Moon
    const moonSign = planets.moon ? planets.moon.sign : null;
    if (moonSign) {
      const moonKendraSigns = [
        moonSign, // 1st from Moon
        (moonSign + 2) % 12 + 1, // 4th from Moon
        (moonSign + 6) % 12 + 1, // 7th from Moon
        (moonSign + 8) % 12 + 1  // 10th from Moon
      ];

      const beneficPlanets = ['jupiter', 'venus', 'mercury'];
      beneficPlanets.forEach(planet => {
        if (planets[planet] && moonKendraSigns.includes(planets[planet].sign)) {
          yogas.push({
            name: 'Raja Yoga',
            type: 'Benefic planet in Kendra from Moon',
            planets: [planet],
            strength: 'Strong',
            effects: 'Royal favor, success, and prosperity'
          });
        }
      });
    }

    // Raja Yoga 3: Sun and Moon in Kendra with benefics
    if (planets.sun && planets.moon) {
      const sunHouse = planets.sun.house;
      const moonHouse = planets.moon.house;
      const kendraHouses = [1, 4, 7, 10];

      if (kendraHouses.includes(sunHouse) && kendraHouses.includes(moonHouse)) {
        // Check for benefic aspects
        const benefics = ['jupiter', 'venus'];
        const hasBeneficAspect = benefics.some(benefic =>
          planets[benefic] && this._hasBeneficAspect(planets, benefic, 'sun') ||
          this._hasBeneficAspect(planets, benefic, 'moon')
        );

        if (hasBeneficAspect) {
          yogas.push({
            name: 'Raja Yoga',
            type: 'Sun and Moon in Kendra with benefic aspects',
            planets: ['sun', 'moon'],
            strength: 'Very Strong',
            effects: 'Supreme authority and royal status'
          });
        }
      }
    }

    return yogas;
  }

  /**
   * Analyze Dhana Yogas (Wealth Combinations)
   * @private
   * @param {Object} chart - Birth chart
   * @returns {Array} Dhana Yogas found
   */
  _analyzeDhanaYogas(chart) {
    const yogas = [];
    const { planets } = chart;

    // Dhana Yoga 1: 2nd and 11th lord conjunction or mutual aspect
    const secondLord = this._getHouseLord(2, planets);
    const eleventhLord = this._getHouseLord(11, planets);

    if (secondLord && eleventhLord) {
      if (this._planetsConjunct(planets, secondLord, eleventhLord) ||
          this._planetsMutualAspect(planets, secondLord, eleventhLord)) {
        yogas.push({
          name: 'Dhana Yoga',
          type: '2nd and 11th lords connected',
          planets: [secondLord, eleventhLord],
          strength: 'Strong',
          effects: 'Wealth accumulation and financial success'
        });
      }
    }

    // Dhana Yoga 2: Jupiter and Venus in 2nd, 5th, 9th, or 11th
    const wealthHouses = [2, 5, 9, 11];
    const wealthPlanets = ['jupiter', 'venus'];

    wealthPlanets.forEach(planet => {
      if (planets[planet] && wealthHouses.includes(planets[planet].house)) {
        yogas.push({
          name: 'Dhana Yoga',
          type: `${planet} in wealth house`,
          planets: [planet],
          strength: 'Strong',
          effects: 'Financial prosperity and material abundance'
        });
      }
    });

    // Dhana Yoga 3: Moon with or aspected by benefics in 2nd
    if (planets.moon && planets.moon.house === 2) {
      const benefics = ['jupiter', 'venus'];
      const hasBeneficConnection = benefics.some(benefic =>
        this._planetsConjunct(planets, 'moon', benefic) ||
        this._hasBeneficAspect(planets, benefic, 'moon')
      );

      if (hasBeneficConnection) {
        yogas.push({
          name: 'Dhana Yoga',
          type: 'Moon in 2nd with benefic connection',
          planets: ['moon'],
          strength: 'Very Strong',
          effects: 'Exceptional wealth and family prosperity'
        });
      }
    }

    return yogas;
  }

  /**
   * Analyze other significant Vedic Yogas
   * @private
   * @param {Object} chart - Birth chart
   * @returns {Array} Other Yogas found
   */
  _analyzeOtherYogas(chart) {
    const yogas = [];
    const { planets } = chart;

    // Gaja Kesari Yoga: Moon and Jupiter in Kendra from each other
    if (planets.moon && planets.jupiter) {
      const moonHouse = planets.moon.house;
      const jupiterHouse = planets.jupiter.house;

      const moonKendraFromJupiter = [
        jupiterHouse, // 1st
        (jupiterHouse + 2) % 12 + 1, // 4th
        (jupiterHouse + 5) % 12 + 1, // 7th
        (jupiterHouse + 8) % 12 + 1  // 10th
      ];

      const jupiterKendraFromMoon = [
        moonHouse, // 1st
        (moonHouse + 2) % 12 + 1, // 4th
        (moonHouse + 5) % 12 + 1, // 7th
        (moonHouse + 8) % 12 + 1  // 10th
      ];

      if (moonKendraFromJupiter.includes(moonHouse) ||
          jupiterKendraFromMoon.includes(jupiterHouse)) {
        yogas.push({
          name: 'Gaja Kesari Yoga',
          type: 'Moon and Jupiter in Kendra from each other',
          planets: ['moon', 'jupiter'],
          strength: 'Very Strong',
          effects: 'Wisdom, prosperity, and elephant-like strength'
        });
      }
    }

    // Pancha Mahapurusha Yoga: Five great planetary combinations
    const mahapurushaYogas = this._analyzeMahapurushaYogas(planets);
    yogas.push(...mahapurusahaYogas);

    // Neecha Bhanga Raja Yoga: Cancellation of debilitation
    const neechabhangaYogas = this._analyzeNeechabhangaYogas(planets);
    yogas.push(...neechabhangaYogas);

    // Chandra Mangala Yoga: Moon and Mars combination
    if (planets.moon && planets.mars) {
      const moonSign = planets.moon.sign;
      const marsSign = planets.mars.sign;

      // Moon and Mars in same sign or mutual Kendra
      if (moonSign === marsSign ||
          this._arePlanetsInMutualKendra(planets, 'moon', 'mars')) {
        yogas.push({
          name: 'Chandra Mangala Yoga',
          type: 'Moon and Mars combination',
          planets: ['moon', 'mars'],
          strength: 'Strong',
          effects: 'Courage, energy, and martial success'
        });
      }
    }

    return yogas;
  }

  /**
   * Analyze Pancha Mahapurusha Yogas
   * @private
   * @param {Object} planets - Planetary positions
   * @returns {Array} Mahapurusha Yogas
   */
  _analyzeMahapurushaYogas(planets) {
    const yogas = [];

    // Ruchaka Yoga: Mars in own sign in Kendra
    if (planets.mars && planets.mars.sign === 1 && [1, 4, 7, 10].includes(planets.mars.house)) {
      yogas.push({
        name: 'Ruchaka Yoga (Mars)',
        type: 'Mars in Aries in Kendra',
        planets: ['mars'],
        strength: 'Very Strong',
        effects: 'Fame, power, and leadership through action'
      });
    }

    // Bhadra Yoga: Mercury in own sign in Kendra
    if (planets.mercury && [3, 6].includes(planets.mercury.sign) && [1, 4, 7, 10].includes(planets.mercury.house)) {
      yogas.push({
        name: 'Bhadra Yoga (Mercury)',
        type: 'Mercury in Gemini/Virgo in Kendra',
        planets: ['mercury'],
        strength: 'Very Strong',
        effects: 'Intelligence, wealth, and scholarly success'
      });
    }

    // Hamsa Yoga: Jupiter in own sign in Kendra
    if (planets.jupiter && [5, 9].includes(planets.jupiter.sign) && [1, 4, 7, 10].includes(planets.jupiter.house)) {
      yogas.push({
        name: 'Hamsa Yoga (Jupiter)',
        type: 'Jupiter in Sagittarius/Pisces in Kendra',
        planets: ['jupiter'],
        strength: 'Very Strong',
        effects: 'Spirituality, wisdom, and divine grace'
      });
    }

    // Malavya Yoga: Venus in own sign in Kendra
    if (planets.venus && [2, 7].includes(planets.venus.sign) && [1, 4, 7, 10].includes(planets.venus.house)) {
      yogas.push({
        name: 'Malavya Yoga (Venus)',
        type: 'Venus in Taurus/Libra in Kendra',
        planets: ['venus'],
        strength: 'Very Strong',
        effects: 'Beauty, luxury, and artistic success'
      });
    }

    // Sasa Yoga: Saturn in own sign in Kendra
    if (planets.saturn && [10, 11].includes(planets.saturn.sign) && [1, 4, 7, 10].includes(planets.saturn.house)) {
      yogas.push({
        name: 'Sasa Yoga (Saturn)',
        type: 'Saturn in Capricorn/Aquarius in Kendra',
        planets: ['saturn'],
        strength: 'Very Strong',
        effects: 'Longevity, stability, and enduring success'
      });
    }

    return yogas;
  }

  /**
   * Analyze Neecha Bhanga Raja Yogas (Cancellation of debilitation)
   * @private
   * @param {Object} planets - Planetary positions
   * @returns {Array} Neecha Bhanga Yogas
   */
  _analyzeNeechabhangaYogas(planets) {
    const yogas = [];
    const debilitationSigns = {
      sun: 7, moon: 8, mars: 4, mercury: 12, jupiter: 10, venus: 6, saturn: 1
    };

    Object.entries(debilitationSigns).forEach(([planet, debSign]) => {
      if (planets[planet] && planets[planet].sign === debSign) {
        // Check for cancellation conditions
        let cancellation = false;
        let reason = '';

        // 1. Exalted planet in Kendra
        const exaltationSigns = { sun: 1, moon: 2, mars: 10, mercury: 6, jupiter: 4, venus: 12, saturn: 7 };
        Object.entries(exaltationSigns).forEach(([exPlanet, exSign]) => {
          if (planets[exPlanet] && [1, 4, 7, 10].includes(planets[exPlanet].house)) {
            cancellation = true;
            reason = `Exalted ${exPlanet} in Kendra`;
          }
        });

        // 2. Debilitated planet in Kendra
        if ([1, 4, 7, 10].includes(planets[planet].house)) {
          cancellation = true;
          reason = `${planet} in Kendra despite debilitation`;
        }

        // 3. Lord of sign aspecting debilitated planet
        const signLord = this._getSignLord(debSign);
        if (signLord && this._hasBeneficAspect(planets, signLord, planet)) {
          cancellation = true;
          reason = `Sign lord ${signLord} aspects ${planet}`;
        }

        if (cancellation) {
          yogas.push({
            name: 'Neecha Bhanga Raja Yoga',
            type: `Cancellation of ${planet} debilitation`,
            planets: [planet],
            strength: 'Very Strong',
            effects: `Transformation of weakness into strength: ${reason}`,
            reason
          });
        }
      }
    });

    return yogas;
  }

  /**
   * Get house lords
   * @private
   * @param {Array} houses - House numbers
   * @param {Object} planets - Planetary positions
   * @returns {Array} House lords
   */
  _getHouseLords(houses, planets) {
    const lords = [];
    houses.forEach(house => {
      const lord = this._getHouseLord(house, planets);
      if (lord) { lords.push(lord); }
    });
    return lords;
  }

  /**
   * Get lord of a house
   * @private
   * @param {number} house - House number (1-12)
   * @param {Object} planets - Planetary positions
   * @returns {string} Planet name
   */
  _getHouseLord(house, planets) {
    // Simplified house lord calculation
    const houseLords = {
      1: 'mars', 2: 'venus', 3: 'mercury', 4: 'moon', 5: 'sun',
      6: 'mercury', 7: 'venus', 8: 'mars', 9: 'sun', 10: 'saturn',
      11: 'saturn', 12: 'jupiter'
    };
    return houseLords[house];
  }

  /**
   * Get lord of a sign
   * @private
   * @param {number} sign - Sign number (1-12)
   * @returns {string} Planet name
   */
  _getSignLord(sign) {
    const signLords = {
      1: 'mars', 2: 'venus', 3: 'mercury', 4: 'moon', 5: 'sun',
      6: 'mercury', 7: 'venus', 8: 'mars', 9: 'sun', 10: 'saturn',
      11: 'saturn', 12: 'jupiter'
    };
    return signLords[sign];
  }

  /**
   * Check if planets exchange signs
   * @private
   * @param {Object} planets - Planetary positions
   * @param {string} planet1 - First planet
   * @param {string} planet2 - Second planet
   * @returns {boolean} Whether planets exchange signs
   */
  _planetsExchangeSigns(planets, planet1, planet2) {
    if (!planets[planet1] || !planets[planet2]) { return false; }

    const sign1 = planets[planet1].sign;
    const sign2 = planets[planet2].sign;

    // Check if planet1 is in planet2's sign and vice versa
    const planet1OwnSigns = this._getOwnSigns(planet1);
    const planet2OwnSigns = this._getOwnSigns(planet2);

    return planet1OwnSigns.includes(sign2) && planet2OwnSigns.includes(sign1);
  }

  /**
   * Get own signs for a planet
   * @private
   * @param {string} planet - Planet name
   * @returns {Array} Own sign numbers
   */
  _getOwnSigns(planet) {
    const ownSigns = {
      sun: [5], moon: [4], mars: [1, 8], mercury: [3, 6], jupiter: [5, 9], venus: [2, 7], saturn: [10, 11]
    };
    return ownSigns[planet] || [];
  }

  /**
   * Check if planets are conjunct
   * @private
   * @param {Object} planets - Planetary positions
   * @param {string} planet1 - First planet
   * @param {string} planet2 - Second planet
   * @returns {boolean} Whether planets are conjunct
   */
  _planetsConjunct(planets, planet1, planet2) {
    if (!planets[planet1] || !planets[planet2]) { return false; }

    const diff = Math.abs(planets[planet1].longitude - planets[planet2].longitude);
    const minDiff = Math.min(diff, 360 - diff);

    return minDiff <= 10; // Within 10 degrees
  }

  /**
   * Check if planets have mutual aspect
   * @private
   * @param {Object} planets - Planetary positions
   * @param {string} planet1 - First planet
   * @param {string} planet2 - Second planet
   * @returns {boolean} Whether planets mutually aspect
   */
  _planetsMutualAspect(planets, planet1, planet2) {
    return this._hasBeneficAspect(planets, planet1, planet2) ||
           this._hasBeneficAspect(planets, planet2, planet1);
  }

  /**
   * Check if planet has benefic aspect on another
   * @private
   * @param {Object} planets - Planetary positions
   * @param {string} aspecting - Aspecting planet
   * @param {string} aspected - Aspected planet
   * @returns {boolean} Whether aspect exists
   */
  _hasBeneficAspect(planets, aspecting, aspected) {
    if (!planets[aspecting] || !planets[aspected]) { return false; }

    const diff = Math.abs(planets[aspecting].longitude - planets[aspected].longitude);
    const minDiff = Math.min(diff, 360 - diff);

    // Check for trine (120°) or sextile (60°)
    return Math.abs(minDiff - 120) <= 8 || Math.abs(minDiff - 60) <= 6;
  }

  /**
   * Check if planets are in mutual Kendra
   * @private
   * @param {Object} planets - Planetary positions
   * @param {string} planet1 - First planet
   * @param {string} planet2 - Second planet
   * @returns {boolean} Whether in mutual Kendra
   */
  _arePlanetsInMutualKendra(planets, planet1, planet2) {
    if (!planets[planet1] || !planets[planet2]) { return false; }

    const house1 = planets[planet1].house;
    const house2 = planets[planet2].house;
    const kendraHouses = [1, 4, 7, 10];

    return kendraHouses.includes(house1) && kendraHouses.includes(house2);
  }

  /**
   * Assess overall yoga strength
   * @private
   * @param {Array} yogas - All yogas found
   * @returns {Object} Assessment
   */
  _assessYogaStrength(yogas) {
    const strongYogas = yogas.filter(yoga => yoga.strength === 'Very Strong').length;
    const mediumYogas = yogas.filter(yoga => yoga.strength === 'Strong').length;

    let overallStrength = 'Weak';
    let description = 'Limited special combinations present';

    if (strongYogas >= 2) {
      overallStrength = 'Very Strong';
      description = 'Exceptional planetary combinations indicate great success and fulfillment';
    } else if (strongYogas >= 1 || mediumYogas >= 3) {
      overallStrength = 'Strong';
      description = 'Favorable planetary combinations support success in key life areas';
    } else if (mediumYogas >= 1) {
      overallStrength = 'Moderate';
      description = 'Some beneficial combinations present with room for growth';
    }

    return {
      overallStrength,
      strongYogasCount: strongYogas,
      mediumYogasCount: mediumYogas,
      totalYogas: yogas.length,
      description
    };
  }

  /**
   * Generate yoga summary
   * @private
   * @param {Array} yogas - All yogas
   * @param {Object} assessment - Assessment
   * @returns {string} Summary text
   */
  _generateYogaSummary(yogas, assessment) {
    let summary = '🕉️ *Vedic Yogas Analysis*\n\n';

    summary += `*Overall Strength:* ${assessment.overallStrength}\n`;
    summary += `*Total Yogas:* ${assessment.totalYogas}\n\n`;

    summary += `*${assessment.description}*\n\n`;

    if (yogas.length > 0) {
      // Group yogas by type
      const rajaYogas = yogas.filter(y => y.name.includes('Raja'));
      const dhanaYogas = yogas.filter(y => y.name.includes('Dhana'));
      const otherYogas = yogas.filter(y => !y.name.includes('Raja') && !y.name.includes('Dhana'));

      if (rajaYogas.length > 0) {
        summary += '*Raja Yogas (Power & Authority):*\n';
        rajaYogas.forEach(yoga => {
          summary += `• ${yoga.type} - ${yoga.effects}\n`;
        });
        summary += '\n';
      }

      if (dhanaYogas.length > 0) {
        summary += '*Dhana Yogas (Wealth & Prosperity):*\n';
        dhanaYogas.forEach(yoga => {
          summary += `• ${yoga.type} - ${yoga.effects}\n`;
        });
        summary += '\n';
      }

      if (otherYogas.length > 0) {
        summary += '*Other Significant Yogas:*\n';
        otherYogas.slice(0, 5).forEach(yoga => {
          summary += `• ${yoga.name}: ${yoga.effects}\n`;
        });
      }
    }

    return summary;
  }


  /**
   * Calculate Vimshottari Dasha periods (Mahadasha and Antardasha)
   * @param {Object} birthData - Birth data object
   * @returns {Object} Dasha calculations
   */
  async calculateVimshottariDasha(birthData) {
    try {
      const { birthDate, birthTime, birthPlace = 'Delhi, India' } = birthData;
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Calculate moon sign for dasha start
      const moonLongitude = await this.calculateMoonLongitude(
        year,
        month,
        day,
        hour,
        minute,
        latitude,
        longitude,
        timezone
      );

      // Vimshottari Dasha periods (years)
      const dashaPeriods = {
        sun: 6,
        moon: 10,
        mars: 7,
        rahu: 18,
        jupiter: 16,
        saturn: 19,
        mercury: 17,
        ketu: 7,
        venus: 20
      };

      // Calculate starting dasha based on moon's position
      const startingDasha = this.getStartingDasha(moonLongitude);
      const currentDate = new Date();
      const birthDateObj = new Date(year, month - 1, day, hour, minute);

      // Calculate current dasha
      const currentDasha = this.calculateCurrentDasha(
        birthDateObj,
        currentDate,
        startingDasha,
        dashaPeriods
      );

      // Calculate upcoming dashas
      const upcomingDashas = this.calculateUpcomingDashas(
        currentDasha,
        dashaPeriods
      );

      return {
        system: 'Vimshottari',
        startingDasha,
        currentDasha,
        upcomingDashas,
        antardasha: this.calculateAntardasha(
          currentDasha.dasha,
          birthDateObj,
          currentDate
        )
      };
    } catch (error) {
      logger.error('Error calculating Vimshottari Dasha:', error);
      return {
        system: 'Vimshottari',
        error: 'Unable to calculate dasha periods at this time'
      };
    }
  }

  /**
   * Calculate Secondary Progressions analysis
   * @param {Object} birthData - Birth data object with birthDate, birthTime, birthPlace
   * @returns {Object} Secondary progressions analysis
   */
  async calculateSecondaryProgressions(birthData) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      // Parse birth date
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);

      // Calculate current age in days (1 day = 1 year of life)
      const currentDate = new Date();
      const ageInDays = Math.floor((currentDate - birthDateTime) / (1000 * 60 * 60 * 24));
      const ageInYears = Math.floor(ageInDays / 365.25);

      // Calculate progressed date (birth date + age in days)
      const progressedDate = new Date(birthDateTime.getTime() + ageInDays * 24 * 60 * 60 * 1000);

      // Generate progressed chart
      const progressedChart = await this._generateProgressedChart(birthData, progressedDate);

      // Analyze the progressed chart
      const analysis = this._analyzeProgressedChart(progressedChart, birthData, ageInYears);

      return {
        ageInYears,
        ageInDays,
        progressedDate: progressedDate.toISOString(),
        formattedProgressedDate: progressedDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        progressedChart,
        analysis,
        keyProgressions: this._extractKeyProgressions(analysis),
        majorThemes: this._extractProgressionThemes(analysis),
        lifeChanges: this._predictLifeChanges(analysis, ageInYears)
      };
    } catch (error) {
      logger.error('Error calculating secondary progressions:', error);
      return { error: 'Unable to calculate secondary progressions' };
    }
  }

  /**
   * Generate progressed chart for secondary progressions
   * @private
   * @param {Object} birthData - Birth data
   * @param {Date} progressedDate - Progressed date
   * @returns {Object} Progressed chart data
   */
  async _generateProgressedChart(birthData, progressedDate) {
    try {
      const { birthPlace } = birthData;

      // Get coordinates
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const timestamp = progressedDate.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Calculate progressed planetary positions using Swiss Ephemeris
      const progressedJD = this._dateToJulianDay(
        progressedDate.getFullYear(),
        progressedDate.getMonth() + 1,
        progressedDate.getDate(),
        progressedDate.getHours() + progressedDate.getMinutes() / 60
      );

      const planets = {};
      const planetIds = {
        sun: 0,
        moon: 1,
        mars: 4,
        mercury: 2,
        jupiter: 5,
        venus: 3,
        saturn: 6
      };

      // Calculate positions for major planets
      for (const [planetName, planetId] of Object.entries(planetIds)) {
        try {
          const position = sweph.calc(progressedJD, planetId, 2 | 256);
          if (position && position.longitude) {
            const longitude = position.longitude[0];
            const speed = position.longitude[1]; // Daily speed in degrees
            const signIndex = Math.floor(longitude / 30);
            const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

            planets[planetName] = {
              name: planetName.charAt(0).toUpperCase() + planetName.slice(1),
              longitude,
              speed,
              retrograde: speed < 0,
              signName: signs[signIndex],
              position: {
                degrees: Math.floor(longitude % 30),
                minutes: Math.floor((longitude % 1) * 60),
                seconds: Math.floor(((longitude % 1) * 60 % 1) * 60)
              }
            };
          }
        } catch (planetError) {
          logger.warn(`Error calculating progressed ${planetName} position:`, planetError.message);
        }
      }

      // Calculate houses (simplified - using equal house system)
      const houses = {};
      const ascendant = this._calculateAscendant(progressedJD, latitude, longitude);
      for (let i = 1; i <= 12; i++) {
        houses[i] = (ascendant + (i - 1) * 30) % 360;
      }

      return {
        planets,
        houses,
        aspects: [], // Could be calculated if needed
        interpretations: {
          sunSign: planets.sun ? planets.sun.signName : 'Unknown',
          moonSign: planets.moon ? planets.moon.signName : 'Unknown',
          risingSign: this._getSignFromLongitude(ascendant)
        }
      };
    } catch (error) {
      logger.error('Error generating progressed chart:', error);
      throw error; // Re-throw to maintain precision requirement
    }
  }

  /**
   * Analyze progressed chart
   * @private
   * @param {Object} progressedChart - Progressed chart data
   * @param {Object} birthData - Birth data
   * @param {number} ageInYears - Current age in years
   * @returns {Object} Analysis of progressed chart
   */
  _analyzeProgressedChart(progressedChart, birthData, ageInYears) {
    const analysis = {
      progressedSunSign: progressedChart.interpretations?.sunSign || 'Unknown',
      progressedMoonSign: progressedChart.interpretations?.moonSign || 'Unknown',
      progressedRisingSign: progressedChart.interpretations?.risingSign || 'Unknown',
      ageDescription: this._getAgeDescription(ageInYears),
      planetaryPositions: {},
      aspects: []
    };

    // Extract progressed planetary positions
    if (progressedChart.planets) {
      Object.entries(progressedChart.planets).forEach(([planet, data]) => {
        if (data.position) {
          analysis.planetaryPositions[planet] = {
            sign: data.signName,
            longitude: data.position.longitude,
            house: data.house || 'Unknown'
          };
        }
      });
    }

    // Calculate aspects in progressed chart
    analysis.aspects = this._calculateProgressedAspects(progressedChart.planets || {});

    return analysis;
  }

  /**
   * Calculate aspects in progressed chart
   * @private
   * @param {Object} planets - Progressed planets
   * @returns {Array} Aspects
   */
  _calculateProgressedAspects(planets) {
    const aspects = [];
    const planetKeys = Object.keys(planets);

    // Define aspect angles
    const aspects_def = {
      conjunction: 0,
      sextile: 60,
      square: 90,
      trine: 120,
      opposition: 180
    };

    // Check for major aspects
    for (let i = 0; i < planetKeys.length; i++) {
      for (let j = i + 1; j < planetKeys.length; j++) {
        const planet1 = planets[planetKeys[i]];
        const planet2 = planets[planetKeys[j]];

        if (planet1.position?.longitude && planet2.position?.longitude) {
          const angle = Math.abs(planet1.position.longitude - planet2.position.longitude) % 360;
          const minAngle = Math.min(angle, 360 - angle);

          // Check for major aspects (within 5 degrees orb)
          Object.entries(aspects_def).forEach(([aspectName, aspectAngle]) => {
            if (Math.abs(minAngle - aspectAngle) <= 5) {
              aspects.push({
                planets: `${planet1.name}-${planet2.name}`,
                aspect: aspectName,
                angle: Math.round(minAngle * 10) / 10
              });
            }
          });
        }
      }
    }

    return aspects.slice(0, 5); // Return top 5 aspects
  }

  /**
   * Get age description for life stage
   * @private
   * @param {number} age - Age in years
   * @returns {string} Age description
   */
  _getAgeDescription(age) {
    if (age < 12) { return 'Childhood and early learning'; }
    if (age < 19) { return 'Adolescence and self-discovery'; }
    if (age < 30) { return 'Young adulthood and career building'; }
    if (age < 40) { return 'Mid-life transitions and stability'; }
    if (age < 50) { return 'Mid-life reflection and change'; }
    if (age < 65) { return 'Later adulthood and wisdom'; }
    return 'Elder years and life review';
  }

  /**
   * Extract key progressions from analysis
   * @private
   * @param {Object} analysis - Progressed chart analysis
   * @returns {Array} Key progressions
   */
  _extractKeyProgressions(analysis) {
    const progressions = [];

    // Sun progression
    if (analysis.progressedSunSign) {
      progressions.push({
        planet: 'Sun',
        position: analysis.progressedSunSign,
        significance: `Identity and life direction in ${analysis.progressedSunSign}`
      });
    }

    // Moon progression
    if (analysis.progressedMoonSign) {
      progressions.push({
        planet: 'Moon',
        position: analysis.progressedMoonSign,
        significance: `Emotional nature and inner life in ${analysis.progressedMoonSign}`
      });
    }

    // Key aspects
    analysis.aspects.slice(0, 3).forEach(aspect => {
      progressions.push({
        planet: aspect.planets,
        position: `${aspect.aspect} aspect`,
        significance: `${aspect.aspect} brings ${this._getAspectSignificance(aspect.aspect)}`
      });
    });

    return progressions;
  }

  /**
   * Get aspect significance
   * @private
   * @param {string} aspect - Aspect type
   * @returns {string} Significance description
   */
  _getAspectSignificance(aspect) {
    const significances = {
      conjunction: 'intense focus and new beginnings',
      sextile: 'opportunities and harmonious growth',
      square: 'challenges and necessary changes',
      trine: 'natural talents and ease',
      opposition: 'balance and integration of opposites'
    };
    return significances[aspect] || 'important developments';
  }

  /**
   * Extract progression themes
   * @private
   * @param {Object} analysis - Analysis data
   * @returns {Array} Major themes
   */
  _extractProgressionThemes(analysis) {
    const themes = [];

    // Age-based themes
    themes.push(`Focus on ${analysis.ageDescription.toLowerCase()}`);

    // Sun sign themes
    if (analysis.progressedSunSign) {
      const sunThemes = {
        Aries: 'Self-discovery and new beginnings',
        Taurus: 'Building stability and security',
        Gemini: 'Learning and communication',
        Cancer: 'Family and emotional foundations',
        Leo: 'Creativity and self-expression',
        Virgo: 'Service and practical matters',
        Libra: 'Relationships and harmony',
        Scorpio: 'Transformation and depth',
        Sagittarius: 'Exploration and philosophy',
        Capricorn: 'Achievement and responsibility',
        Aquarius: 'Innovation and community',
        Pisces: 'Spirituality and imagination'
      };
      if (sunThemes[analysis.progressedSunSign]) {
        themes.push(sunThemes[analysis.progressedSunSign]);
      }
    }

    // Moon sign emotional themes
    if (analysis.progressedMoonSign) {
      themes.push(`Emotional focus in ${analysis.progressedMoonSign} themes`);
    }

    return themes;
  }

  /**
   * Predict life changes based on progressions
   * @private
   * @param {Object} analysis - Analysis data
   * @param {number} age - Current age
   * @returns {Array} Predicted life changes
   */
  _predictLifeChanges(analysis, age) {
    const changes = [];

    // Age-based life changes
    if (age >= 28 && age <= 32) {
      changes.push('Saturn Return: Major life restructuring and responsibility');
    }
    if (age >= 56 && age <= 60) {
      changes.push('Second Saturn Return: Life review and wisdom');
    }

    // Sun sign changes
    if (analysis.progressedSunSign) {
      const sunChanges = {
        Aries: 'New initiatives and self-discovery',
        Taurus: 'Focus on stability and material security',
        Gemini: 'Learning new skills and communication',
        Cancer: 'Building emotional foundations',
        Leo: 'Creative self-expression',
        Virgo: 'Practical service and health focus',
        Libra: 'Relationship developments',
        Scorpio: 'Deep transformation',
        Sagittarius: 'Expansion and exploration',
        Capricorn: 'Career advancement',
        Aquarius: 'Innovation and community involvement',
        Pisces: 'Spiritual growth'
      };
      if (sunChanges[analysis.progressedSunSign]) {
        changes.push(`Sun progression: ${sunChanges[analysis.progressedSunSign]}`);
      }
    }

    return changes;
  }

  /**
   * Calculate Solar Arc Directions analysis
   * @param {Object} birthData - Birth data object with birthDate, birthTime, birthPlace
   * @returns {Object} Solar arc directions analysis
   */
  async calculateSolarArcDirections(birthData) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      // Parse birth date
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);

      // Calculate current age in days (1 day = 1 degree of arc movement)
      const currentDate = new Date();
      const ageInDays = Math.floor((currentDate - birthDateTime) / (1000 * 60 * 60 * 24));
      const ageInYears = Math.floor(ageInDays / 365.25);

      // Solar arc movement: all planets move the same distance as the Sun
      const solarArcDegrees = ageInDays; // Each day = 1 degree

      // Generate directed chart (natal chart + solar arc movement)
      const directedChart = await this._generateDirectedChart(birthData, solarArcDegrees);

      // Analyze the directed chart
      const analysis = this._analyzeDirectedChart(directedChart, birthData, ageInYears, solarArcDegrees);

      return {
        ageInYears,
        ageInDays,
        solarArcDegrees,
        directedChart,
        analysis,
        keyDirections: this._extractKeyDirections(analysis),
        lifeChanges: this._predictDirectedLifeChanges(analysis, ageInYears)
      };
    } catch (error) {
      logger.error('Error calculating solar arc directions:', error);
      return { error: 'Unable to calculate solar arc directions' };
    }
  }

  /**
   * Generate directed chart for solar arc directions
   * @private
   * @param {Object} birthData - Birth data
   * @param {number} solarArcDegrees - Degrees to move all planets
   * @returns {Object} Directed chart data
   */
  async _generateDirectedChart(birthData, solarArcDegrees) {
    try {
      const { birthPlace } = birthData;

      // Get coordinates
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const timestamp = Date.now();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // For solar arc, we advance the birth time by the arc degrees
      // Each degree = 1 day, so solarArcDegrees days from birth
      const birthDateTime = new Date(
        `${birthData.birthDate.split('/').reverse().join('-')}T${
          birthData.birthTime}:00`
      );
      const directedDateTime = new Date(birthDateTime.getTime() + solarArcDegrees * 24 * 60 * 60 * 1000);

      // Prepare data for astrologer library
      const astroData = {
        year: directedDateTime.getFullYear(),
        month: directedDateTime.getMonth() + 1,
        date: directedDateTime.getDate(),
        hours: directedDateTime.getHours(),
        minutes: directedDateTime.getMinutes(),
        seconds: 0,
        latitude,
        longitude,
        timezone,
        chartType: 'sidereal'
      };

      // Generate directed chart
      const chart = this.astrologer.generateNatalChartData(astroData);

      return chart;
    } catch (error) {
      logger.error('Error generating directed chart:', error);
      // Return basic chart structure
      return {
        planets: {},
        houses: {},
        aspects: [],
        interpretations: {
          sunSign: 'Unknown',
          moonSign: 'Unknown',
          risingSign: 'Unknown'
        }
      };
    }
  }

  /**
   * Analyze directed chart
   * @private
   * @param {Object} directedChart - Directed chart data
   * @param {Object} birthData - Birth data
   * @param {number} ageInYears - Current age in years
   * @param {number} solarArcDegrees - Solar arc degrees
   * @returns {Object} Analysis of directed chart
   */
  _analyzeDirectedChart(directedChart, birthData, ageInYears, solarArcDegrees) {
    const analysis = {
      directedSunSign: directedChart.interpretations?.sunSign || 'Unknown',
      directedMoonSign: directedChart.interpretations?.moonSign || 'Unknown',
      directedRisingSign: directedChart.interpretations?.risingSign || 'Unknown',
      ageDescription: this._getAgeDescription(ageInYears),
      planetaryPositions: {},
      aspects: []
    };

    // Extract directed planetary positions
    if (directedChart.planets) {
      Object.entries(directedChart.planets).forEach(([planet, data]) => {
        if (data.position) {
          analysis.planetaryPositions[planet] = {
            sign: data.signName,
            longitude: data.position.longitude,
            house: data.house || 'Unknown'
          };
        }
      });
    }

    // Calculate aspects in directed chart
    analysis.aspects = this._calculateProgressedAspects(directedChart.planets || {});

    return analysis;
  }

  /**
   * Extract key directions from analysis
   * @private
   * @param {Object} analysis - Directed chart analysis
   * @returns {Array} Key directions
   */
  _extractKeyDirections(analysis) {
    const directions = [];

    // Sun direction (most important)
    if (analysis.directedSunSign) {
      directions.push({
        planet: 'Sun',
        from: 'Natal position',
        to: analysis.directedSunSign,
        significance: `Identity and life direction directed to ${analysis.directedSunSign} themes`
      });
    }

    // Moon direction (emotional life)
    if (analysis.directedMoonSign) {
      directions.push({
        planet: 'Moon',
        from: 'Natal position',
        to: analysis.directedMoonSign,
        significance: `Emotional nature and inner life directed to ${analysis.directedMoonSign} themes`
      });
    }

    // Key aspects
    analysis.aspects.slice(0, 3).forEach(aspect => {
      directions.push({
        planet: aspect.planets,
        from: 'Natal aspect',
        to: `${aspect.aspect} aspect`,
        significance: `Directed ${aspect.aspect} brings ${this._getAspectSignificance(aspect.aspect)}`
      });
    });

    return directions;
  }

  /**
   * Predict life changes based on directed chart
   * @private
   * @param {Object} analysis - Analysis data
   * @param {number} age - Current age
   * @returns {Array} Predicted life changes
   */
  _predictDirectedLifeChanges(analysis, age) {
    const changes = [];

    // Age-based life changes
    if (age >= 28 && age <= 32) {
      changes.push('Saturn Return: Major life restructuring and responsibility');
    }
    if (age >= 56 && age <= 60) {
      changes.push('Second Saturn Return: Life review and wisdom');
    }

    // Sun sign directed changes
    if (analysis.directedSunSign) {
      const sunChanges = {
        Aries: 'Directed toward new initiatives and self-discovery',
        Taurus: 'Directed toward building stability and material security',
        Gemini: 'Directed toward learning new skills and communication',
        Cancer: 'Directed toward building emotional foundations',
        Leo: 'Directed toward creative self-expression',
        Virgo: 'Directed toward practical service and health focus',
        Libra: 'Directed toward relationship developments',
        Scorpio: 'Directed toward deep transformation',
        Sagittarius: 'Directed toward expansion and exploration',
        Capricorn: 'Directed toward career advancement',
        Aquarius: 'Directed toward innovation and community involvement',
        Pisces: 'Directed toward spiritual growth'
      };
      if (sunChanges[analysis.directedSunSign]) {
        changes.push(`Solar Arc Sun: ${sunChanges[analysis.directedSunSign]}`);
      }
    }

    return changes;
  }

  /**
   * Calculate moon longitude for dasha calculations
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {number} hour - Hour
   * @param {number} minute - Minute
   * @returns {number} Moon longitude in degrees
   */
  async calculateMoonLongitude(year, month, day, hour, minute, latitude, longitude, timezone) {
    try {
      // Use astrologer library for precise calculation
      if (this.astrologer) {
        const astroData = {
          year,
          month,
          date: day,
          hours: hour,
          minutes: minute,
          seconds: 0,
          latitude,
          longitude,
          timezone,
          chartType: 'sidereal'
        };

        const chart = this.astrologer.generateNatalChartData(astroData);
        return chart.planets.moon.longitude || 0;
      }

      // Fallback calculation
      const daysSinceEpoch = Math.floor(
        new Date(year, month - 1, day).getTime() / (1000 * 60 * 60 * 24)
      );
      return (daysSinceEpoch * 13.176396) % 360; // Moon moves ~13.18 degrees per day
    } catch (error) {
      logger.error('Error calculating moon longitude:', error);
      return 0;
    }
  }

  /**
   * Get starting dasha based on moon's position
   * @param {number} moonLongitude - Moon longitude
   * @returns {string} Starting dasha planet
   */
  getStartingDasha(moonLongitude) {
    // Vimshottari dasha starts from the planet ruling the nakshatra where moon is placed
    const nakshatraSize = 360 / 27; // 27 nakshatras
    const nakshatraNumber = Math.floor(moonLongitude / nakshatraSize);

    // Nakshatra lords in order
    const nakshatraLords = [
      'ketu',
      'venus',
      'sun',
      'moon',
      'mars',
      'rahu',
      'jupiter',
      'saturn',
      'mercury',
      'ketu',
      'venus',
      'sun',
      'moon',
      'mars',
      'rahu',
      'jupiter',
      'saturn',
      'mercury',
      'ketu',
      'venus',
      'sun',
      'moon',
      'mars',
      'rahu',
      'jupiter',
      'saturn',
      'mercury'
    ];

    return nakshatraLords[nakshatraNumber];
  }

  /**
   * Calculate current dasha period
   * @param {Date} birthDate - Birth date
   * @param {Date} currentDate - Current date
   * @param {string} startingDasha - Starting dasha
   * @param {Object} dashaPeriods - Dasha periods
   * @returns {Object} Current dasha information
   */
  calculateCurrentDasha(birthDate, currentDate, startingDasha, dashaPeriods) {
    const ageInYears =
      (currentDate - birthDate) / (1000 * 60 * 60 * 24 * 365.25);

    // Dasha order
    const dashaOrder = [
      'sun',
      'moon',
      'mars',
      'rahu',
      'jupiter',
      'saturn',
      'mercury',
      'ketu',
      'venus'
    ];
    const startIndex = dashaOrder.indexOf(startingDasha);

    let totalYears = 0;
    let currentDashaIndex = startIndex;
    let yearsIntoCurrentDasha = 0;

    // Find which dasha period we're currently in
    for (let i = 0; i < dashaOrder.length; i++) {
      const dashaPlanet = dashaOrder[(startIndex + i) % dashaOrder.length];
      const dashaLength = dashaPeriods[dashaPlanet];

      if (totalYears + dashaLength > ageInYears) {
        currentDashaIndex = (startIndex + i) % dashaOrder.length;
        yearsIntoCurrentDasha = ageInYears - totalYears;
        break;
      }

      totalYears += dashaLength;
    }

    const currentDasha = dashaOrder[currentDashaIndex];
    const remainingYears = dashaPeriods[currentDasha] - yearsIntoCurrentDasha;

    return {
      dasha: currentDasha,
      startYear: Math.max(0, ageInYears - yearsIntoCurrentDasha),
      remainingYears: Math.round(remainingYears * 10) / 10,
      endDate: new Date(
        currentDate.getTime() + remainingYears * 365.25 * 24 * 60 * 60 * 1000
      ),
      influence: this.getDashaInfluence(currentDasha)
    };
  }

  /**
   * Calculate upcoming dashas
   * @param {Object} currentDasha - Current dasha info
   * @param {Object} dashaPeriods - Dasha periods
   * @returns {Array} Upcoming dashas
   */
  calculateUpcomingDashas(currentDasha, dashaPeriods) {
    const dashaOrder = [
      'sun',
      'moon',
      'mars',
      'rahu',
      'jupiter',
      'saturn',
      'mercury',
      'ketu',
      'venus'
    ];
    const currentIndex = dashaOrder.indexOf(currentDasha.dasha);

    const upcoming = [];
    for (let i = 1; i <= 3; i++) {
      const nextIndex = (currentIndex + i) % dashaOrder.length;
      const nextDasha = dashaOrder[nextIndex];

      upcoming.push({
        dasha: nextDasha,
        years: dashaPeriods[nextDasha],
        influence: this.getDashaInfluence(nextDasha)
      });
    }

    return upcoming;
  }

  /**
   * Calculate Antardasha (sub-periods)
   * @param {string} mahadasha - Current Mahadasha
   * @param {Date} birthDate - Birth date
   * @param {Date} currentDate - Current date
   * @returns {Object} Antardasha information
   */
  calculateAntardasha(mahadasha, birthDate, currentDate) {
    const antardashaOrder = [
      'sun',
      'moon',
      'mars',
      'rahu',
      'jupiter',
      'saturn',
      'mercury',
      'ketu',
      'venus'
    ];
    const mahadashaPeriods = {
      sun: 6,
      moon: 10,
      mars: 7,
      rahu: 18,
      jupiter: 16,
      saturn: 19,
      mercury: 17,
      ketu: 7,
      venus: 20
    };

    const mahadashaLength = mahadashaPeriods[mahadasha];
    const antardashaLength = mahadashaLength / 9; // Each antardasha is 1/9 of mahadasha

    // Find current antardasha
    const ageInYears =
      (currentDate - birthDate) / (1000 * 60 * 60 * 24 * 365.25);
    const yearsIntoMahadasha = ageInYears % mahadashaLength;
    const antardashaIndex = Math.floor(yearsIntoMahadasha / antardashaLength);

    const currentAntardasha = antardashaOrder[antardashaIndex];
    const yearsIntoAntardasha = yearsIntoMahadasha % antardashaLength;
    const remainingInAntardasha = antardashaLength - yearsIntoAntardasha;

    return {
      current: {
        planet: currentAntardasha,
        remainingYears: Math.round(remainingInAntardasha * 10) / 10,
        influence: this.getDashaInfluence(currentAntardasha)
      },
      upcoming: antardashaOrder
        .slice(antardashaIndex + 1, antardashaIndex + 4)
        .map(planet => ({
          planet,
          years: antardashaLength,
          influence: this.getDashaInfluence(planet)
        }))
    };
  }

  /**
   * Get dasha influence description
   * @param {string} planet - Planet name
   * @returns {string} Influence description
   */
  getDashaInfluence(planet) {
    const influences = {
      sun: 'Leadership, authority, father, government, vitality, confidence',
      moon: 'Emotions, mother, home, intuition, fluctuations, nurturing',
      mars: 'Action, courage, siblings, conflicts, energy, independence',
      mercury: 'Communication, intellect, education, business, adaptability',
      jupiter:
        'Wisdom, expansion, spirituality, prosperity, teaching, optimism',
      venus: 'Love, beauty, arts, relationships, harmony, material comforts',
      saturn:
        'Discipline, responsibility, career, limitations, wisdom, patience',
      rahu: 'Ambition, foreign lands, unconventional paths, materialism, innovation',
      ketu: 'Spirituality, detachment, past life karma, mysticism, liberation'
    };

    return influences[planet] || 'General planetary influence';
  }

  /**
   * Calculate advanced transits
   * @param {Object} natalChart - Natal chart data
   * @param {Date} currentDate - Current date
   * @returns {Object} Transit analysis
   */
  async _calculateAdvancedTransits(natalChart, currentDate = new Date()) {
    try {
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();
      const currentHour = currentDate.getHours();
      const currentMinute = currentDate.getMinutes();

      // Convert current date to Julian Day
      const currentJD = sweph.julday(
        currentYear,
        currentMonth,
        currentDay,
        currentHour + currentMinute / 60,
        1
      );

      const currentPositions = {};
      const planets = [
        'sun',
        'moon',
        'mercury',
        'venus',
        'mars',
        'jupiter',
        'saturn'
      ];

      for (const planet of planets) {
        const natalPlanet = natalChart.planets[planet];
        if (natalPlanet) {
          const natalLongitude = natalPlanet.longitude;

          // Calculate transit position using Swiss Ephemeris
          const transitPositionData = sweph.calc(currentJD, sweph[`SE_${planet.toUpperCase()}`], 2);
          const transitLongitude = transitPositionData.longitude[0];

          currentPositions[planet] = {
            longitude: transitLongitude,
            aspect: this.calculateTransitAspect(natalLongitude, transitLongitude),
            influence: this.getTransitInfluence(planet, natalLongitude, transitLongitude)
          };
        }
      }

      // Identify major transits
      const majorTransits = this.identifyMajorTransits(
        natalChart,
        currentPositions
      );

      return {
        currentDate: `${currentDay}/${currentMonth}/${currentYear}`,
        planetaryPositions: currentPositions,
        majorTransits,
        nextSignificantTransits: await this.calculateNextSignificantTransits(
          natalChart,
          currentDate
        )
      };
    } catch (error) {
      logger.error('Error calculating advanced transits:', error);
      return {
        error: 'Unable to calculate transits at this time',
        currentDate: new Date().toLocaleDateString()
      };
    }
  }

  /**
   * Calculate transit aspect
   * @param {number} natalPosition - Natal planet position
   * @param {number} transitPosition - Transit planet position
   * @returns {string} Aspect type
   */
  calculateTransitAspect(natalPosition, transitPosition) {
    const angle = Math.abs(natalPosition - transitPosition) % 360;
    const minAngle = Math.min(angle, 360 - angle);

    if (minAngle <= 5) {
      return 'conjunction';
    }
    if (Math.abs(minAngle - 60) <= 5) {
      return 'sextile';
    }
    if (Math.abs(minAngle - 90) <= 5) {
      return 'square';
    }
    if (Math.abs(minAngle - 120) <= 5) {
      return 'trine';
    }
    if (Math.abs(minAngle - 180) <= 5) {
      return 'opposition';
    }

    return 'no major aspect';
  }

  /**
   * Get transit influence description
   * @param {string} planet - Planet name
   * @param {number} natalPos - Natal position
   * @param {number} transitPos - Transit position
   * @returns {string} Influence description
   */
  getTransitInfluence(planet, natalPos, transitPos) {
    const aspect = this.calculateTransitAspect(natalPos, transitPos);

    const influences = {
      sun: {
        conjunction: 'Identity and self-expression activated',
        sextile: 'Opportunities for leadership and confidence',
        square: 'Challenges to ego and self-expression',
        trine: 'Harmony in personal power and vitality',
        opposition: 'Public recognition and relationship dynamics'
      },
      moon: {
        conjunction: 'Emotional sensitivity heightened',
        sextile: 'Emotional opportunities and intuition',
        square: 'Emotional challenges and mood fluctuations',
        trine: 'Emotional harmony and nurturing',
        opposition: 'Public emotional life and relationships'
      },
      mars: {
        conjunction: 'Energy and action strongly activated',
        sextile: 'Opportunities for action and courage',
        square: 'Conflicts and aggressive challenges',
        trine: 'Harmonious energy and successful action',
        opposition: 'Public action and competitive dynamics'
      },
      jupiter: {
        conjunction: 'Expansion and growth opportunities',
        sextile: 'Lucky opportunities and optimism',
        square: 'Excess and over-expansion challenges',
        trine: 'Natural abundance and wisdom',
        opposition: 'Public success and philosophical influence'
      },
      saturn: {
        conjunction: 'Responsibilities and limitations emphasized',
        sextile: 'Career opportunities and discipline',
        square: 'Restrictions and karmic lessons',
        trine: 'Achievement through patience and structure',
        opposition: 'Public responsibility and authority'
      },
      venus: {
        conjunction: 'Love and beauty themes prominent',
        sextile: 'Harmonious relationships and creativity',
        square: 'Relationship challenges and values conflicts',
        trine: 'Love, beauty, and artistic success',
        opposition: 'Public relationships and social charm'
      },
      mercury: {
        conjunction: 'Communication and mental activity increased',
        sextile: 'Learning opportunities and clear thinking',
        square: 'Communication challenges and mental stress',
        trine: 'Mental harmony and successful communication',
        opposition: 'Public speaking and social communication'
      }
    };

    return influences[planet]?.[aspect] || `${planet} transit influence`;
  }

  /**
   * Identify major transits
   * @param {Object} natalChart - Natal chart
   * @param {Object} currentPositions - Current transit positions
   * @returns {Array} Major transits
   */
  identifyMajorTransits(natalChart, currentPositions) {
    const majorTransits = [];

    Object.entries(currentPositions).forEach(([planet, position]) => {
      if (
        ['conjunction', 'square', 'trine', 'opposition'].includes(
          position.aspect
        )
      ) {
        majorTransits.push({
          planet,
          aspect: position.aspect,
          influence: position.influence,
          intensity: this.getAspectIntensity(position.aspect)
        });
      }
    });

    return majorTransits.slice(0, 5); // Return top 5 major transits
  }

  /**
   * Get aspect intensity
   * @param {string} aspect - Aspect type
   * @returns {string} Intensity level
   */
  getAspectIntensity(aspect) {
    const intensities = {
      conjunction: 'High',
      opposition: 'High',
      square: 'Medium-High',
      trine: 'Medium',
      sextile: 'Low-Medium'
    };

    return intensities[aspect] || 'Neutral';
  }

  /**
   * Calculate next significant transits
   * @param {Object} natalChart - Natal chart
   * @param {Date} currentDate - Current date
   * @returns {Array} Next significant transits
   */
  async calculateNextSignificantTransits(natalChart, currentDate) {
    const nextTransits = [];
    const planets = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

    for (const planet of planets) {
      const natalPlanet = natalChart.planets[planet];
      const natalPos = natalPlanet ?
        natalPlanet.longitude :
        null;

      if (natalPos) {
        // Convert current date to Julian Day
        const currentJD = sweph.julday(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          currentDate.getDate(),
          currentDate.getHours() + currentDate.getMinutes() / 60,
          1
        );

        // Find next conjunction (simplified for now, full implementation would involve iteration)
        // This is a placeholder for more advanced sweph functions to find exact aspect times
        const nextConjunctionDate = new Date(currentDate);
        nextConjunctionDate.setFullYear(currentDate.getFullYear() + 1); // Estimate next year

        nextTransits.push({
          planet,
          nextConjunction: nextConjunctionDate.toLocaleDateString(),
          significance: this._getTransitSignificance(planet)
        });
      }
    }

    return nextTransits.slice(0, 3);
  }

  /**
   * Get transit significance
   * @param {string} planet - Planet name
   * @returns {string} Significance description
   */
  _getTransitSignificance(planet) {
    const significances = {
      jupiter: 'Expansion, growth, and new opportunities',
      saturn: 'Responsibilities, career changes, and life lessons',
      uranus: 'Sudden changes, innovation, and freedom',
      neptune: 'Spirituality, dreams, and dissolution of boundaries',
      pluto: 'Transformation, power, and rebirth'
    };

    return significances[planet] || 'Significant planetary influence';
  }

  /**
    * Calculate Gochar (Vedic Transits) - Current planetary influences
    * @param {Object} birthData - Birth data object
    * @param {Date} currentDate - Date for transit calculation (defaults to now)
    * @returns {Object} Gochar analysis with transit influences
    */
  async calculateGochar(birthData, currentDate = new Date()) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return { error: 'Complete birth details required for Gochar analysis' };
      }

      // Parse birth date and time
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Calculate Julian Day for current date
      const currentJD = this._dateToJulianDay(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        currentDate.getDate(),
        currentDate.getHours() + currentDate.getMinutes() / 60
      );

      // Get natal chart
      const natalChart = await this.generateBasicBirthChart(birthData);

      // Calculate current transit positions
      const transitPositions = await this._calculateTransitPositions(currentJD, latitude, longitude, timezone);

      // Analyze transits over natal planets and houses
      const transitAspects = this._analyzeGocharAspects(natalChart, transitPositions);

      // Calculate dashas active during this period
      const currentDashas = await this.calculateVimshottariDasha(birthData);

      // Generate Gochar predictions
      const predictions = this._generateGocharPredictions(transitAspects, currentDashas, currentDate);

      return {
        currentDate: currentDate.toLocaleDateString(),
        transitPositions,
        transitAspects,
        currentDashas: currentDashas.currentDasha,
        predictions,
        summary: this._generateGocharSummary(transitAspects, predictions)
      };
    } catch (error) {
      logger.error('Error calculating Gochar:', error);
      return { error: 'Unable to calculate Gochar at this time' };
    }
  }

  /**
    * Calculate transit positions for Gochar analysis
    * @private
    * @param {number} jd - Julian Day
    * @param {number} latitude - Latitude
    * @param {number} longitude - Longitude
    * @param {number} timezone - Timezone
    * @returns {Object} Transit planetary positions
    */
  async _calculateTransitPositions(jd, latitude, longitude, timezone) {
    const positions = {};
    const planetIds = {
      sun: 0,
      moon: 1,
      mars: 4,
      mercury: 2,
      jupiter: 5,
      venus: 3,
      saturn: 6,
      rahu: 11, // Rahu (North Node)
      ketu: null // Ketu calculated as opposite of Rahu
    };

    for (const [planetName, planetId] of Object.entries(planetIds)) {
      try {
        let position;
        if (planetName === 'ketu') {
          // Ketu is always opposite Rahu
          const rahuPos = positions.rahu;
          if (rahuPos) {
            position = { longitude: [(rahuPos.longitude[0] + 180) % 360] };
          }
        } else {
          position = sweph.calc(jd, planetId, 2 | 65536);
        }

        if (position && position.longitude) {
          const longitude = position.longitude[0];
          const sign = Math.floor(longitude / 30) + 1;
          const house = this._getVedicHouse(longitude, jd, latitude, longitude, timezone);

          positions[planetName] = {
            longitude,
            sign,
            signName: this._getVedicSignName(sign),
            house,
            retrograde: position.longitude[1] < 0 // Speed indicates retrograde
          };
        }
      } catch (error) {
        logger.warn(`Error calculating transit position for ${planetName}:`, error.message);
      }
    }

    return positions;
  }

  /**
    * Analyze Gochar aspects between transiting and natal planets
    * @private
    * @param {Object} natalChart - Natal chart
    * @param {Object} transitPositions - Current transit positions
    * @returns {Array} Transit aspects analysis
    */
  _analyzeGocharAspects(natalChart, transitPositions) {
    const aspects = [];

    Object.entries(transitPositions).forEach(([transitPlanet, transitData]) => {
      if (!transitData.longitude) { return; }

      // Check aspects to natal planets
      Object.entries(natalChart.planets).forEach(([natalPlanet, natalData]) => {
        if (!natalData.longitude) { return; }

        const angle = Math.abs(transitData.longitude - natalData.longitude);
        const minAngle = Math.min(angle, 360 - angle);

        // Vedic aspects: 0° (conjunction), 30° (semisextile), 45° (semisquare),
        // 60° (sextile), 90° (square), 120° (trine), 150° (quincunx), 180° (opposition)
        const vedicAspects = [
          { angle: 0, name: 'Conjunction', orb: 8 },
          { angle: 30, name: 'Semisextile', orb: 4 },
          { angle: 45, name: 'Semisquare', orb: 4 },
          { angle: 60, name: 'Sextile', orb: 6 },
          { angle: 90, name: 'Square', orb: 8 },
          { angle: 120, name: 'Trine', orb: 8 },
          { angle: 150, name: 'Quincunx', orb: 5 },
          { angle: 180, name: 'Opposition', orb: 8 }
        ];

        vedicAspects.forEach(aspect => {
          if (Math.abs(minAngle - aspect.angle) <= aspect.orb) {
            aspects.push({
              transitPlanet: transitPlanet.charAt(0).toUpperCase() + transitPlanet.slice(1),
              natalPlanet: natalPlanet.charAt(0).toUpperCase() + natalPlanet.slice(1),
              aspect: aspect.name,
              exactAngle: Math.round(minAngle * 10) / 10,
              orb: Math.round((minAngle - aspect.angle) * 10) / 10,
              strength: this._getAspectStrength(aspect.name, Math.abs(minAngle - aspect.angle)),
              interpretation: this._interpretGocharAspect(transitPlanet, natalPlanet, aspect.name, natalData.signName),
              effects: this._getGocharAspectEffects(transitPlanet, natalPlanet, aspect.name)
            });
          }
        });
      });

      // Check aspects to natal houses (transit planets aspecting house cusps)
      if (natalChart.houses) {
        Object.entries(natalChart.houses).forEach(([houseNum, houseCusp]) => {
          const angle = Math.abs(transitData.longitude - houseCusp);
          const minAngle = Math.min(angle, 360 - angle);

          // Check for conjunction (planet in house)
          if (minAngle <= 8) {
            aspects.push({
              transitPlanet: transitPlanet.charAt(0).toUpperCase() + transitPlanet.slice(1),
              house: parseInt(houseNum),
              aspect: 'House Transits',
              interpretation: this._interpretHouseTransit(transitPlanet, houseNum),
              effects: this._getHouseTransitEffects(transitPlanet, houseNum)
            });
          }
        });
      }
    });

    return aspects.slice(0, 10); // Return top 10 significant aspects
  }

  /**
    * Get aspect strength based on orb
    * @private
    * @param {string} aspect - Aspect name
    * @param {number} orb - Orb in degrees
    * @returns {string} Strength level
    */
  _getAspectStrength(aspect, orb) {
    if (orb <= 2) { return 'Very Strong'; }
    if (orb <= 4) { return 'Strong'; }
    if (orb <= 6) { return 'Moderate'; }
    return 'Weak';
  }

  /**
    * Interpret Gochar aspect
    * @private
    * @param {string} transitPlanet - Transiting planet
    * @param {string} natalPlanet - Natal planet
    * @param {string} aspect - Aspect type
    * @param {string} natalSign - Natal planet's sign
    * @returns {string} Interpretation
    */
  _interpretGocharAspect(transitPlanet, natalPlanet, aspect, natalSign) {
    const interpretations = {
      'Sun-Moon': {
        Conjunction: 'Identity and emotional harmony',
        Opposition: 'Balance between self and emotions',
        Trine: 'Natural self-expression and emotional flow',
        Square: 'Tension between identity and feelings'
      },
      'Jupiter-Saturn': {
        Conjunction: 'Major life expansion and structure',
        Opposition: 'Balance between growth and responsibility',
        Trine: 'Harmonious progress and achievement',
        Square: 'Challenges in balancing optimism and realism'
      }
    };

    const key = `${transitPlanet}-${natalPlanet}`;
    const reverseKey = `${natalPlanet}-${transitPlanet}`;

    return interpretations[key]?.[aspect] ||
           interpretations[reverseKey]?.[aspect] ||
           `${transitPlanet} transit affecting ${natalPlanet} in ${natalSign}`;
  }

  /**
    * Get Gochar aspect effects
    * @private
    * @param {string} transitPlanet - Transiting planet
    * @param {string} natalPlanet - Natal planet
    * @param {string} aspect - Aspect type
    * @returns {string} Effects description
    */
  _getGocharAspectEffects(transitPlanet, natalPlanet, aspect) {
    const effects = {
      Sun: {
        Conjunction: 'Increased vitality and self-confidence',
        Opposition: 'Public recognition and relationship focus',
        Trine: 'Natural success and leadership opportunities',
        Square: 'Challenges to ego and self-expression'
      },
      Moon: {
        Conjunction: 'Emotional sensitivity and intuition',
        Opposition: 'Public emotional life and relationships',
        Trine: 'Emotional harmony and nurturing',
        Square: 'Mood fluctuations and emotional challenges'
      },
      Mars: {
        Conjunction: 'Increased energy and drive',
        Opposition: 'Conflicts and competitive situations',
        Trine: 'Successful action and achievement',
        Square: 'Frustration and aggressive challenges'
      },
      Jupiter: {
        Conjunction: 'Expansion and good fortune',
        Opposition: 'Growth through relationships',
        Trine: 'Natural abundance and wisdom',
        Square: 'Over-expansion and unrealistic expectations'
      },
      Saturn: {
        Conjunction: 'Responsibilities and life lessons',
        Opposition: 'Karmic relationships and commitments',
        Trine: 'Achievement through discipline',
        Square: 'Restrictions and hard work'
      }
    };

    return effects[transitPlanet]?.[aspect] || `${aspect} influence from ${transitPlanet}`;
  }

  /**
    * Interpret house transit
    * @private
    * @param {string} planet - Transiting planet
    * @param {number} house - House number
    * @returns {string} Interpretation
    */
  _interpretHouseTransit(planet, house) {
    const houseAreas = {
      1: 'self, personality, and physical appearance',
      2: 'wealth, family, and speech',
      3: 'siblings, communication, and short journeys',
      4: 'home, mother, emotions, and property',
      5: 'children, education, creativity, and romance',
      6: 'health, service, enemies, and daily routine',
      7: 'marriage, partnerships, and business',
      8: 'transformation, secrets, and occult matters',
      9: 'fortune, father, spirituality, and long journeys',
      10: 'career, reputation, and public image',
      11: 'gains, friends, hopes, and elder siblings',
      12: 'expenses, foreign lands, spirituality, and losses'
    };

    const planetInfluences = {
      sun: 'vitality, leadership, and self-expression',
      moon: 'emotions, intuition, and nurturing',
      mars: 'energy, action, and courage',
      mercury: 'communication, intellect, and adaptability',
      jupiter: 'growth, wisdom, and prosperity',
      venus: 'love, beauty, and harmony',
      saturn: 'discipline, responsibility, and structure'
    };

    return `${planet} transiting ${houseAreas[house] || 'this life area'}, bringing ${planetInfluences[planet] || 'planetary influence'}`;
  }

  /**
    * Get house transit effects
    * @private
    * @param {string} planet - Transiting planet
    * @param {number} house - House number
    * @returns {string} Effects description
    */
  _getHouseTransitEffects(planet, house) {
    const effects = {
      1: 'Focus on personal identity and new beginnings',
      2: 'Financial matters and family relationships',
      3: 'Communication, learning, and short travels',
      4: 'Home, family, and emotional security',
      5: 'Creativity, children, and romance',
      6: 'Health, work, and service to others',
      7: 'Relationships and partnerships',
      8: 'Transformation and deep changes',
      9: 'Spirituality, travel, and higher learning',
      10: 'Career and public reputation',
      11: 'Goals, friends, and gains',
      12: 'Spirituality, endings, and foreign matters'
    };

    return effects[house] || 'General life area focus';
  }

  /**
    * Generate Gochar predictions
    * @private
    * @param {Array} transitAspects - Transit aspects
    * @param {Object} currentDashas - Current dashas
    * @param {Date} currentDate - Current date
    * @returns {Object} Predictions for different life areas
    */
  _generateGocharPredictions(transitAspects, currentDashas, currentDate) {
    const predictions = {
      overall: '',
      career: '',
      relationships: '',
      health: '',
      finance: '',
      spirituality: ''
    };

    // Analyze major transits
    const majorTransits = transitAspects.filter(aspect =>
      aspect.strength === 'Very Strong' || aspect.strength === 'Strong'
    );

    // Overall assessment
    if (majorTransits.length >= 3) {
      predictions.overall = 'Period of significant change and activity. Multiple planetary influences creating dynamic energy.';
    } else if (majorTransits.length >= 1) {
      predictions.overall = 'Moderate activity with some important developments. Focus on key opportunities.';
    } else {
      predictions.overall = 'Relatively stable period with gradual progress. Good time for planning and preparation.';
    }

    // Career predictions based on 10th house transits
    const careerTransits = transitAspects.filter(aspect =>
      aspect.house === 10 || (aspect.natalPlanet === 'Saturn' && aspect.aspect === 'Conjunction')
    );
    if (careerTransits.length > 0) {
      predictions.career = 'Career matters are activated. Opportunities for advancement and recognition.';
    } else {
      predictions.career = 'Career developments proceed steadily. Focus on long-term goals.';
    }

    // Relationship predictions based on 7th house and Venus/Moon transits
    const relationshipTransits = transitAspects.filter(aspect =>
      aspect.house === 7 ||
      (['Venus', 'Moon'].includes(aspect.transitPlanet) && ['Conjunction', 'Trine', 'Sextile'].includes(aspect.aspect))
    );
    if (relationshipTransits.length > 0) {
      predictions.relationships = 'Relationships and partnerships are highlighted. Important connections forming.';
    } else {
      predictions.relationships = 'Relationship matters stable. Focus on deepening existing connections.';
    }

    // Health predictions based on 6th house and Mars transits
    const healthTransits = transitAspects.filter(aspect =>
      aspect.house === 6 || aspect.transitPlanet === 'Mars'
    );
    if (healthTransits.length > 0) {
      predictions.health = 'Pay attention to health and energy levels. Good time for positive lifestyle changes.';
    } else {
      predictions.health = 'Health generally stable. Maintain regular routines and self-care.';
    }

    // Financial predictions based on 2nd and 11th house transits
    const financeTransits = transitAspects.filter(aspect =>
      [2, 11].includes(aspect.house) ||
      (aspect.transitPlanet === 'Jupiter' && ['Conjunction', 'Trine'].includes(aspect.aspect))
    );
    if (financeTransits.length > 0) {
      predictions.finance = 'Financial matters activated. Opportunities for growth and stability.';
    } else {
      predictions.finance = 'Financial situation stable. Focus on long-term planning.';
    }

    // Spiritual predictions based on 9th and 12th house transits
    const spiritualTransits = transitAspects.filter(aspect =>
      [9, 12].includes(aspect.house) ||
      (aspect.transitPlanet === 'Jupiter' && aspect.aspect === 'Conjunction')
    );
    if (spiritualTransits.length > 0) {
      predictions.spirituality = 'Spiritual growth and understanding enhanced. Good time for inner exploration.';
    } else {
      predictions.spirituality = 'Spiritual journey continues steadily. Maintain regular practices.';
    }

    return predictions;
  }

  /**
    * Generate Gochar summary
    * @private
    * @param {Array} transitAspects - Transit aspects
    * @param {Object} predictions - Predictions
    * @returns {string} Summary text
    */
  _generateGocharSummary(transitAspects, predictions) {
    let summary = '🌟 *Gochar (Vedic Transits) Analysis*\n\n';

    summary += `*Overall:*\n${predictions.overall}\n\n`;

    summary += '*Key Planetary Influences:*\n';
    const majorAspects = transitAspects.filter(aspect =>
      aspect.strength === 'Very Strong' || aspect.strength === 'Strong'
    ).slice(0, 3);

    if (majorAspects.length > 0) {
      majorAspects.forEach(aspect => {
        summary += `• ${aspect.transitPlanet} aspecting ${aspect.natalPlanet || `House ${aspect.house}`}: ${aspect.effects}\n`;
      });
    } else {
      summary += '• Relatively stable transit period\n';
    }

    summary += '\n*Life Area Focus:*\n';
    summary += `• Career: ${predictions.career}\n`;
    summary += `• Relationships: ${predictions.relationships}\n`;
    summary += `• Health: ${predictions.health}\n`;
    summary += `• Finance: ${predictions.finance}\n`;
    summary += `• Spirituality: ${predictions.spirituality}\n`;

    return summary;
  }

  /**
    * Calculate Prashna (Vedic Horary Astrology) - Answer questions based on query time
    * @param {Object} questionData - Question data object
    * @param {string} questionData.question - The question being asked
    * @param {string} questionData.queryTime - Time when question was asked (DD/MM/YYYY HH:MM format)
    * @param {string} questionData.queryPlace - Place where question was asked
    * @param {string} questionData.questionType - Type of question (love, career, health, etc.)
    * @returns {Object} Prashna analysis and answer
    */
  async calculatePrashna(questionData) {
    try {
      const { question, queryTime, queryPlace = 'Delhi, India', questionType } = questionData;

      if (!question || !queryTime) {
        return { error: 'Question and query time are required for Prashna analysis' };
      }

      // Parse query time
      const [datePart, timePart] = queryTime.split(' ');
      const [day, month, year] = datePart.split('/').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);

      // Get coordinates for query place
      const [latitude, longitude] = await this._getCoordinatesForPlace(queryPlace);
      const queryDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = queryDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Cast horary chart for the exact moment of the question
      const prashnaChart = await this._castPrashnaChart(year, month, day, hour, minute, latitude, longitude, timezone);

      // Analyze the Prashna chart
      const analysis = this._analyzePrashnaChart(prashnaChart, question, questionType);

      // Generate answer based on chart analysis
      const answer = this._generatePrashnaAnswer(analysis, question, questionType);

      return {
        question,
        queryTime,
        queryPlace,
        questionType,
        prashnaChart,
        analysis,
        answer,
        summary: this._generatePrashnaSummary(analysis, answer)
      };
    } catch (error) {
      logger.error('Error calculating Prashna:', error);
      return { error: 'Unable to calculate Prashna at this time' };
    }
  }

  /**
    * Cast Prashna chart for the query moment
    * @private
    * @param {number} year - Year
    * @param {number} month - Month
    * @param {number} day - Day
    * @param {number} hour - Hour
    * @param {number} minute - Minute
    * @param {number} latitude - Latitude
    * @param {number} longitude - Longitude
    * @param {number} timezone - Timezone
    * @returns {Object} Prashna chart
    */
  async _castPrashnaChart(year, month, day, hour, minute, latitude, longitude, timezone) {
    try {
      // Prepare data for astrologer library
      const astroData = {
        year,
        month,
        date: day,
        hours: hour,
        minutes: minute,
        seconds: 0,
        latitude,
        longitude,
        timezone,
        chartType: 'sidereal'
      };

      // Generate Prashna chart
      const chart = this.astrologer.generateNatalChartData(astroData);

      // Add Prashna-specific calculations
      const prashnaAscendant = chart.interpretations.risingSign;
      const prashnaMoonSign = chart.interpretations.moonSign;

      // Calculate Prashna Lagna (Ascendant) strength
      const lagnaStrength = this._calculateLagnaStrength(chart);

      // Calculate Moon's relationship to Lagna
      const moonLagnaRelation = this._getMoonLagnaRelation(chart.planets.moon, prashnaAscendant);

      return {
        ...chart,
        prashnaAscendant,
        prashnaMoonSign,
        lagnaStrength,
        moonLagnaRelation,
        prashnaSpecific: {
          isDayBirth: this._isDayBirth(hour, minute, latitude, longitude, year, month, day),
          weekday: this._getWeekday(year, month, day),
          tithi: this._calculateTithi(chart.planets.sun, chart.planets.moon),
          nakshatra: this._getMoonNakshatra(chart.planets.moon)
        }
      };
    } catch (error) {
      logger.error('Error casting Prashna chart:', error);
      throw error;
    }
  }

  /**
    * Calculate Lagna (Ascendant) strength in Prashna
    * @private
    * @param {Object} chart - Prashna chart
    * @returns {Object} Lagna strength analysis
    */
  _calculateLagnaStrength(chart) {
    const ascendantSign = chart.interpretations.risingSign;
    const { planets } = chart;

    let strength = 0;
    let beneficialPlanets = 0;
    let maleficPlanets = 0;

    // Check planets in Lagna
    Object.entries(planets).forEach(([planetName, planetData]) => {
      if (planetData.house === 1) {
        if (['jupiter', 'venus', 'mercury', 'moon'].includes(planetName)) {
          beneficialPlanets++;
          strength += 2;
        } else if (['saturn', 'mars', 'sun'].includes(planetName)) {
          maleficPlanets++;
          strength -= 1;
        }
      }
    });

    // Check aspects to Lagna
    const lagnaAspects = this._getLagnaAspects(chart);

    return {
      totalStrength: Math.max(0, strength),
      beneficialPlanets,
      maleficPlanets,
      aspects: lagnaAspects,
      interpretation: this._interpretLagnaStrength(strength, beneficialPlanets, maleficPlanets)
    };
  }

  /**
    * Get aspects to Lagna
    * @private
    * @param {Object} chart - Chart data
    * @returns {Array} Aspects to Lagna
    */
  _getLagnaAspects(chart) {
    const aspects = [];
    const { planets } = chart;

    Object.entries(planets).forEach(([planetName, planetData]) => {
      // Check if planet aspects the 1st house
      const aspectHouses = this._getVedicAspectHouses(planetData.house);

      if (aspectHouses.includes(1)) {
        aspects.push({
          planet: planetName,
          type: 'aspect',
          influence: this._getPlanetInfluence(planetName)
        });
      }

      // Check conjunction with Lagna (house 1)
      if (planetData.house === 1) {
        aspects.push({
          planet: planetName,
          type: 'conjunction',
          influence: this._getPlanetInfluence(planetName)
        });
      }
    });

    return aspects;
  }

  /**
    * Get Vedic aspect houses for a planet
    * @private
    * @param {number} house - House number
    * @returns {Array} Houses aspected
    */
  _getVedicAspectHouses(house) {
    // Vedic aspects: 7th, 9th, 4th, 10th, 5th, 11th, 3rd, 12th
    const aspects = [7, 9, 4, 10, 5, 11, 3, 12];
    return aspects.map(aspect => ((house - 1 + aspect - 1) % 12) + 1);
  }

  /**
    * Get planet influence (benefic/malefic)
    * @private
    * @param {string} planet - Planet name
    * @returns {string} Influence type
    */
  _getPlanetInfluence(planet) {
    const benefics = ['jupiter', 'venus', 'mercury', 'moon'];
    const malefics = ['saturn', 'mars', 'sun', 'rahu', 'ketu'];

    if (benefics.includes(planet)) { return 'benefic'; }
    if (malefics.includes(planet)) { return 'malefic'; }
    return 'neutral';
  }

  /**
    * Interpret Lagna strength
    * @private
    * @param {number} strength - Strength score
    * @param {number} benefics - Number of benefics
    * @param {number} malefics - Number of malefics
    * @returns {string} Interpretation
    */
  _interpretLagnaStrength(strength, benefics, malefics) {
    if (strength >= 3) {
      return 'Very strong Lagna - Question has good potential for positive outcome';
    } else if (strength >= 1) {
      return 'Moderately strong Lagna - Question has reasonable chances';
    } else if (strength >= -1) {
      return 'Neutral Lagna - Outcome depends on other factors';
    } else {
      return 'Weak Lagna - Question may have challenges or negative outcome';
    }
  }

  /**
    * Get Moon-Lagna relationship
    * @private
    * @param {Object} moon - Moon data
    * @param {string} lagnaSign - Lagna sign
    * @returns {Object} Relationship analysis
    */
  _getMoonLagnaRelation(moon, lagnaSign) {
    if (!moon || !moon.signName) { return { relation: 'unknown' }; }

    const moonSign = moon.signName;
    const signRelation = this._getSignRelation(moonSign, lagnaSign);

    return {
      moonSign,
      lagnaSign,
      relation: signRelation,
      interpretation: this._interpretMoonLagnaRelation(signRelation)
    };
  }

  /**
    * Get relationship between two signs
    * @private
    * @param {string} sign1 - First sign
    * @param {string} sign2 - Second sign
    * @returns {string} Relationship type
    */
  _getSignRelation(sign1, sign2) {
    if (sign1 === sign2) { return 'conjunction'; }

    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const index1 = signs.indexOf(sign1);
    const index2 = signs.indexOf(sign2);

    if (index1 === -1 || index2 === -1) { return 'unknown'; }

    const diff = Math.min(Math.abs(index1 - index2), 12 - Math.abs(index1 - index2));

    if (diff === 6) { return 'opposition'; }
    if (diff === 4) { return 'trine'; }
    if (diff === 3) { return 'square'; }
    if (diff === 2) { return 'sextile'; }
    return 'other';
  }

  /**
    * Interpret Moon-Lagna relationship
    * @private
    * @param {string} relation - Relationship type
    * @returns {string} Interpretation
    */
  _interpretMoonLagnaRelation(relation) {
    const interpretations = {
      conjunction: 'Moon strongly connected to the question - emotional involvement high',
      opposition: 'Moon opposes Lagna - internal conflict or external opposition',
      trine: 'Moon in harmony with Lagna - favorable emotional climate',
      square: 'Moon in tension with Lagna - emotional challenges',
      sextile: 'Moon supports Lagna - opportunities through intuition',
      other: 'Moon in neutral relation to Lagna'
    };

    return interpretations[relation] || 'Moon-Lagna relationship neutral';
  }

  /**
    * Check if birth is during day time
    * @private
    * @param {number} hour - Hour
    * @param {number} minute - Minute
    * @param {number} latitude - Latitude
    * @param {number} longitude - Longitude
    * @param {number} year - Year
    * @param {number} month - Month
    * @param {number} day - Day
    * @returns {boolean} True if day birth
    */
  _isDayBirth(hour, minute, latitude, longitude, year, month, day) {
    // Simplified day/night calculation
    const sunrise = 6; // Approximate sunrise hour
    const sunset = 18; // Approximate sunset hour
    const queryHour = hour + minute / 60;

    return queryHour >= sunrise && queryHour <= sunset;
  }

  /**
    * Get weekday
    * @private
    * @param {number} year - Year
    * @param {number} month - Month
    * @param {number} day - Day
    * @returns {string} Weekday name
    */
  _getWeekday(year, month, day) {
    const date = new Date(year, month - 1, day);
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekdays[date.getDay()];
  }

  /**
    * Calculate Tithi (lunar day)
    * @private
    * @param {Object} sun - Sun data
    * @param {Object} moon - Moon data
    * @returns {Object} Tithi information
    */
  _calculateTithi(sun, moon) {
    if (!sun || !moon || !sun.longitude || !moon.longitude) {
      return { number: 0, name: 'Unknown' };
    }

    const longitudeDiff = (moon.longitude - sun.longitude + 360) % 360;
    const tithiNumber = Math.floor(longitudeDiff / 12) + 1;

    const tithiNames = [
      'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi',
      'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi',
      'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
    ];

    return {
      number: tithiNumber,
      name: tithiNames[tithiNumber - 1] || 'Unknown',
      isBenefic: [1, 3, 5, 7, 10, 12].includes(tithiNumber) // Benefic tithis
    };
  }

  /**
    * Get Moon's Nakshatra
    * @private
    * @param {Object} moon - Moon data
    * @returns {Object} Nakshatra information
    */
  _getMoonNakshatra(moon) {
    if (!moon || !moon.longitude) {
      return { name: 'Unknown', lord: 'Unknown' };
    }

    const nakshatraSize = 360 / 27;
    const nakshatraNumber = Math.floor(moon.longitude / nakshatraSize);

    const nakshatras = [
      { name: 'Ashwini', lord: 'Ketu' },
      { name: 'Bharani', lord: 'Venus' },
      { name: 'Krittika', lord: 'Sun' },
      { name: 'Rohini', lord: 'Moon' },
      { name: 'Mrigashira', lord: 'Mars' },
      { name: 'Ardra', lord: 'Rahu' },
      { name: 'Punarvasu', lord: 'Jupiter' },
      { name: 'Pushya', lord: 'Saturn' },
      { name: 'Ashlesha', lord: 'Mercury' },
      { name: 'Magha', lord: 'Ketu' },
      { name: 'Purva Phalguni', lord: 'Venus' },
      { name: 'Uttara Phalguni', lord: 'Sun' },
      { name: 'Hasta', lord: 'Moon' },
      { name: 'Chitra', lord: 'Mars' },
      { name: 'Swati', lord: 'Rahu' },
      { name: 'Vishakha', lord: 'Jupiter' },
      { name: 'Anuradha', lord: 'Saturn' },
      { name: 'Jyeshtha', lord: 'Mercury' },
      { name: 'Mula', lord: 'Ketu' },
      { name: 'Purva Ashadha', lord: 'Venus' },
      { name: 'Uttara Ashadha', lord: 'Sun' },
      { name: 'Shravana', lord: 'Moon' },
      { name: 'Dhanishta', lord: 'Mars' },
      { name: 'Shatabhisha', lord: 'Rahu' },
      { name: 'Purva Bhadrapada', lord: 'Jupiter' },
      { name: 'Uttara Bhadrapada', lord: 'Saturn' },
      { name: 'Revati', lord: 'Mercury' }
    ];

    const nakshatra = nakshatras[nakshatraNumber] || { name: 'Unknown', lord: 'Unknown' };

    return {
      name: nakshatra.name,
      lord: nakshatra.lord,
      isBenefic: ['Jupiter', 'Venus', 'Moon', 'Mercury'].includes(nakshatra.lord)
    };
  }

  /**
    * Analyze Prashna chart
    * @private
    * @param {Object} prashnaChart - Prashna chart
    * @param {string} question - The question
    * @param {string} questionType - Type of question
    * @returns {Object} Analysis results
    */
  _analyzePrashnaChart(prashnaChart, question, questionType) {
    const analysis = {
      chartStrength: this._assessPrashnaChartStrength(prashnaChart),
      significators: this._identifySignificators(prashnaChart, questionType),
      houseAnalysis: this._analyzeQuestionHouses(prashnaChart, questionType),
      planetaryAnalysis: this._analyzePrashnaPlanets(prashnaChart, questionType),
      timing: this._assessTiming(prashnaChart),
      overallFavorability: 'neutral'
    };

    // Calculate overall favorability
    analysis.overallFavorability = this._calculateOverallFavorability(analysis);

    return analysis;
  }

  /**
    * Assess Prashna chart strength
    * @private
    * @param {Object} prashnaChart - Prashna chart
    * @returns {Object} Strength assessment
    */
  _assessPrashnaChartStrength(prashnaChart) {
    const lagnaStrength = prashnaChart.lagnaStrength.totalStrength;
    const moonRelation = prashnaChart.moonLagnaRelation.relation;

    let strength = 0;
    const factors = [];

    // Lagna strength
    if (lagnaStrength >= 3) {
      strength += 2;
      factors.push('Strong Lagna');
    } else if (lagnaStrength >= 1) {
      strength += 1;
      factors.push('Moderate Lagna');
    } else {
      factors.push('Weak Lagna');
    }

    // Moon-Lagna relationship
    if (['conjunction', 'trine', 'sextile'].includes(moonRelation)) {
      strength += 1;
      factors.push('Favorable Moon-Lagna relation');
    } else if (moonRelation === 'opposition') {
      strength -= 1;
      factors.push('Challenging Moon-Lagna relation');
    }

    // Day/Night and weekday
    const isDay = prashnaChart.prashnaSpecific.isDayBirth;
    const { weekday } = prashnaChart.prashnaSpecific;
    const auspiciousWeekdays = ['Wednesday', 'Thursday', 'Friday'];

    if (auspiciousWeekdays.includes(weekday)) {
      strength += 1;
      factors.push(`Auspicious weekday: ${weekday}`);
    }

    return {
      totalStrength: strength,
      factors,
      interpretation: strength >= 2 ? 'Favorable chart' : strength >= 0 ? 'Neutral chart' : 'Challenging chart'
    };
  }

  /**
    * Identify significators for the question type
    * @private
    * @param {Object} prashnaChart - Prashna chart
    * @param {string} questionType - Type of question
    * @returns {Array} Significator planets
    */
  _identifySignificators(prashnaChart, questionType) {
    const significators = {
      love: ['venus', 'moon', 'mars'],
      career: ['sun', 'saturn', 'jupiter', 'mercury'],
      health: ['sun', 'mars', 'moon', 'mercury'],
      finance: ['jupiter', 'venus', 'mercury'],
      education: ['jupiter', 'mercury', 'moon'],
      marriage: ['venus', 'jupiter', 'moon'],
      children: ['jupiter', 'moon', 'venus'],
      travel: ['moon', 'mercury', 'jupiter'],
      legal: ['jupiter', 'venus', 'mercury'],
      spiritual: ['jupiter', 'saturn', 'moon']
    };

    return significators[questionType] || ['jupiter', 'moon']; // Default significators
  }

  /**
    * Analyze question-related houses
    * @private
    * @param {Object} prashnaChart - Prashna chart
    * @param {string} questionType - Type of question
    * @returns {Object} House analysis
    */
  _analyzeQuestionHouses(prashnaChart, questionType) {
    const houseMap = {
      love: [5, 7, 11],
      career: [6, 10, 11],
      health: [1, 6, 8],
      finance: [2, 11],
      education: [4, 5, 9],
      marriage: [7, 9],
      children: [5, 9],
      travel: [3, 9, 12],
      legal: [6, 9, 12],
      spiritual: [9, 12]
    };

    const relevantHouses = houseMap[questionType] || [1, 5, 9];
    const analysis = {};

    relevantHouses.forEach(house => {
      analysis[house] = this._analyzeHouse(prashnaChart, house);
    });

    return analysis;
  }

  /**
    * Analyze specific house
    * @private
    * @param {Object} prashnaChart - Prashna chart
    * @param {number} house - House number
    * @returns {Object} House analysis
    */
  _analyzeHouse(prashnaChart, house) {
    const { planets } = prashnaChart;
    const planetsInHouse = Object.entries(planets).filter(([_, data]) => data.house === house);

    let strength = 0;
    const influences = [];

    planetsInHouse.forEach(([planetName, _]) => {
      const influence = this._getPlanetInfluence(planetName);
      influences.push({ planet: planetName, influence });

      if (influence === 'benefic') { strength += 1; } else if (influence === 'malefic') { strength -= 1; }
    });

    return {
      planets: planetsInHouse.map(([name, _]) => name),
      strength,
      influences,
      favorable: strength >= 0
    };
  }

  /**
    * Analyze Prashna planets
    * @private
    * @param {Object} prashnaChart - Prashna chart
    * @param {string} questionType - Type of question
    * @returns {Object} Planetary analysis
    */
  _analyzePrashnaPlanets(prashnaChart, questionType) {
    const significators = this._identifySignificators(prashnaChart, questionType);
    const analysis = {};

    significators.forEach(planet => {
      const planetData = prashnaChart.planets[planet];
      if (planetData) {
        analysis[planet] = {
          house: planetData.house,
          sign: planetData.signName,
          strength: this._assessPlanetStrength(planetData, prashnaChart),
          aspects: this._getPlanetAspects(planet, prashnaChart)
        };
      }
    });

    return analysis;
  }

  /**
    * Assess planet strength in Prashna
    * @private
    * @param {Object} planetData - Planet data
    * @param {Object} prashnaChart - Prashna chart
    * @returns {string} Strength assessment
    */
  _assessPlanetStrength(planetData, prashnaChart) {
    let strength = 0;

    // House position (angular houses are stronger)
    const angularHouses = [1, 4, 7, 10];
    if (angularHouses.includes(planetData.house)) { strength += 2; } else if ([2, 5, 8, 11].includes(planetData.house)) { strength += 1; }

    // Sign strength (own sign, exaltation)
    const ownSigns = this._getOwnSigns(planetData.name.toLowerCase());
    if (ownSigns.includes(planetData.sign)) { strength += 2; }

    return strength >= 3 ? 'Strong' : strength >= 1 ? 'Moderate' : 'Weak';
  }

  /**
    * Get planet aspects in Prashna chart
    * @private
    * @param {string} planetName - Planet name
    * @param {Object} prashnaChart - Prashna chart
    * @returns {Array} Aspects
    */
  _getPlanetAspects(planetName, prashnaChart) {
    // Simplified aspect checking
    const aspects = [];
    const planetData = prashnaChart.planets[planetName];

    if (planetData) {
      Object.entries(prashnaChart.planets).forEach(([otherPlanet, otherData]) => {
        if (otherPlanet !== planetName && otherData.longitude) {
          const angle = Math.abs(planetData.longitude - otherData.longitude);
          const minAngle = Math.min(angle, 360 - angle);

          if (minAngle <= 10) { // Conjunction
            aspects.push({ planet: otherPlanet, aspect: 'conjunction' });
          } else if (Math.abs(minAngle - 180) <= 8) { // Opposition
            aspects.push({ planet: otherPlanet, aspect: 'opposition' });
          } else if (Math.abs(minAngle - 120) <= 8) { // Trine
            aspects.push({ planet: otherPlanet, aspect: 'trine' });
          }
        }
      });
    }

    return aspects;
  }

  /**
    * Assess timing for the question
    * @private
    * @param {Object} prashnaChart - Prashna chart
    * @returns {Object} Timing assessment
    */
  _assessTiming(prashnaChart) {
    const { tithi } = prashnaChart.prashnaSpecific;
    const { nakshatra } = prashnaChart.prashnaSpecific;
    const { weekday } = prashnaChart.prashnaSpecific;

    let timingStrength = 0;
    const factors = [];

    // Tithi assessment
    if (tithi.isBenefic) {
      timingStrength += 1;
      factors.push(`Benefic Tithi: ${tithi.name}`);
    } else {
      factors.push(`Challenging Tithi: ${tithi.name}`);
    }

    // Nakshatra assessment
    if (nakshatra.isBenefic) {
      timingStrength += 1;
      factors.push(`Benefic Nakshatra: ${nakshatra.name} (${nakshatra.lord})`);
    } else {
      factors.push(`Challenging Nakshatra: ${nakshatra.name} (${nakshatra.lord})`);
    }

    // Weekday assessment
    const auspiciousDays = ['Wednesday', 'Thursday', 'Friday'];
    if (auspiciousDays.includes(weekday)) {
      timingStrength += 1;
      factors.push(`Auspicious weekday: ${weekday}`);
    }

    return {
      strength: timingStrength,
      factors,
      favorable: timingStrength >= 2
    };
  }

  /**
    * Calculate overall favorability
    * @private
    * @param {Object} analysis - Analysis data
    * @returns {string} Overall favorability
    */
  _calculateOverallFavorability(analysis) {
    let score = 0;

    // Chart strength
    if (analysis.chartStrength.totalStrength >= 2) { score += 2; } else if (analysis.chartStrength.totalStrength >= 0) { score += 1; }

    // Timing
    if (analysis.timing.favorable) { score += 1; }

    // House analysis
    const favorableHouses = Object.values(analysis.houseAnalysis).filter(h => h.favorable).length;
    const totalHouses = Object.keys(analysis.houseAnalysis).length;
    if (favorableHouses > totalHouses / 2) { score += 1; }

    if (score >= 3) { return 'favorable'; }
    if (score >= 2) { return 'moderately favorable'; }
    if (score >= 1) { return 'neutral'; }
    return 'challenging';
  }

  /**
    * Generate Prashna answer
    * @private
    * @param {Object} analysis - Analysis data
    * @param {string} question - The question
    * @param {string} questionType - Type of question
    * @returns {Object} Answer
    */
  _generatePrashnaAnswer(analysis, question, questionType) {
    const favorability = analysis.overallFavorability;

    const answers = {
      favorable: {
        love: 'The stars indicate positive developments in your love life. Be open to new connections and trust your intuition.',
        career: 'Career prospects look promising. Opportunities for advancement and recognition are likely.',
        health: 'Health indications are positive. Focus on maintaining healthy habits for continued well-being.',
        finance: 'Financial matters show positive potential. Good time for planning and investments.',
        education: 'Educational pursuits will be successful. Focus and dedication will bring good results.',
        marriage: 'Marriage prospects are favorable. Positive developments in relationship matters.',
        children: 'Children-related matters show positive indications. Good time for family planning.',
        travel: 'Travel plans have positive astrological support. Journeys will be beneficial.',
        legal: 'Legal matters have favorable indications. Justice and fair outcomes are likely.',
        spiritual: 'Spiritual journey is supported. Good time for deepening spiritual practices.'
      },
      'moderately favorable': {
        love: 'There are reasonable chances for positive developments in relationships. Patience and communication will help.',
        career: 'Career shows moderate potential. Steady progress with some opportunities for growth.',
        health: 'Health is generally stable with some areas needing attention. Regular check-ups recommended.',
        finance: 'Financial situation is moderate. Careful planning and saving will bring stability.',
        education: 'Educational progress is steady. Consistent effort will yield good results.',
        marriage: 'Marriage prospects are moderate. Some developments possible with right timing.',
        children: 'Children matters show moderate potential. Patience may be required.',
        travel: 'Travel has moderate support. Plan carefully and be flexible.',
        legal: 'Legal matters have mixed indications. Professional advice recommended.',
        spiritual: 'Spiritual growth is progressing steadily. Continue regular practices.'
      },
      neutral: {
        love: 'Relationship matters are in a neutral phase. Focus on personal growth and self-love.',
        career: 'Career is in a stable phase. Focus on skill development and networking.',
        health: 'Health requires attention. Focus on preventive care and healthy lifestyle.',
        finance: 'Financial situation needs careful management. Avoid risky investments.',
        education: 'Educational progress requires focused effort. Seek guidance when needed.',
        marriage: 'Marriage timing needs careful consideration. Focus on relationship readiness.',
        children: 'Children matters require patience. Focus on creating stable foundations.',
        travel: 'Travel plans need careful planning. Consider timing and preparation.',
        legal: 'Legal matters are complex. Seek expert advice and be patient.',
        spiritual: 'Spiritual journey requires consistent practice. Focus on inner development.'
      },
      challenging: {
        love: 'Relationship matters may face challenges. Focus on communication and understanding.',
        career: 'Career may encounter obstacles. Focus on skill development and perseverance.',
        health: 'Health needs special attention. Consult professionals and take preventive measures.',
        finance: 'Financial challenges may arise. Practice caution and seek financial advice.',
        education: 'Educational path may have hurdles. Seek additional support and guidance.',
        marriage: 'Marriage prospects face challenges. Consider counseling and self-reflection.',
        children: 'Children matters may be difficult. Seek support and be patient.',
        travel: 'Travel may encounter difficulties. Consider postponing if possible.',
        legal: 'Legal matters are challenging. Seek experienced legal counsel.',
        spiritual: 'Spiritual path may face tests. Focus on faith and consistent practice.'
      }
    };

    const answerText = answers[favorability]?.[questionType] ||
                      answers[favorability]?.general ||
                      'The astrological indications are mixed. Seek further clarification and professional advice.';

    return {
      favorability,
      answer: answerText,
      confidence: favorability === 'favorable' ? 'High' :
        favorability === 'moderately favorable' ? 'Medium' : 'Low',
      keyFactors: analysis.chartStrength.factors.concat(analysis.timing.factors)
    };
  }

  /**
    * Generate Prashna summary
    * @private
    * @param {Object} analysis - Analysis data
    * @param {Object} answer - Answer data
    * @returns {string} Summary text
    */
  _generatePrashnaSummary(analysis, answer) {
    let summary = '🔮 *Prashna (Horary Astrology) Analysis*\n\n';

    summary += `*Question Favorability:* ${answer.favorability.charAt(0).toUpperCase() + answer.favorability.slice(1)}\n`;
    summary += `*Confidence Level:* ${answer.confidence}\n\n`;

    summary += '*Key Factors:*\n';
    answer.keyFactors.slice(0, 3).forEach(factor => {
      summary += `• ${factor}\n`;
    });

    summary += '\n*Answer:*\n';
    summary += `${answer.answer}\n`;

    return summary;
  }

  /**
    * Generate comprehensive Vedic remedies based on birth chart analysis
    * @param {Object} birthData - Birth data object
    * @param {Object} analysis - Chart analysis (optional, will generate if not provided)
    * @returns {Object} Complete remedies package
    */
  async generateVedicRemedies(birthData, analysis = null) {
    try {
      // Get birth chart analysis if not provided
      if (!analysis) {
        analysis = await this.generateDetailedChartAnalysis(birthData);
      }

      // Identify weak planets and doshas
      const weakPlanets = this._identifyWeakPlanets(analysis);
      const doshas = this._identifyDoshas(analysis);

      // Generate remedies for weak planets
      const planetRemedies = {};
      weakPlanets.forEach(planet => {
        planetRemedies[planet] = this._vedicRemedies.generatePlanetRemedies(planet);
      });

      // Generate remedies for doshas
      const doshaRemedies = {};
      doshas.forEach(dosha => {
        doshaRemedies[dosha] = this._vedicRemedies.generateDoshaRemedies(dosha);
      });

      // Generate general strengthening remedies
      const generalRemedies = this._generateGeneralRemedies(analysis);

      // Create prioritized remedies list
      const prioritizedRemedies = this._prioritizeRemedies(weakPlanets, doshas, analysis);

      return {
        weakPlanets,
        doshas,
        planetRemedies,
        doshaRemedies,
        generalRemedies,
        prioritizedRemedies,
        summary: this._generateRemediesSummary(weakPlanets, doshas, prioritizedRemedies)
      };
    } catch (error) {
      logger.error('Error generating Vedic remedies:', error);
      return { error: 'Unable to generate remedies at this time' };
    }
  }

  /**
    * Identify weak planets in the chart
    * @private
    * @param {Object} analysis - Chart analysis
    * @returns {Array} Weak planet names
    */
  _identifyWeakPlanets(analysis) {
    const weakPlanets = [];

    // Check planetary strength from Ashtakavarga if available
    if (analysis.planetarySpeeds) {
      Object.entries(analysis.planetarySpeeds).forEach(([planet, data]) => {
        if (data.retrograde) {
          weakPlanets.push(planet);
        }
      });
    }

    // Check for debilitated planets
    const debilitatedSigns = {
      sun: 7, moon: 8, mars: 4, mercury: 12, jupiter: 10, venus: 6, saturn: 1
    };

    if (analysis.planets) {
      Object.entries(analysis.planets).forEach(([planet, data]) => {
        if (data.sign && debilitatedSigns[planet] === data.sign) {
          weakPlanets.push(planet);
        }
      });
    }

    // Check for planets in challenging aspects
    if (analysis.aspects) {
      const challengingAspects = analysis.aspects.filter(aspect =>
        ['Square', 'Opposition'].includes(aspect.aspect)
      );

      challengingAspects.forEach(aspect => {
        if (!weakPlanets.includes(aspect.planets.split('-')[0])) {
          weakPlanets.push(aspect.planets.split('-')[0]);
        }
        if (!weakPlanets.includes(aspect.planets.split('-')[1])) {
          weakPlanets.push(aspect.planets.split('-')[1]);
        }
      });
    }

    return [...new Set(weakPlanets)]; // Remove duplicates
  }

  /**
    * Identify doshas in the chart
    * @private
    * @param {Object} analysis - Chart analysis
    * @returns {Array} Dosha types
    */
  _identifyDoshas(analysis) {
    const doshas = [];

    // Check for Kaal Sarp Dosha (all planets between Rahu and Ketu)
    if (this._hasKaalSarpDosha(analysis.planets)) {
      doshas.push('kaal_sarp');
    }

    // Check for Manglik Dosha (Mars in 1st, 4th, 7th, 8th, or 12th from Lagna or Moon)
    if (this._hasManglikDosha(analysis.planets)) {
      doshas.push('manglik');
    }

    // Check for Pitru Dosha (Rahu/Sun in 9th house or other combinations)
    if (this._hasPitruDosha(analysis.planets)) {
      doshas.push('pitru');
    }

    // Check for Sade Sati potential (Saturn transits)
    if (this._hasSadeSatiPotential(analysis.planets)) {
      doshas.push('sade_sati');
    }

    return doshas;
  }

  /**
    * Check for Kaal Sarp Dosha
    * @private
    * @param {Object} planets - Planetary positions
    * @returns {boolean} Whether Kaal Sarp Dosha exists
    */
  _hasKaalSarpDosha(planets) {
    if (!planets.rahu || !planets.ketu) { return false; }

    const rahuHouse = planets.rahu.house;
    const ketuHouse = planets.ketu.house;

    // Check if all planets are between Rahu and Ketu
    const allPlanets = Object.values(planets);
    const planetsBetween = allPlanets.filter(planet => {
      if (planet.name === 'Rahu' || planet.name === 'Ketu') { return false; }

      // Check if planet is between Rahu and Ketu in zodiac
      const planetPos = planet.longitude;
      const rahuPos = planets.rahu.longitude;
      const ketuPos = planets.ketu.longitude;

      // Handle zodiac wrap-around
      if (rahuPos < ketuPos) {
        return planetPos > rahuPos && planetPos < ketuPos;
      } else {
        return planetPos > rahuPos || planetPos < ketuPos;
      }
    });

    return planetsBetween.length === 7; // All 7 planets between Rahu and Ketu
  }

  /**
    * Check for Manglik Dosha
    * @private
    * @param {Object} planets - Planetary positions
    * @returns {boolean} Whether Manglik Dosha exists
    */
  _hasManglikDosha(planets) {
    if (!planets.mars) { return false; }

    const marsHouse = planets.mars.house;
    const dangerousHouses = [1, 4, 7, 8, 12];

    return dangerousHouses.includes(marsHouse);
  }

  /**
    * Check for Pitru Dosha
    * @private
    * @param {Object} planets - Planetary positions
    * @returns {boolean} Whether Pitru Dosha exists
    */
  _hasPitruDosha(planets) {
    // Simplified check: Rahu or Sun in 9th house, or other traditional combinations
    const rahuHouse = planets.rahu?.house;
    const sunHouse = planets.sun?.house;

    return rahuHouse === 9 || sunHouse === 9;
  }

  /**
    * Check for Sade Sati potential
    * @private
    * @param {Object} planets - Planetary positions
    * @returns {boolean} Whether Sade Sati is possible
    */
  _hasSadeSatiPotential(planets) {
    // Saturn in 12th, 1st, or 2nd from Moon sign indicates Sade Sati potential
    if (!planets.saturn || !planets.moon) { return false; }

    const moonSign = planets.moon.sign;
    const saturnSign = planets.saturn.sign;

    const sadeSatiSigns = [
      (moonSign - 2 + 12) % 12 + 1, // 12th from Moon
      moonSign, // Same as Moon
      (moonSign % 12) + 1 // 2nd from Moon
    ];

    return sadeSatiSigns.includes(saturnSign);
  }

  /**
    * Generate general strengthening remedies
    * @private
    * @param {Object} analysis - Chart analysis
    * @returns {Object} General remedies
    */
  _generateGeneralRemedies(analysis) {
    return {
      navagraha: this._vedicRemedies.pujas.navagraha,
      navagrahaYantra: this._vedicRemedies.yantras.navagraha,
      generalMantras: {
        gayatri: {
          mantra: 'Om Bhur Bhuva Swaha Tat Savitur Varenyam Bhargo Devasya Dhimahi Dhiyo Yo Nah Prachodayat',
          count: '108 times daily',
          benefits: 'Overall spiritual and mental development'
        },
        mahamrityunjaya: {
          mantra: 'Om Tryambakam Yajamahe Sugandhim Pushti Vardhanam Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat',
          count: '108 times daily',
          benefits: 'Protection from diseases and life-threatening situations'
        }
      },
      generalCharities: {
        feeding: 'Feed poor people, especially Brahmins, on auspicious days',
        water: 'Provide drinking water facilities',
        education: 'Support education for poor children',
        temples: 'Contribute to temple maintenance and priest welfare'
      }
    };
  }

  /**
    * Prioritize remedies based on severity and urgency
    * @private
    * @param {Array} weakPlanets - Weak planets
    * @param {Array} doshas - Doshas present
    * @param {Object} analysis - Chart analysis
    * @returns {Array} Prioritized remedies
    */
  _prioritizeRemedies(weakPlanets, doshas, analysis) {
    const priorities = [];

    // High priority: Dosha remedies
    doshas.forEach(dosha => {
      priorities.push({
        type: 'dosha',
        item: dosha,
        priority: 'high',
        reason: `${dosha.replace('_', ' ').toUpperCase()} requires immediate attention`,
        remedies: this._vedicRemedies.generateDoshaRemedies(dosha)
      });
    });

    // Medium priority: Weak planet remedies
    weakPlanets.forEach(planet => {
      priorities.push({
        type: 'planet',
        item: planet,
        priority: 'medium',
        reason: `${planet.charAt(0).toUpperCase() + planet.slice(1)} needs strengthening`,
        remedies: this._vedicRemedies.generatePlanetRemedies(planet)
      });
    });

    // Low priority: General strengthening
    priorities.push({
      type: 'general',
      item: 'general_strengthening',
      priority: 'low',
      reason: 'General spiritual and planetary strengthening',
      remedies: this._generateGeneralRemedies(analysis)
    });

    return priorities;
  }

  /**
    * Generate remedies summary
    * @private
    * @param {Array} weakPlanets - Weak planets
    * @param {Array} doshas - Doshas
    * @param {Array} prioritizedRemedies - Prioritized remedies
    * @returns {string} Summary text
    */
  _generateRemediesSummary(weakPlanets, doshas, prioritizedRemedies) {
    let summary = '🕉️ *Vedic Remedies Analysis*\n\n';

    if (doshas.length > 0) {
      summary += `*Identified Doshas:* ${doshas.join(', ')}\n\n`;
    }

    if (weakPlanets.length > 0) {
      summary += `*Weak Planets:* ${weakPlanets.join(', ')}\n\n`;
    }

    summary += '*Recommended Remedies (in priority order):*\n\n';

    prioritizedRemedies.forEach((remedy, index) => {
      const priorityEmoji = remedy.priority === 'high' ? '🔴' : remedy.priority === 'medium' ? '🟡' : '🟢';
      summary += `${priorityEmoji} *${remedy.priority.toUpperCase()} PRIORITY*\n`;
      summary += `${remedy.reason}\n\n`;

      if (remedy.remedies.gemstone) {
        summary += `💎 *Gemstone:* ${remedy.remedies.gemstone.name}\n`;
        summary += `📿 *Mantra:* ${remedy.remedies.gemstone.mantras[0]}\n`;
        summary += `🙏 *Charity:* ${remedy.remedies.charity.items[0]}\n\n`;
      }

      if (remedy.remedies.puja) {
        summary += `🕉️ *Puja:* ${remedy.remedies.puja.name}\n\n`;
      }
    });

    summary += '⚠️ *Important Notes:*\n';
    summary += '• Start with high-priority remedies\n';
    summary += '• Consult a qualified priest for pujas\n';
    summary += '• Wear gemstones only after proper energization\n';
    summary += '• Maintain consistency in mantra chanting\n';
    summary += '• Consult your astrologer for personalized timing\n\n';

    summary += '🕉️ *Remember:* Remedies work best with faith, patience, and positive actions.';

    return summary;
  }

  /**
    * Calculate asteroid positions using Swiss Ephemeris
    * @param {Object} birthData - Birth data object
    * @returns {Object} Asteroid positions and interpretations
    */
  async calculateAsteroids(birthData) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone for birth place
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      const astroData = {
        year,
        month,
        date: day,
        hours: hour,
        minutes: minute,
        seconds: 0,
        latitude,
        longitude,
        timezone,
        chartType: 'sidereal'
      };

      // Calculate positions for major asteroids
      const asteroids = {
        chiron: this._calculateAsteroidPosition('chiron', astroData),
        juno: this._calculateAsteroidPosition('juno', astroData),
        vesta: this._calculateAsteroidPosition('vesta', astroData),
        pallas: this._calculateAsteroidPosition('pallas', astroData)
      };

      // Generate interpretations
      const interpretations = {
        chiron: this._interpretChiron(asteroids.chiron),
        juno: this._interpretJuno(asteroids.juno),
        vesta: this._interpretVesta(asteroids.vesta),
        pallas: this._interpretPallas(asteroids.pallas)
      };

      return {
        asteroids,
        interpretations,
        summary: this._generateAsteroidSummary(asteroids, interpretations)
      };
    } catch (error) {
      logger.error('Error calculating asteroids:', error);
      return {
        error: 'Unable to calculate asteroid positions at this time'
      };
    }
  }

  /**
   * Calculate position for a specific asteroid
   * @private
   * @param {string} asteroidName - Name of the asteroid
   * @param {Object} astroData - Astronomical data
   * @returns {Object} Asteroid position data
   */
  async _calculateAsteroidPosition(asteroidName, astroData) {
    try {
      // Use Swiss Ephemeris for precise asteroid calculations via _getBaseAsteroidPosition
      const basePosition = await this._getBaseAsteroidPosition(asteroidName, astroData);

      return {
        name: asteroidName.charAt(0).toUpperCase() + asteroidName.slice(1),
        sign: this._getSignFromLongitude(basePosition),
        degrees: Math.floor(basePosition % 30),
        minutes: Math.floor((basePosition % 1) * 60),
        seconds: Math.floor(((basePosition % 1) * 60 % 1) * 60),
        longitude: basePosition,
        house: this._getHouseFromLongitude(basePosition, astroData),
        aspects: this._getAsteroidAspects(basePosition, astroData)
      };
    } catch (error) {
      logger.error(`Error calculating ${asteroidName} position:`, error);
      return {
        name: asteroidName.charAt(0).toUpperCase() + asteroidName.slice(1),
        sign: 'Unknown',
        degrees: 0,
        minutes: 0,
        seconds: 0,
        error: 'Position calculation failed'
      };
    }
  }

  /**
   * Get base position for asteroid (simplified calculation)
   * @private
   * @param {string} asteroidName - Asteroid name
   * @param {Object} astroData - Astro data
   * @returns {number} Longitude position
   */
  async _getBaseAsteroidPosition(asteroidName, astroData) {
    try {
      // Use Swiss Ephemeris for precise asteroid calculations
      const asteroidIds = {
        ceres: 17,   // SE_CERES
        pallas: 18,  // SE_PALLAS
        juno: 19,    // SE_JUNO
        vesta: 20,   // SE_VESTA
        chiron: 15   // SE_CHIRON
      };

      const asteroidId = asteroidIds[asteroidName];
      if (!asteroidId) {
        throw new Error(`Unknown asteroid: ${asteroidName}`);
      }

      // Convert birth date to Julian Day
      const birthJD = this._dateToJulianDay(
        astroData.year,
        astroData.month,
        astroData.date,
        astroData.hours + astroData.minutes / 60
      );

      // Calculate asteroid position using Swiss Ephemeris
      const position = sweph.calc(birthJD, asteroidId, 2 | 256);

      if (position && position.longitude && position.longitude[0] !== undefined) {
        return position.longitude[0]; // Return longitude in degrees
      }

      // Swiss Ephemeris failed - throw error for precise calculations
      throw new Error(`Swiss Ephemeris calculation failed for ${asteroidName}. Ensure ephemeris files are properly loaded and date is within supported range.`);
    } catch (error) {
      logger.error(`Error calculating ${asteroidName} position with Swiss Ephemeris:`, error);
      throw error; // Re-throw to maintain precision requirement
    }
  }


  /**
   * Calculate ascendant (rising sign) using Swiss Ephemeris with different house systems
   * @private
   * @param {number} jd - Julian Day
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {string} houseSystem - House system ('P'=Placidus, 'K'=Koch, 'E'=Equal, 'W'=Whole Sign, etc.)
   * @returns {Object} Ascendant and house cusps
   */
  _calculateHouses(jd, latitude, longitude, houseSystem = 'P') {
    try {
      // Use Swiss Ephemeris to calculate houses
      const houses = sweph.houses(jd, latitude, longitude, houseSystem);
      if (houses && houses.ascendant) {
        const houseCusps = {};
        for (let i = 1; i <= 12; i++) {
          houseCusps[i] = houses.ascendant[i - 1] || 0;
        }

        return {
          ascendant: houses.ascendant[0],
          houseCusps,
          system: this._getHouseSystemName(houseSystem)
        };
      }

      // Fallback to equal houses if specified system fails
      logger.warn(`House system ${houseSystem} failed, falling back to Equal houses`);
      return this._calculateEqualHouses(jd, latitude, longitude);
    } catch (error) {
      logger.error('Error calculating houses:', error);
      return this._calculateEqualHouses(jd, latitude, longitude);
    }
  }

  /**
   * Calculate equal houses as fallback
   * @private
   * @param {number} jd - Julian Day
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Object} Equal house system
   */
  _calculateEqualHouses(jd, latitude, longitude) {
    try {
      // Calculate ascendant using RAMC approximation
      const ramc = sweph.degnorm(jd * 360 / 365.25); // Rough RAMC
      const ascendant = (ramc + longitude) % 360;

      const houseCusps = {};
      for (let i = 1; i <= 12; i++) {
        houseCusps[i] = (ascendant + (i - 1) * 30) % 360;
      }

      return {
        ascendant,
        houseCusps,
        system: 'Equal'
      };
    } catch (error) {
      logger.error('Error calculating equal houses:', error);
      return {
        ascendant: 0,
        houseCusps: {},
        system: 'Equal'
      };
    }
  }

  /**
   * Get house system name
   * @private
   * @param {string} systemCode - House system code
   * @returns {string} Full system name
   */
  _getHouseSystemName(systemCode) {
    const systems = {
      P: 'Placidus',
      K: 'Koch',
      E: 'Equal',
      W: 'Whole Sign',
      R: 'Regiomontanus',
      C: 'Campanus',
      A: 'Equal (MC)',
      V: 'Vehlow',
      X: 'Axial Rotation',
      H: 'Horizontal',
      T: 'Polich/Page',
      B: 'Alcabitius'
    };
    return systems[systemCode] || 'Unknown';
  }

  /**
   * Calculate ascendant (rising sign) using Swiss Ephemeris
   * @private
   * @param {number} jd - Julian Day
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {string} houseSystem - House system (default 'P' for Placidus)
   * @returns {number} Ascendant longitude in degrees
   */
  _calculateAscendant(jd, latitude, longitude, houseSystem = 'P') {
    const houses = this._calculateHouses(jd, latitude, longitude, houseSystem);
    return houses.ascendant;
  }

  /**
   * Calculate heliocentric distances for interpretive depth
   * @private
   * @param {number} jd - Julian Day
   * @returns {Object} Heliocentric distances for planets
   */
  async _calculateHeliocentricDistances(jd) {
    const distances = {};
    const planetIds = {
      mercury: 2,
      venus: 3,
      mars: 4,
      jupiter: 5,
      saturn: 6
    };

    for (const [planetName, planetId] of Object.entries(planetIds)) {
      try {
        // Calculate heliocentric position (FLG_HELCTR flag)
        const position = sweph.calc(jd, planetId, 2 | 8);
        if (position && position.longitude) {
          // Distance is in AU (Astronomical Units)
          const distance = position.longitude[2]; // Distance in AU
          distances[planetName] = {
            distance,
            interpretation: this._interpretHeliocentricDistance(planetName, distance)
          };
        }
      } catch (error) {
        logger.warn(`Error calculating heliocentric distance for ${planetName}:`, error.message);
      }
    }

    return distances;
  }

  /**
   * Interpret heliocentric distance for astrological meaning
   * @private
   * @param {string} planet - Planet name
   * @param {number} distance - Distance in AU
   * @returns {string} Interpretation
   */
  _interpretHeliocentricDistance(planet, distance) {
    // Average distances in AU for comparison
    const avgDistances = {
      mercury: 0.39,
      venus: 0.72,
      mars: 1.52,
      jupiter: 5.20,
      saturn: 9.54
    };

    const avgDistance = avgDistances[planet];
    if (!avgDistance) { return 'Unknown distance significance'; }

    const ratio = distance / avgDistance;

    if (ratio < 0.95) {
      return `${planet} closer to Sun: Intensified ${this._getPlanetDomain(planet)} energy`;
    } else if (ratio > 1.05) {
      return `${planet} farther from Sun: More distant influence on ${this._getPlanetDomain(planet)}`;
    } else {
      return `${planet} at average distance: Balanced ${this._getPlanetDomain(planet)} expression`;
    }
  }

  /**
   * Calculate precise sun and moon positions using Swiss Ephemeris
   * @private
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {number} hour - Hour (default 12 for midday)
   * @param {number} minute - Minute (default 0)
   * @returns {Object} Sun and moon positions
   */
  async _calculateSunMoonPositions(year, month, day, hour = 12, minute = 0) {
    try {
      const jd = this._dateToJulianDay(year, month, day, hour + minute / 60);

      // Calculate sun position
      const sunPos = sweph.calc(jd, 0, 2 | 256);
      const sunLongitude = sunPos.longitude ? sunPos.longitude[0] : null;

      // Calculate moon position
      const moonPos = sweph.calc(jd, 1, 2 | 256);
      const moonLongitude = moonPos.longitude ? moonPos.longitude[0] : null;

      if (sunLongitude === null || moonLongitude === null) {
        throw new Error('Unable to calculate sun/moon positions');
      }

      return {
        sun: { longitude: sunLongitude },
        moon: { longitude: moonLongitude }
      };
    } catch (error) {
      logger.error('Error calculating sun/moon positions with Swiss Ephemeris:', error);
      throw error;
    }
  }

  /**
   * Convert date to Julian Day
   * @private
   */
  _dateToJulianDay(year, month, day, hour) {
    // Simplified Julian Day calculation
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;

    const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    return jd + (hour - 12) / 24; // Adjust for time
  }

  /**
   * Get house position for asteroid
   * @private
   * @param {number} longitude - Asteroid longitude
   * @param {Object} astroData - Astro data
   * @returns {number} House number
   */
  async _getHouseFromLongitude(longitude, astroData) {
    // Simplified house calculation - would need proper ascendant calculation
    const ascendant = 0; // Simplified - should calculate actual ascendant
    const positionFromAsc = (longitude - ascendant + 360) % 360;
    return Math.floor(positionFromAsc / 30) + 1;
  }

  /**
   * Get aspects for asteroid
   * @private
   * @param {number} asteroidPos - Asteroid position
   * @param {Object} astroData - Astro data
   * @returns {Array} Aspects
   */
  async _getAsteroidAspects(asteroidPos, astroData) {
    const aspects = [];
    const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

    for (const planet of planets) {
      // Simplified aspect checking - would use actual planetary positions
      const planetPos = await this._getSimplifiedPlanetPosition(planet, astroData);
      const angle = Math.abs(asteroidPos - planetPos) % 360;
      const minAngle = Math.min(angle, 360 - angle);

      if (minAngle <= 10) {
        aspects.push({
          planet: planet.charAt(0).toUpperCase() + planet.slice(1),
          aspect: minAngle <= 5 ? 'conjunction' : 'close aspect',
          orb: Math.round(minAngle * 10) / 10
        });
      }
    }

    return aspects;
  }

  /**
   * Get simplified planet position for aspect calculations
   * @private
   * @param {string} planet - Planet name
   * @param {Object} astroData - Astro data
   * @returns {number} Planet longitude
   */
  async _getSimplifiedPlanetPosition(planet, astroData) {
    // Simplified planetary positions - in production use actual calculations
    const positions = {
      sun: (astroData.month - 1) * 30 + astroData.date, // Sun moves ~1° per day
      moon: ((astroData.hours * 15) + (astroData.minutes * 0.25)) % 360, // Moon moves ~15° per hour
      mercury: ((astroData.month - 1) * 30 + astroData.date + 15) % 360,
      venus: ((astroData.month - 1) * 30 + astroData.date + 30) % 360,
      mars: ((astroData.month - 1) * 30 + astroData.date + 45) % 360,
      jupiter: ((astroData.month - 1) * 30 + astroData.date + 60) % 360,
      saturn: ((astroData.month - 1) * 30 + astroData.date + 75) % 360
    };

    return positions[planet] || 0;
  }

  /**
   * Interpret Ceres position
   * @private
   * @param {Object} ceres - Ceres data
   * @returns {Object} Ceres interpretation
   */
  _interpretCeres(ceres) {
    const signInterpretations = {
      Aries: 'Independent nurturing, self-sufficient caregiving',
      Taurus: 'Sensual nurturing, providing material comfort and security',
      Gemini: 'Intellectual nurturing, communicative care and teaching',
      Cancer: 'Emotional nurturing, intuitive caregiving and protection',
      Leo: 'Creative nurturing, dramatic care with warmth and generosity',
      Virgo: 'Practical nurturing, health-focused care and service',
      Libra: 'Harmonious nurturing, balanced care and relationship support',
      Scorpio: 'Intense nurturing, transformative care and deep emotional support',
      Sagittarius: 'Adventurous nurturing, expansive care and philosophical guidance',
      Capricorn: 'Structured nurturing, responsible care and long-term support',
      Aquarius: 'Innovative nurturing, community care and humanitarian support',
      Pisces: 'Compassionate nurturing, spiritual care and unconditional love'
    };

    return {
      nurturingStyle: signInterpretations[ceres.sign] || 'Unique nurturing approach',
      caregivingApproach: this._getCeresCaregivingApproach(ceres.sign),
      cyclesOfLife: this._getCeresLifeCycles(ceres.sign),
      keyThemes: ['Nurturing', 'Caregiving', 'Cycles', 'Abundance']
    };
  }

  /**
   * Get Ceres caregiving approach
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Caregiving approach
   */
  _getCeresCaregivingApproach(sign) {
    const approaches = {
      Aries: 'Direct and empowering care, encouraging independence',
      Taurus: 'Sensual and grounding care, providing stability',
      Gemini: 'Communicative care, teaching and intellectual support',
      Cancer: 'Emotional and protective care, creating safe spaces',
      Leo: 'Dramatic and generous care, boosting confidence',
      Virgo: 'Practical and health-focused care, detailed attention',
      Libra: 'Harmonious care, maintaining balance and beauty',
      Scorpio: 'Intense and transformative care, deep healing',
      Sagittarius: 'Expansive care, encouraging growth and exploration',
      Capricorn: 'Structured care, building long-term security',
      Aquarius: 'Innovative care, community and progressive support',
      Pisces: 'Compassionate care, spiritual and empathetic nurturing'
    };

    return approaches[sign] || 'Personal caregiving style';
  }

  /**
   * Get Ceres life cycles
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Life cycles
   */
  _getCeresLifeCycles(sign) {
    const cycles = {
      Aries: 'Cycles of independence, new beginnings, and self-care',
      Taurus: 'Cycles of material abundance, sensual pleasure, and stability',
      Gemini: 'Cycles of communication, learning, and mental stimulation',
      Cancer: 'Cycles of emotional security, family, and home',
      Leo: 'Cycles of creativity, self-expression, and joy',
      Virgo: 'Cycles of health, service, and practical organization',
      Libra: 'Cycles of harmony, relationships, and aesthetic beauty',
      Scorpio: 'Cycles of transformation, intimacy, and rebirth',
      Sagittarius: 'Cycles of exploration, philosophy, and expansion',
      Capricorn: 'Cycles of achievement, structure, and responsibility',
      Aquarius: 'Cycles of innovation, community, and humanitarian work',
      Pisces: 'Cycles of compassion, spirituality, and artistic expression'
    };

    return cycles[sign] || 'Personal life cycles';
  }

  /**
   * Interpret Chiron position
   * @private
   * @param {Object} chiron - Chiron data
   * @returns {Object} Chiron interpretation
   */
  _interpretChiron(chiron) {
    const signInterpretations = {
      Aries: 'Wounds related to identity and self-expression',
      Taurus: 'Healing around self-worth and material security',
      Gemini: 'Communication wounds and learning difficulties',
      Cancer: 'Emotional wounds and family healing',
      Leo: 'Creative wounds and self-acceptance issues',
      Virgo: 'Service wounds and perfectionism healing',
      Libra: 'Relationship wounds and partnership healing',
      Scorpio: 'Deep transformation and intimacy wounds',
      Sagittarius: 'Belief system wounds and philosophical healing',
      Capricorn: 'Authority wounds and ambition healing',
      Aquarius: 'Community wounds and individuality healing',
      Pisces: 'Spiritual wounds and compassion healing'
    };

    return {
      coreWound: signInterpretations[chiron.sign] || 'Personal healing journey',
      healingGift: this._getChironHealingGift(chiron.sign),
      lifePurpose: `To heal ${chiron.sign.toLowerCase()} wounds and help others with similar issues`,
      keyThemes: ['Wounds', 'Healing', 'Teaching', 'Compassion']
    };
  }

  /**
   * Get Chiron healing gift based on sign
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Healing gift
   */
  _getChironHealingGift(sign) {
    const gifts = {
      Aries: 'Teaching others to stand in their power',
      Taurus: 'Helping others find self-worth and abundance',
      Gemini: 'Guiding communication and learning processes',
      Cancer: 'Supporting emotional healing and family matters',
      Leo: 'Encouraging creative self-expression',
      Virgo: 'Assisting with practical healing and service',
      Libra: 'Facilitating relationship harmony',
      Scorpio: 'Supporting deep transformation work',
      Sagittarius: 'Guiding philosophical and spiritual growth',
      Capricorn: 'Helping with career and life structure',
      Aquarius: 'Supporting community and humanitarian causes',
      Pisces: 'Facilitating spiritual and compassionate work'
    };

    return gifts[sign] || 'Supporting others through their healing journey';
  }

  /**
   * Interpret Juno position
   * @private
   * @param {Object} juno - Juno data
   * @returns {Object} Juno interpretation
   */
  _interpretJuno(juno) {
    const signInterpretations = {
      Aries: 'Independent partnerships, equal power dynamics',
      Taurus: 'Committed, sensual relationships with material security',
      Gemini: 'Intellectual partnerships, communicative relationships',
      Cancer: 'Nurturing, emotional partnerships, family-oriented',
      Leo: 'Dramatic, loyal partnerships with creative expression',
      Virgo: 'Practical, service-oriented partnerships',
      Libra: 'Harmonious, balanced partnerships, diplomatic unions',
      Scorpio: 'Intense, transformative partnerships, deep intimacy',
      Sagittarius: 'Adventurous partnerships, philosophical unions',
      Capricorn: 'Responsible, ambitious partnerships, structured relationships',
      Aquarius: 'Progressive partnerships, friendship-based unions',
      Pisces: 'Compassionate, spiritual partnerships, unconditional love'
    };

    return {
      relationshipStyle: signInterpretations[juno.sign] || 'Unique partnership approach',
      commitmentStyle: this._getJunoCommitmentStyle(juno.sign),
      partnershipNeeds: this._getJunoNeeds(juno.sign),
      keyThemes: ['Partnerships', 'Commitment', 'Equality', 'Loyalty']
    };
  }

  /**
   * Get Juno commitment style
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Commitment style
   */
  _getJunoCommitmentStyle(sign) {
    const styles = {
      Aries: 'Passionate and direct commitment',
      Taurus: 'Steady and sensual commitment',
      Gemini: 'Intellectual and communicative commitment',
      Cancer: 'Emotional and nurturing commitment',
      Leo: 'Dramatic and loyal commitment',
      Virgo: 'Practical and devoted commitment',
      Libra: 'Balanced and harmonious commitment',
      Scorpio: 'Intense and transformative commitment',
      Sagittarius: 'Adventurous and philosophical commitment',
      Capricorn: 'Responsible and structured commitment',
      Aquarius: 'Progressive and egalitarian commitment',
      Pisces: 'Compassionate and spiritual commitment'
    };

    return styles[sign] || 'Personal commitment approach';
  }

  /**
   * Get Juno partnership needs
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Partnership needs
   */
  _getJunoNeeds(sign) {
    const needs = {
      Aries: 'Equality, independence, and mutual respect',
      Taurus: 'Security, sensuality, and material comfort',
      Gemini: 'Communication, intellectual stimulation, and variety',
      Cancer: 'Emotional security, nurturing, and family connection',
      Leo: 'Admiration, creativity, and romantic expression',
      Virgo: 'Practical support, health, and service',
      Libra: 'Harmony, beauty, and diplomatic partnership',
      Scorpio: 'Depth, intimacy, and transformative connection',
      Sagittarius: 'Freedom, adventure, and philosophical alignment',
      Capricorn: 'Stability, ambition, and long-term planning',
      Aquarius: 'Independence, innovation, and shared ideals',
      Pisces: 'Compassion, spirituality, and emotional merging'
    };

    return needs[sign] || 'Personal partnership requirements';
  }

  /**
   * Interpret Vesta position
   * @private
   * @param {Object} vesta - Vesta data
   * @returns {Object} Vesta interpretation
   */
  _interpretVesta(vesta) {
    const signInterpretations = {
      Aries: 'Dedication to personal goals and self-initiation',
      Taurus: 'Commitment to material security and sensual pleasures',
      Gemini: 'Devotion to communication and intellectual pursuits',
      Cancer: 'Dedication to home, family, and emotional nurturing',
      Leo: 'Commitment to creative self-expression and leadership',
      Virgo: 'Devotion to service, health, and practical matters',
      Libra: 'Dedication to relationships and aesthetic harmony',
      Scorpio: 'Commitment to deep transformation and intimacy',
      Sagittarius: 'Devotion to philosophy, travel, and higher learning',
      Capricorn: 'Commitment to career, structure, and long-term goals',
      Aquarius: 'Dedication to community, innovation, and humanitarian causes',
      Pisces: 'Commitment to spirituality, compassion, and artistic expression'
    };

    return {
      sacredFocus: signInterpretations[vesta.sign] || 'Personal sacred dedication',
      devotionStyle: this._getVestaDevotionStyle(vesta.sign),
      sacredRituals: this._getVestaRituals(vesta.sign),
      keyThemes: ['Devotion', 'Focus', 'Sacred Work', 'Commitment']
    };
  }

  /**
   * Get Vesta devotion style
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Devotion style
   */
  _getVestaDevotionStyle(sign) {
    const styles = {
      Aries: 'Passionate and direct devotion',
      Taurus: 'Sensual and persistent devotion',
      Gemini: 'Intellectual and communicative devotion',
      Cancer: 'Nurturing and protective devotion',
      Leo: 'Creative and charismatic devotion',
      Virgo: 'Practical and meticulous devotion',
      Libra: 'Harmonious and diplomatic devotion',
      Scorpio: 'Intense and transformative devotion',
      Sagittarius: 'Adventurous and philosophical devotion',
      Capricorn: 'Structured and ambitious devotion',
      Aquarius: 'Innovative and humanitarian devotion',
      Pisces: 'Compassionate and spiritual devotion'
    };

    return styles[sign] || 'Personal devotion approach';
  }

  /**
   * Get Vesta sacred rituals
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Sacred rituals
   */
  _getVestaRituals(sign) {
    const rituals = {
      Aries: 'Personal rituals of initiation and courage',
      Taurus: 'Sensual rituals involving nature and material comfort',
      Gemini: 'Communication rituals, writing, and learning practices',
      Cancer: 'Home-based rituals, family traditions, emotional cleansing',
      Leo: 'Creative rituals, performance, self-expression practices',
      Virgo: 'Service rituals, health practices, organizational systems',
      Libra: 'Harmony rituals, aesthetic arrangements, relationship ceremonies',
      Scorpio: 'Transformation rituals, deep emotional work, intimacy practices',
      Sagittarius: 'Exploration rituals, travel ceremonies, philosophical study',
      Capricorn: 'Structure rituals, career ceremonies, long-term planning',
      Aquarius: 'Community rituals, innovation practices, humanitarian work',
      Pisces: 'Spiritual rituals, meditation, artistic and compassionate practices'
    };

    return rituals[sign] || 'Personal sacred practices';
  }

  /**
   * Interpret Pallas position
   * @private
   * @param {Object} pallas - Pallas data
   * @returns {Object} Pallas interpretation
   */
  _interpretPallas(pallas) {
    const signInterpretations = {
      Aries: 'Strategic warrior energy, direct problem-solving',
      Taurus: 'Practical wisdom, resource management strategies',
      Gemini: 'Intellectual strategies, communication patterns',
      Cancer: 'Intuitive strategies, emotional intelligence',
      Leo: 'Creative strategies, leadership patterns',
      Virgo: 'Analytical strategies, healing and service patterns',
      Libra: 'Diplomatic strategies, relationship dynamics',
      Scorpio: 'Transformative strategies, crisis management',
      Sagittarius: 'Philosophical strategies, expansion patterns',
      Capricorn: 'Structural strategies, organizational wisdom',
      Aquarius: 'Innovative strategies, community solutions',
      Pisces: 'Compassionate strategies, spiritual wisdom'
    };

    return {
      wisdomType: signInterpretations[pallas.sign] || 'Unique strategic wisdom',
      problemSolving: this._getPallasProblemSolving(pallas.sign),
      creativeExpression: this._getPallasCreativity(pallas.sign),
      keyThemes: ['Wisdom', 'Strategy', 'Creativity', 'Problem-Solving']
    };
  }

  /**
   * Get Pallas problem-solving style
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Problem-solving style
   */
  _getPallasProblemSolving(sign) {
    const styles = {
      Aries: 'Direct action and courageous solutions',
      Taurus: 'Practical, resource-based solutions',
      Gemini: 'Intellectual analysis and communication',
      Cancer: 'Intuitive and emotionally intelligent approaches',
      Leo: 'Creative and charismatic leadership solutions',
      Virgo: 'Analytical and systematic problem-solving',
      Libra: 'Diplomatic and harmonious resolutions',
      Scorpio: 'Deep transformative and crisis solutions',
      Sagittarius: 'Philosophical and expansive perspectives',
      Capricorn: 'Structured and long-term strategic planning',
      Aquarius: 'Innovative and community-based solutions',
      Pisces: 'Compassionate and spiritually guided approaches'
    };

    return styles[sign] || 'Personal problem-solving approach';
  }

  /**
   * Get Pallas creative expression
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Creative expression
   */
  _getPallasCreativity(sign) {
    const expressions = {
      Aries: 'Bold artistic initiatives and pioneering projects',
      Taurus: 'Sensual arts, music, culinary, and material crafts',
      Gemini: 'Writing, teaching, media, and communication arts',
      Cancer: 'Emotional storytelling, nurturing arts, family traditions',
      Leo: 'Performance arts, leadership, creative self-expression',
      Virgo: 'Healing arts, service projects, detailed craftsmanship',
      Libra: 'Visual arts, design, diplomatic negotiations, partnerships',
      Scorpio: 'Transformative arts, depth psychology, crisis intervention',
      Sagittarius: 'Philosophical writing, travel journalism, educational programs',
      Capricorn: 'Architectural design, business strategy, organizational systems',
      Aquarius: 'Community art, technological innovation, humanitarian projects',
      Pisces: 'Spiritual arts, music, poetry, compassionate service'
    };

    return expressions[sign] || 'Personal creative expression';
  }

  /**
   * Generate asteroid summary
   * @private
   * @param {Object} asteroids - Asteroid data
   * @param {Object} interpretations - Interpretations
   * @returns {string} Summary
   */
  _generateAsteroidSummary(asteroids, interpretations) {
    let summary = 'Asteroid Analysis:\n\n';

    summary += `🌾 *Ceres in ${asteroids.ceres.sign}*: ${interpretations.ceres.nurturingStyle}\n`;
    summary += `🩹 *Chiron in ${asteroids.chiron.sign}*: ${interpretations.chiron.coreWound}\n`;
    summary += `💍 *Juno in ${asteroids.juno.sign}*: ${interpretations.juno.relationshipStyle}\n`;
    summary += `🏛️ *Vesta in ${asteroids.vesta.sign}*: ${interpretations.vesta.sacredFocus}\n`;
    summary += `🎨 *Pallas in ${asteroids.pallas.sign}*: ${interpretations.pallas.wisdomType}\n\n`;

    summary += 'These five asteroids reveal your nurturing patterns, core wounds and healing, relationship dynamics, spiritual focus, and creative wisdom.';

    return summary;
  }

  /**
   * Calculate solar return time (simplified)
   * @private
   * @param {number} birthYear - Birth year
   * @param {number} birthMonth - Birth month
   * @param {number} birthDay - Birth day
   * @param {number} birthHour - Birth hour
   * @param {number} birthMinute - Birth minute
   * @param {number} targetYear - Target year
   * @returns {Object} Solar return timing
   */
  async _calculateSolarReturnTime(birthYear, birthMonth, birthDay, birthHour, birthMinute, targetYear) {
    try {
      // Convert birth date to Julian Day
      const birthJD = sweph.julday(birthYear, birthMonth, birthDay, birthHour + birthMinute / 60, 1);

      // Find the exact solar return time for the target year
      const solarReturnJD = sweph.swe_solret(birthJD, targetYear, 2);

      // Convert Julian Day back to Gregorian date and time
      const gregDate = sweph.revjul(solarReturnJD, 1);

      return {
        year: gregDate.year,
        month: gregDate.month,
        day: gregDate.day,
        hour: Math.floor(gregDate.hour),
        minute: Math.round((gregDate.hour - Math.floor(gregDate.hour)) * 60)
      };
    } catch (error) {
      logger.error('Error calculating solar return time with sweph:', error);
      throw new Error('Unable to calculate precise solar return timing. Swiss Ephemeris may not be properly configured.');
    }
  }

  /**
   * Analyze solar return chart
   * @private
   * @param {Object} solarReturnChart - Solar return chart data
   * @param {Object} birthData - Original birth data
   * @param {number} targetYear - Target year
   * @returns {Object} Solar return analysis
   */
  _analyzeSolarReturnChart(solarReturnChart, birthData, targetYear) {
    const analysis = {
      dominantThemes: [],
      keyPlanets: [],
      lifeAreas: [],
      challenges: [],
      opportunities: []
    };

    // Analyze Sun's house in solar return (theme of the year)
    const sunHouse = solarReturnChart.planets.sun?.house || 'Unknown';
    analysis.dominantThemes.push(this._getSolarReturnSunTheme(sunHouse));

    // Analyze Moon's sign (emotional tone)
    const moonSign = solarReturnChart.planets.moon?.signName || 'Unknown';
    analysis.dominantThemes.push(`Emotional focus in ${moonSign} energy`);

    // Analyze Jupiter's house (area of expansion)
    const jupiterHouse = solarReturnChart.planets.jupiter?.house || 'Unknown';
    if (jupiterHouse !== 'Unknown') {
      analysis.opportunities.push(this._getSolarReturnJupiterTheme(jupiterHouse));
    }

    // Analyze Saturn's house (area of responsibility)
    const saturnHouse = solarReturnChart.planets.saturn?.house || 'Unknown';
    if (saturnHouse !== 'Unknown') {
      analysis.challenges.push(this._getSolarReturnSaturnTheme(saturnHouse));
    }

    // Key planetary placements
    analysis.keyPlanets = this._getKeySolarReturnPlanets(solarReturnChart);

    // Life areas affected
    analysis.lifeAreas = this._getSolarReturnLifeAreas(solarReturnChart);

    return analysis;
  }

  /**
   * Get solar return theme based on Sun's house
   * @private
   * @param {string} house - Sun's house in solar return
   * @returns {string} Theme description
   */
  _getSolarReturnSunTheme(house) {
    const themes = {
      1: 'Year of self-discovery and personal identity',
      2: 'Focus on finances, values, and material security',
      3: 'Year of communication, learning, and social connections',
      4: 'Emphasis on home, family, and emotional foundations',
      5: 'Creative expression, romance, and self-expression',
      6: 'Health, service, and daily routines take center stage',
      7: 'Partnerships and relationships are highlighted',
      8: 'Transformation, shared resources, and deep change',
      9: 'Expansion through travel, education, and philosophy',
      10: 'Career advancement and public recognition',
      11: 'Community involvement and future-oriented goals',
      12: 'Spirituality, endings, and inner work'
    };

    return themes[house] || 'Year of personal growth and new beginnings';
  }

  /**
   * Get solar return Jupiter theme
   * @private
   * @param {string} house - Jupiter's house in solar return
   * @returns {string} Opportunity description
   */
  _getSolarReturnJupiterTheme(house) {
    const themes = {
      1: 'Personal growth and self-confidence expansion',
      2: 'Financial opportunities and increased income',
      3: 'Learning opportunities and communication growth',
      4: 'Home and family expansion or improvement',
      5: 'Creative projects and romantic opportunities',
      6: 'Health improvement and service opportunities',
      7: 'Relationship growth and partnership benefits',
      8: 'Financial windfalls and transformational opportunities',
      9: 'Travel opportunities and educational advancement',
      10: 'Career advancement and professional recognition',
      11: 'Community involvement and goal achievement',
      12: 'Spiritual growth and inner wisdom'
    };

    return themes[house] || 'General expansion and growth opportunities';
  }

  /**
   * Get solar return Saturn theme
   * @private
   * @param {string} house - Saturn's house in solar return
   * @returns {string} Challenge description
   */
  _getSolarReturnSaturnTheme(house) {
    const themes = {
      1: 'Building self-discipline and personal responsibility',
      2: 'Financial planning and material responsibility',
      3: 'Developing communication skills and learning discipline',
      4: 'Home and family responsibilities and restructuring',
      5: 'Taking creative projects seriously and building skills',
      6: 'Health discipline and work routine establishment',
      7: 'Relationship commitment and partnership work',
      8: 'Financial responsibility and transformational work',
      9: 'Educational commitment and philosophical discipline',
      10: 'Career responsibility and professional development',
      11: 'Community responsibility and long-term planning',
      12: 'Spiritual discipline and inner work commitment'
    };

    return themes[house] || 'General responsibility and structure building';
  }

  /**
   * Get key planets in solar return
   * @private
   * @param {Object} solarReturnChart - Solar return chart
   * @returns {Array} Key planetary placements
   */
  _getKeySolarReturnPlanets(solarReturnChart) {
    const keyPlanets = [];

    // Check for planets in angular houses (1, 4, 7, 10)
    const angularHouses = ['1', '4', '7', '10'];

    Object.entries(solarReturnChart.planets).forEach(([planetKey, planetData]) => {
      const { house } = planetData;
      if (angularHouses.includes(house)) {
        keyPlanets.push(`${planetData.name} in ${house}th house - ${this._getAngularHouseTheme(house)}`);
      }
    });

    return keyPlanets.length > 0 ? keyPlanets : ['General planetary influences throughout the year'];
  }

  /**
   * Get angular house theme
   * @private
   * @param {string} house - House number
   * @returns {string} Theme description
   */
  _getAngularHouseTheme(house) {
    const themes = {
      1: 'Personal initiative and self-expression',
      4: 'Home and family matters',
      7: 'Partnerships and relationships',
      10: 'Career and public life'
    };

    return themes[house] || 'Significant life area';
  }

  /**
   * Get life areas affected in solar return
   * @private
   * @param {Object} solarReturnChart - Solar return chart
   * @returns {Array} Life areas
   */
  _getSolarReturnLifeAreas(solarReturnChart) {
    const lifeAreas = [];
    const houseOccupancy = {};

    // Count planets in each house
    Object.values(solarReturnChart.planets).forEach(planet => {
      const { house } = planet;
      if (house && house !== 'Unknown') {
        houseOccupancy[house] = (houseOccupancy[house] || 0) + 1;
      }
    });

    // Find houses with multiple planets (stelliums)
    Object.entries(houseOccupancy).forEach(([house, count]) => {
      if (count >= 3) {
        lifeAreas.push(`Intense focus on ${this._getHouseArea(house)}`);
      } else if (count >= 2) {
        lifeAreas.push(`Activity in ${this._getHouseArea(house)}`);
      }
    });

    return lifeAreas.length > 0 ? lifeAreas : ['Balanced energy across life areas'];
  }

  /**
   * Get house area description
   * @private
   * @param {string} house - House number
   * @returns {string} Area description
   */
  _getHouseArea(house) {
    const areas = {
      1: 'personal identity and self-expression',
      2: 'finances and material values',
      3: 'communication and learning',
      4: 'home and family',
      5: 'creativity and romance',
      6: 'health and service',
      7: 'partnerships and relationships',
      8: 'transformation and shared resources',
      9: 'travel and higher learning',
      10: 'career and reputation',
      11: 'community and friendships',
      12: 'spirituality and inner life'
    };

    return areas[house] || 'life matters';
  }

  /**
   * Generate solar return summary
   * @private
   * @param {Object} solarReturnAnalysis - Solar return analysis
   * @param {number} targetYear - Target year
   * @returns {string} Solar return summary
   */
  _generateSolarReturnSummary(solarReturnAnalysis, targetYear) {
    let summary = `Solar Return Analysis for ${targetYear}:\n\n`;

    if (solarReturnAnalysis.dominantThemes.length > 0) {
      summary += '*Dominant Themes:*\n';
      solarReturnAnalysis.dominantThemes.forEach(theme => {
        summary += `• ${theme}\n`;
      });
      summary += '\n';
    }

    if (solarReturnAnalysis.opportunities.length > 0) {
      summary += '*Key Opportunities:*\n';
      solarReturnAnalysis.opportunities.forEach(opportunity => {
        summary += `• ${opportunity}\n`;
      });
      summary += '\n';
    }

    if (solarReturnAnalysis.challenges.length > 0) {
      summary += '*Areas of Growth:*\n';
      solarReturnAnalysis.challenges.forEach(challenge => {
        summary += `• ${challenge}\n`;
      });
      summary += '\n';
    }

    summary += 'Your solar return reveals the cosmic blueprint for the coming year! 🌞';

    return summary;
  }

  /**
   * Calculate upcoming cosmic events and their personal impact
   * @param {Object} birthData - User's birth data
   * @param {number} daysAhead - Number of days to look ahead (default 30)
   * @returns {Object} Cosmic events analysis
   */
  async calculateCosmicEvents(birthData, daysAhead = 30) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;
      const currentDate = new Date();
      const endDate = new Date(currentDate.getTime() + (daysAhead * 24 * 60 * 60 * 1000));

      // Get user's natal chart for correlation
      const natalChart = await this.generateBasicBirthChart({
        name: 'User',
        birthDate,
        birthTime,
        birthPlace
      });

      const events = {
        eclipses: await this._calculateUpcomingEclipses(currentDate, endDate, birthPlace),
        planetaryEvents: await this._calculateUpcomingPlanetaryEvents(currentDate, endDate),
        seasonalEvents: this._calculateUpcomingSeasonalEvents(currentDate, endDate),
        personalImpact: await this._correlateEventsWithChart(natalChart, currentDate, endDate)
      };

      return {
        period: `${currentDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
        events,
        summary: this._generateCosmicEventsSummary(events, natalChart)
      };
    } catch (error) {
      logger.error('Error calculating cosmic events:', error);
      return {
        error: 'Unable to calculate cosmic events at this time'
      };
    }
  }

  /**
   * Calculate upcoming eclipses
   * @private
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {string} birthPlace - User's birth place for visibility
   * @returns {Array} Upcoming eclipses
   */
  _calculateUpcomingEclipses(startDate, endDate, birthPlace) {
    // Simplified eclipse calculation - in production would use astronomical data
    const eclipses = [];

    // Known eclipses in 2025 (example data)
    const knownEclipses = [
      {
        date: '2025-03-14',
        type: 'solar',
        subtype: 'total',
        visibility: 'Pacific, Atlantic regions',
        magnitude: 1.04,
        significance: 'Powerful new beginnings, leadership changes'
      },
      {
        date: '2025-03-29',
        type: 'lunar',
        subtype: 'penumbral',
        visibility: 'Americas, Europe, Africa',
        magnitude: 0.92,
        significance: 'Emotional release, relationship insights'
      },
      {
        date: '2025-09-07',
        type: 'solar',
        subtype: 'annular',
        visibility: 'Pacific, Americas',
        magnitude: 0.93,
        significance: 'Transformation, breaking old patterns'
      },
      {
        date: '2025-09-21',
        type: 'lunar',
        subtype: 'partial',
        visibility: 'Asia, Australia, Americas',
        magnitude: 0.86,
        significance: 'Deep emotional processing, healing'
      }
    ];

    knownEclipses.forEach(eclipse => {
      const eclipseDate = new Date(eclipse.date);
      if (eclipseDate >= startDate && eclipseDate <= endDate) {
        eclipses.push({
          ...eclipse,
          date: eclipseDate.toLocaleDateString(),
          localVisibility: this._checkEclipseVisibility(eclipse, birthPlace),
          timing: eclipseDate.toLocaleTimeString()
        });
      }
    });

    return eclipses;
  }

  /**
   * Calculate upcoming planetary events
   * @private
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Upcoming planetary events
   */
  _calculateUpcomingPlanetaryEvents(startDate, endDate) {
    const events = [];

    // Known planetary events 2025 (simplified)
    const planetaryEvents = [
      {
        date: '2025-01-15',
        planet: 'Mercury',
        event: 'retrograde begins',
        sign: 'Aquarius',
        significance: 'Communication slowdown, review plans'
      },
      {
        date: '2025-02-04',
        planet: 'Mercury',
        event: 'retrograde ends',
        sign: 'Capricorn',
        significance: 'Communication flows again, implement changes'
      },
      {
        date: '2025-04-17',
        planet: 'Venus',
        event: 'retrograde begins',
        sign: 'Taurus',
        significance: 'Relationship review, value reassessment'
      },
      {
        date: '2025-05-06',
        planet: 'Venus',
        event: 'retrograde ends',
        sign: 'Taurus',
        significance: 'Harmony returns, new relationships blossom'
      },
      {
        date: '2025-06-26',
        planet: 'Saturn',
        event: 'retrograde begins',
        sign: 'Pisces',
        significance: 'Karmic lessons, structure review'
      },
      {
        date: '2025-11-15',
        planet: 'Saturn',
        event: 'retrograde ends',
        sign: 'Pisces',
        significance: 'Wisdom gained, new foundations laid'
      },
      {
        date: '2025-05-11',
        planet: 'Jupiter',
        event: 'conjunct Uranus',
        sign: 'Taurus',
        significance: 'Breakthrough innovation, unexpected opportunities'
      },
      {
        date: '2025-08-29',
        planet: 'Mars',
        event: 'square Saturn',
        sign: 'Gemini-Leo',
        significance: 'Action meets resistance, patience required'
      }
    ];

    planetaryEvents.forEach(event => {
      const eventDate = new Date(event.date);
      if (eventDate >= startDate && eventDate <= endDate) {
        events.push({
          ...event,
          date: eventDate.toLocaleDateString(),
          timing: eventDate.toLocaleTimeString(),
          intensity: this._getEventIntensity(event.event),
          duration: this._getEventDuration(event.planet, event.event)
        });
      }
    });

    return events;
  }

  /**
   * Calculate upcoming seasonal events
   * @private
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Seasonal events
   */
  _calculateUpcomingSeasonalEvents(startDate, endDate) {
    const events = [];

    // Seasonal events and astrological festivals
    const seasonalEvents = [
      {
        date: '2025-03-20',
        event: 'Vernal Equinox',
        significance: 'Balance, new beginnings, spring energy',
        astrological: 'Aries season begins, action and initiative'
      },
      {
        date: '2025-06-21',
        event: 'Summer Solstice',
        significance: 'Peak energy, celebration, abundance',
        astrological: 'Cancer season begins, nurturing and protection'
      },
      {
        date: '2025-09-22',
        event: 'Autumn Equinox',
        significance: 'Harvest, gratitude, balance restored',
        astrological: 'Libra season begins, harmony and relationships'
      },
      {
        date: '2025-12-21',
        event: 'Winter Solstice',
        significance: 'Rebirth, renewal, inner reflection',
        astrological: 'Capricorn season begins, structure and achievement'
      }
    ];

    seasonalEvents.forEach(event => {
      const eventDate = new Date(event.date);
      if (eventDate >= startDate && eventDate <= endDate) {
        events.push({
          ...event,
          date: eventDate.toLocaleDateString(),
          timing: eventDate.toLocaleTimeString(),
          element: this._getSeasonalElement(event.event),
          planetaryRuler: this._getSeasonalRuler(event.event)
        });
      }
    });

    return events;
  }

  /**
   * Correlate cosmic events with personal chart
   * @private
   * @param {Object} natalChart - User's natal chart
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Personal impact correlations
   */
  async _correlateEventsWithChart(natalChart, startDate, endDate) {
    const correlations = [];

    // Get current transits for the period
    const transits = await this.calculateAdvancedTransits(natalChart.fullChart, startDate);

    if (transits.majorTransits) {
      transits.majorTransits.forEach(transit => {
        correlations.push({
          event: `${transit.planet} ${transit.aspect}`,
          personalImpact: transit.influence,
          affectedHouses: this._getAffectedHouses(transit.planet, natalChart),
          timing: 'Current period',
          intensity: transit.intensity
        });
      });
    }

    // Add eclipse correlations
    const eclipses = this._calculateUpcomingEclipses(startDate, endDate, natalChart.birthPlace);
    eclipses.forEach(eclipse => {
      const personalCorrelation = this._getEclipsePersonalImpact(eclipse, natalChart);
      if (personalCorrelation) {
        correlations.push({
          event: `${eclipse.type} eclipse`,
          personalImpact: personalCorrelation,
          affectedHouses: this._getEclipseHouses(eclipse, natalChart),
          timing: eclipse.date,
          intensity: 'High'
        });
      }
    });

    return correlations;
  }

  /**
   * Generate cosmic events summary
   * @private
   * @param {Object} events - All cosmic events
   * @param {Object} natalChart - User's natal chart
   * @returns {string} Summary text
   */
  _generateCosmicEventsSummary(events, natalChart) {
    let summary = '🌟 *Cosmic Events Overview*\n\n';

    if (events.eclipses.length > 0) {
      summary += '*Eclipses:*\n';
      events.eclipses.forEach(eclipse => {
        summary += `• ${eclipse.date}: ${eclipse.type} ${eclipse.subtype} eclipse\n`;
        summary += `  ${eclipse.significance}\n`;
      });
      summary += '\n';
    }

    if (events.planetaryEvents.length > 0) {
      summary += '*Planetary Events:*\n';
      events.planetaryEvents.slice(0, 3).forEach(event => {
        summary += `• ${event.date}: ${event.planet} ${event.event}\n`;
        summary += `  ${event.significance}\n`;
      });
      summary += '\n';
    }

    if (events.seasonalEvents.length > 0) {
      summary += '*Seasonal Transitions:*\n';
      events.seasonalEvents.forEach(event => {
        summary += `• ${event.date}: ${event.event}\n`;
        summary += `  ${event.astrological}\n`;
      });
      summary += '\n';
    }

    if (events.personalImpact.length > 0) {
      summary += '*Personal Impact:*\n';
      events.personalImpact.slice(0, 2).forEach(impact => {
        summary += `• ${impact.event}: ${impact.personalImpact}\n`;
      });
      summary += '\n';
    }

    summary += 'Stay attuned to these cosmic energies! 🔮';

    return summary;
  }

  /**
   * Check eclipse visibility for location
   * @private
   * @param {Object} eclipse - Eclipse data
   * @param {string} birthPlace - User's location
   * @returns {string} Visibility status
   */
  _checkEclipseVisibility(eclipse, birthPlace) {
    // Simplified visibility check - in production would use precise astronomical calculations
    const visibilityMap = {
      'Pacific, Atlantic regions': ['USA', 'Canada', 'Europe', 'Africa'],
      'Americas, Europe, Africa': ['USA', 'Canada', 'Europe', 'Africa', 'South America'],
      'Pacific, Americas': ['USA', 'Canada', 'Mexico', 'South America', 'Australia'],
      'Asia, Australia, Americas': ['India', 'China', 'Australia', 'USA', 'Canada']
    };

    const regions = visibilityMap[eclipse.visibility] || [];
    const normalizedPlace = birthPlace.toLowerCase();

    const isVisible = regions.some(region =>
      normalizedPlace.includes(region.toLowerCase())
    );

    return isVisible ? 'Visible in your region' : 'Not visible in your region';
  }

  /**
   * Get event intensity
   * @private
   * @param {string} eventType - Type of event
   * @returns {string} Intensity level
   */
  _getEventIntensity(eventType) {
    const intensities = {
      'retrograde begins': 'Medium-High',
      'retrograde ends': 'Medium',
      conjunct: 'High',
      opposition: 'High',
      square: 'Medium-High',
      trine: 'Medium',
      sextile: 'Low-Medium'
    };

    return intensities[eventType] || 'Medium';
  }

  /**
   * Get event duration
   * @private
   * @param {string} planet - Planet name
   * @param {string} eventType - Event type
   * @returns {string} Duration description
   */
  _getEventDuration(planet, eventType) {
    if (eventType.includes('retrograde')) {
      const retrogradePeriods = {
        Mercury: '3 weeks',
        Venus: '6 weeks',
        Mars: '2 months',
        Jupiter: '4 months',
        Saturn: '4.5 months',
        Uranus: '5 months',
        Neptune: '5 months',
        Pluto: '5-6 months'
      };
      return retrogradePeriods[planet] || 'Variable';
    }

    return 'Momentary aspect';
  }

  /**
   * Get seasonal element
   * @private
   * @param {string} event - Seasonal event
   * @returns {string} Element
   */
  _getSeasonalElement(event) {
    const elements = {
      'Vernal Equinox': 'Air (new beginnings)',
      'Summer Solstice': 'Fire (peak energy)',
      'Autumn Equinox': 'Earth (harvest)',
      'Winter Solstice': 'Water (renewal)'
    };

    return elements[event] || 'Balanced';
  }

  /**
   * Get seasonal planetary ruler
   * @private
   * @param {string} event - Seasonal event
   * @returns {string} Planetary ruler
   */
  _getSeasonalRuler(event) {
    const rulers = {
      'Vernal Equinox': 'Mars (Aries)',
      'Summer Solstice': 'Sun (Leo)',
      'Autumn Equinox': 'Venus (Libra)',
      'Winter Solstice': 'Saturn (Capricorn)'
    };

    return rulers[event] || 'Sun';
  }

  /**
   * Get affected houses for planetary transit
   * @private
   * @param {string} planet - Planet name
   * @param {Object} natalChart - Natal chart
   * @returns {Array} Affected houses
   */
  _getAffectedHouses(planet, natalChart) {
    // Simplified house correlation - in production would calculate actual house positions
    const houseCorrelations = {
      Sun: ['1st', '5th', '9th'],
      Moon: ['4th', '8th', '12th'],
      Mercury: ['3rd', '6th', '9th'],
      Venus: ['2nd', '7th', '12th'],
      Mars: ['1st', '8th', '12th'],
      Jupiter: ['9th', '11th', '12th'],
      Saturn: ['10th', '11th', '12th']
    };

    return houseCorrelations[planet] || ['Various houses'];
  }

  /**
   * Get personal impact of eclipse
   * @private
   * @param {Object} eclipse - Eclipse data
   * @param {Object} natalChart - Natal chart
   * @returns {string} Personal impact description
   */
  _getEclipsePersonalImpact(eclipse, natalChart) {
    const { sunSign } = natalChart;
    const { moonSign } = natalChart;

    // Simplified eclipse impact based on sun/moon signs
    const impacts = {
      solar: {
        Aries: 'Leadership changes and new directions',
        Taurus: 'Financial and value system shifts',
        Gemini: 'Communication and learning transformations',
        Cancer: 'Home and family restructuring',
        Leo: 'Creative and self-expression changes',
        Virgo: 'Health and service role evolution',
        Libra: 'Relationship and partnership dynamics',
        Scorpio: 'Transformation and rebirth processes',
        Sagittarius: 'Philosophy and expansion opportunities',
        Capricorn: 'Career and structure rebuilding',
        Aquarius: 'Innovation and community involvement',
        Pisces: 'Spirituality and compassion awakening'
      },
      lunar: {
        Aries: 'Emotional drive and initiative',
        Taurus: 'Emotional security and values',
        Gemini: 'Emotional communication needs',
        Cancer: 'Deep emotional healing and nurturing',
        Leo: 'Emotional creativity and self-expression',
        Virgo: 'Emotional health and service',
        Libra: 'Emotional relationships and harmony',
        Scorpio: 'Emotional transformation and intensity',
        Sagittarius: 'Emotional exploration and freedom',
        Capricorn: 'Emotional responsibility and structure',
        Aquarius: 'Emotional innovation and detachment',
        Pisces: 'Emotional spirituality and compassion'
      }
    };

    const eclipseImpacts = impacts[eclipse.type] || {};
    return eclipseImpacts[sunSign] || eclipseImpacts[moonSign] || 'Personal transformation and growth';
  }

  /**
   * Get houses affected by eclipse
   * @private
   * @param {Object} eclipse - Eclipse data
   * @param {Object} natalChart - Natal chart
   * @returns {Array} Affected houses
   */
  _getEclipseHouses(eclipse, natalChart) {
    // Simplified - eclipses affect houses based on their position
    if (eclipse.type === 'solar') {
      return ['1st', '5th', '9th', '10th'];
    } else {
      return ['4th', '7th', '8th', '12th'];
    }
  }

  /**
   * Generate Prashna (Horary) Astrology analysis
   * @param {Object} questionData - Question details
   * @param {string} questionData.question - The question asked
   * @param {string} questionData.questionTime - Time when question was asked (DD/MM/YYYY HH:MM)
   * @param {string} questionData.questionPlace - Place where question was asked
   * @returns {Object} Prashna analysis
   */
  async generatePrashnaAnalysis(questionData) {
    try {
      const { question, questionTime, questionPlace } = questionData;

      if (!questionTime || !questionPlace) {
        return {
          error: 'Question time and place required for Prashna analysis'
        };
      }

      // Parse question time
      const [datePart, timePart] = questionTime.split(' ');
      const [day, month, year] = datePart.split('/').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);

      // Get coordinates and timezone
      const [latitude, longitude] = await this._getCoordinatesForPlace(questionPlace);
      const questionDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = questionDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Generate horary chart
      const horaryChart = await this._generateHoraryChart(year, month, day, hour, minute, latitude, longitude, timezone);

      // Analyze the question
      const questionAnalysis = this._analyzePrashnaQuestion(question, horaryChart);

      // Generate predictions
      const predictions = this._generatePrashnaPredictions(horaryChart, questionAnalysis);

      return {
        question,
        questionTime,
        questionPlace,
        horaryChart,
        questionAnalysis,
        predictions,
        summary: this._generatePrashnaSummary(question, horaryChart, predictions)
      };
    } catch (error) {
      logger.error('Error generating Prashna analysis:', error);
      return {
        error: 'Unable to generate Prashna analysis at this time'
      };
    }
  }

  /**
   * Generate horary chart for the question time
   * @private
   * @param {number} year - Question year
   * @param {number} month - Question month
   * @param {number} day - Question day
   * @param {number} hour - Question hour
   * @param {number} minute - Question minute
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} timezone - Timezone
   * @returns {Object} Horary chart data
   */
  async _generateHoraryChart(year, month, day, hour, minute, latitude, longitude, timezone) {
    try {
      const astroData = {
        year,
        month,
        date: day,
        hours: hour,
        minutes: minute,
        seconds: 0,
        latitude,
        longitude,
        timezone,
        chartType: 'sidereal'
      };

      const chart = this.astrologer.generateNatalChartData(astroData);

      return {
        lagna: chart.interpretations.risingSign,
        planets: chart.planets,
        houses: chart.houses || {},
        rawChart: chart
      };
    } catch (error) {
      logger.error('Error generating horary chart:', error);
      return {
        lagna: 'Unknown',
        planets: {},
        houses: {}
      };
    }
  }

  /**
   * Analyze the nature of the question
   * @private
   * @param {string} question - The question asked
   * @param {Object} horaryChart - Horary chart data
   * @returns {Object} Question analysis
   */
  _analyzePrashnaQuestion(question, horaryChart) {
    const questionLower = question.toLowerCase();

    // Determine question category
    let category = 'general';
    let significator = 'mercury'; // Mercury rules questions and communication

    if (questionLower.includes('marriage') || questionLower.includes('wedding') || questionLower.includes('spouse')) {
      category = 'marriage';
      significator = 'venus';
    } else if (questionLower.includes('job') || questionLower.includes('career') || questionLower.includes('business')) {
      category = 'career';
      significator = 'sun';
    } else if (questionLower.includes('money') || questionLower.includes('wealth') || questionLower.includes('finance')) {
      category = 'finance';
      significator = 'venus';
    } else if (questionLower.includes('health') || questionLower.includes('illness') || questionLower.includes('disease')) {
      category = 'health';
      significator = 'mars';
    } else if (questionLower.includes('education') || questionLower.includes('study') || questionLower.includes('exam')) {
      category = 'education';
      significator = 'mercury';
    } else if (questionLower.includes('travel') || questionLower.includes('journey') || questionLower.includes('move')) {
      category = 'travel';
      significator = 'moon';
    } else if (questionLower.includes('children') || questionLower.includes('pregnancy') || questionLower.includes('family')) {
      category = 'children';
      significator = 'jupiter';
    }

    // Analyze Moon's position (shows the matter)
    const moonSign = horaryChart.planets.moon?.signName || 'Unknown';
    const moonHouse = horaryChart.planets.moon?.house || 1;

    // Analyze 7th house (shows the answer/opponent)
    const seventhHouseSign = this._getHouseSign(7, horaryChart.lagna);

    // Analyze 10th house (shows the outcome)
    const tenthHouseSign = this._getHouseSign(10, horaryChart.lagna);

    return {
      category,
      significator,
      moonSign,
      moonHouse,
      seventhHouseSign,
      tenthHouseSign,
      questionStrength: this._calculateQuestionStrength(horaryChart, significator)
    };
  }

  /**
   * Get the sign of a specific house
   * @private
   * @param {number} houseNumber - House number (1-12)
   * @param {string} lagnaSign - Lagna sign
   * @returns {string} Sign of the house
   */
  _getHouseSign(houseNumber, lagnaSign) {
    const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const lagnaIndex = signOrder.indexOf(lagnaSign);

    if (lagnaIndex === -1) { return 'Unknown'; }

    const houseIndex = (lagnaIndex + houseNumber - 1) % 12;
    return signOrder[houseIndex];
  }

  /**
   * Calculate the strength of the question
   * @private
   * @param {Object} horaryChart - Horary chart
   * @param {string} significator - Question significator
   * @returns {string} Strength level
   */
  _calculateQuestionStrength(horaryChart, significator) {
    let strength = 0;

    // Check if significator is well-placed
    const sigPlanet = horaryChart.planets[significator];
    if (sigPlanet) {
      // In own sign or exalted
      if (sigPlanet.dignity && (sigPlanet.dignity.includes('Own Sign') || sigPlanet.dignity.includes('Exalted'))) {
        strength += 2;
      }

      // In kendra houses (1, 4, 7, 10)
      if ([1, 4, 7, 10].includes(sigPlanet.house)) {
        strength += 2;
      }

      // In trikona houses (1, 5, 9)
      if ([1, 5, 9].includes(sigPlanet.house)) {
        strength += 1;
      }
    }

    // Check Moon's strength
    const { moon } = horaryChart.planets;
    if (moon && moon.dignity && (moon.dignity.includes('Own Sign') || moon.dignity.includes('Exalted'))) {
      strength += 1;
    }

    if (strength >= 4) { return 'Strong'; }
    if (strength >= 2) { return 'Medium'; }
    return 'Weak';
  }

  /**
   * Generate predictions based on horary chart
   * @private
   * @param {Object} horaryChart - Horary chart
   * @param {Object} questionAnalysis - Question analysis
   * @returns {Object} Predictions
   */
  _generatePrashnaPredictions(horaryChart, questionAnalysis) {
    const { category, significator, moonHouse, seventhHouseSign, tenthHouseSign } = questionAnalysis;

    const predictions = {
      outcome: '',
      timing: '',
      conditions: [],
      advice: ''
    };

    // Analyze outcome based on 10th house and significator
    const sigPlanet = horaryChart.planets[significator];
    const tenthHousePlanet = this._getHousePlanet(10, horaryChart);

    if (sigPlanet && [1, 4, 7, 10].includes(sigPlanet.house)) {
      predictions.outcome = 'Favorable outcome likely';
      predictions.conditions.push('Strong planetary support');
    } else if (sigPlanet && [6, 8, 12].includes(sigPlanet.house)) {
      predictions.outcome = 'Challenges and delays expected';
      predictions.conditions.push('Planetary obstacles present');
    } else {
      predictions.outcome = 'Mixed results, depends on other factors';
      predictions.conditions.push('Neutral planetary influences');
    }

    // Timing analysis
    predictions.timing = this._analyzePrashnaTiming(horaryChart, category);

    // Category-specific predictions
    switch (category) {
    case 'marriage':
      predictions.advice = this._getMarriagePrashnaAdvice(horaryChart, questionAnalysis);
      break;
    case 'career':
      predictions.advice = this._getCareerPrashnaAdvice(horaryChart, questionAnalysis);
      break;
    case 'finance':
      predictions.advice = this._getFinancePrashnaAdvice(horaryChart, questionAnalysis);
      break;
    case 'health':
      predictions.advice = this._getHealthPrashnaAdvice(horaryChart, questionAnalysis);
      break;
    default:
      predictions.advice = 'Consult additional factors and maintain positive attitude';
    }

    return predictions;
  }

  /**
   * Analyze timing from horary chart
   * @private
   * @param {Object} horaryChart - Horary chart
   * @param {string} category - Question category
   * @returns {string} Timing prediction
   */
  _analyzePrashnaTiming(horaryChart, category) {
    // Simplified timing based on Moon's position
    const moonHouse = horaryChart.planets.moon?.house || 1;

    const timingMap = {
      1: 'Very soon (within days)',
      2: 'Within 1-2 months',
      3: 'Within 3-6 months',
      4: 'Within 6-12 months',
      5: 'Within 1-2 years',
      6: 'Delayed, possible obstacles',
      7: 'Within 1-2 months',
      8: 'Delayed, transformative period',
      9: 'Within 6-12 months',
      10: 'Within 3-6 months',
      11: 'Soon, within weeks',
      12: 'Delayed, spiritual preparation needed'
    };

    return timingMap[moonHouse] || 'Timing unclear, depends on other factors';
  }

  /**
   * Get house planet
   * @private
   * @param {number} houseNumber - House number
   * @param {Object} horaryChart - Horary chart
   * @returns {Object|null} Planet in the house
   */
  _getHousePlanet(houseNumber, horaryChart) {
    return Object.values(horaryChart.planets).find(planet => planet.house === houseNumber) || null;
  }

  /**
   * Get marriage-specific Prashna advice
   * @private
   * @param {Object} horaryChart - Horary chart
   * @param {Object} questionAnalysis - Question analysis
   * @returns {string} Marriage advice
   */
  _getMarriagePrashnaAdvice(horaryChart, questionAnalysis) {
    const { venus } = horaryChart.planets;
    const { seventhHouseSign } = questionAnalysis;

    if (venus && [1, 4, 7, 10].includes(venus.house)) {
      return 'Good prospects for marriage. Venus is well-placed indicating harmony and love.';
    } else if (venus && [6, 8, 12].includes(venus.house)) {
      return 'Challenges in marriage matters. Consider remedies and patience.';
    }

    return 'Marriage prospects are moderate. Focus on personal growth and timing.';
  }

  /**
   * Get career-specific Prashna advice
   * @private
   * @param {Object} horaryChart - Horary chart
   * @param {Object} questionAnalysis - Question analysis
   * @returns {string} Career advice
   */
  _getCareerPrashnaAdvice(horaryChart, questionAnalysis) {
    const { sun } = horaryChart.planets;
    const { tenthHouseSign } = questionAnalysis;

    if (sun && [1, 4, 7, 10].includes(sun.house)) {
      return 'Strong career prospects. Sun indicates success and recognition.';
    } else if (sun && [6, 8, 12].includes(sun.house)) {
      return 'Career challenges ahead. Consider skill development and networking.';
    }

    return 'Career prospects are developing. Focus on consistent effort and learning.';
  }

  /**
   * Get finance-specific Prashna advice
   * @private
   * @param {Object} horaryChart - Horary chart
   * @param {Object} questionAnalysis - Question analysis
   * @returns {string} Finance advice
   */
  _getFinancePrashnaAdvice(horaryChart, questionAnalysis) {
    const { jupiter } = horaryChart.planets;
    const { venus } = horaryChart.planets;

    if ((jupiter && [1, 4, 7, 10].includes(jupiter.house)) ||
        (venus && [1, 4, 7, 10].includes(venus.house))) {
      return 'Good financial prospects. Jupiter/Venus indicate prosperity and gains.';
    } else if ((jupiter && [6, 8, 12].includes(jupiter.house)) ||
               (venus && [6, 8, 12].includes(venus.house))) {
      return 'Financial challenges. Practice caution with investments and expenses.';
    }

    return 'Financial situation is stable but requires careful management.';
  }

  /**
   * Get health-specific Prashna advice
   * @private
   * @param {Object} horaryChart - Horary chart
   * @param {Object} questionAnalysis - Question analysis
   * @returns {string} Health advice
   */
  _getHealthPrashnaAdvice(horaryChart, questionAnalysis) {
    const { mars } = horaryChart.planets;
    const { saturn } = horaryChart.planets;

    if (mars && [6, 8, 12].includes(mars.house)) {
      return 'Health concerns possible. Mars indicates energy and potential illness.';
    } else if (saturn && [6, 8, 12].includes(saturn.house)) {
      return 'Chronic health issues. Saturn suggests long-term conditions.';
    }

    return 'Health is generally good. Maintain healthy lifestyle and regular check-ups.';
  }

  /**
   * Generate Prashna summary
   * @private
   * @param {string} question - Original question
   * @param {Object} horaryChart - Horary chart
   * @param {Object} predictions - Predictions
   * @returns {string} Summary text
   */
  _generatePrashnaSummary(question, horaryChart, predictions) {
    let summary = '🕉️ *Prashna Astrology Analysis*\n\n';
    summary += `*Question:* ${question}\n\n`;
    summary += `*Horary Lagna:* ${horaryChart.lagna}\n`;
    summary += `*Moon Position:* ${horaryChart.planets.moon?.signName || 'Unknown'} (${horaryChart.planets.moon?.house || 'Unknown'}th house)\n\n`;

    summary += `*Outcome:* ${predictions.outcome}\n`;
    summary += `*Timing:* ${predictions.timing}\n\n`;

    if (predictions.conditions.length > 0) {
      summary += '*Key Factors:*\n';
      predictions.conditions.forEach(condition => {
        summary += `• ${condition}\n`;
      });
      summary += '\n';
    }

    summary += `*Advice:* ${predictions.advice}\n\n`;
    summary += 'Remember: Prashna answers are specific to the question timing and should be considered along with your birth chart. 🕉️';

    return summary;
  }

  /**
   * Generate Ashtakavarga analysis
   * @param {Object} birthData - User's birth data
   * @returns {Object} Ashtakavarga analysis
   */
  async generateAshtakavarga(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return {
          error: 'Complete birth details required for Ashtakavarga analysis'
        };
      }

      // Generate birth chart
      const kundli = await this.generateVedicKundli(birthData);
      if (kundli.error) {
        return { error: kundli.error };
      }

      // Calculate Ashtakavarga for each planet
      const ashtakavarga = {
        sun: this._calculatePlanetAshtakavarga('sun', kundli),
        moon: this._calculatePlanetAshtakavarga('moon', kundli),
        mars: this._calculatePlanetAshtakavarga('mars', kundli),
        mercury: this._calculatePlanetAshtakavarga('mercury', kundli),
        jupiter: this._calculatePlanetAshtakavarga('jupiter', kundli),
        venus: this._calculatePlanetAshtakavarga('venus', kundli),
        saturn: this._calculatePlanetAshtakavarga('saturn', kundli)
      };

      // Calculate Trikona Shodhana (triangle reduction)
      const trikonaShodhana = this._calculateTrikonaShodhana(ashtakavarga);

      // Calculate Ekadhipatya (sole lordship)
      const ekadhipatya = this._calculateEkadhipatya(ashtakavarga);

      // Generate overall analysis
      const analysis = this._analyzeAshtakavargaStrength(ashtakavarga, trikonaShodhana, ekadhipatya);

      return {
        name,
        ashtakavarga,
        trikonaShodhana,
        ekadhipatya,
        analysis,
        summary: this._generateAshtakavargaSummary(ashtakavarga, analysis)
      };
    } catch (error) {
      logger.error('Error generating Ashtakavarga:', error);
      return {
        error: 'Unable to generate Ashtakavarga analysis at this time'
      };
    }
  }

  /**
   * Calculate Ashtakavarga for a specific planet
   * @private
   * @param {string} planet - Planet name
   * @param {Object} kundli - Kundli data
   * @returns {Object} Ashtakavarga data for the planet
   */
  _calculatePlanetAshtakavarga(planet, kundli) {
    const binduChart = this._getPlanetBinduChart(planet);
    const planetPositions = kundli.planetaryPositions;

    const bindus = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0
    };

    // Calculate bindus for each house based on planetary positions
    Object.entries(planetPositions).forEach(([planetName, position]) => {
      if (position && position.house) {
        const { house } = position;
        const binduValue = binduChart[planetName.toLowerCase()] || 0;
        bindus[house] = (bindus[house] || 0) + binduValue;
      }
    });

    // Calculate total bindus
    const totalBindus = Object.values(bindus).reduce((sum, bindu) => sum + bindu, 0);

    return {
      planet: planet.charAt(0).toUpperCase() + planet.slice(1),
      bindus,
      totalBindus,
      averageBindus: Math.round((totalBindus / 12) * 10) / 10,
      strength: this._interpretAshtakavargaStrength(totalBindus)
    };
  }

  /**
   * Get bindu chart for a planet (simplified version)
   * @private
   * @param {string} planet - Planet name
   * @returns {Object} Bindu values for each planet from each house
   */
  _getPlanetBinduChart(planet) {
    // Simplified Ashtakavarga bindu charts
    const binduCharts = {
      sun: {
        sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1,
        rahu: 0, ketu: 0
      },
      moon: {
        sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1,
        rahu: 0, ketu: 0
      },
      mars: {
        sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1,
        rahu: 0, ketu: 0
      },
      mercury: {
        sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1,
        rahu: 0, ketu: 0
      },
      jupiter: {
        sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1,
        rahu: 0, ketu: 0
      },
      venus: {
        sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1,
        rahu: 0, ketu: 0
      },
      saturn: {
        sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1,
        rahu: 0, ketu: 0
      }
    };

    return binduCharts[planet.toLowerCase()] || {};
  }

  /**
   * Interpret Ashtakavarga strength
   * @private
   * @param {number} totalBindus - Total bindus
   * @returns {string} Strength interpretation
   */
  _interpretAshtakavargaStrength(totalBindus) {
    if (totalBindus >= 30) { return 'Exceptionally Strong'; }
    if (totalBindus >= 25) { return 'Very Strong'; }
    if (totalBindus >= 20) { return 'Strong'; }
    if (totalBindus >= 15) { return 'Moderate'; }
    if (totalBindus >= 10) { return 'Weak'; }
    return 'Very Weak';
  }

  /**
   * Calculate Trikona Shodhana (Triangle reduction)
   * @private
   * @param {Object} ashtakavarga - Ashtakavarga data
   * @returns {Object} Trikona Shodhana results
   */
  _calculateTrikonaShodhana(ashtakavarga) {
    const trikonaHouses = [
      [1, 5, 9], // Dharma Trikona
      [2, 6, 10], // Artha Trikona
      [3, 7, 11], // Kama Trikona
      [4, 8, 12]  // Moksha Trikona
    ];

    const trikonaResults = {};

    trikonaHouses.forEach((trikona, index) => {
      const trikonaName = ['Dharma', 'Artha', 'Kama', 'Moksha'][index];
      const planetBindus = {};

      // Sum bindus for each planet in this trikona
      Object.entries(ashtakavarga).forEach(([planet, data]) => {
        const trikonaBindus = trikona.reduce((sum, house) => sum + (data.bindus[house] || 0), 0);
        planetBindus[planet] = trikonaBindus;
      });

      // Find planet with maximum bindus in this trikona
      const maxPlanet = Object.entries(planetBindus).reduce((max, [planet, bindus]) =>
        (bindus > (planetBindus[max] || 0) ? planet : max)
      );

      trikonaResults[trikonaName] = {
        houses: trikona,
        lord: maxPlanet.charAt(0).toUpperCase() + maxPlanet.slice(1),
        bindus: planetBindus[maxPlanet],
        significance: this._getTrikonaSignificance(trikonaName)
      };
    });

    return trikonaResults;
  }

  /**
   * Get significance of each Trikona
   * @private
   * @param {string} trikona - Trikona name
   * @returns {string} Significance
   */
  _getTrikonaSignificance(trikona) {
    const significances = {
      Dharma: 'Righteousness, duty, spiritual growth',
      Artha: 'Wealth, prosperity, material success',
      Kama: 'Desire, pleasure, relationships',
      Moksha: 'Liberation, enlightenment, spiritual freedom'
    };

    return significances[trikona] || 'General life areas';
  }

  /**
   * Calculate Ekadhipatya (Sole lordship)
   * @private
   * @param {Object} ashtakavarga - Ashtakavarga data
   * @returns {Object} Ekadhipatya results
   */
  _calculateEkadhipatya(ashtakavarga) {
    const ekadhipatya = {};

    // For each house, find which planet has the highest bindus
    for (let house = 1; house <= 12; house++) {
      let maxBindus = -1;
      let lord = 'None';

      Object.entries(ashtakavarga).forEach(([planet, data]) => {
        const bindus = data.bindus[house] || 0;
        if (bindus > maxBindus) {
          maxBindus = bindus;
          lord = planet.charAt(0).toUpperCase() + planet.slice(1);
        }
      });

      ekadhipatya[house] = {
        house,
        lord,
        bindus: maxBindus,
        strength: maxBindus >= 4 ? 'Strong' : maxBindus >= 2 ? 'Moderate' : 'Weak'
      };
    }

    return ekadhipatya;
  }

  /**
   * Analyze overall Ashtakavarga strength
   * @private
   * @param {Object} ashtakavarga - Ashtakavarga data
   * @param {Object} trikonaShodhana - Trikona Shodhana
   * @param {Object} ekadhipatya - Ekadhipatya
   * @returns {Object} Overall analysis
   */
  _analyzeAshtakavargaStrength(ashtakavarga, trikonaShodhana, ekadhipatya) {
    const analysis = {
      overallStrength: 'Moderate',
      strongPlanets: [],
      weakPlanets: [],
      favorableHouses: [],
      challengingHouses: [],
      recommendations: []
    };

    // Analyze planet strengths
    Object.entries(ashtakavarga).forEach(([planet, data]) => {
      if (data.totalBindus >= 25) {
        analysis.strongPlanets.push(planet.charAt(0).toUpperCase() + planet.slice(1));
      } else if (data.totalBindus <= 15) {
        analysis.weakPlanets.push(planet.charAt(0).toUpperCase() + planet.slice(1));
      }
    });

    // Analyze house strengths
    Object.values(ekadhipatya).forEach(houseData => {
      if (houseData.strength === 'Strong') {
        analysis.favorableHouses.push(houseData.house);
      } else if (houseData.strength === 'Weak') {
        analysis.challengingHouses.push(houseData.house);
      }
    });

    // Overall assessment
    const strongPlanetCount = analysis.strongPlanets.length;
    if (strongPlanetCount >= 5) { analysis.overallStrength = 'Very Strong'; } else if (strongPlanetCount >= 3) { analysis.overallStrength = 'Strong'; } else if (strongPlanetCount <= 1) { analysis.overallStrength = 'Weak'; }

    // Generate recommendations
    analysis.recommendations = this._generateAshtakavargaRecommendations(analysis);

    return analysis;
  }

  /**
   * Generate Ashtakavarga recommendations
   * @private
   * @param {Object} analysis - Analysis data
   * @returns {Array} Recommendations
   */
  _generateAshtakavargaRecommendations(analysis) {
    const recommendations = [];

    if (analysis.strongPlanets.length > 0) {
      recommendations.push(`Focus on areas ruled by strong planets: ${analysis.strongPlanets.join(', ')}`);
    }

    if (analysis.weakPlanets.length > 0) {
      recommendations.push(`Strengthen areas ruled by weak planets: ${analysis.weakPlanets.join(', ')} through spiritual practices`);
    }

    if (analysis.favorableHouses.length > 0) {
      recommendations.push(`Favorable life areas (houses): ${analysis.favorableHouses.join(', ')}`);
    }

    if (analysis.challengingHouses.length > 0) {
      recommendations.push(`Areas needing attention (houses): ${analysis.challengingHouses.join(', ')}`);
    }

    return recommendations;
  }

  /**
   * Generate Ashtakavarga summary
   * @private
   * @param {Object} ashtakavarga - Ashtakavarga data
   * @param {Object} analysis - Analysis
   * @returns {string} Summary text
   */
  _generateAshtakavargaSummary(ashtakavarga, analysis) {
    let summary = '🕉️ *Ashtakavarga Analysis*\n\n';
    summary += `*Overall Strength:* ${analysis.overallStrength}\n\n`;

    summary += '*Planetary Strengths:*\n';
    Object.entries(ashtakavarga).forEach(([planet, data]) => {
      summary += `• ${data.planet}: ${data.totalBindus} bindus (${data.strength})\n`;
    });
    summary += '\n';

    if (analysis.strongPlanets.length > 0) {
      summary += `*Strong Planets:* ${analysis.strongPlanets.join(', ')}\n`;
    }

    if (analysis.weakPlanets.length > 0) {
      summary += `*Planets Needing Attention:* ${analysis.weakPlanets.join(', ')}\n`;
    }

    summary += '\n*Key Insights:*\n';
    analysis.recommendations.forEach(rec => {
      summary += `• ${rec}\n`;
    });

    summary += '\nAshtakavarga shows the 8-fold strength of planets across 12 houses, indicating favorable periods and life areas. 🕉️';

    return summary;
  }

  /**
   * Generate Varga (Divisional) Charts analysis
   * @param {Object} birthData - User's birth data
   * @returns {Object} Varga charts analysis
   */
  async generateVargaCharts(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return {
          error: 'Complete birth details required for Varga Charts analysis'
        };
      }

      // Generate main birth chart
      const mainChart = await this.generateVedicKundli(birthData);
      if (mainChart.error) {
        return { error: mainChart.error };
      }

      // Generate all Varga charts
      const vargaCharts = {
        d9: this._generateVargaChart(mainChart, 9, 'Navamsa'),
        d10: this._generateVargaChart(mainChart, 10, 'Dashamsa'),
        d12: this._generateVargaChart(mainChart, 12, 'Dwadasamsa'),
        d16: this._generateVargaChart(mainChart, 16, 'Shodasamsa'),
        d24: this._generateVargaChart(mainChart, 24, 'Chaturvimsamsa'),
        d30: this._generateVargaChart(mainChart, 30, 'Trimsamsa')
      };

      // Analyze each Varga chart
      const analysis = this._analyzeVargaCharts(vargaCharts, mainChart);

      return {
        name,
        mainChart: {
          lagna: mainChart.lagna,
          planetaryPositions: mainChart.planetaryPositions
        },
        vargaCharts,
        analysis,
        summary: this._generateVargaSummary(vargaCharts, analysis)
      };
    } catch (error) {
      logger.error('Error generating Varga Charts:', error);
      return {
        error: 'Unable to generate Varga Charts analysis at this time'
      };
    }
  }

  /**
   * Generate a specific Varga chart
   * @private
   * @param {Object} mainChart - Main birth chart
   * @param {number} division - Division number (9, 10, 12, etc.)
   * @param {string} name - Name of the Varga chart
   * @returns {Object} Varga chart data
   */
  _generateVargaChart(mainChart, division, name) {
    const vargaChart = {
      name,
      division,
      lagna: this._calculateVargaLagna(mainChart.lagna, division),
      houses: {},
      planetaryPositions: {},
      significance: this._getVargaSignificance(division)
    };

    // Calculate Varga positions for all planets
    Object.entries(mainChart.planetaryPositions).forEach(([planetName, position]) => {
      vargaChart.planetaryPositions[planetName] = {
        ...position,
        vargaSign: this._calculateVargaPosition(position.sign, position.longitude || 0, division),
        vargaHouse: this._calculateVargaHouse(vargaChart.lagna, position.longitude || 0, division)
      };
    });

    // Calculate houses
    for (let i = 1; i <= 12; i++) {
      const houseSign = this._getHouseSign(i, vargaChart.lagna);
      vargaChart.houses[i] = {
        number: i,
        sign: houseSign,
        lord: this._getHouseLord(houseSign),
        planets: this._getPlanetsInVargaHouse(vargaChart.planetaryPositions, i)
      };
    }

    return vargaChart;
  }

  /**
   * Calculate Varga Lagna (Ascendant)
   * @private
   * @param {string} mainLagna - Main chart Lagna
   * @param {number} division - Division number
   * @returns {string} Varga Lagna sign
   */
  _calculateVargaLagna(mainChart, division) {
    // This is a simplified calculation. In a real-world scenario, this would involve
    // more complex calculations based on the specific Varga chart rules and planetary longitudes.
    // For now, we'll keep the existing simplified logic.
    const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const lagnaIndex = signOrder.indexOf(mainChart.lagna);

    if (lagnaIndex === -1) { return mainChart.lagna; }

    // For Navamsa (D-9), each sign is divided into 9 parts
    // This is a simplified calculation
    const vargaIndex = Math.floor((lagnaIndex * division) / 12) % 12;
    return signOrder[vargaIndex];
  }

  /**
   * Calculate Varga position for a planet
   * @private
   * @param {string} sign - Current sign
   * @param {number} longitude - Longitude in degrees
   * @param {number} division - Division number
   * @returns {string} Varga sign
   */
  _calculateVargaPosition(sign, longitude, division) {
    // This is a simplified Varga calculation. In a real-world scenario, this would involve
    // more complex calculations based on the specific Varga chart rules and planetary longitudes.
    // For now, we'll keep the existing simplified logic.
    const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = signOrder.indexOf(sign);

    if (signIndex === -1) { return sign; }

    // Calculate which part of the sign the planet is in
    const degreesInSign = longitude % 30;
    const vargaPart = Math.floor((degreesInSign / 30) * division);

    // Each Varga division corresponds to a sign
    const vargaSignIndex = (signIndex * division + vargaPart) % 12;
    return signOrder[vargaSignIndex];
  }

  /**
   * Calculate Varga house for a planet
   * @private
   * @param {string} vargaLagna - Varga Lagna
   * @param {number} longitude - Planet longitude
   * @param {number} division - Division number
   * @returns {number} Varga house (1-12)
   */
  _calculateVargaHouse(vargaLagna, longitude, division) {
    const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const lagnaIndex = signOrder.indexOf(vargaLagna);
    const planetSign = this._calculateVargaPosition('Aries', longitude, division); // Simplified
    const planetIndex = signOrder.indexOf(planetSign);

    if (lagnaIndex === -1 || planetIndex === -1) { return 1; }

    const house = ((planetIndex - lagnaIndex + 12) % 12) + 1;
    return house;
  }

  /**
   * Get planets in a specific Varga house
   * @private
   * @param {Object} planetaryPositions - Varga planetary positions
   * @param {number} houseNumber - House number
   * @returns {Array} Planets in the house
   */
  _getPlanetsInVargaHouse(planetaryPositions, houseNumber) {
    return Object.entries(planetaryPositions)
      .filter(([planet, position]) => position.vargaHouse === houseNumber)
      .map(([planet, position]) => planet.charAt(0).toUpperCase() + planet.slice(1));
  }

  /**
   * Get significance of each Varga chart
   * @private
   * @param {number} division - Division number
   * @returns {Object} Significance details
   */
  _getVargaSignificance(division) {
    const significances = {
      9: {
        name: 'Navamsa (D-9)',
        purpose: 'Marriage, spouse, spiritual life, dharma',
        importance: 'Most important Varga chart, shows life partner and spiritual progress',
        houses: {
          1: 'Self in marriage',
          2: 'Family in marriage',
          5: 'Children',
          7: 'Spouse',
          9: 'Spiritual life, dharma'
        }
      },
      10: {
        name: 'Dashamsa (D-10)',
        purpose: 'Career, profession, authority, public image',
        importance: 'Shows professional success and career path',
        houses: {
          1: 'Professional self',
          2: 'Work environment',
          6: 'Service, subordinates',
          10: 'Career, reputation, authority'
        }
      },
      12: {
        name: 'Dwadasamsa (D-12)',
        purpose: 'Parents, ancestry, spiritual practices',
        importance: 'Reveals parental influence and spiritual heritage',
        houses: {
          4: 'Mother, home',
          9: 'Father, guru',
          12: 'Spirituality, foreign lands'
        }
      },
      16: {
        name: 'Shodasamsa (D-16)',
        purpose: 'Vehicles, pleasures, happiness, comforts',
        importance: 'Shows material comforts and vehicles',
        houses: {
          4: 'Home comforts',
          3: 'Vehicles, short journeys',
          11: 'Gains, elder siblings'
        }
      },
      24: {
        name: 'Chaturvimsamsa (D-24)',
        purpose: 'Education, learning, knowledge, intelligence',
        importance: 'Reveals educational achievements and learning ability',
        houses: {
          2: 'Speech, early education',
          4: 'Higher education',
          5: 'Intelligence, creativity',
          9: 'Higher knowledge, wisdom'
        }
      },
      30: {
        name: 'Trimsamsa (D-30)',
        purpose: 'Misfortunes, health issues, enemies, obstacles',
        importance: 'Shows challenges, health problems, and how to overcome them',
        houses: {
          6: 'Enemies, diseases',
          8: 'Misfortunes, chronic issues',
          12: 'Losses, expenses'
        }
      }
    };

    return significances[division] || { name: `D-${division}`, purpose: 'General analysis', importance: 'Specialized life area analysis' };
  }

  /**
   * Analyze all Varga charts
   * @private
   * @param {Object} vargaCharts - All Varga charts
   * @param {Object} mainChart - Main birth chart
   * @returns {Object} Comprehensive analysis
   */
  _analyzeVargaCharts(vargaCharts, mainChart) {
    const analysis = {
      overallStrength: 'Moderate',
      keyInsights: [],
      recommendations: [],
      chartStrengths: {}
    };

    // Analyze each Varga chart
    Object.entries(vargaCharts).forEach(([key, chart]) => {
      const chartAnalysis = this._analyzeSingleVargaChart(chart, mainChart);
      analysis.chartStrengths[key] = chartAnalysis;

      if (chartAnalysis.strength === 'Strong') {
        analysis.keyInsights.push(`${chart.name}: ${chart.significance.purpose} shows favorable indications`);
      } else if (chartAnalysis.strength === 'Weak') {
        analysis.keyInsights.push(`${chart.name}: ${chart.significance.purpose} may present challenges`);
      }
    });

    // Overall assessment
    const strongCharts = Object.values(analysis.chartStrengths).filter(c => c.strength === 'Strong').length;
    if (strongCharts >= 4) { analysis.overallStrength = 'Strong'; } else if (strongCharts <= 2) { analysis.overallStrength = 'Needs Attention'; }

    // Generate recommendations
    analysis.recommendations = this._generateVargaRecommendations(analysis);

    return analysis;
  }

  /**
   * Analyze a single Varga chart
   * @private
   * @param {Object} vargaChart - Single Varga chart
   * @param {Object} mainChart - Main chart
   * @returns {Object} Chart analysis
   */
  _analyzeSingleVargaChart(vargaChart, mainChart) {
    const analysis = {
      strength: 'Moderate',
      favorableFactors: [],
      challengingFactors: [],
      keyPlanets: []
    };

    // Check Lagna lord strength
    const lagnaLord = vargaChart.houses[1].lord;
    const lagnaLordPosition = vargaChart.planetaryPositions[lagnaLord.toLowerCase()];

    if (lagnaLordPosition && [1, 4, 7, 10].includes(lagnaLordPosition.vargaHouse)) {
      analysis.favorableFactors.push('Strong Lagna lord placement');
      analysis.strength = 'Strong';
    }

    // Check benefic planets in favorable houses
    const beneficPlanets = ['venus', 'jupiter'];
    beneficPlanets.forEach(planet => {
      const position = vargaChart.planetaryPositions[planet];
      if (position && [1, 4, 5, 7, 9, 10].includes(position.vargaHouse)) {
        analysis.favorableFactors.push(`${planet.charAt(0).toUpperCase() + planet.slice(1)} well-placed`);
      }
    });

    // Check malefic planets in challenging houses
    const maleficPlanets = ['mars', 'saturn'];
    maleficPlanets.forEach(planet => {
      const position = vargaChart.planetaryPositions[planet];
      if (position && [6, 8, 12].includes(position.vargaHouse)) {
        analysis.challengingFactors.push(`${planet.charAt(0).toUpperCase() + planet.slice(1)} in challenging position`);
        if (analysis.strength === 'Strong') { analysis.strength = 'Moderate'; }
      }
    });

    // Identify key planets
    Object.entries(vargaChart.planetaryPositions).forEach(([planet, position]) => {
      if (position.vargaHouse === 1 || position.vargaHouse === 10) {
        analysis.keyPlanets.push(`${planet.charAt(0).toUpperCase() + planet.slice(1)} (${position.vargaHouse}th house)`);
      }
    });

    if (analysis.favorableFactors.length === 0 && analysis.challengingFactors.length > 0) {
      analysis.strength = 'Weak';
    }

    return analysis;
  }

  /**
   * Generate Varga recommendations
   * @private
   * @param {Object} analysis - Overall analysis
   * @returns {Array} Recommendations
   */
  _generateVargaRecommendations(analysis) {
    const recommendations = [];

    if (analysis.overallStrength === 'Strong') {
      recommendations.push('Overall favorable Varga chart combinations indicate good life balance');
    } else {
      recommendations.push('Some Varga charts need strengthening through spiritual practices');
    }

    // Specific recommendations based on chart strengths
    Object.entries(analysis.chartStrengths).forEach(([key, chartAnalysis]) => {
      const chartName = key.toUpperCase();
      if (chartAnalysis.strength === 'Weak') {
        switch (key) {
        case 'd9':
          recommendations.push('Strengthen Navamsa through marriage-related spiritual practices');
          break;
        case 'd10':
          recommendations.push('Focus on career development and professional growth');
          break;
        case 'd12':
          recommendations.push('Honor ancestors and strengthen parental relationships');
          break;
        }
      }
    });

    return recommendations;
  }

  /**
   * Generate Varga Charts summary
   * @private
   * @param {Object} vargaCharts - All Varga charts
   * @param {Object} analysis - Analysis
   * @returns {string} Summary text
   */
  _generateVargaSummary(vargaCharts, analysis) {
    let summary = '🕉️ *Varga (Divisional) Charts Analysis*\n\n';
    summary += `*Overall Varga Strength:* ${analysis.overallStrength}\n\n`;

    summary += '*Varga Charts Overview:*\n';
    Object.entries(vargaCharts).forEach(([key, chart]) => {
      const chartAnalysis = analysis.chartStrengths[key];
      summary += `• ${chart.name} (D-${chart.division}): ${chart.significance.purpose}\n`;
      summary += `  - Strength: ${chartAnalysis.strength}\n`;
      if (chartAnalysis.keyPlanets.length > 0) {
        summary += `  - Key Planets: ${chartAnalysis.keyPlanets.join(', ')}\n`;
      }
      summary += '\n';
    });

    if (analysis.keyInsights.length > 0) {
      summary += '*Key Insights:*\n';
      analysis.keyInsights.forEach(insight => {
        summary += `• ${insight}\n`;
      });
      summary += '\n';
    }

    if (analysis.recommendations.length > 0) {
      summary += '*Recommendations:*\n';
      analysis.recommendations.forEach(rec => {
        summary += `• ${rec}\n`;
      });
    }

    summary += '\nVarga charts provide specialized analysis for different life areas in Vedic astrology. 🕉️';

    return summary;
  }

  /**
   * Generate Shadbala (6-Fold Strength) analysis
   * @param {Object} birthData - User's birth data
   * @returns {Object} Shadbala analysis
   */
  async generateShadbala(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return {
          error: 'Complete birth details required for Shadbala analysis'
        };
      }

      // Generate birth chart
      const kundli = await this.generateVedicKundli(birthData);
      if (kundli.error) {
        return { error: kundli.error };
      }

      // Calculate Shadbala for each planet
      const shadbala = {
        sun: this._calculatePlanetShadbala('sun', kundli),
        moon: this._calculatePlanetShadbala('moon', kundli),
        mars: this._calculatePlanetShadbala('mars', kundli),
        mercury: this._calculatePlanetShadbala('mercury', kundli),
        jupiter: this._calculatePlanetShadbala('jupiter', kundli),
        venus: this._calculatePlanetShadbala('venus', kundli),
        saturn: this._calculatePlanetShadbala('saturn', kundli)
      };

      // Calculate total Shadbala and rankings
      const totalAnalysis = this._analyzeTotalShadbala(shadbala);

      return {
        name,
        shadbala,
        totalAnalysis,
        summary: this._generateShadbalaSummary(shadbala, totalAnalysis)
      };
    } catch (error) {
      logger.error('Error generating Shadbala:', error);
      return {
        error: 'Unable to generate Shadbala analysis at this time'
      };
    }
  }

  /**
   * Calculate Shadbala for a specific planet
   * @private
   * @param {string} planet - Planet name
   * @param {Object} kundli - Kundli data
   * @returns {Object} Shadbala breakdown for the planet
   */
  _calculatePlanetShadbala(planet, kundli) {
    const planetData = kundli.planetaryPositions[planet];
    if (!planetData) {
      return {
        planet: planet.charAt(0).toUpperCase() + planet.slice(1),
        totalBala: 0,
        percentage: 0,
        strength: 'No Data',
        breakdown: {
          sthanaBala: 0,
          digBala: 0,
          kalaBala: 0,
          chestaBala: 0,
          naisargikaBala: 0,
          drikBala: 0
        }
      };
    }

    // Calculate each type of Bala
    const sthanaBala = this._calculateSthanaBala(planet, planetData, kundli);
    const digBala = this._calculateDigBala(planet, planetData);
    const kalaBala = this._calculateKalaBala(planet, kundli.birthDetails);
    const chestaBala = this._calculateChestaBala(planet, planetData);
    const naisargikaBala = this._calculateNaisargikaBala(planet);
    const drikBala = this._calculateDrikBala(planet, kundli.planetaryPositions);

    const totalBala = sthanaBala + digBala + kalaBala + chestaBala + naisargikaBala + drikBala;
    const maxBala = 60; // Maximum possible Shadbala (10 points each × 6)
    const percentage = Math.round((totalBala / maxBala) * 100);

    return {
      planet: planet.charAt(0).toUpperCase() + planet.slice(1),
      totalBala: Math.round(totalBala * 10) / 10,
      percentage,
      strength: this._interpretShadbalaStrength(percentage),
      breakdown: {
        sthanaBala: Math.round(sthanaBala * 10) / 10,
        digBala: Math.round(digBala * 10) / 10,
        kalaBala: Math.round(kalaBala * 10) / 10,
        chestaBala: Math.round(chestaBala * 10) / 10,
        naisargikaBala: Math.round(naisargikaBala * 10) / 10,
        drikBala: Math.round(drikBala * 10) / 10
      }
    };
  }

  /**
   * Calculate Sthana Bala (Positional Strength)
   * @private
   * @param {string} planet - Planet name
   * @param {Object} planetData - Planet position data
   * @param {Object} kundli - Kundli data
   * @returns {number} Sthana Bala score
   */
  _calculateSthanaBala(planet, planetData, kundli) {
    let bala = 0;

    // Uccha Bala (exaltation strength)
    const ucchaBala = this._calculateUcchaBala(planet, planetData.sign);
    bala += ucchaBala;

    // Saptavargiya Bala (7-fold strength)
    const saptavargiyaBala = this._calculateSaptavargiyaBala(planet, kundli);
    bala += saptavargiyaBala;

    // Ojhayugma Bala (odd/even sign strength)
    const ojhayugmaBala = this._calculateOjhayugmaBala(planet, planetData.sign);
    bala += ojhayugmaBala;

    // Kendra Bala (angular house strength)
    const kendraBala = this._calculateKendraBala(planetData.house);
    bala += kendraBala;

    return Math.min(bala, 10); // Max 10 points
  }

  /**
   * Calculate Uccha Bala (exaltation strength)
   * @private
   * @param {string} planet - Planet name
   * @param {string} sign - Current sign
   * @returns {number} Uccha Bala score
   */
  _calculateUcchaBala(planet, sign) {
    const exaltationSigns = {
      sun: 'Aries',
      moon: 'Taurus',
      mars: 'Capricorn',
      mercury: 'Virgo',
      jupiter: 'Cancer',
      venus: 'Pisces',
      saturn: 'Libra'
    };

    const debilitationSigns = {
      sun: 'Libra',
      moon: 'Scorpio',
      mars: 'Cancer',
      mercury: 'Pisces',
      jupiter: 'Capricorn',
      venus: 'Virgo',
      saturn: 'Aries'
    };

    if (sign === exaltationSigns[planet]) { return 10; }
    if (sign === debilitationSigns[planet]) { return 0; }

    // Calculate based on distance from exaltation
    const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const exaltationIndex = signOrder.indexOf(exaltationSigns[planet]);
    const currentIndex = signOrder.indexOf(sign);

    if (exaltationIndex === -1 || currentIndex === -1) { return 5; }

    const distance = Math.min(Math.abs(exaltationIndex - currentIndex), 12 - Math.abs(exaltationIndex - currentIndex));
    return Math.max(0, 10 - distance * 0.83); // Gradual decrease
  }

  /**
   * Calculate Saptavargiya Bala (7-fold strength)
   * @private
   * @param {string} planet - Planet name
   * @param {Object} kundli - Kundli data
   * @returns {number} Saptavargiya Bala score
   */
  _calculateSaptavargiyaBala(planet, kundli) {
    // Simplified - would need Varga chart calculations
    // For now, return average strength
    return 5;
  }

  /**
   * Calculate Ojhayugma Bala (odd/even sign strength)
   * @private
   * @param {string} planet - Planet name
   * @param {string} sign - Current sign
   * @returns {number} Ojhayugma Bala score
   */
  _calculateOjhayugmaBala(planet, sign) {
    const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = signOrder.indexOf(sign);

    if (signIndex === -1) { return 5; }

    // Male planets (odd signs) and female planets (even signs)
    const malePlanets = ['sun', 'mars', 'jupiter', 'saturn'];
    const femalePlanets = ['moon', 'venus', 'mercury'];

    const isOddSign = (signIndex + 1) % 2 === 1; // Aries=1(odd), Taurus=2(even), etc.
    const isMalePlanet = malePlanets.includes(planet);

    if ((isMalePlanet && isOddSign) || (!isMalePlanet && !isOddSign)) {
      return 10; // Benefic combination
    } else {
      return 0; // Debilitating combination
    }
  }

  /**
   * Calculate Kendra Bala (angular house strength)
   * @private
   * @param {number} house - House number
   * @returns {number} Kendra Bala score
   */
  _calculateKendraBala(house) {
    const kendraHouses = [1, 4, 7, 10];
    const panaparaHouses = [2, 5, 8, 11];
    const apoklimaHouses = [3, 6, 9, 12];

    if (kendraHouses.includes(house)) { return 10; }
    if (panaparaHouses.includes(house)) { return 5; }
    if (apoklimaHouses.includes(house)) { return 0; }

    return 5;
  }

  /**
   * Calculate Dig Bala (Directional Strength)
   * @private
   * @param {string} planet - Planet name
   * @param {Object} planetData - Planet position data
   * @returns {number} Dig Bala score
   */
  _calculateDigBala(planet, planetData) {
    const directions = {
      sun: 'East',
      moon: 'North-West',
      mars: 'South',
      mercury: 'North',
      jupiter: 'North-East',
      venus: 'South-East',
      saturn: 'West'
    };

    const planetDirection = directions[planet];
    const houseDirections = {
      1: 'East', 2: 'East', 3: 'East', 4: 'North',
      5: 'North', 6: 'North', 7: 'West', 8: 'West',
      9: 'West', 10: 'South', 11: 'South', 12: 'South'
    };

    const houseDirection = houseDirections[planetData.house];

    if (planetDirection === houseDirection) { return 10; }
    return 0;
  }

  /**
   * Calculate Kala Bala (Temporal Strength)
   * @private
   * @param {string} planet - Planet name
   * @param {Object} birthDetails - Birth details
   * @returns {number} Kala Bala score
   */
  _calculateKalaBala(planet, birthDetails) {
    // Simplified - would need detailed temporal calculations
    // Including Ahargana, Chandragrahan, etc.
    return 5; // Average strength for now
  }

  /**
   * Calculate Chesta Bala (Motivational Strength)
   * @private
   * @param {string} planet - Planet name
   * @param {Object} planetData - Planet position data
   * @returns {number} Chesta Bala score
   */
  _calculateChestaBala(planet, planetData) {
    // Based on planet's speed and retrograde status
    // Simplified calculation
    const retrogradePenalty = planetData.retrograde ? 2 : 0;
    return Math.max(0, 10 - retrogradePenalty);
  }

  /**
   * Calculate Naisargika Bala (Natural Strength)
   * @private
   * @param {string} planet - Planet name
   * @returns {number} Naisargika Bala score
   */
  _calculateNaisargikaBala(planet) {
    // Natural strength of planets (out of 10)
    const naturalStrengths = {
      sun: 10,
      moon: 8,
      mars: 7,
      mercury: 6,
      jupiter: 9,
      venus: 5,
      saturn: 4
    };

    return naturalStrengths[planet] || 5;
  }

  /**
   * Calculate Drik Bala (Aspect Strength)
   * @private
   * @param {string} planet - Planet name
   * @param {Object} allPlanets - All planetary positions
   * @returns {number} Drik Bala score
   */
  _calculateDrikBala(planet, allPlanets) {
    // Simplified aspect strength calculation
    let aspectStrength = 0;
    const planetHouse = allPlanets[planet]?.house;

    if (!planetHouse) { return 0; }

    // Check aspects from other planets
    Object.entries(allPlanets).forEach(([otherPlanet, position]) => {
      if (otherPlanet !== planet && position.house) {
        const aspect = this._getAspectBetweenHouses(planetHouse, position.house);
        if (aspect) {
          // Benefic aspects add strength, malefic aspects reduce
          const isBenefic = ['jupiter', 'venus'].includes(otherPlanet);
          const isMalefic = ['mars', 'saturn'].includes(otherPlanet);

          if (isBenefic) { aspectStrength += 2; } else if (isMalefic) { aspectStrength -= 1; }
        }
      }
    });

    return Math.max(0, Math.min(10, 5 + aspectStrength));
  }

  /**
   * Get aspect type between two houses
   * @private
   * @param {number} house1 - First house
   * @param {number} house2 - Second house
   * @returns {string|null} Aspect type or null
   */
  _getAspectBetweenHouses(house1, house2) {
    const diff = Math.abs(house1 - house2);
    const minDiff = Math.min(diff, 12 - diff);

    const aspects = {
      3: 'trine',
      4: 'square',
      6: 'sextile',
      7: 'opposition',
      9: 'trine'
    };

    return aspects[minDiff] || null;
  }

  /**
   * Interpret Shadbala strength percentage
   * @private
   * @param {number} percentage - Strength percentage
   * @returns {string} Strength interpretation
   */
  _interpretShadbalaStrength(percentage) {
    if (percentage >= 80) { return 'Exceptionally Strong'; }
    if (percentage >= 70) { return 'Very Strong'; }
    if (percentage >= 60) { return 'Strong'; }
    if (percentage >= 50) { return 'Moderate'; }
    if (percentage >= 40) { return 'Weak'; }
    return 'Very Weak';
  }

  /**
   * Analyze total Shadbala results
   * @private
   * @param {Object} shadbala - Shadbala data for all planets
   * @returns {Object} Total analysis
   */
  _analyzeTotalShadbala(shadbala) {
    const analysis = {
      strongestPlanet: null,
      weakestPlanet: null,
      averageStrength: 0,
      rankings: [],
      recommendations: []
    };

    // Calculate rankings
    const planetEntries = Object.entries(shadbala).map(([planet, data]) => ({
      planet: data.planet,
      strength: data.percentage
    }));

    planetEntries.sort((a, b) => b.strength - a.strength);
    analysis.rankings = planetEntries;

    analysis.strongestPlanet = planetEntries[0];
    analysis.weakestPlanet = planetEntries[planetEntries.length - 1];

    // Calculate average
    analysis.averageStrength = Math.round(
      planetEntries.reduce((sum, p) => sum + p.strength, 0) / planetEntries.length
    );

    // Generate recommendations
    analysis.recommendations = this._generateShadbalaRecommendations(analysis);

    return analysis;
  }

  /**
   * Generate Shadbala recommendations
   * @private
   * @param {Object} analysis - Analysis data
   * @returns {Array} Recommendations
   */
  _generateShadbalaRecommendations(analysis) {
    const recommendations = [];

    if (analysis.strongestPlanet) {
      recommendations.push(`Focus on areas ruled by ${analysis.strongestPlanet.planet} (${analysis.strongestPlanet.strength}% strength)`);
    }

    if (analysis.weakestPlanet && analysis.weakestPlanet.strength < 50) {
      recommendations.push(`Strengthen ${analysis.weakestPlanet.planet} through specific remedies and practices`);
    }

    if (analysis.averageStrength >= 70) {
      recommendations.push('Overall strong planetary configuration - favorable for most endeavors');
    } else if (analysis.averageStrength <= 40) {
      recommendations.push('Planetary strengths need enhancement through spiritual practices');
    }

    return recommendations;
  }

  /**
   * Generate Shadbala summary
   * @private
   * @param {Object} shadbala - Shadbala data
   * @param {Object} analysis - Analysis
   * @returns {string} Summary text
   */
  _generateShadbalaSummary(shadbala, analysis) {
    let summary = '🕉️ *Shadbala (6-Fold Strength) Analysis*\n\n';
    summary += `*Overall Average Strength:* ${analysis.averageStrength}%\n\n`;

    summary += '*Planetary Strength Rankings:*\n';
    analysis.rankings.forEach((planet, index) => {
      summary += `${index + 1}. ${planet.planet}: ${planet.strength}% (${this._interpretShadbalaStrength(planet.strength)})\n`;
    });
    summary += '\n';

    summary += '*Detailed Breakdown (Top 3 Planets):*\n';
    for (let i = 0; i < Math.min(3, analysis.rankings.length); i++) {
      const planet = analysis.rankings[i].planet.toLowerCase();
      const data = shadbala[planet];
      if (data) {
        summary += `\n*${data.planet} (${data.percentage}%):*\n`;
        summary += `• Sthana Bala: ${data.breakdown.sthanaBala}\n`;
        summary += `• Dig Bala: ${data.breakdown.digBala}\n`;
        summary += `• Kala Bala: ${data.breakdown.kalaBala}\n`;
        summary += `• Chesta Bala: ${data.breakdown.chestaBala}\n`;
        summary += `• Naisargika Bala: ${data.breakdown.naisargikaBala}\n`;
        summary += `• Drik Bala: ${data.breakdown.drikBala}\n`;
      }
    }

    summary += '\n*Key Insights:*\n';
    analysis.recommendations.forEach(rec => {
      summary += `• ${rec}\n`;
    });

    summary += '\nShadbala measures planetary strength through 6 different methods for comprehensive analysis. 🕉️';

    return summary;
  }

  /**
   * Generate Muhurta (Electional Astrology) analysis
   * @param {Object} eventData - Event details
   * @param {string} eventData.eventType - Type of event (wedding, business, etc.)
   * @param {string} eventData.preferredDate - Preferred date (DD/MM/YYYY)
   * @param {string} eventData.location - Event location
   * @returns {Object} Muhurta analysis
   */
  async generateMuhurta(eventData) {
    try {
      const { eventType, preferredDate, location } = eventData;

      if (!eventType || !preferredDate || !location) {
        return {
          error: 'Event type, preferred date, and location required for Muhurta analysis'
        };
      }

      // Parse preferred date
      const [day, month, year] = preferredDate.split('/').map(Number);

      // Get location coordinates
      const [latitude, longitude] = await this._getCoordinatesForPlace(location);
      const eventDateTime = new Date(year, month - 1, day, 12, 0); // Midday for general timezone lookup
      const timestamp = eventDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Generate auspicious timings for the preferred date
      const muhurtaOptions = await this._calculateMuhurtaOptions(eventType, year, month, day, latitude, longitude, timezone);

      // Find alternative dates if preferred date is not suitable
      const alternativeDates = await this._findAlternativeMuhurtaDates(eventType, year, month, day, latitude, longitude, timezone);

      return {
        eventType,
        preferredDate,
        location,
        muhurtaOptions,
        alternativeDates,
        summary: this._generateMuhurtaSummary(eventData, muhurtaOptions, alternativeDates)
      };
    } catch (error) {
      logger.error('Error generating Muhurta:', error);
      return {
        error: 'Unable to generate Muhurta analysis at this time'
      };
    }
  }

  /**
   * Calculate Muhurta options for a specific date
   * @private
   * @param {string} eventType - Type of event
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} timezone - Timezone
   * @returns {Array} Muhurta options
   */
  async _calculateMuhurtaOptions(eventType, year, month, day, latitude, longitude, timezone) {
    const options = [];

    // Calculate for 24 hours in 2-hour intervals
    for (let hour = 6; hour <= 18; hour += 2) { // Daytime only (6 AM to 6 PM)
      for (let minute = 0; minute < 60; minute += 30) {
        const muhurtaTime = { hour, minute };
        const analysis = await this._analyzeMuhurtaTime(eventType, year, month, day, hour, minute, latitude, longitude, timezone);

        if (analysis.suitability !== 'Inauspicious') {
          options.push({
            time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
            suitability: analysis.suitability,
            score: analysis.score,
            reasons: analysis.reasons,
            tithi: analysis.tithi,
            nakshatra: analysis.nakshatra,
            yoga: analysis.yoga
          });
        }
      }
    }

    // Sort by score (highest first)
    options.sort((a, b) => b.score - a.score);

    return options.slice(0, 5); // Return top 5 options
  }

  /**
   * Analyze a specific time for Muhurta
   * @private
   * @param {string} eventType - Type of event
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {number} hour - Hour
   * @param {number} minute - Minute
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} timezone - Timezone
   * @returns {Object} Time analysis
   */
  async _analyzeMuhurtaTime(eventType, year, month, day, hour, minute, latitude, longitude, timezone) {
    const analysis = {
      suitability: 'Neutral',
      score: 50,
      reasons: [],
      tithi: 'Unknown',
      nakshatra: 'Unknown',
      yoga: 'Unknown'
    };

    // Calculate astronomical data for this time
    const astroData = {
      year, month, date: day, hours: hour, minutes: minute, seconds: 0,
      latitude, longitude, timezone, chartType: 'sidereal'
    };

    try {
      const chart = this.astrologer.generateNatalChartData(astroData);

      // Get Tithi, Nakshatra, Yoga
      analysis.tithi = chart.interpretations.tithi || 'Unknown';
      analysis.nakshatra = chart.interpretations.nakshatra || 'Unknown';
      analysis.yoga = chart.interpretations.yoga || 'Unknown';

      // Check Panchaka Dosha (5 defects to avoid)
      const panchakaCheck = this._checkPanchakaDosha(analysis.tithi, analysis.nakshatra, chart.planets);
      if (panchakaCheck.hasDosha) {
        analysis.reasons.push(...panchakaCheck.reasons);
        analysis.score -= 30;
      }

      // Check Abhijit Muhurta (most auspicious time)
      const abhijitCheck = await this._checkAbhijitMuhurta(hour, minute, latitude, longitude);
      if (abhijitCheck.isAbhijit) {
        analysis.reasons.push('Abhijit Muhurta - Most auspicious time');
        analysis.score += 25;
      }

      // Check planetary positions for the event type
      const planetaryCheck = this._checkPlanetaryPositionsForEvent(eventType, chart.planets);
      analysis.score += planetaryCheck.scoreAdjustment;
      analysis.reasons.push(...planetaryCheck.reasons);

      // Check weekday auspiciousness
      const weekdayCheck = this._checkWeekdayAuspiciousness(eventType, year, month, day);
      analysis.score += weekdayCheck.scoreAdjustment;
      analysis.reasons.push(...weekdayCheck.reasons);

      // Check lunar phase
      const lunarCheck = this._checkLunarPhaseForEvent(eventType, analysis.tithi);
      analysis.score += lunarCheck.scoreAdjustment;
      analysis.reasons.push(...lunarCheck.reasons);

      // Determine overall suitability
      if (analysis.score >= 80) {
        analysis.suitability = 'Excellent';
      } else if (analysis.score >= 70) {
        analysis.suitability = 'Very Good';
      } else if (analysis.score >= 60) {
        analysis.suitability = 'Good';
      } else if (analysis.score >= 40) {
        analysis.suitability = 'Fair';
      } else {
        analysis.suitability = 'Inauspicious';
      }
    } catch (error) {
      analysis.reasons.push('Unable to calculate astronomical data');
      analysis.score = 30;
    }

    return analysis;
  }

  /**
   * Check Panchaka Dosha (5 defects)
   * @private
   * @param {string} tithi - Lunar day
   * @param {string} nakshatra - Nakshatra
   * @param {Object} planets - Planetary positions
   * @returns {Object} Panchaka check result
   */
  _checkPanchakaDosha(tithi, nakshatra, planets) {
    const result = {
      hasDosha: false,
      reasons: []
    };

    // 1. Rahu Kalam (Rahu's period) - inauspicious
    const rahuKalam = this._isRahuKalam(planets.rahu);
    if (rahuKalam) {
      result.hasDosha = true;
      result.reasons.push('Rahu Kalam - Inauspicious time');
    }

    // 2. Gulika Kalam (Gulika's period) - very inauspicious
    const gulikaKalam = this._isGulikaKalam(planets.gulika);
    if (gulikaKalam) {
      result.hasDosha = true;
      result.reasons.push('Gulika Kalam - Very inauspicious time');
    }

    // 3. Yamaganda (certain tithis) - avoid for auspicious work
    const yamagandaTithis = ['2nd', '7th', '12th', '17th', '22nd', '27th'];
    if (yamagandaTithis.some(t => tithi.includes(t))) {
      result.hasDosha = true;
      result.reasons.push('Yamaganda Tithi - Not suitable for auspicious work');
    }

    // 4. Visha Ghati (certain nakshatras) - poison period
    const vishaGhatiNakshatras = ['Mula', 'Jyeshta', 'Ashlesha', 'Revati'];
    if (vishaGhatiNakshatras.some(n => nakshatra.includes(n))) {
      result.hasDosha = true;
      result.reasons.push('Visha Ghati Nakshatra - Poison period');
    }

    // 5. Surya Sankranti (sun transition) - avoid
    const sankrantiCheck = this._isSuryaSankranti(planets.sun);
    if (sankrantiCheck) {
      result.hasDosha = true;
      result.reasons.push('Surya Sankranti - Sun transition period');
    }

    return result;
  }

  /**
   * Check if time is Rahu Kalam
   * @private
   * @param {Object} rahu - Rahu position
   * @returns {boolean} Is Rahu Kalam
   */
  _isRahuKalam(rahu) {
    // Simplified - Rahu Kalam varies by weekday
    // In practice, this is calculated based on sunrise and weekday
    return false; // Placeholder
  }

  /**
   * Check if time is Gulika Kalam
   * @private
   * @param {Object} gulika - Gulika position
   * @returns {boolean} Is Gulika Kalam
   */
  _isGulikaKalam(gulika) {
    // Gulika Kalam is very inauspicious
    return false; // Placeholder
  }

  /**
   * Check if it's Surya Sankranti
   * @private
   * @param {Object} sun - Sun position
   * @returns {boolean} Is Surya Sankranti
   */
  _isSuryaSankranti(sun) {
    // Sun transitioning between signs
    return false; // Placeholder
  }

  /**
   * Check Abhijit Muhurta
   * @private
   * @param {number} hour - Hour
   * @param {number} minute - Minute
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Object} Abhijit check result
   */
  _checkAbhijitMuhurta(hour, minute, latitude, longitude) {
    // Abhijit Muhurta is approximately noon ± 24 minutes
    // This is the most auspicious time of the day
    const timeInMinutes = hour * 60 + minute;
    const abhijitStart = 11.5 * 60; // 11:30 AM
    const abhijitEnd = 12.5 * 60;   // 12:30 PM

    const isAbhijit = timeInMinutes >= abhijitStart && timeInMinutes <= abhijitEnd;

    return {
      isAbhijit,
      reason: isAbhijit ? 'Most auspicious time of the day' : 'Not Abhijit Muhurta'
    };
  }

  /**
   * Check planetary positions for specific event type
   * @private
   * @param {string} eventType - Type of event
   * @param {Object} planets - Planetary positions
   * @returns {Object} Planetary check result
   */
  _checkPlanetaryPositionsForEvent(eventType, planets) {
    const result = {
      scoreAdjustment: 0,
      reasons: []
    };

    switch (eventType.toLowerCase()) {
    case 'wedding':
    case 'marriage':
      // Venus and Jupiter should be well-placed
      if (planets.venus && [1, 4, 7, 10].includes(planets.venus.house)) {
        result.scoreAdjustment += 15;
        result.reasons.push('Venus well-placed for marriage');
      }
      if (planets.jupiter && [1, 4, 7, 10].includes(planets.jupiter.house)) {
        result.scoreAdjustment += 10;
        result.reasons.push('Jupiter well-placed for marriage');
      }
      break;

    case 'business':
    case 'business launch':
      // Mercury and Sun should be strong
      if (planets.mercury && [1, 4, 7, 10].includes(planets.mercury.house)) {
        result.scoreAdjustment += 15;
        result.reasons.push('Mercury well-placed for business');
      }
      if (planets.sun && [1, 4, 7, 10].includes(planets.sun.house)) {
        result.scoreAdjustment += 10;
        result.reasons.push('Sun well-placed for business');
      }
      break;

    case 'house warming':
    case 'home':
      // Mars and Moon should be favorable
      if (planets.mars && [1, 4, 7, 10].includes(planets.mars.house)) {
        result.scoreAdjustment += 10;
        result.reasons.push('Mars favorable for home');
      }
      if (planets.moon && [1, 4, 7, 10].includes(planets.moon.house)) {
        result.scoreAdjustment += 10;
        result.reasons.push('Moon favorable for home');
      }
      break;

    case 'education':
    case 'study':
      // Jupiter and Mercury should be strong
      if (planets.jupiter && [1, 4, 7, 10].includes(planets.jupiter.house)) {
        result.scoreAdjustment += 15;
        result.reasons.push('Jupiter favorable for education');
      }
      if (planets.mercury && [1, 4, 7, 10].includes(planets.mercury.house)) {
        result.scoreAdjustment += 10;
        result.reasons.push('Mercury favorable for education');
      }
      break;

    default:
      // General auspiciousness
      const beneficCount = [planets.jupiter, planets.venus].filter(p =>
        p && [1, 4, 7, 10].includes(p.house)
      ).length;
      result.scoreAdjustment += beneficCount * 5;
      if (beneficCount > 0) {
        result.reasons.push(`${beneficCount} benefic planet(s) well-placed`);
      }
    }

    return result;
  }

  /**
   * Check weekday auspiciousness for event
   * @private
   * @param {string} eventType - Type of event
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @returns {Object} Weekday check result
   */
  _checkWeekdayAuspiciousness(eventType, year, month, day) {
    const result = {
      scoreAdjustment: 0,
      reasons: []
    };

    // Create date object to get weekday
    const date = new Date(year, month - 1, day);
    const weekday = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    switch (eventType.toLowerCase()) {
    case 'wedding':
    case 'marriage':
      // Monday, Wednesday, Thursday, Friday good for marriage
      if ([1, 3, 4, 5].includes(weekday)) {
        result.scoreAdjustment += 10;
        result.reasons.push(`${weekdayNames[weekday]} is auspicious for marriage`);
      }
      break;

    case 'business':
    case 'business launch':
      // Wednesday, Thursday, Friday good for business
      if ([3, 4, 5].includes(weekday)) {
        result.scoreAdjustment += 10;
        result.reasons.push(`${weekdayNames[weekday]} is auspicious for business`);
      }
      break;

    case 'education':
    case 'study':
      // Wednesday, Thursday, Friday good for education
      if ([3, 4, 5].includes(weekday)) {
        result.scoreAdjustment += 10;
        result.reasons.push(`${weekdayNames[weekday]} is auspicious for education`);
      }
      break;

    default:
      // General - avoid Tuesday for inauspicious work
      if (weekday === 2) { // Tuesday
        result.scoreAdjustment -= 10;
        result.reasons.push('Tuesday may be challenging for new beginnings');
      }
    }

    return result;
  }

  /**
   * Check lunar phase for event
   * @private
   * @param {string} eventType - Type of event
   * @param {string} tithi - Lunar day
   * @returns {Object} Lunar phase check result
   */
  _checkLunarPhaseForEvent(eventType, tithi) {
    const result = {
      scoreAdjustment: 0,
      reasons: []
    };

    // Extract tithi number
    const tithiMatch = tithi.match(/(\d+)/);
    const tithiNumber = tithiMatch ? parseInt(tithiMatch[1]) : 15;

    switch (eventType.toLowerCase()) {
    case 'wedding':
    case 'marriage':
      // Shukla Paksha (bright half) preferred, avoid Rikta Tithis
      if (tithi.includes('Shukla') && ![4, 9, 14].includes(tithiNumber)) {
        result.scoreAdjustment += 10;
        result.reasons.push('Shukla Paksha favorable for marriage');
      }
      break;

    case 'business':
    case 'business launch':
      // Shukla Paksha good for new beginnings
      if (tithi.includes('Shukla')) {
        result.scoreAdjustment += 5;
        result.reasons.push('Shukla Paksha good for new ventures');
      }
      break;

    case 'house warming':
      // Avoid Rikta Tithis
      if (![4, 9, 14].includes(tithiNumber)) {
        result.scoreAdjustment += 5;
        result.reasons.push('Suitable Tithi for home ceremonies');
      }
      break;

    default:
      // General preference for Shukla Paksha
      if (tithi.includes('Shukla')) {
        result.scoreAdjustment += 5;
        result.reasons.push('Shukla Paksha generally auspicious');
      }
    }

    return result;
  }

  /**
   * Find alternative Muhurta dates
   * @private
   * @param {string} eventType - Type of event
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} timezone - Timezone
   * @returns {Array} Alternative dates
   */
  async _findAlternativeMuhurtaDates(eventType, year, month, day, latitude, longitude, timezone) {
    const alternatives = [];

    // Check next 30 days for better Muhurta options
    for (let i = 1; i <= 30; i++) {
      const checkDate = new Date(year, month - 1, day + i);
      const altYear = checkDate.getFullYear();
      const altMonth = checkDate.getMonth() + 1;
      const altDay = checkDate.getDate();

      const options = await this._calculateMuhurtaOptions(eventType, altYear, altMonth, altDay, latitude, longitude, timezone);

      if (options.length > 0 && options[0].suitability === 'Excellent') {
        alternatives.push({
          date: `${altDay.toString().padStart(2, '0')}/${altMonth.toString().padStart(2, '0')}/${altYear}`,
          bestTime: options[0].time,
          suitability: options[0].suitability,
          score: options[0].score
        });

        if (alternatives.length >= 3) { break; } // Return top 3 alternatives
      }
    }

    return alternatives;
  }

  /**
   * Generate Muhurta summary
   * @private
   * @param {Object} eventData - Event data
   * @param {Array} muhurtaOptions - Muhurta options
   * @param {Array} alternativeDates - Alternative dates
   * @returns {string} Summary text
   */
  _generateMuhurtaSummary(eventData, muhurtaOptions, alternativeDates) {
    let summary = `🕉️ *Muhurta Analysis for ${eventData.eventType}*\n\n`;
    summary += `*Preferred Date:* ${eventData.preferredDate}\n`;
    summary += `*Location:* ${eventData.location}\n\n`;

    if (muhurtaOptions.length > 0) {
      summary += '*Recommended Timings for Preferred Date:*\n\n';
      muhurtaOptions.forEach((option, index) => {
        summary += `*${index + 1}. ${option.time}* (${option.suitability})\n`;
        summary += `   Score: ${option.score}/100\n`;
        summary += `   Tithi: ${option.tithi}\n`;
        summary += `   Nakshatra: ${option.nakshatra}\n`;
        if (option.reasons.length > 0) {
          summary += `   Reasons: ${option.reasons.slice(0, 2).join(', ')}\n`;
        }
        summary += '\n';
      });
    } else {
      summary += '*No highly auspicious timings found on preferred date.*\n\n';
    }

    if (alternativeDates.length > 0) {
      summary += '*Alternative Auspicious Dates:*\n\n';
      alternativeDates.forEach((alt, index) => {
        summary += `*${index + 1}. ${alt.date} at ${alt.bestTime}*\n`;
        summary += `   Suitability: ${alt.suitability} (Score: ${alt.score}/100)\n\n`;
      });
    }

    summary += '*Muhurta Considerations:*\n';
    summary += '• Panchaka Dosha (Rahu Kalam, Gulika Kalam, etc.) avoided\n';
    summary += '• Abhijit Muhurta prioritized when available\n';
    summary += '• Planetary positions analyzed for event type\n';
    summary += '• Weekday and lunar phase considered\n\n';

    summary += '🕉️ *Note:* This is a traditional Muhurta analysis. Consult local priests/pundits for final confirmation.';

    return summary;
  }

  /**
   * Generate Panchang (Hindu Almanac) for a specific date
   * @param {Object} dateData - Date and location data
   * @param {string} dateData.date - Date in DD/MM/YYYY format
   * @param {string} dateData.location - Location for calculations
   * @returns {Object} Panchang analysis
   */
  async generatePanchang(dateData) {
    try {
      const { date, location } = dateData;

      if (!date || !location) {
        return {
          error: 'Date and location required for Panchang'
        };
      }

      // Parse date
      const [day, month, year] = date.split('/').map(Number);

      // Get location coordinates
      const [latitude, longitude] = await this._getCoordinatesForPlace(location);
      const panchangDateTime = new Date(year, month - 1, day, 12, 0); // Midday for general timezone lookup
      const timestamp = panchangDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Generate Panchang data
      const panchangData = await this._calculatePanchangData(year, month, day, latitude, longitude, timezone);

      // Generate daily guidance
      const dailyGuidance = this._generateDailyGuidance(panchangData);

      return {
        date,
        location,
        panchangData,
        dailyGuidance,
        summary: this._generatePanchangSummary(date, location, panchangData, dailyGuidance)
      };
    } catch (error) {
      logger.error('Error generating Panchang:', error);
      return {
        error: 'Unable to generate Panchang at this time'
      };
    }
  }

  /**
   * Calculate Panchang data for a specific date
   * @private
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} timezone - Timezone
   * @returns {Object} Panchang data
   */
  async _calculatePanchangData(year, month, day, latitude, longitude, timezone) {
    const panchangData = {
      date: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`,
      weekday: this._getWeekdayName(year, month, day),
      tithi: 'Unknown',
      nakshatra: 'Unknown',
      yoga: 'Unknown',
      karana: 'Unknown',
      sunrise: 'Unknown',
      sunset: 'Unknown',
      moonPhase: 'Unknown',
      rahukalam: 'Unknown',
      gulikakalam: 'Unknown',
      yamagandam: 'Unknown',
      abhijitMuhurta: 'Unknown',
      auspiciousActivities: [],
      inauspiciousActivities: []
    };

    try {
      // Calculate astronomical data
      const astroData = {
        year, month, date: day, hours: 12, minutes: 0, seconds: 0,
        latitude, longitude, timezone, chartType: 'sidereal'
      };

      const chart = this.astrologer.generateNatalChartData(astroData);

      // Extract Panchang elements using precise Swiss Ephemeris calculations
      panchangData.tithi = await this._calculateTithi(year, month, day);
      panchangData.nakshatra = await this._calculateNakshatra(year, month, day);
      panchangData.yoga = await this._calculateYoga(year, month, day);
      panchangData.karana = await this._calculateKarana(year, month, day);
      panchangData.moonPhase = this._calculateMoonPhase(chart);

      // Calculate day timings (simplified)
      panchangData.sunrise = await this._calculateSunrise(year, month, day, latitude, longitude, timezone);
      panchangData.sunset = await this._calculateSunset(year, month, day, latitude, longitude, timezone);

      // Calculate inauspicious periods
      panchangData.rahukalam = this._calculateRahukalam(year, month, day, panchangData.sunrise, panchangData.sunset);
      panchangData.gulikakalam = this._calculateGulikakalam(year, month, day, panchangData.sunrise, panchangData.sunset);
      panchangData.yamagandam = this._calculateYamagandam(year, month, day, panchangData.sunrise, panchangData.sunset);
      panchangData.abhijitMuhurta = this._calculateAbhijitMuhurta(panchangData.sunrise, panchangData.sunset);

      // Determine auspicious/inauspicious activities
      const activityAnalysis = this._analyzeDailyActivities(panchangData);
      panchangData.auspiciousActivities = activityAnalysis.auspicious;
      panchangData.inauspiciousActivities = activityAnalysis.inauspicious;
    } catch (error) {
      logger.error('Error calculating Panchang data:', error);
      // Return default values
    }

    return panchangData;
  }

  /**
   * Get weekday name
   * @private
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @returns {string} Weekday name
   */
  _getWeekdayName(year, month, day) {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(year, month - 1, day);
    return weekdays[date.getDay()];
  }

  /**
   * Calculate Tithi (lunar day)
   * @private
   * @param {Object} chart - Astrological chart
   * @returns {string} Tithi
   */
  async _calculateTithi(year, month, day) {
    try {
      const positions = await this._calculateSunMoonPositions(year, month, day);
      const { sun, moon } = positions;

      const longitudeDiff = (moon.longitude - sun.longitude + 360) % 360;
      const tithiNumber = Math.floor(longitudeDiff / 12) + 1;
      const paksha = longitudeDiff < 180 ? 'Shukla' : 'Krishna';

      const tithiNames = [
        'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
        'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
        'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
      ];

      return `${paksha} ${tithiNames[tithiNumber - 1]}`;
    } catch (error) {
      logger.error('Error calculating Tithi:', error);
      return 'Unknown';
    }
  }

  /**
   * Calculate Nakshatra (constellation)
   * @private
   * @param {Object} chart - Astrological chart
   * @returns {string} Nakshatra
   */
  async _calculateNakshatra(year, month, day) {
    try {
      const positions = await this._calculateSunMoonPositions(year, month, day);
      const { moon } = positions;

      const nakshatras = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
        'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
        'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshta',
        'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
        'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
      ];

      const nakshatraIndex = Math.floor((moon.longitude % 360) / (360 / 27));
      return nakshatras[nakshatraIndex];
    } catch (error) {
      logger.error('Error calculating Nakshatra:', error);
      return 'Unknown';
    }
  }

  /**
   * Calculate Yoga (planetary combination)
   * @private
   * @param {Object} chart - Astrological chart
   * @returns {string} Yoga
   */
  async _calculateYoga(year, month, day) {
    try {
      const positions = await this._calculateSunMoonPositions(year, month, day);
      const { sun, moon } = positions;

      const yogaLongitude = (sun.longitude + moon.longitude) % 360;
      const yogaIndex = Math.floor(yogaLongitude / (360 / 27));

      const yogaNames = [
        'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
        'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata',
        'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha',
        'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'
      ];

      return yogaNames[yogaIndex];
    } catch (error) {
      logger.error('Error calculating Yoga:', error);
      return 'Unknown';
    }
  }

  /**
   * Calculate Karana (half lunar day)
   * @private
   * @param {Object} chart - Astrological chart
   * @returns {string} Karana
   */
  async _calculateKarana(year, month, day) {
    try {
      const positions = await this._calculateSunMoonPositions(year, month, day);
      const { sun, moon } = positions;

      const longitudeDiff = (moon.longitude - sun.longitude + 360) % 360;
      const karanaNumber = Math.floor(longitudeDiff / 6);

      const karanaNames = [
        'Kimstughna', 'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja',
        'Vanija', 'Visti', 'Sakuna', 'Chatushpada', 'Nagava', 'Kimstughna'
      ];

      // Repeat the cycle
      return karanaNames[karanaNumber % karanaNames.length];
    } catch (error) {
      logger.error('Error calculating Karana:', error);
      return 'Unknown';
    }
  }

  /**
   * Calculate Moon Phase
   * @private
   * @param {Object} chart - Astrological chart
   * @returns {string} Moon phase
   */
  _calculateMoonPhase(chart) {
    try {
      const { moon } = chart.planets;
      const { sun } = chart.planets;

      if (moon && sun) {
        const longitudeDiff = (moon.longitude - sun.longitude + 360) % 360;

        if (longitudeDiff < 45) { return 'New Moon'; }
        if (longitudeDiff < 90) { return 'Waxing Crescent'; }
        if (longitudeDiff < 135) { return 'First Quarter'; }
        if (longitudeDiff < 180) { return 'Waxing Gibbous'; }
        if (longitudeDiff < 225) { return 'Full Moon'; }
        if (longitudeDiff < 270) { return 'Waning Gibbous'; }
        if (longitudeDiff < 315) { return 'Last Quarter'; }
        return 'Waning Crescent';
      }
    } catch (error) {
      logger.error('Error calculating Moon Phase:', error);
    }

    return 'Unknown';
  }

  /**
   * Calculate sunrise time (simplified)
   * @private
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {string} Sunrise time
   */
  async _calculateSunrise(year, month, day, latitude, longitude, timezone) {
    try {
      const jd = sweph.julday(year, month, day, 0, 1);
      const geopos = [longitude, latitude, 0]; // longitude, latitude, altitude
      const rsmi = sweph.rise_trans(jd, 0, null, 2, geopos, 0);

      if (rsmi && rsmi.return_code === 0) {
        const sunriseTime = rsmi.tret[0]; // Sunrise time in UT
        const sunriseHour = Math.floor(sunriseTime);
        const sunriseMinute = Math.round((sunriseTime - sunriseHour) * 60);
        return `${sunriseHour.toString().padStart(2, '0')}:${sunriseMinute.toString().padStart(2, '0')}`;
      }
    } catch (error) {
      logger.error('Error calculating sunrise with sweph:', error);
      throw new Error('Unable to calculate precise sunrise time. Swiss Ephemeris may not be properly configured.');
    }
  }

  /**
   * Calculate sunset time (simplified)
   * @private
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {string} Sunset time
   */
  async _calculateSunset(year, month, day, latitude, longitude, timezone) {
    try {
      const jd = sweph.julday(year, month, day, 0, 1);
      const geopos = [longitude, latitude, 0]; // longitude, latitude, altitude
      const rsmi = sweph.set_trans(jd, 0, null, 2, geopos, 0);

      if (rsmi && rsmi.return_code === 0) {
        const sunsetTime = rsmi.tret[0]; // Sunset time in UT
        const sunsetHour = Math.floor(sunsetTime);
        const sunsetMinute = Math.round((sunsetTime - sunsetHour) * 60);
        return `${sunsetHour.toString().padStart(2, '0')}:${sunsetMinute.toString().padStart(2, '0')}`;
      }
    } catch (error) {
      logger.error('Error calculating sunset with sweph:', error);
      throw new Error('Unable to calculate precise sunset time. Swiss Ephemeris may not be properly configured.');
    }
  }

  /**
   * Calculate Rahukalam (Rahu's period)
   * @private
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {string} sunrise - Sunrise time
   * @param {string} sunset - Sunset time
   * @returns {string} Rahukalam time
   */
  async _calculateRahukalam(year, month, day, sunrise, sunset) {
    try {
      // Parse sunrise and sunset times
      const [sunriseHour, sunriseMin] = sunrise.split(':').map(Number);
      const [sunsetHour, sunsetMin] = sunset.split(':').map(Number);

      // Convert to minutes since midnight
      const sunriseMinutes = sunriseHour * 60 + sunriseMin;
      const sunsetMinutes = sunsetHour * 60 + sunsetMin;

      // Calculate daylight duration
      const daylightMinutes = sunsetMinutes - sunriseMinutes;
      const rahukalamDuration = daylightMinutes / 8; // Rahukalam is 1/8th of daylight

      // Rahukalam starting times based on weekday (traditional Vedic calculation)
      const date = new Date(year, month - 1, day);
      const weekday = date.getDay(); // 0 = Sunday

      const rahukalamStartOffsets = {
        0: 4.5 * 60,    // Sunday: 4:30 PM from sunrise
        1: 0.5 * 60,    // Monday: 30 min after sunrise
        2: 3.5 * 60,    // Tuesday: 3:30 PM from sunrise
        3: 2 * 60,      // Wednesday: 2 PM from sunrise
        4: 2.5 * 60,    // Thursday: 2:30 PM from sunrise
        5: 1.5 * 60,    // Friday: 1:30 PM from sunrise
        6: 1 * 60       // Saturday: 1 PM from sunrise
      };

      const startOffset = rahukalamStartOffsets[weekday];
      const rahukalamStart = sunriseMinutes + startOffset;
      const rahukalamEnd = rahukalamStart + rahukalamDuration;

      // Convert back to HH:MM format
      const startHour = Math.floor(rahukalamStart / 60);
      const startMin = Math.floor(rahukalamStart % 60);
      const endHour = Math.floor(rahukalamEnd / 60);
      const endMin = Math.floor(rahukalamEnd % 60);

      return `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')} - ${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
    } catch (error) {
      logger.error('Error calculating Rahukalam:', error);
      return 'Unknown';
    }
  }

  /**
   * Calculate Gulika Kalam (Gulika's period)
   * @private
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {string} sunrise - Sunrise time
   * @param {string} sunset - Sunset time
   * @returns {string} Gulikakalam time
   */
  async _calculateGulikakalam(year, month, day, sunrise, sunset) {
    // Gulikakalam varies by weekday (most inauspicious period)
    const date = new Date(year, month - 1, day);
    const weekday = date.getDay();

    const gulikaPeriods = {
      0: '3:00 PM - 4:30 PM', // Sunday
      1: '12:00 PM - 1:30 PM', // Monday
      2: '10:30 AM - 12:00 PM', // Tuesday
      3: '1:30 PM - 3:00 PM', // Wednesday
      4: '9:00 AM - 10:30 AM', // Thursday
      5: '7:30 AM - 9:00 AM', // Friday
      6: '4:30 PM - 6:00 PM'  // Saturday
    };

    return gulikaPeriods[weekday] || 'Unknown';
  }

  /**
   * Calculate Yamagandam (inauspicious period)
   * @private
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {number} day - Day
   * @param {string} sunrise - Sunrise time
   * @param {string} sunset - Sunset time
   * @returns {string} Yamagandam time
   */
  async _calculateYamagandam(year, month, day, sunrise, sunset) {
    // Yamagandam varies by weekday
    const date = new Date(year, month - 1, day);
    const weekday = date.getDay();

    const yamagandamPeriods = {
      0: '12:00 PM - 1:30 PM', // Sunday
      1: '10:30 AM - 12:00 PM', // Monday
      2: '9:00 AM - 10:30 AM', // Tuesday
      3: '7:30 AM - 9:00 AM', // Wednesday
      4: '3:00 PM - 4:30 PM', // Thursday
      5: '12:00 PM - 1:30 PM', // Friday
      6: '1:30 PM - 3:00 PM'  // Saturday
    };

    return yamagandamPeriods[weekday] || 'Unknown';
  }

  /**
   * Calculate Abhijit Muhurta
   * @private
   * @param {string} sunrise - Sunrise time
   * @param {string} sunset - Sunset time
   * @returns {string} Abhijit Muhurta time
   */
  async _calculateAbhijitMuhurta(sunrise, sunset) {
    // Abhijit Muhurta is noon ± 24 minutes (most auspicious time)
    return '11:36 AM - 12:24 PM';
  }

  /**
   * Analyze daily activities based on Panchang
   * @private
   * @param {Object} panchangData - Panchang data
   * @returns {Object} Activity analysis
   */
  _analyzeDailyActivities(panchangData) {
    const analysis = {
      auspicious: [],
      inauspicious: []
    };

    // Check Tithi for auspicious activities
    if (panchangData.tithi.includes('Shukla') &&
        (panchangData.tithi.includes('Purnima') || panchangData.tithi.includes('Ekadashi'))) {
      analysis.auspicious.push('Religious ceremonies and spiritual activities');
    }

    if (panchangData.tithi.includes('Krishna') &&
        (panchangData.tithi.includes('Amavasya') || panchangData.tithi.includes('Chaturdashi'))) {
      analysis.inauspicious.push('New beginnings and auspicious ceremonies');
    }

    // Check Nakshatra
    const auspiciousNakshatras = ['Rohini', 'Uttara Phalguni', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'];
    const inauspiciousNakshatras = ['Mula', 'Jyeshta', 'Ashlesha'];

    if (auspiciousNakshatras.some(n => panchangData.nakshatra.includes(n))) {
      analysis.auspicious.push('Marriage and important ceremonies');
    }

    if (inauspiciousNakshatras.some(n => panchangData.nakshatra.includes(n))) {
      analysis.inauspicious.push('Marriage and travel');
    }

    // Check Yoga
    const auspiciousYogas = ['Siddhi', 'Vyatipata', 'Shubha', 'Shukla', 'Brahma'];
    const inauspiciousYogas = ['Vishkambha', 'Atiganda', 'Shula', 'Ganda', 'Vyaghata'];

    if (auspiciousYogas.some(y => panchangData.yoga.includes(y))) {
      analysis.auspicious.push('All important activities');
    }

    if (inauspiciousYogas.some(y => panchangData.yoga.includes(y))) {
      analysis.inauspicious.push('New ventures and important decisions');
    }

    // Weekday considerations
    const { weekday } = panchangData;
    if (weekday === 'Monday') {
      analysis.auspicious.push('Spiritual activities and charity');
    } else if (weekday === 'Tuesday') {
      analysis.inauspicious.push('Marriage and new beginnings');
    } else if (weekday === 'Wednesday') {
      analysis.auspicious.push('Education and learning');
    } else if (weekday === 'Thursday') {
      analysis.auspicious.push('Wealth and prosperity activities');
    } else if (weekday === 'Friday') {
      analysis.auspicious.push('Love and marriage');
    } else if (weekday === 'Saturday') {
      analysis.inauspicious.push('Important ceremonies');
    }

    // Default activities if none specified
    if (analysis.auspicious.length === 0) {
      analysis.auspicious.push('General activities and daily work');
    }

    if (analysis.inauspicious.length === 0) {
      analysis.inauspicious.push('Avoid during Rahukalam and Gulikakalam');
    }

    return analysis;
  }

  /**
   * Generate daily guidance based on Panchang
   * @private
   * @param {Object} panchangData - Panchang data
   * @returns {Object} Daily guidance
   */
  _generateDailyGuidance(panchangData) {
    const guidance = {
      overallRating: 'Neutral',
      recommendations: [],
      warnings: [],
      bestActivities: [],
      avoidActivities: []
    };

    // Calculate overall rating
    let positiveFactors = 0;
    let negativeFactors = 0;

    // Check for auspicious elements
    if (panchangData.tithi.includes('Shukla')) { positiveFactors++; }
    if (panchangData.nakshatra.includes('Rohini') || panchangData.nakshatra.includes('Revati')) { positiveFactors++; }
    if (panchangData.yoga.includes('Siddhi') || panchangData.yoga.includes('Shubha')) { positiveFactors++; }
    if (['Wednesday', 'Thursday', 'Friday'].includes(panchangData.weekday)) { positiveFactors++; }

    // Check for inauspicious elements
    if (panchangData.tithi.includes('Krishna') && panchangData.tithi.includes('Chaturdashi')) { negativeFactors++; }
    if (panchangData.nakshatra.includes('Mula') || panchangData.nakshatra.includes('Jyeshta')) { negativeFactors++; }
    if (panchangData.yoga.includes('Vyaghata') || panchangData.yoga.includes('Vishkambha')) { negativeFactors++; }
    if (panchangData.weekday === 'Tuesday' || panchangData.weekday === 'Saturday') { negativeFactors++; }

    if (positiveFactors > negativeFactors + 1) {
      guidance.overallRating = 'Auspicious';
    } else if (negativeFactors > positiveFactors + 1) {
      guidance.overallRating = 'Inauspicious';
    }

    // Generate recommendations
    guidance.recommendations = panchangData.auspiciousActivities;
    guidance.warnings = panchangData.inauspiciousActivities;
    guidance.bestActivities = panchangData.auspiciousActivities.slice(0, 3);
    guidance.avoidActivities = panchangData.inauspiciousActivities.slice(0, 3);

    return guidance;
  }

  /**
   * Generate Panchang summary
   * @private
   * @param {string} date - Date
   * @param {string} location - Location
   * @param {Object} panchangData - Panchang data
   * @param {Object} dailyGuidance - Daily guidance
   * @returns {string} Summary text
   */
  _generatePanchangSummary(date, location, panchangData, dailyGuidance) {
    let summary = `🕉️ *Panchang for ${date} - ${location}*\n\n`;

    summary += `*Date:* ${panchangData.date}\n`;
    summary += `*Day:* ${panchangData.weekday}\n\n`;

    summary += `*Tithi (Lunar Day):* ${panchangData.tithi}\n`;
    summary += `*Nakshatra:* ${panchangData.nakshatra}\n`;
    summary += `*Yoga:* ${panchangData.yoga}\n`;
    summary += `*Karana:* ${panchangData.karana}\n\n`;

    summary += `*Sunrise:* ${panchangData.sunrise}\n`;
    summary += `*Sunset:* ${panchangData.sunset}\n`;
    summary += `*Moon Phase:* ${panchangData.moonPhase}\n\n`;

    summary += '*Inauspicious Periods:*\n';
    summary += `• Rahukalam: ${panchangData.rahukalam}\n`;
    summary += `• Gulikakalam: ${panchangData.gulikakalam}\n`;
    summary += `• Yamagandam: ${panchangData.yamagandam}\n\n`;

    summary += `*Abhijit Muhurta (Most Auspicious):* ${panchangData.abhijitMuhurta}\n\n`;

    summary += `*Overall Day Rating:* ${dailyGuidance.overallRating}\n\n`;

    if (dailyGuidance.bestActivities.length > 0) {
      summary += '*Recommended Activities:*\n';
      dailyGuidance.bestActivities.forEach(activity => {
        summary += `• ${activity}\n`;
      });
      summary += '\n';
    }

    if (dailyGuidance.avoidActivities.length > 0) {
      summary += '*Activities to Avoid:*\n';
      dailyGuidance.avoidActivities.forEach(activity => {
        summary += `• ${activity}\n`;
      });
      summary += '\n';
    }

    summary += '*Note:* Panchang provides traditional Hindu calendar guidance. Consult local priests for religious ceremonies. 🕉️';

    return summary;
  }

  /**
   * Generate Kaal Sarp Dosha analysis
   * @param {Object} birthData - User's birth data
   * @returns {Object} Kaal Sarp Dosha analysis
   */
  async generateKaalSarpDosha(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return {
          error: 'Complete birth details required for Kaal Sarp Dosha analysis'
        };
      }

      // Generate birth chart
      const kundli = await this.generateVedicKundli(birthData);
      if (kundli.error) {
        return { error: kundli.error };
      }

      // Analyze Kaal Sarp Dosha
      const doshaAnalysis = this._analyzeKaalSarpDosha(kundli);

      // Generate remedies if dosha is present
      const remedies = doshaAnalysis.hasDosha ? this._generateKaalSarpRemedies(doshaAnalysis) : [];

      return {
        name,
        doshaAnalysis,
        remedies,
        summary: this._generateKaalSarpSummary(doshaAnalysis, remedies)
      };
    } catch (error) {
      logger.error('Error generating Kaal Sarp Dosha:', error);
      return {
        error: 'Unable to generate Kaal Sarp Dosha analysis at this time'
      };
    }
  }

  /**
   * Analyze Kaal Sarp Dosha in the birth chart
   * @private
   * @param {Object} kundli - Kundli data
   * @returns {Object} Dosha analysis
   */
  _analyzeKaalSarpDosha(kundli) {
    const analysis = {
      hasDosha: false,
      doshaType: 'None',
      doshaStrength: 'None',
      rahuPosition: 0,
      ketuPosition: 0,
      planetsBetween: [],
      planetsOutside: [],
      doshaHouse: 0,
      effects: [],
      severity: 'None'
    };

    const planets = kundli.planetaryPositions;
    const { rahu } = planets;
    const { ketu } = planets;

    if (!rahu || !ketu) {
      return analysis;
    }

    analysis.rahuPosition = rahu.house;
    analysis.ketuPosition = ketu.house;

    // Get all planets except Rahu and Ketu
    const allPlanets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
    const planetPositions = allPlanets.map(planet => ({
      name: planet,
      house: planets[planet]?.house
    })).filter(p => p.house);

    // Determine if it's a Kaal Sarp configuration
    const isKaalSarp = this._checkKaalSarpConfiguration(rahu.house, ketu.house, planetPositions);

    if (isKaalSarp) {
      analysis.hasDosha = true;
      analysis.doshaType = this._determineDoshaType(rahu.house, ketu.house);
      analysis.doshaHouse = rahu.house; // The house where Rahu is located

      // Separate planets between and outside Rahu-Ketu axis
      const { between, outside } = this._categorizePlanets(rahu.house, ketu.house, planetPositions);
      analysis.planetsBetween = between;
      analysis.planetsOutside = outside;

      // Determine strength
      analysis.doshaStrength = this._calculateDoshaStrength(between.length, outside.length);

      // Determine severity
      analysis.severity = this._calculateDoshaSeverity(analysis.doshaType, analysis.doshaStrength, analysis.doshaHouse);

      // Generate effects
      analysis.effects = this._generateDoshaEffects(analysis);
    }

    return analysis;
  }

  /**
   * Check if planets form a Kaal Sarp configuration
   * @private
   * @param {number} rahuHouse - Rahu's house
   * @param {number} ketuHouse - Ketu's house
   * @param {Array} planetPositions - All planet positions
   * @returns {boolean} Whether it's Kaal Sarp
   */
  _checkKaalSarpConfiguration(rahuHouse, ketuHouse, planetPositions) {
    // Check if Rahu and Ketu are exactly opposite (7 houses apart)
    const houseDifference = Math.abs(rahuHouse - ketuHouse);
    if (houseDifference !== 7 && houseDifference !== 5) { // Allow for some variations
      return false;
    }

    // Count planets between Rahu and Ketu
    let planetsBetween = 0;
    let planetsOutside = 0;

    planetPositions.forEach(planet => {
      if (this._isBetweenRahuKetu(rahuHouse, ketuHouse, planet.house)) {
        planetsBetween++;
      } else {
        planetsOutside++;
      }
    });

    // Full Kaal Sarp: All planets between Rahu and Ketu
    // Partial Kaal Sarp: At least 6 planets between Rahu and Ketu
    return planetsBetween >= 6;
  }

  /**
   * Check if a planet is between Rahu and Ketu
   * @private
   * @param {number} rahuHouse - Rahu's house
   * @param {number} ketuHouse - Ketu's house
   * @param {number} planetHouse - Planet's house
   * @returns {boolean} Whether planet is between
   */
  _isBetweenRahuKetu(rahuHouse, ketuHouse, planetHouse) {
    // Normalize houses to handle 12-house circle
    const normalizeHouse = house => ((house - 1) % 12) + 1;

    const rahu = normalizeHouse(rahuHouse);
    const ketu = normalizeHouse(ketuHouse);
    const planet = normalizeHouse(planetHouse);

    // Calculate the shorter arc between Rahu and Ketu
    const directDistance = Math.abs(rahu - ketu);
    const wrapDistance = 12 - directDistance;
    const shorterDistance = Math.min(directDistance, wrapDistance);

    // Determine the direction (clockwise or counterclockwise)
    let start; let end;
    if (directDistance <= wrapDistance) {
      start = Math.min(rahu, ketu);
      end = Math.max(rahu, ketu);
    } else {
      start = Math.max(rahu, ketu);
      end = Math.min(rahu, ketu) + 12;
    }

    // Check if planet is in the arc
    if (start < end) {
      return planet >= start && planet <= end;
    } else {
      return planet >= start || planet <= (end - 12);
    }
  }

  /**
   * Determine the type of Kaal Sarp Dosha
   * @private
   * @param {number} rahuHouse - Rahu's house
   * @param {number} ketuHouse - Ketu's house
   * @returns {string} Dosha type
   */
  _determineDoshaType(rahuHouse, ketuHouse) {
    const doshaTypes = {
      1: 'Anant Kalsarp Dosha',
      2: 'Kulik Kalsarp Dosha',
      3: 'Vasuki Kalsarp Dosha',
      4: 'Shankhpal Kalsarp Dosha',
      5: 'Padma Kalsarp Dosha',
      6: 'Mahapadma Kalsarp Dosha',
      7: 'Takshak Kalsarp Dosha',
      8: 'Karkotak Kalsarp Dosha',
      9: 'Shankhchud Kalsarp Dosha',
      10: 'Ghatak Kalsarp Dosha',
      11: 'Vishdhar Kalsarp Dosha',
      12: 'Sheshnag Kalsarp Dosha'
    };

    return doshaTypes[rahuHouse] || 'Kaal Sarp Dosha';
  }

  /**
   * Categorize planets as between or outside Rahu-Ketu
   * @private
   * @param {number} rahuHouse - Rahu's house
   * @param {number} ketuHouse - Ketu's house
   * @param {Array} planetPositions - Planet positions
   * @returns {Object} Categorized planets
   */
  _categorizePlanets(rahuHouse, ketuHouse, planetPositions) {
    const between = [];
    const outside = [];

    planetPositions.forEach(planet => {
      if (this._isBetweenRahuKetu(rahuHouse, ketuHouse, planet.house)) {
        between.push(planet.name.charAt(0).toUpperCase() + planet.name.slice(1));
      } else {
        outside.push(planet.name.charAt(0).toUpperCase() + planet.name.slice(1));
      }
    });

    return { between, outside };
  }

  /**
   * Calculate dosha strength
   * @private
   * @param {number} planetsBetween - Number of planets between
   * @param {number} planetsOutside - Number of planets outside
   * @returns {string} Strength level
   */
  _calculateDoshaStrength(planetsBetween, planetsOutside) {
    if (planetsBetween === 7) { return 'Full Kaal Sarp Dosha'; }
    if (planetsBetween >= 6) { return 'Partial Kaal Sarp Dosha'; }
    if (planetsBetween >= 4) { return 'Mild Kaal Sarp Dosha'; }
    return 'No Kaal Sarp Dosha';
  }

  /**
   * Calculate dosha severity
   * @private
   * @param {string} doshaType - Type of dosha
   * @param {string} doshaStrength - Strength of dosha
   * @param {number} doshaHouse - House where dosha is located
   * @returns {string} Severity level
   */
  _calculateDoshaSeverity(doshaType, doshaStrength, doshaHouse) {
    let severity = 'Mild';

    // Full Kaal Sarp is more severe
    if (doshaStrength === 'Full Kaal Sarp Dosha') {
      severity = 'High';
    } else if (doshaStrength === 'Partial Kaal Sarp Dosha') {
      severity = 'Moderate';
    }

    // Certain houses make it more severe
    const severeHouses = [1, 7, 8, 12]; // 1st, 7th, 8th, 12th houses
    if (severeHouses.includes(doshaHouse)) {
      severity = severity === 'High' ? 'Very High' : 'High';
    }

    return severity;
  }

  /**
   * Generate effects of Kaal Sarp Dosha
   * @private
   * @param {Object} analysis - Dosha analysis
   * @returns {Array} Effects
   */
  _generateDoshaEffects(analysis) {
    const effects = [];
    const { doshaHouse } = analysis;

    // Base effects based on dosha house
    const houseEffects = {
      1: ['Delays in career and life achievements', 'Health issues', 'Personality development challenges'],
      2: ['Financial difficulties', 'Family problems', 'Speech and communication issues'],
      3: ['Siblings and friends problems', 'Courage and confidence issues', 'Short journey obstacles'],
      4: ['Home and property issues', 'Mother-related problems', 'Education foundation problems'],
      5: ['Children and creativity issues', 'Intelligence and learning problems', 'Spiritual growth delays'],
      6: ['Health and enemies issues', 'Service and daily routine problems', 'Competition difficulties'],
      7: ['Marriage and partnership delays', 'Relationship problems', 'Business partnership issues'],
      8: ['Longevity and inheritance concerns', 'Transformation and occult interests', 'Sudden changes'],
      9: ['Fortune and father issues', 'Higher learning and travel problems', 'Spiritual guidance delays'],
      10: ['Career and reputation challenges', 'Authority and leadership issues', 'Public image problems'],
      11: ['Gains and elder siblings issues', 'Friends and hopes problems', 'Fulfillment delays'],
      12: ['Expenses and losses', 'Foreign lands and spirituality issues', 'Liberation and moksha delays']
    };

    effects.push(...(houseEffects[doshaHouse] || ['General life challenges and delays']));

    // Additional effects based on severity
    if (analysis.severity === 'Very High') {
      effects.push('Major life obstacles and repeated failures');
      effects.push('Strong karmic influences requiring significant spiritual effort');
    } else if (analysis.severity === 'High') {
      effects.push('Significant challenges in life areas ruled by the dosha house');
      effects.push('Need for consistent remedial measures');
    } else if (analysis.severity === 'Moderate') {
      effects.push('Moderate challenges that can be overcome with effort');
      effects.push('Periodic difficulties in specific life areas');
    }

    return effects;
  }

  /**
    * Generate Kaal Sarp Dosha remedies using comprehensive Vedic Remedies system
    * @private
    * @param {Object} analysis - Dosha analysis
    * @returns {Object} Comprehensive remedies package
    */
  _generateKaalSarpRemedies(analysis) {
    if (!this._vedicRemedies) {
      // Fallback to basic remedies if VedicRemedies not available
      return this._generateBasicKaalSarpRemedies(analysis);
    }

    try {
      // Get comprehensive remedies from VedicRemedies system
      const remediesData = this._vedicRemedies.generateDoshaRemedies('kaal_sarp');

      if (remediesData.error) {
        return this._generateBasicKaalSarpRemedies(analysis);
      }

      // Enhance with house-specific and severity-based remedies
      const enhancedRemedies = { ...remediesData };

      // Add house-specific remedies
      const { doshaHouse } = analysis;
      const houseSpecific = this._getHouseSpecificKaalSarpRemedies(doshaHouse);
      if (houseSpecific.length > 0) {
        enhancedRemedies.houseSpecific = houseSpecific;
      }

      // Add severity-based recommendations
      if (analysis.severity === 'Very High' || analysis.severity === 'High') {
        enhancedRemedies.urgent = {
          recommendation: 'Consult senior astrologer immediately for specialized remedies',
          priority: 'High'
        };
      }

      return enhancedRemedies;
    } catch (error) {
      logger.error('Error generating comprehensive Kaal Sarp remedies:', error);
      return this._generateBasicKaalSarpRemedies(analysis);
    }
  }

  /**
    * Generate basic Kaal Sarp remedies (fallback)
    * @private
    * @param {Object} analysis - Dosha analysis
    * @returns {Object} Basic remedies
    */
  _generateBasicKaalSarpRemedies(analysis) {
    const remedies = [];
    const { doshaHouse } = analysis;

    // General remedies for all Kaal Sarp Dosha
    remedies.push({
      type: 'Mantra',
      description: 'Chant "Om Namah Shivaya" 108 times daily',
      duration: 'Daily for 40 days'
    });

    remedies.push({
      type: 'Puja',
      description: 'Perform Kaal Sarp Dosha Nivaran Puja',
      duration: 'One time or annually'
    });

    remedies.push({
      type: 'Gemstone',
      description: 'Wear Rahu (Hessonite) and Ketu (Cat\'s Eye) gemstones',
      duration: 'After consulting astrologer'
    });

    // House-specific remedies
    const houseRemedies = this._getHouseSpecificKaalSarpRemedies(doshaHouse);
    remedies.push(...houseRemedies);

    // Severity-based additional remedies
    if (analysis.severity === 'Very High') {
      remedies.push({
        type: 'Advanced',
        description: 'Consult senior astrologer for specialized remedies',
        duration: 'Immediate'
      });
    }

    return { basic: remedies };
  }

  /**
    * Get house-specific Kaal Sarp remedies
    * @private
    * @param {number} doshaHouse - House where dosha is formed
    * @returns {Array} House-specific remedies
    */
  _getHouseSpecificKaalSarpRemedies(doshaHouse) {
    const houseRemedies = {
      1: [
        { type: 'Charity', description: 'Donate food and clothes to poor', duration: 'Weekly' },
        { type: 'Fasting', description: 'Fast on Mondays', duration: 'Weekly' }
      ],
      2: [
        { type: 'Charity', description: 'Donate to family temples', duration: 'Monthly' },
        { type: 'Worship', description: 'Worship family deities', duration: 'Daily' }
      ],
      3: [
        { type: 'Charity', description: 'Help siblings and cousins', duration: 'Regularly' },
        { type: 'Mantra', description: 'Chant Hanuman Chalisa', duration: 'Daily' }
      ],
      4: [
        { type: 'Worship', description: 'Worship Mother Goddess', duration: 'Daily' },
        { type: 'Charity', description: 'Donate to mother-related causes', duration: 'Monthly' }
      ],
      5: [
        { type: 'Education', description: 'Continue learning and education', duration: 'Ongoing' },
        { type: 'Worship', description: 'Worship Lord Ganesha', duration: 'Daily' }
      ],
      6: [
        { type: 'Service', description: 'Help sick people and animals', duration: 'Regularly' },
        { type: 'Mantra', description: 'Chant health-related mantras', duration: 'Daily' }
      ],
      7: [
        { type: 'Marriage', description: 'Consider early marriage if suitable', duration: 'As appropriate' },
        { type: 'Worship', description: 'Worship Lord Shiva and Parvati', duration: 'Daily' }
      ],
      8: [
        { type: 'Spiritual', description: 'Practice meditation and yoga', duration: 'Daily' },
        { type: 'Charity', description: 'Donate to spiritual causes', duration: 'Monthly' }
      ],
      9: [
        { type: 'Travel', description: 'Visit holy places', duration: 'Annually' },
        { type: 'Worship', description: 'Worship Guru and father figures', duration: 'Daily' }
      ],
      10: [
        { type: 'Career', description: 'Focus on career development', duration: 'Ongoing' },
        { type: 'Worship', description: 'Worship Lord Vishnu', duration: 'Daily' }
      ],
      11: [
        { type: 'Charity', description: 'Help elder siblings and friends', duration: 'Regularly' },
        { type: 'Mantra', description: 'Chant Lakshmi mantras', duration: 'Daily' }
      ],
      12: [
        { type: 'Charity', description: 'Donate to poor and temples', duration: 'Monthly' },
        { type: 'Spiritual', description: 'Practice detachment and spirituality', duration: 'Daily' }
      ]
    };

    return houseRemedies[doshaHouse] || [];
  }

  /**
   * Generate Kaal Sarp Dosha summary
   * @private
   * @param {Object} analysis - Dosha analysis
   * @param {Array} remedies - Remedies
   * @returns {string} Summary text
   */
  _generateKaalSarpSummary(analysis, remedies) {
    let summary = '🕉️ *Kaal Sarp Dosha Analysis*\n\n';

    if (analysis.hasDosha) {
      summary += '*⚠️ Kaal Sarp Dosha Present*\n\n';
      summary += `*Type:* ${analysis.doshaType}\n`;
      summary += `*Strength:* ${analysis.doshaStrength}\n`;
      summary += `*Severity:* ${analysis.severity}\n`;
      summary += `*Rahu Position:* ${analysis.rahuPosition}th house\n`;
      summary += `*Ketu Position:* ${analysis.ketuPosition}th house\n\n`;

      if (analysis.planetsBetween.length > 0) {
        summary += `*Planets Between Rahu-Ketu:* ${analysis.planetsBetween.join(', ')}\n`;
      }

      if (analysis.planetsOutside.length > 0) {
        summary += `*Planets Outside:* ${analysis.planetsOutside.join(', ')}\n`;
      }

      summary += '\n*Effects:*\n';
      analysis.effects.forEach(effect => {
        summary += `• ${effect}\n`;
      });

      summary += '\n*🕉️ Comprehensive Remedies:*\n\n';

      // Gemstones
      if (remedies.gemstones && remedies.gemstones.length > 0) {
        summary += '*💎 Recommended Gemstones:*\n';
        remedies.gemstones.forEach(gem => {
          summary += `• ${gem.name} (${gem.sanskrit}) - Wear on ${gem.finger}\n`;
        });
        summary += '\n';
      }

      // Mantras
      if (remedies.mantras && remedies.mantras.length > 0) {
        summary += '*📿 Powerful Mantras:*\n';
        remedies.mantras.forEach(mantra => {
          summary += `• "${mantra.beej}" (${mantra.count})\n`;
        });
        summary += '\n';
      }

      // Puja
      if (remedies.puja) {
        summary += '*🙏 Recommended Puja:*\n';
        summary += `• ${remedies.puja.name} (${remedies.puja.duration})\n`;
        summary += `• Benefits: ${remedies.puja.benefits}\n\n`;
      }

      // Special practices
      if (remedies.special) {
        summary += '*⚡ Special Practices:*\n';
        if (remedies.special.fasting) { summary += `• Fasting: ${remedies.special.fasting}\n`; }
        if (remedies.special.offerings) { summary += `• Offerings: ${remedies.special.offerings}\n`; }
        if (remedies.special.rituals) { summary += `• Rituals: ${remedies.special.rituals}\n`; }
        summary += '\n';
      }

      // House-specific remedies
      if (remedies.houseSpecific && remedies.houseSpecific.length > 0) {
        summary += '*🏠 House-Specific Remedies:*\n';
        remedies.houseSpecific.forEach(remedy => {
          summary += `• ${remedy.description} (${remedy.duration})\n`;
        });
        summary += '\n';
      }

      // Urgent recommendations
      if (remedies.urgent) {
        summary += `*🚨 ${remedies.urgent.recommendation}*\n\n`;
      }

      // Basic remedies fallback
      if (remedies.basic && remedies.basic.length > 0) {
        summary += '*Basic Remedies:*\n';
        remedies.basic.forEach(remedy => {
          summary += `• *${remedy.type}:* ${remedy.description}\n`;
          if (remedy.duration) {
            summary += `  Duration: ${remedy.duration}\n`;
          }
        });
        summary += '\n';
      }

      summary += '\n*Note:* Kaal Sarp Dosha effects can be mitigated through consistent remedial measures and spiritual practices. 🕉️';
    } else {
      summary += '*✅ No Kaal Sarp Dosha*\n\n';
      summary += 'Your birth chart does not have Kaal Sarp Dosha. This is generally considered favorable for life progression.\n\n';
      summary += '*Benefits:*\n';
      summary += '• Smoother life journey\n';
      summary += '• Fewer karmic obstacles\n';
      summary += '• Natural life flow\n\n';
      summary += 'However, individual planetary strengths still influence life experiences. 🕉️';
    }

    return summary;
  }

  /**
   * Generate Future Self Simulator analysis
   * @param {Object} birthData - User's birth data
   * @param {number} yearsAhead - Years to project (default 10)
   * @returns {Object} Future self analysis
   */
  async generateFutureSelfSimulator(birthData, yearsAhead = 10) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return {
          error: 'Complete birth details required for future self simulation'
        };
      }

      // Parse birth date and calculate current age
      const [birthDay, birthMonth, birthYear] = birthDate.split('/').map(Number);
      const birthDateObj = new Date(birthYear, birthMonth - 1, birthDay);
      const currentDate = new Date();
      const currentAge = Math.floor((currentDate - birthDateObj) / (365.25 * 24 * 60 * 60 * 1000));

      // Generate natal chart
      const natalChart = await this.generateBasicBirthChart({
        name,
        birthDate,
        birthTime,
        birthPlace
      });

      // Calculate life timeline
      const lifeTimeline = this._calculateLifeTimeline(natalChart, currentAge, yearsAhead);

      // Generate scenario models
      const scenarioModels = this._generateScenarioModels(natalChart, currentAge, yearsAhead);

      // Calculate goal projections
      const goalProjections = this._calculateGoalProjections(natalChart, currentAge, yearsAhead);

      // Analyze life stages
      const lifeStages = this._analyzeLifeStages(currentAge, yearsAhead);

      return {
        currentAge,
        projectionYears: yearsAhead,
        lifeTimeline,
        scenarioModels,
        goalProjections,
        lifeStages,
        summary: this._generateFutureSelfSummary(lifeTimeline, scenarioModels, goalProjections, lifeStages)
      };
    } catch (error) {
      logger.error('Error generating future self simulator:', error);
      return {
        error: 'Unable to generate future self simulation at this time'
      };
    }
  }

  /**
   * Calculate life timeline based on chart progression
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {number} currentAge - Current age
   * @param {number} yearsAhead - Years ahead
   * @returns {Array} Life timeline events
   */
  _calculateLifeTimeline(natalChart, currentAge, yearsAhead) {
    const timeline = [];
    const endAge = currentAge + yearsAhead;

    // Major life transitions based on Saturn returns and other cycles
    const saturnReturn1 = 29 - currentAge;
    const saturnReturn2 = 58 - currentAge;
    const saturnReturn3 = 87 - currentAge;

    // Jupiter returns (12-year cycles)
    const jupiterReturns = [];
    for (let age = currentAge + 12; age <= endAge; age += 12) {
      jupiterReturns.push(age - currentAge);
    }

    // Uranus opposition (around age 42)
    const uranusOpposition = 42 - currentAge;

    // Add major timeline events
    if (saturnReturn1 > 0 && saturnReturn1 <= yearsAhead) {
      timeline.push({
        age: currentAge + saturnReturn1,
        event: 'First Saturn Return',
        significance: 'Major life restructuring, career changes, responsibility',
        intensity: 'High',
        themes: ['Structure', 'Responsibility', 'Life review']
      });
    }

    if (saturnReturn2 > 0 && saturnReturn2 <= yearsAhead) {
      timeline.push({
        age: currentAge + saturnReturn2,
        event: 'Second Saturn Return',
        significance: 'Mid-life crisis resolution, wisdom gained, legacy building',
        intensity: 'High',
        themes: ['Wisdom', 'Legacy', 'Stability']
      });
    }

    jupiterReturns.forEach(yearsFromNow => {
      if (yearsFromNow <= yearsAhead) {
        timeline.push({
          age: currentAge + yearsFromNow,
          event: 'Jupiter Return',
          significance: 'Expansion, new opportunities, personal growth',
          intensity: 'Medium-High',
          themes: ['Growth', 'Opportunity', 'Learning']
        });
      }
    });

    if (uranusOpposition > 0 && uranusOpposition <= yearsAhead) {
      timeline.push({
        age: currentAge + uranusOpposition,
        event: 'Uranus Opposition',
        significance: 'Mid-life awakening, breaking free from limitations',
        intensity: 'High',
        themes: ['Freedom', 'Innovation', 'Change']
      });
    }

    // Add Dasha period changes
    const dashaPeriods = this.calculateVimshottariDasha({
      birthDate: natalChart.birthDate,
      birthTime: natalChart.birthTime
    });

    if (dashaPeriods.currentDasha) {
      const { remainingYears } = dashaPeriods.currentDasha;
      if (remainingYears <= yearsAhead) {
        timeline.push({
          age: currentAge + remainingYears,
          event: `Dasha Change: ${dashaPeriods.upcomingDashas[0]?.dasha} Period Begins`,
          significance: dashaPeriods.upcomingDashas[0]?.influence || 'New life themes emerge',
          intensity: 'Medium',
          themes: ['Transition', 'New phase', 'Life lessons']
        });
      }
    }

    // Sort timeline by age
    return timeline.sort((a, b) => a.age - b.age);
  }

  /**
   * Generate scenario models for different life choices
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {number} currentAge - Current age
   * @param {number} yearsAhead - Years ahead
   * @returns {Array} Scenario models
   */
  _generateScenarioModels(natalChart, currentAge, yearsAhead) {
    const scenarios = [];

    // Career scenarios based on 10th house and Midheaven
    const careerScenarios = this._generateCareerScenarios(natalChart, currentAge, yearsAhead);
    scenarios.push(...careerScenarios);

    // Relationship scenarios based on 7th house and Venus
    const relationshipScenarios = this._generateRelationshipScenarios(natalChart, currentAge, yearsAhead);
    scenarios.push(...relationshipScenarios);

    // Personal development scenarios based on 1st house and Sun
    const personalScenarios = this._generatePersonalScenarios(natalChart, currentAge, yearsAhead);
    scenarios.push(...personalScenarios);

    return scenarios;
  }

  /**
   * Generate career scenario models
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {number} currentAge - Current age
   * @param {number} yearsAhead - Years ahead
   * @returns {Array} Career scenarios
   */
  _generateCareerScenarios(natalChart, currentAge, yearsAhead) {
    const scenarios = [];
    const tenthHouse = natalChart.fullChart?.houses?.[9] || {}; // 10th house is index 9

    // Different career paths based on planetary placements
    const careerPaths = [
      {
        path: 'Leadership & Authority',
        trigger: 'Saturn in 10th or Capricorn MC',
        timeline: '5-7 years',
        indicators: ['Executive roles', 'Business ownership', 'Public recognition'],
        challenges: ['Work-life balance', 'Stress management'],
        successFactors: ['Discipline', 'Long-term vision', 'Team building']
      },
      {
        path: 'Creative & Innovative',
        trigger: 'Uranus in 10th or Aquarius MC',
        timeline: '3-5 years',
        indicators: ['Entrepreneurship', 'Tech/AI fields', 'Creative industries'],
        challenges: ['Financial stability', 'Structure'],
        successFactors: ['Innovation', 'Adaptability', 'Networking']
      },
      {
        path: 'Service & Healing',
        trigger: 'Neptune in 10th or Pisces MC',
        timeline: '4-6 years',
        indicators: ['Healthcare', 'Counseling', 'Creative arts', 'Spirituality'],
        challenges: ['Boundaries', 'Practical matters'],
        successFactors: ['Compassion', 'Intuition', 'Service orientation']
      },
      {
        path: 'Communication & Teaching',
        trigger: 'Mercury/Jupiter in 10th or Gemini/Sagittarius MC',
        timeline: '3-4 years',
        indicators: ['Writing', 'Teaching', 'Media', 'Consulting'],
        challenges: ['Focus', 'Practical implementation'],
        successFactors: ['Communication skills', 'Knowledge sharing', 'Adaptability']
      }
    ];

    // Select most relevant career path based on chart
    const relevantPath = this._selectRelevantCareerPath(natalChart, careerPaths);
    if (relevantPath) {
      scenarios.push({
        category: 'Career',
        scenario: relevantPath.path,
        probability: 'High',
        timeline: relevantPath.timeline,
        keyIndicators: relevantPath.indicators,
        challenges: relevantPath.challenges,
        successFactors: relevantPath.successFactors,
        astrologicalBasis: relevantPath.trigger
      });
    }

    return scenarios;
  }

  /**
   * Generate relationship scenario models
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {number} currentAge - Current age
   * @param {number} yearsAhead - Years ahead
   * @returns {Array} Relationship scenarios
   */
  _generateRelationshipScenarios(natalChart, currentAge, yearsAhead) {
    const scenarios = [];

    const relationshipPaths = [
      {
        path: 'Committed Partnership',
        trigger: 'Strong 7th house or Libra/Taurus emphasis',
        timeline: '2-4 years',
        indicators: ['Marriage', 'Long-term commitment', 'Shared goals'],
        challenges: ['Compromise', 'Individual growth'],
        successFactors: ['Communication', 'Shared values', 'Mutual respect']
      },
      {
        path: 'Personal Independence',
        trigger: 'Strong 1st/5th house or Aries/Leo emphasis',
        timeline: '3-5 years',
        indicators: ['Self-discovery', 'Creative pursuits', 'Personal freedom'],
        challenges: ['Loneliness', 'Commitment fears'],
        successFactors: ['Self-love', 'Independence', 'Personal growth']
      },
      {
        path: 'Community & Friendship',
        trigger: 'Strong 11th house or Aquarius emphasis',
        timeline: '2-3 years',
        indicators: ['Community involvement', 'Friendship networks', 'Group activities'],
        challenges: ['Intimacy', 'Deep connections'],
        successFactors: ['Social skills', 'Shared interests', 'Openness']
      }
    ];

    const relevantPath = this._selectRelevantRelationshipPath(natalChart, relationshipPaths);
    if (relevantPath) {
      scenarios.push({
        category: 'Relationships',
        scenario: relevantPath.path,
        probability: 'Medium-High',
        timeline: relevantPath.timeline,
        keyIndicators: relevantPath.indicators,
        challenges: relevantPath.challenges,
        successFactors: relevantPath.successFactors,
        astrologicalBasis: relevantPath.trigger
      });
    }

    return scenarios;
  }

  /**
   * Generate personal development scenario models
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {number} currentAge - Current age
   * @param {number} yearsAhead - Years ahead
   * @returns {Array} Personal scenarios
   */
  _generatePersonalScenarios(natalChart, currentAge, yearsAhead) {
    const scenarios = [];

    const personalPaths = [
      {
        path: 'Spiritual Awakening',
        trigger: 'Strong 12th/9th house or Pisces/Sagittarius emphasis',
        timeline: '4-6 years',
        indicators: ['Meditation', 'Spiritual practices', 'Inner peace', 'Higher purpose'],
        challenges: ['Grounding', 'Practical matters'],
        successFactors: ['Faith', 'Inner guidance', 'Surrender']
      },
      {
        path: 'Material Success',
        trigger: 'Strong 2nd/10th house or Taurus/Capricorn emphasis',
        timeline: '3-5 years',
        indicators: ['Financial stability', 'Career advancement', 'Material comfort'],
        challenges: ['Work-life balance', 'Meaningful work'],
        successFactors: ['Discipline', 'Planning', 'Persistence']
      },
      {
        path: 'Creative Expression',
        trigger: 'Strong 5th house or Leo emphasis',
        timeline: '2-4 years',
        indicators: ['Artistic pursuits', 'Creative projects', 'Self-expression'],
        challenges: ['Financial stability', 'Recognition'],
        successFactors: ['Creativity', 'Confidence', 'Persistence']
      }
    ];

    const relevantPath = this._selectRelevantPersonalPath(natalChart, personalPaths);
    if (relevantPath) {
      scenarios.push({
        category: 'Personal Growth',
        scenario: relevantPath.path,
        probability: 'Medium',
        timeline: relevantPath.timeline,
        keyIndicators: relevantPath.indicators,
        challenges: relevantPath.challenges,
        successFactors: relevantPath.successFactors,
        astrologicalBasis: relevantPath.trigger
      });
    }

    return scenarios;
  }

  /**
   * Calculate goal achievement projections
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {number} currentAge - Current age
   * @param {number} yearsAhead - Years ahead
   * @returns {Array} Goal projections
   */
  _calculateGoalProjections(natalChart, currentAge, yearsAhead) {
    const projections = [];

    // Common life goals and their astrological timing
    const goalCategories = [
      {
        category: 'Career',
        goals: ['Promotion', 'Career Change', 'Business Success', 'Financial Independence'],
        favorablePeriods: this._getFavorableCareerPeriods(natalChart, currentAge, yearsAhead)
      },
      {
        category: 'Relationships',
        goals: ['Marriage', 'Family', 'Deep Connection', 'Personal Growth'],
        favorablePeriods: this._getFavorableRelationshipPeriods(natalChart, currentAge, yearsAhead)
      },
      {
        category: 'Personal',
        goals: ['Health', 'Education', 'Travel', 'Spiritual Growth'],
        favorablePeriods: this._getFavorablePersonalPeriods(natalChart, currentAge, yearsAhead)
      }
    ];

    goalCategories.forEach(category => {
      category.goals.forEach(goal => {
        const favorablePeriods = category.favorablePeriods[goal] || [];
        projections.push({
          goal,
          category: category.category,
          favorablePeriods,
          overallLikelihood: this._calculateGoalLikelihood(natalChart, goal, category.category),
          keyFactors: this._getGoalSuccessFactors(natalChart, goal, category.category)
        });
      });
    });

    return projections;
  }

  /**
   * Analyze life stages progression
   * @private
   * @param {number} currentAge - Current age
   * @param {number} yearsAhead - Years ahead
   * @returns {Array} Life stages
   */
  _analyzeLifeStages(currentAge, yearsAhead) {
    const stages = [];
    const endAge = currentAge + yearsAhead;

    // Life stage definitions
    const lifeStageDefinitions = [
      { min: 0, max: 21, stage: 'Foundation & Learning', themes: ['Education', 'Identity', 'Independence'] },
      { min: 22, max: 35, stage: 'Establishment', themes: ['Career', 'Relationships', 'Stability'] },
      { min: 36, max: 50, stage: 'Achievement & Family', themes: ['Success', 'Family', 'Responsibility'] },
      { min: 51, max: 65, stage: 'Mid-life Transition', themes: ['Reflection', 'Change', 'Legacy'] },
      { min: 66, max: 80, stage: 'Elder Wisdom', themes: ['Wisdom', 'Mentoring', 'Inner peace'] },
      { min: 81, max: 120, stage: 'Sage Years', themes: ['Spirituality', 'Legacy', 'Transcendence'] }
    ];

    lifeStageDefinitions.forEach(stageDef => {
      if (stageDef.max >= currentAge && stageDef.min <= endAge) {
        const startAge = Math.max(stageDef.min, currentAge);
        const endAgeInStage = Math.min(stageDef.max, endAge);

        stages.push({
          stage: stageDef.stage,
          ageRange: `${startAge}-${endAgeInStage}`,
          duration: endAgeInStage - startAge,
          themes: stageDef.themes,
          challenges: this._getStageChallenges(stageDef.stage),
          opportunities: this._getStageOpportunities(stageDef.stage)
        });
      }
    });

    return stages;
  }

  /**
   * Generate future self summary
   * @private
   * @param {Array} lifeTimeline - Life timeline
   * @param {Array} scenarioModels - Scenario models
   * @param {Array} goalProjections - Goal projections
   * @param {Array} lifeStages - Life stages
   * @returns {string} Summary text
   */
  _generateFutureSelfSummary(lifeTimeline, scenarioModels, goalProjections, lifeStages) {
    let summary = '🔮 *Future Self Simulator Analysis*\n\n';

    if (lifeStages.length > 0) {
      summary += '*Life Stage Progression:*\n';
      lifeStages.forEach(stage => {
        summary += `• *${stage.stage}* (${stage.ageRange}): ${stage.themes.join(', ')}\n`;
      });
      summary += '\n';
    }

    if (lifeTimeline.length > 0) {
      summary += '*Major Life Transitions:*\n';
      lifeTimeline.slice(0, 3).forEach(event => {
        summary += `• Age ${Math.round(event.age)}: ${event.event}\n`;
        summary += `  ${event.significance}\n\n`;
      });
    }

    if (scenarioModels.length > 0) {
      summary += '*Potential Life Scenarios:*\n';
      scenarioModels.forEach(scenario => {
        summary += `• *${scenario.category}:* ${scenario.scenario} (${scenario.probability} probability)\n`;
        summary += `  Timeline: ${scenario.timeline}\n\n`;
      });
    }

    summary += '*Key Insights:*\n';
    summary += '• Your future self is calling you toward ';
    if (scenarioModels.length > 0) {
      summary += scenarioModels[0].scenario.toLowerCase();
    }
    summary += '\n• Focus on ';
    if (goalProjections.length > 0) {
      const topGoals = goalProjections.slice(0, 2).map(p => p.goal.toLowerCase());
      summary += topGoals.join(' and ');
    }
    summary += '\n• Trust the timing of your ';
    if (lifeStages.length > 0) {
      summary += lifeStages[0].stage.toLowerCase();
    }
    summary += '\n\n';

    summary += 'Remember: The future is not fixed - it\'s shaped by your choices and consciousness! ✨';

    return summary;
  }

  /**
   * Select relevant career path based on chart
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {Array} careerPaths - Career paths
   * @returns {Object} Selected path
   */
  _selectRelevantCareerPath(natalChart, careerPaths) {
    // Simplified selection based on sun sign and rising sign
    const { sunSign } = natalChart;
    const { risingSign } = natalChart;

    const signMappings = {
      Capricorn: 'Leadership & Authority',
      Aquarius: 'Creative & Innovative',
      Pisces: 'Service & Healing',
      Gemini: 'Communication & Teaching',
      Sagittarius: 'Communication & Teaching',
      Aries: 'Leadership & Authority',
      Leo: 'Creative & Innovative'
    };

    const preferredPath = signMappings[sunSign] || signMappings[risingSign];
    return careerPaths.find(path => path.path === preferredPath) || careerPaths[0];
  }

  /**
   * Select relevant relationship path
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {Array} relationshipPaths - Relationship paths
   * @returns {Object} Selected path
   */
  _selectRelevantRelationshipPath(natalChart, relationshipPaths) {
    const venusSign = natalChart.fullChart?.planets?.venus?.signName || natalChart.sunSign;

    const signMappings = {
      Libra: 'Committed Partnership',
      Taurus: 'Committed Partnership',
      Aries: 'Personal Independence',
      Leo: 'Personal Independence',
      Aquarius: 'Community & Friendship'
    };

    const preferredPath = signMappings[venusSign];
    return relationshipPaths.find(path => path.path === preferredPath) || relationshipPaths[0];
  }

  /**
   * Select relevant personal path
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {Array} personalPaths - Personal paths
   * @returns {Object} Selected path
   */
  _selectRelevantPersonalPath(natalChart, personalPaths) {
    const { moonSign } = natalChart;

    const signMappings = {
      Pisces: 'Spiritual Awakening',
      Sagittarius: 'Spiritual Awakening',
      Taurus: 'Material Success',
      Capricorn: 'Material Success',
      Leo: 'Creative Expression'
    };

    const preferredPath = signMappings[moonSign];
    return personalPaths.find(path => path.path === preferredPath) || personalPaths[0];
  }

  /**
   * Get favorable career periods
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {number} currentAge - Current age
   * @param {number} yearsAhead - Years ahead
   * @returns {Object} Favorable periods
   */
  _getFavorableCareerPeriods(natalChart, currentAge, yearsAhead) {
    // Simplified - in production would analyze transits and dashas
    return {
      Promotion: [`${currentAge + 1}-${currentAge + 3} years`],
      'Career Change': [`${currentAge + 2}-${currentAge + 4} years`],
      'Business Success': [`${currentAge + 3}-${currentAge + 5} years`],
      'Financial Independence': [`${currentAge + 4}-${currentAge + 7} years`]
    };
  }

  /**
   * Get favorable relationship periods
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {number} currentAge - Current age
   * @param {number} yearsAhead - Years ahead
   * @returns {Object} Favorable periods
   */
  _getFavorableRelationshipPeriods(natalChart, currentAge, yearsAhead) {
    return {
      Marriage: [`${currentAge + 1}-${currentAge + 3} years`],
      Family: [`${currentAge + 2}-${currentAge + 5} years`],
      'Deep Connection': [`${currentAge + 1}-${currentAge + 4} years`],
      'Personal Growth': [`${currentAge + 3}-${currentAge + 6} years`]
    };
  }

  /**
   * Get favorable personal periods
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {number} currentAge - Current age
   * @param {number} yearsAhead - Years ahead
   * @returns {Object} Favorable periods
   */
  _getFavorablePersonalPeriods(natalChart, currentAge, yearsAhead) {
    return {
      Health: [`${currentAge + 1}-${currentAge + 2} years`],
      Education: [`${currentAge + 1}-${currentAge + 3} years`],
      Travel: [`${currentAge + 2}-${currentAge + 4} years`],
      'Spiritual Growth': [`${currentAge + 3}-${currentAge + 6} years`]
    };
  }

  /**
   * Calculate upcoming eclipses using Swiss Ephemeris
   * @private
   * @param {Date} startDate - Start date for eclipse search
   * @param {Date} endDate - End date for eclipse search
   * @param {string} birthPlace - Birth place for visibility calculation
   * @returns {Array} Upcoming eclipses
   */
  async _calculateUpcomingEclipses(startDate, endDate, birthPlace) {
    const eclipses = [];

    try {
      // Get coordinates for birth place
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);

      // Search for eclipses in the date range
      const startJD = sweph.julday(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate(),
        0, 1
      );

      const endJD = sweph.julday(
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        endDate.getDate(),
        0, 1
      );

      // Search for solar eclipses
      let searchJD = startJD;
      while (searchJD <= endJD) {
        try {
          const solarEclipse = sweph.sol_eclipse_when_loc(
            searchJD, null, [longitude, latitude, 0], 2
          );

          if (solarEclipse && solarEclipse.return_code > 0) {
            const eclipseJD = solarEclipse.tret[0];
            if (eclipseJD >= startJD && eclipseJD <= endJD) {
              const eclipseDate = this._jdToDate(eclipseJD);
              const eclipseType = this._getEclipseType(solarEclipse.return_code);

              eclipses.push({
                date: eclipseDate.toLocaleDateString(),
                type: 'solar',
                subtype: eclipseType,
                visibility: this._calculateEclipseVisibility(eclipseDate, latitude, longitude, 'solar'),
                significance: this._getEclipseSignificance('solar', eclipseType),
                timing: eclipseDate.toLocaleTimeString(),
                jd: eclipseJD
              });
            }
            searchJD = eclipseJD + 1; // Move past this eclipse
          } else {
            break; // No more eclipses found
          }
        } catch (error) {
          logger.warn('Error calculating solar eclipse:', error.message);
          break;
        }
      }

      // Search for lunar eclipses
      searchJD = startJD;
      while (searchJD <= endJD) {
        try {
          const lunarEclipse = sweph.lun_eclipse_when_loc(
            searchJD, null, [longitude, latitude, 0], 2
          );

          if (lunarEclipse && lunarEclipse.return_code > 0) {
            const eclipseJD = lunarEclipse.tret[0];
            if (eclipseJD >= startJD && eclipseJD <= endJD) {
              const eclipseDate = this._jdToDate(eclipseJD);
              const eclipseType = this._getEclipseType(lunarEclipse.return_code);

              eclipses.push({
                date: eclipseDate.toLocaleDateString(),
                type: 'lunar',
                subtype: eclipseType,
                visibility: this._calculateEclipseVisibility(eclipseDate, latitude, longitude, 'lunar'),
                significance: this._getEclipseSignificance('lunar', eclipseType),
                timing: eclipseDate.toLocaleTimeString(),
                jd: eclipseJD
              });
            }
            searchJD = eclipseJD + 1; // Move past this eclipse
          } else {
            break; // No more eclipses found
          }
        } catch (error) {
          logger.warn('Error calculating lunar eclipse:', error.message);
          break;
        }
      }

      // Sort eclipses by date
      eclipses.sort((a, b) => a.jd - b.jd);
    } catch (error) {
      logger.error('Error calculating eclipses with Swiss Ephemeris:', error);
      // Fallback to basic eclipse information if calculation fails
      return this._getFallbackEclipseData(startDate, endDate, birthPlace);
    }

    return eclipses;
  }

  /**
   * Convert Julian Day to Date object
   * @private
   * @param {number} jd - Julian Day
   * @returns {Date} Date object
   */
  _jdToDate(jd) {
    const gregDate = sweph.revjul(jd, 1);
    return new Date(gregDate.year, gregDate.month - 1, gregDate.day, gregDate.hour);
  }

  /**
   * Get eclipse type from return code
   * @private
   * @param {number} returnCode - Swiss Ephemeris return code
   * @returns {string} Eclipse type
   */
  _getEclipseType(returnCode) {
    if (returnCode & 1) { return 'total'; }
    if (returnCode & 2) { return 'annular'; }
    if (returnCode & 4) { return 'partial'; }
    if (returnCode & 8) { return 'penumbral'; }
    return 'partial';
  }

  /**
   * Calculate eclipse visibility for location
   * @private
   * @param {Date} eclipseDate - Eclipse date
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {string} type - 'solar' or 'lunar'
   * @returns {string} Visibility description
   */
  _calculateEclipseVisibility(eclipseDate, latitude, longitude, type) {
    // Simplified visibility calculation - in production would use detailed eclipse path data
    if (type === 'lunar') {
      return 'Visible from location if moon is above horizon';
    }

    // For solar eclipses, check if location is in typical eclipse paths
    const month = eclipseDate.getMonth() + 1;
    if (latitude > 0) { // Northern hemisphere
      if (month >= 3 && month <= 5) { return 'Possible northern latitude visibility'; }
      if (month >= 9 && month <= 11) { return 'Possible northern latitude visibility'; }
    } else { // Southern hemisphere
      if (month >= 3 && month <= 5) { return 'Possible southern latitude visibility'; }
      if (month >= 9 && month <= 11) { return 'Possible southern latitude visibility'; }
    }

    return 'Visibility depends on eclipse path';
  }

  /**
   * Get eclipse astrological significance
   * @private
   * @param {string} type - 'solar' or 'lunar'
   * @param {string} subtype - Eclipse subtype
   * @returns {string} Significance description
   */
  _getEclipseSignificance(type, subtype) {
    if (type === 'solar') {
      return `${subtype} solar eclipse: Major life changes, new beginnings, and external transformations`;
    } else {
      return `${subtype} lunar eclipse: Emotional transformation, relationship changes, and internal shifts`;
    }
  }

  /**
   * Fallback eclipse data if Swiss Ephemeris calculation fails
   * @private
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {string} birthPlace - Birth place
   * @returns {Array} Basic eclipse data
   */
  _getFallbackEclipseData(startDate, endDate, birthPlace) {
    // Provide basic eclipse information as fallback
    const eclipses = [];
    const currentYear = new Date().getFullYear();

    // Add known eclipses for current year (simplified)
    if (currentYear >= 2024) {
      eclipses.push({
        date: 'Approximate eclipse dates',
        type: 'solar/lunar',
        subtype: 'various',
        visibility: 'Check local astronomical data',
        significance: 'Transformation and change periods',
        timing: 'Varies by location'
      });
    }

    return eclipses;
  }

  /**
   * Get goal success factors
   * @private
   * @param {Object} natalChart - Natal chart
   * @param {string} goal - Goal name
   * @param {string} category - Category
   * @returns {Array} Success factors
   */
  _getGoalSuccessFactors(natalChart, goal, category) {
    const factors = {
      Career: ['Persistence', 'Networking', 'Skill development'],
      Relationships: ['Communication', 'Compromise', 'Trust'],
      Personal: ['Self-care', 'Learning', 'Inner work']
    };

    return factors[category] || ['Focus', 'Action', 'Patience'];
  }

  /**
   * Get stage challenges
   * @private
   * @param {string} stage - Life stage
   * @returns {Array} Challenges
   */
  _getStageChallenges(stage) {
    const challenges = {
      'Foundation & Learning': ['Identity confusion', 'Independence struggles'],
      Establishment: ['Work-life balance', 'Financial pressure'],
      'Achievement & Family': ['Responsibility overload', 'Mid-life questions'],
      'Mid-life Transition': ['Change resistance', 'Meaning search'],
      'Elder Wisdom': ['Health concerns', 'Legacy questions'],
      'Sage Years': ['Physical limitations', 'Loss of loved ones']
    };

    return challenges[stage] || ['Adaptation', 'Growth'];
  }

  /**
   * Get stage opportunities
   * @private
   * @param {string} stage - Life stage
   * @returns {Array} Opportunities
   */
  _getStageOpportunities(stage) {
    const opportunities = {
      'Foundation & Learning': ['Skill building', 'Self-discovery'],
      Establishment: ['Career growth', 'Relationship building'],
      'Achievement & Family': ['Leadership', 'Family legacy'],
      'Mid-life Transition': ['Wisdom sharing', 'New beginnings'],
      'Elder Wisdom': ['Mentoring', 'Life reflection'],
      'Sage Years': ['Spiritual depth', 'Timeless wisdom']
    };

    return opportunities[stage] || ['Growth', 'Wisdom'];
  }

  /**
   * Generate Group & Family Astrology analysis
   * @param {Array} familyMembers - Array of family member birth data
   * @param {string} groupType - Type of group ('family', 'friends', 'couple', etc.)
   * @returns {Object} Group astrology analysis
   */
  async generateGroupAstrology(familyMembers, groupType = 'family') {
    try {
      if (!familyMembers || familyMembers.length < 2) {
        return {
          error: 'At least 2 family members required for group analysis'
        };
      }

      // Generate individual charts for all members
      const memberCharts = await Promise.all(familyMembers.map(async member =>
        await this.generateBasicBirthChart({
          name: member.name,
          birthDate: member.birthDate,
          birthTime: member.birthTime || '12:00',
          birthPlace: member.birthPlace || 'Delhi'
        })
      ));

      // Create composite chart
      const compositeChart = this._calculateCompositeChart(memberCharts);

      // Analyze group compatibility
      const compatibilityAnalysis = this._analyzeGroupCompatibility(memberCharts, groupType);

      // Calculate shared journey patterns
      const sharedJourney = this._calculateSharedJourney(memberCharts, groupType);

      // Generate group insights
      const groupInsights = this._generateGroupInsights(memberCharts, compositeChart, groupType);

      return {
        groupType,
        memberCount: familyMembers.length,
        compositeChart,
        compatibilityAnalysis,
        sharedJourney,
        groupInsights,
        summary: this._generateGroupSummary(memberCharts, compositeChart, compatibilityAnalysis, groupType)
      };
    } catch (error) {
      logger.error('Error generating group astrology:', error);
      return {
        error: 'Unable to generate group astrology analysis at this time'
      };
    }
  }

  /**
   * Calculate composite chart for group
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @returns {Object} Composite chart
   */
  _calculateCompositeChart(memberCharts) {
    const composite = {
      planets: {},
      houses: {},
      dominantElements: {},
      dominantQualities: {},
      stelliums: []
    };

    // Initialize planet positions
    const planetNames = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

    planetNames.forEach(planet => {
      const positions = memberCharts
        .map(chart => chart.fullChart?.planets?.[planet])
        .filter(p => p && p.longitude)
        .map(p => p.longitude);

      if (positions.length > 0) {
        // Calculate average position (simplified composite method)
        const avgLongitude = positions.reduce((sum, pos) => sum + pos, 0) / positions.length;

        // Find most common sign
        const signs = memberCharts
          .map(chart => chart.fullChart?.planets?.[planet]?.signName)
          .filter(sign => sign);

        const signCounts = {};
        signs.forEach(sign => {
          signCounts[sign] = (signCounts[sign] || 0) + 1;
        });

        const dominantSign = Object.entries(signCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

        composite.planets[planet] = {
          longitude: avgLongitude,
          signName: dominantSign,
          compositeNature: positions.length === memberCharts.length ? 'unanimous' : 'mixed'
        };
      }
    });

    // Calculate dominant elements
    const allElements = memberCharts.flatMap(chart =>
      chart.dominantElements || []
    );

    const elementCounts = {};
    allElements.forEach(element => {
      elementCounts[element] = (elementCounts[element] || 0) + 1;
    });

    composite.dominantElements = Object.entries(elementCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([element]) => element);

    // Calculate dominant qualities
    const allQualities = memberCharts.flatMap(chart =>
      chart.dominantQualities || []
    );

    const qualityCounts = {};
    allQualities.forEach(quality => {
      qualityCounts[quality] = (qualityCounts[quality] || 0) + 1;
    });

    composite.dominantQualities = Object.entries(qualityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([quality]) => quality);

    return composite;
  }

  /**
   * Analyze group compatibility
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @param {string} groupType - Type of group
   * @returns {Object} Compatibility analysis
   */
  _analyzeGroupCompatibility(memberCharts, groupType) {
    const compatibility = {
      overallScore: 0,
      strengths: [],
      challenges: [],
      harmonyFactors: [],
      communicationStyle: '',
      decisionMaking: '',
      conflictResolution: ''
    };

    // Analyze element compatibility
    const elementCompatibility = this._analyzeElementCompatibility(memberCharts);
    compatibility.overallScore += elementCompatibility.score;
    compatibility.strengths.push(...elementCompatibility.strengths);
    compatibility.challenges.push(...elementCompatibility.challenges);

    // Analyze sun-moon compatibility
    const sunMoonCompatibility = this._analyzeSunMoonCompatibility(memberCharts);
    compatibility.overallScore += sunMoonCompatibility.score;
    compatibility.harmonyFactors.push(...sunMoonCompatibility.factors);

    // Group-specific analysis
    switch (groupType) {
    case 'family':
      compatibility.communicationStyle = this._analyzeFamilyCommunication(memberCharts);
      compatibility.decisionMaking = this._analyzeFamilyDecisionMaking(memberCharts);
      compatibility.conflictResolution = 'Emotional bonding with space for individual expression';
      break;
    case 'couple':
      compatibility.communicationStyle = this._analyzeCoupleCommunication(memberCharts);
      compatibility.decisionMaking = 'Collaborative with mutual respect';
      compatibility.conflictResolution = 'Direct communication with empathy';
      break;
    case 'friends':
      compatibility.communicationStyle = this._analyzeFriendCommunication(memberCharts);
      compatibility.decisionMaking = 'Democratic and flexible';
      compatibility.conflictResolution = 'Light-hearted with quick resolution';
      break;
    default:
      compatibility.communicationStyle = 'Mixed communication styles';
      compatibility.decisionMaking = 'Adaptive approach';
      compatibility.conflictResolution = 'Context-dependent';
    }

    // Normalize overall score
    compatibility.overallScore = Math.min(100, Math.max(0, Math.round(compatibility.overallScore / 2)));

    return compatibility;
  }

  /**
   * Calculate shared journey patterns
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @param {string} groupType - Type of group
   * @returns {Object} Shared journey analysis
   */
  _calculateSharedJourney(memberCharts, groupType) {
    const sharedJourney = {
      commonThemes: [],
      sharedChallenges: [],
      collectiveStrengths: [],
      groupPurpose: '',
      timing: {
        favorablePeriods: [],
        challengingPeriods: []
      },
      growthOpportunities: []
    };

    // Find common sun signs
    const sunSigns = memberCharts.map(chart => chart.sunSign);
    const sunSignCounts = {};
    sunSigns.forEach(sign => {
      sunSignCounts[sign] = (sunSignCounts[sign] || 0) + 1;
    });

    const commonSunSigns = Object.entries(sunSignCounts)
      .filter(([, count]) => count > 1)
      .map(([sign]) => sign);

    if (commonSunSigns.length > 0) {
      sharedJourney.commonThemes.push(`Shared ${commonSunSigns.join('/')} energy`);
    }

    // Find common elements
    const commonElements = memberCharts
      .flatMap(chart => chart.dominantElements || [])
      .filter((element, index, arr) => arr.indexOf(element) !== index); // Find duplicates

    if (commonElements.length > 0) {
      const uniqueElements = [...new Set(commonElements)];
      sharedJourney.commonThemes.push(`Collective ${uniqueElements.join('/')} influence`);
    }

    // Group-specific journey themes
    switch (groupType) {
    case 'family':
      sharedJourney.groupPurpose = 'Building lasting legacy and emotional security';
      sharedJourney.sharedChallenges = ['Balancing individual needs with family unity', 'Generational patterns and healing'];
      sharedJourney.collectiveStrengths = ['Deep emotional bonds', 'Shared history and values'];
      sharedJourney.growthOpportunities = ['Family healing work', 'Intergenerational wisdom sharing'];
      break;
    case 'couple':
      sharedJourney.groupPurpose = 'Mutual growth and partnership evolution';
      sharedJourney.sharedChallenges = ['Merging individual identities', 'Communication differences'];
      sharedJourney.collectiveStrengths = ['Intimate emotional connection', 'Shared life vision'];
      sharedJourney.growthOpportunities = ['Relationship deepening', 'Joint spiritual exploration'];
      break;
    case 'friends':
      sharedJourney.groupPurpose = 'Mutual support and shared adventures';
      sharedJourney.sharedChallenges = ['Maintaining connection over time', 'Different life stages'];
      sharedJourney.collectiveStrengths = ['Loyalty and acceptance', 'Shared experiences'];
      sharedJourney.growthOpportunities = ['Personal growth support', 'Adventure and exploration'];
      break;
    }

    // Calculate timing based on group energy
    sharedJourney.timing.favorablePeriods = this._calculateGroupFavorablePeriods(memberCharts, groupType);
    sharedJourney.timing.challengingPeriods = this._calculateGroupChallengingPeriods(memberCharts, groupType);

    return sharedJourney;
  }

  /**
   * Generate group insights
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @param {Object} compositeChart - Composite chart
   * @param {string} groupType - Type of group
   * @returns {Array} Group insights
   */
  _generateGroupInsights(memberCharts, compositeChart, groupType) {
    const insights = [];

    // Composite chart insights
    if (compositeChart.dominantElements.length > 0) {
      insights.push({
        type: 'element',
        insight: `Group energy is dominated by ${compositeChart.dominantElements.join(' and ')} elements`,
        significance: this._getElementGroupSignificance(compositeChart.dominantElements)
      });
    }

    // Planetary patterns
    Object.entries(compositeChart.planets).forEach(([planet, data]) => {
      if (data.compositeNature === 'unanimous') {
        insights.push({
          type: 'planetary',
          insight: `Strong collective ${planet} energy in ${data.signName}`,
          significance: this._getPlanetGroupSignificance(planet, data.signName, groupType)
        });
      }
    });

    // Group dynamic insights
    const dynamicInsights = this._analyzeGroupDynamics(memberCharts, groupType);
    insights.push(...dynamicInsights);

    return insights;
  }

  /**
   * Generate group summary
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @param {Object} compositeChart - Composite chart
   * @param {Object} compatibilityAnalysis - Compatibility analysis
   * @param {string} groupType - Type of group
   * @returns {string} Summary text
   */
  _generateGroupSummary(memberCharts, compositeChart, compatibilityAnalysis, groupType) {
    let summary = `👨‍👩‍👧‍👦 *${groupType.charAt(0).toUpperCase() + groupType.slice(1)} Astrology Analysis*\n\n`;

    summary += `*Group Compatibility:* ${compatibilityAnalysis.overallScore}% harmony\n\n`;

    if (compositeChart.dominantElements.length > 0) {
      summary += `*Dominant Energies:* ${compositeChart.dominantElements.join(' & ')}\n`;
    }

    summary += `*Communication Style:* ${compatibilityAnalysis.communicationStyle}\n`;
    summary += `*Decision Making:* ${compatibilityAnalysis.decisionMaking}\n\n`;

    if (compatibilityAnalysis.strengths.length > 0) {
      summary += '*Group Strengths:*\n';
      compatibilityAnalysis.strengths.slice(0, 2).forEach(strength => {
        summary += `• ${strength}\n`;
      });
      summary += '\n';
    }

    summary += `*Collective Purpose:* Building strong ${groupType} bonds through shared growth and understanding.\n\n`;

    summary += 'Your group\'s astrological synergy creates a powerful collective energy! 🌟';

    return summary;
  }

  /**
   * Analyze element compatibility
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @returns {Object} Element compatibility analysis
   */
  _analyzeElementCompatibility(memberCharts) {
    const analysis = {
      score: 50, // Base score
      strengths: [],
      challenges: []
    };

    const elements = memberCharts.flatMap(chart => chart.dominantElements || []);
    const elementCounts = {};

    elements.forEach(element => {
      elementCounts[element] = (elementCounts[element] || 0) + 1;
    });

    // Compatible element combinations
    const compatiblePairs = [
      ['fire', 'air'],
      ['earth', 'water'],
      ['fire', 'earth'],
      ['air', 'water']
    ];

    let compatibilityScore = 0;
    compatiblePairs.forEach(([elem1, elem2]) => {
      if (elementCounts[elem1] && elementCounts[elem2]) {
        compatibilityScore += 20;
        analysis.strengths.push(`${elem1} and ${elem2} elements create dynamic harmony`);
      }
    });

    // Challenging combinations
    const challengingPairs = [
      ['fire', 'water'],
      ['air', 'earth']
    ];

    challengingPairs.forEach(([elem1, elem2]) => {
      if (elementCounts[elem1] && elementCounts[elem2]) {
        compatibilityScore -= 15;
        analysis.challenges.push(`${elem1}-${elem2} tension requires conscious balance`);
      }
    });

    analysis.score += compatibilityScore;

    return analysis;
  }

  /**
   * Analyze sun-moon compatibility
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @returns {Object} Sun-moon compatibility analysis
   */
  _analyzeSunMoonCompatibility(memberCharts) {
    const analysis = {
      score: 30, // Base score
      factors: []
    };

    const sunSigns = memberCharts.map(chart => chart.sunSign);
    const moonSigns = memberCharts.map(chart => chart.moonSign);

    // Check for complementary signs
    const complementaryPairs = [
      ['Aries', 'Cancer'], ['Taurus', 'Leo'], ['Gemini', 'Virgo'],
      ['Cancer', 'Scorpio'], ['Leo', 'Sagittarius'], ['Virgo', 'Capricorn'],
      ['Libra', 'Aquarius'], ['Scorpio', 'Pisces'], ['Sagittarius', 'Aries'],
      ['Capricorn', 'Taurus'], ['Aquarius', 'Gemini'], ['Pisces', 'Cancer']
    ];

    let compatibilityBonus = 0;
    complementaryPairs.forEach(([sign1, sign2]) => {
      if (sunSigns.includes(sign1) && moonSigns.includes(sign2)) {
        compatibilityBonus += 10;
        analysis.factors.push(`${sign1} Sun with ${sign2} Moon creates natural understanding`);
      }
    });

    analysis.score += compatibilityBonus;

    return analysis;
  }

  /**
   * Analyze family communication style
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @returns {string} Communication style
   */
  _analyzeFamilyCommunication(memberCharts) {
    const mercurySigns = memberCharts
      .map(chart => chart.fullChart?.planets?.mercury?.signName)
      .filter(sign => sign);

    const signCounts = {};
    mercurySigns.forEach(sign => {
      signCounts[sign] = (signCounts[sign] || 0) + 1;
    });

    const dominantSign = Object.entries(signCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    const communicationStyles = {
      Gemini: 'Expressive and intellectual',
      Virgo: 'Practical and detail-oriented',
      Libra: 'Diplomatic and harmonious',
      Sagittarius: 'Direct and philosophical',
      Aquarius: 'Innovative and detached'
    };

    return communicationStyles[dominantSign] || 'Mixed communication approaches';
  }

  /**
   * Analyze family decision making
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @returns {string} Decision making style
   */
  _analyzeFamilyDecisionMaking(memberCharts) {
    const saturnSigns = memberCharts
      .map(chart => chart.fullChart?.planets?.saturn?.signName)
      .filter(sign => sign);

    if (saturnSigns.includes('Capricorn') || saturnSigns.includes('Aquarius')) {
      return 'Structured and long-term focused';
    } else if (saturnSigns.includes('Cancer') || saturnSigns.includes('Leo')) {
      return 'Emotionally considerate with family values';
    } else {
      return 'Balanced approach with flexibility';
    }
  }

  /**
   * Analyze couple communication
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @returns {string} Communication style
   */
  _analyzeCoupleCommunication(memberCharts) {
    const venusSigns = memberCharts
      .map(chart => chart.fullChart?.planets?.venus?.signName)
      .filter(sign => sign);

    if (venusSigns.includes('Libra') || venusSigns.includes('Gemini')) {
      return 'Harmonious and expressive';
    } else if (venusSigns.includes('Scorpio') || venusSigns.includes('Cancer')) {
      return 'Deep and emotionally intense';
    } else {
      return 'Direct and authentic';
    }
  }

  /**
   * Analyze friend communication
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @returns {string} Communication style
   */
  _analyzeFriendCommunication(memberCharts) {
    const mercurySigns = memberCharts
      .map(chart => chart.fullChart?.planets?.mercury?.signName)
      .filter(sign => sign);

    if (mercurySigns.includes('Gemini') || mercurySigns.includes('Sagittarius')) {
      return 'Lively and intellectual';
    } else if (mercurySigns.includes('Cancer') || mercurySigns.includes('Pisces')) {
      return 'Empathetic and intuitive';
    } else {
      return 'Straightforward and genuine';
    }
  }

  /**
   * Calculate group favorable periods
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @param {string} groupType - Type of group
   * @returns {Array} Favorable periods
   */
  _calculateGroupFavorablePeriods(memberCharts, groupType) {
    // Simplified - in production would analyze collective transits
    return [
      'Spring months (renewal energy)',
      'Group members\' birthday seasons',
      'Harmonious planetary alignments'
    ];
  }

  /**
   * Calculate group challenging periods
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @param {string} groupType - Type of group
   * @returns {Array} Challenging periods
   */
  _calculateGroupChallengingPeriods(memberCharts, groupType) {
    return [
      'Retrograde periods (review and reflection)',
      'Individual crisis times',
      'External stress factors'
    ];
  }

  /**
   * Get element group significance
   * @private
   * @param {Array} elements - Dominant elements
   * @returns {string} Significance description
   */
  _getElementGroupSignificance(elements) {
    const significances = {
      fire: 'enthusiastic and action-oriented group dynamic',
      earth: 'practical and stable group foundation',
      air: 'intellectual and communicative group energy',
      water: 'emotional and intuitive group connection'
    };

    return elements.map(elem => significances[elem]).join(' with ') || 'balanced group energy';
  }

  /**
   * Get planet group significance
   * @private
   * @param {string} planet - Planet name
   * @param {string} sign - Sign
   * @param {string} groupType - Group type
   * @returns {string} Significance description
   */
  _getPlanetGroupSignificance(planet, sign, groupType) {
    const significances = {
      sun: {
        family: 'shared identity and family pride',
        couple: 'mutual respect and shared purpose',
        friends: 'group confidence and social harmony'
      },
      moon: {
        family: 'emotional security and nurturing',
        couple: 'deep emotional intimacy',
        friends: 'emotional support and understanding'
      },
      venus: {
        family: 'family harmony and shared values',
        couple: 'romantic connection and affection',
        friends: 'social bonding and shared enjoyment'
      }
    };

    return significances[planet]?.[groupType] || `collective ${planet} energy in ${sign}`;
  }

  /**
   * Analyze group dynamics
   * @private
   * @param {Array} memberCharts - Individual member charts
   * @param {string} groupType - Type of group
   * @returns {Array} Dynamic insights
   */
  _analyzeGroupDynamics(memberCharts, groupType) {
    const insights = [];

    // Age distribution analysis
    const ages = memberCharts.map(chart => {
      const birthDate = new Date(chart.birthDate.split('/').reverse().join('-'));
      return Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    });

    const avgAge = ages.reduce((sum, age) => sum + age, 0) / ages.length;
    const ageRange = Math.max(...ages) - Math.min(...ages);

    if (ageRange > 20) {
      insights.push({
        type: 'generational',
        insight: 'Multi-generational group with diverse life experiences',
        significance: 'Rich wisdom sharing and mentorship opportunities'
      });
    } else if (avgAge < 30) {
      insights.push({
        type: 'youthful',
        insight: 'Young, dynamic group energy',
        significance: 'High creativity and adaptability'
      });
    }

    // Gender balance (if available)
    // This would require gender data in member profiles

    return insights;
  }

  /**
   * Generate comprehensive Hindu Vedic Kundli (birth chart)
   * @param {Object} birthData - User's birth data
   * @returns {Object} Complete Vedic Kundli
   */
  async generateVedicKundli(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return {
          error: 'Complete birth details required for Vedic Kundli'
        };
      }

      // Parse birth details
      const [birthDay, birthMonth, birthYear] = birthDate.split('/').map(Number);
      const [birthHour, birthMinute] = birthTime.split(':').map(Number);

      // Get coordinates
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(birthYear, birthMonth - 1, birthDay, birthHour, birthMinute);
      const timestamp = birthDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Generate complete chart data
      const kundliData = this._generateCompleteKundliData(
        birthYear, birthMonth, birthDay, birthHour, birthMinute, latitude, longitude, timezone
      );

      // Calculate all houses (Bhavas)
      const houses = this._calculateAllHouses(kundliData);

      // Calculate planetary positions in houses
      const planetaryPositions = this._calculatePlanetaryHousePositions(kundliData, houses);

      // Calculate aspects and relationships
      const aspects = this._calculateVedicAspects(planetaryPositions);

      // Generate traditional interpretations
      const interpretations = this._generateVedicInterpretations(planetaryPositions, houses, aspects);

      return {
        name,
        birthDetails: {
          date: birthDate,
          time: birthTime,
          place: birthPlace,
          coordinates: { latitude, longitude },
          timezone
        },
        lagna: kundliData.lagna,
        houses,
        planetaryPositions,
        aspects,
        interpretations,
        kundliSummary: this._generateKundliSummary(planetaryPositions, houses, interpretations)
      };
    } catch (error) {
      logger.error('Error generating Vedic Kundli:', error);
      return {
        error: 'Unable to generate Vedic Kundli at this time'
      };
    }
  }

  /**
   * Generate complete Kundli data using astrologer library
   * @private
   * @param {number} year - Birth year
   * @param {number} month - Birth month
   * @param {number} day - Birth day
   * @param {number} hour - Birth hour
   * @param {number} minute - Birth minute
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} timezone - Timezone
   * @returns {Object} Complete Kundli data
   */
  _generateCompleteKundliData(year, month, day, hour, minute, latitude, longitude, timezone) {
    try {
      const astroData = {
        year,
        month,
        date: day,
        hours: hour,
        minutes: minute,
        seconds: 0,
        latitude,
        longitude,
        timezone,
        chartType: 'sidereal'
      };

      const chart = this.astrologer.generateNatalChartData(astroData);

      return {
        lagna: chart.interpretations.risingSign,
        planets: chart.planets,
        houses: chart.houses || {},
        rawChart: chart
      };
    } catch (error) {
      logger.error('Error generating complete Kundli data:', error);
      // Return basic structure
      return {
        lagna: 'Unknown',
        planets: {},
        houses: {}
      };
    }
  }

  /**
   * Calculate all 12 houses (Bhavas) with their signs and lords
   * @private
   * @param {Object} kundliData - Kundli data
   * @returns {Array} House data
   */
  _calculateAllHouses(kundliData) {
    const houses = [];

    // House names and their natural significances
    const houseNames = [
      '1st House (Lagna/Tanu)',
      '2nd House (Dhana)',
      '3rd House (Sahaja)',
      '4th House (Sukha)',
      '5th House (Putra)',
      '6th House (Ari/Roga)',
      '7th House (Yuvati/Kalatra)',
      '8th House (Ayur/Mrityu)',
      '9th House (Dharma/Tirtha)',
      '10th House (Karma/Rajya)',
      '11th House (Labha)',
      '12th House (Vyaya)'
    ];

    const houseSignificances = [
      'Self, personality, physical appearance, first impressions',
      'Wealth, family, speech, food, material possessions',
      'Siblings, courage, communication, short journeys, skills',
      'Home, mother, emotions, property, education foundation',
      'Children, creativity, intelligence, spirituality, past life karma',
      'Health, enemies, service, daily routine, obstacles',
      'Marriage, partnerships, business relationships, spouse',
      'Transformation, secrets, occult, longevity, inheritance',
      'Fortune, father, guru, higher learning, pilgrimage',
      'Career, reputation, authority, public image, father',
      'Gains, elder siblings, hopes, wishes, friends',
      'Spirituality, foreign lands, expenses, losses, liberation'
    ];

    // Calculate house signs (simplified - in production would use proper astronomical calculations)
    const lagnaSign = kundliData.lagna;
    const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const lagnaIndex = signOrder.indexOf(lagnaSign);

    for (let i = 0; i < 12; i++) {
      const houseNumber = i + 1;
      const signIndex = (lagnaIndex + i) % 12;
      const sign = signOrder[signIndex];
      const lord = this._getHouseLord(sign);

      houses.push({
        number: houseNumber,
        name: houseNames[i],
        sign,
        lord,
        significance: houseSignificances[i],
        planets: [], // Will be populated later
        strength: this._calculateHouseStrength(houseNumber, sign, kundliData)
      });
    }

    return houses;
  }

  /**
   * Get the lord (ruler) of a house sign
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Ruling planet
   */
  _getHouseLord(sign) {
    const rulers = {
      Aries: 'Mars',
      Taurus: 'Venus',
      Gemini: 'Mercury',
      Cancer: 'Moon',
      Leo: 'Sun',
      Virgo: 'Mercury',
      Libra: 'Venus',
      Scorpio: 'Mars',
      Sagittarius: 'Jupiter',
      Capricorn: 'Saturn',
      Aquarius: 'Saturn',
      Pisces: 'Jupiter'
    };

    return rulers[sign] || 'Unknown';
  }

  /**
   * Calculate planetary positions in houses
   * @private
   * @param {Object} kundliData - Kundli data
   * @param {Array} houses - House data
   * @returns {Object} Planetary positions
   */
  _calculatePlanetaryHousePositions(kundliData, houses) {
    const planetaryPositions = {};

    // Define planets to include
    const planets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

    planets.forEach(planet => {
      const planetData = kundliData.planets[planet];
      if (planetData) {
        const sign = planetData.signName;
        const house = this._findHouseForSign(sign, houses);

        planetaryPositions[planet] = {
          name: planet.charAt(0).toUpperCase() + planet.slice(1),
          sign,
          house: house.number,
          longitude: planetData.longitude,
          retrograde: planetData.retrograde || false,
          dignity: this._calculatePlanetaryDignity(planet, sign),
          aspects: this._getPlanetaryAspects(planet, kundliData.planets)
        };

        // Add planet to house
        if (house) {
          house.planets.push(planet.charAt(0).toUpperCase() + planet.slice(1));
        }
      }
    });

    return planetaryPositions;
  }

  /**
   * Find which house contains a given sign
   * @private
   * @param {string} sign - Zodiac sign
   * @param {Array} houses - House data
   * @returns {Object} House object
   */
  _findHouseForSign(sign, houses) {
    return houses.find(house => house.sign === sign) || houses[0];
  }

  /**
   * Calculate planetary dignity (exalted, own sign, etc.)
   * @private
   * @param {string} planet - Planet name
   * @param {string} sign - Sign planet is in
   * @returns {string} Dignity status
   */
  _calculatePlanetaryDignity(planet, sign) {
    const dignities = {
      sun: {
        Leo: 'Own Sign (Moolatrikona)',
        Aries: 'Exalted'
      },
      moon: {
        Cancer: 'Own Sign (Moolatrikona)',
        Taurus: 'Exalted'
      },
      mars: {
        Aries: 'Own Sign (Moolatrikona)',
        Capricorn: 'Exalted'
      },
      mercury: {
        Gemini: 'Own Sign (Moolatrikona)',
        Virgo: 'Own Sign (Moolatrikona)',
        Aquarius: 'Exalted'
      },
      jupiter: {
        Sagittarius: 'Own Sign (Moolatrikona)',
        Pisces: 'Own Sign (Moolatrikona)',
        Cancer: 'Exalted'
      },
      venus: {
        Taurus: 'Own Sign (Moolatrikona)',
        Libra: 'Own Sign (Moolatrikona)',
        Pisces: 'Exalted'
      },
      saturn: {
        Capricorn: 'Own Sign (Moolatrikona)',
        Aquarius: 'Own Sign (Moolatrikona)',
        Libra: 'Exalted'
      }
    };

    return dignities[planet]?.[sign] || 'Neutral';
  }

  /**
   * Calculate house strength
   * @private
   * @param {number} houseNumber - House number
   * @param {string} sign - House sign
   * @param {Object} kundliData - Kundli data
   * @returns {string} Strength level
   */
  _calculateHouseStrength(houseNumber, sign, kundliData) {
    // Simplified strength calculation
    const strongHouses = [1, 4, 7, 10]; // Kendra houses
    const mediumHouses = [2, 5, 8, 11]; // Trikona houses
    const weakHouses = [3, 6, 9, 12]; // Dusthana houses

    if (strongHouses.includes(houseNumber)) { return 'Strong (Kendra)'; }
    if (mediumHouses.includes(houseNumber)) { return 'Medium (Trikona)'; }
    if (weakHouses.includes(houseNumber)) { return 'Challenging (Dusthana)'; }

    return 'Neutral';
  }

  /**
   * Calculate Vedic aspects between planets
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Array} Aspects
   */
  _calculateVedicAspects(planetaryPositions) {
    const aspects = [];

    // Define Vedic aspects (different from Western)
    const vedicAspects = {
      sun: [7], // 7th aspect (opposition)
      moon: [7], // 7th aspect
      mars: [4, 7, 8], // 4th, 7th, 8th aspects
      mercury: [7], // 7th aspect
      jupiter: [5, 7, 9], // 5th, 7th, 9th aspects
      venus: [7], // 7th aspect
      saturn: [3, 7, 10], // 3rd, 7th, 10th aspects
      rahu: [5, 7, 9], // Similar to Jupiter
      ketu: [5, 7, 9] // Similar to Jupiter
    };

    const planetKeys = Object.keys(planetaryPositions);

    planetKeys.forEach(planet1 => {
      const aspectsForPlanet = vedicAspects[planet1] || [];
      const pos1 = planetaryPositions[planet1];

      aspectsForPlanet.forEach(aspect => {
        const targetHouse = (pos1.house + aspect - 1) % 12 + 1;

        planetKeys.forEach(planet2 => {
          if (planet1 !== planet2) {
            const pos2 = planetaryPositions[planet2];
            if (pos2.house === targetHouse) {
              aspects.push({
                planet1: pos1.name,
                planet2: pos2.name,
                aspect: `${aspect}th house aspect`,
                type: this._getAspectType(planet1, planet2),
                effect: this._getAspectEffect(planet1, planet2, aspect)
              });
            }
          }
        });
      });
    });

    return aspects;
  }

  /**
   * Get aspect type (benefic/malefic)
   * @private
   * @param {string} planet1 - First planet
   * @param {string} planet2 - Second planet
   * @returns {string} Aspect type
   */
  _getAspectType(planet1, planet2) {
    const benefics = ['jupiter', 'venus', 'mercury'];
    const malefics = ['mars', 'saturn', 'rahu', 'ketu'];

    const p1Type = benefics.includes(planet1) ? 'benefic' : malefics.includes(planet1) ? 'malefic' : 'neutral';
    const p2Type = benefics.includes(planet2) ? 'benefic' : malefics.includes(planet2) ? 'malefic' : 'neutral';

    if (p1Type === p2Type) { return 'harmonious'; }
    if ((p1Type === 'benefic' && p2Type === 'malefic') || (p1Type === 'malefic' && p2Type === 'benefic')) {
      return 'challenging';
    }

    return 'neutral';
  }

  /**
   * Get aspect effect description
   * @private
   * @param {string} planet1 - First planet
   * @param {string} planet2 - Second planet
   * @param {number} aspect - Aspect number
   * @returns {string} Effect description
   */
  _getAspectEffect(planet1, planet2, aspect) {
    const effects = {
      3: 'communication and mental activity',
      4: 'home and emotional security',
      5: 'creativity and children',
      7: 'relationships and partnerships',
      8: 'transformation and secrets',
      9: 'wisdom and spirituality',
      10: 'career and reputation'
    };

    return `influences ${effects[aspect] || 'life areas'}`;
  }

  /**
   * Generate Vedic interpretations
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @param {Array} houses - House data
   * @param {Array} aspects - Aspects
   * @returns {Object} Interpretations
   */
  _generateVedicInterpretations(planetaryPositions, houses, aspects) {
    return {
      lagnaAnalysis: this._analyzeLagna(houses[0], planetaryPositions),
      planetaryStrengths: this._analyzePlanetaryStrengths(planetaryPositions),
      houseSignificances: this._analyzeHouseSignificances(houses),
      detailedBhavaAnalysis: this._analyzeDetailedBhavas(houses, planetaryPositions),
      yogaFormations: this._identifyYogaFormations(planetaryPositions, houses),
      dashaPredictions: this._generateDashaPredictions(planetaryPositions)
    };
  }

  /**
   * Analyze Lagna (Ascendant)
   * @private
   * @param {Object} lagnaHouse - Lagna house data
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Object} Lagna analysis
   */
  _analyzeLagna(lagnaHouse, planetaryPositions) {
    const lagnaSign = lagnaHouse.sign;
    const lagnaLord = lagnaHouse.lord;

    // Lagna lord position
    const lagnaLordPosition = planetaryPositions[lagnaLord.toLowerCase()];

    return {
      sign: lagnaSign,
      lord: lagnaLord,
      lordPosition: lagnaLordPosition ? `${lagnaLordPosition.house}th house` : 'Unknown',
      strength: lagnaHouse.strength,
      planetsInLagna: lagnaHouse.planets,
      interpretation: this._getLagnaInterpretation(lagnaSign, lagnaLordPosition)
    };
  }

  /**
   * Get Lagna interpretation
   * @private
   * @param {string} sign - Lagna sign
   * @param {Object} lordPosition - Lagna lord position
   * @returns {string} Interpretation
   */
  _getLagnaInterpretation(sign, lordPosition) {
    const interpretations = {
      Aries: 'Bold, courageous, independent personality. Natural leaders with strong willpower.',
      Taurus: 'Practical, reliable, sensual nature. Strong connection to material comforts and stability.',
      Gemini: 'Adaptable, communicative, intellectual. Versatile minds with strong curiosity.',
      Cancer: 'Emotional, nurturing, intuitive. Deep connection to home and family.',
      Leo: 'Creative, confident, generous. Natural performers with strong presence.',
      Virgo: 'Analytical, helpful, detail-oriented. Strong focus on service and perfection.',
      Libra: 'Diplomatic, harmonious, fair-minded. Strong emphasis on relationships and balance.',
      Scorpio: 'Intense, passionate, transformative. Deep emotional and psychological insight.',
      Sagittarius: 'Optimistic, philosophical, adventurous. Strong desire for knowledge and freedom.',
      Capricorn: 'Ambitious, disciplined, responsible. Strong focus on achievement and structure.',
      Aquarius: 'Innovative, humanitarian, independent. Strong focus on community and progress.',
      Pisces: 'Compassionate, imaginative, spiritual. Strong connection to the divine and creative arts.'
    };

    let interpretation = interpretations[sign] || 'Unique personality with special qualities.';

    if (lordPosition) {
      const { house } = lordPosition;
      if (house <= 3) {
        interpretation += ' Strong personal power and self-expression.';
      } else if (house >= 4 && house <= 7) {
        interpretation += ' Focus on relationships and emotional security.';
      } else if (house >= 8 && house <= 11) {
        interpretation += ' Interest in transformation and spiritual growth.';
      } else {
        interpretation += ' Connection to broader social and spiritual concerns.';
      }
    }

    return interpretation;
  }

  /**
   * Analyze planetary strengths
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Object} Planetary strengths
   */
  _analyzePlanetaryStrengths(planetaryPositions) {
    const strengths = {
      strong: [],
      weak: [],
      exalted: [],
      debilitated: []
    };

    Object.values(planetaryPositions).forEach(planet => {
      if (planet.dignity.includes('Exalted')) {
        strengths.exalted.push(planet.name);
      } else if (planet.dignity.includes('Own Sign')) {
        strengths.strong.push(planet.name);
      }
    });

    return strengths;
  }

  /**
   * Analyze house significances
   * @private
   * @param {Array} houses - House data
   * @returns {Array} House analyses
   */
  _analyzeHouseSignificances(houses) {
    return houses.map(house => ({
      house: house.number,
      significance: house.significance,
      planets: house.planets,
      strength: house.strength,
      interpretation: this._getHouseInterpretation(house)
    }));
  }

  /**
   * Get house interpretation
   * @private
   * @param {Object} house - House data
   * @returns {string} Interpretation
   */
  _getHouseInterpretation(house) {
    let interpretation = `${house.name} represents ${house.significance}. `;

    if (house.planets.length > 0) {
      interpretation += `Planets here: ${house.planets.join(', ')}. `;
      interpretation += `This ${house.strength.toLowerCase()} house shows `;
      interpretation += house.strength.includes('Strong') ? 'favorable conditions' : 'challenges to overcome';
      interpretation += ' in these life areas.';
    } else {
      interpretation += 'No planets here, indicating balanced energy in these areas.';
    }

    return interpretation;
  }

  /**
   * Analyze detailed Bhavas (houses) with comprehensive interpretations
   * @private
   * @param {Array} houses - House data
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Array} Detailed Bhava analysis
   */
  _analyzeDetailedBhavas(houses, planetaryPositions) {
    return houses.map(house => {
      const detailedAnalysis = {
        house: house.number,
        name: house.name,
        sign: house.sign,
        lord: house.lord,
        lordPosition: planetaryPositions[house.lord.toLowerCase()]?.house || 'Unknown',
        planets: house.planets,
        strength: house.strength,
        karaka: this._getBhavaKaraka(house.number),
        arudha: this._calculateArudhaLagna(house, planetaryPositions),
        aspects: this._analyzeBhavaAspects(house, planetaryPositions),
        interpretation: this._getDetailedBhavaInterpretation(house, planetaryPositions),
        predictions: this._getBhavaPredictions(house, planetaryPositions)
      };

      return detailedAnalysis;
    });
  }

  /**
   * Get Bhava Karaka (significator) for each house
   * @private
   * @param {number} houseNumber - House number
   * @returns {string} Karaka (significator)
   */
  _getBhavaKaraka(houseNumber) {
    const karakas = {
      1: 'Sun (self, personality)',
      2: 'Jupiter (wealth, family)',
      3: 'Mars (siblings, courage)',
      4: 'Moon (mother, home, emotions)',
      5: 'Jupiter (children, creativity, intelligence)',
      6: 'Mars/Saturn (enemies, health, service)',
      7: 'Venus (spouse, partnerships)',
      8: 'Saturn (longevity, transformation, secrets)',
      9: 'Jupiter (fortune, father, spirituality)',
      10: 'Sun/Saturn/Mercury (career, reputation, authority)',
      11: 'Jupiter (gains, elder siblings, hopes)',
      12: 'Saturn (expenses, foreign lands, spirituality)'
    };

    return karakas[houseNumber] || 'Various planetary influences';
  }

  /**
   * Calculate Arudha Lagna for a house (simplified)
   * @private
   * @param {Object} house - House data
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {string} Arudha Lagna sign
   */
  _calculateArudhaLagna(house, planetaryPositions) {
    // Simplified Arudha calculation - in practice this is more complex
    const houseSign = house.sign;
    const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = signOrder.indexOf(houseSign);

    // Count planets in house
    const planetCount = house.planets.length;
    const arudhaIndex = (signIndex + planetCount) % 12;

    return signOrder[arudhaIndex];
  }

  /**
   * Analyze aspects to a Bhava
   * @private
   * @param {Object} house - House data
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Array} Aspects to the house
   */
  _analyzeBhavaAspects(house, planetaryPositions) {
    const aspects = [];

    // Check which planets aspect this house
    Object.entries(planetaryPositions).forEach(([planetName, position]) => {
      if (position && position.house) {
        const aspectHouses = this._getPlanetaryAspects(planetName, position.house);
        if (aspectHouses.includes(house.number)) {
          aspects.push({
            planet: planetName.charAt(0).toUpperCase() + planetName.slice(1),
            aspect: this._getAspectType(position.house, house.number),
            influence: this._getAspectInfluence(planetName, this._getAspectType(position.house, house.number))
          });
        }
      }
    });

    return aspects;
  }

  /**
   * Get planetary aspects (simplified Vedic aspects)
   * @private
   * @param {string} planet - Planet name
   * @param {number} house - House position
   * @returns {Array} Houses aspected by this planet
   */
  _getPlanetaryAspects(planet, house) {
    // Vedic planetary aspects (simplified)
    const aspects = {
      sun: [7], // 7th aspect
      moon: [7], // 7th aspect
      mars: [4, 7, 8], // 4th, 7th, 8th aspects
      mercury: [7], // 7th aspect
      jupiter: [5, 7, 9], // 5th, 7th, 9th aspects
      venus: [7], // 7th aspect
      saturn: [3, 7, 10], // 3rd, 7th, 10th aspects
      rahu: [5, 7, 9], // Similar to Jupiter
      ketu: [5, 7, 9]  // Similar to Jupiter
    };

    const planetAspects = aspects[planet.toLowerCase()] || [7];
    return planetAspects.map(aspect => (house + aspect - 1) % 12 + 1);
  }

  /**
   * Get aspect type between two houses
   * @private
   * @param {number} fromHouse - From house
   * @param {number} toHouse - To house
   * @returns {string} Aspect type
   */
  _getAspectType(fromHouse, toHouse) {
    const diff = Math.abs(fromHouse - toHouse);
    const minDiff = Math.min(diff, 12 - diff);

    const aspectTypes = {
      3: 'trine',
      4: 'square',
      6: 'sextile',
      7: 'opposition',
      9: 'trine'
    };

    return aspectTypes[minDiff] || 'no major aspect';
  }

  /**
   * Get aspect influence
   * @private
   * @param {string} planet - Planet name
   * @param {string} aspect - Aspect type
   * @returns {string} Influence description
   */
  _getAspectInfluence(planet, aspect) {
    const influences = {
      sun: {
        trine: 'harmonious self-expression',
        square: 'ego challenges',
        opposition: 'public recognition',
        sextile: 'leadership opportunities'
      },
      moon: {
        trine: 'emotional harmony',
        square: 'mood fluctuations',
        opposition: 'public emotions',
        sextile: 'intuitive guidance'
      },
      mars: {
        trine: 'energetic support',
        square: 'conflicts and aggression',
        opposition: 'competitive dynamics',
        sextile: 'courageous action'
      },
      jupiter: {
        trine: 'wisdom and expansion',
        square: 'over-optimism',
        opposition: 'philosophical influence',
        sextile: 'learning opportunities'
      },
      saturn: {
        trine: 'disciplined structure',
        square: 'restrictions and delays',
        opposition: 'authority challenges',
        sextile: 'career stability'
      }
    };

    return influences[planet.toLowerCase()]?.[aspect] || `${planet} influence`;
  }

  /**
   * Get detailed Bhava interpretation
   * @private
   * @param {Object} house - House data
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {string} Detailed interpretation
   */
  _getDetailedBhavaInterpretation(house, planetaryPositions) {
    let interpretation = `${house.name} in ${house.sign} shows `;

    // Analyze house lord strength
    const lordPosition = planetaryPositions[house.lord.toLowerCase()];
    if (lordPosition) {
      if ([1, 4, 7, 10].includes(lordPosition.house)) {
        interpretation += 'strong foundation and success in ';
      } else if ([6, 8, 12].includes(lordPosition.house)) {
        interpretation += 'challenges and transformation in ';
      } else {
        interpretation += 'moderate conditions in ';
      }
    }

    interpretation += house.significance.toLowerCase();

    if (house.planets.length > 0) {
      interpretation += `. Planets present: ${house.planets.join(', ')} indicate `;
      interpretation += house.planets.length > 2 ? 'intense activity' : 'focused energy';
      interpretation += ' in these areas.';
    }

    return interpretation;
  }

  /**
   * Get Bhava predictions
   * @private
   * @param {Object} house - House data
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Object} Predictions for the house
   */
  _getBhavaPredictions(house, planetaryPositions) {
    const predictions = {
      shortTerm: '',
      longTerm: '',
      remedies: []
    };

    // Generate predictions based on house strength and planetary positions
    if (house.strength.includes('Strong')) {
      predictions.shortTerm = `Positive developments in ${house.significance.split(',')[0].toLowerCase()}`;
      predictions.longTerm = `Long-term success and fulfillment in ${house.significance.split(',')[0].toLowerCase()}`;
    } else {
      predictions.shortTerm = `Challenges in ${house.significance.split(',')[0].toLowerCase()} requiring attention`;
      predictions.longTerm = `Growth and mastery in ${house.significance.split(',')[0].toLowerCase()} through perseverance`;
      predictions.remedies = this._getBhavaRemedies(house);
    }

    return predictions;
  }

  /**
   * Get remedies for weak Bhava
   * @private
   * @param {Object} house - House data
   * @returns {Array} Remedies
   */
  _getBhavaRemedies(house) {
    const remedies = {
      1: ['Wear ruby or practice self-confidence exercises', 'Regular exercise and healthy diet'],
      2: ['Donate to charity', 'Practice abundance affirmations'],
      3: ['Develop communication skills', 'Practice courage-building activities'],
      4: ['Create a peaceful home environment', 'Connect with family regularly'],
      5: ['Engage in creative activities', 'Spend time with children or creative pursuits'],
      6: ['Practice health discipline', 'Serve others selflessly'],
      7: ['Work on relationship skills', 'Practice compromise and harmony'],
      8: ['Study occult sciences', 'Practice meditation for transformation'],
      9: ['Study spiritual texts', 'Travel to sacred places'],
      10: ['Set clear career goals', 'Practice discipline and hard work'],
      11: ['Network and build connections', 'Practice gratitude for gains'],
      12: ['Practice charity', 'Develop spiritual practices']
    };

    return remedies[house.number] || ['General spiritual practices', 'Consult with learned astrologer'];
  }

  /**
   * Identify Yoga formations
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @param {Array} houses - House data
   * @returns {Array} Yoga formations
   */
  _identifyYogaFormations(planetaryPositions, houses) {
    const yogas = [];

    // Raja Yoga - combination of Kendra and Trikona lords
    const kendraLords = [houses[0].lord, houses[3].lord, houses[6].lord, houses[9].lord];
    const trikonaLords = [houses[1].lord, houses[4].lord, houses[7].lord, houses[10].lord];

    const kendraPositions = kendraLords.map(lord => planetaryPositions[lord.toLowerCase()]);
    const trikonaPositions = trikonaLords.map(lord => planetaryPositions[lord.toLowerCase()]);

    if (kendraPositions.some(p => p && [1, 4, 7, 10].includes(p.house)) &&
        trikonaPositions.some(p => p && [1, 4, 7, 10].includes(p.house))) {
      yogas.push({
        name: 'Raja Yoga',
        type: 'Wealth & Power',
        planets: 'Kendra and Trikona lords',
        effect: 'Success, wealth, power, and high status'
      });
    }

    // Dharma Karma Adhipati Yoga
    const dharmaLord = houses[8].lord; // 9th lord
    const karmaLord = houses[9].lord; // 10th lord

    if (planetaryPositions[dharmaLord.toLowerCase()] &&
        planetaryPositions[karmaLord.toLowerCase()] &&
        planetaryPositions[dharmaLord.toLowerCase()].house === planetaryPositions[karmaLord.toLowerCase()].house) {
      yogas.push({
        name: 'Dharma Karma Adhipati Yoga',
        type: 'Spiritual Career',
        planets: `${dharmaLord} and ${karmaLord}`,
        effect: 'Harmonious balance between spiritual and worldly duties'
      });
    }

    // Check for planetary conjunctions (multiple planets in same house)
    const houseOccupancy = {};
    Object.values(planetaryPositions).forEach(planet => {
      houseOccupancy[planet.house] = (houseOccupancy[planet.house] || 0) + 1;
    });

    Object.entries(houseOccupancy).forEach(([house, count]) => {
      if (count >= 3) {
        yogas.push({
          name: 'Sthan Yoga',
          type: 'Concentration',
          planets: `Multiple planets in ${house}th house`,
          effect: 'Intense focus and activity in this life area'
        });
      }
    });

    // Additional Yoga formations

    // Pancha Mahapurusha Yoga - 5 great personalities
    const panchaMahapurusha = this._checkPanchaMahapurushaYoga(planetaryPositions);
    yogas.push(...panchaMahapurusha);

    // Raja Yoga variations
    const additionalRajaYogas = this._checkAdditionalRajaYogas(planetaryPositions, houses);
    yogas.push(...additionalRajaYogas);

    // Dharma Karma Adhipati Yoga (already included above)

    // Neecha Bhanga Raja Yoga - cancellation of debilitation
    const neechaBhanga = this._checkNeechaBhangaYoga(planetaryPositions);
    if (neechaBhanga) {
      yogas.push(neechaBhanga);
    }

    // Viparita Raja Yoga - success through adversity
    const viparitaRaja = this._checkViparitaRajaYoga(planetaryPositions);
    if (viparitaRaja) {
      yogas.push(viparitaRaja);
    }

    // Chandra Mangala Yoga - Moon-Mars combination
    const chandraMangala = this._checkChandraMangalaYoga(planetaryPositions);
    if (chandraMangala) {
      yogas.push(chandraMangala);
    }

    // Lakshmi Yoga - wealth and prosperity
    const lakshmiYoga = this._checkLakshmiYoga(planetaryPositions);
    if (lakshmiYoga) {
      yogas.push(lakshmiYoga);
    }

    // Gaja Kesari Yoga - wisdom and prosperity
    const gajaKesari = this._checkGajaKesariYoga(planetaryPositions);
    if (gajaKesari) {
      yogas.push(gajaKesari);
    }

    return yogas;
  }

  /**
   * Check for Pancha Mahapurusha Yoga
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Array} Pancha Mahapurusha Yogas found
   */
  _checkPanchaMahapurushaYoga(planetaryPositions) {
    const yogas = [];

    // Ruchaka Yoga - Mars in own sign or exalted, in Kendra
    const { mars } = planetaryPositions;
    if (mars && mars.dignity && (mars.dignity.includes('Own Sign') || mars.dignity.includes('Exalted')) &&
        [1, 4, 7, 10].includes(mars.house)) {
      yogas.push({
        name: 'Ruchaka Yoga',
        type: 'Pancha Mahapurusha',
        planets: 'Mars',
        effect: 'Courageous, victorious, successful in martial pursuits'
      });
    }

    // Bhadra Yoga - Mercury in own sign or exalted, in Kendra
    const { mercury } = planetaryPositions;
    if (mercury && mercury.dignity && (mercury.dignity.includes('Own Sign') || mercury.dignity.includes('Exalted')) &&
        [1, 4, 7, 10].includes(mercury.house)) {
      yogas.push({
        name: 'Bhadra Yoga',
        type: 'Pancha Mahapurusha',
        planets: 'Mercury',
        effect: 'Intelligent, learned, successful in education and communication'
      });
    }

    // Hamsa Yoga - Jupiter in own sign or exalted, in Kendra
    const { jupiter } = planetaryPositions;
    if (jupiter && jupiter.dignity && (jupiter.dignity.includes('Own Sign') || jupiter.dignity.includes('Exalted')) &&
        [1, 4, 7, 10].includes(jupiter.house)) {
      yogas.push({
        name: 'Hamsa Yoga',
        type: 'Pancha Mahapurusha',
        planets: 'Jupiter',
        effect: 'Wise, spiritual, successful in teaching and philosophy'
      });
    }

    // Malavya Yoga - Venus in own sign or exalted, in Kendra
    const { venus } = planetaryPositions;
    if (venus && venus.dignity && (venus.dignity.includes('Own Sign') || venus.dignity.includes('Exalted')) &&
        [1, 4, 7, 10].includes(venus.house)) {
      yogas.push({
        name: 'Malavya Yoga',
        type: 'Pancha Mahapurusha',
        planets: 'Venus',
        effect: 'Artistic, wealthy, successful in creative and luxury pursuits'
      });
    }

    // Sasa Yoga - Saturn in own sign or exalted, in Kendra
    const { saturn } = planetaryPositions;
    if (saturn && saturn.dignity && (saturn.dignity.includes('Own Sign') || saturn.dignity.includes('Exalted')) &&
        [1, 4, 7, 10].includes(saturn.house)) {
      yogas.push({
        name: 'Sasa Yoga',
        type: 'Pancha Mahapurusha',
        planets: 'Saturn',
        effect: 'Disciplined, long-lived, successful in administration and justice'
      });
    }

    return yogas;
  }

  /**
   * Check for additional Raja Yoga combinations
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @param {Array} houses - House data
   * @returns {Array} Additional Raja Yogas
   */
  _checkAdditionalRajaYogas(planetaryPositions, houses) {
    const yogas = [];

    // Kendra Trikona Raja Yoga
    const kendraPlanets = [1, 4, 7, 10].map(h => houses[h - 1].planets).flat();
    const trikonaPlanets = [1, 5, 9].map(h => houses[h - 1].planets).flat();

    if (kendraPlanets.length > 0 && trikonaPlanets.length > 0) {
      // Check if lords of Kendra and Trikona are connected
      const kendraLords = [1, 4, 7, 10].map(h => houses[h - 1].lord);
      const trikonaLords = [1, 5, 9].map(h => houses[h - 1].lord);

      const connectedLords = kendraLords.filter(lord =>
        trikonaLords.some(tLord => {
          const lordPos = planetaryPositions[lord.toLowerCase()];
          const tLordPos = planetaryPositions[tLord.toLowerCase()];
          return lordPos && tLordPos && lordPos.house === tLordPos.house;
        })
      );

      if (connectedLords.length > 0) {
        yogas.push({
          name: 'Kendra Trikona Raja Yoga',
          type: 'Power & Success',
          planets: connectedLords.join(', '),
          effect: 'Exceptional success, power, and high status'
        });
      }
    }

    return yogas;
  }

  /**
   * Check for Neecha Bhanga Raja Yoga
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Object|null} Neecha Bhanga Yoga if found
   */
  _checkNeechaBhangaYoga(planetaryPositions) {
    // Check if any planet is debilitated but cancellation occurs
    Object.entries(planetaryPositions).forEach(([planetName, position]) => {
      if (position && position.dignity && position.dignity.includes('Debilitated')) {
        // Check for cancellation conditions
        const exaltedSign = this._getExaltedSign(planetName);
        const debilitatedSign = this._getDebilitatedSign(planetName);

        if (position.sign === debilitatedSign) {
          // Check if exalted planet aspects or is in Kendra from Moon/Lagna
          const exaltedPlanet = this._getExaltedPlanetForSign(exaltedSign);
          const exaltedPosition = planetaryPositions[exaltedPlanet];

          if (exaltedPosition && (
            this._housesApart(exaltedPosition.house, position.house) === 7 || // Opposition
            [1, 4, 7, 10].includes(exaltedPosition.house) // Kendra
          )) {
            return {
              name: 'Neecha Bhanga Raja Yoga',
              type: 'Cancellation of Debilitation',
              planets: `${planetName.charAt(0).toUpperCase() + planetName.slice(1)} and ${exaltedPlanet.charAt(0).toUpperCase() + exaltedPlanet.slice(1)}`,
              effect: 'Transformation of weakness into strength, exceptional success'
            };
          }
        }
      }
    });

    return null;
  }

  /**
   * Check for Viparita Raja Yoga
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Object|null} Viparita Raja Yoga if found
   */
  _checkViparitaRajaYoga(planetaryPositions) {
    // Lords of 6th, 8th, 12th houses in Kendra or Trikona
    const dusthanaLords = [6, 8, 12].map(h => planetaryPositions.mars); // Simplified - should get actual lords

    const favorableHouses = [1, 4, 5, 7, 9, 10];
    const dusthanaInFavorable = dusthanaLords.filter(lord =>
      lord && favorableHouses.includes(lord.house)
    );

    if (dusthanaInFavorable.length > 0) {
      return {
        name: 'Viparita Raja Yoga',
        type: 'Success Through Adversity',
        planets: 'Lords of 6th, 8th, or 12th houses',
        effect: 'Success achieved through overcoming obstacles and adversity'
      };
    }

    return null;
  }

  /**
   * Check for Chandra Mangala Yoga
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Object|null} Chandra Mangala Yoga if found
   */
  _checkChandraMangalaYoga(planetaryPositions) {
    const { moon } = planetaryPositions;
    const { mars } = planetaryPositions;

    if (moon && mars && moon.house === mars.house) {
      return {
        name: 'Chandra Mangala Yoga',
        type: 'Courage & Vitality',
        planets: 'Moon and Mars',
        effect: 'Courageous, energetic, successful in competitive fields'
      };
    }

    return null;
  }

  /**
   * Check for Lakshmi Yoga
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Object|null} Lakshmi Yoga if found
   */
  _checkLakshmiYoga(planetaryPositions) {
    // Venus and Moon in Kendra or Trikona from each other
    const { venus } = planetaryPositions;
    const { moon } = planetaryPositions;

    if (venus && moon) {
      const housesApart = Math.abs(venus.house - moon.house);
      const minHouses = Math.min(housesApart, 12 - housesApart);

      if ([3, 4, 6, 7, 9].includes(minHouses)) { // Trine, square, sextile, opposition
        return {
          name: 'Lakshmi Yoga',
          type: 'Wealth & Prosperity',
          planets: 'Venus and Moon',
          effect: 'Abundance, luxury, material success, and happiness'
        };
      }
    }

    return null;
  }

  /**
   * Check for Gaja Kesari Yoga
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Object|null} Gaja Kesari Yoga if found
   */
  _checkGajaKesariYoga(planetaryPositions) {
    const { moon } = planetaryPositions;
    const { jupiter } = planetaryPositions;

    if (moon && jupiter) {
      const housesApart = Math.abs(jupiter.house - moon.house);
      const minHouses = Math.min(housesApart, 12 - housesApart);

      if ([1, 5, 9].includes(minHouses)) { // Conjunction, trine
        return {
          name: 'Gaja Kesari Yoga',
          type: 'Wisdom & Prosperity',
          planets: 'Moon and Jupiter',
          effect: 'Intelligence, wealth, fame, and spiritual wisdom'
        };
      }
    }

    return null;
  }

  /**
   * Get exalted sign for a planet
   * @private
   * @param {string} planet - Planet name
   * @returns {string} Exalted sign
   */
  _getExaltedSign(planet) {
    const exaltedSigns = {
      sun: 'Aries',
      moon: 'Taurus',
      mars: 'Capricorn',
      mercury: 'Virgo',
      jupiter: 'Cancer',
      venus: 'Pisces',
      saturn: 'Libra'
    };
    return exaltedSigns[planet.toLowerCase()] || '';
  }

  /**
   * Get debilitated sign for a planet
   * @private
   * @param {string} planet - Planet name
   * @returns {string} Debilitated sign
   */
  _getDebilitatedSign(planet) {
    const debilitatedSigns = {
      sun: 'Libra',
      moon: 'Scorpio',
      mars: 'Cancer',
      mercury: 'Pisces',
      jupiter: 'Capricorn',
      venus: 'Virgo',
      saturn: 'Aries'
    };
    return debilitatedSigns[planet.toLowerCase()] || '';
  }

  /**
   * Get planet exalted in a sign
   * @private
   * @param {string} sign - Zodiac sign
   * @returns {string} Planet exalted in that sign
   */
  _getExaltedPlanetForSign(sign) {
    const planetForSign = {
      Aries: 'sun',
      Taurus: 'moon',
      Cancer: 'jupiter',
      Virgo: 'mercury',
      Libra: 'saturn',
      Capricorn: 'mars',
      Pisces: 'venus'
    };
    return planetForSign[sign] || '';
  }

  /**
   * Calculate houses apart (considering circular nature)
   * @private
   * @param {number} house1 - First house
   * @param {number} house2 - Second house
   * @returns {number} Houses apart
   */
  _housesApart(house1, house2) {
    const diff = Math.abs(house1 - house2);
    return Math.min(diff, 12 - diff);
  }

  /**
   * Generate Dasha predictions
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @returns {Object} Dasha predictions
   */
  _generateDashaPredictions(planetaryPositions) {
    // Simplified dasha predictions based on current planetary positions
    const predictions = {
      currentInfluence: 'General life patterns based on planetary positions',
      upcomingTrends: [],
      favorablePeriods: [],
      challengingPeriods: []
    };

    // Add predictions based on strong planets
    Object.values(planetaryPositions).forEach(planet => {
      if (planet.dignity.includes('Exalted') || planet.dignity.includes('Own Sign')) {
        predictions.favorablePeriods.push(`${planet.name} periods bring success in ${this._getPlanetDomains(planet.name)}`);
      }
    });

    return predictions;
  }

  /**
   * Get planetary domains
   * @private
   * @param {string} planet - Planet name
   * @returns {string} Domains
   */
  _getPlanetaryDomains(planet) {
    const domains = {
      Sun: 'leadership, government, father, vitality',
      Moon: 'emotions, mother, home, intuition',
      Mars: 'energy, courage, siblings, property',
      Mercury: 'communication, education, business, intellect',
      Jupiter: 'wisdom, expansion, prosperity, spirituality',
      Venus: 'love, beauty, arts, material comforts',
      Saturn: 'discipline, responsibility, career, longevity'
    };

    return domains[planet] || 'various life areas';
  }

  /**
   * Generate Kundli summary
   * @private
   * @param {Object} planetaryPositions - Planetary positions
   * @param {Array} houses - House data
   * @param {Object} interpretations - Interpretations
   * @returns {string} Summary
   */
  _generateKundliSummary(planetaryPositions, houses, interpretations) {
    let summary = '📊 *Vedic Kundli Summary*\n\n';

    summary += `*Lagna:* ${interpretations.lagnaAnalysis.sign} (${interpretations.lagnaAnalysis.strength})\n`;
    summary += `*Planetary Strengths:* ${interpretations.planetaryStrengths.strong.join(', ')}\n\n`;

    if (interpretations.yogaFormations.length > 0) {
      summary += '*Special Yogas:*\n';
      interpretations.yogaFormations.forEach(yoga => {
        summary += `• ${yoga.name}: ${yoga.effect}\n`;
      });
      summary += '\n';
    }

    summary += '*Key Life Areas:*\n';
    const keyHouses = [1, 4, 7, 10]; // Kendra houses
    keyHouses.forEach(houseNum => {
      const house = houses[houseNum - 1];
      if (house.planets.length > 0) {
        summary += `• ${house.name}: ${house.planets.join(', ')}\n`;
      }
    });

    summary += '\n*Overall:* This Kundli reveals ';
    const strongPlanets = interpretations.planetaryStrengths.strong.length;
    const exaltedPlanets = interpretations.planetaryStrengths.exalted.length;

    if (strongPlanets + exaltedPlanets >= 3) {
      summary += 'strong planetary influences suggesting success and stability.';
    } else if (strongPlanets + exaltedPlanets >= 1) {
      summary += 'balanced energies with opportunities for growth.';
    } else {
      summary += 'challenging planetary positions requiring conscious effort and spiritual practice.';
    }

    return summary;
  }

  /**
   * Calculate Hindu Marriage Compatibility (Kundli Matching)
   * @param {Object} person1 - First person's birth data
   * @param {Object} person2 - Second person's birth data
   * @returns {Object} Marriage compatibility analysis
   */
  calculateMarriageCompatibility(person1, person2) {
    try {
      if (!person1.birthDate || !person2.birthDate) {
        return {
          error: 'Birth dates required for marriage compatibility'
        };
      }

      // Generate Kundlis for both people
      const kundli1 = this.generateVedicKundli(person1);
      const kundli2 = this.generateVedicKundli(person2);

      if (kundli1.error || kundli2.error) {
        return {
          error: 'Unable to generate Kundlis for compatibility analysis'
        };
      }

      // Calculate 36-point Guna matching system
      const gunaMatching = this._calculateGunaMatching(kundli1, kundli2);

      // Calculate other compatibility factors
      const varnaCompatibility = this._calculateVarnaCompatibility(kundli1, kundli2);
      const taraCompatibility = this._calculateTaraCompatibility(kundli1, kundli2);
      const yoniCompatibility = this._calculateYoniCompatibility(kundli1, kundli2);
      const grahamaitriCompatibility = this._calculateGrahamaitriCompatibility(kundli1, kundli2);
      const ganaCompatibility = this._calculateGanaCompatibility(kundli1, kundli2);
      const bhakutCompatibility = this._calculateBhakutCompatibility(kundli1, kundli2);
      const nadiCompatibility = this._calculateNadiCompatibility(kundli1, kundli2);
      const nakshatraCompatibility = this._calculateNakshatraCompatibility(kundli1, kundli2);

      // Calculate Manglik dosha
      const manglikAnalysis = this._analyzeManglikDosha(kundli1, kundli2);

      // Overall compatibility score
      const overallScore = this._calculateOverallCompatibility(gunaMatching, manglikAnalysis);

      return {
        couple: {
          person1: person1.name,
          person2: person2.name
        },
        gunaMatching,
        detailedCompatibility: {
          varna: varnaCompatibility,
          tara: taraCompatibility,
          yoni: yoniCompatibility,
          grahamaitri: grahamaitriCompatibility,
          gana: ganaCompatibility,
          bhakut: bhakutCompatibility,
          nadi: nadiCompatibility,
          nakshatra: nakshatraCompatibility
        },
        manglikAnalysis,
        overallScore,
        recommendations: this._generateMarriageRecommendations(overallScore, gunaMatching, manglikAnalysis),
        summary: this._generateMarriageSummary(overallScore, gunaMatching, manglikAnalysis)
      };
    } catch (error) {
      logger.error('Error calculating marriage compatibility:', error);
      return {
        error: 'Unable to calculate marriage compatibility at this time'
      };
    }
  }

  /**
   * Calculate 36-point Guna matching system
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Guna matching results
   */
  _calculateGunaMatching(kundli1, kundli2) {
    const gunas = {
      varna: this._calculateVarnaGuna(kundli1, kundli2),
      tara: this._calculateTaraGuna(kundli1, kundli2),
      yoni: this._calculateYoniGuna(kundli1, kundli2),
      grahamaitri: this._calculateGrahamaitriGuna(kundli1, kundli2),
      gana: this._calculateGanaGuna(kundli1, kundli2),
      bhakut: this._calculateBhakutGuna(kundli1, kundli2),
      nadi: this._calculateNadiGuna(kundli1, kundli2)
    };

    const totalPoints = Object.values(gunas).reduce((sum, guna) => sum + guna.points, 0);
    const maxPoints = 36;

    return {
      individualGunas: gunas,
      totalPoints,
      maxPoints,
      percentage: Math.round((totalPoints / maxPoints) * 100),
      compatibility: this._interpretGunaScore(totalPoints)
    };
  }

  /**
   * Calculate Varna Guna (1 point)
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Varna compatibility
   */
  _calculateVarnaGuna(kundli1, kundli2) {
    // Varna based on Moon sign
    const moon1 = kundli1.planetaryPositions.moon?.sign || 'Unknown';
    const moon2 = kundli2.planetaryPositions.moon?.sign || 'Unknown';

    const varnaMap = {
      Aries: 'Kshatriya', Leo: 'Kshatriya', Sagittarius: 'Kshatriya',
      Taurus: 'Vaishya', Virgo: 'Vaishya', Capricorn: 'Vaishya',
      Gemini: 'Shudra', Libra: 'Shudra', Aquarius: 'Shudra',
      Cancer: 'Brahmin', Scorpio: 'Brahmin', Pisces: 'Brahmin'
    };

    const varna1 = varnaMap[moon1] || 'Unknown';
    const varna2 = varnaMap[moon2] || 'Unknown';

    const compatibility = this._calculateVarnaCompatibility(kundli1, kundli2);

    return {
      points: compatibility.points,
      maxPoints: 1,
      person1Varna: varna1,
      person2Varna: varna2,
      compatibility: compatibility.description
    };
  }

  /**
   * Calculate Tara Guna (3 points)
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Tara compatibility
   */
  _calculateTaraGuna(kundli1, kundli2) {
    // Tara based on Moon's position relative to partner's Moon
    const moon1 = kundli1.planetaryPositions.moon;
    const moon2 = kundli2.planetaryPositions.moon;

    if (!moon1 || !moon2) {
      return { points: 0, maxPoints: 3, tara: 'Unknown', compatibility: 'Cannot determine' };
    }

    const tara = this._calculateTaraCompatibility(kundli1, kundli2);

    return {
      points: tara.points,
      maxPoints: 3,
      tara: tara.tara,
      compatibility: tara.description
    };
  }

  /**
   * Calculate Yoni Guna (4 points)
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Yoni compatibility
   */
  _calculateYoniGuna(kundli1, kundli2) {
    // Yoni based on Nakshatra
    const yoni = this._calculateYoniCompatibility(kundli1, kundli2);

    return {
      points: yoni.points,
      maxPoints: 4,
      person1Yoni: yoni.yoni1,
      person2Yoni: yoni.yoni2,
      compatibility: yoni.description
    };
  }

  /**
   * Calculate Grahamaitri Guna (5 points)
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Grahamaitri compatibility
   */
  _calculateGrahamaitriGuna(kundli1, kundli2) {
    // Friendship between Moon lords
    const grahamaitri = this._calculateGrahamaitriCompatibility(kundli1, kundli2);

    return {
      points: grahamaitri.points,
      maxPoints: 5,
      person1Lord: grahamaitri.lord1,
      person2Lord: grahamaitri.lord2,
      compatibility: grahamaitri.description
    };
  }

  /**
   * Calculate Gana Guna (6 points)
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Gana compatibility
   */
  _calculateGanaGuna(kundli1, kundli2) {
    // Gana based on Moon's Nakshatra
    const gana = this._calculateGanaCompatibility(kundli1, kundli2);

    return {
      points: gana.points,
      maxPoints: 6,
      person1Gana: gana.gana1,
      person2Gana: gana.gana2,
      compatibility: gana.description
    };
  }

  /**
   * Calculate Bhakut Guna (7 points)
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Bhakut compatibility
   */
  _calculateBhakutGuna(kundli1, kundli2) {
    // Bhakut based on Moon signs distance
    const bhakut = this._calculateBhakutCompatibility(kundli1, kundli2);

    return {
      points: bhakut.points,
      maxPoints: 7,
      moonSigns: `${bhakut.sign1}-${bhakut.sign2}`,
      compatibility: bhakut.description
    };
  }

  /**
   * Calculate Nadi Guna (8 points)
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Nadi compatibility
   */
  _calculateNadiGuna(kundli1, kundli2) {
    // Nadi based on Nakshatra
    const nadi = this._calculateNadiCompatibility(kundli1, kundli2);

    return {
      points: nadi.points,
      maxPoints: 8,
      person1Nadi: nadi.nadi1,
      person2Nadi: nadi.nadi2,
      compatibility: nadi.description
    };
  }

  /**
   * Calculate Varna compatibility
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Varna compatibility
   */
  _calculateVarnaCompatibility(kundli1, kundli2) {
    const moon1 = kundli1.planetaryPositions.moon?.sign || 'Unknown';
    const moon2 = kundli2.planetaryPositions.moon?.sign || 'Unknown';

    const varnaMap = {
      Aries: 'Kshatriya', Leo: 'Kshatriya', Sagittarius: 'Kshatriya',
      Taurus: 'Vaishya', Virgo: 'Vaishya', Capricorn: 'Vaishya',
      Gemini: 'Shudra', Libra: 'Shudra', Aquarius: 'Shudra',
      Cancer: 'Brahmin', Scorpio: 'Brahmin', Pisces: 'Brahmin'
    };

    const varna1 = varnaMap[moon1] || 'Unknown';
    const varna2 = varnaMap[moon2] || 'Unknown';

    // Varna compatibility matrix
    const compatibilityMatrix = {
      'Brahmin-Brahmin': { points: 1, description: 'Excellent spiritual compatibility' },
      'Brahmin-Kshatriya': { points: 1, description: 'Good leadership and wisdom balance' },
      'Brahmin-Vaishya': { points: 1, description: 'Balanced spiritual and material energies' },
      'Kshatriya-Kshatriya': { points: 1, description: 'Strong leadership and courage' },
      'Kshatriya-Vaishya': { points: 1, description: 'Good protection and prosperity' },
      'Vaishya-Vaishya': { points: 1, description: 'Strong material and business focus' },
      'Shudra-Shudra': { points: 1, description: 'Harmonious service orientation' }
    };

    const key = `${varna1}-${varna2}`;
    const reverseKey = `${varna2}-${varna1}`;

    return compatibilityMatrix[key] || compatibilityMatrix[reverseKey] || {
      points: 0,
      description: 'Different varna energies may require adjustment'
    };
  }

  /**
   * Calculate Tara compatibility
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Tara compatibility
   */
  _calculateTaraCompatibility(kundli1, kundli2) {
    // Simplified Tara calculation based on Moon positions
    const moon1 = kundli1.planetaryPositions.moon;
    const moon2 = kundli2.planetaryPositions.moon;

    if (!moon1 || !moon2) {
      return { points: 0, tara: 'Unknown', description: 'Cannot determine Tara' };
    }

    // Calculate relative position
    const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const sign1Index = signOrder.indexOf(moon1.sign);
    const sign2Index = signOrder.indexOf(moon2.sign);

    let distance = Math.abs(sign1Index - sign2Index);
    if (distance > 6) { distance = 12 - distance; } // Minimum distance

    // Tara points based on distance
    const taraPoints = [3, 1.5, 1, 0, 2, 0]; // Points for distances 0-5
    const points = taraPoints[distance] || 0;

    const taraNames = ['Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyak', 'Sadhak'];
    const tara = taraNames[distance] || 'Unknown';

    const descriptions = {
      Janma: { points: 3, description: 'Excellent Tara - very auspicious' },
      Sampat: { points: 1.5, description: 'Good Tara - brings prosperity' },
      Vipat: { points: 1, description: 'Challenging Tara - requires care' },
      Kshema: { points: 0, description: 'Neutral Tara - balanced energy' },
      Pratyak: { points: 2, description: 'Beneficial Tara - brings success' },
      Sadhak: { points: 0, description: 'Variable Tara - depends on other factors' }
    };

    return descriptions[tara] || { points: 0, tara: 'Unknown', description: 'Cannot determine Tara compatibility' };
  }

  /**
   * Calculate Yoni compatibility
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Yoni compatibility
   */
  _calculateYoniCompatibility(kundli1, kundli2) {
    // Yoni based on Nakshatra (simplified)
    const yoniMap = {
      // Male Yonis
      Ashwini: 'Horse', Bharani: 'Elephant', Pushya: 'Sheep', Ashlesha: 'Cat',
      Magha: 'Rat', 'Purva Phalguni': 'Rat', 'Uttara Phalguni': 'Cow', Hasta: 'Buffalo',
      Chitra: 'Tiger', Swati: 'Buffalo', Vishakha: 'Tiger', Anuradha: 'Deer',
      Jyeshta: 'Deer', Mula: 'Dog', 'Purva Ashadha': 'Monkey', 'Uttara Ashadha': 'Mongoose',
      Shravana: 'Monkey', Dhanishta: 'Lion', Shatabhisha: 'Horse', 'Purva Bhadrapada': 'Lion',
      'Uttara Bhadrapada': 'Cow', Revati: 'Elephant'
    };

    // For simplicity, assign based on Moon sign (this would normally be based on Nakshatra)
    const moonSign1 = kundli1.planetaryPositions.moon?.sign;
    const moonSign2 = kundli2.planetaryPositions.moon?.sign;

    // Simplified Yoni assignment
    const signYoniMap = {
      Aries: 'Sheep', Taurus: 'Bull', Gemini: 'Mongoose', Cancer: 'Cat',
      Leo: 'Lion', Virgo: 'Monkey', Libra: 'Rat', Scorpio: 'Snake',
      Sagittarius: 'Horse', Capricorn: 'Buffalo', Aquarius: 'Elephant', Pisces: 'Fish'
    };

    const yoni1 = signYoniMap[moonSign1] || 'Unknown';
    const yoni2 = signYoniMap[moonSign2] || 'Unknown';

    // Yoni compatibility (simplified)
    const compatibleYonis = {
      'Horse-Horse': 4, 'Elephant-Elephant': 4, 'Sheep-Sheep': 4,
      'Horse-Elephant': 3, 'Sheep-Horse': 3, 'Lion-Tiger': 3,
      'Snake-Cat': 0, 'Dog-Cat': 0 // Incompatible
    };

    const key = `${yoni1}-${yoni2}`;
    const reverseKey = `${yoni2}-${yoni1}`;
    const points = compatibleYonis[key] || compatibleYonis[reverseKey] || 2; // Neutral

    let description = 'Neutral Yoni compatibility';
    if (points === 4) { description = 'Excellent Yoni match - strong physical compatibility'; } else if (points === 3) { description = 'Good Yoni compatibility - harmonious energies'; } else if (points === 0) { description = 'Challenging Yoni - may require adjustments'; }

    return {
      points,
      yoni1,
      yoni2,
      description
    };
  }

  /**
   * Calculate Grahamaitri compatibility
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Grahamaitri compatibility
   */
  _calculateGrahamaitriCompatibility(kundli1, kundli2) {
    // Friendship between Moon lords
    const moon1Lord = kundli1.houses.find(h => h.sign === kundli1.planetaryPositions.moon?.sign)?.lord || 'Unknown';
    const moon2Lord = kundli2.houses.find(h => h.sign === kundli2.planetaryPositions.moon?.sign)?.lord || 'Unknown';

    // Planetary friendships (simplified)
    const friendships = {
      Sun: ['Moon', 'Mars', 'Jupiter'],
      Moon: ['Sun', 'Mercury'],
      Mars: ['Sun', 'Moon', 'Jupiter'],
      Mercury: ['Sun', 'Venus'],
      Jupiter: ['Sun', 'Moon', 'Mars'],
      Venus: ['Mercury', 'Saturn'],
      Saturn: ['Mercury', 'Venus']
    };

    const friends1 = friendships[moon1Lord] || [];
    const friends2 = friendships[moon2Lord] || [];

    let points = 5; // Maximum
    let description = 'Excellent friendship between Moon lords';

    if (!friends1.includes(moon2Lord) && !friends2.includes(moon1Lord)) {
      points = 0;
      description = 'Moon lords are not friendly - may cause misunderstandings';
    } else if (friends1.includes(moon2Lord) || friends2.includes(moon1Lord)) {
      points = 5;
      description = 'Harmonious friendship between Moon lords';
    } else {
      points = 3;
      description = 'Neutral relationship between Moon lords';
    }

    return {
      points,
      lord1: moon1Lord,
      lord2: moon2Lord,
      description
    };
  }

  /**
   * Calculate Gana compatibility
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Gana compatibility
   */
  _calculateGanaCompatibility(kundli1, kundli2) {
    // Gana based on Moon's Nakshatra (simplified by sign)
    const ganaMap = {
      Aries: 'Rakshasa', Taurus: 'Manushya', Gemini: 'Deva',
      Cancer: 'Manushya', Leo: 'Rakshasa', Virgo: 'Manushya',
      Libra: 'Rakshasa', Scorpio: 'Manushya', Sagittarius: 'Deva',
      Capricorn: 'Rakshasa', Aquarius: 'Manushya', Pisces: 'Deva'
    };

    const gana1 = ganaMap[kundli1.planetaryPositions.moon?.sign] || 'Unknown';
    const gana2 = ganaMap[kundli2.planetaryPositions.moon?.sign] || 'Unknown';

    // Gana compatibility
    const compatibility = {
      'Deva-Deva': { points: 6, description: 'Excellent - both divine nature' },
      'Deva-Manushya': { points: 6, description: 'Very good - divine and human balance' },
      'Manushya-Manushya': { points: 6, description: 'Good - both human nature' },
      'Rakshasa-Rakshasa': { points: 0, description: 'Challenging - both demoniac nature' },
      'Deva-Rakshasa': { points: 1, description: 'Difficult - divine vs demoniac' },
      'Manushya-Rakshasa': { points: 0, description: 'Very challenging - human vs demoniac' }
    };

    const key = `${gana1}-${gana2}`;
    const reverseKey = `${gana2}-${gana1}`;

    return compatibility[key] || compatibility[reverseKey] || {
      points: 3,
      gana1,
      gana2,
      description: 'Mixed Gana energies'
    };
  }

  /**
   * Calculate Bhakut compatibility
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Bhakut compatibility
   */
  _calculateBhakutCompatibility(kundli1, kundli2) {
    const sign1 = kundli1.planetaryPositions.moon?.sign;
    const sign2 = kundli2.planetaryPositions.moon?.sign;

    if (!sign1 || !sign2) {
      return { points: 0, sign1: 'Unknown', sign2: 'Unknown', description: 'Cannot determine Bhakut' };
    }

    const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const sign1Index = signOrder.indexOf(sign1);
    const sign2Index = signOrder.indexOf(sign2);

    let distance = Math.abs(sign1Index - sign2Index);
    if (distance > 6) { distance = 12 - distance; }

    // Bhakut points (7 is maximum)
    const bhakutPoints = [7, 7, 7, 7, 6, 5, 4]; // Points for distances 0-6
    const points = bhakutPoints[distance] || 0;

    let description = 'Good Bhakut compatibility';
    if (points >= 6) { description = 'Excellent Bhakut - very auspicious'; } else if (points >= 4) { description = 'Good Bhakut compatibility'; } else if (points < 4) { description = 'Challenging Bhakut - requires attention'; }

    return {
      points,
      sign1,
      sign2,
      distance,
      description
    };
  }

  /**
   * Calculate Nadi compatibility
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Nadi compatibility
   */
  _calculateNadiCompatibility(kundli1, kundli2) {
    // Nadi based on Nakshatra (simplified by Moon sign)
    const nadiMap = {
      Aries: 'Aadi', Taurus: 'Madhya', Gemini: 'Antya',
      Cancer: 'Aadi', Leo: 'Madhya', Virgo: 'Antya',
      Libra: 'Aadi', Scorpio: 'Madhya', Sagittarius: 'Antya',
      Capricorn: 'Aadi', Aquarius: 'Madhya', Pisces: 'Antya'
    };

    const nadi1 = nadiMap[kundli1.planetaryPositions.moon?.sign] || 'Unknown';
    const nadi2 = nadiMap[kundli2.planetaryPositions.moon?.sign] || 'Unknown';

    // Nadi compatibility - same Nadi gives 0 points (not recommended)
    let points = 8;
    let description = 'Excellent Nadi compatibility';

    if (nadi1 === nadi2) {
      points = 0;
      description = 'Same Nadi - traditionally not recommended for marriage';
    }

    return {
      points,
      nadi1,
      nadi2,
      description
    };
  }

  /**
   * Calculate Nakshatra compatibility
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Nakshatra compatibility
   */
  _calculateNakshatraCompatibility(kundli1, kundli2) {
    // Get Moon's Nakshatra for both people
    const nakshatra1 = this._getMoonNakshatra(kundli1);
    const nakshatra2 = this._getMoonNakshatra(kundli2);

    // Nakshatra compatibility based on traditional matching
    const compatibility = this._getNakshatraCompatibility(nakshatra1, nakshatra2);

    return {
      nakshatra1,
      nakshatra2,
      compatibility: compatibility.description,
      points: compatibility.points,
      maxPoints: 2,
      rulingDeity1: this._getNakshatraDeity(nakshatra1),
      rulingDeity2: this._getNakshatraDeity(nakshatra2),
      symbolism1: this._getNakshatraSymbolism(nakshatra1),
      symbolism2: this._getNakshatraSymbolism(nakshatra2)
    };
  }

  /**
   * Get Moon's Nakshatra from Kundli
   * @private
   * @param {Object} kundli - Kundli data
   * @returns {string} Nakshatra name
   */
  _getMoonNakshatra(kundli) {
    // Simplified - in practice would calculate exact Nakshatra from Moon's longitude
    const moonSign = kundli.planetaryPositions.moon?.sign || 'Aries';

    // Map signs to representative Nakshatras (simplified)
    const signToNakshatra = {
      Aries: 'Ashwini',
      Taurus: 'Krittika',
      Gemini: 'Mrigashira',
      Cancer: 'Pushya',
      Leo: 'Magha',
      Virgo: 'Uttara Phalguni',
      Libra: 'Vishakha',
      Scorpio: 'Anuradha',
      Sagittarius: 'Mula',
      Capricorn: 'Uttara Ashadha',
      Aquarius: 'Shravana',
      Pisces: 'Revati'
    };

    return signToNakshatra[moonSign] || 'Ashwini';
  }

  /**
   * Get Nakshatra compatibility
   * @private
   * @param {string} nakshatra1 - First Nakshatra
   * @param {string} nakshatra2 - Second Nakshatra
   * @returns {Object} Compatibility result
   */
  _getNakshatraCompatibility(nakshatra1, nakshatra2) {
    // Simplified compatibility matrix
    const compatibilityMatrix = {
      Ashwini: { Ashwini: 'Good', Bharani: 'Excellent', Krittika: 'Neutral' },
      Bharani: { Ashwini: 'Excellent', Bharani: 'Good', Krittika: 'Good' },
      Krittika: { Ashwini: 'Neutral', Bharani: 'Good', Krittika: 'Excellent' }
      // Add more Nakshatra pairs as needed
    };

    const compatibility = compatibilityMatrix[nakshatra1]?.[nakshatra2] ||
                          compatibilityMatrix[nakshatra2]?.[nakshatra1] ||
                          'Neutral';

    let points = 1; // Default neutral
    if (compatibility === 'Excellent') { points = 2; } else if (compatibility === 'Good') { points = 1.5; } else if (compatibility === 'Poor') { points = 0; }

    return {
      description: `${compatibility} Nakshatra compatibility`,
      points
    };
  }

  /**
   * Get Nakshatra ruling deity
   * @private
   * @param {string} nakshatra - Nakshatra name
   * @returns {string} Ruling deity
   */
  _getNakshatraDeity(nakshatra) {
    const deities = {
      Ashwini: 'Ashwin Kumaras',
      Bharani: 'Yama',
      Krittika: 'Agni',
      Rohini: 'Brahma',
      Mrigashira: 'Soma',
      Ardra: 'Rudra',
      Punarvasu: 'Aditi',
      Pushya: 'Brihaspati',
      Ashlesha: 'Nagadevas',
      Magha: 'Pitris',
      'Purva Phalguni': 'Bhaga',
      'Uttara Phalguni': 'Aryaman',
      Hasta: 'Savitar',
      Chitra: 'Vishwakarma',
      Swati: 'Vayu',
      Vishakha: 'Indra/Agni',
      Anuradha: 'Mitra',
      Jyeshta: 'Indra',
      Mula: 'Nirriti',
      'Purva Ashadha': 'Apas',
      'Uttara Ashadha': 'Vishwadevas',
      Shravana: 'Vishnu',
      Dhanishta: 'Vasu',
      Shatabhisha: 'Varuna',
      'Purva Bhadrapada': 'Aja Ekapada',
      'Uttara Bhadrapada': 'Ahir Budhnya',
      Revati: 'Pushan'
    };

    return deities[nakshatra] || 'Various Deities';
  }

  /**
   * Get Nakshatra symbolism
   * @private
   * @param {string} nakshatra - Nakshatra name
   * @returns {string} Symbolism
   */
  _getNakshatraSymbolism(nakshatra) {
    const symbols = {
      Ashwini: 'Horse head - swift action and healing',
      Bharani: 'Yoni - birth and creation',
      Krittika: 'Knife - cutting through obstacles',
      Rohini: 'Cart - growth and abundance',
      Mrigashira: 'Deer head - searching and sensitivity',
      Ardra: 'Teardrop - emotional depth',
      Punarvasu: 'Bow and quiver - renewal and expansion',
      Pushya: 'Flower - nourishment and care',
      Ashlesha: 'Serpent - transformation and wisdom',
      Magha: 'Throne - power and authority',
      'Purva Phalguni': 'Front legs of bed - pleasure and marriage',
      'Uttara Phalguni': 'Back legs of bed - friendship and service',
      Hasta: 'Hand - skill and craftsmanship',
      Chitra: 'Pearl - beauty and brilliance',
      Swati: 'Shoot of plant - independence and growth',
      Vishakha: 'Triumphal arch - achievement and victory',
      Anuradha: 'Lotus flower - devotion and friendship',
      Jyeshta: 'Umbrella - protection and seniority',
      Mula: 'Bunch of roots - foundation and investigation',
      'Purva Ashadha': 'Elephant tusk - invincibility and wisdom',
      'Uttara Ashadha': 'Elephant tusk - victory and perseverance',
      Shravana: 'Ear - learning and listening',
      Dhanishta: 'Drum - rhythm and celebration',
      Shatabhisha: 'Empty circle - healing and purification',
      'Purva Bhadrapada': 'Sword - transformation and warfare',
      'Uttara Bhadrapada': 'Twins - wisdom and liberation',
      Revati: 'Fish - prosperity and guidance'
    };

    return symbols[nakshatra] || 'Universal symbolism';
  }

  /**
   * Analyze Manglik dosha
   * @private
   * @param {Object} kundli1 - First person's Kundli
   * @param {Object} kundli2 - Second person's Kundli
   * @returns {Object} Manglik analysis
   */
  _analyzeManglikDosha(kundli1, kundli2) {
    // Manglik dosha occurs when Mars is in certain houses from Lagna or Moon
    const manglikHouses = [1, 2, 4, 7, 8, 12]; // Houses where Mars causes Manglik dosha

    const mars1House = kundli1.planetaryPositions.mars?.house;
    const mars2House = kundli2.planetaryPositions.mars?.house;

    const person1Manglik = manglikHouses.includes(mars1House);
    const person2Manglik = manglikHouses.includes(mars2House);

    let doshaStrength = 'None';
    let compatibility = 'Compatible';
    let remedies = [];

    if (person1Manglik && person2Manglik) {
      doshaStrength = 'Double Manglik';
      compatibility = 'Highly Compatible';
      remedies = ['Both partners should perform Kumbh Vivah ceremony'];
    } else if (person1Manglik || person2Manglik) {
      doshaStrength = 'Single Manglik';
      compatibility = 'Requires remedies';
      remedies = [
        'Perform Manglik dosha nivaran puja',
        'Fast on Tuesdays',
        'Donate red items to temples',
        'Consider marriage after age 28'
      ];
    }

    return {
      person1Manglik,
      person2Manglik,
      doshaStrength,
      compatibility,
      remedies,
      description: person1Manglik || person2Manglik ?
        'Manglik dosha present - remedies recommended' :
        'No Manglik dosha - auspicious for marriage'
    };
  }

  /**
   * Calculate overall compatibility
   * @private
   * @param {Object} gunaMatching - Guna matching results
   * @param {Object} manglikAnalysis - Manglik analysis
   * @returns {Object} Overall compatibility
   */
  _calculateOverallCompatibility(gunaMatching, manglikAnalysis) {
    const gunaScore = gunaMatching.percentage;
    let manglikPenalty = 0;

    if (manglikAnalysis.doshaStrength === 'Single Manglik') {
      manglikPenalty = 10; // Reduce score by 10% for single Manglik
    }

    const finalScore = Math.max(0, gunaScore - manglikPenalty);

    let compatibility = 'Not Recommended';
    if (finalScore >= 75) { compatibility = 'Excellent Match'; } else if (finalScore >= 60) { compatibility = 'Good Match'; } else if (finalScore >= 40) { compatibility = 'Average Match'; } else if (finalScore >= 25) { compatibility = 'Challenging Match'; }

    return {
      score: finalScore,
      compatibility,
      factors: {
        gunaScore,
        manglikPenalty,
        finalScore
      }
    };
  }

  /**
   * Generate marriage recommendations
   * @private
   * @param {Object} overallScore - Overall compatibility score
   * @param {Object} gunaMatching - Guna matching results
   * @param {Object} manglikAnalysis - Manglik analysis
   * @returns {Array} Recommendations
   */
  _generateMarriageRecommendations(overallScore, gunaMatching, manglikAnalysis) {
    const recommendations = [];

    if (overallScore.score >= 75) {
      recommendations.push('Excellent compatibility! This is a highly auspicious match.');
      recommendations.push('Proceed with marriage ceremonies and celebrations.');
    } else if (overallScore.score >= 60) {
      recommendations.push('Good compatibility with some areas for attention.');
      recommendations.push('Consider performing remedial measures for challenging areas.');
    } else if (overallScore.score >= 40) {
      recommendations.push('Average compatibility - requires careful consideration.');
      recommendations.push('Consult with elders and perform additional compatibility checks.');
    } else {
      recommendations.push('Challenging compatibility - not traditionally recommended.');
      recommendations.push('Consider alternative matches or extensive remedial measures.');
    }

    // Add Manglik recommendations
    if (manglikAnalysis.remedies.length > 0) {
      recommendations.push('Manglik remedies:');
      manglikAnalysis.remedies.forEach(remedy => {
        recommendations.push(`• ${remedy}`);
      });
    }

    // Add Guna-specific recommendations
    if (gunaMatching.totalPoints < 18) {
      recommendations.push('Low Guna score - consider consulting a Vedic astrologer for detailed analysis.');
    }

    return recommendations;
  }

  /**
   * Generate marriage summary
   * @private
   * @param {Object} overallScore - Overall compatibility score
   * @param {Object} gunaMatching - Guna matching results
   * @param {Object} manglikAnalysis - Manglik analysis
   * @returns {string} Summary text
   */
  _generateMarriageSummary(overallScore, gunaMatching, manglikAnalysis) {
    let summary = '💕 *Marriage Compatibility Analysis*\n\n';
    summary += `*Overall Score:* ${overallScore.score}% (${overallScore.compatibility})\n`;
    summary += `*Guna Matching:* ${gunaMatching.totalPoints}/36 points (${gunaMatching.percentage}%)\n`;
    summary += `*Manglik Status:* ${manglikAnalysis.doshaStrength}\n\n`;

    if (gunaMatching.totalPoints >= 24) {
      summary += '🎉 *Excellent Match!* High Guna compatibility suggests harmonious marriage.\n\n';
    } else if (gunaMatching.totalPoints >= 18) {
      summary += '👍 *Good Match* with some areas needing attention.\n\n';
    } else {
      summary += '⚠️ *Challenging Match* - Consider remedies and further consultation.\n\n';
    }

    if (manglikAnalysis.person1Manglik || manglikAnalysis.person2Manglik) {
      summary += `*Manglik Considerations:* ${manglikAnalysis.description}\n\n`;
    }

    summary += '*Key Factors:*\n';
    summary += `• Varna: ${gunaMatching.individualGunas.varna.points}/1\n`;
    summary += `• Tara: ${gunaMatching.individualGunas.tara.points}/3\n`;
    summary += `• Yoni: ${gunaMatching.individualGunas.yoni.points}/4\n`;
    summary += `• Grahamaitri: ${gunaMatching.individualGunas.grahamaitri.points}/5\n`;
    summary += `• Gana: ${gunaMatching.individualGunas.gana.points}/6\n`;
    summary += `• Bhakut: ${gunaMatching.individualGunas.bhakut.points}/7\n`;
    summary += `• Nadi: ${gunaMatching.individualGunas.nadi.points}/8\n\n`;

    summary += 'This analysis follows traditional Vedic astrology principles. Consult with family elders and priests for final decisions. 🕉️';

    return summary;
  }

  /**
    * Interpret Guna score
    * @private
    * @param {number} totalPoints - Total Guna points
    * @returns {string} Interpretation
    */
  _interpretGunaScore(totalPoints) {
    if (totalPoints >= 31) { return 'Exceptional Match'; }
    if (totalPoints >= 25) { return 'Excellent Match'; }
    if (totalPoints >= 19) { return 'Good Match'; }
    if (totalPoints >= 15) { return 'Average Match'; }
    if (totalPoints >= 10) { return 'Below Average'; }
    return 'Not Recommended';
  }

  /**
   * Generate Sade Sati analysis for Saturn's transit
   * @param {Object} birthData - User's birth data
   * @returns {Object} Sade Sati analysis
   */
  async generateSadeSatiAnalysis(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return {
          error: 'Complete birth details required for Sade Sati analysis'
        };
      }

      // Generate birth chart
      const kundli = await this.generateVedicKundli(birthData);
      if (kundli.error) {
        return { error: kundli.error };
      }

      // Analyze current Sade Sati status
      const sadeSatiAnalysis = this._analyzeSadeSati(kundli);

      // Calculate current phase and timing
      const currentPhase = this._calculateSadeSatiPeriod(kundli, new Date());

      // Generate effects based on current phase
      const effects = this._getSadeSatiEffects(sadeSatiAnalysis, currentPhase);

      // Generate remedies
      const remedies = this._generateSadeSatiRemedies(sadeSatiAnalysis, currentPhase);

      return {
        name,
        sadeSatiAnalysis,
        currentPhase,
        effects,
        remedies,
        summary: this._generateSadeSatiSummary(sadeSatiAnalysis, currentPhase, effects, remedies)
      };
    } catch (error) {
      logger.error('Error generating Sade Sati analysis:', error);
      return {
        error: 'Unable to generate Sade Sati analysis at this time'
      };
    }
  }

  /**
   * Analyze Sade Sati in the birth chart
   * @private
   * @param {Object} kundli - Kundli data
   * @returns {Object} Sade Sati analysis
   */
  _analyzeSadeSati(kundli) {
    const analysis = {
      moonSign: '',
      saturnSign: '',
      isInSadeSati: false,
      phase: 'Not in Sade Sati',
      remainingYears: 0,
      intensity: 'None',
      affectedHouses: [],
      saturnPosition: 0,
      moonPosition: 0
    };

    const { moon } = kundli.planetaryPositions;
    const { saturn } = kundli.planetaryPositions;

    if (!moon || !saturn) {
      return analysis;
    }

    analysis.moonSign = moon.sign;
    analysis.saturnSign = saturn.sign;
    analysis.saturnPosition = saturn.house;
    analysis.moonPosition = moon.house;

    // Sade Sati occurs when Saturn transits the 12th, 1st, and 2nd houses from Moon
    const moonHouse = moon.house;
    const saturnHouse = saturn.house;

    // Calculate houses that would be affected by Sade Sati
    const sadeSatiHouses = [
      moonHouse === 1 ? 12 : moonHouse - 1, // 12th from Moon
      moonHouse, // 1st from Moon (Moon's house)
      moonHouse === 12 ? 1 : moonHouse + 1  // 2nd from Moon
    ];

    analysis.affectedHouses = sadeSatiHouses;

    // Check if Saturn is currently in Sade Sati zone
    if (sadeSatiHouses.includes(saturnHouse)) {
      analysis.isInSadeSati = true;

      // Determine which phase
      if (saturnHouse === sadeSatiHouses[0]) {
        analysis.phase = 'Rising Phase (12th from Moon)';
        analysis.intensity = 'Building';
      } else if (saturnHouse === sadeSatiHouses[1]) {
        analysis.phase = 'Peak Phase (Moon sign)';
        analysis.intensity = 'Maximum';
      } else if (saturnHouse === sadeSatiHouses[2]) {
        analysis.phase = 'Setting Phase (2nd from Moon)';
        analysis.intensity = 'Decreasing';
      }

      // Calculate remaining time in current Sade Sati
      analysis.remainingYears = this._calculateRemainingSadeSatiTime(saturnHouse, sadeSatiHouses);
    } else {
      // Calculate when next Sade Sati will occur
      analysis.nextSadeSatiYear = this._calculateNextSadeSatiYear(moonHouse, saturn);
    }

    return analysis;
  }

  /**
   * Calculate current Sade Sati period details
   * @private
   * @param {Object} kundli - Kundli data
   * @param {Date} currentDate - Current date
   * @returns {Object} Current phase details
   */
  async _calculateSadeSatiPeriod(kundli, currentDate) {
    const { moon } = kundli.planetaryPositions;
    if (!moon) {
      return { phase: 'Unknown', startDate: null, endDate: null, progress: 0 };
    }

    const moonSign = moon.sign;
    const moonLongitude = moon.longitude;

    // Get current Saturn position using sweph
    const currentJD = sweph.julday(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      currentDate.getDate(),
      currentDate.getHours() + currentDate.getMinutes() / 60,
      1
    );
    const saturnPosition = sweph.calc(currentJD, 6, 2);
    const saturnLongitude = saturnPosition.longitude[0];

    // Calculate the houses from Moon where Saturn is transiting
    const moonHouse = Math.floor(moonLongitude / 30) + 1; // 1-12
    const saturnHouse = Math.floor(saturnLongitude / 30) + 1; // 1-12

    // Sade Sati houses are 12th, 1st, and 2nd from Moon
    const sadeSatiHouses = [
      (moonHouse === 1) ? 12 : moonHouse - 1,
      moonHouse,
      (moonHouse === 12) ? 1 : moonHouse + 1
    ];

    let phase = 'Not currently in Sade Sati';
    let startDate = null;
    let endDate = null;
    let progress = 0;
    let description = 'Period of relative stability and growth';

    if (sadeSatiHouses.includes(saturnHouse)) {
      // Determine which phase of Sade Sati
      if (saturnHouse === sadeSatiHouses[0]) {
        phase = 'Phase 1: Rising (12th from Moon)';
        description = 'Building phase - challenges begin, testing period starts';
      } else if (saturnHouse === sadeSatiHouses[1]) {
        phase = 'Phase 2: Peak (Moon sign)';
        description = 'Maximum intensity - major life changes and karmic lessons';
      } else if (saturnHouse === sadeSatiHouses[2]) {
        phase = 'Phase 3: Setting (2nd from Moon)';
        description = 'Resolution phase - lessons learned, new stability emerges';
      }

      // Calculate precise start and end dates for current Sade Sati phase
      const phaseDates = await this._calculateSadeSatiPhaseDates(saturnHouse, sadeSatiHouses, currentDate);
      startDate = phaseDates.startDate;
      endDate = phaseDates.endDate;
      progress = phaseDates.progress;
    }

    return {
      phase,
      startDate: startDate ? startDate.toLocaleDateString() : null,
      endDate: endDate ? endDate.toLocaleDateString() : null,
      progress,
      description
    };
  }

  /**
   * Calculate precise start and end dates for Sade Sati phase
   * @private
   * @param {number} saturnHouse - Current Saturn house
   * @param {Array} sadeSatiHouses - Sade Sati affected houses
   * @param {Date} currentDate - Current date
   * @returns {Object} Phase dates and progress
   */
  async _calculateSadeSatiPhaseDates(saturnHouse, sadeSatiHouses, currentDate) {
    try {
      const currentJD = sweph.julday(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        currentDate.getDate(),
        currentDate.getHours() + currentDate.getMinutes() / 60,
        1
      );

      // Calculate Saturn's position at current time
      const saturnPos = sweph.calc(currentJD, 6, 2);
      const currentSaturnLong = saturnPos.longitude[0];

      // Calculate the longitude range for current Sade Sati phase
      const phaseIndex = sadeSatiHouses.indexOf(saturnHouse);
      const phaseStartLong = (sadeSatiHouses[phaseIndex] - 1) * 30;
      const phaseEndLong = phaseStartLong + 30;

      // Calculate progress within the current phase
      const progress = Math.round(((currentSaturnLong - phaseStartLong) / 30) * 100);

      // Estimate start and end dates (simplified - Saturn moves ~1 degree per month)
      const degreesRemaining = phaseEndLong - currentSaturnLong;
      const monthsRemaining = degreesRemaining; // Rough approximation
      const endDate = new Date(currentDate);
      endDate.setMonth(endDate.getMonth() + monthsRemaining);

      const degreesElapsed = currentSaturnLong - phaseStartLong;
      const monthsElapsed = degreesElapsed;
      const startDate = new Date(currentDate);
      startDate.setMonth(startDate.getMonth() - monthsElapsed);

      return {
        startDate,
        endDate,
        progress: Math.max(0, Math.min(100, progress))
      };
    } catch (error) {
      logger.error('Error calculating Sade Sati phase dates:', error);
      return {
        startDate: null,
        endDate: null,
        progress: 0
      };
    }
  }

  /**
   * Get Sade Sati effects based on analysis and current phase
   * @private
   * @param {Object} analysis - Sade Sati analysis
   * @param {Object} currentPhase - Current phase details
   * @returns {Array} Effects and impacts
   */
  _getSadeSatiEffects(analysis, currentPhase) {
    const effects = [];

    if (!analysis.isInSadeSati) {
      effects.push({
        type: 'General',
        description: 'Period of relative stability and growth opportunities',
        severity: 'Low',
        duration: 'Ongoing until next Sade Sati'
      });
      return effects;
    }

    // Phase-specific effects
    if (currentPhase.phase.includes('Phase 1')) {
      effects.push({
        type: 'Career & Finance',
        description: 'Career changes, financial challenges, health concerns begin',
        severity: 'Medium',
        duration: '2.5 years'
      });
      effects.push({
        type: 'Relationships',
        description: 'Family tensions, relationship testing, communication issues',
        severity: 'Medium',
        duration: '2.5 years'
      });
    } else if (currentPhase.phase.includes('Phase 2')) {
      effects.push({
        type: 'Major Life Changes',
        description: 'Significant transformations, karmic lessons, major decisions',
        severity: 'High',
        duration: '2.5 years'
      });
      effects.push({
        type: 'Health & Energy',
        description: 'Physical and mental health challenges, energy depletion',
        severity: 'High',
        duration: '2.5 years'
      });
    } else if (currentPhase.phase.includes('Phase 3')) {
      effects.push({
        type: 'Resolution & Growth',
        description: 'Lessons learned, new stability, wisdom gained',
        severity: 'Medium-High',
        duration: '2.5 years'
      });
      effects.push({
        type: 'Future Planning',
        description: 'Long-term planning, relationship stability, career consolidation',
        severity: 'Medium',
        duration: '2.5 years'
      });
    }

    // Moon sign specific effects
    const moonSignEffects = this._getMoonSignSadeSatiEffects(analysis.moonSign);
    effects.push(...moonSignEffects);

    return effects;
  }

  /**
    * Generate Sade Sati remedies using comprehensive Vedic Remedies system
    * @private
    * @param {Object} analysis - Sade Sati analysis
    * @param {Object} currentPhase - Current phase details
    * @returns {Object} Comprehensive remedies package
    */
  _generateSadeSatiRemedies(analysis, currentPhase) {
    if (!this._vedicRemedies) {
      // Fallback to basic remedies if VedicRemedies not available
      return this._generateBasicSadeSatiRemedies(analysis, currentPhase);
    }

    try {
      // Get comprehensive remedies from VedicRemedies system
      const remediesData = this._vedicRemedies.generateDoshaRemedies('sade_sati');

      if (remediesData.error) {
        return this._generateBasicSadeSatiRemedies(analysis, currentPhase);
      }

      // Enhance with phase-specific and moon sign remedies
      const enhancedRemedies = { ...remediesData };

      // Add phase-specific remedies
      if (analysis.isInSadeSati) {
        const phaseRemedies = this._getPhaseSpecificSadeSatiRemedies(currentPhase);
        if (phaseRemedies.length > 0) {
          enhancedRemedies.phaseSpecific = phaseRemedies;
        }
      }

      // Add moon sign specific remedies
      const moonSignRemedies = this._getMoonSignSadeSatiRemedies(analysis.moonSign);
      if (moonSignRemedies.length > 0) {
        enhancedRemedies.moonSignSpecific = moonSignRemedies;
      }

      return enhancedRemedies;
    } catch (error) {
      logger.error('Error generating comprehensive Sade Sati remedies:', error);
      return this._generateBasicSadeSatiRemedies(analysis, currentPhase);
    }
  }

  /**
    * Generate basic Sade Sati remedies (fallback)
    * @private
    * @param {Object} analysis - Sade Sati analysis
    * @param {Object} currentPhase - Current phase details
    * @returns {Object} Basic remedies
    */
  _generateBasicSadeSatiRemedies(analysis, currentPhase) {
    const remedies = [];

    if (!analysis.isInSadeSati) {
      remedies.push({
        type: 'Preparation',
        description: 'Prepare for future Sade Sati by strengthening spiritual practices',
        urgency: 'Low',
        category: 'Spiritual'
      });
      return { basic: remedies };
    }

    // General remedies for all phases
    remedies.push({
      type: 'Saturn Worship',
      description: 'Regular worship of Lord Saturn (Shani) on Saturdays',
      urgency: 'High',
      category: 'Spiritual'
    });

    remedies.push({
      type: 'Fasting',
      description: 'Fast on Saturdays, especially during Sade Sati periods',
      urgency: 'High',
      category: 'Spiritual'
    });

    remedies.push({
      type: 'Charity',
      description: 'Donate sesame seeds, black clothes, and iron items to poor',
      urgency: 'High',
      category: 'Charitable'
    });

    // Phase-specific remedies
    const phaseRemedies = this._getPhaseSpecificSadeSatiRemedies(currentPhase);
    remedies.push(...phaseRemedies);

    // Moon sign specific remedies
    const moonSignRemedies = this._getMoonSignSadeSatiRemedies(analysis.moonSign);
    remedies.push(...moonSignRemedies);

    return { basic: remedies };
  }

  /**
    * Get phase-specific Sade Sati remedies
    * @private
    * @param {Object} currentPhase - Current phase details
    * @returns {Array} Phase-specific remedies
    */
  _getPhaseSpecificSadeSatiRemedies(currentPhase) {
    const remedies = [];

    if (currentPhase.phase.includes('Phase 1') || currentPhase.phase.includes('Rising')) {
      remedies.push({
        type: 'Protection',
        description: 'Wear black sapphire or iron ring for protection',
        urgency: 'Medium',
        category: 'Gemstone'
      });
    } else if (currentPhase.phase.includes('Phase 2') || currentPhase.phase.includes('Peak')) {
      remedies.push({
        type: 'Mantras',
        description: 'Chant "Om Sham Shanishcharaya Namaha" daily',
        urgency: 'High',
        category: 'Mantra'
      });
      remedies.push({
        type: 'Puja',
        description: 'Perform Shani Sade Sati Nivaran Puja',
        urgency: 'High',
        category: 'Ritual'
      });
    } else if (currentPhase.phase.includes('Phase 3') || currentPhase.phase.includes('Setting')) {
      remedies.push({
        type: 'Gratitude',
        description: 'Express gratitude for lessons learned, maintain positive attitude',
        urgency: 'Medium',
        category: 'Mental'
      });
    }

    return remedies;
  }

  /**
   * Generate Sade Sati summary
   * @private
   * @param {Object} analysis - Sade Sati analysis
   * @param {Object} currentPhase - Current phase details
   * @param {Array} effects - Effects
   * @param {Array} remedies - Remedies
   * @returns {string} Summary text
   */
  _generateSadeSatiSummary(analysis, currentPhase, effects, remedies) {
    let summary = '🪐 *Sade Sati Analysis*\n\n';

    summary += `*Moon Sign:* ${analysis.moonSign}\n`;
    summary += `*Saturn Position:* ${analysis.saturnSign} (${analysis.saturnPosition}th house)\n\n`;

    if (analysis.isInSadeSati) {
      summary += '⚠️ *Currently in Sade Sati*\n\n';
      summary += `*Current Phase:* ${currentPhase.phase}\n`;
      summary += `*Progress:* ${currentPhase.progress}% complete\n`;
      summary += `*Intensity:* ${analysis.intensity}\n`;
      summary += `*Time Remaining:* Approximately ${analysis.remainingYears} years\n\n`;

      summary += '*Key Effects:*\n';
      effects.slice(0, 3).forEach(effect => {
        summary += `• ${effect.type}: ${effect.description}\n`;
      });
      summary += '\n';

      summary += '*🕉️ Comprehensive Remedies:*\n\n';

      // Gemstones
      if (remedies.gemstones && remedies.gemstones.length > 0) {
        summary += '*💎 Recommended Gemstones:*\n';
        remedies.gemstones.forEach(gem => {
          summary += `• ${gem.name} (${gem.sanskrit}) - ${gem.day}\n`;
        });
        summary += '\n';
      }

      // Mantras
      if (remedies.mantras && remedies.mantras.length > 0) {
        summary += '*📿 Powerful Mantras:*\n';
        remedies.mantras.forEach(mantra => {
          summary += `• "${mantra.beej}"\n`;
        });
        summary += '\n';
      }

      // Puja
      if (remedies.puja) {
        summary += '*🙏 Recommended Puja:*\n';
        summary += `• ${remedies.puja.name}\n`;
        summary += `• Benefits: ${remedies.puja.benefits}\n\n`;
      }

      // Special practices
      if (remedies.special) {
        summary += '*⚡ Special Practices:*\n';
        if (remedies.special.fasting) { summary += `• Fasting: ${remedies.special.fasting}\n`; }
        if (remedies.special.offerings) { summary += `• Offerings: ${remedies.special.offerings}\n`; }
        if (remedies.special.rituals) { summary += `• Rituals: ${remedies.special.rituals}\n`; }
        summary += '\n';
      }

      // Phase-specific remedies
      if (remedies.phaseSpecific && remedies.phaseSpecific.length > 0) {
        summary += '*🌅 Phase-Specific Remedies:*\n';
        remedies.phaseSpecific.slice(0, 2).forEach(remedy => {
          summary += `• ${remedy.description}\n`;
        });
        summary += '\n';
      }

      // Moon sign specific remedies
      if (remedies.moonSignSpecific && remedies.moonSignSpecific.length > 0) {
        summary += '*🌙 Moon Sign Remedies:*\n';
        remedies.moonSignSpecific.slice(0, 2).forEach(remedy => {
          summary += `• ${remedy.description}\n`;
        });
        summary += '\n';
      }

      // Basic remedies fallback
      if (remedies.basic && remedies.basic.length > 0) {
        summary += '*Basic Remedies:*\n';
        remedies.basic.slice(0, 3).forEach(remedy => {
          summary += `• ${remedy.description}\n`;
        });
        summary += '\n';
      }

      summary += '*Remember:* Sade Sati brings karmic lessons and growth opportunities. Stay patient and maintain spiritual practices. 🕉️';
    } else {
      summary += '✅ *Not currently in Sade Sati*\n\n';
      summary += `*Next Sade Sati:* Around ${analysis.nextSadeSatiYear}\n\n`;
      summary += 'Use this time to prepare spiritually and strengthen your foundations for future challenges.';
    }

    return summary;
  }

  /**
   * Calculate remaining time in current Sade Sati
   * @private
   * @param {number} saturnHouse - Saturn's current house
   * @param {Array} sadeSatiHouses - Affected houses
   * @returns {number} Remaining years
   */
  _calculateRemainingSadeSatiTime(saturnHouse, sadeSatiHouses) {
    const currentIndex = sadeSatiHouses.indexOf(saturnHouse);
    const remainingPhases = 3 - currentIndex - 1; // Each phase is ~2.5 years
    return remainingPhases * 2.5;
  }

  /**
   * Calculate next Sade Sati year
   * @private
   * @param {number} moonHouse - Moon's house
   * @param {Object} saturn - Saturn position
   * @returns {number} Next Sade Sati year
   */
  _calculateNextSadeSatiYear(moonHouse, saturn) {
    // Simplified calculation - Saturn takes ~29-30 years for full cycle
    const currentYear = new Date().getFullYear();
    // Estimate based on Saturn's position relative to Moon
    return currentYear + Math.floor((12 - (moonHouse - saturn.house + 12) % 12) * 2.5);
  }

  /**
   * Get Moon sign specific Sade Sati effects
   * @private
   * @param {string} moonSign - Moon sign
   * @returns {Array} Moon sign specific effects
   */
  _getMoonSignSadeSatiEffects(moonSign) {
    const effects = {
      Aries: [{
        type: 'Leadership Challenges',
        description: 'Testing of leadership abilities, conflicts with authority figures',
        severity: 'Medium',
        duration: 'Throughout Sade Sati'
      }],
      Taurus: [{
        type: 'Financial Testing',
        description: 'Financial stability challenged, material losses possible',
        severity: 'High',
        duration: 'Throughout Sade Sati'
      }],
      Gemini: [{
        type: 'Communication Issues',
        description: 'Miscommunications, relationship problems, mental stress',
        severity: 'Medium',
        duration: 'Throughout Sade Sati'
      }],
      Cancer: [{
        type: 'Family & Home',
        description: 'Family conflicts, home changes, emotional turmoil',
        severity: 'High',
        duration: 'Throughout Sade Sati'
      }],
      Leo: [{
        type: 'Self-Expression',
        description: 'Creative blocks, recognition issues, ego challenges',
        severity: 'Medium-High',
        duration: 'Throughout Sade Sati'
      }],
      Virgo: [{
        type: 'Health & Service',
        description: 'Health issues, work dissatisfaction, perfectionism challenges',
        severity: 'High',
        duration: 'Throughout Sade Sati'
      }],
      Libra: [{
        type: 'Relationships',
        description: 'Partnership difficulties, legal issues, balance disruption',
        severity: 'Medium-High',
        duration: 'Throughout Sade Sati'
      }],
      Scorpio: [{
        type: 'Transformation',
        description: 'Deep psychological changes, power struggles, rebirth',
        severity: 'Very High',
        duration: 'Throughout Sade Sati'
      }],
      Sagittarius: [{
        type: 'Philosophy & Travel',
        description: 'Belief system challenges, travel disruptions, optimism tested',
        severity: 'Medium',
        duration: 'Throughout Sade Sati'
      }],
      Capricorn: [{
        type: 'Career & Authority',
        description: 'Career setbacks, authority challenges, responsibility burden',
        severity: 'High',
        duration: 'Throughout Sade Sati'
      }],
      Aquarius: [{
        type: 'Community & Innovation',
        description: 'Social changes, innovation blocks, friendship challenges',
        severity: 'Medium-High',
        duration: 'Throughout Sade Sati'
      }],
      Pisces: [{
        type: 'Spirituality & Dreams',
        description: 'Spiritual confusion, boundary issues, escapism tendencies',
        severity: 'High',
        duration: 'Throughout Sade Sati'
      }]
    };

    return effects[moonSign] || [{
      type: 'General Effects',
      description: 'Various life challenges and karmic lessons',
      severity: 'Medium',
      duration: 'Throughout Sade Sati'
    }];
  }

  /**
   * Get Moon sign specific Sade Sati remedies
   * @private
   * @param {string} moonSign - Moon sign
   * @returns {Array} Moon sign specific remedies
   */
  _getMoonSignSadeSatiRemedies(moonSign) {
    const remedies = {
      Aries: [{
        type: 'Leadership',
        description: 'Practice humility and seek wise counsel',
        urgency: 'Medium',
        category: 'Mental'
      }],
      Taurus: [{
        type: 'Financial Protection',
        description: 'Save money, avoid risky investments, practice abundance mindset',
        urgency: 'High',
        category: 'Financial'
      }],
      Gemini: [{
        type: 'Communication',
        description: 'Practice clear communication, avoid gossip, study sacred texts',
        urgency: 'Medium',
        category: 'Mental'
      }],
      Cancer: [{
        type: 'Family Harmony',
        description: 'Maintain family rituals, practice forgiveness, strengthen home bonds',
        urgency: 'High',
        category: 'Emotional'
      }],
      Leo: [{
        type: 'Creative Expression',
        description: 'Continue creative pursuits, practice self-acceptance, help others',
        urgency: 'Medium',
        category: 'Creative'
      }],
      Virgo: [{
        type: 'Health Focus',
        description: 'Regular health check-ups, yoga practice, service to others',
        urgency: 'High',
        category: 'Physical'
      }],
      Libra: [{
        type: 'Relationship Healing',
        description: 'Practice compromise, seek counseling if needed, maintain fairness',
        urgency: 'Medium',
        category: 'Emotional'
      }],
      Scorpio: [{
        type: 'Transformation Support',
        description: 'Embrace change, practice meditation, seek spiritual guidance',
        urgency: 'High',
        category: 'Spiritual'
      }],
      Sagittarius: [{
        type: 'Faith Building',
        description: 'Strengthen spiritual practices, avoid dogma, maintain optimism',
        urgency: 'Medium',
        category: 'Spiritual'
      }],
      Capricorn: [{
        type: 'Career Support',
        description: 'Network building, skill development, patience in career matters',
        urgency: 'High',
        category: 'Professional'
      }],
      Aquarius: [{
        type: 'Community Support',
        description: 'Help community causes, maintain friendships, embrace innovation',
        urgency: 'Medium',
        category: 'Social'
      }],
      Pisces: [{
        type: 'Spiritual Grounding',
        description: 'Regular meditation, avoid escapism, practice compassion',
        urgency: 'High',
        category: 'Spiritual'
      }]
    };

    return remedies[moonSign] || [{
      type: 'General',
      description: 'Maintain spiritual practices and positive attitude',
      urgency: 'Medium',
      category: 'Spiritual'
    }];
  }

  /**
   * Calculate composite chart for synastry analysis
   * @param {Object} chart1 - First person's birth chart
   * @param {Object} chart2 - Second person's birth chart
   * @returns {Object} Composite chart data
   */
  calculateCompositeChart(chart1, chart2) {
    try {
      const composite = {
        planets: {},
        houses: {},
        aspects: [],
        interpretations: {}
      };

      // Calculate midpoint positions for each planet
      const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

      planets.forEach(planet => {
        if (chart1.fullChart?.planets?.[planet] && chart2.fullChart?.planets?.[planet]) {
          const pos1 = this._getLongitude(chart1.fullChart.planets[planet]);
          const pos2 = this._getLongitude(chart2.fullChart.planets[planet]);

          // Calculate midpoint
          let midpoint = (pos1 + pos2) / 2;

          // Handle 0-360 degree wraparound
          if (Math.abs(pos1 - pos2) > 180) {
            midpoint = (midpoint + 180) % 360;
          }

          // Determine sign and position
          const signIndex = Math.floor(midpoint / 30);
          const signName = this.zodiacSigns[signIndex];
          const degreesInSign = midpoint % 30;

          composite.planets[planet] = {
            longitude: midpoint,
            signName,
            degrees: Math.floor(degreesInSign),
            minutes: Math.floor((degreesInSign % 1) * 60),
            seconds: Math.floor(((degreesInSign % 1) * 60 % 1) * 60)
          };
        }
      });

      // Calculate composite houses (simplified - using midpoint of rising signs)
      const rising1 = this._getLongitude(chart1.fullChart?.houses?.[0] || { longitude: 0 });
      const rising2 = this._getLongitude(chart2.fullChart?.houses?.[0] || { longitude: 0 });
      const compositeRising = (rising1 + rising2) / 2;

      for (let i = 0; i < 12; i++) {
        const houseLongitude = (compositeRising + i * 30) % 360;
        const signIndex = Math.floor(houseLongitude / 30);
        composite.houses[i] = {
          sign: this.zodiacSigns[signIndex],
          longitude: houseLongitude
        };
      }

      // Calculate aspects within composite chart
      composite.aspects = this._calculateCompositeAspects(composite.planets);

      // Generate interpretations
      composite.interpretations = this._interpretCompositeChart(composite);

      return composite;
    } catch (error) {
      logger.error('Error calculating composite chart:', error);
      return {
        error: 'Unable to calculate composite chart',
        planets: {},
        houses: {},
        aspects: [],
        interpretations: {}
      };
    }
  }

  /**
   * Calculate Davison relationship chart
   * @param {Object} person1 - First person's birth data
   * @param {Object} person2 - Second person's birth data
   * @returns {Object} Davison chart data
   */
  calculateDavisonChart(person1, person2) {
    try {
      // Calculate midpoint date and time
      const date1 = new Date(person1.birthDate.split('/').reverse().join('-'));
      const date2 = new Date(person2.birthDate.split('/').reverse().join('-'));

      const midpointTime = new Date((date1.getTime() + date2.getTime()) / 2);

      // Calculate midpoint location (simplified - average coordinates)
      const lat1 = person1.latitude || 28.6139; // Default Delhi
      const lon1 = person1.longitude || 77.209;
      const lat2 = person2.latitude || 28.6139;
      const lon2 = person2.longitude || 77.209;

      const midpointLat = (lat1 + lat2) / 2;
      const midpointLon = (lon1 + lon2) / 2;

      // Calculate midpoint time
      const time1 = this._parseTime(person1.birthTime || '12:00');
      const time2 = this._parseTime(person2.birthTime || '12:00');
      const midpointMinutes = Math.floor((time1 + time2) / 2);
      const midpointHour = Math.floor(midpointMinutes / 60) % 24;
      const midpointMinute = midpointMinutes % 60;

      const davisonData = {
        year: midpointTime.getFullYear(),
        month: midpointTime.getMonth() + 1,
        date: midpointTime.getDate(),
        hours: midpointHour,
        minutes: midpointMinute,
        seconds: 0,
        latitude: midpointLat,
        longitude: midpointLon,
        timezone: 5.5, // IST default
        chartType: 'sidereal'
      };

      // Generate chart using astrologer library
      const davisonChart = this.astrologer.generateNatalChartData(davisonData);

      // Add relationship-specific interpretations
      davisonChart.relationshipPurpose = this._interpretDavisonPurpose(davisonChart);

      return {
        chart: davisonChart,
        midpointDate: `${midpointTime.getDate()}/${midpointTime.getMonth() + 1}/${midpointTime.getFullYear()}`,
        midpointTime: `${midpointHour.toString().padStart(2, '0')}:${midpointMinute.toString().padStart(2, '0')}`,
        midpointLocation: `${midpointLat.toFixed(2)}, ${midpointLon.toFixed(2)}`,
        relationshipPurpose: davisonChart.relationshipPurpose
      };
    } catch (error) {
      logger.error('Error calculating Davison chart:', error);
      return {
        error: 'Unable to calculate Davison relationship chart',
        chart: null,
        relationshipPurpose: 'Chart calculation failed'
      };
    }
  }

  /**
   * Calculate synastry aspects between two charts
   * @param {Object} chart1 - First person's chart
   * @param {Object} chart2 - Second person's chart
   * @returns {Array} Synastry aspects
   */
  calculateSynastryAspects(chart1, chart2) {
    try {
      const aspects = [];
      const planets1 = chart1.fullChart?.planets || {};
      const planets2 = chart2.fullChart?.planets || {};

      const majorPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

      // Calculate aspects between all planet combinations
      majorPlanets.forEach(planet1 => {
        majorPlanets.forEach(planet2 => {
          if (planets1[planet1] && planets2[planet2]) {
            const pos1 = this._getLongitude(planets1[planet1]);
            const pos2 = this._getLongitude(planets2[planet2]);

            const aspect = this._calculateAspect(pos1, pos2);
            if (aspect) {
              aspects.push({
                planet1,
                planet2,
                aspect: aspect.type,
                orb: aspect.orb,
                interpretation: this._interpretSynastryAspect(planet1, planet2, aspect.type)
              });
            }
          }
        });
      });

      return aspects;
    } catch (error) {
      logger.error('Error calculating synastry aspects:', error);
      return [];
    }
  }

  /**
   * Calculate compatibility score based on synastry analysis
   * @param {Object} chart1 - First person's chart
   * @param {Object} chart2 - Second person's chart
   * @param {Object} compositeChart - Composite chart
   * @param {Array} synastryAspects - Synastry aspects
   * @returns {Object} Compatibility analysis
   */
  calculateCompatibilityScore(chart1, chart2, compositeChart, synastryAspects) {
    try {
      let score = 50; // Base score
      const factors = {
        strengths: [],
        challenges: [],
        romantic: 0,
        communication: 0,
        emotional: 0,
        spiritual: 0
      };

      // Analyze synastry aspects
      synastryAspects.forEach(aspect => {
        const weight = this._getAspectWeight(aspect.aspect, aspect.orb);

        switch (aspect.aspect) {
        case 'conjunction':
          score += weight * 2;
          factors.strengths.push(`Strong ${aspect.planet1}-${aspect.planet2} connection`);
          break;
        case 'trine':
          score += weight * 1.5;
          factors.strengths.push(`Harmonious ${aspect.planet1}-${aspect.planet2} flow`);
          break;
        case 'sextile':
          score += weight;
          factors.strengths.push(`Supportive ${aspect.planet1}-${aspect.planet2} energy`);
          break;
        case 'square':
          score -= weight * 1.2;
          factors.challenges.push(`${aspect.planet1}-${aspect.planet2} tension requires work`);
          break;
        case 'opposition':
          score -= weight;
          factors.challenges.push(`${aspect.planet1}-${aspect.planet2} polarity needs balance`);
          break;
        }

        // Category-specific scoring
        if (['venus', 'moon', 'sun'].includes(aspect.planet1) || ['venus', 'moon', 'sun'].includes(aspect.planet2)) {
          factors.romantic += weight;
        }
        if (['mercury'].includes(aspect.planet1) || ['mercury'].includes(aspect.planet2)) {
          factors.communication += weight;
        }
        if (['moon', 'neptune'].includes(aspect.planet1) || ['moon', 'neptune'].includes(aspect.planet2)) {
          factors.emotional += weight;
        }
        if (['jupiter', 'saturn', 'uranus'].includes(aspect.planet1) || ['jupiter', 'saturn', 'uranus'].includes(aspect.planet2)) {
          factors.spiritual += weight;
        }
      });

      // Analyze composite chart
      if (compositeChart.planets) {
        // Strong composite sun/moon conjunction is very positive
        if (compositeChart.planets.sun && compositeChart.planets.moon) {
          const sunPos = this._getLongitude(compositeChart.planets.sun);
          const moonPos = this._getLongitude(compositeChart.planets.moon);
          const angle = Math.abs(sunPos - moonPos) % 360;
          const minAngle = Math.min(angle, 360 - angle);

          if (minAngle < 10) {
            score += 15;
            factors.strengths.push('Powerful composite sun-moon conjunction indicates strong shared identity');
          }
        }
      }

      // Ensure score stays within 0-100 range
      score = Math.max(0, Math.min(100, score));

      return {
        overallScore: Math.round(score),
        categories: {
          romantic: Math.round(Math.max(0, Math.min(100, 50 + factors.romantic))),
          communication: Math.round(Math.max(0, Math.min(100, 50 + factors.communication))),
          emotional: Math.round(Math.max(0, Math.min(100, 50 + factors.emotional))),
          spiritual: Math.round(Math.max(0, Math.min(100, 50 + factors.spiritual)))
        },
        strengths: factors.strengths.slice(0, 5),
        challenges: factors.challenges.slice(0, 5),
        summary: this._generateCompatibilitySummary(score, factors)
      };
    } catch (error) {
      logger.error('Error calculating compatibility score:', error);
      return {
        overallScore: 50,
        categories: { romantic: 50, communication: 50, emotional: 50, spiritual: 50 },
        strengths: [],
        challenges: [],
        summary: 'Compatibility analysis could not be completed'
      };
    }
  }

  /**
   * Perform complete synastry analysis
   * @param {Object} person1 - First person's data
   * @param {Object} person2 - Second person's data
   * @returns {Object} Complete synastry analysis
   */
  performSynastryAnalysis(person1, person2) {
    try {
      // Generate individual charts
      const chart1 = this.generateBasicBirthChart(person1);
      const chart2 = this.generateBasicBirthChart(person2);

      // Calculate composite chart
      const compositeChart = this.calculateCompositeChart(chart1, chart2);

      // Calculate Davison chart
      const davisonChart = this.calculateDavisonChart(person1, person2);

      // Calculate synastry aspects
      const synastryAspects = this.calculateSynastryAspects(chart1, chart2);

      // Calculate compatibility
      const compatibility = this.calculateCompatibilityScore(chart1, chart2, compositeChart, synastryAspects);

      return {
        person1: {
          name: person1.name,
          chart: chart1
        },
        person2: {
          name: person2.name,
          chart: chart2
        },
        compositeChart,
        davisonChart,
        synastryAspects: synastryAspects.slice(0, 10), // Top 10 aspects
        compatibility,
        relationshipInsights: this._generateRelationshipInsights(compositeChart, davisonChart, compatibility)
      };
    } catch (error) {
      logger.error('Error performing synastry analysis:', error);
      return {
        error: 'Synastry analysis could not be completed',
        person1: { name: person1.name },
        person2: { name: person2.name }
      };
    }
  }

  // Helper methods for synastry calculations

  /**
   * Get longitude from planet data
   * @private
   */
  _getLongitude(planetData) {
    if (typeof planetData === 'number') { return planetData; }
    if (planetData.longitude) { return planetData.longitude; }

    // Calculate from degrees, minutes, seconds
    const degrees = planetData.degrees || 0;
    const minutes = planetData.minutes || 0;
    const seconds = planetData.seconds || 0;

    return degrees + minutes / 60 + seconds / 3600;
  }

  /**
   * Calculate aspects within composite chart
   * @private
   */
  _calculateCompositeAspects(planets) {
    const aspects = [];
    const planetKeys = Object.keys(planets);

    planetKeys.forEach((planet1, i) => {
      planetKeys.slice(i + 1).forEach(planet2 => {
        const pos1 = this._getLongitude(planets[planet1]);
        const pos2 = this._getLongitude(planets[planet2]);

        const aspect = this._calculateAspect(pos1, pos2);
        if (aspect) {
          aspects.push({
            planets: `${planet1}-${planet2}`,
            aspect: aspect.type,
            orb: aspect.orb
          });
        }
      });
    });

    return aspects;
  }

  /**
   * Calculate aspect between two positions
   * @private
   */
  _calculateAspect(pos1, pos2) {
    const angle = Math.abs(pos1 - pos2) % 360;
    const minAngle = Math.min(angle, 360 - angle);

    const aspects = [
      { type: 'conjunction', angle: 0, orb: 8 },
      { type: 'sextile', angle: 60, orb: 6 },
      { type: 'square', angle: 90, orb: 8 },
      { type: 'trine', angle: 120, orb: 8 },
      { type: 'opposition', angle: 180, orb: 8 }
    ];

    for (const aspect of aspects) {
      if (Math.abs(minAngle - aspect.angle) <= aspect.orb) {
        return {
          type: aspect.type,
          orb: Math.abs(minAngle - aspect.angle)
        };
      }
    }

    return null;
  }

  /**
   * Interpret composite chart
   * @private
   */
  _interpretCompositeChart(composite) {
    const interpretations = {
      relationshipNature: 'Harmonious partnership',
      sharedPurpose: 'Mutual growth and understanding',
      challenges: [],
      strengths: []
    };

    // Analyze dominant planets in composite
    if (composite.planets) {
      const strongPlanets = Object.entries(composite.planets)
        .filter(([_, data]) => data.signName)
        .slice(0, 3);

      strongPlanets.forEach(([planet, data]) => {
        interpretations.strengths.push(`${planet} in ${data.signName} brings ${this._getPlanetRelationshipQuality(planet)}`);
      });
    }

    return interpretations;
  }

  /**
   * Interpret Davison chart purpose
   * @private
   */
  _interpretDavisonPurpose(chart) {
    const sunSign = chart.interpretations?.sunSign;
    const moonSign = chart.interpretations?.moonSign;

    const purposes = {
      Aries: 'To courageously pursue shared goals and initiate new beginnings together',
      Taurus: 'To build a stable, secure foundation and enjoy sensual pleasures together',
      Gemini: 'To communicate openly, learn together, and maintain intellectual stimulation',
      Cancer: 'To create emotional security, nurture each other, and build a home',
      Leo: 'To express creativity, support each other\'s talents, and enjoy life fully',
      Virgo: 'To serve each other, improve together, and create practical harmony',
      Libra: 'To maintain balance, appreciate beauty, and foster equality in partnership',
      Scorpio: 'To transform together, build deep intimacy, and face challenges courageously',
      Sagittarius: 'To explore life\'s meaning, expand horizons, and maintain optimism',
      Capricorn: 'To build lasting structure, achieve goals, and provide security',
      Aquarius: 'To innovate together, maintain independence, and benefit humanity',
      Pisces: 'To connect spiritually, show compassion, and heal each other'
    };

    return purposes[sunSign] || 'To grow together through mutual understanding and support';
  }

  /**
   * Interpret synastry aspect
   * @private
   */
  _interpretSynastryAspect(planet1, planet2, aspect) {
    const interpretations = {
      'sun-moon': {
        conjunction: 'Deep emotional and identity fusion',
        trine: 'Natural emotional understanding',
        square: 'Identity vs emotional needs tension',
        opposition: 'Balancing individual and emotional needs'
      },
      'venus-mars': {
        conjunction: 'Intense romantic and sexual attraction',
        trine: 'Harmonious love and passion',
        square: 'Love vs desire conflicts',
        opposition: 'Magnetic attraction with challenges'
      },
      'mercury-mercury': {
        conjunction: 'Mental synchronization',
        trine: 'Easy communication flow',
        square: 'Communication misunderstandings',
        opposition: 'Different thinking styles'
      }
    };

    const key = `${planet1}-${planet2}`;
    const reverseKey = `${planet2}-${planet1}`;

    return interpretations[key]?.[aspect] ||
           interpretations[reverseKey]?.[aspect] ||
           `${aspect} aspect creates ${aspect} energy between ${planet1} and ${planet2}`;
  }

  /**
   * Get aspect weight for scoring
   * @private
   */
  _getAspectWeight(aspect, orb) {
    const baseWeights = {
      conjunction: 15,
      trine: 10,
      sextile: 7,
      square: -8,
      opposition: -10
    };

    const baseWeight = baseWeights[aspect] || 0;
    // Reduce weight for wider orbs
    const orbPenalty = orb / 2;
    return Math.max(1, baseWeight - orbPenalty);
  }

  /**
   * Get planet relationship quality
   * @private
   */
  _getPlanetRelationshipQuality(planet) {
    const qualities = {
      sun: 'shared identity and purpose',
      moon: 'emotional security and nurturing',
      mercury: 'clear communication and understanding',
      venus: 'love, harmony, and shared values',
      mars: 'passion, action, and drive',
      jupiter: 'growth, optimism, and expansion',
      saturn: 'stability, commitment, and structure'
    };

    return qualities[planet] || 'unique relationship dynamics';
  }

  /**
   * Parse time string to minutes
   * @private
   */
  _parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Generate compatibility summary
   * @private
   */
  _generateCompatibilitySummary(score, factors) {
    if (score >= 80) {
      return 'Excellent compatibility with strong potential for harmonious partnership';
    } else if (score >= 65) {
      return 'Good compatibility with some areas requiring attention and growth';
    } else if (score >= 50) {
      return 'Moderate compatibility requiring conscious effort and understanding';
    } else {
      return 'Challenging compatibility requiring significant work and compromise';
    }
  }

  /**
   * Generate relationship insights
   * @private
   */
  _generateRelationshipInsights(composite, davison, compatibility) {
    const insights = [];

    // Composite insights
    if (composite.interpretations?.relationshipNature) {
      insights.push({
        type: 'composite',
        insight: composite.interpretations.relationshipNature,
        significance: 'Overall relationship energy and dynamics'
      });
    }

    // Davison insights
    if (davison.relationshipPurpose) {
      insights.push({
        type: 'davison',
        insight: davison.relationshipPurpose,
        significance: 'Long-term relationship purpose and destiny'
      });
    }

    // Compatibility insights
    if (compatibility.overallScore >= 70) {
      insights.push({
        type: 'compatibility',
        insight: 'Strong natural harmony supports relationship success',
        significance: 'Positive foundation for partnership'
      });
    } else if (compatibility.overallScore >= 50) {
      insights.push({
        type: 'compatibility',
        insight: 'Relationship requires conscious effort and communication',
        significance: 'Growth opportunities through challenges'
      });
    } else {
      insights.push({
        type: 'compatibility',
        insight: 'Significant challenges require deep commitment and understanding',
        significance: 'Transformation potential through difficulties'
      });
    }

    return insights;
  }

  /**
   * Calculate Lunar Return - when Moon returns to natal position
   * @param {Object} birthData - Birth data object
   * @param {Date} targetDate - Date to calculate return for (optional, defaults to next return)
   * @returns {Object} Lunar return analysis
   */
  async calculateLunarReturn(birthData, targetDate = null) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      // Get natal moon position
      const natalChart = await this.generateBasicBirthChart({ ...birthData, name: 'Lunar Return User' });
      const natalMoonPosition = natalChart.fullChart?.planets?.moon?.position?.longitude;

      if (!natalMoonPosition && natalMoonPosition !== 0) {
        return { error: 'Unable to calculate natal Moon position' };
      }

      // Calculate next lunar return
      const returnDate = targetDate || this._findNextLunarReturn(birthDate, birthTime, birthPlace, natalMoonPosition);

      // Generate lunar return chart
      const lunarReturnChart = this._generateLunarReturnChart(birthData, returnDate);

      // Analyze the lunar return
      const analysis = this._analyzeLunarReturnChart(lunarReturnChart, natalChart);

      return {
        returnDate: returnDate.toISOString(),
        formattedDate: returnDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        lunarReturnChart,
        analysis,
        monthlyThemes: this._extractMonthlyThemes(analysis),
        emotionalCycle: this._analyzeEmotionalCycle(analysis),
        recommendations: this._generateLunarReturnRecommendations(analysis)
      };
    } catch (error) {
      logger.error('Error calculating lunar return:', error);
      return { error: 'Unable to calculate lunar return' };
    }
  }

  /**
   * Find the next lunar return date
   * @private
   */
  _findNextLunarReturn(birthDate, birthTime, birthPlace, natalMoonPosition) {
    try {
      // Parse birth date
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);

      // Get coordinates
      const [latitude, longitude] = this._getCoordinatesForPlace(birthPlace);
      const timestamp = birthDateTime.getTime();
      const timezone = this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Start from current date
      const currentDate = new Date();
      currentDate.setHours(hour, minute, 0, 0); // Set to birth time

      // Search for lunar return (Moon takes ~27.3 days to orbit)
      for (let i = 0; i < 35; i++) { // Search up to 35 days ahead
        const testDate = new Date(currentDate.getTime() + i * 24 * 60 * 60 * 1000);

        // Calculate moon position for this date
        const testTimestamp = testDate.getTime();
        const testTimezone = this._getTimezoneForPlace(latitude, longitude, testTimestamp);

        const astroData = {
          year: testDate.getFullYear(),
          month: testDate.getMonth() + 1,
          date: testDate.getDate(),
          hours: testDate.getHours(),
          minutes: testDate.getMinutes(),
          seconds: 0,
          latitude,
          longitude,
          timezone: testTimezone,
          chartType: 'sidereal'
        };

        const testChart = this.astrologer.generateNatalChartData(astroData);
        const testMoonPosition = testChart.planets?.moon?.position?.longitude;

        if (testMoonPosition !== undefined) {
          // Check if moon is within 2 degrees of natal position
          const angleDiff = Math.abs(testMoonPosition - natalMoonPosition);
          const minDiff = Math.min(angleDiff, 360 - angleDiff);

          if (minDiff <= 2) { // Within 2 degrees orb
            return testDate;
          }
        }
      }

      // Fallback: approximate based on lunar cycle
      const lunarCycle = 27.3; // days
      const daysSinceBirth = (currentDate - birthDateTime) / (1000 * 60 * 60 * 24);
      const cyclesCompleted = Math.floor(daysSinceBirth / lunarCycle);
      const nextReturnDays = (cyclesCompleted + 1) * lunarCycle - daysSinceBirth;

      return new Date(currentDate.getTime() + nextReturnDays * 24 * 60 * 60 * 1000);
    } catch (error) {
      logger.error('Error finding next lunar return:', error);
      // Fallback to approximately 27 days from now
      return new Date(Date.now() + 27 * 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Generate lunar return chart
   * @private
   */
  _generateLunarReturnChart(birthData, returnDate) {
    try {
      const { birthPlace } = birthData;

      // Get coordinates for birth place
      const [latitude, longitude] = this._getCoordinatesForPlace(birthPlace);
      const timestamp = returnDate.getTime();
      const timezone = this._getTimezoneForPlace(latitude, longitude, timestamp);

      const astroData = {
        year: returnDate.getFullYear(),
        month: returnDate.getMonth() + 1,
        date: returnDate.getDate(),
        hours: returnDate.getHours(),
        minutes: returnDate.getMinutes(),
        seconds: 0,
        latitude,
        longitude,
        timezone,
        chartType: 'sidereal'
      };

      return this.astrologer.generateNatalChartData(astroData);
    } catch (error) {
      logger.error('Error generating lunar return chart:', error);
      return null;
    }
  }

  /**
   * Analyze lunar return chart
   * @private
   */
  _analyzeLunarReturnChart(lunarReturnChart, natalChart) {
    try {
      const analysis = {
        dominantThemes: [],
        emotionalFocus: '',
        lifeAreas: [],
        planetaryInfluences: {},
        houseEmphasis: {},
        aspects: []
      };

      if (!lunarReturnChart) { return analysis; }

      // Analyze dominant planets in lunar return
      const planets = lunarReturnChart.planets || {};
      const planetStrengths = {};

      Object.entries(planets).forEach(([planet, data]) => {
        if (data.signName) {
          planetStrengths[planet] = this._getLunarReturnPlanetStrength(planet, data.signName);
        }
      });

      // Sort by strength
      const sortedPlanets = Object.entries(planetStrengths)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      analysis.dominantThemes = sortedPlanets.map(([planet]) =>
        this._getLunarReturnTheme(planet, planets[planet]?.signName)
      );

      // Analyze houses for life areas
      const houses = lunarReturnChart.houses || {};
      const housePlanets = {};

      Object.entries(planets).forEach(([planet, data]) => {
        if (data.longitude) {
          // Find which house the planet is in
          for (let i = 0; i < 12; i++) {
            const nextHouse = houses[(i + 1) % 12];
            const currentHouse = houses[i];

            if (currentHouse && nextHouse) {
              const currentLon = this._getLongitude(currentHouse);
              let nextLon = this._getLongitude(nextHouse);

              if (nextLon < currentLon) { nextLon += 360; } // Handle 0/360 boundary

              if (data.longitude >= currentLon && data.longitude < nextLon) {
                if (!housePlanets[i + 1]) { housePlanets[i + 1] = []; }
                housePlanets[i + 1].push(planet);
                break;
              }
            }
          }
        }
      });

      // Identify emphasized houses
      Object.entries(housePlanets).forEach(([house, planetsInHouse]) => {
        if (planetsInHouse.length > 0) {
          analysis.houseEmphasis[house] = {
            planets: planetsInHouse,
            significance: this._getHouseSignificance(parseInt(house))
          };
        }
      });

      // Analyze aspects in lunar return chart
      analysis.aspects = this._calculateLunarReturnAspects(planets);

      // Determine emotional focus
      analysis.emotionalFocus = this._determineEmotionalFocus(planets.moon, natalChart);

      return analysis;
    } catch (error) {
      logger.error('Error analyzing lunar return chart:', error);
      return { dominantThemes: [], emotionalFocus: '', lifeAreas: [] };
    }
  }

  /**
   * Get lunar return planet strength
   * @private
   */
  _getLunarReturnPlanetStrength(planet, sign) {
    const signStrengths = {
      Aries: { mars: 10, sun: 8, jupiter: 6 },
      Taurus: { venus: 10, moon: 8, saturn: 6 },
      Gemini: { mercury: 10, venus: 6, uranus: 8 },
      Cancer: { moon: 10, jupiter: 6, neptune: 8 },
      Leo: { sun: 10, mars: 6, jupiter: 8 },
      Virgo: { mercury: 10, saturn: 6, venus: 8 },
      Libra: { venus: 10, saturn: 6, uranus: 8 },
      Scorpio: { mars: 10, pluto: 8, neptune: 6 },
      Sagittarius: { jupiter: 10, sun: 6, mars: 8 },
      Capricorn: { saturn: 10, mars: 6, venus: 8 },
      Aquarius: { uranus: 10, saturn: 6, mercury: 8 },
      Pisces: { neptune: 10, venus: 6, jupiter: 8 }
    };

    return signStrengths[sign]?.[planet] || 5;
  }

  /**
   * Get lunar return theme
   * @private
   */
  _getLunarReturnTheme(planet, sign) {
    const themes = {
      sun: `Identity and self-expression in ${sign}`,
      moon: `Emotions and inner life in ${sign}`,
      mercury: `Communication and learning in ${sign}`,
      venus: `Relationships and values in ${sign}`,
      mars: `Action and energy in ${sign}`,
      jupiter: `Growth and expansion in ${sign}`,
      saturn: `Responsibility and structure in ${sign}`,
      uranus: `Innovation and change in ${sign}`,
      neptune: `Spirituality and imagination in ${sign}`,
      pluto: `Transformation and power in ${sign}`
    };

    return themes[planet] || `${planet} themes in ${sign}`;
  }

  /**
   * Get house significance
   * @private
   */
  _getHouseSignificance(house) {
    const significances = {
      1: 'Personal identity and self-presentation',
      2: 'Finances and material resources',
      3: 'Communication and local environment',
      4: 'Home and family life',
      5: 'Creativity and children',
      6: 'Health and daily routines',
      7: 'Partnerships and relationships',
      8: 'Transformation and shared resources',
      9: 'Higher learning and travel',
      10: 'Career and public life',
      11: 'Friends and community',
      12: 'Spirituality and subconscious'
    };

    return significances[house] || 'General life area';
  }

  /**
   * Calculate lunar return aspects
   * @private
   */
  _calculateLunarReturnAspects(planets) {
    const aspects = [];
    const majorPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

    majorPlanets.forEach((planet1, i) => {
      majorPlanets.slice(i + 1).forEach(planet2 => {
        const pos1 = this._getLongitude(planets[planet1]);
        const pos2 = this._getLongitude(planets[planet2]);

        if (pos1 && pos2) {
          const aspect = this._calculateAspect(pos1, pos2);
          if (aspect) {
            aspects.push({
              planets: `${planet1}-${planet2}`,
              aspect: aspect.type,
              orb: aspect.orb
            });
          }
        }
      });
    });

    return aspects.slice(0, 5); // Return top 5 aspects
  }

  /**
   * Determine emotional focus
   * @private
   */
  _determineEmotionalFocus(lunarMoon, natalChart) {
    if (!lunarMoon || !natalChart) { return 'General emotional themes'; }

    const lunarSign = lunarMoon.signName;
    const natalMoonSign = natalChart.moonSign;

    const emotionalFocus = {
      Aries: 'Bold emotional expression and independence',
      Taurus: 'Emotional security and sensual comfort',
      Gemini: 'Emotional communication and mental processing',
      Cancer: 'Deep emotional nurturing and family connections',
      Leo: 'Emotional creativity and self-expression',
      Virgo: 'Emotional analysis and practical care',
      Libra: 'Emotional harmony and relationship focus',
      Scorpio: 'Intense emotional transformation',
      Sagittarius: 'Emotional exploration and optimism',
      Capricorn: 'Emotional responsibility and structure',
      Aquarius: 'Emotional innovation and detachment',
      Pisces: 'Emotional intuition and compassion'
    };

    return emotionalFocus[lunarSign] || 'Balanced emotional energy';
  }

  /**
   * Extract monthly themes
   * @private
   */
  _extractMonthlyThemes(analysis) {
    const themes = [];

    // Add dominant themes
    themes.push(...analysis.dominantThemes);

    // Add house emphasis themes
    Object.entries(analysis.houseEmphasis).forEach(([house, data]) => {
      themes.push(`${data.significance} with ${data.planets.join(', ')} influence`);
    });

    return themes.slice(0, 5);
  }

  /**
   * Analyze emotional cycle
   * @private
   */
  _analyzeEmotionalCycle(analysis) {
    const emotionalThemes = {
      water: 'Deep emotional processing and intuition',
      fire: 'Passionate emotional expression and energy',
      earth: 'Practical emotional stability and security',
      air: 'Intellectual emotional processing and communication'
    };

    // Determine dominant element in lunar return
    const elements = { fire: 0, earth: 0, air: 0, water: 0 };
    const elementSigns = {
      fire: ['Aries', 'Leo', 'Sagittarius'],
      earth: ['Taurus', 'Virgo', 'Capricorn'],
      air: ['Gemini', 'Libra', 'Aquarius'],
      water: ['Cancer', 'Scorpio', 'Pisces']
    };

    Object.values(analysis.houseEmphasis || {}).forEach(data => {
      data.planets.forEach(planet => {
        const planetData = analysis.planetaryInfluences?.[planet];
        if (planetData?.signName) {
          Object.entries(elementSigns).forEach(([element, signs]) => {
            if (signs.includes(planetData.signName)) {
              elements[element]++;
            }
          });
        }
      });
    });

    const dominantElement = Object.entries(elements)
      .sort(([, a], [, b]) => b - a)[0][0];

    return emotionalThemes[dominantElement] || 'Balanced emotional energy';
  }

  /**
   * Generate lunar return recommendations
   * @private
   */
  _generateLunarReturnRecommendations(analysis) {
    const recommendations = [];

    // Based on dominant themes
    analysis.dominantThemes.forEach(theme => {
      if (theme.includes('Identity')) {
        recommendations.push('Focus on personal goals and self-expression');
      } else if (theme.includes('Emotions')) {
        recommendations.push('Pay attention to emotional needs and relationships');
      } else if (theme.includes('Communication')) {
        recommendations.push('Express thoughts clearly and listen actively');
      } else if (theme.includes('Relationships')) {
        recommendations.push('Nurture important connections and partnerships');
      } else if (theme.includes('Action')) {
        recommendations.push('Take initiative on important projects');
      }
    });

    // Based on house emphasis
    Object.entries(analysis.houseEmphasis).forEach(([house, data]) => {
      const houseNum = parseInt(house);
      if (houseNum === 2) {
        recommendations.push('Review finances and material resources');
      } else if (houseNum === 6) {
        recommendations.push('Focus on health and daily routines');
      } else if (houseNum === 7) {
        recommendations.push('Strengthen partnership connections');
      } else if (houseNum === 10) {
        recommendations.push('Advance career and public goals');
      }
    });

    return recommendations.slice(0, 4);
  }

  /**
   * Calculate Varshaphal (Annual Predictions) - Vedic solar return analysis
   * @param {Object} birthData - Birth data object
   * @param {number} targetYear - Year for prediction (defaults to next year)
   * @returns {Object} Varshaphal analysis
   */
  async calculateVarshaphal(birthData, targetYear = null) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return { error: 'Complete birth details required for Varshaphal analysis' };
      }

      // Parse birth date
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Determine target year (next solar return)
      const currentYear = new Date().getFullYear();
      const predictionYear = targetYear || currentYear + 1;

      // Calculate solar return date (when Sun returns to birth position)
      const solarReturnDate = await this._calculateSolarReturn(birthData, predictionYear);

      // Generate Varshaphal chart for the solar return moment
      const varshaphalChart = await this._generateVarshaphalChart(birthData, solarReturnDate);

      // Analyze the Varshaphal chart
      const analysis = this._analyzeVarshaphalChart(varshaphalChart, birthData);

      // Generate predictions based on Varshaphal
      const predictions = this._generateVarshaphalPredictions(varshaphalChart, analysis, predictionYear);

      return {
        predictionYear,
        solarReturnDate: solarReturnDate.toLocaleDateString(),
        varshaphalChart,
        analysis,
        predictions,
        summary: this._generateVarshaphalSummary(predictions, analysis)
      };
    } catch (error) {
      logger.error('Error calculating Varshaphal:', error);
      return { error: 'Unable to calculate Varshaphal at this time' };
    }
  }

  /**
   * Calculate solar return date
   * @private
   * @param {Object} birthData - Birth data
   * @param {number} targetYear - Target year
   * @returns {Date} Solar return date
   */
  async _calculateSolarReturn(birthData, targetYear) {
    const { birthDate, birthTime, birthPlace } = birthData;

    // Parse birth date
    const [day, month, year] = birthDate.split('/').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);

    // Get birth Sun longitude
    const birthJD = this._dateToJulianDay(year, month, day, hour + minute / 60);
    const birthSunPos = sweph.calc(birthJD, 0, 2);
    const birthSunLongitude = birthSunPos.longitude ? birthSunPos.longitude[0] : 0;

    // Find when Sun returns to this position in target year
    const startJD = this._dateToJulianDay(targetYear, 1, 1, 12); // January 1st of target year
    let solarReturnJD = startJD;
    let iterations = 0;
    const maxIterations = 365; // Max search within the year

    while (iterations < maxIterations) {
      const sunPos = sweph.calc(solarReturnJD, 0, 2);
      const currentSunLong = sunPos.longitude ? sunPos.longitude[0] : 0;

      const diff = this._normalizeAngle(currentSunLong - birthSunLongitude);
      if (Math.abs(diff) < 1) { // Within 1 degree
        break;
      }

      // Move forward by 1 day
      solarReturnJD += 1;
      iterations++;
    }

    return this._jdToDate(solarReturnJD);
  }

  /**
   * Generate Varshaphal chart
   * @private
   * @param {Object} birthData - Birth data
   * @param {Date} solarReturnDate - Solar return date
   * @returns {Object} Varshaphal chart
   */
  async _generateVarshaphalChart(birthData, solarReturnDate) {
    try {
      const { birthPlace } = birthData;

      // Get coordinates
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const timestamp = solarReturnDate.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Generate chart for solar return moment
      const astroData = {
        year: solarReturnDate.getFullYear(),
        month: solarReturnDate.getMonth() + 1,
        date: solarReturnDate.getDate(),
        hours: solarReturnDate.getHours(),
        minutes: solarReturnDate.getMinutes(),
        seconds: 0,
        latitude,
        longitude,
        timezone,
        chartType: 'sidereal'
      };

      const chart = this.astrologer.generateNatalChartData(astroData);

      return {
        lagna: chart.interpretations.risingSign,
        planets: chart.planets,
        houses: chart.houses || {},
        rawChart: chart
      };
    } catch (error) {
      logger.error('Error generating Varshaphal chart:', error);
      return {
        lagna: 'Unknown',
        planets: {},
        houses: {}
      };
    }
  }

  /**
   * Analyze Varshaphal chart
   * @private
   * @param {Object} varshaphalChart - Varshaphal chart
   * @param {Object} birthData - Birth data
   * @returns {Object} Analysis results
   */
  _analyzeVarshaphalChart(varshaphalChart, birthData) {
    const analysis = {
      keyThemes: [],
      favorablePeriods: [],
      challengingPeriods: [],
      planetaryStrengths: {},
      houseActivations: []
    };

    // Analyze Lagna lord and its position
    const lagnaSign = this._getSignFromLongitude(varshaphalChart.lagna);
    const lagnaLord = this._getSignLord(lagnaSign);

    if (varshaphalChart.planets[lagnaLord]) {
      const lordHouse = varshaphalChart.planets[lagnaLord].house;
      analysis.keyThemes.push(`Lagna lord in ${this._getHouseArea(lordHouse)} - Focus on ${this._getHouseArea(lordHouse)} matters`);
    }

    // Analyze Sun's position (annual vitality and authority)
    if (varshaphalChart.planets.sun) {
      const sunHouse = varshaphalChart.planets.sun.house;
      analysis.keyThemes.push(`Sun in ${this._getHouseArea(sunHouse)} - Annual themes revolve around ${this._getHouseArea(sunHouse)}`);

      // Sun in different houses indicates annual focus
      if (sunHouse === 1) { analysis.keyThemes.push('Year of personal growth and self-discovery'); }
      if (sunHouse === 2) { analysis.keyThemes.push('Year of financial planning and family matters'); }
      if (sunHouse === 3) { analysis.keyThemes.push('Year of communication and skill development'); }
      if (sunHouse === 4) { analysis.keyThemes.push('Year of home, property, and emotional foundation'); }
      if (sunHouse === 5) { analysis.keyThemes.push('Year of creativity, children, and self-expression'); }
      if (sunHouse === 6) { analysis.keyThemes.push('Year of service, health, and overcoming obstacles'); }
      if (sunHouse === 7) { analysis.keyThemes.push('Year of relationships and partnerships'); }
      if (sunHouse === 8) { analysis.keyThemes.push('Year of transformation and deep change'); }
      if (sunHouse === 9) { analysis.keyThemes.push('Year of wisdom, travel, and higher learning'); }
      if (sunHouse === 10) { analysis.keyThemes.push('Year of career advancement and public recognition'); }
      if (sunHouse === 11) { analysis.keyThemes.push('Year of gains, friendships, and goal achievement'); }
      if (sunHouse === 12) { analysis.keyThemes.push('Year of spiritual growth and letting go'); }
    }

    // Analyze Moon's position (emotional climate)
    if (varshaphalChart.planets.moon) {
      const moonHouse = varshaphalChart.planets.moon.house;
      analysis.keyThemes.push(`Moon in ${this._getHouseArea(moonHouse)} - Emotional focus on ${this._getHouseArea(moonHouse)}`);
    }

    // Analyze Jupiter's position (fortune and expansion)
    if (varshaphalChart.planets.jupiter) {
      const jupiterHouse = varshaphalChart.planets.jupiter.house;
      analysis.favorablePeriods.push(`Jupiter in ${this._getHouseArea(jupiterHouse)} brings expansion and good fortune`);
    }

    // Analyze Saturn's position (challenges and lessons)
    if (varshaphalChart.planets.saturn) {
      const saturnHouse = varshaphalChart.planets.saturn.house;
      analysis.challengingPeriods.push(`Saturn in ${this._getHouseArea(saturnHouse)} indicates lessons and responsibilities`);
    }

    // Analyze Mars position (energy and action)
    if (varshaphalChart.planets.mars) {
      const marsHouse = varshaphalChart.planets.mars.house;
      analysis.keyThemes.push(`Mars in ${this._getHouseArea(marsHouse)} - Energy directed toward ${this._getHouseArea(marsHouse)}`);
    }

    return analysis;
  }

  /**
   * Generate Varshaphal predictions
   * @private
   * @param {Object} varshaphalChart - Varshaphal chart
   * @param {Object} analysis - Analysis results
   * @param {number} predictionYear - Year being predicted
   * @returns {Object} Predictions for different life areas
   */
  _generateVarshaphalPredictions(varshaphalChart, analysis, predictionYear) {
    const predictions = {
      overall: '',
      career: '',
      finance: '',
      relationships: '',
      health: '',
      spiritual: '',
      monthlyBreakdown: []
    };

    // Overall assessment based on key planetary positions
    let overallScore = 5; // Neutral starting point

    // Boost score for beneficial planets in good houses
    if (varshaphalChart.planets.jupiter && [1, 2, 5, 9, 10, 11].includes(varshaphalChart.planets.jupiter.house)) {
      overallScore += 2;
    }
    if (varshaphalChart.planets.venus && [1, 2, 4, 5, 7, 9, 11].includes(varshaphalChart.planets.venus.house)) {
      overallScore += 1;
    }

    // Reduce score for challenging planets in difficult houses
    if (varshaphalChart.planets.saturn && [1, 2, 4, 7, 8, 12].includes(varshaphalChart.planets.saturn.house)) {
      overallScore -= 1;
    }
    if (varshaphalChart.planets.mars && [2, 6, 8, 12].includes(varshaphalChart.planets.mars.house)) {
      overallScore -= 1;
    }

    // Generate overall prediction
    if (overallScore >= 7) {
      predictions.overall = `🌟 *${predictionYear}* promises to be an exceptionally favorable year with abundant opportunities for growth, success, and fulfillment.`;
    } else if (overallScore >= 5) {
      predictions.overall = `✨ *${predictionYear}* will be a generally positive year with a mix of opportunities and challenges that lead to personal development.`;
    } else if (overallScore >= 3) {
      predictions.overall = `⚖️ *${predictionYear}* brings important life lessons and challenges that will ultimately lead to greater wisdom and strength.`;
    } else {
      predictions.overall = `🌊 *${predictionYear}* may present significant challenges, but these will be opportunities for deep transformation and spiritual growth.`;
    }

    // Career predictions based on 10th house and Sun/Mars/Jupiter positions
    const tenthHousePlanets = Object.entries(varshaphalChart.planets).filter(([planet, data]) => data.house === 10);
    if (tenthHousePlanets.length > 0) {
      predictions.career = `Professional growth is highlighted. ${tenthHousePlanets.map(([p, d]) => p).join(', ')} activation suggests `;
      if (tenthHousePlanets.some(([p]) => ['sun', 'jupiter'].includes(p))) {
        predictions.career += 'advancement, recognition, and leadership opportunities.';
      } else if (tenthHousePlanets.some(([p]) => p === 'saturn')) {
        predictions.career += 'steady progress through hard work and responsibility.';
      } else {
        predictions.career += 'active changes and new directions in your career path.';
      }
    } else {
      predictions.career = 'Career matters proceed steadily with opportunities for skill development and networking.';
    }

    // Finance predictions based on 2nd and 11th houses
    const wealthHouses = [2, 11];
    const wealthPlanets = Object.entries(varshaphalChart.planets).filter(([planet, data]) =>
      wealthHouses.includes(data.house)
    );

    if (wealthPlanets.length > 0) {
      predictions.finance = 'Financial matters show ';
      if (wealthPlanets.some(([p]) => ['jupiter', 'venus'].includes(p))) {
        predictions.finance += 'positive developments with potential for increased income and stability.';
      } else if (wealthPlanets.some(([p]) => p === 'saturn')) {
        predictions.finance += 'a need for careful planning and conservative approaches to money matters.';
      } else {
        predictions.finance += 'active changes requiring attention to financial opportunities and challenges.';
      }
    } else {
      predictions.finance = 'Financial situation remains stable with opportunities for prudent investments and savings.';
    }

    // Relationship predictions based on 7th house and Venus position
    if (varshaphalChart.planets.venus && varshaphalChart.planets.venus.house === 7) {
      predictions.relationships = 'Romantic and partnership matters are particularly highlighted with potential for meaningful connections.';
    } else if (varshaphalChart.planets.venus && [5, 9, 11].includes(varshaphalChart.planets.venus.house)) {
      predictions.relationships = 'Social and romantic opportunities abound, bringing joy and harmonious connections.';
    } else {
      predictions.relationships = 'Relationships develop steadily with focus on building deeper emotional bonds.';
    }

    // Health predictions based on 6th house and Mars/Saturn positions
    const healthPlanets = Object.entries(varshaphalChart.planets).filter(([planet, data]) =>
      data.house === 6 || (['mars', 'saturn'].includes(planet) && [1, 8].includes(data.house))
    );

    if (healthPlanets.length > 0) {
      predictions.health = 'Pay special attention to health and well-being. ';
      if (healthPlanets.some(([p]) => p === 'mars')) {
        predictions.health += 'Physical energy is high but may need proper channeling to avoid stress.';
      } else if (healthPlanets.some(([p]) => p === 'saturn')) {
        predictions.health += 'Focus on preventive care and building long-term health habits.';
      } else {
        predictions.health += 'Maintain balance through diet, exercise, and stress management.';
      }
    } else {
      predictions.health = 'Health remains generally good with vitality supporting your activities.';
    }

    // Spiritual predictions based on 9th and 12th houses
    const spiritualHouses = [9, 12];
    const spiritualPlanets = Object.entries(varshaphalChart.planets).filter(([planet, data]) =>
      spiritualHouses.includes(data.house) || ['jupiter', 'saturn'].includes(planet)
    );

    if (spiritualPlanets.length > 0) {
      predictions.spiritual = 'Spiritual growth and inner wisdom are highlighted. ';
      if (spiritualPlanets.some(([p]) => p === 'jupiter')) {
        predictions.spiritual += 'Seek wisdom through study, travel, or philosophical pursuits.';
      } else if (spiritualPlanets.some(([p]) => p === 'saturn')) {
        predictions.spiritual += 'Deep contemplation and meditation will bring valuable insights.';
      } else {
        predictions.spiritual += 'Trust your intuition and explore meaningful spiritual practices.';
      }
    } else {
      predictions.spiritual = 'Inner peace and spiritual understanding develop gradually through life experiences.';
    }

    // Generate monthly breakdown
    predictions.monthlyBreakdown = this._generateMonthlyVarshaphalBreakdown(varshaphalChart, predictionYear);

    return predictions;
  }

  /**
   * Generate monthly breakdown for Varshaphal
   * @private
   * @param {Object} varshaphalChart - Varshaphal chart
   * @param {number} year - Prediction year
   * @returns {Array} Monthly predictions
   */
  _generateMonthlyVarshaphalBreakdown(varshaphalChart, year) {
    const monthlyBreakdown = [];

    for (let month = 1; month <= 12; month++) {
      const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });

      // Simple monthly prediction based on house activation
      const houseActivation = ((month - 1 + varshaphalChart.lagna) % 12) + 1;
      const houseArea = this._getHouseArea(houseActivation);

      let prediction = '';
      if ([1, 5, 9].includes(houseActivation)) {
        prediction = `Favorable period for ${houseArea} with opportunities for growth and success.`;
      } else if ([6, 8, 12].includes(houseActivation)) {
        prediction = `Focus on ${houseArea} matters requiring patience and careful attention.`;
      } else {
        prediction = `Steady progress in ${houseArea} with potential for positive developments.`;
      }

      monthlyBreakdown.push({
        month: monthName,
        focus: houseArea,
        prediction
      });
    }

    return monthlyBreakdown;
  }

  /**
   * Generate Varshaphal summary
   * @private
   * @param {Object} predictions - Predictions
   * @param {Object} analysis - Analysis
   * @returns {string} Summary text
   */
  _generateVarshaphalSummary(predictions, analysis) {
    let summary = `📅 *Varshaphal (Annual Predictions)*\n\n${predictions.overall}\n\n`;

    summary += '*Key Annual Themes:*\n';
    analysis.keyThemes.slice(0, 3).forEach(theme => {
      summary += `• ${theme}\n`;
    });

    summary += '\n*Career & Finance:*\n';
    summary += `• ${predictions.career}\n`;
    summary += `• ${predictions.finance}\n`;

    summary += '\n*Relationships & Health:*\n';
    summary += `• ${predictions.relationships}\n`;
    summary += `• ${predictions.health}\n`;

    summary += '\n*Spiritual Growth:*\n';
    summary += `• ${predictions.spiritual}\n`;

    if (analysis.favorablePeriods.length > 0) {
      summary += '\n*Favorable Periods:*\n';
      analysis.favorablePeriods.slice(0, 2).forEach(period => {
        summary += `• ${period}\n`;
      });
    }

    if (analysis.challengingPeriods.length > 0) {
      summary += '\n*Growth Opportunities:*\n';
      analysis.challengingPeriods.slice(0, 2).forEach(period => {
        summary += `• ${period}\n`;
      });
    }

    return summary;
  }

  /**
   * Get house area description
   * @private
   * @param {number} house - House number (1-12)
   * @returns {string} House area description
   */
  _getHouseArea(house) {
    const houseAreas = {
      1: 'self, personality, and physical appearance',
      2: 'wealth, family, and speech',
      3: 'siblings, communication, and short journeys',
      4: 'home, mother, emotions, and property',
      5: 'children, education, creativity, and intelligence',
      6: 'health, service, enemies, and obstacles',
      7: 'marriage, partnerships, and business',
      8: 'longevity, secrets, occult, and transformation',
      9: 'fortune, father, spirituality, and higher learning',
      10: 'career, reputation, authority, and public image',
      11: 'gains, friends, hopes, and wishes',
      12: 'expenses, foreign lands, spirituality, and losses'
    };
    return houseAreas[house] || 'life matters';
  }

  /**
   * Get sign from longitude
   * @private
   * @param {number} longitude - Longitude in degrees
   * @returns {number} Sign number (1-12)
   */
  _getSignFromLongitude(longitude) {
    return Math.floor(longitude / 30) + 1;
  }

  /**
   * Enhanced Planetary Position Calculation with Maximum Precision
   *
   * Calculates highly accurate planetary positions using Swiss Ephemeris with support for
   * multiple coordinate systems, ayanamsas, and precision options. This method provides
   * the foundation for advanced astrological calculations.
   *
   * @param {number} jd - Julian Day number for the calculation date/time
   * @param {string} planet - Planet name ('sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'meanNode', 'trueNode', 'meanApogee', 'oscuApogee', 'chiron')
   * @param {Object} options - Calculation configuration options
   * @param {string} options.coordinateSystem - Coordinate system: 'geocentric' (default), 'heliocentric', 'topocentric'
   * @param {string} options.ayanamsa - Ayanamsa system: 'lahiri' (default), 'raman', 'krishnamurti', 'fagan'
   * @param {boolean} options.includeSpeed - Include planetary speed data (default: true)
   * @param {boolean} options.includeXYZ - Include 3D coordinates (default: false)
   * @param {boolean} options.highPrecision - Use high precision calculation flags (default: true)
   *
   * @returns {Object} Precise planetary position data
   * @property {string} planet - Planet name
   * @property {number} julianDay - Julian Day used for calculation
   * @property {number} longitude - Ecliptic longitude in degrees (0-360)
   * @property {number} latitude - Ecliptic latitude in degrees
   * @property {number} distance - Distance from Earth/Sun in AU
   * @property {number} longitudeSpeed - Daily speed in longitude (degrees/day)
   * @property {number} latitudeSpeed - Daily speed in latitude (degrees/day)
   * @property {number} distanceSpeed - Daily speed in distance
   * @property {number} sign - Vedic sign number (1-12)
   * @property {string} signName - Vedic sign name (Aries, Taurus, etc.)
   * @property {number} degreesInSign - Degrees within the sign (0-29.99)
   * @property {number} retrograde - Retrograde status (1 = retrograde, 0 = direct)
   * @property {string} dignity - Planetary dignity status
   * @property {Object} aspects - Major aspects to other planets
   *
   * @example
   * ```javascript
   * const position = calculator.calculatePrecisePosition(jd, 'sun', {
   *   coordinateSystem: 'heliocentric',
   *   ayanamsa: 'lahiri',
   *   includeSpeed: true
   * });
   * console.log(`${position.planet} in ${position.signName} at ${position.degreesInSign.toFixed(2)}°`);
   * ```
   */
  calculatePrecisePosition(jd, planet, options = {}) {
    const {
      coordinateSystem = 'geocentric', // 'geocentric', 'heliocentric', 'topocentric'
      ayanamsa = 'lahiri',
      includeSpeed = true,
      includeXYZ = false,
      highPrecision = true
    } = options;

    // Performance optimization: Create cache key and check cache
    const cacheKey = `pos_${jd}_${planet}_${coordinateSystem}_${ayanamsa}_${includeSpeed}_${includeXYZ}_${highPrecision}`;
    const cachedResult = this._getCachedResult(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      const planetId = this._calculationConstants.planetIds[planet];
      if (!planetId) {
        throw new Error(`Unknown planet: ${planet}`);
      }

      // Set ayanamsa if specified
      if (ayanamsa && this._calculationConstants.ayanamsas[ayanamsa]) {
        sweph.set_sid_mode(this._calculationConstants.ayanamsas[ayanamsa], 0, 0);
      }

      // Determine calculation flags
      let flags = 2;
      if (includeSpeed) { flags |= 256; }
      if (includeXYZ) { flags |= 4096; }
      if (coordinateSystem === 'heliocentric') { flags |= 8; }
      if (highPrecision) { flags |= 2048; }

      // Calculate position
      const position = sweph.calc(jd, planetId, flags);

      if (!position || !position.longitude) {
        throw new Error(`Failed to calculate position for ${planet}`);
      }

      // Extract data based on flags
      const result = {
        planet,
        julianDay: jd,
        longitude: position.longitude[0],
        latitude: position.latitude ? position.latitude[0] : 0,
        distance: position.distance ? position.distance[0] : 0,
        longitudeSpeed: position.longitude[1] || 0,
        latitudeSpeed: position.latitude[1] || 0,
        distanceSpeed: position.distance[1] || 0,
        sign: Math.floor(position.longitude[0] / 30) + 1,
        signName: this._getVedicSignName(Math.floor(position.longitude[0] / 30) + 1),
        degreesInSign: position.longitude[0] % 30,
        retrograde: position.longitude[1] < 0,
        coordinateSystem
      };

      // Add XYZ coordinates if requested
      if (includeXYZ && position.x) {
        result.xyz = {
          x: position.x[0],
          y: position.y[0],
          z: position.z[0]
        };
      }

      // Add equatorial coordinates if high precision
      if (highPrecision && position.rightAscension) {
        result.equatorial = {
          rightAscension: position.rightAscension[0],
          declination: position.declination[0]
        };
      }

      // Performance optimization: Cache the result
      this._setCachedResult(cacheKey, result);

      return result;
    } catch (error) {
      logger.error(`Error calculating precise position for ${planet}:`, error.message);
      return {
        planet,
        error: `Calculation failed: ${error.message}`,
        julianDay: jd
      };
    }
  }

  /**
   * Calculate Lunar Nodes (Rahu/Ketu) with High Precision
   *
   * Computes the positions of Rahu (North Node) and Ketu (South Node) using Swiss Ephemeris.
   * Rahu and Ketu are mathematical points representing the intersection of the Moon's orbit
   * with the ecliptic, and are considered highly significant in Vedic astrology.
   *
   * @param {number} jd - Julian Day number for the calculation date/time
   * @param {string} nodeType - Type of lunar node calculation: 'true' (default) or 'mean'
   *
   * @returns {Object} Lunar node positions and astronomical data
   * @property {Object} rahu - Rahu (North Node) position data
   * @property {number} rahu.longitude - Longitude in degrees (0-360)
   * @property {number} rahu.latitude - Latitude in degrees
   * @property {number} rahu.speed - Daily speed in degrees/day
   * @property {number} rahu.sign - Vedic sign number (1-12)
   * @property {string} rahu.signName - Vedic sign name
   * @property {number} rahu.degreesInSign - Degrees within the sign (0-29.99)
   * @property {Object} ketu - Ketu (South Node) position data (always opposite to Rahu)
   * @property {number} ketu.longitude - Longitude in degrees (always 180° from Rahu)
   * @property {number} ketu.latitude - Latitude in degrees
   * @property {number} ketu.speed - Daily speed in degrees/day (opposite to Rahu)
   * @property {number} ketu.sign - Vedic sign number (1-12)
   * @property {string} ketu.signName - Vedic sign name
   * @property {number} ketu.degreesInSign - Degrees within the sign (0-29.99)
   * @property {string} nodeType - Type of calculation used ('true' or 'mean')
   * @property {number} julianDay - Julian Day used for calculation
   *
   * @example
   * ```javascript
   * const nodes = calculator.calculateLunarNodes(jd, 'true');
   * console.log(`Rahu in ${nodes.rahu.signName} at ${nodes.rahu.degreesInSign.toFixed(2)}°`);
   * console.log(`Ketu in ${nodes.ketu.signName} at ${nodes.ketu.degreesInSign.toFixed(2)}°`);
   * ```
   */
  calculateLunarNodes(jd, nodeType = 'true') {
    // Performance optimization: Check cache first
    const cacheKey = `nodes_${jd}_${nodeType}`;
    const cachedResult = this._getCachedResult(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      const nodeId = nodeType === 'true' ? 11 : 10;

      // Calculate Rahu (North Node)
      const rahuPos = sweph.calc(jd, nodeId, 2 | 256);
      if (!rahuPos || !rahuPos.longitude) {
        throw new Error('Failed to calculate Rahu position');
      }

      // Ketu is always opposite to Rahu
      const ketuLongitude = (rahuPos.longitude[0] + 180) % 360;
      const ketuSpeed = -rahuPos.longitude[1]; // Opposite speed

      const rahu = {
        name: 'Rahu',
        longitude: rahuPos.longitude[0],
        latitude: rahuPos.latitude ? rahuPos.latitude[0] : 0,
        speed: rahuPos.longitude[1],
        sign: Math.floor(rahuPos.longitude[0] / 30) + 1,
        signName: this._getVedicSignName(Math.floor(rahuPos.longitude[0] / 30) + 1),
        degreesInSign: rahuPos.longitude[0] % 30,
        retrograde: rahuPos.longitude[1] < 0,
        nodeType
      };

      const ketu = {
        name: 'Ketu',
        longitude: ketuLongitude,
        latitude: -rahu.latitude, // Opposite latitude
        speed: ketuSpeed,
        sign: Math.floor(ketuLongitude / 30) + 1,
        signName: this._getVedicSignName(Math.floor(ketuLongitude / 30) + 1),
        degreesInSign: ketuLongitude % 30,
        retrograde: ketuSpeed < 0,
        nodeType
      };

      const result = { rahu, ketu, julianDay: jd, nodeType };

      // Performance optimization: Cache the result
      this._setCachedResult(cacheKey, result);

      return result;
    } catch (error) {
      logger.error('Error calculating lunar nodes:', error.message);
      return {
        error: `Lunar node calculation failed: ${error.message}`,
        julianDay: jd,
        nodeType
      };
    }
  }

  /**
   * Generate Daily Ephemeris Table
   *
   * Creates a comprehensive daily planetary position table (ephemeris) for astrological analysis.
   * Ephemeris tables show the positions of celestial bodies over time and are essential for
   * timing important events, understanding planetary movements, and advanced astrological work.
   *
   * @param {Date} startDate - Starting date for the ephemeris table
   * @param {number} days - Number of days to generate (default: 30, max: 365)
   * @param {Object} options - Configuration options for ephemeris generation
   * @param {Array<string>} options.planets - Planets to include (default: ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'rahu', 'ketu'])
   * @param {boolean} options.includeAspects - Include aspect calculations between planets (default: true)
   * @param {string} options.ayanamsa - Ayanamsa system: 'lahiri', 'raman', 'krishnamurti', 'fagan' (default: 'lahiri')
   * @param {string} options.coordinateSystem - Coordinate system: 'geocentric' or 'heliocentric' (default: 'geocentric')
   *
   * @returns {Object} Comprehensive ephemeris table data
   * @property {string} startDate - ISO string of start date
   * @property {string} endDate - ISO string of end date
   * @property {number} totalDays - Number of days in the table
   * @property {Array<string>} planets - List of planets included
   * @property {Array<Object>} dailyData - Array of daily planetary data
   * @property {string} dailyData[].date - Date in YYYY-MM-DD format
   * @property {number} dailyData[].julianDay - Julian Day number
   * @property {Object} dailyData[].positions - Planetary positions for the day
   * @property {Object} dailyData[].positions[planet] - Position data for each planet
   * @property {Array<Object>} dailyData[].aspects - Major aspects occurring on the day
   * @property {Object} metadata - Generation metadata
   * @property {string} metadata.ayanamsa - Ayanamsa system used
   * @property {string} metadata.coordinateSystem - Coordinate system used
   * @property {Date} metadata.generatedAt - Timestamp of generation
   *
   * @example
   * ```javascript
   * const ephemeris = calculator.generateEphemerisTable(new Date(), 7, {
   *   planets: ['sun', 'moon', 'venus'],
   *   includeAspects: true,
   *   ayanamsa: 'lahiri'
   * });
   *
   * ephemeris.dailyData.forEach(day => {
   *   console.log(`${day.date}: Sun at ${day.positions.sun.longitude.toFixed(2)}°`);
   * });
   * ```
   */
  generateEphemerisTable(startDate, days = 30, options = {}) {
    const {
      planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'rahu', 'ketu'],
      includeAspects = true,
      ayanamsa = 'lahiri',
      coordinateSystem = 'geocentric'
    } = options;

    // Performance optimization: Pre-calculate planet IDs and validation
    const validPlanets = planets.filter(planet => this._calculationConstants.planetIds[planet]);
    const planetIds = validPlanets.reduce((acc, planet) => {
      acc[planet] = this._calculationConstants.planetIds[planet];
      return acc;
    }, {});

    // Set ayanamsa once for all calculations
    if (ayanamsa && this._calculationConstants.ayanamsas[ayanamsa]) {
      sweph.set_sid_mode(this._calculationConstants.ayanamsas[ayanamsa], 0, 0);
    }

    // Determine calculation flags once
    let flags = 2 | 256;
    if (coordinateSystem === 'heliocentric') { flags |= 8; }

    try {
      const ephemeris = {
        startDate: startDate.toISOString(),
        endDate: new Date(startDate.getTime() + (days - 1) * 24 * 60 * 60 * 1000).toISOString(),
        totalDays: days,
        planets: validPlanets,
        dailyData: [],
        metadata: {
          ayanamsa,
          coordinateSystem,
          generatedAt: new Date().toISOString(),
          calculationFlags: flags
        }
      };

      // Performance optimization: Pre-allocate array and use more efficient date calculation
      const startTime = startDate.getTime();
      const msPerDay = 24 * 60 * 60 * 1000;

      for (let day = 0; day < days; day++) {
        const currentTime = startTime + (day * msPerDay);
        const currentDate = new Date(currentTime);

        const jd = sweph.julday(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          currentDate.getDate(),
          12, // Noon
          1
        );

        const dayData = {
          date: currentDate.toISOString().split('T')[0],
          julianDay: jd,
          positions: {},
          aspects: []
        };

        // Performance optimization: Calculate lunar nodes once per day if both are requested
        let lunarNodes = null;
        if (validPlanets.includes('rahu') || validPlanets.includes('ketu')) {
          lunarNodes = this.calculateLunarNodes(jd, 'true');
        }

        // Calculate planetary positions with optimized options
        const calcOptions = {
          coordinateSystem,
          ayanamsa,
          includeSpeed: true,
          highPrecision: false // Reduce precision for bulk calculations
        };

        for (const planet of validPlanets) {
          if (planet === 'rahu' && lunarNodes?.rahu) {
            dayData.positions.rahu = lunarNodes.rahu;
          } else if (planet === 'ketu' && lunarNodes?.ketu) {
            dayData.positions.ketu = lunarNodes.ketu;
          } else if (planetIds[planet]) {
            const position = this.calculatePrecisePosition(jd, planet, calcOptions);
            if (position && position.longitude !== undefined) {
              dayData.positions[planet] = position;
            }
          }
        }

        // Calculate aspects if requested
        if (includeAspects) {
          dayData.aspects = this._calculateDailyAspects(dayData.planets);
        }

        ephemeris.dailyData.push(dayData);
      }

      return ephemeris;
    } catch (error) {
      logger.error('Error generating ephemeris table:', error.message);
      return {
        error: `Ephemeris generation failed: ${error.message}`,
        startDate: startDate.toISOString(),
        days
      };
    }
  }

  /**
   * Calculate daily aspects between planets
   * @private
   * @param {Object} planets - Planetary positions for the day
   * @returns {Array} Aspects for the day
   */
  _calculateDailyAspects(planets) {
    const aspects = [];
    const planetList = Object.keys(planets);

    for (let i = 0; i < planetList.length; i++) {
      for (let j = i + 1; j < planetList.length; j++) {
        const planet1 = planetList[i];
        const planet2 = planetList[j];

        const pos1 = planets[planet1];
        const pos2 = planets[planet2];

        if (pos1 && pos2 && pos1.longitude !== undefined && pos2.longitude !== undefined) {
          const angle = Math.abs(pos1.longitude - pos2.longitude);
          const minAngle = Math.min(angle, 360 - angle);

          // Check for major aspects
          const aspectTypes = [
            { name: 'Conjunction', angle: 0, orb: 8 },
            { name: 'Sextile', angle: 60, orb: 6 },
            { name: 'Square', angle: 90, orb: 8 },
            { name: 'Trine', angle: 120, orb: 8 },
            { name: 'Opposition', angle: 180, orb: 8 }
          ];

          for (const aspectType of aspectTypes) {
            if (Math.abs(minAngle - aspectType.angle) <= aspectType.orb) {
              aspects.push({
                planets: [planet1, planet2],
                aspect: aspectType.name,
                angle: Math.round(minAngle * 10) / 10,
                exactness: Math.round((1 - Math.abs(minAngle - aspectType.angle) / aspectType.orb) * 100),
                applying: pos1.speed > pos2.speed
              });
            }
          }
        }
      }
    }

    return aspects.slice(0, 10); // Limit to most significant aspects
  }

  /**
   * Enhanced Secondary Progressions with Precise Calculations
   *
   * Calculates secondary progressions using the "day-for-a-year" method where one day after birth
   * equals one year of life. This advanced technique reveals the inner psychological development,
   * life themes, and timing of major life changes. Uses high-precision Swiss Ephemeris calculations
   * with lunar nodes and enhanced aspect analysis.
   *
   * @param {Object} birthData - Complete birth information
   * @param {string} birthData.birthDate - Birth date in DD/MM/YYYY format
   * @param {string} birthData.birthTime - Birth time in HH:MM format
   * @param {string} birthData.birthPlace - Birth place as "City, Country"
   * @param {Date} targetDate - Date for which to calculate progressions (default: current date)
   *
   * @returns {Object} Comprehensive secondary progression analysis
   * @property {number} ageInYears - Current age in years
   * @property {number} ageInDays - Current age in days (used for progression)
   * @property {string} formattedProgressedDate - Progressed date in readable format
   * @property {number} progressedJulianDay - Julian Day of progressed chart
   * @property {Object} progressedPositions - Progressed planetary positions
   * @property {Array<Object>} keyProgressions - Significant progressed planet movements
   * @property {Array<string>} majorThemes - Major life themes for current period
   * @property {Array<string>} lifeChanges - Anticipated life changes and transitions
   * @property {Array<Object>} aspects - Major progressed aspects
   * @property {Object} lunarNodes - Progressed lunar node positions
   * @property {Object} solarArc - Solar arc directions for comparison
   * @property {Object} metadata - Calculation metadata
   *
   * @example
   * ```javascript
   * const progressions = await calculator.calculateEnhancedSecondaryProgressions({
   *   birthDate: '15/06/1990',
   *   birthTime: '14:30',
   *   birthPlace: 'Mumbai, India'
   * }, new Date());
   *
   * console.log(`Age: ${progressions.ageInYears} years`);
   * console.log(`Key themes: ${progressions.majorThemes.join(', ')}`);
   * ```
   */
  async calculateEnhancedSecondaryProgressions(birthData, targetDate = new Date()) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      // Parse birth data
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get birth coordinates and timezone
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Calculate birth Julian Day
      const birthJD = sweph.julday(year, month, day, hour + minute / 60, 1);

      // Calculate days since birth
      const targetJD = sweph.julday(
        targetDate.getFullYear(),
        targetDate.getMonth() + 1,
        targetDate.getDate(),
        targetDate.getHours() + targetDate.getMinutes() / 60,
        1
      );

      const daysSinceBirth = targetJD - birthJD;
      const yearsSinceBirth = daysSinceBirth / 365.25;

      // Calculate progressed Julian Day (1 day = 1 year in secondary progressions)
      const progressedJD = birthJD + yearsSinceBirth;

      // Calculate progressed planetary positions
      const progressedPlanets = {};
      const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'rahu', 'ketu'];

      for (const planet of planets) {
        if (planet === 'rahu' || planet === 'ketu') {
          const nodes = this.calculateLunarNodes(progressedJD, 'true');
          if (planet === 'rahu' && nodes.rahu) {
            progressedPlanets.rahu = nodes.rahu;
          } else if (planet === 'ketu' && nodes.ketu) {
            progressedPlanets.ketu = nodes.ketu;
          }
        } else {
          const position = this.calculatePrecisePosition(progressedJD, planet, {
            includeSpeed: true,
            highPrecision: true
          });
          if (position.longitude !== undefined) {
            progressedPlanets[planet] = position;
          }
        }
      }

      // Calculate progressed houses
      const progressedHouses = this._calculateProgressedHouses(progressedJD, latitude, longitude);

      // Analyze progressed aspects
      const progressedAspects = this._calculateProgressedAspects(progressedPlanets);

      // Generate interpretation
      const interpretation = this._interpretSecondaryProgressions(progressedPlanets, progressedAspects, yearsSinceBirth);

      return {
        birthData: {
          date: birthDate,
          time: birthTime,
          place: birthPlace,
          julianDay: birthJD
        },
        targetDate: targetDate.toISOString(),
        daysSinceBirth: Math.round(daysSinceBirth),
        yearsSinceBirth: Math.round(yearsSinceBirth * 100) / 100,
        progressedJulianDay: progressedJD,
        progressedPlanets,
        progressedHouses,
        progressedAspects,
        interpretation,
        summary: this._generateSecondaryProgressionSummary(interpretation, yearsSinceBirth)
      };
    } catch (error) {
      logger.error('Error calculating enhanced secondary progressions:', error.message);
      return {
        error: `Secondary progression calculation failed: ${error.message}`,
        birthData,
        targetDate: targetDate.toISOString()
      };
    }
  }

  /**
   * Calculate Progressed Houses
   * @private
   * @param {number} progressedJD - Progressed Julian Day
   * @param {number} latitude - Birth latitude
   * @param {number} longitude - Birth longitude
   * @returns {Object} Progressed house cusps
   */
  _calculateProgressedHouses(progressedJD, latitude, longitude) {
    try {
      // Use Placidus house system for progressed charts
      const houses = sweph.houses(progressedJD, latitude, longitude, 'P');

      if (!houses || !houses.house) {
        throw new Error('Failed to calculate progressed houses');
      }

      const houseCusps = {};
      for (let i = 1; i <= 12; i++) {
        houseCusps[i] = houses.house[i - 1];
      }

      return {
        system: 'Placidus',
        ascendant: houses.ascendant,
        mc: houses.mc,
        armc: houses.armc,
        houseCusps
      };
    } catch (error) {
      logger.error('Error calculating progressed houses:', error.message);
      return { error: error.message };
    }
  }

  /**
   * Calculate Progressed Aspects
   * @private
   * @param {Object} progressedPlanets - Progressed planetary positions
   * @returns {Array} Progressed aspects
   */
  _calculateProgressedAspects(progressedPlanets) {
    const aspects = [];
    const planetList = Object.keys(progressedPlanets);

    for (let i = 0; i < planetList.length; i++) {
      for (let j = i + 1; j < planetList.length; j++) {
        const planet1 = planetList[i];
        const planet2 = planetList[j];

        const pos1 = progressedPlanets[planet1];
        const pos2 = progressedPlanets[planet2];

        if (pos1 && pos2 && pos1.longitude !== undefined && pos2.longitude !== undefined) {
          const angle = Math.abs(pos1.longitude - pos2.longitude);
          const minAngle = Math.min(angle, 360 - angle);

          // Check for major aspects with tighter orbs for progressions
          const aspectTypes = [
            { name: 'Conjunction', angle: 0, orb: 5 },
            { name: 'Sextile', angle: 60, orb: 4 },
            { name: 'Square', angle: 90, orb: 5 },
            { name: 'Trine', angle: 120, orb: 5 },
            { name: 'Opposition', angle: 180, orb: 5 }
          ];

          for (const aspectType of aspectTypes) {
            if (Math.abs(minAngle - aspectType.angle) <= aspectType.orb) {
              aspects.push({
                planets: [planet1, planet2],
                aspect: aspectType.name,
                angle: Math.round(minAngle * 10) / 10,
                orb: Math.round((minAngle - aspectType.angle) * 10) / 10,
                exactness: Math.round((1 - Math.abs(minAngle - aspectType.angle) / aspectType.orb) * 100)
              });
            }
          }
        }
      }
    }

    return aspects.slice(0, 8); // Limit to most significant aspects
  }

  /**
   * Interpret Secondary Progressions
   * @private
   * @param {Object} progressedPlanets - Progressed planets
   * @param {Array} progressedAspects - Progressed aspects
   * @param {number} yearsSinceBirth - Years since birth
   * @returns {Object} Interpretation
   */
  _interpretSecondaryProgressions(progressedPlanets, progressedAspects, yearsSinceBirth) {
    const interpretation = {
      lifeStage: '',
      keyThemes: [],
      significantAspects: [],
      recommendations: []
    };

    // Determine life stage based on progressed Sun sign
    if (progressedPlanets.sun) {
      const sunSign = progressedPlanets.sun.sign;
      const lifeStageThemes = {
        1: 'New beginnings, self-discovery, and personal identity development',
        2: 'Building foundations, material security, and self-worth',
        3: 'Communication, learning, and social connections',
        4: 'Emotional security, home, and family relationships',
        5: 'Creativity, self-expression, and children',
        6: 'Service, health, and daily routines',
        7: 'Partnerships, relationships, and balance',
        8: 'Transformation, shared resources, and deep change',
        9: 'Wisdom, travel, and philosophical pursuits',
        10: 'Career, reputation, and life direction',
        11: 'Community, friendships, and future goals',
        12: 'Spirituality, endings, and new beginnings'
      };

      interpretation.lifeStage = lifeStageThemes[sunSign] || 'Personal growth and development';
    }

    // Analyze significant aspects
    progressedAspects.forEach(aspect => {
      if (aspect.exactness >= 80) { // Very exact aspects
        interpretation.significantAspects.push({
          aspect: `${aspect.planets[0]}-${aspect.planets[1]} ${aspect.aspect}`,
          significance: this._interpretProgressedAspect(aspect),
          strength: aspect.exactness
        });
      }
    });

    // Generate key themes based on age
    if (yearsSinceBirth < 12) {
      interpretation.keyThemes.push('Childhood development and learning');
    } else if (yearsSinceBirth < 21) {
      interpretation.keyThemes.push('Adolescence and identity formation');
    } else if (yearsSinceBirth < 30) {
      interpretation.keyThemes.push('Early adulthood and career establishment');
    } else if (yearsSinceBirth < 42) {
      interpretation.keyThemes.push('Mid-life transitions and responsibilities');
    } else if (yearsSinceBirth < 60) {
      interpretation.keyThemes.push('Career peak and life assessment');
    } else {
      interpretation.keyThemes.push('Later life wisdom and legacy');
    }

    // Add recommendations
    interpretation.recommendations = [
      'Pay attention to the progressed Sun\'s themes for the year',
      'Note any exact progressed aspects as significant life events',
      'Consider progressed house cusps for timing of life changes',
      'Use progressed Moon for emotional cycles and relationships'
    ];

    return interpretation;
  }

  /**
   * Interpret Progressed Aspect
   * @private
   * @param {Object} aspect - Aspect data
   * @returns {string} Interpretation
   */
  _interpretProgressedAspect(aspect) {
    const aspectThemes = {
      Conjunction: 'Integration and new beginnings',
      Sextile: 'Opportunities and harmonious development',
      Square: 'Challenges and growth opportunities',
      Trine: 'Natural talents and ease',
      Opposition: 'Balance and integration of opposites'
    };

    return aspectThemes[aspect.aspect] || 'Significant development';
  }

  /**
   * Generate Secondary Progression Summary
   * @private
   * @param {Object} interpretation - Interpretation data
   * @param {number} yearsSinceBirth - Years since birth
   * @returns {string} Summary text
   */
  _generateSecondaryProgressionSummary(interpretation, yearsSinceBirth) {
    let summary = `🔮 *Secondary Progressions - Age ${Math.floor(yearsSinceBirth)}*\n\n`;

    summary += `*Life Stage:* ${interpretation.lifeStage}\n\n`;

    if (interpretation.keyThemes.length > 0) {
      summary += '*Key Themes:*\n';
      interpretation.keyThemes.forEach(theme => {
        summary += `• ${theme}\n`;
      });
      summary += '\n';
    }

    if (interpretation.significantAspects.length > 0) {
      summary += '*Significant Aspects:*\n';
      interpretation.significantAspects.slice(0, 3).forEach(aspect => {
        summary += `• ${aspect.aspect}: ${aspect.significance}\n`;
      });
      summary += '\n';
    }

    summary += '*Recommendations:*\n';
    interpretation.recommendations.slice(0, 2).forEach(rec => {
      summary += `• ${rec}\n`;
    });

    return summary;
  }

  /**
   * Enhanced Solar Arc Directions with Precise Calculations
   *
   * Calculates solar arc directions where all planets move the same distance as the Sun from birth.
   * This powerful predictive technique reveals major life changes, career shifts, and significant
   * turning points. Solar arcs are particularly effective for timing important life events and
   * understanding the evolution of life circumstances.
   *
   * @param {Object} birthData - Complete birth information
   * @param {string} birthData.birthDate - Birth date in DD/MM/YYYY format
   * @param {string} birthData.birthTime - Birth time in HH:MM format
   * @param {string} birthData.birthPlace - Birth place as "City, Country"
   * @param {Date} targetDate - Date for which to calculate solar arcs (default: current date)
   *
   * @returns {Object} Comprehensive solar arc direction analysis
   * @property {number} ageInYears - Current age in years
   * @property {number} solarArcDegrees - Degrees of solar arc movement
   * @property {string} formattedArcDate - Solar arc date in readable format
   * @property {number} directedJulianDay - Julian Day of directed chart
   * @property {Object} directedPositions - Solar arc directed planetary positions
   * @property {Array<Object>} keyDirections - Significant solar arc directed planets
   * @property {Array<string>} lifeChanges - Major life changes indicated by solar arcs
   * @property {Array<Object>} aspects - Major directed aspects
   * @property {Object} solarReturn - Solar return data for comparison
   * @property {Object} metadata - Calculation metadata
   *
   * @example
   * ```javascript
   * const solarArc = await calculator.calculateEnhancedSolarArcDirections({
   *   birthDate: '15/06/1990',
   *   birthTime: '14:30',
   *   birthPlace: 'Mumbai, India'
   * }, new Date());
   *
   * console.log(`Solar arc: ${solarArc.solarArcDegrees.toFixed(2)}°`);
   * console.log(`Life changes: ${solarArc.lifeChanges.join(', ')}`);
   * ```
   */
  async calculateEnhancedSolarArcDirections(birthData, targetDate = new Date()) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      // Parse birth data
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get birth coordinates and timezone
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Calculate birth Julian Day
      const birthJD = sweph.julday(year, month, day, hour + minute / 60, 1);

      // Calculate days since birth
      const targetJD = sweph.julday(
        targetDate.getFullYear(),
        targetDate.getMonth() + 1,
        targetDate.getDate(),
        targetDate.getHours() + targetDate.getMinutes() / 60,
        1
      );

      const daysSinceBirth = targetJD - birthJD;
      const yearsSinceBirth = daysSinceBirth / 365.25;

      // Get birth Sun position
      const birthSunPos = sweph.calc(birthJD, 0, 2);
      if (!birthSunPos || !birthSunPos.longitude) {
        throw new Error('Failed to calculate birth Sun position');
      }

      // Calculate solar arc (degrees the Sun has moved since birth)
      const currentSunPos = sweph.calc(targetJD, 0, 2);
      if (!currentSunPos || !currentSunPos.longitude) {
        throw new Error('Failed to calculate current Sun position');
      }

      const solarArcDegrees = (currentSunPos.longitude[0] - birthSunPos.longitude[0] + 360) % 360;

      // Calculate directed planetary positions
      const directedPlanets = {};
      const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

      for (const planet of planets) {
        const birthPos = sweph.calc(birthJD, this._calculationConstants.planetIds[planet], 2);
        if (birthPos && birthPos.longitude) {
          const directedLongitude = (birthPos.longitude[0] + solarArcDegrees) % 360;
          directedPlanets[planet] = {
            name: planet.charAt(0).toUpperCase() + planet.slice(1),
            birthLongitude: birthPos.longitude[0],
            directedLongitude,
            arcMovement: solarArcDegrees,
            sign: Math.floor(directedLongitude / 30) + 1,
            signName: this._getVedicSignName(Math.floor(directedLongitude / 30) + 1),
            degreesInSign: directedLongitude % 30
          };
        }
      }

      // Calculate directed aspects
      const directedAspects = this._calculateDirectedAspects(directedPlanets);

      // Generate interpretation
      const interpretation = this._interpretSolarArcDirections(directedPlanets, directedAspects, yearsSinceBirth);

      return {
        birthData: {
          date: birthDate,
          time: birthTime,
          place: birthPlace,
          sunLongitude: birthSunPos.longitude[0]
        },
        targetDate: targetDate.toISOString(),
        daysSinceBirth: Math.round(daysSinceBirth),
        yearsSinceBirth: Math.round(yearsSinceBirth * 100) / 100,
        solarArcDegrees: Math.round(solarArcDegrees * 100) / 100,
        directedPlanets,
        directedAspects,
        interpretation,
        summary: this._generateSolarArcSummary(interpretation, yearsSinceBirth)
      };
    } catch (error) {
      logger.error('Error calculating enhanced solar arc directions:', error.message);
      return {
        error: `Solar arc calculation failed: ${error.message}`,
        birthData,
        targetDate: targetDate.toISOString()
      };
    }
  }

  /**
   * Calculate Directed Aspects
   * @private
   * @param {Object} directedPlanets - Directed planetary positions
   * @returns {Array} Directed aspects
   */
  _calculateDirectedAspects(directedPlanets) {
    const aspects = [];
    const planetList = Object.keys(directedPlanets);

    for (let i = 0; i < planetList.length; i++) {
      for (let j = i + 1; j < planetList.length; j++) {
        const planet1 = planetList[i];
        const planet2 = planetList[j];

        const pos1 = directedPlanets[planet1];
        const pos2 = directedPlanets[planet2];

        if (pos1 && pos2 && pos1.directedLongitude !== undefined && pos2.directedLongitude !== undefined) {
          const angle = Math.abs(pos1.directedLongitude - pos2.directedLongitude);
          const minAngle = Math.min(angle, 360 - angle);

          // Check for major aspects
          const aspectTypes = [
            { name: 'Conjunction', angle: 0, orb: 5 },
            { name: 'Sextile', angle: 60, orb: 4 },
            { name: 'Square', angle: 90, orb: 5 },
            { name: 'Trine', angle: 120, orb: 5 },
            { name: 'Opposition', angle: 180, orb: 5 }
          ];

          for (const aspectType of aspectTypes) {
            if (Math.abs(minAngle - aspectType.angle) <= aspectType.orb) {
              aspects.push({
                planets: [planet1, planet2],
                aspect: aspectType.name,
                angle: Math.round(minAngle * 10) / 10,
                orb: Math.round((minAngle - aspectType.angle) * 10) / 10,
                exactness: Math.round((1 - Math.abs(minAngle - aspectType.angle) / aspectType.orb) * 100)
              });
            }
          }
        }
      }
    }

    return aspects.slice(0, 6); // Limit to most significant aspects
  }

  /**
   * Interpret Solar Arc Directions
   * @private
   * @param {Object} directedPlanets - Directed planets
   * @param {Array} directedAspects - Directed aspects
   * @param {number} yearsSinceBirth - Years since birth
   * @returns {Object} Interpretation
   */
  _interpretSolarArcDirections(directedPlanets, directedAspects, yearsSinceBirth) {
    const interpretation = {
      keyDirections: [],
      lifeChanges: [],
      recommendations: []
    };

    // Analyze directed Sun (life direction)
    if (directedPlanets.sun) {
      const sunSign = directedPlanets.sun.signName;
      interpretation.keyDirections.push(`Directed Sun in ${sunSign}: Life direction and purpose themes`);
    }

    // Analyze directed Moon (emotional life)
    if (directedPlanets.moon) {
      const moonSign = directedPlanets.moon.signName;
      interpretation.keyDirections.push(`Directed Moon in ${moonSign}: Emotional development and inner life`);
    }

    // Analyze significant aspects
    directedAspects.forEach(aspect => {
      if (aspect.exactness >= 90) {
        interpretation.lifeChanges.push(`${aspect.planets[0]}-${aspect.planets[1]} ${aspect.aspect}: Major life development`);
      }
    });

    // Age-specific interpretations
    if (yearsSinceBirth < 30) {
      interpretation.recommendations.push('Focus on education, career beginnings, and personal development');
    } else if (yearsSinceBirth < 50) {
      interpretation.recommendations.push('Emphasize career advancement, relationships, and family building');
    } else {
      interpretation.recommendations.push('Focus on life review, wisdom sharing, and legacy building');
    }

    return interpretation;
  }

  /**
   * Generate Solar Arc Summary
   * @private
   * @param {Object} interpretation - Interpretation data
   * @param {number} yearsSinceBirth - Years since birth
   * @returns {string} Summary text
   */
  _generateSolarArcSummary(interpretation, yearsSinceBirth) {
    let summary = `☀️ *Solar Arc Directions - Age ${Math.floor(yearsSinceBirth)}*\n\n`;

    if (interpretation.keyDirections.length > 0) {
      summary += '*Key Directions:*\n';
      interpretation.keyDirections.forEach(direction => {
        summary += `• ${direction}\n`;
      });
      summary += '\n';
    }

    if (interpretation.lifeChanges.length > 0) {
      summary += '*Life Changes:*\n';
      interpretation.lifeChanges.forEach(change => {
        summary += `• ${change}\n`;
      });
      summary += '\n';
    }

    summary += '*Recommendations:*\n';
    interpretation.recommendations.forEach(rec => {
      summary += `• ${rec}\n`;
    });

    return summary;
  }

  /**
   * Calculate Jaimini Astrology Analysis - Alternative Vedic system using Karakas
   * @param {Object} birthData - Birth data object
   * @returns {Object} Jaimini astrology analysis
   */
  async calculateJaiminiAstrology(birthData) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return { error: 'Complete birth details required for Jaimini astrology analysis' };
      }

      // Get birth chart
      const birthChart = await this.generateBasicBirthChart(birthData);

      // Calculate Jaimini Karakas (significators)
      const karakas = this._calculateJaiminiKarakas(birthChart);

      // Analyze Jaimini aspects and combinations
      const aspects = this._analyzeJaiminiAspects(birthChart, karakas);

      // Calculate Jaimini dashas
      const dashas = this._calculateJaiminiDashas(birthChart, karakas);

      // Generate predictions based on Jaimini system
      const predictions = this._generateJaiminiPredictions(karakas, aspects, dashas);

      return {
        karakas,
        aspects,
        dashas,
        predictions,
        summary: this._generateJaiminiSummary(karakas, predictions)
      };
    } catch (error) {
      logger.error('Error calculating Jaimini astrology:', error);
      return { error: 'Unable to calculate Jaimini astrology at this time' };
    }
  }

  /**
   * Calculate Jaimini Karakas (significators)
   * @private
   * @param {Object} birthChart - Birth chart
   * @returns {Object} Jaimini Karakas
   */
  _calculateJaiminiKarakas(birthChart) {
    const karakas = {
      atmaKarak: null, // Soul significator - planet with highest longitude
      amatyakarak: null, // Career significator
      bhratruKarak: null, // Sibling significator
      matruKarak: null, // Mother significator
      putraKarak: null, // Children significator
      gnatiKarak: null, // Relatives significator
      daraKarak: null // Spouse significator
    };

    // Get all planets with their longitudes
    const planets = Object.entries(birthChart.planets).map(([name, data]) => ({
      name,
      longitude: data.longitude || 0
    })).filter(p => p.longitude > 0);

    // Sort planets by longitude (descending)
    planets.sort((a, b) => b.longitude - a.longitude);

    // Assign karakas based on longitude order
    if (planets.length >= 7) {
      karakas.atmaKarak = planets[0];
      karakas.amatyakarak = planets[1];
      karakas.bhratruKarak = planets[2];
      karakas.matruKarak = planets[3];
      karakas.putraKarak = planets[4];
      karakas.gnatiKarak = planets[5];
      karakas.daraKarak = planets[6];
    }

    return karakas;
  }

  /**
   * Analyze Jaimini aspects and combinations
   * @private
   * @param {Object} birthChart - Birth chart
   * @param {Object} karakas - Jaimini Karakas
   * @returns {Object} Jaimini aspects analysis
   */
  _analyzeJaiminiAspects(birthChart, karakas) {
    const aspects = {
      karakaCombinations: [],
      powerfulPlacements: [],
      aspectPatterns: []
    };

    // Analyze Karaka relationships
    if (karakas.atmaKarak && karakas.amatyakarak) {
      const atmaSign = Math.floor(karakas.atmaKarak.longitude / 30) + 1;
      const amatyaSign = Math.floor(karakas.amatyakarak.longitude / 30) + 1;

      // Check if Amatyakaraka aspects Atmakaraka
      const signDiff = Math.abs(atmaSign - amatyaSign);
      if (signDiff === 3 || signDiff === 5 || signDiff === 7 || signDiff === 9) {
        aspects.karakaCombinations.push('Amatyakaraka aspects Atmakaraka - Career supports life purpose');
      }
    }

    // Analyze powerful placements (Karakas in certain houses)
    Object.entries(karakas).forEach(([karakaName, karakaData]) => {
      if (karakaData && karakaData.longitude !== undefined) {
        const sign = Math.floor(karakaData.longitude / 30) + 1;
        const house = this._getVedicHouse(karakaData.longitude, 0, 0, 0, 0); // Simplified

        // Check for powerful house placements
        if ([1, 4, 7, 10].includes(house)) {
          aspects.powerfulPlacements.push(`${karakaName} in kendra house - Strong ${this._getKarakaMeaning(karakaName)}`);
        } else if ([5, 9].includes(house)) {
          aspects.powerfulPlacements.push(`${karakaName} in trikona house - Fortunate ${this._getKarakaMeaning(karakaName)}`);
        }
      }
    });

    // Analyze aspect patterns
    const karakaSigns = Object.values(karakas).filter(k => k).map(k => Math.floor(k.longitude / 30) + 1);
    const uniqueSigns = [...new Set(karakaSigns)];

    if (uniqueSigns.length < Object.keys(karakas).length) {
      aspects.aspectPatterns.push('Multiple Karakas in same signs - Concentrated life themes');
    }

    return aspects;
  }

  /**
   * Calculate Jaimini Dashas
   * @private
   * @param {Object} birthChart - Birth chart
   * @param {Object} karakas - Jaimini Karakas
   * @returns {Object} Jaimini Dasha periods
   */
  _calculateJaiminiDashas(birthChart, karakas) {
    const dashas = {
      currentDasha: null,
      upcomingDashas: [],
      dashaSequence: []
    };

    if (!karakas.atmaKarak) { return dashas; }

    // Jaimini Dasha sequence based on Karaka positions
    const dashaOrder = ['atma', 'amatyakara', 'bhratru', 'matru', 'putra', 'gnati', 'dara'];

    // Calculate dasha periods (simplified - each karaka rules for certain years)
    const dashaYears = {
      atma: 21,
      amatyakara: 16,
      bhratru: 12,
      matru: 9,
      putra: 7,
      gnati: 5,
      dara: 3
    };

    // Determine current dasha based on birth time (simplified calculation)
    const birthJD = this._dateToJulianDay(
      new Date().getFullYear() - 30, // Approximate 30 years ago
      1, 1, 12
    );
    const currentJD = this._dateToJulianDay(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate(), 12);
    const yearsSinceBirth = (currentJD - birthJD) / 365.25;

    let accumulatedYears = 0;
    let currentDashaIndex = 0;

    for (let i = 0; i < dashaOrder.length; i++) {
      const dashaName = dashaOrder[i];
      const dashaLength = dashaYears[dashaName];

      if (yearsSinceBirth >= accumulatedYears && yearsSinceBirth < accumulatedYears + dashaLength) {
        currentDashaIndex = i;
        break;
      }

      accumulatedYears += dashaLength;
    }

    // Set current dasha
    const currentDashaName = dashaOrder[currentDashaIndex];
    dashas.currentDasha = {
      name: currentDashaName,
      karaka: karakas[`${currentDashaName}Karak`],
      startYear: accumulatedYears,
      endYear: accumulatedYears + dashaYears[currentDashaName],
      effects: this._getJaiminiDashaEffects(currentDashaName)
    };

    // Set upcoming dashas
    for (let i = currentDashaIndex + 1; i < Math.min(currentDashaIndex + 4, dashaOrder.length); i++) {
      const dashaName = dashaOrder[i];
      dashas.upcomingDashas.push({
        name: dashaName,
        karaka: karakas[`${dashaName}Karak`],
        startYear: accumulatedYears + dashaYears[dashaName],
        effects: this._getJaiminiDashaEffects(dashaName)
      });
      accumulatedYears += dashaYears[dashaName];
    }

    return dashas;
  }

  /**
   * Generate Jaimini predictions
   * @private
   * @param {Object} karakas - Jaimini Karakas
   * @param {Object} aspects - Jaimini aspects
   * @param {Object} dashas - Jaimini Dashas
   * @returns {Object} Predictions
   */
  _generateJaiminiPredictions(karakas, aspects, dashas) {
    const predictions = {
      lifePurpose: '',
      career: '',
      relationships: '',
      spiritual: '',
      currentPeriod: '',
      futureOutlook: ''
    };

    // Life purpose based on Atmakaraka
    if (karakas.atmaKarak) {
      const atmaSign = Math.floor(karakas.atmaKarak.longitude / 30) + 1;
      predictions.lifePurpose = `Life purpose revolves around ${this._getSignThemes(atmaSign)} through ${this._getPlanetThemes(karakas.atmaKarak.name)}`;
    }

    // Career based on Amatyakaraka
    if (karakas.amatyakarak) {
      const amatyaSign = Math.floor(karakas.amatyakarak.longitude / 30) + 1;
      predictions.career = `Career path involves ${this._getSignThemes(amatyaSign)} expressed through ${this._getPlanetThemes(karakas.amatyakarak.name)}`;
    }

    // Relationships based on Darakaraka
    if (karakas.daraKarak) {
      const daraSign = Math.floor(karakas.daraKarak.longitude / 30) + 1;
      predictions.relationships = `Relationships characterized by ${this._getSignThemes(daraSign)} with ${this._getPlanetThemes(karakas.daraKarak.name)} qualities`;
    }

    // Spiritual path based on multiple factors
    predictions.spiritual = 'Spiritual journey involves ';
    if (karakas.atmaKarak) {
      predictions.spiritual += `${this._getPlanetThemes(karakas.atmaKarak.name)} wisdom and `;
    }
    predictions.spiritual += 'deep self-realization through life experiences';

    // Current period based on current dasha
    if (dashas.currentDasha) {
      predictions.currentPeriod = `Currently in ${dashas.currentDasha.name} dasha: ${dashas.currentDasha.effects}`;
    }

    // Future outlook based on upcoming dashas
    if (dashas.upcomingDashas.length > 0) {
      predictions.futureOutlook = `Future periods will bring ${dashas.upcomingDashas[0].effects.toLowerCase()}`;
    }

    return predictions;
  }

  /**
   * Generate Jaimini summary
   * @private
   * @param {Object} karakas - Jaimini Karakas
   * @param {Object} predictions - Predictions
   * @returns {string} Summary text
   */
  _generateJaiminiSummary(karakas, predictions) {
    let summary = '🔮 *Jaimini Astrology Analysis*\n\n';

    summary += '*Key Karakas (Significators):*\n';
    Object.entries(karakas).forEach(([karakaName, karakaData]) => {
      if (karakaData) {
        const sign = Math.floor(karakaData.longitude / 30) + 1;
        const signName = this._getVedicSignName(sign);
        summary += `• ${karakaName}: ${karakaData.name} in ${signName} - ${this._getKarakaMeaning(karakaName)}\n`;
      }
    });

    summary += '\n*Life Analysis:*\n';
    summary += `• *Life Purpose:* ${predictions.lifePurpose}\n`;
    summary += `• *Career Path:* ${predictions.career}\n`;
    summary += `• *Relationships:* ${predictions.relationships}\n`;
    summary += `• *Spiritual Journey:* ${predictions.spiritual}\n`;

    if (predictions.currentPeriod) {
      summary += `\n*Current Period:*\n• ${predictions.currentPeriod}\n`;
    }

    if (predictions.futureOutlook) {
      summary += `\n*Future Outlook:*\n• ${predictions.futureOutlook}\n`;
    }

    return summary;
  }

  /**
   * Get Karaka meaning
   * @private
   * @param {string} karakaName - Karaka name
   * @returns {string} Meaning
   */
  _getKarakaMeaning(karakaName) {
    const meanings = {
      atmaKarak: 'Soul and life purpose',
      amatyakarak: 'Career and profession',
      bhratruKarak: 'Siblings and friends',
      matruKarak: 'Mother and home',
      putraKarak: 'Children and creativity',
      gnatiKarak: 'Relatives and community',
      daraKarak: 'Spouse and partnerships'
    };
    return meanings[karakaName] || 'Life significator';
  }

  /**
   * Get sign themes
   * @private
   * @param {number} sign - Sign number (1-12)
   * @returns {string} Sign themes
   */
  _getSignThemes(sign) {
    const themes = {
      1: 'leadership and independence',
      2: 'nurturing and material comfort',
      3: 'communication and adaptability',
      4: 'emotional security and tradition',
      5: 'creativity and self-expression',
      6: 'service and analysis',
      7: 'harmony and partnership',
      8: 'transformation and intensity',
      9: 'wisdom and expansion',
      10: 'achievement and responsibility',
      11: 'innovation and community',
      12: 'spirituality and compassion'
    };
    return themes[sign] || 'unique qualities';
  }

  /**
   * Get planet themes
   * @private
   * @param {string} planet - Planet name
   * @returns {string} Planet themes
   */
  _getPlanetThemes(planet) {
    const themes = {
      sun: 'vitality and leadership',
      moon: 'emotion and intuition',
      mars: 'energy and courage',
      mercury: 'intelligence and communication',
      jupiter: 'wisdom and expansion',
      venus: 'love and harmony',
      saturn: 'discipline and structure'
    };
    return themes[planet] || 'planetary influence';
  }

  /**
   * Get Jaimini Dasha effects
   * @private
   * @param {string} dashaName - Dasha name
   * @returns {string} Effects description
   */
  _getJaiminiDashaEffects(dashaName) {
    const effects = {
      atma: 'Focus on soul purpose and spiritual growth',
      amatyakara: 'Career advancement and professional success',
      bhratru: 'Relationships with siblings and friends',
      matru: 'Home, family, and emotional security',
      putra: 'Children, creativity, and self-expression',
      gnati: 'Community involvement and social connections',
      dara: 'Marriage, partnerships, and committed relationships'
    };
    return effects[dashaName] || 'General life development';
  }

  /**
   * Generate Comprehensive Vedic Analysis - Advanced integration of multiple techniques
   * @param {Object} birthData - Birth data object
   * @returns {Object} Comprehensive Vedic analysis
   */
  async generateComprehensiveVedicAnalysis(birthData) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return { error: 'Complete birth details required for comprehensive Vedic analysis' };
      }

      // Generate all individual analyses
      const birthChart = await this.generateBasicBirthChart(birthData);
      const detailedAnalysis = await this.generateDetailedChartAnalysis(birthData);
      const gochar = await this.calculateGochar(birthData);
      const varshaphal = await this.calculateVarshaphal(birthData);
      const jaimini = await this.calculateJaiminiAstrology(birthData);
      const yogas = await this.calculateVedicYogas(birthData);
      const ashtakavarga = await this.calculateAshtakavarga(birthData);
      const remedies = await this.generateVedicRemedies(birthData, detailedAnalysis);

      // Integrate all analyses
      const integratedAnalysis = this._integrateVedicAnalyses({
        birthChart,
        detailedAnalysis,
        gochar,
        varshaphal,
        jaimini,
        yogas,
        ashtakavarga,
        remedies
      });

      // Generate AI-powered personalized insights
      const aiInsights = this._generateAIPoweredInsights(integratedAnalysis);

      return {
        birthChart,
        detailedAnalysis,
        gochar,
        varshaphal,
        jaimini,
        yogas,
        ashtakavarga,
        remedies,
        integratedAnalysis,
        aiInsights,
        summary: this._generateComprehensiveSummary(integratedAnalysis, aiInsights)
      };
    } catch (error) {
      logger.error('Error generating comprehensive Vedic analysis:', error);
      return { error: 'Unable to generate comprehensive Vedic analysis at this time' };
    }
  }

  /**
   * Integrate multiple Vedic analyses
   * @private
   * @param {Object} analyses - All individual analyses
   * @returns {Object} Integrated analysis
   */
  _integrateVedicAnalyses(analyses) {
    const integrated = {
      overallStrength: 0,
      dominantThemes: [],
      keyLifeAreas: {},
      predictiveTimeline: [],
      recommendedActions: []
    };

    // Calculate overall strength score
    let strengthScore = 5; // Base score

    // Add points from yogas
    if (analyses.yogas && analyses.yogas.rajaYogas) {
      strengthScore += analyses.yogas.rajaYogas.length * 2;
    }
    if (analyses.yogas && analyses.yogas.dhanaYogas) {
      strengthScore += analyses.yogas.dhanaYogas.length * 1.5;
    }

    // Add points from Ashtakavarga
    if (analyses.ashtakavarga && analyses.ashtakavarga.analysis) {
      const strongHouses = analyses.ashtakavarga.analysis.strongHouses || [];
      strengthScore += strongHouses.length * 0.5;
    }

    // Add points from Jaimini powerful placements
    if (analyses.jaimini && analyses.jaimini.aspects) {
      strengthScore += analyses.jaimini.aspects.powerfulPlacements.length;
    }

    integrated.overallStrength = Math.min(10, Math.max(0, strengthScore));

    // Extract dominant themes from all analyses
    const allThemes = [];

    // From birth chart
    if (analyses.birthChart && analyses.birthChart.personalityTraits) {
      allThemes.push(...analyses.birthChart.personalityTraits);
    }

    // From Jaimini
    if (analyses.jaimini && analyses.jaimini.predictions) {
      if (analyses.jaimini.predictions.lifePurpose) {
        allThemes.push(analyses.jaimini.predictions.lifePurpose.split(' ').slice(0, 3).join(' '));
      }
    }

    // From Varshaphal
    if (analyses.varshaphal && analyses.varshaphal.analysis) {
      allThemes.push(...analyses.varshaphal.analysis.keyThemes.slice(0, 2));
    }

    // Remove duplicates and limit
    integrated.dominantThemes = [...new Set(allThemes)].slice(0, 5);

    // Analyze key life areas
    integrated.keyLifeAreas = {
      career: this._integrateLifeAreaAnalysis('career', analyses),
      finance: this._integrateLifeAreaAnalysis('finance', analyses),
      relationships: this._integrateLifeAreaAnalysis('relationships', analyses),
      health: this._integrateLifeAreaAnalysis('health', analyses),
      spiritual: this._integrateLifeAreaAnalysis('spiritual', analyses)
    };

    // Create predictive timeline
    integrated.predictiveTimeline = this._createPredictiveTimeline(analyses);

    // Generate recommended actions
    integrated.recommendedActions = this._generateIntegratedRecommendations(analyses);

    return integrated;
  }

  /**
   * Integrate analysis for a specific life area
   * @private
   * @param {string} area - Life area
   * @param {Object} analyses - All analyses
   * @returns {Object} Integrated analysis for the area
   */
  _integrateLifeAreaAnalysis(area, analyses) {
    const areaAnalysis = {
      strength: 5,
      opportunities: [],
      challenges: [],
      recommendations: []
    };

    // Career analysis
    if (area === 'career') {
      // From Gochar
      if (analyses.gochar && analyses.gochar.predictions) {
        areaAnalysis.opportunities.push(analyses.gochar.predictions.career);
      }

      // From Varshaphal
      if (analyses.varshaphal && analyses.varshaphal.predictions) {
        areaAnalysis.opportunities.push(analyses.varshaphal.predictions.career);
      }

      // From Jaimini
      if (analyses.jaimini && analyses.jaimini.predictions) {
        areaAnalysis.opportunities.push(analyses.jaimini.predictions.career);
      }

      // From Yogas - Raja Yogas indicate career strength
      if (analyses.yogas && analyses.yogas.rajaYogas && analyses.yogas.rajaYogas.length > 0) {
        areaAnalysis.strength += 2;
        areaAnalysis.opportunities.push('Strong career yogas indicate professional success');
      }

      // From Ashtakavarga - 10th house
      if (analyses.ashtakavarga && analyses.ashtakavarga.sarvaAshtakavarga) {
        const tenthHouseBindus = analyses.ashtakavarga.sarvaAshtakavarga[9]; // 0-indexed
        if (tenthHouseBindus >= 25) {
          areaAnalysis.strength += 1;
          areaAnalysis.opportunities.push('Excellent career potential indicated');
        }
      }
    }

    // Finance analysis
    if (area === 'finance') {
      // From Varshaphal
      if (analyses.varshaphal && analyses.varshaphal.predictions) {
        areaAnalysis.opportunities.push(analyses.varshaphal.predictions.finance);
      }

      // From Dhana Yogas
      if (analyses.yogas && analyses.yogas.dhanaYogas && analyses.yogas.dhanaYogas.length > 0) {
        areaAnalysis.strength += 2;
        areaAnalysis.opportunities.push('Strong wealth yogas present');
      }

      // From Ashtakavarga - 2nd and 11th houses
      if (analyses.ashtakavarga && analyses.ashtakavarga.sarvaAshtakavarga) {
        const secondHouseBindus = analyses.ashtakavarga.sarvaAshtakavarga[1];
        const eleventhHouseBindus = analyses.ashtakavarga.sarvaAshtakavarga[10];
        if (secondHouseBindus >= 20 && eleventhHouseBindus >= 20) {
          areaAnalysis.strength += 1;
          areaAnalysis.opportunities.push('Favorable financial indicators');
        }
      }
    }

    // Relationships analysis
    if (area === 'relationships') {
      // From Varshaphal
      if (analyses.varshaphal && analyses.varshaphal.predictions) {
        areaAnalysis.opportunities.push(analyses.varshaphal.predictions.relationships);
      }

      // From Jaimini Darakaraka
      if (analyses.jaimini && analyses.jaimini.predictions) {
        areaAnalysis.opportunities.push(analyses.jaimini.predictions.relationships);
      }

      // From 7th house strength
      if (analyses.ashtakavarga && analyses.ashtakavarga.sarvaAshtakavarga) {
        const seventhHouseBindus = analyses.ashtakavarga.sarvaAshtakavarga[6];
        if (seventhHouseBindus >= 25) {
          areaAnalysis.strength += 1;
          areaAnalysis.opportunities.push('Strong relationship potential');
        }
      }
    }

    // Health analysis
    if (area === 'health') {
      // From Varshaphal
      if (analyses.varshaphal && analyses.varshaphal.predictions) {
        areaAnalysis.challenges.push(analyses.varshaphal.predictions.health);
      }

      // From 6th house (health challenges) - paradoxically strong 6th house shows good health management
      if (analyses.ashtakavarga && analyses.ashtakavarga.sarvaAshtakavarga) {
        const sixthHouseBindus = analyses.ashtakavarga.sarvaAshtakavarga[5];
        if (sixthHouseBindus >= 20) {
          areaAnalysis.strength += 1;
          areaAnalysis.opportunities.push('Good health management capabilities');
        }
      }
    }

    // Spiritual analysis
    if (area === 'spiritual') {
      // From Varshaphal
      if (analyses.varshaphal && analyses.varshaphal.predictions) {
        areaAnalysis.opportunities.push(analyses.varshaphal.predictions.spiritual);
      }

      // From Jaimini Atmakaraka
      if (analyses.jaimini && analyses.jaimini.predictions) {
        areaAnalysis.opportunities.push(analyses.jaimini.predictions.spiritual);
      }

      // From 9th and 12th houses
      if (analyses.ashtakavarga && analyses.ashtakavarga.sarvaAshtakavarga) {
        const ninthHouseBindus = analyses.ashtakavarga.sarvaAshtakavarga[8];
        const twelfthHouseBindus = analyses.ashtakavarga.sarvaAshtakavarga[11];
        if (ninthHouseBindus >= 20 || twelfthHouseBindus >= 20) {
          areaAnalysis.strength += 1;
          areaAnalysis.opportunities.push('Strong spiritual inclinations');
        }
      }
    }

    // Generate recommendations based on analysis
    areaAnalysis.recommendations = this._generateAreaRecommendations(area, areaAnalysis);

    return areaAnalysis;
  }

  /**
   * Create predictive timeline from all analyses
   * @private
   * @param {Object} analyses - All analyses
   * @returns {Array} Predictive timeline
   */
  _createPredictiveTimeline(analyses) {
    const timeline = [];

    // Current period from Gochar
    if (analyses.gochar && analyses.gochar.predictions) {
      timeline.push({
        period: 'Current',
        focus: 'Daily/monthly influences',
        predictions: [
          analyses.gochar.predictions.general,
          analyses.gochar.predictions.career,
          analyses.gochar.predictions.finance
        ].filter(p => p)
      });
    }

    // Annual predictions from Varshaphal
    if (analyses.varshaphal && analyses.varshaphal.predictions) {
      timeline.push({
        period: 'This Year',
        focus: 'Annual themes',
        predictions: [
          analyses.varshaphal.predictions.overall,
          analyses.varshaphal.predictions.career,
          analyses.varshaphal.predictions.finance
        ].filter(p => p)
      });
    }

    // Long-term from Jaimini Dashas
    if (analyses.jaimini && analyses.jaimini.dashas) {
      if (analyses.jaimini.dashas.currentDasha) {
        timeline.push({
          period: 'Current Dasha',
          focus: analyses.jaimini.dashas.currentDasha.name,
          predictions: [analyses.jaimini.dashas.currentDasha.effects]
        });
      }

      analyses.jaimini.dashas.upcomingDashas.slice(0, 2).forEach((dasha, index) => {
        timeline.push({
          period: `Future Dasha ${index + 1}`,
          focus: dasha.name,
          predictions: [dasha.effects]
        });
      });
    }

    return timeline;
  }

  /**
   * Generate integrated recommendations
   * @private
   * @param {Object} analyses - All analyses
   * @returns {Array} Recommendations
   */
  _generateIntegratedRecommendations(analyses) {
    const recommendations = [];

    // From remedies
    if (analyses.remedies && analyses.remedies.prioritizedRemedies) {
      recommendations.push(...analyses.remedies.prioritizedRemedies.slice(0, 3));
    }

    // From Yogas - suggest ways to activate positive yogas
    if (analyses.yogas && analyses.yogas.rajaYogas && analyses.yogas.rajaYogas.length === 0) {
      recommendations.push('Focus on personal development to activate leadership potential');
    }

    // From Ashtakavarga - strengthen weak houses
    if (analyses.ashtakavarga && analyses.ashtakavarga.analysis) {
      const weakHouses = analyses.ashtakavarga.analysis.weakHouses || [];
      weakHouses.slice(0, 2).forEach(house => {
        recommendations.push(`Strengthen ${this._getHouseArea(house)} through positive actions`);
      });
    }

    // General recommendations based on overall strength
    const integrated = this._integrateVedicAnalyses(analyses);
    if (integrated.overallStrength >= 7) {
      recommendations.push('Continue leveraging your natural strengths for success');
    } else if (integrated.overallStrength >= 5) {
      recommendations.push('Focus on balancing different life areas for greater harmony');
    } else {
      recommendations.push('Emphasize spiritual practices and self-improvement for transformation');
    }

    return [...new Set(recommendations)].slice(0, 5);
  }

  /**
   * Generate area-specific recommendations
   * @private
   * @param {string} area - Life area
   * @param {Object} areaAnalysis - Area analysis
   * @returns {Array} Recommendations
   */
  _generateAreaRecommendations(area, areaAnalysis) {
    const recommendations = [];

    if (areaAnalysis.strength >= 7) {
      recommendations.push(`Leverage your strong ${area} potential for success`);
    } else if (areaAnalysis.strength >= 5) {
      recommendations.push(`Develop your ${area} abilities through consistent effort`);
    } else {
      recommendations.push(`Focus on building foundations in ${area} through learning and practice`);
    }

    // Add specific recommendations based on opportunities and challenges
    if (areaAnalysis.opportunities.length > 0) {
      recommendations.push(`Take advantage of ${area} opportunities as they arise`);
    }

    if (areaAnalysis.challenges.length > 0) {
      recommendations.push(`Address ${area} challenges through positive action and patience`);
    }

    return recommendations.slice(0, 2);
  }

  /**
   * Generate AI-powered personalized insights
   * @private
   * @param {Object} integratedAnalysis - Integrated analysis
   * @returns {Object} AI insights
   */
  _generateAIPoweredInsights(integratedAnalysis) {
    const insights = {
      personalityProfile: '',
      lifePurpose: '',
      optimalPath: '',
      potentialChallenges: '',
      successStrategies: ''
    };

    // Generate personality profile
    const themes = integratedAnalysis.dominantThemes;
    if (themes.length > 0) {
      insights.personalityProfile = `You are a ${themes.slice(0, 3).join(', ')} individual with unique strengths and perspectives.`;
    }

    // Life purpose based on integrated analysis
    const { overallStrength } = integratedAnalysis;
    if (overallStrength >= 8) {
      insights.lifePurpose = 'Your life purpose involves leadership, innovation, and making a significant impact in your chosen field.';
    } else if (overallStrength >= 6) {
      insights.lifePurpose = 'Your life purpose centers on personal growth, helping others, and finding balance in all areas of life.';
    } else {
      insights.lifePurpose = 'Your life purpose involves deep transformation, spiritual growth, and overcoming challenges to help others.';
    }

    // Optimal path
    insights.optimalPath = 'Focus on developing your natural talents while maintaining balance across all life areas.';

    // Potential challenges
    insights.potentialChallenges = 'Be mindful of areas needing development and use challenges as opportunities for growth.';

    // Success strategies
    insights.successStrategies = 'Combine your unique strengths with consistent effort, positive thinking, and spiritual awareness.';

    return insights;
  }

  /**
   * Generate comprehensive summary
   * @private
   * @param {Object} integratedAnalysis - Integrated analysis
   * @param {Object} aiInsights - AI insights
   * @returns {string} Comprehensive summary
   */
  _generateComprehensiveSummary(integratedAnalysis, aiInsights) {
    let summary = '🌟 *Comprehensive Vedic Astrology Analysis*\n\n';

    // Overall assessment
    const strength = integratedAnalysis.overallStrength;
    if (strength >= 8) {
      summary += '*Overall Strength: Exceptional* 🌟\nYou have remarkable natural abilities and favorable planetary influences.\n\n';
    } else if (strength >= 6) {
      summary += '*Overall Strength: Strong* ✨\nYou possess good potential with opportunities for growth and success.\n\n';
    } else if (strength >= 4) {
      summary += '*Overall Strength: Moderate* ⚖️\nYou have balanced influences requiring conscious effort and positive actions.\n\n';
    } else {
      summary += '*Overall Strength: Developing* 🌱\nYou have significant potential that will unfold through perseverance and spiritual growth.\n\n';
    }

    // Key themes
    if (integratedAnalysis.dominantThemes.length > 0) {
      summary += '*Dominant Life Themes:*\n';
      integratedAnalysis.dominantThemes.forEach(theme => {
        summary += `• ${theme}\n`;
      });
      summary += '\n';
    }

    // Life areas overview
    summary += '*Life Areas Overview:*\n';
    Object.entries(integratedAnalysis.keyLifeAreas).forEach(([area, analysis]) => {
      const strengthIndicator = analysis.strength >= 7 ? '🟢' : analysis.strength >= 5 ? '🟡' : '🔴';
      summary += `• ${area.charAt(0).toUpperCase() + area.slice(1)}: ${strengthIndicator} ${analysis.strength}/10\n`;
    });
    summary += '\n';

    // AI insights
    summary += '*Personalized Insights:*\n';
    summary += `• *Personality:* ${aiInsights.personalityProfile}\n`;
    summary += `• *Life Purpose:* ${aiInsights.lifePurpose}\n`;
    summary += `• *Optimal Path:* ${aiInsights.optimalPath}\n\n`;

    // Recommendations
    if (integratedAnalysis.recommendedActions.length > 0) {
      summary += '*Recommended Actions:*\n';
      integratedAnalysis.recommendedActions.forEach(action => {
        summary += `• ${action}\n`;
      });
      summary += '\n';
    }

    summary += '*Next Steps:*\n';
    summary += '1. Review your personalized remedies and implement them gradually\n';
    summary += '2. Focus on your strongest life areas while developing weaker ones\n';
    summary += '3. Use current transits and dashas as guides for timing important decisions\n';
    summary += '4. Maintain spiritual practices and positive thinking for optimal results\n\n';

    summary += 'Remember: Vedic astrology shows potentials and tendencies, but your free will and actions shape your destiny. Use this knowledge as a guide for conscious living. 🕉️';

    return summary;
  }

  /**
   * Calculate Solar Return Chart
   *
   * Generates a solar return chart for a specific year, showing the astrological influences
   * and themes for the coming year. Solar returns occur when the Sun returns to its exact
   * natal position, creating a new "birthday chart" for the year ahead.
   *
   * @param {Object} birthData - Birth data
   * @param {string} birthData.birthDate - Birth date in DD/MM/YYYY format
   * @param {string} birthData.birthTime - Birth time in HH:MM format
   * @param {string} birthData.birthPlace - Birth place as "City, Country"
   * @param {number} targetYear - Year for which to calculate solar return (default: current year)
   * @param {string} targetPlace - Location for solar return calculation (default: birth place)
   *
   * @returns {Object} Comprehensive solar return analysis
   * @property {string} solarReturnDate - Exact date and time of solar return
   * @property {number} ageAtReturn - Age at the time of solar return
   * @property {Object} solarReturnChart - Complete chart for the solar return
   * @property {Array<string>} dominantThemes - Key themes for the coming year
   * @property {Array<string>} opportunities - Major opportunities indicated
   * @property {Array<string>} challenges - Potential challenges to address
   * @property {Object} houseCusps - Angular house positions
   * @property {Object} planetaryPositions - All planetary positions in solar return
   * @property {Array<Object>} majorAspects - Significant aspects in solar return chart
   * @property {string} summary - Comprehensive interpretation summary
   */
  async calculateSolarReturn(birthData, targetYear = new Date().getFullYear(), targetPlace = null) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      // Parse birth data
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get birth coordinates and timezone
      const [birthLat, birthLon] = await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const birthTimestamp = birthDateTime.getTime();
      const birthTimezone = await this._getTimezoneForPlace(birthLat, birthLon, birthTimestamp);

      // Calculate birth Sun position
      const birthJD = sweph.julday(year, month, day, hour + minute / 60, 1);
      const birthSun = sweph.calc(birthJD, 0, 2);

      if (!birthSun || !birthSun.longitude) {
        throw new Error('Failed to calculate birth Sun position');
      }

      const birthSunLongitude = birthSun.longitude[0];

      // Find solar return date for target year
      let solarReturnDate = null;
      let solarReturnJD = null;

      // Search for the date when Sun returns to birth position
      for (let month = 0; month < 12; month++) {
        for (let day = 1; day <= 31; day++) {
          try {
            const testJD = sweph.julday(targetYear, month + 1, day, 12, 1);
            const testSun = sweph.calc(testJD, 0, 2);

            if (testSun && testSun.longitude) {
              const sunDiff = Math.abs(testSun.longitude[0] - birthSunLongitude);
              const normalizedDiff = Math.min(sunDiff, 360 - sunDiff);

              if (normalizedDiff < 1) { // Within 1 degree
                solarReturnDate = new Date(targetYear, month, day);
                solarReturnJD = testJD;
                break;
              }
            }
          } catch (e) {
            // Skip invalid dates
            continue;
          }
        }
        if (solarReturnDate) { break; }
      }

      if (!solarReturnDate || !solarReturnJD) {
        throw new Error(`Could not find solar return for year ${targetYear}`);
      }

      // Calculate age at solar return
      const ageAtReturn = targetYear - year;

      // Use target place or birth place for the solar return chart
      const returnPlace = targetPlace || birthPlace;
      const [returnLat, returnLon] = await this._getCoordinatesForPlace(returnPlace);

      // Calculate house cusps for solar return
      const returnTimezone = await this._getTimezoneForPlace(returnLat, returnLon, solarReturnDate.getTime());
      const houses = sweph.houses(solarReturnJD, returnLat, returnLon, 'P'); // Placidus houses

      if (!houses || !houses.house) {
        throw new Error('Failed to calculate house cusps for solar return');
      }

      // Calculate planetary positions for solar return
      const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
      const planetaryPositions = {};

      for (const planet of planets) {
        const position = this.calculatePrecisePosition(solarReturnJD, planet, {
          ayanamsa: 'lahiri',
          coordinateSystem: 'geocentric',
          includeSpeed: true
        });

        if (position && position.longitude !== undefined) {
          planetaryPositions[planet] = position;
        }
      }

      // Calculate aspects in solar return chart
      const majorAspects = [];
      const planetList = Object.keys(planetaryPositions);

      for (let i = 0; i < planetList.length; i++) {
        for (let j = i + 1; j < planetList.length; j++) {
          const planet1 = planetList[i];
          const planet2 = planetList[j];
          const pos1 = planetaryPositions[planet1];
          const pos2 = planetaryPositions[planet2];

          if (pos1 && pos2) {
            const angle = Math.abs(pos1.longitude - pos2.longitude);
            const minAngle = Math.min(angle, 360 - angle);

            const aspects = [
              { name: 'Conjunction', angle: 0, orb: 8 },
              { name: 'Sextile', angle: 60, orb: 6 },
              { name: 'Square', angle: 90, orb: 8 },
              { name: 'Trine', angle: 120, orb: 8 },
              { name: 'Opposition', angle: 180, orb: 8 }
            ];

            for (const aspect of aspects) {
              if (Math.abs(minAngle - aspect.angle) <= aspect.orb) {
                majorAspects.push({
                  planets: [planet1, planet2],
                  aspect: aspect.name,
                  angle: Math.round(minAngle * 10) / 10,
                  exactness: Math.round((1 - Math.abs(minAngle - aspect.angle) / aspect.orb) * 100)
                });
              }
            }
          }
        }
      }

      // Analyze dominant themes based on solar return
      const dominantThemes = [];
      const opportunities = [];
      const challenges = [];

      // Sun sign in solar return indicates year's focus
      if (planetaryPositions.sun) {
        const sunSign = planetaryPositions.sun.sign;
        const sunThemes = {
          1: 'Self-discovery, new beginnings, and personal identity',
          2: 'Financial stability, material security, and self-worth',
          3: 'Communication, learning, and social connections',
          4: 'Home, family, and emotional foundations',
          5: 'Creativity, romance, and self-expression',
          6: 'Health, service, and daily routines',
          7: 'Partnerships, relationships, and cooperation',
          8: 'Transformation, shared resources, and deep psychological work',
          9: 'Wisdom, travel, and philosophical expansion',
          10: 'Career, reputation, and life direction',
          11: 'Community, friendships, and future vision',
          12: 'Spirituality, endings, and inner work'
        };
        dominantThemes.push(sunThemes[sunSign] || 'Personal growth and development');
      }

      // Moon position indicates emotional focus
      if (planetaryPositions.moon) {
        const moonSign = planetaryPositions.moon.sign;
        const moonThemes = {
          1: 'Emotional independence and self-reliance',
          2: 'Financial and material comfort needs',
          3: 'Communication and mental stimulation',
          4: 'Family and home security',
          5: 'Creative expression and joy',
          6: 'Health and service to others',
          7: 'Relationship harmony and balance',
          8: 'Deep emotional transformation',
          9: 'Spiritual and philosophical exploration',
          10: 'Career and public recognition',
          11: 'Social connections and community',
          12: 'Spiritual retreat and inner peace'
        };
        dominantThemes.push(`Emotional focus: ${moonThemes[moonSign] || 'Emotional processing'}`);
      }

      // Analyze angular planets (powerful influences)
      const angularHouses = [1, 4, 7, 10];
      for (const planet of planetList) {
        const position = planetaryPositions[planet];
        if (position) {
          const house = this._getHouseFromLongitude(position.longitude, houses.house);
          if (angularHouses.includes(house)) {
            opportunities.push(`${planet.charAt(0).toUpperCase() + planet.slice(1)} in ${house}th house: ${this._interpretAngularPlanet(planet, house)}`);
          }
        }
      }

      // Identify potential challenges
      const challengingAspects = majorAspects.filter(aspect =>
        aspect.aspect === 'Square' || aspect.aspect === 'Opposition'
      );

      if (challengingAspects.length > 0) {
        challenges.push('Growth through challenges and learning experiences');
        challengingAspects.slice(0, 2).forEach(aspect => {
          challenges.push(`${aspect.planets.join('/')} ${aspect.aspect.toLowerCase()}: Integration of opposing energies`);
        });
      }

      // Generate comprehensive summary
      let summary = `🌞 *Solar Return for Age ${ageAtReturn}*\n\n`;
      summary += `*Solar Return Date:* ${solarReturnDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}\n\n`;

      summary += '*Dominant Themes:*\n';
      dominantThemes.forEach(theme => {
        summary += `• ${theme}\n`;
      });
      summary += '\n';

      if (opportunities.length > 0) {
        summary += '*Key Opportunities:*\n';
        opportunities.slice(0, 3).forEach(opp => {
          summary += `• ${opp}\n`;
        });
        summary += '\n';
      }

      if (challenges.length > 0) {
        summary += '*Areas for Growth:*\n';
        challenges.forEach(challenge => {
          summary += `• ${challenge}\n`;
        });
        summary += '\n';
      }

      summary += `*Solar Return Sun:* ${planetaryPositions.sun ? planetaryPositions.sun.signName : 'Unknown'}\n`;
      summary += `*Solar Return Moon:* ${planetaryPositions.moon ? planetaryPositions.moon.signName : 'Unknown'}\n`;
      summary += `*Rising Sign:* ${this._getVedicSignName(Math.floor(houses.house[0] / 30) + 1)}\n\n`;

      summary += '*What This Means:*\n';
      summary += `Your solar return chart reveals the cosmic blueprint for your ${ageAtReturn + 1}th year. `;
      summary += 'The planetary positions show the energies and themes that will influence your life. ';
      summary += 'Pay attention to the angular planets and major aspects for timing of important events.\n\n';

      summary += '*Practical Applications:*\n';
      summary += '• Use this year to focus on the dominant themes indicated\n';
      summary += '• Take advantage of opportunities when transits activate solar return planets\n';
      summary += '• Address challenges as opportunities for growth\n';
      summary += '• Review progress at your next birthday\n\n';

      summary += 'Your solar return illuminates the path ahead! ✨';

      return {
        solarReturnDate: solarReturnDate.toISOString(),
        ageAtReturn,
        solarReturnChart: {
          date: solarReturnDate.toISOString(),
          location: returnPlace,
          coordinates: { latitude: returnLat, longitude: returnLon }
        },
        dominantThemes,
        opportunities,
        challenges,
        houseCusps: {
          ascendant: houses.house[0],
          mc: houses.house[9],
          descendant: houses.house[6],
          ic: houses.house[3]
        },
        planetaryPositions,
        majorAspects: majorAspects.slice(0, 5), // Top 5 aspects
        summary
      };
    } catch (error) {
      logger.error('Error calculating solar return:', error);
      return {
        error: `Solar return calculation failed: ${error.message}`,
        targetYear
      };
    }
  }

  /**
   * Get house position from longitude and house cusps
   * @private
   * @param {number} longitude - Planetary longitude
   * @param {Array} houseCusps - House cusp longitudes
   * @returns {number} House number (1-12)
   */
  _getHouseFromLongitude(longitude, houseCusps) {
    for (let house = 1; house <= 12; house++) {
      const nextHouse = house === 12 ? 1 : house + 1;
      const currentCusp = houseCusps[house - 1];
      const nextCusp = houseCusps[nextHouse - 1] || (houseCusps[0] + 360);

      if (house === 1) {
        // Special handling for 1st house (between 12th and 1st cusp)
        const twelfthCusp = houseCusps[11];
        if (longitude >= twelfthCusp || longitude < currentCusp) {
          return 1;
        }
      } else if (longitude >= currentCusp && longitude < nextCusp) {
        return house;
      }
    }
    return 1; // Default to 1st house
  }

  /**
   * Interpret angular planet placement
   * @private
   * @param {string} planet - Planet name
   * @param {number} house - House number
   * @returns {string} Interpretation
   */
  _interpretAngularPlanet(planet, house) {
    const interpretations = {
      sun: {
        1: 'Strong personal identity and self-expression',
        4: 'Focus on home and family foundations',
        7: 'Emphasis on partnerships and relationships',
        10: 'Career advancement and public recognition'
      },
      moon: {
        1: 'Emotional sensitivity and intuitive guidance',
        4: 'Deep connection to family and roots',
        7: 'Emotional partnerships and close relationships',
        10: 'Public emotional expression and nurturing career'
      },
      mercury: {
        1: 'Strong communication and mental agility',
        4: 'Focus on education and intellectual home environment',
        7: 'Important partnerships through communication',
        10: 'Career in communication, writing, or teaching'
      },
      venus: {
        1: 'Charm, beauty, and social grace',
        4: 'Harmony in home and family relationships',
        7: 'Significant romantic partnerships',
        10: 'Career in arts, beauty, or relationships'
      },
      mars: {
        1: 'Strong drive and initiative',
        4: 'Energy directed toward home and security',
        7: 'Dynamic partnerships and competition',
        10: 'Ambitious career pursuits'
      },
      jupiter: {
        1: 'Optimism and personal growth',
        4: 'Expansion of home and family',
        7: 'Growth through partnerships',
        10: 'Career expansion and success'
      },
      saturn: {
        1: 'Discipline and responsibility',
        4: 'Building solid foundations',
        7: 'Long-term committed relationships',
        10: 'Career discipline and achievement'
      }
    };

    return interpretations[planet]?.[house] || `${planet} brings focus and importance to ${house}th house matters`;
  }

  /**
   * Calculate Nakshatra for a given longitude
   * @param {number} longitude - Longitude in degrees
   * @returns {Object} Nakshatra details
   */
  calculateNakshatra(longitude) {
    return this.vedicCalculator.calculateNakshatra(longitude);
  }
    // Normalize longitude to 0-360
    longitude = ((longitude % 360) + 360) % 360;

    // Each Nakshatra is 13°20' = 13.333°
    const nakshatraSize = 13.333333;
    const padaSize = nakshatraSize / 4; // 3°20' per Pada

    const nakshatras = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
      'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
      'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
      'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];

    const lords = [
      'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
      'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun',
      'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
      'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
      'Jupiter', 'Saturn', 'Mercury'
    ];

    const index = Math.floor(longitude / nakshatraSize);
    const nakshatra = nakshatras[index];
    const lord = lords[index];

    // Calculate Pada (1-4)
    const positionInNakshatra = longitude - (index * nakshatraSize);
    const pada = Math.floor(positionInNakshatra / padaSize) + 1;

    return {
      nakshatra,
      lord,
      pada,
      degree: longitude
    };
  }

  /**
   * Calculate Nakshatra Porutham (compatibility) for marriage
   * @param {Object} person1 - First person's birth data
   * @param {Object} person2 - Second person's birth data
   * @returns {Object} Compatibility analysis
   */
  calculateNakshatraPorutham(person1, person2) {
    return this.vedicCalculator.calculateNakshatraPorutham(person1, person2);
  }
    try {
      // Get Moon longitudes (Nakshatra is based on Moon)
      const moon1 = person1.moonLongitude || 0;
      const moon2 = person2.moonLongitude || 0;

      const nakshatra1 = this.calculateNakshatra(moon1);
      const nakshatra2 = this.calculateNakshatra(moon2);

      // Simplified compatibility matrix (traditional rules)
      const compatibility = this._checkNakshatraCompatibility(nakshatra1.nakshatra, nakshatra2.nakshatra);

      return {
        person1: {
          nakshatra: nakshatra1.nakshatra,
          lord: nakshatra1.lord,
          pada: nakshatra1.pada
        },
        person2: {
          nakshatra: nakshatra2.nakshatra,
          lord: nakshatra2.lord,
          pada: nakshatra2.pada
        },
        compatibility: compatibility.rating,
        description: compatibility.description
      };
    } catch (error) {
      return {
        error: 'Unable to calculate Nakshatra Porutham',
        compatibility: 'Unknown'
      };
    }
  }

  /**
   * Check Nakshatra compatibility based on traditional rules
   * @private
   * @param {string} nak1 - First Nakshatra
   * @param {string} nak2 - Second Nakshatra
   * @returns {Object} Rating and description
   */
  _checkNakshatraCompatibility(nak1, nak2) {
    // Simplified compatibility (in reality, this is complex with 27x27 matrix)
    // For demo, use basic rules
    const compatiblePairs = [
      ['Rohini', 'Hasta'], ['Mrigashira', 'Chitra'], ['Ardra', 'Swati'],
      ['Punarvasu', 'Vishakha'], ['Pushya', 'Anuradha'], ['Ashlesha', 'Jyeshtha'],
      ['Magha', 'Mula'], ['Purva Phalguni', 'Purva Ashadha'], ['Uttara Phalguni', 'Uttara Ashadha']
    ];

    const isCompatible = compatiblePairs.some(([a, b]) =>
      (nak1 === a && nak2 === b) || (nak1 === b && nak2 === a)
    );

    if (isCompatible) {
      return {
        rating: 'Excellent',
        description: `${nak1} and ${nak2} have excellent Nakshatra compatibility for marriage.`
      };
    }

    // Default neutral
    return {
      rating: 'Neutral',
      description: `${nak1} and ${nak2} have neutral Nakshatra compatibility. Consult a priest for detailed analysis.`
    };
  }
}

module.exports = new VedicCalculator();

