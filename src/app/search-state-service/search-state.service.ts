import { Injectable } from '@angular/core';
import { SearchResponse } from '../api/response/search-reponse';
import { SearchFieldData } from '../search-field/search-field-data';
import { SelectedTags } from '../search-results/search-result-tags-selection/selected-tags';
import { ApiRequest } from '../api/request/request';

@Injectable()
export class SearchStateService {
  // region Fields

  private _searchResults: SearchResponse;
  private _fields: Array<SearchFieldData>;
  private _startDatetime: Date;
  private _endDatetime: Date;
  private _visibleColumns: Array<string>;
  private _selectedTags: SelectedTags;
  private _resultFilter: Map<string, string>;
  private _resultFilterAsRegex: Map<string, RegExp>;

  private _request: ApiRequest;

  // endregion

  // region Getters and Setter

  public get searchResults (): SearchResponse {
    return this._searchResults;
  }

  public set searchResults (value: SearchResponse) {
    this._searchResults = value;
  }

  public get fields (): Array<SearchFieldData> {
    return this._fields;
  }

  public set fields (value: Array<SearchFieldData>) {
    this._fields = value;
  }

  public get startDatetime (): Date {
    return this._startDatetime;
  }

  public set startDatetime (value: Date) {
    this._startDatetime = value;
  }

  public get endDatetime (): Date {
    return this._endDatetime;
  }

  public set endDatetime (value: Date) {
    this._endDatetime = value;
  }

  public get visibleColumns (): Array<string> {
    return this._visibleColumns;
  }

  public set visibleColumns (value: Array<string>) {
    this._visibleColumns = value;
  }

  public get selectedTags (): SelectedTags {
    return this._selectedTags;
  }

  public set selectedTags (value: SelectedTags) {
    this._selectedTags = value;
  }

  public get resultFilter (): Map<string, string> {
    return this._resultFilter;
  }

  public set resultFilter (value: Map<string, string>) {
    this._resultFilter = value;
  }

  public get resultFilterAsRegex (): Map<string, RegExp> {
    return this._resultFilterAsRegex;
  }

  public set resultFilterAsRegex (value: Map<string, RegExp>) {
    this._resultFilterAsRegex = value;
  }

  /**
   * Return the stored request and public set it to undefined.
   *
   * @returns {ApiRequest}
   */
  public retrieveRequest (): ApiRequest {
    const request = this._request;
    this._request = undefined;

    return request;
  }

  public set request (value: ApiRequest) {
    this._request = value;
  }

// endregion
}
