import { RequestBuilder } from './request/request-builder';
import { Request } from './request/request';
import { IntermediateExpressionRequest } from './request/intermediate-expression-request';
import { ColumnsResponse } from './response/columns-response';
import { TagsResponse } from './response/tags-response';
import { FieldChoicesResponse } from './response/field-choices-response';

export abstract class ApiService {
  abstract getColumns (): Promise<ColumnsResponse>;

  abstract getTags (): Promise<TagsResponse>;

  abstract getFieldChoices (field: string, limit: number): Promise<FieldChoicesResponse>;

  abstract SubmitRequest (request: Request): void;

  abstract getRequestBuilder (): RequestBuilder;

  abstract visitIE (request: IntermediateExpressionRequest): void;
}
