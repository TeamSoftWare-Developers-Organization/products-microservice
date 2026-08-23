import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum DeliveryStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
}

@Entity('delivery_tickets')
export class DeliveryTicket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'customer_name' })
  customerName: string;

  @Column({ name: 'customer_phone' })
  customerPhone: string;

  @Column()
  city: string;

  @Column({ name: 'delivery_address', type: 'text' })
  deliveryAddress: string;

  @Column({ name: 'delivery_fee', type: 'decimal', precision: 10, scale: 2 })
  deliveryFee: number;

  @Column({ name: 'cod_amount', type: 'decimal', precision: 10, scale: 2 })
  codAmount: number;

  @Column({ name: 'driver_id', nullable: true })
  driverId: string;

  @Column({
    type: 'varchar',
    default: DeliveryStatus.PENDING,
  })
  status: DeliveryStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
