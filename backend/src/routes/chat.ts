import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

router.post('/:agentId/chat', authenticate, async (req: any, res: Response) => {
  const { agentId } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const result = await model.generateContent(message);
    const responseText = result.response.text();
    res.json({ response: responseText });
  } catch (error) {
    console.error('Gemini error:', error);
    // Fallback to echo
    res.json({ response: `Echo from agent ${agentId}: ${message}` });
  }
});

export default router;
