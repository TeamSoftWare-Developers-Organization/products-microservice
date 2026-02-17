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
    app.enableCors({
        origin: 'http://localhost:3000',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    const proxy = require('express-http-proxy');
    const authMiddleware = new auth_middleware_1.AuthMiddleware();
    app.use('/orders', (req, res, next) => {
        authMiddleware.use(req, res, () => {
            proxy('http://orders-ms:3003', {
                proxyReqPathResolver: (req) => {
                    const url = req.url === '/' ? '' : req.url;
                    return `/api/orders${url}`;
                },
            })(req, res, next);
        });
    });
    app.use('/auth', async (req, res, next) => {
        try {
            const url = `http://auth-ms:3001${req.originalUrl}`;
            console.log(`[API Gateway] Manual Proxy to: ${url}`);
            if (req.method === 'OPTIONS') {
                res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
                res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                res.status(204).send();
                return;
            }
            console.log(`[API Gateway] Incoming headers:`, req.headers);
            const headers = {};
            if (req.headers['content-type']) {
                headers['content-type'] = req.headers['content-type'];
            }
            if (req.headers['authorization']) {
                headers['authorization'] = req.headers['authorization'];
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
        }
        catch (error) {
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
//# sourceMappingURL=main.js.map