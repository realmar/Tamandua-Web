import { isNullOrUndefined } from 'util';
import { Observable, Subject } from 'rxjs';
import { RequestBuilderField } from '../../api/request/request-builder-field';
import { Comparator, ComparatorType } from '../../api/request/comparator';

export class SearchFieldData implements RequestBuilderField {
  private _name: string;
  private _value: string | number;
  private _comparator: Comparator;
  private readonly _onRefreshFields: Subject<any>;

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

  get onRefreshFields (): Observable<any> {
    return this._onRefreshFields.asObservable();
  }

  constructor (name?: string, value?: string | number, comparator?: Comparator) {
    if (!value) {
      if (!isNullOrUndefined(comparator) && comparator.type === ComparatorType.Regex) {
        this._value = '^';
      } else {
        this._value = '';
      }
    } else {
      this._value = value;
    }

    this._name = name;
    this._comparator = comparator;
    this._onRefreshFields = new Subject<any>();
  }

  public emitOnRefreshFields (): void {
    this._onRefreshFields.next(true);
  }
}
