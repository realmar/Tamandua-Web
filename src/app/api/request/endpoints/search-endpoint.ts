import { Endpoint } from './endpoint';
import { EndpointEnum } from './endpoint.enum';

export class SearchEndpoint implements Endpoint {
  private _page: number;
  private _size: number;

  get page (): number {
    return this._page;
  }

  get size (): number {
    return this._size;
  }

  constructor (page: number, size: number) {
    this._page = page;
    this._size = size;
  }

  getEnum (): EndpointEnum {
    return EndpointEnum.Search;
  }
}
