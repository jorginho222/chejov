import { DataSource, DataSourceOptions } from 'typeorm';
import { Airplane } from './src/airplanes/entities/airplane.entity';
import { Flight } from './src/flights/entities/flight.entity';
import { Passenger } from './src/passengers/entities/passenger.entity';
import * as process from 'node:process';
import { Order } from './src/orders/entities/order.entity';
import { User } from './src/users/entities/user.entity';
import { Airline } from './src/airlines/entities/airline.entity';
import * as dotenv from 'dotenv';

// Always try to load .env.local first (it won't override existing azure production env vars)
dotenv.config({ path: '.env.local' });

let isDevelopment = process.env.ENVIRONMENT === 'development';
const ormConfigOptions: DataSourceOptions = {
  type: 'postgres',
  database: process.env.DB_NAME ?? 'chejov',
  host: process.env.DB_HOST ?? 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  entities: [Airplane, Flight, Passenger, Airline, Order, User],
  logging: true,
  synchronize: isDevelopment,
  ssl: isDevelopment ? false : { rejectUnauthorized: false },
  migrations: ['dist/src/migration/*.js'],
};

export const ormConfig = new DataSource(ormConfigOptions);
export { ormConfigOptions };
