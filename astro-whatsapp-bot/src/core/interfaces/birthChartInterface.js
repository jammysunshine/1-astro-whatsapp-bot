const AstroServiceInterface = require('./astroServiceInterface');

class BirthChartServiceInterface extends AstroServiceInterface {
  /**
   * Generate complete birth chart
   * @param {Object} birthData - Birth information
   * @returns {Promise<Object>} - Complete birth chart data
   */
  async generateVedicKundli(birthData) {
    throw new Error('generateVedicKundli method must be implemented');
  }

  /**
   * Get birth chart analysis
   * @param {Object} chartData - Chart data
   * @returns {Object} - Analysis result
   */
  analyzeChart(chartData) {
    throw new Error('analyzeChart method must be implemented');
  }
}

module.exports = BirthChartServiceInterface;