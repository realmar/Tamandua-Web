import { SettingValidationResult } from './setting-validation-result';

export class Setting<T> {
  private _validator: (data: T) => SettingValidationResult;
  private _data: T;

  constructor (data: T, validator: (data: T) => SettingValidationResult) {
    this._validator = validator;
    if (!this._validator(data).isValid) {
      throw new Error('Supplied data is not valid.');
    }

    this._data = data;
  }

  public getData (): T {
    return this._data;
  }

  public setData (data: T): SettingValidationResult {
    const validation = this._validator(data);
    if (validation.isValid) {
      this._data = data;
    }

    return validation;
  }
}
