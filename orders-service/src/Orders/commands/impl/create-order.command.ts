export class CreateOrderCommand {
    constructor(
        public readonly productId: number,
        public readonly quantity: number,
        public readonly userId?: string
    ) { }
}
