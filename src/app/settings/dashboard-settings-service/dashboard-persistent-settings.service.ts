import { Injectable } from '@angular/core';
import { DashboardSettingsService } from './dashboard-settings.service';
import { PersistentStorageService } from '../../../persistence/persistent-storage-service';
import { SettingValidationResult } from '../setting-validation-result';
import { CardRow } from '../../dashboard/card-row';
import { plainToClass } from 'class-transformer';
import { DashboardCardData } from '../../dashboard/dashboard-card/dashboard-card-data';
import { Composite } from '../../dashboard/dashboard-overview-card/composite';
import { InitializationCounter } from '../settings-utils-service/initialization-counter';
import { SettingsUtilsService } from '../settings-utils-service/settings-utils.service';
import { isNullOrUndefined } from '../../../utils/misc';

@Injectable()
export class DashboardPersistentSettingsService extends DashboardSettingsService {
  private _gotAllData = false;
  private readonly _initializationCounter: InitializationCounter;

  constructor (private _storage: PersistentStorageService,
               private _utils: SettingsUtilsService) {
    super();

    this._initializationCounter = new InitializationCounter(5, () => {
      this._gotAllData = true;
      this.emitPastHours();
      this.emitMaxItemsCount();
      this.emitRefreshInterval();
      this.emitOnFinishInitialized();
    });

    this._utils.getData('dashboard_Cards', Object, result => this.deserializeCards(result as Array<CardRow>), this._initializationCounter);
    this._utils.getData('dashboard_OverviewCards', Composite, result => super.setOverviewCard(result as any), this._initializationCounter);
    this._utils.getData('dashboard_pastHours', Number, result => super.setPastHours(result as number), this._initializationCounter);
    this._utils.getData('dashboard_MaxItemCountPerCard', Number, result => super.setMaxItemCountPerCard(result as number), this._initializationCounter);
    this._utils.getData('dashboard_RefreshInterval', Number, result => super.setRefreshInterval(result as number), this._initializationCounter);
  }

  protected emitOnFinishInitialized (): void {
    if (!isNullOrUndefined(this._gotAllData) && this._gotAllData) {
      super.emitOnFinishInitialized();
    }
  }

  public setPastHours (value: number): SettingValidationResult {
    if (!this.isInitialized) {
      return new SettingValidationResult(true);
    }

    const result = super.setPastHours(value);
    if (result.isValid) {
      this._storage.save('dashboard_pastHours', value);
    }

    return result;
  }

  public setMaxItemCountPerCard (value: number): SettingValidationResult {
    if (!this.isInitialized) {
      return new SettingValidationResult(true);
    }

    const result = super.setMaxItemCountPerCard(value);
    if (result.isValid) {
      this._storage.save('dashboard_MaxItemCountPerCard', value);
    }

    return result;
  }

  public setRefreshInterval (value: number): SettingValidationResult {
    if (!this.isInitialized) {
      return new SettingValidationResult(true);
    }

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
    if (!this.isInitialized) {
      return new SettingValidationResult(true);
    }

    const result = super.setCards(value);
    if (result.isValid) {
      this._storage.save('dashboard_Cards', value);
    }

    return result;
  }

  public setOverviewCard (value: Array<Composite>): SettingValidationResult {
    if (!this.isInitialized) {
      return new SettingValidationResult(true);
    }

    const result = super.setOverviewCard(value);
    if (result.isValid) {
      this._storage.save('dashboard_OverviewCards', value);
    }

    return result;
  }
}
