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
const { handleIslamicAstrology } = require('./IslamicAstrologyHandler');
const { handleVimshottariDasha } = require('./VimshottariDashaHandler');
const { handleJaiminiAstrology } = require('./JaiminiAstrologyHandler');
const { handleHinduFestivals } = require('./HinduFestivalsHandler');
const { handleVedicNumerology } = require('./VedicNumerologyHandler');
const { handleAyurvedicAstrology } = require('./AyurvedicAstrologyHandler');

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
  handleFutureSelf,
  handleIslamicAstrology,
  handleVimshottariDasha,
  handleJaiminiAstrology,
  handleHinduFestivals,
  handleVedicNumerology,
  handleAyurvedicAstrology
};