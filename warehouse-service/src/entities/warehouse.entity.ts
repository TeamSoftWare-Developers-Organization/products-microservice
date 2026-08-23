import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('warehouses')
export class Warehouse {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    location: string;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;
}
