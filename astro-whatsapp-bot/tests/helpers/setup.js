// tests/helpers/setup.js
// Test setup and configuration file

// Set test environment
process.env.NODE_ENV = 'test';

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.WHATSAPP_ACCESS_TOKEN = 'test-whatsapp-token';
process.env.WHATSAPP_PHONE_NUMBER_ID = 'test-phone-number-id';
process.env.WHATSAPP_VERIFY_TOKEN = 'test-verify-token';
process.env.MONGODB_URI = 'mongodb://localhost:27017/astro-whatsapp-bot-test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.STRIPE_SECRET_KEY = 'test-stripe-key';
process.env.RAZORPAY_KEY_ID = 'test-razorpay-id';
process.env.RAZORPAY_KEY_SECRET = 'test-razorpay-secret';

// Suppress console logs during testing
if (!process.env.DEBUG) {
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}

// Import required modules
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Global test setup
let mongoServer;

beforeAll(async () => {
  // Initialize in-memory MongoDB server for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  
  // Connect to in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  console.log('🧪 Starting test environment setup with in-memory MongoDB...');
});

// Global test teardown
afterAll(async () => {
  // Disconnect from database
  await mongoose.disconnect();
  
  // Stop in-memory MongoDB server
  if (mongoServer) {
    await mongoServer.stop();
  }
  
  console.log('🧹 Cleaning up test environment...');
});

// Test case setup
beforeEach(() => {
  // Reset mocks
  jest.clearAllMocks();
  
  // Reset database collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    collection.deleteMany({});
  }
  
  // Reset cache
  // Reset any other global state
});

// Test case teardown
afterEach(() => {
  // Clean up after each test
  // Any additional cleanup logic
});

// Extend Jest expectations
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Custom matchers
expect.extend({
  toHavePropertyMatching(received, propertyPath, regex) {
    const properties = propertyPath.split('.');
    let current = received;
    
    for (const prop of properties) {
      if (current === null || current === undefined || !(prop in current)) {
        return {
          message: () => `expected ${propertyPath} to exist`,
          pass: false,
        };
      }
      current = current[prop];
    }
    
    const pass = regex.test(current);
    if (pass) {
      return {
        message: () => `expected ${propertyPath} not to match ${regex}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${propertyPath} to match ${regex}, but got ${current}`,
        pass: false,
      };
    }
  },
});