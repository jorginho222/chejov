import { Passenger } from '../../passengers/entities/passenger.entity';
import { Column } from 'typeorm';

export class User extends Passenger {
  @Column()
  accumulatedMiles: number;
}
