import { reviewRepository } from '../repositories/review.repository';
import { llmClient } from '../llm/client';

export const reviewService = {
  async summarizeReviews(productId: number): Promise<string> {
    const existingSummary = await reviewRepository.getReviewSummary(productId);

    // Only generate a new review if the old one is expired
    // This saves us usage while still ensuring the review summary does not get too outdated
    if (existingSummary) {
      return existingSummary;
    }

    const reviews = await reviewRepository.getReviewsByProductId(productId, 10);

    // Map each review object to just the content and join them all into one big string each separated by two line breaks
    const joinedReviews = reviews.map((r) => r.content).join('\n\n');

    const summary = await llmClient.summarizeReviews(joinedReviews);

    await reviewRepository.saveReviewSummary(productId, summary);

    return summary;
  },
};
