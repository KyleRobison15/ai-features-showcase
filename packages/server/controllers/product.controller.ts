import type { Request, Response } from 'express';
import { productRepository } from '../repositories/product.repository';

export const productController = {
  async getProducts(req: Request, res: Response) {
    const products = await productRepository.getAllProducts();
    res.json(products);
  },
};
