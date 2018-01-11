import { Observable } from 'rxjs/Observable';
import { RequestBuilder } from '../../api/request/request-builder';
import { RequestBuilderField } from '../../api/request/request-builder-field';

export class DashboardCardData {
  private _title: string;
  private _totalCount: Observable<number>;

  private _requestBuilder: RequestBuilder;
  private _onItemClickFieldBuilder: (value: string | number) => RequestBuilderField;

  constructor (builder: RequestBuilder) {
    this._requestBuilder = builder;
    this._onItemClickFieldBuilder = (value: string | number) => {
      return { name: '', value: '', comparator: undefined };
    };
  }

  public get title (): string {
    return this._title;
  }

  public set title (value: string) {
    this._title = value;
  }

  public get requestBuilder (): RequestBuilder {
    return this._requestBuilder;
  }

  public get totalCount (): Observable<number> {
    return this._totalCount;
  }

  public set totalCount (value: Observable<number>) {
    this._totalCount = value;
  }

  public set onItemClickFieldBuilder (value: (value: string | number) => RequestBuilderField) {
    this._onItemClickFieldBuilder = value;
  }

  public buildOnItemClickField (value: string | number): RequestBuilderField {
    return this._onItemClickFieldBuilder(value);
  }
}
