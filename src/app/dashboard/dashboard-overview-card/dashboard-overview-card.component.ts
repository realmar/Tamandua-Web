import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription, interval } from 'rxjs';
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
import { FlattenPipe } from '../../../pipes/flatten.pipe';
import { Scale } from 'chroma-js';
import * as chroma from 'chroma-js';
import * as moment from 'moment';
import * as clone from 'clone';
import { Composite, Item, SummaryItem } from './composite';
import { MatDialog } from '@angular/material';
import { DashboardOverviewEditModalComponent } from './dashboard-overview-edit-modal/dashboard-overview-edit-modal.component';

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

  private _totalResponse: CountResponse;

  private _composites: Array<Composite>;
  private readonly _requestSubscriptions: Array<Subscription>;

  private _data: Array<SummaryItem> = [];
  public get data (): Array<SummaryItem> {
    return this._data;
  }

  public get totalResponse (): CountResponse {
    return this._totalResponse;
  }

  @Input()
  public set onReset (observable: Observable<any>) {
    unsubscribeIfDefined(this._onResetSubscription);
    this._onResetSubscription = observable.subscribe(() => {
      this.buildDefaultRequests();
      this.getData();
    });
  }

  @Input()
  public set onEdit (observable: Observable<any>) {
    unsubscribeIfDefined(this._onEditSubscription);
    this._onEditSubscription = observable.subscribe(() => {
      const dialogRef = this._dialog.open(DashboardOverviewEditModalComponent, {
        /*minWidth: '50%',
        minHeight: '50%',*/
        data: this._composites
      });

      dialogRef
        .afterClosed()
        .subscribe(value => {
          if (isNullOrUndefined(value)) {
            return;
          }

          this._composites = value;
          this._composites.forEach(
            x =>
              this.flattenComposite(x)
                .forEach(y => {
                  this.applyLastHoursToBuilder(y.item.builder);
                  y.item.response = undefined;
                }));
          this.saveComposites();
          this._data.clear();
          this.getData();
        });
    });
  }

  public get formattedTotalResponse (): string {
    if (isNullOrUndefined(this.totalResponse)) {
      return '';
    }

    return this.totalResponse === 0 ? 'No data found.' : this.totalResponse.toString();
  }

  private readonly _colorRange: Scale;
  private readonly _restColorRange: Scale;

  private _hasErrors: boolean;
  public get hasErrors (): boolean {
    return this._hasErrors;
  }

  public constructor (private _dialog: MatDialog,
                      private _dashboardState: DashboardSettingsService,
                      private _apiService: ApiService) {
    this._hasErrors = false;
    this._colorRange = chroma.scale([ '#81D4FA', '#03A9F4' ]);
    this._restColorRange = chroma.scale([ '#E1F5FE', '#B3E5FC' ]);

    this._composites = [];
    this._requestSubscriptions = [];
  }

  public ngOnInit () {
    this._onIntervalChangeSubscription =
      this._dashboardState.refreshIntervalObservable.subscribe(() => this.createIntervalSubscription());

    this._onPastHoursChangeSubscription =
      this._dashboardState.pastHoursObservable.subscribe(() => this.onPastHoursChange());

    const isReadyCallback = () => {
      this.createIntervalSubscription();

      const composites = this._dashboardState.getOverviewCard();
      if (Array.isEmptyNullOrUndefined(composites)) {
        this.buildDefaultRequests();
      } else {
        this._composites = composites;
      }

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

  private flattenComposite (composite: Composite): Array<Composite> {
    const composites = [ composite ];

    const children = FlattenPipe.flatten(composite.composites.map(c => this.flattenComposite(c)));
    composites.push(...children);

    return composites;
  }

  private createIntervalSubscription (): void {
    unsubscribeIfDefined(this._intervalSubscription);
    this._intervalSubscription = interval(this._dashboardState.getRefreshInterval()).subscribe(() => this.getData());
  }

  private onPastHoursChange () {
    this._isDoingRequest = false;

    this._composites.forEach(composite => {
      for (const c of this.flattenComposite(composite)) {
        this.applyLastHoursToBuilder(c.item.builder);
      }
    });

    this.getData();
  }

  private saveComposites (): void {
    this._dashboardState.setOverviewCard(this._composites);
  }

  private applyLastHoursToBuilder (builder: RequestBuilder): void {
    const startDate = moment().subtract(this._dashboardState.getPastHours(), 'hours').toDate();
    const endDate = moment().add(1, 'hours').toDate();

    builder.setStartDatetime(startDate);
    builder.setEndDatetime(endDate);
  }

  private createTotalCountBuilder (): RequestBuilder {
    const builder = this._apiService.getRequestBuilder();

    this.applyLastHoursToBuilder(builder);
    builder.setEndpoint(createCountEndpoint());

    return builder;
  }

  private buildDefaultRequests (): void {
    if (!this._dashboardState.isInitialized) {
      return;
    }

    this._composites.clear();
    const builder = this.createTotalCountBuilder();

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

    this.saveComposites();
  }

  private getData (): void {
    if (this._isDoingRequest || !this._dashboardState.isInitialized) {
      return;
    }

    this._isDoingRequest = true;
    this._apiService.SubmitRequest(this.createTotalCountBuilder().build())
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

    this._totalResponse = result;
    let receivedDataCount = 0;

    let dataCount = 0;
    if (!Array.isEmptyNullOrUndefined(this._composites)) {
      dataCount = this._composites
        .map(x => x.countItemsInHierarchy())
        .reduce((previousValue: number, currentValue) => previousValue + currentValue, 0);
    }

    if (dataCount === 0) {
      this._isDoingRequest = false;
      return;
    }

    const processDataCount = () => {
      receivedDataCount++;
      if (receivedDataCount >= dataCount) {
        this._data.clear();
        const processComposites = (indentLevel: number, total: number, composites: Array<Composite>) => {
          let sum = 0;
          composites.forEach(composite => {
            const response = composite.item.response;
            if (!isNullOrUndefined(response)) {
              sum += response.data.amount;
              this._data.push(response);
            }
            processComposites(indentLevel + 1, response.data.amount, composite.composites);
          });

          if (indentLevel > 0 && sum > 0) {
            const rest: SummaryItem = {
              data: new DashboardCardItemData('Rest', total - sum, total, this._restColorRange),
              indentLevel: indentLevel
            };
            this._data.push(rest);
          }
        };
        processComposites(0, 0, this._composites);

        this._isDoingRequest = false;
      }
    };

    const processComposite = (composite: Composite,
                              totalResponses: number,
                              indentLevel: number = 0) => {

      const localIndent = indentLevel;
      const item = composite.item;

      this._requestSubscriptions.push(
        this._apiService
          .SubmitRequest<CountResponse>(item.builder.build())
          .subscribe(response => {
              item.response = {
                indentLevel: localIndent,
                data: new DashboardCardItemData(item.name, response as number, totalResponses, this._colorRange)
              };

              composite.composites.forEach(
                c => processComposite(c, response as number, indentLevel + 1));

              processDataCount();
            },
            () => processDataCount()));
    };

    this._composites.forEach(composite => processComposite(composite, this._totalResponse as number));
  }
}
