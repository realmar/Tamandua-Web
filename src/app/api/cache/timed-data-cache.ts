import { DataCache } from './data-cache';
import { isNullOrUndefined } from 'util';
import * as moment from 'moment';
import { Transform, Type } from 'class-transformer';

// AOT compilation has problems with arrow functions in decorators.
// This here is a workaround.
//
// Source: https://github.com/angular/angular-cli/issues/8434

function typeFunc () {
  return Date;
}

function transformFunc (value) {
  return moment(value);
}

export class TimedDataCache<T> implements DataCache<T> {
  private _data: T;

  @Type(typeFunc)
  @Transform(transformFunc, { toClassOnly: true })
  private _lastDataUpdate: moment.Moment;
  private readonly _validityDurationDays: number;

  public get isValid (): boolean {
    if (isNullOrUndefined(this._lastDataUpdate) || isNullOrUndefined(this._data)) {
      return false;
    }

    const lastValidDate = moment().subtract(this._validityDurationDays, 'days');
    const isValid = this._lastDataUpdate.isAfter(lastValidDate);

    return isValid;
  }

  public get data (): T {
    return this._data;
  }

  public set data (value: T) {
    this._lastDataUpdate = moment();
    this._data = value;
  }

  constructor (data?: T, validityDurationDays: number = 30) {
    this._data = data;
    this._validityDurationDays = validityDurationDays;
  }

  public invalidate (): void {
    this._lastDataUpdate = undefined;
  }
}
