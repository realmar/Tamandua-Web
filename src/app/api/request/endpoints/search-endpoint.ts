import { Endpoint } from './endpoint';
import { EndpointMethod } from './endpoint-method.enum';

export class SearchEndpoint implements Endpoint {
  private _page: number;
  private _size: number;

  constructor (page: number, size: number) {
    this._page = page;
    this._size = size;
  }

  public get apiUrl (): string {
    return `api/search/${this._page}/${this._size}`;
  }

  public get method (): EndpointMethod {
    return EndpointMethod.Post;
  }
}
