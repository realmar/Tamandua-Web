import { Endpoint } from './endpoint';
import { EndpointEnum } from './endpoint.enum';

export class CountEndpoint implements Endpoint {

  getEnum (): EndpointEnum {
    return EndpointEnum.Count;
  }
}
