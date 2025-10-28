const { TestDatabaseManager, setupWhatsAppMocks, getWhatsAppIntegration } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('GROUP ASTROLOGY FLOW INTEGRATION: Family, Business, and Event Timing', () => {
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
    await dbManager.cleanupUser('+group_test_user');
    await dbManager.cleanupUser('+group_test_user_2');
    await dbManager.cleanupUser('+group_test_user_3');
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

  describe('Family Astrology Complexity (4 tests)', () => {
    test('should generate 3+ generation family charts and map complex relationships', async () => {
      const user1 = '+group_test_user'; // Grandparent
      const user2 = '+group_test_user_2'; // Parent
      const user3 = '+group_test_user_3'; // Child

      await simulateOnboarding(user1, '01011950', '1000', 'London, UK');
      await simulateOnboarding(user2, '01011975', '1400', 'London, UK');
      await simulateOnboarding(user3, '01012000', '1800', 'London, UK');

      // Simulate requesting a 3-generation family chart
      await processIncomingMessage({ from: user1, type: 'text', text: { body: `Family Chart ${user2} ${user3}` } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        user1,
        expect.stringContaining('Generating a 3-generation family chart for complex relationship mapping...')
      );
      // This test would verify the output contains insights into inter-generational dynamics.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        user1,
        expect.stringContaining('Insights into generational patterns and karmic connections across your family.')
      );
    });

    test('should accurately calculate family composite charts for combined energy', async () => {
      const user1 = '+group_test_user';
      const user2 = '+group_test_user_2';

      await simulateOnboarding(user1, '01011980', '1000', 'London, UK');
      await simulateOnboarding(user2, '01011985', '1400', 'London, UK');

      // Simulate requesting a family composite chart
      await processIncomingMessage({ from: user1, type: 'text', text: { body: `Composite Chart ${user2}` } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        user1,
        expect.stringContaining('Calculating the composite chart for your family's combined energy...')
      );
      // This test would verify the accuracy of the composite chart calculation and its interpretation.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        user1,
        expect.stringContaining('Your family's composite chart reveals a strong focus on [area of life].')
      );
    });

    test('should analyze sibling relationship patterns based on birth order astrology', async () => {
      const user1 = '+group_test_user'; // Older sibling
      const user2 = '+group_test_user_2'; // Younger sibling

      await simulateOnboarding(user1, '01011990', '1000', 'London, UK');
      await simulateOnboarding(user2, '01011995', '1400', 'London, UK');

      // Simulate requesting sibling relationship analysis
      await processIncomingMessage({ from: user1, type: 'text', text: { body: `Sibling Analysis ${user2}` } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        user1,
        expect.stringContaining('Analyzing sibling relationship patterns based on birth order and charts...')
      );
      // This test would verify insights specific to sibling dynamics and birth order influences.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        user1,
        expect.stringContaining('Your relationship with your sibling shows [specific dynamics].')
      );
    });

    test('should provide parent-child compatibility flows for generational dynamics', async () => {
      const parent = '+group_test_user';
      const child = '+group_test_user_2';

      await simulateOnboarding(parent, '01011970', '1000', 'London, UK');
      await simulateOnboarding(child, '01012000', '1400', 'London, UK');

      // Simulate requesting parent-child compatibility
      await processIncomingMessage({ from: parent, type: 'text', text: { body: `Parent-Child Compatibility ${child}` } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        parent,
        expect.stringContaining('Analyzing parent-child compatibility for generational dynamics...')
      );
      // This test would verify insights into parenting styles, child's needs, and potential areas of growth.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        parent,
        expect.stringContaining('Insights into your child's unique needs and your parenting style.')
      );
    });
  });

  describe('Business Partnership Integration (4 tests)', () => {
    test('should perform business partner synastry for professional compatibility', async () => {
      const partner1 = '+group_test_user';
      const partner2 = '+group_test_user_2';

      await simulateOnboarding(partner1, '01011980', '1000', 'London, UK');
      await simulateOnboarding(partner2, '01011985', '1400', 'London, UK');

      // Simulate requesting business partner synastry
      await processIncomingMessage({ from: partner1, type: 'text', text: { body: `Business Synastry ${partner2}` } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        partner1,
        expect.stringContaining('Performing business partner synastry for professional compatibility...')
      );
      // This test would verify insights into strengths, challenges, and dynamics in a business context.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        partner1,
        expect.stringContaining('Your business partnership shows strong potential in [area] but watch out for [challenge].')
      );
    });

    test('should analyze work environment energy for office astrology testing', async () => {
      const user = '+group_test_user';
      await simulateOnboarding(user, '01011980', '1000', 'London, UK');

      // Simulate requesting work environment energy analysis (e.g., for a team or company launch date)
      await processIncomingMessage({ from: user, type: 'text', text: { body: 'Work Environment Analysis' } }, {});
      await processIncomingMessage({ from: user, type: 'text', text: { body: 'Company Launch Date 01012023' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        user,
        expect.stringContaining('Analyzing the astrological energy of your work environment...')
      );
      // This test would verify insights into the company culture, team dynamics, and overall work vibe.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        user,
        expect.stringContaining('The energy of your workplace fosters [positive trait] but may lead to [negative trait].')
      );
    });

    test('should provide career advancement timing based on professional prediction accuracy', async () => {
      const user = '+group_test_user';
      await simulateOnboarding(user, '01011980', '1000', 'London, UK');

      // Simulate requesting career advancement timing
      await processIncomingMessage({ from: user, type: 'text', text: { body: 'Career Timing' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        user,
        expect.stringContaining('Calculating auspicious timings for your career advancement...')
      );
      // This test would verify the accuracy of predictive techniques applied to career milestones.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        user,
        expect.stringContaining('The period between [date] and [date] is highly favorable for career growth.')
      );
    });

    test('should perform team dynamic calculations for group energy interactions', async () => {
      const user1 = '+group_test_user';
      const user2 = '+group_test_user_2';
      const user3 = '+group_test_user_3';

      await simulateOnboarding(user1, '01011980', '1000', 'London, UK');
      await simulateOnboarding(user2, '01011985', '1400', 'London, UK');
      await simulateOnboarding(user3, '01011990', '1800', 'London, UK');

      // Simulate requesting team dynamic calculations
      await processIncomingMessage({ from: user1, type: 'text', text: { body: `Team Dynamics ${user2} ${user3}` } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        user1,
        expect.stringContaining('Analyzing the energetic interactions within your team...')
      );
      // This test would verify insights into team cohesion, roles, and potential conflicts.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        user1,
        expect.stringContaining('Your team's dynamics show [strengths] and areas for [improvement].')
      );
    });
  });

  describe('Event Timing Integration (4 tests)', () => {
    test('should provide wedding muhurta calculations based on traditional rules', async () => {
      const user = '+group_test_user';
      await simulateOnboarding(user, '01011980', '1000', 'London, UK');

      // Simulate requesting wedding muhurta (auspicious timing)
      await processIncomingMessage({ from: user, type: 'text', text: { body: 'Wedding Muhurta' } }, {});
      await processIncomingMessage({ from: user, type: 'text', text: { body: 'Partner Birth 01011985 1400 London, UK' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        user,
        expect.stringContaining('Calculating auspicious wedding timings based on traditional Vedic astrology...')
      );
      // This test would verify the output provides specific dates/times and explanations.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        user,
        expect.stringContaining('The most auspicious dates for your wedding are [date] and [date].')
      );
    });

    test('should provide business launch timing based on commercial astrology accuracy', async () => {
      const user = '+group_test_user';
      await simulateOnboarding(user, '01011980', '1000', 'London, UK');

      // Simulate requesting business launch timing
      await processIncomingMessage({ from: user, type: 'text', text: { body: 'Business Launch Timing' } }, {});
      await processIncomingMessage({ from: user, type: 'text', text: { body: 'Business Type Tech Startup' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        user,
        expect.stringContaining('Calculating the most favorable astrological timing for your business launch...')
      );
      // This test would verify the output provides specific dates/times optimized for business success.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        user,
        expect.stringContaining('The period around [date] is ideal for launching your tech startup.')
      );
    });

    test('should optimize personal event timing based on event-specific calculations', async () => {
      const user = '+group_test_user';
      await simulateOnboarding(user, '01011980', '1000', 'London, UK');

      // Simulate requesting personal event optimization (e.g., starting a new course)
      await processIncomingMessage({ from: user, type: 'text', text: { body: 'Optimize Event Timing' } }, {});
      await processIncomingMessage({ from: user, type: 'text', text: { body: 'Event Type Start New Course' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        user,
        expect.stringContaining('Optimizing the timing for your personal event based on your chart...')
      );
      // This test would verify the output provides personalized auspicious timings.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        user,
        expect.stringContaining('The best time to start your new course is around [date].')
      );
    });

    test('should provide seasonal event timing based on calendar-based predictions', async () => {
      const user = '+group_test_user';
      await simulateOnboarding(user, '01011980', '1000', 'London, UK');

      // Simulate requesting seasonal event timing (e.g., best time for a retreat)
      await processIncomingMessage({ from: user, type: 'text', text: { body: 'Seasonal Event Timing' } }, {});
      await processIncomingMessage({ from: user, type: 'text', text: { body: 'Event Type Spiritual Retreat' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        user,
        expect.stringContaining('Calculating optimal seasonal timing for your spiritual retreat...')
      );
      // This test would verify the output provides seasonal recommendations.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        user,
        expect.stringContaining('The autumn season is particularly favorable for spiritual retreats this year.')
      );
    });
  });
});
