import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ApiService } from '../../api/api-service';
import { TagsResponse } from '../../api/response/tags-response';
import { SelectedTags } from './selected-tags';
import { MatButtonToggleChange } from '@angular/material/button-toggle/typings/button-toggle';
import { isNullOrUndefined } from 'util';
import { SearchStateService } from '../../search-state-service/search-state.service';

@Component({
  selector: 'app-search-result-tags-selection',
  templateUrl: './search-result-tags-selection.component.html',
  styleUrls: [ './search-result-tags-selection.component.scss' ]
})
export class SearchResultTagsSelectionComponent implements OnInit {
  private readonly defaultNotSelectedTags = [
    'incomplete'
  ];

  private _selectedTags: SelectedTags;
  public get selectedTags (): SelectedTags {
    return this._selectedTags;
  }

  @Output() selectedTagsChange: EventEmitter<SelectedTags>;

  constructor (private apiService: ApiService,
               private searchState: SearchStateService) {
    this.selectedTagsChange = new EventEmitter<SelectedTags>();
    this._selectedTags = this.searchState.selectedTags;
  }

  ngOnInit () {
    if (isNullOrUndefined(this._selectedTags)) {
      this._selectedTags = [];
      this.apiService.getTags().then(this.buildSelectedTags.bind(this));
    }
    this.selectedTagsChange.emit(this._selectedTags);
  }

  public onSelectionChange (event: MatButtonToggleChange, tagIndex: number): void {
    this.selectedTags[ tagIndex ].selected = event.source.checked;
    this.selectedTagsChange.emit(this._selectedTags);

    this.searchState.selectedTags = this._selectedTags;
  }

  private buildSelectedTags (tags: TagsResponse): void {
    this._selectedTags = tags.sort().map(tag => {
      return {
        tag: tag,
        selected: this.defaultNotSelectedTags.indexOf(tag) === -1
      };
    });
    this.selectedTagsChange.emit(this._selectedTags);
  }
}
