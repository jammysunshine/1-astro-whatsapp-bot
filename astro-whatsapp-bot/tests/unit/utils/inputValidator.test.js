// tests/unit/utils/inputValidator.test.js
// Unit tests for Input Validator

const inputValidator = require('../../../src/utils/inputValidator');

describe('InputValidator', () => {
  describe('validateEmail', () => {
    it('should validate valid email', () => {
      const email = 'test@example.com';

      const result = inputValidator.validateEmail(email);

      expect(result).toBe(true);
    });

    it('should reject invalid email', () => {
      const email = 'invalid-email';

      const result = inputValidator.validateEmail(email);

      expect(result).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate valid phone number', () => {
      const phone = '+1234567890';

      const result = inputValidator.validatePhoneNumber(phone);

      expect(result).toBe(true);
    });

    it('should reject invalid phone number', () => {
      const phone = 'invalid';

      const result = inputValidator.validatePhoneNumber(phone);

      expect(result).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize input', () => {
      const input = '<script>alert("xss")</script>';

      const result = inputValidator.sanitizeInput(input);

      expect(result).not.toContain('<script>');
    });
  });
});
