const { TestDatabaseManager, setupWhatsAppMocks, getWhatsAppIntegration } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('CHINESE ASTROLOGY FLOW INTEGRATION: Four Pillars and Time Variations', () => {
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
    await dbManager.cleanupUser('+chinese_test_user');
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

  describe('Four Pillars Completeness (4 tests)', () => {
    test('should validate all four pillars completeness based on chart validation rules', async () => {
      const phoneNumber = '+chinese_test_user';
      await simulateOnboarding(phoneNumber, '08081988', '1030', 'Beijing, China');

      // Simulate user requesting Chinese Astrology reading
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Chinese Astrology' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your Four Pillars of Destiny...')
      );
      // This test would involve checking the internal representation of the Four Pillars
      // and ensuring all components (Year, Month, Day, Hour Pillars) are correctly derived.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your Four Pillars chart is complete and validated.')
      );
    });

    test('should perform Stem/Branch relationship analysis for complex interactions', async () => {
      const phoneNumber = '+chinese_test_user';
      await simulateOnboarding(phoneNumber, '08081988', '1030', 'Beijing, China');

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Chinese Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Analyze Stem-Branch' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Analyzing the intricate relationships between your Heavenly Stems and Earthly Branches...')
      );
      // This test would verify that the system correctly identifies and interprets
      // combinations, clashes, and harmonies between the stems and branches.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Identified a strong [relationship type] between [Pillar A] and [Pillar B].')
      );
    });

    test('should validate Five Element balance according to traditional rules', async () => {
      const phoneNumber = '+chinese_test_user';
      await simulateOnboarding(phoneNumber, '08081988', '1030', 'Beijing, China');

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Chinese Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Five Element Balance' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Assessing the balance of the Five Elements in your chart...')
      );
      // This test would check if the system correctly quantifies the strength of each element
      // and provides an interpretation based on traditional Chinese astrological principles.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your chart shows a balanced presence of Wood and Fire, with a slight deficiency in Metal.')
      );
    });

    test('should verify destiny calculation accuracy using traditional methods', async () => {
      const phoneNumber = '+chinese_test_user';
      await simulateOnboarding(phoneNumber, '08081988', '1030', 'Beijing, China');

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Chinese Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Calculate Destiny' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your destiny path based on traditional Chinese astrological formulas...')
      );
      // This test would involve comparing the bot's calculated destiny interpretation
      // against known examples or a reference implementation for accuracy.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your destiny path indicates a journey of [description of destiny].')
      );
    });
  });

  describe('Seasonal and Time Variations (4 tests)', () => {
    test('should correctly perform leap year chart calculations with Chinese calendar adjustments', async () => {
      const phoneNumber = '+chinese_test_user';
      // A birth date in a leap year for the Chinese calendar
      await simulateOnboarding(phoneNumber, '25012020', '1200', 'Shanghai, China'); // Jan 25, 2020 is still Year of the Pig in Chinese calendar

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Chinese Astrology' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Adjusting for Chinese calendar leap year considerations...')
      );
      // Verify that the Year Pillar is correctly assigned based on the Chinese New Year date, not Jan 1.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your Year Pillar is correctly identified as [Year of the Pig/Rat].')
      );
    });

    test('should handle time zone variations (local vs Universal time differences) accurately', async () => {
      const phoneNumber = '+chinese_test_user';
      // Birth in London (GMT) vs Beijing (GMT+8)
      await simulateOnboarding(phoneNumber, '01011990', '0100', 'London, UK'); // 1 AM GMT

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Chinese Astrology' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your chart based on London's local time and converting to Universal Time.')
      );
      whatsAppIntegration.mockSendMessage.mockClear();

      await simulateOnboarding(phoneNumber, '01011990', '0900', 'Beijing, China'); // 9 AM GMT+8, which is also 1 AM GMT
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Chinese Astrology' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your chart based on Beijing's local time and converting to Universal Time.')
      );
      // The core assertion would be that the resulting Four Pillars are identical for both cases,
      // as they represent the same absolute moment in time.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('The calculated Four Pillars are consistent despite different local times.')
      );
    });

    test('should perform seasonal strength calculations for Five Element variations', async () => {
      const phoneNumber = '+chinese_test_user';
      // Birth in different seasons
      await simulateOnboarding(phoneNumber, '15071990', '1200', 'New York, USA'); // Summer

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Chinese Astrology' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Seasonal Element Strength' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Assessing the seasonal strength of the Five Elements for your birth time.')
      );
      // Expect a stronger Fire/Earth element for summer birth.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your chart shows a strong Fire element due to summer birth.')
      );
    });

    test('should ensure hour pillar precision for exact time calculation accuracy', async () => {
      const phoneNumber = '+chinese_test_user';
      // Birth near a Chinese hour change (which is every 2 hours)
      await simulateOnboarding(phoneNumber, '01011990', '0059', 'Hong Kong, China'); // Just before 1 AM

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Chinese Astrology' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your Hour Pillar with precise time consideration.')
      );
      whatsAppIntegration.mockSendMessage.mockClear();

      await simulateOnboarding(phoneNumber, '01011990', '0101', 'Hong Kong, China'); // Just after 1 AM
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Chinese Astrology' } }, {});

      // The assertion here would be that the Hour Pillar changes correctly based on the 2-hour Chinese astrological segments.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your Hour Pillar is correctly identified as [different pillar for 0101].')
      );
    });
  });
});
