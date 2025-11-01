const logger = require('../../utils/logger');
const { createIChingService } = require('./iching');

// Enhanced I Ching reader implementation using the new modular I Ching service
class IChingReader {
  constructor() {
    this.ichingService = null;
    this.initializeAsync().catch(error => {
      logger.error('Failed to initialize IChingService:', error);
    });
  }

  async initializeAsync() {
    try {
      this.ichingService = await createIChingService();
      logger.info('IChingReader: Successfully initialized IChingService');
    } catch (error) {
      logger.error('IChingReader: Failed to initialize IChingService:', error);
      throw error;
    }
  }

  async generateIChingReading(question, coins = 'random') {
    try {
      // Ensure the service is initialized
      if (!this.ichingService) {
        await this.initializeAsync();
      }

      // Use the proper I Ching service for generating readings
      const reading = await this.ichingService.performIChingReading(question);

      return reading;
    } catch (error) {
      logger.error('IChingReader: Error generating I Ching reading:', error);

      // Fallback to basic implementation if service fails
      return {
        question,
        hexagram: 'Creative',
        symbol: '☰',
        interpretation: 'The I Ching presents The Creative as guidance for your question.',
        error: 'Using fallback implementation due to service error'
      };
    }
  }
}

const ichingReader = new IChingReader();

const generateIChingReading = (question, coins) => ichingReader.generateIChingReading(question, coins);

module.exports = {
  IChingReader,
  ichingReader,
  generateIChingReading
};
