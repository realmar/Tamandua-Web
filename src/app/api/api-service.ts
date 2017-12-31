import { IntermediateExpressionRequest } from './request/intermediate-expression-request';
import { RequestBuilder } from './request/request-builder';

export abstract class ApiService {
  abstract getColumns (): Promise<Array<string>>;

  abstract getTags (): Promise<Array<string>>;

  abstract getFieldChoices (field: string, limit: number): Promise<Array<string>>;

  abstract getRequestBuilder (): RequestBuilder;

  abstract acceptIERequest (request: IntermediateExpressionRequest): void;
}
