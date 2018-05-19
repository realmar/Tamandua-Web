import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Setting } from '../setting';
import { SettingValidationResult } from '../setting-validation-result';
import { CardRow } from '../../dashboard/card-row';
import { Composite } from '../../dashboard/dashboard-overview-card/composite';
import { isMinAndDefined } from '../validators';
import { isDefinedFormatter, isMinFormatter } from '../formatters';

@Injectable()
export class DashboardSettingsService {
  private _timeoutBeforeEmit: number;

  private _pastHours: Setting<number>;
  private _pastHoursSubject: Subject<number>;

  private _maxItemCountPerCard: Setting<number>;
  private _maxItemsCountSubject: Subject<number>;

  private _refreshInterval: Setting<number>;
  private _refreshIntervalSubject: Subject<number>;

  private _cards: Setting<Array<CardRow>>;
  private _overviewCard: Setting<Array<Composite>>;

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

    this._pastHours = new Setting<number>(
      24,
      isMinAndDefined(
        1,
        isDefinedFormatter,
        isMinFormatter)
    );
    this._pastHoursSubject = new Subject<number>();

    this._maxItemCountPerCard = new Setting<number>(
      4,
      isMinAndDefined(
        1,
        isDefinedFormatter,
        isMinFormatter)
    );
    this._maxItemsCountSubject = new Subject<number>();

    this._refreshInterval = new Setting<number>(
      100000,
      isMinAndDefined(
        10000,
        isDefinedFormatter,
        (value, num) => isMinFormatter(value, num / 1000))
    );
    this._refreshIntervalSubject = new Subject<number>();

    this._cards = new Setting<Array<CardRow>>([], data => new SettingValidationResult(true));
    this._overviewCard = new Setting<Array<Composite>>(undefined, data => new SettingValidationResult(true));

    this._timeoutBeforeEmit = 800;

    this.emitFinishInitialize();
  }

  protected emitFinishInitialize (): void {
    this._isInitialized = true;
    this.onFinishInitalizeSubject.next();
  }

  protected emitPastHours (): void {
    this._pastHoursSubject.next(this._pastHours.getData());
  }

  protected emitMaxItemsCount (): void {
    this._maxItemsCountSubject.next(this._maxItemCountPerCard.getData());
  }

  protected emitRefreshInterval (): void {
    this._refreshIntervalSubject.next(this._refreshInterval.getData());
  }

  public getPastHours (): number {
    return this._pastHours.getData();
  }

  public setPastHours (value: number): SettingValidationResult {
    const result = this._pastHours.setData(value);

    if (result.isValid) {
      this._pastHoursSubject.next(value);
    }

    return result;
  }

  public getMaxItemCountPerCard (): number {
    return this._maxItemCountPerCard.getData();
  }

  public setMaxItemCountPerCard (value: number): SettingValidationResult {
    const result = this._maxItemCountPerCard.setData(value);

    if (result.isValid) {
      this._maxItemsCountSubject.next(value);
    }

    return result;
  }

  public getRefreshInterval (): number {
    return this._refreshInterval.getData();
  }

  public setRefreshInterval (value: number): SettingValidationResult {
    const result = this._refreshInterval.setData(value);

    if (result.isValid) {
      this._refreshIntervalSubject.next(value);
    }

    return result;
  }

  public getCards (): Array<CardRow> {
    return this._cards.getData();
  }

  public setCards (value: Array<CardRow>): SettingValidationResult {
    return this._cards.setData(value);
  }

  public getOverviewCard (): Array<Composite> {
    return this._overviewCard.getData();
  }

  public setOverviewCard (value: Array<Composite>): SettingValidationResult {
    return this._overviewCard.setData(value);
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
