import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { ApiRequestData } from '../../../api/request/request';
import { ApiService } from '../../../api/api-service';
import { Comparator, ComparatorType } from '../../../api/request/comparator';
import { CountResponse } from '../../../api/response/count-response';
import { DashboardCardItemData } from '../dashboard-card-item/dashboard-card-item-data';
import { isNullOrUndefined } from '../../../utils/misc';
import { DashboardSettingsService } from '../../settings/dashboard-settings-service/dashboard-settings.service';
import { HttpErrorResponse } from '@angular/common/http';
import { createCountEndpoint } from '../../../api/request/endpoints/count-endpoint';
import { Observable } from 'rxjs/internal/Observable';
import { unsubscribeIfDefined } from '../../../utils/rxjs';
import { RequestBuilder } from '../../../api/request/request-builder';
import { Type } from 'class-transformer';
import { IntermediateExpressionRequestBuilder } from '../../../api/request/intermediate-expression-request-builder';

import { Scale } from 'chroma-js';
import * as chroma from 'chroma-js';
import * as moment from 'moment';
import * as clone from 'clone';

class Item {
  public readonly name: string;
  @Type(() => IntermediateExpressionRequestBuilder)
  public readonly builder: RequestBuilder;

  public constructor (name: string, builder: RequestBuilder) {
    this.name = name;
    this.builder = builder;
  }
}

class Composite {
  @Type(() => Item)
  public readonly item: Item;
  @Type(() => Composite)
  public readonly composites: Array<Composite>;

  public constructor (item: Item, composites?: Array<Composite>) {
    this.item = item;
    this.composites = isNullOrUndefined(composites) ? [] : composites;
  }

  public addComposite (composite: Composite): void {
    this.composites.push(composite);
  }
}

interface SummaryItem {
  readonly indentLevel: number;
  readonly data: DashboardCardItemData;
}

@Component({
  selector: 'app-dashboard-overview-card',
  templateUrl: './dashboard-overview-card.component.html',
  styleUrls: [ './dashboard-overview-card.component.scss' ]
})
export class DashboardOverviewCardComponent implements OnInit, OnDestroy {
  private _onPastHoursChangeSubscription: Subscription;
  private _intervalSubscription: Subscription;
  private _onIntervalChangeSubscription: Subscription;
  private _onResetSubscription: Subscription;
  private _onEditSubscription: Subscription;

  private _isDoingRequest: boolean;
  public get isDoingRequest (): boolean {
    return this._isDoingRequest;
  }

  private _totalRequest: ApiRequestData;
  private _totalResponse: CountResponse;

  private readonly _data: Array<Array<SummaryItem> | SummaryItem>;
  private readonly _composites: Array<Composite>;
  private readonly _requestSubscriptions: Array<Subscription>;

  public get data (): Array<Array<SummaryItem> | SummaryItem> {
    return this._data;
  }

  public get totalResponse (): CountResponse {
    return this._totalResponse;
  }

  @Input()
  public set onReset (observable: Observable<any>) {
    unsubscribeIfDefined(this._onResetSubscription);
    this._onResetSubscription = observable.subscribe(() => this.buildDefaultRequests());
  }

  @Input()
  public set onEdit (observable: Observable<any>) {
    unsubscribeIfDefined(this._onEditSubscription);
    this._onEditSubscription = observable.subscribe(() => {
      console.log('on edit: not implemented');
    });
  }

  public get formattedTotalResponse (): string {
    if (isNullOrUndefined(this.totalResponse)) {
      return '';
    }

    return this.totalResponse === 0 ? 'No data found.' : this.totalResponse.toString();
  }

  private readonly _colorRange: Scale;

  private _hasErrors: boolean;
  public get hasErrors (): boolean {
    return this._hasErrors;
  }

  public constructor (private _dashboardState: DashboardSettingsService,
                      private _apiService: ApiService) {
    this._hasErrors = false;
    this._colorRange = chroma.scale([ '#E1F5FE', '#03A9F4' ]);

    this._data = [];
    this._composites = [];
    this._requestSubscriptions = [];
  }

  public ngOnInit () {
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

  public ngOnDestroy (): void {
    unsubscribeIfDefined(
      this._intervalSubscription,
      this._onIntervalChangeSubscription,
      this._onPastHoursChangeSubscription,
      this._onResetSubscription,
      this._onEditSubscription,
      ...this._requestSubscriptions);
  }

  private createIntervalSubscription (): void {
    this._intervalSubscription = interval(this._dashboardState.getRefreshInterval()).subscribe(this.getData.bind(this));
  }

  private onPastHoursChange (value: number) {
    this._isDoingRequest = false;
    this.getData();
  }

  private onRefreshIntervalChange (value: number): void {
    if (!isNullOrUndefined(this._intervalSubscription)) {
      this._intervalSubscription.unsubscribe();
    }

    this.createIntervalSubscription();
  }

  private buildDefaultRequests (): void {
    if (!this._dashboardState.isInitialized) {
      return;
    }

    this._composites.clear();
    const builder = this._apiService.getRequestBuilder();

    const startDate = moment().subtract(this._dashboardState.getPastHours(), 'hours').toDate();
    const endDate = moment().add(1, 'hours').toDate();

    builder.setStartDatetime(startDate);
    builder.setEndDatetime(endDate);
    builder.setEndpoint(createCountEndpoint());

    this._totalRequest = builder.build();

    /*
     * Rejected
     */

    builder.addField('action', 'reject', new Comparator(ComparatorType.Equals));

    const rejectComposite = new Composite(new Item('Rejected', clone(builder)));

    builder.removeAllFields();
    builder.addField('rejectreason', '^Recipient address rejected: Greylisted', new Comparator(ComparatorType.Regex));

    const rejectChild = new Composite(new Item('Greylisted', clone(builder)));
    rejectComposite.addComposite(rejectChild);
    this._composites.push(rejectComposite);

    builder.removeAllFields();

    /*
     * Delivered
     */

    builder.addField('deliverystatus', 'sent', new Comparator(ComparatorType.Equals));

    const deliveredComposite = new Composite(new Item('Delivered', clone(builder)));

    builder.removeAllFields();
    builder.addField('spamscore', 5, new Comparator(ComparatorType.GreaterOrEqual));

    const deliveredChild = new Composite(new Item('Spam', clone(builder)));
    deliveredComposite.addComposite(deliveredChild);
    this._composites.push(deliveredComposite);

    builder.removeAllFields();

    /*
     * Deferred
     */

    builder.addField('deliverystatus', 'deferred', new Comparator(ComparatorType.Equals));

    const deferredComposite = new Composite(new Item('Deferred', clone(builder)));
    this._composites.push(deferredComposite);

    builder.removeAllFields();

    /*
     * Bounced
     */

    builder.addField('deliverystatus', 'bounced', new Comparator(ComparatorType.Equals));

    const bouncedComposite = new Composite(new Item('Bounced', clone(builder)));
    this._composites.push(bouncedComposite);

    builder.removeAllFields();

    /*
     * Virus
     */

    builder.addField('virusresult', '^Blocked INFECTED', new Comparator(ComparatorType.Regex));

    const virusComposite = new Composite(new Item('Virus', clone(builder)));
    this._composites.push(virusComposite);
  }

  private getData (): void {
    if (this._isDoingRequest || !this._dashboardState.isInitialized) {
      return;
    }

    this.buildDefaultRequests();
    this._isDoingRequest = true;
    this._apiService.SubmitRequest(this._totalRequest)
      .subscribe(
        this.processSummaryTotal.bind(this),
        this.processApiError.bind(this));
  }

  private processApiError (error: HttpErrorResponse): void {
    this._isDoingRequest = false;
    this._hasErrors = true;
  }

  private resetError (): void {
    this._hasErrors = false;
  }

  private processSummaryTotal (result: CountResponse): void {
    this.resetError();

    unsubscribeIfDefined(...this._requestSubscriptions);
    this._requestSubscriptions.clear();
    this._data.clear();

    this._totalResponse = result;

    const processComposite = (composite: Composite,
                              totalResponses: number,
                              dataTarget: Array<SummaryItem | Array<SummaryItem>>,
                              indentLevel: number = 0) => {

      const localIndent = indentLevel;
      const item = composite.item;

      this._requestSubscriptions.push(
        this._apiService
          .SubmitRequest<CountResponse>(item.builder.build())
          .subscribe(response => {
            dataTarget.push({
              indentLevel: localIndent,
              data: new DashboardCardItemData(item.name, response as number, totalResponses, this._colorRange)
            });

            const newTarget = [];
            dataTarget.push(newTarget);

            composite.composites.forEach(
              c => processComposite(c, response as number, newTarget, indentLevel + 1));
          })
      );
    };

    this._composites.forEach(composite => processComposite(composite, this._totalResponse as number, this._data));
  }
}
