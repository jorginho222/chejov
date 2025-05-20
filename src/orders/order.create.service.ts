import { CreateOrderDto } from './dto/create.order.dto';

export class OrderCreateService {
  constructor() {}

  async create(orderDto: CreateOrderDto) {
    // TODO: Create entity
    // TODO: Calculations
  }

  async update() {
    // TODO: Partially update entity (when user advance with the order)
  }

  async cancel() {
    // TODO: Cancel or delete order
  }
}
