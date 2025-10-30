const logger = require('../../utils/logger');

class BaseMessageProcessor {
  /**
   * Processes an incoming WhatsApp message.
   * @param {Object} message - The incoming WhatsApp message object.
   * @param {Object} user - The user object associated with the message.
   * @param {string} phoneNumber - The sender's phone number.
   * @returns {Promise<void>}
   */
  async process(message, user, phoneNumber) {
    throw new Error('Method "process()" must be implemented.');
  }

  /**
   * Optional: Processes a button message (subset of interactive).
   * This is specifically for button messages, distinct from interactive button_reply.
   * @param {Object} message - The incoming WhatsApp button message object.
   * @param {Object} user - The user object associated with the message.
   * @param {string} phoneNumber - The sender's phone number.
   * @returns {Promise<void>}
   */
  async processButtonMessage(message, user, phoneNumber) {
    logger.warn(`${this.constructor.name}: processButtonMessage not implemented`);
  }
}

module.exports = BaseMessageProcessor;
