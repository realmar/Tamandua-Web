import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ApiRequestData } from '../../api/request/request';
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
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorConstants } from '../../utils/error-constants';
import { ActiveToast, ToastrService } from 'ngx-toastr';
import { ToastrUtils } from '../../utils/toastr-utils';
import * as moment from 'moment';

interface SummaryChild<T> {
  readonly name: string;
  data: T;
}

interface SummaryGroup<T> {
  readonly name: string;
  data: T;
  readonly children: Array<SummaryChild<T>>;
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

  private _totalRequest: ApiRequestData;
  private readonly _summaryRequests: SummaryCollection<ApiRequestData>;

  private _totalResponse: CountResponse;
  private readonly _summaryResponses: SummaryCollection<DashboardCardItemData>;


  public get totalResponse (): CountResponse {
    return this._totalResponse;
  }

  public get formattedTotalResponse (): string {
    if (isNullOrUndefined(this.totalResponse)) {
      return '';
    }

    return this.totalResponse === 0 ? 'No data found.' : this.totalResponse.toString();
  }

  public get summaryResponses (): SummaryCollection<DashboardCardItemData> {
    return this._summaryResponses;
  }

  private readonly _colorRange: Scale;
  private _errorToast: ActiveToast;

  private _hasErrors: boolean;
  public get hasErrors (): boolean {
    return this._hasErrors;
  }

  constructor (private _dashboardState: DashboardSettingsService,
               private _apiService: ApiService,
               private _toastr: ToastrService) {
    this._hasErrors = false;
    this._summaryRequests = [];
    this._summaryResponses = [];
    this._colorRange = chroma.scale([ '#E1F5FE', '#03A9F4' ]);
  }

  ngOnInit () {
    this._onIntervalChangeSubscription =
      this._dashboardState.refreshIntervalObservable.subscribe(this.onRefreshIntervalChange.bind(this));

    this._onPastHoursChangeSubscription =
      this._dashboardState.pastHoursObservable.subscribe(this.onPastHoursChange.bind(this));

    const isReadyCallback = () => {
      this.createIntervalSubscription();
      this.getData();
    };

    if (!this._dashboardState.isInitialized) {
      this._dashboardState.onFinishInitialize.subscribe(isReadyCallback);
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
    this._intervalSubscription = Observable.interval(this._dashboardState.getRefreshInterval()).subscribe(this.getData.bind(this));
  }

  private onPastHoursChange (value: number) {
    this.getData();
  }

  private onRefreshIntervalChange (value: number): void {
    if (!isNullOrUndefined(this._intervalSubscription)) {
      this._intervalSubscription.unsubscribe();
    }

    this.createIntervalSubscription();
  }

  private buildRequests (): void {
    if (!this._dashboardState.isInitialized) {
      return;
    }

    const builder = this._apiService.getRequestBuilder();

    const startDate = moment().subtract(this._dashboardState.getPastHours(), 'hours').toDate();
    const endDate = moment().add(1, 'hours').toDate();

    builder.setStartDatetime(startDate);
    builder.setEndDatetime(endDate);
    builder.setEndpoint(new CountEndpoint());

    this._totalRequest = builder.build();

    /*
     * Rejected
     */

    builder.addField('action', 'reject', new Comparator(ComparatorType.Equals));
    this._summaryRequests[ 0 ] = {
      name: 'Rejected',
      data: builder.build(),
      children: []
    };

    builder.removeAllFields();

    builder.addField('rejectreason', '^Recipient address rejected: Greylisted', new Comparator(ComparatorType.Regex));
    this._summaryRequests[ 0 ].children.push({
      name: 'Greylisted',
      data: builder.build()
    });

    builder.removeAllFields();

    /*
     * Delivered
     */

    builder.addField('deliverystatus', 'sent', new Comparator(ComparatorType.Equals));
    this._summaryRequests[ 1 ] = {
      name: 'Delivered',
      data: builder.build(),
      children: []
    };

    builder.removeAllFields();

    builder.addField('spamscore', 5, new Comparator(ComparatorType.GreaterOrEqual));
    this._summaryRequests[ 1 ].children.push({
      name: 'Spam',
      data: builder.build()
    });

    builder.removeAllFields();

    /*
     * Deferred
     */

    builder.addField('deliverystatus', 'deferred', new Comparator(ComparatorType.Equals));
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
    this._summaryRequests[ 4 ] = {
      name: 'Virus',
      data: builder.build(),
      children: []
    };
  }

  private getData (): void {
    if (this._isDoingRequest || !this._dashboardState.isInitialized) {
      return;
    }

    this.buildRequests();

    this._isDoingRequest = true;
    this._apiService.SubmitRequest(this._totalRequest)
      .subscribe(
        this.processSummaryTotal.bind(this),
        this.processApiError.bind(this));
  }

  private processApiError (error: HttpErrorResponse): void {
    this._isDoingRequest = false;
    this._hasErrors = true;
    this._errorToast = this._toastr.error(ErrorConstants.GenericServerError, 'Error', {
      disableTimeOut: true
    });
  }

  private resetErrorToast (): void {
    this._hasErrors = false;
    ToastrUtils.removeAllWithMessage(this._toastr, ErrorConstants.GenericServerError);
  }

  private processSummaryTotal (result: CountResponse): void {
    this.resetErrorToast();
    this._totalResponse = result;

    for (let i = 0; i < this._summaryRequests.length; ++i) {
      const createItemData = d => new DashboardCardItemData(name, d, this._totalResponse, this._colorRange);

      const name = this._summaryRequests[ i ].name;
      if (isNullOrUndefined(this._summaryResponses[ i ])) {
        this._summaryResponses[ i ] = {
          name: name,
          data: createItemData(0),
          children: []
        };
      }

      const summaryData = this._summaryResponses[ i ];
      const requestChildren = this._summaryRequests[ i ].children;
      this._apiService.SubmitRequest<CountResponse>(this._summaryRequests[ i ].data)
        .subscribe(
          response => this.processSummaryGroup(
            response,
            summaryData,
            requestChildren,
            createItemData),
          this.processApiError.bind(this));
    }
  }

  private processSummaryGroup (
    result: CountResponse,
    summaryData: SummaryGroup<DashboardCardItemData>,
    children: Array<SummaryChild<ApiRequestData>>,
    createDataItem: (number) => DashboardCardItemData): void {

    this.resetErrorToast();
    summaryData.data = createDataItem(result);

    for (let i = 0; i < children.length; ++i) {
      if (isNullOrUndefined(summaryData.children[ i ])) {
        summaryData.children[ i ] = {
          name: summaryData.data.key,
          data: createDataItem(0)
        };
      }

      const summaryChildData = summaryData.children[ i ];
      this._apiService.SubmitRequest<CountResponse>(children[ i ].data)
        .subscribe(
          response => this.processSummaryChild(response, summaryChildData, createDataItem),
          this.processApiError.bind(this)
        );
    }
  }

  private processSummaryChild (
    result: CountResponse,
    data: SummaryChild<DashboardCardItemData>,
    createDataItem: (number) => DashboardCardItemData): void {
    this.resetErrorToast();
    data.data = createDataItem(result);
  }
}
