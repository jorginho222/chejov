import { ValueTransformer } from 'typeorm';
import { FlightClassPriceIncrements } from '../../flights/valueObjects/flight.class.price.increments';
import { Percentage } from '../../shared/common/percentage';
import { LuggageRules } from '../valueObjects/luggageRules';

export const flightClassPriceIncrementsTransformer: ValueTransformer = {
  to: (value: FlightClassPriceIncrements[]): string => {
    // Convert to plain objects for JSON serialization
    return JSON.stringify(
      value.map((item) => {
        return {
          class: item.class,
          increment: item.increment.value,
        };
      }),
    );
  },
  from: (value: string | any): FlightClassPriceIncrements[] => {
    // If value is already an object (can happen with some drivers), use it as is
    const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.map((item) => {
      const increment = new FlightClassPriceIncrements();
      increment.class = item.class;
      increment.increment = new Percentage(item.increment);
      return increment;
    });
  },
};

export const luggageRulesTransformer: ValueTransformer = {
  to: (value: LuggageRules): string => {
    return JSON.stringify({
      priceHandBaggage: value.priceHandBaggage,
      maxHandBaggage: value.maxHandBaggage,
      priceCheckedLuggage: value.priceCheckedLuggage,
      priceExceededWeight: value.priceExceededWeight,
    });
  },
  from: (value: string): LuggageRules | null => {
    const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;

    if (Object.keys(parsedValue).length === 0) {
      return null;
    }
    return new LuggageRules(
      parsedValue._priceHandBaggage,
      parsedValue._maxHandBaggage,
      parsedValue._priceCheckedLuggage,
      parsedValue._priceExceededWeight,
    );
  },
};
