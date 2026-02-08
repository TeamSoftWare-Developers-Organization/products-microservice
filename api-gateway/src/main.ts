import './tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthMiddleware } from './auth.middleware';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // تفعيل CORS للواجهة الأمامية
  const proxy = require('express-http-proxy');

  // Middleware for authentication
  const authMiddleware = new AuthMiddleware();

  // بوابة بوابة المنتجات
  app.use('/products', (req: Request, res: Response, next: NextFunction) => authMiddleware.use(req, res, next), proxy('http://products-service:3000', {
    proxyReqPathResolver: (req: any) => {
      const url = req.url === '/' ? '' : req.url;
      return `/api/products${url}`;
    },
  }));

  // بوابة بوابة الطلبات
  app.use('/orders', (req: Request, res: Response, next: NextFunction) => authMiddleware.use(req, res, next), proxy('http://orders-service:3000', {
    proxyReqPathResolver: (req: any) => {
      const url = req.url === '/' ? '' : req.url;
      return `/api/orders${url}`;
    },
  }));

  // بوابة خدمة الهوية
  app.use('/auth', proxy('http://auth-service:3000', {
    proxyReqPathResolver: (req: any) => {
      const url = req.url === '/' ? '' : req.url;
      return `/auth${url}`;
    },
  }));

  const port = 80;
  await app.listen(port);
  console.log(`[API Gateway] is running on port: ${port}`);
}
bootstrap();
