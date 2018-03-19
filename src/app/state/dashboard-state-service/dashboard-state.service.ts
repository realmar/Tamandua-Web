import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Injectable()
export class DashboardStateService {

  // NOTE: you will see a lot of set and get methods instead of setters and getter
  // this is because it is not possible to call a super setters and getters from
  // a derived class, which is needed here.

  private _timeoutBeforeEmit: number;

  private _pastHours: number;
  private _pastHoursSubject: Subject<number>;

  private _maxItemCountPerCard: number;
  private _maxItemsCountSubject: Subject<number>;

  private _refreshInterval: number;
  private _refreshIntervalSubject: Subject<number>;

  protected onFinishInitalizeSubject: Subject<any>;

  public get onFinishInitialize (): Observable<any> {
    return this.onFinishInitalizeSubject.asObservable();
  }

  protected _isInitialized: boolean;
  public get isInitialized (): boolean {
    return this._isInitialized;
  }

  constructor () {
    this.onFinishInitalizeSubject = new Subject<any>();
    this._isInitialized = false;

    this._pastHours = 48;
    this._pastHoursSubject = new Subject<number>();

    this._maxItemCountPerCard = 10;
    this._maxItemsCountSubject = new Subject<number>();

    this._refreshInterval = 10000;
    this._refreshIntervalSubject = new Subject<number>();

    this._timeoutBeforeEmit = 800;

    this.emitFinishInitialize();
  }

  private isUpdatedValueValid (value: number, storedValue: number) {
    return value <= 0 || value === storedValue;
  }

  protected emitFinishInitialize (): void {
    this._isInitialized = true;
    this.onFinishInitalizeSubject.next();
  }

  protected emitPastHours (): void {
    this._pastHoursSubject.next(this._pastHours);
  }

  protected emitMaxItemsCount (): void {
    this._maxItemsCountSubject.next(this._maxItemCountPerCard);
  }

  protected emitRefreshInterval (): void {
    this._refreshIntervalSubject.next(this._refreshInterval);
  }

  public getPastHours (): number {
    return this._pastHours;
  }

  public setPastHours (value: number) {
    if (this.isUpdatedValueValid(value, this._pastHours)) {
      return;
    }

    this._pastHours = value;
    this._pastHoursSubject.next(value);
  }

  public getMaxItemCountPerCard (): number {
    return this._maxItemCountPerCard;
  }

  public setMaxItemCountPerCard (value: number) {
    if (this.isUpdatedValueValid(value, this._maxItemCountPerCard)) {
      return;
    }

    this._maxItemCountPerCard = value;
    this._maxItemsCountSubject.next(value);
  }

  public getRefreshInterval (): number {
    return this._refreshInterval;
  }

  public setRefreshInterval (value: number): void {
    if (this.isUpdatedValueValid(value, this._refreshInterval)) {
      return;
    }

    this._refreshInterval = value;
    this._refreshIntervalSubject.next(value);
  }

  private applyDefaultDebounceTime<T> (observable: Observable<T>): Observable<T> {
    return observable.pipe(
      debounceTime(this._timeoutBeforeEmit),
      distinctUntilChanged());
  }

  public get pastHoursObservable (): Observable<number> {
    return this.applyDefaultDebounceTime(this._pastHoursSubject.asObservable());
  }

  public get maxItemCountObservable (): Observable<number> {
    return this.applyDefaultDebounceTime(this._maxItemsCountSubject.asObservable());
  }

  public get refreshIntervalObservable (): Observable<number> {
    return this.applyDefaultDebounceTime(this._refreshIntervalSubject.asObservable());
  }
}
