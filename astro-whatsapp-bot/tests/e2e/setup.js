// E2E Test Setup - Shared mocking configuration for all E2E tests
// Mocking Strategy:
// - WhatsApp API: Mocked
// - Google Maps API: Real (no mocking)
// - Mistral AI API: Real (no mocking)
// - Stripe & Razorpay: Mocked
// - Astrological Calculations: Real (no mocking)

// Mock WhatsApp API services (sendMessage, sendListMessage, sendButtonMessage)
jest.mock('../../src/services/whatsapp/messageSender', () => ({
  sendMessage: jest.fn().mockResolvedValue({ success: true }),
  sendTextMessage: jest.fn().mockResolvedValue({ success: true }),
  sendInteractiveButtons: jest.fn().mockResolvedValue({ success: true }),
  sendListMessage: jest.fn().mockResolvedValue({ success: true })
}));

// Mock Stripe for payment processing
jest.mock('stripe', () =>
  jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_e2e_test',
        client_secret: 'secret_e2e_test',
        amount: 10000,
        currency: 'usd',
        status: 'succeeded'
      })
    },
    paymentLinks: {
      create: jest.fn().mockResolvedValue({
        id: 'plink_e2e_test',
        url: 'https://checkout.stripe.com/pay/test'
      })
    }
  }))
);

// Mock Razorpay for payment processing
jest.mock('razorpay', () =>
  jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({
        id: 'order_e2e_test',
        amount: 10000,
        currency: 'INR',
        receipt: 'receipt_e2e_test',
        status: 'created'
      }),
      fetch: jest.fn().mockResolvedValue({
        id: 'order_e2e_test',
        amount: 10000,
        currency: 'INR',
        notes: { type: 'subscription', phoneNumber: '+e2e1234567890' }
      })
    }
  }))
);

// Mock external HTTP requests (axios) for safety
jest.mock('axios');

// Mock Google Maps client (but allow real geocoding if needed)
jest.mock('@googlemaps/google-maps-services-js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    geocode: jest.fn(),
    reverseGeocode: jest.fn(),
    placesNearby: jest.fn(),
    elevation: jest.fn()
  }))
}));

// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.W1_SKIP_WEBHOOK_SIGNATURE = 'true';
process.env.W1_WHATSAPP_ACCESS_TOKEN = 'e2e_test_token';
process.env.W1_WHATSAPP_PHONE_NUMBER_ID = 'e2e_test_phone_id';

// Ensure logger doesn't interfere with tests
const logger = require('../../src/utils/logger');
jest.spyOn(logger, 'info').mockImplementation(() => {});
jest.spyOn(logger, 'error').mockImplementation(() => {});
jest.spyOn(logger, 'warn').mockImplementation(() => {});
jest.spyOn(logger, 'debug').mockImplementation(() => {});
