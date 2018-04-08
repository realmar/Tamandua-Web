import { Endpoint } from './endpoint';
import { EndpointMethod } from './endpoint-method.enum';
import { isNullOrUndefined } from 'util';

export class AdvancedCountEndpoint implements Endpoint {
  private _field: string;
  private _length: number;
  private _separator: string;

  constructor (field: string, length: number, separator?: string) {
    this._field = field;
    this._length = length;
    this._separator = separator;
  }

  public get length (): number {
    return this._length;
  }

  public set length (value: number) {
    this._length = value;
  }

  public get apiUrl (): string {
    let url = `advcount/${this._field}/${this._length}`;
    if (!isNullOrUndefined(this._separator)) {
      url += `/${this._separator}`;
    }

    return url;
  }

  public get method (): EndpointMethod {
    return EndpointMethod.Post;
  }
}
