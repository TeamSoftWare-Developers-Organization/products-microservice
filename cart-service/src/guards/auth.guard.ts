import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        const token = authHeader?.split(' ')[1];

        switch (true) {
            // إذا كان الطلب يحمل userId في الـ Params (مثل طلبات n8n / الخدمات الداخلية)، يتم السماح به
            case Boolean(request.params?.userId):
                request.user = { id: request.params.userId, sub: request.params.userId };
                return true;

            case !authHeader:
                throw new UnauthorizedException('Authorization header missing');

            case !token:
                throw new UnauthorizedException('Token missing');

            default:
                break;
        }

        try {
            const secret = process.env.JWT_SECRET || 'super_secret_key_123';
            const decoded = jwt.verify(token, secret);
            request.user = decoded;
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
