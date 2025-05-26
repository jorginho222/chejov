import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class SuspendedOrder {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @OneToOne(() => Order)
  order: Order;

  @Column()
  suspendedAt: Date;
}
