import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ApiService } from '../../api/api-service';
import { TagsResponse } from '../../api/response/tags-response';
import { SelectedTags } from './selected-tags';

@Component({
  selector: 'app-search-result-tags-selection',
  templateUrl: './search-result-tags-selection.component.html',
  styleUrls: [ './search-result-tags-selection.component.scss' ]
})
export class SearchResultTagsSelectionComponent implements OnInit {
  private readonly defaultNotSelectedTags = [
    'incomplete'
  ];

  @Output() selectedTags: EventEmitter<SelectedTags>;

  private _selTags: SelectedTags;
  public get selTags (): SelectedTags {
    return this._selTags;
  }

  constructor (private apiService: ApiService) {
    this.selectedTags = new EventEmitter<SelectedTags>();
    this._selTags = [];
  }

  ngOnInit () {
    this.apiService.getTags().then(this.buildSelectedTags.bind(this));
  }

  private buildSelectedTags (tags: TagsResponse): void {
    this._selTags = tags.sort().map(tag => {
      return {
        tag: tag,
        selected: this.defaultNotSelectedTags.indexOf(tag) === -1
      };
    });
  }
}
