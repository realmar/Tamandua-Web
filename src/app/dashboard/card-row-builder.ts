import { RequestBuilder } from '../../api/request/request-builder';
import { CardRow } from './card-row';
import { DashboardCardData } from './dashboard-card/dashboard-card-data';
import { RequestBuilderField } from '../../api/request/request-builder-field';
import { isNullOrUndefined } from '../../utils/misc';

interface CardChild {
  title: string;
  baseRequestFields: Array<RequestBuilderField>;
  request: RequestBuilder;
}

export class CardRowBuilder {
  private _title: string;
  private readonly _children: Array<CardChild>;

  public constructor () {
    this._title = '';
    this._children = [];
  }

  public setTitle (value: string): void {
    this._title = value;
  }

  public addChild (title: string, baseRequestFields: Array<RequestBuilderField>, request: RequestBuilder): void {
    if (isNullOrUndefined(baseRequestFields)) {
      baseRequestFields = [];
    }

    this._children.push({
      title: title,
      baseRequestFields: baseRequestFields,
      request: request
    });
  }

  public build (): CardRow {
    return {
      title: this._title,
      cardData: this._children.map(x => {
        const data = new DashboardCardData(x.request);
        data.title = x.title;
        data.baseRequestBuilderFields = x.baseRequestFields;

        return data;
      })
    };
  }
}
