import { Component } from '@angular/core';
import * as moment from 'moment';
import { Duration, Moment } from 'moment';
import * as clone from 'clone';
import { ApiService } from '../../api/api-service';
import { isNullOrUndefined, toFloat } from '../../utils/misc';
import * as numeral from 'numeral';
import { RouteChangeListener } from '../../base-classes/route-change-listener';
import { Router } from '@angular/router';
import { TrendInputData, TrendStateService } from './trend-state-service/trend-state.service';
import { Subject, Observable } from 'rxjs';
import { SettingValidationResult } from '../settings/setting-validation-result';
import { TrendSettingsService } from '../settings/trend-settings-service/trend-settings.service';
import { createTrendEndpoint } from '../../api/request/endpoints/trend-endpoint';
import { TrendResponse } from '../../api/response/trend-response';
import { Converter } from '../../utils/converter';
import { buildSpam } from '../dashboard/default-cards/spam';
import { DashboardSettingsService } from '../settings/dashboard-settings-service/dashboard-settings.service';

interface ChartSeries {
  readonly moment: Moment;
  readonly name: string;
  readonly value: number;
}

interface ChartItem {
  readonly name: number;
  readonly series: Array<ChartSeries>;
}

type ChartData = Array<ChartItem>;

@Component({
  selector: 'app-trend',
  templateUrl: './trend.component.html',
  styleUrls: [ './trend.component.scss' ]
})
export class TrendComponent extends RouteChangeListener {
  private readonly _cancellationToken = new Subject<any>();

  private _totalDurationValidation = new Subject<SettingValidationResult>();
  private _sampleCountValidation = new Subject<SettingValidationResult>();

  public get totalDurationValidationObservable (): Observable<SettingValidationResult> {
    return this._totalDurationValidation.asObservable();
  }

  public get sampleCountValidationObservable (): Observable<SettingValidationResult> {
    return this._sampleCountValidation.asObservable();
  }

  public get totalDuration (): number {
    return this._trendSettingsService.getTotalDuration().asHours();
  }

  public set totalDuration (value: number) {
    this._totalDurationValidation.next(this._trendSettingsService.setTotalDuration(moment.duration(toFloat(value), 'hours')));
  }

  public get sampleCount (): number {
    return this._trendSettingsService.getSampleCount();
  }

  public set sampleCount (value: number) {
    this._sampleCountValidation.next(this._trendSettingsService.setSampleCount(toFloat(value)));
  }

  public get formattedDurationDelta (): string {
    const total = this._trendSettingsService.getTotalDuration().asSeconds();
    const count = this._trendSettingsService.getSampleCount();

    let delta = total / count;
    let suffix = 's';

    if (delta >= 60 * 60) {
      delta /= 60 * 60;
      suffix = 'h';
    } else if (delta >= 60 * 2) {
      delta /= 60;
      suffix = 'min';
    }

    return numeral(delta).format('0.0') + suffix;
  }

  private _inputData: TrendInputData;

  public get title (): string {
    return this._inputData.title;
  }

  public get sampleInterval (): Duration {
    const interval = this._trendSettingsService.getTotalDuration().asHours() / this._trendSettingsService.getSampleCount();
    return moment.duration(interval, 'hours');
  }

  private _chartData: ChartData;
  public get chartData (): ChartData {
    return isNullOrUndefined(this._chartData) ? [] : this._chartData;
  }

  private _xAxisTicks: Array<number>;
  public get xAxisTicks (): Array<number> {
    return this._xAxisTicks;
  }

  public get hasData (): boolean {
    return this._chartData.length > 0;
  }

  public get canSearch (): boolean {
    return !isNullOrUndefined(this._inputData);
  }

  private _isDoingRequest: boolean;
  public get isDoingRequest (): boolean {
    return isNullOrUndefined(this._isDoingRequest) ? false : this._isDoingRequest;
  }

  public get settingNgStyle (): { [ key: string ]: string } {
    return {
      width: '6rem'
    };
  }

  public constructor (private _apiService: ApiService,
                      private _trendStateService: TrendStateService,
                      private _trendSettingsService: TrendSettingsService,
                      /* private _d: DashboardSettingsService, // debug */
                      router: Router) {
    super(router);
    this._chartData = [];
  }

  public ngOnInit (): void {
    super.ngOnInit();

    if (this._trendSettingsService.isInitialized) {
      this.syncState();
    } else {
      this._trendSettingsService.onFinishInitialize.subscribe(() => this.syncState());
    }
  }

  public ngOnDestroy (): void {
    super.ngOnDestroy();
    this.cancelRequest();
  }

  public xAxisTickFormatting (label: number): string {
    return moment.unix(label).format('YYYY/MM/DD HH:mm:ss');
  }

  public yAxisTickFormatting (label: string | number): string {
    return numeral(label).format('0');
  }

  protected getRouteMatcher (): RegExp {
    return new RegExp('^\/trend', 'i');
  }

  protected onRouteReenter (): void {
    if (this._trendSettingsService.isInitialized) {
      this.syncState();
    }
  }

  protected onRouteExit (): void {
  }

  private syncState (): void {
    // debug
    /* this._inputData = {
      requestBuilder: buildSpam(() => this._apiService.getRequestBuilder(), this._d).cardData[ 1 ].requestBuilder,
      title: 'test'
    };
    this.cancelRequest();
    this.collectData(); */

    const data = this._trendStateService.data;
    if (data !== this._inputData) {
      this._inputData = data;
      this.cancelRequest();
      this.collectData();
    }
  }

  private collectData (): void {
    if (this._isDoingRequest || !this._trendSettingsService.isInitialized) {
      return;
    }

    this._isDoingRequest = true;

    const rb = clone(this._inputData.requestBuilder);
    const field = rb.getEndpoint().metadata.field;
    const dataCount = rb.getEndpoint().metadata.length as number;
    const separator = rb.getEndpoint().metadata.separator as string;
    const sampleCount = this._trendSettingsService.getSampleCount();
    const totalDuration = this._trendSettingsService.getTotalDuration().asHours();

    const endpoint = createTrendEndpoint(field, dataCount, separator);
    rb.setEndpoint(endpoint);

    const request = rb.build();
    request.data[ 'sampleCount' ] = sampleCount;
    request.data[ 'totalHours' ] = totalDuration;

    this._apiService.SubmitRequest<TrendResponse>(request, this._cancellationToken).subscribe(value => {
        const uniqueXLabels = new Map<number, ChartSeries>();
        const resultMap = new Map<number, ChartItem>();

        value.forEach(result => {
          result.forEach(data => {
            const momentTime = moment(Converter.stringToDate(data.datetime));
            const unixTime = momentTime.unix();

            const item = {
              moment: momentTime,
              name: data.key,
              value: toFloat(data.value)
            };
            uniqueXLabels.set(unixTime, item);

            if (!resultMap.has(unixTime)) {
              resultMap.set(unixTime, {
                name: unixTime,
                series: [ item ]
              });
            } else {
              resultMap.get(unixTime).series.push(item);
            }
          });
        });

        this._xAxisTicks = uniqueXLabels
          .valuesToArray()
          .sort((a, b) => a.moment.diff(b.moment))
          .map(v => v.moment.unix());
        this._chartData = resultMap.valuesToArray();
        this._isDoingRequest = false;
      },
      () => this.cancelRequest());
  }

  public cancelRequest (): void {
    this._cancellationToken.next();
    this._isDoingRequest = false;
  }
}
