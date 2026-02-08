import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Enforce authentication ONLY for POST /orders
        const isOrderPost = (req.originalUrl === '/orders' || req.originalUrl.startsWith('/orders?')) && req.method === 'POST';

        if (!isOrderPost) {
            return next();
        }

        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new UnauthorizedException('Authorization header missing');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new UnauthorizedException('Token missing');
        }

        try {
            // Using same secret as auth-service
            const secret = process.env.JWT_SECRET || 'super_secret_key_123';
            const decoded = jwt.verify(token, secret);
            (req as any).user = decoded; // Attach user to request object
            next();
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
