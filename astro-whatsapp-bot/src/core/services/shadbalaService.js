const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');

/**
 * Shadbala Service
 * Provides comprehensive 6-fold planetary strength assessment using Vedic astrology principles
 * Extends ServiceTemplate for standardized service architecture
 */
class ShadbalaService extends ServiceTemplate {
  constructor(services) {
    super('ChartGenerator');
    this.calculatorPath = '../calculators/ChartGenerator';
    // Initialize Shadbala Calculator with required dependencies
    this.calculator = new ShadbalaCalculator(
      services.astrologer,
      services.geocodingService
    );

    // Set services in calculator
    this.calculator.setServices(services);

    // Service-specific configuration
    this.serviceConfig = {
      supportedInputs: ['birthData'],
      requiredInputs: ['birthData'],
      outputFormats: ['detailed', 'summary', 'strength-analysis'],
      strengthThresholds: {
        veryStrong: 480,    // 8 rupas
        strong: 390,        // 6.5 rupas
        average: 300,       // 5 rupas
        weak: 210,          // 3.5 rupas
        veryWeak: 120        // 2 rupas
      }
    };
  }

  /**
   * Process Shadbala calculation using ServiceTemplate pattern
   * @param {Object} params - Calculation parameters
   * @returns {Promise<Object>} Formatted Shadbala analysis
   */
  async processCalculation(params) {
    const { birthData, options = {} } = params;

    try {
      // Validate inputs
      this._validateInputs(birthData);

      // Calculate Shadbala using the calculator
      const shadbalaResult = await this.calculator.generateShadbala(birthData);

      // Add service metadata
      shadbalaResult.serviceMetadata = {
        serviceName: this.serviceName,
        calculationType: 'Shadbala',
        timestamp: new Date().toISOString(),
        method: 'Six-fold Planetary Strength Assessment',
        components: ['Sthana Bala', 'Dig Bala', 'Kala Bala', 'Chesta Bala', 'Naisargika Bala', 'Drig Bala']
      };

      // Add strength analysis
      shadbalaResult.strengthAnalysis = this._analyzeOverallStrength(shadbalaResult.shadbalaResults);

      return shadbalaResult;
    } catch (error) {
      logger.error(`❌ Error in ${this.serviceName} calculation:`, error);
      throw new Error(`Shadbala calculation failed: ${error.message}`);
    }
  }

  /**
   * Format Shadbala result for WhatsApp output
   * @param {Object} result - Calculation result
   * @returns {string} Formatted WhatsApp message
   */
  formatResult(result) {
    if (!result || !result.shadbalaResults) {
      return '❌ *Shadbala Analysis Error*\n\nUnable to generate planetary strength analysis. Please check your birth details and try again.';
    }

    let formatted = '';

    // Use the calculator's formatted summary if available
    if (result.summary) {
      formatted = result.summary;
    } else {
      // Fallback formatting
      formatted = this._formatFallbackResult(result);
    }

    // Add planetary strength overview
    if (result.shadbalaResults) {
      formatted += '\n\n*💪 Planetary Strength Overview:*\n';

      const planets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
      planets.forEach(planet => {
        const planetData = result.shadbalaResults[planet];
        if (planetData) {
          const strength = planetData.strength || 'Average';
          const rp = planetData.totalRP || 0;
          const planetName = planet.charAt(0).toUpperCase() + planet.slice(1);
          formatted += `• ${planetName}: ${strength} (${rp} RP)\n`;
        }
      });
    }

    // Add strongest and weakest planets
    if (result.strengthAnalysis) {
      formatted += '\n*🏆 Strength Analysis:*\n';
      if (result.strengthAnalysis.strongest) {
        formatted += `• Strongest: ${result.strengthAnalysis.strongest.planet} (${result.strengthAnalysis.strongest.strength})\n`;
      }
      if (result.strengthAnalysis.weakest) {
        formatted += `• Weakest: ${result.strengthAnalysis.weakest.planet} (${result.strengthAnalysis.weakest.strength})\n`;
      }
      if (result.strengthAnalysis.chartStrength) {
        formatted += `• Overall Chart: ${result.strengthAnalysis.chartStrength}\n`;
      }
    }

    // Add recommendations if available
    if (result.recommendations && result.recommendations.length > 0) {
      formatted += '\n*💡 Recommendations:*\n';
      result.recommendations.slice(0, 3).forEach(rec => {
        formatted += `• ${rec}\n`;
      });
    }

    // Add service footer
    formatted += '\n\n---\n*Shadbala - Six-fold Planetary Strength Assessment*';

    return formatted;
  }

  /**
   * Validate input parameters for Shadbala calculation
   * @param {Object} birthData - Birth data object
   * @private
   */
  _validateInputs(birthData) {
    if (!birthData) {
      throw new Error('Birth data is required for Shadbala analysis');
    }

    if (!birthData.birthDate || !birthData.birthTime || !birthData.birthPlace) {
      throw new Error('Complete birth details (date, time, place) are required');
    }
  }

  /**
   * Analyze overall planetary strength
   * @param {Object} shadbalaResults - Shadbala results for all planets
   * @returns {Object} Strength analysis
   * @private
   */
  _analyzeOverallStrength(shadbalaResults) {
    const analysis = {
      strongest: null,
      weakest: null,
      chartStrength: 'Average',
      strongPlanets: [],
      weakPlanets: [],
      balancedPlanets: []
    };

    let maxStrength = 0;
    let minStrength = Infinity;
    let totalStrength = 0;
    let planetCount = 0;

    Object.entries(shadbalaResults).forEach(([planet, data]) => {
      const strength = data.totalBala || 0;
      totalStrength += strength;
      planetCount++;

      // Find strongest and weakest
      if (strength > maxStrength) {
        maxStrength = strength;
        analysis.strongest = {
          planet: planet.charAt(0).toUpperCase() + planet.slice(1),
          strength: data.strength || 'Unknown',
          totalBala: strength,
          totalRP: data.totalRP || 0
        };
      }

      if (strength < minStrength) {
        minStrength = strength;
        analysis.weakest = {
          planet: planet.charAt(0).toUpperCase() + planet.slice(1),
          strength: data.strength || 'Unknown',
          totalBala: strength,
          totalRP: data.totalRP || 0
        };
      }

      // Categorize planets
      if (strength >= this.serviceConfig.strengthThresholds.strong) {
        analysis.strongPlanets.push(planet.charAt(0).toUpperCase() + planet.slice(1));
      } else if (strength <= this.serviceConfig.strengthThresholds.weak) {
        analysis.weakPlanets.push(planet.charAt(0).toUpperCase() + planet.slice(1));
      } else {
        analysis.balancedPlanets.push(planet.charAt(0).toUpperCase() + planet.slice(1));
      }
    });

    // Determine overall chart strength
    const averageStrength = planetCount > 0 ? totalStrength / planetCount : 0;
    if (averageStrength >= this.serviceConfig.strengthThresholds.strong) {
      analysis.chartStrength = 'Strong';
    } else if (averageStrength <= this.serviceConfig.strengthThresholds.weak) {
      analysis.chartStrength = 'Weak';
    } else {
      analysis.chartStrength = 'Balanced';
    }

    return analysis;
  }

  /**
   * Fallback result formatting
   * @param {Object} result - Calculation result
   * @returns {string} Formatted result
   * @private
   */
  _formatFallbackResult(result) {
    let formatted = '💪 *Shadbala Analysis*\n\n';

    if (result.name) {
      formatted += `*Analysis for:* ${result.name}\n\n`;
    }

    if (result.chartStrength) {
      formatted += `*Overall Chart Strength:* ${result.chartStrength}\n\n`;
    }

    formatted += '*Six-fold Strength Assessment:*\n';
    formatted += '• Sthana Bala (Positional)\n';
    formatted += '• Dig Bala (Directional)\n';
    formatted += '• Kala Bala (Temporal)\n';
    formatted += '• Chesta Bala (Motional)\n';
    formatted += '• Naisargika Bala (Natural)\n';
    formatted += '• Drig Bala (Aspectual)\n\n';

    if (result.shadbalaResults) {
      formatted += '*Planetary Strengths:*\n';
      Object.entries(result.shadbalaResults).slice(0, 4).forEach(([planet, data]) => {
        const planetName = planet.charAt(0).toUpperCase() + planet.slice(1);
        const strength = data.strength || 'Average';
        const rp = data.totalRP || 0;
        formatted += `• ${planetName}: ${strength} (${rp} RP)\n`;
      });
    }

    formatted += '\n*Shadbala reveals the true strength and influence of each planet in your chart.*';

    return formatted;
  }

  /**
   * Calculate confidence score for Shadbala analysis
   * @param {Object} result - Calculation result
   * @returns {number} Confidence score (0-100)
   */
  calculateConfidence(result) {
    let confidence = 80; // Base confidence for Shadbala

    // Increase confidence based on data completeness
    if (result.shadbalaResults && Object.keys(result.shadbalaResults).length >= 7) {
      confidence += 10;
    }

    if (result.analysis && result.analysis.strongest && result.analysis.weakest) {
      confidence += 5;
    }

    if (result.recommendations && result.recommendations.length > 0) {
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
      result.shadbalaResults &&
      Object.keys(result.shadbalaResults).length > 0
    );
  }

  /**
   * Get service-specific help
   * @returns {string} Help information
   */
  getHelp() {
    return `
💪 **Shadbala Service - Six-fold Planetary Strength Assessment**

**Purpose:** Provides comprehensive analysis of planetary strength using six different assessment methods

**Required Inputs:**
• Birth date (DD/MM/YYYY)
• Birth time (HH:MM)
• Birth place (city, country)

**Six Types of Strength (Shad-bala):**
1. **Sthana Bala** - Positional strength (dignity, exaltation, own sign)
2. **Dig Bala** - Directional strength (cardinal directions)
3. **Kala Bala** - Temporal strength (weekday, lunar phase, time)
4. **Chesta Bala** - Motional strength (planetary speed, retrograde)
5. **Naisargika Bala** - Natural strength (innate planetary qualities)
6. **Drig Bala** - Aspectual strength (aspects from other planets)

**Strength Categories:**
• Very Strong: 480+ Shashtiamsas (8+ Rupas)
• Strong: 390-479 Shashtiamsas (6.5-7.9 Rupas)
• Average: 300-389 Shashtiamsas (5-6.4 Rupas)
• Weak: 210-299 Shashtiamsas (3.5-4.9 Rupas)
• Very Weak: Below 210 Shashtiamsas (Below 3.5 Rupas)

**Analysis Includes:**
• Individual planetary strengths
• Overall chart strength assessment
• Strongest and weakest planets
• Strength component breakdown
• Remedial recommendations
• Influence on life areas

**Example Usage:**
"Analyze my planetary strengths"
"What is my Shadbala analysis?"
"Planetary strength assessment for birth date 15/06/1990"

**Output Format:**
Detailed strength analysis with planetary rankings and recommendations
    `.trim();
  }
  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          // Add service-specific features here
        },
        supportedAnalyses: [
          // Add supported analyses here
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

module.exports = ShadbalaService;
