/**
 * Vedic Astrology Handlers Interface
 * Clean interface that exports all handler and calculation functions for the astrology engine
 * 
 * Architecture:
 * - Handlers: Process user requests and coordinate calculations
 * - Calculations: Perform complex astrological computations
 * - Clear separation of concerns with single source of truth
 */

// Import all handler functions from individual modules
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

// Import all calculation functions from centralized calculations module
const {
  calculateJaiminiKarakaAnalysis,
  calculateFinancialAstrologyAnalysis,
  calculateMedicalAstrologyAnalysis,
  calculateCareerAstrologyAnalysis,
  calculateAshtakavarga,
  calculateFixedStarsAnalysis
} = require('./vedic/calculations.js');

/**
 * Vedic Astrology Handlers Interface
 * Provides a clean, organized export of all handler functionality
 */
module.exports = {
  // === MESSAGE HANDLERS ===
  // Process user requests and return appropriate responses
  
  /** Nadi Palm Leaf Reading Handler */
  handleNadi,
  
  /** Fixed Stars Analysis Handler */  
  handleFixedStars,
  
  /** Medical Astrology Handler */
  handleMedicalAstrology,
  
  /** Financial Astrology Handler */
  handleFinancialAstrology,
  
  /** Harmonic Astrology Handler */
  handleHarmonicAstrology,
  
  /** Career Astrology Handler */
  handleCareerAstrology,
  
  /** Vedic Remedies Handler */
  handleVedicRemedies,
  
  /** Panchang (Hindu Calendar) Handler */
  handlePanchang,
  
  /** Ashtakavarga Analysis Handler */
  handleAshtakavarga,
  
  /** Future Self Analysis Handler */
  handleFutureSelf,
  
  /** Islamic Astrology Handler */
  handleIslamicAstrology,
  
  /** Vimshottari Dasha Handler */
  handleVimshottariDasha,
  
  /** Jaimini Astrology Handler */
  handleJaiminiAstrology,
  
  /** Hindu Festivals Handler */
  handleHinduFestivals,
  
  /** Vedic Numerology Handler */
  handleVedicNumerology,
  
  /** Ayurvedic Astrology Handler */
  handleAyurvedicAstrology,

  // === CALCULATION FUNCTIONS ===
  // Perform complex astrological computations
  
  /** Jaimini Karaka Analysis Calculator */
  calculateJaiminiKarakaAnalysis,
  
  /** Financial Astrology Analysis Calculator */
  calculateFinancialAstrologyAnalysis,
  
  /** Medical Astrology Analysis Calculator */
  calculateMedicalAstrologyAnalysis,
  
  /** Career Astrology Analysis Calculator */
  calculateCareerAstrologyAnalysis,
  
  /** Ashtakavarga Analysis Calculator */
  calculateAshtakavarga,
  
  /** Fixed Stars Analysis Calculator */
  calculateFixedStarsAnalysis
};