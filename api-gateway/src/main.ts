import './tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthMiddleware } from './auth.middleware';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[Global Logger] ${req.method} ${req.url}`);
    next();
  });

  const express = require('express');
  app.use(express.json());

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  const proxy = require('express-http-proxy');

  // Middleware for authentication
  const authMiddleware = new AuthMiddleware();

  // بوابة بوابة المنتجات
  app.use('/products', (req: Request, res: Response, next: NextFunction) => {
    authMiddleware.use(req, res, () => {
      proxy('http://products-ms:3002', {
        proxyReqPathResolver: (req: any) => {
          const url = req.url === '/' ? '' : req.url;
          return `/api/products${url}`;
        },
      })(req, res, next);
    });
  });

  // بوابة بوابة الطلبات
  app.use('/orders', (req: Request, res: Response, next: NextFunction) => {
    authMiddleware.use(req, res, () => {
      proxy('http://orders-ms:3003', {
        proxyReqPathResolver: (req: any) => {
          const url = req.url === '/' ? '' : req.url;
          return `/api/orders${url}`;
        },
      })(req, res, next);
    });
  });

  // بوابة خدمة الهوية - Manual Proxy
  app.use('/auth', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = `http://auth-ms:3001${req.originalUrl}`;
      console.log(`[API Gateway] Manual Proxy to: ${url}`);

      // Handle OPTIONS preflight request
      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.status(204).send();
        return;
      }

      console.log(`[API Gateway] Incoming headers:`, req.headers);

      const headers: Record<string, string> = {};
      // Only forward specific headers for now to debug
      if (req.headers['content-type']) {
        headers['content-type'] = req.headers['content-type'] as string;
      }
      if (req.headers['authorization']) {
        headers['authorization'] = req.headers['authorization'] as string;
      }

      let body = undefined;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        console.log(`[API Gateway] Request body object keys:`, Object.keys(req.body || {}));
        body = JSON.stringify(req.body);
        console.log(`[API Gateway] Stringified body length:`, body ? body.length : 0);

        if (!headers['content-type']) {
          headers['content-type'] = 'application/json';
        }
      }

      // Fetch should be outside the body preparation block
      const response = await fetch(url, {
        method: req.method,
        headers: headers,
        body: body,
      });

      console.log(`[API Gateway] Received from auth-ms: ${response.status}`);

      res.status(response.status);
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      const data = await response.text();
      res.send(data);

    } catch (error) {
      console.error('[API Gateway] Manual Proxy Error:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Proxy Error', error: String(error) });
      }
    }
  });

  const port = 80;
  await app.listen(port);
  console.log(`[API Gateway] is running on port: ${port}`);
}
bootstrap();
