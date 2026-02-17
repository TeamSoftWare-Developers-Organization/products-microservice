import { Controller, Post, Get, Delete, Req, Res, UseGuards, Body } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { AuthGuard } from './roles/auth.guard';
const proxy = require('express-http-proxy');

@Controller('products')
export class ProductsController {
    @Post()
    @Roles('admin')
    @UseGuards(AuthGuard, RolesGuard)
    createProduct(@Req() req: Request, @Res() res: Response) {
        this.proxyRequest(req, res);
    }

    @Get()
    getProducts(@Req() req: Request, @Res() res: Response) {
        this.proxyRequest(req, res);
    }

    @Get(':id')
    getProduct(@Req() req: Request, @Res() res: Response) {
        this.proxyRequest(req, res);
    }

    @Post(':id') // Sometimes updates use POST or specific actions
    @Roles('admin')
    @UseGuards(AuthGuard, RolesGuard)
    updateProductPost(@Req() req: Request, @Res() res: Response) {
        this.proxyRequest(req, res);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id')
    deleteProduct(@Req() req: Request, @Res() res: Response) {
        this.proxyRequest(req, res);
    }

    // Creating a private method effectively requires the 'proxy' variable to be available 
    // or passed, or we can just define it inside. 
    // Since we are replacing the whole class logic, let's include the helper.
    private proxyRequest(req: Request, res: Response) {
        const proxyDelegate = proxy('http://products-ms:3002', {
            proxyReqPathResolver: (req: any) => {
                // In Controller, req.url includes the path after /products
                // e.g. /products/123 -> req.url = /123 (if routed via Express router logic inside Nest?) 
                // NestJS Req object is the underlying Express object.
                // Unlike app.use('/products'), the Controller route might NOT strip the prefix from req.url 
                // depending on how NestJS handles it internally with @Controller.
                // However, usually req.originalUrl is full path. req.url is somewhat ambiguous in Nest.
                // Let's use req.originalUrl to be safe and strip '/products'.

                // If originalUrl is /products/123, we want /api/products/123
                // If originalUrl is /products, we want /api/products

                const originalUrl = req.originalUrl;
                // Assuming Gateway is mounted at root. 
                // Replace /products with /api/products
                return originalUrl.replace('/products', '/api/products');
            },
        });
        return proxyDelegate(req, res, (err: any) => {
            if (err) {
                res.status(500).send(err);
            }
        });
    }
}
