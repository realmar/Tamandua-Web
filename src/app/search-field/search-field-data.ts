import { Comparator } from '../api/request/comparator';
import { RequestBuilderField } from '../api/request/request-builder-field';
import { isNullOrUndefined } from 'util';

export class SearchFieldData implements RequestBuilderField {
  private _name: string;
  private _value: string | number;
  private _comparator: Comparator;

  get name (): string {
    return this._name;
  }

  set name (value: string) {
    this._name = value;
  }

  get value (): string | number {
    return this._value;
  }

  set value (value: string | number) {
    this._value = value;
  }

  get comparator (): Comparator {
    return this._comparator;
  }

  set comparator (value: Comparator) {
    this._comparator = value;
  }

  constructor (name?: string, value?: string | number, comparator?: Comparator) {
    if (isNullOrUndefined(value)) {
      this._value = '';
    } else {
      this._value = value;
    }

    this._name = name;
    this._comparator = comparator;
  }
}
