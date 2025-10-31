const { NadiDataProvider } = require('./NadiDataProvider');
const { NadiCalculator } = require('./NadiCalculator');
const { NadiAnalyzer } = require('./NadiAnalyzer');
const { NadiFormatter } = require('./NadiFormatter');

class NadiReader {
  constructor() {
    this.dataProvider = new NadiDataProvider();
    this.calculator = new NadiCalculator(this.dataProvider);
    this.analyzer = new NadiAnalyzer();
    this.formatter = new NadiFormatter();
  }

  /**
   * Calculate Nadi astrology reading
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @param {string} birthTime - Birth time in HH:MM format
   * @param {string} birthPlace - Birth place
   * @returns {Object} Nadi astrology analysis
   */
  calculateNadiReading(birthDate, birthTime, birthPlace) {
    try {
      const birthNakshatra = this.calculator.calculateBirthNakshatra(birthDate, birthTime);
      const nadiSystem = this.calculator.determineNadiSystem(birthNakshatra, birthDate);
      const dashaPeriod = this.calculator.calculateCurrentDasha(birthDate);
      const predictions = this.analyzer.generateNadiPredictions(
        birthNakshatra,
        nadiSystem,
        dashaPeriod
      );

      return {
        birthNakshatra,
        nadiSystem,
        currentDasha: dashaPeriod,
        predictions,
        remedies: this.analyzer.generateNadiRemedies(birthNakshatra, nadiSystem),
        lifePurpose: nadiSystem.lifePurpose,
        compatibility: this.analyzer.generateCompatibilityInsights(birthNakshatra)
      };
    } catch (error) {
      console.error('Error calculating Nadi reading:', error);
      return { error: 'Unable to calculate Nadi reading at this time' };
    }
  }

  /**
   * Format Nadi reading for WhatsApp display
   * @param {Object} reading - Nadi reading
   * @returns {string} Formatted reading text
   */
  formatReadingForWhatsApp(reading) {
    return this.formatter.formatReadingForWhatsApp(reading);
  }
}

/**
 * Generate a Nadi astrology reading based on user data
 * @param {Object} user - User data with birth information
 * @returns {Object} Formatted Nadi reading
 */
function generateNadiReading(user) {
  try {
    if (!user || !user.birthDate) {
      return {
        error: 'Birth date is required for Nadi reading',
        nadiType: 'Unknown',
        dasaPeriods: [],
        remedies: [],
        predictions: {},
        interpretation:
          'Please provide your birth date for accurate Nadi analysis'
      };
    }

    // Parse birth date and create sample time/place if not provided
    const { birthDate } = user;
    const birthTime = user.birthTime || '12:00';
    const birthPlace = user.birthPlace || 'Unknown';

    const reading = module.exports.calculateNadiReading(
      birthDate,
      birthTime,
      birthPlace
    );

    if (reading.error) {
      return {
        error: reading.error,
        nadiType: 'Unknown',
        dasaPeriods: [],
        remedies: [],
        predictions: {},
        interpretation: 'Unable to generate Nadi reading at this time'
      };
    }

    return {
      nadiType: reading.nadiSystem.name,
      dasaPeriods: [
        {
          planet: reading.currentDasha.planet,
          startDate: 'Current',
          endDate: `${reading.currentDasha.remaining} years`,
          effects: reading.currentDasha.influence
        }
      ],
      remedies: reading.remedies,
      predictions: reading.predictions,
      interpretation: `Your ${reading.nadiSystem.name} indicates ${reading.nadiSystem.characteristics}. Current ${reading.currentDasha.planet} dasha brings ${reading.currentDasha.characteristics}.`
    };
  } catch (error) {
    console.error('Error generating Nadi reading:', error);
    return {
      error: 'Unable to generate Nadi reading',
      nadiType: 'Unknown',
      dasaPeriods: [],
      remedies: ['Consult a qualified Nadi astrologer'],
      predictions: {},
      interpretation: 'Please try again later'
    };
  }
}

module.exports = new NadiReader();
module.exports.generateNadiReading = generateNadiReading;
