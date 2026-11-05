import { BadRequestException } from '@nestjs/common';
import { Order } from './order.entity';
import { CreateOrderDto } from '../dto/create.order.dto';
import { OrderLuggage } from '../valueObjects/order.luggage';
import { FlightClasses } from '../../flights/types/flight.classes';
import { FlightClassPriceIncrements } from '../../flights/valueObjects/flight.class.price.increments';
import { LuggageRules } from '../../airlines/valueObjects/luggageRules';
import { Percentage } from '../../shared/common/percentage';

interface FlightOptions {
  id?: string;
  basePrice?: number;
  distance?: number;
  increments?: Partial<Record<FlightClasses, number>>;
  luggageRules?: LuggageRules | null;
  redeemFee?: number;
}

interface FlightSelection {
  flightId?: string;
  purchaseQuantity?: number;
  redeemQuantity?: number;
}

describe('Order', () => {
  const buildFlight = ({
    id = 'flight-1',
    basePrice = 100,
    distance = 1000,
    increments = { [FlightClasses.Economy]: 0 },
    luggageRules = null,
    redeemFee = 0,
  }: FlightOptions = {}) => ({
    id,
    basePrice,
    distance,
    airline: {
      luggageRules,
      redeemFee,
      flightClassPriceIncrements: Object.entries(increments).map(
        ([flightClass, value]) => {
          const increment = new FlightClassPriceIncrements();
          increment.class = flightClass as FlightClasses;
          increment.increment = new Percentage(value);
          return increment;
        },
      ),
    },
  });

  const buildOrder = (
    flights: ReturnType<typeof buildFlight>[],
    {
      flightClass = FlightClasses.Economy,
      luggage = new OrderLuggage(0, 0, false),
      accumulatedMiles = 0,
    } = {},
  ): Order => {
    const order = new Order();
    order.flights = flights as unknown as Order['flights'];
    order.class = flightClass;
    order.luggage = luggage;
    order.user = { accumulatedMiles } as Order['user'];
    return order;
  };

  const calculate = (order: Order, ...selections: FlightSelection[]): void => {
    order.calculateTotal({
      flightSelection: selections.map((selection) => ({
        flightId: 'flight-1',
        purchaseQuantity: 0,
        redeemQuantity: 0,
        ...selection,
      })),
    } as CreateOrderDto);
  };

  describe('flight total and class percentage', () => {
    it.each([
      ['no increment', 100, 0, 1, 100],
      ['a whole percentage', 100, 10, 2, 220],
      ['a fractional percentage', 200, 12.5, 1, 225],
      ['a percentage above 100', 200, 150, 2, 1000],
      ['a fractional price', 99.99, 10, 2, 219.98],
      ['a fractional price and percentage', 49.9, 7.5, 3, 160.92],
    ])(
      'prices tickets with %s',
      (_case, basePrice, percentage, quantity, expected) => {
        const order = buildOrder([
          buildFlight({
            basePrice,
            increments: { [FlightClasses.Economy]: percentage },
          }),
        ]);

        calculate(order, { purchaseQuantity: quantity });

        expect(order.flightsTotal).toBe(expected);
      },
    );

    it('rounds each ticket before multiplying by the quantity', () => {
      const order = buildOrder([
        buildFlight({
          basePrice: 99,
          increments: { [FlightClasses.Economy]: 12.5 },
        }),
      ]);

      calculate(order, { purchaseQuantity: 3 });

      // One ticket is 111.375, rounded to 111.38, not 334.125 rounded to 334.13
      expect(order.flightsTotal).toBe(334.14);
    });

    it('rounds a half cent ticket up', () => {
      const order = buildOrder([
        buildFlight({
          basePrice: 8.06,
          increments: { [FlightClasses.Economy]: 25 },
        }),
      ]);

      calculate(order, { purchaseQuantity: 1 });

      // 8.06 + 25% is exactly 10.075
      expect(order.flightsTotal).toBe(10.08);
    });

    it('removes floating point noise from the total', () => {
      const order = buildOrder([buildFlight({ basePrice: 0.1 })]);

      calculate(order, { purchaseQuantity: 3 });

      expect(order.flightsTotal).toBe(0.3);
      expect(order.grandTotal).toBe(0.3);
    });

    it.each([
      [FlightClasses.Economy, 110],
      [FlightClasses.Business, 150],
      [FlightClasses.First, 250],
    ])('uses the increment for the %s class', (flightClass, expected) => {
      const order = buildOrder(
        [
          buildFlight({
            increments: {
              [FlightClasses.Economy]: 10,
              [FlightClasses.Business]: 50,
              [FlightClasses.First]: 150,
            },
          }),
        ],
        { flightClass },
      );

      calculate(order, { purchaseQuantity: 1 });

      expect(order.flightsTotal).toBe(expected);
    });

    it('adds up flights from airlines with different percentages', () => {
      const order = buildOrder([
        buildFlight({
          id: 'flight-1',
          basePrice: 100,
          increments: { [FlightClasses.Economy]: 10 },
        }),
        buildFlight({
          id: 'flight-2',
          basePrice: 50.5,
          increments: { [FlightClasses.Economy]: 20 },
        }),
      ]);

      calculate(
        order,
        { flightId: 'flight-1', purchaseQuantity: 2 },
        { flightId: 'flight-2', purchaseQuantity: 1 },
      );

      expect(order.flightsTotal).toBe(280.6);
    });

    it('charges nothing for a flight with no purchased tickets', () => {
      const order = buildOrder([buildFlight()]);

      calculate(order, { purchaseQuantity: 0 });

      expect(order.flightsTotal).toBe(0);
    });

    it('fails when the airline has no increment for the class', () => {
      const order = buildOrder([buildFlight()], {
        flightClass: FlightClasses.First,
      });

      expect(() => calculate(order, { purchaseQuantity: 1 })).toThrow(
        'Increment not found',
      );
    });

    it('fails when the selected flight is not on the order', () => {
      const order = buildOrder([buildFlight()]);

      expect(() =>
        calculate(order, { flightId: 'other', purchaseQuantity: 1 }),
      ).toThrow('Flight not found');
    });
  });

  describe('luggage total', () => {
    const rules = new LuggageRules(10.25, 1, 20.1, 5.05);

    it.each([
      ['hand baggage within the limit', 1, 0, false, 0],
      ['one extra hand bag', 2, 0, false, 10.25],
      ['several extra hand bags', 4, 0, false, 30.75],
      ['checked luggage', 0, 2, false, 40.2],
      ['exceeded weight', 0, 0, true, 5.05],
      ['everything together', 2, 1, true, 35.4],
    ])('charges for %s', (_case, hand, checked, exceeded, expected) => {
      const order = buildOrder([buildFlight({ luggageRules: rules })], {
        luggage: new OrderLuggage(hand, checked, exceeded),
      });

      calculate(order);

      expect(order.luggageTotal).toBe(expected);
    });

    it('charges luggage once per flight', () => {
      const order = buildOrder(
        [
          buildFlight({ id: 'flight-1', luggageRules: rules }),
          buildFlight({ id: 'flight-2', luggageRules: rules }),
        ],
        { luggage: new OrderLuggage(0, 1, false) },
      );

      calculate(order);

      expect(order.luggageTotal).toBe(40.2);
    });

    it('removes floating point noise from the total', () => {
      const order = buildOrder(
        [buildFlight({ luggageRules: new LuggageRules(0, 0, 0.1, 0) })],
        { luggage: new OrderLuggage(0, 3, false) },
      );

      calculate(order);

      expect(order.luggageTotal).toBe(0.3);
    });

    it('charges nothing when the airline has no rules', () => {
      const order = buildOrder([buildFlight({ luggageRules: null })], {
        luggage: new OrderLuggage(5, 5, true),
      });

      calculate(order);

      expect(order.luggageTotal).toBe(0);
    });
  });

  describe('miles redemption', () => {
    it('charges the fee and spends miles instead of the fare', () => {
      const order = buildOrder(
        [buildFlight({ distance: 1000, redeemFee: 2.5 })],
        { accumulatedMiles: 5000 },
      );

      calculate(order, { redeemQuantity: 3 });

      expect(order.flightsTotal).toBe(0);
      expect(order.redeemFee).toBe(7.5);
      expect(order.exchangedMiles).toBe(3000);
      expect(order.redeemedQuantity).toBe(3);
      expect(order.grandTotal).toBe(7.5);
    });

    it('removes floating point noise from the fee', () => {
      const order = buildOrder([buildFlight({ distance: 1, redeemFee: 0.1 })], {
        accumulatedMiles: 3,
      });

      calculate(order, { redeemQuantity: 3 });

      expect(order.redeemFee).toBe(0.3);
    });

    it('accepts exactly enough miles', () => {
      const order = buildOrder([buildFlight({ distance: 1000 })], {
        accumulatedMiles: 2000,
      });

      calculate(order, { redeemQuantity: 2 });

      expect(order.exchangedMiles).toBe(2000);
    });

    it('rejects an order without enough miles', () => {
      const order = buildOrder([buildFlight({ distance: 1000 })], {
        accumulatedMiles: 1999,
      });

      expect(() => calculate(order, { redeemQuantity: 2 })).toThrow(
        BadRequestException,
      );
    });

    it('rejects miles that are only enough for the first flight', () => {
      const order = buildOrder(
        [
          buildFlight({ id: 'flight-1', distance: 1000 }),
          buildFlight({ id: 'flight-2', distance: 1000 }),
        ],
        { accumulatedMiles: 1500 },
      );

      expect(() =>
        calculate(
          order,
          { flightId: 'flight-1', redeemQuantity: 1 },
          { flightId: 'flight-2', redeemQuantity: 1 },
        ),
      ).toThrow(BadRequestException);
    });

    describe('across several flights', () => {
      const buildTwoFlightOrder = (): Order =>
        buildOrder(
          [
            buildFlight({ id: 'flight-1', distance: 100, redeemFee: 10 }),
            buildFlight({ id: 'flight-2', distance: 100, redeemFee: 5 }),
          ],
          { accumulatedMiles: 1000 },
        );
      const firstFlight = { flightId: 'flight-1', redeemQuantity: 2 };
      const secondFlight = { flightId: 'flight-2', redeemQuantity: 1 };

      it('adds up the fee, the miles and the quantity', () => {
        const order = buildTwoFlightOrder();

        calculate(order, firstFlight, secondFlight);

        expect(order.redeemFee).toBe(25);
        expect(order.exchangedMiles).toBe(300);
        expect(order.redeemedQuantity).toBe(3);
        expect(order.grandTotal).toBe(25);
      });

      it('charges the same fee whatever the order of the flights', () => {
        const order = buildTwoFlightOrder();

        calculate(order, secondFlight, firstFlight);

        expect(order.redeemFee).toBe(25);
      });

      it('does not double the fee when calculated twice', () => {
        const order = buildTwoFlightOrder();

        calculate(order, firstFlight, secondFlight);
        calculate(order, firstFlight, secondFlight);

        expect(order.redeemFee).toBe(25);
        expect(order.grandTotal).toBe(25);
      });

      it('ignores a flight with nothing redeemed', () => {
        const order = buildTwoFlightOrder();

        calculate(order, firstFlight, {
          flightId: 'flight-2',
          redeemQuantity: 0,
        });

        expect(order.redeemFee).toBe(20);
      });

      it('removes floating point noise from the added fees', () => {
        const order = buildOrder(
          [
            buildFlight({ id: 'flight-1', distance: 1, redeemFee: 0.1 }),
            buildFlight({ id: 'flight-2', distance: 1, redeemFee: 0.2 }),
          ],
          { accumulatedMiles: 2 },
        );

        calculate(
          order,
          { flightId: 'flight-1', redeemQuantity: 1 },
          { flightId: 'flight-2', redeemQuantity: 1 },
        );

        expect(order.redeemFee).toBe(0.3);
      });
    });
  });

  describe('grand total', () => {
    const buildFullOrder = (): Order =>
      buildOrder(
        [
          buildFlight({
            basePrice: 99.99,
            distance: 100,
            increments: { [FlightClasses.Economy]: 12.5 },
            luggageRules: new LuggageRules(10.25, 1, 20.1, 5.05),
            redeemFee: 2.5,
          }),
        ],
        {
          luggage: new OrderLuggage(2, 1, false),
          accumulatedMiles: 100,
        },
      );

    it('adds flights, luggage and the redeem fee', () => {
      const order = buildFullOrder();

      calculate(order, { purchaseQuantity: 3, redeemQuantity: 1 });

      expect(order.flightsTotal).toBe(337.47);
      expect(order.luggageTotal).toBe(30.35);
      expect(order.redeemFee).toBe(2.5);
      expect(order.grandTotal).toBe(370.32);
    });

    it('gives the same result when calculated twice', () => {
      const order = buildFullOrder();

      calculate(order, { purchaseQuantity: 3, redeemQuantity: 1 });
      calculate(order, { purchaseQuantity: 3, redeemQuantity: 1 });

      expect(order.grandTotal).toBe(370.32);
      expect(order.exchangedMiles).toBe(100);
      expect(order.redeemedQuantity).toBe(1);
    });
  });
});
