import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import axios from 'axios';

const router = Router();

router.post('/:agentId/chat', authenticate, async (req: any, res: Response) => {
  const { agentId } = req.params;
  const { message } = req.body;
  const user = req.user;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Attempt to use Ollama (assumes it's running on localhost:11434)
    let responseText = '';
    try {
      const ollamaRes = await axios.post('http://localhost:11434/api/generate', {
        model: 'llama2', // you can change this to your preferred model
        prompt: message,
        stream: false,
      });
      responseText = ollamaRes.data.response;
    } catch (ollamaError) {
      console.warn('Ollama not available, falling back to echo mock:', ollamaError.message);
      // Fallback to echo mock
      responseText = `Echo from agent ${agentId}: ${message}`;
    }

    // Optionally store the message in the database (if you have a messages table for user-agent chat)
    // await prisma.message.create({ data: { ... } });

    res.json({ response: responseText });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
});

export default router;
