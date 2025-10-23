// jest.config.js
// Jest configuration for comprehensive testing with 95%+ coverage requirement

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Root directory for tests
  roots: ['<rootDir>/tests'],
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.+(js|jsx|ts|tsx)',
    '**/?(*.)+(spec|test).+(js|jsx|ts|tsx)'
  ],
  
  // File extensions to look for
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/server.js', // Exclude server startup file
    '!src/config/**', // Exclude configuration files
    '!**/node_modules/**', // Exclude node_modules
    '!**/vendor/**', // Exclude vendor directories
    '!**/*.d.ts' // Exclude declaration files
  ],
  coverageDirectory: 'tests/reports/coverage',
  coverageReporters: [
    'json',
    'lcov',
    'text',
    'clover',
    'html'
  ],
  
  // Coverage thresholds (95%+ as mandated by gemini.md)
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/helpers/setup.js'],
  
  // Test reporters
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'Astro WhatsApp Bot Test Report',
        outputPath: './tests/reports/test-report.html'
      }
    ],
    [
      'jest-junit',
      {
        outputDirectory: './tests/reports/junit'
      }
    ]
  ],
  
  // Test timeout
  testTimeout: 30000,
  
  // Concurrency settings
  maxConcurrency: 5,
  maxWorkers: '50%',
  
  // Memory leak detection
  detectOpenHandles: true,
  forceExit: true,
  
  // Verbose output
  verbose: true,
  
  // Notification settings
  notify: true,
  notifyMode: 'always',
  
  // Module name mapper for aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Transform settings for future TypeScript support
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ]
};