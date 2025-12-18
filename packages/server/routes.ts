import express from 'express';
import type { Request, Response } from 'express';
import { chatController } from './controllers/chat.controller';
import { reviewController } from './controllers/review.controller';
import { productController } from './controllers/product.controller';
import {
  aiRateLimiter,
  summarizeRateLimiter,
  apiRateLimiter,
} from './middleware/rateLimiter';

const router = express.Router();

// API routes only - root path handled by React app in production
router.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello World!' });
});

// AI chatbot endpoint - strict rate limit (10 requests per 15 min)
router.post('/api/chat', aiRateLimiter, chatController.sendMessage);

// Get reviews - general rate limit (100 requests per 15 min)
router.get(
  '/api/products/:id/reviews',
  apiRateLimiter,
  reviewController.getReviewsForProduct
);

// Summarize reviews - very strict rate limit (5 requests per 15 min)
router.post(
  '/api/products/:id/reviews/summarize',
  summarizeRateLimiter,
  reviewController.summarizeReviews
);

// Get products - general rate limit (100 requests per 15 min)
router.get('/api/products', apiRateLimiter, productController.getProducts);

export default router;
