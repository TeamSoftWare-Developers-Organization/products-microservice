import { OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
export declare class ResilienceService implements OnModuleInit {
    private client;
    private breaker;
    private actionBreakers;
    constructor(client: ClientProxy);
    onModuleInit(): void;
    private emitMessage;
    fire(pattern: string, data: any): Promise<any>;
    fireAction(action: Function, actionName?: string): Promise<any>;
}
