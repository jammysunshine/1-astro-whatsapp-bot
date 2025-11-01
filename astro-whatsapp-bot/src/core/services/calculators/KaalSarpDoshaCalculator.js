const logger = require('../../../../utils/logger');
const sweph = require('sweph');

/**
 * Kaal Sarp Dosha Calculator
 * Analyzes the positioning of Rahu and Ketu in relation to other planets
 * Kaal Sarp Dosha occurs when all planets are positioned between Rahu and Ketu
 */
class KaalSarpDoshaCalculator {
  constructor(astrologer, geocodingService) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;

    // Define Kaal Sarp Yoga types and their effects
    this.kaalSarpTypes = {
      anant: { rahuDirection: 'East', effects: 'Strongest Kaal Sarp, deception and family problems', remedy: 'Anant Nag puja, gold donation' },
      gulika: { rahuDirection: 'South', effects: 'Health issues and accidents', remedy: 'Gulika puja, medicinal herbs' },
      vasuki: { rahuDirection: 'South-West', effects: 'Marital discord and relationships', remedy: 'Vasuki puja, devotion to Shiva' },
      sankhapal: { rahuDirection: 'West', effects: 'Financial losses and poverty', remedy: 'Sankhapal puja, white marble items' },
      padma: { rahuDirection: 'North-West', effects: 'Spiritual confusion and lack of peace', remedy: 'Padma puja, meditation' },
      mahapadma: { rahuDirection: 'North', effects: 'Political or leadership challenges', remedy: 'Mahapadma puja, charity to priests' },
      takshak: { rahuDirection: 'North-East', effects: 'Sudden losses and fear', remedy: 'Takshak puja, snake protection rituals' },
      karkotak: { rahuDirection: 'East with strong Saturn', effects: 'Severe diseases and cancers', remedy: 'Karkotak puja, medical treatments' },
      shankhchood: { rahuDirection: 'South with strong Mars', effects: 'Extreme poverty and servitude', remedy: 'Shankhchood puja, silver donation' },
      ghatak: { rahuDirection: 'Variable negative influence', effects: 'Life-threatening situations', remedy: 'Ghatak puja, life-saving rituals' },
      vishdhar: { rahuDirection: 'Variable', effects: 'Financial ruin and debts', remedy: 'Vishdhar puja, water-related rituals' },
      sheshnaag: { rahuDirection: 'Beneficial direction', effects: 'Mild but can cause confusion', remedy: 'Sheshnaag puja, sesame seeds' }
    };
  }

  /**
   * Set services for the calculator
   * @param {Object} services - Service object containing other calculators
   */
  setServices(services) {
    this.services = services;
  }

  /**
   * Analyze Kaal Sarp Dosha in the birth chart
   * @param {Object} birthData - Birth data object
   * @returns {Object} Kaal Sarp Dosha analysis
   */
  async generateKaalSarpDosha(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return { error: 'Complete birth details required for Kaal Sarp analysis' };
      }

      // Parse birth date and time
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Calculate natal chart
      const natalChart = await this._calculateNatalChart(year, month, day, hour, minute, latitude, longitude, timezone);

      // Check for Kaal Sarp Dosha
      const kaalSarpAnalysis = this._analyzeKaalSarp(natalChart.planets);

      // Analyze dosha strength and effects
      const doshaStrength = this._calculateDoshaStrength(kaalSarpAnalysis, natalChart.planets);
      const effects = this._analyzeDoshaEffects(doshaStrength, kaalSarpAnalysis.kaalSarpType);

      // Calculate remedial measures
      const remedies = this._calculateRemedialMeasures(kaalSarpAnalysis.kaalSarpType, doshaStrength);

      // Check for exceptions and cancellations
      const exceptions = this._checkExceptionsAndCancellations(natalChart.planets, kaalSarpAnalysis);

      // Generate predictions
      const predictions = this._generateKaalSarpPredictions(kaalSarpAnalysis, doshaStrength, exceptions);

      return {
        name,
        hasKaalSarpDosha: kaalSarpAnalysis.hasDosha,
        kaalSarpType: kaalSarpAnalysis.kaalSarpType,
        doshaStrength,
        rahuPosition: kaalSarpAnalysis.rahuPosition,
        ketuPosition: kaalSarpAnalysis.ketuPosition,
        planetaryHemmed: kaalSarpAnalysis.planetaryHemmed,
        effects,
        remedies,
        exceptions,
        predictions,
        summary: this._generateKaalSarpSummary(kaalSarpAnalysis, doshaStrength, exceptions)
      };
    } catch (error) {
      logger.error('❌ Error in Kaal Sarp Dosha calculation:', error);
      throw new Error(`Kaal Sarp Dosha calculation failed: ${error.message}`);
    }
  }

  /**
   * Analyze if Kaal Sarp Dosha is present
   * @private
   */
  _analyzeKaalSarp(planets) {
    const analysis = {
      hasDosha: false,
      rahuPosition: { longitude: 0, sign: 0 },
      ketuPosition: { longitude: 0, sign: 0 },
      kaalSarpType: null,
      planetaryHemmed: []
    };

    // Get Rahu and Ketu positions
    const rahu = planets.rahu;
    const ketu = planets.ketu;

    if (!rahu || !ketu) {
      return analysis; // Can't analyze without Rahu/Ketu positions
    }

    analysis.rahuPosition = rahu;
    analysis.ketuPosition = ketu;

    // Calculate the arc between Rahu and Ketu (considering the shorter arc)
    let arcBetween = Math.abs(rahu.longitude - ketu.longitude);
    arcBetween = Math.min(arcBetween, 360 - arcBetween);

    // Kaal Sarp Dosha occurs when all planets are between Rahu and Ketu
    // This means the arc between Rahu and Ketu should contain all other planets
    const rahuKetuAxis = this._getRahuKetuAxis(rahu, ketu);

    // Check which planets are "hemmed" between Rahu and Ketu
    Object.entries(planets).forEach(([planetName, planet]) => {
      if (planetName !== 'rahu' && planetName !== 'ketu' && planetName !== 'ascendant') {
        const isHemmed = this._isPlanetHemmedBetween(planet.longitude, rahuKetuAxis.rahu, rahuKetuAxis.ketu, rahuKetuAxis.clockwise);

        if (isHemmed) {
          analysis.planetaryHemmed.push(planetName);
        }
      }
    });

    // Determine if Kaal Sarp Dosha is present
    const allPlanetsHemmed = analysis.planetaryHemmed.length === 7; // 7 planets: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn

    if (allPlanetsHemmed) {
      analysis.hasDosha = true;
      analysis.kaalSarpType = this._determineKaalSarpType(rahu);

      // Determine the direction and type
      analysis.doshaDirection = this._determineDoshaDirection(rahu, ketu);
    }

    return analysis;
  }

  /**
   * Get the Rahu-Ketu axis details
   * @private
   */
  _getRahuKetuAxis(rahu, ketu) {
    const rahuLong = rahu.longitude;
    const ketuLong = ketu.longitude;

    // Check which direction has shorter arc
    const clockwiseArc = (ketuLong - rahuLong + 360) % 360;
    const counterClockwiseArc = (rahuLong - ketuLong + 360) % 360;

    const clockwise = clockwiseArc <= counterClockwiseArc;

    return {
      rahu: rahuLong,
      ketu: ketuLong,
      clockwise: clockwise,
      arc: clockwise ? clockwiseArc : counterClockwiseArc
    };
  }

  /**
   * Check if a planet is hemmed between Rahu and Ketu
   * @private
   */
  _isPlanetHemmedBetween(planetLong, rahuLong, ketuLong, clockwise) {
    // Normalize all longitudes to 0-360 range
    planetLong = (planetLong + 360) % 360;
    rahuLong = (rahuLong + 360) % 360;
    ketuLong = (ketuLong + 360) % 360;

    if (clockwise) {
      // Check if planet is between Rahu and Ketu going clockwise
      if (rahuLong < ketuLong) {
        return planetLong >= rahuLong && planetLong <= ketuLong;
      } else {
        // Rahu is before the 0° point, Ketu is after
        return planetLong >= rahuLong || planetLong <= ketuLong;
      }
    } else {
      // Counter-clockwise check
      if (ketuLong < rahuLong) {
        return planetLong >= ketuLong && planetLong <= rahuLong;
      } else {
        // Similar cross-0° point logic
        return planetLong >= ketuLong || planetLong <= rahuLong;
      }
    }
  }

  /**
   * Determine the specific type of Kaal Sarp Dosha
   * @private
   */
  _determineKaalSarpType(rahu) {
    const rahuSign = rahu.sign;
    const rahuDegree = rahu.degree;

    // Different Kaal Sarp types based on Rahu's position
    if (rahuSign >= 1 && rahuSign <= 3.20) { // Aries 0° to Cancer 20°
      return 'Anant Kaal Sarp';
    } else if (rahuSign <= 4 && rahuDegree < 13.20) { // Cancer 20° to Leo 13.20°
      return 'Kulik Kaal Sarp';
    } else if (rahuSign <= 5 && rahuDegree < 6.40) { // Leo 13.20° to Virgo 6.40°
      return 'Vasuki Kaal Sarp';
    } else if (rahuSign <= 6 && rahuDegree < 7.6) { // Virgo 6.40° to Libra 7.6°
      return 'Sankhapal Kaal Sarp';
    } else if (rahuSign <= 7 && rahuDegree < 21.6) { // Libra 7.6° to Scorpio 21.6°
      return 'Padma Kaal Sarp';
    } else if (rahuSign <= 9 && rahuDegree < 3.20) { // Scorpio 21.6° to Sagittarius 3.20°
      return 'Mahapadma Kaal Sarp';
    } else if (rahuSign <= 10 && rahuDegree < 20) { // Sagittarius 3.20° to Capricorn 20°
      return 'Takshak Kaal Sarp';
    } else if (rahuSign <= 11 && rahuDegree < 13.20) { // Capricorn 20° to Aquarius 13.20°
      return 'Karkotak Kaal Sarp';
    } else if (rahuSign <= 12 && rahuDegree < 6.40) { // Aquarius 13.20° to Pisces 6.40°
      return 'Shankhchood Kaal Sarp';
    } else if (rahuSign === 12 || rahuSign <= 1 && rahuDegree < 7.6) { // Pisces 6.40° to Aries 7.6°
      return 'Ghatak Kaal Sarp';
    } else if (rahuSign <= 2 && rahuDegree < 21.6) { // Aries 7.6° to Taurus 21.6°
      return 'Vishdhar Kaal Sarp';
    } else {
      return 'Sheshnaag Kaal Sarp'; // Any remaining positions
    }
  }

  /**
   * Determine dosha direction
   * @private
   */
  _determineDoshaDirection(rahu, ketu) {
    const rahuSign = Math.floor(rahu.longitude / 30) + 1;
    const ketuSign = Math.floor(ketu.longitude / 30) + 1;

    if (rahuSign >= 1 && rahuSign <= 4) return 'East';
    if (rahuSign >= 5 && rahuSign <= 8) return 'South';
    if (rahuSign >= 9 && rahuSign <= 12) return 'West';
    if (ketuSign >= 1 && ketuSign <= 4) return 'North';
    return 'Neutral';
  }

  /**
   * Calculate the strength of Kaal Sarp Dosha
   * @private
   */
  _calculateDoshaStrength(kaalSarpAnalysis, planets) {
    let strength = 0;

    if (!kaalSarpAnalysis.hasDosha) {
      return { total: 0, level: 'None', percentage: 0 };
    }

    // Base strength from complete Kaal Sarp (all planets hemmed)
    strength += 100;

    // Additional strength if Sun or Moon are strongly hemmed
    if (kaalSarpAnalysis.planetaryHemmed.includes('sun')) {
      strength += 50; // Sun hemmed is particularly strong
    }

    if (kaalSarpAnalysis.planetaryHemmed.includes('moon')) {
      strength += 40; // Moon hemmed affects emotional well-being
    }

    // Strength increases if malefic planets are favorably placed (ironic effect)
    const hemmedMalefics = ['mars', 'saturn', 'rahu'].filter(p =>
      kaalSarpAnalysis.planetaryHemmed.includes(p)
    );

    if (hemmedMalefics.length > 0) {
      strength += hemmedMalefics.length * 20;
    }

    // Stronger if Rahu/Ketu in unfavorable positions
    const rahuSign = kaalSarpAnalysis.rahuPosition.sign;
    if ([6, 8, 12].includes(rahuSign)) { // Virgo, Scorpio, Pisces
      strength += 30; // Unfavorable signs for Rahu
    }

    const level = strength >= 250 ? 'Very Strong' :
                 strength >= 200 ? 'Strong' :
                 strength >= 150 ? 'Moderate' :
                 strength >= 100 ? 'Mild' : 'Weak';

    return {
      total: strength,
      level: level,
      percentage: Math.min(strength / 3, 100) // Max 100%
    };
  }

  /**
   * Analyze the effects of Kaal Sarp Dosha
   * @private
   */
  _analyzeDoshaEffects(strength, kaalSarpType) {
    const effects = {
      general: [],
      specific: [],
      timing: [],
      severity: strength.level
    };

    // General effects based on Kaal Sarp type
    const typeEffects = this.kaalSarpTypes[kaalSarpType.toLowerCase().replace(' ', '')]?.effects || 'General challenges and delay';

    effects.specific.push(`Type Effect: ${typeEffects}`);

    // Severity-based general effects
    if (strength.level === 'Very Strong') {
      effects.general = [
        'Significant obstacles and delays in life',
        'Repeated failures despite hard work',
        'Health issues and chronic problems',
        'Family discord and relationship challenges',
        'Financial instability and career setbacks'
      ];
    } else if (strength.level === 'Strong') {
      effects.general = [
        'Moderate obstacles requiring effort to overcome',
        'Intermittent financial and career challenges',
        'Health issues requiring attention',
        'Relationship difficulties in youth',
        'Spiritual growth through overcoming adversity'
      ];
    } else {
      effects.general = [
        'Minor challenges that can be managed',
        'Temporary setbacks in career and relationships',
        'Opportunities available but delayed',
        'Potential for spiritual development',
        'Need for consistent positive action'
      ];
    }

    // Timing effects based on age
    effects.timing = [
      'Childhood: Learning through challenges',
      'Youth: Career and relationship lessons',
      'Middle Age: Wisdom and stability building',
      'Later Years: Rewards for perseverance'
    ];

    return effects;
  }

  /**
   * Calculate remedial measures for Kaal Sarp Dosha
   * @private
   */
  _calculateRemedialMeasures(kaalSarpType, strength) {
    const remedies = {
      general: [
        'Regular chanting of Rahu and Ketu mantras',
        'Worship at Navagraha temples',
        'Black sesame seeds charity on Saturdays',
        'Rahu-Ketu graha shanti puja'
      ],
      specific: this.kaalSarpTypes[kaalSarpType.toLowerCase().replace(' ', '')]?.remedy || 'General remedial pujas',
      lifestyle: [
        'Avoid inauspicious activities on certain days',
        'Practice meditation and spiritual discipline',
        'Wear recommended gemstones under guidance',
        'Visit holy places and perform charity'
      ],
      strengthening: []
    };

    // Add strength-based remedial measures
    if (strength.level === 'Very Strong') {
      remedies.strengthening = [
        'Daily mantra recitation (at least 108 times)',
        'Weekly pujas and homams',
        'Sacred thread ceremony',
        'Extended fasting on auspicious days',
        'Pilgrimage to special temples'
      ];
    } else {
      remedies.strengthening = [
        'Regular mantra chanting',
        'Monthly pujas when possible',
        'Simple charitable acts',
        'Positive thinking and lifestyle'
      ];
    }

    return remedies;
  }

  /**
   * Check for exceptions and cancellations
   * @private
   */
  _checkExceptionsAndCancellations(planets, kaalSarpAnalysis) {
    const exceptions = {
      cancelled: false,
      partialCancellation: false,
      reasons: [],
      strengtheningFactors: []
    };

    // Exceptions that cancel Kaal Sarp Dosha
    if (!kaalSarpAnalysis.hasDosha) {
      exceptions.cancelled = true;
      exceptions.reasons.push('Dosha not present in this chart');
      return exceptions;
    }

    // 1. Jupiter in Kendra from Lagna cancels Kaal Sarp
    const jupiterHouse = planets.jupiter?.house || 0;
    if ([1, 4, 7, 10].includes(jupiterHouse)) {
      exceptions.cancelled = true;
      exceptions.reasons.push('Jupiter in Kendra (1st, 4th, 7th, or 10th house)');
    }

    // 2. All benefics in Kendra
    const benefics = ['jupiter', 'venus', 'mercury', 'moon'];
    const kendraBenefics = benefics.filter(planet => {
      const house = planets[planet]?.house || 0;
      return [1, 4, 7, 10].includes(house);
    });

    if (kendraBenefics.length >= 3) {
      exceptions.cancelled = true;
      exceptions.reasons.push('Three or more benefics in Kendra houses');
    }

    // 3. Saturn in Kendra
    const saturnHouse = planets.saturn?.house || 0;
    if ([1, 4, 7, 10].includes(saturnHouse)) {
      exceptions.partialCancellation = true;
      exceptions.reasons.push('Saturn in Kendra - Partial cancellation');
      exceptions.strengtheningFactors.push('Saturn provides discipline and structure');
    }

    // 4. Mars in Kendra
    const marsHouse = planets.mars?.house || 0;
    if ([1, 4, 7, 10].includes(marsHouse)) {
      exceptions.strengtheningFactors.push('Mars provides courage and action');
    }

    // 5. Rahu-Ketu in favorable houses
    const rahuHouse = planets.rahu?.house || 0;
    const ketuHouse = planets.ketu?.house || 0;

    if ([3, 6, 11].includes(rahuHouse)) {
      exceptions.strengtheningFactors.push('Rahu in favorable house (3rd, 6th, or 11th)');
    }

    if ([3, 6, 11].includes(ketuHouse)) {
      exceptions.strengtheningFactors.push('Ketu in favorable house (3rd, 6th, or 11th)');
    }

    return exceptions;
  }

  /**
   * Generate Kaal Sarp predictions
   * @private
   */
  _generateKaalSarpPredictions(kaalSarpAnalysis, strength, exceptions) {
    const predictions = {
      overall: '',
      career: [],
      marriage: [],
      health: [],
      finances: [],
      spiritual: [],
      timing: []
    };

    if (!kaalSarpAnalysis.hasDosha) {
      predictions.overall = 'No Kaal Sarp Dosha present - life flows more smoothly with fewer obstacles';
      return predictions;
    }

    if (exceptions.cancelled) {
      predictions.overall = 'Kaal Sarp Dosha present but CANCELLED due to favorable planetary positions. Effects greatly reduced or nullified.';
      predictions.spiritual.push('Cancelled dosha provides opportunity for spiritual growth');
      return predictions;
    }

    // General predictions based on strength
    switch (strength.level) {
      case 'Very Strong':
        predictions.overall = 'Strong Kaal Sarp Dosha requires diligent effort and remedial measures for success';
        predictions.career.push('Career advancement requires persistent effort and multiple attempts');
        predictions.marriage.push('Marriage may be delayed; relationship issues need careful handling');
        predictions.health.push('Health requires attention; chronic conditions may be present');
        predictions.finances.push('Financial stability comes after significant effort');
        break;

      case 'Strong':
        predictions.overall = 'Moderate Kaal Sarp influences require conscious effort to balance and harmonize the influences';
        predictions.career.push('Career progression may be slower and require extra effort');
        predictions.marriage.push('Marriage timing may vary; patience needed in relationships');
        predictions.health.push('Health generally good but requires preventive care');
        predictions.finances.push('Financial stability achievable through discipline and planning');
        break;

      case 'Moderate':
        predictions.overall = 'Mild Kaal Sarp Dosha - balanced with conscious effort and positive lifestyle choices';
        predictions.career.push('Career develops steadily with focus and determination');
        predictions.marriage.push('Marriage blessed; relationships generally harmonious');
        predictions.health.push('Health issues minimal; maintain healthy lifestyle');
        predictions.finances.push('Financial stability through wise planning and savings');
        break;

      case 'Mild':
        predictions.overall = 'Very mild Kaal Sarp influences - more of an opportunity for growth than a hindrance';
        predictions.career.push('Career opportunities available with moderate effort');
        predictions.marriage.push('Positive marriage prospects with some initial adjustments');
        predictions.health.push('Good health foundation with basic preventive care');
        predictions.finances.push('Financial stability through responsible habits');
        break;

      case 'Weak':
        predictions.overall = 'Minimal Kaal Sarp Dosha impact - life flows relatively smoothly';
        predictions.career.push('Career opportunities available with moderate effort');
        predictions.marriage.push('Harmonious marriage relationships with good potential');
        predictions.health.push('Good health foundation with basic preventive care');
        predictions.finances.push('Financial stability through responsible planning');
        break;

      default:
        predictions.overall = 'Kaal Sarp Dosha requires individual analysis for accurate predictions';
    }

    // Add timing predictions for all levels
    predictions.timing = [
      'Effects most pronounced during early life and major transitions',
      'Mid-life (30s-50s): Peak period for major life lessons and achievement',
      'Later years: Rewards for perseverance and wisdom accumulated',
      'Planetary returns create additional opportunities and challenges'
    ];

    return predictions;
  }

  /**
   * Generate Kaal Sarp summary
   * @private
   */
  _generateKaalSarpSummary(kaalSarpAnalysis, strength, exceptions) {
    const summary = {
      presence: kaalSarpAnalysis.hasDosha ? 'Present' : 'Absent',
      type: kaalSarpAnalysis.kaalSarpType || 'None',
      strength: strength.level,
      status: exceptions.cancelled ? 'Cancelled' : 'Active',
      keyInsight: this._getKeyInsight(kaalSarpAnalysis, strength, exceptions)
    };

    return summary;
  }

  /**
   * Get key insight for the analysis
   * @private
   */
  _getKeyInsight(kaalSarpAnalysis, strength, exceptions) {
    if (!kaalSarpAnalysis.hasDosha) {
      return 'No Kaal Sarp Dosha present - natural life flow with fewer obstacles';
    }

    if (exceptions.cancelled) {
      return 'Kaal Sarp Dosha cancelled by favorable planetary positions - effects neutralized';
    }

    if (strength.level === 'Very Strong') {
      return 'Strong Kaal Sarp requires diligent spiritual practices and remedial measures';
    } else if (strength.level === 'Strong') {
      return 'Moderate Kaal Sarp - challenges can be overcome through consistent positive action';
    } else {
      return 'Mild Kaal Sarp - growth opportunities through mindful living and spiritual practice';
    }
  }

  /**
   * Calculate natal chart for given parameters
   * @private
   */
  async _calculateNatalChart(year, month, day, hour, minute, latitude, longitude, timezone) {
    // Placeholder - this should integrate with Swiss Ephemeris or similar
    return {
      planets: {
        sun: { longitude: 0, sign: 1, degree: 0, house: 1 },
        moon: { longitude: 30, sign: 2, degree: 0, house: 2 },
        mars: { longitude: 60, sign: 3, degree: 0, house: 3 },
        mercury: { longitude: 90, sign: 4, degree: 0, house: 4 },
        jupiter: { longitude: 120, sign: 5, degree: 0, house: 5 },
        venus: { longitude: 150, sign: 6, degree: 0, house: 6 },
        saturn: { longitude: 180, sign: 7, degree: 0, house: 7 },
        rahu: { longitude: 210, sign: 8, degree: 0, house: 8 },
        ketu: { longitude: 330, sign: 11, degree: 0, house: 11 },
        ascendant: { longitude: 0, sign: 1, degree: 0 }
      },
      houses: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
    };
  }

  /**
   * Get coordinates for a place name
   * @private
   */
  async _getCoordinatesForPlace(place) {
    // Placeholder - integrate with geocoding service
    return [28.6139, 77.2090]; // Delhi coordinates as default
  }

  /**
   * Get timezone for coordinates and timestamp
   * @private
   */
  async _getTimezoneForPlace(lat, lon, timestamp) {
    // Placeholder - should integrate with timezone API
    return 5.5; // IST as default
  }
}

module.exports = { KaalSarpDoshaCalculator };