import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsController } from './notifications.controller';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        // 📨 إضافة إعدادات البريد الإلكتروني Mailer
        MailerModule.forRoot({
            transport: {
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: Number(process.env.SMTP_PORT) || 465,
                secure: true,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                },
            },
            defaults: {
                from: '"MicroShop Orders" <orders@microshop.ly>',
            },
        }),
    ],
    controllers: [NotificationsController],
    providers: [NotificationsGateway],
})
export class AppModule { }
