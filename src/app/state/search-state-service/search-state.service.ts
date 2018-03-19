import { Injectable } from '@angular/core';
import { SearchResponse } from '../../api/response/search-reponse';
import { SelectedTags } from '../../search-results/search-result-tags-selection/selected-tags';
import { RequestBuilderField } from '../../api/request/request-builder-field';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class SearchStateService {
  // region Fields

  // Search

  private _doSearch: boolean;

  private _searchResults: SearchResponse;
  private _fields: Array<RequestBuilderField>;
  private _startDatetime: Date;
  private _endDatetime: Date;
  private _visibleColumns: Array<string>;
  private _selectedTags: SelectedTags;
  private _resultFilter: Map<string, string>;
  private _resultFilterAsRegex: Map<string, RegExp>;

  private _pageSizeOptions = [ 5, 10, 25, 100 ];
  private _paginatorPageSize: number;

  protected onReadySubject: Subject<any>;

  private _isReady: boolean;
  public get isReady (): boolean {
    return this._isReady;
  }

// endregion

  constructor () {
    // default values

    this._doSearch = false;
    this._paginatorPageSize = this._pageSizeOptions[ 0 ];
    this._selectedTags = [];
    this._visibleColumns = [
      'phdmxin_time',
      'sender',
      'recipient',
      'tags'
    ];

    this.onReadySubject = new Subject<any>();
    this.onReadyCallback();
  }

  protected onReadyCallback (): void {
    this._isReady = true;
    this.onReadySubject.next();
  }

  public onReady (): Observable<any> {
    return this.onReadySubject.asObservable();
  }

// region Getters and Setter

  public get doSearch (): boolean {
    return this._doSearch;
  }

  public set doSearch (value: boolean) {
    this._doSearch = value;
  }

  public get searchResults (): SearchResponse {
    return this._searchResults;
  }

  public set searchResults (value: SearchResponse) {
    this._searchResults = value;
  }

  public get fields (): Array<RequestBuilderField> {
    return this._fields;
  }

  public set fields (value: Array<RequestBuilderField>) {
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

  public getVisibleColumns (): Array<string> {
    return this._visibleColumns;
  }

  public setVisibleColumns (value: Array<string>) {
    this._visibleColumns = value;
  }

  public getSelectedTags (): SelectedTags {
    return this._selectedTags;
  }

  public setSelectedTags (value: SelectedTags) {
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

  public getPageSizeOptions (): Array<number> {
    return this._pageSizeOptions;
  }

  public getPaginatorPageSize (): number {
    return this._paginatorPageSize;
  }

  public setPaginatorPageSize (value: number) {
    this._paginatorPageSize = value;
  }

// endregion
}
