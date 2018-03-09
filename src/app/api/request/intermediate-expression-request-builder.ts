import { RequestBuilder } from './request-builder';
import { Comparator } from './comparator';
import { IntermediateExpressionRequest } from './intermediate-expression-request';
import { ApiRequest } from './request';
import { isNullOrUndefined } from 'util';
import { Endpoint } from './endpoints/endpoint';
import { EndpointIsUndefinedError } from './endpoint-is-undefined-error';
import { Converter } from '../../utils/converter';
import { RequestBuilderField } from './request-builder-field';

class Field implements RequestBuilderField {
  private _comparator: Comparator;
  private _name: string;
  private _value: string | number;

  get comparator (): Comparator {
    return this._comparator;
  }

  get name (): string {
    return this._name;
  }

  get value (): string | number {
    return this._value;
  }

  constructor (name: string, value: string | number, comparator: Comparator) {
    this._comparator = comparator;
    this._name = name;
    this._value = value;
  }

  public asObject (): object {
    const obj = {};
    obj[ this._name ] = {
      comparator: this._comparator.toString(),
      value: this._value
    };

    return obj;
  }
}

export class IntermediateExpressionRequestBuilder implements RequestBuilder {
  private fields: Array<Field>;
  private startDatetime: Date;
  private endDatetime: Date;
  private endpoint: Endpoint;
  private callback: (object) => void;

  constructor () {
    this.fields = [];
  }

  public addField (name: string, value: string | number, comparator: Comparator): void {
    this.fields.push(new Field(name, value, comparator));
  }

  public getFields (): Array<RequestBuilderField> {
    return this.fields;
  }

  public removeAllFields (): void {
    this.fields = [];
  }

  public setStartDatetime (datetime: Date): void {
    this.startDatetime = datetime;
  }

  public getStartDatetime (): Date {
    return this.startDatetime;
  }

  public setEndDatetime (datetime: Date): void {
    this.endDatetime = datetime;
  }

  public getEndDatetime (): Date {
    return this.endDatetime;
  }

  public removeStartDatetime (): void {
    this.startDatetime = undefined;
  }

  public removeEndDatetime (): void {
    this.endDatetime = undefined;
  }

  public setEndpoint (endpoint: Endpoint): void {
    this.endpoint = endpoint;
  }

  public getEndpoint (): Endpoint {
    return this.endpoint;
  }

  public setCallback (callback: (object) => void): void {
    this.callback = callback;
  }

  /**
   * Build request.
   *
   * @throws {EndpointIsUndefinedError} thrown when the endpoint has not been set.
   * @returns {ApiRequest} Assembled request object.
   */
  public build (): ApiRequest {
    if (isNullOrUndefined(this.endpoint)) {
      throw new EndpointIsUndefinedError();
    }

    const data = {
      fields: [],
      datetime: {}
    };

    for (const field of this.fields) {
      data.fields.push(field.asObject());
    }

    if (!isNullOrUndefined(this.startDatetime)) {
      data.datetime[ 'start' ] = Converter.dateToString(this.startDatetime);
    }

    if (!isNullOrUndefined(this.endDatetime)) {
      data.datetime[ 'end' ] = Converter.dateToString(this.endDatetime);
    }

    return new IntermediateExpressionRequest(data, this.endpoint, this.callback);
  }
}
