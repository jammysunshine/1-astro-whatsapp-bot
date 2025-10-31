const CoreApp = require('./app');
const { BirthChartService, VimshottariDashaService, PrashnaAstrologyService, EventAstrologyService, MuhurtaService, SolarArcDirectionsService, SecondaryProgressionsService, SolarReturnService, BusinessPartnershipService, SpecializedAnalysisService, DashaPredictiveService, CalendarTimingService, CurrentDashaService, CurrentTransitsService, DailyHoroscopeService, CompatibilityService } = require('./services');
const { logger } = require('./utils');
const { validateBirthData, errorHandler } = require('./middleware');

module.exports = {
  CoreApp,
  services: {
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
    // All other services
  },
  utils: {
    logger,
    // Other utilities
  },
  middleware: {
    validateBirthData,
    errorHandler
  }
};