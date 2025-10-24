# Epic 2: Multi-System Astrology Engine

## Description
Implement the comprehensive multi-system astrology engine, supporting both calculation-based systems (Vedic, Western, Chinese) and rule-based/interpretive systems (Tarot, Numerology, Palmistry).

## Features Included
- Vedic/Hindu astrology calculations and interpretations
- Western astrology processing (sun/moon/ascendant, transits)
- Chinese astrology analysis (animal signs, elemental analysis)
- Tarot card reading system (single card, three-card spread, Celtic cross) with backend card selection logic, database of card meanings, and LLM for contextual interpretation.
- Numerology calculations (Life Path, Destiny, Expression numbers) with backend algorithms, database of number meanings, and LLM for personalized insights.
- Palmistry analysis integration (text-based input initially, with future image analysis) with database of palmistry interpretations and LLM for personalized insights.
- Nadi astrology (Indian palm leaf readings)
- Other systems (Kabbalistic, Mayan, Celtic, I Ching)

## Business Value
Core value proposition - the actual astrology readings and interpretations that users pay for.

## Acceptance Criteria
- Accurate calculations for each astrology system (Vedic, Western, Chinese)
- Proper interpretation of planetary positions and transits
- Support for birth chart generation
- Compatibility analysis between different charts
- Timely and accurate transit predictions
- Integration with user profile data
- **Tarot**: Accurate random card selection, defined spread structures, and contextual interpretations based on card meanings and user query.
- **Numerology**: Correct calculation of numerological numbers from birth date/name, and personalized interpretations based on number meanings.
- **Palmistry**: Ability to input palm features (text-based initially) and generate personalized interpretations based on palmistry rules.

## Dependencies
- User profile with birth details (date, time, place)
- Accurate calculation libraries or APIs (e.g., Swiss Ephemeris)
- Databases for Tarot card meanings, Numerology interpretations, and Palmistry features.
- AI Twin System (LLM) for contextual interpretations.

## Priority
Critical - Core functionality that drives user value