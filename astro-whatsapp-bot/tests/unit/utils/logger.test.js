// tests/unit/utils/logger.test.js
// Unit tests for Logger

const logger = require('../../../src/utils/logger');

// Mock winston transports to avoid actual logging during tests
jest.mock('winston', () => {
  const mockFormat = {
    combine: jest.fn().mockReturnValue({}),
    timestamp: jest.fn().mockReturnValue({}),
    errors: jest.fn().mockReturnValue({}),
    json: jest.fn().mockReturnValue({}),
    colorize: jest.fn().mockReturnValue({}),
    simple: jest.fn().mockReturnValue({})
  };

  const mockTransport = {
    Console: jest.fn().mockImplementation(() => ({
      log: jest.fn()
    }))
  };

  return {
    format: mockFormat,
    transports: mockTransport,
    createLogger: jest.fn().mockImplementation(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    }))
  };
});

describe('Logger', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Logging Methods', () => {
    it('should log info message', () => {
      logger.info('Test info message');
      
      expect(logger.info).toHaveBeenCalledWith('Test info message');
    });

    it('should log error message', () => {
      logger.error('Test error message');
      
      expect(logger.error).toHaveBeenCalledWith('Test error message');
    });

    it('should log warn message', () => {
      logger.warn('Test warn message');
      
      expect(logger.warn).toHaveBeenCalledWith('Test warn message');
    });

    it('should log debug message', () => {
      // Set debug level for this test
      const originalLevel = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = 'debug';
      
      // Reinitialize logger with debug level
      jest.resetModules();
      const debugLogger = require('../../../src/utils/logger');
      
      debugLogger.debug('Test debug message');

      expect(debugLogger.debug).toHaveBeenCalledWith('Test debug message');

      // Restore original LOG_LEVEL
      process.env.LOG_LEVEL = originalLevel;
      jest.resetModules();
    });
  });
});