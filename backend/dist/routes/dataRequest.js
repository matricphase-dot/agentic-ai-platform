"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get user's data requests
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const requests = await prisma_1.prisma.dataRequest.findMany({
            where: { userId: req.user.id },
            orderBy: { requestedAt: 'desc' }
        });
        res.json(requests);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});
// Create a new data request
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { type, notes } = req.body;
        if (!type)
            return res.status(400).json({ error: 'Type is required' });
        const request = await prisma_1.prisma.dataRequest.create({
            data: {
                userId: req.user.id,
                type,
                notes,
                status: 'PENDING'
            }
        });
        res.status(201).json(request);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create request' });
    }
});
// For admins – update request status (we can add admin middleware later)
router.put('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const request = await prisma_1.prisma.dataRequest.findUnique({ where: { id } });
        if (!request)
            return res.status(404).json({ error: 'Request not found' });
        // Check if user is admin (simplified – you can enhance)
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }
        const updated = await prisma_1.prisma.dataRequest.update({
            where: { id },
            data: {
                status,
                notes,
                completedAt: status === 'COMPLETED' ? new Date() : null
            }
        });
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update request' });
    }
});
exports.default = router;
