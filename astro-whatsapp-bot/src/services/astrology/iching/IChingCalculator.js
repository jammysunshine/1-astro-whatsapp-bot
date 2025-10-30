const logger = require('../../../utils/logger');
const { IChingConfig } = require('./IChingConfig');

/**
 * IChingCalculator - Mathematical operations and hexagram manipulation
 * Handles hexagram generation, transformations, and calculations
 */
class IChingCalculator {
  /**
   * @param {IChingConfig} config - IChing configuration instance
   */
  constructor(config = new IChingConfig()) {
    this.logger = logger;
    this.config = config;

    this.logger.info('Module: IChingCalculator loaded with hexagram calculation capabilities');
  }

  /**
   * Generate a hexagram using random method (simulating coin tosses)
   * @returns {Object} Hexagram data
   */
  generateHexagram() {
    const lines = [];

    // Generate 6 lines from bottom to top
    for (let i = 0; i < 6; i++) {
      lines.push(this.generateLine());
    }

    // Calculate hexagram number
    const hexagramNumber = this.calculateHexagramNumber(lines);
    const hexagramData = this.config.getHexagram(hexagramNumber);

    return {
      number: hexagramNumber,
      name: hexagramData.name,
      lines,
      upperTrigram: this.calculateUpperTrigram(lines),
      lowerTrigram: this.calculateLowerTrigram(lines),
      judgment: hexagramData.judgment,
      image: hexagramData.image
    };
  }

  /**
   * Generate a single line using traditional coin toss method
   * @returns {number} Line type (6=old yin/changing, 7=young yang, 8=young yin, 9=old yang/changing)
   */
  generateLine() {
    // Simulate three coin tosses (traditional method)
    // 3 heads (老阴) = 6 (changing yin)
    // 2 heads 1 tail (少阳) = 7 (young yang)
    // 1 head 2 tails (少阴) = 8 (young yin)
    // 3 tails (老阳) = 9 (changing yang)

    const tosses = [];
    for (let i = 0; i < 3; i++) {
      tosses.push(Math.random() < 0.5 ? 'heads' : 'tails');
    }

    const headsCount = tosses.filter(toss => toss === 'heads').length;

    switch (headsCount) {
    case 0:
      return 6; // 3 tails - old yin (changing)
    case 1:
      return 8; // 1 head 2 tails - young yin
    case 2:
      return 7; // 2 heads 1 tail - young yang
    case 3:
      return 9; // 3 heads - old yang (changing)
    default:
      return 7;
    }
  }

  /**
   * Calculate hexagram number from lines
   * @param {Array} lines - Array of line values
   * @returns {number} Hexagram number (1-64)
   */
  calculateHexagramNumber(lines) {
    // Convert lines to binary (yin=0, yang=1) and calculate
    let binary = '';
    for (let i = 0; i < 6; i++) {
      // For hexagram calculation, we ignore changing nature (6=0, 9=1, 7=1, 8=0)
      const lineValue = lines[i] === 7 || lines[i] === 9 ? 1 : 0;
      binary = lineValue + binary; // Add to front (bottom to top)
    }

    return parseInt(binary, 2) + 1; // Binary to decimal + 1
  }

  /**
   * Calculate upper trigram (lines 4-6)
   * @param {Array} lines - Array of line values
   * @returns {Object} Upper trigram data
   */
  calculateUpperTrigram(lines) {
    const upperLines = lines.slice(3, 6); // Lines 4, 5, 6 (0-indexed 3,4,5)
    const trigramNumber = this.calculateTrigramNumber(upperLines);
    return this.config.getTrigram(trigramNumber);
  }

  /**
   * Calculate lower trigram (lines 1-3)
   * @param {Array} lines - Array of line values
   * @returns {Object} Lower trigram data
   */
  calculateLowerTrigram(lines) {
    const lowerLines = lines.slice(0, 3); // Lines 1, 2, 3 (0-indexed 0,1,2)
    const trigramNumber = this.calculateTrigramNumber(lowerLines);
    return this.config.getTrigram(trigramNumber);
  }

  /**
   * Calculate trigram number from three lines
   * @param {Array} lines - Three line values
   * @returns {number} Trigram number (0-7)
   */
  calculateTrigramNumber(lines) {
    let binary = '';
    for (let i = 0; i < 3; i++) {
      const lineValue = lines[i] === 7 || lines[i] === 9 ? 1 : 0;
      binary = lineValue + binary;
    }
    return parseInt(binary, 2);
  }

  /**
   * Generate changing lines from hexagram
   * @param {Array} lines - Array of line values
   * @returns {Array} Array of changing line positions (1-6)
   */
  generateChangingLines(lines) {
    const changingLines = [];
    for (let i = 0; i < 6; i++) {
      if (lines[i] === 6 || lines[i] === 9) {
        changingLines.push(i + 1); // 1-based line position
      }
    }
    return changingLines;
  }

  /**
   * Transform hexagram based on changing lines
   * @param {Object} primaryHexagram - Primary hexagram data
   * @param {Array} changingLines - Array of changing line positions
   * @returns {Object} Transformed hexagram data
   */
  transformHexagram(primaryHexagram, changingLines) {
    const transformedLines = [...primaryHexagram.lines];

    // Change lines: 6 (old yin) becomes 7 (young yang), 9 (old yang) becomes 8 (young yin)
    changingLines.forEach(linePos => {
      const index = linePos - 1; // 0-based
      if (transformedLines[index] === 6) {
        transformedLines[index] = 7;
      } else if (transformedLines[index] === 9) {
        transformedLines[index] = 8;
      }
    });

    const transformedNumber = this.calculateHexagramNumber(transformedLines);
    const transformedData = this.config.getHexagram(transformedNumber);

    return {
      number: transformedNumber,
      name: transformedData.name,
      lines: transformedLines,
      judgment: transformedData.judgment,
      image: transformedData.image
    };
  }

  /**
   * Calculate nuclear hexagram (inner trigrams)
   * @param {Object} hexagram - Hexagram data
   * @returns {Object} Nuclear hexagram data
   */
  calculateNuclearHexagram(hexagram) {
    // Nuclear hexagram uses lines 2, 3, 4, 5
    const nuclearLines = [
      hexagram.lines[1],
      hexagram.lines[2],
      hexagram.lines[3],
      hexagram.lines[4]
    ];
    const nuclearNumber = this.calculateHexagramNumber(nuclearLines);
    const nuclearData = this.config.getHexagram(nuclearNumber);

    return {
      number: nuclearNumber,
      name: nuclearData.name,
      judgment: nuclearData.judgment
    };
  }

  /**
   * Calculate relating hexagram (inverse of primary)
   * @param {Object} hexagram - Hexagram data
   * @returns {Object} Relating hexagram data
   */
  calculateRelatingHexagram(hexagram) {
    // Relating hexagram inverts all lines
    const relatingLines = hexagram.lines.map(line => {
      // Yin (6,8) becomes Yang (7,9) and vice versa
      if (line === 6 || line === 8) {
        return 7;
      }
      if (line === 7 || line === 9) {
        return 8;
      }
      return line;
    });

    const relatingNumber = this.calculateHexagramNumber(relatingLines);
    const relatingData = this.config.getHexagram(relatingNumber);

    return {
      number: relatingNumber,
      name: relatingData.name,
      judgment: relatingData.judgment
    };
  }

  /**
   * Create hexagram from specific line values
   * @param {Array} lineValues - Array of 6 line values
   * @returns {Object} Hexagram data
   */
  createHexagramFromLines(lineValues) {
    if (!Array.isArray(lineValues) || lineValues.length !== 6) {
      throw new Error('Hexagram must have exactly 6 lines');
    }

    const hexagramNumber = this.calculateHexagramNumber(lineValues);
    const hexagramData = this.config.getHexagram(hexagramNumber);

    return {
      number: hexagramNumber,
      name: hexagramData.name,
      lines: lineValues,
      upperTrigram: this.calculateUpperTrigram(lineValues),
      lowerTrigram: this.calculateLowerTrigram(lineValues),
      judgment: hexagramData.judgment,
      image: hexagramData.image
    };
  }

  /**
   * Get line position meanings for interpretation
   * @param {number} position - Line position (1-6)
   * @returns {string} Line position meaning
   */
  getLinePositionMeaning(position) {
    const meanings = {
      1: 'The foundation, beginning, inner most, determination',
      2: 'The lover, inner softness, yin support, enterprise',
      3: 'The centerpiece, outer transition, difficulty, help',
      4: 'The minister, correct path, inner progress, connection',
      5: 'The ruler, outer success, leadership position, responsibility',
      6: 'The zenith, completion, future vision, harmony'
    };

    return meanings[position] || 'Unknown position';
  }

  /**
   * Determine if a line is changing
   * @param {number} lineValue - Line value (6,7,8,9)
   * @returns {boolean} True if changing
   */
  isChangingLine(lineValue) {
    return lineValue === 6 || lineValue === 9;
  }

  /**
   * Get line strength (yin/yang balance)
   * @param {number} lineValue - Line value (6,7,8,9)
   * @returns {string} Strength description
   */
  getLineStrength(lineValue) {
    switch (lineValue) {
      case 6: return 'Old Yin - Changing (soft → hard)';
      case 7: return 'Young Yang - Strong (hard)';
      case 8: return 'Young Yin - Weak (soft)';
      case 9: return 'Old Yang - Changing (hard → soft)';
      default: return 'Unknown';
    }
  }

  /**
   * Health check for IChingCalculator
   * @returns {Object} Health status
   */
  healthCheck() {
    try {
      const configHealth = this.config.healthCheck();

      // Test basic calculation
      const testHexagram = this.generateHexagram();
      const validHexagram = testHexagram && testHexagram.number >= 1 && testHexagram.number <= 64;

      // Test trigram calculations
      const testTrigamUpper = this.calculateUpperTrigram(testHexagram.lines);
      const testTrigamLower = this.calculateLowerTrigram(testHexagram.lines);
      const validTrigrams = testTrigamUpper && testTrigamLower;

      return {
        healthy: configHealth.healthy && validHexagram && validTrigrams,
        configStatus: configHealth,
        calculationTest: validHexagram,
        trigramTest: validTrigrams,
        version: '1.0.0',
        capabilities: ['Hexagram Generation', 'Line Calculations', 'Trigram Analysis', 'Hexagram Transformations'],
        status: configHealth.healthy && validHexagram && validTrigrams ? 'Operational' : 'Issues Found'
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = { IChingCalculator };