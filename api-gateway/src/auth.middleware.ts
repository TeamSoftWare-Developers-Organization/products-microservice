import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // This middleware is only mounted on protected gateway routes.
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
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new UnauthorizedException('JWT secret is not configured');
            }
            const decoded = jwt.verify(token, secret);
            (req as any).user = decoded; // Attach user to request object
            next();
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
