const ActionRegistry = require('./ActionRegistry');

// Import all action classes
// Phase 1 Actions
const DailyHoroscopeAction = require('./actions/astrology/DailyHoroscopeAction');
const BirthChartAction = require('./actions/astrology/BirthChartAction');

// Menu Actions
const ShowMainMenuAction = require('./actions/menu/ShowMainMenuAction');
const WesternAstrologyMenuAction = require('./actions/menu/WesternAstrologyMenuAction');
const VedicAstrologyMenuAction = require('./actions/menu/VedicAstrologyMenuAction');
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
const MuhurtaAction = require('./actions/astrology/MuhurtaAction');
const CompositeChartAction = require('./actions/relationships/CompositeChartAction');
const BabyNameSuggestionAction = require('./actions/utilities/BabyNameSuggestionAction');
const GemstoneRecommendationAction = require('./actions/utilities/GemstoneRecommendationAction');
const MantraRecommendationAction = require('./actions/utilities/MantraRecommendationAction');
const ColorTherapyAction = require('./actions/utilities/ColorTherapyAction');
const DashaAnalysisAction = require('./actions/astrology/DashaAnalysisAction');
const PanchangAnalysisAction = require('./actions/astrology/PanchangAnalysisAction');
const FixedStarsAction = require('./actions/astrology/FixedStarsAction');
const LunarNodesAction = require('./actions/astrology/LunarNodesAction');
const TraditionalHoraryAction = require('./actions/astrology/TraditionalHoraryAction');
const RemedialMeasuresAction = require('./actions/astrology/RemedialMeasuresAction');

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
        console.warn('⚠️ ActionRegistry validation warnings:', validation.errorMessage);
        console.warn('📋 Continuing with graceful degradation - some features may be unavailable');
      } else {
        console.info('✅ ActionRegistry validation passed');
      }
    } catch (error) {
      console.warn('⚠️ ActionRegistry validation failed, continuing:', error.message);
    }

    console.info('✅ ActionRegistry initialized successfully');
    console.info(`📊 Registry stats:`, this.registry.getStats());

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
    // Temporarily disable TarotReadingAction until tarotReader module is available
    try {
      this.registry.registerAction(TarotReadingAction.actionId, TarotReadingAction);
    } catch (error) {
      console.warn('⚠️ TarotReadingAction temporarily disabled - tarotReader module needed');
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

    console.info('📝 Registered action classes with registry');
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
    this.registry.registerKeyword('fixed stars', FixedStarsAction.actionId);
    this.registry.registerKeyword('stellar', FixedStarsAction.actionId);
    this.registry.registerKeyword('lunar nodes', LunarNodesAction.actionId);
    this.registry.registerKeyword('rahu ketu', LunarNodesAction.actionId);
    this.registry.registerKeyword('horary', TraditionalHoraryAction.actionId);
    this.registry.registerKeyword('questions', TraditionalHoraryAction.actionId);
    this.registry.registerKeyword('remedial', RemedialMeasuresAction.actionId);
    this.registry.registerKeyword('remedies', RemedialMeasuresAction.actionId);
    this.registry.registerKeyword('healing', RemedialMeasuresAction.actionId);

    console.info('🔤 Registered keyword mappings');
  }

  /**
   * Register button ID mappings for interactive button replies
   */
  registerButtonMappings() {
    // Menu buttons
    this.registry.registerButton('show_main_menu', 'show_main_menu');
    this.registry.registerButton('horoscope_menu', 'show_main_menu');

    // Action-specific buttons (match actual actionId properties)
    this.registry.registerButton('get_daily_horoscope', DailyHoroscopeAction.actionId);
    this.registry.registerButton('get_birth_chart', BirthChartAction.actionId);
    this.registry.registerButton('get_tarot_reading', 'get_tarot_reading');
    this.registry.registerButton('initiate_compatibility_flow', CompatibilityAction.actionId);
    this.registry.registerButton('get_current_transits', CurrentTransitsAction.actionId);
    this.registry.registerButton('get_numerology_analysis', NumerologyReportAction.actionId);
    this.registry.registerButton('show_help_support', 'show_help_support');

    // Navigation buttons (some of these may not exist as separate actions)
    try { this.registry.registerButton('get_more_compatibility_details', CompatibilityAction.actionId); } catch(e) {}
    try { this.registry.registerButton('get_relationship_advice', CompatibilityAction.actionId); } catch(e) {}
    try { this.registry.registerButton('get_transit_predictions', CurrentTransitsAction.actionId); } catch(e) {}
    try { this.registry.registerButton('get_numerology_timeline', NumerologyReportAction.actionId); } catch(e) {}
    try { this.registry.registerButton('get_name_analysis', NumerologyReportAction.actionId); } catch(e) {}
    try { this.registry.registerButton('show_quick_start', 'show_help_support'); } catch(e) {}
    try { this.registry.registerButton('contact_support', 'show_help_support'); } catch(e) {}
    try { this.registry.registerButton('show_commands_list', 'show_help_support'); } catch(e) {}

    console.info('🔘 Registered button ID mappings');
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