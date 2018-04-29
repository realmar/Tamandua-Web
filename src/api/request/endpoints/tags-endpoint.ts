import { Endpoint } from './endpoint';
import { EndpointMethod } from './endpoint-method.enum';

export function createTagsEndpoint (): Endpoint {
  return {
    apiUrl: 'tags',
    method: EndpointMethod.Get
  };
}
