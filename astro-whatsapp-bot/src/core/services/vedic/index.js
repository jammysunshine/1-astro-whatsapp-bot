const BirthChartService = require('./birthChartService');
const VimshottariDashaService = require('./vimshottariDashaService');
const PrashnaAstrologyService = require('./prashnaAstrologyService');
const EventAstrologyService = require('./eventAstrologyService');
const MuhurtaService = require('./muhurtaService');
const SolarArcDirectionsService = require('./solarArcDirectionsService');
const SecondaryProgressionsService = require('./secondaryProgressionsService');
const SolarReturnService = require('./solarReturnService');
const BusinessPartnershipService = require('./businessPartnershipService');
const SpecializedAnalysisService = require('./specializedAnalysisService');
const DashaPredictiveService = require('./dashaPredictiveService');
const CalendarTimingService = require('./calendarTimingService');
const CurrentDashaService = require('./currentDashaService');
const CurrentTransitsService = require('./currentTransitsService');
const DailyHoroscopeService = require('./dailyHoroscopeService');
const CompatibilityService = require('./compatibilityService');
const DetailedChartAnalysisService = require('./detailedChartAnalysisService');
const CompatibilityScoreService = require('./compatibilityScoreService');
const PanchangService = require('./panchangService');
const AshtakavargaService = require('./ashtakavargaService');
const DavisonChartService = require('./davisonChartService');
const LunarReturnService = require('./lunarReturnService');
// High-priority services
const ElectionalAstrologyService = require('./electionalAstrologyService');
const HoraryAstrologyService = require('./horaryAstrologyService');
const FutureSelfAnalysisService = require('./futureSelfAnalysisService');
const JaiminiAstrologyService = require('./jaiminiAstrologyService');
const GocharService = require('./gocharService');
const VarshaphalService = require('./varshaphalService');
// Medium-priority services
const EnhancedSecondaryProgressionsService = require('./enhancedSecondaryProgressionsService');
const EnhancedSolarArcDirectionsService = require('./enhancedSolarArcDirectionsService');
const SignificantTransitsService = require('./significantTransitsService');
const ShadbalaService = require('./shadbalaService');
const VedicYogasService = require('./vedicYogasService');
// Newly implemented services
const AdvancedCompatibilityService = require('./advancedCompatibilityService');
const EnhancedPanchangService = require('./enhancedPanchangService');
const PrashnaService = require('./prashnaService');
// Additional medium-priority services
const JaiminiDashasService = require('./jaiminiDashasService');
const AdvancedTransitsService = require('./advancedTransitsService');
const MajorTransitsService = require('./majorTransitsService');
const TransitPreviewService = require('./transitPreviewService');
const AsteroidsService = require('./asteroidsService');
// HIGH PRIORITY - Newly implemented core services
const CoupleCompatibilityService = require('../coupleCompatibilityService');
const SynastryAnalysisService = require('../synastryAnalysisService');
const HinduFestivalsService = require('../hinduFestivalsService');
const NumerologyAnalysisService = require('../numerologyAnalysisService');
const HoraryReadingService = require('../horaryReadingService');
// Add exports for all other Vedic services as they are implemented

module.exports = {
  BirthChartService,
  VimshottariDashaService,
  PrashnaAstrologyService,
  EventAstrologyService,
  MuhurtaService,
  SolarArcDirectionsService,
  SecondaryProgressionsService,
  SolarReturnService,
  BusinessPartnershipService,
  SpecializedAnalysisService,
  DashaPredictiveService,
  CalendarTimingService,
  CurrentDashaService,
  CurrentTransitsService,
  DailyHoroscopeService,
  CompatibilityService,
  DetailedChartAnalysisService,
  CompatibilityScoreService,
  PanchangService,
  AshtakavargaService,
  DavisonChartService,
  LunarReturnService,
  // High-priority services
  ElectionalAstrologyService,
  HoraryAstrologyService,
  FutureSelfAnalysisService,
  JaiminiAstrologyService,
  GocharService,
  VarshaphalService,
  // Medium-priority services
  EnhancedSecondaryProgressionsService,
  EnhancedSolarArcDirectionsService,
  SignificantTransitsService,
  ShadbalaService,
  VedicYogasService,
  // Newly implemented services
  AdvancedCompatibilityService,
  EnhancedPanchangService,
  PrashnaService,
  // Additional medium-priority services
  JaiminiDashasService,
  AdvancedTransitsService,
  MajorTransitsService,
  TransitPreviewService,
  AsteroidsService,
  // HIGH PRIORITY - Newly implemented core services
  CoupleCompatibilityService,
  SynastryAnalysisService,
  HinduFestivalsService,
  NumerologyAnalysisService,
  HoraryReadingService,
  // Add all other Vedic services here
};