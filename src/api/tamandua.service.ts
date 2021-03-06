import { share, takeUntil } from 'rxjs/operators';
import { throwError as observableThrowError, Observable, Subject, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { ApiService } from './api-service';
import { ColumnsResponse } from './response/columns-response';
import { TagsResponse } from './response/tags-response';
import { FieldChoicesResponse } from './response/field-choices-response';
import { RequestBuilder } from './request/request-builder';
import { ApiRequestData } from './request/request';
import { ApiResponse } from './response/api-response';
import { HttpClient } from '@angular/common/http';
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

  private makeRequest<T extends ApiResponse> (endpoint: Endpoint, data?: object, cancellationToken?: Observable<any>): Observable<T> {
    // About .pipe(share():
    // https://www.learnrxjs.io/operators/multicasting/share.html
    // https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/share.md
    // http://blog.novanet.no/angular-pitfall-multiple-http-requests-with-rxjs-and-observable-async/
    //
    // Because multiple clients subscribed to the returned observable the http request was emitted
    // once for each each subscriber. With share() we share the underlying source with all subscribers.
    // (And thus not making multiple HTTP requests to the server)

    let request: Observable<T>;

    if (endpoint.method === EndpointMethod.Get) {
      request = this._httpClient.get<T>(this.createFullUrl(endpoint.apiUrl));
    } else if (endpoint.method === EndpointMethod.Post) {
      request = this._httpClient.post<T>(this.createFullUrl(endpoint.apiUrl), data);
    } else {
      throw new Error(`Endpoint method not supported: ${endpoint.method}`);
    }

    if (!isNullOrUndefined(cancellationToken)) {
      request = request.pipe(takeUntil(cancellationToken));
    }

    return request.pipe(share());
  }

  public getColumns (cancellationToken?: Observable<any>): Observable<ColumnsResponse> {
    return this.makeRequest(createColumnsEndpoint(), cancellationToken);
  }

  public getTags (cancellationToken?: Observable<any>): Observable<TagsResponse> {
    return this.makeRequest(createTagsEndpoint(), cancellationToken);
  }

  public getFieldChoices (field: string, limit?: number, cancellationToken?: Observable<any>): Observable<FieldChoicesResponse> {
    if (isNullOrUndefined(limit)) {
      limit = ApiService.defaultFieldChoicesLimit;
    }

    return this.makeRequest(createFieldchoicesEndpoint(field, limit), cancellationToken);
  }

  public getSupportedFieldChoices (cancellationToken?: Observable<any>): Observable<SupportedFieldchoicesResponse> {
    return this.makeRequest(createSupportedFieldchoicesEndpoint(), cancellationToken);
  }

  public getAllSupportedFieldChoices (limit?: number, cancellationToken?: Observable<any>): Observable<Map<string, FieldChoicesResponse>> {
    if (isNullOrUndefined(limit)) {
      limit = ApiService.defaultFieldChoicesLimit;
    }

    const subject = new Subject<Map<string, FieldChoicesResponse>>();
    const choicesMap = new Map<string, FieldChoicesResponse>();
    let hasErrors = false;
    let errorObj: any;
    let responsesLength = 0;

    this.getSupportedFieldChoices(cancellationToken)
      .subscribe(response => {
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

  public SubmitRequest<T extends ApiResponse> (request: ApiRequestData, cancellationToken?: Observable<any>): Observable<any> {
    return this.makeRequest(request.endpoint, request.data, cancellationToken);
  }

  public getRequestBuilder (): RequestBuilder {
    return new ApiService.RequestBuilderClass();
  }
}
