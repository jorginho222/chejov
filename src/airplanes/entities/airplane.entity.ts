import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Airplane {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  passengersCapacity: number;
}
