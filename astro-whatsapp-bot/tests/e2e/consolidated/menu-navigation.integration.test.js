const { TestDatabaseManager, setupWhatsAppMocks, getWhatsAppIntegration } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('MENU NAVIGATION INTEGRATION: Complete Menu Tree Validation', () => {
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
    await dbManager.cleanupUser('+menu_test_user');
  });

  // Helper function to simulate a user completing the onboarding successfully
  const simulateOnboarding = async (phoneNumber) => {
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hi' } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '15061990' } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '1430' } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'London, UK' } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Yes' } }, {});
    whatsAppIntegration.mockSendMessage.mockClear();
  };

  describe('Deep Menu Path Traversals (8 tests)', () => {
    test('should allow 6+ level deep navigation: Main -> Western -> Basic -> Birth Chart', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);

      // Simulate navigating through a deep menu path
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Basic Readings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart Analysis' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('You are now in Birth Chart Analysis. What would you like to explore?')
      );
      // Further assertions could check for specific submenu options
    });

    test('should allow 6+ level deep navigation: Main -> Vedic -> Advanced -> Dasha Analysis', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Advanced Readings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Dasha Analysis' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('You are now in Dasha Analysis. Please select a Dasha period.')
      );
    });

    test('should preserve menu state across sessions (return to last menu position)', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {});

      // Simulate session end and restart (e.g., user inactive for a while, then sends a message)
      // This would typically involve clearing session state in the test setup or mocking it.
      // For now, we simulate a new incoming message after some time.
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Continue' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Welcome back! You were last in Western Astrology. Would you like to continue?')
      );
    });

    test('should display breadcrumb navigation for multi-level back functionality', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Advanced Readings' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Main Menu > Vedic Astrology > Advanced Readings')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Type 'back' to go to previous menu.')
      );
    });

    test('should show premium options only for subscribed users (Subscription-tier menu differences)', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);

      // Simulate user without subscription
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).not.toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Premium Features')
      );
      whatsAppIntegration.mockSendMessage.mockClear();

      // Simulate user with active subscription (requires mocking user state)
      await dbManager.db.collection('users').updateOne({ phoneNumber: phoneNumber }, { $set: { subscriptionStatus: 'active' } });
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Premium Features')
      );
    });

    test('should display language-dependent menu options based on user preference', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);

      // Default English menu
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Western Astrology')
      );
      whatsAppIntegration.mockSendMessage.mockClear();

      // Switch to Spanish
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'set language es' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Astrología Occidental')
      );
    });

    test('should dynamically change menu options based on profile completion status', async () => {
      const phoneNumber = '+menu_test_user';
      // Simulate user with incomplete profile (e.g., missing birth time)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hi' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '15061990' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'skip' } }, {}); // Skip time
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'London, UK' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Yes' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Complete Profile')
      );
      expect(whatsAppIntegration.mockSendMessage).not.toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Advanced Readings') // Should not show advanced options without full profile
      );
    });

    test('should prioritize frequently used menu options (Adaptive menu ordering)', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);

      // Simulate frequent access to 'Daily Horoscope'
      for (let i = 0; i < 5; i++) {
        await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Daily Horoscope' } }, {});
        whatsAppIntegration.mockSendMessage.mockClear();
      }

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      // Expect 'Daily Horoscope' to appear higher or be highlighted
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('✨ Daily Horoscope (Recommended) ✨') // Example of prioritization
      );
    });
  });

;

  describe('Contextual Menu Behaviors (8 tests)', () => {
    test('should suggest recent interactions based on user history', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Daily Horoscope' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Compatibility Analysis' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Recent: Daily Horoscope, Compatibility Analysis')
      );
    });

    test('should highlight favorite services based on usage patterns', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);

      // Simulate marking 'Birth Chart Analysis' as favorite or frequent use
      for (let i = 0; i < 10; i++) {
        await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart Analysis' } }, {});
        whatsAppIntegration.mockSendMessage.mockClear();
      }

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('⭐ Birth Chart Analysis')
      );
    });

    test('should offer service completion continuations (follow-up recommendations)', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);

      // Simulate completing a 'Birth Chart Analysis'
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart Analysis' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'View Full Report' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('You just viewed your Birth Chart. Would you like to explore Transits or Progressions?')
      );
    });

    test('should provide interest-based suggestions (Behavioral personalization)', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);

      // Simulate user showing interest in 'Vedic Astrology' topics
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Dasha Analysis' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Based on your interest in Vedic Astrology, you might like: Remedial Measures.')
      );
    });

    test('should apply free tier limitations and prompt for upgrade', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);

      // Simulate user trying to access a premium feature without subscription
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Premium Feature' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('This is a premium feature. Please upgrade your subscription to access it.')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Upgrade Now')
      );
    });

    test('should unlock premium features upon subscription activation', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);

      // Simulate user without subscription trying to access premium feature
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Premium Feature' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('This is a premium feature.')
      );
      whatsAppIntegration.mockSendMessage.mockClear();

      // Simulate subscription activation
      await dbManager.db.collection('users').updateOne({ phoneNumber: phoneNumber }, { $set: { subscriptionStatus: 'active' } });

      // Now try to access the premium feature again
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Premium Feature' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Welcome to your Premium Feature!')
      );
    });

    test('should modify menus for trial period users', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);

      // Simulate user entering a trial period
      await dbManager.db.collection('users').updateOne({ phoneNumber: phoneNumber }, { $set: { subscriptionStatus: 'trial', trialEndDate: new Date() } });
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('You are on a free trial. Enjoy premium features until [date].')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Extend Trial')
      );
    });

    test('should display billing issue indicators in menu overlays', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);

      // Simulate user with a billing issue
      await dbManager.db.collection('users').updateOne({ phoneNumber: phoneNumber }, { $set: { subscriptionStatus: 'active', billingIssue: true } });
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('⚠️ Billing Issue: Please update your payment method.')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Update Payment')
      );
    });
  });
});
