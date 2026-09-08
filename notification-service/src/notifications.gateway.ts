import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

const allowedOrigins = (process.env.CORS_ORIGINS?.split(',') || [
    Buffer.from('aHR0cDovL2xvY2FsaG9zdDozMDAw', 'base64').toString('utf8'),
    Buffer.from('aHR0cDovL2xvY2FsaG9zdDozMDA1', 'base64').toString('utf8'),
]);

const socketPath = Buffer.from('L3NvY2tldC5pby8=', 'base64').toString('utf8');

@WebSocketGateway({
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
    transports: ['polling', 'websocket'],
    path: socketPath,
})
export class NotificationsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('NotificationsGateway');

    sendOrderNotification(data: any) {
        this.server.emit('order_notification', data);
    }

    sendNotification(event: string, payload: any) {
        this.server.emit(event, payload);
    }

    afterInit(server: Server) {
        this.logger.log('Init');
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
    }
}
