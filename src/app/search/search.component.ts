import { Component, OnDestroy, OnInit } from '@angular/core';
import { SearchFieldData } from '../search-field/search-field-data';
import { ApiService } from '../api/api-service';
import { SearchEndpoint } from '../api/request/endpoints/search-endpoint';
import { ActivatedRoute } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { SearchStateService } from '../state/search-state-service/search-state.service';
import { SearchResponse } from '../api/response/search-reponse';
import { ApiRequest } from '../api/request/request';
import { Subscription } from 'rxjs/Subscription';

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

  private _queryParameterSubscription: Subscription;

  constructor (private apiService: ApiService,
               private searchState: SearchStateService,
               private route: ActivatedRoute) {

    // restore state
    if (isNullOrUndefined(this.searchState.fields)) {
      this.searchState.fields = [ new SearchFieldData() ];
    }

    this._fields = this.searchState.fields.map(field => new SearchFieldData(field.name, field.value, field.comparator));

    this.startDateTime = this.searchState.startDatetime;
    this.endDateTime = this.searchState.endDatetime;
  }

  ngOnInit () {
    this._queryParameterSubscription = this.route.queryParams.subscribe(
      parameters => {
        if (parameters[ 'doSearch' ]) {
          this.search();
        }
      }
    );
  }

  ngOnDestroy (): void {
    if (!isNullOrUndefined(this._queryParameterSubscription)) {
      this._queryParameterSubscription.unsubscribe();
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
    return this._fields.some(element => typeof element.value === 'number' ? false : element.value.trim().length === 0);
  }

  public addField (): void {
    if (this.anyFieldsEmpty()) {
      return;
    }

    this._fields.push(new SearchFieldData());
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
