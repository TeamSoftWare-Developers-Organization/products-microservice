import './tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthMiddleware } from './auth.middleware';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  const proxy = require('express-http-proxy');

  // Middleware for authentication
  const authMiddleware = new AuthMiddleware();

  // بوابة بوابة المنتجات
  app.use('/products', (req: Request, res: Response, next: NextFunction) => authMiddleware.use(req, res, next), proxy('http://localhost:3002', {
    proxyReqPathResolver: (req: any) => {
      const url = req.url === '/' ? '' : req.url;
      return `/api/products${url}`;
    },
  }));

  // بوابة بوابة الطلبات
  app.use('/orders', (req: Request, res: Response, next: NextFunction) => authMiddleware.use(req, res, next), proxy('http://localhost:3003', {
    proxyReqPathResolver: (req: any) => {
      const url = req.url === '/' ? '' : req.url;
      return `/api/orders${url}`;
    },
  }));

  // بوابة خدمة الهوية
  app.use('/auth', proxy('http://localhost:3001', {
    proxyReqPathResolver: (req: any) => {
      const url = req.url === '/' ? '' : req.url;
      return `/auth${url}`;
    },
  }));

  const port = 8080;
  await app.listen(port);
  console.log(`[API Gateway] is running on port: ${port}`);
}
bootstrap();
