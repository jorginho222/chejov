import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { Airplane } from './src/airplanes/entities/airplane.entity';
import { Flight } from './src/flights/entities/flight.entity';
import { Passenger } from './src/passengers/entities/passenger.entity';
import * as process from 'node:process';
import { Order } from './src/orders/entities/order.entity';
import { User } from './src/users/entities/user.entity';
import { Airline } from './src/airlines/entities/airline.entity';

const ormConfig: PostgresConnectionOptions = {
  type: 'postgres',
  database: process.env.DB_NAME ?? 'chejov',
  host: process.env.DB_HOST ?? 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  entities: [Airplane, Flight, Passenger, Airline, Order, User],
  synchronize: true, // it is recommended to set this property to false in production, because this sync functionality can drop all or part of production data
};

export default ormConfig;
