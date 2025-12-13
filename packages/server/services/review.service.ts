import type { Review } from '../generated/prisma/client';
import { reviewRepository } from '../repositories/review.repository';

export const reviewService = {
   async getReviewsForProduct(productId: number): Promise<Review[]> {
      return reviewRepository.getReviewsByProductId(productId);
   },

   async summarizeReviews(productId: number): Promise<string> {
      const reviews = await reviewRepository.getReviewsByProductId(
         productId,
         10
      );

      // Map each review object to just the content and join them all into one big string each separated by two line breaks
      const joinedReviews = reviews.map((r) => r.content).join('\n\n');

      const summary = 'This is a placeholder summary.';

      return summary;
   },
};
