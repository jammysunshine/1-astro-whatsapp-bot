// tests/unit/utils/errorHandler.test.js
// Unit tests for Error Handler

const errorHandler = require('../../../src/utils/errorHandler');
const logger = require('../../../src/utils/logger');

// Mock logger
jest.mock('../../../src/utils/logger');

describe('ErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleError', () => {
    it('should handle error and log it', () => {
      const error = new Error('Test error');
      const context = { userId: '123' };

      const result = errorHandler.handleError(error, context);

      expect(result).toBeUndefined();
      expect(logger.error).toHaveBeenCalledWith(
        'Error occurred:',
        error,
        context
      );
    });

    it('should handle error without context', () => {
      const error = new Error('Test error');

      const result = errorHandler.handleError(error);

      expect(result).toBeUndefined();
      expect(logger.error).toHaveBeenCalledWith(
        'Error occurred:',
        error,
        undefined
      );
    });
  });

  describe('handleValidationError', () => {
    it('should handle validation error', () => {
      const error = new Error('Validation failed');
      const field = 'email';

      const result = errorHandler.handleValidationError(error, field);

      expect(result).toBeUndefined();
      expect(logger.warn).toHaveBeenCalledWith(
        'Validation error for field email:',
        error
      );
    });
  });

  describe('handleDatabaseError', () => {
    it('should handle database error', () => {
      const error = new Error('Database connection failed');

      const result = errorHandler.handleDatabaseError(error);

      expect(result).toBeUndefined();
      expect(logger.error).toHaveBeenCalledWith('Database error:', error);
    });
  });
});
