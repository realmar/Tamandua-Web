import { Injectable, Type } from '@angular/core';
import { DashboardSettingsService } from './dashboard-settings.service';
import { PersistentStorageService } from '../../../persistence/persistent-storage-service';
import { isNullOrUndefined } from '../../../utils/misc';
import { SettingValidationResult } from '../setting-validation-result';
import { CardRow } from '../../dashboard/card-row';
import { plainToClass } from 'class-transformer';
import { DashboardCardData } from '../../dashboard/dashboard-card/dashboard-card-data';

@Injectable()
export class DashboardPersistentSettingsService extends DashboardSettingsService {
  private _retrievedDataCount: number;

  constructor (private _storage: PersistentStorageService) {
    super();

    this._retrievedDataCount = 0;
    this.getData('dashboard_Cards', Object, result => this.deserializeCards(result), () => {
    });
    this.getData('dashboard_pastHours', Number, result => this.setPastHours(result), () => this.emitPastHours());
    this.getData('dashboard_MaxItemCountPerCard', Number, result => this.setMaxItemCountPerCard(result), () => this.emitMaxItemsCount());
    this.getData('dashboard_RefreshInterval', Number, result => this.setRefreshInterval(result), () => this.emitRefreshInterval());
  }

  private getData<T> (key: string, type: Type<T>, setter: (data: any) => void, callback: (data: any) => void) {
    this._storage.load(type, key).subscribe(result => {
      if (!isNullOrUndefined(result) /*&& result > 0*/) {
        setter(result);
      }

      callback(result);

      this._retrievedDataCount++;
      if (this._retrievedDataCount === 3) {
        this._isInitialized = true;
        this.onFinishInitalizeSubject.next();
      }
    });
  }

  protected emitFinishInitialize (): void {
    // do not emit
  }

  public setPastHours (value: number): SettingValidationResult {
    const result = super.setPastHours(value);
    if (result.isValid) {
      this._storage.save('dashboard_pastHours', value);
    }

    return result;
  }

  public setMaxItemCountPerCard (value: number): SettingValidationResult {
    const result = super.setMaxItemCountPerCard(value);
    if (result.isValid) {
      this._storage.save('dashboard_MaxItemCountPerCard', value);
    }

    return result;
  }

  public setRefreshInterval (value: number): SettingValidationResult {
    const result = super.setRefreshInterval(value);
    if (result.isValid) {
      this._storage.save('dashboard_RefreshInterval', value);
    }

    return result;
  }

  private deserializeCards (value: Array<CardRow>): void {
    value = value.map(card => {
      return {
        title: card.title,
        cardData: card.cardData.map(data => plainToClass(DashboardCardData, data))
      };
    });

    super.setCards(value);
  }

  public setCards (value: Array<CardRow>): SettingValidationResult {
    const result = super.setCards(value);
    if (result.isValid) {
      this._storage.save('dashboard_Cards', value);
    }

    return result;
  }
}
