import express from 'express';
import type { Request, Response } from 'express';
import { chatController } from './controllers/chat.controller';
import { reviewController } from './controllers/review.controller';
import { productController } from './controllers/product.controller';

const router = express.Router();

// API routes only - root path handled by React app in production
router.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello World!' });
});

// In real world projects, this is how our route should look!
router.post('/api/chat', chatController.sendMessage);

router.get('/api/products/:id/reviews', reviewController.getReviewsForProduct);

router.post(
  '/api/products/:id/reviews/summarize',
  reviewController.summarizeReviews
);

router.get('/api/products', productController.getProducts);

export default router;
