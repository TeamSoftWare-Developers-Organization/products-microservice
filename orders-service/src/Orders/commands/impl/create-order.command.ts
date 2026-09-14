export class CreateOrderCommand {
  constructor(
    public readonly productId: number,
    public readonly quantity: number,
    public readonly userId?: string,
    public readonly warehouseId: number = 1,
    public readonly gateway: string = 'CASH',
    public readonly customerData?: { name?: string; phone?: string; city?: string; address?: string },
    public readonly unitPrice: number = 0,
  ) {}
}
