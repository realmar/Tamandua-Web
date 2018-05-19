import { SettingValidationResult } from './setting-validation-result';
import { isNullOrUndefined } from '../../utils/misc';
import { Formatter } from './formatters';
import { Duration } from 'moment';

export type Validator<T> = (data: T) => SettingValidationResult;

export type Reducer = (a: boolean, b: boolean) => boolean;

function createResultUsingFormatter<T> (data: T, isValid: boolean, formatter?: Formatter<T, T>): SettingValidationResult {
  let message: string;
  if (!isNullOrUndefined(formatter) && !isValid) {
    message = formatter(data);
  }

  return new SettingValidationResult(isValid, message);
}

export function greaterThan (value: number, formatter?: Formatter<number, number>): Validator<number> {
  return data => createResultUsingFormatter(data, !isNullOrUndefined(data) && data > value, d => formatter(d, value));
}

export function greaterThanZero (formatter?: Formatter<number, number>): Validator<number> {
  return greaterThan(0, formatter);
}

export function isDefined<T> (formatter?: Formatter<T, T>): Validator<T> {
  return data => createResultUsingFormatter(data, !isNullOrUndefined(data), formatter);
}

export function isMin (min: number, formatter?: Formatter<number, number>): Validator<number> {
  return (data: number): SettingValidationResult => {
    if (data < min) {
      return createResultUsingFormatter(data, false, d => formatter(d, min));
    }

    return new SettingValidationResult(true);
  };
}

export function isMinAndDefined (min: number,
                                 notNullFormatter?: Formatter<number, number>,
                                 minFormatter?: Formatter<number, number>): Validator<number> {
  return chain(allReducer(), isDefined(notNullFormatter), isMin(min, minFormatter));
}

export function durationMin (min: Duration, formatter?: Formatter<Duration, Duration>): Validator<Duration> {
  const minSeconds = min.asSeconds();
  return (data: Duration) => {
    const s = data.asSeconds();
    return createResultUsingFormatter(data, s >= minSeconds, d => formatter(d, min));
  };
}

export function chain<T> (reducer: Reducer, ...validators: Array<Validator<T>>): Validator<T> {
  const validator = (data: T) => {
    const results: Array<SettingValidationResult> = [];
    validators.forEach(v => {
      results.push(v(data));
    });

    const isValidOverall = results
      .map(value => value.isValid)
      .reduce(reducer);

    const messagesOverall: Array<string> = [];
    results.forEach(value => {
      if (!Array.isEmptyNullOrUndefined(value.messages)) {
        messagesOverall.push(...value.messages);
      }
    });

    return new SettingValidationResult(isValidOverall, ...messagesOverall);
  };

  return validator;
}

export function allReducer (): Reducer {
  return (a, b) => a && b;
}

export function anyReducer (): Reducer {
  return (a, b) => a || b;
}
