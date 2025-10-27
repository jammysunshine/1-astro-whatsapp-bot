// tests/unit/services/whatsapp/messageProcessor.test.js
// Unit tests for WhatsApp message processor service

// Mock dependencies
jest.mock('services/whatsapp/messageSender', () => ({
  sendMessage: jest.fn(),
  sendTextMessage: jest.fn()
}));
jest.mock('models/userModel', () => ({
  getUserByPhone: jest.fn(),
  createUser: jest.fn(),
  addBirthDetails: jest.fn(),
  updateUserProfile: jest.fn(),
  getUserSession: jest.fn(),
  setUserSession: jest.fn(),
  deleteUserSession: jest.fn()
}));
jest.mock('services/astrology/astrologyEngine', () => ({
  generateAstrologyResponse: jest.fn()
}));
jest.mock('conversation/conversationEngine', () => ({
  processFlowMessage: jest.fn()
}));
jest.mock('conversation/menuLoader', () => ({
  getMenu: jest.fn()
}));
jest.mock('services/astrology/vedicCalculator', () => ({
  calculateSunSign: jest.fn(),
  checkCompatibility: jest.fn()
}));
jest.mock('services/payment/paymentService', () => ({
  getSubscriptionStatus: jest.fn(),
  getSubscriptionBenefits: jest.fn(),
  processSubscription: jest.fn(),
  getPlan: jest.fn()
}));

const {
  processIncomingMessage
} = require('services/whatsapp/messageProcessor');
const { sendMessage } = require('services/whatsapp/messageSender');
const { getUserByPhone, createUser } = require('models/userModel');
const {
  generateAstrologyResponse
} = require('services/astrology/astrologyEngine');
const { processFlowMessage } = require('conversation/conversationEngine');
const { getMenu } = require('conversation/menuLoader');
const logger = require('utils/logger');

describe('WhatsApp Message Processor', () => {
  let message;
  let value;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup test data
    message = {
      from: '1234567890',
      id: 'message-id-123',
      timestamp: '1234567890',
      type: 'text',
      text: {
        body: 'Hello, astrologer!'
      }
    };

    value = {
      contacts: [
        {
          profile: { name: 'John Doe' },
          wa_id: '1234567890'
        }
      ]
    };
  });

  describe('processIncomingMessage', () => {
    it('should create new user for unknown phone number', async() => {
      getUserByPhone.mockResolvedValue(null);
      createUser.mockResolvedValue({
        id: 'user-123',
        phoneNumber: '1234567890'
      });
      processFlowMessage.mockResolvedValue(true);

      await processIncomingMessage(message, value);

      expect(getUserByPhone).toHaveBeenCalledWith('1234567890');
      expect(createUser).toHaveBeenCalledWith('1234567890');
      expect(processFlowMessage).toHaveBeenCalledWith(
        message,
        { id: 'user-123', phoneNumber: '1234567890' },
        'onboarding'
      );
    });

    it('should process existing user message', async() => {
      const existingUser = {
        id: 'user-456',
        phoneNumber: '1234567890',
        birthDate: '15/03/1990',
        profileComplete: true
      };
      getUserByPhone.mockResolvedValue(existingUser);
      generateAstrologyResponse.mockResolvedValue(
        'Your personalized daily horoscope!'
      );
      sendMessage.mockResolvedValue({ success: true });

      await processIncomingMessage(message, value);

      expect(getUserByPhone).toHaveBeenCalledWith('1234567890');
      expect(createUser).not.toHaveBeenCalled();
      expect(generateAstrologyResponse).toHaveBeenCalledWith(
        'Hello, astrologer!',
        existingUser
      );
      expect(sendMessage).toHaveBeenCalledWith(
        '1234567890',
        'Your personalized daily horoscope!'
      );
    });

    it('should handle text messages correctly', async() => {
      const existingUser = {
        id: 'user-789',
        phoneNumber: '1234567890',
        profileComplete: true
      };
      getUserByPhone.mockResolvedValue(existingUser);
      generateAstrologyResponse.mockResolvedValue('Text message response');
      sendMessage.mockResolvedValue({ success: true });
      getMenu.mockReturnValue(null); // Mock menu as not found to force astrology response

      message.type = 'text';
      message.text = { body: 'Tell me about my future' };

      await processIncomingMessage(message, value);

      expect(generateAstrologyResponse).toHaveBeenCalledWith(
        'Tell me about my future',
        existingUser
      );
    });

    it('should handle interactive button replies', async() => {
      const existingUser = {
        id: 'user-101',
        phoneNumber: '1234567890',
        profileComplete: true
      };
      getUserByPhone.mockResolvedValue(existingUser);
      getMenu.mockReturnValue({
        buttons: [{ id: 'btn_daily_horoscope', action: 'get_daily_horoscope' }]
      });
      sendMessage.mockResolvedValue({ success: true });

      message.type = 'interactive';
      message.interactive = {
        type: 'button_reply',
        button_reply: {
          id: 'btn_daily_horoscope',
          title: 'Daily Horoscope'
        }
      };

      await processIncomingMessage(message, value);

      expect(sendMessage).toHaveBeenCalledWith(
        '1234567890',
        'messages.daily_horoscope.incomplete_profile',
        'text',
        {},
        'en'
      );
    });

    it('should handle interactive list replies', async() => {
      const existingUser = {
        id: 'user-102',
        phoneNumber: '1234567890',
        profileComplete: true
      };
      getUserByPhone.mockResolvedValue(existingUser);
      sendMessage.mockResolvedValue({ success: true });

      message.type = 'interactive';
      message.interactive = {
        type: 'list_reply',
        list_reply: {
          id: 'list_compatibility',
          title: 'Check Compatibility',
          description: 'Check compatibility with a friend'
        }
      };

      await processIncomingMessage(message, value);

      expect(sendMessage).toHaveBeenCalledWith(
        '1234567890',
        'messages.errors.list_reply',
        'text',
        { description: 'Check compatibility with a friend', title: 'Check Compatibility' },
        'en'
      );
    });

    it('should handle button messages', async() => {
      const existingUser = {
        id: 'user-103',
        phoneNumber: '1234567890',
        profileComplete: true
      };
      getUserByPhone.mockResolvedValue(existingUser);
      sendMessage.mockResolvedValue({ success: true });

      message.type = 'button';
      message.button = {
        payload: 'daily_horoscope_payload',
        text: 'Daily Horoscope'
      };

      await processIncomingMessage(message, value);

      expect(sendMessage).toHaveBeenCalledWith(
        '1234567890',
        'Button pressed: Daily Horoscope\nPayload: daily_horoscope_payload\n\nI\'ll process your request shortly!'
      );
    });

    it('should handle media messages', async() => {
      const existingUser = {
        id: 'user-104',
        phoneNumber: '1234567890',
        profileComplete: true
      };
      getUserByPhone.mockResolvedValue(existingUser);
      sendMessage.mockResolvedValue({ success: true });

      message.type = 'image';
      message.image = {
        id: 'image-id-123',
        caption: 'My birth chart'
      };

      await processIncomingMessage(message, value);

      expect(sendMessage).toHaveBeenCalledWith(
        '1234567890',
        'messages.errors.media_acknowledgment',
        'text',
        { caption: ' with caption: "My birth chart"', type: 'image' },
        'en'
      );
    });

    it('should handle unsupported message types gracefully', async() => {
      const existingUser = {
        id: 'user-105',
        phoneNumber: '1234567890',
        profileComplete: true
      };
      getUserByPhone.mockResolvedValue(existingUser);
      sendMessage.mockResolvedValue({ success: true });

      message.type = 'unsupported';

      await processIncomingMessage(message, value);

      expect(sendMessage).toHaveBeenCalledWith(
        '1234567890',
        'messages.errors.unsupported_message_type',
        'text',
        {},
        'en'
      );
    });

    it('should handle errors gracefully', async() => {
      getUserByPhone.mockRejectedValue(new Error('Database error'));
      sendMessage.mockResolvedValue({ success: true });

      await processIncomingMessage(message, value);

      expect(sendMessage).toHaveBeenCalledWith(
        '1234567890',
        'messages.errors.generic_error',
        'text',
        {},
        'en'
      );
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error processing message from 1234567890:'),
        expect.any(Error)
      );
    });
  });
});
