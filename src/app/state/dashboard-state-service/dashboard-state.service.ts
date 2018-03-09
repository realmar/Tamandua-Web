import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { CardRow } from '../../dashboard/card-row';

@Injectable()
export class DashboardStateService {

  // NOTE: you will see a lot of set and get methods instead of setters and getter
  // this is because it is not possible to call a super setters and getters from
  // a derived class, which is needed here.

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

  public getPastHours (): number {
    return this._pastHours;
  }

  public setPastHours (value: number) {
    this._pastHours = value;
  }

  public getMaxItemCountPerCard (): number {
    return this._maxItemCountPerCard;
  }

  public setMaxItemCountPerCard (value: number) {
    this._maxItemCountPerCard = value;
  }

  public getRefreshInterval (): number {
    return this._refreshInterval;
  }

  public setRefreshInterval (value: number): void {
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
