import { IntermediateExpressionRequest } from './request/intermediate-expression-request';
import { RequestBuilder } from './request/request-builder';

export abstract class ApiService {
  abstract getFields (): Array<string>;

  abstract getRequestBuilder (): RequestBuilder;

  abstract acceptIERequest (request: IntermediateExpressionRequest): void;
}
