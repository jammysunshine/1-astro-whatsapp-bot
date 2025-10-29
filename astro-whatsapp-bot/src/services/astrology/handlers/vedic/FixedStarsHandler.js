/**
 * Fixed Stars Handler
 * Handles fixed stars analysis requests
 */
const logger = require('../../../../utils/logger');

const handleFixedStars = async (message, user) => {
  if (!message.includes('fixed star') && !message.includes('fixed') && !message.includes('star') && !message.includes('constellation')) {
    return null;
  }

  return `⭐ *Fixed Stars Analysis*\n\nFixed stars are permanent stellar bodies that powerfully influence human destiny. Twenty-eight nakshatras and major fixed stars create the backdrop of our earthly dramas.\n\n🌟 *Key Fixed Stars:*\n• Regulus (Royal Star) - Power and authority, but can bring downfall\n• Aldebaran (Bull's Eye) - Royal honors, but violent if afflicted\n• Antares (Heart of Scorpio) - Power struggles, transformation\n• Fomalhaut (Fish's Mouth) - Spiritual wisdom, prosperity\n• Spica (Virgin's Spike) - Success through service\n\n🔮 *Paranatellonta:* When planets conjoin these stars, their influence intensifies. The star's nature blends with planetary energy, creating complex personality patterns.\n\n🪐 *Mundane Effects:* Fixed stars influence world leaders, nations, and historical events. Their position maps the cosmic script of human civilization.\n\n💫 *Note:* Fixed star analysis requires birth chart calculation. Each star's influence lasts approximately 2° orb of conjunction. 🕉️`;
};

module.exports = { handleFixedStars };