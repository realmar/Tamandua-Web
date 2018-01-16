export class DataCache<T> {
  private _isValid: boolean;
  private _data: T;

  public get isValid (): boolean {
    return this._isValid;
  }

  public set isValid (value: boolean) {
    this._isValid = value;
  }

  public get data (): T {
    return this._data;
  }

  public set data (value: T) {
    this._data = value;
  }

  constructor (data?: T) {
    this._data = data;
    this._isValid = true;
  }
}
