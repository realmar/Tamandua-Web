import { ApiRequestData } from './request';
import { Endpoint } from './endpoints/endpoint';

export class GenericRequest implements ApiRequestData {
  private readonly _data: object;
  public get data (): object {
    return this._data;
  }

  private readonly _endpoint: Endpoint;
  public get endpoint (): Endpoint {
    return this._endpoint;
  }

  constructor (dataObject: object, endpoint: Endpoint) {
    this._data = dataObject;
    this._endpoint = endpoint;
  }
}
