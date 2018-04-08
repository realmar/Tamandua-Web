import { RequestBuilder } from '../api/request/request-builder';
import { CardRow } from './card-row';
import { DashboardCardData } from './dashboard-card/dashboard-card-data';
import { RequestBuilderField } from '../api/request/request-builder-field';

type ItemClickFildBuilder = (value: string | number) => RequestBuilderField;

interface CardChild {
  title: string;
  itemClickFieldBuilder: ItemClickFildBuilder;
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

  public addChild (title: string, itemClickFieldBuilder: ItemClickFildBuilder, request: RequestBuilder): void {
    this._children.push({
      title: title,
      itemClickFieldBuilder: itemClickFieldBuilder,
      request: request
    });
  }

  public build (): CardRow {
    return {
      title: this._title,
      cardData: this._children.map(x => {
        const data = new DashboardCardData(x.request);
        data.title = x.title;
        data.onItemClickFieldBuilder = x.itemClickFieldBuilder;

        return data;
      })
    };
  }
}
