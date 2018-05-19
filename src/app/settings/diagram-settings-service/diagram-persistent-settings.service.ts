import { Injectable, OnInit, Type } from '@angular/core';
import { DiagramSettingsService } from './diagram-settings.service';
import { SettingValidationResult } from '../setting-validation-result';
import * as moment from 'moment';
import { PersistentStorageService } from '../../../persistence/persistent-storage-service';
import { isNullOrUndefined } from '../../../utils/misc';

@Injectable()
export class DiagramPersistentSettingsService extends DiagramSettingsService {
  private _retrievedDataCount: number;

  public constructor (private _storage: PersistentStorageService) {
    super();
    this._retrievedDataCount = 0;

    this.getData('diagram_SampleCount', Number, super.setSampleCount.bind(this));
    this.getData('diagram_SampleDuration', Number, value => this.deserializeSampleDuration(value as number));
    this.getData('diagram_TotalDuration', Number, value => this.deserializeTotalDuration(value as number));
  }

  private getData<T> (key: string, type: Type<T>, setter: (value: T) => void): void {
    this._storage.load(type, key).subscribe(value => {
      if (!isNullOrUndefined(value)) {
        setter(value);
      }
    });

    this._retrievedDataCount++;
    if (this._retrievedDataCount === 3) {
      this._isInitialized = true;
      this.onFinishInitalizeSubject.next();
    }
  }

  private deserializeTotalDuration (duration: number): void {
    super.setTotalDuration(moment.duration(duration, 'seconds'));
  }

  private deserializeSampleDuration (duration: number): void {
    super.setTotalDuration(moment.duration(duration, 'seconds'));
  }

  protected emitFinishInitialize (): void {
    // do not emit
  }

  public setSampleCount (value: number): SettingValidationResult {
    const result = super.setSampleCount(value);
    if (result.isValid) {
      this._storage.save('diagram_SampleCount', value);
    }

    return result;
  }

  public setSampleDuration (value: moment.Duration): SettingValidationResult {
    const result = super.setSampleDuration(value);
    if (result.isValid) {
      this._storage.save('diagram_SampleDuration', value.asSeconds());
    }

    return result;
  }

  public setTotalDuration (value: moment.Duration): SettingValidationResult {
    const result = super.setTotalDuration(value);
    if (result.isValid) {
      this._storage.save('diagram_TotalDuration', value.asSeconds());
    }

    return result;
  }
}
