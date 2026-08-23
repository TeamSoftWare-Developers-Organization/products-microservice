"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./tracing");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const auth_middleware_1 = require("./auth.middleware");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((req, res, next) => {
        console.log(`[Global Logger] ${req.method} ${req.url}`);
        next();
    });
    const express = require('express');
    app.use(express.json());
    const proxy = require('express-http-proxy');
    const CircuitBreaker = require('opossum');
    const createServiceProxy = (targetUrl, serviceName) => {
        const breaker = new CircuitBreaker(async (req, res) => {
            console.log(`[Breaker ${serviceName}] Action function started for ${req.method} ${req.url}`);
            return new Promise((resolve, reject) => {
                const proxyMiddleware = proxy(targetUrl, {
                    proxyReqPathResolver: (req) => {
                        const url = req.url === '/' ? '' : req.url;
                        console.log(`[Breaker ${serviceName}] proxyReqPathResolver called: baseUrl=${req.baseUrl}, url=${url}`);
                        return `${req.baseUrl}${url}`;
                    },
                    proxyErrorHandler: (err, res, next) => {
                        console.error(`[Breaker ${serviceName}] proxyErrorHandler caught:`, err);
                        reject(err);
                    }
                });
                res.on('finish', () => {
                    console.log(`[Breaker ${serviceName}] res finished`);
                    resolve(undefined);
                });
                res.on('close', () => {
                    console.log(`[Breaker ${serviceName}] res closed`);
                    resolve(undefined);
                });
                console.log(`[Breaker ${serviceName}] calling proxyMiddleware`);
                proxyMiddleware(req, res, (err) => {
                    console.log(`[Breaker ${serviceName}] proxyMiddleware callback called with err:`, err);
                    if (err)
                        reject(err);
                });
            });
        }, {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000
        });
        return async (req, res, next) => {
            console.log(`[Breaker ${serviceName}] Middleware invoked`);
            try {
                await breaker.fire(req, res);
                console.log(`[Breaker ${serviceName}] breaker.fire completed successfully`);
            }
            catch (err) {
                console.error(`[API Gateway] Breaker Error catch for ${serviceName}:`, err.message);
                if (!res.headersSent) {
                    res.status(503).json(breaker.opened ?
                        { message: `${serviceName} Circuit Breaker is OPEN`, error: err.message } :
                        { message: `${serviceName} request failed`, error: err.message });
                }
                else {
                    console.warn(`[API Gateway] Headers already sent for ${serviceName}, but error occurred: ${err.message}`);
                    if (!res.writableEnded)
                        res.end();
                }
            }
        };
    };
    const authMiddleware = new auth_middleware_1.AuthMiddleware();
    const productsProxy = createServiceProxy('http://products-ms:3002', 'Products Service');
    const ordersProxy = createServiceProxy('http://orders-ms:3003', 'Orders Service');
    const shippingProxy = createServiceProxy('http://shipping-ms:3006', 'Shipping Service');
    const cartProxy = createServiceProxy('http://cart-ms:3007', 'Cart Service');
    const paymentProxy = createServiceProxy('http://payment-ms:3009', 'Payment Service');
    app.use('/api/products', (req, res, next) => {
        productsProxy(req, res, next);
    });
    app.use('/api/orders', (req, res, next) => {
        authMiddleware.use(req, res, () => {
            ordersProxy(req, res, next);
        });
    });
    app.use('/api/shipping', (req, res, next) => {
        authMiddleware.use(req, res, () => {
            shippingProxy(req, res, next);
        });
    });
    app.use('/api/cart', (req, res, next) => {
        authMiddleware.use(req, res, () => {
            cartProxy(req, res, next);
        });
    });
    app.use('/api/payments', (req, res, next) => {
        authMiddleware.use(req, res, () => {
            paymentProxy(req, res, next);
        });
    });
    const authBreaker = new CircuitBreaker(async (url, options) => {
        const response = await fetch(url, options);
        if (!response.ok && response.status >= 500)
            throw new Error(`Auth Service Error: ${response.status}`);
        return response;
    }, { timeout: 5000 });
    app.use('/api/auth', async (req, res, next) => {
        if (req.method === 'OPTIONS')
            return next();
        try {
            const path = req.url.startsWith('/') ? req.url : `/${req.url}`;
            const url = `http://auth-ms:3001/auth${path}`;
            const headers = {};
            if (req.headers['content-type'])
                headers['content-type'] = req.headers['content-type'];
            if (req.headers['authorization'])
                headers['authorization'] = req.headers['authorization'];
            let body = undefined;
            if (req.method !== 'GET' && req.method !== 'HEAD') {
                if (typeof req.body === 'string') {
                    body = req.body;
                }
                else if (req.body && typeof req.body === 'object') {
                    body = JSON.stringify(req.body);
                }
                if (!headers['content-type'])
                    headers['content-type'] = 'application/json';
            }
            const response = await authBreaker.fire(url, {
                method: req.method,
                headers: headers,
                body: body,
            });
            res.status(response.status);
            response.headers.forEach((value, key) => {
                if (!key.toLowerCase().startsWith('access-control-'))
                    res.setHeader(key, value);
            });
            res.send(await response.text());
        }
        catch (error) {
            console.error('[API Gateway] Auth Proxy Error:', error);
            if (!res.headersSent)
                res.status(503).json({ message: 'Auth Service unavailable', error: error.message });
        }
    });
    await app.listen(8080);
    console.log(`[API Gateway] is running on port: 8080`);
}
bootstrap();
//# sourceMappingURL=main.js.map