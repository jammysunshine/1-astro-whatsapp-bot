const { handleNadi } = require('./NadiAstrologyHandler');
const { handleFixedStars } = require('./FixedStarsHandler');
const { handleMedicalAstrology } = require('./MedicalAstrologyHandler');
const { handleFinancialAstrology } = require('./FinancialAstrologyHandler');
const { handleHarmonicAstrology } = require('./HarmonicAstrologyHandler');
const { handleCareerAstrology } = require('./CareerAstrologyHandler');
const { handleVedicRemedies } = require('./VedicRemediesHandler');
const { handlePanchang } = require('./PanchangHandler');
const { handleAshtakavarga } = require('./AshtakavargaHandler');
const { handleFutureSelf } = require('./FutureSelfHandler');

// Export all handlers
module.exports = {
  handleNadi,
  handleFixedStars,
  handleMedicalAstrology,
  handleFinancialAstrology,
  handleHarmonicAstrology,
  handleCareerAstrology,
  handleVedicRemedies,
  handlePanchang,
  handleAshtakavarga,
  handleFutureSelf
};