import { Endpoint } from './endpoint';
import { EndpointMethod } from './endpoint-method.enum';

export function createColumnsEndpoint (): Endpoint {
  return {
    apiUrl: 'columns',
    method: EndpointMethod.Get
  };
}
