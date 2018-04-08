import { RequestBuilder } from './request-builder';
import { Comparator } from './comparator';
import { IntermediateExpressionRequest } from './intermediate-expression-request';
import { ApiRequestData } from './request';
import { isNullOrUndefined } from 'util';
import { Endpoint } from './endpoints/endpoint';
import { EndpointIsUndefinedError } from './endpoint-is-undefined-error';
import { Converter } from '../../utils/converter';
import { RequestBuilderField } from './request-builder-field';

class Field implements RequestBuilderField {
  private readonly _comparator: Comparator;
  private readonly _name: string;
  private readonly _value: string | number;

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
  private _fields: Array<Field>;
  private _startDatetime: Date;
  private _endDatetime: Date;
  private _endpoint: Endpoint;

  constructor () {
    this._fields = [];
  }

  public addField (name: string, value: string | number, comparator: Comparator): void {
    this._fields.push(new Field(name, value, comparator));
  }

  public getFields (): Array<RequestBuilderField> {
    return this._fields;
  }

  public removeAllFields (): void {
    this._fields = [];
  }

  public setStartDatetime (datetime: Date): void {
    this._startDatetime = datetime;
  }

  public getStartDatetime (): Date {
    return this._startDatetime;
  }

  public setEndDatetime (datetime: Date): void {
    this._endDatetime = datetime;
  }

  public getEndDatetime (): Date {
    return this._endDatetime;
  }

  public removeStartDatetime (): void {
    this._startDatetime = undefined;
  }

  public removeEndDatetime (): void {
    this._endDatetime = undefined;
  }

  public setEndpoint (endpoint: Endpoint): void {
    this._endpoint = endpoint;
  }

  public getEndpoint (): Endpoint {
    return this._endpoint;
  }

  /**
   * Build request.
   *
   * @throws {EndpointIsUndefinedError} thrown when the endpoint has not been set.
   * @returns {ApiRequestData} Assembled request object.
   */
  public build (): ApiRequestData {
    if (isNullOrUndefined(this._endpoint)) {
      throw new EndpointIsUndefinedError();
    }

    const data = {
      fields: [],
      datetime: {}
    };

    for (const field of this._fields) {
      data.fields.push(field.asObject());
    }

    if (!isNullOrUndefined(this._startDatetime)) {
      data.datetime[ 'start' ] = Converter.dateToString(this._startDatetime);
    }

    if (!isNullOrUndefined(this._endDatetime)) {
      data.datetime[ 'end' ] = Converter.dateToString(this._endDatetime);
    }

    return new IntermediateExpressionRequest(data, this._endpoint);
  }
}
