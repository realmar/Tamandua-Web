import { Endpoint } from './endpoint';
import { EndpointMethod } from './endpoint-method.enum';

export function createCountEndpoint (): Endpoint {
  return {
    apiUrl: 'count',
    method: EndpointMethod.Post
  };
}
