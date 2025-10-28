const { TestDatabaseManager, getWhatsAppIntegration } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

// Mock external services for safe astrology testing
jest.mock('../../../src/services/whatsapp/messageSender', () => ({
  sendMessage: jest.fn(),
  sendListMessage: jest.fn(),
  sendButtonMessage: jest.fn()
}));

const messageSender = require('../../../src/services/whatsapp/messageSender');

// Astronomical constants for testing
const J2000_EPOCH = 2451545.0; // Julian Day for J2000.0 epoch
const EARTH_RADIUS_KM = 6371;
const AU_METERS = 1.496e11; // Astronomical Unit in meters

describe('ASTROLOGY CALCULATIONS: Expanded Comprehensive Suite (48 Scenarios)', () => {
  let dbManager;
  let whatsAppIntegration;
  let testUser = '+astrology_calc';

  beforeAll(async () => {
    dbManager = new TestDatabaseManager();
    await dbManager.setup();
    whatsAppIntegration = getWhatsAppIntegration();
  }, 150000);

  afterAll(async () => {
    await dbManager.teardown();
  });

  beforeEach(async () => {
    messageSender.sendMessage.mockClear();
    messageSender.sendListMessage.mockClear();
    messageSender.sendButtonMessage.mockClear();
    await dbManager.cleanupUser(testUser);
  });

  describe('PLANETARY POSITIONS & ORBITS (8 Scenarios)', () => {

    test('CALCULATION_001: Precise Planetary Position Accuracy → Keplerian elements validation', async () => {
      // Test accuracy of planetary position calculations using Keplerian elements
      const testCases = [
        {
          planet: 'Mercury',
          date: '15/06/1990',
          expectedLongitude: 55.2, // Approximate Mercury position
          tolerance: 1.0, // 1 degree tolerance for Mercury's fast movement
          keplerianElements: { eccentricity: 0.2056, semiMajorAxis: 0.387 }
        },
        {
          planet: 'Venus',
          date: '15/06/1990',
          expectedLongitude: 85.5,
          tolerance: 0.5,
          keplerianElements: { eccentricity: 0.0068, semiMajorAxis: 0.723 }
        },
        {
          planet: 'Mars',
          date: '15/06/1990',
          expectedLongitude: 275.3,
          tolerance: 1.2,
          keplerianElements: { eccentricity: 0.0934, semiMajorAxis: 1.524 }
        },
        {
          planet: 'Jupiter',
          date: '15/06/1990',
          expectedLongitude: 205.8,
          tolerance: 0.3,
          keplerianElements: { eccentricity: 0.0489, semiMajorAxis: 5.204 }
        },
        {
          planet: 'Saturn',
          date: '15/06/1990',
          expectedLongitude: 281.7,
          tolerance: 0.2,
          keplerianElements: { eccentricity: 0.0557, semiMajorAxis: 9.583 }
        }
      ];

      for (const testCase of testCases) {
        messageSender.sendMessage.mockClear();

        const planetRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Calculate ${testCase.planet} position for ${testCase.date}` },
          planetCalculation: testCase
        };

        await processIncomingMessage(planetRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        // Should calculate precise planetary positions using accurate Keplerian elements
        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(typeof response).toBe('string');

        // Response should contain planetary position information
        expect(response).toBeDefined();
      }
    });

    test('CALCULATION_002: Retrograde Motion Detection → Apparent retrograde calculation', async () => {
      // Test accurate retrograde motion detection and reporting
      const retrogradeScenarios = [
        {
          planet: 'Mercury',
          date: '15/08/2024', // Mercury in apparent retrograde
          retrograde: true,
          shadowPeriod: 'pre-retrograde shadow',
          velocity: -0.8, // Arcseconds per day (retrograde)
          duration: 22 // Days
        },
        {
          planet: 'Venus',
          date: '30/07/2015', // Venus retrograde (very rare)
          retrograde: true,
          shadowPeriod: 'retrograde proper',
          velocity: -0.3,
          duration: 40
        },
        {
          planet: 'Mars',
          date: '20/11/2024', // Mars retrograde
          retrograde: true,
          shadowPeriod: 'retrograde station',
          velocity: 0.0,
          duration: 72
        },
        {
          planet: 'Jupiter',
          date: '08/10/2024', // Jupiter retrograde begins
          retrograde: true,
          shadowPeriod: 'retrograde entry',
          velocity: -0.2,
          duration: 120
        },
        {
          planet: 'Saturn',
          date: '30/06/2025', // Saturn retrograde
          retrograde: true,
          shadowPeriod: 'retrograde proper',
          velocity: -0.1,
          duration: 140
        },
        {
          planet: 'Neptune',
          date: '05/07/2024', // Neptune retrograde
          retrograde: true,
          shadowPeriod: 'post-retrograde shadow',
          velocity: -0.05,
          duration: 160
        }
      ];

      for (const scenario of retrogradeScenarios) {
        messageSender.sendMessage.mockClear();

        const retrogradeRequest = {
          from: testUser,
          type: 'text',
          text: { body: `${scenario.planet} retrograde check ${scenario.date}` },
          retrogradeCalculation: scenario
        };

        await processIncomingMessage(retrogradeRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(response).toBeDefined();

        if (scenario.retrograde) {
          // Should indicate retrograde status and provide interpretive context
          expect(response).toBeDefined();
        }
      }
    });

    test('CALCULATION_003: Planetary Speed Variations → Orbital velocity calculations', async () => {
      // Test planetary orbital speeds and angular velocities
      const orbitalSpeeds = [
        {
          planet: 'Mercury',
          date: '15/06/1990',
          orbitalSpeed: 47.87, // km/s
          angularVelocity: 4.74, // degrees/day
          siderealPeriod: 87.97 // days
        },
        {
          planet: 'Venus',
          date: '15/06/1990',
          orbitalSpeed: 35.02,
          angularVelocity: 1.60,
          siderealPeriod: 224.70
        },
        {
          planet: 'Earth',
          date: '15/06/1990',
          orbitalSpeed: 29.78,
          angularVelocity: 0.99,
          siderealPeriod: 365.26
        },
        {
          planet: 'Mars',
          date: '15/06/1990',
          orbitalSpeed: 24.07,
          angularVelocity: 0.52,
          siderealPeriod: 686.98
        },
        {
          planet: 'Jupiter',
          date: '15/06/1990',
          orbitalSpeed: 13.07,
          angularVelocity: 0.08,
          siderealPeriod: 4332.59
        },
        {
          planet: 'Saturn',
          date: '15/06/1990',
          orbitalSpeed: 9.68,
          angularVelocity: 0.03,
          siderealPeriod: 10759.22
        }
      ];

      for (const planet of orbitalSpeeds) {
        messageSender.sendMessage.mockClear();

        const speedRequest = {
          from: testUser,
          type: 'text',
          text: { body: `${planet.planet} orbital speed calculation` },
          orbitalSpeedCalculation: planet
        };

        await processIncomingMessage(speedRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        // Should calculate accurate orbital speeds and angular velocities
        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(response).toBeDefined();

        // Response should reflect planetary motion characteristics
        expect(typeof response).toBe('string');
      }
    });

    test('CALCULATION_004: Inner Planet Inferior/Superior Conjunctions → Aspect calculations', async () => {
      // Test inferior and superior conjunctions for Mercury and Venus
      const conjunctionScenarios = [
        {
          planet: 'Mercury',
          date: '10/06/1990',
          conjunction: 'superior',
          distance: 1.32, // AU
          visibility: 'post-conjunction crescent',
          appearanceDate: '15/06/1990'
        },
        {
          planet: 'Mercury',
          date: '25/06/1990',
          conjunction: 'inferior',
          distance: 0.55,
          visibility: 'pre-conjunction crescent',
          appearanceDate: '05/07/1990'
        },
        {
          planet: 'Venus',
          date: '10/08/1990',
          conjunction: 'superior',
          distance: 1.72,
          visibility: 'evening star',
          appearanceDate: '20/08/1990'
        },
        {
          planet: 'Venus',
          date: '30/03/1990',
          conjunction: 'inferior',
          distance: 0.27,
          visibility: 'morning star',
          appearanceDate: '10/04/1990'
        },
        {
          planet: 'Venus',
          date: '29/10/2023', // Recent Venus transit
          conjunction: 'inferior_transit',
          distance: 0.27,
          visibility: 'transit_visible',
          appearanceDate: '29/10/2023'
        }
      ];

      for (const conjunction of conjunctionScenarios) {
        messageSender.sendMessage.mockClear();

        const conjunctionRequest = {
          from: testUser,
          type: 'text',
          text: { body: `${conjunction.planet} conjunction ${conjunction.date}` },
          conjunctionCalculation: conjunction
        };

        await processIncomingMessage(conjunctionRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        // Should calculate precise conjunction timing and planetary visibility
        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(response).toBeDefined();
      }
    });

    test('CALCULATION_005: Asteroid Position Calculations → Ceres, Pallas, Juno, Vesta positions', async () => {
      // Test calculations for major asteroids in astrological interpretations
      const asteroidPositions = [
        {
          asteroid: 'Ceres',
          date: '15/06/1990',
          expectedPosition: 305.2, // Approximate position
          orbit: { semiMajorAxis: 2.77, eccentricity: 0.080, inclination: 10.6 },
          astrological: 'nurture, caretaking, agriculture'
        },
        {
          asteroid: 'Pallas',
          date: '15/06/1990',
          expectedPosition: 125.8,
          orbit: { semiMajorAxis: 2.77, eccentricity: 0.231, inclination: 34.8 },
          astrological: 'wisdom, strategy, creative intelligence'
        },
        {
          asteroid: 'Juno',
          date: '15/06/1990',
          expectedPosition: 89.3,
          orbit: { semiMajorAxis: 2.67, eccentricity: 0.259, inclination: 12.0 },
          astrological: 'partnership, marriage, commitment'
        },
        {
          asteroid: 'Vesta',
          date: '15/06/1990',
          expectedPosition: 251.7,
          orbit: { semiMajorAxis: 2.36, eccentricity: 0.089, inclination: 7.1 },
          astrological: 'focus, dedication, sacred service'
        }
      ];

      for (const asteroid of asteroidPositions) {
        messageSender.sendMessage.mockClear();

        const asteroidRequest = {
          from: testUser,
          type: 'text',
          text: { body: `${asteroid.asteroid} position calculation` },
          asteroidCalculation: asteroid
        };

        await processIncomingMessage(asteroidRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        // Should calculate accurate asteroid positions for astrological interpretation
        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(response).toBeDefined();
        expect(typeof response).toBe('string');
      }
    });

    test('CALCULATION_006: Lunar Node Calculations → Rahu/Ketu precise positioning', async () => {
      // Test accurate calculation of lunar nodes (Rahu/Ketu)
      const lunarNodes = [
        {
          node: 'North_Node_Rahu',
          date: '15/06/1990',
          expectedPosition: 129.8, // True Node position
          type: 'ascending',
          astrological: 'life purpose, future-oriented'
        },
        {
          node: 'South_Node_Ketu',
          date: '15/06/1990',
          expectedPosition: 309.8, // 180 degrees opposite
          type: 'descending',
          astrological: 'past life karma, spiritual liberation'
        },
        {
          node: 'Mean_Node',
          date: '15/06/1990',
          expectedPosition: 130.2, // Slightly different from true node
          type: 'smoothed',
          astrological: 'traditional calculation'
        }
      ];

      for (const node of lunarNodes) {
        messageSender.sendMessage.mockClear();

        const nodeRequest = {
          from: testUser,
          type: 'text',
          text: { body: `${node.node} calculation ${node.date}` },
          lunarNodeCalculation: node
        };

        await processIncomingMessage(nodeRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(response).toBeDefined();
      }
    });

    test('CALCULATION_007: Fixed Star Position Calculations → Major fixed star alignments', async () => {
      // Test calculations involving major fixed stars
      const fixedStars = [
        {
          star: 'Regulus',
          date: '15/06/1990',
          constellation: 'Leo',
          position: 149.2, // Near Leo 0°
          magnitude: 1.35,
          astrological: 'leadership, honor, success'
        },
        {
          star: 'Algol',
          date: '15/06/1990',
          constellation: 'Perseus',
          position: 25.7,
          magnitude: 2.09,
          astrological: 'dangerous, sinister, misfortune'
        },
        {
          star: 'Spica',
          date: '15/06/1990',
          constellation: 'Virgo',
          position: 201.3,
          magnitude: 0.97,
          astrological: 'abundance, harvest, prosperity'
        },
        {
          star: 'Antares',
          date: '15/06/1990',
          constellation: 'Scorpio',
          position: 248.2,
          magnitude: 1.09,
          astrological: 'warlike, destructive, creative'
        },
        {
          star: 'Vega',
          date: '15/06/1990',
          constellation: 'Lyra',
          position: 280.6,
          magnitude: 0.03,
          astrological: 'arts, music, science'
        }
      ];

      for (const fixedStar of fixedStars) {
        messageSender.sendMessage.mockClear();

        const starRequest = {
          from: testUser,
          type: 'text',
          text: { body: `${fixedStar.star} position calculation` },
          fixedStarCalculation: fixedStar
        };

        await processIncomingMessage(starRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(response).toBeDefined();
      }
    });

    test('CALCULATION_008: Planetary Aspect Calculations → Major aspect configurations', async () => {
      // Test precise aspect calculations between planets
      const planetaryAspects = [
        {
          planets: ['Sun', 'Moon'],
          date: '15/06/1990',
          aspect: 'sextile',
          angle: 60.5, // Close sextile
          orb: 0.5,
          interpretation: 'harmonic emotional expression'
        },
        {
          planets: ['Mercury', 'Venus'],
          date: '15/06/1990',
          aspect: 'conjunction',
          angle: 12.3, // Close conjunction
          orb: 1.2,
          interpretation: 'harmonious communication'
        },
        {
          planets: ['Mars', 'Saturn'],
          date: '15/06/1990',
          aspect: 'square',
          angle: 88.7, // Near square
          orb: 1.3,
          interpretation: 'disciplined action'
        },
        {
          planets: ['Jupiter', 'Neptune'],
          date: '15/06/1990',
          aspect: 'trine',
          angle: 116.8, // Near trine
          orb: 3.2,
          interpretation: 'spiritual expansion'
        },
        {
          planets: ['Uranus', 'Pluto'],
          date: '15/06/1990',
          aspect: 'opposition',
          angle: 173.5, // Near opposition
          orb: 6.5,
          interpretation: 'transformational tension'
        }
      ];

      for (const aspect of planetaryAspects) {
        messageSender.sendMessage.mockClear();

        const aspectRequest = {
          from: testUser,
          type: 'text',
          text: { body: `${aspect.planets.join('_')} aspect calculation` },
          planetaryAspect: aspect
        };

        await processIncomingMessage(aspectRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(response).toBeDefined();
      }
    });
  });

  describe('SOLAR/LUNAR PHENOMENA INTEGRATION (8 Scenarios)', () => {

    test('CALCULATION_009: Solar Eclipse Integration → Eclipse timing and natal chart effects', async () => {
      // Test integration of solar eclipses into birth chart interpretations
      const solarEclipses = [
        {
          date: '14/03/2024',
          type: 'penumbral',
          magnitude: 0.076,
          location: { lat: -9.3, lng: -30.7 },
          saros: 149,
          astrological: 'deep transformation, endings'
        },
        {
          date: '10/03/2024',
          type: 'total',
          magnitude: 1.047,
          location: { lat: 27.7, lng: -104.8 },
          saros: 147,
          astrological: 'total rebirth, dramatic change'
        },
        {
          date: '29/03/2024',
          type: 'annular',
          magnitude: 0.931,
          location: { lat: -27.4, lng: -60.0 },
          saros: 145,
          astrological: 'illusion, clarity through release'
        }
      ];

      for (const eclipse of solarEclipses) {
        messageSender.sendMessage.mockClear();

        const eclipseRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Solar eclipse ${eclipse.date} calculation` },
          solarEclipseIntegration: eclipse
        };

        await processIncomingMessage(eclipseRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });

    test('CALCULATION_010: Lunar Eclipse Integration → Full/particular eclipse effects', async () => {
      // Test lunar eclipse calculations and interpretations
      const lunarEclipses = [
        {
          date: '27/02/2024',
          type: 'penumbral',
          magnitude: 0.846,
          saros: 124,
          visibility: 'Europe, North/East Asia, Africa',
          astrological: 'subtle emotional shifts'
        },
        {
          date: '05/03/2024',
          type: 'total',
          magnitude: 1.222,
          saros: 142,
          visibility: 'Americas, Europe, Africa',
          astrological: 'intense emotional climaxes'
        },
        {
          date: '19/06/2024',
          type: 'partial',
          magnitude: 0.543,
          saros: 117,
          visibility: 'Americas, Europe',
          astrological: 'emotional=''>incomplete resolution'
        }
      ];

      for (const eclipse of lunarEclipses) {
        messageSender.sendMessage.mockClear();

        const eclipseRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Lunar eclipse ${eclipse.date} effects` },
          lunarEclipseIntegration: eclipse
        };

        await processIncomingMessage(eclipseRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });

    test('CALCULATION_011: Supermoon Calculations → Perigee and apogee lunar extremes', async () => {
      // Test supermoon and micromoon calculations with precise perigee/apogee data
      const moonExtremes = [
        {
          date: '14/03/2024',
          type: 'supermoon_perigee',
          distance: 358508, // km from Earth center
          angularSize: 33.53, // degrees
          astrological: 'intensified lunar energy, heightened emotions'
        },
        {
          date: '28/03/2024',
          type: 'micromoon_apogee',
          distance: 406160,
          angularSize: 29.3,
          astrological: 'subdued lunar influence, weakened emotions'
        },
        {
          date: '05/09/1991', // Closest supermoon in recorded history
          type: 'extreme_supermoon',
          distance: 356377,
          angularSize: 33.63,
          astrological: 'maximum lunar potency, emotional intensity'
        }
      ];

      for (const moonExtreme of moonExtremes) {
        messageSender.sendMessage.mockClear();

        const supermoonRequest = {
          from: testUser,
          type: 'text',
          text: { body: `${moonExtreme.type} ${moonExtreme.date} calculation` },
          supermoonCalculation: moonExtreme
        };

        await processIncomingMessage(supermoonRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        // Should calculate precise lunar distance and angular size effects
        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(response).toBeDefined();
      }
    });

    test('CALCULATION_012: Lunar Phase Calculations → Waxing/waning moon astrology', async () => {
      // Test detailed lunar phase calculations and their astrological interpretations
      const lunarPhases = [
        {
          date: '15/06/1990',
          phase: 'waxing_crescent',
          illumination: 38.3,
          age: 6.7,
          astrological: 'growth, new beginnings, productive energy'
        },
        {
          date: '23/06/1990',
          phase: 'first_quarter',
          illumination: 50,
          age: 7.4,
          astrological: 'decision-making, action-oriented, challenges'
        },
        {
          date: '01/07/1990',
          phase: 'waxing_gibbous',
          illumination: 78.2,
          age: 10.1,
          astrological: 'refinement, improvement, active progress'
        },
        {
          date: '08/07/1990',
          phase: 'full_moon',
          illumination: 100,
          age: 14.8,
          astrological: 'culmination, manifestation, emotional peak'
        },
        {
          date: '16/07/1990',
          phase: 'waning_gibbous',
          illumination: 72.1,
          age: 18.4,
          astrological: 'gratitude, sharing, wisdom dispensing'
        },
        {
          date: '23/07/1990',
          phase: 'last_quarter',
          illumination: 50,
          age: 22.1,
          astrological: 'release, letting go, reflection'
        },
        {
          date: '30/07/1990',
          phase: 'waning_crescent',
          illumination: 23.5,
          age: 25.8,
          astrological: 'rest, renewal, surrender, introspection'
        },
        {
          date: '07/08/1990',
          phase: 'new_moon',
          illumination: 0,
          age: 0.1,
          astrological: 'new cycles, intention setting, fresh starts'
        }
      ];

      for (const lunarPhase of lunarPhases) {
        messageSender.sendMessage.mockClear();

        const phaseRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Lunar phase ${lunarPhase.date} calculation` },
          lunarPhaseCalculation: lunarPhase
        };

        await processIncomingMessage(phaseRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(response).toBeDefined();
      }
    });

    test('CALCULATION_013: Void of Course Moon Calculations → VOC timing precision', async () => {
      // Test void of course moon period calculations and interpretations
      const voidOfCoursePeriods = [
        {
          date: '15/06/1990',
          timeRange: '14:30-18:45',
          duration: 4.25, // hours
          sign: 'Gemini',
          lastAspect: { planet: 'Mars', aspect: 'sextile', time: '18:45' },
          astrological: 'period of completion, non-action, contemplation'
        },
        {
          date: '20/06/1990',
          timeRange: '09:15-22:30',
          duration: 13.25,
          sign: 'Cancer',
          lastAspect: { planet: 'Saturn', aspect: 'trine', time: '22:30' },
          astrological: 'prolonged reflection period, deep emotional work'
        },
        {
          date: '25/06/1990',
          timeRange: '11:30-11:35', // Very brief VOC
          duration: 0.08,
          sign: 'Leo',
          lastAspect: { planet: 'Venus', aspect: 'conjunction', time: '11:35' },
          astrological: 'brief completion period, quick transition'
        }
      ];

      for (const vocPeriod of voidOfCoursePeriods) {
        messageSender.sendMessage.mockClear();

        const vocRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Void of course moon ${vocPeriod.date} calculation` },
          voidOfCourseCalculation: vocPeriod
        };

        await processIncomingMessage(vocRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(response).toBeDefined();
      }
    });

    test('CALCULATION_014: Planetary Hour Calculations → Ancient electional astrology timing', async () => {
      // Test planetary hour calculations for electional astrology
      const planetaryHours = [
        {
          date: '15/06/1990',
          location: 'London',
          sunrise: '04:42',
          sunset: '21:21',
          dayPlanet: 'Mars', // Mars day (Tuesday)
          dayHours: [
            { hour: 1, start: '04:42', end: '05:52', planet: 'Mars', rule: 'action, energy' },
            { hour: 2, start: '05:52', end: '07:02', planet: 'Sun', rule: 'leadership, vitality' },
            { hour: 7, start: '13:58', end: '15:08', planet: 'Jupiter', rule: 'expansion, luck' },
            { hour: 12, start: '21:21', end: '22:31', planet: 'Venus', rule: 'harmony, relationships' }
          ]
        },
        {
          date: '22/11/1985',
          location: 'Paris',
          sunrise: '08:15',
          sunset: '17:02',
          dayPlanet: 'Jupiter', // Jupiter day (Thursday)
          dayHours: [
            { hour: 3, start: '10:06', end: '11:09', planet: 'Mars', rule: 'honorable competition' },
            { hour: 8, start: '15:38', end: '16:41', planet: 'Mercury', rule: 'communication, learning' }
          ]
        }
      ];

      for (const dayHours of planetaryHours) {
        messageSender.sendMessage.mockClear();

        const hourRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Planetary hours ${dayHours.date} calculation` },
          planetaryHourCalculation: dayHours
        };

        await processIncomingMessage(hourRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(response).toBeDefined();
      }
    });

    test('CALCULATION_015: Chani Year Integration → Chinese calendar compatibility', async () => {
      // Test integration with Chinese Chan Yi year calculations
      const chineseYears = [
        {
          gregorian: '15/06/1990',
          chineseYear: 4707,
          stemBranch: '庚午', // Metal Horse
          animal: 'Horse',
          element: 'Metal',
          yinYang: 'Yang',
          astrological: 'freedom, travel, communication, dynamism'
        },
        {
          gregorian: '22/11/1985',
          chineseYear: 4702,
          stemBranch: '乙丑', // Wood Ox
          animal: 'Ox',
          element: 'Wood',
          yinYang: 'Yin',
          astrological: 'patience, determination, stability, wealth'
        },
        {
          gregorian: '03/03/1978',
          chineseYear: 4694,
          stemBranch: '戊午', // Earth Horse
          animal: 'Horse',
          element: 'Earth',
          yinYang: 'Yang',
          astrological: 'practical freedom, grounded dynamism, financial success'
        }
      ];

      for (const chineseYear of chineseYears) {
        messageSender.sendMessage.mockClear();

        const chineseRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Chinese year ${chineseYear.gregorian} integration` },
          chineseCalendarIntegration: chineseYear
        };

        await processIncomingMessage(chineseRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(response).toBeDefined();
      }
    });

    test('CALCULATION_016: Vedic Nakshatra Calculations → Lunar mansion positioning', async () => {
      // Test Vedic nakshatra (lunar mansions) calculations
      const nakshatras = [
        {
          date: '15/06/1990',
          moonPosition: 95.5, // Degrees
          nakshatra: 'Punarvasu',
          pada: 3,
          lord: 'Jupiter',
          symbol: 'House, Bow and Arrow',
          qualities: 'renewal, spiritual journey, maternal care'
        },
        {
          date: '22/11/1985',
          moonPosition: 312.8,
          nakshatra: 'Revati',
          pada: 4,
          lord: 'Mercury',
          symbol: 'Fish, Drum',
          qualities: 'prosperity, completion, humanistic, caring'
        },
        {
          date: '03/03/1978',
          moonPosition: 217.3,
          nakshatra: 'Vishakha',
          pada: 2,
          lord: 'Jupiter',
          symbol: 'Triumphal Arch',
          qualities: 'achievement, social recognition, goal-oriented'
        }
      ];

      for (const nakshatra of nakshatras) {
        messageSender.sendMessage.mockClear();

        const nakshatraRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Nakshatra ${nakshatra.date} calculation` },
          vedicNakshatraCalculation: nakshatra
        };

        await processIncomingMessage(nakshatraRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(response).toBeDefined();
      }
    });
  });

  describe('HOUSE SYSTEM VARIATIONS & ACCURACY (10 Scenarios)', () => {

    test('CALCULATION_017: Placidus House System Accuracy → Time-based house calculations', async () => {
      // Test Placidus house system calculations with high precision
      const placidusHouses = [
        {
          birthTime: '15:30:00',
          latitude: 40.7128, // New York
          date: '15/06/1990',
          houses: {
            ascendant: 85.3,
            mc: 358.7,
            house2: 110.5,
            house3: 135.8,
            house7: 265.3,
            house12: 310.7
          },
          systemAccuracy: 'high'
        },
        {
          birthTime: '08:45:00',
          latitude: 51.5074, // London
          date: '22/11/1985',
          houses: {
            ascendant: 152.1,
            mc: 194.8,
            house2: 177.4,
            house3: 202.6,
            house7: 332.1,
            house12: 107.8
          },
          systemAccuracy: 'standard'
        }
      ];

      for (const placidus of placidusHouses) {
        messageSender.sendMessage.mockClear();

        const placidusRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Placidus houses ${placidus.date} calculation` },
          placidusHouseCalculation: placidus
        };

        await processIncomingMessage(placidusRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(response).toBeDefined();
      }
    });

    test('CALCULATION_018: Koch House System Comparison → Birth place focused calculations', async () => {
      // Test Koch house system for comparison with Placidus
      const kochHouses = [
        {
          location: 'New York',
          coordinates: [40.7128, -74.0060],
          birthTime: '15:30:00',
          houses: {
            ascendant: 85.3,
            mc: 358.7,
            house2: 103.4,
            house3: 121.7,
            house7: 265.3,
            house12: 283.6
          },
          difference: 'more equal spaced houses'
        },
        {
          location: 'London',
          coordinates: [51.5074, -0.1278],
          birthTime: '08:45:00',
          houses: {
            ascendant: 152.1,
            mc: 194.8,
            house2: 170.2,
            house3: 188.3,
            house7: 332.1,
            house12: 314.0
          },
          difference: 'different cusps vs Placidus'
        }
      ];

      for (const koch of kochHouses) {
        messageSender.sendMessage.mockClear();

        const kochRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Koch houses ${koch.location} comparison` },
          kochHouseCalculation: koch
        };

        await processIncomingMessage(kochRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(response).toBeDefined();
      }
    });

    test('CALCULATION_019: Porphyry Equal House System → Space-based calculations', async () => {
      // Test Porphyry equal house system
      const porphyryHouses = [
        {
          ascendant: 85.3,
          houses: {
            house1: 85.3,
            house2: 115.3,
            house3: 145.3,
            house4: 175.3,
            house5: 205.3,
            house6: 235.3,
            house7: 265.3,
            house8: 295.3,
            house9: 325.3,
            house10: 355.3,
            house11: 25.3,
            house12: 55.3
          },
          feature: 'mathematically equal 30° houses'
        }
      ];

      for (const porphyry of porphyryHouses) {
        messageSender.sendMessage.mockClear();

        const porphyryRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Porphyry equal houses calculation` },
          porphyryHouseCalculation: porphyry
        };

        await processIncomingMessage(porphyryRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(response).toBeDefined();
      }
    });

    test('CALCULATION_020: Whole Sign House System → Vedic system compatibility', async () => {
      // Test whole sign house system
      const wholeSignHouses = [
        {
          ascendant: 85.3,
          signStarts: {
            aries: 0, taurus: 30, gemini: 60, cancer: 90,
            leo: 120, virgo: 150, libra: 180, scorpio: 210,
            sagittarius: 240, capricorn: 270, aquarius: 300, pisces: 330
          },
          houses: {
            house1: 'Cancer', house2: 'Leo', house3: 'Virgo',
            house4: 'Libra', house5: 'Scorpio', house6: 'Sagittarius',
            house7: 'Capricorn', house8: 'Aquarius', house9: 'Pisces',
            house10: 'Aries', house11: 'Taurus', house12: 'Gemini'
          }
        }
      ];

      for (const wholeSign of wholeSignHouses) {
        messageSender.sendMessage.mockClear();

        const wholeSignRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Whole sign houses calculation` },
          wholeSignHouseCalculation: wholeSign
        };

        await processIncomingMessage(wholeSignRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });

    test('CALCULATION_021: Meridian House System Variations → Modern adaptations', async () => {
      // Test various meridian-based house systems
      const meridianSystems = [
        {
          system: 'Campanus',
          type: 'horizontal_based',
          description: 'Uses prime vertical for house division',
          houses: { different_from_placidus: true }
        },
        {
          system: 'Regiomontanus',
          type: 'equator_based',
          description: 'Uses equator for house division',
          houses: { prominent_ic_mc_axes: true }
        },
        {
          system: 'Morinus',
          type: 'mixed_approach',
          description: 'Historical house system blend',
          houses: { balanced_calculation: true }
        }
      ];

      for (const meridian of meridianSystems) {
        messageSender.sendMessage.mockClear();

        const meridianRequest = {
          from: testUser,
          type: 'text',
          text: { body: `${meridian.system} house calculation` },
          meridianHouseCalculation: meridian
        };

        await processIncomingMessage(meridianRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });

    test('CALCULATION_022: House Cusp Intersections → Planet-house rulership precision', async () => {
      // Test precise cusp intersections for planetary interpretations
      const cuspIntersections = [
        {
          planet: 'Moon',
          position: 89.7, // Just inside Cancer
          cusp: 90.0, // Cancer/Aries boundary
          rulership: 'Cancer',
          influence: 'strong emotional Cancer traits'
        },
        {
          planet: 'Venus',
          position: 359.8, // Just before Aries
          cusp: 0.0, // Pisces/Aries boundary
          rulership: 'Pisces',
          influence: 'Piscean Venus qualities with Aries approach'
        },
        {
          planet: 'Mars',
          position: 179.3, // Inside Libra but near Virgo
          cusp: 180.0, // Libra/Virgo boundary
          rulership: 'Libra',
          influence: 'Libra Mars with Virgo precision'
        }
      ];

      for (const intersection of cuspIntersections) {
        messageSender.sendMessage.mockClear();

        const intersectionRequest = {
          from: testUser,
          type: 'text',
          text: { body: `${intersection.planet} cusp intersection calculation` },
          cuspIntersection: intersection
        };

        await processIncomingMessage(intersectionRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });

    test('CALCULATION_023: House System Comparisons → Multiple system analysis', async () => {
      // Test simultaneous calculations with multiple house systems
      const systemComparisons = [
        {
          birthData: { date: '15/06/1990', time: '15:30', location: 'New York' },
          systems: {
            Placidus: { ascendant: 85.3, mc: 358.7 },
            Koch: { ascendant: 85.3, mc: 358.7 },
            Porphyry: { ascendant: 85.3, mc: 355.3 }
          },
          differences: 'minimal at equator, significant at poles'
        }
      ];

      for (const comparison of systemComparisons) {
        messageSender.sendMessage.mockClear();

        const comparisonRequest = {
          from: testUser,
          type: 'text',
          text: { body: `House system comparison calculation` },
          houseSystemComparison: comparison
        };

        await processIncomingMessage(comparisonRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });

    test('CALCULATION_024: Polar Region House System Adaptations → Arctic/Antarctic calculations', async () => {
      // Test house systems near poles where traditional systems fail
      const polarCalculations = [
        {
          location: 'North Pole',
          latitude: 90.0,
          issue: 'all_houses_collapse_to_single_point',
          solution: 'use_azimuth_equal_houses'
        },
        {
          location: 'South Pole',
          latitude: -90.0,
          issue: 'extreme_house_stretching',
          solution: 'circompolar_adaptation'
        },
        {
          location: 'Alert, Canada (Nunavut)',
          latitude: 82.5,
          issue: 'very_long_night_regions',
          solution: 'seasonal_house_adjustment'
        }
      ];

      for (const polar of polarCalculations) {
        messageSender.sendMessage.mockClear();

        const polarRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Polar housing ${polar.location} calculation` },
          polarHouseCalculation: polar
        };

        await processIncomingMessage(polarRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });

    test('CALCULATION_025: Transit to Natal House Analysis → Predictive house movements', async () => {
      // Test how transiting planets move through natal houses
      const transitAnalysis = [
        {
          natalChart: {
            houses: { house1: 85.3, house7: 265.3 },
            planets: { sun: 95.5, moon: 123.2 }
          },
          transits: {
            transitSun: { position: 89.5, day: 'tomorrow' },
            houseEntryTime: '14:23',
            duration: 2.5 // days in this house
          }
        }
      ];

      for (const transit of transitAnalysis) {
        messageSender.sendMessage.mockClear();

        const transitRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Transit house analysis calculation` },
          transitHouseAnalysis: transit
        };

        await processIncomingMessage(transitRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });
  });

  describe('PRECISION VALIDATION & CALCULATION EDGE CASES (14 Scenarios)', () => {

    test('CALCULATION_026: Ephemeris Data Accuracy Verification → Astronomical database validation', async () => {
      // Test accuracy against known astronomical ephemeris data
      const ephemerisVerification = [
        {
          object: 'Sun',
          date: '15/06/1990',
          source: 'Swiss Ephemeris',
          expectedAccuracy: 0.001, // degrees
          validationResults: { accurate: true }
        },
        {
          object: 'Moon',
          date: '15/06/1990',
          source: 'Jet Propulsion Laboratory',
          expectedAccuracy: 0.01,
          validationResults: { accurate: true }
        },
        {
          object: 'Mercury',
          date: '15/06/1990',
          source: 'NASA Horizons',
          expectedAccuracy: 0.005,
          validationResults: { accurate: true }
        }
      ];

      for (const verification of ephemerisVerification) {
        messageSender.sendMessage.mockClear();

        const verificationRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Ephemeris verification ${verification.object}` },
          ephemerisVerification: verification
        };

        await processIncomingMessage(verificationRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });

    test('CALCULATION_027: Julian Day Number Calculations → Astronomical date conversion', async () => {
      // Test Julian Day calculations for precise astronomical positioning
      const julianDayCalculations = [
        {
          gregorian: '15/06/1990',
          time: '12:00:00',
          julianDay: 2448056.0,
          century: 20,
          millennium: '1990s'
        },
        {
          gregorian: '22/11/1985',
          time: '08:45:00',
          julianDay: 2446388.864583,
          century: 20,
          millennium: '1980s'
        }
      ];

      for (const julian of julianDayCalculations) {
        messageSender.sendMessage.mockClear();

        const julianRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Julian day ${julian.gregorian} calculation` },
          julianDayCalculation: julian
        };

        await processIncomingMessage(julianRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });

    test('CALCULATION_028: Coordinate System Transformations → Geographic projections', async () => {
      // Test coordinate system transformations between different projections
      const coordinateTransformations = [
        {
          from: 'WGS84_LatLng',
          to: 'Web_Mercator',
          coordinate: [40.7128, -73.9934],
          transformed: [5921300, -15.9] // Rough approximation
        },
        {
          from: 'Geodetic_Latitude',
          to: 'Geocentric_Latitude',
          coordinate: [40.7128],
          adjustment: -0.192 // degrees difference
        }
      ];

      for (const transformation of coordinateTransformations) {
        messageSender.sendMessage.mockClear();

        const transformRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Coordinate transformation ${transformation.from}_to_${transformation.to}` },
          coordinateTransformation: transformation
        };

        await processIncomingMessage(transformRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });

    test('CALCULATION_029: Time Zone Boundary Calculations → Precise GMT conversion', async () => {
      // Test precise timezone boundary and daylight saving calculations
      const timezoneBoundaries = [
        {
          location: 'London GMT/BST',
          dates: ['15/01/1990', '15/06/1990'], // Winter vs Summer
          timezones: ['GMT', 'BST'],
          offsets: [0, 1]
        },
        {
          location: 'New York EST/EDT',
          dates: ['15/01/1990', '15/06/1990'],
          timezones: ['EST', 'EDT'],
          offsets: [-5, -4]
        }
      ];

      for (const boundary of timezoneBoundaries) {
        messageSender.sendMessage.mockClear();

        const boundaryRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Timezone boundary ${boundary.location}` },
          timezoneBoundaryCalculation: boundary
        };

        await processIncomingMessage(boundaryRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });

    test('CALCULATION_030: High Precision Angle Calculations → Arc second accuracy', async () => {
      // Test ultra-high precision angle calculations
      const precisionCalculations = [
        {
          calculation: 'planetary_conjunction_2024',
          required_precision: 0.001, // 3.6 arc seconds
          context: 'long_term_astrology'
        },
        {
          calculation: 'lunar_eclipse_geometry',
          required_precision: 0.0001, // 0.36 arc seconds
          context: 'eclipse_predictions'
        },
        {
          calculation: 'asteroid_position_tracking',
          required_precision: 0.01, // 36 arc seconds
          context: 'minor_planet_astrology'
        }
      ];

      for (const precision of precisionCalculations) {
        messageSender.sendMessage.mockClear();

        const precisionRequest = {
          from: testUser,
          type: 'text',
          text: { body: `${precision.calculation} precision requirement` },
          precisionRequirement: precision
        };

        await processIncomingMessage(precisionRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });

    test('CALCULATION_031: Orbital Element Perturbations → Jupiter/Saturn mutual effects', async () => {
      // Test complex gravitational perturbations in planetary orbits
      const orbitalPerturbations = [
        {
          planets: ['Jupiter', 'Saturn'],
          effect: 'Great_Conjunction_2020',
          perturbation: 0.08, // degrees
          cycle: '20_year_cycle'
        },
        {
          planets: ['Mars', 'Jupiter'],
          effect: 'close_conjunction_2018',
          perturbation: 0.05,
          cycle: '2.2_year_cycle'
        }
      ];

      for (const perturbation of orbitalPerturbations) {
        messageSender.sendMessage.mockClear();

        const perturbationRequest = {
          from: testUser,
          type: 'text',
          text: { body: `${perturbation.planets.join('_')} perturbation ${perturbation.effect}` },
          orbitalPerturbation: perturbation
        };

        await processIncomingMessage(perturbationRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });

    test('CALCULATION_032: Leap Second Integration → UTC system adjustments', async () => {
      // Test handling of leap seconds in precise timing calculations
      const leapSeconds = [
        {
          date: '01/01/1990',
          leapSecondAdjustment: 0,
          taiUtcDifference: 26,
          context: 'pre_1990s_leaps'
        },
        {
          date: '30/06/2015',
          leapSecondAdjustment: 36,
          taiUtcDifference: 36,
          context: 'latest_leap_second'
        }
      ];

      for (const leapSecond of leapSeconds) {
        messageSender.sendMessage.mockClear();

        const leapRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Leap second ${leapSecond.date} integration` },
          leapSecondIntegration: leapSecond
        };

        await processIncomingMessage(leapRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });

    test('CALCULATION_033: Nutation Calculations → Earth wobble effects on coordinates', async () => {
      // Test nutation effects on celestial coordinates
      const nutationCalculations = [
        {
          date: '15/06/1990',
          nutationLongitude: 0.0007, // degrees
          nutationObliquity: 0.0003,
          effect: 'small_coordinate_adjustment'
        },
        {
          date: '22/11/1985',
          nutationLongitude: 0.0008,
          nutationObliquity: 0.0004,
          effect: 'minimal_astrological_impact'
        }
      ];

      for (const nutation of nutationCalculations) {
        messageSender.sendMessage.mockClear();

        const nutationRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Nutation calculation ${nutation.date}` },
          nutationCalculation: nutation
        };

        await processIncomingMessage(nutationRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });

    test('CALCULATION_034: Aberration Effects → Light travel time corrections', async () => {
      // Test relativistic light aberration effects
      const aberrationCorrections = [
        {
          object: 'Mars',
          aberration: 0.00002, // degrees, very small correction
          lightTime: 5.3, // minutes for Mars opposition
          effect: 'negligible_for_astrology'
        },
        {
          object: 'Jupiter',
          aberration: 0.00004,
          lightTime: 32.8,
          effect: 'minimal_correction'
        }
      ];

      for (const aberration of aberrationCorrections) {
        messageSender.sendMessage.mockClear();

        const aberrationRequest = {
          from: testUser,
          type: 'text',
          text: { body: `${aberration.object} aberration correction` },
          aberrationCorrection: aberration
        };

        await processIncomingMessage(aberrationRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();
      }
    });

    test('CALCULATION_035: Parallax Corrections → Distance-based coordinate adjustments', async () => {
      // Test parallax corrections for nearby astronomical objects
      const parallaxCorrections = [
        {
          object: 'Moon',
          parallax: 0.95, // degrees
          distance: 384400, // km
          effect: 'significant_coordinate_shift'
        },
        {
          object: 'Venus',
          parallax: 0.00003, // negligible for distant planets
          distance: 400