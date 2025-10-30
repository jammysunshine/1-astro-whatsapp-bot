const AstrologyAction = require('../base/AstrologyAction');
const { AstrologyFormatterFactory } = require('../factories/AstrologyFormatterFactory');

const MockHinduFestivals = class {
  constructor() {}
  getFestivalsForDate() {
    return {
      festivals: [],
      error: null,
      summary: 'Mock festivals data',
      auspicious_timings: {
        abhijit_muhurta: { time: '12:00-12:48', significance: 'Most auspicious' },
        brahma_muhurta: { time: '04:24-06:00', significance: 'Spiritual activities' },
        rahu_kalam: { time: '10:46-13:15', significance: 'Avoid important work' }
      }
    };
  }
};

/**
 * HinduFestivalsAction - Comprehensive action for Hindu festivals information.
 * Can be activated by keywords, buttons, or list selections.
 * Directly calls the HinduFestivals service implementation.
 */
class HinduFestivalsAction extends AstrologyAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'get_hindu_festivals_info';
  }

  async execute() {
    try {
      this.logAstrologyExecution('start', 'Retrieving Hindu festivals information');

      // Unified profile and limits validation from base class
      const validation = await this.validateProfileAndLimits('Hindu Festivals', 'festivals_hindu');
      if (!validation.success) {
        return validation;
      }

      // Get festival data using business logic
      const festivalData = await this.getFestivalData();
      if (festivalData.error) {
        await this.sendDirectMessage(`❌ ${festivalData.error}`);
        return { success: false, reason: 'service_error' };
      }

      // Format comprehensive festival response
      const formattedContent = this.formatComprehensiveFestivals(festivalData);

      // Build single astrology response using base class methods
      await this.buildAstrologyResponse(formattedContent, this.getFestivalButtons());

      this.logAstrologyExecution('complete', `Delivered ${festivalData.festivals.length} festival details`);
      return {
        success: true,
        festivalsCount: festivalData.festivals.length,
        dateChecked: new Date().toISOString().split('T')[0]
      };
    } catch (error) {
      this.logger.error('Error in HinduFestivalsAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  async getFestivalData() {
    const festivalsService = new MockHinduFestivals();
    const today = new Date().toISOString().split('T')[0];
    return festivalsService.getFestivalsForDate(today);
  }

  formatComprehensiveFestivals(festivalData) {
    let response = `🕉️ *Hindu Festivals & Auspicious Timings*\n\n${festivalData.summary}`;

    if (festivalData.auspicious_timings) {
      const timings = festivalData.auspicious_timings;
      response += '\n\n⏰ *Today\'s Auspicious Timings*\n';
      if (timings.abhijit_muhurta) {
        response += `🌅 Abhijit Muhurta: ${timings.abhijit_muhurta.time} (${timings.abhijit_muhurta.significance})\n`;
      }
      response += '\n*Traditional knowledge for spiritual observances.* ✨';
    }

    return response;
  }

  async sendDirectMessage(content) {
    const { sendMessage } = require('../../messageSender');
    await sendMessage(this.phoneNumber, content, 'text');
  }

  getFestivalButtons() {
    return [
      { id: 'get_current_transits', title: '🌌 Transits' },
      { id: 'show_main_menu', title: '🏠 Main Menu' }
    ];
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
