import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('payment_transactions')
export class PaymentTransaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'order_id' })
    orderId: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    amount: number;

    @Column({ length: 50 })
    gateway: string;

    @Column({ name: 'transaction_reference', length: 255, nullable: true })
    transactionReference: string;

    @Column({ length: 50, default: 'PENDING' })
    status: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
