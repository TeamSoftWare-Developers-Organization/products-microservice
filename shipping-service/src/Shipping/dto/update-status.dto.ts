import { ShipmentStatus } from '../shipment.entity.js';

export class UpdateStatusDto {
    status: ShipmentStatus;
    driverName?: string;
}
