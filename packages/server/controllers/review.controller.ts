import type { Request, Response } from 'express';
import { reviewService } from '../services/review.service';
import { productRepository } from '../repositories/product.repository';
import { reviewRepository } from '../repositories/review.repository';

export const reviewController = {
  async getReviewsForProduct(req: Request, res: Response) {
    const productId = Number(req.params.id);

    if (isNaN(productId)) {
      res.status(400).json({ error: 'Invalid product ID.' });
      return;
    }

    const product = await productRepository.getProductById(productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const reviews = await reviewRepository.getReviewsByProductId(productId);
    const summaryData = await reviewRepository.getReviewSummary(productId);

    res.json({
      summary: summaryData?.content || null,
      summaryExpiresAt: summaryData?.expiresAt || null,
      reviews,
    });
  },

  async summarizeReviews(req: Request, res: Response) {
    const productId = Number(req.params.id);

    if (isNaN(productId)) {
      res.status(400).json({ error: 'Invalid product ID.' });
      return;
    }

    const product = await productRepository.getProductById(productId);

    if (!product) {
      res.status(400).json({ error: 'Invalid product.' });
      return;
    }

    const reviews = await reviewRepository.getReviewsByProductId(productId, 1);
    if (!reviews.length) {
      res.status(400).json({
        error: 'There are no reviews to summarize for this product.',
      });
      return;
    }

    const summary = await reviewService.summarizeReviews(productId);

    res.json({ summary });
  },
};
