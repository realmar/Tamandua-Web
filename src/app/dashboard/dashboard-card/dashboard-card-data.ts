import { RequestBuilder } from '../../../api/request/request-builder';
import { RequestBuilderField } from '../../../api/request/request-builder-field';
import { DashboardCardItemData } from '../dashboard-card-item/dashboard-card-item-data';
import { IntermediateExpressionRequestBuilder } from '../../../api/request/intermediate-expression-request-builder';
import { Exclude, plainToClass, Transform, Type } from 'class-transformer';
import { isNullOrUndefined } from '../../../utils/misc';
import { Comparator } from '../../../api/request/comparator';

function baseRequestBuilderFieldsToClass (value: Array<RequestBuilderField>): Array<RequestBuilderField> {
  if (isNullOrUndefined(value)) {
    return undefined;
  }

  return value.map(field => {
    return {
      name: field.name,
      value: field.value,
      comparator: plainToClass(Comparator, field.comparator)
    };
  });
}

export class DashboardCardData {
  private _title: string;

  @Type(() => IntermediateExpressionRequestBuilder)
  private readonly _requestBuilder: RequestBuilder;
  @Transform(baseRequestBuilderFieldsToClass, { toClassOnly: true })
  private _baseRequestBuilderFields: Array<RequestBuilderField>;

  @Exclude()
  private _requestResult: Array<DashboardCardItemData>;

  constructor (builder: RequestBuilder) {
    this._requestBuilder = builder;
    this._baseRequestBuilderFields = [];
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

  public set baseRequestBuilderFields (value: Array<RequestBuilderField>) {
    this._baseRequestBuilderFields = value;
  }

  public buildBaseRequestFields (value: string): Array<RequestBuilderField> {
    return this._baseRequestBuilderFields.map(field => {
      if (typeof field.value === 'string') {
        return {
          name: field.name,
          value: field.value.replace('{value}', value),
          comparator: field.comparator
        };
      } else {
        return field;
      }
    });
  }

  public get requestResult (): Array<DashboardCardItemData> {
    return this._requestResult;
  }

  public set requestResult (value: Array<DashboardCardItemData>) {
    this._requestResult = value;
  }
}
