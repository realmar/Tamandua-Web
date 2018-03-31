import { Endpoint } from './endpoint';
import { EndpointMethod } from './endpoint-method.enum';

export class SupportedFieldchoicesEndpoint implements Endpoint {
  public get apiUrl (): string {
    return 'supported_fieldchoices';
  }

  public get method (): EndpointMethod {
    return EndpointMethod.Get;
  }
}
