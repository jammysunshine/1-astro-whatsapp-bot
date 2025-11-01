# Comprehensive Testing Guidelines for Core Services

## Introduction

This document outlines the process for ensuring comprehensive test coverage for all services located in `astro-whatsapp-bot/src/core/services/**`. It addresses both updating existing test scripts that may point to deprecated code and creating new test scripts for modules that currently lack adequate testing. The goal is to establish a robust and maintainable testing suite that exercises all functionalities of our new service architecture.

## Current Testing Landscape

Our project currently utilizes `jest` for testing, with test files typically ending in `.test.js`. We have:
*   Unit tests for some older `src/services/astrology` modules.
*   Unit tests for `whatsapp` services.
*   End-to-End (e2e) and Integration tests.

A key observation is that many existing unit tests are located in `tests/unit/services/astrology/` and may still be referencing or structured around the *old* service architecture (`src/services/`). New services in `src/core/services/` often lack dedicated unit tests or are indirectly covered by higher-level tests.

## General Principles for Comprehensive Testing

To ensure high-quality and maintainable code, adhere to the following principles:

1.  **Unit Testing:** Focus on testing individual units (functions, methods, classes) in isolation.
2.  **Mocking Dependencies:** Use mocking frameworks (like Jest's `jest.mock` or `jest.spyOn`) to isolate the unit under test from its dependencies (e.g., other services, external libraries like `sweph`, network calls, database interactions).
3.  **Test Scenarios:** Cover:
    *   **Happy Paths:** Expected inputs and successful outcomes.
    *   **Edge Cases:** Boundary conditions, empty inputs, nulls, zeros, maximum/minimum values.
    *   **Error Handling:** How the unit behaves when dependencies fail or invalid input is provided.
    *   **Asynchronous Operations:** Proper handling of Promises, `async/await`.
4.  **Code Coverage:** Aim for high code coverage, ensuring that all lines, branches, functions, and statements are executed by tests.
5.  **Readability:** Write clear, concise, and well-structured tests that are easy to understand and maintain.
6.  **Maintainability:** Tests should be easy to update when the code changes. Avoid brittle tests that break with minor refactors.

## Process for Fixing Existing Test Scripts

This process applies to test files that are currently testing modules that have been migrated or refactored into `src/core/services/`. **Prioritize services over calculators.**

1.  **Identify Mismatched Tests:**
    *   Review the `glob` output for `astro-whatsapp-bot/tests/unit/services/**/*.test.js`.
    *   Cross-reference these with the new service files in `src/core/services/**`. If a test file in `tests/unit/services/astrology/` (or similar old location) seems to correspond to a new service in `src/core/services/`, it's a candidate for this process.

2.  **Relocate and Rename Test Files (Best Practice):**
    *   **Move the test file** to mirror the new service's location in `src/core/services/`.
        *   For example, if `src/core/services/myService.js` is the service, its test should be at `tests/unit/services/core/services/myService.test.js`.
    *   **Rename the test file** to exactly match the service's filename, followed by `.test.js` (e.g., `MyService.js` should have a test file named `MyService.test.js`). This ensures a direct and unambiguous mapping.

3.  **Update Imports:**
    *   Open the identified test file (e.g., `tests/unit/services/astrology/ichingReader.test.js`).
    *   Change the `require` path to point to the *new* service location.
        *   **OLD:** `const oldService = require('../../src/services/astrology/oldService');`
        *   **NEW:** `const NewService = require('../../../../src/core/services/newService');` (Adjust relative path as needed).
    *   Ensure you are importing the *class* if the new service exports a class, not an already instantiated object.

4.  **Refactor Test Structure (if necessary):**
    *   If the old test was testing an instantiated object, and the new service exports a class, update `beforeEach` to `new` up the service and call its `initialize()` method if it has one.
    *   Update `describe` block names to reflect the new service name (e.g., `describe('NewService', () => { ... });`).

5.  **Ensure Comprehensiveness:**
    *   **Review the New Service's API:** Examine all public methods of the new service (`src/core/services/newService.js`).
    *   **Compare with Existing Tests:** Check if every public method of the new service is adequately tested in the existing test file.
    *   **Add Missing Test Cases:**
        *   For each untested public method, add a new `describe` block or `it` statement.
        *   Cover happy paths, edge cases, and error handling.
        *   Mock any dependencies that the method calls.
    *   **Remove Obsolete Tests:** If any tests were specific to old, removed functionality, delete them.

## Process for Creating New Comprehensive Test Scripts

This process applies to services in `src/core/services/**` that currently lack dedicated unit tests. **Prioritize services over calculators.**

1.  **Locating New Test Files:**
    *   Create new test files in a mirroring directory structure under `tests/unit/services/core/`.
    *   For example:
        *   `src/core/services/myService.js` -> `tests/unit/services/core/services/myService.test.js`
        *   `src/core/services/calculators/myCalculator.js` -> `tests/unit/services/core/calculators/myCalculator.test.js`

2.      *   **Test File Naming Convention:** `[ServiceName].test.js` (e.g., `MyService.js` should have a test file named `MyService.test.js`). This ensures a direct and unambiguous mapping between a service and its test suite.

3.  **Basic Test Structure:**

    ```javascript
    // tests/unit/services/core/services/MyService.test.js
    const MyService = require('../../../../../src/core/services/MyService');
    const logger = require('../../../../../src/utils/logger');
    // Import and mock any other dependencies (e.g., external libraries, other services)

    // Mock logger to prevent console output during tests
    beforeEach(() => {
      jest.spyOn(logger, 'info').mockImplementation(() => {});
      jest.spyOn(logger, 'error').mockImplementation(() => {});
      jest.spyOn(logger, 'warn').mockImplementation(() => {});
      jest.spyOn(logger, 'debug').mockImplementation(() => {});
      // Reset mocks for other dependencies here if needed
    });

    afterEach(() => {
      jest.restoreAllMocks(); // Restore all mocks after each test
    });

    describe('MyService', () => {
      let serviceInstance;

      beforeEach(async () => {
        serviceInstance = new MyService();
        // If the service has an initialize method, call it here
        if (serviceInstance.initialize) {
          await serviceInstance.initialize();
        }
        // Mock any internal dependencies of MyService here if they are instantiated within the service
      });

      describe('constructor', () => {
        it('should initialize correctly', () => {
          expect(serviceInstance).toBeInstanceOf(MyService);
          // Add more specific constructor assertions if needed
        });
      });

      describe('publicMethod1', () => {
        it('should perform action correctly with valid input', async () => {
          // Mock dependencies if publicMethod1 calls them
          // const mockDependency = jest.spyOn(serviceInstance.someDependency, 'method').mockResolvedValue(expectedValue);
          const input = { /* valid input */ };
          const result = await serviceInstance.publicMethod1(input);
          expect(result.success).toBe(true);
          // Add more specific assertions
        });

        it('should handle invalid input gracefully', async () => {
          const input = { /* invalid input */ };
          const result = await serviceInstance.publicMethod1(input);
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
        });

        it('should handle errors from internal dependencies', async () => {
          // Mock a dependency to throw an error
          // jest.spyOn(serviceInstance.someDependency, 'method').mockRejectedValue(new Error('Dependency error'));
          const input = { /* valid input */ };
          const result = await serviceInstance.publicMethod1(input);
          expect(result.success).toBe(false);
          expect(result.error).toContain('Dependency error');
        });
      });

      // Add describe blocks for other public methods
      // ...

      describe('getHealthStatus', () => {
        it('should return a healthy status when operational', async () => {
          const status = await serviceInstance.getHealthStatus();
          expect(status.status).toBe('healthy');
          expect(status.features).toBeDefined();
        });
      });

      describe('getMetadata', () => {
        it('should return correct metadata', () => {
          const metadata = serviceInstance.getMetadata();
          expect(metadata.name).toBe('MyService');
          expect(metadata.category).toBeDefined();
        });
      });

      describe('getHelp', () => {
        it('should return help information string', () => {
          const help = serviceInstance.getHelp();
          expect(typeof help).toBe('string');
          expect(help.length).toBeGreaterThan(0);
        });
      });
    });
    ```

4.  **Key Areas to Test for Each Service:**
    *   **Constructor/Initialization:** Verify properties are set correctly, dependencies are instantiated.
    *   **Public Methods:**
        *   **Input Validation:** Test that methods correctly validate their input parameters (e.g., missing required fields, invalid formats, out-of-range values).
        *   **Happy Path:** Test that methods produce the expected output for valid inputs.
        *   **Edge Cases:** Test with boundary conditions (e.g., empty arrays, zero values, maximum lengths).
        *   **Error Handling:** Test how methods handle errors thrown by their internal dependencies or unexpected conditions.
        *   **Asynchronous Behavior:** Ensure `async` methods correctly `await` promises and handle their resolutions/rejections.
    *   **Private Helper Methods:** Generally, private methods are tested indirectly through their public callers. If a private method contains complex logic, consider extracting it into a separate, testable utility function or temporarily exposing it for testing (though the latter is less ideal).
    *   **`getHealthStatus`:** Verify it accurately reflects the service's operational status and capabilities.
    *   **`getMetadata` and `getHelp`:** Ensure these methods return the expected descriptive information.

## Example Walkthrough: `IChingReadingService`

**Problem:** The `IChingReadingService` in `src/core/services/ichingReadingService.js` was incorrectly structured, importing a wrapper (`ichingReader.js`) instead of the core `IChingService` and having stub implementations. Its test file `tests/unit/services/astrology/ichingReader.test.js` was in an old location and lacked comprehensive coverage.

**Solution Steps:**

1.  **Refactor `src/core/services/ichingReadingService.js`:**
    *   **Change Import:** Modified `const { IChingReader} = require('./calculators/ichingReader');` to `const { createIChingService } = require('../../../services/astrology/iching');`.
    *   **Update Constructor/Initialize:** Changed `this.calculator = new ichingReader();` to `this.ichingService = await createIChingService();` within the `initialize` method.
    *   **Update Method Calls:** Replaced calls like `this.calculator.generateIChingReading()` with `this.ichingService.performIChingReading()`, `this.ichingService.getDailyGuidance()`, `this.ichingService.getHexagramData()`, and `this.ichingService.getTrigramData()` as appropriate. This removed the "stub implementations."

2.  **Relocate and Rename Test File:**
    *   **Moved:** `tests/unit/services/astrology/ichingReader.test.js`
    *   **To:** `tests/unit/services/core/services/ichingReadingService.test.js`

3.  **Update `tests/unit/services/core/services/ichingReadingService.test.js`:**
    *   **Update Import:** Changed `const ichingReader = require('../../../../src/core/services/ichingReadingService');` to `const IChingReadingService = require('../../../../src/core/services/ichingReadingService');` to import the class.
    *   **Update Test Setup:** Modified `beforeEach` to instantiate and initialize the service:
        ```javascript
        let ichingReadingServiceInstance;
        beforeEach(async () => {
          // ... mock logger ...
          ichingReadingServiceInstance = new IChingReadingService();
          await ichingReadingServiceInstance.initialize();
        });
        ```
    *   **Expand Test Coverage:** Added new `describe` blocks and `it` statements to test:
        *   `getDailyIChingGuidance` (happy path, default focus)
        *   `getHexagramInterpretation` (valid/invalid numbers, expected data structure)
        *   `getQuickIChingReading` (happy path, missing question)
        *   `getTrigramInfo` (valid/invalid numbers, expected data structure)
        *   `createHexagramKeyFromNumber` (utility method)
        *   `createLinesFromHexagramNumber` (utility method, including edge cases like hexagram 64)
        *   `processCalculation` (ensuring it calls `generateIChingReading`)
        *   `getHealthStatus` (healthy/unhealthy scenarios)
        *   `getMetadata` (correct structure and content)
        *   `getHelp` (returns a string)
    *   **Update Existing Tests:** Modified existing `generateIChingReading` tests to use the new instance and check for `result.success` and `result.error` as per the refactored service's return structure.

## Refactoring Opportunities

During the testing process, if a "calculator" class (e.g., `AshtakavargaCalculator.js`) is found to contain methods that are more appropriate for a handler or service orchestrator (e.g., `_isAshtakavargaRequest`, `_formatBirthDataRequiredMessage`, `handleAshtakavargaRequest`), these should be noted as refactoring opportunities. The unit tests for the calculator should focus solely on its calculation logic, not on message handling or request parsing.

## Running Tests

To run the tests, navigate to the `astro-whatsapp-bot` directory and use the command:

```bash
npm test
# or
jest
```

This will execute all `.test.js` files and report on their status and code coverage.
