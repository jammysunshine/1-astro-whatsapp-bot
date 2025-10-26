// tests/unit/utils/logger.test.js
// Unit tests for Logger

const logger = require('../../../src/utils/logger');

describe('Logger', () => {
  beforeEach(() => {
    // Clear console mocks if needed
    jest.clearAllMocks();
  });

  describe('Logging Methods', () => {
    it('should log info message', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      logger.info('Test info message');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Test info message'));

      consoleSpy.mockRestore();
    });

    it('should log error message', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      logger.error('Test error message');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Test error message'));

      consoleSpy.mockRestore();
    });

    it('should log warn message', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      logger.warn('Test warn message');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Test warn message'));

      consoleSpy.mockRestore();
    });

    it('should log debug message', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      logger.debug('Test debug message');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Test debug message'));

      consoleSpy.mockRestore();
    });
  });
});
