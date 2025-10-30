const logger = require('../../../utils/logger');

/**
 * IChingConfig - Configuration and data structures for I Ching system
 * Contains all trigrams, hexagrams, and foundational I Ching data
 */
class IChingConfig {
  constructor() {
    logger.info('Module: IChingConfig loaded with complete I Ching database');

    // Initialize trigrams data
    this.trigrams = this.initializeTrigrams();

    // Initialize hexagrams data
    this.hexagrams = this.initializeHexagrams();
  }

  /**
   * Initialize the 8 fundamental trigrams
   * @returns {Object} Trigrams data
   */
  initializeTrigrams() {
    return {
      0: {
        name: 'Heaven',
        symbol: '☰',
        nature: 'Creative',
        element: 'Metal',
        direction: 'Northwest',
        qualities: ['Strength', 'Creativity', 'Leadership']
      },
      1: {
        name: 'Lake',
        symbol: '☱',
        nature: 'Joyful',
        element: 'Metal',
        direction: 'West',
        qualities: ['Joy', 'Communication', 'Pleasing']
      },
      2: {
        name: 'Fire',
        symbol: '☲',
        nature: 'Clinging',
        element: 'Fire',
        direction: 'South',
        qualities: ['Clarity', 'Illumination', 'Attachment']
      },
      3: {
        name: 'Thunder',
        symbol: '☳',
        nature: 'Arousing',
        element: 'Wood',
        direction: 'East',
        qualities: ['Movement', 'Initiation', 'Shock']
      },
      4: {
        name: 'Wind',
        symbol: '☴',
        nature: 'Gentle',
        element: 'Wood',
        direction: 'Southeast',
        qualities: ['Gentleness', 'Penetration', 'Adaptation']
      },
      5: {
        name: 'Water',
        symbol: '☵',
        nature: 'Abysmal',
        element: 'Water',
        direction: 'North',
        qualities: ['Danger', 'Depth', 'Adaptability']
      },
      6: {
        name: 'Mountain',
        symbol: '☶',
        nature: 'Keeping Still',
        element: 'Earth',
        direction: 'Northeast',
        qualities: ['Stillness', 'Meditation', 'Endurance']
      },
      7: {
        name: 'Earth',
        symbol: '☷',
        nature: 'Receptive',
        element: 'Earth',
        direction: 'Southwest',
        qualities: ['Receptivity', 'Nurturing', 'Support']
      }
    };
  }

  /**
   * Initialize all 64 hexagrams with traditional judgments and images
   * @returns {Object} Hexagrams data
   */
  initializeHexagrams() {
    return {
      1: {
        name: 'The Creative',
        upper: 0, lower: 0,
        judgment: 'The Creative works sublime success, Furthering through perseverance.',
        image: 'The movement of heaven is full of power. Thus the superior man makes himself strong and untiring.'
      },
      2: {
        name: 'The Receptive',
        upper: 7, lower: 7,
        judgment: 'The Receptive brings about sublime success, Furthering through the perseverance of a mare.',
        image: 'The earth\'s condition is receptive devotion. Thus the superior man who has breadth of character carries the outer world.'
      },
      3: {
        name: 'Difficulty at the Beginning',
        upper: 5, lower: 3,
        judgment: 'Difficulty at the Beginning works supreme success, Furthering through perseverance.',
        image: 'Clouds and thunder: The image of Difficulty at the Beginning. Thus the superior man brings order out of confusion.'
      },
      4: {
        name: 'Youthful Folly',
        upper: 6, lower: 7,
        judgment: 'Youthful Folly has success. It is not I who seek the young fool; The young fool seeks me.',
        image: 'A spring wells up at the foot of the mountain: The image of Youth. Thus the superior man fosters his character by thoroughness in all that he does.'
      },
      5: {
        name: 'Waiting',
        upper: 0, lower: 5,
        judgment: 'Waiting. If you are sincere, you have light and success. Perseverance brings good fortune.',
        image: 'Clouds rise up to heaven: The image of Waiting. Thus the superior man eats and drinks, is joyous and of good cheer.'
      },
      6: {
        name: 'Conflict',
        upper: 0, lower: 0,
        judgment: 'Conflict. You are sincere and are being obstructed. A cautious halt halfway brings good fortune.',
        image: 'Heaven and water go their opposite ways: The image of Conflict. Thus in all his transactions the superior man carefully considers the beginning.'
      },
      7: {
        name: 'The Army',
        upper: 7, lower: 7,
        judgment: 'The Army. The army needs perseverance and a strong man. Good fortune without blame.',
        image: 'In the middle of the earth is water: The image of The Army. Thus the superior man increases his masses by generosity toward the people.'
      },
      8: {
        name: 'Holding Together',
        upper: 5, lower: 5,
        judgment: 'Holding Together brings good fortune. Inquire of the oracle once more whether you possess sublimity, constancy, and perseverance.',
        image: 'On the earth is water: The image of Holding Together. Thus the kings of antiquity bestowed the different states as fiefs and cultivated friendly relations with the feudal lords.'
      },
      9: {
        name: 'The Taming Power of the Small',
        upper: 0, lower: 4,
        judgment: 'The Taming Power of the Small has success. Dense clouds, no rain from our western region.',
        image: 'The wind drives across heaven: The image of The Taming Power of the Small. Thus the superior man refines the outward aspect of his nature.'
      },
      10: {
        name: 'Treading',
        upper: 7, lower: 2,
        judgment: 'Treading upon the tail of the tiger. It does not bite the man. Success.',
        image: 'Heaven above, the lake below: The image of Treading. Thus the superior man discriminates between high and low, and thereby fortifies the thinking of the people.'
      },
      11: {
        name: 'Peace',
        upper: 7, lower: 0,
        judgment: 'Peace. The small departs, the great approaches. Good fortune. Success.',
        image: 'Heaven and earth unite: The image of Peace. Thus the ruler divides and completes the course of heaven and earth.'
      },
      12: {
        name: 'Standstill',
        upper: 0, lower: 7,
        judgment: 'Standstill. Evil people do not further the perseverance of the superior man.',
        image: 'Heaven and earth do not unite: The image of Standstill. Thus the superior man falls back upon his inner worth in order to escape the difficulties.'
      },
      13: {
        name: 'Fellowship with Men',
        upper: 0, lower: 2,
        judgment: 'Fellowship with Men in the open. Success. It furthers one to cross the great water.',
        image: 'Heaven together with fire: The image of Fellowship with Men. Thus the superior man organizes the clans and makes distinctions between things.'
      },
      14: {
        name: 'Possession in Great Measure',
        upper: 2, lower: 2,
        judgment: 'Possession in Great Measure. Supreme success.',
        image: 'Fire in heaven above: The image of Possession in Great Measure. Thus the superior man curbs evil and furthers good.'
      },
      15: {
        name: 'Modesty',
        upper: 7, lower: 6,
        judgment: 'Modesty creates success. The superior man carries things through.',
        image: 'Within the earth, a mountain: The image of Modesty. Thus the superior man reduces that which is too much, and augments that which is too little.'
      },
      16: {
        name: 'Enthusiasm',
        upper: 3, lower: 3,
        judgment: 'Enthusiasm. It furthers one to install helpers and to set armies marching.',
        image: 'Thunder comes resounding out of the earth: The image of Enthusiasm. Thus the ancient kings made music in order to honor merit.'
      },
      17: {
        name: 'Following',
        upper: 7, lower: 3,
        judgment: 'Following has supreme success. Perseverance furthers.',
        image: 'Thunder in the middle of the lake: The image of Following. Thus the superior man at nightfall goes indoors for rest and recuperation.'
      },
      18: {
        name: 'Work on What Has Been Spoiled',
        upper: 6, lower: 6,
        judgment: 'Work on What Has Been Spoiled has supreme success. It furthers one to cross the great water.',
        image: 'The wind blows low on the mountain: The image of Work on What Has Been Spoiled. Thus the superior man stirs up the people and strengthens their spirit.'
      },
      19: {
        name: 'Approach',
        upper: 7, lower: 4,
        judgment: 'Approach has supreme success. Perseverance furthers. When the eighth month comes, there will be misfortune.',
        image: 'The earth above the lake: The image of Approach. Thus the superior man is inexhaustible in his will to teach.'
      },
      20: {
        name: 'Contemplation',
        upper: 4, lower: 4,
        judgment: 'Contemplation. The ablution has been made, but not yet the offering. Full of trust they look up to him.',
        image: 'The wind blows over the earth: The image of Contemplation. Thus the kings of old visited the regions of the world.'
      },
      21: {
        name: 'Biting Through',
        upper: 2, lower: 3,
        judgment: 'Biting Through has success. It is favorable to let justice be administered.',
        image: 'Thunder and lightning: The image of Biting Through. Thus the kings of former times made firm the laws through clearly defined penalties.'
      },
      22: {
        name: 'Grace',
        upper: 6, lower: 2,
        judgment: 'Grace has success. In small matters it is favorable to undertake something.',
        image: 'Fire at the foot of the mountain: The image of Grace. Thus the superior man proceeds when the time has come.'
      },
      23: {
        name: 'Splitting Apart',
        upper: 6, lower: 7,
        judgment: 'Splitting Apart. It does not further one to go anywhere.',
        image: 'The mountain rests on the earth: The image of Splitting Apart. Thus those above can ensure their position only by giving generously to those below.'
      },
      24: {
        name: 'Return',
        upper: 3, lower: 7,
        judgment: 'Return. Success. Going out and coming in without error. Friends come without blame.',
        image: 'Thunder within the earth: The image of Return. Thus the kings of antiquity closed the passes at the time of solstice.'
      },
      25: {
        name: 'Innocence',
        upper: 0, lower: 3,
        judgment: 'Innocence. Supreme success. Perseverance furthers. If someone is not as he should be, he has misfortune.',
        image: 'Under heaven thunder rolls: The image of Innocence. Thus the kings of antiquity made music in order to honor merit.'
      },
      26: {
        name: 'The Taming Power of the Great',
        upper: 6, lower: 0,
        judgment: 'The Taming Power of the Great. Perseverance furthers. Not eating at home brings good fortune.',
        image: 'Heaven within the mountain: The image of The Taming Power of the Great. Thus the superior man acquaints himself with many sayings of antiquity.'
      },
      27: {
        name: 'The Corners of the Mouth',
        upper: 6, lower: 7,
        judgment: 'The Corners of the Mouth. Perseverance brings good fortune. Pay heed to the providing of nourishment.',
        image: 'At the foot of the mountain, the lake: The image of Providing Nourishment. Thus the superior man is careful of his words and temperate in eating and drinking.'
      },
      28: {
        name: 'Preponderance of the Great',
        upper: 7, lower: 4,
        judgment: 'Preponderance of the Great. The ridgepole sags to the breaking point. It furthers one to have somewhere to go.',
        image: 'The lake rises above the trees: The image of Preponderance of the Great. Thus the superior man, when he stands alone, is unconcerned.'
      },
      29: {
        name: 'The Abysmal',
        upper: 5, lower: 5,
        judgment: 'The Abysmal repeated. If you are sincere, you have success in your heart, and whatever you do succeeds.',
        image: 'Water flows on uninterruptedly and reaches its goal: The image of the Abysmal. Thus the superior man walks in lasting virtue.'
      },
      30: {
        name: 'The Clinging',
        upper: 2, lower: 2,
        judgment: 'The Clinging. Perseverance furthers. It brings success. Care of the cow brings good fortune.',
        image: 'That which is bright rises twice: The image of The Clinging. Thus the great man, by perpetuating this brightness, illumines the four quarters of the world.'
      },
      31: {
        name: 'Influence',
        upper: 7, lower: 4,
        judgment: 'Influence. Success. Perseverance furthers. To take a maiden to wife brings good fortune.',
        image: 'A lake on the mountain: The image of Influence. Thus the superior man encourages people to approach him by his readiness to receive them.'
      },
      32: {
        name: 'Duration',
        upper: 3, lower: 3,
        judgment: 'Duration. Success. No blame. Perseverance furthers. It furthers one to have somewhere to go.',
        image: 'Thunder and wind: The image of Duration. Thus the superior man stands firm and does not change his direction.'
      },
      33: {
        name: 'Retreat',
        upper: 0, lower: 6,
        judgment: 'Retreat. Success. In what is small, perseverance furthers.',
        image: 'Mountain under heaven: The image of Retreat. Thus the superior man keeps the inferior man at a distance.'
      },
      34: {
        name: 'The Power of the Great',
        upper: 3, lower: 0,
        judgment: 'The Power of the Great. Perseverance furthers.',
        image: 'Thunder in heaven above: The image of The Power of the Great. Thus the superior man does not tread upon paths that do not accord with established order.'
      },
      35: {
        name: 'Progress',
        upper: 2, lower: 7,
        judgment: 'Progress. The powerful prince is honored with horses in large numbers. In a single day he is granted audience three times.',
        image: 'The sun rises over the earth: The image of Progress. Thus the superior man himself brightens his bright virtue.'
      },
      36: {
        name: 'Darkening of the Light',
        upper: 7, lower: 2,
        judgment: 'Darkening of the Light. In adversity it furthers one to be persevering.',
        image: 'The light has sunk into the earth: The image of Darkening of the Light. Thus does the superior man live with the great mass.'
      },
      37: {
        name: 'The Family',
        upper: 4, lower: 4,
        judgment: 'The Family. The perseverance of the woman furthers.',
        image: 'Wind comes forth from fire: The image of The Family. Thus the superior man has substance in his words and duration in his way of life.'
      },
      38: {
        name: 'Opposition',
        upper: 2, lower: 2,
        judgment: 'Opposition. In small matters, good fortune.',
        image: 'Above, fire; below, the lake: The image of Opposition. Thus amid all fellowship the superior man retains his individuality.'
      },
      39: {
        name: 'Obstruction',
        upper: 5, lower: 6,
        judgment: 'Obstruction. The southwest furthers. The northeast does not further. It furthers one to see the great man.',
        image: 'Water on the mountain: The image of Obstruction. Thus the superior man turns his attention to himself and molds his character.'
      },
      40: {
        name: 'Deliverance',
        upper: 3, lower: 5,
        judgment: 'Deliverance. The southwest furthers. If there is no longer anything where one has to go, return brings good fortune.',
        image: 'Thunder and rain set in: The image of Deliverance. Thus the superior man pardons mistakes and forgives misdeeds.'
      },
      41: {
        name: 'Decrease',
        upper: 6, lower: 7,
        judgment: 'Decrease combined with sincerity brings about supreme good fortune without blame.',
        image: 'At the foot of the mountain, the lake: The image of Decrease. Thus the superior man controls his anger and restrains his instincts.'
      },
      42: {
        name: 'Increase',
        upper: 4, lower: 3,
        judgment: 'Increase. It furthers one to undertake something. It furthers one to cross the great water.',
        image: 'Wind and thunder: The image of Increase. Thus the superior man, when he sees good, imitates it; when he has faults, he amends them.'
      },
      43: {
        name: 'Breakthrough',
        upper: 7, lower: 3,
        judgment: 'Breakthrough. One must resolutely make the matter known at the court of the king. It must be announced truthfully.',
        image: 'The lake has risen up to heaven: The image of Breakthrough. Thus the superior man bestows wealth downward and refrains from resting on his virtue.'
      },
      44: {
        name: 'Coming to Meet',
        upper: 0, lower: 3,
        judgment: 'Coming to Meet. The maiden is powerful. One should not marry such a maiden.',
        image: 'Under heaven, wind: The image of Coming to Meet. Thus does the prince act when disseminating his commands.'
      },
      45: {
        name: 'Gathering Together',
        upper: 7, lower: 4,
        judgment: 'Gathering Together. Success. The king approaches his temple. It furthers one to see the great man.',
        image: 'Over the earth, the lake: The image of Gathering Together. Thus the superior man renews his weapons in order to meet the unforeseen.'
      },
      46: {
        name: 'Pushing Upward',
        upper: 7, lower: 6,
        judgment: 'Pushing Upward has supreme success. One must see the great man. Fear not. Departure toward the south brings good fortune.',
        image: 'Within the earth, wood grows: The image of Pushing Upward. Thus the superior man of devoted character heaps up small things in order to achieve something high and great.'
      },
      47: {
        name: 'Oppression',
        upper: 5, lower: 4,
        judgment: 'Oppression. Success. Perseverance. The great man brings about good fortune. No blame.',
        image: 'There is no water in the lake: The image of Oppression. Thus the superior man walks in lasting virtue and carries on the business of teaching.'
      },
      48: {
        name: 'The Well',
        upper: 5, lower: 5,
        judgment: 'The Well. The town may be changed, but the well cannot be changed. It neither decreases nor increases.',
        image: 'Water over wood: The image of The Well. Thus the superior man encourages the people at their work and exhorts them to help one another.'
      },
      49: {
        name: 'Revolution',
        upper: 2, lower: 4,
        judgment: 'Revolution. On your own day you are believed. Supreme success, furthering through perseverance.',
        image: 'Fire in the lake: The image of Revolution. Thus the superior man sets the calendar in order and makes the seasons clear.'
      },
      50: {
        name: 'The Cauldron',
        upper: 2, lower: 2,
        judgment: 'The Cauldron. Supreme good fortune. Success.',
        image: 'Fire over wood: The image of The Cauldron. Thus the superior man, in accordance with the time, prepares the means of nourishment.'
      },
      51: {
        name: 'The Arousing',
        upper: 3, lower: 3,
        judgment: 'The Arousing has success. One must be strong. One goes and comes and is without error.',
        image: 'Thunder repeated: The image of The Arousing. Thus in his conduct the superior man gives preponderance to reverence.'
      },
      52: {
        name: 'Keeping Still',
        upper: 6, lower: 6,
        judgment: 'Keeping Still. Keeping his back still so that he no longer feels his body. He goes into his courtyard and does not see his people.',
        image: 'Mountains standing close together: The image of Keeping Still. Thus the superior man does not permit his thoughts to go beyond his situation.'
      },
      53: {
        name: 'Development',
        upper: 4, lower: 4,
        judgment: 'Development. The maiden is given in marriage. Good fortune. Perseverance furthers.',
        image: 'On the mountain, a tree: The image of Development. Thus the superior man abides in dignity and virtue.'
      },
      54: {
        name: 'The Marrying Maiden',
        upper: 3, lower: 4,
        judgment: 'The Marrying Maiden. Undertakings bring misfortune. Nothing that would further.',
        image: 'Thunder over the lake: The image of The Marrying Maiden. Thus the superior man understands the transitory in the light of the eternity of the end.'
      },
      55: {
        name: 'Abundance',
        upper: 3, lower: 2,
        judgment: 'Abundance has success. The king attains abundance. Be not sad. Be like the sun at midday.',
        image: 'Both thunder and lightning come: The image of Abundance. Thus the superior man decides lawsuits and carries out punishments.'
      },
      56: {
        name: 'The Wanderer',
        upper: 2, lower: 6,
        judgment: 'The Wanderer. Success through smallness. Perseverance brings good fortune to the wanderer.',
        image: 'Fire on the mountain: The image of The Wanderer. Thus the superior man is clear-minded and cautious in imposing penalties.'
      },
      57: {
        name: 'The Gentle',
        upper: 4, lower: 4,
        judgment: 'The Gentle. Success through what is small. It furthers one to have somewhere to go. It furthers one to see the great man.',
        image: 'Winds following one upon the other: The image of The Gentle. Thus the superior man spreads his commands abroad.'
      },
      58: {
        name: 'The Joyous',
        upper: 4, lower: 4,
        judgment: 'The Joyous. Success. Perseverance is favorable.',
        image: 'Lakes resting one on the other: The image of The Joyous. Thus the superior man joins with his friends for discussion and practice.'
      },
      59: {
        name: 'Dispersion',
        upper: 5, lower: 3,
        judgment: 'Dispersion. Success. The king approaches his temple. It furthers one to cross the great water.',
        image: 'The wind drives over the water: The image of Dispersion. Thus the kings of old sacrificed to the Lord and built temples.'
      },
      60: {
        name: 'Limitation',
        upper: 4, lower: 5,
        judgment: 'Limitation. Success. Galling limitation must not be persevered in.',
        image: 'Water over lake: The image of Limitation. Thus the superior man creates number and measure, and examines the nature of virtue and correct conduct.'
      },
      61: {
        name: 'Inner Truth',
        upper: 5, lower: 4,
        judgment: 'Inner Truth. Pigs and fishes. Good fortune. It furthers one to cross the great water.',
        image: 'Wind over lake: The image of Inner Truth. Thus the kings of old sacrificed to the Lord and built temples.'
      },
      62: {
        name: 'Preponderance of the Small',
        upper: 3, lower: 6,
        judgment: 'Preponderance of the Small. Success. Perseverance furthers. Small things may be done; great things should not be done.',
        image: 'Thunder on the mountain: The image of Preponderance of the Small. Thus in his conduct the superior man gives preponderance to reverence.'
      },
      63: {
        name: 'After Completion',
        upper: 5, lower: 2,
        judgment: 'After Completion. Success. In small matters, good fortune.',
        image: 'Water over fire: The image of After Completion. Thus the superior man takes thought of misfortune and arms himself against it in advance.'
      },
      64: {
        name: 'Before Completion',
        upper: 2, lower: 5,
        judgment: 'Before Completion. Success. But if the little fox, after nearly completing the crossing, gets his tail in the water, there is nothing that would further.',
        image: 'Fire over water: The image of Before Completion. Thus the superior man carefully discriminates among the qualities of things.'
      }
    };
  }

  /**
   * Get trigram data by number
   * @param {number} trigramNumber - Trigram number (0-7)
   * @returns {Object} Trigram data
   */
  getTrigram(trigramNumber) {
    return this.trigrams[trigramNumber];
  }

  /**
   * Get all trigram data
   * @returns {Object} All trigrams
   */
  getAllTrigrams() {
    return this.trigrams;
  }

  /**
   * Get hexagram data by number
   * @param {number} hexagramNumber - Hexagram number (1-64)
   * @returns {Object} Hexagram data
   */
  getHexagram(hexagramNumber) {
    return this.hexagrams[hexagramNumber];
  }

  /**
   * Get all hexagram data
   * @returns {Object} All hexagrams
   */
  getAllHexagrams() {
    return this.hexagrams;
  }

  /**
   * Health check for IChingConfig
   * @returns {Object} Health status
   */
  healthCheck() {
    try {
      const trigramCount = Object.keys(this.trigrams).length;
      const hexagramCount = Object.keys(this.hexagrams).length;

      return {
        healthy: trigramCount === 8 && hexagramCount === 64,
        trigramCount,
        hexagramCount,
        version: '1.0.0',
        status: trigramCount === 8 && hexagramCount === 64 ? 'Complete' : 'Incomplete'
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

module.exports = { IChingConfig };