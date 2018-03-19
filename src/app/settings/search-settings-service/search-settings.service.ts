import { Injectable } from '@angular/core';
import { SelectedTags } from '../../search-results/search-result-tags-selection/selected-tags';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Setting } from '../setting';
import { isNullOrUndefined } from 'util';
import { SettingValidationResult } from '../setting-validation-result';

@Injectable()
export class SearchSettingsService {
  // region Fields

  private _visibleColumns: Setting<Array<string>>;
  private _selectedTags: Setting<SelectedTags>;
  private _pageSizeOptions = [ 5, 10, 25, 100 ];
  private _paginatorPageSize: Setting<number>;

  protected onReadySubject: Subject<any>;

  private _isReady: boolean;
  public get isReady (): boolean {
    return this._isReady;
  }

// endregion

  constructor () {
    // default values
    this._paginatorPageSize = new Setting<number>(this._pageSizeOptions[ 0 ], this.pageSizeValidator.bind(this));
    this._selectedTags = new Setting<SelectedTags>([], this.selectedTagsvalidator.bind(this));
    this._visibleColumns = new Setting<Array<string>>([
      'phdmxin_time',
      'sender',
      'recipient',
      'tags'
    ], this.visibleColumnsValidator.bind(this));

    this.onReadySubject = new Subject<any>();
    this.onReadyCallback();
  }

  // region Validators

  private visibleColumnsValidator (data: Array<string>): SettingValidationResult {
    return new SettingValidationResult(!isNullOrUndefined(data));
  }

  private selectedTagsvalidator (data: SelectedTags): SettingValidationResult {
    if (isNullOrUndefined(data)) {
      return new SettingValidationResult(false);
    }

    for (const item of data) {
      if (!item.tag || isNullOrUndefined(item.selected)) {
        return new SettingValidationResult(false);
      }
    }

    return new SettingValidationResult(true);
  }

  private pageSizeValidator (data: number): SettingValidationResult {
    return new SettingValidationResult(!isNullOrUndefined(data) && data > 0);
  }

  // endregions

  protected onReadyCallback (): void {
    this._isReady = true;
    this.onReadySubject.next();
  }

  public onReady (): Observable<any> {
    return this.onReadySubject.asObservable();
  }

// region Getters and Setter

  public getVisibleColumns (): Array<string> {
    return this._visibleColumns.getData();
  }

  public setVisibleColumns (value: Array<string>): SettingValidationResult {
    return this._visibleColumns.setData(value);
  }

  public getSelectedTags (): SelectedTags {
    return this._selectedTags.getData();
  }

  public setSelectedTags (value: SelectedTags): SettingValidationResult {
    return this._selectedTags.setData(value);
  }

  public getPaginatorPageSize (): number {
    return this._paginatorPageSize.getData();
  }

  public setPaginatorPageSize (value: number): SettingValidationResult {
    return this._paginatorPageSize.setData(value);
  }

  public getPageSizeOptions (): Array<number> {
    return this._pageSizeOptions;
  }

// endregion
}
