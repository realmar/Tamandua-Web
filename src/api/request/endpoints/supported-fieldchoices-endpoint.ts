import { Endpoint } from './endpoint';
import { EndpointMethod } from './endpoint-method.enum';

export function createSupportedFieldchoicesEndpoint (): Endpoint {
  return {
    apiUrl: 'supported_fieldchoices',
    method: EndpointMethod.Get
  };
}
