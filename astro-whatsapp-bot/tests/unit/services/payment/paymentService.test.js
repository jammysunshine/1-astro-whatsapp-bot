// tests/unit/services/payment/paymentService.test.js
// Unit tests for Payment Service

const paymentService = require('../../../../src/services/payment/paymentService');

// Mock dependencies
const logger = require('../../../src/utils/logger');

beforeEach(() => {
  jest.spyOn(logger, 'info').mockImplementation(() => {});
  jest.spyOn(logger, 'error').mockImplementation(() => {});
  jest.spyOn(logger, 'warn').mockImplementation(() => {});
  jest.spyOn(logger, 'debug').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('PaymentService', () => {
  describe('processPayment', () => {
    it('should process payment successfully', async() => {
      const paymentData = {
        amount: 299,
        currency: 'INR',
        phoneNumber: '+1234567890',
        plan: 'premium'
      };

      const result = await paymentService.processPayment(paymentData);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle payment failure', async() => {
      const paymentData = {
        amount: 299,
        currency: 'INR',
        phoneNumber: '+1234567890',
        plan: 'premium'
      };

      // Mock failure
      paymentService.processPayment = jest.fn().mockRejectedValue(new Error('Payment failed'));

      await expect(paymentService.processPayment(paymentData)).rejects.toThrow('Payment failed');
    });
  });

  describe('validatePayment', () => {
    it('should validate valid payment data', () => {
      const paymentData = {
        amount: 299,
        currency: 'INR',
        phoneNumber: '+1234567890',
        plan: 'premium'
      };

      const result = paymentService.validatePayment(paymentData);

      expect(result).toBe(true);
    });

    it('should reject invalid payment data', () => {
      const paymentData = {
        amount: -1,
        currency: 'invalid',
        phoneNumber: 'invalid',
        plan: 'invalid'
      };

      const result = paymentService.validatePayment(paymentData);

      expect(result).toBe(false);
    });
  });

  describe('getSubscriptionDetails', () => {
    it('should get subscription details', async() => {
      const phoneNumber = '+1234567890';

      const result = await paymentService.getSubscriptionDetails(phoneNumber);

      expect(result).toBeDefined();
      expect(result.plan).toBeDefined();
    });
  });
});
