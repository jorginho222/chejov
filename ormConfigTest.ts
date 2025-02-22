import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import { Airplane } from './src/airplanes/entities/airplane.entity';
import { Flight } from './src/flights/entities/flight.entity';
import { Passenger } from './src/passengers/entities/passenger.entity';

const ormConfigTest: SqliteConnectionOptions = {
  type: 'sqlite',
  database: ':memory:',
  logging: true,
  entities: [Airplane, Flight, Passenger],
  synchronize: true,
  dropSchema: true,
};

export default ormConfigTest;
