const logger = require('../../../utils/logger');
const { SignCalculations } = require('./SignCalculations');
const { ChartInterpreter } = require('./ChartInterpreter');

class VedicChartGenerator {
  constructor(astrologer, geocodingService, vedicCore, signCalculations) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;
    this.vedicCore = vedicCore;
    this.signCalculations = new SignCalculations(
      vedicCore,
      geocodingService,
      signCalculations
    );
    this.interpreter = new ChartInterpreter();
    logger.info('VedicChartGenerator loaded');
  }

  /**
   * Generate comprehensive Vedic astrology natal chart
   * @param {Object} user - User object with birth details
   * @returns {Object} Complete Vedic natal chart data
   */
  async generateVedicBirthChart(user) {
    try {
      const { birthDate, birthTime, birthPlace, name } = user;

      // Calculate signs with Vedic astrology and fallbacks
      const sunSign = await this.signCalculations.calculateSunSign(
        birthDate,
        birthTime,
        birthPlace
      );
      const moonSign = await this.signCalculations.calculateMoonSign(
        birthDate,
        birthTime,
        birthPlace
      );
      const risingSign = await this.signCalculations.calculateRisingSign(
        birthDate,
        birthTime,
        birthPlace
      );

      // Calculate Nakshatra (will be updated with actual moon position from chart)
      let moonNakshatra = { nakshatra: 'Unknown', lord: 'Unknown', pada: 1 };
      try {
        if (moonSign && moonSign !== 'Unknown') {
          // Simplified Nakshatra approximation based on moon sign
          // In a full implementation, this would come from chart calculations
          moonNakshatra = this.signCalculations.calculateNakshatra(0); // Placeholder
        }
      } catch (error) {
        // Keep default
      }

      // Generate full natal chart using astrologer API
      let chart = {};
      try {
        const locationInfo =
          await this.geocodingService.getLocationInfo(birthPlace);
        const [day, month, year] = birthDate.split('/').map(Number);
        const [hour, minute] = birthTime.split(':').map(Number);

        const astroData = {
          year,
          month,
          date: day,
          hours: hour,
          minutes: minute,
          seconds: 0,
          latitude: locationInfo.latitude,
          longitude: locationInfo.longitude,
          timezone: locationInfo.timezone,
          chartType: 'sidereal' // Vedic astrology
        };

        chart = this.astrologer.generateNatalChartData(astroData);

        // Update Nakshatra with actual moon position
        if (chart.planets?.moon?.longitude) {
          moonNakshatra = this.signCalculations.calculateNakshatra(
            chart.planets.moon.longitude
          );
        }
      } catch (error) {
        // Chart generation failed - will use basic data
      }

      // Generate chart description and analysis
      const enhancedDescription =
        this.interpreter.generateEnhancedDescription(chart);

      return {
        name,
        birthDate,
        birthTime,
        birthPlace,
        sunSign,
        moonSign,
        risingSign,
        moonNakshatra,
        dominantElements: chart.interpretations?.dominantElements || [],
        dominantQualities: chart.interpretations?.dominantQualities || [],
        planets: this.interpreter.formatPlanets(chart.planets || {}),
        chartPatterns: chart.chartPatterns || [],
        description: enhancedDescription,
        personalityTraits: this.interpreter.extractPersonalityTraits(chart),
        strengths: this.interpreter.extractStrengths(chart),
        challenges: this.interpreter.extractChallenges(chart),
        fullChart: chart, // Include complete chart for advanced features
        chartType: 'Vedic'
      };
    } catch (error) {
      logger.error('Error generating Vedic birth chart:', error);
      return {
        name: user.name,
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        birthPlace: user.birthPlace,
        sunSign: 'Unknown',
        moonSign: 'Unknown',
        risingSign: 'Unknown',
        planets: {},
        description: 'Unable to generate Vedic birth chart at this time.',
        chartType: 'Vedic'
      };
    }
  }

  /**
   * Generate detailed Vedic chart analysis
   * @param {Object} user - User object with birth details
   * @returns {Object} Detailed Vedic chart analysis
   */
  async generateVedicDetailedAnalysis(user) {
    try {
      const basicChart = await this.generateVedicBirthChart(user);
      const { fullChart } = basicChart;

      const analysis = {
        ...basicChart,
        majorAspects: this.interpreter.getMajorAspects(fullChart),
        stelliumInterpretation: this.interpreter.getStelliumInterpretation(
          fullChart.chartPatterns?.stelliums
        ),
        elementBalance: this.interpreter.analyzeElementBalance(
          fullChart.chartPatterns?.elementEmphasis
        ),
        lifePurpose: this.interpreter.deriveLifePurpose(basicChart),
        currentTransits: this.interpreter.getCurrentTransits(
          basicChart.sunSign
        ),
        planetarySpeeds: this.interpreter.analyzePlanetarySpeeds(
          fullChart.planets || {}
        ),
        vedicDashaAnalysis: {}, // Would be populated with current dasha periods
        remedialMeasures: [] // Would include Vedic remedies
      };

      return analysis;
    } catch (error) {
      logger.error('Error generating Vedic detailed analysis:', error);
      return this.generateVedicBirthChart(user);
    }
  }
}

module.exports = { VedicChartGenerator };
