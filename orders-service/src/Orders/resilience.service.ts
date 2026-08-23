import { Injectable, Inject, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
const CircuitBreaker = require('opossum');

@Injectable()
export class ResilienceService implements OnModuleInit {
    private breaker: any;
    private actionBreakers: Map<string, any> = new Map();

    constructor(@Inject('PRODUCT_SERVICE') private client: ClientProxy) { }

    onModuleInit() {
        const options = {
            timeout: 3000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
        };

        // تغليف عملية إرسال الرسائل
        this.breaker = new CircuitBreaker(this.emitMessage.bind(this), options);

        this.breaker.fallback(() => {
            console.error('[ResilienceService] Circuit is OPEN! Falling back...');
            throw new InternalServerErrorException('Downstream service is temporarily unavailable');
        });

        this.breaker.on('open', () => console.warn('[ResilienceService] 🔴 Circuit Opened!'));
        this.breaker.on('halfOpen', () => console.info('[ResilienceService] 🟠 Circuit Half-Open!'));
        this.breaker.on('close', () => console.info('[ResilienceService] 🟢 Circuit Closed!'));
    }

    private async emitMessage({ pattern, data }: { pattern: string; data: any }) {
        console.log(`[ResilienceService] Emitting ${pattern}`);
        return firstValueFrom(this.client.emit(pattern, data));
    }

    async fire(pattern: string, data: any) {
        return this.breaker.fire({ pattern, data });
    }

    /**
     * لتغليف أي عملية برمجية أخرى (مثل حفظ الطلب في الـ Controller)
     */
    async fireAction(action: Function, actionName: string = 'default') {
        if (!this.actionBreakers.has(actionName)) {
            this.actionBreakers.set(actionName, new CircuitBreaker(
                async (fn: Function) => fn(),
                {
                    timeout: 5000,
                    errorThresholdPercentage: 50,
                    resetTimeout: 10000
                }
            ));
        }
        return this.actionBreakers.get(actionName).fire(action);
    }
}
