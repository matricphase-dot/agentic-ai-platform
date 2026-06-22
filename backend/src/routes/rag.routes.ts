import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { authMiddleware } from '../middleware/auth.middleware';
import { RAGService } from '../services/rag.service';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  dest: '/tmp/uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported. Use PDF, TXT, MD, or DOCX.'));
    }
  },
});

// GET /api/agents/:agentId/knowledge-bases
router.get(
  '/agents/:agentId/knowledge-bases',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const kbs = await prisma.knowledgeBase.findMany({
        where: {
          agentId: req.params.agentId,
          userId: (req as any).user!.id,
        },
        include: {
          documents: true,
          _count: { select: { documents: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ success: true, data: kbs });
    } catch (error) {
      logger.error('Get knowledge bases failed', { error });
      return res.status(500).json({ success: false, message: 'Failed to get knowledge bases' });
    }
  }
);

// POST /api/agents/:agentId/knowledge-bases
router.post(
  '/agents/:agentId/knowledge-bases',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;
      
      const agent = await prisma.agent.findFirst({
        where: { id: req.params.agentId, userId: (req as any).user!.id },
      });
      
      if (!agent) {
        return res.status(404).json({ success: false, message: 'Agent not found' });
      }
      
      const kb = await prisma.knowledgeBase.create({
        data: {
          agentId: req.params.agentId,
          userId: (req as any).user!.id,
          name: name || 'Knowledge Base',
          description,
          status: 'ready',
        },
      });
      
      // Enable RAG on agent
      await prisma.agent.update({
        where: { id: req.params.agentId },
        data: { ragEnabled: true },
      });
      
      return res.status(201).json({ success: true, data: kb });
    } catch (error) {
      logger.error('Create knowledge base failed', { error });
      return res.status(500).json({ success: false, message: 'Failed to create knowledge base' });
    }
  }
);

// POST /api/knowledge-bases/:id/upload
router.post(
  '/knowledge-bases/:id/upload',
  authMiddleware,
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      const file = (req as any).file;
      if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      
      const kb = await prisma.knowledgeBase.findFirst({
        where: { id: req.params.id, userId: (req as any).user!.id },
      });
      
      if (!kb) {
        return res.status(404).json({ success: false, message: 'Knowledge base not found' });
      }
      
      const document = await prisma.knowledgeDocument.create({
        data: {
          knowledgeBaseId: kb.id,
          filename: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          status: 'processing',
        },
      });
      
      // Process in background
      RAGService.processDocument(
        kb.id,
        document.id,
        file.path,
        file.mimetype
      ).catch(err => {
        logger.error('Background document processing failed', { err });
      });
      
      return res.json({
        success: true,
        data: document,
        message: 'Document uploaded and processing started',
      });
    } catch (error) {
      logger.error('Document upload failed', { error });
      return res.status(500).json({ success: false, message: 'Upload failed' });
    }
  }
);

// DELETE /api/knowledge-bases/:id
router.delete(
  '/knowledge-bases/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const kb = await prisma.knowledgeBase.findFirst({
        where: { id: req.params.id, userId: (req as any).user!.id },
      });
      
      if (!kb) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }
      
      await prisma.knowledgeBase.delete({ where: { id: kb.id } });
      
      return res.json({ success: true, message: 'Knowledge base deleted' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Delete failed' });
    }
  }
);

// POST /api/knowledge-bases/:id/search
router.post(
  '/knowledge-bases/:id/search',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ success: false, message: 'Query required' });
      }
      
      const results = await RAGService.search(req.params.id, query);
      return res.json({ success: true, data: results });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Search failed' });
    }
  }
);

export { router as ragRouter };
