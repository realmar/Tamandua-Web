import { Endpoint } from './endpoint';
import { EndpointMethod } from './endpoint-method.enum';

export class ColumnsEndpoint implements Endpoint {
  public get apiUrl (): string {
    return 'columns';
  }

  public get method (): EndpointMethod {
    return EndpointMethod.Get;
  }
}
