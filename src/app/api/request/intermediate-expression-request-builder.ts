import { RequestBuilder } from './request-builder';
import { Comparator } from '../../expression/comparator';
import { IntermediateExpressionRequest } from './intermediate-expression-request';
import { Request } from './request';
import { isNullOrUndefined } from 'util';

class Field {
  private _comparator: Comparator;
  private _name: string;
  private _value: string;

  get comparator (): Comparator {
    return this._comparator;
  }

  get name (): string {
    return this._name;
  }

  get value (): string {
    return this._value;
  }

  constructor (name: string, value: string, comparator: Comparator) {
    this._comparator = comparator;
    this._name = name;
    this._value = value;
  }

  public asObject (): object {
    const obj = {};
    obj[ this.name ] = {
      comparator: this._comparator.toString(),
      value: this._value
    };

    return obj;
  }
}

export class IntermediateExpressionRequestBuilder implements RequestBuilder {
  static readonly datetimeFormat = 'YYYY/MM/DD HH:mm:ss';

  private fields: Array<Field>;
  private startDatetime: Date;
  private endDatetime: Date;

  constructor () {
    this.fields = [];
  }

  public addField (name: string, value: string, comparator: Comparator): void {
    this.fields.push(new Field(name, value, comparator));
  }

  public setStartDatetime (datetime: Date): void {
    this.startDatetime = datetime;
  }

  public setEndDatetime (datetime: Date): void {
    this.endDatetime = datetime;
  }

  public removeStartDatetime (): void {
    this.startDatetime = undefined;
  }

  public removeEndDatetime (): void {
    this.endDatetime = undefined;
  }

  private formatDatetime (datetime: Date): string {
    const dt = IntermediateExpressionRequestBuilder.datetimeFormat;

    dt.replace('YYYY', datetime.getFullYear().toString());
    dt.replace('MM', datetime.getMonth().toString());
    dt.replace('DD', datetime.getDay().toString());

    dt.replace('HH', datetime.getHours().toString());
    dt.replace('mm', datetime.getMinutes().toString());
    dt.replace('ss', datetime.getSeconds().toString());

    return dt;
  }

  public build (): Request {
    const data = {
      fields: [],
      datetime: {}
    };

    for (const field of this.fields) {
      data.fields.push(field.asObject());
    }

    if (!isNullOrUndefined(this.startDatetime)) {
      data.datetime[ 'start' ] = this.formatDatetime(this.startDatetime);
    }

    if (!isNullOrUndefined(this.endDatetime)) {
      data.datetime[ 'end' ] = this.formatDatetime(this.endDatetime);
    }

    return new IntermediateExpressionRequest(data);
  }
}
