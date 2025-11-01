const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../../utils/logger');

/**
 * VedicYogas Service
 * Provides comprehensive analysis of Vedic planetary combinations (Yogas) for special effects
 * Extends ServiceTemplate for standardized service architecture
 */
class VedicYogasService extends ServiceTemplate {
  constructor(services) {
    super('VedicYogasCalculator');

    // Initialize Vedic Yogas Calculator with required dependencies
    this.calculator = new VedicYogasCalculator(
      services.astrologer,
      services.geocodingService
    );

    // Set services in calculator
    this.calculator.setServices(services);

    // Service-specific configuration
    this.serviceConfig = {
      supportedInputs: ['birthData'],
      requiredInputs: ['birthData'],
      outputFormats: ['detailed', 'summary', 'yoga-analysis'],
      yogaCategories: [
        'Panch Mahapurusha Yogas',
        'Raj Yogas',
        'Dhan Yogas',
        'Gaja Kesari Yoga',
        'Nbhaya Yoga',
        'Kemadruma Yoga'
      ]
    };
  }

  /**
   * Process Vedic Yogas calculation using ServiceTemplate pattern
   * @param {Object} params - Calculation parameters
   * @returns {Promise<Object>} Formatted Vedic Yogas analysis
   */
  async processCalculation(params) {
    const { birthData, options = {} } = params;

    try {
      // Validate inputs
      this._validateInputs(birthData);

      // Calculate Vedic Yogas using calculator
      const yogasResult = await this.calculator.calculateVedicYogas(birthData);

      // Add service metadata
      yogasResult.serviceMetadata = {
        serviceName: this.serviceName,
        calculationType: 'VedicYogas',
        timestamp: new Date().toISOString(),
        method: 'Traditional Vedic Planetary Combinations',
        categoriesAnalyzed: this.serviceConfig.yogaCategories
      };

      // Add yoga summary analysis
      yogasResult.yogaSummary = this._analyzeYogaSummary(yogasResult.yogas);

      return yogasResult;
    } catch (error) {
      logger.error(`❌ Error in ${this.serviceName} calculation:`, error);
      throw new Error(`Vedic Yogas calculation failed: ${error.message}`);
    }
  }

  /**
   * Format Vedic Yogas result for WhatsApp output
   * @param {Object} result - Calculation result
   * @returns {string} Formatted WhatsApp message
   */
  formatResult(result) {
    if (!result || !result.yogas) {
      return '❌ *Vedic Yogas Analysis Error*\n\nUnable to generate yoga analysis. Please check your birth details and try again.';
    }

    let formatted = '🌟 *Vedic Yogas Analysis*\n\n';

    // Add overall influence
    if (result.overallInfluence) {
      formatted += `*Overall Yoga Influence:* ${result.overallInfluence}\n\n`;
    }

    // Add present yogas by category
    const { yogas } = result;

    // Panch Mahapurusha Yogas
    if (yogas.panchMahapurushaYogas) {
      formatted += '*🏆 Panch Mahapurusha Yogas:*\n';
      Object.entries(yogas.panchMahapurushaYogas).forEach(
        ([yogaName, yoga]) => {
          if (yoga.present) {
            formatted += `• ${this._formatYogaName(yogaName)}: ${yoga.description}\n`;
          }
        }
      );
      if (!Object.values(yogas.panchMahapurushaYogas).some(y => y.present)) {
        formatted += '• No major Panch Mahapurusha Yogas present\n';
      }
      formatted += '\n';
    }

    // Raj Yoga
    if (yogas.rajYoga?.present) {
      formatted += '*👑 Raj Yoga:*\n';
      formatted += `• ${yogas.rajYoga.description}\n`;
      formatted += `• Strength: ${yogas.rajYoga.strength}/10\n\n`;
    }

    // Dhan Yoga
    if (yogas.dhanYoga?.present) {
      formatted += '*💰 Dhan Yoga:*\n';
      formatted += `• ${yogas.dhanYoga.description}\n`;
      formatted += `• Strength: ${yogas.dhanYoga.strength}/10\n\n`;
    }

    // Gaja Kesari Yoga
    if (yogas.gajaKeshariYoga?.present) {
      formatted += '*🐘 Gaja Kesari Yoga:*\n';
      formatted += `• ${yogas.gajaKeshariYoga.description}\n`;
      formatted += `• ${yogas.gajaKeshariYoga.positions}\n\n`;
    }

    // Nbhaya Yoga
    if (yogas.nbhayaYoga?.present) {
      formatted += '*☀️ Nbhaya Yoga:*\n';
      formatted += `• ${yogas.nbhayaYoga.description}\n`;
      formatted += `• ${yogas.nbhayaYoga.significance}\n\n`;
    }

    // Kemadruma Yoga (inauspicious)
    if (yogas.kemadrumaYoga?.present) {
      formatted += '⚠️ *Kemadruma Yoga (Considerations):*\n';
      formatted += `• ${yogas.kemadrumaYoga.description}\n`;
      formatted += `• Remediation: ${yogas.kemadrumaYoga.remediation}\n\n`;
    }

    // Add yoga summary
    if (result.yogaSummary) {
      formatted += '*📊 Yoga Summary:*\n';
      formatted += `• Total Present Yogas: ${result.yogaSummary.totalPresent}\n`;
      formatted += `• Strongest Yoga: ${result.yogaSummary.strongest}\n`;
      formatted += `• Overall Effect: ${result.yogaSummary.overallEffect}\n\n`;
    }

    // Add interpretation if available
    if (result.interpretation) {
      formatted += '*💫 Interpretation:*\n';
      if (typeof result.interpretation === 'string') {
        formatted += result.interpretation;
      } else if (result.interpretation.summary) {
        formatted += result.interpretation.summary;
      }
      formatted += '\n\n';
    }

    formatted +=
      '*Vedic Yogas reveal special planetary combinations that create unique life patterns and potentials.*';

    return formatted;
  }

  /**
   * Validate input parameters for Vedic Yogas calculation
   * @param {Object} birthData - Birth data object
   * @private
   */
  _validateInputs(birthData) {
    if (!birthData) {
      throw new Error('Birth data is required for Vedic Yogas analysis');
    }

    if (!birthData.birthDate || !birthData.birthTime || !birthData.birthPlace) {
      throw new Error(
        'Complete birth details (date, time, place) are required'
      );
    }
  }

  /**
   * Analyze yoga summary
   * @param {Object} yogas - Yoga analysis results
   * @returns {Object} Yoga summary
   * @private
   */
  _analyzeYogaSummary(yogas) {
    const summary = {
      totalPresent: 0,
      strongest: 'None',
      overallEffect: 'Balanced',
      categories: {
        mahapurusha: 0,
        raj: 0,
        dhan: 0,
        special: 0
      }
    };

    // Count present yogas
    if (yogas.panchMahapurushaYogas) {
      const mahapurushaCount = Object.values(
        yogas.panchMahapurushaYogas
      ).filter(y => y.present).length;
      summary.categories.mahapurusha = mahapurushaCount;
      summary.totalPresent += mahapurushaCount;
    }

    if (yogas.rajYoga?.present) {
      summary.categories.raj = 1;
      summary.totalPresent += 1;
    }

    if (yogas.dhanYoga?.present) {
      summary.categories.dhan = 1;
      summary.totalPresent += 1;
    }

    if (yogas.gajaKeshariYoga?.present) {
      summary.categories.special += 1;
      summary.totalPresent += 1;
    }

    if (yogas.nbhayaYoga?.present) {
      summary.categories.special += 1;
      summary.totalPresent += 1;
    }

    // Find strongest yoga
    const allYogas = [];

    if (yogas.panchMahapurushaYogas) {
      Object.entries(yogas.panchMahapurushaYogas).forEach(([name, yoga]) => {
        if (yoga.present) {
          allYogas.push({
            name: this._formatYogaName(name),
            strength: yoga.strength || 5
          });
        }
      });
    }

    if (yogas.rajYoga?.present) {
      allYogas.push({
        name: 'Raj Yoga',
        strength: yogas.rajYoga.strength || 0
      });
    }

    if (yogas.dhanYoga?.present) {
      allYogas.push({
        name: 'Dhan Yoga',
        strength: yogas.dhanYoga.strength || 0
      });
    }

    if (yogas.gajaKeshariYoga?.present) {
      allYogas.push({
        name: 'Gaja Kesari Yoga',
        strength: yogas.gajaKeshariYoga.strength || 0
      });
    }

    if (allYogas.length > 0) {
      const strongest = allYogas.reduce((prev, current) =>
        (prev.strength > current.strength ? prev : current)
      );
      summary.strongest = strongest.name;
    }

    // Determine overall effect
    if (summary.totalPresent >= 4) {
      summary.overallEffect = 'Highly Auspicious';
    } else if (summary.totalPresent >= 2) {
      summary.overallEffect = 'Auspicious';
    } else if (summary.totalPresent === 1) {
      summary.overallEffect = 'Moderately Auspicious';
    } else {
      summary.overallEffect = 'Neutral';
    }

    // Check for Kemadruma (inauspicious)
    if (yogas.kemadrumaYoga?.present) {
      summary.overallEffect += ' (with considerations)';
    }

    return summary;
  }

  /**
   * Format yoga name for display
   * @param {string} yogaName - Yoga name from calculator
   * @returns {string} Formatted yoga name
   * @private
   */
  _formatYogaName(yogaName) {
    const nameMap = {
      ruchakaYoga: 'Ruchaka Yoga',
      bhadraYoga: 'Bhadra Yoga',
      hamsaYoga: 'Hamsa Yoga',
      malavyaYoga: 'Malavya Yoga',
      shashaYoga: 'Shasha Yoga'
    };

    return nameMap[yogaName] || yogaName.replace(/([A-Z])/g, ' $1').trim();
  }

  /**
   * Calculate confidence score for Vedic Yogas analysis
   * @param {Object} result - Calculation result
   * @returns {number} Confidence score (0-100)
   */
  calculateConfidence(result) {
    let confidence = 75; // Base confidence for yoga analysis

    // Increase confidence based on data completeness
    if (
      result.planetaryPositions &&
      Object.keys(result.planetaryPositions).length >= 7
    ) {
      confidence += 15;
    }

    if (result.yogas && Object.keys(result.yogas).length >= 5) {
      confidence += 10;
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
      result.yogas &&
      result.planetaryPositions
    );
  }

  /**
   * Get service-specific help
   * @returns {string} Help information
   */
  getHelp() {
    return `
🌟 **Vedic Yogas Service - Planetary Combinations Analysis**

**Purpose:** Identifies and analyzes special planetary combinations (Yogas) that create unique life patterns

**Required Inputs:**
• Birth date (DD/MM/YYYY)
• Birth time (HH:MM)
• Birth place (city, country)

**Yoga Categories Analyzed:**

**🏆 Panch Mahapurusha Yogas (5 Great Person Yogas):**
• Ruchaka Yoga (Mars) - Warrior qualities, leadership
• Bhadra Yoga (Mercury) - Intelligence, communication
• Hamsa Yoga (Jupiter) - Wisdom, spirituality
• Malavya Yoga (Venus) - Beauty, arts, relationships
• Shasha Yoga (Saturn) - Discipline, authority

**👑 Raj Yoga:**
• Combinations for power, authority, and success
• Kendra and Trikona lord relationships

**💰 Dhan Yoga:**
• Wealth and prosperity combinations
• Venus, Jupiter, Moon placements

**🐘 Gaja Kesari Yoga:**
• Moon-Jupiter combinations
• Wisdom, wealth, and protection

**☀️ Nbhaya Yoga:**
• Sun-Moon favorable positioning
• Courage and fearlessness

**⚠️ Kemadruma Yoga:**
• Moon isolation considerations
• Remedial measures included

**Analysis Includes:**
• Yoga identification and strength
• Life area influences
• Auspicious and inauspicious combinations
• Overall chart potential
• Interpretation and guidance

**Example Usage:**
"Analyze my Vedic Yogas"
"What yogas are present in my chart?"
"Yoga analysis for birth date 15/06/1990"

**Output Format:**
Comprehensive yoga analysis with life pattern interpretations
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

module.exports = VedicYogasService;
