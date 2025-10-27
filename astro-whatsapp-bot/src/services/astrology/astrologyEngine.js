const logger = require('../../utils/logger');

// Import utility functions
const { extractPartnerData, matchesIntent, validateBirthData } = require('./utils/intentUtils');

// Import handler modules
const { handleGreeting, handleDefaultResponse, handleMenu, handleUpdateProfile } = require('./handlers/basicHandlers');
const { handleHoroscope, handleNumerology, handleSolarReturn, handleAsteroids } = require('./handlers/westernHandlers');
const { handleChineseAstrology, handleTarot, handlePalmistry, handleKabbalistic, handleMayan, handleCeltic, handleIChing, handleAstrocartography } = require('./handlers/specializedHandlers');
const { handleNadi, handleFixedStars, handleMedicalAstrology, handleFinancialAstrology, handleHarmonicAstrology, handleCareerAstrology, handleVedicRemedies, handleIslamicAstrology, handleVimshottariDasha, handleJaiminiAstrology, handleHinduFestivals, handleVedicNumerology, handleAyurvedicAstrology } = require('./handlers/vedicHandlers');
const { handleEventAstrology, handleFutureSelf, handleGroupAstrology, handleMarriageCompatibility, handleLagnaAnalysis, handlePrashna, handleElectional, handleHorary, handleSecondaryProgressions, handleSolarArc } = require('./handlers/predictiveHandlers');

logger.info('Module: astrologyEngine loaded. All sub-modules imported successfully.');

/**
 * Generates an astrology response based on user input and user data.
 * Uses basic Vedic astrology calculations for MVP functionality.
 * @param {string} messageText - The text message from the user.
 * @param {Object} user - The user object containing profile information.
 * @returns {Promise<string>} The generated astrology response.
 */
const generateAstrologyResponse = async(messageText, user) => {
  logger.info(
    `Generating astrology response for user ${user.phoneNumber} with message: ${messageText}`
  );

  const message = messageText.toLowerCase().trim();

  // Try each handler in order of priority
  try {
    // Basic handlers (greetings, menu, etc.)
    let response = await handleGreeting(message, user);
    if (response) return response;

    response = await handleMenu(message, user);
    if (response) return response;

    response = await handleUpdateProfile(message, user);
    if (response) return response;

    // Western astrology handlers
    response = await handleHoroscope(message, user);
    if (response) return response;

    response = await handleNumerology(message, user);
    if (response) return response;

    response = await handleSolarReturn(message, user);
    if (response) return response;

    response = await handleAsteroids(message, user);
    if (response) return response;

    // Specialized astrology handlers
    response = await handleChineseAstrology(message, user);
    if (response) return response;

    response = await handleTarot(message, user);
    if (response) return response;

    response = await handlePalmistry(message, user);
    if (response) return response;

    response = await handleKabbalistic(message, user);
    if (response) return response;

    response = await handleMayan(message, user);
    if (response) return response;

    response = await handleCeltic(message, user);
    if (response) return response;

    response = await handleIChing(message, user);
    if (response) return response;

    response = await handleAstrocartography(message, user);
    if (response) return response;

    // Vedic astrology handlers
    response = await handleNadi(message, user);
    if (response) return response;

    response = await handleFixedStars(message, user);
    if (response) return response;

    response = await handleMedicalAstrology(message, user);
    if (response) return response;

    response = await handleFinancialAstrology(message, user);
    if (response) return response;

    response = await handleHarmonicAstrology(message, user);
    if (response) return response;

    response = await handleCareerAstrology(message, user);
    if (response) return response;

    response = await handleVedicRemedies(message, user);
    if (response) return response;

    response = await handleIslamicAstrology(message, user);
    if (response) return response;

    response = await handleVimshottariDasha(message, user);
    if (response) return response;

    response = await handleJaiminiAstrology(message, user);
    if (response) return response;

    response = await handleHinduFestivals(message, user);
    if (response) return response;

    response = await handleVedicNumerology(message, user);
    if (response) return response;

    response = await handleAyurvedicAstrology(message, user);
    if (response) return response;

    // Predictive astrology handlers
    response = await handleEventAstrology(message, user);
    if (response) return response;

    response = await handleFutureSelf(message, user);
    if (response) return response;

    response = await handleGroupAstrology(message, user);
    if (response) return response;

    response = await handleMarriageCompatibility(message, user);
    if (response) return response;

    response = await handleLagnaAnalysis(message, user);
    if (response) return response;

    response = await handlePrashna(message, user);
    if (response) return response;

    response = await handleElectional(message, user);
    if (response) return response;

    response = await handleHorary(message, user);
    if (response) return response;

    response = await handleSecondaryProgressions(message, user);
    if (response) return response;

    response = await handleSolarArc(message, user);
    if (response) return response;

    // Default response if no handlers matched
    return handleDefaultResponse(message, user);

  } catch (error) {
    logger.error('Error in generateAstrologyResponse:', error);
    return '❌ Sorry, I\'m experiencing technical difficulties right now. Please try again later.';
  }
};

/**
 * Validate birth data format and completeness
 * @param {string} birthDate - Birth date string
 * @param {string} birthTime - Birth time string
 * @param {string} birthPlace - Birth place string
 * @returns {Object} Validation result
 */


module.exports = {
  generateAstrologyResponse,
  validateBirthData
};
