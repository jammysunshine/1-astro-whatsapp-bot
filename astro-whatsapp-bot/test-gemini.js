require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

async function testGeminiAPI() {
  try {
    const response = await axios.post(API_URL, {
      contents: [{
        parts: [{ text: 'Hello, test message for astrology bot integration' }]
      }]
    });

    console.log('API Test Successful:', response.data);
  } catch (error) {
    console.error('API Test Failed:', error.response ? error.response.data : error.message);
  }
}

testGeminiAPI();