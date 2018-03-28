import { ApiRequestData } from './request';
import { Endpoint } from './endpoints/endpoint';
import { ApiService } from '../api-service';
import { Observable } from 'rxjs/Observable';
import { ApiResponse } from '../response/api-response';

export class IntermediateExpressionRequest implements ApiRequestData {
  private readonly _dataObject: object;
  public get dataObject (): object {
    return this._dataObject;
  }

  public get data (): string {
    return JSON.stringify(this._dataObject);
  }

  private readonly _endpoint: Endpoint;
  public get endpoint (): Endpoint {
    return this._endpoint;
  }

  constructor (dataObject: object, endpoint: Endpoint) {
    this._dataObject = dataObject;
    this._endpoint = endpoint;
  }

  public accept<T extends ApiResponse> (apiService: ApiService): Observable<T> {
    return apiService.visitIE(this);
  }
}
