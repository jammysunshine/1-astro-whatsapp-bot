const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');

/**
 * Western Birth Chart Service
 * Provides Western astrology birth chart analysis using tropical zodiac
 * Extends ServiceTemplate for standardized service architecture
 */
class WesternBirthChartService extends ServiceTemplate {
  constructor() {
    super('ChartGenerator');
    this.serviceName = 'WesternBirthChartService';
    this.calculatorPath = '../calculators/ChartGenerator';
    logger.info('WesternBirthChartService initialized');

    // Service-specific configuration
    this.serviceConfig = {
      supportedInputs: ['birthData'],
      requiredInputs: ['birthData'],
      outputFormats: ['detailed', 'summary', 'chart-data'],
      zodiacSystem: 'tropical',
      houseSystem: 'placidus'
    };
  }

  /**
   * Process Western Birth Chart calculation using ServiceTemplate pattern
   * @param {Object} params - Calculation parameters
   * @returns {Promise<Object>} Formatted Western birth chart analysis
   */
  async processCalculation(params) {
    const { birthData, options = {} } = params;

    try {
      // Validate inputs
      this._validateInputs(birthData);

      // Calculate Western birth chart using calculator
      const chartResult = await this.calculator.generateWesternBirthChart(birthData, this.serviceConfig.houseSystem);

      // Transform result to expected format
      const formattedResult = {
        birthData,
        sunSign: chartResult.planets?.sun ? {
          sign: chartResult.planets.sun.sign,
          degree: chartResult.planets.sun.position.degrees
        } : null,
        moonSign: chartResult.planets?.moon ? {
          sign: chartResult.planets.moon.sign,
          degree: chartResult.planets.moon.position.degrees
        } : null,
        ascendant: chartResult.ascendant ? {
          sign: chartResult.ascendant.sign,
          degree: Math.floor(chartResult.ascendant.longitude % 30)
        } : null,
        planetaryPositions: chartResult.planets || {},
        houseCusps: chartResult.houseCusps || [],
        majorAspects: chartResult.aspects || [],
        serviceMetadata: {
          serviceName: this.serviceName,
          calculationType: 'WesternBirthChart',
          timestamp: new Date().toISOString(),
          method: 'Tropical Western Astrology Chart',
          zodiacSystem: this.serviceConfig.zodiacSystem,
          houseSystem: this.serviceConfig.houseSystem
        }
      };

      // Add Western-specific analysis
      formattedResult.westernAnalysis = this._performWesternAnalysis(formattedResult);

      return formattedResult;
    } catch (error) {
      logger.error(`❌ Error in ${this.serviceName} calculation:`, error);
      throw new Error(`Western birth chart calculation failed: ${error.message}`);
    }
  }

  /**
   * Format Western Birth Chart result for WhatsApp output
   * @param {Object} result - Calculation result
   * @returns {string} Formatted WhatsApp message
   */
  formatResult(result) {
    if (!result || !result.planetaryPositions) {
      return '❌ *Western Birth Chart Analysis Error*\n\nUnable to generate Western birth chart. Please check your birth details and try again.';
    }

    let formatted = '🌟 *Western Birth Chart Analysis*\n\n';

    // Add birth information
    if (result.birthData) {
      formatted += `*Birth Details:* ${result.birthData.birthDate} at ${result.birthData.birthTime}\n`;
      formatted += `*Location:* ${result.birthData.birthPlace}\n\n`;
    }

    // Add sun sign
    if (result.sunSign) {
      formatted += `*Sun Sign:* ${result.sunSign.sign} (${result.sunSign.degree}°)\n`;
      formatted += `*Sun Sign Traits:* ${result.sunSign.traits || 'Determined by sun placement'}\n\n`;
    }

    // Add moon sign
    if (result.moonSign) {
      formatted += `*Moon Sign:* ${result.moonSign.sign} (${result.moonSign.degree}°)\n`;
      formatted += `*Moon Sign Traits:* ${result.moonSign.traits || 'Determined by moon placement'}\n\n`;
    }

    // Add rising sign
    if (result.ascendant) {
      formatted += `*Rising Sign (Ascendant):* ${result.ascendant.sign} (${result.ascendant.degree}°)\n`;
      formatted += `*Ascendant Traits:* ${result.ascendant.traits || 'Determined by rising sign'}\n\n`;
    }

    // Add planetary positions
    if (result.planetaryPositions && Object.keys(result.planetaryPositions).length > 0) {
      formatted += '*🪐 Planetary Positions:*\n';
      const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
      planets.forEach(planet => {
        if (result.planetaryPositions[planet]) {
          const pos = result.planetaryPositions[planet];
          formatted += `• **${planet}:** ${pos.sign} ${pos.degree}° ${pos.retrograde ? '(R)' : ''}\n`;
        }
      });
      formatted += '\n';
    }

    // Add house cusps
    if (result.houseCusps && result.houseCusps.length > 0) {
      formatted += '*🏠 House Cusps:*\n';
      result.houseCusps.slice(0, 6).forEach((house, index) => {
        formatted += `• **House ${index + 1}:** ${house.sign} ${house.degree}°\n`;
      });
      formatted += '\n';
    }

    // Add aspects
    if (result.majorAspects && result.majorAspects.length > 0) {
      formatted += '*⚡ Major Aspects:*\n';
      result.majorAspects.slice(0, 5).forEach(aspect => {
        formatted += `• ${aspect.planet1} ${aspect.aspect} ${aspect.planet2} (${aspect.orb}°)\n`;
      });
      formatted += '\n';
    }

    // Add Western analysis if available
    if (result.westernAnalysis) {
      formatted += '*🔍 Western Analysis:*\n';

      if (result.westernAnalysis.elementBalance) {
        formatted += `• **Element Balance:** ${result.westernAnalysis.elementBalance}\n`;
      }

      if (result.westernAnalysis.modalityBalance) {
        formatted += `• **Modality Balance:** ${result.westernAnalysis.modalityBalance}\n`;
      }

      if (result.westernAnalysis.chartShape) {
        formatted += `• **Chart Shape:** ${result.westernAnalysis.chartShape}\n`;
      }

      formatted += '\n';
    }

    // Add service footer
    formatted += '---\n*Western Astrology - Tropical Zodiac System*';

    return formatted;
  }

  /**
   * Validate input parameters for Western Birth Chart calculation
   * @param {Object} birthData - Birth data object
   * @private
   */
  _validateInputs(birthData) {
    if (!birthData) {
      throw new Error('Birth data is required for Western birth chart analysis');
    }

    if (!birthData.birthDate || !birthData.birthTime || !birthData.birthPlace) {
      throw new Error('Complete birth details (date, time, place) are required');
    }
  }

  /**
   * Perform Western-specific analysis on chart results
   * @param {Object} result - Chart calculation result
   * @returns {Object} Western analysis
   * @private
   */
  _performWesternAnalysis(result) {
    const analysis = {
      elementBalance: '',
      modalityBalance: '',
      chartShape: '',
      dominantPlanets: [],
      stelliums: []
    };

    // Analyze element balance
    if (result.planetaryPositions) {
      const elements = { fire: 0, earth: 0, air: 0, water: 0 };
      const signs = {
        Aries: 'fire', Taurus: 'earth', Gemini: 'air', Cancer: 'water',
        Leo: 'fire', Virgo: 'earth', Libra: 'air', Scorpio: 'water',
        Sagittarius: 'fire', Capricorn: 'earth', Aquarius: 'air', Pisces: 'water'
      };

      Object.values(result.planetaryPositions).forEach(pos => {
        if (signs[pos.sign]) {
          elements[signs[pos.sign]]++;
        }
      });

      const maxElement = Object.keys(elements).reduce((a, b) => (elements[a] > elements[b] ? a : b));
      analysis.elementBalance = `Strong ${maxElement} element influence`;
    }

    // Analyze modality balance
    if (result.planetaryPositions) {
      const modalities = { cardinal: 0, fixed: 0, mutable: 0 };
      const signModalities = {
        Aries: 'cardinal', Taurus: 'fixed', Gemini: 'mutable', Cancer: 'cardinal',
        Leo: 'fixed', Virgo: 'mutable', Libra: 'cardinal', Scorpio: 'fixed',
        Sagittarius: 'mutable', Capricorn: 'cardinal', Aquarius: 'fixed', Pisces: 'mutable'
      };

      Object.values(result.planetaryPositions).forEach(pos => {
        if (signModalities[pos.sign]) {
          modalities[signModalities[pos.sign]]++;
        }
      });

      const maxModality = Object.keys(modalities).reduce((a, b) => (modalities[a] > modalities[b] ? a : b));
      analysis.modalityBalance = `Strong ${maxModality} modality influence`;
    }

    // Determine chart shape (simplified)
    if (result.houseCusps && result.houseCusps.length >= 12) {
      const ascendant = result.houseCusps[0].degree;
      const midheaven = result.houseCusps[9].degree;

      // Simple shape determination based on angular houses
      const angularSpread = Math.abs(midheaven - ascendant);
      if (angularSpread < 90) {
        analysis.chartShape = 'Bundle chart - focused energy';
      } else if (angularSpread > 150) {
        analysis.chartShape = 'Bowl chart - well-rounded personality';
      } else {
        analysis.chartShape = 'See-saw chart - balanced but intense';
      }
    }

    return analysis;
  }

  /**
   * Calculate confidence score for Western Birth Chart analysis
   * @param {Object} result - Calculation result
   * @returns {number} Confidence score (0-100)
   */
  calculateConfidence(result) {
    let confidence = 85; // Base confidence for Western astrology

    // Increase confidence based on data completeness
    if (result.planetaryPositions && Object.keys(result.planetaryPositions).length >= 7) {
      confidence += 10;
    }

    if (result.houseCusps && result.houseCusps.length >= 12) {
      confidence += 5;
    }

    return Math.min(confidence, 100);
  }

  /**
   * Validate calculation result
   * @param {Object} result - Calculation result
   * @returns {boolean} True if valid
   */
  validateResult(result) {
    return (
      result &&
      typeof result === 'object' &&
      result.planetaryPositions &&
      result.ascendant
    );
  }

  /**
   * Get service-specific help
   * @returns {string} Help information
   */
  getHelp() {
    return `
🌟 **Western Birth Chart Service - Tropical Astrology Analysis**

**Purpose:** Provides comprehensive Western astrology birth chart analysis using the tropical zodiac system

**Required Inputs:**
• Birth date (DD/MM/YYYY)
• Birth time (HH:MM)
• Birth place (city, country)

**Analysis Includes:**

**🌞 Core Components:**
• **Sun Sign** - Core personality and life purpose
• **Moon Sign** - Emotional nature and inner self
• **Rising Sign (Ascendant)** - Outer personality and first impressions
• **Planetary Positions** - All planets in signs and degrees

**🏠 House System:**
• **12 Houses** - Life areas and experiences
• **House Cusps** - House starting points
• **Planetary House Placements** - Where planets express their energy

**⚡ Aspects:**
• **Major Aspects** - Planetary relationships and influences
• **Aspect Orbs** - Strength of planetary connections

**🔍 Western Analysis:**
• **Element Balance** - Fire, Earth, Air, Water distribution
• **Modality Balance** - Cardinal, Fixed, Mutable qualities
• **Chart Shape** - Overall chart configuration
• **Dominant Planets** - Most influential celestial bodies

**Zodiac System:**
• **Tropical Zodiac** - Based on seasons and equinoxes
• **Modern Planets** - Includes Uranus, Neptune, Pluto
• **House System** - Placidus (most common Western system)

**Example Usage:**
"Generate my Western birth chart"
"Western astrology analysis for birth date 15/06/1990"
"Tropical zodiac chart calculation"

**Output Format:**
Comprehensive Western birth chart with planetary positions, houses, aspects, and astrological analysis
    `.trim();
  }

  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          tropicalZodiac: true,
          modernPlanets: true,
          westernAspects: true,
          houseSystems: true
        },
        supportedAnalyses: [
          'planetary_positions',
          'house_cusps',
          'major_aspects',
          'element_balance',
          'modality_balance',
          'chart_shape'
        ]
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = WesternBirthChartService;
