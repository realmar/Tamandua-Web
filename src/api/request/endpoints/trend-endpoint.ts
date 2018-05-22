import { Endpoint } from './endpoint';
import { EndpointMethod } from './endpoint-method.enum';

export function createTrendEndpoint (field: string): Endpoint {
  return {
    apiUrl: `trend/${field}`,
    method: EndpointMethod.Post
  };
}
