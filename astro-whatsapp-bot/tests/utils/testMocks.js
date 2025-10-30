/**
 * Core Test Mocks for WhatsApp Message Processing
 *
 * MOCKING PLAN FOCUS: WhatsApp message functions (real APIs for calculation services)
 */

const { jest } = require('@jest/globals');

/**
 * WhatsApp Message Service Mocks
 * Critical for fixing 180+ failing E2E tests
 */
class WhatsAppMessageMocks {
  constructor() {
    this.sentMessages = [];
    this.messageCounter = 0;
  }

  /**
   * Mock sendMessage function - Primary source of test failures
   */
  mockSendMessage() {
    return jest.fn((phoneNumber, message, messageType, options, language) => {
      const sentMessage = {
        id: `msg_${++this.messageCounter}`,
        phoneNumber,
        message,
        type: messageType || 'text',
        options: options || {},
        language: language || 'en',
        timestamp: new Date().toISOString()
      };

      this.sentMessages.push(sentMessage);
      return Promise.resolve({ success: true, messageId: sentMessage.id });
    });
  }

  /**
   * Mock sendListMessage - Used in menu navigation tests
   */
  mockSendListMessage() {
    return jest.fn((phoneNumber, body, buttonText, sections, options) => {
      const sentMessage = {
        id: `msg_${++this.messageCounter}`,
        phoneNumber,
        type: 'interactive_list',
        body,
        buttonText,
        sections: sections || [],
        options: options || {},
        timestamp: new Date().toISOString()
      };

      this.sentMessages.push(sentMessage);
      return Promise.resolve({ success: true, messageId: sentMessage.id });
    });
  }

  /**
   * Mock sendInteractiveButtons - Used in menu tests
   */
  mockSendInteractiveButtons() {
    return jest.fn((phoneNumber, body, buttons, options) => {
      const sentMessage = {
        id: `msg_${++this.messageCounter}`,
        phoneNumber,
        type: 'interactive_buttons',
        body,
        buttons: buttons || [],
        options: options || {},
        timestamp: new Date().toISOString()
      };

      this.sentMessages.push(sentMessage);
      return Promise.resolve({ success: true, messageId: sentMessage.id });
    });
  }

  /**
   * Get all messages sent during test
   */
  getSentMessages() {
    return this.sentMessages;
  }

  /**
   * Find messages sent to specific phone number
   */
  getMessagesFor(phoneNumber) {
    return this.sentMessages.filter(msg => msg.phoneNumber === phoneNumber);
  }

  /**
   * Clear message history
   */
  clearMessages() {
    this.sentMessages = [];
    this.messageCounter = 0;
  }

  /**
   * Assert specific message was sent
   */
  assertMessageSent(phoneNumber, partialMessage) {
    const messages = this.getMessagesFor(phoneNumber);
    const found = messages.some(msg => {
      return Object.entries(partialMessage).every(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(msg[key]) === JSON.stringify(value);
        }
        if (typeof value === 'string' && value.includes('*')) {
          return msg[key] && msg[key].includes(value.replace(/\*/g, ''));
        }
        return msg[key] === value;
      });
    });

    if (!found) {
      throw new Error(`Expected message not found: ${JSON.stringify(partialMessage)}\nActual messages: ${JSON.stringify(messages, null, 2)}`);
    }

    return true;
  }
}

/**
 * Action Registry Test Helpers
 */
class ActionRegistryTestHelpers {
  /**
   * Test that all action mappings exist and are not null
   */
  static async validateAllActionsHaveImplementations(registry) {
    const mappings = registry.getActionMappings();
    const nullMappings = [];

    for (const [actionId, actionClass] of Object.entries(mappings)) {
      if (!actionClass) {
        nullMappings.push(actionId);
      } else {
        // Verify it's a class with actionId
        const instance = new actionClass();
        if (!instance.constructor.actionId) {
          nullMappings.push(`${actionId} (missing actionId)`);
        }
      }
    }

    if (nullMappings.length > 0) {
      throw new Error(`Null action mappings found: ${nullMappings.join(', ')}`);
    }

    return mappings;
  }

  /**
   * Test action execution
   */
  static async testActionExecution(actionClass, context = {}) {
    const action = new actionClass(context);

    if (typeof action.execute !== 'function') {
      throw new Error(`Action ${actionClass.name} has no execute method`);
    }

    const result = await action.execute();

    if (!result || typeof result.success !== 'boolean') {
      throw new Error(`Action ${actionClass.name} returned invalid result: ${JSON.stringify(result)}`);
    }

    return result;
  }
}

/**
 * Message Flow Test Helpers
 */
class MessageFlowTestHelpers {
  /**
   * Test message routing through messageProcessor
   */
  static async testMessageRouting(messageProcessor, testMessage, expectedAction) {
    const { messageRouter } = messageProcessor;

    const actionId = messageRouter.parseActionFromMessage(testMessage, {});
    if (actionId !== expectedAction) {
      throw new Error(`Expected action '${expectedAction}' but got '${actionId}' for message: ${JSON.stringify(testMessage)}`);
    }

    // Test action execution if found
    if (actionId) {
      await messageRouter.routeToAction(actionId, testMessage.from || '+test123', {}, testMessage);
    }

    return actionId;
  }

  /**
   * Test end-to-end message processing
   */
  static async testEndToEndMessage(messageProcessor, message, user = {}) {
    const result = await messageProcessor.processIncomingMessage(message, {});

    if (!result) {
      // Result can be undefined for valid processing
      return true;
    }

    if (result && typeof result.error !== 'undefined') {
      throw new Error(`Message processing failed: ${result.error}`);
    }

    return result;
  }
}

/**
 * Setup function for message flow tests
 * Focuses on WhatsApp message mocking that's causing test failures
 */
function setupMessageProcessingTests() {
  const whatsappMocks = new WhatsAppMessageMocks();

  // Mock WhatsApp message services (the main cause of test failures)
  jest.mock('../../src/services/whatsapp/messageSender', () => ({
    sendMessage: whatsappMocks.mockSendMessage(),
    sendListMessage: whatsappMocks.mockSendListMessage(),
    sendInteractiveButtons: whatsappMocks.mockSendInteractiveButtons(),
    sendTextMessage: whatsappMocks.mockSendMessage(),
    sendTemplateMessage: jest.fn().mockResolvedValue({ success: true }),
    sendMediaMessage: jest.fn().mockResolvedValue({ success: true }),
    markMessageAsRead: jest.fn().mockResolvedValue({ success: true })
  }));

  // Keep astrological calculations real (no mocking per plan)
  // Keep MongoDB real (no mocking per plan)

  return {
    whatsappMocks,
    ActionRegistryTestHelpers,
    MessageFlowTestHelpers,
    cleanup: () => {
      jest.clearAllMocks();
      whatsappMocks.clearMessages();
    }
  };
}

module.exports = {
  WhatsAppMessageMocks,
  ActionRegistryTestHelpers,
  MessageFlowTestHelpers,
  setupMessageProcessingTests
};