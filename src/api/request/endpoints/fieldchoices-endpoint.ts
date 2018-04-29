import { Endpoint } from './endpoint';
import { EndpointMethod } from './endpoint-method.enum';

export function createFieldchoicesEndpoint (field: string, maxChoices: number): Endpoint {
  return {
    apiUrl: `fieldchoices/${field}/${maxChoices}`,
    method: EndpointMethod.Get
  };
}
