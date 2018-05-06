import { Endpoint } from './endpoint';
import { EndpointMethod } from './endpoint-method.enum';
import { isNullOrUndefined } from '../../../utils/misc';

export function createAdvancedEndpoint (field: string, length: number, separator?: string): Endpoint {
  let url = `advcount/${field}/${length}`;
  if (!isNullOrUndefined(separator)) {
    url += `/${separator}`;
  }

  return {
    apiUrl: url,
    method: EndpointMethod.Post,

    metadata: {
      field: field,
      length: length,
      separator: separator
    }
  };
}
