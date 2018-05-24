import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { SelectedTags } from './selected-tags';
import { MatButtonToggleChange } from '@angular/material/button-toggle/typings/button-toggle';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../../api/api-service';
import { SearchSettingsService } from '../../../settings/search-settings-service/search-settings.service';
import { TagsResponse } from '../../../../api/response/tags-response';
import { isNullOrUndefined } from '../../../../utils/misc';

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
    return this._searchSettingsService.getSelectedTags();
  }

  @Output() selectedTagsChange: EventEmitter<SelectedTags>;

  public constructor (private _apiService: ApiService,
                      private _searchSettingsService: SearchSettingsService) {
    this.selectedTagsChange = new EventEmitter<SelectedTags>();
  }

  public ngOnInit (): void {
    const onReadyCallback = () => {
      this._apiService.getTags().subscribe(
        data => {
          this.mergeSelectedTags(data);
        }
      );
      this.selectedTagsChange.emit(this._searchSettingsService.getSelectedTags());
    };

    if (!this._searchSettingsService.isInitialized) {
      this._searchSettingsService.onFinishInitialize.subscribe(() => onReadyCallback());
    } else {
      onReadyCallback();
    }
  }

  public ngOnDestroy (): void {
    if (!isNullOrUndefined(this._selectedTagsChangeSubscription)) {
      this._selectedTagsChangeSubscription.unsubscribe();
    }
  }

  public onSelectionChange (event: MatButtonToggleChange, tagIndex: number): void {
    this.selectedTags[ tagIndex ].selected = event.source.checked;
    this.selectedTagsChange.emit(this._searchSettingsService.getSelectedTags());
  }

  private mergeSelectedTags (tags: TagsResponse): void {
    const selectedTags = this._searchSettingsService.getSelectedTags();
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

    this._searchSettingsService.setSelectedTags(selectedTags);
    this.selectedTagsChange.emit(this._searchSettingsService.getSelectedTags());
  }
}
