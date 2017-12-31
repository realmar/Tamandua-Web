import { EndpointEnum } from './endpoint.enum';

export interface Endpoint {
  getEnum(): EndpointEnum;
}
