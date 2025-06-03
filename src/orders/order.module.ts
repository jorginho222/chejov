import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersController } from './order.controller';
import { OrderUpsertService } from './order.upsert.service';
import { Flight } from '../flights/entities/flight.entity';
import { OrderCancelService } from './order.cancel.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Flight, User])],
  controllers: [OrdersController],
  providers: [OrderUpsertService, OrderCancelService],
})
export class OrderModule {}
