import { Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { SearchFieldData } from '../search-field/search-field-data';
import { ApiService } from '../api/api-service';
import { SearchEndpoint } from '../api/request/endpoints/search-endpoint';
import { Event, NavigationEnd, Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { SearchSettingsService } from '../settings/search-settings-service/search-settings.service';
import { SearchResponse } from '../api/response/search-reponse';
import { ApiRequestData } from '../api/request/request';
import { Subscription } from 'rxjs/Subscription';
import { Comparator, ComparatorType } from '../api/request/comparator';
import { SearchStateService } from '../search-state-service/search-state.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ToastrUtils } from '../utils/toastr-utils';
import { CachedApiService } from '../api/cached-api-service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: [ './search.component.scss' ]
})
export class SearchComponent implements OnInit, OnDestroy {
  private _startDateTime: Date;
  set startDateTime (value: Date) {
    this._startDateTime = value;
    this._searchStateService.startDatetime = value;
  }

  get startDateTime (): Date {
    return this._startDateTime;
  }

  private _endDateTime: Date;
  set endDateTime (value: Date) {
    this._endDateTime = value;
    this._searchStateService.endDatetime = value;
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

  constructor (private _apiService: ApiService,
               @Optional() private _cachedApiService: CachedApiService,
               private _searchSettingsService: SearchSettingsService,
               private _searchStateService: SearchStateService,
               private _router: Router,
               private _toastr: ToastrService) {
    this.restoreState();
  }

  ngOnInit () {
    this._routerEventSubscription = this._router.events.subscribe(this.onRouterEvents.bind(this));
    this.checkSearchState();
  }

  ngOnDestroy (): void {
    if (!isNullOrUndefined(this._routerEventSubscription)) {
      this._routerEventSubscription.unsubscribe();
    }
  }

  private restoreState (): void {
    // restore state
    if (isNullOrUndefined(this._searchStateService.fields) || this._searchStateService.fields.length === 0) {
      this._fields = [ new SearchFieldData(undefined, undefined, new Comparator(ComparatorType.Regex)) ];
    } else {
      this._fields = this._searchStateService.fields.map(field => new SearchFieldData(field.name, field.value, field.comparator));
    }

    this._searchStateService.fields = this._fields;

    if (!isNullOrUndefined(this._searchStateService.startDatetime)) {
      this.startDateTime = new Date(this._searchStateService.startDatetime.getTime());
    } else {
      this.startDateTime = undefined;
    }

    if (!isNullOrUndefined(this._searchStateService.endDatetime)) {
      this.endDateTime = new Date(this._searchStateService.endDatetime.getTime());
    } else {
      this.endDateTime = undefined;
    }
  }

  private checkSearchState (): void {
    if (this._searchStateService.doSearch) {
      this._searchStateService.doSearch = false;
      this.search();
    }
  }

  private onRouterEvents (event: Event): void {
    if (!(event instanceof NavigationEnd)) {
      return;
    }

    if (this._router.url === '/search') {
      this.checkSearchState();
    }
  }

  private submitRequest (request: ApiRequestData): void {
    this._isLoading = true;
    this._apiService.SubmitRequest(request).subscribe(
      this.processSearchResult.bind(this),
      this.processApiError.bind(this));
  }

  private processSearchResult (result: SearchResponse): void {
    this._isLoading = false;
    this._searchResult = result;
    ToastrUtils.removeAllGenericServerErrors(this._toastr);
  }

  private processApiError (error: HttpErrorResponse): void {
    this._isLoading = false;
    ToastrUtils.showGenericServerError(this._toastr);
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

    const builder = this._apiService.getRequestBuilder();

    builder.setEndpoint(new SearchEndpoint(0, this._searchSettingsService.getResultCount()));
    builder.setStartDatetime(this._startDateTime);
    builder.setEndDatetime(this._endDateTime);

    for (const field of this._fields) {
      builder.addField(field.name, field.value, field.comparator);
    }

    this.submitRequest(builder.build());
  }

  public clearSearchMask (): void {
    this._searchStateService.endDatetime = undefined;
    this._searchStateService.startDatetime = undefined;
    this._searchStateService.fields = undefined;

    this.restoreState();
  }

  public refreshCache (): void {
    if (!isNullOrUndefined(this._cachedApiService)) {
      this._cachedApiService.invalidateAllCaches();
    }

    this._fields.forEach(field => field.emitOnRefreshFields());
  }
}
