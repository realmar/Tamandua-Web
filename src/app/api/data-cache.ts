import { isNullOrUndefined } from 'util';

export class DataCache<T> {
  private _isValid: boolean;
  private _data: T;

  get isValid (): boolean {
    return this._isValid;
  }

  get data (): T {
    return this._data;
  }

  set data (value: T) {
    this._data = value;
    this.validate();
  }

  constructor (data?: T) {
    this._data = data;
    this.validate();
  }

  protected validate (): void {
    this._isValid = true;
  }
}
