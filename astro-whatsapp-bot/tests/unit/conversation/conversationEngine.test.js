// tests/unit/conversation/conversationEngine.test.js
// Unit tests for Conversation Engine

const conversationEngine = require('../../../src/conversation/conversationEngine');

// Mock dependencies
jest.mock('../../../src/models/userModel');
jest.mock('../../../src/services/whatsapp/messageSender');
jest.mock('../../../src/services/astrology/astrologyEngine');
jest.mock('../../../src/utils/logger');
jest.mock('../../../src/conversation/flowLoader');

const {
  getUserByPhone,
  createUser,
  addBirthDetails,
  updateUserProfile,
  getUserSession,
  setUserSession,
  deleteUserSession
} = require('../../../src/models/userModel');
const { sendMessage } = require('../../../src/services/whatsapp/messageSender');
const astrologyEngine = require('../../../src/services/astrology/astrologyEngine');
const logger = require('../../../src/utils/logger');
const { getFlow } = require('../../../src/conversation/flowLoader');

describe('ConversationEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getUserByPhone.mockResolvedValue(null);
    createUser.mockResolvedValue({ phoneNumber: '+1234567890' });
    addBirthDetails.mockResolvedValue();
    updateUserProfile.mockResolvedValue();
    getUserSession.mockResolvedValue(null);
    setUserSession.mockResolvedValue();
    deleteUserSession.mockResolvedValue();
    sendMessage.mockResolvedValue({ success: true });
    astrologyEngine.generateCompleteReading = jest.fn().mockReturnValue({
      sunSign: 'Pisces',
      moonSign: 'Pisces',
      risingSign: 'Aquarius'
    });
    getFlow.mockReturnValue({
      start_step: 'step1',
      steps: {
        step1: { type: 'input', validation: 'date' }
      }
    });
  });

  describe('processFlowMessage', () => {
    it('should initialize session for new flow and access flow.start_step without temporal dead zone error', async() => {
      const message = {
        type: 'text',
        text: { body: 'test input' }
      };
      const user = {
        phoneNumber: '+1234567890',
        id: 'user-123'
      };
      const flowId = 'test_flow';

      const result = await conversationEngine.processFlowMessage(
        message,
        user,
        flowId
      );

      expect(result).toBe(true);
      expect(getUserSession).toHaveBeenCalledWith('+1234567890');
      expect(setUserSession).toHaveBeenCalledWith('+1234567890', {
        currentFlow: 'test_flow',
        currentStep: 'step1', // This should not cause temporal dead zone error
        flowData: {}
      });
    });

    it('should handle existing session correctly', async() => {
      const existingSession = {
        currentFlow: 'test_flow',
        currentStep: 'step1',
        flowData: {}
      };
      getUserSession.mockResolvedValue(existingSession);

      const message = {
        type: 'text',
        text: { body: 'test input' }
      };
      const user = {
        phoneNumber: '+1234567890',
        id: 'user-123'
      };
      const flowId = 'test_flow';

      const result = await conversationEngine.processFlowMessage(
        message,
        user,
        flowId
      );

      expect(result).toBe(true);
      expect(setUserSession).not.toHaveBeenCalled();
    });

    it('should handle interactive messages without validation', async() => {
      const message = {
        type: 'interactive',
        interactive: { type: 'button_reply' }
      };
      const user = {
        phoneNumber: '+1234567890',
        id: 'user-123'
      };
      const flowId = 'test_flow';

      const result = await conversationEngine.processFlowMessage(
        message,
        user,
        flowId
      );

      expect(result).toBe(true);
      // Should return early for interactive messages without processing validation
    });

    it('should handle flow not found error', async() => {
      getFlow.mockReturnValue(null);

      const message = {
        type: 'text',
        text: { body: 'test input' }
      };
      const user = {
        phoneNumber: '+1234567890',
        id: 'user-123'
      };
      const flowId = 'nonexistent_flow';

      const result = await conversationEngine.processFlowMessage(
        message,
        user,
        flowId
      );

      expect(result).toBe(false);
      expect(sendMessage).toHaveBeenCalledWith(
        '+1234567890',
        'I\'m sorry, I encountered an internal error. Please try again later.'
      );
      expect(deleteUserSession).toHaveBeenCalledWith('+1234567890');
    });

    it('should handle invalid phone number', async() => {
      const message = {
        type: 'text',
        text: { body: 'test input' }
      };
      const user = {
        id: 'user-123'
        // Missing phoneNumber
      };
      const flowId = 'test_flow';

      const result = await conversationEngine.processFlowMessage(
        message,
        user,
        flowId
      );

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        '❌ No phone number provided to processFlowMessage'
      );
    });
  });
});
