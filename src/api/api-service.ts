import { RequestBuilder } from './request/request-builder';
import { ApiRequestData } from './request/request';
import { IntermediateExpressionRequest } from './request/intermediate-expression-request';
import { ColumnsResponse } from './response/columns-response';
import { TagsResponse } from './response/tags-response';
import { FieldChoicesResponse } from './response/field-choices-response';
import { Observable } from 'rxjs';
import { SupportedFieldchoicesResponse } from './response/supported-fieldchoices-response';
import { ApiResponse } from './response/api-response';

export abstract class ApiService {
  public static readonly defaultFieldChoicesLimit = 10;

  abstract getColumns (): Observable<ColumnsResponse>;

  abstract getTags (): Observable<TagsResponse>;

  abstract getFieldChoices (field: string, limit?: number): Observable<FieldChoicesResponse>;

  abstract getSupportedFieldChoices (): Observable<SupportedFieldchoicesResponse>;

  abstract getAllSupportedFieldChoices (limit?: number): Observable<Map<string, FieldChoicesResponse>>;

  abstract SubmitRequest<T extends ApiResponse> (request: ApiRequestData): Observable<T>;

  abstract getRequestBuilder (): RequestBuilder;

  abstract visitIE<T extends ApiResponse> (request: IntermediateExpressionRequest): Observable<T>;
}
