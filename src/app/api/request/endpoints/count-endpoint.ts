import { Endpoint } from './endpoint';
import { EndpointMethod } from './endpoint-method.enum';

export class CountEndpoint implements Endpoint {
  public get apiUrl (): string {
    return 'count';
  }

  public get method (): EndpointMethod {
    return EndpointMethod.Post;
  }
}
