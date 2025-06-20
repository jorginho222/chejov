import { Passenger } from '../../passengers/entities/passenger.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class User extends Passenger {
  @Column()
  accumulatedMiles: number;

  public getAccumulatedMiles(): number {
    return this.accumulatedMiles;
  }

  public addMiles(miles: number): void {
    this.setAccumulatedMiles((this.accumulatedMiles += miles));
  }

  private setAccumulatedMiles(accumulatedMiles: number): void {
    this.accumulatedMiles = accumulatedMiles;
  }
}
