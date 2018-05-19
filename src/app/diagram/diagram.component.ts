import { Component, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { Duration, Moment } from 'moment';
import * as clone from 'clone';
import { ApiService } from '../../api/api-service';
import { AdvancedCountResponse } from '../../api/response/advanced-count-response';
import { LineChartComponent } from '@swimlane/ngx-charts/release/line-chart/line-chart.component';
import { isNullOrUndefined, toFloat } from '../../utils/misc';
import * as d3 from 'd3';
import { CurveFactory } from 'd3';
import * as numeral from 'numeral';
import { RouteReenterListener } from '../../base-classes/route-reenter-listener';
import { Router } from '@angular/router';
import { DiagramInputData, DiagramStateService } from './diagram-state-service/diagram-state.service';
import { Subject, Observable, Subscription } from 'rxjs';
import { SettingValidationResult } from '../settings/setting-validation-result';
import { DiagramSettingsService } from '../settings/diagram-settings-service/diagram-settings.service';

interface ResultWrapper {
  readonly timepoint: Moment;
  readonly data: AdvancedCountResponse;
}

interface ChartSeries {
  name: Moment;
  value: number;
}

interface ChartItem {
  name: string;
  series: Array<ChartSeries>;
}

type ChartData = Array<ChartItem>;

@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: [ './diagram.component.scss' ]
})
export class DiagramComponent extends RouteReenterListener {
  @ViewChild(LineChartComponent) private _chart: LineChartComponent;

  private _totalDurationValidation = new Subject<SettingValidationResult>();
  private _sampleDurationValidation = new Subject<SettingValidationResult>();
  private _sampleCountValidation = new Subject<SettingValidationResult>();

  public get totalDurationValidationObservable (): Observable<SettingValidationResult> {
    return this._totalDurationValidation.asObservable();
  }

  public get sampleDurationValidationObservable (): Observable<SettingValidationResult> {
    return this._sampleDurationValidation.asObservable();
  }

  public get sampleCountValidationObservable (): Observable<SettingValidationResult> {
    return this._sampleCountValidation.asObservable();
  }

  public get totalDuration (): number {
    return this._diagramSettingsService.getTotalDuration().asHours();
  }

  public set totalDuration (value: number) {
    this._totalDurationValidation.next(this._diagramSettingsService.setTotalDuration(moment.duration(toFloat(value), 'hours')));
  }

  public get sampleDuration (): number {
    return this._diagramSettingsService.getSampleDuration().asMinutes();
  }

  public set sampleDuration (value: number) {
    this._sampleDurationValidation.next(this._diagramSettingsService.setSampleDuration(moment.duration(toFloat(value), 'minutes')));
  }

  public get sampleCount (): number {
    return this._diagramSettingsService.getSampleCount();
  }

  public set sampleCount (value: number) {
    this._sampleCountValidation.next(this._diagramSettingsService.setSampleCount(toFloat(value)));
  }

  private _inputData: DiagramInputData;

  public get title (): string {
    return this._inputData.title;
  }

  public get sampleInterval (): Duration {
    const interval = this._diagramSettingsService.getTotalDuration().asHours() / this._diagramSettingsService.getSampleCount();
    return moment.duration(interval, 'hours');
  }

  private _chartData: ChartData;
  public get chartData (): ChartData {
    return isNullOrUndefined(this._chartData) ? [] : this._chartData;
  }

  private _xAxisTicks: Array<Moment>;
  public get xAxisTicks (): Array<Moment> {
    return this._xAxisTicks;
  }

  public get curve (): CurveFactory {
    return d3.curveMonotoneX;
  }

  public get hasData (): boolean {
    return this._chartData.length > 0;
  }

  private _isDoingRequest: boolean;
  public get isDoingRequest (): boolean {
    return isNullOrUndefined(this._isDoingRequest) ? false : this._isDoingRequest;
  }

  private readonly _requestSubscriptions: Array<Subscription>;
  private _requestIsCancled = false;

  public constructor (private _apiService: ApiService,
                      private _diagramStateService: DiagramStateService,
                      private _diagramSettingsService: DiagramSettingsService,
                      router: Router) {
    super(router);
    this._requestSubscriptions = new Array<Subscription>();
    this._chartData = [];
  }

  public ngOnInit (): void {
    super.ngOnInit();
    this.syncState();
  }

  public xAxisTickFormatting (label: Moment): string {
    return label.format('HH:mm:ss');
  }

  public yAxisTickFormatting (label: string): string {
    return numeral(label).format('0');
  }

  protected getRouteMatcher (): RegExp {
    return new RegExp('^\/diagram', 'i');
  }

  protected onRouteReenter (): void {
    this.syncState();
  }

  private syncState (): void {
    const data = this._diagramStateService.data;
    if (data !== this._inputData) {
      this._inputData = data;
      this.collectData();
    }
  }

  private collectDataCallback (data: Array<ResultWrapper>): void {
    if (this._requestIsCancled) {
      return;
    }

    const map = new Map<string, ChartItem>();
    data.forEach(value => {
      value.data.items.forEach(x => {
        const createSeriesItem = () => {
          return {
            name: value.timepoint,
            value: x.value,
          };
        };

        if (map.has(x.key)) {
          map.get(x.key).series.push(createSeriesItem());
        } else {
          map.set(x.key, {
            name: x.key,
            series: [ createSeriesItem() ]
          });
        }
      });
    });

    const dataArr = map.valuesToArray();
    const uniqueXLabels = new Map<Moment, any>();
    if (dataArr.length > 0) {
      dataArr
        .map(value => value.series)
        .reduce((previousValue, currentValue) => previousValue.concat(currentValue))
        .map(value => value.name)
        .forEach(value => uniqueXLabels.set(value, null));
    }
    this._xAxisTicks = uniqueXLabels.keysToArray();

    this._chartData = dataArr;
    this._isDoingRequest = false;
  }

  public collectData (): void {
    this._requestIsCancled = false;
    this._isDoingRequest = true;
    this._requestSubscriptions.clear();

    const results: Array<ResultWrapper> = [];
    const sampleInterval = this.sampleInterval;
    const duration = clone(this._diagramSettingsService.getTotalDuration());
    const time = moment().subtract(duration.add(sampleInterval));

    for (let i = 0; i < this._diagramSettingsService.getSampleCount(); i++) {
      // in momentjs 3.0.0 this stuff will get immutable, so then we dont need to clone it
      // see: https://github.com/moment/moment/issues/1754
      const startDate = clone(time).subtract(this._diagramSettingsService.getSampleDuration()).toDate();
      const endDate = time.toDate();
      const timepoint = clone(time);

      this._inputData.requestBuilder.setStartDatetime(startDate);
      this._inputData.requestBuilder.setEndDatetime(endDate);

      const request = this._inputData.requestBuilder.build();
      this._requestSubscriptions.push(this._apiService.SubmitRequest<AdvancedCountResponse>(request).subscribe(value => {
        results.push({
          timepoint: timepoint,
          data: value
        });
        if (results.length === this._diagramSettingsService.getSampleCount()) {
          this.collectDataCallback(results);
        }
      }));

      time.add(sampleInterval);
    }
  }

  public cancelRequests (): void {
    this._requestIsCancled = true;
    this._isDoingRequest = false;
    this._requestSubscriptions.forEach(sub => sub.unsubscribe());
    this._requestSubscriptions.clear();
  }
}
