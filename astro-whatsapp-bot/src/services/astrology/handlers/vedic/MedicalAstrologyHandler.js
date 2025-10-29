/**
 * Medical Astrology Handler
 * Handles health and medical astrology requests
 */
const logger = require('../../../../utils/logger');
const MundaneAstrologyReader = require('../../../mundaneAstrology');

const handleMedicalAstrology = async (message, user) => {
  if (!message.includes('medical') && !message.includes('health') && !message.includes('disease') && !message.includes('illness')) {
    return null;
  }

  try {
    const mundaneReader = new MundaneAstrologyReader();
    const chartData = {
      planets: {},
      houses: {},
      aspects: []
    };

    const healthAnalysis = await mundaneReader.generateMundaneAnalysis(chartData, 'health');
    return `🏥 *Medical Astrology Analysis*\n\nPlanetary positions indicate health strengths and vulnerabilities. Medical astrology connects celestial bodies with bodily systems.\n\n🌙 *Lunar Influence 2-3 days:*\n• New Moon: Rest and renewal\n• Full Moon: Peak energy, then depletion\n• Moon void: Medical procedures advised against\n\n☀️ *Sun Transits 30 days:* Vital force, immune system\n\n🩸 *Mars Transits 40 days:* Surgery timing, inflammation\n\nSaturn: Chronic conditions, bone health\nVenus: Reproductive health, harmony\nMercury: Nervous system, communication\nJupiter: Expansion, liver health\n\n⚕️ *Planetary Rulerships:*\n• Aries/Mars: Head, brain\n• Taurus/Venus: Throat, thyroid\n• Gemini/Mercury: Lungs, nervous system\n• Cancer/Moon: Stomach, breasts\n• Leo/Sun: Heart, spine\n• Virgo/Mercury: Intestines, digestion\n• Libra/Venus: Kidneys, skin\n• Scorpio/Mars/Pluto: Reproductive system\n• Sagittarius/Jupiter: Liver, hips\n• Capricorn/Saturn: Knees, skeletal system\n• Aquarius/Uranus: Ankles, circulation\n• Pisces/Jupiter/Neptune: Feet, lymphatic system\n\n🕉️ *Ancient Wisdom:* "A physician without knowledge of astrology has no right to call himself a physician" - Hippocrates\n\n💊 *Note:* Medical astrology complements modern medicine. Consult healthcare professionals for medical decisions.`;
  } catch (error) {
    logger.error('Medical astrology error:', error);
    return '❌ Error generating medical astrology analysis.';
  }
};

module.exports = { handleMedicalAstrology };