export class CreateProductCommand {
    constructor(
        public readonly name_ar: string,
        public readonly price_lyd: number,
        public readonly stock_quantity: number,
        public readonly description_ar: string,
        public readonly main_image_url?: string
    ) { }
}
