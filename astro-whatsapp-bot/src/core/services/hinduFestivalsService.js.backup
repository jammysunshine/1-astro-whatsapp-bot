const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure
const { hinduFestivals } = require('../../services/astrology/hinduFestivals');

class HinduFestivalsService extends ServiceTemplate {
  constructor() {
    super(new hinduFestivals());
    this.serviceName = 'HinduFestivalsService';
    logger.info('HinduFestivalsService initialized');
  }

  async processCalculation(festivalParams) {
    try {
      // Validate input
      this.validate(festivalParams);

      const { timeframe = 'upcoming', region } = festivalParams;

      // Get festival data from HinduFestivals calculator
      const festivalData = this.calculator.getFestivals(timeframe, region);

      // Enhance with additional analysis
      const enhancedData = {
        festivals: this.enhanceFestivalData(festivalData.festivals || festivalData),
        auspiciousTimings: this.getAuspiciousTimings(festivalData),
        regionalVariations: this.getRegionalVariations(festivalData, region),
        astrologicalSignificance: this.analyzeAstrologicalSignificance(festivalData),
        recommendations: this.generateFestivalRecommendations(festivalData)
      };

      return enhancedData;
    } catch (error) {
      logger.error('HinduFestivalsService calculation error:', error);
      throw new Error(`Festival information retrieval failed: ${error.message}`);
    }
  }

  /**
   * Get specific festival details
   * @param {Object} params - Query parameters
   * @param {string} params.festivalName - Name of the festival
   * @param {string} params.region - Regional preference (optional)
   * @returns {Object} Detailed festival information
   */
  async getSpecificFestivalDetails(params) {
    try {
      this.validateParams(params, ['festivalName']);
      
      const { festivalName, region } = params;
      
      // Get specific festival from calculator
      const festivalInfo = this.calculator.getSpecificFestival(festivalName, region);
      
      if (!festivalInfo) {
        return {
          success: false,
          error: `Festival '${festivalName}' not found`,
          metadata: {
            calculationType: 'specific_festival_details',
            timestamp: new Date().toISOString()
          }
        };
      }
      
      // Enhance with additional information
      const enhancedDetails = {
        ...festivalInfo,
        astrologicalTiming: this.getAstrologicalTiming(festivalInfo),
        spiritualSignificance: this.getSpiritualSignificance(festivalInfo),
        celebrationGuide: this.getCelebrationGuide(festivalInfo),
        regionalCustoms: this.getRegionalCustoms(festivalInfo, region),
        relatedFestivals: this.getRelatedFestivals(festivalInfo),
        mantrasAndPrayers: this.getMantrasAndPrayers(festivalInfo)
      };
      
      return {
        success: true,
        data: enhancedDetails,
        metadata: {
          calculationType: 'specific_festival_details',
          timestamp: new Date().toISOString(),
          festivalName,
          region: region || 'general'
        }
      };
    } catch (error) {
      logger.error('❌ Error in getSpecificFestivalDetails:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'specific_festival_details',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get upcoming festivals with timing
   * @param {Object} params - Query parameters
   * @param {number} params.days - Number of days ahead to look (default: 30)
   * @param {string} params.region - Regional preference (optional)
   * @returns {Object} Upcoming festivals information
   */
  async getUpcomingFestivals(params) {
    try {
      const { days = 30, region } = params;
      
      // Get upcoming festivals from calculator
      const upcomingData = this.calculator.getUpcomingFestivals(days, region);
      
      // Enhance with additional timing analysis
      const enhancedUpcoming = {
        festivals: upcomingData.map(festival => ({
          ...festival,
          daysUntil: this.calculateDaysUntil(festival.date),
          moonPhase: this.getMoonPhaseForFestival(festival),
          auspiciousPeriod: this.getAuspiciousPeriod(festival),
          preparationTime: this.getPreparationTime(festival),
          astrologicalInfluence: this.getAstrologicalInfluence(festival)
        })),
        summary: this.generateUpcomingSummary(upcomingData),
        priorityFestivals: this.identifyPriorityFestivals(upcomingData),
        preparationGuide: this.generatePreparationGuide(upcomingData)
      };
      
      return {
        success: true,
        data: enhancedUpcoming,
        metadata: {
          calculationType: 'upcoming_festivals',
          timestamp: new Date().toISOString(),
          daysAhead: days,
          region: region || 'general',
          festivalCount: enhancedUpcoming.festivals.length
        }
      };
    } catch (error) {
      logger.error('❌ Error in getUpcomingFestivals:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'upcoming_festivals',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get festival calendar for specific period
   * @param {Object} params - Query parameters
   * @param {string} params.month - Month (1-12)
   * @param {number} params.year - Year
   * @param {string} params.region - Regional preference (optional)
   * @returns {Object} Monthly festival calendar
   */
  async getFestivalCalendar(params) {
    try {
      this.validateParams(params, ['month', 'year']);
      
      const { month, year, region } = params;
      
      // Get monthly calendar from calculator
      const calendarData = this.calculator.getMonthlyCalendar(month, year, region);
      
      // Enhance with additional calendar features
      const enhancedCalendar = {
        month: calendarData.month,
        year: calendarData.year,
        festivals: this.enhanceCalendarFestivals(calendarData.festivals),
        auspiciousDays: this.getAuspiciousDays(calendarData),
        inauspiciousTimes: this.getInauspiciousTimes(calendarData),
        panchangData: this.getPanchangData(calendarData),
        regionalObservances: this.getRegionalObservances(calendarData, region),
        monthlyThemes: this.getMonthlyThemes(calendarData),
        recommendations: this.getMonthlyRecommendations(calendarData)
      };
      
      return {
        success: true,
        data: enhancedCalendar,
        metadata: {
          calculationType: 'festival_calendar',
          timestamp: new Date().toISOString(),
          month,
          year,
          region: region || 'general'
        }
      };
    } catch (error) {
      logger.error('❌ Error in getFestivalCalendar:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'festival_calendar',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get regional festival variations
   * @param {Object} params - Query parameters
   * @param {string} params.festivalName - Festival name (optional)
   * @param {string} params.region - Region to focus on
   * @returns {Object} Regional variations information
   */
  async getRegionalVariations(params) {
    try {
      const { festivalName, region } = params;
      
      // Get regional data from calculator
      const regionalData = this.calculator.getRegionalVariations(festivalName, region);
      
      // Enhance with detailed analysis
      const enhancedRegional = {
        region: region,
        baseFestival: festivalName,
        variations: regionalData.map(variation => ({
          ...variation,
          uniqueCustoms: this.getUniqueCustoms(variation),
          localDeities: this.getLocalDeities(variation),
          specialFoods: this.getSpecialFoods(variation),
          timingDifferences: this.getTimingDifferences(variation),
          culturalSignificance: this.getCulturalSignificance(variation)
        })),
        comparison: this.generateRegionalComparison(regionalData),
        recommendations: this.getRegionalRecommendations(regionalData)
      };
      
      return {
        success: true,
        data: enhancedRegional,
        metadata: {
          calculationType: 'regional_variations',
          timestamp: new Date().toISOString(),
          region,
          festivalName: festivalName || 'all_festivals'
        }
      };
    } catch (error) {
      logger.error('❌ Error in getRegionalVariations:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'regional_variations',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Helper methods for enhancing festival data
  enhanceFestivalData(festivals) {
    return festivals.map(festival => ({
      ...festival,
      astrologicalSignificance: this.getFestivalAstrology(festival),
      spiritualLevel: this.getSpiritualLevel(festival),
      celebrationIntensity: this.getCelebrationIntensity(festival),
      familyInvolvement: this.getFamilyInvolvementLevel(festival),
      communityAspect: this.getCommunityAspect(festival)
    }));
  }

  getAuspiciousTimings(festivalData) {
    const timings = [];
    
    // Extract auspicious timings from festival data
    if (festivalData.festivals) {
      festivalData.festivals.forEach(festival => {
        if (festival.auspiciousTimings) {
          timings.push({
            festival: festival.name,
            timings: festival.auspiciousTimings,
            significance: this.getTimingSignificance(festival.auspiciousTimings)
          });
        }
      });
    }
    
    return timings;
  }

  getRegionalVariations(festivalData, region) {
    // Implementation would extract regional variations
    return {
      currentRegion: region || 'general',
      availableRegions: ['North India', 'South India', 'East India', 'West India', 'International'],
      variations: this.extractRegionalVariations(festivalData, region)
    };
  }

  analyzeAstrologicalSignificance(festivalData) {
    const significance = {};
    
    if (festivalData.festivals) {
      festivalData.festivals.forEach(festival => {
        significance[festival.name] = {
          planetaryPositions: this.getPlanetaryPositions(festival),
          lunarPhase: this.getLunarPhase(festival),
          nakshatra: this.getNakshatra(festival),
          yoga: this.getYoga(festival),
          karana: this.getKarana(festival)
        };
      });
    }
    
    return significance;
  }

  generateFestivalRecommendations(festivalData) {
    const recommendations = [];
    
    // General recommendations for festival participation
    recommendations.push({
      category: 'spiritual_preparation',
      advice: 'Begin spiritual preparation 3-4 days before major festivals through prayer and meditation',
      priority: 'high'
    });
    
    recommendations.push({
      category: 'family_participation',
      advice: 'Involve family members in festival preparations to strengthen bonds and traditions',
      priority: 'medium'
    });
    
    recommendations.push({
      category: 'cultural_preservation',
      advice: 'Document and preserve family traditions associated with festivals for future generations',
      priority: 'medium'
    });
    
    return recommendations;
  }

  getAstrologicalTiming(festivalInfo) {
    return {
      moonPhase: festivalInfo.moonPhase || 'Not specified',
      nakshatra: festivalInfo.nakshatra || 'Not specified',
      tithi: festivalInfo.tithi || 'Not specified',
      yoga: festivalInfo.yoga || 'Not specified',
      karana: festivalInfo.karana || 'Not specified',
      planetaryPositions: festivalInfo.planetaryPositions || {},
      auspiciousPeriod: festivalInfo.auspiciousPeriod || 'Not specified'
    };
  }

  getSpiritualSignificance(festivalInfo) {
    return {
      coreMeaning: festivalInfo.significance || 'Spiritual significance not specified',
      deities: festivalInfo.deities || [],
      spiritualBenefits: this.getSpiritualBenefits(festivalInfo),
      karmicImplications: this.getKarmicImplications(festivalInfo),
      meditationFocus: this.getMeditationFocus(festivalInfo)
    };
  }

  getCelebrationGuide(festivalInfo) {
    return {
      preparationSteps: this.getPreparationSteps(festivalInfo),
      ritualSequence: festivalInfo.rituals || [],
      essentialItems: this.getEssentialItems(festivalInfo),
      timingGuidelines: this.getTimingGuidelines(festivalInfo),
      safetyConsiderations: this.getSafetyConsiderations(festivalInfo)
    };
  }

  getRegionalCustoms(festivalInfo, region) {
    // Implementation would provide region-specific customs
    return {
      currentRegion: region || 'general',
      localVariations: this.extractLocalVariations(festivalInfo, region),
      specialFoods: this.getRegionalFoods(festivalInfo, region),
      uniquePractices: this.getUniquePractices(festivalInfo, region)
    };
  }

  getRelatedFestivals(festivalInfo) {
    // Implementation would find related festivals
    return {
      sameSeason: this.getSameSeasonFestivals(festivalInfo),
      sameDeities: this.getSameDeityFestivals(festivalInfo),
      similarThemes: this.getSimilarThemeFestivals(festivalInfo)
    };
  }

  getMantrasAndPrayers(festivalInfo) {
    return {
      mainMantras: this.getMainMantras(festivalInfo),
      prayers: this.getPrayers(festivalInfo),
      chants: this.getChants(festivalInfo),
      meditationPractices: this.getMeditationPractices(festivalInfo)
    };
  }

  calculateDaysUntil(festivalDate) {
    const today = new Date();
    const festival = new Date(festivalDate);
    const diffTime = festival - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getMoonPhaseForFestival(festival) {
    // Implementation would calculate moon phase
    return {
      phase: 'Full Moon', // Example
      significance: 'Maximum spiritual energy',
      recommendations: 'Ideal for spiritual practices and meditation'
    };
  }

  getAuspiciousPeriod(festival) {
    return {
      startTime: festival.auspiciousStart || 'Sunrise',
      endTime: festival.auspiciousEnd || 'Sunset',
      peakTime: festival.peakTime || 'Noon',
      significance: 'Period of maximum divine blessings'
    };
  }

  getPreparationTime(festival) {
    return {
      daysNeeded: festival.preparationDays || 3,
      keyActivities: this.getPreparationActivities(festival),
      shoppingList: this.getShoppingList(festival)
    };
  }

  getAstrologicalInfluence(festival) {
    return {
      rulingPlanets: this.getRulingPlanets(festival),
      zodiacInfluence: this.getZodiacInfluence(festival),
      elementalBalance: this.getElementalBalance(festival),
      energyLevel: this.getEnergyLevel(festival)
    };
  }

  generateUpcomingSummary(upcomingData) {
    return {
      totalFestivals: upcomingData.length,
      majorFestivals: upcomingData.filter(f => f.importance === 'major').length,
      minorFestivals: upcomingData.filter(f => f.importance === 'minor').length,
      nextFestival: upcomingData[0]?.name || 'None',
      busiestWeek: this.getBusiestWeek(upcomingData),
      spiritualThemes: this.getSpiritualThemes(upcomingData)
    };
  }

  identifyPriorityFestivals(upcomingData) {
    return upcomingData
      .filter(f => f.importance === 'major' || f.spiritualSignificance === 'high')
      .slice(0, 5)
      .map(f => ({
        name: f.name,
        date: f.date,
        importance: f.importance,
        preparationNeeded: f.preparationDays || 3
      }));
  }

  generatePreparationGuide(upcomingData) {
    return {
      immediateActions: this.getImmediateActions(upcomingData),
      weeklyPreparation: this.getWeeklyPreparation(upcomingData),
      shoppingChecklist: this.getShoppingChecklist(upcomingData),
      spiritualPreparation: this.getSpiritualPreparation(upcomingData)
    };
  }

  enhanceCalendarFestivals(festivals) {
    return festivals.map(festival => ({
      ...festival,
      weekDay: this.getWeekDay(festival.date),
      astrologicalDay: this.getAstrologicalDay(festival.date),
      celebrationType: this.getCelebrationType(festival),
      participationLevel: this.getParticipationLevel(festival)
    }));
  }

  getAuspiciousDays(calendarData) {
    // Implementation would identify auspicious days
    return calendarData.festivals?.filter(f => f.auspiciousness === 'high') || [];
  }

  getInauspiciousTimes(calendarData) {
    // Implementation would identify inauspicious times
    return {
      rahukalam: this.getRahukalamTimes(calendarData),
      yamaganda: this.getYamagandaTimes(calendarData),
      gulikakalam: this.getGulikakalamTimes(calendarData)
    };
  }

  getPanchangData(calendarData) {
    return {
      tithi: this.getTithiData(calendarData),
      nakshatra: this.getNakshatraData(calendarData),
      yoga: this.getYogaData(calendarData),
      karana: this.getKaranaData(calendarData)
    };
  }

  getRegionalObservances(calendarData, region) {
    return {
      region: region || 'general',
      localFestivals: this.getLocalFestivals(calendarData, region),
      specialCustoms: this.getSpecialCustoms(calendarData, region),
      traditionalPractices: this.getTraditionalPractices(calendarData, region)
    };
  }

  getMonthlyThemes(calendarData) {
    return {
      spiritualTheme: this.getSpiritualTheme(calendarData),
      culturalTheme: this.getCulturalTheme(calendarData),
      agriculturalTheme: this.getAgriculturalTheme(calendarData),
      planetaryTheme: this.getPlanetaryTheme(calendarData)
    };
  }

  getMonthlyRecommendations(calendarData) {
    return {
      spiritualFocus: this.getSpiritualFocus(calendarData),
      familyActivities: this.getFamilyActivities(calendarData),
      communityService: this.getCommunityService(calendarData),
      personalGrowth: this.getPersonalGrowth(calendarData)
    };
  }

  // Additional helper methods would be implemented here
  // For brevity, I'm including placeholder implementations
  
  getFestivalAstrology(festival) { return festival.astrology || {}; }
  getSpiritualLevel(festival) { return festival.spiritualLevel || 'moderate'; }
  getCelebrationIntensity(festival) { return festival.intensity || 'moderate'; }
  getFamilyInvolvementLevel(festival) { return festival.familyInvolvement || 'medium'; }
  getCommunityAspect(festival) { return festival.communityAspect || 'local'; }
  getTimingSignificance(timings) { return 'Auspicious for spiritual activities'; }
  extractRegionalVariations(data, region) { return data.variations || []; }
  getPlanetaryPositions(festival) { return festival.planets || {}; }
  getLunarPhase(festival) { return festival.moonPhase || 'Not specified'; }
  getNakshatra(festival) { return festival.nakshatra || 'Not specified'; }
  getYoga(festival) { return festival.yoga || 'Not specified'; }
  getKarana(festival) { return festival.karana || 'Not specified'; }
  getSpiritualBenefits(festival) { return festival.benefits || []; }
  getKarmicImplications(festival) { return festival.karma || 'Spiritual growth'; }
  getMeditationFocus(festival) { return festival.meditation || 'Peace and harmony'; }
  getPreparationSteps(festival) { return festival.preparation || []; }
  getEssentialItems(festival) { return festival.items || []; }
  getTimingGuidelines(festival) { return festival.timing || {}; }
  getSafetyConsiderations(festival) { return festival.safety || []; }
  extractLocalVariations(festival, region) { return festival.localVariations || []; }
  getRegionalFoods(festival, region) { return festival.foods || []; }
  getUniquePractices(festival, region) { return festival.practices || []; }
  getSameSeasonFestivals(festival) { return festival.seasonalRelated || []; }
  getSameDeityFestivals(festival) { return festival.deityRelated || []; }
  getSimilarThemeFestivals(festival) { return festival.themeRelated || []; }
  getMainMantras(festival) { return festival.mantras || []; }
  getPrayers(festival) { return festival.prayers || []; }
  getChants(festival) { return festival.chants || []; }
  getMeditationPractices(festival) { return festival.meditation || []; }
  getWeekDay(date) { return new Date(date).toLocaleDateString('en-US', { weekday: 'long' }); }
  getAstrologicalDay(date) { return 'Favorable'; }
  getCelebrationType(festival) { return festival.type || 'religious'; }
  getParticipationLevel(festival) { return festival.participation || 'family'; }
  getRahukalamTimes(calendar) { return calendar.rahukalam || []; }
  getYamagandaTimes(calendar) { return calendar.yamaganda || []; }
  getGulikakalamTimes(calendar) { return calendar.gulikakalam || []; }
  getTithiData(calendar) { return calendar.tithi || {}; }
  getNakshatraData(calendar) { return calendar.nakshatra || {}; }
  getYogaData(calendar) { return calendar.yoga || {}; }
  getKaranaData(calendar) { return calendar.karana || {}; }
  getLocalFestivals(calendar, region) { return calendar.local || []; }
  getSpecialCustoms(calendar, region) { return calendar.customs || []; }
  getTraditionalPractices(calendar, region) { return calendar.practices || []; }
  getSpiritualTheme(calendar) { return 'Spiritual growth and devotion'; }
  getCulturalTheme(calendar) { return 'Cultural preservation and celebration'; }
  getAgriculturalTheme(calendar) { return 'Harvest and abundance'; }
  getPlanetaryTheme(calendar) { return 'Beneficial planetary alignments'; }
  getSpiritualFocus(calendar) { return 'Meditation and prayer'; }
  getFamilyActivities(calendar) { return 'Festival preparation and celebration'; }
  getCommunityService(calendar) { return 'Charity and community participation'; }
  getPersonalGrowth(calendar) { return 'Learning and self-improvement'; }
  getImmediateActions(upcoming) { return upcoming.slice(0, 3).map(f => `Prepare for ${f.name}`); }
  getWeeklyPreparation(upcoming) { return ['Clean home', 'Buy ingredients', 'Plan rituals']; }
  getShoppingChecklist(upcoming) { return ['Flowers', 'Incense', 'Sweets', 'New clothes']; }
  getSpiritualPreparation(upcoming) { return ['Daily meditation', 'Chanting', 'Fasting']; }
  getBusiestWeek(upcoming) { return 'Week with most festivals'; }
  getSpiritualThemes(upcoming) { return ['Devotion', 'Family', 'Prosperity']; }
  getRulingPlanets(festival) { return festival.planets || ['Jupiter']; }
  getZodiacInfluence(festival) { return festival.zodiac || 'Pisces'; }
  getElementalBalance(festival) { return festival.elements || ['Water', 'Fire']; }
  getEnergyLevel(festival) { return festival.energy || 'High'; }
  getPreparationActivities(festival) { return festival.activities || []; }
  getShoppingList(festival) { return festival.shopping || []; }
  generateRegionalComparison(variations) { return { similarities: [], differences: [] }; }
  getRegionalRecommendations(variations) { return ['Respect local customs', 'Learn regional variations']; }

  formatResult(result) {
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      service: this.serviceName
    };
  }

  validate(festivalParams) {
    if (!festivalParams) {
      throw new Error('Festival parameters are required');
    }

    // Basic validation - timeframe is optional with default
    return true;
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['getHinduFestivalsInfo', 'getSpecificFestivalDetails', 'getUpcomingFestivals'],
      dependencies: ['hinduFestivals']
    };
  }
}

module.exports = HinduFestivalsService;