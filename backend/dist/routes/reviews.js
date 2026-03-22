"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all reviews for a template
router.get('/template/:templateId', async (req, res) => {
    try {
        const { templateId } = req.params;
        const reviews = await prisma_1.prisma.reviews.findMany({
            where: { templateId },
            include: { user: { select: { name: true, avatar: true } } },
            orderBy: { createdAt: 'desc' }
        });
        const avg = reviews.length
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            : 0;
        res.json({ reviews, averageRating: avg, count: reviews.length });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});
// Create a review (authenticated)
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { templateId, rating, comment } = req.body;
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        const existing = await prisma_1.prisma.reviews.findUnique({
            where: {
                userId_templateId: {
                    userId: req.user.id,
                    templateId
                }
            }
        });
        if (existing) {
            return res.status(400).json({ error: 'You have already reviewed this template' });
        }
        const review = await prisma_1.prisma.reviews.create({
            data: {
                rating,
                comment,
                userId: req.user.id,
                templateId
            }
        });
        res.status(201).json(review);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create review' });
    }
});
// Update a review (authenticated)
router.put('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const review = await prisma_1.prisma.reviews.findUnique({ where: { id } });
        if (!review)
            return res.status(404).json({ error: 'Review not found' });
        if (review.userId !== req.user.id)
            return res.status(403).json({ error: 'Not authorized' });
        const updated = await prisma_1.prisma.reviews.update({
            where: { id },
            data: { rating, comment }
        });
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update review' });
    }
});
// Delete a review (authenticated)
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const review = await prisma_1.prisma.reviews.findUnique({ where: { id } });
        if (!review)
            return res.status(404).json({ error: 'Review not found' });
        if (review.userId !== req.user.id)
            return res.status(403).json({ error: 'Not authorized' });
        await prisma_1.prisma.reviews.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});
// Get current user's reviews
router.get('/user', auth_1.authenticate, async (req, res) => {
    try {
        const reviews = await prisma_1.prisma.reviews.findMany({
            where: { userId: req.user.id },
            include: { template: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reviews);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});
exports.default = router;
