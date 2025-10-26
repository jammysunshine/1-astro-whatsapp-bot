// tests/unit/conversation/conversationEngine.test.js
// Unit tests for Conversation Engine

const conversationEngine = require('../../../src/conversation/conversationEngine');

// Mock dependencies
jest.mock('../../../src/models/userModel');
jest.mock('../../../src/services/whatsapp/messageSender');
jest.mock('../../../src/services/astrology/astrologyEngine');
jest.mock('../../../src/utils/logger');

const { getUserByPhone, createUser, addBirthDetails, updateUserProfile } = require('../../../src/models/userModel');
const { sendMessage } = require('../../../src/services/whatsapp/messageSender');
const astrologyEngine = require('../../../src/services/astrology/astrologyEngine');
const logger = require('../../../src/utils/logger');

describe('ConversationEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getUserByPhone.mockResolvedValue(null);
    createUser.mockResolvedValue({ phoneNumber: '+1234567890' });
    addBirthDetails.mockResolvedValue();
    updateUserProfile.mockResolvedValue();
    sendMessage.mockResolvedValue({ success: true });
    astrologyEngine.generateCompleteReading.mockReturnValue({
      sunSign: 'Pisces',
      moonSign: 'Pisces',
      risingSign: 'Aquarius'
    });
  });

  describe('processMessage', () => {
    it('should process onboarding message', async() => {
      const message = {
        from: '+1234567890',
        text: { body: 'Hello' },
        type: 'text'
      };

      const result = await conversationEngine.processMessage(message);

      expect(result).toBeDefined();
      expect(sendMessage).toHaveBeenCalled();
    });

    it('should handle existing user', async() => {
      getUserByPhone.mockResolvedValue({
        phoneNumber: '+1234567890',
        profileComplete: true
      });

      const message = {
        from: '+1234567890',
        text: { body: 'Daily horoscope' },
        type: 'text'
      };

      const result = await conversationEngine.processMessage(message);

      expect(result).toBeDefined();
      expect(sendMessage).toHaveBeenCalled();
    });
  });

  describe('handleOnboarding', () => {
    it('should handle birth date input', async() => {
      const message = {
        from: '+1234567890',
        text: { body: '15031990' },
        type: 'text'
      };

      const result = await conversationEngine.handleOnboarding(message);

      expect(result).toBeDefined();
      expect(sendMessage).toHaveBeenCalled();
    });
  });
});
