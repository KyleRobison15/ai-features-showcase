import OpenAI from 'openai';
import type { Review } from '../generated/prisma/client';
import { reviewRepository } from '../repositories/review.repository';

const client = new OpenAI({
   apiKey: process.env.OPENAI_API_KEY,
});

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

      const prompt = `Summarize the follwoing customer reviews into a single short paragraph, highlighting key thems, both positive and negative: \n ${joinedReviews}`;

      const response = await client.responses.create({
         model: 'gpt-4o-mini',
         input: prompt,
         temperature: 0.2,
         max_output_tokens: 350,
      });

      return response.output_text;
   },
};
