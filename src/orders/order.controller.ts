import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CreateOrderDto } from './dto/create.order.dto';

@Controller('orders')
export class OrdersController {
  constructor() {}

  @Post()
  @HttpCode(201)
  create(@Body() orderDto: CreateOrderDto) {}
}
