import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
  registerDecorator,
  ValidateNested,
  ValidationArguments,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  AirplaneSeatConfig,
  countSeats,
} from '../valueObjects/airplane.seat.config';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

// The capacity must equal the seats in seatsConfig. Skipped while the
// quantities are invalid, since their own errors already report the row.
function MatchesSeatCount(): PropertyDecorator {
  return (target: object, propertyName: string | symbol): void => {
    registerDecorator({
      name: 'matchesSeatCount',
      target: target.constructor,
      propertyName: propertyName as string,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const seats = countSeats(
            (args.object as CreateAirplaneDto).seatsConfig,
          );
          return seats === undefined || value === seats;
        },
        defaultMessage(args: ValidationArguments): string {
          const seats = countSeats(
            (args.object as CreateAirplaneDto).seatsConfig,
          );
          return `${args.property} must equal the ${seats} seats in seatsConfig`;
        },
      },
    });
  };
}

export class CreateAirplaneDto {
  @ApiProperty({
    example: '1edf4131-fe1a-4f97-8a45-aa78d1531667',
    description: 'ID del avión. Formato UUID v4',
  })
  @IsUUID('4')
  id: string;

  @ApiProperty({
    example: 'Churqui 2',
    description: 'Marca del avión',
  })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({
    example: 'Patalenga',
    description:
      'Modelo del avión, único. Se guarda sin espacios al inicio ni al final',
  })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({
    example: 200,
    description:
      'Capacidad de pasajeros del avión. Debe ser igual al total de asientos de seatsConfig',
  })
  @IsInt()
  @Min(1)
  @MatchesSeatCount()
  passengersCapacity: number;

  @ApiProperty({
    type: [AirplaneSeatConfig],
    description:
      'Configuración de asientos del avión, como máximo una por clase',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique((item?: AirplaneSeatConfig) => item?.class)
  @ValidateNested({ each: true })
  @Type(() => AirplaneSeatConfig)
  seatsConfig: Array<AirplaneSeatConfig>;
}
