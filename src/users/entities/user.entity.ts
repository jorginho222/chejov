import { Passenger } from '../../passengers/entities/passenger.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class User extends Passenger {
  @Column()
  accumulatedMiles: number;
}
