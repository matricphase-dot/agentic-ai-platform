import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get all reviews for a template
router.get('/template/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { templateId },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    });
    // Calculate average rating
    const avg = reviews.length
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;
    res.json({ reviews, averageRating: avg, count: reviews.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create a review (authenticated)
router.post('/', authenticate, async (req, res) => {
  try {
    const { templateId, rating, comment } = req.body;
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    // Check if user already reviewed this template
    const existing = await prisma.review.findUnique({
      where: {
        userId_templateId: {
          userId: req.user!.id,
          templateId
        }
      }
    });
    if (existing) {
      return res.status(400).json({ error: 'You have already reviewed this template' });
    }
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        userId: req.user!.id,
        templateId
      }
    });
    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Update a review (authenticated, owner only)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const updated = await prisma.review.update({
      where: { id },
      data: { rating, comment }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete a review (authenticated, owner only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await prisma.review.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
