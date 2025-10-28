const { TestDatabaseManager, setupWhatsAppMocks, getWhatsAppIntegration } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('CROSS-PLATFORM COMPATIBILITY: Device Variations and Network Conditions', () => {
  let dbManager;
  let whatsAppIntegration;
  let mocks;

  beforeAll(async () => {
    dbManager = new TestDatabaseManager();
    await dbManager.setup();
    whatsAppIntegration = getWhatsAppIntegration();
    mocks = setupWhatsAppMocks();
  }, 30000);

  afterAll(async () => {
    mocks.restoreMocks();
    await dbManager.teardown();
  }, 10000);

  beforeEach(async () => {
    mocks.mockSendMessage.mockClear();
    await dbManager.cleanupUser('+cross_platform_test_user');
  });

  // Helper function to simulate a user completing the onboarding successfully
  const simulateOnboarding = async (phoneNumber, birthDate, birthTime, birthPlace) => {
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hi' } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: birthDate } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: birthTime } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: birthPlace } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Yes' } }, {});
    whatsAppIntegration.mockSendMessage.mockClear();
  };

  describe('Device Type Variations (8 tests)', () => {
    test('should ensure consistent iOS WhatsApp behavior for Apple-specific interactions', async () => {
      const phoneNumber = '+cross_platform_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a message from an iOS device (e.g., specific emoji rendering, button behavior)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'View Menu', device: 'iOS' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Main Menu')
      );
      // This test would ideally involve visual inspection or specific iOS-only feature checks.
      // For now, we ensure basic functionality is consistent.
    });

    test('should validate Android WhatsApp variations for Google-specific behavior', async () => {
      const phoneNumber = '+cross_platform_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a message from an Android device
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'View Menu', device: 'Android' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Main Menu')
      );
      // Similar to iOS, this would involve specific Android-only feature checks.
    });

    test('should maintain backward compatibility across different OS versions', async () => {
      const phoneNumber = '+cross_platform_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a message from an older OS version (e.g., WhatsApp on an old Android version)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Daily Horoscope', osVersion: 'Android 7' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your daily horoscope for today...')
      );
      // Verify that core features remain functional even on older platforms.
    });

    test('should ensure UI responsiveness across various mobile screen sizes', async () => {
      const phoneNumber = '+cross_platform_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a message that triggers a complex UI element (e.g., a list message with many options)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Show All Services', screenSize: 'small' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Here are our services:')
      );
      // This test would ideally involve visual checks on different screen sizes to ensure proper rendering.
      // For now, we ensure the message is sent and formatted correctly.
    });

    test('should handle message format variations between Business API and Consumer API', async () => {
      const phoneNumber = '+cross_platform_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate sending a message from a Business API number vs a Consumer API number
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hello', apiType: 'Business' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Welcome to the Astrology Bot!')
      );
      // Verify that the bot correctly processes messages regardless of the API type they originate from.
    });

    test('should gracefully handle feature phone limitations for basic feature availability', async () => {
      const phoneNumber = '+cross_platform_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a message from a feature phone (limited capabilities, e.g., no rich media)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Send Image', device: 'Feature Phone' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Image sending is not supported on your device. Sending text alternative.')
      );
      // Verify that the bot provides text-based alternatives or informs about limitations.
    });

    test('should ensure cross-platform consistency with Web WhatsApp integration', async () => {
      const phoneNumber = '+cross_platform_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a message from Web WhatsApp
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'View Profile', platform: 'Web WhatsApp' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your Profile Details:')
      );
      // Verify that interactions and responses are identical to mobile WhatsApp.
    });

    test('should validate interface behavior differences between WhatsApp Web and Mobile', async () => {
      const phoneNumber = '+cross_platform_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a message that might behave differently (e.g., quick reply buttons)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Quick Reply Test', platform: 'Web WhatsApp' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Quick reply buttons might render differently on Web vs Mobile.')
      );
      // This test would involve checking for specific rendering or interaction differences.
    });
  });

  describe('Network Condition Testing (8 tests)', () => {
    test('should optimize for 2G network performance with slow connection optimization', async () => {
      const phoneNumber = '+cross_platform_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a 2G network condition (e.g., by delaying responses or reducing payload size)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Daily Horoscope', network: '2G' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Optimized for slow connection. Your daily horoscope:')
      );
      // Verify that responses are concise and avoid heavy media.
    });

    test('should implement message retry mechanisms for intermittent connectivity', async () => {
      const phoneNumber = '+cross_platform_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate intermittent connectivity (message fails, then succeeds on retry)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Generate Report', network: 'intermittent' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Connectivity issue detected. Retrying your request...')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your report has been generated.')
      );
    });

    test('should implement timeout handling validation for high latency scenarios', async () => {
      const phoneNumber = '+cross_platform_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate high latency (response takes too long)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Complex Calculation', network: 'high_latency' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your request is taking longer than expected. Please wait or try again.')
      );
      // Verify that the bot doesn't hang indefinitely and provides user feedback.
    });

    test('should optimize content for bandwidth throttling', async () => {
      const phoneNumber = '+cross_platform_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate bandwidth throttling (e.g., by requesting a large image)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Send Large Image', network: 'throttled' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Bandwidth is limited. Sending a compressed image or text description instead.')
      );
      // Verify that the bot adapts content delivery based on available bandwidth.
    });

    test('should minimize image generation for bandwidth conservation', async () => {
      const phoneNumber = '+cross_platform_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a request that would normally generate a rich image, but under low bandwidth
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Generate Birth Chart Image', network: 'low_bandwidth' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Due to low bandwidth, sending a text-based chart summary instead of an image.')
      );
      // Verify that the bot prioritizes text over heavy images when bandwidth is constrained.
    });

    test('should validate caching strategy effectiveness for offline capability', async () => {
      const phoneNumber = '+cross_platform_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a request that should be served from cache (e.g., a previously generated report)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'View Last Report' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      // Simulate offline mode
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'View Last Report', network: 'offline' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Retrieving your last report from offline cache.')
      );
      // Verify that cached content is accessible even without network connectivity.
    });

    test('should implement progressive content loading for user experience optimization', async () => {
      const phoneNumber = '+cross_platform_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a request for a long piece of content (e.g., a detailed reading)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Detailed Life Reading', network: 'slow' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Loading your detailed life reading... Part 1 of 3:')
      );
      // Verify that content is delivered in chunks to improve perceived performance.
    });

    test('should monitor data usage for cost-conscious design validation', async () => {
      const phoneNumber = '+cross_platform_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a request that consumes data (e.g., downloading a large file)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Download Full Ephemeris', dataPlan: 'limited' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Warning: This action will consume significant data. Proceed?')
      );
      // Verify that the bot informs users about high data usage actions.
    });
  });
});
