const logger = require('../../utils/logger');

logger.info('Module: vedicNumerology loaded.');

/**
 * Vedic Numerology (Chani System) - Traditional Indian numerology
 * Based on Sanskrit alphabet and Vedic principles
 */

class VedicNumerology {
  constructor() {
    // Sanskrit letter to number mapping (traditional Vedic system)
    this.sanskritMap = {
      // Vowels (स्वर)
      'अ': 1, 'आ': 1, 'इ': 1, 'ई': 1, 'उ': 1, 'ऊ': 1,
      'ऋ': 1, 'ॠ': 1, 'ऌ': 1, 'ॡ': 1, 'ए': 1, 'ऐ': 1, 'ओ': 1, 'औ': 1,
      'अं': 1, 'अः': 1,

      // Consonants (व्यंजन)
      'क': 2, 'ख': 2, 'ग': 2, 'घ': 2, 'ङ': 2,
      'च': 3, 'छ': 3, 'ज': 3, 'झ': 3, 'ञ': 3,
      'ट': 4, 'ठ': 4, 'ड': 4, 'ढ': 4, 'ण': 4,
      'त': 5, 'थ': 5, 'द': 5, 'ध': 5, 'न': 5,
      'प': 6, 'फ': 6, 'ब': 6, 'भ': 6, 'म': 6,
      'य': 7, 'र': 7, 'ल': 7, 'व': 7,
      'श': 8, 'ष': 8, 'स': 8, 'ह': 8,
      'क्ष': 9, 'ज्ञ': 9, 'त्र': 9, 'श्र': 9
    };

    // English letter approximation for names in English
    this.englishMap = {
      'A': 1, 'I': 1, 'J': 1, 'Q': 1, 'Y': 1,
      'B': 2, 'K': 2, 'R': 2,
      'C': 3, 'G': 3, 'L': 3, 'S': 3,
      'D': 4, 'M': 4, 'T': 4,
      'E': 5, 'H': 5, 'N': 5, 'X': 5,
      'U': 6, 'V': 6, 'W': 6,
      'O': 7, 'Z': 7,
      'F': 8, 'P': 8
    };

    // Vedic number interpretations
    this.vedicInterpretations = {
      1: {
        name: "Sun (Surya)",
        qualities: "Leadership, independence, creativity, self-reliance",
        strengths: "Pioneering spirit, courage, originality",
        challenges: "Ego, impatience, dominance",
        career: "Entrepreneur, leader, artist, innovator",
        health: "Heart, spine, eyes, digestive system",
        gemstone: "Ruby",
        mantra: "Om Suryaya Namaha"
      },
      2: {
        name: "Moon (Chandra)",
        qualities: "Sensitivity, intuition, cooperation, adaptability",
        strengths: "Emotional intelligence, diplomacy, nurturing",
        challenges: "Mood swings, dependency, indecisiveness",
        career: "Counselor, teacher, healer, mediator",
        health: "Stomach, breasts, lymphatic system",
        gemstone: "Pearl",
        mantra: "Om Chandraya Namaha"
      },
      3: {
        name: "Jupiter (Guru)",
        qualities: "Wisdom, optimism, communication, expansion",
        strengths: "Teaching, philosophy, generosity, faith",
        challenges: "Over-confidence, extravagance, restlessness",
        career: "Teacher, writer, philosopher, advisor",
        health: "Liver, thighs, nervous system",
        gemstone: "Yellow Sapphire",
        mantra: "Om Gurave Namaha"
      },
      4: {
        name: "Rahu (North Node)",
        qualities: "Innovation, unconventional, material success",
        strengths: "Technical skills, foreign connections, research",
        challenges: "Instability, deception, obsession",
        career: "Scientist, engineer, inventor, businessman",
        health: "Skin, lungs, mysterious illnesses",
        gemstone: "Hessonite",
        mantra: "Om Rahave Namaha"
      },
      5: {
        name: "Mercury (Budha)",
        qualities: "Intelligence, communication, adaptability, business",
        strengths: "Learning, analysis, commerce, versatility",
        challenges: "Nervousness, criticism, inconsistency",
        career: "Writer, trader, analyst, communicator",
        health: "Nervous system, skin, respiratory system",
        gemstone: "Emerald",
        mantra: "Om Budhaya Namaha"
      },
      6: {
        name: "Venus (Shukra)",
        qualities: "Harmony, beauty, relationships, luxury",
        strengths: "Artistic, diplomatic, sensual, prosperous",
        challenges: "Indulgence, vanity, possessiveness",
        career: "Artist, designer, diplomat, luxury business",
        health: "Kidneys, reproductive system, throat",
        gemstone: "Diamond",
        mantra: "Om Shukraya Namaha"
      },
      7: {
        name: "Ketu (South Node)",
        qualities: "Spirituality, detachment, mysticism, liberation",
        strengths: "Intuition, meditation, healing, wisdom",
        challenges: "Isolation, confusion, detachment from worldly matters",
        career: "Spiritual teacher, healer, researcher, monk",
        health: "Mysterious ailments, spiritual health",
        gemstone: "Cat's Eye",
        mantra: "Om Ketave Namaha"
      },
      8: {
        name: "Saturn (Shani)",
        qualities: "Discipline, responsibility, karma, longevity",
        strengths: "Patience, organization, justice, perseverance",
        challenges: "Depression, delays, rigidity, pessimism",
        career: "Administrator, judge, scientist, labor work",
        health: "Bones, teeth, joints, chronic conditions",
        gemstone: "Blue Sapphire",
        mantra: "Om Shanaye Namaha"
      },
      9: {
        name: "Mars (Mangal)",
        qualities: "Energy, courage, leadership, transformation",
        strengths: "Courage, initiative, protection, surgery",
        challenges: "Aggression, impatience, accidents, conflicts",
        career: "Soldier, surgeon, athlete, engineer",
        health: "Blood, muscles, head, fever",
        gemstone: "Red Coral",
        mantra: "Om Mangalaya Namaha"
      }
    };

    // Compound number interpretations
    this.compoundNumbers = {
      10: "Spiritual leadership and divine guidance",
      11: "Master intuition and spiritual illumination",
      12: "Divine wisdom and cosmic consciousness",
      13: "Transformation and rebirth",
      14: "Material and spiritual balance",
      15: "Spiritual discipline and devotion",
      16: "Harmony and divine love",
      17: "Spiritual liberation and enlightenment",
      18: "Material abundance and spiritual wisdom",
      19: "Humanitarian service and compassion",
      20: "Universal love and service",
      21: "Cosmic consciousness and mastery",
      22: "Master builder and manifestation",
      23: "Divine communication and inspiration",
      24: "Cosmic order and divine law",
      25: "Universal knowledge and wisdom",
      26: "Divine protection and guidance",
      27: "Complete spiritual realization"
    };
  }

  /**
   * Calculate Vedic name number
   */
  calculateVedicNameNumber(name) {
    try {
      const cleanedName = name.toUpperCase().replace(/[^A-Z\s]/g, '');
      let total = 0;

      for (const char of cleanedName) {
        if (char !== ' ') {
          total += this.englishMap[char] || 0;
        }
      }

      // Reduce to single digit or master number
      return this.reduceToVedicNumber(total);
    } catch (error) {
      logger.error(`Error calculating Vedic name number for ${name}:`, error);
      return null;
    }
  }

  /**
   * Calculate birth number from date
   */
  calculateBirthNumber(birthDate) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);
      const daySum = this.reduceToVedicNumber(day);
      const monthSum = this.reduceToVedicNumber(month);
      const yearSum = this.reduceToVedicNumber(year);

      return this.reduceToVedicNumber(daySum + monthSum + yearSum);
    } catch (error) {
      logger.error(`Error calculating birth number for ${birthDate}:`, error);
      return null;
    }
  }

  /**
   * Reduce number to Vedic single digit (1-9)
   */
  reduceToVedicNumber(num) {
    let sum = num;
    while (sum > 9) {
      sum = String(sum)
        .split('')
        .reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    return sum;
  }

  /**
   * Get compound number interpretation
   */
  getCompoundInterpretation(number) {
    return this.compoundNumbers[number] || `Compound number ${number} indicates complex karmic influences`;
  }

  /**
   * Calculate destiny number (name + birth)
   */
  calculateDestinyNumber(birthDate, name) {
    const birthNumber = this.calculateBirthNumber(birthDate);
    const nameNumber = this.calculateVedicNameNumber(name);

    if (!birthNumber || !nameNumber) return null;

    return this.reduceToVedicNumber(birthNumber + nameNumber);
  }

  /**
   * Get complete Vedic numerology analysis
   */
  getVedicNumerologyAnalysis(birthDate, name) {
    try {
      const birthNumber = this.calculateBirthNumber(birthDate);
      const nameNumber = this.calculateVedicNameNumber(name);
      const destinyNumber = this.calculateDestinyNumber(birthDate, name);

      if (!birthNumber || !nameNumber) {
        return {
          error: 'Unable to calculate numerology numbers. Please check birth date and name format.'
        };
      }

      const birthInterpretation = this.vedicInterpretations[birthNumber];
      const nameInterpretation = this.vedicInterpretations[nameNumber];
      const destinyInterpretation = this.vedicInterpretations[destinyNumber];

      // Check for compound numbers
      const isBirthCompound = birthNumber > 9;
      const isNameCompound = nameNumber > 9;
      const isDestinyCompound = destinyNumber > 9;

      let summary = `🕉️ *Vedic Numerology Analysis for ${name}*\n\n`;
      summary += `*Birth Date:* ${birthDate}\n\n`;

      summary += `*🔢 Birth Number (Janma Sankhya):* ${birthNumber}\n`;
      summary += `*Ruling Planet:* ${birthInterpretation.name}\n`;
      summary += `*Qualities:* ${birthInterpretation.qualities}\n`;
      summary += `*Strengths:* ${birthInterpretation.strengths}\n`;
      summary += `*Challenges:* ${birthInterpretation.challenges}\n\n`;

      summary += `*🔢 Name Number (Naam Sankhya):* ${nameNumber}\n`;
      summary += `*Ruling Planet:* ${nameInterpretation.name}\n`;
      summary += `*Expression:* ${nameInterpretation.qualities}\n\n`;

      summary += `*🔢 Destiny Number (Karma Sankhya):* ${destinyNumber}\n`;
      summary += `*Life Purpose:* ${destinyInterpretation.qualities}\n\n`;

      // Add compound number interpretations if applicable
      if (isBirthCompound) {
        summary += `*🌟 Birth Compound:* ${this.getCompoundInterpretation(birthNumber)}\n\n`;
      }
      if (isNameCompound) {
        summary += `*🌟 Name Compound:* ${this.getCompoundInterpretation(nameNumber)}\n\n`;
      }
      if (isDestinyCompound) {
        summary += `*🌟 Destiny Compound:* ${this.getCompoundInterpretation(destinyNumber)}\n\n`;
      }

      summary += `*💼 Career Path:* ${birthInterpretation.career}\n\n`;
      summary += `*🏥 Health Focus:* ${birthInterpretation.health}\n`;
      summary += `*💎 Recommended Gemstone:* ${birthInterpretation.gemstone}\n`;
      summary += `*🕉️ Mantra:* ${birthInterpretation.mantra}\n\n`;

      summary += `*📊 Vedic Number Compatibility:*\n`;
      const compatibleNumbers = this.getCompatibleNumbers(birthNumber);
      summary += `• Compatible with: ${compatibleNumbers.join(', ')}\n`;
      const challengingNumbers = this.getChallengingNumbers(birthNumber);
      summary += `• Challenging with: ${challengingNumbers.join(', ')}\n\n`;

      summary += `*🔮 Vedic Numerology Summary:*\n`;
      summary += `Your Vedic numbers reveal a unique cosmic blueprint. The birth number (${birthNumber}) shows your inherent nature, `;
      summary += `the name number (${nameNumber}) indicates how you express yourself, and the destiny number (${destinyNumber}) `;
      summary += `reveals your life's purpose. These numbers work together to guide your spiritual journey and material success.\n\n`;
      summary += `Remember: Vedic numerology is a tool for self-understanding. Your free will and karma ultimately shape your destiny! 🕉️`;

      return {
        birthNumber,
        nameNumber,
        destinyNumber,
        birthInterpretation,
        nameInterpretation,
        destinyInterpretation,
        summary
      };

    } catch (error) {
      logger.error('Error generating Vedic numerology analysis:', error);
      return {
        error: 'Unable to generate Vedic numerology analysis. Please try again later.'
      };
    }
  }

  /**
   * Get compatible numbers
   */
  getCompatibleNumbers(number) {
    const compatibilityMap = {
      1: [3, 5, 6, 9],
      2: [3, 6, 7, 9],
      3: [1, 2, 5, 6, 9],
      4: [2, 5, 7, 8],
      5: [1, 3, 4, 6, 8],
      6: [1, 2, 3, 5, 9],
      7: [2, 4, 8, 9],
      8: [4, 5, 7, 9],
      9: [1, 2, 3, 6, 7, 8]
    };

    return compatibilityMap[number] || [number];
  }

  /**
   * Get challenging numbers
   */
  getChallengingNumbers(number) {
    const challengeMap = {
      1: [2, 4, 7, 8],
      2: [1, 4, 5, 8],
      3: [4, 7, 8],
      4: [1, 3, 6, 9],
      5: [2, 7, 9],
      6: [4, 7, 8],
      7: [1, 3, 5, 6],
      8: [2, 3, 6],
      9: [4, 5, 7]
    };

    return challengeMap[number] || [];
  }

  /**
   * Get Vedic numerology catalog for menu
   */
  getVedicNumerologyCatalog() {
    return {
      description: "🕉️ Vedic Numerology (Chani System) - Traditional Indian numerology based on Sanskrit alphabet and Vedic principles",
      features: [
        "Birth Number (Janma Sankhya) - Your inherent nature",
        "Name Number (Naam Sankhya) - Your expression",
        "Destiny Number (Karma Sankhya) - Your life purpose",
        "Compound Numbers - Complex karmic influences",
        "Planetary rulerships and gemstone recommendations",
        "Vedic mantras and spiritual guidance"
      ],
      benefits: [
        "Understand your cosmic blueprint",
        "Discover life purpose and destiny",
        "Find compatible relationships",
        "Choose auspicious names and dates",
        "Get spiritual guidance and mantras"
      ]
    };
  }
}

module.exports = { VedicNumerology };</content>
</xai:function_call">Now I need to integrate this into the astrology engine. Let me add the import and handler. 

First, let me add the import to astrologyEngine.js. I'll add it after the existing imports. 

Then I'll add a handler for Vedic numerology requests. 

Let me check the current imports section. 

I need to add the import after the HinduFestivals import. 

Then add a handler in the generateAstrologyResponse function. 

Let me also add it to the menu config. 

First, let's add the import. 

I'll add it after the HinduFestivals import. 

Then initialize it like the others. 

Then add the handler. 

For the menu, I need to add a button in the comprehensive menu. 

Let me check if there's already a numerology button. 

I see there's "btn_numerology" which is for the existing numerology. 

I should rename or add a new one for Vedic numerology. 

Let me add "btn_vedic_numerology" to distinguish it. 

First, let's add the import and initialization. 

I'll edit the astrologyEngine.js file. 

I need to add the import after line 18. 

Then add the initialization after line 43. 

Then add the handler in the function. 

Let me do this step by step. 

First, add the import. 

I'll use the edit tool to add the import. 

The import should be after the HinduFestivals import. 

So after line 18. 

I'll add: 

const { VedicNumerology } = require('./vedicNumerology');

Then add the initialization after line 43. 

// Initialize Vedic Numerology system

const vedicNumerology = new VedicNumerology();

Then I need to add the handler. 

I need to find where to add the handler in the generateAstrologyResponse function. 

Looking at the code, there are handlers for various systems. 

I should add it after the Hindu festivals handler, around line 1329. 

The handler should check for "vedic numerology" or "chani" or similar patterns. 

Let me add the handler. 

I'll add it after the Hindu festivals handler. 

The pattern should be ['vedic numerology', 'chani', 'indian numerology', /^vedic.?numerology/, /^chani/]

Then the logic similar to other handlers. 

If no birth date, ask for it. 

Then call vedicNumerology.getVedicNumerologyAnalysis

Then return the summary. 

Now for the menu. 

I need to add a button in menuConfig.json. 

In the comprehensive menu, add a new row for Vedic numerology. 

Let me add it after the numerology row. 

The current numerology is at line 219-222. 

I'll add after that. 

{

  "id": "btn_vedic_numerology",

  "title": "Vedic Numerology",

  "description": "Chani system - traditional Indian numerology"

},

Then in messageProcessor.js, add the mapping. 

In the listActionMapping, add 'btn_vedic_numerology': 'get_vedic_numerology_analysis',

Then in the switch statement, add the case. 

Similar to other cases. 

If no birth date, return message asking for it. 

Else return the info message. 

But actually, for the button action, it should trigger the analysis if birth date is available, or ask for it. 

Looking at other handlers, they provide info if no birth date, or analysis if available. 

For numerology, it needs name too. 

So similar to numerology handler. 

Let me check the numerology handler in astrologyEngine.js. 

It's around line 574. 

It checks for birthDate, and if not, asks for birth date and name. 

Then calls vedicCalculator.calculateNumerology

But for Vedic numerology, I need to modify it to use the new service. 

Actually, the existing numerology handler is for the Western system. 

I need to add a separate handler for Vedic numerology. 

So I'll add a new intent pattern for Vedic numerology. 

Let me add the handler after the existing numerology handler. 

The existing is at line 574-621. 

I'll add after that. 

The pattern ['vedic numerology', 'chani numerology', 'indian numerology', 'sanskrit numerology', /^vedic.?numerology/, /^chani/, /^indian.?numerology/]

Then the logic: if no birthDate, ask for birth date and full name. 

Then call vedicNumerology.getVedicNumerologyAnalysis

Then return the summary. 

For the menu button, I'll add the mapping and case. 

Let me start implementing. 

First, add the import to astrologyEngine.js. 

I'll edit the file to add the import after line 18. 

Old string: const { HinduFestivals } = require('./hinduFestivals');

New string: const { HinduFestivals } = require('./hinduFestivals');

const { VedicNumerology } = require('./vedicNumerology');

Then add the initialization after line 43. 

Old string: // Initialize Hindu Festivals system

const hinduFestivals = new HinduFestivals();

New string: // Initialize Hindu Festivals system

const hinduFestivals = new HinduFestivals();

// Initialize Vedic Numerology system

const vedicNumerology = new VedicNumerology();

Now add the handler. 

I need to find the right place. 

After the numerology handler, which ends at line 621. 

So after line 621, before the career astrology handler. 

The career astrology starts at line 623. 

So I'll add the Vedic numerology handler between them. 

The handler code will be similar to the numerology one, but using vedicNumerology. 

Let me add it. 

Old string:   }

   // Career astrology requests

New string:   }

   // Vedic numerology requests

   if (matchesIntent(message, ['vedic numerology', 'chani numerology', 'indian numerology', 'sanskrit numerology', /^vedic.?numerology/, /^chani/, /^indian.?numerology/])) {

     if (!user.birthDate) {

       return 'For Vedic Numerology analysis, I need your complete birth details and full name to calculate your Chani numbers.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Full name (as it appears on birth certificate)\n\nExample: 15/06/1990, Rajesh Kumar Sharma';

     }

     try {

       const vedicAnalysis = vedicNumerology.getVedicNumerologyAnalysis({

         birthDate: user.birthDate,

         name: user.name || 'Unknown'

       });

       if (vedicAnalysis.error) {

         return `I encountered an issue: ${vedicAnalysis.error}`;

       }

       return vedicAnalysis.summary;

     } catch (error) {

       logger.error('Error generating Vedic numerology analysis:', error);

       return 'I\'m having trouble calculating your Vedic numerology right now. Please try again later.';

     }

   }

   // Career astrology requests

Now for the menu. 

Add to menuConfig.json in the comprehensive menu. 

After the numerology row. 

Old string:             {

               "id": "btn_numerology",

               "title": "Numerology",

               "description": "Numbers and life path analysis"

             },

New string:             {

               "id": "btn_numerology",

               "title": "Numerology",

               "description": "Numbers and life path analysis"

             },

             {

               "id": "btn_vedic_numerology",

               "title": "Vedic Numerology",

               "description": "Chani system - traditional Indian numerology"

             },

Now for messageProcessor.js. 

Add to listActionMapping. 

After btn_numerology: 'get_numerology_report',

Add btn_vedic_numerology: 'get_vedic_numerology_analysis',

Then in the switch statement, add the case. 

After the numerology case. 

The numerology case is around line 400 or so. 

Let me find it. 

Actually, let me search for the numerology case. 

I can see in the file I read earlier, the cases are listed. 

I need to add the case for 'get_vedic_numerology_analysis'

Similar to the numerology case. 

If no birth date, return message. 

Else return info. 

But since it's a button, it should try to do the analysis if possible. 

Looking at other cases, some provide info, some do analysis. 

For numerology, it seems to do analysis if birth date available. 

Let me check the numerology case in messageProcessor.js. 

From the file I read, the cases are in the processIncomingMessage function. 

The switch is around line 400+. 

I need to add the case. 

Let me add it after the numerology case. 

The numerology case is:

case 'get_numerology_report':

  if (!user.birthDate) {

    response = 'I need your birth date and name for numerology analysis.';

    break;

  }

  // Generate numerology report

  try {

    const numerologyReport = await numerologyService.generateFullReport(user.name, user.birthDate);

    response = `🔢 *Numerology Analysis*\n\n*Life Path:* ${numerologyReport.lifePath} - ${numerologyReport.lifePathDescription}\n\n*Expression:* ${numerologyReport.expression} - ${numerologyReport.expressionDescription}\n\n*Soul Urge:* ${numerologyReport.soulUrge} - ${numerologyReport.soulUrgeDescription}\n\n*Personality:* ${numerologyReport.personality} - ${numerologyReport.personalityDescription}\n\n*Destiny:* ${numerologyReport.destiny}\n*Maturity:* ${numerologyReport.maturity}\n\n*Strengths:* ${numerologyReport.strengths.join(', ')}\n\n*Challenges:* ${numerologyReport.challenges.join(', ')}\n\n*Career Paths:* ${numerologyReport.careerPaths.join(', ')}\n\n*Compatible Numbers:* ${numerologyReport.compatibleNumbers.join(', ')}`;

  } catch (error) {

    logger.error('Error generating numerology report:', error);

    response = '❌ Sorry, I couldn\'t generate your numerology report right now. Please try again later.';

  }

  break;

So for Vedic numerology, I'll add a similar case. 

case 'get_vedic_numerology_analysis':

  if (!user.birthDate) {

    response = 'I need your birth date and name for Vedic numerology analysis.';

    break;

  }

  try {

    const vedicAnalysis = vedicNumerology.getVedicNumerologyAnalysis(user.birthDate, user.name);

    if (vedicAnalysis.error) {

      response = `❌ ${vedicAnalysis.error}`;

    } else {

      response = vedicAnalysis.summary;

    }

  } catch (error) {

    logger.error('Error generating Vedic numerology analysis:', error);

    response = '❌ Sorry, I couldn\'t generate your Vedic numerology analysis right now. Please try again later.';

  }

  break;

I need to import vedicNumerology in messageProcessor.js. 

At the top, after the other imports. 

const { VedicNumerology } = require('../services/astrology/vedicNumerology');

const vedicNumerology = new VedicNumerology();

Yes. 

Now let me implement these changes. 

First, edit astrologyEngine.js to add the import. 

Then the initialization. 

Then the handler. 

Then edit menuConfig.json to add the button. 

Then edit messageProcessor.js to add the import, mapping, and case. 

Let me start with astrologyEngine.js. 

First, add the import. 

The file has the imports at the top. 

After line 18: const { HinduFestivals } = require('./hinduFestivals');

I'll add the Vedic numerology import. 

Use edit tool. 

File: astro-whatsapp-bot/src/services/astrology/astrologyEngine.js

Old string: const { HinduFestivals } = require('./hinduFestivals');

New string: const { HinduFestivals } = require('./hinduFestivals');

const { VedicNumerology } = require('./vedicNumerology');

Then add the initialization. 

After line 43: // Initialize Hindu Festivals system

const hinduFestivals = new HinduFestivals();

Add:

// Initialize Vedic Numerology system

const vedicNumerology = new VedicNumerology();

Now add the handler. 

I need to find the exact location. 

After the numerology handler. 

The numerology handler ends with:

return response;

      } catch (error) {

        logger.error('Error generating numerology analysis:', error);

        return 'I\'m having trouble calculating your numerology right now. Please try again later.';

      }

    }

  }

  // Career astrology requests

So after the } of the numerology if block, before // Career astrology requests

The structure is:

  // Numerology requests

  if (matchesIntent(message, ['numerology', 'numbers', 'life path number', 'expression number', 'soul urge', /^numerology/, /^numbers/])) {

    if (!user.birthDate) {

      return 'For numerology analysis, I need your birth details and full name to calculate your core numbers.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Full name (as it appears on birth certificate)\n\nExample: 15/06/1990, John Michael Smith';

    }

    try {

      const numerologyAnalysis = vedicCalculator.calculateNumerology({

        birthDate: user.birthDate,

        name: user.name || 'Unknown'

      });

      if (numerologyAnalysis.error) {

        return `I encountered an issue: ${numerologyAnalysis.error}`;

      }

      let response = '🔢 *Numerology Analysis*\n\n';

      response += '*Your Core Numbers:*\n\n';

      response += `*Life Path:* ${numerologyAnalysis.coreNumbers.lifePath} - ${numerologyAnalysis.interpretations.lifePath.split(':')[0] || 'Your life journey'}\n`;

      response += `*Expression:* ${numerologyAnalysis.coreNumbers.expression} - ${numerologyAnalysis.interpretations.expression.split(':')[0] || 'Your natural talents'}\n`;

      response += `*Soul Urge:* ${numerologyAnalysis.coreNumbers.soulUrge} - ${numerologyAnalysis.interpretations.soulUrge.split(':')[0] || 'Your inner desires'}\n`;

      response += `*Personality:* ${numerologyAnalysis.coreNumbers.personality} - ${numerologyAnalysis.interpretations.personality.split(':')[0] || 'Your outward self'}\n`;

      response += `*Birthday:* ${numerologyAnalysis.coreNumbers.birthday} - ${numerologyAnalysis.interpretations.birthday.split(':')[0] || 'Your birthday energy'}\n\n`;

      if (numerologyAnalysis.strengths.length > 0) {

        response += '*Key Strengths:*\n';

        numerologyAnalysis.strengths.forEach(strength => {

          response += `• ${strength}\n`;

        });

        response += '\n';

      }

      if (numerologyAnalysis.lifePurpose) {

        response += `*Life Purpose:* ${numerologyAnalysis.lifePurpose}\n\n`;

      }

      response += '*Numerology Summary:*\n';

      response += `${numerologyAnalysis.summary}\n\n`;

      response += 'Your numbers hold the key to understanding your soul\'s blueprint! 🔑';

      return response;

    } catch (error) {

      logger.error('Error generating numerology analysis:', error);

      return 'I\'m having trouble calculating your numerology right now. Please try again later.';

    }

  }

  // Career astrology requests

So I'll add the Vedic numerology handler after this block, before // Career astrology requests

Old string:   }

  // Career astrology requests

New string:   }

  // Vedic numerology requests

  if (matchesIntent(message, ['vedic numerology', 'chani numerology', 'indian numerology', 'sanskrit numerology', /^vedic.?numerology/, /^chani/, /^indian.?numerology/])) {

    if (!user.birthDate) {

      return 'For Vedic Numerology analysis, I need your complete birth details and full name to calculate your Chani numbers.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Full name (as it appears on birth certificate)\n\nExample: 15/06/1990, Rajesh Kumar Sharma';

    }

    try {

      const vedicAnalysis = vedicNumerology.getVedicNumerologyAnalysis(user.birthDate, user.name || 'Unknown');

      if (vedicAnalysis.error) {

        return `I encountered an issue: ${vedicAnalysis.error}`;

      }

      return vedicAnalysis.summary;

    } catch (error) {

      logger.error('Error generating Vedic numerology analysis:', error);

      return 'I\'m having trouble calculating your Vedic numerology right now. Please try again later.';

    }

  }

  // Career astrology requests

Now for menuConfig.json. 

Add the button in the comprehensive menu. 

Find the numerology row. 

In the Advanced Services section. 

After the numerology row. 

Old string:             {

               "id": "btn_numerology",

               "title": "Numerology",

               "description": "Numbers and life path analysis"

             },

New string:             {

               "id": "btn_numerology",

               "title": "Numerology",

               "description": "Numbers and life path analysis"

             },

             {

               "id": "btn_vedic_numerology",

               "title": "Vedic Numerology",

               "description": "Chani system - traditional Indian numerology"

             },

Now for messageProcessor.js. 

First, add the import. 

At the top, after the other astrology imports. 

After const numerologyService = require('../services/astrology/numerologyService');

Add const { VedicNumerology } = require('../services/astrology/vedicNumerology');

const vedicNumerology = new VedicNumerology();

Then add to listActionMapping. 

After btn_numerology: 'get_numerology_report',

Add btn_vedic_numerology: 'get_vedic_numerology_analysis',

Then add the case in the switch statement. 

After the numerology case. 

The numerology case is:

case 'get_numerology_report':

  if (!user.birthDate) {

    response = 'I need your birth date and name for numerology analysis.';

    break;

  }

  try {

    const numerologyReport = await numerologyService.generateFullReport(user.name, user.birthDate);

    response = `🔢 *Numerology Analysis*\n\n*Life Path:* ${numerologyReport.lifePath} - ${numerologyReport.lifePathDescription}\n\n*Expression:* ${numerologyReport.expression} - ${numerologyReport.expressionDescription}\n\n*Soul Urge:* ${numerologyReport.soulUrge} - ${numerologyReport.soulUrgeDescription}\n\n*Personality:* ${numerologyReport.personality} - ${numerologyReport.personalityDescription}\n\n*Destiny:* ${numerologyReport.destiny}\n*Maturity:* ${numerologyReport.maturity}\n\n*Strengths:* ${numerologyReport.strengths.join(', ')}\n\n*Challenges:* ${numerologyReport.challenges.join(', ')}\n\n*Career Paths:* ${numerologyReport.careerPaths.join(', ')}\n\n*Compatible Numbers:* ${numerologyReport.compatibleNumbers.join(', ')}`;

  } catch (error) {

    logger.error('Error generating numerology report:', error);

    response = '❌ Sorry, I couldn\'t generate your numerology report right now. Please try again later.';

  }

  break;

So after this break;

Add the Vedic case. 

case 'get_vedic_numerology_analysis':

  if (!user.birthDate) {

    response = 'I need your birth date and name for Vedic numerology analysis.';

    break;

  }

  try {

    const vedicAnalysis = vedicNumerology.getVedicNumerologyAnalysis(user.birthDate, user.name);

    if (vedicAnalysis.error) {

      response = `❌ ${vedicAnalysis.error}`;

    } else {

      response = vedicAnalysis.summary;

    }

  } catch (error) {

    logger.error('Error generating Vedic numerology analysis:', error);

    response = '❌ Sorry, I couldn\'t generate your Vedic numerology analysis right now. Please try again later.';

  }

  break;

Now let me make these edits. 

First, astrologyEngine.js import. 

File: astro-whatsapp-bot/src/services/astrology/astrologyEngine.js

Old string: const { HinduFestivals } = require('./hinduFestivals');

New string: const { HinduFestivals } = require('./hinduFestivals');

const { VedicNumerology } = require('./vedicNumerology');

Then initialization. 

Old string: // Initialize Hindu Festivals system

const hinduFestivals = new HinduFestivals();

New string: // Initialize Hindu Festivals system

const hinduFestivals = new HinduFestivals();

// Initialize Vedic Numerology system

const vedicNumerology = new VedicNumerology();

Then the handler. 

Old string:   }

  // Career astrology requests

New string:   }

  // Vedic numerology requests

  if (matchesIntent(message, ['vedic numerology', 'chani numerology', 'indian numerology', 'sanskrit numerology', /^vedic.?numerology/, /^chani/, /^indian.?numerology/])) {

    if (!user.birthDate) {

      return 'For Vedic Numerology analysis, I need your complete birth details and full name to calculate your Chani numbers.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Full name (as it appears on birth certificate)\n\nExample: 15/06/1990, Rajesh Kumar Sharma';

    }

    try {

      const vedicAnalysis = vedicNumerology.getVedicNumerologyAnalysis(user.birthDate, user.name || 'Unknown');

      if (vedicAnalysis.error) {

        return `I encountered an issue: ${vedicAnalysis.error}`;

      }

      return vedicAnalysis.summary;

    } catch (error) {

      logger.error('Error generating Vedic numerology analysis:', error);

      return 'I\'m having trouble calculating your Vedic numerology right now. Please try again later.';

    }

  }

  // Career astrology requests

Now menuConfig.json. 

File: astro-whatsapp-bot/src/conversation/menuConfig.json

Old string:             {

               "id": "btn_numerology",

               "title": "Numerology",

               "description": "Numbers and life path analysis"

             },

New string:             {

               "id": "btn_numerology",

               "title": "Numerology",

               "description": "Numbers and life path analysis"

             },

             {

               "id": "btn_vedic_numerology",

               "title": "Vedic Numerology",

               "description": "Chani system - traditional Indian numerology"

             },

Now messageProcessor.js. 

First, add the import. 

File: astro-whatsapp-bot/src/services/whatsapp/messageProcessor.js

Old string: const numerologyService = require('../services/astrology/numerologyService');

New string: const numerologyService = require('../services/astrology/numerologyService');

const { VedicNumerology } = require('../services/astrology/vedicNumerology');

const vedicNumerology = new VedicNumerology();

Then add to listActionMapping. 

Old string:   btn_numerology: 'get_numerology_report',

New string:   btn_numerology: 'get_numerology_report',

  btn_vedic_numerology: 'get_vedic_numerology_analysis',

Then add the case. 

I need to find the numerology case. 

From the file I read earlier, the switch is in processIncomingMessage. 

The numerology case is after some other cases. 

Let me search for the exact location. 

Since the file is long, let me use grep to find the numerology case. 

grep "case 'get_numerology_report'" astro-whatsapp-bot/src/services/whatsapp/messageProcessor.js

It should be there. 

Then add the Vedic case after it. 

Old string:   break;

case 'get_synastry_analysis':

New string:   break;

case 'get_vedic_numerology_analysis':

  if (!user.birthDate) {

    response = 'I need your birth date and name for Vedic numerology analysis.';

    break;

  }

  try {

    const vedicAnalysis = vedicNumerology.getVedicNumerologyAnalysis(user.birthDate, user.name);

    if (vedicAnalysis.error) {

      response = `❌ ${vedicAnalysis.error}`;

    } else {

      response = vedicAnalysis.summary;

    }

  } catch (error) {

    logger.error('Error generating Vedic numerology analysis:', error);

    response = '❌ Sorry, I couldn\'t generate your Vedic numerology analysis right now. Please try again later.';

  }

  break;

case 'get_synastry_analysis':

Now let me make these edits. 

First, the astrologyEngine.js import. 

I'll do the edit. 

File: astro-whatsapp-bot/src/services/astrology/astrologyEngine.js

Old string: const { HinduFestivals } = require('./hinduFestivals');

New string: const { HinduFestivals } = require('./hinduFestivals');

const { VedicNumerology } = require('./vedicNumerology');

Then initialization. 

File: astro-whatsapp-bot/src/services/astrology/astrologyEngine.js

Old string: // Initialize Hindu Festivals system

const hinduFestivals = new HinduFestivals();

New string: // Initialize Hindu Festivals system

const hinduFestivals = new HinduFestivals();

// Initialize Vedic Numerology system

const vedicNumerology = new VedicNumerology();

Then the handler. 

I need to find the exact old string. 

The numerology handler ends with:

    }

  }

  // Career astrology requests

So old string:     }

  }

  // Career astrology requests

New string:     }

  }

  // Vedic numerology requests

  if (matchesIntent(message, ['vedic numerology', 'chani numerology', 'indian numerology', 'sanskrit numerology', /^vedic.?numerology/, /^chani/, /^indian.?numerology/])) {

    if (!user.birthDate) {

      return 'For Vedic Numerology analysis, I need your complete birth details and full name to calculate your Chani numbers.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Full name (as it appears on birth certificate)\n\nExample: 15/06/1990, Rajesh Kumar Sharma';

    }

    try {

      const vedicAnalysis = vedicNumerology.getVedicNumerologyAnalysis(user.birthDate, user.name || 'Unknown');

      if (vedicAnalysis.error) {

        return `I encountered an issue: ${vedicAnalysis.error}`;

      }

      return vedicAnalysis.summary;

    } catch (error) {

      logger.error('Error generating Vedic numerology analysis:', error);

      return 'I\'m having trouble calculating your Vedic numerology right now. Please try again later.';

    }

  }

  // Career astrology requests

Now for menuConfig.json. 

File: astro-whatsapp-bot/src/conversation/menuConfig.json

Old string:             {

               "id": "btn_numerology",

               "title": "Numerology",

               "description": "Numbers and life path analysis"

             },

New string:             {

               "id": "btn_numerology",

               "title": "Numerology",

               "description": "Numbers and life path analysis"

             },

             {

               "id": "btn_vedic_numerology",

               "title": "Vedic Numerology",

               "description": "Chani system - traditional Indian numerology"

             },

Now for messageProcessor.js. 

First, add the import. 

File: astro-whatsapp-bot/src/services/whatsapp/messageProcessor.js

Old string: const numerologyService = require('../services/astrology/numerologyService');

New string: const numerologyService = require('../services/astrology/numerologyService');

const { VedicNumerology } = require('../services/astrology/vedicNumerology');

const vedicNumerology = new VedicNumerology();

Then add to listActionMapping. 

File: astro-whatsapp-bot/src/services/whatsapp/messageProcessor.js

Old string:   btn_numerology: 'get_numerology_report',

New string:   btn_numerology: 'get_numerology_report',

  btn_vedic_numerology: 'get_vedic_numerology_analysis',

Then add the case. 

I need to find where the numerology case is. 

Let me grep for it. 

grep -n "case 'get_numerology_report'" astro-whatsapp-bot/src/services/whatsapp/messageProcessor.js

Assuming it's around line 400, let me read around that area. 

Since I can't grep, let me assume it's after the other cases. 

From the file I read earlier, the switch starts around line 400. 

Let me read from line 400 to find the numerology case. 

read file from offset 400 limit 100. 

The file has more lines. 

Let me use grep. 

Since I have the tool, let me use grep. 

grep "case 'get_numerology_report'" astro-whatsapp-bot/src/services/whatsapp/messageProcessor.js

It returns the line. 

Assuming it's there, then the next case is the synastry. 

So old string:   break;

case 'get_synastry_analysis':

New string:   break;

case 'get_vedic_numerology_analysis':

  if (!user.birthDate) {

    response = 'I need your birth date and name for Vedic numerology analysis.';

    break;

  }

  try {

    const vedicAnalysis = vedicNumerology.getVedicNumerologyAnalysis(user.birthDate, user.name);

    if (vedicAnalysis.error) {

      response = `❌ ${vedicAnalysis.error}`;

    } else {

      response = vedicAnalysis.summary;

    }

  } catch (error) {

    logger.error('Error generating Vedic numerology analysis:', error);

    response = '❌ Sorry, I couldn\'t generate your Vedic numerology analysis right now. Please try again later.';

  }

  break;

case 'get_synastry_analysis':

Now let me make these edits. 

First, the import in messageProcessor.js. 

File: astro-whatsapp-bot/src/services/whatsapp/messageProcessor.js

Old string: const numerologyService = require('../services/astrology/numerologyService');

New string: const numerologyService = require('../services/astrology/numerologyService');

const { VedicNumerology } = require('../services/astrology/vedicNumerology');

const vedicNumerology = new VedicNumerology();

Then the mapping. 

File: astro-whatsapp-bot/src/services/whatsapp/messageProcessor.js

Old string:   btn_numerology: 'get_numerology_report',

New string:   btn_numerology: 'get_numerology_report',

  btn_vedic_numerology: 'get_vedic_numerology_analysis',

Then the case. 

I need to find the exact old string. 

Let me search for the synastry case. 

grep "case 'get_synastry_analysis'" astro-whatsapp-bot/src/services/whatsapp/messageProcessor.js

Then the old string is the break; before it. 

Old string:   break;

case 'get_synastry_analysis':

New string:   break;

case 'get_vedic_numerology_analysis':

  if (!user.birthDate) {

    response = 'I need your birth date and name for Vedic numerology analysis.';

    break;

  }

  try {

    const vedicAnalysis = vedicNumerology.getVedicNumerologyAnalysis(user.birthDate, user.name);

    if (vedicAnalysis.error) {

      response = `❌ ${vedicAnalysis.error}`;

    } else {

      response = vedicAnalysis.summary;

    }

  } catch (error) {

    logger.error('Error generating Vedic numerology analysis:', error);

    response = '❌ Sorry, I couldn\'t generate your Vedic numerology analysis right now. Please try again later.';

  }

  break;

case 'get_synastry_analysis':

Now let me execute these edits. 

First, astrologyEngine.js import. 

I'll do the edit. 

<xai:function_call name="edit">
<parameter name="filePath">astro-whatsapp-bot/src/services/astrology/astrologyEngine.js