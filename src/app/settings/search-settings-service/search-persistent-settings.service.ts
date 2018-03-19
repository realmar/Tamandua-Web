import { Injectable, Type } from '@angular/core';
import { SearchSettingsService } from './search-settings.service';
import { SelectedTags } from '../../search-results/search-result-tags-selection/selected-tags';
import { PersistentStorageService } from '../../persistence/persistent-storage-service';
import { isNullOrUndefined } from 'util';

@Injectable()
export class SearchPersistentSettingsService extends SearchSettingsService {
  private _restoredDataCount: number;

  constructor (private storage: PersistentStorageService) {
    super();

    this._restoredDataCount = 0;
    this.getData(Array, 'search_visibleColumns', result => this.setVisibleColumns(result), this.visibleColumnsValidator.bind(this));
    this.getData(Object, 'search_selectedTags', result => this.setSelectedTags(result), this.selectedTagsvalidator.bind(this));
    this.getData(Array, 'search_paginatorPageSize', result => this.setPaginatorPageSize(result), this.pageSizeValidator.bind(this));
  }

  protected onReadyCallback (): void {
    // do not emit
  }

  private visibleColumnsValidator (data: Array<string>): boolean {
    return !isNullOrUndefined(data);
  }

  private selectedTagsvalidator (data: SelectedTags): boolean {
    if (isNullOrUndefined(data)) {
      return false;
    }

    for (const item of data) {
      if (!item.tag || isNullOrUndefined(item.selected)) {
        return false;
      }
    }

    return true;
  }

  private pageSizeValidator (data: number): boolean {
    return !isNullOrUndefined(data) && data > 0;
  }

  private getData<T> (type: Type<T>, key: string, setter: (data: any) => void, dataValidator: (data: T) => boolean) {
    this.storage.load(type, key).subscribe(result => {
      if (!isNullOrUndefined(result) && dataValidator(result)) {
        setter(result);
      }

      this._restoredDataCount++;
      if (this._restoredDataCount === 3) {
        super.onReadyCallback();
      }
    });
  }

  public setVisibleColumns (value: Array<string>): void {
    super.setVisibleColumns(value);
    this.storage.save('search_visibleColumns', value);
  }

  public setSelectedTags (value: SelectedTags): void {
    if (!this.selectedTagsvalidator(value)) {
      console.log(value);
    }

    super.setSelectedTags(value);
    this.storage.save('search_selectedTags', value);
  }

  public setPaginatorPageSize (value: number): void {
    super.setPaginatorPageSize(value);
    this.storage.save('search_paginatorPageSize', value);
  }
}
