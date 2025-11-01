// tests/integration/services/whatsapp/messageProcessor.test.js
// Integration tests for WhatsApp message processor with translation and flow handling

// Mock dependencies
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn()
}));

const axios = require('axios');
const {
  processIncomingMessage,
  processTextMessage,
  processInteractiveMessage,
  validateUserProfile,
  listActionMapping
} = require('../../../../src/services/whatsapp/messageProcessor');
const {
  sendMessage
} = require('../../../../src/services/whatsapp/messageSender');
const logger = require('../../../../src/utils/logger');

describe('WhatsApp Message Processor Integration Tests', () => {
  const phoneNumber = '1234567890';
  const validUser = {
    _id: 'user123',
    phoneNumber,
    name: 'Test User',
    birthDate: '19900101',
    birthTime: '120000',
    birthPlace: 'Delhi, India',
    profileComplete: true,
    preferredLanguage: 'en',
    lastInteraction: new Date()
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Set environment variables
    process.env.W1_WHATSAPP_ACCESS_TOKEN = 'test-token';
    process.env.W1_WHATSAPP_PHONE_NUMBER_ID = 'test-phone-id';
  });

  afterEach(() => {
    // Clear environment variables
    delete process.env.W1_WHATSAPP_ACCESS_TOKEN;
    delete process.env.W1_WHATSAPP_PHONE_NUMBER_ID;
  });

  // Mock database functions
  jest.mock('../../../../src/models/userModel', () => ({
    getUserByPhone: jest.fn(),
    createUser: jest.fn(),
    updateUserProfile: jest.fn(),
    getUserSession: jest.fn(),
    deleteUserSession: jest.fn(),
    incrementCompatibilityChecks: jest.fn()
  }));

  const mockUserModel = require('../../../../src/models/userModel');

  // Mock astrology engine
  jest.mock('../../../../src/services/astrology/astrologyEngine', () => ({
    generateAstrologyResponse: jest.fn()
  }));

  const mockAstrologyEngine = require('../../../../src/services/astrology/astrologyEngine');

  // Mock translation service
  jest.mock('../../../../src/services/i18n/TranslationService', () => ({
    translate: jest.fn(),
    detectLanguage: jest.fn()
  }));

  const mockTranslationService = require('../../../../src/services/i18n/TranslationService');

  describe('Message Processing Flow', () => {
    it('should process text message and return astrology response', async() => {
      // Setup mocks
      mockUserModel.getUserByPhone.mockResolvedValue(validUser);
      mockAstrologyEngine.generateAstrologyResponse.mockResolvedValue(
        'Test astrology response'
      );
      mockTranslationService.translate.mockReturnValue('Test translation');

      const message = {
        from: phoneNumber,
        type: 'text',
        text: { body: 'daily horoscope' },
        id: 'msg-123',
        timestamp: Date.now()
      };

      const value = { messaging_product: 'whatsapp' };

      // Mock sendMessage to avoid actual HTTP calls
      const sendMessageMock = jest.fn().mockResolvedValue({ success: true });
      require('../../../../src/services/whatsapp/messageSender').sendMessage =
        sendMessageMock;

      await processIncomingMessage(message, value);

      expect(mockUserModel.getUserByPhone).toHaveBeenCalledWith(phoneNumber);
      expect(
        mockAstrologyEngine.generateAstrologyResponse
      ).toHaveBeenCalledWith('daily horoscope', validUser);
      expect(sendMessageMock).toHaveBeenCalled();
    });

    it('should process interactive button reply', async() => {
      // Setup mocks
      mockUserModel.getUserByPhone.mockResolvedValue(validUser);
      mockTranslationService.translate.mockReturnValue('Menu option selected');

      const message = {
        from: phoneNumber,
        type: 'interactive',
        interactive: {
          type: 'button_reply',
          button_reply: {
            id: 'get_daily_horoscope',
            title: 'Daily Horoscope'
          }
        },
        id: 'msg-456',
        timestamp: Date.now()
      };

      const value = { messaging_product: 'whatsapp' };

      // Mock sendMessage
      const sendMessageMock = jest.fn().mockResolvedValue({ success: true });
      require('../../../../src/services/whatsapp/messageSender').sendMessage =
        sendMessageMock;

      await processIncomingMessage(message, value);

      expect(mockUserModel.getUserByPhone).toHaveBeenCalledWith(phoneNumber);
      expect(sendMessageMock).toHaveBeenCalled();
    });

    it('should process list reply and execute menu action', async() => {
      // Setup mocks
      mockUserModel.getUserByPhone.mockResolvedValue(validUser);
      mockTranslationService.translate.mockReturnValue('Option selected');

      const message = {
        from: phoneNumber,
        type: 'interactive',
        interactive: {
          type: 'list_reply',
          list_reply: {
            id: 'get_daily_horoscope',
            title: 'Daily Horoscope',
            description: 'Get your daily horoscope'
          }
        },
        id: 'msg-789',
        timestamp: Date.now()
      };

      const value = { messaging_product: 'whatsapp' };

      // Mock sendMessage and astrology response
      const sendMessageMock = jest.fn().mockResolvedValue({ success: true });
      require('../../../../src/services/whatsapp/messageSender').sendMessage =
        sendMessageMock;
      mockAstrologyEngine.generateAstrologyResponse.mockResolvedValue(
        'Daily horoscope reading'
      );

      await processIncomingMessage(message, value);

      expect(listActionMapping['get_daily_horoscope']).toBe(
        'get_daily_horoscope'
      );
      expect(sendMessageMock).toHaveBeenCalled();
    });
  });

  describe('Language Handling', () => {
    it('should detect and use appropriate language', async() => {
      // Setup mocks
      mockUserModel.getUserByPhone.mockResolvedValue({
        ...validUser,
        preferredLanguage: 'es'
      });
      mockTranslationService.translate.mockReturnValue('Respuesta traducida');
      mockAstrologyEngine.generateAstrologyResponse.mockResolvedValue(
        'Horóscopo diario'
      );

      const message = {
        from: phoneNumber,
        type: 'text',
        text: { body: 'horóscopo diario' },
        id: 'msg-101',
        timestamp: Date.now()
      };

      // Mock sendMessage
      const sendMessageMock = jest.fn().mockResolvedValue({ success: true });
      require('../../../../src/services/whatsapp/messageSender').sendMessage =
        sendMessageMock;

      await processIncomingMessage(message, { messaging_product: 'whatsapp' });

      expect(mockTranslationService.translate).toHaveBeenCalled();
      expect(sendMessageMock).toHaveBeenCalled();
    });

    it('should fallback to language detection for new users', async() => {
      const newUser = {
        ...validUser,
        _id: 'newUser123',
        preferredLanguage: null
      };

      // Setup mocks
      mockUserModel.getUserByPhone.mockResolvedValue(newUser);
      mockUserModel.createUser.mockResolvedValue(newUser);
      mockTranslationService.detectLanguage.mockReturnValue('en');

      const message = {
        from: phoneNumber,
        type: 'text',
        text: { body: 'hello' },
        id: 'msg-202',
        timestamp: Date.now()
      };

      // Mock sendMessage
      const sendMessageMock = jest.fn().mockResolvedValue({ success: true });
      require('../../../../src/services/whatsapp/messageSender').sendMessage =
        sendMessageMock;

      await processIncomingMessage(message, { messaging_product: 'whatsapp' });

      expect(mockTranslationService.detectLanguage).toHaveBeenCalledWith(
        phoneNumber
      );
    });
  });

  describe('User Profile Validation', () => {
    it('should prompt for incomplete profile', async() => {
      const incompleteUser = {
        ...validUser,
        birthDate: null,
        profileComplete: false
      };

      // Setup mocks
      mockUserModel.getUserByPhone.mockResolvedValue(incompleteUser);
      mockTranslationService.translate.mockReturnValue(
        'Please complete your profile'
      );

      const message = {
        from: phoneNumber,
        type: 'text',
        text: { body: 'horoscope' },
        id: 'msg-303',
        timestamp: Date.now()
      };

      // Mock sendMessage
      const sendMessageMock = jest.fn().mockResolvedValue({ success: true });
      require('../../../../src/services/whatsapp/messageSender').sendMessage =
        sendMessageMock;

      await processIncomingMessage(message, { messaging_product: 'whatsapp' });

      expect(sendMessageMock).toHaveBeenCalled();
      const callArgs = sendMessageMock.mock.calls[0];
      expect(callArgs[1]).toContain('Profile Required');
    });

    it('should process messages for complete profiles', async() => {
      // Setup mocks
      mockUserModel.getUserByPhone.mockResolvedValue(validUser);
      mockAstrologyEngine.generateAstrologyResponse.mockResolvedValue(
        'Valid profile response'
      );

      const message = {
        from: phoneNumber,
        type: 'text',
        text: { body: 'horoscope' },
        id: 'msg-404',
        timestamp: Date.now()
      };

      // Mock sendMessage
      const sendMessageMock = jest.fn().mockResolvedValue({ success: true });
      require('../../../../src/services/whatsapp/messageSender').sendMessage =
        sendMessageMock;

      await processIncomingMessage(message, { messaging_product: 'whatsapp' });

      expect(sendMessageMock).toHaveBeenCalled();
      expect(
        mockAstrologyEngine.generateAstrologyResponse
      ).toHaveBeenCalledWith('horoscope', validUser);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid message structure gracefully', async() => {
      const invalidMessage = { type: 'text' }; // Missing required fields

      await processIncomingMessage(invalidMessage, {});

      expect(logger.warn).toHaveBeenCalledWith(
        '⚠️ Invalid message structure received'
      );
    });

    it('should handle missing environment credentials', async() => {
      // Clear environment variables
      delete process.env.W1_WHATSAPP_ACCESS_TOKEN;
      delete process.env.W1_WHATSAPP_PHONE_NUMBER_ID;

      const message = {
        from: phoneNumber,
        type: 'text',
        text: { body: 'test' },
        id: 'msg-505',
        timestamp: Date.now()
      };

      await processIncomingMessage(message, { messaging_product: 'whatsapp' });

      expect(logger.error).toHaveBeenCalledWith(
        '❌ Missing required WhatsApp environment variables'
      );
    });
  });

  describe('Message Type Dispatching', () => {
    it('should dispatch text messages to text processor', async() => {
      mockUserModel.getUserByPhone.mockResolvedValue(validUser);
      mockAstrologyEngine.generateAstrologyResponse.mockResolvedValue(
        'Text response'
      );

      const message = {
        from: phoneNumber,
        type: 'text',
        text: { body: 'test message' },
        id: 'msg-606',
        timestamp: Date.now()
      };

      const sendMessageMock = jest.fn().mockResolvedValue({ success: true });
      require('../../../../src/services/whatsapp/messageSender').sendMessage =
        sendMessageMock;

      await processIncomingMessage(message, { messaging_product: 'whatsapp' });

      expect(sendMessageMock).toHaveBeenCalled();
    });

    it('should dispatch interactive messages to interactive processor', async() => {
      mockUserModel.getUserByPhone.mockResolvedValue(validUser);

      const message = {
        from: phoneNumber,
        type: 'interactive',
        interactive: {
          type: 'button_reply',
          button_reply: { id: 'test_action', title: 'Test' }
        },
        id: 'msg-707',
        timestamp: Date.now()
      };

      const sendMessageMock = jest.fn().mockResolvedValue({ success: true });
      require('../../../../src/services/whatsapp/messageSender').sendMessage =
        sendMessageMock;

      await processIncomingMessage(message, { messaging_product: 'whatsapp' });

      expect(sendMessageMock).toHaveBeenCalled();
    });

    it('should handle unknown message types', async() => {
      mockUserModel.getUserByPhone.mockResolvedValue(validUser);

      const message = {
        from: phoneNumber,
        type: 'unknown',
        id: 'msg-808',
        timestamp: Date.now()
      };

      const sendMessageMock = jest.fn().mockResolvedValue({ success: true });
      require('../../../../src/services/whatsapp/messageSender').sendMessage =
        sendMessageMock;

      await processIncomingMessage(message, { messaging_product: 'whatsapp' });

      expect(logger.warn).toHaveBeenCalledWith(
        '⚠️ Unsupported message type: unknown'
      );
    });
  });
});
