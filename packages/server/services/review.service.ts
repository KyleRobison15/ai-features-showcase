import type { Review } from '../generated/prisma/client';
import { reviewRepository } from '../repositories/review.repository';
import { llmClient } from '../llm/client';
import template from '../prompts/summarize-reviews.txt';

export const reviewService = {
   async getReviewsForProduct(productId: number): Promise<Review[]> {
      return reviewRepository.getReviewsByProductId(productId);
   },

   async summarizeReviews(productId: number): Promise<string> {
      const existingSummary =
         await reviewRepository.getReviewSummary(productId);

      // Only generate a new review if the old one is expired
      // This saves us usage while still ensuring the review summary does not get too outdated
      if (existingSummary && existingSummary.expiresAt > new Date()) {
         return existingSummary.content;
      }

      const reviews = await reviewRepository.getReviewsByProductId(
         productId,
         10
      );
      // Map each review object to just the content and join them all into one big string each separated by two line breaks
      const joinedReviews = reviews.map((r) => r.content).join('\n\n');
      const prompt = template.replace('{{reviews}}', joinedReviews);

      const { text: summary } = await llmClient.generateText({
         model: 'gpt-4o-mini',
         prompt,
         temperature: 0.2,
         maxTokens: 350,
      });

      await reviewRepository.saveReviewSummary(productId, summary);

      return summary;
   },
};
