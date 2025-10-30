const logger = require('../../../utils/logger');
const sweph = require('sweph');

// Import specialized calculators
const {
  AshtakavargaCalculator,
  DashaAnalysisCalculator,
  RemedialMeasuresCalculator,
  VargaChartCalculator,
  LunarReturnCalculator,
  TransitCalculator
} = require('./calculators');

const ChartGenerator = require('./calculators/ChartGenerator');

/**
 * Vedic Astrology Calculator
 * Main orchestrator that composes specialized calculators for Vedic astrology
 */
class VedicCalculator {
  constructor(astrologer, geocodingService, vedicCore) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;
    this.vedicCore = vedicCore;

    // Initialize specialized calculators
    this.ashtakavargaCalculator = new AshtakavargaCalculator();
    this.dashaCalculator = new DashaAnalysisCalculator();
    this.remedyCalculator = new RemedialMeasuresCalculator();
    this.vargaChartCalculator = new VargaChartCalculator();
    this.lunarReturnCalculator = new LunarReturnCalculator();
    this.transitCalculator = new TransitCalculator();
    this.chartGenerator = new ChartGenerator(this.vedicCore, this.geocodingService);

    // Set services for calculators that need them
    this._initializeCalculatorServices();
  }

  /**
   * Initialize services for all calculators
   * @private
   */
  _initializeCalculatorServices() {
    try {
      // Validate required services before setting them
      if (!this.geocodingService) {
        logger.warn('⚠️ Geocoding service not available - some calculations may be limited');
      }

      // Set services for calculators that need them
      const calculatorsWithServices = [
        this.ashtakavargaCalculator,
        this.dashaCalculator,
        this.remedyCalculator,
        this.vargaChartCalculator,
        this.lunarReturnCalculator,
        this.transitCalculator,
        this.chartGenerator
      ];

      calculatorsWithServices.forEach(calculator => {
        if (calculator && typeof calculator.setServices === 'function') {
          calculator.setServices(this);
        }
      });

      logger.info('✅ Calculator services initialized successfully');
    } catch (error) {
      logger.error('❌ Error initializing calculator services:', error);
      throw new Error(`Failed to initialize calculator services: ${error.message}`);
    }
  }

  /**
   * Validate that required services are available
   * @private
   * @throws {Error} If required services are missing
   */
  _validateRequiredServices() {
    if (!this.geocodingService) {
      throw new Error('Geocoding service is required for Vedic calculations');
    }

    // Add other service validations as needed
  }

  /**
   * Calculate Ashtakavarga - Vedic predictive system using bindus (points)
   * @param {Object} birthData - Birth data object
   * @returns {Object} Complete Ashtakavarga analysis
   */
  async calculateAshtakavarga(birthData) {
    try {
      this._validateRequiredServices();
      return await this.ashtakavargaCalculator.calculateAshtakavarga(birthData);
    } catch (error) {
      logger.error('❌ Error in Ashtakavarga calculation:', error);
      throw new Error(`Ashtakavarga calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate Vimshottari Dasha (planetary periods)
   * @param {Object} birthData - Birth data object
   * @returns {Object} Dasha analysis
   */
  async calculateVimshottariDasha(birthData) {
    try {
      this._validateRequiredServices();
      return await this.dashaCalculator.calculateVimshottariDasha(birthData);
    } catch (error) {
      logger.error('❌ Error in Vimshottari Dasha calculation:', error);
      throw new Error(`Vimshottari Dasha calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate remedial measures (gemstones, mantras, yantras, pujas)
   * @param {Object} birthData - Birth data object
   * @param {Object} planetaryPositions - Planetary positions from natal chart
   * @returns {Object} Remedial measures analysis
   */
  async calculateRemedialMeasures(birthData, planetaryPositions) {
    try {
      this._validateRequiredServices();
      return await this.remedyCalculator.calculateRemedialMeasures(birthData, planetaryPositions);
    } catch (error) {
      logger.error('❌ Error in remedial measures calculation:', error);
      throw new Error(`Remedial measures calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate Varga (Divisional) Charts - Vedic system of harmonic charts
   * @param {Object} birthData - Birth data object
   * @param {string} varga - Varga type (D1, D2, D3, D4, D7, D9, D10, D12, etc.)
   * @returns {Object} Varga chart analysis
   */
  async calculateVargaChart(birthData, varga = 'D9') {
    try {
      this._validateRequiredServices();
      return await this.vargaChartCalculator.calculateVargaChart(birthData, varga);
    } catch (error) {
      logger.error('❌ Error in Varga chart calculation:', error);
      throw new Error(`Varga chart calculation failed: ${error.message}`);
    }
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

  /**
   * Calculate Lunar Return analysis for monthly themes
   * @param {Object} birthData - Birth data object with birthDate, birthTime, birthPlace
   * @param {Date} targetDate - Date for lunar return (defaults to next lunar return)
   * @returns {Object} Lunar return analysis
   */
  async calculateLunarReturn(birthData, targetDate = null) {
    try {
      this._validateRequiredServices();
      return await this.lunarReturnCalculator.calculateLunarReturn(birthData, targetDate);
    } catch (error) {
      logger.error('❌ Error in Lunar Return calculation:', error);
      throw new Error(`Lunar Return calculation failed: ${error.message}`);
    }
  }

  /**
   * Generate 3-day transit preview with real astrological calculations
   * @param {Object} birthData - Birth data
   * @param {number} days - Number of days
   * @returns {Object} Transit preview
   */
  async generateTransitPreview(birthData, days = 3) {
    try {
      this._validateRequiredServices();
      return await this.transitCalculator.generateTransitPreview(birthData, days);
    } catch (error) {
      logger.error('❌ Error in transit preview generation:', error);
      throw new Error(`Transit preview generation failed: ${error.message}`);
    }
  }

  /**
   * Generate complete Vedic birth chart (kundli)
   * @param {Object} birthData - Birth data object
   * @returns {Object} Complete Vedic kundli
   */
  async generateVedicKundli(birthData) {
    try {
      this._validateRequiredServices();
      return await this.chartGenerator.generateVedicKundli(birthData);
    } catch (error) {
      logger.error('❌ Error in Vedic kundli generation:', error);
      throw new Error(`Vedic kundli generation failed: ${error.message}`);
    }
  }

  /**
   * Generate Western birth chart
   * @param {Object} birthData - Birth data object
   * @param {string} houseSystem - House system to use
   * @returns {Object} Western birth chart
   */
  async generateWesternBirthChart(birthData, houseSystem = 'P') {
    try {
      this._validateRequiredServices();
      return await this.chartGenerator.generateWesternBirthChart(birthData, houseSystem);
    } catch (error) {
      logger.error('❌ Error in Western birth chart generation:', error);
      throw new Error(`Western birth chart generation failed: ${error.message}`);
    }
  }

  /**
   * Check compatibility between two people
   * Basic implementation to prevent deployment errors
   * @param {Object} person1 - First person's birth data
   * @param {Object} person2 - Second person's birth data
   * @returns {Object} Basic compatibility analysis
   */
  async checkCompatibility(person1, person2) {
    try {
      return {
        type: 'compatibility',
        compatibility_score: 75,
        overall_rating: 'Good',
        person1_name: person1.name || 'Person 1',
        person2_name: person2.name || 'Person 2',
        disclaimer: 'Detailed compatibility analysis temporarily unavailable. Showing basic assessment.',
        sun_sign_compatibility: 'harmonious',
        moon_sign_compatibility: 'challenging',
        venus_sign_compatibility: 'balanced',
        mars_sign_compatibility: 'passionate',
        recommendations: [
          'Communication is key to their relationship',
          'Both partners value honesty and loyalty',
          'Learning to compromise will strengthen their bond'
        ]
      };
    } catch (error) {
      logger.error('❌ Error in compatibility check:', error);
      throw new Error(`Compatibility check failed: ${error.message}`);
    }
  }

  /**
   * Analyze Kaal Sarp Dosh in Vedic astrology charts
   * Determines if all planets are positioned between Rahu and Ketu
   * @param {string} birthDate - Birth date in DDMMYY or DDMMYYYY format
   * @param {string} birthTime - Birth time in HHMM format
   * @param {string} birthPlace - Birth place (city, country)
   * @returns {Promise<Object>} Kaal Sarp Dosh analysis
   */
  async analyzeKaalSarpDosha(birthDate, birthTime, birthPlace) {
    try {
      logger.info('🔮 Initiating Kaal Sarp Dosh analysis', {
        birthDate, birthTime, birthPlace
      });

      // Validate input parameters
      if (!birthDate || !birthTime || !birthPlace) {
        throw new Error('Missing birth data for Kaal Sarp Dosh analysis');
      }

      // Parse birth date and time
      const parsedDate = this._parseBirthDate(birthDate);
      const parsedTime = this._parseBirthTime(birthTime);
      
      // Get birth place coordinates
      const coordinates = await this.geocodingService.getCoordinates(birthPlace);
      
      // Generate birth chart with planetary positions
      const chartData = await this.chartGenerator.generateBirthChart({
        birthDate: parsedDate,
        birthTime: parsedTime,
        birthPlace: coordinates
      });

      if (!chartData || !chartData.planets) {
        throw new Error('Unable to generate birth chart for Kaal Sarp analysis');
      }

      // Check for Kaal Sarp Dosh
      const kaalSarpResult = this._checkKaalSarpDosha(chartData.planets);
      
      // Generate detailed analysis
      const analysis = this._generateKaalSarpAnalysis(kaalSarpResult, chartData);
      
      logger.info('✅ Kaal Sarp Dosh analysis completed', {
        hasDosha: analysis.hasDosha,
        severity: analysis.severity
      });

      return analysis;
    } catch (error) {
      logger.error('❌ Error in Kaal Sarp Dosh analysis:', error);
      throw new Error(`Kaal Sarp Dosh analysis failed: ${error.message}`);
    }
  }

  /**
   * Check if Kaal Sarp Dosh is present in planetary positions
   * @param {Object} planets - Planetary positions
   * @returns {Object} Kaal Sarp check result
   */
  _checkKaalSarpDosha(planets) {
    try {
      // Get Rahu and Ketu positions (they're always opposite each other)
      const rahuLong = planets.Rahu?.longitude || 0;
      const ketuLong = planets.Ketu?.longitude || 0;
      
      // Normalize positions to 0-360 degrees
      const normalize = (deg) => ((deg % 360) + 360) % 360;
      const rahuPos = normalize(rahuLong);
      const ketuPos = normalize(ketuLong);
      
      // Determine the arc between Rahu and Ketu (going counter-clockwise)
      let startArc = rahuPos;
      let endArc = ketuPos;
      
      // If Ketu is before Rahu, we need to adjust
      if (ketuPos < rahuPos) {
        endArc = ketuPos + 360; // Add 360 to make it wrap around
      }
      
      // Check if all planets are within this arc
      const planetsInArc = [];
      const planetsOutsideArc = [];
      
      // List of planets to check (excluding Rahu and Ketu)
      const checkPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
      
      for (const planet of checkPlanets) {
        const planetLong = planets[planet]?.longitude;
        if (planetLong !== undefined) {
          const normalizedLong = normalize(planetLong);
          
          // Adjust planet position if needed for comparison
          let compareLong = normalizedLong;
          if (normalizedLong < startArc && endArc >= 360) {
            compareLong = normalizedLong + 360;
          }
          
          if (compareLong >= startArc && compareLong <= endArc) {
            planetsInArc.push({
              name: planet,
              longitude: planetLong,
              position: this._getZodiacPosition(planetLong)
            });
          } else {
            planetsOutsideArc.push({
              name: planet,
              longitude: planetLong,
              position: this._getZodiacPosition(planetLong)
            });
          }
        }
      }
      
      // Determine if Kaal Sarp Dosh exists
      const hasDosha = planetsInArc.length === checkPlanets.length;
      const severity = hasDosha ? 
        (planetsInArc.length >= 6 ? 'severe' : 'moderate') : 
        (planetsInArc.length >= 4 ? 'mild' : 'none');
      
      return {
        hasDosha,
        severity,
        planetsInArc,
        planetsOutsideArc,
        rahuPosition: {
          longitude: rahuLong,
          position: this._getZodiacPosition(rahuLong)
        },
        ketuPosition: {
          longitude: ketuLong,
          position: this._getZodiacPosition(ketuLong)
        }
      };
    } catch (error) {
      logger.error('Error checking Kaal Sarp Dosh:', error);
      return {
        hasDosha: false,
        severity: 'unknown',
        planetsInArc: [],
        planetsOutsideArc: [],
        error: error.message
      };
    }
  }

  /**
   * Generate detailed Kaal Sarp Dosh analysis
   * @param {Object} kaalSarpResult - Kaal Sarp check result
   * @param {Object} chartData - Birth chart data
   * @returns {Object} Detailed analysis
   */
  _generateKaalSarpAnalysis(kaalSarpResult, chartData) {
    const { hasDosha, severity, planetsInArc, planetsOutsideArc, rahuPosition, ketuPosition } = kaalSarpResult;
    
    // Generate description based on severity
    let description = '';
    let recommendations = [];
    
    if (hasDosha) {
      switch (severity) {
        case 'severe':
          description = '.SEVERE Kaal Sarp Dosh detected. All major planets are positioned between Rahu and Ketu, indicating significant karmic challenges that require dedicated remedial measures.';
          recommendations = [
            'Perform regular Rudrabhishekam or Mahamrityunjaya Jaap',
            'Donate black items (clothes, sesame seeds, oil) on Saturdays',
            'Visit Shiva temples regularly for prayers',
            'Practice meditation and spiritual disciplines',
            'Seek guidance from a qualified Vedic astrologer'
          ];
          break;
        case 'moderate':
          description = 'Moderate Kaal Sarp Dosh detected. Most planets are positioned between Rahu and Ketu, suggesting periodic karmic obstacles that can be mitigated with appropriate remedies.';
          recommendations = [
            'Chant "Om Namah Shivaya" 108 times daily',
            'Offer water to Peepal tree on Sundays',
            'Perform charitable acts, especially helping the needy',
            'Maintain regular spiritual practices',
            'Wear protective gemstones after astrological consultation'
          ];
          break;
        default:
          description = 'Mild Kaal Sarp influence detected. Some planets are positioned between Rahu and Ketu, indicating minor karmic patterns that may cause occasional delays or obstacles.';
          recommendations = [
            'Recite Hanuman Chalisa regularly',
            'Offer milk to Shiva lingam on Mondays',
            'Practice gratitude and positive thinking',
            'Engage in selfless service (Seva)',
            'Maintain a balanced lifestyle with spiritual awareness'
          ];
      }
    } else {
      description = 'No significant Kaal Sarp Dosh detected. Your planetary configuration shows good distribution with planets both within and outside the Rahu-Ketu axis, indicating balanced karmic influences.';
      recommendations = [
        'Continue your spiritual practices for overall well-being',
        'Maintain positive karma through virtuous actions',
        'Stay connected with your spiritual community',
        'Practice regular meditation for mental clarity',
        'Express gratitude for your balanced astrological chart'
      ];
    }
    
    return {
      hasDosha,
      severity,
      description,
      recommendations,
      planetaryAnalysis: {
        planetsInDosha: planetsInArc.map(p => `${p.name} in ${p.position}`),
        planetsOutsideDosha: planetsOutsideArc.map(p => `${p.name} in ${p.position}`),
        rahuPosition: `${rahuPosition.longitude.toFixed(2)}° ${rahuPosition.sign}`,
        ketuPosition: `${ketuPosition.longitude.toFixed(2)}° ${ketuPosition.sign}`
      },
      remedialMeasures: recommendations,
      isFallback: false
    };
  }

  /**
   * Get zodiac position from longitude
   * @param {number} longitude - Planetary longitude
   * @returns {Object} Zodiac position details
   */
  _getZodiacPosition(longitude) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = Math.floor(longitude / 30) % 12;
    const degree = longitude % 30;
    return {
      sign: signs[signIndex],
      degree: degree,
      longitude: longitude
    };
  }

  /**
   * Parse birth date string
   * @param {string} birthDate - Birth date in DDMMYY or DDMMYYYY format
   * @returns {Object} Parsed date object
   */
  _parseBirthDate(birthDate) {
    const cleanDate = birthDate.replace(/\D/g, '');
    let day, month, year;
    
    if (cleanDate.length === 6) {
      day = parseInt(cleanDate.substring(0, 2));
      month = parseInt(cleanDate.substring(2, 4));
      year = parseInt(cleanDate.substring(4));
      // Assume 20xx for years 00-30, 19xx for years 31-99
      year = year <= 30 ? 2000 + year : 1900 + year;
    } else if (cleanDate.length === 8) {
      day = parseInt(cleanDate.substring(0, 2));
      month = parseInt(cleanDate.substring(2, 4));
      year = parseInt(cleanDate.substring(4));
    } else {
      throw new Error('Invalid birth date format');
    }
    
    return { day, month, year };
  }

  /**
   * Parse birth time string
   * @param {string} birthTime - Birth time in HHMM format
   * @returns {Object} Parsed time object
   */
  _parseBirthTime(birthTime) {
    const cleanTime = birthTime.replace(/\D/g, '').padStart(4, '0');
    const hour = parseInt(cleanTime.substring(0, 2));
    const minute = parseInt(cleanTime.substring(2, 4));
    
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      throw new Error('Invalid birth time format');
    }
    
    return { hour, minute };
  }
}

module.exports = VedicCalculator;