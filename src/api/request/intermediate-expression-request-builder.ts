import { RequestBuilder } from './request-builder';
import { Comparator } from './comparator';
import { GenericRequest } from './generic-request';
import { ApiRequestData } from './request';
import { isNullOrUndefined } from '../../utils/misc';
import { Endpoint } from './endpoints/endpoint';
import { EndpointIsUndefinedError } from './endpoint-is-undefined-error';
import { Converter } from '../../utils/converter';
import { RequestBuilderField } from './request-builder-field';
import { Type } from 'class-transformer';

class Field implements RequestBuilderField {
  @Type(() => Comparator)
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
  @Type(() => Field)
  private _fields: Array<Field>;
  private _startDatetime: Date;
  private _endDatetime: Date;
  private _endpoint: Endpoint;

  public constructor () {
    this._fields = [];
  }

  // region Getters/Setters

  public addField (name: string, value: string | number, comparator: Comparator): RequestBuilder {
    this._fields.push(new Field(name, value, comparator));
    return this;
  }

  public getFields (): Array<RequestBuilderField> {
    return this._fields;
  }

  public removeAllFields (): RequestBuilder {
    this._fields = [];
    return this;
  }

  public setStartDatetime (datetime: Date): RequestBuilder {
    this._startDatetime = datetime;
    return this;
  }

  public getStartDatetime (): Date {
    return this._startDatetime;
  }

  public setEndDatetime (datetime: Date): RequestBuilder {
    this._endDatetime = datetime;
    return this;
  }

  public getEndDatetime (): Date {
    return this._endDatetime;
  }

  public removeStartDatetime (): RequestBuilder {
    this._startDatetime = undefined;
    return this;
  }

  public removeEndDatetime (): RequestBuilder {
    this._endDatetime = undefined;
    return this;
  }

  public setEndpoint (endpoint: Endpoint): RequestBuilder {
    this._endpoint = endpoint;
    return this;
  }

  public getEndpoint (): Endpoint {
    return this._endpoint;
  }

  // endregion

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

    return new GenericRequest(data, this._endpoint);
  }
}
