import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiService } from '../../api/api-service';
import { TagsResponse } from '../../api/response/tags-response';
import { SelectedTags } from './selected-tags';
import { MatButtonToggleChange } from '@angular/material/button-toggle/typings/button-toggle';

@Component({
  selector: 'app-search-result-tags-selection',
  templateUrl: './search-result-tags-selection.component.html',
  styleUrls: [ './search-result-tags-selection.component.scss' ]
})
export class SearchResultTagsSelectionComponent implements OnInit {
  private readonly defaultNotSelectedTags = [
    'incomplete'
  ];

  @Output() selectedTagsChange: EventEmitter<SelectedTags>;

  private _selTags: SelectedTags;
  public get selTags (): SelectedTags {
    return this._selTags;
  }

  constructor (private apiService: ApiService) {
    this.selectedTagsChange = new EventEmitter<SelectedTags>();
    this._selTags = [];
  }

  ngOnInit () {
    this.apiService.getTags().then(this.buildSelectedTags.bind(this));
  }

  public onSelectionChange (event: MatButtonToggleChange, tagIndex: number): void {
    this.selTags[ tagIndex ].selected = event.source.checked;
    this.selectedTagsChange.emit(this._selTags);
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
