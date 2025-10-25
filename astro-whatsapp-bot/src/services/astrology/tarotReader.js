const logger = require('../../utils/logger');

/**
 * Comprehensive Tarot Reading System
 * Provides traditional Tarot card readings with multiple spreads and interpretations
 */

class TarotReader {
  constructor() {
    logger.info('Module: TarotReader loaded.');
    // Major Arcana cards
    this.majorArcana = [
      { name: 'The Fool', number: 0, upright: 'New beginnings, innocence, spontaneity', reversed: 'Recklessness, taken advantage of, inconsideration' },
      { name: 'The Magician', number: 1, upright: 'Manifestation, resourcefulness, power', reversed: 'Manipulation, poor planning, untapped talents' },
      { name: 'The High Priestess', number: 2, upright: 'Intuition, spiritual insight, divine feminine', reversed: 'Disconnection from intuition, withdrawal, silence' },
      { name: 'The Empress', number: 3, upright: 'Femininity, beauty, nature, abundance', reversed: 'Dependence on others, smothering, stagnation' },
      { name: 'The Emperor', number: 4, upright: 'Authority, establishment, structure, control', reversed: 'Tyranny, rigidity, coldness, control freak' },
      { name: 'The Hierophant', number: 5, upright: 'Spiritual wisdom, religious beliefs, conformity', reversed: 'Personal beliefs, freedom, challenging the status quo' },
      { name: 'The Lovers', number: 6, upright: 'Love, harmony, relationships, values alignment', reversed: 'Disharmony, imbalance, misalignment of values' },
      { name: 'The Chariot', number: 7, upright: 'Control, willpower, success, determination', reversed: 'Lack of control, lack of direction, aggression' },
      { name: 'Strength', number: 8, upright: 'Strength, courage, persuasion, influence', reversed: 'Weakness, self-doubt, lack of confidence' },
      { name: 'The Hermit', number: 9, upright: 'Soul searching, introspection, inner guidance', reversed: 'Isolation, loneliness, withdrawal' },
      { name: 'Wheel of Fortune', number: 10, upright: 'Good luck, karma, life cycles, destiny', reversed: 'Bad luck, lack of control, clinging to control' },
      { name: 'Justice', number: 11, upright: 'Justice, fairness, truth, cause and effect', reversed: 'Unfairness, lack of accountability, dishonesty' },
      { name: 'The Hanged Man', number: 12, upright: 'Suspension, restriction, letting go, sacrifice', reversed: 'Delays, resistance, stalling, indecision' },
      { name: 'Death', number: 13, upright: 'Endings, beginnings, change, transformation', reversed: 'Resistance to change, personal transformation, inner purging' },
      { name: 'Temperance', number: 14, upright: 'Balance, moderation, patience, purpose', reversed: 'Imbalance, excess, self-healing, re-alignment' },
      { name: 'The Devil', number: 15, upright: 'Bondage, addiction, sexuality, materialism', reversed: 'Releasing limiting beliefs, exploring dark thoughts, detachment' },
      { name: 'The Tower', number: 16, upright: 'Sudden change, upheaval, chaos, revelation', reversed: 'Personal transformation, fear of change, averting disaster' },
      { name: 'The Star', number: 17, upright: 'Hope, faith, purpose, renewal, spirituality', reversed: 'Lack of faith, despair, self-trust, disconnection' },
      { name: 'The Moon', number: 18, upright: 'Illusion, fear, anxiety, subconscious, intuition', reversed: 'Release of fear, repressed emotion, inner confusion' },
      { name: 'The Sun', number: 19, upright: 'Positivity, fun, warmth, success, vitality', reversed: 'Inner child, feeling down, overly optimistic' },
      { name: 'Judgement', number: 20, upright: 'Judgement, rebirth, inner calling, absolution', reversed: 'Self-doubt, inner critic, ignoring the call' },
      { name: 'The World', number: 21, upright: 'Completion, accomplishment, travel, fulfillment', reversed: 'Seeking personal closure, short-cut to success, impatience' }
    ];

    // Minor Arcana - Wands (Fire)
    this.wands = [
      { name: 'Ace of Wands', upright: 'Inspiration, ideas, discovery, limitless potential', reversed: 'Lack of energy, lack of passion, missed opportunities' },
      { name: 'Two of Wands', upright: 'Future planning, progress, decisions, discovery', reversed: 'Personal goals, inner alignment, fear of unknown' },
      { name: 'Three of Wands', upright: 'Progress, expansion, foresight, overseas opportunities', reversed: 'Obstacles, delays, lack of foresight, missed opportunities' },
      { name: 'Four of Wands', upright: 'Celebration, joy, harmony, relaxation, homecoming', reversed: 'Personal celebration, inner harmony, conflict with others' },
      { name: 'Five of Wands', upright: 'Conflict, disagreements, competition, tension', reversed: 'Inner conflict, conflict avoidance, releasing tension' },
      { name: 'Six of Wands', upright: 'Success, public recognition, progress, self-confidence', reversed: 'Private achievement, personal success, pride, lack of recognition' },
      { name: 'Seven of Wands', upright: 'Challenge, competition, perseverance, defense', reversed: 'Exhaustion, giving up, overwhelmed, overly defensive' },
      { name: 'Eight of Wands', upright: 'Speed, action, alignment, air travel', reversed: 'Delays, frustration, resisting change, internal alignment' },
      { name: 'Nine of Wands', upright: 'Resilience, courage, persistence, test of faith', reversed: 'Inner resources, struggle, overwhelm, defensive' },
      { name: 'Ten of Wands', upright: 'Burden, extra responsibility, hard work, completion', reversed: 'Doing it all, carrying the burden, delegation, release' },
      { name: 'Page of Wands', upright: 'Inspiration, ideas, discovery, limitless potential', reversed: 'Lack of direction, no clear plan, bad advice, distraction' },
      { name: 'Knight of Wands', upright: 'Energy, passion, inspired action, adventure', reversed: 'Passion project, haste, scattered energy, delays' },
      { name: 'Queen of Wands', upright: 'Courage, confidence, independence, social butterfly', reversed: 'Self-respect, self-confidence, introverted, re-establish sense of self' },
      { name: 'King of Wands', upright: 'Natural-born leader, vision, entrepreneur, honour', reversed: 'Impulsiveness, haste, ruthless, high expectations' }
    ];

    // Minor Arcana - Cups (Water)
    this.cups = [
      { name: 'Ace of Cups', upright: 'Love, new relationships, compassion, creativity', reversed: 'Self-love, intuition, repressed emotions, spirituality' },
      { name: 'Two of Cups', upright: 'Unified love, partnership, mutual attraction', reversed: 'Self-love, break-ups, disharmony, distrust' },
      { name: 'Three of Cups', upright: 'Celebration, friendship, creativity, community', reversed: 'Independence, alone time, hardcore partying, knowing yourself' },
      { name: 'Four of Cups', upright: 'Meditation, contemplation, apathy, reevaluation', reversed: 'Retreat, withdrawal, checking in with yourself, inner peace' },
      { name: 'Five of Cups', upright: 'Regret, failure, disappointment, pessimism', reversed: 'Personal setbacks, self-forgiveness, moving on, regret' },
      { name: 'Six of Cups', upright: 'Revisiting the past, childhood memories, innocence, joy', reversed: 'Living in the past, forgiveness, lacking playfulness, lacking spontaneity' },
      { name: 'Seven of Cups', upright: 'Opportunities, choices, wishful thinking, illusion', reversed: 'Alignment, personal values, overwhelmed by choices, indecision' },
      { name: 'Eight of Cups', upright: 'Disappointment, abandonment, withdrawal, escapism', reversed: 'Trying one more time, indecision, aimless drifting, walking away' },
      { name: 'Nine of Cups', upright: 'Contentment, satisfaction, gratitude, wish come true', reversed: 'Inner happiness, materialism, dissatisfaction, indulgence' },
      { name: 'Ten of Cups', upright: 'Divine love, blissful relationships, harmony, alignment', reversed: 'Disconnection, misaligned values, struggling relationships, disconnection' },
      { name: 'Page of Cups', upright: 'Creative opportunities, intuitive messages, curiosity, possibility', reversed: 'New ideas, doubting intuition, creative blocks, emotional immaturity' },
      { name: 'Knight of Cups', upright: 'Creativity, romance, bringing or receiving a message, imagination', reversed: 'Moodiness, disappointment, overactive imagination, lack of direction' },
      { name: 'Queen of Cups', upright: 'Compassionate, caring, emotionally stable, intuitive, in flow', reversed: 'Inner feelings, self-care, self-love, melancholy, emotionally needy' },
      { name: 'King of Cups', upright: 'Emotionally balanced, compassionate, diplomatic, friendly, intuitive', reversed: 'Self-compassion, inner feelings, moodiness, emotionally manipulative' }
    ];

    // Minor Arcana - Swords (Air)
    this.swords = [
      { name: 'Ace of Swords', upright: 'Breakthroughs, new ideas, mental clarity, success', reversed: 'Inner clarity, re-thinking an idea, clouded judgement, overconfidence' },
      { name: 'Two of Swords', upright: 'Difficult decisions, weighing up options, an impasse, avoidance', reversed: 'Indecision, confusion, information overload, stalemate' },
      { name: 'Three of Swords', upright: 'Heartbreak, emotional pain, sorrow, grief, hurt', reversed: 'Negative self-talk, releasing pain, optimism, forgiveness' },
      { name: 'Four of Swords', upright: 'Rest, relaxation, meditation, contemplation, recuperation', reversed: 'Exhaustion, burn-out, deep contemplation, stagnation' },
      { name: 'Five of Swords', upright: 'Conflict, disagreements, competition, defeat, winning at all costs', reversed: 'Inner conflict, conflict avoidance, releasing tension, making amends' },
      { name: 'Six of Swords', upright: 'Transition, change, rite of passage, releasing baggage', reversed: 'Personal transition, resistance to change, unfinished business, lack of progress' },
      { name: 'Seven of Swords', upright: 'Betrayal, deception, getting away with something, acting strategically', reversed: 'Imposter syndrome, self-deception, keeping secrets, mental challenges' },
      { name: 'Eight of Swords', upright: 'Negative thoughts, self-imposed restriction, imprisonment, victim mentality', reversed: 'Self-limiting beliefs, inner critic, releasing negative thoughts, open to new perspectives' },
      { name: 'Nine of Swords', upright: 'Anxiety, worry, fear, depression, nightmares', reversed: 'Inner turmoil, deep-seated fears, shame, guilt, releasing worry' },
      { name: 'Ten of Swords', upright: 'Painful endings, deep wounds, betrayal, loss, crisis', reversed: 'Recovery, regeneration, resisting an inevitable end, facing the truth' },
      { name: 'Page of Swords', upright: 'New ideas, curiosity, thirst for knowledge, new ways of communicating', reversed: 'Self-expression, all talk and no action, haphazard action, haste' },
      { name: 'Knight of Swords', upright: 'Ambitious, action-oriented, driven to succeed, fast-thinking', reversed: 'Restless, unfocused, impulsive, burnt out, lack of direction' },
      { name: 'Queen of Swords', upright: 'Independent, unbiased judgement, clear boundaries, direct communication', reversed: 'Overly-emotional, easily influenced, bitchy, cold-hearted, righteous' },
      { name: 'King of Swords', upright: 'Mental clarity, intellectual power, authority, truth, rational', reversed: 'Quiet power, inner truth, misuse of power, manipulation, overactive mind' }
    ];

    // Minor Arcana - Pentacles (Earth)
    this.pentacles = [
      { name: 'Ace of Pentacles', upright: 'A new financial or career opportunity, manifestation, abundance', reversed: 'Lost opportunity, missed chance, bad investment, bad luck' },
      { name: 'Two of Pentacles', upright: 'Multiple priorities, time management, prioritisation, organisation', reversed: 'Over-committed, disorganisation, reprioritisation, overbooked' },
      { name: 'Three of Pentacles', upright: 'Collaboration, learning, implementation, teamwork, planning', reversed: 'Disharmony, misalignment, working alone, ego clashes' },
      { name: 'Four of Pentacles', upright: 'Saving money, security, conservatism, scarcity, control', reversed: 'Over-spending, greed, self-protection, stinginess, possessiveness' },
      { name: 'Five of Pentacles', upright: 'Financial loss, poverty, lack mindset, isolation, worry', reversed: 'Recovery from financial loss, spiritual poverty, lack mindset, isolation' },
      { name: 'Six of Pentacles', upright: 'Giving, receiving, sharing wealth, generosity, charity', reversed: 'Self-care, unpaid debts, one-sided charity, selfishness, lack of motivation' },
      { name: 'Seven of Pentacles', upright: 'Long-term view, sustainable results, perseverance, investment', reversed: 'Lack of long-term vision, limited success or reward, impatience, lack of effort' },
      { name: 'Eight of Pentacles', upright: 'Apprenticeship, repetitive tasks, mastery, skill development', reversed: 'Self-development, perfectionism, misdirected activity, boredom' },
      { name: 'Nine of Pentacles', upright: 'Abundance, luxury, self-sufficiency, financial independence', reversed: 'Self-worth, over-investment in work, hustling, materialistic' },
      { name: 'Ten of Pentacles', upright: 'Wealth, financial security, family, long-term success, contribution', reversed: 'The dark side of wealth, financial failure or loss, lack of stability' },
      { name: 'Page of Pentacles', upright: 'Learning, studying, apprenticeship, new ideas, curiosity', reversed: 'Lack of progress, procrastination, learn from failure, creative blocks' },
      { name: 'Knight of Pentacles', upright: 'Hard work, productivity, routine, conservatism, methodical', reversed: 'Self-discipline, boredom, feeling stuck, perfectionism, misdirected activity' },
      { name: 'Queen of Pentacles', upright: 'Nurturing, practical, providing financially and emotionally, intuitive', reversed: 'Financial independence, self-care, work-home conflict, self-worth' },
      { name: 'King of Pentacles', upright: 'Financial success, business acumen, security, discipline, abundance', reversed: 'Financially inept, obsessed with wealth and status, stubborn, narrow-minded' }
    ];

    // Tarot spreads
    this.spreads = {
      single: { name: 'Single Card', positions: ['Current Situation'], description: 'A simple one-card reading for quick insight' },
      three: {
        name: 'Three Card Spread',
        positions: ['Past', 'Present', 'Future'],
        description: 'Classic three-card spread showing past influences, current situation, and future potential'
      },
      celtic_cross: {
        name: 'Celtic Cross',
        positions: [
          'Present Situation',
          'Challenge/Obstacle',
          'Distant Past',
          'Possible Outcome',
          'Recent Past',
          'Near Future',
          'Approach/Attitude',
          'External Influences',
          'Hopes/Fears',
          'Final Outcome'
        ],
        description: 'Comprehensive 10-card Celtic Cross spread for detailed life analysis'
      },
      relationship: {
        name: 'Relationship Spread',
        positions: ['You', 'Your Partner', 'Relationship Dynamics', 'Challenges', 'Potential'],
        description: 'Five-card spread focused on relationship insights'
      },
      career: {
        name: 'Career Path Spread',
        positions: ['Current Career Situation', 'Career Challenges', 'Skills & Talents', 'Career Opportunities', 'Career Outcome'],
        description: 'Five-card spread for career guidance and planning'
      }
    };
  }

  /**
   * Shuffle and draw cards from a deck
   * @param {number} count - Number of cards to draw
   * @param {boolean} includeReversed - Whether to include reversed cards
   * @returns {Array} Array of drawn cards with position info
   */
  drawCards(count, includeReversed = true) {
    const deck = [...this.majorArcana, ...this.wands, ...this.cups, ...this.swords, ...this.pentacles];

    // Shuffle the deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    const drawnCards = [];
    for (let i = 0; i < count; i++) {
      const card = { ...deck[i] };
      if (includeReversed && Math.random() < 0.5) {
        card.reversed = true;
        card.interpretation = card.reversed;
      } else {
        card.reversed = false;
        card.interpretation = card.upright;
      }
      drawnCards.push(card);
    }

    return drawnCards;
  }

  /**
   * Perform a single card reading
   * @param {string} question - User's question (optional)
   * @returns {Object} Reading result
   */
  singleCardReading(question = '') {
    try {
      const cards = this.drawCards(1);
      const card = cards[0];

      return {
        spread: 'single',
        question: question || 'General guidance',
        cards: [{
          position: 'Current Situation',
          card,
          interpretation: card.interpretation
        }],
        summary: this.generateReadingSummary([card], 'single', question)
      };
    } catch (error) {
      logger.error('Error in single card reading:', error);
      return { error: 'Unable to perform reading at this time' };
    }
  }

  /**
   * Perform a three-card spread reading
   * @param {string} question - User's question (optional)
   * @returns {Object} Reading result
   */
  threeCardReading(question = '') {
    try {
      const cards = this.drawCards(3);
      const spread = this.spreads.three;

      const reading = {
        spread: 'three',
        question: question || 'General guidance',
        cards: cards.map((card, index) => ({
          position: spread.positions[index],
          card,
          interpretation: card.interpretation
        })),
        summary: this.generateReadingSummary(cards, 'three', question)
      };

      return reading;
    } catch (error) {
      logger.error('Error in three card reading:', error);
      return { error: 'Unable to perform reading at this time' };
    }
  }

  /**
   * Perform a Celtic Cross reading
   * @param {string} question - User's question (optional)
   * @returns {Object} Reading result
   */
  celticCrossReading(question = '') {
    try {
      const cards = this.drawCards(10);
      const spread = this.spreads.celtic_cross;

      const reading = {
        spread: 'celtic_cross',
        question: question || 'Life situation analysis',
        cards: cards.map((card, index) => ({
          position: spread.positions[index],
          card,
          interpretation: card.interpretation
        })),
        summary: this.generateReadingSummary(cards, 'celtic_cross', question)
      };

      return reading;
    } catch (error) {
      logger.error('Error in Celtic Cross reading:', error);
      return { error: 'Unable to perform reading at this time' };
    }
  }

  /**
   * Perform a relationship spread reading
   * @param {string} question - User's question (optional)
   * @returns {Object} Reading result
   */
  relationshipReading(question = '') {
    try {
      const cards = this.drawCards(5);
      const spread = this.spreads.relationship;

      const reading = {
        spread: 'relationship',
        question: question || 'Relationship guidance',
        cards: cards.map((card, index) => ({
          position: spread.positions[index],
          card,
          interpretation: card.interpretation
        })),
        summary: this.generateReadingSummary(cards, 'relationship', question)
      };

      return reading;
    } catch (error) {
      logger.error('Error in relationship reading:', error);
      return { error: 'Unable to perform reading at this time' };
    }
  }

  /**
   * Perform a career spread reading
   * @param {string} question - User's question (optional)
   * @returns {Object} Reading result
   */
  careerReading(question = '') {
    try {
      const cards = this.drawCards(5);
      const spread = this.spreads.career;

      const reading = {
        spread: 'career',
        question: question || 'Career guidance',
        cards: cards.map((card, index) => ({
          position: spread.positions[index],
          card,
          interpretation: card.interpretation
        })),
        summary: this.generateReadingSummary(cards, 'career', question)
      };

      return reading;
    } catch (error) {
      logger.error('Error in career reading:', error);
      return { error: 'Unable to perform reading at this time' };
    }
  }

  /**
   * Generate a summary interpretation for the reading
   * @param {Array} cards - Array of drawn cards
   * @param {string} spreadType - Type of spread used
   * @param {string} question - User's question
   * @returns {string} Summary interpretation
   */
  generateReadingSummary(cards, spreadType, question) {
    try {
      let summary = '';

      // Analyze major themes
      const majorArcanaCount = cards.filter(card => card.number !== undefined).length;
      const reversedCount = cards.filter(card => card.reversed).length;

      if (majorArcanaCount > cards.length * 0.6) {
        summary += 'This reading shows significant life changes and spiritual growth. ';
      }

      if (reversedCount > cards.length * 0.5) {
        summary += 'There may be internal conflicts or blocked energies to address. ';
      }

      // Add spread-specific insights
      switch (spreadType) {
      case 'single':
        summary += `The ${cards[0].name} ${cards[0].reversed ? '(reversed)' : ''} provides clear guidance for your current situation.`;
        break;
      case 'three':
        summary += 'Your past experiences are shaping your present, leading toward the future shown in these cards.';
        break;
      case 'celtic_cross':
        summary += 'This comprehensive reading reveals the complex dynamics affecting your life path.';
        break;
      case 'relationship':
        summary += 'The cards show the dynamics between you and your partner, with insights for growth.';
        break;
      case 'career':
        summary += 'Your career path shows potential for growth and new opportunities.';
        break;
      }

      return summary;
    } catch (error) {
      logger.error('Error generating reading summary:', error);
      return 'The cards offer guidance for your journey ahead.';
    }
  }

  /**
   * Format reading for WhatsApp display
   * @param {Object} reading - Reading object
   * @returns {string} Formatted reading text
   */
  formatReadingForWhatsApp(reading) {
    try {
      if (reading.error) {
        return `❌ *Tarot Reading Error*\n\n${reading.error}`;
      }

      let message = `🔮 *${this.spreads[reading.spread].name}*\n`;
      message += `*Question:* ${reading.question}\n\n`;

      reading.cards.forEach((cardInfo, index) => {
        const { card } = cardInfo;
        message += `*${index + 1}. ${cardInfo.position}:*\n`;
        message += `🎴 ${card.name} ${card.reversed ? '(Reversed)' : '(Upright)'}\n`;
        message += `💫 ${cardInfo.interpretation}\n\n`;
      });

      message += `*Summary:*\n${reading.summary}\n\n`;
      message += '⭐ *Remember:* Tarot provides guidance, not certainty. Trust your intuition! ✨';

      return message;
    } catch (error) {
      logger.error('Error formatting reading for WhatsApp:', error);
      return '❌ Error formatting tarot reading.';
    }
  }
}

/**
 * Generate a tarot reading based on user data and spread type
 * @param {Object} user - User data with birth information
 * @param {string} spreadType - Type of spread (single, three-card, celtic-cross)
 * @returns {Object} Formatted tarot reading
 */
function generateTarotReading(user, spreadType = 'single') {
  try {
    let reading;

    switch (spreadType) {
    case 'single':
      reading = module.exports.singleCardReading();
      break;
    case 'three-card':
      reading = module.exports.threeCardReading();
      break;
    case 'celtic-cross':
      reading = module.exports.celticCrossReading();
      break;
    default:
      reading = module.exports.singleCardReading();
    }

    // Add user personalization
    if (user && user.birthDate) {
      reading.personalized = true;
      reading.userSign = user.sunSign || 'Unknown';
    }

    return {
      type: spreadType,
      cards: reading.cards,
      interpretation: reading.summary,
      advice: `Based on your ${reading.spread} spread: ${reading.summary}`,
      personalized: reading.personalized || false
    };
  } catch (error) {
    logger.error('Error generating tarot reading:', error);
    return {
      error: 'Unable to generate tarot reading',
      type: spreadType,
      cards: [],
      interpretation: 'Please try again later',
      advice: 'Tarot readings require focus and clarity'
    };
  }
}

module.exports = new TarotReader();
module.exports.generateTarotReading = generateTarotReading;
