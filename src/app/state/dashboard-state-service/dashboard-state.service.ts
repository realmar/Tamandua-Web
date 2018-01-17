import { Injectable } from '@angular/core';

@Injectable()
export class DashboardStateService {
  private _pastHours: number;
  private _maxItemCountPerCard: number;
  private _refreshInterval: number;

  constructor () {
    // set default values
    this._pastHours = 500;
    this._maxItemCountPerCard = 10;
    this._refreshInterval = 10000;
  }

  public get pastHours (): number {
    return this._pastHours;
  }

  public set pastHours (value: number) {
    this._pastHours = value;
  }

  public get maxItemCountPerCard (): number {
    return this._maxItemCountPerCard;
  }

  public set maxItemCountPerCard (value: number) {
    this._maxItemCountPerCard = value;
  }

  public get refreshInterval (): number {
    return this._refreshInterval;
  }

  public set refreshInterval (value: number) {
    this._refreshInterval = value;
  }
}
