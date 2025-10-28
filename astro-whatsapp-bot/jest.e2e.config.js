// Jest configuration for E2E tests
module.exports = {
  // Use the shared setup file for all E2E tests
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.js'],

  // Only run E2E tests in the e2e directory
  testMatch: [
    '<rootDir>/tests/e2e/**/*.test.js'
  ],

  // Increase timeout for E2E operations (database, API calls)
  testTimeout: 60000,

  // Handle ES modules if needed
  extensionsToTreatAsEsm: [],

  // Transform settings for E2E tests
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // Coverage collection for E2E tests
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/test-*.js'
  ],

  coverageDirectory: 'coverage/e2e',

  // Verbose output for E2E tests
  verbose: true,

  // Force exit to prevent hanging processes
  forceExit: true,

  // Detect open handles (good for debugging hanging tests)
  detectOpenHandles: true
};