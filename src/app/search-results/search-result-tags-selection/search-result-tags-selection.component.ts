import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ApiService } from '../../api/api-service';
import { TagsResponse } from '../../api/response/tags-response';
import { SelectedTags } from './selected-tags';
import { MatButtonToggleChange } from '@angular/material/button-toggle/typings/button-toggle';
import { isNullOrUndefined } from 'util';
import { SearchSettingsService } from '../../settings/search-settings-service/search-settings.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-search-result-tags-selection',
  templateUrl: './search-result-tags-selection.component.html',
  styleUrls: [ './search-result-tags-selection.component.scss' ]
})
export class SearchResultTagsSelectionComponent implements OnInit, OnDestroy {
  private readonly defaultNotSelectedTags = [
    'incomplete'
  ];

  private _selectedTagsChangeSubscription: Subscription;

  public get selectedTags (): SelectedTags {
    return this.searchState.getSelectedTags();
  }

  @Output() selectedTagsChange: EventEmitter<SelectedTags>;

  constructor (private apiService: ApiService,
               private searchState: SearchSettingsService) {
    this.selectedTagsChange = new EventEmitter<SelectedTags>();
  }

  ngOnInit () {
    const onReadyCallback = () => {
      if (this.searchState.getSelectedTags().length === 0) {
        this.apiService.getTags().subscribe(this.buildSelectedTags.bind(this));
      }
      this.selectedTagsChange.emit(this.searchState.getSelectedTags());
    };

    if (!this.searchState.isReady) {
      this.searchState.onReady().subscribe(onReadyCallback);
    } else {
      onReadyCallback();
    }
  }

  ngOnDestroy (): void {
    if (!isNullOrUndefined(this._selectedTagsChangeSubscription)) {
      this._selectedTagsChangeSubscription.unsubscribe();
    }
  }

  public onSelectionChange (event: MatButtonToggleChange, tagIndex: number): void {
    this.selectedTags[ tagIndex ].selected = event.source.checked;
    this.selectedTagsChange.emit(this.searchState.getSelectedTags());
  }

  private buildSelectedTags (tags: TagsResponse): void {
    this.searchState.setSelectedTags(tags.sort().map(tag => {
      return {
        tag: tag,
        selected: this.defaultNotSelectedTags.indexOf(tag) === -1
      };
    }));

    this.selectedTagsChange.emit(this.searchState.getSelectedTags());
  }
}
