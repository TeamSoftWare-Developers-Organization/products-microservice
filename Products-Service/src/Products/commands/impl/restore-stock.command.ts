export class RestoreStockCommand {
    constructor(
        public readonly productId: number,
        public readonly quantity: number
    ) { }
}
