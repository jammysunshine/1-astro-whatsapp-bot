# List of Proposed Microservices

This document lists the 88 unique astrological services identified from the `MENU_REFERENCE.md` that are intended to become individual microservices as part of the new architectural design.

## Astrological Microservices
**Note:** All services are implemented in the `/src/core/services/` directory (root level, no subdirectories). All calculators are located in `/src/core/services/calculators/`. Total: 86 services implemented with 55 calculators.

1.  `start_couple_compatibility_flow` - `src/core/services/coupleCompatibilityService.js` (uses: `src/core/services/calculators/CompatibilityAction.js`)
2.  `get_synastry_analysis` - `src/core/services/synastryAnalysisService.js` (uses: `src/core/services/calculators/SynastryEngine.js`)
3.  `start_family_astrology_flow` - `src/core/services/familyAstrologyService.js` (uses: `src/core/services/calculators/GroupAstrologyCalculator.js`)
4.  `start_business_partnership_flow` - `src/core/services/businessPartnershipService.js` (uses: `src/core/services/calculators/GroupAstrologyCalculator.js`)
5.  `start_group_timing_flow` - `src/core/services/groupTimingService.js` (uses: `src/core/services/calculators/GroupAstrologyCalculator.js` + `src/core/services/calculators/MuhurtaCalculator.js`)
6.  `get_numerology_analysis` - `src/core/services/numerologyAnalysisService.js` (uses: `src/core/services/calculators/numerologyService.js`)
7.  `get_numerology_report` - `src/core/services/numerologyService.js` (also `src/core/services/numerologyReportService.js`) (uses: `src/core/services/calculators/numerologyService.js`)
8.  `get_lunar_return` - `src/core/services/lunarReturnService.js` (uses: `src/core/services/calculators/LunarReturnCalculator.js`)
9.  `get_future_self_analysis` - `src/core/services/futureSelfAnalysisService.js` (uses: `src/core/services/calculators/FutureSelfSimulatorCalculator.js`)
10. `get_electional_astrology` - `src/core/services/electionalAstrologyService.js` (uses: `src/core/services/calculators/PoliticalAstrology.js`)
11. `get_mundane_astrology_analysis` - `src/core/services/mundaneAstrologyService.js` (uses: `src/core/services/calculators/PoliticalAstrology.js`)
12. `get_daily_horoscope` - `src/core/services/dailyHoroscopeService.js` (uses: `src/core/services/calculators/DailyHoroscopeCalculator.js`)
13. `show_birth_chart` - `src/core/services/birthChartService.js` (uses: `src/core/services/calculators/ChartGenerator.js`)
14. `get_current_transits` - `src/core/services/currentTransitsService.js` (uses: `src/core/services/calculators/TransitCalculator.js`)
15. `get_secondary_progressions` - `src/core/services/secondaryProgressionsService.js` (uses: `src/core/services/calculators/SecondaryProgressionsCalculator.js`)
16. `get_solar_arc_directions` - `src/core/services/solarArcDirectionsService.js` (uses: `src/core/services/calculators/SolarArcDirectionsCalculator.js`)
17. `get_fixed_stars_analysis` - `src/core/services/fixedStarsService.js` (uses: `src/core/services/calculators/FixedStarsCalculator.js`)
20. `get_career_astrology_analysis` - `src/core/services/careerAstrologyService.js` (uses: `src/core/services/calculators/CareerAstrologyCalculator.js`)
21. `get_financial_astrology_analysis` - `src/core/services/financialAstrologyService.js`
22. `get_medical_astrology_analysis` - `src/core/services/medicalAstrologyService.js`
23. `get_event_astrology_analysis` - `src/core/services/eventAstrologyService.js`
24. `get_hindu_astrology_analysis` - `src/core/services/hinduAstrologyService.js`
25. `show_nadi_flow` - `src/core/services/nadiAstrologyService.js`
26. `generateDetailedChartAnalysis` - `src/core/services/detailedChartAnalysisService.js`
27. `generateBasicBirthChart` - `src/core/services/basicBirthChartService.js`
28. `generateWesternBirthChart` - `src/core/services/westernBirthChartService.js`
29. `calculateSunSign` - `src/core/services/sunSignService.js`
30. `calculateMoonSign` - `src/core/services/moonSignService.js`
31. `calculateRisingSign` - `src/core/services/risingSignService.js`
32. `calculateNakshatra` - `src/core/services/calculateNakshatraService.js`
33. `get_vimshottari_dasha_analysis` - `src/core/services/vimshottariDashaService.js`
34. `calculateCurrentDasha` - `src/core/services/currentDashaService.js`
35. `calculateUpcomingDashas` - `src/core/services/upcomingDashasService.js`
36. `calculateAntardasha` - `src/core/services/antardashaService.js`
37. `calculateJaiminiAstrology` - `src/core/services/jaiminiAstrologyService.js`
38. `calculateJaiminiDashas` - `src/core/services/jaiminiDashasService.js`
39. `calculateGochar` - `src/core/services/gocharService.js`
40. `calculateSolarReturn` - `src/core/services/solarReturnService.js`
41. `calculateLunarReturn` - `src/core/services/lunarReturnService.js`
42. `calculateVarshaphal` - `src/core/services/varshaphalService.js`
43. `calculateSecondaryProgressions` - `src/core/services/secondaryProgressionsService.js`
44. `calculateSolarArcDirections` - `src/core/services/solarArcDirectionsService.js`
45. `calculateEnhancedSecondaryProgressions` - `src/core/services/enhancedSecondaryProgressionsService.js`
46. `calculateEnhancedSolarArcDirections` - `src/core/services/enhancedSolarArcDirectionsService.js`
47. `calculateNextSignificantTransits` - `src/core/services/significantTransitsService.js`
48. `calculateAdvancedTransits` - `src/core/services/advancedTransitsService.js`
49. `identifyMajorTransits` - `src/core/services/majorTransitsService.js`
50. `generateTransitPreview` - `src/core/services/transitPreviewService.js`
51. `calculateNakshatraPorutham` - `src/core/services/nakshatraPoruthamService.js`
52. `calculateCompatibilityScore` - `src/core/services/compatibilityScoreService.js`
53. `performSynastryAnalysis` - `src/core/services/performSynastryAnalysisService.js`
54. `calculateCompositeChart` - `src/core/services/compositeChartService.js`
55. `calculateDavisonChart` - `src/core/services/davisonChartService.js`
56. `generateGroupAstrology` - `src/core/services/generateGroupAstrologyService.js`
57. `get_ashtakavarga_analysis` - `src/core/services/ashtakavargaService.js`
58. `generateShadbala` - `src/core/services/shadbalaService.js`
59. `get_varga_charts_analysis` - `src/core/services/vargaChartsService.js`
60. `get_prashna_astrology_analysis` - `src/core/services/prashnaAstrologyService.js`
61. `calculateVedicYogas` - `src/core/services/vedicYogasService.js`
62. `calculateAsteroids` - `src/core/services/asteroidsService.js`
63. `generateComprehensiveVedicAnalysis` - `src/core/services/comprehensiveVedicAnalysisService.js`
64. `generateFutureSelfSimulator` - `src/core/services/futureSelfSimulatorService.js`
65. `get_ayurvedic_astrology_analysis` - `src/core/services/ayurvedicAstrologyService.js`
66. `generateLifePatterns` - `src/core/services/lifePatternsService.js`
67. `get_panchang_analysis` - `src/core/services/panchangService.js`
68. `get_muhurta_analysis` - `src/core/services/muhurtaService.js`
69. `calculateAbhijitMuhurta` - `src/core/services/abhijitMuhurtaService.js`
70. `calculateRahukalam` - `src/core/services/rahukalamService.js`
71. `calculateGulikakalam` - `src/core/services/gulikakalamService.js`
72. `calculateCosmicEvents` - `src/core/services/cosmicEventsService.js`
73. `generateEphemerisTable` - `src/core/services/ephemerisService.js`
74. `calculateUpcomingSeasonalEvents` - `src/core/services/seasonalEventsService.js`
75. `calculateUpcomingPlanetaryEvents` - `src/core/services/planetaryEventsService.js`
76. `get_vedic_remedies_info` - `src/core/services/vedicRemediesService.js`
77. `generateKaalSarpDosha` - `src/core/services/kaalSarpDoshaService.js`
78. `generateSadeSatiAnalysis` - `src/core/services/sadeSatiService.js`
79. `get_tarot_reading` - `src/core/services/tarotReadingService.js` (uses: `src/core/services/calculators/tarotReader.js`)
80. `get_iching_reading` - `src/core/services/ichingReadingService.js` (uses: `src/core/services/calculators/ichingReader.js`)
81. `get_palmistry_analysis` - `src/core/services/palmistryService.js` (uses: `src/core/services/calculators/palmistryReader.js`)
82. `show_chinese_flow` - `src/core/services/chineseAstrologyService.js` (uses: `src/core/services/calculators/chineseCalculator.js`)
83. `get_mayan_analysis` - `src/core/services/mayanAstrologyService.js` (uses: `src/core/services/calculators/mayanReader.js`)
84. `get_celtic_analysis` - `src/core/services/celticAstrologyService.js` (uses: `src/core/services/calculators/celticReader.js`)
85. `get_kabbalistic_analysis` - `src/core/services/kabbalisticAstrologyService.js` (uses: `src/core/services/calculators/kabbalisticReader.js`)
86. `get_hellenistic_astrology_analysis` - `src/core/services/hellenisticAstrologyService.js` (uses: `src/core/services/calculators/hellenisticAstrology.js`)
87. `get_horary_reading` - `src/core/services/horaryAstrologyService.js` (uses: `src/core/services/calculators/HoraryCalculator.js`)
88. `get_astrocartography_analysis` - `src/core/services/astrocartographyService.js` (uses: `src/core/services/calculators/astrocartographyReader.js`)
89. `get_hindu_festivals_info` - `src/core/services/hinduFestivalsService.js` (uses: `src/core/services/calculators/hinduFestivals.js`)
90. `get_islamic_astrology_info` - `src/core/services/islamicAstrologyService.js` (uses: `src/core/services/calculators/islamicAstrology.js`)