const chineseCalculator = require('../chineseCalculator');
const tarotReader = require('../tarotReader');
const palmistryReader = require('../palmistryReader');
const kabbalisticReader = require('../kabbalisticReader');
const mayanReader = require('../mayanReader');
const celticReader = require('../celticReader');
const ichingReader = require('../ichingReader');
const astrocartographyReader = require('../astrocartographyReader');
const { matchesIntent } = require('../utils/intentUtils');
const { buildBaZiResponse, buildTarotResponse, buildPalmistryResponse } = require('../utils/responseBuilders');
const { getBirthDetailsPrompt, getBirthDatePrompt } = require('../../../utils/promptUtils');
const logger = require('../../../utils/logger');

/**
 * Handle Chinese astrology (BaZi) requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} BaZi response or null if not a Chinese astrology request
 */
const handleChineseAstrology = async(message, user) => {
  if (matchesIntent(message, ['chinese', 'bazi', 'four pillars', '八字', /^ba.?zi/])) {
    if (!user.birthDate) {
      return getBirthDetailsPrompt('BaZi (Four Pillars)', 'generate your Chinese astrology analysis', true, false, 'Beijing, China');
    }

    try {
      const baziAnalysis = chineseCalculator.calculateFourPillars(
        user.birthDate,
        user.birthTime || '12:00'
      );
      const zodiacInfo = chineseCalculator.getChineseZodiac(user.birthDate);

      return buildBaZiResponse(baziAnalysis, zodiacInfo);
    } catch (error) {
      logger.error('Error generating BaZi analysis:', error);
      return 'I\'m having trouble generating your BaZi analysis right now. Please try again later.';
    }
  }
  return null;
};

/**
 * Handle tarot reading requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Tarot response or null if not a tarot request
 */
const handleTarot = async(message, user) => {
  if (matchesIntent(message, ['tarot', 'card', 'reading', /^tarot/])) {
    try {
      const spread = message.includes('celtic') ?
        'celtic' :
        message.includes('three') ?
          'three' :
          message.includes('single') ?
            'single' :
            'single';

      let reading;
      switch (spread) {
      case 'celtic':
        reading = tarotReader.celticCrossReading();
        break;
      case 'three':
        reading = tarotReader.threeCardReading();
        break;
      default:
        reading = tarotReader.singleCardReading();
      }

      return buildTarotResponse(reading);
    } catch (error) {
      logger.error('Error generating tarot reading:', error);
      return 'I\'m having trouble connecting with the tarot cards right now. Please try again later.';
    }
  }
  return null;
};

/**
 * Handle palmistry requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Palmistry response or null if not a palmistry request
 */
const handlePalmistry = async(message, user) => {
  if (matchesIntent(message, ['palm', 'hand', 'palmistry', /^palm/])) {
    try {
      const analysis = palmistryReader.generatePalmistryAnalysis();
      return buildPalmistryResponse(analysis);
    } catch (error) {
      logger.error('Error generating palmistry analysis:', error);
      return 'I\'m having trouble reading the palm lines right now. Please try again later.';
    }
  }
  return null;
};

/**
 * Handle Kabbalistic astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Kabbalistic response or null if not a Kabbalistic request
 */
const handleKabbalistic = async(message, user) => {
  if (matchesIntent(message, ['kabbalah', 'kabbalistic', 'tree of life', 'sephiroth', /^kabbal/])) {
    if (!user.birthDate) {
      return getBirthDetailsPrompt('Kabbalistic', 'map your soul\'s journey on the Tree of Life', true);
    }

    try {
      const kabbalisticAnalysis = kabbalisticReader.generateKabbalisticChart({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        name: user.name
      });

      return kabbalisticAnalysis.kabbalisticDescription;
    } catch (error) {
      logger.error('Error generating Kabbalistic analysis:', error);
      return 'I\'m having trouble connecting with the Tree of Life energies right now. Please try again later.';
    }
  }
  return null;
};

/**
 * Handle Mayan astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Mayan response or null if not a Mayan request
 */
const handleMayan = async(message, user) => {
  if (matchesIntent(message, ['mayan', 'tzolk', 'haab', 'mayan calendar', /^mayan/])) {
    if (!user.birthDate) {
      return getBirthDatePrompt('Mayan calendar', 'calculate your Tzolk\'in and Haab dates');
    }

    try {
      const mayanAnalysis = mayanReader.generateMayanChart({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        name: user.name
      });

      return mayanAnalysis.mayanDescription;
    } catch (error) {
      logger.error('Error generating Mayan analysis:', error);
      return 'I\'m having trouble connecting with the Mayan calendar energies right now. Please try again later.';
    }
  }
  return null;
};

/**
 * Handle Celtic astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Celtic response or null if not a Celtic request
 */
const handleCeltic = async(message, user) => {
  if (matchesIntent(message, ['celtic', 'druid', 'tree sign', 'celtic astrology', /^celtic/])) {
    if (!user.birthDate) {
      return getBirthDatePrompt('Celtic tree sign', 'determine your tree sign and animal totem');
    }

    try {
      const celticAnalysis = celticReader.generateCelticChart({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        name: user.name
      });

      return celticAnalysis.celticDescription;
    } catch (error) {
      logger.error('Error generating Celtic analysis:', error);
      return 'I\'m having trouble connecting with the Celtic forest energies right now. Please try again later.';
    }
  }
  return null;
};

/**
 * Handle I Ching requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} I Ching response or null if not an I Ching request
 */
const handleIChing = async(message, user) => {
  if (matchesIntent(message, ['i ching', 'iching', 'hexagram', 'oracle', /^i.?ching/])) {
    try {
      const question = message
        .replace(/i ching|iching|hexagram|oracle/gi, '')
        .trim();
      const reading = ichingReader.generateIChingReading(question);

      return reading.ichingDescription;
    } catch (error) {
      logger.error('Error generating I Ching reading:', error);
      return 'I\'m having trouble consulting the I Ching oracle right now. Please try again later.';
    }
  }
  return null;
};

/**
 * Handle astrocartography requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Astrocartography response or null if not an astrocartography request
 */
const handleAstrocartography = async(message, user) => {
  if (matchesIntent(message, ['astrocartography', 'astro cartography', 'planetary lines', 'relocation', /^astro.?cartography/])) {
    if (!user.birthDate) {
      return getBirthDetailsPrompt('astrocartography', 'map planetary lines across the globe', false, false, 'New York, USA');
    }

    try {
      const astrocartographyAnalysis =
        astrocartographyReader.generateAstrocartography({
          birthDate: user.birthDate,
          birthTime: user.birthTime || '12:00',
          birthPlace: user.birthPlace || 'London, UK',
          name: user.name
        });

      return astrocartographyAnalysis.astrocartographyDescription;
    } catch (error) {
      logger.error('Error generating astrocartography analysis:', error);
      return 'I\'m having trouble mapping the planetary lines right now. Please try again later.';
    }
  }
  return null;
};

logger.info('Module: specializedHandlers loaded successfully.');

module.exports = {
  handleChineseAstrology,
  handleTarot,
  handlePalmistry,
  handleKabbalistic,
  handleMayan,
  handleCeltic,
  handleIChing,
  handleAstrocartography
};
