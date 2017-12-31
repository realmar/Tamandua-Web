import { Endpoint } from './endpoint';
import { EndpointEnum } from './endpoint.enum';

export class AdvancedCountEndpoint implements Endpoint {
  private _length: number;

  get length (): number {
    return this._length;
  }

  constructor (length: number) {
    this._length = length;
  }

  getEnum (): EndpointEnum {
    return EndpointEnum.AdvancedCount;
  }
}
