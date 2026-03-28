import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

const apiKey = process.env.GOOGLE_AI_API_KEY;
console.log('🔑 GOOGLE_AI_API_KEY present?', !!apiKey);

const genAI = new GoogleGenerativeAI(apiKey!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// In‑memory conversation store
const conversations = new Map();

router.post('/:agentId/chat', authenticate, async (req: any, res: any) => {
  const { agentId } = req.params;
  const { message } = req.body;
  const userId = req.user.id;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const key = `${userId}-${agentId}`;
    let chat = conversations.get(key);
    if (!chat) {
      chat = model.startChat({
        history: [],
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
      });
      conversations.set(key, chat);
    }

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();
    console.log(`✅ Gemini response for ${agentId}: ${responseText.substring(0, 50)}...`);
    res.json({ response: responseText });
  } catch (error) {
    console.error('❌ Gemini error details:', error);
    // Fallback to echo
    res.json({ response: `Echo from agent ${agentId}: ${message}` });
  }
});

export default router;
