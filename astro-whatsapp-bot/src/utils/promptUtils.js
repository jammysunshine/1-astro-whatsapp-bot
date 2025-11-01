/**
 * Centralized prompt utilities for consistent user input requests
 * Eliminates code duplication across handlers
 */

/**
 * Generates a standardized birth details prompt for services requiring full birth information
 * @param {string} serviceName - Name of the astrology service
 * @param {string} description - Brief description of what the service analyzes
 * @param {boolean} timeOptional - Whether birth time is optional (default: false)
 * @param {boolean} includeName - Whether to include name in the request (default: false)
 * @param {string} examplePlace - Example birth place for the prompt
 * @returns {string} Formatted prompt string
 */
const getBirthDetailsPrompt = (
  serviceName,
  description,
  timeOptional = false,
  includeName = false,
  examplePlace = 'Mumbai, India'
) => {
  let prompt = `For ${serviceName} analysis, I need your complete birth details`;

  if (description) {
    prompt += ` to ${description}`;
  }
  prompt += '.\n\nPlease provide:\n';

  if (includeName) {
    prompt += '• Full name (as it appears on birth certificate)\n';
  }

  prompt += '• Birth date (DDMMYY or DDMMYYYY)\n';

  if (timeOptional) {
    prompt += '• Birth time (HHMM) - optional but recommended\n';
  } else {
    prompt += '• Birth time (HHMM)\n';
  }

  prompt += '• Birth place (City, Country)\n\n';

  prompt += 'Example: ';

  if (includeName) {
    prompt += 'Rajesh Kumar Sharma, ';
  }

  prompt += `15061990, ${timeOptional ? '1430 (optional), ' : '1430, '}${examplePlace}`;

  // Add disclaimer about default values
  if (timeOptional) {
    prompt +=
      '\n\n💡 *Note:* If birth time is not provided, calculations will use 12:00 PM (noon) by default, which may affect accuracy.';
  }
  // Assuming birthPlace is always required if not provided by user, a default is used by the calculator
  prompt +=
    '\n\n🌍 *Note:* If birth place is not provided, calculations will use a default location (e.g., Delhi, India), which may affect accuracy.';

  return prompt;
};

/**
 * Generates a standardized birth date only prompt for services requiring just the date
 * @param {string} serviceName - Name of the astrology service
 * @param {string} description - Brief description of what the service analyzes
 * @param {string} examplePlace - Example birth place (optional, defaults to none)
 * @returns {string} Formatted prompt string
 */
const getBirthDatePrompt = (serviceName, description, examplePlace = null) => {
  let prompt = `For ${serviceName} analysis, I need your birth date`;

  if (description) {
    prompt += ` to ${description}`;
  }
  prompt += '.\n\nPlease provide:\n• Birth date (DDMMYY or DDMMYYYY)';

  if (examplePlace) {
    prompt += '\n• Birth place (City, Country)';
  }

  prompt += '\n\nExample: 15061990';

  if (examplePlace) {
    prompt += `, ${examplePlace}`;
  }

  return prompt;
};

/**
 * Generates a standardized birth time prompt for services requiring just the time
 * @param {string} serviceName - Name of the astrology service
 * @param {string} description - Brief description of what the service analyzes
 * @returns {string} Formatted prompt string
 */
const getBirthTimePrompt = (serviceName, description) => {
  let prompt = `For ${serviceName} analysis, I need your birth time`;

  if (description) {
    prompt += ` to ${description}`;
  }
  prompt += '.\n\nPlease provide:\n• Birth time (HHMM)\n\nExample: 1430';

  return prompt;
};

/**
 * Generates a standardized name and birth date prompt for numerology services
 * @param {string} serviceName - Name of the numerology service
 * @param {string} description - Brief description of what the service analyzes
 * @param {string} exampleName - Example name for the prompt
 * @returns {string} Formatted prompt string
 */
const getNameAndBirthDatePrompt = (
  serviceName,
  description,
  exampleName = 'John Michael Smith'
) => {
  let prompt = `For ${serviceName} analysis, I need your birth details and full name`;

  if (description) {
    prompt += ` to ${description}`;
  }
  prompt += `.\n\nPlease provide:\n• Birth date (DDMMYY or DDMMYYYY)\n• Full name (as it appears on birth certificate)\n\nExample: 15061990, ${exampleName}`;

  return prompt;
};

module.exports = {
  getBirthDetailsPrompt,
  getBirthDatePrompt,
  getBirthTimePrompt,
  getNameAndBirthDatePrompt
};
