import type { Review } from '../generated/prisma/client';
import { reviewRepository } from '../repositories/review.repository';

export const reviewService = {
   async getReviewsForProduct(productId: number): Promise<Review[]> {
      return reviewRepository.getReviewsByProductId(productId);
   },
};
