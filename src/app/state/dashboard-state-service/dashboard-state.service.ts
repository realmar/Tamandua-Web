import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class DashboardStateService {
  private _pastHours: number;
  private _maxItemCountPerCard: number;
  private _refreshInterval: number;

  private _refreshIntervalObservable: Subject<number>;

  constructor () {
    // set default values
    this._pastHours = 48;
    this._maxItemCountPerCard = 10;
    this._refreshInterval = 10000;

    this._refreshIntervalObservable = new Subject<number>();
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
    if (value <= 0) {
      return;
    }

    this._refreshInterval = value;
    this._refreshIntervalObservable.next(this._refreshInterval);
  }

  public get refreshIntervalObservable (): Observable<number> {
    return this._refreshIntervalObservable.asObservable();
  }
}
