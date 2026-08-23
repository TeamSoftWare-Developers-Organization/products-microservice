import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    productId: number;

    @Column()
    quantity: number;

    @Column({ default: 'PENDING' })
    status: string;

    @Column({ nullable: true })
    userId: string;

    @CreateDateColumn()
    createdAt: Date;
}
