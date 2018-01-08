import { Endpoint } from './endpoint';
import { EndpointMethod } from './endpoint-method.enum';

export class TagsEndpoint implements Endpoint {
  public get apiUrl (): string {
    return 'api/tags';
  }

  public get method (): EndpointMethod {
    return EndpointMethod.Get;
  }
}
