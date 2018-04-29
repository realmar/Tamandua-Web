import { Endpoint } from './endpoint';
import { EndpointMethod } from './endpoint-method.enum';

export function createSearchEndpoint (page: number, size: number): Endpoint {
  return {
    apiUrl: `search/${page}/${size}`,
    method: EndpointMethod.Post
  };
}
