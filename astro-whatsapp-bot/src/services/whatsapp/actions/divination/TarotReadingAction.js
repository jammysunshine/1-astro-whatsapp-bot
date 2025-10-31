const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { TarotReadingService } = require('../../../../core/services');

/**
 * TarotReadingAction - Performs tarot card readings with professional interpretations.
 * Supports various spread types and provides spiritual guidance.
 */
class TarotReadingAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'get_tarot_reading';
  }

  /**
   * Execute the tarot reading action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Performing tarot reading');

      // Check if user has completed profile for personalized reading
      if (!(await this.validateProfileForReading())) {
        await this.sendGenericTarotReading();
        return { success: true, type: 'generic_tarot' };
      }

      // Perform personalized tarot reading
      const reading = await this.performTarotReading();

      if (!reading) {
        await this.handleReadingError();
        return { success: false, reason: 'reading_failed' };
      }

      // Send the tarot reading result
      await this.sendTarotReading(reading);

      this.logExecution('complete', 'Tarot reading completed successfully');
      return {
        success: true,
        cards: reading.cards?.length || 0,
        spread: reading.type
      };
    } catch (error) {
      this.logger.error('Error in TarotReadingAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Validate if user profile allows for personalized reading
   * @returns {Promise<boolean>} True if profile is sufficient
   */
  async validateProfileForReading() {
    // Tarot readings can be generic even without profile,
    // but personalized ones are better with context
    return true; // Allow generic readings always
  }

  /**
   * Perform the actual tarot reading using core service
   * @returns {Promise<Object|null>} Reading result or null on failure
   */
  async performTarotReading() {
    try {
      const tarotService = new TarotReadingService();
      const spreadType = 'single';
      const result = await tarotService.execute({ 
        user: this.user, 
        spreadType 
      });
      
      if (result.success) {
        return result;
      } else {
        this.logger.warn('Tarot service returned error:', result.error);
        return null; // This will trigger generic tarot reading
      }
    } catch (error) {
      this.logger.error('Error generating tarot reading:', error);
      return null;
    }
  }

  /**
   * Perform the actual tarot reading with enhanced implementation
   * @returns {Promise<Object>} Enhanced tarot reading result
   */
  async performEnhancedTarotReading() {
    const tarotDeck = this.getTarotDeck();
    const spreadType = this.getRandomSpread();

    const reading = {
      type: spreadType.name,
      cards: [],
      interpretation: '',
      advice: '',
      spiritualGuidance: ''
    };

    // Draw and position cards based on spread type
    const drawnCards = [];
    const availableCards = [...tarotDeck];
    const { positions } = spreadType;

    positions.forEach(position => {
      const cardIndex = Math.floor(Math.random() * availableCards.length);
      const card = availableCards.splice(cardIndex, 1)[0];

      // Random orientation (upright/reversed)
      card.isReversed = Math.random() < 0.25; // 25% chance of reversed
      card.position = position.name;
      card.positionMeaning = position.meaning;

      drawnCards.push(card);
      reading.cards.push(card);
    });

    // Generate interpretation
    reading.interpretation = this.generateTarotInterpretation(drawnCards, spreadType);
    reading.advice = this.generateTarotAdvice(drawnCards);
    reading.spiritualGuidance = this.generateSpiritualGuidance(drawnCards);

    return reading;
  }

  /**
   * Send enhanced tarot reading
   */
  async sendGenericTarotReading() {
    const reading = await this.performEnhancedTarotReading();
    await this.sendTarotReading(reading);
  }

  /**
   * Get complete tarot deck
   * @returns {Array} Full 78-card tarot deck
   */
  getTarotDeck() {
    const suits = ['Wands', 'Cups', 'Swords', 'Pentacles'];

    const deck = [
      // Major Arcana
      { name: 'The Fool', number: 0, suit: 'Major', keywords: ['new beginnings', 'innocence', 'spontaneity', 'trust'] },
      { name: 'The Magician', number: 1, suit: 'Major', keywords: ['manifestation', 'resourcefulness', 'willpower', 'inspired action'] },
      { name: 'The High Priestess', number: 2, suit: 'Major', keywords: ['intuition', 'mystical wisdom', 'unconscious', 'divine feminine'] },
      { name: 'The Empress', number: 3, suit: 'Major', keywords: ['fertility', 'feminine abundance', 'creativity', 'nurturing'] },
      { name: 'The Emperor', number: 4, suit: 'Major', keywords: ['authority', 'structure', 'control', 'father-figure'] },
      { name: 'The Hierophant', number: 5, suit: 'Major', keywords: ['spiritual guidance', 'ritual', 'tradition', 'conformity'] },
      { name: 'The Lovers', number: 6, suit: 'Major', keywords: ['relationships', 'choices', 'harmony', 'unity'] },
      { name: 'The Chariot', number: 7, suit: 'Major', keywords: ['willpower', 'success', 'determination', 'control'] },
      { name: 'Strength', number: 8, suit: 'Major', keywords: ['courage', 'patience', 'compassion', 'inner strength'] },
      { name: 'The Hermit', number: 9, suit: 'Major', keywords: ['introspection', 'soul searching', 'spiritual guidance', 'solitude'] },
      { name: 'Wheel of Fortune', number: 10, suit: 'Major', keywords: ['change', 'cycles', 'destiny', 'turning point'] },
      { name: 'Justice', number: 11, suit: 'Major', keywords: ['justice', 'cause and effect', 'truth', 'balance'] },
      { name: 'The Hanged Man', number: 12, suit: 'Major', keywords: ['sacrifice', 'release', 'martyrdom', 'suspension'] },
      { name: 'Death', number: 13, suit: 'Major', keywords: ['transformation', 'endings', 'new beginnings', 'transition'] },
      { name: 'Temperance', number: 14, suit: 'Major', keywords: ['balance', 'moderation', 'patience', 'purpose'] },
      { name: 'The Devil', number: 15, suit: 'Major', keywords: ['bondage', 'addiction', 'sexuality', 'materialism'] },
      { name: 'The Tower', number: 16, suit: 'Major', keywords: ['sudden change', 'upheaval', 'chaos', 'revelation'] },
      { name: 'The Star', number: 17, suit: 'Major', keywords: ['hope', 'faith', 'purpose', 'renewal'] },
      { name: 'The Moon', number: 18, suit: 'Major', keywords: ['illusion', 'intuition', 'fear', 'anxiety'] },
      { name: 'The Sun', number: 19, suit: 'Major', keywords: ['positivity', 'fun', 'warmth', 'success'] },
      { name: 'Judgement', number: 20, suit: 'Major', keywords: ['judgment', 'rebirth', 'inner calling', 'absolution'] },
      { name: 'The World', number: 21, suit: 'Major', keywords: ['fulfillment', 'harmony', 'completion', 'integration'] }
    ];

    // Minor Arcana (56 cards)
    suits.forEach(suit => {
      for (let num = 1; num <= 10; num++) {
        deck.push({ name: `${num} of ${suit}`, number: num, suit, keywords: this.getMinorArcanaKeywords(suit, num) });
      }
      ['Page', 'Knight', 'Queen', 'King'].forEach(court => {
        deck.push({ name: `${court} of ${suit}`, number: 11 + ['Page', 'Knight', 'Queen', 'King'].indexOf(court), suit, keywords: this.getCourtCardKeywords(court, suit) });
      });
    });

    return deck;
  }

  /**
   * Get random tarot spread configuration
   * @returns {Object} Spread configuration
   */
  getRandomSpread() {
    const spreads = [
      {
        name: 'Past, Present, Future',
        positions: [
          { name: 'Past', meaning: 'Events that shaped the situation' },
          { name: 'Present', meaning: 'Current energies influencing you' },
          { name: 'Future', meaning: 'Potential outcomes and guidance' }
        ]
      },
      {
        name: 'Situation, Challenge, Action',
        positions: [
          { name: 'Situation', meaning: 'The core of your question' },
          { name: 'Challenge', meaning: 'What you must overcome' },
          { name: 'Action', meaning: 'Steps you can take' }
        ]
      },
      {
        name: 'Spiritual Guidance',
        positions: [
          { name: 'Higher Self', meaning: 'Your inner wisdom and guidance' },
          { name: 'Challenge', meaning: 'What you\'re learning' },
          { name: 'Outcome', meaning: 'Spiritual growth opportunity' }
        ]
      }
    ];

    return spreads[Math.floor(Math.random() * spreads.length)];
  }

  /**
   * Generate comprehensive tarot interpretation
   * @param {Array} cards - Drawn cards
   * @param {Object} spread - Spread configuration
   * @returns {string} Interpretation text
   */
  generateTarotInterpretation(cards, spread) {
    let interpretation = `Drawing the ${spread.name} spread, these cards reveal:\n\n`;

    cards.forEach(card => {
      const orientation = card.isReversed ? '(Reversed)' : '(Upright)';
      interpretation += `*${card.position}:* ${card.name} ${orientation}\n`;
      interpretation += `*${card.positionMeaning}*\n`;

      // Generate personalized meaning based on keywords and orientation
      const meaning = this.generateCardMeaning(card);
      interpretation += `${meaning}\n\n`;
    });

    return interpretation;
  }

  /**
   * Generate specific card meaning
   * @param {Object} card - Card data
   * @returns {string} Meaning text
   */
  generateCardMeaning(card) {
    let meaning = '';

    if (card.suit === 'Major') {
      meaning = card.keywords.slice(0, 3).join(', ');
    } else {
      meaning = card.keywords.slice(0, 3).join(', ');
    }

    if (card.isReversed) {
      meaning += '. When reversed, this suggests blocked energy, internal challenges, or learning opportunities';
    }

    return meaning;
  }

  /**
   * Generate tarot advice
   * @param {Array} cards - Cards in spread
   * @returns {string} Advice text
   */
  generateTarotAdvice(cards) {
    const energies = cards.filter(c => !c.isReversed).length;
    const challenges = cards.filter(c => c.isReversed).length;

    let advice = '';

    if (energies > challenges) {
      advice = 'The cards show favorable energies flowing. Trust your intuition and take inspired action toward your goals.';
    } else if (challenges > energies) {
      advice = 'This is a time for reflection and inner work. Address challenges before moving forward. Patience will be rewarded.';
    } else {
      advice = 'The cards suggest a time of balance and contemplation. Look within for guidance and trust the unfolding process.';
    }

    return advice;
  }

  /**
   * Generate spiritual guidance
   * @param {Array} cards - Cards in spread
   * @returns {string} Spiritual guidance
   */
  generateSpiritualGuidance(cards) {
    const majorArcana = cards.filter(c => c.suit === 'Major').length;
    const spiritualThemes = [
      'Remember that you are a spiritual being having a human experience.',
      'Your soul\'s journey is unfolding perfectly, even during challenging times.',
      'Trust the universe\'s timing - everything happens when it should.',
      'Your challenges today are tomorrow\'s wisdom and compassion.',
      'You are infinitely supported by the divine intelligence of the universe.'
    ];

    return spiritualThemes[majorArcana % spiritualThemes.length];
  }

  /**
   * Get minor arcana keywords
   * @param {string} suit - Card suit
   * @param {number} number - Card number
   * @returns {Array} Keywords
   */
  getMinorArcanaKeywords(suit, number) {
    const keywords = {
      Wands: ['passion', 'energy', 'initiative'],
      Cups: ['emotion', 'relationships', 'intuition'],
      Swords: ['thought', 'communication', 'conflict'],
      Pentacles: ['practicality', 'security', 'manifestation']
    };

    return keywords[suit] || ['card energy'];
  }

  /**
   * Get court card keywords
   * @param {string} court - Court card type
   * @param {string} suit - Suit
   * @returns {Array} Keywords
   */
  getCourtCardKeywords(court, suit) {
    const keywords = {
      Page: 'learning, new beginnings, youth',
      Knight: 'action, movement, enthusiasm',
      Queen: 'nurturing, wisdom, intuition',
      King: 'authority, mastery, leadership'
    };

    return [`${keywords[court].split(',')[0]}`, suit];
  }

  /**
   * Send the tarot reading result to the user
   * @param {Object} reading - Tarot reading data
   */
  async sendTarotReading(reading) {
    try {
      // Format the reading message
      const message = this.formatTarotReadingMessage(reading);

      // Get action buttons for follow-up
      const buttons = this.getTarotActionButtons();

      // Send as interactive message with buttons
      const interactiveMessage = ResponseBuilder.buildInteractiveMessage(
        this.phoneNumber,
        'button',
        message,
        { buttons }
      );

      await this.sendMessage(interactiveMessage, 'interactive');
    } catch (error) {
      this.logger.error('Error sending tarot reading:', error);
      // Fallback to text message
      const simpleMessage = this.formatTarotReadingMessage(reading);
      await this.sendMessage(simpleMessage, 'text');
    }
  }

  /**
   * Format tarot reading data into user-friendly message
   * @param {Object} reading - Tarot reading data
   * @returns {string} Formatted message
   */
  formatTarotReadingMessage(reading) {
    let message = `🔮 *Tarot Reading - ${reading.type || 'Single Card'}*\n\n`;

    if (reading.cards && reading.cards.length > 0) {
      reading.cards.forEach((card, index) => {
        message += `*Card ${index + 1}:* ${card.name}\n`;
        if (card.upright !== undefined) {
          message += `*Upright:* ${card.upright}\n`;
        }
        if (card.position) {
          message += `*Position:* ${card.position}\n`;
        }
        message += '\n';
      });
    }

    if (reading.interpretation) {
      message += `*Interpretation:*\n${reading.interpretation}\n\n`;
    }

    if (reading.advice) {
      message += `*Advice:* ${reading.advice}\n\n`;
    }

    message += 'Remember: Tarot provides guidance, not definitive answers. Trust your intuition in making decisions.';

    return message;
  }

  /**
   * Get action buttons for tarot reading response
   * @returns {Array} Button configuration array
   */
  getTarotActionButtons() {
    return [
      {
        id: 'get_tarot_reading',
        titleKey: 'buttons.another_reading',
        title: '🔄 New Reading'
      },
      {
        id: 'get_iching_reading',
        titleKey: 'buttons.iching',
        title: '🪙 I Ching'
      },
      {
        id: 'show_main_menu',
        titleKey: 'buttons.main_menu',
        title: '🏠 Main Menu'
      }
    ];
  }

  /**
   * Handle reading generation errors
   */
  async handleReadingError() {
    const errorMessage = 'I\'m sorry, I couldn\'t generate a tarot reading right now. The mystical energies might be misaligned. Please try again in a moment.';
    await this.sendMessage(errorMessage, 'text');
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage = 'An unexpected error occurred while consulting the cards. Please try your reading again.';
    await this.sendMessage(errorMessage, 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Generate and send tarot card readings',
      keywords: ['tarot', 'cards', 'reading', 'divination'],
      category: 'divination',
      subscriptionRequired: false,
      cooldown: 180000 // 3 minutes between readings
    };
  }
}

module.exports = TarotReadingAction;
