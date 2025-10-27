require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.XAI_API_KEY;
const API_URL = 'https://api.x.ai/v1/chat/completions'; // Confirm endpoint

async function testGrokAPI() {
  try {
    const response = await axios.post(API_URL, {
      model: 'grok-1', // Adjust model name if needed
      messages: [{ role: 'user', content: 'Hello, test message' }],
      max_tokens: 50
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('API Test Successful:', response.data);
  } catch (error) {
    console.error('API Test Failed:', error.response ? error.response.data : error.message);
  }
}

testGrokAPI();