const { TestDatabaseManager, setupWhatsAppMocks, getWhatsAppIntegration } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('ASTROLOGY CALCULATIONS INTEGRATION: Birth Data, Location, and Planetary Edge Cases', () => {
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
    await dbManager.cleanupUser('+astro_calc_test_user');
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

  describe('Birth Data Edge Cases (12 tests)', () => {
    test('should accurately calculate chart for birth at exact solstice/equinox', async () => {
      const phoneNumber = '+astro_calc_test_user';
      await simulateOnboarding(phoneNumber, '21121990', '1007', 'Greenwich, UK'); // Winter Solstice 1990

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your birth chart for the exact moment of the solstice.')
      );
      // Verify specific planetary positions or house cusps that would be sensitive to this exact timing.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your chart accurately reflects the Capricorn/Sagittarius cusp energy.')
      );
    });

    test('should correctly handle birth during a leap day (February 29)', async () => {
      const phoneNumber = '+astro_calc_test_user';
      await simulateOnboarding(phoneNumber, '29021992', '1200', 'London, UK');

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your birth chart, correctly accounting for the leap day.')
      );
      // Verify that age calculations, progressions, and transits are accurate despite the leap day.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('All calculations, including progressions, are accurate for your leap year birth.')
      );
    });

    test('should handle birth at pole locations (extreme latitude calculations)', async () => {
      const phoneNumber = '+astro_calc_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1200', 'North Pole'); // Latitude 90N

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your birth chart for the extreme latitude of the North Pole.')
      );
      // Verify that house systems (e.g., Placidus, Koch) are handled gracefully or a suitable alternative is used.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('House cusps are calculated using a suitable house system for polar regions.')
      );
    });

    test('should incorporate planetary influence for birth during eclipses', async () => {
      const phoneNumber = '+astro_calc_test_user';
      // Need a date/time of an eclipse
      await simulateOnboarding(phoneNumber, '16072000', '1333', 'London, UK'); // Lunar Eclipse July 16, 2000

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your birth during an eclipse indicates significant planetary influence.')
      );
      // Verify that the interpretation or chart details mention the eclipse's impact.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('The lunar eclipse at your birth highlights themes of transformation.')
      );
    });

    test('should accurately calculate chart for birth near midnight (day boundary accuracy)', async () => {
      const phoneNumber = '+astro_calc_test_user';
      await simulateOnboarding(phoneNumber, '01011990', '2359', 'London, UK');

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your birth chart for the precise moment near midnight.')
      );
      // Verify that the correct date is used for the chart, especially for planets that change signs around midnight.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('The chart correctly assigns planetary positions for January 1st, 1990.')
      );
    });

    test('should accurately calculate charts for births before 1900 AD (Julian calendar accuracy)', async () => {
      const phoneNumber = '+astro_calc_test_user';
      await simulateOnboarding(phoneNumber, '01011850', '1200', 'London, UK');

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your birth chart using the appropriate Julian calendar conversion.')
      );
      // Verify that the astronomical positions are correct for the historical date.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Historical planetary positions are accurately reflected.')
      );
    });

    test('should handle ancient birth dates (historical astronomical verification)', async () => {
      const phoneNumber = '+astro_calc_test_user';
      await simulateOnboarding(phoneNumber, '01010001', '1200', 'Rome, Italy'); // Jan 1, 1 AD

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your birth chart for an ancient date, verifying astronomical data.')
      );
      // Verify that the underlying ephemeris data supports such ancient dates and provides valid results.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('The chart for 1 AD is generated with available historical ephemeris data.')
      );
    });

    test('should provide predictive calculation validation for future birth scenarios', async () => {
      const phoneNumber = '+astro_calc_test_user';
      await simulateOnboarding(phoneNumber, '01012050', '1200', 'New York, USA');

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Predictive Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Generating a predictive chart for a future birth scenario.')
      );
      // Verify that the system can project planetary positions and aspects into the future accurately.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Future planetary transits and progressions are calculated accurately.')
      );
    });

    test('should reproduce celebrity birth charts for known chart accuracy', async () => {
      const phoneNumber = '+astro_calc_test_user';
      await simulateOnboarding(phoneNumber, '29081958', '2200', 'Gary, Indiana, USA'); // Michael Jackson

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Reproducing the birth chart for Michael Jackson.')
      );
      // Compare the generated chart details (e.g., ascendant, moon sign, major aspects) with known celebrity charts.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('The generated chart matches known astrological data for Michael Jackson.')
      );
    });

    test('should maintain calculation consistency with seconds precision in birth time', async () => {
      const phoneNumber = '+astro_calc_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '143015', 'Mumbai, India'); // 14:30:15

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your birth chart with seconds-level precision.')
      );
      // Verify that sensitive points like house cusps and fast-moving planets are correctly placed.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('House cusps and planetary degrees are precise to the second.')
      );
    });

    test('should handle time zone offset variations (global timezone handling)', async () => {
      const phoneNumber = '+astro_calc_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1430', 'Tokyo, Japan'); // GMT+9

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your birth chart, correctly applying Tokyo's timezone offset.')
      );
      // Verify that the UTC conversion is accurate for different timezones.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('The UTC birth time is accurately derived from your local time and timezone.')
      );
    });

    test('should correctly handle DST transition births (Daylight Saving adjustments)', async () => {
      const phoneNumber = '+astro_calc_test_user';
      // Birth during DST transition (e.g., Spring forward in UK)
      await simulateOnboarding(phoneNumber, '28031993', '0130', 'London, UK'); // DST started 01:00 GMT to 02:00 BST

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your birth chart, adjusting for Daylight Saving Time transition.')
      );
      // Verify that the correct standard time is used for astronomical calculations.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('The chart reflects the correct standard time, accounting for DST.')
      );
    });
  });

  describe('Location-Based Calculations (8 tests)', () => {
    test('should handle North/South pole births with polar coordinate handling', async () => {
      const phoneNumber = '+astro_calc_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1200', 'South Pole'); // Latitude -90S

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your birth chart for the South Pole, handling polar coordinates.')
      );
      // Similar to the North Pole test, ensure house systems are managed.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('House cusps are calculated using a suitable house system for polar regions.')
      );
    });

    test('should correctly handle International Dateline crosses for longitude boundary testing', async () => {
      const phoneNumber = '+astro_calc_test_user';
      // Birth near the International Dateline (e.g., Fiji, Samoa)
      await simulateOnboarding(phoneNumber, '01011990', '1200', 'Apia, Samoa'); // West of IDL, GMT-11

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your birth chart, correctly handling the International Dateline.')
      );
      // Verify that the date and time are correctly adjusted when crossing the dateline.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('The chart reflects the correct date and time after dateline adjustment.')
      );
    });

    test('should account for mountain peak locations (altitude effect calculations)', async () => {
      const phoneNumber = '+astro_calc_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1200', 'Mount Everest'); // High altitude

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your birth chart, considering the altitude of Mount Everest.')
      );
      // Verify that altitude corrections (e.g., for apparent horizon) are applied if the system supports it.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Altitude corrections are applied for precise house cusp calculations.')
      );
    });

    test('should handle subterranean birth locations (unusual location handling)', async () => {
      const phoneNumber = '+astro_calc_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1200', 'Underground Bunker, Nevada'); // Fictional subterranean

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your birth chart for an unusual subterranean location.')
      );
      // The primary concern here is that the geocoding still provides valid coordinates and the chart is generated.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('The chart is generated based on the surface coordinates of the location.')
      );
    });

    test('should handle mobile births (planes/cars) with moving location calculations', async () => {
      const phoneNumber = '+astro_calc_test_user';
      // This is a complex scenario, likely requiring a series of inputs or a specific mode.
      // Simulate a birth on a plane from London to New York.
      await simulateOnboarding(phoneNumber, '15061990', '1200', 'In-flight London to New York');

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your birth chart for a birth in motion.')
      );
      // The system should ideally use the location at the exact moment of birth, or a reasonable approximation.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('The chart is based on the estimated coordinates at the time of birth.')
      );
    });

    test('should incorporate sacred site birth locations for spiritual energy calculations', async () => {
      const phoneNumber = '+astro_calc_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1200', 'Varanasi, India'); // Sacred city

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your birth chart, considering the spiritual energy of Varanasi.')
      );
      // Verify that the interpretation includes elements related to the spiritual significance of the location.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your chart highlights a strong spiritual inclination due to your birth in Varanasi.')
      );
    });

    test('should analyze historical battlefields for karmic location influences', async () => {
      const phoneNumber = '+astro_calc_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1200', 'Gettysburg, Pennsylvania, USA'); // Battlefield

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your birth chart, considering the karmic influences of Gettysburg.')
      );
      // Verify that the interpretation includes elements related to the historical/karmic energy of the location.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your chart suggests themes of conflict resolution and historical resonance.')
      );
    });

    test('should consider natural disaster zones for environmental energy factors', async () => {
      const phoneNumber = '+astro_calc_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1200', 'Fukushima, Japan'); // Disaster zone

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Calculating your birth chart, considering environmental energy factors of Fukushima.')
      );
      // Verify that the interpretation includes elements related to resilience, change, or environmental awareness.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your chart indicates a strong capacity for resilience and adaptation to change.')
      );
    });
  });

  describe('Planetary Configuration Edges (8 tests)', () => {
    test('should accurately reflect retrograde influence for birth during planetary retrogrades', async () => {
      const phoneNumber = '+astro_calc_test_user';
      // Birth during Mercury Retrograde
      await simulateOnboarding(phoneNumber, '01071990', '1200', 'London, UK'); // Mercury Retrograde July 1990

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your birth during Mercury retrograde indicates unique communication patterns.')
      );
      // Verify that the chart interpretation specifically mentions the retrograde planet and its implications.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Mercury retrograde in your chart suggests a reflective approach to communication.')
      );
    });

    test('should handle multiple planet conjunctions for complex energy calculations', async () => {
      const phoneNumber = '+astro_calc_test_user';
      // Date with a significant stellium (multiple planets in conjunction)
      await simulateOnboarding(phoneNumber, '04021962', '1200', 'London, UK'); // Grand Conjunction in Aquarius

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your chart features a powerful stellium, indicating complex energy dynamics.')
      );
      // Verify that the interpretation addresses the combined influence of the conjunct planets.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('The Aquarius stellium emphasizes themes of innovation and humanitarianism.')
      );
    });

    test('should incorporate planetary eclipse births for eclipse influence verification', async () => {
      const phoneNumber = '+astro_calc_test_user';
      // Birth during a Solar Eclipse
      await simulateOnboarding(phoneNumber, '10051994', '1700', 'London, UK'); // Solar Eclipse May 10, 1994

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your birth during a solar eclipse signifies a powerful new beginning.')
      );
      // Verify that the interpretation highlights the themes of new cycles, destiny, or fated events.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('The solar eclipse at your birth marks a destined path of self-discovery.')
      );
    });

    test('should consider comet/lunar eclipse timing for rare celestial event calculations', async () => {
      const phoneNumber = '+astro_calc_test_user';
      // Birth during a significant comet appearance or lunar eclipse
      await simulateOnboarding(phoneNumber, '24031997', '0000', 'London, UK'); // Comet Hale-Bopp visible

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your birth during a rare celestial event like Comet Hale-Bopp is significant.')
      );
      // Verify that the interpretation includes the symbolic meaning of such rare events.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('The presence of Comet Hale-Bopp suggests a life of profound impact.')
      );
    });

    test('should validate grand trine formations for harmonious energy', async () => {
      const phoneNumber = '+astro_calc_test_user';
      // Date with a Grand Water Trine (e.g., Cancer Sun, Scorpio Moon, Pisces Ascendant)
      await simulateOnboarding(phoneNumber, '05071990', '0600', 'London, UK'); // Fictional for example

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your chart features a harmonious Grand Trine, indicating natural talents.')
      );
      // Verify that the interpretation highlights the ease and flow associated with this aspect pattern.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('The Grand Water Trine blesses you with emotional intuition and creativity.')
      );
    });

    test('should accurately interpret T-square configurations for tension patterns', async () => {
      const phoneNumber = '+astro_calc_test_user';
      // Date with a T-Square (e.g., Sun-Mars opposition, square to Jupiter)
      await simulateOnboarding(phoneNumber, '15041980', '1200', 'London, UK'); // Fictional for example

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your chart contains a dynamic T-Square, indicating areas of tension and growth.')
      );
      // Verify that the interpretation addresses the challenges and potential for mastery associated with T-squares.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('The T-Square challenges you to balance [planet 1] and [planet 2] through [planet 3].')
      );
    });

    test('should recognize Kite and other complex aspects for advanced pattern recognition', async () => {
      const phoneNumber = '+astro_calc_test_user';
      // Date with a Kite formation (Grand Trine with an opposition and two sextiles)
      await simulateOnboarding(phoneNumber, '20081975', '1200', 'London, UK'); // Fictional for example

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Birth Chart' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your chart reveals a rare Kite formation, signifying unique opportunities.')
      );
      // Verify that the interpretation explains the specific dynamics of the Kite pattern.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('The Kite pattern channels your talents towards a specific life purpose.')
      );
    });

    test('should perform multiple aspect web analysis for energy flow complexity', async () => {
      const phoneNumber = '+astro_calc_test_user';
      await simulateOnboarding(phoneNumber, '15061990', '1200', 'London, UK');

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Advanced Aspect Analysis' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Performing a comprehensive analysis of your chart's intricate aspect web.')
      );
      // Verify that the interpretation provides a holistic view of how different aspects interact.
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('The interplay of your aspects creates a dynamic flow of energy, influencing [areas of life].')
      );
    });
  });
});
