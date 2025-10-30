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

  try {
    // Define handler groups for better organization and performance
    const handlerGroups = [
      // Basic handlers (greetings, menu, etc.)
      [handleGreeting, handleMenu, handleUpdateProfile],

      // Western astrology handlers
      [handleHoroscope, handleNumerology, handleSolarReturn, handleAsteroids],

      // Specialized astrology handlers
      [handleChineseAstrology, handleTarot, handlePalmistry, handleKabbalistic,
        handleMayan, handleCeltic, handleIChing, handleAstrocartography],

      // Vedic astrology handlers
      [handleNadi, handleFixedStars, handleMedicalAstrology, handleFinancialAstrology,
        handleHarmonicAstrology, handleCareerAstrology, handleVedicRemedies,
        handleIslamicAstrology, handleVimshottariDasha, handleJaiminiAstrology,
        handleHinduFestivals, handleVedicNumerology, handleAyurvedicAstrology],

      // Predictive astrology handlers
      [handleEventAstrology, handleFutureSelf, handleGroupAstrology,
        handleMarriageCompatibility, handleLagnaAnalysis, handlePrashna,
        handleElectional, handleHorary, handleSecondaryProgressions, handleSolarArc]
    ];

    // Execute handlers sequentially until one returns a response
    for (const group of handlerGroups) {
      for (const handler of group) {
        try {
          const response = await handler(message, user);
          if (response) {
            return response;
          }
        } catch (handlerError) {
          logger.warn(`Handler ${handler.name} failed:`, handlerError.message);
          // Continue to next handler instead of failing completely
          continue;
        }
      }
    }

    // Default response if no handlers matched
    return await handleDefaultResponse(message, user);
  } catch (error) {
    logger.error('Error in generateAstrologyResponse:', error);
    return '❌ Sorry, I\'m experiencing technical difficulties right now. Please try again later.';
  }
};


module.exports = {
  generateAstrologyResponse,
  validateBirthData
};