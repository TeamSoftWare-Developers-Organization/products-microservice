export declare class CreateOrderCommand {
    readonly productId: number;
    readonly quantity: number;
    readonly userId?: string;
    constructor(productId: number, quantity: number, userId?: string);
}
