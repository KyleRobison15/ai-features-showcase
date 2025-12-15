import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

export const productRepository = {
   getProductById(productId: number) {
      return prisma.product.findUnique({
         where: { id: productId },
      });
   },
};
