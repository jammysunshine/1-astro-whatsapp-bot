const AbhijitMuhurtaService = require('./abhijitMuhurtaService');
const AdvancedCompatibilityService = require('./advancedCompatibilityService');
const AdvancedTransitsService = require('./advancedTransitsService');
const AntardashaService = require('./antardashaService');
const AshtakavargaService = require('./ashtakavargaService');
const AsteroidsService = require('./asteroidsService');
const AstrocartographyService = require('./astrocartographyService');
const AyurvedicAstrologyService = require('./ayurvedicAstrologyService');
const BasicBirthChartService = require('./basicBirthChartService');
const BirthChartService = require('./birthChartService');
const AgeHarmonicAstrologyService1 = require('./ageHarmonicAstrologyService');
const BusinessPartnershipService = require('./businessPartnershipService');
const CalculateNakshatraService = require('./calculateNakshatraService');
const CalendarTimingService = require('./calendarTimingService');
const CareerAstrologyService = require('./careerAstrologyService');
const CelticAstrologyService = require('./celticAstrologyService');
const ChineseAstrologyService = require('./chineseAstrologyService');
const CompatibilityScoreService = require('./compatibilityScoreService');
const CompatibilityService = require('./compatibilityService');
const CompositeChartService = require('./compositeChartService');
const ComprehensiveVedicAnalysisService = require('./comprehensiveVedicAnalysisService');
const CosmicEventsService = require('./cosmicEventsService');
const CoupleCompatibilityService = require('./coupleCompatibilityService');
const CurrentDashaService = require('./currentDashaService');
const CurrentTransitsService = require('./currentTransitsService');
const DailyHoroscopeService = require('./dailyHoroscopeService');
const DashaPredictiveService = require('./dashaPredictiveService');
const DavisonChartService = require('./davisonChartService');
const DetailedChartAnalysisService = require('./detailedChartAnalysisService');
const DivinationService = require('./divinationService');
const ElectionalAstrologyService = require('./electionalAstrologyService');
const EnhancedPanchangService = require('./enhancedPanchangService');
const EnhancedSecondaryProgressionsService = require('./enhancedSecondaryProgressionsService');
const EnhancedSolarArcDirectionsService = require('./enhancedSolarArcDirectionsService');
const EphemerisService = require('./ephemerisService');
const EventAstrologyService = require('./eventAstrologyService');
const FamilyAstrologyService = require('./familyAstrologyService');
const FinancialAstrologyService = require('./financialAstrologyService');
const FixedStarsService = require('./fixedStarsService');
const FutureSelfAnalysisService = require('./futureSelfAnalysisService');
const FutureSelfSimulatorService = require('./futureSelfSimulatorService');
const GenerateGroupAstrologyService = require('./generateGroupAstrologyService');
const GocharService = require('./gocharService');
const GroupTimingService = require('./groupTimingService');
const GulikakalamService = require('./gulikakalamService');
const HellenisticAstrologyService = require('./hellenisticAstrologyService');
const HinduAstrologyService = require('./hinduAstrologyService');
const HinduFestivalsService = require('./hinduFestivalsService');
const HoraryAstrologyService = require('./horaryAstrologyService');
const HoraryReadingService = require('./horaryReadingService');
const IChingReadingService = require('./ichingReadingService');
const IslamicAstrologyService = require('./islamicAstrologyService');
const JaiminiAstrologyService = require('./jaiminiAstrologyService');
const JaiminiDashasService = require('./jaiminiDashasService');
const KaalSarpDoshaService = require('./kaalSarpDoshaService');
const KabbalisticAstrologyService = require('./kabbalisticAstrologyService');
const LifePatternsService = require('./lifePatternsService');
const LunarReturnService = require('./lunarReturnService');
const MajorTransitsService = require('./majorTransitsService');
const MayanAstrologyService = require('./mayanAstrologyService');
const MedicalAstrologyService = require('./medicalAstrologyService');
const MoonSignService = require('./moonSignService');
const MuhurtaService = require('./muhurtaService');
const MundaneAstrologyService = require('./mundaneAstrologyService');
const NadiAstrologyService = require('./nadiAstrologyService');
const NakshatraPoruthamService = require('./nakshatraPoruthamService');
const NumerologyAnalysisService = require('./numerologyAnalysisService');
const NumerologyReportService = require('./numerologyReportService');
const NumerologyService = require('./numerologyService');
const PalmistryService = require('./palmistryService');
const PanchangService = require('./panchangService');
const PerformSynastryAnalysisService = require('./performSynastryAnalysisService');
const PlanetaryEventsService = require('./planetaryEventsService');
const PrashnaAstrologyService = require('./prashnaAstrologyService');
const PrashnaService = require('./prashnaService');
const RahukalamService = require('./rahukalamService');
const RemediesDoshaService = require('./remediesDoshaService');
const RisingSignService = require('./risingSignService');
const SadeSatiService = require('./sadeSatiService');
const SeasonalEventsService = require('./seasonalEventsService');
const SecondaryProgressionsService = require('./secondaryProgressionsService');
const ShadbalaService = require('./shadbalaService');
const SignificantTransitsService = require('./significantTransitsService');
const SolarArcDirectionsService = require('./solarArcDirectionsService');
const SolarReturnService = require('./solarReturnService');
const SpecializedAnalysisService = require('./specializedAnalysisService');
const SunSignService = require('./sunSignService');
const SynastryAnalysisService = require('./synastryAnalysisService');
const TarotReadingService = require('./tarotReadingService');
const TransitPreviewService = require('./transitPreviewService');
const UpcomingDashasService = require('./upcomingDashasService');
const VargaChartsService = require('./vargaChartsService');
const VarshaphalService = require('./varshaphalService');
const VedicNumerologyService = require('./vedicNumerologyService');
const VedicRemediesService = require('./vedicRemediesService');
const VedicYogasService = require('./vedicYogasService');
const VimshottariDashaService = require('./vimshottariDashaService');
const AgeHarmonicAstrologyService = require('./ageHarmonicAstrologyService');
const AstrologicalThemesAnalysisService = require('./astrologicalThemesAnalysisService');
const PoliticalTimingAnalysisService = require('./politicalTimingAnalysisService');
const PoliticalAstrologyService = require('./politicalAstrologyService');
const GlobalStabilityAnalysisService = require('./globalStabilityAnalysisService');

// New service layers for proper separation of concerns
const { UserManagementService } = require('./user');
const { CompatibilityManagementService } = require('./compatibility');

module.exports = {
  AbhijitMuhurtaService,
  AdvancedCompatibilityService,
  AdvancedTransitsService,
  AntardashaService,
  AshtakavargaService,
  AsteroidsService,
  AstrocartographyService,
  AyurvedicAstrologyService,
  BasicBirthChartService,
  BirthChartService,
  BusinessPartnershipService,
  CalculateNakshatraService,
  CalendarTimingService,
  CareerAstrologyService,
  CelticAstrologyService,
  ChineseAstrologyService,
  CompatibilityScoreService,
  CompatibilityService,
  CompositeChartService,
  ComprehensiveVedicAnalysisService,
  CosmicEventsService,
  CoupleCompatibilityService,
  CurrentDashaService,
  CurrentTransitsService,
  DailyHoroscopeService,
  DashaPredictiveService,
  DavisonChartService,
  DetailedChartAnalysisService,
  DivinationService,
  ElectionalAstrologyService,
  EnhancedPanchangService,
  EnhancedSecondaryProgressionsService,
  EnhancedSolarArcDirectionsService,
  EphemerisService,
  EventAstrologyService,
  FamilyAstrologyService,
  FinancialAstrologyService,
  FixedStarsService,
  FutureSelfAnalysisService,
  FutureSelfSimulatorService,
  GenerateGroupAstrologyService,
  GocharService,
  GroupTimingService,
  GulikakalamService,
  HellenisticAstrologyService,
  HinduAstrologyService,
  HinduFestivalsService,
  HoraryAstrologyService,
  HoraryReadingService,
  IChingReadingService,
  IslamicAstrologyService,
  JaiminiAstrologyService,
  JaiminiDashasService,
  KaalSarpDoshaService,
  KabbalisticAstrologyService,
  LifePatternsService,
  LunarReturnService,
  MajorTransitsService,
  MayanAstrologyService,
  MedicalAstrologyService,
  MoonSignService,
  MuhurtaService,
  MundaneAstrologyService,
  NadiAstrologyService,
  NakshatraPoruthamService,
  NumerologyAnalysisService,
  NumerologyReportService,
  NumerologyService,
  PalmistryService,
  PanchangService,
  PerformSynastryAnalysisService,
  PlanetaryEventsService,
  PrashnaAstrologyService,
  PrashnaService,
  RahukalamService,
  RemediesDoshaService,
  RisingSignService,
  SadeSatiService,
  SeasonalEventsService,
  SecondaryProgressionsService,
  ShadbalaService,
  SignificantTransitsService,
  SolarArcDirectionsService,
  SolarReturnService,
  SpecializedAnalysisService,
  SunSignService,
  SynastryAnalysisService,
  TarotReadingService,
  TransitPreviewService,
  UpcomingDashasService,
  VargaChartsService,
  VarshaphalService,
  VedicNumerologyService,
  VedicRemediesService,
  VedicYogasService,
  VimshottariDashaService,
  AgeHarmonicAstrologyService,
  AstrologicalThemesAnalysisService,
  PoliticalTimingAnalysisService,
  GlobalStabilityAnalysisService,
  PoliticalAstrologyService,
  
  // New service layers for proper separation of concerns
  UserManagementService,
  CompatibilityManagementService
};