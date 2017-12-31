import { Request } from './request';
import { ApiService } from '../api-service';
import { Endpoint } from './endpoints/endpoint';

export class IntermediateExpressionRequest implements Request {
  private _dataObject: object;
  get dataObject (): object {
    return this._dataObject;
  }

  get data (): string {
    return JSON.stringify(this._dataObject);
  }

  private _endpoint: Endpoint;
  get endpoint (): Endpoint {
    return this._endpoint;
  }

  constructor (dataObject: object, endpoint: Endpoint) {
    this._dataObject = dataObject;
    this._endpoint = endpoint;
  }

  public accept (apiService: ApiService): void {
    apiService.acceptIERequest(this);
  }
}
