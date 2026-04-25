import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
  if (!process.env.GOOGLE_AI_API_KEY) {
    console.log('GOOGLE_AI_API_KEY not set - skipping test');
    return;
  }
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Say hello in one sentence.');
    console.log('Gemini test passed:', result.response.text());
  } catch (error) {
    console.error('Gemini test failed:', error);
  }
}

test();
