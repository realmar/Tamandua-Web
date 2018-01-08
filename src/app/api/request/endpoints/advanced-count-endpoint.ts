import { Endpoint } from './endpoint';
import { EndpointMethod } from './endpoint-method.enum';

export class AdvancedCountEndpoint implements Endpoint {
  private _length: number;

  constructor (length: number) {
    this._length = length;
  }

  public get apiUrl (): string {
    return `api/advcount/${this._length}`;
  }

  public get method (): EndpointMethod {
    return EndpointMethod.Post;
  }
}
