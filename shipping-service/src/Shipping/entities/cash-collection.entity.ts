import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cash_collections')
export class CashCollection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'delivery_ticket_id' })
  deliveryTicketId: number;

  @Column({ name: 'driver_id' })
  driverId: string;

  @Column({ name: 'amount_received', type: 'decimal', precision: 10, scale: 2 })
  amountReceived: number;

  @Column({ name: 'is_matched', default: false })
  isMatched: boolean;

  @Column({ name: 'accountant_id', nullable: true })
  accountantId: string;

  @Column({ name: 'settled_at', type: 'timestamp', nullable: true })
  settledAt: Date;
}
