# 22 Utility Functions Mapping - Complete Count

This document contains the complete list of 22 utility functions that need to be migrated to the `core/utils/` directory, organized by category.

## 📊 Summary Count: 22 Utility Functions Total

### Compatibility Utilities (7 functions):

1. **`compatibilityCheckerUtils.js`** - Dedicated utility for compatibility checking logic
2. **`compatibilityFormatterUtils.js`** - Dedicated utility for compatibility report formatting
3. **`compatibilityScorerUtils.js`** - Dedicated utility for compatibility scoring algorithms
4. **`relationshipInsightsUtils.js`** - Dedicated utility for relationship insights interpretation
5. **`swissEphemerisUtils.js`** - Dedicated utility for Swiss Ephemeris calculations
6. **`synastryEngineUtils.js`** - Dedicated utility for synastry algorithms
7. **`nadiCompatibilityUtils.js`** - Dedicated utility for Nadi compatibility calculations

### Chart Calculation Utilities (8 functions):

8. **`signCalculationsUtils.js`** - Dedicated utility for sign-related calculations
9. **`astrologicalCalculationsUtils.js`** - Dedicated utility for general astrological calculations
10. **`chartGeneratorUtils.js`** - Dedicated utility for general chart generation logic
11. **`chartInterpreterUtils.js`** - Dedicated utility for general chart interpretation logic
12. **`chartSignCalculationsUtils.js`** - Dedicated utility for chart-specific sign calculations
13. **`vedicChartGeneratorUtils.js`** - Dedicated utility for Vedic chart generation
14. **`westernChartGeneratorUtils.js`** - Dedicated utility for Western chart generation
15. **`vedicSignCalculatorUtils.js`** - Dedicated utility for Vedic sign calculations

### Core Astrology Utilities (4 functions):

16. **`vedicCoreUtils.js`** - Dedicated utility for core Vedic calculations
17. **`horoscopeGeneratorUtils.js`** - Dedicated utility for horoscope generation logic
18. **`ageHarmonicAstrologyUtils.js`** - Dedicated utility for age harmonic astrology calculations
19. **`astrologyEngineUtils.js`** - Dedicated utility for astrology engine functions

### Specialized Utilities (3 functions):

20. **`geocodingUtils.js`** - Dedicated utility for geocoding functions
21. **`transitCalculatorUtils.js`** - Dedicated utility for transit calculations
22. **`jaiminiCalculatorUtils.js`** - Dedicated utility for Jaimini calculations

## 📋 Source Files Mapping

Each utility function maps to a source file in the existing codebase:

### Compatibility Utilities Sources:
- `src/services/astrology/compatibility/CompatibilityChecker.js` → `compatibilityCheckerUtils.js`
- `src/services/astrology/compatibility/CompatibilityFormatter.js` → `compatibilityFormatterUtils.js`
- `src/services/astrology/compatibility/CompatibilityScorer.js` → `compatibilityScorerUtils.js`
- `src/services/astrology/compatibility/RelationshipInsightsGenerator.js` → `relationshipInsightsUtils.js`
- `src/services/astrology/compatibility/SwissEphemerisCalculator.js` → `swissEphemerisUtils.js`
- `src/services/astrology/compatibility/SynastryEngine.js` → `synastryEngineUtils.js`
- `src/services/astrology/nadi/NadiCompatibility.js` → `nadiCompatibilityUtils.js`

### Chart Calculation Utilities Sources:
- `src/services/astrology/calculations/SignCalculations.js` → `signCalculationsUtils.js`
- `src/services/astrology/charts/AstrologicalCalculations.js` → `astrologicalCalculationsUtils.js`
- `src/services/astrology/charts/ChartGenerator.js` → `chartGeneratorUtils.js`
- `src/services/astrology/charts/ChartInterpreter.js` → `chartInterpreterUtils.js`
- `src/services/astrology/charts/SignCalculations.js` → `chartSignCalculationsUtils.js`
- `src/services/astrology/charts/VedicChartGenerator.js` → `vedicChartGeneratorUtils.js`
- `src/services/astrology/charts/WesternChartGenerator.js` → `westernChartGeneratorUtils.js`
- `src/services/astrology/vedic/calculators/SignCalculator.js` → `vedicSignCalculatorUtils.js`

### Core Astrology Utilities Sources:
- `src/services/astrology/core/VedicCore.js` → `vedicCoreUtils.js`
- `src/services/astrology/horoscope/HoroscopeGenerator.js` → `horoscopeGeneratorUtils.js`
- `src/services/astrology/ageHarmonicAstrology.js` → `ageHarmonicAstrologyUtils.js`
- `src/services/astrology/astrologyEngine.js` → `astrologyEngineUtils.js`

### Specialized Utilities Sources:
- `src/services/astrology/geocoding/GeocodingService.js` → `geocodingUtils.js`
- `src/services/astrology/vedic/calculators/TransitCalculator.js` → `transitCalculatorUtils.js`
- `src/services/astrology/vedic/calculators/JaiminiCalculator.js` → `jaiminiCalculatorUtils.js`

## 🎯 Migration Notes

**IMPORTANT:** Each utility function must be implemented as an independent utility file with clear separation of concerns. No single file should contain multiple unrelated utility functions.

- **Target Directory:** `core/utils/`
- **Architectural Principle:** One utility function per file
- **Purpose:** Extract reusable calculation logic from services
- **Integration:** Utilities will be imported by core services in the new architecture