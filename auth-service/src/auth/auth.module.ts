import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { User } from '../users/user.entity';
import { LoginHandler } from './commands/handlers/login.handler';
import { RegisterHandler } from './commands/handlers/register.handler';

export const CommandHandlers = [LoginHandler, RegisterHandler];

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'super_secret_key_123',
                signOptions: { expiresIn: '1h' },
            }),
        }),
        CqrsModule,
    ],
    controllers: [AuthController],
    providers: [...CommandHandlers],
})
export class AuthModule { }
