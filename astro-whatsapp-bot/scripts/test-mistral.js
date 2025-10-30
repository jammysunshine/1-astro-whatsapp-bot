require('dotenv').config();
const mistralService = require('./src/services/ai/MistralAIService');

async function testMistral() {
  console.log('Testing Mistral AI Service...');

  if (!mistralService.isConfigured()) {
    console.log('Mistral API key not configured.');
    return;
  }

  try {
    const response = await mistralService.generateResponse('Hello, what is astrology?');
    console.log('Response:', response);
  } catch (error) {
    console.error('Error:', error);
  }
}

testMistral();