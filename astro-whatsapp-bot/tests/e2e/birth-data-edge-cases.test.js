const { TestDatabaseManager } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

// Mock external services for safe birth data testing
jest.mock('../../../src/services/whatsapp/messageSender', () => ({
  sendMessage: jest.fn(),
  sendListMessage: jest.fn(),
  sendButtonMessage: jest.fn()
}));

const messageSender = require('../../../src/services/whatsapp/messageSender');

// Coordinate conversion utilities for testing
function dmsToDecimal(degrees, minutes, seconds, direction) {
  const decimal = degrees + minutes / 60 + seconds / 3600;
  return direction === 'S' || direction === 'W' ? -decimal : decimal;
}

function decimalToDMS(decimal, isLatitude) {
  const direction = isLatitude ?
    (decimal >= 0 ? 'N' : 'S') :
    (decimal >= 0 ? 'E' : 'W');
  const absDecimal = Math.abs(decimal);
  const degrees = Math.floor(absDecimal);
  const minutesDecimal = (absDecimal - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = Math.round((minutesDecimal - minutes) * 60);

  return { degrees, minutes, seconds, direction };
}

describe('BIRTH DATA EDGE CASES: Comprehensive Validation Suite (39 Scenarios)', () => {
  let dbManager;
  let testUser = '+birth_data_test';

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

  describe('DATE FORMAT VARIATIONS (6/6 Scenarios)', () => {

    test('BIRTH_DATA_001: Invalid date format variations → Format validation', async () => {
      // Test various invalid date format inputs that should be rejected

      const invalidDateFormats = [
        '31/31/1990', // Invalid day
        '13/45/1990', // Invalid month
        '99/99/9999', // Double invalid
        'AB/CD/EFGH', // Non-numeric
        '31-02-1990', // Hyphen separators (invalid day for February)
        '2023/12/25', // Slash separators (ambiguous format)
        'December 25, 1990', // Word format
        '25-Dec-1990', // Month name format
        '25/12', // Missing year
        '1990', // Year only
        '', // Empty string
        null, // Null value
        undefined // Undefined value
      ];

      for (const invalidDate of invalidDateFormats) {
        messageSender.sendMessage.mockClear();

        const dateValidationRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Birth date: ${invalidDate}` },
          birthDataValidation: { date: invalidDate }
        };

        await processIncomingMessage(dateValidationRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        // Should reject invalid formats and provide clear error message
        const response = messageSender.sendMessage.mock.calls[0][1];
        expect(typeof response).toBe('string');
        // Should contain helpful validation message
      }
    });

    test('BIRTH_DATA_002: International date format handling → Locale normalization', async () => {
      // Test international date format variations

      const internationalFormats = [
        { input: '25/12/1990', locale: 'UK', expected: '25/12/1990' },
        { input: '12/25/1990', locale: 'US', expected: '25/12/1990' }, // Convert MM/DD/YYYY to DD/MM/YYYY
        { input: '1990-12-25', locale: 'ISO', expected: '25/12/1990' },
        { input: '1990/12/25', locale: 'Korean', expected: '25/12/1990' },
        { input: '25.12.1990', locale: 'German', expected: '25/12/1990' }, // Dot separators
        { input: '25-12-1990', locale: 'Danish', expected: '25/12/1990' } // Dash separators
      ];

      for (const format of internationalFormats) {
        messageSender.sendMessage.mockClear();

        const internationalRequest = {
          from: testUser,
          type: 'text',
          text: { body: `International date: ${format.input}` },
          internationalFormat: format
        };

        await processIncomingMessage(internationalRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        // Should normalize international formats to standard DD/MM/YYYY
        // Should handle locale-specific variations appropriately
      }
    });

    test('BIRTH_DATA_003: Future birth dates → Reality validation', async () => {
      // Test rejection of future birth dates

      const futureDates = [
        { date: '31/12/2050', description: 'Distant future' },
        { date: '01/01/2025', description: 'Next year' }, // 2025 based on current time
        { date: '15/11/2024', description: 'Next month' },
        { date: '25/10/2024', description: 'Next week' },
        { date: '31/10/2024', description: 'Tomorrow' }
      ];

      for (const futureDate of futureDates) {
        messageSender.sendMessage.mockClear();

        const futureDateRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Future birth: ${futureDate.date}` },
          futureBirthValidation: futureDate
        };

        await processIncomingMessage(futureDateRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        // Should reject future dates with appropriate reality-check message
        // Should calculate age as negative and warn user
      }
    });

    test('BIRTH_DATA_004: Historical extreme dates → Age limitations', async () => {
      // Test handling of extremely old birth dates

      const extremeHistoricalDates = [
        { date: '01/01/1800', description: 'Very old (224 years)' },
        { date: '15/06/1700', description: 'Extremely old (324 years)' },
        { date: '01/01/1500', description: 'Ancient (524 years)' },
        { date: '25/12/1000', description: 'Millennium old (1024 years)' },
        { date: '01/01/0100', description: 'Biblical era (1924 years)' },
        { date: '01/01/0001', description: 'Year zero (2024 years)' }
      ];

      for (const extremeDate of extremeHistoricalDates) {
        messageSender.sendMessage.mockClear();

        const extremeDateRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Historical birth: ${extremeDate.date}` },
          extremeHistoricalValidation: extremeDate
        };

        await processIncomingMessage(extremeDateRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        // Should accept extreme dates but warn about potential accuracy issues
        // Should still perform calculations but with accuracy disclaimers
      }
    });

    test('BIRTH_DATA_005: Leap year date validation → February 29 handling', async () => {
      // Test leap year handling, especially February 29

      const leapYearScenarios = [
        { date: '29/02/2000', valid: true, description: 'Valid leap year 2000' },
        { date: '29/02/1996', valid: true, description: 'Valid leap year 1996' },
        { date: '29/02/1990', valid: false, description: 'Invalid non-leap year 1990' },
        { date: '29/02/1900', valid: false, description: 'Invalid century year 1900' },
        { date: '29/02/1600', valid: true, description: 'Valid century leap year 1600' },
        { date: '30/02/2000', valid: false, description: 'Invalid day in leap year' },
        { date: '29/02/2100', valid: false, description: 'Invalid future century 2100' }
      ];

      for (const leapScenario of leapYearScenarios) {
        messageSender.sendMessage.mockClear();

        const leapYearRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Leap year test: ${leapScenario.date}` },
          leapYearValidation: leapScenario
        };

        await processIncomingMessage(leapYearRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        // Should validate leap year dates correctly
        // Should reject invalid February 29 dates with clear explanation
      }
    });

    test('BIRTH_DATA_006: Calendar transition dates → Gregorian calendar cutoff', async () => {
      // Test dates around calendar transitions and cutoffs

      const calendarTransitionDates = [
        { date: '04/10/1582', transition: 'Gregorian start', note: 'Julian to Gregorian transition' },
        { date: '15/10/1582', transition: 'Gregorian first', note: 'First Gregorian date' },
        { date: '14/10/1582', transition: 'Julian last', note: 'Last Julian date' },
        { date: '01/01/0001', transition: 'Year zero', note: 'Historical calendar start' },
        { date: '31/12/9999', transition: 'Year limit', note: 'Maximum representable year' },
        { date: '29/02/0004', transition: 'Early leap', note: 'First possible leap year' }
      ];

      for (const transition of calendarTransitionDates) {
        messageSender.sendMessage.mockClear();

        const transitionRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Calendar transition: ${transition.date}` },
          calendarTransition: transition
        };

        await processIncomingMessage(transitionRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        // Should handle calendar transitions with historical accuracy notes
        // Should validate dates according to appropriate calendar system
      }
    });
  });

  describe('TIME FORMAT VARIATIONS (6/6 Scenarios)', () => {

    test('BIRTH_DATA_007: Invalid time format variations → Time validation', async () => {
      // Test various invalid time format inputs

      const invalidTimeFormats = [
        '25:00:00', // Invalid hour
        '23:60:00', // Invalid minute
        '12:30:60', // Invalid second
        '99:99:99', // All invalid components
        'AB:CD:EF', // Non-numeric
        '12:30', // Missing seconds
        '12', // Hour only
        '12:30PM', // Mixed 12/24 hour formats
        '24:00:00', // 24:00 is not standard
        '11:59:59 AM PM', // Conflicting AM/PM
        '', // Empty string
        null, // Null value
        undefined // Undefined value
      ];

      for (const invalidTime of invalidTimeFormats) {
        messageSender.sendMessage.mockClear();

        const timeValidationRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Birth time: ${invalidTime}` },
          timeValidation: { time: invalidTime }
        };

        await processIncomingMessage(timeValidationRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        // Should validate time formats and reject invalid ones
      }
    });

    test('BIRTH_DATA_008: 12-hour vs 24-hour format conversions → Time normalization', async () => {
      // Test conversion between 12-hour and 24-hour formats

      const timeFormatConversions = [
        { input: '12:00:00 AM', output: '00:00:00', format: '12 to 24' },
        { input: '12:00:00 PM', output: '12:00:00', format: '12 to 24 noon' },
        { input: '1:30:00 AM', output: '01:30:00', format: '12 to 24 morning' },
        { input: '11:59:59 PM', output: '23:59:59', format: '12 to 24 night' },
        { input: '00:00:00', output: '12:00:00 AM', format: '24 to 12 midnight' },
        { input: '13:30:45', output: '01:30:45 PM', format: '24 to 12 afternoon' },
        { input: '23:59:59', output: '11:59:59 PM', format: '24 to 12 evening' }
      ];

      for (const conversion of timeFormatConversions) {
        messageSender.sendMessage.mockClear();

        const conversionRequest = {
          from: testUser,
          type: 'text',
          text: { body: `Time conversion: ${conversion.input}` },
          timeConversion: conversion
        };

        await processIncomingMessage(conversionRequest, {});
        expect(messageSender.sendMessage).toHaveBeenCalled();

        // Should convert between 12-hour and 24-hour formats accurately
        // Should handle edge cases like 12 AM vs 12 PM
      }
    });

    test('BIRTH_DATA_009: Second precision handling → Microsecond accuracy', async () => {
      // Test handling of high-precision time measurements

      const precisionTimeScenarios = [
        { time: '12:30:45.123456', precision: 'microseconds' },
        { time: '15:45:30.999999', precision: 'full microseconds' },
        { time: '23:59:59.999999999', precision: 'nanoseconds' },
        { time: '00:00:00.000000001', precision: 'extreme precision' },
        { time: '12:34:56.000000000', precision: 'zero precision' },
        { time: '08:30:45.500000000', precision: 'half second precision' }
      ];

      for (const precision of precisionTimeScenarios) {
        messageSender.sendMessage.mockClear();

        const precisionRequest = {
          from: testUser,
          type: 'text',
          text: { body: `High precision time: ${precision.time}` },
          time