import { Injectable } from '@angular/core';
import { SearchSettingsService } from './search-settings.service';
import { PersistentStorageService } from '../../../persistence/persistent-storage-service';
import { SettingValidationResult } from '../setting-validation-result';
import { SelectedTags } from '../../search/search-results/search-result-tags-selection/selected-tags';
import { SettingsUtilsService } from '../settings-utils-service/settings-utils.service';
import { InitializationCounter } from '../settings-utils-service/initialization-counter';
import { isNullOrUndefined } from '../../../utils/misc';

@Injectable()
export class SearchPersistentSettingsService extends SearchSettingsService {
  private _gotAllData = false;
  private readonly _initializationCounter: InitializationCounter;

  constructor (private _storage: PersistentStorageService,
               private _utils: SettingsUtilsService) {
    super();

    this._initializationCounter = new InitializationCounter(3, () => {
      this._gotAllData = true;
      this.emitOnFinishInitialized();
    });
    this._utils.getData<Array<string>>(
      'search_visibleColumns', Array, result => super.setVisibleColumns(result), this._initializationCounter);
    this._utils.getData(
      'search_selectedTags', Object, result => super.setSelectedTags(result as SelectedTags), this._initializationCounter);
    this._utils.getData(
      'search_paginatorPageSize', Number, result => super.setPaginatorPageSize(result as number), this._initializationCounter);
  }

  protected emitOnFinishInitialized (): void {
    if (!isNullOrUndefined(this._gotAllData) && this._gotAllData) {
      super.emitOnFinishInitialized();
    }
  }

  public setVisibleColumns (value: Array<string>): SettingValidationResult {
    if (!this.isInitialized) {
      return new SettingValidationResult(true);
    }

    const result = super.setVisibleColumns(value);
    if (result.isValid) {
      this._storage.save('search_visibleColumns', value);
    }

    return result;
  }

  public setSelectedTags (value: SelectedTags): SettingValidationResult {
    if (!this.isInitialized) {
      return new SettingValidationResult(true);
    }

    const result = super.setSelectedTags(value);
    if (result.isValid) {
      this._storage.save('search_selectedTags', value);
    }

    return result;
  }

  public setPaginatorPageSize (value: number): SettingValidationResult {
    if (!this.isInitialized) {
      return new SettingValidationResult(true);
    }

    const result = super.setPaginatorPageSize(value);
    if (result.isValid) {
      this._storage.save('search_paginatorPageSize', value);
    }

    return result;
  }
}
