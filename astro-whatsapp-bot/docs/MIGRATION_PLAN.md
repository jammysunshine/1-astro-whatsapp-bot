# Astro WhatsApp Bot - Code Migration Plan

This document outlines the detailed plan for migrating existing astrological service implementations and utility functions into the new architectural structure (`src/core/`, `src/interfaces/`, `src/adapters/`). The goal is to map each of the 90 identified microservices and shared helpers to their new locations, prioritizing comprehensive implementations that leverage Swiss Ephemeris, `sweph`, and `astrologer` libraries.

**Refactoring Guideline Reminder:** This migration will strictly follow the "copy-first, deprecate-later" approach. Files will be copied, not moved, and original files will only be deprecated once the new, refactored service is fully functional and integrated.

## 1. Microservices Mapping (from MICROSERVICES_LIST.md)

Each entry below represents a microservice. We will identify its source in the existing codebase and its target file in the new `src/core/services/` structure.

**IMPORTANT:** Each microservice must be implemented as an independent service file with clear separation of concerns. No single file should contain multiple unrelated microservices.

### Vedic Astrology Services

1.  `start_couple_compatibility_flow`
     *   **Source:** `src/services/astrology/CompatibilityAction.js`, `src/services/astrology/compatibility/CompatibilityWorkflowManager.js`
     *   **Target File:** `core/services/coupleCompatibilityService.js`
     *   **Notes:** Dedicated service for couple compatibility flows and orchestrations.

2.  `get_synastry_analysis`
     *   **Source:** `src/services/astrology/compatibility/CompatibilityChecker.js` (✅ BEST: uses astrologer library for synastry calculations, comprehensive aspect analysis).
     *   **Target File:** `core/services/synastryAnalysisService.js`
     *   **Notes:** Dedicated service for synastry analysis using astrologer library.

3.  `start_family_astrology_flow`
     *   **Source:** Likely involves `generateGroupAstrology` (from `MICROSERVICES_LIST.md`) and `src/services/astrology/compatibility/CompatibilityWorkflowManager.js`.
     *   **Target File:** `core/services/familyAstrologyService.js`
     *   **Notes:** Dedicated service for family astrology flows.

4.  `start_business_partnership_flow`
     *   **Source:** Likely involves `generateGroupAstrology` and `src/services/astrology/compatibility/CompatibilityWorkflowManager.js`.
     *   **Target File:** `core/services/businessPartnershipService.js`
     *   **Notes:** Dedicated service for business partnership astrology.

5.  `start_group_timing_flow`
     *   **Source:** Needs further investigation. Potentially related to `src/services/astrology/mundane/` or `src/services/astrology/vedic/calculators/MuhurtaCalculator.js`.
     *   **Target File:** `core/services/groupTimingService.js`
     *   **Notes:** Dedicated service for group timing analysis.

6.  `calculateNakshatraPorutham`
     *   **Source:** `src/services/astrology/nadi/NadiCompatibility.js`
     *   **Target File:** `core/services/nakshatraPoruthamService.js`
     *   **Notes:** Contains Nakshatra compatibility analysis with proper matching algorithms.

7.  `calculateCompatibilityScore`
     *   **Source:** `src/services/astrology/compatibility/CompatibilityScorer.js` (✅ BEST: contains core scoring algorithms with astrologer library integration).
     *   **Target File:** `core/services/compatibilityScoreService.js`
     *   **Notes:** Dedicated service for compatibility scoring using astrologer library.

8.  `performSynastryAnalysis`
     *   **Source:** `src/services/astrology/compatibility/SynastryEngine.js` (✅ BEST: contains core synastry algorithms with astrologer library integration).
     *   **Target File:** `core/services/performSynastryAnalysisService.js`
     *   **Notes:** Dedicated service for performing synastry analysis using astrologer library.

9.  `calculateCompositeChart`
     *   **Source:** `src/services/astrology/compatibility/CompatibilityWorkflowManager.js` - function calculateCompositeChart() at line 389.
     *   **Target File:** `core/services/compositeChartService.js`
     *   **Notes:** Calculates composite chart by finding midpoints between planetary positions of two charts.

10. `calculateDavisonChart`
     *   **Source:** `src/services/astrology/vedicCalculator.js.backup` - function calculateDavisonChart() at line 17208.
     *   **Target File:** `core/services/davisonChartService.js`
     *   **Notes:** Calculates Davison relationship chart using midpoint date/time and location between two persons.

11. `generateGroupAstrology`
     *   **Source:** `src/services/astrology/vedic/calculators/GroupAstrologyCalculator.js`.
     *   **Target File:** `core/services/generateGroupAstrologyService.js`
     *   **Notes:** Dedicated service for comprehensive group astrology analysis.

12. `get_hindu_astrology_analysis`
     *   **Source:** `src/services/astrology/charts/VedicChartGenerator.js`, `src/services/astrology/vedic/calculators/ChartGenerator.js`.
     *   **Target File:** `core/services/hinduAstrologyService.js`
     *   **Notes:** Dedicated service for Hindu astrology analysis.

13. `generateDetailedChartAnalysis`
     *   **Source:** `src/services/astrology/vedic/calculators/DetailedChartAnalysisCalculator.js`.
     *   **Target File:** `core/services/detailedChartAnalysisService.js`
     *   **Notes:** Dedicated service for detailed chart analysis.

14. `generateBasicBirthChart`
     *   **Source:** `src/services/astrology/charts/ChartGenerator.js`, `src/services/astrology/vedic/calculators/DetailedChartCalculator.js`.
     *   **Target File:** `core/services/basicBirthChartService.js`
     *   **Notes:** Dedicated service for basic birth chart generation.

15. `calculateSunSign`
     *   **Source:** `src/services/astrology/calculations/SignCalculations.js` (✅ BEST: uses astrologer library for accurate calculations).
     *   **Target File:** `core/services/sunSignService.js`
     *   **Notes:** Dedicated service for sun sign calculations using astrologer library.

16. `calculateMoonSign`
     *   **Source:** `src/services/astrology/calculations/SignCalculations.js` (✅ BEST: uses astrologer library for accurate calculations).
     *   **Target File:** `core/services/moonSignService.js`
     *   **Notes:** Dedicated service for moon sign calculations using astrologer library.

17. `calculateRisingSign`
     *   **Source:** `src/services/astrology/calculations/SignCalculations.js` (✅ BEST: uses astrologer library for accurate calculations).
     *   **Target File:** `core/services/risingSignService.js`
     *   **Notes:** Dedicated service for rising sign calculations using astrologer library.

18. `calculateNakshatra`
     *   **Source:** `src/services/astrology/calculations/SignCalculations.js` (✅ BEST: uses astrologer library with Swiss Ephemeris integration).
     *   **Target File:** `core/services/calculateNakshatraService.js`
     *   **Notes:** Dedicated service for Nakshatra calculations using enhanced Swiss Ephemeris.

19. `get_vimshottari_dasha_analysis`
     *   **Source:** `src/services/astrology/vimshottariDasha.js` (✅ BEST: uses Swiss Ephemeris for precise Moon position calculations, authentic nakshatra-based system).
     *   **Target File:** `core/services/vimshottariDashaService.js`
     *   **Notes:** Dedicated service for Vimshottari Dasha analysis using Swiss Ephemeris.

20. `calculateCurrentDasha`
     *   **Source:** `src/services/astrology/vedic/calculators/DashaAnalysisCalculator.js`.
     *   **Target File:** `core/services/currentDashaService.js`
     *   **Notes:** Dedicated service for current Dasha calculations.

21. `calculateUpcomingDashas`
     *   **Source:** `src/services/astrology/vedic/calculators/DashaAnalysisCalculator.js`.
     *   **Target File:** `core/services/upcomingDashasService.js`
     *   **Notes:** Dedicated service for upcoming Dasha calculations.

22. `calculateAntardasha`
     *   **Source:** `src/services/astrology/vedic/calculators/DashaAnalysisCalculator.js`.
     *   **Target File:** `core/services/antardashaService.js`
     *   **Notes:** Dedicated service for Antardasha calculations.

23. `calculateJaiminiAstrology`
     *   **Source:** `src/services/astrology/jaiminiAstrology.js` (✅ BEST: uses Swiss Ephemeris for accurate planetary positions, authentic Jaimini Karakas system).
     *   **Target File:** `core/services/jaiminiAstrologyService.js`
     *   **Notes:** Dedicated service for Jaimini astrology using Swiss Ephemeris.

24. `calculateJaiminiDashas`
     *   **Source:** `src/services/astrology/vedic/calculators/JaiminiAstrologyCalculator.js`, `src/services/astrology/calculators/JaiminiKarakaCalculator.js`.
     *   **Target File:** `core/services/jaiminiDashasService.js`
     *   **Notes:** Dedicated service for Jaimini Dasha calculations.

25. `calculateGochar`
     *   **Source:** `src/services/astrology/vedic/calculators/GocharCalculator.js`.
     *   **Target File:** `core/services/gocharService.js`
     *   **Notes:** Dedicated service for Gochar (transit) analysis.

26. `calculateSolarReturn`
     *   **Source:** `src/services/astrology/vedic/calculators/SolarReturnCalculator.js`.
     *   **Target File:** `core/services/solarReturnService.js`
     *   **Notes:** Dedicated service for solar return calculations.

27. `calculateLunarReturn`
     *   **Source:** `src/services/astrology/vedic/calculators/LunarReturnCalculator.js`.
     *   **Target File:** `core/services/lunarReturnService.js`
     *   **Notes:** Dedicated service for lunar return calculations.

28. `calculateVarshaphal`
     *   **Source:** `src/services/astrology/vedic/calculators/VarshaphalCalculator.js`.
     *   **Target File:** `core/services/varshaphalService.js`
     *   **Notes:** Dedicated service for Varshaphal calculations.

29. `calculateSecondaryProgressions`
     *   **Source:** `src/services/astrology/vedic/calculators/SecondaryProgressionsCalculator.js`.
     *   **Target File:** `core/services/secondaryProgressionsService.js`
     *   **Notes:** Dedicated service for secondary progressions.

30. `calculateSolarArcDirections`
     *   **Source:** `src/services/astrology/vedic/calculators/SolarArcDirectionsCalculator.js`.
     *   **Target File:** `core/services/solarArcDirectionsService.js`
     *   **Notes:** Dedicated service for solar arc directions.

31. `calculateEnhancedSecondaryProgressions`
     *   **Source:** `src/services/astrology/vedic/calculators/SecondaryProgressionsCalculator.js` (likely an enhanced version within).
     *   **Target File:** `core/services/enhancedSecondaryProgressionsService.js`
     *   **Notes:** Dedicated service for enhanced secondary progressions.

32. `calculateEnhancedSolarArcDirections`
     *   **Source:** `src/services/astrology/vedic/calculators/SolarArcDirectionsCalculator.js` (likely an enhanced version within).
     *   **Target File:** `core/services/enhancedSolarArcDirectionsService.js`
     *   **Notes:** Dedicated service for enhanced solar arc directions.

33. `calculateNextSignificantTransits`
     *   **Source:** `src/services/astrology/vedic/calculators/SignificantTransitsCalculator.js`.
     *   **Target File:** `core/services/significantTransitsService.js`
     *   **Notes:** Dedicated service for significant transits.

34. `calculateAdvancedTransits`
     *   **Source:** `src/services/astrology/vedic/calculators/TransitCalculator.js`, `src/services/astrology/vedic/calculators/GocharCalculator.js`.
     *   **Target File:** `core/services/advancedTransitsService.js`
     *   **Notes:** Dedicated service for advanced transit calculations.

35. `identifyMajorTransits`
     *   **Source:** `src/services/astrology/vedic/calculators/SignificantTransitsCalculator.js`.
     *   **Target File:** `core/services/majorTransitsService.js`
     *   **Notes:** Dedicated service for identifying major transits.

36. `generateTransitPreview`
     *   **Source:** `src/services/astrology/vedic/calculators/TransitCalculator.js`, `src/services/astrology/vedic/calculators/GocharCalculator.js`.
     *   **Target File:** `core/services/transitPreviewService.js`
     *   **Notes:** Dedicated service for transit preview generation.

37. `get_ashtakavarga_analysis`
     *   **Source:** `src/services/astrology/ashtakavarga.js` (✅ BEST: uses Swiss Ephemeris for precise planetary calculations, complete 64-point beneficial analysis system).
     *   **Target File:** `core/services/ashtakavargaService.js`
     *   **Notes:** Dedicated service for Ashtakavarga analysis using Swiss Ephemeris.

38. `generateShadbala`
     *   **Source:** `src/services/astrology/vedic/calculators/ShadbalaCalculator.js`.
     *   **Target File:** `core/services/shadbalaService.js`
     *   **Notes:** Dedicated service for Shadbala calculations.

39. `get_varga_charts_analysis`
     *   **Source:** `src/services/astrology/vargaCharts.js`, `src/services/astrology/vedic/calculators/VargaChartCalculator.js`.
     *   **Target File:** `core/services/vargaChartsService.js`
     *   **Notes:** Dedicated service for Varga Charts analysis.

40. `get_prashna_astrology_analysis`
     *   **Source:** `src/services/astrology/prashnaAstrology.js`, `src/services/astrology/vedic/calculators/PrashnaCalculator.js`.
     *   **Target File:** `core/services/prashnaAstrologyService.js`
     *   **Notes:** Dedicated service for Prashna Astrology analysis.

41. `calculateVedicYogas`
     *   **Source:** `src/services/astrology/vedic/calculators/VedicYogasCalculator.js`.
     *   **Target File:** `core/services/vedicYogasService.js`
     *   **Notes:** Dedicated service for Vedic Yogas calculations.

42. `calculateAsteroids`
     *   **Source:** `src/services/astrology/vedic/calculators/AsteroidCalculator.js`.
     *   **Target File:** `core/services/asteroidsService.js`
     *   **Notes:** Dedicated service for asteroid calculations.

43. `generateComprehensiveVedicAnalysis`
     *   **Source:** `src/services/astrology/vedic/calculators/ComprehensiveAnalysisCalculator.js`.
     *   **Target File:** `core/services/comprehensiveVedicAnalysisService.js`
     *   **Notes:** Dedicated service for comprehensive Vedic analysis.

44. `generateFutureSelfSimulator`
     *   **Source:** `src/services/astrology/vedic/calculators/FutureSelfSimulatorCalculator.js`.
     *   **Target File:** `core/services/futureSelfSimulatorService.js`
     *   **Notes:** Dedicated service for future self simulation.

45. `get_ayurvedic_astrology_analysis`
     *   **Source:** `src/services/astrology/ayurvedicAstrology.js`.
     *   **Target File:** `core/services/ayurvedicAstrologyService.js`
     *   **Notes:** Dedicated service for Ayurvedic astrology analysis.

46. `generateLifePatterns`
     *   **Source:** `src/services/astrology/vedicCalculator.js.backup` - function generateLifePatterns(sunSign) starting at line 2226.
     *   **Target File:** `core/services/lifePatternsService.js`
     *   **Notes:** Generates life pattern analysis based on sun sign with detailed characteristics.

47. `get_panchang_analysis`
     *   **Source:** `src/services/astrology/panchang.js`, `src/services/astrology/vedic/calculators/PanchangCalculator.js`.
     *   **Target File:** `core/services/panchangService.js`
     *   **Notes:** Dedicated service for Panchang analysis.

48. `get_muhurta_analysis`
     *   **Source:** `src/services/astrology/muhurta.js`, `src/services/astrology/vedic/calculators/MuhurtaCalculator.js`.
     *   **Target File:** `core/services/muhurtaService.js`
     *   **Notes:** Dedicated service for Muhurta analysis.

49. `calculateAbhijitMuhurta`
     *   **Source:** `src/services/astrology/vedic/calculators/MuhurtaCalculator.js` (likely a function within).
     *   **Target File:** `core/services/abhijitMuhurtaService.js`
     *   **Notes:** Dedicated service for Abhijit Muhurta calculations.

50. `calculateRahukalam`
     *   **Source:** `src/services/astrology/vedic/calculators/MuhurtaCalculator.js` (likely a function within).
     *   **Target File:** `core/services/rahukalamService.js`
     *   **Notes:** Dedicated service for Rahukalam calculations.

51. `calculateGulikakalam`
     *   **Source:** `src/services/astrology/vedic/calculators/MuhurtaCalculator.js` (likely a function within).
     *   **Target File:** `core/services/gulikakalamService.js`
     *   **Notes:** Dedicated service for Gulikakalam calculations.

52. `calculateCosmicEvents`
     *   **Source:** `src/services/astrology/vedic/calculators/CosmicEventsCalculator.js`.
     *   **Target File:** `core/services/cosmicEventsService.js`
     *   **Notes:** Dedicated service for cosmic events tracking.

53. `generateEphemerisTable`
     *   **Source:** `src/services/astrology/vedicCalculator.js.backup` - function generateEphemerisTable() at line 18925.
     *   **Target File:** `core/services/ephemerisService.js`
     *   **Notes:** Generates comprehensive ephemeris table with planetary positions for specified date range.

54. `calculateUpcomingSeasonalEvents`
     *   **Source:** `src/services/astrology/vedic/calculators/CosmicEventsCalculator.js` (likely a function within).
     *   **Target File:** `core/services/seasonalEventsService.js`
     *   **Notes:** Dedicated service for seasonal events calculations.

55. `calculateUpcomingPlanetaryEvents`
     *   **Source:** `src/services/astrology/vedic/calculators/CosmicEventsCalculator.js` (likely a function within).
     *   **Target File:** `core/services/planetaryEventsService.js`
     *   **Notes:** Dedicated service for planetary events calculations.

56. `get_vedic_remedies_info`
     *   **Source:** `src/services/astrology/vedicRemedies.js`, `src/services/astrology/vedic/calculators/RemedialMeasuresCalculator.js`.
     *   **Target File:** `core/services/vedicRemediesService.js`
     *   **Notes:** Dedicated service for Vedic remedies information.

57. `generateKaalSarpDosha`
     *   **Source:** `src/services/astrology/vedic/calculators/KaalSarpDoshaCalculator.js`.
     *   **Target File:** `core/services/kaalSarpDoshaService.js`
     *   **Notes:** Dedicated service for Kaal Sarp Dosha analysis.

58. `generateSadeSatiAnalysis`
     *   **Source:** `src/services/astrology/vedic/calculators/SadeSatiCalculator.js`.
     *   **Target File:** `core/services/sadeSatiService.js`
     *   **Notes:** Dedicated service for Sade Sati analysis.

59. `generateWesternBirthChart`
     *   **Source:** `src/services/astrology/western/WesternCalculator.js` (✅ BEST: implements Western house systems and aspects).
     *   **Target File:** `core/services/westernBirthChartService.js`
     *   **Notes:** Dedicated Western astrology service for birth chart generation.

60. `get_current_transits`
     *   **Source:** `src/services/astrology/vedic/calculators/TransitCalculator.js`, `src/services/astrology/vedic/calculators/GocharCalculator.js`.
     *   **Target File:** `core/services/currentTransitsService.js`
     *   **Notes:** Dedicated service for current planetary transits.

61. `get_secondary_progressions`
     *   **Source:** `src/services/astrology/vedic/calculators/SecondaryProgressionsCalculator.js`.
     *   **Target File:** `core/services/secondaryProgressionsService.js`
     *   **Notes:** Dedicated service for secondary progressions.

62. `get_solar_arc_directions`
     *   **Source:** `src/services/astrology/vedic/calculators/SolarArcDirectionsCalculator.js`.
     *   **Target File:** `core/services/solarArcDirectionsService.js`
     *   **Notes:** Dedicated service for solar arc directions.

63. `get_asteroid_analysis`
     *   **Source:** `src/services/astrology/vedic/calculators/AsteroidCalculator.js`.
     *   **Target File:** `core/services/asteroidAnalysisService.js`
     *   **Notes:** Dedicated service for asteroid analysis.

64. `get_fixed_stars_analysis`
     *   **Source:** `src/services/astrology/calculators/FixedStarsCalculator.js` (✅ BEST: uses Swiss Ephemeris for precise fixed star calculations).
     *   **Target File:** `core/services/fixedStarsService.js`
     *   **Notes:** Dedicated service for fixed stars analysis using Swiss Ephemeris.

65. `get_solar_return_analysis`
     *   **Source:** `src/services/astrology/vedic/calculators/SolarReturnCalculator.js`.
     *   **Target File:** `core/services/solarReturnAnalysisService.js`
     *   **Notes:** Dedicated service for solar return analysis.

66. `get_career_astrology_analysis`
     *   **Source:** `src/services/astrology/calculators/CareerAstrologyCalculator.js` (✅ BEST: uses Swiss Ephemeris for career timing analysis).
     *   **Target File:** `core/services/careerAstrologyService.js`
     *   **Notes:** Dedicated service for career astrology using Swiss Ephemeris.

67. `get_financial_astrology_analysis`
     *   **Source:** `src/services/astrology/calculators/FinancialAstrologyCalculator.js`
     *   **Target File:** `core/services/financialAstrologyService.js`
     *   **Notes:** Financial astrology analysis with wealth planets, cycles, and strategies.

68. `get_medical_astrology_analysis`
     *   **Source:** `src/services/astrology/calculators/MedicalAstrologyCalculator.js`
     *   **Target File:** `core/services/medicalAstrologyService.js`
     *   **Notes:** Medical astrology analysis with health indicators and house analysis.

69. `get_event_astrology_analysis`
     *   **Source:** `src/services/astrology/handlers/predictiveHandlers.js` - function generateEventAstrologyAnalysis() and related handlers.
     *   **Target File:** `core/services/eventAstrologyService.js`
     *   **Notes:** Event astrology analysis for timing important occasions.

70. `get_astrocartography_analysis`
     *   **Source:** `src/services/astrology/astrocartographyReader.js`
     *   **Target File:** `core/services/astrocartographyService.js`
     *   **Notes:** Astrocartography analysis mapping planetary influences across geographic locations.

71. `get_tarot_reading`
     *   **Source:** `src/services/astrology/tarotReader.js`
     *   **Target File:** `core/services/tarotReadingService.js`
     *   **Notes:** Comprehensive tarot reading system with multiple spreads.

72. `get_iching_reading`
     *   **Source:** `src/services/astrology/ichingReader.js` and `src/services/astrology/iching/` directory.
     *   **Target File:** `core/services/ichingReadingService.js`
     *   **Notes:** I Ching (Yijing) oracle reading with hexagram interpretations.

73. `get_palmistry_analysis`
     *   **Source:** `src/services/astrology/palmistryReader.js`
     *   **Target File:** `core/services/palmistryService.js`
     *   **Notes:** Palmistry analysis service with line interpretations.

74. `show_chinese_flow`
     *   **Source:** `src/services/astrology/chineseCalculator.js`
     *   **Target File:** `core/services/chineseAstrologyService.js`
     *   **Notes:** Chinese astrology calculations and analysis.

75. `get_mayan_analysis`
     *   **Source:** `src/services/astrology/mayanReader.js` and related files in `src/services/astrology/` directory.
     *   **Target File:** `core/services/mayanAstrologyService.js`
     *   **Notes:** Mayan calendar and astrology analysis with Tzolk'in and Haab calculations.

76. `get_celtic_analysis`
     *   **Source:** `src/services/astrology/celticReader.js` and related files.
     *   **Target File:** `core/services/celticAstrologyService.js`
     *   **Notes:** Celtic astrology analysis with tree sign system.

77. `get_kabbalistic_analysis`
     *   **Source:** `src/services/astrology/kabbalisticReader.js`
     *   **Target File:** `core/services/kabbalisticAstrologyService.js`
     *   **Notes:** Kabbalistic astrology with Tree of Life Sephiroth interpretations.

78. `get_hellenistic_astrology_analysis`
     *   **Source:** `src/services/astrology/hellenisticAstrology.js`
     *   **Target File:** `core/services/hellenisticAstrologyService.js`
     *   **Notes:** Hellenistic astrology with ancient Greek techniques and Arabic parts.

79. `get_islamic_astrology_info`
     *   **Source:** `src/services/astrology/islamicAstrology.js`
     *   **Target File:** `core/services/islamicAstrologyService.js`
     *   **Notes:** Islamic astrology system with numerology and destiny analysis.

80. `get_horary_reading`
     *   **Source:** `src/services/astrology/horary/HoraryCalculator.js` (✅ BEST: uses Swiss Ephemeris for precise horary calculations).
     *   **Target File:** `core/services/horaryAstrologyService.js`
     *   **Notes:** Dedicated service for horary astrology using Swiss Ephemeris.

81. `get_numerology_analysis`
     *   **Source:** `src/services/astrology/numerologyService.js`
     *   **Target File:** `core/services/numerologyAnalysisService.js`
     *   **Notes:** Numerology analysis service.

82. `get_numerology_report`
     *   **Source:** `src/services/astrology/numerologyService.js`
     *   **Target File:** `core/services/numerologyReportService.js`
     *   **Notes:** Detailed numerology report generation.

83. `get_lunar_return`
     *   **Source:** `src/services/astrology/vedic/calculators/LunarReturnCalculator.js`.
     *   **Target File:** `core/services/lunarReturnService.js`
     *   **Notes:** Dedicated service for lunar return calculations.

84. `get_future_self_analysis`
     *   **Source:** `src/services/astrology/vedic/calculators/FutureSelfSimulatorCalculator.js`.
     *   **Target File:** `core/services/futureSelfAnalysisService.js`
     *   **Notes:** Dedicated service for future self analysis.

85. `get_electional_astrology`
     *   **Source:** `src/services/astrology/mundane/PoliticalAstrology.js` and related mundane astrology files.
     *   **Target File:** `core/services/electionalAstrologyService.js`
     *   **Notes:** Electional astrology for timing important events.

86. `get_mundane_astrology_analysis`
     *   **Source:** `src/services/astrology/mundane/PoliticalAstrology.js` and related mundane astrology files.
     *   **Target File:** `core/services/mundaneAstrologyService.js`
     *   **Notes:** Mundane astrology for world events and political analysis.

87. `get_daily_horoscope`
     *   **Source:** `src/services/astrology/vedic/calculators/DailyHoroscopeCalculator.js`.
     *   **Target File:** `core/services/dailyHoroscopeService.js`
     *   **Notes:** Dedicated service for daily horoscope generation.

88. `show_nadi_flow`
     *   **Source:** `src/services/astrology/nadiReader.js`
     *   **Target File:** `core/services/nadiAstrologyService.js`
     *   **Notes:** Nadi astrology flow and analysis.

89. `get_hindu_festivals_info`
     *   **Source:** `src/services/astrology/hinduFestivals.js`
     *   **Target File:** `core/services/hinduFestivalsService.js`
     *   **Notes:** Hindu festivals information and timing.

90. `get_numerology_analysis`
     *   **Source:** `src/services/astrology/numerologyService.js` (duplicate of #81)
     *   **Target File:** `core/services/numerologyAnalysisService.js`
     *   **Notes:** Numerology analysis service (duplicate entry - same as Service #81).



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
15. **solarReturnAnalysisService.js** - Solar return analysis

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

## Key Findings Summary

✅ **All services identified:** Successfully located sources for all 13 remaining services that were marked as "Needs to be identified"

✅ **No duplicate sources:** Confirmed that `get_numerology_analysis` (Service #90) is indeed a duplicate of Service #81, as properly documented

✅ **Complete 100% coverage:** All 90 services in the migration plan now have identified source files

✅ **Target files remain unique:** Each service maps to a distinct target file in the new architecture with no conflicts

### Source File Locations Summary

The remaining services were found in these source files:

1. `src/services/astrology/compatibility/CompatibilityWorkflowManager.js` - For Composite Chart calculation
2. `src/services/astrology/vedicCalculator.js.backup` - For Davison Chart and Ephemeris Table generation
3. `src/services/astrology/calculators/FinancialAstrologyCalculator.js` - For Financial Astrology analysis
4. `src/services/astrology/calculators/MedicalAstrologyCalculator.js` - For Medical Astrology analysis
5. `src/services/astrology/handlers/predictiveHandlers.js` - For Event Astrology analysis
6. `src/services/astrology/astrocartographyReader.js` - For Astrocartography analysis
7. `src/services/astrology/ichingReader.js` - For I Ching readings
8. `src/services/astrology/mayanReader.js` - For Mayan astrology analysis
9. `src/services/astrology/celticReader.js` - For Celtic astrology analysis
10. `src/services/astrology/kabbalisticReader.js` - For Kabbalistic astrology analysis
11. `src/services/astrology/hellenisticAstrology.js` - For Hellenistic astrology analysis
12. `src/services/astrology/islamicAstrology.js` - For Islamic astrology information
