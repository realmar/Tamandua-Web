import { Injectable } from '@angular/core';
import { ApiService } from './api-service';
import { ColumnsResponse } from './response/columns-response';
import { TagsResponse } from './response/tags-response';
import { FieldChoicesResponse } from './response/field-choices-response';
import { RequestBuilder } from './request/request-builder';
import { IntermediateExpressionRequest } from './request/intermediate-expression-request';
import { ApiRequestData } from './request/request';
import { Observable } from 'rxjs/Observable';
import { ApiResponse } from './response/api-response';
import { HttpClient } from '@angular/common/http';
import { ColumnsEndpoint } from './request/endpoints/columns-endpoint';
import { TagsEndpoint } from './request/endpoints/tags-endpoint';
import { FieldchoicesEndpoint } from './request/endpoints/fieldchoices-endpoint';
import { IntermediateExpressionRequestBuilder } from './request/intermediate-expression-request-builder';
import { Endpoint } from './request/endpoints/endpoint';
import { EndpointMethod } from './request/endpoints/endpoint-method.enum';
import { SupportedFieldchoicesResponse } from './response/supported-fieldchoices-response';
import { SupportedFieldchoicesEndpoint } from './request/endpoints/supported-fieldchoices-endpoint';

@Injectable()
export class TamanduaService implements ApiService {
  private readonly _apiRoot = 'http://localhost:8080';

  constructor (private _httpClient: HttpClient) {
  }

  private createFullUrl (apiUrl: string): string {
    return [ this._apiRoot, apiUrl ].join('/');
  }

  private makeRequest<T extends ApiResponse> (endpoint: Endpoint, data?: object): Observable<T> {
    if (endpoint.method === EndpointMethod.Get) {
      return this._httpClient.get<T>(this.createFullUrl(endpoint.apiUrl));
    } else if (endpoint.method === EndpointMethod.Post) {
      return this._httpClient.post<T>(this.createFullUrl(endpoint.apiUrl), data);
    } else {
      throw new Error(`Endpoint method not supported: ${endpoint.method}`);
    }
  }

  public getColumns (): Observable<ColumnsResponse> {
    return this.makeRequest(new ColumnsEndpoint());
  }

  public getTags (): Observable<TagsResponse> {
    return this.makeRequest(new TagsEndpoint());
  }

  public getFieldChoices (field: string, limit: number): Observable<FieldChoicesResponse> {
    return this.makeRequest(new FieldchoicesEndpoint(field, limit));
  }

  getSupportedFieldChoices (): Observable<SupportedFieldchoicesResponse> {
    return this.makeRequest(new SupportedFieldchoicesEndpoint());
  }

  public SubmitRequest<T extends ApiResponse> (request: ApiRequestData): Observable<T> {
    return request.accept(this);
  }

  public getRequestBuilder (): RequestBuilder {
    return new IntermediateExpressionRequestBuilder();
  }

  public visitIE<T extends ApiResponse> (request: IntermediateExpressionRequest): Observable<T> {
    return this.makeRequest(request.endpoint, request.dataObject);
  }
}
