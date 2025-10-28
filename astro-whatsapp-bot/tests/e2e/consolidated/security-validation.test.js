const { TestDatabaseManager, setupWhatsAppMocks, getWhatsAppIntegration } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('SECURITY TESTING GAPS: Input Validation, Sanitization, Authentication & Authorization', () => {
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
    await dbManager.cleanupUser('+security_test_user');
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

  describe('Input Validation & Sanitization (8 tests)', () => {
    test('should prevent SQL injection attempts in database queries', async () => {
      const phoneNumber = '+security_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate SQL injection attempt in a user input field (e.g., name)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: "' OR '1'='1" } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Invalid input. Please avoid special characters.')
      );
      // Verify that no unexpected database operations occurred (e.g., no new user created with malicious data).
      const user = await dbManager.db.collection('users').findOne({ name: "' OR '1'='1" });
      expect(user).toBeNull();
    });

    test('should sanitize XSS in user inputs before displaying message content', async () => {
      const phoneNumber = '+security_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate XSS attempt in a user input that might be echoed back
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '<script>alert("XSS")</script>' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.not.stringContaining('<script>alert("XSS")</script>')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;') // HTML entities escaped
      );
    });

    test('should validate API parameters to prevent command injection through geocoding', async () => {
      const phoneNumber = '+security_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate command injection attempt in location input
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'London; rm -rf /' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Could not find location for "London; rm -rf /". Please try again.')
      );
      // Verify that no system commands were executed (e.g., check logs for errors or file system integrity).
    });

    test('should enforce file system access controls to prevent path traversal in ephemeris files', async () => {
      const phoneNumber = '+security_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate path traversal attempt when requesting an ephemeris file
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Get Ephemeris ../../../etc/passwd' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Invalid file path. Access to system directories is restricted.')
      );
      // Verify that no sensitive files were accessed or returned.
    });

    test('should validate input length to prevent buffer overflow attempts', async () => {
      const phoneNumber = '+security_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate extremely long input string
      const longString = 'A'.repeat(2000); // Assuming a reasonable max length is much smaller
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: longString } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your message is too long. Please keep it under [max_length] characters.')
      );
      // Verify that the application does not crash or exhibit unexpected behavior.
    });

    test('should handle Unicode attack vectors with proper character encoding security', async () => {
      const phoneNumber = '+security_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate Unicode homoglyph attack (e.g., using Cyrillic 'a' instead of Latin 'a')
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Pаyment' } }, {}); // Cyrillic 'a'

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Invalid command or unrecognized input.')
      );
      // Verify that the system correctly distinguishes between similar-looking characters.
    });

    test('should prevent null byte injection in binary data handling security', async () => {
      const phoneNumber = '+security_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate null byte injection in a string that might be processed as a file path or command
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'file\0.txt' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Invalid characters in input.')
      );
      // Verify that the null byte does not truncate strings or bypass security checks.
    });

    test('should prevent control character abuse in text processing security', async () => {
      const phoneNumber = '+security_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate input with control characters (e.g., newline, backspace) to disrupt parsing
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hello\nWorld' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Hello World') // Should process as a single line or handle gracefully
      );
      // Verify that control characters do not lead to unexpected behavior or bypass filters.
    });
  });

  describe('Authentication & Authorization (8 tests)', () => {
    test('should prevent session fixation attacks through session ID regeneration', async () => {
      const phoneNumber = '+security_test_user';
      // Simulate an attacker providing a fixed session ID before user authentication
      // This requires mocking session management to allow setting a session ID.
      // For this test, we assume the system regenerates session IDs upon successful authentication.

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Login' } }, {});
      const preAuthSessionId = whatsAppIntegration.getSessionId(phoneNumber); // Assuming a way to get session ID

      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK'); // Simulates successful authentication
      const postAuthSessionId = whatsAppIntegration.getSessionId(phoneNumber);

      expect(preAuthSessionId).not.toBe(postAuthSessionId);
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Session ID regenerated for enhanced security.')
      );
    });

    test('should enforce session timeout for inactive session cleanup', async () => {
      const phoneNumber = '+security_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate user inactivity beyond the session timeout period
      // This requires mocking time or having a short timeout for testing.
      // For now, we simulate a message after a long delay.
      await new Promise(resolve => setTimeout(resolve, 60000)); // Simulate 1 minute inactivity

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Main Menu' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your session has expired due to inactivity. Please start over.')
      );
      // Verify that the user's session state is cleared.
      const session = await dbManager.db.collection('sessions').findOne({ phoneNumber: phoneNumber });
      expect(session).toBeNull();
    });

    test('should enforce concurrent session limits for multi-device access control', async () => {
      const phoneNumber = '+security_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a second device trying to log in with the same credentials
      const secondDeviceNumber = '+security_test_user_device2';
      await processIncomingMessage({ from: secondDeviceNumber, type: 'text', text: { body: 'Login ' + phoneNumber } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        secondDeviceNumber,
        expect.stringContaining('You are already logged in on another device. Please log out there first.')
      );
      // Verify that the first session remains active and the second is denied or logs out the first.
    });

    test('should protect against session hijacking by validating request origin', async () => {
      const phoneNumber = '+security_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate a request with a manipulated origin (e.g., IP address change, user-agent change)
      // This requires mocking the request context.
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'View Profile' }, spoofedOrigin: true }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Security alert: Unusual activity detected. Please re-authenticate.')
      );
      // Verify that the session is invalidated or requires re-authentication.
    });

    test('should implement phone number masking for privacy protection validation', async () => {
      const phoneNumber = '+security_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate requesting to view one's own phone number or another user's
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'My Phone Number' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your phone number: +XXXXXXXXX_user') // Masked output
      );
      // Verify that full phone numbers are never exposed in logs or responses unless explicitly authorized.
    });

    test('should ensure birth data confidentiality through sensitive information handling', async () => {
      const phoneNumber = '+security_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate an unauthorized attempt to retrieve birth data
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Get Birth Data for +another_user' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Unauthorized access. You cannot view other users\' birth data.')
      );
      // Verify that sensitive data is encrypted at rest and only accessible by authorized processes.
    });

    test('should protect user preferences through profile security testing', async () => {
      const phoneNumber = '+security_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate setting a preference
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Set Preferred Astrology Vedic' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      // Simulate an unauthorized attempt to change another user's preference
      await processIncomingMessage({ from: '+another_user', type: 'text', text: { body: 'Set Preferred Astrology Western for ' + phoneNumber } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        '+another_user',
        expect.stringContaining('Unauthorized. You can only change your own preferences.')
      );
      // Verify that preferences are tied to the authenticated user and cannot be tampered with by others.
    });

    test('should ensure data export security for information portability safety', async () => {
      const phoneNumber = '+security_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'London, UK');

      // Simulate requesting data export
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Export My Data' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your data export request has been received. It will be sent to your registered email.')
      );
      // Verify that exported data is encrypted, sent securely, and only to the authenticated user.
      // This would involve mocking email sending and checking content/encryption.
    });
  });
});
