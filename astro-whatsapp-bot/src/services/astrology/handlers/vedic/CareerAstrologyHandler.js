/**
 * Career Astrology Handler
 * Handles professional path and career analysis requests
 */
const logger = require('../../../../utils/logger');

const handleCareerAstrology = async(message, user) => {
  if (
    !message.includes('career') &&
    !message.includes('job') &&
    !message.includes('profession') &&
    !message.includes('work')
  ) {
    return null;
  }

  return '💼 *Career Astrology Analysis*\n\nYour profession and success path are written in the stars. The 10th house shows career destiny, Midheaven reveals public image.\n\n🪐 *Career Planets:*\n• Sun: Leadership and authority roles\n• Mars: Military, engineering, competitive fields\n• Mercury: Communication, teaching, business\n• Jupiter: Teaching, law, philosophy, international work\n• Venus: Arts, beauty, luxury industries\n• Saturn: Government, construction, traditional careers\n• Uranus: Technology, innovation, unconventional paths\n\n📊 *Career Success Indicators:*\n• 10th Lord strong: Professional achievement\n• Sun-Mercury aspects: Communication careers\n• Venus-Jupiter: Creative prosperity\n• Saturn exalted: Long-term stability\n\n🎯 *Saturn Return (29-30)*: Career testing and maturity\n\n⚡ *Uranus Opposition (40-42)*: Career changes and reinvention\n\n🚀 *Jupiter Return (12, 24, 36, 48, 60, 72)*: Expansion opportunities\n\n💫 *Vocation vs. Career:* True calling (5th house) vs. professional path (10th house). Midheaven aspects reveal how the world sees your work.\n\n🕉️ *Cosmic Calling:* Your MC-lord shows life\'s work. Exalted rulers bring exceptional success. Retrograde planets indicate behind-the-scenes careers.';
};

module.exports = { handleCareerAstrology };
