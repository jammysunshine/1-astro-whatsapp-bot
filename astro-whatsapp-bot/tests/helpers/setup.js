// tests/helpers/setup.js
// Comprehensive Test Setup and Configuration File

// Mock logger before any modules load it
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Set test environment
process.env.NODE_ENV = 'test';

// Mock environment variables
process.env.WHATSAPP_ACCESS_TOKEN = 'test-whatsapp-access-token';
process.env.WHATSAPP_PHONE_NUMBER_ID = 'test-phone-number-id';
process.env.WHATSAPP_VERIFY_TOKEN = 'test-verify-token';
process.env.WHATSAPP_APP_SECRET = 'test-app-secret';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/astro-whatsapp-bot-test';
process.env.STRIPE_SECRET_KEY = 'test-stripe-secret-key';
process.env.RAZORPAY_KEY_ID = 'test-razorpay-key-id';
process.env.RAZORPAY_KEY_SECRET = 'test-razorpay-key-secret';
process.env.OPENAI_API_KEY = 'test-openai-api-key';
process.env.ASTROLOGY_API_KEY = 'test-astrology-api-key';

// Suppress console logs during testing (unless in debug mode)
if (!process.env.DEBUG) {
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}

// Global test setup
beforeAll(async() => {
  // Initialize test database
  // Start mock servers
  console.log('🧪 Starting comprehensive test environment setup...');
});

// Global test teardown
afterAll(async() => {
  // Clean up test database
  // Stop mock servers
  console.log('🧹 Cleaning up comprehensive test environment...');
});

// Test case setup
beforeEach(() => {
  // Reset mocks
  jest.clearAllMocks();
  // Reset database
  // Reset cache
});

// Test case teardown
afterEach(() => {
  // Clean up after each test
});

// Extend Jest expectations
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false
      };
    }
  },

  toHavePropertyMatching(received, propertyPath, regex) {
    const properties = propertyPath.split('.');
    let current = received;

    for (const prop of properties) {
      if (current === null || current === undefined || !(prop in current)) {
        return {
          message: () => `expected ${propertyPath} to exist`,
          pass: false
        };
      }
      current = current[prop];
    }

    const pass = regex.test(current);
    if (pass) {
      return {
        message: () => `expected ${propertyPath} not to match ${regex}`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${propertyPath} to match ${regex}, but got ${current}`,
        pass: false
      };
    }
  },

  toBeValidPhoneNumber(received) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const pass = phoneRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid phone number`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid phone number`,
        pass: false
      };
    }
  },

  toBeValidDate(received) {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    const pass = dateRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date (DD/MM/YYYY)`,
        pass: false
      };
    }
  },

  toBeValidTime(received) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const pass = timeRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid time`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid time (HH:MM)`,
        pass: false
      };
    }
  }
});

// Custom matchers for common testing scenarios
expect.extend({
  toBeJsonApiError(received) {
    const requiredFields = ['error', 'message'];
    const hasRequiredFields = requiredFields.every(field => field in received);
    const pass = hasRequiredFields && typeof received.error === 'string' && typeof received.message === 'string';

    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be a valid JSON API error`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be a valid JSON API error with required fields: ${requiredFields.join(', ')}`,
        pass: false
      };
    }
  },

  toBeWhatsAppWebhook(received) {
    const requiredFields = ['entry'];
    const hasRequiredFields = requiredFields.every(field => field in received);
    const pass = hasRequiredFields && Array.isArray(received.entry);

    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be a valid WhatsApp webhook`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be a valid WhatsApp webhook with required fields: ${requiredFields.join(', ')}`,
        pass: false
      };
    }
  },

  toBeAstrologyApiResponse(received) {
    const requiredFields = ['success', 'data'];
    const hasRequiredFields = requiredFields.every(field => field in received);
    const pass = hasRequiredFields && typeof received.success === 'boolean' && typeof received.data === 'object';

    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be a valid astrology API response`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be a valid astrology API response with required fields: ${requiredFields.join(', ')}`,
        pass: false
      };
    }
  }
});
