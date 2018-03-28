import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DashboardCardData } from './dashboard-card-data';
import { ApiService } from '../../api/api-service';
import { AdvancedCountResponse } from '../../api/response/advanced-count-response';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import { DashboardCardItemData } from '../dashboard-card-item/dashboard-card-item-data';
import { SearchSettingsService } from '../../settings/search-settings-service/search-settings.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { DashboardSettingsService } from '../../settings/dashboard-settings-service/dashboard-settings.service';
import { isNullOrUndefined } from 'util';
import { AdvancedCountEndpoint } from '../../api/request/endpoints/advanced-count-endpoint';
import { SearchStateService } from '../../search-state-service/search-state.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ErrorConstants } from '../../utils/error-constants';
import { ToastrUtils } from '../../utils/toastr-utils';
import * as moment from 'moment';

@Component({
  selector: 'app-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: [ './dashboard-card.component.scss' ]
})
export class DashboardCardComponent implements OnInit, OnDestroy {
  private _pastHoursChangeSubscription: Subscription;
  private _maxItemCountChangeSubscription: Subscription;
  private _refreshIntervalSubscription: Subscription;
  private _refreshIntervalChangeSubscription: Subscription;

  private _isDoingRequest: boolean;
  get isDoingRequest (): boolean {
    return this._isDoingRequest;
  }

  private _endpoint: AdvancedCountEndpoint;
  private _data: DashboardCardData;
  @Input() set data (value: DashboardCardData) {
    this._data = value;
  }

  get data (): DashboardCardData {
    return this._data;
  }

  get resultData (): Array<DashboardCardItemData> {
    const length = this._data.requestResult.length;
    return this._data.requestResult.slice(0, this._endpoint.length > length ? length : this._endpoint.length);
  }

  private _requestSubscription: Subscription;

  constructor (private _apiService: ApiService,
               private _dashboardSettingsService: DashboardSettingsService,
               private _searchSettingsService: SearchSettingsService,
               private _searchStateService: SearchStateService,
               private _router: Router,
               private _toastr: ToastrService) {
    this._isDoingRequest = false;

    this._pastHoursChangeSubscription =
      this._dashboardSettingsService.pastHoursObservable.subscribe(this.onPastHoursChange.bind(this));
    this._maxItemCountChangeSubscription =
      this._dashboardSettingsService.maxItemCountObservable.subscribe(this.onMaxItemCountChange.bind(this));
    this._refreshIntervalChangeSubscription =
      this._dashboardSettingsService.refreshIntervalObservable.subscribe(this.onRefreshIntervalChange.bind(this));
  }

  ngOnInit () {
    if (isNullOrUndefined(this._data.requestResult)) {
      this._data.requestResult = [];
    }

    const builder = this._data.requestBuilder;
    this._endpoint = builder.getEndpoint() as AdvancedCountEndpoint;

    const isReadyCallback = () => {
      builder.setStartDatetime(this.createPastDate(this._dashboardSettingsService.getPastHours()));
      this._endpoint.length = this._dashboardSettingsService.getMaxItemCountPerCard();

      this.createRefreshIntervalSubscription();
      this.getData();
    };

    if (!this._dashboardSettingsService.isInitialized) {
      this._dashboardSettingsService.onFinishInitialize.subscribe(isReadyCallback);
    } else {
      isReadyCallback();
    }
  }

  ngOnDestroy (): void {
    this._pastHoursChangeSubscription.unsubscribe();
    this._maxItemCountChangeSubscription.unsubscribe();
    this._refreshIntervalSubscription.unsubscribe();
    this._refreshIntervalChangeSubscription.unsubscribe();
  }

  private getData (): void {
    if (this._isDoingRequest || !this._dashboardSettingsService.isInitialized) {
      return;
    }

    this._data.requestBuilder.setEndDatetime(moment().add(1, 'hours').toDate());
    const request = this._data.requestBuilder.build();

    this._isDoingRequest = true;
    this._requestSubscription = this._apiService.SubmitRequest(request).subscribe(
      this.processApiResponse.bind(this),
      this.processApiError.bind(this));
  }

  private processApiResponse (data: AdvancedCountResponse): void {
    this._isDoingRequest = false;
    this._data.requestResult = data.items.map(item => new DashboardCardItemData(item.key, item.value, data.total));

    ToastrUtils.removeAllWithMessage(this._toastr, ErrorConstants.GenericServerError);
  }

  private processApiError (error: HttpErrorResponse): void {
    this._isDoingRequest = false;
    this._data.requestResult = [];
    this._toastr.error(ErrorConstants.GenericServerError, 'Error', {
      disableTimeOut: true
    });
  }

  private createRefreshIntervalSubscription () {
    this._refreshIntervalSubscription =
      Observable.interval(this._dashboardSettingsService.getRefreshInterval()).subscribe(this.getData.bind(this));
  }

  public onItemClick (data: DashboardCardItemData): void {
    this._searchStateService.fields = this._data.requestBuilder.getFields().slice();
    this._searchStateService.fields.push(this._data.buildOnItemClickField(data.key));

    this._searchStateService.startDatetime = this._data.requestBuilder.getStartDatetime();
    this._searchStateService.endDatetime = this._data.requestBuilder.getEndDatetime();

    this._searchStateService.doSearch = true;

    this._router.navigate([ 'search' ])
      .then(result => result ? '' : console.log('Failed to navigate'));
  }

  private createPastDate (value: number) {
    const date = new Date();
    date.setHours(date.getHours() - value);

    return date;
  }

  private cancelRequest (): void {
    if (!isNullOrUndefined(this._requestSubscription)) {
      this._requestSubscription.unsubscribe();
    }

    this._isDoingRequest = false;
  }

  private onPastHoursChange (value: number): void {
    const builder = this._data.requestBuilder;
    builder.setStartDatetime(this.createPastDate(value));

    this.cancelRequest();
    this.getData();
  }

  private onMaxItemCountChange (value: number): void {
    const oldLength = this._endpoint.length;
    this._endpoint.length = value;

    if (value > oldLength) {
      this.cancelRequest();
      this.getData();
    }
  }

  private onRefreshIntervalChange (value: number): void {
    if (!isNullOrUndefined(this._refreshIntervalSubscription)) {
      this._refreshIntervalSubscription.unsubscribe();
    }

    this.createRefreshIntervalSubscription();
  }
}
