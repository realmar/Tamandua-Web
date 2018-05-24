import { Injectable, OnInit, Type } from '@angular/core';
import { TrendSettingsService } from './trend-settings.service';
import { SettingValidationResult } from '../setting-validation-result';
import * as moment from 'moment';
import { PersistentStorageService } from '../../../persistence/persistent-storage-service';
import { isNullOrUndefined } from '../../../utils/misc';
import { SettingsUtilsService } from '../settings-utils-service/settings-utils.service';
import { InitializationCounter } from '../settings-utils-service/initialization-counter';

@Injectable()
export class TrendPersistentSettingsService extends TrendSettingsService {
  private _gotAllData = false;
  private readonly _initializationCounter: InitializationCounter;

  public constructor (private _storage: PersistentStorageService,
                      private _utils: SettingsUtilsService) {
    super();
    this._initializationCounter = new InitializationCounter(3, () => {
      this._gotAllData = true;
      this.emitOnFinishInitialized();
    });
    _utils.getData('diagram_SampleCount', Number, value => super.setSampleCount(value as number), this._initializationCounter);
    _utils.getData('diagram_SampleDuration', Number, value => this.deserializeSampleDuration(value as number), this._initializationCounter);
    _utils.getData('diagram_TotalDuration', Number, value => this.deserializeTotalDuration(value as number), this._initializationCounter);
  }

  private deserializeTotalDuration (duration: number): void {
    super.setTotalDuration(moment.duration(duration, 'seconds'));
  }

  private deserializeSampleDuration (duration: number): void {
    super.setSampleDuration(moment.duration(duration, 'seconds'));
  }

  protected emitOnFinishInitialized (): void {
    if (!isNullOrUndefined(this._gotAllData) && this._gotAllData) {
      super.emitOnFinishInitialized();
    }
  }

  public setSampleCount (value: number): SettingValidationResult {
    if (!this.isInitialized) {
      return new SettingValidationResult(true);
    }

    const result = super.setSampleCount(value);
    if (result.isValid) {
      this._storage.save('diagram_SampleCount', value);
    }

    return result;
  }

  public setSampleDuration (value: moment.Duration): SettingValidationResult {
    if (!this.isInitialized) {
      return new SettingValidationResult(true);
    }

    const result = super.setSampleDuration(value);
    if (result.isValid) {
      this._storage.save('diagram_SampleDuration', value.asSeconds());
    }

    return result;
  }

  public setTotalDuration (value: moment.Duration): SettingValidationResult {
    if (!this.isInitialized) {
      return new SettingValidationResult(true);
    }

    const result = super.setTotalDuration(value);
    if (result.isValid) {
      this._storage.save('diagram_TotalDuration', value.asSeconds());
    }

    return result;
  }
}
