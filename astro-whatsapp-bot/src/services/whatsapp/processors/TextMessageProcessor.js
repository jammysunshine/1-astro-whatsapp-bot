const BaseMessageProcessor = require('./BaseMessageProcessor');
const { ValidationService } = require('../utils/ValidationService');
const { processFlowMessage } = require('../../../conversation/conversationEngine');
const { MessageRouter } = require('./MessageRouter');
const { ResponseHandler } = require('./ResponseHandler');

class TextMessageProcessor extends BaseMessageProcessor {
  constructor(actionRegistry = null) {
    super();
    this.actionRegistry = actionRegistry;
    this.messageRouter = new MessageRouter(actionRegistry);
    this.responseHandler = new ResponseHandler();
  }

  async process(message, user, phoneNumber) {
    try {
      const messageText = message.text?.body || '';
      if (!ValidationService.validateMessage(message, phoneNumber)) return;

      const session = await this.session(phoneNumber);
      if (this.inFlow(session)) return await processFlowMessage(message, user, session.currentFlow);

      user.profileComplete
        ? await this.processComplete(messageText, user, phoneNumber)
        : await processFlowMessage(message, user, 'onboarding');
    } catch (error) {
      await this.responseHandler.handleProcessingError(phoneNumber, error);
    }
  }

  async processComplete(messageText, user, phoneNumber) {
    const routed = await this.messageRouter.routeCompleteUserMessage(messageText, user, phoneNumber, this);
    if (!routed) await this.responseHandler.handleFallbackResponse(messageText, user, phoneNumber);
  }

  async executeAction(actionId, user, phoneNumber) {
    try {
      if (this.actionRegistry) await this.actionRegistry.executeAction(actionId, user, phoneNumber);
      else await this.legacy(actionId, phoneNumber);
    } catch (error) {
      await this.responseHandler.sendErrorResponse(phoneNumber, 'action_execution_error', user.preferredLanguage || 'en');
    }
  }

  async legacy(actionId, phoneNumber) {
    await this.responseHandler.sendErrorResponse(phoneNumber, 'action_not_available', 'en');
  }

  async session(phoneNumber) {
    const { getUserSession } = require('../../../models/userModel');
    return await getUserSession(phoneNumber) || null;
  }

  inFlow(session) {
    return session && session.currentFlow && session.currentFlow !== 'undefined';
  }

  async sendErrorResponse(phoneNumber, errorKey, language) {
    await this.responseHandler.sendErrorResponse(phoneNumber, errorKey, language);
  }
}

module.exports = TextMessageProcessor;