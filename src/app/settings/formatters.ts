import { Duration } from 'moment';

export type Formatter<T, Args> = (value: T, ...args: Array<Args>) => string;

export function valueCannotBeNullFormatter<T> (value: T): string {
  return 'Value cannot be empty.';
}

export function valueMustBeBiggerThanFormatter (value: number, num: number): string {
  return `Min is ${num}`;
}

export function mustBePositiveFormatter (value: number) {
  return 'Value must be positive';
}

export function durationMinFormatter (value: Duration, min: Duration, durationGetter: (d: Duration) => number): string {
  return `Min is ${durationGetter(min)}`;
}
