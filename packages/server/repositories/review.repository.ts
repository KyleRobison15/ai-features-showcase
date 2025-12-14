import dayjs from 'dayjs';
import { PrismaClient, type Review } from '../generated/prisma/client';

const prisma = new PrismaClient();

export const reviewRepository = {
   async getReviewsByProductId(
      productId: number,
      limit?: number
   ): Promise<Review[]> {
      // SELECT * FROM reviews WHERE productId = @productId ORDER BY createdAt DESC
      return await prisma.review.findMany({
         where: { productId },
         orderBy: { createdAt: 'desc' },
         take: limit,
      });
   },

   saveReviewSummary(productId: number, summary: string) {
      const now = new Date();
      const expiresAt = dayjs().add(7, 'days').toDate();
      const data = {
         content: summary,
         expiresAt,
         generatedAt: now,
         productId,
      };

      return prisma.summary.upsert({
         where: { productId },
         create: data,
         update: data,
      });
   },

   async getReviewSummary(productId: number): Promise<string | null> {
      const summary = await prisma.summary.findFirst({
         where: {
            AND: [{ productId }, { expiresAt: { gt: new Date() } }],
         },
      });

      return summary ? summary.content : null;
   },
};
