/**
 * Modern Vedic Handlers - Clean Architecture
 * All handler functions extracted into individual modular files for maintainability
 * Complex calculation functions moved to dedicated calculations module
 */

// Import decomposed handler functions from individual modules
const {
  handleNadi,
  handleFixedStars,
  handleMedicalAstrology,
  handleFinancialAstrology,
  handleHarmonicAstrology,
  handleCareerAstrology,
  handleVedicRemedies,
  handlePanchang,
  handleAshtakavarga,
  handleFutureSelf,
  handleIslamicAstrology,
  handleVimshottariDasha,
  handleJaiminiAstrology,
  handleHinduFestivals,
  handleVedicNumerology,
  handleAyurvedicAstrology
} = require('./vedic');

// Import complex calculation functions from dedicated module
const {
  calculateJaiminiKarakaAnalysis,
  calculateFinancialAstrologyAnalysis,
  calculateMedicalAstrologyAnalysis,
  calculateCareerAstrologyAnalysis,
  calculateAshtakavarga,
  calculateFixedStarsAnalysis
} = require('./vedic/calculations');

// Utility functions for astronomical calculations
const sweph = require('sweph');

/**
 * Utility function to get zodiac sign from longitude
 * @param {number} longitude - Longitude in degrees (0-360)
 * @returns {string} Zodiac sign name
 */
const longitudeToSign = (longitude) => {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  // Normalize longitude to 0-360 range
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  return signs[signIndex];
};

/**
 * Utility function to get house number from longitude and ascendant
 * @param {number} longitude - Planet longitude in degrees
 * @param {number} ascendant - Ascendant longitude in degrees
 * @returns {number} House number (1-12)
 */
const longitudeToHouse = (longitude, ascendant) => {
  const angle = ((longitude - ascendant + 360) % 360);
  return Math.floor(angle / 30) + 1;
};

// Export all handlers and calculation functions for use by the astrology engine
module.exports = {
  // Core Vedic astrology handlers
  handleNadi,
  handleFixedStars,
  handleMedicalAstrology,
  handleFinancialAstrology,
  handleHarmonicAstrology,
  handleCareerAstrology,
  handleVedicRemedies,
  handlePanchang,
  handleAshtakavarga,
  handleFutureSelf,
  handleIslamicAstrology,
  handleVimshottariDasha,
  handleJaiminiAstrology,
  handleHinduFestivals,
  handleVedicNumerology,
  handleAyurvedicAstrology,

  // Complex calculation functions
  calculateJaiminiKarakaAnalysis,
  calculateFinancialAstrologyAnalysis,
  calculateMedicalAstrologyAnalysis,
  calculateCareerAstrologyAnalysis,
  calculateAshtakavarga,
  calculateFixedStarsAnalysis,

  // Utility functions
  longitudeToSign,
  longitudeToHouse,

  // Swiss Ephemeris library access for downstream calculations
  sweph
};