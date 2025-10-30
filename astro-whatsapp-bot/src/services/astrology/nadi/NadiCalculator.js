const logger = require('../../../utils/logger');
const { NadiDataRepository } = require('./NadiDataRepository');

/**
 * NadiCalculator - Core calculation engine for Nadi astrology
 * Handles birth nakshatra calculation, nadi determination, and dasha predictions
 */
class NadiCalculator {
  constructor() {
    this.dataRepo = new NadiDataRepository();
    this.logger = logger;
  }

  /**
   * Calculate complete Nadi reading for a person
   * @param {Object} person - Person's birth data
   * @returns {Object} Complete Nadi calculation results
   */
  calculateNadiReading(person) {
    try {
      const birthNakshatra = this.calculateBirthNakshatra(
        person.birthDate,
        person.birthTime
      );
      const nadiSystem = this.determineNadiSystem(birthNakshatra, person.birthDate);
      const dashaPeriod = this.calculateCurrentDasha(person.birthDate);
      const predictions = this.generatePredictions(
        birthNakshatra,
        nadiSystem,
        dashaPeriod
      );

      return {
        birthNakshatra,
        nadiSystem,
        currentDasha: dashaPeriod,
        predictions,
        compatibility: this.generateCompatibility(birthNakshatra)
      };
    } catch (error) {
      this.logger.error('Nadi calculation error:', error);
      throw error;
    }
  }

  /**
   * Calculate birth nakshatra from birth data
   * @param {string} birthDate - Birth date (DD/MM/YYYY)
   * @param {string} birthTime - Birth time (HH:MM)
   * @returns {Object} Birth nakshatra information
   */
  calculateBirthNakshatra(birthDate, birthTime) {
    try {
      // Parse birth date and time
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime ? birthTime.split(':').map(Number) : [12, 0];

      // Calculate nakshatra based on date and time
      const dayOfYear = this.getDayOfYear(day, month);
      const timeFactor = (hour * 60 + minute) / 1440; // Fraction of day

      // 27 nakshatras per year (roughly)
      const nakshatraIndex = Math.floor((dayOfYear + timeFactor * 27) % 27);
      const nakshatras = this.dataRepo.getNakshatras();
      const nakshatra = nakshatras[nakshatraIndex];

      return {
        name: nakshatra.name,
        rulingPlanet: nakshatra.rulingPlanet,
        deity: nakshatra.deity || 'Associated Deity',
        nature: nakshatra.nature,
        pada: this.calculatePada(hour, minute),
        characteristics: this.dataRepo.getNakshatraCharacteristics(nakshatra.name)
      };
    } catch (error) {
      this.logger.error('Birth nakshatra calculation error:', error);
      return {
        error: 'Unable to calculate birth nakshatra',
        name: 'Unknown'
      };
    }
  }

  /**
   * Calculate pada (quarter) of the nakshatra
   * @param {number} hour - Birth hour
   * @param {number} minute - Birth minute
   * @returns {number} Pada number (1-4)
   */
  calculatePada(hour, minute) {
    const totalMinutes = hour * 60 + minute;
    const padaDuration = 1440 / 4; // 4 padas per nakshatra (6 hours each)
    return Math.floor(totalMinutes / padaDuration) + 1;
  }

  /**
   * Get day of year from date
   * @param {number} day - Day of month
   * @param {number} month - Month (1-12)
   * @returns {number} Day of year (1-365)
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
   * Determine Nadi system from birth nakshatra and date
   * @param {Object} birthNakshatra - Birth nakshatra data
   * @param {string} birthDate - Birth date
   * @returns {Object} Nadi system information
   */
  determineNadiSystem(birthNakshatra, birthDate) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);
      const total = day + month + year;
      const nadiSystems = this.dataRepo.getNadiSystems();

      let nadiType;
      if (total % 3 === 0) {
        nadiType = 'adi';
      } else if (total % 3 === 1) {
        nadiType = 'Madhya';
      } else {
        nadiType = 'Antya';
      }

      return nadiSystems[nadiType];
    } catch (error) {
      this.logger.error('Nadi system determination error:', error);
      const nadiSystems = this.dataRepo.getNadiSystems();
      return nadiSystems.adi; // Default fallback
    }
  }

  /**
   * Calculate current dasha period
   * @param {string} birthDate - Birth date
   * @returns {Object} Current dasha information
   */
  calculateCurrentDasha(birthDate) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);
      const birthDateObj = new Date(year, month - 1, day);
      const now = new Date();

      // Calculate age in years
      const ageInYears = now.getFullYear() - birthDateObj.getFullYear();
      const ageInMonths = (now.getMonth() - birthDateObj.getMonth()) + (ageInYears * 12);

      // Total dasha cycle duration (sum of all planet periods)
      const dashaPeriods = this.dataRepo.getDashaPeriods();
      const totalDashaYears = Object.values(dashaPeriods).reduce(
        (sum, period) => sum + period.duration,
        0
      );

      // Find current dasha planet
      const currentPosition = ageInYears % totalDashaYears;
      let accumulatedYears = 0;

      for (const [planet, period] of Object.entries(dashaPeriods)) {
        accumulatedYears += period.duration;
        if (currentPosition < accumulatedYears) {
          const remaining = accumulatedYears - currentPosition;
          return {
            planet: planet.charAt(0).toUpperCase() + planet.slice(1),
            duration: period.duration,
            remaining: Math.max(1, Math.floor(remaining)), // At least 1 year remaining
            characteristics: period.characteristics,
            influence: this.dataRepo.getDashaInfluence(planet)
          };
        }
      }

      // Fallback
      return {
        planet: 'Sun',
        duration: 6,
        remaining: 3,
        characteristics: 'Leadership and authority',
        influence: 'Period of leadership and self-expression'
      };
    } catch (error) {
      this.logger.error('Dasha calculation error:', error);
      return {
        error: 'Unable to calculate current dasha',
        planet: 'Unknown'
      };
    }
  }

  /**
   * Generate predictions based on nakshatra, nadi, and dasha
   * @param {Object} nakshatra - Birth nakshatra
   * @param {Object} nadiSystem - Nadi system
   * @param {Object} dasha - Current dasha
   * @returns {Object} Predictions object
   */
  generatePredictions(nakshatra, nadiSystem, dasha) {
    return {
      personality: this.generatePersonalityPrediction(nakshatra, nadiSystem),
      career: this.generateCareerPrediction(nakshatra, nadiSystem, dasha),
      relationships: this.generateRelationshipPrediction(nakshatra, nadiSystem),
      health: this.generateHealthPrediction(nakshatra),
      finance: this.generateFinancePrediction(nakshatra, dasha),
      spiritual: this.generateSpiritualPrediction(nakshatra, nadiSystem)
    };
  }

  /**
   * Generate personality prediction
   * @param {Object} nakshatra - Birth nakshatra
   * @param {Object} nadiSystem - Nadi system
   * @returns {string} Personality description
   */
  generatePersonalityPrediction(nakshatra, nadiSystem) {
    return `Your ${nakshatra.name} nakshatra suggests ${nakshatra.characteristics.toLowerCase()}. As part of the ${nadiSystem.name}, you exhibit ${nadiSystem.characteristics.toLowerCase()}.`;
  }

  /**
   * Generate career prediction
   * @param {Object} nakshatra - Birth nakshatra
   * @param {Object} nadiSystem - Nadi system
   * @param {Object} dasha - Current dasha
   * @returns {string} Career guidance
   */
  generateCareerPrediction(nakshatra, nadiSystem, dasha) {
    const careerFocus = {
      'Adi Nadi': 'leadership and pioneering roles',
      'Madhya Nadi': 'balanced and harmonious work environments',
      'Antya Nadi': 'service and helping professions'
    };

    const focus = careerFocus[nadiSystem.name] || 'versatile career paths';
    return `Your ${nadiSystem.name} suggests career success in ${focus}. Current ${dasha.planet} dasha (${dasha.remaining} years) influences ${dasha.characteristics.toLowerCase()}.`;
  }

  /**
   * Generate relationship prediction
   * @param {Object} nakshatra - Birth nakshatra
   * @param {Object} nadiSystem - Nadi system
   * @returns {string} Relationship insights
   */
  generateRelationshipPrediction(nakshatra, nadiSystem) {
    return `Your ${nakshatra.name} nakshatra and ${nadiSystem.name} indicate strong potential for ${nadiSystem.characteristics.toLowerCase()} in relationships.`;
  }

  /**
   * Generate health prediction
   * @param {Object} nakshatra - Birth nakshatra
   * @returns {string} Health focus areas
   */
  generateHealthPrediction(nakshatra) {
    const healthFocus = this.dataRepo.getNakshatraHealthFocus(nakshatra.name);
    return `Focus on maintaining balance in your ${healthFocus} for optimal well-being.`;
  }

  /**
   * Generate finance prediction
   * @param {Object} nakshatra - Birth nakshatra
   * @param {Object} dasha - Current dasha
   * @returns {string} Financial guidance
   */
  generateFinancePrediction(nakshatra, dasha) {
    return `Current ${dasha.planet} dasha (${dasha.remaining} years) may bring opportunities in ${dasha.characteristics.toLowerCase()}. Focus on stable financial planning.`;
  }

  /**
   * Generate spiritual prediction
   * @param {Object} nakshatra - Birth nakshatra
   * @param {Object} nadiSystem - Nadi system
   * @returns {string} Spiritual guidance
   */
  generateSpiritualPrediction(nakshatra, nadiSystem) {
    return `Your ${nakshatra.name} nakshatra and ${nadiSystem.name} guide you toward ${nadiSystem.lifePurpose.toLowerCase()}. Embrace spiritual practices that resonate with your nature.`;
  }

  /**
   * Generate compatibility information
   * @param {Object} nakshatra - Birth nakshatra
   * @returns {Object} Compatibility data
   */
  generateCompatibility(nakshatra) {
    return {
      compatibleSigns: this.dataRepo.getCompatibleNakshatras(nakshatra.name),
      bestMatches: this.dataRepo.getBestMatches(nakshatra.name),
      relationshipAdvice: this.dataRepo.getRelationshipAdvice(nakshatra.name)
    };
  }
}

module.exports = { NadiCalculator };