import { ApiRequest } from './request';
import { Endpoint } from './endpoints/endpoint';
import { ApiService } from '../api-service';
import { HttpErrorResponse } from '@angular/common/http';

export class IntermediateExpressionRequest implements ApiRequest {
  private _dataObject: object;
  public get dataObject (): object {
    return this._dataObject;
  }

  public get data (): string {
    return JSON.stringify(this._dataObject);
  }

  private _callback: (object) => void;
  public get callback (): (object) => void {
    return this._callback;
  }

  private _errorCallback: (HttpErrorResponse) => void;
  public get errorCallback (): (HttpErrorResponse) => void {
    return this._errorCallback;
  }

  private _endpoint: Endpoint;
  public get endpoint (): Endpoint {
    return this._endpoint;
  }

  constructor (dataObject: object, endpoint: Endpoint, callback: (object) => void, errorCallback: (HttpErrorResponse) => void) {
    this._dataObject = dataObject;
    this._endpoint = endpoint;
    this._callback = callback;
    this._errorCallback = errorCallback;
  }

  public accept (apiService: ApiService): void {
    apiService.visitIE(this);
  }
}
