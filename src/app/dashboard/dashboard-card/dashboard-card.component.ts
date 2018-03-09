import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DashboardCardData } from './dashboard-card-data';
import { ApiService } from '../../api/api-service';
import { AdvancedCountResponse } from '../../api/response/advanced-count-response';
import { ApiRequest } from '../../api/request/request';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import { DashboardCardItemData } from '../dashboard-card-item/dashboard-card-item-data';
import { SearchStateService } from '../../state/search-state-service/search-state.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { DashboardStateService } from '../../state/dashboard-state-service/dashboard-state.service';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: [ './dashboard-card.component.scss' ]
})
export class DashboardCardComponent implements OnInit, OnDestroy {
  private _refreshIntervalSubscription: Subscription;
  private _refreshIntervalChangeSubscription: Subscription;

  private _isDoingRequest: boolean;
  get isDoingRequest (): boolean {
    return this._isDoingRequest;
  }

  private _request: ApiRequest;
  private _data: DashboardCardData;
  @Input() set data (value: DashboardCardData) {
    this._data = value;
  }

  get data (): DashboardCardData {
    return this._data;
  }

  get resultData (): Array<DashboardCardItemData> {
    return this._data.requestResult;
  }

  constructor (private apiService: ApiService,
               private dashboardState: DashboardStateService,
               private searchState: SearchStateService,
               private router: Router) {
    this._isDoingRequest = false;
    this._refreshIntervalChangeSubscription =
      this.dashboardState.refreshIntervalObservable.subscribe(this.onRefreshIntervalChange.bind(this));
  }

  ngOnInit () {
    if (isNullOrUndefined(this._data.requestResult)) {
      this._data.requestResult = [];
    }

    const builder = this._data.requestBuilder;
    builder.setCallback(this.processApiResponse.bind(this));
    this._request = builder.build();

    this.createRefreshIntervalSubscription();
    this.getData();
  }

  ngOnDestroy (): void {
    this._refreshIntervalSubscription.unsubscribe();
    this._refreshIntervalChangeSubscription.unsubscribe();
  }

  private getData (): void {
    if (this._isDoingRequest) {
      return;
    }

    this._isDoingRequest = true;
    this.apiService.SubmitRequest(this._request);
  }

  private processApiResponse (data: AdvancedCountResponse): void {
    this._isDoingRequest = false;
    this._data.requestResult = data.items.map(item => new DashboardCardItemData(item.key, item.value, data.total));
  }

  private createRefreshIntervalSubscription () {
    this._refreshIntervalSubscription = Observable.interval(this.dashboardState.refreshInterval).subscribe(this.getData.bind(this));
  }

  private onRefreshIntervalChange (value: number): void {
    this._refreshIntervalSubscription.unsubscribe();
    this.createRefreshIntervalSubscription();
  }

  public onItemClick (data: DashboardCardItemData): void {
    this.searchState.searchResults = undefined;

    this.searchState.fields = this._data.requestBuilder.getFields();
    this.searchState.fields.push(this._data.buildOnItemClickField(data.key));

    this.searchState.startDatetime = this._data.requestBuilder.getStartDatetime();
    this.searchState.endDatetime = this._data.requestBuilder.getEndDatetime();

    this.searchState.doSearch = true;

    this.router.navigate([ 'search' ])
      .then(result => result ? '' : console.log('Failed to navigate'));
  }
}
