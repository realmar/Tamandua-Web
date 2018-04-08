import { RequestBuilder } from '../../api/request/request-builder';
import { RequestBuilderField } from '../../api/request/request-builder-field';
import { DashboardCardItemData } from '../dashboard-card-item/dashboard-card-item-data';

export class DashboardCardData {
  private _title: string;

  private readonly _requestBuilder: RequestBuilder;
  private _onItemClickFieldBuilder: (value: string | number) => RequestBuilderField;

  private _requestResult: Array<DashboardCardItemData>;

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

  public set onItemClickFieldBuilder (value: (value: string | number) => RequestBuilderField) {
    this._onItemClickFieldBuilder = value;
  }

  public get requestResult (): Array<DashboardCardItemData> {
    return this._requestResult;
  }

  public set requestResult (value: Array<DashboardCardItemData>) {
    this._requestResult = value;
  }

  public buildOnItemClickField (value: string | number): RequestBuilderField {
    return this._onItemClickFieldBuilder(value);
  }
}
