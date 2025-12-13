import { PrismaClient, type Review } from '../generated/prisma/client';

const prisma = new PrismaClient();

export const reviewRepository = {
   async getReviewsByProductId(productId: number): Promise<Review[]> {
      // SELECT * FROM reviews WHERE productId = @productId ORDER BY createdAt DESC
      return await prisma.review.findMany({
         where: { productId },
         orderBy: { createdAt: 'desc' },
      });
   },
};
