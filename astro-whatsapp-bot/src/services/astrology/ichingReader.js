const logger = require('../../utils/logger');

/**
 * I Ching Divination Reader
 * Provides hexagram generation, changing lines, and traditional interpretations
 */

class IChingReader {
  constructor() {
    logger.info('Module: IChingReader loaded.');
    // I Ching Trigrams (8 fundamental symbols)
    this.trigrams = {
      0: { name: 'Heaven', symbol: '☰', nature: 'Creative', element: 'Metal', direction: 'Northwest', qualities: ['Strength', 'Creativity', 'Leadership'] },
      1: { name: 'Lake', symbol: '☱', nature: 'Joyful', element: 'Metal', direction: 'West', qualities: ['Joy', 'Communication', 'Pleasing'] },
      2: { name: 'Fire', symbol: '☲', nature: 'Clinging', element: 'Fire', direction: 'South', qualities: ['Clarity', 'Illumination', 'Attachment'] },
      3: { name: 'Thunder', symbol: '☳', nature: 'Arousing', element: 'Wood', direction: 'East', qualities: ['Movement', 'Initiation', 'Shock'] },
      4: { name: 'Wind', symbol: '☴', nature: 'Gentle', element: 'Wood', direction: 'Southeast', qualities: ['Gentleness', 'Penetration', 'Adaptation'] },
      5: { name: 'Water', symbol: '☵', nature: 'Abysmal', element: 'Water', direction: 'North', qualities: ['Danger', 'Depth', 'Adaptability'] },
      6: { name: 'Mountain', symbol: '☶', nature: 'Keeping Still', element: 'Earth', direction: 'Northeast', qualities: ['Stillness', 'Meditation', 'Endurance'] },
      7: { name: 'Earth', symbol: '☷', nature: 'Receptive', element: 'Earth', direction: 'Southwest', qualities: ['Receptivity', 'Nurturing', 'Support'] }
    };

    // I Ching Hexagrams (64 combinations)
    this.hexagrams = {
      1: { name: 'The Creative', upper: 0, lower: 0, judgment: 'The Creative works sublime success, Furthering through perseverance.', image: 'The movement of heaven is full of power. Thus the superior man makes himself strong and untiring.' },
      2: { name: 'The Receptive', upper: 7, lower: 7, judgment: 'The Receptive brings about sublime success, Furthering through the perseverance of a mare.', image: 'The earth\'s condition is receptive devotion. Thus the superior man who has breadth of character carries the outer world.' },
      3: { name: 'Difficulty at the Beginning', upper: 5, lower: 3, judgment: 'Difficulty at the Beginning works supreme success, Furthering through perseverance.', image: 'Clouds and thunder: The image of Difficulty at the Beginning. Thus the superior man brings order out of confusion.' },
      4: { name: 'Youthful Folly', upper: 6, lower: 7, judgment: 'Youthful Folly has success. It is not I who seek the young fool; The young fool seeks me.', image: 'A spring wells up at the foot of the mountain: The image of Youth. Thus the superior man fosters his character by thoroughness in all that he does.' },
      5: { name: 'Waiting', upper: 0, lower: 5, judgment: 'Waiting. If you are sincere, you have light and success. Perseverance brings good fortune.', image: 'Clouds rise up to heaven: The image of Waiting. Thus the superior man eats and drinks, is joyous and of good cheer.' },
      6: { name: 'Conflict', upper: 0, lower: 0, judgment: 'Conflict. You are sincere and are being obstructed. A cautious halt halfway brings good fortune.', image: 'Heaven and water go their opposite ways: The image of Conflict. Thus in all his transactions the superior man carefully considers the beginning.' },
      7: { name: 'The Army', upper: 7, lower: 7, judgment: 'The Army. The army needs perseverance and a strong man. Good fortune without blame.', image: 'In the middle of the earth is water: The image of The Army. Thus the superior man increases his masses by generosity toward the people.' },
      8: { name: 'Holding Together', upper: 5, lower: 5, judgment: 'Holding Together brings good fortune. Inquire of the oracle once more whether you possess sublimity, constancy, and perseverance.', image: 'On the earth is water: The image of Holding Together. Thus the kings of antiquity bestowed the different states as fiefs and cultivated friendly relations with the feudal lords.' },
      9: { name: 'The Taming Power of the Small', upper: 0, lower: 4, judgment: 'The Taming Power of the Small has success. Dense clouds, no rain from our western region.', image: 'The wind drives across heaven: The image of The Taming Power of the Small. Thus the superior man refines the outward aspect of his nature.' },
      10: { name: 'Treading', upper: 7, lower: 2, judgment: 'Treading upon the tail of the tiger. It does not bite the man. Success.', image: 'Heaven above, the lake below: The image of Treading. Thus the superior man discriminates between high and low, and thereby fortifies the thinking of the people.' },
      11: { name: 'Peace', upper: 7, lower: 0, judgment: 'Peace. The small departs, the great approaches. Good fortune. Success.', image: 'Heaven and earth unite: The image of Peace. Thus the ruler divides and completes the course of heaven and earth.' },
      12: { name: 'Standstill', upper: 0, lower: 7, judgment: 'Standstill. Evil people do not further the perseverance of the superior man.', image: 'Heaven and earth do not unite: The image of Standstill. Thus the superior man falls back upon his inner worth in order to escape the difficulties.' },
      13: { name: 'Fellowship with Men', upper: 0, lower: 2, judgment: 'Fellowship with Men in the open. Success. It furthers one to cross the great water.', image: 'Heaven together with fire: The image of Fellowship with Men. Thus the superior man organizes the clans and makes distinctions between things.' },
      14: { name: 'Possession in Great Measure', upper: 2, lower: 2, judgment: 'Possession in Great Measure. Supreme success.', image: 'Fire in heaven above: The image of Possession in Great Measure. Thus the superior man curbs evil and furthers good.' },
      15: { name: 'Modesty', upper: 7, lower: 6, judgment: 'Modesty creates success. The superior man carries things through.', image: 'Within the earth, a mountain: The image of Modesty. Thus the superior man reduces that which is too much, and augments that which is too little.' },
      16: { name: 'Enthusiasm', upper: 3, lower: 3, judgment: 'Enthusiasm. It furthers one to install helpers and to set armies marching.', image: 'Thunder comes resounding out of the earth: The image of Enthusiasm. Thus the ancient kings made music in order to honor merit.' },
      17: { name: 'Following', upper: 7, lower: 3, judgment: 'Following has supreme success. Perseverance furthers.', image: 'Thunder in the middle of the lake: The image of Following. Thus the superior man at nightfall goes indoors for rest and recuperation.' },
      18: { name: 'Work on What Has Been Spoiled', upper: 6, lower: 6, judgment: 'Work on What Has Been Spoiled has supreme success. It furthers one to cross the great water.', image: 'The wind blows low on the mountain: The image of Work on What Has Been Spoiled. Thus the superior man stirs up the people and strengthens their spirit.' },
      19: { name: 'Approach', upper: 7, lower: 4, judgment: 'Approach has supreme success. Perseverance furthers. When the eighth month comes, there will be misfortune.', image: 'The earth above the lake: The image of Approach. Thus the superior man is inexhaustible in his will to teach.' },
      20: { name: 'Contemplation', upper: 4, lower: 4, judgment: 'Contemplation. The ablution has been made, but not yet the offering. Full of trust they look up to him.', image: 'The wind blows over the earth: The image of Contemplation. Thus the kings of old visited the regions of the world.' },
      21: { name: 'Biting Through', upper: 2, lower: 3, judgment: 'Biting Through has success. It is favorable to let justice be administered.', image: 'Thunder and lightning: The image of Biting Through. Thus the kings of former times made firm the laws through clearly defined penalties.' },
      22: { name: 'Grace', upper: 6, lower: 2, judgment: 'Grace has success. In small matters it is favorable to undertake something.', image: 'Fire at the foot of the mountain: The image of Grace. Thus the superior man proceeds when the time has come.' },
      23: { name: 'Splitting Apart', upper: 6, lower: 7, judgment: 'Splitting Apart. It does not further one to go anywhere.', image: 'The mountain rests on the earth: The image of Splitting Apart. Thus those above can ensure their position only by giving generously to those below.' },
      24: { name: 'Return', upper: 3, lower: 7, judgment: 'Return. Success. Going out and coming in without error. Friends come without blame.', image: 'Thunder within the earth: The image of Return. Thus the kings of antiquity closed the passes at the time of solstice.' },
      25: { name: 'Innocence', upper: 0, lower: 3, judgment: 'Innocence. Supreme success. Perseverance furthers. If someone is not as he should be, he has misfortune.', image: 'Under heaven thunder rolls: The image of Innocence. Thus the kings of antiquity made music in order to honor merit.' },
      26: { name: 'The Taming Power of the Great', upper: 6, lower: 0, judgment: 'The Taming Power of the Great. Perseverance furthers. Not eating at home brings good fortune.', image: 'Heaven within the mountain: The image of The Taming Power of the Great. Thus the superior man acquaints himself with many sayings of antiquity.' },
      27: { name: 'The Corners of the Mouth', upper: 6, lower: 7, judgment: 'The Corners of the Mouth. Perseverance brings good fortune. Pay heed to the providing of nourishment.', image: 'At the foot of the mountain, thunder: The image of Providing Nourishment. Thus the superior man is careful of his words and temperate in eating and drinking.' },
      28: { name: 'Preponderance of the Great', upper: 7, lower: 4, judgment: 'Preponderance of the Great. The ridgepole sags to the breaking point. It furthers one to have somewhere to go.', image: 'The lake rises above the trees: The image of Preponderance of the Great. Thus the superior man, when he stands alone, is unconcerned.' },
      29: { name: 'The Abysmal', upper: 5, lower: 5, judgment: 'The Abysmal repeated. If you are sincere, you have success in your heart, and whatever you do succeeds.', image: 'Water flows on uninterruptedly and reaches its goal: The image of the Abysmal. Thus the superior man walks in lasting virtue.' },
      30: { name: 'The Clinging', upper: 2, lower: 2, judgment: 'The Clinging. Perseverance furthers. It brings success. Care of the cow brings good fortune.', image: 'That which is bright rises twice: The image of The Clinging. Thus the great man, by perpetuating this brightness, illumines the four quarters of the world.' },
      31: { name: 'Influence', upper: 7, lower: 4, judgment: 'Influence. Success. Perseverance furthers. To take a maiden to wife brings good fortune.', image: 'A lake on the mountain: The image of Influence. Thus the superior man encourages people to approach him by his readiness to receive them.' },
      32: { name: 'Duration', upper: 3, lower: 3, judgment: 'Duration. Success. No blame. Perseverance furthers. It furthers one to have somewhere to go.', image: 'Thunder and wind: The image of Duration. Thus the superior man stands firm and does not change his direction.' },
      33: { name: 'Retreat', upper: 0, lower: 6, judgment: 'Retreat. Success. In what is small, perseverance furthers.', image: 'Mountain under heaven: The image of Retreat. Thus the superior man keeps the inferior man at a distance.' },
      34: { name: 'The Power of the Great', upper: 3, lower: 0, judgment: 'The Power of the Great. Perseverance furthers.', image: 'Thunder in heaven above: The image of The Power of the Great. Thus the superior man does not tread upon paths that do not accord with established order.' },
      35: { name: 'Progress', upper: 2, lower: 7, judgment: 'Progress. The powerful prince is honored with horses in large numbers. In a single day he is granted audience three times.', image: 'The sun rises over the earth: The image of Progress. Thus the superior man himself brightens his bright virtue.' },
      36: { name: 'Darkening of the Light', upper: 7, lower: 2, judgment: 'Darkening of the Light. In adversity it furthers one to be persevering.', image: 'The light has sunk into the earth: The image of Darkening of the Light. Thus does the superior man live with the great mass.' },
      37: { name: 'The Family', upper: 4, lower: 4, judgment: 'The Family. The perseverance of the woman furthers.', image: 'Wind comes forth from fire: The image of The Family. Thus the superior man has substance in his words and duration in his way of life.' },
      38: { name: 'Opposition', upper: 2, lower: 2, judgment: 'Opposition. In small matters, good fortune.', image: 'Above, fire; below, the lake: The image of Opposition. Thus amid all fellowship the superior man retains his individuality.' },
      39: { name: 'Obstruction', upper: 5, lower: 6, judgment: 'Obstruction. The southwest furthers. The northeast does not further. It furthers one to see the great man.', image: 'Water on the mountain: The image of Obstruction. Thus the superior man turns his attention to himself and molds his character.' },
      40: { name: 'Deliverance', upper: 3, lower: 5, judgment: 'Deliverance. The southwest furthers. If there is no longer anything where one has to go, return brings good fortune.', image: 'Thunder and rain set in: The image of Deliverance. Thus the superior man pardons mistakes and forgives misdeeds.' },
      41: { name: 'Decrease', upper: 6, lower: 7, judgment: 'Decrease combined with sincerity brings about supreme good fortune without blame.', image: 'At the foot of the mountain, the lake: The image of Decrease. Thus the superior man controls his anger and restrains his instincts.' },
      42: { name: 'Increase', upper: 4, lower: 3, judgment: 'Increase. It furthers one to undertake something. It furthers one to cross the great water.', image: 'Wind and thunder: The image of Increase. Thus the superior man, when he sees good, imitates it; when he has faults, he amends them.' },
      43: { name: 'Breakthrough', upper: 7, lower: 3, judgment: 'Breakthrough. One must resolutely make the matter known at the court of the king. It must be announced truthfully.', image: 'The lake has risen up to heaven: The image of Breakthrough. Thus the superior man bestows wealth downward and refrains from resting on his virtue.' },
      44: { name: 'Coming to Meet', upper: 0, lower: 3, judgment: 'Coming to Meet. The maiden is powerful. One should not marry such a maiden.', image: 'Under heaven, wind: The image of Coming to Meet. Thus does the prince act when disseminating his commands.' },
      45: { name: 'Gathering Together', upper: 7, lower: 4, judgment: 'Gathering Together. Success. The king approaches his temple. It furthers one to see the great man.', image: 'Over the earth, the lake: The image of Gathering Together. Thus the superior man renews his weapons in order to meet the unforeseen.' },
      46: { name: 'Pushing Upward', upper: 7, lower: 6, judgment: 'Pushing Upward has supreme success. One must see the great man. Fear not. Departure toward the south brings good fortune.', image: 'Within the earth, wood grows: The image of Pushing Upward. Thus the superior man of devoted character heaps up small things in order to achieve something high and great.' },
      47: { name: 'Oppression', upper: 5, lower: 4, judgment: 'Oppression. Success. Perseverance. The great man brings about good fortune. No blame.', image: 'There is no water in the lake: The image of Oppression. Thus the superior man walks in lasting virtue and carries on the business of teaching.' },
      48: { name: 'The Well', upper: 5, lower: 5, judgment: 'The Well. The town may be changed, but the well cannot be changed. It neither decreases nor increases.', image: 'Water over wood: The image of The Well. Thus the superior man encourages the people at their work and exhorts them to help one another.' },
      49: { name: 'Revolution', upper: 2, lower: 4, judgment: 'Revolution. On your own day you are believed. Supreme success, furthering through perseverance.', image: 'Fire in the lake: The image of Revolution. Thus the superior man sets the calendar in order and makes the seasons clear.' },
      50: { name: 'The Cauldron', upper: 2, lower: 2, judgment: 'The Cauldron. Supreme good fortune. Success.', image: 'Fire over wood: The image of The Cauldron. Thus the superior man, in accordance with the time, prepares the means of nourishment.' },
      51: { name: 'The Arousing', upper: 3, lower: 3, judgment: 'The Arousing has success. One must be strong. One goes and comes and is without error.', image: 'Thunder repeated: The image of The Arousing. Thus in fear and trembling the superior man sets his life in order.' },
      52: { name: 'Keeping Still', upper: 6, lower: 6, judgment: 'Keeping Still. Keeping his back still so that he no longer feels his body. He goes into his courtyard and does not see his people.', image: 'Mountains standing close together: The image of Keeping Still. Thus the superior man does not permit his thoughts to go beyond his situation.' },
      53: { name: 'Development', upper: 4, lower: 4, judgment: 'Development. The maiden is given in marriage. Good fortune. Perseverance furthers.', image: 'On the mountain, a tree: The image of Development. Thus the superior man abides in dignity and virtue.' },
      54: { name: 'The Marrying Maiden', upper: 3, lower: 4, judgment: 'The Marrying Maiden. Undertakings bring misfortune. Nothing that would further.', image: 'Thunder over the lake: The image of The Marrying Maiden. Thus the superior man understands the transitory in the light of the eternity of the end.' },
      55: { name: 'Abundance', upper: 3, lower: 2, judgment: 'Abundance has success. The king attains abundance. Be not sad. Be like the sun at midday.', image: 'Both thunder and lightning come: The image of Abundance. Thus the superior man decides lawsuits and carries out punishments.' },
      56: { name: 'The Wanderer', upper: 2, lower: 6, judgment: 'The Wanderer. Success through smallness. Perseverance brings good fortune to the wanderer.', image: 'Fire on the mountain: The image of The Wanderer. Thus the superior man is clear-minded and cautious in imposing penalties.' },
      57: { name: 'The Gentle', upper: 4, lower: 4, judgment: 'The Gentle. Success through what is small. It furthers one to have somewhere to go. It furthers one to see the great man.', image: 'Winds following one upon the other: The image of The Gentle. Thus the superior man spreads his commands abroad.' },
      58: { name: 'The Joyous', upper: 4, lower: 4, judgment: 'The Joyous. Success. Perseverance is favorable.', image: 'Lakes resting one on the other: The image of The Joyous. Thus the superior man joins with his friends for discussion and practice.' },
      59: { name: 'Dispersion', upper: 5, lower: 3, judgment: 'Dispersion. Success. The king approaches his temple. It furthers one to cross the great water.', image: 'The wind drives over the water: The image of Dispersion. Thus the kings of old sacrificed to the Lord and built temples.' },
      60: { name: 'Limitation', upper: 4, lower: 5, judgment: 'Limitation. Success. Galling limitation must not be persevered in.', image: 'Water over lake: The image of Limitation. Thus the superior man creates number and measure, and examines the nature of virtue and correct conduct.' },
      61: { name: 'Inner Truth', upper: 5, lower: 4, judgment: 'Inner Truth. Pigs and fishes. Good fortune. It furthers one to cross the great water.', image: 'Wind over lake: The image of Inner Truth. Thus the superior man discusses criminal cases in order to delay executions.' },
      62: { name: 'Preponderance of the Small', upper: 3, lower: 6, judgment: 'Preponderance of the Small. Success. Perseverance furthers. Small things may be done; great things should not be done.', image: 'Thunder on the mountain: The image of Preponderance of the Small. Thus in his conduct the superior man gives preponderance to reverence.' },
      63: { name: 'After Completion', upper: 5, lower: 2, judgment: 'After Completion. Success. In small matters, good fortune.', image: 'Water over fire: The image of After Completion. Thus the superior man takes thought of misfortune and arms himself against it in advance.' },
      64: { name: 'Before Completion', upper: 2, lower: 5, judgment: 'Before Completion. Success. But if the little fox, after nearly completing the crossing, gets his tail in the water, there is nothing that would further.', image: 'Fire over water: The image of Before Completion. Thus the superior man carefully discriminates among the qualities of things.' }
    };
  }

  /**
   * Generate I Ching reading with hexagram and interpretation
   * @param {string} question - User's question (optional)
   * @returns {Object} I Ching reading
   */
  generateIChingReading(question = '') {
    try {
      // Generate primary hexagram
      const primaryHexagram = this.generateHexagram();

      // Generate changing lines
      const changingLines = this.generateChangingLines(primaryHexagram.lines);

      // Calculate related hexagrams
      const nuclearHexagram = this.calculateNuclearHexagram(primaryHexagram);
      const relatingHexagram = this.calculateRelatingHexagram(primaryHexagram);

      // Generate transformed hexagram if there are changing lines
      const transformedHexagram = changingLines.length > 0 ?
        this.transformHexagram(primaryHexagram, changingLines) : null;

      return {
        question: question || 'General guidance',
        primaryHexagram,
        changingLines,
        transformedHexagram,
        nuclearHexagram,
        relatingHexagram,
        interpretation: this.generateInterpretation(primaryHexagram, changingLines, transformedHexagram),
        ichingDescription: this.generateIChingDescription(primaryHexagram, changingLines, transformedHexagram)
      };
    } catch (error) {
      logger.error('Error generating I Ching reading:', error);
      return {
        error: 'Unable to generate I Ching reading at this time',
        fallback: 'The I Ching offers wisdom through the flow of yin and yang'
      };
    }
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

    return {
      number: hexagramNumber,
      name: this.hexagrams[hexagramNumber].name,
      lines,
      upperTrigram: this.calculateUpperTrigram(lines),
      lowerTrigram: this.calculateLowerTrigram(lines),
      judgment: this.hexagrams[hexagramNumber].judgment,
      image: this.hexagrams[hexagramNumber].image
    };
  }

  /**
   * Generate a single line (yin, yang, or changing)
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
    case 0: return 6; // 3 tails - old yin (changing)
    case 1: return 8; // 1 head 2 tails - young yin
    case 2: return 7; // 2 heads 1 tail - young yang
    case 3: return 9; // 3 heads - old yang (changing)
    default: return 7;
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
      const lineValue = (lines[i] === 7 || lines[i] === 9) ? 1 : 0;
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
    return this.trigrams[trigramNumber];
  }

  /**
   * Calculate lower trigram (lines 1-3)
   * @param {Array} lines - Array of line values
   * @returns {Object} Lower trigram data
   */
  calculateLowerTrigram(lines) {
    const lowerLines = lines.slice(0, 3); // Lines 1, 2, 3 (0-indexed 0,1,2)
    const trigramNumber = this.calculateTrigramNumber(lowerLines);
    return this.trigrams[trigramNumber];
  }

  /**
   * Calculate trigram number from three lines
   * @param {Array} lines - Three line values
   * @returns {number} Trigram number (0-7)
   */
  calculateTrigramNumber(lines) {
    let binary = '';
    for (let i = 0; i < 3; i++) {
      const lineValue = (lines[i] === 7 || lines[i] === 9) ? 1 : 0;
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

    return {
      number: transformedNumber,
      name: this.hexagrams[transformedNumber].name,
      lines: transformedLines,
      judgment: this.hexagrams[transformedNumber].judgment,
      image: this.hexagrams[transformedNumber].image
    };
  }

  /**
   * Calculate nuclear hexagram (inner trigrams)
   * @param {Object} hexagram - Hexagram data
   * @returns {Object} Nuclear hexagram data
   */
  calculateNuclearHexagram(hexagram) {
    // Nuclear hexagram uses lines 2, 3, 4, 5
    const nuclearLines = [hexagram.lines[1], hexagram.lines[2], hexagram.lines[3], hexagram.lines[4]];
    const nuclearNumber = this.calculateHexagramNumber(nuclearLines);

    return {
      number: nuclearNumber,
      name: this.hexagrams[nuclearNumber].name,
      judgment: this.hexagrams[nuclearNumber].judgment
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
      if (line === 6 || line === 8) { return 7; }
      if (line === 7 || line === 9) { return 8; }
      return line;
    });

    const relatingNumber = this.calculateHexagramNumber(relatingLines);

    return {
      number: relatingNumber,
      name: this.hexagrams[relatingNumber].name,
      judgment: this.hexagrams[relatingNumber].judgment
    };
  }

  /**
   * Generate interpretation of the reading
   * @param {Object} primaryHexagram - Primary hexagram
   * @param {Array} changingLines - Changing lines
   * @param {Object} transformedHexagram - Transformed hexagram
   * @returns {Object} Interpretation
   */
  generateInterpretation(primaryHexagram, changingLines, transformedHexagram) {
    const interpretation = {
      primary: `Hexagram ${primaryHexagram.number}: ${primaryHexagram.name}`,
      guidance: primaryHexagram.judgment,
      situation: this.extractSituation(primaryHexagram),
      advice: this.extractAdvice(primaryHexagram)
    };

    if (changingLines.length > 0) {
      interpretation.transformation = `The hexagram transforms to ${transformedHexagram.name} (${transformedHexagram.number})`;
      interpretation.transformedGuidance = transformedHexagram.judgment;
      interpretation.changingLines = changingLines.map(line => `Line ${line} is changing`);
    }

    return interpretation;
  }

  /**
   * Extract situation description from hexagram
   * @param {Object} hexagram - Hexagram data
   * @returns {string} Situation description
   */
  extractSituation(hexagram) {
    const situations = {
      1: 'A time of pure creative power and new beginnings',
      2: 'A period of receptivity and nurturing support',
      11: 'Harmony and peace prevail in your situation',
      12: 'Standstill and separation challenge your path',
      25: 'Innocence and natural action guide you',
      29: 'Dangerous waters require careful navigation'
    };

    return situations[hexagram.number] || 'The situation requires careful consideration of the forces at play';
  }

  /**
   * Extract advice from hexagram
   * @param {Object} hexagram - Hexagram data
   * @returns {string} Advice
   */
  extractAdvice(hexagram) {
    const advice = {
      1: 'Lead with creative power and maintain perseverance',
      2: 'Be receptive and supportive, like the nurturing earth',
      15: 'Practice modesty and balance in all actions',
      16: 'Express enthusiasm and inspire others through action',
      32: 'Maintain constancy and steady progress',
      58: 'Find joy in relationships and shared experiences'
    };

    return advice[hexagram.number] || 'Follow the natural flow of the situation with wisdom and patience';
  }

  /**
   * Generate comprehensive I Ching description
   * @param {Object} primaryHexagram - Primary hexagram
   * @param {Array} changingLines - Changing lines
   * @param {Object} transformedHexagram - Transformed hexagram
   * @returns {string} I Ching description
   */
  generateIChingDescription(primaryHexagram, changingLines, transformedHexagram) {
    let description = '🔮 *I Ching Reading*\n\n';

    description += `📖 *Primary Hexagram: ${primaryHexagram.number} - ${primaryHexagram.name}*\n`;
    description += `• Upper Trigram: ${primaryHexagram.upperTrigram.name} (${primaryHexagram.upperTrigram.symbol})\n`;
    description += `• Lower Trigram: ${primaryHexagram.lowerTrigram.name} (${primaryHexagram.lowerTrigram.symbol})\n\n`;

    description += `🎭 *Judgment:*\n${primaryHexagram.judgment}\n\n`;

    description += `🖼️ *Image:*\n${primaryHexagram.image}\n\n`;

    if (changingLines.length > 0) {
      description += '🔄 *Changing Lines:*\n';
      changingLines.forEach(line => {
        description += `• Line ${line} is transforming\n`;
      });
      description += `\n📈 *Transformed Hexagram: ${transformedHexagram.number} - ${transformedHexagram.name}*\n`;
      description += `• Judgment: ${transformedHexagram.judgment}\n\n`;
    }

    description += '🧘 *Meditation Focus:*\n';
    description += `• Reflect on the balance of ${primaryHexagram.upperTrigram.qualities[0]} and ${primaryHexagram.lowerTrigram.qualities[0]}\n`;
    description += `• Consider: ${this.extractSituation(primaryHexagram)}\n\n`;

    description += `💡 *Practical Advice:*\n${this.extractAdvice(primaryHexagram)}`;

    return description;
  }

  /**
   * Generate daily I Ching guidance
   * @param {string} focus - Daily focus or question
   * @returns {Object} Daily guidance
   */
  generateDailyGuidance(focus = 'daily wisdom') {
    try {
      const reading = this.generateIChingReading(focus);

      return {
        hexagram: `${reading.primaryHexagram.number} - ${reading.primaryHexagram.name}`,
        guidance: reading.interpretation.guidance,
        dailyFocus: reading.interpretation.advice,
        meditation: `Contemplate the ${reading.primaryHexagram.upperTrigram.name} above and ${reading.primaryHexagram.lowerTrigram.name} below`,
        affirmation: this.generateAffirmation(reading.primaryHexagram)
      };
    } catch (error) {
      logger.error('Error generating daily guidance:', error);
      return {
        hexagram: 'Unknown',
        guidance: 'Seek wisdom in the flow of life',
        dailyFocus: 'Practice mindfulness and balance',
        meditation: 'Meditate on the harmony of yin and yang',
        affirmation: 'I flow with the wisdom of the I Ching'
      };
    }
  }

  /**
   * Generate affirmation based on hexagram
   * @param {Object} hexagram - Hexagram data
   * @returns {string} Affirmation
   */
  generateAffirmation(hexagram) {
    const affirmations = {
      1: 'I create with pure power and divine will',
      2: 'I receive and nurture with perfect receptivity',
      11: 'I bring harmony and peace to all situations',
      15: 'I practice modesty and balance in all things',
      25: 'I act with natural innocence and wisdom',
      32: 'I maintain constancy through all changes'
    };

    return affirmations[hexagram.number] || 'I align with the natural flow of the universe';
  }
}

module.exports = new IChingReader();
