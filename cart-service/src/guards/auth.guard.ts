import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        const token = authHeader?.split(' ')[1];

        if (!authHeader) {
            throw new UnauthorizedException('Authorization header missing');
        }
        if (!token) {
            throw new UnauthorizedException('Token missing');
        }

        try {
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new UnauthorizedException('JWT secret is not configured');
            }
            const decoded = jwt.verify(token, secret);
            request.user = decoded;
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
