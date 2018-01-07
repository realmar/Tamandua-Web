import { Injectable } from '@angular/core';
import { SearchResponse } from '../api/response/search-reponse';
import { SearchFieldData } from '../search-field/search-field-data';
import { SelectedTags } from '../search-results/search-result-tags-selection/selected-tags';

@Injectable()
export class SearchStateService {
  private _searchResults: SearchResponse;
  private _fields: Array<SearchFieldData>;
  private _startDatetime: Date;
  private _endDatetime: Date;
  private _visibleColumns: Array<string>;
  private _selectedTags: SelectedTags;

  get searchResults (): SearchResponse {
    return this._searchResults;
  }

  set searchResults (value: SearchResponse) {
    this._searchResults = value;
  }

  get fields (): Array<SearchFieldData> {
    return this._fields;
  }

  set fields (value: Array<SearchFieldData>) {
    this._fields = value;
  }

  get startDatetime (): Date {
    return this._startDatetime;
  }

  set startDatetime (value: Date) {
    this._startDatetime = value;
  }

  get endDatetime (): Date {
    return this._endDatetime;
  }

  set endDatetime (value: Date) {
    this._endDatetime = value;
  }

  get visibleColumns (): Array<string> {
    return this._visibleColumns;
  }

  set visibleColumns (value: Array<string>) {
    this._visibleColumns = value;
  }

  get selectedTags (): SelectedTags {
    return this._selectedTags;
  }

  set selectedTags (value: SelectedTags) {
    this._selectedTags = value;
  }
}
