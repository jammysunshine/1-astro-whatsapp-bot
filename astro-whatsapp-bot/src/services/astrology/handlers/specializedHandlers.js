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

    try {\n      // Convert birthDate to DD/MM/YYYY format\n      let formattedBirthDate = user.birthDate;\n      if (user.birthDate.match(/^(\\d{2})(\\d{2})(\\d{2})$/)) { // DDMMYY\n        const [day, month, year] = user.birthDate.match(/^(\\d{2})(\\d{2})(\\d{2})$/).slice(1);\n        formattedBirthDate = `${day}/${month}/${(parseInt(year) < new Date().getFullYear() % 100) ? 2000 + parseInt(year) : 1900 + parseInt(year)}`;\n      } else if (user.birthDate.match(/^(\\d{2})(\\d{2})(\\d{4})$/)) { // DDMMYYYY\n        const [day, month, year] = user.birthDate.match(/^(\\d{2})(\\d{2})(\\d{4})$/).slice(1);\n        formattedBirthDate = `${day}/${month}/${year}`;\n      } else if (user.birthDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)) { // YYYY-MM-DD\n        const [year, month, day] = user.birthDate.match(/^(\d{4})-(\d{2})-(\d{2})$/).slice(1);\n        formattedBirthDate = `${day}/${month}/${year}`;\n      }\n\n      // Convert birthTime to HH:MM format\n      let formattedBirthTime = user.birthTime || \'12:00\';\n      if (formattedBirthTime.match(/^(\\d{2})(\\d{2})$/)) { // HHMM\n        const [hour, minute] = formattedBirthTime.match(/^(\d{2})(\d{2})$/).slice(1);\n        formattedBirthTime = `${hour}:${minute}`;\n      }\n\n\n      const baziAnalysis = chineseCalculator.calculateFourPillars(\n        formattedBirthDate,\n        formattedBirthTime\n      );\n      const zodiacInfo = chineseCalculator.getChineseZodiac(formattedBirthDate);\n\n      return buildBaZiResponse(baziAnalysis, zodiacInfo);
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
      case 'single':
        reading = tarotReader.singleCardReading();
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
      const analysis = palmistryReader.generatePalmistryReading(user);
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
      // Convert birthDate to DD/MM/YYYY format
      let formattedBirthDate = user.birthDate;
      if (user.birthDate.match(/^(\\d{2})(\\d{2})(\\d{2})$/)) { // DDMMYY
        const [day, month, year] = user.birthDate.match(/^(\\d{2})(\\d{2})(\\d{2})$/).slice(1);
        formattedBirthDate = `${day}/${month}/${(parseInt(year) < new Date().getFullYear() % 100) ? 2000 + parseInt(year) : 1900 + parseInt(year)}`;
      } else if (user.birthDate.match(/^(\\d{2})(\\d{2})(\\d{4})$/)) { // DDMMYYYY
        const [day, month, year] = user.birthDate.match(/^(\\d{2})(\\d{2})(\\d{4})$/).slice(1);
        formattedBirthDate = `${day}/${month}/${year}`;
      } else if (user.birthDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)) { // YYYY-MM-DD
        const [year, month, day] = user.birthDate.match(/^(\d{4})-(\d{2})-(\d{2})$/).slice(1);
        formattedBirthDate = `${day}/${month}/${year}`;
      }

      // Convert birthTime to HH:MM format
      let formattedBirthTime = user.birthTime || '12:00';
      if (formattedBirthTime.match(/^(\\d{2})(\\d{2})$/)) { // HHMM
        const [hour, minute] = formattedBirthTime.match(/^(\\d{2})(\\d{2})$/).slice(1);
        formattedBirthTime = `${hour}:${minute}`;
      }

      const kabbalisticAnalysis = kabbalisticReader.generateKabbalisticChart({
        birthDate: formattedBirthDate,
        birthTime: formattedBirthTime,
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
      // Convert birthDate to DD/MM/YYYY format
      let formattedBirthDate = user.birthDate;
      if (user.birthDate.match(/^(\\d{2})(\\d{2})(\\d{2})$/)) { // DDMMYY
        const [day, month, year] = user.birthDate.match(/^(\\d{2})(\\d{2})(\\d{2})$/).slice(1);
        formattedBirthDate = `${day}/${month}/${(parseInt(year) < new Date().getFullYear() % 100) ? 2000 + parseInt(year) : 1900 + parseInt(year)}`;
      } else if (user.birthDate.match(/^(\\d{2})(\\d{2})(\\d{4})$/)) { // DDMMYYYY
        const [day, month, year] = user.birthDate.match(/^(\\d{2})(\\d{2})(\\d{4})$/).slice(1);
        formattedBirthDate = `${day}/${month}/${year}`;
      } else if (user.birthDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)) { // YYYY-MM-DD
        const [year, month, day] = user.birthDate.match(/^(\d{4})-(\d{2})-(\d{2})$/).slice(1);
        formattedBirthDate = `${day}/${month}/${year}`;
      }

      const mayanAnalysis = mayanReader.generateMayanChart({
        birthDate: formattedBirthDate,
        birthTime: user.birthTime || '12:00', // birthTime is not used in mayanReader, but passed for consistency
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