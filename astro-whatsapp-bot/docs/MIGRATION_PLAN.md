# Astro WhatsApp Bot - Code Migration Plan

This document outlines the detailed plan for migrating existing astrological service implementations and utility functions into the new architectural structure (`src/core/`, `src/interfaces/`, `src/adapters/`). The goal is to map each of the 90 identified microservices and shared helpers to their new locations, prioritizing comprehensive implementations that leverage Swiss Ephemeris, `sweph`, and `astrologer` libraries.

**Refactoring Guideline Reminder:** This migration will strictly follow the "copy-first, deprecate-later" approach. Files will be copied, not moved, and original files will only be deprecated once the new, refactored service is fully functional and integrated.

## 1. Microservices Mapping (from MICROSERVICES_LIST.md)

Each entry below represents a microservice. We will identify its source in the existing codebase and its target file in the new `src/core/services/` structure.

**IMPORTANT:** Each microservice must be implemented as an independent service file with clear separation of concerns. No single file should contain multiple unrelated microservices.

### Compatibility & Relationships Services (Target: `core/services/vedic/compatibilityService.js`)

1.  `start_couple_compatibility_flow`
    *   **Source:** `src/services/astrology/CompatibilityAction.js`, `src/services/astrology/compatibility/CompatibilityWorkflowManager.js`
    *   **Target File:** `core/services/vedic/compatibilityService.js`
    *   **Notes:** This is a high-level flow orchestrator. The core logic will be extracted and exposed as a function in the new service.

2.  `get_synastry_analysis`
    *   **Source:** `src/services/astrology/compatibility/SynastryEngine.js`, `src/services/astrology/compatibility/CompatibilityChecker.js`, `src/services/astrology/compatibility/CompatibilityScorer.js`, `src/services/astrology/compatibility/RelationshipInsightsGenerator.js`
    *   **Target File:** `core/services/vedic/compatibilityService.js`
    *   **Notes:** This will be a comprehensive function in the new service, utilizing multiple internal compatibility utilities.

3.  `start_family_astrology_flow`
    *   **Source:** Likely involves `generateGroupAstrology` (from `MICROSERVICES_LIST.md`) and `src/services/astrology/compatibility/CompatibilityWorkflowManager.js`.
    *   **Target File:** `core/services/vedic/compatibilityService.js`
    *   **Notes:** High-level flow.

4.  `start_business_partnership_flow`
    *   **Source:** Likely involves `generateGroupAstrology` and `src/services/astrology/compatibility/CompatibilityWorkflowManager.js`.
    *   **Target File:** `core/services/vedic/compatibilityService.js`
    *   **Notes:** High-level flow.

5.  `start_group_timing_flow`
    *   **Source:** Needs further investigation. Potentially related to `src/services/astrology/mundane/` or `src/services/astrology/vedic/calculators/MuhurtaCalculator.js`.
    *   **Target File:** `core/services/vedic/calendarTimingService.js` (or `common/timingService.js` if general).
    *   **Notes:** This is a flow, not a direct calculation.

6.  `calculateNakshatraPorutham`
    *   **Source:** Likely within `src/services/astrology/compatibility/CompatibilityChecker.js`, `src/services/astrology/compatibility/SynastryEngine.js`, or `src/services/astrology/nadi/NadiCompatibility.js`.
    *   **Target File:** `core/services/vedic/compatibilityService.js`
    *   **Notes:** Specific compatibility calculation.

7.  `calculateCompatibilityScore`
    *   **Source:** `src/services/astrology/compatibility/CompatibilityScorer.js`.
    *   **Target File:** `core/services/vedic/compatibilityService.js`
    *   **Notes:** Core scoring function.

8.  `performSynastryAnalysis`
    *   **Source:** `src/services/astrology/compatibility/SynastryEngine.js`.
    *   **Target File:** `core/services/vedic/compatibilityService.js`
    *   **Notes:** Core analysis function.

9.  `calculateCompositeChart`
    *   **Source:** Needs to be identified. Potentially in `src/services/astrology/charts/ChartGenerator.js` or `src/services/astrology/compatibility/SynastryEngine.js`.
    *   **Target File:** `core/services/vedic/compatibilityService.js`
    *   **Notes:** Chart generation function.

10. `calculateDavisonChart`
    *   **Source:** Needs to be identified. Similar to `calculateCompositeChart`.
    *   **Target File:** `core/services/vedic/compatibilityService.js`
    *   **Notes:** Chart generation function.

11. `generateGroupAstrology`
    *   **Source:** `src/services/astrology/vedic/calculators/GroupAstrologyCalculator.js`.
    *   **Target File:** `core/services/vedic/compatibilityService.js`
    *   **Notes:** Comprehensive group analysis.

### Core Readings & Charts Services (Target: `core/services/vedic/birthChartService.js`)

12. `get_hindu_astrology_analysis`
    *   **Source:** `src/services/astrology/charts/VedicChartGenerator.js`, `src/services/astrology/vedic/calculators/ChartGenerator.js`.
    *   **Target File:** `core/services/vedic/birthChartService.js`
    *   **Notes:** Main function for generating a Vedic birth chart.

13. `generateDetailedChartAnalysis`
    *   **Source:** `src/services/astrology/vedic/calculators/DetailedChartAnalysisCalculator.js`.
    *   **Target File:** `core/services/vedic/birthChartService.js`
    *   **Notes:** Comprehensive analysis of a chart.

14. `generateBasicBirthChart`
    *   **Source:** `src/services/astrology/charts/ChartGenerator.js`, `src/services/astrology/vedic/calculators/DetailedChartCalculator.js`.
    *   **Target File:** `core/services/vedic/birthChartService.js`
    *   **Notes:** Simplified chart generation.

15. `generateWesternBirthChart`
    *   **Source:** `src/services/astrology/charts/WesternChartGenerator.js`, `src/services/astrology/western/WesternCalculator.js`.
    *   **Target File:** `core/services/vedic/birthChartService.js` (or `core/services/western/westernAstrologyService.js` if it's purely Western).
    *   **Notes:** Western chart generation.

16. `calculateSunSign`
    *   **Source:** `src/services/astrology/calculations/SignCalculations.js`, `src/services/astrology/vedic/calculators/SignCalculator.js`.
    *   **Target File:** `core/services/vedic/birthChartService.js`
    *   **Notes:** Core calculation. Prioritize the one using `sweph` and `astrologer`.

17. `calculateMoonSign`
    *   **Source:** `src/services/astrology/calculations/SignCalculations.js`, `src/services/astrology/vedic/calculators/SignCalculator.js`.
    *   **Target File:** `core/services/vedic/birthChartService.js`
    *   **Notes:** Core calculation.

18. `calculateRisingSign`
    *   **Source:** `src/services/astrology/calculations/SignCalculations.js`, `src/services/astrology/vedic/calculators/SignCalculator.js`.
    *   **Target File:** `core/services/vedic/birthChartService.js`
    *   **Notes:** Core calculation.

19. `calculateNakshatra`
    *   **Source:** `src/services/astrology/calculations/SignCalculations.js`, `src/services/astrology/vedic/calculators/SignCalculator.js`.
    *   **Target File:** `core/services/vedic/birthChartService.js`
    *   **Notes:** Core calculation.

### Dasha & Predictive Systems Services (Target: `core/services/vedic/dashaPredictiveService.js`)

20. `get_vimshottari_dasha_analysis`
    *   **Source:** `src/services/astrology/vimshottariDasha.js`, `src/services/astrology/vedic/calculators/DashaAnalysisCalculator.js`.
    *   **Target File:** `core/services/vedic/dashaPredictiveService.js`
    *   **Notes:** Main Vimshottari Dasha calculation.

21. `calculateCurrentDasha`
    *   **Source:** `src/services/astrology/vedic/calculators/DashaAnalysisCalculator.js`.
    *   **Target File:** `core/services/vedic/dashaPredictiveService.js`
    *   **Notes:** Specific Dasha calculation.

22. `calculateUpcomingDashas`
    *   **Source:** `src/services/astrology/vedic/calculators/DashaAnalysisCalculator.js`.
    *   **Target File:** `core/services/vedic/dashaPredictiveService.js`
    *   **Notes:** Specific Dasha calculation.

23. `calculateAntardasha`
    *   **Source:** `src/services/astrology/vedic/calculators/DashaAnalysisCalculator.js`.
    *   **Target File:** `core/services/vedic/dashaPredictiveService.js`
    *   **Notes:** Specific Dasha calculation.

24. `calculateJaiminiAstrology`
    *   **Source:** `src/services/astrology/jaiminiAstrology.js`, `src/services/astrology/vedic/calculators/JaiminiAstrologyCalculator.js`.
    *   **Target File:** `core/services/vedic/dashaPredictiveService.js`
    *   **Notes:** Main Jaimini calculation.

25. `calculateJaiminiDashas`
    *   **Source:** `src/services/astrology/vedic/calculators/JaiminiAstrologyCalculator.js`, `src/services/astrology/calculators/JaiminiKarakaCalculator.js`.
    *   **Target File:** `core/services/vedic/dashaPredictiveService.js`
    *   **Notes:** Specific Jaimini calculation.

26. `calculateGochar`
    *   **Source:** `src/services/astrology/vedic/calculators/GocharCalculator.js`.
    *   **Target File:** `core/services/vedic/dashaPredictiveService.js`
    *   **Notes:** Transit analysis.

27. `calculateSolarReturn`
    *   **Source:** `src/services/astrology/vedic/calculators/SolarReturnCalculator.js`.
    *   **Target File:** `core/services/vedic/dashaPredictiveService.js`
    *   **Notes:** Predictive calculation.

28. `calculateLunarReturn`
    *   **Source:** `src/services/astrology/vedic/calculators/LunarReturnCalculator.js`.
    *   **Target File:** `core/services/vedic/dashaPredictiveService.js`
    *   **Notes:** Predictive calculation.

29. `calculateVarshaphal`
    *   **Source:** `src/services/astrology/vedic/calculators/VarshaphalCalculator.js`.
    *   **Target File:** `core/services/vedic/dashaPredictiveService.js`
    *   **Notes:** Predictive calculation.

30. `calculateSecondaryProgressions`
    *   **Source:** `src/services/astrology/vedic/calculators/SecondaryProgressionsCalculator.js`.
    *   **Target File:** `core/services/vedic/dashaPredictiveService.js`
    *   **Notes:** Predictive calculation.

31. `calculateSolarArcDirections`
    *   **Source:** `src/services/astrology/vedic/calculators/SolarArcDirectionsCalculator.js`.
    *   **Target File:** `core/services/vedic/dashaPredictiveService.js`
    *   **Notes:** Predictive calculation.

32. `calculateEnhancedSecondaryProgressions`
    *   **Source:** `src/services/astrology/vedic/calculators/SecondaryProgressionsCalculator.js` (likely an enhanced version within).
    *   **Target File:** `core/services/vedic/dashaPredictiveService.js`
    *   **Notes:** Predictive calculation.

33. `calculateEnhancedSolarArcDirections`
    *   **Source:** `src/services/astrology/vedic/calculators/SolarArcDirectionsCalculator.js` (likely an enhanced version within).
    *   **Target File:** `core/services/vedic/dashaPredictiveService.js`
    *   **Notes:** Predictive calculation.

34. `calculateNextSignificantTransits`
    *   **Source:** `src/services/astrology/vedic/calculators/SignificantTransitsCalculator.js`.
    *   **Target File:** `core/services/vedic/dashaPredictiveService.js`
    *   **Notes:** Predictive calculation.

35. `calculateAdvancedTransits`
    *   **Source:** `src/services/astrology/vedic/calculators/TransitCalculator.js`, `src/services/astrology/vedic/calculators/GocharCalculator.js`.
    *   **Target File:** `core/services/vedic/dashaPredictiveService.js`
    *   **Notes:** Predictive calculation.

36. `identifyMajorTransits`
    *   **Source:** `src/services/astrology/vedic/calculators/SignificantTransitsCalculator.js`.
    *   **Target File:** `core/services/vedic/dashaPredictiveService.js`
    *   **Notes:** Predictive calculation.

37. `generateTransitPreview`
    *   **Source:** `src/services/astrology/vedic/calculators/TransitCalculator.js`, `src/services/astrology/vedic/calculators/GocharCalculator.js`.
    *   **Target File:** `core/services/vedic/dashaPredictiveService.js`
    *   **Notes:** Predictive calculation.

### Specialized Analysis & Reports Services (Target: `core/services/vedic/specializedAnalysisService.js`)

38. `get_ashtakavarga_analysis`
    *   **Source:** `src/services/astrology/ashtakavarga.js`, `src/services/astrology/vedic/calculators/AshtakavargaCalculator.js`, `src/services/astrology/calculators/AshtakavargaCalculator.js`. Prioritize the most comprehensive one.
    *   **Target File:** `core/services/vedic/specializedAnalysisService.js`
    *   **Notes:** Main Ashtakavarga analysis.

39. `generateShadbala`
    *   **Source:** `src/services/astrology/vedic/calculators/ShadbalaCalculator.js`.
    *   **Target File:** `core/services/vedic/specializedAnalysisService.js`
    *   **Notes:** Main Shadbala calculation.

40. `get_varga_charts_analysis`
    *   **Source:** `src/services/astrology/vargaCharts.js`, `src/services/astrology/vedic/calculators/VargaChartCalculator.js`.
    *   **Target File:** `core/services/vedic/specializedAnalysisService.js`
    *   **Notes:** Main Varga Charts analysis.

41. `get_prashna_astrology_analysis`
    *   **Source:** `src/services/astrology/prashnaAstrology.js`, `src/services/astrology/vedic/calculators/PrashnaCalculator.js`.
    *   **Target File:** `core/services/vedic/specializedAnalysisService.js`
    *   **Notes:** Main Prashna Astrology analysis.

42. `calculateVedicYogas`
    *   **Source:** `src/services/astrology/vedic/calculators/VedicYogasCalculator.js`.
    *   **Target File:** `core/services/vedic/specializedAnalysisService.js`
    *   **Notes:** Vedic Yogas calculation.

43. `calculateAsteroids`
    *   **Source:** `src/services/astrology/vedic/calculators/AsteroidCalculator.js`.
    *   **Target File:** `core/services/vedic/specializedAnalysisService.js`
    *   **Notes:** Asteroid positions and meanings.

44. `generateComprehensiveVedicAnalysis`
    *   **Source:** `src/services/astrology/vedic/calculators/ComprehensiveAnalysisCalculator.js`.
    *   **Target File:** `core/services/vedic/specializedAnalysisService.js`
    *   **Notes:** Comprehensive integrated analysis.

45. `generateFutureSelfSimulator`
    *   **Source:** `src/services/astrology/vedic/calculators/FutureSelfSimulatorCalculator.js`.
    *   **Target File:** `core/services/vedic/specializedAnalysisService.js`
    *   **Notes:** Future life simulation.

46. `get_ayurvedic_astrology_analysis`
    *   **Source:** `src/services/astrology/ayurvedicAstrology.js`.
    *   **Target File:** `core/services/vedic/specializedAnalysisService.js`
    *   **Notes:** Ayurvedic Astrology analysis.

47. `generateLifePatterns`
    *   **Source:** Needs to be identified. Might be a general utility or part of a comprehensive analysis.
    *   **Target File:** `core/services/vedic/specializedAnalysisService.js`
    *   **Notes:** Life pattern analysis.

### Vedic Calendar & Timings Services (Target: `core/services/vedic/calendarTimingService.js`)

48. `get_panchang_analysis`
    *   **Source:** `src/services/astrology/panchang.js`, `src/services/astrology/vedic/calculators/PanchangCalculator.js`.
    *   **Target File:** `core/services/vedic/calendarTimingService.js`
    *   **Notes:** Main Panchang analysis.

49. `get_muhurta_analysis`
    *   **Source:** `src/services/astrology/muhurta.js`, `src/services/astrology/vedic/calculators/MuhurtaCalculator.js`.
    *   **Target File:** `core/services/vedic/calendarTimingService.js`
    *   **Notes:** Main Muhurta analysis.

50. `calculateAbhijitMuhurta`
    *   **Source:** `src/services/astrology/vedic/calculators/MuhurtaCalculator.js` (likely a function within).
    *   **Target File:** `core/services/vedic/calendarTimingService.js`
    *   **Notes:** Specific timing calculation.

51. `calculateRahukalam`
    *   **Source:** `src/services/astrology/vedic/calculators/MuhurtaCalculator.js` (likely a function within).
    *   **Target File:** `core/services/vedic/calendarTimingService.js`
    *   **Notes:** Specific timing calculation.

52. `calculateGulikakalam`
    *   **Source:** `src/services/astrology/vedic/calculators/MuhurtaCalculator.js` (likely a function within).
    *   **Target File:** `core/services/vedic/calendarTimingService.js`
    *   **Notes:** Specific timing calculation.

53. `calculateCosmicEvents`
    *   **Source:** `src/services/astrology/vedic/calculators/CosmicEventsCalculator.js`.
    *   **Target File:** `core/services/vedic/calendarTimingService.js`
    *   **Notes:** Cosmic events tracking.

54. `generateEphemerisTable`
    *   **Source:** Needs to be identified. Might be a utility or part of a calculator.
    *   **Target File:** `core/services/vedic/calendarTimingService.js`
    *   **Notes:** Ephemeris table generation.

55. `calculateUpcomingSeasonalEvents`
    *   **Source:** `src/services/astrology/vedic/calculators/CosmicEventsCalculator.js` (likely a function within).
    *   **Target File:** `core/services/vedic/calendarTimingService.js`
    *   **Notes:** Seasonal events calculation.

56. `calculateUpcomingPlanetaryEvents`
    *   **Source:** `src/services/astrology/vedic/calculators/CosmicEventsCalculator.js` (likely a function within).
    *   **Target File:** `core/services/vedic/calendarTimingService.js`
    *   **Notes:** Planetary events calculation.

### Remedies & Dosha Analysis Services (Target: `core/services/vedic/remediesDoshaService.js`)

57. `get_vedic_remedies_info`
    *   **Source:** `src/services/astrology/vedicRemedies.js`, `src/services/astrology/vedic/calculators/RemedialMeasuresCalculator.js`.
    *   **Target File:** `core/services/vedic/remediesDoshaService.js`
    *   **Notes:** Main Vedic Remedies.

58. `generateKaalSarpDosha`
    *   **Source:** `src/services/astrology/vedic/calculators/KaalSarpDoshaCalculator.js`.
    *   **Target File:** `core/services/vedic/remediesDoshaService.js`
    *   **Notes:** Kaal Sarp Dosha analysis.

59. `generateSadeSatiAnalysis`
    *   **Source:** `src/services/astrology/vedic/calculators/SadeSatiCalculator.js`.
    *   **Target File:** `core/services/vedic/remediesDoshaService.js`
    *   **Notes:** Sade Sati analysis.

## 2. Utility Functions Mapping (Target: `core/utils/`)

*   **`src/services/astrology/compatibility/CompatibilityChecker.js`**
    *   **Target File:** `core/utils/compatibilityUtils.js`
    *   **Notes:** Contains granular compatibility calculation logic.

*   **`src/services/astrology/compatibility/CompatibilityFormatter.js`**
    *   **Target File:** `core/utils/compatibilityUtils.js`
    *   **Notes:** Contains formatting logic for compatibility reports.

*   **`src/services/astrology/compatibility/CompatibilityScorer.js`**
    *   **Target File:** `core/utils/compatibilityUtils.js`
    *   **Notes:** Contains core scoring algorithms.

*   **`src/services/astrology/compatibility/RelationshipInsightsGenerator.js`**
    *   **Target File:** `core/utils/compatibilityUtils.js`
    *   **Notes:** Contains interpretation logic for relationship insights.

*   **`src/services/astrology/compatibility/SwissEphemerisCalculator.js`**
    *   **Target File:** `core/utils/ephemerisUtils.js`
    *   **Notes:** If it contains generic compatibility-related ephemeris calculations, otherwise integrate into relevant service.

*   **`src/services/astrology/compatibility/SynastryEngine.js`**
    *   **Target File:** `core/utils/compatibilityUtils.js`
    *   **Notes:** Contains core synastry algorithms.

*   **`src/services/astrology/nadi/NadiCompatibility.js`**
    *   **Target File:** `core/utils/compatibilityUtils.js`
    *   **Notes:** Specific Nadi compatibility calculations.

*   **`src/services/astrology/calculations/SignCalculations.js`**
    *   **Target File:** `core/utils/chartCalculations.js`
    *   **Notes:** Core sign-related calculations. Consolidate with `SignCalculator.js` if similar.

*   **`src/services/astrology/charts/AstrologicalCalculations.js`**
    *   **Target File:** `core/utils/chartCalculations.js`
    *   **Notes:** General astrological calculations.

*   **`src/services/astrology/charts/ChartGenerator.js`**
    *   **Target File:** `core/utils/chartCalculations.js`
    *   **Notes:** General chart generation logic.

*   **`src/services/astrology/charts/ChartInterpreter.js`**
    *   **Target File:** `core/utils/chartCalculations.js`
    *   **Notes:** General chart interpretation logic.

*   **`src/services/astrology/charts/SignCalculations.js`**
    *   **Target File:** `core/utils/chartCalculations.js`
    *   **Notes:** Duplicate of `src/services/astrology/calculations/SignCalculations.js`? Need to verify and consolidate.

*   **`src/services/astrology/charts/VedicChartGenerator.js`**
    *   **Target File:** `core/utils/chartCalculations.js`
    *   **Notes:** Vedic specific chart generation.

*   **`src/services/astrology/charts/WesternChartGenerator.js`**
    *   **Target File:** `core/utils/chartCalculations.js`
    *   **Notes:** Western specific chart generation.

*   **`src/services/astrology/core/VedicCore.js`**
    *   **Target File:** `core/utils/vedicUtils.js` (new file) or integrate into a main Vedic utility.
    *   **Notes:** Sounds like a core utility for Vedic calculations.

*   **`src/services/astrology/horoscope/HoroscopeGenerator.js`**
    *   **Target File:** `core/utils/horoscopeUtils.js` (new file) or integrate into a main horoscope service.
    *   **Notes:** General horoscope generation logic.

*   **`src/services/astrology/ageHarmonicAstrology.js`**
    *   **Target File:** `core/utils/astrologyCalculations.js` (new file).
    *   **Notes:** Calculation utility.

*   **`src/services/astrology/astrologyEngine.js`**
    *   **Target File:** `core/utils/astrologyEngine.js` (new file).
    *   **Notes:** Sounds like a core utility/engine.

*   **`src/services/astrology/geocoding/GeocodingService.js`**
    *   **Target File:** `core/utils/geocodingUtils.js` (new file).
    *   **Notes:** Geocoding utility.

*   **`src/services/astrology/vedic/calculators/SignCalculator.js`**
    *   **Target File:** `core/utils/chartCalculations.js`
    *   **Notes:** Sign-related calculations. Consolidate with `SignCalculations.js` if similar.

*   **`src/services/astrology/vedic/calculators/TransitCalculator.js`**
    *   **Target File:** `core/utils/transitCalculations.js` (new file).
    *   **Notes:** General transit calculations.

*   **`src/services/astrology/vedic/calculators/JaiminiCalculator.js`**
    *   **Target File:** `core/utils/jaiminiUtils.js` (new file).
    *   **Notes:** Jaimini specific calculations.
### Compatibility & Relationships Services

**Target Structure:** Each microservice gets its own dedicated service file for proper separation of concerns.

1.  `start_couple_compatibility_flow`
    *   **Source:** `src/services/astrology/CompatibilityAction.js`, `src/services/astrology/compatibility/CompatibilityWorkflowManager.js`
    *   **Target File:** `core/services/vedic/coupleCompatibilityService.js`
    *   **Notes:** Dedicated service for couple compatibility flows and orchestrations.

2.  `get_synastry_analysis`
    *   **Source:** `src/services/astrology/compatibility/SynastryEngine.js`, `src/services/astrology/compatibility/CompatibilityChecker.js`, `src/services/astrology/compatibility/CompatibilityScorer.js`, `src/services/astrology/compatibility/RelationshipInsightsGenerator.js`
    *   **Target File:** `core/services/vedic/synastryAnalysisService.js`
    *   **Notes:** Dedicated service for synastry analysis calculations.

3.  `start_family_astrology_flow`
    *   **Source:** Likely involves `generateGroupAstrology` (from `MICROSERVICES_LIST.md`) and `src/services/astrology/compatibility/CompatibilityWorkflowManager.js`.
    *   **Target File:** `core/services/vedic/familyAstrologyService.js`
    *   **Notes:** Dedicated service for family astrology flows.

4.  `start_business_partnership_flow`
    *   **Source:** Likely involves `generateGroupAstrology` and `src/services/astrology/compatibility/CompatibilityWorkflowManager.js`.
    *   **Target File:** `core/services/vedic/businessPartnershipService.js`
    *   **Notes:** Dedicated service for business partnership astrology.

5.  `start_group_timing_flow`
    *   **Source:** Needs further investigation. Potentially related to `src/services/astrology/mundane/` or `src/services/astrology/vedic/calculators/MuhurtaCalculator.js`.
    *   **Target File:** `core/services/vedic/groupTimingService.js`
    *   **Notes:** Dedicated service for group timing analysis.

6.  `calculateNakshatraPorutham`
    *   **Source:** Likely within `src/services/astrology/compatibility/CompatibilityChecker.js`, `src/services/astrology/compatibility/SynastryEngine.js`, or `src/services/astrology/nadi/NadiCompatibility.js`.
    *   **Target File:** `core/services/vedic/nakshatraPoruthamService.js`
    *   **Notes:** Dedicated service for Nakshatra compatibility calculations.

7.  `calculateCompatibilityScore`
    *   **Source:** `src/services/astrology/compatibility/CompatibilityScorer.js`.
    *   **Target File:** `core/services/vedic/compatibilityScoreService.js`
    *   **Notes:** Dedicated service for compatibility scoring algorithms.

8.  `performSynastryAnalysis`
    *   **Source:** `src/services/astrology/compatibility/SynastryEngine.js`.
    *   **Target File:** `core/services/vedic/synastryAnalysisService.js`
    *   **Notes:** Core synastry analysis functions.

9.  `calculateCompositeChart`
    *   **Source:** Needs to be identified. Potentially in `src/services/astrology/charts/ChartGenerator.js` or `src/services/astrology/compatibility/SynastryEngine.js`.
    *   **Target File:** `core/services/vedic/compositeChartService.js`
    *   **Notes:** Dedicated service for composite chart calculations.

10. `calculateDavisonChart`
    *   **Source:** Needs to be identified. Similar to `calculateCompositeChart`.
    *   **Target File:** `core/services/vedic/davisonChartService.js`
    *   **Notes:** Dedicated service for Davison chart calculations.

11. `generateGroupAstrology`
    *   **Source:** `src/services/astrology/vedic/calculators/GroupAstrologyCalculator.js`.
    *   **Target File:** `core/services/vedic/groupAstrologyService.js`
    *   **Notes:** Dedicated service for comprehensive group astrology analysis.

### Core Readings & Charts Services

**Target Structure:** Each chart type and calculation gets its own dedicated service file.

12. `get_hindu_astrology_analysis`
    *   **Source:** `src/services/astrology/charts/VedicChartGenerator.js`, `src/services/astrology/vedic/calculators/ChartGenerator.js`.
    *   **Target File:** `core/services/vedic/hinduAstrologyService.js`
    *   **Notes:** Dedicated service for Hindu astrology analysis.

13. `generateDetailedChartAnalysis`
    *   **Source:** `src/services/astrology/vedic/calculators/DetailedChartAnalysisCalculator.js`.
    *   **Target File:** `core/services/vedic/detailedChartAnalysisService.js`
    *   **Notes:** Dedicated service for detailed chart analysis.

14. `generateBasicBirthChart`
    *   **Source:** `src/services/astrology/charts/ChartGenerator.js`, `src/services/astrology/vedic/calculators/DetailedChartCalculator.js`.
    *   **Target File:** `core/services/vedic/basicBirthChartService.js`
    *   **Notes:** Dedicated service for basic birth chart generation.

15. `generateWesternBirthChart`
    *   **Source:** `src/services/astrology/charts/WesternChartGenerator.js`, `src/services/astrology/western/WesternCalculator.js`.
    *   **Target File:** `core/services/western/westernBirthChartService.js`
    *   **Notes:** Dedicated Western astrology service (separate from Vedic).

16. `calculateSunSign`
    *   **Source:** `src/services/astrology/calculations/SignCalculations.js`, `src/services/astrology/vedic/calculators/SignCalculator.js`.
    *   **Target File:** `core/services/vedic/sunSignService.js`
    *   **Notes:** Dedicated service for sun sign calculations.

17. `calculateMoonSign`
    *   **Source:** `src/services/astrology/calculations/SignCalculations.js`, `src/services/astrology/vedic/calculators/SignCalculator.js`.
    *   **Target File:** `core/services/vedic/moonSignService.js`
    *   **Notes:** Dedicated service for moon sign calculations.

18. `calculateRisingSign`
    *   **Source:** `src/services/astrology/calculations/SignCalculations.js`, `src/services/astrology/vedic/calculators/SignCalculator.js`.
    *   **Target File:** `core/services/vedic/risingSignService.js`
    *   **Notes:** Dedicated service for rising sign calculations.

19. `calculateNakshatra`
    *   **Source:** `src/services/astrology/calculations/SignCalculations.js`, `src/services/astrology/vedic/calculators/SignCalculator.js`.
    *   **Target File:** `core/services/vedic/nakshatraService.js`
    *   **Notes:** Dedicated service for Nakshatra calculations.

### Dasha & Predictive Systems Services

**Target Structure:** Each predictive system gets its own dedicated service file.

20. `get_vimshottari_dasha_analysis`
    *   **Source:** `src/services/astrology/vimshottariDasha.js`, `src/services/astrology/vedic/calculators/DashaAnalysisCalculator.js`.
    *   **Target File:** `core/services/vedic/vimshottariDashaService.js`
    *   **Notes:** Dedicated service for Vimshottari Dasha analysis.

21. `calculateCurrentDasha`
    *   **Source:** `src/services/astrology/vedic/calculators/DashaAnalysisCalculator.js`.
    *   **Target File:** `core/services/vedic/currentDashaService.js`
    *   **Notes:** Dedicated service for current Dasha calculations.

22. `calculateUpcomingDashas`
    *   **Source:** `src/services/astrology/vedic/calculators/DashaAnalysisCalculator.js`.
    *   **Target File:** `core/services/vedic/upcomingDashasService.js`
    *   **Notes:** Dedicated service for upcoming Dasha calculations.

23. `calculateAntardasha`
    *   **Source:** `src/services/astrology/vedic/calculators/DashaAnalysisCalculator.js`.
    *   **Target File:** `core/services/vedic/antardashaService.js`
    *   **Notes:** Dedicated service for Antardasha calculations.

24. `calculateJaiminiAstrology`
    *   **Source:** `src/services/astrology/jaiminiAstrology.js`, `src/services/astrology/vedic/calculators/JaiminiAstrologyCalculator.js`.
    *   **Target File:** `core/services/vedic/jaiminiAstrologyService.js`
    *   **Notes:** Dedicated service for Jaimini astrology.

25. `calculateJaiminiDashas`
    *   **Source:** `src/services/astrology/vedic/calculators/JaiminiAstrologyCalculator.js`, `src/services/astrology/calculators/JaiminiKarakaCalculator.js`.
    *   **Target File:** `core/services/vedic/jaiminiDashasService.js`
    *   **Notes:** Dedicated service for Jaimini Dasha calculations.

26. `calculateGochar`
    *   **Source:** `src/services/astrology/vedic/calculators/GocharCalculator.js`.
    *   **Target File:** `core/services/vedic/gocharService.js`
    *   **Notes:** Dedicated service for Gochar (transit) analysis.

27. `calculateSolarReturn`
    *   **Source:** `src/services/astrology/vedic/calculators/SolarReturnCalculator.js`.
    *   **Target File:** `core/services/vedic/solarReturnService.js`
    *   **Notes:** Dedicated service for solar return calculations.

28. `calculateLunarReturn`
    *   **Source:** `src/services/astrology/vedic/calculators/LunarReturnCalculator.js`.
    *   **Target File:** `core/services/vedic/lunarReturnService.js`
    *   **Notes:** Dedicated service for lunar return calculations.

29. `calculateVarshaphal`
    *   **Source:** `src/services/astrology/vedic/calculators/VarshaphalCalculator.js`.
    *   **Target File:** `core/services/vedic/varshaphalService.js`
    *   **Notes:** Dedicated service for Varshaphal calculations.

30. `calculateSecondaryProgressions`
    *   **Source:** `src/services/astrology/vedic/calculators/SecondaryProgressionsCalculator.js`.
    *   **Target File:** `core/services/vedic/secondaryProgressionsService.js`
    *   **Notes:** Dedicated service for secondary progressions.

31. `calculateSolarArcDirections`
    *   **Source:** `src/services/astrology/vedic/calculators/SolarArcDirectionsCalculator.js`.
    *   **Target File:** `core/services/vedic/solarArcDirectionsService.js`
    *   **Notes:** Dedicated service for solar arc directions.

32. `calculateEnhancedSecondaryProgressions`
    *   **Source:** `src/services/astrology/vedic/calculators/SecondaryProgressionsCalculator.js` (likely an enhanced version within).
    *   **Target File:** `core/services/vedic/enhancedSecondaryProgressionsService.js`
    *   **Notes:** Dedicated service for enhanced secondary progressions.

33. `calculateEnhancedSolarArcDirections`
    *   **Source:** `src/services/astrology/vedic/calculators/SolarArcDirectionsCalculator.js` (likely an enhanced version within).
    *   **Target File:** `core/services/vedic/enhancedSolarArcDirectionsService.js`
    *   **Notes:** Dedicated service for enhanced solar arc directions.

34. `calculateNextSignificantTransits`
    *   **Source:** `src/services/astrology/vedic/calculators/SignificantTransitsCalculator.js`.
    *   **Target File:** `core/services/vedic/significantTransitsService.js`
    *   **Notes:** Dedicated service for significant transits.

35. `calculateAdvancedTransits`
    *   **Source:** `src/services/astrology/vedic/calculators/TransitCalculator.js`, `src/services/astrology/vedic/calculators/GocharCalculator.js`.
    *   **Target File:** `core/services/vedic/advancedTransitsService.js`
    *   **Notes:** Dedicated service for advanced transit calculations.

36. `identifyMajorTransits`
    *   **Source:** `src/services/astrology/vedic/calculators/SignificantTransitsCalculator.js`.
    *   **Target File:** `core/services/vedic/majorTransitsService.js`
    *   **Notes:** Dedicated service for identifying major transits.

37. `generateTransitPreview`
    *   **Source:** `src/services/astrology/vedic/calculators/TransitCalculator.js`, `src/services/astrology/vedic/calculators/GocharCalculator.js`.
    *   **Target File:** `core/services/vedic/transitPreviewService.js`
    *   **Notes:** Dedicated service for transit preview generation.

### Specialized Analysis & Reports Services

**Target Structure:** Each specialized analysis type gets its own dedicated service file.

38. `get_ashtakavarga_analysis`
    *   **Source:** `src/services/astrology/ashtakavarga.js`, `src/services/astrology/vedic/calculators/AshtakavargaCalculator.js`, `src/services/astrology/calculators/AshtakavargaCalculator.js`. Prioritize the most comprehensive one.
    *   **Target File:** `core/services/vedic/ashtakavargaService.js`
    *   **Notes:** Dedicated service for Ashtakavarga analysis.

39. `generateShadbala`
    *   **Source:** `src/services/astrology/vedic/calculators/ShadbalaCalculator.js`.
    *   **Target File:** `core/services/vedic/shadbalaService.js`
    *   **Notes:** Dedicated service for Shadbala calculations.

40. `get_varga_charts_analysis`
    *   **Source:** `src/services/astrology/vargaCharts.js`, `src/services/astrology/vedic/calculators/VargaChartCalculator.js`.
    *   **Target File:** `core/services/vedic/vargaChartsService.js`
    *   **Notes:** Dedicated service for Varga Charts analysis.

41. `get_prashna_astrology_analysis`
    *   **Source:** `src/services/astrology/prashnaAstrology.js`, `src/services/astrology/vedic/calculators/PrashnaCalculator.js`.
    *   **Target File:** `core/services/vedic/prashnaAstrologyService.js`
    *   **Notes:** Dedicated service for Prashna Astrology analysis.

42. `calculateVedicYogas`
    *   **Source:** `src/services/astrology/vedic/calculators/VedicYogasCalculator.js`.
    *   **Target File:** `core/services/vedic/vedicYogasService.js`
    *   **Notes:** Dedicated service for Vedic Yogas calculations.

43. `calculateAsteroids`
    *   **Source:** `src/services/astrology/vedic/calculators/AsteroidCalculator.js`.
    *   **Target File:** `core/services/vedic/asteroidsService.js`
    *   **Notes:** Dedicated service for asteroid calculations.

44. `generateComprehensiveVedicAnalysis`
    *   **Source:** `src/services/astrology/vedic/calculators/ComprehensiveAnalysisCalculator.js`.
    *   **Target File:** `core/services/vedic/comprehensiveVedicAnalysisService.js`
    *   **Notes:** Dedicated service for comprehensive Vedic analysis.

45. `generateFutureSelfSimulator`
    *   **Source:** `src/services/astrology/vedic/calculators/FutureSelfSimulatorCalculator.js`.
    *   **Target File:** `core/services/vedic/futureSelfSimulatorService.js`
    *   **Notes:** Dedicated service for future self simulation.

46. `get_ayurvedic_astrology_analysis`
    *   **Source:** `src/services/astrology/ayurvedicAstrology.js`.
    *   **Target File:** `core/services/vedic/ayurvedicAstrologyService.js`
    *   **Notes:** Dedicated service for Ayurvedic astrology analysis.

47. `generateLifePatterns`
    *   **Source:** Needs to be identified. Might be a general utility or part of a comprehensive analysis.
    *   **Target File:** `core/services/vedic/lifePatternsService.js`
    *   **Notes:** Dedicated service for life pattern analysis.

### Vedic Calendar & Timings Services

**Target Structure:** Each calendar and timing service gets its own dedicated file.

48. `get_panchang_analysis`
    *   **Source:** `src/services/astrology/panchang.js`, `src/services/astrology/vedic/calculators/PanchangCalculator.js`.
    *   **Target File:** `core/services/vedic/panchangService.js`
    *   **Notes:** Dedicated service for Panchang analysis.

49. `get_muhurta_analysis`
    *   **Source:** `src/services/astrology/muhurta.js`, `src/services/astrology/vedic/calculators/MuhurtaCalculator.js`.
    *   **Target File:** `core/services/vedic/muhurtaService.js`
    *   **Notes:** Dedicated service for Muhurta analysis.

50. `calculateAbhijitMuhurta`
    *   **Source:** `src/services/astrology/vedic/calculators/MuhurtaCalculator.js` (likely a function within).
    *   **Target File:** `core/services/vedic/abhijitMuhurtaService.js`
    *   **Notes:** Dedicated service for Abhijit Muhurta calculations.

51. `calculateRahukalam`
    *   **Source:** `src/services/astrology/vedic/calculators/MuhurtaCalculator.js` (likely a function within).
    *   **Target File:** `core/services/vedic/rahukalamService.js`
    *   **Notes:** Dedicated service for Rahukalam calculations.

52. `calculateGulikakalam`
    *   **Source:** `src/services/astrology/vedic/calculators/MuhurtaCalculator.js` (likely a function within).
    *   **Target File:** `core/services/vedic/gulikakalamService.js`
    *   **Notes:** Dedicated service for Gulikakalam calculations.

53. `calculateCosmicEvents`
    *   **Source:** `src/services/astrology/vedic/calculators/CosmicEventsCalculator.js`.
    *   **Target File:** `core/services/vedic/cosmicEventsService.js`
    *   **Notes:** Dedicated service for cosmic events tracking.

54. `generateEphemerisTable`
    *   **Source:** Needs to be identified. Might be a utility or part of a calculator.
    *   **Target File:** `core/services/vedic/ephemerisService.js`
    *   **Notes:** Dedicated service for ephemeris table generation.

55. `calculateUpcomingSeasonalEvents`
    *   **Source:** `src/services/astrology/vedic/calculators/CosmicEventsCalculator.js` (likely a function within).
    *   **Target File:** `core/services/vedic/seasonalEventsService.js`
    *   **Notes:** Dedicated service for seasonal events calculations.

56. `calculateUpcomingPlanetaryEvents`
    *   **Source:** `src/services/astrology/vedic/calculators/CosmicEventsCalculator.js` (likely a function within).
    *   **Target File:** `core/services/vedic/planetaryEventsService.js`
    *   **Notes:** Dedicated service for planetary events calculations.

### Remedies & Dosha Analysis Services

**Target Structure:** Each remedy and dosha analysis gets its own dedicated service file.

57. `get_vedic_remedies_info`
    *   **Source:** `src/services/astrology/vedicRemedies.js`, `src/services/astrology/vedic/calculators/RemedialMeasuresCalculator.js`.
    *   **Target File:** `core/services/vedic/vedicRemediesService.js`
    *   **Notes:** Dedicated service for Vedic remedies information.

58. `generateKaalSarpDosha`
    *   **Source:** `src/services/astrology/vedic/calculators/KaalSarpDoshaCalculator.js`.
    *   **Target File:** `core/services/vedic/kaalSarpDoshaService.js`
    *   **Notes:** Dedicated service for Kaal Sarp Dosha analysis.

59. `generateSadeSatiAnalysis`
    *   **Source:** `src/services/astrology/vedic/calculators/SadeSatiCalculator.js`.
    *   **Target File:** `core/services/vedic/sadeSatiService.js`
    *   **Notes:** Dedicated service for Sade Sati analysis.

## 2. Utility Functions Mapping (Target: `core/utils/`)

**IMPORTANT:** Each utility function group must be implemented as an independent utility file with clear separation of concerns. No single file should contain multiple unrelated utility functions.

*   **`src/services/astrology/compatibility/CompatibilityChecker.js`**
    *   **Target File:** `core/utils/compatibilityCheckerUtils.js`
    *   **Notes:** Dedicated utility for compatibility checking logic.

*   **`src/services/astrology/compatibility/CompatibilityFormatter.js`**
    *   **Target File:** `core/utils/compatibilityFormatterUtils.js`
    *   **Notes:** Dedicated utility for compatibility report formatting.

*   **`src/services/astrology/compatibility/CompatibilityScorer.js`**
    *   **Target File:** `core/utils/compatibilityScorerUtils.js`
    *   **Notes:** Dedicated utility for compatibility scoring algorithms.

*   **`src/services/astrology/compatibility/RelationshipInsightsGenerator.js`**
    *   **Target File:** `core/utils/relationshipInsightsUtils.js`
    *   **Notes:** Dedicated utility for relationship insights interpretation.

*   **`src/services/astrology/compatibility/SwissEphemerisCalculator.js`**
    *   **Target File:** `core/utils/swissEphemerisUtils.js`
    *   **Notes:** Dedicated utility for Swiss Ephemeris calculations.

*   **`src/services/astrology/compatibility/SynastryEngine.js`**
    *   **Target File:** `core/utils/synastryEngineUtils.js`
    *   **Notes:** Dedicated utility for synastry algorithms.

*   **`src/services/astrology/nadi/NadiCompatibility.js`**
    *   **Target File:** `core/utils/nadiCompatibilityUtils.js`
    *   **Notes:** Dedicated utility for Nadi compatibility calculations.

*   **`src/services/astrology/calculations/SignCalculations.js`**
    *   **Target File:** `core/utils/signCalculationsUtils.js`
    *   **Notes:** Dedicated utility for sign-related calculations.

*   **`src/services/astrology/charts/AstrologicalCalculations.js`**
    *   **Target File:** `core/utils/astrologicalCalculationsUtils.js`
    *   **Notes:** Dedicated utility for general astrological calculations.

*   **`src/services/astrology/charts/ChartGenerator.js`**
    *   **Target File:** `core/utils/chartGeneratorUtils.js`
    *   **Notes:** Dedicated utility for general chart generation logic.

*   **`src/services/astrology/charts/ChartInterpreter.js`**
    *   **Target File:** `core/utils/chartInterpreterUtils.js`
    *   **Notes:** Dedicated utility for general chart interpretation logic.

*   **`src/services/astrology/charts/SignCalculations.js`**
    *   **Target File:** `core/utils/chartSignCalculationsUtils.js`
    *   **Notes:** Dedicated utility for chart-specific sign calculations.

*   **`src/services/astrology/charts/VedicChartGenerator.js`**
    *   **Target File:** `core/utils/vedicChartGeneratorUtils.js`
    *   **Notes:** Dedicated utility for Vedic chart generation.

*   **`src/services/astrology/charts/WesternChartGenerator.js`**
    *   **Target File:** `core/utils/westernChartGeneratorUtils.js`
    *   **Notes:** Dedicated utility for Western chart generation.

*   **`src/services/astrology/core/VedicCore.js`**
    *   **Target File:** `core/utils/vedicCoreUtils.js`
    *   **Notes:** Dedicated utility for core Vedic calculations.

*   **`src/services/astrology/horoscope/HoroscopeGenerator.js`**
    *   **Target File:** `core/utils/horoscopeGeneratorUtils.js`
    *   **Notes:** Dedicated utility for horoscope generation logic.

*   **`src/services/astrology/ageHarmonicAstrology.js`**
    *   **Target File:** `core/utils/ageHarmonicAstrologyUtils.js`
    *   **Notes:** Dedicated utility for age harmonic astrology calculations.

*   **`src/services/astrology/astrologyEngine.js`**
    *   **Target File:** `core/utils/astrologyEngineUtils.js`
    *   **Notes:** Dedicated utility for astrology engine functions.

*   **`src/services/astrology/geocoding/GeocodingService.js`**
    *   **Target File:** `core/utils/geocodingUtils.js`
    *   **Notes:** Dedicated utility for geocoding functions.

*   **`src/services/astrology/vedic/calculators/SignCalculator.js`**
    *   **Target File:** `core/utils/vedicSignCalculatorUtils.js`
    *   **Notes:** Dedicated utility for Vedic sign calculations.

*   **`src/services/astrology/vedic/calculators/TransitCalculator.js`**
    *   **Target File:** `core/utils/transitCalculatorUtils.js`
    *   **Notes:** Dedicated utility for transit calculations.

*   **`src/services/astrology/vedic/calculators/JaiminiCalculator.js`**
    *   **Target File:** `core/utils/jaiminiCalculatorUtils.js`
    *   **Notes:** Dedicated utility for Jaimini calculations.
## 3. Western Astrology Services

**Target Structure:** Western astrology services get their own dedicated directory and files.

60. `get_current_transits`
    *   **Source:** `src/services/astrology/vedic/calculators/TransitCalculator.js`, `src/services/astrology/vedic/calculators/GocharCalculator.js`.
    *   **Target File:** `core/services/western/currentTransitsService.js`
    *   **Notes:** Dedicated service for current planetary transits.

61. `get_secondary_progressions`
    *   **Source:** `src/services/astrology/vedic/calculators/SecondaryProgressionsCalculator.js`.
    *   **Target File:** `core/services/western/secondaryProgressionsService.js`
    *   **Notes:** Dedicated service for secondary progressions.

62. `get_solar_arc_directions`
    *   **Source:** `src/services/astrology/vedic/calculators/SolarArcDirectionsCalculator.js`.
    *   **Target File:** `core/services/western/solarArcDirectionsService.js`
    *   **Notes:** Dedicated service for solar arc directions.

63. `get_asteroid_analysis`
    *   **Source:** `src/services/astrology/vedic/calculators/AsteroidCalculator.js`.
    *   **Target File:** `core/services/western/asteroidAnalysisService.js`
    *   **Notes:** Dedicated service for asteroid analysis.

64. `get_fixed_stars_analysis`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/western/fixedStarsService.js`
    *   **Notes:** Dedicated service for fixed stars analysis.

65. `get_solar_return_analysis`
    *   **Source:** `src/services/astrology/vedic/calculators/SolarReturnCalculator.js`.
    *   **Target File:** `core/services/western/solarReturnService.js`
    *   **Notes:** Dedicated service for solar return analysis.

66. `get_career_astrology_analysis`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/western/careerAstrologyService.js`
    *   **Notes:** Dedicated service for career astrology analysis.

67. `get_financial_astrology_analysis`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/western/financialAstrologyService.js`
    *   **Notes:** Dedicated service for financial astrology analysis.

68. `get_medical_astrology_analysis`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/western/medicalAstrologyService.js`
    *   **Notes:** Dedicated service for medical astrology analysis.

69. `get_event_astrology_analysis`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/western/eventAstrologyService.js`
    *   **Notes:** Dedicated service for event astrology analysis.

70. `get_astrocartography_analysis`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/western/astrocartographyService.js`
    *   **Notes:** Dedicated service for astrocartography analysis.

## 4. Divination & Alternative Systems Services

**Target Structure:** Each divination system gets its own dedicated service file.

71. `get_tarot_reading`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/divination/tarotReadingService.js`
    *   **Notes:** Dedicated service for tarot readings.

72. `get_iching_reading`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/divination/ichingReadingService.js`
    *   **Notes:** Dedicated service for I Ching readings.

73. `get_palmistry_analysis`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/divination/palmistryService.js`
    *   **Notes:** Dedicated service for palmistry analysis.

74. `show_chinese_flow`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/divination/chineseAstrologyService.js`
    *   **Notes:** Dedicated service for Chinese astrology.

75. `get_mayan_analysis`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/divination/mayanAstrologyService.js`
    *   **Notes:** Dedicated service for Mayan astrology analysis.

76. `get_celtic_analysis`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/divination/celticAstrologyService.js`
    *   **Notes:** Dedicated service for Celtic astrology analysis.

77. `get_kabbalistic_analysis`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/divination/kabbalisticAstrologyService.js`
    *   **Notes:** Dedicated service for Kabbalistic astrology analysis.

78. `get_hellenistic_astrology_analysis`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/divination/hellenisticAstrologyService.js`
    *   **Notes:** Dedicated service for Hellenistic astrology analysis.

79. `get_islamic_astrology_info`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/divination/islamicAstrologyService.js`
    *   **Notes:** Dedicated service for Islamic astrology information.

80. `get_horary_reading`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/divination/horaryAstrologyService.js`
    *   **Notes:** Dedicated service for horary astrology readings.

81. `get_numerology_analysis`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/divination/numerologyAnalysisService.js`
    *   **Notes:** Dedicated service for numerology analysis.

82. `get_numerology_report`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/divination/numerologyReportService.js`
    *   **Notes:** Dedicated service for numerology reports.

83. `get_lunar_return`
    *   **Source:** `src/services/astrology/vedic/calculators/LunarReturnCalculator.js`.
    *   **Target File:** `core/services/divination/lunarReturnService.js`
    *   **Notes:** Dedicated service for lunar return calculations.

84. `get_future_self_analysis`
    *   **Source:** `src/services/astrology/vedic/calculators/FutureSelfSimulatorCalculator.js`.
    *   **Target File:** `core/services/divination/futureSelfAnalysisService.js`
    *   **Notes:** Dedicated service for future self analysis.

85. `get_electional_astrology`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/divination/electionalAstrologyService.js`
    *   **Notes:** Dedicated service for electional astrology.

86. `get_mundane_astrology_analysis`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/divination/mundaneAstrologyService.js`
    *   **Notes:** Dedicated service for mundane astrology analysis.

87. `get_daily_horoscope`
    *   **Source:** `src/services/astrology/vedic/calculators/DailyHoroscopeCalculator.js`.
    *   **Target File:** `core/services/divination/dailyHoroscopeService.js`
    *   **Notes:** Dedicated service for daily horoscope generation.

88. `show_nadi_flow`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/divination/nadiAstrologyService.js`
    *   **Notes:** Dedicated service for Nadi astrology flow.

89. `get_hindu_festivals_info`
    *   **Source:** Needs to be identified.
    *   **Target File:** `core/services/divination/hinduFestivalsService.js`
    *   **Notes:** Dedicated service for Hindu festivals information.

## 5. Migration Implementation Strategy

### Phase 1: Core Vedic Services (Priority 1)
**Focus:** Essential Vedic astrology services that are actively used.

1. **birthChartService.js** - Core birth chart generation
2. **compatibilityService.js** - Relationship compatibility analysis
3. **dashaPredictiveService.js** - Dasha and predictive systems
4. **calendarTimingService.js** - Panchang and timing calculations
5. **remediesDoshaService.js** - Remedies and dosha analysis

### Phase 2: Extended Vedic Services (Priority 2)
**Focus:** Advanced Vedic analysis services.

6. **ashtakavargaService.js** - Ashtakavarga analysis
7. **shadbalaService.js** - Shadbala calculations
8. **vargaChartsService.js** - Varga chart analysis
9. **vedicYogasService.js** - Vedic yogas analysis
10. **comprehensiveVedicAnalysisService.js** - Full Vedic analysis

### Phase 3: Western Astrology Services (Priority 3)
**Focus:** Western astrology implementations.

11. **westernBirthChartService.js** - Western birth charts
12. **currentTransitsService.js** - Current planetary transits
13. **secondaryProgressionsService.js** - Secondary progressions
14. **solarArcDirectionsService.js** - Solar arc directions
15. **solarReturnService.js** - Solar return analysis

### Phase 4: Divination Services (Priority 4)
**Focus:** Alternative divination systems.

16. **tarotReadingService.js** - Tarot card readings
17. **ichingReadingService.js** - I Ching consultations
18. **numerologyAnalysisService.js** - Numerology analysis
19. **dailyHoroscopeService.js** - Daily horoscope generation
20. **palmistryService.js** - Palmistry analysis

### Phase 5: Utility Functions Migration (Priority 5)
**Focus:** Extract and migrate utility functions to dedicated files.

21-60. **Individual utility files** - Each utility function gets its own dedicated file

### Implementation Guidelines:
- **Copy-first approach:** Copy code from VedicCalculator and existing files, then refactor
- **Independent services:** Each service file contains only one microservice
- **Clear separation:** No cross-contamination between different astrology systems
- **Test after each:** Validate functionality before moving to next service
- **Gradual migration:** Update action classes to use new services incrementally

## 2. Utility Functions Mapping (Target: `core/utils/`)

*   **`src/services/astrology/compatibility/CompatibilityChecker.js`**
    *   **Target File:** `core/utils/compatibilityUtils.js`
    *   **Notes:** Contains granular compatibility calculation logic.

*   **`src/services/astrology/compatibility/CompatibilityFormatter.js`**
    *   **Target File:** `core/utils/compatibilityUtils.js`
    *   **Notes:** Contains formatting logic for compatibility reports.

*   **`src/services/astrology/compatibility/CompatibilityScorer.js`**
    *   **Target File:** `core/utils/compatibilityUtils.js`
    *   **Notes:** Contains core scoring algorithms.

*   **`src/services/astrology/compatibility/RelationshipInsightsGenerator.js`**
    *   **Target File:** `core/utils/compatibilityUtils.js`
    *   **Notes:** Contains interpretation logic for relationship insights.

*   **`src/services/astrology/compatibility/SwissEphemerisCalculator.js`**
    *   **Target File:** `core/utils/ephemerisUtils.js`
    *   **Notes:** If it contains generic compatibility-related ephemeris calculations, otherwise integrate into relevant service.

*   **`src/services/astrology/compatibility/SynastryEngine.js`**
    *   **Target File:** `core/utils/compatibilityUtils.js`
    *   **Notes:** Contains core synastry algorithms.

*   **`src/services/astrology/nadi/NadiCompatibility.js`**
    *   **Target File:** `core/utils/compatibilityUtils.js`
    *   **Notes:** Specific Nadi compatibility calculations.

*   **`src/services/astrology/calculations/SignCalculations.js`**
    *   **Target File:** `core/utils/chartCalculations.js`
    *   **Notes:** Core sign-related calculations. Consolidate with `SignCalculator.js` if similar.

*   **`src/services/astrology/charts/AstrologicalCalculations.js`**
    *   **Target File:** `core/utils/chartCalculations.js`
    *   **Notes:** General astrological calculations.

*   **`src/services/astrology/charts/ChartGenerator.js`**
    *   **Target File:** `core/utils/chartCalculations.js`
    *   **Notes:** General chart generation logic.

*   **`src/services/astrology/charts/ChartInterpreter.js`**
    *   **Target File:** `core/utils/chartCalculations.js`
    *   **Notes:** General chart interpretation logic.

*   **`src/services/astrology/charts/SignCalculations.js`**
    *   **Target File:** `core/utils/chartCalculations.js`
    *   **Notes:** Duplicate of `src/services/astrology/calculations/SignCalculations.js`? Need to verify and consolidate.

*   **`src/services/astrology/charts/VedicChartGenerator.js`**
    *   **Target File:** `core/utils/chartCalculations.js`
    *   **Notes:** Vedic specific chart generation.

*   **`src/services/astrology/charts/WesternChartGenerator.js`**
    *   **Target File:** `core/utils/chartCalculations.js`
    *   **Notes:** Western specific chart generation.

*   **`src/services/astrology/core/VedicCore.js`**
    *   **Target File:** `core/utils/vedicUtils.js` (new file) or integrate into a main Vedic utility.
    *   **Notes:** Sounds like a core utility for Vedic calculations.

*   **`src/services/astrology/horoscope/HoroscopeGenerator.js`**
    *   **Target File:** `core/utils/horoscopeUtils.js` (new file) or integrate into a main horoscope service.
    *   **Notes:** General horoscope generation logic.

*   **`src/services/astrology/ageHarmonicAstrology.js`**
    *   **Target File:** `core/utils/astrologyCalculations.js` (new file).
    *   **Notes:** Calculation utility.

*   **`src/services/astrology/astrologyEngine.js`**
    *   **Target File:** `core/utils/astrologyEngine.js` (new file).
    *   **Notes:** Sounds like a core utility/engine.

*   **`src/services/astrology/geocoding/GeocodingService.js`**
    *   **Target File:** `core/utils/geocodingUtils.js` (new file).
    *   **Notes:** Geocoding utility.

*   **`src/services/astrology/vedic/calculators/SignCalculator.js`**
    *   **Target File:** `core/utils/chartCalculations.js`
    *   **Notes:** Sign-related calculations. Consolidate with `SignCalculations.js` if similar.

*   **`src/services/astrology/vedic/calculators/TransitCalculator.js`**
    *   **Target File:** `core/utils/transitCalculations.js` (new file).
    *   **Notes:** General transit calculations.

*   **`src/services/astrology/vedic/calculators/JaiminiCalculator.js`**
    *   **Target File:** `core/utils/jaiminiUtils.js` (new file).
    *   **Notes:** Jaimini specific calculations.
### Compatibility & Relationships Services (Target: `core/services/vedic/compatibilityService.js`)

1.  `start_couple_compatibility_flow`
    *   **Source:** `src/services/astrology/CompatibilityAction.js`, `src/services/astrology/compatibility/CompatibilityWorkflowManager.js`
    *   **Target File:** `core/services/vedic/compatibilityService.js`
    *   **Notes:** This is a high-level flow orchestrator. The core logic will be extracted and exposed as a function in the new service.

2.  `get_synastry_analysis`
    *   **Source:** `src/services/astrology/compatibility/SynastryEngine.js`, `src/services/astrology/compatibility/CompatibilityChecker.js`, `src/services/astrology/compatibility/CompatibilityScorer.js`, `src/services/astrology/compatibility/RelationshipInsightsGenerator.js`
    *   **Target File:** `core/services/vedic/compatibilityService.js`
    *   **Notes:** This will be a comprehensive function in the new service, utilizing multiple internal compatibility utilities.

3.  `start_family_astrology_flow`
    *   **Source:** Likely involves `generateGroupAstrology` (from `MICROSERVICES_LIST.md`) and `src/services/astrology/compatibility/CompatibilityWorkflowManager.js`.
    *   **Target File:** `core/services/vedic/compatibilityService.js`
    *   **Notes:** High-level flow.

4.  `start_business_partnership_flow`
    *   **Source:** Likely involves `generateGroupAstrology` and `src/services/astrology/compatibility/CompatibilityWorkflowManager.js`.
    *   **Target File:** `core/services/vedic/compatibilityService.js`
    *   **Notes:** High-level flow.

5.  `start_group_timing_flow`
    *   **Source:** Needs further investigation. Potentially related to `src/services/astrology/mundane/` or `src/services/astrology/vedic/calculators/MuhurtaCalculator.js`.
    *   **Target File:** `core/services/vedic/calendarTimingService.js` (or `common/timingService.js` if general).
    *   **Notes:** This is a flow, not a direct calculation.

6.  `calculateNakshatraPorutham`
    *   **Source:** Likely within `src/services/astrology/compatibility/CompatibilityChecker.js`, `src/services/astrology/compatibility/SynastryEngine.js`, or `src/services/astrology/nadi/NadiCompatibility.js`.
    *   **Target File:** `core/services/vedic/compatibilityService.js`
    *   **Notes:** Specific compatibility calculation.

7.  `calculateCompatibilityScore`
    *   **Source:** `src/services/astrology/compatibility/CompatibilityScorer.js`.
    *   **Target File:** `core/services/vedic/compatibilityService.js`
    *   **Notes:** Core scoring function.

8.  `performSynastryAnalysis`
    *   **Source:** `src/services/astrology/compatibility/SynastryEngine.js`.
    *   **Target File:** `core/services/vedic/compatibilityService.js`
    *   **Notes:** Core analysis function.

9.  `calculateCompositeChart`
    *   **Source:** Needs to be identified. Potentially in `src/services/astrology/charts/ChartGenerator.js` or `src/services/astrology/compatibility/SynastryEngine.js`.
    *   **Target File:** `core/services/vedic/compatibilityService.js`
    *   **Notes:** Chart generation function.

10. `calculateDavisonChart`
    *   **Source:** Needs to be identified. Similar to `calculateCompositeChart`.
    *   **Target File:** `core/services/vedic/compatibilityService.js`
    *   **Notes:** Chart generation function.

11. `generateGroupAstrology`
    *   **Source:** `src/services/astrology/vedic/calculators/GroupAstrologyCalculator.js`.
    *   **Target File:** `core/services/vedic/compatibilityService.js`
    *   **Notes:** Comprehensive group analysis.

## 2. Utility Functions Mapping (Target: `core/utils/`)

*   **`src/services/astrology/compatibility/CompatibilityChecker.js`**
    *   **Target File:** `core/utils/compatibilityUtils.js`
    *   **Notes:** Contains granular compatibility calculation logic.

*   **`src/services/astrology/compatibility/CompatibilityFormatter.js`**
    *   **Target File:** `core/utils/compatibilityUtils.js`
    *   **Notes:** Contains formatting logic for compatibility reports.

*   **`src/services/astrology/compatibility/CompatibilityScorer.js`**
    *   **Target File:** `core/utils/compatibilityUtils.js`
    *   **Notes:** Contains core scoring algorithms.

*   **`src/services/astrology/compatibility/RelationshipInsightsGenerator.js`**
    *   **Target File:** `core/utils/compatibilityUtils.js`
    *   **Notes:** Contains interpretation logic for relationship insights.

*   **`src/services/astrology/compatibility/SwissEphemerisCalculator.js`**
    *   **Target File:** `core/utils/ephemerisUtils.js`
    *   **Notes:** If it contains generic compatibility-related ephemeris calculations, otherwise integrate into relevant service.

*   **`src/services/astrology/compatibility/SynastryEngine.js`**
    *   **Target File:** `core/utils/compatibilityUtils.js`
    *   **Notes:** Contains core synastry algorithms.

*   **`src/services/astrology/nadi/NadiCompatibility.js`**
    *   **Target File:** `core/utils/compatibilityUtils.js`
    *   **Notes:** Specific Nadi compatibility calculations.
