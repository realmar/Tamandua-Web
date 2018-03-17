import { Injectable, Type } from '@angular/core';
import { SearchStateService } from './search-state.service';
import { SelectedTags } from '../../search-results/search-result-tags-selection/selected-tags';
import { PersistentStorageService } from '../../persistence/persistent-storage-service';
import { isNullOrUndefined } from 'util';
import { DataCache } from '../../api/data-cache';

@Injectable()
export class SearchPersistentStateService extends SearchStateService {
  constructor (private storage: PersistentStorageService) {
    super();

    this.getData(Array, 'search_visibleColumns', result => this.setVisibleColumns(result));
    this.getData(Array, 'search_selectedTags', result => this.setSelectedTags(result));
    this.getData(Array, 'search_paginatorPageSize', result => this.setPaginatorPageSize(result));
  }

  private getData<T> (type: Type<T>, key: string, setter: (data: any) => void) {
    this.storage.load(type, key).subscribe(result => {
      if (!isNullOrUndefined(result)) {
        setter(result);
      }
    });
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
