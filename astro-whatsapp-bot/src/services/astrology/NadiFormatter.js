class NadiFormatter {
  /**
   * Format Nadi reading for WhatsApp display
   * @param {Object} reading - Nadi reading
   * @returns {string} Formatted reading text
   */
  formatReadingForWhatsApp(reading) {
    try {
      if (reading.error) {
        return `📜 *Nadi Astrology Error*\n\n${reading.error}`;
      }

      let message = '📜 *Nadi Astrology Reading*\n\n';

      // Birth Nakshatra
      if (reading.birthNakshatra && !reading.birthNakshatra.error) {
        message += `*Birth Nakshatra:* ${reading.birthNakshatra.name}\n`;
        message += `*Ruling Planet:* ${reading.birthNakshatra.rulingPlanet}\n`;
        message += `*Deity:* ${reading.birthNakshatra.rulingDeity}\n`;
        message += `*Pada:* ${reading.birthNakshatra.pada}\n`;
        message += `*Characteristics:* ${reading.birthNakshatra.characteristics}\n\n`;
      }

      // Nadi System
      if (reading.nadiSystem) {
        message += `*Nadi System:* ${reading.nadiSystem.name}\n`;
        message += `*Characteristics:* ${reading.nadiSystem.characteristics}\n`;
        message += `*Life Purpose:* ${reading.nadiSystem.lifePurpose}\n\n`;
      }

      // Current Dasha
      if (reading.currentDasha && !reading.currentDasha.error) {
        message += `*Current Dasha:* ${reading.currentDasha.planet} (${reading.currentDasha.remaining} years remaining)\n`;
        message += `*Influence:* ${reading.currentDasha.influence}\n\n`;
      }

      // Predictions
      if (reading.predictions && !reading.predictions.error) {
        message += '*Key Predictions:*\n';
        Object.entries(reading.predictions).forEach(([area, prediction]) => {
          message += `• *${area.charAt(0).toUpperCase() + area.slice(1)}:* ${prediction}\n`;
        });
        message += '\n';
      }

      // Remedies
      if (reading.remedies && reading.remedies.length > 0) {
        message += '*Recommended Remedies:*\n';
        reading.remedies.forEach(remedy => {
          message += `• ${remedy}\n`;
        });
        message += '\n';
      }

      message +=
        '⭐ *Remember:* Nadi astrology provides ancient wisdom from palm leaf manuscripts. Consult a qualified Nadi astrologer for detailed analysis! ✨';

      return message;
    } catch (error) {
      console.error('Error formatting Nadi reading for WhatsApp:', error);
      return '❌ Error formatting Nadi astrology reading.';
    }
  }
}

module.exports = { NadiFormatter };
