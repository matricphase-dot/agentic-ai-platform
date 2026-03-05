import express from 'express';
import { generateConnector } from '../services/autoIntegration';

const router = express.Router();

router.post('/generate', async (req, res) => {
  const { apiName, docsUrl } = req.body;
  if (!apiName || !docsUrl) {
    return res.status(400).json({ error: 'apiName and docsUrl required' });
  }
  try {
    const code = await generateConnector(apiName, docsUrl);
    res.json({ apiName, code });
  } catch (err: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;












