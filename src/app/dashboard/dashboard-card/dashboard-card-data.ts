import { Observable } from 'rxjs/Observable';
import { RequestBuilder } from '../../api/request/request-builder';

export class DashboardCardData {
  private _title: string;
  private _requestBuilder: RequestBuilder;
  private _totalCount: Observable<number>;

  constructor (request: RequestBuilder, title?: string, totalCount?: Observable<number>) {
    this._title = title;
    this._requestBuilder = request;
    this._totalCount = totalCount;
  }

  get title (): string {
    return this._title;
  }

  set title (value: string) {
    this._title = value;
  }

  get requestBuilder (): RequestBuilder {
    return this._requestBuilder;
  }

  get totalCount (): Observable<number> {
    return this._totalCount;
  }

  set totalCount (value: Observable<number>) {
    this._totalCount = value;
  }
}
