import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ShipmentStatus {
    AWAITING_PICKUP = 'AWAITING_PICKUP',
    IN_TRANSIT = 'IN_TRANSIT',
    DELIVERED = 'DELIVERED',
    RETURNED = 'RETURNED',
}

@Entity('shipments')
export class Shipment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    orderId: number;

    @Column({ unique: true })
    trackingCode: string;

    @Column({
        type: 'varchar',
        default: ShipmentStatus.AWAITING_PICKUP,
    })
    status: ShipmentStatus;

    @Column({ nullable: true })
    driverName: string;

    @Column({ default: false })
    cashCollected: boolean;

    @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
    amountCollected: number;

    @Column({ nullable: true })
    deliveredAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
