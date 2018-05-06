import { throwError as observableThrowError, Observable, Subject, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { ApiService } from './api-service';
import { ColumnsResponse } from './response/columns-response';
import { TagsResponse } from './response/tags-response';
import { FieldChoicesResponse } from './response/field-choices-response';
import { RequestBuilder } from './request/request-builder';
import { IntermediateExpressionRequest } from './request/intermediate-expression-request';
import { ApiRequestData } from './request/request';
import { ApiResponse } from './response/api-response';
import { HttpClient } from '@angular/common/http';
import { IntermediateExpressionRequestBuilder } from './request/intermediate-expression-request-builder';
import { Endpoint } from './request/endpoints/endpoint';
import { EndpointMethod } from './request/endpoints/endpoint-method.enum';
import { SupportedFieldchoicesResponse } from './response/supported-fieldchoices-response';
import { environment } from '../environments/environment';
import { isNullOrUndefined } from '../utils/misc';

import { createColumnsEndpoint } from './request/endpoints/columns-endpoint';
import { createTagsEndpoint } from './request/endpoints/tags-endpoint';
import { createFieldchoicesEndpoint } from './request/endpoints/fieldchoices-endpoint';
import { createSupportedFieldchoicesEndpoint } from './request/endpoints/supported-fieldchoices-endpoint';

@Injectable()
export class TamanduaService implements ApiService {
  private readonly _apiRoot = environment.apiRoot;

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
    return this.makeRequest(createColumnsEndpoint());
  }

  public getTags (): Observable<TagsResponse> {
    return this.makeRequest(createTagsEndpoint());
  }

  public getFieldChoices (field: string, limit?: number): Observable<FieldChoicesResponse> {
    if (isNullOrUndefined(limit)) {
      limit = ApiService.defaultFieldChoicesLimit;
    }

    return this.makeRequest(createFieldchoicesEndpoint(field, limit));
  }

  public getSupportedFieldChoices (): Observable<SupportedFieldchoicesResponse> {
    return this.makeRequest(createSupportedFieldchoicesEndpoint());
  }

  public getAllSupportedFieldChoices (limit?: number): Observable<Map<string, FieldChoicesResponse>> {
    if (isNullOrUndefined(limit)) {
      limit = ApiService.defaultFieldChoicesLimit;
    }

    const subject = new Subject<Map<string, FieldChoicesResponse>>();
    const choicesMap = new Map<string, FieldChoicesResponse>();
    let hasErrors = false;
    let errorObj: any;
    let responsesLength = 0;

    this.getSupportedFieldChoices().subscribe(response => {
      responsesLength = response.length;

      response.forEach(choice => {
        this.getFieldChoices(choice, limit).subscribe(
          result => {
            choicesMap.set(choice, result);
            if (!hasErrors && choicesMap.size === response.length) {
              subject.next(choicesMap);
            }
          },
          error => {
            errorObj = error;
            hasErrors = true;
            subject.thrownError(error);
          }
        );
      });
    });

    if (!hasErrors && choicesMap.size === responsesLength) {
      return of(choicesMap);
    } else if (hasErrors) {
      return observableThrowError(errorObj);
    } else {
      return subject.asObservable();
    }
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
