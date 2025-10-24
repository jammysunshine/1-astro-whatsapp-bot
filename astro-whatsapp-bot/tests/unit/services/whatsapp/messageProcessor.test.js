// tests/unit/services/whatsapp/messageProcessor.test.js
// Unit tests for WhatsApp message processor service

const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');
const { sendMessage } = require('../../../src/services/whatsapp/messageSender');
const { getUserByPhone, createUser } = require('../../../src/models/userModel');
const { generateAstrologyResponse } = require('../../../src/services/astrology/astrologyEngine');
const logger = require('../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../src/services/whatsapp/messageSender');
jest.mock('../../../src/models/userModel');
jest.mock('../../../src/services/astrology/astrologyEngine');
jest.mock('../../../src/utils/logger');

describe('WhatsApp Message Processor', () => {
  let message, value;

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
      contacts: [{
        profile: { name: 'John Doe' },
        wa_id: '1234567890'
      }]
    };
  });

  describe('processIncomingMessage', () => {
    it('should create new user for unknown phone number', async () => {
      getUserByPhone.mockResolvedValue(null);
      createUser.mockResolvedValue({ id: 'user-123', phoneNumber: '1234567890' });
      generateAstrologyResponse.mockResolvedValue('Welcome to your Personal Cosmic Coach!');
      sendMessage.mockResolvedValue({ success: true });
      
      await processIncomingMessage(message, value);
      
      expect(getUserByPhone).toHaveBeenCalledWith('1234567890');
      expect(createUser).toHaveBeenCalledWith('1234567890');
      expect(generateAstrologyResponse).toHaveBeenCalledWith('Hello, astrologer!', { id: 'user-123', phoneNumber: '1234567890' });
      expect(sendMessage).toHaveBeenCalledWith('1234567890', 'Welcome to your Personal Cosmic Coach!');
    });

    it('should process existing user message', async () => {
      const existingUser = { id: 'user-456', phoneNumber: '1234567890', birthDate: '15/03/1990' };
      getUserByPhone.mockResolvedValue(existingUser);
      generateAstrologyResponse.mockResolvedValue('Your personalized daily horoscope!');
      sendMessage.mockResolvedValue({ success: true });
      
      await processIncomingMessage(message, value);
      
      expect(getUserByPhone).toHaveBeenCalledWith('1234567890');
      expect(createUser).not.toHaveBeenCalled();
      expect(generateAstrologyResponse).toHaveBeenCalledWith('Hello, astrologer!', existingUser);
      expect(sendMessage).toHaveBeenCalledWith('1234567890', 'Your personalized daily horoscope!');
    });

    it('should handle text messages correctly', async () => {
      const existingUser = { id: 'user-789', phoneNumber: '1234567890' };
      getUserByPhone.mockResolvedValue(existingUser);
      generateAstrologyResponse.mockResolvedValue('Text message response');
      sendMessage.mockResolvedValue({ success: true });
      
      message.type = 'text';
      message.text = { body: 'What is my daily horoscope?' };
      
      await processIncomingMessage(message, value);
      
      expect(generateAstrologyResponse).toHaveBeenCalledWith('What is my daily horoscope?', existingUser);
    });

    it('should handle interactive button replies', async () => {
      const existingUser = { id: 'user-101', phoneNumber: '1234567890' };
      getUserByPhone.mockResolvedValue(existingUser);
      generateAstrologyResponse.mockResolvedValue('Button reply response');
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
      
      expect(generateAstrologyResponse).toHaveBeenCalledWith('Daily Horoscope', existingUser);
    });

    it('should handle interactive list replies', async () => {
      const existingUser = { id: 'user-102', phoneNumber: '1234567890' };
      getUserByPhone.mockResolvedValue(existingUser);
      generateAstrologyResponse.mockResolvedValue('List reply response');
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
      
      expect(generateAstrologyResponse).toHaveBeenCalledWith('Check Compatibility', existingUser);
    });

    it('should handle button messages', async () => {
      const existingUser = { id: 'user-103', phoneNumber: '1234567890' };
      getUserByPhone.mockResolvedValue(existingUser);
      generateAstrologyResponse.mockResolvedValue('Button message response');
      sendMessage.mockResolvedValue({ success: true });
      
      message.type = 'button';
      message.button = {
        payload: 'daily_horoscope_payload',
        text: 'Daily Horoscope'
      };
      
      await processIncomingMessage(message, value);
      
      expect(generateAstrologyResponse).toHaveBeenCalledWith('daily_horoscope_payload', existingUser);
    });

    it('should handle media messages', async () => {
      const existingUser = { id: 'user-104', phoneNumber: '1234567890' };
      getUserByPhone.mockResolvedValue(existingUser);
      sendMessage.mockResolvedValue({ success: true });
      
      message.type = 'image';
      message.image = {
        id: 'image-id-123',
        caption: 'My birth chart'
      };
      
      await processIncomingMessage(message, value);
      
      expect(sendMessage).toHaveBeenCalledWith('1234567890', expect.stringContaining('Thank you for sending that image'));
    });

    it('should handle unsupported message types gracefully', async () => {
      const existingUser = { id: 'user-105', phoneNumber: '1234567890' };
      getUserByPhone.mockResolvedValue(existingUser);
      sendMessage.mockResolvedValue({ success: true });
      
      message.type = 'unsupported';
      
      await processIncomingMessage(message, value);
      
      expect(sendMessage).toHaveBeenCalledWith('1234567890', expect.stringContaining("I'm sorry, I don't support that type of message yet"));
    });

    it('should handle errors gracefully', async () => {
      getUserByPhone.mockRejectedValue(new Error('Database error'));
      sendMessage.mockResolvedValue({ success: true });
      
      await processIncomingMessage(message, value);
      
      expect(sendMessage).toHaveBeenCalledWith('1234567890', expect.stringContaining("I'm sorry, I encountered an error processing your message"));
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error processing message from 1234567890:'), expect.any(Error));
    });
  });
});