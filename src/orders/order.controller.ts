import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CreateOrderDto } from './dto/create.order.dto';
import { OrderUpsertService } from './order.upsert.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orderCreateService: OrderUpsertService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() orderDto: CreateOrderDto) {
    return await this.orderCreateService.create(orderDto);
  }
}
