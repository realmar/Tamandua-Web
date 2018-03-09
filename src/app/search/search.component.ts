import { Component, OnDestroy, OnInit } from '@angular/core';
import { SearchFieldData } from '../search-field/search-field-data';
import { ApiService } from '../api/api-service';
import { SearchEndpoint } from '../api/request/endpoints/search-endpoint';
import { ActivatedRoute, Event, NavigationEnd, Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { SearchStateService } from '../state/search-state-service/search-state.service';
import { SearchResponse } from '../api/response/search-reponse';
import { ApiRequest } from '../api/request/request';
import { Subscription } from 'rxjs/Subscription';
import { Comparator, ComparatorType } from '../api/request/comparator';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: [ './search.component.scss' ]
})
export class SearchComponent implements OnInit, OnDestroy {
  private _startDateTime: Date;
  set startDateTime (value: Date) {
    this._startDateTime = value;
    this.searchState.startDatetime = value;
  }

  get startDateTime (): Date {
    return this._startDateTime;
  }

  private _endDateTime: Date;
  set endDateTime (value: Date) {
    this._endDateTime = value;
    this.searchState.endDatetime = value;
  }

  get endDateTime (): Date {
    return this._endDateTime;
  }

  private _fields: Array<SearchFieldData>;
  get fields (): Array<SearchFieldData> {
    return this._fields;
  }

  private _searchResult: SearchResponse;
  public get searchResult (): SearchResponse {
    return this._searchResult;
  }

  private _isLoading: boolean;
  public get isLoading (): boolean {
    return this._isLoading;
  }

  private _routerEventSubscription: Subscription;

  constructor (private apiService: ApiService,
               private searchState: SearchStateService,
               private router: Router) {
    this.restoreState();
  }

  ngOnInit () {
    this._routerEventSubscription = this.router.events.subscribe(this.onRouterEvents.bind(this));
  }

  ngOnDestroy (): void {
    if (!isNullOrUndefined(this._routerEventSubscription)) {
      this._routerEventSubscription.unsubscribe();
    }
  }

  private restoreState (): void {
    // restore state
    if (isNullOrUndefined(this.searchState.fields)) {
      this._fields = [ new SearchFieldData(undefined, undefined, new Comparator(ComparatorType.Regex)) ];
    } else {
      this._fields = this.searchState.fields.map(field => new SearchFieldData(field.name, field.value, field.comparator));
    }

    this.searchState.fields = this._fields;

    this.startDateTime = this.searchState.startDatetime;
    this.endDateTime = this.searchState.endDatetime;
  }

  private onRouterEvents (event: Event): void {
    if (!(event instanceof NavigationEnd)) {
      return;
    }

    if (this.router.url === '/search' && this.searchState.doSearch) {
      this.searchState.doSearch = false;
      this.search();
    }
  }

  private submitRequest (request: ApiRequest): void {
    this._isLoading = true;
    this.apiService.SubmitRequest(request);
  }

  private processSearchResult (result: SearchResponse): void {
    this._isLoading = false;
    this._searchResult = result;
  }

  public anyFieldsEmpty (): boolean {
    return this._fields.some(element =>
      typeof element.value === 'number' ? false : element.value.trim().length === 0 || element.value.trim() === '^');
  }

  public addField (): void {
    if (this.anyFieldsEmpty()) {
      return;
    }

    this._fields.push(new SearchFieldData(undefined, undefined, new Comparator(ComparatorType.Regex)));
  }

  public isOnlyField (): boolean {
    return this._fields.length < 2;
  }

  public removeField (field: SearchFieldData): void {
    if (this.isOnlyField()) {
      return;
    }

    const index = this._fields.indexOf(field);
    this._fields.splice(index, 1);
  }

  public search (): void {
    // make request

    this.restoreState();

    if (this.anyFieldsEmpty()) {
      return;
    }

    const builder = this.apiService.getRequestBuilder();

    builder.setCallback(this.processSearchResult.bind(this));
    builder.setEndpoint(new SearchEndpoint(0, 1000));
    builder.setStartDatetime(this._startDateTime);
    builder.setEndDatetime(this._endDateTime);

    for (const field of this._fields) {
      builder.addField(field.name, field.value, field.comparator);
    }

    this.submitRequest(builder.build());
  }
}
