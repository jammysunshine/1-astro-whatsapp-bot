const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');

/**
 * PlanetaryEventsService - Service for tracking and analyzing major planetary events
 *
 * Provides information and interpretations for significant planetary events such as
 * retrogrades, conjunctions, oppositions, and ingresses, highlighting their astrological
 * significance and potential impact.
 */
class PlanetaryEventsService extends ServiceTemplate {
  constructor() {
    super('ChartGenerator'); // Primary calculator for this service
    this.calculatorPath = './calculators/ChartGenerator';
    this.serviceName = 'PlanetaryEventsService';
    this.calculatorPath = './calculators/PlanetaryEventsCalculator';
    logger.info('PlanetaryEventsService initialized');
  }

  /**
   * Main calculation method for Planetary Events analysis.
   * @param {Object} dateRange - Object containing start and end dates.
   * @param {string} dateRange.startDate - Start date (ISO string).
   * @param {string} dateRange.endDate - End date (ISO string).
   * @returns {Promise<Object>} Comprehensive planetary events analysis.
   */
  async processCalculation(dateRange) {
    try {
      // Ensure calculator is loaded
      if (!this.calculator) {
        await this.initialize();
      }

      this._validateInput(dateRange);

      // Perform planetary events analysis using the dynamically loaded calculator
      const events = await this.calculator.getMajorPlanetaryEvents(
        dateRange.startDate,
        dateRange.endDate
      );

      // Generate additional insights
      const eventSummary = this._createEventSummary(events);
      const keyPeriods = this._identifyKeyPeriods(events);
      const generalInfluences = this._getGeneralInfluences(events);

      return {
        events,
        eventSummary,
        keyPeriods,
        generalInfluences,
        summary: this._createComprehensiveSummary(events, eventSummary)
      };
    } catch (error) {
      logger.error('PlanetaryEventsService processCalculation error:', error);
      throw new Error(`Planetary events analysis failed: ${error.message}`);
    }
  }

  /**
   * Validates input data for planetary events analysis.
   * @param {Object} dateRange - Date range to validate.
   * @private
   */
  _validateInput(dateRange) {
    if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
      throw new Error(
        'Start date and end date are required for planetary events analysis.'
      );
    }
    // Basic date format validation (can be enhanced)
    if (
      typeof dateRange.startDate !== 'string' ||
      !dateRange.startDate.match(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      )
    ) {
      throw new Error(
        'Start date must be in ISO 8601 format (e.g., YYYY-MM-DDTHH:mm:ss.sssZ)'
      );
    }
    if (
      typeof dateRange.endDate !== 'string' ||
      !dateRange.endDate.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    ) {
      throw new Error(
        'End date must be in ISO 8601 format (e.g., YYYY-MM-DDTHH:mm:ss.sssZ)'
      );
    }
    if (new Date(dateRange.startDate) >= new Date(dateRange.endDate)) {
      throw new Error('Start date must be before end date.');
    }
  }

  /**
   * Formats the planetary events analysis result for consistent output.
   * @param {Object} result - Raw planetary events analysis result.
   * @returns {Object} Formatted result.
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        message: 'Planetary events analysis failed',
        service: this.serviceName
      };
    }

    return {
      success: true,
      data: result,
      summary: result.summary || 'Planetary events analysis completed',
      metadata: {
        serviceName: this.serviceName,
        calculationType: 'Planetary Events Analysis',
        timestamp: new Date().toISOString()
      },
      disclaimer:
        'Planetary events analysis provides insights into general astrological influences. Individual experiences may vary based on personal birth charts. This information is for guidance and awareness, not definitive prediction.'
    };
  }

  /**
   * Creates a summary of the planetary events.
   * @param {Array} events - List of planetary events.
   * @returns {Object} Event summary.
   * @private
   */
  _createEventSummary(events) {
    const summary = {
      totalEvents: events.length,
      retrogrades: events.filter(e => e.type === 'retrograde').length,
      conjunctions: events.filter(e => e.type === 'conjunction').length,
      oppositions: events.filter(e => e.type === 'opposition').length,
      ingresses: events.filter(e => e.type === 'ingress').length,
      majorEvents: events.filter(e => e.significance === 'high').length,
      minorEvents: events.filter(e => e.significance === 'low').length
    };
    return summary;
  }

  /**
   * Identifies key periods based on planetary events.
   * @param {Array} events - List of planetary events.
   * @returns {Array} Key periods.
   * @private
   */
  _identifyKeyPeriods(events) {
    const periods = [];
    events.forEach(event => {
      if (event.significance === 'high') {
        periods.push({
          date: event.date,
          event: event.description,
          impact: event.impact || 'Significant global and personal influence'
        });
      }
    });
    return periods.slice(0, 5);
  }

  /**
   * Gets general influences of planetary events.
   * @param {Array} events - List of planetary events.
   * @returns {Array} General influences.
   * @private
   */
  _getGeneralInfluences(events) {
    const influences = [];
    events.forEach(event => {
      if (event.generalInfluence) {
        influences.push(event.generalInfluence);
      }
    });
    return [...new Set(influences)].slice(0, 5); // Unique influences
  }

  /**
   * Creates a comprehensive summary of the planetary events analysis.
   * @param {Array} events - List of planetary events.
   * @param {Object} eventSummary - Summary of events.
   * @returns {string} Comprehensive summary text.
   * @private
   */
  _createComprehensiveSummary(events, eventSummary) {
    let summary = `This analysis covers ${eventSummary.totalEvents} major planetary events between ${events[0]?.date.substring(0, 10) || 'N/A'} and ${events[events.length - 1]?.date.substring(0, 10) || 'N/A'}. `;
    summary += `Key events include ${eventSummary.retrogrades} retrogrades, ${eventSummary.conjunctions} conjunctions, and ${eventSummary.oppositions} oppositions. `;
    summary +=
      'These events signify important shifts in cosmic energies, influencing global trends and personal experiences. Understanding these cycles can help in navigating life with greater awareness.';
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
        'getMajorPlanetaryEvents',
        'getRetrogradePeriods',
        'getConjunctions',
        'getOppositions',
        'getIngresses'
      ],
      dependencies: [], // Managed by ServiceTemplate
      description: 'Service for tracking and analyzing major planetary events.'
    };
  }

  /**
   * Returns help information for the service.
   * @returns {string} Help text.
   */
  getHelp() {
    return `
🪐 **Planetary Events Service - Cosmic Calendar & Influences**

**Purpose:** Provides information and interpretations for significant planetary events such as retrogrades, conjunctions, oppositions, and ingresses, highlighting their astrological significance and potential impact.

**Required Inputs:**
• Date range (Object with startDate and endDate in ISO 8601 format, e.g., { startDate: '2025-01-01T00:00:00.000Z', endDate: '2025-03-31T23:59:59.999Z' })

**Analysis Includes:**
• **Major Planetary Events:** Details of retrogrades, conjunctions, oppositions, and ingresses.
• **Event Summary:** Overview of event types and their frequency within the period.
• **Key Periods:** Identification of dates with high astrological significance.
• **General Influences:** Broad interpretations of how these events might affect global trends and personal experiences.

**Example Usage:**
"List major planetary events between 2025-01-01 and 2025-06-30."
"What are the upcoming retrogrades for the next three months?"

**Output Format:**
Detailed report with a chronological list of planetary events, their interpretations, and a summary of influences.
    `.trim();
  }
}

module.exports = PlanetaryEventsService;
