import { FlightSelectionDto } from './flightSelectionDto';
import { FlightClasses } from '../../flights/types/flight.classes';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsUUID('4')
  id: string;

  @IsNotEmpty()
  flightSelection: FlightSelectionDto[];

  @IsNumber()
  handBaggageQuantity: number;

  @IsNumber()
  checkedLuggageQuantity: number;

  @IsString()
  @IsNotEmpty()
  class: FlightClasses;

  @IsUUID('4')
  userId: string;
}
