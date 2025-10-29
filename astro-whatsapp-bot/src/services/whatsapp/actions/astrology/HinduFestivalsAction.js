const BaseAction = require('../BaseAction');
const { HinduFestivals } = require('../../../services/astrology/hinduFestivals');

/**
 * HinduFestivalsAction - Comprehensive action for Hindu festivals information.
 * Can be activated by keywords, buttons, or list selections.
 * Directly calls the HinduFestivals service implementation.
 */
class HinduFestivalsAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'get_hindu_festivals_info';
  }

  /**
   * Execute the hindu festivals action (main entry point)
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Generating Hindu festivals info');

      const festivalsService = new HinduFestivals();
      const today = new Date().toISOString().split('T')[0];

      // Get main festival data
      const festivalData = festivalsService.getFestivalsForDate(today);

      if (festivalData.error) {
        await this.sendMessage(`❌ ${festivalData.error}`, 'text');
        return { success: false, reason: 'service_error' };
      }

      // Send main festival summary
      await this.sendFestivalsOverview(festivalData);

      // Send detailed festival information if there are festivals
      if (festivalData.festivals && festivalData.festivals.length > 0) {
        await this.sendDetailedFestivals(festivalData.festivals.slice(0, 2)); // Limit to 2 main festivals
      }

      // Send auspicious timings
      await this.sendAuspiciousTimings(festivalData.auspicious_timings);

      this.logExecution('complete', `Sent ${festivalData.festivals.length} festival details`);
      return {
        success: true,
        festivalsCount: festivalData.festivals.length,
        dateChecked: festivalData.date
      };

    } catch (error) {
      this.logger.error('Error in HinduFestivalsAction:', error);
      await this.sendMessage('❌ I encountered an error retrieving festival information. Please try again.', 'text');
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Send festival overview message
   * @param {Object} festivalData - Festival data from service
   */
  async sendFestivalsOverview(festivalData) {
    const message = `🕉️ *Hindu Festivals & Auspicious Timings*\n\n${festivalData.summary}`;
    await this.sendMessage(message, 'text');
  }

  /**
   * Send detailed festival information
   * @param {Array} festivals - Festival array
   */
  async sendDetailedFestivals(festivals) {
    for (const festival of festivals.slice(0, 2)) { // Limit to first 2 for brevity
      let detailMsg = `🎊 *${festival.name}*\n`;
      detailMsg += `📅 Estimated: ${festival.estimated_date}\n`;
      detailMsg += `🕉️ Significance: ${festival.significance}\n`;
      detailMsg += `🙏 Deities: ${festival.deities}\n\n`;

      // Limit description length for mobile
      detailMsg += `📝 Key Rituals:\n${festival.rituals.slice(0, 3).join('\n')}...`;

      await this.sendMessage(detailMsg, 'text');
    }
  }

  /**
   * Send auspicious timings information
   * @param {Object} timingsData - Auspicious timings data
   */
  async sendAuspiciousTimings(timingsData) {
    if (!timingsData) return;

    let timingsMsg = `⏰ *Today's Auspicious Timings*\n\n`;
    timingsMsg += `🌅 Abhijit Muhurta: ${timingsData.abhijit_muhurta?.time} (*${timingsData.abhijit_muhurta?.significance}*)\n\n`;
    timingsMsg += `🌙 Brahma Muhurta: ${timingsData.brahma_muhurta?.time} (*${timingsData.brahma_muhurta?.significance}*)\n\n`;

    if (timingsData.rahu_kalam) {
      timingsMsg += `🌑 Rahu Kalam: ${timingsData.rahu_kalam.time} (*${timingsData.rahu_kalam.significance}*)\n\n`;
    }

    await this.sendMessage(timingsMsg, 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Get comprehensive Hindu festivals information and auspicious timings guide',
      keywords: [
        'hindu festivals',
        'festivals',
        'festival dates',
        'festival calendar',
        'auspicious dates',
        'festival timings',
        'hindu calendar',
        'muhurta timing',
        'abhijit muhurta'
      ],
      category: 'astrology',
      subscriptionRequired: false,
      cooldown: 3600000 // 1 hour cooldown
    };
  }
}

module.exports = HinduFestivalsAction;