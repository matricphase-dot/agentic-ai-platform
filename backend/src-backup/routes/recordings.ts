import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from "../middleware/auth";
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads/recordings');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Upload recording
router.post('/', authenticate, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Build data object dynamically based on schema fields
    const data: any = {
    };

    const recording = await (prisma as any).recording.create({ data });
    res.json(recording);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload recording' });
  }
});

// Get user's recordings
router.get('/', authenticate, async (req, res) => {
  try {
    const recordings = await (prisma as any).recording.findMany({
      where: { userId: req.user!.id },
      orderBy: { created_at: 'desc' }
    });
    res.json(recordings);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch recordings' });
  }
});

// Get single recording
router.get('/:id', authenticate, async (req, res) => {
  try {
    const recording = await (prisma as any).recording.findFirst({
      where: { id: req.params.id, userId: req.user!.id }
    });
    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }
    res.json(recording);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch recording' });
  }
});

export default router;





