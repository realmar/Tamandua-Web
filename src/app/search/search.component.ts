import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api/api-service';
import { Router } from '@angular/router';
import { isNullOrUndefined } from '../../utils/misc';
import { SearchSettingsService } from '../settings/search-settings-service/search-settings.service';
import { SearchResponse } from '../../api/response/search-reponse';
import { ApiRequestData } from '../../api/request/request';
import { HttpErrorResponse } from '@angular/common/http';
import { SearchFieldData } from '../../search-mask/search-field/search-field-data';
import { SearchMaskResult } from '../../search-mask/search-mask-result';
import { createSearchEndpoint } from '../../api/request/endpoints/search-endpoint';
import { RouteChangeListener } from '../../base-classes/route-change-listener';
import { SearchStateService } from './search-state-service/search-state.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: [ './search.component.scss' ]
})
export class SearchComponent extends RouteChangeListener implements OnInit {
  private _startDateTime: Date;
  public set startDateTime (value: Date) {
    this._startDateTime = value;
  }

  public get startDateTime (): Date {
    return this._startDateTime;
  }

  private _endDateTime: Date;
  public set endDateTime (value: Date) {
    this._endDateTime = value;
  }

  public get endDateTime (): Date {
    return this._endDateTime;
  }

  private _fields: Array<SearchFieldData>;
  public get fields (): Array<SearchFieldData> {
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

  constructor (private _apiService: ApiService,
               private _searchSettingsService: SearchSettingsService,
               private _searchStateService: SearchStateService,
               router: Router) {
    super(router);
    this.restoreState();
  }

  public ngOnInit (): void {
    super.ngOnInit();
    this.checkSearchState();
  }

  public ngOnDestroy (): void {
    super.ngOnDestroy();
    this.checkSearchState();
  }

  protected getRouteMatcher (): RegExp {
    return new RegExp('^\/search', 'i');
  }

  protected onRouteReenter (): void {
    this.checkSearchState();
  }

  protected onRouteExit (): void {
  }

  private restoreState (): void {
    // restore state
    if (isNullOrUndefined(this._searchStateService.fields) || this._searchStateService.fields.length === 0) {

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
      this.restoreState();
      this.search();
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
  }

  private processApiError (error: HttpErrorResponse): void {
    this._isLoading = false;
  }

  public applySearchMaskResult (data: SearchMaskResult): void {
    this._startDateTime = data.startDateTime;
    this._endDateTime = data.endDateTime;
    this._fields = data.fields;
  }

  public search (): void {
    if (this._fields.length === 0) {
      return;
    }

    const builder = this._apiService.getRequestBuilder();

    builder.setEndpoint(createSearchEndpoint(0, this._searchSettingsService.getResultCount()));
    builder.setStartDatetime(this._startDateTime);
    builder.setEndDatetime(this._endDateTime);

    for (const field of this._fields) {
      builder.addField(field.name, field.value, field.comparator);
    }

    this.submitRequest(builder.build());
  }
}
