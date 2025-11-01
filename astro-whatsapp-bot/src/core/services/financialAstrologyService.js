const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');
const { BirthData } = require('../../models/BirthData');

/**
 * FinancialAstrologyService - Wealth, investments, and financial analysis service
 *
 * Provides financial astrology calculations including wealth planets, cycles,
 * and strategies using specialized calculator for wealth, investments, and financial analysis.
 */
class FinancialAstrologyService extends ServiceTemplate {
  constructor() {
    super('FinancialAstrologyCalculator'); // Primary calculator for this service
    this.serviceName = 'FinancialAstrologyService';
    this.calculatorPath =
      ../calculators/FinancialAstrologyCalculator';
    logger.info('FinancialAstrologyService initialized');
  }

  /**
   * Main calculation method for Financial Astrology Analysis.
   * @param {Object} birthData - User's birth data.
   * @returns {Promise<Object>} Comprehensive financial astrology analysis.
   */
  async processCalculation(birthData) {
    try {
      // Ensure calculator is loaded
      if (!this.calculator) {
        await this.initialize();
      }

      this._validateInput(birthData);

      // Get financial astrology analysis from calculator
      const financialAnalysis =
        await this.calculator.calculateFinancialAstrologyAnalysis(birthData);

      // Add service metadata
      financialAnalysis.serviceMetadata = {
        serviceName: this.serviceName,
        calculationType: 'Financial Astrology Analysis',
        timestamp: new Date().toISOString(),
        method: 'Wealth and Investment Astrology',
        wealthPlanets: financialAnalysis.wealthPlanets.length,
        financialCycles: financialAnalysis.financialCycles.length,
        wealthHouses: 3 // Always 3 wealth houses analyzed
      };

      return financialAnalysis;
    } catch (error) {
      logger.error(
        'FinancialAstrologyService processCalculation error:',
        error
      );
      throw new Error(`Financial astrology analysis failed: ${error.message}`);
    }
  }

  /**
   * Validates input data for financial astrology analysis.
   * @param {Object} birthData - Birth data to validate.
   * @private
   */
  _validateInput(birthData) {
    if (!birthData) {
      throw new Error(
        'Birth data is required for financial astrology analysis'
      );
    }
    const validatedData = new BirthData(birthData);
    validatedData.validate();
  }

  /**
   * Formats the financial astrology analysis result for consistent output.
   * @param {Object} result - Raw calculator result.
   * @returns {Object} Formatted result.
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        message: 'Financial astrology analysis failed',
        service: this.serviceName
      };
    }

    return {
      success: true,
      data: result,
      summary: this._generateFinancialSummary(result),
      metadata: {
        serviceName: this.serviceName,
        system: 'Financial Astrology',
        calculationMethod: 'Wealth planets, cycles, and strategies analysis',
        elements: [
          'Wealth Planets',
          'Financial Cycles',
          'Wealth Houses',
          'Risk Assessment',
          'Prosperity Opportunities'
        ],
        tradition: 'Vedic financial astrology with planetary wealth analysis',
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Generates financial summary from analysis.
   * @param {Object} result - Financial analysis result.
   * @returns {string} Summary.
   * @private
   */
  _generateFinancialSummary(result) {
    let summary = '💰 *Financial Astrology Analysis*\n\n';

    summary += '*Wealth Planets:*\n';
    result.wealthPlanets.forEach(planet => {
      summary += `• ${planet.planet}: ${planet.interpretation}\n`;
    });

    summary += `\n*Financial Cycles:*
`;
    result.financialCycles.forEach(cycle => {
      summary += `• ${cycle.cycle}: ${cycle.description}\n`;
    });

    summary += `\n*Wealth Houses:*
`;
    result.wealthHouses.forEach(house => {
      summary += `• ${house.house}: ${house.interpretation}\n`;
    });

    summary += `\n*Financial Strategy:*
${result.strategy}\n\n`;

    return summary;
  }

  /**
   * Returns metadata for the service.
   * @returns {Object} Service metadata.
   */
  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['processCalculation'],
      dependencies: [], // Managed by ServiceTemplate
      description: 'Wealth, investments, and financial analysis service.'
    };
  }

  /**
   * Returns help information for the service.
   * @returns {string} Help text.
   */
  getHelp() {
    return `
💰 **Financial Astrology Service - Wealth & Investment Analysis**

**Purpose:** Provides financial astrology calculations including wealth planets, cycles, and strategies for wealth building and investment timing.

**Required Inputs:**
• Birth data (Object with birthDate, birthTime, birthPlace)

**Analysis Includes:**
• **Wealth Planets:** Identification of planets influencing financial prosperity.
• **Financial Cycles:** Analysis of planetary periods impacting wealth and investments.
• **Wealth Houses:** Insights from the 2nd, 8th, and 11th houses regarding financial matters.
• **Risk Assessment:** Evaluation of investment risk levels and potential challenges.
• **Prosperity Opportunities:** Identification of favorable times and strategies for wealth accumulation.

**Example Usage:**
"Analyze my financial astrology for birth date 1990-06-15T06:45:00.000Z in New Delhi."
"What are my wealth planets and financial cycles?"

**Output Format:**
Comprehensive report with wealth indicators, financial cycles, risk assessment, and prosperity strategies.
    `.trim();
  }
}

module.exports = FinancialAstrologyService;
