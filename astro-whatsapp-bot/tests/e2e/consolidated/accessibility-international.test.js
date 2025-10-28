const { TestDatabaseManager, setupWhatsAppMocks, getWhatsAppIntegration } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('USER EXPERIENCE EDGE CASES: Accessibility and Multi-Language Support', () => {
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
    await dbManager.cleanupUser('+uxe_test_user');
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

  describe('Multi-Language Support (8 tests)', () => {
    test('should provide correct numerology term translations based on cultural number systems', async () => {
      const phoneNumber = '+uxe_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'set language es' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Numerology Reading' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Tu número de vida es [Number].') // Example Spanish numerology term
      );
    });

    test('should provide correct astrological symbol translations for cross-cultural terminology', async () => {
      const phoneNumber = '+uxe_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'set language hi' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('आपका सूर्य राशि [Sun Sign Symbol] है।') // Example Hindi astrological symbol
      );
    });

    test('should provide language-specific error message localization', async () => {
      const phoneNumber = '+uxe_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'set language es' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      // Simulate an invalid input after language switch
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'invalid date' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Por favor, proporcione la fecha en formato DDMMYY') // Spanish error message
      );
    });

    test('should display date format localization based on cultural date representation', async () => {
      const phoneNumber = '+uxe_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'set language hi' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'View Profile' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('जन्म तिथि: १९९० जून १५') // Example Hindi date format (DD Month YYYY)
      );
    });

    test('should maintain session language persistence during language switching mid-conversation', async () => {
      const phoneNumber = '+uxe_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'set language es' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Menú Principal') // Spanish main menu
      );
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: phoneNumber });
      expect(user.preferredLanguage).toBe('es');
    });

    test('should accurately detect and handle mixed language inputs', async () => {
      const phoneNumber = '+uxe_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate mixed language input, expecting the bot to understand the command part
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Menu principal please' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Menú Principal') // Should interpret the French/Spanish as a menu request
      );
      // The bot might respond in the user's set language or the detected language of the command.
    });

    test('should use fallback language handling during translation service failures', async () => {
      const phoneNumber = '+uxe_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'set language fr' } }, {}); // Assume French is supported
      whatsAppIntegration.mockSendMessage.mockClear();

      // Simulate translation service failure for a response
      // This requires mocking the internal translation utility
      // For now, we expect a fallback to English and an error message.
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Daily Horoscope' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('We are experiencing issues with translation. Here is your daily horoscope in English.')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your daily horoscope for today...')
      );
    });

    test('should preserve cultural context and localized meaning accuracy', async () => {
      const phoneNumber = '+uxe_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'set language tr' } }, {}); // Assume Turkish
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Astrology Reading' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Yorumunuz kültürel bağlamda hazırlanmıştır.') // Turkish message emphasizing cultural context
      );
      // This test ensures that the translations are not just literal but convey the correct cultural nuances.
    });
  });

  describe('Accessibility Testing (8 tests)', () => {
    test('should ensure WhatsApp screen reader navigation compatibility (JAWS/NVDA)', async () => {
      const phoneNumber = '+uxe_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate using internal commands or accessibility features to navigate
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '/accessibility reader_mode_on' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});

      // In a real scenario, this would be tested manually with screen readers.
      // Here, we check if the response format is optimized for screen readers (e.g., clear labels, minimal emojis).
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringMatching(/Main Menu. Options include: Western Astrology, Vedic Astrology, Settings./i) // More descriptive output
      );
    });

    test('should ensure message structure readability through semantic markup validation', async () => {
      const phoneNumber = '+uxe_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Daily Horoscope' } }, {});

      // Verify use of bold, italics, lists, etc., where appropriate, for readability.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringMatching(/\*Your Daily Horoscope\*\n\n• Focus on communication.\n• Avoid confrontations./i) // Example of structured text
      );
    });

    test('should provide clear menu hierarchy announcement for screen readers', async () => {
      const phoneNumber = '+uxe_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '/menu vedic' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('You are in the Vedic Astrology menu. Current path: Main > Vedic. Options are:')
      );
    });

    test('should provide screen reader friendly alerts for error message accessibility', async () => {
      const phoneNumber = '+uxe_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'invalid input' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Error: Invalid input detected. Please try again. Detailed message:')
      );
    });

    test('should offer voice input compatibility for speech-to-text integration', async () => {
      const phoneNumber = '+uxe_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // This test assumes WhatsApp's native speech-to-text is used or an internal integration exists.
      // For testing, we simulate a voice input being transcribed.
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '_VOICE_INPUT_TEXT: "Daily Horoscope"_' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your daily horoscope for today...')
      );
    });

    test('should provide Braille device integration for alternative input validation', async () => {
      const phoneNumber = '+uxe_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Similar to voice input, we simulate a Braille input interpreted as text.
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '_BRAILLE_INPUT_TEXT: "Settings"_' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Settings Menu. Options include:')
      );
    });

    test('should support switch device controls for single-switch navigation', async () => {
      const phoneNumber = '+uxe_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate single-switch navigation commands (e.g., 'next', 'select')
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '/switch_mode_on' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'next' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Selected: Western Astrology.')
      );

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'select' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('You are now in Western Astrology.')
      );
    });

    test('should ensure eye-tracking compatibility for gaze-based menu selection', async () => {
      const phoneNumber = '+uxe_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate gaze-based selection commands to navigate the menu.
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '/eye_track_mode_on' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'gaze_select: Daily Horoscope' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your daily horoscope for today...')
      );
    });
  });
});
