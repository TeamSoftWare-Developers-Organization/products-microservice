import { Controller, Get } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';

@Controller('api/inventory')
export class AppController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get()
  async getInventory() {
    return this.warehouseService.getInventory();
  }
}
