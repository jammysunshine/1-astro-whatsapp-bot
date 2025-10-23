// tests/unit/services/whatsapp/messageProcessor.test.js
// Unit tests for WhatsApp message processor with 95%+ coverage

const {
  processUserMessage,
  generateAstrologyResponse,
  isGreeting,
  getGreetingWithOnboarding,
  getGreeting,
  getHelpMessage,
  getProfileSetupMessage,
  getDailyHoroscopeMessage,
  getCompatibilityMessage,
  getKundliMessage,
  getSubscriptionMessage,
  getGeneralAstrologyResponse,
  getDefaultResponse
} = require('../../../src/services/whatsapp/messageProcessor');
const { getUserByPhone, createUser } = require('../../../src/models/userModel');
const { sendTextMessage } = require('../../../src/services/whatsapp/messageSender');
const { generateAstrologyResponse: astrologyEngineResponse } = require('../../../src/services/astrology/astrologyEngine');
const logger = require('../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../src/models/userModel');
jest.mock('../../../src/services/whatsapp/messageSender');
jest.mock('../../../src/services/astrology/astrologyEngine');
jest.mock('../../../src/utils/logger');

describe('WhatsApp Message Processor', () => {
  const phoneNumber = '1234567890';
  const messageId = 'msg-123';
  const timestamp = '1234567890';

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('processUserMessage', () => {
    it('should create new user if not found and process message', async () => {
      getUserByPhone.mockResolvedValue(null);
      createUser.mockResolvedValue({
        id: 'user-123',
        phoneNumber: phoneNumber,
        birthDate: null
      });
      generateAstrologyResponse.mockResolvedValue('Welcome to your Personal Cosmic Coach!');
      sendTextMessage.mockResolvedValue({ success: true });

      await processUserMessage(phoneNumber, 'Hello', messageId, timestamp);

      expect(createUser).toHaveBeenCalledWith(phoneNumber);
      expect(generateAstrologyResponse).toHaveBeenCalled();
      expect(sendTextMessage).toHaveBeenCalledWith(phoneNumber, 'Welcome to your Personal Cosmic Coach!');
      expect(logger.info).toHaveBeenCalledWith(`Processing message from ${phoneNumber}: Hello`);
    });

    it('should process message for existing user', async () => {
      const existingUser = {
        id: 'user-123',
        phoneNumber: phoneNumber,
        birthDate: '15/03/1990'
      };
      
      getUserByPhone.mockResolvedValue(existingUser);
      generateAstrologyResponse.mockResolvedValue('Welcome back!');
      sendTextMessage.mockResolvedValue({ success: true });

      await processUserMessage(phoneNumber, 'Hi again', messageId, timestamp);

      expect(getUserByPhone).toHaveBeenCalledWith(phoneNumber);
      expect(generateAstrologyResponse).toHaveBeenCalled();
      expect(sendTextMessage).toHaveBeenCalledWith(phoneNumber, 'Welcome back!');
    });

    it('should handle error during message processing', async () => {
      getUserByPhone.mockRejectedValue(new Error('Database error'));
      sendTextMessage.mockResolvedValue({ success: true });

      await processUserMessage(phoneNumber, 'Hello', messageId, timestamp);

      expect(logger.error).toHaveBeenCalledWith(`Error processing message from ${phoneNumber}:`, expect.any(Error));
      expect(sendTextMessage).toHaveBeenCalledWith(
        phoneNumber,
        'Sorry, I encountered an error processing your message. Please try again.'
      );
    });

    it('should handle error during error message sending', async () => {
      getUserByPhone.mockRejectedValue(new Error('Database error'));
      sendTextMessage.mockRejectedValue(new Error('Send error'));

      await processUserMessage(phoneNumber, 'Hello', messageId, timestamp);

      expect(logger.error).toHaveBeenCalledWith(`Error processing message from ${phoneNumber}:`, expect.any(Error));
      expect(logger.error).toHaveBeenCalledWith(`Error sending error message to ${phoneNumber}:`, expect.any(Error));
    });
  });

  describe('generateAstrologyResponse', () => {
    const userWithoutBirthDate = { phoneNumber: phoneNumber, birthDate: null };
    const userWithBirthDate = { phoneNumber: phoneNumber, birthDate: '15/03/1990' };

    it('should generate greeting response for greeting message without birth date', async () => {
      const response = await generateAstrologyResponse('Hi there', userWithoutBirthDate);
      expect(response).toContain('Welcome to your Personal Cosmic Coach');
      expect(response).toContain('profile details');
    });

    it('should generate greeting response for greeting message with birth date', async () => {
      const response = await generateAstrologyResponse('Hello', userWithBirthDate);
      expect(response).toContain('Welcome back to your Personal Cosmic Coach');
      expect(response).toContain('ready to explore');
    });

    it('should generate help message for help requests', async () => {
      const response = await generateAstrologyResponse('help me', userWithBirthDate);
      expect(response).toContain('*Available Services*');
      expect(response).toContain('Free Services');
      expect(response).toContain('Premium Services');
    });

    it('should generate profile setup message for profile requests', async () => {
      const response = await generateAstrologyResponse('show me my profile', userWithBirthDate);
      expect(response).toContain('*Profile Setup*');
      expect(response).toContain('birth details');
    });

    it('should generate daily horoscope message for daily requests', async () => {
      const response = await generateAstrologyResponse('daily horoscope', userWithBirthDate);
      expect(response).toContain('*Your Daily Cosmic Forecast');
      expect(response).toContain('Based on your chart');
    });

    it('should generate compatibility message for compatibility requests', async () => {
      const response = await generateAstrologyResponse('check compatibility', userWithBirthDate);
      expect(response).toContain('*Compatibility Matching*');
      expect(response).toContain('check astrological compatibility');
    });

    it('should generate kundli message for kundli requests', async () => {
      const response = await generateAstrologyResponse('my kundli', userWithBirthDate);
      expect(response).toContain('*Your Personal Birth Chart*');
      expect(response).toContain('birth chart visualization');
    });

    it('should generate subscription message for subscription requests', async () => {
      const response = await generateAstrologyResponse('subscription plans', userWithBirthDate);
      expect(response).toContain('*Subscription Plans*');
      expect(response).toContain('Free Tier');
      expect(response).toContain('Essential Tier');
      expect(response).toContain('Premium Tier');
      expect(response).toContain('VIP Tier');
    });

    it('should generate general astrology response for question marks', async () => {
      const response = await generateAstrologyResponse('What should I do?', userWithBirthDate);
      expect(response).toContain('*Cosmic Insights*');
      expect(response).toContain('personalized guidance');
    });

    it('should generate default response for general messages', async () => {
      const response = await generateAstrologyResponse('random message', userWithBirthDate);
      expect(response).toContain('*Personal Cosmic Coach*');
      expect(response).toContain('trusted guide');
    });
  });

  describe('isGreeting', () => {
    it('should return true for greeting messages', () => {
      expect(isGreeting('hi')).toBe(true);
      expect(isGreeting('hello')).toBe(true);
      expect(isGreeting('good morning')).toBe(true);
      expect(isGreeting('namaste')).toBe(true);
    });

    it('should return false for non-greeting messages', () => {
      expect(isGreeting('what is my horoscope')).toBe(false);
      expect(isGreeting('help me')).toBe(false);
      expect(isGreeting('daily prediction')).toBe(false);
    });
  });

  describe('getGreetingWithOnboarding', () => {
    it('should return onboarding greeting for new users', () => {
      const greeting = getGreetingWithOnboarding({ phoneNumber: phoneNumber });
      expect(greeting).toContain('Welcome to your Personal Cosmic Coach');
      expect(greeting).toContain('birth details');
      expect(greeting).toContain('profile details');
    });
  });

  describe('getGreeting', () => {
    it('should return welcome back greeting for existing users', () => {
      const greeting = getGreeting({ phoneNumber: phoneNumber });
      expect(greeting).toContain('Welcome back to your Personal Cosmic Coach');
      expect(greeting).toContain('ready to explore');
    });
  });

  describe('getHelpMessage', () => {
    it('should return comprehensive help message', () => {
      const helpMessage = getHelpMessage();
      expect(helpMessage).toContain('*Available Services*');
      expect(helpMessage).toContain('Free Services');
      expect(helpMessage).toContain('Premium Services');
      expect(helpMessage).toContain('Astro Twin');
    });
  });

  describe('getProfileSetupMessage', () => {
    it('should return profile setup instructions', () => {
      const profileMessage = getProfileSetupMessage();
      expect(profileMessage).toContain('*Profile Setup*');
      expect(profileMessage).toContain('birth details');
      expect(profileMessage).toContain('privacy');
    });
  });

  describe('getDailyHoroscopeMessage', () => {
    it('should prompt for birth details if not provided', () => {
      const horoscopeMessage = getDailyHoroscopeMessage({ phoneNumber: phoneNumber, birthDate: null });
      expect(horoscopeMessage).toContain('personalized daily horoscope');
      expect(horoscopeMessage).toContain('birth details first');
    });

    it('should return daily horoscope for users with birth details', () => {
      const horoscopeMessage = getDailyHoroscopeMessage({ phoneNumber: phoneNumber, birthDate: '15/03/1990' });
      expect(horoscopeMessage).toContain('*Your Daily Cosmic Forecast');
      expect(horoscopeMessage).toContain('Based on your chart');
    });
  });

  describe('getCompatibilityMessage', () => {
    it('should return compatibility checking instructions', () => {
      const compatibilityMessage = getCompatibilityMessage();
      expect(compatibilityMessage).toContain('*Compatibility Matching*');
      expect(compatibilityMessage).toContain('check astrological compatibility');
    });
  });

  describe('getKundliMessage', () => {
    it('should return kundli generation instructions', () => {
      const kundliMessage = getKundliMessage();
      expect(kundliMessage).toContain('*Your Personal Birth Chart*');
      expect(kundliMessage).toContain('birth chart visualization');
    });
  });

  describe('getSubscriptionMessage', () => {
    it('should return subscription plan information', () => {
      const subscriptionMessage = getSubscriptionMessage();
      expect(subscriptionMessage).toContain('*Subscription Plans*');
      expect(subscriptionMessage).toContain('Free Tier');
      expect(subscriptionMessage).toContain('Essential Tier');
      expect(subscriptionMessage).toContain('Premium Tier');
      expect(subscriptionMessage).toContain('VIP Tier');
    });
  });

  describe('getGeneralAstrologyResponse', () => {
    it('should return general astrology information', () => {
      const generalResponse = getGeneralAstrologyResponse({ phoneNumber: phoneNumber });
      expect(generalResponse).toContain('*Cosmic Insights*');
      expect(generalResponse).toContain('personalized guidance');
    });
  });

  describe('getDefaultResponse', () => {
    it('should return default welcome message', () => {
      const defaultResponse = getDefaultResponse({ phoneNumber: phoneNumber });
      expect(defaultResponse).toContain('*Personal Cosmic Coach*');
      expect(defaultResponse).toContain('trusted guide');
    });
  });
});