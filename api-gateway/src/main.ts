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
    const breaker = new CircuitBreaker(async (req: Request, res: Response) => {
      console.log(`[Breaker ${serviceName}] Action function started for ${req.method} ${req.url}`);
      return new Promise((resolve, reject) => {
        const proxyMiddleware = proxy(targetUrl, {
          proxyReqPathResolver: (req: any) => {
            const url = req.url === '/' ? '' : req.url;
            console.log(`[Breaker ${serviceName}] proxyReqPathResolver called: baseUrl=${req.baseUrl}, url=${url}`);
            return `${req.baseUrl}${url}`;
          },
          proxyErrorHandler: (err: any, res: Response, next: NextFunction) => {
            console.error(`[Breaker ${serviceName}] proxyErrorHandler caught:`, err);
            reject(err);
          }
        });

        // We use a custom 'finish' listener to know when the proxying is done
        res.on('finish', () => {
          console.log(`[Breaker ${serviceName}] res finished`);
          resolve(undefined);
        });
        res.on('close', () => {
          console.log(`[Breaker ${serviceName}] res closed`);
          resolve(undefined);
        });

        console.log(`[Breaker ${serviceName}] calling proxyMiddleware`);
        proxyMiddleware(req, res, (err: any) => {
          console.log(`[Breaker ${serviceName}] proxyMiddleware callback called with err:`, err);
          if (err) reject(err);
        });
      });
    }, {
      timeout: 10000, // Increased timeout for heavy requests
      errorThresholdPercentage: 50,
      resetTimeout: 30000
    });


    return async (req: Request, res: Response, next: NextFunction) => {
      console.log(`[Breaker ${serviceName}] Middleware invoked`);
      try {
        await breaker.fire(req, res);
        console.log(`[Breaker ${serviceName}] breaker.fire completed successfully`);
      } catch (err: any) {
        console.error(`[API Gateway] Breaker Error catch for ${serviceName}:`, err.message);
        if (!res.headersSent) {
          res.status(503).json(breaker.opened ?
            { message: `${serviceName} Circuit Breaker is OPEN`, error: err.message } :
            { message: `${serviceName} request failed`, error: err.message });
        } else {
          // If headers were sent but we got an error (like a timeout), 
          // we might want to end the response to prevent ERR_INCOMPLETE_CHUNKED_ENCODING
          console.warn(`[API Gateway] Headers already sent for ${serviceName}, but error occurred: ${err.message}`);
          if (!res.writableEnded) res.end();
        }
      }
    };
  };

  // Middleware for authentication
  const authMiddleware = new AuthMiddleware();

  const productsProxy = createServiceProxy('http://products-ms:3002', 'Products Service');
  const ordersProxy = createServiceProxy('http://orders-ms:3003', 'Orders Service');
  const shippingProxy = createServiceProxy('http://shipping-ms:3006', 'Shipping Service');
  const cartProxy = createServiceProxy('http://cart-ms:3007', 'Cart Service');
  const paymentProxy = createServiceProxy('http://payment-ms:3009', 'Payment Service');

  // بوابة المنتجات
  app.use('/api/products', (req: Request, res: Response, next: NextFunction) => {
    productsProxy(req, res, next);
  });

  // بوابة الطلبات
  app.use('/api/orders', (req: Request, res: Response, next: NextFunction) => {
    authMiddleware.use(req, res, () => {
      ordersProxy(req, res, next);
    });
  });

  // بوابة خدمة الشحن
  app.use('/api/shipping', (req: Request, res: Response, next: NextFunction) => {
    authMiddleware.use(req, res, () => {
      shippingProxy(req, res, next);
    });
  });

  // بوابة خدمة السلة
  app.use('/api/cart', (req: Request, res: Response, next: NextFunction) => {
    authMiddleware.use(req, res, () => {
      cartProxy(req, res, next);
    });
  });

  // بوابة خدمة الدفع المحلي
  app.use('/api/payments', (req: Request, res: Response, next: NextFunction) => {
    authMiddleware.use(req, res, () => {
      paymentProxy(req, res, next);
    });
  });

  // بوابة خدمة الهوية
  const authBreaker = new CircuitBreaker(async (url: string, options: any) => {
    const response = await fetch(url, options);
    if (!response.ok && response.status >= 500) throw new Error(`Auth Service Error: ${response.status}`);
    return response;
  }, { timeout: 5000 });

  app.use('/api/auth', async (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') return next();

    try {
      const path = req.url.startsWith('/') ? req.url : `/${req.url}`;
      const url = `http://auth-ms:3001/auth${path}`;
      const headers: Record<string, string> = {};
      if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'] as string;
      if (req.headers['authorization']) headers['authorization'] = req.headers['authorization'] as string;

      let body: string | undefined = undefined;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        if (typeof req.body === 'string') {
          body = req.body;
        } else if (req.body && typeof req.body === 'object') {
          body = JSON.stringify(req.body);
        }
        if (!headers['content-type']) headers['content-type'] = 'application/json';
      }

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
