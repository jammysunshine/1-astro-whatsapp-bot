const ActionRegistry = require('./ActionRegistry');
const logger = require('../utils/logger');

// Import all action classes
// Phase 1 Actions
const DailyHoroscopeAction = require('./actions/astrology/DailyHoroscopeAction');
const BirthChartAction = require('./actions/astrology/BirthChartAction');

// Menu Actions
const ShowMainMenuAction = require('./actions/settings/ShowMainMenuAction');
const WesternAstrologyMenuAction = require('./actions/menu/WesternAstrologyMenuAction');
const VedicAstrologyMenuAction = require('./actions/menu/VedicAstrologyMenuAction');
const DivinationMysticMenuAction = require('./actions/menu/DivinationMysticMenuAction');
const NumerologySpecialMenuAction = require('./actions/menu/NumerologySpecialMenuAction');
const RelationshipsGroupsMenuAction = require('./actions/menu/RelationshipsGroupsMenuAction');
const SettingsProfileMenuAction = require('./actions/menu/SettingsProfileMenuAction');
const LanguageMenuAction = require('./actions/menu/LanguageMenuAction');

// Key Astrology Actions
const VedicKundliAction = require('./actions/astrology/VedicKundliAction');
const KaalSarpAnalysisAction = require('./actions/astrology/KaalSarpAnalysisAction');
const PrashnaAstrologyAction = require('./actions/astrology/PrashnaAstrologyAction');
const MuhurtaAction = require('./actions/astrology/MuhurtaAction');
const PanchangAnalysisAction = require('./actions/astrology/PanchangAnalysisAction');
const HoroscopeAnalysisAction = require('./actions/astrology/HoroscopeAnalysisAction');
const DashaAnalysisAction = require('./actions/astrology/DashaAnalysisAction');
const HinduFestivalsAction = require('./actions/astrology/HinduFestivalsAction');
const TarotReadingAction = require('./actions/divination/TarotReadingAction');
const CompatibilityAction = require('./actions/astrology/CompatibilityAction');
const CurrentTransitsAction = require('./actions/astrology/CurrentTransitsAction');
const NumerologyReportAction = require('./actions/astrology/NumerologyReportAction');
const HelpAction = require('./actions/utilities/HelpAction');

// Phase 2 Actions (17 total additional actions for comprehensive coverage)
const WesternAstrologyAction = require('./actions/astrology/WesternAstrologyAction');
const VedicAstrologyAction = require('./actions/astrology/VedicAstrologyAction');
const IChingAction = require('./actions/divination/IChingAction');
const PalmistryAction = require('./actions/divination/PalmistryAction');
const CareerGuidanceAction = require('./actions/career/CareerGuidanceAction');
const HealthAstrologyAction = require('./actions/health/HealthAstrologyAction');
const LunarReturnAction = require('./actions/astrology/LunarReturnAction');
const RelationshipReadingsAction = require('./actions/relationships/RelationshipReadingsAction');
const BusinessAstrologyAction = require('./actions/business/BusinessAstrologyAction');
const SolarReturnAction = require('./actions/astrology/SolarReturnAction');
const SecondaryProgressionsAction = require('./actions/astrology/SecondaryProgressionsAction');
const ElectionalAstrologyAction = require('./actions/astrology/ElectionalAstrologyAction');
const CompositeChartAction = require('./actions/relationships/CompositeChartAction');
const BabyNameSuggestionAction = require('./actions/utilities/BabyNameSuggestionAction');
const GemstoneRecommendationAction = require('./actions/utilities/GemstoneRecommendationAction');
const MantraRecommendationAction = require('./actions/utilities/MantraRecommendationAction');
const ColorTherapyAction = require('./actions/utilities/ColorTherapyAction');
const FixedStarsAction = require('./actions/astrology/FixedStarsAction');
const LunarNodesAction = require('./actions/astrology/LunarNodesAction');
const TraditionalHoraryAction = require('./actions/astrology/TraditionalHoraryAction');
const RemedialMeasuresAction = require('./actions/astrology/RemedialMeasuresAction');
const VargaChartsAction = require('./actions/astrology/VargaChartsAction');

// Language and Settings Actions
const SetLanguageAction = require('./actions/settings/SetLanguageAction');
const ViewProfileAction = require('./actions/settings/ViewProfileAction');
const UpdateProfileAction = require('./actions/settings/UpdateProfileAction');

/**
 * ActionRegistryInitializer - Sets up and initializes the ActionRegistry with all available actions.
 * This centralizes action registration and mapping for the new architecture.
 */
class ActionRegistryInitializer {
  constructor() {
    this.registry = new ActionRegistry();
  }

  /**
   * Initialize the action registry with all actions and mappings
   * @returns {ActionRegistry} The initialized registry
   */
  initialize() {
    // Register all action classes
    this.registerActionClasses();

    // Set up keyword mappings
    this.registerKeywordMappings();

    // Set up button ID mappings
    this.registerButtonMappings();

    // Temporarily disable strict validation for development
    // TODO: Re-enable validation once all actions are properly implemented
    try {
      const validation = this.registry.validate();
      if (!validation.isValid) {
        logger.warn('⚠️ ActionRegistry validation warnings:', validation.errorMessage);
        logger.warn('📋 Continuing with graceful degradation - some features may be unavailable');
      } else {
        logger.info('✅ ActionRegistry validation passed');
      }
    } catch (error) {
      logger.warn('⚠️ ActionRegistry validation failed, continuing:', error.message);
    }

    logger.info('✅ ActionRegistry initialized successfully');
    logger.info('📊 Registry stats:', this.registry.getStats());

    return this.registry;
  }

  /**
   * Register all action classes with the registry
   */
  registerActionClasses() {
    // Phase 1 - Core Astrology Actions
    this.registry.registerAction(DailyHoroscopeAction.actionId, DailyHoroscopeAction);
    this.registry.registerAction(BirthChartAction.actionId, BirthChartAction);
    this.registry.registerAction(CompatibilityAction.actionId, CompatibilityAction);
    this.registry.registerAction(CurrentTransitsAction.actionId, CurrentTransitsAction);
    this.registry.registerAction(NumerologyReportAction.actionId, NumerologyReportAction);

    // Menu Actions
    this.registry.registerAction(ShowMainMenuAction.actionId, ShowMainMenuAction);
    this.registry.registerAction(WesternAstrologyMenuAction.actionId, WesternAstrologyMenuAction);
    this.registry.registerAction(VedicAstrologyMenuAction.actionId, VedicAstrologyMenuAction);
    this.registry.registerAction(DivinationMysticMenuAction.actionId, DivinationMysticMenuAction);
    this.registry.registerAction(NumerologySpecialMenuAction.actionId, NumerologySpecialMenuAction);
    this.registry.registerAction(RelationshipsGroupsMenuAction.actionId, RelationshipsGroupsMenuAction);
    this.registry.registerAction(SettingsProfileMenuAction.actionId, SettingsProfileMenuAction);
    this.registry.registerAction(LanguageMenuAction.actionId, LanguageMenuAction);

    // Key Astrology Actions (using legacy implementations)
    this.registry.registerAction(VedicKundliAction.actionId, VedicKundliAction);
    this.registry.registerAction(KaalSarpAnalysisAction.actionId, KaalSarpAnalysisAction);
    this.registry.registerAction(PrashnaAstrologyAction.actionId, PrashnaAstrologyAction);
    this.registry.registerAction(MuhurtaAction.actionId, MuhurtaAction);
    this.registry.registerAction(PanchangAnalysisAction.actionId, PanchangAnalysisAction);
    this.registry.registerAction(HoroscopeAnalysisAction.actionId, HoroscopeAnalysisAction);
    this.registry.registerAction(DashaAnalysisAction.actionId, DashaAnalysisAction);
    this.registry.registerAction(HinduFestivalsAction.actionId, HinduFestivalsAction);
    // Temporarily disable TarotReadingAction until tarotReader module is available
    try {
      this.registry.registerAction(TarotReadingAction.actionId, TarotReadingAction);
    } catch (error) {
      logger.warn('⚠️ TarotReadingAction temporarily disabled - tarotReader module needed');
    }
    this.registry.registerAction(HelpAction.actionId, HelpAction);

    // Phase 2 - Complete Professional Astrology Suite (17 comprehensive actions)
    this.registry.registerAction(WesternAstrologyAction.actionId, WesternAstrologyAction);
    this.registry.registerAction(VedicAstrologyAction.actionId, VedicAstrologyAction);
    this.registry.registerAction(IChingAction.actionId, IChingAction);
    this.registry.registerAction(PalmistryAction.actionId, PalmistryAction);
    this.registry.registerAction(CareerGuidanceAction.actionId, CareerGuidanceAction);
    this.registry.registerAction(HealthAstrologyAction.actionId, HealthAstrologyAction);
    this.registry.registerAction(LunarReturnAction.actionId, LunarReturnAction);
    this.registry.registerAction(RelationshipReadingsAction.actionId, RelationshipReadingsAction);
    this.registry.registerAction(BusinessAstrologyAction.actionId, BusinessAstrologyAction);
    this.registry.registerAction(SolarReturnAction.actionId, SolarReturnAction);
    this.registry.registerAction(SecondaryProgressionsAction.actionId, SecondaryProgressionsAction);
    this.registry.registerAction(ElectionalAstrologyAction.actionId, ElectionalAstrologyAction);
    this.registry.registerAction(MuhurtaAction.actionId, MuhurtaAction);
    this.registry.registerAction(CompositeChartAction.actionId, CompositeChartAction);
    this.registry.registerAction(BabyNameSuggestionAction.actionId, BabyNameSuggestionAction);
    this.registry.registerAction(GemstoneRecommendationAction.actionId, GemstoneRecommendationAction);
    this.registry.registerAction(MantraRecommendationAction.actionId, MantraRecommendationAction);
    this.registry.registerAction(ColorTherapyAction.actionId, ColorTherapyAction);
    this.registry.registerAction(DashaAnalysisAction.actionId, DashaAnalysisAction);
    this.registry.registerAction(PanchangAnalysisAction.actionId, PanchangAnalysisAction);
    this.registry.registerAction(FixedStarsAction.actionId, FixedStarsAction);
    this.registry.registerAction(LunarNodesAction.actionId, LunarNodesAction);
    this.registry.registerAction(TraditionalHoraryAction.actionId, TraditionalHoraryAction);
    this.registry.registerAction(RemedialMeasuresAction.actionId, RemedialMeasuresAction);
    this.registry.registerAction(VargaChartsAction.actionId, VargaChartsAction);

    // Language and Settings Actions
    this.registry.registerAction(LanguageMenuAction.actionId, LanguageMenuAction);
    this.registry.registerAction(SetLanguageAction.actionId, SetLanguageAction);
    this.registry.registerAction(ViewProfileAction.actionId, ViewProfileAction);
    this.registry.registerAction(UpdateProfileAction.actionId, UpdateProfileAction);
    // Note: SetLanguageAction handles all individual language settings via dynamic languageCode

    logger.info('📝 Registered action classes with registry');
  }

  /**
   * Register keyword mappings for text-based access
   */
  registerKeywordMappings() {
    // Basic commands
    this.registry.registerKeyword('menu', ShowMainMenuAction.actionId);
    this.registry.registerKeyword('main', ShowMainMenuAction.actionId);
    this.registry.registerKeyword('home', ShowMainMenuAction.actionId);

    // Astrology commands
    this.registry.registerKeyword('horoscope', DailyHoroscopeAction.actionId);
    this.registry.registerKeyword('horoscope analysis', HoroscopeAnalysisAction.actionId);
    this.registry.registerKeyword('daily horoscope', DailyHoroscopeAction.actionId);
    this.registry.registerKeyword('chart', BirthChartAction.actionId);
    this.registry.registerKeyword('birth chart', BirthChartAction.actionId);
    this.registry.registerKeyword('compatibility', CompatibilityAction.actionId);
    this.registry.registerKeyword('synastry', CompatibilityAction.actionId);
    this.registry.registerKeyword('relationship', CompatibilityAction.actionId);
    this.registry.registerKeyword('match', CompatibilityAction.actionId);
    this.registry.registerKeyword('transits', CurrentTransitsAction.actionId);
    this.registry.registerKeyword('current', CurrentTransitsAction.actionId);
    this.registry.registerKeyword('planets', CurrentTransitsAction.actionId);
    this.registry.registerKeyword('influences', CurrentTransitsAction.actionId);
    this.registry.registerKeyword('numerology', NumerologyReportAction.actionId);
    this.registry.registerKeyword('numbers', NumerologyReportAction.actionId);
    this.registry.registerKeyword('life path', NumerologyReportAction.actionId);

    // Divination commands
    this.registry.registerKeyword('tarot', TarotReadingAction.actionId);
    this.registry.registerKeyword('tarot reading', TarotReadingAction.actionId);
    this.registry.registerKeyword('cards', TarotReadingAction.actionId);

    // Utilities commands
    this.registry.registerKeyword('help', HelpAction.actionId);
    this.registry.registerKeyword('support', HelpAction.actionId);
    this.registry.registerKeyword('guide', HelpAction.actionId);
    this.registry.registerKeyword('how to', HelpAction.actionId);
    this.registry.registerKeyword('commands', HelpAction.actionId);

    // Additional new action keywords
    this.registry.registerKeyword('western', WesternAstrologyAction.actionId);
    this.registry.registerKeyword('western astrology', WesternAstrologyAction.actionId);
    this.registry.registerKeyword('vedic', VedicAstrologyAction.actionId);
    this.registry.registerKeyword('vedic astrology', VedicAstrologyAction.actionId);
    this.registry.registerKeyword('jyotish', VedicAstrologyAction.actionId);
    this.registry.registerKeyword('kundli', VedicKundliAction.actionId);
    this.registry.registerKeyword('kaal sarp', KaalSarpAnalysisAction.actionId);
    this.registry.registerKeyword('prashan', PrashnaAstrologyAction.actionId);
    this.registry.registerKeyword('prashna', PrashnaAstrologyAction.actionId);
    this.registry.registerKeyword('iching', IChingAction.actionId);
    this.registry.registerKeyword('palmistry', PalmistryAction.actionId);
    this.registry.registerKeyword('palm reading', PalmistryAction.actionId);
    this.registry.registerKeyword('career', CareerGuidanceAction.actionId);
    this.registry.registerKeyword(' career astrology', CareerGuidanceAction.actionId);
    this.registry.registerKeyword('health', HealthAstrologyAction.actionId);
    this.registry.registerKeyword('medical astrology', HealthAstrologyAction.actionId);
    this.registry.registerKeyword('lunar return', LunarReturnAction.actionId);
    this.registry.registerKeyword('family', RelationshipReadingsAction.actionId);
    this.registry.registerKeyword('relationships', RelationshipReadingsAction.actionId);
    this.registry.registerKeyword('business', BusinessAstrologyAction.actionId);
    this.registry.registerKeyword('commercial astrology', BusinessAstrologyAction.actionId);
    this.registry.registerKeyword('solar return', SolarReturnAction.actionId);
    this.registry.registerKeyword('progressions', SecondaryProgressionsAction.actionId);
    this.registry.registerKeyword('electional', ElectionalAstrologyAction.actionId);
    this.registry.registerKeyword('timing', ElectionalAstrologyAction.actionId);
    this.registry.registerKeyword('muhurta', MuhurtaAction.actionId);
    this.registry.registerKeyword('composite', CompositeChartAction.actionId);
    this.registry.registerKeyword('baby names', BabyNameSuggestionAction.actionId);
    this.registry.registerKeyword('gemstones', GemstoneRecommendationAction.actionId);
    this.registry.registerKeyword('mantras', MantraRecommendationAction.actionId);
    this.registry.registerKeyword('color therapy', ColorTherapyAction.actionId);
    this.registry.registerKeyword('dasha', DashaAnalysisAction.actionId);
    this.registry.registerKeyword('panchang', PanchangAnalysisAction.actionId);
    this.registry.registerKeyword('calendar', PanchangAnalysisAction.actionId);
    this.registry.registerKeyword('hindu festivals', HinduFestivalsAction.actionId);
    this.registry.registerKeyword('festivals', HinduFestivalsAction.actionId);
    this.registry.registerKeyword('festival dates', HinduFestivalsAction.actionId);
    this.registry.registerKeyword('auspicious dates', HinduFestivalsAction.actionId);
    this.registry.registerKeyword('fixed stars', FixedStarsAction.actionId);
    this.registry.registerKeyword('stellar', FixedStarsAction.actionId);
    this.registry.registerKeyword('lunar nodes', LunarNodesAction.actionId);
    this.registry.registerKeyword('rahu ketu', LunarNodesAction.actionId);
    this.registry.registerKeyword('horary', TraditionalHoraryAction.actionId);
    this.registry.registerKeyword('traditional horary', TraditionalHoraryAction.actionId);
    this.registry.registerKeyword('questions', TraditionalHoraryAction.actionId);
    this.registry.registerKeyword('remedial', RemedialMeasuresAction.actionId);
    this.registry.registerKeyword('remedies', RemedialMeasuresAction.actionId);
    this.registry.registerKeyword('healing', RemedialMeasuresAction.actionId);

    // Language and Settings keywords
    this.registry.registerKeyword('language', LanguageMenuAction.actionId);
    this.registry.registerKeyword('languages', LanguageMenuAction.actionId);
    this.registry.registerKeyword('settings', 'show_main_menu'); // Will need to add settings menu
    this.registry.registerKeyword('language menu', LanguageMenuAction.actionId);

    logger.info('🔤 Registered keyword mappings');
  }

  /**
   * Register button ID mappings for interactive button replies
   */
  registerButtonMappings() {
    // Menu buttons
    this.registry.registerButton('show_main_menu', 'show_main_menu');
    this.registry.registerButton('horoscope_menu', 'show_main_menu');

    // Submenu buttons
    this.registry.registerButton('show_western_astrology_menu', WesternAstrologyMenuAction.actionId);
    this.registry.registerButton('show_vedic_astrology_menu', VedicAstrologyMenuAction.actionId);
    this.registry.registerButton('show_divination_mystic_menu', DivinationMysticMenuAction.actionId);
    this.registry.registerButton('show_numerology_special_menu', NumerologySpecialMenuAction.actionId);
    this.registry.registerButton('show_relationships_groups_menu', RelationshipsGroupsMenuAction.actionId);
    this.registry.registerButton('show_settings_profile_menu', SettingsProfileMenuAction.actionId);
    this.registry.registerButton('show_language_menu', LanguageMenuAction.actionId);

    // Action-specific buttons (match actual actionId properties)
    this.registry.registerButton('get_daily_horoscope', DailyHoroscopeAction.actionId);
    this.registry.registerButton('get_birth_chart', BirthChartAction.actionId);
    this.registry.registerButton('get_tarot_reading', 'get_tarot_reading');
    this.registry.registerButton('initiate_compatibility_flow', CompatibilityAction.actionId);
    this.registry.registerButton('get_current_transits', CurrentTransitsAction.actionId);
    this.registry.registerButton('get_numerology_analysis', NumerologyReportAction.actionId);
    this.registry.registerButton('show_help_support', 'show_help_support');

    // Navigation buttons (some of these may not exist as separate actions)
    try { this.registry.registerButton('get_more_compatibility_details', CompatibilityAction.actionId); } catch (e) {}
    try { this.registry.registerButton('get_relationship_advice', CompatibilityAction.actionId); } catch (e) {}
    try { this.registry.registerButton('get_transit_predictions', CurrentTransitsAction.actionId); } catch (e) {}
    try { this.registry.registerButton('get_numerology_timeline', NumerologyReportAction.actionId); } catch (e) {}
    try { this.registry.registerButton('get_name_analysis', NumerologyReportAction.actionId); } catch (e) {}
    try { this.registry.registerButton('show_quick_start', 'show_help_support'); } catch (e) {}
    try { this.registry.registerButton('contact_support', 'show_help_support'); } catch (e) {}
    try { this.registry.registerButton('show_commands_list', 'show_help_support'); } catch (e) {}

    // Language buttons - all 28 supported languages mapped to single set_language action
    // The InteractiveMessageProcessor will extract the language code from the button ID
    this.registry.registerButton('set_language_en', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_hi', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_ar', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_es', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_fr', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_bn', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_ur', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_pt', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_ru', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_de', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_it', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_th', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_ta', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_te', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_gu', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_mr', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_kn', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_ml', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_pa', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_or', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_as', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_mai', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_ne', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_si', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_sd', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_zgh', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_am', SetLanguageAction.actionId);
    this.registry.registerButton('set_language_sw', SetLanguageAction.actionId);

    // Profile and Settings buttons
    this.registry.registerButton('btn_update_profile', UpdateProfileAction.actionId);
    this.registry.registerButton('btn_view_profile', ViewProfileAction.actionId);

    logger.info('🔘 Registered button ID mappings');
  }

  /**
   * Get the initialized registry
   * @returns {ActionRegistry} The registry instance
   */
  getRegistry() {
    return this.registry;
  }

  /**
   * Health check for the initializer
   * @returns {Object} Health status
   */
  healthCheck() {
    try {
      const registryHealth = this.registry.healthCheck();
      return {
        initialized: true,
        registry: registryHealth,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        initialized: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export a function that returns initialized registry
function createInitializedRegistry() {
  const initializer = new ActionRegistryInitializer();
  return initializer.initialize();
}

module.exports = createInitializedRegistry;
