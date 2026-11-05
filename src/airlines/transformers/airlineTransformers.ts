import { ValueTransformer } from 'typeorm';
import { FlightClassPriceIncrements } from '../../flights/valueObjects/flight.class.price.increments';
import { Percentage } from '../../shared/common/percentage';
import { LuggageRules } from '../valueObjects/luggageRules';
import { FlightClasses } from '../../flights/types/flight.classes';

interface StoredPriceIncrement {
  class: FlightClasses;
  increment: number;
}

interface StoredLuggageRules {
  priceHandBaggage: number;
  maxHandBaggage: number;
  priceCheckedLuggage: number;
  priceExceededWeight: number;
}

// The value may already be parsed, depending on the driver
function parseStoredValue<T>(value: string | T): T {
  return typeof value === 'string' ? (JSON.parse(value) as T) : value;
}

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
  from: (
    value: string | StoredPriceIncrement[],
  ): FlightClassPriceIncrements[] => {
    const parsedValue = parseStoredValue(value);

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
  from: (value: string | StoredLuggageRules): LuggageRules | null => {
    const parsedValue = parseStoredValue(value);

    if (Object.keys(parsedValue).length === 0) {
      return null;
    }
    return new LuggageRules(
      parsedValue.priceHandBaggage,
      parsedValue.maxHandBaggage,
      parsedValue.priceCheckedLuggage,
      parsedValue.priceExceededWeight,
    );
  },
};
