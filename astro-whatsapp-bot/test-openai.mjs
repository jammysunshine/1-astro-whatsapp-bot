import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testOpenAI() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello, test message for astrology bot integration' }],
    });
    console.log('OpenAI Test Successful:', response.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI Test Failed:', error.message);
  }
}

testOpenAI();