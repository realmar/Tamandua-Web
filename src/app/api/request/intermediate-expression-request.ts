import { Request } from './request';
import { ApiService } from '../api-service';

export class IntermediateExpressionRequest implements Request {
  private _dataObject: object;
  get dataObject (): object {
    return this._dataObject;
  }

  get data (): string {
    return JSON.stringify(this._dataObject);
  }

  constructor (dataObject: object) {
    this._dataObject = dataObject;
  }

  public accept (apiService: ApiService): void {
    apiService.acceptIERequest(this);
  }
}
