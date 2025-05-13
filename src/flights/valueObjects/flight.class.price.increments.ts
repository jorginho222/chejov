import { Percentage } from '../../shared/common/percentage';
import { FlightClasses } from '../types/flight.classes';

export class FlightClassPriceIncrements {
  class: FlightClasses;
  increment: Percentage;
}
