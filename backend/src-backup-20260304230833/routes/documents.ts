import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from "../middleware/auth";
import { addDocumentToVectorStore, answerQuestion } from '../services/ragService';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/plain', 'text/markdown', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt, .md, and .pdf files are allowed'));
    }
  },
});

// Upload a document
router.post('/', authenticate, upload.single('file'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.id;
    const fileName = req.file.originalname;

    // Read file content
    let content = '';
    if (req.file.mimetype === 'application/pdf') {
      // For PDF, we'd need pdf-parse; for now, just a placeholder
      content = '[PDF content extraction not implemented in demo; please use text files]';
    } else {
      content = fs.readFileSync(req.file.path, 'utf-8');
    }

    // Add to vector store
    await addDocumentToVectorStore(userId, fileName, content);

    res.json({ 
      message: 'Document uploaded and indexed successfully',
      document: {
        fileName,
        size: req.file.size,
      }
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// Ask a question (RAG query)
router.post('/query', authenticate, async (req: any, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const userId = req.user.id;
    const answer = await answerQuestion(userId, question);

    res.json({ answer });
  } catch (error: any) {
    console.error('Query error:', error);
    res.status(500).json({ error: error.message || 'Query failed' });
  }
});

// Simple GET to confirm route works
router.get('/', authenticate, (req: any, res) => {
  res.json({ message: 'Documents API is working' });
});

export default router;







