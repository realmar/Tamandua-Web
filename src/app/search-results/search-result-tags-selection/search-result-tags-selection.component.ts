import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ApiService } from '../../../api/api-service';
import { TagsResponse } from '../../../api/response/tags-response';
import { SelectedTags } from './selected-tags';
import { MatButtonToggleChange } from '@angular/material/button-toggle/typings/button-toggle';
import { isNullOrUndefined } from 'util';
import { SearchSettingsService } from '../../settings/search-settings-service/search-settings.service';
import { Subscription } from 'rxjs';
import { ToastrUtils } from '../../../utils/toastr-utils';

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
    return this.searchSettingsService.getSelectedTags();
  }

  @Output() selectedTagsChange: EventEmitter<SelectedTags>;

  constructor (private apiService: ApiService,
               private searchSettingsService: SearchSettingsService) {
    this.selectedTagsChange = new EventEmitter<SelectedTags>();
  }

  ngOnInit () {
    const onReadyCallback = () => {
      this.apiService.getTags().subscribe(
        data => {
          this.mergeSelectedTags(data);
        }
      );
      this.selectedTagsChange.emit(this.searchSettingsService.getSelectedTags());
    };

    if (!this.searchSettingsService.isReady) {
      this.searchSettingsService.onReady().subscribe(onReadyCallback);
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
    this.selectedTagsChange.emit(this.searchSettingsService.getSelectedTags());
  }

  private mergeSelectedTags (tags: TagsResponse): void {
    const selectedTags = this.searchSettingsService.getSelectedTags();
    const toRemove = [];

    // remove obsolete tags
    selectedTags.forEach(tag => {
      if (tags.findIndex(x => tag.tag === x) === -1) {
        toRemove.push(tag);
      }
    });
    toRemove.forEach(tag => selectedTags.splice(selectedTags.findIndex(x => x.tag === tag)));

    tags.forEach(tag => {
      const index = selectedTags.findIndex(x => x.tag === tag);
      if (index === -1) {
        selectedTags.push({
          tag: tag,
          selected: this.defaultNotSelectedTags.indexOf(tag) === -1
        });
      }
    });

    this.searchSettingsService.setSelectedTags(tags.sort().map(tag => {
      return {
        tag: tag,
        selected: this.defaultNotSelectedTags.indexOf(tag) === -1
      };
    }));

    this.selectedTagsChange.emit(this.searchSettingsService.getSelectedTags());
  }
}
