"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Ensure uploads directory exists
const uploadDir = path_1.default.join(__dirname, '../../uploads/recordings');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage });
// Upload recording
router.post('/', auth_1.authenticate, upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Build data object dynamically based on schema fields
        const data = {};
        const recording = await prisma.recording.create({ data });
        res.json(recording);
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload recording' });
    }
});
// Get user's recordings
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const recordings = await prisma.recording.findMany({
            where: { userId: req.user.id },
            orderBy: { created_at: 'desc' }
        });
        res.json(recordings);
    }
    catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch recordings' });
    }
});
// Get single recording
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const recording = await prisma.recording.findFirst({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!recording) {
            return res.status(404).json({ error: 'Recording not found' });
        }
        res.json(recording);
    }
    catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch recording' });
    }
});
exports.default = router;
