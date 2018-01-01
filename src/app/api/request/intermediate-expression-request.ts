import { Request } from './request';
import { Endpoint } from './endpoints/endpoint';
import { ApiService } from '../api-service';

export class IntermediateExpressionRequest implements Request {
  private _dataObject: object;
  get dataObject (): object {
    return this._dataObject;
  }

  get data (): string {
    return JSON.stringify(this._dataObject);
  }

  private _callback: (object) => void;
  get callback (): (object) => void {
    return this._callback;
  }

  private _endpoint: Endpoint;
  get endpoint (): Endpoint {
    return this._endpoint;
  }

  constructor (dataObject: object, endpoint: Endpoint, callback: (object) => void) {
    this._dataObject = dataObject;
    this._callback = callback;
    this._endpoint = endpoint;
  }

  public accept (apiService: ApiService): void {
    apiService.visitIE(this);
  }
}
