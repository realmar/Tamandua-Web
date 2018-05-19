import { RequestBuilder } from '../../../api/request/request-builder';
import { Exclude, Type } from 'class-transformer';
import { isNullOrUndefined } from '../../../utils/misc';
import { DashboardCardItemData } from '../dashboard-card-item/dashboard-card-item-data';
import { ApiService } from '../../../api/api-service';

export interface SummaryItem {
  readonly indentLevel: number;
  readonly data: DashboardCardItemData;
}

export class Item {
  public readonly name: string;
  @Type(() => ApiService.RequestBuilderClass)
  public readonly builder: RequestBuilder;

  @Exclude()
  private _response: SummaryItem;
  public get response (): SummaryItem {
    return this._response;
  }

  public set response (value: SummaryItem) {
    this._response = value;
  }

  public constructor (name: string, builder: RequestBuilder) {
    this.name = name;
    this.builder = builder;
  }
}

export class Composite {
  @Type(() => Item)
  public item: Item;
  @Type(() => Composite)
  public composites: Array<Composite>;

  public constructor (item: Item, composites?: Array<Composite>) {
    this.item = item;
    this.composites = isNullOrUndefined(composites) ? [] : composites;
  }

  public addComposite (composite: Composite): void {
    this.composites.push(composite);
  }

  public countItemsInHierarchy (composite?: Composite): number {
    let composites = this.composites;
    if (!isNullOrUndefined(composite)) {
      composites = composite.composites;
    }

    return composites
      .map(x => this.countItemsInHierarchy(x))
      .reduce((x, y) => x + y, 1);
  }
}
