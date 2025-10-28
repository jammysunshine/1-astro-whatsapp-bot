const axios = require('axios');
const logger = require('../../utils/logger');

class MistralAIService {
  constructor() {
    this.apiKey = process.env.MISTRAL_API_KEY;
    this.baseUrl = 'https://api.mistral.ai/v1';
    this.defaultModel = process.env.MISTRAL_MODEL || 'mistral-small-latest'; // Use smaller model for free tier

    if (!this.apiKey) {
      logger.warn('⚠️ MISTRAL_API_KEY not set. AI features will be limited.');
    }
  }

  /**
   * Generate a response using Mistral API
   * @param {string} prompt - The prompt to send to the AI
   * @param {string} model - Optional model to use (defaults to mistral-small-latest)
   * @returns {Promise<string>} The AI-generated response
   */
  async generateResponse(prompt, model = null) {
    if (!this.apiKey) {
      logger.warn('Mistral API key not configured, returning default response');
      return 'AI response unavailable. Please configure MISTRAL_API_KEY in environment variables.';
    }

    // Basic sanitization: limit length and remove some special characters
    const sanitizedPrompt = prompt.substring(0, 1000) // Limit prompt length
                                  .replace(/[<>'"`]/g, ''); // Remove common injection characters

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: model || this.defaultModel,
          messages: [
            {
              role: 'user',
              content: sanitizedPrompt // Use sanitized prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      logger.info('✅ Mistral API call successful');
      return aiResponse.trim();
    } catch (error) {
      // Truncate long error messages
      const errorMessage = error.message && error.message.length > 200 ?
        `${error.message.substring(0, 200)}...` :
        error.message;
      logger.error('❌ Error calling Mistral API:', errorMessage);

      if (error.response && error.response.data) {
        const responseData = typeof error.response.data === 'string' ?
          error.response.data :
          JSON.stringify(error.response.data);
        const truncatedData = responseData.length > 500 ?
          `${responseData.substring(0, 500)}...` :
          responseData;
        logger.error('Response data:', truncatedData);
      }
      return 'Sorry, I\'m having trouble connecting to the AI service right now. Please try again later.';
    }
  }

  /**
   * Generate astrology-specific response
   * @param {string} prompt - The astrology-related prompt
   * @returns {Promise<string>} The AI-generated astrology response
   */
  async generateAstrologyResponse(prompt) {
    const fullPrompt = `As an expert Vedic astrologer and cosmic guide, provide a detailed, personalized, and insightful response about astrology. The user has asked: ${prompt}

Please provide a comprehensive response that includes:
- Vedic astrological interpretations
- Practical guidance
- Positive and encouraging tone
- Connection to cosmic wisdom

Keep the response meaningful but concise, and format it with appropriate emojis and structure.`;

    return await this.generateResponse(fullPrompt);
  }

  /**
   * Check if the service is properly configured
   * @returns {boolean} True if API key is set
   */
  isConfigured() {
    return !!this.apiKey;
  }
}

// Initialize and export a single instance
const mistralAIService = new MistralAIService();

logger.info('Module: MistralAIService loaded.');

module.exports = mistralAIService;
