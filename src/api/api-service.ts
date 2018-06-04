import { RequestBuilder, RequestBuilderConstructor } from './request/request-builder';
import { ApiRequestData } from './request/request';
import { ColumnsResponse } from './response/columns-response';
import { TagsResponse } from './response/tags-response';
import { FieldChoicesResponse } from './response/field-choices-response';
import { Observable } from 'rxjs';
import { SupportedFieldchoicesResponse } from './response/supported-fieldchoices-response';
import { ApiResponse } from './response/api-response';
import { IntermediateExpressionRequestBuilder } from './request/intermediate-expression-request-builder';

export abstract class ApiService {
  public static readonly defaultFieldChoicesLimit = 10;
  public static readonly RequestBuilderClass: RequestBuilderConstructor = IntermediateExpressionRequestBuilder;

  public abstract getColumns (cancellationToken?: Observable<any>): Observable<ColumnsResponse>;

  public abstract getTags (cancellationToken?: Observable<any>): Observable<TagsResponse>;

  public abstract getFieldChoices (field: string, limit?: number, cancellationToken?: Observable<any>): Observable<FieldChoicesResponse>;

  public abstract getSupportedFieldChoices (cancellationToken?: Observable<any>): Observable<SupportedFieldchoicesResponse>;

  public abstract getAllSupportedFieldChoices (limit?: number, cancellationToken?: Observable<any>): Observable<Map<string, FieldChoicesResponse>>;

  public abstract SubmitRequest<T extends ApiResponse> (request: ApiRequestData, cancellationToken?: Observable<any>): Observable<any>;

  public abstract getRequestBuilder (): RequestBuilder;
}
