import express from 'express';
import type { Request, Response } from 'express';
import { chatController } from './controllers/chat.controller';
import { PrismaClient } from './generated/prisma/client';
import { reviewController } from './controllers/review.controller';

const router = express.Router();

// In real world projects, we shouldn't have the actual route handlers here, we should just have a reference to a function inside a controller
router.get('/', (req: Request, res: Response) => {
   res.send('Hello World!');
});

// In real world projects, we shouldn't have the actual route handlers here, we should just have a reference to a function inside a controller
router.get('/api/hello', (req: Request, res: Response) => {
   res.json({ message: 'Hello World!' });
});

// In real world projects, this is how our route should look!
router.post('/api/chat', chatController.sendMessage);

router.get('/api/products/:id/reviews', reviewController.getReviewsForProduct);

export default router;
