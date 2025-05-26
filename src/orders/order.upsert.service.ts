import { CreateOrderDto } from './dto/create.order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { Flight } from '../flights/entities/flight.entity';
import { OrderLuggage } from './valueObjects/order.luggage';

export class OrderUpsertService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Flight)
    private readonly flightRepository: Repository<Flight>,
  ) {}

  async create(orderDto: CreateOrderDto) {
    const flights: Flight[] = [];
    let passengersQuantity = 0;
    for (const flightSelectionDto of orderDto.flightSelection) {
      const flight = await this.flightRepository.findOne({
        where: { id: flightSelectionDto.flightId },
      });
      if (!flight) {
        throw new Error('Flight not found');
      }
      flights.push(flight);
      passengersQuantity +=
        flightSelectionDto.purchaseQuantity + flightSelectionDto.redeemQuantity;
    }

    const luggage = new OrderLuggage(
      orderDto.handBaggageQuantity,
      orderDto.checkedLuggageQuantity,
      false,
    );

    const user = await this.flightRepository.findOne({
      where: { id: orderDto.userId },
    });
    if (!user) {
      throw new Error('User not found');
    }
    const order: Order = this.orderRepository.create({
      id: orderDto.id,
      number: '1',
      flights,
      luggage,
      user,
      passengersQuantity,
    });

    order.calculateTotal(orderDto);
    return this.orderRepository.save(order);
  }

  async update() {
    // TODO: Partially update entity (when user advance with the order)
  }
}
