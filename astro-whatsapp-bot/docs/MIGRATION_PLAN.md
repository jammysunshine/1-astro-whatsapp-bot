# Astro WhatsApp Bot - Code Migration Plan

This document outlines the detailed plan for migrating existing astrological service implementations and utility functions into the new architectural structure (`src/core/`, `src/interfaces/`, `src/adapters/`). The goal is to map each of the 90 identified microservices and shared helpers to their new locations, prioritizing comprehensive implementations that leverage Swiss Ephemeris, `sweph`, and `astrologer` libraries.

**Refactoring Guideline Reminder:** This migration will strictly follow the "copy-first, deprecate-later" approach. Files will be copied, not moved, and original files will only be deprecated once the new, refactored service is fully functional and integrated.

## 1. Microservices Mapping (from MICROSERVICES_LIST.md)

Each entry below represents a microservice. We will identify its source in the existing codebase and its target file in the new `src/core/services/` structure.

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
