import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ApiRequest } from '../../api/request/request';
import { ApiService } from '../../api/api-service';
import { Comparator, ComparatorType } from '../../api/request/comparator';
import { CountResponse } from '../../api/response/count-response';
import { DashboardCardItemData } from '../dashboard-card-item/dashboard-card-item-data';
import { CountEndpoint } from '../../api/request/endpoints/count-endpoint';
import { isNullOrUndefined } from 'util';
import { Observable } from 'rxjs/Observable';
import { Scale } from 'chroma-js';
import * as chroma from 'chroma-js';
import { DashboardSettingsService } from '../../settings/dashboard-settings-service/dashboard-settings.service';

interface SummaryChild<T> {
  name: string;
  data: T;
}

interface SummaryGroup<T> {
  name: string;
  data: T;
  children: Array<SummaryChild<T>>;
}

type SummaryCollection<T> = Array<SummaryGroup<T>>;

@Component({
  selector: 'app-dashboard-overview-card',
  templateUrl: './dashboard-overview-card.component.html',
  styleUrls: [ './dashboard-overview-card.component.scss' ]
})
export class DashboardOverviewCardComponent implements OnInit, OnDestroy {
  private _onPastHoursChangeSubscription: Subscription;
  private _intervalSubscription: Subscription;
  private _onIntervalChangeSubscription: Subscription;

  private _isDoingRequest: boolean;
  public get isDoingRequest (): boolean {
    return this._isDoingRequest;
  }

  private _totalRequest: ApiRequest;
  private _summaryRequests: SummaryCollection<ApiRequest>;

  private _totalResponse: CountResponse;
  private _summaryResponses: SummaryCollection<DashboardCardItemData>;


  public get totalResponse (): CountResponse {
    return this._totalResponse;
  }

  public get summaryResponses (): SummaryCollection<DashboardCardItemData> {
    return this._summaryResponses;
  }

  private _colorRange: Scale;

  constructor (private dashboardState: DashboardSettingsService,
               private apiService: ApiService) {
    this._summaryRequests = [];
    this._summaryResponses = [];
    this._colorRange = chroma.scale([ '#E1F5FE', '#03A9F4' ]);
  }

  ngOnInit () {
    this._onIntervalChangeSubscription =
      this.dashboardState.refreshIntervalObservable.subscribe(this.onRefreshIntervalChange.bind(this));

    this._onPastHoursChangeSubscription =
      this.dashboardState.pastHoursObservable.subscribe(this.onPastHoursChange.bind(this));

    const isReadyCallback = () => {
      this.createIntervalSubscription();
      this.buildRequests();
      this.getData();
    };

    if (!this.dashboardState.isInitialized) {
      this.dashboardState.onFinishInitialize.subscribe(isReadyCallback);
    } else {
      isReadyCallback();
    }
  }

  ngOnDestroy (): void {
    this._intervalSubscription.unsubscribe();
    this._onIntervalChangeSubscription.unsubscribe();
    this._onPastHoursChangeSubscription.unsubscribe();
  }

  private createIntervalSubscription (): void {
    this._intervalSubscription = Observable.interval(this.dashboardState.getRefreshInterval()).subscribe(this.getData.bind(this));
  }

  private onPastHoursChange (value: number) {
    this.buildRequests();
    this.getData();
  }

  private onRefreshIntervalChange (value: number): void {
    if (!isNullOrUndefined(this._intervalSubscription)) {
      this._intervalSubscription.unsubscribe();
    }

    this.createIntervalSubscription();
  }

  private buildRequests (): void {
    if (!this.dashboardState.isInitialized) {
      return;
    }

    const builder = this.apiService.getRequestBuilder();

    const date = new Date();
    date.setHours(date.getHours() - this.dashboardState.getPastHours());
    builder.setStartDatetime(date);
    builder.setEndpoint(new CountEndpoint());

    builder.setCallback(this.processSummaryTotal.bind(this));
    this._totalRequest = builder.build();

    /*
     * Rejected
     */

    builder.addField('action', 'reject', new Comparator(ComparatorType.Equals));
    builder.setCallback(function (result) {
      this.processSummaryGroup(result, 0);
    }.bind(this));
    this._summaryRequests[ 0 ] = {
      name: 'Rejected',
      data: builder.build(),
      children: []
    };

    builder.removeAllFields();

    builder.addField('rejectreason', '^Recipient address rejected: Greylisted', new Comparator(ComparatorType.Regex));
    builder.setCallback(result => {
      this.processSummaryChild(result, 0, 0);
      this._isDoingRequest = false;
    });

    this._summaryRequests[ 0 ].children.push({
      name: 'Greylisted',
      data: builder.build()
    });

    builder.removeAllFields();

    /*
     * Delivered
     */

    builder.addField('deliverystatus', 'sent', new Comparator(ComparatorType.Equals));
    builder.setCallback(function (result) {
      this.processSummaryGroup(result, 1);
    }.bind(this));
    this._summaryRequests[ 1 ] = {
      name: 'Delivered',
      data: builder.build(),
      children: []
    };

    builder.removeAllFields();

    builder.addField('spamscore', 5, new Comparator(ComparatorType.GreaterOrEqual));
    builder.setCallback(function (result) {
      this.processSummaryChild(result, 1, 0);
    }.bind(this));
    this._summaryRequests[ 1 ].children.push({
      name: 'Spam',
      data: builder.build()
    });

    builder.removeAllFields();

    /*
     * Deferred
     */

    builder.addField('deliverystatus', 'deferred', new Comparator(ComparatorType.Equals));
    builder.setCallback(function (result) {
      this.processSummaryGroup(result, 2);
    }.bind(this));
    this._summaryRequests[ 2 ] = {
      name: 'Deferred',
      data: builder.build(),
      children: []
    };

    builder.removeAllFields();

    /*
     * Bounced
     */

    builder.addField('deliverystatus', 'bounced', new Comparator(ComparatorType.Equals));
    builder.setCallback(function (result) {
      this.processSummaryGroup(result, 3);
    }.bind(this));
    this._summaryRequests[ 3 ] = {
      name: 'Bounced',
      data: builder.build(),
      children: []
    };

    builder.removeAllFields();

    /*
     * Virus
     */

    builder.addField('virusresult', '^Blocked INFECTED', new Comparator(ComparatorType.Regex));
    builder.setCallback(function (result) {
      this.processSummaryGroup(result, 4);
    }.bind(this));
    this._summaryRequests[ 4 ] = {
      name: 'Virus',
      data: builder.build(),
      children: []
    };
  }

  private getData (): void {
    if (this._isDoingRequest || !this.dashboardState.isInitialized) {
      return;
    }

    this._isDoingRequest = true;
    this.apiService.SubmitRequest(this._totalRequest);
  }

  private processSummaryTotal (result: CountResponse): void {
    this._totalResponse = result;

    for (const group of this._summaryRequests) {
      this.apiService.SubmitRequest(group.data);
    }
  }

  private processSummaryGroup (result: CountResponse, index: number): void {
    const name = this._summaryRequests[ index ].name;

    if (isNullOrUndefined(this._summaryResponses[ index ])) {
      this._summaryResponses[ index ] = {
        name: name,
        data: undefined,
        children: []
      };
    }

    this._summaryResponses[ index ].data = new DashboardCardItemData(name, result, this._totalResponse, this._colorRange);
    for (const child of this._summaryRequests[ index ].children) {
      this.apiService.SubmitRequest(child.data);
    }
  }

  private processSummaryChild (result: CountResponse, index: number, childIndex: number): void {
    const name = this._summaryRequests[ index ].children[ childIndex ].name;

    if (isNullOrUndefined(this._summaryResponses[ index ].children[ childIndex ])) {
      this._summaryResponses[ index ].children[ childIndex ] = {
        name: name,
        data: undefined
      };
    }

    this._summaryResponses[ index ].children[ childIndex ].data =
      new DashboardCardItemData(
        name,
        result,
        this._totalResponse, this._colorRange);
  }
}
