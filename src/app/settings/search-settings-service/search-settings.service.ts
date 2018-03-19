import { Injectable } from '@angular/core';
import { SearchResponse } from '../../api/response/search-reponse';
import { SelectedTags } from '../../search-results/search-result-tags-selection/selected-tags';
import { RequestBuilderField } from '../../api/request/request-builder-field';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class SearchSettingsService {
  // region Fields

  // Search

  private _visibleColumns: Array<string>;
  private _selectedTags: SelectedTags;
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
