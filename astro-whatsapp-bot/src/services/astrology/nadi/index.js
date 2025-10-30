// Nadi Astrology Modular System
// Main entry point for the new modular Nadi Astrology implementation

const nadiAstrology = require('./nadi-main.js');

module.exports = {
  // Main NadiAstrology class
  NadiAstrology: nadiAstrology.NadiAstrology,
  createNadiAstrology: nadiAstrology.createNadiAstrology,

  // Specialized modules
  NadiConfig: require('./NadiConfig.js').NadiConfig,
  NadiCalculator: require('./NadiCalculator.js').NadiCalculator,
  NadiPredictor: require('./NadiPredictor.js').NadiPredictor,

  // Legacy support
  initialize: nadiAstrology.initialize
};