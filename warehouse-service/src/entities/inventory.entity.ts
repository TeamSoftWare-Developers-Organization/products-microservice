import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('warehouse_inventory')
export class WarehouseInventory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    warehouse_id: number;

    @Column()
    product_id: string;

    @Column({ default: 0 })
    stock_quantity: number;

    @Column({ default: 0 })
    reserved_quantity: number;

    @UpdateDateColumn()
    updated_at: Date;
}
