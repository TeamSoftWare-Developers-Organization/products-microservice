import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column()
  quantity: number;

  @Column({ type: 'numeric', precision: 10, scale: 3, default: 0 })
  unitPrice: number;

  @Column({ type: 'numeric', precision: 12, scale: 3, default: 0 })
  totalAmount: number;

  @Column({ default: 1 })
  warehouseId: number;

  @Column({ default: 'CASH' })
  gateway: string;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  customerName: string;

  @Column({ nullable: true })
  customerPhone: string;

  @Column({ nullable: true })
  customerCity: string;

  @Column({ nullable: true })
  customerAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}
