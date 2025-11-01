const MessageCoordinator = require('../../../../src/services/whatsapp/MessageCoordinator');
const TextMessageProcessor = require('../../../../src/services/whatsapp/processors/TextMessageProcessor');
const InteractiveMessageProcessor = require('../../../../src/services/whatsapp/processors/InteractiveMessageProcessor');
const MediaMessageProcessor = require('../../../../src/services/whatsapp/processors/MediaMessageProcessor');

// Mock dependencies
jest.mock('../../../../src/services/whatsapp/processors/TextMessageProcessor');
jest.mock(
  '../../../../src/services/whatsapp/processors/InteractiveMessageProcessor'
);
jest.mock('../../../../src/services/whatsapp/processors/MediaMessageProcessor');
jest.mock('../../../../src/utils/logger');
jest.mock('../../../../src/models/userModel');
jest.mock('../../../../src/conversation/conversationEngine');

describe('MessageCoordinator', () => {
  let coordinator;
  let mockTextProcessor;
  let mockInteractiveProcessor;
  let mockMediaProcessor;
  let mockUserModel;
  let mockFlowEngine;
  let mockLogger;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock instances
    mockTextProcessor = {
      process: jest.fn(),
      constructor: { name: 'TextMessageProcessor' }
    };

    mockInteractiveProcessor = {
      process: jest.fn(),
      processButtonMessage: jest.fn(),
      constructor: { name: 'InteractiveMessageProcessor' }
    };

    mockMediaProcessor = {
      process: jest.fn(),
      constructor: { name: 'MediaMessageProcessor' }
    };

    // Mock constructors
    TextMessageProcessor.mockImplementation(() => mockTextProcessor);
    InteractiveMessageProcessor.mockImplementation(
      () => mockInteractiveProcessor
    );
    MediaMessageProcessor.mockImplementation(() => mockMediaProcessor);

    // Mock other modules
    mockUserModel = require('../../../../src/models/userModel');
    mockFlowEngine = require('../../../../src/conversation/conversationEngine');
    mockLogger = require('../../../../src/utils/logger');

    // Configure environment
    process.env.W1_WHATSAPP_ACCESS_TOKEN = 'test_token';
    process.env.W1_WHATSAPP_PHONE_NUMBER_ID = 'test_id';

    // Create coordinator instance
    coordinator = new MessageCoordinator();
  });

  afterEach(() => {
    // Clean up environment
    delete process.env.W1_WHATSAPP_ACCESS_TOKEN;
    delete process.env.W1_WHATSAPP_PHONE_NUMBER_ID;
  });

  describe('Initialization', () => {
    test('should initialize with all processors', () => {
      expect(TextMessageProcessor).toHaveBeenCalled();
      expect(InteractiveMessageProcessor).toHaveBeenCalledWith(
        coordinator.registry
      );
      expect(MediaMessageProcessor).toHaveBeenCalled();

      expect(mockLogger.info).toHaveBeenCalledWith(
        '🎯 MessageCoordinator initialized with Strategy pattern'
      );
    });

    test('should have registry instance', () => {
      expect(coordinator.registry).toBeDefined();
      expect(typeof coordinator.registry.getAction).toBe('function');
    });
  });

  describe('validateMessage', () => {
    test('should validate environment variables', async() => {
      const message = { type: 'text', from: '+1234567890' };
      const phoneNumber = '+1234567890';

      const result = await coordinator.validateMessage(message, phoneNumber);
      expect(result).toBeUndefined(); // Should not throw
    });

    test('should reject invalid message structure', async() => {
      const message = null;
      const phoneNumber = null;

      await expect(
        coordinator.validateMessage(message, phoneNumber)
      ).resolves.toBe(false);
    });

    test('should reject missing environment variables', async() => {
      // Temporarily clear environment
      delete process.env.W1_WHATSAPP_ACCESS_TOKEN;

      const message = { type: 'text', from: '+1234567890' };
      const phoneNumber = '+1234567890';

      const result = await coordinator.validateMessage(message, phoneNumber);
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        '❌ Missing required WhatsApp environment variables'
      );
    });
  });

  describe('handleUserOnboarding', () => {
    beforeEach(() => {
      mockUserModel.getUserByPhone = jest.fn();
      mockUserModel.createUser = jest.fn();
      mockFlowEngine.processFlowMessage = jest.fn();
    });

    test('should return true for existing complete users', async() => {
      const user = { id: '1', profileComplete: true, isNew: false };
      const message = { type: 'text' };

      const result = await coordinator.handleUserOnboarding(
        message,
        user,
        '+123'
      );
      expect(result).toBe(true);
      expect(mockFlowEngine.processFlowMessage).not.toHaveBeenCalled();
    });

    test('should handle onboarding for new users', async() => {
      const user = { id: '1', profileComplete: false, isNew: true };
      const message = { type: 'text' };

      mockFlowEngine.processFlowMessage.mockResolvedValue(null);

      const result = await coordinator.handleUserOnboarding(
        message,
        user,
        '+123'
      );
      expect(result).toBe(false); // Should stop processing
      expect(mockFlowEngine.processFlowMessage).toHaveBeenCalledWith(
        message,
        user,
        'onboarding'
      );
    });

    test('should handle onboarding for incomplete profiles', async() => {
      const user = { id: '1', profileComplete: false, isNew: false };
      const message = { type: 'text' };

      mockFlowEngine.processFlowMessage.mockResolvedValue(null);

      const result = await coordinator.handleUserOnboarding(
        message,
        user,
        '+123'
      );
      expect(result).toBe(false);
      expect(mockFlowEngine.processFlowMessage).toHaveBeenCalledWith(
        message,
        user,
        'onboarding'
      );
    });
  });

  describe('routeToProcessor', () => {
    beforeEach(() => {
      mockUserModel.getUserByPhone.mockResolvedValue({
        id: '1',
        profileComplete: true,
        preferredLanguage: 'en'
      });
    });

    test('should route text messages to text processor', async() => {
      const message = { type: 'text', from: '+123', text: { body: 'test' } };
      const user = { id: '1', profileComplete: true };

      mockTextProcessor.process.mockResolvedValue(null);

      await coordinator.routeToProcessor(message, user, '+123');

      expect(mockTextProcessor.process).toHaveBeenCalledWith(
        message,
        user,
        '+123'
      );
      expect(mockInteractiveProcessor.process).not.toHaveBeenCalled();
      expect(mockMediaProcessor.process).not.toHaveBeenCalled();
    });

    test('should route interactive messages to interactive processor', async() => {
      const message = { type: 'interactive', from: '+123', interactive: {} };
      const user = { id: '1', profileComplete: true };

      mockInteractiveProcessor.process.mockResolvedValue(null);

      await coordinator.routeToProcessor(message, user, '+123');

      expect(mockInteractiveProcessor.process).toHaveBeenCalledWith(
        message,
        user,
        '+123'
      );
      expect(mockTextProcessor.process).not.toHaveBeenCalled();
      expect(mockMediaProcessor.process).not.toHaveBeenCalled();
    });

    test('should route button messages to interactive processor', async() => {
      const message = { type: 'button', from: '+123', button: {} };
      const user = { id: '1', profileComplete: true };

      mockInteractiveProcessor.processButtonMessage.mockResolvedValue(null);

      await coordinator.routeToProcessor(message, user, '+123');

      expect(
        mockInteractiveProcessor.processButtonMessage
      ).toHaveBeenCalledWith(message, user, '+123');
      expect(mockTextProcessor.process).not.toHaveBeenCalled();
      expect(mockMediaProcessor.process).not.toHaveBeenCalled();
    });

    test('should route media messages to media processor', async() => {
      const message = { type: 'image', from: '+123', image: {} };
      const user = { id: '1', profileComplete: true };

      mockMediaProcessor.process.mockResolvedValue(null);

      await coordinator.routeToProcessor(message, user, '+123');

      expect(mockMediaProcessor.process).toHaveBeenCalledWith(
        message,
        user,
        '+123'
      );
      expect(mockTextProcessor.process).not.toHaveBeenCalled();
      expect(mockInteractiveProcessor.process).not.toHaveBeenCalled();
    });

    test('should handle unsupported message types', async() => {
      const message = { type: 'unsupported', from: '+123' };
      const user = { id: '1', profileComplete: true };

      mockLogger.warn = jest.fn();

      await coordinator.routeToProcessor(message, user, '+123');

      expect(mockLogger.warn).toHaveBeenCalledWith(
        '⚠️ Unsupported message type: unsupported'
      );
      // Note: sendUnsupportedMessageTypeResponse test would require mocking sendMessage
    });
  });

  describe('processIncomingMessage', () => {
    beforeEach(() => {
      mockUserModel.getUserByPhone.mockResolvedValue({
        id: '1',
        profileComplete: true,
        preferredLanguage: 'en'
      });
      mockUserModel.updateUserProfile = jest.fn();
      mockTextProcessor.process = jest.fn();
      mockInteractiveProcessor.processButtonMessage = jest.fn();
      mockMediaProcessor.process = jest.fn();
      mockFlowEngine.processFlowMessage = jest.fn();
    });

    test('should process complete message flow', async() => {
      const message = {
        type: 'text',
        from: '+1234567890',
        id: 'test_id',
        timestamp: '1234567890',
        text: { body: 'horoscope' }
      };
      const value = { entry: [{}] };

      mockTextProcessor.process.mockResolvedValue(null);

      await coordinator.processIncomingMessage(message, value);

      // Verify user lookup
      expect(mockUserModel.getUserByPhone).toHaveBeenCalledWith('+1234567890');

      // Verify message processing
      expect(mockTextProcessor.process).toHaveBeenCalledWith(
        message,
        expect.any(Object),
        '+1234567890'
      );

      // Verify interaction timestamp update
      expect(mockUserModel.updateUserProfile).toHaveBeenCalledWith(
        '+1234567890',
        expect.any(Object)
      );
    });

    test('should handle new user creation', async() => {
      mockUserModel.getUserByPhone.mockResolvedValue(null);
      mockUserModel.createUser.mockResolvedValue({
        id: 'new_user',
        profileComplete: false,
        isNew: true
      });

      const message = {
        type: 'text',
        from: '+1234567890',
        text: { body: 'hello' }
      };

      mockFlowEngine.processFlowMessage.mockResolvedValue(null);

      await coordinator.processIncomingMessage(message, { entry: [{}] });

      expect(mockUserModel.createUser).toHaveBeenCalledWith('+1234567890');
      expect(mockFlowEngine.processFlowMessage).toHaveBeenCalledWith(
        message,
        expect.any(Object),
        'onboarding'
      );
    });

    test('should handle global errors', async() => {
      // Force an error in validation
      const originalValidate = coordinator.validateMessage;
      coordinator.validateMessage = jest
        .fn()
        .mockRejectedValue(new Error('Test error'));

      // Mock sendMessage for error handling
      const mockSendMessage = jest.fn();
      jest.doMock('../../../../src/services/whatsapp/messageSender', () => ({
        sendMessage: mockSendMessage
      }));

      // Import fresh to get mocked sendMessage
      const MessageCoordinatorFresh = require('../../../../src/services/whatsapp/MessageCoordinator');
      const freshCoordinator = new MessageCoordinatorFresh();
      freshCoordinator.validateMessage = coordinator.validateMessage;

      const message = { type: 'text', from: '+1234567890' };
      const value = { entry: [{}] };

      freshCoordinator.validateMessage = jest
        .fn()
        .mockRejectedValue(new Error('Test error'));

      await freshCoordinator.processIncomingMessage(message, value);

      expect(mockLogger.error).toHaveBeenCalledWith(
        '❌ Global error processing message from +1234567890:',
        'Test error'
      );
    });
  });

  describe('getStats', () => {
    test('should return coordinator statistics', () => {
      const stats = coordinator.getStats();

      expect(stats).toHaveProperty('processors');
      expect(stats).toHaveProperty('registry');
      expect(stats.registry).toBeInstanceOf(Object);
      expect(stats.processors.text).toBe('TextMessageProcessor');
      expect(stats.processors.interactive).toBe('InteractiveMessageProcessor');
      expect(stats.processors.media).toBe('MediaMessageProcessor');
    });
  });

  describe('healthCheck', () => {
    test('should return healthy status for properly initialized coordinator', () => {
      const health = coordinator.healthCheck();

      expect(health.healthy).toBe(true);
      expect(health.registry).toBeDefined();
      expect(health.processors.text).toBe(true);
      expect(health.processors.interactive).toBe(true);
      expect(health.processors.media).toBe(true);
    });

    test('should detect registry issues', () => {
      // Temporarily break registry validation
      const originalValidate = coordinator.registry.validate;
      coordinator.registry.validate = jest
        .fn()
        .mockReturnValue({ isValid: false, errors: ['Test error'] });

      const health = coordinator.healthCheck();

      expect(health.healthy).toBe(false);

      // Restore
      coordinator.registry.validate = originalValidate;
    });
  });
});
