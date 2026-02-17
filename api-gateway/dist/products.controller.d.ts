import type { Request, Response } from 'express';
export declare class ProductsController {
    createProduct(req: Request, res: Response): void;
    getProducts(req: Request, res: Response): void;
    getProduct(req: Request, res: Response): void;
    updateProductPost(req: Request, res: Response): void;
    deleteProduct(req: Request, res: Response): void;
    private proxyRequest;
}
