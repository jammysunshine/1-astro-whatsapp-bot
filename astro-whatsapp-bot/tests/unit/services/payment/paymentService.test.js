// tests/unit/services/payment/paymentService.test.js
// Unit tests for Payment Service

const paymentService = require('../../../../src/services/payment/paymentService');

// Mock dependencies
const logger = require('../../../../src/utils/logger');

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn()
    }
  }));
});

// Mock Razorpay
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn()
    }
  }));
});

beforeEach(() => {
  jest.spyOn(logger, 'info').mockImplementation(() => {});
  jest.spyOn(logger, 'error').mockImplementation(() => {});
  jest.spyOn(logger, 'warn').mockImplementation(() => {});
  jest.spyOn(logger, 'debug').mockImplementation(() => {});

  // Mock environment variables for payment gateways
  process.env.STRIPE_SECRET_KEY = 'test_stripe_key';
  process.env.RAZORPAY_KEY_ID = 'test_razorpay_key';
  process.env.RAZORPAY_KEY_SECRET = 'test_razorpay_secret';
});

afterEach(() => {
  jest.restoreAllMocks();
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.RAZORPAY_KEY_ID;
  delete process.env.RAZORPAY_KEY_SECRET;
});

describe('PaymentService', () => {
  describe('getPlan', () => {
    it('should return plan details for valid plan', () => {
      const plan = paymentService.getPlan('premium', 'india');

      expect(plan).toBeDefined();
      expect(plan.name).toBe('Premium');
      expect(plan.price).toBe(299);
      expect(plan.currency).toBe('INR');
    });

    it('should return free plan for invalid plan', () => {
      const plan = paymentService.getPlan('invalid', 'india');

      expect(plan).toBeDefined();
      expect(plan.name).toBe('Free');
    });
  });

  describe('processSubscription', () => {
    it('should process subscription successfully with mocked payment', async() => {
      // Mock Razorpay payment success (India region)
      paymentService.razorpay.orders.create.mockResolvedValue({
        id: 'order_test_success',
        amount: 23000,
        currency: 'INR',
        receipt: 'rcpt_123'
      });

      const result = await paymentService.processSubscription(
        '+1234567890',
        'essential',
        'india',
        'card'
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
      expect(result.message).toContain('Welcome to Essential plan');
    });

    it('should handle payment failure', async() => {
      // Mock Razorpay payment failure
      paymentService.razorpay.orders.create.mockRejectedValue(new Error('Payment processing failed'));

      await expect(
        paymentService.processSubscription('+1234567890', 'premium', 'india', 'card')
      ).rejects.toThrow('Payment processing failed');
    });
  });

  describe('detectRegion', () => {
    it('should detect UAE region from phone number', () => {
      expect(paymentService.detectRegion('+971501234567')).toBe('uae');
      expect(paymentService.detectRegion('971501234567')).toBe('uae');
    });

    it('should detect Australia region from phone number', () => {
      expect(paymentService.detectRegion('+61412345678')).toBe('australia');
    });

    it('should default to India region', () => {
      expect(paymentService.detectRegion('+919876543210')).toBe('india');
      expect(paymentService.detectRegion('')).toBe('india');
      expect(paymentService.detectRegion(null)).toBe('india');
    });
  });

  describe('calculateSubscriptionExpiry', () => {
    it('should calculate expiry date based on plan', () => {
      const now = new Date();
      const expiry = paymentService.calculateSubscriptionExpiry('essential');

      expect(expiry).toBeInstanceOf(Date);
      expect(expiry.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should handle invalid plan with default duration', () => {
      const now = new Date();
      const expiry = paymentService.calculateSubscriptionExpiry('invalid');

      expect(expiry).toBeInstanceOf(Date);
      expect(expiry.getTime()).toBeGreaterThan(now.getTime());
    });
  });
});