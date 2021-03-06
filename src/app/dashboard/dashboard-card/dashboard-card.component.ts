import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { DashboardCardData } from './dashboard-card-data';
import { ApiService } from '../../../api/api-service';
import { AdvancedCountResponse } from '../../../api/response/advanced-count-response';
import { Subscription, Subject, interval } from 'rxjs';
import { DashboardCardItemData } from '../dashboard-card-item/dashboard-card-item-data';
import { Router } from '@angular/router';
import { DashboardSettingsService } from '../../settings/dashboard-settings-service/dashboard-settings.service';
import { isNullOrUndefined } from '../../../utils/misc';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';
import { Moment } from 'moment';
import { createAdvancedEndpoint } from '../../../api/request/endpoints/advanced-count-endpoint';
import { TrendStateService } from '../../trend/trend-state-service/trend-state.service';
import { SearchStateService } from '../../search/search-state-service/search-state.service';
import { RouteChangeListener } from '../../../base-classes/route-change-listener';
import { unsubscribeIfDefined } from '../../../utils/rxjs';
import { LoopingAnimation } from '../../../loading-animations/looping-animation';

@Component({
  selector: 'app-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: [ './dashboard-card.component.scss' ],
})

export class DashboardCardComponent extends RouteChangeListener implements AfterViewInit {
  @ViewChild('loading_animation') _loadingAnimation: LoopingAnimation;

  private _pastHoursChangeSubscription: Subscription;
  private _maxItemCountChangeSubscription: Subscription;
  private _refreshIntervalSubscription: Subscription;
  private _refreshIntervalChangeSubscription: Subscription;

  private readonly _cancellationToken = new Subject<any>();

  private _lastRefreshTime: Moment;

  private _settingsChanged = false;
  private _isDoingRequest: boolean;
  public get isDoingRequest (): boolean {
    return this._isDoingRequest;
  }

  public set isDoingRequest (value: boolean) {
    const loadingAnimationIsDefined = !isNullOrUndefined(this._loadingAnimation);
    const hasItems = this.resultData.length > 0;

    if (loadingAnimationIsDefined && (!value || !hasItems || this._settingsChanged)) {
      this._loadingAnimation.isLooping = value;
    }

    this._settingsChanged = false;
    this._isDoingRequest = value;
  }

  private _data: DashboardCardData;
  @Input()
  public set data (value: DashboardCardData) {
    this._data = value;
    this.getData();
  }

  public get data (): DashboardCardData {
    return this._data;
  }

  public get resultData (): Array<DashboardCardItemData> {
    if (isNullOrUndefined(this._data) || isNullOrUndefined(this._data.requestResult)) {
      return [];
    }

    const length = this._data.requestResult.length;
    const endpoint = this._data.requestBuilder.getEndpoint();

    return this._data.requestResult.slice(0, endpoint.metadata.length > length ? length : endpoint.metadata.length);
  }

  public constructor (private _apiService: ApiService,
                      private _dashboardSettingsService: DashboardSettingsService,
                      private _searchStateService: SearchStateService,
                      private _trendStateService: TrendStateService,
                      router: Router) {
    super(router);
    this.isDoingRequest = false;
  }

  public ngOnInit () {
    super.ngOnInit();
    if (isNullOrUndefined(this._data.requestResult)) {
      this._data.requestResult = [];
    }

    const builder = this._data.requestBuilder;

    const isReadyCallback = () => {
      builder.setStartDatetime(this.createPastDate(this._dashboardSettingsService.getPastHours()));
      this._data.requestBuilder.getEndpoint().metadata.length = this._dashboardSettingsService.getMaxItemCountPerCard();

      this.createSubscriptions();
      this.getData();
    };

    if (!this._dashboardSettingsService.isInitialized) {
      this._dashboardSettingsService.onFinishInitialize.subscribe(() => isReadyCallback());
    } else {
      isReadyCallback();
    }
  }

  public ngAfterViewInit (): void {
    if (this.isDoingRequest) {
      this._loadingAnimation.isLooping = true;
    }
  }

  public ngOnDestroy (): void {
    super.ngOnDestroy();
    this.cancelRequest();
    this.destroySubscriptions();
  }

  protected getRouteMatcher (): RegExp {
    return new RegExp('^\/dashboard', 'i');
  }

  protected onRouteExit (): void {
    this.destroySubscriptions();
  }

  protected onRouteReenter (): void {
    this.createSubscriptions();

    if (this._dashboardSettingsService.isInitialized) {
      if (isNullOrUndefined(this._lastRefreshTime)) {
        this.getData();
      }

      const diff = moment.duration(moment().diff(this._lastRefreshTime)).asSeconds() * 1000;
      if (diff >= this._dashboardSettingsService.getRefreshInterval()) {
        this.getData();
      }
    }
  }

  private createSubscriptions (): void {
    this._pastHoursChangeSubscription =
      this._dashboardSettingsService.pastHoursObservable.subscribe(this.onPastHoursChange.bind(this));
    this._maxItemCountChangeSubscription =
      this._dashboardSettingsService.maxItemCountObservable.subscribe(this.onMaxItemCountChange.bind(this));
    this._refreshIntervalChangeSubscription =
      this._dashboardSettingsService.refreshIntervalObservable.subscribe(this.onRefreshIntervalChange.bind(this));
    this.createRefreshIntervalSubscription();
  }

  private destroySubscriptions (): void {
    unsubscribeIfDefined(
      this._pastHoursChangeSubscription,
      this._maxItemCountChangeSubscription,
      this._refreshIntervalSubscription,
      this._refreshIntervalChangeSubscription);
  }

  private getData (): void {
    if (this.isDoingRequest || !this._dashboardSettingsService.isInitialized) {
      return;
    }

    this._lastRefreshTime = moment();
    const builder = this._data.requestBuilder;
    builder.setEndDatetime(moment().add(1, 'hours').toDate());
    builder.setStartDatetime(this.createPastDate(this._dashboardSettingsService.getPastHours()));
    this.updateMaxFieldCount();

    const request = this._data.requestBuilder.build();

    this.isDoingRequest = true;
    this._apiService.SubmitRequest(request, this._cancellationToken).subscribe(
      this.processApiResponse.bind(this),
      this.processApiError.bind(this));
  }

  private processApiResponse (data: AdvancedCountResponse): void {
    this.isDoingRequest = false;
    this._data.requestResult = data.items.map(item => new DashboardCardItemData(item.key, item.value, data.total));
  }

  private processApiError (error: HttpErrorResponse): void {
    this.cancelRequest();
    this._data.requestResult = [];
  }

  private createRefreshIntervalSubscription () {
    unsubscribeIfDefined(this._refreshIntervalSubscription);
    this._refreshIntervalSubscription =
      interval(this._dashboardSettingsService.getRefreshInterval()).subscribe(() => this.getData());
  }

  public onItemClick (data: DashboardCardItemData): void {
    this._searchStateService.fields = this._data.requestBuilder.getFields().slice();
    this._data
      .buildBaseRequestFields(data.key)
      .forEach(field => this._searchStateService.fields.push(field));

    this._searchStateService.startDatetime = this._data.requestBuilder.getStartDatetime();
    this._searchStateService.endDatetime = this._data.requestBuilder.getEndDatetime();

    this._searchStateService.doSearch = true;

    this.router.navigate([ 'search' ])
      .then(result => result ? '' : console.log('Failed to navigate'));
  }

  private createPastDate (value: number) {
    const date = new Date();
    date.setHours(date.getHours() - value);

    return date;
  }

  private updateMaxFieldCount () {
    const endpoint = this._data.requestBuilder.getEndpoint();

    const field = endpoint.metadata.field;
    const length = this._dashboardSettingsService.getMaxItemCountPerCard();
    const separator = endpoint.metadata.separator;

    this._data.requestBuilder.setEndpoint(createAdvancedEndpoint(field, length, separator));
  }

  private cancelRequest (): void {
    this._cancellationToken.next();
    this.isDoingRequest = false;
  }

  private onPastHoursChange (value: number): void {
    this.cancelRequest();
    this._settingsChanged = true;
    this.getData();
  }

  private onMaxItemCountChange (value: number): void {
    const oldLength = this._data.requestResult.length;
    this.updateMaxFieldCount();

    if (value > oldLength) {
      this.cancelRequest();
      this.getData();
    }
  }

  private onRefreshIntervalChange (value: number): void {
    this.createRefreshIntervalSubscription();
  }

  public goToDiagramPage (): void {
    this._trendStateService.data = {
      title: this._data.title,
      requestBuilder: this._data.requestBuilder
    };

    this.router.navigate([ 'trend' ])
      .then(result => result ? '' : console.log('Failed to navigate'));
  }
}
