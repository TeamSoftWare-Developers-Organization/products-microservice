"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResilienceService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const rxjs_1 = require("rxjs");
const CircuitBreaker = require('opossum');
let ResilienceService = class ResilienceService {
    client;
    breaker;
    constructor(client) {
        this.client = client;
    }
    onModuleInit() {
        const options = {
            timeout: 3000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
        };
        this.breaker = new CircuitBreaker(this.emitMessage.bind(this), options);
        this.breaker.fallback(() => {
            console.error('[ResilienceService] Circuit is OPEN! Falling back...');
            throw new common_1.InternalServerErrorException('Downstream service is temporarily unavailable');
        });
        this.breaker.on('open', () => console.warn('[ResilienceService] 🔴 Circuit Opened!'));
        this.breaker.on('halfOpen', () => console.info('[ResilienceService] 🟠 Circuit Half-Open!'));
        this.breaker.on('close', () => console.info('[ResilienceService] 🟢 Circuit Closed!'));
    }
    async emitMessage({ pattern, data }) {
        console.log(`[ResilienceService] Emitting ${pattern}`);
        return (0, rxjs_1.firstValueFrom)(this.client.emit(pattern, data));
    }
    async fire(pattern, data) {
        return this.breaker.fire({ pattern, data });
    }
    async fireAction(action, ...args) {
        const actionBreaker = new CircuitBreaker(action, {
            timeout: 3000,
            errorThresholdPercentage: 50,
            resetTimeout: 10000
        });
        return actionBreaker.fire(...args);
    }
};
exports.ResilienceService = ResilienceService;
exports.ResilienceService = ResilienceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('PRODUCT_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], ResilienceService);
//# sourceMappingURL=resilience.service.js.map