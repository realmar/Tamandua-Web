import { Component, Input, OnInit } from '@angular/core';
import { DashboardCardData } from './dashboard-card-data';
import { ApiService } from '../../api/api-service';
import { AdvancedCountResponse } from '../../api/response/advanced-count-response';
import { ApiRequest } from '../../api/request/request';
import { AdvancedCountEndpoint } from '../../api/request/endpoints/advanced-count-endpoint';
import { SettingsService } from '../../settings-service/settings.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import { DashboardCardItemData } from './dashboard-card-item/dashboard-card-item-data';
import { SearchStateService } from '../../state/search-state-service/search-state.service';
import { Comparator, ComparatorType } from '../../api/request/comparator';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: [ './dashboard-card.component.scss' ]
})
export class DashboardCardComponent implements OnInit {
  private _interval: Observable<any>;
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

  private _resultData: Array<DashboardCardItemData>;
  get resultData (): Array<DashboardCardItemData> {
    return this._resultData;
  }

  constructor (private apiService: ApiService,
               private settings: SettingsService,
               private searchState: SearchStateService,
               private router: Router) {
    this._interval = Observable.interval(this.settings.dashboard.refreshInterval);
    this._isDoingRequest = false;
    this._resultData = [];
  }

  ngOnInit () {
    const builder = this._data.requestBuilder;
    builder.setCallback(this.processApiResponse.bind(this));
    this._request = builder.build();

    this._interval.subscribe(this.getData.bind(this));
    this.getData();
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
    this._resultData = data.items.map(item => new DashboardCardItemData(item.key, item.value, data.total));
  }

  public onItemClick (data: DashboardCardItemData): void {
    this.searchState.searchResults = undefined;

    this.searchState.fields = this._data.requestBuilder.getFields();
    this.searchState.fields.push(this._data.buildOnItemClickField(data.key));

    this.searchState.startDatetime = this._data.requestBuilder.getStartDatetime();
    this.searchState.endDatetime = this._data.requestBuilder.getEndDatetime();

    this.router.navigate([ 'search' ], { queryParams: { doSearch: true } })
      .then(result => result ? '' : console.log('Failed to navigate'));
  }
}
