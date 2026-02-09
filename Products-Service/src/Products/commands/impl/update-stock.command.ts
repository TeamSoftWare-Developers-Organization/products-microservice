export class UpdateStockCommand {
    constructor(
        public readonly productId: number,
        public readonly quantity: number,
        public readonly orderId?: number // Optional for order confirmation context
    ) { }
}
