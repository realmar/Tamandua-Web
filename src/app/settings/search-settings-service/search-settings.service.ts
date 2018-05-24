import { Injectable } from '@angular/core';
import { Setting } from '../setting';
import { isNullOrUndefined } from '../../../utils/misc';
import { SettingValidationResult } from '../setting-validation-result';
import { greaterThanZero, isDefined } from '../validators';
import { greaterThanZeroFormatter } from '../formatters';
import { SelectedTags } from '../../search/search-results/search-result-tags-selection/selected-tags';
import { BaseSettingsService } from '../BaseSettingsService';

@Injectable()
export class SearchSettingsService extends BaseSettingsService {
  // region Fields

  private _visibleColumns: Setting<Array<string>>;
  private _selectedTags: Setting<SelectedTags>;
  private _pageSizeOptions = [ 5, 10, 25, 100 ];
  private _paginatorPageSize: Setting<number>;
  private _resultCount: Setting<number>;

// endregion

  constructor () {
    super();

    // default values
    this._paginatorPageSize = new Setting<number>(this._pageSizeOptions[ 0 ], greaterThanZero(greaterThanZeroFormatter));
    this._selectedTags = new Setting<SelectedTags>([], this.selectedTagsvalidator.bind(this));
    this._visibleColumns = new Setting<Array<string>>([
      'phdmxin_time',
      'sender',
      'recipient',
      'tags'
    ], isDefined());
    this._resultCount = new Setting<number>(200, greaterThanZero(greaterThanZeroFormatter));
    this.emitOnFinishInitialized();
  }

  // region Validators

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

  // endregions

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

  public getResultCount (): number {
    return this._resultCount.getData();
  }

  public setResultCount (value: number): SettingValidationResult {
    return this._resultCount.setData(value);
  }

// endregion
}
