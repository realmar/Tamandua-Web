import { Injectable } from '@angular/core';
import { Setting } from '../setting';
import * as moment from 'moment';
import { Duration } from 'moment';
import { durationMin, isMinAndDefined } from '../validators';
import { durationMinFormatter, isDefinedFormatter, isMinFormatter } from '../formatters';
import { SettingValidationResult } from '../setting-validation-result';
import { Observable, Subject } from 'rxjs/index';
import { BaseSettingsService } from '../BaseSettingsService';

@Injectable()
export class TrendSettingsService extends BaseSettingsService {
  private _sampleCount: Setting<number>;
  private _totalDuration: Setting<Duration>;

  public constructor () {
    super();

    this._sampleCount = new Setting<number>(
      40,
      isMinAndDefined(
        4,
        isDefinedFormatter,
        isMinFormatter));

    this._totalDuration = new Setting<Duration>(
      moment.duration(4, 'hours'),
      durationMin(
        moment.duration(1, 'hours'),
        (value, min) => durationMinFormatter(value, min, d => d.asHours())));

    this.emitOnFinishInitialized();
  }

  public getSampleCount (): number {
    return this._sampleCount.getData();
  }

  public setSampleCount (value: number): SettingValidationResult {
    return this._sampleCount.setData(value);
  }

  public getTotalDuration (): Duration {
    return this._totalDuration.getData();
  }

  public setTotalDuration (value: Duration): SettingValidationResult {
    return this._totalDuration.setData(value);
  }
}
