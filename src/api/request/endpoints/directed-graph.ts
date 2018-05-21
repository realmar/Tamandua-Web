import { Endpoint } from './endpoint';
import { EndpointMethod } from './endpoint-method.enum';

export function createDirectedGraphEndpoint (mail: string): Endpoint {
  return {
    apiUrl: `directed_graph/${mail}`,
    method: EndpointMethod.Post
  };
}
