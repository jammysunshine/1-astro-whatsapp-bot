const { TestDatabaseManager, setupWhatsAppMocks, getWhatsAppIntegration } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('NADI ASTROLOGY FLOW INTEGRATION: Authentication and Predictive Accuracy', () => {
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
    await dbManager.cleanupUser('+nadi_test_user');
  });

  // Helper function to simulate a user completing the onboarding successfully
  const simulateOnboarding = async (phoneNumber) => {
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hi' } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text
', text: { body: '15061990' } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '1430' } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Chennai, India' } }, {}); // Nadi typically originates from South India
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Yes' } }, {});
    whatsAppIntegration.mockSendMessage.mockClear();
  };

  describe('Nadi Leaf Authentication (4 tests)', () => {
    test('should validate leaf authenticity through database cross-referencing', async () => {
      const phoneNumber = '+nadi_test_user';
      await simulateOnboarding(phoneNumber);

      // Simulate user requesting Nadi astrology and providing a leaf ID
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Nadi Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'LeafID12345' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Validating Nadi leaf ID12345 against our authentic records...')
      );
      // This would require mocking a successful database lookup for the leaf ID
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Leaf ID12345 verified. Proceeding with your Nadi reading.')
      );
    });

    test('should reject invalid leaf authenticity via database cross-referencing', async () => {
      const phoneNumber = '+nadi_test_user';
      await simulateOnboarding(phoneNumber);

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Nadi Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'InvalidLeafID' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Validating Nadi leaf InvalidLeafID against our authentic records...')
      );
      // This would require mocking a failed database lookup for the leaf ID
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Invalid Nadi Leaf ID. Please check and try again or contact support.')
      );
    });

    test('should check reader certification before providing Nadi readings', async () => {
      const phoneNumber = '+nadi_test_user';
      await simulateOnboarding(phoneNumber);

      // Simulate valid leaf ID, then check for reader certification
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Nadi Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'LeafIDAuthenticated' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Verifying the certification of our Nadi reader for your request...')
      );
      // This would require mocking a successful check against a reader certification database
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Certified Nadi reader assigned. Your reading will be prepared shortly.')
      );
    });

    test('should reject readings if traditional methods are not adhered to', async () => {
      const phoneNumber = '+nadi_test_user';
      await simulateOnboarding(phoneNumber);

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Nadi Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'LeafIDAstrology' } }, {}); // Assume valid leaf

      // Simulate a scenario where the Nadi system detects non-adherence to traditional methods
      // This is a conceptual test for internal validation logic during the Nadi reading process.
      // Assuming a command to trigger this internal check or a mocked system response.
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Check Traditional Adherence' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Warning: Discrepancy detected with traditional Nadi methodology for this reading.')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Please try again or select another Nadi reading type.')
      );
      // Further assertions might involve checking logs for non-compliance flags.
    });
  });

  describe('Nadi Predictive Accuracy (4 tests)', () => {
    test('should verify historical prediction accuracy against known events', async () => {
      const phoneNumber = '+nadi_test_user';
      await simulateOnboarding(phoneNumber);

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Nadi Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'HistoricalLeafID_FamousPerson' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Analyzing historical predictions for accuracy.')
      );
      // This test would involve comparing the bot's generated predictions for a historical figure/event
      // against documented outcomes.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Historical prediction for [event] matches recorded outcome.')
      );
    });

    test('should ensure prediction consistency across multiple practitioner variations', async () => {
      const phoneNumber = '+nadi_test_user';
      await simulateOnboarding(phoneNumber);

      // Simulate user requesting Nadi reading, then requesting it again with a 'different practitioner' focus
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Nadi Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'MyLeafID' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your Nadi reading is being prepared by Practitioner A.')
      );
      whatsAppIntegration.mockSendMessage.mockClear();

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Get another Nadi reading (Practitioner B)' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your Nadi reading is being prepared by Practitioner B.')
      );
      // The assertion here would be to compare the outcomes/messages from Practitioner A and B.
      // Ideally, the core predictions should be consistent, though interpretation style might vary.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Readings from both practitioners show consistent core predictions.')
      );
    });

    test('should preserve cultural context in traditional accuracy testing', async () => {
      const phoneNumber = '+nadi_test_user';
      await simulateOnboarding(phoneNumber);

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Nadi Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'CulturalLeaf' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Ensuring cultural nuances are preserved in your Nadi reading.')
      );
      // This test would involve checking for specific culturally appropriate terminology, examples,
      // or interpretations within the generated Nadi reading.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your Nadi reading reflects traditional South Indian astrological context.')
      );
    });

    test('should compare Modern vs Traditional Nadi analysis for comparative validation', async () => {
      const phoneNumber = '+nadi_test_user';
      await simulateOnboarding(phoneNumber);

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Nadi Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'MyLeafID' } }, {});

      // Simulate user requesting both modern and traditional interpretations (or a comparison)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Compare Nadi Modern vs Traditional' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Comparing modern analytical insights with traditional Nadi principles.')
      );
      // The result should highlight areas of agreement and potential divergence between the two approaches.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Both approaches agree on [key event], but differ in emphasis on [subtlety].')
      );
    });
  });
});
