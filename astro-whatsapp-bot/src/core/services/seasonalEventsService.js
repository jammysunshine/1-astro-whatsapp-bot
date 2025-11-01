const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');

/**
 * SeasonalEventsService - Service for tracking and analyzing seasonal astrological events
 *
 * Provides information and interpretations for major seasonal astrological events such as
 * solstices, equinoxes, and cross-quarter days, highlighting their spiritual significance
 * and potential impact on personal and collective energies.
 */
class SeasonalEventsService extends ServiceTemplate {
  constructor() {
    super('CosmicEventsCalculator'); // Primary calculator for this service
    this.calculatorPath = './calculators/CosmicEventsCalculator';
    this.serviceName = 'SeasonalEventsService';
    logger.info('SeasonalEventsService initialized');
  }

  /**
   * Main calculation method for Seasonal Events analysis.
   * @param {number} year - The year for which to retrieve seasonal events.
   * @returns {Promise<Object>} Comprehensive seasonal events analysis.
   */
  async processCalculation(year) {
    try {
      // Ensure calculator is loaded
      if (!this.calculator) {
        await this.initialize();
      }

      this._validateInput(year);

      // Perform seasonal events analysis using the dynamically loaded calculator
      const events = await this.calculator.getSeasonalEvents(year);

      // Generate additional insights
      const eventSummary = this._createEventSummary(events);
      const keyThemes = this._identifyKeyThemes(events);
      const spiritualGuidance = this._getSpiritualGuidance(events);

      return {
        events,
        eventSummary,
        keyThemes,
        spiritualGuidance,
        summary: this._createComprehensiveSummary(events, eventSummary)
      };
    } catch (error) {
      logger.error('SeasonalEventsService processCalculation error:', error);
      throw new Error(`Seasonal events analysis failed: ${error.message}`);
    }
  }

  /**
   * Validates input data for seasonal events analysis.
   * @param {number} year - Year to validate.
   * @private
   */
  _validateInput(year) {
    if (typeof year !== 'number' || year < 1900 || year > 2100) {
      throw new Error(
        'A valid year (between 1900 and 2100) is required for seasonal events analysis.'
      );
    }
  }

  /**
   * Formats the seasonal events analysis result for consistent output.
   * @param {Object} result - Raw seasonal events analysis result.
   * @returns {Object} Formatted result.
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        message: 'Seasonal events analysis failed',
        service: this.serviceName
      };
    }

    return {
      success: true,
      data: result,
      summary: result.summary || 'Seasonal events analysis completed',
      metadata: {
        serviceName: this.serviceName,
        calculationType: 'Seasonal Events Analysis',
        timestamp: new Date().toISOString()
      },
      disclaimer:
        'Seasonal events analysis provides insights into the energetic shifts of the year. This information is for spiritual guidance and personal reflection, not definitive prediction. Individual experiences may vary.'
    };
  }

  /**
   * Creates a summary of the seasonal events.
   * @param {Array} events - List of seasonal events.
   * @returns {Object} Event summary.
   * @private
   */
  _createEventSummary(events) {
    const summary = {
      totalEvents: events.length,
      solstices: events.filter(e => e.type === 'solstice').length,
      equinoxes: events.filter(e => e.type === 'equinox').length,
      crossQuarterDays: events.filter(e => e.type === 'cross-quarter').length,
      majorEvents: events.filter(e => e.significance === 'high').length
    };
    return summary;
  }

  /**
   * Identifies key themes associated with seasonal events.
   * @param {Array} events - List of seasonal events.
   * @returns {Array} Key themes.
   * @private
   */
  _identifyKeyThemes(events) {
    const themes = [];
    events.forEach(event => {
      if (event.theme) {
        themes.push(event.theme);
      }
    });
    return [...new Set(themes)].slice(0, 5); // Unique themes
  }

  /**
   * Provides spiritual guidance for seasonal events.
   * @param {Array} events - List of seasonal events.
   * @returns {Array} Spiritual guidance.
   * @private
   */
  _getSpiritualGuidance(events) {
    const guidance = [];
    events.forEach(event => {
      if (event.guidance) {
        guidance.push(event.guidance);
      }
    });
    return guidance.slice(0, 5);
  }

  /**
   * Creates a comprehensive summary of the seasonal events analysis.
   * @param {Array} events - List of seasonal events.
   * @param {Object} eventSummary - Summary of events.
   * @returns {string} Comprehensive summary text.
   * @private
   */
  _createComprehensiveSummary(events, eventSummary) {
    let summary = `This analysis covers ${eventSummary.totalEvents} major seasonal astrological events for the year ${events[0]?.year || 'N/A'}. `;
    summary += `Key events include ${eventSummary.solstices} solstices, ${eventSummary.equinoxes} equinoxes, and ${eventSummary.crossQuarterDays} cross-quarter days. `;
    summary +=
      'These events mark significant energetic shifts throughout the year, influencing natural cycles and offering opportunities for spiritual alignment and personal growth. Understanding these rhythms can enhance your connection to nature and your inner self.';
    return summary;
  }

  /**
   * Returns metadata for the service.
   * @returns {Object} Service metadata.
   */
  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'astronomy',
      methods: [
        'processCalculation',
        'getSeasonalEvents',
        'getSolstices',
        'getEquinoxes',
        'getCrossQuarterDays'
      ],
      dependencies: [], // Managed by ServiceTemplate
      description:
        'Service for tracking and analyzing seasonal astrological events.'
    };
  }

  /**
   * Returns help information for the service.
   * @returns {string} Help text.
   */
  getHelp() {
    return `
🌿 **Seasonal Events Service - Astrological Rhythms of the Year**

**Purpose:** Provides information and interpretations for major seasonal astrological events such as solstices, equinoxes, and cross-quarter days, highlighting their spiritual significance and potential impact on personal and collective energies.

**Required Inputs:**
• Year (number, e.g., 2025)

**Analysis Includes:**
• **Solstices:** Summer and Winter Solstices, marking peaks of light and darkness.
• **Equinoxes:** Spring and Autumn Equinoxes, representing balance and transition.
• **Cross-Quarter Days:** Midpoints between solstices and equinoxes, significant in ancient traditions.
• **Event Summary:** Overview of event types and their spiritual significance.
• **Key Themes:** Dominant energies and focus areas for each seasonal period.
• **Spiritual Guidance:** Recommendations for aligning with the natural rhythms of the year.

**Example Usage:**
"List all seasonal astrological events for 2025."
"What is the spiritual significance of the upcoming Summer Solstice?"

**Output Format:**
Detailed report with a chronological list of seasonal events, their interpretations, and guidance for spiritual alignment.
    `.trim();
  }
}

module.exports = SeasonalEventsService;
