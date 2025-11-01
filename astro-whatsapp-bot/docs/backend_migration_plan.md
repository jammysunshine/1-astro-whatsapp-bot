# Backend Code Migration Plan

## Objective

Deprecate older backend source code located in `astro-whatsapp-bot/src/services/` and migrate all necessary parts, including core business logic and calculators, to the new directory structure: `astro-whatsapp-bot/src/core/services/**`. This will ensure a cleaner architecture, better maintainability, and clear separation of concerns.

## Phase 1: Identification and Analysis (Current State)

### 1.1 Identify "Old" Backend Services and Calculators

The following files and directories within `astro-whatsapp-bot/src/services/` are considered "old" and need to be migrated or deprecated:

*   All files directly under `astro-whatsapp-bot/src/services/astrology/` (e.g., `astro-whatsapp-bot/src/services/astrology/vedic/VedicCalculator.js`, `astro-whatsapp-bot/src/services/astrology/handlers/vedic/calculations.js`, etc.)
*   All files under `astro-whatsapp-bot/src/services/astrology/calculators/` (e.g., `astro-whatsapp-bot/src/services/astrology/calculators/ChartGenerator.js`, etc.)
*   All files under `astro-whatsapp-bot/src/services/astrology/handlers/` (e.e.g., `astro-whatsapp-bot/src/services/astrology/handlers/vedic/*Handler.js`, etc.)
*   Any other core business logic files found directly under `astro-whatsapp-bot/src/services/` (e.g., `astro-whatsapp-bot/src/services/payment/paymentService.js`, `astro-whatsapp-bot/src/services/i18n/TranslationService.js`, etc.)

**(Note: A comprehensive list of specific files will be generated in the next step based on the provided glob output.)**

### 1.2 Dependency Mapping

For each identified "old" service/calculator:

*   **Identify Internal Dependencies:** List all modules/files that the old service/calculator imports from *within* the `astro-whatsapp-bot/src/services/` structure.
*   **Identify External Dependencies:** List any external libraries or APIs used by the old service/calculator.
*   **Identify Consumers:** Determine which "new" services (`astro-whatsapp-bot/src/core/services/**`) or "action" files (`astro-whatsapp-bot/src/services/whatsapp/actions/**`) currently import and use the old service/calculator.

## Phase 2: Migration Strategy

The migration will follow a principle of moving core, reusable logic to `astro-whatsapp-bot/src/core/services/` and adapting higher-level components (e.g., WhatsApp actions) to use these new core services.

### 2.1 Core Service/Calculator Migration (High Priority)

1.  **Selection:** Prioritize "old" Calculator and core Service files identified in Phase 1.1 that contain fundamental, reusable logic.
2.  **Move & Rename:** Move each selected file from `astro-whatsapp-bot/src/services/astrology/calculators/` or `astro-whatsapp-bot/src/services/astrology/handlers/` (or similar core locations) to the corresponding new `astro-whatsapp-bot/src/core/services/` subdirectory. For example, `astro-whatsapp-bot/src/services/astrology/calculators/ChartGenerator.js` should move to `astro-whatsapp-bot/src/core/services/calculators/ChartGenerator.js`.
3.  **Namespace/Path Update:** Update all import/require paths within the moved files to reflect the new directory structure (`@astro-whatsapp-bot/src/core/services/`).
4.  **Refactor (if necessary):** If an old service contains mixed responsibilities (e.g., calculation logic directly coupled with specific handler logic), refactor it to separate these concerns. The core calculation logic should reside in `astro-whatsapp-bot/src/core/services/calculators/`.
5.  **Create New Service Layer (if applicable):** Create a new service file (e.g., `AstroChartService.js`) in `astro-whatsapp-bot/src/core/services/` that orchestrates calls to the migrated calculators. This aligns with the new architecture where `src/core/services` contains the business logic.

### 2.2 Consumer Adaptation (Medium Priority)

1.  **Identify Consumers:** Use the dependency mapping from Phase 1.2 to find all files (e.g., WhatsApp Actions like `astro-whatsapp-bot/src/services/whatsapp/actions/astrology/BirthChartAction.js`) that import the now-moved core services/calculators.
2.  **Update Imports:** Modify these consumer files to import from the new `@astro-whatsapp-bot/src/core/services/` paths.
3.  **Adaptation:** Adjust the instantiation and usage of the services/calculators to match any refactoring or new service layers created in Phase 2.1.

### 2.3 Deprecate and Remove (Low Priority / Incremental)

1.  **Mark as Deprecated:** Once all consumers have been updated, mark the original files in `astro-whatsapp-bot/src/services/` as deprecated (e.g., add a `DEPRECATED` comment at the top, or rename them temporarily with a `.bak` extension).
2.  **Monitor:** Allow a period for testing and validation to ensure no regressions.
3.  **Removal:** Incrementally remove the deprecated files from the old `astro-whatsapp-bot/src/services/` directory.

## Phase 3: Testing Plan

Thorough testing is paramount to ensure a smooth migration.

### 3.1 Unit Testing

*   **Existing Tests:** Ensure all existing unit tests for migrated services/calculators still pass after moving and refactoring.
*   **New Tests:** Write new unit tests for any refactored logic or new service layers created in `astro-whatsapp-bot/src/core/services/`.

### 3.2 Integration Testing

*   **End-to-End Flows:** Verify critical end-to-end user flows involving the migrated backend logic still function correctly (e.g., requesting a birth chart analysis via WhatsApp).
*   **Automated Tests:** Update any automated integration tests to reflect new import paths and service interactions.

### 3.3 Linting and Code Quality

*   **Linting:** Run `npm run lint` or equivalent to ensure adherence to code style and catch potential errors in the new/modified files.
*   **Type Checking (if applicable):** If TypeScript is used, ensure all type checks pass.

## Phase 4: Rollback Plan

In case of critical issues or unexpected regressions during or after migration:

*   **Version Control:** Utilize Git branches. All changes for this migration will be performed on a dedicated feature branch.
*   **Revert Changes:** If necessary, the entire feature branch can be easily reverted to the last stable state.
*   **Incremental Commits:** Make small, logical commits throughout the migration to facilitate easier debugging and partial rollbacks if needed.

## Example File Migration Flow (Illustrative)

**Old Path:** `astro-whatsapp-bot/src/services/astrology/calculators/ChartGenerator.js`
**New Path:** `astro-whatsapp-bot/src/core/services/calculators/ChartGenerator.js`

**Steps:**
1.  Move `ChartGenerator.js` to the new path.
2.  Update internal imports within `ChartGenerator.js` (if any).
3.  Identify consumers (e.g., `astro-whatsapp-bot/src/services/whatsapp/actions/astrology/BirthChartAction.js`).
4.  Update imports in `BirthChartAction.js` from `../../../astrology/calculators/ChartGenerator` to `../../../../core/services/calculators/ChartGenerator`.
5.  Run tests.
6.  Mark `ChartGenerator.js` as deprecated in old location (or create a dummy file that only throws an error if still accessed).
7.  Eventually remove the old file.

**This plan does not include execution. It merely outlines the steps for a safe and efficient migration.**