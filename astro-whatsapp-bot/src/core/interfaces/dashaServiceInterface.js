const AstroServiceInterface = require('./astroServiceInterface');

class DashaServiceInterface extends AstroServiceInterface {
  /**
   * Calculate current dasha periods
   * @param {Object} birthData - Birth information
   * @returns {Promise<Object>} - Current dasha information
   */
  async getCurrentDasha(birthData) {
    throw new Error('getCurrentDasha method must be implemented');
  }

  /**
   * Get dasha predictions for a period
   * @param {Object} birthData - Birth information
   * @param {Object} period - Time period to analyze
   * @returns {Promise<Object>} - Dasha predictions
   */
  async getDashaPredictions(birthData, period) {
    throw new Error('getDashaPredictions method must be implemented');
  }
}

module.exports = DashaServiceInterface;