import { Injectable } from '@angular/core';
import { ApiService } from './api-service';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from './response/api-response';
import { ApiRequestData } from './request/request';
import { Observable } from 'rxjs/internal/Observable';
import { FieldChoicesResponse } from './response/field-choices-response';
import { ColumnsResponse } from './response/columns-response';
import { RequestBuilder } from './request/request-builder';
import { SupportedFieldchoicesResponse } from './response/supported-fieldchoices-response';
import { TagsResponse } from './response/tags-response';
import { CachedApiService } from './cached-api-service';
import { ToastrUtils } from '../utils/toastr-utils';

@Injectable()
export class ApiErrorHandlerDecoratorService implements CachedApiService {
  public constructor (private _toastr: ToastrService,
                      private _apiService: ApiService) {
  }

  private addGenericResponseHandling<T> (observable: Observable<T>): Observable<T> {
    observable.subscribe(
      () => ToastrUtils.removeAllGenericServerErrors(this._toastr),
      () => ToastrUtils.showGenericServerError(this._toastr)
    );

    return observable;
  }

  public getColumns (cancellationToken?: Observable<any>): Observable<ColumnsResponse> {
    return this.addGenericResponseHandling(this._apiService.getColumns(cancellationToken));
  }

  public getTags (cancellationToken?: Observable<any>): Observable<TagsResponse> {
    return this.addGenericResponseHandling(this._apiService.getTags(cancellationToken));
  }

  public getFieldChoices (field: string, limit?: number, cancellationToken?: Observable<any>): Observable<FieldChoicesResponse> {
    return this.addGenericResponseHandling(this._apiService.getFieldChoices(field, limit, cancellationToken));
  }

  public getSupportedFieldChoices (cancellationToken?: Observable<any>): Observable<SupportedFieldchoicesResponse> {
    return this.addGenericResponseHandling(this._apiService.getSupportedFieldChoices(cancellationToken));
  }

  public getAllSupportedFieldChoices (limit?: number, cancellationToken?: Observable<any>): Observable<Map<string, FieldChoicesResponse>> {
    return this.addGenericResponseHandling(this._apiService.getAllSupportedFieldChoices(limit, cancellationToken));
  }

  public SubmitRequest<T extends ApiResponse> (request: ApiRequestData, cancellationToken?: Observable<any>): Observable<any> {
    return this.addGenericResponseHandling(this._apiService.SubmitRequest<T>(request, cancellationToken));
  }

  public getRequestBuilder (): RequestBuilder {
    return this._apiService.getRequestBuilder();
  }

  public invalidateAllCaches (): void {
    if (typeof this._apiService[ 'invalidateAllCaches' ] === 'function') {
      (this._apiService as CachedApiService).invalidateAllCaches();
    }
  }
}
