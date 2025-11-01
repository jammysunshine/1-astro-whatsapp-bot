const logger = require('../../utils/logger');
const numerologyData = require('./numerology_data.json'); // Will create this file

logger.info('Module: numerologyService loaded.');

// Helper function to reduce a number to a single digit or master number
function reduceToSingleDigit(num) {
  let sum = num;
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum)
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  return sum;
}

// Helper to convert letter to numerology value
function getLetterValue(char) {
  const charCode = char.toUpperCase().charCodeAt(0);
  if (charCode >= 65 && charCode <= 90) {
    // A-Z
    return ((charCode - 65) % 9) + 1; // A=1, B=2, ..., I=9, J=1, K=2, etc.
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
      interpretation:
        numerologyData.lifePath[lifePath] || 'Interpretation not found.'
    },
    expression: {
      number: expression,
      interpretation:
        numerologyData.expression[expression] || 'Interpretation not found.'
    },
    soulUrge: {
      number: soulUrge,
      interpretation:
        numerologyData.soulUrge[soulUrge] || 'Interpretation not found.'
    },
    personality: {
      number: personality,
      interpretation:
        numerologyData.personality[personality] || 'Interpretation not found.'
    }
  };

  return report;
}

// Generate full report in the format expected by conversationEngine
async function generateFullReport(fullName, birthDate) {
  try {
    const lifePath = calculateLifePath(birthDate);
    const expression = calculateNameNumber(fullName, 'expression');
    const soulUrge = calculateNameNumber(fullName, 'soul_urge');
    const personality = calculateNameNumber(fullName, 'personality');

    // Calculate additional numbers
    const destiny = reduceToSingleDigit(lifePath + expression); // Life Path + Expression
    const maturity = reduceToSingleDigit(
      lifePath + expression + soulUrge + personality
    ); // All numbers combined

    return {
      lifePath,
      lifePathDescription:
        numerologyData.lifePath[lifePath] || 'Interpretation not found.',
      expression,
      expressionDescription:
        numerologyData.expression[expression] || 'Interpretation not found.',
      soulUrge,
      soulUrgeDescription:
        numerologyData.soulUrge[soulUrge] || 'Interpretation not found.',
      personality,
      personalityDescription:
        numerologyData.personality[personality] || 'Interpretation not found.',
      destiny,
      maturity,
      strengths: getStrengths(lifePath, expression),
      challenges: getChallenges(lifePath, expression),
      careerPaths: getCareerPaths(lifePath, expression),
      compatibleNumbers: getCompatibleNumbers(lifePath)
    };
  } catch (error) {
    logger.error('Error generating full numerology report:', error);
    throw error;
  }
}

// Helper functions for additional report data
function getStrengths(lifePath, expression) {
  const strengthsMap = {
    1: ['Leadership', 'Independence', 'Creativity'],
    2: ['Cooperation', 'Diplomacy', 'Intuition'],
    3: ['Communication', 'Optimism', 'Social skills'],
    4: ['Organization', 'Reliability', 'Practicality'],
    5: ['Adaptability', 'Freedom', 'Versatility'],
    6: ['Responsibility', 'Harmony', 'Nurturing'],
    7: ['Analysis', 'Spirituality', 'Independence'],
    8: ['Ambition', 'Authority', 'Material success'],
    9: ['Humanitarianism', 'Creativity', 'Compassion']
  };

  return strengthsMap[lifePath] || ['Determination', 'Resilience'];
}

function getChallenges(lifePath, expression) {
  const challengesMap = {
    1: ['Impatience', 'Dominance', 'Self-centeredness'],
    2: ['Indecision', 'Over-sensitivity', 'Dependence'],
    3: ['Superficiality', 'Scattering energy', 'Exaggeration'],
    4: ['Rigidity', 'Stubbornness', 'Limited vision'],
    5: ['Restlessness', 'Irresponsibility', 'Excessive freedom'],
    6: ['Self-sacrifice', 'Martyrdom', 'Over-responsibility'],
    7: ['Isolation', 'Criticism', 'Over-analysis'],
    8: ['Materialism', 'Control issues', 'Workaholism'],
    9: ['Idealism', 'Self-neglect', 'Impracticality']
  };

  return challengesMap[lifePath] || ['Self-doubt', 'Resistance to change'];
}

function getCareerPaths(lifePath, expression) {
  const careersMap = {
    1: ['Entrepreneur', 'Leader', 'Artist', 'Innovator'],
    2: ['Counselor', 'Mediator', 'Teacher', 'Healer'],
    3: ['Writer', 'Speaker', 'Performer', 'Marketer'],
    4: ['Builder', 'Manager', 'Accountant', 'Engineer'],
    5: ['Traveler', 'Salesperson', 'Journalist', 'Consultant'],
    6: ['Teacher', 'Nurse', 'Social worker', 'Counselor'],
    7: ['Researcher', 'Analyst', 'Philosopher', 'Scientist'],
    8: ['Executive', 'Business owner', 'Investor', 'Manager'],
    9: ['Humanitarian', 'Artist', 'Therapist', 'Visionary']
  };

  return (
    careersMap[lifePath] || ['Professional', 'Creative', 'Service-oriented']
  );
}

function getCompatibleNumbers(lifePath) {
  const compatibilityMap = {
    1: [3, 5, 6],
    2: [4, 6, 8],
    3: [1, 5, 9],
    4: [2, 7, 8],
    5: [1, 3, 7],
    6: [1, 2, 9],
    7: [4, 5, 8],
    8: [2, 4, 7],
    9: [3, 6, 9]
  };

  return compatibilityMap[lifePath] || [lifePath];
}

module.exports = {
  getNumerologyReport,
  generateFullReport,
  reduceToSingleDigit, // Export for testing
  getLetterValue // Export for testing
};
