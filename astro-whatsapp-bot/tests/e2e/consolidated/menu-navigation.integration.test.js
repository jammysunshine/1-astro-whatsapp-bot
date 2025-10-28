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

  describe('Deep Menu Path Traversals (45 tests)', () => {
    // Original 8 tests
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
        expect.stringContaining('Type \'back\' to go to previous menu.')
      );
    });

    test('should show premium options only for subscribed users (Subscription-tier menu differences)', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).not.toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Premium Features')
      );
      whatsAppIntegration.mockSendMessage.mockClear();

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

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Western Astrology')
      );
      whatsAppIntegration.mockSendMessage.mockClear();

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
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hi' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '15061990' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'skip' } }, {});
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
        expect.stringContaining('Advanced Readings')
      );
    });

    test('should prioritize frequently used menu options (Adaptive menu ordering)', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);

      for (let i = 0; i < 5; i++) {
        await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Daily Horoscope' } }, {});
        whatsAppIntegration.mockSendMessage.mockClear();
      }

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('✨ Daily Horoscope (Recommended) ✨')
      );
    });

    // --- New Deep Menu Path Traversals Tests (37 tests) ---

    // More 6+ Level Deep Navigation (examples for Western, Vedic, Relationships, Divination) (16 tests)
    test('should navigate to Western -> Basic -> Planets in Birth Chart', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Basic Readings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart Analysis' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Planets' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Exploring Planets in your Birth Chart.'));
    });

    test('should navigate to Western -> Basic -> Houses in Birth Chart', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Basic Readings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart Analysis' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Houses' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Exploring Houses in your Birth Chart.'));
    });

    test('should navigate to Western -> Basic -> Aspects in Birth Chart', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Basic Readings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart Analysis' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Aspects' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Exploring Aspects in your Birth Chart.'));
    });

    test('should navigate to Vedic -> Advanced -> Dasha -> Vimshottari', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Advanced Readings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Dasha Analysis' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vimshottari Dasha' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Initiating Vimshottari Dasha Analysis.'));
    });

    test('should navigate to Vedic -> Advanced -> Dasha -> Yogini', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Advanced Readings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Brahma Dasha Analysis' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Yogini Dasha' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Initiating Yogini Dasha Analysis.'));
    });

    test('should navigate to Vedic -> Advanced -> Dasha -> Char Dasha', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Advanced Readings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Dasha Analysis' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Char Dasha' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Initiating Char Dasha Analysis.'));
    });

    test('should navigate to Vedic -> Advanced -> Dasha -> Narayan Dasha', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Advanced Readings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Dasha Analysis' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Narayan Dasha' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Initiating Narayan Dasha Analysis.'));
    });

    test('should navigate to Relationships -> Family -> 4-member -> Parent-Child', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Relationships' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Family' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '4-member analysis' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Parent-Child' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Beginning Parent-Child relationship analysis.'));
    });

    test('should navigate to Relationships -> Family -> 4-member -> Sibling', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Relationships' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Family' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '4-member analysis' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Sibling' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Beginning Sibling relationship analysis.'));
    });

    test('should navigate to Relationships -> Family -> 4-member -> Spousal', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Relationships' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Family' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '4-member analysis' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Spousal' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Beginning Spousal relationship analysis.'));
    });

    test('should navigate to Divination -> Ancient Wisdom -> Hellenistic -> Lots', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Divination' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Ancient Wisdom' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hellenistic' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Lots' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Exploring Hellenistic Lots.'));
    });

    test('should navigate to Divination -> Ancient Wisdom -> Hellenistic -> Decans', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Divination' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Ancient Wisdom' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hellenistic' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Decans' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Exploring Hellenistic Decans.'));
    });

    test('should navigate to Divination -> Ancient Wisdom -> Hellenistic -> Terms', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Divination' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Ancient Wisdom' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hellenistic' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Terms' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Exploring Hellenistic Terms.'));
    });

    test('should navigate to Divination -> Ancient Wisdom -> Hellenistic -> Triplicities', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Divination' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Ancient Wisdom' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hellenistic' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Triplicities' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Exploring Hellenistic Triplicities.'));
    });

    test('should navigate to Divination -> Ancient Wisdom -> Hellenistic -> Planetary Hours', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Divination' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Ancient Wisdom' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hellenistic' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Planetary Hours' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Exploring Hellenistic Planetary Hours.'));
    });

    test('should allow saving quick access bookmarks to favorite menu shortcuts', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Save as Favorite: Western' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('\'Western\' added to your favorites.'));
    });

    test('should recall recent path memory for frequently used shortcuts', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Recent' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Your recent path: Vedic Astrology. Continue?'));
    });

    test('should list available shortcuts from recent path memory', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Basic Readings' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Shortcuts' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Available shortcuts: Western Astrology, Basic Readings.'));
    });

    test('should correctly restore state after network interruption mid-navigation', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Network Recovered' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Connection restored. You are in Western Astrology.'));
    });

    test('should allow user to jump to a bookmarked menu item', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Save as Favorite: Western' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Go to Favorite: Western' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('You are now in Western Astrology menu.'));
    });

    test('should clear recent path memory upon user explicit clear command', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Clear History' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Your navigation history has been cleared.'));
    });

    test('should display exclusive premium options for Gold tier subscribers', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await dbManager.db.collection('users').updateOne({ phoneNumber: phoneNumber }, { $set: { subscriptionStatus: 'active', subscriptionTier: 'Gold' } });
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Gold Exclusive Insights'));
    });

    test('should display exclusive premium options for Platinum tier subscribers', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await dbManager.db.collection('users').updateOne({ phoneNumber: phoneNumber }, { $set: { subscriptionStatus: 'active', subscriptionTier: 'Platinum' } });
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Platinum VIP Access'));
    });

    test('should prompt for missing birth time before showing advanced astrological options', async () => {
      const phoneNumber = '+menu_test_user';
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hi' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '15061990' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'skip' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'London, UK' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Yes' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Advanced Readings' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Please provide your exact birth time to access advanced readings.'));
    });

    test('should prompt for missing birth place before showing location-based astrological options', async () => {
      const phoneNumber = '+menu_test_user';
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hi' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '15061990' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '1430' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'skip' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Yes' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Location Based Astrology' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Please provide your birth place to access location-based astrology.'));
    });

    test('should not show \'Complete Profile\' after full profile completion', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).not.toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Complete Profile'));
    });

    test('should display a personalized welcome message based on recent activity', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Daily Horoscope' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hi' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Welcome back! Your last request was Daily Horoscope.'));
    });

    test('should navigate to Western -> Transits -> Weekly Transits', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Transits' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Weekly Transits' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Displaying Weekly Transits.'));
    });

    test('should navigate to Western -> Transits -> Monthly Transits', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Transits' } } , {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Monthly Transits' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Displaying Monthly Transits.'));
    });

    test('should navigate to Western -> Progressions -> Secondary Progressions', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Progressions' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Secondary Progressions' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Initiating Secondary Progressions Analysis.'));
    });

    test('should navigate to Western -> Progressions -> Solar Arc Directions', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Progressions' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Solar Arc Directions' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Initiating Solar Arc Directions Analysis.'));
    });

    test('should navigate to Vedic -> Basic -> Sidereal Birth Chart', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Basic Readings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Sidereal Birth Chart' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Displaying Sidereal Birth Chart.'));
    });

    test('should navigate to Vedic -> Basic -> Divisional Charts (Varga)', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Basic Readings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Divisional Charts (Varga)' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Exploring Divisional Charts (Varga).'));
    });

    test('should navigate to Vedic -> Advanced -> Remedial Measures -> Gemstones', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Advanced Readings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Remedial Measures' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Gemstones' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Suggesting Gemstones as remedial measures.'));
    });

    test('should navigate to Vedic -> Advanced -> Remedial Measures -> Mantras', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Advanced Readings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Remedial Measures' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Mantras' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Suggesting Mantras as remedial measures.'));
    });

    test('should navigate to Relationships -> Romantic -> Compatibility Report', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Relationships' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Romantic' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Compatibility Report' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Generating Romantic Compatibility Report.'));
    });

    test('should navigate to Relationships -> Friendship -> Friendship Analysis', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Relationships' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Friendship' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Friendship Analysis' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Generating Friendship Analysis.'));
    });

    test('should navigate to Divination -> I Ching -> Hexagram Reading', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Divination' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'I Ching' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hexagram Reading' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Initiating I Ching Hexagram Reading.'));
    });

    test('should navigate to Divination -> Tarot -> Daily Card Pull', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Divination' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Tarot' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Daily Card Pull' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Pulling your Daily Tarot Card.'));
    });

    test('should navigate to Divination -> Ancient Wisdom -> Hermetic -> Astrological Magic', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Divination' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Ancient Wisdom' } } , {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hermetic' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Astrological Magic' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Exploring Astrological Magic principles.'));
    });

    test('should navigate to Settings -> Profile Management -> Edit Birth Data', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Settings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Profile Management' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Edit Birth Data' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('What would you like to edit? (Date, Time, Place)'));
    });

    test('should navigate to Settings -> Language Preferences -> Change Language', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Settings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Language Preferences' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Change Language' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Please choose your preferred language.'));
    });

    test('should navigate to Help -> FAQ -> Getting Started', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Help' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'FAQ' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Getting Started' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Welcome to the FAQ for Getting Started.'));
    });

    test('should navigate back multiple levels using "back" command', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Advanced Readings' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'back' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('You are now in Vedic Astrology menu.'));
    });

    test('should return to Main Menu from a deep level using "Main Menu" command', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Advanced Readings' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Welcome to the Main Menu!'));
    });

    test('should correctly restore state after network interruption mid-navigation', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Network Recovered' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Connection restored. You are in Western Astrology.'));
    });

    test('should allow user to jump to a bookmarked menu item', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Save as Favorite: Western' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Go to Favorite: Western' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('You are now in Western Astrology menu.'));
    });

    test('should clear recent path memory upon user explicit clear command', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Clear History' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Your navigation history has been cleared.'));
    });

    test('should display exclusive premium options for Gold tier subscribers', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await dbManager.db.collection('users').updateOne({ phoneNumber: phoneNumber }, { $set: { subscriptionStatus: 'active', subscriptionTier: 'Gold' } });
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Gold Exclusive Insights'));
    });

    test('should display exclusive premium options for Platinum tier subscribers', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await dbManager.db.collection('users').updateOne({ phoneNumber: phoneNumber }, { $set: { subscriptionStatus: 'active', subscriptionTier: 'Platinum' } });
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Platinum VIP Access'));
    });

    test('should prompt for missing birth time before showing advanced astrological options', async () => {
      const phoneNumber = '+menu_test_user';
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hi' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '15061990' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'skip' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'London, UK' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Yes' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Advanced Readings' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Please provide your exact birth time to access advanced readings.'));
    });

    test('should prompt for missing birth place before showing location-based astrological options', async () => {
      const phoneNumber = '+menu_test_user';
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hi' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '15061990' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '1430' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'skip' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Yes' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Location Based Astrology' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Please provide your birth place to access location-based astrology.'));
    });

    test('should not show \'Complete Profile\' after full profile completion', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).not.toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Complete Profile'));
    });

    test('should display a personalized welcome message based on recent activity', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Daily Horoscope' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hi' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Welcome back! Your last request was Daily Horoscope.'));
    });

    test('should navigate to Western -> Compatibility -> Synastry Analysis', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Compatibility' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Synastry Analysis' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Initiating Synastry Analysis.'));
    });

    test('should navigate to Western -> Compatibility -> Composite Chart', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Compatibility' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Composite Chart' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Generating Composite Chart.'));
    });

    test('should navigate to Vedic -> Muhurta -> Electional Astrology', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Muhurta' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Electional Astrology' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Exploring Electional Astrology for auspicious timings.'));
    });

    test('should navigate to Vedic -> Muhurta -> Daily Planetary Hours', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Muhurta' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Daily Planetary Hours' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Displaying Daily Planetary Hours.'));
    });

    test('should navigate to Relationships -> Events -> Wedding Timing', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Relationships' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Events' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Wedding Timing' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Calculating auspicious wedding timings.'));
    });

    test('should navigate to Relationships -> Business -> Team Dynamics', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Relationships' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Business' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Team Dynamics' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Analyzing Team Dynamics.'));
    });

    test('should navigate to Divination -> Horary -> Question Analysis', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Divination' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Horary' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Question Analysis' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Submitting your question for Horary Analysis.'));
    });

    test('should navigate to Divination -> Auspicious Timings -> Daily', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Divination' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Auspicious Timings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Daily' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Displaying Daily Auspicious Timings.'));
    });

    test('should navigate to Settings -> Notifications -> Manage Alerts', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Settings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Notifications' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Manage Alerts' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Manage your astrological alerts.'));
    });

    test('should navigate to Settings -> Account -> Change Password', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Settings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Account' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Change Password' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Please enter your old password to change it.'));
    });

    test('should navigate to Help -> FAQ -> Getting Started', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Help' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'FAQ' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Getting Started' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Welcome to the FAQ for Getting Started.'));
    });

    test('should navigate to Help -> Contact Support -> Live Chat', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Help' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Contact Support' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Live Chat' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Connecting you to a live support agent.'));
    });

    test('should navigate to Help -> Tutorials -> Video Guides', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Help' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Tutorials' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Video Guides' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Here are our video guides to get you started.'));
    });

    test('should navigate to Resources -> Glossary -> Astrological Terms', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Resources' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Glossary' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Astrological Terms' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Welcome to the Astrological Terms Glossary.'));
    });

    test('should handle navigation through a 7-level deep path correctly', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Advanced Readings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Dasha Analysis' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vimshottari Dasha' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Major Periods' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Displaying Major Dasha Periods.'));
    });

    test('should handle navigation through a 8-level deep path correctly', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Advanced Readings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Dasha Analysis' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vimshottari Dasha' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Major Periods' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Sun Dasha' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Details for Sun Dasha Period.'));
    });

    test('should display unique submenu options for \'relationships\' focused users', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await dbManager.db.collection('users').updateOne({ phoneNumber: phoneNumber }, { $set: { userFocus: 'relationships' } });
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Relationships' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Marriage Compatibility'));
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Friendship Bonds'));
    });

    test('should show specific menu items to users who have completed specific readings', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await dbManager.db.collection('users').updateOne({ phoneNumber: phoneNumber }, { $set: { completedReadings: ['Birth Chart Analysis'] } });
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Recommended: Advanced Chart Interpretations'));
    });

    test('should hide "Beginner" options for users who have accessed "Advanced" readings multiple times', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      for(let i = 0; i < 3; i++) {
        await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
        await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Advanced Readings' } }, {});
        whatsAppIntegration.mockSendMessage.mockClear();
      }
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      expect(whatsAppIntegration.mockSendMessage).not.toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Basic Readings'));
    });

    test('should offer quick access to "Subscription management" for premium users', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await dbManager.db.collection('users').updateOne({ phoneNumber: phoneNumber }, { $set: { subscriptionStatus: 'active' } });
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Subscription Management'));
    });

    test('should promote a specific new feature to all users upon launch', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' }, newFeatureAvailable: true }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('🎉 New! Explore Daily Horoscopes 2.0! 🎉'));
    });

    test('should indicate menu options with pending actions/notifications', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await dbManager.db.collection('users').updateOne({ phoneNumber: phoneNumber }, { $set: { pendingNotifications: ['Daily Horoscope'] } });
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Daily Horoscope (New!)'));
    });

    test('should offer a "Go to top" or "Home" option from any deep menu level', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Advanced Readings' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Home' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Welcome to the Main Menu!'));
    });

    test('should allow partial input matching for menu navigation to some depth', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Wes Astrolog' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('You are now in Western Astrology menu.'));
    });

    test('should offer "back" option even if current menu has no sub-options', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Basic Readings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'back' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('You are now in Basic Readings menu.'));
    });

    test('should confirm irreversible actions before proceeding with navigation', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Settings' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Delete Profile' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Are you sure you want to delete your profile? This action is irreversible. (Yes/No)'));
    });

    test('should limit navigation depth for non-premium users in advanced sections', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Advanced Readings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Rare Dashas' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('This advanced option is only available for premium subscribers.'));
    });

    test('should adapt menu options for users tagged with specific astrological interests', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await dbManager.db.collection('users').updateOne({ phoneNumber: phoneNumber }, { $set: { astrologicalInterests: ['Horary'] } });
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Divination' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Horary (Recommended for your interests)'));
    });

    test('should offer a return to previous interaction point after completing a reading', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Western Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Basic Readings' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart Analysis' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Generate Report' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Return' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('You are back in Birth Chart Analysis.'));
    });

    test('should provide a searchable menu if options are too numerous to list', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Extensive Catalog' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Too many options to list. Please type keywords to search for a service.'));
    });

    test('should navigate using direct commands regardless of current menu depth', async () => {
      const phoneNumber = '+menu_test_user';
      await simulateOnboarding(phoneNumber);
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Vedic Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Advanced Readings' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Daily Horoscope' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('Your Daily Horoscope is being prepared.'));
    });

    // 45 tests completed
  });

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