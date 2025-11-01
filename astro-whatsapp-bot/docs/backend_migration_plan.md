# Backend Code Migration Plan

## 1. Introduction

This document outlines a detailed plan for migrating existing backend services and calculators from `src/core/services/**` and `src/core/services/calculators/**` to a new, consolidated directory: `src/services/core`. The goal is to streamline the backend architecture, improve modularity, and ensure a clear separation of concerns, aligning with the principles established in `MENU_ARCHITECTURE_PROPOSAL.md`.

## 2. New Architecture Overview

The target architecture dictates that all core backend logic, including services and calculators, will reside under `src/services/core`. This centralizes backend components, making them easier to manage, test, and evolve.

## 3. Phase 1: Discovery and Identification

This phase involves identifying all relevant files in the old structure and categorizing them based on their role and whether they need to be moved, refactored, or deprecated.

### 3.1. Existing Backend Services (`src/core/services/**`)

- `abhijitMuhurtaService.js`
- `advancedCompatibilityService.js`
- `advancedTransitsService.js`
- `antardashaService.js`
- `ashtakavargaService.js`
- `asteroidsService.js`
- `astrocartographyService.js`
- `ayurvedicAstrologyService.js`
- `basicBirthChartService.js`
- `birthChartService.js`
- `businessPartnershipService.js`
- `calculateNakshatraService.js`
- `calendarTimingService.js`
- `careerAstrologyService.js`
- `celticAstrologyService.js`
- `chineseAstrologyService.js`
- `compatibilityScoreService.js`
- `compatibilityService.js`
- `compositeChartService.js`
- `comprehensiveVedicAnalysisService.js`
- `cosmicEventsService.js`
- `coupleCompatibilityService.js`
- `currentDashaService.js`
- `currentTransitsService.js`
- `dailyHoroscopeService.js`
- `dashaPredictiveService.js`
- `davisonChartService.js`
- `detailedChartAnalysisService.js`
- `divinationService.js`
- `electionalAstrologyService.js`
- `enhancedPanchangService.js`
- `enhancedSecondaryProgressionsService.js`
- `enhancedSolarArcDirectionsService.js`
- `ephemerisService.js`
- `eventAstrologyService.js`
- `familyAstrologyService.js`
- `financialAstrologyService.js`
- `fixedStarsService.js`
- `futureSelfAnalysisService.js`
- `futureSelfSimulatorService.js`
- `generateGroupAstrologyService.js`
- `gocharService.js`
- `groupTimingService.js`
- `gulikakalamService.js`
- `hellenisticAstrologyService.js`
- `hinduAstrologyService.js`
- `hinduFestivalsService.js`
- `horaryAstrologyService.js`
- `horaryReadingService.js`
- `ichingReadingService.js`
- `islamicAstrologyService.js`
- `jaiminiAstrologyService.js`
- `jaiminiDashasService.js`
- `kaalSarpDoshaService.js`
- `kabbalisticAstrologyService.js`
- `lifePatternsService.js`
- `lunarReturnService.js`
- `majorTransitsService.js`
- `mayanAstrologyService.js`
- `medicalAstrologyService.js`
- `moonSignService.js`
- `muhurtaService.js`
- `mundaneAstrologyService.js`
- `nadiAstrologyService.js`
- `nakshatraPoruthamService.js`
- `numerologyAnalysisService.js`
- `numerologyReportService.js`
- `numerologyService.js`
- `palmistryService.js`
- `panchangService.js`
- `performSynastryAnalysisService.js`
- `planetaryEventsService.js`
- `prashnaAstrologyService.js`
- `prashnaService.js`
- `rahukalamService.js`
- `remediesDoshaService.js`
- `risingSignService.js`
- `sadeSatiService.js`
- `seasonalEventsService.js`
- `secondaryProgressionsService.js`
- `shadbalaService.js`
- `significantTransitsService.js`
- `solarArcDirectionsService.js`
- `solarReturnService.js`
- `specializedAnalysisService.js`
- `sunSignService.js`
- `synastryAnalysisService.js`
- `tarotReadingService.js`
- `transitPreviewService.js`
- `upcomingDashasService.js`
- `vargaChartsService.js`
- `varshaphalService.js`
- `vedicNumerologyService.js`
- `vedicRemediesService.js`
- `vedicYogasService.js`
- `vimshottariDashaService.js`
- `westernBirthChartService.js`

### 3.2. Existing Calculators (`src/core/services/calculators/**`)

- `AntardashaCalculator.js`
- `AshtakavargaCalculator.js`
- `AsteroidCalculator.js`
- `CalculationsCoordinator.js`
- `CareerAstrologyCalculator.js`
- `ChartGenerator.js`
- `CompatibilityAction.js`
- `CompatibilityCalculator.js`
- `ComprehensiveAnalysisCalculator.js`
- `CosmicEventsCalculator.js`
- `DailyHoroscopeCalculator.js`
- `DashaAnalysisCalculator.js`
- `DetailedChartAnalysisCalculator.js`
- `DetailedChartCalculator.js`
- `FinancialAstrologyCalculator.js`
- `FixedStarsCalculator.js`
- `FutureSelfSimulatorCalculator.js`
- `FutureSelfSimulatorCalculator.js.backup`
- `FutureSelfSimulatorCalculator.js.backup2`
- `FutureSelfSimulatorCalculator.js.backup3`
- `GocharCalculator.js`
- `GroupAstrologyCalculator.js`
- `HoraryCalculator.js`
- `JaiminiAstrologyCalculator.js`
- `JaiminiCalculator.js`
- `KaalSarpDoshaCalculator.js`
- `LifePatternsCalculator.js`
- `LunarReturnCalculator.js`
- `MarriageTimingCalculator.js`
- `MedicalAstrologyCalculator.js`
- `MuhurtaCalculator.js`
- `NadiCompatibility.js`
- `PanchangCalculator.js`
- `PoliticalAstrology.js`
- `PrashnaCalculator.js`
- `RemedialMeasuresCalculator.js`
- `SadeSatiCalculator.js`
- `SecondaryProgressionsCalculator.js`
- `ShadbalaCalculator.js`
- `SignCalculator.js`
- `SignificantTransitsCalculator.js`
- `SolarArcDirectionsCalculator.js`
- `SolarReturnCalculator.js`
- `SynastryEngine.js`
- `TransitCalculator.js`
- `VargaChartCalculator.js`
- `VarshaphalCalculator.js`
- `VedicCalculator.js`
- `VedicNumerology.js`
- `VedicYogasCalculator.js`
- `astrocartographyReader.js`
- `celticReader.js`
- `chineseCalculator.js`
- `hellenisticAstrology.js`
- `hinduFestivals.js`
- `ichingReader.js`
- `index.js`
- `kabbalisticReader.js`
- `mayanReader.js`
- `numerologyService.js`
- `numerology_data.json`
- `palmistryReader.js`
- `tarotReader.js`

### 3.3. Dependencies and Cross-References

Many services directly `require` calculators or other services. These dependencies will need to be updated to reflect the new directory structure.

## 4. Phase 2: Migration Strategy

### 4.1. New Directory Creation

Create the following new directory:

- `src/services/core`

### 4.2. File Movement and Refactoring

All files currently in `src/core/services/` and `src/core/services/calculators/` will be moved to `src/services/core/`. This is a direct move, and then internal `require` paths will be updated.

**Specific Actions:**

1.  **Move all files from `src/core/services/` to `src/services/core/`**
    *   Example: `src/core/services/abhijitMuhurtaService.js` -> `src/services/core/abhijitMuhurtaService.js`

2.  **Move all files from `src/core/services/calculators/` to `src/services/core/calculators/`**
    *   Example: `src/core/services/calculators/AntardashaCalculator.js` -> `src/services/core/calculators/AntardashaCalculator.js`

3.  **Update `require` paths within all moved files:**
    *   Any `require('../../utils/logger')` will become `require('../../../utils/logger')` (assuming `src/utils` is shared).
    *   Any `require('./calculators/SomeCalculator')` will become `require('./calculators/SomeCalculator')` (relative path within the new `src/services/core` structure).
    *   Any `require('../interfaces/astroServiceInterface')` will become `require('../../interfaces/astroServiceInterface')`.
    *   Any `require('../../models/BirthData')` will become `require('../../models/BirthData')`.

4.  **Refactor `src/core/services/index.js`:** This file currently exports all services. It will need to be updated to reflect the new paths of the moved services.

5.  **Refactor `src/core/services/calculators/index.js`:** This file currently exports all calculators. It will need to be updated to reflect the new paths of the moved calculators.

### 4.3. Dependency Updates Across the Codebase

Any file outside of `src/core/services/` or `src/core/services/calculators/` that imports modules from these locations will need its `require` or `import` paths updated. This will require a global search and replace.

**Key areas to check:**

-   `src/services/whatsapp/MessageCoordinator.js` (and other WhatsApp-related files)
-   `src/core/config/ActionConfig.js` (if it imports any services/calculators)
-   Any test files (`tests/**`) that import these modules.

### 4.4. Testing Strategy

-   **Unit Tests:** Ensure all existing unit tests for services and calculators pass after migration.
-   **Integration Tests:** Develop new integration tests or update existing ones to verify the correct interaction between services, calculators, and other parts of the application in the new structure.
-   **End-to-End Tests:** Run existing E2E tests to ensure no regressions in overall application functionality.

## 5. Phase 3: Deprecation and Removal

After successful migration and verification, the following directories will be empty and can be removed:

-   `src/core/services/` (after all its contents are moved)
-   `src/core/services/calculators/` (after all its contents are moved)

## 6. Rollback Plan

In case of critical issues during or after migration, the following rollback strategy will be employed:

1.  Revert to the last stable commit before the migration began.
2.  Analyze the root cause of the failure.
3.  Adjust the migration plan and re-attempt the process.

This plan ensures a systematic and safe transition of the backend codebase to the new architecture.
