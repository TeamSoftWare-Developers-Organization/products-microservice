import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsController } from './notifications.controller';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
    ],
    controllers: [NotificationsController],
    providers: [NotificationsGateway],
})
export class AppModule { }
