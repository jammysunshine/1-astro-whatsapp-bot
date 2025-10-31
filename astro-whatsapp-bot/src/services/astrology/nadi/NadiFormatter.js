const logger = require('../../../utils/logger');

/**
 * NadiFormatter - Formats Nadi reading results for display and response
 * Handles all output formatting, error responses, and user presentation
 */
class NadiFormatter {
  constructor() {
    this.logger = logger;
  }

  /**
   * Format complete Nadi reading for user response
   * @param {Object} user - User data with birth information
   * @param {Object} reading - Nadi reading data
   * @returns {Object} Formatted response
   */
  formatNadiReadingResponse(user, reading) {
    try {
      if (reading.error) {
        return this.formatErrorResponse(reading.error);
      }

      return {
        nadiType: reading.nadiSystem.name,
        dasaPeriods: this.formatDashaPeriods(reading.currentDasha),
        remedies: this.formatRemedies(reading.remedies),
        predictions: reading.predictions,
        interpretation: this.generateInterpretationString(reading),
        compatibility: reading.compatibility
      };
    } catch (error) {
      this.logger.error('Nadi formatting error:', error);
      return this.formatErrorResponse('Unable to format Nadi reading');
    }
  }

  /**
   * Format error response
   * @param {string} errorMessage - Error message
   * @returns {Object} Formatted error response
   */
  formatErrorResponse(errorMessage) {
    return {
      error: errorMessage,
      nadiType: 'Unknown',
      dasaPeriods: [],
      remedies: ['Consult a qualified Nadi astrologer'],
      predictions: {},
      interpretation: 'Please try again later'
    };
  }

  /**
   * Format dasha periods for response
   * @param {Object} currentDasha - Current dasha data
   * @returns {Array} Formatted dasha periods
   */
  formatDashaPeriods(currentDasha) {
    if (!currentDasha || currentDasha.error) {
      return [];
    }

    return [{
      planet: currentDasha.planet,
      startDate: 'Current',
      endDate: `${currentDasha.remaining} years`,
      effects: currentDasha.influence
    }];
  }

  /**
   * Format remedies for response
   * @param {Array} remedies - Raw remedies array
   * @returns {Array} Formatted remedies
   */
  formatRemedies(remedies) {
    if (!remedies || remedies.length === 0) {
      return ['Consult a qualified Nadi astrologer for personalized remedies'];
    }

    return remedies.slice(0, 8).map(remedy =>
      (typeof remedy === 'string' ? remedy : remedy.remedy || remedy)
    );
  }

  /**
   * Generate interpretation string
   * @param {Object} reading - Complete reading data
   * @returns {string} Interpretation summary
   */
  generateInterpretationString(reading) {
    if (!reading.nadiSystem || !reading.birthNakshatra) {
      return 'Unable to generate interpretation at this time';
    }

    const { nadiSystem, birthNakshatra, currentDasha } = reading;

    let interpretation = `Your ${nadiSystem.name} indicates ${nadiSystem.characteristics.toLowerCase()}. `;

    if (currentDasha && !currentDasha.error) {
      interpretation += `Current ${currentDasha.planet} dasha brings ${currentDasha.characteristics.toLowerCase()}. `;
    }

    interpretation += `Life purpose centers on ${nadiSystem.lifePurpose.toLowerCase()}.`;

    return interpretation;
  }

  /**
   * Format validation error for missing birth data
   * @returns {Object} Formatted error response
   */
  formatBirthDataRequiredError() {
    return {
      error: 'Birth date is required for Nadi reading',
      nadiType: 'Unknown',
      dasaPeriods: [],
      remedies: [],
      predictions: {},
      interpretation: 'Please provide your birth date for accurate Nadi analysis'
    };
  }
}

module.exports = { NadiFormatter };
