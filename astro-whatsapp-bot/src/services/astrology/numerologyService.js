const logger = require('../../utils/logger');
const numerologyData = require('./numerology_data.json'); // Will create this file

logger.info('Module: numerologyService loaded.');

// Helper function to reduce a number to a single digit or master number
function reduceToSingleDigit(num) {
  let sum = num;
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  return sum;
}

// Helper to convert letter to numerology value
function getLetterValue(char) {
  const charCode = char.toUpperCase().charCodeAt(0);
  if (charCode >= 65 && charCode <= 90) { // A-Z
    return (charCode - 65) % 9 + 1; // A=1, B=2, ..., I=9, J=1, K=2, etc.
  }
  return 0;
}

// Calculate Life Path Number
function calculateLifePath(birthDateStr) {
  try {
    const [day, month, year] = birthDateStr.split('/').map(Number);
    const reducedDay = reduceToSingleDigit(day);
    const reducedMonth = reduceToSingleDigit(month);
    const reducedYear = reduceToSingleDigit(year);

    return reduceToSingleDigit(reducedDay + reducedMonth + reducedYear);
  } catch (error) {
    logger.error(`Error calculating Life Path for ${birthDateStr}:`, error);
    return null;
  }
}

// Calculate Name Numbers (Expression, Soul Urge, Personality)
function calculateNameNumber(fullName, type) {
  try {
    const cleanedName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
    let sum = 0;

    for (const char of cleanedName) {
      const value = getLetterValue(char);
      if (type === 'expression') {
        sum += value;
      } else if (type === 'soul_urge' && 'AEIOU'.includes(char)) {
        sum += value;
      } else if (type === 'personality' && !'AEIOU'.includes(char)) {
        sum += value;
      }
    }
    return reduceToSingleDigit(sum);
  } catch (error) {
    logger.error(`Error calculating ${type} number for ${fullName}:`, error);
    return null;
  }
}

// Get full numerology report
function getNumerologyReport(birthDate, fullName) {
  const lifePath = calculateLifePath(birthDate);
  const expression = calculateNameNumber(fullName, 'expression');
  const soulUrge = calculateNameNumber(fullName, 'soul_urge');
  const personality = calculateNameNumber(fullName, 'personality');

  const report = {
    lifePath: {
      number: lifePath,
      interpretation: numerologyData.lifePath[lifePath] || 'Interpretation not found.'
    },
    expression: {
      number: expression,
      interpretation: numerologyData.expression[expression] || 'Interpretation not found.'
    },
    soulUrge: {
      number: soulUrge,
      interpretation: numerologyData.soulUrge[soulUrge] || 'Interpretation not found.'
    },
    personality: {
      number: personality,
      interpretation: numerologyData.personality[personality] || 'Interpretation not found.'
    }
  };

  return report;
}

module.exports = {
  getNumerologyReport,
  reduceToSingleDigit, // Export for testing
  getLetterValue // Export for testing
};
