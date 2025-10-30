/**
 * Modern Vedic Handlers - Clean Architecture
 * All handler functions extracted into individual modular files for maintainability
 * Complex calculation functions centralized in dedicated calculations module
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

// Import centralized calculation functions from dedicated module
const {
  calculateJaiminiKarakaAnalysis,
  calculateFinancialAstrologyAnalysis,
  calculateMedicalAstrologyAnalysis,
  calculateCareerAstrologyAnalysis,
  calculateAshtakavarga,
  calculateFixedStarsAnalysis
} = require('./vedic/calculations');

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

  // Centralized calculation functions
  calculateJaiminiKarakaAnalysis,
  calculateFinancialAstrologyAnalysis,
  calculateMedicalAstrologyAnalysis,
  calculateCareerAstrologyAnalysis,
  calculateAshtakavarga,
  calculateFixedStarsAnalysis
};