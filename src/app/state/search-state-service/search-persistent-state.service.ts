import { Injectable } from '@angular/core';
import { SearchStateService } from './search-state.service';
import { SelectedTags } from '../../search-results/search-result-tags-selection/selected-tags';
import { PersistentStorageService } from '../../persistence/persistent-storage-service';
import { isNullOrUndefined } from 'util';

@Injectable()
export class SearchPersistentStateService extends SearchStateService {
  constructor (private storage: PersistentStorageService) {
    super();

    this.getData('search_visibleColumns', result => this.setVisibleColumns(result));
    this.getData('search_selectedTags', result => this.setSelectedTags(result));
    this.getData('search_paginatorPageSize', result => this.setPaginatorPageSize(result));
  }

  private getData (key: string, setter: (data: any) => void) {
    this.storage.load(key, function (result, success) {
      if (success && !isNullOrUndefined(result)) {
        setter(result);
      }
    }.bind(this));
  }

  public setVisibleColumns (value: Array<string>): void {
    super.setVisibleColumns(value);
    this.storage.save('search_visibleColumns', value);
  }

  public setSelectedTags (value: SelectedTags): void {
    super.setSelectedTags(value);
    this.storage.save('search_selectedTags', value);
  }

  public setPaginatorPageSize (value: number): void {
    super.setPaginatorPageSize(value);
    this.storage.save('search_paginatorPageSize', value);
  }
}
