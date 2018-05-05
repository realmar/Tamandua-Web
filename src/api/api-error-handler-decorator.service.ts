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
import { IntermediateExpressionRequest } from './request/intermediate-expression-request';
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

  public getColumns (): Observable<ColumnsResponse> {
    return this.addGenericResponseHandling(this._apiService.getColumns());
  }

  public getTags (): Observable<TagsResponse> {
    return this.addGenericResponseHandling(this._apiService.getTags());
  }

  public getFieldChoices (field: string, limit?: number): Observable<FieldChoicesResponse> {
    return this.addGenericResponseHandling(this._apiService.getFieldChoices(field, limit));
  }

  public getSupportedFieldChoices (): Observable<SupportedFieldchoicesResponse> {
    return this.addGenericResponseHandling(this._apiService.getSupportedFieldChoices());
  }

  public getAllSupportedFieldChoices (limit?: number): Observable<Map<string, FieldChoicesResponse>> {
    return this.addGenericResponseHandling(this._apiService.getAllSupportedFieldChoices(limit));
  }

  public SubmitRequest<T extends ApiResponse> (request: ApiRequestData): Observable<T> {
    return this.addGenericResponseHandling(request.accept(this));
  }

  public getRequestBuilder (): RequestBuilder {
    return this._apiService.getRequestBuilder();
  }

  public visitIE<T extends ApiResponse> (request: IntermediateExpressionRequest): Observable<T> {
    return this._apiService.visitIE(request);
  }

  public invalidateAllCaches (): void {
    if (this._apiService instanceof CachedApiService) {
      this._apiService.invalidateAllCaches();
    }
  }
}
