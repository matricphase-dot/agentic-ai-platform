"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const ragService_1 = require("../services/ragService");
const router = (0, express_1.Router)();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['text/plain', 'text/markdown', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Only .txt, .md, and .pdf files are allowed'));
        }
    },
});
// Upload a document
router.post('/', auth_1.authenticate, upload.single('file'), async (req, res) => {
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
        }
        else {
            content = fs_1.default.readFileSync(req.file.path, 'utf-8');
        }
        // Add to vector store
        await (0, ragService_1.addDocumentToVectorStore)(userId, fileName, content);
        res.json({
            message: 'Document uploaded and indexed successfully',
            document: {
                fileName,
                size: req.file.size,
            }
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message || 'Upload failed' });
    }
});
// Ask a question (RAG query)
router.post('/query', auth_1.authenticate, async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }
        const userId = req.user.id;
        const answer = await (0, ragService_1.answerQuestion)(userId, question);
        res.json({ answer });
    }
    catch (error) {
        console.error('Query error:', error);
        res.status(500).json({ error: error.message || 'Query failed' });
    }
});
// Simple GET to confirm route works
router.get('/', auth_1.authenticate, (req, res) => {
    res.json({ message: 'Documents API is working' });
});
exports.default = router;
