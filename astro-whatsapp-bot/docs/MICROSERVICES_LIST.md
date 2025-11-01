# List of Proposed Microservices

This document lists the 90 unique astrological services identified from the `MENU_REFERENCE.md` that are intended to become individual microservices as part of the new architectural design.

## Astrological Microservices
**Note:** All services are fully implemented with their file locations in the `src/core/services/` directory and its subdirectories (`vedic`, `western`, `common`).

1.  `start_couple_compatibility_flow` - `src/core/services/coupleCompatibilityService.js` (uses: `src/services/astrology/CompatibilityAction.js`)
2.  `get_synastry_analysis` - `src/core/services/synastryAnalysisService.js` (uses: `src/services/astrology/compatibility/SynastryEngine.js`)
3.  `start_family_astrology_flow` - `src/core/services/vedic/familyAstrologyService.js` (uses: `src/services/astrology/vedic/calculators/GroupAstrologyCalculator.js`)
4.  `start_business_partnership_flow` - `src/core/services/vedic/businessPartnershipService.js` (uses: `src/services/astrology/vedic/calculators/GroupAstrologyCalculator.js`)
5.  `start_group_timing_flow` - `src/core/services/vedic/groupTimingService.js` (uses: `src/services/astrology/vedic/calculators/GroupAstrologyCalculator.js` + `src/services/astrology/vedic/calculators/MuhurtaCalculator.js`)
6.  `get_numerology_analysis` - `src/core/services/numerologyAnalysisService.js` (uses: `src/services/astrology/numerologyService.js`)
7.  `get_numerology_report` - `src/core/services/common/numerologyService.js` (also `src/core/services/vedic/numerologyReportService.js`) (uses: `src/services/astrology/numerologyService.js`)
8.  `get_lunar_return` - `src/core/services/vedic/lunarReturnService.js` (uses: `src/services/astrology/vedic/calculators/LunarReturnCalculator.js`)
9.  `get_future_self_analysis` - `src/core/services/vedic/futureSelfAnalysisService.js` (uses: `src/services/astrology/vedic/calculators/FutureSelfSimulatorCalculator.js`)
10. `get_electional_astrology` - `src/core/services/vedic/electionalAstrologyService.js` (uses: `src/services/astrology/mundane/PoliticalAstrology.js`)
11. `get_mundane_astrology_analysis` - `src/core/services/mundaneAstrologyService.js` (uses: `src/services/astrology/mundane/PoliticalAstrology.js`)
12. `get_daily_horoscope` - `src/core/services/vedic/dailyHoroscopeService.js` (uses: `src/services/astrology/vedic/calculators/DailyHoroscopeCalculator.js`)
13. `show_birth_chart` - `src/core/services/vedic/birthChartService.js` (uses: `src/services/astrology/vedic/calculators/ChartGenerator.js`)
14. `get_current_transits` - `src/core/services/vedic/currentTransitsService.js` (uses: `src/services/astrology/vedic/calculators/TransitCalculator.js`)
15. `get_secondary_progressions` - `src/core/services/vedic/secondaryProgressionsService.js` (uses: `src/services/astrology/vedic/calculators/SecondaryProgressionsCalculator.js`)
16. `get_solar_arc_directions` - `src/core/services/vedic/solarArcDirectionsService.js` (uses: `src/services/astrology/vedic/calculators/SolarArcDirectionsCalculator.js`)
17. `get_asteroid_analysis` - `src/core/services/vedic/asteroidAnalysisService.js` (uses: `src/services/astrology/vedic/calculators/AsteroidCalculator.js`)
18. `get_fixed_stars_analysis` - `src/core/services/vedic/fixedStarsService.js` (uses: `src/services/astrology/vedic/calculators/FixedStarsCalculator.js`)
19. `get_solar_return_analysis` - `src/core/services/vedic/solarReturnAnalysisService.js` (uses: `src/services/astrology/vedic/calculators/SolarReturnCalculator.js`)
20. `get_career_astrology_analysis` - `src/core/services/vedic/careerAstrologyService.js` (uses: `src/services/astrology/vedic/calculators/CareerAstrologyCalculator.js`)
21. `get_financial_astrology_analysis` - `src/core/services/vedic/financialAstrologyService.js`
22. `get_medical_astrology_analysis` - `src/core/services/vedic/medicalAstrologyService.js`
23. `get_event_astrology_analysis` - `src/core/services/vedic/eventAstrologyService.js`
24. `get_hindu_astrology_analysis` - `src/core/services/vedic/hinduAstrologyService.js`
25. `show_nadi_flow` - `src/core/services/vedic/nadiAstrologyService.js`
26. `generateDetailedChartAnalysis` - `src/core/services/vedic/detailedChartAnalysisService.js`
27. `generateBasicBirthChart` - `src/core/services/vedic/basicBirthChartService.js`
28. `generateWesternBirthChart` - `src/core/services/western/westernBirthChartService.js`
29. `calculateSunSign` - `src/core/services/vedic/sunSignService.js`
30. `calculateMoonSign` - `src/core/services/vedic/moonSignService.js`
31. `calculateRisingSign` - `src/core/services/vedic/risingSignService.js`
32. `calculateNakshatra` - `src/core/services/vedic/calculateNakshatraService.js`
33. `get_vimshottari_dasha_analysis` - `src/core/services/vedic/vimshottariDashaService.js`
34. `calculateCurrentDasha` - `src/core/services/vedic/currentDashaService.js`
35. `calculateUpcomingDashas` - `src/core/services/vedic/upcomingDashasService.js`
36. `calculateAntardasha` - `src/core/services/vedic/antardashaService.js`
37. `calculateJaiminiAstrology` - `src/core/services/vedic/jaiminiAstrologyService.js`
38. `calculateJaiminiDashas` - `src/core/services/vedic/jaiminiDashasService.js`
39. `calculateGochar` - `src/core/services/vedic/gocharService.js`
40. `calculateSolarReturn` - `src/core/services/vedic/solarReturnService.js`
41. `calculateLunarReturn` - `src/core/services/vedic/lunarReturnService.js`
42. `calculateVarshaphal` - `src/core/services/vedic/varshaphalService.js`
43. `calculateSecondaryProgressions` - `src/core/services/vedic/secondaryProgressionsService.js`
44. `calculateSolarArcDirections` - `src/core/services/vedic/solarArcDirectionsService.js`
45. `calculateEnhancedSecondaryProgressions` - `src/core/services/vedic/enhancedSecondaryProgressionsService.js`
46. `calculateEnhancedSolarArcDirections` - `src/core/services/vedic/enhancedSolarArcDirectionsService.js`
47. `calculateNextSignificantTransits` - `src/core/services/vedic/significantTransitsService.js`
48. `calculateAdvancedTransits` - `src/core/services/vedic/advancedTransitsService.js`
49. `identifyMajorTransits` - `src/core/services/vedic/majorTransitsService.js`
50. `generateTransitPreview` - `src/core/services/vedic/transitPreviewService.js`
51. `calculateNakshatraPorutham` - `src/core/services/vedic/nakshatraPoruthamService.js`
52. `calculateCompatibilityScore` - `src/core/services/vedic/compatibilityScoreService.js`
53. `performSynastryAnalysis` - `src/core/services/vedic/performSynastryAnalysisService.js`
54. `calculateCompositeChart` - `src/core/services/compositeChartService.js`
55. `calculateDavisonChart` - `src/core/services/vedic/davisonChartService.js`
56. `generateGroupAstrology` - `src/core/services/vedic/generateGroupAstrologyService.js`
57. `get_ashtakavarga_analysis` - `src/core/services/vedic/ashtakavargaService.js`
58. `generateShadbala` - `src/core/services/vedic/shadbalaService.js`
59. `get_varga_charts_analysis` - `src/core/services/vedic/vargaChartsService.js`
60. `get_prashna_astrology_analysis` - `src/core/services/vedic/prashnaAstrologyService.js`
61. `calculateVedicYogas` - `src/core/services/vedic/vedicYogasService.js`
62. `calculateAsteroids` - `src/core/services/vedic/asteroidsService.js`
63. `generateComprehensiveVedicAnalysis` - `src/core/services/vedic/comprehensiveVedicAnalysisService.js`
64. `generateFutureSelfSimulator` - `src/core/services/vedic/futureSelfSimulatorService.js`
65. `get_ayurvedic_astrology_analysis` - `src/core/services/vedic/ayurvedicAstrologyService.js`
66. `generateLifePatterns` - `src/core/services/vedic/lifePatternsService.js`
67. `get_panchang_analysis` - `src/core/services/vedic/panchangService.js`
68. `get_muhurta_analysis` - `src/core/services/vedic/muhurtaService.js`
69. `calculateAbhijitMuhurta` - `src/core/services/vedic/abhijitMuhurtaService.js`
70. `calculateRahukalam` - `src/core/services/vedic/rahukalamService.js`
71. `calculateGulikakalam` - `src/core/services/vedic/gulikakalamService.js`
72. `calculateCosmicEvents` - `src/core/services/vedic/cosmicEventsService.js`
73. `generateEphemerisTable` - `src/core/services/vedic/ephemerisService.js`
74. `calculateUpcomingSeasonalEvents` - `src/core/services/vedic/seasonalEventsService.js`
75. `calculateUpcomingPlanetaryEvents` - `src/core/services/vedic/planetaryEventsService.js`
76. `get_vedic_remedies_info` - `src/core/services/vedic/vedicRemediesService.js`
77. `generateKaalSarpDosha` - `src/core/services/vedic/kaalSarpDoshaService.js`
78. `generateSadeSatiAnalysis` - `src/core/services/vedic/sadeSatiService.js`
79. `get_tarot_reading` - `src/core/services/common/tarotReadingService.js` (uses: `src/services/astrology/tarotReader.js`)
80. `get_iching_reading` - `src/core/services/common/ichingReadingService.js` (uses: `src/services/astrology/ichingReader.js`)
81. `get_palmistry_analysis` - `src/core/services/common/palmistryService.js` (uses: `src/services/astrology/palmistryReader.js`)
82. `show_chinese_flow` - `src/core/services/common/chineseAstrologyService.js` (uses: `src/services/astrology/chineseCalculator.js`)
83. `get_mayan_analysis` - `src/core/services/common/mayanAstrologyService.js` (uses: `src/services/astrology/mayanReader.js`)
84. `get_celtic_analysis` - `src/core/services/common/celticAstrologyService.js` (uses: `src/services/astrology/celticReader.js`)
85. `get_kabbalistic_analysis` - `src/core/services/common/kabbalisticAstrologyService.js` (uses: `src/services/astrology/kabbalisticReader.js`)
86. `get_hellenistic_astrology_analysis` - `src/core/services/vedic/hellenisticAstrologyService.js` (uses: `src/services/astrology/hellenisticAstrology.js`)
87. `get_horary_reading` - `src/core/services/vedic/horaryAstrologyService.js` (uses: `src/services/astrology/horary/HoraryCalculator.js`)
88. `get_astrocartography_analysis` - `src/core/services/vedic/astrocartographyService.js` (uses: `src/services/astrology/astrocartographyReader.js`)
89. `get_hindu_festivals_info` - `src/core/services/hinduFestivalsService.js` (uses: `src/services/astrology/hinduFestivals.js`)
