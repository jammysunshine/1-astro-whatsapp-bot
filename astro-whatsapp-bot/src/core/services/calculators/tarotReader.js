/**
 * Tarot Reader Class
 * Handles tarot card readings and interpretations
 */

class TarotReader {
  constructor() {
    this.cards = this._initializeTarotCards();
  }

  /**
   * Initialize the complete tarot deck
   * @returns {Array} Major and Minor Arcana cards
   */
  _initializeTarotCards() {
    const majorArcana = [
      'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
      'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
      'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
      'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement',
      'The World'
    ];

    const suits = ['Wands', 'Cups', 'Swords', 'Pentacles'];
    const minorArcana = [];

    for (const suit of suits) {
      for (let i = 1; i <= 10; i++) {
        minorArcana.push(`${i} of ${suit}`);
      }
      minorArcana.push(`Page of ${suit}`);
      minorArcana.push(`Knight of ${suit}`);
      minorArcana.push(`Queen of ${suit}`);
      minorArcana.push(`King of ${suit}`);
    }

    return [...majorArcana, ...minorArcana];
  }

  /**
   * Perform tarot reading
   * @param {string} question - Question or focus for reading
   * @param {string} spread - Type of spread
   * @returns {Promise<Object>} Tarot reading result
   */
  async readTarot(question, spread = 'general') {
    try {
      const cards = this._drawCards(spread);
      const interpretation = this._interpretTarot(cards, question, spread);

      return {
        cards,
        interpretation,
        spread,
        question,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Tarot reading failed: ${error.message}`);
    }
  }

  /**
   * Draw cards based on spread type
   * @param {string} spread - Spread type
   * @returns {Array} Drawn cards
   */
  _drawCards(spread) {
    const cardCount = this._getSpreadCardCount(spread);
    const drawnCards = [];

    for (let i = 0; i < cardCount; i++) {
      const cardIndex = Math.floor(Math.random() * this.cards.length);
      const card = {
        name: this.cards[cardIndex],
        position: this._getCardPosition(spread, i),
        orientation: Math.random() > 0.5 ? 'upright' : 'reversed'
      };
      drawnCards.push(card);
    }

    return drawnCards;
  }

  /**
   * Get number of cards for spread
   * @param {string} spread - Spread type
   * @returns {number} Card count
   */
  _getSpreadCardCount(spread) {
    const spreadCounts = {
      'single': 1,
      'three': 3,
      'celtic-cross': 10,
      'general': 3
    };
    return spreadCounts[spread] || 3;
  }

  /**
   * Get card position meaning
   * @param {string} spread - Spread type
   * @param {number} index - Card index
   * @returns {string} Position meaning
   */
  _getCardPosition(spread, index) {
    const positions = {
      'general': ['Past', 'Present', 'Future'],
      'three': ['Past', 'Present', 'Future'],
      'single': ['Answer'],
      'celtic-cross': [
        'Present Situation',
        'Challenge',
        'Distant Past',
        'Possible Outcome',
        'Recent Past',
        'Future',
        'Approach/Attitude',
        'Environment',
        'Hopes/Fears',
        'Final Outcome'
      ]
    };

    return positions[spread]?.[index] || `Position ${index + 1}`;
  }

  /**
   * Interpret the tarot cards
   * @param {Array} cards - Drawn cards
   * @param {string} question - Question/focus
   * @param {string} spread - Card spread
   * @returns {Object} Interpretation
   */
  _interpretTarot(cards, question, spread) {
    const interpretation = {
      summary: '',
      advice: '',
      outlook: '',
      warnings: '',
      recommendations: []
    };

    // Generate basic interpretation based on spread type
    switch (spread) {
      case 'single':
        interpretation.summary = `Card reveals: ${cards[0].name} (${cards[0].orientation})`;
        interpretation.advice = 'Trust your intuition regarding this matter';
        break;

      case 'three':
        interpretation.summary = `Timeline: ${cards[0].name} (${cards[0].orientation}) → ${cards[1].name} (${cards[1].orientation}) → ${cards[2].name} (${cards[2].orientation})`;
        interpretation.outlook = 'Focus on transitioning from past patterns to future potential';
        break;

      default:
        const cardSummary = cards.map(card => `${card.name} (${card.orientation})`).join(', ');
        interpretation.summary = `Reading reveals: ${cardSummary}`;
        interpretation.advice = 'Take time to reflect on the guidance offered by these cards';
    }

    interpretation.recommendations = [
      'Meditate on the imagery and symbolism of your cards',
      'Keep a tarot journal to track your intuitions',
      'Trust your inner wisdom in decision making',
      'Return for clarification readings if needed'
    ];

    return interpretation;
  }
}

module.exports = TarotReader;