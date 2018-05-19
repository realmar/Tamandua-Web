import { Injectable } from '@angular/core';
import { Setting } from '../setting';
import * as moment from 'moment';
import { Duration } from 'moment';
import { durationMin, isMinAndDefined } from '../validators';
import { durationMinFormatter, isDefinedFormatter, isMinFormatter } from '../formatters';
import { SettingValidationResult } from '../setting-validation-result';

@Injectable()
export class DiagramSettingsService {
  private _sampleCount: Setting<number>;
  private _sampleDuration: Setting<Duration>;
  private _totalDuration: Setting<Duration>;

  public constructor () {
    this._sampleCount = new Setting<number>(10, isMinAndDefined(4, isDefinedFormatter, isMinFormatter));
    this._sampleDuration = new Setting<Duration>(
      moment.duration(60, 'minutes'),
      durationMin(
        moment.duration(1, 'minutes'),
        (value, min) => durationMinFormatter(value, min, d => d.asMinutes())));

    this._totalDuration = new Setting<Duration>(
      moment.duration(4, 'hours'),
      durationMin(
        moment.duration(1, 'hours'),
        (value, min) => durationMinFormatter(value, min, d => d.asHours())));
  }

  public getSampleCount (): number {
    return this._sampleCount.getData();
  }

  public setSampleCount (value: number): SettingValidationResult {
    return this._sampleCount.setData(value);
  }

  public getSampleDuration (): Duration {
    return this._sampleDuration.getData();
  }

  public setSampleDuration (value: Duration): SettingValidationResult {
    return this._sampleDuration.setData(value);
  }

  public getTotalDuration (): Duration {
    return this._totalDuration.getData();
  }

  public setTotalDuration (value: Duration): SettingValidationResult {
    return this._totalDuration.setData(value);
  }
}
