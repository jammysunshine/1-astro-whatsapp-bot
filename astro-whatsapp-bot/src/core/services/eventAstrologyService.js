const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure (for now)

/**
 * EventAstrologyService - Service for event astrology and auspicious timing analysis
 * Provides comprehensive analysis for timing important life events using Vedic astrology principles
 * including seasonal timing, planetary influences, and muhurta calculations.
 */
class EventAstrologyService extends ServiceTemplate {
  constructor() {
    super('CosmicEventsCalculator');
    this.calculatorPath = '../calculators/CosmicEventsCalculator';    this.serviceName = 'EventAstrologyService';
    logger.info('EventAstrologyService initialized');
  }

  async leventAstrologyCalculation(eventData) {
    try {
      // Generate comprehensive event analysis using calculator
      const analysis = await this._generateEventAnalysis(eventData);
      return analysis;
    } catch (error) {
      logger.error('EventAstrologyService calculation error:', error);
      throw new Error(`Event astrology analysis failed: ${error.message}`);
    }
  }

  formatResult(analysis) {
    return {
      success: true,
      service: 'Event Astrology Analysis',
      timestamp: new Date().toISOString(),
      data: analysis,
      disclaimer: 'Event timing analysis provides guidance based on Vedic astrology principles. Consider multiple factors including personal circumstances, logistics, and professional advice when planning important events.'
    };
  }

  validate(eventData) {
    if (!eventData) {
      throw new Error('Event data is required');
    }

    const { eventType, location } = eventData;

    if (!eventType || typeof eventType !== 'string') {
      throw new Error('Valid event type is required');
    }

    if (!location || typeof location !== 'string') {
      throw new Error('Valid location is required');
    }

    return true;
  }

  /**
   * Get auspicious timing for a specific event type
   * @param {string} eventType - Type of event
   * @param {string} location - Location for analysis
   * @param {string} timeFrame - Time frame (next_month, next_3_months, etc.)
   * @returns {Promise<Object>} Auspicious timing recommendations
   */
  async getAuspiciousTiming(eventType, location, timeFrame = 'next_month') {
    try {
      if (!eventType || !location) {
        throw new Error('Event type and location are required');
      }

      const recommendations = await this._findAuspiciousPeriods(eventType, location, timeFrame);

      return {
        eventType,
        location,
        timeFrame,
        recommendations,
        summary: this._generateTimingSummary(recommendations),
        error: false
      };
    } catch (error) {
      logger.error('EventAstrologyService getAuspiciousTiming error:', error);
      return {
        error: true,
        message: 'Error finding auspicious timing'
      };
    }
  }

  /**
   * Analyze seasonal timing for events
   * @param {string} eventType - Type of event
   * @param {number} year - Year for analysis (optional, defaults to current)
   * @returns {Promise<Object>} Seasonal timing analysis
   */
  async analyzeSeasonalTiming(eventType, year = null) {
    try {
      const analysisYear = year || new Date().getFullYear();

      const seasonalAnalysis = this._analyzeSeasonalInfluences(eventType, analysisYear);

      return {
        eventType,
        year: analysisYear,
        seasonalAnalysis,
        bestSeasons: this._identifyBestSeasons(seasonalAnalysis),
        recommendations: this._generateSeasonalRecommendations(seasonalAnalysis),
        error: false
      };
    } catch (error) {
      logger.error('EventAstrologyService analyzeSeasonalTiming error:', error);
      return {
        error: true,
        message: 'Error analyzing seasonal timing'
      };
    }
  }

  /**
   * Get personalized event timing based on birth chart
   * @param {Object} birthData - Birth data for personalized analysis
   * @param {string} eventType - Type of event
   * @param {string} location - Location for the event
   * @returns {Promise<Object>} Personalized event timing analysis
   */
  async getPersonalizedTiming(birthData, eventType, location) {
    try {
      this._validateBirthData(birthData);

      const personalAnalysis = await this._analyzePersonalTiming(birthData, eventType, location);
      const generalTiming = await this.getAuspiciousTiming(eventType, location);

      return {
        eventType,
        location,
        personalAnalysis,
        generalTiming: generalTiming.recommendations,
        combinedRecommendations: this._combinePersonalAndGeneral(personalAnalysis, generalTiming.recommendations),
        error: false
      };
    } catch (error) {
      logger.error('EventAstrologyService getPersonalizedTiming error:', error);
      return {
        error: true,
        message: 'Error generating personalized timing analysis'
      };
    }
  }

  /**
   * Analyze planetary influences for event timing
   * @param {string} eventType - Type of event
   * @param {string} startDate - Start date for analysis
   * @param {string} endDate - End date for analysis
   * @param {string} location - Location
   * @returns {Promise<Object>} Planetary influence analysis
   */
  async analyzePlanetaryInfluences(eventType, startDate, endDate, location) {
    try {
      if (!eventType || !startDate || !endDate || !location) {
        throw new Error('Event type, date range, and location are required');
      }

      const planetaryAnalysis = await this._analyzePlanetaryFactors(eventType, startDate, endDate, location);

      return {
        eventType,
        dateRange: { start: startDate, end: endDate },
        location,
        planetaryAnalysis,
        favorablePeriods: this._identifyFavorablePlanetaryPeriods(planetaryAnalysis),
        challengingPeriods: this._identifyChallengingPlanetaryPeriods(planetaryAnalysis),
        error: false
      };
    } catch (error) {
      logger.error('EventAstrologyService analyzePlanetaryInfluences error:', error);
      return {
        error: true,
        message: 'Error analyzing planetary influences'
      };
    }
  }

  /**
   * Get event compatibility analysis
   * @param {Array} eventTypes - Array of event types to compare
   * @param {string} date - Date for analysis
   * @param {string} location - Location
   * @returns {Promise<Object>} Event compatibility analysis
   */
  async getEventCompatibility(eventTypes, date, location) {
    try {
      if (!Array.isArray(eventTypes) || eventTypes.length === 0 || !date || !location) {
        throw new Error('Valid event types array, date, and location are required');
      }

      const compatibilityAnalysis = {};

      for (const eventType of eventTypes) {
        const analysis = await this.execute({
          eventType,
          preferredDate: date,
          location
        });
        compatibilityAnalysis[eventType] = {
          rating: analysis.eventAstrology?.overallRating || 'Unknown',
          favorable: analysis.eventAstrology?.favorableFactors || [],
          challenging: analysis.eventAstrology?.challengingFactors || []
        };
      }

      return {
        date,
        location,
        eventTypes,
        compatibilityAnalysis,
        bestEvent: this._findBestEventForDate(compatibilityAnalysis),
        recommendations: this._generateCompatibilityRecommendations(compatibilityAnalysis),
        error: false
      };
    } catch (error) {
      logger.error('EventAstrologyService getEventCompatibility error:', error);
      return {
        error: true,
        message: 'Error analyzing event compatibility'
      };
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Validate input data
   * @param {Object} input - Input data to validate
   * @private
   */
  _validateInput(input) {
    if (!input) {
      throw new Error('Event data is required');
    }

    const { eventType, location } = input;

    if (!eventType || typeof eventType !== 'string') {
      throw new Error('Valid event type is required');
    }

    if (!location || typeof location !== 'string') {
      throw new Error('Valid location is required');
    }

    // Validate event type
    const validEventTypes = [
      'wedding', 'marriage', 'engagement', 'graduation', 'business_launch',
      'housewarming', 'surgery', 'travel', 'education', 'spiritual_ceremony',
      'birthday_party', 'conference', 'meeting', 'contract_signing'
    ];

    if (!validEventTypes.includes(eventType.toLowerCase())) {
      throw new Error(`Invalid event type. Valid types: ${validEventTypes.join(', ')}`);
    }
  }

  /**
   * Validate birth data for personalized analysis
   * @param {Object} birthData - Birth data to validate
   * @private
   */
  _validateBirthData(birthData) {
    if (!birthData) {
      throw new Error('Birth data is required for personalized analysis');
    }

    const { birthDate, birthTime, birthPlace } = birthData;

    if (!birthDate || !birthTime || !birthPlace) {
      throw new Error('Complete birth data (date, time, place) is required');
    }
  }

  /**
   * Generate comprehensive event analysis
   * @param {Object} eventData - Event data
   * @returns {Promise<Object>} Comprehensive analysis
   * @private
   */
  async _generateEventAnalysis(eventData) {
    const { eventType, preferredDate, location, birthData } = eventData;

    // Get muhurta analysis
    const muhurtaAnalysis = await this.muhurtaCalculator.generateMuhurta({
      activity: this._mapEventToActivity(eventType),
      date: preferredDate || new Date().toISOString().split('T')[0],
      location,
      timeWindow: 'full_day'
    });

    // Get seasonal analysis
    const seasonalAnalysis = this._analyzeSeasonalInfluences(eventType);

    // Get planetary analysis if birth data provided
    let personalAnalysis = null;
    if (birthData) {
      personalAnalysis = await this._analyzePersonalTiming(birthData, eventType, location);
    }

    return {
      eventType,
      preferredDate,
      location,
      muhurtaAnalysis,
      seasonalAnalysis,
      personalAnalysis,
      overallRating: this._calculateOverallRating(muhurtaAnalysis, seasonalAnalysis, personalAnalysis),
      favorableFactors: this._compileFavorableFactors(muhurtaAnalysis, seasonalAnalysis, personalAnalysis),
      challengingFactors: this._compileChallengingFactors(muhurtaAnalysis, seasonalAnalysis, personalAnalysis),
      recommendations: this._generateEventRecommendations(muhurtaAnalysis, seasonalAnalysis, personalAnalysis)
    };
  }

  /**
   * Find auspicious periods for event timing
   * @param {string} eventType - Event type
   * @param {string} location - Location
   * @param {string} timeFrame - Time frame
   * @returns {Promise<Array>} Auspicious periods
   * @private
   */
  async _findAuspiciousPeriods(eventType, location, timeFrame) {
    const periods = [];
    const now = new Date();
    let daysToCheck = 30; // Default to next month

    switch (timeFrame) {
    case 'next_week': daysToCheck = 7; break;
    case 'next_month': daysToCheck = 30; break;
    case 'next_3_months': daysToCheck = 90; break;
    case 'next_6_months': daysToCheck = 180; break;
    }

    for (let i = 0; i < daysToCheck; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() + i);

      const dateStr = `${checkDate.getDate().toString().padStart(2, '0')}/${(checkDate.getMonth() + 1).toString().padStart(2, '0')}/${checkDate.getFullYear()}`;

      try {
        const analysis = await this.muhurtaCalculator.generateMuhurta({
          activity: this._mapEventToActivity(eventType),
          date: dateStr,
          location,
          timeWindow: 'full_day'
        });

        if (analysis.overallRating === 'excellent' || analysis.overallRating === 'good') {
          periods.push({
            date: dateStr,
            rating: analysis.overallRating,
            bestTimes: analysis.auspiciousPeriods || [],
            factors: analysis.auspiciousFactors || []
          });
        }
      } catch (error) {
        logger.warn(`Error checking date ${dateStr}:`, error.message);
      }
    }

    return periods.slice(0, 10); // Return top 10 auspicious periods
  }

  /**
   * Analyze seasonal influences for events
   * @param {string} eventType - Event type
   * @param {number} year - Year for analysis
   * @returns {Object} Seasonal analysis
   * @private
   */
  _analyzeSeasonalInfluences(eventType, year = null) {
    const analysisYear = year || new Date().getFullYear();
    const seasons = {
      spring: { months: [3, 4, 5], energy: 'growth', suitable: ['wedding', 'graduation', 'business_launch'] },
      summer: { months: [6, 7, 8], energy: 'celebration', suitable: ['wedding', 'birthday_party', 'conference'] },
      autumn: { months: [9, 10, 11], energy: 'harvest', suitable: ['business_launch', 'contract_signing', 'education'] },
      winter: { months: [12, 1, 2], energy: 'reflection', suitable: ['spiritual_ceremony', 'planning', 'education'] }
    };

    const eventSeason = this._findBestSeasonForEvent(eventType, seasons);
    const currentMonth = new Date().getMonth() + 1;
    const isCurrentSeason = seasons[eventSeason].months.includes(currentMonth);

    return {
      bestSeason: eventSeason,
      seasonalEnergy: seasons[eventSeason].energy,
      suitableEvents: seasons[eventSeason].suitable,
      isCurrentSeason,
      seasonalFactors: this._getSeasonalFactors(eventSeason, eventType),
      timingWindows: this._getSeasonalTimingWindows(eventSeason, analysisYear)
    };
  }

  /**
   * Analyze personal timing based on birth chart
   * @param {Object} birthData - Birth data
   * @param {string} eventType - Event type
   * @param {string} location - Location
   * @returns {Promise<Object>} Personal timing analysis
   * @private
   */
  async _analyzePersonalTiming(birthData, eventType, location) {
    // This would integrate with transit analysis services
    // For now, return basic structure
    return {
      personalFactors: ['Birth chart alignment', 'Current transits', 'Progressed planets'],
      favorableTransits: ['Jupiter aspects', 'Venus influences'],
      challengingTransits: ['Saturn aspects', 'Mars squares'],
      personalRating: 'good',
      recommendations: ['Align with Jupiter periods', 'Avoid Saturn transits']
    };
  }

  /**
   * Analyze planetary factors for date range
   * @param {string} eventType - Event type
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {string} location - Location
   * @returns {Promise<Object>} Planetary analysis
   * @private
   */
  async _analyzePlanetaryFactors(eventType, startDate, endDate, location) {
    // This would analyze planetary positions over the date range
    // For now, return basic structure
    return {
      favorablePlanets: ['Jupiter', 'Venus'],
      challengingPlanets: ['Saturn', 'Mars'],
      planetaryPeriods: [
        { period: 'Jupiter beneficial', dates: 'Various dates', influence: 'Positive' },
        { period: 'Venus harmony', dates: 'Various dates', influence: 'Harmonious' }
      ],
      overallPlanetaryRating: 'mixed'
    };
  }

  /**
   * Map event type to muhurta activity
   * @param {string} eventType - Event type
   * @returns {string} Mapped activity
   * @private
   */
  _mapEventToActivity(eventType) {
    const mapping = {
      wedding: 'marriage',
      marriage: 'marriage',
      engagement: 'marriage',
      graduation: 'education',
      business_launch: 'business',
      housewarming: 'housewarming',
      surgery: 'health',
      travel: 'travel',
      education: 'education',
      spiritual_ceremony: 'spiritual',
      birthday_party: 'general',
      conference: 'business',
      meeting: 'business',
      contract_signing: 'business'
    };

    return mapping[eventType.toLowerCase()] || 'general';
  }

  /**
   * Find best season for event type
   * @param {string} eventType - Event type
   * @param {Object} seasons - Seasons data
   * @returns {string} Best season
   * @private
   */
  _findBestSeasonForEvent(eventType, seasons) {
    for (const [season, data] of Object.entries(seasons)) {
      if (data.suitable.includes(eventType.toLowerCase())) {
        return season;
      }
    }
    return 'spring'; // Default
  }

  /**
   * Get seasonal factors for event
   * @param {string} season - Season
   * @param {string} eventType - Event type
   * @returns {Array} Seasonal factors
   * @private
   */
  _getSeasonalFactors(season, eventType) {
    const factors = {
      spring: ['Growth energy', 'New beginnings', 'Fresh starts'],
      summer: ['Celebration energy', 'Social gatherings', 'Warm atmosphere'],
      autumn: ['Harvest energy', 'Completion', 'Abundance'],
      winter: ['Reflection energy', 'Planning', 'Inner focus']
    };

    return factors[season] || [];
  }

  /**
   * Get seasonal timing windows
   * @param {string} season - Season
   * @param {number} year - Year
   * @returns {Array} Timing windows
   * @private
   */
  _getSeasonalTimingWindows(season, year) {
    const windows = {
      spring: [`March ${year}`, `April ${year}`, `May ${year}`],
      summer: [`June ${year}`, `July ${year}`, `August ${year}`],
      autumn: [`September ${year}`, `October ${year}`, `November ${year}`],
      winter: [`December ${year}`, `January ${year + 1}`, `February ${year + 1}`]
    };

    return windows[season] || [];
  }

  /**
   * Calculate overall rating
   * @param {Object} muhurta - Muhurta analysis
   * @param {Object} seasonal - Seasonal analysis
   * @param {Object} personal - Personal analysis
   * @returns {string} Overall rating
   * @private
   */
  _calculateOverallRating(muhurta, seasonal, personal) {
    const ratings = [muhurta?.overallRating];

    if (seasonal?.isCurrentSeason) { ratings.push('good'); }
    if (personal?.personalRating) { ratings.push(personal.personalRating); }

    if (ratings.includes('excellent')) { return 'excellent'; }
    if (ratings.includes('good')) { return 'good'; }
    if (ratings.includes('fair')) { return 'fair'; }
    return 'neutral';
  }

  /**
   * Compile favorable factors
   * @param {Object} muhurta - Muhurta analysis
   * @param {Object} seasonal - Seasonal analysis
   * @param {Object} personal - Personal analysis
   * @returns {Array} Favorable factors
   * @private
   */
  _compileFavorableFactors(muhurta, seasonal, personal) {
    const factors = [];

    if (muhurta?.auspiciousFactors) { factors.push(...muhurta.auspiciousFactors); }
    if (seasonal?.seasonalFactors) { factors.push(...seasonal.seasonalFactors); }
    if (personal?.favorableTransits) { factors.push(...personal.favorableTransits); }

    return [...new Set(factors)]; // Remove duplicates
  }

  /**
   * Compile challenging factors
   * @param {Object} muhurta - Muhurta analysis
   * @param {Object} seasonal - Seasonal analysis
   * @param {Object} personal - Personal analysis
   * @returns {Array} Challenging factors
   * @private
   */
  _compileChallengingFactors(muhurta, seasonal, personal) {
    const factors = [];

    if (muhurta?.inauspiciousFactors) { factors.push(...muhurta.inauspiciousFactors); }
    if (personal?.challengingTransits) { factors.push(...personal.challengingTransits); }

    return [...new Set(factors)]; // Remove duplicates
  }

  /**
   * Generate event recommendations
   * @param {Object} muhurta - Muhurta analysis
   * @param {Object} seasonal - Seasonal analysis
   * @param {Object} personal - Personal analysis
   * @returns {Array} Recommendations
   * @private
   */
  _generateEventRecommendations(muhurta, seasonal, personal) {
    const recommendations = [];

    if (muhurta?.recommendations) { recommendations.push(...muhurta.recommendations); }
    if (seasonal?.bestSeason) {
      recommendations.push(`Consider ${seasonal.bestSeason} season for optimal energy alignment`);
    }
    if (personal?.recommendations) { recommendations.push(...personal.recommendations); }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Generate timing summary
   * @param {Array} recommendations - Timing recommendations
   * @returns {string} Summary text
   * @private
   */
  _generateTimingSummary(recommendations) {
    if (!recommendations || recommendations.length === 0) {
      return 'No highly auspicious periods found in the specified timeframe.';
    }

    const excellentCount = recommendations.filter(r => r.rating === 'excellent').length;
    const goodCount = recommendations.filter(r => r.rating === 'good').length;

    return `Found ${excellentCount} excellent and ${goodCount} good periods for your event timing.`;
  }

  /**
   * Identify best seasons
   * @param {Object} seasonalAnalysis - Seasonal analysis
   * @returns {Array} Best seasons
   * @private
   */
  _identifyBestSeasons(seasonalAnalysis) {
    // This would analyze the seasonal analysis to identify best seasons
    return [seasonalAnalysis.bestSeason];
  }

  /**
   * Generate seasonal recommendations
   * @param {Object} seasonalAnalysis - Seasonal analysis
   * @returns {Array} Recommendations
   * @private
  _generateSeasonalRecommendations(seasonalAnalysis) {
    return [
      `Plan for ${seasonalAnalysis.bestSeason} season when ${seasonalAnalysis.seasonalEnergy} energy supports your event`,
      `Take advantage of ${seasonalAnalysis.timingWindows.join(', ')} for optimal timing`
    ];
  }

  /**
   * Combine personal and general recommendations
   * @param {Object} personal - Personal analysis
   * @param {Array} general - General recommendations
   * @returns {Array} Combined recommendations
   * @private
   */
  _combinePersonalAndGeneral(personal, general) {
    const combined = [...general];

    if (personal?.recommendations) {
      combined.push(...personal.recommendations);
    }

    return [...new Set(combined)]; // Remove duplicates
  }

  /**
   * Identify favorable planetary periods
   * @param {Object} planetaryAnalysis - Planetary analysis
   * @returns {Array} Favorable periods
   * @private
   */
  _identifyFavorablePlanetaryPeriods(planetaryAnalysis) {
    return planetaryAnalysis?.planetaryPeriods?.filter(p => p.influence === 'Positive') || [];
  }

  /**
   * Identify challenging planetary periods
   * @param {Object} planetaryAnalysis - Planetary analysis
   * @returns {Array} Challenging periods
   * @private
   */
  _identifyChallengingPlanetaryPeriods(planetaryAnalysis) {
    return planetaryAnalysis?.planetaryPeriods?.filter(p => p.influence === 'Challenging') || [];
  }

  /**
   * Find best event for date
   * @param {Object} compatibilityAnalysis - Compatibility analysis
   * @returns {string} Best event
   * @private
   */
  _findBestEventForDate(compatibilityAnalysis) {
    let bestEvent = null;
    let bestRating = 'neutral';

    const ratingOrder = { excellent: 4, good: 3, fair: 2, neutral: 1 };

    for (const [event, analysis] of Object.entries(compatibilityAnalysis)) {
      const { rating } = analysis;
      if (ratingOrder[rating] > ratingOrder[bestRating]) {
        bestRating = rating;
        bestEvent = event;
      }
    }

    return bestEvent;
  }

  /**
   * Generate compatibility recommendations
   * @param {Object} compatibilityAnalysis - Compatibility analysis
   * @returns {Array} Recommendations
   * @private
   */
  _generateCompatibilityRecommendations(compatibilityAnalysis) {
    const recommendations = [];
    const bestEvent = this._findBestEventForDate(compatibilityAnalysis);

    if (bestEvent) {
      recommendations.push(`${bestEvent.replace('_', ' ')} appears most favorable for this date`);
    }

    const excellentEvents = Object.entries(compatibilityAnalysis)
      .filter(([_, analysis]) => analysis.rating === 'excellent')
      .map(([event, _]) => event);

    if (excellentEvents.length > 0) {
      recommendations.push(`Excellent timing for: ${excellentEvents.join(', ')}`);
    }

    return recommendations;
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['execute', 'getAuspiciousTiming', 'analyzeEventCompatibility', 'getSeasonalGuidance', 'getPersonalizedTiming'],
      dependencies: ['MuhurtaCalculator']
    };
  }
  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          // Add service-specific features here
        },
        supportedAnalyses: [
          // Add supported analyses here
        ]
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = EventAstrologyService;
