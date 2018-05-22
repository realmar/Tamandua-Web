import { Component, ViewChild, ɵPublicFeature } from '@angular/core';
import * as moment from 'moment';
import { Duration, Moment } from 'moment';
import * as clone from 'clone';
import { ApiService } from '../../api/api-service';
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
import { unsubscribeIfDefined } from '../../utils/rxjs';
import { createTrendEndpoint } from '../../api/request/endpoints/trend-endpoint';
import { TrendResponse } from '../../api/response/trend-response';
import { Converter } from '../../utils/converter';
import { DashboardSettingsService } from '../settings/dashboard-settings-service/dashboard-settings.service';
import { buildSpam } from '../dashboard/default-cards/spam';
import { serialize } from 'class-transformer';

interface ChartSeries {
  readonly moment: Moment;
  readonly name: string;
  readonly value: number;
}

interface ChartItem {
  readonly name: string;
  readonly series: Array<ChartSeries>;
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

  private _xAxisTicks: Array<string>;
  public get xAxisTicks (): Array<string> {
    return this._xAxisTicks;
  }

  public get curve (): CurveFactory {
    return d3.curveMonotoneX;
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

  private _requestSubscription: Subscription;

  public constructor (private _apiService: ApiService,
                      private _diagramStateService: DiagramStateService,
                      private _diagramSettingsService: DiagramSettingsService,
                      private _d: DashboardSettingsService,
                      router: Router) {
    super(router);
    this._chartData = [];
  }

  public ngOnInit (): void {
    super.ngOnInit();
    if (this._diagramSettingsService.isInitialized) {
      this.syncState();
    } else {
      this._diagramSettingsService.onFinishInitialize.subscribe(() => this.syncState());
    }
  }

  public ngOnDestroy (): void {
    super.ngOnDestroy();
    this.cancelRequests();
  }

  private xAxisTickFormatting (label: Moment): string {
    return label.format('YYYY/MM/DD HH:mm:ss');
  }

  public yAxisTickFormatting (label: string): string {
    return numeral(label).format('0');
  }

  protected getRouteMatcher (): RegExp {
    return new RegExp('^\/diagram', 'i');
  }

  protected onRouteReenter (): void {
    if (this._diagramSettingsService.isInitialized) {
      this.syncState();
    }
  }

  private syncState (): void {
    this._inputData = {
      requestBuilder: buildSpam(() => this._apiService.getRequestBuilder(), this._d).cardData[ 1 ].requestBuilder,
      title: 'test'
    };
    this.collectData();

    /*const data = this._diagramStateService.data;
    if (data !== this._inputData) {
      this._inputData = data;
      this.collectData();
    }*/
  }

  public collectData (): void {
    this._isDoingRequest = true;

    const rb = clone(this._inputData.requestBuilder);
    const field = rb.getEndpoint().metadata.field;
    const dataCount = rb.getEndpoint().metadata.length;
    const sampleCount = this._diagramSettingsService.getSampleCount();
    const sampleDuration = this._diagramSettingsService.getSampleDuration().asMinutes();
    const totalDuration = this._diagramSettingsService.getTotalDuration().asHours();

    const endpoint = createTrendEndpoint(field);
    rb.setEndpoint(endpoint);

    const request = rb.build();
    request.data[ 'dataCount' ] = dataCount;
    request.data[ 'sampleCount' ] = sampleCount;
    request.data[ 'totalHours' ] = totalDuration;
    request.data[ 'sampleDuration' ] = sampleDuration;

    this._requestSubscription = this._apiService.SubmitRequest<TrendResponse>(request).subscribe(value => {
      const uniqueXLabels = new Map<number, ChartSeries>();
      const resultMap = new Map<string, ChartItem>();

      value.forEach(result => {
        result.forEach(data => {
          const m = moment(Converter.stringToDate(data.datetime));
          const item = {
            moment: m,
            name: this.xAxisTickFormatting(m),
            value: toFloat(data.value)
          };
          uniqueXLabels.set(item.moment.unix(), item);

          if (!resultMap.has(data.key)) {
            resultMap.set(data.key, {
              name: data.key,
              series: [ item ]
            });
          } else {
            resultMap.get(data.key).series.push(item);
          }
        });
      });

      this._xAxisTicks = uniqueXLabels
        .valuesToArray()
        .sort((a, b) => a.moment.diff(b.moment))
        .map(v => v.name);
      this._chartData = resultMap.valuesToArray();

      this._isDoingRequest = false;
    });
  }

  public cancelRequests (): void {
    unsubscribeIfDefined(this._requestSubscription);
    this._isDoingRequest = false;
  }
}
