import { Endpoint } from './endpoint';
import { EndpointMethod } from './endpoint-method.enum';
import { isNullOrUndefined } from '../../../utils/misc';

export function createTrendEndpoint (field: string, dataCount: number, separator?: string): Endpoint {
  let url = `trend/${field}/${dataCount}`;
  if (!isNullOrUndefined(separator)) {
    url += `/${separator}`;
  }

  return {
    apiUrl: url,
    method: EndpointMethod.Post
  };
}
