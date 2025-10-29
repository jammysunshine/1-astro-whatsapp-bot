const MessageCoordinator = require('../../../../../src/services/whatsapp/MessageCoordinator');
const { getUserByPhone, createUser, updateUserProfile } = require('../../../../../src/models/userModel');
const { processFlowMessage } = require('../../../../../src/conversation/conversationEngine');

// Mock external services and databases
jest.mock('../../../../../src/services/whatsapp/processors/TextMessageProcessor');
jest.mock('../../../../../src/services/whatsapp/processors/InteractiveMessageProcessor');
jest.mock('../../../../../src/services/whatsapp/processors/MediaMessageProcessor');
jest.mock('../../../../../src/models/userModel');
jest.mock('../../../../../src/conversation/conversationEngine');
jest.mock('../../../../../src/utils/logger');
jest.mock('../../../../../src/services/whatsapp/messageSender');

describe('MessageCoordinator Integration Tests', () => {
  let coordinator;
  let mockSendMessage;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock external dependencies
    mockSendMessage = require('../../../../../src/services/whatsapp/messageSender').sendMessage;
    mockSendMessage.mockResolvedValue(null);

    // Setup environment variables
    process.env.W1_WHATSAPP_ACCESS_TOKEN = 'test_token';
    process.env.W1_WHATSAPP_PHONE_NUMBER_ID = 'test_id';

    // Create fresh coordinator instance
    coordinator = new MessageCoordinator();
  });

  afterEach(() => {
    // Clean up environment
    delete process.env.W1_WHATSAPP_ACCESS_TOKEN;
    delete process.env.W1_WHATSAPP_PHONE_NUMBER_ID;
  });

  describe('End-to-End Message Processing', () => {
    beforeEach(() => {
      // Setup consistent mock behaviors
      getUserByPhone.mockResolvedValue({
        id: 'test_user',
        profileComplete: true,
        preferredLanguage: 'en',
        name: 'John Doe',
        birthDate: '15061990',
        birthTime: '1430',
        birthPlace: 'Mumbai, India'
      });

      updateUserProfile.mockResolvedValue(null);
    });

    test('should handle daily horoscope request from existing user', async() => {
      // Arrange
      const message = {
        type: 'text',
        from: '+1234567890',
        id: 'msg_123',
        timestamp: Date.now().toString(),
        text: { body: 'horoscope' }
      };
      const value = { entry: [{ id: 'entry_1' }] };

      // Mock text processor to simulate successful processing
      const mockTextProcessor = coordinator.textProcessor;
      mockTextProcessor.process.mockResolvedValue(null);

      // Act
      await coordinator.processIncomingMessage(message, value);

      // Assert
      expect(getUserByPhone).toHaveBeenCalledWith('+1234567890');
      expect(mockTextProcessor.process).toHaveBeenCalledWith(message, expect.any(Object), '+1234567890');
      expect(updateUserProfile).toHaveBeenCalledWith('+1234567890', expect.objectContaining({
        lastInteraction: expect.any(Date)
      }));
    });

    test('should handle interactive button response', async() => {
      // Arrange
      const message = {
        type: 'interactive',
        from: '+1234567890',
        id: 'msg_456',
        timestamp: Date.now().toString(),
        interactive: {
          type: 'button_reply',
          button_reply: {
            id: 'show_birth_chart',
            title: '📊 Birth Chart'
          }
        }
      };
      const value = { entry: [{ id: 'entry_2' }] };

      // Mock interactive processor
      const mockInteractiveProcessor = coordinator.interactiveProcessor;
      mockInteractiveProcessor.process.mockResolvedValue(null);

      // Act
      await coordinator.processIncomingMessage(message, value);

      // Assert
      expect(mockInteractiveProcessor.process).toHaveBeenCalledWith(message, expect.any(Object), '+1234567890');
    });

    test('should handle media message upload', async() => {
      // Arrange
      const message = {
        type: 'image',
        from: '+1234567890',
        id: 'msg_789',
        timestamp: Date.now().toString(),
        image: {
          id: 'img_123',
          mime_type: 'image/jpeg',
          caption: 'palm reading'
        }
      };
      const value = { entry: [{ id: 'entry_3' }] };

      // Mock media processor
      const mockMediaProcessor = coordinator.mediaProcessor;
      mockMediaProcessor.process.mockResolvedValue(null);

      // Act
      await coordinator.processIncomingMessage(message, value);

      // Assert
      expect(mockMediaProcessor.process).toHaveBeenCalledWith(message, expect.any(Object), '+1234567890');
    });

    test('should handle new user onboarding flow', async() => {
      // Arrange
      getUserByPhone.mockResolvedValueOnce(null);
      createUser.mockResolvedValue({
        id: 'new_user_123',
        profileComplete: false,
        isNew: true
      });

      const message = {
        type: 'text',
        from: '+1234567890',
        id: 'msg_new',
        timestamp: Date.now().toString(),
        text: { body: 'hello' }
      };
      const value = { entry: [{ id: 'entry_4' }] };

      processFlowMessage.mockResolvedValue(null);

      // Act
      await coordinator.processIncomingMessage(message, value);

      // Assert
      expect(createUser).toHaveBeenCalledWith('+1234567890');
      expect(processFlowMessage).toHaveBeenCalledWith(message, expect.objectContaining({
        profileComplete: false,
        isNew: true
      }), 'onboarding');

      // Should not process further for incomplete users
      expect(coordinator.textProcessor.process).not.toHaveBeenCalled();
    });

    test('should handle unsupported message types gracefully', async() => {
      // Arrange
      const message = {
        type: 'unsupported_type',
        from: '+1234567890',
        id: 'msg_unsupported',
        timestamp: Date.now().toString()
      };
      const value = { entry: [{ id: 'entry_5' }] };

      const mockLogger = require('../../../../../src/utils/logger');
      mockLogger.warn = jest.fn();

      // Mock sendMessage since unsupported message handling uses it
      mockSendMessage.mockResolvedValue(null);

      // Act
      await coordinator.processIncomingMessage(message, value);

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith('⚠️ Unsupported message type: unsupported_type');
      expect(mockSendMessage).toHaveBeenCalledWith('+1234567890', expect.stringContaining('not support that message type'), 'text');
    });
  });

  describe('Error Handling Integration', () => {
    beforeEach(() => {
      mockSendMessage.mockResolvedValue(null);
    });

    test('should handle database connection errors gracefully', async() => {
      // Arrange
      getUserByPhone.mockRejectedValue(new Error('Database connection failed'));

      const message = {
        type: 'text',
        from: '+1234567890',
        id: 'msg_error',
        timestamp: Date.now().toString(),
        text: { body: 'horoscope' }
      };

      // Act & Assert
      await expect(coordinator.processIncomingMessage(message, {}))
        .resolves.not.toThrow();

      expect(mockSendMessage).toHaveBeenCalledWith('+1234567890',
        expect.stringContaining('unexpected error'), 'text');
    });

    test('should handle processor errors and continue processing', async() => {
      // Arrange
      const mockTextProcessor = coordinator.textProcessor;
      mockTextProcessor.process.mockRejectedValue(new Error('Processor failed'));

      const message = {
        type: 'text',
        from: '+1234567890',
        id: 'msg_proc_error',
        timestamp: Date.now().toString(),
        text: { body: 'test' }
      };

      // Act
      await coordinator.processIncomingMessage(message, {});

      // Assert
      expect(updateUserProfile).toHaveBeenCalled(); // Should still update timestamp
      expect(mockSendMessage).toHaveBeenCalled(); // Should send error message
    });

    test('should handle missing environment variables', async() => {
      // Arrange
      delete process.env.W1_WHATSAPP_ACCESS_TOKEN;

      const mockLogger = require('../../../../../src/utils/logger');
      mockLogger.error = jest.fn();

      const message = {
        type: 'text',
        from: '+1234567890',
        id: 'msg_env_error',
        timestamp: Date.now().toString(),
        text: { body: 'test' }
      };

      // Act
      await coordinator.processIncomingMessage(message, {});

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith('❌ Missing required WhatsApp environment variables');
    });
  });

  describe('User Session Management', () => {
    beforeEach(() => {
      mockSendMessage.mockResolvedValue(null);
    });

    test('should update user interaction timestamp', async() => {
      // Arrange
      const message = {
        type: 'text',
        from: '+1234567890',
        id: 'msg_timestamp',
        timestamp: Date.now().toString(),
        text: { body: 'menu' }
      };

      coordinator.textProcessor.process.mockResolvedValue(null);

      // Act
      await coordinator.processIncomingMessage(message, {});

      // Assert
      expect(updateUserProfile).toHaveBeenCalledWith('+1234567890', expect.objectContaining({
        lastInteraction: expect.any(Date)
      }));
    });

    test('should handle user lookup errors', async() => {
      // Arrange
      getUserByPhone.mockRejectedValue(new Error('User lookup failed'));

      const message = {
        type: 'text',
        from: '+1234567890',
        id: 'msg_user_error',
        timestamp: Date.now().toString(),
        text: { body: 'test' }
      };

      // Act & Assert
      await expect(coordinator.processIncomingMessage(message, {}))
        .resolves.not.toThrow();

      expect(mockSendMessage).toHaveBeenCalled(); // Should send error response
    });
  });

  describe('Message Routing', () => {
    beforeEach(() => {
      mockSendMessage.mockResolvedValue(null);
    });

    test('should route text messages correctly', async() => {
      // Arrange
      const message = {
        type: 'text',
        from: '+1234567890',
        id: 'msg_text',
        timestamp: Date.now().toString(),
        text: { body: 'daily horoscope' }
      };

      // Act
      await coordinator.processIncomingMessage(message, {});

      // Assert
      expect(coordinator.textProcessor.process).toHaveBeenCalledWith(message, expect.any(Object), '+1234567890');
      expect(coordinator.interactiveProcessor.process).not.toHaveBeenCalled();
      expect(coordinator.mediaProcessor.process).not.toHaveBeenCalled();
    });

    test('should route interactive messages correctly', async() => {
      // Arrange
      const message = {
        type: 'interactive',
        from: '+1234567890',
        id: 'msg_interactive',
        timestamp: Date.now().toString(),
        interactive: { type: 'list_reply' }
      };

      // Act
      await coordinator.processIncomingMessage(message, {});

      // Assert
      expect(coordinator.interactiveProcessor.process).toHaveBeenCalledWith(message, expect.any(Object), '+1234567890');
      expect(coordinator.textProcessor.process).not.toHaveBeenCalled();
      expect(coordinator.mediaProcessor.process).not.toHaveBeenCalled();
    });

    test('should route media messages correctly', async() => {
      // Arrange
      const message = {
        type: 'image',
        from: '+1234567890',
        id: 'msg_media',
        timestamp: Date.now().toString(),
        image: { id: 'img_123' }
      };

      // Act
      await coordinator.processIncomingMessage(message, {});

      // Assert
      expect(coordinator.mediaProcessor.process).toHaveBeenCalledWith(message, expect.any(Object), '+1234567890');
      expect(coordinator.textProcessor.process).not.toHaveBeenCalled();
      expect(coordinator.interactiveProcessor.process).not.toHaveBeenCalled();
    });

    test('should route button messages correctly', async() => {
      // Arrange
      const message = {
        type: 'button',
        from: '+1234567890',
        id: 'msg_button',
        timestamp: Date.now().toString(),
        button: { payload: 'test_action' }
      };

      // Act
      await coordinator.processIncomingMessage(message, {});

      // Assert - Button messages are handled by InteractiveMessageProcessor's processButtonMessage
      expect(coordinator.interactiveProcessor.processButtonMessage).toHaveBeenCalledWith(message, expect.any(Object), '+1234567890');
      expect(coordinator.textProcessor.process).not.toHaveBeenCalled();
      expect(coordinator.mediaProcessor.process).not.toHaveBeenCalled();
    });
  });

  describe('System Health and Monitoring', () => {
    test('should provide system statistics', () => {
      // Act
      const stats = coordinator.getStats();

      // Assert
      expect(stats).toHaveProperty('processors');
      expect(stats).toHaveProperty('registry');
      expect(stats.processors).toEqual({
        text: 'TextMessageProcessor',
        interactive: 'InteractiveMessageProcessor',
        media: 'MediaMessageProcessor'
      });
    });

    test('should perform health checks', () => {
      // Act
      const health = coordinator.healthCheck();

      // Assert
      expect(health).toHaveProperty('healthy');
      expect(health).toHaveProperty('registry');
      expect(health).toHaveProperty('processors');
      expect(health.healthy).toBe(true);
    });

    test('should detect health issues', () => {
      // Temporarily break a processor
      const originalProcess = coordinator.textProcessor.process;
      delete coordinator.textProcessor.process;

      const health = coordinator.healthCheck();

      expect(health.healthy).toBe(false);

      // Restore
      coordinator.textProcessor.process = originalProcess;
    });
  });

  describe('Performance and Scaling', () => {
    test('should handle rapid successive messages', async() => {
      // Arrange
      const message = {
        type: 'text',
        from: '+1234567890',
        id: 'msg_perf',
        timestamp: Date.now().toString(),
        text: { body: 'test' }
      };

      coordinator.textProcessor.process.mockResolvedValue(null);

      // Act - Send multiple messages rapidly
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(coordinator.processIncomingMessage({ ...message, id: `msg_${i}` }, {}));
      }

      await Promise.all(promises);

      // Assert - All messages should be processed
      expect(coordinator.textProcessor.process).toHaveBeenCalledTimes(10);
      expect(updateUserProfile).toHaveBeenCalledTimes(10);
    });

    test('should handle different user loads', async() => {
      // Arrange
      const users = ['+1111111111', '+2222222222', '+3333333333'];
      const messages = users.map(phone => ({
        type: 'text',
        from: phone,
        id: `msg_${phone}`,
        timestamp: Date.now().toString(),
        text: { body: 'menu' }
      }));

      // Setup different user responses
      getUserByPhone.mockImplementation(phone => {
        const userIndex = users.indexOf(phone);
        return Promise.resolve({
          id: `user_${userIndex}`,
          profileComplete: true,
          preferredLanguage: 'en',
          name: `User ${userIndex}`
        });
      });

      coordinator.textProcessor.process.mockResolvedValue(null);

      // Act
      await Promise.all(messages.map((msg, index) =>
        coordinator.processIncomingMessage(msg, { entry: [{ id: `entry_${index}` }] })
      ));

      // Assert
      expect(getUserByPhone).toHaveBeenCalledTimes(3);
      expect(updateUserProfile).toHaveBeenCalledTimes(3);
    });
  });
});
