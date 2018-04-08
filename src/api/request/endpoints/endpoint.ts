import { EndpointMethod } from './endpoint-method.enum';

export interface Endpoint {
  readonly apiUrl: string;
  readonly method: EndpointMethod;
}
