import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DashboardCardData } from './dashboard-card-data';
import { ApiService } from '../../../api/api-service';
import { AdvancedCountResponse } from '../../../api/response/advanced-count-response';
import { Subscription, interval } from 'rxjs';
import { DashboardCardItemData } from '../dashboard-card-item/dashboard-card-item-data';
import { SearchSettingsService } from '../../settings/search-settings-service/search-settings.service';
import { Router } from '@angular/router';
import { DashboardSettingsService } from '../../settings/dashboard-settings-service/dashboard-settings.service';
import { isNullOrUndefined } from 'util';
import { SearchStateService } from '../../search-state-service/search-state.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ToastrUtils } from '../../../utils/toastr-utils';
import * as moment from 'moment';
import { createAdvancedEndpoint } from '../../../api/request/endpoints/advanced-count-endpoint';

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
  public get isDoingRequest (): boolean {
    return this._isDoingRequest;
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
    const length = this._data.requestResult.length;
    const endpoint = this._data.requestBuilder.getEndpoint();

    return this._data.requestResult.slice(0, endpoint.metadata.length > length ? length : endpoint.metadata.length);
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

    const isReadyCallback = () => {
      builder.setStartDatetime(this.createPastDate(this._dashboardSettingsService.getPastHours()));
      this._data.requestBuilder.getEndpoint().metadata.length = this._dashboardSettingsService.getMaxItemCountPerCard();

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

    ToastrUtils.removeAllGenericServerErrors(this._toastr);
  }

  private processApiError (error: HttpErrorResponse): void {
    this._isDoingRequest = false;
    this._data.requestResult = [];
    ToastrUtils.showGenericServerError(this._toastr);
  }

  private createRefreshIntervalSubscription () {
    this._refreshIntervalSubscription =
      interval(this._dashboardSettingsService.getRefreshInterval()).subscribe(this.getData.bind(this));
  }

  public onItemClick (data: DashboardCardItemData): void {
    this._searchStateService.fields = this._data.requestBuilder.getFields().slice();
    this._data
      .buildBaseRequestFields(data.key)
      .forEach(field => this._searchStateService.fields.push(field));

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
    const endpoint = this._data.requestBuilder.getEndpoint();

    const field = endpoint.metadata.field;
    const length = value;
    const separator = endpoint.metadata.separator;

    this._data.requestBuilder.setEndpoint(createAdvancedEndpoint(field, length, separator));

    const oldLength = this._data.requestResult.length;
    if (length > oldLength) {
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
