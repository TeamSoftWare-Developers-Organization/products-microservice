"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./tracing");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const auth_middleware_1 = require("./auth.middleware");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    const proxy = require('express-http-proxy');
    const authMiddleware = new auth_middleware_1.AuthMiddleware();
    app.use('/products', (req, res, next) => authMiddleware.use(req, res, next), proxy('http://products-service:3000', {
        proxyReqPathResolver: (req) => {
            const url = req.url === '/' ? '' : req.url;
            return `/api/products${url}`;
        },
    }));
    app.use('/orders', (req, res, next) => authMiddleware.use(req, res, next), proxy('http://orders-service:3000', {
        proxyReqPathResolver: (req) => {
            const url = req.url === '/' ? '' : req.url;
            return `/api/orders${url}`;
        },
    }));
    app.use('/auth', proxy('http://auth-service:3000', {
        proxyReqPathResolver: (req) => {
            const url = req.url === '/' ? '' : req.url;
            return `/auth${url}`;
        },
    }));
    const port = 80;
    await app.listen(port);
    console.log(`[API Gateway] is running on port: ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map