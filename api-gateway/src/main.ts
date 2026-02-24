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


  const proxy = require('express-http-proxy');
  const CircuitBreaker = require('opossum');

  // Helper for Circuit Breaker logic
  const createServiceProxy = (targetUrl: string, serviceName: string) => {
    const proxyMiddleware = proxy(targetUrl, {
      proxyReqPathResolver: (req: any) => {
        const url = req.url === '/' ? '' : req.url;
        return `${req.baseUrl}${url}`;
      },
      proxyErrorHandler: (err: any, res: Response, next: NextFunction) => {
        next(err);
      }
    });

    const breaker = new CircuitBreaker(async (req: Request, res: Response) => {
      return new Promise((resolve, reject) => {
        // We use a custom 'finish' listener to know when the proxying is done
        res.on('finish', () => resolve(undefined));
        res.on('close', () => resolve(undefined));

        proxyMiddleware(req, res, (err: any) => {
          if (err) reject(err);
        });
      });
    }, {
      timeout: 10000, // Increased timeout for heavy requests
      errorThresholdPercentage: 50,
      resetTimeout: 30000
    });

    breaker.fallback(() => ({ message: `${serviceName} is currently unavailable. Please try again later.` }));

    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await breaker.fire(req, res);
      } catch (err: any) {
        if (!res.headersSent) {
          res.status(503).json(breaker.opened ?
            { message: `${serviceName} Circuit Breaker is OPEN`, error: err.message } :
            { message: `${serviceName} request failed`, error: err.message });
        }
      }
    };
  };

  // Middleware for authentication
  const authMiddleware = new AuthMiddleware();

  const productsProxy = createServiceProxy('http://products-ms:3002', 'Products Service');
  const ordersProxy = createServiceProxy('http://orders-ms:3003', 'Orders Service');

  // بوابة بوابة المنتجات
  app.use('/api/products', (req: Request, res: Response, next: NextFunction) => {
    authMiddleware.use(req, res, () => {
      productsProxy(req, res, next);
    });
  });

  // بوابة بوابة الطلبات
  app.use('/api/orders', (req: Request, res: Response, next: NextFunction) => {
    authMiddleware.use(req, res, () => {
      ordersProxy(req, res, next);
    });
  });

  // بوابة خدمة الهوية - Manual Proxy (also adding breaker here)
  const authBreaker = new CircuitBreaker(async (url: string, options: any) => {
    const response = await fetch(url, options);
    if (!response.ok && response.status >= 500) throw new Error(`Auth Service Error: ${response.status}`);
    return response;
  }, { timeout: 5000 });

  app.use('/api/auth', async (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') return next();

    try {
      const url = `http://auth-ms:3001/auth${req.url}`;
      const headers: Record<string, string> = {};
      if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'] as string;
      if (req.headers['authorization']) headers['authorization'] = req.headers['authorization'] as string;

      let body = req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined;
      if (body && !headers['content-type']) headers['content-type'] = 'application/json';

      const response = await authBreaker.fire(url, {
        method: req.method,
        headers: headers,
        body: body,
      });

      res.status(response.status);
      response.headers.forEach((value: string, key: string) => {
        if (!key.toLowerCase().startsWith('access-control-')) res.setHeader(key, value);
      });
      res.send(await response.text());
    } catch (error: any) {
      console.error('[API Gateway] Auth Proxy Error:', error);
      if (!res.headersSent) res.status(503).json({ message: 'Auth Service unavailable', error: error.message });
    }
  });

  await app.listen(8080);
  console.log(`[API Gateway] is running on port: 8080`);
}
bootstrap();
