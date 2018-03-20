import { Injectable, Type } from '@angular/core';
import { SearchSettingsService } from './search-settings.service';
import { SelectedTags } from '../../search-results/search-result-tags-selection/selected-tags';
import { PersistentStorageService } from '../../persistence/persistent-storage-service';
import { isNullOrUndefined } from 'util';
import { SettingValidationResult } from '../setting-validation-result';

@Injectable()
export class SearchPersistentSettingsService extends SearchSettingsService {
  private _restoredDataCount: number;

  constructor (private _storage: PersistentStorageService) {
    super();

    this._restoredDataCount = 0;
    this.getData(Array, 'search_visibleColumns', result => this.setVisibleColumns(result));
    this.getData(Object, 'search_selectedTags', result => this.setSelectedTags(result));
    this.getData(Array, 'search_paginatorPageSize', result => this.setPaginatorPageSize(result));
  }

  protected onReadyCallback (): void {
    // do not emit
  }

  private getData<T> (type: Type<T>, key: string, setter: (data: any) => void) {
    this._storage.load(type, key).subscribe(result => {
      if (!isNullOrUndefined(result)) {
        setter(result);
      }

      this._restoredDataCount++;
      if (this._restoredDataCount === 3) {
        super.onReadyCallback();
      }
    });
  }

  public setVisibleColumns (value: Array<string>): SettingValidationResult {
    const result = super.setVisibleColumns(value);
    if (result.isValid) {
      this._storage.save('search_visibleColumns', value);
    }

    return result;
  }

  public setSelectedTags (value: SelectedTags): SettingValidationResult {
    const result = super.setSelectedTags(value);
    if (result.isValid) {
      this._storage.save('search_selectedTags', value);
    }

    return result;
  }

  public setPaginatorPageSize (value: number): SettingValidationResult {
    const result = super.setPaginatorPageSize(value);
    if (result.isValid) {
      this._storage.save('search_paginatorPageSize', value);
    }

    return result;
  }
}
