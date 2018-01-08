import { RequestBuilder } from './request/request-builder';
import { ApiRequest } from './request/request';
import { IntermediateExpressionRequest } from './request/intermediate-expression-request';
import { ColumnsResponse } from './response/columns-response';
import { TagsResponse } from './response/tags-response';
import { FieldChoicesResponse } from './response/field-choices-response';
import { Observable } from 'rxjs/Observable';

export abstract class ApiService {
  abstract getColumns (): Observable<ColumnsResponse>;

  abstract getTags (): Observable<TagsResponse>;

  abstract getFieldChoices (field: string, limit: number): Observable<FieldChoicesResponse>;

  abstract SubmitRequest (request: ApiRequest): void;

  abstract getRequestBuilder (): RequestBuilder;

  abstract visitIE (request: IntermediateExpressionRequest): void;
}
