import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Order } from '../../orders/entities/order.entity';
import { OrderPaidEvent } from '../../orders/events/order.paid.event';
import { User } from '../../users/entities/user.entity';

export class AddMilesToUserOnOrderPaid {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @OnEvent('order.paid')
  async handleEvent(event: OrderPaidEvent) {
    const orderSearch = await this.orderRepository.find({
      where: { id: event.orderId },
    });
    const order = orderSearch[0];

    const user = order.user;
    user.addMiles(order.exchangedMiles);

    await this.userRepository.save(user);
  }
}
