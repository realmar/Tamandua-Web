import { DataCache } from './data-cache';
import { isNullOrUndefined } from 'util';
import * as moment from 'moment';
import { Transform, Type } from 'class-transformer';

export class TimedDataCache<T> implements DataCache<T> {
  private _data: T;

  @Type(() => Date)
  @Transform(value => moment(value), { toClassOnly: true })
  private _lastDataUpdate: moment.Moment;
  private _validityDurationDays: number;

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
