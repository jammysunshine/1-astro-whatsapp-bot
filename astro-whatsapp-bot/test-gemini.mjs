import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({}); // Assumes GEMINI_API_KEY is set

async function run() {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'why is the sky blue?',
  });

  console.log(response.text); // output is often markdown
}

run();