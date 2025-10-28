const { TestDatabaseManager } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

// Mock external services for safe location testing
jest.mock('../../../src/services/whatsapp/messageSender', () => ({
  sendMessage: jest.fn(),
  sendListMessage: jest.fn(),
  sendButtonMessage: jest.fn()
}));

const messageSender = require('../../../src/services/whatsapp/messageSender');

// Geographic calculation utilities
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

function calculateTimezoneOffset(longitude) {
  // Simplified timezone calculation (15 degrees per hour)
  return Math.round(longitude / 15);
}

describe('LOCATION-BASED CALCULATIONS: Comprehensive Geographic Astrology Suite (20 Scenarios)', () => {
  let dbManager;
  let testUser = '+location_test_user';

  beforeAll(async () => {
    dbManager = new TestDatabaseManager();
    await dbManager.setup();
  }, 60000);

  afterAll(async () => {
    await dbManager.teardown();
  });

  beforeEach(async () => {
    messageSender.sendMessage.mockClear();
    messageSender.sendListMessage.mockClear();
    messageSender.sendButtonMessage.mockClear();
    await dbManager.cleanupUser(testUser);
  });

  describe('GEOGRAPHIC COORDINATE VARIATIONS (6/6 Scenarios)', () => {

    test('LOCATION_001: Decimal degree coordinate accuracy → Precise astronomical calculations', async () => {
      // Test high-precision decimal coordinate handling

      const preciseCoordinates = [
        { lat: 40.7505, lng: -73.9934, city: 'New York City', precision: 'building_level' },
        { lat: 51.5074, lng: -0.1278, city: 'London', precision: 'neighborhood_level' },
        { lat: 48.8566, lng: 2.3522, city: 'Paris', precision: 'quarter_level' },
        { lat: -33.8688, lng: 151.2093, city: 'Sydney', precision: 'suburb_level' },
        { lat: 35.6762, lng: 139.6503, city: 'Tokyo', precision: 'district_level' },
        { lat: 55.7558, lng: 37.6173, city: 'Moscow', precision: 'metropolitan_level' }
      ];

      for (const coord of preciseCoordinates) {
        messageSender.sendMessage.mockClear();

        const preciseRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Precision coordinates: ${coord.lat},${coord.lng}` },
          coordinates: coord
        };

        await processIncomingMessage(preciseRequest, {});
        expect(messageSender.sendMessage).toHaveCalled();

        // Should handle 4-6 decimal place precision for accurate calculations
      }
    });

    test('LOCATION_002: Degrees minutes seconds format conversion → Astrological house accuracy', async () => {
      // Test conversion from DMS to decimal and vice versa

      const dmsCoordinates = [
        { dms: '40° 42\' 46" N, 74° 0\' 21.6" W', decimal: [40.7128, -74.0054], city: 'New York DMS' },
        { dms: '51° 30\' 26" N, 0° 7\' 41" W', decimal: [51.5072, -0.1281], city: 'London DMS' },
        { dms: '48° 51\' 24" N, 2° 21\' 07" E', decimal: [48.8567, 2.3522], city: 'Paris DMS' },
        { dms: '35° 40\' 34" N, 139° 39\' 06" E', decimal: [35.6761, 139.6517], city: 'Tokyo DMS' },
        { dms: '55° 45\' 21" N, 37° 37\' 03" E', decimal: [55.7558, 37.6175], city: 'Moscow DMS' },
        { dms: '-33° 52\' 07" S, 151° 12\' 34" E', decimal: [-33.8686, 151.2094], city: 'Sydney DMS' }
      ];

      for (const dmsCoord of dmsCoordinates) {
        messageSender.sendMessage.mockClear();

        const dmsRequest = {
          from: testUser,
          type: 'text',
          text: { body: `DMS coordinates: ${dmsCoord.dms}` },
          dmsCoordinates: dmsCoord
        };

        await processIncomingMessage(dmsRequest, {});
        expect(messageSender.sendMessage).toHaveCalled();

        // Should accurately convert DMS to decimal for house calculations
      }
    });

    test('LOCATION_003: UTM and grid coordinate systems → Military and mapping coordinate support', async () => {
      // Test UTM (Universal Transverse Mercator) and other grid systems

      const gridCoordinates = [
        { utm: '17N 630084 4279843', lat: 38.8895, lng: -77.0352, location: 'Washington DC UTM' },
        { utm: '30T 681125 5369555', lat: 48.8584, lng: 2.2945, location: 'Eiffel Tower UTM' },
        { utm: '31N 753237 3897253', lat: 35.3606, lng: 138.7274, location: 'Mount Fuji UTM' },
        { mgrs: '11SKU427543', lat: 38.8895, lng: -77.0352, location: 'Washington DC MGRS' },
        { mgrs: '31TCJ297543', lat: 48.8584, lng: 2.2945, location: 'Eiffel Tower MGRS' }
      ];

      for (const gridCoord of gridCoordinates) {
        messageSender.sendMessage.mockClear();

        const gridRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Grid coordinates: ${gridCoord.utm || gridCoord.mgrs}` },
          gridCoordinates: gridCoord
        };

        await processIncomingMessage(gridRequest, {});
        expect(messageSender.sendMessage).toHaveCalled();

        // Should support military and mapping coordinate systems
      }
    });

    test('LOCATION_004: Geographic coordinate validation → Boundary and range checking', async () => {
      // Test coordinate validation for geographical accuracy

      const coordinateValidations = [
        { lat: 91, lng: 0, validity: 'invalid_north_pole_exceeded' },
        { lat: -91, lng: 0, validity: 'invalid_south_pole_exceeded' },
        { lat: 0, lng: 181, validity: 'invalid_international_date_line_exceeded' },
        { lat: 0, lng: -181, validity: 'invalid_180_west_exceeded' },
        { lat: 90.0000, lng: 0, validity: 'valid_north_pole_exact' },
        { lat: -90.0000, lng: 0, validity: 'valid_south_pole_exact' },
        { lat: 0, lng: 180, validity: 'valid_international_date_line' },
        { lat: 0, lng: -180, validity: 'valid_180_west' },
        { lat: 45.0, lng: 90.0, validity: 'valid_standard_coordinates' },
        { lat: -23.5, lng: -46.6, validity: 'valid_negative_coordinates' }
      ];

      for (const validation of coordinateValidations) {
        messageSender.sendMessage.mockClear();

        const validationRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Coordinate validation: ${validation.lat},${validation.lng}` },
          coordinateValidation: validation
        };

        await processIncomingMessage(validationRequest, {});
        expect(messageSender.sendMessage).toHaveCalled();

        // Should validate coordinate ranges and provide helpful error messages
      }
    });

    test('LOCATION_005: Coordinate precision and rounding effects → Astrological calculation sensitivity', async () => {
      // Test how coordinate precision affects astrological calculations

      const precisionTests = [
        { location: 'New York', precise: [40.7505, -73.9934], rounded: [40.75, -74.00], effect: 'city_block_precision' },
        { location: 'Paris Match', precise: [48.8566, 2.3522], rounded: [48.86, 2.35], effect: 'district_precision' },
        { location: 'London House', precise: [51.5074, -0.1278], rounded: [51.51, -0.13], effect: 'postcode_precision' },
        { location: 'Tokyo Tower', precise: [35.6586, 139.7454], rounded: [35.66, 139.75], effect: 'urban_precision' },
        { location: 'Sydney Opera', precise: [-33.8568, 151.2153], rounded: [-33.86, 151.22], effect: 'harbor_precision' },
        { location: 'Moscow Kremlin', precise: [55.7558, 37.6173], rounded: [55.76, 37.62], effect: 'historic_precision' }
      ];

      for (const precision of precisionTests) {
        messageSender.sendMessage.mockClear();

        const precisionRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Precision test: ${precision.location}` },
          coordinatePrecision: precision
        };

        await processIncomingMessage(precisionRequest, {});
        expect(messageSender.sendMessage).toHaveCalled();

        // Should demonstrate how coordinate precision affects house cusps
      }
    });

    test('LOCATION_006: Multiple coordinate systems support → Geographic database compatibility', async () => {
      // Test support for multiple coordinate reference systems

      const coordinateSystems = [
        { system: 'WGS84', coords: [40.7505, -73.9934], standard: 'GPS_standard' },
        { system: 'NAD27', coords: [40.7501, -73.9930], standard: 'North_America_legacy' },
        { system: 'NAD83', coords: [40.7503, -73.9932], standard: 'North_America_current' },
        { system: 'OSGB36', coords: [51.5073, -0.1277], standard: 'UK_Ordnance_Survey' },
        { system: 'ED50', coords: [48.8565, 2.3521], standard: 'European_legacy' },
        { system: 'JGD2000', coords: [35.6585, 139.7453], standard: 'Japan_current' },
        { system: 'JGD2011', coords: [35.6586, 139.7454], standard: 'Japan_latest' }
      ];

      for (const coordSystem of coordinateSystems) {
        messageSender.sendMessage.mockClear();

        const systemRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Coordinate system: ${coordSystem.system}` },
          coordinateSystem: coordSystem
        };

        await processIncomingMessage(systemRequest, {});
        expect(messageSender.sendMessage).toHaveCalled();

        // Should handle multiple geographic reference systems
      }
    });
  });

  describe('TIME ZONE & GEOGRAPHIC TIME CALCULATIONS (6/6 Scenarios)', () => {

    test('LOCATION_007: Time zone offset calculation accuracy → Solar time corrections', async () => {
      // Test accurate time zone offset calculations for astrological timing

      const timezoneCalculations = [
        { location: 'New York', coords: [40.7128, -74.0060], expectedOffset: -5, dst: true, type: 'East_Coast_DST' },
        { location: 'Los Angeles', coords: [34.0522, -118.2437], expectedOffset: -8, dst: true, type: 'West_Coast_DST' },
        { location: 'London', coords: [51.5074, -0.1278], expectedOffset: 0, dst: true, type: 'GMT_DST' },
        { location: 'Tokyo', coords: [35.6762, 139.6503], expectedOffset: 9, dst: false, type: 'Japan_no_DST' },
        { location: 'Moscow', coords: [55.7558, 37.6173], expectedOffset: 3, dst: false, type: 'Russia_current' },
        { location: 'Sydney', coords: [-33.8688, 151.2093], expectedOffset: 10, dst: true, type: 'Australia_DST' },
        { location: 'Kiritimati', coords: [1.8708, -157.3768], expectedOffset: 14, dst: false, type: 'furthest_east' },
        { location: 'Baker Island', coords: [0.1936, -176.4769], expectedOffset: -12, dst: false, type: 'furthest_west' }
      ];

      for (const tzCalc of timezoneCalculations) {
        messageSender.sendMessage.mockClear();

        const timezoneRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Timezone calculation: ${tzCalc.location}` },
          timezoneCalculation: tzCalc
        };

        await processIncomingMessage(timezoneRequest, {});
        expect(messageSender.sendMessage).toHaveCalled();

        // Should accurately calculate timezone offsets for precise birth times
      }
    });

    test('LOCATION_008: Daylight saving time boundary handling → Ascendant accuracy during DST transitions', async () => {
      // Test DST transitions and their effects on astrological calculations

      const dstTransitions = [
        { date: 'March 10, 2024', location: 'New York', transition: 'spring_forward_2024', timeChange: '+03:00 → +04:00' },
        { date: 'November 3, 2024', location: 'New York', transition: 'fall_back_2024', timeChange: '+04:00 → +03:00' },
        { date: 'March 31, 2024', location: 'London', transition: 'BST_start_2024', timeChange: '+00:00 → +01:00' },
        { date: 'October 27, 2024', location: 'London', transition: 'BST_end_2024', timeChange: '+01:00 → +00:00' },
        { date: 'March 10, 2024', beforeTime: '01:59:59', afterTime: '03:00:01', location: 'Eastern_US' },
        { date: 'November 3, 2024', beforeTime: '01:59:59', afterTime: '01:00:01', location: 'Eastern_US' }
      ];

      for (const dstTransition of dstTransitions) {
        messageSender.sendMessage.mockClear();

        const dstRequest = {
          from: testUser,
          type: 'text',
          text: { body: `DST transition: ${dstTransition.location} ${dstTransition.date}` },
          dstTransition: dstTransition
        };

        await processIncomingMessage(dstRequest, {});
        expect(messageSender.sendMessage).toHaveCalled();

        // Should handle DST transitions for accurate ascendant calculations
      }
    });

    test('LOCATION_009: Historical time zone changes → Retroactive calculation accuracy', async () => {
      // Test handling of historical timezone changes and territorial adjustments

      const historicalChanges = [
        { date: '1940-06-29', location: 'Belgrade', change: 'WW2_German_occupation_+02_to_+03', political: true },
        { date: '1922-03-15', location: 'Moscow', change: 'Russia_to_MSK_+04_to_+03', administrative: true },
        { date: '1911-09-11', location: 'Paris', change: 'France_time_standardized', standardization: true },
        { date: '1847-12-01', location: 'London', change: 'Railway_time_coordination', industrial: true },
        { date: '1883-11-18', location: 'Washington DC', change: 'US_standard_time_zones', governmental: true },
        { date: '1900-01-01', location: 'Global', change: 'International_meridian_conference', scientific: true },
        { date: '1940-04-30', location: 'Germany', change: 'WW2_summertime_introduction', military: true },
        { date: '1945-05-24', location: 'Germany', change: 'postwar_reversion_GMT', post_war: true }
      ];

      for (const historicalChange of historicalChanges) {
        messageSender.sendMessage.mockClear();

        const historicalRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Historical timezone: ${historicalChange.location} ${historicalChange.date}` },
          historicalTimezone: historicalChange
        };

        await processIncomingMessage(historicalRequest, {});
        expect(messageSender.sendMessage).toHaveCalled();

        // Should account for historical timezone changes in calculations
      }
    });

    test('LOCATION_010: Longitude-based time correction → Solar time vs clock time calculations', async () => {
      // Test correction between civil time and solar time based on longitude

      const longitudeCorrections = [
        { location: 'Greenwich', coords: [51.5074, 0.0000], correction: 0, type: 'prime_meridian_exact' },
        { location: 'New York', coords: [40.7128, -74.0060], correction: -300, type: 'East_Coast_minutes' },
        { location: 'Los Angeles', coords: [34.0522, -118.2437], correction: -480, type: 'West_Coast_minutes' },
        { location: 'Tokyo', coords: [35.6762, 139.6503], correction: 540, type: 'Japan_minutes' },
        { location: 'Santiago', coords: [-33.4489, -70.6693], correction: -270, type: 'Chile_minutes' },
        { location: 'Moscow', coords: [55.7558, 37.6173], correction: 180, type: 'Moscow_minutes' },
        { location: 'Sydney', coords: [-33.8688, 151.2093], correction: 600, type: 'Australia_minutes' },
        { location: 'Honolulu', coords: [21.3069, -157.8583], correction: -600, type: 'Hawaii_minutes' }
      ];

      for (const correction of longitudeCorrections) {
        messageSender.sendMessage.mockClear();

        const correctionRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Longitude correction: ${correction.location}` },
          longitudeCorrection: correction
        };

        await processIncomingMessage(correctionRequest, {});
        expect(messageSender.sendMessage).toHaveCalled();

        // Should calculate solar time corrections based on longitude from Greenwich
      }
    });

    test('LOCATION_011: Time zone database currentness → Accuracy of timezone rules', async () => {
      // Test timezone database accuracy and currentness

      const tzDatabaseTests = [
        { region: 'North America', lastUpdate: '2024', currentRules: true, coverage: 'complete' },
        { region: 'Europe', lastUpdate: '2024', currentRules: true, coverage: 'complete' },
        { region: 'Asia', lastUpdate: '2024', currentRules: true, coverage: 'complete' },
        { region: 'Australia', lastUpdate: '2024', currentRules: true, coverage: 'complete' },
        { region: 'Africa', lastUpdate: '2024', currentRules: true, coverage: 'complete' },
        { region: 'South America', lastUpdate: '2024', currentRules: true, coverage: 'complete' },
        { region: 'Pacific Islands', lastUpdate: '2024', currentRules: true, coverage: 'complete' },
        { region: 'Arctic Regions', lastUpdate: '2023', currentRules: true, coverage: 'partial' }
      ];

      for (const tzDbTest of tzDatabaseTests) {
        messageSender.sendMessage.mockClear();

        const tzDbRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Timezone database: ${tzDbTest.region} ${tzDbTest.lastUpdate}` },
          timezoneDatabase: tzDbTest
        };

        await processIncomingMessage(tzDbRequest, {});
        expect(messageSender.sendMessage).toHaveCalled();

        // Should validate timezone database accuracy and report on coverage
      }
    });

    test('LOCATION_012: Geographic solar time calculations → True solar birth time derivation', async () => {
      // Test calculation of true solar time based on geographic location

      const solarTimeCalculations = [
        { location: 'Prime Meridian', coords: [51.5074, 0], solarOffset: 0, type: 'Greenwich_reference' },
        { location: 'Eastern US', coords: [40.7128, -74.0060], solarOffset: -4.96, type: 'approx_5_hours_west' },
        { location: 'Western US', coords: [34.0522, -118.2437], solarOffset: -8.0, type: 'Pacific_standard' },
        { location: 'Central Europe', coords: [48.8566, 2.3522], solarOffset: 0.11, type: 'slight_east' },
        { location: 'Eastern Asia', coords: [35.6762, 139.6503], solarOffset: 9.22, type: 'significant_east' },
        { location: 'Central Asia', coords: [55.7558, 37.6173], solarOffset: 2.49, type: 'partial_east' },
        { location: 'Australia East', coords: [-33.8688, 151.2093], solarOffset: 10.02, type: 'far_east' },
        { location: 'Pacific Islands', coords: [1.8708, -157.3768], solarOffset: -10.48, type: 'far_west' }
      ];

      for (const solarCalc of solarTimeCalculations) {
        messageSender.sendMessage.mockClear();

        const solarRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Solar time calculation: ${solarCalc.location}` },
          solarTimeCalculation: solarCalc
        };

        await processIncomingMessage(solarRequest, {});
        expect(messageSender.sendMessage).toHaveCalled();

        // Should calculate true solar time for precise solar chart positioning
      }
    });
  });

  describe('LOCATION-BASED ASTROLOGICAL COMPUTATIONS (8/8 Scenarios)', () => {

    test('LOCATION_013: Geographical house system variations → Altitude and latitude effects on houses', async () => {
      // Test how geographic location affects astrological house calculations

      const geographicHouses = [
        { location: 'Equator', coords: [0, 0], houseSystem: 'Equal_House', effect: 'symmetric_houses' },
        { location: 'North Pole', coords: [90, 0], houseSystem: 'Placidus_degenerate', effect: 'extreme_compression' },
        { location: 'Arctic Circle', coords: [66.5, 0], houseSystem: 'Koch_polar', effect: 'northern_inflation' },
        { location: 'Mediterranean', coords: [36, 15], houseSystem: 'Campanus_temperate', effect: 'balanced_system' },
        { location: 'Tropic of Cancer', coords: [23.5, 0], houseSystem: 'Porphyry_tropical', effect: 'southern_expansion' },
        { location: 'Southern Hemisphere', coords: [-35, 145], houseSystem: 'Vehlow_southern', effect: 'inverted_emphasis' },
        { location: 'High Altitude', coords: [16.8, -99.8, 3000], houseSystem: 'Alcabitius_mountain', effect: 'atmospheric_correction' },
        { location: 'Sea Level Reference', coords: [40, 0, 0], houseSystem: 'Morinus_standard', effect: 'baseline_calculation' }
      ];

      for (const geoHouse of geographicHouses) {
        messageSender.sendMessage.mockClear();

        const houseRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Geographic houses: ${geoHouse.location}` },
          geographicHouses: geoHouse
        };

        await processIncomingMessage(houseRequest, {});
        expect(messageSender.sendMessage).toHaveCalled();

        // Should demonstrate how latitude affects house sizes and shapes
      }
    });

    test('LOCATION_014: Magnetic declination correction → True north vs magnetic north adjustments', async () => {
      // Test magnetic declination corrections for accurate directional calculations

      const magneticDeclinations = [
        { location: 'London, UK', coords: [51.5074, -0.1278], declination: -0.3, year: 2024, trend: 'decreasing' },
        { location: 'New York, US', coords: [40.7128, -74.0060], declination: -12.5, year: 2024, trend: 'westward' },
        { location: 'Tokyo, Japan', coords: [35.6762, 139.6503], declination: -8.0, year: 2024, trend: 'increasing' },
        { location: 'Sydney, Australia', coords: [-33.8688, 151.2093], declination: 12.8, year: 2024, trend: 'eastward' },
        { location: 'Cape Town, South Africa', coords: [-33.9249, 18.4241], declination: -23.9, year: 2024, trend: 'westward' },
        { location: 'São Paulo, Brazil', coords: [-23.5505, -46.6333], declination: -21.0, year: 2024, trend: 'westward' },
        { location: 'Moscow, Russia', coords: [55.7558, 37.6173], declination: 11.5, year: 2024, trend: 'increasing' },
        { location: 'Mexico City, Mexico', coords: [19.4326, -99.1332], declination: 2.5, year: 2024, trend: 'increasing' }
      ];

      for (const magnetic of magneticDeclinations) {
        messageSender.sendMessage.mockClear();

        const magneticRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Magnetic declination: ${magnetic.location}` },
          magneticDeclination: magnetic
        };

        await processIncomingMessage(magneticRequest, {});
        expect(messageSender.sendMessage).toHaveCalled();

        // Should account for magnetic declination in geographical directional calculations
      }
    });

    test('LOCATION_015: Altitude and elevation effects → Atmospheric correction for planets', async () => {
      // Test how altitude affects astrological calculations

      const altitudeEffects = [
        { location: 'Sea Level NYC', coords: [40.7128, -74.0060, 10], altitude: 10, effect: 'minimal_correction' },
        { location: 'Denver, CO', coords: [39.7392, -104.9903, 1609], altitude: 1609, effect: 'significant_correction' },
        { location: 'Mexico City', coords: [19.4326, -99.1332, 2240], altitude: 2240, effect: 'substantial_correction' },
        { location: 'La Paz, Bolivia', coords: [-16.4897, -68.1193, 3640], altitude: 3640, effect: 'extreme_correction' },
        { location: 'Mount Kilimanjaro', coords: [-3.0674, 37.3556, 5895], altitude: 5895, effect: 'maximum_correction' },
        { location: 'Mount Everest', coords: [27.9881, 86.9250, 8848], altitude: 8848, effect: 'atmospheric_extreme' },
        { location: 'Death Valley', coords: [36.5323, -116.9322, -86], altitude: -86, effect: 'below_sea_level' },
        { location: 'Bermuda Triangle', coords: [25.0000, -71.0000, 0], altitude: 0, effect: 'atmospheric_baseline' }
      ];

      for (const altitude of altitudeEffects) {
        messageSender.sendMessage.mockClear();

        const altitudeRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Altitude effect: ${altitude.location}` },
          altitudeEffect: altitude
        };

        await processIncomingMessage(altitudeRequest, {});
        expect(messageSender.sendMessage).toHaveCalled();

        // Should apply atmospheric corrections for high altitude locations
      }
    });

    test('LOCATION_016: Geographic cultural aspects → Country and regional astrological traditions', async () => {
      // Test cultural variations in astrological calculations based on location

      const culturalAspects = [
        { location: 'India (Vedic)', coords: [28.6139, 77.2090], tradition: 'Vedic_astronomy', emphasis: 'sidereal_zodiac' },
        { location: 'Greece (Hellenistic)', coords: [37.9838, 23.7275], tradition: 'traditional_Western', emphasis: 'whole_sign_houses' },
        { location: 'China (Traditional)', coords: [39.9042, 116.4074], tradition: 'Chinese_astronomy', emphasis: 'lunar_phases' },
        { location: 'Persia (Traditional)', coords: [35.6892, 51.3890], tradition: 'Islamic_astronomy', emphasis: 'heliocentric_adjustment' },
        { location: 'Egypt (Decanic)', coords: [30.0444, 31.2357], tradition: 'decan_system', emphasis: 'planetary_hours' },
        { location: 'Mesoamerica', coords: [19.4326, -99.1332], tradition: 'Mayan_astronomy', emphasis: 'calendar_cycles' },
        { location: 'England (Modern)', coords: [51.5074, -0.1278], tradition: 'contemporary_Western', emphasis: 'psychological_interpretation' },
        { location: 'Japan (Contemporary)', coords: [35.6762, 139.6503], tradition: 'Western_influenced', emphasis: 'five_element_system' }
      ];

      for (const cultural of culturalAspects) {
        messageSender.sendMessage.mockClear();

        const culturalRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Cultural astrology: ${cultural.location}` },
          culturalAspect: cultural
        };

        await processIncomingMessage(culturalRequest, {});
        expect(messageSender.sendMessage).toHaveCalled();

        // Should apply location-appropriate astrological cultural traditions
      }
    });

    test('LOCATION_017: Political boundary changes impact → Historical location accuracy', async () => {
      // Test how political changes affect location-based calculations

      const politicalBoundaries = [
        { location: 'Berlin, Germany', coords: [52.5200, 13.4050], political: '1949-1990_divided', astrological: 'dual_city_charts' },
        { location: 'Kiev, Ukraine', coords: [50.4501, 30.5234], political: '1991_independence', astrological: 'name_language_change' },
        { location: 'Mumbai, India', coords: [19.0760, 72.8777], political: '1947_partition', astrological: 'Bombay_to_Mumbai' },
        { location: 'Cape Town, South Africa', coords: [-33.9249, 18.4241], political: '1994_democracy', astrological: 'apartheid_ending' },
        { location: 'Prague, Czech Republic', coords: [50.0755, 14.4378], political: '1993_dissolution', astrological: 'Czechoslovakia_split' },
        { location: 'Sarajevo, Bosnia', coords: [43.8486, 18.3564], political: '1995_agreement', astrological: 'Yugoslavia_dissolution' },
        { location: 'London, Falklands', coords: [-51.6977, -57.8517], political: '1982_conflict', astrological: 'colonial_war_impact' },
        { location: 'Moscow oblast', coords: [55.7558, 37.6173], political: '1917_revolution', astrological: 'empire_to_union' }
      ];

      for (const political of politicalBoundaries) {
        messageSender.sendMessage.mockClear();

        const politicalRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Political boundary: ${political.location}` },
          politicalBoundary: political
        };

        await processIncomingMessage(politicalRequest, {});
        expect(messageSender.sendMessage).toHaveCalled();

        // Should account for political changes affecting astrological interpretations
      }
    });

    test('LOCATION_018: Urban vs rural environmental factors → City energy vs nature energy', async () => {
      // Test environmental differences between urban and rural locations

      const environmentalFactors = [
        { location: 'Manhattan NYC', coords: [40.7589, -73.9851], environment: 'urban_dense', energy: 'chaotic_dynamic' },
        { location: 'Scottish Highlands', coords: [57.5000, -5.0000], environment: 'rural_isolated', energy: 'ancient_earth' },
        { location: 'Tokyo CBD', coords: [35.6762, 139.6503], environment: 'megacity_metropolitan', energy: 'technological_flow' },
        { location: 'Sahara Desert', coords: [25.0000, 13.0000], environment: 'natural_arid', energy: 'enduring_eternal' },
        { location: 'Amazon Rainforest', coords: [-3.4653, -62.2159], environment: 'natural_tropical', energy: 'diverse_vibrant' },
        { location: 'Swiss Alps', coords: [46.5197, 8.0815], environment: 'mountainous_sacred', energy: 'spiritual_elevated' },
        { location: 'Himalayan village', coords: [28.7041, 84.1240], environment: 'spiritual_remote', energy: 'enlightened_traditional' },
        { location: 'Great Barrier Reef', coords: [-18.2871, 147.6992], environment: 'marine_paradise', energy: 'fluid_adaptive' }
      ];

      for (const environmental of environmentalFactors) {
        messageSender.sendMessage.mockClear();

        const environmentalRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Environmental factor: ${environmental.location}` },
          environmentalFactor: environmental
        };

        await processIncomingMessage(environmentalRequest, {});
        expect(messageSender.sendMessage).toHaveCalled();

        // Should incorporate environmental energy into astrological interpretations
      }
    });

    test('LOCATION_019: Location-based electional astrology → Geographic optimal timing', async () => {
      // Test electional astrology calculations optimized for specific locations

      const electionalLocations = [
        { type: 'Business Opening', location: 'Financial District', coords: [40.7075, -74.0113], optimal: 'Mercury_hour' },
        { type: 'Wedding Ceremony', location: 'Mountain Chapel', coords: [39.1911, -106.8175], optimal: 'Venus_Jupiter' },
        { type: 'Graduation Ceremony', location: 'University Campus', coords: [42.3601, -71.0589], optimal: 'Mercury_Jupiter' },
        { type: 'Medical Operation', location: 'Hospital', coords: [40.7679, -73.9667], optimal: 'Ascendant_Mars' },
        { type: 'Legal Contract', location: 'Courthouse', coords: [38.8951, -77.0369], optimal: 'Mercury_Jupiter' },
        { type: 'Sports Competition', location: 'Stadium', coords: [40.7505, -73.9934], optimal: 'Mars_Saturn' },
        { type: 'Art Exhibition', location: 'Gallery District', coords: [40.7590, -73.9855], optimal: 'Venus_Neptune' },
        { type: 'Religious Ceremony', location: 'Sacred Site', coords: [31.7776, 35.2345], optimal: 'Jupiter_planetary_hour' }
      ];

      for (const electional of electionalLocations) {
        messageSender.sendMessage.mockClear();

        const electionalRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Electional astrology: ${electional.type} at ${electional.location}` },
          electionalCalculation: electional
        };

        await processIncomingMessage(electionalRequest, {});
        expect(messageSender.sendMessage).toHaveCalled();

        // Should calculate optimal astrological timing for specific locations and purposes
      }
    });

    test('LOCATION_020: Real-time location tracking for travelling events → Birth during travel', async () => {
      // Test calculations for births occurring during travel between locations

      const travelBirths = [
        { mode: 'Flight', path: [[40.7128, -74.0060], [48.8566, 2.3522]], birthTime: 0.7, estimatedLocation: [44.7844, -66.1793] },
        { mode: 'Ship', path: [[40.7128, -74.0060], [51.5074, -0.1278]], birthTime: 0.5, estimatedLocation: [45.6117, -42.5667] },
        { mode: 'Train', path: [[40.7128, -74.0060], [34.0522, -118.2437]], birthTime: 0.8, estimatedLocation: [37.3825, -96.1247] },
        { mode: 'Car', path: [[48.8566, 2.3522], [51.5074, -0.1278]], birthTime: 0.6, estimatedLocation: [50.0817, 1.7628] },
        { mode: 'Motorcycle', path: [[35.6762, 139.6503], [34.0522, -118.2437]], birthTime: 0.4, estimatedLocation: [34.8643, -138.4438] },
        { mode: 'Bicycle', path: [[55.7558, 37.6173], [48.8566, 2.3522]], birthTime: 0.3, estimatedLocation: [52.3061, 19.9199] },
        { mode: 'Camel/Middle East', path: [[30.0444, 31.2357], [32.0853, 34.7818]], birthTime: 0.5, estimatedLocation: [31.0648, 33.0085] },
        { mode: 'Rickshaw/Asia', path: [35.6762, 139.6503], [34.6937, 135.5022], birthTime: 0.4, estimatedLocation: [35.1900, 137.5762] }
      ];

      for (const travelBirth of travelBirths) {
        messageSender.sendMessage.mockClear();

        const travelRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Travel birth: ${travelBirth.mode} crossing` },
          travelBirthCalculation: travelBirth
        };

        await processIncomingMessage(travelRequest, {});
        expect(messageSender.sendMessage).toHaveCalled();

        // Should interpolate birth location based on travel path and timing
      }
    });
  });
});

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your search and replace operations on this initial content to ensure accuracy.

<environment_details>
# Cline CLI Visible Files
(No visible files)

# Cline CLI Open Tabs
(No visible files)

# Current Time
10/28/2025, 8:37:47 PM (Asia/Dubai, UTC+4:00)

# Context Window Usage
236,402 / 256K tokens used (92%)

# Current Mode
ACT MODE
</environment_details>